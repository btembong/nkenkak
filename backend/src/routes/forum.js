const router = require('express').Router()
const { prisma } = require('../config/database')
const { authenticate, optionalAuth, isAdmin } = require('../middleware/auth')

let sendEmail
try { ({ sendEmail } = require('../services/email')) } catch {}

// ── helpers ──────────────────────────────────────────────────────────────────

function shapeThread(t) {
  return {
    ...t,
    category_name: t.category?.name,
    category_slug: t.category?.slug,
    author_name:   t.author ? `${t.author.firstName} ${t.author.lastName}` : 'Anonymous',
    author_role:   t.author?.role,
  }
}

function shapeReply(r) {
  return {
    ...r,
    author_name: r.author ? `${r.author.firstName} ${r.author.lastName}` : 'Anonymous',
    author_role: r.author?.role,
    like_count:  r.likes?.length ?? r.likeCount,
    attachments: r.attachments || [],
  }
}

// Parse @mentions from content, return user ids of mentioned users
async function resolveMentions(content) {
  const matches = [...new Set((content.match(/@([\w.]+)/g) || []).map(m => m.slice(1)))]
  if (!matches.length) return []
  const users = await prisma.user.findMany({
    where: {
      OR: matches.map(m => {
        const [first, ...rest] = m.split('.')
        return rest.length
          ? { firstName: { equals: first, mode: 'insensitive' }, lastName: { equals: rest.join('.'), mode: 'insensitive' } }
          : { OR: [{ firstName: { equals: m, mode: 'insensitive' } }, { lastName: { equals: m, mode: 'insensitive' } }] }
      }),
    },
    select: { id: true, firstName: true, lastName: true, email: true },
  })
  return users
}

// Auto-subscribe user to thread (if not already)
async function ensureSubscribed(threadId, userId) {
  try {
    await prisma.threadSubscription.create({ data: { threadId, userId } })
  } catch { /* unique constraint = already subscribed, ignore */ }
}

// Send reply-notification emails to all thread subscribers except the replier
async function notifySubscribers(thread, reply, replyAuthor, skipUserId) {
  if (!sendEmail) return
  const subs = await prisma.threadSubscription.findMany({
    where: { threadId: thread.id, userId: { not: skipUserId } },
    include: { user: { select: { email: true, firstName: true } } },
  })
  for (const sub of subs) {
    try {
      await sendEmail({
        to: sub.user.email,
        subject: `New reply in: ${thread.title}`,
        html: `
          <p>Hi ${sub.user.firstName},</p>
          <p><strong>${replyAuthor}</strong> replied in the thread you follow:</p>
          <blockquote style="border-left:3px solid #5B2D8E;padding-left:12px;color:#525252">
            ${reply.content.slice(0, 300)}${reply.content.length > 300 ? '…' : ''}
          </blockquote>
          <p><a href="${process.env.CLIENT_URL || 'http://localhost:5173'}/forum/${thread.id}" style="color:#5B2D8E">View Thread →</a></p>
        `,
      })
    } catch {}
  }
}

// ── routes ───────────────────────────────────────────────────────────────────

// GET /api/forum/categories
router.get('/categories', async (req, res) => {
  const cats = await prisma.forumCategory.findMany({
    orderBy: { sortOrder: 'asc' },
    include: { _count: { select: { threads: true } } },
  })
  res.json(cats.map(c => ({ ...c, thread_count: c._count.threads })))
})

// GET /api/forum/threads
router.get('/threads', optionalAuth, async (req, res) => {
  const { category, search, limit = 50 } = req.query
  const threads = await prisma.forumThread.findMany({
    where: {
      ...(category && { category: { slug: category } }),
      ...(search   && { OR: [{ title: { contains: search, mode: 'insensitive' } }, { content: { contains: search, mode: 'insensitive' } }] }),
    },
    include: {
      category: { select: { name: true, slug: true } },
      author:   { select: { firstName: true, lastName: true, role: true } },
      _count:   { select: { attachments: true } },
    },
    orderBy: [{ isPinned: 'desc' }, { lastReplyAt: 'desc' }],
    take: +limit,
  })
  res.json(threads.map(t => ({ ...shapeThread(t), has_attachments: t._count.attachments > 0 })))
})

// GET /api/forum/threads/:id
router.get('/threads/:id', optionalAuth, async (req, res) => {
  const thread = await prisma.forumThread.findUnique({
    where: { id: req.params.id },
    include: {
      category:    { select: { name: true, slug: true } },
      author:      { select: { firstName: true, lastName: true, role: true } },
      attachments: true,
      replies: {
        include: {
          author:      { select: { firstName: true, lastName: true, role: true } },
          likes:       true,
          attachments: true,
        },
        orderBy: { createdAt: 'asc' },
      },
    },
  })
  if (!thread) return res.status(404).json({ error: 'Not found' })
  await prisma.forumThread.update({ where: { id: thread.id }, data: { viewCount: { increment: 1 } } })

  // Is current user subscribed?
  let isSubscribed = false
  if (req.user) {
    const sub = await prisma.threadSubscription.findFirst({ where: { threadId: thread.id, userId: req.user.id } })
    isSubscribed = !!sub
  }

  // Poll attached to thread
  const poll = await prisma.poll.findFirst({
    where: { threadId: thread.id },
    include: { votes: true },
  })

  res.json({
    ...shapeThread(thread),
    attachments: thread.attachments || [],
    is_subscribed: isSubscribed,
    poll: poll || null,
    replies: thread.replies.map(shapeReply),
  })
})

