import { useState } from 'react'
import { useForm } from 'react-hook-form'
import toast from 'react-hot-toast'
import api from '../../services/api'
import {
  HardHat, Drama, Rocket, Leaf, GraduationCap, HeartPulse,
  X, Loader2, UserPlus, CheckCircle2, ChevronRight, ChevronLeft,
  User, Mail, Phone, MapPin, Briefcase, MessageSquare,
} from 'lucide-react'

const TEAMS = [
  { id: 'development', Icon: HardHat,       label: 'Development',      desc: 'Build & Infrastructure' },
  { id: 'culture',     Icon: Drama,         label: 'Cultural Council', desc: 'Heritage & Traditions' },
  { id: 'youth',       Icon: Rocket,        label: 'Youth Wing',       desc: 'Innovation & Energy' },
  { id: 'environment', Icon: Leaf,          label: 'Environment',      desc: 'Nature & Sustainability' },
  { id: 'education',   Icon: GraduationCap, label: 'Education',        desc: 'Schools & Learning' },
  { id: 'health',      Icon: HeartPulse,    label: 'Health',           desc: 'Care & Wellness' },
]

const STEPS = ['Choose Team', 'Your Details', 'Motivation']

export default function JoinTeamModal({ onClose, defaultTeam = '' }) {
  const [step,    setStep]    = useState(defaultTeam ? 2 : 1)
  const [team,    setTeam]    = useState(defaultTeam)
  const [loading, setLoading] = useState(false)
  const [done,    setDone]    = useState(false)

  const { register, handleSubmit, trigger, formState: { errors } } = useForm()

  const advance = async () => {
    if (step === 1) {
      if (!team) { toast.error('Please choose a team'); return }
      setStep(2)
    } else if (step === 2) {
      const ok = await trigger(['full_name', 'email'])
      if (ok) setStep(3)
    }
  }

  const onSubmit = async (data) => {
    if (!team) { setStep(1); toast.error('Please choose a team'); return }
    setLoading(true)
    try {
      await api.post('/team/apply', { ...data, team_choice: team })
      setDone(true)
    } catch {
      toast.error('Submission failed. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const selectedTeam = TEAMS.find(t => t.id === team)

  return (
    <div className="modal-overlay" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="modal-box max-w-lg animate-slide-up overflow-hidden">

        {/* ── Success state ── */}
        {done ? (
          <div className="flex flex-col items-center text-center px-8 py-12">
            <div className="w-16 h-16 rounded-full flex items-center justify-center mb-5"
              style={{ background: 'rgba(91,45,142,0.08)' }}>
              <CheckCircle2 className="w-8 h-8" style={{ color: '#5B2D8E' }} />
            </div>
            <h2 className="font-display font-bold text-2xl mb-2" style={{ color: '#1A0A35' }}>
              Application Sent!
            </h2>
            <p className="text-sm text-muted-foreground mb-2">
              Your application to join the{' '}
              <span className="font-semibold" style={{ color: '#5B2D8E' }}>
                {selectedTeam?.label || team}
              </span>{' '}
              has been received.
            </p>
            <p className="text-sm text-muted-foreground mb-8">
              We'll review it and get back to you within 5 days.
            </p>
            <button onClick={onClose} className="btn-secondary">
              Close
            </button>
          </div>
        ) : (
          <>
            {/* Header */}
            <div className="px-7 pt-7 pb-5 border-b" style={{ borderColor: 'rgba(91,45,142,0.08)' }}>
              <div className="flex items-start justify-between mb-5">
                <div>
                  <h2 className="font-display font-bold text-2xl text-dark">Join Our Community Team</h2>
                  <p className="text-sm mt-1 text-muted-foreground">Step {step} of {STEPS.length} — {STEPS[step - 1]}</p>
                </div>
                <button onClick={onClose}
                  className="w-9 h-9 rounded-full flex items-center justify-center transition-colors hover:bg-primary-50 text-muted-foreground flex-shrink-0">
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Progress dots */}
              <div className="flex items-center gap-2">
                {STEPS.map((s, i) => (
                  <div key={s} className="flex items-center gap-2 flex-1">
                    <div
                      className="flex items-center justify-center w-7 h-7 rounded-full text-xs font-bold flex-shrink-0 transition-all duration-300"
                      style={{
                        background: i + 1 <= step ? 'linear-gradient(135deg,#5B2D8E,#7B4DB8)' : 'rgba(91,45,142,0.08)',
                        color: i + 1 <= step ? '#fff' : 'rgba(91,45,142,0.35)',
                      }}>
                      {i + 1 < step ? <CheckCircle2 className="w-3.5 h-3.5" /> : i + 1}
                    </div>
                    <span className="text-[11px] font-semibold hidden sm:block"
                      style={{ color: i + 1 === step ? '#5B2D8E' : 'rgba(91,45,142,0.35)', fontFamily: 'Sora,sans-serif' }}>
                      {s}
                    </span>
                    {i < STEPS.length - 1 && (
                      <div className="flex-1 h-0.5 rounded-full ml-1"
                        style={{ background: i + 1 < step ? 'rgba(91,45,142,0.35)' : 'rgba(91,45,142,0.08)' }} />
                    )}
                  </div>
                ))}
              </div>
            </div>

            <div className="p-7">
              {/* ── Step 1: Choose team ── */}
              {step === 1 && (
                <div>
                  <p className="text-sm text-muted-foreground mb-4">Which team would you like to join?</p>
                  <div className="grid grid-cols-2 gap-2 mb-6">
                    {TEAMS.map(t => (
                      <button key={t.id} type="button" onClick={() => setTeam(t.id)}
                        className="flex items-center gap-3 p-3.5 rounded-2xl border-2 transition-all text-left group"
                        style={{
                          borderColor: team === t.id ? '#5B2D8E' : 'rgba(91,45,142,0.1)',
                          background:  team === t.id ? 'rgba(91,45,142,0.05)' : '#fff',
                        }}>
                        <div className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 transition-all"
                          style={{ background: team === t.id ? 'linear-gradient(135deg,#5B2D8E,#7B4DB8)' : 'rgba(91,45,142,0.07)' }}>
                          <t.Icon className="w-4 h-4" style={{ color: team === t.id ? '#fff' : '#5B2D8E' }} />
                        </div>
                        <div>
                          <div className="font-display font-semibold text-xs"
                            style={{ color: team === t.id ? '#5B2D8E' : '#1A0A35' }}>{t.label}</div>
                          <div className="text-[10px] text-muted-foreground">{t.desc}</div>
                        </div>
                      </button>
                    ))}
                  </div>
                  <button type="button" onClick={advance} disabled={!team}
                    className="btn-secondary w-full justify-center"
                    style={{ opacity: team ? 1 : 0.45 }}>
                    Continue <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              )}

              {/* ── Step 2: Personal details ── */}
              {step === 2 && (
                <div>
                  <p className="text-sm text-muted-foreground mb-4">Tell us a bit about yourself.</p>
                  <div className="space-y-3 mb-6">
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="label flex items-center gap-1.5"><User className="w-3 h-3" />Full Name *</label>
                        <input
                          {...register('full_name', { required: 'Name required' })}
                          placeholder="Your full name"
                          className="input"
                        />
                        {errors.full_name && <p className="text-xs mt-1 text-red-500">{errors.full_name.message}</p>}
                      </div>
                      <div>
                        <label className="label flex items-center gap-1.5"><Phone className="w-3 h-3" />Phone / WhatsApp</label>
                        <input {...register('phone')} placeholder="+237 6XX…" className="input" />
                      </div>
                    </div>
                    <div>
                      <label className="label flex items-center gap-1.5"><Mail className="w-3 h-3" />Email *</label>
                      <input
                        type="email"
                        {...register('email', { required: 'Email required' })}
                        placeholder="your@email.com"
                        className="input"
                      />
                      {errors.email && <p className="text-xs mt-1 text-red-500">{errors.email.message}</p>}
                    </div>
                    <div>
                      <label className="label flex items-center gap-1.5"><MapPin className="w-3 h-3" />Location</label>
                      <input {...register('location')} placeholder="City, Country" className="input" />
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <button type="button" onClick={() => setStep(1)}
                      className="flex items-center gap-1.5 px-4 py-2.5 rounded-2xl text-sm font-semibold transition-colors"
                      style={{ color: '#5B2D8E', background: 'rgba(91,45,142,0.07)', fontFamily: 'Sora,sans-serif' }}>
                      <ChevronLeft className="w-4 h-4" /> Back
                    </button>
                    <button type="button" onClick={advance} className="btn-secondary flex-1 justify-center">
                      Continue <ChevronRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              )}

              {/* ── Step 3: Motivation ── */}
              {step === 3 && (
                <form onSubmit={handleSubmit(onSubmit)}>
                  <p className="text-sm text-muted-foreground mb-4">Almost done — tell us what you bring.</p>
                  <div className="space-y-3 mb-6">
                    <div>
                      <label className="label flex items-center gap-1.5"><Briefcase className="w-3 h-3" />Skills & Experience</label>
                      <textarea
                        {...register('skills')}
                        rows={2}
                        placeholder="What skills or experience do you bring?"
                        className="input resize-none"
                      />
                    </div>
                    <div>
                      <label className="label flex items-center gap-1.5"><MessageSquare className="w-3 h-3" />Why do you want to join?</label>
                      <textarea
                        {...register('motivation')}
                        rows={3}
                        placeholder="Your motivation for joining this team…"
                        className="input resize-none"
                      />
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <button type="button" onClick={() => setStep(2)}
                      className="flex items-center gap-1.5 px-4 py-2.5 rounded-2xl text-sm font-semibold transition-colors"
                      style={{ color: '#5B2D8E', background: 'rgba(91,45,142,0.07)', fontFamily: 'Sora,sans-serif' }}>
                      <ChevronLeft className="w-4 h-4" /> Back
                    </button>
                    <button type="submit" disabled={loading} className="btn-secondary flex-1 justify-center">
                      {loading
                        ? <><Loader2 className="w-4 h-4 animate-spin" />Submitting…</>
                        : <><UserPlus className="w-4 h-4" />Submit Application</>
                      }
                    </button>
                  </div>
                </form>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  )
}
