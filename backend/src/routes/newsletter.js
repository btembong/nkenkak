const router = require('express').Router()
const { prisma } = require('../config/database')
const { authenticate, isAdmin } = require('../middleware/auth')
const { sendNewsletterConfirmation, sendNewsletterCampaign } = require('../services/email')

router.post('/subscribe', async (req, res) => {
  const { email, name } = req.body
  if (!email) return res.status(400).json({ error: 'Email required' })

  // Check existing state BEFORE upsert so we know whether to send confirmation
  const existing = await prisma.newsletterSubscriber.findUnique({
    where: { email }, select: { isActive: true },
  })

  await prisma.newsletterSubscriber.upsert({
    where:  { email },
    update: { isActive: true, name: name || undefined },
    create: { email, name: name || null },
  })

  // Send confirmation for brand-new subscribers or re-activations
  const isNew        = !existing
  const wasInactive  = existing && !existing.isActive
  if (isNew || wasInactive) {
    sendNewsletterConfirmation({ to: email, name: name || null }).catch(() => {})
  }

  res.json({ message: 'Subscribed successfully' })
})

router.get('/unsubscribe', async (req, res) => {
  const { email } = req.query
  if (!email) return res.status(400).json({ error: 'Email required' })
  await prisma.newsletterSubscriber.updateMany({ where: { email }, data: { isActive: false } })
  res.json({ message: 'Unsubscribed' })
})

router.get('/subscribers', authenticate, isAdmin, async (req, res) => {
  const subs = await prisma.newsletterSubscriber.findMany({ orderBy: { createdAt: 'desc' } })
  res.json(subs)
})

router.post('/send', authenticate, isAdmin, async (req, res) => {
  const { subject, body } = req.body
  if (!subject || !body) return res.status(400).json({ error: 'Subject and body required' })
  const subs = await prisma.newsletterSubscriber.findMany({ where: { isActive: true } })
  if (subs.length === 0) return res.json({ message: 'No active subscribers', count: 0 })
  sendNewsletterCampaign({ subscribers: subs, subject, htmlBody: body }).catch(() => {})
  res.json({ message: `Campaign queued for ${subs.length} subscribers`, count: subs.length })
})

module.exports = router
