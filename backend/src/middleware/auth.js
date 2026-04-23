const jwt = require('jsonwebtoken');
const { query } = require('../config/database');

// Verify access token
const authenticate = async (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader?.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'No token provided' });
  }
  const token = authHeader.split(' ')[1];
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const result = await query(
      'SELECT id, email, role, status, first_name, last_name, avatar_url FROM users WHERE id = $1',
      [decoded.userId]
    );
    if (!result.rows[0]) return res.status(401).json({ error: 'User not found' });
    if (result.rows[0].status === 'banned') return res.status(403).json({ error: 'Account suspended' });
    req.user = result.rows[0];
    next();
  } catch (err) {
    if (err.name === 'TokenExpiredError') return res.status(401).json({ error: 'Token expired' });
    return res.status(401).json({ error: 'Invalid token' });
  }
};

// Optional auth (doesn't fail if no token)
const optionalAuth = async (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader?.startsWith('Bearer ')) return next();
  try {
    const token = authHeader.split(' ')[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const result = await query('SELECT id, email, role, status, first_name, last_name FROM users WHERE id = $1', [decoded.userId]);
    req.user = result.rows[0] || null;
  } catch { req.user = null; }
  next();
};

// Role guards
const requireRole = (...roles) => (req, res, next) => {
  if (!req.user) return res.status(401).json({ error: 'Authentication required' });
  if (!roles.includes(req.user.role)) return res.status(403).json({ error: 'Insufficient permissions' });
  next();
};

const isAdmin   = requireRole('admin');
const isLeader  = requireRole('admin', 'leader');
const isMember  = requireRole('admin', 'leader', 'member');

module.exports = { authenticate, optionalAuth, requireRole, isAdmin, isLeader, isMember };
