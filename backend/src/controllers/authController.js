const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { v4: uuidv4 } = require('uuid');
const { query } = require('../config/database');
const { sendEmail } = require('../services/email');

const generateTokens = (userId, role) => {
  const accessToken = jwt.sign({ userId, role }, process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXPIRES_IN || '15m' });
  const refreshToken = jwt.sign({ userId }, process.env.JWT_REFRESH_SECRET, { expiresIn: process.env.JWT_REFRESH_EXPIRES_IN || '7d' });
  return { accessToken, refreshToken };
};

// POST /api/auth/register
exports.register = async (req, res) => {
  const { email, password, first_name, last_name, phone, country, is_diaspora } = req.body;

  const exists = await query('SELECT id FROM users WHERE email = $1', [email]);
  if (exists.rows[0]) return res.status(409).json({ error: 'Email already registered' });

  const password_hash = await bcrypt.hash(password, 12);
  const verify_token = uuidv4();

  const result = await query(
    `INSERT INTO users (email, password_hash, first_name, last_name, phone, country, is_diaspora, email_verify_token, status)
     VALUES ($1,$2,$3,$4,$5,$6,$7,$8,'pending') RETURNING id, email, role, first_name, last_name`,
    [email, password_hash, first_name, last_name, phone || null, country || 'Cameroon', is_diaspora || false, verify_token]
  );

  const user = result.rows[0];

  // Send verification email
  await sendEmail({
    to: email,
    subject: 'Verify your Nkenkak-Ngiesang account',
    html: `<p>Hello ${first_name},</p>
           <p>Please verify your email by clicking: <a href="${process.env.CLIENT_URL}/verify-email?token=${verify_token}">Verify Email</a></p>`,
  }).catch(console.error);

  const { accessToken, refreshToken } = generateTokens(user.id, user.role);

  await query(
    'INSERT INTO refresh_tokens (user_id, token, expires_at) VALUES ($1,$2, NOW() + INTERVAL \'7 days\')',
    [user.id, refreshToken]
  );

  res.status(201).json({ user: { id: user.id, email: user.email, role: user.role, first_name: user.first_name, last_name: user.last_name }, accessToken, refreshToken });
};

// POST /api/auth/login
exports.login = async (req, res) => {
  const { email, password } = req.body;

  const result = await query('SELECT * FROM users WHERE email = $1', [email]);
  const user = result.rows[0];

  if (!user || !(await bcrypt.compare(password, user.password_hash))) {
    return res.status(401).json({ error: 'Invalid email or password' });
  }
  if (user.status === 'banned') return res.status(403).json({ error: 'Account suspended' });

  await query('UPDATE users SET last_login = NOW() WHERE id = $1', [user.id]);

  const { accessToken, refreshToken } = generateTokens(user.id, user.role);
  await query('INSERT INTO refresh_tokens (user_id, token, expires_at) VALUES ($1,$2, NOW() + INTERVAL \'7 days\')', [user.id, refreshToken]);

  await query('INSERT INTO audit_logs (user_id, action, ip_address) VALUES ($1,\'login\',$2)', [user.id, req.ip]);

  res.json({
    user: { id: user.id, email: user.email, role: user.role, first_name: user.first_name, last_name: user.last_name, avatar_url: user.avatar_url, status: user.status },
    accessToken, refreshToken,
  });
};

// POST /api/auth/refresh
exports.refresh = async (req, res) => {
  const { refreshToken } = req.body;
  if (!refreshToken) return res.status(401).json({ error: 'Refresh token required' });

  const stored = await query('SELECT * FROM refresh_tokens WHERE token = $1 AND expires_at > NOW()', [refreshToken]);
  if (!stored.rows[0]) return res.status(401).json({ error: 'Invalid or expired refresh token' });

  const decoded = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET);
  const user = await query('SELECT id, role FROM users WHERE id = $1', [decoded.userId]);
  if (!user.rows[0]) return res.status(401).json({ error: 'User not found' });

  const { accessToken, refreshToken: newRefresh } = generateTokens(user.rows[0].id, user.rows[0].role);
  await query('DELETE FROM refresh_tokens WHERE token = $1', [refreshToken]);
  await query('INSERT INTO refresh_tokens (user_id, token, expires_at) VALUES ($1,$2, NOW() + INTERVAL \'7 days\')', [user.rows[0].id, newRefresh]);

  res.json({ accessToken, refreshToken: newRefresh });
};

// POST /api/auth/logout
exports.logout = async (req, res) => {
  const { refreshToken } = req.body;
  if (refreshToken) await query('DELETE FROM refresh_tokens WHERE token = $1', [refreshToken]);
  res.json({ message: 'Logged out successfully' });
};

// GET /api/auth/me
exports.me = async (req, res) => {
  const result = await query(
    'SELECT id, email, role, status, first_name, last_name, phone, avatar_url, bio, country, city, is_diaspora, newsletter, email_verified, created_at FROM users WHERE id = $1',
    [req.user.id]
  );
  res.json(result.rows[0]);
};

// POST /api/auth/verify-email
exports.verifyEmail = async (req, res) => {
  const { token } = req.body;
  const result = await query('SELECT id FROM users WHERE email_verify_token = $1', [token]);
  if (!result.rows[0]) return res.status(400).json({ error: 'Invalid or expired token' });
  await query('UPDATE users SET email_verified = TRUE, email_verify_token = NULL, status = \'active\' WHERE id = $1', [result.rows[0].id]);
  res.json({ message: 'Email verified successfully' });
};

// POST /api/auth/forgot-password
exports.forgotPassword = async (req, res) => {
  const { email } = req.body;
  const user = await query('SELECT id, first_name FROM users WHERE email = $1', [email]);
  if (user.rows[0]) {
    const token = uuidv4();
    await query('UPDATE users SET reset_token = $1, reset_token_expiry = NOW() + INTERVAL \'1 hour\' WHERE id = $2', [token, user.rows[0].id]);
    await sendEmail({
      to: email,
      subject: 'Reset your password',
      html: `<p>Hello ${user.rows[0].first_name},</p><p>Reset your password: <a href="${process.env.CLIENT_URL}/reset-password?token=${token}">Reset Password</a></p><p>This link expires in 1 hour.</p>`,
    }).catch(console.error);
  }
  res.json({ message: 'If that email exists, a reset link has been sent.' });
};

// POST /api/auth/reset-password
exports.resetPassword = async (req, res) => {
  const { token, password } = req.body;
  const result = await query('SELECT id FROM users WHERE reset_token = $1 AND reset_token_expiry > NOW()', [token]);
  if (!result.rows[0]) return res.status(400).json({ error: 'Invalid or expired reset token' });
  const hash = await bcrypt.hash(password, 12);
  await query('UPDATE users SET password_hash = $1, reset_token = NULL, reset_token_expiry = NULL WHERE id = $2', [hash, result.rows[0].id]);
  res.json({ message: 'Password reset successfully' });
};
