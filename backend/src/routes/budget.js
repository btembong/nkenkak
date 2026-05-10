const router = require('express').Router()
const { prisma } = require('../config/database')
const { authenticate, isAdmin } = require('../middleware/auth')

// GET /api/budget — public summary
router.get('/', async (req, res) => {
  const { year } = req.query
  const currentYear = new Date().getFullYear()
  const targetYear = year ? +year : currentYear

  const entries = await prisma.budgetEntry.findMany({
    where: { isPublished: true, year: targetYear },
    orderBy: [{ quarter: 'asc' }, { type: 'asc' }],
  })

  // Available years
  const years = await prisma.budgetEntry.findMany({
    where: { isPublished: true },
    select: { year: true },
    distinct: ['year'],
    orderBy: { year: 'desc' },
  })

  const income   = entries.filter(e => e.type === 'income')
  const expenses = entries.filter(e => e.type === 'expense')
  const totalIncome   = income.reduce((s, e) => s + Number(e.amount), 0)
  const totalExpenses = expenses.reduce((s, e) => s + Number(e.amount), 0)

  // Group expenses by category for pie chart
  const byCategory = {}
  expenses.forEach(e => {
    byCategory[e.category] = (byCategory[e.category] || 0) + Number(e.amount)
  })

  res.json({
    year: targetYear,
    years: years.map(y => y.year),
    entries,
    totalIncome,
    totalExpenses,
    balance: totalIncome - totalExpenses,
    byCategory: Object.entries(byCategory).map(([name, amount]) => ({ name, amount })).sort((a, b) => b.amount - a.amount),
  })
})

// GET /api/budget/all — admin, includes unpublished
router.get('/all', authenticate, isAdmin, async (req, res) => {
  const { year } = req.query
  const entries = await prisma.budgetEntry.findMany({
    where: year ? { year: +year } : {},
    orderBy: [{ year: 'desc' }, { quarter: 'asc' }],
  })
  res.json(entries)
})

// POST /api/budget
router.post('/', authenticate, isAdmin, async (req, res) => {
  const { year, quarter, category, type, amount, currency, description, receiptUrl, projectId } = req.body
  if (!year || !category || !type || !amount) return res.status(400).json({ error: 'year, category, type, amount required' })
  const entry = await prisma.budgetEntry.create({
    data: { year: +year, quarter: quarter || 'Q1', category, type, amount: +amount, currency: currency || 'XAF', description, receiptUrl, projectId },
  })
  res.status(201).json(entry)
})

// PATCH /api/budget/:id
router.patch('/:id', authenticate, isAdmin, async (req, res) => {
  const { year, quarter, category, type, amount, currency, description, receiptUrl, isPublished } = req.body
  const entry = await prisma.budgetEntry.update({
    where: { id: req.params.id },
    data: {
      ...(year        !== undefined && { year: +year }),
      ...(quarter     !== undefined && { quarter }),
      ...(category    !== undefined && { category }),
      ...(type        !== undefined && { type }),
      ...(amount      !== undefined && { amount: +amount }),
      ...(currency    !== undefined && { currency }),
      ...(description !== undefined && { description }),
      ...(receiptUrl  !== undefined && { receiptUrl }),
      ...(isPublished !== undefined && { isPublished: !!isPublished }),
    },
  })
  res.json(entry)
})

// DELETE /api/budget/:id
router.delete('/:id', authenticate, isAdmin, async (req, res) => {
  await prisma.budgetEntry.delete({ where: { id: req.params.id } })
  res.json({ message: 'Deleted' })
})

module.exports = router
