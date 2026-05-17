import { useState, useEffect, useRef } from 'react'
import { Link } from 'react-router-dom'
import { useQuery } from 'react-query'
import api from '../../services/api'

const CATEGORIES = [
  { id: 'all',       label: 'All',       icon: 'fa-globe' },
  { id: 'greetings', label: 'Greetings', icon: 'fa-hand-wave' },
  { id: 'numbers',   label: 'Numbers',   icon: 'fa-sort-numeric-up' },
  { id: 'family',    label: 'Family',    icon: 'fa-users' },
  { id: 'nature',    label: 'Nature',    icon: 'fa-leaf' },
  { id: 'customs',   label: 'Customs',   icon: 'fa-drum' },
  { id: 'proverbs',  label: 'Proverbs',  icon: 'fa-scroll' },
]

const CAT_COLORS = {
  greetings: { bg: 'rgba(91,45,142,0.12)',  text: '#5B2D8E',  grad: 'linear-gradient(135deg,#5B2D8E,#7B4DB8)' },
  numbers:   { bg: 'rgba(240,165,0,0.12)',  text: '#C87800',  grad: 'linear-gradient(135deg,#C87800,#F0A500)' },
  family:    { bg: 'rgba(220,38,38,0.1)',   text: '#dc2626',  grad: 'linear-gradient(135deg,#b91c1c,#dc2626)' },
  nature:    { bg: 'rgba(22,163,74,0.1)',   text: '#16a34a',  grad: 'linear-gradient(135deg,#15803d,#22c55e)' },
  customs:   { bg: 'rgba(2,132,199,0.1)',   text: '#0284c7',  grad: 'linear-gradient(135deg,#0369a1,#0284c7)' },
  proverbs:  { bg: 'rgba(168,85,247,0.1)',  text: '#9333ea',  grad: 'linear-gradient(135deg,#7e22ce,#a855f7)' },
  general:   { bg: 'rgba(91,45,142,0.08)', text: '#5B2D8E',  grad: 'linear-gradient(135deg,#5B2D8E,#7B4DB8)' },
}

const LANGUAGE_FACTS = [
  { icon: 'fa-map-marked-alt', title: 'Grasslands Bantu Family', body: 'The Ngiemboon language belongs to the Grasslands Bantu branch — one of Africa\'s most linguistically diverse regions, with around 100 related languages across the highlands of Cameroon.' },
  { icon: 'fa-music',          title: 'Tonal in Nature',         body: 'Like many Grasslands languages, Ngiemboon is tonal. The same syllable pronounced with a high, mid or low pitch can carry completely different meanings. Mastering tone is key to fluency.' },
  { icon: 'fa-book-open',      title: 'Oral Tradition First',    body: 'Historically transmitted through oral tradition, the language was only recently given a written orthography. Proverbs and praise poetry were preserved by griots and elders across generations.' },
]

const WORD_OF_DAY = { word: 'Mbɔ́ŋ', pronunciation: 'mbong', translation: 'Peace / Harmony', category: 'greetings', example: 'Mbɔ́ŋ nwî — Peace of the day.' }

// Pre-load voices early
if (typeof window !== 'undefined' && window.speechSynthesis) window.speechSynthesis.getVoices()

function speak(text) {
  if (!window.speechSynthesis) return
  window.speechSynthesis.cancel()
  const fire = () => {
    const utt = new SpeechSynthesisUtterance(text)
    utt.rate = 0.78; utt.pitch = 0.9
    const voices = window.speechSynthesis.getVoices()
    const enVoices = voices.filter(v => v.lang.startsWith('en'))
    const maleKw = /male|david|james|mark|daniel|alex|fred|george|john|tom|guy/i
    const voice =
      enVoices.find(v => maleKw.test(v.name) && v.lang === 'en-NG') ||
      enVoices.find(v => maleKw.test(v.name) && v.lang === 'en-ZA') ||
      enVoices.find(v => maleKw.test(v.name) && v.lang === 'en-GB') ||
      enVoices.find(v => maleKw.test(v.name)) ||
      enVoices.find(v => v.lang === 'en-GB') || enVoices[0]
    if (voice) { utt.voice = voice; utt.lang = voice.lang }
    window.speechSynthesis.speak(utt)
  }
  const voices = window.speechSynthesis.getVoices()
  if (voices.length) fire()
  else window.speechSynthesis.addEventListener('voiceschanged', fire, { once: true })
}

