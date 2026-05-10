const router = require('express').Router()
const { prisma } = require('../config/database')
const { authenticate, isAdmin } = require('../middleware/auth')

router.get('/', async (req, res) => {
  const { category, priority, limit } = req.query
  const now = new Date()
  const items = await prisma.notice.findMany({
    where: {
      isPublished: true,
      OR: [{ expiresAt: null }, { expiresAt: { gt: now } }],
      ...(category && { category }),
      ...(priority && { priority }),
    },
    include: { author: { select: { firstName: true, lastName: true } } },
    orderBy: [{ priority: 'desc' }, { createdAt: 'desc' }],
    take: limit ? +limit : 50,
  })
  res.json(items)
})

router.get('/all', authenticate, isAdmin, async (req, res) => {
  const items = await prisma.notice.findMany({
    include: { author: { select: { firstName: true, lastName: true } } },
    orderBy: { createdAt: 'desc' },
  })
  res.json(items)
})

router.post('/', authenticate, isAdmin, async (req, res) => {
  const { title, content, category, priority, expires_at } = req.body
  if (!title || !content) return res.status(400).json({ error: 'Title and content required' })
  const n = await prisma.notice.create({
    data: {
      title, content,
      category: category || 'general',
      priority: priority || 'normal',
      authorId: req.user.id,
      expiresAt: expires_at ? new Date(expires_at) : null,
    },
  })
  res.status(201).json(n)
})

router.patch('/:id', authenticate, isAdmin, async (req, res) => {
  const { title, content, category, priority, is_published, expires_at } = req.body
  const n = await prisma.notice.update({
    where: { id: req.params.id },
    data: {
      ...(title        !== undefined && { title }),
      ...(content      !== undefined && { content }),
      ...(category     !== undefined && { category }),
      ...(priority     !== undefined && { priority }),
      ...(is_published !== undefined && { isPublished: !!is_published }),
      ...(expires_at   !== undefined && { expiresAt: expires_at ? new Date(expires_at) : null }),
    },
  })
  res.json(n)
})

router.delete('/:id', authenticate, isAdmin, async (req, res) => {
  await prisma.notice.delete({ where: { id: req.params.id } })
  res.json({ message: 'Deleted' })
})

module.exports = router
