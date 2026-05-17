import { useState, useEffect, useRef } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { useQuery } from 'react-query'
import api from '../../services/api'
import NewsCard from '../common/NewsCard'

const CATS = ['All','Projects','Education','Community','Health','Culture','Success','Governance']
const LIMIT = 9

export default function NewsPage() {
  const [searchParams, setSearchParams] = useSearchParams()
  const [cat,    setCat]    = useState(searchParams.get('cat') || 'All')
  const [page,   setPage]   = useState(1)
  const [search, setSearch] = useState('')
  const [query,  setQuery]  = useState('')
  const [subEmail, setSubEmail]   = useState('')
  const [subState, setSubState]   = useState('idle') // idle | loading | success | error
  const searchRef  = useRef(null)
  const gridTopRef = useRef(null)

  // Debounce search
  useEffect(() => {
    const t = setTimeout(() => { setQuery(search); setPage(1) }, 350)
    return () => clearTimeout(t)
  }, [search])

  // Sync cat to URL
  useEffect(() => {
    if (cat === 'All') searchParams.delete('cat')
    else searchParams.set('cat', cat)
    setSearchParams(searchParams, { replace: true })
    setPage(1)
  }, [cat])

  // Scroll to grid top on page change
  useEffect(() => {
    if (page > 1) gridTopRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }, [page])

  const { data, isLoading } = useQuery(
    ['news-page', page, cat, query],
    () => api.get('/news', { params: { page, limit: LIMIT, category: cat === 'All' ? undefined : cat, search: query || undefined } }).then(r => r.data),
    { keepPreviousData: true }
  )

  // Fetch most-read for sidebar
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
    <div style={{ background: '#F9F7FD', minHeight: '100vh' }}>

      {/* ── Hero ── */}
      <div className="page-hero relative overflow-hidden">
        <div className="absolute inset-0 opacity-10"
          style={{ backgroundImage: 'radial-gradient(circle at 20% 50%, #F0A500 0%, transparent 50%), radial-gradient(circle at 80% 20%, #7B4DB8 0%, transparent 40%)' }} />
        <div className="relative max-w-5xl mx-auto px-6 py-20 text-center">
          <div className="inline-flex items-center gap-2 mb-4 px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-widest"
            style={{ background: 'rgba(240,165,0,0.15)', color: '#F0A500', border: '1px solid rgba(240,165,0,0.25)' }}>
            <i className="fas fa-newspaper text-[10px]" />News & Articles
          </div>
          <h1 className="font-display font-bold text-4xl md:text-5xl text-white mb-4 leading-tight">
            Village <span style={{ color: '#F0A500' }}>Stories</span> &amp; Updates
          </h1>
          <p className="text-base mb-8 max-w-xl mx-auto" style={{ color: 'rgba(255,255,255,0.65)', fontFamily: 'Poppins,sans-serif' }}>
            Stay informed with the latest news, project updates, and community highlights from Nkenkak-Ngiesang.
          </p>
          {/* Search */}
          <div className="max-w-lg mx-auto relative">
            <i className="fas fa-search absolute left-4 top-1/2 -translate-y-1/2 text-sm" style={{ color: '#A3A3A3' }} />
            <input ref={searchRef} value={search} onChange={e => setSearch(e.target.value)}
              placeholder="Search articles…"
              className="w-full pl-10 pr-10 py-3.5 rounded-2xl text-sm outline-none"
              style={{ background: 'rgba(255,255,255,0.95)', color: '#1A0A35', fontFamily: 'Poppins,sans-serif', border: 'none', boxShadow: '0 8px 32px rgba(0,0,0,0.15)' }} />
            {search && (
              <button onClick={() => { setSearch(''); setQuery('') }}
                className="absolute right-3 top-1/2 -translate-y-1/2 w-6 h-6 rounded-full flex items-center justify-center hover:bg-gray-100"
                style={{ color: '#A3A3A3' }}>
                <i className="fas fa-times text-xs" />
              </button>
            )}
          </div>
          {/* Breadcrumb */}
          <div className="flex items-center justify-center gap-2 text-xs mt-6" style={{ color: 'rgba(255,255,255,0.5)', fontFamily: 'Poppins,sans-serif' }}>
            <Link to="/" className="hover:text-white transition-colors flex items-center gap-1"><i className="fas fa-home text-[10px]" />Home</Link>
            <i className="fas fa-chevron-right text-[8px]" style={{ color: '#F0A500' }} />
            <span style={{ color: '#F0A500' }}>News</span>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 md:px-6 py-10">

        {/* ── Category filter — horizontal scroll on mobile ── */}
        <div className="flex gap-2 overflow-x-auto pb-2 mb-8" style={{ scrollbarWidth: 'none' }}>
          <style>{`.cat-strip::-webkit-scrollbar{display:none}`}</style>
          {CATS.map(c => (
            <button key={c} onClick={() => changeCat(c)}
              className="px-4 py-2 rounded-full text-xs font-semibold transition-all capitalize flex-shrink-0"
              style={{
                background: cat === c ? 'linear-gradient(135deg,#5B2D8E,#7B4DB8)' : '#fff',
                color:      cat === c ? '#fff' : '#5B2D8E',
                fontFamily: 'Sora,sans-serif',
                boxShadow:  cat === c ? '0 4px 16px rgba(91,45,142,0.3)' : '0 2px 8px rgba(91,45,142,0.07)',
                border:     `1.5px solid ${cat === c ? 'transparent' : 'rgba(91,45,142,0.1)'}`,
              }}>
              {c}
            </button>
          ))}
        </div>

        {/* Results count */}
        {(query || cat !== 'All') && !isLoading && (
          <div className="flex items-center gap-3 mb-6">
            <p className="text-sm" style={{ color: '#737373', fontFamily: 'Poppins,sans-serif' }}>
              <strong style={{ color: '#1A0A35' }}>{total}</strong> article{total !== 1 ? 's' : ''} found
              {query && <> for <em>"{query}"</em></>}
            </p>
            <button onClick={() => { setSearch(''); setQuery(''); changeCat('All') }}
              className="text-xs font-semibold px-3 py-1 rounded-full"
              style={{ background: 'rgba(91,45,142,0.08)', color: '#5B2D8E', fontFamily: 'Sora,sans-serif' }}>
              Clear filters
            </button>
          </div>
        )}

        {/* ── Main layout: content + sidebar ── */}
        <div ref={gridTopRef} className="flex flex-col lg:flex-row gap-8">

          {/* Left — articles */}
          <div className="flex-1 min-w-0">
            {isLoading ? (
              <div className="space-y-6">
                <div className="h-96 rounded-3xl animate-pulse" style={{ background: 'rgba(91,45,142,0.06)' }} />
                <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
                  {[1,2,3,4,5,6].map(i => <div key={i} className="h-72 rounded-3xl animate-pulse" style={{ background: 'rgba(91,45,142,0.04)' }} />)}
                </div>
              </div>
            ) : articles.length === 0 ? (
              <div className="text-center py-24 rounded-3xl" style={{ background: 'rgba(91,45,142,0.02)', border: '1px dashed rgba(91,45,142,0.12)' }}>
                <i className="fas fa-newspaper text-5xl mb-4 block" style={{ color: 'rgba(91,45,142,0.18)' }} />
                <h3 className="font-display font-bold text-xl mb-2" style={{ color: '#1A0A35' }}>No articles found</h3>
                <p className="text-sm mb-5" style={{ color: '#737373', fontFamily: 'Poppins,sans-serif' }}>
                  {query ? `Nothing matched "${query}". Try a different keyword.` : 'No articles in this category yet.'}
                </p>
                <button onClick={() => { setSearch(''); setQuery(''); changeCat('All') }} className="btn-secondary !text-sm !py-2.5 !px-6">
                  Browse All Articles
                </button>
              </div>
            ) : (
              <>
                {/* Featured */}
                {featured && !query && (
                  <div className="mb-6">
                    <NewsCard article={featured} featured />
                  </div>
                )}
                {/* Grid */}
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
                      style={{ background: page === 1 ? 'rgba(91,45,142,0.06)' : 'linear-gradient(135deg,#5B2D8E,#7B4DB8)', color: page === 1 ? '#A3A3A3' : '#fff' }}>
                      <i className="fas fa-chevron-left text-xs" />
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
                            background: page === p ? 'linear-gradient(135deg,#5B2D8E,#7B4DB8)' : '#fff',
                            color:      page === p ? '#fff' : '#5B2D8E',
                            boxShadow:  '0 2px 8px rgba(91,45,142,0.1)',
                            fontFamily: 'Sora,sans-serif',
                          }}>
                          {p}
                        </button>
                      )
                    })}
                    <button onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages}
                      className="w-10 h-10 rounded-full flex items-center justify-center transition-all disabled:opacity-30"
                      style={{ background: 'linear-gradient(135deg,#5B2D8E,#7B4DB8)', color: '#fff' }}>
                      <i className="fas fa-chevron-right text-xs" />
                    </button>
                  </div>
                )}
              </>
            )}
          </div>

          {/* ── Right sidebar ── */}
          <aside className="w-full lg:w-72 xl:w-80 flex-shrink-0 space-y-6">

            {/* Most Read */}
            {mostRead.length > 0 && (
              <div className="rounded-3xl p-5" style={{ background: '#fff', boxShadow: '0 4px 24px rgba(91,45,142,0.07)', border: '1px solid rgba(91,45,142,0.06)' }}>
                <div className="flex items-center gap-2 mb-4">
                  <div className="w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0"
                    style={{ background: 'linear-gradient(135deg,#F0A500,#FFB84D)' }}>
                    <i className="fas fa-fire text-sm text-white" />
                  </div>
                  <h3 className="font-display font-bold text-sm" style={{ color: '#1A0A35' }}>Most Read</h3>
                </div>
                <div className="space-y-2">
                  {mostRead.slice(0, 5).map((a, i) => (
                    <div key={a.id} className="flex items-start gap-3">
                      <span className="font-display font-bold text-lg leading-none flex-shrink-0 w-6 text-right"
                        style={{ color: i === 0 ? '#F0A500' : 'rgba(91,45,142,0.2)', fontFamily: 'Sora,sans-serif' }}>
                        {String(i + 1).padStart(2, '0')}
                      </span>
                      <NewsCard article={a} horizontal />
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Categories breakdown */}
            <div className="rounded-3xl p-5" style={{ background: '#fff', boxShadow: '0 4px 24px rgba(91,45,142,0.07)', border: '1px solid rgba(91,45,142,0.06)' }}>
              <div className="flex items-center gap-2 mb-4">
                <div className="w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0"
                  style={{ background: 'linear-gradient(135deg,#5B2D8E,#7B4DB8)' }}>
                  <i className="fas fa-th-large text-xs text-white" />
                </div>
                <h3 className="font-display font-bold text-sm" style={{ color: '#1A0A35' }}>Browse by Topic</h3>
              </div>
              <div className="space-y-1.5">
                {CATS.filter(c => c !== 'All').map(c => (
                  <button key={c} onClick={() => changeCat(c)}
                    className="w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-sm font-medium transition-all hover:bg-purple-50 text-left"
                    style={{ background: cat === c ? 'rgba(91,45,142,0.07)' : 'transparent', color: cat === c ? '#5B2D8E' : '#525252', fontFamily: 'Poppins,sans-serif' }}>
                    <span className="capitalize">{c}</span>
                    {cat === c && <i className="fas fa-check text-xs" style={{ color: '#5B2D8E' }} />}
                  </button>
                ))}
              </div>
            </div>

            {/* Mini newsletter */}
            <div className="rounded-3xl p-5 relative overflow-hidden"
              style={{ background: 'linear-gradient(135deg,#1A0A35,#250F47)', border: '1px solid rgba(240,165,0,0.15)' }}>
              <div className="wave-pattern absolute inset-0 opacity-30" />
              <div className="relative">
                <div className="w-10 h-10 rounded-xl flex items-center justify-center mb-3"
                  style={{ background: 'linear-gradient(135deg,#F0A500,#FFB84D)' }}>
                  <i className="fas fa-envelope text-white text-sm" />
                </div>
                <h3 className="font-display font-bold text-base text-white mb-1">Stay Updated</h3>
                <p className="text-xs mb-4" style={{ color: 'rgba(255,255,255,0.55)', fontFamily: 'Poppins,sans-serif' }}>
                  Get the latest stories in your inbox.
                </p>
                {subState === 'success' ? (
                  <div className="flex items-center gap-2 py-3 px-4 rounded-xl"
                    style={{ background: 'rgba(34,197,94,0.15)', border: '1px solid rgba(34,197,94,0.2)' }}>
                    <i className="fas fa-check-circle" style={{ color: '#4ade80' }} />
                    <span className="text-xs font-semibold" style={{ color: '#4ade80', fontFamily: 'Sora,sans-serif' }}>Subscribed!</span>
                  </div>
                ) : (
                  <form onSubmit={handleSubscribe} className="space-y-2">
                    <input type="email" value={subEmail} onChange={e => setSubEmail(e.target.value)}
                      required placeholder="your@email.com"
                      className="w-full px-4 py-2.5 rounded-xl text-sm outline-none"
                      style={{ background: 'rgba(255,255,255,0.08)', color: '#fff', border: '1px solid rgba(255,255,255,0.12)', fontFamily: 'Poppins,sans-serif' }} />
                    {subState === 'error' && (
                      <p className="text-[10px]" style={{ color: '#f87171', fontFamily: 'Poppins,sans-serif' }}>Something went wrong. Try again.</p>
                    )}
                    <button type="submit" disabled={subState === 'loading'}
                      className="w-full py-2.5 rounded-xl text-sm font-semibold transition-all"
                      style={{ background: 'linear-gradient(135deg,#F0A500,#FFB84D)', color: '#fff', fontFamily: 'Sora,sans-serif', opacity: subState === 'loading' ? 0.7 : 1 }}>
                      {subState === 'loading' ? <><i className="fas fa-spinner animate-spin mr-2 text-xs" />Subscribing…</> : 'Subscribe'}
                    </button>
                  </form>
                )}
              </div>
            </div>
          </aside>
        </div>
      </div>

      {/* ── Newsletter CTA (bottom, full width) ── */}
      <section className="py-16 px-6" style={{ background: 'linear-gradient(135deg,#1A0A35,#250F47)' }}>
        <div className="max-w-xl mx-auto text-center">
          <div className="w-14 h-14 rounded-2xl flex items-center justify-center mx-auto mb-4"
            style={{ background: 'linear-gradient(135deg,#F0A500,#FFB84D)' }}>
            <i className="fas fa-envelope text-white text-xl" />
          </div>
          <h3 className="font-display font-bold text-2xl text-white mb-2">Never Miss a Story</h3>
          <p className="text-sm mb-6" style={{ color: 'rgba(255,255,255,0.6)', fontFamily: 'Poppins,sans-serif' }}>
            Subscribe to get the latest articles, village news, and project updates delivered to your inbox.
          </p>
          {subState === 'success' ? (
            <div className="flex items-center justify-center gap-3 py-4 px-6 rounded-2xl mx-auto max-w-sm"
              style={{ background: 'rgba(34,197,94,0.15)', border: '1px solid rgba(34,197,94,0.25)' }}>
              <i className="fas fa-check-circle text-xl" style={{ color: '#4ade80' }} />
              <div className="text-left">
                <div className="font-semibold text-sm text-white">You're subscribed!</div>
                <div className="text-xs" style={{ color: 'rgba(255,255,255,0.55)', fontFamily: 'Poppins,sans-serif' }}>Watch your inbox for updates.</div>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubscribe} className="flex gap-2 max-w-sm mx-auto">
              <input name="email" type="email" required placeholder="Your email address"
                value={subEmail} onChange={e => setSubEmail(e.target.value)}
                className="flex-1 px-4 py-3 rounded-xl text-sm outline-none"
                style={{ background: 'rgba(255,255,255,0.1)', color: '#fff', border: '1px solid rgba(255,255,255,0.15)', fontFamily: 'Poppins,sans-serif' }} />
              <button type="submit" disabled={subState === 'loading'} className="btn-gold !py-3 !px-5 !text-sm whitespace-nowrap"
                style={{ opacity: subState === 'loading' ? 0.7 : 1 }}>
                {subState === 'loading' ? <i className="fas fa-spinner animate-spin" /> : 'Subscribe'}
              </button>
            </form>
          )}
          {subState === 'error' && (
            <p className="text-xs mt-2" style={{ color: '#f87171', fontFamily: 'Poppins,sans-serif' }}>Something went wrong. Please try again.</p>
          )}
        </div>
      </section>
    </div>
  )
}
