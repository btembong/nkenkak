import { useState } from 'react'
import { useQuery } from 'react-query'
import { Link, useParams } from 'react-router-dom'
import { format } from 'date-fns'
import api from '../../services/api'

const CAT_META = {
  customs:    { label: 'Customs & Traditions', icon: 'fa-drum',          color: '#4b0082' },
  proverbs:   { label: 'Proverbs & Wisdom',    icon: 'fa-quote-left',    color: '#a57fc0' },
  recipes:    { label: 'Food & Recipes',        icon: 'fa-utensils',      color: '#16a34a' },
  history:    { label: 'Village History',       icon: 'fa-landmark',      color: '#430075' },
  language:   { label: 'Language & Words',      icon: 'fa-language',      color: '#a57fc0' },
  nature:     { label: 'Nature & Environment',  icon: 'fa-leaf',          color: '#15803d' },
  governance: { label: 'Governance',            icon: 'fa-balance-scale', color: '#4b0082' },
}

const ALL_TABS = [
  { key: '', label: 'All', icon: 'fa-layer-group', color: '#4b0082' },
  ...Object.entries(CAT_META).map(([k, m]) => ({ key: k, ...m })),
]

function readTime(html = '') {
  const words = html.replace(/<[^>]+>/g, '').split(/\s+/).filter(Boolean).length
  return Math.max(1, Math.round(words / 200))
}

function SkeletonCard() {
  return (
    <div className="rounded-3xl overflow-hidden animate-pulse"
      style={{ background: '#fff', boxShadow: '0 2px 16px rgba(75,0,130,0.06)', border: '1px solid rgba(75,0,130,0.05)' }}>
      <div className="h-44" style={{ background: 'rgba(75,0,130,0.06)' }} />
      <div className="p-5 space-y-3">
        <div className="h-3 rounded-full w-1/3" style={{ background: 'rgba(75,0,130,0.07)' }} />
        <div className="h-4 rounded-full w-4/5" style={{ background: 'rgba(75,0,130,0.07)' }} />
        <div className="h-3 rounded-full w-2/3" style={{ background: 'rgba(75,0,130,0.05)' }} />
        <div className="h-px w-full mt-3" style={{ background: 'rgba(75,0,130,0.05)' }} />
        <div className="flex justify-between pt-1">
          <div className="h-3 rounded-full w-1/4" style={{ background: 'rgba(75,0,130,0.05)' }} />
          <div className="h-3 rounded-full w-1/5" style={{ background: 'rgba(75,0,130,0.05)' }} />
        </div>
      </div>
    </div>
  )
}

function PageCard({ page }) {
  const meta = CAT_META[page.category] || CAT_META.customs
  return (
    <Link to={`/wiki/${page.slug}`}
      className="group block rounded-3xl overflow-hidden transition-all hover:-translate-y-1 hover:shadow-xl"
      style={{ background: '#fff', boxShadow: '0 2px 16px rgba(75,0,130,0.06)', border: '1px solid rgba(75,0,130,0.06)' }}>

      {/* Cover image or gradient banner */}
      <div className="relative h-44 overflow-hidden flex-shrink-0"
        style={{ background: page.coverImage ? undefined : `linear-gradient(135deg,${meta.color}18,${meta.color}06)` }}>
        {page.coverImage
          ? <img src={page.coverImage} alt={page.title}
              className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" />
          : <div className="w-full h-full flex items-center justify-center">
              <i className={`fas ${meta.icon} text-6xl`} style={{ color: meta.color, opacity: 0.15 }} />
            </div>
        }
        {/* Category badge overlay */}
        <div className="absolute top-3 left-3">
          <span className="inline-flex items-center gap-1.5 text-[10px] font-bold px-2.5 py-1 rounded-full uppercase tracking-wide"
            style={{ background: meta.color, color: '#fff', fontFamily: '"Exo 2",sans-serif', boxShadow: `0 2px 8px ${meta.color}55` }}>
            <i className={`fas ${meta.icon} text-[8px]`} />{meta.label}
          </span>
        </div>
      </div>

      {/* Body */}
      <div className="p-5 flex flex-col flex-1">
        <h3 className="font-display font-bold text-base leading-snug mb-2" style={{ color: '#2d004e' }}>{page.title}</h3>
        {page.summary && (
          <p className="text-xs leading-relaxed mb-3"
            style={{
              color: '#737373', fontFamily: '"Exo 2",sans-serif',
              display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden',
            }}>
            {page.summary}
          </p>
        )}
        <div className="flex items-center justify-between mt-auto pt-3"
          style={{ borderTop: '1px solid rgba(75,0,130,0.06)' }}>
          <div className="flex items-center gap-3 text-[10px]" style={{ color: '#A3A3A3', fontFamily: '"Exo 2",sans-serif' }}>
            <span><i className="fas fa-calendar-alt mr-1" />{format(new Date(page.updatedAt), 'MMM d, yyyy')}</span>
            <span><i className="fas fa-eye mr-1" />{page.viewCount}</span>
          </div>
          <span className="flex items-center gap-1 text-[10px] font-semibold transition-all group-hover:gap-2"
            style={{ color: meta.color, fontFamily: '"Exo 2",sans-serif' }}>
            Read <i className="fas fa-arrow-right text-[8px]" />
          </span>
        </div>
      </div>
    </Link>
  )
}

