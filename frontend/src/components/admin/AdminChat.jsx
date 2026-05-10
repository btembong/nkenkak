import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from 'react-query'
import { useForm } from 'react-hook-form'
import { format } from 'date-fns'
import toast from 'react-hot-toast'
import api from '../../services/api'

const ROOM_COLORS = ['#5B2D8E','#F0A500','#16a34a','#0284c7','#dc2626','#7B4DB8']
const ROOM_ICONS  = ['fa-comments','fa-globe-africa','fa-users','fa-graduation-cap','fa-hands-helping','fa-music','fa-seedling','fa-heart']

function RoomForm({ room, onClose }) {
  const qc = useQueryClient()
  const isEdit = !!room
  const { register, handleSubmit, formState: { errors } } = useForm({
    defaultValues: room || { color: '#5B2D8E', icon: 'fa-comments', isPublic: true }
  })
  const mut = useMutation(
    d => isEdit ? api.patch(`/chat/rooms/${room.id}`, d) : api.post('/chat/rooms', d),
    {
      onSuccess: () => { qc.invalidateQueries('admin-chat-rooms'); toast.success(isEdit ? 'Room updated!' : 'Room created!'); onClose() },
      onError: e => toast.error(e.response?.data?.error || 'Failed'),
    }
  )
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: 'rgba(26,10,53,0.8)', backdropFilter: 'blur(8px)' }}
      onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="bg-white rounded-3xl w-full max-w-md"
        style={{ boxShadow: '0 32px 80px rgba(26,10,53,0.25)' }}>
        <div className="px-7 pt-6 pb-4 border-b" style={{ borderColor: 'rgba(91,45,142,0.08)' }}>
          <div className="flex items-center justify-between">
            <h3 className="font-display font-bold text-xl" style={{ color: '#1A0A35' }}>
              {isEdit ? 'Edit Room' : 'New Chat Room'}
            </h3>
            <button onClick={onClose} className="w-9 h-9 rounded-full flex items-center justify-center hover:bg-gray-100"
              style={{ color: '#A3A3A3' }}><i className="fas fa-times"/></button>
          </div>
        </div>
        <form onSubmit={handleSubmit(d => mut.mutate(d))} className="p-7 space-y-4">
          <div>
            <label className="label">Room Name *</label>
            <input {...register('name', { required: 'Required' })} className="input" placeholder="e.g. General Discussion"/>
            {errors.name && <p className="text-xs mt-1 text-red-500">{errors.name.message}</p>}
          </div>
          <div>
            <label className="label">Slug *</label>
            <input {...register('slug', { required: 'Required' })} className="input" placeholder="general-discussion"/>
            {errors.slug && <p className="text-xs mt-1 text-red-500">{errors.slug.message}</p>}
          </div>
          <div>
            <label className="label">Description</label>
            <input {...register('description')} className="input" placeholder="Brief description…"/>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="label">Color</label>
              <select {...register('color')} className="input">
                {ROOM_COLORS.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
            <div>
              <label className="label">Icon</label>
              <select {...register('icon')} className="input">
                {ROOM_ICONS.map(ic => <option key={ic} value={ic}>{ic.replace('fa-','')}</option>)}
              </select>
            </div>
          </div>
          <label className="flex items-center gap-2 text-sm cursor-pointer" style={{ fontFamily: 'Poppins,sans-serif' }}>
            <input type="checkbox" {...register('isPublic')} className="w-4 h-4 rounded accent-primary-500"/>
            Public room (visible to all, including guests)
          </label>
          <div className="flex gap-3 pt-2">
            <button type="button" onClick={onClose}
              className="flex-1 py-3 rounded-2xl text-sm font-semibold"
              style={{ background: 'rgba(91,45,142,0.05)', color: '#737373', border: '1px solid rgba(91,45,142,0.1)' }}>
              Cancel
            </button>
            <button type="submit" disabled={mut.isLoading} className="btn-secondary flex-1 justify-center">
              {mut.isLoading ? <><i className="fas fa-spinner animate-spin"/>Saving…</> : <><i className="fas fa-save"/>Save Room</>}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default function AdminChat() {
  const qc = useQueryClient()
  const [showForm, setShowForm] = useState(false)
  const [editing, setEditing] = useState(null)
  const [activeRoom, setActiveRoom] = useState(null)

  const { data: rooms = [], isLoading } = useQuery(
    'admin-chat-rooms',
    () => api.get('/chat/rooms').then(r => r.data)
  )

  const { data: messages = [] } = useQuery(
    ['admin-chat-messages', activeRoom?.slug],
    () => api.get(`/chat/rooms/${activeRoom.slug}/messages`).then(r => r.data.messages),
    { enabled: !!activeRoom }
  )

  const deleteRoomMut = useMutation(id => api.delete(`/chat/rooms/${id}`), {
    onSuccess: () => { qc.invalidateQueries('admin-chat-rooms'); toast.success('Room deleted'); setActiveRoom(null) },
  })

  const deleteMsgMut = useMutation(id => api.delete(`/chat/messages/${id}`), {
    onSuccess: () => qc.invalidateQueries(['admin-chat-messages', activeRoom?.slug]),
  })

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="font-display font-bold text-2xl" style={{ color: '#1A0A35' }}>Chat Rooms</h2>
          <p className="text-sm mt-0.5" style={{ color: '#737373', fontFamily: 'Poppins,sans-serif' }}>Manage community chat rooms and moderate messages</p>
        </div>
        <button onClick={() => { setEditing(null); setShowForm(true) }} className="btn-secondary">
          <i className="fas fa-plus"/>New Room
        </button>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Room list */}
        <div className="lg:col-span-1 space-y-2">
          <div className="text-xs font-bold uppercase tracking-widest mb-3" style={{ color: '#A3A3A3', fontFamily: 'Sora,sans-serif' }}>Rooms ({rooms.length})</div>
          {isLoading ? (
            <div className="space-y-2">{[1,2,3].map(i => <div key={i} className="h-16 rounded-2xl animate-pulse" style={{ background: 'rgba(91,45,142,0.05)' }}/>)}</div>
          ) : !rooms.length ? (
            <div className="text-center py-10 rounded-2xl" style={{ background: 'rgba(91,45,142,0.02)', border: '1px dashed rgba(91,45,142,0.12)' }}>
              <p className="text-xs" style={{ color: '#A3A3A3' }}>No rooms yet</p>
            </div>
          ) : (
            rooms.map(room => (
              <div key={room.id}
                className="flex items-center gap-3 px-4 py-3 rounded-2xl cursor-pointer transition-all"
                style={{ background: activeRoom?.id === room.id ? room.color + '18' : '#fff', border: `1px solid ${activeRoom?.id === room.id ? room.color + '40' : 'rgba(91,45,142,0.06)'}`, boxShadow: '0 1px 8px rgba(91,45,142,0.04)' }}
                onClick={() => setActiveRoom(room)}>
                <div className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0"
                  style={{ background: room.color + '18' }}>
                  <i className={`fas ${room.icon || 'fa-comments'} text-sm`} style={{ color: room.color }}/>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="font-semibold text-sm truncate" style={{ color: '#1A0A35', fontFamily: 'Sora,sans-serif' }}>{room.name}</div>
                  <div className="text-xs" style={{ color: '#A3A3A3', fontFamily: 'Poppins,sans-serif' }}>{room._count?.messages || 0} messages</div>
                </div>
                <div className="flex gap-1">
                  <button onClick={e => { e.stopPropagation(); setEditing(room); setShowForm(true) }}
                    className="w-7 h-7 rounded-lg flex items-center justify-center"
                    style={{ background: 'rgba(91,45,142,0.08)', color: '#5B2D8E' }}>
                    <i className="fas fa-edit text-[10px]"/>
                  </button>
                  <button onClick={e => { e.stopPropagation(); if (confirm('Delete room?')) deleteRoomMut.mutate(room.id) }}
                    className="w-7 h-7 rounded-lg flex items-center justify-center"
                    style={{ background: 'rgba(220,38,38,0.08)', color: '#dc2626' }}>
                    <i className="fas fa-trash text-[10px]"/>
                  </button>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Messages panel */}
        <div className="lg:col-span-2 rounded-3xl overflow-hidden"
          style={{ background: '#fff', boxShadow: '0 2px 16px rgba(91,45,142,0.06)', minHeight: '400px' }}>
          {!activeRoom ? (
            <div className="h-full flex flex-col items-center justify-center gap-3 p-10">
              <i className="fas fa-comments text-5xl" style={{ color: 'rgba(91,45,142,0.15)' }}/>
              <p className="text-sm" style={{ color: '#A3A3A3', fontFamily: 'Poppins,sans-serif' }}>Select a room to view messages</p>
            </div>
          ) : (
            <>
              <div className="flex items-center gap-3 px-5 py-4 border-b" style={{ borderColor: 'rgba(91,45,142,0.06)' }}>
                <div className="w-8 h-8 rounded-xl flex items-center justify-center"
                  style={{ background: activeRoom.color + '18' }}>
                  <i className={`fas ${activeRoom.icon || 'fa-comments'} text-xs`} style={{ color: activeRoom.color }}/>
                </div>
                <div className="font-display font-bold text-sm" style={{ color: '#1A0A35' }}>{activeRoom.name}</div>
                <div className="ml-auto text-xs" style={{ color: '#A3A3A3', fontFamily: 'Poppins,sans-serif' }}>
                  {messages.length} messages
                </div>
              </div>
              <div className="overflow-y-auto" style={{ maxHeight: '520px' }}>
                {messages.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-16">
                    <p className="text-sm" style={{ color: '#A3A3A3', fontFamily: 'Poppins,sans-serif' }}>No messages yet</p>
                  </div>
                ) : (
                  <table className="w-full text-xs">
                    <thead style={{ background: 'rgba(91,45,142,0.04)' }}>
                      <tr>
                        {['User','Message','Time',''].map(h => (
                          <th key={h} className="text-left px-4 py-2.5 font-bold uppercase tracking-widest"
                            style={{ color: '#5B2D8E', fontFamily: 'Sora,sans-serif', fontSize: '10px' }}>{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {messages.map((msg, i) => (
                        <tr key={msg.id} style={{ background: i % 2 === 0 ? 'transparent' : 'rgba(91,45,142,0.015)', opacity: msg.isDeleted ? 0.5 : 1 }}>
                          <td className="px-4 py-2.5 font-semibold" style={{ color: '#5B2D8E' }}>
                            {msg.user ? `${msg.user.firstName} ${msg.user.lastName}` : msg.guestName || 'Guest'}
                          </td>
                          <td className="px-4 py-2.5 max-w-xs" style={{ color: '#1A0A35' }}>
                            {msg.isDeleted ? <em style={{ color: '#A3A3A3' }}>[deleted]</em> : msg.content}
                          </td>
                          <td className="px-4 py-2.5 whitespace-nowrap" style={{ color: '#A3A3A3' }}>
                            {format(new Date(msg.createdAt), 'MMM d HH:mm')}
                          </td>
                          <td className="px-4 py-2.5">
                            {!msg.isDeleted && (
                              <button onClick={() => deleteMsgMut.mutate(msg.id)}
                                className="w-6 h-6 rounded-lg flex items-center justify-center"
                                style={{ background: 'rgba(220,38,38,0.08)', color: '#dc2626' }}
                                title="Remove message">
                                <i className="fas fa-ban text-[10px]"/>
                              </button>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </div>
            </>
          )}
        </div>
      </div>

      {showForm && <RoomForm room={editing} onClose={() => { setShowForm(false); setEditing(null) }}/>}
    </div>
  )
}
