const router = require('express').Router()
const { prisma } = require('../config/database')
const { authenticate, isAdmin } = require('../middleware/auth')
const { sendContactAutoReply, sendContactAdminAlert } = require('../services/email')

router.post('/', async (req, res) => {
  const { name, email, phone, subject, message } = req.body
  if (!name || !email || !message) return res.status(400).json({ error: 'Name, email and message required' })
  await prisma.contactMessage.create({
    data: { name, email, phone, subject, message, ipAddress: req.ip },
  })
  sendContactAutoReply({ to: email, name, subject: subject || 'General Inquiry' }).catch(() => {})
  sendContactAdminAlert({ name, email, phone, subject: subject || 'General Inquiry', message }).catch(() => {})
  res.status(201).json({ message: 'Message received! We will respond within 48 hours.' })
})

router.get('/', authenticate, isAdmin, async (req, res) => {
  const { status } = req.query
  const messages = await prisma.contactMessage.findMany({
    where: { ...(status && status !== 'all' && { status }) },
    orderBy: { createdAt: 'desc' },
    take: 200,
  })
  res.json(messages)
})

router.patch('/:id', authenticate, isAdmin, async (req, res) => {
  const { status, reply_note } = req.body
  const msg = await prisma.contactMessage.update({
    where: { id: req.params.id },
    data: {
      ...(status     && { status }),
      ...(reply_note !== undefined && { replyNote: reply_note }),
      ...(status === 'replied' && { repliedAt: new Date(), repliedBy: req.user.id }),
    },
  })
  res.json(msg)
})

router.delete('/:id', authenticate, isAdmin, async (req, res) => {
  await prisma.contactMessage.delete({ where: { id: req.params.id } })
  res.json({ message: 'Deleted' })
})

module.exports = router
