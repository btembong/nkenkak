import { useState, useRef } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import { useQuery, useQueryClient } from 'react-query'
import { format, formatDistanceToNow, isPast, isFuture } from 'date-fns'
import api from '../../services/api'
import { useAuth } from '../../context/AuthContext'
import {
  Calendar, ChevronRight, Clock, MapPin, Video, Users,
  CalendarDays, Gift, Ticket, CheckCircle2, Lock,
  ArrowLeft, CalendarCheck, Printer, ExternalLink,
  MapPinned, User, AlertCircle, ShieldCheck, CalendarX,
  Phone, Mail,
} from 'lucide-react'

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
  const navigate = useNavigate()

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

  const refresh = () => qc.invalidateQueries(['event', slug])

  return (
    <div>
      {/* ── Hero ── */}
      <EventHero event={event} isOver={isOver} />

      {/* ── Content ── */}
      <section className="py-14 bg-[#FAFAFA]">
        <div className="max-w-6xl mx-auto px-6">
          <div className="grid lg:grid-cols-3 gap-10">

            {/* Left: description + details */}
            <div className="lg:col-span-2 space-y-8">
              <AboutSection event={event} />
              {event.isOnline && event.meetingLink && (
                <OnlineSection link={event.meetingLink} />
              )}
              {event.locationUrl && !event.isOnline && (
                <LocationSection event={event} />
              )}
              <OrganizerSection event={event} />
            </div>

            {/* Right: registration panel */}
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
    </div>
  )
}

/* ════════════════════════════════════════
   HERO
════════════════════════════════════════ */
function EventHero({ event, isOver }) {
  const d = new Date(event.startDate)

  return (
    <div className="relative overflow-hidden" style={{ minHeight: 320 }}>
      {/* Background */}
      {event.coverImage ? (
        <>
          <img src={event.coverImage} alt="" className="absolute inset-0 w-full h-full object-cover" />
          <div className="absolute inset-0" style={{ background: 'linear-gradient(to right, rgba(26,10,53,0.92) 45%, rgba(26,10,53,0.55) 100%)' }} />
        </>
      ) : (
        <div className="absolute inset-0" style={{ background: 'linear-gradient(135deg, #1A0A35 0%, #5B2D8E 100%)' }} />
      )}

      {/* Decorative blob */}
      <div className="absolute top-0 right-0 w-96 h-96 rounded-full pointer-events-none"
        style={{ background: 'radial-gradient(circle, rgba(91,45,142,0.3), transparent)', transform: 'translate(30%,-30%)' }} />

      <div className="relative max-w-6xl mx-auto px-6 py-16 flex flex-col md:flex-row gap-8 items-start">
        {/* Date badge */}
        <div className="bg-white rounded-3xl p-5 text-center shadow-2xl flex-shrink-0 w-24">
          <div className="font-display font-bold text-4xl leading-none text-dark">{format(d, 'd')}</div>
          <div className="text-xs font-bold uppercase tracking-widest mt-1 text-primary-500">{format(d, 'MMM')}</div>
          <div className="text-xs mt-0.5 text-muted-foreground">{format(d, 'yyyy')}</div>
        </div>

        {/* Info */}
        <div className="flex-1">
          <div className="flex items-center gap-3 mb-3 flex-wrap">
            <Link to="/events" className="text-xs font-semibold flex items-center gap-1 transition-colors text-gold/80">
              <Calendar className="w-3 h-3"/> Events
            </Link>
            <ChevronRight className="w-3 h-3 text-white/30"/>
            {event.category && (
              <span className="text-[10px] font-bold uppercase tracking-[0.1em] text-white/60 capitalize">{event.category}</span>
            )}
            {event.isFeatured && (
              <span className="text-[10px] font-semibold text-gold/65 flex items-center gap-1">★ Featured</span>
            )}
            {isOver && (
              <span className="text-[10px] font-medium text-white/35">Past Event</span>
            )}
          </div>

          <h1 className="font-display font-bold text-3xl md:text-4xl text-white leading-tight mb-4">{event.title}</h1>

          <div className="flex flex-wrap gap-x-6 gap-y-2 text-sm text-white/70">
            <span className="flex items-center gap-2">
              <Clock className="w-3.5 h-3.5 text-gold"/>
              {format(d, 'EEEE, MMMM d yyyy')} at {format(d, 'h:mm a')}
              {event.endDate && ` – ${format(new Date(event.endDate), 'h:mm a')}`}
            </span>
            {event.venue && (
              <span className="flex items-center gap-2">
                <MapPin className="w-3.5 h-3.5 text-gold"/>
                {event.venue}
              </span>
            )}
            {event.isOnline && (
              <span className="flex items-center gap-2">
                <Video className="w-3.5 h-3.5 text-primary-400"/>
                Online Event
              </span>
            )}
            {event.registration_count > 0 && (
              <span className="flex items-center gap-2">
                <Users className="w-3.5 h-3.5 text-gold"/>
                {event.registration_count} registered
              </span>
            )}
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
    <div className="card p-8">
      <h2 className="font-display font-bold text-xl mb-5 flex items-center gap-3 text-dark">
        <span className="w-1 h-6 rounded-full" style={{ background: 'linear-gradient(to bottom,#5B2D8E,#F0A500)' }} />
        About This Event
      </h2>
      {event.description ? (
        <div className="text-sm leading-relaxed whitespace-pre-line text-[#525252]">
          {event.description}
        </div>
      ) : (
        <p className="text-sm italic text-muted-foreground">No description provided.</p>
      )}

      {/* Detail chips */}
      <div className="grid sm:grid-cols-2 gap-4 mt-8 pt-6 border-t" style={{ borderColor: 'rgba(91,45,142,0.08)' }}>
        <DetailChip Icon={CalendarDays} label="Date" value={format(new Date(event.startDate), 'EEEE, MMMM d yyyy')} />
        <DetailChip Icon={Clock} label="Time" value={
          event.endDate
            ? `${format(new Date(event.startDate), 'h:mm a')} – ${format(new Date(event.endDate), 'h:mm a')}`
            : format(new Date(event.startDate), 'h:mm a')
        } />
        {event.venue && <DetailChip Icon={MapPin} label="Venue" value={event.venue} />}
        {event.maxAttendees && (
          <DetailChip Icon={Users} label="Capacity"
            value={`${event.registration_count || 0} / ${event.maxAttendees} registered`} />
        )}
        {event.isOnline && <DetailChip Icon={Video} label="Format" value="Online Event" />}
        {event.ticketPrice && Number(event.ticketPrice) > 0 && (
          <DetailChip Icon={Ticket} label="Ticket Price"
            value={`${Number(event.ticketPrice).toLocaleString()} XAF`} />
        )}
        {(!event.ticketPrice || Number(event.ticketPrice) === 0) && (
          <DetailChip Icon={Gift} label="Admission" value="Free Entry" />
        )}
      </div>
    </div>
  )
}

