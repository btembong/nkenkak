import { useState } from 'react'
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
  greetings: { bg: 'rgba(91,45,142,0.1)',   text: '#5B2D8E' },
  numbers:   { bg: 'rgba(240,165,0,0.1)',   text: '#C87800' },
  family:    { bg: 'rgba(220,38,38,0.08)',  text: '#dc2626' },
  nature:    { bg: 'rgba(22,163,74,0.1)',   text: '#16a34a' },
  customs:   { bg: 'rgba(2,132,199,0.1)',   text: '#0284c7' },
  proverbs:  { bg: 'rgba(168,85,247,0.1)',  text: '#9333ea' },
  general:   { bg: 'rgba(91,45,142,0.08)', text: '#5B2D8E' },
}

const LANGUAGE_FACTS = [
  {
    icon: 'fa-map-marked-alt',
    title: 'Grasslands Bantu Family',
    body: 'The language of Nkenkak-Ngiesang belongs to the Grasslands Bantu branch, a cluster of around 100 languages spoken across the highlands of western Cameroon — one of Africa\'s most linguistically diverse regions.',
  },
  {
    icon: 'fa-music',
    title: 'Tonal in Nature',
    body: 'Like many Grasslands languages, ours is tonal — the same syllable pronounced with a high, mid or low pitch can carry completely different meanings. Mastering tone is key to fluent speech.',
  },
  {
    icon: 'fa-book-open',
    title: 'Oral Tradition First',
    body: 'Historically transmitted through oral tradition, the language was only recently given a written orthography. Proverbs, praise poetry and historical narratives were preserved by griots and elders across generations.',
  },
]

function SkeletonCard() {
  return (
    <div className="rounded-3xl overflow-hidden animate-pulse"
      style={{ background: '#fff', border: '1px solid rgba(91,45,142,0.06)', boxShadow: '0 4px 24px rgba(91,45,142,0.07)' }}>
      <div className="h-36 rounded-t-3xl" style={{ background: 'rgba(91,45,142,0.06)' }} />
      <div className="p-4 space-y-2">
        <div className="h-3 rounded-full w-2/3" style={{ background: 'rgba(91,45,142,0.06)' }} />
        <div className="h-3 rounded-full w-1/2" style={{ background: 'rgba(91,45,142,0.04)' }} />
      </div>
    </div>
  )
}

// Pre-load voices as early as possible
if (typeof window !== 'undefined' && window.speechSynthesis) {
  window.speechSynthesis.getVoices()
}

function speak(text) {
  if (!window.speechSynthesis) return
  window.speechSynthesis.cancel()

  const fire = () => {
    const utt = new SpeechSynthesisUtterance(text)
    utt.rate = 0.78
    utt.pitch = 0.9  // lower pitch = more masculine
    const voices = window.speechSynthesis.getVoices()
    const enVoices = voices.filter(v => v.lang.startsWith('en'))
    // Male voices typically have 'Male', 'David', 'James', 'Mark', 'Daniel', 'Alex', 'Fred' in name
    const maleKeywords = /male|david|james|mark|daniel|alex|fred|george|john|tom|guy/i
    const voice =
      enVoices.find(v => maleKeywords.test(v.name) && v.lang === 'en-NG') ||
      enVoices.find(v => maleKeywords.test(v.name) && v.lang === 'en-ZA') ||
      enVoices.find(v => maleKeywords.test(v.name) && v.lang === 'en-GB') ||
      enVoices.find(v => maleKeywords.test(v.name)) ||
      enVoices.find(v => v.lang === 'en-GB') ||
      enVoices[0]
    if (voice) { utt.voice = voice; utt.lang = voice.lang }
    window.speechSynthesis.speak(utt)
  }

  const voices = window.speechSynthesis.getVoices()
  if (voices.length) {
    fire()
  } else {
    window.speechSynthesis.addEventListener('voiceschanged', fire, { once: true })
  }
}

