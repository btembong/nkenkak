const router = require('express').Router()
const { prisma } = require('../config/database')
const { authenticate, isAdmin } = require('../middleware/auth')

router.get('/', async (req, res) => {
  const { category, year } = req.query
  const docs = await prisma.document.findMany({
    where: {
      isPublic: true,
      ...(category && { category }),
      ...(year     && { year: +year }),
    },
    include: { uploader: { select: { firstName: true, lastName: true } } },
    orderBy: [{ sortOrder: 'asc' }, { year: 'desc' }, { createdAt: 'desc' }],
  })
  res.json(docs)
})

router.get('/all', authenticate, isAdmin, async (req, res) => {
  const docs = await prisma.document.findMany({
    include: { uploader: { select: { firstName: true, lastName: true } } },
    orderBy: [{ sortOrder: 'asc' }, { createdAt: 'desc' }],
  })
  res.json(docs)
})

router.post('/', authenticate, isAdmin, async (req, res) => {
  const { title, description, category, file_url, file_type, file_size, year, is_public, sort_order } = req.body
  if (!title || !file_url) return res.status(400).json({ error: 'Title and file URL required' })
  const doc = await prisma.document.create({
    data: {
      title, description, category: category || 'general',
      fileUrl: file_url, fileType: file_type || 'pdf',
      fileSize: file_size ? +file_size : null,
      year: year ? +year : null,
      isPublic: is_public !== false,
      sortOrder: sort_order ? +sort_order : 0,
      uploadedBy: req.user.id,
    },
  })
  res.status(201).json(doc)
})

router.patch('/:id', authenticate, isAdmin, async (req, res) => {
  const { title, description, category, is_public, sort_order } = req.body
  const doc = await prisma.document.update({
    where: { id: req.params.id },
    data: {
      ...(title       !== undefined && { title }),
      ...(description !== undefined && { description }),
      ...(category    !== undefined && { category }),
      ...(is_public   !== undefined && { isPublic: !!is_public }),
      ...(sort_order  !== undefined && { sortOrder: +sort_order }),
    },
  })
  res.json(doc)
})

router.post('/:id/download', async (req, res) => {
  await prisma.document.update({ where: { id: req.params.id }, data: { downloads: { increment: 1 } } })
  res.json({ message: 'ok' })
})

router.delete('/:id', authenticate, isAdmin, async (req, res) => {
  await prisma.document.delete({ where: { id: req.params.id } })
  res.json({ message: 'Deleted' })
})

module.exports = router
