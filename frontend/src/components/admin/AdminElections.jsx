import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from 'react-query'
import { useForm } from 'react-hook-form'
import { format } from 'date-fns'
import toast from 'react-hot-toast'
import api from '../../services/api'
import { cn } from '../../lib/utils'
import { Card } from '../ui/card'
import { Badge } from '../ui/badge'
import { Progress } from '../ui/progress'

const STATUS_OPTIONS = ['draft', 'nominations', 'voting', 'closed']
const STATUS_VARIANT_MAP = {
  draft: 'secondary', nominations: 'default', voting: 'active', closed: 'secondary'
}
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
      startDate: election.startDate ? new Date(election.startDate).toISOString().slice(0, 16) : '',
      endDate:   election.endDate   ? new Date(election.endDate).toISOString().slice(0, 16)   : '',
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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-dark/80 backdrop-blur-sm"
      onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="bg-white rounded-3xl w-full max-w-lg max-h-[92vh] overflow-y-auto shadow-[0_32px_80px_rgba(26,10,53,0.25)]">
        <div className="px-7 pt-6 pb-4 border-b border-primary-500/8 sticky top-0 bg-white z-10">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-xl text-dark">{isEdit ? 'Edit Election' : 'New Election'}</h3>
            <button onClick={onClose} className="w-9 h-9 rounded-full flex items-center justify-center hover:bg-gray-100 text-muted-foreground">
              <i className="fas fa-times"/>
            </button>
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
          <label className="flex items-center gap-2 text-sm cursor-pointer">
            <input type="checkbox" {...register('isPublished')} defaultChecked className="w-4 h-4 rounded accent-primary-500"/>
            Published (visible to community)
          </label>
          <div className="flex gap-3 pt-2">
            <button type="button" onClick={onClose}
              className="flex-1 py-3 rounded-2xl text-sm font-semibold border border-primary-500/10 text-muted-foreground bg-primary-50">
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

  const { data: candidates = [], isLoading: loadingCands } = useQuery(
    ['election-candidates', election.id],
    () => api.get(`/elections/${election.id}/candidates`).then(r => r.data),
  )

  const addMut = useMutation(
    d => api.post(`/elections/${election.id}/candidates`, d),
    {
      onSuccess: () => {
        qc.invalidateQueries('admin-elections')
        qc.invalidateQueries(['election-candidates', election.id])
        qc.invalidateQueries(['election-results', election.id])
        reset()
        toast.success('Candidate added')
      },
      onError: e => toast.error(e.response?.data?.error || 'Failed'),
    }
  )
  const editMut = useMutation(
    ({ cid, data }) => api.patch(`/elections/${election.id}/candidates/${cid}`, data),
    {
      onSuccess: () => {
        qc.invalidateQueries('admin-elections')
        qc.invalidateQueries(['election-candidates', election.id])
        setEditingCandidate(null)
        toast.success('Candidate updated')
      },
      onError: e => toast.error(e.response?.data?.error || 'Failed'),
    }
  )
  const removeMut = useMutation(
    cid => api.delete(`/elections/${election.id}/candidates/${cid}`),
    { onSuccess: () => { qc.invalidateQueries('admin-elections'); qc.invalidateQueries(['election-candidates', election.id]); toast.success('Removed') } }
  )

  const { data: results = [] } = useQuery(
    ['election-results', election.id],
    () => api.get(`/elections/${election.id}/results`).then(r => r.data),
  )

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-dark/80 backdrop-blur-sm"
      onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="bg-white rounded-3xl w-full max-w-2xl max-h-[92vh] overflow-y-auto shadow-[0_32px_80px_rgba(26,10,53,0.25)]">
        <div className="px-7 pt-6 pb-4 border-b border-primary-500/8 sticky top-0 bg-white z-10">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-xl text-dark">{election.title}</h3>
            <button onClick={onClose} className="w-9 h-9 rounded-full flex items-center justify-center hover:bg-gray-100 text-muted-foreground">
              <i className="fas fa-times"/>
            </button>
          </div>
          <div className="flex gap-2 mt-3">
            {['list', 'add', 'results'].map(t => (
              <button key={t} onClick={() => setActiveTab(t)}
                className={cn('text-xs font-semibold px-4 py-1.5 rounded-xl capitalize transition-all',
                  activeTab === t ? 'bg-primary-500 text-white' : 'bg-primary-50 text-muted-foreground hover:text-primary-500')}>
                {t === 'list' ? 'Candidates' : t === 'add' ? 'Add Candidate' : 'Results'}
              </button>
            ))}
          </div>
        </div>

        <div className="p-7">
          {activeTab === 'list' && (
            <div className="space-y-3">
              {loadingCands && <p className="text-center py-10 text-sm text-muted-foreground">Loading candidates…</p>}
              {!loadingCands && candidates.length === 0 && (
                <div className="text-center py-10">
                  <i className="fas fa-users text-4xl mb-3 block text-primary-500/15"/>
                  <p className="text-sm text-muted-foreground">No candidates yet. Use "Add Candidate" tab.</p>
                </div>
              )}
              {candidates.map(c => (
                <div key={c.id}>
                  {editingCandidate === c.id ? (
                    <form onSubmit={handleEdit(d => editMut.mutate({ cid: c.id, data: d }))}
                      className="p-4 rounded-2xl space-y-3 bg-primary-50 border-2 border-primary-500/15">
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-xs font-bold uppercase tracking-wider text-primary-500">Editing: {c.name}</span>
                        <button type="button" onClick={() => setEditingCandidate(null)} className="text-xs text-muted-foreground">Cancel</button>
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
                    <div className="flex items-center gap-3 p-3 rounded-2xl bg-primary-50 border border-primary-500/7">
                      <div className="w-12 h-12 rounded-xl overflow-hidden flex-shrink-0 bg-gradient-to-br from-primary-500 to-primary-light">
                        {c.imageUrl || c.user?.avatarUrl
                          ? <img src={c.imageUrl || c.user?.avatarUrl} alt={c.name} className="w-full h-full object-cover object-top"/>
                          : <div className="w-full h-full flex items-center justify-center text-white text-sm font-bold">{c.name[0]}</div>}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="font-semibold text-sm text-dark">{c.name}</div>
                        {c.bio && <div className="text-xs truncate text-muted-foreground">{c.bio}</div>}
                        {!c.imageUrl && !c.user?.avatarUrl && (
                          <div className="text-[10px] mt-0.5 text-gold">
                            <i className="fas fa-exclamation-triangle mr-1"/>No photo — click edit to add
                          </div>
                        )}
                      </div>
                      <div className="flex gap-1 flex-shrink-0">
                        <button onClick={() => { setEditingCandidate(c.id); resetEdit() }}
                          className="w-8 h-8 rounded-lg flex items-center justify-center bg-primary-50 text-primary-500 border border-primary-500/15 hover:bg-primary-100"
                          title="Edit candidate">
                          <i className="fas fa-edit text-xs"/>
                        </button>
                        <button onClick={() => { if (confirm('Remove candidate?')) removeMut.mutate(c.id) }}
                          className="w-8 h-8 rounded-lg flex items-center justify-center bg-red-50 text-red-500 border border-red-500/15 hover:bg-red-100">
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
              <div className="text-xs mb-4 text-muted-foreground">
                Total votes: <strong className="text-dark">{results.reduce((s, c) => s + (c._count?.votes || 0), 0)}</strong>
              </div>
              {results.map((c, i) => {
                const total = results.reduce((s, c) => s + (c._count?.votes || 0), 0)
                const votes = c._count?.votes || 0
                const pct   = total > 0 ? Math.round((votes / total) * 100) : 0
                const isWinner = i === 0 && votes > 0
                return (
                  <div key={c.id} className={cn('p-4 rounded-2xl border',
                    isWinner ? 'bg-gold/6 border-gold/20' : 'bg-primary-50 border-primary-500/7')}>
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        {isWinner && <i className="fas fa-trophy text-sm text-gold"/>}
                        <span className="font-semibold text-sm text-dark">{c.name}</span>
                      </div>
                      <span className="text-sm font-bold text-primary-500">{votes} votes ({pct}%)</span>
                    </div>
                    <Progress value={pct} className="h-2"
                      style={{ '--progress-bg': isWinner ? 'linear-gradient(90deg,#F0A500,#FFB84D)' : undefined }}/>
                  </div>
                )
              })}
              {results.length === 0 && (
                <div className="text-center py-10">
                  <i className="fas fa-chart-bar text-4xl mb-3 block text-primary-500/15"/>
                  <p className="text-sm text-muted-foreground">No votes cast yet.</p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default function AdminElections() {
  const qc = useQueryClient()
  const [showForm,      setShowForm]      = useState(false)
  const [editing,       setEditing]       = useState(null)
  const [managingCands, setManagingCands] = useState(null)
  const [statusFilter,  setStatusFilter]  = useState('')

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
          <h2 className="font-bold text-2xl text-dark">Elections & Voting</h2>
          <p className="text-sm mt-0.5 text-muted-foreground">Manage community elections, candidates, and results</p>
        </div>
        <button onClick={() => { setEditing(null); setShowForm(true) }} className="btn-secondary">
          <i className="fas fa-plus"/>New Election
        </button>
      </div>

      {/* Status filters */}
      <div className="flex gap-2 flex-wrap">
        {[['', 'All'], ...STATUS_OPTIONS.map(s => [s, STATUS_META[s].label])].map(([v, l]) => (
          <button key={v} onClick={() => setStatusFilter(v)}
            className={cn('text-xs font-semibold px-4 py-2 rounded-xl transition-all',
              statusFilter === v ? 'bg-primary-500 text-white' : 'bg-primary-50 text-muted-foreground hover:text-primary-500')}>
            {l}
          </button>
        ))}
      </div>

      {isLoading ? (
        <div className="space-y-3">{[1,2,3].map(i => <div key={i} className="h-24 rounded-2xl animate-pulse bg-primary-500/5"/>)}</div>
      ) : !elections.length ? (
        <div className="text-center py-20 rounded-3xl bg-primary-500/2 border border-dashed border-primary-500/12">
          <i className="fas fa-vote-yea text-5xl mb-4 block text-primary-500/18"/>
          <h3 className="font-bold text-xl mb-2 text-dark">No elections yet</h3>
          <button onClick={() => setShowForm(true)} className="btn-secondary mt-4 !text-sm">Create first election</button>
        </div>
      ) : (
        <Card className="overflow-hidden p-0">
          <table className="w-full text-sm">
            <thead className="bg-primary-500/4">
              <tr>
                {['Election', 'Type', 'Status', 'Eligibility', 'Candidates', 'Votes', 'Actions'].map(h => (
                  <th key={h} className="text-left px-5 py-3 text-xs font-bold uppercase tracking-widest text-primary-500">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {elections.map((e, i) => {
                const meta = STATUS_META[e.status] || STATUS_META.draft
                return (
                  <tr key={e.id} className={cn('border-b border-primary-500/5 hover:bg-primary-50/40 transition-colors', i % 2 !== 0 && 'bg-primary-500/1')}>
                    <td className="px-5 py-4">
                      <div className="font-semibold text-sm text-dark">{e.title}</div>
                      {e.endDate && <div className="text-xs mt-0.5 text-muted-foreground">Ends {format(new Date(e.endDate), 'MMM d, yyyy')}</div>}
                    </td>
                    <td className="px-5 py-4 text-xs capitalize text-muted-foreground">{e.type}</td>
                    <td className="px-5 py-4">
                      <select value={e.status}
                        onChange={ev => quickStatus.mutate({ id: e.id, status: ev.target.value })}
                        className="text-xs font-bold px-2.5 py-1 rounded-full cursor-pointer border-0 outline-none"
                        style={{ background: meta.bg, color: meta.color }}>
                        {STATUS_OPTIONS.map(s => <option key={s} value={s}>{STATUS_META[s].label}</option>)}
                      </select>
                    </td>
                    <td className="px-5 py-4 text-xs capitalize text-muted-foreground">{e.eligibility}</td>
                    <td className="px-5 py-4 text-sm font-semibold text-primary-500">{e._count?.candidates || 0}</td>
                    <td className="px-5 py-4 text-sm font-semibold text-dark">{e._count?.votes || 0}</td>
                    <td className="px-5 py-4">
                      <div className="flex gap-1">
                        <button onClick={() => setManagingCands(e)}
                          className="w-8 h-8 rounded-xl flex items-center justify-center bg-primary-50 text-primary-500 hover:bg-primary-100 transition-colors"
                          title="Manage candidates">
                          <i className="fas fa-users text-xs"/>
                        </button>
                        <button onClick={() => { setEditing(e); setShowForm(true) }}
                          className="w-8 h-8 rounded-xl flex items-center justify-center bg-primary-50 text-primary-500 hover:bg-primary-100 transition-colors">
                          <i className="fas fa-edit text-xs"/>
                        </button>
                        <button onClick={() => { if (confirm('Delete election?')) deleteMut.mutate(e.id) }}
                          className="w-8 h-8 rounded-xl flex items-center justify-center bg-red-50 text-red-500 hover:bg-red-100 transition-colors">
                          <i className="fas fa-trash text-xs"/>
                        </button>
                      </div>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </Card>
      )}

      {showForm && <ElectionForm election={editing} onClose={() => { setShowForm(false); setEditing(null) }}/>}
      {managingCands && <CandidatesPanel election={managingCands} onClose={() => setManagingCands(null)}/>}
    </div>
  )
}
