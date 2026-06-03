import { useState, useMemo } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { useQuery } from 'react-query'
import { useOutletContext } from 'react-router-dom'
import api from '../../services/api'
import ProjectCard from '../common/ProjectCard'
import {
  Search, ChevronRight, Home, Sprout, X, LayoutGrid,
  GraduationCap, HeartPulse, Route, Leaf, Music2, Wheat,
  Zap, CalendarClock, CheckCircle2, SlidersHorizontal,
  Users, TrendingUp, FolderOpen,
} from 'lucide-react'

const CATS = ['all','education','health','infrastructure','environment','culture','agriculture']
const CAT_ICONS = {
  all:            LayoutGrid,
  education:      GraduationCap,
  health:         HeartPulse,
  infrastructure: Route,
  environment:    Leaf,
  culture:        Music2,
  agriculture:    Wheat,
}

const STATUSES = ['all','active','upcoming','completed']
const STATUS_META = {
  all:       { Icon: LayoutGrid,    label: 'All Status'  },
  active:    { Icon: Zap,           label: 'Active'      },
  upcoming:  { Icon: CalendarClock, label: 'Upcoming'    },
  completed: { Icon: CheckCircle2,  label: 'Completed'   },
}

export default function ProjectsPage() {
  const { openDonate } = useOutletContext()
  const [params] = useSearchParams()
  const [cat,    setCat]    = useState(params.get('cat') || 'all')
  const [status, setStatus] = useState('all')
  const [search, setSearch] = useState('')

  const { data, isLoading } = useQuery(
    ['projects', cat, status],
    () => api.get(`/projects?${cat !== 'all' ? `category=${cat}&` : ''}${status !== 'all' ? `status=${status}&` : ''}limit=50`).then(r => r.data.projects),
    { staleTime: 30000 }
  )
  const { data: stats } = useQuery('project-stats', () => api.get('/projects/stats/summary').then(r => r.data))

  const countByCat = useMemo(() => {
    if (!data) return {}
    return data.reduce((acc, p) => ({ ...acc, [p.category]: (acc[p.category] || 0) + 1 }), {})
  }, [data])

  const filtered = useMemo(() =>
    data?.filter(p =>
      !search ||
      p.title.toLowerCase().includes(search.toLowerCase()) ||
      p.summary?.toLowerCase().includes(search.toLowerCase())
    ) || [],
  [data, search])

  const hasFilters = cat !== 'all' || status !== 'all' || search.trim()

  const clearAll = () => { setCat('all'); setStatus('all'); setSearch('') }

  const STAT_ITEMS = [
    { Icon: Zap,         label: 'Active Projects', value: stats?.active },
    { Icon: CheckCircle2,label: 'Completed',        value: stats?.completed },
    { Icon: TrendingUp,  label: 'Total Raised',     value: stats ? `${Number(stats.total_raised || 0).toLocaleString()} XAF` : null },
    { Icon: Users,       label: 'Total Donors',     value: stats ? Number(stats.total_donors || 0).toLocaleString() : null },
  ]

  return (
    <div>
      {/* Hero */}
      <div className="page-hero py-20 px-6 text-center">
        <div className="eyebrow justify-center mb-3 text-gold/90">
          <span className="w-5 h-0.5 rounded-full inline-block mr-2 bg-gold" />
          Our Causes
        </div>
        <h1 className="font-display font-bold text-4xl text-white mb-3">Community Projects</h1>
        <div className="flex items-center justify-center gap-2 text-sm text-white/60">
          <Link to="/" className="hover:text-white transition-colors flex items-center gap-1">
            <Home className="w-3 h-3" />Home
          </Link>
          <ChevronRight className="w-3 h-3 text-gold" />
          <span className="text-gold">Projects</span>
        </div>
      </div>

      {/* Stats bar */}
      {stats && (
        <div className="bg-white border-b" style={{ borderColor: 'rgba(75,0,130,0.06)' }}>
          <div className="max-w-5xl mx-auto px-6 py-5 grid grid-cols-2 md:grid-cols-4 divide-x divide-[rgba(75,0,130,0.07)]">
            {STAT_ITEMS.map(({ Icon, label, value }) => value != null && (
              <div key={label} className="flex items-center gap-3 px-6 first:pl-0 last:pr-0">
                <div className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0"
                  style={{ background: 'rgba(75,0,130,0.07)' }}>
                  <Icon className="w-4 h-4 text-primary-500" />
                </div>
                <div>
                  <div className="font-display font-bold text-lg text-dark leading-none">{value}</div>
                  <div className="text-[11px] text-muted-foreground mt-0.5">{label}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      <section className="py-16" style={{ background: '#F3EDF8' }}>
        <div className="max-w-7xl mx-auto px-6">

          {/* Toolbar card */}
          <div className="bg-white rounded-2xl p-5 mb-6" style={{ boxShadow: '0 1px 10px rgba(75,0,130,0.08)', border: '1px solid rgba(75,0,130,0.08)' }}>
            <div className="flex items-center justify-between pb-4 mb-4 border-b" style={{ borderColor: 'rgba(75,0,130,0.07)' }}>
              <div>
                <h2 className="font-display font-bold text-sm text-dark">Community Projects</h2>
                <p className="text-[11px] mt-0.5" style={{ color: 'rgba(75,0,130,0.45)' }}>Filter by category, status or search</p>
              </div>
              {!isLoading && (
                <span className="text-[11px] font-bold px-3 py-1 rounded-full flex-shrink-0"
                  style={{ background: 'rgba(75,0,130,0.07)', color: '#4b0082' }}>
                  {filtered.length} project{filtered.length !== 1 ? 's' : ''}
                </span>
              )}
            </div>
            <div className="space-y-3">

            {/* Row 1 — Category tabs — single segmented control */}
            <div className="relative">
              <div className="overflow-x-auto" style={{ scrollbarWidth: 'none' }}>
                <div className="flex items-center p-1 rounded-2xl w-max"
                  style={{ background: 'rgba(75,0,130,0.06)', border: '1px solid rgba(75,0,130,0.09)' }}>
                  {CATS.flatMap((c, i) => {
                    const Icon   = CAT_ICONS[c]
                    const count  = c === 'all' ? (data?.length || 0) : (countByCat[c] || 0)
                    const active = cat === c
                    const prevActive = i > 0 && cat === CATS[i - 1]
                    const sep = i > 0 && !active && !prevActive
                      ? [<div key={`sep-${c}`} className="w-px h-4 flex-shrink-0" style={{ background: 'rgba(75,0,130,0.13)' }}/>]
                      : []
                    return [...sep, (
                      <button key={c} onClick={() => setCat(c)}
                        className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold transition-all capitalize flex-shrink-0 whitespace-nowrap"
                        style={{
                          background: active ? 'linear-gradient(135deg,#4b0082,#a57fc0)' : 'transparent',
                          color:      active ? '#fff' : '#A3A3A3',
                          boxShadow:  active ? '0 2px 10px rgba(75,0,130,0.28)' : 'none',
                        }}>
                        <Icon className="w-3.5 h-3.5" style={{ opacity: active ? 1 : 0.6 }} />
                        {c === 'all' ? 'All' : c}
                        {count > 0 && (
                          <span className="text-[9px] font-bold px-1.5 py-0.5 rounded-full leading-none"
                            style={{
                              background: active ? 'rgba(255,255,255,0.22)' : 'rgba(75,0,130,0.08)',
                              color:      active ? 'rgba(255,255,255,0.95)' : '#a57fc0',
                            }}>
                            {count}
                          </span>
                        )}
                      </button>
                    )]
                  })}
                </div>
              </div>
              <div className="absolute right-0 top-0 bottom-0 w-8 pointer-events-none rounded-r-2xl"
                style={{ background: 'linear-gradient(to right, transparent, #fff)' }} />
            </div>

            {/* Row 2 — Search | Status toggles */}
            <div className="flex items-center gap-2 flex-wrap">

              {/* Search with clear */}
              <div className="relative flex-1 min-w-[160px] max-w-xs">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 pointer-events-none"
                  style={{ color: 'rgba(75,0,130,0.35)' }} />
                <input
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                  placeholder="Search projects…"
                  className="w-full pl-9 pr-8 py-2 rounded-xl text-xs outline-none transition-all"
                  style={{ background: '#F6F2FA', border: '1.5px solid rgba(75,0,130,0.1)', color: '#2d004e' }}
                  onFocus={e => { e.target.style.borderColor = '#4b0082' }}
                  onBlur={e => { e.target.style.borderColor = 'rgba(75,0,130,0.1)' }}
                />
                {search && (
                  <button onClick={() => setSearch('')}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 w-4 h-4 rounded-full flex items-center justify-center transition-colors hover:bg-primary-100"
                    style={{ color: 'rgba(75,0,130,0.45)' }}>
                    <X className="w-3 h-3" />
                  </button>
                )}
              </div>

              <div className="w-px h-5 rounded-full flex-shrink-0" style={{ background: 'rgba(75,0,130,0.12)' }} />

              {/* Status toggle buttons */}
              <div className="flex items-center gap-0.5 p-1 rounded-xl flex-shrink-0"
                style={{ background: 'rgba(75,0,130,0.05)', border: '1px solid rgba(75,0,130,0.08)' }}>
                {STATUSES.map(s => {
                  const { Icon: SIcon, label } = STATUS_META[s]
                  const active = status === s
                  return (
                    <button key={s} onClick={() => setStatus(s)}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[11px] font-semibold transition-all"
                      style={{
                        background: active ? '#fff' : 'transparent',
                        color:      active ? '#4b0082' : '#A3A3A3',
                        boxShadow:  active ? '0 1px 4px rgba(75,0,130,0.12)' : 'none',
                      }}>
                      <SIcon className="w-3 h-3" />
                      {label}
                    </button>
                  )
                })}
              </div>
            </div>
            </div>
            {/* Active filter chips */}
            {!isLoading && hasFilters && (
              <div className="flex items-center gap-2 flex-wrap pt-3 mt-3 border-t" style={{ borderColor: 'rgba(75,0,130,0.07)' }}>
                <SlidersHorizontal className="w-3.5 h-3.5 flex-shrink-0" style={{ color: 'rgba(75,0,130,0.4)' }} />
                {cat !== 'all' && (() => { const I = CAT_ICONS[cat]; return (
                  <span className="flex items-center gap-1 text-[11px] font-semibold px-2.5 py-1 rounded-full"
                    style={{ background: 'rgba(75,0,130,0.08)', color: '#4b0082' }}>
                    {I && <I className="w-3 h-3" />}{cat}
                    <button onClick={() => setCat('all')} className="ml-0.5 hover:opacity-60 transition-opacity">
                      <X className="w-2.5 h-2.5" />
                    </button>
                  </span>
                )})()}
                {status !== 'all' && (() => { const { Icon: SI, label } = STATUS_META[status]; return (
                  <span className="flex items-center gap-1 text-[11px] font-semibold px-2.5 py-1 rounded-full"
                    style={{ background: 'rgba(75,0,130,0.08)', color: '#4b0082' }}>
                    <SI className="w-3 h-3" />{label}
                    <button onClick={() => setStatus('all')} className="ml-0.5 hover:opacity-60 transition-opacity">
                      <X className="w-2.5 h-2.5" />
                    </button>
                  </span>
                )})()}
                {search.trim() && (
                  <span className="flex items-center gap-1 text-[11px] font-semibold px-2.5 py-1 rounded-full"
                    style={{ background: 'rgba(75,0,130,0.06)', color: '#4b0082' }}>
                    "{search}"
                    <button onClick={() => setSearch('')} className="ml-0.5 hover:opacity-60 transition-opacity">
                      <X className="w-2.5 h-2.5" />
                    </button>
                  </span>
                )}
                <button onClick={clearAll}
                  className="text-[10px] font-bold transition-all hover:opacity-70"
                  style={{ color: 'rgba(75,0,130,0.45)' }}>
                  Clear all
                </button>
              </div>
            )}
          </div>

          {/* Grid */}
          {isLoading ? (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[1, 2, 3].map(i => (
                <div key={i} className="h-80 rounded-3xl animate-pulse" style={{ background: 'rgba(75,0,130,0.04)' }} />
              ))}
            </div>
          ) : filtered.length ? (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filtered.map(p => <ProjectCard key={p.id} project={p} onDonate={openDonate} />)}
            </div>
          ) : (
            <div className="text-center py-24 rounded-3xl"
              style={{ background: 'rgba(75,0,130,0.03)', border: '1px dashed rgba(75,0,130,0.12)' }}>
              <FolderOpen className="w-12 h-12 mx-auto mb-4" style={{ color: 'rgba(75,0,130,0.2)' }} />
              <h3 className="font-display font-bold text-xl mb-2 text-dark">No projects found</h3>
              <p className="text-sm text-muted-foreground mb-5">Try adjusting your filters or search term.</p>
              {hasFilters && (
                <button onClick={clearAll} className="btn-secondary !text-sm !py-2.5 !px-6">
                  Clear Filters
                </button>
              )}
            </div>
          )}
        </div>
      </section>
    </div>
  )
}
