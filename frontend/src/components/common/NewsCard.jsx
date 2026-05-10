import { Link } from 'react-router-dom'
import { format } from 'date-fns'

function readTime(content = '') {
  const words = content.replace(/<[^>]+>/g, '').split(/\s+/).filter(Boolean).length
  return Math.max(1, Math.round(words / 200))
}

const CAT_COLORS = {
  projects:    { bg:'rgba(91,45,142,0.12)',  color:'#5B2D8E' },
  education:   { bg:'rgba(2,132,199,0.12)',  color:'#0284c7' },
  health:      { bg:'rgba(22,163,74,0.12)',  color:'#16a34a' },
  community:   { bg:'rgba(240,165,0,0.15)',  color:'#C87800' },
  culture:     { bg:'rgba(220,38,38,0.10)',  color:'#dc2626' },
  success:     { bg:'rgba(16,185,129,0.12)', color:'#059669' },
}

export default function NewsCard({ article: a, featured, horizontal }) {
  const catStyle = CAT_COLORS[(a.category||'').toLowerCase()] || { bg:'rgba(91,45,142,0.1)', color:'#5B2D8E' }
  const mins = a.readTime || readTime(a.content)

  if (horizontal) {
    return (
      <Link to={`/news/${a.slug}`}
        className="group flex gap-4 p-4 rounded-2xl transition-all hover:bg-white hover:shadow-card"
        style={{border:'1px solid rgba(91,45,142,0.06)'}}>
        <div className="w-24 h-20 rounded-xl overflow-hidden flex-shrink-0" style={{background:'linear-gradient(135deg,#250F47,#5B2D8E)'}}>
          {a.coverImage
            ? <img src={a.coverImage} alt={a.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"/>
            : <div className="w-full h-full flex items-center justify-center"><i className="fas fa-newspaper" style={{color:'rgba(240,165,0,0.4)'}}/></div>}
        </div>
        <div className="min-w-0">
          {a.category && (
            <span className="text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full inline-block mb-1.5"
              style={{background:catStyle.bg, color:catStyle.color}}>{a.category}</span>
          )}
          <h4 className="font-display font-semibold text-sm line-clamp-2 leading-snug mb-1 group-hover:text-primary-500 transition-colors" style={{color:'#1A0A35'}}>{a.title}</h4>
          <div className="flex items-center gap-2 text-[10px]" style={{color:'#A3A3A3',fontFamily:'Poppins,sans-serif'}}>
            {a.publishedAt && <span>{format(new Date(a.publishedAt),'MMM d, yyyy')}</span>}
            <span>·</span>
            <span>{mins} min read</span>
          </div>
        </div>
      </Link>
    )
  }

  if (featured) {
    return (
      <Link to={`/news/${a.slug}`}
        className="group relative overflow-hidden rounded-3xl block"
        style={{background:'linear-gradient(135deg,#1A0A35,#5B2D8E)', minHeight:380}}>
        {a.coverImage && (
          <img src={a.coverImage} alt={a.title}
            className="absolute inset-0 w-full h-full object-cover opacity-50 group-hover:opacity-60 group-hover:scale-105 transition-all duration-700"/>
        )}
        <div className="absolute inset-0" style={{background:'linear-gradient(to top, rgba(26,10,53,0.95) 0%, rgba(26,10,53,0.4) 50%, transparent 100%)'}}/>
        <div className="relative flex flex-col justify-end h-full p-8" style={{minHeight:380}}>
          <div className="flex items-center gap-3 mb-3 flex-wrap">
            {a.category && (
              <span className="text-[10px] font-bold uppercase tracking-wider px-3 py-1 rounded-full"
                style={{background:'rgba(240,165,0,0.2)',color:'#F0A500',border:'1px solid rgba(240,165,0,0.3)'}}>
                {a.category}
              </span>
            )}
            <span className="text-[10px] font-semibold px-2.5 py-1 rounded-full" style={{background:'rgba(255,255,255,0.1)',color:'rgba(255,255,255,0.7)'}}>
              <i className="fas fa-fire text-[8px] mr-1" style={{color:'#F0A500'}}/>Featured
            </span>
          </div>
          <h2 className="font-display font-bold text-2xl md:text-3xl text-white leading-tight mb-3 group-hover:text-amber-200 transition-colors" style={{maxWidth:600}}>
            {a.title}
          </h2>
          <p className="text-sm line-clamp-2 mb-4" style={{color:'rgba(255,255,255,0.65)',fontFamily:'Poppins,sans-serif',maxWidth:520}}>
            {a.excerpt}
          </p>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2.5">
              <div className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold text-white flex-shrink-0"
                style={{background:'linear-gradient(135deg,#F0A500,#FFB84D)'}}>
                {(a.author_name||'A')[0]}
              </div>
              <div>
                <div className="text-xs font-semibold text-white">{a.author_name || 'Nkenkak Team'}</div>
                <div className="text-[10px]" style={{color:'rgba(255,255,255,0.5)',fontFamily:'Poppins,sans-serif'}}>
                  {a.publishedAt && format(new Date(a.publishedAt),'MMM d, yyyy')} · {mins} min read
                </div>
              </div>
            </div>
            <div className="ml-auto flex items-center gap-1.5 text-sm font-semibold" style={{color:'#F0A500',fontFamily:'Sora,sans-serif'}}>
              Read Article <i className="fas fa-arrow-right text-xs group-hover:translate-x-1 transition-transform"/>
            </div>
          </div>
        </div>
      </Link>
    )
  }

  return (
    <Link to={`/news/${a.slug}`}
      className="group card p-0 overflow-hidden flex flex-col hover:-translate-y-1 transition-all duration-300">
      {/* Thumbnail */}
      <div className="relative overflow-hidden" style={{height:200, background:'linear-gradient(135deg,#250F47,#5B2D8E)', flexShrink:0}}>
        {a.coverImage
          ? <img src={a.coverImage} alt={a.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"/>
          : <div className="w-full h-full flex items-center justify-center"><i className="fas fa-newspaper text-4xl" style={{color:'rgba(240,165,0,0.25)'}}/></div>}
        {a.category && (
          <span className="absolute top-3 left-3 text-[9px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full"
            style={{background:'rgba(255,255,255,0.9)', color:catStyle.color, backdropFilter:'blur(8px)'}}>
            {a.category}
          </span>
        )}
        <div className="absolute top-3 right-3 text-[9px] font-semibold px-2 py-0.5 rounded-full"
          style={{background:'rgba(0,0,0,0.5)',color:'rgba(255,255,255,0.9)',fontFamily:'Poppins,sans-serif',backdropFilter:'blur(4px)'}}>
          <i className="fas fa-clock text-[8px] mr-1"/>{mins} min
        </div>
      </div>

      {/* Content */}
      <div className="p-5 flex flex-col flex-1">
        <div className="flex items-center gap-3 text-[10px] mb-2.5" style={{color:'#A3A3A3',fontFamily:'Poppins,sans-serif'}}>
          {a.publishedAt && (
            <span className="flex items-center gap-1">
              <i className="fas fa-calendar text-[8px]" style={{color:'#F0A500'}}/>
              {format(new Date(a.publishedAt),'MMM d, yyyy')}
            </span>
          )}
          {a.author_name && (
            <span className="flex items-center gap-1">
              <i className="fas fa-user text-[8px]" style={{color:'#5B2D8E'}}/>
              {a.author_name}
            </span>
          )}
          {a.viewCount > 0 && (
            <span className="flex items-center gap-1 ml-auto">
              <i className="fas fa-eye text-[8px]"/>{a.viewCount}
            </span>
          )}
        </div>

        <h3 className="font-display font-semibold text-base leading-snug mb-2 group-hover:text-primary-500 transition-colors line-clamp-2 flex-1"
          style={{color:'#1A0A35'}}>
          {a.title}
        </h3>

        <p className="text-sm line-clamp-2 leading-relaxed mb-4" style={{color:'#737373',fontFamily:'Poppins,sans-serif'}}>
          {a.excerpt}
        </p>

        <div className="flex items-center gap-1.5 text-sm font-semibold mt-auto pt-3 border-t" style={{color:'#5B2D8E',fontFamily:'Sora,sans-serif',borderColor:'rgba(91,45,142,0.08)'}}>
          Read More <i className="fas fa-arrow-right text-xs group-hover:translate-x-1 transition-transform"/>
        </div>
      </div>
    </Link>
  )
}
