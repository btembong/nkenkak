const router = require('express').Router()
const { prisma } = require('../config/database')
const { authenticate, isAdmin } = require('../middleware/auth')

// ── Public: list published elections ─────────────────────────
router.get('/', async (req, res) => {
  const { status } = req.query
  const where = { isPublished: true }
  if (status) where.status = status
  const elections = await prisma.election.findMany({
    where,
    include: {
      candidates: {
        include: { _count: { select: { votes: true } } },
        orderBy: { createdAt: 'asc' },
      },
      _count: { select: { votes: true } },
    },
    orderBy: { createdAt: 'desc' },
  })
  res.json(elections)
})

// ── Public: get single election ───────────────────────────────
router.get('/:id', async (req, res) => {
  const election = await prisma.election.findFirst({
    where: { id: req.params.id, isPublished: true },
    include: {
      author: { select: { id: true, firstName: true, lastName: true } },
      candidates: {
        include: {
          user: { select: { id: true, firstName: true, lastName: true, avatarUrl: true } },
          _count: { select: { votes: true } },
        },
        orderBy: { createdAt: 'asc' },
      },
      _count: { select: { votes: true } },
    },
  })
  if (!election) return res.status(404).json({ error: 'Election not found' })
  res.json(election)
})

// ── Authenticated: check if user has voted ────────────────────
router.get('/:id/my-vote', authenticate, async (req, res) => {
  const vote = await prisma.electionVote.findUnique({
    where: { electionId_voterId: { electionId: req.params.id, voterId: req.user.id } },
    include: { candidate: { select: { id: true, name: true } } },
  })
  res.json(vote || null)
})

// ── Authenticated: cast vote ──────────────────────────────────
router.post('/:id/vote', authenticate, async (req, res) => {
  const { candidateId } = req.body
  const election = await prisma.election.findUnique({
    where: { id: req.params.id },
    include: { candidates: { select: { id: true } } },
  })
  if (!election) return res.status(404).json({ error: 'Election not found' })
  if (election.status !== 'voting') return res.status(400).json({ error: 'Voting is not open for this election' })
  if (election.endDate && new Date() > new Date(election.endDate)) return res.status(400).json({ error: 'Voting has ended' })

  // Eligibility check
  const user = req.user
  if (election.eligibility === 'verified' && !user.emailVerified) {
    return res.status(403).json({ error: 'You must verify your email before voting' })
  }
  if (election.eligibility === 'approved' && user.status !== 'active') {
    return res.status(403).json({ error: 'Only approved community members can vote in this election' })
  }

  // Check candidate belongs to election
  const validCandidate = election.candidates.some(c => c.id === candidateId)
  if (!validCandidate) return res.status(400).json({ error: 'Invalid candidate' })

  // Check not already voted
  const existing = await prisma.electionVote.findUnique({
    where: { electionId_voterId: { electionId: req.params.id, voterId: user.id } },
  })
  if (existing) return res.status(409).json({ error: 'You have already voted in this election' })

  const vote = await prisma.electionVote.create({
    data: { electionId: req.params.id, candidateId, voterId: user.id },
    include: { candidate: { select: { id: true, name: true } } },
  })
  res.status(201).json(vote)
})

// ── Admin: get all elections (including drafts) ───────────────
router.get('/admin/all', authenticate, isAdmin, async (req, res) => {
  const elections = await prisma.election.findMany({
    include: {
      _count: { select: { votes: true, candidates: true } },
    },
    orderBy: { createdAt: 'desc' },
  })
  res.json(elections)
})

// ── Admin: create election ────────────────────────────────────
router.post('/', authenticate, isAdmin, async (req, res) => {
  const { title, description, type, status, eligibility, maxWinners, startDate, endDate, coverImage, isPublished } = req.body
  if (!title) return res.status(400).json({ error: 'Title required' })
  const election = await prisma.election.create({
    data: {
      title, description, type: type || 'leadership',
      status: status || 'draft',
      eligibility: eligibility || 'all',
      maxWinners: maxWinners ? parseInt(maxWinners) : 1,
      startDate: startDate ? new Date(startDate) : null,
      endDate: endDate ? new Date(endDate) : null,
      coverImage, isPublished: isPublished !== false,
      authorId: req.user.id,
    },
  })
  res.status(201).json(election)
})

