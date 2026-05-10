import { useState, useRef } from 'react'
import { useParams, Link } from 'react-router-dom'
import { useQuery, useMutation, useQueryClient } from 'react-query'
import { useForm } from 'react-hook-form'
import { format, formatDistanceToNow } from 'date-fns'
import toast from 'react-hot-toast'
import api from '../../services/api'
import { useAuth } from '../../context/AuthContext'

const ROLE_BADGE = {
  admin:  { bg:'rgba(240,165,0,0.15)', color:'#C87800', label:'Admin' },
  leader: { bg:'rgba(91,45,142,0.12)', color:'#5B2D8E', label:'Leader' },
  member: { bg:'rgba(0,133,200,0.1)',  color:'#0284c7', label:'Member' },
}

// Highlight @mentions in text
function MentionText({ text }) {
  if (!text) return null
  const parts = text.split(/(@[\w.]+)/g)
  return (
    <span>
      {parts.map((p, i) =>
        p.startsWith('@')
          ? <span key={i} className="font-semibold" style={{color:'#5B2D8E'}}>{p}</span>
          : <span key={i}>{p}</span>
      )}
    </span>
  )
}

// File size display
function fmtSize(bytes) {
  if (!bytes) return ''
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024*1024) return `${(bytes/1024).toFixed(1)} KB`
  return `${(bytes/1024/1024).toFixed(1)} MB`
}

function AttachmentList({ attachments }) {
  if (!attachments?.length) return null
  const icons = { pdf:'fa-file-pdf text-red-500', doc:'fa-file-word text-blue-500', docx:'fa-file-word text-blue-500', image:'fa-file-image text-green-500', default:'fa-file text-neutral-400' }
  return (
    <div className="mt-3 flex flex-wrap gap-2">
      {attachments.map(a => {
        const ext = a.fileName?.split('.').pop()?.toLowerCase()
        const icon = icons[ext] || (a.fileType?.startsWith('image') ? icons.image : icons.default)
        return (
          <a key={a.id} href={a.fileUrl} target="_blank" rel="noreferrer"
            className="flex items-center gap-2 px-3 py-2 rounded-xl text-xs transition-colors hover:opacity-80"
            style={{background:'rgba(91,45,142,0.06)', color:'#5B2D8E', border:'1px solid rgba(91,45,142,0.12)'}}>
            <i className={`fas ${icon}`}/>
            <span className="font-medium max-w-[120px] truncate">{a.fileName}</span>
            {a.fileSize && <span style={{color:'#A3A3A3'}}>{fmtSize(a.fileSize)}</span>}
          </a>
        )
      })}
    </div>
  )
}

