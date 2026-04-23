const router = require('express').Router();
const { query } = require('../config/database');
const { authenticate } = require('../middleware/auth');
router.get('/', authenticate, async (req,res) => {
  const r = await query('SELECT * FROM notifications WHERE user_id=$1 ORDER BY created_at DESC LIMIT 30',[req.user.id]);
  res.json(r.rows);
});
router.patch('/:id/read', authenticate, async (req,res) => {
  await query('UPDATE notifications SET is_read=TRUE WHERE id=$1 AND user_id=$2',[req.params.id,req.user.id]);
  res.json({message:'Marked as read'});
});
router.patch('/read-all', authenticate, async (req,res) => {
  await query('UPDATE notifications SET is_read=TRUE WHERE user_id=$1',[req.user.id]);
  res.json({message:'All read'});
});
module.exports = router;
