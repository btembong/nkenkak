import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useQuery } from 'react-query'
import api from '../../services/api'

const FILTERS = [
  { key: 'all', label: 'All' },
  { key: 'general', label: 'General' },
  { key: 'meeting', label: 'Meetings' },
  { key: 'emergency', label: 'Emergency' },
  { key: 'community', label: 'Community' },
]

const PRIORITY_COLORS = {
  urgent: '#dc2626',
  high: '#D97706',
  normal: '#4b0082',
  low: '#737373',
}

const CATEGORY_ICONS = {
  general: 'fa-bullhorn',
  meeting: 'fa-users',
  emergency: 'fa-exclamation-triangle',
  community: 'fa-heart',
}

function formatDate(str) {
  if (!str) return ''
  return new Date(str).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })
}

function formatExpiry(str) {
  if (!str) return null
  return new Date(str).toLocaleDateString('en-US', { month: '2-digit', day: '2-digit', year: 'numeric' })
}

function SkeletonRow() {
  return (
    <div className="rounded-2xl p-5 animate-pulse mb-4" style={{ background: '#fff', height: 110, boxShadow: '0 2px 12px rgba(75,0,130,0.05)' }} />
  )
}

function NoticeCard({ notice, expanded, onToggle }) {
  const priorityColor = PRIORITY_COLORS[notice.priority] || PRIORITY_COLORS.normal
  const catIcon = CATEGORY_ICONS[notice.category] || 'fa-bullhorn'
  const authorName = notice.author ? `${notice.author.firstName} ${notice.author.lastName}` : 'Administration'
  const expiry = formatExpiry(notice.expiresAt)
  const isExpanded = expanded

  return (
    <div className="rounded-2xl overflow-hidden mb-4" style={{ background: '#fff', boxShadow: '0 2px 16px rgba(75,0,130,0.07)', borderLeft: `4px solid ${priorityColor}` }}>
      <div className="p-5">
        {/* Top row */}
        <div className="flex items-start justify-between gap-3">
          <div className="flex-1 min-w-0">
            {/* Priority badge */}
            <div className="flex items-center gap-2 mb-2 flex-wrap">
              <span className="text-xs font-bold px-2.5 py-0.5 rounded-full uppercase tracking-wide"
                style={{ background: `${priorityColor}18`, color: priorityColor, fontFamily: '"Exo 2",sans-serif', border: `1px solid ${priorityColor}30` }}>
                {notice.priority}
              </span>
              {expiry && (
                <span className="text-xs px-2 py-0.5 rounded-full" style={{ background: 'rgba(115,115,115,0.08)', color: '#737373', fontFamily: '"Exo 2",sans-serif' }}>
                  <i className="fas fa-clock text-[10px] mr-1" />Expires {expiry}
                </span>
              )}
            </div>

            <h3 className="font-display font-bold text-base leading-snug mb-1" style={{ color: '#2d004e' }}>{notice.title}</h3>

            <p className="text-xs mb-2" style={{ color: '#A3A3A3', fontFamily: '"Exo 2",sans-serif' }}>
              <i className="fas fa-user-circle mr-1" />{authorName}
              <span className="mx-2">·</span>
              <i className="fas fa-calendar-alt mr-1" />{formatDate(notice.createdAt)}
            </p>
          </div>

          {/* Category badge */}
          <div className="flex-shrink-0 w-10 h-10 rounded-xl flex items-center justify-center"
            style={{ background: `${priorityColor}12`, border: `1px solid ${priorityColor}25` }}>
            <i className={`fas ${catIcon} text-sm`} style={{ color: priorityColor }} />
          </div>
        </div>

        {/* Content */}
        <div className="mt-1">
          <p className="text-sm leading-relaxed"
            style={{
              color: '#555', fontFamily: '"Exo 2",sans-serif',
              display: isExpanded ? 'block' : '-webkit-box',
              WebkitLineClamp: isExpanded ? undefined : 3,
              WebkitBoxOrient: 'vertical',
              overflow: isExpanded ? 'visible' : 'hidden',
            }}>
            {notice.content}
          </p>
          {notice.content?.length > 200 && (
            <button
              onClick={onToggle}
              className="text-xs font-semibold mt-1 transition-colors hover:opacity-75"
              style={{ color: '#4b0082', fontFamily: '"Exo 2",sans-serif' }}>
              {isExpanded ? 'Show less' : 'Read more'} <i className={`fas fa-chevron-${isExpanded ? 'up' : 'down'} text-[10px] ml-0.5`} />
            </button>
          )}
        </div>
      </div>
    </div>
  )
}

