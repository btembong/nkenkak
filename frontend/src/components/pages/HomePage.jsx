import { useState, useEffect, useRef } from 'react'
import { Link, useOutletContext } from 'react-router-dom'
import { useQuery } from 'react-query'
import { useInView } from 'react-intersection-observer'
import CountUp from 'react-countup'
import api from '../../services/api'
import ProjectCard from '../common/ProjectCard'
import NewsCard from '../common/NewsCard'
import TeamCard from '../common/TeamCard'
import JoinTeamModal from '../common/JoinTeamModal'

const SLIDES = [
  { title: 'Welcome to', highlight: 'Nkenkak-Ngiesang', desc: 'A proud community bound by ancestral heritage, collective progress, and the timeless spirit of togetherness.', cta: 'Explore Our Projects', ctaLink: '/projects', bg: 'from-[#1A0F08] via-[#2D1A0E] to-[#1A3320]' },
  { title: 'Building Tomorrow', highlight: 'Together', desc: 'From clean water to digital skills — our community projects are transforming lives one initiative at a time.', cta: 'See All Projects', ctaLink: '/projects', bg: 'from-[#0D1A2D] via-[#1A2D3D] to-[#2D1F0D]' },
  { title: 'Rooted in Culture', highlight: 'Rising in Unity', desc: 'Our traditions, our land, our people — celebrating the living heritage of Nkenkak-Ngiesang and the strength of our diaspora.', cta: 'Explore Our Culture', ctaLink: '/culture', bg: 'from-[#1F0D08] via-[#3D2415] to-[#1A2D15]' },
]
const STATS = [
  { label:'Village Residents', value:4200, suffix:'' },
  { label:'Active Projects', value:18, suffix:'' },
  { label:'Donors Worldwide', value:340, suffix:'+' },
  { label:'Years of Heritage', value:92, suffix:'' },
]
const TESTIMONIALS = [
  { text: 'Being part of this community across thousands of miles has never felt more real. Through this platform, I contributed to something that will outlive me.', author: 'Bernard Tchouapa', role: 'Diaspora Member — Paris, France' },
  { text: 'The water pipeline changed my family\'s life. My children no longer walk 5 kilometres each morning. I thank every person who donated.', author: 'Mama Célestine Nganou', role: 'Village Resident' },
  { text: 'The Digital Skills Centre opened my eyes. Now I run a small tech business. Nkenkak-Ngiesang is rising.', author: 'Kevin Mbakop', role: 'Youth Entrepreneur — Village Youth Wing' },
]

function StatCounter({ value, label, suffix }) {
  const { ref, inView } = useInView({ triggerOnce: true, threshold: 0.5 })
  return (
    <div ref={ref} className="text-center py-10 px-6 border-b border-gold/10 last:border-0 md:border-b-0 md:border-r">
      <div className="font-cinzel text-5xl font-black text-gold leading-none mb-2">
        {inView ? <CountUp end={value} duration={2.5} separator=","/> : '0'}{suffix}
      </div>
      <div className="text-cream/50 text-xs tracking-[3px] uppercase mt-1">{label}</div>
    </div>
  )
}

