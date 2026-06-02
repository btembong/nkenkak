import { useState, useCallback, useEffect, useRef } from 'react'
import { useParams, Link } from 'react-router-dom'
import { useQuery, useQueryClient } from 'react-query'
import { format, formatDistanceToNow } from 'date-fns'
import { useInView } from 'react-intersection-observer'
import CountUp from 'react-countup'
import toast from 'react-hot-toast'
import api from '../../services/api'
import { useAuth } from '../../context/AuthContext'
import DonationModal from '../common/DonationModal'
import ProjectCard from '../common/ProjectCard'
import {
  Home, ChevronRight, CircleDot, CheckCircle2, PauseCircle,
  AlertCircle, Star, Users, Heart, Eye,
  Info, Bell, Images, Film, Tag, MapPin, CalendarPlus,
  CalendarCheck, Clock, MessageSquare, User,
  Loader2, Send, Sprout, ArrowLeft, X, Maximize2, Play,
  Flag, Share2, Copy, CalendarDays, HeartHandshake,
  ChevronDown, ChevronUp, TrendingUp, HelpCircle,
  FileText, Building2, BarChart2, ExternalLink,
  Upload, Camera, CheckCircle, Lock,
} from 'lucide-react'

/* ─── constants ─── */
const BRAND = '#5B2D8E'
const GOLD  = '#F0A500'

const STATUS_CFG = {
  active:    { label: 'Active',    Icon: CircleDot,    color: BRAND },
  upcoming:  { label: 'Upcoming',  Icon: Clock,        color: '#C87800' },
  completed: { label: 'Completed', Icon: CheckCircle2, color: BRAND },
  paused:    { label: 'Paused',    Icon: PauseCircle,  color: '#C87800' },
}

