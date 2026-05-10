import { useState, useMemo, useEffect, useRef } from 'react'
import { useQuery, useMutation, useQueryClient } from 'react-query'
import { useForm } from 'react-hook-form'
import { format } from 'date-fns'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import toast from 'react-hot-toast'
import api from '../../services/api'
import { useAuth } from '../../context/AuthContext'
import ImageUploader from '../common/ImageUploader'

const TYPE_META = {
  job:         { label: 'Job',      icon: 'fa-briefcase', color: '#5B2D8E', bg: 'rgba(91,45,142,0.1)'  },
  service:     { label: 'Service',  icon: 'fa-handshake', color: '#16a34a', bg: 'rgba(22,163,74,0.1)'  },
  item_sale:   { label: 'For Sale', icon: 'fa-tag',       color: '#F0A500', bg: 'rgba(240,165,0,0.1)'  },
  item_wanted: { label: 'Wanted',   icon: 'fa-search',    color: '#0284c7', bg: 'rgba(2,132,199,0.1)'  },
}

const CAT_COLORS = {
  agriculture:  '#16a34a',
  tech:         '#0284c7',
  health:       '#dc2626',
  education:    '#7C3AED',
  construction: '#b45309',
  services:     '#0369a1',
  other:        '#6B7280',
}

function PostCard({ post }) {
  const meta     = TYPE_META[post.type] || TYPE_META.job
  const catColor = CAT_COLORS[post.category] || CAT_COLORS.other
  const initials = (post.companyName || post.title).slice(0, 2).toUpperCase()

  return (
    <Link to={`/jobs/${post.id}`}
      className="block bg-white rounded-2xl p-5 transition-all hover:-translate-y-0.5 hover:shadow-lg flex flex-col gap-4"
      style={{ border: '1px solid rgba(0,0,0,0.07)', boxShadow: '0 1px 4px rgba(0,0,0,0.05)' }}>

      {/* Header: logo + title + category */}
      <div className="flex items-start gap-3">
        {post.imageUrl ? (
          <img src={post.imageUrl} alt={post.companyName || post.title}
            className="w-12 h-12 rounded-xl object-cover flex-shrink-0"
            style={{ border: '1px solid rgba(0,0,0,0.08)' }}/>
        ) : (
          <div className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 font-bold text-sm text-white"
            style={{ background: `linear-gradient(135deg,${meta.color},${meta.color}88)` }}>
            {initials}
          </div>
        )}
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <h3 className="font-bold text-base leading-snug truncate" style={{ color: '#111827', fontFamily: 'Sora,sans-serif' }}>
              {post.companyName || post.title}
            </h3>
            {post.isFeatured && (
              <i className="fas fa-star text-xs flex-shrink-0 mt-0.5" style={{ color: '#F0A500' }}/>
            )}
          </div>
          {post.companyName && (
            <p className="text-xs mt-0.5 truncate" style={{ color: '#6B7280', fontFamily: 'Poppins,sans-serif' }}>{post.title}</p>
          )}
          <p className="text-[10px] font-bold uppercase tracking-wider mt-1" style={{ color: catColor }}>
            {post.category}
          </p>
        </div>
      </div>

      {/* Description */}
      <p className="text-xs leading-relaxed line-clamp-2" style={{ color: '#6B7280', fontFamily: 'Poppins,sans-serif' }}>
        {post.description}
      </p>

      {/* Footer chips */}
      <div className="flex flex-wrap gap-2 pt-1">
        {post.location && (
          <span className="flex items-center gap-1 text-[11px]" style={{ color: '#9CA3AF', fontFamily: 'Poppins,sans-serif' }}>
            <i className="fas fa-map-marker-alt text-[10px]"/>
            {post.location}
          </span>
        )}
        {post.salary && (
          <span className="flex items-center gap-1 text-[11px]" style={{ color: '#9CA3AF', fontFamily: 'Poppins,sans-serif' }}>
            <i className="fas fa-coins text-[10px]"/>
            {post.salary}
          </span>
        )}
        <span className="flex items-center gap-1 text-[11px] ml-auto" style={{ color: '#9CA3AF', fontFamily: 'Poppins,sans-serif' }}>
          <i className={`fas ${meta.icon} text-[10px]`}/>
          {meta.label}
        </span>
      </div>
    </Link>
  )
}

