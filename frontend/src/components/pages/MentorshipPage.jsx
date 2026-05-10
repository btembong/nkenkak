import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useQuery, useMutation } from 'react-query'
import { useForm } from 'react-hook-form'
import toast from 'react-hot-toast'
import api from '../../services/api'

const STEPS = [
  { icon: 'fa-file-alt',   title: 'Apply',  desc: 'Fill out a short application with your goals and background.' },
  { icon: 'fa-handshake',  title: 'Match',  desc: 'We connect you with the most compatible mentor from our network.' },
  { icon: 'fa-chart-line', title: 'Grow',   desc: 'Work with your mentor regularly to achieve your ambitions.' },
]

const TABS = [
  { id: 'browse',  label: 'Find a Mentor',     icon: 'fa-search' },
  { id: 'mentee',  label: 'Apply as Mentee',   icon: 'fa-user-graduate' },
  { id: 'mentor',  label: 'Become a Mentor',   icon: 'fa-user-tie' },
]

const FIELDS = ['Business & Entrepreneurship','Technology & Software','Medicine & Health','Law & Human Rights','Engineering','Education & Teaching','Finance & Accounting','Agriculture & Environment','Arts & Media','Architecture','Public Administration','Other']

/* ── Mentee Application Form ───────────────────── */
function MenteeApplyForm({ mentors = [] }) {
  const [done, setDone] = useState(false)
  const { register, handleSubmit, reset, formState: { errors } } = useForm()
  const mut = useMutation(d => api.post('/mentors/apply-mentee', d), {
    onSuccess: () => { setDone(true); reset() },
    onError:   () => toast.error('Submission failed. Please try again.'),
  })
  if (done) return (
    <div className="max-w-lg mx-auto text-center py-16">
      <div className="w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-5" style={{ background: 'rgba(22,163,74,0.1)' }}>
        <i className="fas fa-check text-4xl" style={{ color: '#16a34a' }} />
      </div>
      <h3 className="font-display font-bold text-2xl mb-3" style={{ color: '#1A0A35' }}>Application Submitted!</h3>
      <p className="text-sm leading-relaxed mb-6" style={{ color: '#737373', fontFamily: 'Poppins,sans-serif' }}>
        Thank you for applying to the Nkenkak-Ngiesang Mentorship Programme. Our team will review your application and match you with a suitable mentor within 5–7 days.
      </p>
      <button onClick={() => setDone(false)} className="btn-secondary !text-xs">
        <i className="fas fa-plus text-[10px]" />Submit Another
      </button>
    </div>
  )
  return (
    <div className="max-w-2xl mx-auto">
      <div className="card p-8">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-12 h-12 rounded-2xl flex items-center justify-center flex-shrink-0" style={{ background: 'linear-gradient(135deg,#5B2D8E,#7B4DB8)' }}>
            <i className="fas fa-user-graduate text-white text-xl" />
          </div>
          <div>
            <h3 className="font-display font-bold text-xl" style={{ color: '#1A0A35' }}>Mentee Application</h3>
            <p className="text-xs" style={{ color: '#A3A3A3', fontFamily: 'Poppins,sans-serif' }}>We will match you with the right mentor for your goals</p>
          </div>
        </div>
        <form onSubmit={handleSubmit(d => mut.mutate(d))} className="space-y-4">
          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <label className="label">Full Name *</label>
              <input {...register('name', { required: 'Required' })} placeholder="Your full name" className="input" />
              {errors.name && <p className="text-xs mt-1" style={{ color: '#dc2626' }}>{errors.name.message}</p>}
            </div>
            <div>
              <label className="label">Email *</label>
              <input type="email" {...register('email', { required: 'Required' })} placeholder="you@example.com" className="input" />
              {errors.email && <p className="text-xs mt-1" style={{ color: '#dc2626' }}>{errors.email.message}</p>}
            </div>
          </div>
          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <label className="label">Phone</label>
              <input {...register('phone')} placeholder="+237 6XX XXX XXX" className="input" />
            </div>
            <div>
              <label className="label">Age</label>
              <input type="number" {...register('age')} placeholder="e.g. 22" className="input" min={14} max={40} />
            </div>
          </div>
          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <label className="label">Current Education / Occupation</label>
              <input {...register('education')} placeholder="e.g. University student" className="input" />
            </div>
            <div>
              <label className="label">Field of Interest</label>
              <select {...register('field')} className="input">
                <option value="">Select a field…</option>
                {FIELDS.map(f => <option key={f} value={f}>{f}</option>)}
              </select>
            </div>
          </div>
          {mentors.length > 0 && (
            <div>
              <label className="label">Preferred Mentor <span style={{ color: '#A3A3A3', fontWeight: 400 }}>(optional — we will match you if none chosen)</span></label>
              <select {...register('preferredMentor')} className="input">
                <option value="">No preference — match me automatically</option>
                {mentors.filter(m => m.isAvailable).map(m => (
                  <option key={m.id} value={m.id}>{m.name} — {m.profession}{m.country ? `, ${m.country}` : ''}</option>
                ))}
              </select>
            </div>
          )}
          <div>
            <label className="label">Your Goals & Ambitions *</label>
            <textarea {...register('goals', { required: 'Please describe your goals' })} rows={4} className="input resize-none"
              placeholder="What do you hope to achieve through this mentorship? What career or life goals are you working toward?" />
            {errors.goals && <p className="text-xs mt-1" style={{ color: '#dc2626' }}>{errors.goals.message}</p>}
          </div>
          <button type="submit" disabled={mut.isLoading} className="btn-secondary w-full justify-center">
            {mut.isLoading ? <><i className="fas fa-spinner animate-spin" />Submitting…</> : <><i className="fas fa-paper-plane" />Submit Application</>}
          </button>
        </form>
      </div>
    </div>
  )
}

