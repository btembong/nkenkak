const router = require('express').Router()
const { prisma } = require('../config/database')
const { authenticate } = require('../middleware/auth')
const { sendPush } = require('./push')

// GET /api/messages/conversations — list all conversations for logged-in user
router.get('/conversations', authenticate, async (req, res) => {
  const uid = req.user.id
  // Get latest message per conversation partner
  const sent = await prisma.directMessage.findMany({
    where: { senderId: uid },
    orderBy: { createdAt: 'desc' },
    include: { recipient: { select: { id: true, firstName: true, lastName: true, avatarUrl: true } } },
  })
  const received = await prisma.directMessage.findMany({
    where: { recipientId: uid },
    orderBy: { createdAt: 'desc' },
    include: { sender: { select: { id: true, firstName: true, lastName: true, avatarUrl: true } } },
  })

  // Build conversation map keyed by partner id
  const map = new Map()
  sent.forEach(m => {
    const pid = m.recipientId
    if (!map.has(pid) || m.createdAt > map.get(pid).lastAt) {
      map.set(pid, { partner: m.recipient, lastMessage: m.content, lastAt: m.createdAt, unread: 0 })
    }
  })
  received.forEach(m => {
    const pid = m.senderId
    const existing = map.get(pid)
    if (!existing || m.createdAt > existing.lastAt) {
      map.set(pid, { partner: m.sender, lastMessage: m.content, lastAt: m.createdAt, unread: m.isRead ? 0 : 1 })
    } else if (!m.isRead) {
      existing.unread = (existing.unread || 0) + 1
    }
  })

  const conversations = [...map.values()].sort((a, b) => b.lastAt - a.lastAt)
  res.json(conversations)
})

// GET /api/messages/:partnerId — thread with one user
router.get('/:partnerId', authenticate, async (req, res) => {
  const uid = req.user.id
  const pid = req.params.partnerId
  const messages = await prisma.directMessage.findMany({
    where: {
      OR: [
        { senderId: uid, recipientId: pid },
        { senderId: pid, recipientId: uid },
      ],
    },
    include: { sender: { select: { id: true, firstName: true, lastName: true, avatarUrl: true } } },
    orderBy: { createdAt: 'asc' },
    take: 200,
  })
  // Mark received as read
  await prisma.directMessage.updateMany({
    where: { senderId: pid, recipientId: uid, isRead: false },
    data: { isRead: true },
  })
  res.json(messages)
})

// POST /api/messages/:partnerId — send a message
router.post('/:partnerId', authenticate, async (req, res) => {
  const { content } = req.body
  if (!content?.trim()) return res.status(400).json({ error: 'content required' })
  const partner = await prisma.user.findUnique({ where: { id: req.params.partnerId }, select: { id: true } })
  if (!partner) return res.status(404).json({ error: 'User not found' })
  const msg = await prisma.directMessage.create({
    data: { senderId: req.user.id, recipientId: req.params.partnerId, content: content.trim() },
    include: { sender: { select: { id: true, firstName: true, lastName: true, avatarUrl: true } } },
  })

  // Push notification to recipient
  try {
    const senderName = `${req.user.firstName} ${req.user.lastName}`
    const preview = content.length > 60 ? content.slice(0, 57) + '…' : content
    await sendPush(
      { title: `New message from ${senderName}`, body: preview, url: `/portal/messages?partner=${req.user.id}` },
      [req.params.partnerId],
    )
  } catch { /* push not critical */ }

  res.status(201).json(msg)
})

// GET /api/messages/unread/count
router.get('/unread/count', authenticate, async (req, res) => {
  const count = await prisma.directMessage.count({ where: { recipientId: req.user.id, isRead: false } })
  res.json({ count })
})

module.exports = router
