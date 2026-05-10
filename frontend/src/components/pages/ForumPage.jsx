import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useQuery, useMutation, useQueryClient } from 'react-query'
import { useForm } from 'react-hook-form'
import { formatDistanceToNow } from 'date-fns'
import toast from 'react-hot-toast'
import api from '../../services/api'
import { useAuth } from '../../context/AuthContext'

const CAT_COLORS = {
  general:'#5B2D8E', projects:'#F0A500', culture:'#dc2626',
  youth:'#16a34a', health:'#0284c7', diaspora:'#7C3AED',
  jobs:'#D97706', announcements:'#059669',
}

export default function ForumPage() {
  const { user }  = useAuth()
  const navigate  = useNavigate()
  const qc        = useQueryClient()
  const [activeCat,   setActiveCat]   = useState('all')
  const [search,      setSearch]      = useState('')
  const [newThread,   setNewThread]   = useState(false)
  const { register, handleSubmit, reset, formState:{errors} } = useForm()

  const { data: categories } = useQuery('forum-cats',
    () => api.get('/forum/categories').then(r => r.data))
  const { data: threads, isLoading } = useQuery(
    ['forum-threads', activeCat, search],
    () => api.get(`/forum/threads?${activeCat!=='all'?`category=${activeCat}&`:''}${search?`search=${search}&`:''}`).then(r => r.data),
    { staleTime:15000 }
  )
  const createMut = useMutation(
    data => api.post('/forum/threads', data),
    { onSuccess: (r) => { toast.success('Thread posted!'); qc.invalidateQueries('forum-threads'); reset(); setNewThread(false); navigate(`/forum/${r.data.id}`) } }
  )

  return (
    <div>
      {/* Hero */}
      <div className="page-hero py-20 px-6">
        <div className="max-w-6xl mx-auto">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
            <div>
              <div className="eyebrow mb-3" style={{color:'rgba(240,165,0,0.9)'}}>
                <span className="w-5 h-0.5 rounded-full inline-block mr-2" style={{background:'#F0A500'}}/>Community
              </div>
              <h1 className="font-display font-bold text-4xl text-white mb-2">Community Forum</h1>
              <p className="text-sm" style={{color:'rgba(255,255,255,0.6)',fontFamily:'Poppins,sans-serif'}}>
                Discuss, share and connect. A space for every voice in Nkenkak-Ngiesang.
              </p>
            </div>
            {user ? (
              <button onClick={()=>setNewThread(true)} className="btn-gold flex-shrink-0">
                <i className="fas fa-pen text-xs"/>Start Discussion
              </button>
            ) : (
              <Link to="/login" className="btn-outline-white flex-shrink-0">
                <i className="fas fa-sign-in-alt text-xs"/>Login to Post
              </Link>
            )}
          </div>
        </div>
      </div>

      <section className="py-10" style={{background:'#FAFAFA'}}>
        <div className="max-w-6xl mx-auto px-6 grid lg:grid-cols-4 gap-8">

          {/* Sidebar */}
          <div className="lg:col-span-1 space-y-5">
            {/* Search */}
            <div className="card p-4">
              <div className="relative">
                <i className="fas fa-search absolute left-3 top-1/2 -translate-y-1/2 text-sm" style={{color:'#A3A3A3'}}/>
                <input value={search} onChange={e=>setSearch(e.target.value)}
                  placeholder="Search discussions…" className="input !pl-9 !py-2.5 !text-sm"/>
              </div>
            </div>

            {/* Categories */}
            <div className="card p-4">
              <h3 className="font-display font-semibold text-sm mb-3" style={{color:'#1A0A35'}}>Categories</h3>
              <div className="space-y-1">
                <button onClick={()=>setActiveCat('all')}
                  className="w-full text-left px-3 py-2.5 rounded-xl text-sm flex items-center justify-between transition-all"
                  style={{background:activeCat==='all'?'linear-gradient(135deg,#5B2D8E,#7B4DB8)':'transparent', color:activeCat==='all'?'#fff':'#525252', fontFamily:'Poppins,sans-serif'}}>
                  <span className="flex items-center gap-2"><i className="fas fa-layer-group w-4 text-center"/><span>All Topics</span></span>
                  <span className="text-xs opacity-60">{threads?.length||0}</span>
                </button>
                {categories?.map(cat=>{
                  const color = CAT_COLORS[cat.slug]||'#5B2D8E'
                  return (
                    <button key={cat.id} onClick={()=>setActiveCat(cat.slug)}
                      className="w-full text-left px-3 py-2.5 rounded-xl text-sm flex items-center justify-between transition-all"
                      style={{background:activeCat===cat.slug?`${color}12`:'transparent', color:activeCat===cat.slug?color:'#525252', fontFamily:'Poppins,sans-serif'}}>
                      <span className="flex items-center gap-2">
                        <i className={`${cat.icon||'fas fa-comments'} w-4 text-center text-xs`} style={{color}}/>
                        <span>{cat.name}</span>
                      </span>
                      <span className="text-xs opacity-50">{cat.thread_count||0}</span>
                    </button>
                  )
                })}
              </div>
            </div>

            {/* Stats */}
            <div className="card p-4">
              <h3 className="font-display font-semibold text-sm mb-3" style={{color:'#1A0A35'}}>Forum Stats</h3>
              {[
                {label:'Threads',    value:threads?.length||0},
                {label:'Categories', value:categories?.length||0},
              ].map(s=>(
                <div key={s.label} className="flex justify-between py-2 border-b last:border-0 text-sm" style={{borderColor:'rgba(91,45,142,0.06)',fontFamily:'Poppins,sans-serif'}}>
                  <span style={{color:'#737373'}}>{s.label}</span>
                  <span className="font-semibold" style={{color:'#1A0A35'}}>{s.value}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Thread list */}
          <div className="lg:col-span-3 space-y-3">
            {isLoading ? (
              [1,2,3,4].map(i=><div key={i} className="h-24 rounded-3xl animate-pulse" style={{background:'rgba(91,45,142,0.04)'}}/>)
            ) : threads?.length ? threads.map(t=>{
              const catColor = CAT_COLORS[t.category_slug]||'#5B2D8E'
              return (
                <Link key={t.id} to={`/forum/${t.id}`} className="forum-card flex items-start gap-4 group block">
                  {/* Avatar */}
                  <div className="w-10 h-10 rounded-full flex items-center justify-center text-white text-sm font-bold flex-shrink-0 mt-0.5"
                    style={{background:'linear-gradient(135deg,#5B2D8E,#7B4DB8)'}}>
                    {t.author_name?.[0]?.toUpperCase()||'?'}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1.5 flex-wrap">
                      {t.is_pinned && (
                        <span className="text-[9px] font-bold uppercase tracking-widest px-2 py-0.5 rounded-full"
                          style={{background:'rgba(240,165,0,0.1)',color:'#C87800'}}>
                          <i className="fas fa-thumbtack mr-1"/>Pinned
                        </span>
                      )}
                      <span className="text-[10px] font-bold uppercase tracking-widest px-2 py-0.5 rounded-full"
                        style={{background:`${catColor}14`,color:catColor}}>
                        {t.category_name}
                      </span>
                    </div>
                    <h4 className="font-display font-semibold text-sm mb-1 group-hover:text-primary-500 transition-colors truncate pr-4" style={{color:'#1A0A35'}}>{t.title}</h4>
                    <div className="flex items-center gap-3 text-xs" style={{color:'#A3A3A3',fontFamily:'Poppins,sans-serif'}}>
                      <span>{t.author_name}</span>
                      <span>·</span>
                      <span>{formatDistanceToNow(new Date(t.last_reply_at))} ago</span>
                    </div>
                  </div>
                  <div className="hidden sm:flex flex-col items-end gap-1.5 flex-shrink-0 text-xs" style={{color:'#A3A3A3',fontFamily:'Poppins,sans-serif'}}>
                    <span className="flex items-center gap-1"><i className="fas fa-reply text-[9px]"/>{t.reply_count}</span>
                    <span className="flex items-center gap-1"><i className="fas fa-eye text-[9px]"/>{t.view_count}</span>
                  </div>
                </Link>
              )
            }) : (
              <div className="text-center py-20 rounded-3xl" style={{background:'rgba(91,45,142,0.03)',border:'1px dashed rgba(91,45,142,0.12)'}}>
                <i className="fas fa-comments text-5xl mb-4 block" style={{color:'rgba(91,45,142,0.15)'}}/>
                <h3 className="font-display font-bold text-xl mb-2" style={{color:'#1A0A35'}}>No threads yet</h3>
                {user && <button onClick={()=>setNewThread(true)} className="text-sm font-semibold hover:underline mt-1" style={{color:'#5B2D8E',fontFamily:'Sora,sans-serif'}}>Start the first discussion →</button>}
              </div>
            )}
          </div>
        </div>
      </section>

      {/* New Thread Modal */}
      {newThread && (
        <div className="modal-overlay" onClick={e=>e.target===e.currentTarget&&setNewThread(false)}>
          <div className="modal-box max-w-lg animate-slide-up">
            <div className="px-7 pt-7 pb-5 border-b flex items-center justify-between" style={{borderColor:'rgba(91,45,142,0.08)'}}>
              <div>
                <h2 className="font-display font-bold text-xl" style={{color:'#1A0A35'}}>Start a Discussion</h2>
                <p className="text-sm mt-0.5" style={{color:'#737373',fontFamily:'Poppins,sans-serif'}}>Share your thoughts with the community</p>
              </div>
              <button onClick={()=>setNewThread(false)} className="w-9 h-9 rounded-full flex items-center justify-center hover:bg-primary-50 transition-colors" style={{color:'#A3A3A3'}}>
                <i className="fas fa-times"/>
              </button>
            </div>
            <form onSubmit={handleSubmit(d=>createMut.mutate(d))} className="p-7 space-y-4">
              <div>
                <label className="label">Category *</label>
                <select {...register('category_id',{required:true})} className="input">
                  <option value="">Select a category…</option>
                  {categories?.map(c=><option key={c.id} value={c.id}>{c.name}</option>)}
                </select>
                {errors.category_id && <p className="text-xs mt-1" style={{color:'#dc2626'}}>Category required</p>}
              </div>
              <div>
                <label className="label">Thread Title *</label>
                <input {...register('title',{required:true,minLength:{value:10,message:'Min 10 characters'}})}
                  placeholder="What would you like to discuss?" className="input"/>
                {errors.title && <p className="text-xs mt-1" style={{color:'#dc2626'}}>{errors.title.message||'Title required'}</p>}
              </div>
              <div>
                <label className="label">Content *</label>
                <textarea {...register('content',{required:true,minLength:{value:20,message:'Min 20 characters'}})}
                  rows={5} placeholder="Share your thoughts in detail…" className="input resize-none"/>
                {errors.content && <p className="text-xs mt-1" style={{color:'#dc2626'}}>{errors.content.message||'Content required'}</p>}
              </div>
              <button type="submit" disabled={createMut.isLoading} className="btn-secondary w-full justify-center">
                {createMut.isLoading?<><i className="fas fa-spinner animate-spin"/>Posting…</>:<><i className="fas fa-paper-plane"/>Post Thread</>}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
