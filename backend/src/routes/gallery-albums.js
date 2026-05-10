const router = require('express').Router()
const { prisma } = require('../config/database')
const { authenticate, isLeader } = require('../middleware/auth')

// GET /api/gallery-albums
router.get('/', async (req, res) => {
  const albums = await prisma.galleryAlbum.findMany({
    where: { isPublic: true },
    include: {
      _count: { select: { items: true } },
      items: { where: { mediaType: 'image' }, orderBy: { sortOrder: 'asc' }, take: 1, select: { url: true, thumbnail: true } },
    },
    orderBy: [{ sortOrder: 'asc' }, { createdAt: 'desc' }],
  })
  res.json(albums)
})

// GET /api/gallery-albums/:id/items
router.get('/:id/items', async (req, res) => {
  const album = await prisma.galleryAlbum.findUnique({ where: { id: req.params.id } })
  if (!album) return res.status(404).json({ error: 'Not found' })
  const items = await prisma.gallery.findMany({
    where: { albumId: req.params.id },
    orderBy: [{ sortOrder: 'asc' }, { createdAt: 'desc' }],
  })
  res.json({ album, items })
})

// POST /api/gallery-albums
router.post('/', authenticate, isLeader, async (req, res) => {
  const { title, description, coverUrl, isPublic } = req.body
  if (!title) return res.status(400).json({ error: 'Title required' })
  const album = await prisma.galleryAlbum.create({
    data: { title, description, coverUrl, isPublic: isPublic !== false },
  })
  res.status(201).json(album)
})

// PATCH /api/gallery-albums/:id
router.patch('/:id', authenticate, isLeader, async (req, res) => {
  const { title, description, coverUrl, isPublic, sortOrder } = req.body
  const album = await prisma.galleryAlbum.update({
    where: { id: req.params.id },
    data: {
      ...(title       !== undefined && { title }),
      ...(description !== undefined && { description }),
      ...(coverUrl    !== undefined && { coverUrl }),
      ...(isPublic    !== undefined && { isPublic: !!isPublic }),
      ...(sortOrder   !== undefined && { sortOrder: +sortOrder }),
    },
  })
  res.json(album)
})

// DELETE /api/gallery-albums/:id
router.delete('/:id', authenticate, isLeader, async (req, res) => {
  await prisma.galleryAlbum.delete({ where: { id: req.params.id } })
  res.json({ message: 'Deleted' })
})

module.exports = router
