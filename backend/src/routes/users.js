const router = require('express').Router();
const { query } = require('../config/database');
const bcrypt = require('bcrypt');
const { authenticate } = require('../middleware/auth');
router.get('/profile', authenticate, async (req,res) => {
  const r = await query('SELECT id,email,role,status,first_name,last_name,phone,avatar_url,bio,country,city,village_quarter,is_diaspora,newsletter,email_verified,created_at FROM users WHERE id=$1',[req.user.id]);
  res.json(r.rows[0]);
});
router.patch('/profile', authenticate, async (req,res) => {
  const { first_name,last_name,phone,bio,country,city,village_quarter,is_diaspora,newsletter } = req.body;
  const r = await query(
    'UPDATE users SET first_name=COALESCE($1,first_name),last_name=COALESCE($2,last_name),phone=COALESCE($3,phone),bio=COALESCE($4,bio),country=COALESCE($5,country),city=COALESCE($6,city),village_quarter=COALESCE($7,village_quarter),is_diaspora=COALESCE($8,is_diaspora),newsletter=COALESCE($9,newsletter) WHERE id=$10 RETURNING *',
    [first_name||null,last_name||null,phone||null,bio||null,country||null,city||null,village_quarter||null,is_diaspora??null,newsletter??null,req.user.id]
  );
  res.json(r.rows[0]);
});
router.patch('/change-password', authenticate, async (req,res) => {
  const { current_password, new_password } = req.body;
  const u = await query('SELECT password_hash FROM users WHERE id=$1',[req.user.id]);
  if (!(await bcrypt.compare(current_password,u.rows[0].password_hash))) return res.status(400).json({error:'Current password incorrect'});
  const hash = await bcrypt.hash(new_password,12);
  await query('UPDATE users SET password_hash=$1 WHERE id=$2',[hash,req.user.id]);
  res.json({message:'Password updated'});
});
module.exports = router;