function PostForm({ onClose }) {
  const { user } = useAuth()
  const qc = useQueryClient()
  const [logoUrl, setLogoUrl] = useState('')
  const { register, handleSubmit, formState: { errors } } = useForm({
    defaultValues: { type: 'job', country: 'Cameroon', contactName: user ? `${user.firstName} ${user.lastName}` : '', contactEmail: user?.email || '' }
  })

  const mut = useMutation(d => api.post('/jobs', { ...d, imageUrl: logoUrl || undefined }), {
    onSuccess: () => { qc.invalidateQueries('jobs'); toast.success('Listing submitted for review!'); onClose() },
    onError: e => toast.error(e.response?.data?.error || 'Failed'),
  })

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: 'rgba(26,10,53,0.8)', backdropFilter: 'blur(8px)' }} onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="bg-white rounded-3xl w-full max-w-lg max-h-[90vh] overflow-y-auto" style={{ boxShadow: '0 32px 80px rgba(26,10,53,0.25)' }}>
        <div className="px-7 pt-6 pb-4 border-b sticky top-0 bg-white z-10" style={{ borderColor: 'rgba(91,45,142,0.08)' }}>
          <div className="flex items-center justify-between">
            <h3 className="font-display font-bold text-xl" style={{ color: '#1A0A35' }}>Post a Listing</h3>
            <button onClick={onClose} className="w-9 h-9 rounded-full flex items-center justify-center hover:bg-gray-100" style={{ color: '#A3A3A3' }}><i className="fas fa-times"/></button>
          </div>
        </div>
        <form onSubmit={handleSubmit(d => mut.mutate(d))} className="p-7 space-y-4">
          {/* Company / Job logo */}
          <ImageUploader
            value={logoUrl}
            onChange={setLogoUrl}
            folder="nkenkak/jobs"
            aspect="banner"
            label="Company Logo or Job Banner (optional)"
            hint="Upload a company logo or relevant image — makes your listing stand out"/>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="label">Type *</label>
              <select {...register('type')} className="input">
                {Object.entries(TYPE_META).map(([v,m]) => <option key={v} value={v}>{m.label}</option>)}
              </select>
            </div>
            <div>
              <label className="label">Category</label>
              <select {...register('category')} className="input">
                {['agriculture','tech','health','education','construction','services','other'].map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
          </div>
          <div>
            <label className="label">Title *</label>
            <input {...register('title', { required: 'Required' })} className="input" placeholder="e.g. Experienced Carpenter Needed"/>
            {errors.title && <p className="text-xs mt-1 text-red-500">{errors.title.message}</p>}
          </div>
          <div>
            <label className="label">Description *</label>
            <textarea {...register('description', { required: 'Required' })} rows={4} className="input resize-none" placeholder="Describe the role, item, or service…"/>
            {errors.description && <p className="text-xs mt-1 text-red-500">{errors.description.message}</p>}
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="label">Location</label>
              <input {...register('location')} className="input" placeholder="e.g. Bangem"/>
            </div>
            <div>
              <label className="label">Country</label>
              <input {...register('country')} className="input"/>
            </div>
          </div>
          <div>
            <label className="label">Salary / Price</label>
            <input {...register('salary')} className="input" placeholder="e.g. 50,000 XAF/month or Negotiable"/>
          </div>
          <div>
            <label className="label">Contact Name *</label>
            <input {...register('contactName', { required: 'Required' })} className="input"/>
            {errors.contactName && <p className="text-xs mt-1 text-red-500">{errors.contactName.message}</p>}
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="label">Contact Email</label>
              <input type="email" {...register('contactEmail')} className="input"/>
            </div>
            <div>
              <label className="label">Contact Phone</label>
              <input {...register('contactPhone')} className="input" placeholder="+237…"/>
            </div>
          </div>
          <div>
            <label className="label">Expires</label>
            <input type="date" {...register('expiresAt')} className="input"/>
          </div>

          {/* Company / Organisation details */}
          <div className="pt-2 pb-1">
            <p className="text-xs font-bold uppercase tracking-widest" style={{ color: '#5B2D8E', fontFamily: 'Sora,sans-serif' }}>Company / Organisation (optional)</p>
          </div>
          <div>
            <label className="label">Company Name</label>
            <input {...register('companyName')} className="input" placeholder="e.g. Bangem Tech Solutions"/>
          </div>
          <div>
            <label className="label">Company Address</label>
            <input {...register('companyAddress')} className="input" placeholder="e.g. Rue de la Paix, Yaoundé"/>
          </div>
          <div>
            <label className="label">Website</label>
            <input {...register('companyWebsite')} className="input" placeholder="https://company.com"/>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="label">LinkedIn</label>
              <input {...register('linkedIn')} className="input" placeholder="linkedin.com/company/…"/>
            </div>
            <div>
              <label className="label">Facebook</label>
              <input {...register('facebook')} className="input" placeholder="facebook.com/…"/>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="label">Twitter / X</label>
              <input {...register('twitter')} className="input" placeholder="twitter.com/…"/>
            </div>
            <div>
              <label className="label">WhatsApp</label>
              <input {...register('whatsapp')} className="input" placeholder="+237 6XX XXX XXX"/>
            </div>
          </div>
          <div>
            <label className="label">Application Process</label>
            <textarea {...register('applicationProcess')} rows={3} className="input resize-none"
              placeholder="Describe how to apply — e.g. send CV to email, fill online form, drop off at office…"/>
          </div>

          <div className="flex gap-3 pt-2">
            <button type="button" onClick={onClose} className="flex-1 py-3 rounded-2xl text-sm font-semibold" style={{ background: 'rgba(91,45,142,0.05)', color: '#737373', border: '1px solid rgba(91,45,142,0.1)' }}>Cancel</button>
            <button type="submit" disabled={mut.isLoading} className="btn-secondary flex-1 justify-center">
              {mut.isLoading ? <><i className="fas fa-spinner animate-spin"/>Submitting…</> : <><i className="fas fa-plus"/>Post Listing</>}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

const SELECT_STYLE = {
  background: '#fff',
  border: '1px solid rgba(0,0,0,0.09)',
  borderRadius: '14px',
  color: '#374151',
  fontFamily: 'Poppins,sans-serif',
  fontSize: '13px',
  padding: '11px 36px 11px 14px',
  appearance: 'none',
  outline: 'none',
  cursor: 'pointer',
  width: '100%',
}

function FilterSelect({ icon, value, onChange, children }) {
  return (
    <div className="relative flex-1 min-w-[140px]">
      <i className={`fas ${icon} absolute left-3.5 top-1/2 -translate-y-1/2 text-xs pointer-events-none`} style={{ color: '#9CA3AF' }}/>
      <select value={value} onChange={e => onChange(e.target.value)}
        style={{ ...SELECT_STYLE, paddingLeft: '34px' }}>
        {children}
      </select>
      <i className="fas fa-chevron-down absolute right-3.5 top-1/2 -translate-y-1/2 text-[10px] pointer-events-none" style={{ color: '#9CA3AF' }}/>
    </div>
  )
}

// Sponsor logos — logo URL + branded fallback
const SPONSORS = [
  { name: 'Dangote',          initials: 'DG', bg: '#1A1A1A', color: '#fff',    logo: '/images/sponsors/dangote.png' },
  { name: 'MTN',              initials: 'MTN',bg: '#FFCB00', color: '#1A1A1A', logo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/9/9e/MTN_Logo.svg/200px-MTN_Logo.svg.png' },
  { name: 'Orange',           initials: 'OR', bg: '#FF6600', color: '#fff',    logo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/c/c8/Orange_logo.svg/200px-Orange_logo.svg.png' },
  { name: 'Nestlé',           initials: 'NE', bg: '#003399', color: '#fff',    logo: 'https://upload.wikimedia.org/wikipedia/en/thumb/1/10/Nestl%C3%A9.svg/200px-Nestl%C3%A9.svg.png' },
  { name: 'TotalEnergies',    initials: 'TE', bg: '#EE0000', color: '#fff',    logo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/5/5f/TotalEnergies_logo.svg/200px-TotalEnergies_logo.svg.png' },
  { name: 'Guinness',         initials: 'GS', bg: '#003B1E', color: '#fff',    logo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/b/b0/Guinness_logo_2005.svg/200px-Guinness_logo_2005.svg.png' },
  { name: 'Canal+',           initials: 'C+', bg: '#000000', color: '#fff',    logo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/a/a9/Canal%2B_2017.svg/200px-Canal%2B_2017.svg.png' },
  { name: 'Société Générale', initials: 'SG', bg: '#E1001A', color: '#fff',    logo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/0/0e/Societegenerale.svg/200px-Societegenerale.svg.png' },
  { name: 'Ecobank',          initials: 'EB', bg: '#007DC5', color: '#fff',    logo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/4/45/Ecobank_logo.png/200px-Ecobank_logo.png' },
  { name: 'UBA',              initials: 'UBA',bg: '#C8102E', color: '#fff',    logo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/1/10/UBA_Logo.svg/200px-UBA_Logo.svg.png' },
  { name: 'Bolloré',          initials: 'BL', bg: '#003087', color: '#fff',    logo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/5/56/Bollore_Group_logo.svg/200px-Bollore_Group_logo.svg.png' },
  { name: 'Afriland',         initials: 'AF', bg: '#006633', color: '#fff',    logo: null },
]

function SponsorLogo({ sponsor: s }) {
  const [imgFailed, setImgFailed] = useState(false)
  const showInitials = !s.logo || imgFailed

  return (
    <div
      className="w-24 h-24 flex items-center justify-center p-3 flex-shrink-0 transition-all duration-500 hover:scale-110"
      style={{
        borderRadius: 28,
        background: showInitials ? s.bg : '#fff',
        border: `1px solid ${showInitials ? 'transparent' : '#f1f5f9'}`,
        boxShadow: '0 4px 20px rgba(0,0,0,0.04)',
      }}
      onMouseEnter={e => { e.currentTarget.style.boxShadow = '0 10px 30px rgba(16,185,129,0.12)'; e.currentTarget.style.borderColor = showInitials ? 'transparent' : '#6ee7b7' }}
      onMouseLeave={e => { e.currentTarget.style.boxShadow = '0 4px 20px rgba(0,0,0,0.04)'; e.currentTarget.style.borderColor = showInitials ? 'transparent' : '#f1f5f9' }}>
      {showInitials ? (
        <span className="font-black text-sm tracking-tight" style={{ color: s.color, fontFamily: 'Sora,sans-serif' }}>{s.initials}</span>
      ) : (
        <img src={s.logo} alt={s.name} className="w-full h-full object-contain"
          onError={() => setImgFailed(true)}/>
      )}
    </div>
  )
}

function SponsorsStrip() {
  return (
    <div className="py-8" style={{ background: '#fff', borderTop: '1px solid rgba(0,0,0,0.06)' }}>
      <p className="text-center text-[10px] font-bold uppercase tracking-widest mb-6"
        style={{ color: '#9CA3AF', fontFamily: 'Sora,sans-serif' }}>
        Trusted by leading employers
      </p>

      <div className="max-w-6xl mx-auto px-6">
        <div className="relative overflow-hidden">

          {/* Fade masks */}
          <div className="absolute left-0 top-0 bottom-0 w-16 z-10 pointer-events-none"
            style={{ background: 'linear-gradient(to right, #fff, transparent)' }}/>
          <div className="absolute right-0 top-0 bottom-0 w-16 z-10 pointer-events-none"
            style={{ background: 'linear-gradient(to left, #fff, transparent)' }}/>

          {/* Track: two identical sets side by side, animation shifts by exactly 50% */}
          <div className="flex animate-scroll-x items-center" style={{ width: 'max-content', gap: 40 }}>
            {[...Array(2)].map((_, setIdx) => (
              <div key={setIdx} className="flex items-center" style={{ gap: 40 }}>
                {SPONSORS.map((s, i) => (
                  <SponsorLogo key={i} sponsor={s}/>
                ))}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

function HeroJobSlider({ posts }) {
  const [idx, setIdx] = useState(0)

  useEffect(() => {
    if (posts.length < 2) return
    const t = setInterval(() => setIdx(i => (i + 1) % posts.length), 3500)
    return () => clearInterval(t)
  }, [posts.length])

  if (!posts.length) return null
  const post = posts[idx]
  const meta = TYPE_META[post.type] || TYPE_META.job
  const initials = (post.companyName || post.title).slice(0, 2).toUpperCase()

  return (
    <div className="flex-shrink-0" style={{ width: 290 }}>
      <Link to={`/jobs/${post.id}`} key={post.id}
        className="block rounded-2xl p-5 transition-all duration-500 hover:-translate-y-1"
        style={{
          background: 'rgba(255,255,255,0.12)',
          backdropFilter: 'blur(20px)',
          WebkitBackdropFilter: 'blur(20px)',
          border: '1px solid rgba(255,255,255,0.22)',
          boxShadow: '0 8px 32px rgba(0,0,0,0.25)',
        }}>

        {/* Header */}
        <div className="flex items-start gap-3 mb-3">
          {post.imageUrl ? (
            <img src={post.imageUrl} alt="" className="w-10 h-10 rounded-xl object-cover flex-shrink-0"/>
          ) : (
            <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 text-xs font-black text-white"
              style={{ background: `linear-gradient(135deg,${meta.color},${meta.color}88)` }}>
              {initials}
            </div>
          )}
          <div className="flex-1 min-w-0">
            <p className="text-[9px] font-black uppercase tracking-widest mb-0.5" style={{ color: '#00C48C' }}>
              {post.category} · {meta.label}
            </p>
            <h4 className="text-sm font-bold leading-snug truncate" style={{ color: '#fff', fontFamily: 'Sora,sans-serif' }}>
              {post.companyName || post.title}
            </h4>
          </div>
        </div>

        <p className="text-xs leading-relaxed line-clamp-3 mb-4" style={{ color: 'rgba(255,255,255,0.72)', fontFamily: 'Poppins,sans-serif' }}>
          {post.description}
        </p>

        <div className="w-8 h-0.5 rounded-full mb-4" style={{ background: '#00C48C' }}/>

        {/* Footer */}
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold" style={{ color: '#fff', fontFamily: 'Sora,sans-serif' }}>Apply Now</span>
          <i className="fas fa-arrow-right text-xs" style={{ color: '#00C48C' }}/>
        </div>
      </Link>

      {/* Dot indicators */}
      {posts.length > 1 && (
        <div className="flex items-center justify-center gap-1.5 mt-3">
          {posts.map((_, i) => (
            <button key={i} onClick={() => setIdx(i)}
              className="rounded-full transition-all duration-300"
              style={{
                width: i === idx ? 20 : 6,
                height: 6,
                background: i === idx ? '#00C48C' : 'rgba(255,255,255,0.35)',
              }}/>
          ))}
        </div>
      )}
    </div>
  )
}

function PremiumSuccessBanner({ onClose }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: 'rgba(10,4,28,0.6)', backdropFilter: 'blur(8px)' }}>
      <div className="bg-white rounded-3xl w-full max-w-md text-center overflow-hidden"
        style={{ boxShadow: '0 32px 80px rgba(0,0,0,0.3)' }}>
        {/* Gold header */}
        <div className="px-8 pt-10 pb-6" style={{ background: 'linear-gradient(135deg,#1A0A35,#5B2D8E)' }}>
          <div className="w-20 h-20 rounded-full mx-auto mb-4 flex items-center justify-center"
            style={{ background: 'rgba(240,165,0,0.2)', border: '2px solid rgba(240,165,0,0.4)' }}>
            <i className="fas fa-crown text-4xl" style={{ color: '#F0A500' }}/>
          </div>
          <h2 className="font-display font-black text-2xl text-white mb-2">You're Premium!</h2>
          <p className="text-sm" style={{ color: 'rgba(255,255,255,0.7)', fontFamily: 'Poppins,sans-serif' }}>
            Payment confirmed. All features are now unlocked.
          </p>
        </div>
        {/* Perks */}
        <div className="px-8 py-6 space-y-3">
          {[
            ['fa-envelope-open-text','Recruiter contacts revealed'],
            ['fa-magic','AI CV generator unlocked'],
            ['fa-crown','Premium badge on your profile'],
          ].map(([icon, label]) => (
            <div key={label} className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0"
                style={{ background: 'rgba(0,196,140,0.1)' }}>
                <i className={`fas ${icon} text-sm`} style={{ color: '#00A876' }}/>
              </div>
              <span className="text-sm font-semibold text-left" style={{ color: '#111827', fontFamily: 'Sora,sans-serif' }}>
                {label}
              </span>
              <i className="fas fa-check ml-auto text-xs" style={{ color: '#00A876' }}/>
            </div>
          ))}
        </div>
        <div className="px-8 pb-8">
          <button onClick={onClose}
            className="w-full py-3.5 rounded-2xl font-bold text-sm text-white transition-all hover:-translate-y-0.5"
            style={{ background: 'linear-gradient(135deg,#00A876,#00C48C)', boxShadow: '0 8px 24px rgba(0,196,140,0.35)' }}>
            Start Browsing Jobs
          </button>
        </div>
      </div>
    </div>
  )
}

export default function JobBoardPage() {
  const { user, refreshUser } = useAuth()
  const location  = useLocation()
  const navigate  = useNavigate()
  const [showPremiumBanner, setShowPremiumBanner] = useState(false)
  const [search, setSearch]   = useState('')
  const [typeF, setTypeF]     = useState('')
  const [catF, setCatF]       = useState('')
  const [locF, setLocF]       = useState('')
  const [showForm, setShowForm] = useState(false)
  const [page, setPage]       = useState(1)

  // Detect Flutterwave redirect back after payment
  useEffect(() => {
    const params = new URLSearchParams(location.search)
    const status = params.get('status')
    const transaction_id = params.get('transaction_id')
    const tx_ref = params.get('tx_ref')

    // Flutterwave appends status=successful, transaction_id and tx_ref on redirect
    if ((status === 'successful' || params.get('premium') === 'success') && (transaction_id || tx_ref)) {
      navigate('/jobs', { replace: true })
      api.post('/premium/verify', { transaction_id, tx_ref })
        .then(() => refreshUser())
        .then(() => setShowPremiumBanner(true))
        .catch(() => {
          // Webhook may have already processed it — just refresh user silently
          refreshUser()
        })
    }
  }, [])

  const { data, isLoading } = useQuery(['jobs', typeF, catF, page],
    () => api.get('/jobs', { params: { type: typeF || undefined, category: catF || undefined, page, limit: 24 } }).then(r => r.data),
    { keepPreviousData: true })

  const allPosts = data?.posts || []

  // Client-side search + location filter on top of server results
  const posts = useMemo(() => {
    let filtered = allPosts
    if (search.trim()) {
      const q = search.toLowerCase()
      filtered = filtered.filter(p =>
        p.title.toLowerCase().includes(q) ||
        (p.companyName || '').toLowerCase().includes(q) ||
        p.description.toLowerCase().includes(q)
      )
    }
    if (locF) {
      filtered = filtered.filter(p => (p.location || '').toLowerCase().includes(locF.toLowerCase()))
    }
    return filtered
  }, [allPosts, search, locF])

  const totalPages = data?.pages || 1

  // Up to 5 posts for the hero slider (featured first)
  const heroJobs = [
    ...allPosts.filter(p => p.isFeatured),
    ...allPosts.filter(p => !p.isFeatured),
  ].slice(0, 5)

  // Unique locations from current results for the dropdown
  const locations = useMemo(() => {
    const locs = [...new Set(allPosts.map(p => p.location).filter(Boolean))]
    return locs.sort()
  }, [allPosts])

  return (
    <div style={{ background: '#F5F6FA', minHeight: '100vh' }}>

      {/* ── Hero ─────────────────────────────────────────── */}
      <div className="max-w-6xl mx-auto px-6 pt-6 pb-0">
        <div className="relative rounded-3xl overflow-hidden" style={{ minHeight: 420 }}>

          {/* Background photo */}
          <img
            src="https://images.pexels.com/photos/9301252/pexels-photo-9301252.jpeg"
            alt=""
            className="absolute inset-0 w-full h-full object-cover object-center"
          />

          {/* Dark gradient overlay — heavy left for text, lighter right */}
          <div className="absolute inset-0"
            style={{ background: 'linear-gradient(to right,rgba(10,20,12,0.88) 0%,rgba(10,20,12,0.6) 50%,rgba(10,20,12,0.2) 100%)' }}/>

          {/* Content */}
          <div className="relative flex items-center justify-between gap-8 px-8 md:px-14 py-16">

            {/* Left — headline + CTA */}
            <div className="flex-1 max-w-lg">
              <h1 className="font-display font-black text-4xl md:text-5xl leading-tight text-white mb-4">
                Find, apply,<br/>
                <span style={{ color: '#00C48C' }}>succeed</span> with<br/>
                <span style={{ color: '#00C48C' }}>Nkenkak Jobs</span>
              </h1>
              <p className="text-sm md:text-base mb-8" style={{ color: 'rgba(255,255,255,0.7)', fontFamily: 'Poppins,sans-serif', lineHeight: 1.7, maxWidth: 420 }}>
                Don't wait for opportunities to come to you. Explore jobs, services and listings posted by your community.
              </p>
              <div className="flex flex-wrap items-center gap-3">
                <button
                  onClick={() => document.getElementById('jobs-list')?.scrollIntoView({ behavior: 'smooth' })}
                  className="flex items-center gap-2 px-6 py-3 rounded-2xl text-sm font-bold transition-all hover:-translate-y-0.5"
                  style={{ background: '#00C48C', color: '#fff', boxShadow: '0 8px 24px rgba(0,196,140,0.4)' }}>
                  <i className="fas fa-search"/>Browse Jobs
                </button>
                {user ? (
                  <button
                    onClick={() => setShowForm(true)}
                    className="flex items-center gap-2 px-6 py-3 rounded-2xl text-sm font-bold transition-all hover:-translate-y-0.5"
                    style={{ background: 'rgba(255,255,255,0.12)', color: '#fff', backdropFilter: 'blur(8px)', border: '1px solid rgba(255,255,255,0.2)' }}>
                    Post a Listing
                  </button>
                ) : (
                  <Link to="/login"
                    className="flex items-center gap-2 px-6 py-3 rounded-2xl text-sm font-bold transition-all hover:-translate-y-0.5"
                    style={{ background: 'rgba(255,255,255,0.12)', color: '#fff', backdropFilter: 'blur(8px)', border: '1px solid rgba(255,255,255,0.2)' }}>
                    Get Started
                  </Link>
                )}
              </div>
            </div>

            {/* Right — glassmorphism job slider */}
            <div className="hidden md:block">
              <HeroJobSlider posts={heroJobs}/>
            </div>
          </div>
        </div>
      </div>

      {/* ── Sponsors strip ───────────────────────────────── */}
      <SponsorsStrip/>

      <div id="jobs-list" className="max-w-6xl mx-auto px-6 py-8">

        {/* Search + Filter bar */}
        <div className="bg-white rounded-2xl p-4 mb-8 flex flex-wrap gap-3"
          style={{ boxShadow: '0 2px 16px rgba(0,0,0,0.06)', border: '1px solid rgba(0,0,0,0.06)' }}>

          {/* Search */}
          <div className="relative flex-[2] min-w-[200px]">
            <i className="fas fa-search absolute left-3.5 top-1/2 -translate-y-1/2 text-xs pointer-events-none" style={{ color: '#9CA3AF' }}/>
            <input
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Job title or keyword…"
              style={{ ...SELECT_STYLE, paddingLeft: '34px', width: '100%' }}
            />
          </div>

          {/* Type */}
          <FilterSelect icon="fa-filter" value={typeF} onChange={v => { setTypeF(v); setPage(1) }}>
            <option value="">All Types</option>
            {Object.entries(TYPE_META).map(([v,m]) => <option key={v} value={v}>{m.label}</option>)}
          </FilterSelect>

          {/* Location */}
          <FilterSelect icon="fa-map-marker-alt" value={locF} onChange={setLocF}>
            <option value="">All Locations</option>
            {locations.map(l => <option key={l} value={l}>{l}</option>)}
          </FilterSelect>

          {/* Category */}
          <FilterSelect icon="fa-th-large" value={catF} onChange={v => { setCatF(v); setPage(1) }}>
            <option value="">All Categories</option>
            {['agriculture','tech','health','education','construction','services','other'].map(c =>
              <option key={c} value={c} style={{ textTransform: 'capitalize' }}>{c}</option>
            )}
          </FilterSelect>
        </div>

        {/* Results count */}
        {!isLoading && (
          <p className="text-xs mb-4" style={{ color: '#9CA3AF', fontFamily: 'Poppins,sans-serif' }}>
            {posts.length} listing{posts.length !== 1 ? 's' : ''} found
          </p>
        )}

        {isLoading ? (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {[1,2,3,4,5,6].map(i => <div key={i} className="h-44 rounded-2xl animate-pulse" style={{ background: 'rgba(0,0,0,0.05)' }}/>)}
          </div>
        ) : !posts.length ? (
          <div className="text-center py-20 rounded-2xl bg-white"
            style={{ border: '1px dashed rgba(0,0,0,0.1)' }}>
            <i className="fas fa-briefcase text-5xl mb-4 block" style={{ color: 'rgba(91,45,142,0.18)' }}/>
            <h3 className="font-display font-bold text-xl mb-2" style={{ color: '#1A0A35' }}>No listings found</h3>
            <p className="text-sm mb-4" style={{ color: '#737373' }}>Try adjusting your search or filters</p>
            {user && <button onClick={() => setShowForm(true)} className="btn-secondary !text-sm">Post the first listing</button>}
          </div>
        ) : (
          <>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
              {posts.map(p => <PostCard key={p.id} post={p}/>)}
            </div>
            {totalPages > 1 && (
              <div className="flex justify-center gap-2 mt-10">
                <button onClick={() => setPage(p => Math.max(1,p-1))} disabled={page===1}
                  className="px-4 py-2 rounded-xl text-xs font-semibold disabled:opacity-30"
                  style={{ background: 'rgba(91,45,142,0.08)', color: '#5B2D8E' }}>← Prev</button>
                <span className="px-4 py-2 text-xs" style={{ color: '#737373' }}>Page {page} of {totalPages}</span>
                <button onClick={() => setPage(p => Math.min(totalPages,p+1))} disabled={page===totalPages}
                  className="px-4 py-2 rounded-xl text-xs font-semibold disabled:opacity-30"
                  style={{ background: 'rgba(91,45,142,0.08)', color: '#5B2D8E' }}>Next →</button>
              </div>
            )}
          </>
        )}
      </div>

      {showForm && <PostForm onClose={() => setShowForm(false)}/>}
      {showPremiumBanner && <PremiumSuccessBanner onClose={() => setShowPremiumBanner(false)}/>}
    </div>
  )
}
