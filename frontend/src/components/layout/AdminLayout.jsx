import { useState } from 'react'
import { NavLink, Outlet, Link, useLocation } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import { useQuery } from 'react-query'
import api from '../../services/api'
import { cn } from '../../lib/utils'
import { Avatar, AvatarFallback } from '../ui/avatar'
import { Badge } from '../ui/badge'
import { Separator } from '../ui/separator'

const NAV_GROUPS = [
  {
    label: 'Overview',
    items: [
      { to:'/admin',              icon:'fa-tachometer-alt',     label:'Dashboard',    exact:true },
    ]
  },
  {
    label: 'Content',
    items: [
      { to:'/admin/projects',     icon:'fa-seedling',           label:'Projects'   },
      { to:'/admin/news',         icon:'fa-newspaper',          label:'News'       },
      { to:'/admin/events',       icon:'fa-calendar-alt',       label:'Events'     },
      { to:'/admin/gallery',      icon:'fa-images',             label:'Gallery'    },
      { to:'/admin/hero-slides',  icon:'fa-photo-video',        label:'Hero Slides'},
      { to:'/admin/notices',      icon:'fa-bullhorn',           label:'Notices'    },
      { to:'/admin/documents',    icon:'fa-folder-open',        label:'Documents'  },
      { to:'/admin/vocab',        icon:'fa-language',           label:'Language'   },
    ]
  },
  {
    label: 'Community',
    items: [
      { to:'/admin/team',         icon:'fa-id-badge',           label:'Team'       },
      { to:'/admin/forum',        icon:'fa-comments',           label:'Forum'      },
      { to:'/admin/polls',        icon:'fa-vote-yea',           label:'Polls'      },
      { to:'/admin/diaspora',     icon:'fa-globe-africa',       label:'Diaspora'   },
      { to:'/admin/mentors',      icon:'fa-user-graduate',      label:'Mentors'    },
      { to:'/admin/directory',    icon:'fa-store',              label:'Directory'  },
      { to:'/admin/memorial',     icon:'fa-star',               label:'Memorial'   },
      { to:'/admin/chat',         icon:'fa-comment-dots',       label:'Chat Rooms' },
      { to:'/admin/petitions',    icon:'fa-scroll',             label:'Petitions'  },
      { to:'/admin/jobs',         icon:'fa-briefcase',          label:'Jobs Board' },
      { to:'/admin/elections',    icon:'fa-vote-yea',           label:'Elections'  },
      { to:'/admin/live-rooms',   icon:'fa-video',              label:'Live Rooms' },
    ]
  },
  {
    label: 'Finance',
    items: [
      { to:'/admin/donations',    icon:'fa-heart',              label:'Donations'  },
      { to:'/admin/newsletter',   icon:'fa-paper-plane',        label:'Newsletter' },
      { to:'/admin/campaigns',    icon:'fa-envelope-open-text', label:'Campaigns'  },
      { to:'/admin/reports',      icon:'fa-chart-line',         label:'Reports'    },
      { to:'/admin/scholarships', icon:'fa-graduation-cap',     label:'Scholarships'},
      { to:'/admin/budget',       icon:'fa-chart-pie',          label:'Budget'     },
    ]
  },
  {
    label: 'Knowledge',
    items: [
      { to:'/admin/wiki',         icon:'fa-book-open',          label:'Wiki'       },
    ]
  },
  {
    label: 'People',
    items: [
      { to:'/admin/users',        icon:'fa-users',              label:'Users'      },
      { to:'/admin/contacts',     icon:'fa-envelope',           label:'Messages',  badge:'contacts' },
    ]
  },
  {
    label: 'System',
    items: [
      { to:'/admin/push',         icon:'fa-bell',               label:'Push Notify'},
      { to:'/admin/audit',        icon:'fa-history',            label:'Audit Log'  },
      { to:'/admin/settings',     icon:'fa-cog',                label:'Settings'   },
    ]
  },
]