function FlashCard({ item, isFlipped, onFlip }) {
  const colors = CAT_COLORS[item.category] || CAT_COLORS.general

  const handleFlip = () => {
    onFlip()
    if (!isFlipped) {
      // speak the pronunciation guide (ASCII-safe) so TTS doesn't choke on Unicode
      setTimeout(() => speak(item.pronunciation || item.word), 220)
    }
  }

  return (
    <div
      className="cursor-pointer"
      style={{ perspective: '1000px', minHeight: 180 }}
      onClick={handleFlip}
    >
      <div
        style={{
          position: 'relative',
          width: '100%',
          minHeight: 180,
          transformStyle: 'preserve-3d',
          transition: 'transform 0.4s ease',
          transform: isFlipped ? 'rotateY(180deg)' : 'rotateY(0deg)',
        }}
      >
        {/* FRONT */}
        <div
          style={{
            position: 'absolute',
            inset: 0,
            backfaceVisibility: 'hidden',
            WebkitBackfaceVisibility: 'hidden',
            background: 'linear-gradient(135deg,#250F47,#5B2D8E)',
            borderRadius: '1.5rem',
            border: '1px solid rgba(240,165,0,0.15)',
            boxShadow: '0 4px 24px rgba(91,45,142,0.12)',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '1.25rem',
            gap: '0.75rem',
          }}
        >
          <span
            className="text-[10px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full capitalize"
            style={{ background: colors.bg, color: colors.text }}>
            {item.category}
          </span>
          <p
            className="text-center font-display font-bold leading-tight"
            style={{ fontSize: 'clamp(1.5rem,4vw,2.2rem)', color: '#F0A500', lineHeight: 1.2 }}>
            {item.word}
          </p>
          <div className="flex items-center gap-1.5 text-xs" style={{ color: 'rgba(255,255,255,0.45)', fontFamily: 'Poppins,sans-serif' }}>
            <i className="fas fa-sync-alt text-[9px]" />Tap to flip
          </div>
        </div>

        {/* BACK */}
        <div
          style={{
            position: 'absolute',
            inset: 0,
            backfaceVisibility: 'hidden',
            WebkitBackfaceVisibility: 'hidden',
            transform: 'rotateY(180deg)',
            background: '#fff',
            borderRadius: '1.5rem',
            border: '1px solid rgba(91,45,142,0.08)',
            boxShadow: '0 4px 24px rgba(91,45,142,0.10)',
            display: 'flex',
            flexDirection: 'column',
            padding: '1.25rem',
            gap: '0.5rem',
          }}
        >
          <span
            className="text-[10px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full capitalize self-start"
            style={{ background: colors.bg, color: colors.text }}>
            {item.category}
          </span>
          <p className="font-display font-bold text-xl leading-snug" style={{ color: '#1A0A35' }}>
            {item.translation}
          </p>
          {item.pronunciation && (
            <div className="flex items-center gap-2">
              <p className="text-xs italic flex-1" style={{ color: '#5B2D8E', fontFamily: 'Poppins,sans-serif' }}>
                <i className="fas fa-volume-up mr-1" />{item.pronunciation}
              </p>
              <button
                onClick={e => { e.stopPropagation(); speak(item.pronunciation || item.word) }}
                className="w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0 transition-all hover:scale-110"
                style={{ background: 'rgba(91,45,142,0.1)', border: '1px solid rgba(91,45,142,0.2)' }}
                title="Replay pronunciation"
              >
                <i className="fas fa-redo text-[9px]" style={{ color: '#5B2D8E' }} />
              </button>
            </div>
          )}
          {item.example && (
            <p className="text-xs leading-relaxed border-t pt-2" style={{ color: '#737373', fontFamily: 'Poppins,sans-serif', borderColor: 'rgba(91,45,142,0.07)' }}>
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

export default function LanguagePage() {
  const [activeCategory, setActiveCategory] = useState('greetings')
  const [flipped, setFlipped] = useState(new Set())
  const [search, setSearch] = useState('')

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
      else next.add(id)
      return next
    })
  }

  const resetFlips = () => setFlipped(new Set())

  return (
    <div>
      {/* Hero */}
      <div className="page-hero py-20 px-6 text-center">
        <div className="eyebrow justify-center mb-3" style={{ color: 'rgba(240,165,0,0.9)' }}>
          <span className="w-5 h-0.5 rounded-full inline-block mr-2" style={{ background: '#F0A500' }} />
          Heritage Language
        </div>
        <h1 className="font-display font-bold text-4xl text-white mb-3">
          Learn Our <span style={{ color: '#F0A500' }}>Language</span>
        </h1>
        <p className="text-sm max-w-xl mx-auto mb-4" style={{ color: 'rgba(255,255,255,0.65)', fontFamily: 'Poppins,sans-serif' }}>
          Explore words, greetings, proverbs and phrases from the Ngiemboon language — a living heritage that connects generations.
        </p>
        <div className="flex items-center justify-center gap-2 text-sm" style={{ color: 'rgba(255,255,255,0.6)', fontFamily: 'Poppins,sans-serif' }}>
          <Link to="/" className="hover:text-white transition-colors flex items-center gap-1">
            <i className="fas fa-home text-xs" />Home
          </Link>
          <i className="fas fa-chevron-right text-xs" style={{ color: '#F0A500' }} />
          <span style={{ color: '#F0A500' }}>Language</span>
        </div>
      </div>

      {/* Intro */}
      <section className="py-14" style={{ background: '#FAF6EE' }}>
        <div className="max-w-4xl mx-auto px-6 text-center">
          <div className="card p-8">
            <div className="w-14 h-14 rounded-2xl flex items-center justify-center mx-auto mb-4"
              style={{ background: 'linear-gradient(135deg,#250F47,#5B2D8E)' }}>
              <i className="fas fa-language text-2xl" style={{ color: '#F0A500' }} />
            </div>
            <h2 className="section-title mb-3">The Ngiemboon <span>Language</span></h2>
            <p className="text-sm leading-relaxed max-w-2xl mx-auto" style={{ color: '#525252', fontFamily: 'Poppins,sans-serif' }}>
              Ngiemboon (also written Yemba) is a Grasslands Bantu language of the Bamileke cluster, spoken across the highlands of West Region, Cameroon. It is the mother tongue of Nkenkak-Ngiesang and scores of related villages. Rich in tonality, proverbs and poetic expression, it carries the philosophy, history and values of our people. This page is a living resource — learn a few words and carry a piece of home with you.
            </p>
          </div>
        </div>
      </section>

      {/* Flashcards */}
      <section className="py-16 bg-white">
        <div className="max-w-6xl mx-auto px-6">

          {/* Category tabs */}
          <div className="flex flex-wrap gap-2 justify-center mb-6">
            {CATEGORIES.map(cat => (
              <button key={cat.id}
                onClick={() => { setActiveCategory(cat.id); resetFlips() }}
                className="flex items-center gap-2 px-4 py-2 rounded-full text-xs font-semibold transition-all"
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

          {/* Search + controls row */}
          <div className="flex flex-col sm:flex-row gap-3 mb-8 max-w-xl mx-auto">
            <div className="flex-1 relative">
              <i className="fas fa-search absolute left-4 top-1/2 -translate-y-1/2 text-xs" style={{ color: '#A3A3A3' }} />
              <input
                type="text"
                placeholder="Search words or translations…"
                value={search}
                onChange={e => setSearch(e.target.value)}
                className="input !pl-10"
              />
            </div>
            {flipped.size > 0 && (
              <button onClick={resetFlips}
                className="px-4 py-2 rounded-2xl text-xs font-semibold flex items-center gap-2"
                style={{ background: 'rgba(91,45,142,0.07)', color: '#5B2D8E', fontFamily: 'Sora,sans-serif' }}>
                <i className="fas fa-undo text-[10px]" />Reset All
              </button>
            )}
          </div>

          {/* Cards grid */}
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
                {search
                  ? `No words match "${search}" — try a different term.`
                  : 'Check back after admin adds words for this category.'}
              </p>
              {search && (
                <button onClick={() => setSearch('')}
                  className="mt-4 btn-secondary !py-2.5 !px-5 !text-xs">
                  Clear Search
                </button>
              )}
            </div>
          ) : (
            <>
              <p className="text-center text-xs mb-5" style={{ color: '#A3A3A3', fontFamily: 'Poppins,sans-serif' }}>
                {filtered.length} word{filtered.length !== 1 ? 's' : ''} — tap any card to reveal the translation
              </p>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
                {filtered.map(item => (
                  <FlashCard
                    key={item.id}
                    item={item}
                    isFlipped={flipped.has(item.id)}
                    onFlip={() => toggleFlip(item.id)}
                  />
                ))}
              </div>
            </>
          )}
        </div>
      </section>

      {/* Did You Know */}
      <section className="py-16 relative overflow-hidden" style={{ background: 'linear-gradient(135deg,#1A0A35,#250F47)' }}>
        <div className="wave-pattern absolute inset-0" />
        <div className="relative max-w-6xl mx-auto px-6">
          <div className="text-center mb-12">
            <div className="eyebrow justify-center mb-3" style={{ color: 'rgba(240,165,0,0.85)' }}>Language Facts</div>
            <h2 className="section-title-white">
              Did You <span style={{ color: '#F0A500' }}>Know?</span>
            </h2>
          </div>
          <div className="grid md:grid-cols-3 gap-6">
            {LANGUAGE_FACTS.map((fact, i) => (
              <div key={i} className="card-dark rounded-3xl p-6">
                <div className="w-12 h-12 rounded-2xl flex items-center justify-center mb-4"
                  style={{ background: 'rgba(240,165,0,0.12)', border: '1px solid rgba(240,165,0,0.2)' }}>
                  <i className={`fas ${fact.icon} text-xl`} style={{ color: '#F0A500' }} />
                </div>
                <h3 className="font-display font-bold text-base mb-2" style={{ color: '#fff' }}>{fact.title}</h3>
                <p className="text-sm leading-relaxed" style={{ color: 'rgba(255,255,255,0.6)', fontFamily: 'Poppins,sans-serif' }}>
                  {fact.body}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-12 bg-white">
        <div className="max-w-3xl mx-auto px-6 text-center">
          <h3 className="font-display font-bold text-xl mb-2" style={{ color: '#1A0A35' }}>
            Help Preserve Our Language
          </h3>
          <p className="text-sm mb-5" style={{ color: '#737373', fontFamily: 'Poppins,sans-serif' }}>
            If you are a native speaker and wish to contribute words, proverbs or recordings, please contact the cultural committee.
          </p>
          <Link to="/contact" className="btn-secondary">
            <i className="fas fa-envelope" />Contact Cultural Committee
          </Link>
        </div>
      </section>
    </div>
  )
}
