const router = require('express').Router()
const { prisma } = require('../config/database')
const { authenticate, optionalAuth, isAdmin } = require('../middleware/auth')
const Anthropic = require('@anthropic-ai/sdk')

// GET /api/jobs
router.get('/', optionalAuth, async (req, res) => {
  const { type, category, page = 1, limit = 20 } = req.query
  const where = {
    isApproved: true,
    OR: [{ expiresAt: null }, { expiresAt: { gt: new Date() } }],
    ...(type && { type }),
    ...(category && { category }),
  }
  const [posts, total] = await Promise.all([
    prisma.jobPost.findMany({
      where,
      include: { author: { select: { firstName: true, lastName: true } } },
      orderBy: [{ isFeatured: 'desc' }, { createdAt: 'desc' }],
      skip: (page - 1) * +limit,
      take: +limit,
    }),
    prisma.jobPost.count({ where }),
  ])

  // Strip contact details for unauthenticated users
  const sanitized = posts.map(p => req.user
    ? p
    : { ...p, contactName: null, contactEmail: null, contactPhone: null }
  )

  res.json({ posts: sanitized, total, pages: Math.ceil(total / +limit) })
})

// GET /api/jobs/pending — admin
router.get('/pending', authenticate, isAdmin, async (req, res) => {
  const posts = await prisma.jobPost.findMany({
    where: { isApproved: false },
    include: { author: { select: { firstName: true, lastName: true, email: true } } },
    orderBy: { createdAt: 'desc' },
  })
  res.json(posts)
})

// GET /api/jobs/:id
router.get('/:id', optionalAuth, async (req, res) => {
  const post = await prisma.jobPost.findUnique({
    where: { id: req.params.id },
    include: { author: { select: { firstName: true, lastName: true } } },
  })
  if (!post || !post.isApproved) return res.status(404).json({ error: 'Not found' })

  // Gate recruiter contact details behind premium subscription
  const isPremium = req.user?.isPremium || req.user?.role === 'admin' || req.user?.role === 'leader'
  if (!isPremium) {
    return res.json({
      ...post,
      contactName: null,
      contactEmail: null,
      contactPhone: null,
      whatsapp: null,
    })
  }

  res.json(post)
})

// POST /api/jobs — any logged in user
router.post('/', authenticate, async (req, res) => {
  const {
    type, title, description, category, location, country, salary,
    contactName, contactEmail, contactPhone, imageUrl, expiresAt,
    companyName, companyAddress, companyWebsite, linkedIn, facebook, twitter, whatsapp, applicationProcess
  } = req.body
  if (!title || !description || !contactName) return res.status(400).json({ error: 'title, description, contactName required' })
  const post = await prisma.jobPost.create({
    data: {
      type: type || 'job',
      title, description,
      category: category || 'other',
      location,
      country: country || 'Cameroon',
      salary,
      contactName, contactEmail, contactPhone,
      imageUrl,
      companyName, companyAddress, companyWebsite,
      linkedIn, facebook, twitter, whatsapp,
      applicationProcess,
      authorId: req.user.id,
      expiresAt: expiresAt ? new Date(expiresAt) : null,
    },
  })
  res.status(201).json(post)
})

// POST /api/jobs/generate-cv — AI CV generator for premium users
router.post('/generate-cv', authenticate, async (req, res) => {
  if (!req.user.isPremium && req.user.role !== 'admin' && req.user.role !== 'leader') {
    return res.status(403).json({ error: 'Premium subscription required to use the AI CV generator' })
  }

  const { jobTitle, jobDescription, userBackground } = req.body
  if (!jobTitle || !userBackground) {
    return res.status(400).json({ error: 'jobTitle and userBackground are required' })
  }

  const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })

  const prompt = `You are a professional CV writer. Create a tailored, professional CV for someone applying to the following job.

Job Title: ${jobTitle}
${jobDescription ? `Job Description:\n${jobDescription}\n` : ''}

Applicant Background:
${userBackground}

Write a complete, ATS-friendly CV in clean plain text with these sections:
1. Personal Summary (3-4 sentences tailored to the job)
2. Key Skills (bullet list relevant to the role)
3. Work Experience (format each as: Title | Company | Dates, then bullet achievements)
4. Education
5. Additional Information (languages, certifications, volunteer work if relevant)

Keep it professional, concise, and impactful. Tailor the language to match the job description.`

  const message = await anthropic.messages.create({
    model: 'claude-haiku-4-5-20251001',
    max_tokens: 1500,
    messages: [{ role: 'user', content: prompt }],
  })

  res.json({ cv: message.content[0].text })
})

// PATCH /api/jobs/:id — admin approve/feature/edit
router.patch('/:id', authenticate, isAdmin, async (req, res) => {
  const {
    title, description, category, location, salary,
    isApproved, isFeatured, expiresAt,
    companyName, companyAddress, companyWebsite, linkedIn, facebook, twitter, whatsapp, applicationProcess
  } = req.body
  const post = await prisma.jobPost.update({
    where: { id: req.params.id },
    data: {
      ...(title              !== undefined && { title }),
      ...(description        !== undefined && { description }),
      ...(category           !== undefined && { category }),
      ...(location           !== undefined && { location }),
      ...(salary             !== undefined && { salary }),
      ...(isApproved         !== undefined && { isApproved: !!isApproved }),
      ...(isFeatured         !== undefined && { isFeatured: !!isFeatured }),
      ...(expiresAt          !== undefined && { expiresAt: expiresAt ? new Date(expiresAt) : null }),
      ...(companyName        !== undefined && { companyName }),
      ...(companyAddress     !== undefined && { companyAddress }),
      ...(companyWebsite     !== undefined && { companyWebsite }),
      ...(linkedIn           !== undefined && { linkedIn }),
      ...(facebook           !== undefined && { facebook }),
      ...(twitter            !== undefined && { twitter }),
      ...(whatsapp           !== undefined && { whatsapp }),
      ...(applicationProcess !== undefined && { applicationProcess }),
    },
  })
  res.json(post)
})

// DELETE /api/jobs/:id
router.delete('/:id', authenticate, isAdmin, async (req, res) => {
  await prisma.jobPost.delete({ where: { id: req.params.id } })
  res.json({ message: 'Deleted' })
})

module.exports = router
