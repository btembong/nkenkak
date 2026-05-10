import { lazy, Suspense, useState, useEffect } from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider, useAuth } from './context/AuthContext'
import { LanguageProvider } from './context/LanguageContext'
import Layout from './components/layout/Layout'
import AdminLayout from './components/layout/AdminLayout'
import PortalLayout from './components/layout/PortalLayout'

// Public pages
const HomePage             = lazy(() => import('./components/pages/HomePage'))
const CulturePage          = lazy(() => import('./components/pages/CulturePage'))
const AnthropologyPage     = lazy(() => import('./components/pages/AnthropologyPage'))
const ProjectsPage         = lazy(() => import('./components/pages/ProjectsPage'))
const ProjectDetail        = lazy(() => import('./components/pages/ProjectDetail'))
const EventsPage           = lazy(() => import('./components/pages/EventsPage'))
const EventDetail          = lazy(() => import('./components/pages/EventDetail'))
const GalleryPage          = lazy(() => import('./components/pages/GalleryPage'))
const TeamPage             = lazy(() => import('./components/pages/TeamPage'))
const TeamMemberPage       = lazy(() => import('./components/pages/TeamMemberPage'))
const NewsPage             = lazy(() => import('./components/pages/NewsPage'))
const NewsDetail           = lazy(() => import('./components/pages/NewsDetail'))
const ForumPage            = lazy(() => import('./components/pages/ForumPage'))
const ForumThread          = lazy(() => import('./components/pages/ForumThread'))
const ContactPage          = lazy(() => import('./components/pages/ContactPage'))
const DiasporaPage         = lazy(() => import('./components/pages/DiasporaPage'))
const VolunteersPage       = lazy(() => import('./components/pages/VolunteersPage'))
const FAQPage              = lazy(() => import('./components/pages/FAQPage'))
const VillageMapPage       = lazy(() => import('./components/pages/VillageMapPage'))
const LanguagePage         = lazy(() => import('./components/pages/LanguagePage'))
const CulturalCalendarPage = lazy(() => import('./components/pages/CulturalCalendarPage'))
const GovernancePage       = lazy(() => import('./components/pages/GovernancePage'))
const TransparencyPage     = lazy(() => import('./components/pages/TransparencyPage'))
const MemorialPage         = lazy(() => import('./components/pages/MemorialPage'))
const NoticesPage          = lazy(() => import('./components/pages/NoticesPage'))
const DocumentsPage        = lazy(() => import('./components/pages/DocumentsPage'))
const ScholarshipsPage     = lazy(() => import('./components/pages/ScholarshipsPage'))
const BusinessDirectoryPage = lazy(() => import('./components/pages/BusinessDirectoryPage'))
const MentorshipPage         = lazy(() => import('./components/pages/MentorshipPage'))
const PollsPage              = lazy(() => import('./components/pages/PollsPage'))
const MemberDirectoryPage    = lazy(() => import('./components/pages/MemberDirectoryPage'))
const ChatPage               = lazy(() => import('./components/pages/ChatPage'))
const PetitionsPage          = lazy(() => import('./components/pages/PetitionsPage'))
const JobBoardPage           = lazy(() => import('./components/pages/JobBoardPage'))
const JobDetailPage          = lazy(() => import('./components/pages/JobDetailPage'))
const WikiPage               = lazy(() => import('./components/pages/WikiPage'))
const BudgetPage             = lazy(() => import('./components/pages/BudgetPage'))
const ElectionsPage          = lazy(() => import('./components/pages/ElectionsPage'))
const ElectionDetail         = lazy(() => import('./components/pages/ElectionDetail'))
const LiveRoomsPage          = lazy(() => import('./components/pages/LiveRoomsPage'))
const LiveRoomPage           = lazy(() => import('./components/pages/LiveRoomPage'))

