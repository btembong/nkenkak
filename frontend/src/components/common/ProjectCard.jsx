import { Link } from 'react-router-dom'
import { differenceInDays } from 'date-fns'
import { Card } from '../ui/card'
import { cn } from '../../lib/utils'
import {
  GraduationCap, HeartPulse, Route, Leaf, Music, Sprout,
  ArrowRight, Heart, TrendingUp, CheckCircle2, AlertCircle, Check,
  Users, MapPin, Clock,
} from 'lucide-react'

const GRADS = {
  education:      'linear-gradient(135deg,#2d004e,#4b0082)',
  health:         'linear-gradient(135deg,#4A0E0E,#991B1B)',
  infrastructure: 'linear-gradient(135deg,#2d004e,#4b0082)',
  environment:    'linear-gradient(135deg,#052e16,#16a34a)',
  culture:        'linear-gradient(135deg,#430075,#4b0082)',
  agriculture:    'linear-gradient(135deg,#2d004e,#eeb549)',
}

const CAT_META = {
  education:      { Icon: GraduationCap },
  health:         { Icon: HeartPulse },
  infrastructure: { Icon: Route },
  environment:    { Icon: Leaf },
  culture:        { Icon: Music },
  agriculture:    { Icon: Sprout },
}

function getProgressMeta(pct) {
  if (pct >= 100) return { grad:'linear-gradient(90deg,#eeb549,#f5cc77)', label:'Goal reached!',  color:'text-gold'        }
  if (pct >= 60)  return { grad:'linear-gradient(90deg,#4b0082,#eeb549)', label:'Almost there!',  color:'text-primary-500' }
  return                  { grad:'linear-gradient(90deg,#4b0082,#a57fc0)', label:'In progress',    color:'text-primary-500' }
}

