import { NavLink, Outlet, Link, useLocation } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import { useQuery } from 'react-query'
import api from '../../services/api'
import PushNotificationButton from '../common/PushNotificationButton'

const PORTAL_NAV = [
  { to:'/portal',                 icon:'fa-home',           label:'Dashboard',          exact:true },
  { to:'/portal/profile',         icon:'fa-user',           label:'My Profile'         },
  { to:'/portal/donations',       icon:'fa-heart',          label:'My Donations'       },
  { to:'/portal/events',          icon:'fa-calendar-check', label:'My Events'          },
  { to:'/portal/volunteer',       icon:'fa-hands-helping',  label:'Volunteer Status'   },
  { to:'/portal/hours',           icon:'fa-clock',          label:'Volunteer Hours'    },
  { to:'/portal/notifications',   icon:'fa-bell',           label:'Notifications'      },
  { to:'/portal/messages',        icon:'fa-comment-dots',   label:'Messages'           },
  { to:'/projects',               icon:'fa-seedling',       label:'Browse Projects'    },
  { to:'/forum',                  icon:'fa-comments',       label:'Community Forum'    },
  { to:'/news',                   icon:'fa-newspaper',      label:'Village News'       },
]

export default function PortalLayout() {
  const { user, logout } = useAuth()
  const location = useLocation()

  const { data: unread } = useQuery('notif-count-portal',
    () => api.get('/notifications').then(r => r.data.filter(n=>!n.isRead).length),
    { enabled:!!user, refetchInterval:60000 }
  )

  const currentPage = PORTAL_NAV.find(n =>
    n.exact ? location.pathname === '/portal' : location.pathname.startsWith(n.to) && n.to !== '/portal'
  )?.label || 'Dashboard'

  return (
    <div className="flex min-h-screen" style={{background:'#F3EEF9'}}>
      {/* Sidebar */}
      <aside className="w-56 flex-shrink-0 flex flex-col sticky top-0 h-screen"
        style={{background:'linear-gradient(180deg,#1A0A35,#250F47)', borderRight:'none'}}>
        {/* Logo */}
        <div className="px-4 py-5" style={{borderBottom:'1px solid rgba(255,255,255,0.06)'}}>
          <Link to="/" className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0"
              style={{background:'linear-gradient(135deg,#5B2D8E,#7B4DB8)'}}>
              <i className="fas fa-heart text-sm" style={{color:'#F0A500'}}/>
            </div>
            <div>
              <div className="font-display font-bold text-white text-sm leading-tight">My Portal</div>
              <div className="text-[9px] uppercase tracking-[2px]" style={{color:'rgba(240,165,0,0.6)'}}>Member Dashboard</div>
            </div>
          </Link>
        </div>

        {/* User avatar */}
        <div className="px-4 py-4" style={{borderBottom:'1px solid rgba(255,255,255,0.06)'}}>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl flex items-center justify-center text-white font-bold text-sm flex-shrink-0"
              style={{background:'linear-gradient(135deg,#F0A500,#FFB84D)'}}>
              {user?.firstName?.[0]}{user?.lastName?.[0]}
            </div>
            <div className="min-w-0">
              <div className="text-xs font-semibold truncate text-white">{user?.firstName} {user?.lastName}</div>
              <div className="text-[9px] capitalize" style={{color:'rgba(240,165,0,0.7)'}}>{user?.role}</div>
            </div>
          </div>
        </div>

        {/* Nav */}
        <nav className="flex-1 p-3 space-y-0.5 overflow-y-auto">
          {PORTAL_NAV.map(item => (
            <NavLink key={item.to} to={item.to} end={item.exact}
              className={({isActive}) =>
                `flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 relative ${isActive?'sidebar-link-active':'sidebar-link'}`
              }>
              <i className={`fas ${item.icon} text-sm w-5 text-center`}/>
              {item.label}
              {item.to==='/portal/notifications' && unread > 0 && (
                <span className="ml-auto text-[9px] font-bold px-1.5 py-0.5 rounded-full min-w-[18px] text-center"
                  style={{background:'#F0A500', color:'#fff'}}>
                  {unread > 9 ? '9+' : unread}
                </span>
              )}
            </NavLink>
          ))}
        </nav>

        {/* Bottom */}
        <div className="p-3 space-y-1" style={{borderTop:'1px solid rgba(255,255,255,0.06)'}}>
          {user?.role === 'admin' && (
            <Link to="/admin"
              className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all sidebar-link">
              <i className="fas fa-cog text-sm w-5 text-center"/>Admin Panel
            </Link>
          )}
          <button onClick={logout}
            className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium w-full text-left transition-all sidebar-link hover:!text-red-400"
            style={{}}>
            <i className="fas fa-sign-out-alt text-sm w-5 text-center"/>Logout
          </button>
        </div>
      </aside>

      {/* Main */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top bar */}
        <header className="bg-white px-8 py-4 flex items-center justify-between flex-shrink-0"
          style={{borderBottom:'1px solid rgba(91,45,142,0.08)', boxShadow:'0 1px 8px rgba(91,45,142,0.05)'}}>
          <div>
            <h1 className="font-display font-bold text-lg" style={{color:'#1A0A35'}}>{currentPage}</h1>
            <div className="text-xs flex items-center gap-1" style={{color:'#A3A3A3',fontFamily:'Poppins,sans-serif'}}>
              <Link to="/portal" className="hover:underline" style={{color:'#5B2D8E'}}>Portal</Link>
              {currentPage !== 'Dashboard' && (
                <><i className="fas fa-chevron-right text-[8px]"/>
                  <span style={{color:'#A3A3A3'}}>{currentPage}</span></>
              )}
            </div>
          </div>
          <div className="flex items-center gap-3">
            <PushNotificationButton className="!text-xs !py-2 !px-3"/>
            <Link to="/portal/notifications" className="relative w-9 h-9 rounded-xl flex items-center justify-center transition-colors hover:bg-primary-50"
              style={{color:'#5B2D8E'}}>
              <i className="fas fa-bell text-sm"/>
              {unread > 0 && (
                <span className="absolute top-0.5 right-0.5 w-4 h-4 rounded-full text-[9px] font-bold text-white flex items-center justify-center"
                  style={{background:'#F0A500'}}>
                  {unread > 9 ? '9+' : unread}
                </span>
              )}
            </Link>
            <Link to="/" className="flex items-center gap-1.5 text-xs font-semibold hover:underline" style={{color:'#5B2D8E',fontFamily:'Sora,sans-serif'}}>
              <i className="fas fa-globe text-xs"/>View Site
            </Link>
          </div>
        </header>
        <main className="flex-1 overflow-auto p-8"><Outlet/></main>
      </div>
    </div>
  )
}