export default function AdminLayout() {
  const { user, logout } = useAuth()
  const location = useLocation()
  const [collapsed, setCollapsed] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)

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

  const initials = `${user?.firstName?.[0] || ''}${user?.lastName?.[0] || ''}`

  const SidebarContent = () => (
    <>
      {/* Logo */}
      <div className={cn(
        'flex items-center gap-3 px-4 py-5 flex-shrink-0 border-b border-white/5',
        collapsed && 'justify-center'
      )}>
        <div className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 bg-gradient-to-br from-primary-500 to-primary-light shadow-purple">
          <i className="fas fa-mountain-city text-sm text-gold"/>
        </div>
        {!collapsed && (
          <div className="flex-1 min-w-0">
            <div className="font-bold text-white text-sm leading-tight truncate tracking-tight">Admin Panel</div>
            <div className="text-[9px] uppercase tracking-[2px] text-gold/60">Nkenkak-Ngiesang</div>
          </div>
        )}
        <button onClick={() => setCollapsed(!collapsed)}
          className="text-xs text-white/30 hover:text-white/60 transition-colors flex-shrink-0 hidden lg:block">
          <i className={`fas fa-${collapsed ? 'angle-right' : 'angle-left'}`}/>
        </button>
      </div>

      {/* Nav */}
      <nav className="flex-1 overflow-y-auto p-3 space-y-4 scrollbar-thin">
        {NAV_GROUPS.map(group => (
          <div key={group.label}>
            {!collapsed && (
              <p className="px-3 mb-1.5 text-[9px] font-bold uppercase tracking-[2px] text-white/20">
                {group.label}
              </p>
            )}
            <div className="space-y-0.5">
              {group.items.map(item => {
                const badge = getBadge(item.badge)
                return (
                  <NavLink key={item.to} to={item.to} end={item.exact}
                    onClick={() => setMobileOpen(false)}
                    title={collapsed ? item.label : undefined}
                    className={({ isActive }) => cn(
                      'flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-150 relative group',
                      collapsed && 'justify-center',
                      isActive
                        ? 'bg-gold/12 text-gold border-l-[3px] border-gold pl-[9px]'
                        : 'text-white/50 hover:bg-gold/8 hover:text-gold'
                    )}>
                    <i className={cn(
                      `fas ${item.icon} flex-shrink-0`,
                      collapsed ? 'text-base' : 'text-sm w-5 text-center'
                    )}/>
                    {!collapsed && (
                      <>
                        <span className="flex-1 truncate">{item.label}</span>
                        {badge && (
                          <span className="text-[9px] font-bold px-1.5 py-0.5 rounded-full bg-red-500 text-white min-w-[18px] text-center">
                            {badge > 99 ? '99+' : badge}
                          </span>
                        )}
                      </>
                    )}
                    {collapsed && badge && (
                      <span className="absolute top-1 right-1 w-2.5 h-2.5 rounded-full bg-red-500"/>
                    )}
                  </NavLink>
                )
              })}
            </div>
          </div>
        ))}
      </nav>

      {/* View site */}
      <div className="p-3 flex-shrink-0 border-t border-white/5">
        <Link to="/"
          className={cn(
            'flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all text-white/50 hover:bg-gold/8 hover:text-gold',
            collapsed && 'justify-center'
          )}
          title={collapsed ? 'View Site' : undefined}>
          <i className="fas fa-globe text-sm w-5 text-center flex-shrink-0"/>
          {!collapsed && 'View Site'}
        </Link>
      </div>

      {/* User */}
      <Separator className="bg-white/5"/>
      <div className="p-3 flex-shrink-0">
        <div className={cn('flex items-center gap-2.5', collapsed && 'justify-center')}>
          <Avatar className="w-9 h-9 rounded-xl flex-shrink-0">
            <AvatarFallback className="rounded-xl bg-gradient-to-br from-gold to-gold-light text-white text-xs font-bold">
              {initials}
            </AvatarFallback>
          </Avatar>
          {!collapsed && (
            <>
              <div className="flex-1 min-w-0">
                <div className="text-xs font-semibold truncate text-white">{user?.firstName} {user?.lastName}</div>
                <div className="text-[9px] text-gold/60 capitalize">Administrator</div>
              </div>
              <button onClick={logout}
                className="text-white/30 hover:text-red-400 transition-colors flex-shrink-0 p-1 rounded-lg hover:bg-white/5">
                <i className="fas fa-sign-out-alt text-xs"/>
              </button>
            </>
          )}
        </div>
      </div>
    </>
  )

  return (
    <div className="flex min-h-screen bg-primary-50/50">
      {/* Desktop sidebar */}
      <aside className={cn(
        'hidden lg:flex flex-col flex-shrink-0 transition-all duration-300 sticky top-0 h-screen',
        'bg-gradient-to-b from-dark to-primary-darker',
        collapsed ? 'w-16' : 'w-60'
      )}>
        <SidebarContent/>
      </aside>

      {/* Mobile sidebar overlay */}
      {mobileOpen && (
        <div className="fixed inset-0 z-50 lg:hidden"
          style={{ background: 'rgba(26,10,53,0.7)', backdropFilter: 'blur(4px)' }}
          onClick={() => setMobileOpen(false)}>
          <aside className="w-64 h-full flex flex-col bg-gradient-to-b from-dark to-primary-darker"
            onClick={e => e.stopPropagation()}>
            <SidebarContent/>
          </aside>
        </div>
      )}

      {/* Main content */}
      <div className="flex-1 flex flex-col overflow-hidden min-w-0">
        {/* Topbar */}
        <header className="bg-white border-b border-border px-6 py-3.5 flex items-center justify-between flex-shrink-0 shadow-sm">
          <div className="flex items-center gap-3">
            <button onClick={() => setMobileOpen(true)}
              className="lg:hidden w-9 h-9 rounded-xl flex items-center justify-center hover:bg-primary-50 transition-colors text-primary-500">
              <i className="fas fa-bars text-sm"/>
            </button>
            <div>
              <h1 className="font-bold text-lg leading-tight text-dark">{currentPage}</h1>
              <div className="text-xs flex items-center gap-1 text-muted-foreground">
                <Link to="/admin" className="hover:text-primary-500 transition-colors">Admin</Link>
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
            <Link to="/admin/contacts"
              className="relative w-9 h-9 rounded-xl flex items-center justify-center hover:bg-primary-50 transition-colors text-primary-500">
              <i className="fas fa-bell text-sm"/>
              {unreadContacts > 0 && (
                <span className="absolute top-0.5 right-0.5 w-4 h-4 rounded-full text-[9px] font-bold text-white flex items-center justify-center bg-red-500">
                  {unreadContacts > 9 ? '9+' : unreadContacts}
                </span>
              )}
            </Link>

            <Link to="/"
              className="hidden md:flex items-center gap-1.5 text-xs font-semibold px-3 py-2 rounded-xl hover:bg-primary-50 transition-colors text-primary-500">
              <i className="fas fa-globe text-xs"/>View Site
            </Link>

            <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-primary-50/70">
              <Avatar className="w-7 h-7 rounded-lg">
                <AvatarFallback className="rounded-lg bg-gradient-to-br from-primary-500 to-primary-light text-white text-xs font-bold">
                  {initials}
                </AvatarFallback>
              </Avatar>
              <div className="hidden md:block">
                <div className="text-xs font-semibold text-dark">{user?.firstName} {user?.lastName}</div>
                <div className="text-[10px] text-muted-foreground">Admin</div>
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