// Auth pages
const LoginPage      = lazy(() => import('./components/pages/LoginPage'))
const RegisterPage   = lazy(() => import('./components/pages/RegisterPage'))
const ForgotPassword = lazy(() => import('./components/pages/ForgotPassword'))
const ResetPassword  = lazy(() => import('./components/pages/ResetPassword'))

// Portal
const PortalMessages      = lazy(() => import('./components/portal/PortalMessages'))
const PortalDashboard     = lazy(() => import('./components/portal/PortalDashboard'))
const PortalProfile       = lazy(() => import('./components/portal/PortalProfile'))
const PortalDonations     = lazy(() => import('./components/portal/PortalDonations'))
const PortalNotifications = lazy(() => import('./components/portal/PortalNotifications'))
const PortalVolunteerHours = lazy(() => import('./components/portal/PortalVolunteerHours'))
const PortalEvents    = (props) => <LazyPortalPage name="PortalEvents" {...props}/>
const PortalVolunteer = (props) => <LazyPortalPage name="PortalVolunteer" {...props}/>

// Admin pages
const AdminDashboard         = lazy(() => import('./components/admin/AdminDashboard'))
const AdminProjects          = lazy(() => import('./components/admin/AdminProjects'))
const AdminDonations         = lazy(() => import('./components/admin/AdminDonations'))
const AdminUsers             = lazy(() => import('./components/admin/AdminUsers'))
const AdminNews              = lazy(() => import('./components/admin/AdminNews'))
const AdminEvents            = lazy(() => import('./components/admin/AdminEvents'))
const AdminTeam              = lazy(() => import('./components/admin/AdminTeam'))
const AdminForum             = lazy(() => import('./components/admin/AdminForum'))
const AdminContacts          = lazy(() => import('./components/admin/AdminContacts'))
const AdminSettings          = lazy(() => import('./components/admin/AdminSettings'))
const AdminGallery           = lazy(() => import('./components/admin/AdminGallery'))
const AdminNewsletter        = lazy(() => import('./components/admin/AdminNewsletter'))
const AdminPolls             = lazy(() => import('./components/admin/AdminPolls'))
const AdminAuditLog          = lazy(() => import('./components/admin/AdminAuditLog'))
const AdminDocuments         = lazy(() => import('./components/admin/AdminDocuments'))
const AdminScholarships      = lazy(() => import('./components/admin/AdminScholarships'))
const AdminNotices           = lazy(() => import('./components/admin/AdminNotices'))
const AdminDirectory         = lazy(() => import('./components/admin/AdminDirectory'))
const AdminMentors           = lazy(() => import('./components/admin/AdminMentors'))
const AdminMemorial          = lazy(() => import('./components/admin/AdminMemorial'))
const AdminVocab             = lazy(() => import('./components/admin/AdminVocab'))
const AdminReports           = lazy(() => import('./components/admin/AdminReports'))
const AdminPushNotifications = lazy(() => import('./components/admin/AdminPushNotifications'))
const AdminEmailCampaigns    = lazy(() => import('./components/admin/AdminEmailCampaigns'))
const AdminJobs              = lazy(() => import('./components/admin/AdminJobs'))
const AdminPetitions         = lazy(() => import('./components/admin/AdminPetitions'))
const AdminWiki              = lazy(() => import('./components/admin/AdminWiki'))
const AdminBudget            = lazy(() => import('./components/admin/AdminBudget'))
const AdminChat              = lazy(() => import('./components/admin/AdminChat'))
const AdminElections         = lazy(() => import('./components/admin/AdminElections'))
const AdminLiveRooms         = lazy(() => import('./components/admin/AdminLiveRooms'))
const AdminHeroSlides        = lazy(() => import('./components/admin/AdminHeroSlides'))

// Admin diaspora (re-use public page inside admin layout)
const DiasporaAdmin = lazy(() => import('./components/pages/DiasporaPage'))

