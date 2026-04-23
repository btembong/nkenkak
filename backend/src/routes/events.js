const router = require('express').Router();
const { query } = require('../config/database');
const slugify = require('slugify');
const { authenticate, optionalAuth, isLeader } = require('../middleware/auth');
const router2 = router;
router2.get('/', async (req,res) => {
  const { upcoming, category } = req.query;
  let cond = ['is_published = TRUE'], params = [];
  let i = 1;
  if (upcoming === 'true') { cond.push(`start_date > NOW()`); }
  if (category) { cond.push(`category = $${i++}`); params.push(category); }
  const r = await query(`SELECT * FROM events WHERE ${cond.join(' AND ')} ORDER BY start_date ASC LIMIT 50`, params);
  res.json(r.rows);
});
router2.get('/:slug', optionalAuth, async (req,res) => {
  const r = await query('SELECT * FROM events WHERE slug=$1', [req.params.slug]);
  if (!r.rows[0]) return res.status(404).json({error:'Not found'});
  res.json(r.rows[0]);
});
router2.post('/', authenticate, isLeader, async (req,res) => {
  const { title, description, category, start_date, end_date, venue, is_online, meeting_link } = req.body;
  const slug = slugify(title,{lower:true,strict:true})+'-'+Date.now();
  const r = await query(
    'INSERT INTO events (slug,title,description,category,start_date,end_date,venue,is_online,meeting_link,organizer_id) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10) RETURNING *',
    [slug,title,description,category||'community',start_date,end_date||null,venue||null,is_online||false,meeting_link||null,req.user.id]
  );
  res.status(201).json(r.rows[0]);
});
router2.post('/:id/rsvp', authenticate, async (req,res) => {
  try {
    await query('INSERT INTO event_rsvps (event_id,user_id) VALUES ($1,$2)', [req.params.id, req.user.id]);
    res.json({rsvped:true});
  } catch { res.status(409).json({error:'Already RSVPed'}); }
});
module.exports = router2;
