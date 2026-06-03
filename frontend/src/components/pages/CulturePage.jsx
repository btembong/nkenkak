import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useQuery } from 'react-query'
import api from '../../services/api'
import JoinTeamModal from '../common/JoinTeamModal'
import {
  Target, Eye, ShieldCheck,
  Handshake, Sprout, Scale, BookOpen, GraduationCap, Users,
  Flag, BookMarked, Globe, Laptop, Rocket,
  CheckCircle2, UserPlus, Award, User, Heart, MessageCircle, Quote, UserCheck,
  Home, ChevronRight,
} from 'lucide-react'

const TIMELINE = [
  { year:'1934', Icon: Flag,       title:'Village Founded',                  desc:'Nkenkak-Ngiesang was established under the Ngiemboon traditional system, with the first Fon presiding over the founding clans and setting the values that guide the community to this day.' },
  { year:'1965', Icon: BookMarked, title:'First Primary School',             desc:'The community rallied together — contributing labour, materials, and funds — to build the first primary school, ensuring every village child had access to education.' },
  { year:'2008', Icon: Globe,      title:'First Diaspora Forum',             desc:'The inaugural diaspora forum was held in Paris, France, uniting overseas Nkenkak-Ngiesang members for the first time with village leaders to plan joint development.' },
  { year:'2016', Icon: Laptop,     title:'Village Records Digitised',        desc:'Community archives, genealogy records and project histories were digitised, and a first community website launched to connect the diaspora with village news.' },
  { year:'2024', Icon: Handshake,  title:'Development Council Registered',   desc:'The Nkenkak-Ngiesang Development Council was officially registered in 2024, formalising the community association to coordinate infrastructure, education and health projects across the village and diaspora.' },
  { year:'2024', Icon: Rocket,     title:'This Platform Launches',           desc:'A full-featured community platform unites diaspora professionals, donors, village residents and youth — enabling donations, projects, events, mentorship and governance in one place.' },
]

const VALUES = [
  { Icon: Handshake,     title: 'Unity',        desc: 'We believe our strength lies in togetherness. Village residents and diaspora are one community, regardless of distance.' },
  { Icon: Sprout,        title: 'Development',  desc: 'Every initiative is rooted in long-term, sustainable improvement for the village — not short-term gains.' },
  { Icon: Scale,         title: 'Transparency', desc: 'All funds, decisions and progress are publicly reported. Trust is the foundation of everything we do.' },
  { Icon: BookOpen,      title: 'Heritage',     desc: 'We are guardians of the Ngiemboon culture, language and traditions for generations yet to come.' },
  { Icon: GraduationCap, title: 'Education',    desc: "We invest in every child's potential. Education is the single most powerful tool for village transformation." },
  { Icon: Users,         title: 'Inclusion',    desc: 'Every member — young, elder, woman, man, at home or abroad — has a voice in how we grow.' },
]

const TESTIMONIALS = [
  { text: 'Donating through this platform is seamless. I can see exactly how my money is used — the water pipeline update emails are incredible. For the first time I feel truly connected to the village from London.', name: 'Jules Fomukong', role: 'Diaspora member, London', country: '🇬🇧' },
  { text: 'The scholarship my daughter received changed her life. She is now studying medicine and wants to come back and serve the village clinic. This council does what it promises.', name: 'Mama Rose Ngwa', role: 'Village elder, Nkenkak-Ngiesang', country: '🇨🇲' },
  { text: 'As a mentor on the programme, I meet brilliant young people every month. The platform made it effortless to offer my experience to the next generation of Nkenkak professionals.', name: 'Dr. Carine Wabo', role: 'Mentor & community leader', country: '🇨🇲' },
]