export default function NoticesPage() {
  const [filter, setFilter] = useState('all')
  const [expanded, setExpanded] = useState(new Set())

  const { data, isLoading } = useQuery(
    'notices',
    () => api.get('/notices').then(r => r.data),
    { staleTime: 30000 }
  )

  const notices = data || []

  const filtered = filter === 'all' ? notices : notices.filter(n => n.category === filter)
  const pinned = filtered.filter(n => n.priority === 'urgent' || n.category === 'emergency')
  const regular = filtered.filter(n => n.priority !== 'urgent' && n.category !== 'emergency')

  const toggleExpand = (id) => {
    setExpanded(prev => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  return (
    <div style={{ background: '#F3EDF8', minHeight: '100vh' }}>
      {/* Hero */}
      <div className="page-hero relative overflow-hidden">
        <div className="absolute inset-0 opacity-10" style={{ backgroundImage: 'radial-gradient(circle at 20% 50%, #a57fc0 0%, transparent 50%), radial-gradient(circle at 80% 20%, #4b0082 0%, transparent 40%)' }} />
        <div className="relative max-w-5xl mx-auto px-6 py-20 text-center">
          <div className="inline-flex items-center gap-2 mb-4 px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-widest"
            style={{ background: 'rgba(75,0,130,0.12)', color: '#eeb549', border: '1px solid rgba(75,0,130,0.20)' }}>
            <i className="fas fa-bullhorn text-[10px]" />Notice Board
          </div>
          <h1 className="font-display font-bold text-4xl md:text-5xl text-white mb-4 leading-tight">
            Community <span style={{ color: '#eeb549' }}>Notice Board</span>
          </h1>
          <p className="text-base max-w-xl mx-auto" style={{ color: 'rgba(255,255,255,0.65)', fontFamily: '"Exo 2",sans-serif' }}>
            Official announcements, meeting schedules, and important community updates.
          </p>
          <div className="flex items-center justify-center gap-2 text-xs mt-6" style={{ color: 'rgba(255,255,255,0.5)', fontFamily: '"Exo 2",sans-serif' }}>
            <Link to="/" className="hover:text-white transition-colors flex items-center gap-1"><i className="fas fa-home text-[10px]" />Home</Link>
            <i className="fas fa-chevron-right text-[8px]" style={{ color: '#eeb549' }} />
            <span style={{ color: '#eeb549' }}>Notices</span>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-6 py-12">
        {/* Filter card */}
        <div className="bg-white rounded-2xl p-5 mb-8" style={{ boxShadow: '0 1px 10px rgba(75,0,130,0.08)', border: '1px solid rgba(75,0,130,0.08)' }}>
          <div className="flex items-center justify-between pb-4 mb-4 border-b" style={{ borderColor: 'rgba(75,0,130,0.07)' }}>
            <div>
              <h2 className="font-display font-bold text-sm text-dark">Notice Board</h2>
              <p className="text-[11px] mt-0.5" style={{ color: 'rgba(75,0,130,0.45)' }}>Official announcements from village administration</p>
            </div>
            {!isLoading && (
              <span className="text-[11px] font-bold px-3 py-1 rounded-full flex-shrink-0"
                style={{ background: 'rgba(75,0,130,0.07)', color: '#4b0082' }}>
                {filtered.length} notice{filtered.length !== 1 ? 's' : ''}
              </span>
            )}
          </div>
          <div className="flex items-center justify-between gap-3 flex-wrap">
            <div className="overflow-x-auto" style={{ scrollbarWidth: 'none' }}>
              <div className="flex items-center p-1 rounded-2xl w-max"
                style={{ background: 'rgba(75,0,130,0.06)', border: '1px solid rgba(75,0,130,0.09)' }}>
                {FILTERS.flatMap((f, i) => {
                  const active = filter === f.key
                  const prevActive = i > 0 && filter === FILTERS[i - 1].key
                  const sep = i > 0 && !active && !prevActive
                    ? [<div key={`sep-${f.key}`} className="w-px h-4 flex-shrink-0" style={{ background: 'rgba(75,0,130,0.13)' }}/>]
                    : []
                  return [...sep, (
                    <button key={f.key} onClick={() => setFilter(f.key)}
                      className="px-3.5 py-2 rounded-xl text-xs font-semibold transition-all flex-shrink-0 whitespace-nowrap"
                      style={{
                        background: active ? 'linear-gradient(135deg,#4b0082,#a57fc0)' : 'transparent',
                        color:      active ? '#fff' : '#A3A3A3',
                        boxShadow:  active ? '0 2px 10px rgba(75,0,130,0.28)' : 'none',
                      }}>
                      {f.label}
                    </button>
                  )]
                })}
              </div>
            </div>
            <span className="text-[10px] px-3 py-1.5 rounded-full flex-shrink-0" style={{ background: 'rgba(75,0,130,0.05)', color: '#737373', fontFamily: '"Exo 2",sans-serif' }}>
              <i className="fas fa-shield-alt mr-1 text-[9px]" />Posted by village administration
            </span>
          </div>
        </div>

        {isLoading ? (
          <div>{[1, 2, 3, 4, 5].map(i => <SkeletonRow key={i} />)}</div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-24 rounded-3xl" style={{ background: 'rgba(75,0,130,0.02)', border: '1px dashed rgba(75,0,130,0.12)' }}>
            <i className="fas fa-bullhorn text-5xl mb-4 block" style={{ color: 'rgba(75,0,130,0.18)' }} />
            <h3 className="font-display font-bold text-xl mb-2" style={{ color: '#2d004e' }}>No notices found</h3>
            <p className="text-sm" style={{ color: '#737373', fontFamily: '"Exo 2",sans-serif' }}>
              {filter !== 'all' ? 'No notices in this category.' : 'No community notices at this time.'}
            </p>
          </div>
        ) : (
          <>
            {/* Pinned urgent/emergency */}
            {pinned.length > 0 && (
              <div className="mb-8 rounded-2xl overflow-hidden" style={{ background: 'rgba(220,38,38,0.05)', border: '1px solid rgba(220,38,38,0.2)' }}>
                <div className="flex items-center gap-3 px-5 py-3" style={{ background: 'rgba(220,38,38,0.08)', borderBottom: '1px solid rgba(220,38,38,0.15)' }}>
                  <span className="w-2.5 h-2.5 rounded-full animate-pulse flex-shrink-0" style={{ background: '#dc2626' }} />
                  <span className="text-xs font-bold uppercase tracking-widest" style={{ color: '#dc2626', fontFamily: '"Exo 2",sans-serif' }}>
                    <i className="fas fa-exclamation-triangle mr-1.5" />Urgent Notices
                  </span>
                </div>
                <div className="p-4">
                  {pinned.map(n => (
                    <NoticeCard key={n.id} notice={n} expanded={expanded.has(n.id)} onToggle={() => toggleExpand(n.id)} />
                  ))}
                </div>
              </div>
            )}

            {/* Regular notices */}
            {regular.map(n => (
              <NoticeCard key={n.id} notice={n} expanded={expanded.has(n.id)} onToggle={() => toggleExpand(n.id)} />
            ))}
          </>
        )}
      </div>
    </div>
  )
}
