const router = require('express').Router()
const { prisma } = require('../config/database')
const { authenticate, isAdmin } = require('../middleware/auth')

router.get('/', async (req, res) => {
  const mentors = await prisma.mentor.findMany({
    where: { isAvailable: true },
    orderBy: [{ isFeatured: 'desc' }, { sortOrder: 'asc' }, { name: 'asc' }],
  })
  res.json(mentors)
})

router.get('/all', authenticate, isAdmin, async (req, res) => {
  const mentors = await prisma.mentor.findMany({
    include: { applications: { select: { id: true, status: true } } },
    orderBy: { createdAt: 'desc' },
  })
  res.json(mentors)
})

// Public: register as a mentor (pending admin approval)
router.post('/register', async (req, res) => {
  const { name, profession, company, bio, expertise, country, city, linkedin, email, max_mentees } = req.body
  if (!name || !email || !profession || !country) return res.status(400).json({ error: 'Name, email, profession and country required' })
  const m = await prisma.mentor.create({
    data: {
      name, profession, company, bio,
      expertise: expertise || [],
      country, city,
      linkedin, email,
      isAvailable: false,   // pending admin approval
      maxMentees: max_mentees ? +max_mentees : 2,
    },
  })
  res.status(201).json(m)
})

// Public: general mentee application (no specific mentor chosen — admin will match)
router.post('/apply-mentee', async (req, res) => {
  const { name, email, phone, age, education, goals, field } = req.body
  if (!name || !email || !goals) return res.status(400).json({ error: 'Name, email and goals required' })
  const app = await prisma.mentorApplication.create({
    data: { name, email, phone, age: age ? +age : null, education, goals, message: field || null },
  })
  res.status(201).json(app)
})

// Public: apply to a mentor
router.post('/:id/apply', async (req, res) => {
  const { name, email, phone, age, education, goals } = req.body
  if (!name || !email || !goals) return res.status(400).json({ error: 'Name, email and goals required' })
  const mentor = await prisma.mentor.findUnique({ where: { id: req.params.id } })
  if (!mentor || !mentor.isAvailable) return res.status(404).json({ error: 'Mentor not available' })
  const app = await prisma.mentorApplication.create({
    data: { mentorId: req.params.id, name, email, phone, age: age ? +age : null, education, goals },
  })
  res.status(201).json(app)
})

router.get('/applications', authenticate, isAdmin, async (req, res) => {
  const apps = await prisma.mentorApplication.findMany({
    include: { mentor: { select: { name: true, profession: true } } },
    orderBy: { createdAt: 'desc' },
  })
  res.json(apps)
})

router.patch('/applications/:id', authenticate, isAdmin, async (req, res) => {
  const { status } = req.body
  const app = await prisma.mentorApplication.update({ where: { id: req.params.id }, data: { status } })
  res.json(app)
})

router.post('/', authenticate, isAdmin, async (req, res) => {
  const { name, profession, company, bio, expertise, country, city, photo_url, linkedin, email, is_available, max_mentees, is_featured } = req.body
  if (!name || !profession || !country) return res.status(400).json({ error: 'Name, profession and country required' })
  const m = await prisma.mentor.create({
    data: {
      name, profession, company, bio,
      expertise: expertise || [],
      country, city,
      photoUrl: photo_url, linkedin, email,
      isAvailable: is_available !== false,
      maxMentees: max_mentees ? +max_mentees : 2,
      isFeatured: !!is_featured,
    },
  })
  res.status(201).json(m)
})

router.patch('/:id', authenticate, isAdmin, async (req, res) => {
  const { name, profession, company, bio, expertise, country, city, photo_url, linkedin, email, is_available, max_mentees, is_featured, sort_order } = req.body
  const m = await prisma.mentor.update({
    where: { id: req.params.id },
    data: {
      ...(name         !== undefined && { name }),
      ...(profession   !== undefined && { profession }),
      ...(company      !== undefined && { company }),
      ...(bio          !== undefined && { bio }),
      ...(expertise    !== undefined && { expertise }),
      ...(country      !== undefined && { country }),
      ...(city         !== undefined && { city }),
      ...(photo_url    !== undefined && { photoUrl: photo_url }),
      ...(linkedin     !== undefined && { linkedin }),
      ...(email        !== undefined && { email }),
      ...(is_available !== undefined && { isAvailable: !!is_available }),
      ...(max_mentees  !== undefined && { maxMentees: +max_mentees }),
      ...(is_featured  !== undefined && { isFeatured: !!is_featured }),
      ...(sort_order   !== undefined && { sortOrder: +sort_order }),
    },
  })
  res.json(m)
})

router.delete('/:id', authenticate, isAdmin, async (req, res) => {
  await prisma.mentor.delete({ where: { id: req.params.id } })
  res.json({ message: 'Deleted' })
})

module.exports = router
