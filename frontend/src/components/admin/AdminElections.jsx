import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from 'react-query'
import { useForm } from 'react-hook-form'
import { format } from 'date-fns'
import toast from 'react-hot-toast'
import api from '../../services/api'

const STATUS_OPTIONS = ['draft','nominations','voting','closed']
const STATUS_META = {
  draft:       { label: 'Draft',       color: '#A3A3A3', bg: 'rgba(163,163,163,0.1)' },
  nominations: { label: 'Nominations', color: '#0284c7', bg: 'rgba(2,132,199,0.1)'   },
  voting:      { label: 'Voting',      color: '#16a34a', bg: 'rgba(22,163,74,0.12)'  },
  closed:      { label: 'Closed',      color: '#737373', bg: 'rgba(115,115,115,0.1)' },
}

function ElectionForm({ election, onClose }) {
  const qc = useQueryClient()
  const isEdit = !!election
  const { register, handleSubmit, formState: { errors } } = useForm({
    defaultValues: election ? {
      ...election,
      startDate: election.startDate ? new Date(election.startDate).toISOString().slice(0,16) : '',
      endDate:   election.endDate   ? new Date(election.endDate).toISOString().slice(0,16)   : '',
    } : { type: 'leadership', status: 'draft', eligibility: 'all', maxWinners: 1 }
  })
  const mut = useMutation(
    d => isEdit ? api.patch(`/elections/${election.id}`, d) : api.post('/elections', d),
    {
      onSuccess: () => { qc.invalidateQueries('admin-elections'); toast.success(isEdit ? 'Updated!' : 'Created!'); onClose() },
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
              {isEdit ? 'Edit Election' : 'New Election'}
            </h3>
            <button onClick={onClose} className="w-9 h-9 rounded-full flex items-center justify-center hover:bg-gray-100"
              style={{ color: '#A3A3A3' }}><i className="fas fa-times"/></button>
          </div>
        </div>
        <form onSubmit={handleSubmit(d => mut.mutate(d))} className="p-7 space-y-4">
          <div>
            <label className="label">Title *</label>
            <input {...register('title', { required: 'Required' })} className="input" placeholder="e.g. Village Chief Election 2025"/>
            {errors.title && <p className="text-xs mt-1 text-red-500">{errors.title.message}</p>}
          </div>
          <div>
            <label className="label">Description</label>
            <textarea {...register('description')} rows={3} className="input resize-none" placeholder="Brief description of this election…"/>
          </div>
          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="label">Type</label>
              <select {...register('type')} className="input">
                <option value="leadership">Leadership</option>
                <option value="committee">Committee</option>
                <option value="general">General</option>
              </select>
            </div>
            <div>
              <label className="label">Status</label>
              <select {...register('status')} className="input">
                {STATUS_OPTIONS.map(s => <option key={s} value={s}>{STATUS_META[s].label}</option>)}
              </select>
            </div>
            <div>
              <label className="label">Winners</label>
              <input type="number" min="1" {...register('maxWinners')} className="input"/>
            </div>
          </div>
          <div>
            <label className="label">Voter Eligibility</label>
            <select {...register('eligibility')} className="input">
              <option value="all">All registered members</option>
              <option value="verified">Email-verified members only</option>
              <option value="approved">Admin-approved members only</option>
            </select>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="label">Voting Opens</label>
              <input type="datetime-local" {...register('startDate')} className="input"/>
            </div>
            <div>
              <label className="label">Voting Closes</label>
              <input type="datetime-local" {...register('endDate')} className="input"/>
            </div>
          </div>
          <div>
            <label className="label">Cover Image URL</label>
            <input {...register('coverImage')} className="input" placeholder="https://…"/>
          </div>
          <label className="flex items-center gap-2 text-sm cursor-pointer" style={{ fontFamily: 'Poppins,sans-serif' }}>
            <input type="checkbox" {...register('isPublished')} defaultChecked className="w-4 h-4 rounded accent-primary-500"/>
            Published (visible to community)
          </label>
          <div className="flex gap-3 pt-2">
            <button type="button" onClick={onClose}
              className="flex-1 py-3 rounded-2xl text-sm font-semibold"
              style={{ background: 'rgba(91,45,142,0.05)', color: '#737373', border: '1px solid rgba(91,45,142,0.1)' }}>
              Cancel
            </button>
            <button type="submit" disabled={mut.isLoading} className="btn-secondary flex-1 justify-center">
              {mut.isLoading ? <><i className="fas fa-spinner animate-spin"/>Saving…</> : <><i className="fas fa-save"/>Save</>}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

function CandidatesPanel({ election, onClose }) {
  const qc = useQueryClient()
  const { register, handleSubmit, reset } = useForm()
  const { register: regEdit, handleSubmit: handleEdit, reset: resetEdit } = useForm()
  const [activeTab, setActiveTab] = useState('list')
  const [editingCandidate, setEditingCandidate] = useState(null)

  const addMut = useMutation(
    d => api.post(`/elections/${election.id}/candidates`, d),
    {
      onSuccess: () => { qc.invalidateQueries('admin-elections'); qc.invalidateQueries(['election-results', election.id]); reset(); toast.success('Candidate added') },
      onError: e => toast.error(e.response?.data?.error || 'Failed'),
    }
  )
  const editMut = useMutation(
    ({ cid, data }) => api.patch(`/elections/${election.id}/candidates/${cid}`, data),
    {
      onSuccess: () => { qc.invalidateQueries('admin-elections'); setEditingCandidate(null); toast.success('Candidate updated') },
      onError: e => toast.error(e.response?.data?.error || 'Failed'),
    }
  )
  const removeMut = useMutation(
    cid => api.delete(`/elections/${election.id}/candidates/${cid}`),
    { onSuccess: () => { qc.invalidateQueries('admin-elections'); toast.success('Removed') } }
  )

  const { data: results = [] } = useQuery(
    ['election-results', election.id],
    () => api.get(`/elections/${election.id}/results`).then(r => r.data),
  )

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: 'rgba(26,10,53,0.8)', backdropFilter: 'blur(8px)' }}
      onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="bg-white rounded-3xl w-full max-w-2xl max-h-[92vh] overflow-y-auto"
        style={{ boxShadow: '0 32px 80px rgba(26,10,53,0.25)' }}>
        <div className="px-7 pt-6 pb-4 border-b sticky top-0 bg-white z-10"
          style={{ borderColor: 'rgba(91,45,142,0.08)' }}>
          <div className="flex items-center justify-between">
            <h3 className="font-display font-bold text-xl" style={{ color: '#1A0A35' }}>{election.title}</h3>
            <button onClick={onClose} className="w-9 h-9 rounded-full flex items-center justify-center hover:bg-gray-100"
              style={{ color: '#A3A3A3' }}><i className="fas fa-times"/></button>
          </div>
          <div className="flex gap-2 mt-3">
            {['list','add','results'].map(t => (
              <button key={t} onClick={() => setActiveTab(t)}
                className="text-xs font-semibold px-4 py-1.5 rounded-xl capitalize transition-all"
                style={{ background: activeTab === t ? '#5B2D8E' : 'rgba(91,45,142,0.07)', color: activeTab === t ? '#fff' : '#737373' }}>
                {t === 'list' ? 'Candidates' : t === 'add' ? 'Add Candidate' : 'Results'}
              </button>
            ))}
          </div>
        </div>

        <div className="p-7">
          {activeTab === 'list' && (
            <div className="space-y-3">
              {election.candidates?.length === 0 && (
                <p className="text-center py-10 text-sm" style={{ color: '#A3A3A3' }}>No candidates yet. Use "Add Candidate" tab.</p>
              )}
              {election.candidates?.map(c => (
                <div key={c.id}>
                  {editingCandidate === c.id ? (
                    /* ── Inline edit form ── */
                    <form onSubmit={handleEdit(d => editMut.mutate({ cid: c.id, data: d }))}
                      className="p-4 rounded-2xl space-y-3"
                      style={{ background: 'rgba(91,45,142,0.04)', border: '2px solid rgba(91,45,142,0.15)' }}>
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-xs font-bold uppercase tracking-wider" style={{ color: '#5B2D8E' }}>Editing: {c.name}</span>
                        <button type="button" onClick={() => setEditingCandidate(null)}
                          className="text-xs" style={{ color: '#A3A3A3' }}>Cancel</button>
                      </div>
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label className="label">Full Name *</label>
                          <input {...regEdit('name', { required: true })} defaultValue={c.name} className="input text-sm"/>
                        </div>
                        <div>
                          <label className="label">Photo URL</label>
                          <input {...regEdit('imageUrl')} defaultValue={c.imageUrl || ''} className="input text-sm" placeholder="https://…"/>
                        </div>
                      </div>
                      <div>
                        <label className="label">Bio</label>
                        <textarea {...regEdit('bio')} defaultValue={c.bio || ''} rows={2} className="input resize-none text-sm"/>
                      </div>
                      <div>
                        <label className="label">Manifesto / Statement</label>
                        <textarea {...regEdit('manifesto')} defaultValue={c.manifesto || ''} rows={2} className="input resize-none text-sm"/>
                      </div>
                      <button type="submit" disabled={editMut.isLoading} className="btn-secondary w-full justify-center !py-2 !text-xs">
                        {editMut.isLoading ? <><i className="fas fa-spinner animate-spin"/>Saving…</> : <><i className="fas fa-save"/>Save Changes</>}
                      </button>
                    </form>
                  ) : (
                    /* ── Candidate row ── */
                    <div className="flex items-center gap-3 p-3 rounded-2xl"
                      style={{ background: 'rgba(91,45,142,0.03)', border: '1px solid rgba(91,45,142,0.07)' }}>
                      {/* Photo */}
                      <div className="w-12 h-12 rounded-xl overflow-hidden flex-shrink-0"
                        style={{ background: 'linear-gradient(135deg,#5B2D8E,#7B4DB8)' }}>
                        {c.imageUrl || c.user?.avatarUrl
                          ? <img src={c.imageUrl || c.user?.avatarUrl} alt={c.name} className="w-full h-full object-cover object-top"/>
                          : <div className="w-full h-full flex items-center justify-center text-white text-sm font-bold">
                              {c.name[0]}
                            </div>}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="font-semibold text-sm" style={{ color: '#1A0A35' }}>{c.name}</div>
                        {c.bio && <div className="text-xs truncate" style={{ color: '#A3A3A3' }}>{c.bio}</div>}
                        {!c.imageUrl && !c.user?.avatarUrl && (
                          <div className="text-[10px] mt-0.5" style={{ color: '#F0A500' }}>
                            <i className="fas fa-exclamation-triangle mr-1"/>No photo — click edit to add
                          </div>
                        )}
                      </div>
                      <div className="flex gap-1 flex-shrink-0">
                        <button onClick={() => { setEditingCandidate(c.id); resetEdit() }}
                          className="w-8 h-8 rounded-lg flex items-center justify-center"
                          style={{ background: 'rgba(91,45,142,0.08)', color: '#5B2D8E' }}
                          title="Edit candidate">
                          <i className="fas fa-edit text-xs"/>
                        </button>
                        <button onClick={() => { if (confirm('Remove candidate?')) removeMut.mutate(c.id) }}
                          className="w-8 h-8 rounded-lg flex items-center justify-center"
                          style={{ background: 'rgba(220,38,38,0.08)', color: '#dc2626' }}>
                          <i className="fas fa-trash text-xs"/>
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}

          {activeTab === 'add' && (
            <form onSubmit={handleSubmit(d => addMut.mutate(d))} className="space-y-4">
              <div>
                <label className="label">Full Name *</label>
                <input {...register('name', { required: 'Required' })} className="input" placeholder="Candidate's full name"/>
              </div>
              <div>
                <label className="label">Bio</label>
                <textarea {...register('bio')} rows={3} className="input resize-none" placeholder="Brief background…"/>
              </div>
              <div>
                <label className="label">Manifesto / Statement</label>
                <textarea {...register('manifesto')} rows={3} className="input resize-none" placeholder="Campaign statement…"/>
              </div>
              <div>
                <label className="label">Photo URL</label>
                <input {...register('imageUrl')} className="input" placeholder="https://…"/>
              </div>
              <div>
                <label className="label">Link to Member Account (User ID, optional)</label>
                <input {...register('userId')} className="input" placeholder="Paste user ID if they have an account…"/>
              </div>
              <button type="submit" disabled={addMut.isLoading} className="btn-secondary w-full justify-center">
                {addMut.isLoading ? <><i className="fas fa-spinner animate-spin"/>Adding…</> : <><i className="fas fa-plus"/>Add Candidate</>}
              </button>
            </form>
          )}

          {activeTab === 'results' && (
            <div className="space-y-3">
              <div className="text-xs mb-4" style={{ color: '#A3A3A3', fontFamily: 'Poppins,sans-serif' }}>
                Total votes: <strong style={{ color: '#1A0A35' }}>{results.reduce((s, c) => s + (c._count?.votes || 0), 0)}</strong>
              </div>
              {results.map((c, i) => {
                const total = results.reduce((s, c) => s + (c._count?.votes || 0), 0)
                const votes = c._count?.votes || 0
                const pct   = total > 0 ? Math.round((votes / total) * 100) : 0
                return (
                  <div key={c.id} className="p-4 rounded-2xl" style={{ background: i === 0 && votes > 0 ? 'rgba(240,165,0,0.06)' : 'rgba(91,45,142,0.03)', border: `1px solid ${i === 0 && votes > 0 ? 'rgba(240,165,0,0.2)' : 'rgba(91,45,142,0.07)'}` }}>
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        {i === 0 && votes > 0 && <i className="fas fa-trophy text-sm" style={{ color: '#F0A500' }}/>}
                        <span className="font-semibold text-sm" style={{ color: '#1A0A35' }}>{c.name}</span>
                      </div>
                      <span className="text-sm font-bold" style={{ color: '#5B2D8E' }}>{votes} votes ({pct}%)</span>
                    </div>
                    <div className="h-2 rounded-full overflow-hidden" style={{ background: 'rgba(91,45,142,0.1)' }}>
                      <div className="h-full rounded-full"
                        style={{ width: `${pct}%`, background: i === 0 ? 'linear-gradient(90deg,#F0A500,#FFB84D)' : 'linear-gradient(90deg,#5B2D8E,#7B4DB8)' }}/>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default function AdminElections() {
  const qc = useQueryClient()
  const [showForm,       setShowForm]       = useState(false)
  const [editing,        setEditing]        = useState(null)
  const [managingCands,  setManagingCands]  = useState(null)
  const [statusFilter,   setStatusFilter]   = useState('')

  const { data: elections = [], isLoading } = useQuery(
    ['admin-elections', statusFilter],
    () => api.get('/elections/admin/all').then(r => statusFilter ? r.data.filter(e => e.status === statusFilter) : r.data)
  )

  const deleteMut = useMutation(id => api.delete(`/elections/${id}`), {
    onSuccess: () => { qc.invalidateQueries('admin-elections'); toast.success('Deleted') },
  })

  const quickStatus = useMutation(({ id, status }) => api.patch(`/elections/${id}`, { status }), {
    onSuccess: () => { qc.invalidateQueries('admin-elections'); toast.success('Status updated') },
    onError: () => toast.error('Failed'),
  })

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="font-display font-bold text-2xl" style={{ color: '#1A0A35' }}>Elections & Voting</h2>
          <p className="text-sm mt-0.5" style={{ color: '#737373', fontFamily: 'Poppins,sans-serif' }}>Manage community elections, candidates, and results</p>
        </div>
        <button onClick={() => { setEditing(null); setShowForm(true) }} className="btn-secondary">
          <i className="fas fa-plus"/>New Election
        </button>
      </div>

      {/* Status filters */}
      <div className="flex gap-2">
        {[['','All'],...STATUS_OPTIONS.map(s => [s, STATUS_META[s].label])].map(([v,l]) => (
          <button key={v} onClick={() => setStatusFilter(v)}
            className="text-xs font-semibold px-4 py-2 rounded-xl transition-all"
            style={{ background: statusFilter === v ? '#5B2D8E' : 'rgba(91,45,142,0.07)', color: statusFilter === v ? '#fff' : '#737373', fontFamily: 'Sora,sans-serif' }}>
            {l}
          </button>
        ))}
      </div>

      {isLoading ? (
        <div className="space-y-3">{[1,2,3].map(i => <div key={i} className="h-24 rounded-2xl animate-pulse" style={{ background: 'rgba(91,45,142,0.05)' }}/>)}</div>
      ) : !elections.length ? (
        <div className="text-center py-20 rounded-3xl" style={{ background: 'rgba(91,45,142,0.02)', border: '1px dashed rgba(91,45,142,0.12)' }}>
          <i className="fas fa-vote-yea text-5xl mb-4 block" style={{ color: 'rgba(91,45,142,0.18)' }}/>
          <h3 className="font-display font-bold text-xl mb-2" style={{ color: '#1A0A35' }}>No elections yet</h3>
          <button onClick={() => setShowForm(true)} className="btn-secondary mt-4 !text-sm">Create first election</button>
        </div>
      ) : (
        <div className="rounded-3xl overflow-hidden" style={{ background: '#fff', boxShadow: '0 2px 16px rgba(91,45,142,0.06)' }}>
          <table className="w-full text-sm">
            <thead style={{ background: 'rgba(91,45,142,0.04)' }}>
              <tr>
                {['Election','Type','Status','Eligibility','Candidates','Votes','Actions'].map(h => (
                  <th key={h} className="text-left px-5 py-3 text-xs font-bold uppercase tracking-widest"
                    style={{ color: '#5B2D8E', fontFamily: 'Sora,sans-serif' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {elections.map((e, i) => {
                const meta = STATUS_META[e.status] || STATUS_META.draft
                return (
                  <tr key={e.id} style={{ background: i % 2 === 0 ? 'transparent' : 'rgba(91,45,142,0.015)' }}>
                    <td className="px-5 py-4">
                      <div className="font-semibold text-sm" style={{ color: '#1A0A35' }}>{e.title}</div>
                      {e.endDate && <div className="text-xs mt-0.5" style={{ color: '#A3A3A3' }}>Ends {format(new Date(e.endDate), 'MMM d, yyyy')}</div>}
                    </td>
                    <td className="px-5 py-4 text-xs capitalize" style={{ color: '#737373' }}>{e.type}</td>
                    <td className="px-5 py-4">
                      <select value={e.status}
                        onChange={ev => quickStatus.mutate({ id: e.id, status: ev.target.value })}
                        className="text-xs font-bold px-2.5 py-1 rounded-full cursor-pointer border-0 outline-none"
                        style={{ background: meta.bg, color: meta.color }}>
                        {STATUS_OPTIONS.map(s => <option key={s} value={s}>{STATUS_META[s].label}</option>)}
                      </select>
                    </td>
                    <td className="px-5 py-4 text-xs capitalize" style={{ color: '#737373' }}>{e.eligibility}</td>
                    <td className="px-5 py-4 text-sm font-semibold" style={{ color: '#5B2D8E' }}>{e._count?.candidates || 0}</td>
                    <td className="px-5 py-4 text-sm font-semibold" style={{ color: '#1A0A35' }}>{e._count?.votes || 0}</td>
                    <td className="px-5 py-4">
                      <div className="flex gap-1">
                        <button onClick={() => setManagingCands(e)}
                          className="w-8 h-8 rounded-xl flex items-center justify-center"
                          style={{ background: 'rgba(91,45,142,0.08)', color: '#5B2D8E' }}
                          title="Manage candidates">
                          <i className="fas fa-users text-xs"/>
                        </button>
                        <button onClick={() => { setEditing(e); setShowForm(true) }}
                          className="w-8 h-8 rounded-xl flex items-center justify-center"
                          style={{ background: 'rgba(91,45,142,0.08)', color: '#5B2D8E' }}>
                          <i className="fas fa-edit text-xs"/>
                        </button>
                        <button onClick={() => { if (confirm('Delete election?')) deleteMut.mutate(e.id) }}
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

      {showForm && <ElectionForm election={editing} onClose={() => { setShowForm(false); setEditing(null) }}/>}
      {managingCands && <CandidatesPanel election={managingCands} onClose={() => setManagingCands(null)}/>}
    </div>
  )
}
