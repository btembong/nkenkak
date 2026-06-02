import { useState, useEffect } from 'react'
import { NavLink, Outlet, Link, useLocation } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import { useQuery } from 'react-query'
import api from '../../services/api'
import PushNotificationButton from '../common/PushNotificationButton'
import { cn } from '../../lib/utils'
import { Avatar, AvatarFallback } from '../ui/avatar'
import { Badge } from '../ui/badge'
import { Separator } from '../ui/separator'

const PORTAL_NAV = [
  { to: '/portal',               icon: 'fa-home',           label: 'Dashboard',       exact: true },
  { to: '/portal/profile',       icon: 'fa-user',           label: 'My Profile'                   },
  { to: '/portal/donations',     icon: 'fa-heart',          label: 'My Donations'                 },
  { to: '/portal/events',        icon: 'fa-calendar-check', label: 'My Events'                    },
  { to: '/portal/volunteer',     icon: 'fa-hands-helping',  label: 'Volunteer Status'             },
  { to: '/portal/hours',         icon: 'fa-clock',          label: 'Volunteer Hours'              },
  { to: '/portal/notifications', icon: 'fa-bell',           label: 'Notifications'                },
  { to: '/portal/messages',      icon: 'fa-comment-dots',   label: 'Messages'                     },
  { to: '/projects',             icon: 'fa-seedling',       label: 'Browse Projects'              },
  { to: '/forum',                icon: 'fa-comments',       label: 'Community Forum'              },
  { to: '/news',                 icon: 'fa-newspaper',      label: 'Village News'                 },
]

const BOTTOM_TABS = [
  { to: '/portal',               icon: 'fa-home',  label: 'Home',    exact: true },
  { to: '/portal/donations',     icon: 'fa-heart', label: 'Donate'              },
  { to: '/portal/notifications', icon: 'fa-bell',  label: 'Alerts'              },
  { to: '/portal/profile',       icon: 'fa-user',  label: 'Profile'             },
]

