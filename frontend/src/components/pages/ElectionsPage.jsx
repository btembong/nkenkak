import { useState } from 'react'
import { useQuery } from 'react-query'
import { Link } from 'react-router-dom'
import { format } from 'date-fns'
import api from '../../services/api'

const STATUS_META = {
  draft:       { label: 'Draft',       color: '#A3A3A3', bg: 'rgba(163,163,163,0.1)' },
  nominations: { label: 'Nominations', color: '#0284c7', bg: 'rgba(2,132,199,0.1)'   },
  voting:      { label: 'Voting Open', color: '#16a34a', bg: 'rgba(22,163,74,0.12)'  },
  closed:      { label: 'Closed',      color: '#737373', bg: 'rgba(115,115,115,0.1)' },
}

const ELIGIBILITY_META = {
  all:      { label: 'All registered members', icon: 'fa-users' },
  verified: { label: 'Verified members only',  icon: 'fa-check-circle' },
  approved: { label: 'Approved members only',  icon: 'fa-user-check' },
}

function ElectionCard({ election }) {
  const meta  = STATUS_META[election.status] || STATUS_META.closed
  const elig  = ELIGIBILITY_META[election.eligibility] || ELIGIBILITY_META.all
  const total = election._count?.votes || 0
  const maxVotes = Math.max(...(election.candidates?.map(c => c._count?.votes || 0) || [0]), 1)
  const isVoting = election.status === 'voting'

  return (
    <div className="card p-5 flex flex-col gap-4 transition-all hover:-translate-y-0.5 hover:shadow-xl">
      {election.coverImage && (
        <img src={election.coverImage} alt={election.title} className="w-full h-36 object-cover rounded-2xl"/>
      )}
      <div className="flex items-start justify-between gap-2">
        <div>
          <span className="text-xs font-bold px-2.5 py-1 rounded-full"
            style={{ background: meta.bg, color: meta.color }}>
            {meta.label}
          </span>
          <h3 className="font-display font-bold text-lg mt-2 leading-snug" style={{ color: '#1A0A35' }}>
            {election.title}
          </h3>
        </div>
      </div>

      {election.description && (
        <p className="text-xs leading-relaxed line-clamp-2" style={{ color: '#737373', fontFamily: 'Poppins,sans-serif' }}>
          {election.description}
        </p>
      )}

      {/* Candidate mini-bars (if voting/closed) */}
      {election.candidates?.length > 0 && (election.status === 'voting' || election.status === 'closed') && (
        <div className="space-y-2">
          {election.candidates.slice(0, 3).map(c => {
            const votes = c._count?.votes || 0
            const pct   = Math.round((votes / maxVotes) * 100)
            return (
              <div key={c.id}>
                <div className="flex justify-between text-xs mb-1" style={{ fontFamily: 'Poppins,sans-serif' }}>
                  <span style={{ color: '#1A0A35' }}>{c.name}</span>
                  <span style={{ color: '#A3A3A3' }}>{votes} votes</span>
                </div>
                <div className="h-1.5 rounded-full overflow-hidden" style={{ background: 'rgba(91,45,142,0.08)' }}>
                  <div className="h-full rounded-full transition-all duration-700"
                    style={{ width: `${pct}%`, background: 'linear-gradient(90deg,#5B2D8E,#7B4DB8)' }}/>
                </div>
              </div>
            )
          })}
          {election.candidates.length > 3 && (
            <p className="text-[10px]" style={{ color: '#A3A3A3' }}>+{election.candidates.length - 3} more candidates</p>
          )}
        </div>
      )}

      <div className="flex items-center justify-between pt-2 mt-auto border-t" style={{ borderColor: 'rgba(91,45,142,0.06)' }}>
        <div className="text-xs" style={{ color: '#A3A3A3', fontFamily: 'Poppins,sans-serif' }}>
          <i className={`fas ${elig.icon} mr-1`}/>{elig.label}
          {total > 0 && <span className="ml-3"><i className="fas fa-vote-yea mr-1"/>{total} votes cast</span>}
        </div>
        <Link to={`/elections/${election.id}`}
          className="text-xs font-bold px-4 py-2 rounded-xl transition-all hover:opacity-90"
          style={{ background: isVoting ? 'linear-gradient(135deg,#5B2D8E,#7B4DB8)' : 'rgba(91,45,142,0.08)', color: isVoting ? '#fff' : '#5B2D8E' }}>
          {isVoting ? <><i className="fas fa-vote-yea mr-1"/>Vote Now</> : 'View Details'}
        </Link>
      </div>
    </div>
  )
}