function WikiArticle({ slug }) {
  const { data: page, isLoading } = useQuery(
    ['wiki', slug],
    () => api.get(`/wiki/${slug}`).then(r => r.data)
  )

  if (isLoading) return (
    <div className="space-y-4 animate-pulse">
      <div className="h-4 rounded-full w-1/3" style={{ background: 'rgba(75,0,130,0.07)' }} />
      <div className="h-72 rounded-3xl" style={{ background: 'rgba(75,0,130,0.06)' }} />
      <div className="h-8 rounded-full w-3/4" style={{ background: 'rgba(75,0,130,0.07)' }} />
      <div className="h-4 rounded-full w-1/2" style={{ background: 'rgba(75,0,130,0.05)' }} />
      {[90, 85, 88, 70, 82, 60].map((w, i) => (
        <div key={i} className="h-3 rounded-full" style={{ background: 'rgba(75,0,130,0.04)', width: `${w}%` }} />
      ))}
    </div>
  )
  if (!page) return (
    <div className="text-center py-20">
      <h3 className="font-display font-bold text-xl" style={{ color: '#2d004e' }}>Page not found</h3>
    </div>
  )

  const meta = CAT_META[page.category] || CAT_META.customs
  const mins = readTime(page.content)

  return (
    <article>
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-xs mb-8 flex-wrap" style={{ color: '#A3A3A3', fontFamily: '"Exo 2",sans-serif' }}>
        <Link to="/" className="hover:opacity-70 transition-opacity flex items-center gap-1">
          <i className="fas fa-home text-[10px]" /> Home
        </Link>
        <i className="fas fa-chevron-right text-[8px]" style={{ color: '#D0C0E8' }} />
        <Link to="/wiki" className="hover:opacity-70 transition-opacity">Knowledge Base</Link>
        <i className="fas fa-chevron-right text-[8px]" style={{ color: '#D0C0E8' }} />
        <span style={{ color: meta.color, fontWeight: 600 }}>{meta.label}</span>
      </div>

      {/* Article card */}
      <div className="bg-white rounded-3xl overflow-hidden"
        style={{ boxShadow: '0 4px 32px rgba(75,0,130,0.09)', border: `1px solid rgba(75,0,130,0.07)`, borderLeft: `4px solid ${meta.color}` }}>

        {/* Cover image */}
        {page.coverImage && (
          <img src={page.coverImage} alt={page.title} className="w-full h-72 object-cover" />
        )}

        {/* Header */}
        <div className="px-8 pt-8 pb-6" style={{ borderBottom: '1px solid rgba(75,0,130,0.06)' }}>
          <span className="inline-flex items-center gap-1.5 text-xs font-bold px-3 py-1 rounded-full mb-4"
            style={{ background: meta.color + '15', color: meta.color, fontFamily: '"Exo 2",sans-serif' }}>
            <i className={`fas ${meta.icon} text-[9px]`} />{meta.label}
          </span>
          <h1 className="font-display font-bold text-3xl md:text-4xl mb-4 leading-tight" style={{ color: '#2d004e' }}>
            {page.title}
          </h1>
          <div className="flex flex-wrap items-center gap-4 text-xs" style={{ color: '#A3A3A3', fontFamily: '"Exo 2",sans-serif' }}>
            {page.author && (
              <span className="flex items-center gap-1.5">
                <i className="fas fa-user-circle text-[11px]" style={{ color: meta.color }} />
                {page.author.firstName} {page.author.lastName}
              </span>
            )}
            <span className="flex items-center gap-1.5">
              <i className="fas fa-calendar-alt text-[11px]" style={{ color: meta.color }} />
              {format(new Date(page.updatedAt), 'MMMM d, yyyy')}
            </span>
            <span className="flex items-center gap-1.5">
              <i className="fas fa-clock text-[11px]" style={{ color: meta.color }} />
              {mins} min read
            </span>
            <span className="flex items-center gap-1.5">
              <i className="fas fa-eye text-[11px]" style={{ color: meta.color }} />
              {page.viewCount} views
            </span>
          </div>
        </div>

        {/* Body */}
        <div className="px-8 py-10">
          <div
            className="prose prose-sm max-w-none"
            style={{ color: '#374151', fontFamily: '"Exo 2",sans-serif', lineHeight: 1.9 }}
            dangerouslySetInnerHTML={{ __html: page.content }}
          />
        </div>

        {/* Footer */}
        <div className="px-8 py-5 flex items-center justify-between"
          style={{ borderTop: '1px solid rgba(75,0,130,0.06)', background: 'rgba(75,0,130,0.02)' }}>
          <Link to="/wiki"
            className="inline-flex items-center gap-2 text-xs font-semibold hover:gap-3 transition-all"
            style={{ color: '#4b0082', fontFamily: '"Exo 2",sans-serif' }}>
            <i className="fas fa-arrow-left text-[10px]" />Back to Knowledge Base
          </Link>
          <span className="text-[10px]" style={{ color: '#A3A3A3', fontFamily: '"Exo 2",sans-serif' }}>
            <i className="fas fa-eye mr-1" />{page.viewCount} views
          </span>
        </div>
      </div>
    </article>
  )
}

