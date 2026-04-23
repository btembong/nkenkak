import { useState, useEffect, useRef } from 'react'
import { Link, NavLink, useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import { useQuery } from 'react-query'
import api from '../../services/api'

const NAV = [
  { label:'Culture',   href:'/culture',  icon:'fa-masks-theater',
    sub:[{label:'Heritage & Traditions',href:'/culture'},{label:'Gallery',href:'/gallery'},{label:'Diaspora Map',href:'/diaspora'}] },
  { label:'Projects',  href:'/projects', icon:'fa-seedling',
    sub:[{label:'All Projects',href:'/projects'},{label:'Education',href:'/projects?cat=education'},{label:'Health',href:'/projects?cat=health'},{label:'Infrastructure',href:'/projects?cat=infrastructure'},{label:'Environment',href:'/projects?cat=environment'}] },
  { label:'Events',    href:'/events',   icon:'fa-calendar' },
  { label:'Community', href:'/forum',    icon:'fa-users',
    sub:[{label:'Forum',href:'/forum'},{label:'Team',href:'/team'},{label:'Diaspora Map',href:'/diaspora'}] },
  { label:'News',      href:'/news',     icon:'fa-newspaper' },
  { label:'Contact',   href:'/contact',  icon:'fa-envelope' },
]

export default function Navbar({ onDonate }) {
  const { user, logout, isAdmin } = useAuth()
  const navigate = useNavigate()
  const [scrolled,   setScrolled]   = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)
  const [userMenu,   setUserMenu]   = useState(false)
  const [annHidden,  setAnnHidden]  = useState(false)
  const userRef = useRef(null)

  const { data: notifCount } = useQuery('notif-count',
    () => api.get('/notifications').then(r => r.data.filter(n => !n.is_read).length),
    { enabled: !!user, refetchInterval: 60000 }
  )

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 60)
    window.addEventListener('scroll', onScroll)
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  useEffect(() => {
    const h = (e) => { if (userRef.current && !userRef.current.contains(e.target)) setUserMenu(false) }
    document.addEventListener('mousedown', h)
    return () => document.removeEventListener('mousedown', h)
  }, [])

  const handleLogout = async () => { await logout(); navigate('/') }

  return (
    <>
      {/* Announcement bar — purple gradient */}
      {!annHidden && (
        <div style={{background:'linear-gradient(90deg,#2E1578,#4520A8,#2E1578)'}} className="text-center py-2.5 px-4 text-xs tracking-widest flex items-center justify-center gap-4 relative">
          <i className="fas fa-crown" style={{color:'#D4AF37'}}/>
          <span style={{color:'rgba(248,244,255,0.9)'}}>
            🌿 Harvest Festival — April 28! &nbsp;
            <button onClick={onDonate} style={{color:'#D4AF37'}} className="font-bold underline">Donate to support →</button>
          </span>
          <button onClick={() => setAnnHidden(true)} className="absolute right-4 text-purple-300/50 hover:text-purple-100">
            <i className="fas fa-times"/>
          </button>
        </div>
      )}

      {/* Main nav */}
      <nav className={`sticky top-0 z-40 transition-all duration-300 ${scrolled ? 'shadow-2xl' : ''}`}
        style={{background: scrolled ? 'rgba(18,8,46,0.97)' : 'rgba(26,10,80,0.92)', backdropFilter:'blur(16px)'}}>
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex items-center justify-between py-3">

            {/* Logo */}
            <Link to="/" className="flex items-center gap-3 group">
              <div className="w-11 h-11 rounded-full flex items-center justify-center font-cinzel font-black text-ink text-sm border-2 group-hover:scale-105 transition-transform"
                style={{background:'linear-gradient(135deg,#D4AF37,#F0D060,#A07820)', borderColor:'rgba(240,208,96,0.4)'}}>
                NN
              </div>
              <div className="hidden sm:block">
                <div style={{fontFamily:"'Cinzel',serif", color:'#D4AF37'}} className="text-sm font-bold leading-tight tracking-wider">Nkenkak-Ngiesang</div>
                <div style={{color:'rgba(212,175,55,0.45)'}} className="text-[9px] tracking-[3px] uppercase">Village Community</div>
              </div>
            </Link>

            {/* Desktop nav */}
            <ul className="hidden lg:flex items-center">
              {NAV.map(item => (
                <li key={item.href} className="relative group">
                  <NavLink to={item.href} className={({isActive}) => `nav-link ${isActive?'!text-gold':''}`}>
                    {item.label}
                    {item.sub && <i className="fas fa-chevron-down text-[8px] transition-transform group-hover:rotate-180"/>}
                  </NavLink>
                  {item.sub && (
                    <div className="absolute top-full left-1/2 -translate-x-1/2 rounded-xl min-w-[200px] py-2 opacity-0 invisible group-hover:opacity-100 group-hover:visible translate-y-2 group-hover:translate-y-0 transition-all duration-200 shadow-2xl"
                      style={{background:'rgba(18,8,46,0.98)', backdropFilter:'blur(20px)', border:'1px solid rgba(212,175,55,0.12)'}}>
                      {item.sub.map(s => (
                        <Link key={s.href} to={s.href}
                          className="block px-5 py-2.5 text-xs tracking-wide transition-all border-l-2 border-transparent hover:border-gold"
                          style={{color:'rgba(248,244,255,0.65)'}}
                          onMouseEnter={e => e.currentTarget.style.color='#D4AF37'}
                          onMouseLeave={e => e.currentTarget.style.color='rgba(248,244,255,0.65)'}>
                          {s.label}
                        </Link>
                      ))}
                    </div>
                  )}
                </li>
              ))}
            </ul>

            {/* Right */}
            <div className="flex items-center gap-2">
              <button onClick={onDonate} className="hidden sm:flex btn-gold !py-2.5 !px-5 !text-xs">
                <i className="fas fa-heart"/> Donate
              </button>

              {user ? (
                <div className="flex items-center gap-2">
                  <Link to="/portal/notifications" className="relative p-2 transition-colors" style={{color:'rgba(248,244,255,0.5)'}}
                    onMouseEnter={e=>e.currentTarget.style.color='#D4AF37'} onMouseLeave={e=>e.currentTarget.style.color='rgba(248,244,255,0.5)'}>
                    <i className="fas fa-bell text-lg"/>
                    {notifCount > 0 && (
                      <span className="absolute top-1 right-1 w-4 h-4 text-ink text-[9px] font-black rounded-full flex items-center justify-center"
                        style={{background:'#D4AF37'}}>{notifCount > 9 ? '9+' : notifCount}</span>
                    )}
                  </Link>
                  <div className="relative" ref={userRef}>
                    <button onClick={() => setUserMenu(!userMenu)} className="flex items-center gap-2 p-1.5 rounded-xl hover:bg-white/5 transition-colors">
                      <div className="w-8 h-8 rounded-full flex items-center justify-center text-ink text-xs font-black"
                        style={{background:'linear-gradient(135deg,#D4AF37,#A07820)'}}>
                        {user.first_name?.[0]}{user.last_name?.[0]}
                      </div>
                      <span className="hidden md:block text-xs font-semibold" style={{color:'rgba(248,244,255,0.8)'}}>{user.first_name}</span>
                      <i className={`fas fa-chevron-down text-[8px] transition-transform`} style={{color:'rgba(212,175,55,0.5)', transform:userMenu?'rotate(180deg)':''}}/>
                    </button>
                    {userMenu && (
                      <div className="absolute right-0 top-full mt-2 w-52 py-2 rounded-xl shadow-2xl animate-slide-up"
                        style={{background:'rgba(18,8,46,0.98)', border:'1px solid rgba(212,175,55,0.12)', backdropFilter:'blur(20px)'}}>
                        <div className="px-4 py-3 border-b" style={{borderColor:'rgba(255,255,255,0.05)'}}>
                          <div className="text-sm font-semibold" style={{color:'#F8F4FF'}}>{user.first_name} {user.last_name}</div>
                          <div className="text-xs mt-0.5 capitalize" style={{color:'rgba(212,175,55,0.6)'}}>{user.role}</div>
                        </div>
                        {[
                          {to:'/portal',label:'My Dashboard',icon:'fa-tachometer-alt'},
                          {to:'/portal/profile',label:'Profile',icon:'fa-user'},
                          {to:'/portal/donations',label:'My Donations',icon:'fa-heart'},
                        ].map(i=>(
                          <Link key={i.to} to={i.to} onClick={()=>setUserMenu(false)}
                            className="flex items-center gap-3 px-4 py-2.5 text-xs transition-all"
                            style={{color:'rgba(248,244,255,0.6)'}}
                            onMouseEnter={e=>e.currentTarget.style.color='#D4AF37'}
                            onMouseLeave={e=>e.currentTarget.style.color='rgba(248,244,255,0.6)'}>
                            <i className={`fas ${i.icon} w-4`}/>{i.label}
                          </Link>
                        ))}
                        {isAdmin && (
                          <Link to="/admin" onClick={()=>setUserMenu(false)}
                            className="flex items-center gap-3 px-4 py-2.5 text-xs transition-all border-t mt-1"
                            style={{color:'#D4AF37', borderColor:'rgba(255,255,255,0.05)'}}>
                            <i className="fas fa-cog w-4"/> Admin Panel
                          </Link>
                        )}
                        <button onClick={handleLogout}
                          className="flex items-center gap-3 px-4 py-2.5 text-xs transition-all w-full border-t mt-1"
                          style={{color:'rgba(248,244,255,0.4)', borderColor:'rgba(255,255,255,0.05)'}}
                          onMouseEnter={e=>e.currentTarget.style.color='#ff6b6b'}
                          onMouseLeave={e=>e.currentTarget.style.color='rgba(248,244,255,0.4)'}>
                          <i className="fas fa-sign-out-alt w-4"/> Logout
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              ) : (
                <div className="hidden sm:flex items-center gap-2">
                  <Link to="/login" className="text-xs font-semibold tracking-wider px-3 py-2 transition-colors" style={{color:'rgba(248,244,255,0.6)'}}
                    onMouseEnter={e=>e.currentTarget.style.color='#D4AF37'} onMouseLeave={e=>e.currentTarget.style.color='rgba(248,244,255,0.6)'}>Login</Link>
                  <Link to="/register" className="btn-gold !py-2.5 !px-4 !text-xs">Join Us</Link>
                </div>
              )}

              <button onClick={() => setMobileOpen(true)} className="lg:hidden p-2" style={{color:'#D4AF37'}}>
                <i className="fas fa-bars text-xl"/>
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Mobile menu */}
      {mobileOpen && (
        <div className="fixed inset-0 z-50 flex flex-col" style={{background:'rgba(10,4,28,0.98)', backdropFilter:'blur(20px)'}}>
          <div className="flex items-center justify-between px-6 py-4 border-b" style={{borderColor:'rgba(212,175,55,0.1)'}}>
            <span style={{fontFamily:"'Cinzel',serif", color:'#D4AF37'}} className="font-bold">Menu</span>
            <button onClick={() => setMobileOpen(false)} className="text-xl" style={{color:'rgba(248,244,255,0.6)'}}><i className="fas fa-times"/></button>
          </div>
          <div className="flex-1 overflow-y-auto py-6 px-6 flex flex-col gap-1">
            {NAV.map(item => (
              <Link key={item.href} to={item.href} onClick={() => setMobileOpen(false)}
                className="flex items-center gap-3 py-3.5 font-semibold tracking-wider uppercase text-sm border-b"
                style={{color:'rgba(248,244,255,0.75)', borderColor:'rgba(255,255,255,0.05)'}}>
                <i className={`fas ${item.icon} w-5 text-center`} style={{color:'rgba(212,175,55,0.5)'}}/>
                {item.label}
              </Link>
            ))}
            {user ? (
              <>
                <Link to="/portal" onClick={()=>setMobileOpen(false)} className="flex items-center gap-3 py-3.5 font-bold tracking-wider uppercase text-sm border-b" style={{color:'#D4AF37',borderColor:'rgba(255,255,255,0.05)'}}>
                  <i className="fas fa-tachometer-alt w-5"/> Dashboard
                </Link>
                <button onClick={()=>{handleLogout();setMobileOpen(false)}} className="flex items-center gap-3 py-3.5 font-semibold text-sm" style={{color:'rgba(248,244,255,0.4)'}}>
                  <i className="fas fa-sign-out-alt w-5"/> Logout
                </button>
              </>
            ) : (
              <div className="flex flex-col gap-3 mt-6">
                <Link to="/login" onClick={()=>setMobileOpen(false)} className="btn-royal w-full justify-center"><i className="fas fa-sign-in-alt"/> Login</Link>
                <Link to="/register" onClick={()=>setMobileOpen(false)} className="btn-gold w-full justify-center"><i className="fas fa-user-plus"/> Join the Community</Link>
              </div>
            )}
            <button onClick={()=>{onDonate();setMobileOpen(false)}} className="btn-gold w-full justify-center mt-3"><i className="fas fa-heart"/> Donate Now</button>
          </div>
        </div>
      )}
    </>
  )
}
