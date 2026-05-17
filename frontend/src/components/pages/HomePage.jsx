import { useState, useEffect, useRef } from 'react'
import { Link, useOutletContext } from 'react-router-dom'
import { useQuery } from 'react-query'
import { format, differenceInDays } from 'date-fns'
import { useInView } from 'react-intersection-observer'
import CountUp from 'react-countup'
import toast from 'react-hot-toast'
import api from '../../services/api'
import ProjectCard from '../common/ProjectCard'
import NewsCard from '../common/NewsCard'
import TeamCard from '../common/TeamCard'
import JoinTeamModal from '../common/JoinTeamModal'

/* ─────────────────────────────────────────
   CAUSE CATEGORIES (used once)
───────────────────────────────────────── */
const CAUSE_CATS = [
  { icon:'fa-graduation-cap', label:'Education',     color:'#5B2D8E', bg:'rgba(91,45,142,0.08)'  },
  { icon:'fa-heartbeat',      label:'Health Care',   color:'#e53e3e', bg:'rgba(229,62,62,0.08)'  },
  { icon:'fa-tint',           label:'Clean Water',   color:'#3182ce', bg:'rgba(49,130,206,0.08)' },
  { icon:'fa-road',           label:'Infrastructure',color:'#C87800', bg:'rgba(200,120,0,0.08)'  },
  { icon:'fa-music',          label:'Culture',       color:'#805ad5', bg:'rgba(128,90,213,0.08)' },
  { icon:'fa-seedling',       label:'Agriculture',   color:'#38a169', bg:'rgba(56,161,105,0.08)' },
]

/* ─────────────────────────────────────────
   TESTIMONIALS (real community voices)
───────────────────────────────────────── */
// ─── EDIT TESTIMONIALS HERE ───────────────────────────────────────────────────
// To add a photo: set photo to a URL string, e.g. photo: '/photos/marie.jpg'
//                 or a Cloudinary URL. Leave as null to show initials instead.
// To add more:    copy a block, change the fields, add a comma.
// ──────────────────────────────────────────────────────────────────────────────
const TESTIS = [
  {
    photo: 'https://res.cloudinary.com/dmxnsttmu/image/upload/v1778928729/WhatsApp_Image_2026-04-30_at_20.57.27_dj89ir.jpg', // ← replace null with photo URL, e.g. 'https://res.cloudinary.com/.../photo.jpg'
    text: 'Thanks to the school renovation project, my children now study in proper classrooms with real furniture and electricity. The community\'s unity has truly changed our village — I am proud to be from Nkenkak-Ngiesang.',
    name: 'Marie Nkemdirim', role: 'Parent & Village Elder', country: '🇨🇲',
    avatar: 'MN', color: '#5B2D8E', colorDark: '#3D1A6B',
  },
  {
    photo: 'https://res.cloudinary.com/dmxnsttmu/image/upload/v1778219170/zr7k9jpn3pg1hkwqshgp.jpg',
    text: 'Even from France, I feel deeply connected to home through this platform. Contributing to the health centre project was one of the most meaningful things I\'ve done for my roots — every report and photo keeps me close to the village.',
    name: 'Jean-Paul Tchamba', role: 'Diaspora Member, Paris', country: '🇫🇷',
    avatar: 'JT', color: '#C87800', colorDark: '#945900',
  },
  {
    photo: 'https://res.cloudinary.com/dmxnsttmu/image/upload/v1778262556/WhatsApp_Image_2026-04-30_at_20.57.13_yl6xj3.jpg',
    text: 'As cland head of the Upper Nkongho Mbo people in Buea , and leader  I joined the volunteer team and helped design the water distribution system. Seeing it in operation — knowing 42 families now have clean water because of our collective work — is absolutely priceless.',
    name: 'chief professor Nfossung-nkem.', role: 'Cland Head Buea & Adviser', country: '🇨🇲',
    avatar: 'EF', color: '#16a34a', colorDark: '#14532d',
  },
  {
    photo: 'https://res.cloudinary.com/dmxnsttmu/image/upload/q_auto/f_auto/v1778928806/WhatsApp_Image_2026-04-30_at_20.57.16_aynfja.jpg',
    text: 'I have donated to several organisations over the years, but none gave me the transparency and community feel of Nkenkak-Ngiesang. Every update and milestone report shows exactly where my contribution goes. This is how development should work.',
    name: 'Amina Koueye', role: 'Monthly Donor, Berlin', country: '🇩🇪',
    avatar: 'AK', color: '#0284c7', colorDark: '#01579b',
  },
]

/* ─────────────────────────────────────────
   HERO FALLBACK SLIDES
───────────────────────────────────────── */
const FALLBACK_SLIDES = [
  { image:'', title:'Primary School Renovation', summary:'Renovating 6 classrooms to serve 400+ students with modern learning facilities for the next generation.', category:'education', goalAmount:5000000, raisedAmount:2100000, grad:'#250F47,#5B2D8E' },
  { image:'', title:'Community Health Centre',   summary:'Building a modern health facility accessible to all village residents and the surrounding communities.', category:'health',    goalAmount:8000000, raisedAmount:3500000, grad:'#3D1A6B,#7B4DB8' },
  { image:'', title:'Clean Water Initiative',    summary:'Drilling boreholes and installing water treatment systems so every family has access to safe drinking water.', category:'environment', goalAmount:3000000, raisedAmount:900000, grad:'#1A3A20,#2D5016' },
]

/* ─────────────────────────────────────────
   STAT COUNTER
───────────────────────────────────────── */
function StatCounter({ icon, value, label, prefix='', suffix='' }) {
  const { ref, inView } = useInView({ triggerOnce: true, threshold: 0.5 })
  return (
    <div ref={ref} className="flex items-center gap-4">
      <div className="w-14 h-14 rounded-2xl flex items-center justify-center flex-shrink-0"
        style={{ background:'rgba(240,165,0,0.15)' }}>
        <i className={`fas ${icon} text-xl`} style={{ color:'#F0A500' }}/>
      </div>
      <div>
        <div className="font-display font-bold text-2xl" style={{ color:'#1A0A35' }}>
          {inView
            ? <>{prefix}<CountUp end={value} duration={2.5} separator=","/>{suffix}</>
            : `${prefix}0${suffix}`}
        </div>
        <div className="text-xs" style={{ color:'#737373', fontFamily:'Poppins,sans-serif' }}>{label}</div>
      </div>
    </div>
  )
}

/* ─────────────────────────────────────────
   MILESTONES TICKER
───────────────────────────────────────── */
function MilestonesTicker({ items }) {
  const doubled = [...items, ...items]
  return (
    <div className="py-4 overflow-hidden" style={{ background:'#FBF8F2', borderTop:'1px solid rgba(91,45,142,0.08)', borderBottom:'1px solid rgba(91,45,142,0.08)' }}>
      <div className="flex" style={{ animation:'ticker 35s linear infinite', width:'max-content' }}>
        {doubled.map((m, i) => (
          <div key={i} className="flex items-center gap-3 px-8 text-sm font-medium whitespace-nowrap"
            style={{ color:'rgba(91,45,142,0.55)', fontFamily:'Sora,sans-serif' }}>
            <i className="fas fa-circle text-[5px]" style={{ color:'#F0A500' }}/>
            <span>{m}</span>
          </div>
        ))}
      </div>
    </div>
  )
}

/* ─────────────────────────────────────────
   FLOATING DONATE BUTTON
───────────────────────────────────────── */
function FloatingDonate({ onClick }) {
  const [visible, setVisible] = useState(false)
  useEffect(() => {
    const fn = () => setVisible(window.scrollY > 600)
    window.addEventListener('scroll', fn, { passive: true })
    return () => window.removeEventListener('scroll', fn)
  }, [])
  return (
    <button onClick={onClick}
      className="hidden sm:flex fixed bottom-24 right-8 z-40 items-center gap-2 px-5 py-3 rounded-full font-bold text-sm shadow-2xl transition-all duration-300"
      style={{
        background:'linear-gradient(135deg,#F0A500,#FFB84D)',
        color:'#fff', fontFamily:'Sora,sans-serif',
        boxShadow:'0 8px 32px rgba(240,165,0,0.45)',
        opacity: visible ? 1 : 0,
        transform: visible ? 'translateY(0) scale(1)' : 'translateY(20px) scale(0.9)',
        pointerEvents: visible ? 'auto' : 'none',
      }}>
      <i className="fas fa-heart text-xs animate-pulse"/>Donate
    </button>
  )
}

