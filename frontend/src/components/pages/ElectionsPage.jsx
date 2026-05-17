import { useState } from 'react'
import { useQuery } from 'react-query'
import { Link } from 'react-router-dom'
import { format } from 'date-fns'
import api from '../../services/api'

const PAGE_STYLES = `
@keyframes liveBlip { 0%,100%{opacity:1;transform:scale(1)} 50%{opacity:0.4;transform:scale(0.85)} }
@keyframes floatUp  { from{opacity:0;transform:translateY(20px)} to{opacity:1;transform:translateY(0)} }
@keyframes shimmer  { 0%{background-position:-400px 0} 100%{background-position:400px 0} }
`

const STATUS_META = {
  draft:       { label: 'Draft',            color: '#A3A3A3', bg: 'rgba(163,163,163,0.12)', icon: 'fa-pencil-alt' },
  nominations: { label: 'Nominations Open', color: '#0284c7', bg: 'rgba(2,132,199,0.12)',   icon: 'fa-user-plus'  },
  voting:      { label: 'Voting Open',      color: '#16a34a', bg: 'rgba(22,163,74,0.12)',   icon: 'fa-vote-yea'   },
  closed:      { label: 'Closed',           color: '#737373', bg: 'rgba(115,115,115,0.1)',  icon: 'fa-lock'       },
}

const TYPE_ICON = { leadership: 'fa-crown', committee: 'fa-users-cog', general: 'fa-landmark' }

/* ── Candidate avatar strip ──────────────────────────────────────── */
function CandidateAvatars({ candidates, max = 5 }) {
  if (!candidates?.length) return null
  const shown = candidates.slice(0, max)
  const extra = candidates.length - max
  return (
    <div className="flex items-center">
      {shown.map((c, i) => (
        <div key={c.id}
          className="w-8 h-8 rounded-full border-2 border-white overflow-hidden flex-shrink-0 -ml-2 first:ml-0"
          style={{ zIndex: max - i, background: 'linear-gradient(135deg,#5B2D8E,#7B4DB8)', boxShadow: '0 2px 6px rgba(26,10,53,0.18)' }}>
          {c.imageUrl || c.user?.avatarUrl
            ? <img src={c.imageUrl || c.user?.avatarUrl} alt={c.name} className="w-full h-full object-cover object-top"/>
            : <div className="w-full h-full flex items-center justify-center text-white font-bold text-[10px]">
                {c.name?.[0]?.toUpperCase()}
              </div>}
        </div>
      ))}
      {extra > 0 && (
        <div className="w-8 h-8 rounded-full border-2 border-white -ml-2 flex items-center justify-center text-[10px] font-bold"
          style={{ background: 'rgba(91,45,142,0.15)', color: '#5B2D8E' }}>
          +{extra}
        </div>
      )}
    </div>
  )
}