function SkeletonCard() {
  return (
    <div className="rounded-3xl overflow-hidden animate-pulse"
      style={{ background: '#fff', border: '1px solid rgba(91,45,142,0.06)', minHeight: 180 }}>
      <div className="h-28 rounded-t-3xl" style={{ background: 'rgba(91,45,142,0.06)' }} />
      <div className="p-4 space-y-2">
        <div className="h-3 rounded-full w-2/3" style={{ background: 'rgba(91,45,142,0.06)' }} />
        <div className="h-3 rounded-full w-1/2" style={{ background: 'rgba(91,45,142,0.04)' }} />
      </div>
    </div>
  )
}

function FlashCard({ item, isFlipped, onFlip }) {
  const colors = CAT_COLORS[item.category] || CAT_COLORS.general
  const handleFlip = () => {
    onFlip()
    if (!isFlipped) setTimeout(() => speak(item.pronunciation || item.word), 220)
  }
  return (
    <div className="cursor-pointer" style={{ perspective: '1000px', minHeight: 190 }} onClick={handleFlip}>
      <div style={{
        position: 'relative', width: '100%', minHeight: 190,
        transformStyle: 'preserve-3d',
        transition: 'transform 0.4s ease',
        transform: isFlipped ? 'rotateY(180deg)' : 'rotateY(0deg)',
      }}>
        {/* FRONT */}
        <div style={{
          position: 'absolute', inset: 0, backfaceVisibility: 'hidden', WebkitBackfaceVisibility: 'hidden',
          background: 'linear-gradient(135deg,#250F47,#5B2D8E)',
          borderRadius: '1.5rem', border: '1px solid rgba(240,165,0,0.15)',
          boxShadow: '0 4px 24px rgba(91,45,142,0.15)',
          display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
          padding: '1.25rem', gap: '0.75rem',
        }}>
          <span className="text-[10px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full capitalize"
            style={{ background: colors.bg, color: colors.text }}>{item.category}</span>
          <p className="text-center font-display font-bold leading-tight"
            style={{ fontSize: 'clamp(1.4rem,4vw,2rem)', color: '#F0A500', lineHeight: 1.2 }}>{item.word}</p>
          <div className="flex items-center gap-1.5 text-xs" style={{ color: 'rgba(255,255,255,0.4)', fontFamily: 'Poppins,sans-serif' }}>
            <i className="fas fa-sync-alt text-[9px]" />Tap to flip
          </div>
        </div>
        {/* BACK */}
        <div style={{
          position: 'absolute', inset: 0, backfaceVisibility: 'hidden', WebkitBackfaceVisibility: 'hidden',
          transform: 'rotateY(180deg)', background: '#fff',
          borderRadius: '1.5rem', border: '1px solid rgba(91,45,142,0.08)',
          boxShadow: '0 4px 24px rgba(91,45,142,0.10)',
          display: 'flex', flexDirection: 'column', padding: '1.25rem', gap: '0.5rem',
        }}>
          <span className="text-[10px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full capitalize self-start"
            style={{ background: colors.bg, color: colors.text }}>{item.category}</span>
          <p className="font-display font-bold text-xl leading-snug" style={{ color: '#1A0A35' }}>{item.translation}</p>
          {item.pronunciation && (
            <div className="flex items-center gap-2">
              <p className="text-xs italic flex-1" style={{ color: '#5B2D8E', fontFamily: 'Poppins,sans-serif' }}>
                <i className="fas fa-volume-up mr-1" />{item.pronunciation}
              </p>
              <button onClick={e => { e.stopPropagation(); speak(item.pronunciation || item.word) }}
                className="w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0 transition-all hover:scale-110"
                style={{ background: 'rgba(91,45,142,0.1)', border: '1px solid rgba(91,45,142,0.2)' }}>
                <i className="fas fa-redo text-[9px]" style={{ color: '#5B2D8E' }} />
              </button>
            </div>
          )}
          {item.example && (
            <p className="text-xs leading-relaxed border-t pt-2"
              style={{ color: '#737373', fontFamily: 'Poppins,sans-serif', borderColor: 'rgba(91,45,142,0.07)' }}>
              <span className="font-semibold" style={{ color: '#5B2D8E' }}>e.g.</span> {item.example}
            </p>
          )}
          <div className="flex items-center gap-1.5 text-[10px] mt-auto" style={{ color: '#A3A3A3', fontFamily: 'Poppins,sans-serif' }}>
            <i className="fas fa-sync-alt text-[9px]" />Tap to flip back
          </div>
        </div>
      </div>
    </div>
  )
}

