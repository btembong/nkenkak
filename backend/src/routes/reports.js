const router = require('express').Router()
const { prisma } = require('../config/database')
const { authenticate, isAdmin } = require('../middleware/auth')

router.get('/', async (req, res) => {
  const { year } = req.query
  const items = await prisma.financialReport.findMany({
    where: {
      isPublished: true,
      ...(year && { year: +year }),
    },
    orderBy: [{ year: 'desc' }, { createdAt: 'desc' }],
  })
  res.json(items)
})

router.get('/all', authenticate, isAdmin, async (req, res) => {
  const items = await prisma.financialReport.findMany({ orderBy: [{ year: 'desc' }, { createdAt: 'desc' }] })
  res.json(items)
})

router.post('/', authenticate, isAdmin, async (req, res) => {
  const { title, year, period, file_url, total_income, total_expenses, summary, highlights } = req.body
  if (!title || !year) return res.status(400).json({ error: 'Title and year required' })
  const r = await prisma.financialReport.create({
    data: {
      title, year: +year, period: period || 'Annual',
      fileUrl: file_url,
      totalIncome:   total_income   ? +total_income   : null,
      totalExpenses: total_expenses ? +total_expenses : null,
      summary, highlights: highlights || [],
    },
  })
  res.status(201).json(r)
})

router.patch('/:id', authenticate, isAdmin, async (req, res) => {
  const { title, year, period, file_url, total_income, total_expenses, summary, highlights, is_published } = req.body
  const r = await prisma.financialReport.update({
    where: { id: req.params.id },
    data: {
      ...(title          !== undefined && { title }),
      ...(year           !== undefined && { year: +year }),
      ...(period         !== undefined && { period }),
      ...(file_url       !== undefined && { fileUrl: file_url }),
      ...(total_income   !== undefined && { totalIncome:   total_income   ? +total_income   : null }),
      ...(total_expenses !== undefined && { totalExpenses: total_expenses ? +total_expenses : null }),
      ...(summary        !== undefined && { summary }),
      ...(highlights     !== undefined && { highlights }),
      ...(is_published   !== undefined && { isPublished: !!is_published }),
    },
  })
  res.json(r)
})

router.delete('/:id', authenticate, isAdmin, async (req, res) => {
  await prisma.financialReport.delete({ where: { id: req.params.id } })
  res.json({ message: 'Deleted' })
})

module.exports = router
