import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useQuery } from 'react-query'
import api from '../../services/api'
import JoinTeamModal from '../common/JoinTeamModal'

const TIMELINE = [
  { year:'1934', icon:'fa-flag', title:'Village Founded', desc:'Nkenkak-Ngiesang was established under the Ngiemboon traditional system, with the first Fon presiding over the founding clans and setting the values that guide the community to this day.' },
  { year:'1965', icon:'fa-school', title:'First Primary School', desc:'The community rallied together — contributing labour, materials, and funds — to build the first primary school, ensuring every village child had access to education.' },
  { year:'2024', icon:'fa-handshake', title:'Development Council Registered', desc:'The Nkenkak-Ngiesang Development Council was officially registered in 2024, formalising the community association to coordinate infrastructure, education and health projects across the village and diaspora.' },
  { year:'2008', icon:'fa-globe-africa', title:'First Diaspora Forum', desc:'The inaugural diaspora forum was held in Paris, France, uniting overseas Nkenkak-Ngiesang members for the first time with village leaders to plan joint development.' },
  { year:'2016', icon:'fa-laptop', title:'Village Records Digitised', desc:'Community archives, genealogy records and project histories were digitised, and a first community website launched to connect the diaspora with village news.' },
  { year:'2024', icon:'fa-rocket', title:'This Platform Launches', desc:'A full-featured community platform unites diaspora professionals, donors, village residents and youth — enabling donations, projects, events, mentorship and governance in one place.' },
]

const VALUES = [
  { icon:'fa-hands-helping', title:'Unity',          desc:'We believe our strength lies in togetherness. Village residents and diaspora are one community, regardless of distance.' },
  { icon:'fa-seedling',      title:'Development',    desc:'Every initiative is rooted in long-term, sustainable improvement for the village — not short-term gains.' },
  { icon:'fa-balance-scale', title:'Transparency',   desc:'All funds, decisions and progress are publicly reported. Trust is the foundation of everything we do.' },
  { icon:'fa-book-open',     title:'Heritage',       desc:'We are guardians of the Ngiemboon culture, language and traditions for generations yet to come.' },
  { icon:'fa-graduation-cap','title':'Education',    desc:'We invest in every child\'s potential. Education is the single most powerful tool for village transformation.' },
  { icon:'fa-users',         title:'Inclusion',      desc:'Every member — young, elder, woman, man, at home or abroad — has a voice in how we grow.' },
]

const TESTIMONIALS = [
  { text:'Donating through this platform is seamless. I can see exactly how my money is used — the water pipeline update emails are incredible. For the first time I feel truly connected to the village from London.', name:'Jules Fomukong', role:'Diaspora member, London', country:'🇬🇧' },
  { text:'The scholarship my daughter received changed her life. She is now studying medicine and wants to come back and serve the village clinic. This council does what it promises.', name:'Mama Rose Ngwa', role:'Village elder, Nkenkak-Ngiesang', country:'🇨🇲' },
  { text:'As a mentor on the programme, I meet brilliant young people every month. The platform made it effortless to offer my experience to the next generation of Nkenkak professionals.', name:'Dr. Carine Wabo', role:'Mentor & community leader', country:'🇨🇲' },
]

function TimelineCard({ item, isActive, onClick }) {
  return (
    <div className="cursor-pointer" onClick={onClick}>
      <div className="flex items-center gap-3 mb-2">
        <div className="w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 transition-all"
          style={{ background: isActive ? '#F0A500' : 'rgba(255,255,255,0.12)', border: '2px solid rgba(255,255,255,0.2)' }}>
          <i className={`fas ${item.icon} text-sm`} style={{ color: isActive ? '#fff' : 'rgba(255,255,255,0.6)' }} />
        </div>
        <div className="font-display font-bold text-base" style={{ color: isActive ? '#F0A500' : 'rgba(255,255,255,0.7)' }}>{item.year}</div>
      </div>
      <div className={`rounded-2xl p-4 transition-all ${isActive ? '' : 'opacity-60'}`}
        style={{ background: isActive ? 'rgba(255,255,255,0.12)' : 'rgba(255,255,255,0.05)', border: `1px solid ${isActive ? 'rgba(240,165,0,0.3)' : 'rgba(255,255,255,0.08)'}` }}>
        <h4 className="font-display font-bold text-sm mb-1" style={{ color: '#fff' }}>{item.title}</h4>
        {isActive && <p className="text-xs leading-relaxed" style={{ color: 'rgba(255,255,255,0.7)', fontFamily: 'Poppins,sans-serif' }}>{item.desc}</p>}
      </div>
    </div>
  )
}

