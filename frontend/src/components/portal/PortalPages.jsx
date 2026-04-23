// Portal pages all in one file
import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from 'react-query'
import { useForm } from 'react-hook-form'
import toast from 'react-hot-toast'
import { format } from 'date-fns'
import { useAuth } from '../../context/AuthContext'
import api from '../../services/api'
import { Link } from 'react-router-dom'

// ─── Portal Dashboard ─────────────────────────────────────────
export function PortalDashboard() {
  const { user } = useAuth()
  const { data: donations } = useQuery('my-donations', () => api.get('/donations/my').then(r => r.data))
  const { data: notifs } = useQuery('my-notifs', () => api.get('/notifications').then(r => r.data))
  const totalDonated = donations?.filter(d => d.status==='completed').reduce((s,d) => s + +d.amount, 0) || 0

  return (
    <div className="space-y-8">
      {/* Welcome */}
      <div className="bg-gradient-to-br from-earth to-earth-light rounded-2xl p-8 text-cream relative overflow-hidden">
        <div className="absolute inset-0 bg-pattern"/>
        <div className="relative">
          <div className="text-gold text-xs tracking-[3px] uppercase mb-2 font-semibold">Welcome Back</div>
          <h2 className="font-serif text-3xl mb-2">Hello, {user?.first_name}! 🌿</h2>
          <p className="text-cream/60 text-sm max-w-lg">Thank you for being a part of the Nkenkak-Ngiesang community. Your support makes real change possible.</p>
          <div className="flex gap-3 mt-5">
            <Link to="/projects" className="btn-gold text-xs"><i className="fas fa-seedling"/> Explore Projects</Link>
            <Link to="/forum" className="btn-outline-gold text-xs"><i className="fas fa-comments"/> Community Forum</Link>
          </div>
        </div>
      </div>

      {/* Quick stats */}
      <div className="grid grid-cols-3 gap-4">
        <div className="bg-white rounded-xl p-5 border border-black/5 text-center">
          <div className="font-cinzel text-3xl text-gold font-black">{donations?.filter(d=>d.status==='completed').length || 0}</div>
          <div className="text-earth/50 text-xs tracking-widest uppercase mt-1">Donations Made</div>
        </div>
        <div className="bg-white rounded-xl p-5 border border-black/5 text-center">
          <div className="font-cinzel text-2xl text-earth font-black">{totalDonated.toLocaleString()}</div>
          <div className="text-earth/50 text-xs tracking-widest uppercase mt-1">XAF Contributed</div>
        </div>
        <div className="bg-white rounded-xl p-5 border border-black/5 text-center">
          <div className="font-cinzel text-3xl text-forest font-black">{notifs?.filter(n=>!n.is_read).length || 0}</div>
          <div className="text-earth/50 text-xs tracking-widest uppercase mt-1">Unread Notifications</div>
        </div>
      </div>

      {/* Recent donations */}
      <div className="bg-white rounded-xl border border-black/5">
        <div className="p-5 border-b border-black/5 flex items-center justify-between">
          <h3 className="font-serif text-earth text-lg">Recent Donations</h3>
          <Link to="/portal/donations" className="text-gold text-xs font-semibold hover:underline">View All →</Link>
        </div>
        <div className="divide-y divide-black/5">
          {donations?.slice(0,4).map(d => (
            <div key={d.id} className="flex items-center justify-between px-5 py-4">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-full bg-gold/10 flex items-center justify-center text-gold text-sm"><i className="fas fa-heart"/></div>
                <div>
                  <div className="text-sm font-semibold text-earth">{d.project_title || 'General Fund'}</div>
                  <div className="text-xs text-earth/40">{format(new Date(d.created_at),'MMM d, yyyy')}</div>
                </div>
              </div>
              <div className="text-right">
                <div className="font-bold text-earth">{Number(d.amount).toLocaleString()} <span className="text-xs text-earth/40">XAF</span></div>
                <span className={`text-xs font-bold ${d.status==='completed'?'text-green-500':'text-yellow-500'}`}>{d.status}</span>
              </div>
            </div>
          ))}
          {!donations?.length && <div className="py-8 text-center text-earth/30 text-sm">No donations yet — <Link to="/projects" className="text-gold hover:underline">support a project</Link></div>}
        </div>
      </div>

      {/* Notifications preview */}
      <div className="bg-white rounded-xl border border-black/5">
        <div className="p-5 border-b border-black/5 flex items-center justify-between">
          <h3 className="font-serif text-earth text-lg">Recent Notifications</h3>
          <Link to="/portal/notifications" className="text-gold text-xs font-semibold hover:underline">View All →</Link>
        </div>
        <div className="divide-y divide-black/5">
          {notifs?.slice(0,3).map(n => (
            <div key={n.id} className={`flex gap-3 px-5 py-4 ${!n.is_read?'bg-gold/3':''}`}>
              <div className={`w-2 h-2 rounded-full mt-2 flex-shrink-0 ${n.is_read?'bg-earth/10':'bg-gold'}`}/>
              <div>
                <div className="text-sm font-semibold text-earth">{n.title}</div>
                <div className="text-xs text-earth/50 mt-0.5">{n.message}</div>
                <div className="text-[10px] text-earth/30 mt-1">{format(new Date(n.created_at),'MMM d, yyyy · h:mm a')}</div>
              </div>
            </div>
          ))}
          {!notifs?.length && <div className="py-8 text-center text-earth/30 text-sm">No notifications</div>}
        </div>
      </div>
    </div>
  )
}

