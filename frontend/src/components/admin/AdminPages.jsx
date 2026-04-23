import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from 'react-query'
import toast from 'react-hot-toast'
import api from '../../services/api'
import { format } from 'date-fns'

// ─── Shared Table Component ────────────────────────────────────
function AdminTable({ title, icon, columns, data, loading, actions, toolbar }) {
  return (
    <div className="p-8 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="font-serif text-3xl text-cream flex items-center gap-3">
          <i className={`fas ${icon} text-gold`}/>{title}
        </h1>
        {toolbar}
      </div>
      <div className="bg-white rounded-xl shadow-sm border border-black/5 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-cream-light border-b border-black/5">
              <tr>{columns.map(c => <th key={c.key} className="text-left px-5 py-3.5 text-xs font-bold text-earth tracking-widest uppercase">{c.label}</th>)}</tr>
            </thead>
            <tbody>
              {loading
                ? [1,2,3,4,5].map(i => <tr key={i}><td colSpan={columns.length} className="px-5 py-4"><div className="h-4 bg-earth/5 rounded animate-pulse"/></td></tr>)
                : data?.length
                  ? data.map((row, i) => (
                      <tr key={row.id || i} className="table-row">
                        {columns.map(c => <td key={c.key} className="px-5 py-3.5 text-sm text-earth/80">{c.render ? c.render(row) : row[c.key]}</td>)}
                        {actions && <td className="px-5 py-3.5">{actions(row)}</td>}
                      </tr>
                    ))
                  : <tr><td colSpan={columns.length + (actions?1:0)} className="text-center py-12 text-earth/30 text-sm">No records found</td></tr>
              }
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}

// ─── Admin Projects ─────────────────────────────────────────────
export function AdminProjects() {
  const qc = useQueryClient()
  const { data, isLoading } = useQuery('admin-projects', () => api.get('/projects?limit=50').then(r => r.data.projects))
  const deleteMut = useMutation(id => api.delete(`/projects/${id}`), {
    onSuccess: () => { qc.invalidateQueries('admin-projects'); toast.success('Project deleted') }
  })
  const toggleFeatured = useMutation(({id,is_featured}) => api.patch(`/projects/${id}`,{is_featured:!is_featured}),{
    onSuccess: () => qc.invalidateQueries('admin-projects')
  })

  const STATUS_COLOR = { active:'text-green-500', upcoming:'text-blue-400', completed:'text-yellow-500', paused:'text-red-400' }

  return <AdminTable title="Projects" icon="fa-seedling"
    loading={isLoading} data={data}
    columns={[
      { key:'title', label:'Title', render:r => <div><div className="font-semibold text-earth">{r.title}</div><div className="text-xs text-earth/40 capitalize">{r.category}</div></div> },
      { key:'status', label:'Status', render:r => <span className={`text-xs font-bold uppercase tracking-wider ${STATUS_COLOR[r.status]}`}>{r.status}</span> },
      { key:'raised', label:'Raised / Goal', render:r => <div className="text-xs"><div>{Number(r.raised_amount).toLocaleString()} XAF</div><div className="text-earth/40">/ {Number(r.goal_amount).toLocaleString()}</div></div> },
      { key:'donors', label:'Donors', render:r => <span className="font-semibold">{r.donor_count}</span> },
      { key:'featured', label:'Featured', render:r => <button onClick={() => toggleFeatured.mutate(r)} className={`w-10 h-5 rounded-full transition-colors ${r.is_featured?'bg-gold':'bg-earth/20'}`}><div className={`w-4 h-4 rounded-full bg-white mx-0.5 transition-transform ${r.is_featured?'translate-x-5':''}`}/></button> },
    ]}
    actions={r => (
      <div className="flex gap-2">
        <button className="text-xs text-blue-400 hover:text-blue-300 font-semibold">Edit</button>
        <button onClick={() => deleteMut.mutate(r.id)} className="text-xs text-red-400 hover:text-red-300 font-semibold">Delete</button>
      </div>
    )}
    toolbar={<button className="btn-gold text-xs"><i className="fas fa-plus"/> New Project</button>}
  />
}

// ─── Admin Donations ────────────────────────────────────────────
export function AdminDonations() {
  const { data, isLoading } = useQuery('admin-donations', () => api.get('/donations').then(r => r.data))
  const ST = { completed:'text-green-500', pending:'text-yellow-500', failed:'text-red-400', refunded:'text-purple-400' }
  return <AdminTable title="Donations" icon="fa-heart"
    loading={isLoading} data={data}
    columns={[
      { key:'reference', label:'Reference', render:r => <span className="font-mono text-xs text-earth/70">{r.reference}</span> },
      { key:'donor', label:'Donor', render:r => <div><div className="font-semibold text-xs">{r.donor_name||r.user_name||'Anonymous'}</div><div className="text-[10px] text-earth/40">{r.donor_email}</div></div> },
      { key:'amount', label:'Amount', render:r => <span className="font-bold">{Number(r.amount).toLocaleString()} {r.currency}</span> },
      { key:'project', label:'Project', render:r => <span className="text-xs text-earth/60">{r.project_title||'General Fund'}</span> },
      { key:'provider', label:'Method', render:r => <span className="text-xs capitalize">{r.provider?.replace(/_/g,' ')}</span> },
      { key:'status', label:'Status', render:r => <span className={`text-xs font-bold uppercase ${ST[r.status]}`}>{r.status}</span> },
      { key:'date', label:'Date', render:r => <span className="text-xs text-earth/50">{format(new Date(r.created_at),'MMM d, yyyy')}</span> },
    ]}
  />
}

// ─── Admin Users ────────────────────────────────────────────────
export function AdminUsers() {
  const qc = useQueryClient()
  const [search, setSearch] = useState('')
  const { data, isLoading } = useQuery(['admin-users',search], () => api.get(`/admin/users?search=${search}`).then(r => r.data), { debounce: 400 })
  const updateRole = useMutation(({id,role}) => api.patch(`/admin/users/${id}`,{role}), {
    onSuccess: () => { qc.invalidateQueries('admin-users'); toast.success('Role updated') }
  })
  const ROLE_COLORS = { admin:'text-gold', leader:'text-purple-400', member:'text-blue-400', guest:'text-earth/40' }
  return <AdminTable title="Users" icon="fa-users"
    loading={isLoading} data={data}
    toolbar={
      <div className="flex gap-3">
        <input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Search users..." className="input text-xs h-10 w-60"/>
      </div>
    }
    columns={[
      { key:'name', label:'Name', render:r => <div className="flex items-center gap-2"><div className="w-7 h-7 rounded-full bg-earth/10 flex items-center justify-center text-xs font-bold text-earth">{r.first_name?.[0]}{r.last_name?.[0]}</div><div><div className="text-sm font-semibold">{r.first_name} {r.last_name}</div><div className="text-xs text-earth/40">{r.email}</div></div></div> },
      { key:'role',    label:'Role',    render:r => <span className={`text-xs font-bold uppercase tracking-wider ${ROLE_COLORS[r.role]}`}>{r.role}</span> },
      { key:'country', label:'Country', render:r => <span className="text-xs">{r.country}</span> },
      { key:'diaspora',label:'Diaspora',render:r => r.is_diaspora?<span className="text-xs text-green-500 font-bold">Yes</span>:<span className="text-xs text-earth/30">No</span> },
      { key:'status',  label:'Status',  render:r => <span className={`text-xs font-bold ${r.status==='active'?'text-green-500':'text-red-400'}`}>{r.status}</span> },
      { key:'joined',  label:'Joined',  render:r => <span className="text-xs text-earth/40">{format(new Date(r.created_at),'MMM d, yyyy')}</span> },
    ]}
    actions={r => (
      <select defaultValue={r.role} onChange={e=>updateRole.mutate({id:r.id,role:e.target.value})}
        className="text-xs border border-earth/10 rounded px-2 py-1 bg-white text-earth">
        <option value="admin">Admin</option>
        <option value="leader">Leader</option>
        <option value="member">Member</option>
        <option value="guest">Guest</option>
      </select>
    )}
  />
}

// ─── Admin News ─────────────────────────────────────────────────
export function AdminNews() {
  const qc = useQueryClient()
  const { data, isLoading } = useQuery('admin-news', () => api.get('/news?limit=50').then(r => r.data))
  const publishMut = useMutation(id => api.patch(`/news/${id}`,{status:'published'}), {
    onSuccess: () => { qc.invalidateQueries('admin-news'); toast.success('Published!') }
  })
  return <AdminTable title="News & Articles" icon="fa-newspaper"
    loading={isLoading} data={data}
    toolbar={<button className="btn-gold text-xs"><i className="fas fa-plus"/> New Article</button>}
    columns={[
      { key:'title', label:'Title', render:r => <div><div className="font-semibold text-sm">{r.title}</div><div className="text-xs text-earth/40">{r.category}</div></div> },
      { key:'author', label:'Author', render:r => <span className="text-xs">{r.author_name||'—'}</span> },
      { key:'status', label:'Status', render:r => <span className={`text-xs font-bold uppercase ${r.status==='published'?'text-green-500':r.status==='draft'?'text-yellow-500':'text-earth/40'}`}>{r.status}</span> },
      { key:'views', label:'Views', render:r => <span className="text-xs font-semibold">{r.view_count}</span> },
      { key:'date',  label:'Date',  render:r => <span className="text-xs text-earth/40">{r.published_at?format(new Date(r.published_at),'MMM d, yyyy'):'—'}</span> },
    ]}
    actions={r => (
      <div className="flex gap-2">
        {r.status==='draft' && <button onClick={()=>publishMut.mutate(r.id)} className="text-xs text-green-500 hover:text-green-400 font-semibold">Publish</button>}
        <button className="text-xs text-blue-400 font-semibold">Edit</button>
      </div>
    )}
  />
}

// ─── Admin Events ────────────────────────────────────────────────
export function AdminEvents() {
  const { data, isLoading } = useQuery('admin-events', () => api.get('/events').then(r => r.data))
  return <AdminTable title="Events" icon="fa-calendar"
    loading={isLoading} data={data}
    toolbar={<button className="btn-gold text-xs"><i className="fas fa-plus"/> New Event</button>}
    columns={[
      { key:'title',    label:'Title',    render:r => <div className="font-semibold text-sm">{r.title}</div> },
      { key:'category', label:'Category', render:r => <span className="text-xs capitalize">{r.category}</span> },
      { key:'venue',    label:'Venue',    render:r => <span className="text-xs text-earth/60">{r.venue||'Online'}</span> },
      { key:'start',    label:'Date',     render:r => <span className="text-xs">{format(new Date(r.start_date),'MMM d, yyyy')}</span> },
      { key:'online',   label:'Online',   render:r => r.is_online?<span className="text-xs text-blue-400 font-bold">Yes</span>:<span className="text-xs text-earth/30">No</span> },
    ]}
    actions={r => <button className="text-xs text-blue-400 font-semibold">Edit</button>}
  />
}

// ─── Admin Team ──────────────────────────────────────────────────
export function AdminTeam() {
  const { data, isLoading } = useQuery('admin-team', () => api.get('/team').then(r => r.data))
  const { data: apps, isLoading: appsLoading } = useQuery('team-applications', () => api.get('/admin/team-applications').then(r => r.data))
  const qc = useQueryClient()
  const reviewMut = useMutation(({id,status}) => api.patch(`/admin/team-applications/${id}`,{status}),{
    onSuccess:()=>{qc.invalidateQueries('team-applications');toast.success('Application updated')}
  })

  return (
    <div className="p-8 space-y-8">
      <h1 className="font-serif text-3xl text-cream flex items-center gap-3"><i className="fas fa-id-badge text-gold"/>Team Management</h1>
      <AdminTable title="Current Team Members" icon="fa-users" loading={isLoading} data={data}
        columns={[
          { key:'name',      label:'Name',   render:r=><div className="font-semibold">{r.name}</div> },
          { key:'role_title',label:'Role'  },
          { key:'team',      label:'Team',   render:r=><span className="tag">{r.team}</span> },
          { key:'active',    label:'Active', render:r=><span className={`text-xs font-bold ${r.is_active?'text-green-500':'text-red-400'}`}>{r.is_active?'Active':'Inactive'}</span> },
        ]}
        actions={r=><button className="text-xs text-blue-400 font-semibold">Edit</button>}
        toolbar={<button className="btn-gold text-xs"><i className="fas fa-plus"/> Add Member</button>}
      />
      <AdminTable title="Join Applications" icon="fa-envelope" loading={appsLoading} data={apps}
        columns={[
          { key:'full_name',  label:'Name'  },
          { key:'email',      label:'Email', render:r=><span className="text-xs">{r.email}</span> },
          { key:'team_choice',label:'Team',  render:r=><span className="tag">{r.team_choice}</span> },
          { key:'location',   label:'Location',render:r=><span className="text-xs">{r.location||'—'}</span> },
          { key:'status',     label:'Status', render:r=><span className={`text-xs font-bold uppercase ${r.status==='approved'?'text-green-500':r.status==='rejected'?'text-red-400':'text-yellow-500'}`}>{r.status}</span> },
        ]}
        actions={r=>r.status==='pending'&&(
          <div className="flex gap-2">
            <button onClick={()=>reviewMut.mutate({id:r.id,status:'approved'})} className="text-xs text-green-500 font-bold">Approve</button>
            <button onClick={()=>reviewMut.mutate({id:r.id,status:'rejected'})} className="text-xs text-red-400 font-bold">Reject</button>
          </div>
        )}
      />
    </div>
  )
}

// ─── Admin Forum ─────────────────────────────────────────────────
export function AdminForum() {
  const { data, isLoading } = useQuery('admin-threads', () => api.get('/forum/threads?limit=50').then(r => r.data))
  return <AdminTable title="Forum Threads" icon="fa-comments"
    loading={isLoading} data={data}
    columns={[
      { key:'title',    label:'Thread',   render:r=><div><div className="font-semibold text-sm">{r.title}</div><div className="text-xs text-earth/40">{r.category_name}</div></div> },
      { key:'author',   label:'Author',   render:r=><span className="text-xs">{r.author_name}</span> },
      { key:'replies',  label:'Replies',  render:r=><span className="font-semibold text-sm">{r.reply_count}</span> },
      { key:'views',    label:'Views',    render:r=><span className="text-xs">{r.view_count}</span> },
      { key:'status',   label:'Status',   render:r=><span className={`text-xs font-bold uppercase ${r.status==='open'?'text-green-500':r.status==='pinned'?'text-gold':'text-earth/40'}`}>{r.status}</span> },
      { key:'date',     label:'Date',     render:r=><span className="text-xs text-earth/40">{format(new Date(r.created_at),'MMM d, yyyy')}</span> },
    ]}
    actions={r=>(
      <div className="flex gap-2">
        <button className="text-xs text-yellow-500 font-semibold">{r.is_pinned?'Unpin':'Pin'}</button>
        <button className="text-xs text-red-400 font-semibold">Remove</button>
      </div>
    )}
  />
}
