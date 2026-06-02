import { useState, useEffect, useMemo } from 'react'
import { useParams, Link } from 'react-router-dom'
import { useQuery, useQueryClient } from 'react-query'
import { format, isPast } from 'date-fns'
import api from '../../services/api'
import { useAuth } from '../../context/AuthContext'
import {
  ChevronRight, Clock, MapPin, Video, Users,
  CalendarDays, Gift, Ticket, CheckCircle2, Lock,
  ArrowLeft, CalendarCheck, Printer, ExternalLink,
  MapPinned, User, AlertCircle, ShieldCheck, CalendarX,
  Phone, Mail, Link2, CalendarPlus, MessageSquare, Send,
  ListOrdered, ChevronDown,
} from 'lucide-react'

/* ── helpers ── */
function calcTimeLeft(date) {
  const diff = date - Date.now()
  if (diff <= 0) return null
  return {
    d: Math.floor(diff / 86400000),
    h: Math.floor((diff % 86400000) / 3600000),
    m: Math.floor((diff % 3600000) / 60000),
    s: Math.floor((diff % 60000) / 1000),
  }
}

/* ── Load Flutterwave script once ── */
function loadFlw() {
  return new Promise(resolve => {
    if (window.FlutterwaveCheckout) return resolve()
    const s = document.createElement('script')
    s.src = 'https://checkout.flutterwave.com/v3.js'
    s.onload = resolve
    document.head.appendChild(s)
  })
}

export default function EventDetail() {
  const { slug } = useParams()
  const { user } = useAuth()
  const qc = useQueryClient()

  const { data: event, isLoading, error } = useQuery(
    ['event', slug],
    () => api.get(`/events/${slug}`).then(r => r.data),
    { retry: false }
  )

  if (isLoading) return <PageSkeleton />
  if (error || !event) return <NotFound />

  const isPaidEvent = event.ticketPrice && Number(event.ticketPrice) > 0
  const isOver      = isPast(new Date(event.startDate))
  const spotsLeft   = event.maxAttendees
    ? event.maxAttendees - (event.registration_count || 0)
    : null
  const isFull      = spotsLeft !== null && spotsLeft <= 0
  const hasReg      = event.user_registration && event.user_registration.status !== 'cancelled'

  const refresh = () => qc.invalidateQueries(['event', slug])

  return (
    <div className={!isOver && !isFull && !hasReg ? 'pb-20 lg:pb-0' : ''}>
      <EventHero event={event} isOver={isOver}/>

      <section className="py-14 bg-[#FAFAFA]">
        <div className="max-w-6xl mx-auto px-6">
          <div className="grid lg:grid-cols-3 gap-10">

            {/* Left */}
            <div className="lg:col-span-2 space-y-7">
              <AboutSection event={event}/>
              {event.registrants?.length > 0 && <AttendeesStrip registrants={event.registrants} count={event.registration_count}/>}
              {event.agenda?.length > 0 && <AgendaSection agenda={event.agenda}/>}
              {event.isOnline && event.meetingLink && <OnlineSection link={event.meetingLink}/>}
              {event.locationUrl && !event.isOnline && <LocationSection event={event}/>}
              <OrganizerSection event={event}/>
              <CommentsSection eventId={event.id}/>
            </div>

            {/* Right */}
            <div>
              <RegistrationPanel
                event={event}
                isPaidEvent={isPaidEvent}
                isOver={isOver}
                isFull={isFull}
                spotsLeft={spotsLeft}
                user={user}
                onSuccess={refresh}
              />
            </div>
          </div>
        </div>
      </section>

      <RelatedEvents currentId={event.id} category={event.category}/>

      {!isOver && !isFull && !hasReg && (
        <MobileStickyBar event={event} isPaidEvent={isPaidEvent}/>
      )}
    </div>
  )
}