function ProverbCard({ item, idx }) {
  const [revealed, setRevealed] = useState(false)
  const [copied, setCopied] = useState(false)
  const copy = () => {
    navigator.clipboard?.writeText(`"${item.word}" — ${item.translation}`)
    setCopied(true); setTimeout(() => setCopied(false), 2000)
  }
  return (
    <div className="rounded-3xl overflow-hidden transition-all duration-300"
      style={{ background: 'linear-gradient(135deg,#1A0A35,#250F47)', border: '1px solid rgba(240,165,0,0.12)', boxShadow: '0 8px 32px rgba(0,0,0,0.2)' }}>
      <div className="h-1.5" style={{ background: 'linear-gradient(90deg,#7e22ce,#a855f7,#F0A500)' }} />
      <div className="p-6">
        <div className="flex items-start justify-between mb-4">
          <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
            style={{ background: 'rgba(168,85,247,0.15)', border: '1px solid rgba(168,85,247,0.2)' }}>
            <i className="fas fa-scroll text-sm" style={{ color: '#a855f7' }} />
          </div>
          <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full"
            style={{ background: 'rgba(168,85,247,0.12)', color: '#a855f7' }}>Proverb {String(idx + 1).padStart(2,'0')}</span>
        </div>
        <p className="font-display font-bold text-lg mb-3 leading-snug" style={{ color: '#F0A500' }}>{item.word}</p>
        <div className="overflow-hidden transition-all duration-400"
          style={{ maxHeight: revealed ? '200px' : '0', opacity: revealed ? 1 : 0 }}>
          <div className="pt-3 pb-1" style={{ borderTop: '1px solid rgba(255,255,255,0.07)' }}>
            <p className="text-sm leading-relaxed mb-2" style={{ color: 'rgba(255,255,255,0.8)', fontFamily: 'Poppins,sans-serif' }}>
              {item.translation}
            </p>
            {item.example && (
              <p className="text-xs italic" style={{ color: 'rgba(255,255,255,0.45)', fontFamily: 'Poppins,sans-serif' }}>{item.example}</p>
            )}
          </div>
        </div>
        <div className="flex items-center gap-2 mt-4">
          <button onClick={() => setRevealed(r => !r)}
            className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-xs font-semibold transition-all"
            style={{ background: revealed ? 'rgba(168,85,247,0.15)' : 'rgba(255,255,255,0.06)', color: revealed ? '#a855f7' : 'rgba(255,255,255,0.6)', border: '1px solid rgba(255,255,255,0.08)', fontFamily: 'Sora,sans-serif' }}>
            <i className={`fas fa-${revealed ? 'eye-slash' : 'eye'} text-[10px]`} />
            {revealed ? 'Hide meaning' : 'Reveal meaning'}
          </button>
          <button onClick={() => speak(item.word)}
            className="w-9 h-9 rounded-xl flex items-center justify-center transition-all hover:scale-110"
            style={{ background: 'rgba(240,165,0,0.1)', border: '1px solid rgba(240,165,0,0.2)' }}
            title="Listen">
            <i className="fas fa-volume-up text-xs" style={{ color: '#F0A500' }} />
          </button>
          <button onClick={copy}
            className="w-9 h-9 rounded-xl flex items-center justify-center transition-all hover:scale-110"
            style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)' }}
            title="Copy">
            <i className={`fas fa-${copied ? 'check' : 'copy'} text-xs`} style={{ color: copied ? '#22c55e' : 'rgba(255,255,255,0.5)' }} />
          </button>
        </div>
      </div>
    </div>
  )
}