// Inline poll component
function ThreadPoll({ poll, threadId }) {
  const { user } = useAuth()
  const qc = useQueryClient()
  const myVote = user ? poll.votes?.find(v => v.userId === user.id) : null
  const totalVotes = poll.votes?.length || 0
  const isExpired = poll.closesAt && new Date(poll.closesAt) < new Date()
  const isActive = poll.isActive && !isExpired

  const voteMut = useMutation(option => api.post(`/forum/polls/${poll.id}/vote`, { option }), {
    onSuccess: () => { toast.success('Vote cast!'); qc.invalidateQueries(['thread', threadId]) },
    onError:   () => toast.error('Could not vote'),
  })

  const getCount = (option) => poll.votes?.filter(v => v.vote === option).length || 0
  const getPct   = (option) => totalVotes ? Math.round((getCount(option) / totalVotes) * 100) : 0

  return (
    <div className="card p-5 mb-6" style={{border:'1px solid rgba(91,45,142,0.12)'}}>
      <div className="flex items-center gap-2 mb-1">
        <i className="fas fa-chart-bar text-sm" style={{color:'#5B2D8E'}}/>
        <span className="text-[10px] font-bold uppercase tracking-widest" style={{color:'#5B2D8E',fontFamily:'Sora,sans-serif'}}>Community Poll</span>
        {!isActive && <span className="text-[9px] px-2 py-0.5 rounded-full" style={{background:'rgba(220,38,38,0.1)',color:'#dc2626'}}>Closed</span>}
      </div>
      <h4 className="font-display font-semibold text-base mb-4" style={{color:'#1A0A35'}}>{poll.title}</h4>
      <div className="space-y-2.5">
        {(poll.options || []).map(option => {
          const pct   = getPct(option)
          const count = getCount(option)
          const voted = myVote?.vote === option
          return (
            <div key={option}>
              <button
                disabled={!!myVote || !isActive || !user || voteMut.isLoading}
                onClick={() => voteMut.mutate(option)}
                className="w-full text-left relative rounded-xl overflow-hidden transition-all"
                style={{
                  border: `1px solid ${voted ? '#5B2D8E' : 'rgba(91,45,142,0.12)'}`,
                  background: voted ? 'rgba(91,45,142,0.06)' : 'rgba(91,45,142,0.02)',
                  cursor: myVote || !isActive || !user ? 'default' : 'pointer',
                }}>
                <div className="absolute inset-y-0 left-0 rounded-xl transition-all"
                  style={{width:`${pct}%`, background: voted ? 'rgba(91,45,142,0.1)' : 'rgba(91,45,142,0.05)'}}/>
                <div className="relative flex items-center justify-between px-4 py-2.5">
                  <div className="flex items-center gap-2">
                    {voted && <i className="fas fa-check-circle text-xs" style={{color:'#5B2D8E'}}/>}
                    <span className="text-sm font-medium" style={{color:'#1A0A35',fontFamily:'Poppins,sans-serif'}}>{option}</span>
                  </div>
                  <div className="text-xs font-semibold" style={{color:'#5B2D8E',fontFamily:'Sora,sans-serif'}}>
                    {myVote || !isActive ? `${pct}% (${count})` : ''}
                  </div>
                </div>
              </button>
            </div>
          )
        })}
      </div>
      <div className="mt-3 text-xs" style={{color:'#A3A3A3',fontFamily:'Poppins,sans-serif'}}>
        {totalVotes} vote{totalVotes!==1?'s':''}{poll.closesAt && ` · Closes ${format(new Date(poll.closesAt),'MMM d, yyyy')}`}
        {!user && isActive && <span> · <Link to="/login" style={{color:'#5B2D8E'}}>Login to vote</Link></span>}
      </div>
    </div>
  )
}

// Create poll form (thread author)
function CreatePollForm({ threadId, onClose }) {
  const qc = useQueryClient()
  const [title, setTitle] = useState('')
  const [options, setOptions] = useState(['', ''])
  const [closesAt, setClosesAt] = useState('')

  const createMut = useMutation(
    d => api.post(`/forum/threads/${threadId}/poll`, d),
    { onSuccess: () => { toast.success('Poll created!'); qc.invalidateQueries(['thread', threadId]); onClose() } }
  )

  const submit = () => {
    const validOpts = options.filter(o => o.trim())
    if (!title.trim()) return toast.error('Poll title required')
    if (validOpts.length < 2) return toast.error('At least 2 options required')
    createMut.mutate({ title, options: validOpts, closes_at: closesAt || null })
  }

  return (
    <div className="card p-5 mb-4" style={{border:'1px solid rgba(91,45,142,0.15)'}}>
      <h4 className="font-display font-semibold text-sm mb-3" style={{color:'#1A0A35'}}>Create a Poll</h4>
      <div className="space-y-3">
        <input value={title} onChange={e=>setTitle(e.target.value)} placeholder="Poll question…" className="input"/>
        <div className="space-y-2">
          {options.map((o, i) => (
            <div key={i} className="flex gap-2">
              <input value={o} onChange={e=>{const n=[...options]; n[i]=e.target.value; setOptions(n)}}
                placeholder={`Option ${i+1}`} className="input flex-1"/>
              {options.length > 2 && (
                <button onClick={()=>setOptions(options.filter((_,j)=>j!==i))}
                  className="w-9 h-9 rounded-xl flex items-center justify-center" style={{color:'#dc2626', background:'rgba(220,38,38,0.06)'}}>
                  <i className="fas fa-times text-xs"/>
                </button>
              )}
            </div>
          ))}
          {options.length < 6 && (
            <button onClick={()=>setOptions([...options,''])}
              className="text-xs font-semibold" style={{color:'#5B2D8E',fontFamily:'Sora,sans-serif'}}>
              <i className="fas fa-plus mr-1"/>Add Option
            </button>
          )}
        </div>
        <div>
          <label className="label text-xs">Close Date <span style={{color:'#A3A3A3'}}>(optional)</span></label>
          <input type="datetime-local" value={closesAt} onChange={e=>setClosesAt(e.target.value)} className="input"/>
        </div>
        <div className="flex gap-3">
          <button onClick={submit} disabled={createMut.isLoading} className="btn-secondary !py-2 !px-4 !text-xs">
            {createMut.isLoading ? 'Creating…' : 'Create Poll'}
          </button>
          <button onClick={onClose} className="text-xs" style={{color:'#A3A3A3'}}>Cancel</button>
        </div>
      </div>
    </div>
  )
}

