const router = require('express').Router()
const { prisma } = require('../config/database')
const { authenticate, isAdmin } = require('../middleware/auth')

router.get('/', async (req, res) => {
  const { category, diaspora } = req.query
  const items = await prisma.business.findMany({
    where: {
      isApproved: true,
      ...(category && { category }),
      ...(diaspora !== undefined && { isDiaspora: diaspora === 'true' }),
    },
    orderBy: [{ isFeatured: 'desc' }, { sortOrder: 'asc' }, { name: 'asc' }],
  })
  res.json(items)
})

router.get('/all', authenticate, isAdmin, async (req, res) => {
  const items = await prisma.business.findMany({ orderBy: { createdAt: 'desc' } })
  res.json(items)
})

// Public submit — goes to pending approval
router.post('/submit', async (req, res) => {
  const { name, category, description, owner_name, location, country, city, phone, email, website, is_diaspora } = req.body
  if (!name || !owner_name) return res.status(400).json({ error: 'Business name and owner name required' })
  const b = await prisma.business.create({
    data: {
      name, category: category || 'other', description,
      ownerName: owner_name, location, country: country || 'Cameroon',
      city, phone, email, website,
      isDiaspora: !!is_diaspora, isApproved: false,
    },
  })
  res.status(201).json(b)
})

router.post('/', authenticate, isAdmin, async (req, res) => {
  const { name, category, description, owner_name, location, country, city, phone, email, website, logo_url, is_diaspora, is_approved, is_featured } = req.body
  if (!name || !owner_name) return res.status(400).json({ error: 'Business name and owner name required' })
  const b = await prisma.business.create({
    data: {
      name, category: category || 'other', description,
      ownerName: owner_name, location, country: country || 'Cameroon',
      city, phone, email, website, logoUrl: logo_url,
      isDiaspora: !!is_diaspora, isApproved: is_approved !== false,
      isFeatured: !!is_featured,
    },
  })
  res.status(201).json(b)
})

router.patch('/:id', authenticate, isAdmin, async (req, res) => {
  const { name, category, description, owner_name, location, country, city, phone, email, website, logo_url, is_diaspora, is_approved, is_featured, sort_order } = req.body
  const b = await prisma.business.update({
    where: { id: req.params.id },
    data: {
      ...(name        !== undefined && { name }),
      ...(category    !== undefined && { category }),
      ...(description !== undefined && { description }),
      ...(owner_name  !== undefined && { ownerName: owner_name }),
      ...(location    !== undefined && { location }),
      ...(country     !== undefined && { country }),
      ...(city        !== undefined && { city }),
      ...(phone       !== undefined && { phone }),
      ...(email       !== undefined && { email }),
      ...(website     !== undefined && { website }),
      ...(logo_url    !== undefined && { logoUrl: logo_url }),
      ...(is_diaspora !== undefined && { isDiaspora: !!is_diaspora }),
      ...(is_approved !== undefined && { isApproved: !!is_approved }),
      ...(is_featured !== undefined && { isFeatured: !!is_featured }),
      ...(sort_order  !== undefined && { sortOrder: +sort_order }),
    },
  })
  res.json(b)
})

router.delete('/:id', authenticate, isAdmin, async (req, res) => {
  await prisma.business.delete({ where: { id: req.params.id } })
  res.json({ message: 'Deleted' })
})

module.exports = router
