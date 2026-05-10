import { useState } from 'react'
import { useQuery } from 'react-query'
import { Link, useParams } from 'react-router-dom'
import { format } from 'date-fns'
import api from '../../services/api'

const CAT_META = {
  customs:    { label: 'Customs & Traditions', icon: 'fa-drum', color: '#5B2D8E' },
  proverbs:   { label: 'Proverbs & Wisdom',    icon: 'fa-quote-left', color: '#F0A500' },
  recipes:    { label: 'Food & Recipes',        icon: 'fa-utensils', color: '#16a34a' },
  history:    { label: 'Village History',       icon: 'fa-landmark', color: '#0284c7' },
  language:   { label: 'Language & Words',      icon: 'fa-language', color: '#7B4DB8' },
  nature:     { label: 'Nature & Environment',  icon: 'fa-leaf', color: '#15803d' },
  governance: { label: 'Governance',            icon: 'fa-balance-scale', color: '#C87800' },
}

function WikiArticle({ slug }) {
  const { data: page, isLoading } = useQuery(['wiki', slug], () => api.get(`/wiki/${slug}`).then(r => r.data))

  if (isLoading) return <div className="h-96 rounded-3xl animate-pulse" style={{ background: 'rgba(91,45,142,0.05)' }}/>
  if (!page) return <div className="text-center py-20"><h3 style={{ color: '#1A0A35' }}>Page not found</h3></div>

  const meta = CAT_META[page.category] || CAT_META.customs

  return (
    <article>
      <Link to="/wiki" className="inline-flex items-center gap-2 text-xs font-semibold mb-6 hover:gap-3 transition-all" style={{ color: '#5B2D8E', fontFamily: 'Sora,sans-serif' }}>
        <i className="fas fa-arrow-left"/>Back to Knowledge Base
      </Link>
      {page.coverImage && <img src={page.coverImage} alt={page.title} className="w-full h-64 object-cover rounded-3xl mb-8"/>}
      <div className="flex items-center gap-2 mb-3">
        <span className="text-xs font-bold px-3 py-1 rounded-full" style={{ background: meta.color + '15', color: meta.color }}><i className={`fas ${meta.icon} mr-1`}/>{meta.label}</span>
      </div>
      <h1 className="font-display font-bold text-3xl md:text-4xl mb-3" style={{ color: '#1A0A35' }}>{page.title}</h1>
      <div className="flex items-center gap-3 text-xs mb-8" style={{ color: '#A3A3A3', fontFamily: 'Poppins,sans-serif' }}>
        {page.author && <span>By {page.author.firstName} {page.author.lastName}</span>}
        <span>·</span>
        <span>{format(new Date(page.updatedAt), 'MMMM d, yyyy')}</span>
        <span>·</span>
        <span><i className="fas fa-eye mr-1"/>{page.viewCount} views</span>
      </div>
      <div className="prose prose-sm max-w-none" style={{ color: '#374151', fontFamily: 'Poppins,sans-serif', lineHeight: 1.8 }}
        dangerouslySetInnerHTML={{ __html: page.content }}/>
    </article>
  )
}

