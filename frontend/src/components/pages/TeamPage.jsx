import { useState, useMemo } from 'react'
import { Link } from 'react-router-dom'
import { useQuery } from 'react-query'
import api from '../../services/api'
import TeamCard from '../common/TeamCard'
import JoinTeamModal from '../common/JoinTeamModal'
import {
  Home, ChevronRight, Users, CheckCircle2, Handshake, Sprout,
  GraduationCap, HardHat, Drama, Rocket, Leaf, HeartPulse,
  UserPlus, Crown, Globe, FolderKanban, ArrowRight, Mail, LayoutGrid, Heart,
} from 'lucide-react'

const CORE_TEAMS = ['all', 'leadership', 'development', 'culture', 'youth', 'health', 'environment', 'education']
const VOLUNTEER_TEAM = 'volunteer'

const JOIN_TEAMS = [
  { id: 'development', Icon: HardHat,       label: 'Development',      desc: 'Build & Infrastructure' },
  { id: 'culture',     Icon: Drama,         label: 'Cultural Council', desc: 'Heritage & Traditions' },
  { id: 'youth',       Icon: Rocket,        label: 'Youth Wing',       desc: 'Innovation & Energy' },
  { id: 'environment', Icon: Leaf,          label: 'Environment',      desc: 'Nature & Sustainability' },
  { id: 'education',   Icon: GraduationCap, label: 'Education',        desc: 'Schools & Learning' },
  { id: 'health',      Icon: HeartPulse,    label: 'Health',           desc: 'Care & Wellness' },
]

const TEAM_ICONS = {
  all:         LayoutGrid,
  leadership:  Crown,
  development: HardHat,
  culture:     Drama,
  youth:       Rocket,
  health:      HeartPulse,
  environment: Leaf,
  education:   GraduationCap,
}

const TEAM_ACCENT = {
  leadership:  '#a57fc0',
  development: '#4b0082',
  culture:     '#430075',
  youth:       '#2d004e',
  health:      '#4b0082',
  environment: '#a57fc0',
  education:   '#430075',
}

function leaderInitials(name) {
  return name.split(' ').map(w => w[0]).filter(Boolean).slice(0, 2).join('').toUpperCase()
}

/* ─── Leadership spotlight card ─── */
function LeaderCard({ member: m, index = 0 }) {
  const GRADS = [
    'linear-gradient(135deg,#2d004e,#4b0082)',
    'linear-gradient(135deg,#430075,#4b0082)',
    'linear-gradient(135deg,#4b0082,#a57fc0)',
  ]
  return (
    <Link to={`/team/${m.id}`} className="group block focus:outline-none">
      <div
        className="relative overflow-hidden rounded-3xl transition-all duration-300 group-hover:-translate-y-2 group-hover:shadow-[0_24px_56px_rgba(75,0,130,0.25)]"
        style={{ boxShadow: '0 4px 20px rgba(75,0,130,0.12)' }}
      >
        {/* Gold top accent */}
        <div className="absolute top-0 inset-x-0 h-1 z-20 rounded-t-3xl"
          style={{ background: 'linear-gradient(90deg,#4b0082,#a57fc0)' }} />

        <div className="relative h-80 overflow-hidden flex items-center justify-center"
          style={{ background: GRADS[index % GRADS.length] }}>
          {m.avatarUrl ? (
            <img src={m.avatarUrl} alt={m.name}
              className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" />
          ) : (
            <div
              className="w-24 h-24 rounded-2xl flex items-center justify-center font-display font-bold text-3xl text-white select-none shadow-xl"
              style={{
                background: 'rgba(255,255,255,0.14)',
                backdropFilter: 'blur(10px)',
                border: '1.5px solid rgba(255,255,255,0.28)',
              }}
            >
              {leaderInitials(m.name)}
            </div>
          )}

          <div className="absolute inset-x-0 bottom-0 h-40 pointer-events-none"
            style={{ background: 'linear-gradient(to top,rgba(20,8,45,0.97) 0%,rgba(20,8,45,0.3) 70%,transparent 100%)' }} />

          {/* Crown badge */}
          <div className="absolute top-4 left-4 z-10">
            <span className="flex items-center gap-1.5 text-[9px] font-bold uppercase tracking-widest px-2.5 py-1 rounded-full"
              style={{ background: 'rgba(75,0,130,0.15)', color: '#a57fc0', border: '1px solid rgba(75,0,130,0.25)' }}>
              <Crown className="w-2.5 h-2.5" /> Leadership
            </span>
          </div>

          {/* Social — hover */}
          {(m.facebook || m.twitter || m.linkedin || m.email) && (
            <div className="absolute top-4 right-3 z-10 flex flex-col gap-1.5 opacity-0 group-hover:opacity-100 translate-x-3 group-hover:translate-x-0 transition-all duration-300">
              {m.facebook && (
                <a href={m.facebook} target="_blank" rel="noreferrer" onClick={e => e.stopPropagation()}
                  className="w-7 h-7 rounded-full flex items-center justify-center text-white text-xs bg-black/40 backdrop-blur-sm hover:bg-blue-600 transition-colors">
                  <i className="fab fa-facebook-f" />
                </a>
              )}
              {m.email && (
                <a href={`mailto:${m.email}`} onClick={e => e.stopPropagation()}
                  className="w-7 h-7 rounded-full flex items-center justify-center text-white text-xs bg-black/40 backdrop-blur-sm hover:bg-amber-500 transition-colors">
                  <Mail className="w-3.5 h-3.5" />
                </a>
              )}
            </div>
          )}

          <div className="absolute inset-x-0 bottom-0 px-5 pb-5 pt-10 z-10">
            <h3 className="font-display font-bold text-lg text-white leading-snug">{m.name}</h3>
            <div className="flex items-center justify-between mt-1">
              <p className="text-sm font-medium text-gold">{m.roleTitle}</p>
              <span className="flex items-center gap-1 text-[11px] font-semibold text-white/55 opacity-0 group-hover:opacity-100 transition-opacity">
                Profile <ArrowRight className="w-3 h-3" />
              </span>
            </div>
          </div>
        </div>
      </div>
    </Link>
  )
}

