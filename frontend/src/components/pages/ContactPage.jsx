import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import toast from 'react-hot-toast'
import api from '../../services/api'
import { Card } from '../ui/card'
import { Button } from '../ui/button'
import { Input } from '../ui/input'
import { Label } from '../ui/label'
import {
  MapPin, Phone, Mail, Clock, Home, ChevronRight,
  Check, Loader2, Send, Plus, Minus,
} from 'lucide-react'

const FAQS = [
  { q:'How can I donate to projects?', a:'Click "Donate Now" on any project page. We accept MTN MoMo, Orange Money, PayPal and card.' },
  { q:'Is Nkenkak-Ngiesang a non-profit organisation?', a:'Yes. 100% of donations go directly to approved village projects. We publish quarterly transparency reports.' },
  { q:'How are funds managed?', a:'All funds are managed by the elected village treasurer. Detailed financial reports are available to all registered members.' },
  { q:'Can diaspora members vote on projects?', a:'Yes. Registered members can vote through Community Polls in their member portal.' },
  { q:'How do I join the community team?', a:'Visit the Team page and click "Apply to Join". Choose your preferred team and submit your application.' },
]

const INFO_CARDS = [
  { Icon: MapPin, title:'Our Location',       lines:['Nkenkak-Ngiesang','South West Region, Cameroon'] },
  { Icon: Phone,  title:'Phone & WhatsApp',   lines:['+237 6XX XXX XXX','+237 6XX XXX XXX'] },
  { Icon: Mail,   title:'Email Address',      lines:['contact@nkenkak-ngiesang.cm','admin@nkenkak-ngiesang.cm'] },
  { Icon: Clock,  title:'Office Hours',       lines:['Mon–Fri: 9am – 5pm','Weekends: By appointment'] },
]

