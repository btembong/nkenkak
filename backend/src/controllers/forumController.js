const { query } = require('../config/database');

// GET /api/forum/categories
exports.getCategories = async (req, res) => {
  const result = await query(`
    SELECT fc.*, COUNT(ft.id) AS thread_count
    FROM forum_categories fc
    LEFT JOIN forum_threads ft ON ft.category_id = fc.id
    GROUP BY fc.id ORDER BY fc.sort_order
  `);
  res.json(result.rows);
};

// GET /api/forum/threads?category=slug&page=1
exports.getThreads = async (req, res) => {
  const { category, page = 1, limit = 20, search } = req.query;
  const offset = (page - 1) * limit;
  let cond = ['ft.status != \'archived\''], params = [], i = 1;

  if (category) {
    cond.push(`fc.slug = $${i++}`);
    params.push(category);
  }
  if (search) {
    cond.push(`(ft.title ILIKE $${i} OR ft.content ILIKE $${i})`);
    params.push(`%${search}%`); i++;
  }

  const where = 'WHERE ' + cond.join(' AND ');
  const rows = await query(
    `SELECT ft.*, fc.name AS category_name, fc.slug AS category_slug, fc.color AS category_color,
            u.first_name || ' ' || u.last_name AS author_name, u.avatar_url AS author_avatar
     FROM forum_threads ft
     JOIN forum_categories fc ON fc.id = ft.category_id
     JOIN users u ON u.id = ft.author_id
     ${where}
     ORDER BY ft.is_pinned DESC, ft.last_reply_at DESC
     LIMIT $${i} OFFSET $${i+1}`,
    [...params, limit, offset]
  );
  res.json(rows.rows);
};

// GET /api/forum/threads/:id
exports.getThread = async (req, res) => {
  const thread = await query(
    `SELECT ft.*, fc.name AS category_name, fc.color AS category_color,
            u.first_name || ' ' || u.last_name AS author_name, u.avatar_url AS author_avatar, u.role AS author_role
     FROM forum_threads ft
     JOIN forum_categories fc ON fc.id = ft.category_id
     JOIN users u ON u.id = ft.author_id
     WHERE ft.id = $1`, [req.params.id]
  );
  if (!thread.rows[0]) return res.status(404).json({ error: 'Thread not found' });
  await query('UPDATE forum_threads SET view_count = view_count + 1 WHERE id = $1', [req.params.id]);

  const replies = await query(
    `SELECT fr.*, u.first_name || ' ' || u.last_name AS author_name, u.avatar_url AS author_avatar, u.role AS author_role
     FROM forum_replies fr
     JOIN users u ON u.id = fr.author_id
     WHERE fr.thread_id = $1 ORDER BY fr.created_at ASC`,
    [req.params.id]
  );
  res.json({ ...thread.rows[0], replies: replies.rows });
};

// POST /api/forum/threads
exports.createThread = async (req, res) => {
  const { category_id, title, content } = req.body;
  const result = await query(
    'INSERT INTO forum_threads (category_id, author_id, title, content) VALUES ($1,$2,$3,$4) RETURNING *',
    [category_id, req.user.id, title, content]
  );
  res.status(201).json(result.rows[0]);
};

// POST /api/forum/threads/:id/replies
exports.addReply = async (req, res) => {
  const { content, parent_id } = req.body;
  const result = await query(
    'INSERT INTO forum_replies (thread_id, author_id, content, parent_id) VALUES ($1,$2,$3,$4) RETURNING *',
    [req.params.id, req.user.id, content, parent_id || null]
  );
  await query(
    'UPDATE forum_threads SET reply_count = reply_count + 1, last_reply_at = NOW() WHERE id = $1',
    [req.params.id]
  );
  res.status(201).json(result.rows[0]);
};

// POST /api/forum/replies/:id/like
exports.likeReply = async (req, res) => {
  try {
    await query('INSERT INTO forum_likes (reply_id, user_id) VALUES ($1,$2)', [req.params.id, req.user.id]);
    await query('UPDATE forum_replies SET like_count = like_count + 1 WHERE id = $1', [req.params.id]);
    res.json({ liked: true });
  } catch { // unique constraint = already liked, unlike
    await query('DELETE FROM forum_likes WHERE reply_id = $1 AND user_id = $2', [req.params.id, req.user.id]);
    await query('UPDATE forum_replies SET like_count = GREATEST(0, like_count - 1) WHERE id = $1', [req.params.id]);
    res.json({ liked: false });
  }
};
