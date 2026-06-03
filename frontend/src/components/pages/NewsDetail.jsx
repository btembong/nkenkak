import { useState, useEffect, useRef } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import { useQuery, useMutation, useQueryClient } from 'react-query'
import { format, formatDistanceToNow } from 'date-fns'
import toast from 'react-hot-toast'
import api from '../../services/api'
import NewsCard from '../common/NewsCard'
import { useAuth } from '../../context/AuthContext'
import {
  Home, ChevronRight, Star, Calendar, Clock, Eye,
  MessageSquare, Loader2, Send, MessageSquareOff,
  Newspaper, List, Share2, Info, Tags, Mail,
  ArrowRight, ArrowLeft, Link2, CheckCircle2, Bell,
} from 'lucide-react'

/* ── Reading progress bar ── */
function ReadingProgressBar() {
  const [progress, setProgress] = useState(0)
  useEffect(() => {
    const update = () => {
      const el = document.documentElement
      const total = el.scrollHeight - el.clientHeight
      setProgress(total > 0 ? Math.min(100, (el.scrollTop / total) * 100) : 0)
    }
    window.addEventListener('scroll', update, { passive: true })
    return () => window.removeEventListener('scroll', update)
  }, [])
  return (
    <div className="fixed top-0 left-0 right-0 z-[60] h-1" style={{ background: 'rgba(0,0,0,0.08)' }}>
      <div style={{ width: `${progress}%`, height: '100%', background: 'linear-gradient(90deg,#5B2D8E,#F0A500)', transition: 'width 0.1s linear' }} />
    </div>
  )
}

/* ── Parse headings from HTML for TOC ── */
function parseTOC(html = '') {
  const matches = [...html.matchAll(/<h([23])[^>]*>(.*?)<\/h[23]>/gi)]
  return matches.map((m, i) => ({
    level: parseInt(m[1]),
    text: m[2].replace(/<[^>]+>/g, ''),
    id: `heading-${i}`,
  }))
}

/* ── Share helpers ── */
function shareUrl() { return typeof window !== 'undefined' ? window.location.href : '' }
const SHARE = [
  { label:'Facebook',  icon:'fab fa-facebook-f',  color:'#1877F2', href: u => `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(u)}` },
  { label:'Twitter',   icon:'fab fa-twitter',      color:'#1DA1F2', href: u => `https://twitter.com/intent/tweet?url=${encodeURIComponent(u)}` },
  { label:'WhatsApp',  icon:'fab fa-whatsapp',     color:'#25D366', href: u => `https://api.whatsapp.com/send?text=${encodeURIComponent(u)}` },
  { label:'LinkedIn',  icon:'fab fa-linkedin-in',  color:'#0A66C2', href: u => `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(u)}` },
]

function copyLink() {
  navigator.clipboard.writeText(shareUrl()).then(() => toast.success('Link copied!')).catch(() => {})
}

/* ── Newsletter subscribe box ── */
function SubscribeBox() {
  const [email, setEmail] = useState('')
  const [done,  setDone]  = useState(false)

  const submit = async (e) => {
    e.preventDefault()
    if (!email) return
    try {
      await api.post('/newsletter/subscribe', { email })
      setDone(true)
      toast.success('Subscribed! Thank you.')
    } catch {
      toast.error('Could not subscribe. Try again.')
    }
  }

  if (done) return (
    <div className="text-center py-4">
      <CheckCircle2 className="w-6 h-6 mx-auto mb-2 text-gold"/>
      <p className="text-sm font-semibold text-white">You're subscribed!</p>
    </div>
  )

  return (
    <form onSubmit={submit} className="space-y-3">
      <input value={email} onChange={e => setEmail(e.target.value)} type="email" required
        placeholder="your@email.com"
        className="w-full px-4 py-2.5 rounded-xl text-sm outline-none placeholder-white/40"
        style={{background:'rgba(255,255,255,0.08)',border:'1px solid rgba(255,255,255,0.12)',color:'#fff'}}/>
      <button type="submit" className="btn-secondary w-full justify-center !py-2.5 !text-sm">
        <Bell className="w-3 h-3"/>Get Updates
      </button>
    </form>
  )
}