/* ── Featured (Voting Open) spotlight card ───────────────────────── */
function SpotlightCard({ election }) {
  const total    = election._count?.votes || 0
  const maxVotes = Math.max(...(election.candidates?.map(c => c._count?.votes || 0) || [0]), 1)
  const top3     = [...(election.candidates || [])].sort((a, b) => (b._count?.votes||0) - (a._count?.votes||0)).slice(0, 3)

  return (
    <div className="relative rounded-3xl overflow-hidden mb-10" style={{ animation: 'floatUp 0.5s ease forwards' }}>
      {/* Background */}
      <div className="absolute inset-0" style={{ background: 'linear-gradient(135deg,#1A0A35 0%,#2D1160 50%,#5B2D8E 100%)' }}/>
      {election.coverImage && (
        <img src={election.coverImage} alt="" className="absolute inset-0 w-full h-full object-cover opacity-20"/>
      )}
      <div className="wave-pattern absolute inset-0 opacity-10"/>

      <div className="relative p-7 md:p-10">
        {/* Top row */}
        <div className="flex flex-wrap items-center gap-3 mb-5">
          <span className="flex items-center gap-1.5 text-[11px] font-bold px-3 py-1 rounded-full"
            style={{ background: 'rgba(22,163,74,0.25)', color: '#4ade80', border: '1px solid rgba(22,163,74,0.3)' }}>
            <span className="w-1.5 h-1.5 rounded-full bg-green-400" style={{ animation: 'liveBlip 1.4s ease-in-out infinite' }}/>
            LIVE · VOTING OPEN
          </span>
          <span className="text-[11px] font-semibold px-3 py-1 rounded-full capitalize"
            style={{ background: 'rgba(255,255,255,0.1)', color: 'rgba(255,255,255,0.7)' }}>
            <i className={`fas ${TYPE_ICON[election.type] || 'fa-vote-yea'} mr-1.5`}/>{election.type}
          </span>
        </div>

        <div className="md:flex md:items-start md:gap-8">
          <div className="flex-1 mb-6 md:mb-0">
            <h2 className="font-display font-bold text-2xl md:text-3xl text-white mb-3 leading-snug">
              {election.title}
            </h2>
            {election.description && (
              <p className="text-sm leading-relaxed mb-4" style={{ color: 'rgba(255,255,255,0.6)', fontFamily: 'Poppins,sans-serif' }}>
                {election.description}
              </p>
            )}
            <div className="flex flex-wrap gap-4 text-xs mb-5" style={{ color: 'rgba(255,255,255,0.5)', fontFamily: 'Poppins,sans-serif' }}>
              <span><i className="fas fa-users mr-1.5"/>{election.candidates?.length || 0} candidates</span>
              <span><i className="fas fa-vote-yea mr-1.5"/>{total} votes cast</span>
              {election.endDate && (
                <span><i className="fas fa-clock mr-1.5"/>Closes {format(new Date(election.endDate), 'MMM d, yyyy')}</span>
              )}
            </div>
            <Link to={`/elections/${election.id}`}
              className="inline-flex items-center gap-2 px-6 py-3 rounded-2xl text-sm font-bold transition-all hover:opacity-90"
              style={{ background: 'linear-gradient(135deg,#F0A500,#FFB84D)', color: '#1A0A35', boxShadow: '0 8px 24px rgba(240,165,0,0.35)' }}>
              <i className="fas fa-vote-yea"/>Cast Your Vote
            </Link>
          </div>

          {/* Mini leaderboard */}
          {top3.length > 0 && (
            <div className="md:w-64 rounded-2xl overflow-hidden" style={{ background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.1)' }}>
              <div className="px-4 py-2.5 border-b" style={{ borderColor: 'rgba(255,255,255,0.08)' }}>
                <span className="text-xs font-bold uppercase tracking-widest" style={{ color: 'rgba(255,255,255,0.5)' }}>
                  Current Standing
                </span>
              </div>
              {top3.map((c, i) => {
                const v = c._count?.votes || 0
                const p = Math.round((v / maxVotes) * 100)
                const medals = ['🥇','🥈','🥉']
                return (
                  <div key={c.id} className="px-4 py-2.5 flex items-center gap-3">
                    <span className="text-base w-5 flex-shrink-0">{medals[i]}</span>
                    <div className="w-7 h-7 rounded-lg overflow-hidden flex-shrink-0"
                      style={{ background: 'linear-gradient(135deg,#5B2D8E,#7B4DB8)' }}>
                      {c.imageUrl || c.user?.avatarUrl
                        ? <img src={c.imageUrl || c.user?.avatarUrl} alt={c.name} className="w-full h-full object-cover object-top"/>
                        : <div className="w-full h-full flex items-center justify-center text-white font-bold text-[9px]">{c.name?.[0]}</div>}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-xs font-semibold text-white truncate">{c.name}</div>
                      <div className="h-1 mt-1 rounded-full overflow-hidden" style={{ background: 'rgba(255,255,255,0.1)' }}>
                        <div className="h-full rounded-full"
                          style={{ width: `${p}%`, background: i === 0 ? 'linear-gradient(90deg,#F0A500,#FFB84D)' : 'rgba(255,255,255,0.4)' }}/>
                      </div>
                    </div>
                    <span className="text-[10px] font-bold flex-shrink-0" style={{ color: 'rgba(255,255,255,0.5)' }}>{v}</span>
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

/* ── Regular election card ───────────────────────────────────────── */
function ElectionCard({ election, index }) {
  const meta     = STATUS_META[election.status] || STATUS_META.closed
  const total    = election._count?.votes || 0
  const isVoting = election.status === 'voting'
  const isClosed = election.status === 'closed'
  const maxVotes = Math.max(...(election.candidates?.map(c => c._count?.votes || 0) || [0]), 1)
  const leader   = isClosed && election.candidates?.length
    ? [...election.candidates].sort((a, b) => (b._count?.votes||0) - (a._count?.votes||0))[0]
    : null

  return (
    <div className="rounded-3xl overflow-hidden flex flex-col transition-all duration-300 hover:-translate-y-1 hover:shadow-2xl"
      style={{
        background: '#fff',
        boxShadow: '0 4px 20px rgba(91,45,142,0.07)',
        border: isVoting ? '2px solid rgba(22,163,74,0.3)' : '2px solid transparent',
        animation: `floatUp 0.4s ease ${index * 0.05}s both`,
      }}>

      {/* Cover image */}
      {election.coverImage
        ? <img src={election.coverImage} alt={election.title} className="w-full h-40 object-cover"/>
        : (
          <div className="w-full h-32 flex items-center justify-center relative overflow-hidden"
            style={{ background: `linear-gradient(135deg,#1A0A35,#2D1160)` }}>
            <div className="wave-pattern absolute inset-0 opacity-20"/>
            <i className={`fas ${TYPE_ICON[election.type] || 'fa-vote-yea'} text-4xl relative`}
              style={{ color: 'rgba(255,255,255,0.15)' }}/>
          </div>
        )}

      <div className="p-5 flex flex-col flex-1 gap-3">
        {/* Status + type */}
        <div className="flex items-center gap-2 flex-wrap">
          <span className="flex items-center gap-1.5 text-[10px] font-bold px-2.5 py-1 rounded-full"
            style={{ background: meta.bg, color: meta.color }}>
            {isVoting && <span className="w-1.5 h-1.5 rounded-full bg-green-400" style={{ animation: 'liveBlip 1.4s ease-in-out infinite' }}/>}
            <i className={`fas ${meta.icon} text-[9px]`}/>{meta.label}
          </span>
          <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full capitalize"
            style={{ background: 'rgba(91,45,142,0.06)', color: '#A3A3A3' }}>
            {election.type}
          </span>
        </div>

        <h3 className="font-display font-bold text-base leading-snug" style={{ color: '#1A0A35' }}>
          {election.title}
        </h3>

        {election.description && (
          <p className="text-xs leading-relaxed line-clamp-2" style={{ color: '#737373', fontFamily: 'Poppins,sans-serif' }}>
            {election.description}
          </p>
        )}

        {/* Winner banner (closed) */}
        {isClosed && leader && (leader._count?.votes || 0) > 0 && (
          <div className="flex items-center gap-2.5 px-3 py-2 rounded-xl"
            style={{ background: 'linear-gradient(135deg,rgba(240,165,0,0.08),rgba(255,184,77,0.08))', border: '1px solid rgba(240,165,0,0.2)' }}>
            <i className="fas fa-trophy text-sm" style={{ color: '#F0A500' }}/>
            <div>
              <div className="text-[9px] font-bold uppercase tracking-wider" style={{ color: '#C87800' }}>Winner</div>
              <div className="text-xs font-semibold" style={{ color: '#1A0A35' }}>{leader.name}</div>
            </div>
          </div>
        )}

        {/* Mini vote bars (voting/closed) */}
        {election.candidates?.length > 0 && (isVoting || isClosed) && (
          <div className="space-y-1.5">
            {[...election.candidates]
              .sort((a, b) => (b._count?.votes||0) - (a._count?.votes||0))
              .slice(0, 3)
              .map((c, i) => {
                const v = c._count?.votes || 0
                const p = Math.round((v / maxVotes) * 100)
                return (
                  <div key={c.id}>
                    <div className="flex items-center justify-between text-[10px] mb-0.5" style={{ fontFamily: 'Poppins,sans-serif' }}>
                      <div className="flex items-center gap-1.5">
                        <div className="w-4 h-4 rounded overflow-hidden flex-shrink-0"
                          style={{ background: 'linear-gradient(135deg,#5B2D8E,#7B4DB8)' }}>
                          {c.imageUrl || c.user?.avatarUrl
                            ? <img src={c.imageUrl || c.user?.avatarUrl} alt={c.name} className="w-full h-full object-cover object-top"/>
                            : <div className="w-full h-full flex items-center justify-center text-white font-bold" style={{ fontSize: 7 }}>{c.name?.[0]}</div>}
                        </div>
                        <span className="truncate max-w-[100px]" style={{ color: '#525252' }}>{c.name}</span>
                      </div>
                      <span style={{ color: '#A3A3A3' }}>{v}</span>
                    </div>
                    <div className="h-1.5 rounded-full overflow-hidden" style={{ background: 'rgba(91,45,142,0.07)' }}>
                      <div className="h-full rounded-full transition-all duration-700"
                        style={{ width: `${p}%`, background: i === 0 ? 'linear-gradient(90deg,#5B2D8E,#9B6BD4)' : 'rgba(91,45,142,0.18)' }}/>
                    </div>
                  </div>
                )
              })}
            {election.candidates.length > 3 && (
              <p className="text-[10px]" style={{ color: '#A3A3A3' }}>+{election.candidates.length - 3} more</p>
            )}
          </div>
        )}

        {/* Nominations: candidate avatar strip */}
        {election.status === 'nominations' && election.candidates?.length > 0 && (
          <div className="flex items-center gap-2">
            <CandidateAvatars candidates={election.candidates}/>
            <span className="text-xs" style={{ color: '#A3A3A3', fontFamily: 'Poppins,sans-serif' }}>
              {election.candidates.length} nominated
            </span>
          </div>
        )}

        {/* Footer */}
        <div className="flex items-center justify-between pt-3 mt-auto border-t" style={{ borderColor: 'rgba(91,45,142,0.06)' }}>
          <div className="flex flex-col gap-0.5">
            {total > 0 && (
              <span className="text-[10px] font-semibold" style={{ color: '#5B2D8E', fontFamily: 'Sora,sans-serif' }}>
                <i className="fas fa-vote-yea mr-1"/>{total} votes
              </span>
            )}
            {election.endDate && (
              <span className="text-[10px]" style={{ color: '#A3A3A3', fontFamily: 'Poppins,sans-serif' }}>
                <i className="fas fa-calendar mr-1"/>
                {isClosed ? 'Closed ' : 'Ends '}
                {format(new Date(election.endDate), 'MMM d, yyyy')}
              </span>
            )}
          </div>
          <Link to={`/elections/${election.id}`}
            className="text-xs font-bold px-4 py-2 rounded-xl transition-all hover:opacity-90 flex items-center gap-1.5"
            style={{
              background: isVoting ? 'linear-gradient(135deg,#5B2D8E,#7B4DB8)' : 'rgba(91,45,142,0.08)',
              color: isVoting ? '#fff' : '#5B2D8E',
              boxShadow: isVoting ? '0 4px 12px rgba(91,45,142,0.3)' : 'none',
            }}>
            {isVoting ? <><i className="fas fa-vote-yea"/>Vote Now</> : 'View Details'}
          </Link>
        </div>
      </div>
    </div>
  )
}

/* ── Stats bar ───────────────────────────────────────────────────── */
function StatsBar({ elections }) {
  const voting      = elections.filter(e => e.status === 'voting').length
  const nominations = elections.filter(e => e.status === 'nominations').length
  const totalVotes  = elections.reduce((s, e) => s + (e._count?.votes || 0), 0)
  const totalCands  = elections.reduce((s, e) => s + (e.candidates?.length || 0), 0)
  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-8">
      {[
        { icon: 'fa-vote-yea', value: voting,      label: 'Active Votes',  color: '#16a34a', bg: 'rgba(22,163,74,0.08)'   },
        { icon: 'fa-user-plus',value: nominations, label: 'Nominations',   color: '#0284c7', bg: 'rgba(2,132,199,0.08)'   },
        { icon: 'fa-ballot',   value: totalVotes,  label: 'Votes Cast',    color: '#5B2D8E', bg: 'rgba(91,45,142,0.08)'   },
        { icon: 'fa-users',    value: totalCands,  label: 'Total Candidates', color: '#F0A500', bg: 'rgba(240,165,0,0.08)'},
      ].map(s => (
        <div key={s.label} className="rounded-2xl px-4 py-3 flex items-center gap-3"
          style={{ background: s.bg, border: `1px solid ${s.bg.replace('0.08','0.2')}` }}>
          <div className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0"
            style={{ background: s.bg.replace('0.08','0.15') }}>
            <i className={`fas ${s.icon} text-sm`} style={{ color: s.color }}/>
          </div>
          <div>
            <div className="font-display font-bold text-xl" style={{ color: '#1A0A35' }}>{s.value}</div>
            <div className="text-[10px] font-semibold" style={{ color: s.color, fontFamily: 'Sora,sans-serif' }}>{s.label}</div>
          </div>
        </div>
      ))}
    </div>
  )
}

/* ── Main page ───────────────────────────────────────────────────── */
export default function ElectionsPage() {
  const [filter, setFilter] = useState('')
  const { data: elections = [], isLoading } = useQuery(
    ['elections', filter],
    () => api.get('/elections', { params: filter ? { status: filter } : {} }).then(r => r.data)
  )

  const liveElection = !filter && elections.find(e => e.status === 'voting')
  const restElections = liveElection ? elections.filter(e => e.id !== liveElection.id) : elections

  return (
    <div style={{ background: '#F9F7FD', minHeight: '100vh' }}>
      <style>{PAGE_STYLES}</style>

      {/* Hero */}
      <div className="relative py-20 overflow-hidden" style={{ background: 'linear-gradient(135deg,#1A0A35,#250F47)' }}>
        <div className="wave-pattern absolute inset-0 opacity-20"/>
        {/* Decorative orbs */}
        <div className="absolute top-0 right-0 w-96 h-96 rounded-full opacity-10"
          style={{ background: 'radial-gradient(circle,#5B2D8E,transparent)', transform: 'translate(30%,-30%)' }}/>
        <div className="absolute bottom-0 left-0 w-64 h-64 rounded-full opacity-10"
          style={{ background: 'radial-gradient(circle,#F0A500,transparent)', transform: 'translate(-30%,30%)' }}/>

        <div className="relative max-w-4xl mx-auto px-6 text-center">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full mb-5"
            style={{ background: 'rgba(240,165,0,0.15)', border: '1px solid rgba(240,165,0,0.25)' }}>
            <i className="fas fa-landmark text-xs" style={{ color: '#F0A500' }}/>
            <span className="text-xs font-bold uppercase tracking-widest" style={{ color: '#F0A500', fontFamily: 'Sora,sans-serif' }}>
              Democratic Governance
            </span>
          </div>
          <h1 className="font-display font-bold text-4xl md:text-5xl text-white mb-4">
            Community <span style={{ color: '#F0A500' }}>Elections</span>
          </h1>
          <p className="text-base max-w-xl mx-auto mb-8" style={{ color: 'rgba(255,255,255,0.65)', fontFamily: 'Poppins,sans-serif' }}>
            Participate in free, transparent elections to choose the leaders and representatives of Nkenkak-Ngiesang.
          </p>
          {elections.some(e => e.status === 'voting') && (
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full"
              style={{ background: 'rgba(22,163,74,0.2)', border: '1px solid rgba(22,163,74,0.3)' }}>
              <span className="w-2 h-2 rounded-full bg-green-400" style={{ animation: 'liveBlip 1.4s ease-in-out infinite' }}/>
              <span className="text-xs font-bold" style={{ color: '#4ade80' }}>Voting is currently open — your voice matters!</span>
            </div>
          )}
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-6 py-10">

        {/* Stats */}
        {!isLoading && elections.length > 0 && <StatsBar elections={elections}/>}

        {/* Filter tabs */}
        <div className="flex flex-wrap gap-2 mb-8">
          {[['','All Elections'],['voting','Voting Open'],['nominations','Nominations'],['closed','Closed']].map(([v,l]) => (
            <button key={v} onClick={() => setFilter(v)}
              className="text-xs font-semibold px-4 py-2 rounded-xl transition-all"
              style={{
                background: filter === v ? '#5B2D8E' : 'rgba(91,45,142,0.07)',
                color: filter === v ? '#fff' : '#737373',
                fontFamily: 'Sora,sans-serif',
              }}>
              {v === 'voting' && <span className="w-1.5 h-1.5 rounded-full bg-green-400 inline-block mr-1.5 align-middle" style={{ animation: filter === 'voting' ? 'none' : 'liveBlip 1.4s ease-in-out infinite' }}/>}
              {l}
            </button>
          ))}
        </div>

        {isLoading ? (
          <div className="grid md:grid-cols-2 gap-5">
            {[1,2,3,4].map(i => (
              <div key={i} className="h-72 rounded-3xl" style={{
                background: 'linear-gradient(90deg,rgba(91,45,142,0.05) 0%,rgba(91,45,142,0.09) 50%,rgba(91,45,142,0.05) 100%)',
                backgroundSize: '800px 100%',
                animation: 'shimmer 1.5s infinite',
              }}/>
            ))}
          </div>
        ) : !elections.length ? (
          <div className="text-center py-24 rounded-3xl"
            style={{ background: 'rgba(91,45,142,0.02)', border: '1px dashed rgba(91,45,142,0.12)' }}>
            <div className="w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4"
              style={{ background: 'rgba(91,45,142,0.06)' }}>
              <i className="fas fa-vote-yea text-3xl" style={{ color: 'rgba(91,45,142,0.3)' }}/>
            </div>
            <h3 className="font-display font-bold text-xl mb-2" style={{ color: '#1A0A35' }}>No elections found</h3>
            <p className="text-sm" style={{ color: '#737373', fontFamily: 'Poppins,sans-serif' }}>
              Elections created by the council will appear here.
            </p>
          </div>
        ) : (
          <>
            {/* Spotlight for live voting election */}
            {liveElection && <SpotlightCard election={liveElection}/>}

            {/* Rest of elections */}
            {restElections.length > 0 && (
              <>
                {liveElection && (
                  <h2 className="font-display font-bold text-lg mb-4" style={{ color: '#1A0A35' }}>
                    Other Elections
                  </h2>
                )}
                <div className="grid md:grid-cols-2 gap-5">
                  {restElections.map((e, i) => <ElectionCard key={e.id} election={e} index={i}/>)}
                </div>
              </>
            )}
          </>
        )}
      </div>
    </div>
  )
}
