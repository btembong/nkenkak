const router = require('express').Router()
const { prisma } = require('../config/database')
const { authenticate, isAdmin } = require('../middleware/auth')

router.get('/', async (req, res) => {
  const { category } = req.query
  const words = await prisma.vocabWord.findMany({
    where: category ? { category } : undefined,
    orderBy: [{ category: 'asc' }, { sortOrder: 'asc' }, { word: 'asc' }],
  })
  res.json(words)
})

router.post('/', authenticate, isAdmin, async (req, res) => {
  const { word, translation, pronunciation, category, audio_url, example, sort_order } = req.body
  if (!word || !translation) return res.status(400).json({ error: 'Word and translation required' })
  const w = await prisma.vocabWord.create({
    data: { word, translation, pronunciation, category: category || 'general',
            audioUrl: audio_url, example, sortOrder: sort_order ? +sort_order : 0 },
  })
  res.status(201).json(w)
})

router.patch('/:id', authenticate, isAdmin, async (req, res) => {
  const { word, translation, pronunciation, category, audio_url, example, sort_order } = req.body
  const w = await prisma.vocabWord.update({
    where: { id: req.params.id },
    data: {
      ...(word          !== undefined && { word }),
      ...(translation   !== undefined && { translation }),
      ...(pronunciation !== undefined && { pronunciation }),
      ...(category      !== undefined && { category }),
      ...(audio_url     !== undefined && { audioUrl: audio_url }),
      ...(example       !== undefined && { example }),
      ...(sort_order    !== undefined && { sortOrder: +sort_order }),
    },
  })
  res.json(w)
})

router.delete('/:id', authenticate, isAdmin, async (req, res) => {
  await prisma.vocabWord.delete({ where: { id: req.params.id } })
  res.json({ message: 'Deleted' })
})

module.exports = router
