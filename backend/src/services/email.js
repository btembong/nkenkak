const nodemailer = require('nodemailer')

const transporter = nodemailer.createTransport({
  host:   process.env.SMTP_HOST || 'smtp.gmail.com',
  port:   parseInt(process.env.SMTP_PORT || '587'),
  secure: false,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
})

const FROM         = `"Nkenkak-Ngiesang Development Council" <${process.env.SMTP_USER}>`
const CLIENT       = process.env.CLIENT_URL || 'http://localhost:5173'
const ADMIN_EMAIL  = process.env.SMTP_USER
const LOGO_URL     = 'https://res.cloudinary.com/dmxnsttmu/image/upload/v1778254134/nkek-logo_jdaxf8.png'

/* ─────────────────────────────────────────────────────────────
   BASE EMAIL WRAPPER
   Clean white layout, purple/gold brand, real logo in header
───────────────────────────────────────────────────────────────*/
const wrap = (content, preheader = '') => `
<!DOCTYPE html>
<html lang="en" xmlns="http://www.w3.org/1999/xhtml">
<head>
<meta charset="UTF-8"/>
<meta name="viewport" content="width=device-width,initial-scale=1"/>
<meta http-equiv="X-UA-Compatible" content="IE=edge"/>
<title>Nkenkak-Ngiesang</title>
<!--[if mso]><noscript><xml><o:OfficeDocumentSettings><o:PixelsPerInch>96</o:PixelsPerInch></o:OfficeDocumentSettings></xml></noscript><![endif]-->
<style>
  *{box-sizing:border-box;margin:0;padding:0;}
  body{font-family:'Segoe UI',Helvetica,Arial,sans-serif;background:#EDE8F5;color:#1A0A35;-webkit-font-smoothing:antialiased;}
  a{color:#5B2D8E;text-decoration:none;}
  img{max-width:100%;border:0;display:block;}

  .outer{background:#EDE8F5;padding:40px 16px 56px;}
  .wrapper{max-width:620px;margin:0 auto;border-radius:24px;overflow:hidden;box-shadow:0 8px 48px rgba(26,10,53,0.18);}

  /* ── Header ── */
  .hd{background:#fff;padding:0;text-align:center;position:relative;}
  .hd-top{background:linear-gradient(160deg,#F3EEFF 0%,#EDE5FF 50%,#F8F4FF 100%);padding:44px 40px 36px;position:relative;overflow:hidden;border-bottom:1px solid rgba(91,45,142,0.1);}
  .hd-top::before{content:'';position:absolute;top:-50px;left:-50px;width:200px;height:200px;border-radius:50%;background:radial-gradient(circle,rgba(91,45,142,0.08),transparent 70%);}
  .hd-top::after{content:'';position:absolute;bottom:-30px;right:-30px;width:160px;height:160px;border-radius:50%;background:radial-gradient(circle,rgba(123,77,184,0.08),transparent 70%);}
  .hd-badge{display:inline-block;background:rgba(91,45,142,0.1);border:1px solid rgba(91,45,142,0.22);border-radius:100px;padding:5px 16px;font-size:10px;font-weight:700;color:#5B2D8E;letter-spacing:2.5px;text-transform:uppercase;margin-top:0;margin-bottom:16px;position:relative;z-index:1;}
  .hd-logo{width:100%;max-width:320px;height:auto;border-radius:0;margin:0 auto -8px;display:block;}
  .hd-name{font-size:20px;font-weight:800;color:#1A0A35;letter-spacing:-0.3px;position:relative;z-index:1;line-height:1.15;font-family:'Segoe UI',Helvetica,Arial,sans-serif;}
  .hd-name span{color:#5B2D8E;}
  .hd-sub{font-size:11px;color:#9B8FB0;font-weight:600;letter-spacing:1.5px;text-transform:uppercase;position:relative;z-index:1;margin-top:5px;}
  .hd-bar{height:3px;background:linear-gradient(90deg,#5B2D8E,#9B6BD4,#F0A500,#FFB84D);}

  /* ── Body ── */
  .bd{background:linear-gradient(160deg,#F3EEFF 0%,#EDE5FF 50%,#F8F4FF 100%);padding:44px 44px 36px;}
  .bd h2{font-size:23px;font-weight:800;color:#1A0A35;margin-bottom:6px;line-height:1.25;letter-spacing:-0.3px;}
  .bd .subhead{font-size:14px;color:#8B7AA8;margin-bottom:28px;line-height:1.75;border-bottom:1px solid #F3EFF9;padding-bottom:20px;}
  .bd p{font-size:14px;line-height:1.85;color:#4A3F5C;margin-bottom:16px;}

  /* Highlight box */
  .hl{border-radius:14px;padding:20px 24px;margin:22px 0;}
  .hl-purple{background:#F5F0FF;border-left:4px solid #5B2D8E;}
  .hl-gold{background:#FFFBEB;border-left:4px solid #F0A500;}
  .hl-green{background:#F0FDF4;border-left:4px solid #16a34a;}
  .hl-red{background:#FFF5F5;border-left:4px solid #dc2626;}
  .hl strong{color:#1A0A35;display:block;margin-bottom:8px;font-size:11px;text-transform:uppercase;letter-spacing:1px;opacity:0.6;}
  .hl span{font-size:14px;color:#1A0A35;line-height:1.7;}

  /* Info table */
  .tbl{width:100%;border-collapse:collapse;margin:22px 0;border-radius:14px;overflow:hidden;border:1px solid #EDE8F5;}
  .tbl th{background:#F5F0FF;padding:11px 18px;font-size:10px;font-weight:700;color:#5B2D8E;text-transform:uppercase;letter-spacing:1px;text-align:left;}
  .tbl td{padding:13px 18px;font-size:13px;border-bottom:1px solid #F3EFF9;}
  .tbl td:first-child{color:#9B8FB0;width:38%;font-size:12px;}
  .tbl td:last-child{font-weight:600;color:#1A0A35;}
  .tbl tr:last-child td{border-bottom:none;}

  /* Reference pill */
  .ref-pill{display:inline-block;background:#F5F0FF;border:2px solid rgba(91,45,142,0.18);border-radius:14px;padding:12px 24px;font-size:20px;font-weight:700;color:#5B2D8E;letter-spacing:4px;font-family:monospace;margin:10px 0;}

  /* Buttons */
  .btn{display:inline-block;padding:14px 32px;border-radius:100px;font-weight:700;font-size:13px;text-align:center;letter-spacing:0.4px;margin:5px;text-decoration:none!important;}
  .btn-purple{background:linear-gradient(135deg,#5B2D8E 0%,#7B4DB8 100%);color:#fff!important;box-shadow:0 4px 18px rgba(91,45,142,0.35);}
  .btn-gold{background:linear-gradient(135deg,#F0A500 0%,#FFB84D 100%);color:#1A0A35!important;box-shadow:0 4px 18px rgba(240,165,0,0.35);}
  .btn-wrap{text-align:center;margin:32px 0 8px;}

  /* Stats row */
  .stats{display:table;width:100%;margin:24px 0;border:1px solid #EDE8F5;border-radius:16px;overflow:hidden;background:#FDFCFF;}
  .stat{display:table-cell;text-align:center;padding:20px 12px;border-right:1px solid #EDE8F5;}
  .stat:last-child{border-right:none;}
  .stat-val{font-size:24px;font-weight:800;color:#1A0A35;display:block;}
  .stat-lbl{font-size:10px;color:#9B8FB0;text-transform:uppercase;letter-spacing:1px;margin-top:4px;display:block;}

  /* Progress bar */
  .progress-wrap{background:#EDE8F5;border-radius:100px;height:8px;overflow:hidden;margin:10px 0;}
  .progress-bar{height:100%;border-radius:100px;background:linear-gradient(90deg,#5B2D8E,#F0A500);}

  /* Badges */
  .badge{display:inline-block;padding:5px 14px;border-radius:100px;font-size:11px;font-weight:700;letter-spacing:0.4px;}
  .badge-green{background:rgba(22,163,74,0.08);color:#16a34a;border:1px solid rgba(22,163,74,0.2);}
  .badge-gold{background:rgba(240,165,0,0.1);color:#C07800;border:1px solid rgba(240,165,0,0.25);}
  .badge-purple{background:rgba(91,45,142,0.08);color:#5B2D8E;border:1px solid rgba(91,45,142,0.18);}

  /* Divider */
  .divider{border:none;border-top:1px solid #F0EBF8;margin:30px 0;}

  /* ── Footer ── */
  .ft{background:#F8F4FF;border-top:1px solid rgba(91,45,142,0.1);padding:0;text-align:center;}
  .ft-nav{padding:24px 40px 16px;}
  .ft-nav a{color:#8B6BBE;font-size:12px;font-weight:500;margin:0 10px;text-decoration:none;}
  .ft-copy{padding:4px 40px 16px;}
  .ft-copy p{font-size:11px;color:#B0A3C8;line-height:1.9;}
  .ft-unsub{padding:12px 40px 24px;border-top:1px solid rgba(91,45,142,0.08);}
  .ft-unsub p{font-size:11px;color:#C0B4D8;line-height:1.8;}
  .ft-unsub a{color:#9B6BD4;font-size:11px;}

  /* Small note */
  .note{font-size:12px;color:#9B8FB0;line-height:1.8;}

  @media (max-width:600px){
    .outer{padding:24px 12px 40px;}
    .bd{padding:30px 24px 24px;}
    .hd-top{padding:32px 24px 28px;}
    .ft-nav{padding:22px 24px 16px;}
    .ft-brand,.ft-copy{padding-left:24px;padding-right:24px;}
    .stat{display:block;border-right:none;border-bottom:1px solid #EDE8F5;padding:14px;}
    .stat:last-child{border-bottom:none;}
  }
</style>
</head>
<body>
${preheader ? `<div style="display:none;max-height:0;overflow:hidden;font-size:1px;">${preheader}&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;</div>` : ''}
<div class="outer">
<div class="wrapper">

  <!-- Header -->
  <div class="hd">
    <div class="hd-top">
      <img src="${LOGO_URL}" alt="Nkenkak-Ngiesang" class="hd-logo"/>
      <div class="hd-badge">Official Communication</div>
    </div>
    <div class="hd-bar"></div>
  </div>

  <!-- Body -->
  <div class="bd">${content}</div>

  <!-- Footer -->
  <div class="ft">
    <div class="ft-nav">
      <a href="${CLIENT}">Website</a>
      <a href="${CLIENT}/projects">Projects</a>
      <a href="${CLIENT}/events">Events</a>
      <a href="${CLIENT}/news">News</a>
      <a href="${CLIENT}/forum">Forum</a>
      <a href="mailto:contact@nkenkak-ngiesang.cm">Contact</a>
    </div>
    <div class="ft-copy">
      <p>&copy; ${new Date().getFullYear()} Nkenkak-Ngiesang Development Council. All rights reserved.</p>
    </div>
    <div class="ft-unsub">
      <p>You are receiving this email because you subscribed to community updates.<br/>
      To stop receiving these emails, <a href="${CLIENT}/portal/profile">unsubscribe here</a>.</p>
    </div>
  </div>

</div>
</div>
</body></html>`

