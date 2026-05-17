const router = require('express').Router()
const { prisma } = require('../config/database')
const { authenticate, isLeader, isAdmin } = require('../middleware/auth')
const { sendScholarshipApplicationReceived, sendScholarshipDecision } = require('../services/email')

// GET /api/scholarship-programs  — public list
router.get('/', async (req, res) => {
  const programs = await prisma.scholarshipProgram.findMany({
    where: { isPublished: true },
    include: { _count: { select: { applications: true } } },
    orderBy: { createdAt: 'desc' },
  })
  res.json(programs)
})

// GET /api/scholarship-programs/:id
router.get('/:id', async (req, res) => {
  const p = await prisma.scholarshipProgram.findUnique({
    where: { id: req.params.id },
    include: { _count: { select: { applications: true } } },
  })
  if (!p) return res.status(404).json({ error: 'Not found' })
  res.json(p)
})

// POST /api/scholarship-programs  — admin
router.post('/', authenticate, isLeader, async (req, res) => {
  const { title, description, eligibility, benefits, deadline, academicYear, level, slots, isOpen } = req.body
  if (!title || !description || !academicYear) return res.status(400).json({ error: 'title, description, academicYear required' })
  const p = await prisma.scholarshipProgram.create({
    data: { title, description, eligibility, benefits,
            deadline: deadline ? new Date(deadline) : null,
            academicYear, level: level || 'university',
            slots: +slots || 1, isOpen: isOpen !== false },
  })
  res.status(201).json(p)
})

// PATCH /api/scholarship-programs/:id
router.patch('/:id', authenticate, isLeader, async (req, res) => {
  const { title, description, eligibility, benefits, deadline, academicYear, level, slots, isOpen, isPublished } = req.body
  const p = await prisma.scholarshipProgram.update({
    where: { id: req.params.id },
    data: {
      ...(title        !== undefined && { title }),
      ...(description  !== undefined && { description }),
      ...(eligibility  !== undefined && { eligibility }),
      ...(benefits     !== undefined && { benefits }),
      ...(deadline     !== undefined && { deadline: deadline ? new Date(deadline) : null }),
      ...(academicYear !== undefined && { academicYear }),
      ...(level        !== undefined && { level }),
      ...(slots        !== undefined && { slots: +slots }),
      ...(isOpen       !== undefined && { isOpen: !!isOpen }),
      ...(isPublished  !== undefined && { isPublished: !!isPublished }),
    },
  })
  res.json(p)
})

// DELETE /api/scholarship-programs/:id
router.delete('/:id', authenticate, isAdmin, async (req, res) => {
  await prisma.scholarshipProgram.delete({ where: { id: req.params.id } })
  res.json({ message: 'Deleted' })
})

// ── Applications ──────────────────────────────────────────────

// GET /api/scholarship-programs/:id/applications  (admin)
router.get('/:id/applications', authenticate, isLeader, async (req, res) => {
  const apps = await prisma.scholarshipApplication.findMany({
    where: { programId: req.params.id },
    include: { user: { select: { firstName: true, lastName: true, email: true } } },
    orderBy: { createdAt: 'desc' },
  })
  res.json(apps)
})

// POST /api/scholarship-programs/:id/apply  — public
router.post('/:id/apply', async (req, res) => {
  const program = await prisma.scholarshipProgram.findUnique({ where: { id: req.params.id } })
  if (!program || !program.isOpen || !program.isPublished)
    return res.status(400).json({ error: 'Program not accepting applications' })
  const { fullName, email, phone, dateOfBirth, school, level, subject, gpa, motivation, userId } = req.body
  if (!fullName || !email || !school || !motivation)
    return res.status(400).json({ error: 'fullName, email, school, motivation required' })
  const app = await prisma.scholarshipApplication.create({
    data: { programId: req.params.id, fullName, email, phone,
            dateOfBirth: dateOfBirth ? new Date(dateOfBirth) : null,
            school, level: level || program.level, subject, gpa, motivation,
            userId: userId || null },
  })
  sendScholarshipApplicationReceived({ to: email, fullName, programTitle: program.title, applicationId: app.id }).catch(console.error)
  res.status(201).json(app)
})

// PATCH /api/scholarship-programs/:pid/applications/:id  (admin review)
router.patch('/:pid/applications/:id', authenticate, isLeader, async (req, res) => {
  const { status, reviewNote } = req.body
  const app = await prisma.scholarshipApplication.update({
    where: { id: req.params.id },
    data: {
      ...(status     !== undefined && { status }),
      ...(reviewNote !== undefined && { reviewNote }),
      reviewedBy: req.user.id,
      reviewedAt: new Date(),
    },
  })
  if (status === 'approved' || status === 'rejected') {
    const program = await prisma.scholarshipProgram.findUnique({ where: { id: req.params.pid }, select: { title: true } })
    sendScholarshipDecision({
      to: app.email, fullName: app.fullName,
      programTitle: program?.title || 'Scholarship Program',
      status, reviewNote: app.reviewNote,
    }).catch(console.error)
  }
  res.json(app)
})

module.exports = router
