import { useState, useRef, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import { useQuery, useMutation, useQueryClient } from 'react-query'
import { format } from 'date-fns'
import toast from 'react-hot-toast'
import api from '../../services/api'
import { useAuth } from '../../context/AuthContext'

const STYLES = `
@keyframes voteRing    { 0%{transform:scale(0.6);opacity:1} 100%{transform:scale(2.4);opacity:0} }
@keyframes checkPop    { 0%{transform:scale(0) rotate(-20deg);opacity:0} 70%{transform:scale(1.2) rotate(4deg)} 100%{transform:scale(1) rotate(0);opacity:1} }
@keyframes confettiFall{ 0%{transform:translateY(-10px) rotate(0deg);opacity:1} 100%{transform:translateY(100vh) rotate(720deg);opacity:0} }
@keyframes fadeUp      { from{opacity:0;transform:translateY(20px)} to{opacity:1;transform:translateY(0)} }
@keyframes slideIn     { from{opacity:0;transform:translateX(60px) scale(0.96)} to{opacity:1;transform:translateX(0) scale(1)} }
@keyframes slideInLeft { from{opacity:0;transform:translateX(-60px) scale(0.96)} to{opacity:1;transform:translateX(0) scale(1)} }
@keyframes sheetUp     { from{transform:translateY(100%)} to{transform:translateY(0)} }
@keyframes liveBlip    { 0%,100%{opacity:1} 50%{opacity:0.3} }
@keyframes glowPulse   { 0%,100%{box-shadow:0 0 0 0 rgba(91,45,142,0.5)} 50%{box-shadow:0 0 0 16px rgba(91,45,142,0)} }
`

const STATUS_META = {
  draft:       { label: 'Draft',            color: '#A3A3A3', bg: 'rgba(163,163,163,0.1)' },
  nominations: { label: 'Nominations Open', color: '#0284c7', bg: 'rgba(2,132,199,0.1)'   },
  voting:      { label: 'Voting Open',      color: '#16a34a', bg: 'rgba(22,163,74,0.12)'  },
  closed:      { label: 'Results',          color: '#5B2D8E', bg: 'rgba(91,45,142,0.1)'   },
}

const ELIGIBILITY_META = {
  all:      'Any registered member',
  verified: 'Verified members only',
  approved: 'Approved community members only',
}

/* ── Leaderboard bottom sheet ──────────────────────────────────── */
function LeaderboardSheet({ candidates, totalVotes, myVoteId, isVoting, onClose }) {
  return (
    <div className="fixed inset-0 z-50 flex flex-col justify-end"
      style={{ background: 'rgba(10,4,28,0.7)', backdropFilter: 'blur(10px)' }}
      onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="rounded-t-3xl overflow-hidden"
        style={{ background: '#fff', maxHeight: '80vh', animation: 'sheetUp 0.35s cubic-bezier(0.16,1,0.3,1) forwards' }}>
        {/* Handle */}
        <div className="flex justify-center pt-3 pb-1">
          <div className="w-10 h-1 rounded-full" style={{ background: 'rgba(91,45,142,0.15)' }}/>
        </div>
        {/* Header */}
        <div className="px-6 py-4 flex items-center justify-between border-b" style={{ borderColor: 'rgba(91,45,142,0.07)' }}>
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl flex items-center justify-center"
              style={{ background: 'linear-gradient(135deg,#1A0A35,#2D1160)' }}>
              <i className="fas fa-chart-bar text-sm text-white"/>
            </div>
            <div>
              <h3 className="font-display font-bold text-base" style={{ color: '#1A0A35' }}>Live Leaderboard</h3>
              <p className="text-[10px]" style={{ color: '#A3A3A3', fontFamily: 'Poppins,sans-serif' }}>
                {isVoting ? 'Updated in real-time' : 'Final results'}
              </p>
            </div>
          </div>
          {isVoting && (
            <span className="flex items-center gap-1.5 text-[10px] font-bold px-2.5 py-1 rounded-full"
              style={{ background: 'rgba(22,163,74,0.12)', color: '#16a34a' }}>
              <span className="w-1.5 h-1.5 rounded-full bg-green-500" style={{ animation: 'liveBlip 1.2s infinite' }}/>LIVE
            </span>
          )}
        </div>
        {/* Rows */}
        <div className="overflow-y-auto" style={{ maxHeight: 'calc(80vh - 100px)' }}>
          {candidates.map((c, i) => {
            const v    = c._count?.votes || 0
            const p    = totalVotes > 0 ? Math.round((v / totalVotes) * 100) : 0
            const isMe = myVoteId === c.id
            const medal= ['🥇','🥈','🥉'][i] || `#${i + 1}`
            return (
              <div key={c.id} className="flex items-center gap-4 px-6 py-4 border-b last:border-0"
                style={{ borderColor: 'rgba(91,45,142,0.05)', background: isMe ? 'rgba(91,45,142,0.03)' : 'transparent' }}>
                <div className="w-8 text-center text-xl flex-shrink-0">{medal}</div>
                <div className="w-11 h-11 rounded-2xl overflow-hidden flex-shrink-0"
                  style={{ background: 'linear-gradient(135deg,#5B2D8E,#7B4DB8)' }}>
                  {c.imageUrl || c.user?.avatarUrl
                    ? <img src={c.imageUrl || c.user?.avatarUrl} alt={c.name} className="w-full h-full object-cover object-top"/>
                    : <div className="w-full h-full flex items-center justify-center text-white font-bold">{c.name?.[0]}</div>}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1.5">
                    <span className="font-semibold text-sm truncate" style={{ color: '#1A0A35', fontFamily: 'Sora,sans-serif' }}>{c.name}</span>
                    {isMe && <span className="text-[9px] font-bold px-1.5 py-0.5 rounded-full flex-shrink-0" style={{ background: 'rgba(91,45,142,0.12)', color: '#5B2D8E' }}>You</span>}
                  </div>
                  <div className="h-2 rounded-full overflow-hidden" style={{ background: 'rgba(91,45,142,0.07)' }}>
                    <div className="h-full rounded-full transition-all duration-1000"
                      style={{ width: `${p}%`, background: i === 0 ? 'linear-gradient(90deg,#F0A500,#FFB84D)' : isMe ? 'linear-gradient(90deg,#5B2D8E,#9B6BD4)' : 'rgba(91,45,142,0.2)' }}/>
                  </div>
                </div>
                <div className="text-right flex-shrink-0">
                  <div className="font-bold text-sm" style={{ color: '#1A0A35', fontFamily: 'Sora,sans-serif' }}>{p}%</div>
                  <div className="text-[10px]" style={{ color: '#A3A3A3' }}>{v} votes</div>
                </div>
              </div>
            )
          })}
          <div className="px-6 py-4 flex items-center gap-2">
            <i className="fas fa-shield-alt text-xs" style={{ color: '#5B2D8E' }}/>
            <p className="text-[11px]" style={{ color: '#A3A3A3', fontFamily: 'Poppins,sans-serif' }}>
              Votes are recorded securely. Each member can only vote once.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

/* ── Confirm modal ─────────────────────────────────────────────── */
function ConfirmModal({ candidate, isLoading, onConfirm, onCancel }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: 'rgba(10,4,28,0.9)', backdropFilter: 'blur(14px)' }}
      onClick={e => e.target === e.currentTarget && !isLoading && onCancel()}>
      <div className="bg-white rounded-3xl w-full max-w-sm overflow-hidden"
        style={{ boxShadow: '0 40px 100px rgba(26,10,53,0.45)', animation: 'fadeUp 0.3s ease forwards' }}>
        <div className="relative p-7 text-center" style={{ background: 'linear-gradient(160deg,#1A0A35,#5B2D8E)' }}>
          <div className="w-24 h-24 rounded-2xl mx-auto mb-3 overflow-hidden"
            style={{ border: '3px solid rgba(255,255,255,0.25)', boxShadow: '0 12px 32px rgba(0,0,0,0.4)' }}>
            {candidate.imageUrl || candidate.user?.avatarUrl
              ? <img src={candidate.imageUrl || candidate.user?.avatarUrl} alt={candidate.name} className="w-full h-full object-cover object-top"/>
              : <div className="w-full h-full flex items-center justify-center text-white font-bold text-3xl"
                  style={{ background: 'rgba(255,255,255,0.12)' }}>
                  {candidate.name?.[0]?.toUpperCase()}
                </div>}
          </div>
          <div className="font-display font-bold text-white text-xl">{candidate.name}</div>
          {candidate.bio && (
            <p className="text-xs mt-1 text-white/60" style={{ fontFamily: 'Poppins,sans-serif' }}>{candidate.bio}</p>
          )}
        </div>
        <div className="p-7 text-center">
          <h3 className="font-display font-bold text-xl mb-2" style={{ color: '#1A0A35' }}>Cast Your Vote?</h3>
          <p className="text-sm mb-5" style={{ color: '#737373', fontFamily: 'Poppins,sans-serif' }}>
            This action is <strong>permanent</strong> and cannot be undone.
          </p>
          <div className="flex gap-3">
            <button onClick={onCancel} disabled={isLoading}
              className="flex-1 py-3 rounded-2xl text-sm font-semibold"
              style={{ background: 'rgba(91,45,142,0.05)', color: '#737373', border: '1px solid rgba(91,45,142,0.1)' }}>
              Cancel
            </button>
            <button onClick={onConfirm} disabled={isLoading}
              className="flex-1 py-3.5 rounded-2xl text-sm font-bold text-white"
              style={{ background: 'linear-gradient(135deg,#5B2D8E,#7B4DB8)', boxShadow: '0 6px 20px rgba(91,45,142,0.4)' }}>
              {isLoading
                ? <><i className="fas fa-spinner animate-spin mr-2"/>Casting…</>
                : <><i className="fas fa-check-circle mr-2"/>Confirm Vote</>}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

/* ── Vote success overlay ──────────────────────────────────────── */
function VoteSuccess() {
  return (
    <div className="fixed inset-0 z-50 flex flex-col items-center justify-center pointer-events-none">
      {Array.from({ length: 22 }).map((_, i) => (
        <div key={i} className="absolute rounded-full"
          style={{
            left: `${5 + (i * 4.2) % 90}%`, top: '-12px',
            background: ['#5B2D8E','#F0A500','#16a34a','#0284c7','#FFB84D','#7B4DB8'][i % 6],
            animation: `confettiFall ${1.5 + (i % 5) * 0.3}s ease-in ${(i % 8) * 0.1}s forwards`,
            borderRadius: i % 3 === 0 ? '2px' : '50%',
            width: i % 4 === 0 ? 10 : 8, height: i % 4 === 0 ? 10 : 8,
          }}/>
      ))}
      <div className="bg-white rounded-3xl px-10 py-8 text-center relative"
        style={{ boxShadow: '0 40px 100px rgba(26,10,53,0.3)', animation: 'fadeUp 0.4s ease forwards', maxWidth: 320 }}>
        <div className="w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4"
          style={{ background: 'linear-gradient(135deg,#16a34a,#22c55e)', boxShadow: '0 8px 32px rgba(22,163,74,0.4)', animation: 'checkPop 0.5s cubic-bezier(0.16,1,0.3,1) forwards' }}>
          <i className="fas fa-check text-3xl text-white"/>
        </div>
        <h3 className="font-display font-bold text-2xl mb-1" style={{ color: '#1A0A35' }}>Vote Cast!</h3>
        <p className="text-sm" style={{ color: '#737373', fontFamily: 'Poppins,sans-serif' }}>
          Your vote has been recorded securely.<br/>Thank you for participating.
        </p>
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <div className="w-20 h-20 rounded-full border-4 border-green-400"
            style={{ animation: 'voteRing 1s ease-out 0.3s forwards', opacity: 0 }}/>
        </div>
      </div>
    </div>
  )
}

/* ── Main component ────────────────────────────────────────────── */
export default function ElectionDetail() {
  const { id } = useParams()
  const { user } = useAuth()
  const qc = useQueryClient()

  const [activeIdx,       setActiveIdx]       = useState(0)
  const [slideDir,        setSlideDir]        = useState('right') // 'right' | 'left'
  const [animKey,         setAnimKey]         = useState(0)
  const [confirmCandidate,setConfirmCandidate]= useState(null)
  const [voteSuccess,     setVoteSuccess]     = useState(false)
  const [showLeaderboard, setShowLeaderboard] = useState(false)
  const touchStartX = useRef(null)

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
        setConfirmCandidate(null)
        setVoteSuccess(true)
        setTimeout(() => setVoteSuccess(false), 4000)
      },
      onError: e => {
        toast.error(e.response?.data?.error || 'Failed to cast vote')
        setConfirmCandidate(null)
      },
    }
  )

  if (isLoading) return (
    <div className="max-w-3xl mx-auto px-6 py-12">
      <div className="space-y-4">{[1,2,3].map(i =>
        <div key={i} className="h-32 rounded-3xl animate-pulse" style={{ background: 'rgba(91,45,142,0.05)' }}/>)}
      </div>
    </div>
  )
  if (!election) return (
    <div className="text-center py-24"><h3 style={{ color: '#1A0A35' }}>Election not found</h3></div>
  )

  const meta       = STATUS_META[election.status] || STATUS_META.closed
  const elig       = ELIGIBILITY_META[election.eligibility] || ELIGIBILITY_META.all
  const isVoting   = election.status === 'voting'
  const isClosed   = election.status === 'closed'
  const hasVoted   = !!myVote
  const totalVotes = election._count?.votes || 0

  // Sort by votes descending for leaderboard; keep original order for carousel
  const candidates = election.candidates || []
  const sortedForBoard = [...candidates].sort((a, b) => (b._count?.votes || 0) - (a._count?.votes || 0))

  const winner = isClosed && candidates.length
    ? sortedForBoard[0]
    : null

  const navigate = (dir) => {
    setSlideDir(dir)
    setAnimKey(k => k + 1)
    setActiveIdx(i => dir === 'right'
      ? (i + 1) % candidates.length
      : (i - 1 + candidates.length) % candidates.length
    )
  }

  // Touch handlers for swipe
  const onTouchStart = e => { touchStartX.current = e.touches[0].clientX }
  const onTouchEnd   = e => {
    if (touchStartX.current === null) return
    const dx = e.changedTouches[0].clientX - touchStartX.current
    if (Math.abs(dx) > 40) navigate(dx < 0 ? 'right' : 'left')
    touchStartX.current = null
  }

  const confirmCandidateData = candidates.find(c => c.id === confirmCandidate)
  const active = candidates[activeIdx]

  return (
    <div style={{ background: '#F9F7FD', minHeight: '100vh' }}>
      <style>{STYLES}</style>

      {/* ── Top hero bar ── */}
      <div className="relative overflow-hidden" style={{ background: 'linear-gradient(135deg,#1A0A35,#2D1160)' }}>
        {election.coverImage && (
          <img src={election.coverImage} alt="" className="absolute inset-0 w-full h-full object-cover opacity-15"/>
        )}
        <div className="wave-pattern absolute inset-0 opacity-10"/>
        <div className="relative max-w-3xl mx-auto px-6 py-8">
          <Link to="/elections" className="inline-flex items-center gap-2 text-xs font-semibold mb-5 hover:gap-3 transition-all"
            style={{ color: 'rgba(255,255,255,0.5)', fontFamily: 'Sora,sans-serif' }}>
            <i className="fas fa-arrow-left"/>Back to Elections
          </Link>
          <div className="flex flex-wrap items-center gap-3 mb-3">
            <span className="text-xs font-bold px-3 py-1 rounded-full"
              style={{ background: meta.bg, color: meta.color }}>{meta.label}</span>
            {isVoting && (
              <span className="flex items-center gap-1.5 text-[10px] font-bold px-2.5 py-1 rounded-full"
                style={{ background: 'rgba(22,163,74,0.2)', color: '#4ade80', border: '1px solid rgba(22,163,74,0.25)' }}>
                <span className="w-1.5 h-1.5 rounded-full bg-green-400" style={{ animation: 'liveBlip 1.2s infinite' }}/>LIVE
              </span>
            )}
          </div>
          <h1 className="font-display font-bold text-2xl md:text-3xl text-white mb-2">{election.title}</h1>
          {election.description && (
            <p className="text-sm mb-4 max-w-xl" style={{ color: 'rgba(255,255,255,0.55)', fontFamily: 'Poppins,sans-serif' }}>
              {election.description}
            </p>
          )}
          <div className="flex flex-wrap gap-4 text-xs" style={{ color: 'rgba(255,255,255,0.4)', fontFamily: 'Poppins,sans-serif' }}>
            <span><i className="fas fa-users mr-1.5"/>{elig}</span>
            <span><i className="fas fa-vote-yea mr-1.5"/>{totalVotes} total votes</span>
            <span><i className="fas fa-user mr-1.5"/>{candidates.length} candidates</span>
            {election.endDate && <span><i className="fas fa-calendar mr-1.5"/>Ends {format(new Date(election.endDate), 'MMMM d, yyyy')}</span>}
          </div>
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-6 py-8">

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
              <div className="text-xs" style={{ color: '#737373' }}>
                {winner._count?.votes} votes · {Math.round((winner._count?.votes / totalVotes) * 100)}%
              </div>
            </div>
          </div>
        )}

        {/* Voted notice */}
        {hasVoted && !isClosed && (
          <div className="rounded-2xl p-4 mb-6 flex items-center gap-3"
            style={{ background: 'rgba(22,163,74,0.08)', border: '1px solid rgba(22,163,74,0.2)' }}>
            <i className="fas fa-check-circle text-green-600"/>
            <div className="text-sm" style={{ color: '#16a34a', fontFamily: 'Poppins,sans-serif' }}>
              You voted for <strong>{myVote?.candidate?.name}</strong>. Results shown when voting closes.
            </div>
          </div>
        )}

        {/* Login nudge */}
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

        {/* Nominations placeholder */}
        {election.status === 'nominations' ? (
          <div className="rounded-2xl p-8 text-center" style={{ background: '#fff', boxShadow: '0 2px 12px rgba(91,45,142,0.06)' }}>
            <i className="fas fa-user-plus text-4xl mb-4 block" style={{ color: 'rgba(91,45,142,0.2)' }}/>
            <h3 className="font-display font-bold text-lg mb-2" style={{ color: '#1A0A35' }}>Nominations are open</h3>
            <p className="text-sm" style={{ color: '#737373', fontFamily: 'Poppins,sans-serif' }}>
              Candidates are being registered. Voting opens when nominations close.
            </p>
          </div>
        ) : candidates.length === 0 ? (
          <div className="rounded-2xl p-8 text-center" style={{ background: '#fff', boxShadow: '0 2px 12px rgba(91,45,142,0.06)' }}>
            <p className="text-sm" style={{ color: '#A3A3A3' }}>No candidates registered yet.</p>
          </div>
        ) : (
          <>
            {/* ── Counter ── */}
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-display font-bold text-lg" style={{ color: '#1A0A35' }}>
                Candidates
              </h2>
              <span className="text-sm font-semibold" style={{ color: '#A3A3A3', fontFamily: 'Sora,sans-serif' }}>
                {activeIdx + 1} <span style={{ color: '#D4D4D4' }}>/</span> {candidates.length}
              </span>
            </div>

            {/* ── Dot navigation ── */}
            <div className="flex justify-center gap-1.5 mb-6">
              {candidates.map((_, i) => (
                <button key={i}
                  onClick={() => { setSlideDir(i > activeIdx ? 'right' : 'left'); setAnimKey(k => k+1); setActiveIdx(i) }}
                  className="rounded-full transition-all duration-300"
                  style={{
                    width: i === activeIdx ? 24 : 8, height: 8,
                    background: i === activeIdx ? '#5B2D8E' : 'rgba(91,45,142,0.18)',
                  }}/>
              ))}
            </div>

            {/* ── Carousel ── */}
            <div className="relative" onTouchStart={onTouchStart} onTouchEnd={onTouchEnd}>
              {/* Prev arrow */}
              {candidates.length > 1 && (
                <button onClick={() => navigate('left')}
                  className="absolute left-2 sm:left-0 top-1/2 z-10 w-9 h-9 sm:w-10 sm:h-10 rounded-full flex items-center justify-center transition-all hover:scale-110"
                  style={{ transform: 'translateY(-50%) translateX(0)', background: 'rgba(255,255,255,0.92)', boxShadow: '0 4px 16px rgba(91,45,142,0.18)', color: '#5B2D8E', backdropFilter: 'blur(8px)' }}>
                  <i className="fas fa-chevron-left text-sm"/>
                </button>
              )}

              {/* Active card */}
              {active && (
                <div key={`${animKey}-${active.id}`}
                  className="rounded-3xl overflow-hidden"
                  style={{
                    background: '#fff',
                    boxShadow: myVote?.candidateId === active.id
                      ? '0 0 0 3px #5B2D8E, 0 20px 60px rgba(91,45,142,0.25)'
                      : '0 8px 40px rgba(91,45,142,0.12)',
                    animation: `${slideDir === 'right' ? 'slideIn' : 'slideInLeft'} 0.35s cubic-bezier(0.16,1,0.3,1) forwards`,
                    border: myVote?.candidateId === active.id ? '2px solid #5B2D8E' : '2px solid transparent',
                  }}>

                  {/* Photo area */}
                  <div className="relative overflow-hidden" style={{ height: 280 }}>
                    {active.imageUrl || active.user?.avatarUrl
                      ? <img src={active.imageUrl || active.user?.avatarUrl} alt={active.name}
                          className="w-full h-full object-cover object-top"/>
                      : <div className="w-full h-full flex flex-col items-center justify-center gap-3"
                          style={{ background: 'linear-gradient(160deg,#1A0A35,#5B2D8E)' }}>
                          <div className="w-28 h-28 rounded-full flex items-center justify-center text-white font-display font-extrabold text-6xl"
                            style={{ background: 'rgba(255,255,255,0.1)', border: '2px solid rgba(255,255,255,0.18)' }}>
                            {active.name?.[0]?.toUpperCase()}
                          </div>
                        </div>}
                    {/* Gradient overlay */}
                    <div className="absolute inset-0" style={{ background: 'linear-gradient(to top, rgba(10,4,28,0.85) 0%, rgba(10,4,28,0.3) 40%, transparent 70%)' }}/>
                    {/* Name on photo */}
                    <div className="absolute bottom-0 left-0 right-0 p-5">
                      <h3 className="font-display font-bold text-2xl text-white leading-tight mb-1">{active.name}</h3>
                      {active.bio && (
                        <p className="text-sm text-white/70" style={{ fontFamily: 'Poppins,sans-serif' }}>{active.bio}</p>
                      )}
                    </div>
                    {/* My vote badge */}
                    {myVote?.candidateId === active.id && (
                      <div className="absolute top-4 left-4">
                        <div className="flex items-center gap-1.5 text-xs font-bold px-3 py-1.5 rounded-full"
                          style={{ background: 'rgba(91,45,142,0.9)', color: '#fff', backdropFilter: 'blur(8px)' }}>
                          <i className="fas fa-check text-[10px]"/>Your Vote
                        </div>
                      </div>
                    )}
                    {/* Leading badge */}
                    {(hasVoted || isClosed) && sortedForBoard[0]?.id === active.id && (active._count?.votes || 0) > 0 && (
                      <div className="absolute top-4 right-4">
                        <div className="flex items-center gap-1.5 text-xs font-bold px-3 py-1.5 rounded-full"
                          style={{ background: 'rgba(240,165,0,0.9)', color: '#1A0A35', backdropFilter: 'blur(8px)' }}>
                          <i className="fas fa-crown text-[10px]"/>Leading
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Card body */}
                  <div className="p-6 space-y-4">
                    {/* Manifesto */}
                    {active.manifesto && (
                      <div className="p-4 rounded-2xl" style={{ background: 'rgba(91,45,142,0.04)', border: '1px solid rgba(91,45,142,0.08)' }}>
                        <div className="text-xs font-bold uppercase tracking-widest mb-2" style={{ color: '#5B2D8E', fontFamily: 'Sora,sans-serif' }}>
                          <i className="fas fa-quote-left mr-1.5"/>Manifesto
                        </div>
                        <p className="text-sm leading-relaxed italic" style={{ color: '#525252', fontFamily: 'Poppins,sans-serif' }}>
                          {active.manifesto}
                        </p>
                      </div>
                    )}

                    {/* Vote bar (visible after voting / when closed) */}
                    {(hasVoted || isClosed) && (
                      <div>
                        <div className="flex justify-between text-xs mb-2" style={{ fontFamily: 'Poppins,sans-serif' }}>
                          <span style={{ color: '#737373' }}>
                            <strong style={{ color: '#1A0A35' }}>{active._count?.votes || 0}</strong> vote{(active._count?.votes || 0) !== 1 ? 's' : ''}
                          </span>
                          <span style={{ color: '#5B2D8E', fontWeight: 700 }}>
                            {totalVotes > 0 ? Math.round(((active._count?.votes || 0) / totalVotes) * 100) : 0}%
                          </span>
                        </div>
                        <div className="h-3 rounded-full overflow-hidden" style={{ background: 'rgba(91,45,142,0.08)' }}>
                          <div className="h-full rounded-full transition-all duration-1000"
                            style={{
                              width: `${totalVotes > 0 ? Math.round(((active._count?.votes || 0) / totalVotes) * 100) : 0}%`,
                              background: myVote?.candidateId === active.id
                                ? 'linear-gradient(90deg,#5B2D8E,#9B6BD4)'
                                : sortedForBoard[0]?.id === active.id
                                  ? 'linear-gradient(90deg,#F0A500,#FFB84D)'
                                  : 'rgba(91,45,142,0.25)',
                            }}/>
                        </div>
                      </div>
                    )}

                    {/* Vote button */}
                    {isVoting && !hasVoted && !!user && (
                      <button onClick={() => setConfirmCandidate(active.id)}
                        className="w-full py-4 rounded-2xl font-bold text-base text-white transition-all hover:opacity-90 active:scale-95 flex items-center justify-center gap-2"
                        style={{ background: 'linear-gradient(135deg,#5B2D8E,#7B4DB8)', boxShadow: '0 8px 24px rgba(91,45,142,0.4)', animation: 'glowPulse 2.5s ease-in-out infinite' }}>
                        <i className="fas fa-vote-yea"/>Vote for {active.name.split(' ')[0]}
                      </button>
                    )}
                  </div>
                </div>
              )}

              {/* Next arrow */}
              {candidates.length > 1 && (
                <button onClick={() => navigate('right')}
                  className="absolute right-2 sm:right-0 top-1/2 z-10 w-9 h-9 sm:w-10 sm:h-10 rounded-full flex items-center justify-center transition-all hover:scale-110"
                  style={{ transform: 'translateY(-50%) translateX(0)', background: 'rgba(255,255,255,0.92)', boxShadow: '0 4px 16px rgba(91,45,142,0.18)', color: '#5B2D8E', backdropFilter: 'blur(8px)' }}>
                  <i className="fas fa-chevron-right text-sm"/>
                </button>
              )}
            </div>

            {/* ── Thumbnail strip ── */}
            {candidates.length > 1 && (
              <div className="flex gap-2 mt-5 overflow-x-auto pb-1" style={{ scrollbarWidth: 'none' }}>
                {candidates.map((c, i) => (
                  <button key={c.id}
                    onClick={() => { setSlideDir(i > activeIdx ? 'right' : 'left'); setAnimKey(k => k+1); setActiveIdx(i) }}
                    className="flex-shrink-0 rounded-2xl overflow-hidden transition-all duration-200"
                    style={{
                      width: 64, height: 72,
                      border: i === activeIdx ? '2px solid #5B2D8E' : '2px solid transparent',
                      opacity: i === activeIdx ? 1 : 0.55,
                      background: 'linear-gradient(135deg,#5B2D8E,#7B4DB8)',
                    }}>
                    {c.imageUrl || c.user?.avatarUrl
                      ? <img src={c.imageUrl || c.user?.avatarUrl} alt={c.name} className="w-full h-full object-cover object-top"/>
                      : <div className="w-full h-full flex items-center justify-center text-white font-bold text-lg">
                          {c.name?.[0]?.toUpperCase()}
                        </div>}
                  </button>
                ))}
              </div>
            )}

            {/* ── Leaderboard toggle button ── */}
            <button onClick={() => setShowLeaderboard(true)}
              className="w-full mt-6 py-3.5 rounded-2xl font-semibold text-sm flex items-center justify-center gap-2 transition-all hover:opacity-80"
              style={{ background: 'rgba(91,45,142,0.07)', color: '#5B2D8E', border: '1px solid rgba(91,45,142,0.12)', fontFamily: 'Sora,sans-serif' }}>
              <i className="fas fa-chart-bar text-xs"/>
              {isVoting ? 'View Live Leaderboard' : 'View Final Results'}
              {isVoting && <span className="w-1.5 h-1.5 rounded-full bg-green-400 ml-1" style={{ animation: 'liveBlip 1.2s infinite' }}/>}
            </button>
          </>
        )}
      </div>

      {/* Modals */}
      {confirmCandidate && confirmCandidateData && (
        <ConfirmModal
          candidate={confirmCandidateData}
          isLoading={voteMut.isLoading}
          onConfirm={() => voteMut.mutate(confirmCandidate)}
          onCancel={() => setConfirmCandidate(null)}
        />
      )}

      {showLeaderboard && (
        <LeaderboardSheet
          candidates={sortedForBoard}
          totalVotes={totalVotes}
          myVoteId={myVote?.candidateId}
          isVoting={isVoting}
          onClose={() => setShowLeaderboard(false)}
        />
      )}

      {voteSuccess && <VoteSuccess/>}
    </div>
  )
}
