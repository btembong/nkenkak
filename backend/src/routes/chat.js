const router = require('express').Router()
const { prisma } = require('../config/database')
const { authenticate, isAdmin } = require('../middleware/auth')

// GET /api/chat/rooms
router.get('/rooms', async (req, res) => {
  const rooms = await prisma.chatRoom.findMany({
    where: { isPublic: true },
    orderBy: { sortOrder: 'asc' },
    include: { _count: { select: { messages: { where: { isDeleted: false } } } } },
  })
  res.json(rooms)
})

// GET /api/chat/rooms/:slug/messages
router.get('/rooms/:slug/messages', async (req, res) => {
  const room = await prisma.chatRoom.findUnique({ where: { slug: req.params.slug } })
  if (!room) return res.status(404).json({ error: 'Room not found' })
  const messages = await prisma.chatMessage.findMany({
    where: { roomId: room.id, isDeleted: false },
    include: { user: { select: { id: true, firstName: true, lastName: true, avatarUrl: true, role: true } } },
    orderBy: { createdAt: 'asc' },
    take: 100,
  })
  res.json({ room, messages })
})

// POST /api/chat/rooms — admin
router.post('/rooms', authenticate, isAdmin, async (req, res) => {
  const { name, slug, description, icon, color, isPublic, sortOrder } = req.body
  if (!name || !slug) return res.status(400).json({ error: 'name and slug required' })
  const room = await prisma.chatRoom.create({
    data: { name, slug, description, icon: icon || 'fa-comments', color: color || '#5B2D8E', isPublic: isPublic !== false, sortOrder: +sortOrder || 0 },
  })
  res.status(201).json(room)
})

// PATCH /api/chat/rooms/:id — admin
router.patch('/rooms/:id', authenticate, isAdmin, async (req, res) => {
  const { name, description, icon, color, isPublic, sortOrder } = req.body
  const room = await prisma.chatRoom.update({
    where: { id: req.params.id },
    data: {
      ...(name        !== undefined && { name }),
      ...(description !== undefined && { description }),
      ...(icon        !== undefined && { icon }),
      ...(color       !== undefined && { color }),
      ...(isPublic    !== undefined && { isPublic: !!isPublic }),
      ...(sortOrder   !== undefined && { sortOrder: +sortOrder }),
    },
  })
  res.json(room)
})

// DELETE /api/chat/rooms/:id — admin
router.delete('/rooms/:id', authenticate, isAdmin, async (req, res) => {
  await prisma.chatRoom.delete({ where: { id: req.params.id } })
  res.json({ message: 'Deleted' })
})

// DELETE /api/chat/messages/:id — admin (soft delete)
router.delete('/messages/:id', authenticate, isAdmin, async (req, res) => {
  await prisma.chatMessage.update({ where: { id: req.params.id }, data: { isDeleted: true, content: '[message removed]' } })
  res.json({ message: 'Removed' })
})

module.exports = router
