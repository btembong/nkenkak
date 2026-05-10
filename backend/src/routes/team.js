const router = require('express').Router()
const { prisma } = require('../config/database')
const { authenticate, isAdmin } = require('../middleware/auth')
const { sendTeamApplicationConfirmation } = require('../services/email')

router.get('/', async (req, res) => {
  const { team } = req.query
  const members = await prisma.teamMember.findMany({
    where: { isActive: true, ...(team && { team }) },
    orderBy: { sortOrder: 'asc' },
  })
  res.json(members)
})

router.get('/:id', async (req, res) => {
  const member = await prisma.teamMember.findUnique({ where: { id: req.params.id } })
  if (!member || !member.isActive) return res.status(404).json({ error: 'Not found' })
  res.json(member)
})

router.post('/apply', async (req, res) => {
  const { full_name, email, phone, location, team_choice, skills, motivation } = req.body
  if (!full_name || !email || !team_choice) return res.status(400).json({ error: 'Name, email and team required' })
  await prisma.teamApplication.create({
    data: { fullName: full_name, email, phone, location, teamChoice: team_choice, skills, motivation },
  })
  sendTeamApplicationConfirmation({ to: email, fullName: full_name, teamChoice: team_choice }).catch(() => {})
  res.status(201).json({ message: 'Application submitted!' })
})

router.post('/', authenticate, isAdmin, async (req, res) => {
  const { name, role_title, team, bio, sort_order, avatar_url, facebook, twitter, linkedin, email, is_active } = req.body
  if (!name || !role_title || !team) return res.status(400).json({ error: 'Name, role and team required' })
  const member = await prisma.teamMember.create({
    data: { name, roleTitle: role_title, team, bio, sortOrder: sort_order ? +sort_order : 99,
            avatarUrl: avatar_url, facebook, twitter, linkedin, email,
            isActive: is_active !== false },
  })
  res.status(201).json(member)
})

router.patch('/:id', authenticate, isAdmin, async (req, res) => {
  const { name, role_title, team, bio, sort_order, avatar_url, facebook, twitter, linkedin, email, is_active } = req.body
  const member = await prisma.teamMember.update({
    where: { id: req.params.id },
    data: {
      ...(name       && { name }),
      ...(role_title && { roleTitle: role_title }),
      ...(team       && { team }),
      ...(bio        !== undefined && { bio }),
      ...(sort_order !== undefined && { sortOrder: +sort_order }),
      ...(avatar_url !== undefined && { avatarUrl: avatar_url }),
      ...(facebook   !== undefined && { facebook }),
      ...(twitter    !== undefined && { twitter }),
      ...(linkedin   !== undefined && { linkedin }),
      ...(email      !== undefined && { email }),
      ...(is_active  !== undefined && { isActive: !!is_active }),
    },
  })
  res.json(member)
})

router.delete('/:id', authenticate, isAdmin, async (req, res) => {
  await prisma.teamMember.delete({ where: { id: req.params.id } })
  res.json({ message: 'Deleted' })
})

module.exports = router
