import { useState, useEffect, useRef, useCallback } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useQuery } from 'react-query'
import { format } from 'date-fns'
import api from '../../services/api'
import {
  Search, X, Sprout, CalendarDays, Newspaper,
  Users, Images, Mail, ArrowRight, Loader2,
  Globe, MessageSquare, HandHelping, GraduationCap,
  BookOpen, Building2, Info, MapPin, Heart, ArrowUpRight,
} from 'lucide-react'

const CAT_COLORS = {
  education:'#4b0082', health:'#dc2626', water:'#0284c7', culture:'#4b0082',
  community:'#16a34a', sport:'#16a34a', fundraiser:'#d97706', governance:'#4b0082',
}

const TAB_ICON = { all: Search, project: Sprout, event: CalendarDays, news: Newspaper }

const QUICK_SECTIONS = [
  {
    label: 'Explore',
    links: [
      { label: 'Projects',      Icon: Sprout,       to: '/projects',   color: '#4b0082' },
      { label: 'Events',        Icon: CalendarDays,  to: '/events',     color: '#eeb549' },
      { label: 'News',          Icon: Newspaper,     to: '/news',       color: '#4b0082' },
      { label: 'Gallery',       Icon: Images,        to: '/gallery',    color: '#4b0082' },
      { label: 'About Village', Icon: MapPin,        to: '/culture',    color: '#eeb549' },
      { label: 'Our Team',      Icon: Users,         to: '/team',       color: '#4b0082' },
    ],
  },
  {
    label: 'Community',
    links: [
      { label: 'Diaspora',      Icon: Globe,         to: '/diaspora',   color: '#4b0082' },
      { label: 'Forum',         Icon: MessageSquare, to: '/forum',      color: '#eeb549' },
      { label: 'Volunteers',    Icon: HandHelping,   to: '/volunteers', color: '#4b0082' },
      { label: 'Scholarships',  Icon: GraduationCap, to: '/scholarships',color:'#eeb549' },
      { label: 'Directory',     Icon: Building2,     to: '/directory',  color: '#4b0082' },
      { label: 'Mentorship',    Icon: BookOpen,      to: '/mentorship', color: '#eeb549' },
    ],
  },
  {
    label: 'Organisation',
    links: [
      { label: 'Transparency',  Icon: Info,          to: '/transparency', color: '#4b0082' },
      { label: 'Donate',        Icon: Heart,         to: '/projects',   color: '#eeb549' },
      { label: 'Contact Us',    Icon: Mail,          to: '/contact',    color: '#4b0082' },
    ],
  },
]

function Kbd({ children }) {
  return (
    <kbd className="inline-flex items-center justify-center min-w-[18px] h-[18px] px-1 rounded text-[9px] font-mono font-semibold"
      style={{ background: 'rgba(75,0,130,0.06)', color: '#737373', border: '1px solid rgba(75,0,130,0.1)' }}>
      {children}
    </kbd>
  )
}

