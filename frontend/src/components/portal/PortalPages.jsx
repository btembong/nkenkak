import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from 'react-query'
import { useForm } from 'react-hook-form'
import { format } from 'date-fns'
import toast from 'react-hot-toast'
import { Link } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import api from '../../services/api'
/*import bcrypt from 'bcryptjs' // not needed; just use the endpoint*/

/* ─── Shared page header ─── */
function PageHeader({ title, sub, icon }) {
  return (
    <div className="mb-8">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-2xl flex items-center justify-center"
          style={{background:'linear-gradient(135deg,#5B2D8E,#7B4DB8)'}}>
          <i className={`fas ${icon} text-sm text-white`}/>
        </div>
        <div>
          <h1 className="font-display font-bold text-2xl" style={{color:'#1A0A35'}}>{title}</h1>
          {sub && <p className="text-sm" style={{color:'#737373',fontFamily:'Poppins,sans-serif'}}>{sub}</p>}
        </div>
      </div>
    </div>
  )
}

/* ─── Stat mini card ─── */
function MiniStat({ icon, label, value, color='#5B2D8E', bg='rgba(91,45,142,0.08)' }) {
  return (
    <div className="stat-card">
      <div className="w-11 h-11 rounded-2xl flex items-center justify-center mb-3" style={{background:bg}}>
        <i className={`fas ${icon} text-lg`} style={{color}}/>
      </div>
      <div className="font-display font-bold text-2xl" style={{color:'#1A0A35'}}>{value}</div>
      <div className="text-xs mt-0.5" style={{color:'#A3A3A3',fontFamily:'Poppins,sans-serif'}}>{label}</div>
    </div>
  )
}

