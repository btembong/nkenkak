import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from 'react-query'
import { useForm } from 'react-hook-form'
import { format, formatDistanceToNow } from 'date-fns'
import toast from 'react-hot-toast'
import api from '../../services/api'
import { useAuth } from '../../context/AuthContext'

const PAGE_STYLES = `
@keyframes fadeUp    { from{opacity:0;transform:translateY(18px)} to{opacity:1;transform:translateY(0)} }
@keyframes checkPop  { 0%{transform:scale(0) rotate(-20deg);opacity:0} 70%{transform:scale(1.2) rotate(4deg)} 100%{transform:scale(1) rotate(0deg);opacity:1} }
@keyframes ringFill  { from{stroke-dashoffset:var(--dash-total)} to{stroke-dashoffset:var(--dash-offset)} }
@keyframes confetti  { 0%{transform:translateY(-8px) rotate(0deg);opacity:1} 100%{transform:translateY(90vh) rotate(540deg);opacity:0} }
@keyframes countUp   { from{opacity:0;transform:translateY(8px)} to{opacity:1;transform:translateY(0)} }
@keyframes shimmer   { 0%{background-position:-600px 0} 100%{background-position:600px 0} }
`

const CATEGORY_META = {
  community:   { label: 'Community',   color: '#5B2D8E', bg: 'rgba(91,45,142,0.1)',  icon: 'fa-users'       },
  environment: { label: 'Environment', color: '#16a34a', bg: 'rgba(22,163,74,0.1)',  icon: 'fa-leaf'        },
  education:   { label: 'Education',   color: '#0284c7', bg: 'rgba(2,132,199,0.1)',  icon: 'fa-graduation-cap' },
  health:      { label: 'Health',      color: '#dc2626', bg: 'rgba(220,38,38,0.1)',  icon: 'fa-heart'       },
  infrastructure:{ label: 'Infrastructure', color: '#F0A500', bg: 'rgba(240,165,0,0.1)', icon: 'fa-road'   },
  governance:  { label: 'Governance',  color: '#7B4DB8', bg: 'rgba(123,77,184,0.1)', icon: 'fa-landmark'   },
}

/* ── Circular SVG progress ring ──────────────────────────────────── */
function ProgressRing({ pct, size = 80, stroke = 7, achieved }) {
  const r   = (size - stroke) / 2
  const circ = 2 * Math.PI * r
  const offset = circ - (Math.min(pct, 100) / 100) * circ
  const color = achieved ? '#16a34a' : pct >= 75 ? '#F0A500' : '#5B2D8E'
  return (
    <div className="relative flex-shrink-0" style={{ width: size, height: size }}>
      <svg width={size} height={size} style={{ transform: 'rotate(-90deg)' }}>
        <circle cx={size/2} cy={size/2} r={r} fill="none" strokeWidth={stroke}
          stroke="rgba(91,45,142,0.08)"/>
        <circle cx={size/2} cy={size/2} r={r} fill="none" strokeWidth={stroke}
          stroke={color} strokeLinecap="round"
          strokeDasharray={circ}
          strokeDashoffset={offset}
          style={{ transition: 'stroke-dashoffset 1.2s cubic-bezier(0.16,1,0.3,1)' }}/>
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="font-display font-bold leading-none" style={{ fontSize: size * 0.22, color: achieved ? '#16a34a' : '#1A0A35' }}>
          {Math.min(pct, 100)}%
        </span>
        {achieved && <i className="fas fa-check text-green-500" style={{ fontSize: size * 0.14 }}/>}
      </div>
    </div>
  )
}