/* ─────────────────────────────────────
   LOW-LEVEL SEND
───────────────────────────────────── */
exports.sendEmail = async ({ to, subject, html, text }) => {
  if (!process.env.SMTP_USER || !process.env.SMTP_PASS) {
    console.log('[EMAIL STUB]', subject, '->', to)
    return
  }
  try {
    await transporter.sendMail({ from: FROM, to, subject, html: wrap(html), text })
  } catch (err) {
    console.error('[EMAIL ERROR]', err.message)
  }
}

/* ═══════════════════════════════════
   1. WELCOME / ONBOARDING
═══════════════════════════════════ */
exports.sendWelcome = ({ to, firstName }) =>
  exports.sendEmail({
    to,
    subject: `Welcome to Nkenkak-Ngiesang, ${firstName}!`,
    html: `
      <h2>Welcome, ${firstName}! 🎉</h2>
      <p class="subhead">You're now part of the Nkenkak-Ngiesang community. Whether you're joining from the village or from the diaspora — you are home.</p>

      <div class="hl hl-purple">
        <strong>Get started in 5 steps</strong>
        <table style="width:100%;margin-top:10px;border-collapse:collapse;">
          ${[
            ['Complete your profile','Add a photo and bio so the community knows you'],
            ['Browse active projects','See what\'s being built in the village right now'],
            ['Register for an event','Connect with the community at upcoming gatherings'],
            ['Pin yourself on the map','Show where the diaspora reaches around the world'],
            ['Join the forum','Share ideas, ask questions, and engage with members'],
          ].map(([title, desc], i) => `
            <tr>
              <td style="width:28px;padding:5px 8px 5px 0;vertical-align:top;">
                <div style="width:22px;height:22px;border-radius:50%;background:linear-gradient(135deg,#5B2D8E,#7B4DB8);color:#fff;font-size:10px;font-weight:700;text-align:center;line-height:22px;">${i+1}</div>
              </td>
              <td style="padding:5px 0;vertical-align:top;">
                <div style="font-size:13px;font-weight:600;color:#1A0A35;">${title}</div>
                <div style="font-size:12px;color:#737373;margin-top:1px;">${desc}</div>
              </td>
            </tr>
          `).join('')}
        </table>
      </div>

      <div class="btn-wrap">
        <a href="${CLIENT}/portal" class="btn btn-purple">Go to My Dashboard</a>
        <a href="${CLIENT}/projects" class="btn btn-gold">Explore Projects</a>
      </div>
      <hr class="divider"/>
      <p class="note">If you didn't create this account, please ignore this email or contact us at <a href="mailto:contact@nkenkak-ngiesang.cm">contact@nkenkak-ngiesang.cm</a>.</p>
    `,
    text: `Welcome ${firstName}! Visit ${CLIENT}/portal to get started.`,
  })

