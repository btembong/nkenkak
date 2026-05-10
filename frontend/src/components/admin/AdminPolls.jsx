import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from 'react-query'
import { useForm } from 'react-hook-form'
import { format } from 'date-fns'
import toast from 'react-hot-toast'
import api from '../../services/api'

export default function AdminPolls() {
  const qc = useQueryClient()
  const [showForm, setShowForm] = useState(false)
  const { register, handleSubmit, reset, formState: { errors } } = useForm()

  const { data: polls, isLoading } = useQuery('admin-polls', () => api.get('/polls').then(r => r.data))
  const { data: projects } = useQuery('projects-mini', () => api.get('/projects?limit=50').then(r => r.data.projects))

  const createMut = useMutation(data => api.post('/polls', data), {
    onSuccess: () => { qc.invalidateQueries('admin-polls'); toast.success('Poll created!'); setShowForm(false); reset() }
  })

  const { data: pollResults, refetch: fetchResults } = useQuery(
    'poll-results-all',
    async () => {
      if (!polls?.length) return {}
      const results = {}
      for (const p of polls) {
        const r = await api.get(`/polls/${p.id}/results`).catch(() => ({ data: [] }))
        results[p.id] = r.data
      }
      return results
    },
    { enabled: !!polls?.length }
  )

  const getTotal = (id) => {
    const res = pollResults?.[id] || []
    return res.reduce((s, r) => s + parseInt(r.count || 0), 0)
  }

  const getVoteBar = (id, type) => {
    const res = pollResults?.[id] || []
    const row = res.find(r => r.vote === type)
    const count = parseInt(row?.count || 0)
    const total = getTotal(id)
    return { count, pct: total > 0 ? Math.round((count / total) * 100) : 0 }
  }

  return (
    <div>
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl flex items-center justify-center" style={{ background: 'linear-gradient(135deg,#5B2D8E,#7B4DB8)' }}>
            <i className="fas fa-vote-yea text-sm text-white" />
          </div>
          <div>
            <h2 className="font-display font-bold text-xl" style={{ color: '#1A0A35' }}>Community Polls</h2>
            <p className="text-xs" style={{ color: '#A3A3A3', fontFamily: 'Poppins,sans-serif' }}>{polls?.filter(p => p.isActive).length || 0} active · {polls?.length || 0} total</p>
          </div>
        </div>
        <button onClick={() => setShowForm(true)} className="btn-secondary !py-2 !px-4 !text-xs">
          <i className="fas fa-plus text-[10px]" />Create Poll
        </button>
      </div>

      {isLoading ? (
        <div className="space-y-4">{[1, 2, 3].map(i => <div key={i} className="h-32 rounded-3xl animate-pulse" style={{ background: 'rgba(91,45,142,0.04)' }} />)}</div>
      ) : polls?.length ? (
        <div className="space-y-4">
          {polls.map(poll => {
            const approve = getVoteBar(poll.id, 'approve')
            const reject  = getVoteBar(poll.id, 'reject')
            const abstain = getVoteBar(poll.id, 'abstain')
            const total   = getTotal(poll.id)
            return (
              <div key={poll.id} className="card p-6">
                <div className="flex items-start justify-between gap-4 mb-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1 flex-wrap">
                      <h3 className="font-display font-semibold text-base" style={{ color: '#1A0A35' }}>{poll.title}</h3>
                      <span className="text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full"
                        style={{ background: poll.isActive ? 'rgba(22,163,74,0.1)' : 'rgba(115,115,115,0.1)', color: poll.isActive ? '#16a34a' : '#737373' }}>
                        {poll.isActive ? 'Active' : 'Closed'}
                      </span>
                    </div>
                    {poll.description && <p className="text-xs mb-2" style={{ color: '#737373', fontFamily: 'Poppins,sans-serif' }}>{poll.description}</p>}
                    <div className="flex items-center gap-3 text-[10px]" style={{ color: '#A3A3A3', fontFamily: 'Poppins,sans-serif' }}>
                      <span><i className="fas fa-users mr-1" />{total} votes</span>
                      {poll.closesAt && <span><i className="fas fa-clock mr-1" />Closes {format(new Date(poll.closesAt), 'MMM d, yyyy')}</span>}
                      {poll.createdAt && <span>Created {format(new Date(poll.createdAt), 'MMM d, yyyy')}</span>}
                    </div>
                  </div>
                  <div className="flex gap-2 flex-shrink-0">
                    <button onClick={() => {
                      api.patch(`/polls/${poll.id}`, { is_active: !poll.is_active })
                        .then(() => { qc.invalidateQueries('admin-polls'); toast.success(poll.is_active ? 'Poll closed' : 'Poll opened') })
                    }}
                      className="flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-xl transition-all"
                      style={{ color: poll.isActive ? '#dc2626' : '#16a34a', background: poll.isActive ? 'rgba(220,38,38,0.08)' : 'rgba(22,163,74,0.08)', fontFamily: 'Sora,sans-serif' }}>
                      <i className={`fas ${poll.isActive ? 'fa-lock' : 'fa-lock-open'} text-[10px]`} />
                      {poll.isActive ? 'Close Poll' : 'Reopen Poll'}
                    </button>
                  </div>
                </div>

                {/* Vote bars */}
                {total > 0 ? (
                  <div className="space-y-2.5">
                    {[
                      { type: 'approve', label: 'Approve', ...approve, color: '#16a34a', bg: 'rgba(22,163,74,0.1)' },
                      { type: 'reject',  label: 'Reject',  ...reject,  color: '#dc2626', bg: 'rgba(220,38,38,0.08)' },
                      { type: 'abstain', label: 'Abstain', ...abstain, color: '#737373', bg: 'rgba(115,115,115,0.08)' },
                    ].map(v => (
                      <div key={v.type}>
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-xs font-semibold" style={{ color: v.color, fontFamily: 'Sora,sans-serif' }}>{v.label}</span>
                          <span className="text-xs" style={{ color: '#A3A3A3', fontFamily: 'Poppins,sans-serif' }}>{v.count} votes · {v.pct}%</span>
                        </div>
                        <div className="h-2 rounded-full" style={{ background: 'rgba(91,45,142,0.06)' }}>
                          <div className="h-full rounded-full transition-all duration-700" style={{ width: `${v.pct}%`, background: v.color }} />
                        </div>
                      </div>
                    ))}
                    <div className="pt-2 flex items-center gap-1.5 text-xs" style={{ color: '#A3A3A3', fontFamily: 'Poppins,sans-serif' }}>
                      <i className="fas fa-chart-bar text-[10px]" style={{ color: '#5B2D8E' }} />
                      <span>{total} total votes cast</span>
                    </div>
                  </div>
                ) : (
                  <div className="rounded-2xl p-4 text-center" style={{ background: 'rgba(91,45,142,0.03)', border: '1px dashed rgba(91,45,142,0.1)' }}>
                    <p className="text-xs" style={{ color: '#A3A3A3', fontFamily: 'Poppins,sans-serif' }}>No votes yet</p>
                  </div>
                )}
              </div>
            )
          })}
        </div>
      ) : (
        <div className="text-center py-16 rounded-3xl" style={{ background: 'rgba(91,45,142,0.02)', border: '1px dashed rgba(91,45,142,0.1)' }}>
          <i className="fas fa-vote-yea text-4xl mb-3 block" style={{ color: 'rgba(91,45,142,0.15)' }} />
          <h4 className="font-display font-semibold mb-2" style={{ color: '#737373' }}>No polls yet</h4>
          <p className="text-sm mb-4" style={{ color: '#A3A3A3', fontFamily: 'Poppins,sans-serif' }}>Create a poll to let community members vote on project proposals</p>
          <button onClick={() => setShowForm(true)} className="btn-secondary !text-sm !py-2 !px-5">Create First Poll</button>
        </div>
      )}

      {/* Create Poll Modal */}
      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4"
          style={{ background: 'rgba(26,10,53,0.8)', backdropFilter: 'blur(8px)' }}
          onClick={e => e.target === e.currentTarget && setShowForm(false)}>
          <div className="bg-white rounded-3xl w-full max-w-lg" style={{ boxShadow: '0 32px 80px rgba(26,10,53,0.25)' }}>
            <div className="px-7 pt-6 pb-4 border-b flex items-center justify-between" style={{ borderColor: 'rgba(91,45,142,0.08)' }}>
              <div>
                <h3 className="font-display font-bold text-xl" style={{ color: '#1A0A35' }}>Create Poll</h3>
                <p className="text-xs mt-0.5" style={{ color: '#A3A3A3', fontFamily: 'Poppins,sans-serif' }}>Let the community vote on a proposal</p>
              </div>
              <button onClick={() => { setShowForm(false); reset() }} className="w-9 h-9 rounded-full flex items-center justify-center hover:bg-gray-100" style={{ color: '#A3A3A3' }}>
                <i className="fas fa-times" />
              </button>
            </div>
            <form onSubmit={handleSubmit(d => createMut.mutate(d))} className="p-7 space-y-4">
              <div>
                <label className="label">Poll Title / Question *</label>
                <input {...register('title', { required: 'Title required' })} placeholder="e.g. Should we prioritise the road paving project?" className="input" />
                {errors.title && <p className="text-xs mt-1" style={{ color: '#dc2626' }}>{errors.title.message}</p>}
              </div>
              <div>
                <label className="label">Description</label>
                <textarea {...register('description')} rows={3} className="input resize-none" placeholder="Provide context for voters…" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="label">Linked Project</label>
                  <select {...register('project_id')} className="input">
                    <option value="">None (general poll)</option>
                    {projects?.map(p => <option key={p.id} value={p.id}>{p.title}</option>)}
                  </select>
                </div>
                <div>
                  <label className="label">Closing Date</label>
                  <input type="date" {...register('closes_at')} className="input" />
                </div>
              </div>
              <div className="flex gap-3 pt-2">
                <button type="button" onClick={() => { setShowForm(false); reset() }}
                  className="flex-1 py-3 rounded-2xl text-sm font-semibold"
                  style={{ background: 'rgba(91,45,142,0.05)', color: '#737373', border: '1px solid rgba(91,45,142,0.1)', fontFamily: 'Sora,sans-serif' }}>Cancel</button>
                <button type="submit" disabled={createMut.isLoading} className="btn-secondary flex-1 justify-center">
                  {createMut.isLoading ? <><i className="fas fa-spinner animate-spin" />Creating…</> : <><i className="fas fa-vote-yea" />Create Poll</>}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
