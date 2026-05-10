import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from 'react-query'
import { format } from 'date-fns'
import toast from 'react-hot-toast'
import api from '../../services/api'
import { useAuth } from '../../context/AuthContext'

function PollCard({ poll }) {
  const { user } = useAuth()
  const qc = useQueryClient()
  const [selected, setSelected] = useState(null)

  const { data: results = [] } = useQuery(['poll-results', poll.id],
    () => api.get(`/polls/${poll.id}/results`).then(r => r.data),
    { staleTime: 30000 }
  )

  const voteMut = useMutation(
    vote => api.post(`/polls/${poll.id}/vote`, { vote }),
    {
      onSuccess: () => {
        qc.invalidateQueries(['poll-results', poll.id])
        toast.success('Vote recorded!')
      },
      onError: e => toast.error(e.response?.data?.error || 'Could not vote'),
    }
  )

  const totalVotes = results.reduce((s, r) => s + r.count, 0)
  const getCount = v => results.find(r => r.vote === v)?.count || 0
  const getPct   = v => totalVotes ? Math.round((getCount(v) / totalVotes) * 100) : 0

  const isClosed = !poll.isActive || (poll.closesAt && new Date(poll.closesAt) < new Date())
  const hasOptions = poll.options?.length > 0
  const votes = hasOptions ? poll.options : ['approve', 'reject', 'abstain']

  const COLORS = {
    approve: { bg:'rgba(22,163,74,0.12)', bar:'#16a34a', text:'#15803d', icon:'fa-check' },
    reject:  { bg:'rgba(220,38,38,0.1)',  bar:'#dc2626', text:'#b91c1c', icon:'fa-times' },
    abstain: { bg:'rgba(163,163,163,0.1)',bar:'#737373', text:'#525252', icon:'fa-minus' },
  }
  const defaultColor = { bg:'rgba(91,45,142,0.08)', bar:'#5B2D8E', text:'#5B2D8E', icon:'fa-circle' }

  return (
    <div className="rounded-3xl overflow-hidden" style={{background:'#fff',border:'1px solid rgba(91,45,142,0.08)',boxShadow:'0 4px 24px rgba(91,45,142,0.06)'}}>
      {/* Header */}
      <div className="p-6 pb-4" style={{borderBottom:'1px solid rgba(91,45,142,0.06)'}}>
        <div className="flex items-start justify-between gap-3 mb-2">
          <h3 className="font-display font-bold text-lg leading-tight" style={{color:'#1A0A35'}}>{poll.title}</h3>
          <span className={`flex-shrink-0 text-[10px] font-bold px-2.5 py-1 rounded-full uppercase tracking-wide ${isClosed ? 'opacity-60' : ''}`}
            style={{background: isClosed ? 'rgba(163,163,163,0.15)' : 'rgba(22,163,74,0.12)', color: isClosed ? '#737373' : '#16a34a'}}>
            {isClosed ? 'Closed' : 'Open'}
          </span>
        </div>
        {poll.description && <p className="text-sm leading-relaxed" style={{color:'#737373',fontFamily:'Poppins,sans-serif'}}>{poll.description}</p>}
        <div className="flex items-center gap-4 mt-3 text-xs" style={{color:'#A3A3A3',fontFamily:'Poppins,sans-serif'}}>
          <span><i className="fas fa-vote-yea mr-1.5"/>{totalVotes} vote{totalVotes !== 1 ? 's' : ''}</span>
          {poll.closesAt && <span><i className="fas fa-clock mr-1.5"/>Closes {format(new Date(poll.closesAt), 'MMM d, yyyy')}</span>}
        </div>
      </div>

      {/* Options */}
      <div className="p-6 space-y-3">
        {votes.map(v => {
          const c = COLORS[v] || defaultColor
          const pct = getPct(v)
          return (
            <div key={v}>
              <button
                onClick={() => { if (!isClosed && user) { setSelected(v); voteMut.mutate(v) } }}
                disabled={isClosed || !user || voteMut.isLoading}
                className="w-full text-left rounded-2xl overflow-hidden relative transition-all"
                style={{
                  background: selected === v ? c.bg : 'rgba(91,45,142,0.03)',
                  border: `1px solid ${selected === v ? c.bar : 'rgba(91,45,142,0.08)'}`,
                  cursor: isClosed || !user ? 'default' : 'pointer',
                }}>
                {/* Progress bar */}
                <div className="absolute inset-y-0 left-0 transition-all duration-700 rounded-2xl"
                  style={{width:`${pct}%`, background:`${c.bar}20`}}/>
                <div className="relative flex items-center justify-between px-4 py-3 gap-3">
                  <div className="flex items-center gap-2.5">
                    <i className={`fas ${c.icon} text-xs`} style={{color:c.bar}}/>
                    <span className="text-sm font-semibold capitalize" style={{color:c.text,fontFamily:'Sora,sans-serif'}}>{v}</span>
                  </div>
                  <span className="text-xs font-bold" style={{color:c.bar}}>{pct}%</span>
                </div>
              </button>
            </div>
          )
        })}
      </div>

      {!user && !isClosed && (
        <div className="px-6 pb-5 text-center text-xs" style={{color:'#A3A3A3',fontFamily:'Poppins,sans-serif'}}>
          <i className="fas fa-lock mr-1.5"/><a href="/login" className="underline hover:text-primary-600">Log in</a> to cast your vote
        </div>
      )}
    </div>
  )
}