/* ═══════════════════════════════════
   2. PASSWORD RESET
═══════════════════════════════════ */
exports.sendPasswordReset = ({ to, firstName, resetLink }) =>
  exports.sendEmail({
    to,
    subject: 'Reset your password — Nkenkak-Ngiesang',
    html: `
      <h2>Password Reset</h2>
      <p class="subhead">Hi ${firstName}, we received a request to reset your account password.</p>
      <p>Click the button below to set a new password. This link is valid for <strong>1 hour</strong> and can only be used once.</p>

      <div class="btn-wrap" style="margin:32px 0;">
        <a href="${resetLink}" class="btn btn-purple">Reset My Password</a>
      </div>

      <div class="hl hl-gold">
        <strong>Didn't request this?</strong>
        <span style="font-size:13px;color:#737373;">If you didn't request a password reset, your account is safe — simply ignore this email. Your password will not change.</span>
      </div>

      <hr class="divider"/>
      <p class="note">If the button doesn't work, copy and paste this link into your browser:<br/>
        <a href="${resetLink}" style="color:#5B2D8E;word-break:break-all;font-size:12px;">${resetLink}</a>
      </p>
    `,
    text: `Reset your password here: ${resetLink}. This link expires in 1 hour.`,
  })

/* ═══════════════════════════════════
   3. DONATION RECEIPT
═══════════════════════════════════ */
exports.sendDonationReceipt = ({ to, donorName, amount, reference, projectTitle, date }) => {
  const amtFmt  = Number(amount).toLocaleString('en')
  const dateStr = date
    ? new Date(date).toLocaleDateString('en-GB', { day:'numeric', month:'long', year:'numeric' })
    : new Date().toLocaleDateString('en-GB', { day:'numeric', month:'long', year:'numeric' })
  return exports.sendEmail({
    to,
    subject: `Donation Receipt — ${amtFmt} XAF · Ref: ${reference}`,
    html: `
      <h2>Thank you, ${donorName}!</h2>
      <p class="subhead">Your generous donation has been received and confirmed. The entire Nkenkak-Ngiesang community is grateful.</p>

      ${projectTitle ? `
      <div class="hl hl-purple">
        <strong>Designated Project</strong>
        <span style="font-size:15px;font-weight:600;color:#1A0A35;">${projectTitle}</span>
        <span style="font-size:12px;color:#737373;margin-top:4px;display:block;">Your contribution goes directly to this project.</span>
      </div>` : `
      <div class="hl hl-purple">
        <strong>General Village Development Fund</strong>
        <span style="font-size:13px;color:#737373;">Your contribution supports all active village projects, allocated where it's needed most.</span>
      </div>`}

      <table class="tbl">
        <tr><th colspan="2">Receipt Details</th></tr>
        <tr><td>Reference</td><td><span style="font-family:monospace;letter-spacing:1px;">${reference}</span></td></tr>
        <tr><td>Amount</td><td><span style="font-size:20px;font-weight:700;color:#F0A500;">${amtFmt} XAF</span></td></tr>
        <tr><td>Date</td><td>${dateStr}</td></tr>
        <tr><td>Status</td><td><span class="badge badge-green">&#10003; Confirmed</span></td></tr>
      </table>

      <div class="btn-wrap">
        <a href="${CLIENT}/portal/donations" class="btn btn-gold">View My Donation History</a>
      </div>

      <hr class="divider"/>
      <p class="note">Please keep this email as your official donation receipt. For any questions, contact us at <a href="mailto:contact@nkenkak-ngiesang.cm">contact@nkenkak-ngiesang.cm</a>.</p>
    `,
    text: `Donation receipt — ${reference}. Amount: ${amtFmt} XAF. ${projectTitle ? `Project: ${projectTitle}.` : ''} Thank you, ${donorName}!`,
  })
}

