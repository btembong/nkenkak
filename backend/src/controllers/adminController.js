const { query } = require('../config/database');

// GET /api/admin/dashboard
exports.dashboard = async (req, res) => {
  const [users, projects, donations, events, news, forum, recent] = await Promise.all([
    query(`SELECT COUNT(*) AS total, COUNT(*) FILTER (WHERE status='active') AS active,
           COUNT(*) FILTER (WHERE role='member') AS members,
           COUNT(*) FILTER (WHERE is_diaspora=TRUE) AS diaspora,
           COUNT(*) FILTER (WHERE created_at > NOW()-INTERVAL '30 days') AS new_this_month
           FROM users`),
    query(`SELECT COUNT(*) AS total,
           COUNT(*) FILTER (WHERE status='active') AS active,
           COUNT(*) FILTER (WHERE status='completed') AS completed,
           COALESCE(SUM(raised_amount),0) AS total_raised,
           COALESCE(SUM(goal_amount),0) AS total_goal FROM projects`),
    query(`SELECT COALESCE(SUM(amount) FILTER (WHERE status='completed'),0) AS total,
           COUNT(*) FILTER (WHERE status='completed') AS count,
           COUNT(*) FILTER (WHERE status='pending') AS pending,
           COALESCE(SUM(amount) FILTER (WHERE status='completed' AND created_at > NOW()-INTERVAL '7 days'),0) AS this_week
           FROM donations`),
    query(`SELECT COUNT(*) AS total, COUNT(*) FILTER (WHERE start_date > NOW()) AS upcoming FROM events`),
    query(`SELECT COUNT(*) AS total, COUNT(*) FILTER (WHERE status='published') AS published FROM news`),
    query(`SELECT COUNT(*) AS threads, (SELECT COUNT(*) FROM forum_replies) AS replies FROM forum_threads`),
    query(`SELECT d.reference, d.amount, d.currency, d.provider, d.status, d.created_at,
           COALESCE(d.donor_name, u.first_name || ' ' || u.last_name, 'Anonymous') AS donor,
           p.title AS project
           FROM donations d
           LEFT JOIN users u ON u.id = d.user_id
           LEFT JOIN projects p ON p.id = d.project_id
           ORDER BY d.created_at DESC LIMIT 10`),
  ]);

  res.json({
    users:     users.rows[0],
    projects:  projects.rows[0],
    donations: donations.rows[0],
    events:    events.rows[0],
    news:      news.rows[0],
    forum:     forum.rows[0],
    recent_donations: recent.rows,
  });
};

// GET /api/admin/users
exports.getUsers = async (req, res) => {
  const { role, status, search, page = 1, limit = 20 } = req.query;
  const offset = (page - 1) * limit;
  let cond = [], params = [], i = 1;
  if (role)   { cond.push(`role = $${i++}`);   params.push(role); }
  if (status) { cond.push(`status = $${i++}`); params.push(status); }
  if (search) { cond.push(`(email ILIKE $${i} OR first_name ILIKE $${i} OR last_name ILIKE $${i})`); params.push(`%${search}%`); i++; }
  const where = cond.length ? 'WHERE ' + cond.join(' AND ') : '';
  const result = await query(
    `SELECT id,email,role,status,first_name,last_name,country,is_diaspora,email_verified,last_login,created_at
     FROM users ${where} ORDER BY created_at DESC LIMIT $${i} OFFSET $${i+1}`,
    [...params, limit, offset]
  );
  res.json(result.rows);
};

// PATCH /api/admin/users/:id
exports.updateUser = async (req, res) => {
  const { role, status } = req.body;
  const result = await query(
    'UPDATE users SET role = COALESCE($1,role), status = COALESCE($2,status) WHERE id = $3 RETURNING id,email,role,status',
    [role || null, status || null, req.params.id]
  );
  res.json(result.rows[0]);
};

// GET /api/admin/team-applications
exports.getApplications = async (req, res) => {
  const result = await query('SELECT * FROM team_applications ORDER BY created_at DESC');
  res.json(result.rows);
};

// PATCH /api/admin/team-applications/:id
exports.reviewApplication = async (req, res) => {
  const { status } = req.body;
  await query(
    'UPDATE team_applications SET status=$1, reviewed_by=$2, reviewed_at=NOW() WHERE id=$3',
    [status, req.user.id, req.params.id]
  );
  res.json({ message: 'Application updated' });
};

// GET /api/admin/audit-logs
exports.auditLogs = async (req, res) => {
  const result = await query(
    `SELECT al.*, u.first_name || ' ' || u.last_name AS user_name
     FROM audit_logs al LEFT JOIN users u ON u.id = al.user_id
     ORDER BY al.created_at DESC LIMIT 100`
  );
  res.json(result.rows);
};
