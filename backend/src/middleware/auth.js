const jwt = require('jsonwebtoken')
const { prisma } = require('../config/database')

const authenticate = async (req, res, next) => {
  const header = req.headers.authorization
  if (!header?.startsWith('Bearer ')) return res.status(401).json({ error: 'No token' })
  try {
    const payload = jwt.verify(header.slice(7), process.env.JWT_SECRET)
    const user = await prisma.user.findUnique({
      where: { id: payload.id },
      select: { id:true, email:true, role:true, status:true, firstName:true, lastName:true, avatarUrl:true, isPremium:true, premiumUntil:true },
    })
    if (!user || user.status === 'banned') return res.status(401).json({ error: 'Unauthorized' })
    req.user = user
    next()
  } catch {
    res.status(401).json({ error: 'Invalid token' })
  }
}

const optionalAuth = async (req, res, next) => {
  const header = req.headers.authorization
  if (!header?.startsWith('Bearer ')) return next()
  try {
    const payload = jwt.verify(header.slice(7), process.env.JWT_SECRET)
    req.user = await prisma.user.findUnique({
      where: { id: payload.id },
      select: { id:true, email:true, role:true, status:true, firstName:true, lastName:true, isPremium:true, premiumUntil:true },
    })
  } catch { /* ignore */ }
  next()
}

const isAdmin  = (req, res, next) => req.user?.role === 'admin'  ? next() : res.status(403).json({ error: 'Admins only' })
const isLeader = (req, res, next) => ['admin','leader'].includes(req.user?.role) ? next() : res.status(403).json({ error: 'Leaders only' })
const isMember = (req, res, next) => ['admin','leader','member'].includes(req.user?.role) ? next() : res.status(403).json({ error: 'Members only' })

module.exports = { authenticate, optionalAuth, isAdmin, isLeader, isMember }