export default function ElectionsPage() {
  const [filter, setFilter] = useState('')
  const { data: elections = [], isLoading } = useQuery(
    ['elections', filter],
    () => api.get('/elections', { params: filter ? { status: filter } : {} }).then(r => r.data)
  )

  return (
    <div style={{ background: '#F9F7FD', minHeight: '100vh' }}>
      {/* Hero */}
      <div className="relative py-20 overflow-hidden" style={{ background: 'linear-gradient(135deg,#1A0A35,#250F47)' }}>
        <div className="wave-pattern absolute inset-0 opacity-20"/>
        <div className="relative max-w-4xl mx-auto px-6 text-center">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full mb-5"
            style={{ background: 'rgba(240,165,0,0.15)', border: '1px solid rgba(240,165,0,0.25)' }}>
            <i className="fas fa-vote-yea text-xs" style={{ color: '#F0A500' }}/>
            <span className="text-xs font-bold uppercase tracking-widest" style={{ color: '#F0A500', fontFamily: 'Sora,sans-serif' }}>
              Democratic Governance
            </span>
          </div>
          <h1 className="font-display font-bold text-4xl md:text-5xl text-white mb-4">
            Community <span style={{ color: '#F0A500' }}>Elections</span>
          </h1>
          <p className="text-base max-w-xl mx-auto" style={{ color: 'rgba(255,255,255,0.65)', fontFamily: 'Poppins,sans-serif' }}>
            Participate in free, transparent elections to choose the leaders and representatives of Nkenkak-Ngiesang.
          </p>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-6 py-10">
        {/* Filter */}
        <div className="flex flex-wrap gap-2 mb-8">
          {[['','All'],['nominations','Nominations'],['voting','Voting Open'],['closed','Closed']].map(([v,l]) => (
            <button key={v} onClick={() => setFilter(v)}
              className="text-xs font-semibold px-4 py-2 rounded-xl transition-all"
              style={{ background: filter === v ? '#5B2D8E' : 'rgba(91,45,142,0.07)', color: filter === v ? '#fff' : '#737373', fontFamily: 'Sora,sans-serif' }}>
              {l}
            </button>
          ))}
        </div>

        {isLoading ? (
          <div className="grid md:grid-cols-2 gap-5">
            {[1,2,3,4].map(i => <div key={i} className="h-64 rounded-3xl animate-pulse" style={{ background: 'rgba(91,45,142,0.05)' }}/>)}
          </div>
        ) : !elections.length ? (
          <div className="text-center py-24 rounded-3xl"
            style={{ background: 'rgba(91,45,142,0.02)', border: '1px dashed rgba(91,45,142,0.12)' }}>
            <i className="fas fa-vote-yea text-5xl mb-4 block" style={{ color: 'rgba(91,45,142,0.18)' }}/>
            <h3 className="font-display font-bold text-xl mb-2" style={{ color: '#1A0A35' }}>No elections yet</h3>
            <p className="text-sm" style={{ color: '#737373', fontFamily: 'Poppins,sans-serif' }}>
              Elections created by the council will appear here.
            </p>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 gap-5">
            {elections.map(e => <ElectionCard key={e.id} election={e}/>)}
          </div>
        )}
      </div>
    </div>
  )
}
