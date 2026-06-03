import { Link } from 'react-router-dom'
import { User, ArrowRight, Mail } from 'lucide-react'

const GRADS = [
  'linear-gradient(135deg,#250F47,#5B2D8E)',
  'linear-gradient(135deg,#3D1A6B,#7B4DB8)',
  'linear-gradient(135deg,#2E1578,#5B2D8E)',
  'linear-gradient(135deg,#4A2478,#7B4DB8)',
  'linear-gradient(135deg,#1A3A20,#2D5016)',
  'linear-gradient(135deg,#5B2D8E,#9B6FD8)',
]

const TEAM_ACCENT = {
  leadership:  '#F0A500',
  development: '#5B2D8E',
  culture:     '#B91C1C',
  youth:       '#15803D',
  health:      '#0369A1',
  environment: '#16A34A',
  education:   '#7C3AED',
}

export default function TeamCard({ member: m, index = 0 }) {
  const hasSocial = m.facebook || m.twitter || m.linkedin || m.email
  const accent = TEAM_ACCENT[m.team] || '#5B2D8E'

  return (
    <Link to={`/team/${m.id}`} className="group block focus:outline-none">
      <div
        className="relative overflow-hidden rounded-3xl transition-all duration-300 group-hover:-translate-y-2 group-hover:shadow-[0_20px_48px_rgba(91,45,142,0.22)]"
        style={{ boxShadow: '0 2px 16px rgba(91,45,142,0.08)' }}
      >
        {/* Left accent bar */}
        <div
          className="absolute left-0 top-0 bottom-0 w-1 z-20 rounded-l-3xl transition-all duration-300 group-hover:w-1.5"
          style={{ background: accent }}
        />

        {/* Photo / gradient */}
        <div
          className="relative h-72 overflow-hidden flex items-center justify-center"
          style={{ background: GRADS[index % GRADS.length] }}
        >
          {m.avatarUrl ? (
            <img
              src={m.avatarUrl}
              alt={m.name}
              className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
            />
          ) : (
            <div
              className="w-24 h-24 rounded-full flex items-center justify-center"
              style={{ background: 'rgba(240,165,0,0.12)' }}
            >
              <User className="w-10 h-10" style={{ color: 'rgba(240,165,0,0.55)' }} />
            </div>
          )}

          {/* Bottom gradient */}
          <div
            className="absolute inset-x-0 bottom-0 h-36 pointer-events-none"
            style={{ background: 'linear-gradient(to top,rgba(20,8,45,0.97) 0%,rgba(20,8,45,0.4) 60%,transparent 100%)' }}
          />

          {/* Team badge */}
          {m.team && (
            <div className="absolute top-3 left-4 z-10">
              <span
                className="text-[9px] font-bold uppercase tracking-widest px-2.5 py-1 rounded-full backdrop-blur-sm text-white"
                style={{ background: 'rgba(0,0,0,0.35)', border: '1px solid rgba(255,255,255,0.15)' }}
              >
                {m.team}
              </span>
            </div>
          )}

          {/* Social icons — slide in on hover */}
          {hasSocial && (
            <div className="absolute top-3 right-3 z-10 flex flex-col gap-1.5 opacity-0 group-hover:opacity-100 transition-all duration-300 translate-x-3 group-hover:translate-x-0">
              {m.facebook && (
                <a href={m.facebook} target="_blank" rel="noreferrer" onClick={e => e.stopPropagation()}
                  className="w-7 h-7 rounded-full flex items-center justify-center text-white text-xs backdrop-blur-sm transition-colors hover:bg-blue-600 bg-black/40">
                  <i className="fab fa-facebook-f" />
                </a>
              )}
              {m.twitter && (
                <a href={m.twitter} target="_blank" rel="noreferrer" onClick={e => e.stopPropagation()}
                  className="w-7 h-7 rounded-full flex items-center justify-center text-white text-xs backdrop-blur-sm transition-colors hover:bg-sky-500 bg-black/40">
                  <i className="fab fa-twitter" />
                </a>
              )}
              {m.linkedin && (
                <a href={m.linkedin} target="_blank" rel="noreferrer" onClick={e => e.stopPropagation()}
                  className="w-7 h-7 rounded-full flex items-center justify-center text-white text-xs backdrop-blur-sm transition-colors hover:bg-blue-700 bg-black/40">
                  <i className="fab fa-linkedin-in" />
                </a>
              )}
              {m.email && (
                <a href={`mailto:${m.email}`} onClick={e => e.stopPropagation()}
                  className="w-7 h-7 rounded-full flex items-center justify-center text-white text-xs backdrop-blur-sm transition-colors hover:bg-amber-500 bg-black/40">
                  <Mail className="w-3.5 h-3.5" />
                </a>
              )}
            </div>
          )}

          {/* Name + role + CTA */}
          <div className="absolute inset-x-0 bottom-0 px-4 pb-4 pt-8 z-10">
            <h3 className="font-display font-bold text-base text-white leading-snug">{m.name}</h3>
            <div className="flex items-center justify-between mt-0.5">
              <p className="text-xs font-medium" style={{ color: accent === '#F0A500' ? '#F0A500' : 'rgba(240,165,0,0.9)' }}>
                {m.roleTitle}
              </p>
              <span className="flex items-center gap-1 text-[11px] font-semibold text-white/60 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                View <ArrowRight className="w-3 h-3" />
              </span>
            </div>
          </div>
        </div>
      </div>
    </Link>
  )
}
