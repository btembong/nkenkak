import { useState, useMemo } from 'react'
import { Link } from 'react-router-dom'
import { useQuery, useMutation } from 'react-query'
import { useForm } from 'react-hook-form'
import toast from 'react-hot-toast'
import {
  GraduationCap, Users, Calendar, BookOpen, CheckCircle2,
  X, Loader2, Send, Home, ChevronRight, Heart, Gift,
  CalendarX, ScrollText, BadgeDollarSign, RotateCcw,
  Eye, ArrowRight, Briefcase, Award, TrendingUp,
} from 'lucide-react'
import api from '../../services/api'
import { useAuth } from '../../context/AuthContext'

/* ── Brand palette ─────────────────────────────────
   #2d004e  (45,0,78)     very dark — hero bg / backdrops
   #430075  (67,0,117)    deep dark — gradient partner
   #4b0082  (75,0,130)    primary brand
   #a57fc0  (165,127,192) accent — icons / text on dark
   #F3EDF8                page background tint
   Semantic red/green kept for status meaning only.
──────────────────────────────────────────────────── */
const I = {
  dark:     '#2d004e',
  900:      '#430075',
  800:      '#4b0082',
  700:      '#4b0082',   // primary — used for badges/actions on light bg
  600:      '#4b0082',
  500:      '#a57fc0',   // medium — subtle text / secondary accents
  400:      '#a57fc0',   // light — text on dark / decorative
  50:       '#F3EDF8',   // page bg
  border:   'rgba(75,0,130,0.12)',
  borderMd: 'rgba(75,0,130,0.20)',
  tint6:    'rgba(75,0,130,0.06)',
  tint10:   'rgba(75,0,130,0.10)',
  tint15:   'rgba(75,0,130,0.15)',
}

/* Levels → purple scale */
const LEVEL_META = {
  primary:    { label: 'Primary',    color: '#eeb549', bg: 'rgba(165,127,192,0.12)', border: 'rgba(165,127,192,0.25)' },
  secondary:  { label: 'Secondary',  color: '#4b0082', bg: 'rgba(75,0,130,0.12)',    border: 'rgba(75,0,130,0.25)'    },
  university: { label: 'University', color: '#430075', bg: 'rgba(67,0,117,0.12)',    border: 'rgba(67,0,117,0.25)'    },
  vocational: { label: 'Vocational', color: '#2d004e', bg: 'rgba(45,0,78,0.12)',     border: 'rgba(45,0,78,0.25)'     },
}

/* Statuses → semantic only (green/gray/red) */
const STATUS_META = {
  active:    { label: 'Active',    color: '#16A34A', bg: 'rgba(22,163,74,0.10)',    border: 'rgba(22,163,74,0.22)'    },
  completed: { label: 'Completed', color: '#6B7280', bg: 'rgba(107,114,128,0.10)', border: 'rgba(107,114,128,0.22)' },
  suspended: { label: 'Suspended', color: '#DC2626', bg: 'rgba(220,38,38,0.10)',   border: 'rgba(220,38,38,0.22)'   },
}

const getLevelMeta  = (k) => LEVEL_META[k]  || LEVEL_META.vocational
const getStatusMeta = (k) => STATUS_META[k] || STATUS_META.completed

function formatAmount(amount, currency) {
  if (!amount) return null
  return `${currency || 'XAF'} ${Number(amount).toLocaleString()}`
}

/* ── Skeleton ──────────────────────────────────────── */
function SkeletonCard() {
  return (
    <div className="rounded-2xl overflow-hidden animate-pulse"
      style={{ background: '#fff', boxShadow: '0 1px 8px rgba(75,0,130,0.06)', border: `1px solid ${I.border}` }}>
      <div className="h-16" style={{ background: I.tint6 }} />
      <div className="px-5 pt-10 pb-5 flex flex-col items-center gap-3">
        <div className="h-4 rounded-full w-2/3" style={{ background: I.tint10 }} />
        <div className="h-3 rounded-full w-1/2" style={{ background: I.tint6 }} />
        <div className="flex gap-2">
          <div className="h-5 w-16 rounded-full" style={{ background: I.tint6 }} />
          <div className="h-5 w-12 rounded-full" style={{ background: I.tint6 }} />
        </div>
        <div className="h-3 rounded-full w-3/4" style={{ background: I.tint6 }} />
        <div className="w-full h-px mt-2" style={{ background: I.border }} />
        <div className="h-3 rounded-full w-1/3" style={{ background: I.tint6 }} />
      </div>
    </div>
  )
}