/* ── Sign success overlay ────────────────────────────────────────── */
function SignSuccess({ petition, onClose }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: 'rgba(10,4,28,0.85)', backdropFilter: 'blur(12px)' }}
      onClick={onClose}>
      {Array.from({ length: 18 }).map((_, i) => (
        <div key={i} className="absolute"
          style={{
            left: `${8 + (i * 5) % 85}%`, top: '-10px',
            width: i % 3 === 0 ? 10 : 7, height: i % 3 === 0 ? 10 : 7,
            borderRadius: i % 4 === 0 ? '2px' : '50%',
            background: ['#5B2D8E','#F0A500','#16a34a','#0284c7','#FFB84D'][i % 5],
            animation: `confetti ${1.4 + (i % 5) * 0.25}s ease-in ${(i % 7) * 0.08}s forwards`,
          }}/>
      ))}
      <div className="bg-white rounded-3xl px-8 py-10 text-center max-w-xs w-full"
        style={{ boxShadow: '0 40px 100px rgba(26,10,53,0.35)', animation: 'fadeUp 0.35s ease forwards' }}>
        <div className="w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-5"
          style={{ background: 'linear-gradient(135deg,#16a34a,#22c55e)', boxShadow: '0 8px 32px rgba(22,163,74,0.4)', animation: 'checkPop 0.5s cubic-bezier(0.16,1,0.3,1) forwards' }}>
          <i className="fas fa-pen-nib text-3xl text-white"/>
        </div>
        <h3 className="font-display font-bold text-2xl mb-2" style={{ color: '#1A0A35' }}>Signed!</h3>
        <p className="text-sm leading-relaxed mb-5" style={{ color: '#737373', fontFamily: 'Poppins,sans-serif' }}>
          Your signature has been added to<br/>
          <strong style={{ color: '#1A0A35' }}>"{petition.title}"</strong>
        </p>
        <p className="text-xs" style={{ color: '#A3A3A3', fontFamily: 'Poppins,sans-serif' }}>
          Together we make change happen. Tap anywhere to close.
        </p>
      </div>
    </div>
  )
}

/* ── Sign modal ──────────────────────────────────────────────────── */
function SignModal({ petition, onClose, onSuccess }) {
  const { user } = useAuth()
  const { register, handleSubmit, formState: { errors } } = useForm({
    defaultValues: { name: user ? `${user.firstName} ${user.lastName}` : '', email: user?.email || '' }
  })
  const mut = useMutation(
    d => api.post(`/petitions/${petition.id}/sign`, { ...d, userId: user?.id }),
    {
      onSuccess: () => { onSuccess(); onClose() },
      onError: e => toast.error(e.response?.data?.error || 'Failed to sign'),
    }
  )
  const count = petition._count?.signatures || 0

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: 'rgba(10,4,28,0.85)', backdropFilter: 'blur(12px)' }}
      onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="bg-white rounded-3xl w-full max-w-md overflow-hidden"
        style={{ boxShadow: '0 40px 100px rgba(26,10,53,0.3)', animation: 'fadeUp 0.3s ease forwards' }}>

        {/* Header band */}
        <div className="p-6 text-center" style={{ background: 'linear-gradient(135deg,#1A0A35,#2D1160)' }}>
          {petition.imageUrl && (
            <img src={petition.imageUrl} alt="" className="w-full h-28 object-cover rounded-2xl mb-4 opacity-60"/>
          )}
          <div className="w-12 h-12 rounded-xl flex items-center justify-center mx-auto mb-3"
            style={{ background: 'rgba(240,165,0,0.2)', border: '1px solid rgba(240,165,0,0.3)' }}>
            <i className="fas fa-scroll text-lg" style={{ color: '#F0A500' }}/>
          </div>
          <h3 className="font-display font-bold text-lg text-white mb-1 leading-snug">{petition.title}</h3>
          <p className="text-xs" style={{ color: 'rgba(255,255,255,0.5)', fontFamily: 'Poppins,sans-serif' }}>
            {count.toLocaleString()} people have already signed
          </p>
        </div>

        <div className="p-6">
          <p className="text-xs text-center mb-5" style={{ color: '#737373', fontFamily: 'Poppins,sans-serif' }}>
            Add your name and help reach the goal of <strong style={{ color: '#1A0A35' }}>{petition.goal.toLocaleString()} signatures</strong>
          </p>
          <form onSubmit={handleSubmit(d => mut.mutate(d))} className="space-y-4">
            <div>
              <label className="label">Full Name *</label>
              <input {...register('name', { required: 'Required' })} className="input" placeholder="Your full name"/>
              {errors.name && <p className="text-xs mt-1 text-red-500">{errors.name.message}</p>}
            </div>
            <div>
              <label className="label">Email *</label>
              <input type="email" {...register('email', { required: 'Required' })} className="input" placeholder="your@email.com"/>
              {errors.email && <p className="text-xs mt-1 text-red-500">{errors.email.message}</p>}
            </div>
            <div>
              <label className="label">Why you support this <span style={{ color: '#A3A3A3' }}>(optional)</span></label>
              <textarea {...register('comment')} rows={2} className="input resize-none" placeholder="Share your reason…"/>
            </div>
            <label className="flex items-center gap-2.5 text-sm cursor-pointer p-3 rounded-xl transition-colors hover:bg-gray-50"
              style={{ fontFamily: 'Poppins,sans-serif', color: '#525252' }}>
              <input type="checkbox" {...register('isAnon')} className="w-4 h-4 rounded accent-primary-500"/>
              Sign anonymously (name hidden from public view)
            </label>
            <div className="flex gap-3 pt-1">
              <button type="button" onClick={onClose}
                className="flex-1 py-3 rounded-2xl text-sm font-semibold"
                style={{ background: 'rgba(91,45,142,0.05)', color: '#737373', border: '1px solid rgba(91,45,142,0.1)' }}>
                Cancel
              </button>
              <button type="submit" disabled={mut.isLoading}
                className="flex-1 py-3.5 rounded-2xl text-sm font-bold text-white flex items-center justify-center gap-2"
                style={{ background: 'linear-gradient(135deg,#5B2D8E,#7B4DB8)', boxShadow: '0 6px 20px rgba(91,45,142,0.35)' }}>
                {mut.isLoading
                  ? <><i className="fas fa-spinner animate-spin"/>Signing…</>
                  : <><i className="fas fa-pen-nib"/>Sign Petition</>}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}

