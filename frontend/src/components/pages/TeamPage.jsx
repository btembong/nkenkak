import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useQuery } from 'react-query'
import api from '../../services/api'
import TeamCard from '../common/TeamCard'
import JoinTeamModal from '../common/JoinTeamModal'
import {
  Home, ChevronRight, Users, CheckCircle2, Handshake, Sprout, GraduationCap,
  HardHat, Drama, Rocket, Leaf, HeartPulse, UserPlus,
} from 'lucide-react'

const TEAMS = ['all','leadership','development','culture','youth','health','environment']
const JOIN_TEAMS = [
  {id:'development', Icon:HardHat,       l:'Development',      d:'Build & Infrastructure'},
  {id:'culture',     Icon:Drama,         l:'Cultural Council', d:'Heritage & Traditions'},
  {id:'youth',       Icon:Rocket,        l:'Youth Wing',       d:'Innovation & Energy'},
  {id:'environment', Icon:Leaf,          l:'Environment',      d:'Nature & Sustainability'},
  {id:'education',   Icon:GraduationCap, l:'Education',        d:'Schools & Learning'},
  {id:'health',      Icon:HeartPulse,    l:'Health',           d:'Care & Wellness'},
]

const ICON_PLACEHOLDERS = [
  {Icon:Users,        bg:'linear-gradient(135deg,#250F47,#5B2D8E)', h:'h-44'},
  {Icon:Handshake,    bg:'linear-gradient(135deg,#3D1A6B,#7B4DB8)', h:'h-36 mt-8'},
  {Icon:Sprout,       bg:'linear-gradient(135deg,#5B2D8E,#9B6FD8)', h:'h-36'},
  {Icon:GraduationCap,bg:'linear-gradient(135deg,#1A0A35,#3D1A6B)', h:'h-44'},
]