function FactsCarousel() {
  const [active, setActive] = useState(0)
  useEffect(() => {
    const t = setInterval(() => setActive(a => (a + 1) % LANGUAGE_FACTS.length), 4000)
    return () => clearInterval(t)
  }, [])
  const fact = LANGUAGE_FACTS[active]
  return (
    <div>
      <div className="rounded-3xl overflow-hidden transition-all duration-500"
        style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(240,165,0,0.15)', minHeight: 200 }}>
        <div className="p-8 text-center">
          <div className="w-14 h-14 rounded-2xl flex items-center justify-center mx-auto mb-5"
            style={{ background: 'rgba(240,165,0,0.12)', border: '1px solid rgba(240,165,0,0.2)' }}>
            <i className={`fas ${fact.icon} text-2xl`} style={{ color: '#F0A500' }} />
          </div>
          <h3 className="font-display font-bold text-lg mb-3 text-white">{fact.title}</h3>
          <p className="text-sm leading-relaxed max-w-xl mx-auto" style={{ color: 'rgba(255,255,255,0.6)', fontFamily: 'Poppins,sans-serif' }}>{fact.body}</p>
        </div>
      </div>
      <div className="flex justify-center gap-2 mt-4">
        {LANGUAGE_FACTS.map((_, i) => (
          <button key={i} onClick={() => setActive(i)}
            className="rounded-full transition-all duration-300"
            style={{ width: i === active ? 24 : 8, height: 8, background: i === active ? '#F0A500' : 'rgba(255,255,255,0.2)' }} />
        ))}
      </div>
    </div>
  )
}

