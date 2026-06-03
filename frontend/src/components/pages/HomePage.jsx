import { useState, useEffect } from 'react'
import { Link, useOutletContext } from 'react-router-dom'
import { useLanguage } from '../../context/LanguageContext'
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
import { Card } from '../ui/card'
import {
  Heart, ArrowRight, Users, Globe, Sprout, GraduationCap, HeartPulse,
  Droplets, Route, Music, TrendingUp, Shield, MapPin, Mail,
  Clock, Calendar, ChevronDown, ChevronLeft, ChevronRight,
  X, Flame, Send, Expand, Pause, Play, Bell, AlertCircle, UserPlus,
  Award, Check, Newspaper, MapPinned, Home, LayoutGrid, Search,
  BookMarked, UsersRound, BarChart3, Flag, Rocket, Zap,
} from 'lucide-react'

/* ─────────────────────────────────────────
   CAUSE CATEGORIES
───────────────────────────────────────── */
const CAUSE_CATS = [
  { Icon: GraduationCap, label:'Education',     color:'#5B2D8E', bg:'rgba(91,45,142,0.08)'  },
  { Icon: HeartPulse,    label:'Health Care',   color:'#5B2D8E', bg:'rgba(91,45,142,0.08)'  },
  { Icon: Droplets,      label:'Clean Water',   color:'#5B2D8E', bg:'rgba(91,45,142,0.08)'  },
  { Icon: Route,         label:'Infrastructure',color:'#5B2D8E', bg:'rgba(91,45,142,0.08)'  },
  { Icon: Music,         label:'Culture',       color:'#5B2D8E', bg:'rgba(91,45,142,0.08)'  },
  { Icon: Sprout,        label:'Agriculture',   color:'#5B2D8E', bg:'rgba(91,45,142,0.08)'  },
]

