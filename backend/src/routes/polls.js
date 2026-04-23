const router = require('express').Router();
const { query } = require('../config/database');
const { authenticate, isLeader } = require('../middleware/auth');
router.get('/', async (req,res) => {
  const r = await query(`SELECT p.*,COUNT(v.id) AS vote_count FROM polls p LEFT JOIN votes v ON v.poll_id=p.id WHERE p.is_active=TRUE GROUP BY p.id ORDER BY p.created_at DESC`);
  res.json(r.rows);
});
router.post('/', authenticate, isLeader, async (req,res) => {
  const { project_id,title,description,closes_at } = req.body;
  const r = await query('INSERT INTO polls (project_id,title,description,closes_at,created_by) VALUES ($1,$2,$3,$4,$5) RETURNING *',
    [project_id||null,title,description||null,closes_at||null,req.user.id]);
  res.status(201).json(r.rows[0]);
});
router.post('/:id/vote', authenticate, async (req,res) => {
  const { vote, comment } = req.body;
  try {
    const r = await query('INSERT INTO votes (poll_id,user_id,vote,comment) VALUES ($1,$2,$3,$4) RETURNING *',
      [req.params.id,req.user.id,vote,comment||null]);
    res.status(201).json(r.rows[0]);
  } catch { res.status(409).json({error:'Already voted'}); }
});
router.get('/:id/results', async (req,res) => {
  const r = await query(`SELECT vote, COUNT(*) AS count FROM votes WHERE poll_id=$1 GROUP BY vote`, [req.params.id]);
  res.json(r.rows);
});
module.exports = router;
