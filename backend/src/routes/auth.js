const router = require('express').Router()
const auth   = require('../controllers/authController')
const { authenticate } = require('../middleware/auth')

router.post('/register',        auth.register)
router.post('/login',           auth.login)
router.post('/refresh',         auth.refresh)
router.post('/logout',          auth.logout)
router.get('/me',               authenticate, auth.me)
router.post('/forgot-password', auth.forgotPassword)
router.post('/reset-password',  auth.resetPassword)

module.exports = router
