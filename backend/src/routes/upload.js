const router = require('express').Router();
const multer = require('multer');
const { authenticate } = require('../middleware/auth');
const storage = multer.memoryStorage();
const upload = multer({ storage, limits: { fileSize: 10 * 1024 * 1024 } });
router.post('/', authenticate, upload.single('file'), async (req,res) => {
  if (!req.file) return res.status(400).json({error:'No file provided'});
  // TODO: Upload to Cloudinary
  // const result = await cloudinary.uploader.upload_stream(...)
  // For now, return a placeholder
  res.json({ url: '/placeholder-upload.jpg', message: 'Configure Cloudinary in .env to enable uploads' });
});
module.exports = router;