export default function SearchModal({ onClose }) {
  const [q, setQ]           = useState('')
  const [tab, setTab]       = useState('all')
  const [activeIdx, setActiveIdx] = useState(-1)
  const inputRef    = useRef(null)
  const listRef     = useRef(null)
  const navigate    = useNavigate()

  useEffect(() => { inputRef.current?.focus() }, [])

  const term = q.trim()

  const { data: projects, isFetching: pFetch } = useQuery(
    ['search-projects', term],
    () => api.get(`/projects?search=${encodeURIComponent(term)}&limit=8`).then(r => r.data.projects || r.data),
    { enabled: term.length >= 2, keepPreviousData: true }
  )
  const { data: events, isFetching: eFetch } = useQuery(
    ['search-events', term],
    () => api.get(`/events?search=${encodeURIComponent(term)}&limit=8`).then(r => r.data),
    { enabled: term.length >= 2, keepPreviousData: true }
  )
  const { data: news, isFetching: nFetch } = useQuery(
    ['search-news', term],
    () => api.get(`/news?search=${encodeURIComponent(term)}&limit=8`).then(r => r.data),
    { enabled: term.length >= 2, keepPreviousData: true }
  )

  const loading = pFetch || eFetch || nFetch

  const allResults = [
    ...(projects?.map(p => ({ type: 'project', item: p })) || []),
    ...(events?.map(e =>   ({ type: 'event',   item: e })) || []),
    ...(news?.map(n =>     ({ type: 'news',    item: n })) || []),
  ]
  const filtered = tab === 'all' ? allResults : allResults.filter(r => r.type === tab)

  /* Reset active index when results change */
  useEffect(() => { setActiveIdx(-1) }, [filtered.length, tab])

  /* Keyboard navigation */
  useEffect(() => {
    const fn = (e) => {
      if (e.key === 'Escape') { onClose(); return }
      if (filtered.length === 0) return
      if (e.key === 'ArrowDown') {
        e.preventDefault()
        setActiveIdx(i => Math.min(i + 1, filtered.length - 1))
      } else if (e.key === 'ArrowUp') {
        e.preventDefault()
        setActiveIdx(i => Math.max(i - 1, 0))
      } else if (e.key === 'Enter' && activeIdx >= 0) {
        e.preventDefault()
        const { type, item } = filtered[activeIdx]
        const to = type === 'project' ? `/projects/${item.slug}`
          : type === 'event' ? `/events/${item.slug}`
          : `/news/${item.slug}`
        navigate(to)
        onClose()
      }
    }
    window.addEventListener('keydown', fn)
    return () => window.removeEventListener('keydown', fn)
  }, [onClose, filtered, activeIdx, navigate])

  /* Scroll active item into view */
  useEffect(() => {
    if (activeIdx < 0 || !listRef.current) return
    const el = listRef.current.querySelector(`[data-idx="${activeIdx}"]`)
    el?.scrollIntoView({ block: 'nearest' })
  }, [activeIdx])

  const TABS = [
    { key: 'all',     label: 'All',      count: allResults.length },
    { key: 'project', label: 'Projects', count: projects?.length || 0 },
    { key: 'event',   label: 'Events',   count: events?.length   || 0 },
    { key: 'news',    label: 'News',     count: news?.length     || 0 },
  ]

  return (
    <div
      className="fixed inset-0 z-50 flex items-start justify-center pt-12 px-4"
      style={{ background: 'rgba(10,4,24,0.88)', backdropFilter: 'blur(10px)' }}
      onClick={onClose}>

      <div
        className="w-full max-w-xl rounded-2xl overflow-hidden shadow-2xl animate-slide-up"
        style={{ background: '#fff', border: '1px solid rgba(75,0,130,0.1)', maxHeight: '82vh', display: 'flex', flexDirection: 'column' }}
        onClick={e => e.stopPropagation()}>

        {/* ── Search bar ── */}
        <div className="flex items-center gap-3 px-4 py-3 border-b" style={{ borderColor: 'rgba(75,0,130,0.07)' }}>
          <div className="w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0"
            style={{ background: 'linear-gradient(135deg,#4b0082,#a57fc0)' }}>
            {loading
              ? <Loader2 className="w-3 h-3 text-white animate-spin" />
              : <Search className="w-3 h-3 text-white" />}
          </div>
          <input
            ref={inputRef}
            value={q}
            onChange={e => { setQ(e.target.value); setActiveIdx(-1) }}
            placeholder="Search projects, events, news…"
            className="flex-1 text-sm outline-none bg-transparent text-dark placeholder:text-neutral-400"
          />
          <div className="flex items-center gap-1.5 flex-shrink-0">
            {q && (
              <button onClick={() => { setQ(''); inputRef.current?.focus() }}
                className="w-6 h-6 rounded-md flex items-center justify-center transition-colors hover:bg-neutral-100 text-muted-foreground">
                <X className="w-3 h-3" />
              </button>
            )}
            <Kbd>Esc</Kbd>
          </div>
        </div>

        {/* ── Tabs (when results exist) ── */}
        {term.length >= 2 && (
          <div className="flex gap-1 px-3 pt-2 pb-1.5 flex-shrink-0 border-b" style={{ borderColor: 'rgba(75,0,130,0.06)' }}>
            {TABS.map(t => {
              const Icon = TAB_ICON[t.key]
              const active = tab === t.key
              return (
                <button key={t.key} onClick={() => setTab(t.key)}
                  className="flex items-center gap-1 px-2.5 py-1 rounded-lg text-[11px] font-semibold transition-all"
                  style={{
                    background: active ? 'linear-gradient(135deg,#4b0082,#a57fc0)' : 'rgba(75,0,130,0.05)',
                    color: active ? '#fff' : '#A3A3A3',
                  }}>
                  <Icon className="w-2.5 h-2.5"/>
                  {t.label}
                  {t.key !== 'all' && <span className="opacity-60 text-[9px]">{t.count}</span>}
                </button>
              )
            })}
            {loading && <Loader2 className="w-3 h-3 text-primary-500/40 animate-spin ml-auto my-auto"/>}
          </div>
        )}

        {/* ── Body ── */}
        <div className="overflow-y-auto flex-1" ref={listRef}>

          {/* No query — quick links */}
          {term.length < 2 && (
            <div className="p-4 space-y-4">
              {QUICK_SECTIONS.map(section => (
                <div key={section.label}>
                  <p className="text-[9px] font-bold uppercase tracking-[0.12em] mb-2 px-1"
                    style={{ color: 'rgba(75,0,130,0.4)' }}>{section.label}</p>
                  <div className="grid grid-cols-3 gap-1.5">
                    {section.links.map(l => (
                      <Link key={l.to} to={l.to} onClick={onClose}
                        className="flex items-center gap-2 px-2.5 py-2 rounded-xl transition-all hover:shadow-sm group"
                        style={{ background: `${l.color}07`, border: `1px solid ${l.color}12` }}>
                        <div className="w-6 h-6 rounded-lg flex items-center justify-center flex-shrink-0"
                          style={{ background: `${l.color}12` }}>
                          <l.Icon className="w-3 h-3" style={{ color: l.color }} />
                        </div>
                        <span className="text-[11px] font-semibold truncate text-dark">{l.label}</span>
                        <ArrowUpRight className="w-2.5 h-2.5 ml-auto opacity-0 group-hover:opacity-40 flex-shrink-0 transition-opacity"
                          style={{ color: l.color }}/>
                      </Link>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* No results */}
          {term.length >= 2 && !loading && filtered.length === 0 && (
            <div className="py-10 text-center px-6">
              <Search className="w-8 h-8 mx-auto mb-2" style={{ color: 'rgba(75,0,130,0.12)' }} />
              <p className="text-sm font-semibold mb-0.5 text-dark">No results for "{term}"</p>
              <p className="text-xs text-muted-foreground">Try different keywords or browse the links above.</p>
            </div>
          )}

          {/* Results list */}
          {filtered.length > 0 && (
            <div className="py-2">
              {filtered.map(({ type, item }, idx) => (
                <ResultRow
                  key={`${type}-${item.id}`}
                  type={type} item={item}
                  active={idx === activeIdx}
                  idx={idx}
                  onClose={onClose}
                  onHover={() => setActiveIdx(idx)}
                />
              ))}
            </div>
          )}
        </div>

        {/* ── Footer ── */}
        <div className="px-4 py-2 border-t flex items-center justify-between flex-shrink-0"
          style={{ borderColor: 'rgba(75,0,130,0.06)', background: 'rgba(75,0,130,0.015)' }}>
          <span className="text-[10px] text-muted-foreground">
            {term.length >= 2
              ? `${filtered.length} result${filtered.length !== 1 ? 's' : ''}`
              : `${QUICK_SECTIONS.reduce((s, sec) => s + sec.links.length, 0)} quick links`}
          </span>
          <div className="flex items-center gap-2 text-[10px] text-muted-foreground">
            <span className="flex items-center gap-1"><Kbd>↑</Kbd><Kbd>↓</Kbd> navigate</span>
            <span className="text-neutral-300">·</span>
            <span className="flex items-center gap-1"><Kbd>↵</Kbd> open</span>
            <span className="text-neutral-300">·</span>
            <span className="flex items-center gap-1"><Kbd>Esc</Kbd> close</span>
            <span className="text-neutral-300">·</span>
            <span className="flex items-center gap-1"><Kbd>Ctrl</Kbd><Kbd>K</Kbd> search</span>
          </div>
        </div>
      </div>
    </div>
  )
}

function ResultRow({ type, item, active, idx, onClose, onHover }) {
  const to = type === 'project' ? `/projects/${item.slug}`
    : type === 'event'   ? `/events/${item.slug}`
    : `/news/${item.slug}`

  const Icon = type === 'project' ? Sprout
    : type === 'event' ? CalendarDays : Newspaper

  const color = type === 'project' ? (CAT_COLORS[item.category] || '#4b0082')
    : type === 'event'   ? (CAT_COLORS[item.category] || '#eeb549')
    : '#4b0082'

  const meta = type === 'project'
    ? `${Number(item.raisedAmount || 0).toLocaleString()} XAF raised`
    : type === 'event' && item.startDate
    ? format(new Date(item.startDate), 'MMM d, yyyy')
    : type === 'news' && item.publishedAt
    ? format(new Date(item.publishedAt), 'MMM d, yyyy')
    : ''

  return (
    <Link
      to={to}
      data-idx={idx}
      onClick={onClose}
      onMouseEnter={onHover}
      className="flex items-center gap-3 mx-2 px-3 py-2 rounded-xl transition-all group"
      style={{ background: active ? 'rgba(75,0,130,0.06)' : 'transparent' }}>

      <div className="w-9 h-9 rounded-xl overflow-hidden flex items-center justify-center flex-shrink-0"
        style={{ background: `${color}12` }}>
        {item.coverImage
          ? <img src={item.coverImage} alt="" className="w-full h-full object-cover" />
          : <Icon className="w-3.5 h-3.5" style={{ color }} />}
      </div>

      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-1.5 mb-0.5">
          <span className="text-[9px] font-bold uppercase tracking-wide px-1.5 py-0.5 rounded"
            style={{ background: `${color}10`, color }}>
            {type === 'project' ? (item.category || 'project')
              : type === 'event' ? (item.category || 'event')
              : 'news'}
          </span>
        </div>
        <div className="text-[12px] font-semibold truncate leading-tight text-dark">{item.title}</div>
        {meta && <div className="text-[10px] mt-0.5 truncate text-muted-foreground">{meta}</div>}
      </div>

      <ArrowRight
        className="w-3 h-3 flex-shrink-0 transition-all"
        style={{ color, opacity: active ? 1 : 0 }}
      />
    </Link>
  )
}
