import { useState, useEffect } from 'react'
import { NavLink, Outlet, Link, useLocation } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import { useQuery } from 'react-query'
import api from '../../services/api'
import PushNotificationButton from '../common/PushNotificationButton'

const PORTAL_NAV = [
  { to:'/portal',               icon:'fa-home',           label:'Dashboard',        exact:true  },
  { to:'/portal/profile',       icon:'fa-user',           label:'My Profile'                    },
  { to:'/portal/donations',     icon:'fa-heart',          label:'My Donations'                  },
  { to:'/portal/events',        icon:'fa-calendar-check', label:'My Events'                     },
  { to:'/portal/volunteer',     icon:'fa-hands-helping',  label:'Volunteer Status'              },
  { to:'/portal/hours',         icon:'fa-clock',          label:'Volunteer Hours'               },
  { to:'/portal/notifications', icon:'fa-bell',           label:'Notifications'                 },
  { to:'/portal/messages',      icon:'fa-comment-dots',   label:'Messages'                      },
  { to:'/projects',             icon:'fa-seedling',       label:'Browse Projects'               },
  { to:'/forum',                icon:'fa-comments',       label:'Community Forum'               },
  { to:'/news',                 icon:'fa-newspaper',      label:'Village News'                  },
]

// Items shown in mobile bottom tab bar
const BOTTOM_TABS = [
  { to:'/portal',               icon:'fa-home',           label:'Home',    exact:true },
  { to:'/portal/donations',     icon:'fa-heart',          label:'Donate'             },
  { to:'/portal/notifications', icon:'fa-bell',           label:'Alerts'             },
  { to:'/portal/profile',       icon:'fa-user',           label:'Profile'            },
]

