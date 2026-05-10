import { useState, useEffect, useRef } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { useQuery } from 'react-query'
import api from '../../services/api'
import NewsCard from '../common/NewsCard'

const CATS = ['All','Projects','Education','Community','Health','Culture','Success']
const LIMIT = 9

export default function NewsPage() {
  const [searchParams, setSearchParams] = useSearchParams()
  const [cat,    setCat]    = useState(searchParams.get('cat') || 'All')
  const [page,   setPage]   = useState(1)
  const [search, setSearch] = useState('')
  const [query,  setQuery]  = useState('')
  const searchRef = useRef(null)

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

  const { data, isLoading } = useQuery(
    ['news-page', page, cat, query],
    () => api.get('/news', { params: { page, limit: LIMIT, category: cat === 'All' ? undefined : cat, search: query || undefined } }).then(r => r.data),
    { keepPreviousData: true }
  )

  const articles    = data?.articles || []
  const totalPages  = data?.totalPages || 1
  const total       = data?.total || 0
  const featured    = articles[0]
  const rest        = articles.slice(1)

  const changeCat = (c) => { setCat(c); setSearch(''); setQuery('') }

  return (
    <div style={{background:'#F9F7FD', minHeight:'100vh'}}>
      {/* ── Hero ── */}
      <div className="page-hero relative overflow-hidden">
        <div className="absolute inset-0 opacity-10" style={{backgroundImage:'radial-gradient(circle at 20% 50%, #F0A500 0%, transparent 50%), radial-gradient(circle at 80% 20%, #7B4DB8 0%, transparent 40%)'}}/>
        <div className="relative max-w-5xl mx-auto px-6 py-20 text-center">
          <div className="inline-flex items-center gap-2 mb-4 px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-widest"
            style={{background:'rgba(240,165,0,0.15)',color:'#F0A500',border:'1px solid rgba(240,165,0,0.25)'}}>
            <i className="fas fa-newspaper text-[10px]"/>News & Articles
          </div>
          <h1 className="font-display font-bold text-4xl md:text-5xl text-white mb-4 leading-tight">
            Village <span style={{color:'#F0A500'}}>Stories</span> &amp; Updates
          </h1>
          <p className="text-base mb-8 max-w-xl mx-auto" style={{color:'rgba(255,255,255,0.65)',fontFamily:'Poppins,sans-serif'}}>
            Stay informed with the latest news, project updates, and community highlights from Nkenkak-Ngiesang.
          </p>

          {/* Search bar */}
          <div className="max-w-lg mx-auto relative">
            <i className="fas fa-search absolute left-4 top-1/2 -translate-y-1/2 text-sm" style={{color:'#A3A3A3'}}/>
            <input
              ref={searchRef}
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search articles…"
              className="w-full pl-10 pr-4 py-3.5 rounded-2xl text-sm outline-none shadow-card-lg"
              style={{background:'rgba(255,255,255,0.95)',color:'#1A0A35',fontFamily:'Poppins,sans-serif',border:'none'}}/>
            {search && (
              <button onClick={() => { setSearch(''); setQuery('') }}
                className="absolute right-3 top-1/2 -translate-y-1/2 w-6 h-6 rounded-full flex items-center justify-center hover:bg-gray-100"
                style={{color:'#A3A3A3'}}>
                <i className="fas fa-times text-xs"/>
              </button>
            )}
          </div>

          {/* Breadcrumb */}
          <div className="flex items-center justify-center gap-2 text-xs mt-6" style={{color:'rgba(255,255,255,0.5)',fontFamily:'Poppins,sans-serif'}}>
            <Link to="/" className="hover:text-white transition-colors flex items-center gap-1"><i className="fas fa-home text-[10px]"/>Home</Link>
            <i className="fas fa-chevron-right text-[8px]" style={{color:'#F0A500'}}/>
            <span style={{color:'#F0A500'}}>News</span>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-12">

        {/* ── Category filter ── */}
        <div className="flex flex-wrap gap-2 mb-8 justify-center">
          {CATS.map(c => (
            <button key={c} onClick={() => changeCat(c)}
              className="px-4 py-2 rounded-full text-xs font-semibold transition-all capitalize"
              style={{
                background: cat === c ? 'linear-gradient(135deg,#5B2D8E,#7B4DB8)' : '#fff',
                color:      cat === c ? '#fff' : '#5B2D8E',
                fontFamily: 'Sora,sans-serif',
                boxShadow:  cat === c ? '0 4px 16px rgba(91,45,142,0.3)' : '0 2px 8px rgba(91,45,142,0.07)',
              }}>
              {c}
            </button>
          ))}
        </div>

        {/* Results count + search badge */}
        {(query || cat !== 'All') && !isLoading && (
          <div className="flex items-center gap-3 mb-6">
            <p className="text-sm" style={{color:'#737373',fontFamily:'Poppins,sans-serif'}}>
              <strong style={{color:'#1A0A35'}}>{total}</strong> article{total !== 1 ? 's' : ''} found
              {query && <> for <em>"{query}"</em></>}
            </p>
            <button onClick={() => { setSearch(''); setQuery(''); changeCat('All') }}
              className="text-xs font-semibold px-3 py-1 rounded-full transition-all hover:opacity-80"
              style={{background:'rgba(91,45,142,0.08)',color:'#5B2D8E',fontFamily:'Sora,sans-serif'}}>
              Clear filters
            </button>
          </div>
        )}

        {isLoading ? (
          <div className="space-y-6">
            <div className="h-96 rounded-3xl animate-pulse" style={{background:'rgba(91,45,142,0.06)'}}/>
            <div className="grid md:grid-cols-3 gap-6">
              {[1,2,3,4,5,6].map(i => <div key={i} className="h-72 rounded-3xl animate-pulse" style={{background:'rgba(91,45,142,0.04)'}}/>)}
            </div>
          </div>
        ) : articles.length === 0 ? (
          <div className="text-center py-24 rounded-3xl" style={{background:'rgba(91,45,142,0.02)',border:'1px dashed rgba(91,45,142,0.12)'}}>
            <i className="fas fa-newspaper text-5xl mb-4 block" style={{color:'rgba(91,45,142,0.18)'}}/>
            <h3 className="font-display font-bold text-xl mb-2" style={{color:'#1A0A35'}}>No articles found</h3>
            <p className="text-sm mb-5" style={{color:'#737373',fontFamily:'Poppins,sans-serif'}}>
              {query ? `Nothing matched "${query}". Try a different keyword.` : 'No articles in this category yet.'}
            </p>
            <button onClick={() => { setSearch(''); setQuery(''); changeCat('All') }} className="btn-secondary !text-sm !py-2.5 !px-6">
              Browse All Articles
            </button>
          </div>
        ) : (
          <>
            {/* Featured hero card */}
            {featured && !query && (
              <div className="mb-8">
                <NewsCard article={featured} featured/>
              </div>
            )}

            {/* Grid */}
            {(query ? articles : rest).length > 0 && (
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-10">
                {(query ? articles : rest).map(a => <NewsCard key={a.id} article={a}/>)}
              </div>
            )}

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex justify-center items-center gap-2 mt-4">
                <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1}
                  className="w-10 h-10 rounded-full flex items-center justify-center transition-all disabled:opacity-30"
                  style={{background: page === 1 ? 'rgba(91,45,142,0.06)' : 'linear-gradient(135deg,#5B2D8E,#7B4DB8)', color: page === 1 ? '#A3A3A3' : '#fff', cursor: page === 1 ? 'not-allowed' : 'pointer'}}>
                  <i className="fas fa-chevron-left text-xs"/>
                </button>

                {Array.from({ length: Math.min(totalPages, 7) }, (_, i) => {
                  // Show pages near current
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
                  style={{background:'linear-gradient(135deg,#5B2D8E,#7B4DB8)', color:'#fff', cursor: page === totalPages ? 'not-allowed' : 'pointer'}}>
                  <i className="fas fa-chevron-right text-xs"/>
                </button>
              </div>
            )}
          </>
        )}
      </div>

      {/* ── Newsletter CTA ── */}
      <section className="py-16 px-6" style={{background:'linear-gradient(135deg,#1A0A35,#250F47)'}}>
        <div className="max-w-xl mx-auto text-center">
          <div className="w-14 h-14 rounded-2xl flex items-center justify-center mx-auto mb-4" style={{background:'linear-gradient(135deg,#F0A500,#FFB84D)'}}>
            <i className="fas fa-envelope text-white text-xl"/>
          </div>
          <h3 className="font-display font-bold text-2xl text-white mb-2">Never Miss a Story</h3>
          <p className="text-sm mb-6" style={{color:'rgba(255,255,255,0.6)',fontFamily:'Poppins,sans-serif'}}>
            Subscribe to get the latest articles, village news, and project updates delivered to your inbox.
          </p>
          <form onSubmit={e => { e.preventDefault(); const em = e.target.email.value; if(em) { api.post('/newsletter/subscribe',{email:em}).then(()=>{e.target.reset()}).catch(()=>{}) } }}
            className="flex gap-2 max-w-sm mx-auto">
            <input name="email" type="email" required placeholder="Your email address"
              className="flex-1 px-4 py-3 rounded-xl text-sm outline-none"
              style={{background:'rgba(255,255,255,0.1)',color:'#fff',border:'1px solid rgba(255,255,255,0.15)',fontFamily:'Poppins,sans-serif'}}/>
            <button type="submit" className="btn-gold !py-3 !px-5 !text-sm whitespace-nowrap">
              Subscribe
            </button>
          </form>
        </div>
      </section>
    </div>
  )
}
