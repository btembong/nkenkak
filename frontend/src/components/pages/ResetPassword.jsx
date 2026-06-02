import { useState } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import toast from 'react-hot-toast'
import api from '../../services/api'
import { LinkIcon, Check, ArrowRight, ArrowLeft, Loader2, Lock, Eye, EyeOff } from 'lucide-react'

export default function ResetPassword() {
  const [searchParams] = useSearchParams()
  const token = searchParams.get('token')
  const navigate = useNavigate()
  const [loading, setLoading] = useState(false)
  const [done, setDone] = useState(false)
  const [showPw, setShowPw] = useState(false)
  const { register, handleSubmit, watch, formState: { errors } } = useForm()

  const onSubmit = async ({ password }) => {
    setLoading(true)
    try {
      await api.post('/auth/reset-password', { token, password })
      setDone(true)
      setTimeout(() => navigate('/login'), 3000)
    } catch (err) {
      toast.error(err.response?.data?.error || 'Reset failed. The link may have expired.')
    } finally { setLoading(false) }
  }

  if (!token) {
    return (
      <div className="min-h-screen flex items-center justify-center px-6" style={{ background: 'linear-gradient(135deg,#F3EEF9,#FBF8F2)' }}>
        <div className="card p-8 w-full max-w-md text-center">
          <LinkIcon className="w-10 h-10 mx-auto mb-4 text-red-500"/>
          <h2 className="font-display font-bold text-xl mb-2 text-dark">Invalid Link</h2>
          <p className="text-sm mb-6 text-muted-foreground">This reset link is missing a token. Please request a new one.</p>
          <Link to="/forgot-password" className="btn-secondary w-full justify-center">Request New Link</Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-6" style={{ background: 'linear-gradient(135deg,#F3EEF9,#FBF8F2)' }}>
      <div className="w-full max-w-md">
        <Link to="/" className="flex flex-col items-center mb-4">
          <img
            src="https://res.cloudinary.com/dmxnsttmu/image/upload/v1778254134/nkek-logo_jdaxf8.png"
            alt="Nkenkak-Ngiesang"
            className="h-48 w-auto object-contain"
          />
        </Link>

        <div className="card p-8">
          {done ? (
            <div className="text-center py-4">
              <div className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-5"
                style={{ background: 'rgba(91,45,142,0.08)', border: '2px solid rgba(91,45,142,0.2)' }}>
                <Check className="w-7 h-7 text-primary-500"/>
              </div>
              <h2 className="font-display font-bold text-2xl mb-2 text-dark">Password Reset!</h2>
              <p className="text-sm mb-6 text-muted-foreground">
                Your password has been updated. Redirecting you to login…
              </p>
              <Link to="/login" className="btn-secondary w-full justify-center">
                <ArrowRight className="w-3 h-3"/>Go to Login
              </Link>
            </div>
          ) : (
            <>
              <h2 className="font-display font-bold text-2xl mb-1 text-dark">Set New Password</h2>
              <p className="text-sm mb-7 text-muted-foreground">Choose a strong password of at least 8 characters.</p>

              <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
                <div>
                  <label className="label">New Password</label>
                  <div className="relative">
                    <input
                      type={showPw ? 'text' : 'password'}
                      {...register('password', {
                        required: 'Password is required',
                        minLength: { value: 8, message: 'Minimum 8 characters' }
                      })}
                      placeholder="Enter new password"
                      className="input pr-10"
                    />
                    <button type="button" onClick={() => setShowPw(p => !p)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                      {showPw ? <EyeOff className="w-4 h-4"/> : <Eye className="w-4 h-4"/>}
                    </button>
                  </div>
                  {errors.password && <p className="text-xs mt-1 text-red-500">{errors.password.message}</p>}
                </div>

                <div>
                  <label className="label">Confirm Password</label>
                  <input
                    type={showPw ? 'text' : 'password'}
                    {...register('confirm', {
                      required: 'Please confirm your password',
                      validate: v => v === watch('password') || 'Passwords do not match'
                    })}
                    placeholder="Repeat new password"
                    className="input"
                  />
                  {errors.confirm && <p className="text-xs mt-1 text-red-500">{errors.confirm.message}</p>}
                </div>

                <button type="submit" disabled={loading} className="btn-secondary w-full justify-center">
                  {loading
                    ? <><Loader2 className="w-4 h-4 animate-spin"/>Resetting…</>
                    : <><Lock className="w-4 h-4"/>Reset Password</>}
                </button>
              </form>

              <div className="mt-6 text-center">
                <Link to="/login" className="text-sm font-semibold flex items-center justify-center gap-2 hover:underline text-primary-500">
                  <ArrowLeft className="w-3 h-3"/>Back to Login
                </Link>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  )
}
