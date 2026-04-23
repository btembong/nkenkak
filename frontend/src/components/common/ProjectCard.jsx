// ProjectCard.jsx
import { Link } from 'react-router-dom'

const STATUS_BADGE = { active:'badge-active', upcoming:'badge-upcoming', completed:'badge-complete', paused:'badge-paused' }

export default function ProjectCard({ project: p, onDonate, dark }) {
  const pct = p.goal_amount > 0 ? Math.min(100, Math.round((p.raised_amount / p.goal_amount) * 100)) : 0
  const base = dark ? 'bg-white/5 border-white/8 hover:border-gold/30' : 'bg-white border-black/5'
  return (
    <div className={`rounded-xl border overflow-hidden transition-all duration-300 hover:-translate-y-1 hover:shadow-xl ${base}`}>
      <div className="h-44 bg-gradient-to-br from-forest/80 to-earth flex items-center justify-center relative overflow-hidden">
        {p.cover_image
          ? <img src={p.cover_image} alt={p.title} className="w-full h-full object-cover"/>
          : <i className="fas fa-seedling text-white/20 text-5xl"/>
        }
        <div className="absolute top-3 left-3">
          <span className={STATUS_BADGE[p.status]}>{p.status}</span>
        </div>
        {p.is_urgent && <span className="absolute top-3 right-3 text-xs bg-red-500 text-white px-2 py-0.5 rounded-full font-bold uppercase tracking-wider animate-pulse">Urgent</span>}
        <div className="absolute bottom-0 left-0 right-0 h-1 bg-white/10">
          <div className="project-progress h-full" style={{width:`${pct}%`}}/>
        </div>
      </div>
      <div className="p-5">
        <div className={`text-xs font-bold tracking-[3px] uppercase mb-2 ${dark?'text-gold':'text-gold-dark'}`}>{p.category}</div>
        <h3 className={`font-serif text-base leading-snug mb-2 line-clamp-2 ${dark?'text-cream':'text-earth'}`}>{p.title}</h3>
        <p className={`text-xs leading-relaxed mb-4 line-clamp-2 ${dark?'text-cream/50':'text-earth/60'}`}>{p.summary}</p>
        <div className="flex justify-between items-center mb-3 text-xs">
          <span className={dark?'text-cream/60':'text-earth/60'}>Raised: <strong className="text-gold">{Number(p.raised_amount).toLocaleString()} XAF</strong></span>
          <span className={dark?'text-cream/40':'text-earth/40'}>{pct}%</span>
        </div>
        <div className="h-1.5 rounded-full bg-white/10 mb-4"><div className="project-progress h-full" style={{width:`${pct}%`}}/></div>
        <div className="flex gap-2">
          <Link to={`/projects/${p.slug}`} className={`flex-1 text-center text-xs font-bold tracking-wider uppercase py-2 rounded-lg border transition-all ${dark?'border-white/10 text-cream/60 hover:border-gold/40 hover:text-gold':'border-earth/15 text-earth/60 hover:border-gold hover:text-gold'}`}>Details</Link>
          <button onClick={onDonate} className="flex-1 btn-gold !py-2 !px-3 text-xs justify-center">Donate</button>
        </div>
      </div>
    </div>
  )
}
