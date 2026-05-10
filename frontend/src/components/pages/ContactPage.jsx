import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import toast from 'react-hot-toast'
import api from '../../services/api'

const FAQS = [
  { q:'How can I donate to projects?', a:'Click "Donate Now" on any project page. We accept MTN MoMo, Orange Money, PayPal and card.' },
  { q:'Is Nkenkak-Ngiesang a non-profit organisation?', a:'Yes. 100% of donations go directly to approved village projects. We publish quarterly transparency reports.' },
  { q:'How are funds managed?', a:'All funds are managed by the elected village treasurer. Detailed financial reports are available to all registered members.' },
  { q:'Can diaspora members vote on projects?', a:'Yes. Registered members can vote through Community Polls in their member portal.' },
  { q:'How do I join the community team?', a:'Visit the Team page and click "Apply to Join". Choose your preferred team and submit your application.' },
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
        <div className="eyebrow justify-center mb-3" style={{color:'rgba(240,165,0,0.9)'}}>
          <span className="w-5 h-0.5 rounded-full inline-block mr-2" style={{background:'#F0A500'}}/>Get In Touch
        </div>
        <h1 className="font-display font-bold text-4xl text-white mb-3">Contact Us</h1>
        <div className="flex items-center justify-center gap-2 text-sm" style={{color:'rgba(255,255,255,0.6)',fontFamily:'Poppins,sans-serif'}}>
          <Link to="/" className="hover:text-white transition-colors flex items-center gap-1"><i className="fas fa-home text-xs"/>Home</Link>
          <i className="fas fa-chevron-right text-xs" style={{color:'#F0A500'}}/>
          <span style={{color:'#F0A500'}}>Contact Us</span>
        </div>
      </div>

      {/* Contact section */}
      <section className="py-20 bg-white">
        <div className="max-w-6xl mx-auto px-6 grid lg:grid-cols-3 gap-10">
          {/* Info cards */}
          <div className="space-y-4">
            {[
              { icon:'fa-map-marker-alt', title:'Our Location',       lines:['Nkenkak-Ngiesang','West Region, Cameroon'] },
              { icon:'fa-phone-alt',      title:'Phone & WhatsApp',   lines:['+237 6XX XXX XXX','+237 6XX XXX XXX'] },
              { icon:'fa-envelope',       title:'Email Address',      lines:['contact@nkenkak-ngiesang.cm','admin@nkenkak-ngiesang.cm'] },
              { icon:'fa-clock',          title:'Office Hours',       lines:['Mon–Fri: 9am – 5pm','Weekends: By appointment'] },
            ].map(c=>(
              <div key={c.title} className="card p-5 flex gap-4 items-start">
                <div className="w-12 h-12 rounded-2xl flex items-center justify-center flex-shrink-0"
                  style={{background:'linear-gradient(135deg,#5B2D8E,#7B4DB8)'}}>
                  <i className={`fas ${c.icon} text-sm text-white`}/>
                </div>
                <div>
                  <h4 className="font-display font-semibold text-sm mb-1" style={{color:'#1A0A35'}}>{c.title}</h4>
                  {c.lines.map(l=><p key={l} className="text-xs" style={{color:'#737373',fontFamily:'Poppins,sans-serif'}}>{l}</p>)}
                </div>
              </div>
            ))}

            {/* Social */}
            <div className="card p-5">
              <h4 className="font-display font-semibold text-sm mb-3" style={{color:'#1A0A35'}}>Follow Us</h4>
              <div className="flex gap-3">
                {[{ic:'fab fa-facebook-f',c:'#1877F2'},{ic:'fab fa-twitter',c:'#1DA1F2'},{ic:'fab fa-instagram',c:'#E1306C'},{ic:'fab fa-youtube',c:'#FF0000'},{ic:'fab fa-whatsapp',c:'#25D366'}].map(s=>(
                  <a key={s.ic} href="#" className="w-9 h-9 rounded-full flex items-center justify-center text-white text-sm transition-all hover:-translate-y-1" style={{background:s.c}}>
                    <i className={s.ic}/>
                  </a>
                ))}
              </div>
            </div>
          </div>

          {/* Form */}
          <div className="lg:col-span-2">
            <div className="card p-8">
              <div className="eyebrow mb-3">Send a Message</div>
              <h2 className="font-display font-bold text-2xl mb-2" style={{color:'#1A0A35'}}>We'd Love to <span style={{color:'#F0A500'}}>Hear From You</span></h2>
              <p className="text-sm mb-6" style={{color:'#737373',fontFamily:'Poppins,sans-serif'}}>Whether you're a resident, diaspora member, partner or supporter — every message matters.</p>

              {sent ? (
                <div className="rounded-3xl p-10 text-center" style={{background:'rgba(22,163,74,0.04)',border:'1px solid rgba(22,163,74,0.15)'}}>
                  <div className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4" style={{background:'rgba(22,163,74,0.1)'}}>
                    <i className="fas fa-check text-2xl" style={{color:'#16a34a'}}/>
                  </div>
                  <h3 className="font-display font-bold text-xl mb-2" style={{color:'#1A0A35'}}>Message Sent!</h3>
                  <p className="text-sm mb-5" style={{color:'#737373',fontFamily:'Poppins,sans-serif'}}>We'll respond within 48 hours. Thank you for reaching out to Nkenkak-Ngiesang!</p>
                  <button onClick={()=>setSent(false)} className="btn-secondary !text-sm !py-2.5 !px-6">Send Another Message</button>
                </div>
              ) : (
                <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <label className="label">Full Name *</label>
                      <input {...register('name',{required:'Name required'})} placeholder="Your full name" className="input"/>
                      {errors.name && <p className="text-xs mt-1" style={{color:'#dc2626'}}>{errors.name.message}</p>}
                    </div>
                    <div>
                      <label className="label">Email *</label>
                      <input type="email" {...register('email',{required:'Email required',pattern:{value:/\S+@\S+\.\S+/,message:'Invalid email'}})} placeholder="your@email.com" className="input"/>
                      {errors.email && <p className="text-xs mt-1" style={{color:'#dc2626'}}>{errors.email.message}</p>}
                    </div>
                    <div>
                      <label className="label">Phone</label>
                      <input {...register('phone')} placeholder="+237 6XX XXX XXX" className="input"/>
                    </div>
                    <div>
                      <label className="label">Subject *</label>
                      <select {...register('subject',{required:'Subject required'})} className="input">
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
                      {errors.subject && <p className="text-xs mt-1" style={{color:'#dc2626'}}>{errors.subject.message}</p>}
                    </div>
                  </div>
                  <div>
                    <label className="label">Message *</label>
                    <textarea {...register('message',{required:'Message required',minLength:{value:10,message:'At least 10 characters'}})}
                      rows={5} placeholder="How can we help you?" className="input resize-none"/>
                    {errors.message && <p className="text-xs mt-1" style={{color:'#dc2626'}}>{errors.message.message}</p>}
                  </div>
                  <button type="submit" disabled={loading} className="btn-secondary w-full justify-center">
                    {loading?<><i className="fas fa-spinner animate-spin"/>Sending…</>:<><i className="fas fa-paper-plane"/>Send Message</>}
                  </button>
                </form>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="py-20" style={{background:'linear-gradient(135deg,#FBF8F2,#F3EEF9)'}}>
        <div className="max-w-4xl mx-auto px-6">
          <div className="text-center mb-10">
            <div className="eyebrow justify-center mb-3">Got Questions?</div>
            <h2 className="section-title">Frequently Asked <span style={{color:'#F0A500'}}>Questions</span></h2>
          </div>
          <div className="space-y-3">
            {FAQS.map((f,i)=>(
              <div key={i} className={`accordion-item ${openFaq===i?'open':''}`}>
                <button onClick={()=>setOpen(openFaq===i?null:i)}
                  className="w-full flex items-center justify-between px-5 py-4 text-left transition-all"
                  style={{background:openFaq===i?'rgba(91,45,142,0.04)':'#fff'}}>
                  <span className="font-display font-semibold text-sm pr-4" style={{color:openFaq===i?'#5B2D8E':'#1A0A35'}}>{f.q}</span>
                  <div className="w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0 transition-colors"
                    style={{background:openFaq===i?'#5B2D8E':'rgba(91,45,142,0.08)'}}>
                    <i className={`fas fa-${openFaq===i?'minus':'plus'} text-[10px]`} style={{color:openFaq===i?'#fff':'#5B2D8E'}}/>
                  </div>
                </button>
                {openFaq===i && (
                  <div className="px-5 pb-5 animate-fade-in">
                    <p className="text-sm leading-relaxed" style={{color:'#737373',fontFamily:'Poppins,sans-serif'}}>{f.a}</p>
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
