// routes/auth.js
const router = require('express').Router();
const c = require('../controllers/authController');
const { authenticate } = require('../middleware/auth');
router.post('/register', c.register);
router.post('/login', c.login);
router.post('/refresh', c.refresh);
router.post('/logout', c.logout);
router.get('/me', authenticate, c.me);
router.post('/verify-email', c.verifyEmail);
router.post('/forgot-password', c.forgotPassword);
router.post('/reset-password', c.resetPassword);
module.exports = router;
