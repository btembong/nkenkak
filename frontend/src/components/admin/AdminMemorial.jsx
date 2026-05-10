import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from 'react-query'
import { useForm } from 'react-hook-form'
import toast from 'react-hot-toast'
import api from '../../services/api'

function typeStyle(t) {
  return t === 'hero'
    ? { bg: 'rgba(240,165,0,0.12)', color: '#B07A00', icon: 'fa-star', label: 'Village Hero' }
    : { bg: 'rgba(91,45,142,0.1)',  color: '#5B2D8E', icon: 'fa-dove', label: 'In Memoriam' }
}

export default function AdminMemorial() {
  const qc = useQueryClient()
  const [tab, setTab] = useState('all')
  const [showForm, setShowForm] = useState(false)
  const [editing, setEditing] = useState(null)
  const { register, handleSubmit, reset, setValue, formState: { errors } } = useForm()

  const { data: entries = [], isLoading } = useQuery(
    'admin-memorial',
    () => api.get('/memorial').then(r => r.data)
  )

  const saveMut = useMutation(
    data => {
      const payload = {
        ...data,
        achievements: typeof data.achievements === 'string'
          ? data.achievements.split(',').map(s => s.trim()).filter(Boolean)
          : (data.achievements || []),
      }
      return editing ? api.patch(`/memorial/${editing.id}`, payload) : api.post('/memorial', payload)
    },
    {
      onSuccess: () => {
        qc.invalidateQueries('admin-memorial')
        toast.success(editing ? 'Entry updated!' : 'Entry added!')
        setShowForm(false); setEditing(null); reset()
      },
      onError: () => toast.error('Save failed'),
    }
  )

  const delMut = useMutation(id => api.delete(`/memorial/${id}`), {
    onSuccess: () => { qc.invalidateQueries('admin-memorial'); toast.success('Entry deleted') },
    onError:   () => toast.error('Delete failed'),
  })

  const togglePublish = (entry) => {
    api.patch(`/memorial/${entry.id}`, { is_published: !entry.is_published })
      .then(() => { qc.invalidateQueries('admin-memorial'); toast.success(entry.is_published ? 'Unpublished' : 'Published') })
      .catch(() => toast.error('Update failed'))
  }

  function openAdd() { setEditing(null); reset({}); setShowForm(true) }
  function openEdit(e) {
    setEditing(e)
    const d = { ...e, achievements: Array.isArray(e.achievements) ? e.achievements.join(', ') : (e.achievements || '') }
    Object.entries(d).forEach(([k,v]) => setValue(k,v))
    setShowForm(true)
  }
  function closeForm() { setShowForm(false); setEditing(null); reset() }

  const displayed = tab === 'all' ? entries : entries.filter(e => e.type === tab)
  const memCount  = entries.filter(e => e.type === 'memorial').length
  const heroCount = entries.filter(e => e.type === 'hero').length

  return (
    <div>
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl flex items-center justify-center" style={{ background: 'linear-gradient(135deg,#5B2D8E,#7B4DB8)' }}>
            <i className="fas fa-star text-sm text-white" />
          </div>
          <div>
            <h2 className="font-display font-bold text-xl" style={{ color: '#1A0A35' }}>Memorial & Hall of Fame</h2>
            <p className="text-xs" style={{ color: '#A3A3A3', fontFamily: 'Poppins,sans-serif' }}>{memCount} in memoriam · {heroCount} village heroes</p>
          </div>
        </div>
        <button onClick={openAdd} className="btn-secondary !py-2 !px-4 !text-xs">
          <i className="fas fa-plus text-[10px]" />Add Entry
        </button>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 mb-6 p-1 rounded-2xl w-fit" style={{ background: 'rgba(91,45,142,0.06)' }}>
        {[
          { k: 'all',      label: `All (${entries.length})` },
          { k: 'memorial', label: `In Memoriam (${memCount})` },
          { k: 'hero',     label: `Village Heroes (${heroCount})` },
        ].map(t => (
          <button key={t.k} onClick={() => setTab(t.k)}
            className="px-4 py-2 rounded-xl text-xs font-semibold transition-all"
            style={{ background: tab === t.k ? '#5B2D8E' : 'transparent', color: tab === t.k ? '#fff' : '#737373', fontFamily: 'Sora,sans-serif' }}>
            {t.label}
          </button>
        ))}
      </div>

      {isLoading ? (
        <div className="space-y-3">{[1,2,3].map(i => <div key={i} className="h-20 rounded-2xl animate-pulse" style={{ background: 'rgba(91,45,142,0.04)' }} />)}</div>
      ) : displayed.length ? (
        <div className="card overflow-hidden">
          <table className="w-full">
            <thead>
              <tr style={{ borderBottom: '1px solid rgba(91,45,142,0.08)' }}>
                {['Person', 'Type', 'Role', 'Years', 'Published', 'Actions'].map(h => (
                  <th key={h} className="px-4 py-3 text-left text-xs font-bold uppercase tracking-wider" style={{ color: '#A3A3A3', fontFamily: 'Sora,sans-serif' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {displayed.map((e, i) => {
                const ts = typeStyle(e.type)
                const yearsRange = [e.birth_year, e.death_year].filter(Boolean).join(' – ')
                return (
                  <tr key={e.id} style={{ borderBottom: i < displayed.length - 1 ? '1px solid rgba(91,45,142,0.05)' : 'none' }} className="hover:bg-purple-50/30 transition-colors">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        {e.photo_url
                          ? <img src={e.photo_url} alt={e.name} className="w-10 h-10 rounded-xl object-cover flex-shrink-0" />
                          : <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: ts.bg }}>
                              <i className={`fas ${ts.icon} text-sm`} style={{ color: ts.color }} />
                            </div>}
                        <div>
                          <p className="font-display font-semibold text-sm" style={{ color: '#1A0A35' }}>{e.name}</p>
                          {e.bio && <p className="text-xs line-clamp-1" style={{ color: '#A3A3A3', fontFamily: 'Poppins,sans-serif' }}>{e.bio}</p>}
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <span className="text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full"
                        style={{ background: ts.bg, color: ts.color, fontFamily: 'Sora,sans-serif' }}>
                        <i className={`fas ${ts.icon} mr-1`} />{ts.label}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-sm" style={{ color: '#404040', fontFamily: 'Poppins,sans-serif' }}>{e.role || '—'}</td>
                    <td className="px-4 py-3 text-sm" style={{ color: '#404040', fontFamily: 'Poppins,sans-serif' }}>{yearsRange || '—'}</td>
                    <td className="px-4 py-3">
                      <button onClick={() => togglePublish(e)}
                        className="text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full transition-all"
                        style={{ background: e.is_published ? 'rgba(22,163,74,0.1)' : 'rgba(115,115,115,0.1)', color: e.is_published ? '#16a34a' : '#737373', fontFamily: 'Sora,sans-serif' }}>
                        {e.is_published ? 'Live' : 'Draft'}
                      </button>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex gap-2">
                        <button onClick={() => openEdit(e)} className="w-7 h-7 rounded-lg flex items-center justify-center" style={{ background: 'rgba(91,45,142,0.08)', color: '#5B2D8E' }}>
                          <i className="fas fa-edit text-[10px]" />
                        </button>
                        <button onClick={() => { if (window.confirm('Delete this entry?')) delMut.mutate(e.id) }}
                          className="w-7 h-7 rounded-lg flex items-center justify-center" style={{ background: 'rgba(220,38,38,0.08)', color: '#dc2626' }}>
                          <i className="fas fa-trash text-[10px]" />
                        </button>
                      </div>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="text-center py-16 rounded-3xl" style={{ background: 'rgba(91,45,142,0.02)', border: '1px dashed rgba(91,45,142,0.1)' }}>
          <i className="fas fa-star text-4xl mb-3 block" style={{ color: 'rgba(91,45,142,0.15)' }} />
          <h4 className="font-display font-semibold mb-2" style={{ color: '#737373' }}>No entries yet</h4>
          <button onClick={openAdd} className="btn-secondary !text-sm !py-2 !px-5 mt-2">Add First Entry</button>
        </div>
      )}

      {/* Modal */}
      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4"
          style={{ background: 'rgba(26,10,53,0.8)', backdropFilter: 'blur(8px)' }}
          onClick={e => e.target === e.currentTarget && closeForm()}>
          <div className="bg-white rounded-3xl w-full max-w-2xl max-h-[90vh] overflow-y-auto" style={{ boxShadow: '0 32px 80px rgba(26,10,53,0.25)' }}>
            <div className="px-7 pt-6 pb-4 border-b flex items-center justify-between" style={{ borderColor: 'rgba(91,45,142,0.08)' }}>
              <h3 className="font-display font-bold text-xl" style={{ color: '#1A0A35' }}>{editing ? 'Edit Entry' : 'Add Entry'}</h3>
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
                  <label className="label">Type *</label>
                  <select {...register('type', { required: true })} className="input">
                    <option value="memorial">In Memoriam</option>
                    <option value="hero">Village Hero</option>
                  </select>
                </div>
              </div>
              <div>
                <label className="label">Role / Title</label>
                <input {...register('role')} className="input" placeholder="e.g. Former Village Chief, Educator…" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="label">Birth Year</label>
                  <input type="number" {...register('birth_year')} className="input" placeholder="1940" />
                </div>
                <div>
                  <label className="label">Death Year</label>
                  <input type="number" {...register('death_year')} className="input" placeholder="2005" />
                </div>
              </div>
              <div>
                <label className="label">Bio</label>
                <textarea {...register('bio')} rows={4} className="input resize-none" placeholder="Life story and contributions…" />
              </div>
              <div>
                <label className="label">Achievements (comma-separated)</label>
                <input {...register('achievements')} className="input" placeholder="e.g. Built first school, Founded cooperative…" />
              </div>
              <div>
                <label className="label">Photo URL</label>
                <input {...register('photo_url')} className="input" placeholder="https://…" />
              </div>
              <div>
                <label className="label">Sort Order</label>
                <input type="number" {...register('sort_order')} className="input" placeholder="0" />
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