/* ── Scholar Card ──────────────────────────────────── */
function ScholarCard({ scholar, onClick }) {
  const level  = getLevelMeta(scholar.level)
  const status = getStatusMeta(scholar.status)
  const amount = formatAmount(scholar.amount, scholar.currency)

  return (
    <button onClick={onClick}
      className="group w-full text-left rounded-2xl overflow-hidden transition-all hover:-translate-y-0.5 hover:shadow-lg focus:outline-none"
      style={{ background: '#fff', boxShadow: '0 1px 8px rgba(75,0,130,0.07)', border: `1px solid ${I.border}` }}>

      {/* Top strip */}
      <div className="relative h-16" style={{ background: `${level.color}14` }}>
        <div className="absolute bottom-0 left-1/2 -translate-x-1/2 translate-y-1/2">
          {scholar.photoUrl ? (
            <img src={scholar.photoUrl} alt={scholar.name}
              className="w-16 h-16 object-cover rounded-xl transition-transform duration-300 group-hover:scale-105"
              style={{ border: '3px solid #fff', boxShadow: `0 4px 12px ${level.color}30` }} />
          ) : (
            <div className="w-16 h-16 rounded-xl flex items-center justify-center transition-transform duration-300 group-hover:scale-105"
              style={{ background: `${level.color}18`, border: '3px solid #fff', boxShadow: `0 4px 12px ${level.color}22` }}>
              <GraduationCap size={24} color={level.color} strokeWidth={1.5} />
            </div>
          )}
        </div>
      </div>

      {/* Body */}
      <div className="px-5 pb-5 flex flex-col" style={{ paddingTop: '2.75rem' }}>
        <h3 className="font-display font-bold text-sm text-center leading-snug mb-0.5" style={{ color: I.dark }}>
          {scholar.name}
        </h3>
        {scholar.school && (
          <p className="text-[11px] text-center font-medium mb-3 truncate" style={{ color: I[500] }}>
            {scholar.school}
          </p>
        )}

        {/* Badges */}
        <div className="flex flex-wrap justify-center gap-1.5 mb-3">
          <span className="text-[10px] px-2.5 py-0.5 rounded-full font-semibold"
            style={{ background: level.bg, color: level.color, border: `1px solid ${level.border}` }}>
            {level.label}
          </span>
          {scholar.year && (
            <span className="text-[10px] px-2.5 py-0.5 rounded-full font-semibold"
              style={{ background: I.tint6, color: I[700] }}>
              {scholar.year}
            </span>
          )}
          <span className="text-[10px] px-2.5 py-0.5 rounded-full font-semibold"
            style={{ background: status.bg, color: status.color, border: `1px solid ${status.border}` }}>
            {status.label}
          </span>
        </div>

        {amount && (
          <p className="font-display font-bold text-sm text-center mb-1.5" style={{ color: I.dark }}>{amount}</p>
        )}
        {scholar.sponsorName && (
          <p className="text-[10px] text-center flex items-center justify-center gap-1 mb-2" style={{ color: I[500] }}>
            <Heart size={9} strokeWidth={2} />Sponsored by {scholar.sponsorName}
          </p>
        )}
        {scholar.bio && (
          <p className="text-[11px] leading-relaxed text-center mt-auto mb-3"
            style={{ color: '#9CA3AF', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
            {scholar.bio}
          </p>
        )}

        {/* Footer */}
        <div className="flex items-center justify-center gap-1.5 pt-3 text-[11px] font-semibold transition-all group-hover:gap-2.5"
          style={{ color: I[500], borderTop: `1px solid ${I.border}` }}>
          <Eye size={11} strokeWidth={2} />View Profile<ArrowRight size={10} strokeWidth={2.5} />
        </div>
      </div>
    </button>
  )
}

/* ── Scholar Detail Modal ──────────────────────────── */
function ScholarDetailModal({ scholar, onClose }) {
  const level  = getLevelMeta(scholar.level)
  const status = getStatusMeta(scholar.status)
  const amount = formatAmount(scholar.amount, scholar.currency)

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: 'rgba(45,0,78,0.75)', backdropFilter: 'blur(10px)' }}
      onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="bg-white rounded-3xl w-full max-w-md max-h-[92vh] overflow-y-auto"
        style={{ boxShadow: '0 40px 100px rgba(45,0,78,0.3)' }}>

        {/* Header */}
        <div className="relative h-32 rounded-t-3xl overflow-hidden" style={{ background: `${level.color}18` }}>
          <button onClick={onClose}
            className="absolute top-4 right-4 w-8 h-8 rounded-full flex items-center justify-center transition-all hover:bg-black/5"
            style={{ color: level.color }}>
            <X size={15} strokeWidth={2.5} />
          </button>
          <div className="absolute bottom-0 left-1/2 -translate-x-1/2 translate-y-1/2">
            {scholar.photoUrl ? (
              <img src={scholar.photoUrl} alt={scholar.name}
                className="w-24 h-24 object-cover rounded-2xl"
                style={{ border: '4px solid #fff', boxShadow: `0 8px 24px ${level.color}25` }} />
            ) : (
              <div className="w-24 h-24 rounded-2xl flex items-center justify-center"
                style={{ background: `${level.color}14`, border: '4px solid #fff', boxShadow: `0 8px 24px ${level.color}20` }}>
                <GraduationCap size={36} color={level.color} strokeWidth={1.5} />
              </div>
            )}
          </div>
        </div>

        {/* Content */}
        <div className="px-7 pt-16 pb-7">
          <h2 className="font-display font-bold text-2xl text-center mb-0.5" style={{ color: I.dark }}>
            {scholar.name}
          </h2>
          {scholar.school && (
            <p className="text-sm text-center font-medium mb-5" style={{ color: I[500] }}>
              {scholar.school}
            </p>
          )}

          <div className="flex flex-wrap justify-center gap-2 mb-6">
            <span className="text-xs px-3 py-1 rounded-full font-semibold"
              style={{ background: level.bg, color: level.color, border: `1px solid ${level.border}` }}>
              {level.label}
            </span>
            {scholar.year && (
              <span className="text-xs px-3 py-1 rounded-full font-semibold"
                style={{ background: I.tint6, color: I[700] }}>
                {scholar.year}
              </span>
            )}
            <span className="text-xs px-3 py-1 rounded-full font-semibold"
              style={{ background: status.bg, color: status.color, border: `1px solid ${status.border}` }}>
              {status.label}
            </span>
          </div>

          {/* Info rows */}
          <div className="rounded-2xl p-4 mb-6 space-y-3" style={{ background: I[50] }}>
            {amount && (
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: I.tint15 }}>
                  <BadgeDollarSign size={16} color={I[500]} strokeWidth={1.5} />
                </div>
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-wider" style={{ color: '#9CA3AF' }}>Award Amount</p>
                  <p className="font-display font-bold text-sm" style={{ color: I.dark }}>{amount}</p>
                </div>
              </div>
            )}
            {scholar.subject && (
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: I.tint15 }}>
                  <Briefcase size={16} color={I[500]} strokeWidth={1.5} />
                </div>
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-wider" style={{ color: '#9CA3AF' }}>Field of Study</p>
                  <p className="text-sm font-medium" style={{ color: I.dark }}>{scholar.subject}</p>
                </div>
              </div>
            )}
            {scholar.sponsorName && (
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: I.tint15 }}>
                  <Heart size={16} color={I[500]} strokeWidth={1.5} />
                </div>
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-wider" style={{ color: '#9CA3AF' }}>Sponsored By</p>
                  <p className="text-sm font-medium" style={{ color: I.dark }}>{scholar.sponsorName}</p>
                </div>
              </div>
            )}
          </div>

          {scholar.bio && (
            <div className="mb-6">
              <h4 className="font-display font-semibold text-sm mb-2" style={{ color: I.dark }}>About</h4>
              <p className="text-sm leading-relaxed" style={{ color: '#4B5563' }}>{scholar.bio}</p>
            </div>
          )}

          <button onClick={onClose}
            className="w-full py-3 rounded-2xl text-sm font-semibold transition-all hover:opacity-80"
            style={{ background: I[50], color: I[700], border: `1px solid ${I.border}` }}>
            Close
          </button>
        </div>
      </div>
    </div>
  )
}