/* ── Sidebar card wrapper ── */
function SideCard({ title, Icon: IconComp, children }) {
  return (
    <div className="rounded-2xl p-5" style={{background:'#fff',border:'1px solid rgba(91,45,142,0.08)',boxShadow:'0 2px 16px rgba(91,45,142,0.06)'}}>
      <div className="flex items-center gap-2 mb-4">
        {IconComp && <IconComp className="w-4 h-4 text-primary-500"/>}
        <h4 className="font-display font-bold text-sm text-dark">{title}</h4>
      </div>
      {children}
    </div>
  )
}

function CommentsSection({ slug }) {
  const { user } = useAuth()
  const qc = useQueryClient()
  const [name, setName]       = useState('')
  const [content, setContent] = useState('')

  const { data: comments = [], isLoading } = useQuery(['news-comments', slug],
    () => api.get(`/news/${slug}/comments`).then(r => r.data))

  const postMut = useMutation(
    () => api.post(`/news/${slug}/comments`, {
      name: user ? `${user.firstName} ${user.lastName}` : (name || 'Anonymous'),
      content,
      userId: user?.id || undefined,
    }),
    {
      onSuccess: () => {
        qc.invalidateQueries(['news-comments', slug])
        setContent(''); setName('')
        toast.success('Comment posted!')
      },
      onError: () => toast.error('Could not post comment'),
    }
  )

  return (
    <section className="py-14 border-t" style={{borderColor:'rgba(91,45,142,0.06)',background:'#F9F7FD'}}>
      <div className="max-w-3xl mx-auto px-6">
        <div className="flex items-center gap-3 mb-8">
          <div className="w-9 h-9 rounded-2xl flex items-center justify-center" style={{background:'linear-gradient(135deg,#5B2D8E,#7B4DB8)'}}>
            <MessageSquare className="w-4 h-4 text-white"/>
          </div>
          <div>
            <h3 className="font-display font-bold text-xl text-dark">Discussion</h3>
            <p className="text-xs text-muted-foreground">{comments.length} comment{comments.length !== 1 ? 's' : ''}</p>
          </div>
        </div>

        {/* Comment form */}
        <div className="rounded-2xl p-6 mb-8" style={{background:'#fff',border:'1px solid rgba(91,45,142,0.08)'}}>
          <h4 className="font-semibold text-sm mb-4 text-dark">Leave a comment</h4>
          {!user && (
            <input value={name} onChange={e => setName(e.target.value)}
              placeholder="Your name (optional)"
              className="input mb-3 text-sm"
            />
          )}
          <textarea value={content} onChange={e => setContent(e.target.value)}
            rows={3} placeholder="Share your thoughts…"
            className="input resize-none text-sm mb-3"
          />
          <button onClick={() => content.trim() && postMut.mutate()}
            disabled={!content.trim() || postMut.isLoading}
            className="btn-secondary !py-2 !px-5 !text-sm">
            {postMut.isLoading
              ? <><Loader2 className="w-4 h-4 animate-spin"/>Posting…</>
              : <><Send className="w-4 h-4"/>Post Comment</>}
          </button>
        </div>

        {/* Comments list */}
        {isLoading ? (
          <div className="space-y-4">
            {[1,2].map(i => <div key={i} className="h-20 rounded-2xl animate-pulse" style={{background:'rgba(91,45,142,0.04)'}}/>)}
          </div>
        ) : comments.length === 0 ? (
          <div className="text-center py-10 text-muted-foreground">
            <MessageSquareOff className="w-8 h-8 mx-auto mb-3" style={{color:'rgba(91,45,142,0.12)'}}/>
            <p className="text-sm">No comments yet — be the first!</p>
          </div>
        ) : (
          <div className="space-y-4">
            {comments.map(c => (
              <div key={c.id} className="flex gap-3">
                <div className="w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0 text-white text-sm font-bold"
                  style={{background:'linear-gradient(135deg,#5B2D8E,#7B4DB8)'}}>
                  {(c.user?.firstName || c.name || '?')[0].toUpperCase()}
                </div>
                <div className="flex-1 rounded-2xl p-4" style={{background:'#fff',border:'1px solid rgba(91,45,142,0.07)'}}>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-sm font-semibold text-dark">
                      {c.user ? `${c.user.firstName} ${c.user.lastName}` : c.name}
                    </span>
                    <span className="text-[11px] text-muted-foreground"
                      title={format(new Date(c.createdAt), 'MMM d, yyyy HH:mm')}>
                      {formatDistanceToNow(new Date(c.createdAt), { addSuffix: true })}
                    </span>
                  </div>
                  <p className="text-sm leading-relaxed text-[#4B4B6B]">{c.content}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  )
}

export default function NewsDetail() {
  const { slug } = useParams()
  const navigate  = useNavigate()

  const { data: article, isLoading } = useQuery(['news-detail', slug],
    () => api.get(`/news/${slug}`).then(r => r.data))

  const { data: related = [] } = useQuery(['news-related', slug],
    () => api.get(`/news/${slug}/related`).then(r => r.data),
    { enabled: !!slug })

  const bodyRef = useRef(null)
  const [activeToc, setActiveToc] = useState(null)
  const toc = article ? parseTOC(article.content) : []

  // Inject IDs into rendered headings + observe for active heading
  useEffect(() => {
    if (!bodyRef.current || !toc.length) return
    const headings = bodyRef.current.querySelectorAll('h2, h3')
    headings.forEach((el, i) => { if (toc[i]) el.id = toc[i].id })

    const obs = new IntersectionObserver(entries => {
      entries.forEach(e => { if (e.isIntersecting) setActiveToc(e.target.id) })
    }, { rootMargin: '-20% 0px -70% 0px' })
    headings.forEach(el => obs.observe(el))
    return () => obs.disconnect()
  }, [article?.content])

  if (isLoading) return (
    <div className="max-w-4xl mx-auto px-6 py-20 space-y-5">
      <div className="h-72 rounded-3xl animate-pulse" style={{background:'rgba(91,45,142,0.06)'}}/>
      {[1,2,3,4].map(i => <div key={i} className="h-5 rounded-xl animate-pulse" style={{background:'rgba(91,45,142,0.04)',width:`${85-i*10}%`}}/>)}
    </div>
  )

  if (!article) return (
    <div className="text-center py-36">
      <Newspaper className="w-12 h-12 mx-auto mb-4" style={{color:'rgba(91,45,142,0.15)'}}/>
      <h3 className="font-display font-bold text-2xl mb-3 text-dark">Article not found</h3>
      <p className="text-sm mb-6 text-muted-foreground">This article may have been removed or the link is incorrect.</p>
      <button onClick={() => navigate('/news')} className="btn-secondary !py-2.5 !px-6">
        <ArrowLeft className="w-3 h-3"/>Back to News
      </button>
    </div>
  )

  const url = shareUrl()

  return (
    <div style={{background:'#F9F7FD'}}>
      <ReadingProgressBar />

      {/* ── Full-bleed hero ── */}
      <div className="relative overflow-hidden" style={{background:'linear-gradient(135deg,#1A0A35,#250F47)', minHeight:420}}>
        {article.coverImage && (
          <img src={article.coverImage} alt={article.title}
            className="absolute inset-0 w-full h-full object-cover opacity-45"/>
        )}
        <div className="absolute inset-0" style={{background:'linear-gradient(to top, rgba(26,10,53,1) 0%, rgba(26,10,53,0.7) 40%, rgba(26,10,53,0.3) 100%)'}}/>

        <div className="relative max-w-4xl mx-auto px-6 py-20 flex flex-col justify-end" style={{minHeight:420}}>
          {/* Breadcrumb */}
          <div className="flex items-center gap-2 text-xs mb-6 text-white/50">
            <Link to="/" className="hover:text-white transition-colors flex items-center gap-1"><Home className="w-3 h-3 mr-0.5"/>Home</Link>
            <ChevronRight className="w-3 h-3 text-gold"/>
            <Link to="/news" className="hover:text-white transition-colors">News</Link>
            <ChevronRight className="w-3 h-3 text-gold"/>
            <span className="truncate max-w-[200px] text-white/70">{article.title}</span>
          </div>

          {/* Category + featured — hairline labels */}
          <div className="flex items-center gap-3 mb-4 flex-wrap">
            {article.category && (
              <span className="text-[10px] font-bold uppercase tracking-[0.1em] text-gold/70">
                {article.category}
              </span>
            )}
            {article.isFeatured && (
              <span className="text-[10px] font-semibold text-gold/55 flex items-center gap-1">
                <Star className="w-2.5 h-2.5"/>Featured
              </span>
            )}
          </div>

          <h1 className="font-display font-bold text-3xl md:text-4xl text-white leading-tight mb-5" style={{maxWidth:700}}>
            {article.title}
          </h1>

          {/* Meta row */}
          <div className="flex flex-wrap items-center gap-5">
            {/* Author */}
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-full flex items-center justify-center text-sm font-bold text-white flex-shrink-0"
                style={{background:'linear-gradient(135deg,#F0A500,#FFB84D)'}}>
                {(article.author_name || 'N')[0]}
              </div>
              <div>
                <div className="text-xs font-semibold text-white">{article.author_name || 'Nkenkak Team'}</div>
                <div className="text-[9px] uppercase tracking-wider text-gold/70">Author</div>
              </div>
            </div>

            <div className="w-px h-8 bg-white/10"/>

            {article.publishedAt && (
              <div className="flex items-center gap-1.5 text-xs text-white/65">
                <Calendar className="w-3 h-3 text-gold"/>
                {format(new Date(article.publishedAt), 'MMMM d, yyyy')}
              </div>
            )}

            <div className="flex items-center gap-1.5 text-xs text-white/65">
              <Clock className="w-3 h-3 text-gold"/>
              {article.readTime || 1} min read
            </div>

            {article.viewCount > 0 && (
              <div className="flex items-center gap-1.5 text-xs text-white/65">
                <Eye className="w-3 h-3 text-gold"/>
                {article.viewCount.toLocaleString()} views
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ── Main layout ── */}
      <div className="max-w-7xl mx-auto px-6 py-12">
        <div className="flex gap-10 items-start">

          {/* ── Article body ── */}
          <article className="flex-1 min-w-0">

            {/* Excerpt / lead */}
            {article.excerpt && (
              <p className="text-lg leading-relaxed mb-8 font-medium border-l-4 pl-5 text-[#404040]"
                style={{borderColor:'#F0A500'}}>
                {article.excerpt}
              </p>
            )}

            {/* Cover image (large) */}
            {article.coverImage && (
              <div className="mb-8 rounded-3xl overflow-hidden shadow-card-lg" style={{maxHeight:480}}>
                <img src={article.coverImage} alt={article.title} className="w-full h-full object-cover"/>
              </div>
            )}

            {/* Body */}
            <div ref={bodyRef} className="prose-article mb-10"
              style={{
                color:'#404040', lineHeight:'1.95',
                fontSize:'1.0625rem',
              }}
              dangerouslySetInnerHTML={{__html: article.content}}/>

            {/* Tags */}
            {article.tags?.length > 0 && (
              <div className="flex items-center gap-2 flex-wrap mb-8 pt-6 border-t" style={{borderColor:'rgba(91,45,142,0.08)'}}>
                <span className="text-xs font-bold uppercase tracking-wider mr-1 text-muted-foreground">Tags:</span>
                {article.tags.map(t => (
                  <Link key={t} to={`/news?search=${encodeURIComponent(t)}`}
                    className="tag hover:bg-primary-100 transition-colors cursor-pointer">#{t}</Link>
                ))}
              </div>
            )}

            {/* Share row (mobile / in-article) */}
            <div className="flex items-center justify-between py-5 px-6 rounded-2xl mb-8 flex-wrap gap-3 lg:hidden"
              style={{background:'#fff',border:'1px solid rgba(91,45,142,0.08)',boxShadow:'0 2px 12px rgba(91,45,142,0.05)'}}>
              <span className="text-sm font-semibold text-dark">Share this article</span>
              <div className="flex gap-2">
                {SHARE.map(s => (
                  <a key={s.label} href={s.href(url)} target="_blank" rel="noopener noreferrer"
                    className="w-9 h-9 rounded-full flex items-center justify-center text-white text-xs transition-all hover:-translate-y-0.5 hover:shadow-card"
                    style={{background:s.color}}>
                    <i className={s.icon}/>
                  </a>
                ))}
                <button onClick={copyLink}
                  className="w-9 h-9 rounded-full flex items-center justify-center text-white text-xs transition-all hover:-translate-y-0.5 hover:shadow-card bg-primary-500">
                  <Link2 className="w-3.5 h-3.5"/>
                </button>
              </div>
            </div>

            {/* Author card */}
            <div className="rounded-3xl p-6 flex gap-5 items-start mb-8"
              style={{background:'linear-gradient(135deg,rgba(91,45,142,0.04),rgba(240,165,0,0.04))',border:'1px solid rgba(91,45,142,0.1)'}}>
              <div className="w-16 h-16 rounded-2xl overflow-hidden flex items-center justify-center text-xl font-bold text-white flex-shrink-0"
                style={{background:'linear-gradient(135deg,#5B2D8E,#7B4DB8)'}}>
                {article.author_avatarUrl
                  ? <img src={article.author_avatarUrl} alt={article.author_name} className="w-full h-full object-cover"/>
                  : (article.author_name || 'N')[0]}
              </div>
              <div className="min-w-0">
                <div className="text-[10px] uppercase tracking-widest font-semibold mb-1 text-gold">Written by</div>
                <h4 className="font-display font-bold text-lg mb-1 text-dark">{article.author_name || 'Nkenkak Team'}</h4>
                <p className="text-sm text-muted-foreground">
                  {article.author_bio || 'Community contributor for Nkenkak-Ngiesang. Sharing stories and updates that matter to our people at home and abroad.'}
                </p>
              </div>
            </div>

            {/* Back link */}
            <Link to="/news" className="btn-outline !text-sm !py-2.5 !px-5 inline-flex items-center gap-2">
              <ArrowLeft className="w-3 h-3"/>Back to News
            </Link>
          </article>

          {/* ── Sidebar ── */}
          <aside className="hidden lg:flex flex-col gap-5 w-72 flex-shrink-0 sticky top-24">

            {/* Table of Contents */}
            {toc.length > 1 && (
              <SideCard title="In This Article" Icon={List}>
                <nav className="space-y-1">
                  {toc.map(item => (
                    <a key={item.id} href={`#${item.id}`}
                      onClick={e => { e.preventDefault(); document.getElementById(item.id)?.scrollIntoView({ behavior:'smooth', block:'start' }); setActiveToc(item.id) }}
                      className="flex items-start gap-2 py-1.5 text-xs rounded-lg px-2 transition-all cursor-pointer"
                      style={{
                        paddingLeft: item.level === 3 ? '1.25rem' : '0.5rem',
                        color: activeToc === item.id ? '#5B2D8E' : '#737373',
                        background: activeToc === item.id ? 'rgba(91,45,142,0.06)' : 'transparent',
                        fontWeight: activeToc === item.id ? 600 : 400,
                        borderLeft: activeToc === item.id ? '2px solid #5B2D8E' : '2px solid transparent',
                      }}>
                      {item.text}
                    </a>
                  ))}
                </nav>
              </SideCard>
            )}

            {/* Share */}
            <SideCard title="Share Article" Icon={Share2}>
              <div className="grid grid-cols-2 gap-2">
                {SHARE.map(s => (
                  <a key={s.label} href={s.href(url)} target="_blank" rel="noopener noreferrer"
                    className="flex items-center gap-2 px-3 py-2.5 rounded-xl text-xs font-semibold text-white transition-all hover:-translate-y-0.5 hover:shadow-card"
                    style={{background:s.color}}>
                    <i className={`${s.icon} text-[11px]`}/>{s.label}
                  </a>
                ))}
              </div>
              <button onClick={copyLink}
                className="mt-2 w-full flex items-center justify-center gap-2 px-3 py-2.5 rounded-xl text-xs font-semibold transition-all hover:opacity-80 text-primary-500"
                style={{background:'rgba(91,45,142,0.08)'}}>
                <Link2 className="w-3.5 h-3.5"/>Copy Link
              </button>
            </SideCard>

            {/* Article info */}
            <SideCard title="Article Info" Icon={Info}>
              <div className="space-y-3 text-xs">
                {article.publishedAt && (
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Published</span>
                    <span className="font-semibold text-dark">{format(new Date(article.publishedAt),'MMM d, yyyy')}</span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Read time</span>
                  <span className="font-semibold text-dark">{article.readTime || 1} min</span>
                </div>
                {article.viewCount > 0 && (
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Views</span>
                    <span className="font-semibold text-dark">{article.viewCount.toLocaleString()}</span>
                  </div>
                )}
                {article.category && (
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Category</span>
                    <span className="font-semibold capitalize text-primary-500">{article.category}</span>
                  </div>
                )}
              </div>
            </SideCard>

            {/* Tags */}
            {article.tags?.length > 0 && (
              <SideCard title="Tags" Icon={Tags}>
                <div className="flex flex-wrap gap-1.5">
                  {article.tags.map(t => (
                    <Link key={t} to={`/news?search=${encodeURIComponent(t)}`}
                      className="tag !text-[10px] hover:bg-primary-100 transition-colors cursor-pointer">#{t}</Link>
                  ))}
                </div>
              </SideCard>
            )}

            {/* Newsletter subscribe */}
            <div className="rounded-2xl p-5" style={{background:'linear-gradient(135deg,#1A0A35,#250F47)'}}>
              <div className="w-10 h-10 rounded-xl flex items-center justify-center mb-3 bg-gradient-to-br from-gold to-[#FFB84D]">
                <Mail className="w-5 h-5 text-white"/>
              </div>
              <h4 className="font-display font-bold text-sm text-white mb-1">Stay Updated</h4>
              <p className="text-xs mb-4 text-white/55">
                Get the latest village news delivered to your inbox.
              </p>
              <SubscribeBox/>
            </div>

            {/* Browse more */}
            <SideCard title="Browse News" Icon={Newspaper}>
              <Link to="/news" className="flex items-center justify-between text-sm font-semibold py-2 transition-colors hover:text-primary-500 text-primary-500">
                All Articles <ArrowRight className="w-3 h-3"/>
              </Link>
              {['Projects','Education','Health','Community','Culture'].map(c => (
                <Link key={c} to={`/news?cat=${c}`}
                  className="flex items-center justify-between text-xs py-2 border-t transition-colors hover:text-primary-500 text-muted-foreground"
                  style={{borderColor:'rgba(91,45,142,0.06)'}}>
                  {c} <ChevronRight className="w-3 h-3 text-muted-foreground"/>
                </Link>
              ))}
            </SideCard>
          </aside>
        </div>
      </div>

      {/* ── Comments ── */}
      <CommentsSection slug={slug}/>

      {/* ── Related articles ── */}
      {related.length > 0 && (
        <section className="py-16 border-t bg-white" style={{borderColor:'rgba(91,45,142,0.06)'}}>
          <div className="max-w-7xl mx-auto px-6">
            <div className="flex items-center justify-between mb-8">
              <div>
                <div className="text-xs uppercase tracking-widest font-semibold mb-1 text-gold">Keep Reading</div>
                <h3 className="font-display font-bold text-2xl text-dark">
                  Related <span className="text-primary-500">Articles</span>
                </h3>
              </div>
              <Link to="/news" className="hidden md:flex items-center gap-1.5 text-sm font-semibold hover:underline text-primary-500">
                All Articles <ArrowRight className="w-3 h-3"/>
              </Link>
            </div>
            <div className="grid grid-cols-2 gap-6">
              {related.map(a => <NewsCard key={a.id} article={a}/>)}
            </div>
          </div>
        </section>
      )}
    </div>
  )
}
