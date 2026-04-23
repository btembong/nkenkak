import { NavLink, Outlet, Link } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'

const ADMIN_NAV = [
  { to:'/admin',           icon:'fa-tachometer-alt', label:'Dashboard',  exact:true },
  { to:'/admin/projects',  icon:'fa-seedling',        label:'Projects'  },
  { to:'/admin/donations', icon:'fa-heart',           label:'Donations' },
  { to:'/admin/users',     icon:'fa-users',           label:'Users'     },
  { to:'/admin/news',      icon:'fa-newspaper',       label:'News'      },
  { to:'/admin/events',    icon:'fa-calendar',        label:'Events'    },
  { to:'/admin/team',      icon:'fa-id-badge',        label:'Team'      },
  { to:'/admin/forum',     icon:'fa-comments',        label:'Forum'     },
  { to:'/',                icon:'fa-globe',           label:'View Site' },
]

export default function AdminLayout() {
  const { user, logout } = useAuth()
  return (
    <div className="flex min-h-screen bg-[#0F0A06]">
      {/* Sidebar */}
      <aside className="w-60 flex-shrink-0 bg-earth flex flex-col border-r border-white/6">
        <div className="p-5 border-b border-white/6">
          <Link to="/" className="flex items-center gap-2">
            <div className="w-9 h-9 rounded-full bg-gold-gradient flex items-center justify-center font-cinzel font-black text-earth text-xs">NN</div>
            <div>
              <div className="font-cinzel text-gold text-xs font-bold leading-tight">Admin Panel</div>
              <div className="text-gold/40 text-[9px] tracking-[2px]">Nkenkak-Ngiesang</div>
            </div>
          </Link>
        </div>
        <nav className="flex-1 p-3 space-y-0.5 overflow-y-auto">
          {ADMIN_NAV.map(item => (
            <NavLink key={item.to} to={item.to} end={item.exact}
              className={({ isActive }) =>
                `sidebar-link ${isActive && item.to !== '/' ? 'sidebar-link-active' : ''}`}>
              <i className={`fas ${item.icon} w-5 text-center`}/>
              {item.label}
            </NavLink>
          ))}
        </nav>
        <div className="p-4 border-t border-white/6">
          <div className="flex items-center gap-2 mb-3">
            <div className="w-8 h-8 rounded-full bg-gold-gradient flex items-center justify-center text-earth text-xs font-black">{user?.first_name?.[0]}{user?.last_name?.[0]}</div>
            <div><div className="text-cream text-xs font-semibold">{user?.first_name} {user?.last_name}</div><div className="text-gold/50 text-[10px]">Administrator</div></div>
          </div>
          <button onClick={logout} className="w-full text-left text-xs text-cream/40 hover:text-red-400 flex items-center gap-2 px-2 py-1.5 rounded hover:bg-red-900/10 transition-all">
            <i className="fas fa-sign-out-alt"/> Logout
          </button>
        </div>
      </aside>
      <main className="flex-1 overflow-auto"><Outlet/></main>
    </div>
  )
}