/* ── Mentor Registration Form ──────────────────── */
function MentorRegisterForm() {
  const [done, setDone] = useState(false)
  const [expertiseInput, setExpertiseInput] = useState('')
  const [expertiseList, setExpertiseList] = useState([])
  const { register, handleSubmit, reset, formState: { errors } } = useForm()

  const mut = useMutation(d => api.post('/mentors/register', { ...d, expertise: expertiseList }), {
    onSuccess: () => { setDone(true); reset(); setExpertiseList([]); setExpertiseInput('') },
    onError:   () => toast.error('Registration failed. Please try again.'),
  })

  const addExpertise = () => {
    const val = expertiseInput.trim()
    if (val && !expertiseList.includes(val)) setExpertiseList(p => [...p, val])
    setExpertiseInput('')
  }

  if (done) return (
    <div className="max-w-lg mx-auto text-center py-16">
      <div className="w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-5" style={{ background: 'rgba(240,165,0,0.12)' }}>
        <i className="fas fa-user-tie text-4xl" style={{ color: '#F0A500' }} />
      </div>
      <h3 className="font-display font-bold text-2xl mb-3" style={{ color: '#1A0A35' }}>Profile Submitted!</h3>
      <p className="text-sm leading-relaxed mb-6" style={{ color: '#737373', fontFamily: 'Poppins,sans-serif' }}>
        Thank you for offering to mentor the next generation of Nkenkak-Ngiesang youth. Your profile is under review and will be published once approved by the programme coordinator — usually within 3 business days.
      </p>
      <button onClick={() => setDone(false)} className="btn-secondary !text-xs">
        <i className="fas fa-plus text-[10px]" />Register Another
      </button>
    </div>
  )

  return (
    <div className="max-w-2xl mx-auto">
      <div className="card p-8">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-12 h-12 rounded-2xl flex items-center justify-center flex-shrink-0" style={{ background: 'linear-gradient(135deg,#F0A500,#FFB84D)' }}>
            <i className="fas fa-user-tie text-white text-xl" />
          </div>
          <div>
            <h3 className="font-display font-bold text-xl" style={{ color: '#1A0A35' }}>Mentor Registration</h3>
            <p className="text-xs" style={{ color: '#A3A3A3', fontFamily: 'Poppins,sans-serif' }}>Your profile will be reviewed before going live</p>
          </div>
        </div>
        <form onSubmit={handleSubmit(d => mut.mutate(d))} className="space-y-4">
          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <label className="label">Full Name *</label>
              <input {...register('name', { required: 'Required' })} placeholder="Your full name" className="input" />
              {errors.name && <p className="text-xs mt-1" style={{ color: '#dc2626' }}>{errors.name.message}</p>}
            </div>
            <div>
              <label className="label">Email *</label>
              <input type="email" {...register('email', { required: 'Required' })} placeholder="you@example.com" className="input" />
              {errors.email && <p className="text-xs mt-1" style={{ color: '#dc2626' }}>{errors.email.message}</p>}
            </div>
          </div>
          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <label className="label">Profession / Job Title *</label>
              <input {...register('profession', { required: 'Required' })} placeholder="e.g. Software Engineer" className="input" />
              {errors.profession && <p className="text-xs mt-1" style={{ color: '#dc2626' }}>{errors.profession.message}</p>}
            </div>
            <div>
              <label className="label">Company / Organisation</label>
              <input {...register('company')} placeholder="e.g. Google, Self-employed" className="input" />
            </div>
          </div>
          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <label className="label">Country *</label>
              <input {...register('country', { required: 'Required' })} placeholder="e.g. Cameroon, France, USA" className="input" />
              {errors.country && <p className="text-xs mt-1" style={{ color: '#dc2626' }}>{errors.country.message}</p>}
            </div>
            <div>
              <label className="label">City</label>
              <input {...register('city')} placeholder="e.g. Yaoundé, Paris" className="input" />
            </div>
          </div>
          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <label className="label">LinkedIn Profile</label>
              <input {...register('linkedin')} placeholder="https://linkedin.com/in/…" className="input" />
            </div>
            <div>
              <label className="label">Max Mentees You Can Take</label>
              <select {...register('max_mentees')} className="input">
                {[1,2,3,4,5].map(n => <option key={n} value={n}>{n}</option>)}
              </select>
            </div>
          </div>
          {/* Expertise tags */}
          <div>
            <label className="label">Areas of Expertise</label>
            <div className="flex gap-2">
              <select value={expertiseInput} onChange={e => setExpertiseInput(e.target.value)} className="input flex-1">
                <option value="">Select a field…</option>
                {FIELDS.map(f => <option key={f} value={f}>{f}</option>)}
              </select>
              <button type="button" onClick={addExpertise}
                className="px-4 py-2 rounded-2xl text-sm font-semibold flex-shrink-0"
                style={{ background: 'rgba(91,45,142,0.08)', color: '#5B2D8E', border: '1.5px solid rgba(91,45,142,0.15)', fontFamily: 'Sora,sans-serif' }}>
                <i className="fas fa-plus" />
              </button>
            </div>
            {expertiseList.length > 0 && (
              <div className="flex flex-wrap gap-1.5 mt-2">
                {expertiseList.map(e => (
                  <span key={e} className="flex items-center gap-1.5 text-xs font-semibold px-3 py-1 rounded-full"
                    style={{ background: 'rgba(91,45,142,0.08)', color: '#5B2D8E', fontFamily: 'Sora,sans-serif' }}>
                    {e}
                    <button type="button" onClick={() => setExpertiseList(p => p.filter(x => x !== e))} style={{ color: '#5B2D8E', lineHeight: 1 }}>×</button>
                  </span>
                ))}
              </div>
            )}
          </div>
          <div>
            <label className="label">Short Bio</label>
            <textarea {...register('bio')} rows={3} className="input resize-none"
              placeholder="Briefly describe your career background and what you can offer as a mentor…" />
          </div>
          <button type="submit" disabled={mut.isLoading} className="btn-gold w-full justify-center">
            {mut.isLoading ? <><i className="fas fa-spinner animate-spin" />Submitting…</> : <><i className="fas fa-user-tie" />Submit Mentor Profile</>}
          </button>
        </form>
      </div>
    </div>
  )
}

