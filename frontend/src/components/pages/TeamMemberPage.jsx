import { Link, useParams, useNavigate } from 'react-router-dom'
import { useQuery } from 'react-query'
import api from '../../services/api'
import JoinTeamModal from '../common/JoinTeamModal'
import { useState } from 'react'

const GRADS = [
  'linear-gradient(135deg,#250F47,#5B2D8E)',
  'linear-gradient(135deg,#3D1A6B,#7B4DB8)',
  'linear-gradient(135deg,#2E1578,#5B2D8E)',
  'linear-gradient(135deg,#4A2478,#7B4DB8)',
  'linear-gradient(135deg,#1A3A20,#2D5016)',
  'linear-gradient(135deg,#5B2D8E,#9B6FD8)',
]

const TEAM_META = {
  leadership:  { icon: 'fa-crown',          label: 'Leadership Council',  color: '#B8830A', bg: 'rgba(240,165,0,0.1)' },
  development: { icon: 'fa-hard-hat',       label: 'Development Team',    color: '#5B2D8E', bg: 'rgba(91,45,142,0.1)' },
  culture:     { icon: 'fa-masks-theater',  label: 'Cultural Council',    color: '#B91C1C', bg: 'rgba(220,38,38,0.08)' },
  youth:       { icon: 'fa-rocket',         label: 'Youth Wing',          color: '#15803D', bg: 'rgba(16,163,74,0.08)' },
  health:      { icon: 'fa-heartbeat',      label: 'Health Committee',    color: '#0369A1', bg: 'rgba(14,165,233,0.08)' },
  environment: { icon: 'fa-leaf',           label: 'Environment Team',    color: '#16A34A', bg: 'rgba(34,197,94,0.08)' },
  education:   { icon: 'fa-graduation-cap', label: 'Education Committee', color: '#7C3AED', bg: 'rgba(168,85,247,0.08)' },
}

