import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import toast from 'react-hot-toast'
import { useAuth } from '../../context/AuthContext'

export default function RegisterPage() {
  const { register: authRegister } = useAuth()
  const navigate = useNavigate()
  const [loading, setLoading] = useState(false)
  const [showPw, setShowPw] = useState(false)
  const { register, handleSubmit, watch, formState: { errors } } = useForm()

  const onSubmit = async (data) => {
    setLoading(true)
    try {
      await authRegister(data)
      toast.success('Welcome to Nkenkak-Ngiesang! 🌿 Please check your email to verify your account.')
      navigate('/portal')
    } catch (err) {
      toast.error(err.response?.data?.error || 'Registration failed')
    } finally { setLoading(false) }
  }

  return (
    <div className="min-h-screen flex">
      {/* Left */}
      <div className="hidden lg:flex flex-col justify-between w-2/5 bg-gradient-to-br from-forest via-forest-light to-earth p-16 relative overflow-hidden">
        <div className="absolute inset-0 bg-pattern"/>
        <div className="relative">
          <Link to="/" className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-full bg-gold-gradient flex items-center justify-center font-cinzel font-black text-earth">NN</div>
            <div>
              <div className="font-cinzel text-gold text-base font-bold">Nkenkak-Ngiesang</div>
              <div className="text-gold/40 text-[10px] tracking-[3px] uppercase">Village Community</div>
            </div>
          </Link>
        </div>
        <div className="relative space-y-8">
          <h2 className="font-serif text-4xl text-cream leading-tight">Join the<br/><span className="text-gold">growing family</span></h2>
          <div className="space-y-4">
            {[
              { icon:'fa-heart', t:'Support Projects', d:'Donate directly to causes that matter' },
              { icon:'fa-comments', t:'Join the Forum', d:'Discuss, share and connect with community' },
              { icon:'fa-globe', t:'Diaspora Network', d:'Stay connected wherever you are' },
              { icon:'fa-bell', t:'Stay Updated', d:'Get news and project updates' },
            ].map(f => (
              <div key={f.t} className="flex items-start gap-3">
                <div className="w-9 h-9 rounded-lg bg-white/10 flex items-center justify-center text-gold text-sm flex-shrink-0"><i className={`fas ${f.icon}`}/></div>
                <div>
                  <div className="text-cream text-sm font-semibold">{f.t}</div>
                  <div className="text-cream/40 text-xs">{f.d}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
        <div className="relative text-cream/20 text-xs">© {new Date().getFullYear()} Nkenkak-Ngiesang</div>
      </div>

      {/* Right */}
      <div className="flex-1 flex items-start justify-center p-8 bg-cream-light overflow-y-auto">
        <div className="w-full max-w-lg py-8">
          <Link to="/" className="flex items-center gap-3 mb-8 lg:hidden">
            <div className="w-10 h-10 rounded-full bg-earth flex items-center justify-center font-cinzel font-black text-gold text-sm">NN</div>
            <span className="font-cinzel text-earth font-bold">Nkenkak-Ngiesang</span>
          </Link>

          <h2 className="font-serif text-3xl text-earth mb-1">Create Account</h2>
          <p className="text-earth/50 text-sm mb-8">Become a member of the community</p>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="label">First Name *</label>
                <input {...register('first_name', { required: 'Required' })} placeholder="First name" className="input"/>
                {errors.first_name && <p className="text-red-500 text-xs mt-1">{errors.first_name.message}</p>}
              </div>
              <div>
                <label className="label">Last Name *</label>
                <input {...register('last_name', { required: 'Required' })} placeholder="Last name" className="input"/>
                {errors.last_name && <p className="text-red-500 text-xs mt-1">{errors.last_name.message}</p>}
              </div>
            </div>

            <div>
              <label className="label">Email Address *</label>
              <input type="email" {...register('email', { required: 'Email required', pattern: { value:/\S+@\S+\.\S+/, message:'Invalid email' } })}
                placeholder="your@email.com" className="input"/>
              {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email.message}</p>}
            </div>

            <div>
              <label className="label">Phone / WhatsApp</label>
              <input {...register('phone')} placeholder="+237 6XX XXX XXX" className="input"/>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="label">Country *</label>
                <input {...register('country', { required: 'Required' })} placeholder="e.g. Cameroon" className="input"/>
                {errors.country && <p className="text-red-500 text-xs mt-1">{errors.country.message}</p>}
              </div>
              <div>
                <label className="label">City</label>
                <input {...register('city')} placeholder="Your city" className="input"/>
              </div>
            </div>

            <div>
              <label className="label">Password *</label>
              <div className="relative">
                <input type={showPw ? 'text' : 'password'}
                  {...register('password', { required: 'Required', minLength: { value: 8, message: 'Min 8 characters' } })}
                  placeholder="At least 8 characters" className="input pr-12"/>
                <button type="button" onClick={() => setShowPw(!showPw)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-earth/30 hover:text-earth">
                  <i className={`fas ${showPw ? 'fa-eye-slash' : 'fa-eye'}`}/>
                </button>
              </div>
              {errors.password && <p className="text-red-500 text-xs mt-1">{errors.password.message}</p>}
            </div>

            <div className="space-y-3 pt-2">
              <label className="flex items-center gap-3 cursor-pointer">
                <input type="checkbox" {...register('is_diaspora')} className="w-4 h-4 rounded accent-gold"/>
                <span className="text-sm text-earth/70">I am a diaspora member (living outside Cameroon)</span>
              </label>
              <label className="flex items-center gap-3 cursor-pointer">
                <input type="checkbox" {...register('newsletter')} defaultChecked className="w-4 h-4 rounded accent-gold"/>
                <span className="text-sm text-earth/70">Subscribe to the village newsletter</span>
              </label>
              <label className="flex items-start gap-3 cursor-pointer">
                <input type="checkbox" {...register('terms', { required: 'You must agree to the terms' })} className="w-4 h-4 rounded accent-gold mt-0.5"/>
                <span className="text-sm text-earth/70">I agree to the <Link to="/contact" className="text-gold hover:underline">Terms of Community</Link> and community guidelines</span>
              </label>
              {errors.terms && <p className="text-red-500 text-xs">{errors.terms.message}</p>}
            </div>

            <button type="submit" disabled={loading} className="btn-gold w-full justify-center text-sm mt-2">
              {loading
                ? <><i className="fas fa-spinner animate-spin"/> Creating account...</>
                : <><i className="fas fa-user-plus"/> Create Account</>}
            </button>
          </form>

          <div className="mt-6 pt-5 border-t border-earth/8 text-center">
            <p className="text-earth/50 text-sm">
              Already a member?{' '}
              <Link to="/login" className="text-gold font-semibold hover:underline">Sign in</Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
