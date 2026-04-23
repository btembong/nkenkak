// ─── TeamPage ──────────────────────────────────────────────────
import { useState } from 'react'
import { useQuery } from 'react-query'
import { format } from 'date-fns'
import { Link } from 'react-router-dom'
import api from '../../services/api'
import TeamCard from '../common/TeamCard'
import JoinTeamModal from '../common/JoinTeamModal'
import NewsCard from '../common/NewsCard'

const TEAMS = ['all','leadership','development','culture','youth','health','environment']

export function TeamPage() {
  const [filter, setFilter]   = useState('all')
  const [joinOpen, setJoinOpen] = useState(false)
  const [joinTeam, setJoinTeam] = useState('')
  const { data, isLoading } = useQuery('team', () => api.get('/team').then(r => r.data))

  const filtered = data?.filter(m => filter === 'all' || m.team === filter)

  const openJoin = (team = '') => { setJoinTeam(team); setJoinOpen(true) }

  return (
    <div>
      <div className="bg-gradient-to-br from-earth via-earth-light to-[#1A3D20] py-24 relative overflow-hidden">
        <div className="absolute inset-0 bg-pattern"/>
        <div className="relative max-w-5xl mx-auto px-6 text-center">
          <div className="section-eyebrow" style={{color:'#E8C97A'}}>The People</div>
          <h1 className="section-title-light text-5xl mb-4">Village Leaders & Team</h1>
          <div className="divider"/>
          <p className="text-cream/60 max-w-xl mx-auto text-sm">Our community is guided by dedicated leaders, passionate developers and proud residents.</p>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-6 py-14">
        {/* Filter */}
        <div className="flex flex-wrap gap-2 justify-center mb-12">
          {TEAMS.map(t => (
            <button key={t} onClick={() => setFilter(t)}
              className={`px-5 py-2.5 rounded-full border text-xs font-bold tracking-wider uppercase transition-all ${filter===t?'bg-earth text-gold border-earth':'border-earth/12 text-earth/60 hover:border-earth/30'}`}>
              {t === 'all' ? 'All Members' : t}
            </button>
          ))}
        </div>

        {/* Grid */}
        {isLoading ? (
          <div className="grid md:grid-cols-4 gap-6">{[1,2,3,4,5,6,7,8].map(i=><div key={i} className="h-72 rounded-xl bg-earth/5 animate-pulse"/>)}</div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-16">
            {filtered?.map(m => <TeamCard key={m.id} member={m}/>)}
          </div>
        )}

        {/* Join section */}
        <div className="bg-gradient-to-br from-earth to-earth-light rounded-2xl p-12 text-center relative overflow-hidden">
          <div className="absolute inset-0 bg-pattern"/>
          <div className="relative">
            <h3 className="font-cinzel text-gold text-3xl mb-4">Join Our Community Team</h3>
            <p className="text-cream/60 max-w-lg mx-auto mb-8 leading-relaxed">Whether you're in the village or the diaspora, your skills and dedication can help build a better Nkenkak-Ngiesang.</p>
            <div className="flex flex-wrap gap-3 justify-center mb-8">
              {[{id:'development',icon:'fa-hard-hat',l:'Development'},{id:'culture',icon:'fa-masks-theater',l:'Cultural Council'},{id:'youth',icon:'fa-rocket',l:'Youth Wing'},{id:'environment',icon:'fa-leaf',l:'Environment'},{id:'education',icon:'fa-graduation-cap',l:'Education'},{id:'health',icon:'fa-heartbeat',l:'Health'}].map(t=>(
                <button key={t.id} onClick={() => openJoin(t.id)}
                  className="flex items-center gap-2 bg-white/5 hover:bg-gold/15 border border-white/10 hover:border-gold/40 text-cream/70 hover:text-gold px-4 py-2.5 rounded-lg text-xs font-semibold transition-all">
                  <i className={`fas ${t.icon} text-gold/60`}/>{t.l}
                </button>
              ))}
            </div>
            <button onClick={() => openJoin()} className="btn-gold"><i className="fas fa-user-plus"/> Apply to Join</button>
          </div>
        </div>
      </div>
      {joinOpen && <JoinTeamModal onClose={() => setJoinOpen(false)} defaultTeam={joinTeam}/>}
    </div>
  )
}