// ─── Portal Profile ───────────────────────────────────────────
export function PortalProfile() {
  const { user, loadUser } = useAuth()
  const qc = useQueryClient()
  const { register, handleSubmit, formState:{isDirty} } = useForm({ defaultValues: user || {} })
  const [pwForm, setPwForm] = useState(false)
  const { register: regPw, handleSubmit: handlePw } = useForm()

  const updateMut = useMutation(data => api.patch('/users/profile', data), {
    onSuccess: () => { toast.success('Profile updated'); loadUser() }
  })
  const pwMut = useMutation(data => api.patch('/users/change-password', data), {
    onSuccess: () => { toast.success('Password changed'); setPwForm(false) }
  })

  return (
    <div className="max-w-2xl space-y-6">
      <h2 className="font-serif text-2xl text-earth">My Profile</h2>

      <form onSubmit={handleSubmit(d => updateMut.mutate(d))} className="bg-white rounded-xl border border-black/5 p-6 space-y-5">
        <h3 className="font-semibold text-earth border-b border-black/5 pb-3">Personal Information</h3>
        <div className="grid grid-cols-2 gap-4">
          <div><label className="label">First Name</label><input {...register('first_name')} className="input"/></div>
          <div><label className="label">Last Name</label><input {...register('last_name')} className="input"/></div>
          <div><label className="label">Phone</label><input {...register('phone')} className="input"/></div>
          <div><label className="label">Country</label><input {...register('country')} className="input"/></div>
          <div><label className="label">City</label><input {...register('city')} className="input"/></div>
          <div><label className="label">Village Quarter</label><input {...register('village_quarter')} className="input"/></div>
        </div>
        <div><label className="label">Bio</label><textarea {...register('bio')} rows={3} className="input resize-none"/></div>
        <label className="flex items-center gap-2 cursor-pointer">
          <input type="checkbox" {...register('is_diaspora')} className="w-4 h-4 accent-gold"/>
          <span className="text-sm text-earth/70">I am a diaspora member (living outside Cameroon)</span>
        </label>
        <label className="flex items-center gap-2 cursor-pointer">
          <input type="checkbox" {...register('newsletter')} className="w-4 h-4 accent-gold"/>
          <span className="text-sm text-earth/70">Subscribe to village newsletter</span>
        </label>
        <button type="submit" disabled={updateMut.isLoading} className="btn-earth text-xs">
          {updateMut.isLoading ? <><i className="fas fa-spinner animate-spin"/> Saving...</> : <><i className="fas fa-save"/> Save Changes</>}
        </button>
      </form>

      {/* Change password */}
      <div className="bg-white rounded-xl border border-black/5 p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold text-earth">Security</h3>
          <button onClick={() => setPwForm(!pwForm)} className="text-gold text-xs font-semibold hover:underline">Change Password</button>
        </div>
        {pwForm && (
          <form onSubmit={handlePw(d => pwMut.mutate(d))} className="space-y-3">
            <div><label className="label">Current Password</label><input type="password" {...regPw('current_password',{required:true})} className="input"/></div>
            <div><label className="label">New Password</label><input type="password" {...regPw('new_password',{required:true,minLength:8})} className="input"/></div>
            <button type="submit" disabled={pwMut.isLoading} className="btn-earth text-xs">
              {pwMut.isLoading?<><i className="fas fa-spinner animate-spin"/> Updating...</>:<><i className="fas fa-lock"/> Update Password</>}
            </button>
          </form>
        )}
        {!pwForm && <p className="text-earth/40 text-sm">Your account is secured with a password.</p>}
      </div>
    </div>
  )
}

