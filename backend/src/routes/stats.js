const router = require('express').Router()
const { prisma } = require('../config/database')

/* Public stats endpoint — used by home page */
router.get('/', async (req, res) => {
  const [projectAgg, donorCount, teamCount, eventCount, newsCount] = await Promise.all([
    prisma.project.aggregate({
      _sum:   { raisedAmount: true, goalAmount: true },
      _count: { id: true },
      where:  { status: { not: 'archived' } },
    }),
    prisma.donation.count({ where: { status: 'completed' } }),
    prisma.teamMember.count({ where: { isActive: true } }),
    prisma.event.count({ where: { startDate: { gte: new Date() } } }),
    prisma.news.count({ where: { status: 'published' } }),
  ])

  /* Recent project milestones for ticker */
  const projects = await prisma.project.findMany({
    where:   { status: { in: ['active','completed'] } },
    select:  { title: true, raisedAmount: true, goalAmount: true, status: true },
    orderBy: { raisedAmount: 'desc' },
    take:    8,
  })

  const milestones = projects.map(p => {
    const pct = p.goalAmount > 0 ? Math.min(100, Math.round((Number(p.raisedAmount) / Number(p.goalAmount)) * 100)) : 0
    if (p.status === 'completed') return `${p.title} — Completed ✓`
    return `${p.title} — ${pct}% funded`
  })

  res.json({
    totalRaised:   Number(projectAgg._sum.raisedAmount || 0),
    totalGoal:     Number(projectAgg._sum.goalAmount   || 0),
    projectCount:  projectAgg._count.id,
    donorCount,
    teamCount,
    upcomingEvents: eventCount,
    publishedNews:  newsCount,
    milestones,
  })
})

module.exports = router
