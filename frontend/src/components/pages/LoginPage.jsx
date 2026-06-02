import { useState } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import toast from 'react-hot-toast'
import { useAuth } from '../../context/AuthContext'
import AuthSlider from '../common/AuthSlider'
import { Button } from '../ui/button'
import { Input } from '../ui/input'
import { Label } from '../ui/label'
import { Alert, AlertDescription } from '../ui/alert'
import { Separator } from '../ui/separator'

export default function LoginPage() {
  const { login } = useAuth()
  const navigate  = useNavigate()
  const location  = useLocation()
  const from      = location.state?.from?.pathname || '/'
  const [loading, setLoading] = useState(false)
  const [showPw,  setShowPw]  = useState(false)
  const [apiError, setApiError] = useState('')
  const { register, handleSubmit, formState: { errors } } = useForm()

  const onSubmit = async (data) => {
    setLoading(true)
    setApiError('')
    try {
      const user = await login(data.email, data.password)
      toast.success(`Welcome back, ${user.firstName}!`)
      navigate(user.role === 'admin' ? '/admin' : from)
    } catch (err) {
      setApiError(err.response?.data?.error || 'Invalid email or password')
    } finally { setLoading(false) }
  }

  return (
    <div className="min-h-screen grid lg:grid-cols-2">
      {/* Left — image slider */}
      <div className="hidden lg:block sticky top-0 h-screen overflow-hidden">
        <AuthSlider/>
      </div>

      {/* Right — form panel */}
      <div className="flex items-center justify-center p-8 bg-muted/30">
        <div className="w-full max-w-md">
          {/* Mobile logo */}
          <Link to="/" className="flex items-center gap-3 mb-10 lg:hidden">
            <div className="w-10 h-10 rounded-2xl flex items-center justify-center bg-gradient-to-br from-primary-500 to-primary-light">
              <i className="fas fa-mountain-city text-gold"/>
            </div>
            <span className="font-bold text-dark">Nkenkak-Ngiesang</span>
          </Link>

          <h2 className="font-bold text-3xl mb-1 text-dark">Sign In</h2>
          <p className="text-sm text-muted-foreground mb-8">Welcome back to your community</p>

          {apiError && (
            <Alert variant="destructive" className="mb-6">
              <i className="fas fa-exclamation-circle"/>
              <AlertDescription>{apiError}</AlertDescription>
            </Alert>
          )}

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
            <div className="space-y-1.5">
              <Label htmlFor="email">Email Address</Label>
              <Input
                id="email"
                type="email"
                placeholder="your@email.com"
                {...register('email', { required: 'Email required' })}
                className={errors.email ? 'border-red-400 focus-visible:ring-red-400' : ''}
              />
              {errors.email && <p className="text-xs text-red-500">{errors.email.message}</p>}
            </div>

            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <Label htmlFor="password">Password</Label>
                <Link to="/forgot-password" className="text-xs font-semibold text-primary-500 hover:underline">
                  Forgot password?
                </Link>
              </div>
              <div className="relative">
                <Input
                  id="password"
                  type={showPw ? 'text' : 'password'}
                  placeholder="Your password"
                  {...register('password', { required: 'Password required' })}
                  className={`pr-12 ${errors.password ? 'border-red-400 focus-visible:ring-red-400' : ''}`}
                />
                <button type="button" onClick={() => setShowPw(!showPw)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors">
                  <i className={`fas fa-${showPw ? 'eye-slash' : 'eye'}`}/>
                </button>
              </div>
              {errors.password && <p className="text-xs text-red-500">{errors.password.message}</p>}
            </div>

            <Button type="submit" disabled={loading} className="w-full" size="lg" variant="default">
              {loading
                ? <><i className="fas fa-spinner animate-spin"/>Signing in…</>
                : <><i className="fas fa-sign-in-alt"/>Sign In</>
              }
            </Button>
          </form>

          {/* Demo credentials */}
          <div className="mt-5 p-4 rounded-xl bg-primary-50 border border-primary-100">
            <div className="flex items-center gap-2 mb-2">
              <i className="fas fa-info-circle text-sm text-primary-500"/>
              <span className="text-xs font-semibold text-primary-500">Demo Credentials</span>
            </div>
            <p className="text-xs text-muted-foreground">
              <strong>Email:</strong> admin@nkenkak-ngiesang.cm<br/>
              <strong>Password:</strong> Admin@1234
            </p>
          </div>

          <Separator className="my-8"/>
          <p className="text-sm text-muted-foreground text-center">
            Don't have an account?{' '}
            <Link to="/register" className="font-semibold text-primary-500 hover:underline">
              Join the community
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}
