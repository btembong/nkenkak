import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { useMutation } from 'react-query'
import toast from 'react-hot-toast'
import api from '../../services/api'

function Section({ title, sub, icon, children }) {
  return (
    <div className="card p-6 mb-5">
      <div className="flex items-center gap-3 mb-5 pb-4 border-b" style={{borderColor:'rgba(91,45,142,0.08)'}}>
        <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{background:'linear-gradient(135deg,#5B2D8E,#7B4DB8)'}}>
          <i className={`fas ${icon} text-sm text-white`}/>
        </div>
        <div>
          <h3 className="font-display font-semibold text-base" style={{color:'#1A0A35'}}>{title}</h3>
          {sub && <p className="text-xs" style={{color:'#A3A3A3',fontFamily:'Poppins,sans-serif'}}>{sub}</p>}
        </div>
      </div>
      {children}
    </div>
  )
}

function Toggle({ label, sub, value, onChange }) {
  return (
    <div className="flex items-center justify-between py-3 border-b last:border-0" style={{borderColor:'rgba(91,45,142,0.05)'}}>
      <div>
        <div className="text-sm font-medium" style={{color:'#1A0A35',fontFamily:'Poppins,sans-serif'}}>{label}</div>
        {sub && <div className="text-xs" style={{color:'#A3A3A3',fontFamily:'Poppins,sans-serif'}}>{sub}</div>}
      </div>
      <button onClick={() => onChange(!value)}
        className="w-12 h-6 rounded-full transition-all flex items-center flex-shrink-0"
        style={{background: value ? '#5B2D8E' : 'rgba(91,45,142,0.15)', padding:'2px'}}>
        <div className="w-5 h-5 rounded-full bg-white shadow-sm transition-transform"
          style={{transform: value ? 'translateX(24px)' : 'translateX(0)'}}/>
      </button>
    </div>
  )
}