/* ─────────────────────────────────────────
   NEWSLETTER SECTION
───────────────────────────────────────── */
function NewsletterSection() {
  const [email, setEmail] = useState('')
  const [done,  setDone]  = useState(false)
  const submit = async (e) => {
    e.preventDefault()
    if (!email) return
    try {
      await api.post('/newsletter/subscribe', { email })
      setDone(true)
      toast.success('Thank you for subscribing!')
    } catch { toast.error('Could not subscribe. Try again.') }
  }
  return (
    <section className="py-20 relative overflow-hidden" style={{ background:'linear-gradient(135deg,#1A0A35,#250F47)' }}>
      <div className="wave-pattern absolute inset-0 opacity-30"/>
      <div className="absolute top-0 right-0 w-80 h-80 rounded-full pointer-events-none"
        style={{ background:'radial-gradient(circle,rgba(240,165,0,0.08),transparent 70%)', filter:'blur(40px)' }}/>
      <div className="relative max-w-2xl mx-auto px-6 text-center">
        <div className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-5"
          style={{ background:'linear-gradient(135deg,#F0A500,#FFB84D)' }}>
          <i className="fas fa-envelope text-white text-2xl"/>
        </div>
        <div className="text-xs uppercase tracking-widest font-bold mb-3" style={{ color:'rgba(240,165,0,0.7)', fontFamily:'Sora,sans-serif' }}>
          Stay Connected
        </div>
        <h2 className="font-display font-bold text-3xl text-white mb-3 leading-tight">
          Never Miss a Village <span style={{ color:'#F0A500' }}>Update</span>
        </h2>
        <p className="text-sm mb-8" style={{ color:'rgba(255,255,255,0.6)', fontFamily:'Poppins,sans-serif' }}>
          Get project milestones, event invitations, and community news delivered straight to your inbox — whether you're in the village or across the world.
        </p>
        {done ? (
          <div className="flex items-center justify-center gap-3 py-4">
            <div className="w-10 h-10 rounded-full flex items-center justify-center" style={{ background:'rgba(22,163,74,0.2)' }}>
              <i className="fas fa-check text-green-400"/>
            </div>
            <p className="text-white font-semibold" style={{ fontFamily:'Sora,sans-serif' }}>You're subscribed! Welcome to the family.</p>
          </div>
        ) : (
          <form onSubmit={submit} className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto">
            <input value={email} onChange={e => setEmail(e.target.value)} type="email" required
              placeholder="Enter your email address"
              className="flex-1 px-5 py-3.5 rounded-2xl text-sm outline-none"
              style={{ background:'rgba(255,255,255,0.08)', color:'#fff', border:'1px solid rgba(255,255,255,0.15)', fontFamily:'Poppins,sans-serif' }}/>
            <button type="submit" className="btn-gold !py-3.5 !px-6 whitespace-nowrap">
              <i className="fas fa-paper-plane text-xs"/>Subscribe
            </button>
          </form>
        )}
        <p className="text-[10px] mt-4" style={{ color:'rgba(255,255,255,0.3)', fontFamily:'Poppins,sans-serif' }}>
          No spam. Unsubscribe anytime. Your privacy is respected.
        </p>
      </div>
    </section>
  )
}

/* ─────────────────────────────────────────
   GALLERY SECTION + LIGHTBOX
───────────────────────────────────────── */
function GallerySection({ gallery }) {
  const [lightboxIdx, setLightboxIdx] = useState(null)
  const [touchStart,  setTouchStart]  = useState(null)

  const items = gallery?.slice(0, 6) || []
  const total = gallery?.length || 0

  const close = ()  => setLightboxIdx(null)
  const prev  = ()  => setLightboxIdx(i => (i - 1 + items.length) % items.length)
  const next  = ()  => setLightboxIdx(i => (i + 1) % items.length)

  // Keyboard nav + scroll lock
  useEffect(() => {
    if (lightboxIdx === null) { document.body.style.overflow = ''; return }
    document.body.style.overflow = 'hidden'
    const onKey = (e) => {
      if (e.key === 'ArrowLeft')  prev()
      if (e.key === 'ArrowRight') next()
      if (e.key === 'Escape')     close()
    }
    window.addEventListener('keydown', onKey)
    return () => { window.removeEventListener('keydown', onKey); document.body.style.overflow = '' }
  }, [lightboxIdx])

  const onTouchStart = (e) => setTouchStart(e.touches[0].clientX)
  const onTouchEnd   = (e) => {
    if (touchStart === null) return
    const delta = touchStart - e.changedTouches[0].clientX
    if (Math.abs(delta) > 50) delta > 0 ? next() : prev()
    setTouchStart(null)
  }

  if (!total) return null

  // Grid area assignments: a=wide top-left, b=top-right, c=tall-left, d=mid-top, e=mid-bot, f=tall-right
  const AREAS = ['a','b','c','d','e','f']

  return (
    <section className="py-20 relative overflow-hidden"
      style={{ background:'linear-gradient(160deg,#060110 0%,#0E0520 50%,#1A0A35 100%)' }}>
      {/* Glow */}
      <div className="absolute top-0 left-1/4 w-[500px] h-[500px] rounded-full pointer-events-none"
        style={{ background:'radial-gradient(circle,rgba(91,45,142,0.14),transparent 70%)', filter:'blur(80px)' }}/>

      <div className="relative max-w-7xl mx-auto px-6">
        <div className="flex flex-col lg:flex-row gap-10 items-start">

          {/* ── Left: text panel ── */}
          <div className="lg:w-64 flex-shrink-0 flex flex-col justify-between" style={{ minHeight:320 }}>
            <div>
              <div className="flex items-center gap-2 mb-5">
                <span className="w-5 h-0.5 rounded-full" style={{ background:'#F0A500' }}/>
                <span className="text-[11px] uppercase tracking-[0.18em] font-bold"
                  style={{ color:'rgba(240,165,0,0.75)', fontFamily:'Sora,sans-serif' }}>Gallery</span>
              </div>
              <h2 className="font-display font-bold text-white leading-[1.12] mb-5"
                style={{ fontSize:'clamp(1.9rem,3vw,2.6rem)' }}>
                Life in<br/>
                <span style={{ color:'#F0A500' }}>Nkenkak-<br/>Ngiesang</span><br/>
                in pictures
              </h2>
              <div className="text-sm font-semibold mb-6" style={{ color:'rgba(255,255,255,0.28)', fontFamily:'Sora,sans-serif', letterSpacing:'0.05em' }}>
                2024 / 2025
              </div>
              <p className="text-xs leading-relaxed mb-8" style={{ color:'rgba(255,255,255,0.4)', fontFamily:'Poppins,sans-serif' }}>
                {total} moments captured from our village, events, and community projects.
              </p>
            </div>
            <Link to="/gallery"
              className="inline-flex items-center gap-2 text-sm font-bold px-6 py-3 rounded-full self-start transition-all hover:opacity-90 hover:-translate-y-0.5"
              style={{ background:'linear-gradient(135deg,#F0A500,#FFB84D)', color:'#fff',
                       fontFamily:'Sora,sans-serif', boxShadow:'0 6px 24px rgba(240,165,0,0.35)' }}>
              View All <i className="fas fa-arrow-right text-xs"/>
            </Link>
          </div>

          {/* ── Right: photo grid ── */}
          <div className="flex-1 min-w-0" style={{
            display:'grid',
            gridTemplateAreas:'"a a b" "c d f" "c e f"',
            gridTemplateColumns:'1fr 1fr 1fr',
            gridTemplateRows:'195px 140px 140px',
            gap:10,
          }}>
            {AREAS.map((area, i) => {
              const item = items[i]
              if (!item) return null
              const isLast = i === 5 && total > 6
              return (
                <button key={item.id}
                  onClick={() => !isLast && setLightboxIdx(i)}
                  className="group relative overflow-hidden rounded-2xl w-full h-full"
                  style={{ gridArea:area, background:'#12082A',
                           cursor: isLast ? 'default' : 'pointer' }}>
                  <img src={item.thumbnail || item.url} alt={item.title || ''}
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"/>
                  {/* Hover overlay */}
                  {!isLast && (
                    <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300"
                      style={{ background:'rgba(6,2,16,0.38)' }}>
                      <div className="w-11 h-11 rounded-full flex items-center justify-center"
                        style={{ background:'rgba(255,255,255,0.14)', backdropFilter:'blur(8px)', border:'1px solid rgba(255,255,255,0.22)' }}>
                        <i className="fas fa-expand text-white"/>
                      </div>
                    </div>
                  )}
                  {/* +more overlay */}
                  {isLast && (
                    <div className="absolute inset-0 flex flex-col items-center justify-center"
                      style={{ background:'rgba(6,2,16,0.72)', backdropFilter:'blur(3px)' }}>
                      <div className="font-display font-extrabold text-white leading-none" style={{ fontSize:'2.2rem' }}>
                        +{total - 6}
                      </div>
                      <div className="text-xs mt-1.5 font-medium" style={{ color:'rgba(255,255,255,0.55)', fontFamily:'Poppins,sans-serif' }}>more photos</div>
                    </div>
                  )}
                  {/* Title slide-up */}
                  {item.title && !isLast && (
                    <div className="absolute bottom-0 left-0 right-0 px-3 py-2.5 translate-y-full group-hover:translate-y-0 transition-transform duration-300"
                      style={{ background:'linear-gradient(to top,rgba(6,2,16,0.9),transparent)' }}>
                      <p className="text-white text-[11px] font-semibold truncate" style={{ fontFamily:'Sora,sans-serif' }}>
                        {item.title}
                      </p>
                    </div>
                  )}
                </button>
              )
            })}
          </div>
        </div>
      </div>

      {/* ── Lightbox ── */}
      {lightboxIdx !== null && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center"
          style={{ background:'rgba(0,0,0,0.93)', backdropFilter:'blur(14px)' }}
          onClick={close}
          onTouchStart={onTouchStart}
          onTouchEnd={onTouchEnd}>

          {/* Close */}
          <button onClick={close}
            className="absolute top-5 right-5 z-10 w-11 h-11 rounded-full flex items-center justify-center transition-all hover:scale-110 hover:bg-white/10"
            style={{ background:'rgba(255,255,255,0.08)', border:'1px solid rgba(255,255,255,0.14)', color:'#fff' }}>
            <i className="fas fa-times"/>
          </button>

          {/* Counter */}
          <div className="absolute top-5 left-1/2 -translate-x-1/2 z-10 text-xs font-bold px-4 py-1.5 rounded-full"
            style={{ background:'rgba(255,255,255,0.07)', color:'rgba(255,255,255,0.65)', fontFamily:'Sora,sans-serif', border:'1px solid rgba(255,255,255,0.1)' }}>
            {lightboxIdx + 1} / {items.length}
          </div>

          {/* Prev */}
          <button onClick={e => { e.stopPropagation(); prev() }}
            className="absolute left-4 top-1/2 -translate-y-1/2 z-10 w-12 h-12 rounded-full flex items-center justify-center transition-all hover:scale-110 hover:bg-white/10"
            style={{ background:'rgba(255,255,255,0.07)', border:'1px solid rgba(255,255,255,0.12)', color:'#fff' }}>
            <i className="fas fa-chevron-left"/>
          </button>

          {/* Image */}
          <div className="relative mx-16 flex flex-col items-center max-w-5xl w-full"
            onClick={e => e.stopPropagation()}>
            <img key={lightboxIdx}
              src={items[lightboxIdx].url || items[lightboxIdx].thumbnail}
              alt={items[lightboxIdx].title || ''}
              className="max-h-[80vh] w-auto max-w-full object-contain rounded-2xl"
              style={{ animation:'fadeSlideUp 0.25s ease forwards', boxShadow:'0 40px 100px rgba(0,0,0,0.7)' }}/>
            {items[lightboxIdx].title && (
              <p className="mt-4 text-center text-sm"
                style={{ color:'rgba(255,255,255,0.5)', fontFamily:'Poppins,sans-serif' }}>
                {items[lightboxIdx].title}
              </p>
            )}
          </div>

          {/* Next */}
          <button onClick={e => { e.stopPropagation(); next() }}
            className="absolute right-4 top-1/2 -translate-y-1/2 z-10 w-12 h-12 rounded-full flex items-center justify-center transition-all hover:scale-110 hover:bg-white/10"
            style={{ background:'rgba(255,255,255,0.07)', border:'1px solid rgba(255,255,255,0.12)', color:'#fff' }}>
            <i className="fas fa-chevron-right"/>
          </button>

          {/* Dot strip */}
          <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex gap-2">
            {items.map((_, i) => (
              <button key={i}
                onClick={e => { e.stopPropagation(); setLightboxIdx(i) }}
                className="rounded-full transition-all duration-300"
                style={{ width: i === lightboxIdx ? 24 : 7, height:7,
                         background: i === lightboxIdx ? '#F0A500' : 'rgba(255,255,255,0.28)' }}/>
            ))}
          </div>
        </div>
      )}
    </section>
  )
}

