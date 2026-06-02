import { Link } from 'react-router-dom'
import { Card } from '../ui/card'
import { User, ArrowRight, Mail } from 'lucide-react'

const GRADS = [
  'linear-gradient(135deg,#250F47,#5B2D8E)',
  'linear-gradient(135deg,#3D1A6B,#7B4DB8)',
  'linear-gradient(135deg,#2E1578,#5B2D8E)',
  'linear-gradient(135deg,#4A2478,#7B4DB8)',
  'linear-gradient(135deg,#1A3A20,#2D5016)',
  'linear-gradient(135deg,#5B2D8E,#9B6FD8)',
]

export default function TeamCard({ member: m, index = 0 }) {
  const hasSocial = m.facebook || m.twitter || m.linkedin || m.email

  return (
    <Link to={`/team/${m.id}`} className="group block focus:outline-none">
      <Card className="overflow-hidden p-0 transition-all duration-300 group-hover:-translate-y-2 group-hover:shadow-2xl">

        {/* Photo / avatar */}
        <div className="relative h-64 overflow-hidden flex items-center justify-center"
          style={{ background: GRADS[index % GRADS.length] }}>

          {m.avatarUrl
            ? <img src={m.avatarUrl} alt={m.name}
                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" />
            : <div className="flex flex-col items-center gap-2 select-none">
                <div className="w-24 h-24 rounded-full flex items-center justify-center bg-gold/18 text-gold/70">
                  <User className="w-10 h-10"/>
                </div>
              </div>
          }

          {/* Gradient overlay at bottom */}
          <div className="absolute inset-x-0 bottom-0 h-28 pointer-events-none"
            style={{ background: 'linear-gradient(to top,rgba(26,10,53,0.92) 0%,transparent 100%)' }} />

          {/* Team badge overlaid on photo */}
          {m.team && (
            <div className="absolute top-3 left-3">
              <span className="text-[9px] font-bold uppercase tracking-widest px-2 py-1 rounded-full backdrop-blur-sm bg-white/15 text-white border border-white/20">
                {m.team}
              </span>
            </div>
          )}

          {/* Social icons — appear on hover */}
          {hasSocial && (
            <div className="absolute top-3 right-3 flex flex-col gap-1.5 opacity-0 group-hover:opacity-100 transition-all duration-300 translate-x-2 group-hover:translate-x-0">
              {m.facebook && (
                <a href={m.facebook} target="_blank" rel="noreferrer" onClick={e => e.preventDefault()}
                  className="w-7 h-7 rounded-full flex items-center justify-center text-white text-xs transition-colors hover:bg-blue-600 bg-black/40 backdrop-blur-sm">
                  <i className="fab fa-facebook-f" />
                </a>
              )}
              {m.twitter && (
                <a href={m.twitter} target="_blank" rel="noreferrer" onClick={e => e.preventDefault()}
                  className="w-7 h-7 rounded-full flex items-center justify-center text-white text-xs transition-colors hover:bg-sky-500 bg-black/40 backdrop-blur-sm">
                  <i className="fab fa-twitter" />
                </a>
              )}
              {m.linkedin && (
                <a href={m.linkedin} target="_blank" rel="noreferrer" onClick={e => e.preventDefault()}
                  className="w-7 h-7 rounded-full flex items-center justify-center text-white text-xs transition-colors hover:bg-blue-700 bg-black/40 backdrop-blur-sm">
                  <i className="fab fa-linkedin-in" />
                </a>
              )}
              {m.email && (
                <a href={`mailto:${m.email}`} onClick={e => e.preventDefault()}
                  className="w-7 h-7 rounded-full flex items-center justify-center text-white text-xs transition-colors hover:bg-amber-500 bg-black/40 backdrop-blur-sm">
                  <Mail className="w-3.5 h-3.5"/>
                </a>
              )}
            </div>
          )}

          {/* Name + role overlaid at bottom of photo */}
          <div className="absolute inset-x-0 bottom-0 px-4 pb-3 pt-6">
            <h3 className="font-display font-bold text-base text-white leading-snug">{m.name}</h3>
            <p className="text-xs font-medium mt-0.5 text-gold">{m.roleTitle}</p>
          </div>
        </div>

        {/* Bottom strip */}
        <div className="px-4 py-3 flex items-center justify-between bg-white">
          <div className="flex items-center gap-2">
            {hasSocial && (
              <div className="flex gap-1.5 items-center">
                {m.facebook && <i className="fab fa-facebook-f text-[10px] text-slate-400" />}
                {m.twitter  && <i className="fab fa-twitter text-[10px] text-slate-400" />}
                {m.linkedin && <i className="fab fa-linkedin-in text-[10px] text-slate-400" />}
                {m.email    && <Mail className="w-2.5 h-2.5 text-slate-400" />}
              </div>
            )}
            {!hasSocial && (
              <span className="text-[10px] text-gray-300">—</span>
            )}
          </div>
          <span className="flex items-center gap-1 text-[11px] font-semibold group-hover:gap-2 transition-all duration-200 text-primary-500">
            View Profile <ArrowRight className="w-3 h-3" />
          </span>
        </div>
      </Card>
    </Link>
  )
}
