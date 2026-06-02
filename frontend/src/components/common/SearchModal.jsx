import { useState, useEffect, useRef } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useQuery } from 'react-query'
import { format } from 'date-fns'
import api from '../../services/api'
import {
  Search, X, Sprout, CalendarDays, Newspaper,
  Users, Images, Mail, ArrowRight, Loader2,
} from 'lucide-react'

const CAT_COLORS = {
  education:'#5B2D8E', health:'#dc2626', water:'#0284c7', culture:'#7c3aed',
  community:'#16a34a', sport:'#16a34a', fundraiser:'#d97706', governance:'#374151',
}

const TAB_ICON = { all: Search, project: Sprout, event: CalendarDays, news: Newspaper }

const QUICK_LINKS = [
  { label: 'All Projects', Icon: Sprout,      to: '/projects',  color: '#5B2D8E' },
  { label: 'Events',       Icon: CalendarDays, to: '/events',    color: '#F0A500' },
  { label: 'Latest News',  Icon: Newspaper,    to: '/news',      color: '#5B2D8E' },
  { label: 'Our Team',     Icon: Users,        to: '/team',      color: '#F0A500' },
  { label: 'Gallery',      Icon: Images,       to: '/gallery',   color: '#5B2D8E' },
  { label: 'Contact Us',   Icon: Mail,         to: '/contact',   color: '#F0A500' },
]

