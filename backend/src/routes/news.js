const router = require('express').Router()
const { prisma } = require('../config/database')
const slugify   = require('slugify')
const { authenticate, optionalAuth, isLeader } = require('../middleware/auth')
let sendPush; try { ({ sendPush } = require('./push')) } catch {}

router.get('/', optionalAuth, async (req, res) => {
  const { featured, page = 1, limit = 10, status, search, category } = req.query
  const where = {
    status: status === 'all' ? undefined : (status || 'published'),
    ...(featured === 'true' && { isFeatured: true }),
    ...(category && category !== 'all' && { category: { equals: category, mode: 'insensitive' } }),
    ...(search && { OR: [
      { title:   { contains: search, mode: 'insensitive' } },
      { excerpt: { contains: search, mode: 'insensitive' } },
      { content: { contains: search, mode: 'insensitive' } },
    ]}),
  }
  const [articles, total] = await Promise.all([
    prisma.news.findMany({
      where,
      include: { author: { select:{ firstName:true, lastName:true, avatarUrl:true } } },
      orderBy: { publishedAt: 'desc' },
      take: +limit, skip: (+page-1) * +limit,
    }),
    prisma.news.count({ where }),
  ])
  res.json({
    articles: articles.map(a => ({ ...a, author_name: a.author ? `${a.author.firstName} ${a.author.lastName}` : null })),
    total,
    page: +page,
    totalPages: Math.ceil(total / +limit),
  })
})

router.get('/:slug/related', async (req, res) => {
  const article = await prisma.news.findUnique({ where: { slug: req.params.slug }, select: { id:true, category:true } })
  if (!article) return res.json([])
  const related = await prisma.news.findMany({
    where: { status:'published', id: { not: article.id }, ...(article.category && { category: article.category }) },
    include: { author: { select:{ firstName:true, lastName:true } } },
    orderBy: { publishedAt:'desc' },
    take: 3,
  })
  res.json(related.map(a => ({ ...a, author_name: a.author ? `${a.author.firstName} ${a.author.lastName}` : null })))
})

router.get('/:slug', async (req, res) => {
  const article = await prisma.news.findUnique({
    where: { slug: req.params.slug },
    include: { author: { select:{ firstName:true, lastName:true, avatarUrl:true } } },
  })
  if (!article) return res.status(404).json({ error: 'Not found' })
  await prisma.news.update({ where: { id: article.id }, data: { viewCount: { increment:1 } } })
  // Estimate read time (avg 200 wpm)
  const wordCount = (article.content || '').replace(/<[^>]+>/g,'').split(/\s+/).filter(Boolean).length
  const readTime = Math.max(1, Math.round(wordCount / 200))
  res.json({ ...article, author_name: article.author ? `${article.author.firstName} ${article.author.lastName}` : null, readTime })
})

router.post('/', authenticate, isLeader, async (req, res) => {
  const { title, excerpt, content, category, tags, is_featured, cover_image, status = 'draft', scheduled_at } = req.body
  if (!title) return res.status(400).json({ error: 'Title required' })
  if (status === 'scheduled' && !scheduled_at) return res.status(400).json({ error: 'scheduled_at required for scheduled status' })
  const slug = slugify(title, { lower:true, strict:true }) + '-' + Date.now()
  const article = await prisma.news.create({
    data: { slug, title, excerpt, content, category, tags,
            isFeatured: !!is_featured, coverImage: cover_image, status, authorId: req.user.id,
            publishedAt: status === 'published' ? new Date() : null,
            scheduledAt: status === 'scheduled' && scheduled_at ? new Date(scheduled_at) : null },
  })
  if (status === 'published' && sendPush) {
    sendPush({ title: 'New Article', body: title, url: `/news/${slug}` }).catch(() => {})
  }
  res.status(201).json(article)
})

router.patch('/:id', authenticate, isLeader, async (req, res) => {
  const { title, excerpt, content, category, tags, is_featured, cover_image, status, scheduled_at } = req.body
  const existing = await prisma.news.findUnique({ where: { id: req.params.id } })
  if (!existing) return res.status(404).json({ error: 'Not found' })
  const article = await prisma.news.update({
    where: { id: req.params.id },
    data: {
      ...(title        && { title }),
      ...(excerpt      !== undefined && { excerpt }),
      ...(content      !== undefined && { content }),
      ...(category     !== undefined && { category }),
      ...(tags         !== undefined && { tags }),
      ...(cover_image  !== undefined && { coverImage: cover_image }),
      ...(is_featured  !== undefined && { isFeatured: !!is_featured }),
      ...(status       && { status, publishedAt: status === 'published' && !existing.publishedAt ? new Date() : existing.publishedAt }),
      scheduledAt: status === 'scheduled' && scheduled_at ? new Date(scheduled_at) : (status && status !== 'scheduled' ? null : undefined),
    },
  })
  // Push when status transitions to published for the first time
  if (status === 'published' && existing.status !== 'published' && sendPush) {
    sendPush({ title: 'New Article', body: article.title, url: `/news/${article.slug}` }).catch(() => {})
  }
  res.json(article)
})

router.delete('/:id', authenticate, isLeader, async (req, res) => {
  await prisma.news.delete({ where: { id: req.params.id } })
  res.json({ message: 'Deleted' })
})

module.exports = router
