const router     = require('express').Router()
const { prisma } = require('../config/database')
const multer     = require('multer')
const cloudinary = require('cloudinary').v2
const { authenticate, isAdmin } = require('../middleware/auth')

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key:    process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
})

const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 15*1024*1024 } })

// Upload any image to Cloudinary and return URL
router.post('/upload', authenticate, upload.single('file'), async (req, res) => {
  if (!req.file) return res.status(400).json({ error: 'No file provided' })

  // If Cloudinary not configured, return a placeholder response
  if (!process.env.CLOUDINARY_CLOUD_NAME) {
    return res.json({ url: `https://via.placeholder.com/1920x1080?text=${encodeURIComponent(req.file.originalname)}`, public_id: 'placeholder' })
  }

  try {
    const folder = req.body.folder || 'nkenkak/general'
    const b64 = Buffer.from(req.file.buffer).toString('base64')
    const dataURI = `data:${req.file.mimetype};base64,${b64}`
    const result  = await cloudinary.uploader.upload(dataURI, {
      folder,
      resource_type: 'image',
      transformation: [{ quality: 'auto', fetch_format: 'auto' }],
    })
    res.json({ url: result.secure_url, public_id: result.public_id, width: result.width, height: result.height })
  } catch (err) {
    console.error('Cloudinary error:', err.message)
    res.status(500).json({ error: 'Upload failed: ' + err.message })
  }
})

// GET /api/hero  — public, returns active slides
router.get('/', async (req, res) => {
  try {
    const slides = await prisma.heroSlide.findMany({
      where:   { isActive: true },
      orderBy: { sortOrder: 'asc' },
    })
    res.json(slides)
  } catch {
    res.json([]) // graceful if table doesn't exist yet
  }
})

// GET /api/hero/all  — admin, all slides
router.get('/all', authenticate, isAdmin, async (req, res) => {
  try {
    const slides = await prisma.heroSlide.findMany({ orderBy: { sortOrder: 'asc' } })
    res.json(slides)
  } catch {
    res.json([])
  }
})

// POST /api/hero
router.post('/', authenticate, isAdmin, async (req, res) => {
  const { title, subtitle, cta_text, cta_link, image_url, overlay_opacity, sort_order, is_active } = req.body
  if (!image_url) return res.status(400).json({ error: 'image_url required' })
  const slide = await prisma.heroSlide.create({
    data: { title, subtitle, ctaText: cta_text, ctaLink: cta_link,
            imageUrl: image_url, overlayOpacity: overlay_opacity ?? 0.45,
            sortOrder: sort_order ?? 99, isActive: is_active !== false },
  })
  res.status(201).json(slide)
})

// PATCH /api/hero/:id
router.patch('/:id', authenticate, isAdmin, async (req, res) => {
  const { title, subtitle, cta_text, cta_link, image_url, overlay_opacity, sort_order, is_active } = req.body
  const slide = await prisma.heroSlide.update({
    where: { id: req.params.id },
    data: {
      ...(title             !== undefined && { title }),
      ...(subtitle          !== undefined && { subtitle }),
      ...(cta_text          !== undefined && { ctaText: cta_text }),
      ...(cta_link          !== undefined && { ctaLink: cta_link }),
      ...(image_url         !== undefined && { imageUrl: image_url }),
      ...(overlay_opacity   !== undefined && { overlayOpacity: +overlay_opacity }),
      ...(sort_order        !== undefined && { sortOrder: +sort_order }),
      ...(is_active         !== undefined && { isActive: !!is_active }),
    },
  })
  res.json(slide)
})

// DELETE /api/hero/:id
router.delete('/:id', authenticate, isAdmin, async (req, res) => {
  const slide = await prisma.heroSlide.findUnique({ where: { id: req.params.id } })
  if (slide?.publicId && process.env.CLOUDINARY_CLOUD_NAME) {
    await cloudinary.uploader.destroy(slide.publicId).catch(() => {})
  }
  await prisma.heroSlide.delete({ where: { id: req.params.id } })
  res.json({ message: 'Deleted' })
})

module.exports = router