/* ── Apply Modal ───────────────────────────────────── */
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
      style={{ background: 'rgba(45,0,78,0.75)', backdropFilter: 'blur(10px)' }}
      onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="bg-white rounded-3xl w-full max-w-lg max-h-[90vh] overflow-y-auto"
        style={{ boxShadow: '0 40px 100px rgba(45,0,78,0.28)' }}>
        <div className="px-7 pt-6 pb-4 border-b sticky top-0 bg-white z-10 rounded-t-3xl"
          style={{ borderColor: I.border }}>
          <div className="flex items-start justify-between gap-3">
            <div>
              <h3 className="font-display font-bold text-xl" style={{ color: I.dark }}>Apply for Scholarship</h3>
              <p className="text-xs mt-0.5" style={{ color: '#9CA3AF' }}>{program.title} · {program.academicYear}</p>
            </div>
            <button onClick={onClose}
              className="w-9 h-9 rounded-full flex items-center justify-center hover:bg-gray-100 transition-colors flex-shrink-0"
              style={{ color: '#9CA3AF' }}>
              <X size={16} strokeWidth={2} />
            </button>
          </div>
        </div>
        <form onSubmit={handleSubmit(d => applyMut.mutate(d))} className="p-7 space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="label">Full Name *</label>
              <input {...register('fullName', { required: 'Required' })} className="input" />
              {errors.fullName && <p className="text-xs mt-1" style={{ color: '#DC2626' }}>{errors.fullName.message}</p>}
            </div>
            <div>
              <label className="label">Email *</label>
              <input type="email" {...register('email', { required: 'Required' })} className="input" />
              {errors.email && <p className="text-xs mt-1" style={{ color: '#DC2626' }}>{errors.email.message}</p>}
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="label">Phone</label>
              <input {...register('phone')} className="input" placeholder="+237…" />
            </div>
            <div>
              <label className="label">Date of Birth</label>
              <input type="date" {...register('dateOfBirth')} className="input" />
            </div>
          </div>
          <div>
            <label className="label">School / Institution *</label>
            <input {...register('school', { required: 'Required' })} className="input" />
            {errors.school && <p className="text-xs mt-1" style={{ color: '#DC2626' }}>{errors.school.message}</p>}
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
              <input {...register('subject')} className="input" placeholder="e.g. Engineering" />
            </div>
          </div>
          <div>
            <label className="label">GPA / Grade Average</label>
            <input {...register('gpa')} className="input" placeholder="e.g. 3.8 / 4.0 or 15/20" />
          </div>
          <div>
            <label className="label">Motivation Statement *</label>
            <textarea {...register('motivation', { required: 'Required' })} rows={4} className="input resize-none"
              placeholder="Why do you deserve this scholarship and how will it help you?" />
            {errors.motivation && <p className="text-xs mt-1" style={{ color: '#DC2626' }}>{errors.motivation.message}</p>}
          </div>
          <div className="flex gap-3 pt-2">
            <button type="button" onClick={onClose}
              className="flex-1 py-3 rounded-2xl text-sm font-semibold transition-all hover:opacity-80"
              style={{ background: I[50], color: '#6B7280', border: `1px solid ${I.border}` }}>
              Cancel
            </button>
            <button type="submit" disabled={applyMut.isLoading} className="btn-secondary flex-1 justify-center">
              {applyMut.isLoading
                ? <><Loader2 size={13} strokeWidth={2} className="animate-spin" />Submitting…</>
                : <><Send size={13} strokeWidth={2} />Submit Application</>}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

