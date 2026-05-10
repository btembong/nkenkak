const router = require('express').Router()
const { prisma } = require('../config/database')
const { authenticate, isLeader } = require('../middleware/auth')

router.get('/', async (req, res) => {
  const { tag, type, all } = req.query
  const items = await prisma.gallery.findMany({
    where: {
      // admin passing ?all=1 gets everything; public gets only showInGallery:true (NULL treated as true for legacy rows)
      ...(all !== '1' && !tag && { showInGallery: { not: false } }),
      ...(tag  && { tags:      { has: tag  } }),
      ...(type && { mediaType: type }),
    },
    orderBy: [{ isFeatured: 'desc' }, { sortOrder: 'asc' }, { createdAt: 'desc' }],
    take: 200,
  })
  res.json(items)
})

router.post('/', authenticate, isLeader, async (req, res) => {
  const { title, description, url, thumbnail, media_type, project_id, is_featured, tags, show_in_gallery } = req.body
  if (!url) return res.status(400).json({ error: 'URL required' })
  const tagsArr = Array.isArray(tags) ? tags : (typeof tags === 'string' ? tags.split(',').map(t => t.trim()).filter(Boolean) : [])
  const item = await prisma.gallery.create({
    data: { title, description, url, thumbnail, mediaType: media_type || 'image',
            projectId: project_id || null, isFeatured: !!is_featured,
            showInGallery: show_in_gallery !== false && show_in_gallery !== 'false',
            tags: tagsArr, uploadedBy: req.user.id },
  })
  res.status(201).json(item)
})

router.patch('/:id', authenticate, isLeader, async (req, res) => {
  const { title, description, is_featured, sort_order, tags, show_in_gallery } = req.body
  const tagsArr = Array.isArray(tags) ? tags : (typeof tags === 'string' ? tags.split(',').map(t => t.trim()).filter(Boolean) : undefined)
  const item = await prisma.gallery.update({
    where: { id: req.params.id },
    data: {
      ...(title            !== undefined && { title }),
      ...(description      !== undefined && { description }),
      ...(is_featured      !== undefined && { isFeatured: !!is_featured }),
      ...(sort_order       !== undefined && { sortOrder: +sort_order }),
      ...(tagsArr          !== undefined && { tags: tagsArr }),
      ...(show_in_gallery  !== undefined && { showInGallery: show_in_gallery !== false && show_in_gallery !== 'false' }),
    },
  })
  res.json(item)
})

router.delete('/:id', authenticate, isLeader, async (req, res) => {
  await prisma.gallery.delete({ where: { id: req.params.id } })
  res.json({ message: 'Deleted' })
})

module.exports = router
