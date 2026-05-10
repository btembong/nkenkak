const router   = require('express').Router()
const { prisma } = require('../config/database')
const { authenticate, isAdmin } = require('../middleware/auth')
const { sendDonationReceipt, sendPremiumConfirmation } = require('../services/email')

/* ── Initiate donation + return Flutterwave config ── */
router.post('/initiate', async (req, res) => {
  const { project_id, amount, provider, donor_name, donor_email, donor_phone, message, is_anonymous } = req.body
  const finalAmount = +amount
  if (!finalAmount || finalAmount < 100) return res.status(400).json({ error: 'Minimum donation is 100 XAF' })
  if (!donor_email)  return res.status(400).json({ error: 'Email is required' })
  if (!donor_name)   return res.status(400).json({ error: 'Name is required' })

  const reference = `NK-${Date.now()}-${Math.random().toString(36).slice(2,6).toUpperCase()}`

  const donation = await prisma.donation.create({
    data: {
      reference,
      providerRef: reference,
      projectId:  project_id || null,
      amount:     finalAmount,
      currency:   'XAF',
      provider:   provider || 'flutterwave',
      status:     'pending',
      donorName:  donor_name,
      donorEmail: donor_email,
      donorPhone: donor_phone,
      message,
      isAnonymous: !!is_anonymous,
    },
  })

  const rawKey = process.env.FLUTTERWAVE_PUBLIC_KEY || ''
  const flwKey = rawKey.startsWith('FLWPUBK') && !rawKey.includes('your-') ? rawKey : null

  res.status(201).json({
    reference:       donation.reference,
    tx_ref:          reference,
    flw_public_key:  flwKey,
    amount:          finalAmount,
    currency:        'XAF',
  })
})

/* ── Verify payment after Flutterwave callback ── */
router.post('/verify', async (req, res) => {
  const { tx_ref, transaction_id } = req.body
  if (!tx_ref) return res.status(400).json({ error: 'tx_ref required' })

  const donation = await prisma.donation.findFirst({ where: { providerRef: tx_ref } })
  if (!donation)                       return res.status(404).json({ error: 'Donation not found' })
  if (donation.status === 'completed') return res.json({ status: 'completed', reference: donation.reference })

  // Verify with Flutterwave API if real key is configured
  const rawSecret = process.env.FLUTTERWAVE_SECRET_KEY || ''
  const hasRealSecret = rawSecret.startsWith('FLWSECK') && !rawSecret.includes('your-')
  if (hasRealSecret && transaction_id) {
    try {
      const flwRes  = await fetch(`https://api.flutterwave.com/v3/transactions/${transaction_id}/verify`, {
        headers: { Authorization: `Bearer ${rawSecret}` },
      })
      const flwData = await flwRes.json()

      if (
        flwData.status === 'success' &&
        flwData.data?.status === 'successful' &&
        Number(flwData.data.amount) >= Number(donation.amount)
      ) {
        await _markCompleted(donation)
        return res.json({ status: 'completed', reference: donation.reference })
      }
      return res.json({ status: 'pending' })
    } catch (err) {
      console.error('Flutterwave verify error:', err.message)
    }
  }

  // Fallback when no secret key (dev/test mode)
  await _markCompleted(donation)
  res.json({ status: 'completed', reference: donation.reference })
})

/* ── Flutterwave webhook (shared — handles donations + premium) ── */
router.post('/webhook', async (req, res) => {
  const secretHash = process.env.FLW_SECRET_HASH
  if (secretHash) {
    const sig = req.headers['verif-hash']
    if (sig !== secretHash) return res.status(401).end()
  }
  const { event, data } = req.body
  if (event === 'charge.completed' && data?.status === 'successful') {
    if (data.tx_ref?.startsWith('PRE-')) {
      // ── Premium subscription payment ──
      try {
        const verifyRes = await fetch(`https://api.flutterwave.com/v3/transactions/${data.id}/verify`, {
          headers: { Authorization: `Bearer ${process.env.FLUTTERWAVE_SECRET_KEY}` },
        })
        const tx = (await verifyRes.json()).data
        if (tx.status === 'successful' && tx.meta?.userId) {
          const plan     = tx.meta.plan || 'monthly'
          const duration = tx.meta.duration || 30
          const expiresAt = new Date(Date.now() + duration * 24 * 60 * 60 * 1000)
          const updatedUser = await prisma.user.update({
            where:  { id: tx.meta.userId },
            data:   { isPremium: true, premiumUntil: expiresAt },
            select: { email: true, firstName: true },
          })
          // In-app notification
          prisma.notification.create({
            data: {
              userId:  tx.meta.userId,
              type:    'premium',
              title:   'Premium Activated!',
              message: `Your ${plan === 'yearly' ? 'Annual' : 'Monthly'} Premium is now active. Recruiter contacts and AI CV generator are unlocked.`,
              link:    '/jobs',
            },
          }).catch(() => {})
          // Confirmation email
          sendPremiumConfirmation({
            to:        updatedUser.email,
            firstName: updatedUser.firstName,
            plan,
            amount:    tx.amount,
            expiresAt,
          }).catch(() => {})
        }
      } catch (e) { console.error('Premium webhook error:', e.message) }
    } else {
      // ── Donation payment ──
      const donation = await prisma.donation.findFirst({ where: { providerRef: data.tx_ref } })
      if (donation && donation.status !== 'completed') await _markCompleted(donation)
    }
  }
  res.status(200).end()
})

