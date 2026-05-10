const router = require('express').Router({ mergeParams: true })
const { prisma } = require('../config/database')
const { authenticate, isLeader } = require('../middleware/auth')

// GET /api/news/:slug/comments
router.get('/', async (req, res) => {
  const news = await prisma.news.findUnique({ where: { slug: req.params.slug }, select: { id: true } })
  if (!news) return res.status(404).json({ error: 'Not found' })
  const comments = await prisma.newsComment.findMany({
    where: { newsId: news.id, isApproved: true },
    orderBy: { createdAt: 'asc' },
    include: { user: { select: { firstName: true, lastName: true, avatarUrl: true } } },
  })
  res.json(comments)
})

// POST /api/news/:slug/comments
router.post('/', async (req, res) => {
  const news = await prisma.news.findUnique({ where: { slug: req.params.slug }, select: { id: true } })
  if (!news) return res.status(404).json({ error: 'Not found' })
  const { name, content, userId } = req.body
  if (!content?.trim()) return res.status(400).json({ error: 'Content required' })
  const comment = await prisma.newsComment.create({
    data: { newsId: news.id, name: name || 'Anonymous', content, userId: userId || null },
    include: { user: { select: { firstName: true, lastName: true, avatarUrl: true } } },
  })
  res.status(201).json(comment)
})

// DELETE /api/news/:slug/comments/:id  (admin/leader only)
router.delete('/:id', authenticate, isLeader, async (req, res) => {
  await prisma.newsComment.delete({ where: { id: req.params.id } })
  res.json({ message: 'Deleted' })
})

module.exports = router
