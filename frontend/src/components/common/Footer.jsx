import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { useQuery } from 'react-query'
import api from '../../services/api'
import { ChevronUp, Send, CheckCircle2, ArrowRight, MapPin, Phone, Mail, ChevronRight, Image } from 'lucide-react'

const EXPLORE = [
  { l:'About Us',          h:'/culture' },
  { l:'Our Projects',      h:'/projects' },
  { l:'News & Updates',    h:'/news' },
  { l:'Upcoming Events',   h:'/events' },
  { l:'Gallery',           h:'/gallery' },
  { l:'Contact Us',        h:'/contact' },
]

const COMMUNITY = [
  { l:'Diaspora Network',  h:'/diaspora' },
  { l:'Forum',             h:'/forum' },
  { l:'Volunteers',        h:'/volunteers' },
  { l:'Scholarships',      h:'/scholarships' },
  { l:'Business Directory',h:'/directory' },
  { l:'Mentorship',        h:'/mentorship' },
]

const SOCIALS = [
  { icon:'fab fa-facebook-f',  href:'#', label:'Facebook' },
  { icon:'fab fa-youtube',     href:'#', label:'YouTube' },
  { icon:'fab fa-instagram',   href:'#', label:'Instagram' },
  { icon:'fab fa-whatsapp',    href:'#', label:'WhatsApp' },
]