/* ════════════════════════════════════════
   HERO
════════════════════════════════════════ */
function EventHero({ event, isOver }) {
  const d = new Date(event.startDate)
  const [timeLeft, setTimeLeft] = useState(() => calcTimeLeft(d))
  const [copied, setCopied]     = useState(false)
  const showCountdown = !isOver && timeLeft && (d - Date.now()) < 7 * 24 * 3600 * 1000

  useEffect(() => {
    if (isOver) return
    if ((d - Date.now()) > 7 * 24 * 3600 * 1000) return
    const id = setInterval(() => setTimeLeft(calcTimeLeft(d)), 1000)
    return () => clearInterval(id)
  }, [])

  const copyLink = async () => {
    await navigator.clipboard.writeText(window.location.href)
    setCopied(true)
    setTimeout(() => setCopied(false), 2200)
  }

  return (
    <div className="relative overflow-hidden" style={{ minHeight: 480 }}>
      {event.coverImage ? (
        <>
          <img src={event.coverImage} alt=""
            className="absolute inset-0 w-full h-full object-cover"/>
          <div className="absolute inset-0"
            style={{ background: 'linear-gradient(to right, rgba(6,2,16,0.93) 40%, rgba(6,2,16,0.55) 100%)' }}/>
        </>
      ) : (
        <div className="absolute inset-0"
          style={{ background: 'linear-gradient(135deg, #1A0A35 0%, #5B2D8E 100%)' }}/>
      )}
      <div className="absolute top-0 right-0 w-[600px] h-[600px] rounded-full pointer-events-none opacity-20"
        style={{ background: 'radial-gradient(circle, #7B4DB8, transparent)', transform: 'translate(40%,-40%)' }}/>

      <div className="relative max-w-6xl mx-auto px-6 py-12 flex flex-col" style={{ minHeight: 480 }}>
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 mb-auto">
          <Link to="/events"
            className="flex items-center gap-1.5 text-xs font-semibold text-white/60 hover:text-white transition-colors">
            <ArrowLeft className="w-3.5 h-3.5"/> Events
          </Link>
          <ChevronRight className="w-3 h-3 text-white/25"/>
          {event.category && (
            <span className="text-[10px] font-bold uppercase tracking-wider text-white/40 capitalize">
              {event.category}
            </span>
          )}
          {event.isFeatured && (
            <span className="text-[10px] font-semibold text-gold/60 ml-1">★ Featured</span>
          )}
          {isOver && (
            <span className="text-[10px] font-medium text-white/30 ml-2">Past Event</span>
          )}
        </div>

        {/* Content */}
        <div className="mt-10 mb-6">
          {/* Inline date + price pill */}
          <div className="flex items-center gap-3 mb-5 flex-wrap">
            <div className="flex items-center gap-3 px-4 py-2.5 rounded-2xl"
              style={{ background: 'rgba(255,255,255,0.1)', border: '1px solid rgba(255,255,255,0.1)', backdropFilter: 'blur(8px)' }}>
              <div className="text-center">
                <div className="font-display font-bold text-2xl leading-none text-white">{format(d, 'd')}</div>
                <div className="text-[9px] font-bold uppercase tracking-widest text-white/60 mt-0.5">
                  {format(d, 'MMM yyyy')}
                </div>
              </div>
              <div className="w-px h-8 bg-white/15"/>
              <div className="text-xs text-white/65 font-medium">{format(d, 'EEEE')}</div>
            </div>
            {event.ticketPrice && Number(event.ticketPrice) > 0 ? (
              <span className="text-xs font-bold px-3 py-1.5 rounded-full text-white"
                style={{ background: 'rgba(200,120,0,0.85)' }}>
                {Number(event.ticketPrice).toLocaleString()} XAF
              </span>
            ) : (
              <span className="text-xs font-bold px-3 py-1.5 rounded-full text-white"
                style={{ background: 'rgba(91,45,142,0.7)' }}>
                Free Entry
              </span>
            )}
          </div>

          <h1 className="font-display font-bold text-3xl md:text-5xl text-white leading-tight mb-5 max-w-2xl">
            {event.title}
          </h1>

          <div className="flex flex-wrap gap-x-6 gap-y-2 text-sm text-white/65 mb-6">
            <span className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-gold/70"/>
              {format(d, 'h:mm a')}
              {event.endDate && ` – ${format(new Date(event.endDate), 'h:mm a')}`}
            </span>
            {event.venue && (
              <span className="flex items-center gap-2">
                <MapPin className="w-4 h-4 text-gold/70"/>{event.venue}
              </span>
            )}
            {event.isOnline && (
              <span className="flex items-center gap-2">
                <Video className="w-4 h-4 text-primary-400"/>Online Event
              </span>
            )}
            {event.registration_count > 0 && (
              <span className="flex items-center gap-2">
                <Users className="w-4 h-4 text-white/40"/>
                {event.registration_count} registered
              </span>
            )}
          </div>

          {/* Countdown (≤ 7 days) */}
          {showCountdown && timeLeft && (
            <div className="flex items-center gap-3 mb-6 flex-wrap">
              <span className="text-[10px] font-bold uppercase tracking-wider text-white/40">Starts in</span>
              {[
                [timeLeft.d, 'days'],
                [timeLeft.h, 'hrs'],
                [timeLeft.m, 'min'],
                [timeLeft.s, 'sec'],
              ].filter(([val, label]) => timeLeft.d > 0 || label !== 'sec').map(([val, label]) => (
                <div key={label} className="rounded-xl px-3 py-2 text-center min-w-[48px]"
                  style={{ background: 'rgba(255,255,255,0.1)', border: '1px solid rgba(255,255,255,0.1)' }}>
                  <div className="font-display font-bold text-xl leading-none text-white">
                    {String(val).padStart(2, '0')}
                  </div>
                  <div className="text-[8px] font-semibold uppercase tracking-wider text-white/45 mt-0.5">
                    {label}
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Share bar */}
          <div className="flex items-center gap-3 flex-wrap">
            <span className="text-[10px] font-bold uppercase tracking-wider text-white/35">Share</span>
            <a href={`https://wa.me/?text=${encodeURIComponent(event.title + ' — ' + window.location.href)}`}
              target="_blank" rel="noopener noreferrer"
              className="text-[10px] font-bold px-3 py-1.5 rounded-full text-white transition-opacity hover:opacity-75"
              style={{ background: 'rgba(37,211,102,0.22)', border: '1px solid rgba(37,211,102,0.2)' }}>
              WhatsApp
            </a>
            <button onClick={copyLink}
              className="flex items-center gap-1.5 text-[10px] font-bold px-3 py-1.5 rounded-full text-white transition-all"
              style={{
                background: copied ? 'rgba(22,163,74,0.3)' : 'rgba(255,255,255,0.1)',
                border: '1px solid rgba(255,255,255,0.1)',
              }}>
              <Link2 className="w-3 h-3"/>
              {copied ? 'Copied!' : 'Copy Link'}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

/* ════════════════════════════════════════
   ABOUT
════════════════════════════════════════ */
function AboutSection({ event }) {
  return (
    <div className="card p-7">
      <h2 className="font-display font-bold text-xl mb-5 flex items-center gap-3 text-dark">
        <span className="w-1 h-6 rounded-full flex-shrink-0"
          style={{ background: 'linear-gradient(to bottom,#5B2D8E,#F0A500)' }}/>
        About This Event
      </h2>
      {event.description ? (
        <div className="text-sm leading-relaxed whitespace-pre-line text-[#525252]">
          {event.description}
        </div>
      ) : (
        <p className="text-sm italic text-muted-foreground">No description provided.</p>
      )}

      {/* Compact detail strip */}
      <div className="flex flex-wrap gap-x-5 gap-y-3 mt-6 pt-5 border-t"
        style={{ borderColor: 'rgba(91,45,142,0.08)' }}>
        <StripItem Icon={CalendarDays} value={format(new Date(event.startDate), 'EEEE, MMMM d yyyy')}/>
        <StripItem Icon={Clock} value={
          event.endDate
            ? `${format(new Date(event.startDate), 'h:mm a')} – ${format(new Date(event.endDate), 'h:mm a')}`
            : format(new Date(event.startDate), 'h:mm a')
        }/>
        {event.venue && <StripItem Icon={MapPin} value={event.venue}/>}
        {event.maxAttendees && (
          <StripItem Icon={Users}
            value={`${event.registration_count || 0} / ${event.maxAttendees} registered`}/>
        )}
        {event.isOnline && <StripItem Icon={Video} value="Online Event"/>}
        {event.ticketPrice && Number(event.ticketPrice) > 0
          ? <StripItem Icon={Ticket} value={`${Number(event.ticketPrice).toLocaleString()} XAF per ticket`}/>
          : <StripItem Icon={Gift} value="Free Entry"/>
        }
      </div>
    </div>
  )
}

function StripItem({ Icon, value }) {
  return (
    <div className="flex items-center gap-2 text-xs text-[#525252]">
      <Icon className="w-3.5 h-3.5 flex-shrink-0 text-primary-500/65"/>
      <span>{value}</span>
    </div>
  )
}

/* ════════════════════════════════════════
   ONLINE / LOCATION
════════════════════════════════════════ */
function OnlineSection() {
  return (
    <div className="card p-6 flex items-center gap-5">
      <div className="w-12 h-12 rounded-2xl flex items-center justify-center flex-shrink-0 bg-primary-500/10">
        <Video className="w-5 h-5 text-primary-500"/>
      </div>
      <div>
        <div className="font-display font-semibold text-sm mb-1 text-dark">Online Event</div>
        <div className="text-xs text-muted-foreground">
          Meeting link will be shared with registered attendees.
        </div>
      </div>
    </div>
  )
}

function LocationSection({ event }) {
  return (
    <div className="card p-6">
      <h3 className="font-display font-semibold text-base mb-4 flex items-center gap-2 text-dark">
        <MapPinned className="w-4 h-4 text-primary-500"/> Location
      </h3>
      <p className="text-sm mb-4 text-[#525252]">{event.venue}</p>
      <a href={event.locationUrl} target="_blank" rel="noreferrer"
        className="inline-flex items-center gap-2 text-xs font-semibold px-4 py-2 rounded-xl bg-primary-500/10 text-primary-500">
        <ExternalLink className="w-3.5 h-3.5"/> View on Map
      </a>
    </div>
  )
}

/* ════════════════════════════════════════
   ORGANIZER
════════════════════════════════════════ */
function OrganizerSection({ event }) {
  const name = event.organizer_name || event.organizerName ||
    (event.organizer
      ? `${event.organizer.firstName} ${event.organizer.lastName}`
      : 'Nkenkak-Ngiesang')
  const avatar = event.organizer?.avatarUrl
  const phone  = event.organizer?.phone
  const email  = event.organizer?.email

  return (
    <div className="card p-6">
      <h3 className="text-[10px] font-bold uppercase tracking-wider mb-4 text-muted-foreground">Organiser</h3>
      <div className="flex items-center gap-4">
        <div className="w-14 h-14 rounded-2xl flex items-center justify-center flex-shrink-0 overflow-hidden"
          style={{
            background: 'linear-gradient(135deg,rgba(91,45,142,0.1),rgba(91,45,142,0.18))',
            border: '1px solid rgba(91,45,142,0.12)',
          }}>
          {avatar
            ? <img src={avatar} alt={name} className="w-full h-full object-cover"/>
            : <span className="font-display font-bold text-xl text-primary-500">
                {name[0]?.toUpperCase()}
              </span>
          }
        </div>
        <div className="flex-1">
          <div className="font-display font-semibold text-base text-dark">{name}</div>
          {(phone || email) && (
            <div className="flex flex-wrap gap-4 mt-1.5">
              {phone && (
                <a href={`tel:${phone}`}
                  className="flex items-center gap-1.5 text-xs text-primary-500 hover:underline">
                  <Phone className="w-3 h-3"/>{phone}
                </a>
              )}
              {email && (
                <a href={`mailto:${email}`}
                  className="flex items-center gap-1.5 text-xs text-primary-500 hover:underline">
                  <Mail className="w-3 h-3"/>{email}
                </a>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

/* ════════════════════════════════════════
   ADD TO CALENDAR
════════════════════════════════════════ */
function AddToCalendar({ event }) {
  const [open, setOpen] = useState(false)

  const fmtIcs = d => format(d, "yyyyMMdd'T'HHmmss")
  const start  = new Date(event.startDate)
  const end    = event.endDate ? new Date(event.endDate) : new Date(start.getTime() + 2 * 3600000)

  const gcalUrl = `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${encodeURIComponent(event.title)}&dates=${fmtIcs(start)}/${fmtIcs(end)}&details=${encodeURIComponent(event.description || '')}&location=${encodeURIComponent(event.venue || '')}`

  const downloadIcs = () => {
    const ics = [
      'BEGIN:VCALENDAR',
      'VERSION:2.0',
      'BEGIN:VEVENT',
      `SUMMARY:${event.title}`,
      `DTSTART:${fmtIcs(start)}`,
      `DTEND:${fmtIcs(end)}`,
      `LOCATION:${event.venue || ''}`,
      `DESCRIPTION:${(event.description || '').replace(/\n/g, '\\n')}`,
      'END:VEVENT',
      'END:VCALENDAR',
    ].join('\r\n')
    const blob = new Blob([ics], { type: 'text/calendar;charset=utf-8' })
    const a = document.createElement('a')
    a.href = URL.createObjectURL(blob)
    a.download = `${event.slug || 'event'}.ics`
    a.click()
    URL.revokeObjectURL(a.href)
    setOpen(false)
  }

  return (
    <div className="relative">
      <button onClick={() => setOpen(v => !v)}
        className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl text-xs font-semibold transition-all"
        style={{ background: 'rgba(91,45,142,0.06)', color: '#5B2D8E', border: '1px solid rgba(91,45,142,0.12)' }}>
        <CalendarPlus className="w-3.5 h-3.5"/> Add to Calendar
      </button>
      {open && (
        <>
          <div className="fixed inset-0 z-10" onClick={() => setOpen(false)}/>
          <div className="absolute bottom-full mb-2 left-0 right-0 rounded-2xl overflow-hidden z-20"
            style={{
              background: '#fff',
              boxShadow: '0 8px 32px rgba(26,10,53,0.15)',
              border: '1px solid rgba(91,45,142,0.1)',
            }}>
            <a href={gcalUrl} target="_blank" rel="noopener noreferrer"
              onClick={() => setOpen(false)}
              className="flex items-center gap-3 px-4 py-3 text-xs font-semibold hover:bg-primary-500/5 transition-colors text-dark">
              <CalendarDays className="w-4 h-4 text-primary-500"/>
              Google Calendar
            </a>
            <button onClick={downloadIcs}
              className="w-full flex items-center gap-3 px-4 py-3 text-xs font-semibold hover:bg-primary-500/5 transition-colors text-dark">
              <CalendarDays className="w-4 h-4 text-muted-foreground"/>
              Apple Calendar / iCal (.ics)
            </button>
          </div>
        </>
      )}
    </div>
  )
}

/* ════════════════════════════════════════
   REGISTRATION PANEL
════════════════════════════════════════ */
function RegistrationPanel({ event, isPaidEvent, isOver, isFull, spotsLeft, user, onSuccess }) {
  const [step, setStep]             = useState('info')
  const [loading, setLoading]       = useState(false)
  const [error, setError]           = useState('')
  const [ticket, setTicket]         = useState(null)
  const [cancelling, setCancelling] = useState(false)

  const existingReg = event.user_registration

  const handleCancel = async () => {
    if (!window.confirm('Cancel your registration?')) return
    setCancelling(true)
    try {
      await api.delete(`/events/${event.id}/register`)
      onSuccess()
    } catch {
      alert('Failed to cancel. Please try again.')
    } finally {
      setCancelling(false)
    }
  }

  /* Already registered */
  if (existingReg && existingReg.status !== 'cancelled') {
    return (
      <div id="registration-panel" className="card p-6 sticky top-24">
        <div className="text-center mb-6">
          <div className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-3"
            style={{ background: 'linear-gradient(135deg,#16a34a,#22c55e)', boxShadow: '0 6px 20px rgba(22,163,74,0.3)' }}>
            <CheckCircle2 className="w-8 h-8 text-white"/>
          </div>
          <h3 className="font-display font-bold text-lg text-dark">You're Registered!</h3>
          <p className="text-xs mt-1 text-muted-foreground">See you at the event.</p>
        </div>
        <div className="rounded-2xl p-4 mb-5"
          style={{ background: 'rgba(91,45,142,0.04)', border: '1px solid rgba(91,45,142,0.08)' }}>
          <div className="text-[10px] uppercase tracking-wider font-semibold mb-1 text-muted-foreground">
            Ticket Reference
          </div>
          <div className="font-display font-bold text-lg tracking-wider text-primary-500">
            {existingReg.ticketRef}
          </div>
        </div>
        <TicketDetails event={event} isPaidEvent={isPaidEvent}/>
        <div className="space-y-2 mt-4">
          <AddToCalendar event={event}/>
          <button onClick={() => window.print()}
            className="w-full py-2.5 rounded-xl text-xs font-semibold flex items-center justify-center gap-2 text-primary-500"
            style={{ background: 'rgba(91,45,142,0.06)', border: '1px solid rgba(91,45,142,0.12)' }}>
            <Printer className="w-3.5 h-3.5"/>Print Ticket
          </button>
          {!isOver && (
            <button onClick={handleCancel} disabled={cancelling}
              className="w-full py-2.5 rounded-xl text-xs font-semibold text-red-600"
              style={{ background: 'rgba(220,38,38,0.06)', border: '1px solid rgba(220,38,38,0.15)' }}>
              {cancelling ? 'Cancelling…' : 'Cancel Registration'}
            </button>
          )}
        </div>
      </div>
    )
  }

  /* Success */
  if (step === 'success') {
    return (
      <div id="registration-panel" className="card p-6 sticky top-24">
        <SuccessView ticket={ticket} event={event}/>
      </div>
    )
  }

  /* Info */
  if (step === 'info') {
    return (
      <div id="registration-panel" className="card p-6 sticky top-24 space-y-5">
        <div className="text-center py-4 rounded-2xl"
          style={{ background: isPaidEvent ? 'rgba(91,45,142,0.06)' : 'rgba(91,45,142,0.04)' }}>
          {isPaidEvent ? (
            <>
              <div className="text-3xl font-display font-bold text-primary-500">
                {Number(event.ticketPrice).toLocaleString()} XAF
              </div>
              <div className="text-xs mt-1 font-semibold text-muted-foreground">per ticket</div>
            </>
          ) : (
            <>
              <div className="text-3xl font-display font-bold text-primary-500">Free</div>
              <div className="text-xs mt-1 font-semibold text-muted-foreground">no ticket required</div>
            </>
          )}
        </div>

        {spotsLeft !== null && (
          <div>
            <div className="flex justify-between text-xs mb-1.5 text-muted-foreground">
              <span>{event.registration_count || 0} registered</span>
              <span className={`font-semibold ${isFull ? 'text-red-500' : 'text-primary-500'}`}>
                {isFull ? 'Fully booked' : `${spotsLeft} spot${spotsLeft === 1 ? '' : 's'} left`}
              </span>
            </div>
            <div className="w-full h-2 rounded-full overflow-hidden" style={{ background: 'rgba(91,45,142,0.08)' }}>
              <div className="h-full rounded-full transition-all"
                style={{
                  width: `${Math.min(100, ((event.registration_count || 0) / event.maxAttendees) * 100)}%`,
                  background: isFull ? '#dc2626' : 'linear-gradient(to right,#5B2D8E,#F0A500)',
                }}/>
            </div>
          </div>
        )}

        <TicketDetails event={event} isPaidEvent={isPaidEvent}/>

        {isOver ? (
          <div className="text-center py-4 rounded-2xl text-sm font-semibold text-muted-foreground"
            style={{ background: 'rgba(0,0,0,0.04)' }}>
            This event has ended
          </div>
        ) : isFull ? (
          <button onClick={() => setStep('waitlist')}
            className="w-full py-3.5 rounded-2xl font-display font-bold text-sm transition-all hover:opacity-90"
            style={{ background: 'rgba(240,165,0,0.1)', color: '#C87800', border: '1px solid rgba(240,165,0,0.25)' }}>
            Join Waitlist
          </button>
        ) : (
          <>
            <button onClick={() => setStep('form')}
              className="w-full py-3.5 rounded-2xl font-display font-bold text-sm text-white transition-all hover:opacity-90 active:scale-[0.98] flex items-center justify-center gap-2"
              style={{ background: 'linear-gradient(135deg,#5B2D8E,#7B4DB8)', boxShadow: '0 6px 24px rgba(91,45,142,0.4)' }}>
              {isPaidEvent ? <Ticket className="w-4 h-4"/> : <CalendarCheck className="w-4 h-4"/>}
              {isPaidEvent ? 'Get Your Ticket' : 'Register for Free'}
            </button>
            <AddToCalendar event={event}/>
          </>
        )}
      </div>
    )
  }

  /* Waitlist */
  if (step === 'waitlist') {
    return (
      <div id="registration-panel" className="card p-6 sticky top-24">
        <button onClick={() => { setStep('info'); setError('') }}
          className="flex items-center gap-2 text-xs mb-5 transition-colors text-muted-foreground">
          <ArrowLeft className="w-3 h-3"/> Back
        </button>
        <h3 className="font-display font-bold text-lg mb-2 text-dark">Join the Waitlist</h3>
        <p className="text-xs text-muted-foreground mb-5">
          We'll notify you if a spot opens up.
        </p>
        <WaitlistForm
          event={event}
          user={user}
          loading={loading}
          error={error}
          setLoading={setLoading}
          setError={setError}
          onSuccess={() => { setStep('waitlist-success') }}
        />
      </div>
    )
  }

  if (step === 'waitlist-success') {
    return (
      <div id="registration-panel" className="card p-6 sticky top-24 text-center">
        <div className="w-14 h-14 rounded-full flex items-center justify-center mx-auto mb-4"
          style={{ background: 'rgba(240,165,0,0.12)', border: '2px solid rgba(240,165,0,0.3)' }}>
          <CheckCircle2 className="w-7 h-7" style={{ color: '#C87800' }}/>
        </div>
        <h3 className="font-display font-bold text-lg mb-1 text-dark">You're on the waitlist!</h3>
        <p className="text-xs text-muted-foreground">We'll contact you if a spot becomes available.</p>
      </div>
    )
  }

  /* Form */
  return (
    <div id="registration-panel" className="card p-6 sticky top-24">
      <button onClick={() => { setStep('info'); setError('') }}
        className="flex items-center gap-2 text-xs mb-5 transition-colors text-muted-foreground">
        <ArrowLeft className="w-3 h-3"/> Back
      </button>
      <h3 className="font-display font-bold text-lg mb-5 text-dark">
        {isPaidEvent ? 'Secure Your Ticket' : 'Register for This Event'}
      </h3>
      <RegistrationForm
        event={event}
        isPaidEvent={isPaidEvent}
        user={user}
        loading={loading}
        error={error}
        setLoading={setLoading}
        setError={setError}
        onSuccess={(ref) => { setTicket(ref); setStep('success') }}
      />
    </div>
  )
}

/* ════════════════════════════════════════
   REGISTRATION FORM
════════════════════════════════════════ */
function RegistrationForm({ event, isPaidEvent, user, loading, error, setLoading, setError, onSuccess }) {
  const [name,  setName]  = useState(user ? `${user.firstName} ${user.lastName}` : '')
  const [email, setEmail] = useState(user?.email || '')
  const [phone, setPhone] = useState(user?.phone || '')

  const submit = async (e) => {
    e.preventDefault()
    if (!name.trim() || !email.trim()) return setError('Name and email are required.')
    setError('')
    if (isPaidEvent) {
      await handlePaidRegistration()
    } else {
      await handleFreeRegistration()
    }
  }

  const handleFreeRegistration = async () => {
    setLoading(true)
    try {
      const res = await api.post(`/events/${event.id}/register`, { name, email, phone })
      onSuccess(res.data.ticketRef)
    } catch (err) {
      setError(err.response?.data?.error || 'Registration failed. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const handlePaidRegistration = async () => {
    setLoading(true)
    try {
      const cfgRes = await api.post('/donations/initiate', {
        amount:      Number(event.ticketPrice),
        provider:    'flutterwave',
        donor_name:  name,
        donor_email: email,
        donor_phone: phone || undefined,
        message:     `Event ticket: ${event.title}`,
      })
      const { tx_ref, flw_public_key, amount, currency } = cfgRes.data

      if (!flw_public_key) {
        const res = await api.post(`/events/${event.id}/register`, { name, email, phone })
        onSuccess(res.data.ticketRef)
        setLoading(false)
        return
      }

      await loadFlw()
      setLoading(false)

      window.FlutterwaveCheckout({
        public_key:  flw_public_key,
        tx_ref, amount, currency,
        customer:   { email, name, phone_number: phone },
        meta:       { event_id: event.id, event_title: event.title },
        customizations: {
          title:       event.title,
          description: 'Event ticket registration',
          logo:        '',
        },
        callback: async (response) => {
          if (response.status === 'successful' || response.status === 'completed') {
            setLoading(true)
            try {
              const regRes = await api.post(`/events/${event.id}/register`, {
                name, email, phone,
                payment_ref: response.transaction_id || tx_ref,
              })
              onSuccess(regRes.data.ticketRef)
            } catch (err) {
              setError(err.response?.data?.error || 'Payment received but registration failed. Contact support.')
            } finally {
              setLoading(false)
            }
          }
        },
        onclose: () => setLoading(false),
      })
    } catch (err) {
      setError(err.response?.data?.error || 'Could not initiate payment. Try again.')
      setLoading(false)
    }
  }

  return (
    <form onSubmit={submit} className="space-y-4">
      <Field label="Full Name *" value={name} onChange={setName} placeholder="Your full name" Icon={User}/>
      <Field label="Email Address *" value={email} onChange={setEmail} placeholder="you@example.com" Icon={Mail} type="email"/>
      <Field label="Phone Number" value={phone} onChange={setPhone} placeholder="+237 6XX XXX XXX" Icon={Phone}/>

      {isPaidEvent && (
        <div className="rounded-2xl p-4"
          style={{ background: 'rgba(91,45,142,0.06)', border: '1px solid rgba(91,45,142,0.12)' }}>
          <div className="flex items-center justify-between text-sm">
            <span className="text-[#525252]">Ticket Price</span>
            <span className="font-display font-bold text-primary-500">
              {Number(event.ticketPrice).toLocaleString()} XAF
            </span>
          </div>
        </div>
      )}

      {error && (
        <div className="rounded-xl p-3 text-xs flex items-start gap-2"
          style={{ background: 'rgba(220,38,38,0.06)', color: '#dc2626', border: '1px solid rgba(220,38,38,0.15)' }}>
          <AlertCircle className="w-3.5 h-3.5 mt-0.5 flex-shrink-0"/>
          {error}
        </div>
      )}

      <button type="submit" disabled={loading}
        className="w-full py-3.5 rounded-2xl font-display font-bold text-sm text-white transition-all hover:opacity-90 active:scale-[0.98] flex items-center justify-center gap-2 disabled:opacity-60"
        style={{ background: 'linear-gradient(135deg,#5B2D8E,#7B4DB8)', boxShadow: '0 6px 24px rgba(91,45,142,0.4)' }}>
        {loading ? (
          <>
            <div className="w-4 h-4 rounded-full border-2 border-white/30 border-t-white animate-spin"/>
            {isPaidEvent ? 'Opening Payment…' : 'Registering…'}
          </>
        ) : (
          <>
            {isPaidEvent ? <Lock className="w-4 h-4"/> : <CalendarCheck className="w-4 h-4"/>}
            {isPaidEvent ? `Pay ${Number(event.ticketPrice).toLocaleString()} XAF` : 'Confirm Registration'}
          </>
        )}
      </button>

      {isPaidEvent && (
        <p className="text-center text-[10px] flex items-center justify-center gap-1 text-muted-foreground">
          <ShieldCheck className="w-3 h-3"/> Secured by Flutterwave
        </p>
      )}
    </form>
  )
}

function Field({ label, value, onChange, placeholder, Icon, type = 'text' }) {
  return (
    <div>
      <label className="block text-xs font-semibold mb-1.5 text-[#525252]">{label}</label>
      <div className="relative">
        <Icon className="absolute left-3.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-primary-500/40"/>
        <input
          type={type}
          value={value}
          onChange={e => onChange(e.target.value)}
          placeholder={placeholder}
          className="w-full pl-9 pr-4 py-3 rounded-xl text-sm outline-none transition-all text-dark"
          style={{ background: '#F8F5FF', border: '1.5px solid rgba(91,45,142,0.12)' }}
          onFocus={e => { e.target.style.borderColor = '#5B2D8E'; e.target.style.background = '#fff' }}
          onBlur={e => { e.target.style.borderColor = 'rgba(91,45,142,0.12)'; e.target.style.background = '#F8F5FF' }}
        />
      </div>
    </div>
  )
}

/* ════════════════════════════════════════
   TICKET DETAILS (shared)
════════════════════════════════════════ */
function TicketDetails({ event, isPaidEvent }) {
  const d = new Date(event.startDate)
  return (
    <div className="space-y-2.5">
      <InfoRow Icon={CalendarDays} value={format(d, 'MMMM d, yyyy')}/>
      <InfoRow Icon={Clock} value={
        event.endDate
          ? `${format(d, 'h:mm a')} – ${format(new Date(event.endDate), 'h:mm a')}`
          : format(d, 'h:mm a')
      }/>
      {event.venue && <InfoRow Icon={MapPin} value={event.venue}/>}
      {event.isOnline && <InfoRow Icon={Video} value="Online Event"/>}
      {isPaidEvent
        ? <InfoRow Icon={Ticket} value={`${Number(event.ticketPrice).toLocaleString()} XAF`}/>
        : <InfoRow Icon={Gift} value="Free Admission"/>
      }
    </div>
  )
}

function InfoRow({ Icon, value }) {
  return (
    <div className="flex items-center gap-3 text-xs text-[#525252]">
      <Icon className="w-3.5 h-3.5 flex-shrink-0 text-primary-500"/>
      <span>{value}</span>
    </div>
  )
}

/* ════════════════════════════════════════
   SUCCESS VIEW — ticket stub
════════════════════════════════════════ */
function SuccessView({ ticket, event }) {
  const d = new Date(event.startDate)
  return (
    <div className="text-center">
      <div className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4"
        style={{ background: 'linear-gradient(135deg,#16a34a,#22c55e)', boxShadow: '0 8px 24px rgba(22,163,74,0.3)' }}>
        <CheckCircle2 className="w-8 h-8 text-white"/>
      </div>
      <h3 className="font-display font-bold text-xl mb-1 text-dark">You're In!</h3>
      <p className="text-xs mb-6 text-muted-foreground">Confirmed. Check your email for details.</p>

      {/* Ticket stub */}
      <div className="rounded-3xl overflow-hidden mb-5"
        style={{ boxShadow: '0 8px 32px rgba(91,45,142,0.18)', border: '1px solid rgba(91,45,142,0.12)' }}>
        <div className="p-5 text-left text-white"
          style={{ background: 'linear-gradient(135deg,#1A0A35,#5B2D8E)' }}>
          <div className="text-[9px] font-bold uppercase tracking-[0.15em] opacity-50 mb-2">Event Ticket</div>
          <div className="font-display font-bold text-base leading-snug">{event.title}</div>
          {event.category && (
            <div className="text-[10px] mt-1 opacity-40 capitalize">{event.category}</div>
          )}
        </div>
        {/* Tear line */}
        <div className="flex items-center" style={{ background: 'rgba(91,45,142,0.03)' }}>
          <div className="w-5 h-5 rounded-full flex-shrink-0 -ml-2.5" style={{ background: '#fff' }}/>
          <div className="flex-1 border-t-2 border-dashed" style={{ borderColor: 'rgba(91,45,142,0.12)' }}/>
          <div className="w-5 h-5 rounded-full flex-shrink-0 -mr-2.5" style={{ background: '#fff' }}/>
        </div>
        {/* Details */}
        <div className="p-5 space-y-2.5" style={{ background: 'rgba(91,45,142,0.02)' }}>
          <div className="flex justify-between text-xs">
            <span className="text-muted-foreground">Date</span>
            <span className="font-semibold text-dark">{format(d, 'MMMM d, yyyy')}</span>
          </div>
          <div className="flex justify-between text-xs">
            <span className="text-muted-foreground">Time</span>
            <span className="font-semibold text-dark">{format(d, 'h:mm a')}</span>
          </div>
          {event.venue && (
            <div className="flex justify-between text-xs gap-4">
              <span className="text-muted-foreground flex-shrink-0">Venue</span>
              <span className="font-semibold text-dark text-right">{event.venue}</span>
            </div>
          )}
          <div className="pt-3 mt-1 border-t" style={{ borderColor: 'rgba(91,45,142,0.1)' }}>
            <div className="text-[9px] font-bold uppercase tracking-[0.15em] text-muted-foreground mb-1.5">
              Reference
            </div>
            <div className="font-display font-bold text-xl tracking-widest text-primary-500">{ticket}</div>
          </div>
        </div>
      </div>

      <div className="flex items-center justify-center gap-3">
        <Link to="/events"
          className="inline-flex items-center gap-2 text-xs font-semibold text-primary-500">
          <ArrowLeft className="w-3 h-3"/> More Events
        </Link>
        <button onClick={() => window.print()}
          className="inline-flex items-center gap-2 text-xs font-semibold px-4 py-2 rounded-xl hover:opacity-80 bg-primary-500/10 text-primary-500">
          <Printer className="w-3.5 h-3.5"/> Print
        </button>
      </div>
    </div>
  )
}

/* ════════════════════════════════════════
   MOBILE STICKY BAR
════════════════════════════════════════ */
function MobileStickyBar({ event, isPaidEvent }) {
  const d = new Date(event.startDate)
  return (
    <div className="fixed bottom-0 left-0 right-0 z-40 lg:hidden p-4"
      style={{
        background: 'rgba(255,255,255,0.97)',
        backdropFilter: 'blur(12px)',
        borderTop: '1px solid rgba(91,45,142,0.1)',
        boxShadow: '0 -4px 24px rgba(91,45,142,0.1)',
      }}>
      <div className="flex items-center gap-3 max-w-lg mx-auto">
        <div className="flex-1 min-w-0">
          <p className="text-xs font-bold text-dark truncate">{event.title}</p>
          <p className="text-[10px] text-muted-foreground">{format(d, 'MMM d · h:mm a')}</p>
        </div>
        <button
          onClick={() => document.getElementById('registration-panel')
            ?.scrollIntoView({ behavior: 'smooth', block: 'center' })}
          className="flex-shrink-0 flex items-center gap-2 px-5 py-3 rounded-2xl text-xs font-bold text-white"
          style={{ background: 'linear-gradient(135deg,#5B2D8E,#7B4DB8)', boxShadow: '0 4px 16px rgba(91,45,142,0.4)' }}>
          {isPaidEvent
            ? <><Ticket className="w-3.5 h-3.5"/>Get Ticket</>
            : <><CalendarCheck className="w-3.5 h-3.5"/>Register Free</>
          }
        </button>
      </div>
    </div>
  )
}

/* ════════════════════════════════════════
   WAITLIST FORM
════════════════════════════════════════ */
function WaitlistForm({ event, user, loading, error, setLoading, setError, onSuccess }) {
  const [name,  setName]  = useState(user ? `${user.firstName} ${user.lastName}` : '')
  const [email, setEmail] = useState(user?.email || '')
  const [phone, setPhone] = useState(user?.phone || '')

  const submit = async (e) => {
    e.preventDefault()
    if (!name.trim() || !email.trim()) return setError('Name and email are required.')
    setError('')
    setLoading(true)
    try {
      await api.post(`/events/${event.id}/waitlist`, { name, email, phone })
      onSuccess()
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to join waitlist. Try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={submit} className="space-y-4">
      <Field label="Full Name *" value={name} onChange={setName} placeholder="Your full name" Icon={User}/>
      <Field label="Email Address *" value={email} onChange={setEmail} placeholder="you@example.com" Icon={Mail} type="email"/>
      <Field label="Phone Number" value={phone} onChange={setPhone} placeholder="+237 6XX XXX XXX" Icon={Phone}/>
      {error && (
        <div className="rounded-xl p-3 text-xs flex items-start gap-2"
          style={{ background: 'rgba(220,38,38,0.06)', color: '#dc2626', border: '1px solid rgba(220,38,38,0.15)' }}>
          <AlertCircle className="w-3.5 h-3.5 mt-0.5 flex-shrink-0"/>{error}
        </div>
      )}
      <button type="submit" disabled={loading}
        className="w-full py-3.5 rounded-2xl font-display font-bold text-sm transition-all hover:opacity-90 disabled:opacity-60"
        style={{ background: 'rgba(240,165,0,0.15)', color: '#C87800', border: '1px solid rgba(240,165,0,0.3)' }}>
        {loading ? 'Joining…' : 'Join Waitlist'}
      </button>
    </form>
  )
}

/* ════════════════════════════════════════
   ATTENDEES STRIP
════════════════════════════════════════ */
function AttendeesStrip({ registrants, count }) {
  return (
    <div className="card p-6">
      <h3 className="text-[10px] font-bold uppercase tracking-wider mb-4 text-muted-foreground">
        Attendees ({count})
      </h3>
      <div className="flex items-center gap-2 flex-wrap">
        {registrants.map((r, i) => (
          <div key={i}
            className="w-9 h-9 rounded-full flex items-center justify-center text-xs font-bold text-white flex-shrink-0"
            style={{
              background: `hsl(${(i * 47) % 360}, 55%, 45%)`,
              border: '2px solid #fff',
              boxShadow: '0 1px 4px rgba(0,0,0,0.15)',
              marginLeft: i > 0 ? -8 : 0,
            }}
            title={r.name}>
            {r.initial}
          </div>
        ))}
        {count > registrants.length && (
          <div className="w-9 h-9 rounded-full flex items-center justify-center text-[10px] font-bold"
            style={{
              background: 'rgba(91,45,142,0.1)',
              color: '#5B2D8E',
              border: '2px solid #fff',
              marginLeft: -8,
            }}>
            +{count - registrants.length}
          </div>
        )}
        <span className="text-xs text-muted-foreground ml-2">
          {count} {count === 1 ? 'person' : 'people'} registered
        </span>
      </div>
    </div>
  )
}

/* ════════════════════════════════════════
   AGENDA SECTION
════════════════════════════════════════ */
function AgendaSection({ agenda }) {
  const [expanded, setExpanded] = useState(true)
  return (
    <div className="card p-7">
      <button
        onClick={() => setExpanded(v => !v)}
        className="w-full flex items-center justify-between mb-1">
        <h2 className="font-display font-bold text-xl flex items-center gap-3 text-dark">
          <span className="w-1 h-6 rounded-full flex-shrink-0"
            style={{ background: 'linear-gradient(to bottom,#5B2D8E,#F0A500)' }}/>
          <ListOrdered className="w-4 h-4 text-primary-500"/>
          Programme
        </h2>
        <ChevronDown className={`w-4 h-4 text-muted-foreground transition-transform ${expanded ? 'rotate-180' : ''}`}/>
      </button>
      {expanded && (
        <div className="mt-5 space-y-0 divide-y" style={{ '--tw-divide-opacity': 1, borderColor: 'rgba(91,45,142,0.07)' }}>
          {agenda.map((item, i) => (
            <div key={item.id} className="flex gap-4 py-4">
              <div className="flex-shrink-0 w-16 text-[11px] font-bold text-primary-500 pt-0.5">{item.time}</div>
              <div className="flex-1">
                <div className="font-semibold text-sm text-dark">{item.title}</div>
                {item.speaker && (
                  <div className="text-xs text-muted-foreground mt-0.5 flex items-center gap-1">
                    <User className="w-2.5 h-2.5"/>{item.speaker}
                  </div>
                )}
                {item.description && (
                  <div className="text-xs text-[#525252] mt-1.5 leading-relaxed">{item.description}</div>
                )}
              </div>
              <div className="flex-shrink-0 w-5 h-5 rounded-full flex items-center justify-center text-[9px] font-bold text-white mt-0.5"
                style={{ background: 'linear-gradient(135deg,#5B2D8E,#7B4DB8)' }}>
                {i + 1}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

/* ════════════════════════════════════════
   COMMENTS SECTION
════════════════════════════════════════ */
function CommentsSection({ eventId }) {
  const [comments, setComments] = useState([])
  const [loaded,   setLoaded]   = useState(false)
  const [name,     setName]     = useState('')
  const [text,     setText]     = useState('')
  const [sending,  setSending]  = useState(false)
  const { user } = useAuth()

  useEffect(() => {
    api.get(`/events/${eventId}/comments`).then(r => {
      setComments(r.data)
      setLoaded(true)
    }).catch(() => setLoaded(true))
  }, [eventId])

  const submit = async (e) => {
    e.preventDefault()
    if (!text.trim()) return
    setSending(true)
    try {
      const res = await api.post(`/events/${eventId}/comments`, {
        name: name.trim() || (user ? `${user.firstName} ${user.lastName}` : 'Guest'),
        content: text.trim(),
      })
      setComments(prev => [...prev, res.data])
      setText('')
    } catch {}
    finally { setSending(false) }
  }

  return (
    <div className="card p-7">
      <h2 className="font-display font-bold text-xl mb-6 flex items-center gap-3 text-dark">
        <span className="w-1 h-6 rounded-full flex-shrink-0"
          style={{ background: 'linear-gradient(to bottom,#5B2D8E,#F0A500)' }}/>
        <MessageSquare className="w-4 h-4 text-primary-500"/>
        Comments
        {loaded && <span className="text-sm font-normal text-muted-foreground ml-1">{comments.length}</span>}
      </h2>

      {/* Comment list */}
      <div className="space-y-4 mb-6">
        {!loaded && (
          <div className="space-y-3">
            {[1,2].map(i => (
              <div key={i} className="h-12 rounded-2xl animate-pulse" style={{ background: 'rgba(91,45,142,0.04)' }}/>
            ))}
          </div>
        )}
        {loaded && comments.length === 0 && (
          <p className="text-xs italic text-muted-foreground text-center py-4">
            No comments yet. Be the first!
          </p>
        )}
        {comments.map(c => (
          <div key={c.id} className="flex gap-3">
            <div className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold text-white flex-shrink-0"
              style={{ background: 'linear-gradient(135deg,#5B2D8E,#7B4DB8)' }}>
              {c.name[0]?.toUpperCase()}
            </div>
            <div className="flex-1 rounded-2xl p-3" style={{ background: 'rgba(91,45,142,0.04)' }}>
              <div className="flex items-center gap-2 mb-1">
                <span className="text-xs font-bold text-dark">{c.name}</span>
                <span className="text-[10px] text-muted-foreground">
                  {format(new Date(c.createdAt), 'MMM d, h:mm a')}
                </span>
              </div>
              <p className="text-xs text-[#525252] leading-relaxed">{c.content}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Post comment form */}
      <form onSubmit={submit} className="space-y-3">
        {!user && (
          <input
            value={name}
            onChange={e => setName(e.target.value)}
            placeholder="Your name (optional)"
            className="w-full px-4 py-2.5 rounded-xl text-xs outline-none"
            style={{ background: '#F8F5FF', border: '1.5px solid rgba(91,45,142,0.12)' }}
          />
        )}
        <div className="flex gap-2">
          <textarea
            value={text}
            onChange={e => setText(e.target.value)}
            placeholder="Leave a comment…"
            rows={2}
            className="flex-1 px-4 py-2.5 rounded-xl text-xs outline-none resize-none"
            style={{ background: '#F8F5FF', border: '1.5px solid rgba(91,45,142,0.12)' }}
          />
          <button type="submit" disabled={sending || !text.trim()}
            className="px-4 rounded-xl flex items-center gap-1.5 text-xs font-bold text-white disabled:opacity-40 flex-shrink-0"
            style={{ background: 'linear-gradient(135deg,#5B2D8E,#7B4DB8)' }}>
            <Send className="w-3.5 h-3.5"/>
          </button>
        </div>
      </form>
    </div>
  )
}

/* ════════════════════════════════════════
   RELATED EVENTS
════════════════════════════════════════ */
function RelatedEvents({ currentId, category }) {
  const { data } = useQuery('events-page', () => api.get('/events').then(r => r.data))

  const related = useMemo(() => {
    if (!data) return []
    const sameCat = data.filter(e => e.id !== currentId && e.category === category && !isPast(new Date(e.startDate)))
    const others  = data.filter(e => e.id !== currentId && e.category !== category && !isPast(new Date(e.startDate)))
    return [...sameCat, ...others].slice(0, 3)
  }, [data, currentId, category])

  if (related.length === 0) return null

  return (
    <section className="py-12 bg-[#FAFAFA]" style={{ borderTop: '1px solid rgba(91,45,142,0.07)' }}>
      <div className="max-w-6xl mx-auto px-6">
        <h2 className="font-display font-bold text-xl mb-6 flex items-center gap-2 text-dark">
          <span className="w-1 h-6 rounded-full flex-shrink-0"
            style={{ background: 'linear-gradient(to bottom,#5B2D8E,#F0A500)' }}/>
          More Events
        </h2>
        <div className="grid sm:grid-cols-3 gap-5">
          {related.map(e => <RelatedEventCard key={e.id} event={e}/>)}
        </div>
      </div>
    </section>
  )
}

function RelatedEventCard({ event: e }) {
  const d = new Date(e.startDate)
  const isPaid = e.ticketPrice && Number(e.ticketPrice) > 0
  return (
    <Link to={`/events/${e.slug}`}
      className="rounded-2xl overflow-hidden group block transition-all hover:-translate-y-1"
      style={{ background: '#fff', border: '1px solid rgba(91,45,142,0.08)', boxShadow: '0 2px 12px rgba(91,45,142,0.05)' }}>
      <div className="h-36 relative overflow-hidden"
        style={{ background: 'linear-gradient(135deg,#1A0A35,#5B2D8E)' }}>
        {e.coverImage
          ? <img src={e.coverImage} alt=""
              className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"/>
          : <div className="absolute inset-0 flex items-center justify-center">
              <CalendarDays className="w-10 h-10 text-white/15"/>
            </div>
        }
        <div className="absolute inset-0"
          style={{ background: 'linear-gradient(to top, rgba(6,2,16,0.55) 0%, transparent 60%)' }}/>
        <div className="absolute top-2.5 left-2.5 bg-white rounded-xl px-2.5 py-1.5 text-center">
          <div className="font-display font-bold text-base leading-none text-dark">{format(d, 'd')}</div>
          <div className="text-[7px] uppercase tracking-wider font-bold text-primary-500">{format(d, 'MMM')}</div>
        </div>
        <div className="absolute top-2.5 right-2.5">
          <span className="text-[9px] font-bold px-2 py-0.5 rounded-full text-white"
            style={{ background: isPaid ? 'rgba(200,120,0,0.85)' : 'rgba(91,45,142,0.8)' }}>
            {isPaid ? `${Number(e.ticketPrice).toLocaleString()} XAF` : 'Free'}
          </span>
        </div>
      </div>
      <div className="p-4">
        <h4 className="font-display font-semibold text-sm mb-1.5 line-clamp-2 text-dark leading-snug">
          {e.title}
        </h4>
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <Clock className="w-3 h-3 text-primary-500/50"/>
          {format(d, 'EEE, MMM d · h:mm a')}
        </div>
        {e.venue && (
          <div className="flex items-center gap-2 text-xs text-muted-foreground mt-1">
            <MapPin className="w-3 h-3 text-primary-500/50"/>
            {e.venue}
          </div>
        )}
      </div>
    </Link>
  )
}

/* ════════════════════════════════════════
   SKELETON / NOT FOUND
════════════════════════════════════════ */
function PageSkeleton() {
  return (
    <div>
      <div className="h-[480px] animate-pulse" style={{ background: 'rgba(91,45,142,0.08)' }}/>
      <div className="max-w-6xl mx-auto px-6 py-14 grid lg:grid-cols-3 gap-10">
        <div className="lg:col-span-2 space-y-5">
          {[1,2,3].map(i => (
            <div key={i} className="h-32 rounded-3xl animate-pulse"
              style={{ background: 'rgba(91,45,142,0.05)' }}/>
          ))}
        </div>
        <div className="h-80 rounded-3xl animate-pulse" style={{ background: 'rgba(91,45,142,0.05)' }}/>
      </div>
    </div>
  )
}

function NotFound() {
  return (
    <div className="min-h-[60vh] flex flex-col items-center justify-center gap-4 px-6 text-center">
      <CalendarX className="w-16 h-16" style={{ color: 'rgba(91,45,142,0.2)' }}/>
      <h2 className="font-display font-bold text-2xl text-dark">Event Not Found</h2>
      <p className="text-sm text-muted-foreground">
        This event may have been removed or the link is incorrect.
      </p>
      <Link to="/events" className="btn-primary mt-2">
        <CalendarDays className="w-4 h-4"/> Browse Events
      </Link>
    </div>
  )
}
