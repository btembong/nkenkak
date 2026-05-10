import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from 'react-query'
import { useForm } from 'react-hook-form'
import { format } from 'date-fns'
import toast from 'react-hot-toast'
import api from '../../services/api'

const STATUS_META = {
  scheduled: { label: 'Scheduled', color: '#0284c7', bg: 'rgba(2,132,199,0.1)'   },
  live:      { label: 'Live',      color: '#16a34a', bg: 'rgba(22,163,74,0.12)'  },
  ended:     { label: 'Ended',     color: '#737373', bg: 'rgba(115,115,115,0.1)' },
}

function RoomForm({ room, onClose }) {
  const qc = useQueryClient()
  const isEdit = !!room
  const { register, handleSubmit, formState: { errors } } = useForm({
    defaultValues: room ? {
      ...room,
      scheduledAt: room.scheduledAt ? new Date(room.scheduledAt).toISOString().slice(0,16) : '',
    } : { isPrivate: false }
  })
  const mut = useMutation(
    d => isEdit ? api.patch(`/rooms/${room.id}`, d) : api.post('/rooms', d),
    {
      onSuccess: () => { qc.invalidateQueries('admin-live-rooms'); toast.success(isEdit ? 'Updated!' : 'Room created!'); onClose() },
      onError: e => toast.error(e.response?.data?.error || 'Failed'),
    }
  )
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: 'rgba(26,10,53,0.8)', backdropFilter: 'blur(8px)' }}
      onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="bg-white rounded-3xl w-full max-w-lg max-h-[92vh] overflow-y-auto"
        style={{ boxShadow: '0 32px 80px rgba(26,10,53,0.25)' }}>
        <div className="px-7 pt-6 pb-4 border-b sticky top-0 bg-white z-10"
          style={{ borderColor: 'rgba(91,45,142,0.08)' }}>
          <div className="flex items-center justify-between">
            <h3 className="font-display font-bold text-xl" style={{ color: '#1A0A35' }}>
              {isEdit ? 'Edit Room' : 'Create Live Room'}
            </h3>
            <button onClick={onClose} className="w-9 h-9 rounded-full flex items-center justify-center hover:bg-gray-100"
              style={{ color: '#A3A3A3' }}><i className="fas fa-times"/></button>
          </div>
        </div>
        <form onSubmit={handleSubmit(d => mut.mutate(d))} className="p-7 space-y-4">
          <div>
            <label className="label">Meeting Name *</label>
            <input {...register('name', { required: 'Required' })} className="input" placeholder="e.g. Monthly Council Meeting"/>
            {errors.name && <p className="text-xs mt-1 text-red-500">{errors.name.message}</p>}
          </div>
          {!isEdit && (
            <div>
              <label className="label">Slug (URL) *</label>
              <input {...register('slug', { required: 'Required' })} className="input" placeholder="monthly-council-may-2025"/>
              {errors.slug && <p className="text-xs mt-1 text-red-500">{errors.slug.message}</p>}
            </div>
          )}
          <div>
            <label className="label">Description</label>
            <textarea {...register('description')} rows={2} className="input resize-none" placeholder="Agenda or meeting notes…"/>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="label">Scheduled Date & Time</label>
              <input type="datetime-local" {...register('scheduledAt')} className="input"/>
            </div>
            <div>
              <label className="label">Max Participants <span style={{color:'#A3A3A3',fontWeight:400}}>(optional)</span></label>
              <input type="number" {...register('maxParticipants')} className="input" min="2" placeholder="Unlimited"/>
            </div>
          </div>
          {isEdit && (
            <div>
              <label className="label">Status</label>
              <select {...register('status')} className="input">
                {Object.entries(STATUS_META).map(([v,m]) => <option key={v} value={v}>{m.label}</option>)}
              </select>
            </div>
          )}
          <label className="flex items-center gap-2 text-sm cursor-pointer" style={{ fontFamily: 'Poppins,sans-serif' }}>
            <input type="checkbox" {...register('isPrivate')} className="w-4 h-4 rounded accent-primary-500"/>
            Private room (members only, no guest access)
          </label>
          <div className="px-4 py-3 rounded-xl text-xs" style={{ background: 'rgba(91,45,142,0.04)', color: '#737373', fontFamily: 'Poppins,sans-serif' }}>
            <i className="fas fa-info-circle mr-2" style={{ color: '#5B2D8E' }}/>
            A Daily.co room will be created automatically using your <code>DAILY_API_KEY</code>.
          </div>
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

