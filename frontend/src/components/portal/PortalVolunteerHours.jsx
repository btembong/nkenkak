import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from 'react-query'
import { useForm } from 'react-hook-form'
import { format } from 'date-fns'
import toast from 'react-hot-toast'
import api from '../../services/api'

/* ─── helpers ─── */
function PageHeader({ title, sub, icon }) {
  return (
    <div className="mb-8">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-2xl flex items-center justify-center"
          style={{background:'linear-gradient(135deg,#5B2D8E,#7B4DB8)'}}>
          <i className={`fas ${icon} text-sm text-white`}/>
        </div>
        <div>
          <h1 className="font-display font-bold text-2xl" style={{color:'#1A0A35'}}>{title}</h1>
          {sub && <p className="text-sm" style={{color:'#737373',fontFamily:'Poppins,sans-serif'}}>{sub}</p>}
        </div>
      </div>
    </div>
  )
}

const STATUS_CFG = {
  pending:  { label:'Pending Review', color:'#C87800',  bg:'rgba(240,165,0,0.1)',    icon:'fa-clock'        },
  approved: { label:'Approved',       color:'#16a34a',  bg:'rgba(22,163,74,0.1)',   icon:'fa-check-circle' },
  rejected: { label:'Declined',       color:'#dc2626',  bg:'rgba(220,38,38,0.1)',   icon:'fa-times-circle' },
}

const ACTIVITIES = [
  'Community Clean-up',
  'Food Distribution',
  'School Support / Tutoring',
  'Health & Welfare Visit',
  'Infrastructure Work',
  'Cultural Event Organisation',
  'Fundraising Activity',
  'Administrative Support',
  'Youth Programme',
  'Mentorship / Coaching',
  'Environment / Planting',
  'Other',
]

