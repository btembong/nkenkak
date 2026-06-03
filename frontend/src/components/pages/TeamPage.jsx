import { useState, useMemo } from 'react'
import { Link } from 'react-router-dom'
import { useQuery } from 'react-query'
import api from '../../services/api'
import TeamCard from '../common/TeamCard'
import JoinTeamModal from '../common/JoinTeamModal'
import {
  Home, ChevronRight, Users, CheckCircle2, Handshake, Sprout,
  GraduationCap, HardHat, Drama, Rocket, Leaf, HeartPulse,
  UserPlus, Crown, Globe, FolderKanban, ArrowRight, Mail,
} from 'lucide-react'

const TEAMS = ['all', 'leadership', 'development', 'culture', 'youth', 'health', 'environment']

const JOIN_TEAMS = [
  { id: 'development', Icon: HardHat,       label: 'Development',      desc: 'Build & Infrastructure' },
  { id: 'culture',     Icon: Drama,         label: 'Cultural Council', desc: 'Heritage & Traditions' },
  { id: 'youth',       Icon: Rocket,        label: 'Youth Wing',       desc: 'Innovation & Energy' },
  { id: 'environment', Icon: Leaf,          label: 'Environment',      desc: 'Nature & Sustainability' },
  { id: 'education',   Icon: GraduationCap, label: 'Education',        desc: 'Schools & Learning' },
  { id: 'health',      Icon: HeartPulse,    label: 'Health',           desc: 'Care & Wellness' },
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

function leaderInitials(name) {
  return name.split(' ').map(w => w[0]).filter(Boolean).slice(0, 2).join('').toUpperCase()
}

/* ─── Leadership spotlight card ─── */
function LeaderCard({ member: m, index = 0 }) {
  const GRADS = [
    'linear-gradient(135deg,#92600A,#C88A1A)',
    'linear-gradient(135deg,#250F47,#5B2D8E)',
    'linear-gradient(135deg,#3D1A6B,#7B4DB8)',
  ]
  return (
    <Link to={`/team/${m.id}`} className="group block focus:outline-none">
      <div
        className="relative overflow-hidden rounded-3xl transition-all duration-300 group-hover:-translate-y-2 group-hover:shadow-[0_24px_56px_rgba(91,45,142,0.25)]"
        style={{ boxShadow: '0 4px 20px rgba(91,45,142,0.12)' }}
      >
        {/* Gold top accent */}
        <div className="absolute top-0 inset-x-0 h-1 z-20 rounded-t-3xl"
          style={{ background: 'linear-gradient(90deg,#F0A500,#FFD166)' }} />

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
              style={{ background: 'rgba(240,165,0,0.2)', color: '#F0A500', border: '1px solid rgba(240,165,0,0.3)' }}>
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

  const leadership = useMemo(() => data?.filter(m => m.team === 'leadership') || [], [data])
  const filtered   = useMemo(
    () => filter === 'all' ? data || [] : (data || []).filter(m => m.team === filter),
    [data, filter]
  )
  const showLeadershipSpotlight = filter === 'all' && leadership.length > 0

  const STATS = [
    { Icon: Users,         label: 'Members',     value: data?.length || '—' },
    { Icon: FolderKanban,  label: 'Departments', value: Object.keys(countByTeam).length || 7 },
    { Icon: Globe,         label: 'Countries',   value: 3 },
    { Icon: Handshake,     label: 'Est.',         value: '2010' },
  ]

  return (
    <div>
      {/* Hero */}
      <div className="page-hero py-20 px-6 text-center">
        <div className="eyebrow justify-center mb-3" style={{ color: 'rgba(240,165,0,0.9)' }}>
          <span className="w-5 h-0.5 rounded-full inline-block mr-2" style={{ background: '#F0A500' }} />
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
      <div style={{ background: 'linear-gradient(135deg,#1A0A35,#250F47)' }}>
        <div className="max-w-6xl mx-auto px-6 py-5 grid grid-cols-2 md:grid-cols-4 divide-x divide-white/10">
          {STATS.map(({ Icon, label, value }) => (
            <div key={label} className="flex items-center gap-3 px-6 first:pl-0 last:pr-0">
              <div className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0"
                style={{ background: 'rgba(240,165,0,0.12)' }}>
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

      <section className="py-16" style={{ background: '#FAFAFA' }}>
        <div className="max-w-6xl mx-auto px-6">

          {/* Leadership spotlight */}
          {showLeadershipSpotlight && (
            <div className="mb-14">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-8 h-8 rounded-xl flex items-center justify-center"
                  style={{ background: 'rgba(240,165,0,0.12)' }}>
                  <Crown className="w-4 h-4 text-gold" />
                </div>
                <h2 className="font-display font-bold text-xl" style={{ color: '#1A0A35' }}>Leadership Council</h2>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
                {leadership.map((m, i) => <LeaderCard key={m.id} member={m} index={i} />)}
              </div>
            </div>
          )}

          {/* Filter tabs */}
          <div className="flex flex-wrap gap-2 justify-center mb-10">
            {TEAMS.map(t => {
              const count = t === 'all' ? data?.length || 0 : countByTeam[t] || 0
              const active = filter === t
              return (
                <button key={t} onClick={() => setFilter(t)}
                  className="px-4 py-2 rounded-full text-sm font-semibold transition-all capitalize flex items-center gap-1.5"
                  style={{
                    background: active ? 'linear-gradient(135deg,#5B2D8E,#7B4DB8)' : '#fff',
                    color: active ? '#fff' : '#5B2D8E',
                    fontFamily: 'Sora,sans-serif',
                    boxShadow: active ? '0 4px 16px rgba(91,45,142,0.35)' : '0 2px 8px rgba(91,45,142,0.07)',
                    borderColor: active ? 'transparent' : 'rgba(91,45,142,0.08)',
                    border: '1px solid',
                  }}>
                  {t === 'all' ? 'All Members' : t}
                  {count > 0 && (
                    <span className="text-[10px] px-1.5 py-0.5 rounded-full font-bold"
                      style={{
                        background: active ? 'rgba(255,255,255,0.2)' : 'rgba(91,45,142,0.08)',
                        color: active ? 'rgba(255,255,255,0.9)' : '#7B4DB8',
                      }}>
                      {count}
                    </span>
                  )}
                </button>
              )
            })}
          </div>

          {/* Grid */}
          {isLoading ? (
            <div className="grid grid-cols-2 md:grid-cols-3 gap-6 mb-16">
              {[1, 2, 3, 4, 5, 6].map(i => (
                <div key={i} className="h-72 rounded-3xl animate-pulse" style={{ background: 'rgba(91,45,142,0.05)' }} />
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 gap-6 mb-16">
              {filtered
                .filter(m => filter === 'all' ? m.team !== 'leadership' : true)
                .map((m, i) => <TeamCard key={m.id} member={m} index={i} />)}
              {filtered.filter(m => filter === 'all' ? m.team !== 'leadership' : true).length === 0 && (
                <div className="col-span-3 text-center py-16">
                  <Users className="w-12 h-12 mx-auto mb-4" style={{ color: 'rgba(91,45,142,0.15)' }} />
                  <p className="text-sm text-muted-foreground">No team members in this category yet.</p>
                </div>
              )}
            </div>
          )}

          {/* Why us */}
          <div className="grid lg:grid-cols-2 gap-12 items-center mb-16 py-16 border-y"
            style={{ borderColor: 'rgba(91,45,142,0.08)' }}>
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
                      style={{ background: 'rgba(240,165,0,0.12)' }}>
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
                { n: data?.length || '24+', l: 'Active Members',  sub: 'Village & diaspora', Icon: Users,        bg: 'linear-gradient(135deg,#250F47,#5B2D8E)' },
                { n: Object.keys(countByTeam).length || 7,         l: 'Departments',          sub: 'Specialised teams', Icon: FolderKanban, bg: 'linear-gradient(135deg,#3D1A6B,#7B4DB8)' },
                { n: '12+',   l: 'Projects',          sub: 'Completed & ongoing', Icon: HardHat,      bg: 'linear-gradient(135deg,#1A3A20,#2D5016)' },
                { n: 3,       l: 'Countries',         sub: 'Where our team lives', Icon: Globe,        bg: 'linear-gradient(135deg,#5B2D8E,#9B6FD8)' },
              ].map(({ n, l, sub, Icon, bg }, i) => (
                <div key={i} className="rounded-3xl p-6 flex flex-col gap-3"
                  style={{ background: bg, boxShadow: '0 4px 20px rgba(91,45,142,0.15)' }}>
                  <Icon className="w-6 h-6" style={{ color: 'rgba(240,165,0,0.6)' }} />
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
            style={{ background: 'linear-gradient(135deg,#250F47,#5B2D8E)' }}>
            <div className="wave-pattern absolute inset-0" />
            <div className="relative">
              <div className="eyebrow justify-center mb-4" style={{ color: 'rgba(240,165,0,0.8)' }}>
                <span className="w-5 h-0.5 rounded-full inline-block mr-2" style={{ background: '#F0A500' }} />
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
                    <t.Icon className="w-3.5 h-3.5" style={{ color: '#F0A500' }} />
                    {t.label}
                    {countByTeam[t.id] ? (
                      <span className="text-[10px] px-1.5 py-0.5 rounded-full font-bold"
                        style={{ background: 'rgba(240,165,0,0.15)', color: '#F0A500' }}>
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
