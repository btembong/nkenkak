import { Link } from 'react-router-dom'
import { Mail, ArrowRight } from 'lucide-react'

const TEAM_ACCENT = {
  leadership:  '#F0A500',
  development: '#5B2D8E',
  culture:     '#B91C1C',
  youth:       '#15803D',
  health:      '#0369A1',
  environment: '#16A34A',
  education:   '#7C3AED',
}

const TEAM_GRAD = {
  leadership:  'linear-gradient(135deg,#92600A,#C88A1A)',
  development: 'linear-gradient(135deg,#250F47,#5B2D8E)',
  culture:     'linear-gradient(135deg,#7F1D1D,#B91C1C)',
  youth:       'linear-gradient(135deg,#14532D,#166534)',
  health:      'linear-gradient(135deg,#0C2D4A,#0369A1)',
  environment: 'linear-gradient(135deg,#14532D,#15803D)',
  education:   'linear-gradient(135deg,#3B0764,#7C3AED)',
}

const DEFAULT_GRAD = 'linear-gradient(135deg,#250F47,#5B2D8E)'

function initials(name) {
  return name.split(' ').map(w => w[0]).filter(Boolean).slice(0, 2).join('').toUpperCase()
}

export default function TeamCard({ member: m }) {
  const accent    = TEAM_ACCENT[m.team] || '#5B2D8E'
  const grad      = TEAM_GRAD[m.team]   || DEFAULT_GRAD
  const hasSocial = m.facebook || m.twitter || m.linkedin || m.email

  return (
    <Link to={`/team/${m.id}`} className="group block focus:outline-none">
      <div
        className="overflow-hidden rounded-3xl bg-white transition-all duration-300 group-hover:-translate-y-2 group-hover:shadow-[0_24px_52px_rgba(91,45,142,0.18)]"
        style={{
          boxShadow: '0 2px 12px rgba(91,45,142,0.07)',
          border: '1px solid rgba(91,45,142,0.06)',
        }}
      >
        {/* Top accent bar — team colour */}
        <div className="h-1 transition-all duration-300" style={{ background: accent }} />

        {/* Photo / initials area */}
        <div
          className="relative h-44 overflow-hidden flex items-center justify-center"
          style={{ background: grad }}
        >
          {m.avatarUrl ? (
            <img
              src={m.avatarUrl}
              alt={m.name}
              className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
            />
          ) : (
            /* Initials avatar — frosted glass tile */
            <div
              className="w-20 h-20 rounded-2xl flex items-center justify-center font-display font-bold text-2xl text-white select-none shadow-lg"
              style={{
                background: 'rgba(255,255,255,0.14)',
                backdropFilter: 'blur(10px)',
                border: '1.5px solid rgba(255,255,255,0.28)',
              }}
            >
              {initials(m.name)}
            </div>
          )}

          {/* Faint bottom fade to match info strip */}
          <div
            className="absolute inset-x-0 bottom-0 h-8 pointer-events-none"
            style={{ background: 'linear-gradient(to top,rgba(255,255,255,0.06),transparent)' }}
          />
        </div>

        {/* Info strip */}
        <div className="px-4 pt-4 pb-4">

          {/* Name + social icons row */}
          <div className="flex items-start justify-between gap-2 mb-0.5">
            <h3
              className="font-display font-bold text-[15px] leading-snug truncate min-w-0"
              style={{ color: '#1A0A35' }}
              title={m.name}
            >
              {m.name}
            </h3>

            {/* Social — always visible, subtle dots */}
            {hasSocial && (
              <div className="flex items-center gap-0.5 flex-shrink-0 pt-0.5">
                {m.facebook && (
                  <a href={m.facebook} target="_blank" rel="noreferrer"
                    onClick={e => e.stopPropagation()}
                    className="w-6 h-6 rounded-full flex items-center justify-center transition-all hover:scale-110"
                    style={{ color: 'rgba(91,45,142,0.28)' }}
                    title="Facebook"
                  >
                    <i className="fab fa-facebook-f" style={{ fontSize: 9 }} />
                  </a>
                )}
                {m.twitter && (
                  <a href={m.twitter} target="_blank" rel="noreferrer"
                    onClick={e => e.stopPropagation()}
                    className="w-6 h-6 rounded-full flex items-center justify-center transition-all hover:scale-110"
                    style={{ color: 'rgba(91,45,142,0.28)' }}
                    title="Twitter / X"
                  >
                    <i className="fab fa-twitter" style={{ fontSize: 9 }} />
                  </a>
                )}
                {m.linkedin && (
                  <a href={m.linkedin} target="_blank" rel="noreferrer"
                    onClick={e => e.stopPropagation()}
                    className="w-6 h-6 rounded-full flex items-center justify-center transition-all hover:scale-110"
                    style={{ color: 'rgba(91,45,142,0.28)' }}
                    title="LinkedIn"
                  >
                    <i className="fab fa-linkedin-in" style={{ fontSize: 9 }} />
                  </a>
                )}
                {m.email && (
                  <a href={`mailto:${m.email}`}
                    onClick={e => e.stopPropagation()}
                    className="w-6 h-6 rounded-full flex items-center justify-center transition-all hover:scale-110"
                    style={{ color: 'rgba(91,45,142,0.28)' }}
                    title={m.email}
                  >
                    <Mail className="w-2.5 h-2.5" />
                  </a>
                )}
              </div>
            )}
          </div>

          {/* Role — team accent colour */}
          <p
            className="text-xs font-semibold truncate mb-3"
            style={{ color: accent, fontFamily: 'Poppins,sans-serif' }}
            title={m.roleTitle}
          >
            {m.roleTitle}
          </p>

          {/* Footer row: team pill + View Profile */}
          <div
            className="flex items-center justify-between pt-3"
            style={{ borderTop: '1px solid rgba(91,45,142,0.07)' }}
          >
            <span
              className="text-[9px] font-bold uppercase tracking-widest px-2.5 py-1 rounded-full capitalize"
              style={{ background: `${accent}1A`, color: accent }}
            >
              {m.team || 'team'}
            </span>

            <span
              className="flex items-center gap-1 text-[11px] font-bold transition-all duration-200 group-hover:gap-2"
              style={{ color: accent, fontFamily: 'Sora,sans-serif' }}
            >
              View Profile <ArrowRight className="w-3 h-3 transition-transform duration-200 group-hover:translate-x-0.5" />
            </span>
          </div>
        </div>
      </div>
    </Link>
  )
}
