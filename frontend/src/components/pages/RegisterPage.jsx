import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import toast from 'react-hot-toast'
import { useAuth } from '../../context/AuthContext'
import AuthSlider from '../common/AuthSlider'


export default function RegisterPage() {
  const { register: authRegister } = useAuth()
  const navigate  = useNavigate()
  const [loading, setLoading] = useState(false)
  const [showPw,  setShowPw]  = useState(false)
  const { register, handleSubmit, formState:{errors} } = useForm()

  const onSubmit = async (data) => {
    setLoading(true)
    try {
      await authRegister(data)
      toast.success('Welcome to Nkenkak-Ngiesang! Check your email to verify.')
      navigate('/portal')
    } catch (err) {
      toast.error(err.response?.data?.error || 'Registration failed')
    } finally { setLoading(false) }
  }

  return (
    <div className="min-h-screen grid lg:grid-cols-5">
      {/* Left — image slider */}
      <div className="hidden lg:block lg:col-span-2 sticky top-0 h-screen overflow-hidden">
        <AuthSlider />
      </div>

      {/* Right form */}
      <div className="lg:col-span-3 flex items-start justify-center p-8 overflow-y-auto" style={{background:'#FAFAFA'}}>
        <div className="w-full max-w-lg py-6">
          <Link to="/" className="flex items-center gap-3 mb-8 lg:hidden">
            <div className="w-10 h-10 rounded-2xl flex items-center justify-center" style={{background:'linear-gradient(135deg,#5B2D8E,#7B4DB8)'}}>
              <i className="fas fa-heart" style={{color:'#F0A500'}}/>
            </div>
            <span className="font-display font-bold" style={{color:'#1A0A35'}}>Nkenkak-Ngiesang</span>
          </Link>

          <h2 className="font-display font-bold text-3xl mb-1" style={{color:'#1A0A35'}}>Create Account</h2>
          <p className="text-sm mb-8" style={{color:'#737373',fontFamily:'Poppins,sans-serif'}}>Join the Nkenkak-Ngiesang community today</p>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="label">First Name *</label>
                <input {...register('first_name',{required:'Required'})} placeholder="First name" className="input"/>
                {errors.first_name && <p className="text-xs mt-1" style={{color:'#dc2626'}}>{errors.first_name.message}</p>}
              </div>
              <div>
                <label className="label">Last Name *</label>
                <input {...register('last_name',{required:'Required'})} placeholder="Last name" className="input"/>
                {errors.last_name && <p className="text-xs mt-1" style={{color:'#dc2626'}}>{errors.last_name.message}</p>}
              </div>
            </div>
            <div>
              <label className="label">Email Address *</label>
              <input type="email" {...register('email',{required:'Email required',pattern:{value:/\S+@\S+\.\S+/,message:'Invalid email'}})} placeholder="your@email.com" className="input"/>
              {errors.email && <p className="text-xs mt-1" style={{color:'#dc2626'}}>{errors.email.message}</p>}
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="label">Phone / WhatsApp</label>
                <input {...register('phone')} placeholder="+237 6XX XXX XXX" className="input"/>
              </div>
              <div>
                <label className="label">Country *</label>
                <input {...register('country',{required:'Required'})} placeholder="e.g. Cameroon" className="input"/>
                {errors.country && <p className="text-xs mt-1" style={{color:'#dc2626'}}>{errors.country.message}</p>}
              </div>
            </div>
            <div>
              <label className="label">City</label>
              <input {...register('city')} placeholder="Your city" className="input"/>
            </div>
            <div>
              <label className="label">Password *</label>
              <div className="relative">
                <input type={showPw?'text':'password'} {...register('password',{required:'Required',minLength:{value:8,message:'Min 8 characters'}})} placeholder="At least 8 characters" className="input pr-12"/>
                <button type="button" onClick={()=>setShowPw(!showPw)} className="absolute right-4 top-1/2 -translate-y-1/2" style={{color:'#A3A3A3'}}>
                  <i className={`fas fa-${showPw?'eye-slash':'eye'}`}/>
                </button>
              </div>
              {errors.password && <p className="text-xs mt-1" style={{color:'#dc2626'}}>{errors.password.message}</p>}
            </div>
            <div className="space-y-3 pt-1">
              <label className="flex items-center gap-3 cursor-pointer">
                <input type="checkbox" {...register('is_diaspora')} className="w-4 h-4 rounded accent-primary-500"/>
                <span className="text-sm" style={{color:'#525252',fontFamily:'Poppins,sans-serif'}}>I am a diaspora member (living outside Cameroon)</span>
              </label>
              <label className="flex items-center gap-3 cursor-pointer">
                <input type="checkbox" {...register('newsletter')} defaultChecked className="w-4 h-4 rounded accent-primary-500"/>
                <span className="text-sm" style={{color:'#525252',fontFamily:'Poppins,sans-serif'}}>Subscribe to village newsletter</span>
              </label>
              <label className="flex items-start gap-3 cursor-pointer">
                <input type="checkbox" {...register('terms',{required:'You must agree'})} className="w-4 h-4 rounded accent-primary-500 mt-0.5"/>
                <span className="text-sm" style={{color:'#525252',fontFamily:'Poppins,sans-serif'}}>
                  I agree to the <Link to="/contact" className="hover:underline font-semibold" style={{color:'#5B2D8E'}}>Community Terms</Link>
                </span>
              </label>
              {errors.terms && <p className="text-xs" style={{color:'#dc2626'}}>{errors.terms.message}</p>}
            </div>
            <button type="submit" disabled={loading} className="btn-secondary w-full justify-center mt-2">
              {loading ? <><i className="fas fa-spinner animate-spin"/>Creating account…</> : <><i className="fas fa-user-plus"/>Create Account</>}
            </button>
          </form>

          <div className="mt-6 pt-5 text-center border-t" style={{borderColor:'rgba(91,45,142,0.08)'}}>
            <p className="text-sm" style={{color:'#737373',fontFamily:'Poppins,sans-serif'}}>
              Already a member?{' '}
              <Link to="/login" className="font-semibold hover:underline" style={{color:'#5B2D8E'}}>Sign in</Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
