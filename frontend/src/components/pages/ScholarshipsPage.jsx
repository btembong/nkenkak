import { useState, useMemo } from 'react'
import { Link } from 'react-router-dom'
import { useQuery, useMutation } from 'react-query'
import { useForm } from 'react-hook-form'
import toast from 'react-hot-toast'
import api from '../../services/api'
import { useAuth } from '../../context/AuthContext'

const LEVEL_META = {
  primary:    { label: 'Primary',    color: '#16A34A', bg: 'rgba(22,163,74,0.10)',    border: 'rgba(22,163,74,0.22)' },
  secondary:  { label: 'Secondary',  color: '#0369A1', bg: 'rgba(3,105,161,0.10)',    border: 'rgba(3,105,161,0.22)' },
  university: { label: 'University', color: '#5B2D8E', bg: 'rgba(91,45,142,0.10)',   border: 'rgba(91,45,142,0.22)' },
  vocational: { label: 'Vocational', color: '#C2410C', bg: 'rgba(194,65,12,0.10)',   border: 'rgba(194,65,12,0.22)' },
}

const STATUS_META = {
  active:    { label: 'Active',    color: '#16A34A', bg: 'rgba(22,163,74,0.10)',  border: 'rgba(22,163,74,0.22)' },
  completed: { label: 'Completed', color: '#737373', bg: 'rgba(115,115,115,0.10)', border: 'rgba(115,115,115,0.22)' },
  suspended: { label: 'Suspended', color: '#B91C1C', bg: 'rgba(185,28,28,0.10)',  border: 'rgba(185,28,28,0.22)' },
}

const getLevelMeta  = (k) => LEVEL_META[k]  || LEVEL_META.vocational
const getStatusMeta = (k) => STATUS_META[k] || STATUS_META.completed

function formatAmount(amount, currency) {
  if (!amount) return null
  const cur = currency || 'XAF'
  return `${cur} ${Number(amount).toLocaleString()}`
}

function SkeletonCard() {
  return (
    <div className="rounded-3xl overflow-hidden animate-pulse" style={{ background: '#fff', height: 360, boxShadow: '0 2px 16px rgba(91,45,142,0.06)' }} />
  )
}

