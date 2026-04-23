const router = require('express').Router();
const { query } = require('../config/database');
const slugify = require('slugify');
const { authenticate, optionalAuth, isLeader } = require('../middleware/auth');
router.get('/', optionalAuth, async (req,res) => {
  const { featured, page=1, limit=10 } = req.query;
  const offset = (page-1)*limit;
  let cond = [`status='published'`];
  if (featured==='true') cond.push('is_featured=TRUE');
  const r = await query(`SELECT n.*,u.first_name||' '||u.last_name AS author_name FROM news n LEFT JOIN users u ON u.id=n.author_id WHERE ${cond.join(' AND ')} ORDER BY published_at DESC LIMIT $1 OFFSET $2`,[limit,offset]);
  res.json(r.rows);
});
router.get('/:slug', async (req,res) => {
  const r = await query(`SELECT n.*,u.first_name||' '||u.last_name AS author_name FROM news n LEFT JOIN users u ON u.id=n.author_id WHERE n.slug=$1`,[req.params.slug]);
  if (!r.rows[0]) return res.status(404).json({error:'Not found'});
  await query('UPDATE news SET view_count=view_count+1 WHERE slug=$1',[req.params.slug]);
  res.json(r.rows[0]);
});
router.post('/', authenticate, isLeader, async (req,res) => {
  const { title, excerpt, content, category, tags, is_featured, status='draft' } = req.body;
  const slug = slugify(title,{lower:true,strict:true})+'-'+Date.now();
  const r = await query(
    'INSERT INTO news (slug,title,excerpt,content,category,tags,is_featured,status,author_id,published_at) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10) RETURNING *',
    [slug,title,excerpt,content,category||null,tags||null,is_featured||false,status,req.user.id,status==='published'?new Date():null]
  );
  res.status(201).json(r.rows[0]);
});
router.patch('/:id', authenticate, isLeader, async (req,res) => {
  const { title,excerpt,content,category,tags,is_featured,status } = req.body;
  const r = await query(
    'UPDATE news SET title=COALESCE($1,title),excerpt=COALESCE($2,excerpt),content=COALESCE($3,content),category=COALESCE($4,category),tags=COALESCE($5,tags),is_featured=COALESCE($6,is_featured),status=COALESCE($7,status),published_at=CASE WHEN $7=\'published\' AND published_at IS NULL THEN NOW() ELSE published_at END WHERE id=$8 RETURNING *',
    [title||null,excerpt||null,content||null,category||null,tags||null,is_featured??null,status||null,req.params.id]
  );
  res.json(r.rows[0]);
});
module.exports = router;
