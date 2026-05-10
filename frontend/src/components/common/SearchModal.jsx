import { useState, useEffect, useRef } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useQuery } from 'react-query'
import { format } from 'date-fns'
import api from '../../services/api'

const CAT_COLORS = {
  education:'#5B2D8E', health:'#dc2626', water:'#0284c7', culture:'#7c3aed',
  community:'#16a34a', sport:'#16a34a', fundraiser:'#d97706', governance:'#374151',
}

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
    { key: 'all',     label: 'All',      icon: 'fa-search' },
    { key: 'project', label: 'Projects', icon: 'fa-seedling' },
    { key: 'event',   label: 'Events',   icon: 'fa-calendar-alt' },
    { key: 'news',    label: 'News',     icon: 'fa-newspaper' },
  ]

  const QUICK_LINKS = [
    { label: 'All Projects', icon: 'fa-seedling',    to: '/projects',  color: '#5B2D8E' },
    { label: 'Events',       icon: 'fa-calendar-alt',to: '/events',    color: '#F0A500' },
    { label: 'Latest News',  icon: 'fa-newspaper',   to: '/news',      color: '#0284c7' },
    { label: 'Our Team',     icon: 'fa-users',       to: '/team',      color: '#16a34a' },
    { label: 'Gallery',      icon: 'fa-images',      to: '/gallery',   color: '#7c3aed' },
    { label: 'Contact Us',   icon: 'fa-envelope',    to: '/contact',   color: '#dc2626' },
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
              ? <div className="w-4 h-4 rounded-full border-2 border-white/30 border-t-white animate-spin" />
              : <i className="fas fa-search text-white text-sm" />
            }
          </div>
          <input
            ref={inputRef}
            value={q}
            onChange={e => setQ(e.target.value)}
            placeholder="Search projects, events, news…"
            className="flex-1 text-base outline-none bg-transparent"
            style={{ color: '#1A0A35', fontFamily: 'Poppins,sans-serif' }}
          />
          {q && (
            <button onClick={() => setQ('')}
              className="w-8 h-8 rounded-full flex items-center justify-center transition-colors hover:bg-neutral-100"
              style={{ color: '#A3A3A3' }}>
              <i className="fas fa-times text-sm" />
            </button>
          )}
          <button onClick={onClose}
            className="text-xs font-semibold px-3 py-1.5 rounded-xl transition-colors hover:bg-neutral-100"
            style={{ color: '#737373', fontFamily: 'Sora,sans-serif', border: '1px solid rgba(91,45,142,0.1)' }}>
            Esc
          </button>
        </div>

        {/* Tabs (only when results exist) */}
        {term.length >= 2 && allResults.length > 0 && (
          <div className="flex gap-1 px-4 pt-3 pb-0 flex-shrink-0">
            {TABS.map(t => (
              <button key={t.key} onClick={() => setTab(t.key)}
                className="px-3 py-1.5 rounded-xl text-xs font-semibold transition-all flex items-center gap-1.5"
                style={{
                  background: tab === t.key ? '#5B2D8E' : 'transparent',
                  color: tab === t.key ? '#fff' : '#A3A3A3',
                  fontFamily: 'Sora,sans-serif',
                }}>
                <i className={`fas ${t.icon} text-[10px]`} />{t.label}
                {t.key !== 'all' && (
                  <span className="text-[9px] opacity-70">
                    ({t.key === 'project' ? projects?.length || 0
                       : t.key === 'event' ? events?.length || 0
                       : news?.length || 0})
                  </span>
                )}
              </button>
            ))}
          </div>
        )}

        {/* Body */}
        <div className="overflow-y-auto flex-1">
          {/* No query — show quick links */}
          {term.length < 2 && (
            <div className="p-5">
              <p className="text-xs font-semibold uppercase tracking-wider mb-4"
                style={{ color: '#A3A3A3', fontFamily: 'Sora,sans-serif' }}>Quick Links</p>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {QUICK_LINKS.map(l => (
                  <Link key={l.to} to={l.to} onClick={onClose}
                    className="flex items-center gap-3 p-3 rounded-2xl transition-all hover:-translate-y-0.5 hover:shadow-md"
                    style={{ background: `${l.color}08`, border: `1px solid ${l.color}15` }}>
                    <div className="w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0"
                      style={{ background: `${l.color}15` }}>
                      <i className={`fas ${l.icon} text-xs`} style={{ color: l.color }} />
                    </div>
                    <span className="text-sm font-semibold" style={{ color: '#1A0A35', fontFamily: 'Sora,sans-serif' }}>{l.label}</span>
                  </Link>
                ))}
              </div>
            </div>
          )}

          {/* Loading */}
          {term.length >= 2 && loading && filtered.length === 0 && (
            <div className="p-8 text-center">
              <div className="w-8 h-8 rounded-full border-2 border-purple-200 border-t-purple-600 animate-spin mx-auto mb-3" />
              <p className="text-sm" style={{ color: '#A3A3A3', fontFamily: 'Poppins,sans-serif' }}>Searching…</p>
            </div>
          )}

          {/* No results */}
          {term.length >= 2 && !loading && filtered.length === 0 && (
            <div className="p-8 text-center">
              <i className="fas fa-search text-4xl mb-3 block" style={{ color: 'rgba(91,45,142,0.15)' }} />
              <p className="font-semibold mb-1" style={{ color: '#1A0A35', fontFamily: 'Sora,sans-serif' }}>No results for "{term}"</p>
              <p className="text-sm" style={{ color: '#A3A3A3', fontFamily: 'Poppins,sans-serif' }}>Try different keywords or browse the sections above.</p>
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
          <span className="text-[10px]" style={{ color: '#A3A3A3', fontFamily: 'Poppins,sans-serif' }}>
            {term.length >= 2 ? `${filtered.length} result${filtered.length !== 1 ? 's' : ''}` : 'Type to search'}
          </span>
          <div className="flex items-center gap-3 text-[10px]" style={{ color: '#A3A3A3', fontFamily: 'Sora,sans-serif' }}>
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

  const icon = type === 'project' ? 'fa-seedling'
    : type === 'event' ? 'fa-calendar-alt'
    : 'fa-newspaper'

  const color = type === 'project' ? (CAT_COLORS[item.category] || '#5B2D8E')
    : type === 'event' ? (CAT_COLORS[item.category] || '#F0A500')
    : '#0284c7'

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
          : <i className={`fas ${icon} text-lg`} style={{ color }} />
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
        <div className="font-semibold text-sm truncate" style={{ color: '#1A0A35', fontFamily: 'Sora,sans-serif' }}>
          {item.title}
        </div>
        {meta && (
          <div className="text-xs mt-0.5 truncate" style={{ color: '#A3A3A3', fontFamily: 'Poppins,sans-serif' }}>{meta}</div>
        )}
      </div>

      <i className="fas fa-arrow-right text-xs opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0"
        style={{ color }} />
    </Link>
  )
}