function fmt(n) {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`
  if (n >= 1_000)     return `${(n / 1_000).toFixed(0)}K`
  return String(n)
}

function calcTimeLeft(endDate) {
  const diff = new Date(endDate) - new Date()
  if (diff <= 0) return null
  return {
    days:    Math.floor(diff / 86_400_000),
    hours:   Math.floor((diff % 86_400_000) / 3_600_000),
    minutes: Math.floor((diff % 3_600_000)  / 60_000),
    seconds: Math.floor((diff % 60_000)     / 1_000),
  }
}

function Divider() {
  return <div className="h-px my-8" style={{ background: 'rgba(91,45,142,0.07)' }}/>
}

/* ════════════════════════════════════
   MAIN
════════════════════════════════════ */
export default function ProjectDetail() {
  const { slug } = useParams()
  const { user } = useAuth()

  const [donateOpen,   setDonateOpen]   = useState(false)
  const [donateAmount, setDonateAmount] = useState(null)
  const [lightbox,     setLightbox]     = useState(null)
  const [activeTab,    setActiveTab]    = useState('about')

  const { ref: heroRef, inView: heroInView } = useInView({ threshold: 0.05 })

  const { data: project, isLoading, error } = useQuery(
    ['project', slug],
    () => api.get(`/projects/${slug}`).then(r => r.data),
    { retry: false }
  )

  const { data: related } = useQuery(
    ['related-projects', project?.category],
    () => api.get(`/projects?category=${project.category}&limit=3`)
      .then(r => r.data.projects?.filter(p => p.id !== project.id).slice(0, 3)),
    { enabled: !!project?.category }
  )

  const { data: projectVideos = [] } = useQuery(
    ['project-videos', project?.id],
    () => api.get(`/gallery?project_id=${project.id}&type=video`).then(r => r.data),
    { enabled: !!project?.id }
  )

  /* Must be above early returns */
  const handleDonate = useCallback((amount = null) => {
    setDonateAmount(amount || null)
    setDonateOpen(true)
  }, [])

  /* OG meta + page title */
  useEffect(() => {
    if (!project) return
    document.title = `${project.title} — Nkenkak`
    const set = (attr, name, content) => {
      let el = document.querySelector(`meta[${attr}="${name}"]`)
      if (!el) { el = document.createElement('meta'); el.setAttribute(attr, name); document.head.appendChild(el) }
      el.setAttribute('content', content)
    }
    set('name',     'description',       project.summary     || '')
    set('property', 'og:title',          project.title)
    set('property', 'og:description',    project.summary     || '')
    set('property', 'og:image',          project.coverImage  || '')
    set('property', 'og:url',            window.location.href)
    set('property', 'og:type',           'website')
    set('name',     'twitter:card',      'summary_large_image')
    set('name',     'twitter:title',     project.title)
    set('name',     'twitter:description', project.summary   || '')
    set('name',     'twitter:image',     project.coverImage  || '')
    return () => { document.title = 'Nkenkak' }
  }, [project])

  if (isLoading) return <PageSkeleton />
  if (error || !project) return <NotFound />

  const pct = project.goalAmount > 0
    ? Math.min(100, Math.round((Number(project.raisedAmount) / Number(project.goalAmount)) * 100))
    : 0

  const statusCfg = STATUS_CFG[project.status] || STATUS_CFG.active

  const allMedia = [
    ...(project.coverImage ? [{ type: 'image', url: project.coverImage }] : []),
    ...(project.galleryUrls?.map(u => ({ type: 'image', url: u })) || []),
  ]

  const daysLeft = project.endDate
    ? Math.max(0, Math.ceil((new Date(project.endDate) - new Date()) / 86_400_000))
    : null

  const showStickyBar = !heroInView && project.status !== 'completed'

  const tabs = [
    { key: 'about',      label: 'About',      Icon: Info          },
    { key: 'updates',    label: `Updates${project.updates?.length ? ` (${project.updates.length})` : ''}`, Icon: Bell },
    { key: 'gallery',    label: `Gallery${(allMedia.length + projectVideos.length) ? ` (${allMedia.length + projectVideos.length})` : ''}`, Icon: Images },
    { key: 'discussion', label: 'Discussion',  Icon: MessageSquare },
  ]

  return (
    <div className={showStickyBar ? 'pb-20' : ''}>

      {/* ── Hero ── */}
      <div ref={heroRef}>
        <ProjectHero project={project} statusCfg={statusCfg} pct={pct} onDonate={handleDonate} />
      </div>

      {/* ── Sticky donate bar ── */}
      {showStickyBar && (
        <StickyDonateBar project={project} pct={pct} onDonate={handleDonate} />
      )}

      {/* ── Body ── */}
      <section className="py-12 bg-[#FAFAFA]">
        <div className="max-w-7xl mx-auto px-4 md:px-6">
          <div className="grid lg:grid-cols-[1fr_340px] gap-10 items-start">

            {/* ══ LEFT — Tabs ══ */}
            <div className="space-y-6">
              <div className="card p-0 overflow-hidden">

                {/* Tab bar */}
                <div className="flex border-b overflow-x-auto scrollbar-hide"
                  style={{ borderColor: 'rgba(91,45,142,0.08)' }}>
                  {tabs.map(t => (
                    <button key={t.key} onClick={() => setActiveTab(t.key)}
                      className="font-display flex-1 min-w-[80px] flex items-center justify-center gap-1.5 py-4 text-xs md:text-sm font-semibold transition-all relative whitespace-nowrap px-3"
                      style={{ color: activeTab === t.key ? BRAND : '#A3A3A3' }}>
                      <t.Icon className="w-3.5 h-3.5 flex-shrink-0"/>
                      <span>{t.label}</span>
                      {activeTab === t.key && (
                        <span className="absolute bottom-0 left-0 right-0 h-[3px] rounded-t-full"
                          style={{ background: `linear-gradient(90deg,${BRAND},${GOLD})` }}/>
                      )}
                    </button>
                  ))}
                </div>

                {/* Tab panels */}
                <div className="p-6 md:p-8">

                  {/* ── ABOUT ── */}
                  {activeTab === 'about' && (
                    <div>
                      <AboutSection project={project} />
                      <OrganizerSection project={project} />
                      <ImpactOutcomes project={project} />
                      <BudgetBreakdown project={project} />
                      <FAQSection project={project} />
                      <Divider />
                      <DetailsStrip project={project} />
                      <DonorWall projectId={project.id} />
                    </div>
                  )}

                  {/* ── UPDATES ── */}
                  {activeTab === 'updates' && <UpdatesSection project={project} />}

                  {/* ── GALLERY ── */}
                  {activeTab === 'gallery' && (
                    <GallerySection
                      media={allMedia}
                      onOpen={setLightbox}
                      videos={projectVideos}
                      user={user}
                      projectId={project.id}
                    />
                  )}

                  {/* ── DISCUSSION ── */}
                  {activeTab === 'discussion' && (
                    <CommentsSection projectId={project.id} user={user} />
                  )}
                </div>
              </div>
            </div>

            {/* ══ RIGHT — Sidebar ══ */}
            <div className="space-y-5 lg:sticky lg:top-24">
              <FundingCard project={project} pct={pct} daysLeft={daysLeft} onDonate={handleDonate} />
              <TimelineCard project={project} />
              <VolunteerCard />
              <DocumentsCard project={project} />
              <PartnersCard project={project} />
              {project.status === 'active' && <SubscribeCard projectId={project.id} />}
              <ShareCard project={project} />
            </div>
          </div>

          {/* ── Related projects ── */}
          {related?.length >= 2 && <RelatedProjects projects={related} />}
        </div>
      </section>

      {/* ── Lightbox ── */}
      {lightbox && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4"
          style={{ background: 'rgba(0,0,0,0.92)', backdropFilter: 'blur(10px)' }}
          onClick={() => setLightbox(null)}>
          <button className="absolute top-4 right-4 w-10 h-10 rounded-full flex items-center justify-center text-white hover:bg-white/10 transition-all"
            onClick={() => setLightbox(null)}>
            <X className="w-5 h-5"/>
          </button>
          {lightbox.type === 'video' ? (
            <video src={lightbox.url} controls autoPlay
              className="max-w-full max-h-[90vh] rounded-2xl"
              style={{ boxShadow: '0 40px 100px rgba(0,0,0,0.7)' }}
              onClick={e => e.stopPropagation()}/>
          ) : (
            <img src={lightbox.url} alt=""
              className="max-w-full max-h-[90vh] object-contain rounded-2xl"
              onClick={e => e.stopPropagation()}/>
          )}
        </div>
      )}

      {/* ── Back to top ── */}
      <BackToTopButton stickyBarVisible={showStickyBar} />

      {donateOpen && (
        <DonationModal
          onClose={() => { setDonateOpen(false); setDonateAmount(null) }}
          defaultProject={project.id}
          defaultAmount={donateAmount}
        />
      )}
    </div>
  )
}

/* ════════════════════════════════════
   HERO
════════════════════════════════════ */
function ProjectHero({ project, statusCfg, pct, onDonate }) {
  const raised = Number(project.raisedAmount || 0)
  const goal   = Number(project.goalAmount   || 0)

  return (
    <div className="relative overflow-hidden" style={{ minHeight: 560 }}>
      {project.coverImage ? (
        <>
          <img src={project.coverImage} alt="" className="absolute inset-0 w-full h-full object-cover"/>
          <div className="absolute inset-0"
            style={{ background: 'linear-gradient(105deg,rgba(10,4,24,0.96) 0%,rgba(10,4,24,0.8) 55%,rgba(10,4,24,0.45) 100%)' }}/>
        </>
      ) : (
        <div className="absolute inset-0" style={{ background: 'linear-gradient(135deg,#0A0418,#1A0A35 50%,#3D1A6B)' }}>
          <div className="absolute top-0 right-0 w-[500px] h-[500px] rounded-full pointer-events-none"
            style={{ background: 'radial-gradient(circle,rgba(91,45,142,0.35) 0%,transparent 65%)', transform: 'translate(30%,-30%)' }}/>
          <div className="absolute bottom-0 left-0 w-[350px] h-[350px] rounded-full pointer-events-none"
            style={{ background: 'radial-gradient(circle,rgba(240,165,0,0.08) 0%,transparent 65%)', transform: 'translate(-30%,30%)' }}/>
        </div>
      )}

      <div className="relative max-w-7xl mx-auto px-4 md:px-6 py-16">
        <div className="grid lg:grid-cols-[1fr_300px] gap-12 items-center">

          {/* Left */}
          <div>
            {/* Breadcrumb */}
            <nav className="font-display flex items-center gap-2 text-xs mb-5 text-white/45">
              <Link to="/" className="hover:text-white transition-colors flex items-center gap-1">
                <Home className="w-3 h-3"/>Home
              </Link>
              <ChevronRight className="w-3 h-3 text-gold"/>
              <Link to="/projects" className="hover:text-white transition-colors">Projects</Link>
              <ChevronRight className="w-3 h-3 text-gold"/>
              <span className="text-gold/80 truncate max-w-[200px]">{project.title}</span>
            </nav>

            {/* Badges */}
            <div className="flex items-center gap-3 mb-4 flex-wrap">
              <span className="font-display flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-[0.08em]"
                style={{ color: statusCfg.color }}>
                <statusCfg.Icon className="w-3 h-3"/>{statusCfg.label}
              </span>
              {project.category && (
                <span className="font-display text-[10px] font-bold uppercase tracking-[0.1em] text-white/45 capitalize">
                  {project.category}
                </span>
              )}
              {project.isUrgent && (
                <span className="font-display text-[10px] font-bold uppercase tracking-wider px-3 py-1 rounded-full flex items-center gap-1.5 animate-pulse"
                  style={{ background: 'rgba(220,38,38,0.8)', color: '#fff' }}>
                  <AlertCircle className="w-3 h-3"/>Urgent
                </span>
              )}
              {project.isFeatured && (
                <span className="font-display text-[10px] font-semibold text-gold/60 flex items-center gap-1">
                  <Star className="w-3 h-3"/>Featured
                </span>
              )}
            </div>

            <h1 className="font-display font-extrabold text-white leading-tight mb-4"
              style={{ fontSize: 'clamp(1.8rem,4vw,3rem)', textShadow: '0 4px 30px rgba(0,0,0,0.4)', maxWidth: 680 }}>
              {project.title}
            </h1>

            <p className="font-display text-sm leading-relaxed mb-7 max-w-xl text-white/65">
              {project.summary}
            </p>

            {/* Stats strip */}
            <div className="flex flex-wrap gap-6">
              {[
                { Icon: Users, val: project.donorCount    || 0, label: 'Donors'        },
                { Icon: Heart, val: project.beneficiaries || 0, label: 'Beneficiaries' },
                { Icon: Eye,   val: project.viewCount     || 0, label: 'Views'          },
              ].filter(s => s.val > 0).map(s => (
                <div key={s.label} className="flex items-center gap-2.5">
                  <div className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0"
                    style={{ background: 'rgba(240,165,0,0.15)', border: '1px solid rgba(240,165,0,0.2)' }}>
                    <s.Icon className="w-4 h-4 text-gold"/>
                  </div>
                  <div>
                    <div className="font-display font-bold text-white text-sm leading-none">
                      {Number(s.val).toLocaleString()}
                    </div>
                    <div className="font-display text-[10px] mt-0.5 text-white/40">{s.label}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Right: mini funding panel (desktop) */}
          <div className="hidden lg:block">
            <div className="rounded-3xl p-6 backdrop-blur-md"
              style={{ background: 'rgba(255,255,255,0.07)', border: '1px solid rgba(255,255,255,0.12)', boxShadow: '0 20px 60px rgba(0,0,0,0.3)' }}>
              <div className="text-center mb-4">
                <div className="font-display font-extrabold text-5xl text-white leading-none">{pct}%</div>
                <div className="font-display text-[10px] uppercase tracking-widest text-white/45 mt-1.5">Funded</div>
              </div>
              <div className="h-2 rounded-full overflow-hidden mb-4" style={{ background: 'rgba(255,255,255,0.1)' }}>
                <div className="h-full rounded-full"
                  style={{ width: `${pct}%`, background: `linear-gradient(90deg,${BRAND},${GOLD})` }}/>
              </div>
              <div className="grid grid-cols-2 gap-2 mb-4">
                <div className="p-3 rounded-2xl text-center" style={{ background: 'rgba(255,255,255,0.06)' }}>
                  <div className="font-display font-bold text-white text-sm">{fmt(raised)}</div>
                  <div className="font-display text-[9px] text-white/40 mt-0.5">XAF raised</div>
                </div>
                <div className="p-3 rounded-2xl text-center" style={{ background: 'rgba(255,255,255,0.06)' }}>
                  <div className="font-display font-bold text-white text-sm">{fmt(goal)}</div>
                  <div className="font-display text-[9px] text-white/40 mt-0.5">XAF goal</div>
                </div>
              </div>
              {project.donorCount > 0 && (
                <p className="font-display text-center text-[11px] mb-3 text-white/50">
                  Join <span className="font-bold text-gold">{Number(project.donorCount).toLocaleString()}</span> others
                </p>
              )}
              {project.status !== 'completed' ? (
                <button onClick={() => onDonate()}
                  className="font-display w-full py-3 rounded-2xl font-bold text-sm text-white flex items-center justify-center gap-2 transition-all hover:opacity-90 hover:-translate-y-0.5"
                  style={{ background: `linear-gradient(135deg,${GOLD},#FFB84D)`, boxShadow: '0 4px 20px rgba(240,165,0,0.4)' }}>
                  <HeartHandshake className="w-4 h-4"/>Donate Now
                </button>
              ) : (
                <div className="font-display w-full py-3 rounded-2xl font-bold text-sm flex items-center justify-center gap-2 text-white/80"
                  style={{ background: 'rgba(255,255,255,0.08)' }}>
                  <CheckCircle2 className="w-4 h-4 text-gold"/>Goal Reached!
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

/* ════════════════════════════════════
   STICKY DONATE BAR
════════════════════════════════════ */
function StickyDonateBar({ project, pct, onDonate }) {
  return (
    <div className="fixed bottom-0 left-0 right-0 z-40 flex items-center justify-between gap-4 px-4 md:px-8 py-3"
      style={{ background: 'rgba(10,4,24,0.96)', backdropFilter: 'blur(14px)', borderTop: '1px solid rgba(255,255,255,0.08)', boxShadow: '0 -8px 30px rgba(0,0,0,0.4)' }}>
      <div className="flex items-center gap-4 min-w-0">
        <p className="font-display font-semibold text-sm text-white truncate hidden sm:block max-w-[280px] lg:max-w-[460px]">
          {project.title}
        </p>
        <div className="flex items-center gap-2 flex-shrink-0">
          <div className="w-24 h-1.5 rounded-full overflow-hidden" style={{ background: 'rgba(255,255,255,0.1)' }}>
            <div className="h-full rounded-full"
              style={{ width: `${pct}%`, background: `linear-gradient(90deg,${BRAND},${GOLD})` }}/>
          </div>
          <span className="font-display text-xs font-bold text-gold">{pct}%</span>
        </div>
      </div>
      <button onClick={() => onDonate()}
        className="font-display flex-shrink-0 flex items-center gap-2 px-5 py-2.5 rounded-2xl font-bold text-sm text-white transition-all hover:opacity-90 active:scale-[0.98]"
        style={{ background: `linear-gradient(135deg,${GOLD},#FFB84D)`, boxShadow: '0 4px 14px rgba(240,165,0,0.4)' }}>
        <HeartHandshake className="w-4 h-4"/>
        <span className="hidden sm:inline">Donate Now</span>
        <span className="sm:hidden">Donate</span>
      </button>
    </div>
  )
}

/* ════════════════════════════════════
   BACK TO TOP
════════════════════════════════════ */
function BackToTopButton({ stickyBarVisible }) {
  const [visible, setVisible] = useState(false)
  useEffect(() => {
    const fn = () => setVisible(window.scrollY > 500)
    window.addEventListener('scroll', fn, { passive: true })
    return () => window.removeEventListener('scroll', fn)
  }, [])
  if (!visible) return null
  return (
    <button
      onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
      title="Back to top"
      className="fixed right-5 z-40 w-10 h-10 rounded-full flex items-center justify-center text-white shadow-lg transition-all hover:scale-110 active:scale-95"
      style={{
        bottom:     stickyBarVisible ? '5rem' : '1.5rem',
        background: `linear-gradient(135deg,${BRAND},#7B4DB8)`,
        boxShadow:  '0 4px 16px rgba(91,45,142,0.45)',
        transition: 'bottom 0.3s ease',
      }}>
      <ChevronUp className="w-4 h-4"/>
    </button>
  )
}

/* ════════════════════════════════════
   ABOUT SECTION
════════════════════════════════════ */
function AboutSection({ project }) {
  const [expanded, setExpanded] = useState(false)
  const desc   = project.description || ''
  const isLong = desc.length > 600
  const shown  = isLong && !expanded ? desc.slice(0, 600) + '…' : desc

  const sentenceEnd = desc.search(/[.!?]\s/)
  const lead = sentenceEnd > 40 && sentenceEnd < 200 ? desc.slice(0, sentenceEnd + 1) : null
  const rest = lead ? shown.slice(sentenceEnd + 1).trim() : shown

  return (
    <div>
      <SectionTitle Icon={Info} title="About This Project" />
      {lead && (
        <p className="font-display text-base font-semibold leading-relaxed mt-5 pl-4 text-dark"
          style={{ borderLeft: `3px solid ${GOLD}` }}>
          {lead}
        </p>
      )}
      <div className="font-display text-sm leading-relaxed whitespace-pre-line mt-4 text-muted-foreground">
        {rest || shown}
      </div>
      {isLong && (
        <button onClick={() => setExpanded(e => !e)}
          className="font-display mt-4 text-xs font-semibold flex items-center gap-1.5 text-primary-500">
          {expanded ? <ChevronUp className="w-3 h-3"/> : <ChevronDown className="w-3 h-3"/>}
          {expanded ? 'Show less' : 'Read more'}
        </button>
      )}
    </div>
  )
}

/* ════════════════════════════════════
   ORGANIZER SECTION
════════════════════════════════════ */
function OrganizerSection({ project }) {
  const org = project.organizer
  if (!org) return null
  return (
    <>
      <Divider />
      <SectionTitle Icon={User} title="About the Organizer" />
      <div className="mt-5 flex items-start gap-4 p-5 rounded-2xl"
        style={{ background: 'rgba(91,45,142,0.03)', border: '1px solid rgba(91,45,142,0.07)' }}>
        <div className="w-14 h-14 rounded-full flex items-center justify-center text-white text-lg font-bold flex-shrink-0 overflow-hidden"
          style={{ background: `linear-gradient(135deg,${BRAND},${GOLD})` }}>
          {org.photo
            ? <img src={org.photo} alt={org.name} className="w-full h-full object-cover"/>
            : (org.name?.charAt(0) || '?').toUpperCase()
          }
        </div>
        <div className="flex-1 min-w-0">
          <div className="font-display font-bold text-sm text-dark">{org.name}</div>
          {org.role && (
            <div className="font-display text-xs font-semibold mt-0.5 text-primary-500">{org.role}</div>
          )}
          {org.bio && (
            <p className="font-display text-sm leading-relaxed mt-2 text-muted-foreground">{org.bio}</p>
          )}
          {org.memberSince && (
            <div className="font-display text-[10px] mt-2 text-muted-foreground flex items-center gap-1">
              <Clock className="w-3 h-3"/>Member since {org.memberSince}
            </div>
          )}
        </div>
      </div>
    </>
  )
}

/* ════════════════════════════════════
   IMPACT OUTCOMES
════════════════════════════════════ */
function ImpactOutcomes({ project }) {
  const outcomes = project.outcomes
  if (!outcomes?.length) return null
  return (
    <>
      <Divider />
      <SectionTitle Icon={TrendingUp} title="Impact So Far" />
      <div className="mt-5 grid sm:grid-cols-2 gap-3">
        {outcomes.map((o, i) => (
          <div key={i} className="flex items-start gap-3 p-4 rounded-2xl"
            style={{ background: 'rgba(240,165,0,0.04)', border: '1px solid rgba(240,165,0,0.1)' }}>
            <div className="w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0"
              style={{ background: 'rgba(240,165,0,0.12)' }}>
              <CheckCircle2 className="w-4 h-4 text-gold"/>
            </div>
            <div>
              {o.value && (
                <div className="font-display font-bold text-base text-dark">{o.value}</div>
              )}
              <div className="font-display text-sm text-muted-foreground">{o.label}</div>
            </div>
          </div>
        ))}
      </div>
    </>
  )
}

/* ════════════════════════════════════
   BUDGET BREAKDOWN
════════════════════════════════════ */
const BAR_COLORS = [BRAND, GOLD, '#7B4DB8', '#FFB84D', '#9B6DD8', '#FFC87A']

function BudgetBreakdown({ project }) {
  const items = project.budgetBreakdown
  if (!items?.length) return null
  return (
    <>
      <Divider />
      <SectionTitle Icon={BarChart2} title="Budget Breakdown" />
      <div className="mt-5 space-y-4">
        {items.map((item, i) => (
          <div key={i}>
            <div className="flex justify-between font-display text-xs mb-1.5">
              <span className="font-semibold text-dark">{item.label}</span>
              <div className="flex items-center gap-2">
                {item.amount && (
                  <span className="text-muted-foreground">{Number(item.amount).toLocaleString()} XAF</span>
                )}
                <span className="font-bold" style={{ color: BAR_COLORS[i % BAR_COLORS.length] }}>
                  {item.pct}%
                </span>
              </div>
            </div>
            <div className="h-2.5 rounded-full overflow-hidden" style={{ background: 'rgba(91,45,142,0.06)' }}>
              <div className="h-full rounded-full transition-all duration-700"
                style={{ width: `${item.pct}%`, background: BAR_COLORS[i % BAR_COLORS.length] }}/>
            </div>
          </div>
        ))}
      </div>
    </>
  )
}

/* ════════════════════════════════════
   FAQ SECTION
════════════════════════════════════ */
function FAQSection({ project }) {
  const faqs = project.faqs
  if (!faqs?.length) return null
  return (
    <>
      <Divider />
      <SectionTitle Icon={HelpCircle} title="Frequently Asked Questions" />
      <div className="mt-5 space-y-2">
        {faqs.map((faq, i) => (
          <FAQItem key={i} question={faq.question} answer={faq.answer} />
        ))}
      </div>
    </>
  )
}

function FAQItem({ question, answer }) {
  const [open, setOpen] = useState(false)
  return (
    <div className="rounded-2xl overflow-hidden transition-all"
      style={{ border: '1px solid rgba(91,45,142,0.08)' }}>
      <button onClick={() => setOpen(o => !o)}
        className="font-display w-full flex items-center justify-between px-5 py-4 text-sm font-semibold text-dark text-left gap-4 transition-colors"
        style={{ background: open ? 'rgba(91,45,142,0.04)' : 'transparent' }}>
        <span>{question}</span>
        {open
          ? <ChevronUp className="w-4 h-4 flex-shrink-0 text-primary-500"/>
          : <ChevronDown className="w-4 h-4 flex-shrink-0 text-muted-foreground"/>}
      </button>
      {open && (
        <div className="font-display px-5 pb-5 pt-1 text-sm leading-relaxed text-muted-foreground border-t"
          style={{ borderColor: 'rgba(91,45,142,0.07)' }}>
          {answer}
        </div>
      )}
    </div>
  )
}

/* ════════════════════════════════════
   DETAILS STRIP
════════════════════════════════════ */
function DetailsStrip({ project }) {
  const items = [
    project.category  && { Icon: Tag,          label: 'Category', value: project.category,  cap: true },
    project.location  && { Icon: MapPin,        label: 'Location', value: project.location },
    project.startDate && { Icon: CalendarPlus,  label: 'Started',  value: format(new Date(project.startDate), 'MMM d, yyyy') },
    project.endDate   && { Icon: CalendarCheck, label: 'Target',   value: format(new Date(project.endDate),   'MMM d, yyyy') },
    project.createdAt && { Icon: Clock,         label: 'Launched', value: formatDistanceToNow(new Date(project.createdAt), { addSuffix: true }) },
  ].filter(Boolean)

  if (!items.length) return null
  return (
    <div className="flex flex-wrap gap-x-6 gap-y-3">
      {items.map(item => (
        <div key={item.label} className="flex items-center gap-1.5">
          <item.Icon className="w-3.5 h-3.5 flex-shrink-0 text-primary-500/50"/>
          <span className="font-display text-[11px] text-muted-foreground">{item.label}:</span>
          <span className="font-display text-[11px] font-semibold text-dark"
            style={{ textTransform: item.cap ? 'capitalize' : 'none' }}>
            {item.value}
          </span>
        </div>
      ))}
    </div>
  )
}

/* ════════════════════════════════════
   DONOR WALL
════════════════════════════════════ */
function DonorWall({ projectId }) {
  const { data: donors, isLoading } = useQuery(
    ['project-donors', projectId],
    () => api.get(`/projects/${projectId}/donors`).then(r => r.data)
  )
  if (!isLoading && !donors?.length) return null
  return (
    <div>
      <Divider />
      <SectionTitle Icon={Users} title="Recent Donors" />
      <p className="font-display text-xs mt-1 mb-5 text-muted-foreground">
        Thank you to everyone who has contributed to this project.
      </p>
      {isLoading ? (
        <div className="space-y-3">
          {[1,2,3].map(i => <div key={i} className="h-14 rounded-2xl animate-pulse bg-primary-500/5"/>)}
        </div>
      ) : (
        <div className="space-y-2">
          {donors.slice(0, 8).map(d => (
            <div key={d.id} className="flex items-center gap-4 p-3 rounded-2xl transition-colors hover:bg-neutral-50">
              <div className="w-10 h-10 rounded-full flex items-center justify-center text-white text-sm font-bold flex-shrink-0"
                style={{ background: `linear-gradient(135deg,${BRAND},${GOLD})` }}>
                {d.donorName === 'Anonymous'
                  ? <Eye className="w-4 h-4 opacity-50"/>
                  : d.donorName.charAt(0).toUpperCase()}
              </div>
              <div className="flex-1 min-w-0">
                <div className="font-display font-semibold text-sm text-dark">{d.donorName}</div>
                {d.message && (
                  <div className="font-display text-xs truncate italic text-muted-foreground">"{d.message}"</div>
                )}
              </div>
              <div className="text-right flex-shrink-0">
                <div className="font-display font-bold text-sm text-primary-500">
                  {Number(d.amount).toLocaleString()}
                  <span className="text-[10px] font-normal text-muted-foreground ml-0.5">XAF</span>
                </div>
                <div className="font-display text-[10px] text-muted-foreground">
                  {formatDistanceToNow(new Date(d.createdAt), { addSuffix: true })}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

/* ════════════════════════════════════
   UPDATES TIMELINE
════════════════════════════════════ */
function UpdatesSection({ project }) {
  if (!project.updates?.length) {
    return (
      <div className="py-16 text-center">
        <Bell className="w-12 h-12 mx-auto mb-4 text-primary-500/15"/>
        <h3 className="font-display font-semibold text-base mb-2 text-dark">No updates yet</h3>
        <p className="font-display text-sm text-muted-foreground">
          The project team will post updates here as work progresses.
        </p>
      </div>
    )
  }
  return (
    <div>
      <SectionTitle Icon={Bell} title="Project Updates" />
      <div className="mt-6">
        {project.updates.map((u, i) => (
          <div key={u.id} className="flex gap-5">
            <div className="flex flex-col items-center flex-shrink-0">
              <div className="w-10 h-10 rounded-full flex items-center justify-center text-white text-xs font-bold shadow-md"
                style={{ background: `linear-gradient(135deg,${BRAND},${GOLD})` }}>
                {i + 1}
              </div>
              {i < project.updates.length - 1 && (
                <div className="w-0.5 flex-1 my-2 rounded-full bg-primary-500/10" style={{ minHeight: 32 }}/>
              )}
            </div>
            <div className="flex-1 pb-8">
              <div className="flex items-start justify-between gap-4 mb-2">
                <h4 className="font-display font-semibold text-base text-dark">{u.title}</h4>
                {u.createdAt && (
                  <span className="font-display text-[10px] font-semibold px-2.5 py-1 rounded-full flex-shrink-0 text-primary-500"
                    style={{ background: 'rgba(91,45,142,0.08)' }}>
                    {format(new Date(u.createdAt), 'MMM d, yyyy')}
                  </span>
                )}
              </div>
              <p className="font-display text-sm leading-relaxed text-muted-foreground">{u.content}</p>
              {u.author_name && (
                <div className="flex items-center gap-2 mt-3">
                  <div className="w-6 h-6 rounded-full flex items-center justify-center text-white text-[10px] font-bold bg-primary-500">
                    {u.author_name.charAt(0).toUpperCase()}
                  </div>
                  <span className="font-display text-xs font-semibold text-muted-foreground">{u.author_name}</span>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

/* ════════════════════════════════════
   GALLERY
════════════════════════════════════ */
function getVideoThumb(url) {
  if (!url) return null
  if (url.includes('res.cloudinary.com') && /\.(mp4|mov|webm|mkv)/i.test(url)) {
    return url.replace('/video/upload/', '/video/upload/so_1/').replace(/\.(mp4|mov|webm|mkv)$/i, '.jpg')
  }
  return null
}

function GallerySection({ media, onOpen, videos: galleryVideos = [], user, projectId }) {
  const hasMedia = media.length > 0 || galleryVideos.length > 0
  return (
    <div className="space-y-8">
      {!hasMedia && (
        <div className="py-12 text-center">
          <Images className="w-12 h-12 mx-auto mb-4 text-primary-500/20"/>
          <p className="font-display text-sm text-muted-foreground">No media yet — be the first to contribute!</p>
        </div>
      )}

      {media.length > 0 && (
        <div>
          <SectionTitle Icon={Images} title="Photos" />
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mt-5">
            {media.map((m, i) => (
              <button key={i} onClick={() => onOpen({ url: m.url, type: 'image' })}
                className="relative overflow-hidden rounded-2xl group transition-all hover:scale-[1.02]"
                style={{ aspectRatio: '4/3', background: 'rgba(91,45,142,0.08)' }}>
                <img src={m.url} alt="" className="w-full h-full object-cover"/>
                <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                  style={{ background: 'rgba(0,0,0,0.35)' }}>
                  <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center backdrop-blur-sm">
                    <Maximize2 className="w-4 h-4 text-white"/>
                  </div>
                </div>
              </button>
            ))}
          </div>
        </div>
      )}

      {galleryVideos.length > 0 && (
        <div>
          <SectionTitle Icon={Film} title="Videos" />
          <div className="grid sm:grid-cols-2 gap-4 mt-5">
            {galleryVideos.map(v => {
              const thumb = v.thumbnail || getVideoThumb(v.url)
              return (
                <div key={v.id}
                  className="relative overflow-hidden rounded-2xl cursor-pointer group transition-all hover:scale-[1.02]"
                  style={{ aspectRatio: '16/9', background: 'linear-gradient(135deg,#1A0A35,#3D1A6B)' }}
                  onClick={() => onOpen({ url: v.url, type: 'video' })}>
                  {thumb
                    ? <img src={thumb} alt={v.title || ''} className="absolute inset-0 w-full h-full object-cover"/>
                    : <div className="absolute inset-0" style={{ background: 'rgba(91,45,142,0.3)' }}/>
                  }
                  <div className="absolute inset-0 flex flex-col items-center justify-center gap-3"
                    style={{ background: thumb ? 'rgba(0,0,0,0.4)' : 'transparent' }}>
                    <div className="w-14 h-14 rounded-full bg-white/15 backdrop-blur-sm flex items-center justify-center group-hover:scale-110 transition-transform border border-white/20">
                      <Play className="w-5 h-5 text-white ml-0.5"/>
                    </div>
                    {v.title && <div className="font-display text-white font-semibold text-sm text-center px-4">{v.title}</div>}
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      )}

      {/* ── Contribute section ── */}
      <div className="pt-6 border-t" style={{ borderColor: 'rgba(91,45,142,0.07)' }}>
        {user
          ? <GalleryContributeZone projectId={projectId} user={user} />
          : <GallerySignInPrompt />
        }
      </div>
    </div>
  )
}

/* ── Member upload zone ── */
function GalleryContributeZone({ projectId }) {
  const fileRef   = useRef(null)
  const cameraRef = useRef(null)

  const [file,      setFile]      = useState(null)
  const [preview,   setPreview]   = useState(null)
  const [title,     setTitle]     = useState('')
  const [progress,  setProgress]  = useState(0)
  const [uploading, setUploading] = useState(false)
  const [done,      setDone]      = useState(false)
  const [error,     setError]     = useState('')

  const ACCEPTED = ['image/jpeg','image/png','image/webp','image/gif','video/mp4','video/quicktime','video/webm']
  const MAX_MB   = 50

  const handleFile = f => {
    if (!f) return
    if (!f.type.startsWith('image/') && !f.type.startsWith('video/')) {
      setError('Only images and videos are supported.')
      return
    }
    if (f.size > MAX_MB * 1024 * 1024) {
      setError(`File must be under ${MAX_MB} MB.`)
      return
    }
    setError('')
    setFile(f)
    setPreview(URL.createObjectURL(f))
  }

  const reset = () => {
    setFile(null); setPreview(null); setTitle(''); setProgress(0)
    setUploading(false); setDone(false); setError('')
  }

  const submit = async () => {
    if (!file || uploading) return
    setUploading(true); setError('')
    try {
      /* 1 — upload to Cloudinary */
      const fd = new FormData()
      fd.append('file', file)
      const { data: uploaded } = await api.post('/upload/image', fd, {
        headers: { 'Content-Type': 'multipart/form-data' },
        onUploadProgress: e => setProgress(Math.round((e.loaded / e.total) * 80)),
      })
      setProgress(90)
      /* 2 — submit contribution */
      await api.post('/gallery/contribute', {
        url:        uploaded.url,
        media_type: file.type.startsWith('video/') ? 'video' : 'image',
        title:      title.trim() || null,
        project_id: projectId,
      })
      setProgress(100)
      setDone(true)
    } catch (err) {
      setError(err.response?.data?.error || 'Upload failed. Please try again.')
      setUploading(false); setProgress(0)
    }
  }

  /* Success state */
  if (done) {
    return (
      <div className="rounded-2xl p-8 text-center"
        style={{ background: 'rgba(91,45,142,0.04)', border: '1px solid rgba(91,45,142,0.1)' }}>
        <div className="w-14 h-14 rounded-full flex items-center justify-center mx-auto mb-4"
          style={{ background: 'rgba(91,45,142,0.1)' }}>
          <CheckCircle className="w-7 h-7 text-primary-500"/>
        </div>
        <h3 className="font-display font-bold text-base mb-1 text-dark">Submitted for Review</h3>
        <p className="font-display text-sm text-muted-foreground mb-5">
          Thank you! Your photo/video will appear in the gallery once an admin approves it.
        </p>
        <button onClick={reset}
          className="font-display text-xs font-semibold px-5 py-2 rounded-xl text-primary-500 transition-all hover:bg-primary-500/8"
          style={{ border: '1px solid rgba(91,45,142,0.15)' }}>
          Contribute Another
        </button>
      </div>
    )
  }

  return (
    <div>
      <div className="flex items-center gap-3 mb-5">
        <div className="w-9 h-9 rounded-2xl flex items-center justify-center flex-shrink-0 bg-primary-500/8">
          <Upload className="w-4 h-4 text-primary-500"/>
        </div>
        <div>
          <h3 className="font-display font-bold text-base text-dark">Contribute a Photo or Video</h3>
          <p className="font-display text-xs text-muted-foreground mt-0.5">
            Share your moment from this project. It will be reviewed before publishing.
          </p>
        </div>
      </div>

      {/* Drop zone */}
      {!file ? (
        <div className="rounded-2xl border-2 border-dashed p-8 text-center cursor-pointer transition-all hover:border-primary-500/50 hover:bg-primary-500/3"
          style={{ borderColor: 'rgba(91,45,142,0.2)', background: 'rgba(91,45,142,0.02)' }}
          onDrop={e => { e.preventDefault(); handleFile(e.dataTransfer.files?.[0]) }}
          onDragOver={e => e.preventDefault()}
          onClick={() => fileRef.current?.click()}>
          <Upload className="w-8 h-8 mx-auto mb-3 text-primary-500/40"/>
          <p className="font-display text-sm font-semibold text-dark mb-1">
            Click or drag & drop to upload
          </p>
          <p className="font-display text-xs text-muted-foreground mb-4">
            Images (JPG, PNG, WebP) or Videos (MP4, MOV) · max {MAX_MB} MB
          </p>
          <button type="button"
            className="font-display inline-flex items-center gap-2 text-xs font-bold px-4 py-2 rounded-xl text-white"
            style={{ background: 'linear-gradient(135deg,#5B2D8E,#7B4DB8)' }}
            onClick={e => { e.stopPropagation(); cameraRef.current?.click() }}>
            <Camera className="w-3.5 h-3.5"/>Use Camera
          </button>
          <input ref={fileRef}   type="file" className="hidden" accept="image/*,video/*"
            onChange={e => handleFile(e.target.files?.[0])} />
          <input ref={cameraRef} type="file" className="hidden" accept="image/*,video/*" capture="environment"
            onChange={e => handleFile(e.target.files?.[0])} />
        </div>
      ) : (
        <div className="space-y-4">
          {/* Preview */}
          <div className="relative rounded-2xl overflow-hidden"
            style={{ aspectRatio: file.type.startsWith('video/') ? '16/9' : '4/3', background: 'rgba(91,45,142,0.08)' }}>
            {file.type.startsWith('video/')
              ? <video src={preview} className="w-full h-full object-cover" muted/>
              : <img src={preview} alt="preview" className="w-full h-full object-cover"/>
            }
            <button onClick={reset}
              className="absolute top-2 right-2 w-8 h-8 rounded-full flex items-center justify-center text-white transition-all hover:scale-110"
              style={{ background: 'rgba(0,0,0,0.6)' }}>
              <X className="w-4 h-4"/>
            </button>
            <div className="absolute bottom-2 left-2">
              <span className="font-display text-[10px] font-bold px-2 py-1 rounded-full text-white uppercase"
                style={{ background: 'rgba(0,0,0,0.6)' }}>
                {file.type.startsWith('video/') ? 'Video' : 'Photo'}
              </span>
            </div>
          </div>

          {/* Title */}
          <input value={title} onChange={e => setTitle(e.target.value)}
            placeholder="Add a caption (optional)"
            className="font-display w-full px-4 py-3 rounded-xl text-sm outline-none text-dark"
            style={{ background: '#F8F5FF', border: '1.5px solid rgba(91,45,142,0.12)' }}
          />

          {/* Progress */}
          {uploading && (
            <div>
              <div className="flex justify-between font-display text-xs mb-1.5 text-muted-foreground">
                <span>Uploading…</span>
                <span>{progress}%</span>
              </div>
              <div className="h-2 rounded-full overflow-hidden" style={{ background: 'rgba(91,45,142,0.08)' }}>
                <div className="h-full rounded-full transition-all duration-300"
                  style={{ width: `${progress}%`, background: 'linear-gradient(90deg,#5B2D8E,#F0A500)' }}/>
              </div>
            </div>
          )}

          {error && (
            <p className="font-display text-xs text-red-500 flex items-center gap-1.5">
              <AlertCircle className="w-3.5 h-3.5 flex-shrink-0"/>{error}
            </p>
          )}

          <button onClick={submit} disabled={uploading}
            className="font-display w-full py-3 rounded-2xl font-bold text-sm text-white flex items-center justify-center gap-2 transition-all hover:opacity-90 disabled:opacity-50"
            style={{ background: 'linear-gradient(135deg,#5B2D8E,#F0A500)', boxShadow: '0 4px 16px rgba(91,45,142,0.3)' }}>
            {uploading
              ? <><Loader2 className="w-4 h-4 animate-spin"/>Uploading…</>
              : <><Upload className="w-4 h-4"/>Submit for Review</>
            }
          </button>
        </div>
      )}
    </div>
  )
}

/* ── Guest prompt ── */
function GallerySignInPrompt() {
  return (
    <div className="rounded-2xl p-6 flex items-center gap-4"
      style={{ background: 'rgba(91,45,142,0.03)', border: '1px dashed rgba(91,45,142,0.15)' }}>
      <div className="w-10 h-10 rounded-2xl flex items-center justify-center flex-shrink-0 bg-primary-500/8">
        <Lock className="w-4 h-4 text-primary-500"/>
      </div>
      <div className="flex-1">
        <p className="font-display font-semibold text-sm text-dark">Want to contribute?</p>
        <p className="font-display text-xs text-muted-foreground mt-0.5">
          Sign in to upload your photos and videos from this project.
        </p>
      </div>
      <Link to="/login"
        className="font-display flex-shrink-0 text-xs font-bold px-4 py-2 rounded-xl text-white transition-all hover:opacity-90"
        style={{ background: 'linear-gradient(135deg,#5B2D8E,#7B4DB8)' }}>
        Sign In
      </Link>
    </div>
  )
}

/* ════════════════════════════════════
   COMMENTS
════════════════════════════════════ */
function CommentsSection({ projectId, user }) {
  const qc = useQueryClient()
  const [text,       setText]       = useState('')
  const [guestName,  setGuestName]  = useState('')
  const [submitting, setSubmitting] = useState(false)

  const { data: comments = [], isLoading } = useQuery(
    ['project-comments', projectId],
    () => api.get(`/projects/${projectId}/comments`).then(r => r.data)
  )

  const submit = async e => {
    e.preventDefault()
    if (!text.trim()) return
    setSubmitting(true)
    try {
      await api.post(`/projects/${projectId}/comments`, {
        content: text.trim(),
        name: guestName.trim() || undefined,
      })
      setText('')
      setGuestName('')
      qc.invalidateQueries(['project-comments', projectId])
    } catch { /* ignore */ }
    finally { setSubmitting(false) }
  }

  return (
    <div>
      <SectionTitle Icon={MessageSquare} title={`Discussion (${comments.length})`} />
      <form onSubmit={submit} className="mt-5 mb-6">
        {!user && (
          <input value={guestName} onChange={e => setGuestName(e.target.value)}
            placeholder="Your name (optional)"
            className="font-display w-full px-4 py-3 rounded-xl text-sm outline-none mb-3 text-dark"
            style={{ background: '#F8F5FF', border: '1.5px solid rgba(91,45,142,0.12)' }}
          />
        )}
        <div className="flex gap-3">
          <div className="w-10 h-10 rounded-full flex items-center justify-center text-white text-xs font-bold flex-shrink-0 mt-1 bg-gradient-to-br from-primary-500 to-primary-400">
            {user ? (user.firstName?.[0] || '?') : <User className="w-4 h-4"/>}
          </div>
          <div className="flex-1">
            <textarea value={text} onChange={e => setText(e.target.value)}
              rows={3} placeholder="Share your thoughts on this project…"
              className="font-display w-full px-4 py-3 rounded-2xl text-sm outline-none resize-none text-dark"
              style={{ background: '#F8F5FF', border: '1.5px solid rgba(91,45,142,0.12)' }}
              onFocus={e => { e.target.style.borderColor = BRAND; e.target.style.background = '#fff' }}
              onBlur={e  => { e.target.style.borderColor = 'rgba(91,45,142,0.12)'; e.target.style.background = '#F8F5FF' }}
            />
            <div className="flex justify-end mt-2">
              <button type="submit" disabled={submitting || !text.trim()}
                className="font-display px-5 py-2 rounded-xl text-sm font-semibold text-white transition-all hover:opacity-90 disabled:opacity-40 flex items-center gap-2 bg-gradient-to-br from-primary-500 to-primary-400">
                {submitting
                  ? <><Loader2 className="w-3.5 h-3.5 animate-spin"/>Posting…</>
                  : <><Send className="w-3.5 h-3.5"/>Post Comment</>}
              </button>
            </div>
          </div>
        </div>
      </form>
      {isLoading ? (
        <div className="space-y-4">
          {[1,2].map(i => <div key={i} className="h-20 rounded-2xl animate-pulse bg-primary-500/5"/>)}
        </div>
      ) : comments.length === 0 ? (
        <div className="text-center py-8">
          <MessageSquare className="w-8 h-8 mx-auto mb-3 text-primary-500/15"/>
          <p className="font-display text-sm text-muted-foreground">No comments yet — be the first!</p>
        </div>
      ) : (
        <div className="space-y-4">
          {comments.map(c => (
            <div key={c.id} className="flex gap-3">
              <div className="w-9 h-9 rounded-full flex items-center justify-center text-white text-xs font-bold flex-shrink-0 bg-gradient-to-br from-primary-500 to-primary-400">
                {c.name.charAt(0).toUpperCase()}
              </div>
              <div className="flex-1 p-4 rounded-2xl"
                style={{ background: 'rgba(91,45,142,0.03)', border: '1px solid rgba(91,45,142,0.07)' }}>
                <div className="flex items-center justify-between mb-1.5">
                  <span className="font-display font-semibold text-sm text-dark">{c.name}</span>
                  <span className="font-display text-[10px] text-muted-foreground">
                    {formatDistanceToNow(new Date(c.createdAt), { addSuffix: true })}
                  </span>
                </div>
                <p className="font-display text-sm leading-relaxed text-muted-foreground">{c.content}</p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

/* ════════════════════════════════════
   FUNDING CARD
════════════════════════════════════ */
const DONATE_PRESETS = [500, 1000, 5000]

function FundingCard({ project, pct, daysLeft, onDonate }) {
  const [selected, setSelected] = useState(null)
  const [custom,   setCustom]   = useState('')
  const { ref, inView } = useInView({ triggerOnce: true, threshold: 0.3 })

  const effectiveAmount = custom ? (parseInt(custom, 10) || null) : selected

  const handlePreset = amount => { setSelected(selected === amount ? null : amount); setCustom('') }
  const handleCustom = val    => { setCustom(val); setSelected(null) }

  const showCountdown = project.endDate && daysLeft !== null && daysLeft <= 7 && daysLeft > 0 && project.status !== 'completed'

  return (
    <div ref={ref} className="card p-6">
      {/* % funded with CountUp */}
      <div className="text-center mb-5 py-5 rounded-2xl" style={{ background: 'rgba(91,45,142,0.04)' }}>
        <div className="font-display font-extrabold text-5xl text-primary-500">
          {inView ? <CountUp end={pct} duration={1.5} suffix="%" /> : `${pct}%`}
        </div>
        <div className="font-display text-xs font-semibold mt-1 uppercase tracking-wider text-muted-foreground">Funded</div>
      </div>

      {/* Progress bar */}
      <div className="h-2.5 rounded-full overflow-hidden mb-3" style={{ background: 'rgba(91,45,142,0.08)' }}>
        <div className="h-full rounded-full transition-all duration-700"
          style={{ width: `${pct}%`, background: `linear-gradient(90deg,${BRAND},${GOLD})` }}/>
      </div>

      {/* Raised / Goal */}
      <div className="grid grid-cols-2 gap-3 mb-5">
        <div className="text-center p-3 rounded-2xl" style={{ background: 'rgba(91,45,142,0.04)' }}>
          <div className="font-display font-bold text-sm text-dark">{fmt(Number(project.raisedAmount || 0))}</div>
          <div className="font-display text-[10px] mt-0.5 text-muted-foreground">XAF raised</div>
        </div>
        <div className="text-center p-3 rounded-2xl" style={{ background: 'rgba(240,165,0,0.05)' }}>
          <div className="font-display font-bold text-sm text-dark">{fmt(Number(project.goalAmount || 0))}</div>
          <div className="font-display text-[10px] mt-0.5 text-muted-foreground">XAF goal</div>
        </div>
      </div>

      {project.status !== 'completed' && (
        <>
          {/* Urgency countdown */}
          {showCountdown && <CountdownTimer endDate={project.endDate} />}

          {/* Presets */}
          <div className="mb-3">
            <div className="font-display text-[10px] uppercase tracking-wider font-bold mb-2 text-muted-foreground">
              Quick Amount (XAF)
            </div>
            <div className="grid grid-cols-3 gap-2">
              {DONATE_PRESETS.map(amount => (
                <button key={amount} onClick={() => handlePreset(amount)}
                  className="font-display py-2.5 rounded-xl text-xs font-bold transition-all"
                  style={{
                    background: selected === amount ? `linear-gradient(135deg,${BRAND},#7B4DB8)` : 'rgba(91,45,142,0.06)',
                    color:      selected === amount ? '#fff' : BRAND,
                    border:     `1px solid ${selected === amount ? 'transparent' : 'rgba(91,45,142,0.15)'}`,
                    boxShadow:  selected === amount ? '0 4px 12px rgba(91,45,142,0.3)' : 'none',
                  }}>
                  {amount >= 1000 ? `${amount / 1000}K` : amount}
                </button>
              ))}
            </div>
          </div>

          {/* Custom amount */}
          <div className="mb-4">
            <input type="number" value={custom} onChange={e => handleCustom(e.target.value)}
              placeholder="Or enter custom amount" min="1"
              className="font-display w-full px-3 py-2.5 rounded-xl text-sm outline-none text-dark"
              style={{ background: custom ? '#fff' : '#F8F5FF', border: `1.5px solid ${custom ? BRAND : 'rgba(91,45,142,0.12)'}` }}
            />
          </div>

          {/* Donor strip */}
          <DonorAvatarStrip projectId={project.id} />

          {/* Meta rows */}
          <div className="space-y-2.5 mb-4">
            {project.donorCount   > 0 && <MetaRow Icon={Users}  value={`${Number(project.donorCount).toLocaleString()} donors`}/>}
            {project.beneficiaries > 0 && <MetaRow Icon={Heart} value={`${Number(project.beneficiaries).toLocaleString()} beneficiaries`}/>}
            {project.location        && <MetaRow Icon={MapPin}   value={project.location}/>}
          </div>

          {/* Social proof */}
          {project.donorCount > 0 && (
            <p className="font-display text-center text-xs mb-3 text-muted-foreground">
              Join <strong className="text-primary-500">{Number(project.donorCount).toLocaleString()}</strong> others who already donated
            </p>
          )}

          {/* CTA */}
          <button onClick={() => onDonate(effectiveAmount)}
            className="font-display w-full py-4 rounded-2xl font-bold text-sm text-white flex items-center justify-center gap-2 transition-all hover:opacity-90 active:scale-[0.98]"
            style={{ background: `linear-gradient(135deg,${BRAND},${GOLD})`, boxShadow: '0 8px 24px rgba(91,45,142,0.35)' }}>
            <HeartHandshake className="w-4 h-4"/>
            {effectiveAmount ? `Donate ${Number(effectiveAmount).toLocaleString()} XAF` : 'Donate Now'}
          </button>

          {project.isUrgent && (
            <p className="font-display text-center text-xs mt-3 flex items-center justify-center gap-1.5 text-red-500">
              <AlertCircle className="w-3.5 h-3.5"/>This project needs urgent support
            </p>
          )}
        </>
      )}

      {project.status === 'completed' && (
        <div className="font-display w-full py-4 rounded-2xl font-bold text-sm flex items-center justify-center gap-2 bg-primary-500/8 text-primary-500">
          <CheckCircle2 className="w-4 h-4"/>Project Completed!
        </div>
      )}
    </div>
  )
}

/* ── Urgency Countdown ── */
function CountdownTimer({ endDate }) {
  const [time, setTime] = useState(() => calcTimeLeft(endDate))
  useEffect(() => {
    const id = setInterval(() => setTime(calcTimeLeft(endDate)), 1000)
    return () => clearInterval(id)
  }, [endDate])
  if (!time) return null
  return (
    <div className="mb-4 p-3 rounded-2xl"
      style={{ background: 'rgba(220,38,38,0.04)', border: '1px solid rgba(220,38,38,0.12)' }}>
      <div className="font-display text-[10px] uppercase tracking-wider font-bold mb-2 text-center text-red-500/70">
        ⏱ Time Remaining
      </div>
      <div className="flex items-center justify-center gap-1">
        {[
          { val: time.days,    label: 'days'    },
          { val: time.hours,   label: 'hrs'     },
          { val: time.minutes, label: 'min'     },
          { val: time.seconds, label: 'sec'     },
        ].map(({ val, label }, i) => (
          <div key={label} className="flex items-center gap-1">
            <div className="text-center">
              <div className="font-display font-extrabold text-xl leading-none text-dark w-10 text-center tabular-nums">
                {String(val).padStart(2, '0')}
              </div>
              <div className="font-display text-[8px] uppercase tracking-wider text-muted-foreground">{label}</div>
            </div>
            {i < 3 && <span className="font-display font-bold text-lg text-muted-foreground/40 -mt-2">:</span>}
          </div>
        ))}
      </div>
    </div>
  )
}

/* ── Donor Avatar Strip ── */
function DonorAvatarStrip({ projectId }) {
  const { data: donors = [] } = useQuery(
    ['project-donors', projectId],
    () => api.get(`/projects/${projectId}/donors`).then(r => r.data)
  )
  if (!donors.length) return null
  const shown = donors.slice(0, 5)
  return (
    <div className="flex items-center gap-2.5 mb-4 p-3 rounded-2xl" style={{ background: 'rgba(91,45,142,0.03)' }}>
      <div className="flex -space-x-2 flex-shrink-0">
        {shown.map((d, i) => (
          <div key={d.id}
            className="w-7 h-7 rounded-full border-2 border-white flex items-center justify-center text-white text-[9px] font-bold flex-shrink-0"
            style={{ background: `linear-gradient(135deg,${BRAND},#7B4DB8)`, zIndex: shown.length - i }}>
            {d.donorName === 'Anonymous' ? '?' : d.donorName.charAt(0).toUpperCase()}
          </div>
        ))}
      </div>
      <div className="font-display text-xs text-muted-foreground">
        <span className="font-bold text-dark">{donors.length}</span> donor{donors.length !== 1 ? 's' : ''} · be one of them
      </div>
    </div>
  )
}

function MetaRow({ Icon, value }) {
  return (
    <div className="flex items-center gap-3 text-xs text-muted-foreground">
      <div className="w-7 h-7 rounded-xl flex items-center justify-center flex-shrink-0 bg-primary-500/8">
        <Icon className="w-3.5 h-3.5 text-primary-500"/>
      </div>
      <span className="font-display">{value}</span>
    </div>
  )
}

/* ════════════════════════════════════
   TIMELINE CARD
════════════════════════════════════ */
function TimelineCard({ project }) {
  if (!project.startDate && !project.endDate) return null
  const now   = new Date()
  const start = project.startDate ? new Date(project.startDate) : null
  const end   = project.endDate   ? new Date(project.endDate)   : null
  const daysLeft = end ? Math.max(0, Math.ceil((end - now) / 86_400_000)) : null

  let timePct = 0
  if (start && end) {
    timePct = Math.min(100, Math.max(0, Math.round(((now - start) / (end - start)) * 100)))
  }

  return (
    <div className="card p-5">
      <h3 className="font-display font-semibold text-sm mb-4 flex items-center gap-2 text-dark">
        <CalendarDays className="w-4 h-4 text-primary-500"/>Timeline
      </h3>
      {start && end && (
        <div className="mb-4">
          <div className="h-2 rounded-full overflow-hidden mb-1.5" style={{ background: 'rgba(91,45,142,0.08)' }}>
            <div className="h-full rounded-full"
              style={{ width: `${timePct}%`, background: `linear-gradient(90deg,${BRAND},${GOLD})` }}/>
          </div>
          <div className="flex justify-between font-display text-[9px] text-muted-foreground">
            <span>{format(start, 'MMM d, yy')}</span>
            <span className="font-semibold text-primary-500/70">{timePct}% elapsed</span>
            <span>{format(end, 'MMM d, yy')}</span>
          </div>
        </div>
      )}
      <div className="space-y-3">
        {start && (
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0 bg-primary-500/8">
              <Play className="w-3 h-3 text-primary-500"/>
            </div>
            <div>
              <div className="font-display text-[10px] uppercase tracking-wider font-semibold text-muted-foreground">Start</div>
              <div className="font-display text-sm font-semibold text-dark">{format(start, 'MMMM d, yyyy')}</div>
            </div>
          </div>
        )}
        {end && (
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0 bg-gold/10">
              <Flag className="w-3 h-3 text-gold"/>
            </div>
            <div>
              <div className="font-display text-[10px] uppercase tracking-wider font-semibold text-muted-foreground">Target</div>
              <div className="font-display text-sm font-semibold text-dark">{format(end, 'MMMM d, yyyy')}</div>
            </div>
          </div>
        )}
        {daysLeft !== null && daysLeft > 0 && project.status !== 'completed' && (
          <div className="pt-3 border-t text-center" style={{ borderColor: 'rgba(91,45,142,0.08)' }}>
            <span className="font-display text-2xl font-bold text-primary-500">{daysLeft}</span>
            <span className="font-display text-xs ml-1.5 text-muted-foreground">days remaining</span>
          </div>
        )}
      </div>
    </div>
  )
}

/* ════════════════════════════════════
   VOLUNTEER CARD
════════════════════════════════════ */
function VolunteerCard() {
  return (
    <div className="card p-5">
      <div className="flex items-start gap-3">
        <div className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0"
          style={{ background: 'rgba(240,165,0,0.1)' }}>
          <HeartHandshake className="w-4 h-4 text-gold"/>
        </div>
        <div>
          <h3 className="font-display font-semibold text-sm text-dark">Can't donate right now?</h3>
          <p className="font-display text-xs mt-1 mb-3 leading-relaxed text-muted-foreground">
            You can still make a difference — volunteer your time, skills, or network.
          </p>
          <Link to="/contact"
            className="font-display inline-flex items-center gap-1.5 text-xs font-bold px-4 py-2 rounded-xl text-white transition-all hover:opacity-90"
            style={{ background: `linear-gradient(135deg,${GOLD},#FFB84D)` }}>
            <HeartHandshake className="w-3 h-3"/>Get Involved
          </Link>
        </div>
      </div>
    </div>
  )
}

/* ════════════════════════════════════
   DOCUMENTS CARD
════════════════════════════════════ */
function DocumentsCard({ project }) {
  const docs = project.documents
  if (!docs?.length) return null
  return (
    <div className="card p-5">
      <h3 className="font-display font-semibold text-sm mb-4 flex items-center gap-2 text-dark">
        <FileText className="w-4 h-4 text-primary-500"/>Documents
      </h3>
      <div className="space-y-2">
        {docs.map((doc, i) => (
          <a key={i} href={doc.url} target="_blank" rel="noreferrer"
            className="font-display flex items-center gap-3 p-2.5 rounded-xl text-xs font-semibold transition-all hover:bg-primary-500/5 text-dark"
            style={{ border: '1px solid rgba(91,45,142,0.08)' }}>
            <div className="w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0 bg-primary-500/8">
              <FileText className="w-3.5 h-3.5 text-primary-500"/>
            </div>
            <span className="flex-1 truncate">{doc.title || doc.name || 'Document'}</span>
            <ExternalLink className="w-3 h-3 text-muted-foreground flex-shrink-0"/>
          </a>
        ))}
      </div>
    </div>
  )
}

/* ════════════════════════════════════
   PARTNERS CARD
════════════════════════════════════ */
function PartnersCard({ project }) {
  const partners = project.partners
  if (!partners?.length) return null
  return (
    <div className="card p-5">
      <h3 className="font-display font-semibold text-sm mb-4 flex items-center gap-2 text-dark">
        <Building2 className="w-4 h-4 text-primary-500"/>Partners & Sponsors
      </h3>
      <div className="flex flex-wrap gap-2">
        {partners.map((p, i) => (
          p.logo
            ? <img key={i} src={p.logo} alt={p.name} title={p.name}
                className="h-8 object-contain grayscale hover:grayscale-0 transition-all"
                style={{ maxWidth: 90 }}/>
            : <span key={i}
                className="font-display text-xs font-semibold px-3 py-1.5 rounded-xl text-primary-500"
                style={{ background: 'rgba(91,45,142,0.07)', border: '1px solid rgba(91,45,142,0.1)' }}>
                {p.name}
              </span>
        ))}
      </div>
    </div>
  )
}

/* ════════════════════════════════════
   SUBSCRIBE CARD
════════════════════════════════════ */
function SubscribeCard({ projectId }) {
  const [email,   setEmail]   = useState('')
  const [done,    setDone]    = useState(false)
  const [loading, setLoading] = useState(false)

  const submit = async e => {
    e.preventDefault()
    if (!email.trim()) return
    setLoading(true)
    try { await api.post('/newsletter/subscribe', { email }); setDone(true) }
    catch { setDone(true) }
    finally { setLoading(false) }
  }

  return (
    <div className="card p-5">
      <div className="flex items-center gap-3 mb-3">
        <div className="w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0 bg-primary-500/8">
          <Bell className="w-4 h-4 text-primary-500"/>
        </div>
        <h3 className="font-display font-semibold text-sm text-dark">Get Updates</h3>
      </div>
      <p className="font-display text-xs mb-4 text-muted-foreground">
        Be notified when this project posts new milestones or updates.
      </p>
      {done ? (
        <div className="font-display text-center py-3 rounded-xl text-sm font-semibold flex items-center justify-center gap-2 bg-primary-500/8 text-primary-500">
          <CheckCircle2 className="w-4 h-4"/>Subscribed!
        </div>
      ) : (
        <form onSubmit={submit} className="flex flex-col gap-2">
          <input type="email" value={email} onChange={e => setEmail(e.target.value)}
            placeholder="your@email.com" required
            className="font-display w-full px-3 py-2.5 rounded-xl text-sm outline-none text-dark"
            style={{ background: '#F8F5FF', border: '1.5px solid rgba(91,45,142,0.12)' }}
          />
          <button type="submit" disabled={loading}
            className="font-display w-full py-2.5 rounded-xl text-sm font-semibold text-white flex items-center justify-center gap-2 transition-all hover:opacity-90 bg-gradient-to-br from-primary-500 to-primary-400">
            {loading
              ? <div className="w-4 h-4 rounded-full border-2 border-white/30 border-t-white animate-spin"/>
              : <><Bell className="w-3.5 h-3.5"/>Notify Me</>}
          </button>
        </form>
      )}
    </div>
  )
}

/* ════════════════════════════════════
   SHARE CARD
════════════════════════════════════ */
function ShareCard({ project }) {
  const url   = typeof window !== 'undefined' ? window.location.href : ''
  const title = encodeURIComponent(`Support: ${project.title}`)
  const enc   = encodeURIComponent(url)

  const links = [
    { name: 'Facebook', short: 'f',  bg: '#1877F2', href: `https://www.facebook.com/sharer/sharer.php?u=${enc}` },
    { name: 'WhatsApp', short: 'W',  bg: '#25D366', href: `https://wa.me/?text=${title}%20${enc}` },
    { name: 'Twitter',  short: 'X',  bg: '#0F0F0F', href: `https://twitter.com/intent/tweet?url=${enc}&text=${title}` },
    { name: 'LinkedIn', short: 'in', bg: '#0A66C2', href: `https://linkedin.com/sharing/share-offsite/?url=${enc}` },
  ]

  const handleCopy = () => {
    navigator.clipboard.writeText(url)
      .then(()  => toast.success('Link copied!'))
      .catch(() => toast.error('Could not copy link'))
  }

  return (
    <div className="card p-5">
      <h3 className="font-display font-semibold text-sm mb-3 flex items-center gap-2 text-dark">
        <Share2 className="w-4 h-4 text-primary-500"/>Share
      </h3>
      <div className="flex gap-2">
        {links.map(l => (
          <a key={l.name} href={l.href} target="_blank" rel="noreferrer" title={l.name}
            className="font-display flex-1 flex items-center justify-center py-2.5 rounded-xl text-xs font-black text-white transition-all hover:-translate-y-0.5 hover:shadow-md"
            style={{ background: l.bg }}>
            {l.short}
          </a>
        ))}
        <button onClick={handleCopy} title="Copy link"
          className="font-display flex-1 flex items-center justify-center py-2.5 rounded-xl text-xs font-semibold transition-all hover:opacity-80 text-primary-500"
          style={{ background: 'rgba(91,45,142,0.06)', border: '1px solid rgba(91,45,142,0.1)' }}>
          <Copy className="w-3.5 h-3.5"/>
        </button>
      </div>
    </div>
  )
}

/* ════════════════════════════════════
   RELATED PROJECTS
════════════════════════════════════ */
function RelatedProjects({ projects }) {
  return (
    <div className="mt-16">
      <div className="flex items-center gap-3 mb-6">
        <span className="w-1 h-7 rounded-full"
          style={{ background: `linear-gradient(to bottom,${BRAND},${GOLD})` }}/>
        <h2 className="font-display font-bold text-xl text-dark">Related Projects</h2>
      </div>
      <div className="grid md:grid-cols-3 gap-6">
        {projects.map(p => <ProjectCard key={p.id} project={p} />)}
      </div>
    </div>
  )
}

/* ════════════════════════════════════
   HELPERS
════════════════════════════════════ */
function SectionTitle({ Icon, title }) {
  return (
    <div className="flex items-center gap-3">
      <div className="w-9 h-9 rounded-2xl flex items-center justify-center flex-shrink-0 bg-primary-500/8">
        <Icon className="w-4 h-4 text-primary-500"/>
      </div>
      <h2 className="font-display font-bold text-lg text-dark">{title}</h2>
    </div>
  )
}

function PageSkeleton() {
  return (
    <div>
      <div className="h-[560px] animate-pulse bg-primary-500/8"/>
      <div className="max-w-7xl mx-auto px-6 py-12 grid lg:grid-cols-[1fr_340px] gap-10">
        <div className="space-y-5">
          {[1,2,3].map(i => <div key={i} className="h-40 rounded-3xl animate-pulse bg-primary-500/5"/>)}
        </div>
        <div className="space-y-4">
          {[1,2,3].map(i => <div key={i} className="h-28 rounded-3xl animate-pulse bg-primary-500/5"/>)}
        </div>
      </div>
    </div>
  )
}

function NotFound() {
  return (
    <div className="min-h-[60vh] flex flex-col items-center justify-center gap-4 px-6 text-center">
      <Sprout className="w-16 h-16 text-primary-500/20"/>
      <h2 className="font-display font-bold text-2xl text-dark">Project Not Found</h2>
      <p className="font-display text-sm text-muted-foreground">
        This project may have been removed or the link is incorrect.
      </p>
      <Link to="/projects" className="btn-secondary mt-2">
        <ArrowLeft className="w-3 h-3"/>Browse All Projects
      </Link>
    </div>
  )
}
