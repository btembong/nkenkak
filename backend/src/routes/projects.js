const router   = require('express').Router()
const { prisma } = require('../config/database')
const slugify  = require('slugify')
const { authenticate, optionalAuth, isLeader, isAdmin } = require('../middleware/auth')
const { sendProjectUpdateNotification } = require('../services/email')

// GET /api/projects
router.get('/', optionalAuth, async (req, res) => {
  const { featured, status, category, search, limit = 50, page = 1 } = req.query
  const where = {
    ...(featured === 'true' && { isFeatured: true }),
    ...(status   && status !== 'all' && { status }),
    ...(category && { category }),
    ...(search   && { OR: [
      { title:       { contains: search, mode: 'insensitive' } },
      { summary:     { contains: search, mode: 'insensitive' } },
      { description: { contains: search, mode: 'insensitive' } },
    ]}),
  }
  const [projects, total] = await Promise.all([
    prisma.project.findMany({
      where,
      orderBy: [{ isFeatured:'desc' }, { createdAt:'desc' }],
      take: +limit, skip: (+page-1) * +limit,
    }),
    prisma.project.count({ where }),
  ])
  res.json({ projects, total, page: +page, limit: +limit })
})

// GET /api/projects/stats/summary
router.get('/stats/summary', async (req, res) => {
  const [active, completed, total, raisedAgg, goalAgg] = await Promise.all([
    prisma.project.count({ where:{ status:'active' } }),
    prisma.project.count({ where:{ status:'completed' } }),
    prisma.project.count(),
    prisma.project.aggregate({ _sum:{ raisedAmount:true } }),
    prisma.project.aggregate({ _sum:{ goalAmount:true } }),
    prisma.donation.count({ where:{ status:'completed' } }),
  ])
  const donors = await prisma.donation.groupBy({ by:['donorEmail'], where:{ status:'completed' } })
  res.json({
    active, completed, total,
    total_raised: raisedAgg._sum.raisedAmount || 0,
    total_goal:   goalAgg._sum.goalAmount || 0,
    total_donors: donors.length,
  })
})

// GET /api/projects/:slug
router.get('/:slug', optionalAuth, async (req, res) => {
  const project = await prisma.project.findUnique({
    where: { slug: req.params.slug },
    include: { updates: { orderBy:{ createdAt:'desc' } } },
  })
  if (!project) return res.status(404).json({ error: 'Not found' })
  await prisma.project.update({ where: { id: project.id }, data: { viewCount: { increment:1 } } })
  res.json(project)
})

// POST /api/projects
router.post('/', authenticate, isLeader, async (req, res) => {
  const { title, summary, description, category, goal_amount, status, location,
          beneficiaries, start_date, end_date, cover_image, is_featured, is_urgent } = req.body
  if (!title) return res.status(400).json({ error: 'Title required' })
  const slug = slugify(title, { lower:true, strict:true }) + '-' + Date.now()
  const project = await prisma.project.create({
    data: { slug, title, summary: summary||'', description: description||'',
            category: category||'education', goalAmount: +goal_amount||0,
            status: status||'upcoming', location, beneficiaries: beneficiaries ? +beneficiaries : null,
            startDate: start_date ? new Date(start_date) : null,
            endDate: end_date ? new Date(end_date) : null,
            coverImage: cover_image, isFeatured: !!is_featured, isUrgent: !!is_urgent,
            createdBy: req.user.id },
  })
  res.status(201).json(project)
})

