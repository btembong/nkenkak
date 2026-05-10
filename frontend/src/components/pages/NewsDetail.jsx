import { useState } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import { useQuery, useMutation, useQueryClient } from 'react-query'
import { format } from 'date-fns'
import toast from 'react-hot-toast'
import api from '../../services/api'
import NewsCard from '../common/NewsCard'
import { useAuth } from '../../context/AuthContext'

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
      <i className="fas fa-check-circle text-2xl mb-2 block" style={{color:'#16a34a'}}/>
      <p className="text-sm font-semibold" style={{color:'#1A0A35',fontFamily:'Sora,sans-serif'}}>You're subscribed!</p>
    </div>
  )

  return (
    <form onSubmit={submit} className="space-y-3">
      <input value={email} onChange={e => setEmail(e.target.value)} type="email" required
        placeholder="your@email.com"
        className="w-full px-4 py-2.5 rounded-xl text-sm outline-none"
        style={{background:'rgba(91,45,142,0.04)',border:'1px solid rgba(91,45,142,0.12)',color:'#1A0A35',fontFamily:'Poppins,sans-serif'}}/>
      <button type="submit" className="btn-secondary w-full justify-center !py-2.5 !text-sm">
        <i className="fas fa-bell text-xs"/>Get Updates
      </button>
    </form>
  )
}