export default function PortalVolunteerHours() {
  const qc = useQueryClient()
  const [showForm, setShowForm] = useState(false)
  const { register, handleSubmit, reset, formState: { errors } } = useForm()

  const { data, isLoading } = useQuery('my-volunteer-hours', () =>
    api.get('/volunteer/my').then(r => r.data)
  )
  const { data: badgeDefs } = useQuery('badge-defs', () =>
    api.get('/volunteer/badges').then(r => r.data)
  )
  const { data: leaderboard } = useQuery('volunteer-leaderboard', () =>
    api.get('/volunteer/leaderboard').then(r => r.data)
  )

  const logMut = useMutation(d => api.post('/volunteer', d), {
    onSuccess: () => {
      toast.success('Hours logged! Pending admin review.')
      qc.invalidateQueries('my-volunteer-hours')
      reset()
      setShowForm(false)
    },
    onError: e => toast.error(e.response?.data?.error || 'Failed to log hours'),
  })

  const hours    = data?.hours || []
  const approved = data?.approvedTotal || 0
  const pending  = data?.pendingTotal || 0
  const myBadges = data?.badges || []

  // Which badges not yet earned
  const locked = (badgeDefs || []).filter(b => approved < b.hours)
  const earned = (badgeDefs || []).filter(b => approved >= b.hours)

  return (
    <div>
      <PageHeader title="Volunteer Hours" sub="Log your contribution time and earn badges" icon="fa-hands-helping"/>

      {/* Stats strip */}
      <div className="grid grid-cols-3 gap-4 mb-8">
        {[
          { icon:'fa-check-circle', label:'Approved Hours', value:`${approved}h`,  color:'#16a34a', bg:'rgba(22,163,74,0.08)'  },
          { icon:'fa-clock',        label:'Pending Review', value:`${pending}h`,   color:'#C87800', bg:'rgba(240,165,0,0.1)'   },
          { icon:'fa-medal',        label:'Badges Earned',  value:earned.length,  color:'#5B2D8E', bg:'rgba(91,45,142,0.08)'  },
        ].map(s => (
          <div key={s.label} className="card p-5">
            <div className="w-11 h-11 rounded-2xl flex items-center justify-center mb-3" style={{background:s.bg}}>
              <i className={`fas ${s.icon} text-lg`} style={{color:s.color}}/>
            </div>
            <div className="font-display font-bold text-2xl" style={{color:'#1A0A35'}}>{s.value}</div>
            <div className="text-xs mt-0.5" style={{color:'#A3A3A3',fontFamily:'Poppins,sans-serif'}}>{s.label}</div>
          </div>
        ))}
      </div>

      {/* Badges showcase */}
      <div className="card p-6 mb-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-display font-semibold text-base" style={{color:'#1A0A35'}}>Achievement Badges</h3>
          <span className="text-xs" style={{color:'#A3A3A3',fontFamily:'Poppins,sans-serif'}}>{approved}h approved</span>
        </div>
        <div className="flex flex-wrap gap-3">
          {(badgeDefs || []).map(b => {
            const isEarned = approved >= b.hours
            return (
              <div key={b.id}
                title={`${b.label} — ${b.hours}h required`}
                className="flex flex-col items-center gap-1.5 px-4 py-3 rounded-2xl transition-all"
                style={{
                  background: isEarned ? `${b.color}14` : 'rgba(0,0,0,0.04)',
                  border: `1px solid ${isEarned ? b.color+'30' : 'transparent'}`,
                  opacity: isEarned ? 1 : 0.4,
                  minWidth: 76,
                }}>
                <i className={`fas ${b.icon} text-2xl`} style={{color: isEarned ? b.color : '#C4C4C4'}}/>
                <span className="text-[10px] font-bold text-center leading-tight" style={{color: isEarned ? b.color : '#A3A3A3', fontFamily:'Sora,sans-serif'}}>{b.label}</span>
                <span className="text-[9px]" style={{color:'#A3A3A3',fontFamily:'Poppins,sans-serif'}}>{b.hours}h</span>
              </div>
            )
          })}
        </div>
        {/* Progress to next badge */}
        {locked.length > 0 && (
          <div className="mt-4 pt-4 border-t" style={{borderColor:'rgba(91,45,142,0.08)'}}>
            <div className="flex items-center justify-between text-xs mb-2" style={{fontFamily:'Poppins,sans-serif'}}>
              <span style={{color:'#737373'}}>Next: <strong style={{color:'#1A0A35'}}>{locked[0].label}</strong></span>
              <span style={{color:'#5B2D8E'}}>{approved}h / {locked[0].hours}h</span>
            </div>
            <div className="h-2 rounded-full overflow-hidden" style={{background:'rgba(91,45,142,0.08)'}}>
              <div className="h-full rounded-full transition-all"
                style={{
                  width: `${Math.min(100, (approved / locked[0].hours) * 100)}%`,
                  background: 'linear-gradient(90deg,#5B2D8E,#F0A500)',
                }}/>
            </div>
          </div>
        )}
        {locked.length === 0 && approved > 0 && (
          <p className="mt-3 text-sm font-semibold" style={{color:'#F0A500',fontFamily:'Sora,sans-serif'}}>
            All badges earned — you are a Community Legend!
          </p>
        )}
      </div>

      {/* Log hours button + form */}
      <div className="mb-6">
        {!showForm ? (
          <button onClick={() => setShowForm(true)} className="btn-secondary !py-2.5 !px-6">
            <i className="fas fa-plus"/>Log Hours
          </button>
        ) : (
          <div className="card p-6">
            <h3 className="font-display font-semibold text-base mb-5" style={{color:'#1A0A35'}}>Log Volunteer Hours</h3>
            <form onSubmit={handleSubmit(d => logMut.mutate(d))} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="label">Activity</label>
                  <select {...register('activity', { required: true })} className="input">
                    <option value="">Select activity…</option>
                    {ACTIVITIES.map(a => <option key={a} value={a}>{a}</option>)}
                  </select>
                  {errors.activity && <p className="text-xs text-red-500 mt-1">Required</p>}
                </div>
                <div>
                  <label className="label">Hours</label>
                  <input type="number" step="0.5" min="0.5" max="24"
                    {...register('hours', { required: true, min: 0.5, max: 24 })}
                    placeholder="e.g. 3" className="input"/>
                  {errors.hours && <p className="text-xs text-red-500 mt-1">Enter 0.5–24h</p>}
                </div>
                <div>
                  <label className="label">Date</label>
                  <input type="date" {...register('date', { required: true })}
                    max={new Date().toISOString().split('T')[0]} className="input"/>
                  {errors.date && <p className="text-xs text-red-500 mt-1">Required</p>}
                </div>
              </div>
              <div>
                <label className="label">Notes <span style={{color:'#A3A3A3'}}>(optional)</span></label>
                <textarea {...register('description')} rows={2} className="input resize-none"
                  placeholder="Brief description of what you did…"/>
              </div>
              <div className="flex gap-3">
                <button type="submit" disabled={logMut.isLoading} className="btn-secondary !py-2.5 !text-sm">
                  {logMut.isLoading ? <><i className="fas fa-spinner animate-spin"/>Saving…</> : <><i className="fas fa-save"/>Submit Hours</>}
                </button>
                <button type="button" onClick={() => { setShowForm(false); reset() }}
                  className="text-sm px-4 py-2 rounded-xl hover:opacity-70 transition-opacity"
                  style={{color:'#737373',fontFamily:'Poppins,sans-serif'}}>Cancel</button>
              </div>
            </form>
          </div>
        )}
      </div>

      {/* History table */}
      <div className="card overflow-hidden mb-8">
        <div className="p-5 border-b" style={{borderColor:'rgba(91,45,142,0.06)'}}>
          <h3 className="font-display font-semibold" style={{color:'#1A0A35'}}>My Hours History</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead style={{background:'rgba(91,45,142,0.04)'}}>
              <tr>
                {['Activity','Date','Hours','Notes','Status'].map(h => (
                  <th key={h} className="text-left px-5 py-3.5 text-xs font-bold uppercase tracking-widest" style={{color:'#5B2D8E',fontFamily:'Sora,sans-serif'}}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {isLoading ? [1,2,3].map(i => (
                <tr key={i}><td colSpan={5} className="px-5 py-4">
                  <div className="h-4 rounded-xl animate-pulse" style={{background:'rgba(91,45,142,0.05)'}}/>
                </td></tr>
              )) : hours.map(h => {
                const cfg = STATUS_CFG[h.status] || STATUS_CFG.pending
                return (
                  <tr key={h.id} className="border-b" style={{borderColor:'rgba(91,45,142,0.04)'}}>
                    <td className="px-5 py-3.5 text-sm font-semibold" style={{color:'#1A0A35',fontFamily:'Sora,sans-serif'}}>{h.activity}</td>
                    <td className="px-5 py-3.5 text-xs" style={{color:'#737373',fontFamily:'Poppins,sans-serif'}}>{format(new Date(h.date),'MMM d, yyyy')}</td>
                    <td className="px-5 py-3.5">
                      <span className="font-display font-bold text-sm" style={{color:'#1A0A35'}}>{h.hours}<span className="text-xs font-normal" style={{color:'#A3A3A3'}}> h</span></span>
                    </td>
                    <td className="px-5 py-3.5 text-xs max-w-[200px] truncate" style={{color:'#525252',fontFamily:'Poppins,sans-serif'}} title={h.description}>{h.description || '—'}</td>
                    <td className="px-5 py-3.5">
                      <span className="text-[10px] font-bold px-2.5 py-1 rounded-full" style={{background:cfg.bg,color:cfg.color}}>
                        <i className={`fas ${cfg.icon} mr-1`}/>{cfg.label}
                      </span>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
          {!hours.length && !isLoading && (
            <div className="text-center py-12">
              <i className="fas fa-hands-helping text-4xl mb-3 block" style={{color:'rgba(91,45,142,0.12)'}}/>
              <p className="text-sm" style={{color:'#A3A3A3',fontFamily:'Poppins,sans-serif'}}>No hours logged yet. Start contributing!</p>
            </div>
          )}
        </div>
      </div>

      {/* Leaderboard */}
      {leaderboard?.length > 0 && (
        <div className="card p-6">
          <h3 className="font-display font-semibold text-base mb-4" style={{color:'#1A0A35'}}>
            Community Leaderboard
          </h3>
          <div className="space-y-2">
            {leaderboard.map((u, i) => (
              <div key={u.userId} className="flex items-center gap-4 py-2.5 px-4 rounded-2xl"
                style={{background: i < 3 ? 'rgba(91,45,142,0.05)' : 'transparent'}}>
                <div className="w-7 text-center font-display font-bold text-sm"
                  style={{color: i===0?'#F0A500':i===1?'#6b7280':i===2?'#b45309':'#A3A3A3'}}>{i+1}</div>
                <div className="w-9 h-9 rounded-xl flex items-center justify-center text-white text-sm font-bold flex-shrink-0"
                  style={{background:'linear-gradient(135deg,#5B2D8E,#7B4DB8)'}}>
                  {u.firstName?.[0]}{u.lastName?.[0]}
                </div>
                <div className="flex-1">
                  <div className="text-sm font-semibold" style={{color:'#1A0A35',fontFamily:'Sora,sans-serif'}}>{u.firstName} {u.lastName}</div>
                  <div className="flex gap-1 mt-0.5">
                    {u.badges?.slice(-2).map(b => (
                      <span key={b.id} title={b.label} className="text-[9px] font-bold px-1.5 py-0.5 rounded-full"
                        style={{background:`${b.color}18`,color:b.color}}>{b.label.split(' ')[0]}</span>
                    ))}
                  </div>
                </div>
                <div className="font-display font-bold text-base" style={{color:'#5B2D8E'}}>
                  {u.totalHours}h
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