/* ═══════════════════════════════════
   4. EVENT REGISTRATION CONFIRMATION
═══════════════════════════════════ */
exports.sendEventConfirmation = ({ to, name, event, ticketRef, isPaid }) => {
  const d       = new Date(event.startDate)
  const dateStr = d.toLocaleDateString('en-GB', { weekday:'long', day:'numeric', month:'long', year:'numeric' })
  const timeStr = d.toLocaleTimeString('en-GB', { hour:'2-digit', minute:'2-digit' })
  const price   = isPaid ? `${Number(event.ticketPrice).toLocaleString()} XAF` : 'Free'
  return exports.sendEmail({
    to,
    subject: `Registration confirmed — ${event.title}`,
    html: `
      <h2>You're registered! 🎟️</h2>
      <p class="subhead">Hi ${name}, your spot for <strong>${event.title}</strong> has been confirmed. We look forward to seeing you there!</p>

      <div class="hl hl-purple" style="text-align:center;">
        <strong>Your Ticket Reference</strong>
        <div class="ref-pill">${ticketRef}</div>
        <div style="font-size:12px;color:#A3A3A3;margin-top:4px;">Present this reference at check-in</div>
      </div>

      <table class="tbl">
        <tr><th colspan="2">Event Details</th></tr>
        <tr><td>Event</td><td>${event.title}</td></tr>
        <tr><td>Date</td><td>${dateStr}</td></tr>
        <tr><td>Time</td><td>${timeStr}</td></tr>
        ${event.venue ? `<tr><td>Venue</td><td>${event.venue}</td></tr>` : ''}
        <tr><td>Ticket</td><td><span class="${isPaid ? 'badge badge-gold' : 'badge badge-green'}">${price}</span></td></tr>
      </table>

      ${event.isOnline && event.meetingLink ? `
      <div class="hl hl-gold">
        <strong>Online Event — Join Link</strong>
        <a href="${event.meetingLink}" style="color:#5B2D8E;font-size:13px;word-break:break-all;">${event.meetingLink}</a>
      </div>` : ''}

      <div class="btn-wrap">
        <a href="${CLIENT}/events" class="btn btn-purple">View All Events</a>
        <a href="${CLIENT}/portal/events" class="btn btn-gold">My Registrations</a>
      </div>
    `,
    text: `Registered for ${event.title}. Ticket: ${ticketRef}. Date: ${dateStr} at ${timeStr}. ${event.venue ? `Venue: ${event.venue}.` : ''}`,
  })
}