const MVP_CARDS = [
  {
    Icon: Target, label: 'Our Mission', color: '#7B4DB8',
    text: 'To mobilise the collective resources, talent and passion of Nkenkak-Ngiesang people — at home and in the diaspora — to drive lasting development across education, health, water, infrastructure and cultural preservation.',
    detail: 'We achieve this through transparent fundraising, community voting on projects, and active diaspora engagement across 25+ countries.',
  },
  {
    Icon: Eye, label: 'Our Vision', color: '#F0A500',
    text: 'A thriving, self-sufficient Nkenkak-Ngiesang community where every child has quality education, every home has clean water, and our Ngiemboon heritage is alive for generations to come.',
    detail: 'By 2030 we aim to have funded 5 schools, 3 water systems, and established a permanent cultural centre in the village.',
  },
  {
    Icon: ShieldCheck, label: 'Our Promise', color: '#22c55e',
    text: 'Every franc donated is accounted for publicly. Every decision is made by the community. Every voice — from the youngest youth to the eldest Fon — is heard and respected in our process.',
    detail: 'All financial reports are published quarterly on this platform. Zero admin fees — 100% of donations go directly to village projects.',
  },
]

const TABS = [
  { id: 'story',   label: 'Our Story' },
  { id: 'purpose', label: 'Mission & Values' },
  { id: 'history', label: 'History' },
  { id: 'team',    label: 'Our Team' },
]

function TimelineCard({ item, isActive, onClick }) {
  const TIcon = item.Icon
  return (
    <div className="cursor-pointer" onClick={onClick}>
      <div className="flex items-center gap-3 mb-2">
        <div className="w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 transition-all"
          style={{ background: isActive ? '#F0A500' : 'rgba(255,255,255,0.12)', border: '2px solid rgba(255,255,255,0.2)' }}>
          <TIcon className="w-4 h-4" style={{ color: isActive ? '#fff' : 'rgba(255,255,255,0.6)' }} />
        </div>
        <div className="font-display font-bold text-base" style={{ color: isActive ? '#F0A500' : 'rgba(255,255,255,0.7)' }}>{item.year}</div>
      </div>
      <div className={`rounded-2xl p-4 transition-all ${isActive ? '' : 'opacity-60'}`}
        style={{ background: isActive ? 'rgba(255,255,255,0.12)' : 'rgba(255,255,255,0.05)', border: `1px solid ${isActive ? 'rgba(240,165,0,0.3)' : 'rgba(255,255,255,0.08)'}` }}>
        <h4 className="font-display font-bold text-sm mb-1 text-white">{item.title}</h4>
        {isActive && <p className="text-xs leading-relaxed mt-1" style={{ color: 'rgba(255,255,255,0.7)', fontFamily: 'Poppins,sans-serif' }}>{item.desc}</p>}
      </div>
    </div>
  )
}

