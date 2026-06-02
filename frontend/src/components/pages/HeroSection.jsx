import { useState, useEffect, useCallback, useRef } from 'react'
import { Link, useOutletContext } from 'react-router-dom'
import { useQuery } from 'react-query'
import { useInView } from 'react-intersection-observer'
import CountUp from 'react-countup'
import api from '../../services/api'
import {
  MapPin, HeartHandshake, ChevronLeft, ChevronRight,
  ArrowRight, Heart, Coins, Users, Sprout,
} from 'lucide-react'

const DEFAULT_SLIDES = [
  {
    id: 'default-1',
    imageUrl: null,
    title: 'Lend a Hand to Those',
    titleAccent: 'Who Need It Most',
    subtitle: 'Together we build a stronger Nkenkak-Ngiesang. Your support transforms lives, funds education, clean water and opportunity.',
    ctaText: 'Donate Now',
    ctaLink: null,
    overlayOpacity: 0.55,
  },
  {
    id: 'default-2',
    imageUrl: null,
    title: 'Rooted in Culture,',
    titleAccent: 'Rising in Unity',
    subtitle: 'Celebrating the living heritage of Nkenkak-Ngiesang across the world. Our traditions bind us together across continents.',
    ctaText: 'Explore Culture',
    ctaLink: '/culture',
    overlayOpacity: 0.5,
  },
  {
    id: 'default-3',
    imageUrl: null,
    title: 'Building Our Village,',
    titleAccent: 'One Project at a Time',
    subtitle: 'From clean water to digital skills — community projects are transforming lives and creating lasting opportunity.',
    ctaText: 'See Projects',
    ctaLink: '/projects',
    overlayOpacity: 0.5,
  },
]

const BG_GRADS = [
  'linear-gradient(135deg,#1A0A35 0%,#3D1A6B 50%,#5B2D8E 100%)',
  'linear-gradient(135deg,#0E0530 0%,#250F47 50%,#5B2D8E 100%)',
  'linear-gradient(135deg,#250F47 0%,#5B2D8E 60%,#7B4DB8 100%)',
]

