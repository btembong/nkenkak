const router = require('express').Router()
const { prisma } = require('../config/database')
const { authenticate, isAdmin } = require('../middleware/auth')

const DAILY_API = 'https://api.daily.co/v1'
const DAILY_KEY = () => process.env.DAILY_API_KEY

async function dailyFetch(path, options = {}) {
  const res = await fetch(`${DAILY_API}${path}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${DAILY_KEY()}`,
      ...options.headers,
    },
  })
  if (!res.ok) {
    const err = await res.text()
    throw new Error(`Daily.co API error ${res.status}: ${err}`)
  }
  return res.json()
}

// ── Admin: list all rooms (must be before /:slug) ────────────
router.get('/admin/all', authenticate, isAdmin, async (req, res) => {
  const rooms = await prisma.liveRoom.findMany({
    include: { host: { select: { id: true, firstName: true, lastName: true } } },
    orderBy: { createdAt: 'desc' },
  })
  res.json(rooms)
})

// ── Public: list live & scheduled rooms ──────────────────────
router.get('/', async (req, res) => {
  const rooms = await prisma.liveRoom.findMany({
    where: { status: { in: ['scheduled', 'live'] } },
    include: { host: { select: { id: true, firstName: true, lastName: true, avatarUrl: true } } },
    orderBy: { scheduledAt: 'asc' },
  })
  res.json(rooms)
})

// ── Public: get single room by slug ─────────────────────────
router.get('/:slug', async (req, res) => {
  const room = await prisma.liveRoom.findUnique({
    where: { slug: req.params.slug },
    include: { host: { select: { id: true, firstName: true, lastName: true, avatarUrl: true } } },
  })
  if (!room) return res.status(404).json({ error: 'Room not found' })
  res.json(room)
})

// ── Authenticated: join a room (get Daily.co token) ──────────
router.post('/:slug/join', authenticate, async (req, res) => {
  const room = await prisma.liveRoom.findUnique({ where: { slug: req.params.slug } })
  if (!room) return res.status(404).json({ error: 'Room not found' })
  if (room.status === 'ended') return res.status(400).json({ error: 'This meeting has ended' })

  if (!DAILY_KEY() || !room.dailyRoomName) {
    return res.json({ url: room.dailyRoomUrl, roomName: room.dailyRoomName, noToken: true })
  }

  try {
    const token = await dailyFetch('/meeting-tokens', {
      method: 'POST',
      body: JSON.stringify({
        properties: {
          room_name: room.dailyRoomName,
          user_name: `${req.user.firstName} ${req.user.lastName}`,
          user_id: req.user.id,
          is_owner: room.hostId === req.user.id || req.user.role === 'admin' || req.user.role === 'leader',
          exp: Math.floor(Date.now() / 1000) + 60 * 120,
        },
      }),
    })
    res.json({ url: room.dailyRoomUrl, roomName: room.dailyRoomName, token: token.token })
  } catch (e) {
    console.error('Daily.co token error:', e.message)
    res.json({ url: room.dailyRoomUrl, roomName: room.dailyRoomName, noToken: true })
  }
})

// ── Admin: create room ───────────────────────────────────────
router.post('/', authenticate, isAdmin, async (req, res) => {
  const { name, slug, description, scheduledAt, isPrivate, maxParticipants } = req.body
  if (!name || !slug) return res.status(400).json({ error: 'Name and slug required' })

  let dailyRoomName = null
  let dailyRoomUrl  = null

  if (DAILY_KEY()) {
    try {
      const dailyRoom = await dailyFetch('/rooms', {
        method: 'POST',
        body: JSON.stringify({
          name: slug,
          privacy: isPrivate ? 'private' : 'public',
          properties: {
            enable_chat: true,
            enable_screenshare: true,
            ...(scheduledAt && {
              exp: Math.floor(new Date(scheduledAt).getTime() / 1000) + 60 * 240,
            }),
          },
        }),
      })
      dailyRoomName = dailyRoom.name
      dailyRoomUrl  = dailyRoom.url
    } catch (e) {
      console.error('Daily.co room creation error:', e.message)
    }
  }

  const room = await prisma.liveRoom.create({
    data: {
      name, slug, description,
      dailyRoomName, dailyRoomUrl,
      hostId: req.user.id,
      scheduledAt: scheduledAt ? new Date(scheduledAt) : null,
      isPrivate: !!isPrivate,
      maxParticipants: maxParticipants ? parseInt(maxParticipants) : null,
      status: 'scheduled',
    },
    include: { host: { select: { id: true, firstName: true, lastName: true } } },
  })
  res.status(201).json(room)
})

// ── Admin: update room ───────────────────────────────────────
router.patch('/:id', authenticate, isAdmin, async (req, res) => {
  const { name, description, status, scheduledAt, isPrivate, maxParticipants } = req.body
  const room = await prisma.liveRoom.update({
    where: { id: req.params.id },
    data: {
      ...(name            !== undefined && { name }),
      ...(description     !== undefined && { description }),
      ...(status          !== undefined && { status, endedAt: status === 'ended' ? new Date() : undefined }),
      ...(scheduledAt     !== undefined && { scheduledAt: scheduledAt ? new Date(scheduledAt) : null }),
      ...(isPrivate       !== undefined && { isPrivate }),
      ...(maxParticipants !== undefined && { maxParticipants: parseInt(maxParticipants) }),
    },
  })
  res.json(room)
})

// ── Admin: delete room ───────────────────────────────────────
router.delete('/:id', authenticate, isAdmin, async (req, res) => {
  const room = await prisma.liveRoom.findUnique({ where: { id: req.params.id } })
  if (!room) return res.status(404).json({ error: 'Not found' })

  if (room.dailyRoomName && DAILY_KEY()) {
    try {
      await dailyFetch(`/rooms/${room.dailyRoomName}`, { method: 'DELETE' })
    } catch (e) {
      console.warn('Daily.co delete error:', e.message)
    }
  }

  await prisma.liveRoom.delete({ where: { id: req.params.id } })
  res.json({ message: 'Deleted' })
})

module.exports = router
