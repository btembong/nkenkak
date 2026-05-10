const router     = require('express').Router()
const multer     = require('multer')
const cloudinary = require('cloudinary')
const { authenticate } = require('../middleware/auth')

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key:    process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
})

const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 10*1024*1024 } })

router.post('/image', authenticate, upload.single('file'), async (req, res) => {
  if (!req.file) return res.status(400).json({ error: 'No file uploaded' })
  if (!process.env.CLOUDINARY_CLOUD_NAME) return res.status(503).json({ error: 'Upload service not configured' })
  try {
    const b64    = Buffer.from(req.file.buffer).toString('base64')
    const dataURI = `data:${req.file.mimetype};base64,${b64}`
    const result  = await cloudinary.uploader.upload(dataURI, { folder: 'nkenkak', resource_type: 'auto' })
    res.json({ url: result.secure_url, public_id: result.public_id })
  } catch (err) {
    res.status(500).json({ error: 'Upload failed: ' + err.message })
  }
})

module.exports = router