// POST /api/forum/threads
router.post('/threads', authenticate, async (req, res) => {
  const { title, content, category_id, attachment_urls } = req.body
  if (!title || !content || !category_id) return res.status(400).json({ error: 'Title, content and category required' })

  const thread = await prisma.forumThread.create({
    data: { title, content, categoryId: category_id, authorId: req.user.id },
  })

  // Save attachments if provided
  if (attachment_urls?.length) {
    await prisma.forumAttachment.createMany({
      data: attachment_urls.map(a => ({
        threadId: thread.id,
        fileUrl:  a.url,
        fileName: a.name,
        fileSize: a.size || null,
        fileType: a.type || null,
      })),
    })
  }

  // Author auto-subscribes
  await ensureSubscribed(thread.id, req.user.id)

  res.status(201).json(thread)
})

// POST /api/forum/threads/:id/replies
router.post('/threads/:id/replies', authenticate, async (req, res) => {
  const { content, parent_id, attachment_urls } = req.body
  if (!content) return res.status(400).json({ error: 'Content required' })

  const thread = await prisma.forumThread.findUnique({ where: { id: req.params.id } })
  if (!thread) return res.status(404).json({ error: 'Thread not found' })

  const reply = await prisma.forumReply.create({
    data: {
      content,
      threadId: req.params.id,
      authorId: req.user.id,
      parentId: parent_id || null,
    },
  })

  // Attachments
  if (attachment_urls?.length) {
    await prisma.forumAttachment.createMany({
      data: attachment_urls.map(a => ({
        replyId:  reply.id,
        fileUrl:  a.url,
        fileName: a.name,
        fileSize: a.size || null,
        fileType: a.type || null,
      })),
    })
  }

  // Update thread stats
  await prisma.forumThread.update({
    where: { id: req.params.id },
    data: { replyCount: { increment: 1 }, lastReplyAt: new Date() },
  })

  // Auto-subscribe replier
  await ensureSubscribed(req.params.id, req.user.id)

  // @mention notifications
  const mentionedUsers = await resolveMentions(content)
  for (const u of mentionedUsers) {
    if (u.id === req.user.id) continue
    await prisma.notification.create({
      data: {
        userId:  u.id,
        type:    'forum_reply',
        title:   `${req.user.firstName} mentioned you`,
        message: `In thread: "${thread.title}"`,
        link:    `/forum/${thread.id}`,
      },
    }).catch(() => {})
  }

  // Email notification to subscribers
  const authorName = `${req.user.firstName} ${req.user.lastName}`
  await notifySubscribers(thread, reply, authorName, req.user.id)

  res.status(201).json(reply)
})

// POST /api/forum/replies/:id/like
router.post('/replies/:id/like', authenticate, async (req, res) => {
  try {
    await prisma.forumLike.create({ data: { replyId: req.params.id, userId: req.user.id } })
    await prisma.forumReply.update({ where: { id: req.params.id }, data: { likeCount: { increment: 1 } } })
    res.json({ liked: true })
  } catch {
    await prisma.forumLike.deleteMany({ where: { replyId: req.params.id, userId: req.user.id } })
    await prisma.forumReply.update({ where: { id: req.params.id }, data: { likeCount: { decrement: 1 } } })
    res.json({ liked: false })
  }
})

// POST /api/forum/threads/:id/subscribe
router.post('/threads/:id/subscribe', authenticate, async (req, res) => {
  await ensureSubscribed(req.params.id, req.user.id)
  res.json({ subscribed: true })
})

// DELETE /api/forum/threads/:id/subscribe
router.delete('/threads/:id/subscribe', authenticate, async (req, res) => {
  await prisma.threadSubscription.deleteMany({ where: { threadId: req.params.id, userId: req.user.id } })
  res.json({ subscribed: false })
})

// POST /api/forum/threads/:id/poll — attach a poll to a thread (thread author or admin)
router.post('/threads/:id/poll', authenticate, async (req, res) => {
  const { title, options, closes_at } = req.body
  if (!title || !options?.length) return res.status(400).json({ error: 'Poll title and options required' })
  // Only one poll per thread
  const existing = await prisma.poll.findFirst({ where: { threadId: req.params.id } })
  if (existing) return res.status(409).json({ error: 'Thread already has a poll' })

  const poll = await prisma.poll.create({
    data: {
      title,
      options,
      threadId:  req.params.id,
      createdBy: req.user.id,
      closesAt:  closes_at ? new Date(closes_at) : null,
    },
  })
  res.status(201).json(poll)
})

// POST /api/forum/polls/:id/vote — vote on a thread poll option
router.post('/polls/:id/vote', authenticate, async (req, res) => {
  const { option } = req.body // the option string they chose
  if (!option) return res.status(400).json({ error: 'Option required' })
  try {
    const vote = await prisma.vote.create({
      data: { pollId: req.params.id, userId: req.user.id, vote: option },
    })
    res.status(201).json(vote)
  } catch {
    res.status(409).json({ error: 'Already voted' })
  }
})

// PATCH /api/forum/threads/:id (admin)
router.patch('/threads/:id', authenticate, isAdmin, async (req, res) => {
  const { status, is_pinned } = req.body
  const thread = await prisma.forumThread.update({
    where: { id: req.params.id },
    data: {
      ...(status                  && { status }),
      ...(is_pinned !== undefined && { isPinned: !!is_pinned }),
    },
  })
  res.json(thread)
})

// DELETE /api/forum/threads/:id (admin)
router.delete('/threads/:id', authenticate, isAdmin, async (req, res) => {
  await prisma.forumThread.delete({ where: { id: req.params.id } })
  res.json({ message: 'Deleted' })
})

module.exports = router