export default function TeamPage() {
  const [filter,   setFilter]   = useState('all')
  const [joinOpen, setJoinOpen] = useState(false)
  const [joinTeam, setJoinTeam] = useState('')
  const { data, isLoading } = useQuery('team', () => api.get('/team').then(r => r.data))
  const filtered = data?.filter(m => filter==='all' || m.team===filter)

  return (
    <div>
      {/* Hero */}
      <div className="page-hero py-20 px-6 text-center">
        <div className="eyebrow justify-center mb-3" style={{color:'rgba(240,165,0,0.9)'}}>
          <span className="w-5 h-0.5 rounded-full inline-block mr-2" style={{background:'#F0A500'}}/>Our Team
        </div>
        <h1 className="font-display font-bold text-4xl text-white mb-3">Village Leaders & Team</h1>
        <div className="flex items-center justify-center gap-2 text-sm text-white/60">
          <Link to="/" className="hover:text-white transition-colors flex items-center gap-1"><Home className="w-3 h-3"/>Home</Link>
          <ChevronRight className="w-3 h-3 text-gold"/>
          <span className="text-gold">Team</span>
        </div>
      </div>

      <section className="py-16" style={{background:'#FAFAFA'}}>
        <div className="max-w-6xl mx-auto px-6">
          {/* Filter tabs */}
          <div className="flex flex-wrap gap-2 justify-center mb-12">
            {TEAMS.map(t=>(
              <button key={t} onClick={()=>setFilter(t)}
                className="px-5 py-2.5 rounded-full text-sm font-semibold transition-all capitalize"
                style={{
                  background: filter===t ? 'linear-gradient(135deg,#5B2D8E,#7B4DB8)' : '#fff',
                  color: filter===t ? '#fff' : '#5B2D8E',
                  fontFamily:'Sora,sans-serif',
                  boxShadow: filter===t ? '0 4px 16px rgba(91,45,142,0.35)' : '0 2px 8px rgba(91,45,142,0.07)',
                }}>
                {t==='all'?'All Members':t}
              </button>
            ))}
          </div>

          {isLoading ? (
            <div className="grid md:grid-cols-3 gap-8 mb-16">
              {[1,2,3,4,5,6].map(i=><div key={i} className="h-72 rounded-3xl animate-pulse" style={{background:'rgba(91,45,142,0.04)'}}/>)}
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 gap-8 mb-16">
              {filtered?.map((m,i) => <TeamCard key={m.id} member={m} index={i}/>)}
              {!filtered?.length && (
                <div className="col-span-3 text-center py-16">
                  <Users className="w-12 h-12 mx-auto mb-4" style={{color:'rgba(91,45,142,0.15)'}}/>
                  <p className="text-sm text-muted-foreground">No team members in this category.</p>
                </div>
              )}
            </div>
          )}

          {/* Why us */}
          <div className="grid lg:grid-cols-2 gap-10 items-center mb-16 py-16 border-y" style={{borderColor:'rgba(91,45,142,0.08)'}}>
            <div>
              <div className="eyebrow mb-3">Why Choose Us</div>
              <h2 className="section-title mb-4">We Popular To Provide<br/><span>Best Projects</span></h2>
              <p className="text-sm leading-relaxed mb-6 text-muted-foreground">
                Our dedicated team brings expertise from across Cameroon and the diaspora, working transparently to deliver real change in Nkenkak-Ngiesang.
              </p>
              <div className="space-y-3">
                {[
                  {t:'100% Transparent Funding', d:'Every XAF tracked and reported publicly'},
                  {t:'Community-Led Decisions',   d:'Members vote on all major project proposals'},
                  {t:'Expert Local Knowledge',    d:'Teams drawn from village and diaspora expertise'},
                ].map(f=>(
                  <div key={f.t} className="flex items-start gap-3">
                    <CheckCircle2 className="w-4 h-4 mt-0.5 flex-shrink-0 text-gold"/>
                    <div>
                      <div className="font-display font-semibold text-sm text-dark">{f.t}</div>
                      <div className="text-xs text-muted-foreground">{f.d}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              {ICON_PLACEHOLDERS.map(({Icon, bg, h},i)=>(
                <div key={i} className={`rounded-3xl flex items-center justify-center ${h}`} style={{background:bg}}>
                  <Icon className="w-8 h-8" style={{color:'rgba(240,165,0,0.35)'}}/>
                </div>
              ))}
            </div>
          </div>

          {/* Join team section */}
          <div className="rounded-3xl p-10 relative overflow-hidden text-center" style={{background:'linear-gradient(135deg,#250F47,#5B2D8E)'}}>
            <div className="wave-pattern absolute inset-0"/>
            <div className="relative">
              <div className="eyebrow justify-center mb-4" style={{color:'rgba(240,165,0,0.8)'}}>
                <span className="w-5 h-0.5 rounded-full inline-block mr-2" style={{background:'#F0A500'}}/>Get Involved
              </div>
              <h3 className="font-display font-bold text-2xl text-white mb-3">Join Our Community Team</h3>
              <p className="text-sm mb-8 max-w-md mx-auto" style={{color:'rgba(255,255,255,0.7)',fontFamily:'Poppins,sans-serif'}}>
                Whether in the village or diaspora, your skills make a difference. Choose a team and apply below.
              </p>
              <div className="flex flex-wrap gap-3 justify-center mb-8">
                {JOIN_TEAMS.map(t=>(
                  <button key={t.id} onClick={()=>{setJoinTeam(t.id);setJoinOpen(true)}}
                    className="flex items-center gap-2 px-4 py-2.5 rounded-full text-xs font-semibold transition-all hover:-translate-y-0.5"
                    style={{background:'rgba(255,255,255,0.1)', color:'rgba(255,255,255,0.85)', border:'1px solid rgba(255,255,255,0.15)', fontFamily:'Sora,sans-serif'}}>
                    <t.Icon className="w-3.5 h-3.5" style={{color:'#F0A500'}}/>{t.l}
                  </button>
                ))}
              </div>
              <button onClick={()=>{setJoinTeam('');setJoinOpen(true)}} className="btn-gold">
                <UserPlus className="w-4 h-4"/>Apply to Join
              </button>
            </div>
          </div>
        </div>
      </section>

      {joinOpen && <JoinTeamModal onClose={()=>setJoinOpen(false)} defaultTeam={joinTeam}/>}
    </div>
  )
}
