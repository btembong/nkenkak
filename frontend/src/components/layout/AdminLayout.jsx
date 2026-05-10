import { useState } from 'react'
import { NavLink, Outlet, Link, useLocation } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import { useQuery } from 'react-query'
import api from '../../services/api'

const NAV_GROUPS = [
  {
    label: 'Overview',
    items: [
      { to:'/admin',             icon:'fa-tachometer-alt', label:'Dashboard',    exact:true },
    ]
  },
  {
    label: 'Content',
    items: [
      { to:'/admin/projects',    icon:'fa-seedling',        label:'Projects'   },
      { to:'/admin/news',        icon:'fa-newspaper',       label:'News'       },
      { to:'/admin/events',      icon:'fa-calendar-alt',    label:'Events'     },
      { to:'/admin/gallery',     icon:'fa-images',          label:'Gallery'    },
      { to:'/admin/hero-slides',  icon:'fa-photo-video',     label:'Hero Slides'},
      { to:'/admin/notices',     icon:'fa-bullhorn',        label:'Notices'    },
      { to:'/admin/documents',   icon:'fa-folder-open',     label:'Documents'  },
      { to:'/admin/vocab',       icon:'fa-language',        label:'Language'   },
    ]
  },
  {
    label: 'Community',
    items: [
      { to:'/admin/team',        icon:'fa-id-badge',        label:'Team'       },
      { to:'/admin/forum',       icon:'fa-comments',        label:'Forum'      },
      { to:'/admin/polls',       icon:'fa-vote-yea',        label:'Polls'      },
      { to:'/admin/diaspora',    icon:'fa-globe-africa',    label:'Diaspora'   },
      { to:'/admin/mentors',     icon:'fa-user-graduate',   label:'Mentors'    },
      { to:'/admin/directory',   icon:'fa-store',           label:'Directory'  },
      { to:'/admin/memorial',    icon:'fa-star',            label:'Memorial'   },
      { to:'/admin/chat',        icon:'fa-comment-dots',    label:'Chat Rooms' },
      { to:'/admin/petitions',   icon:'fa-scroll',          label:'Petitions'  },
      { to:'/admin/jobs',        icon:'fa-briefcase',       label:'Jobs Board' },
      { to:'/admin/elections',   icon:'fa-vote-yea',        label:'Elections'  },
      { to:'/admin/live-rooms',  icon:'fa-video',           label:'Live Rooms' },
    ]
  },
  {
    label: 'Finance',
    items: [
      { to:'/admin/donations',   icon:'fa-heart',           label:'Donations'  },
      { to:'/admin/newsletter',  icon:'fa-paper-plane',     label:'Newsletter' },
      { to:'/admin/campaigns',   icon:'fa-envelope-open-text', label:'Campaigns' },
      { to:'/admin/reports',     icon:'fa-chart-line',      label:'Reports'    },
      { to:'/admin/scholarships',icon:'fa-graduation-cap',  label:'Scholarships'},
      { to:'/admin/budget',      icon:'fa-chart-pie',       label:'Budget'     },
    ]
  },
  {
    label: 'Knowledge',
    items: [
      { to:'/admin/wiki',        icon:'fa-book-open',       label:'Wiki'       },
    ]
  },
  {
    label: 'People',
    items: [
      { to:'/admin/users',       icon:'fa-users',           label:'Users'      },
      { to:'/admin/contacts',    icon:'fa-envelope',        label:'Messages',  badge:'contacts' },
    ]
  },
  {
    label: 'System',
    items: [
      { to:'/admin/push',        icon:'fa-bell',            label:'Push Notify' },
      { to:'/admin/audit',       icon:'fa-history',         label:'Audit Log'  },
      { to:'/admin/settings',    icon:'fa-cog',             label:'Settings'   },
    ]
  },
]