/* ═══════════════════════════════════
   5. NEWSLETTER SUBSCRIPTION CONFIRMATION
═══════════════════════════════════ */
exports.sendNewsletterConfirmation = ({ to, name }) =>
  exports.sendEmail({
    to,
    subject: "You're subscribed to Nkenkak-Ngiesang updates!",
    html: `
      <h2>You're in! 📬</h2>
      <p class="subhead">Hi${name ? ` ${name}` : ''},<br/>Thank you for subscribing. You'll receive community news, project milestones, and event invitations straight to your inbox.</p>

      <div class="stats">
        <div class="stat"><span class="stat-val" style="color:#5B2D8E;">📋</span><span class="stat-lbl">Project Updates</span></div>
        <div class="stat"><span class="stat-val" style="color:#F0A500;">📅</span><span class="stat-lbl">Event Alerts</span></div>
        <div class="stat"><span class="stat-val" style="color:#16a34a;">📰</span><span class="stat-lbl">Village News</span></div>
      </div>

      <div class="hl hl-purple">
        <strong>What you'll receive</strong>
        <ul style="margin-top:8px;padding-left:18px;color:#525252;font-size:13px;line-height:2.2;">
          <li>Project milestone reports and funding updates</li>
          <li>Upcoming event invitations and announcements</li>
          <li>Village news, success stories and impact reports</li>
          <li>Diaspora community highlights and spotlights</li>
        </ul>
      </div>

      <div class="btn-wrap">
        <a href="${CLIENT}/projects" class="btn btn-purple">Explore Projects</a>
        <a href="${CLIENT}/news" class="btn btn-gold">Read Latest News</a>
      </div>

      <hr class="divider"/>
      <p class="note">You can unsubscribe at any time — <a href="${CLIENT}/api/newsletter/unsubscribe?email=${encodeURIComponent(to)}">click here to unsubscribe</a>.</p>
    `,
    text: `You're subscribed to Nkenkak-Ngiesang updates! Visit ${CLIENT}/news for the latest.`,
  })

/* ═══════════════════════════════════
   6. NEWSLETTER CAMPAIGN BLAST
═══════════════════════════════════ */
exports.sendNewsletterCampaign = async ({ subscribers, subject, htmlBody }) => {
  const BATCH = 10
  for (let i = 0; i < subscribers.length; i += BATCH) {
    const batch = subscribers.slice(i, i + BATCH)
    await Promise.all(batch.map(sub =>
      exports.sendEmail({
        to:      sub.email,
        subject,
        html:    htmlBody,
        text: subject,
      }).catch(err => console.error('[CAMPAIGN ERROR]', sub.email, err.message))
    ))
    if (i + BATCH < subscribers.length) await new Promise(r => setTimeout(r, 1200))
  }
}

