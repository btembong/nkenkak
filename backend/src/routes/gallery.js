const router = require('express').Router();
const { query } = require('../config/database');
const { authenticate, isLeader } = require('../middleware/auth');
router.get('/', async (req,res) => {
  const r = await query('SELECT * FROM gallery ORDER BY sort_order, created_at DESC LIMIT 50');
  res.json(r.rows);
});
router.post('/', authenticate, isLeader, async (req,res) => {
  const { title,description,url,thumbnail,media_type,project_id,event_id,tags,is_featured } = req.body;
  const r = await query(
    'INSERT INTO gallery (title,description,url,thumbnail,media_type,project_id,event_id,tags,is_featured,uploaded_by) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10) RETURNING *',
    [title||null,description||null,url,thumbnail||null,media_type||'image',project_id||null,event_id||null,tags||null,is_featured||false,req.user.id]
  );
  res.status(201).json(r.rows[0]);
});
module.exports = router;