/* ─────────────────────────────────────────
   TESTIMONIALS
───────────────────────────────────────── */
const TESTIS = [
  {
    photo: 'https://res.cloudinary.com/dmxnsttmu/image/upload/v1778928729/WhatsApp_Image_2026-04-30_at_20.57.27_dj89ir.jpg',
    text: 'Thanks to the school renovation project, my children now study in proper classrooms with real furniture and electricity. The community\'s unity has truly changed our village — I am proud to be from Nkenkak-Ngiesang.',
    name: 'Marie Nkemdirim', role: 'Parent & Village Elder', country: '🇨🇲',
    avatar: 'MN', color: '#5B2D8E', colorDark: '#3D1A6B',
  },
  {
    photo: 'https://res.cloudinary.com/dmxnsttmu/image/upload/v1778219170/zr7k9jpn3pg1hkwqshgp.jpg',
    text: 'Even from France, I feel deeply connected to home through this platform. Contributing to the health centre project was one of the most meaningful things I\'ve done for my roots — every report and photo keeps me close to the village.',
    name: 'Jean-Paul Tchamba', role: 'Diaspora Member, Paris', country: '🇫🇷',
    avatar: 'JT', color: '#eeb549', colorDark: '#C87800',
  },
  {
    photo: 'https://res.cloudinary.com/dmxnsttmu/image/upload/v1778262556/WhatsApp_Image_2026-04-30_at_20.57.13_yl6xj3.jpg',
    text: 'As clan head of the Upper Nkongho Mbo people in Buea, I joined the volunteer team and helped design the water distribution system. Seeing it in operation — knowing 42 families now have clean water because of our collective work — is absolutely priceless.',
    name: 'Chief Professor Nfossung-Nkem', role: 'Clan Head Buea & Adviser', country: '🇨🇲',
    avatar: 'EF', color: '#5B2D8E', colorDark: '#3D1A6B',
  },
  {
    photo: 'https://res.cloudinary.com/dmxnsttmu/image/upload/q_auto/f_auto/v1778928806/WhatsApp_Image_2026-04-30_at_20.57.16_aynfja.jpg',
    text: 'I have donated to several organisations over the years, but none gave me the transparency and community feel of Nkenkak-Ngiesang. Every update and milestone report shows exactly where my contribution goes. This is how development should work.',
    name: 'Amina Koueye', role: 'Monthly Donor, Berlin', country: '🇩🇪',
    avatar: 'AK', color: '#eeb549', colorDark: '#C87800',
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
function StatCounter({ Icon, value, label, prefix='', suffix='' }) {
  const { ref, inView } = useInView({ triggerOnce: true, threshold: 0.5 })
  return (
    <div ref={ref} className="flex items-center gap-4">
      <div className="w-14 h-14 rounded-2xl flex items-center justify-center flex-shrink-0"
        style={{ background:'rgba(240,165,0,0.15)' }}>
        <Icon className="w-5 h-5 text-gold"/>
      </div>
      <div>
        <div className="font-display font-bold text-2xl text-dark">
          {inView
            ? <>{prefix}<CountUp end={value} duration={2.5} separator=","/>{suffix}</>
            : `${prefix}0${suffix}`}
        </div>
        <div className="text-xs text-muted-foreground">{label}</div>
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
            style={{ color:'rgba(91,45,142,0.55)' }}>
            <span className="w-1 h-1 rounded-full bg-gold inline-block"/>
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
      className="flex fixed bottom-24 right-6 z-40 items-center gap-2 px-5 py-3 rounded-full font-bold text-sm shadow-2xl transition-all duration-300"
      style={{
        background:'linear-gradient(135deg,#eeb549,#FFB84D)',
        color:'#fff',
        boxShadow:'0 8px 32px rgba(240,165,0,0.45)',
        opacity: visible ? 1 : 0,
        transform: visible ? 'translateY(0) scale(1)' : 'translateY(20px) scale(0.9)',
        pointerEvents: visible ? 'auto' : 'none',
      }}>
      <Heart className="w-3 h-3 animate-pulse"/>Donate
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
          style={{ background:'linear-gradient(135deg,#eeb549,#FFB84D)' }}>
          <Mail className="w-7 h-7 text-white"/>
        </div>
        <div className="text-xs uppercase tracking-widest font-bold mb-3" style={{ color:'rgba(240,165,0,0.7)' }}>
          Stay Connected
        </div>
        <h2 className="font-display font-bold text-3xl text-white mb-3 leading-tight">
          Never Miss a Village <span style={{ color:'#eeb549' }}>Update</span>
        </h2>
        <p className="text-sm mb-8 text-white/60">
          Get project milestones, event invitations, and community news delivered straight to your inbox — whether you're in the village or across the world.
        </p>
        {done ? (
          <div className="flex items-center justify-center gap-3 py-4">
            <div className="w-10 h-10 rounded-full flex items-center justify-center" style={{ background:'rgba(240,165,0,0.2)' }}>
              <Check className="w-5 h-5 text-gold"/>
            </div>
            <p className="text-white font-semibold">You're subscribed! Welcome to the family.</p>
          </div>
        ) : (
          <form onSubmit={submit} className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto">
            <input value={email} onChange={e => setEmail(e.target.value)} type="email" required
              placeholder="Enter your email address"
              className="flex-1 px-5 py-3.5 rounded-2xl text-sm outline-none"
              style={{ background:'rgba(255,255,255,0.08)', color:'#fff', border:'1px solid rgba(255,255,255,0.15)' }}/>
            <button type="submit" className="btn-gold !py-3.5 !px-6 whitespace-nowrap">
              <Send className="w-3 h-3"/>Subscribe
            </button>
          </form>
        )}
        <p className="text-[10px] mt-4 text-white/30">
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

  const AREAS = ['a','b','c','d','e','f']

  return (
    <section className="py-20 relative overflow-hidden"
      style={{ background:'linear-gradient(160deg,#060110 0%,#0E0520 50%,#1A0A35 100%)' }}>
      <div className="absolute top-0 left-1/4 w-[500px] h-[500px] rounded-full pointer-events-none"
        style={{ background:'radial-gradient(circle,rgba(91,45,142,0.14),transparent 70%)', filter:'blur(80px)' }}/>

      <div className="relative max-w-7xl mx-auto px-6">
        <div className="flex flex-col lg:flex-row gap-10 items-start">

          {/* Left: text panel */}
          <div className="lg:w-64 flex-shrink-0 flex flex-col justify-between" style={{ minHeight:320 }}>
            <div>
              <div className="flex items-center gap-2 mb-5">
                <span className="w-5 h-0.5 rounded-full bg-gold"/>
                <span className="text-[11px] uppercase tracking-[0.18em] font-bold text-gold/75">Gallery</span>
              </div>
              <h2 className="font-display font-bold text-white leading-[1.12] mb-5"
                style={{ fontSize:'clamp(1.9rem,3vw,2.6rem)' }}>
                Life in<br/>
                <span style={{ color:'#eeb549' }}>Nkenkak-<br/>Ngiesang</span><br/>
                in pictures
              </h2>
              <div className="text-sm font-semibold mb-6 text-white/28" style={{ letterSpacing:'0.05em' }}>
                2024 / 2025
              </div>
              <p className="text-xs leading-relaxed mb-8 text-white/40">
                {total} moments captured from our village, events, and community projects.
              </p>
            </div>
            <Link to="/gallery"
              className="inline-flex items-center gap-2 text-sm font-bold px-6 py-3 rounded-full self-start transition-all hover:opacity-90 hover:-translate-y-0.5"
              style={{ background:'linear-gradient(135deg,#eeb549,#FFB84D)', color:'#fff',
                       boxShadow:'0 6px 24px rgba(240,165,0,0.35)' }}>
              View All <ArrowRight className="w-4 h-4"/>
            </Link>
          </div>

          {/* Right: photo grid */}
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
                  {!isLast && (
                    <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300"
                      style={{ background:'rgba(6,2,16,0.38)' }}>
                      <div className="w-11 h-11 rounded-full flex items-center justify-center"
                        style={{ background:'rgba(255,255,255,0.14)', backdropFilter:'blur(8px)', border:'1px solid rgba(255,255,255,0.22)' }}>
                        <Expand className="w-5 h-5 text-white"/>
                      </div>
                    </div>
                  )}
                  {isLast && (
                    <div className="absolute inset-0 flex flex-col items-center justify-center"
                      style={{ background:'rgba(6,2,16,0.72)', backdropFilter:'blur(3px)' }}>
                      <div className="font-display font-extrabold text-white leading-none" style={{ fontSize:'2.2rem' }}>
                        +{total - 6}
                      </div>
                      <div className="text-xs mt-1.5 font-medium text-white/55">more photos</div>
                    </div>
                  )}
                  {item.title && !isLast && (
                    <div className="absolute bottom-0 left-0 right-0 px-3 py-2.5 translate-y-full group-hover:translate-y-0 transition-transform duration-300"
                      style={{ background:'linear-gradient(to top,rgba(6,2,16,0.9),transparent)' }}>
                      <p className="text-white text-[11px] font-semibold truncate">{item.title}</p>
                    </div>
                  )}
                </button>
              )
            })}
          </div>
        </div>
      </div>

      {/* Lightbox */}
      {lightboxIdx !== null && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center"
          style={{ background:'rgba(0,0,0,0.93)', backdropFilter:'blur(14px)' }}
          onClick={close}
          onTouchStart={onTouchStart}
          onTouchEnd={onTouchEnd}>

          <button onClick={close}
            className="absolute top-5 right-5 z-10 w-11 h-11 rounded-full flex items-center justify-center transition-all hover:scale-110 hover:bg-white/10 text-white"
            style={{ background:'rgba(255,255,255,0.08)', border:'1px solid rgba(255,255,255,0.14)' }}>
            <X className="w-5 h-5"/>
          </button>

          <div className="absolute top-5 left-1/2 -translate-x-1/2 z-10 text-xs font-bold px-4 py-1.5 rounded-full text-white/65"
            style={{ background:'rgba(255,255,255,0.07)', border:'1px solid rgba(255,255,255,0.1)' }}>
            {lightboxIdx + 1} / {items.length}
          </div>

          <button onClick={e => { e.stopPropagation(); prev() }}
            className="absolute left-4 top-1/2 -translate-y-1/2 z-10 w-12 h-12 rounded-full flex items-center justify-center transition-all hover:scale-110 hover:bg-white/10 text-white"
            style={{ background:'rgba(255,255,255,0.07)', border:'1px solid rgba(255,255,255,0.12)' }}>
            <ChevronLeft className="w-6 h-6"/>
          </button>

          <div className="relative mx-16 flex flex-col items-center max-w-5xl w-full"
            onClick={e => e.stopPropagation()}>
            <img key={lightboxIdx}
              src={items[lightboxIdx].url || items[lightboxIdx].thumbnail}
              alt={items[lightboxIdx].title || ''}
              className="max-h-[80vh] w-auto max-w-full object-contain rounded-2xl"
              style={{ animation:'fadeSlideUp 0.25s ease forwards', boxShadow:'0 40px 100px rgba(0,0,0,0.7)' }}/>
            {items[lightboxIdx].title && (
              <p className="mt-4 text-center text-sm text-white/50">{items[lightboxIdx].title}</p>
            )}
          </div>

          <button onClick={e => { e.stopPropagation(); next() }}
            className="absolute right-4 top-1/2 -translate-y-1/2 z-10 w-12 h-12 rounded-full flex items-center justify-center transition-all hover:scale-110 hover:bg-white/10 text-white"
            style={{ background:'rgba(255,255,255,0.07)', border:'1px solid rgba(255,255,255,0.12)' }}>
            <ChevronRight className="w-6 h-6"/>
          </button>

          <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex gap-2">
            {items.map((_, i) => (
              <button key={i}
                onClick={e => { e.stopPropagation(); setLightboxIdx(i) }}
                className="rounded-full transition-all duration-300"
                style={{ width: i === lightboxIdx ? 24 : 7, height:7,
                         background: i === lightboxIdx ? '#eeb549' : 'rgba(255,255,255,0.28)' }}/>
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

  return (
    <section className="py-20" style={{ background:'linear-gradient(135deg,#FBF8F2,#F3EEF9)' }}>
      <div className="max-w-5xl mx-auto px-6">

        <div className="text-center mb-10">
          <div className="eyebrow justify-center mb-2">Community Voices</div>
          <h2 className="section-title">What Our <span>Leaders Say</span></h2>
          <p className="text-sm mt-3 max-w-lg mx-auto text-muted-foreground">
            Real stories from village residents, diaspora members and volunteers who are part of our journey.
          </p>
        </div>

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
            <div className="w-10 h-[3px] rounded-full mb-6" style={{ background:t.color }}/>
            <p className="text-base leading-[1.9] mb-8 flex-1" style={{ color:'#3a3a3a' }}>
              {t.text}
            </p>
            <div className="flex items-center gap-3">
              <div className="w-1 h-8 rounded-full" style={{ background:t.color }}/>
              <div>
                <div className="font-display font-bold text-base leading-tight text-dark">
                  {t.name} <span className="text-sm font-normal ml-1">{t.country}</span>
                </div>
                <div className="text-sm mt-0.5 text-muted-foreground">{t.role}</div>
              </div>
            </div>
          </div>

          {/* Right: portrait */}
          <div className="sm:w-56 flex-shrink-0 relative overflow-hidden"
            style={{ background:`linear-gradient(160deg,${t.color}10,${t.color}25)`, minHeight: 240 }}>
            {t.photo ? (
              <img src={t.photo} alt={t.name}
                className="absolute inset-0 w-full h-full object-cover object-top"/>
            ) : (
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
            {t.photo && (
              <div className="absolute top-3 right-3 w-8 h-8 rounded-full flex items-center justify-center bg-white z-10"
                style={{ fontSize:'1rem', boxShadow:'0 2px 12px rgba(0,0,0,0.2)' }}>
                {t.country}
              </div>
            )}
          </div>
        </div>

        {/* Controls */}
        <div className="flex items-center justify-center gap-6 mb-4">
          <button onClick={() => goTo(idx - 1)}
            className="w-9 h-9 rounded-full flex items-center justify-center transition-all duration-200 hover:scale-110 active:scale-95 text-muted-foreground">
            <ChevronLeft className="w-5 h-5"/>
          </button>

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
              {playing
                ? <Pause className="w-3 h-3"/>
                : <Play className="w-3 h-3" style={{ marginLeft:2 }}/>}
            </button>
          </div>

          <button onClick={() => goTo(idx + 1)}
            className="w-9 h-9 rounded-full flex items-center justify-center transition-all duration-200 hover:scale-110 active:scale-95 text-muted-foreground">
            <ChevronRight className="w-5 h-5"/>
          </button>
        </div>

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
  const NOTICE_META = {
    urgent: { bg:'#dc2626', Icon: AlertCircle },
    high:   { bg:'#C87800', Icon: Bell },
  }
  const c = NOTICE_META[notice.priority] || NOTICE_META.high
  const BannerIcon = c.Icon
  return (
    <div className="relative z-50 flex items-center gap-3 px-4 py-2.5 text-white text-sm"
      style={{ background: c.bg }}>
      <BannerIcon className="w-4 h-4 flex-shrink-0"/>
      <span className="flex-1 font-medium line-clamp-1">{notice.title} — {notice.content}</span>
      <Link to="/notices" className="flex-shrink-0 underline text-xs opacity-80 hover:opacity-100">View all</Link>
      <button onClick={dismiss} className="flex-shrink-0 w-6 h-6 flex items-center justify-center rounded-full hover:bg-white/20 transition-colors">
        <X className="w-3 h-3"/>
      </button>
    </div>
  )
}

export default function HomePage() {
  const { openDonate } = useOutletContext()
  const { t } = useLanguage()
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

  const heroSlides = projects?.length
    ? projects.slice(0, 4).map(p => ({
        image: p.coverImage || '', title: p.title, summary: p.summary || '',
        category: p.category, goalAmount: Number(p.goalAmount) || 0,
        raisedAmount: Number(p.raisedAmount) || 0, slug: p.slug, grad: '#250F47,#5B2D8E',
      }))
    : FALLBACK_SLIDES

  useEffect(() => {
    const t = setInterval(() => setHeroSlide(s => (s + 1) % heroSlides.length), 6000)
    return () => clearInterval(t)
  }, [heroSlides.length])

  const tickerItems = stats?.milestones?.length
    ? stats.milestones
    : ['Primary School Renovation — 85% funded', 'Health Centre — Under construction', 'Clean Water Initiative — 42 families served', 'Cultural Centre — Planning phase']

  return (
    <div>

      {/* ════════════════ ANNOUNCEMENT BANNER ════════════════ */}
      <AnnouncementBanner />

      {/* ════════════════ HERO ════════════════ */}
      <section className="relative min-h-[92vh] flex items-center overflow-hidden">
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
              <span className="w-5 h-0.5 rounded-full inline-block mr-2" style={{ background:'#eeb549' }}/>
              <span className="capitalize">{heroSlides[heroSlide]?.category || 'Village Community'}</span> Project
            </div>
            <h1 className="font-display font-extrabold text-white mb-6 leading-[1.08]"
              style={{ fontSize:'clamp(2.4rem,5.5vw,4rem)', textShadow:'0 4px 40px rgba(0,0,0,0.5)' }}>
              {heroSlides[heroSlide]?.title
                ? <>{heroSlides[heroSlide].title.split(' ').slice(0,3).join(' ')}<br/>
                    <span style={{ color:'#eeb549' }}>{heroSlides[heroSlide].title.split(' ').slice(3).join(' ') || 'Nkenkak-Ngiesang'}</span></>
                : <>Building a Stronger<br/><span style={{ color:'#eeb549' }}>Nkenkak-Ngiesang</span></>}
            </h1>
            <p className="text-base mb-8 max-w-lg leading-relaxed text-white/70">
              {heroSlides[heroSlide]?.summary ||
                'Your support — big or small — transforms lives and funds education, clean water, health and opportunity for everyone in our village.'}
            </p>
            <div className="flex flex-wrap gap-3 mb-10">
              <button onClick={openDonate} className="btn-gold">
                <Heart className="w-3 h-3"/>{t('donateNow')}
              </button>
              <Link to="/projects" className="btn-outline-white">{t('viewAllProjects')}</Link>
            </div>
            {/* Live quick stats */}
            <div className="flex flex-wrap gap-7">
              {[
                { Icon: Users,  val: stats ? `${(stats.donorCount||0).toLocaleString()}+` : '2,400+', label: t('globalDonors')   },
                { Icon: Sprout, val: stats ? `${stats.projectCount||0}`                   : '12',     label: t('activeProjects') },
                { Icon: Globe,  val: '14+',                                                           label: t('countries')      },
              ].map(s => (
                <div key={s.label} className="flex items-center gap-2.5">
                  <div className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0"
                    style={{ background:'rgba(240,165,0,0.12)', border:'1px solid rgba(240,165,0,0.2)' }}>
                    <s.Icon className="w-4 h-4 text-gold"/>
                  </div>
                  <div>
                    <div className="font-display font-bold text-white text-sm leading-none">{s.val}</div>
                    <div className="text-[10px] mt-0.5 text-white/45">{s.label}</div>
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
                          <Sprout className="w-16 h-16" style={{ color:'rgba(240,165,0,0.2)' }}/>
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
                <div className="absolute top-3 right-3 z-10 text-[10px] font-bold px-2.5 py-1 rounded-full text-white/70"
                  style={{ background:'rgba(0,0,0,0.4)', backdropFilter:'blur(4px)' }}>
                  {heroSlide+1} / {heroSlides.length}
                </div>
                <button onClick={() => setHeroSlide(p => (p-1+heroSlides.length)%heroSlides.length)}
                  className="absolute left-3 top-1/2 -translate-y-1/2 z-10 w-9 h-9 rounded-full flex items-center justify-center transition-all hover:scale-110 text-white"
                  style={{ background:'rgba(255,255,255,0.1)', backdropFilter:'blur(8px)', border:'1px solid rgba(255,255,255,0.15)' }}>
                  <ChevronLeft className="w-4 h-4"/>
                </button>
                <button onClick={() => setHeroSlide(p => (p+1)%heroSlides.length)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 z-10 w-9 h-9 rounded-full flex items-center justify-center transition-all hover:scale-110 text-white"
                  style={{ background:'rgba(255,255,255,0.1)', backdropFilter:'blur(8px)', border:'1px solid rgba(255,255,255,0.15)' }}>
                  <ChevronRight className="w-4 h-4"/>
                </button>
              </div>
              <div className="p-5" style={{ background:'rgba(10,4,24,0.98)' }}>
                {heroSlides.map((slide, i) => {
                  const pct = slide.goalAmount > 0 ? Math.min(100,Math.round((slide.raisedAmount/slide.goalAmount)*100)) : 0
                  return (
                    <div key={i} style={{ display: i===heroSlide ? 'block' : 'none' }}>
                      <h3 className="font-display font-bold text-white text-sm mb-1.5 line-clamp-1">{slide.title}</h3>
                      <p className="text-xs mb-3 line-clamp-2 leading-relaxed text-white/50">{slide.summary}</p>
                      {slide.goalAmount > 0 && (
                        <>
                          <div className="flex justify-between text-[10px] mb-1.5 text-white/40">
                            <span>Raised: <strong className="text-gold">{Number(slide.raisedAmount).toLocaleString()} XAF</strong></span>
                            <span className="text-gold">{pct}%</span>
                          </div>
                          <div className="h-1.5 rounded-full overflow-hidden" style={{ background:'rgba(255,255,255,0.08)' }}>
                            <div className="h-full rounded-full transition-all duration-700"
                              style={{ width:`${pct}%`, background:'linear-gradient(90deg,#eeb549,#FFB84D)' }}/>
                          </div>
                        </>
                      )}
                    </div>
                  )
                })}
                <Link to="/projects" className="inline-flex items-center gap-1.5 text-xs font-semibold mt-4 hover:opacity-80 transition-opacity text-gold">
                  View All Projects <ArrowRight className="w-3 h-3"/>
                </Link>
              </div>
            </div>
            {/* Thumbnail strip */}
            <div className="flex gap-2">
              {heroSlides.map((slide, i) => (
                <button key={i} onClick={() => setHeroSlide(i)}
                  className="flex-1 h-14 rounded-2xl overflow-hidden relative transition-all duration-300"
                  style={{ border: i===heroSlide ? '2px solid #eeb549' : '2px solid rgba(255,255,255,0.06)', opacity: i===heroSlide?1:0.45, transform: i===heroSlide?'scale(1.03)':'scale(1)' }}>
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

        {/* Scroll chevron */}
        <div className="absolute bottom-16 left-1/2 -translate-x-1/2 z-10 pointer-events-none">
          <ChevronDown className="w-6 h-6 text-white/30 animate-bounce"/>
        </div>

        {/* Dot nav */}
        <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex gap-2 z-10">
          {heroSlides.map((_,i) => (
            <button key={i} onClick={() => setHeroSlide(i)}
              className="h-1.5 rounded-full transition-all duration-300"
              style={{ width:i===heroSlide?28:8, background:i===heroSlide?'#eeb549':'rgba(255,255,255,0.25)' }}/>
          ))}
        </div>
      </section>

      {/* ════════════════ ABOUT ════════════════ */}
      <section className="py-24 overflow-hidden" style={{ background: '#FBF8F2' }}>
        <div className="max-w-7xl mx-auto px-6 grid lg:grid-cols-2 gap-16 items-start">

          {/* Left: Mission panel — full-bleed photo + stats pinned to bottom */}
          <div className="relative rounded-3xl overflow-hidden lg:sticky lg:top-24"
            style={{ minHeight: 540, boxShadow: '0 28px 72px rgba(91,45,142,0.2)' }}>

            {/* Full-bleed photo */}
            <img
              src="https://res.cloudinary.com/dmxnsttmu/image/upload/q_auto/f_auto/v1778262556/WhatsApp_Image_2026-04-30_at_20.57.13_yl6xj3.jpg"
              alt="Nkenkak-Ngiesang community gathering"
              className="absolute inset-0 w-full h-full object-cover object-center"
            />
            {/* Gradient — lighter at top, heavier at bottom so photo reads */}
            <div className="absolute inset-0"
              style={{ background: 'linear-gradient(180deg,rgba(20,8,45,0.28) 0%,rgba(20,8,45,0.45) 45%,rgba(20,8,45,0.93) 100%)' }}
            />


            {/* Bottom: founding quote + stat grid */}
            <div className="absolute inset-x-0 bottom-0 p-6">
              <blockquote className="mb-5">
                <div className="w-6 h-0.5 rounded-full bg-gold mb-3" />
                <p className="text-sm leading-[1.8] text-white/85 italic" style={{ fontFamily: 'Poppins,sans-serif' }}>
                  "We do not build for ourselves alone — we build for the children who will inherit this village."
                </p>
                <footer className="text-[11px] mt-2 font-semibold" style={{ color: 'rgba(240,165,0,0.7)' }}>
                  — N-NDC Founding Charter, June 2024
                </footer>
              </blockquote>

              {/* 4-stat grid */}
              <div className="grid grid-cols-4 gap-2">
                {[
                  { n: '2024',                                   l: 'Founded'  },
                  { n: `${stats?.memberCount || '40'}+`,         l: 'Members'  },
                  { n: '14+',                                    l: 'Countries'},
                  { n: `${stats?.projectCount || '12'}+`,        l: 'Projects' },
                ].map(({ n, l }) => (
                  <div key={l} className="flex flex-col items-center py-2.5 px-1 rounded-2xl backdrop-blur-sm"
                    style={{ background: 'rgba(255,255,255,0.1)', border: '1px solid rgba(255,255,255,0.14)' }}>
                    <div className="font-display font-bold text-white text-sm leading-none">{n}</div>
                    <div className="text-[9px] text-white/50 mt-0.5 uppercase tracking-wide">{l}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Right: Content */}
          <div className="py-2">
            <div className="eyebrow mb-3">{t('aboutNNDC')}</div>
            <h2 className="section-title mb-5">
              {t('rootedInHeritage').split(',')[0]},<br/>{t('rootedInHeritage').split(',')[1]}
            </h2>

            <p className="text-sm leading-relaxed mb-8 text-muted-foreground">
              Nkenkak-Ngiesang is more than a village — it is a living community bound by shared history, culture, and purpose. N-NDC is a nonprofit, apolitical body driving development from within, with full accountability to every member.
            </p>

            {/* Timeline — improved visual weight */}
            <div className="mb-8 relative">
              {/* Vertical connector */}
              <div className="absolute left-[17px] top-9 bottom-4 w-0.5 rounded-full"
                style={{ background: 'linear-gradient(to bottom,#5B2D8E 0%,rgba(91,45,142,0.08) 100%)' }} />

              {[
                { Icon: Flag,   date: 'June 2024', title: t('orgFounded'),    desc: "Chief N'fonji-Sang called an all-village meeting; N-NDC established as a nonprofit, apolitical development body.", active: false },
                { Icon: Rocket, date: 'Aug 2024',  title: t('firstProjects'), desc: 'Executive bureau formed; school renovation and clean water initiative approved and funded by community.', active: false },
                { Icon: Zap,    date: 'Now →',     title: t('growingImpact'), desc: '12+ projects, 42+ families served, members actively contributing from 14+ countries worldwide.', active: true },
              ].map(({ Icon: TIcon, date, title, desc, active }, i, arr) => (
                <div key={title} className="flex gap-4 relative"
                  style={{ paddingBottom: i < arr.length - 1 ? 28 : 0 }}>
                  <div
                    className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 relative z-10 transition-all"
                    style={{
                      background: active ? 'linear-gradient(135deg,#5B2D8E,#7B4DB8)' : '#fff',
                      boxShadow: active ? '0 4px 16px rgba(91,45,142,0.35)' : '0 2px 8px rgba(91,45,142,0.1)',
                      border: active ? 'none' : '1.5px solid rgba(91,45,142,0.15)',
                    }}>
                    <TIcon className="w-4 h-4" style={{ color: active ? '#fff' : '#5B2D8E' }} />
                  </div>
                  <div className="pt-1">
                    <div className="text-[10px] font-bold uppercase tracking-widest text-gold mb-0.5">{date}</div>
                    <div className="font-display font-bold text-sm text-dark mb-1">{title}</div>
                    <p className="text-xs text-muted-foreground leading-relaxed">{desc}</p>
                  </div>
                </div>
              ))}
            </div>

            {/* 3 distinct value cards */}
            <div className="grid grid-cols-3 gap-3 mb-7">
              {[
                {
                  Icon: BookMarked,
                  label: t('cultureLabel'),
                  fact: '200+ years of heritage celebrated & preserved',
                  accent: '#C87800',
                  bg: 'rgba(240,165,0,0.06)',
                  border: 'rgba(240,165,0,0.2)',
                },
                {
                  Icon: UsersRound,
                  label: t('communityLabel'),
                  fact: 'Every project is voted on by members — no exceptions',
                  accent: '#5B2D8E',
                  bg: 'rgba(91,45,142,0.06)',
                  border: 'rgba(91,45,142,0.15)',
                },
                {
                  Icon: BarChart3,
                  label: t('impactLabel'),
                  fact: `${stats?.familiesServed || 42}+ families with clean water since 2024`,
                  accent: '#15803D',
                  bg: 'rgba(21,128,61,0.06)',
                  border: 'rgba(21,128,61,0.2)',
                },
              ].map(({ Icon: PIcon, label, fact, accent, bg, border }) => (
                <div key={label} className="rounded-2xl p-4 flex flex-col gap-3"
                  style={{ background: bg, border: `1px solid ${border}` }}>
                  <div className="w-8 h-8 rounded-xl flex items-center justify-center"
                    style={{ background: `${accent}20` }}>
                    <PIcon className="w-4 h-4" style={{ color: accent }} />
                  </div>
                  <div>
                    <div className="text-[9px] font-bold uppercase tracking-widest mb-1"
                      style={{ color: accent }}>{label}</div>
                    <div className="text-[11px] leading-snug font-semibold text-dark">{fact}</div>
                  </div>
                </div>
              ))}
            </div>

            {/* Transparency trust bar — replaces duplicate stat counters */}
            <div className="flex items-center gap-3 px-4 py-3.5 rounded-2xl mb-7"
              style={{ background: 'rgba(91,45,142,0.05)', border: '1px solid rgba(91,45,142,0.1)' }}>
              <div className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0"
                style={{ background: 'rgba(91,45,142,0.1)' }}>
                <Shield className="w-4 h-4 text-primary-500" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-xs font-bold text-dark leading-snug">{t('transparencyMsg')}</div>
                <div className="text-[11px] text-muted-foreground mt-0.5">
                  {t('transparencyDesc')}
                </div>
              </div>
              <Link to="/transparency"
                className="text-[11px] font-bold flex items-center gap-1 flex-shrink-0 whitespace-nowrap transition-all hover:gap-2 duration-200"
                style={{ color: '#5B2D8E' }}>
                {t('viewReports')} <ArrowRight className="w-3 h-3" />
              </Link>
            </div>

            <div className="flex items-center gap-3 flex-wrap">
              <Link to="/culture" className="btn-secondary">{t('ourStory')}</Link>
            </div>
          </div>
        </div>
      </section>

      {/* ════════════════ MILESTONES TICKER ════════════════ */}
      <MilestonesTicker items={tickerItems}/>

      {/* ════════════════ PROJECTS ════════════════ */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-12">
            <div className="eyebrow justify-center mb-3">{t('featuredProjects')}</div>
            <h2 className="section-title">
              {t('realImpact').split(',')[0]},<br/>{t('realImpact').split(',')[1]}
            </h2>
            <p className="text-sm mt-3 max-w-xl mx-auto text-muted-foreground">
              {t('realImpactDesc')}
            </p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
            {projects?.map(p => <ProjectCard key={p.id} project={p} onDonate={openDonate}/>)}
            {!projects && [1,2,3,4].map(i => (
              <div key={i} className="h-80 rounded-3xl animate-pulse" style={{ background:'rgba(91,45,142,0.04)' }}/>
            ))}
          </div>

          <div className="grid md:grid-cols-2 gap-6 mt-8">
            <div className="rounded-3xl p-8 relative overflow-hidden" style={{ background:'linear-gradient(135deg,#FBF8F2,#F3EEF9)', border:'1px solid rgba(91,45,142,0.08)' }}>
              <h3 className="font-display font-bold text-xl mb-3 text-dark">{t('giveYourTime')}</h3>
              <p className="text-sm mb-5 text-muted-foreground">
                {t('giveYourTimeDesc')}
              </p>
              <div className="flex items-center gap-3">
                <button onClick={() => setJoinOpen(true)} className="btn-secondary !py-2.5 !px-5 !text-xs">{t('becomeVolunteer')}</button>
                <Link to="/volunteers" className="btn-outline !py-2.5 !px-5 !text-xs">{t('meetVolunteers')}</Link>
              </div>
            </div>
            <div className="rounded-3xl p-8 relative overflow-hidden" style={{ background:'linear-gradient(135deg,#250F47,#5B2D8E)' }}>
              <div className="wave-pattern absolute inset-0"/>
              <div className="relative">
                <h3 className="font-display font-bold text-xl mb-3 text-white">{t('makeADonation')}</h3>
                <p className="text-sm mb-5 text-white/70">
                  {t('everyFCFA')}
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
                <button onClick={openDonate} className="btn-gold">
                  <Heart className="w-3 h-3"/>Donate Now
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ════════════════ WHY US ════════════════ */}
      <section className="py-20" style={{ background:'linear-gradient(135deg,#FBF8F2,#F3EEF9)' }}>
        <div className="max-w-7xl mx-auto px-6 grid lg:grid-cols-2 gap-16 items-center">
          <div>
            <div className="grid grid-cols-2 gap-4 mb-6">
              {CAUSE_CATS.map(c => (
                <Link to={`/projects?cat=${c.label.toLowerCase()}`} key={c.label}
                  className="flex items-center gap-3 p-3 rounded-2xl transition-all hover:-translate-y-0.5"
                  style={{ background:c.bg, border:`1px solid ${c.color}18` }}>
                  <div className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background:`${c.color}18` }}>
                    <c.Icon className="w-4 h-4" style={{ color:c.color }}/>
                  </div>
                  <span className="text-xs font-semibold" style={{ color:c.color }}>{c.label}</span>
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
              { Icon: Shield,  title:'100% Transparent',  desc:'Full financial reports published after every project milestone. No hidden fees.' },
              { Icon: Users,   title:'Community Governed', desc:'Projects are voted on by village elders, youth council, and diaspora members.' },
              { Icon: MapPin,  title:'Direct Impact',      desc:'Funds go straight to contractors and suppliers in the village — zero bureaucracy.' },
              { Icon: Globe,   title:'Diaspora Inclusive', desc:'Whether you\'re in Yaoundé or Paris, you have an equal voice in every decision.' },
            ].map(f => (
              <div key={f.title} className="flex gap-4 p-4 rounded-2xl bg-white"
                style={{ border:'1px solid rgba(91,45,142,0.06)', boxShadow:'0 2px 12px rgba(91,45,142,0.04)' }}>
                <div className="w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0"
                  style={{ background:'rgba(91,45,142,0.08)' }}>
                  <f.Icon className="w-5 h-5 text-primary-500"/>
                </div>
                <div>
                  <h4 className="font-display font-bold text-sm mb-1 text-dark">{f.title}</h4>
                  <p className="text-xs leading-relaxed text-muted-foreground">{f.desc}</p>
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
              <Calendar className="w-10 h-10 mx-auto mb-3" style={{ color:'rgba(91,45,142,0.15)' }}/>
              <h3 className="font-display font-bold text-lg mb-2 text-dark">No upcoming events right now</h3>
              <p className="text-sm mb-5 text-muted-foreground">Check back soon — community gatherings are being planned.</p>
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
                  <Link key={e.id} to={`/events/${e.slug}`} className="block group">
                    <Card className="overflow-hidden p-0 hover:-translate-y-1 transition-all duration-300 hover:shadow-xl h-full flex flex-col">
                      <div className="h-44 flex items-center justify-center relative overflow-hidden flex-shrink-0"
                        style={{ background:'linear-gradient(135deg,#250F47,#5B2D8E)' }}>
                        {e.coverImage
                          ? <img src={e.coverImage} alt="" className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"/>
                          : <><div className="wave-pattern absolute inset-0"/><Calendar className="w-10 h-10 relative z-10" style={{ color:'rgba(240,165,0,0.4)' }}/></>}
                        <div className="absolute top-3 left-3 bg-white rounded-xl px-3 py-2 text-center shadow-lg z-10">
                          <div className="font-display font-bold text-lg leading-none text-dark">{format(d,'d')}</div>
                          <div className="text-[9px] uppercase tracking-wider font-semibold text-primary-500">{format(d,'MMM')}</div>
                        </div>
                        <div className="absolute top-3 right-3 flex flex-col gap-1 items-end z-10">
                          {countdownLabel && (
                            <span className="flex items-center gap-1 text-[10px] font-bold px-2.5 py-1 rounded-full bg-white/15 text-white border border-white/25 backdrop-blur-sm">
                              <Clock className="w-2 h-2"/>{countdownLabel}
                            </span>
                          )}
                          {e.category && (
                            <span className="text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full text-white bg-gold/90">
                              {e.category}
                            </span>
                          )}
                          {isPaid
                            ? <span className="text-[10px] font-bold px-2.5 py-1 rounded-full bg-gold/90 text-dark">{Number(e.ticketPrice).toLocaleString()} XAF</span>
                            : <span className="text-[10px] font-bold px-2.5 py-1 rounded-full bg-primary-500/85 text-white">Free</span>}
                        </div>
                      </div>
                      <div className="p-5 flex flex-col flex-1">
                        <h3 className="font-display font-semibold text-base mb-2 line-clamp-2 text-dark group-hover:text-primary-500 transition-colors">{e.title}</h3>
                        <div className="flex items-center gap-3 text-xs mb-3 text-muted-foreground">
                          <span className="flex items-center gap-1"><Clock className="w-3 h-3 text-primary-500"/>{format(d,'h:mm a')}</span>
                          {e.venue && <span className="flex items-center gap-1 truncate"><MapPin className="w-3 h-3 text-gold"/>{e.venue}</span>}
                        </div>
                        <p className="text-xs line-clamp-2 mb-4 leading-relaxed text-muted-foreground flex-1">{e.description}</p>
                        <div className="flex items-center justify-center gap-1.5 text-xs font-semibold py-2 px-4 rounded-2xl border border-primary-500/20 text-primary-500 mt-auto group-hover:bg-primary-50 transition-colors">
                          <ArrowRight className="w-3 h-3"/>
                          {isPaid ? `Get Ticket · ${Number(e.ticketPrice).toLocaleString()} XAF` : 'Register Now — Free'}
                        </div>
                      </div>
                    </Card>
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

      {/* ════════════════ VOLUNTEER CTA ════════════════ */}
      <section className="py-20 relative overflow-hidden" style={{ background:'linear-gradient(135deg,#eeb549,#FFB84D)' }}>
        <div className="wave-pattern absolute inset-0"/>
        <div className="max-w-7xl mx-auto px-6 relative grid lg:grid-cols-2 gap-12 items-center">

          <div className="grid grid-cols-2 gap-4">
            {[
              { Icon: Users,   value: stats?.teamCount  || '50+', label:'Active Volunteers' },
              { Icon: Globe,   value:'14+',                        label:'Countries'         },
              { Icon: Clock,   value:'500+',                       label:'Hours Contributed' },
              { Icon: Award,   value:'12',                         label:'Projects Supported'},
            ].map((s, i) => (
              <div key={i} className="rounded-2xl p-5 flex flex-col gap-3"
                style={{ background:'rgba(255,255,255,0.18)', border:'1px solid rgba(255,255,255,0.3)', backdropFilter:'blur(8px)' }}>
                <div className="w-10 h-10 rounded-xl flex items-center justify-center"
                  style={{ background:'rgba(255,255,255,0.25)' }}>
                  <s.Icon className="w-5 h-5 text-white"/>
                </div>
                <div>
                  <div className="font-display font-extrabold text-white text-2xl leading-none">{s.value}</div>
                  <div className="text-xs mt-1 font-medium text-white/75">{s.label}</div>
                </div>
              </div>
            ))}
          </div>

          <div>
            <div className="eyebrow mb-3 text-white">
              <span className="w-5 h-0.5 rounded-full bg-white inline-block mr-2"/>Your Village Needs You
            </div>
            <h2 className="font-display font-bold text-white mb-4" style={{ fontSize:'clamp(1.6rem,3vw,2.4rem)' }}>
              Your Skills Can Build<br/>a Brighter <span style={{ textDecoration:'underline', textDecorationColor:'rgba(255,255,255,0.5)' }}>Tomorrow</span>
            </h2>
            <p className="text-sm mb-6 text-white/85">
              Architects, doctors, teachers, engineers, IT professionals — your expertise can transform our village in ways money alone cannot. Join hundreds of volunteers already making a difference.
            </p>
            <div className="flex items-center gap-4 flex-wrap">
              <button onClick={() => setJoinOpen(true)}
                className="bg-white rounded-full px-6 py-3 text-sm font-semibold flex items-center gap-2 hover:shadow-gold transition-all"
                style={{ color:'#eeb549' }}>
                <UserPlus className="w-4 h-4"/>Become A Volunteer
              </button>
              <Link to="/volunteers"
                className="text-sm font-semibold flex items-center gap-1.5 text-white hover:underline transition-all">
                Meet volunteers <ArrowRight className="w-4 h-4"/>
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
              <Newspaper className="w-10 h-10 mx-auto mb-3" style={{ color:'rgba(91,45,142,0.15)' }}/>
              <p className="text-sm text-muted-foreground">No articles published yet — check back soon.</p>
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
                <p className="text-sm mt-3 max-w-lg text-muted-foreground">
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
      <section className="py-16 px-6" style={{ background: '#2d004e' }}>
        <div className="max-w-2xl mx-auto text-center">

          <p className="text-[10px] font-bold uppercase tracking-[0.18em] mb-4" style={{ color: 'rgba(238,181,73,0.7)' }}>
            Global Community
          </p>

          <h2 className="font-display font-bold text-white mb-4 leading-tight" style={{ fontSize: 'clamp(1.5rem,3vw,2.1rem)' }}>
            Home is wherever<br/>
            <span style={{ color: '#eeb549' }}>you are</span>
          </h2>

          <p className="text-sm text-white/50 mb-8 leading-relaxed max-w-md mx-auto">
            Members in 14+ countries stay connected, contribute, and help shape the future of Nkenkak-Ngiesang from wherever life takes them.
          </p>

          {/* Flag strip */}
          <div className="flex items-center justify-center gap-3 flex-wrap mb-10">
            {['🇨🇲','🇫🇷','🇩🇪','🇬🇧','🇺🇸','🇨🇦','🇧🇪','🇨🇭'].map((flag, i) => (
              <span key={i} className="text-2xl leading-none" style={{ opacity: i < 6 ? 1 : 0.4 }}>
                {flag}
              </span>
            ))}
            <span className="text-xs font-semibold ml-1" style={{ color: 'rgba(255,255,255,0.25)' }}>+more</span>
          </div>

          {/* Divider */}
          <div className="w-12 h-px mx-auto mb-8" style={{ background: 'rgba(238,181,73,0.25)' }}/>

          <Link to="/diaspora" className="btn-gold inline-flex">
            <MapPinned className="w-3 h-3"/>Explore Diaspora Network
          </Link>

        </div>
      </section>

      {/* ════════════════ NEWSLETTER ════════════════ */}
      <NewsletterSection/>

      {/* ════════════════ FLOATING DONATE ════════════════ */}
      <FloatingDonate onClick={openDonate}/>

      {joinOpen && <JoinTeamModal onClose={() => setJoinOpen(false)}/>}
    </div>
  )
}
