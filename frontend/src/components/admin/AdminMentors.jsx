import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from 'react-query'
import { useForm } from 'react-hook-form'
import { format } from 'date-fns'
import toast from 'react-hot-toast'
import api from '../../services/api'

function statusStyle(s) {
  return {
    pending:  { bg: 'rgba(217,119,6,0.1)',  color: '#d97706' },
    accepted: { bg: 'rgba(22,163,74,0.1)',  color: '#16a34a' },
    rejected: { bg: 'rgba(220,38,38,0.1)',  color: '#dc2626' },
  }[s] || { bg: 'rgba(115,115,115,0.1)', color: '#737373' }
}

export default function AdminMentors() {
  const qc = useQueryClient()
  const [tab, setTab] = useState('mentors')
  const [showForm, setShowForm] = useState(false)
  const [editing, setEditing] = useState(null)
  const { register, handleSubmit, reset, setValue, formState: { errors } } = useForm()

  const { data: mentors = [], isLoading: loadingMentors } = useQuery(
    'admin-mentors',
    () => api.get('/mentors/all').then(r => r.data)
  )

  const { data: applications = [], isLoading: loadingApps } = useQuery(
    'mentor-applications',
    () => api.get('/mentors/applications').then(r => r.data)
  )

  const saveMut = useMutation(
    data => {
      const payload = {
        ...data,
        expertise: typeof data.expertise === 'string'
          ? data.expertise.split(',').map(s => s.trim()).filter(Boolean)
          : data.expertise,
      }
      return editing ? api.patch(`/mentors/${editing.id}`, payload) : api.post('/mentors', payload)
    },
    {
      onSuccess: () => {
        qc.invalidateQueries('admin-mentors')
        toast.success(editing ? 'Mentor updated!' : 'Mentor added!')
        setShowForm(false); setEditing(null); reset()
      },
      onError: () => toast.error('Save failed'),
    }
  )

  const delMut = useMutation(id => api.delete(`/mentors/${id}`), {
    onSuccess: () => { qc.invalidateQueries('admin-mentors'); toast.success('Mentor deleted') },
    onError:   () => toast.error('Delete failed'),
  })

  const appStatusMut = useMutation(
    ({ id, status }) => api.patch(`/mentors/applications/${id}`, { status }),
    {
      onSuccess: () => { qc.invalidateQueries('mentor-applications'); toast.success('Application updated') },
      onError:   () => toast.error('Update failed'),
    }
  )

  function openAdd() { setEditing(null); reset({}); setShowForm(true) }
  function openEdit(m) {
    setEditing(m)
    const d = { ...m, expertise: Array.isArray(m.expertise) ? m.expertise.join(', ') : (m.expertise || '') }
    Object.entries(d).forEach(([k,v]) => setValue(k,v))
    setShowForm(true)
  }
  function closeForm() { setShowForm(false); setEditing(null); reset() }

  const pendingApps = applications.filter(a => a.status === 'pending').length

  return (
    <div>
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl flex items-center justify-center" style={{ background: 'linear-gradient(135deg,#5B2D8E,#7B4DB8)' }}>
            <i className="fas fa-user-tie text-sm text-white" />
          </div>
          <div>
            <h2 className="font-display font-bold text-xl" style={{ color: '#1A0A35' }}>Mentorship Programme</h2>
            <p className="text-xs" style={{ color: '#A3A3A3', fontFamily: 'Poppins,sans-serif' }}>{mentors.length} mentors · {pendingApps} pending applications</p>
          </div>
        </div>
        {tab === 'mentors' && (
          <button onClick={openAdd} className="btn-secondary !py-2 !px-4 !text-xs">
            <i className="fas fa-plus text-[10px]" />Add Mentor
          </button>
        )}
      </div>

      {/* Tabs */}
      <div className="flex gap-1 mb-6 p-1 rounded-2xl w-fit" style={{ background: 'rgba(91,45,142,0.06)' }}>
        {[
          { k: 'mentors',      label: `Mentors (${mentors.length})` },
          { k: 'applications', label: `Applications (${applications.length})` },
        ].map(t => (
          <button key={t.k} onClick={() => setTab(t.k)}
            className="px-5 py-2 rounded-xl text-xs font-semibold transition-all"
            style={{ background: tab === t.k ? '#5B2D8E' : 'transparent', color: tab === t.k ? '#fff' : '#737373', fontFamily: 'Sora,sans-serif' }}>
            {t.label}
          </button>
        ))}
      </div>

      {/* Mentors Tab */}
      {tab === 'mentors' && (
        loadingMentors ? (
          <div className="space-y-3">{[1,2,3].map(i => <div key={i} className="h-20 rounded-2xl animate-pulse" style={{ background: 'rgba(91,45,142,0.04)' }} />)}</div>
        ) : mentors.length ? (
          <div className="card overflow-hidden">
            <table className="w-full">
              <thead>
                <tr style={{ borderBottom: '1px solid rgba(91,45,142,0.08)' }}>
                  {['Mentor', 'Profession', 'Location', 'Expertise', 'Applications', 'Status', 'Actions'].map(h => (
                    <th key={h} className="px-4 py-3 text-left text-xs font-bold uppercase tracking-wider" style={{ color: '#A3A3A3', fontFamily: 'Sora,sans-serif' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {mentors.map((m, i) => (
                  <tr key={m.id} style={{ borderBottom: i < mentors.length - 1 ? '1px solid rgba(91,45,142,0.05)' : 'none' }} className="hover:bg-purple-50/30 transition-colors">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-xl flex-shrink-0 overflow-hidden" style={{ background: 'linear-gradient(135deg,#5B2D8E,#7B4DB8)' }}>
                          {m.photo_url || m.photoUrl
                            ? <img src={m.photo_url || m.photoUrl} alt={m.name} className="w-full h-full object-cover" />
                            : <div className="w-full h-full flex items-center justify-center"><i className="fas fa-user text-xs text-white opacity-70" /></div>}
                        </div>
                        <div>
                          <p className="font-display font-semibold text-sm" style={{ color: '#1A0A35' }}>{m.name}</p>
                          {m.company && <p className="text-xs" style={{ color: '#A3A3A3', fontFamily: 'Poppins,sans-serif' }}>{m.company}</p>}
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-sm" style={{ color: '#404040', fontFamily: 'Poppins,sans-serif' }}>{m.profession}</td>
                    <td className="px-4 py-3 text-sm" style={{ color: '#404040', fontFamily: 'Poppins,sans-serif' }}>
                      {[m.city, m.country].filter(Boolean).join(', ') || '—'}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex flex-wrap gap-1">
                        {(Array.isArray(m.expertise) ? m.expertise : []).slice(0,2).map(e => (
                          <span key={e} className="text-[10px] px-2 py-0.5 rounded-full" style={{ background: 'rgba(91,45,142,0.08)', color: '#5B2D8E', fontFamily: 'Sora,sans-serif' }}>{e}</span>
                        ))}
                        {(m.expertise?.length || 0) > 2 && <span className="text-[10px] px-2 py-0.5 rounded-full" style={{ color: '#A3A3A3', fontFamily: 'Sora,sans-serif' }}>+{m.expertise.length - 2}</span>}
                      </div>
                    </td>
                    <td className="px-4 py-3 text-sm text-center" style={{ color: '#404040', fontFamily: 'Sora,sans-serif' }}>{m.application_count || 0}</td>
                    <td className="px-4 py-3">
                      <span className="text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full"
                        style={{ background: (m.is_available || m.isAvailable) ? 'rgba(22,163,74,0.1)' : 'rgba(115,115,115,0.1)', color: (m.is_available || m.isAvailable) ? '#16a34a' : '#737373', fontFamily: 'Sora,sans-serif' }}>
                        {(m.is_available || m.isAvailable) ? 'Available' : 'Full'}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex gap-2">
                        <button onClick={() => openEdit(m)} className="w-7 h-7 rounded-lg flex items-center justify-center" style={{ background: 'rgba(91,45,142,0.08)', color: '#5B2D8E' }}>
                          <i className="fas fa-edit text-[10px]" />
                        </button>
                        <button onClick={() => { if (window.confirm('Delete this mentor?')) delMut.mutate(m.id) }}
                          className="w-7 h-7 rounded-lg flex items-center justify-center" style={{ background: 'rgba(220,38,38,0.08)', color: '#dc2626' }}>
                          <i className="fas fa-trash text-[10px]" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="text-center py-16 rounded-3xl" style={{ background: 'rgba(91,45,142,0.02)', border: '1px dashed rgba(91,45,142,0.1)' }}>
            <i className="fas fa-user-tie text-4xl mb-3 block" style={{ color: 'rgba(91,45,142,0.15)' }} />
            <h4 className="font-display font-semibold mb-2" style={{ color: '#737373' }}>No mentors yet</h4>
            <button onClick={openAdd} className="btn-secondary !text-sm !py-2 !px-5 mt-2">Add First Mentor</button>
          </div>
        )
      )}

      {/* Applications Tab */}
      {tab === 'applications' && (
        loadingApps ? (
          <div className="space-y-3">{[1,2,3].map(i => <div key={i} className="h-16 rounded-2xl animate-pulse" style={{ background: 'rgba(91,45,142,0.04)' }} />)}</div>
        ) : applications.length ? (
          <div className="card overflow-hidden">
            <table className="w-full">
              <thead>
                <tr style={{ borderBottom: '1px solid rgba(91,45,142,0.08)' }}>
                  {['Applicant', 'Mentor', 'Goals', 'Date', 'Status', 'Actions'].map(h => (
                    <th key={h} className="px-4 py-3 text-left text-xs font-bold uppercase tracking-wider" style={{ color: '#A3A3A3', fontFamily: 'Sora,sans-serif' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {applications.map((a, i) => {
                  const ss = statusStyle(a.status)
                  return (
                    <tr key={a.id} style={{ borderBottom: i < applications.length - 1 ? '1px solid rgba(91,45,142,0.05)' : 'none' }} className="hover:bg-purple-50/30 transition-colors">
                      <td className="px-4 py-3">
                        <p className="font-display font-semibold text-sm" style={{ color: '#1A0A35' }}>{a.name}</p>
                        <p className="text-xs" style={{ color: '#A3A3A3', fontFamily: 'Poppins,sans-serif' }}>{a.email}</p>
                      </td>
                      <td className="px-4 py-3 text-sm" style={{ color: '#404040', fontFamily: 'Poppins,sans-serif' }}>{a.mentor_name || '—'}</td>
                      <td className="px-4 py-3" style={{ maxWidth: '200px' }}>
                        <p className="text-xs line-clamp-2" style={{ color: '#737373', fontFamily: 'Poppins,sans-serif', lineHeight: 1.6 }}>{a.goals}</p>
                      </td>
                      <td className="px-4 py-3 text-xs" style={{ color: '#A3A3A3', fontFamily: 'Poppins,sans-serif' }}>
                        {a.created_at ? format(new Date(a.created_at), 'MMM d, yyyy') : '—'}
                      </td>
                      <td className="px-4 py-3">
                        <span className="text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full capitalize"
                          style={{ background: ss.bg, color: ss.color, fontFamily: 'Sora,sans-serif' }}>
                          {a.status}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        {a.status === 'pending' && (
                          <div className="flex gap-2">
                            <button onClick={() => appStatusMut.mutate({ id: a.id, status: 'accepted' })}
                              className="text-[10px] font-bold uppercase tracking-wider px-2.5 py-1.5 rounded-xl hover:opacity-80"
                              style={{ background: 'rgba(22,163,74,0.1)', color: '#16a34a', fontFamily: 'Sora,sans-serif' }}>
                              <i className="fas fa-check mr-1" />Accept
                            </button>
                            <button onClick={() => appStatusMut.mutate({ id: a.id, status: 'rejected' })}
                              className="text-[10px] font-bold uppercase tracking-wider px-2.5 py-1.5 rounded-xl hover:opacity-80"
                              style={{ background: 'rgba(220,38,38,0.08)', color: '#dc2626', fontFamily: 'Sora,sans-serif' }}>
                              <i className="fas fa-times mr-1" />Reject
                            </button>
                          </div>
                        )}
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="text-center py-16 rounded-3xl" style={{ background: 'rgba(91,45,142,0.02)', border: '1px dashed rgba(91,45,142,0.1)' }}>
            <i className="fas fa-file-alt text-4xl mb-3 block" style={{ color: 'rgba(91,45,142,0.15)' }} />
            <h4 className="font-display font-semibold mb-2" style={{ color: '#737373' }}>No applications yet</h4>
          </div>
        )
      )}

      {/* Mentor Form Modal */}
      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4"
          style={{ background: 'rgba(26,10,53,0.8)', backdropFilter: 'blur(8px)' }}
          onClick={e => e.target === e.currentTarget && closeForm()}>
          <div className="bg-white rounded-3xl w-full max-w-2xl max-h-[90vh] overflow-y-auto" style={{ boxShadow: '0 32px 80px rgba(26,10,53,0.25)' }}>
            <div className="px-7 pt-6 pb-4 border-b flex items-center justify-between" style={{ borderColor: 'rgba(91,45,142,0.08)' }}>
              <h3 className="font-display font-bold text-xl" style={{ color: '#1A0A35' }}>{editing ? 'Edit Mentor' : 'Add Mentor'}</h3>
              <button onClick={closeForm} className="w-9 h-9 rounded-full flex items-center justify-center hover:bg-gray-100" style={{ color: '#A3A3A3' }}>
                <i className="fas fa-times" />
              </button>
            </div>
            <form onSubmit={handleSubmit(d => saveMut.mutate(d))} className="p-7 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="label">Full Name *</label>
                  <input {...register('name', { required: true })} className="input" />
                </div>
                <div>
                  <label className="label">Profession *</label>
                  <input {...register('profession', { required: true })} className="input" placeholder="e.g. Software Engineer" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="label">Company / Organisation</label>
                  <input {...register('company')} className="input" />
                </div>
                <div>
                  <label className="label">Email</label>
                  <input type="email" {...register('email')} className="input" />
                </div>
              </div>
              <div>
                <label className="label">Bio</label>
                <textarea {...register('bio')} rows={3} className="input resize-none" />
              </div>
              <div>
                <label className="label">Expertise (comma-separated)</label>
                <input {...register('expertise')} className="input" placeholder="e.g. Finance, Business Strategy, Leadership" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="label">Country</label>
                  <input {...register('country')} className="input" />
                </div>
                <div>
                  <label className="label">City</label>
                  <input {...register('city')} className="input" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="label">LinkedIn URL</label>
                  <input {...register('linkedin')} className="input" placeholder="https://linkedin.com/in/…" />
                </div>
                <div>
                  <label className="label">Max Mentees</label>
                  <input type="number" {...register('max_mentees')} className="input" placeholder="3" min={1} />
                </div>
              </div>
              <div>
                <label className="label">Photo URL</label>
                <input {...register('photo_url')} className="input" placeholder="https://…" />
              </div>
              <div className="space-y-2.5">
                {[
                  { name: 'is_available', label: 'Currently available for mentees' },
                  { name: 'is_featured',  label: 'Feature on homepage' },
                ].map(f => (
                  <label key={f.name} className="flex items-center gap-2.5 cursor-pointer">
                    <input type="checkbox" {...register(f.name)} className="w-4 h-4 rounded" style={{ accentColor: '#5B2D8E' }} />
                    <span className="text-sm" style={{ color: '#404040', fontFamily: 'Poppins,sans-serif' }}>{f.label}</span>
                  </label>
                ))}
              </div>
              <div className="flex gap-3 pt-2">
                <button type="button" onClick={closeForm}
                  className="flex-1 py-3 rounded-2xl text-sm font-semibold"
                  style={{ background: 'rgba(91,45,142,0.05)', color: '#737373', border: '1px solid rgba(91,45,142,0.1)', fontFamily: 'Sora,sans-serif' }}>Cancel</button>
                <button type="submit" disabled={saveMut.isLoading} className="btn-secondary flex-1 justify-center">
                  {saveMut.isLoading ? <><i className="fas fa-spinner animate-spin" />Saving…</> : <><i className="fas fa-save" />{editing ? 'Update' : 'Add'}</>}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
