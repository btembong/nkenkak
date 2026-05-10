const router = require('express').Router()
const { prisma } = require('../config/database')
const { authenticate, isAdmin } = require('../middleware/auth')

router.get('/', async (req, res) => {
  const { type } = req.query
  const items = await prisma.memorial.findMany({
    where: {
      isPublished: true,
      ...(type && { type }),
    },
    orderBy: [{ sortOrder: 'asc' }, { createdAt: 'desc' }],
  })
  res.json(items)
})

router.post('/', authenticate, isAdmin, async (req, res) => {
  const { name, type, role, birth_year, death_year, bio, photo_url, achievements, sort_order } = req.body
  if (!name) return res.status(400).json({ error: 'Name required' })
  const m = await prisma.memorial.create({
    data: {
      name, type: type || 'memorial', role,
      birthYear: birth_year ? +birth_year : null,
      deathYear: death_year ? +death_year : null,
      bio, photoUrl: photo_url,
      achievements: achievements || [],
      sortOrder: sort_order ? +sort_order : 0,
    },
  })
  res.status(201).json(m)
})

router.patch('/:id', authenticate, isAdmin, async (req, res) => {
  const { name, type, role, birth_year, death_year, bio, photo_url, achievements, is_published, sort_order } = req.body
  const m = await prisma.memorial.update({
    where: { id: req.params.id },
    data: {
      ...(name         !== undefined && { name }),
      ...(type         !== undefined && { type }),
      ...(role         !== undefined && { role }),
      ...(birth_year   !== undefined && { birthYear: birth_year ? +birth_year : null }),
      ...(death_year   !== undefined && { deathYear: death_year ? +death_year : null }),
      ...(bio          !== undefined && { bio }),
      ...(photo_url    !== undefined && { photoUrl: photo_url }),
      ...(achievements !== undefined && { achievements }),
      ...(is_published !== undefined && { isPublished: !!is_published }),
      ...(sort_order   !== undefined && { sortOrder: +sort_order }),
    },
  })
  res.json(m)
})

router.delete('/:id', authenticate, isAdmin, async (req, res) => {
  await prisma.memorial.delete({ where: { id: req.params.id } })
  res.json({ message: 'Deleted' })
})

module.exports = router
