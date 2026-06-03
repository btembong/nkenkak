import { useState, useEffect, useRef } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { useQuery } from 'react-query'
import api from '../../services/api'
import NewsCard from '../common/NewsCard'
import {
  Newspaper, Search, X, ChevronRight, ChevronLeft, Home,
  Flame, Check, LayoutGrid, Mail, CheckCircle2, Loader2,
  Tag, GraduationCap, Users, HeartPulse, Music2, Star,
  Building2, SlidersHorizontal,
} from 'lucide-react'

const CATS = ['All','Projects','Education','Community','Health','Culture','Success','Governance']

const CAT_ICONS = {
  All:        LayoutGrid,
  Projects:   Tag,
  Education:  GraduationCap,
  Community:  Users,
  Health:     HeartPulse,
  Culture:    Music2,
  Success:    Star,
  Governance: Building2,
}
const LIMIT = 9

export default function NewsPage() {
  const [searchParams, setSearchParams] = useSearchParams()
  const [cat,    setCat]    = useState(searchParams.get('cat') || 'All')
  const [page,   setPage]   = useState(1)
  const [search, setSearch] = useState('')
  const [query,  setQuery]  = useState('')
  const [subEmail, setSubEmail]   = useState('')
  const [subState, setSubState]   = useState('idle')
  const searchRef  = useRef(null)
  const gridTopRef = useRef(null)

  useEffect(() => {
    const t = setTimeout(() => { setQuery(search); setPage(1) }, 350)
    return () => clearTimeout(t)
  }, [search])

  useEffect(() => {
    if (cat === 'All') searchParams.delete('cat')
    else searchParams.set('cat', cat)
    setSearchParams(searchParams, { replace: true })
    setPage(1)
  }, [cat])

  useEffect(() => {
    if (page > 1) gridTopRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }, [page])

  const { data, isLoading } = useQuery(
    ['news-page', page, cat, query],
    () => api.get('/news', { params: { page, limit: LIMIT, category: cat === 'All' ? undefined : cat, search: query || undefined } }).then(r => r.data),
    { keepPreviousData: true }
  )

  const { data: mostReadData } = useQuery(
    'news-most-read',
    () => api.get('/news', { params: { page: 1, limit: 5, sortBy: 'views' } }).then(r => r.data?.articles || []),
    { staleTime: 5 * 60 * 1000 }
  )
  const mostRead = (mostReadData || []).filter(a => a.viewCount > 0)

  const articles   = data?.articles || []
  const totalPages = data?.totalPages || 1
  const total      = data?.total || 0
  const featured   = articles[0]
  const rest       = articles.slice(1)

  const changeCat = (c) => { setCat(c); setSearch(''); setQuery('') }

  const handleSubscribe = async (e) => {
    e.preventDefault()
    if (!subEmail) return
    setSubState('loading')
    try {
      await api.post('/newsletter/subscribe', { email: subEmail })
      setSubState('success')
      setSubEmail('')
    } catch {
      setSubState('error')
    }
  }

  return (
    <div className="min-h-screen" style={{ background: '#F3EDF8' }}>

      {/* Hero */}
      <div className="page-hero relative overflow-hidden">
        <div className="absolute inset-0 opacity-10"
          style={{ backgroundImage: 'radial-gradient(circle at 20% 50%, #a57fc0 0%, transparent 50%), radial-gradient(circle at 80% 20%, #a57fc0 0%, transparent 40%)' }} />
        <div className="relative max-w-5xl mx-auto px-6 py-20 text-center">
          <div className="inline-flex items-center gap-2 mb-4 px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-widest text-gold"
            style={{ background: 'rgba(240,165,0,0.15)', border: '1px solid rgba(240,165,0,0.25)' }}>
            <Newspaper className="w-3 h-3"/>News & Articles
          </div>
          <h1 className="font-display font-bold text-4xl md:text-5xl text-white mb-4 leading-tight">
            Village <span style={{ color: '#a57fc0' }}>Stories</span> &amp; Updates
          </h1>
          <p className="text-base mb-8 max-w-xl mx-auto text-white/65">
            Stay informed with the latest news, project updates, and community highlights from Nkenkak-Ngiesang.
          </p>
          {/* Search */}
          <div className="max-w-lg mx-auto relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[#A3A3A3]"/>
            <input ref={searchRef} value={search} onChange={e => setSearch(e.target.value)}
              placeholder="Search articles…"
              className="w-full pl-11 pr-10 py-3.5 rounded-2xl text-sm outline-none"
              style={{ background: 'rgba(255,255,255,0.95)', color: '#2d004e', border: 'none', boxShadow: '0 8px 32px rgba(0,0,0,0.15)' }} />
            {search && (
              <button onClick={() => { setSearch(''); setQuery('') }}
                className="absolute right-3 top-1/2 -translate-y-1/2 w-6 h-6 rounded-full flex items-center justify-center hover:bg-gray-100 text-[#A3A3A3]">
                <X className="w-3 h-3"/>
              </button>
            )}
          </div>
          {/* Breadcrumb */}
          <div className="flex items-center justify-center gap-2 text-xs mt-6 text-white/50">
            <Link to="/" className="hover:text-white transition-colors flex items-center gap-1">
              <Home className="w-3 h-3"/>Home
            </Link>
            <ChevronRight className="w-3 h-3 text-gold"/>
            <span className="text-gold">News</span>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 md:px-6 py-10">

        {/* Filter card */}
        <div className="bg-white rounded-2xl p-5 mb-6" style={{ boxShadow: '0 1px 10px rgba(75,0,130,0.08)', border: '1px solid rgba(75,0,130,0.08)' }}>
          <div className="flex items-center justify-between pb-4 mb-4 border-b" style={{ borderColor: 'rgba(75,0,130,0.07)' }}>
            <div>
              <h2 className="font-display font-bold text-sm text-dark">Village Stories</h2>
              <p className="text-[11px] mt-0.5" style={{ color: 'rgba(75,0,130,0.45)' }}>Filter by category or search</p>
            </div>
            {!isLoading && (
              <span className="text-[11px] font-bold px-3 py-1 rounded-full flex-shrink-0"
                style={{ background: 'rgba(75,0,130,0.07)', color: '#4b0082' }}>
                {total} article{total !== 1 ? 's' : ''}
              </span>
            )}
          </div>
          <div className="relative">
            <div className="overflow-x-auto" style={{ scrollbarWidth: 'none' }}>
              <div className="flex items-center p-1 rounded-2xl w-max"
                style={{ background: 'rgba(75,0,130,0.06)', border: '1px solid rgba(75,0,130,0.09)' }}>
                {CATS.flatMap((c, i) => {
                  const Icon   = CAT_ICONS[c]
                  const active = cat === c
                  const prevActive = i > 0 && cat === CATS[i - 1]
                  const sep = i > 0 && !active && !prevActive
                    ? [<div key={`sep-${c}`} className="w-px h-4 flex-shrink-0" style={{ background: 'rgba(75,0,130,0.13)' }}/>]
                    : []
                  return [...sep, (
                    <button key={c} onClick={() => changeCat(c)}
                      className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold transition-all flex-shrink-0 whitespace-nowrap"
                      style={{
                        background: active ? 'linear-gradient(135deg,#4b0082,#a57fc0)' : 'transparent',
                        color:      active ? '#fff' : '#A3A3A3',
                        boxShadow:  active ? '0 2px 10px rgba(75,0,130,0.28)' : 'none',
                      }}>
                      {Icon && <Icon className="w-3.5 h-3.5" style={{ opacity: active ? 1 : 0.6 }} />}
                      {c}
                    </button>
                  )]
                })}
              </div>
            </div>
            <div className="absolute right-0 top-0 bottom-0 w-8 pointer-events-none rounded-r-2xl"
              style={{ background: 'linear-gradient(to right, transparent, #fff)' }} />
          </div>
          {/* Active filter chips */}
          {!isLoading && (cat !== 'All' || query) && (
            <div className="flex items-center gap-2 flex-wrap pt-3 mt-3 border-t" style={{ borderColor: 'rgba(75,0,130,0.07)' }}>
              <SlidersHorizontal className="w-3.5 h-3.5 flex-shrink-0" style={{ color: 'rgba(75,0,130,0.4)' }} />
              {cat !== 'All' && (() => { const I = CAT_ICONS[cat]; return (
                <span className="flex items-center gap-1 text-[11px] font-semibold px-2.5 py-1 rounded-full"
                  style={{ background: 'rgba(75,0,130,0.08)', color: '#4b0082' }}>
                  {I && <I className="w-3 h-3" />}{cat}
                  <button onClick={() => changeCat('All')} className="ml-0.5 hover:opacity-60 transition-opacity">
                    <X className="w-2.5 h-2.5" />
                  </button>
                </span>
              )})()}
              {query && (
                <span className="flex items-center gap-1 text-[11px] font-semibold px-2.5 py-1 rounded-full"
                  style={{ background: 'rgba(75,0,130,0.06)', color: '#4b0082' }}>
                  "{query}"
                  <button onClick={() => { setSearch(''); setQuery('') }} className="ml-0.5 hover:opacity-60 transition-opacity">
                    <X className="w-2.5 h-2.5" />
                  </button>
                </span>
              )}
              <button onClick={() => { setSearch(''); setQuery(''); changeCat('All') }}
                className="text-[10px] font-bold transition-all hover:opacity-70"
                style={{ color: 'rgba(75,0,130,0.45)' }}>
                Clear all
              </button>
            </div>
          )}
        </div>

        {/* Main layout */}
        <div ref={gridTopRef} className="flex flex-col lg:flex-row gap-8">

          {/* Left — articles */}
          <div className="flex-1 min-w-0">
            {isLoading ? (
              <div className="space-y-6">
                <div className="h-96 rounded-3xl animate-pulse" style={{ background: 'rgba(75,0,130,0.06)' }} />
                <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
                  {[1,2,3,4,5,6].map(i => <div key={i} className="h-72 rounded-3xl animate-pulse" style={{ background: 'rgba(75,0,130,0.04)' }} />)}
                </div>
              </div>
            ) : articles.length === 0 ? (
              <div className="text-center py-24 rounded-3xl" style={{ background: 'rgba(75,0,130,0.02)', border: '1px dashed rgba(75,0,130,0.12)' }}>
                <Newspaper className="w-12 h-12 mx-auto mb-4" style={{ color: 'rgba(75,0,130,0.18)' }} />
                <h3 className="font-display font-bold text-xl mb-2 text-dark">No articles found</h3>
                <p className="text-sm mb-5 text-muted-foreground">
                  {query ? `Nothing matched "${query}". Try a different keyword.` : 'No articles in this category yet.'}
                </p>
                <button onClick={() => { setSearch(''); setQuery(''); changeCat('All') }} className="btn-secondary !text-sm !py-2.5 !px-6">
                  Browse All Articles
                </button>
              </div>
            ) : (
              <>
                {featured && !query && (
                  <div className="mb-6">
                    <NewsCard article={featured} featured />
                  </div>
                )}
                {(query ? articles : rest).length > 0 && (
                  <div className="grid sm:grid-cols-2 xl:grid-cols-3 gap-5 mb-10">
                    {(query ? articles : rest).map(a => <NewsCard key={a.id} article={a} />)}
                  </div>
                )}
                {/* Pagination */}
                {totalPages > 1 && (
                  <div className="flex justify-center items-center gap-2 mt-4">
                    <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1}
                      className="w-10 h-10 rounded-full flex items-center justify-center transition-all disabled:opacity-30"
                      style={{ background: page === 1 ? 'rgba(75,0,130,0.06)' : 'linear-gradient(135deg,#4b0082,#a57fc0)', color: page === 1 ? '#A3A3A3' : '#fff' }}>
                      <ChevronLeft className="w-4 h-4"/>
                    </button>
                    {Array.from({ length: Math.min(totalPages, 7) }, (_, i) => {
                      let p
                      if (totalPages <= 7) p = i + 1
                      else if (page <= 4) p = i + 1
                      else if (page >= totalPages - 3) p = totalPages - 6 + i
                      else p = page - 3 + i
                      if (p < 1 || p > totalPages) return null
                      return (
                        <button key={p} onClick={() => setPage(p)}
                          className="w-10 h-10 rounded-full flex items-center justify-center text-sm font-semibold transition-all"
                          style={{
                            background: page === p ? 'linear-gradient(135deg,#4b0082,#a57fc0)' : '#fff',
                            color:      page === p ? '#fff' : '#4b0082',
                            boxShadow:  '0 2px 8px rgba(75,0,130,0.1)',
                          }}>
                          {p}
                        </button>
                      )
                    })}
                    <button onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages}
                      className="w-10 h-10 rounded-full flex items-center justify-center transition-all disabled:opacity-30"
                      style={{ background: 'linear-gradient(135deg,#4b0082,#a57fc0)', color: '#fff' }}>
                      <ChevronRight className="w-4 h-4"/>
                    </button>
                  </div>
                )}
              </>
            )}
          </div>

          {/* Right sidebar */}
          <aside className="w-full lg:w-72 xl:w-80 flex-shrink-0 space-y-6">

            {mostRead.length > 0 && (
              <div className="rounded-3xl p-5 bg-white"
                style={{ boxShadow: '0 4px 24px rgba(75,0,130,0.07)', border: '1px solid rgba(75,0,130,0.06)' }}>
                <div className="flex items-center gap-2 mb-4">
                  <div className="w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0"
                    style={{ background: 'linear-gradient(135deg,#a57fc0,#a57fc0)' }}>
                    <Flame className="w-4 h-4 text-white"/>
                  </div>
                  <h3 className="font-display font-bold text-sm text-dark">Most Read</h3>
                </div>
                <div className="space-y-2">
                  {mostRead.slice(0, 5).map((a, i) => (
                    <div key={a.id} className="flex items-start gap-3">
                      <span className="font-display font-bold text-lg leading-none flex-shrink-0 w-6 text-right"
                        style={{ color: i === 0 ? '#a57fc0' : 'rgba(75,0,130,0.2)' }}>
                        {String(i + 1).padStart(2, '0')}
                      </span>
                      <NewsCard article={a} horizontal />
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="rounded-3xl p-5 bg-white"
              style={{ boxShadow: '0 4px 24px rgba(75,0,130,0.07)', border: '1px solid rgba(75,0,130,0.06)' }}>
              <div className="flex items-center gap-2 mb-4">
                <div className="w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0"
                  style={{ background: 'linear-gradient(135deg,#4b0082,#a57fc0)' }}>
                  <LayoutGrid className="w-4 h-4 text-white"/>
                </div>
                <h3 className="font-display font-bold text-sm text-dark">Browse by Topic</h3>
              </div>
              <div className="space-y-0.5">
                {CATS.filter(c => c !== 'All').map(c => {
                  const Icon   = CAT_ICONS[c]
                  const active = cat === c
                  return (
                    <button key={c} onClick={() => changeCat(c)}
                      className="w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-sm font-medium transition-all text-left"
                      style={{ background: active ? 'rgba(75,0,130,0.07)' : 'transparent', color: active ? '#4b0082' : '#525252' }}>
                      {Icon && (
                        <div className="w-6 h-6 rounded-lg flex items-center justify-center flex-shrink-0"
                          style={{ background: active ? 'rgba(75,0,130,0.12)' : 'rgba(75,0,130,0.05)' }}>
                          <Icon className="w-3.5 h-3.5" style={{ color: active ? '#4b0082' : '#A3A3A3' }} />
                        </div>
                      )}
                      <span className="flex-1">{c}</span>
                      {active && <Check className="w-3 h-3 flex-shrink-0 text-primary-500" />}
                    </button>
                  )
                })}
              </div>
            </div>

            {/* Mini newsletter */}
            <div className="rounded-3xl p-5 relative overflow-hidden"
              style={{ background: 'linear-gradient(135deg,#2d004e,#430075)', border: '1px solid rgba(240,165,0,0.15)' }}>
              <div className="wave-pattern absolute inset-0 opacity-30" />
              <div className="relative">
                <div className="w-10 h-10 rounded-xl flex items-center justify-center mb-3"
                  style={{ background: 'linear-gradient(135deg,#a57fc0,#a57fc0)' }}>
                  <Mail className="w-4 h-4 text-white"/>
                </div>
                <h3 className="font-display font-bold text-base text-white mb-1">Stay Updated</h3>
                <p className="text-xs mb-4 text-white/55">
                  Get the latest stories in your inbox.
                </p>
                {subState === 'success' ? (
                  <div className="flex items-center gap-2 py-3 px-4 rounded-xl"
                    style={{ background: 'rgba(240,165,0,0.15)', border: '1px solid rgba(240,165,0,0.25)' }}>
                    <CheckCircle2 className="w-4 h-4 text-gold"/>
                    <span className="text-xs font-semibold text-gold">Subscribed!</span>
                  </div>
                ) : (
                  <form onSubmit={handleSubscribe} className="space-y-2">
                    <input type="email" value={subEmail} onChange={e => setSubEmail(e.target.value)}
                      required placeholder="your@email.com"
                      className="w-full px-4 py-2.5 rounded-xl text-sm outline-none text-white"
                      style={{ background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.12)' }} />
                    {subState === 'error' && (
                      <p className="text-[10px] text-red-400">Something went wrong. Try again.</p>
                    )}
                    <button type="submit" disabled={subState === 'loading'}
                      className="w-full py-2.5 rounded-xl text-sm font-semibold transition-all flex items-center justify-center gap-2 text-white"
                      style={{ background: 'linear-gradient(135deg,#a57fc0,#a57fc0)', opacity: subState === 'loading' ? 0.7 : 1 }}>
                      {subState === 'loading'
                        ? <><Loader2 className="w-3 h-3 animate-spin"/>Subscribing…</>
                        : 'Subscribe'}
                    </button>
                  </form>
                )}
              </div>
            </div>
          </aside>
        </div>
      </div>

      {/* Newsletter CTA bottom */}
      <section className="py-16 px-6" style={{ background: 'linear-gradient(135deg,#2d004e,#430075)' }}>
        <div className="max-w-xl mx-auto text-center">
          <div className="w-14 h-14 rounded-2xl flex items-center justify-center mx-auto mb-4"
            style={{ background: 'linear-gradient(135deg,#a57fc0,#a57fc0)' }}>
            <Mail className="w-6 h-6 text-white"/>
          </div>
          <h3 className="font-display font-bold text-2xl text-white mb-2">Never Miss a Story</h3>
          <p className="text-sm mb-6 text-white/60">
            Subscribe to get the latest articles, village news, and project updates delivered to your inbox.
          </p>
          {subState === 'success' ? (
            <div className="flex items-center justify-center gap-3 py-4 px-6 rounded-2xl mx-auto max-w-sm"
              style={{ background: 'rgba(240,165,0,0.15)', border: '1px solid rgba(240,165,0,0.25)' }}>
              <CheckCircle2 className="w-5 h-5 text-gold"/>
              <div className="text-left">
                <div className="font-semibold text-sm text-white">You're subscribed!</div>
                <div className="text-xs text-white/55">Watch your inbox for updates.</div>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubscribe} className="flex gap-2 max-w-sm mx-auto">
              <input name="email" type="email" required placeholder="Your email address"
                value={subEmail} onChange={e => setSubEmail(e.target.value)}
                className="flex-1 px-4 py-3 rounded-xl text-sm outline-none text-white"
                style={{ background: 'rgba(255,255,255,0.1)', border: '1px solid rgba(255,255,255,0.15)' }} />
              <button type="submit" disabled={subState === 'loading'} className="btn-gold !py-3 !px-5 !text-sm whitespace-nowrap"
                style={{ opacity: subState === 'loading' ? 0.7 : 1 }}>
                {subState === 'loading' ? <Loader2 className="w-4 h-4 animate-spin"/> : 'Subscribe'}
              </button>
            </form>
          )}
          {subState === 'error' && (
            <p className="text-xs mt-2 text-red-400">Something went wrong. Please try again.</p>
          )}
        </div>
      </section>
    </div>
  )
}
