const router = require('express').Router()
const { prisma } = require('../config/database')
const bcrypt    = require('bcrypt')
const { authenticate } = require('../middleware/auth')

router.get('/profile', authenticate, async (req, res) => {
  const user = await prisma.user.findUnique({
    where: { id: req.user.id },
    select: { id:true, email:true, role:true, status:true, firstName:true, lastName:true,
              avatarUrl:true, phone:true, bio:true, country:true, city:true,
              villageQuarter:true, isDiaspora:true, newsletter:true, createdAt:true },
  })
  res.json(user)
})

router.patch('/profile', authenticate, async (req, res) => {
  const { first_name, last_name, phone, bio, country, city, village_quarter, is_diaspora, newsletter } = req.body
  const user = await prisma.user.update({
    where: { id: req.user.id },
    data: {
      ...(first_name       && { firstName: first_name }),
      ...(last_name        && { lastName:  last_name }),
      ...(phone            !== undefined && { phone }),
      ...(bio              !== undefined && { bio }),
      ...(country          && { country }),
      ...(city             !== undefined && { city }),
      ...(village_quarter  !== undefined && { villageQuarter: village_quarter }),
      ...(is_diaspora      !== undefined && { isDiaspora: !!is_diaspora }),
      ...(newsletter       !== undefined && { newsletter: !!newsletter }),
    },
    select: { id:true, email:true, firstName:true, lastName:true, role:true },
  })
  res.json(user)
})

// GET /api/users/directory — public member directory
router.get('/directory', async (req, res) => {
  const { search, country, is_diaspora, page = 1, limit = 24 } = req.query
  const where = {
    status: { in: ['active', 'pending'] },
    ...(search && { OR: [
      { firstName: { contains: search, mode: 'insensitive' } },
      { lastName:  { contains: search, mode: 'insensitive' } },
      { city:      { contains: search, mode: 'insensitive' } },
    ]}),
    ...(country     && { country }),
    ...(is_diaspora !== undefined && { isDiaspora: is_diaspora === 'true' }),
  }
  const [members, total] = await Promise.all([
    prisma.user.findMany({
      where,
      select: { id:true, firstName:true, lastName:true, avatarUrl:true,
                bio:true, city:true, country:true, villageQuarter:true, isDiaspora:true, createdAt:true },
      orderBy: { firstName: 'asc' },
      skip: (page - 1) * +limit,
      take: +limit,
    }),
    prisma.user.count({ where }),
  ])
  res.json({ members, total, pages: Math.ceil(total / +limit) })
})

router.patch('/change-password', authenticate, async (req, res) => {
  const { current_password, new_password } = req.body
  if (!current_password || !new_password) return res.status(400).json({ error: 'Both passwords required' })
  const user = await prisma.user.findUnique({ where: { id: req.user.id } })
  const ok = await bcrypt.compare(current_password, user.passwordHash)
  if (!ok) return res.status(400).json({ error: 'Current password incorrect' })
  const hash = await bcrypt.hash(new_password, 12)
  await prisma.user.update({ where: { id: req.user.id }, data: { passwordHash: hash } })
  res.json({ message: 'Password updated' })
})

module.exports = router
