import { useState } from 'react'
import { Link, useParams, useNavigate } from 'react-router-dom'
import { useQuery } from 'react-query'
import api from '../../services/api'
import TeamCard from '../common/TeamCard'
import JoinTeamModal from '../common/JoinTeamModal'
import {
  Home, ChevronRight, ArrowLeft, User, Crown, HardHat, Drama,
  Rocket, HeartPulse, Leaf, GraduationCap, Users, MapPin,
  Briefcase, Mail, UserPlus, ArrowRight,
} from 'lucide-react'

const GRADS = [
  'linear-gradient(135deg,#250F47,#5B2D8E)',
  'linear-gradient(135deg,#3D1A6B,#7B4DB8)',
  'linear-gradient(135deg,#2E1578,#5B2D8E)',
  'linear-gradient(135deg,#4A2478,#7B4DB8)',
  'linear-gradient(135deg,#1A3A20,#2D5016)',
  'linear-gradient(135deg,#5B2D8E,#9B6FD8)',
]

const TEAM_META = {
  leadership:  { Icon: Crown,         label: 'Leadership Council',  color: '#B8830A', bg: 'rgba(240,165,0,0.1)' },
  development: { Icon: HardHat,       label: 'Development Team',    color: '#5B2D8E', bg: 'rgba(91,45,142,0.1)' },
  culture:     { Icon: Drama,         label: 'Cultural Council',    color: '#B91C1C', bg: 'rgba(220,38,38,0.08)' },
  youth:       { Icon: Rocket,        label: 'Youth Wing',          color: '#15803D', bg: 'rgba(16,163,74,0.08)' },
  health:      { Icon: HeartPulse,    label: 'Health Committee',    color: '#0369A1', bg: 'rgba(14,165,233,0.08)' },
  environment: { Icon: Leaf,          label: 'Environment Team',    color: '#16A34A', bg: 'rgba(34,197,94,0.08)' },
  education:   { Icon: GraduationCap, label: 'Education Committee', color: '#7C3AED', bg: 'rgba(168,85,247,0.08)' },
}

