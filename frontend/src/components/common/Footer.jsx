import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { useQuery } from 'react-query'
import api from '../../services/api'

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
  { icon:'fa-facebook-f',  href:'#', label:'Facebook' },
  { icon:'fa-youtube',     href:'#', label:'YouTube' },
  { icon:'fa-instagram',   href:'#', label:'Instagram' },
  { icon:'fa-whatsapp',    href:'#', label:'WhatsApp' },
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
      {/* Back to top */}
      {showTop && (
        <button
          onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
          className="fixed bottom-6 right-6 z-50 w-11 h-11 rounded-2xl flex items-center justify-center shadow-lg transition-all hover:scale-110"
          style={{background:'linear-gradient(135deg,#5B2D8E,#7B4DB8)', color:'#fff'}}
          title="Back to top">
          <i className="fas fa-chevron-up text-sm"/>
        </button>
      )}

      <footer>
        {/* Subscribe bar */}
        <div className="relative py-14 px-6" style={{background:'linear-gradient(135deg,#250F47,#5B2D8E)'}}>
          <div className="absolute inset-0 opacity-20 overflow-hidden"
            style={{backgroundImage:"url('https://www.transparenttextures.com/patterns/cubes.png')"}}/>
          <div className="relative max-w-4xl mx-auto flex flex-col md:flex-row items-center gap-8">
            <div className="flex items-center gap-4 flex-shrink-0">
              <div className="w-14 h-14 rounded-2xl flex items-center justify-center"
                style={{background:'rgba(240,165,0,0.15)', border:'1px solid rgba(240,165,0,0.3)'}}>
                <i className="fas fa-paper-plane text-xl" style={{color:'#F0A500'}}/>
              </div>
              <div>
                <h3 className="font-display font-bold text-2xl text-white">Stay Connected</h3>
                <p className="text-sm" style={{color:'rgba(255,255,255,0.6)',fontFamily:'Poppins,sans-serif'}}>Get village news & updates in your inbox</p>
              </div>
            </div>
            {done ? (
              <div className="flex-1 flex items-center justify-center gap-2 font-semibold text-base" style={{color:'#F0A500'}}>
                <i className="fas fa-check-circle text-xl"/>Thank you for subscribing!
              </div>
            ) : (
              <form onSubmit={subscribe} className="flex w-full flex-1 max-w-md">
                <input type="email" value={email} onChange={e=>setEmail(e.target.value)} required
                  placeholder="Enter your email address"
                  className="flex-1 px-5 py-4 rounded-l-2xl text-sm outline-none"
                  style={{background:'rgba(255,255,255,0.1)', border:'1px solid rgba(255,255,255,0.15)', borderRight:'none', color:'#fff', fontFamily:'Poppins,sans-serif'}}/>
                <button type="submit"
                  className="px-6 py-4 rounded-r-2xl font-bold text-sm whitespace-nowrap flex items-center gap-2 transition-opacity hover:opacity-90"
                  style={{background:'linear-gradient(135deg,#F0A500,#FFB84D)', color:'#1A0A35', fontFamily:'Sora,sans-serif'}}>
                  Subscribe <i className="fas fa-arrow-right text-xs"/>
                </button>
              </form>
            )}
          </div>
        </div>

        {/* Main footer */}
        <div className="py-16 px-6" style={{background:'#1A0A35'}}>
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
                <div className="text-[9px] uppercase tracking-[3px]" style={{color:'#F0A500'}}>Development Council</div>
              </div>

              <p className="text-sm leading-relaxed mb-5" style={{color:'rgba(255,255,255,0.5)', fontFamily:'Poppins,sans-serif'}}>
                Uniting the Nkenkak-Ngiesang community — at home and in the diaspora — through culture, development, and shared heritage.
              </p>

              {/* Social icons */}
              <div className="flex items-center gap-2 mb-6">
                {SOCIALS.map(s => (
                  <a key={s.label} href={s.href} target="_blank" rel="noopener noreferrer"
                    title={s.label}
                    className="w-9 h-9 rounded-xl flex items-center justify-center text-sm transition-all hover:scale-110"
                    style={{background:'rgba(255,255,255,0.07)', color:'rgba(255,255,255,0.6)', border:'1px solid rgba(255,255,255,0.08)'}}>
                    <i className={`fab ${s.icon}`}/>
                  </a>
                ))}
              </div>

              {/* Contact info */}
              <ul className="space-y-3 text-sm" style={{fontFamily:'Poppins,sans-serif'}}>
                <li className="flex items-start gap-3">
                  <i className="fas fa-map-marker-alt mt-0.5 flex-shrink-0" style={{color:'#F0A500'}}/>
                  <span style={{color:'rgba(255,255,255,0.55)'}}>Nkenkak-Ngiesang, West Region, Cameroon</span>
                </li>
                <li className="flex items-center gap-3">
                  <i className="fas fa-phone-alt flex-shrink-0" style={{color:'#F0A500'}}/>
                  <a href="tel:+237600000000" className="transition-colors hover:text-white" style={{color:'rgba(255,255,255,0.55)'}}>+237 6XX XXX XXX</a>
                </li>
                <li className="flex items-center gap-3">
                  <i className="fas fa-envelope flex-shrink-0" style={{color:'#F0A500'}}/>
                  <a href="mailto:contact@nkenkak-ngiesang.cm" className="transition-colors hover:text-white" style={{color:'rgba(255,255,255,0.55)'}}>contact@nkenkak-ngiesang.cm</a>
                </li>
              </ul>
            </div>

            {/* Explore */}
            <div>
              <h4 className="font-display font-bold text-white mb-4">Explore</h4>
              <div className="h-0.5 w-8 mb-5 rounded-full" style={{background:'linear-gradient(90deg,#F0A500,transparent)'}}/>
              <ul className="space-y-3" style={{fontFamily:'Poppins,sans-serif'}}>
                {EXPLORE.map(l => (
                  <li key={l.l}>
                    <Link to={l.h} className="text-sm flex items-center gap-2 transition-colors group"
                      style={{color:'rgba(255,255,255,0.55)'}}>
                      <i className="fas fa-chevron-right text-[8px] transition-transform group-hover:translate-x-0.5" style={{color:'#F0A500'}}/>
                      <span className="group-hover:text-white transition-colors">{l.l}</span>
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* Community */}
            <div>
              <h4 className="font-display font-bold text-white mb-4">Community</h4>
              <div className="h-0.5 w-8 mb-5 rounded-full" style={{background:'linear-gradient(90deg,#F0A500,transparent)'}}/>
              <ul className="space-y-3" style={{fontFamily:'Poppins,sans-serif'}}>
                {COMMUNITY.map(l => (
                  <li key={l.l}>
                    <Link to={l.h} className="text-sm flex items-center gap-2 transition-colors group"
                      style={{color:'rgba(255,255,255,0.55)'}}>
                      <i className="fas fa-chevron-right text-[8px] transition-transform group-hover:translate-x-0.5" style={{color:'#F0A500'}}/>
                      <span className="group-hover:text-white transition-colors">{l.l}</span>
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* Gallery */}
            <div>
              <h4 className="font-display font-bold text-white mb-4">Our Gallery</h4>
              <div className="h-0.5 w-8 mb-5 rounded-full" style={{background:'linear-gradient(90deg,#F0A500,transparent)'}}/>
              <div className="grid grid-cols-3 gap-2 mb-4">
                {galleryImages.length > 0
                  ? galleryImages.map((img, i) => (
                      <Link key={i} to="/gallery"
                        className="aspect-square rounded-xl overflow-hidden block transition-all hover:opacity-80 hover:scale-105"
                        style={{background:'#250F47'}}>
                        <img src={img.url || img.imageUrl} alt={img.title || 'Gallery'}
                          className="w-full h-full object-cover"/>
                      </Link>
                    ))
                  : Array.from({length:6}).map((_, i) => (
                      <Link key={i} to="/gallery"
                        className="aspect-square rounded-xl overflow-hidden flex items-center justify-center transition-all hover:opacity-80"
                        style={{background:`linear-gradient(135deg,${['#250F47,#5B2D8E','#5B2D8E,#7B4DB8','#3D1A6B,#5B2D8E','#4A2478,#7B4DB8','#2E1067,#5B2D8E','#6B4DB8,#9B6FD8'][i]})`}}>
                        <i className="fas fa-image text-sm" style={{color:'rgba(240,165,0,0.35)'}}/>
                      </Link>
                    ))
                }
              </div>
              <Link to="/gallery" className="inline-flex items-center gap-1.5 text-xs font-semibold transition-colors hover:text-white"
                style={{color:'#F0A500', fontFamily:'Sora,sans-serif'}}>
                View Full Gallery <i className="fas fa-arrow-right text-[10px]"/>
              </Link>
            </div>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="px-6 py-4" style={{background:'#120728', borderTop:'1px solid rgba(255,255,255,0.05)'}}>
          <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3">
            <p className="text-xs" style={{color:'rgba(255,255,255,0.4)', fontFamily:'Poppins,sans-serif'}}>
              © {new Date().getFullYear()} Nkenkak-Ngiesang Development Council. All rights reserved.
            </p>
            <div className="flex items-center gap-4 text-xs" style={{fontFamily:'Poppins,sans-serif'}}>
              <Link to="/faq" className="transition-colors hover:text-white" style={{color:'rgba(255,255,255,0.4)'}}>FAQ</Link>
              <span style={{color:'rgba(255,255,255,0.15)'}}>·</span>
              <Link to="/contact" className="transition-colors hover:text-white" style={{color:'rgba(255,255,255,0.4)'}}>Contact</Link>
              <span style={{color:'rgba(255,255,255,0.15)'}}>·</span>
              <Link to="/portal" className="transition-colors hover:text-white" style={{color:'rgba(255,255,255,0.4)'}}>Member Portal</Link>
            </div>
          </div>
        </div>
      </footer>
    </>
  )
}