export default function PortalLayout() {
  const { user, logout } = useAuth()
  const location = useLocation()
  const [drawerOpen, setDrawerOpen] = useState(false)

  // Close drawer on navigation
  useEffect(() => setDrawerOpen(false), [location])

  const { data: unread = 0 } = useQuery('notif-count-portal',
    () => api.get('/notifications').then(r => r.data.filter(n => !n.isRead).length),
    { enabled: !!user, refetchInterval: 60000 }
  )

  const currentPage = PORTAL_NAV.find(n =>
    n.exact ? location.pathname === '/portal' : location.pathname.startsWith(n.to) && n.to !== '/portal'
  )?.label || 'Dashboard'

  return (
    <div className="flex min-h-screen" style={{ background: '#F3EEF9' }}>

      {/* ── Desktop sidebar ── */}
      <aside className="hidden md:flex w-56 flex-shrink-0 flex-col sticky top-0 h-screen"
        style={{ background: 'linear-gradient(180deg,#1A0A35,#250F47)' }}>
        {/* Logo */}
        <div className="px-4 py-5" style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
          <Link to="/" className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0"
              style={{ background: 'linear-gradient(135deg,#5B2D8E,#7B4DB8)' }}>
              <i className="fas fa-heart text-sm" style={{ color: '#F0A500' }}/>
            </div>
            <div>
              <div className="font-display font-bold text-white text-sm leading-tight">My Portal</div>
              <div className="text-[9px] uppercase tracking-[2px]" style={{ color: 'rgba(240,165,0,0.6)' }}>Member Dashboard</div>
            </div>
          </Link>
        </div>

        {/* User avatar */}
        <div className="px-4 py-4" style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl flex items-center justify-center text-white font-bold text-sm flex-shrink-0"
              style={{ background: 'linear-gradient(135deg,#F0A500,#FFB84D)' }}>
              {user?.firstName?.[0]}{user?.lastName?.[0]}
            </div>
            <div className="min-w-0">
              <div className="text-xs font-semibold truncate text-white">{user?.firstName} {user?.lastName}</div>
              <div className="text-[9px] capitalize" style={{ color: 'rgba(240,165,0,0.7)' }}>{user?.role}</div>
            </div>
          </div>
        </div>

        {/* Nav */}
        <nav className="flex-1 p-3 space-y-0.5 overflow-y-auto">
          {PORTAL_NAV.map(item => (
            <NavLink key={item.to} to={item.to} end={item.exact}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 relative ${isActive ? 'sidebar-link-active' : 'sidebar-link'}`
              }>
              <i className={`fas ${item.icon} text-sm w-5 text-center`}/>
              {item.label}
              {item.to === '/portal/notifications' && unread > 0 && (
                <span className="ml-auto text-[9px] font-bold px-1.5 py-0.5 rounded-full min-w-[18px] text-center"
                  style={{ background: '#F0A500', color: '#fff' }}>
                  {unread > 9 ? '9+' : unread}
                </span>
              )}
            </NavLink>
          ))}
        </nav>

        {/* Bottom */}
        <div className="p-3 space-y-1" style={{ borderTop: '1px solid rgba(255,255,255,0.06)' }}>
          {user?.role === 'admin' && (
            <Link to="/admin"
              className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all sidebar-link">
              <i className="fas fa-cog text-sm w-5 text-center"/>Admin Panel
            </Link>
          )}
          <button onClick={logout}
            className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium w-full text-left transition-all sidebar-link hover:!text-red-400">
            <i className="fas fa-sign-out-alt text-sm w-5 text-center"/>Logout
          </button>
        </div>
      </aside>

      {/* ── Mobile drawer overlay ── */}
      {drawerOpen && (
        <div className="md:hidden fixed inset-0 z-50 flex">
          {/* Backdrop */}
          <div className="absolute inset-0" style={{ background: 'rgba(10,4,28,0.75)', backdropFilter: 'blur(8px)' }}
            onClick={() => setDrawerOpen(false)}/>
          {/* Drawer */}
          <div className="relative w-72 max-w-[85vw] h-full flex flex-col overflow-y-auto"
            style={{ background: 'linear-gradient(180deg,#1A0A35,#250F47)' }}>
            {/* Header */}
            <div className="flex items-center justify-between px-5 py-5"
              style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl flex items-center justify-center"
                  style={{ background: 'linear-gradient(135deg,#5B2D8E,#7B4DB8)' }}>
                  <i className="fas fa-heart text-sm" style={{ color: '#F0A500' }}/>
                </div>
                <div>
                  <div className="font-display font-bold text-white text-sm">My Portal</div>
                  <div className="text-[9px] uppercase tracking-[2px]" style={{ color: 'rgba(240,165,0,0.6)' }}>Member Dashboard</div>
                </div>
              </div>
              <button onClick={() => setDrawerOpen(false)}
                className="w-9 h-9 rounded-full flex items-center justify-center"
                style={{ background: 'rgba(255,255,255,0.08)', color: 'rgba(255,255,255,0.7)' }}>
                <i className="fas fa-times"/>
              </button>
            </div>

            {/* User info */}
            <div className="px-5 py-4" style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl flex items-center justify-center text-white font-bold flex-shrink-0"
                  style={{ background: 'linear-gradient(135deg,#F0A500,#FFB84D)' }}>
                  {user?.firstName?.[0]}{user?.lastName?.[0]}
                </div>
                <div>
                  <div className="text-sm font-semibold text-white">{user?.firstName} {user?.lastName}</div>
                  <div className="text-xs capitalize" style={{ color: 'rgba(240,165,0,0.7)' }}>{user?.role}</div>
                </div>
              </div>
            </div>

            {/* Nav items */}
            <nav className="flex-1 p-4 space-y-1">
              {PORTAL_NAV.map(item => (
                <NavLink key={item.to} to={item.to} end={item.exact}
                  className={({ isActive }) =>
                    `flex items-center gap-3 px-4 py-3 rounded-2xl text-sm font-medium transition-all relative ${isActive ? 'sidebar-link-active' : 'sidebar-link'}`
                  }>
                  <i className={`fas ${item.icon} text-sm w-5 text-center`}/>
                  {item.label}
                  {item.to === '/portal/notifications' && unread > 0 && (
                    <span className="ml-auto text-[9px] font-bold px-1.5 py-0.5 rounded-full"
                      style={{ background: '#F0A500', color: '#fff' }}>
                      {unread > 9 ? '9+' : unread}
                    </span>
                  )}
                </NavLink>
              ))}
            </nav>

            {/* Bottom actions */}
            <div className="p-4 space-y-2" style={{ borderTop: '1px solid rgba(255,255,255,0.06)' }}>
              {/* Push notification toggle */}
              <div className="px-1">
                <PushNotificationButton dark className="!w-full !justify-start !rounded-2xl !px-4 !py-3 !text-sm"/>
              </div>
              <Link to="/"
                className="flex items-center gap-3 px-4 py-3 rounded-2xl text-sm font-medium sidebar-link">
                <i className="fas fa-globe w-5 text-center"/>View Site
              </Link>
              {user?.role === 'admin' && (
                <Link to="/admin"
                  className="flex items-center gap-3 px-4 py-3 rounded-2xl text-sm font-medium sidebar-link">
                  <i className="fas fa-cog w-5 text-center"/>Admin Panel
                </Link>
              )}
              <button onClick={logout}
                className="flex items-center gap-3 px-4 py-3 rounded-2xl text-sm font-medium w-full text-left sidebar-link hover:!text-red-400">
                <i className="fas fa-sign-out-alt w-5 text-center"/>Logout
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Main content area ── */}
      <div className="flex-1 flex flex-col overflow-hidden min-w-0">

        {/* Top bar */}
        <header className="bg-white px-4 md:px-8 py-3 md:py-4 flex items-center justify-between flex-shrink-0"
          style={{ borderBottom: '1px solid rgba(91,45,142,0.08)', boxShadow: '0 1px 8px rgba(91,45,142,0.05)' }}>
          <div className="flex items-center gap-3 min-w-0">
            {/* Mobile hamburger */}
            <button onClick={() => setDrawerOpen(true)}
              className="md:hidden w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0"
              style={{ background: 'rgba(91,45,142,0.07)', color: '#5B2D8E' }}>
              <i className="fas fa-bars text-sm"/>
            </button>
            <div className="min-w-0">
              <h1 className="font-display font-bold text-base md:text-lg truncate" style={{ color: '#1A0A35' }}>{currentPage}</h1>
              <div className="text-xs flex items-center gap-1 hidden sm:flex" style={{ color: '#A3A3A3', fontFamily: 'Poppins,sans-serif' }}>
                <Link to="/portal" className="hover:underline" style={{ color: '#5B2D8E' }}>Portal</Link>
                {currentPage !== 'Dashboard' && (
                  <><i className="fas fa-chevron-right text-[8px]"/>
                    <span style={{ color: '#A3A3A3' }}>{currentPage}</span></>
                )}
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <PushNotificationButton className="hidden sm:flex !text-xs !py-2 !px-3"/>
            <Link to="/portal/notifications"
              className="relative w-9 h-9 rounded-xl flex items-center justify-center transition-colors hover:bg-primary-50"
              style={{ color: '#5B2D8E' }}>
              <i className="fas fa-bell text-sm"/>
              {unread > 0 && (
                <span className="absolute top-0.5 right-0.5 w-4 h-4 rounded-full text-[9px] font-bold text-white flex items-center justify-center"
                  style={{ background: '#F0A500' }}>
                  {unread > 9 ? '9+' : unread}
                </span>
              )}
            </Link>
            <Link to="/"
              className="hidden sm:flex items-center gap-1.5 text-xs font-semibold hover:underline"
              style={{ color: '#5B2D8E', fontFamily: 'Sora,sans-serif' }}>
              <i className="fas fa-globe text-xs"/>View Site
            </Link>
          </div>
        </header>

        {/* Page content — extra bottom padding on mobile for tab bar */}
        <main className="flex-1 overflow-auto p-4 md:p-8 pb-24 md:pb-8">
          <Outlet/>
        </main>
      </div>

      {/* ── Mobile bottom tab bar ── */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 z-40 flex"
        style={{ background: '#fff', borderTop: '1px solid rgba(91,45,142,0.1)', boxShadow: '0 -4px 20px rgba(91,45,142,0.08)' }}>
        {BOTTOM_TABS.map(tab => (
          <NavLink key={tab.to} to={tab.to} end={tab.exact}
            className="flex-1 flex flex-col items-center justify-center py-2.5 gap-1 transition-colors relative">
            {({ isActive }) => (
              <>
                <div className="w-8 h-8 rounded-xl flex items-center justify-center transition-all"
                  style={{ background: isActive ? 'rgba(91,45,142,0.1)' : 'transparent' }}>
                  <i className={`fas ${tab.icon} text-sm`}
                    style={{ color: isActive ? '#5B2D8E' : '#A3A3A3' }}/>
                  {tab.to === '/portal/notifications' && unread > 0 && (
                    <span className="absolute top-1.5 right-1/4 w-3.5 h-3.5 rounded-full text-[8px] font-bold text-white flex items-center justify-center"
                      style={{ background: '#F0A500' }}>
                      {unread > 9 ? '9' : unread}
                    </span>
                  )}
                </div>
                <span className="text-[10px] font-semibold"
                  style={{ color: isActive ? '#5B2D8E' : '#A3A3A3', fontFamily: 'Sora,sans-serif' }}>
                  {tab.label}
                </span>
                {isActive && (
                  <div className="absolute top-0 left-1/4 right-1/4 h-0.5 rounded-full"
                    style={{ background: '#5B2D8E' }}/>
                )}
              </>
            )}
          </NavLink>
        ))}
        {/* More button */}
        <button onClick={() => setDrawerOpen(true)}
          className="flex-1 flex flex-col items-center justify-center py-2.5 gap-1">
          <div className="w-8 h-8 rounded-xl flex items-center justify-center">
            <i className="fas fa-grip-horizontal text-sm" style={{ color: '#A3A3A3' }}/>
          </div>
          <span className="text-[10px] font-semibold" style={{ color: '#A3A3A3', fontFamily: 'Sora,sans-serif' }}>More</span>
        </button>
      </div>
    </div>
  )
}
