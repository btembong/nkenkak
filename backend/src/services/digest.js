const { prisma } = require('../config/database')
const { sendNewsletter } = require('./email')

/**
 * Build and send the weekly community digest email.
 * Called by node-cron every Monday at 08:00.
 */
async function sendWeeklyDigest() {
  const since = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)

  const [news, events, projects] = await Promise.all([
    prisma.news.findMany({ where: { status: 'published', publishedAt: { gte: since } }, orderBy: { publishedAt: 'desc' }, take: 5, select: { title: true, excerpt: true, slug: true, coverImage: true } }),
    prisma.event.findMany({ where: { isPublished: true, startDate: { gte: new Date() } }, orderBy: { startDate: 'asc' }, take: 3, select: { title: true, startDate: true, location: true, slug: true, coverImage: true } }),
    prisma.project.findMany({ where: { status: 'active' }, orderBy: { raisedAmount: 'desc' }, take: 3, select: { title: true, raisedAmount: true, goalAmount: true, slug: true, coverImage: true } }),
  ])

  if (!news.length && !events.length) {
    console.log('[Digest] Nothing new this week — skipping')
    return
  }

  const baseUrl = process.env.CLIENT_URL || 'http://localhost:5173'

  const newsHtml = news.map(a => `
    <tr><td style="padding:8px 0;border-bottom:1px solid #f0ebf8">
      <a href="${baseUrl}/news/${a.slug}" style="font-weight:700;color:#5B2D8E;text-decoration:none;font-size:14px">${a.title}</a>
      <p style="margin:4px 0 0;color:#737373;font-size:12px">${a.excerpt || ''}</p>
    </td></tr>`).join('')

  const eventsHtml = events.map(e => `
    <tr><td style="padding:8px 0;border-bottom:1px solid #f0ebf8">
      <a href="${baseUrl}/events/${e.slug}" style="font-weight:700;color:#5B2D8E;text-decoration:none;font-size:14px">${e.title}</a>
      <p style="margin:4px 0 0;color:#737373;font-size:12px">${new Date(e.startDate).toLocaleDateString('en-GB',{weekday:'long',day:'numeric',month:'long'})}${e.location ? ' · ' + e.location : ''}</p>
    </td></tr>`).join('')

  const projectsHtml = projects.map(p => {
    const pct = p.goalAmount > 0 ? Math.round((p.raisedAmount / p.goalAmount) * 100) : 0
    return `<tr><td style="padding:8px 0;border-bottom:1px solid #f0ebf8">
      <a href="${baseUrl}/projects/${p.slug}" style="font-weight:700;color:#5B2D8E;text-decoration:none;font-size:14px">${p.title}</a>
      <p style="margin:4px 0 0;color:#737373;font-size:12px">${pct}% funded · ${Number(p.raisedAmount).toLocaleString()} XAF raised</p>
    </td></tr>`
  }).join('')

  const html = `
  <div style="font-family:Poppins,sans-serif;max-width:600px;margin:0 auto;background:#F9F7FD">
    <div style="background:linear-gradient(135deg,#1A0A35,#5B2D8E);padding:40px 32px;text-align:center">
      <h1 style="color:#fff;font-size:22px;margin:0 0 6px">Nkenkak-Ngiesang Weekly Digest</h1>
      <p style="color:rgba(255,255,255,0.65);font-size:13px;margin:0">Your weekly summary of community news &amp; events</p>
    </div>
    <div style="padding:32px">
      ${news.length ? `<h2 style="color:#1A0A35;font-size:15px;margin:0 0 12px">📰 Latest News</h2><table width="100%" cellpadding="0" cellspacing="0">${newsHtml}</table>` : ''}
      ${events.length ? `<h2 style="color:#1A0A35;font-size:15px;margin:24px 0 12px">📅 Upcoming Events</h2><table width="100%" cellpadding="0" cellspacing="0">${eventsHtml}</table>` : ''}
      ${projects.length ? `<h2 style="color:#1A0A35;font-size:15px;margin:24px 0 12px">🌱 Active Projects</h2><table width="100%" cellpadding="0" cellspacing="0">${projectsHtml}</table>` : ''}
      <div style="margin-top:32px;text-align:center">
        <a href="${baseUrl}" style="background:#5B2D8E;color:#fff;padding:12px 28px;border-radius:24px;text-decoration:none;font-weight:700;font-size:13px">Visit Community Portal</a>
      </div>
    </div>
    <div style="padding:20px 32px;text-align:center;border-top:1px solid #e8e0f0">
      <p style="color:#A3A3A3;font-size:11px;margin:0">You're receiving this because you subscribed to community updates. <a href="${baseUrl}/portal/profile" style="color:#5B2D8E">Unsubscribe</a></p>
    </div>
  </div>`

  // Send to all newsletter subscribers
  const subscribers = await prisma.user.findMany({
    where: { newsletter: true, status: { in: ['active', 'pending'] } },
    select: { email: true, firstName: true },
  })

  let sent = 0
  for (const sub of subscribers) {
    try {
      await sendNewsletter({ to: sub.email, firstName: sub.firstName, subject: `Nkenkak-Ngiesang Weekly Digest — ${new Date().toLocaleDateString('en-GB',{day:'numeric',month:'long'})}`, html })
      sent++
    } catch {}
  }
  console.log(`[Digest] Sent to ${sent}/${subscribers.length} subscribers`)
}

/**
 * Process scheduled email campaigns that are due.
 */
async function processScheduledCampaigns() {
  const due = await prisma.emailCampaign.findMany({
    where: { status: 'scheduled', scheduledAt: { lte: new Date() } },
  })
  for (const c of due) {
    const where = { newsletter: true, status: { in: ['active', 'pending'] } }
    if (c.audience === 'diaspora') where.isDiaspora = true
    if (c.audience === 'local')    where.isDiaspora = false
    const users = await prisma.user.findMany({ where, select: { email: true, firstName: true } })
    let sent = 0
    for (const u of users) {
      try { await sendNewsletter({ to: u.email, firstName: u.firstName, subject: c.subject, html: c.body }); sent++ } catch {}
    }
    await prisma.emailCampaign.update({ where: { id: c.id }, data: { status: 'sent', sentAt: new Date(), recipientCount: sent } })
    console.log(`[Campaign] "${c.subject}" sent to ${sent} recipients`)
  }
}

module.exports = { sendWeeklyDigest, processScheduledCampaigns }
