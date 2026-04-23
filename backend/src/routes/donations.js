const router = require('express').Router();
const c = require('../controllers/donationsController');
const { authenticate, optionalAuth, isAdmin } = require('../middleware/auth');
router.post('/initiate', optionalAuth, c.initiate);
router.post('/webhook/:provider', c.webhook);
router.get('/', authenticate, isAdmin, c.getAll);
router.get('/summary', authenticate, isAdmin, c.summary);
router.get('/my', authenticate, c.myDonations);
module.exports = router;
