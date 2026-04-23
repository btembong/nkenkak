const slugify = require('slugify');
const { query } = require('../config/database');

// GET /api/projects
exports.getAll = async (req, res) => {
  const { status, category, featured, page = 1, limit = 12 } = req.query;
  const offset = (page - 1) * limit;
  let conditions = [], params = [];
  let i = 1;
  if (status)   { conditions.push(`p.status = $${i++}`);   params.push(status); }
  if (category) { conditions.push(`p.category = $${i++}`); params.push(category); }
  if (featured === 'true') { conditions.push(`p.is_featured = TRUE`); }
  const where = conditions.length ? 'WHERE ' + conditions.join(' AND ') : '';

  const [rows, count] = await Promise.all([
    query(`SELECT p.*, u.first_name || ' ' || u.last_name AS created_by_name
           FROM projects p LEFT JOIN users u ON u.id = p.created_by
           ${where} ORDER BY p.is_featured DESC, p.created_at DESC LIMIT $${i} OFFSET $${i+1}`,
      [...params, limit, offset]),
    query(`SELECT COUNT(*) FROM projects p ${where}`, params),
  ]);

  res.json({ projects: rows.rows, total: parseInt(count.rows[0].count), page: +page, limit: +limit });
};

// GET /api/projects/:slug
exports.getOne = async (req, res) => {
  const result = await query(
    `SELECT p.*, u.first_name || ' ' || u.last_name AS created_by_name
     FROM projects p LEFT JOIN users u ON u.id = p.created_by
     WHERE p.slug = $1`, [req.params.slug]
  );
  if (!result.rows[0]) return res.status(404).json({ error: 'Project not found' });
  await query('UPDATE projects SET view_count = view_count + 1 WHERE slug = $1', [req.params.slug]);

  // Get updates
  const updates = await query(
    `SELECT pu.*, u.first_name || ' ' || u.last_name AS author_name
     FROM project_updates pu LEFT JOIN users u ON u.id = pu.author_id
     WHERE pu.project_id = $1 ORDER BY pu.created_at DESC`, [result.rows[0].id]
  );

  res.json({ ...result.rows[0], updates: updates.rows });
};

// POST /api/projects
exports.create = async (req, res) => {
  const { title, summary, description, category, goal_amount, currency, location, start_date, end_date, beneficiaries, is_featured, is_urgent } = req.body;
  const slug = slugify(title, { lower: true, strict: true }) + '-' + Date.now();
  const result = await query(
    `INSERT INTO projects (slug,title,summary,description,category,goal_amount,currency,location,start_date,end_date,beneficiaries,is_featured,is_urgent,created_by)
     VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14) RETURNING *`,
    [slug, title, summary, description, category, goal_amount, currency || 'XAF', location, start_date || null, end_date || null, beneficiaries || 0, is_featured || false, is_urgent || false, req.user.id]
  );
  res.status(201).json(result.rows[0]);
};

// PATCH /api/projects/:id
exports.update = async (req, res) => {
  const fields = ['title','summary','description','category','status','goal_amount','currency','location','start_date','end_date','beneficiaries','cover_image','is_featured','is_urgent'];
  const updates = [], params = [];
  let i = 1;
  fields.forEach(f => { if (req.body[f] !== undefined) { updates.push(`${f} = $${i++}`); params.push(req.body[f]); } });
  if (!updates.length) return res.status(400).json({ error: 'No fields to update' });
  params.push(req.params.id);
  const result = await query(`UPDATE projects SET ${updates.join(', ')} WHERE id = $${i} RETURNING *`, params);
  if (!result.rows[0]) return res.status(404).json({ error: 'Project not found' });
  res.json(result.rows[0]);
};

// DELETE /api/projects/:id
exports.remove = async (req, res) => {
  await query('DELETE FROM projects WHERE id = $1', [req.params.id]);
  res.json({ message: 'Project deleted' });
};

// POST /api/projects/:id/updates
exports.addUpdate = async (req, res) => {
  const { title, content, image_url } = req.body;
  const result = await query(
    'INSERT INTO project_updates (project_id, author_id, title, content, image_url) VALUES ($1,$2,$3,$4,$5) RETURNING *',
    [req.params.id, req.user.id, title, content, image_url || null]
  );
  res.status(201).json(result.rows[0]);
};

// GET /api/projects/stats/summary
exports.stats = async (req, res) => {
  const result = await query(`
    SELECT
      COUNT(*) FILTER (WHERE status = 'active') AS active,
      COUNT(*) FILTER (WHERE status = 'completed') AS completed,
      COALESCE(SUM(raised_amount),0) AS total_raised,
      COALESCE(SUM(donor_count),0) AS total_donors
    FROM projects
  `);
  res.json(result.rows[0]);
};
