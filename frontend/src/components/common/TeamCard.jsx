import { Link } from 'react-router-dom'

const GRADS = [
  'linear-gradient(135deg,#250F47,#5B2D8E)',
  'linear-gradient(135deg,#3D1A6B,#7B4DB8)',
  'linear-gradient(135deg,#2E1578,#5B2D8E)',
  'linear-gradient(135deg,#4A2478,#7B4DB8)',
  'linear-gradient(135deg,#1A3A20,#2D5016)',
  'linear-gradient(135deg,#5B2D8E,#9B6FD8)',
]

const TEAM_COLORS = {
  leadership:  { bg: 'rgba(240,165,0,0.12)',   color: '#B8830A' },
  development: { bg: 'rgba(91,45,142,0.1)',    color: '#5B2D8E' },
  culture:     { bg: 'rgba(220,38,38,0.08)',   color: '#B91C1C' },
  youth:       { bg: 'rgba(16,163,74,0.08)',   color: '#15803D' },
  health:      { bg: 'rgba(14,165,233,0.08)',  color: '#0369A1' },
  environment: { bg: 'rgba(34,197,94,0.08)',   color: '#16A34A' },
  education:   { bg: 'rgba(168,85,247,0.08)',  color: '#7C3AED' },
}

export default function TeamCard({ member: m, index = 0 }) {
  const tc = TEAM_COLORS[m.team] || { bg: 'rgba(91,45,142,0.08)', color: '#5B2D8E' }
  const hasSocial = m.facebook || m.twitter || m.linkedin || m.email

  return (
    <Link to={`/team/${m.id}`} className="group block focus:outline-none">
      <div className="card overflow-hidden p-0 transition-all duration-300 group-hover:-translate-y-2 group-hover:shadow-2xl"
        style={{ '--shadow-hover': '0 20px 60px rgba(91,45,142,0.2)' }}>

        {/* Photo / avatar */}
        <div className="relative h-64 overflow-hidden flex items-center justify-center"
          style={{ background: GRADS[index % GRADS.length] }}>

          {m.avatarUrl
            ? <img src={m.avatarUrl} alt={m.name}
                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" />
            : <div className="flex flex-col items-center gap-2 select-none">
                <div className="w-24 h-24 rounded-full flex items-center justify-center text-4xl"
                  style={{ background: 'rgba(240,165,0,0.18)', color: 'rgba(240,165,0,0.7)' }}>
                  <i className="fas fa-user" />
                </div>
              </div>
          }

          {/* Gradient overlay at bottom */}
          <div className="absolute inset-x-0 bottom-0 h-28 pointer-events-none"
            style={{ background: 'linear-gradient(to top,rgba(26,10,53,0.92) 0%,transparent 100%)' }} />

          {/* Team badge overlaid on photo */}
          {m.team && (
            <div className="absolute top-3 left-3">
              <span className="text-[9px] font-bold uppercase tracking-widest px-2 py-1 rounded-full backdrop-blur-sm"
                style={{ background: 'rgba(255,255,255,0.15)', color: '#fff', border: '1px solid rgba(255,255,255,0.2)' }}>
                {m.team}
              </span>
            </div>
          )}

          {/* Social icons — appear on hover */}
          {hasSocial && (
            <div className="absolute top-3 right-3 flex flex-col gap-1.5 opacity-0 group-hover:opacity-100 transition-all duration-300 translate-x-2 group-hover:translate-x-0">
              {m.facebook && (
                <a href={m.facebook} target="_blank" rel="noreferrer" onClick={e => e.preventDefault()}
                  className="w-7 h-7 rounded-full flex items-center justify-center text-white text-xs transition-colors hover:bg-blue-600"
                  style={{ background: 'rgba(0,0,0,0.4)', backdropFilter: 'blur(4px)' }}>
                  <i className="fab fa-facebook-f" />
                </a>
              )}
              {m.twitter && (
                <a href={m.twitter} target="_blank" rel="noreferrer" onClick={e => e.preventDefault()}
                  className="w-7 h-7 rounded-full flex items-center justify-center text-white text-xs transition-colors hover:bg-sky-500"
                  style={{ background: 'rgba(0,0,0,0.4)', backdropFilter: 'blur(4px)' }}>
                  <i className="fab fa-twitter" />
                </a>
              )}
              {m.linkedin && (
                <a href={m.linkedin} target="_blank" rel="noreferrer" onClick={e => e.preventDefault()}
                  className="w-7 h-7 rounded-full flex items-center justify-center text-white text-xs transition-colors hover:bg-blue-700"
                  style={{ background: 'rgba(0,0,0,0.4)', backdropFilter: 'blur(4px)' }}>
                  <i className="fab fa-linkedin-in" />
                </a>
              )}
              {m.email && (
                <a href={`mailto:${m.email}`} onClick={e => e.preventDefault()}
                  className="w-7 h-7 rounded-full flex items-center justify-center text-white text-xs transition-colors hover:bg-amber-500"
                  style={{ background: 'rgba(0,0,0,0.4)', backdropFilter: 'blur(4px)' }}>
                  <i className="fas fa-envelope" />
                </a>
              )}
            </div>
          )}

          {/* Name + role overlaid at bottom of photo */}
          <div className="absolute inset-x-0 bottom-0 px-4 pb-3 pt-6">
            <h3 className="font-display font-bold text-base text-white leading-snug">{m.name}</h3>
            <p className="text-xs font-medium mt-0.5" style={{ color: '#F0A500', fontFamily: 'Poppins,sans-serif' }}>{m.roleTitle}</p>
          </div>
        </div>

        {/* Bottom strip */}
        <div className="px-4 py-3 flex items-center justify-between"
          style={{ background: '#fff' }}>
          <div className="flex items-center gap-2">
            {hasSocial && (
              <div className="flex gap-1.5">
                {m.facebook && <i className="fab fa-facebook-f text-[10px]" style={{ color: '#94A3B8' }} />}
                {m.twitter  && <i className="fab fa-twitter text-[10px]"    style={{ color: '#94A3B8' }} />}
                {m.linkedin && <i className="fab fa-linkedin-in text-[10px]" style={{ color: '#94A3B8' }} />}
                {m.email    && <i className="fas fa-envelope text-[10px]"   style={{ color: '#94A3B8' }} />}
              </div>
            )}
            {!hasSocial && (
              <span className="text-[10px]" style={{ color: '#D1D5DB', fontFamily: 'Poppins,sans-serif' }}>—</span>
            )}
          </div>
          <span className="flex items-center gap-1 text-[11px] font-semibold group-hover:gap-2 transition-all duration-200"
            style={{ color: '#5B2D8E', fontFamily: 'Sora,sans-serif' }}>
            View Profile <i className="fas fa-arrow-right text-[9px]" />
          </span>
        </div>
      </div>
    </Link>
  )
}