/* ─────────────────────────────────────────
   TESTIMONIAL SLIDER
───────────────────────────────────────── */
const SLIDE_DURATION = 6000

function TestimonialSlider() {
  const [idx,     setIdx]     = useState(0)
  const [playing, setPlaying] = useState(true)
  const [animKey, setAnimKey] = useState(0)

  const goTo = (i) => {
    setIdx((i + TESTIS.length) % TESTIS.length)
    setAnimKey(k => k + 1)
  }

  useEffect(() => {
    if (!playing) return
    const timer = setTimeout(() => goTo(idx + 1), SLIDE_DURATION)
    return () => clearTimeout(timer)
  }, [playing, idx])

  const t = TESTIS[idx]
  const CIRC = 163 // 2π × r26

  return (
    <section className="py-20" style={{ background:'linear-gradient(135deg,#FBF8F2,#F3EEF9)' }}>
      <div className="max-w-5xl mx-auto px-6">

        {/* Header */}
        <div className="text-center mb-10">
          <div className="eyebrow justify-center mb-2">Community Voices</div>
          <h2 className="section-title">What Our <span>Leaders Say</span></h2>
          <p className="text-sm mt-3 max-w-lg mx-auto" style={{ color:'#737373', fontFamily:'Poppins,sans-serif' }}>
            Real stories from village residents, diaspora members and volunteers who are part of our journey.
          </p>
        </div>

        {/* Slide card */}
        <div key={`card-${idx}-${animKey}`}
          className="flex flex-col sm:flex-row items-stretch rounded-3xl overflow-hidden mb-8"
          style={{
            background:'#fff',
            boxShadow:'0 12px 60px rgba(91,45,142,0.1), 0 2px 8px rgba(91,45,142,0.06)',
            minHeight: 280,
            animation:'fadeSlideUp 0.4s cubic-bezier(0.16,1,0.3,1) forwards',
          }}>

          {/* Left: content */}
          <div className="flex-1 px-10 py-10 flex flex-col justify-between">
            {/* Accent bar */}
            <div className="w-10 h-[3px] rounded-full mb-6" style={{ background:t.color }}/>

            {/* Quote */}
            <p className="text-base leading-[1.9] mb-8 flex-1"
              style={{ color:'#3a3a3a', fontFamily:'Poppins,sans-serif' }}>
              {t.text}
            </p>

            {/* Name + role + flag */}
            <div className="flex items-center gap-3">
              <div className="w-1 h-8 rounded-full" style={{ background:t.color }}/>
              <div>
                <div className="font-display font-bold text-base leading-tight" style={{ color:'#1A0A35' }}>
                  {t.name} <span className="text-sm font-normal ml-1">{t.country}</span>
                </div>
                <div className="text-sm mt-0.5" style={{ color:'#999', fontFamily:'Poppins,sans-serif' }}>{t.role}</div>
              </div>
            </div>
          </div>

          {/* Right: portrait */}
          <div className="sm:w-56 flex-shrink-0 relative overflow-hidden"
            style={{ background:`linear-gradient(160deg,${t.color}10,${t.color}25)`, minHeight: 240 }}>
            {t.photo ? (
              /* Real photo fills the entire panel */
              <img src={t.photo} alt={t.name}
                className="absolute inset-0 w-full h-full object-cover object-top"/>
            ) : (
              /* Fallback: centered initials avatar */
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="relative">
                  <div className="w-28 h-28 rounded-2xl flex items-center justify-center font-display font-extrabold text-4xl text-white"
                    style={{ background:`linear-gradient(135deg,${t.color},${t.colorDark})`, boxShadow:`0 12px 36px ${t.color}45` }}>
                    {t.avatar}
                  </div>
                  <div className="absolute -top-2 -right-2 w-8 h-8 rounded-full flex items-center justify-center bg-white"
                    style={{ fontSize:'1rem', boxShadow:'0 2px 12px rgba(0,0,0,0.15)' }}>
                    {t.country}
                  </div>
                </div>
              </div>
            )}
            {/* Country badge pinned over photo */}
            {t.photo && (
              <div className="absolute top-3 right-3 w-8 h-8 rounded-full flex items-center justify-center bg-white z-10"
                style={{ fontSize:'1rem', boxShadow:'0 2px 12px rgba(0,0,0,0.2)' }}>
                {t.country}
              </div>
            )}
          </div>
        </div>

        {/* Controls: prev | circular-progress play | next */}
        <div className="flex items-center justify-center gap-6 mb-4">
          <button onClick={() => goTo(idx - 1)}
            className="w-9 h-9 rounded-full flex items-center justify-center transition-all duration-200 hover:scale-110 active:scale-95"
            style={{ color:'#aaa' }}>
            <i className="fas fa-chevron-left"/>
          </button>

          {/* Circular progress ring */}
          <div className="relative flex items-center justify-center" style={{ width:54, height:54 }}>
            <svg width="54" height="54" style={{ position:'absolute', inset:0, transform:'rotate(-90deg)' }}>
              <circle cx="27" cy="27" r="24" fill="none" strokeWidth="2.5" stroke="rgba(0,0,0,0.07)"/>
              {playing && (
                <circle key={`ring-${idx}-${animKey}`} cx="27" cy="27" r="24" fill="none" strokeWidth="2.5"
                  stroke={t.color} strokeLinecap="round"
                  strokeDasharray="151" strokeDashoffset="151"
                  style={{ animation:`progressRing ${SLIDE_DURATION}ms linear forwards` }}/>
              )}
            </svg>
            <button onClick={() => setPlaying(p => !p)}
              className="w-9 h-9 rounded-full flex items-center justify-center transition-all duration-200 hover:scale-105 active:scale-95 relative z-10 bg-white"
              style={{ boxShadow:'0 2px 14px rgba(0,0,0,0.13)', color:'#555' }}>
              <i className={`fas ${playing ? 'fa-pause' : 'fa-play'} text-xs`} style={{ marginLeft: playing ? 0 : 2 }}/>
            </button>
          </div>

          <button onClick={() => goTo(idx + 1)}
            className="w-9 h-9 rounded-full flex items-center justify-center transition-all duration-200 hover:scale-110 active:scale-95"
            style={{ color:'#aaa' }}>
            <i className="fas fa-chevron-right"/>
          </button>
        </div>

        {/* Dot indicators */}
        <div className="flex justify-center gap-2">
          {TESTIS.map((ti, i) => (
            <button key={i} onClick={() => goTo(i)}
              className="rounded-full transition-all duration-300"
              style={{ width: i === idx ? 24 : 7, height: 7, background: i === idx ? TESTIS[i].color : 'rgba(0,0,0,0.13)' }}/>
          ))}
        </div>

      </div>
    </section>
  )
}

