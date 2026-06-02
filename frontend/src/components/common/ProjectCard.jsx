import { Link } from 'react-router-dom'
import { differenceInDays } from 'date-fns'
import { Card } from '../ui/card'
import { cn } from '../../lib/utils'

const GRADS = {
  education:      'linear-gradient(135deg,#250F47,#5B2D8E)',
  health:         'linear-gradient(135deg,#4A0E0E,#991B1B)',
  infrastructure: 'linear-gradient(135deg,#3D2200,#C87800)',
  environment:    'linear-gradient(135deg,#052e16,#16a34a)',
  culture:        'linear-gradient(135deg,#2e1065,#7c3aed)',
  agriculture:    'linear-gradient(135deg,#422006,#ca8a04)',
}

const CAT_META = {
  education:      { icon:'fa-graduation-cap', color:'#7C3AED', bg:'rgba(124,58,237,0.9)'  },
  health:         { icon:'fa-heartbeat',      color:'#dc2626', bg:'rgba(220,38,38,0.9)'   },
  infrastructure: { icon:'fa-road',           color:'#b45309', bg:'rgba(180,83,9,0.9)'    },
  environment:    { icon:'fa-leaf',           color:'#16a34a', bg:'rgba(22,163,74,0.9)'   },
  culture:        { icon:'fa-music',          color:'#7c3aed', bg:'rgba(124,58,237,0.9)'  },
  agriculture:    { icon:'fa-seedling',       color:'#ca8a04', bg:'rgba(202,138,4,0.9)'   },
}

function getProgressMeta(pct) {
  if (pct >= 100) return { grad:'linear-gradient(90deg,#16a34a,#4ade80)', label:'Goal reached!',  color:'text-green-600'   }
  if (pct >= 60)  return { grad:'linear-gradient(90deg,#5B2D8E,#F0A500)', label:'Almost there!',  color:'text-primary-500' }
  return                  { grad:'linear-gradient(90deg,#5B2D8E,#7B4DB8)', label:'In progress',    color:'text-primary-500' }
}