export default function TeamMemberPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [joinOpen, setJoinOpen] = useState(false)

  const { data: member, isLoading, isError } = useQuery(
    ['team-member', id],
    () => api.get(`/team/${id}`).then(r => r.data)
  )

  const { data: teammates } = useQuery(
    ['team-members', member?.team],
    () => api.get('/team').then(r => r.data.filter(m => m.team === member.team && m.id !== id).slice(0, 3)),
    { enabled: !!member?.team }
  )

  if (isLoading) return (
    <div className="min-h-screen flex items-center justify-center" style={{ background: '#F3EEF9' }}>
      <div className="w-12 h-12 rounded-full border-4 animate-spin"
        style={{ borderColor: 'rgba(91,45,142,0.15)', borderTopColor: '#5B2D8E' }} />
    </div>
  )

  if (isError || !member) return (
    <div className="min-h-screen flex flex-col items-center justify-center gap-4 px-6 text-center" style={{ background: '#F3EEF9' }}>
      <div className="w-20 h-20 rounded-full flex items-center justify-center text-3xl mb-2"
        style={{ background: 'rgba(91,45,142,0.08)', color: 'rgba(91,45,142,0.3)' }}>
        <i className="fas fa-user-slash" />
      </div>
      <h2 className="font-display font-bold text-2xl" style={{ color: '#1A0A35' }}>Member not found</h2>
      <Link to="/team" className="btn-secondary mt-2"><i className="fas fa-arrow-left" />Back to Team</Link>
    </div>
  )

  const tm = TEAM_META[member.team] || { icon: 'fa-users', label: member.team, color: '#5B2D8E', bg: 'rgba(91,45,142,0.1)' }
  const grad = GRADS[Math.abs(id.charCodeAt(0)) % GRADS.length]
  const hasSocial = member.facebook || member.twitter || member.linkedin || member.email

  return (
    <div>
      {/* Breadcrumb hero */}
      <div className="page-hero py-16 px-6">
        <div className="max-w-5xl mx-auto">
          <div className="flex items-center gap-2 text-sm mb-4 justify-center" style={{ color: 'rgba(255,255,255,0.6)', fontFamily: 'Poppins,sans-serif' }}>
            <Link to="/" className="hover:text-white transition-colors flex items-center gap-1">
              <i className="fas fa-home text-xs" />Home
            </Link>
            <i className="fas fa-chevron-right text-xs" style={{ color: '#F0A500' }} />
            <Link to="/team" className="hover:text-white transition-colors">Team</Link>
            <i className="fas fa-chevron-right text-xs" style={{ color: '#F0A500' }} />
            <span style={{ color: '#F0A500' }}>{member.name}</span>
          </div>
        </div>
      </div>

      <section className="py-16 px-6" style={{ background: '#FAFAFA' }}>
        <div className="max-w-5xl mx-auto">

          {/* Back button */}
          <button onClick={() => navigate('/team')}
            className="flex items-center gap-2 text-sm font-semibold mb-8 transition-colors hover:opacity-70"
            style={{ color: '#5B2D8E', fontFamily: 'Sora,sans-serif' }}>
            <i className="fas fa-arrow-left text-xs" /> Back to Team
          </button>

          {/* Main card */}
          <div className="card overflow-hidden mb-10">
            {/* Cover banner */}
            <div className="relative h-40 md:h-52 overflow-hidden" style={{ background: grad }}>
              <div className="absolute inset-0 wave-pattern opacity-30" />
              {/* Decorative circles */}
              <div className="absolute -top-10 -right-10 w-48 h-48 rounded-full" style={{ background: 'rgba(240,165,0,0.08)' }} />
              <div className="absolute -bottom-16 -left-10 w-56 h-56 rounded-full" style={{ background: 'rgba(255,255,255,0.04)' }} />
            </div>

            <div className="px-6 md:px-10 pb-8 relative">
              {/* Avatar — overlaps cover */}
              <div className="relative -mt-16 mb-4 w-fit">
                <div className="w-32 h-32 rounded-3xl overflow-hidden ring-4 ring-white shadow-xl"
                  style={{ background: grad }}>
                  {member.avatarUrl
                    ? <img src={member.avatarUrl} alt={member.name} className="w-full h-full object-cover" />
                    : <div className="w-full h-full flex items-center justify-center text-4xl"
                        style={{ color: 'rgba(240,165,0,0.6)' }}>
                        <i className="fas fa-user" />
                      </div>
                  }
                </div>
              </div>

              {/* Name + meta row */}
              <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
                <div>
                  <h1 className="font-display font-bold text-3xl mb-1" style={{ color: '#1A0A35' }}>{member.name}</h1>
                  <p className="text-base font-semibold mb-3" style={{ color: '#F0A500', fontFamily: 'Poppins,sans-serif' }}>{member.roleTitle}</p>
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider px-3 py-1.5 rounded-full"
                      style={{ background: tm.bg, color: tm.color }}>
                      <i className={`fas ${tm.icon} text-[10px]`} />{tm.label}
                    </span>
                    <span className="flex items-center gap-1 text-xs px-3 py-1.5 rounded-full"
                      style={{ background: 'rgba(91,45,142,0.06)', color: '#5B2D8E', fontFamily: 'Poppins,sans-serif' }}>
                      <i className="fas fa-map-marker-alt text-[9px]" />Nkenkak-Ngiesang, Cameroon
                    </span>
                  </div>
                </div>

                {/* Social links */}
                {hasSocial && (
                  <div className="flex items-center gap-2 flex-shrink-0">
                    {member.facebook && (
                      <a href={member.facebook} target="_blank" rel="noreferrer"
                        className="w-10 h-10 rounded-2xl flex items-center justify-center text-sm transition-all hover:-translate-y-0.5 hover:shadow-lg"
                        style={{ background: 'rgba(59,130,246,0.1)', color: '#3B82F6' }}>
                        <i className="fab fa-facebook-f" />
                      </a>
                    )}
                    {member.twitter && (
                      <a href={member.twitter} target="_blank" rel="noreferrer"
                        className="w-10 h-10 rounded-2xl flex items-center justify-center text-sm transition-all hover:-translate-y-0.5 hover:shadow-lg"
                        style={{ background: 'rgba(14,165,233,0.1)', color: '#0EA5E9' }}>
                        <i className="fab fa-twitter" />
                      </a>
                    )}
                    {member.linkedin && (
                      <a href={member.linkedin} target="_blank" rel="noreferrer"
                        className="w-10 h-10 rounded-2xl flex items-center justify-center text-sm transition-all hover:-translate-y-0.5 hover:shadow-lg"
                        style={{ background: 'rgba(10,102,194,0.1)', color: '#0A66C2' }}>
                        <i className="fab fa-linkedin-in" />
                      </a>
                    )}
                    {member.email && (
                      <a href={`mailto:${member.email}`}
                        className="w-10 h-10 rounded-2xl flex items-center justify-center text-sm transition-all hover:-translate-y-0.5 hover:shadow-lg"
                        style={{ background: 'rgba(240,165,0,0.1)', color: '#B8830A' }}>
                        <i className="fas fa-envelope" />
                      </a>
                    )}
                  </div>
                )}
              </div>

              {/* Bio */}
              {member.bio && (
                <div className="mt-6 pt-6 border-t" style={{ borderColor: 'rgba(91,45,142,0.08)' }}>
                  <h2 className="font-display font-bold text-base mb-3" style={{ color: '#1A0A35' }}>About</h2>
                  <p className="text-sm leading-relaxed" style={{ color: '#737373', fontFamily: 'Poppins,sans-serif' }}>
                    {member.bio}
                  </p>
                </div>
              )}

              {/* Contact CTA */}
              {member.email && (
                <div className="mt-6 pt-6 border-t" style={{ borderColor: 'rgba(91,45,142,0.08)' }}>
                  <a href={`mailto:${member.email}`}
                    className="inline-flex items-center gap-2 text-sm font-semibold px-5 py-2.5 rounded-2xl transition-all hover:-translate-y-0.5 hover:shadow-lg"
                    style={{ background: 'linear-gradient(135deg,#F0A500,#FFB84D)', color: '#fff', fontFamily: 'Sora,sans-serif' }}>
                    <i className="fas fa-envelope" />Contact {member.name.split(' ')[0]}
                  </a>
                </div>
              )}
            </div>
          </div>

          {/* Info cards row */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-10">
            <div className="card p-5">
              <div className="w-10 h-10 rounded-2xl flex items-center justify-center mb-3"
                style={{ background: tm.bg }}>
                <i className={`fas ${tm.icon} text-sm`} style={{ color: tm.color }} />
              </div>
              <div className="font-display font-bold text-sm mb-1" style={{ color: '#1A0A35' }}>Department</div>
              <div className="text-sm" style={{ color: '#737373', fontFamily: 'Poppins,sans-serif' }}>{tm.label}</div>
            </div>
            <div className="card p-5">
              <div className="w-10 h-10 rounded-2xl flex items-center justify-center mb-3"
                style={{ background: 'rgba(91,45,142,0.08)' }}>
                <i className="fas fa-briefcase text-sm" style={{ color: '#5B2D8E' }} />
              </div>
              <div className="font-display font-bold text-sm mb-1" style={{ color: '#1A0A35' }}>Role</div>
              <div className="text-sm" style={{ color: '#737373', fontFamily: 'Poppins,sans-serif' }}>{member.roleTitle}</div>
            </div>
            <div className="card p-5">
              <div className="w-10 h-10 rounded-2xl flex items-center justify-center mb-3"
                style={{ background: 'rgba(240,165,0,0.1)' }}>
                <i className="fas fa-map-marker-alt text-sm" style={{ color: '#F0A500' }} />
              </div>
              <div className="font-display font-bold text-sm mb-1" style={{ color: '#1A0A35' }}>Location</div>
              <div className="text-sm" style={{ color: '#737373', fontFamily: 'Poppins,sans-serif' }}>Nkenkak-Ngiesang, West Region, Cameroon</div>
            </div>
          </div>

          {/* Teammates */}
          {teammates?.length > 0 && (
            <div className="mb-10">
              <div className="flex items-center justify-between mb-6">
                <h2 className="font-display font-bold text-xl" style={{ color: '#1A0A35' }}>
                  Other {tm.label} Members
                </h2>
                <Link to="/team" className="text-sm font-semibold flex items-center gap-1.5 transition-colors hover:opacity-70"
                  style={{ color: '#5B2D8E', fontFamily: 'Sora,sans-serif' }}>
                  View All <i className="fas fa-arrow-right text-xs" />
                </Link>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                {teammates.map((t, i) => (
                  <Link key={t.id} to={`/team/${t.id}`}
                    className="card overflow-hidden p-0 flex items-center gap-4 p-4 transition-all hover:-translate-y-0.5 group">
                    <div className="w-14 h-14 rounded-2xl overflow-hidden flex-shrink-0 flex items-center justify-center"
                      style={{ background: GRADS[i % GRADS.length] }}>
                      {t.avatarUrl
                        ? <img src={t.avatarUrl} alt={t.name} className="w-full h-full object-cover" />
                        : <i className="fas fa-user text-xl" style={{ color: 'rgba(240,165,0,0.6)' }} />
                      }
                    </div>
                    <div className="min-w-0">
                      <div className="font-display font-bold text-sm truncate" style={{ color: '#1A0A35' }}>{t.name}</div>
                      <div className="text-xs mt-0.5 truncate" style={{ color: '#F0A500', fontFamily: 'Poppins,sans-serif' }}>{t.roleTitle}</div>
                    </div>
                    <i className="fas fa-arrow-right text-xs ml-auto opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0"
                      style={{ color: '#5B2D8E' }} />
                  </Link>
                ))}
              </div>
            </div>
          )}

          {/* Join CTA */}
          <div className="rounded-3xl p-8 relative overflow-hidden text-center"
            style={{ background: 'linear-gradient(135deg,#250F47,#5B2D8E)' }}>
            <div className="wave-pattern absolute inset-0" />
            <div className="relative">
              <div className="eyebrow justify-center mb-3" style={{ color: 'rgba(240,165,0,0.85)' }}>
                <span className="w-5 h-0.5 rounded-full inline-block mr-2" style={{ background: '#F0A500' }} />Get Involved
              </div>
              <h3 className="font-display font-bold text-2xl text-white mb-2">Join the {tm.label}</h3>
              <p className="text-sm mb-6 max-w-sm mx-auto" style={{ color: 'rgba(255,255,255,0.65)', fontFamily: 'Poppins,sans-serif' }}>
                Your skills and passion can help drive real change in Nkenkak-Ngiesang.
              </p>
              <button onClick={() => setJoinOpen(true)} className="btn-gold">
                <i className="fas fa-user-plus" />Apply to Join
              </button>
            </div>
          </div>

        </div>
      </section>

      {joinOpen && <JoinTeamModal onClose={() => setJoinOpen(false)} defaultTeam={member.team} />}
    </div>
  )
}
