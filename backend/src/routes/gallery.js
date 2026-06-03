const router = require('express').Router()
const { prisma } = require('../config/database')
const { authenticate, isAdmin, isLeader, isMember } = require('../middleware/auth')

/* ── GET all approved items (public) ── */
router.get('/', async (req, res) => {
  const { tag, type, all, project_id } = req.query
  const items = await prisma.gallery.findMany({
    where: {
      // admin ?all=1 skips visibility + status filters
      ...(all !== '1' && {
        status: 'approved',
        ...((!tag && !project_id) && { showInGallery: { not: false } }),
      }),
      ...(tag        && { tags:      { has: tag  } }),
      ...(type       && { mediaType: type }),
      ...(project_id && { projectId: project_id }),
    },
    orderBy: [{ isFeatured: 'desc' }, { sortOrder: 'asc' }, { createdAt: 'desc' }],
    take: 200,
  })
  res.json(items)
})

/* ── GET my own submissions (any member) ── */
router.get('/my', authenticate, isMember, async (req, res) => {
  const items = await prisma.gallery.findMany({
    where: { uploadedBy: req.user.id },
    orderBy: { createdAt: 'desc' },
    take: 50,
  })
  res.json(items)
})

/* ── GET pending submissions (admin only) ── */
router.get('/pending', authenticate, isAdmin, async (req, res) => {
  const items = await prisma.gallery.findMany({
    where: { status: 'pending' },
    include: {
      uploader: { select: { id: true, firstName: true, lastName: true, avatarUrl: true } },
      project:  { select: { id: true, title: true, slug: true } },
    },
    orderBy: { createdAt: 'desc' },
  })
  res.json(items)
})

/* ── POST contribute (any authenticated member) ── */
router.post('/contribute', authenticate, isMember, async (req, res) => {
  const { url, thumbnail, media_type, title, description, project_id } = req.body
  if (!url) return res.status(400).json({ error: 'URL required' })
  const item = await prisma.gallery.create({
    data: {
      url,
      thumbnail:    thumbnail    || null,
      mediaType:    media_type   || 'image',
      title:        title        || null,
      description:  description  || null,
      projectId:    project_id   || null,
      uploadedBy:   req.user.id,
      status:       'pending',
      showInGallery: false,
      tags:         [],
    },
  })
  res.status(201).json(item)
})

/* ── POST admin add (leaders / admins) ── */
router.post('/', authenticate, isLeader, async (req, res) => {
  const { title, description, url, thumbnail, media_type, project_id, is_featured, tags, show_in_gallery } = req.body
  if (!url) return res.status(400).json({ error: 'URL required' })
  const tagsArr = Array.isArray(tags) ? tags
    : (typeof tags === 'string' ? tags.split(',').map(t => t.trim()).filter(Boolean) : [])
  const item = await prisma.gallery.create({
    data: {
      title, description, url, thumbnail,
      mediaType:    media_type   || 'image',
      projectId:    project_id   || null,
      isFeatured:   !!is_featured,
      showInGallery: show_in_gallery !== false && show_in_gallery !== 'false',
      tags:         tagsArr,
      uploadedBy:   req.user.id,
      status:       'approved',
    },
  })
  res.status(201).json(item)
})

/* ── PATCH review — approve or reject (admin) ── */
router.patch('/:id/review', authenticate, isAdmin, async (req, res) => {
  const { action } = req.body  // 'approve' | 'reject'
  if (!['approve', 'reject'].includes(action)) {
    return res.status(400).json({ error: 'action must be approve or reject' })
  }
  const item = await prisma.gallery.update({
    where: { id: req.params.id },
    data: {
      status:        action === 'approve' ? 'approved' : 'rejected',
      showInGallery: action === 'approve',
    },
  })
  res.json(item)
})

/* ── PATCH edit (leaders / admins) ── */
router.patch('/:id', authenticate, isLeader, async (req, res) => {
  const { title, description, is_featured, sort_order, tags, show_in_gallery, status } = req.body
  const tagsArr = Array.isArray(tags) ? tags
    : (typeof tags === 'string' ? tags.split(',').map(t => t.trim()).filter(Boolean) : undefined)
  const item = await prisma.gallery.update({
    where: { id: req.params.id },
    data: {
      ...(title           !== undefined && { title }),
      ...(description     !== undefined && { description }),
      ...(is_featured     !== undefined && { isFeatured: !!is_featured }),
      ...(sort_order      !== undefined && { sortOrder: +sort_order }),
      ...(tagsArr         !== undefined && { tags: tagsArr }),
      ...(show_in_gallery !== undefined && { showInGallery: show_in_gallery !== false && show_in_gallery !== 'false' }),
      ...(status          !== undefined && { status }),
    },
  })
  res.json(item)
})

/* ── DELETE (leaders / admins) ── */
router.delete('/:id', authenticate, isLeader, async (req, res) => {
  await prisma.gallery.delete({ where: { id: req.params.id } })
  res.json({ message: 'Deleted' })
})

module.exports = router