export default function Footer({ onDonate }) {
  const [email, setEmail]   = useState('')
  const [done,  setDone]    = useState(false)
  const [showTop, setShowTop] = useState(false)

  const { data: galleryData } = useQuery('footer-gallery',
    () => api.get('/gallery?limit=6').then(r => r.data?.items || r.data || []),
    { staleTime: 5 * 60 * 1000 }
  )
  const galleryImages = Array.isArray(galleryData) ? galleryData.slice(0, 6) : []

  useEffect(() => {
    const onScroll = () => setShowTop(window.scrollY > 400)
    window.addEventListener('scroll', onScroll)
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  const subscribe = async (e) => {
    e.preventDefault()
    try { await api.post('/newsletter/subscribe', { email }); setDone(true) } catch {}
  }

  return (
    <>
      {showTop && (
        <button
          onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
          className="fixed bottom-6 right-6 z-50 w-11 h-11 rounded-2xl flex items-center justify-center shadow-lg transition-all hover:scale-110 bg-gradient-to-br from-primary-500 to-primary-light text-white"
          title="Back to top">
          <ChevronUp className="w-4 h-4"/>
        </button>
      )}

      <footer>
        {/* Subscribe bar */}
        <div className="relative py-14 px-6 bg-gradient-to-br from-[#2d004e] to-primary-500">
          <div className="absolute inset-0 opacity-20 overflow-hidden"
            style={{backgroundImage:"url('https://www.transparenttextures.com/patterns/cubes.png')"}}/>
          <div className="relative max-w-4xl mx-auto flex flex-col md:flex-row items-center gap-8">
            <div className="flex items-center gap-4 flex-shrink-0">
              <div className="w-14 h-14 rounded-2xl flex items-center justify-center bg-gold/15 border border-gold/30">
                <Send className="w-6 h-6 text-gold"/>
              </div>
              <div>
                <h3 className="font-display font-bold text-2xl text-white">Stay Connected</h3>
                <p className="text-sm text-white/60">Get village news &amp; updates in your inbox</p>
              </div>
            </div>
            {done ? (
              <div className="flex-1 flex items-center justify-center gap-2 font-semibold text-base text-gold">
                <CheckCircle2 className="w-5 h-5"/>Thank you for subscribing!
              </div>
            ) : (
              <form onSubmit={subscribe} className="flex w-full flex-1 max-w-md">
                <input type="email" value={email} onChange={e=>setEmail(e.target.value)} required
                  placeholder="Enter your email address"
                  className="flex-1 px-5 py-4 rounded-l-2xl text-sm outline-none bg-white/10 border border-white/15 border-r-0 text-white placeholder:text-white/40"/>
                <button type="submit"
                  className="px-6 py-4 rounded-r-2xl font-bold text-sm whitespace-nowrap flex items-center gap-2 transition-opacity hover:opacity-90 bg-gradient-to-br from-[#eeb549] to-[#f5cc77]" style={{ color: '#2d004e' }}>
                  Subscribe <ArrowRight className="w-3 h-3"/>
                </button>
              </form>
            )}
          </div>
        </div>

        {/* Main footer */}
        <div className="py-16 px-6 bg-dark">
          <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12">

            {/* Brand */}
            <div className="lg:col-span-1">
              <img src="https://res.cloudinary.com/dmxnsttmu/image/upload/c_trim,w_220/v1778254134/nkek-logo_jdaxf8.png"
                alt="Nkenkak-Ngiesang Development Council"
                className="mb-5 block"
                style={{width:'100%', maxWidth:'200px', height:'auto', filter:'brightness(0) invert(1)'}}
                onError={e => { e.target.style.display='none'; e.target.nextSibling.style.display='block' }}
              />
              <div style={{display:'none'}} className="mb-5">
                <div className="font-display font-bold text-white text-base">Nkenkak-Ngiesang</div>
                <div className="text-[9px] uppercase tracking-[3px] text-gold">Development Council</div>
              </div>

              <p className="text-sm leading-relaxed mb-5 text-white/50">
                Uniting the Nkenkak-Ngiesang community — at home and in the diaspora — through culture, development, and shared heritage.
              </p>

              {/* Social icons — brand icons stay as FA */}
              <div className="flex items-center gap-2 mb-6">
                {SOCIALS.map(s => (
                  <a key={s.label} href={s.href} target="_blank" rel="noopener noreferrer"
                    title={s.label}
                    className="w-9 h-9 rounded-xl flex items-center justify-center text-sm transition-all hover:scale-110 bg-white/[0.07] text-white/60 border border-white/[0.08]">
                    <i className={s.icon}/>
                  </a>
                ))}
              </div>

              {/* Contact info */}
              <ul className="space-y-3 text-sm">
                <li className="flex items-start gap-3">
                  <MapPin className="w-4 h-4 mt-0.5 flex-shrink-0 text-gold"/>
                  <span className="text-white/55">Nkenkak-Ngiesang, West Region, Cameroon</span>
                </li>
                <li className="flex items-center gap-3">
                  <Phone className="w-4 h-4 flex-shrink-0 text-gold"/>
                  <a href="tel:+237600000000" className="transition-colors hover:text-white text-white/55">+237 6XX XXX XXX</a>
                </li>
                <li className="flex items-center gap-3">
                  <Mail className="w-4 h-4 flex-shrink-0 text-gold"/>
                  <a href="mailto:contact@nkenkak-ngiesang.cm" className="transition-colors hover:text-white text-white/55">contact@nkenkak-ngiesang.cm</a>
                </li>
              </ul>
            </div>

            {/* Explore */}
            <div>
              <h4 className="font-display font-bold text-white mb-4">Explore</h4>
              <div className="h-0.5 w-8 mb-5 rounded-full bg-gradient-to-r from-gold to-transparent"/>
              <ul className="space-y-3">
                {EXPLORE.map(l => (
                  <li key={l.l}>
                    <Link to={l.h} className="text-sm flex items-center gap-2 transition-colors group text-white/55">
                      <ChevronRight className="w-3 h-3 transition-transform group-hover:translate-x-0.5 text-gold"/>
                      <span className="group-hover:text-white transition-colors">{l.l}</span>
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* Community */}
            <div>
              <h4 className="font-display font-bold text-white mb-4">Community</h4>
              <div className="h-0.5 w-8 mb-5 rounded-full bg-gradient-to-r from-gold to-transparent"/>
              <ul className="space-y-3">
                {COMMUNITY.map(l => (
                  <li key={l.l}>
                    <Link to={l.h} className="text-sm flex items-center gap-2 transition-colors group text-white/55">
                      <ChevronRight className="w-3 h-3 transition-transform group-hover:translate-x-0.5 text-gold"/>
                      <span className="group-hover:text-white transition-colors">{l.l}</span>
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* Gallery */}
            <div>
              <h4 className="font-display font-bold text-white mb-4">Our Gallery</h4>
              <div className="h-0.5 w-8 mb-5 rounded-full bg-gradient-to-r from-gold to-transparent"/>
              <div className="grid grid-cols-3 gap-2 mb-4">
                {galleryImages.length > 0
                  ? galleryImages.map((img, i) => (
                      <Link key={i} to="/gallery"
                        className="aspect-square rounded-xl overflow-hidden block transition-all hover:opacity-80 hover:scale-105 bg-[#430075]">
                        <img src={img.url || img.imageUrl} alt={img.title || 'Gallery'}
                          className="w-full h-full object-cover"/>
                      </Link>
                    ))
                  : Array.from({length:6}).map((_, i) => (
                      <Link key={i} to="/gallery"
                        className="aspect-square rounded-xl overflow-hidden flex items-center justify-center transition-all hover:opacity-80"
                        style={{background:`linear-gradient(135deg,${['#2d004e,#4b0082','#4b0082,#a57fc0','#430075,#4b0082','#4b0082,#a57fc0','#2d004e,#4b0082','#430075,#a57fc0'][i]})`}}>
                        <Image className="w-4 h-4 text-gold/35"/>
                      </Link>
                    ))
                }
              </div>
              <Link to="/gallery" className="inline-flex items-center gap-1.5 text-xs font-semibold transition-colors hover:text-white text-gold">
                View Full Gallery <ArrowRight className="w-3 h-3"/>
              </Link>
            </div>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="px-6 py-4 bg-[#120728] border-t border-white/5">
          <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3">
            <p className="text-xs text-white/40">
              © {new Date().getFullYear()} Nkenkak-Ngiesang Development Council. All rights reserved.
            </p>
            <div className="flex items-center gap-4 text-xs">
              <Link to="/faq" className="transition-colors hover:text-white text-white/40">FAQ</Link>
              <span className="text-white/15">·</span>
              <Link to="/contact" className="transition-colors hover:text-white text-white/40">Contact</Link>
              <span className="text-white/15">·</span>
              <Link to="/portal" className="transition-colors hover:text-white text-white/40">Member Portal</Link>
            </div>
          </div>
        </div>
      </footer>
    </>
  )
}