export default function WikiPage() {
  const { slug } = useParams()
  const [catFilter, setCatFilter] = useState('')

  const { data: pages = [], isLoading } = useQuery(
    ['wiki-list', catFilter],
    () => api.get(`/wiki${catFilter ? `?category=${catFilter}` : ''}`).then(r => r.data),
    { enabled: !slug }
  )

  const grouped = {}
  pages.forEach(p => {
    if (!grouped[p.category]) grouped[p.category] = []
    grouped[p.category].push(p)
  })

  if (slug) {
    return (
      <div style={{ background: '#F3EDF8', minHeight: '100vh' }}>
        <div className="max-w-3xl mx-auto px-6 py-12">
          <WikiArticle slug={slug} />
        </div>
      </div>
    )
  }

  return (
    <div style={{ background: '#F3EDF8', minHeight: '100vh' }}>

      {/* Hero */}
      <div className="relative py-20 overflow-hidden" style={{ background: 'linear-gradient(135deg,#2d004e,#430075)' }}>
        <div className="wave-pattern absolute inset-0 opacity-20" />
        <div className="absolute inset-0 opacity-10" style={{ backgroundImage: 'radial-gradient(circle at 20% 50%, #a57fc0 0%, transparent 50%), radial-gradient(circle at 80% 20%, #a57fc0 0%, transparent 40%)' }} />
        <div className="relative max-w-4xl mx-auto px-6 text-center">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full mb-5"
            style={{ background: 'rgba(75,0,130,0.15)', border: '1px solid rgba(75,0,130,0.25)' }}>
            <i className="fas fa-book-open text-xs" style={{ color: '#a57fc0' }} />
            <span className="text-xs font-bold uppercase tracking-widest" style={{ color: '#a57fc0', fontFamily: '"Exo 2",sans-serif' }}>Living Heritage</span>
          </div>
          <h1 className="font-display font-bold text-4xl md:text-5xl text-white mb-4">
            Traditional <span style={{ color: '#a57fc0' }}>Knowledge</span>
          </h1>
          <p className="text-base max-w-xl mx-auto mb-10" style={{ color: 'rgba(255,255,255,0.65)', fontFamily: '"Exo 2",sans-serif' }}>
            Our community's living library — preserving the customs, wisdom, and stories of Nkenkak-Ngiesang for future generations.
          </p>
          {/* Stats row */}
          <div className="flex items-center justify-center gap-8 flex-wrap">
            {[
              { icon: 'fa-file-alt',    value: isLoading ? '—' : pages.length, label: 'Articles' },
              { icon: 'fa-layer-group', value: Object.keys(CAT_META).length,   label: 'Categories' },
              { icon: 'fa-users',       value: 'Open',                         label: 'Community' },
            ].map(s => (
              <div key={s.label} className="flex items-center gap-2.5" style={{ color: 'rgba(255,255,255,0.7)', fontFamily: '"Exo 2",sans-serif', fontSize: 13 }}>
                <div className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: 'rgba(255,255,255,0.08)' }}>
                  <i className={`fas ${s.icon} text-xs`} style={{ color: '#a57fc0' }} />
                </div>
                <span><strong className="text-white font-semibold">{s.value}</strong> {s.label}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-6 py-10">

        {/* Filter card */}
        <div className="bg-white rounded-2xl p-5 mb-10" style={{ boxShadow: '0 1px 10px rgba(75,0,130,0.08)', border: '1px solid rgba(75,0,130,0.08)' }}>
          <div className="flex items-center justify-between pb-4 mb-4 border-b" style={{ borderColor: 'rgba(75,0,130,0.07)' }}>
            <div>
              <h2 className="font-display font-bold text-sm" style={{ color: '#2d004e' }}>Knowledge Base</h2>
              <p className="text-[11px] mt-0.5" style={{ color: 'rgba(75,0,130,0.45)', fontFamily: '"Exo 2",sans-serif' }}>Browse by category</p>
            </div>
            {!isLoading && (
              <span className="text-[11px] font-bold px-3 py-1 rounded-full flex-shrink-0"
                style={{ background: 'rgba(75,0,130,0.07)', color: '#4b0082', fontFamily: '"Exo 2",sans-serif' }}>
                {pages.length} article{pages.length !== 1 ? 's' : ''}
              </span>
            )}
          </div>
          {/* Scrollable tab strip */}
          <div className="overflow-x-auto" style={{ scrollbarWidth: 'none', msOverflowStyle: 'none', WebkitOverflowScrolling: 'touch' }}>
            <div className="flex items-center p-1 rounded-2xl"
              style={{ background: 'rgba(75,0,130,0.06)', border: '1px solid rgba(75,0,130,0.09)', width: 'max-content' }}>
              {ALL_TABS.flatMap((t, i) => {
                const active = catFilter === t.key
                const prevActive = i > 0 && catFilter === ALL_TABS[i - 1].key
                const sep = i > 0 && !active && !prevActive
                  ? [<div key={`sep-${t.key || 'all'}`} className="w-px h-4 flex-shrink-0" style={{ background: 'rgba(75,0,130,0.13)' }} />]
                  : []
                return [...sep, (
                  <button key={t.key || 'all'} onClick={() => setCatFilter(t.key)}
                    className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold transition-all flex-shrink-0 whitespace-nowrap"
                    style={{
                      background: active ? t.color : 'transparent',
                      color:      active ? '#fff' : '#A3A3A3',
                      boxShadow:  active ? `0 2px 10px ${t.color}44` : 'none',
                      fontFamily: '"Exo 2",sans-serif',
                    }}>
                    <i className={`fas ${t.icon} text-[9px]`} />{t.label}
                  </button>
                )]
              })}
            </div>
          </div>
        </div>

        {/* Content */}
        {isLoading ? (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
            {[1,2,3,4,5,6].map(i => <SkeletonCard key={i} />)}
          </div>

        ) : !pages.length ? (
          <div className="text-center py-24 rounded-3xl" style={{ background: 'rgba(75,0,130,0.02)', border: '1px dashed rgba(75,0,130,0.12)' }}>
            <i className="fas fa-book-open text-5xl mb-4 block" style={{ color: 'rgba(75,0,130,0.18)' }} />
            <h3 className="font-display font-bold text-xl mb-2" style={{ color: '#2d004e' }}>Knowledge base coming soon</h3>
            <p className="text-sm" style={{ color: '#737373', fontFamily: '"Exo 2",sans-serif' }}>
              Community articles about our traditions, customs, and history will appear here.
            </p>
          </div>

        ) : catFilter ? (
          <>
            {/* Filtered heading */}
            {(() => {
              const meta = CAT_META[catFilter] || CAT_META.customs
              return (
                <div className="flex items-center gap-3 mb-6 pl-4" style={{ borderLeft: `4px solid ${meta.color}` }}>
                  <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ background: meta.color + '15' }}>
                    <i className={`fas ${meta.icon} text-sm`} style={{ color: meta.color }} />
                  </div>
                  <div>
                    <h2 className="font-display font-bold text-lg leading-none" style={{ color: '#2d004e' }}>{meta.label}</h2>
                    <p className="text-[11px] mt-0.5 font-semibold" style={{ color: meta.color, fontFamily: '"Exo 2",sans-serif' }}>
                      {pages.length} article{pages.length !== 1 ? 's' : ''}
                    </p>
                  </div>
                  <button onClick={() => setCatFilter('')} className="ml-auto text-[11px] font-semibold flex items-center gap-1"
                    style={{ color: '#A3A3A3', fontFamily: '"Exo 2",sans-serif' }}>
                    <i className="fas fa-times text-[9px]" /> Clear filter
                  </button>
                </div>
              )
            })()}
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
              {pages.map(p => <PageCard key={p.id} page={p} />)}
            </div>
          </>

        ) : (
          Object.entries(grouped).map(([cat, catPages]) => {
            const meta = CAT_META[cat] || CAT_META.customs
            return (
              <div key={cat} className="mb-14">
                {/* Section heading */}
                <div className="flex items-center gap-3 mb-6 pl-4" style={{ borderLeft: `4px solid ${meta.color}` }}>
                  <div className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0"
                    style={{ background: meta.color + '15' }}>
                    <i className={`fas ${meta.icon} text-sm`} style={{ color: meta.color }} />
                  </div>
                  <div>
                    <h2 className="font-display font-bold text-lg leading-none" style={{ color: '#2d004e' }}>{meta.label}</h2>
                    <p className="text-[11px] mt-0.5 font-semibold" style={{ color: meta.color, fontFamily: '"Exo 2",sans-serif' }}>
                      {catPages.length} article{catPages.length !== 1 ? 's' : ''}
                    </p>
                  </div>
                  <button onClick={() => setCatFilter(cat)}
                    className="ml-auto text-[11px] font-semibold flex items-center gap-1 hover:gap-2 transition-all"
                    style={{ color: meta.color, fontFamily: '"Exo 2",sans-serif' }}>
                    View all <i className="fas fa-arrow-right text-[9px]" />
                  </button>
                </div>
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
                  {catPages.map(p => <PageCard key={p.id} page={p} />)}
                </div>
              </div>
            )
          })
        )}
      </div>
    </div>
  )
}
