const { prisma } = require('../config/database')
const jwt = require('jsonwebtoken')

/**
 * Attach Socket.io chat logic to an http.Server instance.
 * Call this once in server.js: attachChat(httpServer)
 */
function attachChat(httpServer) {
  const { Server } = require('socket.io')
  const io = new Server(httpServer, {
    cors: { origin: process.env.CLIENT_URL || 'http://localhost:5173', credentials: true },
    path: '/socket.io',
  })

  // Middleware — optionally authenticate user from token
  io.use((socket, next) => {
    const token = socket.handshake.auth?.token
    if (token) {
      try {
        socket.user = jwt.verify(token, process.env.JWT_SECRET)
      } catch {
        try {
          socket.user = jwt.verify(token, process.env.JWT_REFRESH_SECRET)
        } catch {}
      }
    }
    next()
  })

  io.on('connection', (socket) => {
    // Join a chat room
    socket.on('join_room', (slug) => {
      socket.join(`room:${slug}`)
    })

    socket.on('leave_room', (slug) => {
      socket.leave(`room:${slug}`)
    })

    // Send a message
    socket.on('send_message', async ({ roomSlug, content, guestName }) => {
      if (!content?.trim()) return
      try {
        const room = await prisma.chatRoom.findUnique({ where: { slug: roomSlug } })
        if (!room) return

        const msg = await prisma.chatMessage.create({
          data: {
            roomId:    room.id,
            content:   content.trim().slice(0, 1000),
            userId:    socket.user?.id    || null,
            guestName: socket.user ? null : (guestName || 'Guest').slice(0, 40),
          },
          include: {
            user: { select: { id: true, firstName: true, lastName: true, avatarUrl: true, role: true } },
          },
        })

        io.to(`room:${roomSlug}`).emit('new_message', msg)
      } catch (err) {
        socket.emit('error', { message: 'Could not send message' })
      }
    })

    // Typing indicator
    socket.on('typing', ({ roomSlug, name }) => {
      socket.to(`room:${roomSlug}`).emit('user_typing', { name })
    })

    socket.on('stop_typing', ({ roomSlug }) => {
      socket.to(`room:${roomSlug}`).emit('user_stop_typing')
    })

    // DM real-time
    socket.on('join_dm', () => {
      if (socket.user?.id) socket.join(`dm:${socket.user.id}`)
    })

    socket.on('send_dm', async ({ recipientId, content }) => {
      if (!socket.user?.id || !content?.trim()) return
      try {
        const msg = await prisma.directMessage.create({
          data: { senderId: socket.user.id, recipientId, content: content.trim() },
          include: { sender: { select: { id: true, firstName: true, lastName: true, avatarUrl: true } } },
        })
        io.to(`dm:${recipientId}`).emit('new_dm', msg)
        socket.emit('new_dm', msg)
      } catch {}
    })
  })

  return io
}

module.exports = { attachChat }