export default function HomePage() {
  const { openDonate } = useOutletContext()
  const [slide, setSlide]       = useState(0)
  const [testi, setTesti]       = useState(0)
  const [joinOpen, setJoinOpen] = useState(false)
  const [nlEmail, setNlEmail]   = useState('')
  const [nlDone,  setNlDone]    = useState(false)
  const timerRef = useRef(null)

  const { data: featuredProjects } = useQuery('featured-projects',
    () => api.get('/projects?featured=true&limit=3').then(r => r.data.projects))
  const { data: news } = useQuery('recent-news',
    () => api.get('/news?limit=3').then(r => r.data))
  const { data: team } = useQuery('team-home',
    () => api.get('/team').then(r => r.data.slice(0,4)))

  useEffect(() => {
    timerRef.current = setInterval(() => setSlide(s => (s+1) % SLIDES.length), 5500)
    return () => clearInterval(timerRef.current)
  }, [])
  useEffect(() => {
    const t = setInterval(() => setTesti(s => (s+1) % TESTIMONIALS.length), 6000)
    return () => clearInterval(t)
  }, [])

  const handleNL = async (e) => {
    e.preventDefault()
    try { await api.post('/newsletter/subscribe', { email: nlEmail }); setNlDone(true) } catch {}
  }

  const cur = SLIDES[slide]

  return (
    <div>
      {/* ── HERO ── */}
      <section className="relative min-h-screen flex items-center overflow-hidden">
        {SLIDES.map((s, i) => (
          <div key={i} className={`absolute inset-0 bg-gradient-to-br ${s.bg} transition-opacity duration-1000 ${i===slide?'opacity-100':'opacity-0'}`}>
            <div className="absolute inset-0 bg-pattern"/>
          </div>
        ))}
        <div className="absolute inset-0 bg-gradient-to-b from-black/20 via-black/40 to-black/80"/>

        <div className="relative z-10 max-w-6xl mx-auto px-6 py-32 text-center">
          <div className="inline-flex items-center gap-2 bg-gold/15 border border-gold/30 text-gold text-xs tracking-[4px] uppercase px-5 py-2 rounded-full mb-8 backdrop-blur-sm">
            <i className="fas fa-map-marker-alt"/> Cameroon, West Region
          </div>
          <h1 className="font-cinzel text-5xl md:text-7xl text-white leading-[1.05] text-shadow-lg mb-6 transition-all duration-700" key={slide}>
            {cur.title}<br/>
            <span className="text-gold">{cur.highlight}</span>
          </h1>
          <p className="text-cream/80 text-lg max-w-2xl mx-auto leading-relaxed mb-10 font-light transition-all duration-700">
            {cur.desc}
          </p>
          <div className="flex flex-wrap gap-4 justify-center">
            <Link to={cur.ctaLink} className="btn-gold text-sm"><i className="fas fa-seedling"/> {cur.cta}</Link>
            <button onClick={openDonate} className="btn-outline-gold text-sm"><i className="fas fa-heart"/> Support the Village</button>
          </div>
        </div>

        {/* Slide dots */}
        <div className="absolute bottom-10 left-1/2 -translate-x-1/2 flex gap-2 z-10">
          {SLIDES.map((_, i) => (
            <button key={i} onClick={() => setSlide(i)}
              className={`h-0.5 rounded-full transition-all duration-300 ${i===slide?'bg-gold w-10':'bg-white/30 w-5'}`}/>
          ))}
        </div>

        {/* Scroll indicator */}
        <div className="absolute bottom-10 right-10 flex flex-col items-center gap-2 text-cream/30 text-[9px] tracking-[3px] uppercase">
          <div className="w-px h-10 bg-gradient-to-b from-gold to-transparent animate-pulse"/>
          Scroll
        </div>
      </section>

      {/* ── STATS ── */}
      <div className="bg-gradient-to-r from-earth via-earth-light to-earth relative overflow-hidden">
        <div className="absolute inset-0 bg-pattern"/>
        <div className="relative max-w-5xl mx-auto">
          <div className="grid grid-cols-2 md:grid-cols-4">
            {STATS.map(s => <StatCounter key={s.label} {...s}/>)}
          </div>
        </div>
      </div>

      {/* ── ABOUT / CULTURE PREVIEW ── */}
      <section className="py-24 bg-cream-light">
        <div className="max-w-6xl mx-auto px-6">
          <div className="grid md:grid-cols-2 gap-16 items-center">
            <div>
              <div className="section-eyebrow justify-start !mx-0">Our Identity</div>
              <h2 className="section-title">Rooted in Tradition,<br/>Growing Together</h2>
              <div className="divider !ml-0 !mx-0 mb-6"/>
              <p className="text-earth/70 leading-relaxed mb-5">
                Nkenkak-Ngiesang is nestled in the highlands of Cameroon's West Region, where the sound of traditional drums still calls the community together. Our people speak the Ngiemboon language, and our customs — from sacred kola nut ceremonies to vibrant harvest festivals — are preserved with great pride.
              </p>
              <p className="text-earth/70 leading-relaxed mb-8">
                The village councils, led by wise elders and progressive youth, guide the community through the complexities of modern life without losing the essence of our ancestors.
              </p>
              <div className="grid grid-cols-2 gap-4 mb-8">
                {[{icon:'fa-users',t:'Community Unity',d:'Decisions through village council tradition'},{icon:'fa-music',t:'Music & Dance',d:'Ngiemboon dances at every gathering'},{icon:'fa-seedling',t:'Agricultural Roots',d:'Communal farming & harvest festivals'},{icon:'fa-book',t:'Oral Traditions',d:'Stories passed around the fire'}].map(p => (
                  <div key={p.t} className="flex gap-3">
                    <div className="w-10 h-10 rounded-lg bg-gold/10 border border-gold/20 flex items-center justify-center text-gold text-sm flex-shrink-0">
                      <i className={`fas ${p.icon}`}/>
                    </div>
                    <div>
                      <h4 className="text-xs font-bold text-earth mb-0.5">{p.t}</h4>
                      <p className="text-earth/50 text-xs leading-relaxed">{p.d}</p>
                    </div>
                  </div>
                ))}
              </div>
              <Link to="/culture" className="btn-earth text-sm"><i className="fas fa-landmark"/> Explore Our Culture</Link>
            </div>
            <div className="relative h-[480px] hidden md:block">
              <div className="absolute top-0 left-0 w-3/4 h-80 bg-gradient-to-br from-forest to-forest-light rounded-xl flex items-center justify-center shadow-2xl">
                <i className="fas fa-mountain text-white/20 text-8xl"/>
                <span className="absolute bottom-4 left-4 bg-black/30 backdrop-blur-sm text-cream text-xs px-3 py-1.5 rounded-lg">Village Landscape</span>
              </div>
              <div className="absolute bottom-0 right-0 w-3/5 h-64 bg-gradient-to-br from-earth to-earth-light rounded-xl border-4 border-cream-light flex items-center justify-center shadow-2xl">
                <i className="fas fa-drum text-white/20 text-6xl"/>
                <span className="absolute bottom-3 left-3 bg-black/30 backdrop-blur-sm text-cream text-xs px-3 py-1.5 rounded-lg">Festival Drums</span>
              </div>
              <div className="absolute top-1/2 -translate-y-1/2 right-0 w-16 h-16 rounded-full bg-gold-gradient flex items-center justify-center text-earth text-xl shadow-xl animate-pulse">
                <i className="fas fa-leaf"/>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── FEATURED PROJECTS ── */}
      <section className="py-24 bg-earth relative overflow-hidden">
        <div className="absolute inset-0 bg-pattern"/>
        <div className="relative max-w-6xl mx-auto px-6">
          <div className="text-center mb-14">
            <div className="section-eyebrow" style={{color:'#E8C97A'}}>Making Change</div>
            <h2 className="section-title-light">Community Projects</h2>
            <div className="divider"/>
            <p className="text-cream/50 max-w-xl mx-auto text-sm leading-relaxed">Every project is driven by the needs of our people. Your support transforms lives.</p>
          </div>
          <div className="grid md:grid-cols-3 gap-6 mb-10">
            {featuredProjects?.map(p => (
              <ProjectCard key={p.id} project={p} onDonate={openDonate} dark/>
            ))}
            {!featuredProjects && [1,2,3].map(i => (
              <div key={i} className="h-80 rounded-xl bg-white/5 animate-pulse"/>
            ))}
          </div>
          <div className="text-center">
            <Link to="/projects" className="btn-outline-gold text-sm"><i className="fas fa-seedling"/> View All Projects</Link>
          </div>
        </div>
      </section>

      {/* ── TESTIMONIALS ── */}
      <section className="py-20 bg-gradient-to-br from-earth-light to-earth overflow-hidden">
        <div className="max-w-3xl mx-auto px-6 text-center">
          <div className="section-eyebrow" style={{color:'#E8C97A'}}>Voices</div>
          <h2 className="section-title-light mb-10">What Our People Say</h2>
          <div className="transition-all duration-700" key={testi}>
            <div className="font-serif text-5xl text-gold leading-none mb-4">"</div>
            <p className="text-cream/80 text-lg italic leading-relaxed mb-8">{TESTIMONIALS[testi].text}</p>
            <div className="flex flex-col items-center gap-1">
              <div className="w-12 h-12 rounded-full bg-gold-gradient flex items-center justify-center text-earth text-lg mb-1"><i className="fas fa-user"/></div>
              <div className="font-serif text-cream">{TESTIMONIALS[testi].author}</div>
              <div className="text-gold/60 text-xs tracking-wider">{TESTIMONIALS[testi].role}</div>
            </div>
          </div>
          <div className="flex justify-center gap-2 mt-8">
            {TESTIMONIALS.map((_,i) => (
              <button key={i} onClick={() => setTesti(i)}
                className={`h-0.5 rounded-full transition-all ${i===testi?'bg-gold w-6':'bg-white/20 w-3'}`}/>
            ))}
          </div>
        </div>
      </section>

      {/* ── TEAM PREVIEW ── */}
      <section className="py-24 bg-cream-light">
        <div className="max-w-6xl mx-auto px-6">
          <div className="text-center mb-14">
            <div className="section-eyebrow">The People</div>
            <h2 className="section-title">Village Leaders</h2>
            <div className="divider"/>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-10">
            {team?.map(m => <TeamCard key={m.id} member={m}/>)}
            {!team && [1,2,3,4].map(i => <div key={i} className="h-72 rounded-xl bg-earth/5 animate-pulse"/>)}
          </div>
          <div className="bg-gradient-to-br from-earth to-earth-light rounded-2xl p-10 text-center">
            <h3 className="font-cinzel text-gold text-2xl mb-3">Join Our Community Team</h3>
            <p className="text-cream/60 mb-6 max-w-md mx-auto text-sm leading-relaxed">Whether you're in the village or in the diaspora, your skills can help build a better Nkenkak-Ngiesang.</p>
            <button onClick={() => setJoinOpen(true)} className="btn-gold text-sm"><i className="fas fa-user-plus"/> Apply to Join</button>
          </div>
        </div>
      </section>

      {/* ── NEWS PREVIEW ── */}
      <section className="py-24 bg-white">
        <div className="max-w-6xl mx-auto px-6">
          <div className="flex items-end justify-between mb-14">
            <div>
              <div className="section-eyebrow justify-start !mx-0">Latest Updates</div>
              <h2 className="section-title">Village News</h2>
              <div className="divider !ml-0 !mx-0"/>
            </div>
            <Link to="/news" className="text-gold text-sm font-semibold tracking-wider hover:underline">View All <i className="fas fa-arrow-right ml-1"/></Link>
          </div>
          <div className="grid md:grid-cols-3 gap-6">
            {news?.map(n => <NewsCard key={n.id} article={n}/>)}
            {!news && [1,2,3].map(i => <div key={i} className="h-64 rounded-xl bg-earth/5 animate-pulse"/>)}
          </div>
        </div>
      </section>

      {/* ── NEWSLETTER ── */}
      <section className="py-16 bg-forest-gradient">
        <div className="max-w-5xl mx-auto px-6">
          <div className="flex flex-col md:flex-row items-center justify-between gap-8">
            <div>
              <h3 className="font-cinzel text-gold text-2xl mb-2">Stay Connected to Your Village</h3>
              <p className="text-cream/60 text-sm">Monthly updates on projects, events and community news.</p>
            </div>
            {nlDone ? (
              <div className="flex items-center gap-3 text-green-400 font-semibold"><i className="fas fa-check-circle text-xl"/> Subscribed! Welcome to the community.</div>
            ) : (
              <form onSubmit={handleNL} className="flex gap-0 flex-1 max-w-md">
                <input type="email" value={nlEmail} onChange={e => setNlEmail(e.target.value)}
                  placeholder="Your email address" required
                  className="flex-1 px-5 py-3.5 bg-white/10 border border-white/15 border-r-0 rounded-l-lg text-cream placeholder-cream/30 text-sm focus:outline-none focus:border-gold transition-colors"/>
                <button type="submit" className="bg-gold text-earth font-bold tracking-wider text-xs uppercase px-5 py-3.5 rounded-r-lg hover:bg-gold-light transition-colors whitespace-nowrap">
                  Subscribe
                </button>
              </form>
            )}
          </div>
        </div>
      </section>

      {joinOpen && <JoinTeamModal onClose={() => setJoinOpen(false)}/>}
    </div>
  )
}
