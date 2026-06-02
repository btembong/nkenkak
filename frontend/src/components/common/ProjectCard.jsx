import { Link } from 'react-router-dom'
import { Card } from '../ui/card'
import { Progress } from '../ui/progress'

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

const STATUS_STYLE = {
  active:    { label:'Active'    },
  completed: { label:'Completed' },
  upcoming:  { label:'Upcoming'  },
  archived:  { label:'Archived'  },
}

export default function ProjectCard({ project: p, onDonate }) {
  const pct    = p.goalAmount > 0 ? Math.min(100, Math.round((Number(p.raisedAmount) / Number(p.goalAmount)) * 100)) : 0
  const raised = Number(p.raisedAmount || 0)
  const goal   = Number(p.goalAmount   || 0)
  const cat    = CAT_META[p.category]  || CAT_META.education
  const grad   = GRADS[p.category]     || GRADS.education
  const status = STATUS_STYLE[p.status]|| STATUS_STYLE.active

  const fmt = (n) => n >= 1_000_000
    ? `${(n / 1_000_000).toFixed(1)}M`
    : n >= 1_000 ? `${(n / 1_000).toFixed(0)}K` : String(n)

  return (
    <Card className="group p-0 overflow-hidden flex flex-col hover:-translate-y-2 transition-all duration-300">

      {/* ── Cover image ── */}
      <div className="relative h-52 overflow-hidden flex-shrink-0" style={{ background: grad }}>

        {p.coverImage
          ? <img src={p.coverImage} alt={p.title}
              className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"/>
          : <div className="absolute inset-0 flex items-center justify-center">
              <i className={`fas ${cat.icon} text-7xl`} style={{ color:'rgba(240,165,0,0.18)' }}/>
            </div>}

        {/* Dark gradient overlay */}
        <div className="absolute inset-0"
          style={{ background:'linear-gradient(to top,rgba(6,2,16,0.88) 0%,rgba(6,2,16,0.25) 55%,transparent 100%)' }}/>

        {/* Top row: category + urgent + status */}
        <div className="absolute top-3 left-3 right-3 flex items-start justify-between z-10">
          <span className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wide px-2.5 py-1 rounded-full text-white capitalize"
            style={{ background: cat.bg, backdropFilter:'blur(6px)' }}>
            <i className={`fas ${cat.icon} text-[8px]`}/>{p.category}
          </span>
          <div className="flex flex-col items-end gap-1">
            {p.isUrgent && (
              <span className="text-[10px] font-bold px-2.5 py-1 rounded-full text-white bg-red-600/92 backdrop-blur-sm">
                Urgent
              </span>
            )}
            <span className="text-[10px] font-semibold px-2.5 py-1 rounded-full capitalize bg-black/38 text-white/85 backdrop-blur-sm">
              {status.label}
            </span>
          </div>
        </div>

        {/* Bottom row: big % + hover donate */}
        <div className="absolute bottom-0 left-0 right-0 px-4 pb-4 flex items-end justify-between z-10">
          <div>
            <div className="font-display font-extrabold text-white leading-none"
              style={{ fontSize:'2rem', textShadow:'0 2px 12px rgba(0,0,0,0.5)' }}>
              {pct}<span className="text-lg font-bold">%</span>
            </div>
            <div className="text-[10px] font-medium text-white/55">funded</div>
          </div>
          <button
            onClick={e => { e.preventDefault(); onDonate && onDonate(p.id) }}
            className="flex items-center gap-1.5 text-xs font-bold px-4 py-2 rounded-full text-white
              opacity-0 translate-y-2 group-hover:opacity-100 group-hover:translate-y-0
              transition-all duration-300 bg-gradient-to-br from-gold to-[#FFB84D]"
            style={{ boxShadow:'0 4px 16px rgba(240,165,0,0.5)' }}>
            <i className="fas fa-heart text-[9px]"/>Donate
          </button>
        </div>
      </div>

      {/* ── Body ── */}
      <div className="flex flex-col flex-1 p-5">

        {/* Title + summary */}
        <h3 className="font-display font-bold text-[15px] leading-snug mb-1.5 line-clamp-2 text-dark">
          {p.title}
        </h3>
        <p className="text-xs leading-relaxed line-clamp-2 mb-4 text-muted-foreground">
          {p.summary}
        </p>

        {/* Progress */}
        <div className="mb-4">
          <Progress value={pct} className="h-2 mb-2"/>
          <div className="flex justify-between text-[11px]">
            <span>
              <strong className="text-primary-500">{fmt(raised)} XAF</strong>
              <span className="text-muted-foreground"> raised</span>
            </span>
            <span className="text-muted-foreground">Goal: {fmt(goal)}</span>
          </div>
        </div>

        {/* Stats strip */}
        {(p.donorCount > 0 || p.beneficiaries || p.location) && (
          <div className="flex items-center gap-3 flex-wrap py-3 mb-4 border-t border-b border-primary-500/6 text-[11px] text-muted-foreground">
            {p.donorCount > 0 && (
              <span className="flex items-center gap-1">
                <i className="fas fa-users text-[9px] text-primary-500"/>{p.donorCount} donors
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
        )}

        {/* Actions */}
        <div className="flex gap-2 mt-auto">
          <Link to={`/projects/${p.slug}`}
            className="flex-1 flex items-center justify-center gap-1.5 text-xs font-semibold py-2.5 rounded-2xl transition-all duration-200 hover:bg-purple-50 border border-primary-500/20 text-primary-500">
            <i className="fas fa-arrow-right text-[9px]"/>View Project
          </Link>
          <button
            onClick={() => onDonate && onDonate(p.id)}
            className="flex-1 flex items-center justify-center gap-1.5 text-xs font-bold py-2.5 rounded-2xl text-white transition-all duration-200 hover:shadow-lg hover:-translate-y-0.5 bg-gradient-to-br from-gold to-[#FFB84D]"
            style={{ boxShadow:'0 4px 14px rgba(240,165,0,0.3)' }}>
            <i className="fas fa-heart text-[9px]"/>Donate
          </button>
        </div>
      </div>
    </Card>
  )
}
