import { useState } from 'react'
import { useForm } from 'react-hook-form'
import toast from 'react-hot-toast'
import api from '../../services/api'

const TEAMS = [
  { id:'development', icon:'fa-hard-hat',     label:'Development',      desc:'Build & Infrastructure' },
  { id:'culture',     icon:'fa-masks-theater', label:'Cultural Council', desc:'Heritage & Traditions' },
  { id:'youth',       icon:'fa-rocket',         label:'Youth Wing',       desc:'Innovation & Energy' },
  { id:'environment', icon:'fa-leaf',           label:'Environment',      desc:'Nature & Sustainability' },
  { id:'education',   icon:'fa-graduation-cap', label:'Education',        desc:'Schools & Learning' },
  { id:'health',      icon:'fa-heartbeat',      label:'Health',           desc:'Care & Wellness' },
]

export default function JoinTeamModal({ onClose, defaultTeam='' }) {
  const [team, setTeam] = useState(defaultTeam)
  const [loading, setLoading] = useState(false)
  const { register, handleSubmit, formState:{errors} } = useForm()

  const onSubmit = async (data) => {
    if (!team) { toast.error('Please choose a team'); return }
    setLoading(true)
    try {
      await api.post('/team/apply', { ...data, team_choice: team })
      toast.success('Application submitted! We\'ll contact you within 5 days. 🌿')
      onClose()
    } catch { toast.error('Submission failed') }
    finally { setLoading(false) }
  }

  return (
    <div className="modal-overlay" onClick={e => e.target===e.currentTarget && onClose()}>
      <div className="modal-box max-w-lg animate-slide-up">
        <div className="p-6 border-b border-black/8 flex justify-between items-start">
          <div>
            <h2 className="font-serif text-2xl text-earth">Join Our Community Team</h2>
            <p className="text-earth/50 text-sm mt-1">Choose your team and start making a difference</p>
          </div>
          <button onClick={onClose} className="w-9 h-9 rounded-full bg-black/5 flex items-center justify-center text-earth/50 hover:text-earth transition-colors"><i className="fas fa-times"/></button>
        </div>
        <form onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-4">
          <div>
            <label className="label mb-3 block">Choose Your Team</label>
            <div className="grid grid-cols-2 gap-2">
              {TEAMS.map(t => (
                <button key={t.id} type="button" onClick={() => setTeam(t.id)}
                  className={`flex flex-col items-center text-center p-3 rounded-xl border transition-all ${team===t.id?'border-gold bg-gold/8 text-earth':'border-earth/12 hover:border-gold/40 text-earth/70'}`}>
                  <i className={`fas ${t.icon} text-gold text-xl mb-2`}/>
                  <span className="text-xs font-bold">{t.label}</span>
                  <span className="text-[10px] text-earth/50">{t.desc}</span>
                </button>
              ))}
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div><label className="label">Full Name</label><input {...register('full_name',{required:true})} placeholder="Your name" className="input"/></div>
            <div><label className="label">Phone/WhatsApp</label><input {...register('phone')} placeholder="+237 ..." className="input"/></div>
          </div>
          <div><label className="label">Email</label><input type="email" {...register('email',{required:true})} placeholder="your@email.com" className="input"/></div>
          <div><label className="label">Location</label><input {...register('location')} placeholder="City, Country" className="input"/></div>
          <div><label className="label">Skills & Experience</label><textarea {...register('skills')} rows={2} placeholder="What skills do you bring?" className="input resize-none"/></div>
          <div><label className="label">Why do you want to join?</label><textarea {...register('motivation')} rows={2} placeholder="Your motivation..." className="input resize-none"/></div>
          <button type="submit" disabled={loading} className="btn-forest w-full justify-center">
            {loading ? <><i className="fas fa-spinner animate-spin"/> Submitting...</> : <><i className="fas fa-user-plus"/> Submit Application</>}
          </button>
        </form>
      </div>
    </div>
  )
}