export default function AdminLayout() {
  const { user, logout } = useAuth()
  const location = useLocation()
  const [collapsed, setCollapsed] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)

  // Unread contact messages badge
  const { data: unreadContacts } = useQuery('unread-contacts',
    () => api.get('/contact?status=unread').then(r => r.data.length).catch(() => 0),
    { refetchInterval: 60000 }
  )

  const getBadge = (key) => {
    if (key === 'contacts') return unreadContacts > 0 ? unreadContacts : null
    return null
  }

  const currentItem = NAV_GROUPS.flatMap(g => g.items).find(n =>
    n.exact ? location.pathname === '/admin' : location.pathname.startsWith(n.to) && n.to !== '/admin'
  )
  const currentPage = currentItem?.label || 'Dashboard'

  const SidebarContent = () => (
    <>
      {/* Logo */}
      <div className="flex items-center gap-3 px-4 py-5 flex-shrink-0"
        style={{borderBottom:'1px solid rgba(255,255,255,0.06)'}}>
        <div className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0"
          style={{background:'linear-gradient(135deg,#5B2D8E,#7B4DB8)'}}>
          <i className="fas fa-heart text-sm" style={{color:'#F0A500'}}/>
        </div>
        {!collapsed && (
          <div className="flex-1 min-w-0">
            <div className="font-display font-bold text-white text-sm leading-tight truncate">Admin Panel</div>
            <div className="text-[9px] uppercase tracking-[2px]" style={{color:'rgba(240,165,0,0.6)'}}>Nkenkak-Ngiesang</div>
          </div>
        )}
        <button onClick={() => setCollapsed(!collapsed)}
          className="text-xs transition-colors flex-shrink-0 hidden lg:block"
          style={{color:'rgba(255,255,255,0.3)'}}>
          <i className={`fas fa-${collapsed ? 'angle-right' : 'angle-left'}`}/>
        </button>
      </div>

      {/* Nav groups */}
      <nav className="flex-1 overflow-y-auto p-3 space-y-4">
        {NAV_GROUPS.map(group => (
          <div key={group.label}>
            {!collapsed && (
              <div className="px-3 mb-1.5 text-[9px] font-bold uppercase tracking-[2px]"
                style={{color:'rgba(255,255,255,0.2)'}}>
                {group.label}
              </div>
            )}
            <div className="space-y-0.5">
              {group.items.map(item => {
                const badge = getBadge(item.badge)
                return (
                  <NavLink key={item.to} to={item.to} end={item.exact}
                    className={({isActive}) =>
                      `flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-150 relative ${collapsed ? 'justify-center' : ''} ${isActive ? 'sidebar-link-active' : 'sidebar-link'}`
                    }
                    title={collapsed ? item.label : undefined}
                    onClick={() => setMobileOpen(false)}>
                    <i className={`fas ${item.icon} ${collapsed ? 'text-base' : 'text-sm w-5 text-center flex-shrink-0'}`}/>
                    {!collapsed && (
                      <>
                        <span className="flex-1">{item.label}</span>
                        {badge && (
                          <span className="text-[9px] font-bold px-1.5 py-0.5 rounded-full text-white min-w-[18px] text-center"
                            style={{background:'#dc2626'}}>
                            {badge > 99 ? '99+' : badge}
                          </span>
                        )}
                      </>
                    )}
                    {collapsed && badge && (
                      <span className="absolute top-1 right-1 w-3 h-3 rounded-full" style={{background:'#dc2626'}}/>
                    )}
                  </NavLink>
                )
              })}
            </div>
          </div>
        ))}
      </nav>

      {/* View site */}
      <div className="p-3 flex-shrink-0" style={{borderTop:'1px solid rgba(255,255,255,0.06)'}}>
        <Link to="/"
          className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all sidebar-link ${collapsed ? 'justify-center' : ''}`}
          title={collapsed ? 'View Site' : undefined}>
          <i className="fas fa-globe text-sm w-5 text-center flex-shrink-0"/>
          {!collapsed && 'View Site'}
        </Link>
      </div>

      {/* User */}
      <div className="p-3 flex-shrink-0" style={{borderTop:'1px solid rgba(255,255,255,0.06)'}}>
        <div className={`flex items-center gap-2.5 ${collapsed ? 'justify-center' : ''}`}>
          <div className="w-9 h-9 rounded-xl flex items-center justify-center text-white text-xs font-bold flex-shrink-0"
            style={{background:'linear-gradient(135deg,#F0A500,#FFB84D)'}}>
            {user?.firstName?.[0]}{user?.lastName?.[0]}
          </div>
          {!collapsed && (
            <>
              <div className="flex-1 min-w-0">
                <div className="text-xs font-semibold truncate text-white">{user?.firstName} {user?.lastName}</div>
                <div className="text-[9px] capitalize" style={{color:'rgba(240,165,0,0.6)'}}>Administrator</div>
              </div>
              <button onClick={logout}
                className="text-xs transition-colors hover:text-red-400 flex-shrink-0"
                style={{color:'rgba(255,255,255,0.3)'}}>
                <i className="fas fa-sign-out-alt"/>
              </button>
            </>
          )}
        </div>
      </div>
    </>
  )

  return (
    <div className="flex min-h-screen" style={{background:'#F3EEF9'}}>
      {/* Desktop sidebar */}
      <aside className={`hidden lg:flex flex-col flex-shrink-0 transition-all duration-300 ${collapsed ? 'w-16' : 'w-60'} sticky top-0 h-screen`}
        style={{background:'linear-gradient(180deg,#1A0A35,#250F47)'}}>
        <SidebarContent/>
      </aside>

      {/* Mobile sidebar overlay */}
      {mobileOpen && (
        <div className="fixed inset-0 z-50 lg:hidden" onClick={() => setMobileOpen(false)}
          style={{background:'rgba(26,10,53,0.7)', backdropFilter:'blur(4px)'}}>
          <aside className="w-64 h-full flex flex-col" style={{background:'linear-gradient(180deg,#1A0A35,#250F47)'}}
            onClick={e => e.stopPropagation()}>
            <SidebarContent/>
          </aside>
        </div>
      )}

      {/* Main */}
      <div className="flex-1 flex flex-col overflow-hidden min-w-0">
        {/* Topbar */}
        <header className="bg-white px-6 py-3.5 flex items-center justify-between flex-shrink-0"
          style={{borderBottom:'1px solid rgba(91,45,142,0.08)', boxShadow:'0 1px 8px rgba(91,45,142,0.05)'}}>
          <div className="flex items-center gap-3">
            {/* Mobile hamburger */}
            <button onClick={() => setMobileOpen(true)} className="lg:hidden w-9 h-9 rounded-xl flex items-center justify-center hover:bg-primary-50 transition-colors" style={{color:'#5B2D8E'}}>
              <i className="fas fa-bars text-sm"/>
            </button>
            <div>
              <h1 className="font-display font-bold text-lg leading-tight" style={{color:'#1A0A35'}}>{currentPage}</h1>
              <div className="text-xs flex items-center gap-1" style={{color:'#A3A3A3',fontFamily:'Poppins,sans-serif'}}>
                <Link to="/admin" className="hover:underline" style={{color:'#5B2D8E'}}>Admin</Link>
                {currentPage !== 'Dashboard' && (
                  <><i className="fas fa-chevron-right text-[8px]"/><span>{currentPage}</span></>
                )}
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Notifications bell with contacts badge */}
            <Link to="/admin/contacts" className="relative w-9 h-9 rounded-xl flex items-center justify-center hover:bg-primary-50 transition-colors" style={{color:'#5B2D8E'}}>
              <i className="fas fa-bell text-sm"/>
              {unreadContacts > 0 && (
                <span className="absolute top-0.5 right-0.5 w-4 h-4 rounded-full text-[9px] font-bold text-white flex items-center justify-center"
                  style={{background:'#dc2626'}}>
                  {unreadContacts > 9 ? '9+' : unreadContacts}
                </span>
              )}
            </Link>

            {/* Quick links */}
            <Link to="/" className="hidden md:flex items-center gap-1.5 text-xs font-semibold px-3 py-2 rounded-xl hover:bg-primary-50 transition-colors" style={{color:'#5B2D8E',fontFamily:'Sora,sans-serif'}}>
              <i className="fas fa-globe text-xs"/>View Site
            </Link>

            {/* User chip */}
            <div className="flex items-center gap-2 px-3 py-2 rounded-xl" style={{background:'rgba(91,45,142,0.06)'}}>
              <div className="w-7 h-7 rounded-lg flex items-center justify-center text-white text-xs font-bold"
                style={{background:'linear-gradient(135deg,#5B2D8E,#7B4DB8)'}}>
                {user?.firstName?.[0]}{user?.lastName?.[0]}
              </div>
              <div className="hidden md:block">
                <div className="text-xs font-semibold" style={{color:'#1A0A35',fontFamily:'Sora,sans-serif'}}>{user?.firstName} {user?.lastName}</div>
                <div className="text-[10px]" style={{color:'#A3A3A3',fontFamily:'Poppins,sans-serif'}}>Admin</div>
              </div>
            </div>
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 overflow-auto p-6 md:p-8">
          <Outlet/>
        </main>
      </div>
    </div>
  )
}