function ScholarCard({ scholar }) {
  const level  = getLevelMeta(scholar.level)
  const status = getStatusMeta(scholar.status)
  const amount = formatAmount(scholar.amount, scholar.currency)

  return (
    <div className="card flex flex-col overflow-hidden transition-all hover:-translate-y-1 hover:shadow-xl" style={{ borderTop: `3px solid ${level.color}` }}>
      {/* Photo */}
      <div className="flex justify-center pt-7 pb-3">
        {scholar.photoUrl ? (
          <img
            src={scholar.photoUrl}
            alt={scholar.name}
            className="w-20 h-20 object-cover rounded-2xl"
            style={{ border: `2px solid ${level.color}30` }}
          />
        ) : (
          <div className="w-20 h-20 rounded-2xl flex items-center justify-center"
            style={{ background: `linear-gradient(135deg,${level.color}18,${level.color}08)`, border: `2px solid ${level.color}22` }}>
            <i className="fas fa-graduation-cap text-3xl" style={{ color: level.color }} />
          </div>
        )}
      </div>

      {/* Content */}
      <div className="flex-1 px-5 pb-5 flex flex-col">
        <h3 className="font-display font-bold text-base text-center mb-0.5 leading-snug" style={{ color: '#1A0A35' }}>{scholar.name}</h3>
        {scholar.school && (
          <p className="text-xs text-center mb-3" style={{ color: '#5B2D8E', fontFamily: 'Poppins,sans-serif', fontWeight: 600 }}>{scholar.school}</p>
        )}
        {scholar.subject && (
          <p className="text-xs text-center mb-3 truncate" style={{ color: '#737373', fontFamily: 'Poppins,sans-serif' }}>{scholar.subject}</p>
        )}

        {/* Badges row */}
        <div className="flex flex-wrap justify-center gap-1.5 mb-3">
          <span className="text-xs px-2.5 py-0.5 rounded-full font-semibold"
            style={{ background: level.bg, color: level.color, border: `1px solid ${level.border}`, fontFamily: 'Sora,sans-serif' }}>
            {level.label}
          </span>
          {scholar.year && (
            <span className="text-xs px-2.5 py-0.5 rounded-full font-medium"
              style={{ background: 'rgba(91,45,142,0.07)', color: '#5B2D8E', fontFamily: 'Sora,sans-serif' }}>
              {scholar.year}
            </span>
          )}
          <span className="text-xs px-2.5 py-0.5 rounded-full font-semibold"
            style={{ background: status.bg, color: status.color, border: `1px solid ${status.border}`, fontFamily: 'Sora,sans-serif' }}>
            {status.label}
          </span>
        </div>

        {/* Amount */}
        {amount && (
          <div className="text-center mb-2">
            <span className="font-display font-bold text-sm" style={{ color: '#1A0A35' }}>{amount}</span>
          </div>
        )}

        {/* Sponsor */}
        {scholar.sponsorName && (
          <p className="text-xs text-center mb-3" style={{ color: '#F0A500', fontFamily: 'Poppins,sans-serif' }}>
            <i className="fas fa-hand-holding-heart text-[10px] mr-1" />
            Sponsored by {scholar.sponsorName}
          </p>
        )}

        {/* Bio */}
        {scholar.bio && (
          <p className="text-xs leading-relaxed text-center mt-auto"
            style={{ color: '#737373', fontFamily: 'Poppins,sans-serif', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
            {scholar.bio}
          </p>
        )}
      </div>
    </div>
  )
}

function ApplyModal({ program, onClose }) {
  const { user } = useAuth()
  const { register, handleSubmit, formState: { errors } } = useForm({
    defaultValues: {
      fullName: user ? `${user.firstName} ${user.lastName}` : '',
      email: user?.email || '',
    }
  })

  const applyMut = useMutation(
    data => api.post(`/scholarship-programs/${program.id}/apply`, { ...data, userId: user?.id }),
    {
      onSuccess: () => { toast.success('Application submitted!'); onClose() },
      onError: e => toast.error(e.response?.data?.error || 'Could not submit application'),
    }
  )

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{background:'rgba(26,10,53,0.8)',backdropFilter:'blur(8px)'}}
      onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="bg-white rounded-3xl w-full max-w-lg max-h-[90vh] overflow-y-auto"
        style={{boxShadow:'0 32px 80px rgba(26,10,53,0.25)'}}>
        <div className="px-7 pt-6 pb-4 border-b sticky top-0 bg-white z-10" style={{borderColor:'rgba(91,45,142,0.08)'}}>
          <div className="flex items-start justify-between gap-3">
            <div>
              <h3 className="font-display font-bold text-xl" style={{color:'#1A0A35'}}>Apply for Scholarship</h3>
              <p className="text-xs mt-0.5" style={{color:'#A3A3A3',fontFamily:'Poppins,sans-serif'}}>{program.title} · {program.academicYear}</p>
            </div>
            <button onClick={onClose} className="w-9 h-9 rounded-full flex items-center justify-center hover:bg-gray-100" style={{color:'#A3A3A3'}}>
              <i className="fas fa-times"/>
            </button>
          </div>
        </div>
        <form onSubmit={handleSubmit(d => applyMut.mutate(d))} className="p-7 space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="label">Full Name *</label>
              <input {...register('fullName', { required: 'Required' })} className="input"/>
              {errors.fullName && <p className="text-xs mt-1" style={{color:'#dc2626'}}>{errors.fullName.message}</p>}
            </div>
            <div>
              <label className="label">Email *</label>
              <input type="email" {...register('email', { required: 'Required' })} className="input"/>
              {errors.email && <p className="text-xs mt-1" style={{color:'#dc2626'}}>{errors.email.message}</p>}
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="label">Phone</label>
              <input {...register('phone')} className="input" placeholder="+237…"/>
            </div>
            <div>
              <label className="label">Date of Birth</label>
              <input type="date" {...register('dateOfBirth')} className="input"/>
            </div>
          </div>
          <div>
            <label className="label">School / Institution *</label>
            <input {...register('school', { required: 'Required' })} className="input"/>
            {errors.school && <p className="text-xs mt-1" style={{color:'#dc2626'}}>{errors.school.message}</p>}
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="label">Level of Study</label>
              <select {...register('level')} className="input">
                <option value="primary">Primary</option>
                <option value="secondary">Secondary</option>
                <option value="university">University</option>
                <option value="vocational">Vocational</option>
              </select>
            </div>
            <div>
              <label className="label">Subject / Field</label>
              <input {...register('subject')} className="input" placeholder="e.g. Engineering"/>
            </div>
          </div>
          <div>
            <label className="label">GPA / Grade Average</label>
            <input {...register('gpa')} className="input" placeholder="e.g. 3.8 / 4.0 or 15/20"/>
          </div>
          <div>
            <label className="label">Motivation Statement *</label>
            <textarea {...register('motivation', { required: 'Required' })} rows={4} className="input resize-none"
              placeholder="Why do you deserve this scholarship and how will it help you?"/>
            {errors.motivation && <p className="text-xs mt-1" style={{color:'#dc2626'}}>{errors.motivation.message}</p>}
          </div>
          <div className="flex gap-3 pt-2">
            <button type="button" onClick={onClose} className="flex-1 py-3 rounded-2xl text-sm font-semibold"
              style={{background:'rgba(91,45,142,0.05)',color:'#737373',border:'1px solid rgba(91,45,142,0.1)',fontFamily:'Sora,sans-serif'}}>
              Cancel
            </button>
            <button type="submit" disabled={applyMut.isLoading} className="btn-secondary flex-1 justify-center">
              {applyMut.isLoading ? <><i className="fas fa-spinner animate-spin"/>Submitting…</> : <><i className="fas fa-paper-plane"/>Submit Application</>}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

function OpenProgramsSection() {
  const [applying, setApplying] = useState(null)

  const { data: programs = [], isLoading } = useQuery('scholarship-programs',
    () => api.get('/scholarship-programs').then(r => r.data))

  if (isLoading) return null
  if (!programs.length) return null

  return (
    <div className="mt-20">
      <div className="text-center mb-10">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full mb-4"
          style={{background:'rgba(240,165,0,0.1)',border:'1px solid rgba(240,165,0,0.2)'}}>
          <i className="fas fa-scroll text-xs" style={{color:'#F0A500'}}/>
          <span className="text-xs font-bold uppercase tracking-widest" style={{color:'#F0A500',fontFamily:'Sora,sans-serif'}}>Apply Now</span>
        </div>
        <h2 className="font-display font-bold text-3xl" style={{color:'#1A0A35'}}>Open Scholarship Programs</h2>
        <p className="text-sm mt-2 max-w-md mx-auto" style={{color:'#737373',fontFamily:'Poppins,sans-serif'}}>
          Applications are currently open. Submit your application before the deadline.
        </p>
      </div>
      <div className="grid md:grid-cols-2 gap-6">
        {programs.filter(p => p.isOpen).map(p => (
          <div key={p.id} className="rounded-3xl p-6" style={{background:'#fff',border:'1px solid rgba(91,45,142,0.08)',boxShadow:'0 4px 24px rgba(91,45,142,0.06)'}}>
            <div className="flex items-start justify-between gap-3 mb-3">
              <h3 className="font-display font-bold text-lg" style={{color:'#1A0A35'}}>{p.title}</h3>
              <span className="text-[10px] font-bold px-2.5 py-1 rounded-full flex-shrink-0"
                style={{background:'rgba(22,163,74,0.1)',color:'#16a34a'}}>Open</span>
            </div>
            <p className="text-sm mb-4 leading-relaxed" style={{color:'#737373',fontFamily:'Poppins,sans-serif'}}>{p.description}</p>
            <div className="space-y-2 mb-5">
              {p.eligibility && (
                <div className="flex gap-2 text-xs" style={{color:'#4B4B6B',fontFamily:'Poppins,sans-serif'}}>
                  <i className="fas fa-check-circle mt-0.5 flex-shrink-0" style={{color:'#5B2D8E'}}/>
                  <span><strong>Eligibility:</strong> {p.eligibility}</span>
                </div>
              )}
              {p.benefits && (
                <div className="flex gap-2 text-xs" style={{color:'#4B4B6B',fontFamily:'Poppins,sans-serif'}}>
                  <i className="fas fa-gift mt-0.5 flex-shrink-0" style={{color:'#F0A500'}}/>
                  <span><strong>Benefits:</strong> {p.benefits}</span>
                </div>
              )}
              <div className="flex gap-2 text-xs" style={{color:'#4B4B6B',fontFamily:'Poppins,sans-serif'}}>
                <i className="fas fa-users mt-0.5 flex-shrink-0" style={{color:'#16a34a'}}/>
                <span><strong>Slots:</strong> {p.slots} · <strong>{p._count?.applications || 0}</strong> applications received</span>
              </div>
              {p.deadline && (
                <div className="flex gap-2 text-xs" style={{color:'#dc2626',fontFamily:'Poppins,sans-serif'}}>
                  <i className="fas fa-calendar-times mt-0.5 flex-shrink-0"/>
                  <span><strong>Deadline:</strong> {new Date(p.deadline).toLocaleDateString('en-GB',{day:'numeric',month:'long',year:'numeric'})}</span>
                </div>
              )}
            </div>
            <button onClick={() => setApplying(p)} className="btn-secondary w-full justify-center !py-2.5 !text-sm">
              <i className="fas fa-paper-plane text-xs"/>Apply Now
            </button>
          </div>
        ))}
      </div>
      {applying && <ApplyModal program={applying} onClose={() => setApplying(null)}/>}
    </div>
  )
}

export default function ScholarshipsPage() {
  const [filterYear,   setFilterYear]   = useState('all')
  const [filterLevel,  setFilterLevel]  = useState('all')
  const [filterStatus, setFilterStatus] = useState('all')

  const { data, isLoading } = useQuery(
    'scholarships',
    () => api.get('/scholarships').then(r => r.data),
    { staleTime: 60000 }
  )

  const scholars = data || []

  const years = useMemo(() => {
    const unique = [...new Set(scholars.map(s => s.year).filter(Boolean))].sort((a, b) => b - a)
    return unique
  }, [scholars])

  const levels  = ['primary', 'secondary', 'university', 'vocational']
  const statuses = ['active', 'completed', 'suspended']

  const filtered = scholars.filter(s => {
    const okYear   = filterYear   === 'all' || String(s.year)   === filterYear
    const okLevel  = filterLevel  === 'all' || s.level          === filterLevel
    const okStatus = filterStatus === 'all' || s.status         === filterStatus
    return okYear && okLevel && okStatus
  })

  const activeCount    = scholars.filter(s => s.status === 'active').length
  const completedCount = scholars.filter(s => s.status === 'completed').length
  const totalYears     = years.length

  return (
    <div style={{ background: '#F9F7FD', minHeight: '100vh' }}>
      {/* Hero */}
      <div className="page-hero relative overflow-hidden">
        <div className="absolute inset-0 opacity-10" style={{ backgroundImage: 'radial-gradient(circle at 20% 50%, #F0A500 0%, transparent 50%), radial-gradient(circle at 80% 20%, #7B4DB8 0%, transparent 40%)' }} />
        <div className="relative max-w-5xl mx-auto px-6 py-20 text-center">
          <div className="inline-flex items-center gap-2 mb-4 px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-widest"
            style={{ background: 'rgba(240,165,0,0.15)', color: '#F0A500', border: '1px solid rgba(240,165,0,0.25)' }}>
            <i className="fas fa-graduation-cap text-[10px]" />Scholarships &amp; Bursaries
          </div>
          <h1 className="font-display font-bold text-4xl md:text-5xl text-white mb-4 leading-tight">
            Scholarships &amp; <span style={{ color: '#F0A500' }}>Bursaries</span>
          </h1>
          <p className="text-base max-w-xl mx-auto" style={{ color: 'rgba(255,255,255,0.65)', fontFamily: 'Poppins,sans-serif' }}>
            Investing in the education of our children — the future of Nkenkak-Ngiesang.
          </p>
          <div className="flex items-center justify-center gap-2 text-xs mt-6" style={{ color: 'rgba(255,255,255,0.5)', fontFamily: 'Poppins,sans-serif' }}>
            <Link to="/" className="hover:text-white transition-colors flex items-center gap-1"><i className="fas fa-home text-[10px]" />Home</Link>
            <i className="fas fa-chevron-right text-[8px]" style={{ color: '#F0A500' }} />
            <span style={{ color: '#F0A500' }}>Scholarships</span>
          </div>
        </div>
      </div>

      {/* Impact stats bar */}
      {!isLoading && scholars.length > 0 && (
        <div className="bg-white border-b" style={{ borderColor: 'rgba(91,45,142,0.06)' }}>
          <div className="max-w-5xl mx-auto px-6 py-5 grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
            {[
              { label: 'Total Recipients', value: scholars.length, icon: 'fa-users', color: '#5B2D8E' },
              { label: 'Years of Support', value: totalYears,      icon: 'fa-calendar', color: '#F0A500' },
              { label: 'Active Scholars',  value: activeCount,     icon: 'fa-book-open', color: '#16A34A' },
              { label: 'Completed',        value: completedCount,  icon: 'fa-check-circle', color: '#737373' },
            ].map(s => (
              <div key={s.label} className="flex flex-col items-center">
                <div className="w-9 h-9 rounded-xl flex items-center justify-center mb-1.5" style={{ background: `${s.color}12` }}>
                  <i className={`fas ${s.icon} text-sm`} style={{ color: s.color }} />
                </div>
                <div className="font-display font-bold text-xl" style={{ color: '#1A0A35' }}>{s.value}</div>
                <div className="text-xs" style={{ color: '#737373', fontFamily: 'Poppins,sans-serif' }}>{s.label}</div>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="max-w-7xl mx-auto px-6 py-12">
        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-3 mb-10 bg-white p-4 rounded-2xl" style={{ boxShadow: '0 2px 16px rgba(91,45,142,0.06)' }}>
          {/* Year filter */}
          <div className="flex flex-col gap-1 flex-1">
            <label className="text-xs font-semibold" style={{ color: '#737373', fontFamily: 'Sora,sans-serif' }}>Year</label>
            <select
              value={filterYear}
              onChange={e => setFilterYear(e.target.value)}
              className="text-sm px-4 py-2.5 rounded-xl border outline-none"
              style={{ borderColor: 'rgba(91,45,142,0.15)', color: '#1A0A35', fontFamily: 'Poppins,sans-serif', background: 'rgba(91,45,142,0.03)' }}>
              <option value="all">All Years</option>
              {years.map(y => <option key={y} value={String(y)}>{y}</option>)}
            </select>
          </div>

          {/* Level filter */}
          <div className="flex flex-col gap-1 flex-1">
            <label className="text-xs font-semibold" style={{ color: '#737373', fontFamily: 'Sora,sans-serif' }}>Level</label>
            <select
              value={filterLevel}
              onChange={e => setFilterLevel(e.target.value)}
              className="text-sm px-4 py-2.5 rounded-xl border outline-none"
              style={{ borderColor: 'rgba(91,45,142,0.15)', color: '#1A0A35', fontFamily: 'Poppins,sans-serif', background: 'rgba(91,45,142,0.03)' }}>
              <option value="all">All Levels</option>
              {levels.map(l => <option key={l} value={l}>{getLevelMeta(l).label}</option>)}
            </select>
          </div>

          {/* Status filter */}
          <div className="flex flex-col gap-1 flex-1">
            <label className="text-xs font-semibold" style={{ color: '#737373', fontFamily: 'Sora,sans-serif' }}>Status</label>
            <select
              value={filterStatus}
              onChange={e => setFilterStatus(e.target.value)}
              className="text-sm px-4 py-2.5 rounded-xl border outline-none"
              style={{ borderColor: 'rgba(91,45,142,0.15)', color: '#1A0A35', fontFamily: 'Poppins,sans-serif', background: 'rgba(91,45,142,0.03)' }}>
              <option value="all">All Statuses</option>
              {statuses.map(s => <option key={s} value={s}>{getStatusMeta(s).label}</option>)}
            </select>
          </div>

          {/* Reset */}
          {(filterYear !== 'all' || filterLevel !== 'all' || filterStatus !== 'all') && (
            <div className="flex items-end">
              <button
                onClick={() => { setFilterYear('all'); setFilterLevel('all'); setFilterStatus('all') }}
                className="px-4 py-2.5 rounded-xl text-xs font-semibold transition-all hover:opacity-80"
                style={{ background: 'rgba(91,45,142,0.08)', color: '#5B2D8E', fontFamily: 'Sora,sans-serif' }}>
                <i className="fas fa-times mr-1" />Reset
              </button>
            </div>
          )}
        </div>

        <p className="text-xs mb-6" style={{ color: '#A3A3A3', fontFamily: 'Poppins,sans-serif' }}>
          <strong style={{ color: '#1A0A35' }}>{filtered.length}</strong> scholar{filtered.length !== 1 ? 's' : ''} found
        </p>

        {/* Grid */}
        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3, 4, 5, 6].map(i => <SkeletonCard key={i} />)}
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-24 rounded-3xl" style={{ background: 'rgba(91,45,142,0.02)', border: '1px dashed rgba(91,45,142,0.12)' }}>
            <i className="fas fa-graduation-cap text-5xl mb-4 block" style={{ color: 'rgba(91,45,142,0.18)' }} />
            <h3 className="font-display font-bold text-xl mb-2" style={{ color: '#1A0A35' }}>No scholars found</h3>
            <p className="text-sm" style={{ color: '#737373', fontFamily: 'Poppins,sans-serif' }}>
              Try adjusting the filters above.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filtered.map(s => <ScholarCard key={s.id} scholar={s} />)}
          </div>
        )}

        {/* Open Programs with Application */}
        <OpenProgramsSection/>

        {/* Support a Student CTA */}
        <div className="mt-20 rounded-3xl overflow-hidden" style={{ background: 'linear-gradient(135deg,#1A0A35,#250F47)', boxShadow: '0 12px 40px rgba(26,10,53,0.35)' }}>
          <div className="relative px-8 py-14 text-center overflow-hidden">
            <div className="absolute inset-0 opacity-10" style={{ backgroundImage: 'radial-gradient(circle at 30% 50%, #F0A500 0%, transparent 50%), radial-gradient(circle at 75% 30%, #7B4DB8 0%, transparent 45%)' }} />
            <div className="relative">
              <div className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-5" style={{ background: 'linear-gradient(135deg,#F0A500,#FFB84D)' }}>
                <i className="fas fa-hand-holding-usd text-white text-2xl" />
              </div>
              <div className="text-xs font-bold uppercase tracking-widest mb-3" style={{ color: '#F0A500', fontFamily: 'Sora,sans-serif' }}>Make a Difference</div>
              <h2 className="font-display font-bold text-3xl text-white mb-3">Support a Student</h2>
              <p className="text-sm mb-8 max-w-lg mx-auto" style={{ color: 'rgba(255,255,255,0.65)', fontFamily: 'Poppins,sans-serif', lineHeight: 1.7 }}>
                Your contribution can change the life of a child in our community. Every gift — big or small — funds school fees, supplies, and opens doors to a brighter future for Nkenkak-Ngiesang's next generation.
              </p>
              <Link to="/projects?cat=education" className="btn-gold inline-flex items-center gap-2 text-sm">
                <i className="fas fa-graduation-cap text-xs" />Donate to Education Projects
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