function ReplyCard({ reply, onLike, onReply, threadAuthorId, depth = 0 }) {
  const { user } = useAuth()
  const badge = ROLE_BADGE[reply.author_role]
  const ts = reply.createdAt || reply.created_at
  return (
    <div className={`flex gap-4 ${depth > 0 ? 'ml-12 pl-4 border-l-2' : ''}`}
      style={{ borderColor: depth > 0 ? 'rgba(91,45,142,0.12)' : undefined }}>
      <div className="w-10 h-10 rounded-full flex items-center justify-center text-white text-sm font-bold flex-shrink-0 mt-0.5"
        style={{ background: 'linear-gradient(135deg,#5B2D8E,#7B4DB8)', minWidth: 40 }}>
        {reply.author_name?.[0]?.toUpperCase() || '?'}
      </div>
      <div className="flex-1">
        <div className="card p-4">
          <div className="flex items-center gap-2 mb-3 flex-wrap">
            <span className="font-display font-semibold text-sm" style={{ color: '#1A0A35' }}>{reply.author_name}</span>
            {badge && <span className="text-[9px] font-bold uppercase tracking-widest px-2 py-0.5 rounded-full" style={{ background: badge.bg, color: badge.color }}>{badge.label}</span>}
            {reply.authorId === threadAuthorId && <span className="text-[9px] font-bold uppercase tracking-widest px-2 py-0.5 rounded-full" style={{ background: 'rgba(16,185,129,0.1)', color: '#059669' }}>OP</span>}
            {reply.isSolution && <span className="text-[9px] font-bold uppercase tracking-widest px-2 py-0.5 rounded-full" style={{ background: 'rgba(22,163,74,0.12)', color: '#16a34a' }}><i className="fas fa-check mr-1"/>Solution</span>}
            {ts && <span className="text-xs ml-auto" style={{ color: '#A3A3A3', fontFamily: 'Poppins,sans-serif' }}>{formatDistanceToNow(new Date(ts))} ago</span>}
          </div>
          <p className="text-sm leading-relaxed whitespace-pre-line" style={{ color: '#525252', fontFamily: 'Poppins,sans-serif' }}>
            <MentionText text={reply.content}/>
          </p>
          <AttachmentList attachments={reply.attachments}/>
        </div>
        <div className="flex items-center gap-4 mt-2 ml-1">
          <button onClick={() => onLike(reply.id)}
            className="flex items-center gap-1.5 text-xs font-medium transition-colors hover:text-primary-500"
            style={{ color: '#A3A3A3', fontFamily: 'Poppins,sans-serif' }}>
            <i className="fas fa-thumbs-up text-[10px]"/>{reply.like_count || 0}
          </button>
          {user && depth === 0 && (
            <button onClick={() => onReply(reply.id, reply.author_name)}
              className="flex items-center gap-1.5 text-xs font-medium transition-colors hover:text-primary-500"
              style={{ color: '#A3A3A3', fontFamily: 'Poppins,sans-serif' }}>
              <i className="fas fa-reply text-[10px]"/>Reply
            </button>
          )}
          {ts && <span className="text-xs" style={{ color: '#D4D4D4', fontFamily: 'Poppins,sans-serif' }}>{format(new Date(ts), 'MMM d, yyyy')}</span>}
        </div>
      </div>
    </div>
  )
}

