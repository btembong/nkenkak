import { useState, useRef } from 'react'
import { useParams, Link } from 'react-router-dom'
import { useQuery, useQueryClient } from 'react-query'
import { format, formatDistanceToNow } from 'date-fns'
import { useInView } from 'react-intersection-observer'
import CountUp from 'react-countup'
import api from '../../services/api'
import { useAuth } from '../../context/AuthContext'
import DonationModal from '../common/DonationModal'

/* ── Category accent colours ── */
const CAT_COLORS = {
  education: '#5B2D8E', health: '#dc2626', water: '#0284c7',
  infrastructure: '#d97706', culture: '#7c3aed', community: '#16a34a',
  agriculture: '#65a30d', other: '#475569',
}

/* ── Status config ── */
const STATUS_CFG = {
  active:    { label: 'Active',    bg: 'rgba(22,163,74,0.12)',    color: '#16a34a',  icon: 'fa-circle-dot' },
  upcoming:  { label: 'Upcoming',  bg: 'rgba(2,132,199,0.12)',    color: '#0284c7',  icon: 'fa-clock' },
  completed: { label: 'Completed', bg: 'rgba(91,45,142,0.12)',    color: '#5B2D8E',  icon: 'fa-check-circle' },
  paused:    { label: 'Paused',    bg: 'rgba(245,158,11,0.12)',   color: '#d97706',  icon: 'fa-pause-circle' },
}

export default function ProjectDetail() {
  const { slug } = useParams()
  const { user } = useAuth()
  const qc = useQueryClient()
  const [donateOpen, setDonateOpen] = useState(false)
  const [lightbox, setLightbox] = useState(null) // image URL or null
  const [activeTab, setActiveTab] = useState('about') // about | updates | gallery

  const { data: project, isLoading, error } = useQuery(
    ['project', slug],
    () => api.get(`/projects/${slug}`).then(r => r.data),
    { retry: false }
  )

  const { data: related } = useQuery(
    ['related-projects', project?.category],
    () => api.get(`/projects?category=${project.category}&limit=3`).then(r =>
      r.data.projects?.filter(p => p.id !== project.id).slice(0, 3)
    ),
    { enabled: !!project?.category }
  )

  if (isLoading) return <PageSkeleton />
  if (error || !project) return <NotFound />

  const pct      = project.goalAmount > 0
    ? Math.min(100, Math.round((Number(project.raisedAmount) / Number(project.goalAmount)) * 100))
    : 0
  const color    = CAT_COLORS[project.category] || '#5B2D8E'
  const statusCfg = STATUS_CFG[project.status] || STATUS_CFG.active

  /* Build media array: coverImage first, then galleryUrls */
  const allMedia = [
    ...(project.coverImage ? [{ type: 'image', url: project.coverImage }] : []),
    ...(project.galleryUrls?.map(u => ({ type: 'image', url: u })) || []),
  ]

  return (
    <div>
      {/* ── Hero ── */}
      <ProjectHero project={project} color={color} statusCfg={statusCfg} />

      {/* ── Body ── */}
      <section className="py-12" style={{ background: '#FAFAFA' }}>
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid lg:grid-cols-[1fr_340px] gap-10 items-start">

            {/* ══ LEFT COLUMN ══ */}
            <div className="space-y-6">

              {/* Impact stats bar */}
              <ImpactBar project={project} pct={pct} color={color} />

              {/* Tabs */}
              <div className="flex gap-1 p-1 rounded-2xl w-fit" style={{ background: 'rgba(91,45,142,0.06)' }}>
                {[
                  { key: 'about',   label: 'About',   icon: 'fa-info-circle' },
                  { key: 'updates', label: `Updates${project.updates?.length ? ` (${project.updates.length})` : ''}`, icon: 'fa-bell' },
                  { key: 'gallery', label: `Gallery${allMedia.length ? ` (${allMedia.length})` : ''}`, icon: 'fa-images' },
                ].map(t => (
                  <button key={t.key} onClick={() => setActiveTab(t.key)}
                    className="px-4 py-2 rounded-xl text-sm font-semibold transition-all flex items-center gap-2"
                    style={{
                      background: activeTab === t.key ? '#fff' : 'transparent',
                      color: activeTab === t.key ? '#5B2D8E' : '#A3A3A3',
                      boxShadow: activeTab === t.key ? '0 1px 6px rgba(91,45,142,0.12)' : 'none',
                      fontFamily: 'Sora,sans-serif',
                    }}>
                    <i className={`fas ${t.icon} text-xs`} />{t.label}
                  </button>
                ))}
              </div>

              {/* Tab: About */}
              {activeTab === 'about' && (
                <div className="space-y-6">
                  <AboutSection project={project} color={color} />
                  <MilestonesSection pct={pct} color={color} project={project} />
                  <DonorWall projectId={project.id} color={color} />
                  <DetailsGrid project={project} color={color} />
                  {project.location && <LocationSection project={project} color={color} />}
                  <CommentsSection projectId={project.id} color={color} user={user} />
                </div>
              )}

              {/* Tab: Updates */}
              {activeTab === 'updates' && (
                <UpdatesSection project={project} color={color} />
              )}

              {/* Tab: Gallery */}
              {activeTab === 'gallery' && (
                <GallerySection media={allMedia} color={color} onOpen={setLightbox} />
              )}
            </div>

            {/* ══ RIGHT SIDEBAR ══ */}
            <div className="space-y-5 lg:sticky lg:top-24">
              <FundingCard
                project={project}
                pct={pct}
                color={color}
                statusCfg={statusCfg}
                onDonate={() => setDonateOpen(true)}
              />
              <TimelineCard project={project} color={color} />
              <SubscribeCard projectId={project.id} color={color} />
              <ShareCard project={project} />
            </div>
          </div>

          {/* ── Related projects ── */}
          {related?.length > 0 && (
            <RelatedProjects projects={related} color={color} />
          )}
        </div>
      </section>

      {/* Subscribe sidebar card gets injected via FundingCard prop */}

      {/* Lightbox */}
      {lightbox && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          style={{ background: 'rgba(0,0,0,0.92)' }}
          onClick={() => setLightbox(null)}>
          <button
            className="absolute top-4 right-4 w-10 h-10 rounded-full flex items-center justify-center text-white transition-all hover:bg-white/10"
            onClick={() => setLightbox(null)}>
            <i className="fas fa-times text-xl" />
          </button>
          <img
            src={lightbox}
            alt=""
            className="max-w-full max-h-[90vh] object-contain rounded-2xl"
            onClick={e => e.stopPropagation()}
          />
        </div>
      )}

      {donateOpen && (
        <DonationModal onClose={() => setDonateOpen(false)} defaultProject={project.id} />
      )}
    </div>
  )
}