export default function ContactPage() {
  const [sent, setSent]     = useState(false)
  const [loading, setLoad]  = useState(false)
  const [openFaq, setOpen]  = useState(null)
  const { register, handleSubmit, reset, formState:{errors} } = useForm()

  const onSubmit = async (data) => {
    setLoad(true)
    try {
      await api.post('/contact', data)
      setSent(true)
      reset()
      toast.success('Message sent! We\'ll respond within 48 hours.')
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to send. Please try again.')
    } finally { setLoad(false) }
  }

  return (
    <div>
      {/* Hero */}
      <div className="page-hero py-20 px-6 text-center">
        <div className="eyebrow justify-center mb-3 text-gold/90">
          <span className="w-5 h-0.5 rounded-full inline-block mr-2 bg-gold"/>Get In Touch
        </div>
        <h1 className="font-display font-bold text-4xl text-white mb-3">Contact Us</h1>
        <div className="flex items-center justify-center gap-2 text-sm text-white/60">
          <Link to="/" className="hover:text-white transition-colors flex items-center gap-1">
            <Home className="w-3 h-3"/>Home
          </Link>
          <ChevronRight className="w-3 h-3 text-gold"/>
          <span className="text-gold">Contact Us</span>
        </div>
      </div>

      {/* Contact section */}
      <section className="py-20 bg-white">
        <div className="max-w-6xl mx-auto px-6 grid lg:grid-cols-3 gap-10">

          {/* Info cards */}
          <div className="space-y-4">
            {INFO_CARDS.map(({ Icon, title, lines }) => (
              <Card key={title} className="p-5 flex gap-4 items-start">
                <div className="w-12 h-12 rounded-2xl flex items-center justify-center flex-shrink-0"
                  style={{ background:'linear-gradient(135deg,#5B2D8E,#7B4DB8)' }}>
                  <Icon className="w-5 h-5 text-white"/>
                </div>
                <div>
                  <h4 className="font-display font-semibold text-sm mb-1 text-dark">{title}</h4>
                  {lines.map(l => <p key={l} className="text-xs text-muted-foreground">{l}</p>)}
                </div>
              </Card>
            ))}

            {/* Social */}
            <Card className="p-5">
              <h4 className="font-display font-semibold text-sm mb-3 text-dark">Follow Us</h4>
              <div className="flex gap-3">
                {[
                  { ic:'fab fa-facebook-f', c:'#1877F2' },
                  { ic:'fab fa-twitter',    c:'#1DA1F2' },
                  { ic:'fab fa-instagram',  c:'#E1306C' },
                  { ic:'fab fa-youtube',    c:'#FF0000' },
                  { ic:'fab fa-whatsapp',   c:'#25D366' },
                ].map(s => (
                  <a key={s.ic} href="#"
                    className="w-9 h-9 rounded-full flex items-center justify-center text-white text-sm transition-all hover:-translate-y-1"
                    style={{ background:s.c }}>
                    <i className={s.ic}/>
                  </a>
                ))}
              </div>
            </Card>
          </div>

          {/* Form */}
          <div className="lg:col-span-2">
            <Card className="p-8">
              <div className="eyebrow mb-3">Send a Message</div>
              <h2 className="font-display font-bold text-2xl mb-2 text-dark">
                We'd Love to <span style={{ color:'#F0A500' }}>Hear From You</span>
              </h2>
              <p className="text-sm mb-6 text-muted-foreground">
                Whether you're a resident, diaspora member, partner or supporter — every message matters.
              </p>

              {sent ? (
                <div className="rounded-3xl p-10 text-center"
                  style={{ background:'rgba(91,45,142,0.04)', border:'1px solid rgba(91,45,142,0.12)' }}>
                  <div className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4"
                    style={{ background:'rgba(91,45,142,0.1)' }}>
                    <Check className="w-8 h-8 text-primary-500"/>
                  </div>
                  <h3 className="font-display font-bold text-xl mb-2 text-dark">Message Sent!</h3>
                  <p className="text-sm mb-5 text-muted-foreground">
                    We'll respond within 48 hours. Thank you for reaching out to Nkenkak-Ngiesang!
                  </p>
                  <Button variant="secondary" onClick={() => setSent(false)}>
                    Send Another Message
                  </Button>
                </div>
              ) : (
                <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <Label htmlFor="name">Full Name *</Label>
                      <Input id="name" {...register('name',{required:'Name required'})} placeholder="Your full name"
                        className={errors.name ? 'border-red-400 focus-visible:ring-red-400' : ''}/>
                      {errors.name && <p className="text-xs text-red-500">{errors.name.message}</p>}
                    </div>
                    <div className="space-y-1.5">
                      <Label htmlFor="email">Email *</Label>
                      <Input id="email" type="email"
                        {...register('email',{required:'Email required',pattern:{value:/\S+@\S+\.\S+/,message:'Invalid email'}})}
                        placeholder="your@email.com"
                        className={errors.email ? 'border-red-400 focus-visible:ring-red-400' : ''}/>
                      {errors.email && <p className="text-xs text-red-500">{errors.email.message}</p>}
                    </div>
                    <div className="space-y-1.5">
                      <Label htmlFor="phone">Phone</Label>
                      <Input id="phone" {...register('phone')} placeholder="+237 6XX XXX XXX"/>
                    </div>
                    <div className="space-y-1.5">
                      <Label htmlFor="subject">Subject *</Label>
                      <select id="subject" {...register('subject',{required:'Subject required'})}
                        className={`w-full rounded-md border px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-primary-500/30 ${errors.subject ? 'border-red-400' : 'border-input'}`}
                        style={{ background:'hsl(var(--background))', color:'hsl(var(--foreground))' }}>
                        <option value="">Select subject…</option>
                        <option>General Enquiry</option>
                        <option>Project Support</option>
                        <option>Diaspora Partnership</option>
                        <option>Media / Press</option>
                        <option>Volunteer</option>
                        <option>Donation Receipt</option>
                        <option>Technical Issue</option>
                        <option>Other</option>
                      </select>
                      {errors.subject && <p className="text-xs text-red-500">{errors.subject.message}</p>}
                    </div>
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="message">Message *</Label>
                    <textarea id="message"
                      {...register('message',{required:'Message required',minLength:{value:10,message:'At least 10 characters'}})}
                      rows={5} placeholder="How can we help you?"
                      className={`w-full rounded-md border px-3 py-2 text-sm outline-none resize-none focus:ring-2 focus:ring-primary-500/30 ${errors.message ? 'border-red-400' : 'border-input'}`}
                      style={{ background:'hsl(var(--background))', color:'hsl(var(--foreground))' }}/>
                    {errors.message && <p className="text-xs text-red-500">{errors.message.message}</p>}
                  </div>
                  <Button type="submit" disabled={loading} variant="secondary" className="w-full">
                    {loading
                      ? <><Loader2 className="w-4 h-4 animate-spin"/>Sending…</>
                      : <><Send className="w-4 h-4"/>Send Message</>}
                  </Button>
                </form>
              )}
            </Card>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="py-20" style={{ background:'linear-gradient(135deg,#FBF8F2,#F3EEF9)' }}>
        <div className="max-w-4xl mx-auto px-6">
          <div className="text-center mb-10">
            <div className="eyebrow justify-center mb-3">Got Questions?</div>
            <h2 className="section-title">Frequently Asked <span style={{ color:'#F0A500' }}>Questions</span></h2>
          </div>
          <div className="space-y-3">
            {FAQS.map((f, i) => (
              <div key={i} className="rounded-2xl overflow-hidden"
                style={{ border:'1px solid rgba(91,45,142,0.08)' }}>
                <button onClick={() => setOpen(openFaq===i ? null : i)}
                  className="w-full flex items-center justify-between px-5 py-4 text-left transition-all"
                  style={{ background: openFaq===i ? 'rgba(91,45,142,0.04)' : '#fff' }}>
                  <span className="font-display font-semibold text-sm pr-4"
                    style={{ color: openFaq===i ? '#5B2D8E' : '#1A0A35' }}>
                    {f.q}
                  </span>
                  <div className="w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0 transition-colors"
                    style={{ background: openFaq===i ? '#5B2D8E' : 'rgba(91,45,142,0.08)' }}>
                    {openFaq===i
                      ? <Minus className="w-3 h-3 text-white"/>
                      : <Plus className="w-3 h-3 text-primary-500"/>}
                  </div>
                </button>
                {openFaq===i && (
                  <div className="px-5 pb-5 bg-white">
                    <p className="text-sm leading-relaxed text-muted-foreground">{f.a}</p>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  )
}
