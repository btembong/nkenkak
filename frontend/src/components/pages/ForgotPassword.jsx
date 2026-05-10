import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import toast from 'react-hot-toast'
import api from '../../services/api'

export default function ForgotPassword() {
  const [done,    setDone]    = useState(false)
  const [loading, setLoading] = useState(false)
  const { register, handleSubmit, formState:{errors} } = useForm()

  const onSubmit = async ({email}) => {
    setLoading(true)
    try { await api.post('/auth/forgot-password',{email}); setDone(true) }
    catch { toast.error('Something went wrong') }
    finally { setLoading(false) }
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-6" style={{background:'linear-gradient(135deg,#F3EEF9,#FBF8F2)'}}>
      <div className="w-full max-w-md">
        {/* Logo */}
        <Link to="/" className="flex flex-col items-center mb-4">
          <img
            src="https://res.cloudinary.com/dmxnsttmu/image/upload/v1778254134/nkek-logo_jdaxf8.png"
            alt="Nkenkak-Ngiesang Development Council"
            className="h-64 w-auto object-contain drop-shadow-md"
          />
        </Link>

        <div className="card p-8">
          {done ? (
            <div className="text-center py-4">
              <div className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-5"
                style={{background:'rgba(22,163,74,0.08)', border:'2px solid rgba(22,163,74,0.2)'}}>
                <i className="fas fa-envelope-open-text text-2xl" style={{color:'#16a34a'}}/>
              </div>
              <h2 className="font-display font-bold text-2xl mb-3" style={{color:'#1A0A35'}}>Check your email</h2>
              <p className="text-sm leading-relaxed mb-6" style={{color:'#737373',fontFamily:'Poppins,sans-serif'}}>
                If an account exists with that email, we've sent a password reset link. The link expires in 1 hour.
              </p>
              <Link to="/login" className="btn-secondary w-full justify-center">
                <i className="fas fa-arrow-left text-xs"/>Back to Login
              </Link>
            </div>
          ) : (
            <>
              <h2 className="font-display font-bold text-2xl mb-1" style={{color:'#1A0A35'}}>Forgot Password?</h2>
              <p className="text-sm mb-7" style={{color:'#737373',fontFamily:'Poppins,sans-serif'}}>Enter your email and we'll send a reset link.</p>
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
                <div>
                  <label className="label">Email Address</label>
                  <input type="email" {...register('email',{required:'Email required'})}
                    placeholder="your@email.com" className="input"/>
                  {errors.email && <p className="text-xs mt-1" style={{color:'#dc2626'}}>{errors.email.message}</p>}
                </div>
                <button type="submit" disabled={loading} className="btn-secondary w-full justify-center">
                  {loading ? <><i className="fas fa-spinner animate-spin"/>Sending…</> : <><i className="fas fa-paper-plane"/>Send Reset Link</>}
                </button>
              </form>
              <div className="mt-6 text-center">
                <Link to="/login" className="text-sm font-semibold flex items-center justify-center gap-2 hover:underline" style={{color:'#5B2D8E',fontFamily:'Sora,sans-serif'}}>
                  <i className="fas fa-arrow-left text-xs"/>Back to login
                </Link>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  )
}