/* ════════════════════════════════════
   HERO
════════════════════════════════════ */
function ProjectHero({ project, color, statusCfg }) {
  return (
    <div className="relative overflow-hidden" style={{ minHeight: 340 }}>
      {/* Background */}
      {project.coverImage ? (
        <>
          <img src={project.coverImage} alt="" className="absolute inset-0 w-full h-full object-cover" />
          <div className="absolute inset-0"
            style={{ background: 'linear-gradient(105deg,rgba(10,4,24,0.95) 0%,rgba(10,4,24,0.75) 50%,rgba(10,4,24,0.45) 100%)' }} />
        </>
      ) : (
        <div className="absolute inset-0"
          style={{ background: `linear-gradient(135deg,#0A0418 0%,#1A0A35 50%,${color}88 100%)` }}>
          <div className="wave-pattern absolute inset-0 opacity-30" />
        </div>
      )}

      {/* Glow */}
      <div className="absolute top-1/2 right-1/4 w-96 h-96 rounded-full pointer-events-none -translate-y-1/2"
        style={{ background: `radial-gradient(circle,${color}22,transparent 70%)`, filter: 'blur(50px)' }} />

      <div className="relative max-w-7xl mx-auto px-6 py-16">
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-xs mb-5" style={{ color: 'rgba(255,255,255,0.5)', fontFamily: 'Poppins,sans-serif' }}>
          <Link to="/" className="hover:text-white transition-colors flex items-center gap-1"><i className="fas fa-home text-[10px]" />Home</Link>
          <i className="fas fa-chevron-right text-[8px]" style={{ color: '#F0A500' }} />
          <Link to="/projects" className="hover:text-white transition-colors">Projects</Link>
          <i className="fas fa-chevron-right text-[8px]" style={{ color: '#F0A500' }} />
          <span style={{ color: '#F0A500' }} className="truncate max-w-xs">{project.title}</span>
        </div>

        {/* Badges */}
        <div className="flex items-center gap-2 mb-4 flex-wrap">
          <span className="text-[10px] font-bold uppercase tracking-wider px-3 py-1.5 rounded-full flex items-center gap-1.5"
            style={{ background: statusCfg.bg, color: statusCfg.color, backdropFilter: 'blur(4px)' }}>
            <i className={`fas ${statusCfg.icon} text-[9px]`} />{statusCfg.label}
          </span>
          {project.category && (
            <span className="text-[10px] font-bold uppercase tracking-wider px-3 py-1.5 rounded-full text-white capitalize"
              style={{ background: `${color}cc`, backdropFilter: 'blur(4px)' }}>
              {project.category}
            </span>
          )}
          {project.isUrgent && (
            <span className="text-[10px] font-bold uppercase tracking-wider px-3 py-1.5 rounded-full flex items-center gap-1.5 animate-pulse"
              style={{ background: 'rgba(220,38,38,0.8)', color: '#fff' }}>
              <i className="fas fa-exclamation-circle text-[9px]" />Urgent
            </span>
          )}
          {project.isFeatured && (
            <span className="text-[10px] font-bold uppercase tracking-wider px-3 py-1.5 rounded-full"
              style={{ background: 'rgba(240,165,0,0.2)', color: '#F0A500', border: '1px solid rgba(240,165,0,0.3)' }}>
              <i className="fas fa-star text-[9px] mr-1" />Featured
            </span>
          )}
        </div>

        <h1 className="font-display font-extrabold text-white leading-tight mb-4"
          style={{ fontSize: 'clamp(1.8rem,4vw,3rem)', textShadow: '0 4px 30px rgba(0,0,0,0.4)', maxWidth: 720 }}>
          {project.title}
        </h1>

        <p className="text-sm leading-relaxed mb-6 max-w-2xl"
          style={{ color: 'rgba(255,255,255,0.7)', fontFamily: 'Poppins,sans-serif' }}>
          {project.summary}
        </p>

        {/* Quick hero stats */}
        <div className="flex flex-wrap gap-6">
          {[
            { icon: 'fa-users', val: project.donorCount || 0, label: 'Donors', fmt: true },
            { icon: 'fa-heart', val: project.beneficiaries || 0, label: 'Beneficiaries', fmt: true },
            { icon: 'fa-eye',   val: project.viewCount || 0, label: 'Views', fmt: true },
          ].filter(s => s.val > 0).map(s => (
            <div key={s.label} className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0"
                style={{ background: 'rgba(240,165,0,0.15)', border: '1px solid rgba(240,165,0,0.2)' }}>
                <i className={`fas ${s.icon} text-xs`} style={{ color: '#F0A500' }} />
              </div>
              <div>
                <div className="font-display font-bold text-white text-sm leading-none">
                  {s.fmt ? Number(s.val).toLocaleString() : s.val}
                </div>
                <div className="text-[10px] mt-0.5" style={{ color: 'rgba(255,255,255,0.45)', fontFamily: 'Poppins,sans-serif' }}>{s.label}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

/* ════════════════════════════════════
   IMPACT BAR
════════════════════════════════════ */
function ImpactBar({ project, pct, color }) {
  const { ref, inView } = useInView({ triggerOnce: true, threshold: 0.4 })
  return (
    <div ref={ref} className="card p-6">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-6">
        {[
          { icon: 'fa-coins',   label: 'Raised',        val: Number(project.raisedAmount || 0), suffix: ' XAF', color: color },
          { icon: 'fa-bullseye',label: 'Goal',          val: Number(project.goalAmount || 0),   suffix: ' XAF', color: '#F0A500' },
          { icon: 'fa-users',   label: 'Donors',        val: project.donorCount || 0,           suffix: '',     color: '#0284c7' },
          { icon: 'fa-heart',   label: 'Beneficiaries', val: project.beneficiaries || 0,        suffix: '',     color: '#dc2626' },
        ].map(stat => (
          <div key={stat.label} className="text-center">
            <div className="w-10 h-10 rounded-2xl flex items-center justify-center mx-auto mb-2"
              style={{ background: `${stat.color}12` }}>
              <i className={`fas ${stat.icon} text-sm`} style={{ color: stat.color }} />
            </div>
            <div className="font-display font-bold text-lg" style={{ color: '#1A0A35' }}>
              {inView ? (
                <CountUp end={stat.val} duration={2} separator="," />
              ) : '0'}
              {stat.suffix && stat.val > 0 && <span className="text-xs font-normal ml-0.5" style={{ color: '#A3A3A3' }}>{stat.suffix}</span>}
            </div>
            <div className="text-[10px] uppercase tracking-wider font-semibold mt-0.5"
              style={{ color: '#A3A3A3', fontFamily: 'Sora,sans-serif' }}>{stat.label}</div>
          </div>
        ))}
      </div>

      {/* Progress bar */}
      <div>
        <div className="flex justify-between text-xs mb-2" style={{ color: '#737373', fontFamily: 'Poppins,sans-serif' }}>
          <span><strong style={{ color: '#1A0A35' }}>{Number(project.raisedAmount || 0).toLocaleString()} XAF</strong> raised</span>
          <span style={{ color, fontWeight: 700 }}>{pct}% funded</span>
        </div>
        <div className="h-3 rounded-full overflow-hidden" style={{ background: 'rgba(91,45,142,0.08)' }}>
          <div className="h-full rounded-full transition-all duration-1000"
            style={{
              width: inView ? `${pct}%` : '0%',
              background: `linear-gradient(90deg,${color},#F0A500)`,
              boxShadow: `0 0 12px ${color}50`,
            }} />
        </div>
        <div className="flex justify-between text-[10px] mt-1.5" style={{ color: '#A3A3A3', fontFamily: 'Poppins,sans-serif' }}>
          <span>XAF 0</span>
          <span>Goal: {Number(project.goalAmount || 0).toLocaleString()} XAF</span>
        </div>
      </div>
    </div>
  )
}

/* ════════════════════════════════════
   ABOUT
════════════════════════════════════ */
function AboutSection({ project, color }) {
  const [expanded, setExpanded] = useState(false)
  const isLong = project.description?.length > 600
  const shown = isLong && !expanded
    ? project.description.slice(0, 600) + '…'
    : project.description

  return (
    <div className="card p-8">
      <SectionTitle icon="fa-info-circle" title="About This Project" color={color} />
      <div className="text-sm leading-relaxed whitespace-pre-line mt-5"
        style={{ color: '#525252', fontFamily: 'Poppins,sans-serif' }}>
        {shown}
      </div>
      {isLong && (
        <button onClick={() => setExpanded(e => !e)}
          className="mt-4 text-xs font-semibold flex items-center gap-1.5 transition-colors"
          style={{ color, fontFamily: 'Sora,sans-serif' }}>
          <i className={`fas fa-chevron-${expanded ? 'up' : 'down'} text-[10px]`} />
          {expanded ? 'Show less' : 'Read more'}
        </button>
      )}
    </div>
  )
}

/* ════════════════════════════════════
   DETAILS GRID
════════════════════════════════════ */
function DetailsGrid({ project, color }) {
  const items = [
    project.category    && { icon: 'fa-tag',           label: 'Category',     value: project.category,   capitalize: true },
    project.status      && { icon: 'fa-circle-dot',    label: 'Status',       value: project.status,     capitalize: true },
    project.location    && { icon: 'fa-map-marker-alt',label: 'Location',     value: project.location },
    project.startDate   && { icon: 'fa-calendar-plus', label: 'Start Date',   value: format(new Date(project.startDate), 'MMMM d, yyyy') },
    project.endDate     && { icon: 'fa-calendar-check',label: 'Target Date',  value: format(new Date(project.endDate), 'MMMM d, yyyy') },
    project.createdAt   && { icon: 'fa-clock',         label: 'Launched',     value: formatDistanceToNow(new Date(project.createdAt), { addSuffix: true }) },
    project.currency    && { icon: 'fa-coins',         label: 'Currency',     value: project.currency },
    project.viewCount   && { icon: 'fa-eye',           label: 'Views',        value: Number(project.viewCount).toLocaleString() },
  ].filter(Boolean)

  if (!items.length) return null

  return (
    <div className="card p-8">
      <SectionTitle icon="fa-list" title="Project Details" color={color} />
      <div className="grid sm:grid-cols-2 gap-3 mt-5">
        {items.map(item => (
          <div key={item.label} className="flex items-start gap-3 p-3 rounded-2xl transition-colors"
            style={{ background: 'rgba(91,45,142,0.03)', border: '1px solid rgba(91,45,142,0.06)' }}>
            <div className="w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0"
              style={{ background: `${color}12` }}>
              <i className={`fas ${item.icon} text-xs`} style={{ color }} />
            </div>
            <div>
              <div className="text-[10px] uppercase tracking-wider font-semibold"
                style={{ color: '#A3A3A3', fontFamily: 'Sora,sans-serif' }}>{item.label}</div>
              <div className="text-sm font-semibold mt-0.5"
                style={{ color: '#1A0A35', fontFamily: 'Sora,sans-serif', textTransform: item.capitalize ? 'capitalize' : 'none' }}>
                {item.value}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

/* ════════════════════════════════════
   LOCATION
════════════════════════════════════ */
function LocationSection({ project, color }) {
  return (
    <div className="card p-8">
      <SectionTitle icon="fa-map-marked-alt" title="Location" color={color} />
      <div className="mt-5 rounded-2xl overflow-hidden relative"
        style={{ height: 200, background: `linear-gradient(135deg,${color}10,${color}20)`, border: `1px solid ${color}18` }}>
        {/* Map placeholder */}
        <div className="absolute inset-0 flex flex-col items-center justify-center gap-3">
          <div className="w-12 h-12 rounded-full flex items-center justify-center"
            style={{ background: `${color}18` }}>
            <i className="fas fa-map-marker-alt text-xl" style={{ color }} />
          </div>
          <div className="text-sm font-semibold" style={{ color: '#1A0A35', fontFamily: 'Sora,sans-serif' }}>
            {project.location}
          </div>
          <a
            href={`https://maps.google.com/?q=${encodeURIComponent(project.location)}`}
            target="_blank" rel="noreferrer"
            className="text-xs font-semibold px-4 py-2 rounded-xl transition-all hover:opacity-80 flex items-center gap-1.5"
            style={{ background: color, color: '#fff' }}>
            <i className="fas fa-external-link-alt text-[10px]" />View on Google Maps
          </a>
        </div>
      </div>
    </div>
  )
}

/* ════════════════════════════════════
   GALLERY
════════════════════════════════════ */
function GallerySection({ media, color, onOpen }) {
  const [activeVideo, setActiveVideo] = useState(null)

  /* Placeholder video slots so there are always visual elements */
  const videoPlaceholders = [
    { label: 'Project Documentary', duration: '5:32' },
    { label: 'Field Visit — 2024',  duration: '3:18' },
  ]

  if (!media.length && !videoPlaceholders.length) {
    return (
      <div className="card p-12 text-center">
        <i className="fas fa-images text-5xl mb-4 block" style={{ color: 'rgba(91,45,142,0.15)' }} />
        <p className="text-sm" style={{ color: '#A3A3A3', fontFamily: 'Poppins,sans-serif' }}>
          No media uploaded yet.
        </p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Images */}
      {media.length > 0 && (
        <div className="card p-6">
          <SectionTitle icon="fa-images" title="Photos" color={color} />
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mt-5">
            {media.map((m, i) => (
              <button key={i} onClick={() => onOpen(m.url)}
                className="relative overflow-hidden rounded-2xl group transition-all hover:scale-[1.02]"
                style={{ aspectRatio: '4/3', background: `${color}15` }}>
                <img src={m.url} alt="" className="w-full h-full object-cover" />
                <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                  style={{ background: 'rgba(0,0,0,0.35)' }}>
                  <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center backdrop-blur-sm">
                    <i className="fas fa-expand text-white text-sm" />
                  </div>
                </div>
              </button>
            ))}
            {/* Placeholder slots if fewer than 3 images */}
            {media.length < 3 && Array.from({ length: 3 - media.length }).map((_, i) => (
              <div key={`ph-${i}`}
                className="relative overflow-hidden rounded-2xl flex items-center justify-center"
                style={{ aspectRatio: '4/3', background: `linear-gradient(135deg,${color}08,${color}18)`, border: `1px dashed ${color}30` }}>
                <div className="text-center">
                  <i className="fas fa-image text-2xl mb-2 block" style={{ color: `${color}50` }} />
                  <span className="text-[10px] font-semibold" style={{ color: `${color}70`, fontFamily: 'Sora,sans-serif' }}>Photo coming soon</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Videos */}
      <div className="card p-6">
        <SectionTitle icon="fa-film" title="Videos" color={color} />
        <div className="grid sm:grid-cols-2 gap-4 mt-5">
          {videoPlaceholders.map((v, i) => (
            <div key={i}
              className="relative overflow-hidden rounded-2xl cursor-pointer group transition-all hover:scale-[1.02]"
              style={{ aspectRatio: '16/9', background: `linear-gradient(135deg,#1A0A35,${color})` }}
              onClick={() => setActiveVideo(i)}>
              {/* Thumbnail pattern */}
              <div className="absolute inset-0 wave-pattern opacity-20" />
              <div className="absolute inset-0 flex flex-col items-center justify-center gap-3">
                <div className="w-14 h-14 rounded-full bg-white/15 backdrop-blur-sm flex items-center justify-center
                  group-hover:scale-110 transition-transform shadow-xl border border-white/20">
                  <i className="fas fa-play text-white text-lg ml-0.5" />
                </div>
                <div className="text-center px-4">
                  <div className="text-white font-semibold text-sm" style={{ fontFamily: 'Sora,sans-serif' }}>{v.label}</div>
                  <div className="text-white/50 text-xs mt-0.5">{v.duration}</div>
                </div>
              </div>
              <div className="absolute bottom-3 right-3 text-[10px] font-semibold px-2 py-1 rounded-lg"
                style={{ background: 'rgba(0,0,0,0.5)', color: '#fff' }}>
                <i className="fas fa-video mr-1" />Video
              </div>
            </div>
          ))}
        </div>
        <p className="text-xs text-center mt-4" style={{ color: '#A3A3A3', fontFamily: 'Poppins,sans-serif' }}>
          <i className="fas fa-info-circle mr-1" />Videos will be available once uploaded by the project team.
        </p>
      </div>
    </div>
  )
}

/* ════════════════════════════════════
   UPDATES TIMELINE
════════════════════════════════════ */
function UpdatesSection({ project, color }) {
  if (!project.updates?.length) {
    return (
      <div className="card p-12 text-center">
        <i className="fas fa-bell text-5xl mb-4 block" style={{ color: 'rgba(91,45,142,0.12)' }} />
        <h3 className="font-display font-semibold text-base mb-2" style={{ color: '#1A0A35' }}>No updates yet</h3>
        <p className="text-sm" style={{ color: '#A3A3A3', fontFamily: 'Poppins,sans-serif' }}>
          The project team will post updates here as work progresses.
        </p>
      </div>
    )
  }

  return (
    <div className="card p-8">
      <SectionTitle icon="fa-bell" title="Project Updates" color={color} />
      <div className="mt-6 space-y-0">
        {project.updates.map((u, i) => (
          <div key={u.id} className="flex gap-5">
            {/* Timeline spine */}
            <div className="flex flex-col items-center flex-shrink-0">
              <div className="w-10 h-10 rounded-full flex items-center justify-center text-white text-xs font-bold shadow-md"
                style={{ background: `linear-gradient(135deg,${color},#F0A500)` }}>
                {i + 1}
              </div>
              {i < project.updates.length - 1 && (
                <div className="w-0.5 flex-1 my-2 rounded-full" style={{ background: `${color}18`, minHeight: 32 }} />
              )}
            </div>

            {/* Content */}
            <div className="flex-1 pb-8">
              <div className="flex items-start justify-between gap-4 mb-2">
                <h4 className="font-display font-semibold text-base" style={{ color: '#1A0A35' }}>{u.title}</h4>
                {u.createdAt && (
                  <span className="text-[10px] font-semibold px-2.5 py-1 rounded-full flex-shrink-0"
                    style={{ background: `${color}0a`, color, fontFamily: 'Sora,sans-serif' }}>
                    {format(new Date(u.createdAt), 'MMM d, yyyy')}
                  </span>
                )}
              </div>
              <p className="text-sm leading-relaxed" style={{ color: '#525252', fontFamily: 'Poppins,sans-serif' }}>
                {u.content}
              </p>
              {u.author_name && (
                <div className="flex items-center gap-2 mt-3">
                  <div className="w-6 h-6 rounded-full flex items-center justify-center text-white text-[10px] font-bold"
                    style={{ background: color }}>
                    {u.author_name.charAt(0).toUpperCase()}
                  </div>
                  <span className="text-xs font-semibold" style={{ color: '#737373', fontFamily: 'Sora,sans-serif' }}>
                    {u.author_name}
                  </span>
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
   FUNDING CARD (sidebar)
════════════════════════════════════ */
function FundingCard({ project, pct, color, statusCfg, onDonate }) {
  return (
    <div className="card p-6">
      {/* Big pct */}
      <div className="text-center mb-5 py-4 rounded-2xl" style={{ background: `${color}06` }}>
        <div className="font-display font-extrabold text-5xl" style={{ color }}>{pct}%</div>
        <div className="text-xs font-semibold mt-1 uppercase tracking-wider" style={{ color: '#A3A3A3', fontFamily: 'Sora,sans-serif' }}>Funded</div>
      </div>

      {/* Progress */}
      <div className="progress-track mb-5">
        <div className="progress-fill" style={{ width: `${pct}%` }} />
      </div>

      {/* Amounts */}
      <div className="grid grid-cols-2 gap-3 mb-5">
        <div className="text-center p-3 rounded-2xl" style={{ background: 'rgba(91,45,142,0.05)' }}>
          <div className="font-display font-bold text-sm" style={{ color: '#1A0A35' }}>
            {Number(project.raisedAmount || 0).toLocaleString()}
          </div>
          <div className="text-[10px] mt-0.5" style={{ color: '#A3A3A3', fontFamily: 'Poppins,sans-serif' }}>XAF raised</div>
        </div>
        <div className="text-center p-3 rounded-2xl" style={{ background: 'rgba(240,165,0,0.05)' }}>
          <div className="font-display font-bold text-sm" style={{ color: '#1A0A35' }}>
            {Number(project.goalAmount || 0).toLocaleString()}
          </div>
          <div className="text-[10px] mt-0.5" style={{ color: '#A3A3A3', fontFamily: 'Poppins,sans-serif' }}>XAF goal</div>
        </div>
      </div>

      {/* Meta */}
      <div className="space-y-2.5 mb-5">
        {project.donorCount > 0 && (
          <MetaRow icon="fa-users" color="#0284c7"
            value={`${Number(project.donorCount).toLocaleString()} donors`} />
        )}
        {project.beneficiaries > 0 && (
          <MetaRow icon="fa-heart" color="#dc2626"
            value={`${Number(project.beneficiaries).toLocaleString()} beneficiaries`} />
        )}
        {project.location && (
          <MetaRow icon="fa-map-marker-alt" color={color} value={project.location} />
        )}
      </div>

      {/* CTA */}
      {project.status !== 'completed' ? (
        <button onClick={onDonate}
          className="w-full py-4 rounded-2xl font-display font-bold text-sm text-white flex items-center justify-center gap-2 transition-all hover:opacity-90 active:scale-[0.98]"
          style={{ background: `linear-gradient(135deg,${color},#F0A500)`, boxShadow: `0 8px 24px ${color}40` }}>
          <i className="fas fa-heart" />Donate Now
        </button>
      ) : (
        <div className="w-full py-4 rounded-2xl font-display font-bold text-sm flex items-center justify-center gap-2"
          style={{ background: 'rgba(22,163,74,0.1)', color: '#16a34a' }}>
          <i className="fas fa-check-circle" />Project Completed!
        </div>
      )}

      {project.isUrgent && project.status !== 'completed' && (
        <p className="text-center text-xs mt-3 flex items-center justify-center gap-1.5"
          style={{ color: '#dc2626', fontFamily: 'Poppins,sans-serif' }}>
          <i className="fas fa-exclamation-circle" />This project needs urgent support
        </p>
      )}
    </div>
  )
}

function MetaRow({ icon, color, value }) {
  return (
    <div className="flex items-center gap-3 text-xs" style={{ color: '#525252', fontFamily: 'Poppins,sans-serif' }}>
      <div className="w-7 h-7 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: `${color}12` }}>
        <i className={`fas ${icon} text-[11px]`} style={{ color }} />
      </div>
      <span>{value}</span>
    </div>
  )
}

/* ════════════════════════════════════
   TIMELINE CARD (sidebar)
════════════════════════════════════ */
function TimelineCard({ project, color }) {
  if (!project.startDate && !project.endDate) return null

  const now = new Date()
  const start = project.startDate ? new Date(project.startDate) : null
  const end = project.endDate ? new Date(project.endDate) : null
  const daysLeft = end ? Math.max(0, Math.ceil((end - now) / (1000 * 60 * 60 * 24))) : null

  return (
    <div className="card p-5">
      <h3 className="font-display font-semibold text-sm mb-4 flex items-center gap-2" style={{ color: '#1A0A35' }}>
        <i className="fas fa-calendar-alt text-xs" style={{ color }} />Timeline
      </h3>
      <div className="space-y-3">
        {start && (
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0"
              style={{ background: `${color}12` }}>
              <i className="fas fa-play text-[10px]" style={{ color }} />
            </div>
            <div>
              <div className="text-[10px] uppercase tracking-wider font-semibold" style={{ color: '#A3A3A3', fontFamily: 'Sora,sans-serif' }}>Start</div>
              <div className="text-sm font-semibold" style={{ color: '#1A0A35', fontFamily: 'Sora,sans-serif' }}>
                {format(start, 'MMMM d, yyyy')}
              </div>
            </div>
          </div>
        )}
        {end && (
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0"
              style={{ background: 'rgba(240,165,0,0.12)' }}>
              <i className="fas fa-flag text-[10px]" style={{ color: '#F0A500' }} />
            </div>
            <div>
              <div className="text-[10px] uppercase tracking-wider font-semibold" style={{ color: '#A3A3A3', fontFamily: 'Sora,sans-serif' }}>Target</div>
              <div className="text-sm font-semibold" style={{ color: '#1A0A35', fontFamily: 'Sora,sans-serif' }}>
                {format(end, 'MMMM d, yyyy')}
              </div>
            </div>
          </div>
        )}
        {daysLeft !== null && daysLeft > 0 && project.status !== 'completed' && (
          <div className="mt-3 pt-3 border-t text-center" style={{ borderColor: 'rgba(91,45,142,0.08)' }}>
            <span className="text-2xl font-display font-bold" style={{ color }}>{daysLeft}</span>
            <span className="text-xs ml-1.5" style={{ color: '#737373', fontFamily: 'Poppins,sans-serif' }}>days remaining</span>
          </div>
        )}
      </div>
    </div>
  )
}

/* ════════════════════════════════════
   SHARE CARD (sidebar)
════════════════════════════════════ */
function ShareCard({ project }) {
  const url = encodeURIComponent(window.location.href)
  const title = encodeURIComponent(`Support: ${project.title}`)

  const links = [
    { label: 'Facebook', icon: 'fab fa-facebook-f', color: '#1877F2', href: `https://www.facebook.com/sharer/sharer.php?u=${url}` },
    { label: 'Twitter',  icon: 'fab fa-twitter',    color: '#1DA1F2', href: `https://twitter.com/intent/tweet?url=${url}&text=${title}` },
    { label: 'WhatsApp', icon: 'fab fa-whatsapp',   color: '#25D366', href: `https://wa.me/?text=${title}%20${url}` },
    { label: 'LinkedIn', icon: 'fab fa-linkedin-in', color: '#0A66C2', href: `https://linkedin.com/sharing/share-offsite/?url=${url}` },
  ]

  const handleCopy = () => {
    navigator.clipboard.writeText(window.location.href)
      .then(() => alert('Link copied!'))
  }

  return (
    <div className="card p-5">
      <h3 className="font-display font-semibold text-sm mb-4 flex items-center gap-2" style={{ color: '#1A0A35' }}>
        <i className="fas fa-share-alt text-xs" style={{ color: '#5B2D8E' }} />Share this Project
      </h3>
      <div className="grid grid-cols-4 gap-2 mb-3">
        {links.map(l => (
          <a key={l.label} href={l.href} target="_blank" rel="noreferrer"
            title={l.label}
            className="w-full aspect-square rounded-2xl flex items-center justify-center text-white text-sm transition-all hover:-translate-y-0.5 hover:shadow-lg"
            style={{ background: l.color }}>
            <i className={l.icon} />
          </a>
        ))}
      </div>
      <button onClick={handleCopy}
        className="w-full py-2.5 rounded-xl text-xs font-semibold flex items-center justify-center gap-2 transition-all hover:opacity-80"
        style={{ background: 'rgba(91,45,142,0.06)', color: '#5B2D8E', border: '1px solid rgba(91,45,142,0.1)', fontFamily: 'Sora,sans-serif' }}>
        <i className="fas fa-copy text-[11px]" />Copy Link
      </button>
    </div>
  )
}

/* ════════════════════════════════════
   RELATED PROJECTS
════════════════════════════════════ */
function RelatedProjects({ projects, color }) {
  return (
    <div className="mt-16">
      <div className="flex items-center gap-3 mb-6">
        <span className="w-1 h-7 rounded-full" style={{ background: `linear-gradient(to bottom,${color},#F0A500)` }} />
        <h2 className="font-display font-bold text-xl" style={{ color: '#1A0A35' }}>Related Projects</h2>
      </div>
      <div className="grid md:grid-cols-3 gap-6">
        {projects.map(p => {
          const pct2 = p.goalAmount > 0
            ? Math.min(100, Math.round((Number(p.raisedAmount) / Number(p.goalAmount)) * 100))
            : 0
          return (
            <Link key={p.id} to={`/projects/${p.slug}`}
              className="card overflow-hidden group block hover:-translate-y-1 transition-transform">
              <div className="h-40 relative overflow-hidden"
                style={{ background: `linear-gradient(135deg,${CAT_COLORS[p.category] || '#5B2D8E'}33,${CAT_COLORS[p.category] || '#5B2D8E'}66)` }}>
                {p.coverImage
                  ? <img src={p.coverImage} alt="" className="w-full h-full object-cover" />
                  : <div className="w-full h-full flex items-center justify-center">
                      <i className="fas fa-seedling text-4xl" style={{ color: 'rgba(240,165,0,0.3)' }} />
                    </div>
                }
                <div className="absolute inset-0" style={{ background: 'linear-gradient(to top,rgba(0,0,0,0.5),transparent)' }} />
                <span className="absolute top-3 left-3 text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full text-white capitalize"
                  style={{ background: CAT_COLORS[p.category] || '#5B2D8E' }}>
                  {p.category}
                </span>
              </div>
              <div className="p-4">
                <h4 className="font-display font-semibold text-sm mb-2 line-clamp-2" style={{ color: '#1A0A35' }}>{p.title}</h4>
                <div className="h-1.5 rounded-full overflow-hidden mb-1.5" style={{ background: 'rgba(91,45,142,0.08)' }}>
                  <div className="h-full rounded-full" style={{ width: `${pct2}%`, background: `linear-gradient(90deg,${CAT_COLORS[p.category] || '#5B2D8E'},#F0A500)` }} />
                </div>
                <div className="flex justify-between text-[10px]" style={{ color: '#A3A3A3', fontFamily: 'Poppins,sans-serif' }}>
                  <span>{Number(p.raisedAmount || 0).toLocaleString()} XAF</span>
                  <span style={{ color: CAT_COLORS[p.category] || '#5B2D8E', fontWeight: 700 }}>{pct2}%</span>
                </div>
              </div>
            </Link>
          )
        })}
      </div>
    </div>
  )
}

/* ════════════════════════════════════
   MILESTONES
════════════════════════════════════ */
function MilestonesSection({ pct, color, project }) {
  const milestones = [
    { pct: 25, label: 'Project Launched',      icon: 'fa-flag',         done: pct >= 25 },
    { pct: 50, label: 'Halfway There',          icon: 'fa-road',         done: pct >= 50 },
    { pct: 75, label: '75% Funded',             icon: 'fa-chart-line',   done: pct >= 75 },
    { pct: 100, label: 'Goal Reached',          icon: 'fa-trophy',       done: pct >= 100 },
  ]
  return (
    <div className="card p-8">
      <SectionTitle icon="fa-tasks" title="Funding Milestones" color={color} />
      <div className="mt-6 grid grid-cols-2 sm:grid-cols-4 gap-4">
        {milestones.map((m, i) => (
          <div key={i} className="text-center p-4 rounded-2xl transition-all"
            style={{
              background: m.done ? `${color}10` : 'rgba(0,0,0,0.02)',
              border: `1px solid ${m.done ? color + '30' : 'rgba(0,0,0,0.06)'}`,
            }}>
            <div className="w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-3"
              style={{ background: m.done ? `linear-gradient(135deg,${color},#F0A500)` : 'rgba(0,0,0,0.06)' }}>
              <i className={`fas ${m.icon} text-sm`} style={{ color: m.done ? '#fff' : '#A3A3A3' }} />
            </div>
            <div className="font-display font-bold text-lg" style={{ color: m.done ? color : '#D4D4D4' }}>{m.pct}%</div>
            <div className="text-xs mt-1" style={{ color: m.done ? '#525252' : '#A3A3A3', fontFamily: 'Poppins,sans-serif' }}>{m.label}</div>
            {m.done && <div className="mt-2 text-[9px] font-bold uppercase tracking-wider" style={{ color: '#16a34a' }}>✓ Reached</div>}
          </div>
        ))}
      </div>
    </div>
  )
}

/* ════════════════════════════════════
   DONOR WALL
════════════════════════════════════ */
function DonorWall({ projectId, color }) {
  const { data: donors, isLoading } = useQuery(
    ['project-donors', projectId],
    () => api.get(`/projects/${projectId}/donors`).then(r => r.data),
  )

  if (!isLoading && !donors?.length) return null

  return (
    <div className="card p-8">
      <SectionTitle icon="fa-users" title="Recent Donors" color={color} />
      <p className="text-xs mt-1 mb-5" style={{ color: '#A3A3A3', fontFamily: 'Poppins,sans-serif' }}>
        Thank you to everyone who has contributed to this project.
      </p>
      {isLoading ? (
        <div className="space-y-3">
          {[1,2,3].map(i => <div key={i} className="h-14 rounded-2xl animate-pulse" style={{ background: 'rgba(91,45,142,0.05)' }} />)}
        </div>
      ) : (
        <div className="space-y-3">
          {donors.slice(0, 8).map((d, i) => (
            <div key={d.id} className="flex items-center gap-4 p-3 rounded-2xl transition-colors hover:bg-neutral-50">
              <div className="w-10 h-10 rounded-full flex items-center justify-center text-white text-sm font-bold flex-shrink-0"
                style={{ background: `linear-gradient(135deg,${color},#F0A500)` }}>
                {d.donorName === 'Anonymous' ? <i className="fas fa-user-secret text-xs" /> : d.donorName.charAt(0).toUpperCase()}
              </div>
              <div className="flex-1 min-w-0">
                <div className="font-semibold text-sm" style={{ color: '#1A0A35', fontFamily: 'Sora,sans-serif' }}>{d.donorName}</div>
                {d.message && <div className="text-xs truncate italic" style={{ color: '#737373', fontFamily: 'Poppins,sans-serif' }}>"{d.message}"</div>}
              </div>
              <div className="text-right flex-shrink-0">
                <div className="font-display font-bold text-sm" style={{ color }}>
                  {Number(d.amount).toLocaleString()} <span className="text-[10px] font-normal" style={{ color: '#A3A3A3' }}>XAF</span>
                </div>
                <div className="text-[10px]" style={{ color: '#A3A3A3', fontFamily: 'Poppins,sans-serif' }}>
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
   COMMENTS
════════════════════════════════════ */
function CommentsSection({ projectId, color, user }) {
  const qc = useQueryClient()
  const [text, setText] = useState('')
  const [guestName, setGuestName] = useState('')
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
    <div className="card p-8">
      <SectionTitle icon="fa-comments" title={`Discussion (${comments.length})`} color={color} />

      {/* Post form */}
      <form onSubmit={submit} className="mt-5 mb-6">
        {!user && (
          <input
            value={guestName}
            onChange={e => setGuestName(e.target.value)}
            placeholder="Your name (optional)"
            className="w-full px-4 py-3 rounded-xl text-sm outline-none mb-3"
            style={{ background: '#F8F5FF', border: '1.5px solid rgba(91,45,142,0.12)', color: '#1A0A35', fontFamily: 'Poppins,sans-serif' }}
          />
        )}
        <div className="flex gap-3">
          <div className="w-10 h-10 rounded-full flex items-center justify-center text-white text-xs font-bold flex-shrink-0 mt-1"
            style={{ background: `linear-gradient(135deg,${color},#7B4DB8)` }}>
            {user ? (user.firstName?.[0] || '?') : <i className="fas fa-user text-xs" />}
          </div>
          <div className="flex-1">
            <textarea
              value={text}
              onChange={e => setText(e.target.value)}
              rows={3}
              placeholder="Share your thoughts on this project…"
              className="w-full px-4 py-3 rounded-2xl text-sm outline-none resize-none"
              style={{ background: '#F8F5FF', border: '1.5px solid rgba(91,45,142,0.12)', color: '#1A0A35', fontFamily: 'Poppins,sans-serif' }}
              onFocus={e => { e.target.style.borderColor = color; e.target.style.background = '#fff' }}
              onBlur={e => { e.target.style.borderColor = 'rgba(91,45,142,0.12)'; e.target.style.background = '#F8F5FF' }}
            />
            <div className="flex justify-end mt-2">
              <button type="submit" disabled={submitting || !text.trim()}
                className="px-5 py-2 rounded-xl text-sm font-semibold text-white transition-all hover:opacity-90 disabled:opacity-40"
                style={{ background: `linear-gradient(135deg,${color},#7B4DB8)`, fontFamily: 'Sora,sans-serif' }}>
                {submitting ? <><i className="fas fa-spinner animate-spin mr-1.5" />Posting…</> : <><i className="fas fa-paper-plane mr-1.5" />Post Comment</>}
              </button>
            </div>
          </div>
        </div>
      </form>

      {/* Comments list */}
      {isLoading ? (
        <div className="space-y-4">
          {[1,2].map(i => <div key={i} className="h-20 rounded-2xl animate-pulse" style={{ background: 'rgba(91,45,142,0.05)' }} />)}
        </div>
      ) : comments.length === 0 ? (
        <div className="text-center py-8">
          <i className="fas fa-comments text-3xl mb-3 block" style={{ color: 'rgba(91,45,142,0.12)' }} />
          <p className="text-sm" style={{ color: '#A3A3A3', fontFamily: 'Poppins,sans-serif' }}>No comments yet — be the first!</p>
        </div>
      ) : (
        <div className="space-y-4">
          {comments.map(c => (
            <div key={c.id} className="flex gap-3">
              <div className="w-9 h-9 rounded-full flex items-center justify-center text-white text-xs font-bold flex-shrink-0"
                style={{ background: `linear-gradient(135deg,${color}88,#7B4DB8)` }}>
                {c.name.charAt(0).toUpperCase()}
              </div>
              <div className="flex-1 p-4 rounded-2xl" style={{ background: 'rgba(91,45,142,0.03)', border: '1px solid rgba(91,45,142,0.07)' }}>
                <div className="flex items-center justify-between mb-1.5">
                  <span className="font-semibold text-sm" style={{ color: '#1A0A35', fontFamily: 'Sora,sans-serif' }}>{c.name}</span>
                  <span className="text-[10px]" style={{ color: '#A3A3A3', fontFamily: 'Poppins,sans-serif' }}>
                    {formatDistanceToNow(new Date(c.createdAt), { addSuffix: true })}
                  </span>
                </div>
                <p className="text-sm leading-relaxed" style={{ color: '#525252', fontFamily: 'Poppins,sans-serif' }}>{c.content}</p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

/* ════════════════════════════════════
   SUBSCRIBE CARD (sidebar)
════════════════════════════════════ */
function SubscribeCard({ projectId, color }) {
  const [email, setEmail] = useState('')
  const [done, setDone] = useState(false)
  const [loading, setLoading] = useState(false)

  const submit = async e => {
    e.preventDefault()
    if (!email.trim()) return
    setLoading(true)
    try {
      await api.post('/newsletter/subscribe', { email })
      setDone(true)
    } catch { setDone(true) /* treat as success to avoid leaking email errors */ }
    finally { setLoading(false) }
  }

  return (
    <div className="card p-5">
      <div className="flex items-center gap-3 mb-3">
        <div className="w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0"
          style={{ background: `${color}12` }}>
          <i className="fas fa-bell text-sm" style={{ color }} />
        </div>
        <h3 className="font-display font-semibold text-sm" style={{ color: '#1A0A35' }}>Get Updates</h3>
      </div>
      <p className="text-xs mb-4" style={{ color: '#737373', fontFamily: 'Poppins,sans-serif' }}>
        Be notified when this project posts new milestones or updates.
      </p>
      {done ? (
        <div className="text-center py-3 rounded-xl text-sm font-semibold flex items-center justify-center gap-2"
          style={{ background: 'rgba(22,163,74,0.08)', color: '#16a34a' }}>
          <i className="fas fa-check-circle" />Subscribed!
        </div>
      ) : (
        <form onSubmit={submit} className="flex flex-col gap-2">
          <input
            type="email"
            value={email}
            onChange={e => setEmail(e.target.value)}
            placeholder="your@email.com"
            required
            className="w-full px-3 py-2.5 rounded-xl text-sm outline-none"
            style={{ background: '#F8F5FF', border: '1.5px solid rgba(91,45,142,0.12)', color: '#1A0A35', fontFamily: 'Poppins,sans-serif' }}
          />
          <button type="submit" disabled={loading}
            className="w-full py-2.5 rounded-xl text-sm font-semibold text-white flex items-center justify-center gap-2 transition-all hover:opacity-90"
            style={{ background: `linear-gradient(135deg,${color},#7B4DB8)`, fontFamily: 'Sora,sans-serif' }}>
            {loading ? <div className="w-4 h-4 rounded-full border-2 border-white/30 border-t-white animate-spin" />
              : <><i className="fas fa-bell text-xs" />Notify Me</>}
          </button>
        </form>
      )}
    </div>
  )
}

/* ════════════════════════════════════
   HELPERS
════════════════════════════════════ */
function SectionTitle({ icon, title, color }) {
  return (
    <div className="flex items-center gap-3">
      <div className="w-9 h-9 rounded-2xl flex items-center justify-center flex-shrink-0"
        style={{ background: `${color}12` }}>
        <i className={`fas ${icon} text-sm`} style={{ color }} />
      </div>
      <h2 className="font-display font-bold text-lg" style={{ color: '#1A0A35' }}>{title}</h2>
    </div>
  )
}

function PageSkeleton() {
  return (
    <div>
      <div className="h-80 animate-pulse" style={{ background: 'rgba(91,45,142,0.08)' }} />
      <div className="max-w-7xl mx-auto px-6 py-12 grid lg:grid-cols-[1fr_340px] gap-10">
        <div className="space-y-5">
          {[1, 2, 3].map(i => (
            <div key={i} className="h-40 rounded-3xl animate-pulse" style={{ background: 'rgba(91,45,142,0.05)' }} />
          ))}
        </div>
        <div className="space-y-4">
          {[1, 2, 3].map(i => (
            <div key={i} className="h-28 rounded-3xl animate-pulse" style={{ background: 'rgba(91,45,142,0.05)' }} />
          ))}
        </div>
      </div>
    </div>
  )
}

function NotFound() {
  return (
    <div className="min-h-[60vh] flex flex-col items-center justify-center gap-4 px-6 text-center">
      <i className="fas fa-seedling text-6xl" style={{ color: 'rgba(91,45,142,0.15)' }} />
      <h2 className="font-display font-bold text-2xl" style={{ color: '#1A0A35' }}>Project Not Found</h2>
      <p className="text-sm" style={{ color: '#737373', fontFamily: 'Poppins,sans-serif' }}>
        This project may have been removed or the link is incorrect.
      </p>
      <Link to="/projects" className="btn-secondary mt-2">
        <i className="fas fa-arrow-left text-xs" />Browse All Projects
      </Link>
    </div>
  )
}