/* ── Helper ── */
async function _markCompleted(donation) {
  await prisma.donation.update({ where: { id: donation.id }, data: { status: 'completed' } })

  let projectTitle = null
  if (donation.projectId) {
    const project = await prisma.project.update({
      where: { id: donation.projectId },
      data: { raisedAmount: { increment: donation.amount }, donorCount: { increment: 1 } },
      select: { title: true },
    })
    projectTitle = project.title
  }

  // In-app notification for logged-in donors
  if (donation.userId) {
    await prisma.notification.create({
      data: {
        userId:  donation.userId,
        type:    'donation',
        title:   'Donation Confirmed ✓',
        message: `Your donation of ${Number(donation.amount).toLocaleString()} XAF has been received.${projectTitle ? ` Thank you for supporting "${projectTitle}".` : ' Thank you for supporting the village fund.'}`,
        link:    '/portal/donations',
      },
    }).catch(() => {})
  }

  // Receipt email to donor
  if (donation.donorEmail) {
    sendDonationReceipt({
      to:           donation.donorEmail,
      donorName:    donation.donorName || 'Supporter',
      amount:       Number(donation.amount),
      reference:    donation.reference,
      projectTitle: projectTitle,
      date:         new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' }),
    }).catch(() => {})
  }
}

/* ── Member: my donations ── */
router.get('/my', authenticate, async (req, res) => {
  const donations = await prisma.donation.findMany({
    where:   { userId: req.user.id },
    include: { project: { select: { title: true } } },
    orderBy: { createdAt: 'desc' },
  })
  res.json(donations.map(d => ({ ...d, project_title: d.project?.title })))
})

/* ── Admin: summary ── */
router.get('/summary', authenticate, isAdmin, async (req, res) => {
  const start = new Date(new Date().getFullYear(), new Date().getMonth(), 1)
  const [total, completed, pending, raisedAgg, thisMonth] = await Promise.all([
    prisma.donation.count(),
    prisma.donation.count({ where: { status: 'completed' } }),
    prisma.donation.count({ where: { status: 'pending' } }),
    prisma.donation.aggregate({ _sum: { amount: true }, where: { status: 'completed' } }),
    prisma.donation.aggregate({ _sum: { amount: true }, where: { status: 'completed', createdAt: { gte: start } } }),
  ])
  const donors = await prisma.donation.findMany({
    where: { status: 'completed' }, select: { donorEmail: true }, distinct: ['donorEmail'],
  })
  res.json({
    total_donations: total, completed, pending,
    total_raised:    raisedAgg._sum.amount  || 0,
    this_month:      thisMonth._sum.amount  || 0,
    unique_donors:   donors.length,
  })
})

/* ── Admin: list ── */
router.get('/', authenticate, isAdmin, async (req, res) => {
  const { status, limit = 100 } = req.query
  const donations = await prisma.donation.findMany({
    where:   { ...(status && status !== 'all' && { status }) },
    include: { project: { select: { title: true } }, user: { select: { firstName: true, lastName: true } } },
    orderBy: { createdAt: 'desc' },
    take:    +limit,
  })
  res.json(donations.map(d => ({
    ...d,
    project_title: d.project?.title,
    user_name:     d.user ? `${d.user.firstName} ${d.user.lastName}` : null,
  })))
})

/* ── Admin: update status ── */
router.patch('/:id', authenticate, isAdmin, async (req, res) => {
  const { status } = req.body
  const donation = await prisma.donation.update({ where: { id: req.params.id }, data: { status } })
  if (status === 'completed' && donation.projectId) await _markCompleted(donation)
  res.json(donation)
})

module.exports = router
