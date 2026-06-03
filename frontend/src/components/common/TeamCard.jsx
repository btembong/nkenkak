import { Link } from 'react-router-dom'
import { Mail, ArrowRight } from 'lucide-react'

const TEAM_ACCENT = {
  leadership:  '#eeb549',
  development: '#4b0082',
  culture:     '#430075',
  youth:       '#4b0082',
  health:      '#4b0082',
  environment: '#a57fc0',
  education:   '#430075',
  volunteer:   '#a57fc0',
}

const TEAM_GRAD = {
  leadership:  'linear-gradient(135deg,#2d004e,#4b0082)',
  development: 'linear-gradient(135deg,#2d004e,#4b0082)',
  culture:     'linear-gradient(135deg,#430075,#4b0082)',
  youth:       'linear-gradient(135deg,#4b0082,#a57fc0)',
  health:      'linear-gradient(135deg,#2d004e,#4b0082)',
  environment: 'linear-gradient(135deg,#052e16,#16a34a)',
  education:   'linear-gradient(135deg,#430075,#4b0082)',
  volunteer:   'linear-gradient(135deg,#2d004e,#a57fc0)',
}

const DEFAULT_GRAD = 'linear-gradient(135deg,#2d004e,#4b0082)'

function initials(name) {
  return name.split(' ').map(w => w[0]).filter(Boolean).slice(0, 2).join('').toUpperCase()
}

export default function TeamCard({ member: m, compact = false }) {
  const accent    = TEAM_ACCENT[m.team] || '#4b0082'
  const grad      = TEAM_GRAD[m.team]   || DEFAULT_GRAD
  const hasSocial = m.facebook || m.twitter || m.linkedin || m.email

  if (compact) {
    /* ── Horizontal compact card for volunteers ── */
    return (
      <Link to={`/team/${m.id}`} className="group block focus:outline-none">
        <div
          className="flex items-center gap-4 p-3.5 rounded-2xl bg-white transition-all duration-300 group-hover:shadow-md group-hover:-translate-y-0.5"
          style={{ border: '1px solid rgba(75,0,130,0.07)', boxShadow: '0 2px 8px rgba(75,0,130,0.05)' }}
        >
          <div className="w-14 h-14 rounded-xl overflow-hidden flex items-center justify-center flex-shrink-0"
            style={{ background: grad }}>
            {m.avatarUrl
              ? <img src={m.avatarUrl} alt={m.name} className="w-full h-full object-cover"/>
              : <span className="font-bold text-sm text-white">{initials(m.name)}</span>}
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="font-display font-bold text-sm leading-snug truncate text-dark">{m.name}</h3>
            <p className="text-[11px] font-semibold truncate mt-0.5" style={{ color: accent }}>{m.roleTitle}</p>
            <span className="text-[9px] font-bold uppercase tracking-wide px-2 py-0.5 rounded-full mt-1 inline-block"
              style={{ background: `${accent}15`, color: accent }}>{m.team || 'volunteer'}</span>
          </div>
          <ArrowRight className="w-3.5 h-3.5 flex-shrink-0 opacity-0 group-hover:opacity-100 transition-opacity" style={{ color: accent }}/>
        </div>
      </Link>
    )
  }

  /* ── Standard vertical card ── */
  return (
    <Link to={`/team/${m.id}`} className="group block focus:outline-none">
      <div
        className="overflow-hidden rounded-3xl bg-white transition-all duration-300 group-hover:-translate-y-2 group-hover:shadow-[0_24px_52px_rgba(75,0,130,0.18)]"
        style={{ boxShadow: '0 2px 12px rgba(75,0,130,0.07)', border: '1px solid rgba(75,0,130,0.06)' }}
      >
        {/* Top accent bar */}
        <div className="h-1" style={{ background: accent }} />

        {/* Photo / initials — taller for better portrait fit */}
        <div className="relative overflow-hidden flex items-center justify-center"
          style={{ height: 220, background: grad }}>
          {m.avatarUrl ? (
            <img src={m.avatarUrl} alt={m.name}
              className="w-full h-full object-cover object-top transition-transform duration-500 group-hover:scale-105"/>
          ) : (
            <div className="w-20 h-20 rounded-2xl flex items-center justify-center font-display font-bold text-2xl text-white select-none shadow-lg"
              style={{ background: 'rgba(255,255,255,0.14)', backdropFilter: 'blur(10px)', border: '1.5px solid rgba(255,255,255,0.28)' }}>
              {initials(m.name)}
            </div>
          )}
          <div className="absolute inset-x-0 bottom-0 h-12 pointer-events-none"
            style={{ background: 'linear-gradient(to top,rgba(255,255,255,0.08),transparent)' }}/>
        </div>

        {/* Info */}
        <div className="px-4 pt-4 pb-4">
          <div className="flex items-start justify-between gap-2 mb-0.5">
            <h3 className="font-display font-bold text-[15px] leading-snug truncate min-w-0 text-dark" title={m.name}>
              {m.name}
            </h3>
            {hasSocial && (
              <div className="flex items-center gap-0.5 flex-shrink-0 pt-0.5">
                {m.facebook && (
                  <a href={m.facebook} target="_blank" rel="noreferrer" onClick={e => e.stopPropagation()}
                    className="w-6 h-6 rounded-full flex items-center justify-center transition-all hover:scale-110"
                    style={{ color: 'rgba(75,0,130,0.3)' }} title="Facebook">
                    <i className="fab fa-facebook-f" style={{ fontSize: 9 }}/>
                  </a>
                )}
                {m.twitter && (
                  <a href={m.twitter} target="_blank" rel="noreferrer" onClick={e => e.stopPropagation()}
                    className="w-6 h-6 rounded-full flex items-center justify-center transition-all hover:scale-110"
                    style={{ color: 'rgba(75,0,130,0.3)' }} title="Twitter / X">
                    <i className="fab fa-twitter" style={{ fontSize: 9 }}/>
                  </a>
                )}
                {m.linkedin && (
                  <a href={m.linkedin} target="_blank" rel="noreferrer" onClick={e => e.stopPropagation()}
                    className="w-6 h-6 rounded-full flex items-center justify-center transition-all hover:scale-110"
                    style={{ color: 'rgba(75,0,130,0.3)' }} title="LinkedIn">
                    <i className="fab fa-linkedin-in" style={{ fontSize: 9 }}/>
                  </a>
                )}
                {m.email && (
                  <a href={`mailto:${m.email}`} onClick={e => e.stopPropagation()}
                    className="w-6 h-6 rounded-full flex items-center justify-center transition-all hover:scale-110"
                    style={{ color: 'rgba(75,0,130,0.3)' }} title={m.email}>
                    <Mail className="w-2.5 h-2.5"/>
                  </a>
                )}
              </div>
            )}
          </div>

          <p className="text-xs font-semibold truncate mb-3" style={{ color: accent }} title={m.roleTitle}>
            {m.roleTitle}
          </p>

          <div className="flex items-center justify-between pt-3" style={{ borderTop: '1px solid rgba(75,0,130,0.07)' }}>
            <span className="text-[9px] font-bold uppercase tracking-widest px-2.5 py-1 rounded-full capitalize"
              style={{ background: `${accent}18`, color: accent }}>
              {m.team || 'team'}
            </span>
            <span className="flex items-center gap-1 text-[11px] font-bold transition-all duration-200 group-hover:gap-2"
              style={{ color: accent }}>
              View Profile <ArrowRight className="w-3 h-3 transition-transform duration-200 group-hover:translate-x-0.5"/>
            </span>
          </div>
        </div>
      </div>
    </Link>
  )
}