/* ── Open Programs Section ─────────────────────────── */
function OpenProgramsSection() {
  const [applying, setApplying] = useState(null)
  const { data: programs = [], isLoading } = useQuery('scholarship-programs',
    () => api.get('/scholarship-programs').then(r => r.data))

  if (isLoading) return null
  const open = programs.filter(p => p.isOpen)
  if (!open.length) return null

  return (
    <div className="mt-20">
      <div className="flex items-center gap-3 mb-8">
        <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
          style={{ background: I[50], border: `1px solid ${I.border}` }}>
          <ScrollText size={18} color={I[500]} strokeWidth={1.5} />
        </div>
        <div>
          <h2 className="font-display font-bold text-2xl" style={{ color: I.dark }}>Open Programs</h2>
          <p className="text-xs mt-0.5" style={{ color: '#9CA3AF' }}>Applications currently open — submit before the deadline</p>
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-5">
        {open.map(p => (
          <div key={p.id} className="rounded-2xl overflow-hidden"
            style={{ background: '#fff', border: `1px solid ${I.border}`, boxShadow: '0 2px 16px rgba(75,0,130,0.06)' }}>
            <div className="px-6 pt-6 pb-4" style={{ borderBottom: `1px solid ${I.border}` }}>
              <div className="flex items-start justify-between gap-3 mb-2">
                <h3 className="font-display font-bold text-base leading-snug" style={{ color: I.dark }}>{p.title}</h3>
                <span className="inline-flex items-center gap-1.5 text-[10px] font-bold px-2.5 py-1 rounded-full flex-shrink-0"
                  style={{ background: 'rgba(22,163,74,0.10)', color: '#16A34A' }}>
                  <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />Open
                </span>
              </div>
              {p.description && (
                <p className="text-sm leading-relaxed" style={{ color: '#6B7280' }}>{p.description}</p>
              )}
            </div>
            <div className="px-6 py-4 space-y-2.5">
              {p.eligibility && (
                <div className="flex items-start gap-2.5 text-xs" style={{ color: '#4B5563' }}>
                  <CheckCircle2 size={13} color={I[500]} strokeWidth={1.5} className="mt-0.5 flex-shrink-0" />
                  <span><strong>Eligibility:</strong> {p.eligibility}</span>
                </div>
              )}
              {p.benefits && (
                <div className="flex items-start gap-2.5 text-xs" style={{ color: '#4B5563' }}>
                  <Gift size={13} color={I[500]} strokeWidth={1.5} className="mt-0.5 flex-shrink-0" />
                  <span><strong>Benefits:</strong> {p.benefits}</span>
                </div>
              )}
              <div className="flex items-start gap-2.5 text-xs" style={{ color: '#4B5563' }}>
                <Users size={13} color={I[500]} strokeWidth={1.5} className="mt-0.5 flex-shrink-0" />
                <span><strong>Slots:</strong> {p.slots} · <strong>{p._count?.applications || 0}</strong> applications received</span>
              </div>
              {p.deadline && (
                <div className="flex items-start gap-2.5 text-xs" style={{ color: '#DC2626' }}>
                  <CalendarX size={13} strokeWidth={1.5} className="mt-0.5 flex-shrink-0" />
                  <span><strong>Deadline:</strong> {new Date(p.deadline).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })}</span>
                </div>
              )}
            </div>
            <div className="px-6 pb-6">
              <button onClick={() => setApplying(p)} className="btn-secondary w-full justify-center !py-2.5 !text-sm">
                <Send size={13} strokeWidth={2} />Apply Now
              </button>
            </div>
          </div>
        ))}
      </div>
      {applying && <ApplyModal program={applying} onClose={() => setApplying(null)} />}
    </div>
  )
}

