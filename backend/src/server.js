require('dotenv').config();
require('express-async-errors');

const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const compression = require('compression');
const rateLimit = require('express-rate-limit');
const path = require('path');

const app = express();

// ── Security & Middleware ──────────────────────────────────────
app.use(helmet());
app.use(compression());
app.use(morgan(process.env.NODE_ENV === 'production' ? 'combined' : 'dev'));
app.use(cors({
  origin: process.env.CLIENT_URL || 'http://localhost:5173',
  credentials: true,
}));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// ── Rate limiting ──────────────────────────────────────────────
app.use('/api/auth', rateLimit({ windowMs: 15 * 60 * 1000, max: 20, message: { error: 'Too many requests, please try again later.' } }));
app.use('/api', rateLimit({ windowMs: 15 * 60 * 1000, max: 300 }));

// ── Routes ─────────────────────────────────────────────────────
app.use('/api/auth',         require('./routes/auth'));
app.use('/api/users',        require('./routes/users'));
app.use('/api/projects',     require('./routes/projects'));
app.use('/api/donations',    require('./routes/donations'));
app.use('/api/events',       require('./routes/events'));
app.use('/api/news',         require('./routes/news'));
app.use('/api/team',         require('./routes/team'));
app.use('/api/gallery',      require('./routes/gallery'));
app.use('/api/forum',        require('./routes/forum'));
app.use('/api/polls',        require('./routes/polls'));
app.use('/api/notifications',require('./routes/notifications'));
app.use('/api/newsletter',   require('./routes/newsletter'));
app.use('/api/diaspora',     require('./routes/diaspora'));
app.use('/api/admin',        require('./routes/admin'));
app.use('/api/upload',       require('./routes/upload'));

// ── Health check ───────────────────────────────────────────────
app.get('/health', (req, res) => res.json({ status: 'ok', env: process.env.NODE_ENV }));

// ── Global error handler ───────────────────────────────────────
app.use((err, req, res, next) => {
  console.error(err.stack);
  const status = err.status || err.statusCode || 500;
  res.status(status).json({
    error: err.message || 'Internal Server Error',
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack }),
  });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🌿 Nkenkak API running on port ${PORT} [${process.env.NODE_ENV}]`));

module.exports = app;