export default function CulturePage() {
  const [activeTab,   setActiveTab]   = useState('story')
  const [activeTl,    setActiveTl]    = useState(5)
  const [activeTesti, setActiveTesti] = useState(0)
  const [joinOpen,    setJoinOpen]    = useState(false)

  const { data: team = [] } = useQuery('team-about', () => api.get('/team?limit=3').then(r => r.data))

  return (
    <div>

      {/* ── Hero ── */}
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
            <Link to="/" className="hover:text-white transition-colors flex items-center gap-1">
              <Home className="w-3 h-3" />Home
            </Link>
            <ChevronRight className="w-3 h-3" style={{ color: '#F0A500' }} />
            <span style={{ color: '#F0A500' }}>About Us</span>
          </div>
        </div>
      </div>

      {/* ── Stats strip ── */}
      <div style={{ background: 'linear-gradient(135deg,#1A0A35,#250F47)' }}>
        <div className="max-w-6xl mx-auto px-6 py-8 grid grid-cols-3 gap-6 text-center">
          {[
            { val: '40+', label: 'Community Members', Icon: Users  },
            { val: '12+', label: 'Active Projects',   Icon: Sprout },
            { val: '25+', label: 'Countries Reached', Icon: Globe  },
          ].map(s => (
            <div key={s.label}>
              <div className="w-10 h-10 rounded-xl flex items-center justify-center mx-auto mb-2"
                style={{ background: 'rgba(240,165,0,0.1)', border: '1px solid rgba(240,165,0,0.2)' }}>
                <s.Icon className="w-4 h-4" style={{ color: '#F0A500' }} />
              </div>
              <div className="font-display font-bold text-2xl text-white">{s.val}</div>
              <div className="text-xs mt-0.5" style={{ color: 'rgba(255,255,255,0.5)', fontFamily: 'Poppins,sans-serif' }}>{s.label}</div>
            </div>
          ))}
        </div>
      </div>

      {/* ── Tabs ── */}
      <div>
        {/* Tab bar */}
        <div className="bg-white px-6 pt-10 pb-0">
          <div className="max-w-6xl mx-auto">
            <div className="flex gap-1 p-1 rounded-2xl w-fit" style={{ background: '#F3EEF9' }}>
              {TABS.map(tab => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className="px-5 py-2.5 rounded-xl text-sm font-semibold transition-all duration-200 whitespace-nowrap"
                  style={activeTab === tab.id
                    ? { background: '#5B2D8E', color: '#fff', boxShadow: '0 2px 10px rgba(91,45,142,0.3)' }
                    : { color: '#5B2D8E', background: 'transparent' }
                  }>
                  {tab.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Tab content */}
        <div className="min-h-[540px]">

          {/* ── Our Story ── */}
          {activeTab === 'story' && (
            <section className="py-14 bg-white">
              <div className="max-w-6xl mx-auto px-6 grid lg:grid-cols-2 gap-14 items-center">
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
                  <div className="absolute -bottom-5 -right-4 bg-white rounded-2xl p-4 shadow-xl flex items-center gap-3"
                    style={{ border: '1px solid rgba(91,45,142,0.1)' }}>
                    <div className="w-11 h-11 rounded-xl flex items-center justify-center" style={{ background: 'linear-gradient(135deg,#F0A500,#FFB84D)' }}>
                      <Award className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <div className="font-display font-bold text-sm" style={{ color: '#1A0A35' }}>Registered 2024</div>
                      <div className="text-xs" style={{ color: '#737373', fontFamily: 'Poppins,sans-serif' }}>Officially recognised</div>
                    </div>
                  </div>
                </div>

                <div>
                  <div className="eyebrow mb-3">Who We Are</div>
                  <h2 className="section-title mb-5">A Community Built on<br /><span>Heritage & Purpose</span></h2>
                  <p className="text-sm leading-relaxed mb-4" style={{ color: '#525252', fontFamily: 'Poppins,sans-serif' }}>
                    The Nkenkak-Ngiesang Development Council is the official body uniting the people of Nkenkak-Ngiesang — a community in the South West Region of Cameroon. We connect village residents, diaspora members, and development partners to build a better future together.
                  </p>
                  <p className="text-sm leading-relaxed mb-6" style={{ color: '#525252', fontFamily: 'Poppins,sans-serif' }}>
                    From funding schools and water pipelines to preserving the Ngiemboon language and celebrating our annual harvest festival, every project reflects the spirit of our founding principle: <em style={{ color: '#5B2D8E' }}>what we do together, we do better.</em>
                  </p>
                  <div className="grid grid-cols-2 gap-3 mb-7">
                    {[
                      '100% transparent finances',
                      'Community-voted projects',
                      'Free membership for all',
                      'Diaspora fully included',
                    ].map((text, i) => (
                      <div key={i} className="flex items-center gap-2 text-sm" style={{ color: '#525252', fontFamily: 'Poppins,sans-serif' }}>
                        <CheckCircle2 className="w-4 h-4 flex-shrink-0" style={{ color: '#16a34a' }} />
                        {text}
                      </div>
                    ))}
                  </div>
                  <div className="flex flex-wrap gap-3">
                    <Link to="/projects" className="btn-secondary">
                      <Sprout className="w-3 h-3" />View Our Projects
                    </Link>
                    <button onClick={() => setJoinOpen(true)}
                      className="flex items-center gap-2 text-sm font-semibold px-5 py-3 rounded-full transition-all hover:bg-gray-50"
                      style={{ color: '#5B2D8E', border: '1.5px solid rgba(91,45,142,0.15)', fontFamily: 'Sora,sans-serif' }}>
                      <UserPlus className="w-4 h-4" />Join the Community
                    </button>
                  </div>
                </div>
              </div>
            </section>
          )}

          {/* ── Mission & Values ── */}
          {activeTab === 'purpose' && (
            <section className="py-14 bg-white">
              <div className="max-w-6xl mx-auto px-6">
                <div className="text-center mb-10">
                  <div className="eyebrow justify-center mb-3">Our Purpose</div>
                  <h2 className="section-title">Mission, Vision &amp; <span>Promise</span></h2>
                </div>
                <div className="grid md:grid-cols-3 gap-6 mb-14">
                  {MVP_CARDS.map((c, i) => (
                    <div key={i} className="rounded-2xl p-8 flex flex-col gap-5"
                      style={{ background: '#FAFAFA', border: '1px solid rgba(0,0,0,0.06)' }}>
                      <div className="w-11 h-11 rounded-xl flex items-center justify-center"
                        style={{ background: `${c.color}18` }}>
                        <c.Icon className="w-5 h-5" style={{ color: c.color }} />
                      </div>
                      <div>
                        <h3 className="font-display font-bold text-lg mb-2 text-dark">{c.label}</h3>
                        <p className="text-sm leading-relaxed text-muted-foreground">{c.text}</p>
                      </div>
                      <p className="text-xs leading-relaxed" style={{ color: c.color }}>{c.detail}</p>
                    </div>
                  ))}
                </div>

                <div className="text-center mb-8">
                  <div className="eyebrow justify-center mb-2">What We Stand For</div>
                  <h2 className="section-title">Core <span>Values</span></h2>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  {VALUES.map((v, i) => (
                    <div key={i} className="flex items-start gap-3 p-5 rounded-2xl"
                      style={{ background: '#FAFAFA', border: '1px solid rgba(91,45,142,0.08)', boxShadow: '0 2px 8px rgba(91,45,142,0.04)' }}>
                      <div className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0"
                        style={{ background: 'rgba(91,45,142,0.08)' }}>
                        <v.Icon className="w-4 h-4 text-primary-500" />
                      </div>
                      <div>
                        <h4 className="font-display font-bold text-sm mb-1 text-dark">{v.title}</h4>
                        <p className="text-xs leading-relaxed text-muted-foreground">{v.desc}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </section>
          )}

          {/* ── History ── */}
          {activeTab === 'history' && (
            <section className="py-14 relative overflow-hidden" style={{ background: 'linear-gradient(135deg,#1A0A35,#250F47)' }}>
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
                  {TIMELINE.map((item, i) => (
                    <TimelineCard key={item.year + i} item={item} isActive={activeTl === i} onClick={() => setActiveTl(i)} />
                  ))}
                </div>
              </div>
            </section>
          )}

          {/* ── Our Team ── */}
          {activeTab === 'team' && (
            <section className="py-14 bg-white">
              <div className="max-w-6xl mx-auto px-6">
                <div className="flex items-end justify-between mb-12">
                  <div>
                    <div className="eyebrow mb-3">Our People</div>
                    <h2 className="section-title">The Team Behind<br /><span>Our Community</span></h2>
                  </div>
                  <Link to="/team" className="btn-secondary hidden md:flex !text-xs !py-2.5 !px-5">
                    <Users className="w-3 h-3" />Meet Full Team
                  </Link>
                </div>
                <div className="grid md:grid-cols-3 gap-6">
                  {(team.length ? team.slice(0, 3) : [
                    { name: 'Chief Ngwa Emmanuel', roleTitle: 'Village Fon (Chief)', team: 'leadership', grad: 'linear-gradient(135deg,#250F47,#5B2D8E)' },
                    { name: 'Dr. Carine Wabo',     roleTitle: 'Health Coordinator',  team: 'health',     grad: 'linear-gradient(135deg,#3D1A6B,#7B4DB8)' },
                    { name: 'Kevin Mbakop',        roleTitle: 'Youth Wing Leader',   team: 'youth',      grad: 'linear-gradient(135deg,#5B2D8E,#9B6FD8)' },
                  ]).map((m, i) => (
                    <div key={i} className="card overflow-hidden group">
                      <div className="h-48 flex items-center justify-center relative overflow-hidden"
                        style={{ background: m.grad || 'linear-gradient(135deg,#250F47,#5B2D8E)' }}>
                        {m.avatarUrl
                          ? <img src={m.avatarUrl} alt={m.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                          : <>
                              <div className="wave-pattern absolute inset-0" />
                              <div className="w-20 h-20 rounded-full flex items-center justify-center relative z-10"
                                style={{ background: 'rgba(240,165,0,0.15)' }}>
                                <User className="w-8 h-8" style={{ color: 'rgba(240,165,0,0.6)' }} />
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
          )}

        </div>
      </div>

      {/* ── Testimonials ── */}
      <section className="py-20" style={{ background: 'linear-gradient(135deg,#FAF6EE,#F3EEF9)' }}>
        <div className="max-w-5xl mx-auto px-6">
          <div className="text-center mb-12">
            <div className="eyebrow justify-center mb-3">Community Voices</div>
            <h2 className="section-title">What Our Members <span>Say</span></h2>
          </div>
          <div className="card p-8 md:p-10">
            <Quote className="w-10 h-10 mb-6" style={{ color: 'rgba(91,45,142,0.12)' }} />
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
      </section>

      {/* ── CTA ── */}
      <section className="py-16 relative overflow-hidden" style={{ background: 'linear-gradient(135deg,#5B2D8E,#1A0A35)' }}>
        <div className="wave-pattern absolute inset-0 pointer-events-none" />
        <div className="relative max-w-6xl mx-auto px-6 grid md:grid-cols-2 gap-10 items-center">
          <div>
            <div className="eyebrow mb-3" style={{ color: 'rgba(240,165,0,0.85)' }}>
              <span className="w-5 h-0.5 inline-block mr-2 rounded-full" style={{ background: '#F0A500' }} />
              Get Involved
            </div>
            <h2 className="font-display font-bold text-3xl text-white mb-4 leading-tight">
              Be Part of the<br /><span style={{ color: '#F0A500' }}>Nkenkak-Ngiesang</span> Story
            </h2>
            <p className="text-sm mb-6" style={{ color: 'rgba(255,255,255,0.65)', fontFamily: 'Poppins,sans-serif', lineHeight: 1.8 }}>
              Whether you donate, volunteer, mentor, or simply stay connected — your involvement makes a real difference to families in the village and to the preservation of our heritage.
            </p>
            <div className="flex flex-wrap gap-3">
              <Link to="/projects" className="btn-gold"><Heart className="w-3 h-3" />Donate to a Project</Link>
              <button onClick={() => setJoinOpen(true)}
                className="flex items-center gap-2 px-5 py-3 rounded-full text-sm font-semibold transition-all"
                style={{ background: 'rgba(255,255,255,0.1)', color: '#fff', border: '1.5px solid rgba(255,255,255,0.2)', fontFamily: 'Sora,sans-serif' }}>
                <UserPlus className="w-4 h-4" />Become a Volunteer
              </button>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            {[
              { Icon: Heart,         label: 'Donate',    link: '/projects',   desc: 'Fund village projects' },
              { Icon: Handshake,     label: 'Volunteer', link: '/volunteers', desc: 'Serve the community'   },
              { Icon: UserCheck,     label: 'Mentor',    link: '/mentorship', desc: 'Guide youth'           },
              { Icon: MessageCircle, label: 'Connect',   link: '/forum',      desc: 'Join the forum'        },
            ].map((a, i) => (
              <Link key={i} to={a.link}
                className="flex flex-col items-center text-center p-5 rounded-2xl transition-all hover:scale-105"
                style={{ background: 'rgba(255,255,255,0.07)', border: '1px solid rgba(255,255,255,0.1)' }}>
                <div className="w-12 h-12 rounded-2xl flex items-center justify-center mb-3"
                  style={{ background: 'rgba(240,165,0,0.12)', border: '1px solid rgba(240,165,0,0.2)' }}>
                  <a.Icon className="w-5 h-5" style={{ color: '#F0A500' }} />
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
