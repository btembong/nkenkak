import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from 'react-query'
import { useForm } from 'react-hook-form'
import { Link } from 'react-router-dom'
import { format } from 'date-fns'
import toast from 'react-hot-toast'
import api from '../../services/api'
import ImageUploader from '../common/ImageUploader'

/* ── Gallery URL manager (multi-image for a project) ── */
function GalleryManager({ projectId, onClose }) {
  const qc = useQueryClient()
  const [urls, setUrls] = useState([])
  const [newUrl, setNewUrl] = useState('')
  const [uploading, setUploading] = useState(false)

  const { data: project } = useQuery(['gallery-project', projectId], () =>
    api.get(`/projects/${projectId}`).then(r => { setUrls(r.data.galleryUrls||[]); return r.data })
  )

  const saveMut = useMutation(
    () => api.patch(`/projects/${projectId}/gallery`, { gallery_urls: urls }),
    { onSuccess: () => { qc.invalidateQueries('admin-projects'); toast.success('Gallery saved!'); onClose() } }
  )

  const addUrl = () => { if (newUrl.trim()) { setUrls(u => [...u, newUrl.trim()]); setNewUrl('') } }
  const removeUrl = (i) => setUrls(u => u.filter((_,idx)=>idx!==i))

  const handleUpload = async (e) => {
    const file = e.target.files?.[0]; if (!file) return
    setUploading(true)
    try {
      const fd = new FormData(); fd.append('file', file); fd.append('folder','nkenkak/projects')
      const res = await api.post('/upload', fd)
      setUrls(u => [...u, res.data.url])
    } catch { toast.error('Upload failed') }
    finally { setUploading(false) }
  }

  return (
    <div className="space-y-5">
      <p className="text-sm" style={{color:'#525252',fontFamily:'Poppins,sans-serif'}}>
        Add multiple photos to the project gallery. Each photo appears on the public project detail page.
      </p>

      {/* Upload from computer */}
      <div>
        <label className="block text-xs font-semibold mb-2" style={{color:'#525252',fontFamily:'Sora,sans-serif'}}>Upload from Computer</label>
        <label className="flex items-center gap-3 px-4 py-3 rounded-2xl cursor-pointer transition-all hover:opacity-80"
          style={{background:'rgba(91,45,142,0.05)',border:'1px dashed rgba(91,45,142,0.2)'}}>
          <div className="w-8 h-8 rounded-xl flex items-center justify-center" style={{background:'linear-gradient(135deg,#5B2D8E,#7B4DB8)'}}>
            {uploading ? <div className="w-4 h-4 rounded-full border-2 border-white/30 border-t-white animate-spin"/> : <i className="fas fa-cloud-upload-alt text-white text-xs"/>}
          </div>
          <span className="text-sm" style={{color:'#5B2D8E',fontFamily:'Poppins,sans-serif'}}>{uploading?'Uploading…':'Choose a photo to upload'}</span>
          <input type="file" accept="image/*" onChange={handleUpload} className="hidden"/>
        </label>
      </div>

      {/* Or paste URL */}
      <div>
        <label className="block text-xs font-semibold mb-2" style={{color:'#525252',fontFamily:'Sora,sans-serif'}}>Or Paste Image URL</label>
        <div className="flex gap-2">
          <input value={newUrl} onChange={e=>setNewUrl(e.target.value)} onKeyDown={e=>e.key==='Enter'&&addUrl()}
            className="flex-1 input !py-2.5" placeholder="https://res.cloudinary.com/…"/>
          <button onClick={addUrl} className="btn-secondary !py-2.5 !px-4 !text-xs">
            <i className="fas fa-plus text-[10px]"/>Add
          </button>
        </div>
      </div>

      {/* Current gallery */}
      {urls.length > 0 && (
        <div>
          <p className="text-xs font-semibold mb-3" style={{color:'#525252',fontFamily:'Sora,sans-serif'}}>Gallery ({urls.length} photos)</p>
          <div className="grid grid-cols-3 gap-3">
            {urls.map((u,i)=>(
              <div key={i} className="relative group rounded-2xl overflow-hidden" style={{aspectRatio:'4/3',background:'rgba(91,45,142,0.05)'}}>
                <img src={u} alt="" className="w-full h-full object-cover"/>
                <button onClick={()=>removeUrl(i)}
                  className="absolute top-1.5 right-1.5 w-6 h-6 rounded-full bg-red-500 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                  <i className="fas fa-times text-[10px]"/>
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {urls.length === 0 && <p className="text-center py-4 text-sm" style={{color:'#A3A3A3',fontFamily:'Poppins,sans-serif'}}>No gallery photos yet.</p>}

      <div className="flex gap-3 pt-2">
        <button onClick={onClose} className="flex-1 py-3 rounded-2xl text-sm font-semibold" style={{background:'rgba(91,45,142,0.05)',color:'#737373',border:'1px solid rgba(91,45,142,0.1)',fontFamily:'Sora,sans-serif'}}>Cancel</button>
        <button onClick={()=>saveMut.mutate()} disabled={saveMut.isLoading} className="btn-secondary flex-1 justify-center">
          {saveMut.isLoading?<><i className="fas fa-spinner animate-spin"/>Saving…</>:<><i className="fas fa-save"/>Save Gallery</>}
        </button>
      </div>
    </div>
  )
}

function StatusBadge({ status }) {
  const map = { active:'#16a34a', completed:'#C87800', upcoming:'#5B2D8E', paused:'#dc2626',
                published:'#16a34a', draft:'#C87800', archived:'#737373', pending:'#C87800',
                approved:'#16a34a', rejected:'#dc2626', open:'#16a34a', closed:'#737373',
                banned:'#dc2626', inactive:'#737373' }
  const c = map[status] || '#737373'
  return <span className="text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full" style={{background:`${c}12`,color:c}}>{status}</span>
}

function ActionBtn({ label, color='#5B2D8E', onClick, icon, disabled }) {
  return (
    <button onClick={onClick} disabled={disabled}
      className="text-xs font-semibold flex items-center gap-1 px-3 py-1.5 rounded-xl transition-all hover:opacity-80 disabled:opacity-40"
      style={{color,background:`${color}12`,fontFamily:'Sora,sans-serif'}}>
      {icon && <i className={`fas ${icon} text-[10px]`}/>}{label}
    </button>
  )
}

function Modal({ open, onClose, title, sub, children, wide }) {
  if (!open) return null
  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto py-4 px-4"
      style={{background:'rgba(26,10,53,0.8)',backdropFilter:'blur(8px)'}}
      onClick={e=>e.target===e.currentTarget&&onClose()}>
      <div className={`bg-white rounded-3xl w-full my-auto ${wide?'max-w-2xl':'max-w-lg'}`}
        style={{boxShadow:'0 32px 80px rgba(26,10,53,0.25)'}}>
        <div className="px-7 pt-6 pb-4 border-b flex items-start justify-between" style={{borderColor:'rgba(91,45,142,0.08)'}}>
          <div>
            <h3 className="font-display font-bold text-xl" style={{color:'#1A0A35'}}>{title}</h3>
            {sub && <p className="text-sm mt-0.5" style={{color:'#737373',fontFamily:'Poppins,sans-serif'}}>{sub}</p>}
          </div>
          <button onClick={onClose} className="w-9 h-9 rounded-full flex items-center justify-center hover:bg-gray-100 flex-shrink-0" style={{color:'#A3A3A3'}}>
            <i className="fas fa-times"/>
          </button>
        </div>
        <div className="p-7">{children}</div>
      </div>
    </div>
  )
}

/* ── ADMIN PROJECTS ── */
export function AdminProjects() {
  const qc = useQueryClient()
  const [showForm,      setShowForm]      = useState(false)
  const [editing,       setEditing]       = useState(null)
  const [coverImg,      setCoverImg]      = useState('')
  const [view,          setView]          = useState('grid')
  const [filterCat,     setFilterCat]     = useState('all')
  const [galleryProject,setGalleryProject]= useState(null)

  const { data: projects, isLoading } = useQuery('admin-projects',
    () => api.get('/projects?limit=100').then(r => r.data.projects))
  const { register, handleSubmit, reset, setValue, formState:{errors} } = useForm()

  const saveMut = useMutation(
    data => editing ? api.patch(`/projects/${editing.id}`, data) : api.post('/projects', data),
    { onSuccess: () => { qc.invalidateQueries('admin-projects'); toast.success(editing?'Updated!':'Created!'); setShowForm(false); setEditing(null); setCoverImg(''); reset() } }
  )
  const deleteMut  = useMutation(id => api.delete(`/projects/${id}`), { onSuccess: () => { qc.invalidateQueries('admin-projects'); toast.success('Deleted') } })
  const featureMut = useMutation(({id,isFeatured}) => api.patch(`/projects/${id}`,{is_featured:!isFeatured}), { onSuccess: () => qc.invalidateQueries('admin-projects') })

  const openNew  = () => { setEditing(null); setCoverImg(''); reset(); setShowForm(true) }
  const openEdit = (p) => {
    setEditing(p); setCoverImg(p.coverImage||'')
    Object.entries(p).forEach(([k,v]) => setValue(k,v))
    setValue('goal_amount', p.goalAmount)
    setValue('cover_image', p.coverImage||'')
    setValue('is_featured', p.isFeatured)
    setValue('is_urgent', p.isUrgent)
    setValue('start_date', p.startDate ? format(new Date(p.startDate),'yyyy-MM-dd') : '')
    setValue('end_date',   p.endDate   ? format(new Date(p.endDate),'yyyy-MM-dd') : '')
    setShowForm(true)
  }

  const CATS = ['all','education','health','infrastructure','environment','culture','agriculture']
  const filtered = projects?.filter(p => filterCat==='all' || p.category===filterCat)

  return (
    <div>
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl flex items-center justify-center" style={{background:'linear-gradient(135deg,#5B2D8E,#7B4DB8)'}}>
            <i className="fas fa-seedling text-sm text-white"/>
          </div>
          <div>
            <h2 className="font-display font-bold text-xl" style={{color:'#1A0A35'}}>Projects</h2>
            <p className="text-xs" style={{color:'#A3A3A3',fontFamily:'Poppins,sans-serif'}}>{projects?.length||0} total projects</p>
          </div>
        </div>
        <div className="flex gap-2">
          <div className="flex gap-1 p-1 rounded-xl" style={{background:'rgba(91,45,142,0.06)'}}>
            {[['grid','fa-th-large'],['list','fa-list']].map(([v,ic])=>(
              <button key={v} onClick={()=>setView(v)}
                className="w-8 h-8 rounded-lg flex items-center justify-center transition-all"
                style={{background:view===v?'#fff':'transparent',color:view===v?'#5B2D8E':'#A3A3A3',boxShadow:view===v?'0 1px 4px rgba(91,45,142,0.12)':'none'}}>
                <i className={`fas ${ic} text-xs`}/>
              </button>
            ))}
          </div>
          <button onClick={openNew} className="btn-secondary !py-2 !px-4 !text-xs">
            <i className="fas fa-plus text-[10px]"/>New Project
          </button>
        </div>
      </div>

      {/* Category filter */}
      <div className="flex gap-2 flex-wrap mb-5">
        {CATS.map(c=>(
          <button key={c} onClick={()=>setFilterCat(c)}
            className="px-3 py-1.5 rounded-full text-xs font-semibold transition-all capitalize"
            style={{background:filterCat===c?'linear-gradient(135deg,#5B2D8E,#7B4DB8)':'#fff',color:filterCat===c?'#fff':'#5B2D8E',boxShadow:'0 1px 6px rgba(91,45,142,0.1)',fontFamily:'Sora,sans-serif'}}>
            {c==='all'?'All':c}
          </button>
        ))}
      </div>

      {/* Grid / List */}
      {isLoading ? (
        <div className="grid md:grid-cols-3 gap-4">{[1,2,3].map(i=><div key={i} className="h-48 rounded-3xl animate-pulse" style={{background:'rgba(91,45,142,0.04)'}}/>)}</div>
      ) : !filtered?.length ? (
        <div className="text-center py-16 rounded-3xl" style={{background:'rgba(91,45,142,0.02)',border:'1px dashed rgba(91,45,142,0.1)'}}>
          <i className="fas fa-seedling text-4xl mb-3 block" style={{color:'rgba(91,45,142,0.15)'}}/>
          <p className="text-sm mb-3" style={{color:'#737373',fontFamily:'Poppins,sans-serif'}}>No projects found</p>
          <button onClick={openNew} className="btn-secondary !text-sm !py-2 !px-5">Create Project</button>
        </div>
      ) : view==='grid' ? (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map(p => {
            const pct = p.goalAmount>0 ? Math.min(100,Math.round((p.raisedAmount/p.goalAmount)*100)) : 0
            return (
              <div key={p.id} className="card p-0 overflow-hidden">
                {/* Cover image */}
                <div className="relative h-40 overflow-hidden" style={{background:'linear-gradient(135deg,#250F47,#5B2D8E)'}}>
                  {p.coverImage
                    ? <img src={p.coverImage} alt={p.title} className="w-full h-full object-cover"/>
                    : <div className="w-full h-full flex items-center justify-center"><i className="fas fa-seedling text-3xl" style={{color:'rgba(240,165,0,0.3)'}}/></div>}
                  <div className="absolute top-2 left-2 flex gap-1.5">
                    <StatusBadge status={p.status}/>
                    {p.isFeatured && <span className="text-[9px] font-bold px-2 py-0.5 rounded-full" style={{background:'rgba(240,165,0,0.9)',color:'#1A0A35'}}>Featured</span>}
                  </div>
                  <button onClick={()=>featureMut.mutate(p)} title={p.isFeatured?'Unfeature':'Feature'}
                    className="absolute top-2 right-2 w-7 h-7 rounded-full flex items-center justify-center"
                    style={{background:p.isFeatured?'rgba(240,165,0,0.9)':'rgba(255,255,255,0.2)',color:p.isFeatured?'#1A0A35':'rgba(255,255,255,0.8)'}}>
                    <i className="fas fa-star text-[10px]"/>
                  </button>
                </div>
                <div className="p-4">
                  <div className="flex items-center gap-1.5 mb-1.5"><span className="tag !text-[9px] capitalize">{p.category}</span></div>
                  <h4 className="font-display font-semibold text-sm mb-1 line-clamp-1" style={{color:'#1A0A35'}}>{p.title}</h4>
                  <div className="mb-2">
                    <div className="flex justify-between text-[10px] mb-1" style={{fontFamily:'Poppins,sans-serif',color:'#A3A3A3'}}>
                      <span>Raised: <strong style={{color:'#5B2D8E'}}>{Number(p.raisedAmount||0).toLocaleString()} XAF</strong></span>
                      <span>{pct}%</span>
                    </div>
                    <div className="h-1.5 rounded-full" style={{background:'rgba(91,45,142,0.08)'}}>
                      <div className="h-full rounded-full" style={{width:`${pct}%`,background:'linear-gradient(90deg,#5B2D8E,#F0A500)'}}/>
                    </div>
                  </div>
                  <div className="flex gap-2 pt-2 border-t" style={{borderColor:'rgba(91,45,142,0.06)'}}>
                    <button onClick={()=>openEdit(p)} className="flex-1 text-xs font-semibold py-1.5 rounded-xl border transition-all hover:bg-primary-50" style={{color:'#5B2D8E',borderColor:'rgba(91,45,142,0.15)',fontFamily:'Sora,sans-serif'}}>
                      <i className="fas fa-pen text-[10px] mr-1"/>Edit
                    </button>
                    <button onClick={()=>setGalleryProject(p.id)} className="flex-1 text-xs font-semibold py-1.5 rounded-xl border transition-all hover:bg-amber-50" style={{color:'#C87800',borderColor:'rgba(200,120,0,0.15)',fontFamily:'Sora,sans-serif'}}>
                      <i className="fas fa-images text-[10px] mr-1"/>Gallery
                    </button>
                    <button onClick={()=>{if(confirm('Delete?'))deleteMut.mutate(p.id)}}
                      className="w-8 h-8 rounded-xl flex items-center justify-center border hover:bg-red-50 flex-shrink-0"
                      style={{color:'#dc2626',borderColor:'rgba(220,38,38,0.15)'}}>
                      <i className="fas fa-trash text-[10px]"/>
                    </button>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      ) : (
        <div className="card overflow-hidden">
          <table className="w-full">
            <thead style={{background:'rgba(91,45,142,0.04)'}}>
              <tr>{['Project','Category','Status','Raised','Featured','Actions'].map(h=>(
                <th key={h} className="text-left px-4 py-3 text-xs font-bold uppercase tracking-widest" style={{color:'#5B2D8E',fontFamily:'Sora,sans-serif'}}>{h}</th>
              ))}</tr>
            </thead>
            <tbody>
              {filtered.map(p=>(
                <tr key={p.id} className="border-b transition-colors hover:bg-gray-50" style={{borderColor:'rgba(91,45,142,0.05)'}}>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl overflow-hidden flex-shrink-0" style={{background:'linear-gradient(135deg,#250F47,#5B2D8E)'}}>
                        {p.coverImage ? <img src={p.coverImage} className="w-full h-full object-cover"/> : <div className="w-full h-full flex items-center justify-center"><i className="fas fa-seedling text-xs" style={{color:'rgba(240,165,0,0.4)'}}/></div>}
                      </div>
                      <div className="font-semibold text-xs line-clamp-1" style={{color:'#1A0A35',fontFamily:'Sora,sans-serif',maxWidth:180}}>{p.title}</div>
                    </div>
                  </td>
                  <td className="px-4 py-3"><span className="tag !text-[9px] capitalize">{p.category}</span></td>
                  <td className="px-4 py-3"><StatusBadge status={p.status}/></td>
                  <td className="px-4 py-3 text-xs font-semibold" style={{color:'#1A0A35',fontFamily:'Sora,sans-serif'}}>{Number(p.raisedAmount||0).toLocaleString()}</td>
                  <td className="px-4 py-3">
                    <button onClick={()=>featureMut.mutate(p)} className="w-9 h-5 rounded-full flex items-center transition-all" style={{background:p.isFeatured?'#5B2D8E':'rgba(91,45,142,0.15)',padding:'2px'}}>
                      <div className="w-4 h-4 rounded-full bg-white transition-transform" style={{transform:p.isFeatured?'translateX(16px)':'translateX(0)'}}/>
                    </button>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex gap-2">
                      <ActionBtn label="Edit" icon="fa-pen" color="#5B2D8E" onClick={()=>openEdit(p)}/>
                      <ActionBtn label="Gallery" icon="fa-images" color="#C87800" onClick={()=>setGalleryProject(p.id)}/>
                      <ActionBtn label="Delete" icon="fa-trash" color="#dc2626" onClick={()=>{if(confirm('Delete?'))deleteMut.mutate(p.id)}}/>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Form modal */}
      <Modal open={showForm} onClose={()=>{setShowForm(false);setEditing(null);setCoverImg('');reset()}}
        title={editing?'Edit Project':'New Project'}
        sub={editing?`Editing: ${editing.title}`:'Create a new community project'}
        wide>
        <form onSubmit={handleSubmit(d=>saveMut.mutate({...d,cover_image:coverImg}))} className="space-y-4">
          {/* Cover image with uploader */}
          <ImageUploader value={coverImg} onChange={setCoverImg}
            folder="nkenkak/projects" aspect="landscape"
            label="Cover Image"
            hint="Recommended: 1280×720px or wider. This appears on the project card."/>

          <div className="grid grid-cols-2 gap-4">
            <div className="col-span-2">
              <label className="label">Project Title *</label>
              <input {...register('title',{required:'Title required'})} className="input" placeholder="e.g. Primary School Renovation"/>
              {errors.title && <p className="text-xs mt-1" style={{color:'#dc2626'}}>{errors.title.message}</p>}
            </div>
            <div>
              <label className="label">Category *</label>
              <select {...register('category',{required:true})} className="input">
                <option value="">Select…</option>
                {['education','health','infrastructure','environment','culture','agriculture','other'].map(c=>(
                  <option key={c} value={c} className="capitalize">{c}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="label">Status</label>
              <select {...register('status')} className="input">
                {['upcoming','active','completed','paused'].map(s=><option key={s} value={s} className="capitalize">{s}</option>)}
              </select>
            </div>
          </div>

          <div>
            <label className="label">Short Summary *</label>
            <input {...register('summary',{required:'Summary required'})} className="input" placeholder="One-line description shown on cards"/>
          </div>
          <div>
            <label className="label">Full Description *</label>
            <textarea {...register('description',{required:'Description required'})} rows={4} className="input resize-none" placeholder="Detailed project description, goals, beneficiaries…"/>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="label">Goal Amount (XAF) *</label>
              <input type="number" {...register('goal_amount',{required:true,min:1})} className="input" placeholder="5000000"/>
            </div>
            <div>
              <label className="label">Location</label>
              <input {...register('location')} className="input" placeholder="Village Square"/>
            </div>
            <div>
              <label className="label">Beneficiaries</label>
              <input type="number" {...register('beneficiaries')} className="input" placeholder="e.g. 320"/>
            </div>
            <div>
              <label className="label">Start Date</label>
              <input type="date" {...register('start_date')} className="input"/>
            </div>
            <div>
              <label className="label">End Date</label>
              <input type="date" {...register('end_date')} className="input"/>
            </div>
          </div>

          <div className="flex gap-5">
            <label className="flex items-center gap-2 cursor-pointer text-sm" style={{fontFamily:'Poppins,sans-serif'}}>
              <input type="checkbox" {...register('is_featured')} className="w-4 h-4 rounded accent-purple-600"/>Featured
            </label>
            <label className="flex items-center gap-2 cursor-pointer text-sm" style={{fontFamily:'Poppins,sans-serif'}}>
              <input type="checkbox" {...register('is_urgent')} className="w-4 h-4 rounded accent-red-600"/>Urgent
            </label>
          </div>

          <div className="flex gap-3 pt-2">
            <button type="button" onClick={()=>{setShowForm(false);setEditing(null);setCoverImg('');reset()}}
              className="flex-1 py-3 rounded-2xl text-sm font-semibold"
              style={{background:'rgba(91,45,142,0.05)',color:'#737373',border:'1px solid rgba(91,45,142,0.1)',fontFamily:'Sora,sans-serif'}}>Cancel</button>
            <button type="submit" disabled={saveMut.isLoading} className="btn-secondary flex-1 justify-center">
              {saveMut.isLoading?<><i className="fas fa-spinner animate-spin"/>Saving…</>:<><i className="fas fa-save"/>{editing?'Save Changes':'Create Project'}</>}
            </button>
          </div>
        </form>
      </Modal>

      {/* Gallery modal */}
      <Modal open={!!galleryProject} onClose={()=>setGalleryProject(null)}
        title="Project Gallery" sub="Upload or paste image URLs for this project's photo gallery" wide>
        {galleryProject && <GalleryManager projectId={galleryProject} onClose={()=>setGalleryProject(null)}/>}
      </Modal>
    </div>
  )
}

export default AdminProjects
export { StatusBadge, ActionBtn, Modal }
