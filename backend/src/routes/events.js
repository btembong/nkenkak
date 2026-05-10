const router = require('express').Router()
const { prisma } = require('../config/database')
const slugify   = require('slugify')
const { authenticate, optionalAuth, isLeader } = require('../middleware/auth')
const { sendEventConfirmation } = require('../services/email')
let sendPush; try { ({ sendPush } = require('./push')) } catch {}

router.get('/my-registrations', authenticate, async (req, res) => {
  const regs = await prisma.eventRegistration.findMany({
    where:   { userId: req.user.id },
    include: { event: { select: { id:true, title:true, slug:true, startDate:true, venue:true, coverImage:true, category:true, ticketPrice:true } } },
    orderBy: { createdAt: 'desc' },
  })
  res.json(regs)
})

router.get('/', async (req, res) => {
  const { upcoming, category, search, limit = 50 } = req.query
  const events = await prisma.event.findMany({
    where: {
      isPublished: true,
      ...(upcoming === 'true' && { startDate: { gt: new Date() } }),
      ...(category && { category }),
      ...(search   && { OR: [
        { title:       { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
      ]}),
    },
    include: {
      organizer:     { select: { firstName: true, lastName: true } },
      _count:        { select: { registrations: true } },
    },
    orderBy: { startDate: 'asc' },
    take: +limit,
  })
  res.json(events.map(e => ({
    ...e,
    organizer_name:     e.organizer ? `${e.organizer.firstName} ${e.organizer.lastName}` : e.organizerName,
    registration_count: e._count.registrations,
  })))
})

router.get('/:slug', optionalAuth, async (req, res) => {
  const event = await prisma.event.findUnique({
    where: { slug: req.params.slug },
    include: {
      organizer:  { select: { firstName: true, lastName: true, avatarUrl: true } },
      _count:     { select: { registrations: true } },
    },
  })
  if (!event) return res.status(404).json({ error: 'Not found' })

  // Check if current user is registered
  let userRegistration = null
  if (req.user) {
    userRegistration = await prisma.eventRegistration.findFirst({
      where: { eventId: event.id, userId: req.user.id },
    })
  }

  res.json({
    ...event,
    organizer_name:     event.organizer ? `${event.organizer.firstName} ${event.organizer.lastName}` : event.organizerName,
    registration_count: event._count.registrations,
    user_registration:  userRegistration,
  })
})

/* ── Register for event ── */
router.post('/:id/register', optionalAuth, async (req, res) => {
  const { name, email, phone, payment_ref } = req.body
  if (!name || !email) return res.status(400).json({ error: 'Name and email required' })

  const event = await prisma.event.findUnique({ where: { id: req.params.id } })
  if (!event) return res.status(404).json({ error: 'Event not found' })

  // Check capacity
  if (event.maxAttendees) {
    const count = await prisma.eventRegistration.count({ where: { eventId: event.id, status: { not: 'cancelled' } } })
    if (count >= event.maxAttendees) return res.status(400).json({ error: 'Event is fully booked' })
  }

  // Prevent duplicate registration
  if (req.user) {
    const existing = await prisma.eventRegistration.findFirst({ where: { eventId: event.id, userId: req.user.id } })
    if (existing) return res.status(409).json({ error: 'You are already registered for this event' })
  }

  const isPaid   = !!(event.ticketPrice && Number(event.ticketPrice) > 0)
  const ticketRef = `TK-${Date.now()}-${Math.random().toString(36).slice(2,5).toUpperCase()}`

  const reg = await prisma.eventRegistration.create({
    data: {
      eventId:  event.id,
      userId:   req.user?.id || null,
      name,
      email,
      phone:    phone || null,
      ticketRef,
      status:   'confirmed',
      isPaid,
      amount:   isPaid ? event.ticketPrice : null,
    },
  })

  // Confirmation email
  sendEventConfirmation({
    to:       email,
    name,
    event:    { title: event.title, startDate: event.startDate, venue: event.venue,
                isOnline: event.isOnline, meetingLink: event.meetingLink, ticketPrice: event.ticketPrice },
    ticketRef,
    isPaid,
  }).catch(() => {})

  res.status(201).json({ registration: reg, ticketRef })
})

/* ── Cancel registration ── */
router.delete('/:id/register', authenticate, async (req, res) => {
  const reg = await prisma.eventRegistration.findFirst({
    where: { eventId: req.params.id, userId: req.user.id },
  })
  if (!reg) return res.status(404).json({ error: 'Registration not found' })
  await prisma.eventRegistration.update({ where: { id: reg.id }, data: { status: 'cancelled' } })
  res.json({ message: 'Registration cancelled' })
})

/* ── Admin: list registrations ── */
router.get('/:id/registrations', authenticate, isLeader, async (req, res) => {
  const regs = await prisma.eventRegistration.findMany({
    where:   { eventId: req.params.id },
    orderBy: { createdAt: 'desc' },
  })
  res.json(regs)
})

router.post('/', authenticate, isLeader, async (req, res) => {
  const { title, description, category, start_date, end_date, venue, is_online,
          meeting_link, cover_image, max_attendees, requires_rsvp, is_featured,
          organizer_name, ticket_price, location_url } = req.body
  if (!title || !start_date) return res.status(400).json({ error: 'Title and start date required' })
  const slug = slugify(title, { lower: true, strict: true }) + '-' + Date.now()
  const event = await prisma.event.create({
    data: {
      slug, title, description: description || '', category: category || 'community',
      startDate:    new Date(start_date),
      endDate:      end_date ? new Date(end_date) : null,
      venue, locationUrl: location_url, isOnline: !!is_online, meetingLink: meeting_link,
      coverImage:   cover_image,
      maxAttendees: max_attendees ? +max_attendees : null,
      ticketPrice:  ticket_price ? +ticket_price : null,
      requiresRsvp: !!requires_rsvp, isFeatured: !!is_featured,
      organizerId:  req.user.id, organizerName: organizer_name,
    },
  })
  if (sendPush) {
    sendPush({ title: 'New Event', body: `${title} — ${venue || (is_online ? 'Online' : 'TBD')}`, url: `/events/${slug}` }).catch(() => {})
  }
  res.status(201).json(event)
})

router.patch('/:id', authenticate, isLeader, async (req, res) => {
  const { title, description, category, start_date, end_date, venue, is_online,
          meeting_link, cover_image, is_featured, is_published, ticket_price, location_url } = req.body
  const event = await prisma.event.update({
    where: { id: req.params.id },
    data: {
      ...(title        && { title }),
      ...(description  !== undefined && { description }),
      ...(category     && { category }),
      ...(start_date   && { startDate: new Date(start_date) }),
      ...(end_date     !== undefined && { endDate: end_date ? new Date(end_date) : null }),
      ...(venue        !== undefined && { venue }),
      ...(location_url !== undefined && { locationUrl: location_url }),
      ...(is_online    !== undefined && { isOnline: !!is_online }),
      ...(meeting_link !== undefined && { meetingLink: meeting_link }),
      ...(cover_image  !== undefined && { coverImage: cover_image }),
      ...(is_featured  !== undefined && { isFeatured: !!is_featured }),
      ...(is_published !== undefined && { isPublished: !!is_published }),
      ...(ticket_price !== undefined && { ticketPrice: ticket_price ? +ticket_price : null }),
    },
  })
  res.json(event)
})

router.delete('/:id', authenticate, isLeader, async (req, res) => {
  await prisma.event.delete({ where: { id: req.params.id } })
  res.json({ message: 'Deleted' })
})

module.exports = router
