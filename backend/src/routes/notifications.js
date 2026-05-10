const router = require('express').Router()
const { prisma } = require('../config/database')
const { authenticate } = require('../middleware/auth')

router.get('/', authenticate, async (req, res) => {
  const notifs = await prisma.notification.findMany({
    where: { userId: req.user.id },
    orderBy: { createdAt: 'desc' },
    take: 30,
  })
  res.json(notifs)
})

router.patch('/read-all', authenticate, async (req, res) => {
  await prisma.notification.updateMany({ where: { userId: req.user.id }, data: { isRead: true } })
  res.json({ message: 'All marked read' })
})

router.patch('/:id/read', authenticate, async (req, res) => {
  const notif = await prisma.notification.update({
    where: { id: req.params.id }, data: { isRead: true },
  })
  res.json(notif)
})

router.delete('/:id', authenticate, async (req, res) => {
  await prisma.notification.delete({ where: { id: req.params.id } })
  res.json({ message: 'Deleted' })
})

module.exports = router