// ─── Portal Donations ─────────────────────────────────────────
export function PortalDonations() {
  const { data, isLoading } = useQuery('my-donations', () => api.get('/donations/my').then(r => r.data))
  const total = data?.filter(d=>d.status==='completed').reduce((s,d)=>s+(+d.amount),0)||0

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="font-serif text-2xl text-earth">My Donations</h2>
        <Link to="/projects" className="btn-gold text-xs"><i className="fas fa-heart"/> Donate Again</Link>
      </div>
      <div className="grid grid-cols-3 gap-4">
        <div className="bg-white rounded-xl p-5 border border-black/5 text-center"><div className="font-cinzel text-3xl text-gold font-black">{data?.filter(d=>d.status==='completed').length||0}</div><div className="text-xs text-earth/50 uppercase tracking-widest mt-1">Completed</div></div>
        <div className="bg-white rounded-xl p-5 border border-black/5 text-center"><div className="font-cinzel text-2xl text-earth font-black">{total.toLocaleString()}</div><div className="text-xs text-earth/50 uppercase tracking-widest mt-1">XAF Total</div></div>
        <div className="bg-white rounded-xl p-5 border border-black/5 text-center"><div className="font-cinzel text-3xl text-forest font-black">{data?.filter(d=>d.status==='pending').length||0}</div><div className="text-xs text-earth/50 uppercase tracking-widest mt-1">Pending</div></div>
      </div>
      <div className="bg-white rounded-xl border border-black/5 overflow-hidden">
        <table className="w-full">
          <thead className="bg-cream-light border-b border-black/5"><tr>{['Reference','Project','Amount','Method','Status','Date'].map(h=><th key={h} className="text-left px-5 py-3 text-xs font-bold text-earth tracking-widest uppercase">{h}</th>)}</tr></thead>
          <tbody>
            {isLoading ? [1,2,3].map(i=><tr key={i}><td colSpan={6} className="px-5 py-4"><div className="h-4 bg-earth/5 rounded animate-pulse"/></td></tr>)
              : data?.map(d=>(
                <tr key={d.id} className="table-row">
                  <td className="px-5 py-3 font-mono text-xs text-earth/60">{d.reference}</td>
                  <td className="px-5 py-3 text-sm text-earth/70">{d.project_title||'General Fund'}</td>
                  <td className="px-5 py-3 font-bold text-sm">{Number(d.amount).toLocaleString()} <span className="text-xs text-earth/40">{d.currency}</span></td>
                  <td className="px-5 py-3 text-xs capitalize">{d.provider?.replace(/_/g,' ')}</td>
                  <td className="px-5 py-3"><span className={`text-xs font-bold uppercase ${d.status==='completed'?'text-green-500':d.status==='pending'?'text-yellow-500':'text-red-400'}`}>{d.status}</span></td>
                  <td className="px-5 py-3 text-xs text-earth/40">{format(new Date(d.created_at),'MMM d, yyyy')}</td>
                </tr>
              ))
            }
          </tbody>
        </table>
        {!data?.length && !isLoading && <div className="text-center py-12 text-earth/30 text-sm">No donations yet</div>}
      </div>
    </div>
  )
}

// ─── Portal Notifications ─────────────────────────────────────
export function PortalNotifications() {
  const qc = useQueryClient()
  const { data, isLoading } = useQuery('my-notifs', () => api.get('/notifications').then(r => r.data))
  const readAll = useMutation(() => api.patch('/notifications/read-all'), {
    onSuccess: () => qc.invalidateQueries('my-notifs')
  })
  const readOne = useMutation(id => api.patch(`/notifications/${id}/read`), {
    onSuccess: () => qc.invalidateQueries('my-notifs')
  })

  const TYPE_ICONS = { donation:'fa-heart text-gold', project_update:'fa-seedling text-green-500', event_reminder:'fa-calendar text-blue-400', forum_reply:'fa-comments text-purple-400', system:'fa-cog text-earth/40', news:'fa-newspaper text-orange-400' }

  return (
    <div className="max-w-2xl space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="font-serif text-2xl text-earth">Notifications</h2>
        {data?.some(n=>!n.is_read) && <button onClick={()=>readAll.mutate()} className="text-xs text-gold font-semibold hover:underline">Mark all as read</button>}
      </div>
      <div className="bg-white rounded-xl border border-black/5 divide-y divide-black/5">
        {isLoading ? [1,2,3].map(i=><div key={i} className="p-5 flex gap-3"><div className="w-9 h-9 rounded-full bg-earth/5 animate-pulse flex-shrink-0"/><div className="flex-1 space-y-2"><div className="h-3 bg-earth/5 rounded animate-pulse"/><div className="h-3 w-2/3 bg-earth/5 rounded animate-pulse"/></div></div>)
          : data?.map(n=>(
            <div key={n.id} onClick={()=>!n.is_read&&readOne.mutate(n.id)}
              className={`flex gap-4 p-5 cursor-pointer transition-colors ${!n.is_read?'bg-gold/3 hover:bg-gold/5':'hover:bg-cream-light/50'}`}>
              <div className={`w-10 h-10 rounded-full bg-earth/6 flex items-center justify-center flex-shrink-0 text-sm`}>
                <i className={`fas ${TYPE_ICONS[n.type]||'fa-bell text-gold'}`}/>
              </div>
              <div className="flex-1">
                <div className="flex items-start justify-between gap-2">
                  <span className={`text-sm font-semibold ${n.is_read?'text-earth/70':'text-earth'}`}>{n.title}</span>
                  {!n.is_read && <div className="w-2 h-2 rounded-full bg-gold flex-shrink-0 mt-1.5"/>}
                </div>
                <p className="text-xs text-earth/55 mt-0.5 leading-relaxed">{n.message}</p>
                <div className="text-[10px] text-earth/30 mt-1.5">{format(new Date(n.created_at),'MMM d, yyyy · h:mm a')}</div>
              </div>
            </div>
          ))
        }
        {!data?.length && !isLoading && <div className="py-12 text-center text-earth/30 text-sm">All caught up! No notifications.</div>}
      </div>
    </div>
  )
}