export default function ForumThread() {
  const { id }   = useParams()
  const { user } = useAuth()
  const qc       = useQueryClient()

  const [replyTo, setReplyTo]   = useState(null)
  const [pendingFiles, setPendingFiles] = useState([])
  const [uploading, setUploading]       = useState(false)
  const [showPollForm, setShowPollForm] = useState(false)
  const fileInputRef = useRef()

  const { register, handleSubmit, reset, formState: { errors } } = useForm()

  const { data: thread, isLoading } = useQuery(['thread', id],
    () => api.get(`/forum/threads/${id}`).then(r => r.data))

  const replyMut = useMutation(
    data => api.post(`/forum/threads/${id}/replies`, data),
    {
      onSuccess: () => {
        toast.success('Reply posted!')
        reset()
        setReplyTo(null)
        setPendingFiles([])
        qc.invalidateQueries(['thread', id])
      },
    }
  )
  const likeMut = useMutation(
    rid => api.post(`/forum/replies/${rid}/like`),
    { onSuccess: () => qc.invalidateQueries(['thread', id]) }
  )
  const subMut = useMutation(
    () => thread?.is_subscribed
      ? api.delete(`/forum/threads/${id}/subscribe`)
      : api.post(`/forum/threads/${id}/subscribe`),
    { onSuccess: () => qc.invalidateQueries(['thread', id]) }
  )

  // Upload a file and get back its URL
  const handleFileAdd = async (e) => {
    const file = e.target.files?.[0]
    if (!file) return
    if (file.size > 10 * 1024 * 1024) return toast.error('Max file size 10 MB')
    setUploading(true)
    try {
      const fd = new FormData()
      fd.append('file', file)
      const { data } = await api.post('/upload', fd, { headers: { 'Content-Type': 'multipart/form-data' } })
      setPendingFiles(prev => [...prev, { url: data.url, name: file.name, size: file.size, type: file.type }])
    } catch {
      toast.error('Upload failed')
    } finally {
      setUploading(false)
      e.target.value = ''
    }
  }

  const onSubmit = (data) => {
    if (!user) return toast.error('Login to reply')
    replyMut.mutate({
      content:         data.content,
      parent_id:       replyTo?.id || null,
      attachment_urls: pendingFiles,
    })
  }

  if (isLoading) return (
    <div className="max-w-3xl mx-auto px-6 py-16 space-y-4">
      {[1, 2, 3].map(i => <div key={i} className="h-20 rounded-3xl animate-pulse" style={{ background: 'rgba(91,45,142,0.04)' }}/>)}
    </div>
  )
  if (!thread) return (
    <div className="text-center py-24">
      <i className="fas fa-comments text-4xl mb-4 block" style={{ color: 'rgba(91,45,142,0.15)' }}/>
      <Link to="/forum" className="btn-secondary !text-sm !py-2.5 !px-6">Back to Forum</Link>
    </div>
  )

  const topReplies    = thread.replies?.filter(r => !r.parentId && !r.parent_id) || []
  const nestedReplies = thread.replies?.filter(r => r.parentId  || r.parent_id)  || []
  const canCreatePoll = user && (user.id === thread.authorId || user.role === 'admin') && !thread.poll

  return (
    <div>
      {/* Mini hero */}
      <div className="page-hero py-14 px-6">
        <div className="max-w-3xl mx-auto">
          <div className="flex items-center gap-2 text-xs mb-4" style={{ color: 'rgba(255,255,255,0.5)', fontFamily: 'Poppins,sans-serif' }}>
            <Link to="/forum" className="hover:text-white transition-colors">Forum</Link>
            <i className="fas fa-chevron-right text-[8px]" style={{ color: '#F0A500' }}/>
            <span style={{ color: '#F0A500' }} className="truncate">{thread.category_name}</span>
          </div>
          <h1 className="font-display font-bold text-2xl md:text-3xl text-white leading-tight">{thread.title}</h1>
          <div className="flex items-center gap-3 mt-3 flex-wrap text-xs" style={{ color: 'rgba(255,255,255,0.55)', fontFamily: 'Poppins,sans-serif' }}>
            <span>{thread.author_name}</span>
            <span>·</span>
            <span>{format(new Date(thread.createdAt || thread.created_at), 'MMM d, yyyy')}</span>
            <span>·</span>
            <span>{thread.viewCount || thread.view_count || 0} views</span>
            <span>·</span>
            <span>{thread.replyCount || thread.reply_count || 0} replies</span>
            {/* Subscribe toggle */}
            {user && (
              <button onClick={() => subMut.mutate()}
                className="ml-auto flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-full transition-all"
                style={{
                  background: thread.is_subscribed ? 'rgba(240,165,0,0.2)' : 'rgba(255,255,255,0.1)',
                  color: thread.is_subscribed ? '#F0A500' : 'rgba(255,255,255,0.7)',
                }}>
                <i className={`fas ${thread.is_subscribed ? 'fa-bell' : 'fa-bell-slash'} text-[10px]`}/>
                {thread.is_subscribed ? 'Subscribed' : 'Subscribe'}
              </button>
            )}
          </div>
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-6 py-10 space-y-6">

        {/* Original post */}
        <div className="card p-6">
          <div className="flex items-start gap-4 mb-4">
            <div className="w-12 h-12 rounded-full flex items-center justify-center text-white font-bold flex-shrink-0"
              style={{ background: 'linear-gradient(135deg,#5B2D8E,#7B4DB8)' }}>
              {thread.author_name?.[0]?.toUpperCase() || '?'}
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="font-display font-semibold" style={{ color: '#1A0A35' }}>{thread.author_name}</span>
                {thread.author_role && ROLE_BADGE[thread.author_role] && (
                  <span className="text-[9px] font-bold uppercase tracking-widest px-2 py-0.5 rounded-full"
                    style={{ background: ROLE_BADGE[thread.author_role].bg, color: ROLE_BADGE[thread.author_role].color }}>
                    {ROLE_BADGE[thread.author_role].label}
                  </span>
                )}
                <span className="text-xs ml-auto" style={{ color: '#A3A3A3', fontFamily: 'Poppins,sans-serif' }}>
                  {format(new Date(thread.createdAt || thread.created_at), 'MMMM d, yyyy')}
                </span>
              </div>
            </div>
          </div>
          <div className="text-sm leading-relaxed whitespace-pre-line" style={{ color: '#404040', fontFamily: 'Poppins,sans-serif' }}>
            <MentionText text={thread.content}/>
          </div>
          <AttachmentList attachments={thread.attachments}/>
        </div>

        {/* Poll */}
        {thread.poll && <ThreadPoll poll={thread.poll} threadId={id}/>}

        {/* Add poll CTA for thread author */}
        {canCreatePoll && !showPollForm && (
          <button onClick={() => setShowPollForm(true)}
            className="flex items-center gap-2 text-sm font-semibold px-4 py-2.5 rounded-xl transition-colors"
            style={{ background: 'rgba(91,45,142,0.06)', color: '#5B2D8E', border: '1px dashed rgba(91,45,142,0.2)' }}>
            <i className="fas fa-chart-bar text-xs"/>Add a Poll to this thread
          </button>
        )}
        {showPollForm && <CreatePollForm threadId={id} onClose={() => setShowPollForm(false)}/>}

        {/* Replies */}
        <div>
          <h3 className="font-display font-bold text-lg mb-4 flex items-center gap-2" style={{ color: '#1A0A35' }}>
            <i className="fas fa-comments text-sm" style={{ color: '#5B2D8E' }}/>
            {thread.replyCount || thread.reply_count || 0} {(thread.replyCount || thread.reply_count || 0) === 1 ? 'Reply' : 'Replies'}
          </h3>
          <div className="space-y-5">
            {topReplies.map(reply => (
              <div key={reply.id}>
                <ReplyCard reply={reply} threadAuthorId={thread.authorId}
                  onLike={rid => user ? likeMut.mutate(rid) : toast.error('Login to like')}
                  onReply={(rid, name) => setReplyTo({ id: rid, name })}/>
                {nestedReplies.filter(r => (r.parentId || r.parent_id) === reply.id).map(nested => (
                  <div key={nested.id} className="mt-3">
                    <ReplyCard reply={nested} threadAuthorId={thread.authorId}
                      onLike={rid => user ? likeMut.mutate(rid) : toast.error('Login to like')}
                      onReply={() => {}} depth={1}/>
                  </div>
                ))}
              </div>
            ))}
            {topReplies.length === 0 && (
              <div className="text-center py-10 rounded-3xl" style={{ background: 'rgba(91,45,142,0.03)', border: '1px dashed rgba(91,45,142,0.12)' }}>
                <i className="fas fa-comment text-3xl mb-3 block" style={{ color: 'rgba(91,45,142,0.15)' }}/>
                <p className="text-sm" style={{ color: '#737373', fontFamily: 'Poppins,sans-serif' }}>No replies yet. Be the first to respond!</p>
              </div>
            )}
          </div>
        </div>

        {/* Reply form */}
        {user ? (
          <div className="card p-6">
            <h3 className="font-display font-semibold text-base mb-4" style={{ color: '#1A0A35' }}>
              {replyTo ? (
                <span className="flex items-center gap-2">
                  <i className="fas fa-reply text-sm" style={{ color: '#5B2D8E' }}/>
                  Replying to <span style={{ color: '#5B2D8E' }}>{replyTo.name}</span>
                  <button onClick={() => setReplyTo(null)} className="ml-2 text-xs" style={{ color: '#A3A3A3' }}>
                    <i className="fas fa-times"/>
                  </button>
                </span>
              ) : 'Post a Reply'}
            </h3>

            {/* @mention hint */}
            <p className="text-xs mb-3" style={{ color: '#A3A3A3', fontFamily: 'Poppins,sans-serif' }}>
              Tip: Use <span className="font-semibold" style={{ color: '#5B2D8E' }}>@firstname.lastname</span> to mention someone and notify them.
            </p>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <div>
                <textarea
                  {...register('content', { required: 'Reply cannot be empty', minLength: { value: 5, message: 'Too short' } })}
                  rows={4} placeholder="Write your reply…" className="input resize-none"/>
                {errors.content && <p className="text-xs mt-1" style={{ color: '#dc2626' }}>{errors.content.message}</p>}
              </div>

              {/* Attachment area */}
              <div>
                <div className="flex items-center gap-3 flex-wrap">
                  <button type="button"
                    onClick={() => fileInputRef.current?.click()}
                    disabled={uploading}
                    className="flex items-center gap-2 text-xs font-semibold px-3 py-2 rounded-xl transition-colors"
                    style={{ background: 'rgba(91,45,142,0.06)', color: '#5B2D8E', border: '1px solid rgba(91,45,142,0.12)' }}>
                    {uploading
                      ? <><i className="fas fa-spinner animate-spin"/>Uploading…</>
                      : <><i className="fas fa-paperclip"/>Attach File</>}
                  </button>
                  <input ref={fileInputRef} type="file" className="hidden" accept="*/*" onChange={handleFileAdd}/>
                  <span className="text-xs" style={{ color: '#A3A3A3', fontFamily: 'Poppins,sans-serif' }}>Max 10 MB</span>
                </div>
                {pendingFiles.length > 0 && (
                  <div className="mt-2 flex flex-wrap gap-2">
                    {pendingFiles.map((f, i) => (
                      <div key={i} className="flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs"
                        style={{ background: 'rgba(91,45,142,0.06)', color: '#5B2D8E' }}>
                        <i className="fas fa-paperclip text-[10px]"/>
                        <span className="max-w-[100px] truncate">{f.name}</span>
                        <button type="button" onClick={() => setPendingFiles(prev => prev.filter((_, j) => j !== i))}
                          className="text-red-400 hover:text-red-600"><i className="fas fa-times"/></button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="flex items-center justify-between">
                <p className="text-xs" style={{ color: '#A3A3A3', fontFamily: 'Poppins,sans-serif' }}>Be respectful and constructive.</p>
                <button type="submit" disabled={replyMut.isLoading || uploading} className="btn-secondary !py-2.5 !px-5 !text-sm">
                  {replyMut.isLoading
                    ? <><i className="fas fa-spinner animate-spin"/>Posting…</>
                    : <><i className="fas fa-paper-plane"/>Post Reply</>}
                </button>
              </div>
            </form>
          </div>
        ) : (
          <div className="card p-8 text-center">
            <i className="fas fa-lock text-3xl mb-3 block" style={{ color: 'rgba(91,45,142,0.2)' }}/>
            <p className="text-sm mb-4" style={{ color: '#737373', fontFamily: 'Poppins,sans-serif' }}>Login to join the discussion</p>
            <Link to="/login" className="btn-secondary !text-sm !py-2.5 !px-6">
              <i className="fas fa-sign-in-alt"/>Login to Reply
            </Link>
          </div>
        )}
      </div>
    </div>
  )
}
