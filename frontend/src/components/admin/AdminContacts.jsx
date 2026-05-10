import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from 'react-query'
import { format } from 'date-fns'
import toast from 'react-hot-toast'
import api from '../../services/api'

function StatusBadge({ status }) {
  const map = { unread:'#dc2626', read:'#0284c7', replied:'#16a34a', archived:'#737373' }
  const c = map[status]||'#737373'
  return <span className="text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full" style={{background:`${c}12`,color:c}}>{status}</span>
}

export default function AdminContacts() {
  const qc = useQueryClient()
  const [selected,  setSelected]  = useState(null)
  const [statusF,   setStatusF]   = useState('all')
  const [replyNote, setReplyNote] = useState('')
  const [search,    setSearch]    = useState('')

  const { data, isLoading } = useQuery(
    ['admin-contacts', statusF],
    () => api.get(`/contact${statusF !== 'all' ? `?status=${statusF}` : ''}`).then(r => r.data)
  )

  const updateMut = useMutation(
    ({ id, status, reply_note }) => api.patch(`/contact/${id}`, { status, reply_note }),
    { onSuccess: () => { qc.invalidateQueries('admin-contacts'); toast.success('Message updated') } }
  )
  const deleteMut = useMutation(
    id => api.delete(`/contact/${id}`),
    { onSuccess: () => { qc.invalidateQueries('admin-contacts'); setSelected(null); toast.success('Message deleted') } }
  )

  const markRead = (msg) => {
    if (msg.status === 'unread') updateMut.mutate({ id: msg.id, status: 'read' })
    setSelected(msg)
    setReplyNote(msg.reply_note || '')
  }

  const filtered = data?.filter(m => {
    const s = search.toLowerCase()
    return !search || m.name?.toLowerCase().includes(s) || m.email?.toLowerCase().includes(s) || m.subject?.toLowerCase().includes(s)
  })

  const counts = {
    all: data?.length || 0,
    unread: data?.filter(m => m.status === 'unread').length || 0,
    read: data?.filter(m => m.status === 'read').length || 0,
    replied: data?.filter(m => m.status === 'replied').length || 0,
    archived: data?.filter(m => m.status === 'archived').length || 0,
  }

  return (
    <div>
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl flex items-center justify-center" style={{background:'linear-gradient(135deg,#5B2D8E,#7B4DB8)'}}>
            <i className="fas fa-envelope text-sm text-white"/>
          </div>
          <div>
            <h2 className="font-display font-bold text-xl" style={{color:'#1A0A35'}}>Contact Messages</h2>
            <p className="text-xs" style={{color:'#A3A3A3',fontFamily:'Poppins,sans-serif'}}>
              {counts.unread > 0 && <span className="font-bold" style={{color:'#dc2626'}}>{counts.unread} unread · </span>}
              {counts.all} total messages
            </p>
          </div>
        </div>
      </div>

      {/* Status filter tabs */}
      <div className="flex gap-2 mb-5 flex-wrap">
        {['all','unread','read','replied','archived'].map(s => (
          <button key={s} onClick={() => setStatusF(s)}
            className="px-4 py-2 rounded-full text-xs font-semibold transition-all capitalize flex items-center gap-1.5"
            style={{
              background: statusF === s ? 'linear-gradient(135deg,#5B2D8E,#7B4DB8)' : '#fff',
              color: statusF === s ? '#fff' : '#5B2D8E',
              boxShadow: '0 1px 6px rgba(91,45,142,0.1)',
              fontFamily: 'Sora,sans-serif',
            }}>
            {s === 'all' ? 'All' : s}
            {counts[s] > 0 && (
              <span className="text-[9px] font-bold px-1.5 py-0.5 rounded-full"
                style={{background: statusF === s ? 'rgba(255,255,255,0.25)' : 'rgba(91,45,142,0.1)', color: statusF === s ? '#fff' : '#5B2D8E'}}>
                {counts[s]}
              </span>
            )}
          </button>
        ))}
      </div>

      <div className="grid lg:grid-cols-5 gap-5">
        {/* Message list */}
        <div className="lg:col-span-2 space-y-3">
          {/* Search */}
          <div className="relative">
            <i className="fas fa-search absolute left-3.5 top-1/2 -translate-y-1/2 text-xs" style={{color:'#A3A3A3'}}/>
            <input value={search} onChange={e => setSearch(e.target.value)}
              placeholder="Search messages…" className="input !pl-10 !py-2.5 !text-sm"/>
          </div>

          {isLoading ? (
            [1,2,3,4].map(i => <div key={i} className="h-20 rounded-2xl animate-pulse" style={{background:'rgba(91,45,142,0.04)'}}/>)
          ) : filtered?.length ? (
            filtered.map(msg => (
              <div key={msg.id}
                onClick={() => markRead(msg)}
                className={`rounded-2xl p-4 cursor-pointer transition-all border ${selected?.id === msg.id ? 'border-primary-500' : 'border-transparent'}`}
                style={{
                  background: msg.status === 'unread' ? 'rgba(91,45,142,0.04)' : '#fff',
                  boxShadow: selected?.id === msg.id ? '0 0 0 2px rgba(91,45,142,0.2)' : '0 2px 12px rgba(91,45,142,0.06)',
                }}>
                <div className="flex items-start justify-between gap-2 mb-1">
                  <div className="flex items-center gap-2">
                    {msg.status === 'unread' && <div className="w-2 h-2 rounded-full flex-shrink-0" style={{background:'#dc2626'}}/>}
                    <span className="font-display font-semibold text-sm truncate" style={{color:'#1A0A35'}}>{msg.name}</span>
                  </div>
                  <span className="text-[10px] flex-shrink-0" style={{color:'#A3A3A3',fontFamily:'Poppins,sans-serif'}}>{msg.createdAt ? format(new Date(msg.createdAt),'MMM d') : '—'}</span>
                </div>
                <div className="text-xs mb-1 font-medium truncate" style={{color:'#5B2D8E',fontFamily:'Poppins,sans-serif'}}>{msg.subject || 'No subject'}</div>
                <p className="text-xs line-clamp-2" style={{color:'#737373',fontFamily:'Poppins,sans-serif'}}>{msg.message}</p>
                <div className="flex items-center justify-between mt-2">
                  <span className="text-[10px]" style={{color:'#A3A3A3',fontFamily:'Poppins,sans-serif'}}>{msg.email}</span>
                  <StatusBadge status={msg.status}/>
                </div>
              </div>
            ))
          ) : (
            <div className="text-center py-12 rounded-2xl" style={{background:'rgba(91,45,142,0.02)',border:'1px dashed rgba(91,45,142,0.1)'}}>
              <i className="fas fa-envelope-open text-3xl mb-2 block" style={{color:'rgba(91,45,142,0.2)'}}/>
              <p className="text-sm" style={{color:'#A3A3A3',fontFamily:'Poppins,sans-serif'}}>No messages found</p>
            </div>
          )}
        </div>

        {/* Message detail */}
        <div className="lg:col-span-3">
          {selected ? (
            <div className="card p-6 space-y-5">
              {/* Sender info */}
              <div className="flex items-start justify-between">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-2xl flex items-center justify-center text-white font-bold text-lg flex-shrink-0"
                    style={{background:'linear-gradient(135deg,#5B2D8E,#7B4DB8)'}}>
                    {selected.name?.[0]?.toUpperCase()}
                  </div>
                  <div>
                    <h3 className="font-display font-bold text-lg" style={{color:'#1A0A35'}}>{selected.name}</h3>
                    <div className="flex flex-wrap gap-3 text-xs mt-0.5" style={{color:'#737373',fontFamily:'Poppins,sans-serif'}}>
                      <a href={`mailto:${selected.email}`} className="flex items-center gap-1 hover:underline" style={{color:'#5B2D8E'}}>
                        <i className="fas fa-envelope text-[10px]"/>{selected.email}
                      </a>
                      {selected.phone && <span className="flex items-center gap-1"><i className="fas fa-phone text-[10px]"/>{selected.phone}</span>}
                    </div>
                    <div className="flex items-center gap-2 mt-1.5 flex-wrap">
                      <StatusBadge status={selected.status}/>
                      <span className="text-[10px]" style={{color:'#A3A3A3',fontFamily:'Poppins,sans-serif'}}>{selected.createdAt ? format(new Date(selected.createdAt),'MMMM d, yyyy · h:mm a') : '—'}</span>
                    </div>
                  </div>
                </div>
                {/* Actions */}
                <div className="flex gap-2 flex-shrink-0">
                  <a href={`mailto:${selected.email}?subject=Re: ${selected.subject||'Your enquiry'}`}
                    className="flex items-center gap-1.5 text-xs font-semibold px-3 py-2 rounded-xl transition-all"
                    style={{color:'#5B2D8E',background:'rgba(91,45,142,0.08)',fontFamily:'Sora,sans-serif'}}>
                    <i className="fas fa-reply text-[10px]"/>Reply via Email
                  </a>
                  <button onClick={() => { if (confirm('Delete this message?')) deleteMut.mutate(selected.id) }}
                    className="flex items-center gap-1.5 text-xs font-semibold px-3 py-2 rounded-xl transition-all"
                    style={{color:'#dc2626',background:'rgba(220,38,38,0.08)',fontFamily:'Sora,sans-serif'}}>
                    <i className="fas fa-trash text-[10px]"/>Delete
                  </button>
                </div>
              </div>

              {/* Subject */}
              {selected.subject && (
                <div className="px-4 py-3 rounded-2xl" style={{background:'rgba(91,45,142,0.04)',border:'1px solid rgba(91,45,142,0.08)'}}>
                  <span className="text-xs font-semibold uppercase tracking-wider mr-2" style={{color:'#5B2D8E',fontFamily:'Sora,sans-serif'}}>Subject:</span>
                  <span className="text-sm font-medium" style={{color:'#1A0A35',fontFamily:'Poppins,sans-serif'}}>{selected.subject}</span>
                </div>
              )}

              {/* Message body */}
              <div className="rounded-2xl p-5" style={{background:'#FAFAFA',border:'1px solid rgba(91,45,142,0.06)'}}>
                <label className="label mb-2 block">Message</label>
                <p className="text-sm leading-relaxed whitespace-pre-line" style={{color:'#404040',fontFamily:'Poppins,sans-serif'}}>{selected.message}</p>
              </div>

              {/* Previous reply note */}
              {selected.reply_note && (
                <div className="rounded-2xl p-4" style={{background:'rgba(22,163,74,0.04)',border:'1px solid rgba(22,163,74,0.12)'}}>
                  <div className="flex items-center gap-2 mb-2">
                    <i className="fas fa-check-circle text-xs" style={{color:'#16a34a'}}/>
                    <span className="text-xs font-semibold" style={{color:'#16a34a',fontFamily:'Sora,sans-serif'}}>Previous reply note</span>
                  </div>
                  <p className="text-sm" style={{color:'#525252',fontFamily:'Poppins,sans-serif'}}>{selected.reply_note}</p>
                </div>
              )}

              {/* Internal reply note + status change */}
              <div className="rounded-2xl p-5" style={{background:'rgba(91,45,142,0.02)',border:'1px solid rgba(91,45,142,0.08)'}}>
                <label className="label mb-2 block">Internal Note (optional)</label>
                <textarea value={replyNote} onChange={e => setReplyNote(e.target.value)}
                  rows={3} className="input resize-none mb-4"
                  placeholder="Add an internal note about this message (not sent to sender)…"/>

                <div className="flex flex-wrap gap-2">
                  {['read','replied','archived'].map(s => (
                    <button key={s} onClick={() => updateMut.mutate({ id: selected.id, status: s, reply_note: replyNote })}
                      disabled={selected.status === s || updateMut.isLoading}
                      className="flex items-center gap-1.5 text-xs font-semibold px-4 py-2 rounded-xl transition-all capitalize disabled:opacity-40"
                      style={{
                        background: s === 'replied' ? 'linear-gradient(135deg,#5B2D8E,#7B4DB8)' : s === 'archived' ? 'rgba(115,115,115,0.1)' : 'rgba(2,132,199,0.1)',
                        color: s === 'replied' ? '#fff' : s === 'archived' ? '#737373' : '#0284c7',
                        fontFamily: 'Sora,sans-serif',
                      }}>
                      <i className={`fas ${s === 'replied' ? 'fa-check' : s === 'archived' ? 'fa-archive' : 'fa-eye'} text-[10px]`}/>
                      Mark as {s}
                    </button>
                  ))}
                  {replyNote && (
                    <button onClick={() => updateMut.mutate({ id: selected.id, reply_note: replyNote })}
                      disabled={updateMut.isLoading}
                      className="flex items-center gap-1.5 text-xs font-semibold px-4 py-2 rounded-xl"
                      style={{background:'rgba(240,165,0,0.1)',color:'#C87800',fontFamily:'Sora,sans-serif'}}>
                      <i className="fas fa-save text-[10px]"/>Save Note
                    </button>
                  )}
                </div>
              </div>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center h-full min-h-[400px] rounded-3xl"
              style={{background:'rgba(91,45,142,0.02)',border:'1px dashed rgba(91,45,142,0.1)'}}>
              <i className="fas fa-envelope-open text-5xl mb-4" style={{color:'rgba(91,45,142,0.15)'}}/>
              <h3 className="font-display font-semibold" style={{color:'#737373'}}>Select a message to read</h3>
              <p className="text-sm mt-1" style={{color:'#A3A3A3',fontFamily:'Poppins,sans-serif'}}>Click any message from the list on the left</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