export default function ProjectCard({ project: p, onDonate }) {
  const pct         = p.goalAmount > 0 ? Math.min(100, Math.round((Number(p.raisedAmount) / Number(p.goalAmount)) * 100)) : 0
  const raised      = Number(p.raisedAmount || 0)
  const goal        = Number(p.goalAmount   || 0)
  const cat         = CAT_META[p.category]  || CAT_META.education
  const grad        = GRADS[p.category]     || GRADS.education
  const isCompleted = p.status === 'completed'
  const progress    = getProgressMeta(pct)

  /* Deadline pill */
  let daysLeft = null
  let deadlineCls = ''
  if (p.endDate && !isCompleted) {
    daysLeft = differenceInDays(new Date(p.endDate), new Date())
    if (daysLeft >= 0) {
      deadlineCls = daysLeft === 0 ? 'bg-red-600 text-white' : 'bg-gold/90 text-dark'
    }
  }

  const fmt = (n) => n >= 1_000_000
    ? `${(n / 1_000_000).toFixed(1)}M`
    : n >= 1_000 ? `${(n / 1_000).toFixed(0)}K` : String(n)

  return (
    <Card className={cn(
      'group p-0 overflow-hidden flex flex-col hover:-translate-y-2 transition-all duration-300',
      p.isUrgent && 'ring-2 ring-red-500 ring-offset-2'
    )}>

      {/* ── Cover ── */}
      <div className="relative h-44 overflow-hidden flex-shrink-0" style={{ background: grad }}>
        {p.coverImage
          ? <img src={p.coverImage} alt={p.title}
              className={cn('absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-105', isCompleted && 'grayscale-[20%]')}/>
          : <div className="absolute inset-0 flex items-center justify-center">
              <i className={`fas ${cat.icon} text-7xl`} style={{ color:'rgba(240,165,0,0.18)' }}/>
            </div>}

        <div className="absolute inset-0"
          style={{ background:'linear-gradient(to top,rgba(6,2,16,0.88) 0%,rgba(6,2,16,0.25) 55%,transparent 100%)' }}/>

        {/* Top-left: category */}
        <div className="absolute top-3 left-3 z-10">
          <span className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wide px-2.5 py-1 rounded-full text-white capitalize"
            style={{ background: cat.bg, backdropFilter:'blur(6px)' }}>
            <i className={`fas ${cat.icon} text-[8px]`}/>{p.category}
          </span>
        </div>

        {/* Top-right: status badges */}
        <div className="absolute top-3 right-3 z-10 flex flex-col items-end gap-1">
          {p.isUrgent && (
            <span className="flex items-center gap-1 text-[10px] font-bold px-2.5 py-1 rounded-full text-white bg-red-600 animate-pulse">
              <i className="fas fa-exclamation-circle text-[8px]"/>Urgent
            </span>
          )}
          {isCompleted && (
            <span className="flex items-center gap-1 text-[10px] font-bold px-2.5 py-1 rounded-full text-white bg-green-600/90 backdrop-blur-sm">
              <i className="fas fa-check text-[8px]"/>Completed
            </span>
          )}
          {daysLeft !== null && daysLeft >= 0 && (
            <span className={cn('text-[10px] font-bold px-2.5 py-1 rounded-full', deadlineCls)}>
              <i className="fas fa-clock text-[8px] mr-1"/>
              {daysLeft === 0 ? 'Last day!' : daysLeft === 1 ? '1 day left' : `${daysLeft} days left`}
            </span>
          )}
        </div>
      </div>

      {/* ── Body ── */}
      <div className="flex flex-col flex-1 p-5">

        <h3 className="font-display font-bold text-[15px] leading-snug mb-1.5 line-clamp-2 text-dark">
          {p.title}
        </h3>
        <p className="text-xs leading-relaxed line-clamp-2 mb-4 text-muted-foreground">
          {p.summary}
        </p>

        {/* ── Color-coded progress ── */}
        <div className="mb-4">
          <div className="flex items-center justify-between text-[11px] mb-1.5">
            <span className={cn('font-semibold', progress.color)}>{progress.label}</span>
            <span className="font-bold text-dark">{pct}%</span>
          </div>
          <div className="h-2 rounded-full overflow-hidden bg-primary-500/8">
            <div className="h-full rounded-full transition-all duration-700"
              style={{ width:`${pct}%`, background: progress.grad }}/>
          </div>
          {isCompleted ? (
            <div className="text-[11px] text-center font-semibold text-green-600 mt-1.5">
              <i className="fas fa-check-circle mr-1"/>Goal of {fmt(goal)} XAF reached!
            </div>
          ) : (
            <div className="flex justify-between text-[11px] mt-1.5">
              <span>
                <strong className="text-primary-500">{fmt(raised)} XAF</strong>
                <span className="text-muted-foreground"> raised</span>
              </span>
              <span className="text-muted-foreground">of {fmt(goal)}</span>
            </div>
          )}
        </div>

        {/* ── Stats strip — always rendered for consistent height ── */}
        <div className="flex items-center gap-3 flex-wrap py-2.5 mb-4 border-t border-b border-primary-500/6 text-[11px] text-muted-foreground min-h-[34px]">
          {p.donorCount > 0 ? (
            <span className="flex items-center gap-1">
              <i className="fas fa-users text-[9px] text-primary-500"/>{p.donorCount} donors
            </span>
          ) : (
            <span className="flex items-center gap-1 opacity-40">
              <i className="fas fa-users text-[9px] text-primary-500"/>Be first to donate
            </span>
          )}
          {p.beneficiaries > 0 && (
            <span className="flex items-center gap-1">
              <i className="fas fa-hand-holding-heart text-[9px] text-gold"/>{p.beneficiaries.toLocaleString()} beneficiaries
            </span>
          )}
          {p.location && (
            <span className="flex items-center gap-1 ml-auto">
              <i className="fas fa-map-marker-alt text-[9px] text-green-600"/>{p.location}
            </span>
          )}
        </div>

        {/* ── Actions ── */}
        <div className="flex gap-2 mt-auto">
          <Link to={`/projects/${p.slug}`}
            className="flex-1 flex items-center justify-center gap-1.5 text-xs font-semibold py-2.5 rounded-2xl transition-all duration-200 hover:bg-purple-50 border border-primary-500/20 text-primary-500">
            <i className="fas fa-arrow-right text-[9px]"/>View Project
          </Link>
          {isCompleted ? (
            <Link to={`/projects/${p.slug}`}
              className="flex-1 flex items-center justify-center gap-1.5 text-xs font-bold py-2.5 rounded-2xl text-white transition-all duration-200 hover:opacity-90 bg-gradient-to-br from-green-500 to-emerald-400">
              <i className="fas fa-chart-bar text-[9px]"/>See Impact
            </Link>
          ) : (
            <button
              onClick={() => onDonate && onDonate(p.id)}
              className="flex-1 flex items-center justify-center gap-1.5 text-xs font-bold py-2.5 rounded-2xl text-white transition-all duration-200 hover:shadow-lg hover:-translate-y-0.5 bg-gradient-to-br from-gold to-[#FFB84D]"
              style={{ boxShadow:'0 4px 14px rgba(240,165,0,0.3)' }}>
              <i className="fas fa-heart text-[9px]"/>Donate
            </button>
          )}
        </div>
      </div>
    </Card>
  )
}