export default function AdminLiveRooms() {
  const qc = useQueryClient()
  const [showForm, setShowForm] = useState(false)
  const [editing,  setEditing]  = useState(null)

  const { data: rooms = [], isLoading } = useQuery(
    'admin-live-rooms',
    () => api.get('/rooms/admin/all').then(r => r.data)
  )

  const deleteMut = useMutation(id => api.delete(`/rooms/${id}`), {
    onSuccess: () => { qc.invalidateQueries('admin-live-rooms'); toast.success('Room deleted') },
  })

  const goLiveMut = useMutation(id => api.patch(`/rooms/${id}`, { status: 'live' }), {
    onSuccess: () => { qc.invalidateQueries('admin-live-rooms'); toast.success('Room is now live!') },
  })

  const endMut = useMutation(id => api.patch(`/rooms/${id}`, { status: 'ended' }), {
    onSuccess: () => { qc.invalidateQueries('admin-live-rooms'); toast.success('Meeting ended') },
  })

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="font-display font-bold text-2xl" style={{ color: '#1A0A35' }}>Live Meeting Rooms</h2>
          <p className="text-sm mt-0.5" style={{ color: '#737373', fontFamily: 'Poppins,sans-serif' }}>Create and manage video meeting rooms powered by Daily.co</p>
        </div>
        <button onClick={() => { setEditing(null); setShowForm(true) }} className="btn-secondary">
          <i className="fas fa-plus"/>New Room
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        {[
          { label: 'Total Rooms', value: rooms.length,                                   icon: 'fa-video',   color: '#5B2D8E', bg: 'rgba(91,45,142,0.1)' },
          { label: 'Live Now',    value: rooms.filter(r => r.status === 'live').length,   icon: 'fa-circle',  color: '#16a34a', bg: 'rgba(22,163,74,0.1)' },
          { label: 'Upcoming',    value: rooms.filter(r => r.status === 'scheduled').length, icon: 'fa-clock',color: '#0284c7', bg: 'rgba(2,132,199,0.1)' },
        ].map(s => (
          <div key={s.label} className="rounded-2xl p-5 flex items-center gap-4"
            style={{ background: '#fff', boxShadow: '0 2px 12px rgba(91,45,142,0.06)' }}>
            <div className="w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: s.bg }}>
              <i className={`fas ${s.icon} text-base`} style={{ color: s.color }}/>
            </div>
            <div>
              <div className="font-display font-bold text-2xl" style={{ color: '#1A0A35' }}>{s.value}</div>
              <div className="text-xs" style={{ color: '#A3A3A3', fontFamily: 'Poppins,sans-serif' }}>{s.label}</div>
            </div>
          </div>
        ))}
      </div>

      {isLoading ? (
        <div className="space-y-3">{[1,2,3].map(i => <div key={i} className="h-20 rounded-2xl animate-pulse" style={{ background: 'rgba(91,45,142,0.05)' }}/>)}</div>
      ) : !rooms.length ? (
        <div className="text-center py-20 rounded-3xl" style={{ background: 'rgba(91,45,142,0.02)', border: '1px dashed rgba(91,45,142,0.12)' }}>
          <i className="fas fa-video text-5xl mb-4 block" style={{ color: 'rgba(91,45,142,0.18)' }}/>
          <h3 className="font-display font-bold text-xl mb-2" style={{ color: '#1A0A35' }}>No rooms yet</h3>
          <button onClick={() => setShowForm(true)} className="btn-secondary mt-4 !text-sm">Create first room</button>
        </div>
      ) : (
        <div className="rounded-3xl overflow-hidden" style={{ background: '#fff', boxShadow: '0 2px 16px rgba(91,45,142,0.06)' }}>
          <table className="w-full text-sm">
            <thead style={{ background: 'rgba(91,45,142,0.04)' }}>
              <tr>
                {['Room','Scheduled','Status','Daily.co','Actions'].map(h => (
                  <th key={h} className="text-left px-5 py-3 text-xs font-bold uppercase tracking-widest"
                    style={{ color: '#5B2D8E', fontFamily: 'Sora,sans-serif' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {rooms.map((r, i) => {
                const meta = STATUS_META[r.status] || STATUS_META.scheduled
                return (
                  <tr key={r.id} style={{ background: i % 2 === 0 ? 'transparent' : 'rgba(91,45,142,0.015)' }}>
                    <td className="px-5 py-4">
                      <div className="font-semibold text-sm" style={{ color: '#1A0A35' }}>{r.name}</div>
                      {r.description && <div className="text-xs mt-0.5 truncate max-w-[200px]" style={{ color: '#A3A3A3' }}>{r.description}</div>}
                      <div className="text-xs mt-0.5" style={{ color: '#A3A3A3' }}>/{r.slug}</div>
                    </td>
                    <td className="px-5 py-4 text-xs" style={{ color: '#737373', fontFamily: 'Poppins,sans-serif' }}>
                      {r.scheduledAt ? format(new Date(r.scheduledAt), 'MMM d, yyyy HH:mm') : '—'}
                    </td>
                    <td className="px-5 py-4">
                      <span className="text-xs font-bold px-2.5 py-1 rounded-full flex items-center gap-1 w-fit"
                        style={{ background: meta.bg, color: meta.color }}>
                        {r.status === 'live' && <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse"/>}
                        {meta.label}
                      </span>
                    </td>
                    <td className="px-5 py-4">
                      {r.dailyRoomUrl
                        ? <span className="text-xs font-semibold" style={{ color: '#16a34a' }}><i className="fas fa-check mr-1"/>Created</span>
                        : <span className="text-xs" style={{ color: '#A3A3A3' }}>Not configured</span>}
                    </td>
                    <td className="px-5 py-4">
                      <div className="flex gap-1 flex-wrap">
                        {r.status === 'scheduled' && (
                          <button onClick={() => goLiveMut.mutate(r.id)}
                            className="px-2.5 py-1.5 rounded-xl text-xs font-semibold"
                            style={{ background: 'rgba(22,163,74,0.1)', color: '#16a34a' }}>
                            <i className="fas fa-play mr-1"/>Go Live
                          </button>
                        )}
                        {r.status === 'live' && (
                          <button onClick={() => endMut.mutate(r.id)}
                            className="px-2.5 py-1.5 rounded-xl text-xs font-semibold"
                            style={{ background: 'rgba(220,38,38,0.1)', color: '#dc2626' }}>
                            <i className="fas fa-stop mr-1"/>End
                          </button>
                        )}
                        <button onClick={() => { setEditing(r); setShowForm(true) }}
                          className="w-8 h-8 rounded-xl flex items-center justify-center"
                          style={{ background: 'rgba(91,45,142,0.08)', color: '#5B2D8E' }}>
                          <i className="fas fa-edit text-xs"/>
                        </button>
                        <button onClick={() => { if (confirm('Delete room?')) deleteMut.mutate(r.id) }}
                          className="w-8 h-8 rounded-xl flex items-center justify-center"
                          style={{ background: 'rgba(220,38,38,0.08)', color: '#dc2626' }}>
                          <i className="fas fa-trash text-xs"/>
                        </button>
                      </div>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      )}

      {showForm && <RoomForm room={editing} onClose={() => { setShowForm(false); setEditing(null) }}/>}
    </div>
  )
}
