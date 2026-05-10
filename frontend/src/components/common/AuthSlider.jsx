import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'

/* ═══════════════════════════════════════════════════════════════
   SLIDE CONFIG  —  edit this array to customise the left panel
   ═══════════════════════════════════════════════════════════════

   mode:
     'gradient'  pure colour gradient, no image
     'overlay'   your photo behind a translucent gradient overlay
     'full'      your photo fills the panel (soft bottom-fade only)

   image:          URL of your photo (Cloudinary, /public folder, etc.)
                   Leave '' or null to fall back to gradient mode.

   gradient:       CSS gradient used as the background ('gradient' mode)
                   or as the colour overlay ('overlay' mode).

   overlayOpacity: 0 – 1  strength of the overlay in 'overlay' mode
                   (default 0.65). Ignored in 'gradient' and 'full' modes.

   eyebrow / title / highlight / quote / author / authorSub:
                   Text content shown on that slide.
═══════════════════════════════════════════════════════════════ */
const SLIDES = [
  {
    mode:           'overlay',
    image:          'https://res.cloudinary.com/dmxnsttmu/image/upload/q_auto/f_auto/v1778229327/4209169642_6760580197_b_c9jn0b.jpg',
    gradient:       'linear-gradient(135deg,#1A0A35 0%,#3D1A6B 50%,#5B2D8E 100%)',
    overlayOpacity: 0.65,
    eyebrow:        'Welcome Home',
    title:          'Your village.\nYour community.',
    highlight:      'Your home.',
    quote:          '"Being part of this community across thousands of miles has never felt more real."',
    author:         'Bernard Tchouapa',
    authorSub:      'Diaspora — Paris, France',
  },
  {
    mode:           'overlay',
    image:          'https://res.cloudinary.com/dmxnsttmu/image/upload/v1778229359/469182858_587670723943619_6968346166025465972_n_wd5m31.jpg',     // ← paste your Cloudinary / photo URL here
    gradient:       'linear-gradient(135deg,rgba(26,10,53,0.80),rgba(91,45,142,0.65))',
    overlayOpacity: 0.72,
    eyebrow:        'Our Projects',
    title:          'Building a\nbetter tomorrow',
    highlight:      'together.',
    quote:          '"Every contribution, large or small, changes lives in our village."',
    author:         'Marie Ngono',
    authorSub:      'Education Project Lead',
  },
  {
    mode:           'full',
    image:          'https://res.cloudinary.com/dmxnsttmu/image/upload/v1778262556/WhatsApp_Image_2026-04-30_at_20.57.13_yl6xj3.jpg',     // ← paste your Cloudinary / photo URL here
    gradient:       'linear-gradient(to top,rgba(6,2,16,0.90) 0%,rgba(6,2,16,0.45) 55%,rgba(6,2,16,0.10) 100%)',
    overlayOpacity: 0.72,
    eyebrow:        'Our Heritage',
    title:          'Rooted in culture,',
    highlight:      'growing together.',
    quote:          '"Our traditions are the foundation of our future."',
    author:         'Chief Emmanuel Tembong',
    authorSub:      'Village Elder',
  },
]

/* Renders the layered background for one slide */
function SlideBg({ slide }) {
  const hasImage = !!(slide.image?.trim())
  return (
    <>
      {/* Base — gradient or dark base for full-image mode */}
      <div className="absolute inset-0"
        style={{ background: hasImage && slide.mode === 'full' ? '#060210' : slide.gradient }} />

      {/* Photo layer */}
      {hasImage && (
        <img src={slide.image} alt=""
          className="absolute inset-0 w-full h-full object-cover" />
      )}

      {/* Colour overlay (overlay mode) */}
      {hasImage && slide.mode === 'overlay' && (
        <div className="absolute inset-0"
          style={{ background: slide.gradient, opacity: slide.overlayOpacity ?? 0.65 }} />
      )}

      {/* Bottom-fade (full mode) */}
      {(slide.mode === 'full' || (!hasImage)) && (
        <div className="absolute inset-0" style={{ background: slide.mode === 'full' ? slide.gradient : undefined }} />
      )}
    </>
  )
}