export default function WikiPage() {
  const { slug } = useParams()
  const [catFilter, setCatFilter] = useState('')

  const { data: pages = [], isLoading } = useQuery(['wiki-list', catFilter],
    () => api.get(`/wiki${catFilter ? `?category=${catFilter}` : ''}`).then(r => r.data),
    { enabled: !slug })

  // Group by category
  const grouped = {}
  pages.forEach(p => { if (!grouped[p.category]) grouped[p.category] = []; grouped[p.category].push(p) })

  if (slug) {
    return (
      <div style={{ background: '#F9F7FD', minHeight: '100vh' }}>
        <div className="max-w-3xl mx-auto px-6 py-12"><WikiArticle slug={slug}/></div>
      </div>
    )
  }

  return (
    <div style={{ background: '#F9F7FD', minHeight: '100vh' }}>
      <div className="relative py-20 overflow-hidden" style={{ background: 'linear-gradient(135deg,#1A0A35,#250F47)' }}>
        <div className="wave-pattern absolute inset-0 opacity-20"/>
        <div className="relative max-w-4xl mx-auto px-6 text-center">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full mb-5" style={{ background: 'rgba(240,165,0,0.15)', border: '1px solid rgba(240,165,0,0.25)' }}>
            <i className="fas fa-book-open text-xs" style={{ color: '#F0A500' }}/>
            <span className="text-xs font-bold uppercase tracking-widest" style={{ color: '#F0A500', fontFamily: 'Sora,sans-serif' }}>Living Heritage</span>
          </div>
          <h1 className="font-display font-bold text-4xl md:text-5xl text-white mb-4">Traditional <span style={{ color: '#F0A500' }}>Knowledge</span></h1>
          <p className="text-base max-w-xl mx-auto" style={{ color: 'rgba(255,255,255,0.65)', fontFamily: 'Poppins,sans-serif' }}>Our community's living library — preserving the customs, wisdom, and stories of Nkenkak-Ngiesang for future generations.</p>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-6 py-10">
        {/* Category filter */}
        <div className="flex flex-wrap gap-2 mb-10">
          <button onClick={() => setCatFilter('')} className="text-xs font-semibold px-4 py-2 rounded-xl transition-all" style={{ background: !catFilter ? '#5B2D8E' : 'rgba(91,45,142,0.07)', color: !catFilter ? '#fff' : '#737373', fontFamily: 'Sora,sans-serif' }}>All</button>
          {Object.entries(CAT_META).map(([v,m]) => (
            <button key={v} onClick={() => setCatFilter(v === catFilter ? '' : v)}
              className="flex items-center gap-1.5 text-xs font-semibold px-4 py-2 rounded-xl transition-all"
              style={{ background: catFilter === v ? m.color : m.color + '12', color: catFilter === v ? '#fff' : m.color, fontFamily: 'Sora,sans-serif' }}>
              <i className={`fas ${m.icon} text-[10px]`}/>{m.label}
            </button>
          ))}
        </div>

        {isLoading ? (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">{[1,2,3,4,5,6].map(i => <div key={i} className="h-40 rounded-3xl animate-pulse" style={{ background: 'rgba(91,45,142,0.05)' }}/>)}</div>
        ) : !pages.length ? (
          <div className="text-center py-20 rounded-3xl" style={{ background: 'rgba(91,45,142,0.02)', border: '1px dashed rgba(91,45,142,0.12)' }}>
            <i className="fas fa-book-open text-5xl mb-4 block" style={{ color: 'rgba(91,45,142,0.18)' }}/>
            <h3 className="font-display font-bold text-xl mb-2" style={{ color: '#1A0A35' }}>Knowledge base coming soon</h3>
            <p className="text-sm" style={{ color: '#737373', fontFamily: 'Poppins,sans-serif' }}>Community articles about our traditions, customs, and history will appear here.</p>
          </div>
        ) : catFilter ? (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
            {pages.map(p => <PageCard key={p.id} page={p}/>)}
          </div>
        ) : (
          Object.entries(grouped).map(([cat, catPages]) => {
            const meta = CAT_META[cat] || CAT_META.customs
            return (
              <div key={cat} className="mb-12">
                <div className="flex items-center gap-2 mb-5">
                  <div className="w-8 h-8 rounded-xl flex items-center justify-center" style={{ background: meta.color + '15' }}>
                    <i className={`fas ${meta.icon} text-sm`} style={{ color: meta.color }}/>
                  </div>
                  <h2 className="font-display font-bold text-lg" style={{ color: '#1A0A35' }}>{meta.label}</h2>
                  <span className="text-xs font-semibold px-2 py-0.5 rounded-full" style={{ background: 'rgba(91,45,142,0.08)', color: '#5B2D8E' }}>{catPages.length}</span>
                </div>
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
                  {catPages.map(p => <PageCard key={p.id} page={p}/>)}
                </div>
              </div>
            )
          })
        )}
      </div>
    </div>
  )
}

function PageCard({ page }) {
  const meta = CAT_META[page.category] || CAT_META.customs
  return (
    <Link to={`/wiki/${page.slug}`} className="block card p-5 transition-all hover:-translate-y-1 hover:shadow-xl" style={{ borderTop: `3px solid ${meta.color}` }}>
      {page.coverImage && <img src={page.coverImage} alt={page.title} className="w-full h-32 object-cover rounded-2xl mb-4"/>}
      <div className="flex items-center gap-1.5 mb-2">
        <i className={`fas ${meta.icon} text-xs`} style={{ color: meta.color }}/>
        <span className="text-[10px] font-bold uppercase tracking-widest" style={{ color: meta.color, fontFamily: 'Sora,sans-serif' }}>{meta.label}</span>
      </div>
      <h3 className="font-display font-bold text-sm leading-snug mb-2" style={{ color: '#1A0A35' }}>{page.title}</h3>
      <div className="flex items-center justify-between text-[10px]" style={{ color: '#A3A3A3', fontFamily: 'Poppins,sans-serif' }}>
        <span>{format(new Date(page.updatedAt), 'MMM d, yyyy')}</span>
        <span><i className="fas fa-eye mr-1"/>{page.viewCount}</span>
      </div>
    </Link>
  )
}