// Helper for named exports from PortalPages (lazy-loaded module)
function LazyPortalPage({ name, ...props }) {
  const [Comp, setComp] = useState(null)
  useEffect(() => {
    import('./components/portal/PortalPages').then(m => setComp(() => m[name]))
  }, [name])
  if (!Comp) return <Spinner/>
  return <Comp {...props}/>
}

function Spinner() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center gap-4" style={{background:'#F3EEF9'}}>
      <div className="w-14 h-14 rounded-full border-4 animate-spin"
        style={{borderColor:'rgba(91,45,142,0.15)', borderTopColor:'#5B2D8E'}}/>
      <p className="text-sm font-semibold" style={{color:'#5B2D8E',fontFamily:'Sora,sans-serif'}}>Loading…</p>
    </div>
  )
}

function PrivateRoute({ children, role }) {
  const { user, loading } = useAuth()
  if (loading) return <Spinner/>
  if (!user) return <Navigate to="/login" replace/>
  if (role === 'admin'  && user.role !== 'admin')                   return <Navigate to="/" replace/>
  if (role === 'leader' && !['admin','leader'].includes(user.role)) return <Navigate to="/" replace/>
  return children
}

export default function App() {
  return (
    <LanguageProvider>
    <AuthProvider>
      <Suspense fallback={<Spinner/>}>
      <Routes>

        {/* ── Public site ─────────────────────── */}
        <Route element={<Layout/>}>
          <Route path="/"               element={<HomePage/>}/>
          <Route path="/culture"        element={<CulturePage/>}/>
          <Route path="/anthropology"   element={<AnthropologyPage/>}/>
          <Route path="/projects"       element={<ProjectsPage/>}/>
          <Route path="/projects/:slug" element={<ProjectDetail/>}/>
          <Route path="/events"         element={<EventsPage/>}/>
          <Route path="/events/:slug"   element={<EventDetail/>}/>
          <Route path="/gallery"        element={<GalleryPage/>}/>
          <Route path="/team"           element={<TeamPage/>}/>
          <Route path="/team/:id"       element={<TeamMemberPage/>}/>
          <Route path="/volunteers"     element={<VolunteersPage/>}/>
          <Route path="/news"           element={<NewsPage/>}/>
          <Route path="/news/:slug"     element={<NewsDetail/>}/>
          <Route path="/forum"          element={<ForumPage/>}/>
          <Route path="/forum/:id"      element={<ForumThread/>}/>
          <Route path="/contact"        element={<ContactPage/>}/>
          <Route path="/diaspora"       element={<DiasporaPage/>}/>
          <Route path="/faq"            element={<FAQPage/>}/>
          <Route path="/village-map"        element={<VillageMapPage/>}/>
          <Route path="/language"           element={<LanguagePage/>}/>
          <Route path="/cultural-calendar"  element={<CulturalCalendarPage/>}/>
          <Route path="/governance"         element={<GovernancePage/>}/>
          <Route path="/transparency"       element={<TransparencyPage/>}/>
          <Route path="/memorial"           element={<MemorialPage/>}/>
          <Route path="/notices"            element={<NoticesPage/>}/>
          <Route path="/documents"          element={<DocumentsPage/>}/>
          <Route path="/scholarships"       element={<ScholarshipsPage/>}/>
          <Route path="/directory"          element={<BusinessDirectoryPage/>}/>
          <Route path="/mentorship"         element={<MentorshipPage/>}/>
          <Route path="/polls"              element={<PollsPage/>}/>
          <Route path="/members"            element={<MemberDirectoryPage/>}/>
          <Route path="/chat"               element={<ChatPage/>}/>
          <Route path="/petitions"          element={<PetitionsPage/>}/>
          <Route path="/jobs"               element={<JobBoardPage/>}/>
          <Route path="/jobs/:id"           element={<JobDetailPage/>}/>
          <Route path="/wiki"               element={<WikiPage/>}/>
          <Route path="/wiki/:slug"         element={<WikiPage/>}/>
          <Route path="/budget"             element={<BudgetPage/>}/>
          <Route path="/elections"          element={<ElectionsPage/>}/>
          <Route path="/elections/:id"      element={<ElectionDetail/>}/>
          <Route path="/live"               element={<LiveRoomsPage/>}/>
        </Route>

        {/* Live room — full-screen, no site layout */}
        <Route path="/live/:slug" element={<PrivateRoute><LiveRoomPage/></PrivateRoute>}/>

        {/* ── Auth ────────────────────────────── */}
        <Route path="/login"            element={<LoginPage/>}/>
        <Route path="/register"         element={<RegisterPage/>}/>
        <Route path="/forgot-password"  element={<ForgotPassword/>}/>
        <Route path="/reset-password"   element={<ResetPassword/>}/>

        {/* ── Member portal ───────────────────── */}
        <Route path="/portal" element={<PrivateRoute><PortalLayout/></PrivateRoute>}>
          <Route index                  element={<PortalDashboard/>}/>
          <Route path="profile"         element={<PortalProfile/>}/>
          <Route path="donations"       element={<PortalDonations/>}/>
          <Route path="events"          element={<PortalEvents/>}/>
          <Route path="volunteer"       element={<PortalVolunteer/>}/>
          <Route path="hours"           element={<PortalVolunteerHours/>}/>
          <Route path="notifications"   element={<PortalNotifications/>}/>
          <Route path="messages"        element={<PortalMessages/>}/>
        </Route>

        {/* ── Admin panel ─────────────────────── */}
        <Route path="/admin" element={<PrivateRoute role="admin"><AdminLayout/></PrivateRoute>}>
          <Route index                  element={<AdminDashboard/>}/>
          <Route path="projects"        element={<AdminProjects/>}/>
          <Route path="news"            element={<AdminNews/>}/>
          <Route path="events"          element={<AdminEvents/>}/>
          <Route path="gallery"         element={<AdminGallery/>}/>
          <Route path="team"            element={<AdminTeam/>}/>
          <Route path="forum"           element={<AdminForum/>}/>
          <Route path="polls"           element={<AdminPolls/>}/>
          <Route path="diaspora"        element={<DiasporaAdmin/>}/>
          <Route path="donations"       element={<AdminDonations/>}/>
          <Route path="newsletter"      element={<AdminNewsletter/>}/>
          <Route path="users"           element={<AdminUsers/>}/>
          <Route path="contacts"        element={<AdminContacts/>}/>
          <Route path="audit"           element={<AdminAuditLog/>}/>
          <Route path="settings"        element={<AdminSettings/>}/>
          <Route path="documents"     element={<AdminDocuments/>}/>
          <Route path="scholarships"  element={<AdminScholarships/>}/>
          <Route path="notices"       element={<AdminNotices/>}/>
          <Route path="directory"     element={<AdminDirectory/>}/>
          <Route path="mentors"       element={<AdminMentors/>}/>
          <Route path="memorial"      element={<AdminMemorial/>}/>
          <Route path="vocab"         element={<AdminVocab/>}/>
          <Route path="reports"       element={<AdminReports/>}/>
          <Route path="push"          element={<AdminPushNotifications/>}/>
          <Route path="campaigns"     element={<AdminEmailCampaigns/>}/>
          <Route path="jobs"          element={<AdminJobs/>}/>
          <Route path="petitions"     element={<AdminPetitions/>}/>
          <Route path="wiki"          element={<AdminWiki/>}/>
          <Route path="budget"        element={<AdminBudget/>}/>
          <Route path="chat"          element={<AdminChat/>}/>
          <Route path="elections"     element={<AdminElections/>}/>
          <Route path="live-rooms"    element={<AdminLiveRooms/>}/>
          <Route path="hero-slides"   element={<AdminHeroSlides/>}/>
        </Route>

        {/* ── Catch-all ───────────────────────── */}
        <Route path="*" element={<Navigate to="/" replace/>}/>

      </Routes>
      </Suspense>
    </AuthProvider>
    </LanguageProvider>
  )
}
