import { Link } from 'react-router-dom'
import { format, differenceInDays } from 'date-fns'

function readTime(content = '') {
  const words = content.replace(/<[^>]+>/g, '').split(/\s+/).filter(Boolean).length
  return Math.max(1, Math.round(words / 200))
}

const CAT_STYLES = {
  projects:  { bg: 'rgba(91,45,142,0.12)',  color: '#5B2D8E', grad: 'linear-gradient(135deg,#250F47,#5B2D8E)', icon: 'fa-seedling' },
  education: { bg: 'rgba(2,132,199,0.12)',  color: '#0284c7', grad: 'linear-gradient(135deg,#0c4a6e,#0284c7)', icon: 'fa-graduation-cap' },
  health:    { bg: 'rgba(22,163,74,0.12)',  color: '#16a34a', grad: 'linear-gradient(135deg,#14532d,#16a34a)', icon: 'fa-heartbeat' },
  community: { bg: 'rgba(240,165,0,0.15)',  color: '#C87800', grad: 'linear-gradient(135deg,#78350f,#C87800)', icon: 'fa-users' },
  culture:   { bg: 'rgba(220,38,38,0.10)',  color: '#dc2626', grad: 'linear-gradient(135deg,#7f1d1d,#dc2626)', icon: 'fa-drum' },
  success:    { bg: 'rgba(16,185,129,0.12)', color: '#059669', grad: 'linear-gradient(135deg,#064e3b,#059669)', icon: 'fa-star' },
  governance: { bg: 'rgba(2,132,199,0.12)',  color: '#0369a1', grad: 'linear-gradient(135deg,#0c4a6e,#0369a1)', icon: 'fa-landmark' },
}
const DEFAULT_STYLE = { bg: 'rgba(91,45,142,0.1)', color: '#5B2D8E', grad: 'linear-gradient(135deg,#250F47,#5B2D8E)', icon: 'fa-newspaper' }

function isNew(dateStr) {
  if (!dateStr) return false
  return differenceInDays(new Date(), new Date(dateStr)) <= 3
}
function isTrending(viewCount) {
  return (viewCount || 0) >= 50
}

function AuthorAvatar({ name = 'A', avatarUrl, size = 7 }) {
  if (avatarUrl) {
    return (
      <img src={avatarUrl} alt={name}
        className={`w-${size} h-${size} rounded-full object-cover flex-shrink-0`}
        style={{ border: '2px solid rgba(240,165,0,0.3)' }} />
    )
  }
  return (
    <div className={`w-${size} h-${size} rounded-full flex items-center justify-center text-xs font-bold text-white flex-shrink-0`}
      style={{ background: 'linear-gradient(135deg,#F0A500,#FFB84D)' }}>
      {name[0]}
    </div>
  )
}