/* ═══════════════════════════════════
   7. CONTACT AUTO-REPLY
═══════════════════════════════════ */
exports.sendContactAutoReply = ({ to, name, subject: msgSubject }) =>
  exports.sendEmail({
    to,
    subject: 'Message received — Nkenkak-Ngiesang',
    html: `
      <h2>Message Received ✓</h2>
      <p class="subhead">Hi ${name}, thank you for reaching out to us.</p>
      <p>We have received your message and will get back to you within <strong>48 hours</strong>. Our team reviews all enquiries carefully and will respond as soon as possible.</p>

      <div class="hl hl-purple">
        <strong>Your Subject</strong>
        <span style="font-size:14px;color:#1A0A35;">${msgSubject || 'General Enquiry'}</span>
      </div>

      <div class="stats" style="margin:24px 0;">
        <div class="stat"><span class="stat-val">48h</span><span class="stat-lbl">Response time</span></div>
        <div class="stat"><span class="stat-val" style="color:#16a34a;">✓</span><span class="stat-lbl">Message received</span></div>
        <div class="stat"><span class="stat-val" style="color:#5B2D8E;">📧</span><span class="stat-lbl">Reply by email</span></div>
      </div>

      <p>In the meantime, feel free to explore our website for the latest project updates, events, and community news.</p>

      <div class="btn-wrap">
        <a href="${CLIENT}" class="btn btn-purple">Visit Our Website</a>
        <a href="${CLIENT}/projects" class="btn btn-gold">View Projects</a>
      </div>
    `,
    text: `Hi ${name}, we received your message and will respond within 48 hours. Thank you for contacting Nkenkak-Ngiesang.`,
  })

/* ═══════════════════════════════════
   8. CONTACT ADMIN ALERT
═══════════════════════════════════ */
exports.sendContactAdminAlert = ({ name, email, phone, subject: msgSubject, message }) =>
  exports.sendEmail({
    to:      ADMIN_EMAIL,
    subject: `[Contact Form] ${msgSubject || 'New enquiry'} — from ${name}`,
    html: `
      <h2>New Contact Message</h2>
      <p class="subhead">A new message has been submitted via the contact form.</p>

      <table class="tbl">
        <tr><th colspan="2">Sender Details</th></tr>
        <tr><td>Name</td><td>${name}</td></tr>
        <tr><td>Email</td><td><a href="mailto:${email}">${email}</a></td></tr>
        ${phone ? `<tr><td>Phone</td><td>${phone}</td></tr>` : ''}
        <tr><td>Subject</td><td>${msgSubject || '—'}</td></tr>
      </table>

      <div class="hl hl-purple">
        <strong>Message</strong>
        <span style="color:#525252;font-size:13px;line-height:1.8;white-space:pre-wrap;">${message}</span>
      </div>

      <div class="btn-wrap">
        <a href="${CLIENT}/admin/contacts" class="btn btn-purple">Open in Admin Panel</a>
        <a href="mailto:${email}" class="btn btn-gold">Reply Directly</a>
      </div>
    `,
    text: `New contact from ${name} (${email}): ${message}`,
  })