export default function SearchModal({ onClose }) {
  const [q, setQ] = useState('')
  const [tab, setTab] = useState('all')
  const inputRef = useRef(null)
  const navigate = useNavigate()

  /* Focus input on mount */
  useEffect(() => { inputRef.current?.focus() }, [])

  /* Close on Escape */
  useEffect(() => {
    const fn = e => { if (e.key === 'Escape') onClose() }
    window.addEventListener('keydown', fn)
    return () => window.removeEventListener('keydown', fn)
  }, [onClose])

  const term = q.trim()

  const { data: projects, isFetching: pFetch } = useQuery(
    ['search-projects', term],
    () => api.get(`/projects?search=${encodeURIComponent(term)}&limit=6`).then(r => r.data.projects || r.data),
    { enabled: term.length >= 2, keepPreviousData: true }
  )
  const { data: events, isFetching: eFetch } = useQuery(
    ['search-events', term],
    () => api.get(`/events?search=${encodeURIComponent(term)}&limit=6`).then(r => r.data),
    { enabled: term.length >= 2, keepPreviousData: true }
  )
  const { data: news, isFetching: nFetch } = useQuery(
    ['search-news', term],
    () => api.get(`/news?search=${encodeURIComponent(term)}&limit=6`).then(r => r.data),
    { enabled: term.length >= 2, keepPreviousData: true }
  )

  const loading = pFetch || eFetch || nFetch

  const allResults = [
    ...(projects?.map(p => ({ type: 'project', item: p })) || []),
    ...(events?.map(e => ({ type: 'event',   item: e })) || []),
    ...(news?.map(n => ({ type: 'news',    item: n })) || []),
  ]

  const filtered = tab === 'all' ? allResults
    : allResults.filter(r => r.type === tab)

  const TABS = [
    { key: 'all',     label: 'All' },
    { key: 'project', label: 'Projects' },
    { key: 'event',   label: 'Events' },
    { key: 'news',    label: 'News' },
  ]

  return (
    <div
      className="fixed inset-0 z-50 flex items-start justify-center pt-16 px-4"
      style={{ background: 'rgba(10,4,24,0.85)', backdropFilter: 'blur(8px)' }}
      onClick={onClose}>

      <div
        className="w-full max-w-2xl rounded-3xl overflow-hidden shadow-2xl"
        style={{ background: '#fff', border: '1px solid rgba(91,45,142,0.1)', maxHeight: '80vh', display: 'flex', flexDirection: 'column' }}
        onClick={e => e.stopPropagation()}>

        {/* Search input */}
        <div className="flex items-center gap-4 px-5 py-4 border-b" style={{ borderColor: 'rgba(91,45,142,0.08)' }}>
          <div className="w-10 h-10 rounded-2xl flex items-center justify-center flex-shrink-0"
            style={{ background: 'linear-gradient(135deg,#5B2D8E,#7B4DB8)' }}>
            {loading
              ? <Loader2 className="w-4 h-4 text-white animate-spin" />
              : <Search className="w-4 h-4 text-white" />
            }
          </div>
          <input
            ref={inputRef}
            value={q}
            onChange={e => setQ(e.target.value)}
            placeholder="Search projects, events, news…"
            className="flex-1 text-base outline-none bg-transparent text-dark"
          />
          {q && (
            <button onClick={() => setQ('')}
              className="w-8 h-8 rounded-full flex items-center justify-center transition-colors hover:bg-neutral-100 text-muted-foreground">
              <X className="w-4 h-4" />
            </button>
          )}
          <button onClick={onClose}
            className="text-xs font-semibold px-3 py-1.5 rounded-xl transition-colors hover:bg-neutral-100 text-muted-foreground"
            style={{ border: '1px solid rgba(91,45,142,0.1)' }}>
            Esc
          </button>
        </div>

        {/* Tabs (only when results exist) */}
        {term.length >= 2 && allResults.length > 0 && (
          <div className="flex gap-1 px-4 pt-3 pb-0 flex-shrink-0">
            {TABS.map(t => {
              const Icon = TAB_ICON[t.key]
              return (
                <button key={t.key} onClick={() => setTab(t.key)}
                  className="px-3 py-1.5 rounded-xl text-xs font-semibold transition-all flex items-center gap-1.5"
                  style={{
                    background: tab === t.key ? '#5B2D8E' : 'transparent',
                    color: tab === t.key ? '#fff' : '#A3A3A3',
                  }}>
                  <Icon className="w-3 h-3"/>{t.label}
                  {t.key !== 'all' && (
                    <span className="text-[9px] opacity-70">
                      ({t.key === 'project' ? projects?.length || 0
                         : t.key === 'event' ? events?.length || 0
                         : news?.length || 0})
                    </span>
                  )}
                </button>
              )
            })}
          </div>
        )}

        {/* Body */}
        <div className="overflow-y-auto flex-1">
          {/* No query — show quick links */}
          {term.length < 2 && (
            <div className="p-5">
              <p className="text-xs font-semibold uppercase tracking-wider mb-4 text-muted-foreground">Quick Links</p>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {QUICK_LINKS.map(l => (
                  <Link key={l.to} to={l.to} onClick={onClose}
                    className="flex items-center gap-3 p-3 rounded-2xl transition-all hover:-translate-y-0.5 hover:shadow-md"
                    style={{ background: `${l.color}08`, border: `1px solid ${l.color}15` }}>
                    <div className="w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0"
                      style={{ background: `${l.color}15` }}>
                      <l.Icon className="w-4 h-4" style={{ color: l.color }} />
                    </div>
                    <span className="text-sm font-semibold text-dark">{l.label}</span>
                  </Link>
                ))}
              </div>
            </div>
          )}

          {/* Loading */}
          {term.length >= 2 && loading && filtered.length === 0 && (
            <div className="p-8 text-center">
              <Loader2 className="w-8 h-8 text-primary-500 animate-spin mx-auto mb-3" />
              <p className="text-sm text-muted-foreground">Searching…</p>
            </div>
          )}

          {/* No results */}
          {term.length >= 2 && !loading && filtered.length === 0 && (
            <div className="p-8 text-center">
              <Search className="w-10 h-10 mx-auto mb-3" style={{ color: 'rgba(91,45,142,0.15)' }} />
              <p className="font-semibold mb-1 text-dark">No results for "{term}"</p>
              <p className="text-sm text-muted-foreground">Try different keywords or browse the sections above.</p>
            </div>
          )}

          {/* Results */}
          {filtered.length > 0 && (
            <div className="p-3 space-y-1">
              {filtered.map(({ type, item }) => (
                <ResultRow key={`${type}-${item.id}`} type={type} item={item} onClose={onClose} />
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-5 py-3 border-t flex items-center justify-between"
          style={{ borderColor: 'rgba(91,45,142,0.06)', background: 'rgba(91,45,142,0.02)' }}>
          <span className="text-[10px] text-muted-foreground">
            {term.length >= 2 ? `${filtered.length} result${filtered.length !== 1 ? 's' : ''}` : 'Type to search'}
          </span>
          <div className="flex items-center gap-3 text-[10px] text-muted-foreground">
            <span><kbd className="px-1.5 py-0.5 rounded bg-neutral-100 text-neutral-500 font-mono text-[9px]">↑↓</kbd> navigate</span>
            <span><kbd className="px-1.5 py-0.5 rounded bg-neutral-100 text-neutral-500 font-mono text-[9px]">↵</kbd> open</span>
            <span><kbd className="px-1.5 py-0.5 rounded bg-neutral-100 text-neutral-500 font-mono text-[9px]">Esc</kbd> close</span>
          </div>
        </div>
      </div>
    </div>
  )
}

function ResultRow({ type, item, onClose }) {
  const to = type === 'project' ? `/projects/${item.slug}`
    : type === 'event'   ? `/events/${item.slug}`
    : `/news/${item.slug}`

  const Icon = type === 'project' ? Sprout
    : type === 'event' ? CalendarDays
    : Newspaper

  const color = type === 'project' ? (CAT_COLORS[item.category] || '#5B2D8E')
    : type === 'event' ? (CAT_COLORS[item.category] || '#F0A500')
    : '#5B2D8E'

  const meta = type === 'project'
    ? `${Number(item.raisedAmount || 0).toLocaleString()} XAF raised`
    : type === 'event' && item.startDate
    ? format(new Date(item.startDate), 'MMM d, yyyy')
    : type === 'news' && item.publishedAt
    ? format(new Date(item.publishedAt), 'MMM d, yyyy')
    : ''

  return (
    <Link to={to} onClick={onClose}
      className="flex items-center gap-4 px-4 py-3 rounded-2xl transition-all hover:bg-neutral-50 group">
      {/* Thumbnail or icon */}
      <div className="w-12 h-12 rounded-2xl overflow-hidden flex items-center justify-center flex-shrink-0"
        style={{ background: `${color}15` }}>
        {item.coverImage
          ? <img src={item.coverImage} alt="" className="w-full h-full object-cover" />
          : <Icon className="w-5 h-5" style={{ color }} />
        }
      </div>

      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-0.5">
          <span className="text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full"
            style={{ background: `${color}12`, color }}>
            {type === 'project' ? item.category || 'project'
              : type === 'event' ? item.category || 'event'
              : 'news'}
          </span>
        </div>
        <div className="font-semibold text-sm truncate text-dark">
          {item.title}
        </div>
        {meta && (
          <div className="text-xs mt-0.5 truncate text-muted-foreground">{meta}</div>
        )}
      </div>

      <ArrowRight className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0"
        style={{ color }} />
    </Link>
  )
}
