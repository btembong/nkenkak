const router = require('express').Router();
const { query } = require('../config/database');
const { authenticate } = require('../middleware/auth');
router.get('/', async (req,res) => {
  const r = await query('SELECT id,display_name,city,country,latitude,longitude FROM diaspora_pins WHERE is_public=TRUE');
  res.json(r.rows);
});
router.post('/', authenticate, async (req,res) => {
  const { display_name,city,country,latitude,longitude,is_public } = req.body;
  const r = await query(
    'INSERT INTO diaspora_pins (user_id,display_name,city,country,latitude,longitude,is_public) VALUES ($1,$2,$3,$4,$5,$6,$7) ON CONFLICT (user_id) DO UPDATE SET display_name=$2,city=$3,country=$4,latitude=$5,longitude=$6,is_public=$7 RETURNING *',
    [req.user.id,display_name,city,country,latitude,longitude,is_public??true]
  );
  res.json(r.rows[0]);
});
module.exports = router;
