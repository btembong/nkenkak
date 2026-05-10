const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient({
  log: process.env.NODE_ENV === 'development' ? ['warn', 'error'] : ['error'],
  errorFormat: 'minimal',
})

process.on('beforeExit', async () => { await prisma.$disconnect() })
process.on('SIGINT',     async () => { await prisma.$disconnect(); process.exit(0) })
process.on('SIGTERM',    async () => { await prisma.$disconnect(); process.exit(0) })

const ping = async () => {
  try {
    await prisma.$queryRaw`SELECT 1`
    console.log('✅ Database connected via Prisma')
  } catch (err) {
    console.warn('⚠️  Database ping failed (Neon may be waking up):', err.message)
    console.warn('   Server will start anyway — DB connects on first request')
  }
}

module.exports = { prisma, ping }
