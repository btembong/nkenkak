const router = require('express').Router()
const { prisma } = require('../config/database')
const { authenticate, isLeader, isAdmin } = require('../middleware/auth')
const slugify = require('slugify')

// GET /api/wiki
router.get('/', async (req, res) => {
  const { category } = req.query
  const pages = await prisma.wikiPage.findMany({
    where: { isPublished: true, ...(category && { category }) },
    orderBy: { category: 'asc' },
    select: {
      id: true, title: true, slug: true, category: true,
      coverImage: true, viewCount: true, createdAt: true, updatedAt: true,
      author: { select: { firstName: true, lastName: true } },
    },
  })
  res.json(pages)
})

// GET /api/wiki/:slug
router.get('/:slug', async (req, res) => {
  const page = await prisma.wikiPage.findUnique({
    where: { slug: req.params.slug },
    include: { author: { select: { firstName: true, lastName: true } } },
  })
  if (!page || !page.isPublished) return res.status(404).json({ error: 'Not found' })
  await prisma.wikiPage.update({ where: { id: page.id }, data: { viewCount: { increment: 1 } } })
  res.json(page)
})

// POST /api/wiki — leader/admin
router.post('/', authenticate, isLeader, async (req, res) => {
  const { title, content, category, coverImage, isPublished } = req.body
  if (!title || !content) return res.status(400).json({ error: 'title and content required' })
  const slug = slugify(title, { lower: true, strict: true }) + '-' + Date.now()
  const page = await prisma.wikiPage.create({
    data: { title, slug, content, category: category || 'customs', coverImage, authorId: req.user.id, isPublished: isPublished !== false },
  })
  res.status(201).json(page)
})

// PATCH /api/wiki/:id
router.patch('/:id', authenticate, isLeader, async (req, res) => {
  const { title, content, category, coverImage, isPublished } = req.body
  const page = await prisma.wikiPage.update({
    where: { id: req.params.id },
    data: {
      ...(title       !== undefined && { title }),
      ...(content     !== undefined && { content }),
      ...(category    !== undefined && { category }),
      ...(coverImage  !== undefined && { coverImage }),
      ...(isPublished !== undefined && { isPublished: !!isPublished }),
    },
  })
  res.json(page)
})

// DELETE /api/wiki/:id
router.delete('/:id', authenticate, isAdmin, async (req, res) => {
  await prisma.wikiPage.delete({ where: { id: req.params.id } })
  res.json({ message: 'Deleted' })
})

module.exports = router