/* ── Main Page ─────────────────────────────────────── */
export default function ScholarshipsPage() {
  const [filterYear,      setFilterYear]      = useState('all')
  const [filterLevel,     setFilterLevel]     = useState('all')
  const [filterStatus,    setFilterStatus]    = useState('all')
  const [selectedScholar, setSelectedScholar] = useState(null)

  const { data, isLoading } = useQuery(
    'scholarships',
    () => api.get('/scholarships').then(r => r.data),
    { staleTime: 60000 }
  )

  const scholars = data || []

  const years = useMemo(() =>
    [...new Set(scholars.map(s => s.year).filter(Boolean))].sort((a, b) => b - a),
    [scholars]
  )

  const levels   = ['primary', 'secondary', 'university', 'vocational']
  const statuses = ['active', 'completed', 'suspended']

  const filtered = scholars.filter(s => {
    const okYear   = filterYear   === 'all' || String(s.year) === filterYear
    const okLevel  = filterLevel  === 'all' || s.level        === filterLevel
    const okStatus = filterStatus === 'all' || s.status       === filterStatus
    return okYear && okLevel && okStatus
  })

  const activeCount    = scholars.filter(s => s.status === 'active').length
  const completedCount = scholars.filter(s => s.status === 'completed').length
  const totalYears     = years.length
  const hasFilters     = filterYear !== 'all' || filterLevel !== 'all' || filterStatus !== 'all'

  return (
    <div style={{ background: '#F3EDF8', minHeight: '100vh' }}>

      {/* Hero */}
      <div className="relative overflow-hidden" style={{ background: `linear-gradient(135deg,${I.dark},${I[800]})` }}>
        <div className="absolute inset-0 opacity-20"
          style={{ backgroundImage: `radial-gradient(circle at 20% 60%, ${I[400]} 0%, transparent 50%), radial-gradient(circle at 80% 20%, ${I[500]} 0%, transparent 40%)` }} />
        <div className="relative max-w-5xl mx-auto px-6 py-20 text-center">
          <div className="inline-flex items-center gap-2 mb-4 px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-widest"
            style={{ background: 'rgba(255,255,255,0.08)', color: 'rgba(255,255,255,0.75)', border: '1px solid rgba(255,255,255,0.12)' }}>
            <GraduationCap size={11} strokeWidth={2} />Scholarships &amp; Bursaries
          </div>
          <h1 className="font-display font-bold text-4xl md:text-5xl text-white mb-4 leading-tight">
            Scholarships &amp; <span style={{ color: I[400] }}>Bursaries</span>
          </h1>
          <p className="text-base max-w-xl mx-auto" style={{ color: 'rgba(255,255,255,0.55)' }}>
            Investing in the education of our children — the future of Nkenkak-Ngiesang.
          </p>
          <div className="flex items-center justify-center gap-2 text-xs mt-6" style={{ color: 'rgba(255,255,255,0.4)' }}>
            <Link to="/" className="hover:text-white transition-colors flex items-center gap-1">
              <Home size={10} strokeWidth={2} />Home
            </Link>
            <ChevronRight size={10} strokeWidth={2} style={{ color: I[400] }} />
            <span style={{ color: I[400] }}>Scholarships</span>
          </div>
        </div>
      </div>

      {/* Stats bar */}
      {!isLoading && scholars.length > 0 && (
        <div className="bg-white border-b" style={{ borderColor: I.border }}>
          <div className="max-w-5xl mx-auto px-6 py-5 grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
            {[
              { label: 'Total Recipients', value: scholars.length, Icon: Users,        color: I[700] },
              { label: 'Years of Support', value: totalYears,      Icon: Calendar,     color: I[500] },
              { label: 'Active Scholars',  value: activeCount,     Icon: BookOpen,     color: I[700] },
              { label: 'Completed',        value: completedCount,  Icon: CheckCircle2, color: '#6B7280' },
            ].map(({ label, value, Icon, color }) => (
              <div key={label} className="flex flex-col items-center">
                <div className="w-9 h-9 rounded-xl flex items-center justify-center mb-1.5"
                  style={{ background: I[50] }}>
                  <Icon size={16} color={color} strokeWidth={1.5} />
                </div>
                <div className="font-display font-bold text-xl" style={{ color: I.dark }}>{value}</div>
                <div className="text-xs" style={{ color: '#9CA3AF' }}>{label}</div>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="max-w-7xl mx-auto px-6 py-12">

        {/* Filter card */}
        <div className="bg-white rounded-2xl p-5 mb-10"
          style={{ boxShadow: '0 1px 8px rgba(75,0,130,0.07)', border: `1px solid ${I.border}` }}>
          <div className="flex items-center justify-between pb-4 mb-4 border-b" style={{ borderColor: I.border }}>
            <div>
              <h2 className="font-display font-bold text-sm" style={{ color: I.dark }}>Scholarship Recipients</h2>
              <p className="text-[11px] mt-0.5" style={{ color: '#9CA3AF' }}>Filter by year, level or status</p>
            </div>
            {!isLoading && (
              <span className="text-[11px] font-bold px-3 py-1 rounded-full flex-shrink-0"
                style={{ background: I[50], color: I[700] }}>
                {filtered.length} scholar{filtered.length !== 1 ? 's' : ''}
              </span>
            )}
          </div>
          <div className="flex flex-col sm:flex-row gap-3">
            {[
              { label: 'Year',   value: filterYear,   onChange: setFilterYear,
                options: [['all','All Years'], ...years.map(y => [String(y), y])] },
              { label: 'Level',  value: filterLevel,  onChange: setFilterLevel,
                options: [['all','All Levels'], ...levels.map(l => [l, getLevelMeta(l).label])] },
              { label: 'Status', value: filterStatus, onChange: setFilterStatus,
                options: [['all','All Statuses'], ...statuses.map(s => [s, getStatusMeta(s).label])] },
            ].map(({ label, value, onChange, options }) => (
              <div key={label} className="flex flex-col gap-1 flex-1">
                <label className="text-xs font-semibold" style={{ color: '#6B7280' }}>{label}</label>
                <select value={value} onChange={e => onChange(e.target.value)}
                  className="text-sm px-4 py-2.5 rounded-xl border outline-none"
                  style={{ borderColor: I.border, color: I.dark, background: I[50] }}>
                  {options.map(([v, l]) => <option key={v} value={v}>{l}</option>)}
                </select>
              </div>
            ))}
            {hasFilters && (
              <div className="flex items-end">
                <button
                  onClick={() => { setFilterYear('all'); setFilterLevel('all'); setFilterStatus('all') }}
                  className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-xs font-semibold transition-all hover:opacity-80"
                  style={{ background: I[50], color: I[700], border: `1px solid ${I.border}` }}>
                  <RotateCcw size={12} strokeWidth={2} />Reset
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Scholar grid */}
        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
            {[1,2,3,4,5,6,7,8].map(i => <SkeletonCard key={i} />)}
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-24 rounded-3xl"
            style={{ background: I[50], border: `1px dashed ${I.borderMd}` }}>
            <GraduationCap size={44} color={I[400]} strokeWidth={1} className="mx-auto mb-4" />
            <h3 className="font-display font-bold text-xl mb-2" style={{ color: I.dark }}>No scholars found</h3>
            <p className="text-sm" style={{ color: '#9CA3AF' }}>Try adjusting the filters above.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
            {filtered.map(s => (
              <ScholarCard key={s.id} scholar={s} onClick={() => setSelectedScholar(s)} />
            ))}
          </div>
        )}

        <OpenProgramsSection />

        {/* Support CTA */}
        <div className="mt-20 rounded-3xl overflow-hidden relative"
          style={{ background: `linear-gradient(135deg,${I.dark},${I[800]})`, boxShadow: `0 16px 56px rgba(45,0,78,0.35)` }}>
          <div className="absolute -top-16 -left-16 w-64 h-64 rounded-full pointer-events-none"
            style={{ background: I[500], filter: 'blur(80px)', opacity: 0.12 }} />
          <div className="absolute -bottom-16 -right-10 w-56 h-56 rounded-full pointer-events-none"
            style={{ background: I[400], filter: 'blur(80px)', opacity: 0.10 }} />

          <div className="relative grid md:grid-cols-5">
            {/* Left */}
            <div className="md:col-span-3 px-8 md:px-12 py-12 md:py-16">
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full mb-6"
                style={{ background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.12)' }}>
                <GraduationCap size={11} color="rgba(255,255,255,0.7)" strokeWidth={2} />
                <span className="text-[10px] font-bold uppercase tracking-widest" style={{ color: 'rgba(255,255,255,0.7)' }}>
                  Make a Difference
                </span>
              </div>
              <h2 className="font-display font-bold text-3xl md:text-4xl text-white mb-4 leading-tight">
                Help a Student<br />
                <span style={{ color: I[400] }}>Reach Their Potential</span>
              </h2>
              <p className="text-sm mb-8 leading-relaxed" style={{ color: 'rgba(255,255,255,0.5)', maxWidth: 400 }}>
                Every donation directly funds a child's education in Nkenkak-Ngiesang — covering school fees, materials, and the mentorship needed to shape the next generation.
              </p>
              <div className="space-y-3.5 mb-10">
                {[
                  { Icon: BookOpen,   text: 'School fees, textbooks & stationery' },
                  { Icon: Award,      text: 'Scholarship certificates & recognition' },
                  { Icon: TrendingUp, text: 'Mentorship, career guidance & networking' },
                ].map(({ Icon, text }) => (
                  <div key={text} className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0"
                      style={{ background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.10)' }}>
                      <Icon size={14} color="rgba(255,255,255,0.7)" strokeWidth={1.5} />
                    </div>
                    <span className="text-sm" style={{ color: 'rgba(255,255,255,0.6)' }}>{text}</span>
                  </div>
                ))}
              </div>
              <div className="flex flex-wrap gap-3">
                <Link to="/projects?cat=education"
                  className="inline-flex items-center gap-2 px-6 py-3 rounded-2xl text-sm font-bold transition-all hover:opacity-90"
                  style={{ background: '#fff', color: I[700], boxShadow: '0 4px 16px rgba(255,255,255,0.15)' }}>
                  <GraduationCap size={14} strokeWidth={2} />Donate Now
                </Link>
                <Link to="/contact"
                  className="inline-flex items-center gap-2 px-5 py-3 rounded-2xl text-sm font-semibold transition-all hover:opacity-80"
                  style={{ background: 'rgba(255,255,255,0.06)', color: 'rgba(255,255,255,0.7)', border: '1px solid rgba(255,255,255,0.12)' }}>
                  <ChevronRight size={14} strokeWidth={2} />Learn More
                </Link>
              </div>
            </div>

            {/* Right — stats */}
            <div className="md:col-span-2 flex items-center justify-center px-8 py-12 md:py-16"
              style={{ borderLeft: '1px solid rgba(255,255,255,0.06)' }}>
              <div className="w-full">
                <p className="text-[10px] font-bold uppercase tracking-widest mb-5 text-center"
                  style={{ color: 'rgba(255,255,255,0.3)' }}>Our Impact So Far</p>
                <div className="grid grid-cols-2 gap-3">
                  {[
                    { Icon: Users,        value: scholars.length || '—', label: 'Supported' },
                    { Icon: Calendar,     value: totalYears      || '—', label: 'Years'     },
                    { Icon: BookOpen,     value: activeCount     || '—', label: 'Active'    },
                    { Icon: CheckCircle2, value: completedCount  || '—', label: 'Graduated' },
                  ].map(({ Icon, value, label }) => (
                    <div key={label} className="rounded-2xl p-4 text-center"
                      style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)' }}>
                      <div className="w-8 h-8 rounded-xl flex items-center justify-center mx-auto mb-2"
                        style={{ background: 'rgba(255,255,255,0.08)' }}>
                        <Icon size={15} color="rgba(255,255,255,0.6)" strokeWidth={1.5} />
                      </div>
                      <div className="font-display font-bold text-2xl text-white mb-0.5">{value}</div>
                      <div className="text-[10px]" style={{ color: 'rgba(255,255,255,0.35)' }}>{label}</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {selectedScholar && (
        <ScholarDetailModal scholar={selectedScholar} onClose={() => setSelectedScholar(null)} />
      )}
    </div>
  )
}