export default function NewsCard({ article: a, featured, horizontal }) {
  const catStyle = CAT_STYLES[(a.category || '').toLowerCase()] || DEFAULT_STYLE
  const mins = a.readTime || readTime(a.content)
  const _new = isNew(a.publishedAt)
  const trending = isTrending(a.viewCount)

  /* ── Horizontal (sidebar) variant ── */
  if (horizontal) {
    return (
      <Link to={`/news/${a.slug}`}
        className="group flex gap-3 p-3 rounded-2xl transition-all hover:bg-white hover:shadow-md"
        style={{ border: '1px solid rgba(91,45,142,0.06)' }}>
        <div className="w-20 h-16 rounded-xl overflow-hidden flex-shrink-0 relative"
          style={{ background: catStyle.grad }}>
          {a.coverImage
            ? <img src={a.coverImage} alt={a.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
            : <div className="w-full h-full flex items-center justify-center">
                <i className={`fas ${catStyle.icon} text-lg`} style={{ color: 'rgba(255,255,255,0.3)' }} />
              </div>}
          {_new && (
            <span className="absolute top-1 left-1 w-2 h-2 rounded-full" style={{ background: '#22c55e', boxShadow: '0 0 6px #22c55e' }} />
          )}
        </div>
        <div className="min-w-0 flex-1">
          {a.category && (
            <span className="text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full inline-block mb-1"
              style={{ background: catStyle.bg, color: catStyle.color }}>{a.category}</span>
          )}
          <h4 className="font-display font-semibold text-xs line-clamp-2 leading-snug mb-1 group-hover:text-primary-500 transition-colors" style={{ color: '#1A0A35' }}>{a.title}</h4>
          <div className="flex items-center gap-1.5 text-[9px]" style={{ color: '#A3A3A3', fontFamily: 'Poppins,sans-serif' }}>
            {a.publishedAt && <span>{format(new Date(a.publishedAt), 'MMM d')}</span>}
            <span>·</span>
            <span>{mins}m read</span>
            {trending && <><span>·</span><span style={{ color: '#F0A500' }}><i className="fas fa-fire text-[8px]" /> Hot</span></>}
          </div>
        </div>
      </Link>
    )
  }

  /* ── Featured hero variant ── */
  if (featured) {
    return (
      <Link to={`/news/${a.slug}`}
        className="group relative overflow-hidden rounded-3xl block"
        style={{ background: catStyle.grad, minHeight: 400 }}>
        {a.coverImage && (
          <img src={a.coverImage} alt={a.title}
            className="absolute inset-0 w-full h-full object-cover opacity-50 group-hover:opacity-60 group-hover:scale-105 transition-all duration-700" />
        )}
        <div className="absolute inset-0" style={{ background: 'linear-gradient(to top, rgba(26,10,53,0.97) 0%, rgba(26,10,53,0.5) 55%, transparent 100%)' }} />
        <div className="relative flex flex-col justify-end h-full p-6 md:p-8" style={{ minHeight: 400 }}>
          <div className="flex items-center gap-2 mb-3 flex-wrap">
            {a.category && (
              <span className="text-[10px] font-bold uppercase tracking-wider px-3 py-1 rounded-full"
                style={{ background: 'rgba(240,165,0,0.2)', color: '#F0A500', border: '1px solid rgba(240,165,0,0.3)' }}>
                {a.category}
              </span>
            )}
            <span className="text-[10px] font-semibold px-2.5 py-1 rounded-full" style={{ background: 'rgba(255,255,255,0.1)', color: 'rgba(255,255,255,0.7)' }}>
              <i className="fas fa-fire text-[8px] mr-1" style={{ color: '#F0A500' }} />Featured
            </span>
            {_new && (
              <span className="text-[10px] font-semibold px-2.5 py-1 rounded-full flex items-center gap-1" style={{ background: 'rgba(34,197,94,0.15)', color: '#4ade80', border: '1px solid rgba(34,197,94,0.2)' }}>
                <span className="w-1.5 h-1.5 rounded-full inline-block animate-pulse" style={{ background: '#22c55e' }} />New
              </span>
            )}
          </div>
          <h2 className="font-display font-bold text-xl md:text-3xl text-white leading-tight mb-3 group-hover:text-amber-200 transition-colors" style={{ maxWidth: 600 }}>
            {a.title}
          </h2>
          <p className="text-sm line-clamp-2 mb-4" style={{ color: 'rgba(255,255,255,0.65)', fontFamily: 'Poppins,sans-serif', maxWidth: 520 }}>
            {a.excerpt}
          </p>
          <div className="flex items-center gap-4 flex-wrap">
            <div className="flex items-center gap-2.5">
              <AuthorAvatar name={a.author_name || 'A'} avatarUrl={a.author_avatarUrl} size={7} />
              <div>
                <div className="text-xs font-semibold text-white">{a.author_name || 'Nkenkak Team'}</div>
                <div className="text-[10px]" style={{ color: 'rgba(255,255,255,0.5)', fontFamily: 'Poppins,sans-serif' }}>
                  {a.publishedAt && format(new Date(a.publishedAt), 'MMM d, yyyy')} · {mins} min read
                  {a.viewCount > 0 && <> · <i className="fas fa-eye text-[8px] ml-1" /> {a.viewCount}</>}
                </div>
              </div>
            </div>
            <div className="ml-auto flex items-center gap-1.5 text-sm font-semibold whitespace-nowrap" style={{ color: '#F0A500', fontFamily: 'Sora,sans-serif' }}>
              Read Article <i className="fas fa-arrow-right text-xs group-hover:translate-x-1 transition-transform" />
            </div>
          </div>
        </div>
      </Link>
    )
  }

  /* ── Standard grid card ── */
  return (
    <Link to={`/news/${a.slug}`}
      className="group card p-0 overflow-hidden flex flex-col hover:-translate-y-2 transition-all duration-300">
      {/* Thumbnail */}
      <div className="relative overflow-hidden flex-shrink-0" style={{ height: 200, background: catStyle.grad }}>
        {a.coverImage
          ? <img src={a.coverImage} alt={a.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
          : <div className="w-full h-full flex flex-col items-center justify-center gap-2">
              <i className={`fas ${catStyle.icon} text-5xl`} style={{ color: 'rgba(255,255,255,0.2)' }} />
              <span className="text-xs font-semibold capitalize" style={{ color: 'rgba(255,255,255,0.3)', fontFamily: 'Poppins,sans-serif' }}>{a.category || 'News'}</span>
            </div>}
        {/* Gradient overlay for legibility */}
        <div className="absolute inset-0" style={{ background: 'linear-gradient(to top, rgba(0,0,0,0.35) 0%, transparent 50%)' }} />
        {/* Badges row */}
        <div className="absolute top-3 left-3 flex items-center gap-1.5 flex-wrap">
          {a.category && (
            <span className="text-[9px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full"
              style={{ background: 'rgba(255,255,255,0.92)', color: catStyle.color, backdropFilter: 'blur(8px)' }}>
              {a.category}
            </span>
          )}
          {_new && (
            <span className="text-[9px] font-bold uppercase tracking-wider px-2 py-1 rounded-full flex items-center gap-1"
              style={{ background: 'rgba(34,197,94,0.9)', color: '#fff' }}>
              <span className="w-1.5 h-1.5 rounded-full inline-block animate-pulse bg-white" />New
            </span>
          )}
        </div>
        {/* Read time + trending */}
        <div className="absolute top-3 right-3 flex items-center gap-1.5">
          {trending && (
            <span className="text-[9px] font-semibold px-2 py-0.5 rounded-full"
              style={{ background: 'rgba(240,165,0,0.9)', color: '#fff', backdropFilter: 'blur(4px)' }}>
              <i className="fas fa-fire text-[8px] mr-0.5" />Hot
            </span>
          )}
          <span className="text-[9px] font-semibold px-2 py-0.5 rounded-full"
            style={{ background: 'rgba(0,0,0,0.5)', color: 'rgba(255,255,255,0.9)', fontFamily: 'Poppins,sans-serif', backdropFilter: 'blur(4px)' }}>
            <i className="fas fa-clock text-[8px] mr-1" />{mins}m
          </span>
        </div>
      </div>

      {/* Content */}
      <div className="p-5 flex flex-col flex-1">
        <div className="flex items-center gap-2 mb-2.5">
          <AuthorAvatar name={a.author_name || 'A'} avatarUrl={a.author_avatarUrl} size={6} />
          <div className="min-w-0">
            <div className="text-xs font-semibold truncate" style={{ color: '#404040', fontFamily: 'Poppins,sans-serif' }}>
              {a.author_name || 'Nkenkak Team'}
            </div>
            <div className="text-[10px]" style={{ color: '#A3A3A3', fontFamily: 'Poppins,sans-serif' }}>
              {a.publishedAt && format(new Date(a.publishedAt), 'MMM d, yyyy')}
              {a.viewCount > 0 && <span className="ml-1.5"><i className="fas fa-eye text-[8px]" /> {a.viewCount}</span>}
            </div>
          </div>
        </div>

        <h3 className="font-display font-semibold text-base leading-snug mb-2 group-hover:text-primary-500 transition-colors line-clamp-2 flex-1"
          style={{ color: '#1A0A35' }}>
          {a.title}
        </h3>

        <p className="text-sm line-clamp-2 leading-relaxed mb-4" style={{ color: '#737373', fontFamily: 'Poppins,sans-serif' }}>
          {a.excerpt}
        </p>

        <div className="flex items-center gap-1.5 text-sm font-semibold mt-auto pt-3 border-t"
          style={{ color: '#5B2D8E', fontFamily: 'Sora,sans-serif', borderColor: 'rgba(91,45,142,0.08)' }}>
          Read More <i className="fas fa-arrow-right text-xs group-hover:translate-x-1 transition-transform" />
        </div>
      </div>
    </Link>
  )
}