/* ─────────────────────────────────────────
   MAIN COMPONENT
───────────────────────────────────────── */
/* ─────────────────────────────────────────
   ANNOUNCEMENT BANNER
───────────────────────────────────────── */
function AnnouncementBanner() {
  const [dismissed, setDismissed] = useState(() => {
    try { return JSON.parse(sessionStorage.getItem('bannerDismissed') || '[]') } catch { return [] }
  })
  const { data: notices = [] } = useQuery('urgent-notices',
    () => api.get('/notices?priority=urgent&limit=3').then(r => r.data || []),
    { staleTime: 5 * 60 * 1000 }
  )
  const visible = notices.filter(n => !dismissed.includes(n.id))
  if (!visible.length) return null
  const notice = visible[0]
  const dismiss = () => {
    const next = [...dismissed, notice.id]
    setDismissed(next)
    sessionStorage.setItem('bannerDismissed', JSON.stringify(next))
  }
  const colors = { urgent: { bg:'#dc2626', icon:'fa-exclamation-circle' }, high: { bg:'#C87800', icon:'fa-bell' } }
  const c = colors[notice.priority] || colors.high
  return (
    <div className="relative z-50 flex items-center gap-3 px-4 py-2.5 text-white text-sm"
      style={{ background: c.bg, fontFamily:'Poppins,sans-serif' }}>
      <i className={`fas ${c.icon} flex-shrink-0`}/>
      <span className="flex-1 font-medium line-clamp-1">{notice.title} — {notice.content}</span>
      <Link to="/notices" className="flex-shrink-0 underline text-xs opacity-80 hover:opacity-100">View all</Link>
      <button onClick={dismiss} className="flex-shrink-0 w-6 h-6 flex items-center justify-center rounded-full hover:bg-white/20 transition-colors">
        <i className="fas fa-times text-xs"/>
      </button>
    </div>
  )
}