export default function AuthSlider() {
  const [current, setCurrent]   = useState(0)
  const [fadeIn,  setFadeIn]    = useState(true)

  useEffect(() => {
    const t = setInterval(() => {
      setFadeIn(false)
      setTimeout(() => { setCurrent(c => (c + 1) % SLIDES.length); setFadeIn(true) }, 350)
    }, 5500)
    return () => clearInterval(t)
  }, [])

  const slide = SLIDES[current]

  const goTo = (i) => {
    if (i === current) return
    setFadeIn(false)
    setTimeout(() => { setCurrent(i); setFadeIn(true) }, 350)
  }

  return (
    <div className="relative h-full w-full overflow-hidden flex flex-col justify-between p-12 min-h-screen">

      {/* ── Backgrounds (cross-fade) ── */}
      {SLIDES.map((s, i) => (
        <div key={i} className="absolute inset-0 transition-opacity duration-700"
          style={{ opacity: i === current ? 1 : 0, zIndex: 0, pointerEvents: 'none' }}>
          <SlideBg slide={s} />
        </div>
      ))}

      {/* Decorative blobs */}
      <div className="absolute -top-24 -right-24 w-80 h-80 rounded-full pointer-events-none"
        style={{ background: 'radial-gradient(circle,rgba(240,165,0,0.15),transparent)', zIndex: 1 }} />
      <div className="absolute -bottom-24 -left-16 w-64 h-64 rounded-full pointer-events-none"
        style={{ background: 'radial-gradient(circle,rgba(123,77,184,0.18),transparent)', zIndex: 1 }} />

      {/* ── Logo ── */}
      <div className="relative" style={{ zIndex: 2 }}>
        <Link to="/" className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-2xl flex items-center justify-center"
            style={{ background: 'rgba(240,165,0,0.18)', border: '1px solid rgba(240,165,0,0.3)' }}>
            <i className="fas fa-heart text-lg" style={{ color: '#F0A500' }} />
          </div>
          <div>
            <div className="font-display font-bold text-white">Nkenkak-Ngiesang</div>
            <div className="text-[9px] uppercase tracking-[3px]" style={{ color: 'rgba(240,165,0,0.6)' }}>
              Village Community
            </div>
          </div>
        </Link>
      </div>

      {/* ── Slide content ── */}
      <div className="relative flex-1 flex flex-col justify-center" style={{ zIndex: 2 }}>
        <div style={{
          opacity:    fadeIn ? 1 : 0,
          transform:  fadeIn ? 'translateY(0)' : 'translateY(14px)',
          transition: 'opacity 0.45s ease, transform 0.45s ease',
        }}
          className="space-y-5">

          {/* Eyebrow */}
          <div className="flex items-center gap-2 text-sm font-semibold tracking-widest uppercase"
            style={{ color: 'rgba(240,165,0,0.9)', fontFamily: 'Sora,sans-serif' }}>
            <span className="w-5 h-0.5 rounded-full" style={{ background: '#F0A500' }} />
            {slide.eyebrow}
          </div>

          {/* Headline */}
          <h2 className="font-display font-bold text-4xl text-white leading-tight whitespace-pre-line">
            {slide.title}<br />
            <span style={{ color: '#F0A500' }}>{slide.highlight}</span>
          </h2>

          {/* Quote card */}
          <div className="rounded-2xl p-5 mt-2"
            style={{ background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.12)', backdropFilter: 'blur(8px)' }}>
            <div className="flex gap-0.5 mb-2.5">
              {Array.from({ length: 5 }).map((_, j) => (
                <i key={j} className="fas fa-star text-[10px]" style={{ color: '#F0A500' }} />
              ))}
            </div>
            <p className="text-sm italic leading-relaxed"
              style={{ color: 'rgba(255,255,255,0.82)', fontFamily: 'Poppins,sans-serif' }}>
              {slide.quote}
            </p>
            <div className="flex items-center gap-3 mt-4">
              <div className="w-9 h-9 rounded-full flex items-center justify-center text-xs font-bold text-white flex-shrink-0"
                style={{ background: 'rgba(240,165,0,0.28)' }}>
                {slide.author?.[0]}{slide.author?.split(' ')[1]?.[0]}
              </div>
              <div>
                <div className="font-display font-semibold text-sm text-white">{slide.author}</div>
                <div className="text-[10px]" style={{ color: 'rgba(255,255,255,0.5)', fontFamily: 'Poppins,sans-serif' }}>
                  {slide.authorSub}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ── Dots navigation + footer ── */}
      <div className="relative flex items-center justify-between" style={{ zIndex: 2 }}>
        <div className="flex items-center gap-2">
          {SLIDES.map((_, i) => (
            <button key={i} onClick={() => goTo(i)}
              className="transition-all duration-300 rounded-full"
              style={{
                width:      i === current ? 28 : 8,
                height:     8,
                background: i === current ? '#F0A500' : 'rgba(255,255,255,0.25)',
                cursor:     'pointer',
              }} />
          ))}
          <span className="text-xs ml-2" style={{ color: 'rgba(255,255,255,0.35)', fontFamily: 'Poppins,sans-serif' }}>
            {current + 1} / {SLIDES.length}
          </span>
        </div>
        <div className="text-xs" style={{ color: 'rgba(255,255,255,0.28)', fontFamily: 'Poppins,sans-serif' }}>
          © {new Date().getFullYear()} Nkenkak-Ngiesang
        </div>
      </div>
    </div>
  )
}