// PATCH /api/projects/:id
router.patch('/:id', authenticate, isLeader, async (req, res) => {
  const { title, summary, description, category, goal_amount, status, location,
          beneficiaries, start_date, end_date, cover_image, is_featured, is_urgent } = req.body
  const project = await prisma.project.update({
    where: { id: req.params.id },
    data: {
      ...(title        && { title }),
      ...(summary      && { summary }),
      ...(description  && { description }),
      ...(category     && { category }),
      ...(goal_amount  !== undefined && { goalAmount: +goal_amount }),
      ...(status       && { status }),
      ...(location     !== undefined && { location }),
      ...(beneficiaries !== undefined && { beneficiaries: +beneficiaries }),
      ...(start_date   && { startDate: new Date(start_date) }),
      ...(end_date     && { endDate: new Date(end_date) }),
      ...(cover_image  !== undefined && { coverImage: cover_image }),
      ...(is_featured  !== undefined && { isFeatured: !!is_featured }),
      ...(is_urgent    !== undefined && { isUrgent: !!is_urgent }),
    },
  })
  res.json(project)
})

// DELETE /api/projects/:id
router.delete('/:id', authenticate, isAdmin, async (req, res) => {
  await prisma.project.delete({ where: { id: req.params.id } })
  res.json({ message: 'Deleted' })
})

// GET /api/projects/:id/donors  — public donor wall (recent completed donations)
router.get('/:id/donors', async (req, res) => {
  const donations = await prisma.donation.findMany({
    where:   { projectId: req.params.id, status: 'completed' },
    orderBy: { createdAt: 'desc' },
    take:    20,
    select:  { id:true, donorName:true, amount:true, message:true, isAnonymous:true, createdAt:true },
  })
  res.json(donations.map(d => ({
    ...d,
    donorName: d.isAnonymous ? 'Anonymous' : (d.donorName || 'Supporter'),
  })))
})

// GET /api/projects/:id/comments  — public
router.get('/:id/comments', async (req, res) => {
  const comments = await prisma.projectComment.findMany({
    where:   { projectId: req.params.id },
    orderBy: { createdAt: 'asc' },
    take:    100,
  })
  res.json(comments)
})

// POST /api/projects/:id/comments
router.post('/:id/comments', optionalAuth, async (req, res) => {
  const { name, content } = req.body
  if (!content?.trim()) return res.status(400).json({ error: 'Comment cannot be empty' })
  const displayName = req.user
    ? `${req.user.firstName} ${req.user.lastName}`
    : (name?.trim() || 'Guest')
  const comment = await prisma.projectComment.create({
    data: {
      projectId: req.params.id,
      userId:    req.user?.id || null,
      name:      displayName,
      content:   content.trim(),
    },
  })
  res.status(201).json(comment)
})

// DELETE /api/projects/:projectId/comments/:commentId
router.delete('/:projectId/comments/:commentId', authenticate, isAdmin, async (req, res) => {
  await prisma.projectComment.delete({ where: { id: req.params.commentId } })
  res.json({ message: 'Deleted' })
})

// POST /api/projects/:id/updates
router.post('/:id/updates', authenticate, isLeader, async (req, res) => {
  const { title, content, image_url } = req.body
  if (!title || !content) return res.status(400).json({ error: 'Title and content required' })

  const [update, project] = await Promise.all([
    prisma.projectUpdate.create({
      data: { projectId: req.params.id, authorId: req.user.id, title, content, imageUrl: image_url || null },
    }),
    prisma.project.findUnique({ where: { id: req.params.id }, select: { title: true } }),
  ])

  // Notify unique donors who contributed to this project
  const donors = await prisma.donation.findMany({
    where:  { projectId: req.params.id, status: 'completed' },
    select: { donorEmail: true, donorName: true },
    distinct: ['donorEmail'],
  })
  donors.forEach(d => {
    if (d.donorEmail) {
      sendProjectUpdateNotification({
        to: d.donorEmail, donorName: d.donorName || 'Supporter',
        project: project?.title || 'the project',
        update: { title, content },
      }).catch(() => {})
    }
  })

  res.status(201).json(update)
})

// PATCH /api/projects/:id/gallery  — update galleryUrls array
router.patch('/:id/gallery', authenticate, isLeader, async (req, res) => {
  const { gallery_urls } = req.body
  const project = await prisma.project.update({
    where: { id: req.params.id },
    data:  { galleryUrls: Array.isArray(gallery_urls) ? gallery_urls : [] },
  })
  res.json(project)
})

module.exports = router