export default function HomePage() {
  const { openDonate } = useOutletContext()
  const [joinOpen,  setJoinOpen]  = useState(false)
  const [heroSlide, setHeroSlide] = useState(0)

  /* ── Data fetching ── */
  const { data: projects } = useQuery('featured-projects',
    () => api.get('/projects?featured=true&limit=4').then(r => r.data.projects))
  const { data: news } = useQuery('recent-news',
    () => api.get('/news?limit=3').then(r => r.data.articles || r.data))
  const { data: team } = useQuery('team-home',
    () => api.get('/team').then(r => r.data.slice(0, 3)))
  const { data: events } = useQuery('upcoming-events',
    () => api.get('/events?upcoming=true').then(r => r.data.slice(0, 3)))
  const { data: gallery } = useQuery('gallery-preview',
    () => api.get('/gallery').then(r => r.data.filter(g => g.mediaType === 'image').slice(0, 6)))
  const { data: stats } = useQuery('site-stats',
    () => api.get('/stats').then(r => r.data),
    { staleTime: 5 * 60 * 1000 })

  /* ── Hero slides from featured projects ── */
  const heroSlides = projects?.length
    ? projects.slice(0, 4).map(p => ({
        image: p.coverImage || '', title: p.title, summary: p.summary || '',
        category: p.category, goalAmount: Number(p.goalAmount) || 0,
        raisedAmount: Number(p.raisedAmount) || 0, slug: p.slug, grad: '#250F47,#5B2D8E',
      }))
    : FALLBACK_SLIDES

  /* ── Auto-advance hero ── */
  useEffect(() => {
    const t = setInterval(() => setHeroSlide(s => (s + 1) % heroSlides.length), 6000)
    return () => clearInterval(t)
  }, [heroSlides.length])

  /* ── Milestones ticker items ── */
  const tickerItems = stats?.milestones?.length
    ? stats.milestones
    : ['Primary School Renovation — 85% funded', 'Health Centre — Under construction', 'Clean Water Initiative — 42 families served', 'Cultural Centre — Planning phase']

  return (
    <div>

      {/* ════════════════ ANNOUNCEMENT BANNER ════════════════ */}
      <AnnouncementBanner />

      {/* ════════════════ HERO ════════════════ */}
      <section className="relative min-h-[92vh] flex items-center overflow-hidden">
        {/* Backgrounds */}
        {heroSlides.map((slide, i) => (
          <div key={i} className="absolute inset-0 transition-opacity duration-1000"
            style={{ opacity: i === heroSlide ? 1 : 0 }}>
            {slide.image
              ? <img src={slide.image} alt="" className="w-full h-full object-cover" style={{ filter:'brightness(0.28)' }}/>
              : <div className="w-full h-full" style={{ background:`linear-gradient(135deg,#0A0418 0%,#1A0A35 40%,${slide.grad} 100%)` }}/>}
            <div className="absolute inset-0" style={{ background:'linear-gradient(105deg,rgba(6,2,16,0.97) 0%,rgba(6,2,16,0.80) 45%,rgba(6,2,16,0.32) 100%)' }}/>
          </div>
        ))}
        <div className="absolute top-1/3 right-1/3 w-[600px] h-[600px] rounded-full pointer-events-none"
          style={{ background:'radial-gradient(circle,rgba(91,45,142,0.15),transparent 70%)', filter:'blur(50px)' }}/>

        {/* Content */}
        <div className="relative z-10 w-full max-w-7xl mx-auto px-6 py-24 grid lg:grid-cols-[1fr_520px] gap-12 items-center">
          <div>
            <div className="eyebrow mb-5">
              <span className="w-5 h-0.5 rounded-full inline-block mr-2" style={{ background:'#F0A500' }}/>
              <span className="capitalize">{heroSlides[heroSlide]?.category || 'Village Community'}</span> Project
            </div>
            <h1 className="font-display font-extrabold text-white mb-6 leading-[1.08]"
              style={{ fontSize:'clamp(2.4rem,5.5vw,4rem)', textShadow:'0 4px 40px rgba(0,0,0,0.5)' }}>
              {heroSlides[heroSlide]?.title
                ? <>{heroSlides[heroSlide].title.split(' ').slice(0,3).join(' ')}<br/>
                    <span style={{ color:'#F0A500' }}>{heroSlides[heroSlide].title.split(' ').slice(3).join(' ') || 'Nkenkak-Ngiesang'}</span></>
                : <>Building a Stronger<br/><span style={{ color:'#F0A500' }}>Nkenkak-Ngiesang</span></>}
            </h1>
            <p className="text-base mb-8 max-w-lg leading-relaxed"
              style={{ color:'rgba(255,255,255,0.7)', fontFamily:'Poppins,sans-serif' }}>
              {heroSlides[heroSlide]?.summary ||
                'Your support — big or small — transforms lives and funds education, clean water, health and opportunity for everyone in our village.'}
            </p>
            <div className="flex flex-wrap gap-3 mb-10">
              <button onClick={openDonate} className="btn-gold"><i className="fas fa-heart text-xs"/>Donate Now</button>
              <Link to="/projects" className="btn-outline-white">Explore Projects</Link>
            </div>
            {/* Live quick stats */}
            <div className="flex flex-wrap gap-7">
              {[
                { icon:'fa-users',    val: stats ? `${(stats.donorCount||0).toLocaleString()}+` : '2,400+', label:'Global Donors'   },
                { icon:'fa-seedling', val: stats ? `${stats.projectCount||0}`                   : '12',     label:'Active Projects' },
                { icon:'fa-globe',    val:'14+',                                                            label:'Countries'       },
              ].map(s => (
                <div key={s.label} className="flex items-center gap-2.5">
                  <div className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0"
                    style={{ background:'rgba(240,165,0,0.12)', border:'1px solid rgba(240,165,0,0.2)' }}>
                    <i className={`fas ${s.icon} text-xs`} style={{ color:'#F0A500' }}/>
                  </div>
                  <div>
                    <div className="font-display font-bold text-white text-sm leading-none">{s.val}</div>
                    <div className="text-[10px] mt-0.5" style={{ color:'rgba(255,255,255,0.45)', fontFamily:'Poppins,sans-serif' }}>{s.label}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Right: project showcase */}
          <div className="hidden lg:flex flex-col gap-3">
            <div className="rounded-3xl overflow-hidden"
              style={{ boxShadow:'0 40px 100px rgba(0,0,0,0.6)', border:'1px solid rgba(255,255,255,0.07)' }}>
              <div className="relative h-96 overflow-hidden">
                {heroSlides.map((slide, i) => (
                  <div key={i} className="absolute inset-0 transition-opacity duration-700"
                    style={{ opacity: i === heroSlide ? 1 : 0 }}>
                    {slide.image
                      ? <img src={slide.image} alt={slide.title} className="w-full h-full object-cover"/>
                      : <div className="w-full h-full flex items-center justify-center"
                          style={{ background:`linear-gradient(135deg,${slide.grad})` }}>
                          <i className="fas fa-seedling text-7xl" style={{ color:'rgba(240,165,0,0.2)' }}/>
                        </div>}
                    <div className="absolute inset-0" style={{ background:'linear-gradient(to top,rgba(6,2,16,0.9) 0%,transparent 55%)' }}/>
                  </div>
                ))}
                <div className="absolute top-3 left-3 z-10">
                  <span className="text-[10px] font-bold uppercase tracking-wider px-3 py-1 rounded-full text-white capitalize"
                    style={{ background:'rgba(240,165,0,0.88)', backdropFilter:'blur(4px)' }}>
                    {heroSlides[heroSlide]?.category}
                  </span>
                </div>
                <div className="absolute top-3 right-3 z-10 text-[10px] font-bold px-2.5 py-1 rounded-full"
                  style={{ background:'rgba(0,0,0,0.4)', color:'rgba(255,255,255,0.7)', backdropFilter:'blur(4px)', fontFamily:'Sora,sans-serif' }}>
                  {heroSlide+1} / {heroSlides.length}
                </div>
                <button onClick={() => setHeroSlide(p => (p-1+heroSlides.length)%heroSlides.length)}
                  className="absolute left-3 top-1/2 -translate-y-1/2 z-10 w-9 h-9 rounded-full flex items-center justify-center transition-all hover:scale-110"
                  style={{ background:'rgba(255,255,255,0.1)', backdropFilter:'blur(8px)', border:'1px solid rgba(255,255,255,0.15)', color:'#fff' }}>
                  <i className="fas fa-chevron-left text-xs"/>
                </button>
                <button onClick={() => setHeroSlide(p => (p+1)%heroSlides.length)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 z-10 w-9 h-9 rounded-full flex items-center justify-center transition-all hover:scale-110"
                  style={{ background:'rgba(255,255,255,0.1)', backdropFilter:'blur(8px)', border:'1px solid rgba(255,255,255,0.15)', color:'#fff' }}>
                  <i className="fas fa-chevron-right text-xs"/>
                </button>
              </div>
              <div className="p-5" style={{ background:'rgba(10,4,24,0.98)' }}>
                {heroSlides.map((slide, i) => {
                  const pct = slide.goalAmount > 0 ? Math.min(100,Math.round((slide.raisedAmount/slide.goalAmount)*100)) : 0
                  return (
                    <div key={i} style={{ display: i===heroSlide ? 'block' : 'none' }}>
                      <h3 className="font-display font-bold text-white text-sm mb-1.5 line-clamp-1">{slide.title}</h3>
                      <p className="text-xs mb-3 line-clamp-2 leading-relaxed" style={{ color:'rgba(255,255,255,0.5)', fontFamily:'Poppins,sans-serif' }}>{slide.summary}</p>
                      {slide.goalAmount > 0 && (
                        <>
                          <div className="flex justify-between text-[10px] mb-1.5" style={{ color:'rgba(255,255,255,0.4)', fontFamily:'Poppins,sans-serif' }}>
                            <span>Raised: <strong style={{ color:'#F0A500' }}>{Number(slide.raisedAmount).toLocaleString()} XAF</strong></span>
                            <span style={{ color:'#F0A500' }}>{pct}%</span>
                          </div>
                          <div className="h-1.5 rounded-full overflow-hidden" style={{ background:'rgba(255,255,255,0.08)' }}>
                            <div className="h-full rounded-full transition-all duration-700"
                              style={{ width:`${pct}%`, background:'linear-gradient(90deg,#F0A500,#FFB84D)' }}/>
                          </div>
                        </>
                      )}
                    </div>
                  )
                })}
                <Link to="/projects" className="inline-flex items-center gap-1.5 text-xs font-semibold mt-4 hover:opacity-80 transition-opacity"
                  style={{ color:'#F0A500', fontFamily:'Sora,sans-serif' }}>
                  View All Projects <i className="fas fa-arrow-right text-[10px]"/>
                </Link>
              </div>
            </div>
            {/* Thumbnail strip */}
            <div className="flex gap-2">
              {heroSlides.map((slide, i) => (
                <button key={i} onClick={() => setHeroSlide(i)}
                  className="flex-1 h-14 rounded-2xl overflow-hidden relative transition-all duration-300"
                  style={{ border: i===heroSlide ? '2px solid #F0A500' : '2px solid rgba(255,255,255,0.06)', opacity: i===heroSlide?1:0.45, transform: i===heroSlide?'scale(1.03)':'scale(1)' }}>
                  {slide.image
                    ? <img src={slide.image} className="w-full h-full object-cover"/>
                    : <div className="w-full h-full" style={{ background:`linear-gradient(135deg,${slide.grad})` }}/>}
                  <div className="absolute inset-0 flex items-end p-1.5" style={{ background:'linear-gradient(to top,rgba(0,0,0,0.7),transparent)' }}>
                    <span className="text-[7px] font-bold text-white line-clamp-1 leading-tight">{slide.title}</span>
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Dot nav */}
        <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex gap-2 z-10">
          {heroSlides.map((_,i) => (
            <button key={i} onClick={() => setHeroSlide(i)}
              className="h-1.5 rounded-full transition-all duration-300"
              style={{ width:i===heroSlide?28:8, background:i===heroSlide?'#F0A500':'rgba(255,255,255,0.25)' }}/>
          ))}
        </div>
      </section>

      {/* ════════════════ ABOUT ════════════════ */}
      <section className="py-24 overflow-hidden" style={{ background:'#fff' }}>
        <div className="max-w-7xl mx-auto px-6 grid lg:grid-cols-2 gap-16 items-center">

          {/* ── Left: Image collage ── */}
          <div className="relative" style={{ minHeight: 480 }}>
            {/* Decorative background circle */}
            <div className="absolute -top-8 -left-8 w-72 h-72 rounded-full pointer-events-none"
              style={{ background:'radial-gradient(circle,rgba(91,45,142,0.07),transparent 70%)' }}/>

            {/* Main tall card */}
            {/* ↓ TO CHANGE ABOUT IMAGE: replace the URL below with your new Cloudinary (or any) image URL */}
            <div className="absolute left-0 top-0 w-[58%] rounded-3xl overflow-hidden"
              style={{ height: 420, boxShadow:'0 24px 64px rgba(91,45,142,0.25)' }}>
              <img
                src="https://res.cloudinary.com/dmxnsttmu/image/upload/q_auto/f_auto/v1778262556/WhatsApp_Image_2026-04-30_at_20.57.13_yl6xj3.jpg"
                alt="Nkenkak-Ngiesang community"
                className="absolute inset-0 w-full h-full object-cover object-center"
              />
              {/* Dark overlay so text stays readable */}
              <div className="absolute inset-0" style={{ background:'linear-gradient(160deg,rgba(26,10,53,0.75),rgba(91,45,142,0.55))' }}/>
              <div className="relative h-full flex flex-col justify-between p-6">
                <div className="w-12 h-12 rounded-2xl flex items-center justify-center"
                  style={{ background:'rgba(240,165,0,0.15)', border:'1px solid rgba(240,165,0,0.25)' }}>
                  <i className="fas fa-landmark text-xl" style={{ color:'#F0A500' }}/>
                </div>
                <div>
                  <div className="text-[10px] uppercase tracking-widest font-bold mb-1" style={{ color:'rgba(240,165,0,0.7)', fontFamily:'Sora,sans-serif' }}>Est. N-NDC</div>
                  <div className="font-display font-extrabold text-white leading-none" style={{ fontSize:'3.5rem' }}>2024</div>
                  <div className="text-sm mt-2" style={{ color:'rgba(255,255,255,0.55)', fontFamily:'Poppins,sans-serif' }}>Years of unity, culture & development</div>
                </div>
              </div>
            </div>

            {/* Top-right card */}
            <div className="absolute right-0 top-0 w-[38%] rounded-3xl overflow-hidden"
              style={{ height: 190, background:'linear-gradient(135deg,#F0A500,#FFB84D)', boxShadow:'0 12px 40px rgba(240,165,0,0.3)' }}>
              <div className="h-full flex flex-col items-center justify-center gap-2">
                <i className="fas fa-users text-3xl text-white opacity-90"/>
                <div className="font-display font-extrabold text-white text-2xl leading-none">
                  {stats?.memberCount || stats?.donorCount || '40'}+
                </div>
                <div className="text-xs text-white/70" style={{ fontFamily:'Poppins,sans-serif' }}>Registered Members</div>
              </div>
            </div>

            {/* Bottom-right card */}
            <div className="absolute right-0 bottom-0 w-[38%] rounded-3xl overflow-hidden"
              style={{ height: 210, background:'linear-gradient(135deg,#FBF8F2,#F3EEF9)', border:'1px solid rgba(91,45,142,0.1)', boxShadow:'0 8px 32px rgba(91,45,142,0.08)' }}>
              <div className="h-full flex flex-col items-center justify-center gap-3 p-4">
                <div className="w-12 h-12 rounded-2xl flex items-center justify-center"
                  style={{ background:'rgba(91,45,142,0.1)' }}>
                  <i className="fas fa-globe-africa text-xl" style={{ color:'#5B2D8E' }}/>
                </div>
                <div className="text-center">
                  <div className="font-display font-extrabold text-2xl" style={{ color:'#1A0A35' }}>14+</div>
                  <div className="text-xs mt-0.5" style={{ color:'#737373', fontFamily:'Poppins,sans-serif' }}>Countries Represented</div>
                </div>
              </div>
            </div>

            {/* Floating pill badge */}
            <div className="absolute left-[52%] bottom-[140px] -translate-x-1/2 bg-white rounded-full px-4 py-2.5 flex items-center gap-2.5 z-10"
              style={{ boxShadow:'0 8px 32px rgba(91,45,142,0.15)', border:'1px solid rgba(91,45,142,0.08)' }}>
              <div className="flex -space-x-1.5">
                {['#5B2D8E','#F0A500','#7B4DB8','#16a34a'].map((c, i) => (
                  <div key={i} className="w-6 h-6 rounded-full border-2 border-white flex-shrink-0" style={{ background:c }}/>
                ))}
              </div>
              <span className="text-[11px] font-bold whitespace-nowrap" style={{ color:'#1A0A35', fontFamily:'Sora,sans-serif' }}>
                {stats?.donorCount ? `${stats.donorCount.toLocaleString()}+` : '2,400+'} Donors Worldwide
              </span>
            </div>

            {/* Dot grid decoration */}
            <div className="absolute bottom-2 left-2 grid gap-1.5 pointer-events-none" style={{ gridTemplateColumns:'repeat(5,8px)' }}>
              {Array.from({length:20}).map((_,i) => (
                <div key={i} className="w-1.5 h-1.5 rounded-full" style={{ background:'rgba(91,45,142,0.15)' }}/>
              ))}
            </div>
          </div>

          {/* ── Right: Text ── */}
          <div>
            <div className="eyebrow mb-3">About N-NDC (Nkenkak-Ngiesang Development Council)</div>
            <h2 className="section-title mb-5">
              Rooted in Heritage,<br/>Building for <span>Tomorrow</span>
            </h2>
            <p className="text-sm leading-relaxed mb-7" style={{ color:'#737373', fontFamily:'Poppins,sans-serif' }}>
              Nkenkak-Ngiesang is more than a village — it is a living community bound by shared history, culture, and purpose. N-NDC, created in June 2024, is a nonprofit, non governmental and an apolitical body aimed at promoting development and cultural activities within and without Nkekak-Njiesang community.
              This initiative brought up by Chief N'fonji-Sang of Njiesang, was supported by most Elites, to this effect, an all Njiesang meeting was called and held on the 15th of June 2024 birthing this organization.
              An N-NDC executive bureau was created to conceive, initiate and follow up developmental and cultural activities within and without the village.
            </p>

            {/* Three pillars */}
            <div className="grid grid-cols-3 gap-3 mb-8">
              {[
                { icon:'fa-landmark',   color:'#5B2D8E', bg:'rgba(91,45,142,0.08)',   label:'Culture & Heritage' },
                { icon:'fa-hands',      color:'#5B2D8E', bg:'rgba(91,45,142,0.08)',    label:'Community First'    },
                { icon:'fa-chart-line', color:'#5B2D8E', bg:'rgba(91,45,142,0.08)',   label:'Real Impact'        },
              ].map(p => (
                <div key={p.label} className="rounded-2xl p-3.5 text-center" style={{ background:p.bg }}>
                  <div className="w-9 h-9 rounded-xl flex items-center justify-center mx-auto mb-2" style={{ background:`${p.color}18` }}>
                    <i className={`fas ${p.icon} text-sm`} style={{ color:p.color }}/>
                  </div>
                  <div className="text-[11px] font-bold leading-tight" style={{ color:p.color, fontFamily:'Sora,sans-serif' }}>{p.label}</div>
                </div>
              ))}
            </div>

            {/* Live stats */}
            <div className="grid grid-cols-3 gap-4 py-6 mb-7 border-y" style={{ borderColor:'rgba(91,45,142,0.08)' }}>
              <StatCounter icon="fa-users"       value={stats?.donorCount    || 2400}     label="Global Donors"   suffix="+" />
              <StatCounter icon="fa-seedling"    value={stats?.projectCount  || 12}       label="Projects Funded" />
              <StatCounter icon="fa-check-circle" value={stats?.familiesServed || 42}     label="Families Served" />
            </div>

            <div className="flex items-center gap-3 flex-wrap">
              <Link to="/culture" className="btn-secondary">Our Story</Link>
              <Link to="/projects" className="btn-outline">View Projects</Link>
              <button onClick={openDonate}
                className="flex items-center gap-2 text-sm font-semibold px-4 py-2.5 rounded-xl transition-all hover:opacity-90"
                style={{ background:'rgba(240,165,0,0.1)', color:'#C87800', border:'1px solid rgba(240,165,0,0.2)', fontFamily:'Sora,sans-serif' }}>
                <i className="fas fa-heart text-xs"/>Donate
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* ════════════════ MILESTONES TICKER ════════════════ */}
      <MilestonesTicker items={tickerItems}/>

      {/* ════════════════ PROJECTS ════════════════ */}
      <section className="py-20" style={{ background:'#fff' }}>
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-12">
            <div className="eyebrow justify-center mb-3">Our Projects</div>
            <h2 className="section-title">
              Real Impact,<br/>Real <span>Village Stories</span>
            </h2>
            <p className="text-sm mt-3 max-w-xl mx-auto" style={{ color:'#737373', fontFamily:'Poppins,sans-serif' }}>
              Every project is proposed, vetted, and funded by our community — 100% of donations go directly to the village.
            </p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
            {projects?.map(p => <ProjectCard key={p.id} project={p} onDonate={openDonate}/>)}
            {!projects && [1,2,3,4].map(i => (
              <div key={i} className="h-80 rounded-3xl animate-pulse" style={{ background:'rgba(91,45,142,0.04)' }}/>
            ))}
          </div>

          {/* CTA cards */}
          <div className="grid md:grid-cols-2 gap-6 mt-8">
            <div className="rounded-3xl p-8 relative overflow-hidden" style={{ background:'linear-gradient(135deg,#FBF8F2,#F3EEF9)', border:'1px solid rgba(91,45,142,0.08)' }}>
              <h3 className="font-display font-bold text-xl mb-3" style={{ color:'#1A0A35' }}>Give Your Time, Change a Life</h3>
              <p className="text-sm mb-5" style={{ color:'#737373', fontFamily:'Poppins,sans-serif' }}>
                Skills, expertise, and presence matter just as much as money. Join our volunteer network and help build something lasting for the next generation.
              </p>
              <div className="flex items-center gap-3">
                <button onClick={() => setJoinOpen(true)} className="btn-secondary !py-2.5 !px-5 !text-xs">Become A Volunteer</button>
                <Link to="/volunteers" className="btn-outline !py-2.5 !px-5 !text-xs">Meet Volunteers</Link>
              </div>
            </div>
            <div className="rounded-3xl p-8 relative overflow-hidden" style={{ background:'linear-gradient(135deg,#250F47,#5B2D8E)' }}>
              <div className="wave-pattern absolute inset-0"/>
              <div className="relative">
                <h3 className="font-display font-bold text-xl mb-3 text-white">Make a Donation Today</h3>
                <p className="text-sm mb-5" style={{ color:'rgba(255,255,255,0.7)', fontFamily:'Poppins,sans-serif' }}>
                  Every FCFA matters. Choose an amount and contribute to the project closest to your heart.
                </p>
                <div className="flex gap-2 mb-5 flex-wrap">
                  {['5,000','10,000','25,000','50,000'].map(a => (
                    <button key={a} onClick={openDonate}
                      className="text-xs font-semibold px-3 py-1.5 rounded-full transition-all hover:bg-amber-400 hover:text-white"
                      style={{ background:'rgba(255,255,255,0.1)', color:'rgba(255,255,255,0.8)', border:'1px solid rgba(255,255,255,0.2)' }}>
                      {a} XAF
                    </button>
                  ))}
                </div>
                <button onClick={openDonate} className="btn-gold"><i className="fas fa-heart text-xs"/>Donate Now</button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ════════════════ WHY US ════════════════ */}
      <section className="py-20" style={{ background:'linear-gradient(135deg,#FBF8F2,#F3EEF9)' }}>
        <div className="max-w-7xl mx-auto px-6 grid lg:grid-cols-2 gap-16 items-center">
          <div>
            <div className="eyebrow mb-3">Why Belong with us N-NDC </div>
            <h2 className="section-title mb-5">
               Community-Led,<br/><span>Zero Overhead</span>
            </h2>
            <p className="text-sm leading-relaxed mb-6" style={{ color:'#737373', fontFamily:'Poppins,sans-serif' }}>
              Unlike large NGOs, we are the community. Every project is proposed by a village member, approved by the council, and executed with full financial transparency — you can see exactly where your money goes.
            </p>
            <div className="grid grid-cols-2 gap-4 mb-6">
              {CAUSE_CATS.map(c => (
                <Link to={`/projects?cat=${c.label.toLowerCase()}`} key={c.label}
                  className="flex items-center gap-3 p-3 rounded-2xl transition-all hover:-translate-y-0.5"
                  style={{ background:c.bg, border:`1px solid ${c.color}18` }}>
                  <div className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background:`${c.color}18` }}>
                    <i className={`fas ${c.icon} text-sm`} style={{ color:c.color }}/>
                  </div>
                  <span className="text-xs font-semibold" style={{ color:c.color, fontFamily:'Sora,sans-serif' }}>{c.label}</span>
                </Link>
              ))}
            </div>
            <div className="flex gap-3">
              <button onClick={() => setJoinOpen(true)} className="btn-secondary">Become A Volunteer</button>
              <Link to="/culture" className="btn-outline">Our Story</Link>
            </div>
          </div>
          {/* Feature list */}
          <div className="space-y-4">
            {[
              { icon:'fa-shield-alt',   color:'#5B2D8E', title:'100% Transparent',      desc:'Full financial reports published after every project milestone. No hidden fees.' },
              { icon:'fa-users',        color:'#5B2D8E', title:'Community Governed',     desc:'Projects are voted on by village elders, youth council, and diaspora members.' },
              { icon:'fa-map-marker-alt',color:'#5B2D8E',title:'Direct Impact',          desc:'Funds go straight to contractors and suppliers in the village — zero bureaucracy.' },
              { icon:'fa-globe',        color:'#5B2D8E', title:'Diaspora Inclusive',     desc:'Whether you\'re in Yaoundé or Paris, you have an equal voice in every decision.' },
            ].map(f => (
              <div key={f.title} className="flex gap-4 p-4 rounded-2xl" style={{ background:'#fff', border:'1px solid rgba(91,45,142,0.06)', boxShadow:'0 2px 12px rgba(91,45,142,0.04)' }}>
                <div className="w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background:`${f.color}12` }}>
                  <i className={`fas ${f.icon} text-sm`} style={{ color:f.color }}/>
                </div>
                <div>
                  <h4 className="font-display font-bold text-sm mb-1" style={{ color:'#1A0A35' }}>{f.title}</h4>
                  <p className="text-xs leading-relaxed" style={{ color:'#737373', fontFamily:'Poppins,sans-serif' }}>{f.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ════════════════ EVENTS ════════════════ */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex items-end justify-between mb-12">
            <div>
              <div className="eyebrow mb-3">Upcoming Events</div>
              <h2 className="section-title">Join Us at Our Next <span>Event</span></h2>
            </div>
            <Link to="/events" className="btn-outline !py-2 !px-5 !text-xs hidden md:flex">View All Events</Link>
          </div>
          {events?.length === 0 ? (
            <div className="text-center py-16 rounded-3xl" style={{ background:'rgba(91,45,142,0.02)', border:'1px dashed rgba(91,45,142,0.1)' }}>
              <i className="fas fa-calendar-alt text-4xl mb-3 block" style={{ color:'rgba(91,45,142,0.15)' }}/>
              <h3 className="font-display font-bold text-lg mb-2" style={{ color:'#1A0A35' }}>No upcoming events right now</h3>
              <p className="text-sm mb-5" style={{ color:'#737373', fontFamily:'Poppins,sans-serif' }}>Check back soon — community gatherings are being planned.</p>
              <Link to="/events" className="btn-secondary !text-sm !py-2.5 !px-6">View Past Events</Link>
            </div>
          ) : (
            <div className="grid md:grid-cols-3 gap-6">
              {events?.map(e => {
                const d = new Date(e.startDate)
                const isPaid = e.ticketPrice && Number(e.ticketPrice) > 0
                const daysAway = differenceInDays(d, new Date())
                const countdownLabel = daysAway === 0 ? 'Today!' : daysAway === 1 ? 'Tomorrow' : daysAway > 0 ? `In ${daysAway} days` : null
                return (
                  <Link key={e.id} to={`/events/${e.slug}`} className="card overflow-hidden group block hover:-translate-y-1 transition-transform">
                    <div className="h-44 flex items-center justify-center relative overflow-hidden"
                      style={{ background:'linear-gradient(135deg,#250F47,#5B2D8E)' }}>
                      {e.coverImage
                        ? <img src={e.coverImage} alt="" className="absolute inset-0 w-full h-full object-cover"/>
                        : <><div className="wave-pattern absolute inset-0"/><i className="fas fa-calendar-alt text-4xl relative z-10" style={{ color:'rgba(240,165,0,0.4)' }}/></>}
                      <div className="absolute top-3 left-3 bg-white rounded-xl px-3 py-2 text-center shadow-card z-10">
                        <div className="font-display font-bold text-lg leading-none" style={{ color:'#1A0A35' }}>{format(d,'d')}</div>
                        <div className="text-[9px] uppercase tracking-wider font-semibold" style={{ color:'#5B2D8E', fontFamily:'Sora,sans-serif' }}>{format(d,'MMM')}</div>
                      </div>
                      <div className="absolute top-3 right-3 flex flex-col gap-1 items-end z-10">
                        {countdownLabel && (
                          <span className="text-[10px] font-bold px-2.5 py-1 rounded-full"
                            style={{ background:'rgba(255,255,255,0.15)', color:'#fff', border:'1px solid rgba(255,255,255,0.25)', backdropFilter:'blur(8px)' }}>
                            <i className="fas fa-clock text-[8px] mr-1"/>{countdownLabel}
                          </span>
                        )}
                        {e.category && <span className="text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full text-white" style={{ background:'rgba(240,165,0,0.9)' }}>{e.category}</span>}
                        {isPaid
                          ? <span className="text-[10px] font-bold px-2.5 py-1 rounded-full" style={{ background:'rgba(240,165,0,0.9)', color:'#1A0A35' }}>{Number(e.ticketPrice).toLocaleString()} XAF</span>
                          : <span className="text-[10px] font-bold px-2.5 py-1 rounded-full" style={{ background:'rgba(22,163,74,0.85)', color:'#fff' }}>Free</span>}
                      </div>
                    </div>
                    <div className="p-5">
                      <h3 className="font-display font-semibold text-base mb-2 line-clamp-2" style={{ color:'#1A0A35' }}>{e.title}</h3>
                      <div className="flex items-center gap-3 text-xs mb-3" style={{ color:'#A3A3A3', fontFamily:'Poppins,sans-serif' }}>
                        <span className="flex items-center gap-1"><i className="fas fa-clock" style={{ color:'#5B2D8E' }}/>{format(d,'h:mm a')}</span>
                        {e.venue && <span className="flex items-center gap-1 truncate"><i className="fas fa-map-marker-alt" style={{ color:'#F0A500' }}/>{e.venue}</span>}
                      </div>
                      <p className="text-xs line-clamp-2 mb-4 leading-relaxed" style={{ color:'#737373', fontFamily:'Poppins,sans-serif' }}>{e.description}</p>
                      <div className="btn-outline !py-2 !px-4 !text-xs w-full justify-center pointer-events-none">
                        {isPaid ? `Get Ticket · ${Number(e.ticketPrice).toLocaleString()} XAF` : 'Register Now — Free'}
                      </div>
                    </div>
                  </Link>
                )
              })}
              {!events && [1,2,3].map(i => (
                <div key={i} className="h-64 rounded-3xl animate-pulse" style={{ background:'rgba(91,45,142,0.04)' }}/>
              ))}
            </div>
          )}
          <div className="text-center mt-8 md:hidden">
            <Link to="/events" className="btn-outline !py-2.5 !px-6 !text-sm">View All Events</Link>
          </div>
        </div>
      </section>

      {/* ════════════════ TESTIMONIALS ════════════════ */}
      <TestimonialSlider/>

      {/* ════════════════ VOLUNTEER CTA (gold) ════════════════ */}
      <section className="py-20 relative overflow-hidden" style={{ background:'linear-gradient(135deg,#F0A500,#FFB84D)' }}>
        <div className="wave-pattern absolute inset-0"/>
        <div className="max-w-7xl mx-auto px-6 relative grid lg:grid-cols-2 gap-12 items-center">

          {/* Left: two stat cards */}
          <div className="grid grid-cols-2 gap-4">
            {[
              { icon:'fa-users',      value: stats?.teamCount  || '50+', label:'Active Volunteers', color:'#5B2D8E' },
              { icon:'fa-globe',      value:'14+',                        label:'Countries',          color:'#3D1A6B' },
              { icon:'fa-clock',      value:'500+',                       label:'Hours Contributed',  color:'#4A2478' },
              { icon:'fa-award',      value:'12',                         label:'Projects Supported', color:'#250F47' },
            ].map((s, i) => (
              <div key={i} className="rounded-2xl p-5 flex flex-col gap-3"
                style={{ background:'rgba(255,255,255,0.18)', border:'1px solid rgba(255,255,255,0.3)', backdropFilter:'blur(8px)' }}>
                <div className="w-10 h-10 rounded-xl flex items-center justify-center"
                  style={{ background:'rgba(255,255,255,0.25)' }}>
                  <i className={`fas ${s.icon} text-white`}/>
                </div>
                <div>
                  <div className="font-display font-extrabold text-white text-2xl leading-none">{s.value}</div>
                  <div className="text-xs mt-1 font-medium" style={{ color:'rgba(255,255,255,0.75)', fontFamily:'Poppins,sans-serif' }}>{s.label}</div>
                </div>
              </div>
            ))}
          </div>

          {/* Right: text */}
          <div>
            <div className="eyebrow mb-3 text-white">
              <span className="w-5 h-0.5 rounded-full bg-white inline-block mr-2"/>Your Village Needs You
            </div>
            <h2 className="font-display font-bold text-white mb-4" style={{ fontSize:'clamp(1.6rem,3vw,2.4rem)' }}>
              Your Skills Can Build<br/>a Brighter <span style={{ textDecoration:'underline', textDecorationColor:'rgba(255,255,255,0.5)' }}>Tomorrow</span>
            </h2>
            <p className="text-sm mb-6" style={{ color:'rgba(255,255,255,0.85)', fontFamily:'Poppins,sans-serif' }}>
              Architects, doctors, teachers, engineers, IT professionals — your expertise can transform our village in ways money alone cannot. Join hundreds of volunteers already making a difference.
            </p>
            <div className="flex items-center gap-4 flex-wrap">
              <button onClick={() => setJoinOpen(true)}
                className="bg-white rounded-full px-6 py-3 text-sm font-semibold flex items-center gap-2 hover:shadow-gold transition-all"
                style={{ color:'#F0A500', fontFamily:'Sora,sans-serif' }}>
                <i className="fas fa-user-plus"/>Become A Volunteer
              </button>
              <Link to="/volunteers"
                className="text-sm font-semibold flex items-center gap-1.5 text-white hover:underline transition-all"
                style={{ fontFamily:'Sora,sans-serif' }}>
                Meet volunteers <i className="fas fa-arrow-right text-xs"/>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ════════════════ GALLERY PREVIEW ════════════════ */}
      <GallerySection gallery={gallery}/>

      {/* ════════════════ NEWS ════════════════ */}
      <section className="py-20" style={{ background:'#FAFAFA' }}>
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex items-end justify-between mb-12">
            <div>
              <div className="eyebrow mb-3">Latest News & Articles</div>
              <h2 className="section-title">From <span>Our Village</span></h2>
            </div>
            <Link to="/news" className="btn-outline !py-2 !px-5 !text-xs hidden md:flex">View All Articles</Link>
          </div>
          <div className="grid md:grid-cols-3 gap-6">
            {news?.map(n => <NewsCard key={n.id} article={n}/>)}
            {!news && [1,2,3].map(i => (
              <div key={i} className="h-64 rounded-3xl animate-pulse" style={{ background:'rgba(91,45,142,0.04)' }}/>
            ))}
          </div>
          {news?.length === 0 && (
            <div className="text-center py-12 rounded-3xl" style={{ background:'rgba(91,45,142,0.02)', border:'1px dashed rgba(91,45,142,0.1)' }}>
              <i className="fas fa-newspaper text-4xl mb-3 block" style={{ color:'rgba(91,45,142,0.15)' }}/>
              <p className="text-sm" style={{ color:'#737373', fontFamily:'Poppins,sans-serif' }}>No articles published yet — check back soon.</p>
            </div>
          )}
          <div className="text-center mt-8 md:hidden">
            <Link to="/news" className="btn-outline !py-2.5 !px-6 !text-sm">View All Articles</Link>
          </div>
        </div>
      </section>

      {/* ════════════════ TEAM ════════════════ */}
      {team && team.length > 0 && (
        <section className="py-20" style={{ background:'linear-gradient(135deg,#FBF8F2,#F3EEF9)' }}>
          <div className="max-w-7xl mx-auto px-6">
            <div className="flex items-end justify-between mb-12">
              <div>
                <div className="eyebrow mb-3">Our People</div>
                <h2 className="section-title">The Team Behind <span>the Mission</span></h2>
                <p className="text-sm mt-3 max-w-lg" style={{ color:'#737373', fontFamily:'Poppins,sans-serif' }}>
                  Meet the dedicated leaders and volunteers driving development and culture in Nkenkak-Ngiesang.
                </p>
              </div>
              <Link to="/team" className="btn-outline !py-2 !px-5 !text-xs hidden md:flex">Meet Everyone</Link>
            </div>
            <div className="grid md:grid-cols-3 gap-6">
              {team.map((m, i) => <TeamCard key={m.id} member={m} index={i}/>)}
            </div>
            <div className="text-center mt-8 md:hidden">
              <Link to="/team" className="btn-outline !py-2.5 !px-6 !text-sm">Meet the Team</Link>
            </div>
          </div>
        </section>
      )}

      {/* ════════════════ DIASPORA TEASER ════════════════ */}
      <section className="py-20 relative overflow-hidden" style={{ background:'linear-gradient(135deg,#1A0A35,#250F47)' }}>
        <div className="absolute inset-0 opacity-20" style={{ backgroundImage:'radial-gradient(circle at 30% 50%, #F0A500 0%, transparent 40%), radial-gradient(circle at 70% 30%, #7B4DB8 0%, transparent 40%)' }}/>
        <div className="relative max-w-7xl mx-auto px-6 grid lg:grid-cols-2 gap-12 items-center">
          {/* Country grid */}
          <div className="relative hidden lg:block">
            <div className="grid grid-cols-2 gap-3">
              {[
                { flag:'🇨🇲', country:'Cameroon',       label:'Home Village',      accent:'#22c55e' },
                { flag:'🇫🇷', country:'France',          label:'Largest Diaspora',  accent:'#3b82f6' },
                { flag:'🇩🇪', country:'Germany',         label:'Active Community',  accent:'#F0A500' },
                { flag:'🇬🇧', country:'United Kingdom',  label:'Growing Members',   accent:'#8b5cf6' },
                { flag:'🇺🇸', country:'United States',   label:'Diaspora Members',  accent:'#ef4444' },
                { flag:'🇨🇦', country:'Canada',          label:'New Members',       accent:'#0284c7' },
              ].map((c, i) => (
                <div key={i} className="flex items-center gap-3 p-4 rounded-2xl transition-all hover:scale-[1.02]"
                  style={{ background:'rgba(255,255,255,0.05)', border:'1px solid rgba(255,255,255,0.08)' }}>
                  <span className="text-3xl flex-shrink-0">{c.flag}</span>
                  <div className="min-w-0">
                    <div className="font-display font-bold text-sm text-white leading-tight">{c.country}</div>
                    <div className="text-[10px] mt-0.5" style={{ color: c.accent, fontFamily:'Poppins,sans-serif' }}>{c.label}</div>
                  </div>
                  <div className="ml-auto w-1.5 h-8 rounded-full flex-shrink-0" style={{ background: c.accent, opacity: 0.5 }}/>
                </div>
              ))}
            </div>
            <div className="mt-3 px-4 py-3 rounded-2xl flex items-center gap-3"
              style={{ background:'rgba(240,165,0,0.08)', border:'1px solid rgba(240,165,0,0.15)' }}>
              <i className="fas fa-globe-africa text-xl" style={{ color:'#F0A500' }}/>
              <span className="text-xs font-semibold" style={{ color:'rgba(255,255,255,0.6)', fontFamily:'Poppins,sans-serif' }}>
                Members present in <strong style={{ color:'#F0A500' }}>14+ countries</strong> across the world
              </span>
            </div>
          </div>
          <div>
            <div className="eyebrow mb-3" style={{ color:'rgba(240,165,0,0.8)' }}>
              <span className="w-5 h-0.5 rounded-full inline-block mr-2" style={{ background:'#F0A500' }}/>
              Global Community
            </div>
            <h2 className="font-display font-bold text-white mb-4 leading-tight" style={{ fontSize:'clamp(1.6rem,3vw,2.4rem)' }}>
              Our People, <br/><span style={{ color:'#F0A500' }}>Across the World</span>
            </h2>
            <p className="text-sm mb-6" style={{ color:'rgba(255,255,255,0.65)', fontFamily:'Poppins,sans-serif', lineHeight:1.8 }}>
              Nkenkak-Ngiesang is home — no matter where life takes you. Our diaspora members in France, Germany, the USA, Canada, and beyond remain active contributors to village development. Explore our interactive world map to connect with community members near you.
            </p>
            <div className="flex flex-wrap gap-3 mb-7">
              {['🇨🇲 Cameroon','🇫🇷 France','🇺🇸 USA','🇩🇪 Germany','🇬🇧 UK','🇨🇦 Canada'].map(c => (
                <span key={c} className="px-3 py-1.5 rounded-full text-xs font-medium"
                  style={{ background:'rgba(255,255,255,0.08)', color:'rgba(255,255,255,0.75)', border:'1px solid rgba(255,255,255,0.1)', fontFamily:'Poppins,sans-serif' }}>
                  {c}
                </span>
              ))}
            </div>
            <Link to="/diaspora" className="btn-gold inline-flex">
              <i className="fas fa-map-marked-alt text-xs"/>Explore Diaspora Map
            </Link>
          </div>
        </div>
      </section>

      {/* ════════════════ NEWSLETTER ════════════════ */}
      <NewsletterSection/>

      {joinOpen && <JoinTeamModal onClose={() => setJoinOpen(false)}/>}
    </div>
  )
}