/* ── Spotlight card for top open petition ────────────────────────── */
function SpotlightPetition({ petition, onSign }) {
  const count    = petition._count?.signatures || 0
  const pct      = Math.min(100, Math.round((count / petition.goal) * 100))
  const achieved = count >= petition.goal
  const expired  = petition.expiresAt && new Date(petition.expiresAt) < new Date()
  const catMeta  = CATEGORY_META[petition.category] || CATEGORY_META.community
  const recent   = petition.signatures?.slice(0, 4) || []

  return (
    <div className="relative rounded-3xl overflow-hidden mb-10" style={{ animation: 'fadeUp 0.4s ease forwards' }}>
      <div className="absolute inset-0" style={{ background: 'linear-gradient(135deg,#1A0A35 0%,#2D1160 55%,#5B2D8E 100%)' }}/>
      {petition.imageUrl && (
        <img src={petition.imageUrl} alt="" className="absolute inset-0 w-full h-full object-cover opacity-15"/>
      )}
      <div className="wave-pattern absolute inset-0 opacity-10"/>

      <div className="relative p-7 md:p-10">
        <div className="flex flex-wrap items-center gap-2 mb-5">
          <span className="text-[10px] font-bold px-2.5 py-1 rounded-full flex items-center gap-1"
            style={{ background: catMeta.bg, color: catMeta.color }}>
            <i className={`fas ${catMeta.icon} text-[9px]`}/>{catMeta.label}
          </span>
          {achieved && (
            <span className="text-[10px] font-bold px-2.5 py-1 rounded-full flex items-center gap-1"
              style={{ background: 'rgba(22,163,74,0.25)', color: '#4ade80', border: '1px solid rgba(22,163,74,0.3)' }}>
              <i className="fas fa-check-circle text-[9px]"/>Goal Reached!
            </span>
          )}
          {!achieved && pct >= 75 && (
            <span className="text-[10px] font-bold px-2.5 py-1 rounded-full flex items-center gap-1"
              style={{ background: 'rgba(240,165,0,0.2)', color: '#F0A500', border: '1px solid rgba(240,165,0,0.25)' }}>
              <i className="fas fa-fire text-[9px]"/>Trending
            </span>
          )}
        </div>

        <div className="md:flex md:items-center md:gap-10">
          <div className="flex-1 mb-6 md:mb-0">
            <h2 className="font-display font-bold text-2xl md:text-3xl text-white mb-3 leading-snug">{petition.title}</h2>
            <p className="text-sm leading-relaxed mb-5 max-w-lg" style={{ color: 'rgba(255,255,255,0.6)', fontFamily: 'Poppins,sans-serif' }}>
              {petition.description?.slice(0, 160)}{petition.description?.length > 160 ? '…' : ''}
            </p>

            {/* Signers strip */}
            {recent.length > 0 && (
              <div className="flex items-center gap-2 mb-5">
                <div className="flex -space-x-2">
                  {recent.map((s, i) => (
                    <div key={i} className="w-8 h-8 rounded-full border-2 border-white/20 flex items-center justify-center text-white font-bold text-xs flex-shrink-0"
                      style={{ background: `hsl(${(i * 60 + 260) % 360},60%,45%)` }}>
                      {s.name?.[0]?.toUpperCase()}
                    </div>
                  ))}
                </div>
                <span className="text-xs" style={{ color: 'rgba(255,255,255,0.5)', fontFamily: 'Poppins,sans-serif' }}>
                  {recent[0]?.name?.split(' ')[0]}{recent.length > 1 ? ` and ${count - 1} others` : ''} signed
                </span>
              </div>
            )}

            <div className="flex flex-wrap items-center gap-3">
              {!petition.isClosed && !expired && (
                <button onClick={() => onSign(petition)}
                  className="inline-flex items-center gap-2 px-6 py-3 rounded-2xl text-sm font-bold transition-all hover:opacity-90"
                  style={{ background: 'linear-gradient(135deg,#F0A500,#FFB84D)', color: '#1A0A35', boxShadow: '0 8px 24px rgba(240,165,0,0.35)' }}>
                  <i className="fas fa-pen-nib"/>Sign This Petition
                </button>
              )}
              <div className="text-xs" style={{ color: 'rgba(255,255,255,0.4)', fontFamily: 'Poppins,sans-serif' }}>
                {petition.expiresAt && !expired && (
                  <span><i className="fas fa-clock mr-1"/>Closes {formatDistanceToNow(new Date(petition.expiresAt), { addSuffix: true })}</span>
                )}
              </div>
            </div>
          </div>

          {/* Progress ring */}
          <div className="flex flex-col items-center gap-3">
            <ProgressRing pct={pct} size={120} stroke={10} achieved={achieved}/>
            <div className="text-center">
              <div className="font-display font-bold text-2xl text-white">{count.toLocaleString()}</div>
              <div className="text-xs" style={{ color: 'rgba(255,255,255,0.4)', fontFamily: 'Poppins,sans-serif' }}>
                of {petition.goal.toLocaleString()} goal
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

/* ── Regular petition card ───────────────────────────────────────── */
function PetitionCard({ petition, onSign, index }) {
  const count    = petition._count?.signatures || 0
  const pct      = Math.min(100, Math.round((count / petition.goal) * 100))
  const achieved = count >= petition.goal
  const expired  = petition.expiresAt && new Date(petition.expiresAt) < new Date()
  const isOpen   = !petition.isClosed && !expired
  const catMeta  = CATEGORY_META[petition.category] || CATEGORY_META.community
  const isTrending = pct >= 75 && !achieved

  return (
    <div className="rounded-3xl overflow-hidden flex flex-col transition-all duration-300 hover:-translate-y-1 hover:shadow-2xl"
      style={{
        background: '#fff',
        boxShadow: achieved ? '0 4px 24px rgba(22,163,74,0.12)' : '0 4px 20px rgba(91,45,142,0.07)',
        border: achieved ? '2px solid rgba(22,163,74,0.25)' : isOpen ? '2px solid transparent' : '2px solid rgba(163,163,163,0.1)',
        animation: `fadeUp 0.4s ease ${index * 0.06}s both`,
      }}>

      {/* Cover */}
      {petition.imageUrl
        ? <img src={petition.imageUrl} alt={petition.title} className="w-full h-36 object-cover"/>
        : <div className="w-full h-24 flex items-center justify-center relative overflow-hidden"
            style={{ background: 'linear-gradient(135deg,#1A0A35,#2D1160)' }}>
            <div className="wave-pattern absolute inset-0 opacity-20"/>
            <i className={`fas ${catMeta.icon} text-4xl relative`} style={{ color: 'rgba(255,255,255,0.12)' }}/>
          </div>}

      <div className="p-5 flex flex-col flex-1 gap-3">
        {/* Badges */}
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-[10px] font-bold px-2.5 py-1 rounded-full flex items-center gap-1"
            style={{ background: catMeta.bg, color: catMeta.color }}>
            <i className={`fas ${catMeta.icon} text-[9px]`}/>{catMeta.label}
          </span>
          {isOpen && !achieved && (
            <span className="text-[10px] font-bold px-2.5 py-1 rounded-full" style={{ background: 'rgba(22,163,74,0.1)', color: '#16a34a' }}>Open</span>
          )}
          {achieved && (
            <span className="text-[10px] font-bold px-2.5 py-1 rounded-full flex items-center gap-1" style={{ background: 'rgba(22,163,74,0.1)', color: '#16a34a' }}>
              <i className="fas fa-check-circle text-[9px]"/>Goal Reached
            </span>
          )}
          {isTrending && (
            <span className="text-[10px] font-bold px-2.5 py-1 rounded-full flex items-center gap-1" style={{ background: 'rgba(240,165,0,0.1)', color: '#C87800' }}>
              <i className="fas fa-fire text-[9px]"/>Trending
            </span>
          )}
          {(petition.isClosed || expired) && !achieved && (
            <span className="text-[10px] font-bold px-2.5 py-1 rounded-full" style={{ background: 'rgba(115,115,115,0.1)', color: '#737373' }}>Closed</span>
          )}
        </div>

        <h3 className="font-display font-bold text-base leading-snug" style={{ color: '#1A0A35' }}>
          {petition.title}
        </h3>

        <p className="text-xs leading-relaxed line-clamp-2 flex-1" style={{ color: '#737373', fontFamily: 'Poppins,sans-serif' }}>
          {petition.description}
        </p>

        {/* Progress row */}
        <div className="flex items-center gap-4">
          <ProgressRing pct={pct} size={56} stroke={5} achieved={achieved}/>
          <div className="flex-1">
            <div className="flex justify-between text-xs mb-1" style={{ fontFamily: 'Poppins,sans-serif' }}>
              <span className="font-bold" style={{ color: '#1A0A35' }}>{count.toLocaleString()}</span>
              <span style={{ color: '#A3A3A3' }}>/ {petition.goal.toLocaleString()}</span>
            </div>
            <div className="h-2 rounded-full overflow-hidden" style={{ background: 'rgba(91,45,142,0.07)' }}>
              <div className="h-full rounded-full transition-all duration-1000"
                style={{ width: `${pct}%`, background: achieved ? 'linear-gradient(90deg,#16a34a,#22c55e)' : pct >= 75 ? 'linear-gradient(90deg,#F0A500,#FFB84D)' : 'linear-gradient(90deg,#5B2D8E,#7B4DB8)' }}/>
            </div>
            <div className="text-[10px] mt-1" style={{ color: '#A3A3A3', fontFamily: 'Poppins,sans-serif' }}>
              {petition.expiresAt && !expired && isOpen
                ? `Closes ${formatDistanceToNow(new Date(petition.expiresAt), { addSuffix: true })}`
                : expired ? 'Expired' : petition.author ? `by ${petition.author.firstName} ${petition.author.lastName}` : ''}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between pt-3 border-t" style={{ borderColor: 'rgba(91,45,142,0.06)' }}>
          <div className="text-[10px]" style={{ color: '#A3A3A3', fontFamily: 'Poppins,sans-serif' }}>
            {petition.author && <span><i className="fas fa-user mr-1"/>by {petition.author.firstName} {petition.author.lastName}</span>}
          </div>
          {isOpen && (
            <button onClick={() => onSign(petition)}
              className="text-xs font-bold px-4 py-2 rounded-xl flex items-center gap-1.5 transition-all hover:opacity-90"
              style={{ background: 'linear-gradient(135deg,#5B2D8E,#7B4DB8)', color: '#fff', boxShadow: '0 4px 12px rgba(91,45,142,0.3)' }}>
              <i className="fas fa-pen-nib text-[10px]"/>Sign
            </button>
          )}
        </div>
      </div>
    </div>
  )
}

/* ── Stats bar ───────────────────────────────────────────────────── */
function StatsBar({ petitions }) {
  const totalSigs  = petitions.reduce((s, p) => s + (p._count?.signatures || 0), 0)
  const open       = petitions.filter(p => !p.isClosed).length
  const achieved   = petitions.filter(p => (p._count?.signatures || 0) >= p.goal).length
  const trending   = petitions.filter(p => {
    const pct = (p._count?.signatures || 0) / p.goal * 100
    return pct >= 75 && pct < 100 && !p.isClosed
  }).length

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-8">
      {[
        { icon: 'fa-pen-nib',    value: totalSigs.toLocaleString(), label: 'Total Signatures', color: '#5B2D8E', bg: 'rgba(91,45,142,0.08)'   },
        { icon: 'fa-scroll',     value: open,                       label: 'Open Petitions',   color: '#0284c7', bg: 'rgba(2,132,199,0.08)'    },
        { icon: 'fa-check-circle',value: achieved,                  label: 'Goals Reached',    color: '#16a34a', bg: 'rgba(22,163,74,0.08)'    },
        { icon: 'fa-fire',       value: trending,                   label: 'Trending',         color: '#F0A500', bg: 'rgba(240,165,0,0.08)'    },
      ].map(s => (
        <div key={s.label} className="rounded-2xl px-4 py-3 flex items-center gap-3"
          style={{ background: s.bg, border: `1px solid ${s.bg.replace('0.08','0.18')}` }}>
          <div className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0"
            style={{ background: s.bg.replace('0.08','0.15') }}>
            <i className={`fas ${s.icon} text-sm`} style={{ color: s.color }}/>
          </div>
          <div>
            <div className="font-display font-bold text-xl leading-none mb-0.5" style={{ color: '#1A0A35' }}>{s.value}</div>
            <div className="text-[10px] font-semibold" style={{ color: s.color, fontFamily: 'Sora,sans-serif' }}>{s.label}</div>
          </div>
        </div>
      ))}
    </div>
  )
}

/* ── Main page ───────────────────────────────────────────────────── */
export default function PetitionsPage() {
  const qc = useQueryClient()
  const [filter,    setFilter]    = useState('open')
  const [signing,   setSigning]   = useState(null)
  const [signedPet, setSignedPet] = useState(null)

  const { data: petitions = [], isLoading } = useQuery(
    ['petitions', filter],
    () => api.get(`/petitions${filter === 'closed' ? '?closed=true' : filter === 'all' ? '' : '?closed=false'}`).then(r => r.data)
  )

  // Find spotlight: open petition closest to goal (but not yet reached)
  const openPetitions = petitions.filter(p => !p.isClosed && !(p.expiresAt && new Date(p.expiresAt) < new Date()))
  const spotlight = filter === 'open' && openPetitions.length > 0
    ? openPetitions.reduce((best, p) => {
        const bPct = (best._count?.signatures || 0) / best.goal
        const pPct = (p._count?.signatures || 0) / p.goal
        return pPct > bPct ? p : best
      })
    : null
  const restPetitions = spotlight ? petitions.filter(p => p.id !== spotlight.id) : petitions

  const handleSignSuccess = () => {
    setSignedPet(signing)
    setSigning(null)
    qc.invalidateQueries('petitions')
  }

  return (
    <div style={{ background: '#F9F7FD', minHeight: '100vh' }}>
      <style>{PAGE_STYLES}</style>

      {/* Hero */}
      <div className="relative py-20 overflow-hidden" style={{ background: 'linear-gradient(135deg,#1A0A35,#250F47)' }}>
        <div className="wave-pattern absolute inset-0 opacity-20"/>
        <div className="absolute top-0 right-0 w-80 h-80 rounded-full opacity-10"
          style={{ background: 'radial-gradient(circle,#5B2D8E,transparent)', transform: 'translate(30%,-30%)' }}/>
        <div className="absolute bottom-0 left-0 w-56 h-56 rounded-full opacity-10"
          style={{ background: 'radial-gradient(circle,#F0A500,transparent)', transform: 'translate(-30%,30%)' }}/>
        <div className="relative max-w-4xl mx-auto px-6 text-center">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full mb-5"
            style={{ background: 'rgba(240,165,0,0.15)', border: '1px solid rgba(240,165,0,0.25)' }}>
            <i className="fas fa-scroll text-xs" style={{ color: '#F0A500' }}/>
            <span className="text-xs font-bold uppercase tracking-widest" style={{ color: '#F0A500', fontFamily: 'Sora,sans-serif' }}>
              Community Voice
            </span>
          </div>
          <h1 className="font-display font-bold text-4xl md:text-5xl text-white mb-4">
            Community <span style={{ color: '#F0A500' }}>Petitions</span>
          </h1>
          <p className="text-base max-w-xl mx-auto mb-6" style={{ color: 'rgba(255,255,255,0.65)', fontFamily: 'Poppins,sans-serif' }}>
            Add your voice to causes that matter. Every signature drives real change in Nkenkak-Ngiesang.
          </p>
          {openPetitions.length > 0 && (
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full"
              style={{ background: 'rgba(91,45,142,0.25)', border: '1px solid rgba(91,45,142,0.3)' }}>
              <i className="fas fa-pen-nib text-xs" style={{ color: '#C4A0F0' }}/>
              <span className="text-xs font-semibold" style={{ color: '#C4A0F0' }}>
                {openPetitions.length} petition{openPetitions.length !== 1 ? 's' : ''} open — sign today
              </span>
            </div>
          )}
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-6 py-10">

        {/* Stats */}
        {!isLoading && petitions.length > 0 && <StatsBar petitions={petitions}/>}

        {/* Filters */}
        <div className="flex flex-wrap gap-2 mb-8">
          {[['open','Open'],['closed','Closed'],['all','All']].map(([v,l]) => (
            <button key={v} onClick={() => setFilter(v)}
              className="text-xs font-semibold px-4 py-2 rounded-xl transition-all"
              style={{ background: filter === v ? '#5B2D8E' : 'rgba(91,45,142,0.07)', color: filter === v ? '#fff' : '#737373', fontFamily: 'Sora,sans-serif' }}>
              {l}
            </button>
          ))}
        </div>

        {isLoading ? (
          <div className="grid md:grid-cols-2 gap-6">
            {[1,2,3,4].map(i => (
              <div key={i} className="h-72 rounded-3xl" style={{
                background: 'linear-gradient(90deg,rgba(91,45,142,0.05) 0%,rgba(91,45,142,0.09) 50%,rgba(91,45,142,0.05) 100%)',
                backgroundSize: '800px 100%',
                animation: 'shimmer 1.5s infinite',
              }}/>
            ))}
          </div>
        ) : !petitions.length ? (
          <div className="text-center py-24 rounded-3xl"
            style={{ background: 'rgba(91,45,142,0.02)', border: '1px dashed rgba(91,45,142,0.12)' }}>
            <div className="w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4"
              style={{ background: 'rgba(91,45,142,0.06)' }}>
              <i className="fas fa-scroll text-3xl" style={{ color: 'rgba(91,45,142,0.3)' }}/>
            </div>
            <h3 className="font-display font-bold text-xl mb-2" style={{ color: '#1A0A35' }}>No petitions found</h3>
            <p className="text-sm" style={{ color: '#737373', fontFamily: 'Poppins,sans-serif' }}>
              Petitions created by community leaders will appear here.
            </p>
          </div>
        ) : (
          <>
            {spotlight && <SpotlightPetition petition={spotlight} onSign={setSigning}/>}
            {restPetitions.length > 0 && (
              <>
                {spotlight && (
                  <h2 className="font-display font-bold text-lg mb-4" style={{ color: '#1A0A35' }}>More Petitions</h2>
                )}
                <div className="grid md:grid-cols-2 gap-6">
                  {restPetitions.map((p, i) => <PetitionCard key={p.id} petition={p} onSign={setSigning} index={i}/>)}
                </div>
              </>
            )}
          </>
        )}
      </div>

      {signing && (
        <SignModal petition={signing} onClose={() => setSigning(null)} onSuccess={handleSignSuccess}/>
      )}
      {signedPet && (
        <SignSuccess petition={signedPet} onClose={() => setSignedPet(null)}/>
      )}
    </div>
  )
}
