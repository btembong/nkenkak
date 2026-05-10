import { useState, useEffect, useCallback, useRef } from 'react'
import { Link, useOutletContext } from 'react-router-dom'
import { useQuery } from 'react-query'
import api from '../../services/api'

const DEFAULT_SLIDES = [
  {
    id: 'default-1',
    imageUrl: null,
    title: 'Lend a Helping Hand To Those Who Need It',
    subtitle: 'Together we build a stronger Nkenkak-Ngiesang. Your support transforms lives, funds education, clean water and opportunity.',
    ctaText: 'Donate Now',
    ctaLink: null,
    overlayOpacity: 0.55,
  },
  {
    id: 'default-2',
    imageUrl: null,
    title: 'Rooted in Culture, Rising in Unity',
    subtitle: 'Celebrating the living heritage of Nkenkak-Ngiesang across the world. Our traditions bind us together.',
    ctaText: 'Explore Culture',
    ctaLink: '/culture',
    overlayOpacity: 0.5,
  },
  {
    id: 'default-3',
    imageUrl: null,
    title: 'Building Tomorrow Together',
    subtitle: 'From clean water to digital skills — community projects are transforming lives one initiative at a time.',
    ctaText: 'See All Projects',
    ctaLink: '/projects',
    overlayOpacity: 0.5,
  },
]

const BG_GRADS = [
  'linear-gradient(135deg,#1A0A35 0%,#3D1A6B 50%,#5B2D8E 100%)',
  'linear-gradient(135deg,#0E0530 0%,#250F47 50%,#5B2D8E 100%)',
  'linear-gradient(135deg,#250F47 0%,#5B2D8E 60%,#7B4DB8 100%)',
]