export default function TeamMemberPage() {
  const { id }  = useParams()
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
    <div className="min-h-screen flex flex-col items-center justify-center gap-4 px-6 text-center"
      style={{ background: '#F3EEF9' }}>
      <div className="w-20 h-20 rounded-full flex items-center justify-center mb-2"
        style={{ background: 'rgba(91,45,142,0.08)' }}>
        <User className="w-10 h-10" style={{ color: 'rgba(91,45,142,0.3)' }} />
      </div>
      <h2 className="font-display font-bold text-2xl" style={{ color: '#1A0A35' }}>Member not found</h2>
      <Link to="/team" className="btn-secondary mt-2">
        <ArrowLeft className="w-4 h-4" /> Back to Team
      </Link>
    </div>
  )

  const tm   = TEAM_META[member.team] || { Icon: Users, label: member.team, color: '#5B2D8E', bg: 'rgba(91,45,142,0.1)' }
  const grad = GRADS[Math.abs(id.charCodeAt(0)) % GRADS.length]
  const hasSocial = member.facebook || member.twitter || member.linkedin || member.email

  return (
    <div>
      {/* Hero breadcrumb */}
      <div className="page-hero py-14 px-6">
        <div className="max-w-5xl mx-auto">
          <div className="flex items-center gap-2 text-sm justify-center mb-0"
            style={{ color: 'rgba(255,255,255,0.6)', fontFamily: 'Poppins,sans-serif' }}>
            <Link to="/" className="hover:text-white transition-colors flex items-center gap-1">
              <Home className="w-3 h-3" />Home
            </Link>
            <ChevronRight className="w-3 h-3 text-gold" />
            <Link to="/team" className="hover:text-white transition-colors">Team</Link>
            <ChevronRight className="w-3 h-3 text-gold" />
            <span className="text-gold">{member.name}</span>
          </div>
        </div>
      </div>

      <section className="py-12 px-6" style={{ background: '#FAFAFA' }}>
        <div className="max-w-5xl mx-auto">

          {/* Back */}
          <button onClick={() => navigate('/team')}
            className="flex items-center gap-2 text-sm font-semibold mb-8 transition-all hover:opacity-70 hover:-translate-x-0.5"
            style={{ color: '#5B2D8E', fontFamily: 'Sora,sans-serif' }}>
            <ArrowLeft className="w-4 h-4" /> Back to Team
          </button>

          {/* Profile layout */}
          <div className="grid lg:grid-cols-3 gap-8 mb-10">

            {/* ── Left: Avatar + contact card ── */}
            <div className="lg:col-span-1 space-y-4">

              {/* Avatar card */}
              <div className="rounded-3xl overflow-hidden" style={{ boxShadow: '0 4px 24px rgba(91,45,142,0.12)' }}>
                {/* Cover strip */}
                <div className="relative h-24 overflow-hidden" style={{ background: grad }}>
                  <div className="absolute inset-0 wave-pattern opacity-20" />
                  <div className="absolute -top-6 -right-6 w-32 h-32 rounded-full"
                    style={{ background: 'rgba(240,165,0,0.07)' }} />
                </div>

                <div className="bg-white px-5 pb-6 relative">
                  {/* Avatar overlapping cover */}
                  <div className="relative -mt-10 mb-3 w-fit">
                    <div className="w-20 h-20 rounded-2xl overflow-hidden ring-4 ring-white shadow-lg"
                      style={{ background: grad }}>
                      {member.avatarUrl
                        ? <img src={member.avatarUrl} alt={member.name} className="w-full h-full object-cover" />
                        : <div className="w-full h-full flex items-center justify-center"
                            style={{ color: 'rgba(240,165,0,0.55)' }}>
                            <User className="w-8 h-8" />
                          </div>
                      }
                    </div>
                  </div>

                  <h1 className="font-display font-bold text-xl leading-snug" style={{ color: '#1A0A35' }}>{member.name}</h1>
                  <p className="text-sm font-semibold mt-0.5 mb-3" style={{ color: '#F0A500', fontFamily: 'Poppins,sans-serif' }}>
                    {member.roleTitle}
                  </p>

                  {/* Team + location pills */}
                  <div className="flex flex-wrap gap-2 mb-4">
                    <span className="flex items-center gap-1.5 text-xs font-bold px-3 py-1.5 rounded-full"
                      style={{ background: tm.bg, color: tm.color }}>
                      <tm.Icon className="w-3 h-3" />{tm.label}
                    </span>
                    <span className="flex items-center gap-1 text-xs px-3 py-1.5 rounded-full"
                      style={{ background: 'rgba(91,45,142,0.06)', color: '#5B2D8E', fontFamily: 'Poppins,sans-serif' }}>
                      <MapPin className="w-3 h-3" />Nkenkak-Ngiesang
                    </span>
                  </div>

                  {/* Social links */}
                  {hasSocial && (
                    <div className="flex items-center gap-2 mb-4">
                      {member.facebook && (
                        <a href={member.facebook} target="_blank" rel="noreferrer"
                          className="w-8 h-8 rounded-xl flex items-center justify-center text-sm transition-all hover:-translate-y-0.5 hover:shadow-md"
                          style={{ background: 'rgba(59,130,246,0.1)', color: '#3B82F6' }}>
                          <i className="fab fa-facebook-f text-xs" />
                        </a>
                      )}
                      {member.twitter && (
                        <a href={member.twitter} target="_blank" rel="noreferrer"
                          className="w-8 h-8 rounded-xl flex items-center justify-center text-sm transition-all hover:-translate-y-0.5 hover:shadow-md"
                          style={{ background: 'rgba(14,165,233,0.1)', color: '#0EA5E9' }}>
                          <i className="fab fa-twitter text-xs" />
                        </a>
                      )}
                      {member.linkedin && (
                        <a href={member.linkedin} target="_blank" rel="noreferrer"
                          className="w-8 h-8 rounded-xl flex items-center justify-center text-sm transition-all hover:-translate-y-0.5 hover:shadow-md"
                          style={{ background: 'rgba(10,102,194,0.1)', color: '#0A66C2' }}>
                          <i className="fab fa-linkedin-in text-xs" />
                        </a>
                      )}
                      {member.email && (
                        <a href={`mailto:${member.email}`}
                          className="w-8 h-8 rounded-xl flex items-center justify-center text-sm transition-all hover:-translate-y-0.5 hover:shadow-md"
                          style={{ background: 'rgba(240,165,0,0.1)', color: '#B8830A' }}>
                          <Mail className="w-3.5 h-3.5" />
                        </a>
                      )}
                    </div>
                  )}

                  {/* Email CTA */}
                  {member.email && (
                    <a href={`mailto:${member.email}`}
                      className="flex items-center justify-center gap-2 w-full py-2.5 rounded-2xl text-sm font-semibold transition-all hover:-translate-y-0.5 hover:shadow-md"
                      style={{ background: 'linear-gradient(135deg,#F0A500,#FFB84D)', color: '#fff', fontFamily: 'Sora,sans-serif' }}>
                      <Mail className="w-4 h-4" />
                      Contact {member.name.split(' ')[0]}
                    </a>
                  )}
                </div>
              </div>

              {/* Info pills */}
              <div className="bg-white rounded-3xl p-5 space-y-3" style={{ boxShadow: '0 2px 12px rgba(91,45,142,0.06)' }}>
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0"
                    style={{ background: tm.bg }}>
                    <tm.Icon className="w-4 h-4" style={{ color: tm.color }} />
                  </div>
                  <div>
                    <div className="text-[10px] uppercase tracking-wider text-muted-foreground font-semibold">Department</div>
                    <div className="text-sm font-semibold" style={{ color: '#1A0A35' }}>{tm.label}</div>
                  </div>
                </div>
                <div className="h-px" style={{ background: 'rgba(91,45,142,0.06)' }} />
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0"
                    style={{ background: 'rgba(91,45,142,0.07)' }}>
                    <Briefcase className="w-4 h-4" style={{ color: '#5B2D8E' }} />
                  </div>
                  <div>
                    <div className="text-[10px] uppercase tracking-wider text-muted-foreground font-semibold">Role</div>
                    <div className="text-sm font-semibold" style={{ color: '#1A0A35' }}>{member.roleTitle}</div>
                  </div>
                </div>
                <div className="h-px" style={{ background: 'rgba(91,45,142,0.06)' }} />
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0"
                    style={{ background: 'rgba(240,165,0,0.1)' }}>
                    <MapPin className="w-4 h-4 text-gold" />
                  </div>
                  <div>
                    <div className="text-[10px] uppercase tracking-wider text-muted-foreground font-semibold">Location</div>
                    <div className="text-sm font-semibold" style={{ color: '#1A0A35' }}>West Region, Cameroon</div>
                  </div>
                </div>
              </div>
            </div>

            {/* ── Right: Bio + content ── */}
            <div className="lg:col-span-2 space-y-5">

              {/* About card */}
              <div className="bg-white rounded-3xl p-7" style={{ boxShadow: '0 2px 12px rgba(91,45,142,0.06)' }}>
                <h2 className="font-display font-bold text-lg mb-4" style={{ color: '#1A0A35' }}>About</h2>
                {member.bio ? (
                  <p className="text-sm leading-relaxed" style={{ color: '#555', fontFamily: 'Poppins,sans-serif' }}>
                    {member.bio}
                  </p>
                ) : (
                  <p className="text-sm" style={{ color: 'rgba(91,45,142,0.35)', fontFamily: 'Poppins,sans-serif' }}>
                    No bio available yet for this team member.
                  </p>
                )}
              </div>

              {/* Contribution card */}
              <div className="bg-white rounded-3xl p-7" style={{ boxShadow: '0 2px 12px rgba(91,45,142,0.06)' }}>
                <h2 className="font-display font-bold text-lg mb-4" style={{ color: '#1A0A35' }}>Contribution Areas</h2>
                <div className="flex flex-wrap gap-2">
                  {[tm.label, 'Community Development', 'Nkenkak-Ngiesang'].map(tag => (
                    <span key={tag} className="text-xs font-semibold px-3 py-1.5 rounded-full"
                      style={{ background: 'rgba(91,45,142,0.06)', color: '#5B2D8E', fontFamily: 'Sora,sans-serif' }}>
                      {tag}
                    </span>
                  ))}
                </div>
              </div>

              {/* Join this team CTA */}
              <div className="rounded-3xl p-7 relative overflow-hidden"
                style={{ background: 'linear-gradient(135deg,#250F47,#5B2D8E)' }}>
                <div className="wave-pattern absolute inset-0 opacity-50" />
                <div className="relative flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div>
                    <div className="text-[11px] font-bold uppercase tracking-widest mb-1"
                      style={{ color: 'rgba(240,165,0,0.8)' }}>Get Involved</div>
                    <h3 className="font-display font-bold text-lg text-white">Join the {tm.label}</h3>
                    <p className="text-xs mt-1" style={{ color: 'rgba(255,255,255,0.55)', fontFamily: 'Poppins,sans-serif' }}>
                      Your skills and passion can drive real change.
                    </p>
                  </div>
                  <button onClick={() => setJoinOpen(true)}
                    className="flex items-center gap-2 px-5 py-2.5 rounded-2xl text-sm font-semibold flex-shrink-0 transition-all hover:-translate-y-0.5 hover:shadow-lg"
                    style={{ background: 'linear-gradient(135deg,#F0A500,#FFB84D)', color: '#fff', fontFamily: 'Sora,sans-serif' }}>
                    <UserPlus className="w-4 h-4" />Apply to Join
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Teammates */}
          {teammates?.length > 0 && (
            <div className="mb-10">
              <div className="flex items-center justify-between mb-6">
                <h2 className="font-display font-bold text-xl" style={{ color: '#1A0A35' }}>
                  Other {tm.label} Members
                </h2>
                <Link to="/team"
                  className="text-sm font-semibold flex items-center gap-1.5 transition-all hover:opacity-70 hover:gap-2"
                  style={{ color: '#5B2D8E', fontFamily: 'Sora,sans-serif' }}>
                  View All <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
                {teammates.map((t, i) => <TeamCard key={t.id} member={t} index={i} />)}
              </div>
            </div>
          )}

        </div>
      </section>

      {joinOpen && <JoinTeamModal onClose={() => setJoinOpen(false)} defaultTeam={member.team} />}
    </div>
  )
}