const MVP_CARDS = [
  {
    num: '01', icon: 'fa-bullseye', label: 'Our Mission',
    color: '#7B4DB8', glow: 'rgba(123,77,184,0.5)',
    grad: 'linear-gradient(135deg,#5B2D8E,#7B4DB8)',
    text: 'To mobilise the collective resources, talent and passion of Nkenkak-Ngiesang people — at home and in the diaspora — to drive lasting development across education, health, water, infrastructure and cultural preservation.',
    detail: 'We achieve this through transparent fundraising, community voting on projects, and active diaspora engagement across 25+ countries.',
  },
  {
    num: '02', icon: 'fa-eye', label: 'Our Vision',
    color: '#F0A500', glow: 'rgba(240,165,0,0.5)',
    grad: 'linear-gradient(135deg,#C87800,#F0A500)',
    text: 'A thriving, self-sufficient Nkenkak-Ngiesang community where every child has quality education, every home has clean water, and our Ngiemboon heritage is alive for generations to come.',
    detail: 'By 2030 we aim to have funded 5 schools, 3 water systems, and established a permanent cultural centre in the village.',
  },
  {
    num: '03', icon: 'fa-star', label: 'Our Promise',
    color: '#22c55e', glow: 'rgba(34,197,94,0.5)',
    grad: 'linear-gradient(135deg,#16a34a,#22c55e)',
    text: 'Every franc donated is accounted for publicly. Every decision is made by the community. Every voice — from the youngest youth to the eldest Fon — is heard and respected in our process.',
    detail: 'All financial reports are published quarterly on this platform. Zero admin fees — 100% of donations go directly to village projects.',
  },
]