export default function HeroSection() {
  const { openDonate } = useOutletContext()
  const [current,   setCurrent]   = useState(0)
  const [animating, setAnimating] = useState(false)
  const timerRef    = useRef(null)
  const touchStart  = useRef(null)

  const { data: dbSlides } = useQuery('hero-slides',
    () => api.get('/hero').then(r => r.data).catch(() => []),
    { staleTime: 60000 }
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
      style={{ minHeight: '90vh', display: 'flex', alignItems: 'center' }}
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
              <div className="absolute inset-0" style={{
                backgroundImage: "url(\"data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='%23ffffff' fill-opacity='0.03'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4z'/%3E%3C/g%3E%3C/svg%3E\")",
              }}/>
              <div className="absolute inset-0" style={{ background: 'radial-gradient(ellipse at 30% 50%,rgba(240,165,0,0.07) 0%,transparent 60%)' }}/>
            </div>
          )}
        </div>
      ))}

      {/* ── Content ── */}
      <div className="relative w-full max-w-7xl mx-auto px-6 py-28" style={{ zIndex: 10 }}>
        <div className="max-w-3xl">
          <div key={`ey-${current}`}
            className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-[4px] px-4 py-2 rounded-full mb-6"
            style={{ background: 'rgba(240,165,0,0.12)', border: '1px solid rgba(240,165,0,0.25)', color: '#F0A500',
                     animation: 'fadeUp 0.5s ease both' }}>
            <i className="fas fa-map-marker-alt text-[10px]"/> Cameroon, West Region
          </div>

          <h1 key={`h-${current}`}
            className="font-display font-extrabold text-white mb-5 leading-[1.05]"
            style={{ fontSize: 'clamp(2rem,5.5vw,3.8rem)', textShadow: '0 4px 30px rgba(0,0,0,0.4)',
                     animation: 'fadeUp 0.55s ease 0.05s both' }}>
            {slide.title || 'Welcome to Nkenkak-Ngiesang'}
          </h1>

          {slide.subtitle && (
            <p key={`s-${current}`}
              className="text-base md:text-lg mb-8 max-w-xl leading-relaxed"
              style={{ color: 'rgba(255,255,255,0.78)', fontFamily: 'Poppins,sans-serif',
                       animation: 'fadeUp 0.6s ease 0.12s both' }}>
              {slide.subtitle}
            </p>
          )}

          <div key={`ct-${current}`} className="flex flex-wrap gap-3"
            style={{ animation: 'fadeUp 0.65s ease 0.2s both' }}>
            {slide.ctaLink ? (
              <Link to={slide.ctaLink}
                className="inline-flex items-center gap-2 font-semibold text-sm rounded-full px-7 py-3.5 transition-all hover:-translate-y-0.5"
                style={{ background: 'linear-gradient(135deg,#F0A500,#FFB84D)', color: '#fff', boxShadow: '0 4px 20px rgba(240,165,0,0.45)', fontFamily: 'Sora,sans-serif' }}>
                <i className="fas fa-seedling text-xs"/>
                {slide.ctaText || 'Explore'}
              </Link>
            ) : (
              <button onClick={openDonate}
                className="inline-flex items-center gap-2 font-semibold text-sm rounded-full px-7 py-3.5 transition-all hover:-translate-y-0.5"
                style={{ background: 'linear-gradient(135deg,#F0A500,#FFB84D)', color: '#fff', boxShadow: '0 4px 20px rgba(240,165,0,0.45)', fontFamily: 'Sora,sans-serif' }}>
                <i className="fas fa-heart text-xs"/>
                {slide.ctaText || 'Donate Now'}
              </button>
            )}
            <button onClick={openDonate}
              className="inline-flex items-center gap-2 font-semibold text-sm rounded-full px-7 py-3.5 transition-all"
              style={{ border: '2px solid rgba(255,255,255,0.65)', color: '#fff', fontFamily: 'Sora,sans-serif' }}
              onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.12)'}
              onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
              <i className="fas fa-hands-helping text-xs"/>Support the Village
            </button>
          </div>

          {/* Donor avatars */}
          <div className="flex items-center gap-4 mt-8">
            <div className="flex -space-x-2">
              {['#5B2D8E','#7B4DB8','#F0A500','#9B6FD8','#4A2478'].map((c,i) => (
                <div key={i} className="w-9 h-9 rounded-full border-2 border-white flex items-center justify-center text-white text-[10px] font-bold flex-shrink-0"
                  style={{ background: c }}>
                  {['BT','CM','KM','AG','FN'][i]}
                </div>
              ))}
            </div>
            <p className="text-sm" style={{ color: 'rgba(255,255,255,0.7)', fontFamily: 'Poppins,sans-serif' }}>
              <span className="font-bold text-white">340+</span> donors worldwide
            </p>
          </div>
        </div>
      </div>

      {/* ── Prev / Next arrows ── */}
      {total > 1 && (
        <>
          <button onClick={prev} aria-label="Previous slide"
            className="absolute top-1/2 -translate-y-1/2 left-4 md:left-6 z-20 w-11 h-11 rounded-full flex items-center justify-center transition-all hover:scale-110"
            style={{ background: 'rgba(255,255,255,0.1)', border: '1px solid rgba(255,255,255,0.18)', color: 'rgba(255,255,255,0.85)', backdropFilter: 'blur(8px)' }}>
            <i className="fas fa-chevron-left text-sm"/>
          </button>
          <button onClick={next} aria-label="Next slide"
            className="absolute top-1/2 -translate-y-1/2 right-4 md:right-6 z-20 w-11 h-11 rounded-full flex items-center justify-center transition-all hover:scale-110"
            style={{ background: 'rgba(255,255,255,0.1)', border: '1px solid rgba(255,255,255,0.18)', color: 'rgba(255,255,255,0.85)', backdropFilter: 'blur(8px)' }}>
            <i className="fas fa-chevron-right text-sm"/>
          </button>
        </>
      )}

      {/* ── Dot indicators ── */}
      {total > 1 && (
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-20 flex gap-2">
          {slides.map((_, i) => (
            <button key={i} onClick={() => goTo(i)} aria-label={`Slide ${i+1}`}
              className="rounded-full transition-all duration-300"
              style={{ width: i === current ? 28 : 8, height: 4,
                       background: i === current ? '#F0A500' : 'rgba(255,255,255,0.35)' }}/>
          ))}
        </div>
      )}

      {/* ── Slide counter ── */}
      {total > 1 && (
        <div className="absolute bottom-8 right-6 z-20 hidden md:flex items-center gap-1 text-xs font-semibold"
          style={{ color: 'rgba(255,255,255,0.45)', fontFamily: 'Sora,sans-serif' }}>
          <span style={{ color: 'rgba(255,255,255,0.85)' }}>{String(current+1).padStart(2,'0')}</span>
          <span className="mx-1">/</span>
          <span>{String(total).padStart(2,'0')}</span>
        </div>
      )}

      {/* ── Scroll indicator ── */}
      <div className="absolute bottom-8 left-8 z-20 hidden md:flex flex-col items-center gap-1 pointer-events-none">
        <div className="w-5 h-8 rounded-full border flex items-start justify-center pt-1.5"
          style={{ border: '1.5px solid rgba(255,255,255,0.25)' }}>
          <div className="w-1 h-1.5 rounded-full animate-bounce" style={{ background: 'rgba(255,255,255,0.6)' }}/>
        </div>
      </div>
    </section>
  )
}