export default function ProjectCard({ project: p, onDonate }) {
  const pct         = p.goalAmount > 0 ? Math.min(100, Math.round((Number(p.raisedAmount) / Number(p.goalAmount)) * 100)) : 0
  const raised      = Number(p.raisedAmount || 0)
  const goal        = Number(p.goalAmount   || 0)
  const cat         = CAT_META[p.category]  || CAT_META.education
  const grad        = GRADS[p.category]     || GRADS.education
  const isCompleted = p.status === 'completed'
  const progress    = getProgressMeta(pct)
  const CatIcon     = cat.Icon

  let daysLeft = null
  let isLastDay = false
  if (p.endDate && !isCompleted) {
    daysLeft = differenceInDays(new Date(p.endDate), new Date())
    isLastDay = daysLeft === 0
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
              <CatIcon className="w-16 h-16" style={{ color:'rgba(240,165,0,0.18)' }}/>
            </div>}

        <div className="absolute inset-0"
          style={{ background:'linear-gradient(to top,rgba(6,2,16,0.88) 0%,rgba(6,2,16,0.25) 55%,transparent 100%)' }}/>

        {/* Urgent — critical signal, keeps filled red */}
        {p.isUrgent && (
          <div className="absolute top-3 left-3 z-10">
            <span className="flex items-center gap-1 text-[10px] font-bold px-2.5 py-1 rounded-full text-white bg-red-600 animate-pulse">
              <AlertCircle className="w-2.5 h-2.5"/>Urgent
            </span>
          </div>
        )}

        {/* Status row — top-right, minimal */}
        <div className="absolute top-3 right-3 z-10 flex items-center gap-2">
          {isCompleted && (
            <span className="text-[9px] font-bold uppercase tracking-[0.08em] text-gold/90 flex items-center gap-1"
              style={{ textShadow: '0 1px 4px rgba(0,0,0,0.6)' }}>
              <Check className="w-2.5 h-2.5"/>Completed
            </span>
          )}
          {/* Last day — keep red, it's critical */}
          {isLastDay && (
            <span className="text-[9px] font-bold px-2 py-0.5 rounded text-white bg-red-600">
              Last day!
            </span>
          )}
          {/* Regular deadline — plain text, no fill */}
          {daysLeft !== null && daysLeft > 0 && (
            <span className="text-[9px] font-medium text-white/60 flex items-center gap-1"
              style={{ textShadow: '0 1px 3px rgba(0,0,0,0.5)' }}>
              <Clock className="w-2.5 h-2.5"/>
              {daysLeft === 1 ? '1 day left' : `${daysLeft}d left`}
            </span>
          )}
        </div>
      </div>

      {/* ── Body ── */}
      <div className="flex flex-col flex-1 p-5">

        {/* Category — hairline label */}
        {p.category && (
          <div className="flex items-center gap-1.5 mb-2">
            <span className="w-[2px] h-3 rounded-full bg-primary-500/35 flex-shrink-0"/>
            <span className="text-[9px] font-bold uppercase tracking-[0.1em] text-primary-500/65 flex items-center gap-1">
              <CatIcon className="w-2.5 h-2.5"/>{p.category}
            </span>
          </div>
        )}

        <h3 className="font-display font-bold text-[15px] leading-snug mb-1.5 line-clamp-2 text-dark">
          {p.title}
        </h3>
        <p className="text-xs leading-relaxed line-clamp-2 mb-4 text-muted-foreground">
          {p.summary}
        </p>

        {/* ── Progress ── */}
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
            <div className="text-[11px] text-center font-semibold text-gold mt-1.5 flex items-center justify-center gap-1">
              <CheckCircle2 className="w-3 h-3"/>Goal of {fmt(goal)} XAF reached!
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

        {/* ── Stats strip ── */}
        <div className="flex items-center gap-3 flex-wrap py-2.5 mb-4 border-t border-b border-primary-500/6 text-[11px] text-muted-foreground min-h-[34px]">
          {p.donorCount > 0 ? (
            <span className="flex items-center gap-1">
              <Users className="w-2.5 h-2.5 text-primary-500/60"/>{p.donorCount} donors
            </span>
          ) : (
            <span className="flex items-center gap-1 opacity-40">
              <Users className="w-2.5 h-2.5 text-primary-500/60"/>Be first to donate
            </span>
          )}
          {p.beneficiaries > 0 && (
            <span className="flex items-center gap-1">
              <Heart className="w-2.5 h-2.5 text-gold/70"/>{p.beneficiaries.toLocaleString()} beneficiaries
            </span>
          )}
          {p.location && (
            <span className="flex items-center gap-1 ml-auto">
              <MapPin className="w-2.5 h-2.5 text-primary-500/60"/>{p.location}
            </span>
          )}
        </div>

        {/* ── Actions ── */}
        <div className="flex gap-2 mt-auto">
          <Link to={`/projects/${p.slug}`}
            className="flex-1 flex items-center justify-center gap-1.5 text-xs font-semibold py-2.5 rounded-2xl transition-all duration-200 hover:bg-purple-50 border border-primary-500/20 text-primary-500">
            <ArrowRight className="w-3 h-3"/>View Project
          </Link>
          {isCompleted ? (
            <Link to={`/projects/${p.slug}`}
              className="flex-1 flex items-center justify-center gap-1.5 text-xs font-bold py-2.5 rounded-2xl text-white transition-all duration-200 hover:opacity-90"
              style={{ background:'linear-gradient(135deg,#F0A500,#FFB84D)', boxShadow:'0 4px 14px rgba(240,165,0,0.3)' }}>
              <TrendingUp className="w-3 h-3"/>See Impact
            </Link>
          ) : (
            <button
              onClick={() => onDonate && onDonate(p.id)}
              className="flex-1 flex items-center justify-center gap-1.5 text-xs font-bold py-2.5 rounded-2xl text-white transition-all duration-200 hover:shadow-lg hover:-translate-y-0.5 bg-gradient-to-br from-gold to-[#FFB84D]"
              style={{ boxShadow:'0 4px 14px rgba(240,165,0,0.3)' }}>
              <Heart className="w-3 h-3"/>Donate
            </button>
          )}
        </div>
      </div>
    </Card>
  )
}