function fmtNum(n) {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`
  if (n >= 1_000)     return `${(n / 1_000).toFixed(0)}K`
  return String(n)
}

/* ── Live impact card (right column) ── */
function ImpactCard({ stats, loading }) {
  const { ref, inView } = useInView({ triggerOnce: true, threshold: 0.2 })

  const items = [
    { Icon: Coins,  label: 'XAF Raised',     val: stats?.totalRaised   || 0 },
    { Icon: Users,  label: 'Donors',          val: stats?.totalDonors   || 0 },
    { Icon: Sprout, label: 'Active Projects', val: stats?.activeCount   || 0 },
    { Icon: Heart,  label: 'Beneficiaries',   val: stats?.beneficiaries || 0 },
  ]

  return (
    <div ref={ref} className="rounded-3xl p-6 backdrop-blur-md"
      style={{
        background: 'rgba(255,255,255,0.07)',
        border: '1px solid rgba(255,255,255,0.12)',
        boxShadow: '0 24px 64px rgba(0,0,0,0.35)',
      }}>

      {/* Header */}
      <div className="flex items-center gap-2.5 mb-5">
        <div className="w-1.5 h-5 rounded-full flex-shrink-0"
          style={{ background: 'linear-gradient(to bottom,#F0A500,#5B2D8E)' }}/>
        <span className="text-[10px] font-bold uppercase tracking-widest text-white/55">
          Community Impact
        </span>
      </div>

      {/* Stats 2×2 grid */}
      <div className="grid grid-cols-2 gap-3 mb-5">
        {items.map(item => (
          <div key={item.label} className="p-4 rounded-2xl"
            style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.06)' }}>
            <div className="w-8 h-8 rounded-xl flex items-center justify-center mb-3"
              style={{ background: 'rgba(240,165,0,0.15)' }}>
              <item.Icon className="w-4 h-4 text-gold"/>
            </div>
            <div className="font-display font-bold text-white text-xl leading-none">
              {loading ? '—' : inView
                ? <CountUp end={item.val} duration={2.2} separator="," formattingFn={v => fmtNum(v)} />
                : '0'
              }
            </div>
            <div className="text-[10px] mt-1.5 text-white/40 font-medium">{item.label}</div>
          </div>
        ))}
      </div>

      {/* CTA */}
      <Link to="/projects"
        className="flex items-center justify-center gap-2 py-3 rounded-2xl text-sm font-bold text-white transition-all hover:opacity-90 hover:-translate-y-0.5"
        style={{ background: 'linear-gradient(135deg,#F0A500,#FFB84D)', boxShadow: '0 4px 20px rgba(240,165,0,0.35)' }}>
        View All Projects <ArrowRight className="w-3.5 h-3.5"/>
      </Link>
    </div>
  )
}

export default function HeroSection() {
  const { openDonate } = useOutletContext()
  const [current,   setCurrent]   = useState(0)
  const [animating, setAnimating] = useState(false)
  const timerRef   = useRef(null)
  const touchStart = useRef(null)

  const { data: dbSlides } = useQuery('hero-slides',
    () => api.get('/hero').then(r => r.data).catch(() => []),
    { staleTime: 60000 }
  )

  const { data: stats, isLoading: statsLoading } = useQuery('hero-stats',
    () => api.get('/projects?limit=200').then(r => {
      const list = r.data.projects || r.data || []
      return {
        totalRaised:   list.reduce((s, p) => s + Number(p.raisedAmount  || 0), 0),
        totalDonors:   list.reduce((s, p) => s + Number(p.donorCount    || 0), 0),
        activeCount:   list.filter(p => p.status === 'active').length,
        beneficiaries: list.reduce((s, p) => s + Number(p.beneficiaries || 0), 0),
      }
    }).catch(() => null),
    { staleTime: 300000 }
  )

  const slides = dbSlides?.length ? dbSlides : DEFAULT_SLIDES
  const total  = slides.length

  const goTo = useCallback((idx) => {
    if (animating) return
    setAnimating(true)
    setCurrent(idx)
    setTimeout(() => setAnimating(false), 700)
  }, [animating])

  const next = useCallback(() => goTo((current + 1) % total), [current, total, goTo])
  const prev = useCallback(() => goTo((current - 1 + total) % total), [current, total, goTo])

  useEffect(() => {
    if (total <= 1) return
    timerRef.current = setInterval(next, 6500)
    return () => clearInterval(timerRef.current)
  }, [next, total])

  useEffect(() => {
    const fn = (e) => {
      if (e.key === 'ArrowLeft')  prev()
      if (e.key === 'ArrowRight') next()
    }
    window.addEventListener('keydown', fn)
    return () => window.removeEventListener('keydown', fn)
  }, [prev, next])

  const slide = slides[current]

  return (
    <section
      className="relative overflow-hidden select-none"
      style={{ minHeight: '92vh', display: 'flex', alignItems: 'center' }}
      onMouseEnter={() => clearInterval(timerRef.current)}
      onMouseLeave={() => { clearInterval(timerRef.current); timerRef.current = setInterval(next, 6500) }}
      onTouchStart={e => { touchStart.current = e.touches[0].clientX }}
      onTouchEnd={e => {
        if (!touchStart.current) return
        const diff = touchStart.current - e.changedTouches[0].clientX
        if (Math.abs(diff) > 50) { diff > 0 ? next() : prev() }
        touchStart.current = null
      }}>

      {/* ── Background slides ── */}
      {slides.map((s, i) => (
        <div key={s.id || i}
          className="absolute inset-0 transition-opacity duration-700"
          style={{ opacity: i === current ? 1 : 0, zIndex: i === current ? 1 : 0 }}>
          {s.imageUrl ? (
            <>
              <img src={s.imageUrl} alt="" role="presentation"
                loading={i === 0 ? 'eager' : 'lazy'}
                className="absolute inset-0 w-full h-full object-cover transition-transform duration-[8000ms]"
                style={{ transform: i === current ? 'scale(1.04)' : 'scale(1.0)' }}/>
              <div className="absolute inset-0"
                style={{ background: `linear-gradient(to bottom, rgba(14,5,48,${(+s.overlayOpacity||0.5)*0.5}) 0%, rgba(14,5,48,${+s.overlayOpacity||0.5}) 55%, rgba(14,5,48,0.88) 100%)` }}/>
            </>
          ) : (
            <div className="absolute inset-0" style={{ background: BG_GRADS[i % BG_GRADS.length] }}>
              {/* Ambient orbs */}
              <div className="absolute top-0 right-0 w-[650px] h-[650px] rounded-full pointer-events-none"
                style={{ background: 'radial-gradient(circle, rgba(91,45,142,0.4) 0%, transparent 65%)', transform: 'translate(30%,-30%)' }}/>
              <div className="absolute bottom-0 left-0 w-[450px] h-[450px] rounded-full pointer-events-none"
                style={{ background: 'radial-gradient(circle, rgba(240,165,0,0.12) 0%, transparent 65%)', transform: 'translate(-30%,30%)' }}/>
              <div className="absolute top-1/2 left-1/2 w-[300px] h-[300px] rounded-full pointer-events-none"
                style={{ background: 'radial-gradient(circle, rgba(91,45,142,0.15) 0%, transparent 70%)', transform: 'translate(-50%,-50%)' }}/>
              {/* Subtle dot grid */}
              <div className="absolute inset-0 opacity-30" style={{
                backgroundImage: "url(\"data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='%23ffffff' fill-opacity='0.03'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4z'/%3E%3C/g%3E%3C/svg%3E\")",
              }}/>
            </div>
          )}
        </div>
      ))}

      {/* ── Content ── */}
      <div className="relative w-full max-w-7xl mx-auto px-6 py-24" style={{ zIndex: 10 }}>
        <div className="grid lg:grid-cols-[1fr_360px] gap-14 items-center">

          {/* ══ Left — text + CTAs ══ */}
          <div>
            {/* Eyebrow */}
            <div key={`ey-${current}`}
              className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-[3px] px-4 py-2 rounded-full mb-7"
              style={{
                background: 'rgba(240,165,0,0.1)',
                border: '1px solid rgba(240,165,0,0.22)',
                color: '#F0A500',
                animation: 'fadeUp 0.5s ease both',
              }}>
              <MapPin className="w-3 h-3"/> Nkenkak-Ngiesang · West Cameroon
            </div>

            {/* Headline — two lines: white + gold gradient accent */}
            <h1 key={`h-${current}`}
              className="font-display font-extrabold mb-5 leading-[1.07]"
              style={{
                fontSize: 'clamp(2.1rem,5.5vw,4rem)',
                textShadow: '0 4px 30px rgba(0,0,0,0.3)',
                animation: 'fadeUp 0.55s ease 0.06s both',
              }}>
              {slide.titleAccent ? (
                <>
                  <span className="text-white">{slide.title}</span>
                  <br/>
                  <span style={{
                    background: 'linear-gradient(135deg,#F0A500,#FFB84D)',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                    backgroundClip: 'text',
                  }}>
                    {slide.titleAccent}
                  </span>
                </>
              ) : (
                <span className="text-white">{slide.title || 'Welcome to Nkenkak-Ngiesang'}</span>
              )}
            </h1>

            {/* Subtitle */}
            {slide.subtitle && (
              <p key={`s-${current}`}
                className="text-base md:text-lg mb-9 max-w-lg leading-relaxed"
                style={{ color: 'rgba(255,255,255,0.7)', animation: 'fadeUp 0.6s ease 0.13s both' }}>
                {slide.subtitle}
              </p>
            )}

            {/* CTAs */}
            <div key={`ct-${current}`} className="flex flex-wrap gap-3 mb-10"
              style={{ animation: 'fadeUp 0.65s ease 0.22s both' }}>

              {/* Primary */}
              {slide.ctaLink ? (
                <Link to={slide.ctaLink}
                  className="inline-flex items-center gap-2 font-bold text-sm rounded-full px-7 py-3.5 text-white transition-all hover:-translate-y-0.5"
                  style={{ background: 'linear-gradient(135deg,#F0A500,#FFB84D)', boxShadow: '0 4px 20px rgba(240,165,0,0.42)' }}>
                  <HeartHandshake className="w-4 h-4"/>
                  {slide.ctaText}
                </Link>
              ) : (
                <button onClick={openDonate}
                  className="inline-flex items-center gap-2 font-bold text-sm rounded-full px-7 py-3.5 text-white transition-all hover:-translate-y-0.5"
                  style={{ background: 'linear-gradient(135deg,#F0A500,#FFB84D)', boxShadow: '0 4px 20px rgba(240,165,0,0.42)' }}>
                  <HeartHandshake className="w-4 h-4"/>
                  {slide.ctaText || 'Donate Now'}
                </button>
              )}

              {/* Secondary — always Explore Projects */}
              <Link to="/projects"
                className="inline-flex items-center gap-2 font-bold text-sm rounded-full px-7 py-3.5 text-white transition-all hover:bg-white/15"
                style={{ border: '2px solid rgba(255,255,255,0.5)' }}>
                <Sprout className="w-4 h-4"/>
                Explore Projects
              </Link>
            </div>

            {/* Mobile-only condensed stats strip */}
            <div className="lg:hidden flex items-center gap-8 flex-wrap"
              style={{ animation: 'fadeUp 0.7s ease 0.3s both' }}>
              {[
                { val: fmtNum(stats?.totalRaised || 0), label: 'XAF raised' },
                { val: String(stats?.totalDonors  || '—'), label: 'donors'   },
                { val: String(stats?.activeCount  || '—'), label: 'projects' },
              ].map(item => (
                <div key={item.label}>
                  <div className="font-display font-bold text-white text-xl leading-none">{item.val}</div>
                  <div className="text-[10px] mt-1 text-white/40 uppercase tracking-wider">{item.label}</div>
                </div>
              ))}
            </div>
          </div>

          {/* ══ Right — live impact card (desktop only) ══ */}
          <div className="hidden lg:block" style={{ animation: 'fadeUp 0.7s ease 0.28s both' }}>
            <ImpactCard stats={stats} loading={statsLoading} />
          </div>
        </div>
      </div>

      {/* ── Prev / Next arrows ── */}
      {total > 1 && (
        <>
          <button onClick={prev} aria-label="Previous slide"
            className="absolute top-1/2 -translate-y-1/2 left-4 md:left-6 z-20 w-11 h-11 rounded-full flex items-center justify-center transition-all hover:scale-110"
            style={{ background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.14)', color: 'rgba(255,255,255,0.8)', backdropFilter: 'blur(8px)' }}>
            <ChevronLeft className="w-4 h-4"/>
          </button>
          <button onClick={next} aria-label="Next slide"
            className="absolute top-1/2 -translate-y-1/2 right-4 md:right-6 z-20 w-11 h-11 rounded-full flex items-center justify-center transition-all hover:scale-110"
            style={{ background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.14)', color: 'rgba(255,255,255,0.8)', backdropFilter: 'blur(8px)' }}>
            <ChevronRight className="w-4 h-4"/>
          </button>
        </>
      )}

      {/* ── Bottom chrome: scroll | dots | counter ── */}
      <div className="absolute bottom-8 left-0 right-0 z-20 flex items-center px-6 md:px-8">

        {/* Scroll mouse — left, desktop only */}
        <div className="hidden md:flex flex-col items-center gap-1 pointer-events-none flex-shrink-0">
          <div className="w-5 h-8 rounded-full flex items-start justify-center pt-1.5"
            style={{ border: '1.5px solid rgba(255,255,255,0.2)' }}>
            <div className="w-1 h-1.5 rounded-full animate-bounce" style={{ background: 'rgba(255,255,255,0.5)' }}/>
          </div>
        </div>

        {/* Dot indicators — centered */}
        {total > 1 && (
          <div className="flex gap-2 mx-auto">
            {slides.map((_, i) => (
              <button key={i} onClick={() => goTo(i)} aria-label={`Slide ${i + 1}`}
                className="rounded-full transition-all duration-300"
                style={{
                  width: i === current ? 28 : 8,
                  height: 4,
                  background: i === current ? '#F0A500' : 'rgba(255,255,255,0.28)',
                }}/>
            ))}
          </div>
        )}

        {/* Slide counter — right, desktop only */}
        {total > 1 && (
          <div className="hidden md:flex items-center gap-0.5 text-xs font-semibold flex-shrink-0"
            style={{ color: 'rgba(255,255,255,0.35)', minWidth: 36 }}>
            <span style={{ color: 'rgba(255,255,255,0.75)' }}>{String(current + 1).padStart(2, '0')}</span>
            <span className="mx-0.5">/</span>
            <span>{String(total).padStart(2, '0')}</span>
          </div>
        )}
      </div>
    </section>
  )
}
