import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useQuery } from 'react-query'
import api from '../../services/api'
import TeamCard from '../common/TeamCard'
import JoinTeamModal from '../common/JoinTeamModal'
import { Home, ChevronRight, Users, HeartHandshake, Sprout, Package, Minus, Plus, UserPlus } from 'lucide-react'

const WHY_US_FAQS = [
  { q:'How Can I Donation Peoples?', a:'Click "Donate Now" from any page. Choose your project, amount and payment method (MTN MoMo, Orange Money, PayPal or card).' },
  { q:'It Service For Business Network?', a:'We Help Companies Develop Powerful Corporate Social Responsibility, Grantmaking, And Employee Engagement Strategies.' },
  { q:'Is This Non Profitable Organization?', a:'Yes. We are a community-driven non-profit. 100% of donations go directly to village development projects.' },
]

const IMG_PLACEHOLDERS = [
  {Icon:HeartHandshake, grad:'linear-gradient(135deg,#250F47,#5B2D8E)', h:'h-48', label:null},
  {Icon:Users,          grad:'linear-gradient(135deg,#3D1A6B,#7B4DB8)', h:'h-48 mt-6', label:null},
  {Icon:Sprout,         grad:'linear-gradient(135deg,#5B2D8E,#9B6FD8)', h:'h-48', label:null},
  {Icon:Package,        grad:'linear-gradient(135deg,#1A0A35,#3D1A6B)', h:'h-48 mt-6', label:'Donation Box'},
]

export default function VolunteersPage() {
  const [openFaq, setOpenFaq] = useState(1)
  const [joinOpen, setJoinOpen] = useState(false)
  const { data: team, isLoading } = useQuery('team-all', () => api.get('/team').then(r => r.data))

  return (
    <div>
      {/* Hero */}
      <div className="page-hero py-20 px-6 text-center">
        <h1 className="font-display font-bold text-4xl text-white mb-3">Our Volunteer's</h1>
        <div className="flex items-center justify-center gap-2 text-sm text-white/60">
          <Link to="/" className="hover:text-white transition-colors flex items-center gap-1"><Home className="w-3 h-3"/>Home</Link>
          <ChevronRight className="w-3 h-3 text-gold"/>
          <span className="text-gold">Our Volunteer's</span>
        </div>
      </div>

      {/* Team grid */}
      <section className="py-20 bg-white">
        <div className="max-w-6xl mx-auto px-6">
          {isLoading ? (
            <div className="grid md:grid-cols-3 gap-8">{[1,2,3,4,5,6].map(i=>(
              <div key={i} className="h-72 rounded-3xl animate-pulse" style={{background:'rgba(91,45,142,0.04)'}}/>
            ))}</div>
          ) : (
            <div className="grid md:grid-cols-3 gap-8">
              {team?.map((m,i) => <TeamCard key={m.id} member={m} index={i}/>)}
              {!team?.length && (
                <div className="col-span-3 text-center py-16">
                  <Users className="w-12 h-12 mx-auto mb-4" style={{color:'rgba(91,45,142,0.2)'}}/>
                  <p className="text-sm text-muted-foreground">No team members yet.</p>
                </div>
              )}
            </div>
          )}
        </div>
      </section>

      {/* Why choose us + FAQ */}
      <section className="py-20" style={{background:'linear-gradient(135deg,#FBF8F2,#F3EEF9)'}}>
        <div className="max-w-6xl mx-auto px-6 grid lg:grid-cols-2 gap-12 items-start">
          {/* Images */}
          <div className="grid grid-cols-2 gap-4">
            {IMG_PLACEHOLDERS.map(({Icon,grad,h,label},i)=>(
              <div key={i} className={`rounded-3xl overflow-hidden ${h} flex items-center justify-center relative`}
                style={{background:grad}}>
                <div className="wave-pattern absolute inset-0"/>
                <Icon className="w-8 h-8 relative z-10" style={{color:'rgba(240,165,0,0.4)'}}/>
                {label && (
                  <div className="absolute bottom-3 left-3 bg-white rounded-xl px-3 py-1.5 shadow-card z-10">
                    <div className="text-xs font-bold text-primary-500" style={{fontFamily:'Sora,sans-serif'}}>{label}</div>
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* Text + FAQ */}
          <div>
            <div className="eyebrow mb-3">Why Choose Us</div>
            <h2 className="section-title mb-4">We Popular To Provide<br/><span>Best Projects</span></h2>
            <p className="text-sm leading-relaxed mb-6 text-muted-foreground">
              We Help Companies Develop Powerful Corporate Social Responsibility, Grantmaking, And Employee Engagement Strategies. Our transparent approach sets us apart.
            </p>
            <div className="space-y-3">
              {WHY_US_FAQS.map((f,i)=>(
                <div key={i} className={`accordion-item ${openFaq===i?'open':''}`}>
                  <button onClick={()=>setOpenFaq(openFaq===i?null:i)}
                    className="w-full flex items-center justify-between px-4 py-3.5 text-left"
                    style={{background:openFaq===i?'rgba(91,45,142,0.04)':'#fff'}}>
                    <span className="font-display font-semibold text-sm pr-3" style={{color:openFaq===i?'#5B2D8E':'#1A0A35'}}>{f.q}</span>
                    <div className="w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0"
                      style={{background:openFaq===i?'#5B2D8E':'rgba(91,45,142,0.08)'}}>
                      {openFaq===i
                        ? <Minus className="w-2.5 h-2.5" style={{color:'#fff'}}/>
                        : <Plus className="w-2.5 h-2.5" style={{color:'#5B2D8E'}}/>}
                    </div>
                  </button>
                  {openFaq===i && (
                    <div className="px-4 pb-4 animate-fade-in">
                      <p className="text-sm leading-relaxed text-muted-foreground">{f.a}</p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Join CTA */}
      <section className="py-16 text-center" style={{background:'linear-gradient(135deg,#250F47,#5B2D8E)'}}>
        <div className="wave-pattern absolute inset-0 pointer-events-none"/>
        <div className="relative max-w-xl mx-auto px-6">
          <div className="eyebrow justify-center mb-3 text-white" style={{color:'rgba(255,255,255,0.7)'}}>
            <span className="w-5 h-0.5 bg-gold-400 inline-block mr-2" style={{background:'#F0A500'}}/>Join Now
          </div>
          <h3 className="font-display font-bold text-2xl text-white mb-3">Become a Volunteer</h3>
          <p className="text-sm mb-6" style={{color:'rgba(255,255,255,0.7)',fontFamily:'Poppins,sans-serif'}}>Your skills and time can change lives in Nkenkak-Ngiesang. Apply today.</p>
          <button onClick={()=>setJoinOpen(true)} className="btn-gold">
            <UserPlus className="w-4 h-4"/>Apply Now
          </button>
        </div>
      </section>

      {joinOpen && <JoinTeamModal onClose={()=>setJoinOpen(false)}/>}
    </div>
  )
}