// ── Admin: update election ────────────────────────────────────
router.patch('/:id', authenticate, isAdmin, async (req, res) => {
  const { title, description, type, status, eligibility, maxWinners, startDate, endDate, coverImage, isPublished } = req.body
  const election = await prisma.election.update({
    where: { id: req.params.id },
    data: {
      ...(title        !== undefined && { title }),
      ...(description  !== undefined && { description }),
      ...(type         !== undefined && { type }),
      ...(status       !== undefined && { status }),
      ...(eligibility  !== undefined && { eligibility }),
      ...(maxWinners   !== undefined && { maxWinners: parseInt(maxWinners) }),
      ...(startDate    !== undefined && { startDate: startDate ? new Date(startDate) : null }),
      ...(endDate      !== undefined && { endDate:   endDate   ? new Date(endDate)   : null }),
      ...(coverImage   !== undefined && { coverImage }),
      ...(isPublished  !== undefined && { isPublished }),
    },
  })
  res.json(election)
})

// ── Admin: delete election ────────────────────────────────────
router.delete('/:id', authenticate, isAdmin, async (req, res) => {
  await prisma.election.delete({ where: { id: req.params.id } })
  res.json({ message: 'Deleted' })
})

// ── Admin: list candidates ────────────────────────────────────
router.get('/:id/candidates', authenticate, isAdmin, async (req, res) => {
  const candidates = await prisma.candidate.findMany({
    where: { electionId: req.params.id },
    include: { user: { select: { id: true, firstName: true, lastName: true, avatarUrl: true } } },
    orderBy: { createdAt: 'asc' },
  })
  res.json(candidates)
})

// ── Admin: add candidate ──────────────────────────────────────
router.post('/:id/candidates', authenticate, isAdmin, async (req, res) => {
  const { name, bio, manifesto, imageUrl, userId } = req.body
  if (!name) return res.status(400).json({ error: 'Candidate name required' })
  const candidate = await prisma.candidate.create({
    data: { electionId: req.params.id, name, bio, manifesto, imageUrl, userId: userId || null },
    include: { user: { select: { id: true, firstName: true, lastName: true, avatarUrl: true } } },
  })
  res.status(201).json(candidate)
})

// ── Admin: update candidate ───────────────────────────────────
router.patch('/:electionId/candidates/:candidateId', authenticate, isAdmin, async (req, res) => {
  const { name, bio, manifesto, imageUrl, userId } = req.body
  const candidate = await prisma.candidate.update({
    where: { id: req.params.candidateId },
    data: {
      ...(name      !== undefined && { name }),
      ...(bio       !== undefined && { bio }),
      ...(manifesto !== undefined && { manifesto }),
      ...(imageUrl  !== undefined && { imageUrl }),
      ...(userId    !== undefined && { userId: userId || null }),
    },
    include: { user: { select: { id: true, firstName: true, lastName: true, avatarUrl: true } } },
  })
  res.json(candidate)
})

// ── Admin: remove candidate ───────────────────────────────────
router.delete('/:electionId/candidates/:candidateId', authenticate, isAdmin, async (req, res) => {
  await prisma.candidate.delete({ where: { id: req.params.candidateId } })
  res.json({ message: 'Candidate removed' })
})

// ── Admin: get election results (all votes) ───────────────────
router.get('/:id/results', authenticate, isAdmin, async (req, res) => {
  const candidates = await prisma.candidate.findMany({
    where: { electionId: req.params.id },
    include: {
      _count: { select: { votes: true } },
      votes: { include: { voter: { select: { id: true, firstName: true, lastName: true } } } },
    },
    orderBy: { votes: { _count: 'desc' } },
  })
  res.json(candidates)
})

module.exports = router