export default function PollsPage() {
  const [filter, setFilter] = useState('active')

  const { data: polls = [], isLoading } = useQuery('public-polls',
    () => api.get('/polls').then(r => r.data))

  const filtered = polls.filter(p => {
    const closed = !p.isActive || (p.closesAt && new Date(p.closesAt) < new Date())
    return filter === 'all' || (filter === 'active' ? !closed : closed)
  })

  return (
    <div style={{background:'#F9F7FD', minHeight:'100vh'}}>
      {/* Hero */}
      <div className="relative py-20 overflow-hidden" style={{background:'linear-gradient(135deg,#1A0A35,#250F47)'}}>
        <div className="wave-pattern absolute inset-0 opacity-20"/>
        <div className="relative max-w-4xl mx-auto px-6 text-center">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full mb-5"
            style={{background:'rgba(240,165,0,0.15)',border:'1px solid rgba(240,165,0,0.25)'}}>
            <i className="fas fa-vote-yea text-xs" style={{color:'#F0A500'}}/>
            <span className="text-xs font-bold uppercase tracking-widest" style={{color:'#F0A500',fontFamily:'Sora,sans-serif'}}>Community Voice</span>
          </div>
          <h1 className="font-display font-bold text-4xl md:text-5xl text-white mb-4 leading-tight">
            Community <span style={{color:'#F0A500'}}>Polls</span>
          </h1>
          <p className="text-base max-w-xl mx-auto" style={{color:'rgba(255,255,255,0.65)',fontFamily:'Poppins,sans-serif'}}>
            Your voice shapes our village. Vote on community decisions and see what your neighbours think.
          </p>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-6 py-12">
        {/* Filter tabs */}
        <div className="flex gap-2 mb-8">
          {[['active','Active'], ['closed','Closed'], ['all','All']].map(([val, label]) => (
            <button key={val} onClick={() => setFilter(val)}
              className="px-5 py-2 rounded-full text-sm font-semibold transition-all"
              style={{
                background: filter === val ? 'linear-gradient(135deg,#5B2D8E,#7B4DB8)' : '#fff',
                color: filter === val ? '#fff' : '#5B2D8E',
                boxShadow: '0 2px 8px rgba(91,45,142,0.1)',
                fontFamily: 'Sora,sans-serif',
              }}>
              {label}
            </button>
          ))}
          <span className="ml-auto self-center text-sm" style={{color:'#A3A3A3',fontFamily:'Poppins,sans-serif'}}>
            {filtered.length} poll{filtered.length !== 1 ? 's' : ''}
          </span>
        </div>

        {isLoading ? (
          <div className="grid md:grid-cols-2 gap-6">
            {[1,2,3,4].map(i => <div key={i} className="h-64 rounded-3xl animate-pulse" style={{background:'rgba(91,45,142,0.05)'}}/>)}
          </div>
        ) : filtered.length ? (
          <div className="grid md:grid-cols-2 gap-6">
            {filtered.map(p => <PollCard key={p.id} poll={p}/>)}
          </div>
        ) : (
          <div className="text-center py-20 rounded-3xl" style={{background:'rgba(91,45,142,0.02)',border:'1px dashed rgba(91,45,142,0.1)'}}>
            <i className="fas fa-vote-yea text-5xl mb-4 block" style={{color:'rgba(91,45,142,0.12)'}}/>
            <h4 className="font-display font-semibold text-lg mb-2" style={{color:'#737373'}}>No polls yet</h4>
            <p className="text-sm" style={{color:'#A3A3A3',fontFamily:'Poppins,sans-serif'}}>Check back soon for community polls.</p>
          </div>
        )}
      </div>
    </div>
  )
}
