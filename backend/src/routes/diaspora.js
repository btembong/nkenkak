const router = require('express').Router()
const { prisma } = require('../config/database')
const { authenticate } = require('../middleware/auth')

router.get('/', async (req, res) => {
  const pins = await prisma.diasporaPin.findMany({ orderBy: { createdAt: 'desc' } })
  res.json(pins)
})

router.post('/', authenticate, async (req, res) => {
  const { display_name, city, country, latitude, longitude, bio } = req.body
  if (!display_name || !city || !country || !latitude || !longitude)
    return res.status(400).json({ error: 'Name, city, country and coordinates required' })
  const pin = await prisma.diasporaPin.create({
    data: { displayName: display_name, city, country,
            latitude: +latitude, longitude: +longitude, bio, userId: req.user.id },
  })
  res.status(201).json(pin)
})

router.delete('/:id', authenticate, async (req, res) => {
  await prisma.diasporaPin.delete({ where: { id: req.params.id } })
  res.json({ message: 'Deleted' })
})

module.exports = router
