import { useState } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import toast from 'react-hot-toast'
import { useAuth } from '../../context/AuthContext'

export default function LoginPage() {
  const { login } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const from = location.state?.from?.pathname || '/'
  const [loading, setLoading] = useState(false)
  const [showPw, setShowPw] = useState(false)
  const { register, handleSubmit, formState: { errors } } = useForm()

  const onSubmit = async (data) => {
    setLoading(true)
    try {
      const user = await login(data.email, data.password)
      toast.success(`Welcome back, ${user.first_name}! 🌿`)
      if (user.role === 'admin') navigate('/admin')
      else navigate(from)
    } catch (err) {
      toast.error(err.response?.data?.error || 'Login failed')
    } finally { setLoading(false) }
  }

  return (
    <div className="min-h-screen flex">
      {/* Left panel */}
      <div className="hidden lg:flex flex-col justify-between w-1/2 bg-gradient-to-br from-earth via-earth-light to-[#2D1A08] p-16 relative overflow-hidden">
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
        <div className="relative space-y-6">
          <div className="font-serif text-5xl text-cream leading-tight">
            Your village.<br/>
            <span className="text-gold">Your community.</span><br/>
            Your home.
          </div>
          <p className="text-cream/50 leading-relaxed max-w-sm">
            Sign in to access your member portal, track donations, join the forum, and stay connected with Nkenkak-Ngiesang — wherever you are in the world.
          </p>
          {/* Testimonial */}
          <div className="bg-white/5 border border-white/10 rounded-xl p-5 max-w-sm">
            <div className="text-gold text-2xl font-serif mb-2">"</div>
            <p className="text-cream/70 text-sm italic leading-relaxed">Being part of this community across thousands of miles has never felt more real.</p>
            <div className="mt-3 flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-gold/20 flex items-center justify-center text-gold text-xs font-bold">BT</div>
              <div>
                <div className="text-cream text-xs font-semibold">Bernard Tchouapa</div>
                <div className="text-cream/40 text-[10px]">Diaspora Member — Paris</div>
              </div>
            </div>
          </div>
        </div>
        <div className="relative text-cream/20 text-xs">© {new Date().getFullYear()} Nkenkak-Ngiesang</div>
      </div>

      {/* Right panel */}
      <div className="flex-1 flex items-center justify-center p-8 bg-cream-light">
        <div className="w-full max-w-md">
          {/* Mobile logo */}
          <Link to="/" className="flex items-center gap-3 mb-10 lg:hidden">
            <div className="w-10 h-10 rounded-full bg-earth flex items-center justify-center font-cinzel font-black text-gold text-sm">NN</div>
            <span className="font-cinzel text-earth font-bold">Nkenkak-Ngiesang</span>
          </Link>

          <h2 className="font-serif text-3xl text-earth mb-1">Sign in</h2>
          <p className="text-earth/50 text-sm mb-8">Welcome back to your community</p>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
            <div>
              <label className="label">Email Address</label>
              <input type="email" {...register('email', { required: 'Email is required' })}
                placeholder="your@email.com" className="input"/>
              {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email.message}</p>}
            </div>
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="label !mb-0">Password</label>
                <Link to="/forgot-password" className="text-gold text-xs hover:underline">Forgot password?</Link>
              </div>
              <div className="relative">
                <input type={showPw ? 'text' : 'password'} {...register('password', { required: 'Password is required' })}
                  placeholder="Your password" className="input pr-12"/>
                <button type="button" onClick={() => setShowPw(!showPw)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-earth/30 hover:text-earth transition-colors">
                  <i className={`fas ${showPw ? 'fa-eye-slash' : 'fa-eye'}`}/>
                </button>
              </div>
              {errors.password && <p className="text-red-500 text-xs mt-1">{errors.password.message}</p>}
            </div>

            <button type="submit" disabled={loading}
              className="btn-gold w-full justify-center text-sm">
              {loading
                ? <><i className="fas fa-spinner animate-spin"/> Signing in...</>
                : <><i className="fas fa-sign-in-alt"/> Sign In</>}
            </button>
          </form>

          <div className="mt-8 pt-6 border-t border-earth/8 text-center">
            <p className="text-earth/50 text-sm">
              Don't have an account?{' '}
              <Link to="/register" className="text-gold font-semibold hover:underline">Join the community</Link>
            </p>
          </div>

          {/* Demo credentials */}
          <div className="mt-6 p-4 bg-gold/8 border border-gold/20 rounded-xl text-xs text-earth/60 space-y-1">
            <div className="font-bold text-earth/80 mb-2 flex items-center gap-1.5"><i className="fas fa-info-circle text-gold"/> Demo Credentials</div>
            <div>Admin: <span className="font-mono font-semibold">admin@nkenkak-ngiesang.cm</span> / <span className="font-mono font-semibold">Admin@1234</span></div>
          </div>
        </div>
      </div>
    </div>
  )
}
