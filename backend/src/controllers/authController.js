const bcrypt  = require('bcrypt')
const jwt     = require('jsonwebtoken')
const { prisma } = require('../config/database')
const { sendWelcome, sendPasswordReset } = require('../services/email')

const makeTokens = (userId) => ({
  accessToken:  jwt.sign({ id: userId }, process.env.JWT_SECRET,         { expiresIn: '15m' }),
  refreshToken: jwt.sign({ id: userId }, process.env.JWT_REFRESH_SECRET, { expiresIn: '7d'  }),
})

exports.register = async (req, res) => {
  const { email, password, first_name, last_name, phone, country, city, is_diaspora, newsletter } = req.body
  if (!email || !password || !first_name || !last_name)
    return res.status(400).json({ error: 'Email, password, first name and last name are required' })

  const exists = await prisma.user.findUnique({ where: { email } })
  if (exists) return res.status(409).json({ error: 'Email already registered' })

  const passwordHash = await bcrypt.hash(password, 12)
  const user = await prisma.user.create({
    data: { email, passwordHash, firstName: first_name, lastName: last_name,
            phone, country: country || 'Cameroon', city,
            isDiaspora: !!is_diaspora, newsletter: newsletter !== false,
            status: 'active' },
  })

  // Subscribe to newsletter if opted in
  if (newsletter !== false) {
    await prisma.newsletterSubscriber.upsert({
      where: { email },
      update: { isActive: true },
      create: { email, name: `${first_name} ${last_name}` },
    }).catch(() => {})
  }

  const { accessToken, refreshToken } = makeTokens(user.id)
  await prisma.refreshToken.create({
    data: { userId: user.id, token: refreshToken, expiresAt: new Date(Date.now() + 7*24*60*60*1000) }
  })

  // Welcome email (non-blocking)
  sendWelcome({ to: user.email, firstName: first_name }).catch(() => {})

  res.status(201).json({
    accessToken, refreshToken,
    user: { id:user.id, email:user.email, role:user.role, firstName:user.firstName, lastName:user.lastName },
  })
}

exports.login = async (req, res) => {
  const { email, password } = req.body
  if (!email || !password) return res.status(400).json({ error: 'Email and password required' })

  const user = await prisma.user.findUnique({ where: { email } })
  if (!user) return res.status(401).json({ error: 'Invalid email or password' })
  if (user.status === 'banned') return res.status(403).json({ error: 'Account suspended' })

  const ok = await bcrypt.compare(password, user.passwordHash)
  if (!ok) return res.status(401).json({ error: 'Invalid email or password' })

  await prisma.user.update({ where: { id: user.id }, data: { lastLogin: new Date() } })

  const { accessToken, refreshToken } = makeTokens(user.id)
  await prisma.refreshToken.create({
    data: { userId: user.id, token: refreshToken, expiresAt: new Date(Date.now() + 7*24*60*60*1000) }
  })

  res.json({
    accessToken, refreshToken,
    user: { id:user.id, email:user.email, role:user.role, status:user.status, firstName:user.firstName, lastName:user.lastName, avatarUrl:user.avatarUrl },
  })
}

exports.refresh = async (req, res) => {
  const { refreshToken } = req.body
  if (!refreshToken) return res.status(400).json({ error: 'Refresh token required' })
  try {
    const payload = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET)
    const stored  = await prisma.refreshToken.findUnique({ where: { token: refreshToken } })
    if (!stored || stored.expiresAt < new Date()) return res.status(401).json({ error: 'Invalid refresh token' })

    await prisma.refreshToken.delete({ where: { token: refreshToken } })

    const user = await prisma.user.findUnique({ where: { id: payload.id } })
    if (!user) return res.status(401).json({ error: 'User not found' })

    const tokens = makeTokens(user.id)
    await prisma.refreshToken.create({
      data: { userId: user.id, token: tokens.refreshToken, expiresAt: new Date(Date.now() + 7*24*60*60*1000) }
    })
    res.json(tokens)
  } catch {
    res.status(401).json({ error: 'Invalid refresh token' })
  }
}

exports.logout = async (req, res) => {
  const { refreshToken } = req.body
  if (refreshToken) {
    await prisma.refreshToken.deleteMany({ where: { token: refreshToken } }).catch(() => {})
  }
  res.json({ message: 'Logged out' })
}

exports.me = async (req, res) => {
  const user = await prisma.user.findUnique({
    where: { id: req.user.id },
    select: { id:true, email:true, role:true, status:true, firstName:true, lastName:true,
              avatarUrl:true, phone:true, bio:true, country:true, city:true, isDiaspora:true, newsletter:true,
              isPremium:true, premiumUntil:true },
  })
  res.json(user)
}

exports.resetPassword = async (req, res) => {
  const { token, password } = req.body
  if (!token || !password) return res.status(400).json({ error: 'Token and password required' })
  if (password.length < 8) return res.status(400).json({ error: 'Password must be at least 8 characters' })

  const user = await prisma.user.findFirst({
    where: { resetToken: token, resetTokenExpiry: { gt: new Date() } }
  })
  if (!user) return res.status(400).json({ error: 'Reset link is invalid or has expired' })

  const passwordHash = await bcrypt.hash(password, 12)
  await prisma.user.update({
    where: { id: user.id },
    data: { passwordHash, resetToken: null, resetTokenExpiry: null }
  })
  // Invalidate all refresh tokens for security
  await prisma.refreshToken.deleteMany({ where: { userId: user.id } })

  res.json({ message: 'Password reset successfully. You can now log in.' })
}

exports.forgotPassword = async (req, res) => {
  const { email } = req.body
  const user = await prisma.user.findUnique({ where: { email } })
  // Always return success to prevent email enumeration
  if (user) {
    const token = require('crypto').randomBytes(32).toString('hex')
    await prisma.user.update({
      where: { id: user.id },
      data: { resetToken: token, resetTokenExpiry: new Date(Date.now() + 60*60*1000) }
    })
    const resetLink = `${process.env.CLIENT_URL}/reset-password?token=${token}`
    sendPasswordReset({ to: user.email, firstName: user.firstName, resetLink }).catch(() => {})
  }
  res.json({ message: 'If that email exists, a reset link has been sent.' })
}
