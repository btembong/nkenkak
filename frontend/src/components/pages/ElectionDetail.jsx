import { useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { useQuery, useMutation, useQueryClient } from 'react-query'
import { format } from 'date-fns'
import toast from 'react-hot-toast'
import api from '../../services/api'
import { useAuth } from '../../context/AuthContext'

const STATUS_META = {
  draft:       { label: 'Draft',       color: '#A3A3A3', bg: 'rgba(163,163,163,0.1)' },
  nominations: { label: 'Nominations Open', color: '#0284c7', bg: 'rgba(2,132,199,0.1)' },
  voting:      { label: 'Voting Open', color: '#16a34a', bg: 'rgba(22,163,74,0.12)'  },
  closed:      { label: 'Results',     color: '#5B2D8E', bg: 'rgba(91,45,142,0.1)'   },
}

const ELIGIBILITY_META = {
  all:      'Any registered member',
  verified: 'Verified members only',
  approved: 'Approved community members only',
}

function CandidateCard({ candidate, onVote, hasVoted, myVoteId, isVoting, totalVotes, isClosed }) {
  const isMyVote = myVoteId === candidate.id
  const votes = candidate._count?.votes || 0
  const pct   = totalVotes > 0 ? Math.round((votes / totalVotes) * 100) : 0

  return (
    <div className="rounded-2xl p-5 transition-all"
      style={{ background: '#fff', boxShadow: isMyVote ? '0 0 0 2px #5B2D8E, 0 4px 16px rgba(91,45,142,0.15)' : '0 2px 12px rgba(91,45,142,0.06)', border: isMyVote ? '2px solid #5B2D8E' : '2px solid transparent' }}>
      <div className="flex items-start gap-4">
        {/* Avatar */}
        <div className="w-14 h-14 rounded-2xl flex-shrink-0 overflow-hidden"
          style={{ background: 'linear-gradient(135deg,#5B2D8E,#7B4DB8)' }}>
          {candidate.imageUrl || candidate.user?.avatarUrl
            ? <img src={candidate.imageUrl || candidate.user?.avatarUrl} alt={candidate.name} className="w-full h-full object-cover"/>
            : <div className="w-full h-full flex items-center justify-center text-white font-bold text-lg">
                {candidate.name?.[0]?.toUpperCase()}
              </div>}
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <h3 className="font-display font-bold text-base" style={{ color: '#1A0A35' }}>{candidate.name}</h3>
            {isMyVote && (
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full"
                style={{ background: 'rgba(91,45,142,0.1)', color: '#5B2D8E' }}>
                <i className="fas fa-check mr-1"/>Your vote
              </span>
            )}
          </div>
          {candidate.bio && (
            <p className="text-xs mt-1 leading-relaxed" style={{ color: '#737373', fontFamily: 'Poppins,sans-serif' }}>
              {candidate.bio}
            </p>
          )}
        </div>
      </div>

      {/* Manifesto */}
      {candidate.manifesto && (
        <div className="mt-3 pt-3 border-t" style={{ borderColor: 'rgba(91,45,142,0.06)' }}>
          <p className="text-xs leading-relaxed italic" style={{ color: '#737373', fontFamily: 'Poppins,sans-serif' }}>
            "{candidate.manifesto}"
          </p>
        </div>
      )}

      {/* Vote bar (visible when has voted or closed) */}
      {(hasVoted || isClosed) && (
        <div className="mt-4">
          <div className="flex justify-between text-xs mb-1.5" style={{ fontFamily: 'Poppins,sans-serif' }}>
            <span style={{ color: '#737373' }}>{votes} vote{votes !== 1 ? 's' : ''}</span>
            <span style={{ color: '#5B2D8E', fontWeight: 700 }}>{pct}%</span>
          </div>
          <div className="h-2 rounded-full overflow-hidden" style={{ background: 'rgba(91,45,142,0.08)' }}>
            <div className="h-full rounded-full transition-all duration-700"
              style={{ width: `${pct}%`, background: isMyVote ? 'linear-gradient(90deg,#5B2D8E,#7B4DB8)' : 'rgba(91,45,142,0.25)' }}/>
          </div>
        </div>
      )}

      {/* Vote button */}
      {isVoting && !hasVoted && (
        <button onClick={() => onVote(candidate.id)}
          className="mt-4 w-full py-2.5 rounded-xl text-sm font-bold transition-all hover:opacity-90"
          style={{ background: 'linear-gradient(135deg,#5B2D8E,#7B4DB8)', color: '#fff' }}>
          <i className="fas fa-vote-yea mr-2"/>Vote for {candidate.name.split(' ')[0]}
        </button>
      )}
    </div>
  )
}

export default function ElectionDetail() {
  const { id } = useParams()
  const { user } = useAuth()
  const qc = useQueryClient()
  const [confirmCandidate, setConfirmCandidate] = useState(null)

  const { data: election, isLoading } = useQuery(['election', id], () =>
    api.get(`/elections/${id}`).then(r => r.data))

  const { data: myVote } = useQuery(['election-my-vote', id], () =>
    api.get(`/elections/${id}/my-vote`).then(r => r.data), { enabled: !!user })

  const voteMut = useMutation(
    (candidateId) => api.post(`/elections/${id}/vote`, { candidateId }),
    {
      onSuccess: () => {
        qc.invalidateQueries(['election', id])
        qc.invalidateQueries(['election-my-vote', id])
        toast.success('Your vote has been cast!')
        setConfirmCandidate(null)
      },
      onError: e => {
        toast.error(e.response?.data?.error || 'Failed to cast vote')
        setConfirmCandidate(null)
      },
    }
  )

  if (isLoading) return (
    <div className="max-w-3xl mx-auto px-6 py-12">
      <div className="space-y-4">{[1,2,3].map(i => <div key={i} className="h-32 rounded-3xl animate-pulse" style={{ background: 'rgba(91,45,142,0.05)' }}/>)}</div>
    </div>
  )
  if (!election) return (
    <div className="text-center py-24"><h3 style={{ color: '#1A0A35' }}>Election not found</h3></div>
  )

  const meta  = STATUS_META[election.status] || STATUS_META.closed
  const elig  = ELIGIBILITY_META[election.eligibility] || ELIGIBILITY_META.all
  const isVoting = election.status === 'voting'
  const isClosed = election.status === 'closed'
  const hasVoted = !!myVote
  const totalVotes = election._count?.votes || 0

  const winner = isClosed && election.candidates?.length
    ? [...election.candidates].sort((a, b) => (b._count?.votes || 0) - (a._count?.votes || 0))[0]
    : null

  return (
    <div style={{ background: '#F9F7FD', minHeight: '100vh' }}>
      <div className="max-w-3xl mx-auto px-6 py-12">
        <Link to="/elections" className="inline-flex items-center gap-2 text-xs font-semibold mb-6 hover:gap-3 transition-all"
          style={{ color: '#5B2D8E', fontFamily: 'Sora,sans-serif' }}>
          <i className="fas fa-arrow-left"/>Back to Elections
        </Link>

        {election.coverImage && (
          <img src={election.coverImage} alt={election.title} className="w-full h-48 object-cover rounded-3xl mb-8"/>
        )}

        {/* Header */}
        <div className="mb-8">
          <span className="text-xs font-bold px-3 py-1.5 rounded-full mb-3 inline-block"
            style={{ background: meta.bg, color: meta.color }}>{meta.label}</span>
          <h1 className="font-display font-bold text-3xl md:text-4xl mb-3" style={{ color: '#1A0A35' }}>
            {election.title}
          </h1>
          {election.description && (
            <p className="text-sm leading-relaxed mb-4" style={{ color: '#737373', fontFamily: 'Poppins,sans-serif' }}>
              {election.description}
            </p>
          )}
          <div className="flex flex-wrap gap-4 text-xs" style={{ color: '#A3A3A3', fontFamily: 'Poppins,sans-serif' }}>
            <span><i className="fas fa-users mr-1.5"/>{elig}</span>
            <span><i className="fas fa-vote-yea mr-1.5"/>{totalVotes} total votes</span>
            {election.endDate && <span><i className="fas fa-calendar mr-1.5"/>Ends {format(new Date(election.endDate), 'MMMM d, yyyy')}</span>}
          </div>
        </div>

        {/* Winner banner */}
        {winner && isClosed && (winner._count?.votes || 0) > 0 && (
          <div className="rounded-2xl p-5 mb-6 flex items-center gap-4"
            style={{ background: 'linear-gradient(135deg,rgba(91,45,142,0.06),rgba(240,165,0,0.06))', border: '1px solid rgba(240,165,0,0.2)' }}>
            <div className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0"
              style={{ background: 'linear-gradient(135deg,#F0A500,#FFB84D)' }}>
              <i className="fas fa-trophy text-white text-lg"/>
            </div>
            <div>
              <div className="text-xs font-bold uppercase tracking-widest mb-0.5" style={{ color: '#C87800' }}>Winner</div>
              <div className="font-display font-bold text-lg" style={{ color: '#1A0A35' }}>{winner.name}</div>
              <div className="text-xs" style={{ color: '#737373' }}>{winner._count?.votes} votes ({Math.round((winner._count?.votes / totalVotes) * 100)}%)</div>
            </div>
          </div>
        )}

        {/* Voted confirmation */}
        {hasVoted && !isClosed && (
          <div className="rounded-2xl p-4 mb-6 flex items-center gap-3"
            style={{ background: 'rgba(22,163,74,0.08)', border: '1px solid rgba(22,163,74,0.2)' }}>
            <i className="fas fa-check-circle text-green-600"/>
            <div className="text-sm" style={{ color: '#16a34a', fontFamily: 'Poppins,sans-serif' }}>
              You voted for <strong>{myVote?.candidate?.name}</strong>. Results will be shown when voting closes.
            </div>
          </div>
        )}

        {/* Not logged in */}
        {isVoting && !user && (
          <div className="rounded-2xl p-4 mb-6 flex items-center gap-3"
            style={{ background: 'rgba(2,132,199,0.08)', border: '1px solid rgba(2,132,199,0.2)' }}>
            <i className="fas fa-info-circle" style={{ color: '#0284c7' }}/>
            <div className="text-sm" style={{ color: '#0284c7', fontFamily: 'Poppins,sans-serif' }}>
              <Link to="/login" className="font-bold underline">Log in</Link> or{' '}
              <Link to="/register" className="font-bold underline">register</Link> to cast your vote.
            </div>
          </div>
        )}

        {/* Candidates */}
        {election.status === 'nominations' ? (
          <div className="rounded-2xl p-8 text-center" style={{ background: '#fff', boxShadow: '0 2px 12px rgba(91,45,142,0.06)' }}>
            <i className="fas fa-user-plus text-4xl mb-4 block" style={{ color: 'rgba(91,45,142,0.2)' }}/>
            <h3 className="font-display font-bold text-lg mb-2" style={{ color: '#1A0A35' }}>Nominations are open</h3>
            <p className="text-sm" style={{ color: '#737373', fontFamily: 'Poppins,sans-serif' }}>
              Candidates are being registered. Voting opens when nominations close.
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="flex items-center justify-between mb-2">
              <h2 className="font-display font-bold text-lg" style={{ color: '#1A0A35' }}>
                Candidates ({election.candidates?.length || 0})
              </h2>
            </div>
            {election.candidates?.map(c => (
              <CandidateCard
                key={c.id}
                candidate={c}
                onVote={setConfirmCandidate}
                hasVoted={hasVoted}
                myVoteId={myVote?.candidateId}
                isVoting={isVoting && !!user}
                totalVotes={totalVotes}
                isClosed={isClosed || hasVoted}
              />
            ))}
          </div>
        )}
      </div>

      {/* Confirm vote modal */}
      {confirmCandidate && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4"
          style={{ background: 'rgba(26,10,53,0.8)', backdropFilter: 'blur(8px)' }}
          onClick={e => e.target === e.currentTarget && setConfirmCandidate(null)}>
          <div className="bg-white rounded-3xl w-full max-w-sm p-7 text-center"
            style={{ boxShadow: '0 32px 80px rgba(26,10,53,0.25)' }}>
            <div className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-5"
              style={{ background: 'rgba(91,45,142,0.1)' }}>
              <i className="fas fa-vote-yea text-2xl" style={{ color: '#5B2D8E' }}/>
            </div>
            <h3 className="font-display font-bold text-xl mb-2" style={{ color: '#1A0A35' }}>Confirm Your Vote</h3>
            <p className="text-sm mb-6" style={{ color: '#737373', fontFamily: 'Poppins,sans-serif' }}>
              You are voting for <strong style={{ color: '#1A0A35' }}>
                {election.candidates?.find(c => c.id === confirmCandidate)?.name}
              </strong>. This cannot be changed.
            </p>
            <div className="flex gap-3">
              <button onClick={() => setConfirmCandidate(null)}
                className="flex-1 py-3 rounded-2xl text-sm font-semibold"
                style={{ background: 'rgba(91,45,142,0.05)', color: '#737373', border: '1px solid rgba(91,45,142,0.1)' }}>
                Cancel
              </button>
              <button onClick={() => voteMut.mutate(confirmCandidate)} disabled={voteMut.isLoading}
                className="flex-1 py-3 rounded-2xl text-sm font-bold text-white transition-all hover:opacity-90"
                style={{ background: 'linear-gradient(135deg,#5B2D8E,#7B4DB8)' }}>
                {voteMut.isLoading ? <><i className="fas fa-spinner animate-spin mr-2"/>Casting…</> : <><i className="fas fa-check mr-2"/>Confirm Vote</>}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