/* ── Main Page ─────────────────────────────────── */
export default function MentorshipPage() {
  const [activeTab, setActiveTab]           = useState('browse')
  const [search, setSearch]                 = useState('')
  const [selectedMentor, setSelectedMentor] = useState(null)
  const [applySuccess, setApplySuccess]     = useState(false)
  const { register, handleSubmit, reset, formState: { errors } } = useForm()

  const { data: mentors = [], isLoading } = useQuery('mentors', () => api.get('/mentors').then(r => r.data))

  const applyMut = useMutation(
    ({ id, data }) => api.post(`/mentors/${id}/apply`, data),
    {
      onSuccess: () => { setApplySuccess(true); reset() },
      onError:   () => toast.error('Application failed. Please try again.'),
    }
  )

  const filtered = mentors.filter(m =>
    !search ||
    m.name.toLowerCase().includes(search.toLowerCase()) ||
    m.profession?.toLowerCase().includes(search.toLowerCase()) ||
    m.expertise?.some(e => e.toLowerCase().includes(search.toLowerCase()))
  )

  const countryCount = new Set(mentors.map(m => m.country).filter(Boolean)).size
  const fieldCount   = new Set(mentors.flatMap(m => m.expertise || [])).size

  return (
    <div>
      {/* Hero */}
      <div className="page-hero py-20 px-6 text-center">
        <span className="eyebrow">Community Programme</span>
        <h1 className="font-display font-bold text-4xl text-white mb-3 mt-2">Mentorship Programme</h1>
        <p className="text-base" style={{ color: 'rgba(255,255,255,0.7)', fontFamily: 'Poppins,sans-serif', maxWidth: '560px', margin: '0 auto 16px' }}>
          Connecting diaspora professionals with the next generation of Nkenkak-Ngiesang youth.
        </p>
        <div className="flex items-center justify-center gap-2 text-sm" style={{ color: 'rgba(255,255,255,0.6)', fontFamily: 'Poppins,sans-serif' }}>
          <Link to="/" className="hover:text-white transition-colors flex items-center gap-1"><i className="fas fa-home text-xs" />Home</Link>
          <i className="fas fa-chevron-right text-xs" style={{ color: '#F0A500' }} />
          <span style={{ color: '#F0A500' }}>Mentorship</span>
        </div>
      </div>

      {/* How it works */}
      <div className="py-14 bg-white" style={{ borderBottom: '1px solid rgba(91,45,142,0.06)' }}>
        <div className="max-w-4xl mx-auto px-6 text-center">
          <h2 className="section-title mb-4">How the <span style={{ color: '#F0A500' }}>Programme</span> Works</h2>
          <p className="text-base mb-10" style={{ color: '#555', fontFamily: 'Poppins,sans-serif', lineHeight: 1.8 }}>
            Our mentorship programme bridges the gap between the Nkenkak-Ngiesang diaspora and village youth. Professionals from around the world give back by sharing their skills, experience, and networks.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {STEPS.map((s, i) => (
              <div key={s.title} className="card p-6 text-center">
                <div className="w-14 h-14 rounded-2xl flex items-center justify-center mx-auto mb-3" style={{ background: 'linear-gradient(135deg,#5B2D8E,#7B4DB8)' }}>
                  <i className={`fas ${s.icon} text-xl text-white`} />
                </div>
                <div className="w-6 h-6 rounded-full flex items-center justify-center mx-auto mb-2 text-xs font-bold" style={{ background: 'rgba(240,165,0,0.15)', color: '#B07A00', fontFamily: 'Sora,sans-serif' }}>{i + 1}</div>
                <h3 className="font-display font-bold text-lg mb-2" style={{ color: '#1A0A35' }}>{s.title}</h3>
                <p className="text-sm" style={{ color: '#737373', fontFamily: 'Poppins,sans-serif', lineHeight: 1.7 }}>{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="py-10" style={{ background: 'linear-gradient(135deg,#1A0A35,#250F47)' }}>
        <div className="max-w-4xl mx-auto px-6 grid grid-cols-3 gap-6 text-center">
          {[
            { label: 'Mentors',   value: mentors.length || '—', icon: 'fa-user-tie' },
            { label: 'Countries', value: countryCount || '—',   icon: 'fa-globe-africa' },
            { label: 'Fields',    value: fieldCount || '—',     icon: 'fa-briefcase' },
          ].map(s => (
            <div key={s.label}>
              <div className="w-12 h-12 rounded-2xl flex items-center justify-center mx-auto mb-2" style={{ background: 'rgba(255,255,255,0.08)' }}>
                <i className={`fas ${s.icon} text-lg`} style={{ color: '#F0A500' }} />
              </div>
              <div className="font-display font-bold text-3xl text-white">{s.value}</div>
              <div className="text-xs mt-1" style={{ color: 'rgba(255,255,255,0.55)', fontFamily: 'Poppins,sans-serif' }}>{s.label}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Tabs */}
      <section className="py-16 bg-white">
        <div className="max-w-6xl mx-auto px-6">

          {/* Tab bar */}
          <div className="flex flex-wrap gap-2 justify-center mb-10">
            {TABS.map(tab => (
              <button key={tab.id} onClick={() => setActiveTab(tab.id)}
                className="flex items-center gap-2 px-6 py-3 rounded-full text-sm font-semibold transition-all"
                style={{
                  background: activeTab === tab.id ? 'linear-gradient(135deg,#5B2D8E,#7B4DB8)' : '#fff',
                  color: activeTab === tab.id ? '#fff' : '#5B2D8E',
                  fontFamily: 'Sora,sans-serif',
                  border: `1.5px solid ${activeTab === tab.id ? 'transparent' : 'rgba(91,45,142,0.15)'}`,
                  boxShadow: activeTab === tab.id ? '0 4px 16px rgba(91,45,142,0.3)' : 'none',
                }}>
                <i className={`fas ${tab.icon} text-xs`} />
                {tab.label}
              </button>
            ))}
          </div>

          {/* Tab: Browse mentors */}
          {activeTab === 'browse' && (
            <>
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
                <h2 className="section-title">Meet Our <span style={{ color: '#F0A500' }}>Mentors</span></h2>
                <div className="relative">
                  <i className="fas fa-search absolute left-4 top-1/2 -translate-y-1/2 text-sm" style={{ color: '#A3A3A3' }} />
                  <input value={search} onChange={e => setSearch(e.target.value)}
                    placeholder="Search name, profession, skill…" className="input pl-10 !w-64" />
                </div>
              </div>

              {isLoading ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {[1,2,3,4,5,6].map(i => <div key={i} className="h-72 rounded-3xl animate-pulse" style={{ background: 'rgba(91,45,142,0.04)' }} />)}
                </div>
              ) : filtered.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {filtered.map(m => (
                    <div key={m.id} className="card p-6 flex flex-col">
                      <div className="flex items-center gap-4 mb-4">
                        <div className="w-16 h-16 rounded-2xl flex-shrink-0 overflow-hidden" style={{ background: 'linear-gradient(135deg,#5B2D8E,#7B4DB8)' }}>
                          {m.photoUrl
                            ? <img src={m.photoUrl} alt={m.name} className="w-full h-full object-cover" />
                            : <div className="w-full h-full flex items-center justify-center"><i className="fas fa-user text-2xl text-white opacity-60" /></div>}
                        </div>
                        <div className="flex-1 min-w-0">
                          <h3 className="font-display font-bold text-sm" style={{ color: '#1A0A35' }}>{m.name}</h3>
                          <p className="text-xs font-semibold" style={{ color: '#5B2D8E', fontFamily: 'Poppins,sans-serif' }}>{m.profession}</p>
                          {m.company && <p className="text-xs truncate" style={{ color: '#A3A3A3', fontFamily: 'Poppins,sans-serif' }}>{m.company}</p>}
                        </div>
                      </div>
                      {(m.city || m.country) && (
                        <p className="text-xs mb-3 flex items-center gap-1.5" style={{ color: '#737373', fontFamily: 'Poppins,sans-serif' }}>
                          <i className="fas fa-map-marker-alt text-[10px]" style={{ color: '#5B2D8E' }} />
                          {[m.city, m.country].filter(Boolean).join(', ')}
                        </p>
                      )}
                      {m.bio && (
                        <p className="text-xs mb-4 line-clamp-3" style={{ color: '#737373', fontFamily: 'Poppins,sans-serif', lineHeight: 1.7 }}>{m.bio}</p>
                      )}
                      {m.expertise?.length > 0 && (
                        <div className="flex flex-wrap gap-1.5 mb-4">
                          {m.expertise.slice(0, 4).map(e => (
                            <span key={e} className="text-[10px] font-semibold px-2.5 py-1 rounded-full"
                              style={{ background: 'rgba(91,45,142,0.08)', color: '#5B2D8E', fontFamily: 'Sora,sans-serif' }}>{e}</span>
                          ))}
                        </div>
                      )}
                      <div className="mt-auto pt-3 flex items-center justify-between" style={{ borderTop: '1px solid rgba(91,45,142,0.06)' }}>
                        <span className="text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full"
                          style={{ background: m.isAvailable ? 'rgba(22,163,74,0.1)' : 'rgba(115,115,115,0.1)', color: m.isAvailable ? '#16a34a' : '#737373', fontFamily: 'Sora,sans-serif' }}>
                          <i className={`fas ${m.isAvailable ? 'fa-check-circle' : 'fa-times-circle'} mr-1`} />
                          {m.isAvailable ? 'Available' : 'Full'}
                        </span>
                        {m.isAvailable && (
                          <button onClick={() => { setSelectedMentor(m); setApplySuccess(false); reset() }} className="btn-secondary !text-xs !py-2 !px-4">
                            <i className="fas fa-paper-plane text-[10px]" />Apply
                          </button>
                        )}
                        {m.linkedin && (
                          <a href={m.linkedin} target="_blank" rel="noreferrer"
                            className="w-8 h-8 rounded-xl flex items-center justify-center hover:opacity-80 transition-opacity"
                            style={{ background: 'rgba(91,45,142,0.08)', color: '#5B2D8E' }}>
                            <i className="fab fa-linkedin-in text-xs" />
                          </a>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-16 rounded-3xl" style={{ background: 'rgba(91,45,142,0.02)', border: '1px dashed rgba(91,45,142,0.1)' }}>
                  <i className="fas fa-user-tie text-4xl mb-3 block" style={{ color: 'rgba(91,45,142,0.15)' }} />
                  <h4 className="font-display font-semibold mb-2" style={{ color: '#737373' }}>No mentors found</h4>
                  <p className="text-sm mb-4" style={{ color: '#A3A3A3', fontFamily: 'Poppins,sans-serif' }}>Try a different search or apply as a mentee and we'll match you.</p>
                  <button onClick={() => setActiveTab('mentee')} className="btn-secondary !text-xs">Apply as Mentee Instead</button>
                </div>
              )}
            </>
          )}

          {/* Tab: Apply as mentee */}
          {activeTab === 'mentee' && <MenteeApplyForm mentors={mentors} />}

          {/* Tab: Become a mentor */}
          {activeTab === 'mentor' && <MentorRegisterForm />}
        </div>
      </section>

      {/* Apply to specific mentor modal */}
      {selectedMentor && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4"
          style={{ background: 'rgba(26,10,53,0.8)', backdropFilter: 'blur(8px)' }}
          onClick={e => e.target === e.currentTarget && setSelectedMentor(null)}>
          <div className="bg-white rounded-3xl w-full max-w-lg max-h-[90vh] overflow-y-auto" style={{ boxShadow: '0 32px 80px rgba(26,10,53,0.25)' }}>
            <div className="px-7 pt-6 pb-4 border-b flex items-center justify-between" style={{ borderColor: 'rgba(91,45,142,0.08)' }}>
              <div>
                <h3 className="font-display font-bold text-xl" style={{ color: '#1A0A35' }}>Apply for Mentorship</h3>
                <p className="text-xs mt-0.5" style={{ color: '#A3A3A3', fontFamily: 'Poppins,sans-serif' }}>
                  Mentor: <span style={{ color: '#5B2D8E', fontWeight: 600 }}>{selectedMentor.name}</span>
                </p>
              </div>
              <button onClick={() => setSelectedMentor(null)} className="w-9 h-9 rounded-full flex items-center justify-center hover:bg-gray-100" style={{ color: '#A3A3A3' }}>
                <i className="fas fa-times" />
              </button>
            </div>
            {applySuccess ? (
              <div className="p-10 text-center">
                <div className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4" style={{ background: 'rgba(22,163,74,0.1)' }}>
                  <i className="fas fa-check text-3xl" style={{ color: '#16a34a' }} />
                </div>
                <h4 className="font-display font-bold text-xl mb-2" style={{ color: '#1A0A35' }}>Application Submitted!</h4>
                <p className="text-sm mb-6" style={{ color: '#737373', fontFamily: 'Poppins,sans-serif', lineHeight: 1.7 }}>
                  Thank you for applying to be mentored by <strong>{selectedMentor.name}</strong>. We will review your application and get back to you shortly.
                </p>
                <button onClick={() => setSelectedMentor(null)} className="btn-secondary">Close</button>
              </div>
            ) : (
              <form onSubmit={handleSubmit(d => applyMut.mutate({ id: selectedMentor.id, data: d }))} className="p-7 space-y-4">
                <div>
                  <label className="label">Your Name *</label>
                  <input {...register('name', { required: 'Required' })} placeholder="Full name" className="input" />
                  {errors.name && <p className="text-xs mt-1" style={{ color: '#dc2626' }}>{errors.name.message}</p>}
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="label">Email *</label>
                    <input type="email" {...register('email', { required: 'Required' })} placeholder="you@example.com" className="input" />
                    {errors.email && <p className="text-xs mt-1" style={{ color: '#dc2626' }}>{errors.email.message}</p>}
                  </div>
                  <div>
                    <label className="label">Phone</label>
                    <input {...register('phone')} placeholder="+237 6XX XXX XXX" className="input" />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="label">Age</label>
                    <input type="number" {...register('age')} placeholder="e.g. 22" className="input" min={14} max={40} />
                  </div>
                  <div>
                    <label className="label">Education / Occupation</label>
                    <input {...register('education')} placeholder="e.g. University student" className="input" />
                  </div>
                </div>
                <div>
                  <label className="label">Your Goals *</label>
                  <textarea {...register('goals', { required: 'Required' })} rows={4} className="input resize-none"
                    placeholder="What do you hope to achieve? What are your career ambitions?" />
                  {errors.goals && <p className="text-xs mt-1" style={{ color: '#dc2626' }}>{errors.goals.message}</p>}
                </div>
                <div className="flex gap-3 pt-2">
                  <button type="button" onClick={() => setSelectedMentor(null)}
                    className="flex-1 py-3 rounded-2xl text-sm font-semibold"
                    style={{ background: 'rgba(91,45,142,0.05)', color: '#737373', border: '1px solid rgba(91,45,142,0.1)', fontFamily: 'Sora,sans-serif' }}>Cancel</button>
                  <button type="submit" disabled={applyMut.isLoading} className="btn-secondary flex-1 justify-center">
                    {applyMut.isLoading ? <><i className="fas fa-spinner animate-spin" />Sending…</> : <><i className="fas fa-paper-plane" />Send Application</>}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
