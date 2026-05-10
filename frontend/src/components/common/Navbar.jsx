import { useState, useEffect, useRef } from 'react'
import { Link, NavLink, useNavigate, useLocation } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import { useLanguage } from '../../context/LanguageContext'
import { useQuery } from 'react-query'
import api from '../../services/api'
import SearchModal from './SearchModal'

export default function Navbar({ onDonate }) {
  const { user, logout, isAdmin } = useAuth()
  const { lang, toggle: toggleLang, t } = useLanguage()
  const navigate  = useNavigate()
  const location  = useLocation()
  const [scrolled,    setScrolled]   = useState(false)
  const [mobileOpen,  setMobileOpen] = useState(false)
  const [userMenu,    setUserMenu]   = useState(false)
  const [searchOpen,  setSearchOpen] = useState(false)
  const userRef = useRef(null)

  /* Open search with Ctrl+K / Cmd+K */
  useEffect(() => {
    const fn = e => { if ((e.ctrlKey || e.metaKey) && e.key === 'k') { e.preventDefault(); setSearchOpen(true) } }
    window.addEventListener('keydown', fn)
    return () => window.removeEventListener('keydown', fn)
  }, [])

  const { data: notifCount } = useQuery('notif-count',
    () => api.get('/notifications').then(r => r.data.filter(n=>!n.isRead).length),
    { enabled:!!user, refetchInterval:60000 }
  )

  useEffect(() => {
    const fn = () => setScrolled(window.scrollY > 60)
    window.addEventListener('scroll', fn)
    return () => window.removeEventListener('scroll', fn)
  }, [])

  useEffect(() => {
    const fn = (e) => { if (userRef.current && !userRef.current.contains(e.target)) setUserMenu(false) }
    document.addEventListener('mousedown', fn)
    return () => document.removeEventListener('mousedown', fn)
  }, [])

  // Close mobile on route change
  useEffect(() => setMobileOpen(false), [location])

  const handleLogout = async () => { await logout(); setUserMenu(false); navigate('/') }

  return (
    <>
      {/* Top bar */}
      <div className="hidden md:flex items-center justify-between px-8 py-2 text-xs" style={{background:'#250F47', color:'rgba(255,255,255,0.65)'}}>
        <div className="flex items-center gap-6">
          <a href="mailto:contact@nkenkak-ngiesang.cm" className="flex items-center gap-1.5 hover:text-white transition-colors">
            <i className="fas fa-envelope text-gold-400" style={{color:'#F0A500'}}/> contact@nkenkak-ngiesang.cm
          </a>
          <span className="flex items-center gap-1.5">
            <i className="fas fa-map-marker-alt" style={{color:'#F0A500'}}/> Nkenkak-Ngiesang, West Region, Cameroon
          </span>
        </div>
        <div className="flex items-center gap-3">
          {['fab fa-facebook-f','fab fa-twitter','fab fa-linkedin-in','fab fa-youtube'].map(ic=>(
            <a key={ic} href="#" className="w-6 h-6 rounded-full flex items-center justify-center hover:bg-white/10 transition-colors text-xs"><i className={ic}/></a>
          ))}
          {/* Language toggle */}
          <button onClick={toggleLang}
            className="flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider transition-all hover:bg-white/10"
            style={{color:'#F0A500',border:'1px solid rgba(240,165,0,0.3)'}}>
            <i className="fas fa-globe text-[9px]"/>
            {lang === 'en' ? 'FR' : 'EN'}
          </button>
        </div>
      </div>

      {/* Main nav */}
      <nav className={`sticky top-0 z-40 transition-all duration-300 ${scrolled ? 'shadow-lg' : ''}`}
        style={{background:'#fff', borderBottom: scrolled ? '1px solid rgba(91,45,142,0.08)' : '1px solid transparent'}}>
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="flex items-center justify-between h-24">
            {/* Logo */}
            <Link to="/" className="flex items-center gap-2 flex-shrink-0">
              <img src="https://res.cloudinary.com/dmxnsttmu/image/upload/v1778254134/nkek-logo_jdaxf8.png" alt="Nkenkak-Ngiesang Development Council"
                className="w-auto object-contain" style={{ height: '8.5rem' }}
                onError={e => { e.target.style.display='none'; e.target.nextSibling.style.display='flex' }}
              />
              {/* Fallback text logo shown if image fails to load */}
              <div style={{display:'none'}} className="items-center gap-3">
                <div className="w-11 h-11 rounded-2xl flex items-center justify-center"
                  style={{background:'linear-gradient(135deg,#5B2D8E,#7B4DB8)'}}>
                  <i className="fas fa-heart text-base" style={{color:'#F0A500'}}/>
                </div>
                <div>
                  <div className="font-display font-bold text-base leading-tight" style={{color:'#1A0A35'}}>Nkenkak-Ngiesang</div>
                  <div className="text-[9px] font-semibold uppercase tracking-[3px]" style={{color:'#F0A500'}}>Development Council</div>
                </div>
              </div>
            </Link>

            {/* Desktop links */}
            <div className="hidden lg:flex items-center gap-1">
              {[
                { label:t('home'),     href:'/' },
                { label:t('aboutUs'), href:'/culture',
                  sub:[{l:t('aboutUs'),h:'/culture'},{l:t('anthropology'),h:'/anthropology'},{l:'Our Language',h:'/language'},{l:'Governance',h:'/governance'},{l:'Village Map',h:'/village-map'}] },
                { label:t('causes'), href:'/projects',
                  sub:[{l:t('allProjects'),h:'/projects'},{l:t('education'),h:'/projects?cat=education'},{l:t('health'),h:'/projects?cat=health'},{l:t('infra'),h:'/projects?cat=infrastructure'}] },
                { label:t('pages'), href:'#',
                  sub:[{l:t('ourTeam'),h:'/team'},{l:t('gallery'),h:'/gallery'},{l:'FAQ',h:'/faq'},{l:t('diaspora'),h:'/diaspora'},{l:t('volunteers'),h:'/volunteers'},{l:'Notices',h:'/notices'},{l:'Documents',h:'/documents'},{l:'Scholarships',h:'/scholarships'},{l:'Transparency',h:'/transparency'},{l:'Memorial',h:'/memorial'},{l:'Directory',h:'/directory'},{l:'Mentorship',h:'/mentorship'},{l:'Cultural Calendar',h:'/cultural-calendar'},{l:'Community Chat',h:'/chat'},{l:'Petitions',h:'/petitions'},{l:'Jobs & Classifieds',h:'/jobs'},{l:'Knowledge Wiki',h:'/wiki'},{l:'Village Budget',h:'/budget'},{l:'Elections',h:'/elections'},{l:'Live Meetings',h:'/live'}] },
                { label:t('events'),  href:'/events' },
                { label:t('news'),    href:'/news' },
                { label:t('contact'), href:'/contact' },
              ].map(item => (
                <div key={item.label} className="relative group">
                  {item.sub ? (
                    <button className="nav-item flex items-center gap-1 px-3 py-2 rounded-xl hover:bg-primary-50 font-body">
                      {item.label} <i className="fas fa-chevron-down text-[8px] transition-transform group-hover:rotate-180" style={{color:'#5B2D8E'}}/>
                    </button>
                  ) : (
                    <NavLink to={item.href} className={({isActive})=>`nav-item px-3 py-2 rounded-xl hover:bg-primary-50 font-body block ${isActive?'!text-primary-500 font-semibold bg-primary-50':''}`}>
                      {item.label}
                    </NavLink>
                  )}
                  {item.sub && (
                    <div className="absolute top-full left-0 bg-white rounded-2xl min-w-[200px] py-2 opacity-0 invisible group-hover:opacity-100 group-hover:visible translate-y-2 group-hover:translate-y-0 transition-all duration-200 z-50"
                      style={{boxShadow:'0 20px 60px rgba(91,45,142,0.15)', border:'1px solid rgba(91,45,142,0.08)'}}>
                      {item.sub.map(s=>(
                        <Link key={s.h} to={s.h}
                          className="block px-4 py-2.5 text-sm font-medium transition-all hover:bg-primary-50 hover:text-primary-600 border-l-2 border-transparent hover:border-primary-500"
                          style={{color:'#404040', fontFamily:'Poppins,sans-serif'}}>
                          {s.l}
                        </Link>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>

            {/* Right side */}
            <div className="flex items-center gap-3">
              {/* Search button */}
              <button onClick={() => setSearchOpen(true)}
                className="hidden md:flex items-center gap-2 px-3 py-2 rounded-xl text-sm transition-colors hover:bg-primary-50"
                style={{ color: '#737373', fontFamily: 'Poppins,sans-serif', border: '1px solid rgba(91,45,142,0.1)' }}>
                <i className="fas fa-search text-xs" style={{ color: '#5B2D8E' }} />
                <span className="text-xs" style={{ color: '#A3A3A3' }}>{t('search')}</span>
                <kbd className="ml-1 px-1.5 py-0.5 rounded text-[9px] font-mono hidden lg:inline"
                  style={{ background: 'rgba(91,45,142,0.06)', color: '#A3A3A3' }}>⌘K</kbd>
              </button>
              <button onClick={() => setSearchOpen(true)}
                className="md:hidden w-10 h-10 rounded-full flex items-center justify-center hover:bg-primary-50 transition-colors">
                <i className="fas fa-search text-sm" style={{ color: '#5B2D8E' }} />
              </button>

              {user ? (
                <div className="flex items-center gap-2" ref={userRef}>
                  <Link to="/portal/notifications" className="relative w-10 h-10 rounded-full flex items-center justify-center hover:bg-primary-50 transition-colors">
                    <i className="fas fa-bell text-sm" style={{color:'#5B2D8E'}}/>
                    {notifCount > 0 && <span className="absolute -top-0.5 -right-0.5 w-4 h-4 rounded-full text-[9px] font-bold text-white flex items-center justify-center" style={{background:'#F0A500'}}>{notifCount}</span>}
                  </Link>
                  <button onClick={() => setUserMenu(!userMenu)}
                    className="flex items-center gap-2 px-3 py-2 rounded-full hover:bg-primary-50 transition-colors">
                    <div className="w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-bold"
                      style={{background:'linear-gradient(135deg,#5B2D8E,#7B4DB8)'}}>
                      {user.firstName?.[0]}{user.lastName?.[0]}
                    </div>
                    <span className="hidden md:block text-sm font-medium" style={{color:'#1A0A35'}}>{user.firstName}</span>
                    <i className="fas fa-chevron-down text-[8px]" style={{color:'#5B2D8E'}}/>
                  </button>
                  {userMenu && (
                    <div className="absolute top-20 right-6 bg-white rounded-2xl w-52 py-2 shadow-card-lg z-50 animate-slide-up"
                      style={{border:'1px solid rgba(91,45,142,0.1)'}}>
                      <div className="px-4 py-3 border-b" style={{borderColor:'rgba(91,45,142,0.08)'}}>
                        <div className="font-semibold text-sm" style={{color:'#1A0A35'}}>{user.firstName} {user.lastName}</div>
                        <div className="text-xs capitalize" style={{color:'#5B2D8E'}}>{user.role}</div>
                      </div>
                      {[{to:'/portal',l:'My Dashboard',ic:'fa-tachometer-alt'},{to:'/portal/profile',l:'Profile',ic:'fa-user'},{to:'/portal/donations',l:'My Donations',ic:'fa-heart'}].map(i=>(
                        <Link key={i.to} to={i.to} onClick={()=>setUserMenu(false)}
                          className="flex items-center gap-3 px-4 py-2.5 text-sm hover:bg-primary-50 transition-colors" style={{color:'#404040', fontFamily:'Poppins,sans-serif'}}>
                          <i className={`fas ${i.ic} w-4 text-primary-500`} style={{color:'#5B2D8E'}}/>{i.l}
                        </Link>
                      ))}
                      {isAdmin && <Link to="/admin" onClick={()=>setUserMenu(false)} className="flex items-center gap-3 px-4 py-2.5 text-sm hover:bg-primary-50 transition-colors border-t mt-1" style={{color:'#F0A500',borderColor:'rgba(91,45,142,0.08)',fontFamily:'Poppins,sans-serif'}}><i className="fas fa-cog w-4"/>Admin Panel</Link>}
                      <button onClick={handleLogout} className="flex items-center gap-3 px-4 py-2.5 text-sm w-full hover:bg-red-50 transition-colors border-t mt-1" style={{color:'#dc2626',borderColor:'rgba(91,45,142,0.08)',fontFamily:'Poppins,sans-serif'}}><i className="fas fa-sign-out-alt w-4"/>Logout</button>
                    </div>
                  )}
                </div>
              ) : (
                <Link to="/login" className="hidden md:flex items-center gap-1.5 text-sm font-medium px-4 py-2 rounded-full hover:bg-primary-50 transition-colors" style={{color:'#5B2D8E',fontFamily:'Sora,sans-serif'}}>
                  {t('login')}
                </Link>
              )}

              {/* Donate CTA */}
              <button onClick={onDonate} className="btn-gold hidden sm:flex items-center gap-2 !py-2.5 !px-5">
                <i className="fas fa-camera text-xs"/> {t('donateNow')}
              </button>

              {/* Hamburger */}
              <button onClick={() => setMobileOpen(true)} className="lg:hidden w-10 h-10 flex flex-col items-center justify-center gap-1.5 rounded-xl hover:bg-primary-50 transition-colors">
                <span className="w-5 h-0.5 rounded-full transition-all" style={{background:'#5B2D8E'}}/>
                <span className="w-5 h-0.5 rounded-full transition-all" style={{background:'#5B2D8E'}}/>
                <span className="w-3 h-0.5 rounded-full transition-all" style={{background:'#F0A500'}}/>
              </button>
            </div>
          </div>
        </div>
      </nav>

      {searchOpen && <SearchModal onClose={() => setSearchOpen(false)} />}

      {/* Mobile menu */}
      {mobileOpen && (
        <div className="fixed inset-0 z-50 flex" style={{background:'rgba(26,10,53,0.95)', backdropFilter:'blur(12px)'}}>
          <div className="flex-1 flex flex-col overflow-y-auto">
            <div className="flex items-center justify-between px-6 py-5 border-b" style={{borderColor:'rgba(255,255,255,0.1)'}}>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl flex items-center justify-center" style={{background:'linear-gradient(135deg,#5B2D8E,#7B4DB8)'}}>
                  <i className="fas fa-heart" style={{color:'#F0A500'}}/>
                </div>
                <span className="font-display font-bold text-white">Nkenkak-Ngiesang</span>
              </div>
              <button onClick={()=>setMobileOpen(false)} className="w-9 h-9 rounded-full flex items-center justify-center hover:bg-white/10 transition-colors" style={{color:'rgba(255,255,255,0.7)'}}>
                <i className="fas fa-times text-lg"/>
              </button>
            </div>
            <div className="p-6 flex flex-col gap-1">
              {[
                {label:t('home'),href:'/'},{label:t('aboutUs'),href:'/culture'},
                {label:t('anthropology'),href:'/anthropology'},
                {label:t('donation'),href:'/projects'},{label:t('events'),href:'/events'},
                {label:t('news'),href:'/news'},{label:t('contact'),href:'/contact'},
                {label:t('ourTeam'),href:'/team'},{label:t('gallery'),href:'/gallery'},
                {label:'Notices',href:'/notices'},{label:'Documents',href:'/documents'},
                {label:'Mentorship',href:'/mentorship'},{label:'Directory',href:'/directory'},
                {label:'Community Chat',href:'/chat'},{label:'Petitions',href:'/petitions'},
                {label:'Jobs & Classifieds',href:'/jobs'},{label:'Wiki',href:'/wiki'},{label:'Budget',href:'/budget'},
                {label:'Elections',href:'/elections'},{label:'Live Meetings',href:'/live'},
              ].map(item => (
                <Link key={item.label} to={item.href}
                  className="flex items-center gap-3 py-3 px-4 rounded-2xl text-sm font-medium hover:bg-white/8 transition-colors border-b"
                  style={{color:'rgba(255,255,255,0.8)', borderColor:'rgba(255,255,255,0.06)', fontFamily:'Poppins,sans-serif'}}>
                  {item.label}
                </Link>
              ))}
              <div className="flex flex-col gap-3 mt-6">
                {!user ? (
                  <>
                    <Link to="/login" className="btn-outline-white w-full justify-center">{t('login')}</Link>
                    <Link to="/register" className="btn-secondary w-full justify-center">Join Community</Link>
                  </>
                ) : (
                  <>
                    <Link to="/portal" className="btn-secondary w-full justify-center">{t('myDashboard')}</Link>
                    <button onClick={handleLogout} className="text-sm font-medium text-red-400 text-center py-2">{t('logout')}</button>
                  </>
                )}
                <button onClick={()=>{onDonate();setMobileOpen(false)}} className="btn-gold w-full justify-center"><i className="fas fa-heart"/>{t('donateNow')}</button>
                <button onClick={toggleLang}
                  className="flex items-center justify-center gap-2 py-2.5 rounded-2xl text-sm font-semibold"
                  style={{color:'#F0A500',border:'1px solid rgba(240,165,0,0.3)',fontFamily:'Sora,sans-serif'}}>
                  <i className="fas fa-globe text-xs"/>
                  {lang === 'en' ? 'Passer en Français' : 'Switch to English'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