export default function CulturePage() {
  const [activeTl,  setActiveTl]  = useState(5)
  const [activeTesti, setActiveTesti] = useState(0)
  const [joinOpen, setJoinOpen]   = useState(false)
  const [activeMvp, setActiveMvp] = useState(null)

  const { data: team = [] } = useQuery('team-about', () => api.get('/team?limit=3').then(r => r.data))

  return (
    <div>
      {/* Hero */}
      <div className="page-hero py-24 px-6 text-center relative overflow-hidden">
        <div className="wave-pattern absolute inset-0" />
        <div className="relative">
          <div className="eyebrow justify-center mb-3" style={{ color: 'rgba(240,165,0,0.9)' }}>
            <span className="w-5 h-0.5 rounded-full inline-block mr-2" style={{ background: '#F0A500' }} />
            Our Story
          </div>
          <h1 className="font-display font-bold text-5xl text-white mb-4">
            About <span style={{ color: '#F0A500' }}>Nkenkak-Ngiesang</span>
          </h1>
          <p className="text-base max-w-xl mx-auto mb-6" style={{ color: 'rgba(255,255,255,0.7)', fontFamily: 'Poppins,sans-serif', lineHeight: 1.8 }}>
            A proud community of the South West Region, Cameroon — united by heritage, driven by development, and connected across the world.
          </p>
          <div className="flex items-center justify-center gap-2 text-sm" style={{ color: 'rgba(255,255,255,0.6)', fontFamily: 'Poppins,sans-serif' }}>
            <Link to="/" className="hover:text-white transition-colors flex items-center gap-1"><i className="fas fa-home text-xs" />Home</Link>
            <i className="fas fa-chevron-right text-xs" style={{ color: '#F0A500' }} />
            <span style={{ color: '#F0A500' }}>About Us</span>
          </div>
        </div>
      </div>

      {/* Impact stats strip */}
      <div style={{ background: 'linear-gradient(135deg,#1A0A35,#250F47)' }}>
        <div className="max-w-6xl mx-auto px-6 py-8 grid grid-cols-3 gap-6 text-center">
          {[
            { val:'40+', label:'Community Members', icon:'fa-users' },
            { val:'12+',  label:'Active Projects',    icon:'fa-seedling' },
            { val:'25+',  label:'Countries Reached',  icon:'fa-globe-africa' },
          ].map(s => (
            <div key={s.label}>
              <div className="w-10 h-10 rounded-xl flex items-center justify-center mx-auto mb-2"
                style={{ background: 'rgba(240,165,0,0.1)', border: '1px solid rgba(240,165,0,0.2)' }}>
                <i className={`fas ${s.icon} text-sm`} style={{ color: '#F0A500' }} />
              </div>
              <div className="font-display font-bold text-2xl text-white">{s.val}</div>
              <div className="text-xs mt-0.5" style={{ color: 'rgba(255,255,255,0.5)', fontFamily: 'Poppins,sans-serif' }}>{s.label}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Who we are */}
      <section className="py-20 bg-white">
        <div className="max-w-6xl mx-auto px-6 grid lg:grid-cols-2 gap-14 items-center">
          {/* Visual */}
          <div className="relative">
            <div className="rounded-3xl overflow-hidden h-96 relative">
              <img
                src="https://res.cloudinary.com/dmxnsttmu/image/upload/q_auto/f_auto/v1778941493/WhatsApp_Image_2026-04-30_at_20.57.14_qtupjs.jpg"
                alt="Nkenkak-Ngiesang Village"
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0" style={{ background: 'linear-gradient(to top, rgba(26,10,53,0.5) 0%, transparent 60%)' }} />
              <div className="absolute bottom-4 left-4">
                <p className="text-sm font-semibold text-white">Nkenkak-Ngiesang Village</p>
                <p className="text-xs" style={{ color: 'rgba(255,255,255,0.7)', fontFamily: 'Poppins,sans-serif' }}>South West Region, Cameroon</p>
              </div>
            </div>
            {/* Floating card */}
            <div className="absolute -bottom-5 -right-4 bg-white rounded-2xl p-4 shadow-xl flex items-center gap-3"
              style={{ border: '1px solid rgba(91,45,142,0.1)' }}>
              <div className="w-11 h-11 rounded-xl flex items-center justify-center" style={{ background: 'linear-gradient(135deg,#F0A500,#FFB84D)' }}>
                <i className="fas fa-award text-white" />
              </div>
              <div>
                <div className="font-display font-bold text-sm" style={{ color: '#1A0A35' }}>Registered 2024</div>
                <div className="text-xs" style={{ color: '#737373', fontFamily: 'Poppins,sans-serif' }}>Officially recognised</div>
              </div>
            </div>
          </div>

          {/* Text */}
          <div>
            <div className="eyebrow mb-3">Who We Are</div>
            <h2 className="section-title mb-5">A Community Built on<br/><span>Heritage & Purpose</span></h2>
            <p className="text-sm leading-relaxed mb-4" style={{ color: '#525252', fontFamily: 'Poppins,sans-serif' }}>
              The Nkenkak-Ngiesang Development Council is the official body uniting the people of Nkenkak-Ngiesang — a community in the South West Region of Cameroon. We connect village residents, diaspora members, and development partners to build a better future together.
            </p>
            <p className="text-sm leading-relaxed mb-6" style={{ color: '#525252', fontFamily: 'Poppins,sans-serif' }}>
              From funding schools and water pipelines to preserving the Ngiemboon language and celebrating our annual harvest festival, every project reflects the spirit of our founding principle: <em style={{ color: '#5B2D8E' }}>what we do together, we do better.</em>
            </p>
            <div className="grid grid-cols-2 gap-4 mb-7">
              {[
                { icon:'fa-check-circle', text:'100% transparent finances', col:'#16a34a' },
                { icon:'fa-check-circle', text:'Community-voted projects', col:'#16a34a' },
                { icon:'fa-check-circle', text:'Free membership for all', col:'#16a34a' },
                { icon:'fa-check-circle', text:'Diaspora fully included', col:'#16a34a' },
              ].map((p, i) => (
                <div key={i} className="flex items-center gap-2 text-sm" style={{ color: '#525252', fontFamily: 'Poppins,sans-serif' }}>
                  <i className={`fas ${p.icon} flex-shrink-0`} style={{ color: p.col }} />
                  {p.text}
                </div>
              ))}
            </div>
            <div className="flex flex-wrap gap-3">
              <Link to="/projects" className="btn-secondary">
                <i className="fas fa-seedling" />View Our Projects
              </Link>
              <button onClick={() => setJoinOpen(true)} className="flex items-center gap-2 text-sm font-semibold px-5 py-3 rounded-full transition-all hover:bg-gray-50"
                style={{ color: '#5B2D8E', border: '1.5px solid rgba(91,45,142,0.15)', fontFamily: 'Sora,sans-serif' }}>
                <i className="fas fa-user-plus text-xs" />Join the Community
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Mission / Vision / Promise */}
      <section className="py-20 relative overflow-hidden" style={{ background: 'linear-gradient(160deg,#0D0520 0%,#1A0A35 50%,#250F47 100%)' }}>
        <style>{`
          @keyframes mvpGlow { 0%,100%{opacity:.6} 50%{opacity:1} }
          .mvp-card { transition: transform .3s cubic-bezier(.16,1,.3,1), box-shadow .3s ease; }
          .mvp-card:hover { transform: translateY(-8px); }
          .mvp-detail { overflow: hidden; transition: max-height .4s cubic-bezier(.16,1,.3,1), opacity .3s ease; }
        `}</style>
        <div className="wave-pattern absolute inset-0 opacity-50" />
        {/* Decorative orbs */}
        <div className="absolute top-0 left-1/4 w-80 h-80 rounded-full pointer-events-none"
          style={{ background: 'radial-gradient(circle,rgba(91,45,142,0.25),transparent 70%)', filter: 'blur(40px)' }}/>
        <div className="absolute bottom-0 right-1/4 w-80 h-80 rounded-full pointer-events-none"
          style={{ background: 'radial-gradient(circle,rgba(240,165,0,0.15),transparent 70%)', filter: 'blur(40px)' }}/>

        <div className="relative max-w-6xl mx-auto px-6">
          <div className="text-center mb-14">
            <div className="eyebrow justify-center mb-3" style={{ color: 'rgba(240,165,0,0.9)' }}>
              <span className="w-5 h-0.5 inline-block mr-2 rounded-full" style={{ background: '#F0A500' }}/>
              Our Purpose
            </div>
            <h2 className="section-title-white mb-3">Mission, Vision &amp; <span style={{ color: '#F0A500' }}>Promise</span></h2>
            <p className="text-sm max-w-md mx-auto" style={{ color: 'rgba(255,255,255,0.45)', fontFamily: 'Poppins,sans-serif' }}>
              Click any card to learn more about what drives us.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-6 mb-16">
            {MVP_CARDS.map((c, i) => {
              const isOpen = activeMvp === i
              return (
                <div key={i} className="mvp-card cursor-pointer rounded-3xl overflow-hidden"
                  style={{
                    background: 'rgba(255,255,255,0.04)',
                    border: `1px solid ${isOpen ? c.color : 'rgba(255,255,255,0.08)'}`,
                    boxShadow: isOpen ? `0 0 40px ${c.glow}, 0 20px 60px rgba(0,0,0,0.4)` : '0 8px 32px rgba(0,0,0,0.3)',
                  }}
                  onClick={() => setActiveMvp(isOpen ? null : i)}>
                  {/* Top accent bar */}
                  <div className="h-1.5 w-full" style={{ background: c.grad }}/>
                  <div className="p-7">
                    {/* Number + icon row */}
                    <div className="flex items-start justify-between mb-5">
                      <div className="w-14 h-14 rounded-2xl flex items-center justify-center flex-shrink-0"
                        style={{ background: c.grad, boxShadow: `0 8px 24px ${c.glow}` }}>
                        <i className={`fas ${c.icon} text-xl text-white`}/>
                      </div>
                      <span className="font-display font-bold text-4xl leading-none select-none"
                        style={{ color: 'rgba(255,255,255,0.06)', fontFamily: 'Sora,sans-serif' }}>{c.num}</span>
                    </div>
                    <h3 className="font-display font-bold text-lg mb-3 text-white">{c.label}</h3>
                    <p className="text-sm leading-relaxed mb-4" style={{ color: 'rgba(255,255,255,0.6)', fontFamily: 'Poppins,sans-serif' }}>{c.text}</p>
                    {/* Expandable detail */}
                    <div className="mvp-detail" style={{ maxHeight: isOpen ? '120px' : '0', opacity: isOpen ? 1 : 0 }}>
                      <div className="pt-4" style={{ borderTop: `1px solid rgba(255,255,255,0.08)` }}>
                        <p className="text-xs leading-relaxed" style={{ color: c.color, fontFamily: 'Poppins,sans-serif' }}>{c.detail}</p>
                      </div>
                    </div>
                    {/* Toggle hint */}
                    <div className="flex items-center gap-1.5 mt-2" style={{ color: c.color }}>
                      <span className="text-xs font-semibold" style={{ fontFamily: 'Sora,sans-serif' }}>{isOpen ? 'Show less' : 'Learn more'}</span>
                      <i className={`fas fa-chevron-${isOpen ? 'up' : 'down'} text-[10px] transition-transform`}/>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>

          {/* Values grid */}
          <div className="text-center mb-8">
            <h3 className="font-display font-bold text-xl text-white">Core <span style={{ color: '#F0A500' }}>Values</span></h3>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {VALUES.map((v, i) => (
              <div key={i} className="flex items-start gap-3 p-4 rounded-2xl transition-all duration-200 hover:scale-[1.02]"
                style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)' }}>
                <div className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0"
                  style={{ background: 'linear-gradient(135deg,#F0A500,#FFB84D)' }}>
                  <i className={`fas ${v.icon} text-xs text-white`}/>
                </div>
                <div>
                  <h4 className="font-display font-bold text-sm mb-1 text-white">{v.title}</h4>
                  <p className="text-xs leading-relaxed" style={{ color: 'rgba(255,255,255,0.5)', fontFamily: 'Poppins,sans-serif' }}>{v.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Timeline */}
      <section className="py-20 relative overflow-hidden" style={{ background: 'linear-gradient(135deg,#1A0A35,#250F47)' }}>
        <div className="wave-pattern absolute inset-0" />
        <div className="relative max-w-6xl mx-auto px-6">
          <div className="text-center mb-12">
            <div className="eyebrow justify-center mb-3" style={{ color: 'rgba(240,165,0,0.85)' }}>
              <span className="w-5 h-0.5 inline-block mr-2 rounded-full" style={{ background: '#F0A500' }} />
              Our History
            </div>
            <h2 className="section-title-white">Our <span style={{ color: '#F0A500' }}>Community Journey</span></h2>
            <p className="text-sm mt-3 max-w-lg mx-auto" style={{ color: 'rgba(255,255,255,0.55)', fontFamily: 'Poppins,sans-serif' }}>
              Click any milestone to read the full story.
            </p>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {TIMELINE.map((t, i) => (
              <TimelineCard key={t.year} item={t} isActive={activeTl === i} onClick={() => setActiveTl(i)} />
            ))}
          </div>
        </div>
      </section>

      {/* Team teaser */}
      <section className="py-20 bg-white">
        <div className="max-w-6xl mx-auto px-6">
          <div className="flex items-end justify-between mb-12">
            <div>
              <div className="eyebrow mb-3">Our People</div>
              <h2 className="section-title">The Team Behind<br/><span>Our Community</span></h2>
            </div>
            <Link to="/team" className="btn-secondary hidden md:flex !text-xs !py-2.5 !px-5">
              <i className="fas fa-users text-xs" />Meet Full Team
            </Link>
          </div>
          <div className="grid md:grid-cols-3 gap-6">
            {(team.length ? team.slice(0, 3) : [
              { name:'Chief Ngwa Emmanuel', roleTitle:'Village Fon (Chief)', team:'leadership', grad:'linear-gradient(135deg,#250F47,#5B2D8E)' },
              { name:'Dr. Carine Wabo',    roleTitle:'Health Coordinator',   team:'health',    grad:'linear-gradient(135deg,#3D1A6B,#7B4DB8)' },
              { name:'Kevin Mbakop',       roleTitle:'Youth Wing Leader',     team:'youth',     grad:'linear-gradient(135deg,#5B2D8E,#9B6FD8)' },
            ]).map((m, i) => (
              <div key={i} className="card overflow-hidden group">
                <div className="h-48 flex items-center justify-center relative overflow-hidden"
                  style={{ background: m.grad || 'linear-gradient(135deg,#250F47,#5B2D8E)' }}>
                  {m.avatarUrl
                    ? <img src={m.avatarUrl} alt={m.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                    : <>
                        <div className="wave-pattern absolute inset-0" />
                        <div className="w-20 h-20 rounded-full flex items-center justify-center relative z-10" style={{ background: 'rgba(240,165,0,0.15)' }}>
                          <i className="fas fa-user text-3xl" style={{ color: 'rgba(240,165,0,0.6)' }} />
                        </div>
                      </>
                  }
                </div>
                <div className="p-5">
                  <h3 className="font-display font-bold text-base" style={{ color: '#1A0A35' }}>{m.name}</h3>
                  <p className="text-xs font-semibold mt-0.5 mb-3" style={{ color: '#F0A500', fontFamily: 'Poppins,sans-serif' }}>{m.roleTitle}</p>
                  <span className="text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full capitalize"
                    style={{ background: 'rgba(91,45,142,0.08)', color: '#5B2D8E', fontFamily: 'Sora,sans-serif' }}>{m.team}</span>
                </div>
              </div>
            ))}
          </div>
          <div className="text-center mt-8 md:hidden">
            <Link to="/team" className="btn-secondary !text-xs">Meet Full Team</Link>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-20" style={{ background: 'linear-gradient(135deg,#FAF6EE,#F3EEF9)' }}>
        <div className="max-w-5xl mx-auto px-6">
          <div className="text-center mb-12">
            <div className="eyebrow justify-center mb-3">Community Voices</div>
            <h2 className="section-title">What Our Members <span>Say</span></h2>
          </div>

          <div className="relative">
            <div className="card p-8 md:p-10">
              <i className="fas fa-quote-left text-5xl mb-6 block" style={{ color: 'rgba(91,45,142,0.1)' }} />
              <p className="text-base leading-relaxed mb-8" style={{ color: '#525252', fontFamily: 'Poppins,sans-serif', lineHeight: 1.9 }}>
                "{TESTIMONIALS[activeTesti].text}"
              </p>
              <div className="flex items-center justify-between flex-wrap gap-4">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-full flex items-center justify-center text-white font-bold text-lg"
                    style={{ background: 'linear-gradient(135deg,#5B2D8E,#7B4DB8)' }}>
                    {TESTIMONIALS[activeTesti].name.charAt(0)}
                  </div>
                  <div>
                    <div className="font-display font-bold text-sm" style={{ color: '#1A0A35' }}>
                      {TESTIMONIALS[activeTesti].country} {TESTIMONIALS[activeTesti].name}
                    </div>
                    <div className="text-xs" style={{ color: '#F0A500', fontFamily: 'Poppins,sans-serif' }}>{TESTIMONIALS[activeTesti].role}</div>
                  </div>
                </div>
                <div className="flex gap-2">
                  {TESTIMONIALS.map((_, i) => (
                    <button key={i} onClick={() => setActiveTesti(i)}
                      className="rounded-full transition-all"
                      style={{
                        width: i === activeTesti ? 28 : 8, height: 8,
                        background: i === activeTesti ? '#5B2D8E' : 'rgba(91,45,142,0.2)',
                      }} />
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA banner */}
      <section className="py-16 relative overflow-hidden" style={{ background: 'linear-gradient(135deg,#5B2D8E,#1A0A35)' }}>
        <div className="wave-pattern absolute inset-0 pointer-events-none" />
        <div className="relative max-w-6xl mx-auto px-6 grid md:grid-cols-2 gap-10 items-center">
          <div>
            <div className="eyebrow mb-3" style={{ color: 'rgba(240,165,0,0.85)' }}>
              <span className="w-5 h-0.5 inline-block mr-2 rounded-full" style={{ background: '#F0A500' }} />
              Get Involved
            </div>
            <h2 className="font-display font-bold text-3xl text-white mb-4 leading-tight">
              Be Part of the<br/><span style={{ color: '#F0A500' }}>Nkenkak-Ngiesang</span> Story
            </h2>
            <p className="text-sm mb-6" style={{ color: 'rgba(255,255,255,0.65)', fontFamily: 'Poppins,sans-serif', lineHeight: 1.8 }}>
              Whether you donate, volunteer, mentor, or simply stay connected — your involvement makes a real difference to families in the village and to the preservation of our heritage.
            </p>
            <div className="flex flex-wrap gap-3">
              <Link to="/projects" className="btn-gold"><i className="fas fa-heart" />Donate to a Project</Link>
              <button onClick={() => setJoinOpen(true)} className="flex items-center gap-2 px-5 py-3 rounded-full text-sm font-semibold transition-all"
                style={{ background: 'rgba(255,255,255,0.1)', color: '#fff', border: '1.5px solid rgba(255,255,255,0.2)', fontFamily: 'Sora,sans-serif' }}>
                <i className="fas fa-user-plus text-xs" />Become a Volunteer
              </button>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            {[
              { icon:'fa-donate',        label:'Donate',    link:'/projects',    desc:'Fund village projects' },
              { icon:'fa-hands-helping', label:'Volunteer', link:'/volunteers',  desc:'Serve the community' },
              { icon:'fa-user-tie',      label:'Mentor',    link:'/mentorship',  desc:'Guide youth' },
              { icon:'fa-comments',      label:'Connect',   link:'/forum',       desc:'Join the forum' },
            ].map((a, i) => (
              <Link key={i} to={a.link}
                className="flex flex-col items-center text-center p-5 rounded-2xl transition-all hover:scale-105"
                style={{ background: 'rgba(255,255,255,0.07)', border: '1px solid rgba(255,255,255,0.1)' }}>
                <div className="w-12 h-12 rounded-2xl flex items-center justify-center mb-3"
                  style={{ background: 'rgba(240,165,0,0.12)', border: '1px solid rgba(240,165,0,0.2)' }}>
                  <i className={`fas ${a.icon} text-lg`} style={{ color: '#F0A500' }} />
                </div>
                <div className="font-display font-bold text-sm text-white">{a.label}</div>
                <div className="text-[11px] mt-0.5" style={{ color: 'rgba(255,255,255,0.5)', fontFamily: 'Poppins,sans-serif' }}>{a.desc}</div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {joinOpen && <JoinTeamModal onClose={() => setJoinOpen(false)} />}
    </div>
  )
}
