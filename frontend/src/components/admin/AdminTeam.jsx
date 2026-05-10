import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from 'react-query'
import { useForm } from 'react-hook-form'
import toast from 'react-hot-toast'
import { format } from 'date-fns'
import api from '../../services/api'
import ImageUploader from '../common/ImageUploader'
import { StatusBadge, ActionBtn, Modal } from './AdminProjects'

const GRADS = [
  'linear-gradient(135deg,#250F47,#5B2D8E)',
  'linear-gradient(135deg,#3D1A6B,#7B4DB8)',
  'linear-gradient(135deg,#5B2D8E,#9B6FD8)',
  'linear-gradient(135deg,#4A2478,#7B4DB8)',
  'linear-gradient(135deg,#1A0A35,#3D1A6B)',
  'linear-gradient(135deg,#2E1278,#5B2D8E)',
]

export default function AdminTeam() {
  const qc = useQueryClient()
  const [showForm,  setShowForm]  = useState(false)
  const [editing,   setEditing]   = useState(null)
  const [avatar,    setAvatar]    = useState('')
  const [activeTab, setActiveTab] = useState('members')
  const { register, handleSubmit, reset, setValue, formState:{errors} } = useForm({defaultValues:{isActive:true,sortOrder:99}})

  const { data: members, isLoading } = useQuery('admin-team', () => api.get('/team').then(r => r.data))
  const { data: apps, isLoading:appsLoading } = useQuery('team-apps', () => api.get('/admin/team-applications').then(r => r.data))

  const saveMut = useMutation(
    data => editing ? api.patch(`/team/${editing.id}`, data) : api.post('/team', data),
    { onSuccess: () => { qc.invalidateQueries('admin-team'); toast.success(editing?'Member updated!':'Member added!'); setShowForm(false); setEditing(null); setAvatar(''); reset() } }
  )
  const reviewMut = useMutation(({id,status}) => api.patch(`/admin/team-applications/${id}`,{status}), {
    onSuccess: () => { qc.invalidateQueries('team-apps'); toast.success('Application updated') }
  })

  const openNew = () => { setEditing(null); setAvatar(''); reset({isActive:true,sortOrder:99}); setShowForm(true) }
  const openEdit = (m) => {
    setEditing(m); setAvatar(m.avatarUrl||'')
    setValue('name', m.name); setValue('role_title', m.roleTitle); setValue('team', m.team)
    setValue('bio', m.bio||''); setValue('sort_order', m.sortOrder); setValue('is_active', m.isActive)
    setValue('facebook', m.facebook||''); setValue('twitter', m.twitter||'')
    setValue('linkedin', m.linkedin||''); setValue('email', m.email||'')
    setShowForm(true)
  }

  const pending = apps?.filter(a=>a.status==='pending').length||0

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl flex items-center justify-center" style={{background:'linear-gradient(135deg,#5B2D8E,#7B4DB8)'}}>
            <i className="fas fa-id-badge text-sm text-white"/>
          </div>
          <div>
            <h2 className="font-display font-bold text-xl" style={{color:'#1A0A35'}}>Team Management</h2>
            <p className="text-xs" style={{color:'#A3A3A3',fontFamily:'Poppins,sans-serif'}}>{members?.length||0} members · {pending} pending applications</p>
          </div>
        </div>
        <button onClick={openNew} className="btn-secondary !py-2 !px-4 !text-xs">
          <i className="fas fa-plus text-[10px]"/>Add Member
        </button>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 mb-5 p-1 rounded-2xl w-fit" style={{background:'rgba(91,45,142,0.06)'}}>
        {[['members','Team Members'],['applications','Applications']].map(([k,l])=>(
          <button key={k} onClick={()=>setActiveTab(k)}
            className="px-5 py-2 rounded-xl text-sm font-semibold transition-all flex items-center gap-2"
            style={{background:activeTab===k?'#fff':'transparent',color:activeTab===k?'#5B2D8E':'#A3A3A3',boxShadow:activeTab===k?'0 1px 6px rgba(91,45,142,0.12)':'none',fontFamily:'Sora,sans-serif'}}>
            {l}
            {k==='applications' && pending>0 && <span className="text-[9px] font-bold px-1.5 py-0.5 rounded-full text-white" style={{background:'#dc2626'}}>{pending}</span>}
          </button>
        ))}
      </div>

      {/* Members grid */}
      {activeTab==='members' && (
        isLoading ? (
          <div className="grid md:grid-cols-4 gap-4">{[1,2,3,4].map(i=><div key={i} className="h-52 rounded-3xl animate-pulse" style={{background:'rgba(91,45,142,0.04)'}}/>)}</div>
        ) : !members?.length ? (
          <div className="text-center py-16 rounded-3xl" style={{background:'rgba(91,45,142,0.02)',border:'1px dashed rgba(91,45,142,0.1)'}}>
            <i className="fas fa-users text-4xl mb-3 block" style={{color:'rgba(91,45,142,0.15)'}}/>
            <p className="text-sm mb-3" style={{color:'#737373',fontFamily:'Poppins,sans-serif'}}>No team members yet</p>
            <button onClick={openNew} className="btn-secondary !text-sm !py-2 !px-5">Add First Member</button>
          </div>
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {members.map((m,i)=>(
              <div key={m.id} className="card" style={{paddingBottom:52,position:'relative',overflow:'visible'}}>
                {/* Photo */}
                <div className="h-44 flex items-center justify-center relative overflow-hidden rounded-t-3xl"
                  style={{background:GRADS[i%GRADS.length]}}>
                  {m.avatarUrl
                    ? <img src={m.avatarUrl} alt={m.name} className="w-full h-full object-cover"/>
                    : <div className="w-20 h-20 rounded-full flex items-center justify-center" style={{background:'rgba(240,165,0,0.2)'}}>
                        <i className="fas fa-user text-3xl" style={{color:'rgba(240,165,0,0.6)'}}/>
                      </div>}
                  {/* Edit btn */}
                  <button onClick={()=>openEdit(m)}
                    className="absolute top-2 right-2 w-8 h-8 rounded-full bg-white flex items-center justify-center shadow-card hover:shadow-card-lg transition-all"
                    style={{color:'#5B2D8E'}}>
                    <i className="fas fa-pen text-[10px]"/>
                  </button>
                  {!m.isActive && (
                    <div className="absolute inset-0 flex items-center justify-center" style={{background:'rgba(0,0,0,0.45)'}}>
                      <span className="text-xs font-bold text-white px-3 py-1 rounded-full" style={{background:'rgba(220,38,38,0.8)'}}>Inactive</span>
                    </div>
                  )}
                </div>
                {/* Name card */}
                <div className="absolute bottom-0 left-3 right-3 bg-white rounded-2xl px-4 py-3 text-center"
                  style={{boxShadow:'0 8px 24px rgba(91,45,142,0.12)'}}>
                  <div className="font-display font-semibold text-sm" style={{color:'#1A0A35'}}>{m.name}</div>
                  <div className="text-[10px] font-medium mt-0.5 truncate" style={{color:'#F0A500',fontFamily:'Poppins,sans-serif'}}>{m.roleTitle}</div>
                  <span className="tag !text-[9px] mt-1 inline-block">{m.team}</span>
                </div>
              </div>
            ))}
          </div>
        )
      )}

      {/* Applications */}
      {activeTab==='applications' && (
        appsLoading ? (
          <div className="space-y-3">{[1,2,3].map(i=><div key={i} className="h-16 rounded-2xl animate-pulse" style={{background:'rgba(91,45,142,0.04)'}}/>)}</div>
        ) : !apps?.length ? (
          <div className="text-center py-12 rounded-3xl" style={{background:'rgba(91,45,142,0.02)',border:'1px dashed rgba(91,45,142,0.1)'}}>
            <i className="fas fa-envelope-open text-4xl mb-2 block" style={{color:'rgba(91,45,142,0.15)'}}/>
            <p className="text-sm" style={{color:'#A3A3A3',fontFamily:'Poppins,sans-serif'}}>No applications yet</p>
          </div>
        ) : (
          <div className="space-y-3">
            {apps.map(a=>(
              <div key={a.id} className="card p-4 flex items-center gap-4">
                <div className="w-10 h-10 rounded-full flex items-center justify-center text-white font-bold flex-shrink-0"
                  style={{background:'linear-gradient(135deg,#5B2D8E,#7B4DB8)'}}>
                  {a.fullName?.[0]?.toUpperCase()}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-display font-semibold text-sm" style={{color:'#1A0A35'}}>{a.fullName}</span>
                    <StatusBadge status={a.status}/>
                    <span className="tag !text-[9px]">{a.teamChoice}</span>
                  </div>
                  <div className="flex gap-3 text-[10px] mt-0.5" style={{color:'#A3A3A3',fontFamily:'Poppins,sans-serif'}}>
                    <span>{a.email}</span>
                    {a.location && <span><i className="fas fa-map-marker-alt mr-0.5"/>{a.location}</span>}
                    <span>{format(new Date(a.createdAt),'MMM d, yyyy')}</span>
                  </div>
                  {a.skills && <p className="text-[10px] mt-0.5 line-clamp-1" style={{color:'#737373',fontFamily:'Poppins,sans-serif'}}><strong>Skills:</strong> {a.skills}</p>}
                </div>
                {a.status==='pending' && (
                  <div className="flex gap-2 flex-shrink-0">
                    <ActionBtn label="Approve" icon="fa-check" color="#16a34a" onClick={()=>reviewMut.mutate({id:a.id,status:'approved'})}/>
                    <ActionBtn label="Reject"  icon="fa-times" color="#dc2626" onClick={()=>reviewMut.mutate({id:a.id,status:'rejected'})}/>
                  </div>
                )}
              </div>
            ))}
          </div>
        )
      )}

      {/* Member form modal */}
      <Modal open={showForm} onClose={()=>{setShowForm(false);setEditing(null);setAvatar('');reset()}}
        title={editing?'Edit Member':'Add Team Member'}
        sub={editing?`Editing: ${editing.name}`:'Add a new community team member'}
        wide>
        <form onSubmit={handleSubmit(d=>saveMut.mutate({...d,avatar_url:avatar}))} className="space-y-4">
          {/* Avatar uploader */}
          <ImageUploader value={avatar} onChange={setAvatar}
            folder="nkenkak/team" aspect="portrait"
            label="Member Photo"
            hint="Upload a professional headshot. Square or portrait (3:4) works best."/>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="label">Full Name *</label>
              <input {...register('name',{required:true})} className="input" placeholder="e.g. Dr. Carine Wabo"/>
              {errors.name && <p className="text-xs mt-1" style={{color:'#dc2626'}}>Name required</p>}
            </div>
            <div>
              <label className="label">Role / Title *</label>
              <input {...register('role_title',{required:true})} className="input" placeholder="e.g. Health Coordinator"/>
              {errors.role_title && <p className="text-xs mt-1" style={{color:'#dc2626'}}>Role required</p>}
            </div>
            <div>
              <label className="label">Team *</label>
              <select {...register('team',{required:true})} className="input">
                <option value="">Select team…</option>
                {['leadership','development','culture','youth','health','environment','education'].map(t=>(
                  <option key={t} value={t} className="capitalize">{t}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="label">Sort Order</label>
              <input type="number" {...register('sort_order')} className="input" placeholder="1"/>
              <p className="text-[10px] mt-1" style={{color:'#A3A3A3',fontFamily:'Poppins,sans-serif'}}>Lower = shown first</p>
            </div>
          </div>

          <div>
            <label className="label">Bio</label>
            <textarea {...register('bio')} rows={3} className="input resize-none" placeholder="Short biography…"/>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div><label className="label">Facebook URL</label><input {...register('facebook')} className="input" placeholder="https://facebook.com/…"/></div>
            <div><label className="label">LinkedIn URL</label><input {...register('linkedin')} className="input" placeholder="https://linkedin.com/in/…"/></div>
            <div><label className="label">Twitter URL</label><input {...register('twitter')} className="input" placeholder="https://twitter.com/…"/></div>
            <div><label className="label">Contact Email</label><input {...register('email')} className="input" placeholder="member@example.com"/></div>
          </div>

          <label className="flex items-center gap-2 cursor-pointer text-sm" style={{fontFamily:'Poppins,sans-serif'}}>
            <input type="checkbox" {...register('is_active')} defaultChecked className="w-4 h-4 rounded accent-purple-600"/>
            Active (visible on public team page)
          </label>

          <div className="flex gap-3 pt-2">
            <button type="button" onClick={()=>{setShowForm(false);setEditing(null);setAvatar('');reset()}}
              className="flex-1 py-3 rounded-2xl text-sm font-semibold"
              style={{background:'rgba(91,45,142,0.05)',color:'#737373',border:'1px solid rgba(91,45,142,0.1)',fontFamily:'Sora,sans-serif'}}>Cancel</button>
            <button type="submit" disabled={saveMut.isLoading} className="btn-secondary flex-1 justify-center">
              {saveMut.isLoading?<><i className="fas fa-spinner animate-spin"/>Saving…</>:<><i className="fas fa-save"/>{editing?'Save Changes':'Add Member'}</>}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  )
}
