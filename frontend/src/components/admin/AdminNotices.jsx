import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from 'react-query'
import { useForm } from 'react-hook-form'
import { format } from 'date-fns'
import toast from 'react-hot-toast'
import api from '../../services/api'

const PRIORITIES  = ['low', 'normal', 'high', 'urgent']
const CATEGORIES  = ['General', 'Meeting', 'Event', 'Finance', 'Development', 'Emergency', 'Other']

function priorityStyle(p) {
  return {
    urgent: { bg: 'rgba(220,38,38,0.1)',  color: '#dc2626', icon: 'fa-exclamation-circle' },
    high:   { bg: 'rgba(234,88,12,0.1)',  color: '#ea580c', icon: 'fa-exclamation-triangle' },
    normal: { bg: 'rgba(91,45,142,0.08)', color: '#5B2D8E', icon: 'fa-bell' },
    low:    { bg: 'rgba(115,115,115,0.1)',color: '#737373', icon: 'fa-info-circle' },
  }[p] || { bg: 'rgba(115,115,115,0.1)', color: '#737373', icon: 'fa-info-circle' }
}

export default function AdminNotices() {
  const qc = useQueryClient()
  const [showForm, setShowForm] = useState(false)
  const [editing, setEditing] = useState(null)
  const { register, handleSubmit, reset, setValue, formState: { errors } } = useForm()

  const { data: notices = [], isLoading } = useQuery(
    'admin-notices',
    () => api.get('/notices/all').then(r => r.data)
  )

  const saveMut = useMutation(
    data => editing ? api.patch(`/notices/${editing.id}`, data) : api.post('/notices', data),
    {
      onSuccess: () => {
        qc.invalidateQueries('admin-notices')
        toast.success(editing ? 'Notice updated!' : 'Notice created!')
        setShowForm(false); setEditing(null); reset()
      },
      onError: () => toast.error('Save failed'),
    }
  )

  const delMut = useMutation(id => api.delete(`/notices/${id}`), {
    onSuccess: () => { qc.invalidateQueries('admin-notices'); toast.success('Notice deleted') },
    onError:   () => toast.error('Delete failed'),
  })

  const togglePublish = (notice) => {
    api.patch(`/notices/${notice.id}`, { is_published: !notice.is_published })
      .then(() => { qc.invalidateQueries('admin-notices'); toast.success(notice.is_published ? 'Unpublished' : 'Published') })
      .catch(() => toast.error('Update failed'))
  }

  function openAdd() { setEditing(null); reset({}); setShowForm(true) }
  function openEdit(n) { setEditing(n); Object.entries(n).forEach(([k, v]) => setValue(k, v)); setShowForm(true) }
  function closeForm() { setShowForm(false); setEditing(null); reset() }

  const published = notices.filter(n => n.is_published).length
  const urgent    = notices.filter(n => n.priority === 'urgent').length

  return (
    <div>
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl flex items-center justify-center" style={{ background: 'linear-gradient(135deg,#5B2D8E,#7B4DB8)' }}>
            <i className="fas fa-bullhorn text-sm text-white" />
          </div>
          <div>
            <h2 className="font-display font-bold text-xl" style={{ color: '#1A0A35' }}>Notice Board</h2>
            <p className="text-xs" style={{ color: '#A3A3A3', fontFamily: 'Poppins,sans-serif' }}>{published} published · {urgent} urgent</p>
          </div>
        </div>
        <button onClick={openAdd} className="btn-secondary !py-2 !px-4 !text-xs">
          <i className="fas fa-plus text-[10px]" />Create Notice
        </button>
      </div>

      {/* Notices */}
      {isLoading ? (
        <div className="space-y-3">{[1,2,3].map(i => <div key={i} className="h-24 rounded-2xl animate-pulse" style={{ background: 'rgba(91,45,142,0.04)' }} />)}</div>
      ) : notices.length ? (
        <div className="space-y-3">
          {notices.map(n => {
            const ps = priorityStyle(n.priority)
            const isExpired = n.expires_at && new Date(n.expires_at) < new Date()
            return (
              <div key={n.id} className="card p-5" style={{ opacity: isExpired ? 0.6 : 1 }}>
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-start gap-3 flex-1 min-w-0">
                    <div className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 mt-0.5" style={{ background: ps.bg }}>
                      <i className={`fas ${ps.icon} text-sm`} style={{ color: ps.color }} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap mb-1">
                        <h3 className="font-display font-semibold text-sm" style={{ color: '#1A0A35' }}>{n.title}</h3>
                        <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full capitalize"
                          style={{ background: ps.bg, color: ps.color, fontFamily: 'Sora,sans-serif' }}>
                          {n.priority}
                        </span>
                        {n.category && (
                          <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full"
                            style={{ background: 'rgba(91,45,142,0.08)', color: '#5B2D8E', fontFamily: 'Sora,sans-serif' }}>
                            {n.category}
                          </span>
                        )}
                        {isExpired && (
                          <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full"
                            style={{ background: 'rgba(220,38,38,0.08)', color: '#dc2626', fontFamily: 'Sora,sans-serif' }}>
                            Expired
                          </span>
                        )}
                      </div>
                      {n.content && <p className="text-xs line-clamp-2 mb-2" style={{ color: '#737373', fontFamily: 'Poppins,sans-serif', lineHeight: 1.7 }}>{n.content}</p>}
                      <div className="flex items-center gap-3 text-[10px]" style={{ color: '#A3A3A3', fontFamily: 'Poppins,sans-serif' }}>
                        {n.expires_at && <span><i className="fas fa-clock mr-1" />Expires {format(new Date(n.expires_at), 'MMM d, yyyy')}</span>}
                        {n.created_at && <span>Posted {format(new Date(n.created_at), 'MMM d, yyyy')}</span>}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 flex-shrink-0">
                    {/* Publish toggle */}
                    <button onClick={() => togglePublish(n)}
                      className="text-[10px] font-bold uppercase tracking-wider px-2.5 py-1.5 rounded-xl transition-all"
                      style={{ background: n.is_published ? 'rgba(22,163,74,0.1)' : 'rgba(115,115,115,0.1)', color: n.is_published ? '#16a34a' : '#737373', fontFamily: 'Sora,sans-serif' }}>
                      <i className={`fas ${n.is_published ? 'fa-eye' : 'fa-eye-slash'} mr-1`} />
                      {n.is_published ? 'Live' : 'Draft'}
                    </button>
                    <button onClick={() => openEdit(n)} className="w-7 h-7 rounded-lg flex items-center justify-center" style={{ background: 'rgba(91,45,142,0.08)', color: '#5B2D8E' }}>
                      <i className="fas fa-edit text-[10px]" />
                    </button>
                    <button onClick={() => { if (window.confirm('Delete this notice?')) delMut.mutate(n.id) }}
                      className="w-7 h-7 rounded-lg flex items-center justify-center" style={{ background: 'rgba(220,38,38,0.08)', color: '#dc2626' }}>
                      <i className="fas fa-trash text-[10px]" />
                    </button>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      ) : (
        <div className="text-center py-16 rounded-3xl" style={{ background: 'rgba(91,45,142,0.02)', border: '1px dashed rgba(91,45,142,0.1)' }}>
          <i className="fas fa-bullhorn text-4xl mb-3 block" style={{ color: 'rgba(91,45,142,0.15)' }} />
          <h4 className="font-display font-semibold mb-2" style={{ color: '#737373' }}>No notices yet</h4>
          <button onClick={openAdd} className="btn-secondary !text-sm !py-2 !px-5 mt-2">Create First Notice</button>
        </div>
      )}

      {/* Modal */}
      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4"
          style={{ background: 'rgba(26,10,53,0.8)', backdropFilter: 'blur(8px)' }}
          onClick={e => e.target === e.currentTarget && closeForm()}>
          <div className="bg-white rounded-3xl w-full max-w-lg max-h-[90vh] overflow-y-auto" style={{ boxShadow: '0 32px 80px rgba(26,10,53,0.25)' }}>
            <div className="px-7 pt-6 pb-4 border-b flex items-center justify-between" style={{ borderColor: 'rgba(91,45,142,0.08)' }}>
              <h3 className="font-display font-bold text-xl" style={{ color: '#1A0A35' }}>{editing ? 'Edit Notice' : 'Create Notice'}</h3>
              <button onClick={closeForm} className="w-9 h-9 rounded-full flex items-center justify-center hover:bg-gray-100" style={{ color: '#A3A3A3' }}>
                <i className="fas fa-times" />
              </button>
            </div>
            <form onSubmit={handleSubmit(d => saveMut.mutate(d))} className="p-7 space-y-4">
              <div>
                <label className="label">Title *</label>
                <input {...register('title', { required: 'Title is required' })} className="input" placeholder="Notice title" />
                {errors.title && <p className="text-xs mt-1" style={{ color: '#dc2626' }}>{errors.title.message}</p>}
              </div>
              <div>
                <label className="label">Content</label>
                <textarea {...register('content')} rows={4} className="input resize-none" placeholder="Full notice text…" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="label">Category</label>
                  <select {...register('category')} className="input">
                    <option value="">Select…</option>
                    {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
                <div>
                  <label className="label">Priority</label>
                  <select {...register('priority')} className="input">
                    {PRIORITIES.map(p => <option key={p} value={p} className="capitalize">{p.charAt(0).toUpperCase()+p.slice(1)}</option>)}
                  </select>
                </div>
              </div>
              <div>
                <label className="label">Expires At</label>
                <input type="date" {...register('expires_at')} className="input" />
              </div>
              <label className="flex items-center gap-2.5 cursor-pointer">
                <input type="checkbox" {...register('is_published')} className="w-4 h-4 rounded" style={{ accentColor: '#5B2D8E' }} />
                <span className="text-sm" style={{ color: '#404040', fontFamily: 'Poppins,sans-serif' }}>Publish immediately</span>
              </label>
              <div className="flex gap-3 pt-2">
                <button type="button" onClick={closeForm}
                  className="flex-1 py-3 rounded-2xl text-sm font-semibold"
                  style={{ background: 'rgba(91,45,142,0.05)', color: '#737373', border: '1px solid rgba(91,45,142,0.1)', fontFamily: 'Sora,sans-serif' }}>Cancel</button>
                <button type="submit" disabled={saveMut.isLoading} className="btn-secondary flex-1 justify-center">
                  {saveMut.isLoading ? <><i className="fas fa-spinner animate-spin" />Saving…</> : <><i className="fas fa-save" />{editing ? 'Update' : 'Create'}</>}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
