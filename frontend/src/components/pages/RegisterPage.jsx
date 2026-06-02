import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import toast from 'react-hot-toast'
import { useAuth } from '../../context/AuthContext'
import AuthSlider from '../common/AuthSlider'
import { Button } from '../ui/button'
import { Input } from '../ui/input'
import { Label } from '../ui/label'
import { Separator } from '../ui/separator'
import { HeartHandshake, Eye, EyeOff, Loader2, UserPlus } from 'lucide-react'

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
      <div className="lg:col-span-3 flex items-start justify-center p-8 overflow-y-auto bg-muted/30">
        <div className="w-full max-w-lg py-6">
          <Link to="/" className="flex items-center gap-3 mb-8 lg:hidden">
            <div className="w-10 h-10 rounded-2xl flex items-center justify-center bg-gradient-to-br from-primary-500 to-primary-light">
              <HeartHandshake className="w-5 h-5 text-gold"/>
            </div>
            <span className="font-display font-bold text-dark">Nkenkak-Ngiesang</span>
          </Link>

          <h2 className="font-display font-bold text-3xl mb-1 text-dark">Create Account</h2>
          <p className="text-sm mb-8 text-muted-foreground">Join the Nkenkak-Ngiesang community today</p>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label htmlFor="first_name">First Name *</Label>
                <Input id="first_name" {...register('first_name',{required:'Required'})} placeholder="First name"
                  className={errors.first_name ? 'border-red-400 focus-visible:ring-red-400' : ''}/>
                {errors.first_name && <p className="text-xs text-red-500">{errors.first_name.message}</p>}
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="last_name">Last Name *</Label>
                <Input id="last_name" {...register('last_name',{required:'Required'})} placeholder="Last name"
                  className={errors.last_name ? 'border-red-400 focus-visible:ring-red-400' : ''}/>
                {errors.last_name && <p className="text-xs text-red-500">{errors.last_name.message}</p>}
              </div>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="email">Email Address *</Label>
              <Input id="email" type="email"
                {...register('email',{required:'Email required',pattern:{value:/\S+@\S+\.\S+/,message:'Invalid email'}})}
                placeholder="your@email.com"
                className={errors.email ? 'border-red-400 focus-visible:ring-red-400' : ''}/>
              {errors.email && <p className="text-xs text-red-500">{errors.email.message}</p>}
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label htmlFor="phone">Phone / WhatsApp</Label>
                <Input id="phone" {...register('phone')} placeholder="+237 6XX XXX XXX"/>
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="country">Country *</Label>
                <Input id="country" {...register('country',{required:'Required'})} placeholder="e.g. Cameroon"
                  className={errors.country ? 'border-red-400 focus-visible:ring-red-400' : ''}/>
                {errors.country && <p className="text-xs text-red-500">{errors.country.message}</p>}
              </div>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="city">City</Label>
              <Input id="city" {...register('city')} placeholder="Your city"/>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="password">Password *</Label>
              <div className="relative">
                <Input id="password" type={showPw?'text':'password'}
                  {...register('password',{required:'Required',minLength:{value:8,message:'Min 8 characters'}})}
                  placeholder="At least 8 characters"
                  className={`pr-12 ${errors.password ? 'border-red-400 focus-visible:ring-red-400' : ''}`}/>
                <button type="button" onClick={()=>setShowPw(!showPw)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors">
                  {showPw ? <EyeOff className="w-4 h-4"/> : <Eye className="w-4 h-4"/>}
                </button>
              </div>
              {errors.password && <p className="text-xs text-red-500">{errors.password.message}</p>}
            </div>

            <div className="space-y-3 pt-1">
              <label className="flex items-center gap-3 cursor-pointer">
                <input type="checkbox" {...register('is_diaspora')} className="w-4 h-4 rounded accent-primary-500"/>
                <span className="text-sm text-foreground/80">I am a diaspora member (living outside Cameroon)</span>
              </label>
              <label className="flex items-center gap-3 cursor-pointer">
                <input type="checkbox" {...register('newsletter')} defaultChecked className="w-4 h-4 rounded accent-primary-500"/>
                <span className="text-sm text-foreground/80">Subscribe to village newsletter</span>
              </label>
              <label className="flex items-start gap-3 cursor-pointer">
                <input type="checkbox" {...register('terms',{required:'You must agree'})} className="w-4 h-4 rounded accent-primary-500 mt-0.5"/>
                <span className="text-sm text-foreground/80">
                  I agree to the <Link to="/contact" className="hover:underline font-semibold text-primary-500">Community Terms</Link>
                </span>
              </label>
              {errors.terms && <p className="text-xs text-red-500">{errors.terms.message}</p>}
            </div>

            <Button type="submit" disabled={loading} className="w-full mt-2" size="lg" variant="secondary">
              {loading
                ? <><Loader2 className="w-4 h-4 animate-spin"/>Creating account…</>
                : <><UserPlus className="w-4 h-4"/>Create Account</>
              }
            </Button>
          </form>

          <Separator className="my-6"/>
          <p className="text-sm text-muted-foreground text-center">
            Already a member?{' '}
            <Link to="/login" className="font-semibold text-primary-500 hover:underline">Sign in</Link>
          </p>
        </div>
      </div>
    </div>
  )
}
