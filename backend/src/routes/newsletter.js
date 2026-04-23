const router = require('express').Router();
const { query } = require('../config/database');
router.post('/subscribe', async (req,res) => {
  const { email,name } = req.body;
  try {
    await query('INSERT INTO newsletter_subscribers (email,name) VALUES ($1,$2)',[email,name||null]);
    res.json({message:'Subscribed successfully'});
  } catch { res.status(409).json({error:'Already subscribed'}); }
});
router.get('/unsubscribe', async (req,res) => {
  const { email } = req.query;
  await query('UPDATE newsletter_subscribers SET is_active=FALSE WHERE email=$1',[email]);
  res.json({message:'Unsubscribed'});
});
module.exports = router;
