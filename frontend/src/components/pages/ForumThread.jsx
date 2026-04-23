import { useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { useQuery, useMutation, useQueryClient } from 'react-query'
import { useForm } from 'react-hook-form'
import { formatDistanceToNow, format } from 'date-fns'
import toast from 'react-hot-toast'
import api from '../../services/api'
import { useAuth } from '../../context/AuthContext'

const ROLE_BADGE = { admin:'bg-gold/20 text-gold', leader:'bg-purple-100 text-purple-700', member:'bg-blue-50 text-blue-600' }

function Reply({ reply, onLike, onReply, depth = 0 }) {
  const { user } = useAuth()
  return (
    <div className={`flex gap-4 ${depth > 0 ? 'ml-10 pl-4 border-l-2 border-earth/5' : ''}`}>
      <div className="w-9 h-9 rounded-full bg-earth/8 flex items-center justify-center text-earth/40 text-sm flex-shrink-0">
        {reply.author_avatar ? <img src={reply.author_avatar} className="w-full h-full rounded-full object-cover"/> : <i className="fas fa-user"/>}
      </div>
      <div className="flex-1">
        <div className="bg-cream-light/60 rounded-xl p-4 border border-earth/5">
          <div className="flex items-center gap-2 mb-2">
            <span className="font-semibold text-sm text-earth">{reply.author_name}</span>
            {reply.author_role && reply.author_role !== 'guest' && (
              <span className={`text-[9px] font-black uppercase tracking-widest px-2 py-0.5 rounded-full ${ROLE_BADGE[reply.author_role]||'bg-earth/8 text-earth/40'}`}>{reply.author_role}</span>
            )}
            {reply.is_solution && <span className="text-[9px] bg-green-100 text-green-600 font-black uppercase tracking-widest px-2 py-0.5 rounded-full"><i className="fas fa-check"/> Solution</span>}
          </div>
          <div className="text-earth/75 text-sm leading-relaxed whitespace-pre-line">{reply.content}</div>
        </div>
        <div className="flex items-center gap-4 mt-2 ml-1">
          <span className="text-earth/30 text-xs">{formatDistanceToNow(new Date(reply.created_at))} ago</span>
          <button onClick={() => onLike(reply.id)} className="text-earth/30 text-xs hover:text-gold transition-colors flex items-center gap-1">
            <i className="fas fa-thumbs-up text-[10px]"/> {reply.like_count || 0}
          </button>
          {user && depth === 0 && (
            <button onClick={() => onReply(reply.id, reply.author_name)} className="text-earth/30 text-xs hover:text-earth transition-colors">
              <i className="fas fa-reply text-[10px]"/> Reply
            </button>
          )}
        </div>
      </div>
    </div>
  )
}

export default function ForumThread() {
  const { id } = useParams()
  const { user } = useAuth()
  const qc = useQueryClient()
  const [replyTo, setReplyTo] = useState(null) // { id, name }
  const { register, handleSubmit, reset, formState: { errors } } = useForm()

  const { data: thread, isLoading } = useQuery(
    ['thread', id],
    () => api.get(`/forum/threads/${id}`).then(r => r.data)
  )

  const replyMut = useMutation(
    data => api.post(`/forum/threads/${id}/replies`, data),
    { onSuccess: () => { toast.success('Reply posted!'); reset(); setReplyTo(null); qc.invalidateQueries(['thread', id]) } }
  )

  const likeMut = useMutation(
    replyId => api.post(`/forum/replies/${replyId}/like`),
    { onSuccess: () => qc.invalidateQueries(['thread', id]) }
  )

  const onSubmit = (data) => {
    if (!user) return toast.error('Please login to reply')
    replyMut.mutate({ content: data.content, parent_id: replyTo?.id || null })
  }

  if (isLoading) return (
    <div className="max-w-3xl mx-auto px-6 py-16 space-y-4">
      {[1,2,3].map(i => <div key={i} className="h-24 rounded-xl bg-earth/5 animate-pulse"/>)}
    </div>
  )
  if (!thread) return <div className="text-center py-24"><Link to="/forum" className="text-gold">← Back to Forum</Link></div>

  const topReplies    = thread.replies?.filter(r => !r.parent_id) || []
  const nestedReplies = thread.replies?.filter(r => r.parent_id)  || []

  return (
    <div className="max-w-3xl mx-auto px-6 py-12">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-earth/40 text-xs mb-8">
        <Link to="/forum" className="hover:text-gold">Forum</Link>
        <i className="fas fa-chevron-right text-[8px]"/>
        <span style={{color: thread.category_color}} className="font-semibold">{thread.category_name}</span>
        <i className="fas fa-chevron-right text-[8px]"/>
        <span className="truncate max-w-xs">{thread.title}</span>
      </div>

      {/* Thread */}
      <div className="bg-white rounded-2xl border border-black/5 overflow-hidden mb-8">
        {/* Thread header */}
        <div className="p-6 border-b border-black/5">
          <div className="flex items-center gap-2 mb-3">
            {thread.is_pinned && <span className="text-[9px] bg-gold/15 text-gold font-black uppercase px-2 py-0.5 rounded-full"><i className="fas fa-thumbtack"/> Pinned</span>}
            <span className="text-xs font-bold uppercase tracking-widest px-2 py-0.5 rounded-full" style={{background:`${thread.category_color}20`,color:thread.category_color}}>{thread.category_name}</span>
          </div>
          <h1 className="font-serif text-2xl text-earth mb-4">{thread.title}</h1>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-earth/8 flex items-center justify-center text-earth/40">
              {thread.author_avatar ? <img src={thread.author_avatar} className="w-full h-full rounded-full object-cover"/> : <i className="fas fa-user"/>}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-semibold text-sm text-earth">{thread.author_name}</span>
                {thread.author_role && thread.author_role !== 'guest' && (
                  <span className={`text-[9px] font-black uppercase tracking-widest px-2 py-0.5 rounded-full ${ROLE_BADGE[thread.author_role]||''}`}>{thread.author_role}</span>
                )}
              </div>
              <div className="text-earth/30 text-xs">{format(new Date(thread.created_at), 'MMMM d, yyyy')} · {thread.view_count} views</div>
            </div>
          </div>
        </div>
        <div className="p-6">
          <div className="text-earth/75 leading-relaxed whitespace-pre-line">{thread.content}</div>
        </div>
      </div>

      {/* Replies */}
      <div className="mb-8">
        <h3 className="font-serif text-xl text-earth mb-5 flex items-center gap-2">
          <i className="fas fa-comments text-gold text-base"/> {thread.reply_count || 0} Replies
        </h3>
        <div className="space-y-5">
          {topReplies.map(reply => (
            <div key={reply.id}>
              <Reply
                reply={reply}
                onLike={id => user ? likeMut.mutate(id) : toast.error('Login to like')}
                onReply={(id, name) => setReplyTo({id, name})}
              />
              {nestedReplies.filter(r => r.parent_id === reply.id).map(nested => (
                <div key={nested.id} className="mt-3">
                  <Reply reply={nested} onLike={id => user ? likeMut.mutate(id) : toast.error('Login to like')} onReply={() => {}} depth={1}/>
                </div>
              ))}
            </div>
          ))}
          {!topReplies.length && (
            <div className="text-center py-10 text-earth/30">
              <i className="fas fa-comment text-3xl mb-3 block"/>
              <p className="text-sm">No replies yet. Be the first to respond!</p>
            </div>
          )}
        </div>
      </div>

      {/* Reply form */}
      {user ? (
        <div className="bg-white rounded-2xl border border-black/5 p-6">
          <h3 className="font-semibold text-earth mb-4">
            {replyTo ? (
              <span className="flex items-center gap-2">
                <i className="fas fa-reply text-gold text-sm"/>
                Replying to <span className="text-gold">{replyTo.name}</span>
                <button onClick={() => setReplyTo(null)} className="text-earth/30 hover:text-earth ml-2 text-xs"><i className="fas fa-times"/></button>
              </span>
            ) : 'Post a Reply'}
          </h3>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div>
              <textarea {...register('content', { required: 'Reply cannot be empty', minLength: { value: 5, message: 'Too short' } })}
                rows={4} placeholder="Write your reply..." className="input resize-none"/>
              {errors.content && <p className="text-red-500 text-xs mt-1">{errors.content.message}</p>}
            </div>
            <div className="flex justify-between items-center">
              <p className="text-earth/30 text-xs">Please be respectful and constructive.</p>
              <button type="submit" disabled={replyMut.isLoading} className="btn-earth text-xs">
                {replyMut.isLoading ? <><i className="fas fa-spinner animate-spin"/> Posting...</> : <><i className="fas fa-paper-plane"/> Post Reply</>}
              </button>
            </div>
          </form>
        </div>
      ) : (
        <div className="bg-cream-light rounded-2xl border border-earth/8 p-8 text-center">
          <i className="fas fa-lock text-earth/20 text-3xl mb-3 block"/>
          <p className="text-earth/60 mb-4">Login to join the discussion</p>
          <Link to="/login" className="btn-earth text-sm"><i className="fas fa-sign-in-alt"/> Login to Reply</Link>
        </div>
      )}
    </div>
  )
}