/* ═══════════════════════════════════
   9. TEAM APPLICATION CONFIRMATION
═══════════════════════════════════ */
exports.sendTeamApplicationConfirmation = ({ to, fullName, teamChoice }) =>
  exports.sendEmail({
    to,
    subject: 'Application received — Nkenkak-Ngiesang Team',
    html: `
      <h2>Application Received! 🙏</h2>
      <p class="subhead">Hi ${fullName}, thank you for applying to join the Nkenkak-Ngiesang team.</p>
      <p>Your application to join the <strong>${teamChoice}</strong> team has been successfully received. Your enthusiasm for serving our community means a great deal to us.</p>

      <div class="hl hl-purple">
        <strong>What happens next</strong>
        <table style="width:100%;margin-top:10px;border-collapse:collapse;">
          ${[
            ['Review (Days 1–7)','Our coordinators carefully review all applications'],
            ['Shortlisting','Suitable candidates are contacted for an interview'],
            ['Decision','You\'ll receive an email with our final decision'],
            ['Onboarding','Accepted members receive full onboarding details'],
          ].map(([step, desc], i) => `
            <tr>
              <td style="width:28px;padding:5px 8px 5px 0;vertical-align:top;">
                <div style="width:22px;height:22px;border-radius:50%;background:linear-gradient(135deg,#F0A500,#FFB84D);color:#fff;font-size:10px;font-weight:700;text-align:center;line-height:22px;">${i+1}</div>
              </td>
              <td style="padding:5px 0;vertical-align:top;">
                <div style="font-size:13px;font-weight:600;color:#1A0A35;">${step}</div>
                <div style="font-size:12px;color:#737373;">${desc}</div>
              </td>
            </tr>
          `).join('')}
        </table>
      </div>

      <table class="tbl">
        <tr><td>Applied Team</td><td><span class="badge badge-purple">${teamChoice}</span></td></tr>
        <tr><td>Status</td><td><span class="badge badge-gold">Under Review</span></td></tr>
      </table>

      <div class="btn-wrap">
        <a href="${CLIENT}/team" class="btn btn-purple">Meet the Team</a>
      </div>

      <hr class="divider"/>
      <p class="note">Questions? Contact us at <a href="mailto:contact@nkenkak-ngiesang.cm">contact@nkenkak-ngiesang.cm</a></p>
    `,
    text: `Hi ${fullName}, your application to join the ${teamChoice} team has been received. We'll be in touch within 5–7 business days.`,
  })

/* ═══════════════════════════════════
   10. TEAM APPLICATION RESULT
═══════════════════════════════════ */
exports.sendTeamApplicationResult = ({ to, fullName, teamChoice, status, note }) =>
  exports.sendEmail({
    to,
    subject: status === 'approved'
      ? `Congratulations — You've joined the ${teamChoice} team!`
      : `Update on your ${teamChoice} team application`,
    html: status === 'approved' ? `
      <h2>Welcome to the Team! 🎉</h2>
      <p class="subhead">Hi ${fullName}, we have great news — your application has been <span style="color:#16a34a;font-weight:700;">accepted!</span></p>
      <p>You are now officially a member of the <strong>${teamChoice}</strong> team at Nkenkak-Ngiesang. We're excited to have you on board!</p>

      <div class="hl hl-green">
        <strong>Application Status</strong>
        <span class="badge badge-green" style="margin-top:4px;display:inline-block;">&#10003; Accepted</span>
      </div>

      ${note ? `<div class="hl hl-purple"><strong>Note from the team</strong><span style="color:#525252;font-size:13px;">${note}</span></div>` : ''}

      <p>Our team coordinator will contact you shortly with onboarding details and next steps.</p>

      <div class="btn-wrap">
        <a href="${CLIENT}/portal" class="btn btn-gold">Go to My Portal</a>
        <a href="${CLIENT}/team" class="btn btn-purple">View the Team</a>
      </div>
    ` : `
      <h2>Application Update</h2>
      <p class="subhead">Hi ${fullName}, we have an update regarding your application.</p>
      <p>Thank you for your interest in joining the <strong>${teamChoice}</strong> team. After careful consideration, we are unable to move forward with your application at this time.</p>

      <div class="hl hl-gold">
        <strong>Don't be discouraged</strong>
        <span style="font-size:13px;color:#737373;">We review applications regularly. You're welcome to re-apply in the future, or find other ways to contribute to the community.</span>
      </div>

      ${note ? `<div class="hl hl-purple"><strong>Feedback from the team</strong><span style="color:#525252;font-size:13px;">${note}</span></div>` : ''}

      <div class="btn-wrap">
        <a href="${CLIENT}/projects" class="btn btn-purple">Support a Project</a>
        <a href="${CLIENT}/volunteers" class="btn btn-gold">Volunteer Instead</a>
      </div>
    `,
    text: status === 'approved'
      ? `Congratulations ${fullName}! You've been accepted to the ${teamChoice} team.`
      : `Hi ${fullName}, your ${teamChoice} team application was unsuccessful at this time.`,
  })

/* ═══════════════════════════════════
   NEWSLETTER CAMPAIGN SEND
   Used by campaigns.js and digest.js
═══════════════════════════════════ */
exports.sendNewsletter = ({ to, firstName, subject, html }) =>
  exports.sendEmail({
    to,
    subject,
    html: `
      <h2 style="margin-bottom:4px;">${subject}</h2>
      <p class="subhead">Hi${firstName ? ` ${firstName}` : ' there'},</p>
      <div style="font-size:14px;color:#4A3F5C;line-height:1.85;font-family:'Segoe UI',Helvetica,Arial,sans-serif;">
        ${html}
      </div>
    `,
    text: `${subject}\n\nHi${firstName ? ` ${firstName}` : ''},\n\n${html.replace(/<[^>]+>/g, '')}`,
  })

