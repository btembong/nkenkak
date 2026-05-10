import { useState } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import toast from 'react-hot-toast'
import { useAuth } from '../../context/AuthContext'
import AuthSlider from '../common/AuthSlider'

export default function LoginPage() {
  const { login } = useAuth()
  const navigate  = useNavigate()
  const location  = useLocation()
  const from      = location.state?.from?.pathname || '/'
  const [loading, setLoading] = useState(false)
  const [showPw,  setShowPw]  = useState(false)
  const { register, handleSubmit, formState:{errors} } = useForm()

  const onSubmit = async (data) => {
    setLoading(true)
    try {
      const user = await login(data.email, data.password)
      toast.success(`Welcome back, ${user.firstName}!`)
      navigate(user.role === 'admin' ? '/admin' : from)
    } catch (err) {
      toast.error(err.response?.data?.error || 'Invalid email or password')
    } finally { setLoading(false) }
  }

  return (
    <div className="min-h-screen grid lg:grid-cols-2">
      {/* Left — image slider */}
      <div className="hidden lg:block sticky top-0 h-screen overflow-hidden">
        <AuthSlider />
      </div>

      {/* Right — form panel */}
      <div className="flex items-center justify-center p-8" style={{background:'#FAFAFA'}}>
        <div className="w-full max-w-md">
          {/* Mobile logo */}
          <Link to="/" className="flex items-center gap-3 mb-10 lg:hidden">
            <div className="w-10 h-10 rounded-2xl flex items-center justify-center" style={{background:'linear-gradient(135deg,#5B2D8E,#7B4DB8)'}}>
              <i className="fas fa-heart" style={{color:'#F0A500'}}/>
            </div>
            <span className="font-display font-bold" style={{color:'#1A0A35'}}>Nkenkak-Ngiesang</span>
          </Link>

          <h2 className="font-display font-bold text-3xl mb-1" style={{color:'#1A0A35'}}>Sign In</h2>
          <p className="text-sm mb-8" style={{color:'#737373',fontFamily:'Poppins,sans-serif'}}>Welcome back to your community</p>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
            <div>
              <label className="label">Email Address</label>
              <input type="email" {...register('email',{required:'Email required'})} placeholder="your@email.com" className="input"/>
              {errors.email && <p className="text-xs mt-1" style={{color:'#dc2626'}}>{errors.email.message}</p>}
            </div>
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="label !mb-0">Password</label>
                <Link to="/forgot-password" className="text-xs font-semibold hover:underline" style={{color:'#5B2D8E'}}>Forgot password?</Link>
              </div>
              <div className="relative">
                <input type={showPw?'text':'password'} {...register('password',{required:'Password required'})} placeholder="Your password" className="input pr-12"/>
                <button type="button" onClick={()=>setShowPw(!showPw)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 transition-colors"
                  style={{color:'#A3A3A3'}}>
                  <i className={`fas fa-${showPw?'eye-slash':'eye'}`}/>
                </button>
              </div>
              {errors.password && <p className="text-xs mt-1" style={{color:'#dc2626'}}>{errors.password.message}</p>}
            </div>

            <button type="submit" disabled={loading} className="btn-secondary w-full justify-center">
              {loading ? <><i className="fas fa-spinner animate-spin"/>Signing in…</> : <><i className="fas fa-sign-in-alt"/>Sign In</>}
            </button>
          </form>

          {/* Demo credentials */}
          <div className="mt-5 p-4 rounded-2xl" style={{background:'rgba(91,45,142,0.05)', border:'1px solid rgba(91,45,142,0.1)'}}>
            <div className="flex items-center gap-2 mb-2">
              <i className="fas fa-info-circle text-sm" style={{color:'#5B2D8E'}}/>
              <span className="text-xs font-semibold" style={{color:'#5B2D8E',fontFamily:'Sora,sans-serif'}}>Demo Credentials</span>
            </div>
            <p className="text-xs" style={{color:'#737373',fontFamily:'Poppins,sans-serif'}}>
              <strong>Email:</strong> admin@nkenkak-ngiesang.cm<br/>
              <strong>Password:</strong> Admin@1234
            </p>
          </div>

          <div className="mt-8 pt-6 text-center border-t" style={{borderColor:'rgba(91,45,142,0.08)'}}>
            <p className="text-sm" style={{color:'#737373',fontFamily:'Poppins,sans-serif'}}>
              Don't have an account?{' '}
              <Link to="/register" className="font-semibold hover:underline" style={{color:'#5B2D8E'}}>Join the community</Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