export default function AdminSettings() {
  const [saved, setSaved] = useState(false)
  const { register, handleSubmit } = useForm({
    defaultValues: {
      site_name: 'Nkenkak-Ngiesang',
      tagline: 'Lend a Helping Hand To Those Who Need It',
      email: 'contact@nkenkak-ngiesang.cm',
      phone: '+237 6XX XXX XXX',
      address: 'West Region, Cameroon',
      facebook: '',
      twitter: '',
      instagram: '',
      youtube: '',
      whatsapp: '',
      currency: 'XAF',
      goal_amount: '50000000',
      meta_description: 'Nkenkak-Ngiesang is a village community platform in Cameroon dedicated to heritage, development and diaspora connection.',
    }
  })

  const [toggles, setToggles] = useState({
    donations_enabled: true,
    forum_enabled: true,
    gallery_uploads: true,
    newsletter_enabled: true,
    maintenance_mode: false,
    email_notifications: true,
    require_email_verify: false,
    public_diaspora_map: true,
    show_donor_names: true,
    allow_anonymous_donations: true,
  })

  const setToggle = (key) => (val) => setToggles(t => ({ ...t, [key]: val }))

  const onSave = (data) => {
    // In production: api.post('/admin/settings', { ...data, ...toggles })
    toast.success('Settings saved successfully!')
    setSaved(true)
    setTimeout(() => setSaved(false), 3000)
  }

  return (
    <div className="max-w-3xl">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl flex items-center justify-center" style={{background:'linear-gradient(135deg,#5B2D8E,#7B4DB8)'}}>
            <i className="fas fa-cog text-sm text-white"/>
          </div>
          <div>
            <h2 className="font-display font-bold text-xl" style={{color:'#1A0A35'}}>Site Settings</h2>
            <p className="text-xs" style={{color:'#A3A3A3',fontFamily:'Poppins,sans-serif'}}>Configure your community platform</p>
          </div>
        </div>
        <button onClick={handleSubmit(onSave)}
          className="btn-secondary !py-2 !px-5 !text-sm flex items-center gap-2">
          {saved ? <><i className="fas fa-check"/>Saved!</> : <><i className="fas fa-save"/>Save All Changes</>}
        </button>
      </div>

      <form onSubmit={handleSubmit(onSave)} className="space-y-5">
        {/* General */}
        <Section title="General Information" sub="Basic site identity and contact details" icon="fa-info-circle">
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="label">Site Name</label>
                <input {...register('site_name')} className="input"/>
              </div>
              <div>
                <label className="label">Currency</label>
                <select {...register('currency')} className="input">
                  <option value="XAF">XAF — CFA Franc</option>
                  <option value="USD">USD — US Dollar</option>
                  <option value="EUR">EUR — Euro</option>
                  <option value="GBP">GBP — British Pound</option>
                </select>
              </div>
            </div>
            <div>
              <label className="label">Tagline</label>
              <input {...register('tagline')} className="input"/>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="label">Contact Email</label>
                <input type="email" {...register('email')} className="input"/>
              </div>
              <div>
                <label className="label">Phone / WhatsApp</label>
                <input {...register('phone')} className="input"/>
              </div>
            </div>
            <div>
              <label className="label">Address</label>
              <input {...register('address')} className="input"/>
            </div>
            <div>
              <label className="label">Meta Description (SEO)</label>
              <textarea {...register('meta_description')} rows={2} className="input resize-none"/>
            </div>
          </div>
        </Section>

        {/* Social media */}
        <Section title="Social Media Links" sub="Links shown in footer and contact page" icon="fa-share-alt">
          <div className="grid grid-cols-2 gap-4">
            {[
              {name:'facebook',  icon:'fab fa-facebook-f',   placeholder:'https://facebook.com/…'},
              {name:'twitter',   icon:'fab fa-twitter',       placeholder:'https://twitter.com/…'},
              {name:'instagram', icon:'fab fa-instagram',     placeholder:'https://instagram.com/…'},
              {name:'youtube',   icon:'fab fa-youtube',       placeholder:'https://youtube.com/…'},
              {name:'whatsapp',  icon:'fab fa-whatsapp',      placeholder:'+237 6XX XXX XXX'},
            ].map(s => (
              <div key={s.name}>
                <label className="label capitalize">{s.name}</label>
                <div className="relative">
                  <i className={`${s.icon} absolute left-3.5 top-1/2 -translate-y-1/2 text-sm`} style={{color:'rgba(91,45,142,0.4)'}}/>
                  <input {...register(s.name)} placeholder={s.placeholder} className="input !pl-10"/>
                </div>
              </div>
            ))}
          </div>
        </Section>

        {/* Fundraising */}
        <Section title="Fundraising" sub="Overall campaign goal and donation settings" icon="fa-coins">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="label">Overall Campaign Goal (XAF)</label>
              <input type="number" {...register('goal_amount')} className="input"/>
            </div>
            <div>
              <label className="label">Minimum Donation (XAF)</label>
              <input type="number" defaultValue="500" className="input"/>
            </div>
          </div>
        </Section>

        {/* Feature toggles */}
        <Section title="Feature Toggles" sub="Enable or disable platform features" icon="fa-toggle-on">
          <Toggle label="Donations Enabled"        sub="Allow visitors to make donations"          value={toggles.donations_enabled}      onChange={setToggle('donations_enabled')}/>
          <Toggle label="Community Forum"          sub="Allow members to post and reply"           value={toggles.forum_enabled}          onChange={setToggle('forum_enabled')}/>
          <Toggle label="Gallery Uploads"          sub="Allow members to upload photos"            value={toggles.gallery_uploads}        onChange={setToggle('gallery_uploads')}/>
          <Toggle label="Newsletter Subscription"  sub="Show newsletter sign-up form"              value={toggles.newsletter_enabled}     onChange={setToggle('newsletter_enabled')}/>
          <Toggle label="Public Diaspora Map"      sub="Show community member locations publicly"  value={toggles.public_diaspora_map}    onChange={setToggle('public_diaspora_map')}/>
          <Toggle label="Show Donor Names"         sub="Display donor names on project pages"      value={toggles.show_donor_names}       onChange={setToggle('show_donor_names')}/>
          <Toggle label="Anonymous Donations"      sub="Allow donations without account"           value={toggles.allow_anonymous_donations} onChange={setToggle('allow_anonymous_donations')}/>
          <Toggle label="Email Notifications"      sub="Send email alerts for new events/news"     value={toggles.email_notifications}    onChange={setToggle('email_notifications')}/>
          <Toggle label="Require Email Verification" sub="New accounts must verify email"         value={toggles.require_email_verify}   onChange={setToggle('require_email_verify')}/>
          <Toggle label="Maintenance Mode"         sub="Show maintenance page to visitors"        value={toggles.maintenance_mode}       onChange={setToggle('maintenance_mode')}/>
        </Section>

        {/* Email (SMTP) */}
        <Section title="Email Configuration (SMTP)" sub="Configure outgoing email for receipts and notifications" icon="fa-envelope">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="label">SMTP Host</label>
              <input defaultValue="smtp.gmail.com" className="input" placeholder="smtp.gmail.com"/>
            </div>
            <div>
              <label className="label">SMTP Port</label>
              <input defaultValue="587" type="number" className="input"/>
            </div>
            <div>
              <label className="label">SMTP Username (Email)</label>
              <input type="email" className="input" placeholder="your@gmail.com"/>
            </div>
            <div>
              <label className="label">SMTP Password / App Password</label>
              <input type="password" className="input" placeholder="••••••••••••"/>
            </div>
            <div>
              <label className="label">From Name</label>
              <input defaultValue="Nkenkak-Ngiesang" className="input"/>
            </div>
            <div>
              <label className="label">From Email</label>
              <input type="email" defaultValue="noreply@nkenkak-ngiesang.cm" className="input"/>
            </div>
          </div>
          <div className="mt-4 p-3 rounded-xl text-xs" style={{background:'rgba(240,165,0,0.06)',border:'1px solid rgba(240,165,0,0.15)',color:'#737373',fontFamily:'Poppins,sans-serif'}}>
            <i className="fas fa-info-circle mr-1.5" style={{color:'#F0A500'}}/>
            For Gmail: enable 2FA → Google Account → Security → App Passwords → generate one for "Mail".
          </div>
        </Section>

        {/* Danger zone */}
        <div className="card p-6 border-2" style={{borderColor:'rgba(220,38,38,0.15)'}}>
          <div className="flex items-center gap-3 mb-4">
            <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{background:'rgba(220,38,38,0.1)'}}>
              <i className="fas fa-exclamation-triangle text-sm" style={{color:'#dc2626'}}/>
            </div>
            <div>
              <h3 className="font-display font-semibold text-base" style={{color:'#dc2626'}}>Danger Zone</h3>
              <p className="text-xs" style={{color:'#A3A3A3',fontFamily:'Poppins,sans-serif'}}>Irreversible actions — proceed with caution</p>
            </div>
          </div>
          <div className="space-y-3">
            {[
              { label:'Export All Data', sub:'Download a full backup of all platform data as JSON', icon:'fa-download', color:'#0284c7', onClick:() => toast('Export feature coming soon') },
              { label:'Clear All Notifications', sub:'Delete all system notifications for all users', icon:'fa-bell-slash', color:'#C87800', onClick:() => toast.error('Confirm in production') },
              { label:'Reset Demo Data', sub:'Remove seed data and start fresh', icon:'fa-trash-alt', color:'#dc2626', onClick:() => toast.error('Disabled in this environment') },
            ].map(a => (
              <div key={a.label} className="flex items-center justify-between p-4 rounded-2xl" style={{background:'rgba(220,38,38,0.02)',border:'1px solid rgba(220,38,38,0.08)'}}>
                <div>
                  <div className="font-semibold text-sm" style={{color:'#1A0A35',fontFamily:'Sora,sans-serif'}}>{a.label}</div>
                  <div className="text-xs" style={{color:'#A3A3A3',fontFamily:'Poppins,sans-serif'}}>{a.sub}</div>
                </div>
                <button onClick={a.onClick}
                  className="flex items-center gap-1.5 text-xs font-semibold px-4 py-2 rounded-xl transition-all flex-shrink-0 ml-4"
                  style={{color:a.color, background:`${a.color}12`, fontFamily:'Sora,sans-serif'}}>
                  <i className={`fas ${a.icon} text-[10px]`}/>{a.label}
                </button>
              </div>
            ))}
          </div>
        </div>

        <div className="flex justify-end pb-4">
          <button type="submit"
            className="btn-secondary !py-3 !px-8 !text-sm">
            {saved ? <><i className="fas fa-check"/>Saved!</> : <><i className="fas fa-save"/>Save All Settings</>}
          </button>
        </div>
      </form>
    </div>
  )
}
