const router  = require('express').Router()
const webpush = require('web-push')
const { prisma } = require('../config/database')
const { authenticate, isAdmin } = require('../middleware/auth')

webpush.setVapidDetails(
  process.env.VAPID_EMAIL || 'mailto:admin@nkenkak-ngiesang.cm',
  process.env.VAPID_PUBLIC_KEY,
  process.env.VAPID_PRIVATE_KEY,
)

// GET /api/push/vapid-key — public key for browser subscription
router.get('/vapid-key', (req, res) => {
  res.json({ publicKey: process.env.VAPID_PUBLIC_KEY })
})

// POST /api/push/subscribe — save subscription
router.post('/subscribe', authenticate, async (req, res) => {
  const { endpoint, keys } = req.body
  if (!endpoint || !keys?.p256dh || !keys?.auth) {
    return res.status(400).json({ error: 'Invalid subscription object' })
  }
  await prisma.pushSubscription.upsert({
    where:  { endpoint },
    update: { p256dh: keys.p256dh, auth: keys.auth },
    create: { userId: req.user.id, endpoint, p256dh: keys.p256dh, auth: keys.auth },
  })
  res.json({ ok: true })
})

// DELETE /api/push/unsubscribe
router.delete('/unsubscribe', authenticate, async (req, res) => {
  const { endpoint } = req.body
  if (endpoint) {
    await prisma.pushSubscription.deleteMany({ where: { endpoint, userId: req.user.id } })
  }
  res.json({ ok: true })
})

// GET /api/push/stats — admin: subscriber count + recent sends
router.get('/stats', authenticate, isAdmin, async (req, res) => {
  const total = await prisma.pushSubscription.count()
  let history = []
  try { history = await prisma.pushLog.findMany({ orderBy: { createdAt: 'desc' }, take: 20 }) }
  catch { /* pushLog table not yet in client — ignore */ }
  res.json({ total, history })
})

// POST /api/push/send — admin: send custom push
router.post('/send', authenticate, isAdmin, async (req, res) => {
  const { title, body, url = '/', target = 'all', userIds } = req.body
  if (!title || !body) return res.status(400).json({ error: 'Title and body required' })

  const ids = target === 'specific' && Array.isArray(userIds) && userIds.length ? userIds : null
  const count = await sendPush({ title, body, url }, ids)

  try {
    await prisma.pushLog.create({
      data: { title, body, url, target, sentBy: req.user.id, recipientCount: count },
    })
  } catch { /* ignore if model not yet generated */ }

  res.json({ ok: true, sent: count })
})

// Internal helper — send to all subscribers (or specific users); returns sent count
async function sendPush(payload, userIds = null) {
  const where = userIds ? { userId: { in: userIds } } : {}
  const subs = await prisma.pushSubscription.findMany({ where })
  const dead = []
  let sent = 0
  await Promise.allSettled(
    subs.map(async s => {
      try {
        await webpush.sendNotification(
          { endpoint: s.endpoint, keys: { p256dh: s.p256dh, auth: s.auth } },
          JSON.stringify(payload),
        )
        sent++
      } catch (err) {
        if (err.statusCode === 410 || err.statusCode === 404) dead.push(s.endpoint)
      }
    }),
  )
  if (dead.length) {
    await prisma.pushSubscription.deleteMany({ where: { endpoint: { in: dead } } })
  }
  return sent
}

module.exports = router
module.exports.sendPush = sendPush