function DetailChip({ Icon, label, value }) {
  return (
    <div className="flex items-start gap-3 p-3 rounded-2xl" style={{ background: 'rgba(91,45,142,0.03)' }}>
      <div className="w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0 mt-0.5"
        style={{ background: 'rgba(91,45,142,0.1)' }}>
        <Icon className="w-4 h-4 text-primary-500"/>
      </div>
      <div>
        <div className="text-[10px] uppercase tracking-wider font-semibold mb-0.5 text-muted-foreground">{label}</div>
        <div className="text-sm font-semibold text-dark">{value}</div>
      </div>
    </div>
  )
}

/* ════════════════════════════════════════
   ONLINE / LOCATION SECTIONS
════════════════════════════════════════ */
function OnlineSection({ link }) {
  return (
    <div className="card p-6 flex items-center gap-5">
      <div className="w-12 h-12 rounded-2xl flex items-center justify-center flex-shrink-0 bg-primary-500/10">
        <Video className="w-5 h-5 text-primary-500"/>
      </div>
      <div className="flex-1 min-w-0">
        <div className="font-display font-semibold text-sm mb-1 text-dark">Online Event</div>
        <div className="text-xs truncate text-primary-500">
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
        className="inline-flex items-center gap-2 text-xs font-semibold px-4 py-2 rounded-xl transition-colors bg-primary-500/10 text-primary-500">
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
    (event.organizer ? `${event.organizer.firstName} ${event.organizer.lastName}` : 'Nkenkak-Ngiesang')
  const avatar = event.organizer?.avatarUrl

  return (
    <div className="card p-6 flex items-center gap-5">
      <div className="w-14 h-14 rounded-2xl flex items-center justify-center flex-shrink-0 overflow-hidden"
        style={{ background: 'rgba(91,45,142,0.1)', border: '1px solid rgba(91,45,142,0.15)' }}>
        {avatar
          ? <img src={avatar} alt={name} className="w-full h-full object-cover" />
          : <User className="w-6 h-6 text-primary-500"/>}
      </div>
      <div>
        <div className="text-[10px] uppercase tracking-wider font-semibold mb-1 text-muted-foreground">Organiser</div>
        <div className="font-display font-semibold text-dark">{name}</div>
      </div>
    </div>
  )
}

/* ════════════════════════════════════════
   REGISTRATION PANEL
════════════════════════════════════════ */
function RegistrationPanel({ event, isPaidEvent, isOver, isFull, spotsLeft, user, onSuccess }) {
  const [step, setStep] = useState('info') // info | form | success
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [ticket, setTicket] = useState(null)
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

  /* ── Already registered ── */
  if (existingReg && existingReg.status !== 'cancelled') {
    return (
      <div className="card p-6 sticky top-24">
        <div className="text-center mb-6">
          <div className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-3 bg-primary-500/10">
            <CheckCircle2 className="w-8 h-8 text-primary-500"/>
          </div>
          <h3 className="font-display font-bold text-lg text-dark">You're Registered!</h3>
          <p className="text-xs mt-1 text-muted-foreground">See you at the event.</p>
        </div>

        <div className="rounded-2xl p-4 mb-5" style={{ background: 'rgba(91,45,142,0.04)', border: '1px solid rgba(91,45,142,0.08)' }}>
          <div className="text-[10px] uppercase tracking-wider font-semibold mb-1 text-muted-foreground">Ticket Reference</div>
          <div className="font-display font-bold text-lg tracking-wider text-primary-500">{existingReg.ticketRef}</div>
        </div>

        <TicketDetails event={event} isPaidEvent={isPaidEvent} />

        <button onClick={() => window.print()}
          className="w-full mt-3 py-2.5 rounded-xl text-xs font-semibold flex items-center justify-center gap-2 transition-colors hover:opacity-80 text-primary-500"
          style={{ background: 'rgba(91,45,142,0.06)', border: '1px solid rgba(91,45,142,0.12)' }}>
          <Printer className="w-3.5 h-3.5"/>Print Ticket
        </button>

        {!isOver && (
          <button onClick={handleCancel} disabled={cancelling}
            className="w-full mt-2 py-2.5 rounded-xl text-xs font-semibold transition-colors text-red-600"
            style={{ background: 'rgba(220,38,38,0.06)', border: '1px solid rgba(220,38,38,0.15)' }}>
            {cancelling ? 'Cancelling…' : 'Cancel Registration'}
          </button>
        )}
      </div>
    )
  }

  /* ── Success after submitting ── */
  if (step === 'success') {
    return (
      <div className="card p-6 sticky top-24">
        <SuccessView ticket={ticket} event={event} />
      </div>
    )
  }

  /* ── Info (pre-form) ── */
  if (step === 'info') {
    return (
      <div className="card p-6 sticky top-24 space-y-5">
        {/* Price / free badge */}
        <div className="text-center py-4 rounded-2xl" style={{ background: isPaidEvent ? 'rgba(91,45,142,0.06)' : 'rgba(91,45,142,0.04)' }}>
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

        {/* Spots left */}
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
                }} />
            </div>
          </div>
        )}

        <TicketDetails event={event} isPaidEvent={isPaidEvent} />

        {isOver ? (
          <div className="text-center py-4 rounded-2xl text-sm font-semibold bg-black/4 text-muted-foreground">
            This event has ended
          </div>
        ) : isFull ? (
          <div className="text-center py-4 rounded-2xl text-sm font-semibold flex items-center justify-center gap-2"
            style={{ background: 'rgba(220,38,38,0.06)', color: '#dc2626' }}>
            <Lock className="w-4 h-4"/> Fully Booked
          </div>
        ) : (
          <button onClick={() => setStep('form')}
            className="w-full py-3.5 rounded-2xl font-display font-bold text-sm text-white transition-all hover:opacity-90 active:scale-[0.98] flex items-center justify-center gap-2"
            style={{ background: 'linear-gradient(135deg,#5B2D8E,#7B4DB8)', boxShadow: '0 6px 24px rgba(91,45,142,0.4)' }}>
            {isPaidEvent ? <Ticket className="w-4 h-4"/> : <CalendarCheck className="w-4 h-4"/>}
            {isPaidEvent ? 'Get Your Ticket' : 'Register for Free'}
          </button>
        )}
      </div>
    )
  }

  /* ── Registration form ── */
  return (
    <div className="card p-6 sticky top-24">
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
        amount:       Number(event.ticketPrice),
        provider:     'flutterwave',
        donor_name:   name,
        donor_email:  email,
        donor_phone:  phone || undefined,
        message:      `Event ticket: ${event.title}`,
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
        public_key:   flw_public_key,
        tx_ref,
        amount,
        currency,
        customer: { email, name, phone_number: phone },
        meta: { event_id: event.id, event_title: event.title },
        customizations: {
          title:       `${event.title}`,
          description: `Event ticket registration`,
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
      <Field label="Full Name *" value={name} onChange={setName} placeholder="Your full name" Icon={User} />
      <Field label="Email Address *" value={email} onChange={setEmail} placeholder="you@example.com" Icon={Mail} type="email" />
      <Field label="Phone Number" value={phone} onChange={setPhone} placeholder="+237 6XX XXX XXX" Icon={Phone} />

      {isPaidEvent && (
        <div className="rounded-2xl p-4" style={{ background: 'rgba(91,45,142,0.06)', border: '1px solid rgba(91,45,142,0.12)' }}>
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
            <div className="w-4 h-4 rounded-full border-2 border-white/30 border-t-white animate-spin" />
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
          style={{
            background: '#F8F5FF',
            border: '1.5px solid rgba(91,45,142,0.12)',
          }}
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
      <InfoRow Icon={CalendarDays} value={format(d, 'MMMM d, yyyy')} />
      <InfoRow Icon={Clock} value={
        event.endDate
          ? `${format(d, 'h:mm a')} – ${format(new Date(event.endDate), 'h:mm a')}`
          : format(d, 'h:mm a')
      } />
      {event.venue && <InfoRow Icon={MapPin} value={event.venue} />}
      {event.isOnline && <InfoRow Icon={Video} value="Online Event" />}
      {isPaidEvent
        ? <InfoRow Icon={Ticket} value={`${Number(event.ticketPrice).toLocaleString()} XAF`} />
        : <InfoRow Icon={Gift} value="Free Admission" />
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
   SUCCESS VIEW
════════════════════════════════════════ */
function SuccessView({ ticket, event }) {
  const d = new Date(event.startDate)
  return (
    <div className="text-center">
      <div className="w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4 bg-primary-500/10">
        <CheckCircle2 className="w-10 h-10 text-primary-500"/>
      </div>
      <h3 className="font-display font-bold text-xl mb-1 text-dark">You're In!</h3>
      <p className="text-xs mb-6 text-muted-foreground">
        Registration confirmed. Check your email for details.
      </p>

      {/* Ticket card */}
      <div className="rounded-3xl overflow-hidden mb-5 border-2 border-primary-500/20">
        <div className="p-4 text-white bg-gradient-to-br from-primary-500 to-[#7B4DB8]">
          <div className="text-[10px] font-bold uppercase tracking-widest opacity-70 mb-1">Event Ticket</div>
          <div className="font-display font-bold text-base leading-snug">{event.title}</div>
        </div>
        <div className="border-t-2 border-dashed border-primary-500/20" />
        <div className="p-4 space-y-2" style={{ background: 'rgba(91,45,142,0.03)' }}>
          <div className="flex justify-between text-xs">
            <span className="text-muted-foreground">Date</span>
            <span className="font-semibold text-dark">{format(d, 'MMMM d, yyyy')}</span>
          </div>
          <div className="flex justify-between text-xs">
            <span className="text-muted-foreground">Time</span>
            <span className="font-semibold text-dark">{format(d, 'h:mm a')}</span>
          </div>
          {event.venue && (
            <div className="flex justify-between text-xs">
              <span className="text-muted-foreground">Venue</span>
              <span className="font-semibold text-dark">{event.venue}</span>
            </div>
          )}
          <div className="pt-2 mt-2 border-t border-primary-500/10">
            <div className="text-[10px] uppercase tracking-wider font-semibold mb-1 text-muted-foreground">Ticket Reference</div>
            <div className="font-display font-bold text-base tracking-wider text-primary-500">
              {ticket}
            </div>
          </div>
        </div>
      </div>

      <div className="flex items-center justify-center gap-3">
        <Link to="/events"
          className="inline-flex items-center gap-2 text-xs font-semibold transition-colors text-primary-500">
          <ArrowLeft className="w-3 h-3"/> Back to Events
        </Link>
        <button
          onClick={() => window.print()}
          className="inline-flex items-center gap-2 text-xs font-semibold px-4 py-2 rounded-xl transition-all hover:opacity-80 bg-primary-500/10 text-primary-500">
          <Printer className="w-3.5 h-3.5"/> Print Ticket
        </button>
      </div>
    </div>
  )
}

/* ════════════════════════════════════════
   SKELETON / NOT FOUND
════════════════════════════════════════ */
function PageSkeleton() {
  return (
    <div>
      <div className="h-72 animate-pulse" style={{ background: 'rgba(91,45,142,0.08)' }} />
      <div className="max-w-6xl mx-auto px-6 py-14 grid lg:grid-cols-3 gap-10">
        <div className="lg:col-span-2 space-y-5">
          {[1, 2, 3].map(i => <div key={i} className="h-32 rounded-3xl animate-pulse" style={{ background: 'rgba(91,45,142,0.05)' }} />)}
        </div>
        <div className="h-80 rounded-3xl animate-pulse" style={{ background: 'rgba(91,45,142,0.05)' }} />
      </div>
    </div>
  )
}

function NotFound() {
  return (
    <div className="min-h-[60vh] flex flex-col items-center justify-center gap-4 px-6 text-center">
      <CalendarX className="w-16 h-16" style={{ color: 'rgba(91,45,142,0.2)' }} />
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
