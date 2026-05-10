import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from 'react-query'
import { useForm } from 'react-hook-form'
import toast from 'react-hot-toast'
import api from '../../services/api'

const CATEGORIES = [
  { key: 'agriculture', label: 'Agriculture' },
  { key: 'crafts',      label: 'Crafts' },
  { key: 'retail',      label: 'Retail' },
  { key: 'services',    label: 'Services' },
  { key: 'tech',        label: 'Tech' },
  { key: 'health',      label: 'Health' },
  { key: 'education',   label: 'Education' },
  { key: 'construction',label: 'Construction' },
  { key: 'food',        label: 'Food' },
  { key: 'other',       label: 'Other' },
]

export default function AdminDirectory() {
  const qc = useQueryClient()
  const [showForm, setShowForm] = useState(false)
  const [editing, setEditing] = useState(null)
  const [tab, setTab] = useState('all') // 'all' | 'pending'
  const { register, handleSubmit, reset, setValue, formState: { errors } } = useForm()

  const { data: businesses = [], isLoading } = useQuery(
    'admin-businesses',
    () => api.get('/businesses/all').then(r => r.data)
  )

  const saveMut = useMutation(
    data => editing ? api.patch(`/businesses/${editing.id}`, data) : api.post('/businesses', data),
    {
      onSuccess: () => {
        qc.invalidateQueries('admin-businesses')
        toast.success(editing ? 'Business updated!' : 'Business added!')
        setShowForm(false); setEditing(null); reset()
      },
      onError: () => toast.error('Save failed'),
    }
  )

  const delMut = useMutation(id => api.delete(`/businesses/${id}`), {
    onSuccess: () => { qc.invalidateQueries('admin-businesses'); toast.success('Deleted') },
    onError:   () => toast.error('Delete failed'),
  })

  const approveMut = useMutation(id => api.patch(`/businesses/${id}`, { is_approved: true }), {
    onSuccess: () => { qc.invalidateQueries('admin-businesses'); toast.success('Business approved!') },
    onError:   () => toast.error('Approval failed'),
  })

  function openAdd() { setEditing(null); reset({}); setShowForm(true) }
  function openEdit(b) { setEditing(b); Object.entries(b).forEach(([k,v]) => setValue(k,v)); setShowForm(true) }
  function closeForm() { setShowForm(false); setEditing(null); reset() }

  const total    = businesses.length
  const approved = businesses.filter(b => b.is_approved).length
  const pending  = businesses.filter(b => !b.is_approved).length
  const diaspora = businesses.filter(b => b.is_diaspora).length

  const displayed = tab === 'pending' ? businesses.filter(b => !b.is_approved) : businesses

  return (
    <div>
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl flex items-center justify-center" style={{ background: 'linear-gradient(135deg,#5B2D8E,#7B4DB8)' }}>
            <i className="fas fa-store text-sm text-white" />
          </div>
          <div>
            <h2 className="font-display font-bold text-xl" style={{ color: '#1A0A35' }}>Business Directory</h2>
            <p className="text-xs" style={{ color: '#A3A3A3', fontFamily: 'Poppins,sans-serif' }}>{approved} approved · {pending} pending</p>
          </div>
        </div>
        <button onClick={openAdd} className="btn-secondary !py-2 !px-4 !text-xs">
          <i className="fas fa-plus text-[10px]" />Add Business
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        {[
          { label: 'Total',    value: total,    icon: 'fa-store',        color: '#5B2D8E' },
          { label: 'Approved', value: approved, icon: 'fa-check-circle', color: '#16a34a' },
          { label: 'Pending',  value: pending,  icon: 'fa-clock',        color: '#d97706' },
          { label: 'Diaspora', value: diaspora, icon: 'fa-globe-africa', color: '#2563eb' },
        ].map(s => (
          <div key={s.label} className="stat-card">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ background: `${s.color}18` }}>
                <i className={`fas ${s.icon} text-sm`} style={{ color: s.color }} />
              </div>
              <div>
                <div className="font-display font-bold text-xl" style={{ color: '#1A0A35' }}>{s.value}</div>
                <div className="text-xs" style={{ color: '#A3A3A3', fontFamily: 'Poppins,sans-serif' }}>{s.label}</div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Tabs */}
      <div className="flex gap-1 mb-4 p-1 rounded-2xl w-fit" style={{ background: 'rgba(91,45,142,0.06)' }}>
        {[{ k: 'all', label: `All (${total})` }, { k: 'pending', label: `Pending (${pending})` }].map(t => (
          <button key={t.k} onClick={() => setTab(t.k)}
            className="px-5 py-2 rounded-xl text-xs font-semibold transition-all"
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
                {['Business', 'Category', 'Owner', 'Location', 'Flags', 'Status', 'Actions'].map(h => (
                  <th key={h} className="px-4 py-3 text-left text-xs font-bold uppercase tracking-wider" style={{ color: '#A3A3A3', fontFamily: 'Sora,sans-serif' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {displayed.map((b, i) => (
                <tr key={b.id} style={{ borderBottom: i < displayed.length - 1 ? '1px solid rgba(91,45,142,0.05)' : 'none' }} className="hover:bg-purple-50/30 transition-colors">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      {b.logo_url
                        ? <img src={b.logo_url} alt={b.name} className="w-9 h-9 rounded-xl object-cover flex-shrink-0" />
                        : <div className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: 'rgba(91,45,142,0.1)' }}><i className="fas fa-store text-sm" style={{ color: '#5B2D8E' }} /></div>}
                      <div>
                        <p className="font-display font-semibold text-sm" style={{ color: '#1A0A35' }}>{b.name}</p>
                        {b.phone && <p className="text-xs" style={{ color: '#A3A3A3', fontFamily: 'Poppins,sans-serif' }}>{b.phone}</p>}
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <span className="text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full capitalize"
                      style={{ background: 'rgba(91,45,142,0.08)', color: '#5B2D8E', fontFamily: 'Sora,sans-serif' }}>
                      {b.category}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-sm" style={{ color: '#404040', fontFamily: 'Poppins,sans-serif' }}>{b.owner_name || b.ownerName || '—'}</td>
                  <td className="px-4 py-3 text-sm" style={{ color: '#404040', fontFamily: 'Poppins,sans-serif' }}>
                    {[b.city, b.country].filter(Boolean).join(', ') || '—'}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex gap-1">
                      {(b.is_diaspora || b.isDiaspora) && <span className="text-[10px] font-bold px-2 py-0.5 rounded-full" style={{ background: 'rgba(37,99,235,0.1)', color: '#2563eb', fontFamily: 'Sora,sans-serif' }}>Diaspora</span>}
                      {(b.is_featured || b.isFeatured) && <span className="text-[10px] font-bold px-2 py-0.5 rounded-full" style={{ background: 'rgba(240,165,0,0.15)', color: '#B07A00', fontFamily: 'Sora,sans-serif' }}>Featured</span>}
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    {(b.is_approved || b.isApproved) ? (
                      <span className="text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full" style={{ background: 'rgba(22,163,74,0.1)', color: '#16a34a', fontFamily: 'Sora,sans-serif' }}>Approved</span>
                    ) : (
                      <button onClick={() => approveMut.mutate(b.id)}
                        className="text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full transition-all hover:opacity-80"
                        style={{ background: 'rgba(217,119,6,0.1)', color: '#d97706', fontFamily: 'Sora,sans-serif' }}>
                        <i className="fas fa-check mr-1" />Approve
                      </button>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex gap-2">
                      <button onClick={() => openEdit(b)} className="w-7 h-7 rounded-lg flex items-center justify-center" style={{ background: 'rgba(91,45,142,0.08)', color: '#5B2D8E' }}>
                        <i className="fas fa-edit text-[10px]" />
                      </button>
                      <button onClick={() => { if (window.confirm('Delete this business?')) delMut.mutate(b.id) }}
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
          <i className="fas fa-store text-4xl mb-3 block" style={{ color: 'rgba(91,45,142,0.15)' }} />
          <h4 className="font-display font-semibold mb-2" style={{ color: '#737373' }}>{tab === 'pending' ? 'No pending businesses' : 'No businesses yet'}</h4>
          {tab === 'all' && <button onClick={openAdd} className="btn-secondary !text-sm !py-2 !px-5 mt-2">Add First Business</button>}
        </div>
      )}

      {/* Modal */}
      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4"
          style={{ background: 'rgba(26,10,53,0.8)', backdropFilter: 'blur(8px)' }}
          onClick={e => e.target === e.currentTarget && closeForm()}>
          <div className="bg-white rounded-3xl w-full max-w-2xl max-h-[90vh] overflow-y-auto" style={{ boxShadow: '0 32px 80px rgba(26,10,53,0.25)' }}>
            <div className="px-7 pt-6 pb-4 border-b flex items-center justify-between" style={{ borderColor: 'rgba(91,45,142,0.08)' }}>
              <h3 className="font-display font-bold text-xl" style={{ color: '#1A0A35' }}>{editing ? 'Edit Business' : 'Add Business'}</h3>
              <button onClick={closeForm} className="w-9 h-9 rounded-full flex items-center justify-center hover:bg-gray-100" style={{ color: '#A3A3A3' }}>
                <i className="fas fa-times" />
              </button>
            </div>
            <form onSubmit={handleSubmit(d => saveMut.mutate(d))} className="p-7 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="label">Business Name *</label>
                  <input {...register('name', { required: true })} className="input" placeholder="Name" />
                </div>
                <div>
                  <label className="label">Category *</label>
                  <select {...register('category', { required: true })} className="input">
                    <option value="">Select…</option>
                    {CATEGORIES.map(c => <option key={c.key} value={c.key}>{c.label}</option>)}
                  </select>
                </div>
              </div>
              <div>
                <label className="label">Description</label>
                <textarea {...register('description')} rows={2} className="input resize-none" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="label">Owner Name</label>
                  <input {...register('owner_name')} className="input" placeholder="Owner full name" />
                </div>
                <div>
                  <label className="label">Location / Address</label>
                  <input {...register('location')} className="input" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="label">Country</label>
                  <input {...register('country')} className="input" placeholder="Cameroon" />
                </div>
                <div>
                  <label className="label">City</label>
                  <input {...register('city')} className="input" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="label">Phone</label>
                  <input {...register('phone')} className="input" />
                </div>
                <div>
                  <label className="label">Email</label>
                  <input type="email" {...register('email')} className="input" />
                </div>
              </div>
              <div>
                <label className="label">Website</label>
                <input {...register('website')} className="input" placeholder="https://…" />
              </div>
              <div>
                <label className="label">Logo URL</label>
                <input {...register('logo_url')} className="input" placeholder="https://…" />
              </div>
              <div>
                <label className="label">Sort Order</label>
                <input type="number" {...register('sort_order')} className="input" placeholder="0" />
              </div>
              <div className="space-y-2.5">
                {[
                  { name: 'is_diaspora',  label: 'Diaspora Business' },
                  { name: 'is_approved',  label: 'Approved' },
                  { name: 'is_featured',  label: 'Featured' },
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