/* ═══════════════════════════════════
   11. PREMIUM SUBSCRIPTION CONFIRMATION
═══════════════════════════════════ */
exports.sendPremiumConfirmation = ({ to, firstName, plan, amount, expiresAt }) => {
  const planLabel  = plan === 'yearly' ? 'Annual Premium' : 'Monthly Premium'
  const amtFmt     = Number(amount).toLocaleString('en')
  const expiresFmt = new Date(expiresAt).toLocaleDateString('en-GB', { day:'numeric', month:'long', year:'numeric' })
  return exports.sendEmail({
    to,
    subject: `🎉 Premium activated — Welcome to Nkenkak Premium!`,
    html: `
      <h2>You're now Premium! 🎉</h2>
      <p class="subhead">Hi ${firstName}, your <strong>${planLabel}</strong> subscription is active. All premium features are now unlocked.</p>

      <div class="hl hl-gold">
        <strong>What's unlocked for you</strong>
        <table style="width:100%;margin-top:10px;border-collapse:collapse;">
          ${[
            ['Recruiter contact details','Full name, email, phone and WhatsApp of every recruiter'],
            ['AI CV Generator','Generate a tailored, ATS-friendly CV for any job in seconds'],
            ['Priority job alerts','Be first to see new listings in your field'],
            ['Premium profile badge','Stand out to employers and the community'],
          ].map(([title, desc]) => `
            <tr>
              <td style="padding:5px 0 5px 0;vertical-align:top;width:20px;">
                <span style="color:#C07800;font-size:14px;">&#10003;</span>
              </td>
              <td style="padding:5px 0;vertical-align:top;padding-left:8px;">
                <div style="font-size:13px;font-weight:600;color:#1A0A35;">${title}</div>
                <div style="font-size:12px;color:#737373;">${desc}</div>
              </td>
            </tr>
          `).join('')}
        </table>
      </div>

      <table class="tbl">
        <tr><th colspan="2">Subscription Details</th></tr>
        <tr><td>Plan</td><td><span class="badge badge-gold">${planLabel}</span></td></tr>
        <tr><td>Amount paid</td><td><strong>${amtFmt} XAF</strong></td></tr>
        <tr><td>Valid until</td><td><strong>${expiresFmt}</strong></td></tr>
        <tr><td>Status</td><td><span class="badge badge-green">&#10003; Active</span></td></tr>
      </table>

      <div class="btn-wrap">
        <a href="${CLIENT}/jobs" class="btn btn-gold">Browse Jobs Now</a>
        <a href="${CLIENT}/portal" class="btn btn-purple">Go to My Portal</a>
      </div>

      <hr class="divider"/>
      <p class="note">Your subscription renews automatically. To manage or cancel, visit your <a href="${CLIENT}/portal/profile">account settings</a>. Questions? <a href="mailto:contact@nkenkak-ngiesang.cm">Contact us</a>.</p>
    `,
    text: `Hi ${firstName}, your ${planLabel} is now active until ${expiresFmt}. Visit ${CLIENT}/jobs to browse listings.`,
  })
}

/* ═══════════════════════════════════
   12. PROJECT UPDATE NOTIFICATION
═══════════════════════════════════ */
exports.sendProjectUpdateNotification = ({ to, donorName, project, update }) =>
  exports.sendEmail({
    to,
    subject: `Project Update: ${project}`,
    html: `
      <h2>Project Update 📢</h2>
      <p class="subhead">Hi ${donorName}, there's a new update on a project you've supported.</p>

      <div class="hl hl-purple">
        ${update.title ? `<strong>${update.title}</strong>` : '<strong>Latest Update</strong>'}
        <span style="color:#525252;font-size:13px;line-height:1.8;margin-top:6px;display:block;">${update.content}</span>
      </div>

      <table class="tbl">
        <tr><td>Project</td><td>${project}</td></tr>
        <tr><td>Status</td><td><span class="badge badge-green">Active</span></td></tr>
      </table>

      <div class="btn-wrap">
        <a href="${CLIENT}/projects" class="btn btn-purple">View Full Project</a>
        <a href="${CLIENT}/projects" class="btn btn-gold">Donate Again</a>
      </div>

      <hr class="divider"/>
      <p class="note">You're receiving this because you donated to this project. <a href="${CLIENT}/api/newsletter/unsubscribe?email=${encodeURIComponent(to)}">Unsubscribe from project updates</a>.</p>
    `,
    text: `New update on ${project}: ${update.content}. View at ${CLIENT}/projects`,
  })
