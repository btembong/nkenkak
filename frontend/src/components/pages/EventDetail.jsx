import { useState, useRef } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import { useQuery, useQueryClient } from 'react-query'
import { format, formatDistanceToNow, isPast, isFuture } from 'date-fns'
import api from '../../services/api'
import { useAuth } from '../../context/AuthContext'

const CAT_COLORS = {
  culture: '#5B2D8E', education: '#F0A500', health: '#dc2626',
  sport: '#16a34a', community: '#0284c7', fundraiser: '#d97706', governance: '#374151',
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
  const color       = CAT_COLORS[event.category] || '#5B2D8E'

  const refresh = () => qc.invalidateQueries(['event', slug])

  return (
    <div>
      {/* ── Hero ── */}
      <EventHero event={event} color={color} isOver={isOver} />

      {/* ── Content ── */}
      <section className="py-14" style={{ background: '#FAFAFA' }}>
        <div className="max-w-6xl mx-auto px-6">
          <div className="grid lg:grid-cols-3 gap-10">

            {/* Left: description + details */}
            <div className="lg:col-span-2 space-y-8">
              <AboutSection event={event} color={color} />
              {event.isOnline && event.meetingLink && (
                <OnlineSection link={event.meetingLink} color={color} />
              )}
              {event.locationUrl && !event.isOnline && (
                <LocationSection event={event} color={color} />
              )}
              <OrganizerSection event={event} color={color} />
            </div>

            {/* Right: registration panel */}
            <div>
              <RegistrationPanel
                event={event}
                isPaidEvent={isPaidEvent}
                isOver={isOver}
                isFull={isFull}
                spotsLeft={spotsLeft}
                color={color}
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
function EventHero({ event, color, isOver }) {
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
        <div className="absolute inset-0" style={{ background: `linear-gradient(135deg, #1A0A35 0%, ${color} 100%)` }} />
      )}

      {/* Decorative blob */}
      <div className="absolute top-0 right-0 w-96 h-96 rounded-full pointer-events-none"
        style={{ background: `radial-gradient(circle, ${color}33, transparent)`, transform: 'translate(30%,-30%)' }} />

      <div className="relative max-w-6xl mx-auto px-6 py-16 flex flex-col md:flex-row gap-8 items-start">
        {/* Date badge */}
        <div className="bg-white rounded-3xl p-5 text-center shadow-2xl flex-shrink-0 w-24">
          <div className="font-display font-bold text-4xl leading-none" style={{ color: '#1A0A35' }}>{format(d, 'd')}</div>
          <div className="text-xs font-bold uppercase tracking-widest mt-1" style={{ color }}>{format(d, 'MMM')}</div>
          <div className="text-xs mt-0.5" style={{ color: '#A3A3A3', fontFamily: 'Poppins,sans-serif' }}>{format(d, 'yyyy')}</div>
        </div>

        {/* Info */}
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-3 flex-wrap">
            <Link to="/events" className="text-xs font-semibold flex items-center gap-1 transition-colors"
              style={{ color: 'rgba(240,165,0,0.8)', fontFamily: 'Sora,sans-serif' }}>
              <i className="fas fa-calendar text-[10px]" /> Events
            </Link>
            <i className="fas fa-chevron-right text-[9px]" style={{ color: 'rgba(255,255,255,0.3)' }} />
            {event.category && (
              <span className="text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full text-white"
                style={{ background: color }}>{event.category}</span>
            )}
            {event.isFeatured && (
              <span className="text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full"
                style={{ background: 'rgba(240,165,0,0.2)', color: '#F0A500' }}>Featured</span>
            )}
            {isOver && (
              <span className="text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full"
                style={{ background: 'rgba(255,255,255,0.1)', color: 'rgba(255,255,255,0.5)' }}>Past Event</span>
            )}
          </div>

          <h1 className="font-display font-bold text-3xl md:text-4xl text-white leading-tight mb-4">{event.title}</h1>

          <div className="flex flex-wrap gap-x-6 gap-y-2 text-sm" style={{ color: 'rgba(255,255,255,0.7)', fontFamily: 'Poppins,sans-serif' }}>
            <span className="flex items-center gap-2">
              <i className="fas fa-clock" style={{ color: '#F0A500' }} />
              {format(d, 'EEEE, MMMM d yyyy')} at {format(d, 'h:mm a')}
              {event.endDate && ` – ${format(new Date(event.endDate), 'h:mm a')}`}
            </span>
            {event.venue && (
              <span className="flex items-center gap-2">
                <i className="fas fa-map-marker-alt" style={{ color: '#F0A500' }} />
                {event.venue}
              </span>
            )}
            {event.isOnline && (
              <span className="flex items-center gap-2">
                <i className="fas fa-video" style={{ color: '#38bdf8' }} />
                Online Event
              </span>
            )}
            {event.registration_count > 0 && (
              <span className="flex items-center gap-2">
                <i className="fas fa-users" style={{ color: '#F0A500' }} />
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
function AboutSection({ event, color }) {
  return (
    <div className="card p-8">
      <h2 className="font-display font-bold text-xl mb-5 flex items-center gap-3" style={{ color: '#1A0A35' }}>
        <span className="w-1 h-6 rounded-full" style={{ background: `linear-gradient(to bottom,${color},#F0A500)` }} />
        About This Event
      </h2>
      {event.description ? (
        <div className="text-sm leading-relaxed whitespace-pre-line"
          style={{ color: '#525252', fontFamily: 'Poppins,sans-serif' }}>
          {event.description}
        </div>
      ) : (
        <p className="text-sm italic" style={{ color: '#A3A3A3', fontFamily: 'Poppins,sans-serif' }}>No description provided.</p>
      )}

      {/* Detail chips */}
      <div className="grid sm:grid-cols-2 gap-4 mt-8 pt-6 border-t" style={{ borderColor: 'rgba(91,45,142,0.08)' }}>
        <DetailChip icon="fa-calendar-alt" label="Date" value={format(new Date(event.startDate), 'EEEE, MMMM d yyyy')} color={color} />
        <DetailChip icon="fa-clock" label="Time" value={
          event.endDate
            ? `${format(new Date(event.startDate), 'h:mm a')} – ${format(new Date(event.endDate), 'h:mm a')}`
            : format(new Date(event.startDate), 'h:mm a')
        } color={color} />
        {event.venue && <DetailChip icon="fa-map-marker-alt" label="Venue" value={event.venue} color={color} />}
        {event.maxAttendees && (
          <DetailChip icon="fa-users" label="Capacity"
            value={`${event.registration_count || 0} / ${event.maxAttendees} registered`} color={color} />
        )}
        {event.isOnline && <DetailChip icon="fa-video" label="Format" value="Online Event" color="#0284c7" />}
        {event.ticketPrice && Number(event.ticketPrice) > 0 && (
          <DetailChip icon="fa-ticket-alt" label="Ticket Price"
            value={`${Number(event.ticketPrice).toLocaleString()} XAF`} color={color} />
        )}
        {!event.ticketPrice || Number(event.ticketPrice) === 0 ? (
          <DetailChip icon="fa-gift" label="Admission" value="Free Entry" color="#16a34a" />
        ) : null}
      </div>
    </div>
  )
}

function DetailChip({ icon, label, value, color }) {
  return (
    <div className="flex items-start gap-3 p-3 rounded-2xl" style={{ background: 'rgba(91,45,142,0.03)' }}>
      <div className="w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0 mt-0.5"
        style={{ background: `${color}14` }}>
        <i className={`fas ${icon} text-xs`} style={{ color }} />
      </div>
      <div>
        <div className="text-[10px] uppercase tracking-wider font-semibold mb-0.5"
          style={{ color: '#A3A3A3', fontFamily: 'Sora,sans-serif' }}>{label}</div>
        <div className="text-sm font-semibold" style={{ color: '#1A0A35', fontFamily: 'Sora,sans-serif' }}>{value}</div>
      </div>
    </div>
  )
}

/* ════════════════════════════════════════
   ONLINE / LOCATION SECTIONS
════════════════════════════════════════ */
function OnlineSection({ link, color }) {
  return (
    <div className="card p-6 flex items-center gap-5">
      <div className="w-12 h-12 rounded-2xl flex items-center justify-center flex-shrink-0"
        style={{ background: 'rgba(2,132,199,0.1)' }}>
        <i className="fas fa-video text-lg" style={{ color: '#0284c7' }} />
      </div>
      <div className="flex-1 min-w-0">
        <div className="font-display font-semibold text-sm mb-1" style={{ color: '#1A0A35' }}>Online Event</div>
        <div className="text-xs truncate" style={{ color: '#0284c7', fontFamily: 'Poppins,sans-serif' }}>
          Meeting link will be shared with registered attendees.
        </div>
      </div>
    </div>
  )
}

function LocationSection({ event, color }) {
  return (
    <div className="card p-6">
      <h3 className="font-display font-semibold text-base mb-4 flex items-center gap-2" style={{ color: '#1A0A35' }}>
        <i className="fas fa-map-marked-alt" style={{ color }} /> Location
      </h3>
      <p className="text-sm mb-4" style={{ color: '#525252', fontFamily: 'Poppins,sans-serif' }}>{event.venue}</p>
      <a href={event.locationUrl} target="_blank" rel="noreferrer"
        className="inline-flex items-center gap-2 text-xs font-semibold px-4 py-2 rounded-xl transition-colors"
        style={{ background: `${color}12`, color }}>
        <i className="fas fa-external-link-alt text-[10px]" /> View on Map
      </a>
    </div>
  )
}

/* ════════════════════════════════════════
   ORGANIZER
════════════════════════════════════════ */
function OrganizerSection({ event, color }) {
  const name = event.organizer_name || event.organizerName ||
    (event.organizer ? `${event.organizer.firstName} ${event.organizer.lastName}` : 'Nkenkak-Ngiesang')
  const avatar = event.organizer?.avatarUrl

  return (
    <div className="card p-6 flex items-center gap-5">
      <div className="w-14 h-14 rounded-2xl flex items-center justify-center flex-shrink-0 overflow-hidden"
        style={{ background: `${color}18`, border: `1px solid ${color}22` }}>
        {avatar
          ? <img src={avatar} alt={name} className="w-full h-full object-cover" />
          : <i className="fas fa-user text-xl" style={{ color }} />}
      </div>
      <div>
        <div className="text-[10px] uppercase tracking-wider font-semibold mb-1"
          style={{ color: '#A3A3A3', fontFamily: 'Sora,sans-serif' }}>Organiser</div>
        <div className="font-display font-semibold" style={{ color: '#1A0A35' }}>{name}</div>
      </div>
    </div>
  )
}

/* ════════════════════════════════════════
   REGISTRATION PANEL
════════════════════════════════════════ */
function RegistrationPanel({ event, isPaidEvent, isOver, isFull, spotsLeft, color, user, onSuccess }) {
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
          <div className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-3"
            style={{ background: 'rgba(22,163,74,0.1)' }}>
            <i className="fas fa-check-circle text-3xl" style={{ color: '#16a34a' }} />
          </div>
          <h3 className="font-display font-bold text-lg" style={{ color: '#1A0A35' }}>You're Registered!</h3>
          <p className="text-xs mt-1" style={{ color: '#737373', fontFamily: 'Poppins,sans-serif' }}>
            See you at the event.
          </p>
        </div>

        <div className="rounded-2xl p-4 mb-5" style={{ background: 'rgba(91,45,142,0.04)', border: '1px solid rgba(91,45,142,0.08)' }}>
          <div className="text-[10px] uppercase tracking-wider font-semibold mb-1" style={{ color: '#A3A3A3', fontFamily: 'Sora,sans-serif' }}>Ticket Reference</div>
          <div className="font-display font-bold text-lg tracking-wider" style={{ color: '#5B2D8E' }}>{existingReg.ticketRef}</div>
        </div>

        <TicketDetails event={event} isPaidEvent={isPaidEvent} color={color} />

        <button onClick={() => window.print()}
          className="w-full mt-3 py-2.5 rounded-xl text-xs font-semibold flex items-center justify-center gap-2 transition-colors hover:opacity-80"
          style={{ background: `${color}08`, color, border: `1px solid ${color}20` }}>
          <i className="fas fa-print text-[10px]" />Print Ticket
        </button>

        {!isOver && (
          <button onClick={handleCancel} disabled={cancelling}
            className="w-full mt-2 py-2.5 rounded-xl text-xs font-semibold transition-colors"
            style={{ color: '#dc2626', background: 'rgba(220,38,38,0.06)', border: '1px solid rgba(220,38,38,0.15)' }}>
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
        <SuccessView ticket={ticket} event={event} color={color} />
      </div>
    )
  }

  /* ── Info (pre-form) ── */
  if (step === 'info') {
    return (
      <div className="card p-6 sticky top-24 space-y-5">
        {/* Price / free badge */}
        <div className="text-center py-4 rounded-2xl" style={{ background: isPaidEvent ? `${color}0a` : 'rgba(22,163,74,0.06)' }}>
          {isPaidEvent ? (
            <>
              <div className="text-3xl font-display font-bold" style={{ color }}>
                {Number(event.ticketPrice).toLocaleString()} XAF
              </div>
              <div className="text-xs mt-1 font-semibold" style={{ color: '#737373', fontFamily: 'Poppins,sans-serif' }}>per ticket</div>
            </>
          ) : (
            <>
              <div className="text-3xl font-display font-bold" style={{ color: '#16a34a' }}>Free</div>
              <div className="text-xs mt-1 font-semibold" style={{ color: '#737373', fontFamily: 'Poppins,sans-serif' }}>no ticket required</div>
            </>
          )}
        </div>

        {/* Spots left */}
        {spotsLeft !== null && (
          <div>
            <div className="flex justify-between text-xs mb-1.5" style={{ color: '#737373', fontFamily: 'Poppins,sans-serif' }}>
              <span>{event.registration_count || 0} registered</span>
              <span style={{ color: spotsLeft <= 5 ? '#dc2626' : '#16a34a', fontWeight: 600 }}>
                {isFull ? 'Fully booked' : `${spotsLeft} spot${spotsLeft === 1 ? '' : 's'} left`}
              </span>
            </div>
            <div className="w-full h-2 rounded-full overflow-hidden" style={{ background: 'rgba(91,45,142,0.08)' }}>
              <div className="h-full rounded-full transition-all"
                style={{
                  width: `${Math.min(100, ((event.registration_count || 0) / event.maxAttendees) * 100)}%`,
                  background: isFull ? '#dc2626' : `linear-gradient(to right,${color},#F0A500)`,
                }} />
            </div>
          </div>
        )}

        <TicketDetails event={event} isPaidEvent={isPaidEvent} color={color} />

        {isOver ? (
          <div className="text-center py-4 rounded-2xl text-sm font-semibold"
            style={{ background: 'rgba(0,0,0,0.04)', color: '#A3A3A3', fontFamily: 'Sora,sans-serif' }}>
            This event has ended
          </div>
        ) : isFull ? (
          <div className="text-center py-4 rounded-2xl text-sm font-semibold"
            style={{ background: 'rgba(220,38,38,0.06)', color: '#dc2626', fontFamily: 'Sora,sans-serif' }}>
            <i className="fas fa-lock mr-2" /> Fully Booked
          </div>
        ) : (
          <button onClick={() => setStep('form')}
            className="w-full py-3.5 rounded-2xl font-display font-bold text-sm text-white transition-all hover:opacity-90 active:scale-[0.98] flex items-center justify-center gap-2"
            style={{ background: `linear-gradient(135deg,${color},#7B4DB8)`, boxShadow: `0 6px 24px ${color}40` }}>
            <i className={isPaidEvent ? 'fas fa-ticket-alt' : 'fas fa-calendar-check'} />
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
        className="flex items-center gap-2 text-xs mb-5 transition-colors"
        style={{ color: '#A3A3A3', fontFamily: 'Poppins,sans-serif' }}>
        <i className="fas fa-arrow-left text-[10px]" /> Back
      </button>
      <h3 className="font-display font-bold text-lg mb-5" style={{ color: '#1A0A35' }}>
        {isPaidEvent ? 'Secure Your Ticket' : 'Register for This Event'}
      </h3>

      <RegistrationForm
        event={event}
        isPaidEvent={isPaidEvent}
        color={color}
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
function RegistrationForm({ event, isPaidEvent, color, user, loading, error, setLoading, setError, onSuccess }) {
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
      // Fetch Flutterwave public key from donations config
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
        // No live key configured — register directly (dev/test mode)
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
      <Field label="Full Name *" value={name} onChange={setName} placeholder="Your full name" icon="fa-user" color={color} />
      <Field label="Email Address *" value={email} onChange={setEmail} placeholder="you@example.com" icon="fa-envelope" color={color} type="email" />
      <Field label="Phone Number" value={phone} onChange={setPhone} placeholder="+237 6XX XXX XXX" icon="fa-phone" color={color} />

      {isPaidEvent && (
        <div className="rounded-2xl p-4" style={{ background: `${color}08`, border: `1px solid ${color}18` }}>
          <div className="flex items-center justify-between text-sm">
            <span style={{ color: '#525252', fontFamily: 'Poppins,sans-serif' }}>Ticket Price</span>
            <span className="font-display font-bold" style={{ color }}>
              {Number(event.ticketPrice).toLocaleString()} XAF
            </span>
          </div>
        </div>
      )}

      {error && (
        <div className="rounded-xl p-3 text-xs flex items-start gap-2"
          style={{ background: 'rgba(220,38,38,0.06)', color: '#dc2626', border: '1px solid rgba(220,38,38,0.15)', fontFamily: 'Poppins,sans-serif' }}>
          <i className="fas fa-exclamation-circle mt-0.5 flex-shrink-0" />
          {error}
        </div>
      )}

      <button type="submit" disabled={loading}
        className="w-full py-3.5 rounded-2xl font-display font-bold text-sm text-white transition-all hover:opacity-90 active:scale-[0.98] flex items-center justify-center gap-2 disabled:opacity-60"
        style={{ background: `linear-gradient(135deg,${color},#7B4DB8)`, boxShadow: `0 6px 24px ${color}40` }}>
        {loading ? (
          <>
            <div className="w-4 h-4 rounded-full border-2 border-white/30 border-t-white animate-spin" />
            {isPaidEvent ? 'Opening Payment…' : 'Registering…'}
          </>
        ) : (
          <>
            <i className={isPaidEvent ? 'fas fa-lock text-xs' : 'fas fa-calendar-check text-xs'} />
            {isPaidEvent ? `Pay ${Number(event.ticketPrice).toLocaleString()} XAF` : 'Confirm Registration'}
          </>
        )}
      </button>

      {isPaidEvent && (
        <p className="text-center text-[10px]" style={{ color: '#A3A3A3', fontFamily: 'Poppins,sans-serif' }}>
          <i className="fas fa-shield-alt mr-1" /> Secured by Flutterwave
        </p>
      )}
    </form>
  )
}

function Field({ label, value, onChange, placeholder, icon, color, type = 'text' }) {
  return (
    <div>
      <label className="block text-xs font-semibold mb-1.5"
        style={{ color: '#525252', fontFamily: 'Sora,sans-serif' }}>{label}</label>
      <div className="relative">
        <i className={`fas ${icon} absolute left-3.5 top-1/2 -translate-y-1/2 text-xs`}
          style={{ color: 'rgba(91,45,142,0.35)' }} />
        <input
          type={type}
          value={value}
          onChange={e => onChange(e.target.value)}
          placeholder={placeholder}
          className="w-full pl-9 pr-4 py-3 rounded-xl text-sm outline-none transition-all"
          style={{
            background: '#F8F5FF',
            border: '1.5px solid rgba(91,45,142,0.12)',
            color: '#1A0A35',
            fontFamily: 'Poppins,sans-serif',
          }}
          onFocus={e => { e.target.style.borderColor = color; e.target.style.background = '#fff' }}
          onBlur={e => { e.target.style.borderColor = 'rgba(91,45,142,0.12)'; e.target.style.background = '#F8F5FF' }}
        />
      </div>
    </div>
  )
}

/* ════════════════════════════════════════
   TICKET DETAILS (shared)
════════════════════════════════════════ */
function TicketDetails({ event, isPaidEvent, color }) {
  const d = new Date(event.startDate)
  return (
    <div className="space-y-2.5">
      <InfoRow icon="fa-calendar-alt" color={color} value={format(d, 'MMMM d, yyyy')} />
      <InfoRow icon="fa-clock" color={color} value={
        event.endDate
          ? `${format(d, 'h:mm a')} – ${format(new Date(event.endDate), 'h:mm a')}`
          : format(d, 'h:mm a')
      } />
      {event.venue && <InfoRow icon="fa-map-marker-alt" color={color} value={event.venue} />}
      {event.isOnline && <InfoRow icon="fa-video" color="#0284c7" value="Online Event" />}
      {isPaidEvent
        ? <InfoRow icon="fa-tag" color={color} value={`${Number(event.ticketPrice).toLocaleString()} XAF`} />
        : <InfoRow icon="fa-gift" color="#16a34a" value="Free Admission" />
      }
    </div>
  )
}

function InfoRow({ icon, color, value }) {
  return (
    <div className="flex items-center gap-3 text-xs" style={{ color: '#525252', fontFamily: 'Poppins,sans-serif' }}>
      <i className={`fas ${icon} w-3.5 text-center flex-shrink-0`} style={{ color }} />
      <span>{value}</span>
    </div>
  )
}

/* ════════════════════════════════════════
   SUCCESS VIEW
════════════════════════════════════════ */
function SuccessView({ ticket, event, color }) {
  const d = new Date(event.startDate)
  return (
    <div className="text-center">
      <div className="w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4"
        style={{ background: 'rgba(22,163,74,0.1)' }}>
        <i className="fas fa-check-circle text-4xl" style={{ color: '#16a34a' }} />
      </div>
      <h3 className="font-display font-bold text-xl mb-1" style={{ color: '#1A0A35' }}>You're In!</h3>
      <p className="text-xs mb-6" style={{ color: '#737373', fontFamily: 'Poppins,sans-serif' }}>
        Registration confirmed. Check your email for details.
      </p>

      {/* Ticket card */}
      <div className="rounded-3xl overflow-hidden mb-5" style={{ border: `2px solid ${color}22` }}>
        <div className="p-4 text-white" style={{ background: `linear-gradient(135deg,${color},#7B4DB8)` }}>
          <div className="text-[10px] font-bold uppercase tracking-widest opacity-70 mb-1">Event Ticket</div>
          <div className="font-display font-bold text-base leading-snug">{event.title}</div>
        </div>
        <div className="border-t-2 border-dashed" style={{ borderColor: `${color}22` }} />
        <div className="p-4 space-y-2" style={{ background: `${color}05` }}>
          <div className="flex justify-between text-xs" style={{ fontFamily: 'Poppins,sans-serif' }}>
            <span style={{ color: '#A3A3A3' }}>Date</span>
            <span className="font-semibold" style={{ color: '#1A0A35' }}>{format(d, 'MMMM d, yyyy')}</span>
          </div>
          <div className="flex justify-between text-xs" style={{ fontFamily: 'Poppins,sans-serif' }}>
            <span style={{ color: '#A3A3A3' }}>Time</span>
            <span className="font-semibold" style={{ color: '#1A0A35' }}>{format(d, 'h:mm a')}</span>
          </div>
          {event.venue && (
            <div className="flex justify-between text-xs" style={{ fontFamily: 'Poppins,sans-serif' }}>
              <span style={{ color: '#A3A3A3' }}>Venue</span>
              <span className="font-semibold" style={{ color: '#1A0A35' }}>{event.venue}</span>
            </div>
          )}
          <div className="pt-2 mt-2 border-t" style={{ borderColor: `${color}14` }}>
            <div className="text-[10px] uppercase tracking-wider font-semibold mb-1" style={{ color: '#A3A3A3', fontFamily: 'Sora,sans-serif' }}>Ticket Reference</div>
            <div className="font-display font-bold text-base tracking-wider" style={{ color }}>
              {ticket}
            </div>
          </div>
        </div>
      </div>

      <div className="flex items-center justify-center gap-3">
        <Link to="/events"
          className="inline-flex items-center gap-2 text-xs font-semibold transition-colors"
          style={{ color, fontFamily: 'Sora,sans-serif' }}>
          <i className="fas fa-arrow-left text-[10px]" /> Back to Events
        </Link>
        <button
          onClick={() => window.print()}
          className="inline-flex items-center gap-2 text-xs font-semibold px-4 py-2 rounded-xl transition-all hover:opacity-80"
          style={{ background: `${color}12`, color, fontFamily: 'Sora,sans-serif' }}>
          <i className="fas fa-print text-[10px]" /> Print Ticket
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
      <i className="fas fa-calendar-times text-6xl" style={{ color: 'rgba(91,45,142,0.2)' }} />
      <h2 className="font-display font-bold text-2xl" style={{ color: '#1A0A35' }}>Event Not Found</h2>
      <p className="text-sm" style={{ color: '#737373', fontFamily: 'Poppins,sans-serif' }}>
        This event may have been removed or the link is incorrect.
      </p>
      <Link to="/events" className="btn-primary mt-2">
        <i className="fas fa-calendar-alt text-xs" /> Browse Events
      </Link>
    </div>
  )
}
