const router  = require('express').Router()
const { prisma } = require('../config/database')
const { authenticate } = require('../middleware/auth')
const { sendPremiumConfirmation } = require('../services/email')

const FLW_SECRET = process.env.FLUTTERWAVE_SECRET_KEY
const CLIENT_URL = process.env.CLIENT_URL || 'http://localhost:5173'

const PLANS = {
  monthly: { name: 'Premium Monthly', amount: 2000,  currency: 'XAF', duration: 30  },
  yearly:  { name: 'Premium Yearly',  amount: 18000, currency: 'XAF', duration: 365 },
}

// POST /api/premium/initiate — create Flutterwave payment link
router.post('/initiate', authenticate, async (req, res) => {
  const { plan = 'monthly' } = req.body
  const selected = PLANS[plan]
  if (!selected) return res.status(400).json({ error: 'Invalid plan' })

  const { user } = req
  const txRef = `PRE-${user.id}-${Date.now()}`

  const flwRes = await fetch('https://api.flutterwave.com/v3/payments', {
    method: 'POST',
    headers: { Authorization: `Bearer ${FLW_SECRET}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({
      tx_ref:       txRef,
      amount:       selected.amount,
      currency:     selected.currency,
      // Flutterwave appends ?transaction_id=&tx_ref=&status= to this URL automatically
      redirect_url: `${CLIENT_URL}/jobs`,
      meta:         { userId: user.id, plan, duration: selected.duration },
      customer:     { email: user.email, name: `${user.firstName} ${user.lastName}` },
      customizations: {
        title:       'Nkenkak Premium',
        description: selected.name,
      },
    }),
  })

  const data = await flwRes.json()
  if (data.status !== 'success') return res.status(502).json({ error: 'Payment gateway error' })

  res.json({ link: data.data.link, txRef })
})

// POST /api/premium/verify — called by frontend after Flutterwave redirect
// Verifies the transaction directly with Flutterwave and activates premium
router.post('/verify', authenticate, async (req, res) => {
  const { transaction_id, tx_ref } = req.body
  if (!transaction_id && !tx_ref) {
    return res.status(400).json({ error: 'transaction_id or tx_ref required' })
  }

  // Verify with Flutterwave
  const verifyRes = await fetch(
    `https://api.flutterwave.com/v3/transactions/${transaction_id}/verify`,
    { headers: { Authorization: `Bearer ${FLW_SECRET}` } }
  )
  const { data: tx } = await verifyRes.json()

  if (!tx || tx.status !== 'successful') {
    return res.status(400).json({ error: 'Payment not successful' })
  }

  // Make sure this tx belongs to the logged-in user
  const userId = tx.meta?.userId || req.user.id
  if (userId !== req.user.id && req.user.role !== 'admin') {
    return res.status(403).json({ error: 'Unauthorized' })
  }

  // Check not already processed
  const existing = await prisma.user.findUnique({
    where: { id: userId },
    select: { isPremium: true, premiumUntil: true, email: true, firstName: true },
  })

  const plan     = tx.meta?.plan || 'monthly'
  const duration = tx.meta?.duration || 30
  const expiresAt = existing.isPremium && existing.premiumUntil && existing.premiumUntil > new Date()
    ? new Date(existing.premiumUntil.getTime() + duration * 24 * 60 * 60 * 1000) // extend if already premium
    : new Date(Date.now() + duration * 24 * 60 * 60 * 1000)

  await prisma.user.update({
    where: { id: userId },
    data:  { isPremium: true, premiumUntil: expiresAt },
  })

  // In-app notification
  prisma.notification.create({
    data: {
      userId,
      type:    'premium',
      title:   'Premium Activated!',
      message: `Your ${plan === 'yearly' ? 'Annual' : 'Monthly'} Premium is now active. Recruiter contacts and AI CV generator are unlocked.`,
      link:    '/jobs',
    },
  }).catch(() => {})

  // Confirmation email
  sendPremiumConfirmation({
    to:        existing.email,
    firstName: existing.firstName,
    plan,
    amount:    tx.amount,
    expiresAt,
  }).catch(() => {})

  res.json({ success: true, plan, expiresAt })
})

module.exports = router
