const router = require('express').Router()
const { prisma } = require('../config/database')
const { authenticate, isAdmin } = require('../middleware/auth')

// Badge thresholds (cumulative approved hours)
const BADGES = [
  { id: 'seed',     label: 'Seed Planter',    icon: 'fa-seedling',    color: '#16a34a', hours: 5   },
  { id: 'bronze',   label: 'Bronze Volunteer', icon: 'fa-medal',       color: '#b45309', hours: 10  },
  { id: 'silver',   label: 'Silver Volunteer', icon: 'fa-medal',       color: '#6b7280', hours: 25  },
  { id: 'gold',     label: 'Gold Volunteer',   icon: 'fa-medal',       color: '#F0A500', hours: 50  },
  { id: 'platinum', label: 'Village Champion', icon: 'fa-crown',       color: '#5B2D8E', hours: 100 },
  { id: 'legend',   label: 'Community Legend', icon: 'fa-star',        color: '#dc2626', hours: 250 },
]

function computeBadges(totalHours) {
  return BADGES.filter(b => totalHours >= b.hours)
}

// GET /api/volunteer/badges — badge definitions
router.get('/badges', (req, res) => {
  res.json(BADGES)
})

// GET /api/volunteer/my — my hours + summary
router.get('/my', authenticate, async (req, res) => {
  const hours = await prisma.volunteerHour.findMany({
    where: { userId: req.user.id },
    orderBy: { date: 'desc' },
  })
  const approvedTotal = hours
    .filter(h => h.status === 'approved')
    .reduce((s, h) => s + h.hours, 0)
  const pendingTotal = hours
    .filter(h => h.status === 'pending')
    .reduce((s, h) => s + h.hours, 0)
  res.json({ hours, approvedTotal, pendingTotal, badges: computeBadges(approvedTotal) })
})

// POST /api/volunteer — log hours
router.post('/', authenticate, async (req, res) => {
  const { activity, hours, date, description } = req.body
  if (!activity || !hours || !date) return res.status(400).json({ error: 'Activity, hours and date required' })
  if (+hours <= 0 || +hours > 24) return res.status(400).json({ error: 'Hours must be between 0 and 24' })
  const entry = await prisma.volunteerHour.create({
    data: {
      userId: req.user.id,
      activity,
      hours: +hours,
      date: new Date(date),
      description: description || null,
    },
  })
  res.status(201).json(entry)
})

// PATCH /api/volunteer/:id/approve — admin approve/reject
router.patch('/:id/approve', authenticate, isAdmin, async (req, res) => {
  const { status } = req.body // approved|rejected
  if (!['approved', 'rejected'].includes(status)) return res.status(400).json({ error: 'Invalid status' })
  const entry = await prisma.volunteerHour.update({
    where: { id: req.params.id },
    data: { status, approvedBy: req.user.id, approvedAt: new Date() },
  })
  res.json(entry)
})

// GET /api/volunteer — admin: all pending hours
router.get('/', authenticate, isAdmin, async (req, res) => {
  const { status } = req.query
  const hours = await prisma.volunteerHour.findMany({
    where: status ? { status } : {},
    include: { user: { select: { firstName: true, lastName: true, email: true } } },
    orderBy: { createdAt: 'desc' },
    take: 200,
  })
  res.json(hours.map(h => ({
    ...h,
    user_name: `${h.user.firstName} ${h.user.lastName}`,
    user_email: h.user.email,
  })))
})

// GET /api/volunteer/leaderboard — top volunteers by approved hours
router.get('/leaderboard', async (req, res) => {
  const rows = await prisma.volunteerHour.groupBy({
    by: ['userId'],
    where: { status: 'approved' },
    _sum: { hours: true },
    orderBy: { _sum: { hours: 'desc' } },
    take: 10,
  })
  const ids = rows.map(r => r.userId)
  const users = await prisma.user.findMany({
    where: { id: { in: ids } },
    select: { id: true, firstName: true, lastName: true, avatarUrl: true },
  })
  const userMap = Object.fromEntries(users.map(u => [u.id, u]))
  res.json(rows.map(r => ({
    userId: r.userId,
    totalHours: r._sum.hours || 0,
    badges: computeBadges(r._sum.hours || 0),
    ...userMap[r.userId],
  })))
})

module.exports = router
