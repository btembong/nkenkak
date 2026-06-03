import { useState, useEffect, useRef } from 'react'
import { Link, NavLink, useNavigate, useLocation } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import { useLanguage } from '../../context/LanguageContext'
import { useQuery } from 'react-query'
import api from '../../services/api'
import SearchModal from './SearchModal'
import { cn } from '../../lib/utils'
import { Button } from '../ui/button'
import { Avatar, AvatarFallback } from '../ui/avatar'
import { Separator } from '../ui/separator'
import { Badge } from '../ui/badge'
import {
  Mail, MapPin, ChevronDown, Search, Bell, HeartHandshake, X,
  Globe, LogOut, Settings, LayoutDashboard, User, LogIn,
} from 'lucide-react'

export default function Navbar({ onDonate }) {
  const { user, logout, isAdmin } = useAuth()
  const { lang, toggle: toggleLang, t } = useLanguage()
  const navigate  = useNavigate()
  const location  = useLocation()
  const [scrolled,   setScrolled]   = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)
  const [userMenu,   setUserMenu]   = useState(false)
  const [searchOpen, setSearchOpen] = useState(false)
  const userRef = useRef(null)

  useEffect(() => {
    const fn = e => { if ((e.ctrlKey || e.metaKey) && e.key === 'k') { e.preventDefault(); setSearchOpen(true) } }
    window.addEventListener('keydown', fn)
    return () => window.removeEventListener('keydown', fn)
  }, [])

  const { data: notifCount } = useQuery('notif-count',
    () => api.get('/notifications').then(r => r.data.filter(n => !n.isRead).length),
    { enabled: !!user, refetchInterval: 60000 }
  )

  useEffect(() => {
    const fn = () => setScrolled(window.scrollY > 60)
    window.addEventListener('scroll', fn)
    return () => window.removeEventListener('scroll', fn)
  }, [])

  useEffect(() => {
    const fn = e => { if (userRef.current && !userRef.current.contains(e.target)) setUserMenu(false) }
    document.addEventListener('mousedown', fn)
    return () => document.removeEventListener('mousedown', fn)
  }, [])

  useEffect(() => setMobileOpen(false), [location])

  const handleLogout = async () => { await logout(); setUserMenu(false); navigate('/') }

  const initials = `${user?.firstName?.[0] || ''}${user?.lastName?.[0] || ''}`

  const NAV_ITEMS = [
    { label: t('home'),     href: '/' },
    { label: t('aboutUs'),  href: '/culture',
      sub: [
        { l: t('aboutUs'),       h: '/culture' },
        { l: t('anthropology'),  h: '/anthropology' },
        { l: 'Our Language',     h: '/language' },
        { l: 'Governance',       h: '/governance' },
        { l: 'Village Map',      h: '/village-map' },
      ]
    },
    { label: t('causes'),   href: '/projects',
      sub: [
        { l: t('allProjects'),   h: '/projects' },
        { l: t('education'),     h: '/projects?cat=education' },
        { l: t('health'),        h: '/projects?cat=health' },
        { l: t('infra'),         h: '/projects?cat=infrastructure' },
      ]
    },
    { label: t('pages'),    href: '#',
      sub: [
        { l: t('ourTeam'),           h: '/team' },
        { l: t('gallery'),           h: '/gallery' },
        { l: t('diaspora'),          h: '/diaspora' },
        { l: t('volunteers'),        h: '/volunteers' },
        { l: 'Notices',              h: '/notices' },
        { l: 'Documents',            h: '/documents' },
        { l: 'Scholarships',         h: '/scholarships' },
        { l: 'Transparency',         h: '/transparency' },
        { l: 'Memorial',             h: '/memorial' },
        { l: 'Directory',            h: '/directory' },
        { l: 'Mentorship',           h: '/mentorship' },
        { l: 'Cultural Calendar',    h: '/cultural-calendar' },
        { l: 'Community Chat',       h: '/chat' },
        { l: 'Petitions',            h: '/petitions' },
        { l: 'Jobs & Classifieds',   h: '/jobs' },
        { l: 'Knowledge Wiki',       h: '/wiki' },
        { l: 'Village Budget',       h: '/budget' },
        { l: 'Elections',            h: '/elections' },
        { l: 'Live Meetings',        h: '/live' },
      ]
    },
    { label: t('events'),   href: '/events' },
    { label: t('news'),     href: '/news' },
    { label: t('contact'),  href: '/contact' },
  ]

  return (
    <>
      {/* Top bar */}
      <div className="hidden md:flex items-center justify-between px-8 py-2 text-xs bg-dark text-white/65">
        <div className="flex items-center gap-6">
          <a href="mailto:contact@nkenkak-ngiesang.cm"
            className="flex items-center gap-1.5 hover:text-white transition-colors">
            <Mail className="w-3 h-3 text-gold"/>
            contact@nkenkak-ngiesang.cm
          </a>
          <span className="flex items-center gap-1.5">
            <MapPin className="w-3 h-3 text-gold"/>
            Nkenkak-Ngiesang, South West Region, Cameroon
          </span>
        </div>
        <div className="flex items-center gap-3">
          {['fab fa-facebook-f','fab fa-twitter','fab fa-linkedin-in','fab fa-youtube'].map(ic => (
            <a key={ic} href="#"
              className="w-6 h-6 rounded-full flex items-center justify-center hover:bg-white/10 transition-colors text-xs">
              <i className={ic}/>
            </a>
          ))}
          <button onClick={toggleLang}
            className="flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider text-gold border border-gold/30 hover:bg-white/10 transition-all">
            <Globe className="w-3 h-3"/>
            {lang === 'en' ? 'FR' : 'EN'}
          </button>
        </div>
      </div>

      {/* Main nav */}
      <nav className={cn(
        'sticky top-0 z-40 bg-white transition-all duration-300',
        scrolled ? 'shadow-card border-b border-border' : 'border-b border-transparent'
      )}>
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="flex items-center justify-between h-16 md:h-24">

            {/* Logo */}
            <Link to="/" className="flex items-center gap-2 flex-shrink-0">
              <img
                src="https://res.cloudinary.com/dmxnsttmu/image/upload/v1778254134/nkek-logo_jdaxf8.png"
                alt="Nkenkak-Ngiesang Development Council"
                className="h-14 md:h-28 lg:h-32 w-auto object-contain"
                onError={e => { e.target.style.display = 'none'; e.target.nextSibling.style.display = 'flex' }}
              />
              <div style={{ display: 'none' }} className="items-center gap-3">
                <div className="w-11 h-11 rounded-2xl flex items-center justify-center bg-gradient-to-br from-primary-500 to-primary-light">
                  <HeartHandshake className="w-5 h-5 text-gold"/>
                </div>
                <div>
                  <div className="font-bold text-base leading-tight text-dark">Nkenkak-Ngiesang</div>
                  <div className="text-[9px] font-semibold uppercase tracking-[3px] text-gold">Development Council</div>
                </div>
              </div>
            </Link>

            {/* Desktop nav links */}
            <div className="hidden lg:flex items-center gap-1">
              {NAV_ITEMS.map(item => (
                <div key={item.label} className="relative group">
                  {item.sub ? (
                    <button className="nav-item flex items-center gap-1 px-3 py-2 rounded-xl hover:bg-primary-50">
                      {item.label}
                      <ChevronDown className="w-3 h-3 text-primary-500 transition-transform group-hover:rotate-180"/>
                    </button>
                  ) : (
                    <NavLink to={item.href}
                      className={({ isActive }) => cn(
                        'nav-item block px-3 py-2 rounded-xl hover:bg-primary-50',
                        isActive && '!text-primary-500 font-semibold bg-primary-50'
                      )}>
                      {item.label}
                    </NavLink>
                  )}
                  {item.sub && (
                    <div className={cn(
                      'absolute top-full left-0 bg-white rounded-2xl min-w-[200px] max-h-80 overflow-y-auto py-2 z-50',
                      'opacity-0 invisible group-hover:opacity-100 group-hover:visible',
                      'translate-y-2 group-hover:translate-y-0 transition-all duration-200',
                      'shadow-card-lg border border-border'
                    )}>
                      {item.sub.map(s => (
                        <Link key={s.h} to={s.h}
                          className="block px-4 py-2.5 text-sm font-medium text-foreground/80 hover:bg-primary-50 hover:text-primary-600 border-l-2 border-transparent hover:border-primary-500 transition-all">
                          {s.l}
                        </Link>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>

            {/* Right side */}
            <div className="flex items-center gap-2">
              {/* Search */}
              <button onClick={() => setSearchOpen(true)}
                className="hidden md:flex items-center gap-2 px-3 py-2 rounded-xl text-sm text-muted-foreground hover:bg-primary-50 border border-border transition-colors">
                <Search className="w-3 h-3 text-primary-500"/>
                <span className="text-xs text-muted-foreground">{t('search')}</span>
                <kbd className="ml-1 px-1.5 py-0.5 rounded text-[9px] font-mono bg-muted text-muted-foreground hidden lg:inline">⌘K</kbd>
              </button>
              <button onClick={() => setSearchOpen(true)}
                className="md:hidden w-10 h-10 rounded-full flex items-center justify-center hover:bg-primary-50 transition-colors">
                <Search className="w-4 h-4 text-primary-500"/>
              </button>

              {user ? (
                <div className="flex items-center gap-2" ref={userRef}>
                  <Link to="/portal/notifications"
                    className="relative w-10 h-10 rounded-full flex items-center justify-center hover:bg-primary-50 transition-colors">
                    <Bell className="w-4 h-4 text-primary-500"/>
                    {notifCount > 0 && (
                      <span className="absolute -top-0.5 -right-0.5 w-4 h-4 rounded-full text-[9px] font-bold text-white flex items-center justify-center bg-gold">
                        {notifCount}
                      </span>
                    )}
                  </Link>
                  <button onClick={() => setUserMenu(!userMenu)}
                    className="flex items-center gap-2 px-3 py-2 rounded-full hover:bg-primary-50 transition-colors">
                    <Avatar className="w-8 h-8">
                      <AvatarFallback className="bg-gradient-to-br from-primary-500 to-primary-light text-white text-xs font-bold">
                        {initials}
                      </AvatarFallback>
                    </Avatar>
                    <span className="hidden md:block text-sm font-medium text-dark">{user.firstName}</span>
                    <ChevronDown className="w-3 h-3 text-primary-500"/>
                  </button>
                  {userMenu && (
                    <div className="absolute top-20 right-6 bg-white rounded-2xl w-52 py-2 shadow-card-lg z-50 animate-slide-up border border-border">
                      <div className="px-4 py-3 border-b border-border">
                        <div className="font-semibold text-sm text-dark">{user.firstName} {user.lastName}</div>
                        <div className="text-xs text-primary-500 capitalize">{user.role}</div>
                      </div>
                      {[
                        { to: '/portal',           l: 'My Dashboard', Icon: LayoutDashboard },
                        { to: '/portal/profile',   l: 'Profile',      Icon: User           },
                        { to: '/portal/donations', l: 'My Donations', Icon: HeartHandshake  },
                      ].map(item => (
                        <Link key={item.to} to={item.to} onClick={() => setUserMenu(false)}
                          className="flex items-center gap-3 px-4 py-2.5 text-sm text-foreground/80 hover:bg-primary-50 hover:text-primary-600 transition-colors">
                          <item.Icon className="w-4 h-4 text-primary-500"/>{item.l}
                        </Link>
                      ))}
                      {isAdmin && (
                        <Link to="/admin" onClick={() => setUserMenu(false)}
                          className="flex items-center gap-3 px-4 py-2.5 text-sm text-gold hover:bg-gold-50 transition-colors border-t border-border mt-1">
                          <Settings className="w-4 h-4"/>Admin Panel
                        </Link>
                      )}
                      <button onClick={handleLogout}
                        className="flex items-center gap-3 px-4 py-2.5 text-sm w-full text-red-600 hover:bg-red-50 transition-colors border-t border-border mt-1">
                        <LogOut className="w-4 h-4"/>Logout
                      </button>
                    </div>
                  )}
                </div>
              ) : (
                <Link to="/login"
                  className="hidden md:flex items-center gap-1.5 text-sm font-medium px-4 py-2 rounded-full hover:bg-primary-50 transition-colors text-primary-500">
                  {t('login')}
                </Link>
              )}

              <Button variant="gold" size="sm" rounded="full" onClick={onDonate} className="hidden sm:flex gap-2">
                <HeartHandshake className="w-4 h-4"/>
                {t('donateNow')}
              </Button>

              {/* Hamburger */}
              <button onClick={() => setMobileOpen(true)}
                className="lg:hidden w-10 h-10 flex flex-col items-center justify-center gap-1.5 rounded-xl hover:bg-primary-50 transition-colors">
                <span className="w-5 h-0.5 rounded-full bg-primary-500"/>
                <span className="w-5 h-0.5 rounded-full bg-primary-500"/>
                <span className="w-3 h-0.5 rounded-full bg-gold"/>
              </button>
            </div>
          </div>
        </div>
      </nav>

      {searchOpen && <SearchModal onClose={() => setSearchOpen(false)}/>}

      {/* Mobile menu */}
      {mobileOpen && (
        <div className="fixed inset-0 z-50 flex" style={{ background: 'rgba(45,0,78,0.95)', backdropFilter: 'blur(12px)' }}>
          <div className="flex-1 flex flex-col overflow-y-auto">
            <div className="flex items-center justify-between px-6 py-5 border-b border-white/10">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl flex items-center justify-center bg-gradient-to-br from-primary-500 to-primary-light">
                  <HeartHandshake className="w-5 h-5 text-gold"/>
                </div>
                <span className="font-bold text-white">Nkenkak-Ngiesang</span>
              </div>
              <button onClick={() => setMobileOpen(false)}
                className="w-9 h-9 rounded-full flex items-center justify-center hover:bg-white/10 transition-colors text-white/70">
                <X className="w-5 h-5"/>
              </button>
            </div>

            <div className="p-6 flex flex-col gap-1">
              {[
                { label: t('home'),          href: '/' },
                { label: t('aboutUs'),       href: '/culture' },
                { label: t('anthropology'),  href: '/anthropology' },
                { label: t('donation'),      href: '/projects' },
                { label: t('events'),        href: '/events' },
                { label: t('news'),          href: '/news' },
                { label: t('contact'),       href: '/contact' },
                { label: t('ourTeam'),       href: '/team' },
                { label: t('gallery'),       href: '/gallery' },
                { label: 'Notices',          href: '/notices' },
                { label: 'Documents',        href: '/documents' },
                { label: 'Mentorship',       href: '/mentorship' },
                { label: 'Directory',        href: '/directory' },
                { label: 'Community Chat',   href: '/chat' },
                { label: 'Petitions',        href: '/petitions' },
                { label: 'Jobs',             href: '/jobs' },
                { label: 'Wiki',             href: '/wiki' },
                { label: 'Budget',           href: '/budget' },
                { label: 'Elections',        href: '/elections' },
                { label: 'Live Meetings',    href: '/live' },
              ].map(item => (
                <Link key={item.href} to={item.href}
                  className="flex items-center gap-3 py-3 px-4 rounded-2xl text-sm font-medium text-white/80 hover:bg-white/8 border-b border-white/6 transition-colors">
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
                    <button onClick={handleLogout} className="text-sm font-medium text-red-400 text-center py-2">
                      {t('logout')}
                    </button>
                  </>
                )}
                <button onClick={() => { onDonate(); setMobileOpen(false) }} className="btn-gold w-full justify-center">
                  <HeartHandshake className="w-4 h-4"/>{t('donateNow')}
                </button>
                <button onClick={toggleLang}
                  className="flex items-center justify-center gap-2 py-2.5 rounded-2xl text-sm font-semibold text-gold border border-gold/30">
                  <Globe className="w-4 h-4"/>
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
