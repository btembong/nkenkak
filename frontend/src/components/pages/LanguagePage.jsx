import { useState, useEffect, useRef } from 'react'
import { Link, useNavigate } from 'react-router-dom'
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
  greetings: { bg: 'rgba(75,0,130,0.12)',  text: '#4b0082',  grad: 'linear-gradient(135deg,#4b0082,#a57fc0)' },
  numbers:   { bg: 'rgba(238,181,73,0.12)',text: '#c48b1a',  grad: 'linear-gradient(135deg,#78350f,#d97706)' },
  family:    { bg: 'rgba(220,38,38,0.1)',  text: '#dc2626',  grad: 'linear-gradient(135deg,#7f1d1d,#dc2626)' },
  nature:    { bg: 'rgba(22,163,74,0.1)',  text: '#16a34a',  grad: 'linear-gradient(135deg,#14532d,#16a34a)' },
  customs:   { bg: 'rgba(2,132,199,0.1)',  text: '#0284c7',  grad: 'linear-gradient(135deg,#0c4a6e,#0284c7)' },
  proverbs:  { bg: 'rgba(147,51,234,0.1)', text: '#9333ea',  grad: 'linear-gradient(135deg,#4c1d95,#9333ea)' },
  general:   { bg: 'rgba(75,0,130,0.08)', text: '#4b0082',  grad: 'linear-gradient(135deg,#2d004e,#4b0082)' },
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
      style={{ background: '#fff', border: '1px solid rgba(75,0,130,0.06)', minHeight: 180 }}>
      <div className="h-28 rounded-t-3xl" style={{ background: 'rgba(75,0,130,0.06)' }} />
      <div className="p-4 space-y-2">
        <div className="h-3 rounded-full w-2/3" style={{ background: 'rgba(75,0,130,0.06)' }} />
        <div className="h-3 rounded-full w-1/2" style={{ background: 'rgba(75,0,130,0.04)' }} />
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
          background: 'linear-gradient(135deg,#2d004e,#4b0082)',
          borderRadius: '1.5rem', border: '1px solid rgba(238,181,73,0.15)',
          boxShadow: '0 4px 24px rgba(75,0,130,0.15)',
          display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
          padding: '1.25rem', gap: '0.75rem',
        }}>
          <span className="text-[10px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full capitalize"
            style={{ background: colors.bg, color: colors.text }}>{item.category}</span>
          <p className="text-center font-display font-bold leading-tight"
            style={{ fontSize: 'clamp(1.4rem,4vw,2rem)', color: '#eeb549', lineHeight: 1.2 }}>{item.word}</p>
          <div className="flex items-center gap-1.5 text-xs" style={{ color: 'rgba(255,255,255,0.4)', fontFamily: 'Poppins,sans-serif' }}>
            <i className="fas fa-sync-alt text-[9px]" />Tap to flip
          </div>
        </div>
        {/* BACK */}
        <div style={{
          position: 'absolute', inset: 0, backfaceVisibility: 'hidden', WebkitBackfaceVisibility: 'hidden',
          transform: 'rotateY(180deg)', background: '#fff',
          borderRadius: '1.5rem', border: '1px solid rgba(75,0,130,0.08)',
          boxShadow: '0 4px 24px rgba(75,0,130,0.10)',
          display: 'flex', flexDirection: 'column', padding: '1.25rem', gap: '0.5rem',
        }}>
          <span className="text-[10px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full capitalize self-start"
            style={{ background: colors.bg, color: colors.text }}>{item.category}</span>
          <p className="font-display font-bold text-xl leading-snug" style={{ color: '#1A0A35' }}>{item.translation}</p>
          {item.pronunciation && (
            <div className="flex items-center gap-2">
              <p className="text-xs italic flex-1" style={{ color: '#4b0082', fontFamily: 'Poppins,sans-serif' }}>
                <i className="fas fa-volume-up mr-1" />{item.pronunciation}
              </p>
              <button onClick={e => { e.stopPropagation(); speak(item.pronunciation || item.word) }}
                className="w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0 transition-all hover:scale-110"
                style={{ background: 'rgba(75,0,130,0.1)', border: '1px solid rgba(75,0,130,0.2)' }}>
                <i className="fas fa-redo text-[9px]" style={{ color: '#4b0082' }} />
              </button>
            </div>
          )}
          {item.example && (
            <p className="text-xs leading-relaxed border-t pt-2"
              style={{ color: '#737373', fontFamily: 'Poppins,sans-serif', borderColor: 'rgba(75,0,130,0.07)' }}>
              <span className="font-semibold" style={{ color: '#4b0082' }}>e.g.</span> {item.example}
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

/* ─── Quiz Room ─── */
const QUIZ_MODULES = [
  { id: 'greetings', label: 'Greetings',        category: 'greetings', count: 8,  icon: 'fa-handshake',    colorA: '#3b0764', colorB: '#6d28d9', difficulty: 'Beginner',     description: 'Essential greetings and daily expressions' },
  { id: 'numbers',   label: 'Numbers',          category: 'numbers',   count: 8,  icon: 'fa-hashtag',      colorA: '#78350f', colorB: '#d97706', difficulty: 'Beginner',     description: 'Count and express quantities in Ngiemboon' },
  { id: 'family',    label: 'Family & Kin',     category: 'family',    count: 8,  icon: 'fa-users',        colorA: '#7f1d1d', colorB: '#dc2626', difficulty: 'Beginner',     description: 'Family members and relationship terms' },
  { id: 'nature',    label: 'Nature',           category: 'nature',    count: 8,  icon: 'fa-leaf',         colorA: '#14532d', colorB: '#16a34a', difficulty: 'Intermediate', description: 'Plants, animals and the natural landscape' },
  { id: 'customs',   label: 'Customs',          category: 'customs',   count: 8,  icon: 'fa-drum',         colorA: '#0c4a6e', colorB: '#0284c7', difficulty: 'Intermediate', description: 'Traditions, ceremonies and community life' },
  { id: 'proverbs',  label: 'Proverbs',         category: 'proverbs',  count: 6,  icon: 'fa-scroll',       colorA: '#4c1d95', colorB: '#9333ea', difficulty: 'Advanced',     description: 'Ancient wisdom — match proverb to meaning' },
  { id: 'mixed',     label: 'Mixed Challenge',  category: '',          count: 15, icon: 'fa-layer-group',  colorA: '#1a0035', colorB: '#4b0082', difficulty: 'All Levels',  description: 'All categories — the ultimate test' },
]

const DIFF_BADGE = {
  'Beginner':     { label: 'Beginner',     dot: '#22c55e' },
  'Intermediate': { label: 'Intermediate', dot: '#f59e0b' },
  'Advanced':     { label: 'Advanced',     dot: '#f87171' },
  'All Levels':   { label: 'All Levels',   dot: '#a78bfa' },
}

const LETTERS = ['A', 'B', 'C', 'D']

function buildQuizQuestions(vocab, count) {
  if (!vocab || vocab.length < 2) return []
  const shuffled = [...vocab].sort(() => Math.random() - 0.5)
  return shuffled.slice(0, Math.min(count, vocab.length)).map(item => {
    const reverse = vocab.length >= 4 && Math.random() > 0.65
    const wrong   = vocab.filter(w => w.id !== item.id).sort(() => Math.random() - 0.5).slice(0, 3)
    if (reverse) {
      return {
        item,
        prompt:      item.translation,
        promptSub:   null,
        promptLabel: 'Which Ngiemboon word means this?',
        options:     [{ id: item.id, answer: item.word }, ...wrong.map(w => ({ id: w.id, answer: w.word }))].sort(() => Math.random() - 0.5),
        correctId:   item.id,
        isReverse:   true,
      }
    }
    return {
      item,
      prompt:      item.word,
      promptSub:   item.pronunciation ? `/${item.pronunciation}/` : null,
      promptLabel: 'What does this word mean?',
      options:     [{ id: item.id, answer: item.translation }, ...wrong.map(w => ({ id: w.id, answer: w.translation }))].sort(() => Math.random() - 0.5),
      correctId:   item.id,
      isReverse:   false,
    }
  })
}

function QuizRoom({ onExit }) {
  const [phase,        setPhase]        = useState('lobby')
  const [activeModule, setActiveModule] = useState(null)
  const [hoveredMod,   setHoveredMod]   = useState(null)
  const [questions,    setQuestions]    = useState([])
  const [idx,          setIdx]          = useState(0)
  const [selected,     setSelected]     = useState(undefined)
  const [score,        setScore]        = useState(0)
  const [streak,       setStreak]       = useState(0)
  const [maxStreak,    setMaxStreak]    = useState(0)
  const [hearts,       setHearts]       = useState(3)
  const [timer,        setTimer]        = useState(15)
  const [answers,      setAnswers]      = useState([])
  const [countdown,    setCountdown]    = useState(3)
  const timerRef = useRef(null)

  const cat = activeModule?.category ?? ''
  const { data: moduleVocab, isLoading: loadingVocab } = useQuery(
    ['quiz-vocab', cat],
    () => api.get(`/vocab?category=${cat}`).then(r => r.data),
    { enabled: phase === 'lobby' && !!activeModule, staleTime: 60000 }
  )

  useEffect(() => {
    if (phase !== 'lobby' || !activeModule || !moduleVocab || loadingVocab) return
    const qs = buildQuizQuestions(moduleVocab, activeModule.count)
    if (qs.length < 2) return
    setQuestions(qs); setCountdown(3); setPhase('countdown')
  }, [moduleVocab, loadingVocab, activeModule, phase])

  useEffect(() => {
    if (phase !== 'countdown') return
    if (countdown === 0) {
      setIdx(0); setScore(0); setStreak(0); setMaxStreak(0)
      setHearts(3); setAnswers([]); setSelected(undefined); setTimer(15)
      setPhase('playing'); return
    }
    const t = setTimeout(() => setCountdown(n => n - 1), 900)
    return () => clearTimeout(t)
  }, [phase, countdown])

  useEffect(() => {
    if (phase !== 'playing' || selected !== undefined) return
    if (timer === 0) { handleAnswer(null); return }
    timerRef.current = setTimeout(() => setTimer(t => t - 1), 1000)
    return () => clearTimeout(timerRef.current)
  })

  const handleAnswer = (opt) => {
    if (selected !== undefined) return
    clearTimeout(timerRef.current)
    const q   = questions[idx]
    const hit = opt !== null && opt?.id === q.correctId
    setSelected(opt)
    setAnswers(prev => [...prev, { correct: hit, elapsed: 15 - timer }])
    if (hit) {
      setScore(s => s + Math.max(50, (timer + 1) * 10))
      const ns = streak + 1; setStreak(ns); setMaxStreak(m => Math.max(m, ns))
      speak(q.item.pronunciation || q.item.word)
    } else {
      setStreak(0); setHearts(h => Math.max(0, h - 1))
    }
    const isLast   = idx === questions.length - 1
    const gameOver = !hit && hearts - 1 === 0
    setTimeout(() => {
      if (isLast || gameOver) setPhase('results')
      else { setIdx(i => i + 1); setSelected(undefined); setTimer(15) }
    }, 1100)
  }

  const restart = () => {
    if (!moduleVocab) return
    setQuestions(buildQuizQuestions(moduleVocab, activeModule.count))
    setCountdown(3); setPhase('countdown')
  }

  /* ══ LOBBY ══ */
  if (phase === 'lobby') return (
    <div>
      <div className="flex items-center justify-between mb-7">
        <div>
          <h3 className="font-display font-bold text-2xl" style={{ color: '#1A0A35' }}>Quiz Room</h3>
          <p className="text-xs mt-0.5" style={{ color: '#A3A3A3', fontFamily: 'Poppins,sans-serif' }}>
            Choose a module and test your Ngiemboon knowledge
          </p>
        </div>
        <button onClick={onExit}
          className="flex items-center gap-1.5 text-xs font-semibold px-3.5 py-2 rounded-xl transition-all"
          style={{ background: 'rgba(75,0,130,0.07)', color: '#4b0082', border: '1px solid rgba(75,0,130,0.12)', fontFamily: 'Sora,sans-serif' }}>
          <i className="fas fa-times text-[10px]" /> Exit
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {QUIZ_MODULES.map(mod => {
          const badge     = DIFF_BADGE[mod.difficulty]
          const isActive  = activeModule?.id === mod.id
          const isLoading = isActive && loadingVocab
          const isHovered = hoveredMod === mod.id
          return (
            <button
              key={mod.id}
              onClick={() => setActiveModule(mod)}
              onMouseEnter={() => setHoveredMod(mod.id)}
              onMouseLeave={() => setHoveredMod(null)}
              disabled={isLoading}
              className="text-left rounded-2xl overflow-hidden transition-all duration-200 relative group"
              style={{
                boxShadow: isHovered || isActive
                  ? `0 12px 32px ${mod.colorB}30`
                  : '0 2px 10px rgba(0,0,0,0.06)',
                transform: isHovered && !isLoading ? 'translateY(-3px)' : 'none',
                border: `1.5px solid ${isActive ? mod.colorB : 'transparent'}`,
              }}>

              {/* Coloured header with monochrome icon */}
              <div className="relative flex items-center justify-center overflow-hidden"
                style={{ height: 100, background: `linear-gradient(135deg,${mod.colorA},${mod.colorB})` }}>
                <div className="wave-pattern absolute inset-0 opacity-20" />
                {/* difficulty badge — top right */}
                <span className="absolute top-3 right-3 flex items-center gap-1 text-[10px] font-bold px-2.5 py-1 rounded-full"
                  style={{ background: 'rgba(255,255,255,0.15)', color: '#fff', fontFamily: 'Sora,sans-serif', backdropFilter: 'blur(4px)' }}>
                  <span className="w-1.5 h-1.5 rounded-full inline-block" style={{ background: badge.dot }} />
                  {badge.label}
                </span>
                {/* icon — centred circle */}
                <div className="relative w-14 h-14 rounded-full flex items-center justify-center"
                  style={{ background: 'rgba(255,255,255,0.15)', border: '1.5px solid rgba(255,255,255,0.25)' }}>
                  <i className={`fas ${mod.icon} text-2xl text-white`} />
                </div>
                {/* loading spinner overlay */}
                {isLoading && (
                  <div className="absolute inset-0 flex items-center justify-center" style={{ background: `${mod.colorA}cc` }}>
                    <i className="fas fa-spinner animate-spin text-2xl text-white" />
                  </div>
                )}
              </div>

              {/* Card body */}
              <div className="bg-white px-5 py-4">
                <h4 className="font-display font-bold text-sm mb-1 truncate" style={{ color: '#1A0A35' }}>{mod.label}</h4>
                <p className="text-xs leading-relaxed mb-4" style={{ color: '#737373', fontFamily: 'Poppins,sans-serif', minHeight: 32 }}>{mod.description}</p>
                {/* Meta row */}
                <div className="flex items-center gap-3">
                  {[
                    { icon: 'fa-list-ol',    label: `${mod.count} questions` },
                    { icon: 'fa-clock',      label: '15 s / Q'              },
                    { icon: 'fa-heart',      label: '3 lives'               },
                  ].map((m, i) => (
                    <span key={i} className="flex items-center gap-1 text-[10px] font-semibold"
                      style={{ color: mod.colorB, fontFamily: 'Sora,sans-serif' }}>
                      <i className={`fas ${m.icon} text-[9px]`} />{m.label}
                    </span>
                  ))}
                </div>
                {/* Start arrow — slides in on hover */}
                <div className="mt-3 flex items-center gap-1.5 text-xs font-bold transition-all duration-200"
                  style={{ color: mod.colorB, opacity: isHovered || isActive ? 1 : 0, transform: isHovered || isActive ? 'translateX(0)' : 'translateX(-6px)', fontFamily: 'Sora,sans-serif' }}>
                  <i className="fas fa-play text-[9px]" /> Start module
                </div>
              </div>
            </button>
          )
        })}
      </div>
    </div>
  )

  /* ══ COUNTDOWN ══ */
  if (phase === 'countdown') {
    const mod = activeModule
    return (
      <div className="rounded-3xl overflow-hidden" style={{ minHeight: 380 }}>
        {/* Module banner */}
        <div className="relative flex flex-col items-center justify-center py-10 overflow-hidden"
          style={{ background: `linear-gradient(135deg,${mod.colorA},${mod.colorB})`, minHeight: 200 }}>
          <div className="wave-pattern absolute inset-0 opacity-20" />
          <div className="relative flex flex-col items-center gap-4">
            <div className="w-16 h-16 rounded-full flex items-center justify-center"
              style={{ background: 'rgba(255,255,255,0.15)', border: '1.5px solid rgba(255,255,255,0.3)' }}>
              <i className={`fas ${mod.icon} text-3xl text-white`} />
            </div>
            <div className="text-center">
              <p className="text-white font-display font-bold text-xl">{mod.label}</p>
              <p className="text-xs mt-1" style={{ color: 'rgba(255,255,255,0.55)', fontFamily: 'Poppins,sans-serif' }}>
                {questions.length} questions · 3 lives · 15 s per question
              </p>
            </div>
          </div>
        </div>
        {/* Countdown number */}
        <div className="bg-white flex flex-col items-center justify-center py-10">
          <p className="text-xs font-bold uppercase tracking-widest mb-3"
            style={{ color: '#A3A3A3', fontFamily: 'Sora,sans-serif' }}>Get ready in</p>
          <div className="font-display font-bold"
            style={{ fontSize: '5rem', color: countdown === 0 ? '#16a34a' : '#1A0A35', lineHeight: 1, animation: 'wod-pulse 0.85s ease-in-out infinite' }}>
            {countdown === 0 ? 'GO!' : countdown}
          </div>
        </div>
      </div>
    )
  }

  /* ══ RESULTS ══ */
  if (phase === 'results') {
    const correct = answers.filter(a => a.correct).length
    const pct     = Math.round((correct / answers.length) * 100)
    const grade   = pct >= 90 ? 'S' : pct >= 75 ? 'A' : pct >= 55 ? 'B' : pct >= 35 ? 'C' : 'D'
    const gc      = { S: '#eeb549', A: '#16a34a', B: '#4b0082', C: '#d97706', D: '#dc2626' }[grade]
    const avgTime = answers.length ? (answers.reduce((s, a) => s + a.elapsed, 0) / answers.length).toFixed(1) : 0
    const mod     = activeModule
    return (
      <div>
        {/* Result card */}
        <div className="rounded-2xl overflow-hidden mb-5 shadow-lg">
          {/* Module colour header */}
          <div className="relative flex items-center justify-between px-6 py-5 overflow-hidden"
            style={{ background: `linear-gradient(135deg,${mod.colorA},${mod.colorB})` }}>
            <div className="wave-pattern absolute inset-0 opacity-15" />
            <div className="relative flex items-center gap-3">
              <div className="w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0"
                style={{ background: 'rgba(255,255,255,0.15)' }}>
                <i className={`fas ${mod.icon} text-lg text-white`} />
              </div>
              <div>
                <p className="font-bold text-sm text-white">{mod.label}</p>
                <p className="text-[10px]" style={{ color: 'rgba(255,255,255,0.55)', fontFamily: 'Poppins,sans-serif' }}>Module Complete</p>
              </div>
            </div>
            {/* Grade badge */}
            <div className="relative w-16 h-16 rounded-2xl flex items-center justify-center font-display font-bold text-3xl"
              style={{ background: 'rgba(255,255,255,0.12)', border: '1.5px solid rgba(255,255,255,0.25)', color: gc }}>
              {grade}
            </div>
          </div>
          {/* Score + stats */}
          <div className="bg-white">
            <div className="px-6 py-5 text-center border-b border-gray-50">
              <div className="font-display font-bold text-4xl" style={{ color: '#1A0A35' }}>{score.toLocaleString()}</div>
              <div className="text-xs mt-1" style={{ color: '#A3A3A3', fontFamily: 'Poppins,sans-serif' }}>total points</div>
            </div>
            <div className="grid grid-cols-3 divide-x divide-gray-50">
              {[
                { icon: 'fa-check-circle', label: 'Correct',    value: `${correct}/${answers.length}`, sub: `${pct}%`,   color: '#16a34a' },
                { icon: 'fa-fire',         label: 'Best Streak',value: `${maxStreak}×`,                sub: 'in a row',  color: '#eeb549' },
                { icon: 'fa-tachometer-alt',label:'Avg Speed',  value: `${avgTime}s`,                  sub: 'per Q',     color: mod.colorB },
              ].map((s, i) => (
                <div key={i} className="px-3 py-4 text-center">
                  <i className={`fas ${s.icon} text-sm mb-1.5 block`} style={{ color: s.color }} />
                  <div className="font-display font-bold text-base" style={{ color: '#1A0A35' }}>{s.value}</div>
                  <div className="text-[9px] uppercase tracking-wide" style={{ color: '#A3A3A3', fontFamily: 'Sora,sans-serif' }}>{s.label}</div>
                  <div className="text-[10px]" style={{ color: s.color, fontFamily: 'Poppins,sans-serif' }}>{s.sub}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
        <div className="flex gap-2.5 flex-wrap">
          <button onClick={restart} className="btn-secondary !py-2.5 !px-5 !text-sm flex-1">
            <i className="fas fa-redo text-xs" /> Retry
          </button>
          <button onClick={() => { setActiveModule(null); setPhase('lobby') }}
            className="flex-1 flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold transition-all"
            style={{ background: 'rgba(75,0,130,0.07)', color: '#4b0082', border: '1px solid rgba(75,0,130,0.12)', fontFamily: 'Sora,sans-serif' }}>
            <i className="fas fa-th-large text-xs" /> Modules
          </button>
          <button onClick={onExit}
            className="px-5 py-2.5 rounded-xl text-sm font-semibold"
            style={{ background: 'rgba(0,0,0,0.04)', color: '#A3A3A3', fontFamily: 'Sora,sans-serif' }}>
            Exit
          </button>
        </div>
      </div>
    )
  }

  /* ══ PLAYING ══ */
  const q        = questions[idx]
  if (!q) return null
  const mod      = activeModule
  const timerPct = (timer / 15) * 100
  const timerCol = timer > 8 ? mod.colorB : timer > 4 ? '#d97706' : '#dc2626'

  return (
    <div>
      {/* Module strip */}
      <div className="flex items-center gap-2 mb-3 px-0.5">
        <div className="w-6 h-6 rounded-lg flex items-center justify-center flex-shrink-0"
          style={{ background: `linear-gradient(135deg,${mod.colorA},${mod.colorB})` }}>
          <i className={`fas ${mod.icon} text-[10px] text-white`} />
        </div>
        <span className="text-xs font-semibold" style={{ color: '#737373', fontFamily: 'Sora,sans-serif' }}>{mod.label}</span>
        <span className="ml-auto text-xs font-semibold" style={{ color: '#A3A3A3', fontFamily: 'Sora,sans-serif' }}>
          {idx + 1} <span style={{ color: '#ddd' }}>/ {questions.length}</span>
        </span>
      </div>

      {/* HUD — hearts / timer number / streak */}
      <div className="flex items-center justify-between mb-2 px-0.5">
        <div className="flex items-center gap-1">
          {[0,1,2].map(i => (
            <i key={i} className="fas fa-heart text-sm transition-all duration-200"
              style={{ color: i < hearts ? '#ef4444' : 'rgba(0,0,0,0.1)' }} />
          ))}
        </div>
        <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full transition-all"
          style={{ background: streak >= 2 ? 'rgba(238,181,73,0.1)' : 'transparent' }}>
          <i className="fas fa-fire text-xs" style={{ color: streak >= 2 ? '#eeb549' : '#e5e5e5' }} />
          <span className="text-xs font-bold" style={{ color: streak >= 2 ? '#eeb549' : '#d4d4d4', fontFamily: 'Sora,sans-serif' }}>{streak}</span>
        </div>
      </div>

      {/* Animated timer bar */}
      <div className="h-1.5 rounded-full mb-5 overflow-hidden" style={{ background: 'rgba(0,0,0,0.06)' }}>
        <div className="h-full rounded-full transition-[width] duration-[1000ms] linear transition-[background] duration-300"
          style={{ width: `${timerPct}%`, background: timerCol }} />
      </div>

      {/* Question card */}
      <div className="rounded-2xl relative overflow-hidden mb-5"
        style={{ background: `linear-gradient(135deg,${mod.colorA},${mod.colorB})`, minHeight: 148 }}>
        <div className="wave-pattern absolute inset-0 opacity-20" />
        <div className="relative flex flex-col items-center justify-center text-center p-7 gap-2">
          <p className="text-[10px] font-bold uppercase tracking-widest"
            style={{ color: 'rgba(255,255,255,0.45)', fontFamily: 'Sora,sans-serif' }}>{q.promptLabel}</p>
          <p className="font-display font-bold leading-tight"
            style={{ fontSize: q.isReverse ? '1.5rem' : 'clamp(1.8rem,5vw,2.5rem)', color: '#eeb549' }}>
            {q.prompt}
          </p>
          {q.promptSub && (
            <p className="text-sm italic" style={{ color: 'rgba(255,255,255,0.38)', fontFamily: 'Poppins,sans-serif' }}>{q.promptSub}</p>
          )}
          {/* Countdown in top-right */}
          <div className="absolute top-3 right-4 font-bold text-base"
            style={{ color: timer <= 4 ? '#f87171' : timer <= 8 ? '#fbbf24' : 'rgba(255,255,255,0.25)', fontFamily: 'Sora,sans-serif' }}>
            {timer}
          </div>
        </div>
      </div>

      {/* Answer options */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
        {q.options.map((opt, i) => {
          const isCorrect = opt.id === q.correctId
          const isChosen  = selected !== undefined && selected?.id === opt.id
          const revealed  = selected !== undefined

          let cardBg = '#fff', cardBorder = 'rgba(0,0,0,0.08)', cardColor = '#1A0A35'
          let badgeBg = 'rgba(75,0,130,0.08)', badgeColor = '#4b0082'

          if (revealed) {
            if (isCorrect)     { cardBg = '#f0fdf4'; cardBorder = '#86efac'; cardColor = '#15803d'; badgeBg = '#22c55e'; badgeColor = '#fff' }
            else if (isChosen) { cardBg = '#fef2f2'; cardBorder = '#fca5a5'; cardColor = '#b91c1c'; badgeBg = '#ef4444'; badgeColor = '#fff' }
            else               { cardBg = '#fafafa'; cardBorder = 'rgba(0,0,0,0.05)'; cardColor = '#d4d4d4'; badgeBg = 'rgba(0,0,0,0.04)'; badgeColor = '#d4d4d4' }
          }

          return (
            <button key={opt.id} onClick={() => handleAnswer(opt)} disabled={revealed}
              className="flex items-center gap-3.5 text-left font-semibold text-sm transition-all duration-150 rounded-xl px-4 py-4 group/opt"
              style={{
                background: cardBg,
                border: `1.5px solid ${cardBorder}`,
                color: cardColor,
                cursor: revealed ? 'default' : 'pointer',
                boxShadow: !revealed ? '0 1px 4px rgba(0,0,0,0.05)' : 'none',
              }}>
              {/* Letter badge */}
              <span className="w-8 h-8 rounded-lg flex items-center justify-center text-xs font-bold flex-shrink-0 transition-all"
                style={{ background: badgeBg, color: badgeColor, fontFamily: 'Sora,sans-serif' }}>
                {revealed && isCorrect  ? <i className="fas fa-check text-[10px]" />
               : revealed && isChosen   ? <i className="fas fa-times text-[10px]" />
               : LETTERS[i]}
              </span>
              <span className="flex-1 leading-snug" style={{ fontFamily: 'Sora,sans-serif' }}>{opt.answer}</span>
            </button>
          )
        })}
      </div>

      {/* Score + streak footer */}
      <div className="flex items-center justify-between mt-4 px-0.5">
        <span className="text-xs" style={{ color: '#A3A3A3', fontFamily: 'Poppins,sans-serif' }}>
          Score <strong style={{ color: '#1A0A35' }}>{score.toLocaleString()}</strong>
        </span>
        {streak >= 3 && (
          <span className="flex items-center gap-1 text-xs font-bold px-2.5 py-1 rounded-full"
            style={{ background: 'rgba(238,181,73,0.1)', color: '#d97706', fontFamily: 'Sora,sans-serif' }}>
            <i className="fas fa-fire text-[10px]" /> {streak}× streak!
          </span>
        )}
      </div>
    </div>
  )
}

export default function LanguagePage() {
  const navigate = useNavigate()
  const [activeCategory, setActiveCategory] = useState('greetings')
  const [flipped, setFlipped] = useState(new Set())
  const [learned, setLearned] = useState(new Set())
  const [search, setSearch] = useState('')
  const [speaking, setSpeaking] = useState(false)
  const [quizMode, setQuizMode] = useState(false)
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
          {/* Back button */}
          <button
            onClick={() => navigate(-1)}
            className="flex items-center gap-2 text-xs font-semibold mb-6 px-3.5 py-2 rounded-full transition-all hover:bg-white/15"
            style={{ color: 'rgba(255,255,255,0.6)', background: 'rgba(255,255,255,0.07)', border: '1px solid rgba(255,255,255,0.12)', fontFamily: 'Sora,sans-serif' }}>
            <i className="fas fa-arrow-left text-[10px]" />
            Back
          </button>

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
                {isProverbs ? 'Proverbs & Wisdom' : quizMode ? 'Quiz Mode' : 'Vocabulary Flashcards'}
              </h2>
              <p className="text-xs mt-0.5" style={{ color: '#A3A3A3', fontFamily: 'Poppins,sans-serif' }}>
                {isProverbs ? 'Tap "Reveal meaning" to uncover each proverb' : quizMode ? 'Pick the correct translation for each word' : 'Tap any card to flip and hear the pronunciation'}
              </p>
            </div>
            <div className="flex items-center gap-3 flex-shrink-0 flex-wrap">
              {/* Learned badge */}
              {!quizMode && learned.size > 0 && (
                <div className="flex items-center gap-2 px-4 py-2 rounded-2xl"
                  style={{ background: 'rgba(75,0,130,0.07)', border: '1px solid rgba(75,0,130,0.12)' }}>
                  <div className="w-7 h-7 rounded-xl flex items-center justify-center"
                    style={{ background: 'linear-gradient(135deg,#4b0082,#a57fc0)' }}>
                    <i className="fas fa-graduation-cap text-[10px] text-white" />
                  </div>
                  <div>
                    <div className="font-display font-bold text-sm" style={{ color: '#4b0082' }}>{learned.size} learned</div>
                    <div className="text-[9px]" style={{ color: '#A3A3A3', fontFamily: 'Poppins,sans-serif' }}>this session</div>
                  </div>
                </div>
              )}
              {/* Quiz toggle */}
              {!isProverbs && (
                <button
                  onClick={() => { setQuizMode(q => !q); setSearch('') }}
                  className="flex items-center gap-2 px-4 py-2.5 rounded-2xl text-xs font-semibold transition-all"
                  style={quizMode
                    ? { background: 'linear-gradient(135deg,#4b0082,#a57fc0)', color: '#fff', boxShadow: '0 4px 16px rgba(75,0,130,0.25)', fontFamily: 'Sora,sans-serif' }
                    : { background: 'rgba(75,0,130,0.08)', color: '#4b0082', border: '1.5px solid rgba(75,0,130,0.15)', fontFamily: 'Sora,sans-serif' }}>
                  <i className={`fas fa-${quizMode ? 'times' : 'bolt'} text-[10px]`} />
                  {quizMode ? 'Exit Quiz' : 'Quiz Mode'}
                </button>
              )}
            </div>
          </div>

          {/* Quiz room — full replacement of the cards section */}
          {quizMode && !isProverbs && (
            <QuizRoom onExit={() => setQuizMode(false)} />
          )}

          {/* Category tabs — hidden in quiz mode */}
          <div ref={catScrollRef} className={`cat-scroll flex gap-2 overflow-x-auto pb-2 mb-5 ${quizMode ? 'hidden' : ''}`}>
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

          {/* Search + reset row — hidden in quiz mode */}
          <div className={`flex flex-col sm:flex-row gap-3 mb-8 max-w-xl ${quizMode ? 'hidden' : ''}`}>
            <div className="flex-1 relative">
              <i className="fas fa-search absolute left-4 top-1/2 -translate-y-1/2 text-xs" style={{ color: '#A3A3A3' }} />
              <input type="text" placeholder="Search words or translations…" value={search}
                onChange={e => setSearch(e.target.value)} className="input !pl-10" />
            </div>
            {flipped.size > 0 && (
              <button onClick={resetFlips}
                className="px-4 py-2 rounded-2xl text-xs font-semibold flex items-center gap-2"
                style={{ background: 'rgba(75,0,130,0.07)', color: '#4b0082', fontFamily: 'Sora,sans-serif', whiteSpace: 'nowrap' }}>
                <i className="fas fa-undo text-[10px]" />Reset All
              </button>
            )}
          </div>

          {/* Cards — hidden in quiz mode */}
          {!quizMode && (isLoading ? (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
              {Array.from({ length: 8 }).map((_, i) => <SkeletonCard key={i} />)}
            </div>
          ) : filtered.length === 0 ? (
            <div className="text-center py-20 rounded-3xl"
              style={{ background: 'rgba(75,0,130,0.03)', border: '1px dashed rgba(75,0,130,0.12)' }}>
              <i className="fas fa-book-open text-5xl mb-4 block" style={{ color: 'rgba(75,0,130,0.18)' }} />
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
          ))}
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
