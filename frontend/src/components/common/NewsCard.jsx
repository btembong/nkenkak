import { Link } from 'react-router-dom'
import { format, differenceInDays } from 'date-fns'
import { Card } from '../ui/card'
import {
  Sprout, GraduationCap, HeartPulse, Users, Drum,
  Star, Landmark, Newspaper, Flame, Eye, ArrowRight, Clock,
} from 'lucide-react'

function readTime(content = '') {
  const words = content.replace(/<[^>]+>/g, '').split(/\s+/).filter(Boolean).length
  return Math.max(1, Math.round(words / 200))
}

const CAT_STYLES = {
  projects:  { grad: 'linear-gradient(135deg,#250F47,#5B2D8E)', Icon: Sprout },
  education: { grad: 'linear-gradient(135deg,#3D1A6B,#5B2D8E)', Icon: GraduationCap },
  health:    { grad: 'linear-gradient(135deg,#78350f,#C87800)',  Icon: HeartPulse },
  community: { grad: 'linear-gradient(135deg,#250F47,#5B2D8E)', Icon: Users },
  culture:   { grad: 'linear-gradient(135deg,#78350f,#C87800)',  Icon: Drum },
  success:   { grad: 'linear-gradient(135deg,#78350f,#C87800)',  Icon: Star },
  governance:{ grad: 'linear-gradient(135deg,#250F47,#5B2D8E)', Icon: Landmark },
}
const DEFAULT_STYLE = { grad: 'linear-gradient(135deg,#250F47,#5B2D8E)', Icon: Newspaper }

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
        className={`w-${size} h-${size} rounded-full object-cover flex-shrink-0 border-2 border-gold/30`} />
    )
  }
  return (
    <div className={`w-${size} h-${size} rounded-full flex items-center justify-center text-xs font-bold text-white flex-shrink-0 bg-gradient-to-br from-gold to-[#FFB84D]`}>
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
        className="group flex gap-3 p-3 rounded-2xl transition-all hover:bg-white hover:shadow-md border border-primary-500/6">
        <div className="w-20 h-16 rounded-xl overflow-hidden flex-shrink-0 relative"
          style={{ background: catStyle.grad }}>
          {a.coverImage
            ? <img src={a.coverImage} alt={a.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
            : <div className="w-full h-full flex items-center justify-center">
                <catStyle.Icon className="w-5 h-5" style={{ color: 'rgba(255,255,255,0.3)' }} />
              </div>}
          {_new && (
            <span className="absolute top-1.5 left-1.5 w-2 h-2 rounded-full bg-primary-400 animate-pulse"
              style={{ boxShadow: '0 0 6px rgba(91,45,142,0.8)' }} />
          )}
        </div>
        <div className="min-w-0 flex-1">
          {a.category && (
            <div className="flex items-center gap-1.5 mb-1">
              <span className="w-[2px] h-3 rounded-full bg-primary-500/40 flex-shrink-0"/>
              <span className="text-[9px] font-bold uppercase tracking-widest text-primary-500/70">
                {a.category}
              </span>
            </div>
          )}
          <h4 className="font-display font-semibold text-xs line-clamp-2 leading-snug mb-1 group-hover:text-primary-500 transition-colors text-dark">{a.title}</h4>
          <div className="flex items-center gap-1.5 text-[9px] text-muted-foreground">
            {a.publishedAt && <span>{format(new Date(a.publishedAt), 'MMM d')}</span>}
            <span>·</span>
            <span>{mins}m read</span>
            {trending && <><span>·</span><span className="text-gold flex items-center gap-0.5"><Flame className="w-2.5 h-2.5"/> Hot</span></>}
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
          <div className="flex items-center gap-3 mb-3 flex-wrap">
            {a.category && (
              <span className="text-[9px] font-bold uppercase tracking-[0.1em] px-2 py-0.5 rounded-sm text-gold/90"
                style={{ border: '1px solid rgba(240,165,0,0.3)' }}>
                {a.category}
              </span>
            )}
            <span className="text-[9px] font-semibold text-white/50 flex items-center gap-1">
              <Flame className="w-3 h-3 text-gold/60"/>Featured
            </span>
            {_new && (
              <span className="flex items-center gap-1.5 text-[9px] font-semibold text-white/60">
                <span className="w-1.5 h-1.5 rounded-full bg-primary-400 animate-pulse inline-block" />
                New
              </span>
            )}
          </div>
          <h2 className="font-display font-bold text-xl md:text-3xl text-white leading-tight mb-3 group-hover:text-amber-200 transition-colors" style={{ maxWidth: 600 }}>
            {a.title}
          </h2>
          <p className="text-sm line-clamp-2 mb-4 text-white/65" style={{ maxWidth: 520 }}>
            {a.excerpt}
          </p>
          <div className="flex items-center gap-4 flex-wrap">
            <div className="flex items-center gap-2.5">
              <AuthorAvatar name={a.author_name || 'A'} avatarUrl={a.author_avatarUrl} size={7} />
              <div>
                <div className="text-xs font-semibold text-white">{a.author_name || 'Nkenkak Team'}</div>
                <div className="text-[10px] text-white/50 flex items-center gap-1">
                  {a.publishedAt && format(new Date(a.publishedAt), 'MMM d, yyyy')} · {mins} min read
                  {a.viewCount > 0 && <><Eye className="w-2.5 h-2.5 ml-1"/> {a.viewCount}</>}
                </div>
              </div>
            </div>
            <div className="ml-auto flex items-center gap-1.5 text-sm font-semibold whitespace-nowrap text-gold">
              Read Article <ArrowRight className="w-3 h-3 group-hover:translate-x-1 transition-transform" />
            </div>
          </div>
        </div>
      </Link>
    )
  }

  /* ── Standard grid card ── */
  return (
    <Link to={`/news/${a.slug}`}>
      <Card className="group p-0 overflow-hidden flex flex-col hover:-translate-y-2 transition-all duration-300 h-full">
        {/* Thumbnail */}
        <div className="relative overflow-hidden flex-shrink-0" style={{ height: 200, background: catStyle.grad }}>
          {a.coverImage
            ? <img src={a.coverImage} alt={a.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
            : <div className="w-full h-full flex flex-col items-center justify-center gap-2">
                <catStyle.Icon className="w-12 h-12" style={{ color: 'rgba(255,255,255,0.2)' }} />
                <span className="text-xs font-semibold capitalize text-white/30">{a.category || 'News'}</span>
              </div>}
          {/* Subtle gradient overlay */}
          <div className="absolute inset-0" style={{ background: 'linear-gradient(to top, rgba(0,0,0,0.4) 0%, transparent 55%)' }} />

          {/* New indicator — dot only, top-left */}
          {_new && (
            <span className="absolute top-3 left-3 w-2.5 h-2.5 rounded-full bg-primary-400 animate-pulse z-10"
              style={{ boxShadow: '0 0 8px rgba(91,45,142,0.9)' }} />
          )}

          {/* Read time — bottom-right functional label */}
          <div className="absolute bottom-3 right-3 flex items-center gap-1.5 z-10">
            {trending && (
              <span className="text-[9px] font-semibold text-gold flex items-center gap-0.5"
                style={{ textShadow: '0 1px 4px rgba(0,0,0,0.5)' }}>
                <Flame className="w-2.5 h-2.5"/>Hot
              </span>
            )}
            <span className="text-[9px] font-medium text-white/75 flex items-center gap-0.5 bg-black/40 backdrop-blur-sm px-1.5 py-0.5 rounded">
              <Clock className="w-2 h-2"/>{mins}m
            </span>
          </div>
        </div>

        {/* Content */}
        <div className="p-5 flex flex-col flex-1">
          {/* Category label — hairline style */}
          {a.category && (
            <div className="flex items-center gap-1.5 mb-2.5">
              <span className="w-[2px] h-3 rounded-full bg-primary-500/40 flex-shrink-0"/>
              <span className="text-[9px] font-bold uppercase tracking-[0.1em] text-primary-500/70">
                {a.category}
              </span>
            </div>
          )}

          <div className="flex items-center gap-2 mb-2.5">
            <AuthorAvatar name={a.author_name || 'A'} avatarUrl={a.author_avatarUrl} size={6} />
            <div className="min-w-0">
              <div className="text-xs font-semibold truncate text-[#404040]">
                {a.author_name || 'Nkenkak Team'}
              </div>
              <div className="text-[10px] text-muted-foreground flex items-center gap-1">
                {a.publishedAt && format(new Date(a.publishedAt), 'MMM d, yyyy')}
                {a.viewCount > 0 && <span className="flex items-center gap-0.5 ml-1"><Eye className="w-2 h-2"/> {a.viewCount}</span>}
              </div>
            </div>
          </div>

          <h3 className="font-display font-semibold text-base leading-snug mb-2 group-hover:text-primary-500 transition-colors line-clamp-2 flex-1 text-dark">
            {a.title}
          </h3>

          <p className="text-sm line-clamp-2 leading-relaxed mb-4 text-muted-foreground">
            {a.excerpt}
          </p>

          <div className="flex items-center gap-1.5 text-sm font-semibold mt-auto pt-3 border-t border-primary-500/8 text-primary-500">
            Read More <ArrowRight className="w-3 h-3 group-hover:translate-x-1 transition-transform" />
          </div>
        </div>
      </Card>
    </Link>
  )
}
