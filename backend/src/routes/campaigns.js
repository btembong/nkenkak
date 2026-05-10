const router = require('express').Router()
const { prisma } = require('../config/database')
const { authenticate, isAdmin } = require('../middleware/auth')
const { sendNewsletter } = require('../services/email')

// GET /api/campaigns
router.get('/', authenticate, isAdmin, async (req, res) => {
  const campaigns = await prisma.emailCampaign.findMany({
    include: { author: { select: { firstName: true, lastName: true } } },
    orderBy: { createdAt: 'desc' },
  })
  res.json(campaigns)
})

// POST /api/campaigns
router.post('/', authenticate, isAdmin, async (req, res) => {
  const { subject, body, audience, scheduledAt } = req.body
  if (!subject || !body) return res.status(400).json({ error: 'subject and body required' })
  const campaign = await prisma.emailCampaign.create({
    data: { subject, body, audience: audience || 'all', status: scheduledAt ? 'scheduled' : 'draft', scheduledAt: scheduledAt ? new Date(scheduledAt) : null, authorId: req.user.id },
  })
  res.status(201).json(campaign)
})

// PATCH /api/campaigns/:id
router.patch('/:id', authenticate, isAdmin, async (req, res) => {
  const { subject, body, audience, scheduledAt, status } = req.body
  const campaign = await prisma.emailCampaign.update({
    where: { id: req.params.id },
    data: {
      ...(subject     !== undefined && { subject }),
      ...(body        !== undefined && { body }),
      ...(audience    !== undefined && { audience }),
      ...(status      !== undefined && { status }),
      ...(scheduledAt !== undefined && { scheduledAt: scheduledAt ? new Date(scheduledAt) : null }),
    },
  })
  res.json(campaign)
})

// POST /api/campaigns/:id/send — send immediately (background)
router.post('/:id/send', authenticate, isAdmin, async (req, res) => {
  const campaign = await prisma.emailCampaign.findUnique({ where: { id: req.params.id } })
  if (!campaign) return res.status(404).json({ error: 'Not found' })
  if (campaign.status === 'sent') return res.status(400).json({ error: 'Already sent' })

  // Mark as sending and respond immediately so the UI doesn't hang
  await prisma.emailCampaign.update({ where: { id: req.params.id }, data: { status: 'sending' } })
  res.json({ message: 'Campaign is being sent in the background', status: 'sending' })

  // Fire-and-forget in background
  ;(async () => {
    const where = { newsletter: true, status: { in: ['active', 'pending'] } }
    if (campaign.audience === 'diaspora') where.isDiaspora = true
    if (campaign.audience === 'local')    where.isDiaspora = false

    const users = await prisma.user.findMany({ where, select: { email: true, firstName: true } })

    // Send in parallel batches of 5
    const BATCH = 5
    let sent = 0
    for (let i = 0; i < users.length; i += BATCH) {
      const batch = users.slice(i, i + BATCH)
      const results = await Promise.allSettled(
        batch.map(u => sendNewsletter({ to: u.email, firstName: u.firstName, subject: campaign.subject, html: campaign.body }))
      )
      sent += results.filter(r => r.status === 'fulfilled').length
    }

    await prisma.emailCampaign.update({
      where: { id: req.params.id },
      data: { status: 'sent', sentAt: new Date(), recipientCount: sent },
    })
    console.log(`[Campaign] "${campaign.subject}" sent to ${sent}/${users.length} recipients`)
  })().catch(err => console.error('[Campaign error]', err.message))
})

// DELETE /api/campaigns/:id
router.delete('/:id', authenticate, isAdmin, async (req, res) => {
  await prisma.emailCampaign.delete({ where: { id: req.params.id } })
  res.json({ message: 'Deleted' })
})

module.exports = router
