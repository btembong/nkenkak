const router = require('express').Router()
const { prisma } = require('../config/database')
const { authenticate, isAdmin } = require('../middleware/auth')

router.get('/', async (req, res) => {
  const { year, level, status } = req.query
  const items = await prisma.scholarship.findMany({
    where: {
      ...(year   && { year: +year }),
      ...(level  && { level }),
      ...(status && { status }),
    },
    orderBy: [{ sortOrder: 'asc' }, { year: 'desc' }, { name: 'asc' }],
  })
  res.json(items)
})

router.post('/', authenticate, isAdmin, async (req, res) => {
  const { name, school, level, subject, year, amount, currency, sponsor_name, bio, photo_url, status, sort_order } = req.body
  if (!name || !school || !year) return res.status(400).json({ error: 'Name, school and year required' })
  const s = await prisma.scholarship.create({
    data: {
      name, school, level: level || 'university', subject,
      year: +year, amount: amount ? +amount : null,
      currency: currency || 'XAF',
      sponsorName: sponsor_name, bio, photoUrl: photo_url,
      status: status || 'active',
      sortOrder: sort_order ? +sort_order : 0,
    },
  })
  res.status(201).json(s)
})

router.patch('/:id', authenticate, isAdmin, async (req, res) => {
  const { name, school, level, subject, year, amount, sponsor_name, bio, photo_url, status, sort_order } = req.body
  const s = await prisma.scholarship.update({
    where: { id: req.params.id },
    data: {
      ...(name         !== undefined && { name }),
      ...(school       !== undefined && { school }),
      ...(level        !== undefined && { level }),
      ...(subject      !== undefined && { subject }),
      ...(year         !== undefined && { year: +year }),
      ...(amount       !== undefined && { amount: amount ? +amount : null }),
      ...(sponsor_name !== undefined && { sponsorName: sponsor_name }),
      ...(bio          !== undefined && { bio }),
      ...(photo_url    !== undefined && { photoUrl: photo_url }),
      ...(status       !== undefined && { status }),
      ...(sort_order   !== undefined && { sortOrder: +sort_order }),
    },
  })
  res.json(s)
})

router.delete('/:id', authenticate, isAdmin, async (req, res) => {
  await prisma.scholarship.delete({ where: { id: req.params.id } })
  res.json({ message: 'Deleted' })
})

module.exports = router
