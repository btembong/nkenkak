const router = require('express').Router()
const { prisma } = require('../config/database')
const { authenticate, isLeader } = require('../middleware/auth')

router.get('/', async (req, res) => {
  const polls = await prisma.poll.findMany({
    include: { _count: { select: { votes: true } } },
    orderBy: { createdAt: 'desc' },
  })
  res.json(polls.map(p => ({ ...p, vote_count: p._count.votes })))
})

router.post('/', authenticate, isLeader, async (req, res) => {
  const { project_id, title, description, closes_at } = req.body
  if (!title) return res.status(400).json({ error: 'Title required' })
  const poll = await prisma.poll.create({
    data: { title, description, projectId: project_id || null,
            closesAt: closes_at ? new Date(closes_at) : null, createdBy: req.user.id },
  })
  res.status(201).json(poll)
})

router.patch('/:id', authenticate, isLeader, async (req, res) => {
  const { is_active } = req.body
  const poll = await prisma.poll.update({
    where: { id: req.params.id },
    data: { ...(is_active !== undefined && { isActive: !!is_active }) },
  })
  res.json(poll)
})

router.post('/:id/vote', authenticate, async (req, res) => {
  const { vote, comment } = req.body
  if (!['approve','reject','abstain'].includes(vote)) return res.status(400).json({ error: 'Invalid vote' })
  try {
    const v = await prisma.vote.create({
      data: { pollId: req.params.id, userId: req.user.id, vote, comment },
    })
    res.status(201).json(v)
  } catch {
    res.status(409).json({ error: 'Already voted' })
  }
})

router.get('/:id/results', async (req, res) => {
  const votes = await prisma.vote.groupBy({
    by: ['vote'],
    where: { pollId: req.params.id },
    _count: { vote: true },
  })
  res.json(votes.map(v => ({ vote: v.vote, count: v._count.vote })))
})

module.exports = router