/* ── Sidebar card wrapper ── */
function SideCard({ title, icon, children }) {
  return (
    <div className="rounded-2xl p-5" style={{background:'#fff',border:'1px solid rgba(91,45,142,0.08)',boxShadow:'0 2px 16px rgba(91,45,142,0.06)'}}>
      <div className="flex items-center gap-2 mb-4">
        <i className={`fas ${icon} text-sm`} style={{color:'#5B2D8E'}}/>
        <h4 className="font-display font-bold text-sm" style={{color:'#1A0A35'}}>{title}</h4>
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
            <i className="fas fa-comments text-sm text-white"/>
          </div>
          <div>
            <h3 className="font-display font-bold text-xl" style={{color:'#1A0A35'}}>Discussion</h3>
            <p className="text-xs" style={{color:'#A3A3A3',fontFamily:'Poppins,sans-serif'}}>{comments.length} comment{comments.length !== 1 ? 's' : ''}</p>
          </div>
        </div>

        {/* Comment form */}
        <div className="rounded-2xl p-6 mb-8" style={{background:'#fff',border:'1px solid rgba(91,45,142,0.08)'}}>
          <h4 className="font-semibold text-sm mb-4" style={{color:'#1A0A35',fontFamily:'Sora,sans-serif'}}>Leave a comment</h4>
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
            {postMut.isLoading ? <><i className="fas fa-spinner animate-spin"/>Posting…</> : <><i className="fas fa-paper-plane"/>Post Comment</>}
          </button>
        </div>

        {/* Comments list */}
        {isLoading ? (
          <div className="space-y-4">
            {[1,2].map(i => <div key={i} className="h-20 rounded-2xl animate-pulse" style={{background:'rgba(91,45,142,0.04)'}}/>)}
          </div>
        ) : comments.length === 0 ? (
          <div className="text-center py-10" style={{color:'#A3A3A3',fontFamily:'Poppins,sans-serif'}}>
            <i className="fas fa-comment-slash text-3xl mb-3 block" style={{color:'rgba(91,45,142,0.12)'}}/>
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
                    <span className="text-sm font-semibold" style={{color:'#1A0A35',fontFamily:'Sora,sans-serif'}}>
                      {c.user ? `${c.user.firstName} ${c.user.lastName}` : c.name}
                    </span>
                    <span className="text-[11px]" style={{color:'#A3A3A3',fontFamily:'Poppins,sans-serif'}}>
                      {format(new Date(c.createdAt), 'MMM d, yyyy')}
                    </span>
                  </div>
                  <p className="text-sm leading-relaxed" style={{color:'#4B4B6B',fontFamily:'Poppins,sans-serif'}}>{c.content}</p>
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

  if (isLoading) return (
    <div className="max-w-4xl mx-auto px-6 py-20 space-y-5">
      <div className="h-72 rounded-3xl animate-pulse" style={{background:'rgba(91,45,142,0.06)'}}/>
      {[1,2,3,4].map(i => <div key={i} className="h-5 rounded-xl animate-pulse" style={{background:'rgba(91,45,142,0.04)',width:`${85-i*10}%`}}/>)}
    </div>
  )

  if (!article) return (
    <div className="text-center py-36">
      <i className="fas fa-newspaper text-5xl mb-4 block" style={{color:'rgba(91,45,142,0.15)'}}/>
      <h3 className="font-display font-bold text-2xl mb-3" style={{color:'#1A0A35'}}>Article not found</h3>
      <p className="text-sm mb-6" style={{color:'#737373',fontFamily:'Poppins,sans-serif'}}>This article may have been removed or the link is incorrect.</p>
      <button onClick={() => navigate('/news')} className="btn-secondary !py-2.5 !px-6">
        <i className="fas fa-arrow-left text-xs"/>Back to News
      </button>
    </div>
  )

  const url = shareUrl()

  return (
    <div style={{background:'#F9F7FD'}}>

      {/* ── Full-bleed hero ── */}
      <div className="relative overflow-hidden" style={{background:'linear-gradient(135deg,#1A0A35,#250F47)', minHeight:420}}>
        {article.coverImage && (
          <img src={article.coverImage} alt={article.title}
            className="absolute inset-0 w-full h-full object-cover opacity-30"/>
        )}
        <div className="absolute inset-0" style={{background:'linear-gradient(to top, rgba(26,10,53,1) 0%, rgba(26,10,53,0.7) 40%, rgba(26,10,53,0.3) 100%)'}}/>

        <div className="relative max-w-4xl mx-auto px-6 py-20 flex flex-col justify-end" style={{minHeight:420}}>
          {/* Breadcrumb */}
          <div className="flex items-center gap-2 text-xs mb-6" style={{color:'rgba(255,255,255,0.5)',fontFamily:'Poppins,sans-serif'}}>
            <Link to="/" className="hover:text-white transition-colors"><i className="fas fa-home text-[10px] mr-1"/>Home</Link>
            <i className="fas fa-chevron-right text-[8px]" style={{color:'#F0A500'}}/>
            <Link to="/news" className="hover:text-white transition-colors">News</Link>
            <i className="fas fa-chevron-right text-[8px]" style={{color:'#F0A500'}}/>
            <span className="truncate max-w-[200px]" style={{color:'rgba(255,255,255,0.7)'}}>{article.title}</span>
          </div>

          {/* Category + featured badge */}
          <div className="flex items-center gap-2 mb-4 flex-wrap">
            {article.category && (
              <span className="text-[10px] font-bold uppercase tracking-wider px-3 py-1 rounded-full"
                style={{background:'rgba(240,165,0,0.2)',color:'#F0A500',border:'1px solid rgba(240,165,0,0.3)'}}>
                {article.category}
              </span>
            )}
            {article.isFeatured && (
              <span className="text-[10px] font-bold uppercase tracking-wider px-3 py-1 rounded-full"
                style={{background:'rgba(240,165,0,0.1)',color:'#F0A500',border:'1px solid rgba(240,165,0,0.2)'}}>
                <i className="fas fa-star text-[8px] mr-1"/>Featured
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
                <div className="text-[9px] uppercase tracking-wider" style={{color:'rgba(240,165,0,0.7)'}}>Author</div>
              </div>
            </div>

            <div className="w-px h-8" style={{background:'rgba(255,255,255,0.1)'}}/>

            {article.publishedAt && (
              <div className="flex items-center gap-1.5 text-xs" style={{color:'rgba(255,255,255,0.65)',fontFamily:'Poppins,sans-serif'}}>
                <i className="fas fa-calendar text-[10px]" style={{color:'#F0A500'}}/>
                {format(new Date(article.publishedAt), 'MMMM d, yyyy')}
              </div>
            )}

            <div className="flex items-center gap-1.5 text-xs" style={{color:'rgba(255,255,255,0.65)',fontFamily:'Poppins,sans-serif'}}>
              <i className="fas fa-clock text-[10px]" style={{color:'#F0A500'}}/>
              {article.readTime || 1} min read
            </div>

            {article.viewCount > 0 && (
              <div className="flex items-center gap-1.5 text-xs" style={{color:'rgba(255,255,255,0.65)',fontFamily:'Poppins,sans-serif'}}>
                <i className="fas fa-eye text-[10px]" style={{color:'#F0A500'}}/>
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
              <p className="text-lg leading-relaxed mb-8 font-medium border-l-4 pl-5"
                style={{color:'#404040',fontFamily:'Poppins,sans-serif',borderColor:'#F0A500'}}>
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
            <div className="prose-article mb-10"
              style={{
                color:'#404040', fontFamily:'Poppins,sans-serif', lineHeight:'1.95',
                fontSize:'1.0625rem',
              }}
              dangerouslySetInnerHTML={{__html: article.content}}/>

            {/* Tags */}
            {article.tags?.length > 0 && (
              <div className="flex items-center gap-2 flex-wrap mb-8 pt-6 border-t" style={{borderColor:'rgba(91,45,142,0.08)'}}>
                <span className="text-xs font-bold uppercase tracking-wider mr-1" style={{color:'#A3A3A3',fontFamily:'Sora,sans-serif'}}>Tags:</span>
                {article.tags.map(t => (
                  <Link key={t} to={`/news?search=${encodeURIComponent(t)}`}
                    className="tag hover:bg-primary-100 transition-colors cursor-pointer">#{t}</Link>
                ))}
              </div>
            )}

            {/* Share row (mobile / in-article) */}
            <div className="flex items-center justify-between py-5 px-6 rounded-2xl mb-8 flex-wrap gap-3 lg:hidden"
              style={{background:'#fff',border:'1px solid rgba(91,45,142,0.08)',boxShadow:'0 2px 12px rgba(91,45,142,0.05)'}}>
              <span className="text-sm font-semibold" style={{color:'#1A0A35',fontFamily:'Sora,sans-serif'}}>Share this article</span>
              <div className="flex gap-2">
                {SHARE.map(s => (
                  <a key={s.label} href={s.href(url)} target="_blank" rel="noopener noreferrer"
                    className="w-9 h-9 rounded-full flex items-center justify-center text-white text-xs transition-all hover:-translate-y-0.5 hover:shadow-card"
                    style={{background:s.color}}>
                    <i className={s.icon}/>
                  </a>
                ))}
                <button onClick={copyLink}
                  className="w-9 h-9 rounded-full flex items-center justify-center text-white text-xs transition-all hover:-translate-y-0.5 hover:shadow-card"
                  style={{background:'#5B2D8E'}}>
                  <i className="fas fa-link text-xs"/>
                </button>
              </div>
            </div>

            {/* Author card */}
            <div className="rounded-3xl p-6 flex gap-5 items-start mb-8"
              style={{background:'linear-gradient(135deg,rgba(91,45,142,0.04),rgba(240,165,0,0.04))',border:'1px solid rgba(91,45,142,0.1)'}}>
              <div className="w-16 h-16 rounded-2xl flex items-center justify-center text-xl font-bold text-white flex-shrink-0"
                style={{background:'linear-gradient(135deg,#5B2D8E,#7B4DB8)'}}>
                {(article.author_name || 'N')[0]}
              </div>
              <div className="min-w-0">
                <div className="text-[10px] uppercase tracking-widest font-semibold mb-1" style={{color:'#F0A500',fontFamily:'Sora,sans-serif'}}>Written by</div>
                <h4 className="font-display font-bold text-lg mb-1" style={{color:'#1A0A35'}}>{article.author_name || 'Nkenkak Team'}</h4>
                <p className="text-sm" style={{color:'#737373',fontFamily:'Poppins,sans-serif'}}>
                  Community contributor for Nkenkak-Ngiesang. Sharing stories and updates that matter to our people at home and abroad.
                </p>
              </div>
            </div>

            {/* Back link */}
            <Link to="/news" className="btn-outline !text-sm !py-2.5 !px-5 inline-flex items-center gap-2">
              <i className="fas fa-arrow-left text-xs"/>Back to News
            </Link>
          </article>

          {/* ── Sidebar ── */}
          <aside className="hidden lg:flex flex-col gap-5 w-72 flex-shrink-0 sticky top-24">

            {/* Share */}
            <SideCard title="Share Article" icon="fa-share-alt">
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
                className="mt-2 w-full flex items-center justify-center gap-2 px-3 py-2.5 rounded-xl text-xs font-semibold transition-all hover:opacity-80"
                style={{background:'rgba(91,45,142,0.08)',color:'#5B2D8E',fontFamily:'Sora,sans-serif'}}>
                <i className="fas fa-link text-[11px]"/>Copy Link
              </button>
            </SideCard>

            {/* Article info */}
            <SideCard title="Article Info" icon="fa-info-circle">
              <div className="space-y-3 text-xs" style={{fontFamily:'Poppins,sans-serif'}}>
                {article.publishedAt && (
                  <div className="flex justify-between">
                    <span style={{color:'#A3A3A3'}}>Published</span>
                    <span className="font-semibold" style={{color:'#1A0A35'}}>{format(new Date(article.publishedAt),'MMM d, yyyy')}</span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span style={{color:'#A3A3A3'}}>Read time</span>
                  <span className="font-semibold" style={{color:'#1A0A35'}}>{article.readTime || 1} min</span>
                </div>
                {article.viewCount > 0 && (
                  <div className="flex justify-between">
                    <span style={{color:'#A3A3A3'}}>Views</span>
                    <span className="font-semibold" style={{color:'#1A0A35'}}>{article.viewCount.toLocaleString()}</span>
                  </div>
                )}
                {article.category && (
                  <div className="flex justify-between">
                    <span style={{color:'#A3A3A3'}}>Category</span>
                    <span className="font-semibold capitalize" style={{color:'#5B2D8E'}}>{article.category}</span>
                  </div>
                )}
              </div>
            </SideCard>

            {/* Tags */}
            {article.tags?.length > 0 && (
              <SideCard title="Tags" icon="fa-tags">
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
              <div className="w-10 h-10 rounded-xl flex items-center justify-center mb-3" style={{background:'linear-gradient(135deg,#F0A500,#FFB84D)'}}>
                <i className="fas fa-envelope text-white text-sm"/>
              </div>
              <h4 className="font-display font-bold text-sm text-white mb-1">Stay Updated</h4>
              <p className="text-xs mb-4" style={{color:'rgba(255,255,255,0.55)',fontFamily:'Poppins,sans-serif'}}>
                Get the latest village news delivered to your inbox.
              </p>
              <SubscribeBox/>
            </div>

            {/* Browse more */}
            <SideCard title="Browse News" icon="fa-newspaper">
              <Link to="/news" className="flex items-center justify-between text-sm font-semibold py-2 transition-colors hover:text-primary-500"
                style={{color:'#5B2D8E',fontFamily:'Sora,sans-serif'}}>
                All Articles <i className="fas fa-arrow-right text-xs"/>
              </Link>
              {['Projects','Education','Health','Community','Culture'].map(c => (
                <Link key={c} to={`/news?cat=${c}`}
                  className="flex items-center justify-between text-xs py-2 border-t transition-colors hover:text-primary-500"
                  style={{color:'#737373',borderColor:'rgba(91,45,142,0.06)',fontFamily:'Poppins,sans-serif'}}>
                  {c} <i className="fas fa-chevron-right text-[8px]" style={{color:'#A3A3A3'}}/>
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
        <section className="py-16 border-t" style={{borderColor:'rgba(91,45,142,0.06)',background:'#fff'}}>
          <div className="max-w-7xl mx-auto px-6">
            <div className="flex items-center justify-between mb-8">
              <div>
                <div className="text-xs uppercase tracking-widest font-semibold mb-1" style={{color:'#F0A500',fontFamily:'Sora,sans-serif'}}>Keep Reading</div>
                <h3 className="font-display font-bold text-2xl" style={{color:'#1A0A35'}}>
                  Related <span style={{color:'#5B2D8E'}}>Articles</span>
                </h3>
              </div>
              <Link to="/news" className="hidden md:flex items-center gap-1.5 text-sm font-semibold hover:underline" style={{color:'#5B2D8E',fontFamily:'Sora,sans-serif'}}>
                All Articles <i className="fas fa-arrow-right text-xs"/>
              </Link>
            </div>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {related.map(a => <NewsCard key={a.id} article={a}/>)}
            </div>
          </div>
        </section>
      )}
    </div>
  )
}