export default function TeamPage() {
  const [filter,   setFilter]   = useState('all')
  const [joinOpen, setJoinOpen] = useState(false)
  const [joinTeam, setJoinTeam] = useState('')

  const { data, isLoading } = useQuery('team', () => api.get('/team').then(r => r.data))

  const countByTeam = useMemo(() => {
    if (!data) return {}
    return data.reduce((acc, m) => ({ ...acc, [m.team]: (acc[m.team] || 0) + 1 }), {})
  }, [data])

  const leadership  = useMemo(() => data?.filter(m => m.team === 'leadership')   || [], [data])
  const volunteers  = useMemo(() => data?.filter(m => m.team === VOLUNTEER_TEAM) || [], [data])
  const coreMembers = useMemo(() => data?.filter(m => m.team !== 'leadership' && m.team !== VOLUNTEER_TEAM) || [], [data])

  const filtered = useMemo(() => {
    const pool = filter === 'all' ? coreMembers : (data || []).filter(m => m.team === filter)
    return pool
  }, [data, coreMembers, filter])

  const showLeadershipSpotlight = filter === 'all' && leadership.length > 0
  const activeTeams = CORE_TEAMS.filter(t => t === 'all' || (countByTeam[t] || 0) > 0)

  const STATS = [
    { Icon: Crown,         label: 'Leaders',      value: leadership.length  || '—' },
    { Icon: Users,         label: 'Team Members', value: coreMembers.length || '—' },
    { Icon: Heart,         label: 'Volunteers',   value: volunteers.length  || '—' },
    { Icon: Handshake,     label: 'Est.',          value: '2010' },
  ]

  return (
    <div>
      {/* Hero */}
      <div className="page-hero py-20 px-6 text-center">
        <div className="eyebrow justify-center mb-3" style={{ color: '#a57fc0' }}>
          <span className="w-5 h-0.5 rounded-full inline-block mr-2" style={{ background: '#a57fc0' }} />
          Our Team
        </div>
        <h1 className="font-display font-bold text-4xl text-white mb-3">Village Leaders & Team</h1>
        <div className="flex items-center justify-center gap-2 text-sm text-white/60">
          <Link to="/" className="hover:text-white transition-colors flex items-center gap-1">
            <Home className="w-3 h-3" />Home
          </Link>
          <ChevronRight className="w-3 h-3 text-gold" />
          <span className="text-gold">Team</span>
        </div>
      </div>

      {/* Stats bar */}
      <div style={{ background: 'linear-gradient(135deg,#2d004e,#430075)' }}>
        <div className="max-w-6xl mx-auto px-6 py-5 grid grid-cols-2 md:grid-cols-4 divide-x divide-white/10">
          {STATS.map(({ Icon, label, value }) => (
            <div key={label} className="flex items-center gap-3 px-6 first:pl-0 last:pr-0">
              <div className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0"
                style={{ background: 'rgba(75,0,130,0.10)' }}>
                <Icon className="w-4 h-4 text-gold" />
              </div>
              <div>
                <div className="font-display font-bold text-xl text-white leading-none">{value}</div>
                <div className="text-[11px] text-white/45 mt-0.5" style={{ fontFamily: 'Poppins,sans-serif' }}>{label}</div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <section className="py-16" style={{ background: '#F3EDF8' }}>
        <div className="max-w-6xl mx-auto px-6">

          {/* Leadership spotlight */}
          {showLeadershipSpotlight && (
            <div className="mb-14">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-8 h-8 rounded-xl flex items-center justify-center"
                  style={{ background: 'rgba(75,0,130,0.10)' }}>
                  <Crown className="w-4 h-4 text-gold" />
                </div>
                <h2 className="font-display font-bold text-xl" style={{ color: '#2d004e' }}>Leadership Council</h2>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
                {leadership.map((m, i) => <LeaderCard key={m.id} member={m} index={i} />)}
              </div>
            </div>
          )}

          {/* ── Department filter bar ── */}
          <div className="bg-white rounded-2xl p-5 mb-8" style={{ boxShadow: '0 1px 10px rgba(75,0,130,0.08)', border: '1px solid rgba(75,0,130,0.08)' }}>
            <div className="flex items-center justify-between pb-4 mb-4 border-b" style={{ borderColor: 'rgba(75,0,130,0.07)' }}>
              <div>
                <h2 className="font-display font-bold text-sm text-dark">Department Teams</h2>
                <p className="text-[11px] mt-0.5" style={{ color: 'rgba(75,0,130,0.45)' }}>Filter by department</p>
              </div>
              {!isLoading && (
                <span className="text-[11px] font-bold px-3 py-1 rounded-full flex-shrink-0"
                  style={{ background: 'rgba(75,0,130,0.07)', color: '#4b0082' }}>
                  {filtered.length} member{filtered.length !== 1 ? 's' : ''}
                </span>
              )}
            </div>
            <div className="relative">
              <div className="overflow-x-auto" style={{ scrollbarWidth: 'none' }}>
                <div className="flex items-center p-1 rounded-2xl w-max"
                  style={{ background: 'rgba(75,0,130,0.06)', border: '1px solid rgba(75,0,130,0.09)' }}>
                  {activeTeams.flatMap((t, i) => {
                    const Icon   = TEAM_ICONS[t]
                    const count  = t === 'all' ? coreMembers.length : (countByTeam[t] || 0)
                    const active = filter === t
                    const prevActive = i > 0 && filter === activeTeams[i - 1]
                    const sep = i > 0 && !active && !prevActive
                      ? [<div key={`sep-${t}`} className="w-px h-4 flex-shrink-0" style={{ background: 'rgba(75,0,130,0.13)' }}/>]
                      : []
                    return [...sep, (
                      <button key={t} onClick={() => setFilter(t)}
                        className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold transition-all capitalize flex-shrink-0 whitespace-nowrap"
                        style={{
                          background: active ? 'linear-gradient(135deg,#4b0082,#a57fc0)' : 'transparent',
                          color:      active ? '#fff' : '#A3A3A3',
                          boxShadow:  active ? '0 2px 10px rgba(75,0,130,0.28)' : 'none',
                        }}>
                        {Icon && <Icon className="w-3.5 h-3.5" style={{ opacity: active ? 1 : 0.6 }}/>}
                        {t === 'all' ? 'All Departments' : t}
                        {count > 0 && (
                          <span className="text-[9px] font-bold px-1.5 py-0.5 rounded-full leading-none"
                            style={{
                              background: active ? 'rgba(255,255,255,0.22)' : 'rgba(75,0,130,0.08)',
                              color: active ? 'rgba(255,255,255,0.95)' : '#a57fc0',
                            }}>
                            {count}
                          </span>
                        )}
                      </button>
                    )]
                  })}
                </div>
              </div>
              <div className="absolute right-0 top-0 bottom-0 w-8 pointer-events-none rounded-r-2xl"
                style={{ background: 'linear-gradient(to right, transparent, rgba(255,255,255,0.9))' }}/>
            </div>
          </div>

          {/* ── Department members grid ── */}
          {isLoading ? (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5 mb-16">
              {[1,2,3,4,5,6,7,8].map(i => (
                <div key={i} className="rounded-3xl animate-pulse" style={{ height: 300, background: 'rgba(75,0,130,0.05)' }}/>
              ))}
            </div>
          ) : filtered.length > 0 ? (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5 mb-16">
              {filtered.map((m, i) => <TeamCard key={m.id} member={m} index={i}/>)}
            </div>
          ) : (
            <div className="text-center py-16 mb-16 rounded-3xl" style={{ background: 'rgba(75,0,130,0.03)', border: '1px dashed rgba(75,0,130,0.1)' }}>
              <Users className="w-12 h-12 mx-auto mb-4" style={{ color: 'rgba(75,0,130,0.15)' }}/>
              <p className="text-sm text-muted-foreground">No team members in this department yet.</p>
            </div>
          )}

          {/* ── Volunteer Contributors section ── */}
          {(volunteers.length > 0 || isLoading) && filter === 'all' && (
            <div className="mb-16">
              {/* Section header */}
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-xl flex items-center justify-center"
                    style={{ background: 'rgba(75,0,130,0.10)' }}>
                    <Heart className="w-4 h-4 text-gold"/>
                  </div>
                  <div>
                    <h2 className="font-display font-bold text-xl text-dark">Volunteer Contributors</h2>
                    <p className="text-xs text-muted-foreground mt-0.5">Community members giving their time and skills</p>
                  </div>
                </div>
                {!isLoading && (
                  <span className="text-[11px] font-bold px-3 py-1 rounded-full"
                    style={{ background: 'rgba(75,0,130,0.07)', color: '#4b0082' }}>
                    {volunteers.length} volunteer{volunteers.length !== 1 ? 's' : ''}
                  </span>
                )}
              </div>

              {/* Divider with label */}
              <div className="flex items-center gap-3 mb-5">
                <div className="flex-1 h-px" style={{ background: 'rgba(75,0,130,0.08)' }}/>
                <span className="text-[10px] font-bold uppercase tracking-widest px-3 py-1 rounded-full"
                  style={{ background: 'rgba(75,0,130,0.06)', color: '#a57fc0' }}>
                  Community Volunteers
                </span>
                <div className="flex-1 h-px" style={{ background: 'rgba(75,0,130,0.08)' }}/>
              </div>

              {isLoading ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                  {[1,2,3,4,5,6].map(i => (
                    <div key={i} className="h-20 rounded-2xl animate-pulse" style={{ background: 'rgba(75,0,130,0.05)' }}/>
                  ))}
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                  {volunteers.map(m => <TeamCard key={m.id} member={m} compact/>)}
                </div>
              )}
            </div>
          )}

          {/* Why us */}
          <div className="grid lg:grid-cols-2 gap-12 items-center mb-16 py-16 border-y"
            style={{ borderColor: 'rgba(75,0,130,0.08)' }}>
            <div>
              <div className="eyebrow mb-3">Why Choose Us</div>
              <h2 className="section-title mb-4">A Community Team<br /><span>Built on Trust</span></h2>
              <p className="text-sm leading-relaxed mb-6 text-muted-foreground">
                Our dedicated team brings expertise from across Cameroon and the diaspora, working transparently to deliver real change in Nkenkak-Ngiesang.
              </p>
              <div className="space-y-4">
                {[
                  { t: '100% Transparent Funding', d: 'Every XAF tracked and reported publicly' },
                  { t: 'Community-Led Decisions',   d: 'Members vote on all major project proposals' },
                  { t: 'Expert Local Knowledge',    d: 'Teams drawn from village and diaspora expertise' },
                ].map(f => (
                  <div key={f.t} className="flex items-start gap-3">
                    <div className="w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5"
                      style={{ background: 'rgba(75,0,130,0.10)' }}>
                      <CheckCircle2 className="w-3.5 h-3.5 text-gold" />
                    </div>
                    <div>
                      <div className="font-display font-semibold text-sm text-dark">{f.t}</div>
                      <div className="text-xs text-muted-foreground mt-0.5">{f.d}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Stat grid replaces icon placeholders */}
            <div className="grid grid-cols-2 gap-4">
              {[
                { n: leadership.length  || '4+',  l: 'Leaders',       sub: 'Council & executives',    Icon: Crown,        bg: 'linear-gradient(135deg,#2d004e,#4b0082)' },
                { n: coreMembers.length || '20+', l: 'Team Members',  sub: 'Across all departments',  Icon: Users,        bg: 'linear-gradient(135deg,#430075,#a57fc0)' },
                { n: volunteers.length  || '10+', l: 'Volunteers',    sub: 'Community contributors',  Icon: Heart,        bg: 'linear-gradient(135deg,#052e16,#16a34a)' },
                { n: 3,                           l: 'Countries',     sub: 'Where our team lives',    Icon: Globe,        bg: 'linear-gradient(135deg,#4b0082,#a57fc0)' },
              ].map(({ n, l, sub, Icon, bg }, i) => (
                <div key={i} className="rounded-3xl p-6 flex flex-col gap-3"
                  style={{ background: bg, boxShadow: '0 4px 20px rgba(75,0,130,0.15)' }}>
                  <Icon className="w-6 h-6" style={{ color: 'rgba(75,0,130,0.50)' }} />
                  <div>
                    <div className="font-display font-bold text-3xl text-white leading-none">{n}</div>
                    <div className="font-semibold text-sm text-white/80 mt-1" style={{ fontFamily: 'Sora,sans-serif' }}>{l}</div>
                    <div className="text-[11px] text-white/45 mt-0.5" style={{ fontFamily: 'Poppins,sans-serif' }}>{sub}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Join CTA */}
          <div className="rounded-3xl p-10 relative overflow-hidden text-center"
            style={{ background: 'linear-gradient(135deg,#430075,#4b0082)' }}>
            <div className="wave-pattern absolute inset-0" />
            <div className="relative">
              <div className="eyebrow justify-center mb-4" style={{ color: '#a57fc0' }}>
                <span className="w-5 h-0.5 rounded-full inline-block mr-2" style={{ background: '#a57fc0' }} />
                Get Involved
              </div>
              <h3 className="font-display font-bold text-2xl text-white mb-3">Join Our Community Team</h3>
              <p className="text-sm mb-8 max-w-md mx-auto" style={{ color: 'rgba(255,255,255,0.65)', fontFamily: 'Poppins,sans-serif' }}>
                Whether in the village or diaspora, your skills make a difference. Pick a department below.
              </p>
              <div className="flex flex-wrap gap-2.5 justify-center mb-8">
                {JOIN_TEAMS.map(t => (
                  <button key={t.id} onClick={() => { setJoinTeam(t.id); setJoinOpen(true) }}
                    className="flex items-center gap-2 px-4 py-2.5 rounded-full text-xs font-semibold transition-all hover:-translate-y-0.5 hover:shadow-lg"
                    style={{
                      background: 'rgba(255,255,255,0.08)',
                      color: 'rgba(255,255,255,0.85)',
                      border: '1px solid rgba(255,255,255,0.12)',
                      fontFamily: 'Sora,sans-serif',
                    }}>
                    <t.Icon className="w-3.5 h-3.5" style={{ color: '#a57fc0' }} />
                    {t.label}
                    {countByTeam[t.id] ? (
                      <span className="text-[10px] px-1.5 py-0.5 rounded-full font-bold"
                        style={{ background: 'rgba(75,0,130,0.10)', color: '#a57fc0' }}>
                        {countByTeam[t.id]}
                      </span>
                    ) : null}
                  </button>
                ))}
              </div>
              <button onClick={() => { setJoinTeam(''); setJoinOpen(true) }} className="btn-gold">
                <UserPlus className="w-4 h-4" />Apply to Join
              </button>
            </div>
          </div>

        </div>
      </section>

      {joinOpen && <JoinTeamModal onClose={() => setJoinOpen(false)} defaultTeam={joinTeam} />}
    </div>
  )
}
