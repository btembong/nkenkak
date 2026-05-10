import { useState } from 'react'
import { useQuery, useMutation } from 'react-query'
import { Link, useParams } from 'react-router-dom'
import { format } from 'date-fns'
import toast from 'react-hot-toast'
import api from '../../services/api'
import { useAuth } from '../../context/AuthContext'
import UpgradeModal from '../common/UpgradeModal'

const TYPE_META = {
  job:         { label: 'Job',      color: '#00A876', bg: 'rgba(0,168,118,0.12)' },
  service:     { label: 'Service',  color: '#0284c7', bg: 'rgba(2,132,199,0.12)' },
  item_sale:   { label: 'For Sale', color: '#F0A500', bg: 'rgba(240,165,0,0.12)' },
  item_wanted: { label: 'Wanted',   color: '#7C3AED', bg: 'rgba(124,58,237,0.12)' },
}

/* ── AI CV Generator Modal ── */
function CVGeneratorModal({ job, onClose }) {
  const [userBackground, setUserBackground] = useState('')
  const [generatedCV, setGeneratedCV] = useState('')

  const mut = useMutation(
    () => api.post('/jobs/generate-cv', {
      jobTitle: job.title, jobDescription: job.description, userBackground,
    }).then(r => r.data),
    {
      onSuccess: data => setGeneratedCV(data.cv),
      onError: e => toast.error(e.response?.data?.error || 'Failed to generate CV'),
    }
  )

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(6px)' }}
      onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="bg-white rounded-3xl w-full max-w-2xl max-h-[90vh] overflow-y-auto"
        style={{ boxShadow: '0 24px 60px rgba(0,0,0,0.2)' }}>
        <div className="px-7 pt-6 pb-4 border-b sticky top-0 bg-white z-10 flex items-center justify-between"
          style={{ borderColor: '#F3F4F6' }}>
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-xl flex items-center justify-center"
              style={{ background: 'linear-gradient(135deg,#00A876,#00C48C)' }}>
              <i className="fas fa-magic text-white text-xs"/>
            </div>
            <div>
              <h3 className="font-bold text-sm" style={{ color: '#111827', fontFamily: 'Sora,sans-serif' }}>AI CV Generator</h3>
              <p className="text-[11px]" style={{ color: '#9CA3AF' }}>For: <span style={{ color: '#00A876' }}>{job.title}</span></p>
            </div>
          </div>
          <button onClick={onClose} className="w-8 h-8 rounded-full flex items-center justify-center hover:bg-gray-100">
            <i className="fas fa-times text-sm" style={{ color: '#9CA3AF' }}/>
          </button>
        </div>
        <div className="p-7 space-y-4">
          {!generatedCV ? (
            <>
              <textarea value={userBackground} onChange={e => setUserBackground(e.target.value)} rows={8}
                className="w-full rounded-2xl p-4 text-sm resize-none outline-none"
                style={{ background: '#F9FAFB', border: '1.5px solid #E5E7EB', color: '#374151', fontFamily: 'Poppins,sans-serif' }}
                placeholder={`Describe your background:\n- Education\n- Work experience\n- Skills\n- Achievements`}
                onFocus={e => e.target.style.borderColor = '#00A876'}
                onBlur={e => e.target.style.borderColor = '#E5E7EB'}/>
              <button onClick={() => mut.mutate()} disabled={!userBackground.trim() || mut.isLoading}
                className="w-full py-3 rounded-2xl text-sm font-bold text-white disabled:opacity-40"
                style={{ background: 'linear-gradient(135deg,#00A876,#00C48C)' }}>
                {mut.isLoading ? <><i className="fas fa-spinner animate-spin mr-2"/>Generating…</> : <><i className="fas fa-magic mr-2"/>Generate CV</>}
              </button>
            </>
          ) : (
            <>
              <div className="flex items-center justify-between mb-2">
                <span className="flex items-center gap-2 text-sm font-bold" style={{ color: '#111827' }}>
                  <i className="fas fa-check-circle" style={{ color: '#16a34a' }}/>CV Ready
                </span>
                <div className="flex gap-2">
                  <button onClick={() => setGeneratedCV('')} className="text-xs px-3 py-1.5 rounded-xl" style={{ background: '#F3F4F6', color: '#6B7280' }}>Redo</button>
                  <button onClick={() => { navigator.clipboard.writeText(generatedCV); toast.success('Copied!') }}
                    className="text-xs font-bold px-3 py-1.5 rounded-xl text-white" style={{ background: '#00A876' }}>
                    <i className="fas fa-copy mr-1"/>Copy
                  </button>
                </div>
              </div>
              <pre className="text-xs leading-relaxed whitespace-pre-wrap rounded-2xl p-5 max-h-96 overflow-auto"
                style={{ background: '#F9FAFB', border: '1px solid #E5E7EB', color: '#374151', fontFamily: 'Poppins,sans-serif' }}>
                {generatedCV}
              </pre>
            </>
          )}
        </div>
      </div>
    </div>
  )
}

