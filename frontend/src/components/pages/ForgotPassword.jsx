import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import toast from 'react-hot-toast'
import api from '../../services/api'

export default function ForgotPassword() {
  const [done, setDone] = useState(false)
  const [loading, setLoading] = useState(false)
  const { register, handleSubmit, formState: { errors } } = useForm()

  const onSubmit = async ({ email }) => {
    setLoading(true)
    try {
      await api.post('/auth/forgot-password', { email })
      setDone(true)
    } catch { toast.error('Something went wrong') }
    finally { setLoading(false) }
  }

  return (
    <div className="min-h-screen bg-cream-light flex items-center justify-center p-6">
      <div className="w-full max-w-md">
        <Link to="/" className="flex items-center gap-3 mb-12 justify-center">
          <div className="w-12 h-12 rounded-full bg-earth flex items-center justify-center font-cinzel font-black text-gold">NN</div>
          <span className="font-cinzel text-earth font-bold text-lg">Nkenkak-Ngiesang</span>
        </Link>

        {done ? (
          <div className="bg-white rounded-2xl p-10 shadow-sm border border-black/5 text-center">
            <div className="w-16 h-16 rounded-full bg-green-50 flex items-center justify-center mx-auto mb-5">
              <i className="fas fa-envelope-open-text text-green-500 text-2xl"/>
            </div>
            <h2 className="font-serif text-2xl text-earth mb-3">Check your email</h2>
            <p className="text-earth/60 text-sm leading-relaxed mb-6">If an account exists with that email, we've sent a password reset link. It expires in 1 hour.</p>
            <Link to="/login" className="btn-earth text-sm justify-center w-full"><i className="fas fa-arrow-left"/> Back to Login</Link>
          </div>
        ) : (
          <div className="bg-white rounded-2xl p-10 shadow-sm border border-black/5">
            <h2 className="font-serif text-3xl text-earth mb-2">Forgot password?</h2>
            <p className="text-earth/50 text-sm mb-8">Enter your email and we'll send a reset link.</p>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
              <div>
                <label className="label">Email Address</label>
                <input type="email" {...register('email', { required: 'Email required' })}
                  placeholder="your@email.com" className="input"/>
                {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email.message}</p>}
              </div>
              <button type="submit" disabled={loading} className="btn-gold w-full justify-center text-sm">
                {loading ? <><i className="fas fa-spinner animate-spin"/> Sending...</> : <><i className="fas fa-paper-plane"/> Send Reset Link</>}
              </button>
            </form>
            <div className="mt-6 text-center">
              <Link to="/login" className="text-earth/50 text-sm hover:text-gold transition-colors flex items-center justify-center gap-2">
                <i className="fas fa-arrow-left text-xs"/> Back to login
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