export default function PortalLayout() {
  const { user, logout } = useAuth()
  const location = useLocation()
  const [drawerOpen, setDrawerOpen] = useState(false)

  useEffect(() => setDrawerOpen(false), [location])

  const { data: unread = 0 } = useQuery('notif-count-portal',
    () => api.get('/notifications').then(r => r.data.filter(n => !n.isRead).length),
    { enabled: !!user, refetchInterval: 60000 }
  )

  const currentPage = PORTAL_NAV.find(n =>
    n.exact ? location.pathname === '/portal' : location.pathname.startsWith(n.to) && n.to !== '/portal'
  )?.label || 'Dashboard'

  const initials = `${user?.firstName?.[0] || ''}${user?.lastName?.[0] || ''}`

  const navLink = (item) => ({ isActive }) => cn(
    'flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 relative',
    isActive
      ? 'bg-gold/12 text-gold border-l-[3px] border-gold pl-[9px]'
      : 'text-white/50 hover:bg-gold/8 hover:text-gold'
  )

  const SidebarInner = () => (
    <>
      {/* Logo */}
      <div className="px-4 py-5 border-b border-white/5">
        <Link to="/" className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 bg-gradient-to-br from-primary-500 to-primary-light shadow-purple">
            <i className="fas fa-mountain-city text-sm text-gold"/>
          </div>
          <div>
            <div className="font-bold text-white text-sm leading-tight">My Portal</div>
            <div className="text-[9px] uppercase tracking-[2px] text-gold/60">Member Dashboard</div>
          </div>
        </Link>
      </div>

      {/* User */}
      <div className="px-4 py-4 border-b border-white/5">
        <div className="flex items-center gap-3">
          <Avatar className="w-10 h-10 rounded-2xl flex-shrink-0">
            <AvatarFallback className="rounded-2xl bg-gradient-to-br from-gold to-gold-light text-white font-bold text-sm">
              {initials}
            </AvatarFallback>
          </Avatar>
          <div className="min-w-0">
            <div className="text-xs font-semibold truncate text-white">{user?.firstName} {user?.lastName}</div>
            <div className="text-[9px] capitalize text-gold/70">{user?.role}</div>
          </div>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 p-3 space-y-0.5 overflow-y-auto">
        {PORTAL_NAV.map(item => (
          <NavLink key={item.to} to={item.to} end={item.exact} className={navLink(item)}>
            <i className={`fas ${item.icon} text-sm w-5 text-center flex-shrink-0`}/>
            <span className="flex-1">{item.label}</span>
            {item.to === '/portal/notifications' && unread > 0 && (
              <span className="text-[9px] font-bold px-1.5 py-0.5 rounded-full bg-gold text-white min-w-[18px] text-center">
                {unread > 9 ? '9+' : unread}
              </span>
            )}
          </NavLink>
        ))}
      </nav>

      {/* Bottom */}
      <Separator className="bg-white/5"/>
      <div className="p-3 space-y-1">
        <div className="px-1">
          <PushNotificationButton dark className="!w-full !justify-start !rounded-xl !px-3 !py-2.5 !text-sm"/>
        </div>
        <Link to="/"
          className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-white/50 hover:bg-gold/8 hover:text-gold transition-all">
          <i className="fas fa-globe text-sm w-5 text-center"/>View Site
        </Link>
        {user?.role === 'admin' && (
          <Link to="/admin"
            className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-gold/70 hover:bg-gold/8 hover:text-gold transition-all">
            <i className="fas fa-cog text-sm w-5 text-center"/>Admin Panel
          </Link>
        )}
        <button onClick={logout}
          className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium w-full text-left text-white/50 hover:bg-red-500/10 hover:text-red-400 transition-all">
          <i className="fas fa-sign-out-alt text-sm w-5 text-center"/>Logout
        </button>
      </div>
    </>
  )

  return (
    <div className="flex min-h-screen bg-primary-50/50">

      {/* Desktop sidebar */}
      <aside className="hidden md:flex w-56 flex-shrink-0 flex-col sticky top-0 h-screen bg-gradient-to-b from-dark to-primary-darker">
        <SidebarInner/>
      </aside>

      {/* Mobile drawer */}
      {drawerOpen && (
        <div className="md:hidden fixed inset-0 z-50 flex">
          <div className="absolute inset-0 bg-dark/75 backdrop-blur-sm" onClick={() => setDrawerOpen(false)}/>
          <div className="relative w-72 max-w-[85vw] h-full flex flex-col overflow-y-auto bg-gradient-to-b from-dark to-primary-darker">
            <div className="flex items-center justify-between px-5 py-5 border-b border-white/5">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl flex items-center justify-center bg-gradient-to-br from-primary-500 to-primary-light">
                  <i className="fas fa-mountain-city text-sm text-gold"/>
                </div>
                <div>
                  <div className="font-bold text-white text-sm">My Portal</div>
                  <div className="text-[9px] uppercase tracking-[2px] text-gold/60">Member Dashboard</div>
                </div>
              </div>
              <button onClick={() => setDrawerOpen(false)}
                className="w-9 h-9 rounded-full flex items-center justify-center bg-white/8 text-white/70 hover:bg-white/15 transition-colors">
                <i className="fas fa-times"/>
              </button>
            </div>

            {/* User */}
            <div className="px-5 py-4 border-b border-white/5">
              <div className="flex items-center gap-3">
                <Avatar className="w-12 h-12 rounded-2xl flex-shrink-0">
                  <AvatarFallback className="rounded-2xl bg-gradient-to-br from-gold to-gold-light text-white font-bold">
                    {initials}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <div className="text-sm font-semibold text-white">{user?.firstName} {user?.lastName}</div>
                  <div className="text-xs capitalize text-gold/70">{user?.role}</div>
                </div>
              </div>
            </div>

            <nav className="flex-1 p-4 space-y-1">
              {PORTAL_NAV.map(item => (
                <NavLink key={item.to} to={item.to} end={item.exact}
                  className={({ isActive }) => cn(
                    'flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all relative',
                    isActive
                      ? 'bg-gold/12 text-gold border-l-[3px] border-gold pl-[13px]'
                      : 'text-white/50 hover:bg-gold/8 hover:text-gold'
                  )}>
                  <i className={`fas ${item.icon} text-sm w-5 text-center`}/>
                  <span className="flex-1">{item.label}</span>
                  {item.to === '/portal/notifications' && unread > 0 && (
                    <span className="text-[9px] font-bold px-1.5 py-0.5 rounded-full bg-gold text-white">
                      {unread > 9 ? '9+' : unread}
                    </span>
                  )}
                </NavLink>
              ))}
            </nav>

            <Separator className="bg-white/5"/>
            <div className="p-4 space-y-2">
              <PushNotificationButton dark className="!w-full !justify-start !rounded-xl !px-4 !py-3 !text-sm"/>
              <Link to="/"
                className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium text-white/50 hover:bg-gold/8 hover:text-gold transition-all">
                <i className="fas fa-globe w-5 text-center"/>View Site
              </Link>
              {user?.role === 'admin' && (
                <Link to="/admin"
                  className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium text-gold/70 hover:bg-gold/8 hover:text-gold transition-all">
                  <i className="fas fa-cog w-5 text-center"/>Admin Panel
                </Link>
              )}
              <button onClick={logout}
                className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium w-full text-left text-white/50 hover:bg-red-500/10 hover:text-red-400 transition-all">
                <i className="fas fa-sign-out-alt w-5 text-center"/>Logout
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Main */}
      <div className="flex-1 flex flex-col overflow-hidden min-w-0">
        {/* Topbar */}
        <header className="bg-white border-b border-border px-4 md:px-8 py-3 md:py-4 flex items-center justify-between flex-shrink-0 shadow-sm">
          <div className="flex items-center gap-3 min-w-0">
            <button onClick={() => setDrawerOpen(true)}
              className="md:hidden w-9 h-9 rounded-xl flex items-center justify-center bg-primary-50 text-primary-500 flex-shrink-0">
              <i className="fas fa-bars text-sm"/>
            </button>
            <div className="min-w-0">
              <h1 className="font-bold text-base md:text-lg truncate text-dark">{currentPage}</h1>
              <div className="text-xs items-center gap-1 hidden sm:flex text-muted-foreground">
                <Link to="/portal" className="hover:text-primary-500 transition-colors">Portal</Link>
                {currentPage !== 'Dashboard' && (
                  <>
                    <i className="fas fa-chevron-right text-[8px]"/>
                    <span>{currentPage}</span>
                  </>
                )}
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <PushNotificationButton className="hidden sm:flex !text-xs !py-2 !px-3"/>
            <Link to="/portal/notifications"
              className="relative w-9 h-9 rounded-xl flex items-center justify-center hover:bg-primary-50 transition-colors text-primary-500">
              <i className="fas fa-bell text-sm"/>
              {unread > 0 && (
                <span className="absolute top-0.5 right-0.5 w-4 h-4 rounded-full text-[9px] font-bold text-white flex items-center justify-center bg-gold">
                  {unread > 9 ? '9+' : unread}
                </span>
              )}
            </Link>
            <Link to="/"
              className="hidden sm:flex items-center gap-1.5 text-xs font-semibold text-primary-500 hover:underline">
              <i className="fas fa-globe text-xs"/>View Site
            </Link>
          </div>
        </header>

        <main className="flex-1 overflow-auto p-4 md:p-8 pb-24 md:pb-8">
          <Outlet/>
        </main>
      </div>

      {/* Mobile bottom tab bar */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 z-40 flex bg-white border-t border-border shadow-[0_-4px_20px_rgba(91,45,142,0.08)]">
        {BOTTOM_TABS.map(tab => (
          <NavLink key={tab.to} to={tab.to} end={tab.exact}
            className="flex-1 flex flex-col items-center justify-center py-2.5 gap-1 transition-colors relative">
            {({ isActive }) => (
              <>
                {isActive && (
                  <div className="absolute top-0 left-1/4 right-1/4 h-0.5 rounded-full bg-primary-500"/>
                )}
                <div className={cn(
                  'w-8 h-8 rounded-xl flex items-center justify-center transition-all',
                  isActive ? 'bg-primary-50' : 'bg-transparent'
                )}>
                  <i className={cn(
                    `fas ${tab.icon} text-sm`,
                    isActive ? 'text-primary-500' : 'text-muted-foreground'
                  )}/>
                  {tab.to === '/portal/notifications' && unread > 0 && (
                    <span className="absolute top-1.5 right-1/4 w-3.5 h-3.5 rounded-full text-[8px] font-bold text-white flex items-center justify-center bg-gold">
                      {unread > 9 ? '9' : unread}
                    </span>
                  )}
                </div>
                <span className={cn(
                  'text-[10px] font-semibold',
                  isActive ? 'text-primary-500' : 'text-muted-foreground'
                )}>
                  {tab.label}
                </span>
              </>
            )}
          </NavLink>
        ))}
        <button onClick={() => setDrawerOpen(true)}
          className="flex-1 flex flex-col items-center justify-center py-2.5 gap-1">
          <div className="w-8 h-8 rounded-xl flex items-center justify-center">
            <i className="fas fa-grip-horizontal text-sm text-muted-foreground"/>
          </div>
          <span className="text-[10px] font-semibold text-muted-foreground">More</span>
        </button>
      </div>
    </div>
  )
}
