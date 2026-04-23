import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useQuery, useMutation, useQueryClient } from 'react-query'
import { useForm } from 'react-hook-form'
import { format, formatDistanceToNow } from 'date-fns'
import toast from 'react-hot-toast'
import api from '../../services/api'
import { useAuth } from '../../context/AuthContext'

export default function ForumPage() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const qc = useQueryClient()
  const [activeCat, setActiveCat]     = useState('all')
  const [search, setSearch]           = useState('')
  const [newThread, setNewThread]     = useState(false)
  const { register, handleSubmit, reset, formState: { errors } } = useForm()

  const { data: categories } = useQuery('forum-cats', () => api.get('/forum/categories').then(r => r.data))
  const { data: threads, isLoading } = useQuery(
    ['forum-threads', activeCat, search],
    () => api.get(`/forum/threads?${activeCat !== 'all' ? `category=${activeCat}&` : ''}${search ? `search=${search}&` : ''}limit=30`).then(r => r.data),
    { staleTime: 15000 }
  )

  const createMut = useMutation(
    data => api.post('/forum/threads', data),
    { onSuccess: (r) => { toast.success('Thread created!'); qc.invalidateQueries('forum-threads'); reset(); setNewThread(false); navigate(`/forum/${r.data.id}`) } }
  )

  const onSubmit = (data) => {
    const cat = categories?.find(c => c.id === data.category_id)
    if (!cat) return toast.error('Select a category')
    createMut.mutate(data)
  }

  return (
    <div>
      {/* Hero */}
      <div className="bg-gradient-to-br from-[#1A2D4A] via-earth to-earth-light py-20 relative overflow-hidden">
        <div className="absolute inset-0 bg-pattern"/>
        <div className="relative max-w-5xl mx-auto px-6 text-center">
          <div className="section-eyebrow" style={{color:'#E8C97A'}}>Community</div>
          <h1 className="section-title-light text-5xl mb-4">Community Forum</h1>
          <div className="divider"/>
          <p className="text-cream/60 max-w-xl mx-auto text-sm">Discuss, share and connect. A space for every voice in Nkenkak-Ngiesang.</p>
          {user && (
            <button onClick={() => setNewThread(true)} className="btn-gold text-sm mt-8">
              <i className="fas fa-pen"/> Start a Discussion
            </button>
          )}
          {!user && (
            <Link to="/login" className="btn-outline-gold text-sm mt-8">
              <i className="fas fa-sign-in-alt"/> Login to Participate
            </Link>
          )}
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-6 py-12">
        <div className="grid md:grid-cols-4 gap-8">
          {/* Sidebar */}
          <div className="space-y-4">
            <h3 className="font-semibold text-earth text-sm uppercase tracking-widest">Categories</h3>
            <div className="space-y-1">
              <button onClick={() => setActiveCat('all')}
                className={`w-full text-left px-4 py-2.5 rounded-lg text-sm transition-all flex items-center justify-between ${activeCat==='all'?'bg-earth text-gold font-semibold':'text-earth/70 hover:bg-earth/5'}`}>
                <span><i className="fas fa-layer-group w-5"/> All Topics</span>
                <span className="text-xs opacity-60">{threads?.length || 0}</span>
              </button>
              {categories?.map(cat => (
                <button key={cat.id} onClick={() => setActiveCat(cat.slug)}
                  className={`w-full text-left px-4 py-2.5 rounded-lg text-sm transition-all flex items-center justify-between ${activeCat===cat.slug?'bg-earth text-gold font-semibold':'text-earth/70 hover:bg-earth/5'}`}>
                  <span>
                    <i className={`${cat.icon} w-5`} style={{color: activeCat===cat.slug?'#C9A84C':cat.color}}/>
                    {' '}{cat.name}
                  </span>
                  <span className="text-xs opacity-60">{cat.thread_count}</span>
                </button>
              ))}
            </div>

            {/* Forum stats */}
            <div className="bg-white rounded-xl p-4 border border-black/5 space-y-3 mt-4">
              <h4 className="font-semibold text-earth text-xs uppercase tracking-widest">Forum Stats</h4>
              <div className="text-sm text-earth/60 space-y-1.5">
                <div className="flex justify-between"><span>Threads</span><span className="font-bold text-earth">{threads?.length || 0}</span></div>
                <div className="flex justify-between"><span>Categories</span><span className="font-bold text-earth">{categories?.length || 0}</span></div>
              </div>
            </div>
          </div>

          {/* Threads */}
          <div className="md:col-span-3 space-y-4">
            {/* Search */}
            <div className="relative">
              <i className="fas fa-search absolute left-4 top-1/2 -translate-y-1/2 text-earth/30 text-sm"/>
              <input value={search} onChange={e => setSearch(e.target.value)}
                placeholder="Search discussions..." className="input pl-11 w-full"/>
            </div>

            {isLoading ? (
              <div className="space-y-3">{[1,2,3,4].map(i => <div key={i} className="h-20 rounded-xl bg-earth/5 animate-pulse"/>)}</div>
            ) : threads?.length ? (
              <div className="space-y-2">
                {threads.map(t => (
                  <Link key={t.id} to={`/forum/${t.id}`} className="forum-card flex items-start gap-4 group block">
                    <div className="w-10 h-10 rounded-full bg-earth/8 flex items-center justify-center text-earth/40 text-sm flex-shrink-0 mt-0.5">
                      {t.author_avatar ? <img src={t.author_avatar} className="w-full h-full rounded-full object-cover"/> : <i className="fas fa-user"/>}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1 flex-wrap">
                        {t.is_pinned && <span className="text-[9px] bg-gold/15 text-gold font-black uppercase tracking-widest px-2 py-0.5 rounded-full"><i className="fas fa-thumbtack"/> Pinned</span>}
                        <span className="text-[10px] font-bold uppercase tracking-widest px-2 py-0.5 rounded-full" style={{background:`${t.category_color}20`,color:t.category_color}}>{t.category_name}</span>
                      </div>
                      <h4 className="font-semibold text-earth group-hover:text-gold-dark transition-colors truncate">{t.title}</h4>
                      <div className="flex items-center gap-3 mt-1.5 text-earth/40 text-xs">
                        <span>{t.author_name}</span>
                        <span>·</span>
                        <span>{formatDistanceToNow(new Date(t.last_reply_at))} ago</span>
                      </div>
                    </div>
                    <div className="text-right flex-shrink-0 hidden sm:block">
                      <div className="flex items-center gap-3 text-xs text-earth/40">
                        <span className="flex items-center gap-1"><i className="fas fa-reply text-[9px]"/>{t.reply_count}</span>
                        <span className="flex items-center gap-1"><i className="fas fa-eye text-[9px]"/>{t.view_count}</span>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            ) : (
              <div className="text-center py-20">
                <i className="fas fa-comments text-earth/20 text-5xl mb-4 block"/>
                <h3 className="font-serif text-xl text-earth/40 mb-2">No threads yet</h3>
                {user && <button onClick={() => setNewThread(true)} className="text-gold text-sm hover:underline">Be the first to start a discussion →</button>}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* New Thread Modal */}
      {newThread && (
        <div className="modal-overlay" onClick={e => e.target===e.currentTarget && setNewThread(false)}>
          <div className="modal-box max-w-lg animate-slide-up">
            <div className="p-6 border-b border-black/8 flex justify-between items-center">
              <h2 className="font-serif text-2xl text-earth">Start a Discussion</h2>
              <button onClick={() => setNewThread(false)} className="w-9 h-9 rounded-full bg-black/5 flex items-center justify-center text-earth/50"><i className="fas fa-times"/></button>
            </div>
            <form onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-4">
              <div>
                <label className="label">Category *</label>
                <select {...register('category_id', { required: true })} className="input">
                  <option value="">Select a category...</option>
                  {categories?.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                </select>
              </div>
              <div>
                <label className="label">Title *</label>
                <input {...register('title', { required: 'Title required', minLength: { value: 10, message: 'Min 10 characters' } })}
                  placeholder="What would you like to discuss?" className="input"/>
                {errors.title && <p className="text-red-500 text-xs mt-1">{errors.title.message}</p>}
              </div>
              <div>
                <label className="label">Content *</label>
                <textarea {...register('content', { required: 'Content required', minLength: { value: 20, message: 'Min 20 characters' } })}
                  rows={5} placeholder="Share your thoughts..." className="input resize-none"/>
                {errors.content && <p className="text-red-500 text-xs mt-1">{errors.content.message}</p>}
              </div>
              <button type="submit" disabled={createMut.isLoading} className="btn-earth w-full justify-center">
                {createMut.isLoading ? <><i className="fas fa-spinner animate-spin"/> Posting...</> : <><i className="fas fa-paper-plane"/> Post Thread</>}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