/* ══════════════════════════════════════════════
   PORTAL DASHBOARD
══════════════════════════════════════════════ */
export function PortalDashboard() {
  const { user } = useAuth()
  const { data: donations } = useQuery('my-donations',
    () => api.get('/donations/my').then(r => r.data))
  const { data: notifs } = useQuery('my-notifs',
    () => api.get('/notifications').then(r => r.data))

  const totalGiven = donations?.filter(d=>d.status==='completed').reduce((s,d)=>s+(+d.amount),0)||0
  const unread     = notifs?.filter(n=>!n.isRead).length||0

  return (
    <div>
      {/* Welcome banner */}
      <div className="rounded-3xl p-8 mb-8 relative overflow-hidden"
        style={{background:'linear-gradient(135deg,#250F47,#5B2D8E)'}}>
        <div className="wave-pattern absolute inset-0"/>
        <div className="relative flex flex-col md:flex-row items-start md:items-center justify-between gap-5">
          <div>
            <div className="text-xs font-semibold uppercase tracking-widest mb-1" style={{color:'rgba(240,165,0,0.8)',fontFamily:'Sora,sans-serif'}}>Welcome Back</div>
            <h2 className="font-display font-bold text-2xl text-white mb-1">Hello, {user?.firstName}! 🌿</h2>
            <p className="text-sm" style={{color:'rgba(255,255,255,0.65)',fontFamily:'Poppins,sans-serif'}}>Thank you for being a part of Nkenkak-Ngiesang. Your support changes lives.</p>
          </div>
          <div className="flex gap-3 flex-wrap">
            <Link to="/projects" className="btn-gold !py-2.5 !px-5 !text-xs">
              <i className="fas fa-seedling text-[10px]"/>Explore Projects
            </Link>
            <Link to="/forum" className="btn-outline-white !py-2.5 !px-5 !text-xs">
              <i className="fas fa-comments text-[10px]"/>Community Forum
            </Link>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4 mb-8">
        <MiniStat icon="fa-heart"  label="Donations Made"  value={donations?.filter(d=>d.status==='completed').length||0}/>
        <MiniStat icon="fa-coins"  label="XAF Contributed" value={totalGiven.toLocaleString()} color="#F0A500" bg="rgba(240,165,0,0.1)"/>
        <MiniStat icon="fa-bell"   label="Unread Notifs"   value={unread} color="#dc2626" bg="rgba(220,38,38,0.08)"/>
      </div>

      {/* Recent donations */}
      <div className="grid lg:grid-cols-2 gap-6">
        <div className="card">
          <div className="p-5 border-b flex items-center justify-between" style={{borderColor:'rgba(91,45,142,0.06)'}}>
            <h3 className="font-display font-semibold" style={{color:'#1A0A35'}}>Recent Donations</h3>
            <Link to="/portal/donations" className="text-xs font-semibold hover:underline" style={{color:'#5B2D8E',fontFamily:'Sora,sans-serif'}}>View All →</Link>
          </div>
          <div className="divide-y" style={{divideColor:'rgba(91,45,142,0.05)'}}>
            {donations?.slice(0,4).map(d=>(
              <div key={d.id} className="flex items-center gap-3 px-5 py-3.5">
                <div className="w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0"
                  style={{background:'rgba(91,45,142,0.08)'}}>
                  <i className="fas fa-heart text-xs" style={{color:'#5B2D8E'}}/>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-semibold truncate" style={{color:'#1A0A35',fontFamily:'Sora,sans-serif'}}>{d.project_title||'General Fund'}</div>
                  <div className="text-xs" style={{color:'#A3A3A3',fontFamily:'Poppins,sans-serif'}}>{format(new Date(d.createdAt),'MMM d, yyyy')}</div>
                </div>
                <div className="text-right">
                  <div className="font-display font-bold text-sm" style={{color:'#1A0A35'}}>{Number(d.amount).toLocaleString()} <span className="text-xs font-normal" style={{color:'#A3A3A3'}}>XAF</span></div>
                  <span className="text-[10px] font-bold" style={{color:d.status==='completed'?'#16a34a':d.status==='pending'?'#C87800':'#dc2626'}}>{d.status}</span>
                </div>
              </div>
            ))}
            {!donations?.length && (
              <div className="py-10 text-center">
                <i className="fas fa-heart text-3xl mb-2 block" style={{color:'rgba(91,45,142,0.15)'}}/>
                <p className="text-sm" style={{color:'#A3A3A3',fontFamily:'Poppins,sans-serif'}}>No donations yet —&nbsp;
                  <Link to="/projects" className="hover:underline font-semibold" style={{color:'#5B2D8E'}}>support a project</Link>
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Recent notifications */}
        <div className="card">
          <div className="p-5 border-b flex items-center justify-between" style={{borderColor:'rgba(91,45,142,0.06)'}}>
            <h3 className="font-display font-semibold" style={{color:'#1A0A35'}}>Notifications</h3>
            <Link to="/portal/notifications" className="text-xs font-semibold hover:underline" style={{color:'#5B2D8E',fontFamily:'Sora,sans-serif'}}>View All →</Link>
          </div>
          <div className="divide-y" style={{divideColor:'rgba(91,45,142,0.05)'}}>
            {notifs?.slice(0,4).map(n=>(
              <div key={n.id} className={`flex gap-3 px-5 py-3.5 ${!n.isRead?'bg-primary-50/30':''}`}>
                <div className={`w-2 h-2 rounded-full mt-1.5 flex-shrink-0 ${n.isRead?'bg-neutral-200':'bg-primary-500'}`}/>
                <div className="flex-1">
                  <div className="text-sm font-semibold" style={{color:'#1A0A35',fontFamily:'Sora,sans-serif'}}>{n.title}</div>
                  <div className="text-xs mt-0.5 line-clamp-1" style={{color:'#737373',fontFamily:'Poppins,sans-serif'}}>{n.message}</div>
                  <div className="text-[10px] mt-1" style={{color:'#A3A3A3',fontFamily:'Poppins,sans-serif'}}>{format(new Date(n.createdAt),'MMM d, yyyy · h:mm a')}</div>
                </div>
              </div>
            ))}
            {!notifs?.length && (
              <div className="py-10 text-center">
                <i className="fas fa-bell text-3xl mb-2 block" style={{color:'rgba(91,45,142,0.15)'}}/>
                <p className="text-sm" style={{color:'#A3A3A3',fontFamily:'Poppins,sans-serif'}}>All caught up!</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

/* ══════════════════════════════════════════════
   PORTAL PROFILE
══════════════════════════════════════════════ */
export function PortalProfile() {
  const { user, loadUser } = useAuth()
  const [pwForm, setPwForm] = useState(false)
  const { register, handleSubmit, formState:{isDirty} } = useForm({ defaultValues:user||{} })
  const { register:regPw, handleSubmit:handlePw, reset:resetPw } = useForm()

  const updateMut = useMutation(data=>api.patch('/users/profile',data),{
    onSuccess:()=>{ toast.success('Profile updated!'); loadUser() }
  })
  const pwMut = useMutation(data=>api.patch('/users/change-password',data),{
    onSuccess:()=>{ toast.success('Password changed!'); setPwForm(false); resetPw() },
    onError:(e)=>toast.error(e.response?.data?.error||'Failed')
  })

  return (
    <div className="max-w-2xl">
      <PageHeader title="My Profile" sub="Manage your personal information" icon="fa-user"/>

      {/* Avatar + name header */}
      <div className="card p-6 mb-5 flex items-center gap-5">
        <div className="w-16 h-16 rounded-2xl flex items-center justify-center text-white font-bold text-xl flex-shrink-0"
          style={{background:'linear-gradient(135deg,#5B2D8E,#7B4DB8)'}}>
          {user?.firstName?.[0]}{user?.lastName?.[0]}
        </div>
        <div>
          <div className="font-display font-bold text-lg" style={{color:'#1A0A35'}}>{user?.firstName} {user?.lastName}</div>
          <div className="text-sm capitalize" style={{color:'#5B2D8E',fontFamily:'Poppins,sans-serif'}}>{user?.role}</div>
          <div className="text-xs" style={{color:'#A3A3A3',fontFamily:'Poppins,sans-serif'}}>{user?.email}</div>
        </div>
      </div>

      {/* Edit form */}
      <form onSubmit={handleSubmit(d=>updateMut.mutate(d))} className="card p-6 mb-5 space-y-5">
        <h3 className="font-display font-semibold border-b pb-3" style={{color:'#1A0A35',borderColor:'rgba(91,45,142,0.08)'}}>Personal Information</h3>
        <div className="grid grid-cols-2 gap-4">
          <div><label className="label">First Name</label><input {...register('first_name')} className="input"/></div>
          <div><label className="label">Last Name</label><input {...register('last_name')} className="input"/></div>
          <div><label className="label">Phone</label><input {...register('phone')} className="input"/></div>
          <div><label className="label">Country</label><input {...register('country')} className="input"/></div>
          <div><label className="label">City</label><input {...register('city')} className="input"/></div>
          <div><label className="label">Village Quarter</label><input {...register('village_quarter')} className="input"/></div>
        </div>
        <div><label className="label">Bio</label><textarea {...register('bio')} rows={3} className="input resize-none"/></div>
        <div className="flex flex-col gap-2">
          <label className="flex items-center gap-3 cursor-pointer">
            <input type="checkbox" {...register('is_diaspora')} className="w-4 h-4 rounded accent-primary-500"/>
            <span className="text-sm" style={{color:'#525252',fontFamily:'Poppins,sans-serif'}}>I am a diaspora member</span>
          </label>
          <label className="flex items-center gap-3 cursor-pointer">
            <input type="checkbox" {...register('newsletter')} className="w-4 h-4 rounded accent-primary-500"/>
            <span className="text-sm" style={{color:'#525252',fontFamily:'Poppins,sans-serif'}}>Subscribe to newsletter</span>
          </label>
        </div>
        <button type="submit" disabled={updateMut.isLoading} className="btn-secondary !py-2.5 !text-sm">
          {updateMut.isLoading?<><i className="fas fa-spinner animate-spin"/>Saving…</>:<><i className="fas fa-save"/>Save Changes</>}
        </button>
      </form>

      {/* Change password */}
      <div className="card p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-display font-semibold" style={{color:'#1A0A35'}}>Security</h3>
          <button onClick={()=>setPwForm(!pwForm)} className="text-xs font-semibold hover:underline" style={{color:'#5B2D8E',fontFamily:'Sora,sans-serif'}}>
            {pwForm?'Cancel':'Change Password'}
          </button>
        </div>
        {pwForm ? (
          <form onSubmit={handlePw(d=>pwMut.mutate(d))} className="space-y-4">
            <div><label className="label">Current Password</label><input type="password" {...regPw('current_password',{required:true})} className="input"/></div>
            <div><label className="label">New Password</label><input type="password" {...regPw('new_password',{required:true,minLength:{value:8,message:'Min 8 characters'}})} className="input"/></div>
            <button type="submit" disabled={pwMut.isLoading} className="btn-secondary !py-2.5 !text-sm">
              {pwMut.isLoading?<><i className="fas fa-spinner animate-spin"/>Updating…</>:<><i className="fas fa-lock"/>Update Password</>}
            </button>
          </form>
        ) : (
          <p className="text-sm" style={{color:'#A3A3A3',fontFamily:'Poppins,sans-serif'}}>Your account is secured with a password.</p>
        )}
      </div>
    </div>
  )
}

/* ══════════════════════════════════════════════
   PORTAL DONATIONS
══════════════════════════════════════════════ */
export function PortalDonations() {
  const { data, isLoading } = useQuery('my-donations', ()=>api.get('/donations/my').then(r=>r.data))
  const total = data?.filter(d=>d.status==='completed').reduce((s,d)=>s+(+d.amount),0)||0

  const printReceipt = (d) => {
    const win = window.open('','_blank','width=700,height=600')
    win.document.write(`
      <html><head><title>Donation Receipt</title>
      <style>
        body{font-family:Arial,sans-serif;padding:40px;color:#1A0A35;max-width:600px;margin:0 auto}
        h1{color:#5B2D8E;font-size:24px;margin-bottom:4px}
        .sub{color:#737373;font-size:13px;margin-bottom:32px}
        table{width:100%;border-collapse:collapse;margin:20px 0}
        td{padding:10px 0;border-bottom:1px solid #f0f0f0;font-size:14px}
        td:first-child{color:#737373;width:160px}
        td:last-child{font-weight:600}
        .badge{display:inline-block;padding:4px 12px;border-radius:20px;font-size:12px;font-weight:700;background:rgba(22,163,74,0.1);color:#16a34a}
        .footer{margin-top:40px;padding-top:20px;border-top:1px solid #f0f0f0;font-size:12px;color:#A3A3A3;text-align:center}
        @media print{button{display:none}}
      </style></head><body>
      <h1>Donation Receipt</h1>
      <div class="sub">Nkenkak-Ngiesang Community Foundation</div>
      <table>
        <tr><td>Reference</td><td>${d.reference}</td></tr>
        <tr><td>Project</td><td>${d.project_title||'General Fund'}</td></tr>
        <tr><td>Amount</td><td>${Number(d.amount).toLocaleString()} XAF</td></tr>
        <tr><td>Method</td><td>${(d.provider||'').replace(/_/g,' ')}</td></tr>
        <tr><td>Status</td><td><span class="badge">${d.status}</span></td></tr>
        <tr><td>Date</td><td>${new Date(d.createdAt).toLocaleDateString('en-GB',{day:'numeric',month:'long',year:'numeric'})}</td></tr>
      </table>
      <p style="font-size:13px;color:#525252">Thank you for your generous contribution to the Nkenkak-Ngiesang community. Your support makes a real difference.</p>
      <div class="footer">nkenkak-ngiesang.cm &bull; contact@nkenkak-ngiesang.cm</div>
      <br/><button onclick="window.print()" style="padding:10px 24px;background:#5B2D8E;color:white;border:none;border-radius:8px;cursor:pointer;font-size:14px">Print Receipt</button>
      </body></html>
    `)
    win.document.close()
  }

  return (
    <div>
      <PageHeader title="My Donations" sub="Your contribution history" icon="fa-heart"/>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4 mb-8">
        <MiniStat icon="fa-check-circle" label="Completed"   value={data?.filter(d=>d.status==='completed').length||0} color="#16a34a" bg="rgba(22,163,74,0.08)"/>
        <MiniStat icon="fa-coins"        label="XAF Total"   value={total.toLocaleString()} color="#F0A500" bg="rgba(240,165,0,0.1)"/>
        <MiniStat icon="fa-clock"        label="Pending"     value={data?.filter(d=>d.status==='pending').length||0}   color="#C87800" bg="rgba(240,165,0,0.08)"/>
      </div>

      <div className="card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead style={{background:'rgba(91,45,142,0.04)'}}>
              <tr>
                {['Reference','Project','Amount','Method','Status','Date',''].map(h=>(
                  <th key={h} className="text-left px-5 py-3.5 text-xs font-bold uppercase tracking-widest" style={{color:'#5B2D8E',fontFamily:'Sora,sans-serif'}}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {isLoading ? [1,2,3].map(i=>(
                <tr key={i}><td colSpan={7} className="px-5 py-4"><div className="h-4 rounded-xl animate-pulse" style={{background:'rgba(91,45,142,0.05)'}}/></td></tr>
              )) : data?.map(d=>(
                <tr key={d.id} className="table-row">
                  <td className="px-5 py-3.5 font-mono text-xs" style={{color:'#737373'}}>{d.reference}</td>
                  <td className="px-5 py-3.5 text-sm" style={{color:'#525252',fontFamily:'Poppins,sans-serif'}}>{d.project_title||'General Fund'}</td>
                  <td className="px-5 py-3.5 font-display font-bold text-sm" style={{color:'#1A0A35'}}>{Number(d.amount).toLocaleString()} <span className="text-xs font-normal" style={{color:'#A3A3A3'}}>XAF</span></td>
                  <td className="px-5 py-3.5 text-xs capitalize" style={{color:'#737373',fontFamily:'Poppins,sans-serif'}}>{d.provider?.replace(/_/g,' ')}</td>
                  <td className="px-5 py-3.5"><span className="badge" style={{background:d.status==='completed'?'rgba(22,163,74,0.1)':d.status==='pending'?'rgba(240,165,0,0.1)':'rgba(220,38,38,0.1)', color:d.status==='completed'?'#16a34a':d.status==='pending'?'#C87800':'#dc2626'}}>{d.status}</span></td>
                  <td className="px-5 py-3.5 text-xs" style={{color:'#A3A3A3',fontFamily:'Poppins,sans-serif'}}>{format(new Date(d.createdAt),'MMM d, yyyy')}</td>
                  <td className="px-5 py-3.5">
                    {d.status==='completed' && (
                      <button onClick={()=>printReceipt(d)} title="Print receipt"
                        className="w-8 h-8 rounded-xl flex items-center justify-center transition-colors hover:bg-primary-50"
                        style={{color:'#5B2D8E'}}>
                        <i className="fas fa-print text-xs"/>
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {!data?.length && !isLoading && (
            <div className="text-center py-12">
              <i className="fas fa-heart text-4xl mb-3 block" style={{color:'rgba(91,45,142,0.15)'}}/>
              <p className="text-sm" style={{color:'#A3A3A3',fontFamily:'Poppins,sans-serif'}}>No donations yet</p>
              <Link to="/projects" className="btn-secondary !text-sm !py-2 !px-5 mt-3 inline-flex">Support a Project</Link>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

/* ══════════════════════════════════════════════
   PORTAL EVENT REGISTRATIONS
══════════════════════════════════════════════ */
export function PortalEvents() {
  const { data, isLoading } = useQuery('my-event-regs', ()=>api.get('/events/my-registrations').then(r=>r.data))
  const upcoming = data?.filter(r=>r.event?.startDate && new Date(r.event.startDate) > new Date() && r.status!=='cancelled')||[]
  const past     = data?.filter(r=>r.event?.startDate && new Date(r.event.startDate) <= new Date() && r.status!=='cancelled')||[]

  const CAT_COLORS = {culture:'#5B2D8E',education:'#F0A500',health:'#dc2626',sport:'#16a34a',community:'#0284c7',fundraiser:'#d97706',governance:'#374151'}

  const printTicket = (r) => {
    const e = r.event
    const d = e?.startDate ? new Date(e.startDate) : null
    const win = window.open('','_blank','width=700,height=600')
    win.document.write(`
      <html><head><title>Event Ticket</title>
      <style>
        body{font-family:Arial,sans-serif;padding:40px;color:#1A0A35;max-width:520px;margin:0 auto}
        .header{background:linear-gradient(135deg,#250F47,#5B2D8E);color:white;padding:24px;border-radius:16px 16px 0 0;text-align:center}
        .header h2{margin:0;font-size:20px}
        .header p{margin:4px 0 0;opacity:.7;font-size:13px}
        .body{background:#f9f6ff;padding:24px;border-radius:0 0 16px 16px;border:1px solid rgba(91,45,142,0.1)}
        table{width:100%;border-collapse:collapse;margin:16px 0}
        td{padding:8px 0;font-size:14px;border-bottom:1px solid rgba(91,45,142,0.08)}
        td:first-child{color:#737373;width:140px}
        .ref{font-size:22px;font-weight:700;color:#5B2D8E;letter-spacing:3px;text-align:center;margin:16px 0;padding:12px;background:white;border-radius:8px;border:1px dashed rgba(91,45,142,0.2)}
        @media print{button{display:none}}
      </style></head><body>
      <div class="header"><h2>${e?.title||'Event'}</h2><p>Event Ticket — Nkenkak-Ngiesang</p></div>
      <div class="body">
        <div class="ref">${r.ticketRef}</div>
        <table>
          <tr><td>Name</td><td>${r.name}</td></tr>
          <tr><td>Email</td><td>${r.email}</td></tr>
          ${d?`<tr><td>Date</td><td>${d.toLocaleDateString('en-GB',{weekday:'long',day:'numeric',month:'long',year:'numeric'})}</td></tr>`:''}
          ${d?`<tr><td>Time</td><td>${d.toLocaleTimeString('en-GB',{hour:'2-digit',minute:'2-digit'})}</td></tr>`:''}
          ${e?.venue?`<tr><td>Venue</td><td>${e.venue}</td></tr>`:''}
          <tr><td>Status</td><td>${r.status}</td></tr>
          ${r.isPaid?`<tr><td>Amount Paid</td><td>${Number(r.amount||0).toLocaleString()} XAF</td></tr>`:'<tr><td>Admission</td><td>Free</td></tr>'}
        </table>
        <p style="font-size:12px;color:#A3A3A3;text-align:center">Please present this ticket at the event entrance.</p>
      </div>
      <br/><button onclick="window.print()" style="padding:10px 24px;background:#5B2D8E;color:white;border:none;border-radius:8px;cursor:pointer;font-size:14px">Print Ticket</button>
      </body></html>
    `)
    win.document.close()
  }

  const RegistrationCard = ({ r }) => {
    const e = r.event
    const d = e?.startDate ? new Date(e.startDate) : null
    const color = CAT_COLORS[e?.category]||'#5B2D8E'
    return (
      <div className="card p-5 flex items-start gap-4">
        {d && (
          <div className="bg-white rounded-2xl px-3 py-2.5 text-center shadow-card flex-shrink-0" style={{border:`1px solid ${color}20`,minWidth:60}}>
            <div className="font-display font-bold text-xl leading-none" style={{color:'#1A0A35'}}>{format(d,'d')}</div>
            <div className="text-[9px] uppercase tracking-wider font-semibold mt-0.5" style={{color}}>{format(d,'MMM')}</div>
            <div className="text-[9px]" style={{color:'#A3A3A3'}}>{format(d,'yyyy')}</div>
          </div>
        )}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1 flex-wrap">
            {e?.category && <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full text-white" style={{background:color}}>{e.category}</span>}
            {r.isPaid ? <span className="text-[10px] font-bold px-2 py-0.5 rounded-full" style={{background:'rgba(240,165,0,0.1)',color:'#C87800'}}>Paid</span>
              : <span className="text-[10px] font-bold px-2 py-0.5 rounded-full" style={{background:'rgba(22,163,74,0.1)',color:'#16a34a'}}>Free</span>}
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full capitalize"
              style={{background:r.status==='confirmed'?'rgba(22,163,74,0.1)':'rgba(220,38,38,0.08)', color:r.status==='confirmed'?'#16a34a':'#dc2626'}}>
              {r.status}
            </span>
          </div>
          <Link to={`/events/${e?.slug}`} className="font-display font-semibold text-base hover:underline" style={{color:'#1A0A35'}}>{e?.title}</Link>
          <div className="flex items-center gap-3 mt-1 text-xs" style={{color:'#A3A3A3',fontFamily:'Poppins,sans-serif'}}>
            {e?.venue && <span><i className="fas fa-map-marker-alt mr-1" style={{color}}/>{e.venue}</span>}
            {d && <span><i className="fas fa-clock mr-1" style={{color}}/>{format(d,'h:mm a')}</span>}
          </div>
          <div className="text-xs mt-1 font-mono" style={{color:'#5B2D8E'}}>Ref: {r.ticketRef}</div>
        </div>
        <button onClick={()=>printTicket(r)}
          className="flex items-center gap-1.5 text-xs font-semibold px-3 py-2 rounded-xl flex-shrink-0 transition-colors hover:opacity-80"
          style={{background:`${color}10`,color,border:`1px solid ${color}20`}}>
          <i className="fas fa-print text-[10px]"/>Print
        </button>
      </div>
    )
  }

  return (
    <div>
      <PageHeader title="My Events" sub="Your event registrations and tickets" icon="fa-calendar-check"/>

      {/* Upcoming */}
      <div className="mb-8">
        <h3 className="font-display font-semibold text-base mb-4 flex items-center gap-2" style={{color:'#1A0A35'}}>
          <span className="w-1 h-5 rounded-full" style={{background:'linear-gradient(to bottom,#5B2D8E,#F0A500)'}}/>
          Upcoming <span className="text-sm font-normal px-2 py-0.5 rounded-full ml-1" style={{background:'rgba(91,45,142,0.08)',color:'#5B2D8E'}}>{upcoming.length}</span>
        </h3>
        {isLoading ? (
          <div className="space-y-3">{[1,2].map(i=><div key={i} className="h-28 rounded-3xl animate-pulse" style={{background:'rgba(91,45,142,0.04)'}}/>)}</div>
        ) : upcoming.length ? (
          <div className="space-y-3">{upcoming.map(r=><RegistrationCard key={r.id} r={r}/>)}</div>
        ) : (
          <div className="card p-10 text-center">
            <i className="fas fa-calendar-plus text-4xl mb-3 block" style={{color:'rgba(91,45,142,0.12)'}}/>
            <p className="text-sm mb-3" style={{color:'#A3A3A3',fontFamily:'Poppins,sans-serif'}}>No upcoming events registered</p>
            <Link to="/events" className="btn-secondary !text-sm !py-2 !px-5 inline-flex">Browse Events</Link>
          </div>
        )}
      </div>

      {/* Past */}
      {past.length > 0 && (
        <div>
          <h3 className="font-display font-semibold text-base mb-4 flex items-center gap-2" style={{color:'#737373'}}>
            <span className="w-1 h-5 rounded-full" style={{background:'#D4D4D4'}}/>
            Past Events <span className="text-sm font-normal px-2 py-0.5 rounded-full ml-1" style={{background:'rgba(0,0,0,0.04)',color:'#737373'}}>{past.length}</span>
          </h3>
          <div className="space-y-3 opacity-70">{past.map(r=><RegistrationCard key={r.id} r={r}/>)}</div>
        </div>
      )}
    </div>
  )
}

/* ══════════════════════════════════════════════
   PORTAL VOLUNTEER STATUS
══════════════════════════════════════════════ */
export function PortalVolunteer() {
  const { user } = useAuth()
  const { data: apps, isLoading } = useQuery('my-team-apps',
    ()=>api.get('/team/my-applications').then(r=>r.data).catch(()=>[])
  )

  const STATUS_CFG = {
    pending:  { label:'Under Review', color:'#C87800', bg:'rgba(240,165,0,0.1)',  icon:'fa-clock' },
    accepted: { label:'Accepted',     color:'#16a34a', bg:'rgba(22,163,74,0.1)', icon:'fa-check-circle' },
    rejected: { label:'Declined',     color:'#dc2626', bg:'rgba(220,38,38,0.1)', icon:'fa-times-circle' },
  }

  return (
    <div>
      <PageHeader title="Volunteer Applications" sub="Track your team applications" icon="fa-hands-helping"/>

      {isLoading ? (
        <div className="space-y-3">{[1,2].map(i=><div key={i} className="h-24 rounded-3xl animate-pulse" style={{background:'rgba(91,45,142,0.04)'}}/>)}</div>
      ) : !apps?.length ? (
        <div className="card p-12 text-center">
          <i className="fas fa-hands-helping text-5xl mb-4 block" style={{color:'rgba(91,45,142,0.12)'}}/>
          <h3 className="font-display font-semibold text-lg mb-2" style={{color:'#1A0A35'}}>No Applications Yet</h3>
          <p className="text-sm mb-5" style={{color:'#A3A3A3',fontFamily:'Poppins,sans-serif'}}>Join our community team and make a difference.</p>
          <Link to="/volunteers" className="btn-secondary !text-sm !py-2.5 !px-6 inline-flex">Apply to Volunteer</Link>
        </div>
      ) : (
        <div className="space-y-4">
          {apps.map(app => {
            const cfg = STATUS_CFG[app.status]||STATUS_CFG.pending
            return (
              <div key={app.id} className="card p-6 flex items-start gap-5">
                <div className="w-12 h-12 rounded-2xl flex items-center justify-center flex-shrink-0"
                  style={{background:cfg.bg}}>
                  <i className={`fas ${cfg.icon} text-lg`} style={{color:cfg.color}}/>
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-1 flex-wrap">
                    <h4 className="font-display font-semibold text-base" style={{color:'#1A0A35'}}>{app.role_title||app.role||'Volunteer Position'}</h4>
                    <span className="text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full"
                      style={{background:cfg.bg,color:cfg.color}}>
                      <i className={`fas ${cfg.icon} mr-1`}/>{cfg.label}
                    </span>
                  </div>
                  {app.team && <div className="text-xs mb-2" style={{color:'#737373',fontFamily:'Poppins,sans-serif'}}>Team: <strong>{app.team}</strong></div>}
                  {app.message && <div className="text-sm leading-relaxed" style={{color:'#525252',fontFamily:'Poppins,sans-serif'}}>{app.message}</div>}
                  {app.review_notes && (
                    <div className="mt-3 p-3 rounded-xl text-sm" style={{background:cfg.bg,color:cfg.color,fontFamily:'Poppins,sans-serif'}}>
                      <i className="fas fa-comment-alt mr-1.5"/>Reviewer note: {app.review_notes}
                    </div>
                  )}
                  <div className="text-xs mt-2" style={{color:'#A3A3A3',fontFamily:'Poppins,sans-serif'}}>Applied {format(new Date(app.createdAt),'MMMM d, yyyy')}</div>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}

/* ══════════════════════════════════════════════
   PORTAL NOTIFICATIONS
══════════════════════════════════════════════ */
export function PortalNotifications() {
  const qc = useQueryClient()
  const { data, isLoading } = useQuery('my-notifs', ()=>api.get('/notifications').then(r=>r.data))
  const readAll = useMutation(()=>api.patch('/notifications/read-all'),{onSuccess:()=>qc.invalidateQueries('my-notifs')})
  const readOne = useMutation(id=>api.patch(`/notifications/${id}/read`),{onSuccess:()=>qc.invalidateQueries('my-notifs')})

  const TYPE_ICONS = {
    donation:'fa-heart text-rose-500', project_update:'fa-seedling text-green-500',
    event_reminder:'fa-calendar text-blue-500', forum_reply:'fa-comments text-purple-500',
    system:'fa-cog text-neutral-400', news:'fa-newspaper text-orange-400',
  }

  return (
    <div className="max-w-2xl">
      <div className="flex items-center justify-between mb-8">
        <PageHeader title="Notifications" sub={`${data?.filter(n=>!n.isRead).length||0} unread`} icon="fa-bell"/>
        {data?.some(n=>!n.isRead) && (
          <button onClick={()=>readAll.mutate()} className="text-xs font-semibold hover:underline" style={{color:'#5B2D8E',fontFamily:'Sora,sans-serif'}}>
            Mark all as read
          </button>
        )}
      </div>

      <div className="card divide-y" style={{divideColor:'rgba(91,45,142,0.06)'}}>
        {isLoading ? [1,2,3].map(i=>(
          <div key={i} className="p-5 flex gap-4">
            <div className="w-10 h-10 rounded-full animate-pulse flex-shrink-0" style={{background:'rgba(91,45,142,0.07)'}}/>
            <div className="flex-1 space-y-2">
              <div className="h-3 rounded-xl animate-pulse" style={{background:'rgba(91,45,142,0.07)'}}/>
              <div className="h-3 w-2/3 rounded-xl animate-pulse" style={{background:'rgba(91,45,142,0.07)'}}/>
            </div>
          </div>
        )) : data?.map(n=>(
          <div key={n.id} onClick={()=>!n.isRead&&readOne.mutate(n.id)}
            className={`flex gap-4 p-5 cursor-pointer transition-colors ${!n.isRead?'bg-primary-50/40 hover:bg-primary-50':'hover:bg-neutral-50'}`}>
            <div className="w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0"
              style={{background:'rgba(91,45,142,0.06)'}}>
              <i className={`fas ${TYPE_ICONS[n.type]||'fa-bell text-primary-500'} text-sm`}/>
            </div>
            <div className="flex-1">
              <div className="flex items-start justify-between gap-2">
                <span className="text-sm font-semibold" style={{color:n.isRead?'#737373':'#1A0A35',fontFamily:'Sora,sans-serif'}}>{n.title}</span>
                {!n.isRead && <div className="w-2 h-2 rounded-full flex-shrink-0 mt-1.5" style={{background:'#5B2D8E'}}/>}
              </div>
              <p className="text-xs mt-0.5 leading-relaxed" style={{color:'#A3A3A3',fontFamily:'Poppins,sans-serif'}}>{n.message}</p>
              <div className="text-[10px] mt-1.5" style={{color:'#C4C4C4',fontFamily:'Poppins,sans-serif'}}>{format(new Date(n.createdAt),'MMM d, yyyy · h:mm a')}</div>
            </div>
          </div>
        ))}
        {!data?.length && !isLoading && (
          <div className="text-center py-12">
            <i className="fas fa-bell text-4xl mb-3 block" style={{color:'rgba(91,45,142,0.15)'}}/>
            <p className="text-sm" style={{color:'#A3A3A3',fontFamily:'Poppins,sans-serif'}}>All caught up! No notifications.</p>
          </div>
        )}
      </div>
    </div>
  )
}