export default function JobDetailPage() {
  const { id } = useParams()
  const { user } = useAuth()
  const [showCV, setShowCV] = useState(false)
  const [showUpgrade, setShowUpgrade] = useState(false)

  const isPremium = user?.isPremium || user?.role === 'admin' || user?.role === 'leader'

  const { data: job, isLoading } = useQuery(
    ['job', id, isPremium],
    () => api.get(`/jobs/${id}`).then(r => r.data),
    { staleTime: 0 }
  )
  const meta = job ? (TYPE_META[job.type] || TYPE_META.job) : TYPE_META.job
  const initials = job ? (job.companyName || job.title).slice(0, 2).toUpperCase() : ''

  const share = () => {
    if (navigator.share) navigator.share({ title: job?.title, url: window.location.href })
    else { navigator.clipboard.writeText(window.location.href); toast.success('Link copied!') }
  }

  if (isLoading) return (
    <div style={{ background: '#fff', minHeight: '100vh' }}>
      <div className="max-w-5xl mx-auto px-6 py-8 space-y-4">
        <div className="h-52 rounded-2xl animate-pulse" style={{ background: '#E5E7EB' }}/>
        <div className="h-6 w-48 rounded-xl animate-pulse" style={{ background: '#E5E7EB' }}/>
        <div className="h-4 w-32 rounded-xl animate-pulse" style={{ background: '#E5E7EB' }}/>
      </div>
    </div>
  )

  if (!job) return (
    <div className="min-h-screen flex flex-col items-center justify-center gap-3" style={{ background: '#fff' }}>
      <i className="fas fa-briefcase text-4xl" style={{ color: '#D1D5DB' }}/>
      <p className="font-bold text-lg" style={{ color: '#111827' }}>Listing not found</p>
      <Link to="/jobs" className="text-sm font-semibold" style={{ color: '#00A876' }}>← Back to Jobs</Link>
    </div>
  )

  return (
    <div style={{ background: '#fff', minHeight: '100vh' }}>
      <div className="max-w-5xl mx-auto px-6">

        {/* ── Top nav ── */}
        <div className="flex items-center justify-between py-4">
          <Link to="/jobs" className="flex items-center gap-2 text-sm font-semibold" style={{ color: '#374151' }}>
            <i className="fas fa-chevron-left text-xs"/> Back to Jobs
          </Link>
          <div className="flex items-center gap-2">
            <button onClick={share} className="w-9 h-9 rounded-full flex items-center justify-center transition-all hover:bg-gray-100"
              style={{ border: '1px solid #E5E7EB', color: '#6B7280' }}>
              <i className="fas fa-share-alt text-sm"/>
            </button>
            <button className="w-9 h-9 rounded-full flex items-center justify-center transition-all hover:bg-gray-100"
              style={{ border: '1px solid #E5E7EB', color: '#6B7280' }}>
              <i className="fas fa-heart text-sm"/>
            </button>
          </div>
        </div>

        {/* ── Banner ── */}
        <div className="h-56 rounded-2xl relative overflow-hidden"
          style={{ background: 'linear-gradient(135deg, #153226 0%, #1a4a35 50%, #0d2119 100%)' }}>
          {job.imageUrl && (
            <img src={job.imageUrl} alt="" className="absolute inset-0 w-full h-full object-cover"/>
          )}
          {/* cubes texture overlay */}
          <div className="absolute inset-0 opacity-20"
            style={{ backgroundImage: "url('https://www.transparenttextures.com/patterns/cubes.png')" }}/>

          {/* Logo card — overlaps bottom of banner */}
          <div className="absolute -bottom-14 left-8 md:left-12 z-20">
            <div className="p-1 bg-white rounded-[28px] shadow-2xl">
              {job.imageUrl ? (
                <img
                  src={job.imageUrl}
                  alt={job.companyName || job.title}
                  className="w-28 h-28 md:w-36 md:h-36 rounded-[24px] bg-white object-contain"
                />
              ) : (
                <div className="w-28 h-28 md:w-36 md:h-36 rounded-[24px] bg-white flex items-center justify-center">
                  <span className="font-black text-4xl" style={{ color: meta.color, fontFamily: 'Sora,sans-serif' }}>
                    {initials}
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Spacer to push content below the overlapping logo */}
        <div className="h-16 md:h-20"/>

        {/* ── Company name + CTA row ── */}

        <div className="px-2 flex items-start justify-between gap-6 mb-8">
          {/* Left: name, category, location */}
          <div>
            <h1 className="font-display font-black text-2xl md:text-3xl mb-3" style={{ color: '#111827' }}>
              {job.companyName || job.title}
            </h1>
            <div className="flex items-center gap-3 flex-wrap">
              <span className="text-[11px] font-black uppercase tracking-widest px-3 py-1.5 rounded-full"
                style={{ background: meta.bg, color: meta.color }}>
                {job.category} · {meta.label}
              </span>
              {job.location && (
                <span className="flex items-center gap-1.5 text-sm" style={{ color: '#6B7280', fontFamily: 'Poppins,sans-serif' }}>
                  <i className="fas fa-map-marker-alt text-xs" style={{ color: '#9CA3AF' }}/>
                  {job.location}
                </span>
              )}
            </div>
          </div>

          {/* Right: action buttons */}
          <div className="hidden md:flex items-center gap-3 flex-shrink-0">
            {!user ? (
              <Link to="/login"
                className="flex items-center gap-2 px-5 py-3 rounded-full text-sm font-semibold transition-all hover:bg-gray-50"
                style={{ border: '1.5px solid #D1D5DB', color: '#374151', background: '#fff', fontFamily: 'Sora,sans-serif' }}>
                <i className="fas fa-magic text-xs" style={{ color: meta.color }}/>
                AI Generate CV
              </Link>
            ) : (
              <button onClick={() => isPremium ? setShowCV(true) : setShowUpgrade(true)}
                className="flex items-center gap-2 px-5 py-3 rounded-full text-sm font-semibold transition-all hover:bg-gray-50"
                style={{ border: '1.5px solid #D1D5DB', color: '#374151', background: '#fff', fontFamily: 'Sora,sans-serif' }}>
                <i className="fas fa-magic text-xs" style={{ color: meta.color }}/>
                AI Generate CV
                {!isPremium && <i className="fas fa-crown text-[10px]" style={{ color: '#F0A500' }}/>}
              </button>
            )}
            {isPremium ? (
              <button className="flex items-center gap-2 px-6 py-3 rounded-full text-sm font-bold text-white transition-all hover:-translate-y-0.5"
                style={{ background: 'linear-gradient(135deg,#00A876,#00C48C)', boxShadow: '0 6px 20px rgba(0,196,140,0.35)', fontFamily: 'Sora,sans-serif' }}>
                Apply Now <i className="fas fa-arrow-right text-xs"/>
              </button>
            ) : user ? (
              <button onClick={() => setShowUpgrade(true)}
                className="flex items-center gap-2 px-6 py-3 rounded-full text-sm font-bold text-white transition-all hover:-translate-y-0.5"
                style={{ background: 'linear-gradient(135deg,#00A876,#00C48C)', boxShadow: '0 6px 20px rgba(0,196,140,0.35)', fontFamily: 'Sora,sans-serif' }}>
                <i className="fas fa-crown text-xs"/>Upgrade
              </button>
            ) : (
              <Link to="/login"
                className="flex items-center gap-2 px-6 py-3 rounded-full text-sm font-bold text-white transition-all hover:-translate-y-0.5"
                style={{ background: 'linear-gradient(135deg,#00A876,#00C48C)', boxShadow: '0 6px 20px rgba(0,196,140,0.35)', fontFamily: 'Sora,sans-serif' }}>
                Apply Now <i className="fas fa-arrow-right text-xs"/>
              </Link>
            )}
          </div>
        </div>

        {/* ── Two-column layout ── */}
        <div className="px-2 grid md:grid-cols-3 gap-8 pb-24">

          {/* ── Left column ── */}
          <div className="md:col-span-2 space-y-8">

            {/* À Propos */}
            <div>
              <div className="flex items-center gap-3 mb-4">
                <div className="w-8 h-0.5" style={{ background: meta.color }}/>
                <h2 className="text-xs font-black uppercase tracking-widest" style={{ color: meta.color, fontFamily: 'Sora,sans-serif' }}>
                  About
                </h2>
              </div>
              <div className="text-sm leading-loose" style={{ color: '#374151', fontFamily: 'Poppins,sans-serif' }}>
                {job.description}
              </div>
            </div>

            {/* How to Apply */}
            {job.applicationProcess && (
              <div>
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-8 h-0.5" style={{ background: meta.color }}/>
                  <h2 className="text-xs font-black uppercase tracking-widest" style={{ color: meta.color, fontFamily: 'Sora,sans-serif' }}>
                    How to Apply
                  </h2>
                </div>
                <div className="text-sm leading-loose" style={{ color: '#374151', fontFamily: 'Poppins,sans-serif' }}>
                  {job.applicationProcess}
                </div>
              </div>
            )}

            {/* Contact Recrutement */}
            <div>
              <div className="flex items-center gap-2 mb-4">
                <i className="fas fa-envelope text-xs" style={{ color: meta.color }}/>
                <h2 className="text-xs font-black uppercase tracking-widest" style={{ color: meta.color, fontFamily: 'Sora,sans-serif' }}>
                  Recruiter Contact
                </h2>
              </div>

              {isPremium ? (
                <div className="space-y-2">
                  {job.contactName && (
                    <div className="flex items-center gap-3 px-4 py-3 rounded-xl" style={{ background: '#F9FAFB', border: '1px solid #F3F4F6' }}>
                      <div className="w-9 h-9 rounded-full flex items-center justify-center font-bold text-xs text-white flex-shrink-0"
                        style={{ background: 'linear-gradient(135deg,#00A876,#00C48C)' }}>
                        {job.contactName.slice(0, 2).toUpperCase()}
                      </div>
                      <span className="text-sm font-semibold" style={{ color: '#111827', fontFamily: 'Sora,sans-serif' }}>{job.contactName}</span>
                    </div>
                  )}
                  {job.contactEmail && (
                    <a href={`mailto:${job.contactEmail}`}
                      className="flex items-center gap-3 px-4 py-3 rounded-xl transition-all hover:bg-gray-50"
                      style={{ background: '#F9FAFB', border: '1px solid #F3F4F6' }}>
                      <i className="fas fa-envelope text-sm" style={{ color: meta.color }}/>
                      <span className="text-sm" style={{ color: '#374151', fontFamily: 'Poppins,sans-serif' }}>{job.contactEmail}</span>
                    </a>
                  )}
                  {job.contactPhone && (
                    <a href={`tel:${job.contactPhone}`}
                      className="flex items-center gap-3 px-4 py-3 rounded-xl transition-all hover:bg-gray-50"
                      style={{ background: '#F9FAFB', border: '1px solid #F3F4F6' }}>
                      <i className="fas fa-phone text-sm" style={{ color: '#16a34a' }}/>
                      <span className="text-sm" style={{ color: '#374151', fontFamily: 'Poppins,sans-serif' }}>{job.contactPhone}</span>
                    </a>
                  )}
                  {job.whatsapp && (
                    <a href={`https://wa.me/${job.whatsapp.replace(/\D/g, '')}`} target="_blank" rel="noopener noreferrer"
                      className="flex items-center gap-3 px-4 py-3 rounded-xl transition-all hover:bg-gray-50"
                      style={{ background: '#F9FAFB', border: '1px solid #F3F4F6' }}>
                      <i className="fab fa-whatsapp text-sm" style={{ color: '#25D366' }}/>
                      <span className="text-sm" style={{ color: '#374151', fontFamily: 'Poppins,sans-serif' }}>WhatsApp</span>
                    </a>
                  )}
                  <button onClick={() => setShowCV(true)}
                    className="w-full mt-3 py-3 rounded-xl text-sm font-bold text-white transition-all hover:-translate-y-0.5"
                    style={{ background: 'linear-gradient(135deg,#00A876,#00C48C)', boxShadow: '0 4px 16px rgba(0,196,140,0.3)' }}>
                    <i className="fas fa-magic mr-2"/>Generate AI CV for This Role
                  </button>
                </div>
              ) : (
                /* Locked — realistic blurred contact rows */
                <div className="relative rounded-xl overflow-hidden" style={{ border: '1px solid #E5E7EB' }}>
                  {/* Fake contact rows that look real when blurred */}
                  <div className="px-5 py-5 space-y-3 select-none pointer-events-none"
                    style={{ filter: 'blur(5px)', background: '#FAFAFA', userSelect: 'none' }}>
                    {/* Name row */}
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-full flex items-center justify-center text-white text-xs font-bold flex-shrink-0"
                        style={{ background: 'linear-gradient(135deg,#00A876,#00C48C)' }}>JD</div>
                      <span className="text-sm font-semibold" style={{ color: '#111827', fontFamily: 'Sora,sans-serif' }}>
                        Jean Dupont
                      </span>
                    </div>
                    {/* Email row */}
                    <div className="flex items-center gap-3 px-3 py-2.5 rounded-xl" style={{ background: '#fff', border: '1px solid #F3F4F6' }}>
                      <i className="fas fa-envelope text-sm" style={{ color: '#00A876' }}/>
                      <span className="text-sm" style={{ color: '#374151', fontFamily: 'Poppins,sans-serif' }}>
                        recrutement@company.com
                      </span>
                    </div>
                    {/* Phone row */}
                    <div className="flex items-center gap-3 px-3 py-2.5 rounded-xl" style={{ background: '#fff', border: '1px solid #F3F4F6' }}>
                      <i className="fas fa-phone text-sm" style={{ color: '#16a34a' }}/>
                      <span className="text-sm" style={{ color: '#374151', fontFamily: 'Poppins,sans-serif' }}>
                        +237 6XX XXX XXX
                      </span>
                    </div>
                    {/* WhatsApp row */}
                    <div className="flex items-center gap-3 px-3 py-2.5 rounded-xl" style={{ background: '#fff', border: '1px solid #F3F4F6' }}>
                      <i className="fab fa-whatsapp text-sm" style={{ color: '#25D366' }}/>
                      <span className="text-sm" style={{ color: '#374151', fontFamily: 'Poppins,sans-serif' }}>
                        WhatsApp
                      </span>
                    </div>
                  </div>

                  {/* Frosted overlay with CTA */}
                  <div className="absolute inset-0 flex flex-col items-center justify-center gap-3"
                    style={{ background: 'rgba(250,250,250,0.6)', backdropFilter: 'blur(1px)' }}>
                    <div className="flex items-center gap-2 mb-1">
                      <i className="fas fa-lock text-sm" style={{ color: '#9CA3AF' }}/>
                      <span className="text-xs font-semibold" style={{ color: '#6B7280', fontFamily: 'Poppins,sans-serif' }}>
                        Contact details are hidden
                      </span>
                    </div>
                    {user ? (
                      <button onClick={() => setShowUpgrade(true)}
                        className="flex items-center gap-2 px-6 py-2.5 rounded-full text-sm font-bold text-white transition-all hover:-translate-y-0.5"
                        style={{ background: 'linear-gradient(135deg,#00A876,#00C48C)', boxShadow: '0 4px 16px rgba(0,196,140,0.35)' }}>
                        <i className="fas fa-crown text-xs"/>Upgrade to reveal
                      </button>
                    ) : (
                      <Link to="/login"
                        className="flex items-center gap-2 px-6 py-2.5 rounded-full text-sm font-bold text-white transition-all hover:-translate-y-0.5"
                        style={{ background: 'linear-gradient(135deg,#00A876,#00C48C)', boxShadow: '0 4px 16px rgba(0,196,140,0.35)' }}>
                        <i className="fas fa-lock text-xs"/>Login to reveal
                      </Link>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* ── Right Sidebar ── */}
          <div className="space-y-6">

            {/* Informations */}
            <div>
              <p className="text-[10px] font-black uppercase tracking-widest mb-4"
                style={{ color: '#9CA3AF', fontFamily: 'Sora,sans-serif' }}>Informations</p>
              <div className="space-y-4">
                {job.location && (
                  <div className="flex items-center gap-4">
                    <div className="w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0"
                      style={{ background: '#F3F4F6' }}>
                      <i className="fas fa-map-marker-alt text-sm" style={{ color: '#9CA3AF' }}/>
                    </div>
                    <span className="text-sm font-bold" style={{ color: '#111827', fontFamily: 'Sora,sans-serif' }}>{job.location}</span>
                  </div>
                )}
                {job.contactPhone && isPremium && (
                  <div className="flex items-center gap-4">
                    <div className="w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0"
                      style={{ background: '#F3F4F6' }}>
                      <i className="fas fa-phone text-sm" style={{ color: '#9CA3AF' }}/>
                    </div>
                    <span className="text-sm font-bold" style={{ color: '#111827', fontFamily: 'Sora,sans-serif' }}>{job.contactPhone}</span>
                  </div>
                )}
                {job.companyWebsite && (
                  <div className="flex items-center gap-4">
                    <div className="w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0"
                      style={{ background: '#F3F4F6' }}>
                      <i className="fas fa-globe text-sm" style={{ color: '#9CA3AF' }}/>
                    </div>
                    <a href={job.companyWebsite} target="_blank" rel="noopener noreferrer"
                      className="text-sm font-bold hover:underline" style={{ color: '#111827', fontFamily: 'Sora,sans-serif' }}>
                      {job.companyWebsite.replace(/^https?:\/\//, '').replace(/\/$/, '')}
                    </a>
                  </div>
                )}
                {job.salary && (
                  <div className="flex items-center gap-4">
                    <div className="w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0"
                      style={{ background: '#F3F4F6' }}>
                      <i className="fas fa-coins text-sm" style={{ color: '#9CA3AF' }}/>
                    </div>
                    <span className="text-sm font-bold" style={{ color: '#111827', fontFamily: 'Sora,sans-serif' }}>{job.salary}</span>
                  </div>
                )}
                {job.expiresAt && (
                  <div className="flex items-center gap-4">
                    <div className="w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0"
                      style={{ background: '#F3F4F6' }}>
                      <i className="fas fa-calendar text-sm" style={{ color: '#9CA3AF' }}/>
                    </div>
                    <span className="text-sm font-bold" style={{ color: '#111827', fontFamily: 'Sora,sans-serif' }}>
                      Closes {format(new Date(job.expiresAt), 'MMM d, yyyy')}
                    </span>
                  </div>
                )}
              </div>
            </div>

            {/* Company details */}
            {(job.companyName || job.companyAddress || job.country) && (
              <div>
                <p className="text-[10px] font-black uppercase tracking-widest mb-4"
                  style={{ color: '#9CA3AF', fontFamily: 'Sora,sans-serif' }}>Company</p>
                <div className="space-y-3">
                  {job.companyName && (
                    <div className="flex items-center gap-4">
                      <div className="w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0"
                        style={{ background: '#F3F4F6' }}>
                        <i className="fas fa-building text-sm" style={{ color: '#9CA3AF' }}/>
                      </div>
                      <span className="text-sm font-bold" style={{ color: '#111827', fontFamily: 'Sora,sans-serif' }}>{job.companyName}</span>
                    </div>
                  )}
                  {job.companyAddress && (
                    <div className="flex items-start gap-4">
                      <div className="w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0"
                        style={{ background: '#F3F4F6' }}>
                        <i className="fas fa-map-pin text-sm" style={{ color: '#9CA3AF' }}/>
                      </div>
                      <span className="text-sm font-medium leading-snug" style={{ color: '#374151', fontFamily: 'Poppins,sans-serif' }}>{job.companyAddress}</span>
                    </div>
                  )}
                  {job.country && (
                    <div className="flex items-center gap-4">
                      <div className="w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0"
                        style={{ background: '#F3F4F6' }}>
                        <i className="fas fa-flag text-sm" style={{ color: '#9CA3AF' }}/>
                      </div>
                      <span className="text-sm font-bold" style={{ color: '#111827', fontFamily: 'Sora,sans-serif' }}>{job.country}</span>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Social Networks */}
            {(job.linkedIn || job.facebook || job.twitter || job.whatsapp) && (
              <div>
                <p className="text-[10px] font-black uppercase tracking-widest mb-4"
                  style={{ color: '#9CA3AF', fontFamily: 'Sora,sans-serif' }}>Social Networks</p>
                <div className="flex gap-2 flex-wrap">
                  {job.linkedIn && (
                    <a href={job.linkedIn} target="_blank" rel="noopener noreferrer"
                      className="w-10 h-10 rounded-full flex items-center justify-center transition-all hover:scale-110"
                      style={{ border: '1.5px solid #E5E7EB', color: '#0A66C2', background: '#fff' }}>
                      <i className="fab fa-linkedin-in text-sm"/>
                    </a>
                  )}
                  {job.facebook && (
                    <a href={job.facebook} target="_blank" rel="noopener noreferrer"
                      className="w-10 h-10 rounded-full flex items-center justify-center transition-all hover:scale-110"
                      style={{ border: '1.5px solid #E5E7EB', color: '#1877F2', background: '#fff' }}>
                      <i className="fab fa-facebook-f text-sm"/>
                    </a>
                  )}
                  {job.twitter && (
                    <a href={job.twitter} target="_blank" rel="noopener noreferrer"
                      className="w-10 h-10 rounded-full flex items-center justify-center transition-all hover:scale-110"
                      style={{ border: '1.5px solid #E5E7EB', color: '#1DA1F2', background: '#fff' }}>
                      <i className="fab fa-twitter text-sm"/>
                    </a>
                  )}
                  {/* WhatsApp is non-sensitive — always visible */}
                  {job.whatsapp && (
                    <a href={`https://wa.me/${job.whatsapp.replace(/\D/g, '')}`} target="_blank" rel="noopener noreferrer"
                      className="w-10 h-10 rounded-full flex items-center justify-center transition-all hover:scale-110"
                      style={{ border: '1.5px solid #E5E7EB', color: '#25D366', background: '#fff' }}>
                      <i className="fab fa-whatsapp text-sm"/>
                    </a>
                  )}
                </div>
              </div>
            )}

            {/* Share */}
            <button onClick={share}
              className="w-full flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-semibold transition-all hover:bg-gray-50"
              style={{ background: '#fff', border: '1.5px solid #E5E7EB', color: '#374151', fontFamily: 'Sora,sans-serif' }}>
              <i className="fas fa-share-alt text-xs" style={{ color: '#9CA3AF' }}/>
              Share this listing
            </button>
          </div>
        </div>
      </div>

      {/* ── Mobile sticky CTA ── */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 p-4 flex gap-3"
        style={{ background: '#fff', borderTop: '1px solid #F3F4F6', boxShadow: '0 -4px 20px rgba(0,0,0,0.06)' }}>
        {!user ? (
          <Link to="/login" className="flex-1 py-3 rounded-xl text-sm font-semibold text-center"
            style={{ border: '1.5px solid #E5E7EB', color: '#374151' }}>
            <i className="fas fa-magic mr-1.5" style={{ color: '#00A876' }}/>AI CV
          </Link>
        ) : (
          <button onClick={() => isPremium ? setShowCV(true) : setShowUpgrade(true)}
            className="flex-1 py-3 rounded-xl text-sm font-semibold"
            style={{ border: '1.5px solid #E5E7EB', color: '#374151' }}>
            <i className="fas fa-magic mr-1.5" style={{ color: '#00A876' }}/>AI CV
            {!isPremium && <i className="fas fa-crown ml-1 text-[10px]" style={{ color: '#F0A500' }}/>}
          </button>
        )}
        {isPremium ? (
          <button className="flex-1 py-3 rounded-xl text-sm font-bold text-white"
            style={{ background: 'linear-gradient(135deg,#00A876,#00C48C)' }}>
            Apply Now →
          </button>
        ) : user ? (
          <button onClick={() => setShowUpgrade(true)}
            className="flex-1 py-3 rounded-xl text-sm font-bold text-white"
            style={{ background: 'linear-gradient(135deg,#00A876,#00C48C)' }}>
            <i className="fas fa-crown mr-1.5"/>Upgrade →
          </button>
        ) : (
          <Link to="/login" className="flex-1 py-3 rounded-xl text-sm font-bold text-white text-center"
            style={{ background: 'linear-gradient(135deg,#00A876,#00C48C)' }}>
            Apply Now →
          </Link>
        )}
      </div>

      {showCV      && <CVGeneratorModal job={job} onClose={() => setShowCV(false)}/>}
      {showUpgrade && <UpgradeModal onClose={() => setShowUpgrade(false)}/>}
    </div>
  )
}
