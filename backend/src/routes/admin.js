const router = require('express').Router()
const { prisma } = require('../config/database')
const { authenticate, isAdmin } = require('../middleware/auth')
const { sendTeamApplicationResult } = require('../services/email')
const { broadcastSms } = require('../services/sms')

// GET /api/admin/dashboard
router.get('/dashboard', authenticate, isAdmin, async (req, res) => {
  const [userTotal, userDiaspora, userNewMonth, projectActive, projectCompleted, projectTotal,
         raisedAgg, goalAgg, eventUpcoming, newsPublished, forumThreads, forumReplies,
         donationPending, recentDonations] = await Promise.all([
    prisma.user.count(),
    prisma.user.count({ where: { isDiaspora: true } }),
    prisma.user.count({ where: { createdAt: { gte: new Date(new Date().getFullYear(), new Date().getMonth(), 1) } } }),
    prisma.project.count({ where: { status: 'active' } }),
    prisma.project.count({ where: { status: 'completed' } }),
    prisma.project.count(),
    prisma.project.aggregate({ _sum: { raisedAmount: true } }),
    prisma.project.aggregate({ _sum: { goalAmount: true } }),
    prisma.event.count({ where: { startDate: { gt: new Date() }, isPublished: true } }),
    prisma.news.count({ where: { status: 'published' } }),
    prisma.forumThread.count(),
    prisma.forumReply.count(),
    prisma.donation.count({ where: { status: 'pending' } }),
    prisma.donation.findMany({
      where: { status: 'completed' },
      include: { project: { select: { title: true } }, user: { select: { firstName: true, lastName: true } } },
      orderBy: { createdAt: 'desc' }, take: 8,
    }),
  ])
  const totalRaised = Number(raisedAgg._sum.raisedAmount || 0)
  const totalGoal   = Number(goalAgg._sum.goalAmount   || 0)
  res.json({
    users:     { total: userTotal, diaspora: userDiaspora, new_this_month: userNewMonth },
    projects:  { active: projectActive, completed: projectCompleted, total: projectTotal,
                 total_raised: totalRaised, total_goal: totalGoal },
    events:    { upcoming: eventUpcoming },
    news:      { published: newsPublished },
    forum:     { threads: forumThreads, replies: forumReplies },
    donations: { pending: donationPending, total: totalRaised },
    recent_donations: recentDonations.map(d => ({
      reference: d.reference, amount: Number(d.amount), currency: d.currency, status: d.status,
      donor:   d.donorName || (d.user ? `${d.user.firstName} ${d.user.lastName}` : 'Anonymous'),
      project: d.project?.title || 'General Fund',
    })),
  })
})

// GET /api/admin/users
router.get('/users', authenticate, isAdmin, async (req, res) => {
  const { search } = req.query
  const users = await prisma.user.findMany({
    where: search ? {
      OR: [
        { email:     { contains: search, mode: 'insensitive' } },
        { firstName: { contains: search, mode: 'insensitive' } },
        { lastName:  { contains: search, mode: 'insensitive' } },
      ],
    } : undefined,
    select: { id:true, email:true, firstName:true, lastName:true, role:true, status:true,
              country:true, isDiaspora:true, isPremium:true, createdAt:true },
    orderBy: { createdAt: 'desc' },
    take: 200,
  })
  res.json(users)
})

// PATCH /api/admin/users/:id
router.patch('/users/:id', authenticate, isAdmin, async (req, res) => {
  const { role, status, isPremium } = req.body
  const user = await prisma.user.update({
    where: { id: req.params.id },
    data: {
      ...(role      !== undefined && { role }),
      ...(status    !== undefined && { status }),
      ...(isPremium !== undefined && { isPremium: !!isPremium }),
    },
    select: { id:true, email:true, role:true, status:true, isPremium:true },
  })
  res.json(user)
})

// GET /api/admin/team-applications
router.get('/team-applications', authenticate, isAdmin, async (req, res) => {
  const apps = await prisma.teamApplication.findMany({ orderBy: { createdAt: 'desc' } })
  res.json(apps)
})

// PATCH /api/admin/team-applications/:id
router.patch('/team-applications/:id', authenticate, isAdmin, async (req, res) => {
  const { status, note } = req.body
  const app = await prisma.teamApplication.update({ where: { id: req.params.id }, data: { status } })
  if (status === 'approved' || status === 'rejected') {
    sendTeamApplicationResult({ to: app.email, fullName: app.fullName, teamChoice: app.teamChoice, status, note: note || null }).catch(() => {})
  }
  res.json(app)
})

