import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from 'react-query'
import { useForm } from 'react-hook-form'
import { format } from 'date-fns'
import toast from 'react-hot-toast'
import api from '../../services/api'

const LEVELS    = ['primary', 'secondary', 'university', 'vocational']
const STATUSES  = ['active', 'completed', 'suspended']
const CURRENCIES = ['XAF', 'USD', 'EUR', 'GBP', 'CAD']

function levelColor(l) {
  return { primary: '#2563eb', secondary: '#7c3aed', university: '#5B2D8E', vocational: '#d97706' }[l] || '#737373'
}
function statusColor(s) {
  return { active: '#16a34a', completed: '#737373', suspended: '#dc2626' }[s] || '#737373'
}

function AdminPrograms() {
  const qc = useQueryClient()
  const [showForm, setShowForm] = useState(false)
  const [viewApps, setViewApps] = useState(null) // program to view apps for
  const { register, handleSubmit, reset, formState: { errors } } = useForm()

  const { data: programs = [] } = useQuery('admin-scholarship-programs',
    () => api.get('/scholarship-programs').then(r => r.data))

  const { data: applications = [] } = useQuery(
    ['scholarship-apps', viewApps?.id],
    () => api.get(`/scholarship-programs/${viewApps.id}/applications`).then(r => r.data),
    { enabled: !!viewApps }
  )

  const saveMut = useMutation(
    data => api.post('/scholarship-programs', data),
    { onSuccess: () => { qc.invalidateQueries('admin-scholarship-programs'); toast.success('Program created!'); setShowForm(false); reset() } }
  )

  const toggleMut = useMutation(
    ({ id, isOpen }) => api.patch(`/scholarship-programs/${id}`, { isOpen: !isOpen }),
    { onSuccess: () => qc.invalidateQueries('admin-scholarship-programs') }
  )

  const reviewMut = useMutation(
    ({ programId, appId, status, reviewNote }) =>
      api.patch(`/scholarship-programs/${programId}/applications/${appId}`, { status, reviewNote }),
    { onSuccess: () => qc.invalidateQueries(['scholarship-apps', viewApps?.id]) }
  )

  const STATUS_COLORS = {
    pending:   { bg:'rgba(240,165,0,0.1)',  color:'#C87800' },
    reviewing: { bg:'rgba(59,130,246,0.1)', color:'#2563eb' },
    approved:  { bg:'rgba(22,163,74,0.1)',  color:'#16a34a' },
    rejected:  { bg:'rgba(220,38,38,0.1)',  color:'#dc2626' },
  }

  if (viewApps) return (
    <div>
      <button onClick={() => setViewApps(null)} className="flex items-center gap-2 text-sm font-semibold mb-6" style={{color:'#5B2D8E',fontFamily:'Sora,sans-serif'}}>
        <i className="fas fa-arrow-left text-xs"/>Back to Programs
      </button>
      <h3 className="font-display font-bold text-xl mb-1" style={{color:'#1A0A35'}}>Applications — {viewApps.title}</h3>
      <p className="text-xs mb-6" style={{color:'#A3A3A3',fontFamily:'Poppins,sans-serif'}}>{applications.length} applications received</p>

      {applications.length === 0 ? (
        <div className="text-center py-16 rounded-3xl" style={{background:'rgba(91,45,142,0.02)',border:'1px dashed rgba(91,45,142,0.1)'}}>
          <i className="fas fa-inbox text-4xl mb-3 block" style={{color:'rgba(91,45,142,0.12)'}}/>
          <p className="text-sm" style={{color:'#737373'}}>No applications yet</p>
        </div>
      ) : (
        <div className="space-y-3">
          {applications.map(app => {
            const sc = STATUS_COLORS[app.status] || STATUS_COLORS.pending
            return (
              <div key={app.id} className="rounded-2xl p-5" style={{background:'#fff',border:'1px solid rgba(91,45,142,0.08)'}}>
                <div className="flex items-start justify-between gap-4 flex-wrap">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-semibold text-sm" style={{color:'#1A0A35',fontFamily:'Sora,sans-serif'}}>{app.fullName}</span>
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full" style={{background:sc.bg,color:sc.color}}>{app.status}</span>
                    </div>
                    <p className="text-xs" style={{color:'#737373',fontFamily:'Poppins,sans-serif'}}>{app.email} · {app.school} · {app.level}</p>
                    {app.motivation && <p className="text-xs mt-2 line-clamp-2" style={{color:'#4B4B6B',fontFamily:'Poppins,sans-serif'}}>{app.motivation}</p>}
                  </div>
                  <div className="flex gap-2 flex-shrink-0">
                    {app.status === 'pending' || app.status === 'reviewing' ? (
                      <>
                        <button onClick={() => reviewMut.mutate({programId:viewApps.id,appId:app.id,status:'approved'})}
                          className="text-xs font-semibold px-3 py-2 rounded-xl"
                          style={{background:'rgba(22,163,74,0.1)',color:'#16a34a'}}>
                          <i className="fas fa-check mr-1"/>Approve
                        </button>
                        <button onClick={() => reviewMut.mutate({programId:viewApps.id,appId:app.id,status:'rejected'})}
                          className="text-xs font-semibold px-3 py-2 rounded-xl"
                          style={{background:'rgba(220,38,38,0.1)',color:'#dc2626'}}>
                          <i className="fas fa-times mr-1"/>Reject
                        </button>
                      </>
                    ) : (
                      <button onClick={() => reviewMut.mutate({programId:viewApps.id,appId:app.id,status:'reviewing'})}
                        className="text-xs font-semibold px-3 py-2 rounded-xl"
                        style={{background:'rgba(91,45,142,0.08)',color:'#5B2D8E'}}>
                        Reset to Review
                      </button>
                    )}
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h3 className="font-display font-bold text-xl" style={{color:'#1A0A35'}}>Scholarship Programs</h3>
        <button onClick={() => setShowForm(true)} className="btn-secondary !py-2 !px-4 !text-xs">
          <i className="fas fa-plus text-[10px]"/>New Program
        </button>
      </div>

      {programs.length === 0 ? (
        <div className="text-center py-16 rounded-3xl" style={{background:'rgba(91,45,142,0.02)',border:'1px dashed rgba(91,45,142,0.1)'}}>
          <i className="fas fa-scroll text-4xl mb-3 block" style={{color:'rgba(91,45,142,0.12)'}}/>
          <p className="text-sm" style={{color:'#737373'}}>No programs yet</p>
        </div>
      ) : (
        <div className="grid md:grid-cols-2 gap-4">
          {programs.map(p => (
            <div key={p.id} className="rounded-2xl p-5" style={{background:'#fff',border:'1px solid rgba(91,45,142,0.08)'}}>
              <div className="flex items-start justify-between gap-2 mb-2">
                <h4 className="font-semibold text-sm" style={{color:'#1A0A35',fontFamily:'Sora,sans-serif'}}>{p.title}</h4>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full flex-shrink-0"
                  style={{background:p.isOpen?'rgba(22,163,74,0.1)':'rgba(163,163,163,0.1)',color:p.isOpen?'#16a34a':'#737373'}}>
                  {p.isOpen ? 'Open' : 'Closed'}
                </span>
              </div>
              <p className="text-xs mb-3 line-clamp-2" style={{color:'#737373',fontFamily:'Poppins,sans-serif'}}>{p.description}</p>
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold" style={{color:'#5B2D8E',fontFamily:'Sora,sans-serif'}}>
                  {p._count?.applications || 0} applications
                </span>
                <div className="flex gap-2">
                  <button onClick={() => toggleMut.mutate(p)} className="text-xs font-semibold px-3 py-1.5 rounded-xl"
                    style={{background:'rgba(91,45,142,0.08)',color:'#5B2D8E'}}>
                    {p.isOpen ? 'Close' : 'Open'}
                  </button>
                  <button onClick={() => setViewApps(p)} className="text-xs font-semibold px-3 py-1.5 rounded-xl"
                    style={{background:'rgba(240,165,0,0.1)',color:'#C87800'}}>
                    View Apps
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4"
          style={{background:'rgba(26,10,53,0.8)',backdropFilter:'blur(8px)'}}
          onClick={e => e.target === e.currentTarget && setShowForm(false)}>
          <div className="bg-white rounded-3xl w-full max-w-lg" style={{boxShadow:'0 32px 80px rgba(26,10,53,0.25)'}}>
            <div className="px-7 pt-6 pb-4 border-b flex items-center justify-between" style={{borderColor:'rgba(91,45,142,0.08)'}}>
              <h3 className="font-display font-bold text-xl" style={{color:'#1A0A35'}}>New Scholarship Program</h3>
              <button onClick={() => setShowForm(false)} className="w-9 h-9 rounded-full flex items-center justify-center hover:bg-gray-100" style={{color:'#A3A3A3'}}><i className="fas fa-times"/></button>
            </div>
            <form onSubmit={handleSubmit(d => saveMut.mutate(d))} className="p-7 space-y-4">
              <div>
                <label className="label">Title *</label>
                <input {...register('title', {required:'Required'})} className="input" placeholder="e.g. 2025 NDCA University Scholarship"/>
                {errors.title && <p className="text-xs mt-1" style={{color:'#dc2626'}}>{errors.title.message}</p>}
              </div>
              <div>
                <label className="label">Description *</label>
                <textarea {...register('description', {required:'Required'})} rows={3} className="input resize-none"/>
                {errors.description && <p className="text-xs mt-1" style={{color:'#dc2626'}}>{errors.description.message}</p>}
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="label">Academic Year *</label>
                  <input {...register('academicYear', {required:'Required'})} className="input" placeholder="2025–2026"/>
                </div>
                <div>
                  <label className="label">Level</label>
                  <select {...register('level')} className="input">
                    {['primary','secondary','university','vocational'].map(l => <option key={l} value={l}>{l}</option>)}
                  </select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="label">Slots Available</label>
                  <input type="number" {...register('slots')} className="input" defaultValue={1} min={1}/>
                </div>
                <div>
                  <label className="label">Deadline</label>
                  <input type="date" {...register('deadline')} className="input"/>
                </div>
              </div>
              <div>
                <label className="label">Eligibility Criteria</label>
                <textarea {...register('eligibility')} rows={2} className="input resize-none" placeholder="Who can apply?"/>
              </div>
              <div>
                <label className="label">Benefits</label>
                <input {...register('benefits')} className="input" placeholder="e.g. Full tuition + monthly stipend"/>
              </div>
              <div className="flex gap-3 pt-2">
                <button type="button" onClick={() => setShowForm(false)} className="flex-1 py-3 rounded-2xl text-sm font-semibold"
                  style={{background:'rgba(91,45,142,0.05)',color:'#737373',border:'1px solid rgba(91,45,142,0.1)',fontFamily:'Sora,sans-serif'}}>Cancel</button>
                <button type="submit" disabled={saveMut.isLoading} className="btn-secondary flex-1 justify-center">
                  {saveMut.isLoading ? <><i className="fas fa-spinner animate-spin"/>Saving…</> : <><i className="fas fa-plus"/>Create Program</>}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}

export default function AdminScholarships() {
  const qc = useQueryClient()
  const [tab, setTab] = useState('scholars')
  const [showForm, setShowForm] = useState(false)
  const [editing, setEditing] = useState(null)
  const { register, handleSubmit, reset, setValue, formState: { errors } } = useForm()

  const { data: scholarships = [], isLoading } = useQuery(
    'admin-scholarships',
    () => api.get('/scholarships').then(r => r.data)
  )

  const saveMut = useMutation(
    data => editing ? api.patch(`/scholarships/${editing.id}`, data) : api.post('/scholarships', data),
    {
      onSuccess: () => {
        qc.invalidateQueries('admin-scholarships')
        toast.success(editing ? 'Scholarship updated!' : 'Scholarship added!')
        setShowForm(false); setEditing(null); reset()
      },
      onError: () => toast.error('Save failed'),
    }
  )

  const delMut = useMutation(id => api.delete(`/scholarships/${id}`), {
    onSuccess: () => { qc.invalidateQueries('admin-scholarships'); toast.success('Deleted') },
    onError:   () => toast.error('Delete failed'),
  })

  function openAdd() { setEditing(null); reset({}); setShowForm(true) }
  function openEdit(s) { setEditing(s); Object.entries(s).forEach(([k, v]) => setValue(k, v)); setShowForm(true) }
  function closeForm() { setShowForm(false); setEditing(null); reset() }

  const total     = scholarships.length
  const active    = scholarships.filter(s => s.status === 'active').length
  const completed = scholarships.filter(s => s.status === 'completed').length

  return (
    <div>
      {/* Tabs */}
      <div className="flex gap-2 mb-6">
        {[['scholars','Current Scholars','fa-graduation-cap'],['programs','Programs & Applications','fa-scroll']].map(([val,label,icon]) => (
          <button key={val} onClick={() => setTab(val)}
            className="flex items-center gap-2 px-4 py-2 rounded-full text-sm font-semibold transition-all"
            style={{
              background: tab === val ? 'linear-gradient(135deg,#5B2D8E,#7B4DB8)' : '#fff',
              color: tab === val ? '#fff' : '#5B2D8E',
              boxShadow: '0 2px 8px rgba(91,45,142,0.1)',
              fontFamily: 'Sora,sans-serif',
            }}>
            <i className={`fas ${icon} text-xs`}/>{label}
          </button>
        ))}
      </div>

      {tab === 'programs' && <AdminPrograms/>}
      {tab === 'scholars' && <>

      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl flex items-center justify-center" style={{ background: 'linear-gradient(135deg,#5B2D8E,#7B4DB8)' }}>
            <i className="fas fa-graduation-cap text-sm text-white" />
          </div>
          <div>
            <h2 className="font-display font-bold text-xl" style={{ color: '#1A0A35' }}>Scholarships</h2>
            <p className="text-xs" style={{ color: '#A3A3A3', fontFamily: 'Poppins,sans-serif' }}>{active} active · {total} total</p>
          </div>
        </div>
        <button onClick={openAdd} className="btn-secondary !py-2 !px-4 !text-xs">
          <i className="fas fa-plus text-[10px]" />Add Scholarship
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        {[
          { label: 'Total',     value: total,     icon: 'fa-graduation-cap', color: '#5B2D8E' },
          { label: 'Active',    value: active,    icon: 'fa-check-circle',   color: '#16a34a' },
          { label: 'Completed', value: completed, icon: 'fa-flag-checkered', color: '#737373' },
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

      {/* Table */}
      {isLoading ? (
        <div className="space-y-3">{[1,2,3].map(i => <div key={i} className="h-20 rounded-2xl animate-pulse" style={{ background: 'rgba(91,45,142,0.04)' }} />)}</div>
      ) : scholarships.length ? (
        <div className="card overflow-hidden">
          <table className="w-full">
            <thead>
              <tr style={{ borderBottom: '1px solid rgba(91,45,142,0.08)' }}>
                {['Scholar', 'School', 'Level', 'Year', 'Amount', 'Sponsor', 'Status', 'Actions'].map(h => (
                  <th key={h} className="px-4 py-3 text-left text-xs font-bold uppercase tracking-wider" style={{ color: '#A3A3A3', fontFamily: 'Sora,sans-serif' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {scholarships.map((s, i) => (
                <tr key={s.id} style={{ borderBottom: i < scholarships.length - 1 ? '1px solid rgba(91,45,142,0.05)' : 'none' }} className="hover:bg-purple-50/30 transition-colors">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      {s.photo_url
                        ? <img src={s.photo_url} alt={s.name} className="w-9 h-9 rounded-xl object-cover flex-shrink-0" />
                        : <div className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 text-white text-xs font-bold" style={{ background: 'linear-gradient(135deg,#5B2D8E,#7B4DB8)' }}>{s.name?.[0]}</div>}
                      <p className="font-display font-semibold text-sm" style={{ color: '#1A0A35' }}>{s.name}</p>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-sm" style={{ color: '#404040', fontFamily: 'Poppins,sans-serif' }}>{s.school}</td>
                  <td className="px-4 py-3">
                    <span className="text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full capitalize"
                      style={{ background: `${levelColor(s.level)}18`, color: levelColor(s.level), fontFamily: 'Sora,sans-serif' }}>
                      {s.level}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-sm" style={{ color: '#404040', fontFamily: 'Poppins,sans-serif' }}>{s.year}</td>
                  <td className="px-4 py-3 text-sm font-semibold" style={{ color: '#1A0A35', fontFamily: 'Sora,sans-serif' }}>
                    {s.amount ? `${s.currency || 'XAF'} ${Number(s.amount).toLocaleString()}` : '—'}
                  </td>
                  <td className="px-4 py-3 text-sm" style={{ color: '#404040', fontFamily: 'Poppins,sans-serif' }}>{s.sponsor_name || '—'}</td>
                  <td className="px-4 py-3">
                    <span className="text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full capitalize"
                      style={{ background: `${statusColor(s.status)}18`, color: statusColor(s.status), fontFamily: 'Sora,sans-serif' }}>
                      {s.status}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex gap-2">
                      <button onClick={() => openEdit(s)} className="w-7 h-7 rounded-lg flex items-center justify-center" style={{ background: 'rgba(91,45,142,0.08)', color: '#5B2D8E' }}>
                        <i className="fas fa-edit text-[10px]" />
                      </button>
                      <button onClick={() => { if (window.confirm('Delete this scholarship?')) delMut.mutate(s.id) }}
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
          <i className="fas fa-graduation-cap text-4xl mb-3 block" style={{ color: 'rgba(91,45,142,0.15)' }} />
          <h4 className="font-display font-semibold mb-2" style={{ color: '#737373' }}>No scholarships yet</h4>
          <button onClick={openAdd} className="btn-secondary !text-sm !py-2 !px-5 mt-2">Add First Scholarship</button>
        </div>
      )}

      {/* Modal */}
      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4"
          style={{ background: 'rgba(26,10,53,0.8)', backdropFilter: 'blur(8px)' }}
          onClick={e => e.target === e.currentTarget && closeForm()}>
          <div className="bg-white rounded-3xl w-full max-w-2xl max-h-[90vh] overflow-y-auto" style={{ boxShadow: '0 32px 80px rgba(26,10,53,0.25)' }}>
            <div className="px-7 pt-6 pb-4 border-b flex items-center justify-between" style={{ borderColor: 'rgba(91,45,142,0.08)' }}>
              <h3 className="font-display font-bold text-xl" style={{ color: '#1A0A35' }}>{editing ? 'Edit Scholarship' : 'Add Scholarship'}</h3>
              <button onClick={closeForm} className="w-9 h-9 rounded-full flex items-center justify-center hover:bg-gray-100" style={{ color: '#A3A3A3' }}>
                <i className="fas fa-times" />
              </button>
            </div>
            <form onSubmit={handleSubmit(d => saveMut.mutate(d))} className="p-7 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="label">Scholar Name *</label>
                  <input {...register('name', { required: true })} className="input" placeholder="Full name" />
                </div>
                <div>
                  <label className="label">School *</label>
                  <input {...register('school', { required: true })} className="input" placeholder="School / University" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="label">Level</label>
                  <select {...register('level')} className="input">
                    <option value="">Select…</option>
                    {LEVELS.map(l => <option key={l} value={l} className="capitalize">{l.charAt(0).toUpperCase()+l.slice(1)}</option>)}
                  </select>
                </div>
                <div>
                  <label className="label">Subject / Field</label>
                  <input {...register('subject')} className="input" placeholder="e.g. Engineering" />
                </div>
              </div>
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="label">Year</label>
                  <input type="number" {...register('year')} className="input" placeholder={new Date().getFullYear()} />
                </div>
                <div>
                  <label className="label">Amount</label>
                  <input type="number" {...register('amount')} className="input" placeholder="500000" />
                </div>
                <div>
                  <label className="label">Currency</label>
                  <select {...register('currency')} className="input">
                    {CURRENCIES.map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="label">Sponsor Name</label>
                  <input {...register('sponsor_name')} className="input" placeholder="e.g. Ngiesang Foundation" />
                </div>
                <div>
                  <label className="label">Status</label>
                  <select {...register('status')} className="input">
                    {STATUSES.map(s => <option key={s} value={s} className="capitalize">{s.charAt(0).toUpperCase()+s.slice(1)}</option>)}
                  </select>
                </div>
              </div>
              <div>
                <label className="label">Bio / Notes</label>
                <textarea {...register('bio')} rows={3} className="input resize-none" placeholder="Scholar bio or notes…" />
              </div>
              <div>
                <label className="label">Photo URL</label>
                <input {...register('photo_url')} className="input" placeholder="https://…" />
              </div>
              <div>
                <label className="label">Sort Order</label>
                <input type="number" {...register('sort_order')} className="input" placeholder="0" />
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
      </>}
    </div>
  )
}
