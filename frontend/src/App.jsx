import { Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider, useAuth } from './context/AuthContext'
import Layout from './components/layout/Layout'
import AdminLayout from './components/layout/AdminLayout'
import PortalLayout from './components/layout/PortalLayout'

// Public pages
import HomePage        from './components/pages/HomePage'
import CulturePage     from './components/pages/CulturePage'
import ProjectsPage    from './components/pages/ProjectsPage'
import ProjectDetail   from './components/pages/ProjectDetail'
import EventsPage      from './components/pages/EventsPage'
import GalleryPage     from './components/pages/GalleryPage'
import TeamPage        from './components/pages/TeamPage'
import NewsPage        from './components/pages/NewsPage'
import NewsDetail      from './components/pages/NewsDetail'
import ForumPage       from './components/pages/ForumPage'
import ForumThread     from './components/pages/ForumThread'
import ContactPage     from './components/pages/ContactPage'
import DiasporaPage    from './components/pages/DiasporaPage'

// Auth pages
import LoginPage       from './components/pages/LoginPage'
import RegisterPage    from './components/pages/RegisterPage'
import ForgotPassword  from './components/pages/ForgotPassword'

// Member portal
import PortalDashboard from './components/portal/PortalDashboard'
import PortalProfile   from './components/portal/PortalProfile'
import PortalDonations from './components/portal/PortalDonations'
import PortalNotifications from './components/portal/PortalNotifications'

// Admin
import AdminDashboard  from './components/admin/AdminDashboard'
import AdminProjects   from './components/admin/AdminProjects'
import AdminDonations  from './components/admin/AdminDonations'
import AdminUsers      from './components/admin/AdminUsers'
import AdminNews       from './components/admin/AdminNews'
import AdminEvents     from './components/admin/AdminEvents'
import AdminTeam       from './components/admin/AdminTeam'
import AdminForum      from './components/admin/AdminForum'

function PrivateRoute({ children, role }) {
  const { user, loading } = useAuth()
  if (loading) return <div className="min-h-screen flex items-center justify-center bg-earth"><div className="w-12 h-12 border-2 border-gold-dark border-t-gold rounded-full animate-spin"/></div>
  if (!user) return <Navigate to="/login" replace/>
  if (role === 'admin'  && user.role !== 'admin')                       return <Navigate to="/" replace/>
  if (role === 'leader' && !['admin','leader'].includes(user.role))     return <Navigate to="/" replace/>
  return children
}

export default function App() {
  return (
    <AuthProvider>
      <Routes>
        {/* Public */}
        <Route element={<Layout/>}>
          <Route path="/"            element={<HomePage/>}/>
          <Route path="/culture"     element={<CulturePage/>}/>
          <Route path="/projects"    element={<ProjectsPage/>}/>
          <Route path="/projects/:slug" element={<ProjectDetail/>}/>
          <Route path="/events"      element={<EventsPage/>}/>
          <Route path="/gallery"     element={<GalleryPage/>}/>
          <Route path="/team"        element={<TeamPage/>}/>
          <Route path="/news"        element={<NewsPage/>}/>
          <Route path="/news/:slug"  element={<NewsDetail/>}/>
          <Route path="/forum"       element={<ForumPage/>}/>
          <Route path="/forum/:id"   element={<ForumThread/>}/>
          <Route path="/contact"     element={<ContactPage/>}/>
          <Route path="/diaspora"    element={<DiasporaPage/>}/>
        </Route>

        {/* Auth */}
        <Route path="/login"          element={<LoginPage/>}/>
        <Route path="/register"       element={<RegisterPage/>}/>
        <Route path="/forgot-password" element={<ForgotPassword/>}/>

        {/* Member Portal */}
        <Route path="/portal" element={<PrivateRoute><PortalLayout/></PrivateRoute>}>
          <Route index          element={<PortalDashboard/>}/>
          <Route path="profile" element={<PortalProfile/>}/>
          <Route path="donations" element={<PortalDonations/>}/>
          <Route path="notifications" element={<PortalNotifications/>}/>
        </Route>

        {/* Admin */}
        <Route path="/admin" element={<PrivateRoute role="admin"><AdminLayout/></PrivateRoute>}>
          <Route index          element={<AdminDashboard/>}/>
          <Route path="projects" element={<AdminProjects/>}/>
          <Route path="donations" element={<AdminDonations/>}/>
          <Route path="users"    element={<AdminUsers/>}/>
          <Route path="news"     element={<AdminNews/>}/>
          <Route path="events"   element={<AdminEvents/>}/>
          <Route path="team"     element={<AdminTeam/>}/>
          <Route path="forum"    element={<AdminForum/>}/>
        </Route>

        <Route path="*" element={<Navigate to="/" replace/>}/>
      </Routes>
    </AuthProvider>
  )
}