// ─── EventsPage ────────────────────────────────────────────────
export function EventsPage() {
  const [cat, setCat] = useState('all')
  const { data, isLoading } = useQuery('events', () => api.get('/events').then(r => r.data))

  const cats = ['all','culture','education','health','sport','community','fundraiser','governance']
  const filtered = data?.filter(e => cat === 'all' || e.category === cat)

  return (
    <div>
      <div className="bg-gradient-to-br from-[#1A2D4A] to-earth py-20 relative overflow-hidden">
        <div className="absolute inset-0 bg-pattern"/>
        <div className="relative max-w-5xl mx-auto px-6 text-center">
          <div className="section-eyebrow" style={{color:'#E8C97A'}}>Gatherings</div>
          <h1 className="section-title-light text-5xl mb-4">Community Events</h1>
          <div className="divider"/>
        </div>
      </div>
      <div className="max-w-5xl mx-auto px-6 py-14">
        <div className="flex flex-wrap gap-2 mb-10">
          {cats.map(c => (
            <button key={c} onClick={() => setCat(c)}
              className={`px-4 py-2 rounded-lg border text-xs font-bold tracking-wider uppercase transition-all ${cat===c?'bg-earth text-gold border-earth':'border-earth/12 text-earth/60 hover:border-earth/30'}`}>
              {c === 'all' ? 'All Events' : c}
            </button>
          ))}
        </div>
        {isLoading ? (
          <div className="space-y-4">{[1,2,3].map(i=><div key={i} className="h-28 rounded-xl bg-earth/5 animate-pulse"/>)}</div>
        ) : filtered?.length ? (
          <div className="space-y-4">
            {filtered.map(e => {
              const d = new Date(e.start_date)
              return (
                <div key={e.id} className="bg-white rounded-xl p-5 border border-black/5 hover:border-gold/20 transition-all flex gap-5 items-start cursor-pointer hover:-translate-y-0.5 hover:shadow-lg">
                  <div className="bg-earth text-gold px-4 py-3 rounded-lg text-center min-w-[64px] flex-shrink-0">
                    <div className="font-cinzel text-2xl font-black leading-none">{format(d,'d')}</div>
                    <div className="text-[10px] tracking-widest uppercase opacity-70 mt-0.5">{format(d,'MMM')}</div>
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1.5">
                      <span className="text-[10px] bg-gold/10 text-gold-dark border border-gold/20 px-2 py-0.5 rounded-full font-bold uppercase tracking-wider">{e.category}</span>
                      {e.is_online && <span className="text-[10px] bg-blue-50 text-blue-600 px-2 py-0.5 rounded-full font-bold">Online</span>}
                      {e.is_featured && <span className="text-[10px] bg-gold text-earth px-2 py-0.5 rounded-full font-bold">Featured</span>}
                    </div>
                    <h3 className="font-serif text-lg text-earth mb-1">{e.title}</h3>
                    <p className="text-earth/60 text-sm line-clamp-2 leading-relaxed">{e.description}</p>
                    <div className="flex items-center gap-4 mt-2 text-earth/40 text-xs">
                      {e.venue && <span className="flex items-center gap-1"><i className="fas fa-map-marker-alt text-gold text-[10px]"/>{e.venue}</span>}
                      <span className="flex items-center gap-1"><i className="fas fa-clock text-[10px]"/>{format(d,'h:mm a')}</span>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        ) : (
          <div className="text-center py-20">
            <i className="fas fa-calendar text-earth/20 text-5xl mb-4 block"/>
            <h3 className="font-serif text-xl text-earth/40">No events found</h3>
          </div>
        )}
      </div>
    </div>
  )
}

// ─── GalleryPage ───────────────────────────────────────────────
export function GalleryPage() {
  const [lightbox, setLightbox] = useState(null)
  const { data, isLoading } = useQuery('gallery', () => api.get('/gallery').then(r => r.data))

  const PLACEHOLDERS = [
    {bg:'from-forest to-forest-light',icon:'fa-mountain',label:'Village Landscape',tall:true},
    {bg:'from-earth to-earth-light',icon:'fa-drum',label:'Festival Drums'},
    {bg:'from-[#1A2D4A] to-[#253D6A]',icon:'fa-users',label:'Community Day'},
    {bg:'from-[#2D1A3D] to-[#3D2D5C]',icon:'fa-mosque',label:'Village Palace',tall:true},
    {bg:'from-[#3D1A08] to-[#5C2D12]',icon:'fa-seedling',label:'Farm Harvest',wide:true},
    {bg:'from-[#1A3D3D] to-[#205C5C]',icon:'fa-child',label:'Village Children'},
    {bg:'from-[#3D3D1A] to-[#5C5C20]',icon:'fa-water',label:'Water Project'},
    {bg:'from-[#2D1F1A] to-[#4A3530]',icon:'fa-hands',label:'Community Unity'},
  ]

  return (
    <div>
      <div className="bg-earth py-20 relative overflow-hidden">
        <div className="absolute inset-0 bg-pattern"/>
        <div className="relative max-w-5xl mx-auto px-6 text-center">
          <div className="section-eyebrow" style={{color:'#E8C97A'}}>Visual Stories</div>
          <h1 className="section-title-light text-5xl mb-4">Village Gallery</h1>
          <div className="divider"/>
          <p className="text-cream/60 max-w-xl mx-auto text-sm">A window into the life, beauty, and spirit of Nkenkak-Ngiesang.</p>
        </div>
      </div>
      <div className="max-w-6xl mx-auto px-6 py-14">
        {isLoading ? (
          <div className="grid grid-cols-4 gap-3">{[1,2,3,4,5,6,7,8].map(i=><div key={i} className="h-48 rounded-xl bg-earth/5 animate-pulse"/>)}</div>
        ) : (data?.length ? (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {data.map((item, i) => (
              <div key={item.id} onClick={() => setLightbox(item)}
                className="rounded-xl overflow-hidden cursor-pointer group relative bg-earth/10 min-h-[160px] hover:shadow-xl transition-all">
                <img src={item.url} alt={item.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"/>
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-all flex items-center justify-center">
                  <i className="fas fa-expand text-white opacity-0 group-hover:opacity-100 transition-opacity text-xl"/>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {PLACEHOLDERS.map((p,i) => (
              <div key={i} className={`bg-gradient-to-br ${p.bg} rounded-xl flex flex-col items-center justify-center gap-2 text-white/30 cursor-pointer hover:text-white/50 transition-all group ${p.tall?'row-span-2 min-h-[320px]':'min-h-[160px]'} ${p.wide?'col-span-2':''}`}>
                <i className={`fas ${p.icon} text-3xl`}/>
                <span className="text-xs tracking-widest">{p.label}</span>
              </div>
            ))}
          </div>
        ))}
      </div>

      {/* Lightbox */}
      {lightbox && (
        <div className="modal-overlay" onClick={() => setLightbox(null)}>
          <div className="relative max-w-3xl w-full animate-slide-up">
            <button onClick={() => setLightbox(null)} className="absolute -top-12 right-0 text-white/60 hover:text-white text-2xl"><i className="fas fa-times"/></button>
            <img src={lightbox.url} alt={lightbox.title} className="w-full rounded-xl shadow-2xl"/>
            {lightbox.title && <p className="text-center text-cream/60 text-sm mt-3">{lightbox.title}</p>}
          </div>
        </div>
      )}
    </div>
  )
}

// ─── NewsPage ──────────────────────────────────────────────────
export function NewsPage() {
  const [page, setPage] = useState(1)
  const { data, isLoading } = useQuery(['news', page], () => api.get(`/news?page=${page}&limit=9`).then(r => r.data))

  return (
    <div>
      <div className="bg-gradient-to-br from-earth to-earth-light py-20 relative overflow-hidden">
        <div className="absolute inset-0 bg-pattern"/>
        <div className="relative max-w-5xl mx-auto px-6 text-center">
          <div className="section-eyebrow" style={{color:'#E8C97A'}}>Latest Updates</div>
          <h1 className="section-title-light text-5xl mb-4">Village News</h1>
          <div className="divider"/>
        </div>
      </div>
      <div className="max-w-5xl mx-auto px-6 py-14">
        {isLoading ? (
          <div className="grid md:grid-cols-3 gap-6">{[1,2,3,4,5,6].map(i=><div key={i} className="h-64 rounded-xl bg-earth/5 animate-pulse"/>)}</div>
        ) : (
          <div className="grid md:grid-cols-3 gap-6">
            {data?.map((a, i) => <NewsCard key={a.id} article={a} featured={i===0}/>)}
          </div>
        )}
        {!isLoading && data?.length === 0 && (
          <div className="text-center py-20"><i className="fas fa-newspaper text-earth/20 text-5xl mb-4 block"/><h3 className="font-serif text-xl text-earth/40">No articles yet</h3></div>
        )}
      </div>
    </div>
  )
}

// ─── NewsDetail ────────────────────────────────────────────────
export function NewsDetail() {
  const { useParams } = require('react-router-dom')
  const { slug } = useParams()
  const { data: article, isLoading } = useQuery(['news-detail', slug], () => api.get(`/news/${slug}`).then(r => r.data))
  const { data: related } = useQuery('news-related', () => api.get('/news?limit=3').then(r => r.data))

  if (isLoading) return <div className="max-w-3xl mx-auto px-6 py-20 space-y-4">{[1,2,3].map(i=><div key={i} className="h-8 bg-earth/5 rounded animate-pulse"/>)}</div>
  if (!article) return <div className="text-center py-24"><Link to="/news" className="text-gold">← Back to News</Link></div>

  return (
    <div className="max-w-3xl mx-auto px-6 py-12">
      <Link to="/news" className="text-earth/40 text-sm hover:text-gold flex items-center gap-2 mb-8 transition-colors"><i className="fas fa-arrow-left text-xs"/> All News</Link>
      {article.cover_image && <img src={article.cover_image} alt={article.title} className="w-full h-72 object-cover rounded-2xl mb-8"/>}
      {article.category && <span className="bg-gold text-earth text-xs font-black px-3 py-1 rounded-full uppercase tracking-wider">{article.category}</span>}
      <h1 className="font-serif text-4xl text-earth mt-4 mb-4 leading-tight">{article.title}</h1>
      <div className="flex items-center gap-4 text-earth/40 text-sm mb-8 pb-8 border-b border-earth/8">
        {article.author_name && <span className="flex items-center gap-1.5"><i className="fas fa-user text-gold text-xs"/>{article.author_name}</span>}
        {article.published_at && <span className="flex items-center gap-1.5"><i className="fas fa-calendar text-gold text-xs"/>{format(new Date(article.published_at),'MMMM d, yyyy')}</span>}
        <span className="flex items-center gap-1.5"><i className="fas fa-eye text-gold text-xs"/>{article.view_count} views</span>
      </div>
      <div className="prose prose-lg max-w-none text-earth/75 leading-relaxed" dangerouslySetInnerHTML={{__html: article.content}}/>

      {related?.length > 0 && (
        <div className="mt-16 pt-8 border-t border-earth/8">
          <h3 className="font-serif text-2xl text-earth mb-6">More News</h3>
          <div className="grid md:grid-cols-3 gap-5">
            {related.filter(a => a.slug !== slug).slice(0,3).map(a => <NewsCard key={a.id} article={a}/>)}
          </div>
        </div>
      )}
    </div>
  )
}

// ─── CulturePage ───────────────────────────────────────────────
export function CulturePage() {
  return (
    <div>
      <div className="bg-gradient-to-br from-[#1F0D08] via-[#3D2415] to-earth py-24 relative overflow-hidden">
        <div className="absolute inset-0 bg-pattern"/>
        <div className="relative max-w-5xl mx-auto px-6 text-center">
          <div className="section-eyebrow" style={{color:'#E8C97A'}}>Our Identity</div>
          <h1 className="section-title-light text-5xl mb-4">Culture & Heritage</h1>
          <div className="divider"/>
          <p className="text-cream/60 max-w-xl mx-auto">Centuries of wisdom, art, and communal values that define who we are.</p>
        </div>
      </div>
      <div className="max-w-5xl mx-auto px-6 py-16 space-y-20">
        {/* Heritage */}
        <div className="grid md:grid-cols-2 gap-12 items-center">
          <div className="h-80 bg-gradient-to-br from-forest to-earth rounded-2xl flex items-center justify-center"><i className="fas fa-mountain text-white/15 text-8xl"/></div>
          <div>
            <div className="section-eyebrow justify-start !mx-0 text-sm mb-3">Heritage</div>
            <h2 className="section-title mb-4">The Land & Language</h2>
            <div className="divider !ml-0 !mx-0 mb-5"/>
            <p className="text-earth/70 leading-relaxed mb-4">Nkenkak-Ngiesang is nestled in the highlands of Cameroon's West Region. Our people speak the Ngiemboon language, one of the richest in the Grassfields tradition.</p>
            <p className="text-earth/70 leading-relaxed">The village occupies sacred land that has been inhabited for over nine decades, with the palace at its center serving as the seat of cultural and political authority.</p>
          </div>
        </div>

        {/* Traditions grid */}
        <div>
          <div className="text-center mb-10"><div className="section-eyebrow">Living Traditions</div><h2 className="section-title">Customs & Ceremonies</h2><div className="divider"/></div>
          <div className="grid md:grid-cols-3 gap-6">
            {[
              {icon:'fa-drum',bg:'from-forest to-forest-light',t:'The Sacred Drum Festival',d:'Every dry season, the village gathers for three days of drumming, storytelling and ancestral tribute.'},
              {icon:'fa-palette',bg:'from-earth to-earth-light',t:'Weaving & Kente Artistry',d:'Our artisans weave intricate patterns telling stories of our clans — passed down from master weavers.'},
              {icon:'fa-utensils',bg:'from-[#1A2D4A] to-[#253D6A]',t:'Cuisine & Community Meals',d:'Traditional dishes like Achu soup and corn fufu prepared during celebrations embody togetherness.'},
              {icon:'fa-fire',bg:'from-[#3D1A08] to-[#5C2D12]',t:'Kola Nut Ceremonies',d:'The sharing of kola nut marks every important occasion — a sacred act of peace and hospitality.'},
              {icon:'fa-masks-theater',bg:'from-[#2D1A3D] to-[#3D2D5C]',t:'Ngiemboon Dance',d:'Traditional dances are performed at every major gathering, preserving movements older than memory.'},
              {icon:'fa-seedling',bg:'from-[#1A3D1A] to-[#2D5C2D]',t:'Harvest Festivals',d:'The communal harvest season is marked with prayer, sharing and gratitude to the land and ancestors.'},
            ].map(c => (
              <div key={c.t} className="card overflow-hidden">
                <div className={`h-44 bg-gradient-to-br ${c.bg} flex items-center justify-center`}><i className={`fas ${c.icon} text-white/20 text-5xl`}/></div>
                <div className="p-5"><h3 className="font-serif text-base text-earth mb-2">{c.t}</h3><p className="text-earth/60 text-sm leading-relaxed">{c.d}</p></div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

// ─── ContactPage ───────────────────────────────────────────────
export function ContactPage() {
  const [loading, setLoading] = useState(false)
  const [sent, setSent]       = useState(false)
  const { register, handleSubmit } = useForm()

  const onSubmit = async (data) => {
    setLoading(true)
    await new Promise(r => setTimeout(r, 1200)) // simulate send
    setSent(true); setLoading(false)
  }

  return (
    <div>
      <div className="bg-gradient-to-br from-earth to-earth-light py-20 relative overflow-hidden">
        <div className="absolute inset-0 bg-pattern"/>
        <div className="relative max-w-5xl mx-auto px-6 text-center">
          <div className="section-eyebrow" style={{color:'#E8C97A'}}>Get In Touch</div>
          <h1 className="section-title-light text-5xl mb-4">Contact the Village</h1>
          <div className="divider"/>
        </div>
      </div>
      <div className="max-w-5xl mx-auto px-6 py-16">
        <div className="grid md:grid-cols-2 gap-12">
          <div>
            <h2 className="font-serif text-2xl text-earth mb-4">We'd love to hear from you</h2>
            <p className="text-earth/60 leading-relaxed mb-8">Whether you're a resident, diaspora member, NGO partner or simply a friend of Nkenkak-Ngiesang — reach out. Every message matters.</p>
            <div className="space-y-4">
              {[
                {icon:'fa-map-marker-alt',t:'Location',v:'Nkenkak-Ngiesang, West Region, Cameroon'},
                {icon:'fa-envelope',t:'Email',v:'contact@nkenkak-ngiesang.cm'},
                {icon:'fa-phone',t:'Phone / WhatsApp',v:'+237 6XX XXX XXX'},
                {icon:'fab fa-facebook',t:'Facebook',v:'Nkenkak-Ngiesang Community'},
              ].map(c=>(
                <div key={c.t} className="flex gap-4">
                  <div className="w-11 h-11 rounded-xl bg-earth flex items-center justify-center text-gold flex-shrink-0"><i className={`fas ${c.icon}`}/></div>
                  <div><h4 className="font-bold text-earth text-sm">{c.t}</h4><p className="text-earth/60 text-sm">{c.v}</p></div>
                </div>
              ))}
            </div>
          </div>
          <div className="bg-white rounded-2xl p-8 border border-black/5 shadow-sm">
            {sent ? (
              <div className="text-center py-8">
                <div className="w-16 h-16 rounded-full bg-green-50 flex items-center justify-center mx-auto mb-4"><i className="fas fa-check text-green-500 text-2xl"/></div>
                <h3 className="font-serif text-xl text-earth mb-2">Message Sent!</h3>
                <p className="text-earth/50 text-sm">We'll respond within 48 hours.</p>
              </div>
            ) : (
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div><label className="label">Name</label><input {...register('name')} className="input" placeholder="Your name"/></div>
                  <div><label className="label">Email</label><input type="email" {...register('email')} className="input" placeholder="your@email.com"/></div>
                </div>
                <div>
                  <label className="label">Subject</label>
                  <select {...register('subject')} className="input">
                    <option>General Enquiry</option><option>Project Support</option><option>Diaspora Partnership</option><option>Media / Press</option><option>Volunteer</option>
                  </select>
                </div>
                <div><label className="label">Message</label><textarea {...register('message')} rows={4} className="input resize-none" placeholder="Your message..."/></div>
                <button type="submit" disabled={loading} className="btn-gold w-full justify-center text-sm">
                  {loading?<><i className="fas fa-spinner animate-spin"/> Sending...</>:<><i className="fas fa-paper-plane"/> Send Message</>}
                </button>
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

// ─── DiasporaPage ───────────────────────────────────────────────
export function DiasporaPage() {
  const [addPin, setAddPin] = useState(false)
  const { user }= useAuth()
  const qc = useQueryClient()
  const { data: pins, isLoading } = useQuery('diaspora-pins', () => api.get('/diaspora').then(r => r.data))
  const { register, handleSubmit } = useForm()
  const addMut = useMutation(data => api.post('/diaspora', data), {
    onSuccess: () => { toast.success('Pin added!'); qc.invalidateQueries('diaspora-pins'); setAddPin(false) }
  })

  // Group by country
  const byCountry = pins?.reduce((acc, p) => { acc[p.country] = (acc[p.country]||0)+1; return acc }, {}) || {}
  const topCountries = Object.entries(byCountry).sort((a,b)=>b[1]-a[1]).slice(0,8)

  return (
    <div>
      <div className="bg-gradient-to-br from-[#0D1A2D] via-earth to-forest py-20 relative overflow-hidden">
        <div className="absolute inset-0 bg-pattern"/>
        <div className="relative max-w-5xl mx-auto px-6 text-center">
          <div className="section-eyebrow" style={{color:'#E8C97A'}}>Global Community</div>
          <h1 className="section-title-light text-5xl mb-4">Diaspora Map</h1>
          <div className="divider"/>
          <p className="text-cream/60 max-w-xl mx-auto mb-8 text-sm">Nkenkak-Ngiesang citizens around the world — connected by heritage.</p>
          {user && <button onClick={() => setAddPin(true)} className="btn-gold text-sm"><i className="fas fa-map-pin"/> Add Your Pin</button>}
          {!user && <Link to="/register" className="btn-outline-gold text-sm"><i className="fas fa-user-plus"/> Join to Add Your Pin</Link>}
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-6 py-14">
        {/* Map placeholder */}
        <div className="bg-gradient-to-br from-[#0D1A2D] to-earth rounded-2xl h-80 flex items-center justify-center mb-12 border border-gold/10 relative overflow-hidden">
          <div className="absolute inset-0 bg-pattern"/>
          <div className="relative text-center">
            <i className="fas fa-globe-africa text-gold/30 text-8xl block mb-4"/>
            <p className="text-cream/40 text-sm">Interactive map — integrate <a href="https://leafletjs.com" className="text-gold hover:underline">Leaflet.js</a> with the <code className="bg-white/10 px-1.5 py-0.5 rounded text-xs">/api/diaspora</code> endpoint</p>
          </div>
          {/* Animated pins */}
          {pins?.slice(0,6).map((p, i) => (
            <div key={p.id} className="absolute w-3 h-3 rounded-full bg-gold animate-ping" style={{top:`${20+i*10}%`,left:`${15+i*12}%`,animationDelay:`${i*0.3}s`,animationDuration:'2s'}}/>
          ))}
        </div>

        {/* Country breakdown */}
        <div className="grid md:grid-cols-2 gap-8 mb-10">
          <div>
            <h3 className="font-serif text-xl text-earth mb-5">Top Countries</h3>
            <div className="space-y-3">
              {topCountries.map(([country, count]) => (
                <div key={country} className="flex items-center gap-3">
                  <span className="text-sm text-earth/70 w-32">{country}</span>
                  <div className="flex-1 h-2 bg-earth/8 rounded-full overflow-hidden">
                    <div className="project-progress h-full" style={{width:`${(count/pins.length)*100}%`}}/>
                  </div>
                  <span className="text-xs font-bold text-earth/60 w-8 text-right">{count}</span>
                </div>
              ))}
            </div>
          </div>
          <div>
            <h3 className="font-serif text-xl text-earth mb-5">Recent Members</h3>
            <div className="space-y-2">
              {isLoading ? [1,2,3,4].map(i=><div key={i} className="h-12 bg-earth/5 rounded-xl animate-pulse"/>)
                : pins?.slice(0,6).map(p => (
                <div key={p.id} className="flex items-center gap-3 p-3 bg-white rounded-xl border border-black/5">
                  <div className="w-9 h-9 rounded-full bg-earth flex items-center justify-center text-gold text-xs font-bold">{p.display_name?.[0]}</div>
                  <div>
                    <div className="text-sm font-semibold text-earth">{p.display_name}</div>
                    <div className="text-xs text-earth/40">{p.city}, {p.country}</div>
                  </div>
                  <i className="fas fa-map-pin text-gold/40 ml-auto text-xs"/>
                </div>
              ))}
              {!pins?.length && !isLoading && <div className="text-earth/30 text-sm text-center py-6">No pins yet — be the first!</div>}
            </div>
          </div>
        </div>

        {/* Stats */}
        <div className="bg-gradient-to-br from-earth to-earth-light rounded-2xl p-8 text-center">
          <div className="font-cinzel text-5xl text-gold font-black mb-2">{pins?.length || 0}</div>
          <div className="text-cream/60 text-sm tracking-widest uppercase mb-1">Community members mapped</div>
          <div className="text-cream/40 text-xs">across {Object.keys(byCountry).length} countries worldwide</div>
        </div>
      </div>

      {/* Add pin modal */}
      {addPin && (
        <div className="modal-overlay" onClick={e=>e.target===e.currentTarget&&setAddPin(false)}>
          <div className="modal-box max-w-md animate-slide-up">
            <div className="p-6 border-b border-black/8 flex justify-between items-center">
              <h2 className="font-serif text-xl text-earth">Add Your Location</h2>
              <button onClick={()=>setAddPin(false)} className="w-9 h-9 rounded-full bg-black/5 flex items-center justify-center text-earth/50"><i className="fas fa-times"/></button>
            </div>
            <form onSubmit={handleSubmit(d=>addMut.mutate(d))} className="p-6 space-y-4">
              <div><label className="label">Display Name</label><input {...register('display_name',{required:true})} placeholder="e.g. Jean Kenfack" className="input"/></div>
              <div className="grid grid-cols-2 gap-3">
                <div><label className="label">City</label><input {...register('city',{required:true})} placeholder="Paris" className="input"/></div>
                <div><label className="label">Country</label><input {...register('country',{required:true})} placeholder="France" className="input"/></div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div><label className="label">Latitude</label><input type="number" step="any" {...register('latitude',{required:true})} placeholder="48.8566" className="input"/></div>
                <div><label className="label">Longitude</label><input type="number" step="any" {...register('longitude',{required:true})} placeholder="2.3522" className="input"/></div>
              </div>
              <p className="text-earth/40 text-xs">Find coordinates at <a href="https://maps.google.com" target="_blank" className="text-gold hover:underline">maps.google.com</a></p>
              <button type="submit" disabled={addMut.isLoading} className="btn-gold w-full justify-center text-sm">
                {addMut.isLoading?<><i className="fas fa-spinner animate-spin"/> Adding...</>:<><i className="fas fa-map-pin"/> Add My Pin</>}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