// GET /api/admin/analytics  — time-series data for dashboard charts
router.get('/analytics', authenticate, isAdmin, async (req, res) => {
  const days = parseInt(req.query.days) || 30
  const since = new Date(Date.now() - days * 24 * 60 * 60 * 1000)

  // Build date buckets
  const buckets = Array.from({ length: days }, (_, i) => {
    const d = new Date(Date.now() - (days - 1 - i) * 24 * 60 * 60 * 1000)
    return d.toISOString().slice(0, 10)
  })

  const [rawSignups, rawDonations, membersByCountry, donationsByMethod] = await Promise.all([
    // signups per day
    prisma.$queryRawUnsafe(`
      SELECT DATE("created_at")::text AS day, COUNT(*)::int AS count
      FROM users
      WHERE "created_at" >= $1
      GROUP BY day ORDER BY day
    `, since),

    // donations per day (completed)
    prisma.$queryRawUnsafe(`
      SELECT DATE("created_at")::text AS day,
             COUNT(*)::int AS count,
             SUM(amount)::float AS total
      FROM donations
      WHERE status = 'completed' AND "created_at" >= $1
      GROUP BY day ORDER BY day
    `, since),

    // top 6 countries
    prisma.$queryRawUnsafe(`
      SELECT COALESCE(country, 'Unknown') AS country, COUNT(*)::int AS count
      FROM users
      WHERE country IS NOT NULL AND country <> ''
      GROUP BY country ORDER BY count DESC LIMIT 6
    `),

    // donations by payment method
    prisma.$queryRawUnsafe(`
      SELECT COALESCE(provider, 'unknown') AS method, COUNT(*)::int AS count,
             SUM(amount)::float AS total
      FROM donations
      WHERE status = 'completed'
      GROUP BY provider ORDER BY total DESC
    `),
  ])

  // Fill gaps in signups
  const signupMap = Object.fromEntries(rawSignups.map(r => [r.day, r.count]))
  const donationMap = Object.fromEntries(rawDonations.map(r => [r.day, { count: r.count, total: r.total }]))

  const signups   = buckets.map(d => ({ day: d, count: signupMap[d] || 0 }))
  const donations = buckets.map(d => ({ day: d, count: donationMap[d]?.count || 0, total: donationMap[d]?.total || 0 }))

  res.json({ signups, donations, membersByCountry, donationsByMethod })
})

// GET /api/admin/audit-logs
router.get('/audit-logs', authenticate, isAdmin, async (req, res) => {
  const logs = await prisma.auditLog.findMany({
    include: { user: { select: { firstName: true, lastName: true } } },
    orderBy: { createdAt: 'desc' },
    take: 100,
  })
  res.json(logs.map(l => ({
    ...l, user_name: l.user ? `${l.user.firstName} ${l.user.lastName}` : null,
  })))
})

// POST /api/admin/sms/send — broadcast SMS to members with phone numbers
router.post('/sms/send', authenticate, isAdmin, async (req, res) => {
  const { message, audience = 'all' } = req.body
  if (!message?.trim()) return res.status(400).json({ error: 'message required' })
  if (message.length > 480) return res.status(400).json({ error: 'message too long (max 480 chars)' })

  // Fetch members with phone numbers
  const where = { phone: { not: null }, status: 'active' }
  if (audience === 'diaspora') where.isDiaspora = true
  if (audience === 'local')    where.isDiaspora = false

  const users = await prisma.user.findMany({ where, select: { phone: true } })
  const phones = users.map(u => u.phone).filter(Boolean)

  if (!phones.length) return res.status(400).json({ error: 'No members with phone numbers found for that audience' })

  const result = await broadcastSms(phones, message)
  res.json(result)
})

// GET /api/admin/sms/status — check if Twilio is configured
router.get('/sms/status', authenticate, isAdmin, async (req, res) => {
  const configured = !!(process.env.TWILIO_ACCOUNT_SID && process.env.TWILIO_AUTH_TOKEN && process.env.TWILIO_FROM_NUMBER)
  const phoneCount = await prisma.user.count({ where: { phone: { not: null }, status: 'active' } })
  res.json({ configured, phoneCount })
})

module.exports = router
