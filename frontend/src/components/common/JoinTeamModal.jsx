import { useState } from 'react'
import { useForm } from 'react-hook-form'
import toast from 'react-hot-toast'
import api from '../../services/api'

const TEAMS = [
  {id:'development', icon:'fa-hard-hat',      label:'Development',      desc:'Build & Infrastructure'},
  {id:'culture',     icon:'fa-masks-theater', label:'Cultural Council', desc:'Heritage & Traditions'},
  {id:'youth',       icon:'fa-rocket',        label:'Youth Wing',       desc:'Innovation & Energy'},
  {id:'environment', icon:'fa-leaf',          label:'Environment',      desc:'Nature & Sustainability'},
  {id:'education',   icon:'fa-graduation-cap',label:'Education',        desc:'Schools & Learning'},
  {id:'health',      icon:'fa-heartbeat',     label:'Health',           desc:'Care & Wellness'},
]

export default function JoinTeamModal({ onClose, defaultTeam='' }) {
  const [team,    setTeam]    = useState(defaultTeam)
  const [loading, setLoading] = useState(false)
  const { register, handleSubmit, formState:{errors} } = useForm()

  const onSubmit = async (data) => {
    if (!team) { toast.error('Please choose a team'); return }
    setLoading(true)
    try {
      await api.post('/team/apply', { ...data, team_choice: team })
      toast.success("Application submitted! We'll contact you within 5 days. 🌿")
      onClose()
    } catch { toast.error('Submission failed. Please try again.') }
    finally { setLoading(false) }
  }

  return (
    <div className="modal-overlay" onClick={e=>e.target===e.currentTarget&&onClose()}>
      <div className="modal-box max-w-lg animate-slide-up">
        {/* Header */}
        <div className="px-7 pt-7 pb-5 border-b" style={{borderColor:'rgba(91,45,142,0.08)'}}>
          <div className="flex items-start justify-between">
            <div>
              <h2 className="font-display font-bold text-2xl" style={{color:'#1A0A35'}}>Join Our Community Team</h2>
              <p className="text-sm mt-1" style={{color:'#737373',fontFamily:'Poppins,sans-serif'}}>Choose your team and start making a difference</p>
            </div>
            <button onClick={onClose}
              className="w-9 h-9 rounded-full flex items-center justify-center transition-colors hover:bg-primary-50"
              style={{color:'#A3A3A3'}}>
              <i className="fas fa-times"/>
            </button>
          </div>
        </div>

        <div className="p-7">
          {/* Team selection grid */}
          <div className="mb-5">
            <label className="label mb-3 block">Choose Your Team *</label>
            <div className="grid grid-cols-2 gap-2">
              {TEAMS.map(t => (
                <button key={t.id} type="button" onClick={() => setTeam(t.id)}
                  className="flex items-center gap-3 p-3.5 rounded-2xl border-2 transition-all text-left"
                  style={{
                    borderColor: team===t.id ? '#5B2D8E' : 'rgba(91,45,142,0.1)',
                    background:  team===t.id ? 'rgba(91,45,142,0.05)' : '#fff',
                  }}>
                  <div className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0"
                    style={{background: team===t.id ? 'linear-gradient(135deg,#5B2D8E,#7B4DB8)' : 'rgba(91,45,142,0.08)'}}>
                    <i className={`fas ${t.icon} text-sm`} style={{color: team===t.id ? '#fff' : '#5B2D8E'}}/>
                  </div>
                  <div>
                    <div className="font-display font-semibold text-xs" style={{color: team===t.id ? '#5B2D8E' : '#1A0A35'}}>{t.label}</div>
                    <div className="text-[10px]" style={{color:'#A3A3A3',fontFamily:'Poppins,sans-serif'}}>{t.desc}</div>
                  </div>
                </button>
              ))}
            </div>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="label">Full Name *</label>
                <input {...register('full_name',{required:true})} placeholder="Your full name" className="input"/>
              </div>
              <div>
                <label className="label">Phone / WhatsApp</label>
                <input {...register('phone')} placeholder="+237 6XX…" className="input"/>
              </div>
            </div>
            <div>
              <label className="label">Email *</label>
              <input type="email" {...register('email',{required:true})} placeholder="your@email.com" className="input"/>
              {errors.email && <p className="text-xs mt-1" style={{color:'#dc2626'}}>Email required</p>}
            </div>
            <div>
              <label className="label">Location</label>
              <input {...register('location')} placeholder="City, Country" className="input"/>
            </div>
            <div>
              <label className="label">Skills & Experience</label>
              <textarea {...register('skills')} rows={2} placeholder="What skills do you bring?" className="input resize-none"/>
            </div>
            <div>
              <label className="label">Why do you want to join?</label>
              <textarea {...register('motivation')} rows={2} placeholder="Your motivation…" className="input resize-none"/>
            </div>
            <button type="submit" disabled={loading} className="btn-secondary w-full justify-center">
              {loading ? <><i className="fas fa-spinner animate-spin"/>Submitting…</> : <><i className="fas fa-user-plus"/>Submit Application</>}
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}
