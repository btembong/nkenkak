const router = require('express').Router();
const { query } = require('../config/database');
const { authenticate, isAdmin } = require('../middleware/auth');
router.get('/', async (req,res) => {
  const { team } = req.query;
  let cond = ['is_active=TRUE'];
  const params = [];
  if (team) { cond.push('team=$1'); params.push(team); }
  const r = await query(`SELECT * FROM team_members WHERE ${cond.join(' AND ')} ORDER BY sort_order`,params);
  res.json(r.rows);
});
router.post('/apply', async (req,res) => {
  const { full_name,email,phone,location,team_choice,skills,motivation } = req.body;
  await query('INSERT INTO team_applications (full_name,email,phone,location,team_choice,skills,motivation) VALUES ($1,$2,$3,$4,$5,$6,$7)',
    [full_name,email,phone||null,location||null,team_choice,skills||null,motivation||null]);
  res.status(201).json({message:'Application submitted'});
});
router.post('/', authenticate, isAdmin, async (req,res) => {
  const { name,role_title,team,bio,sort_order } = req.body;
  const r = await query('INSERT INTO team_members (name,role_title,team,bio,sort_order) VALUES ($1,$2,$3,$4,$5) RETURNING *',
    [name,role_title,team,bio||null,sort_order||0]);
  res.status(201).json(r.rows[0]);
});
module.exports = router;
