import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { useQuery } from 'react-query'
import toast from 'react-hot-toast'
import api from '../../services/api'

const AMOUNTS = [1000, 5000, 10000, 25000, 50000, 100000]
const PROVIDERS = [
  { id: 'mtn_momo',     label: 'MTN MoMo',     icon: 'fas fa-mobile-alt', color: 'text-yellow-400' },
  { id: 'orange_money', label: 'Orange Money',  icon: 'fas fa-mobile-alt', color: 'text-orange-400' },
  { id: 'paypal',       label: 'PayPal',         icon: 'fab fa-paypal',     color: 'text-blue-400'   },
  { id: 'stripe',       label: 'Card (Visa/MC)', icon: 'fab fa-cc-visa',    color: 'text-indigo-400' },
]

export default function DonationModal({ onClose, defaultProject = '' }) {
  const [amount, setAmount]   = useState(25000)
  const [custom, setCustom]   = useState(false)
  const [provider, setProvider] = useState('mtn_momo')
  const [step, setStep]       = useState(1) // 1=amount, 2=details, 3=success
  const [loading, setLoading] = useState(false)
  const { register, handleSubmit, formState: { errors } } = useForm()

  const { data: projects } = useQuery('projects-list',
    () => api.get('/projects?status=active').then(r => r.data.projects), { staleTime: 60000 })

  const onSubmit = async (data) => {
    setLoading(true)
    try {
      await api.post('/donations/initiate', {
        ...data,
        amount: custom ? data.custom_amount : amount,
        provider,
        project_id: data.project_id || undefined,
      })
      setStep(3)
    } catch (err) {
      toast.error(err.response?.data?.error || 'Payment initiation failed')
    } finally { setLoading(false) }
  }

  return (
    <div className="modal-overlay" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="modal-box-dark max-w-lg animate-slide-up">

        {/* Header */}
        <div className="p-7 border-b border-white/8">
          <div className="flex justify-between items-start">
            <div>
              <h2 className="font-serif text-2xl text-cream">Support Nkenkak-Ngiesang</h2>
              <p className="text-cream/50 text-sm mt-1">Every contribution transforms a life in the village</p>
            </div>
            <button onClick={onClose} className="w-9 h-9 rounded-full bg-white/10 text-cream/60 hover:text-cream flex items-center justify-center transition-colors">
              <i className="fas fa-times"/>
            </button>
          </div>
          {/* Progress steps */}
          <div className="flex items-center gap-2 mt-5">
            {[1,2,3].map(s => (
              <div key={s} className="flex items-center gap-2">
                <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold transition-all ${
                  step >= s ? 'bg-gold text-earth' : 'bg-white/10 text-cream/30'}`}>
                  {step > s ? <i className="fas fa-check text-[10px]"/> : s}
                </div>
                {s < 3 && <div className={`flex-1 h-px w-12 ${step > s ? 'bg-gold' : 'bg-white/10'}`}/>}
              </div>
            ))}
            <span className="text-cream/40 text-xs ml-1">{['','Choose Amount','Your Details',''][step]}</span>
          </div>
        </div>

        <div className="p-7">

          {/* STEP 1: Amount */}
          {step === 1 && (
            <div className="animate-slide-up">
              {/* Project selector */}
              <div className="mb-5">
                <label className="label-light">Donate Towards</label>
                <select {...register('project_id')} defaultValue={defaultProject}
                  className="input-dark">
                  <option value="">General Village Fund</option>
                  {projects?.map(p => <option key={p.id} value={p.id}>{p.title}</option>)}
                </select>
              </div>

              {/* Preset amounts */}
              <label className="label-light mb-3 block">Select Amount (FCFA)</label>
              <div className="grid grid-cols-3 gap-2 mb-3">
                {AMOUNTS.map(a => (
                  <button key={a} type="button"
                    onClick={() => { setAmount(a); setCustom(false) }}
                    className={`py-3 rounded-lg text-sm font-bold border transition-all ${
                      !custom && amount === a
                        ? 'bg-gold text-earth border-gold'
                        : 'border-white/10 text-cream/70 hover:border-gold/50 hover:text-cream'}`}>
                    {a.toLocaleString()}
                  </button>
                ))}
              </div>
              <button type="button"
                onClick={() => setCustom(!custom)}
                className={`w-full py-3 rounded-lg text-sm font-semibold border transition-all mb-4 ${
                  custom ? 'bg-gold/15 border-gold text-gold' : 'border-white/10 text-cream/50 hover:border-gold/30'}`}>
                {custom ? '✓ Custom amount' : 'Enter custom amount'}
              </button>
              {custom && (
                <div className="mb-4">
                  <label className="label-light">Custom Amount (FCFA)</label>
                  <input type="number" {...register('custom_amount', { required: custom })}
                    placeholder="e.g. 75000" className="input-dark"/>
                </div>
              )}

              {/* Payment method */}
              <label className="label-light mb-3 block">Payment Method</label>
              <div className="grid grid-cols-2 gap-2 mb-6">
                {PROVIDERS.map(p => (
                  <button key={p.id} type="button"
                    onClick={() => setProvider(p.id)}
                    className={`flex items-center gap-2 p-3 rounded-lg border text-xs font-semibold transition-all ${
                      provider === p.id ? 'border-gold bg-gold/10 text-gold' : 'border-white/10 text-cream/60 hover:border-gold/30'}`}>
                    <i className={`${p.icon} ${provider === p.id ? 'text-gold' : p.color} text-base`}/>
                    {p.label}
                  </button>
                ))}
              </div>

              <button type="button" onClick={() => setStep(2)}
                className="btn-gold w-full justify-center text-sm">
                Continue <i className="fas fa-arrow-right"/>
              </button>
            </div>
          )}

          {/* STEP 2: Details */}
          {step === 2 && (
            <form onSubmit={handleSubmit(onSubmit)} className="animate-slide-up space-y-4">
              <div className="bg-white/5 rounded-xl p-4 mb-2 flex justify-between items-center">
                <span className="text-cream/60 text-sm">Donating via {PROVIDERS.find(p=>p.id===provider)?.label}</span>
                <span className="text-gold font-bold text-lg">{(custom ? 'custom' : amount.toLocaleString())} <span className="text-xs">FCFA</span></span>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="label-light">First Name</label>
                  <input {...register('donor_name', { required: true })} placeholder="Your name" className="input-dark"/>
                </div>
                <div>
                  <label className="label-light">Phone / Email</label>
                  <input {...register('donor_phone')} placeholder="+237..." className="input-dark"/>
                </div>
              </div>
              <div>
                <label className="label-light">Email (for receipt)</label>
                <input type="email" {...register('donor_email')} placeholder="your@email.com" className="input-dark"/>
              </div>
              <div>
                <label className="label-light">Message (optional)</label>
                <textarea {...register('message')} rows={2} placeholder="A message to the community..." className="input-dark resize-none"/>
              </div>
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" {...register('is_anonymous')} className="w-4 h-4 rounded accent-gold"/>
                <span className="text-cream/60 text-sm">Donate anonymously</span>
              </label>
              <div className="flex gap-3 pt-2">
                <button type="button" onClick={() => setStep(1)} className="btn-earth flex-1 justify-center text-sm">
                  <i className="fas fa-arrow-left"/> Back
                </button>
                <button type="submit" disabled={loading} className="btn-gold flex-1 justify-center text-sm">
                  {loading ? <><i className="fas fa-spinner animate-spin"/> Processing...</> : <><i className="fas fa-lock"/> Complete Donation</>}
                </button>
              </div>
              <p className="text-center text-cream/30 text-xs flex items-center justify-center gap-1.5 pt-1">
                <i className="fas fa-lock"/> Secure &amp; transparent — funds go directly to the village treasury
              </p>
            </form>
          )}

          {/* STEP 3: Success */}
          {step === 3 && (
            <div className="text-center py-8 animate-slide-up">
              <div className="w-20 h-20 rounded-full bg-gold/15 flex items-center justify-center mx-auto mb-5 border border-gold/30">
                <i className="fas fa-heart text-gold text-3xl animate-pulse"/>
              </div>
              <h3 className="font-serif text-2xl text-cream mb-3">Thank You!</h3>
              <p className="text-cream/60 leading-relaxed mb-6">
                Your donation has been initiated successfully. You will receive a confirmation once the payment is processed.
                <br/><br/>
                <span className="text-gold font-semibold">Nkenkak-Ngiesang thanks you from the bottom of its heart. 🌿</span>
              </p>
              <button onClick={onClose} className="btn-gold justify-center">
                <i className="fas fa-check"/> Done
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
