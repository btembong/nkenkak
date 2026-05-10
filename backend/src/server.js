require('dotenv').config()
require('express-async-errors')
const http         = require('http')
const express      = require('express')
const cors         = require('cors')
const helmet       = require('helmet')
const compression  = require('compression')
const morgan       = require('morgan')
const rateLimit    = require('express-rate-limit')
const { ping }     = require('./config/database')

const app    = express()
const server = http.createServer(app)

// ── Security & middleware ─────────────────────────────────────
app.use(helmet())
app.use(cors({
  origin:      [process.env.CLIENT_URL || 'http://localhost:5173', 'http://localhost:3000'],
  credentials: true,
  methods:     ['GET','POST','PUT','PATCH','DELETE','OPTIONS'],
}))
app.use(compression())
app.use(express.json({ limit: '10mb' }))
app.use(express.urlencoded({ extended: true }))
if (process.env.NODE_ENV === 'development') app.use(morgan('dev'))

// ── Rate limiting ─────────────────────────────────────────────
app.use('/api/auth', rateLimit({ windowMs: 15*60*1000, max: 20, message: { error: 'Too many requests' } }))
app.use('/api',      rateLimit({ windowMs: 15*60*1000, max: 500 }))

// ── Health check ──────────────────────────────────────────────
app.get('/health', (_, res) => res.json({ status: 'ok', timestamp: new Date().toISOString() }))

// ── Routes ────────────────────────────────────────────────────
app.use('/api/auth',         require('./routes/auth'))
app.use('/api/users',        require('./routes/users'))
app.use('/api/projects',     require('./routes/projects'))
app.use('/api/donations',    require('./routes/donations'))
app.use('/api/events',       require('./routes/events'))
app.use('/api/news',         require('./routes/news'))
app.use('/api/news/:slug/comments', require('./routes/news-comments'))
app.use('/api/team',         require('./routes/team'))
app.use('/api/gallery',      require('./routes/gallery'))
app.use('/api/forum',        require('./routes/forum'))
app.use('/api/polls',        require('./routes/polls'))
app.use('/api/notifications',require('./routes/notifications'))
app.use('/api/newsletter',   require('./routes/newsletter'))
app.use('/api/diaspora',     require('./routes/diaspora'))
app.use('/api/admin',        require('./routes/admin'))
app.use('/api/contact',      require('./routes/contact'))
app.use('/api/hero',         require('./routes/hero'))
app.use('/api/upload',       require('./routes/upload'))
app.use('/api/stats',        require('./routes/stats'))
app.use('/api/vocab',        require('./routes/vocab'))
app.use('/api/documents',    require('./routes/documents'))
app.use('/api/scholarships', require('./routes/scholarships'))
app.use('/api/scholarship-programs', require('./routes/scholarship-programs'))
app.use('/api/gallery-albums', require('./routes/gallery-albums'))
app.use('/api/notices',      require('./routes/notices'))
app.use('/api/businesses',   require('./routes/businesses'))
app.use('/api/mentors',      require('./routes/mentors'))
app.use('/api/memorial',     require('./routes/memorial'))
app.use('/api/reports',      require('./routes/reports'))
app.use('/api/volunteer',    require('./routes/volunteer'))
app.use('/api/push',         require('./routes/push'))
app.use('/api/chat',         require('./routes/chat'))
app.use('/api/messages',     require('./routes/messages'))
app.use('/api/petitions',    require('./routes/petitions'))
app.use('/api/jobs',         require('./routes/jobs'))
app.use('/api/wiki',         require('./routes/wiki'))
app.use('/api/budget',       require('./routes/budget'))
app.use('/api/campaigns',    require('./routes/campaigns'))
app.use('/api/elections',    require('./routes/elections'))
app.use('/api/rooms',        require('./routes/rooms'))
app.use('/api/premium',      require('./routes/premium'))

// ── Global error handler ──────────────────────────────────────
app.use((err, req, res, _next) => {
  console.error(`[${req.method} ${req.path}]`, err.message)
  if (err.code === 'P2025') return res.status(404).json({ error: 'Record not found' })
  if (err.code === 'P2002') return res.status(409).json({ error: 'Duplicate record' })
  if (err.code === 'P2003') return res.status(400).json({ error: 'Invalid reference' })
  res.status(500).json({ error: process.env.NODE_ENV === 'production' ? 'Internal server error' : err.message })
})

// ── Socket.io chat ────────────────────────────────────────────
const { attachChat } = require('./services/chatSocket')
attachChat(server)

// ── Cron jobs ─────────────────────────────────────────────────
try {
  const cron = require('node-cron')
  const { sendWeeklyDigest, processScheduledCampaigns } = require('./services/digest')
  // Weekly digest: every Monday at 08:00 Cameroon time
  cron.schedule('0 8 * * 1', () => { sendWeeklyDigest().catch(console.error) }, { timezone: 'Africa/Douala' })
  // Scheduled campaigns: every 15 minutes
  cron.schedule('*/15 * * * *', () => { processScheduledCampaigns().catch(console.error) }, { timezone: 'Africa/Douala' })
  console.log('⏰ Cron jobs registered')
} catch (e) {
  console.warn('⚠️  node-cron not available:', e.message)
}

// ── Start ─────────────────────────────────────────────────────
const PORT = process.env.PORT || 5000
server.listen(PORT, async () => {
  console.log(`\n🌿 Nkenkak API running on port ${PORT} [${process.env.NODE_ENV}]`)
  await ping()
})