export default function LanguagePage() {
  const [activeCategory, setActiveCategory] = useState('greetings')
  const [flipped, setFlipped] = useState(new Set())
  const [learned, setLearned] = useState(new Set())
  const [search, setSearch] = useState('')
  const [speaking, setSpeaking] = useState(false)
  const catScrollRef = useRef(null)

  const { data, isLoading } = useQuery(
    ['vocab', activeCategory],
    () => api.get(`/vocab?category=${activeCategory === 'all' ? '' : activeCategory}`).then(r => r.data),
    { keepPreviousData: true }
  )

  const filtered = (data || []).filter(item =>
    !search ||
    item.word?.toLowerCase().includes(search.toLowerCase()) ||
    item.translation?.toLowerCase().includes(search.toLowerCase())
  )

  const toggleFlip = (id) => {
    setFlipped(prev => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else { next.add(id); setLearned(l => new Set([...l, id])) }
      return next
    })
  }

  const resetFlips = () => setFlipped(new Set())

  const speakWOD = () => {
    setSpeaking(true)
    speak(WORD_OF_DAY.pronunciation)
    setTimeout(() => setSpeaking(false), 2000)
  }

  const isProverbs = activeCategory === 'proverbs'

  return (
    <div>
      <style>{`
        @keyframes wod-pulse { 0%,100%{transform:scale(1)} 50%{transform:scale(1.04)} }
        @keyframes speak-ring { 0%{transform:scale(1);opacity:.6} 100%{transform:scale(1.6);opacity:0} }
        .wod-word { animation: wod-pulse 3s ease-in-out infinite; }
        .speak-ring { animation: speak-ring 1s ease-out infinite; }
        .cat-scroll { scrollbar-width:none; }
        .cat-scroll::-webkit-scrollbar { display:none; }
      `}</style>

      {/* ── Hero ── */}
      <div className="page-hero py-16 px-6 text-center relative overflow-hidden">
        <div className="wave-pattern absolute inset-0" />
        <div className="absolute inset-0 pointer-events-none"
          style={{ background: 'radial-gradient(ellipse 60% 50% at 50% 0%,rgba(240,165,0,0.12),transparent)' }} />
        <div className="relative max-w-4xl mx-auto">
          <div className="eyebrow justify-center mb-3" style={{ color: 'rgba(240,165,0,0.9)' }}>
            <span className="w-5 h-0.5 rounded-full inline-block mr-2" style={{ background: '#F0A500' }} />
            Heritage Language
          </div>
          <h1 className="font-display font-bold text-4xl md:text-5xl text-white mb-3">
            Learn <span style={{ color: '#F0A500' }}>Ngiemboon</span>
          </h1>
          <p className="text-sm max-w-lg mx-auto mb-8" style={{ color: 'rgba(255,255,255,0.6)', fontFamily: 'Poppins,sans-serif' }}>
            Explore words, greetings, proverbs and phrases from the Ngiemboon language — a living heritage that connects generations.
          </p>

          {/* Word of the Day */}
          <div className="inline-block rounded-3xl p-6 md:p-8 max-w-sm w-full text-left"
            style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(240,165,0,0.2)', backdropFilter: 'blur(12px)' }}>
            <div className="flex items-center justify-between mb-3">
              <span className="text-[10px] font-bold uppercase tracking-widest" style={{ color: '#F0A500', fontFamily: 'Sora,sans-serif' }}>
                Word of the Day
              </span>
              <span className="text-[10px] px-2 py-0.5 rounded-full font-semibold"
                style={{ background: CAT_COLORS.greetings.bg, color: CAT_COLORS.greetings.text }}>
                {WORD_OF_DAY.category}
              </span>
            </div>
            <p className="wod-word font-display font-bold mb-1" style={{ fontSize: 'clamp(2rem,6vw,3rem)', color: '#F0A500', lineHeight: 1.1 }}>
              {WORD_OF_DAY.word}
            </p>
            <p className="text-base font-semibold text-white mb-1">{WORD_OF_DAY.translation}</p>
            <p className="text-xs italic mb-4" style={{ color: 'rgba(255,255,255,0.45)', fontFamily: 'Poppins,sans-serif' }}>
              {WORD_OF_DAY.example}
            </p>
            <button onClick={speakWOD}
              className="relative flex items-center gap-2.5 px-4 py-2.5 rounded-xl text-sm font-semibold transition-all hover:scale-105"
              style={{ background: 'rgba(240,165,0,0.15)', color: '#F0A500', border: '1px solid rgba(240,165,0,0.25)', fontFamily: 'Sora,sans-serif' }}>
              {speaking && <span className="speak-ring absolute inset-0 rounded-xl border-2" style={{ borderColor: '#F0A500' }} />}
              <i className={`fas fa-${speaking ? 'volume-up' : 'play'} text-xs`} />
              {speaking ? 'Playing…' : `Hear "${WORD_OF_DAY.pronunciation}"`}
            </button>
          </div>

          <div className="flex items-center justify-center gap-2 text-sm mt-6" style={{ color: 'rgba(255,255,255,0.5)', fontFamily: 'Poppins,sans-serif' }}>
            <Link to="/" className="hover:text-white transition-colors flex items-center gap-1">
              <i className="fas fa-home text-xs" />Home
            </Link>
            <i className="fas fa-chevron-right text-xs" style={{ color: '#F0A500' }} />
            <span style={{ color: '#F0A500' }}>Language</span>
          </div>
        </div>
      </div>

      {/* ── Intro strip ── */}
      <section style={{ background: 'linear-gradient(135deg,#1A0A35,#250F47)' }}>
        <div className="max-w-5xl mx-auto px-6 py-10">
          <div className="grid md:grid-cols-2 gap-8 items-center">
            {/* Stats */}
            <div className="grid grid-cols-3 gap-4">
              {[
                { val: '7', label: 'Categories', icon: 'fa-th-large' },
                { val: '100+', label: 'Words', icon: 'fa-language' },
                { val: '3', label: 'Language Facts', icon: 'fa-lightbulb' },
              ].map((s, i) => (
                <div key={i} className="text-center p-4 rounded-2xl"
                  style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.07)' }}>
                  <div className="w-9 h-9 rounded-xl flex items-center justify-center mx-auto mb-2"
                    style={{ background: 'rgba(240,165,0,0.1)', border: '1px solid rgba(240,165,0,0.15)' }}>
                    <i className={`fas ${s.icon} text-sm`} style={{ color: '#F0A500' }} />
                  </div>
                  <div className="font-display font-bold text-xl text-white">{s.val}</div>
                  <div className="text-[10px] mt-0.5" style={{ color: 'rgba(255,255,255,0.45)', fontFamily: 'Poppins,sans-serif' }}>{s.label}</div>
                </div>
              ))}
            </div>
            {/* Pull quote */}
            <blockquote className="rounded-2xl p-5"
              style={{ background: 'rgba(240,165,0,0.06)', borderLeft: '4px solid #F0A500' }}>
              <p className="text-sm leading-relaxed italic mb-3" style={{ color: 'rgba(255,255,255,0.75)', fontFamily: 'Poppins,sans-serif' }}>
                "Ngiemboon is more than words — it is the philosophy, history and values of our people encoded in sound. Every proverb is a lesson; every greeting, a bond."
              </p>
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-full flex items-center justify-center"
                  style={{ background: 'linear-gradient(135deg,#F0A500,#FFB84D)' }}>
                  <i className="fas fa-quote-left text-[9px] text-white" />
                </div>
                <span className="text-xs font-semibold" style={{ color: '#F0A500', fontFamily: 'Sora,sans-serif' }}>Cultural Committee</span>
              </div>
            </blockquote>
          </div>
        </div>
      </section>

      {/* ── Flashcards ── */}
      <section className="py-16 bg-white">
        <div className="max-w-6xl mx-auto px-6">

          {/* Header row */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
            <div>
              <h2 className="font-display font-bold text-2xl" style={{ color: '#1A0A35' }}>
                {isProverbs ? 'Proverbs & Wisdom' : 'Vocabulary Flashcards'}
              </h2>
              <p className="text-xs mt-0.5" style={{ color: '#A3A3A3', fontFamily: 'Poppins,sans-serif' }}>
                {isProverbs ? 'Tap "Reveal meaning" to uncover each proverb' : 'Tap any card to flip and hear the pronunciation'}
              </p>
            </div>
            {/* Learned badge */}
            {learned.size > 0 && (
              <div className="flex items-center gap-2 px-4 py-2 rounded-2xl flex-shrink-0"
                style={{ background: 'rgba(91,45,142,0.07)', border: '1px solid rgba(91,45,142,0.12)' }}>
                <div className="w-7 h-7 rounded-xl flex items-center justify-center"
                  style={{ background: 'linear-gradient(135deg,#5B2D8E,#7B4DB8)' }}>
                  <i className="fas fa-graduation-cap text-[10px] text-white" />
                </div>
                <div>
                  <div className="font-display font-bold text-sm" style={{ color: '#5B2D8E' }}>{learned.size} learned</div>
                  <div className="text-[9px]" style={{ color: '#A3A3A3', fontFamily: 'Poppins,sans-serif' }}>this session</div>
                </div>
              </div>
            )}
          </div>

          {/* Category tabs — horizontal scroll on mobile */}
          <div ref={catScrollRef} className="cat-scroll flex gap-2 overflow-x-auto pb-2 mb-5">
            {CATEGORIES.map(cat => (
              <button key={cat.id}
                onClick={() => { setActiveCategory(cat.id); resetFlips() }}
                className="flex items-center gap-2 px-4 py-2 rounded-full text-xs font-semibold transition-all flex-shrink-0"
                style={{
                  background: activeCategory === cat.id ? 'linear-gradient(135deg,#5B2D8E,#7B4DB8)' : '#fff',
                  color: activeCategory === cat.id ? '#fff' : '#5B2D8E',
                  fontFamily: 'Sora,sans-serif',
                  boxShadow: activeCategory === cat.id ? '0 4px 16px rgba(91,45,142,0.3)' : '0 2px 8px rgba(91,45,142,0.07)',
                  border: `1.5px solid ${activeCategory === cat.id ? 'transparent' : 'rgba(91,45,142,0.1)'}`,
                }}>
                <i className={`fas ${cat.icon} text-[10px]`} />
                {cat.label}
              </button>
            ))}
          </div>

          {/* Search + reset row */}
          <div className="flex flex-col sm:flex-row gap-3 mb-8 max-w-xl">
            <div className="flex-1 relative">
              <i className="fas fa-search absolute left-4 top-1/2 -translate-y-1/2 text-xs" style={{ color: '#A3A3A3' }} />
              <input type="text" placeholder="Search words or translations…" value={search}
                onChange={e => setSearch(e.target.value)} className="input !pl-10" />
            </div>
            {flipped.size > 0 && (
              <button onClick={resetFlips}
                className="px-4 py-2 rounded-2xl text-xs font-semibold flex items-center gap-2"
                style={{ background: 'rgba(91,45,142,0.07)', color: '#5B2D8E', fontFamily: 'Sora,sans-serif', whiteSpace: 'nowrap' }}>
                <i className="fas fa-undo text-[10px]" />Reset All
              </button>
            )}
          </div>

          {/* Cards */}
          {isLoading ? (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
              {Array.from({ length: 8 }).map((_, i) => <SkeletonCard key={i} />)}
            </div>
          ) : filtered.length === 0 ? (
            <div className="text-center py-20 rounded-3xl"
              style={{ background: 'rgba(91,45,142,0.03)', border: '1px dashed rgba(91,45,142,0.12)' }}>
              <i className="fas fa-book-open text-5xl mb-4 block" style={{ color: 'rgba(91,45,142,0.18)' }} />
              <h3 className="font-display font-bold text-xl mb-2" style={{ color: '#1A0A35' }}>
                {search ? 'No matches found' : 'Vocab coming soon'}
              </h3>
              <p className="text-sm" style={{ color: '#737373', fontFamily: 'Poppins,sans-serif' }}>
                {search ? `No words match "${search}" — try a different term.` : 'Admin will add words for this category soon.'}
              </p>
              {search && (
                <button onClick={() => setSearch('')} className="mt-4 btn-secondary !py-2.5 !px-5 !text-xs">
                  Clear Search
                </button>
              )}
            </div>
          ) : isProverbs ? (
            <>
              <p className="text-xs mb-5" style={{ color: '#A3A3A3', fontFamily: 'Poppins,sans-serif' }}>
                {filtered.length} proverb{filtered.length !== 1 ? 's' : ''}
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                {filtered.map((item, idx) => <ProverbCard key={item.id} item={item} idx={idx} />)}
              </div>
            </>
          ) : (
            <>
              <p className="text-xs mb-5" style={{ color: '#A3A3A3', fontFamily: 'Poppins,sans-serif' }}>
                {filtered.length} word{filtered.length !== 1 ? 's' : ''} — tap any card to reveal the translation
              </p>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
                {filtered.map(item => (
                  <FlashCard key={item.id} item={item}
                    isFlipped={flipped.has(item.id)}
                    onFlip={() => toggleFlip(item.id)} />
                ))}
              </div>
            </>
          )}
        </div>
      </section>

      {/* ── Did You Know — auto-carousel ── */}
      <section className="py-16 relative overflow-hidden" style={{ background: 'linear-gradient(135deg,#1A0A35,#250F47)' }}>
        <div className="wave-pattern absolute inset-0" />
        <div className="relative max-w-3xl mx-auto px-6">
          <div className="text-center mb-10">
            <div className="eyebrow justify-center mb-3" style={{ color: 'rgba(240,165,0,0.85)' }}>Language Facts</div>
            <h2 className="section-title-white">Did You <span style={{ color: '#F0A500' }}>Know?</span></h2>
          </div>
          <FactsCarousel />
        </div>
      </section>

      {/* ── CTA ── */}
      <section className="py-16 relative overflow-hidden" style={{ background: 'linear-gradient(135deg,#0D0520,#1A0A35)' }}>
        <div className="wave-pattern absolute inset-0 opacity-30" />
        <div className="relative max-w-4xl mx-auto px-6">
          <div className="rounded-3xl overflow-hidden" style={{ border: '1px solid rgba(240,165,0,0.2)' }}>
            <div className="h-1.5" style={{ background: 'linear-gradient(90deg,#5B2D8E,#F0A500,#22c55e)' }} />
            <div className="p-8 md:p-12 flex flex-col md:flex-row items-center gap-8">
              <div className="w-20 h-20 rounded-3xl flex items-center justify-center flex-shrink-0"
                style={{ background: 'linear-gradient(135deg,#F0A500,#FFB84D)', boxShadow: '0 12px 40px rgba(240,165,0,0.4)' }}>
                <i className="fas fa-microphone text-3xl text-white" />
              </div>
              <div className="flex-1 text-center md:text-left">
                <h3 className="font-display font-bold text-2xl text-white mb-2">
                  Are you a native speaker?
                </h3>
                <p className="text-sm leading-relaxed mb-0" style={{ color: 'rgba(255,255,255,0.6)', fontFamily: 'Poppins,sans-serif' }}>
                  Help us grow this library. Your words, proverbs and recordings will preserve Ngiemboon for the next generation. Every contribution matters.
                </p>
              </div>
              <div className="flex flex-col gap-3 flex-shrink-0">
                <Link to="/contact" className="btn-gold whitespace-nowrap">
                  <i className="fas fa-envelope" />Contact Cultural Committee
                </Link>
                <Link to="/portal" className="btn-outline-white whitespace-nowrap text-center">
                  <i className="fas fa-user-circle" />Join as Member
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}
