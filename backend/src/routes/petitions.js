const router = require('express').Router()
const { prisma } = require('../config/database')
const { authenticate, isLeader, isAdmin } = require('../middleware/auth')

// GET /api/petitions
router.get('/', async (req, res) => {
  const { category, closed } = req.query
  const petitions = await prisma.petition.findMany({
    where: {
      isPublished: true,
      ...(category && { category }),
      ...(closed !== undefined && { isClosed: closed === 'true' }),
    },
    include: {
      author: { select: { firstName: true, lastName: true } },
      _count: { select: { signatures: true } },
    },
    orderBy: { createdAt: 'desc' },
  })
  res.json(petitions)
})

// GET /api/petitions/:id
router.get('/:id', async (req, res) => {
  const petition = await prisma.petition.findUnique({
    where: { id: req.params.id },
    include: {
      author: { select: { firstName: true, lastName: true } },
      _count: { select: { signatures: true } },
      signatures: {
        where: { isAnon: false },
        select: { name: true, comment: true, createdAt: true },
        orderBy: { createdAt: 'desc' },
        take: 20,
      },
    },
  })
  if (!petition) return res.status(404).json({ error: 'Not found' })
  res.json(petition)
})

// POST /api/petitions — leader/admin
router.post('/', authenticate, isLeader, async (req, res) => {
  const { title, description, goal, category, imageUrl, expiresAt } = req.body
  if (!title || !description) return res.status(400).json({ error: 'title and description required' })
  const petition = await prisma.petition.create({
    data: { title, description, goal: +goal || 100, category: category || 'community', imageUrl, authorId: req.user.id, expiresAt: expiresAt ? new Date(expiresAt) : null },
  })
  res.status(201).json(petition)
})

// PATCH /api/petitions/:id
router.patch('/:id', authenticate, isLeader, async (req, res) => {
  const { title, description, goal, category, imageUrl, isPublished, isClosed, expiresAt } = req.body
  const petition = await prisma.petition.update({
    where: { id: req.params.id },
    data: {
      ...(title       !== undefined && { title }),
      ...(description !== undefined && { description }),
      ...(goal        !== undefined && { goal: +goal }),
      ...(category    !== undefined && { category }),
      ...(imageUrl    !== undefined && { imageUrl }),
      ...(isPublished !== undefined && { isPublished: !!isPublished }),
      ...(isClosed    !== undefined && { isClosed: !!isClosed }),
      ...(expiresAt   !== undefined && { expiresAt: expiresAt ? new Date(expiresAt) : null }),
    },
  })
  res.json(petition)
})

// DELETE /api/petitions/:id
router.delete('/:id', authenticate, isAdmin, async (req, res) => {
  await prisma.petition.delete({ where: { id: req.params.id } })
  res.json({ message: 'Deleted' })
})

// POST /api/petitions/:id/sign
router.post('/:id/sign', async (req, res) => {
  const { name, email, comment, isAnon, userId } = req.body
  if (!name || !email) return res.status(400).json({ error: 'name and email required' })
  const petition = await prisma.petition.findUnique({ where: { id: req.params.id } })
  if (!petition || !petition.isPublished || petition.isClosed)
    return res.status(400).json({ error: 'Petition not accepting signatures' })
  const existing = await prisma.petitionSignature.findUnique({
    where: { petitionId_email: { petitionId: req.params.id, email } },
  })
  if (existing) return res.status(400).json({ error: 'You have already signed this petition' })
  const sig = await prisma.petitionSignature.create({
    data: { petitionId: req.params.id, name, email, comment, isAnon: !!isAnon, userId: userId || null },
  })
  res.status(201).json(sig)
})

module.exports = router
