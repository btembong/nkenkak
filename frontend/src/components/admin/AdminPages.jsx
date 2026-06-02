import { useState, useEffect } from 'react'
import { useQuery, useMutation, useQueryClient } from 'react-query'
import { useForm } from 'react-hook-form'
import { format } from 'date-fns'
import toast from 'react-hot-toast'
import { Link } from 'react-router-dom'
import api from '../../services/api'
import { cn } from '../../lib/utils'
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card'
import { Badge } from '../ui/badge'
import { Progress } from '../ui/progress'

/* ═══════════════════════════════════════════════
   SHARED UTILITIES
═══════════════════════════════════════════════ */
function PageHeader({ title, sub, icon, children }) {
  return (
    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-2xl flex items-center justify-center flex-shrink-0 bg-gradient-to-br from-primary-500 to-primary-light">
          <i className={`fas ${icon} text-sm text-white`}/>
        </div>
        <div>
          <h2 className="font-bold text-xl text-dark">{title}</h2>
          {sub && <p className="text-xs text-muted-foreground">{sub}</p>}
        </div>
      </div>
      <div className="flex items-center gap-2 flex-wrap">{children}</div>
    </div>
  )
}

const STATUS_VARIANT_MAP = {
  active: 'active', published: 'active', approved: 'active', open: 'active',
  completed: 'complete', upcoming: 'upcoming',
  paused: 'paused', banned: 'paused', rejected: 'destructive',
  draft: 'gold', pending: 'gold',
  archived: 'secondary', inactive: 'secondary', closed: 'secondary',
}

function StatusBadge({ status }) {
  return <Badge variant={STATUS_VARIANT_MAP[status] || 'secondary'} className="text-[10px] px-2 py-0.5">{status}</Badge>
}

function ActionBtn({ label, color = '#5B2D8E', onClick, icon, disabled }) {
  return (
    <button onClick={onClick} disabled={disabled}
      className="text-xs font-semibold flex items-center gap-1 px-3 py-1.5 rounded-xl transition-all hover:opacity-80 disabled:opacity-40"
      style={{ color, background: `${color}12` }}>
      {icon && <i className={`fas ${icon} text-[10px]`}/>}{label}
    </button>
  )
}

function Modal({ open, onClose, title, sub, children, wide }) {
  if (!open) return null
  return (
    <div
      className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto py-6 px-4 bg-dark/80 backdrop-blur-sm"
      onClick={e => e.target === e.currentTarget && onClose()}>
      <div className={cn('bg-white rounded-3xl w-full relative my-auto shadow-[0_32px_80px_rgba(26,10,53,0.25)] border border-primary-500/8', wide ? 'max-w-3xl' : 'max-w-xl')}>
        <div className="px-7 pt-6 pb-5 border-b border-primary-500/8 flex items-start justify-between">
          <div>
            <h3 className="font-bold text-xl text-dark">{title}</h3>
            {sub && <p className="text-sm mt-0.5 text-muted-foreground">{sub}</p>}
          </div>
          <button onClick={onClose} className="w-9 h-9 rounded-full flex items-center justify-center hover:bg-gray-100 transition-colors flex-shrink-0 text-muted-foreground">
            <i className="fas fa-times"/>
          </button>
        </div>
        <div className="p-7">{children}</div>
      </div>
    </div>
  )
}

function FormRow({ children }) { return <div className="grid md:grid-cols-2 gap-4">{children}</div> }
function FormGroup({ label, error, children, full }) {
  return (
    <div className={full ? 'md:col-span-2' : ''}>
      <label className="label">{label}</label>
      {children}
      {error && <p className="text-xs mt-1 text-red-500">{error}</p>}
    </div>
  )
}

function EmptyState({ icon, title, sub, action }) {
  return (
    <div className="text-center py-16 rounded-3xl bg-primary-500/2 border border-dashed border-primary-500/10">
      <i className={`fas ${icon} text-4xl mb-3 block text-primary-500/15`}/>
      <h4 className="font-semibold mb-1 text-muted-foreground">{title}</h4>
      {sub && <p className="text-sm mb-4 text-muted-foreground/70">{sub}</p>}
      {action}
    </div>
  )
}

/* ═══════════════════════════════════════════════
   ADMIN PROJECTS
═══════════════════════════════════════════════ */
export function AdminProjects() {
  const qc = useQueryClient()
  const [showForm, setShowForm] = useState(false)
  const [editing,  setEditing]  = useState(null)
  const [view,     setView]     = useState('grid')
  const [filterCat, setFilterCat] = useState('all')

  const { data: projects, isLoading } = useQuery('admin-projects',
    () => api.get('/projects?limit=100').then(r => r.data.projects))

  const { register, handleSubmit, reset, setValue, formState: { errors } } = useForm()

  const saveMut = useMutation(
    (data) => editing ? api.patch(`/projects/${editing.id}`, data) : api.post('/projects', data),
    { onSuccess: () => { qc.invalidateQueries('admin-projects'); toast.success(editing ? 'Project updated!' : 'Project created!'); setShowForm(false); setEditing(null); reset() } }
  )
  const deleteMut = useMutation(id => api.delete(`/projects/${id}`), {
    onSuccess: () => { qc.invalidateQueries('admin-projects'); toast.success('Project deleted') }
  })
  const featureMut = useMutation(({ id, is_featured }) => api.patch(`/projects/${id}`, { is_featured: !is_featured }), {
    onSuccess: () => qc.invalidateQueries('admin-projects')
  })

  const openEdit = (p) => {
    setEditing(p)
    Object.keys(p).forEach(k => setValue(k, p[k]))
    setShowForm(true)
  }
  const openNew = () => { setEditing(null); reset(); setShowForm(true) }

  const CATS = ['all', 'education', 'health', 'infrastructure', 'environment', 'culture', 'agriculture']
  const filtered = projects?.filter(p => filterCat === 'all' || p.category === filterCat)

  return (
    <div>
      <PageHeader title="Projects" sub={`${projects?.length || 0} total projects`} icon="fa-seedling">
        <div className="flex gap-1 p-1 rounded-xl bg-primary-50">
          {[['grid', 'fa-th-large'], ['list', 'fa-list']].map(([v, ic]) => (
            <button key={v} onClick={() => setView(v)}
              className={cn('w-8 h-8 rounded-lg flex items-center justify-center transition-all',
                view === v ? 'bg-white text-primary-500 shadow-sm' : 'text-muted-foreground')}>
              <i className={`fas ${ic} text-xs`}/>
            </button>
          ))}
        </div>
        <button onClick={openNew} className="btn-secondary !py-2 !px-4 !text-xs">
          <i className="fas fa-plus text-[10px]"/>New Project
        </button>
      </PageHeader>

      <div className="flex gap-2 flex-wrap mb-5">
        {CATS.map(c => (
          <button key={c} onClick={() => setFilterCat(c)}
            className={cn('px-3 py-1.5 rounded-full text-xs font-semibold transition-all capitalize shadow-sm',
              filterCat === c ? 'bg-gradient-to-br from-primary-500 to-primary-light text-white' : 'bg-white text-primary-500')}>
            {c === 'all' ? 'All Categories' : c}
          </button>
        ))}
      </div>

      {isLoading ? (
        <div className="grid md:grid-cols-3 gap-4">{[1,2,3,4,5,6].map(i => <div key={i} className="h-48 rounded-3xl animate-pulse bg-primary-500/4"/>)}</div>
      ) : !filtered?.length ? (
        <EmptyState icon="fa-seedling" title="No projects yet" sub="Create your first community project"
          action={<button onClick={openNew} className="btn-secondary !text-sm !py-2.5 !px-5">Create Project</button>}/>
      ) : view === 'grid' ? (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map(p => {
            const pct = p.goal_amount > 0 ? Math.min(100, Math.round((p.raised_amount / p.goal_amount) * 100)) : 0
            return (
              <Card key={p.id} className="p-5">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-2 flex-wrap">
                    <StatusBadge status={p.status}/>
                    <span className="tag text-[10px] capitalize">{p.category}</span>
                  </div>
                  <div className="flex gap-1.5 flex-shrink-0">
                    <button onClick={() => featureMut.mutate(p)} title={p.is_featured ? 'Unfeature' : 'Feature'}
                      className={cn('w-7 h-7 rounded-full flex items-center justify-center transition-colors',
                        p.is_featured ? 'bg-gold/12 text-gold' : 'bg-primary-50 text-muted-foreground')}>
                      <i className="fas fa-star text-[10px]"/>
                    </button>
                    {p.is_urgent && <Badge variant="destructive" className="text-[9px] px-2 py-0.5">Urgent</Badge>}
                  </div>
                </div>
                <h4 className="font-semibold text-sm mb-1 line-clamp-2 text-dark">{p.title}</h4>
                <p className="text-xs line-clamp-2 mb-3 text-muted-foreground">{p.summary}</p>
                <div className="mb-3">
                  <div className="flex justify-between text-xs mb-1">
                    <span className="text-muted-foreground">Raised: <strong className="text-primary-500">{Number(p.raised_amount || 0).toLocaleString()} XAF</strong></span>
                    <span className="text-muted-foreground">{pct}%</span>
                  </div>
                  <Progress value={pct} className="h-1.5"/>
                </div>
                <div className="flex items-center justify-between text-xs mb-4 text-muted-foreground">
                  <span><i className="fas fa-users mr-1"/>{p.donor_count || 0} donors</span>
                  <span><i className="fas fa-eye mr-1"/>{p.view_count || 0} views</span>
                </div>
                <div className="flex gap-2 pt-3 border-t border-primary-500/6">
                  <button onClick={() => openEdit(p)} className="flex-1 text-xs font-semibold py-2 rounded-xl border border-primary-500/15 text-primary-500 transition-all hover:bg-primary-50">
                    <i className="fas fa-pen text-[10px] mr-1"/>Edit
                  </button>
                  <Link to={`/projects/${p.slug}`} className="flex-1 text-center text-xs font-semibold py-2 rounded-xl border border-border text-muted-foreground transition-all hover:bg-gray-50">
                    <i className="fas fa-eye text-[10px] mr-1"/>View
                  </Link>
                  <button onClick={() => { if (confirm('Delete this project?')) deleteMut.mutate(p.id) }}
                    className="w-9 h-9 rounded-xl flex items-center justify-center border border-red-500/15 text-red-500 transition-all hover:bg-red-50 flex-shrink-0">
                    <i className="fas fa-trash text-[10px]"/>
                  </button>
                </div>
              </Card>
            )
          })}
        </div>
      ) : (
        <Card className="overflow-hidden p-0">
          <table className="w-full">
            <thead className="bg-primary-500/4">
              <tr>{['Title', 'Category', 'Status', 'Raised', 'Donors', 'Featured', 'Actions'].map(h => (
                <th key={h} className="text-left px-4 py-3 text-xs font-bold uppercase tracking-widest text-primary-500">{h}</th>
              ))}</tr>
            </thead>
            <tbody>
              {filtered.map(p => (
                <tr key={p.id} className="border-b border-primary-500/5 hover:bg-primary-50/40 transition-colors">
                  <td className="px-4 py-3"><div className="font-semibold text-xs line-clamp-1 text-dark max-w-[200px]">{p.title}</div></td>
                  <td className="px-4 py-3"><span className="tag text-[10px] capitalize">{p.category}</span></td>
                  <td className="px-4 py-3"><StatusBadge status={p.status}/></td>
                  <td className="px-4 py-3 text-xs font-semibold text-dark">{Number(p.raised_amount || 0).toLocaleString()}</td>
                  <td className="px-4 py-3 text-xs text-muted-foreground">{p.donor_count || 0}</td>
                  <td className="px-4 py-3">
                    <button onClick={() => featureMut.mutate(p)} className="w-8 h-5 rounded-full flex items-center transition-all"
                      style={{ background: p.is_featured ? '#5B2D8E' : 'rgba(91,45,142,0.15)', padding: '2px' }}>
                      <div className="w-4 h-4 rounded-full bg-white transition-transform" style={{ transform: p.is_featured ? 'translateX(12px)' : 'translateX(0)' }}/>
                    </button>
                  </td>
                  <td className="px-4 py-3"><div className="flex gap-2">
                    <ActionBtn label="Edit" icon="fa-pen" color="#5B2D8E" onClick={() => openEdit(p)}/>
                    <ActionBtn label="Delete" icon="fa-trash" color="#dc2626" onClick={() => { if (confirm('Delete?')) deleteMut.mutate(p.id) }}/>
                  </div></td>
                </tr>
              ))}
            </tbody>
          </table>
        </Card>
      )}

      <Modal open={showForm} onClose={() => { setShowForm(false); setEditing(null); reset() }}
        title={editing ? 'Edit Project' : 'New Project'}
        sub={editing ? `Editing: ${editing.title}` : 'Fill in the details for the new community project'}
        wide>
        <form onSubmit={handleSubmit(d => saveMut.mutate(d))} className="space-y-4">
          <FormRow>
            <FormGroup label="Project Title *" error={errors.title?.message}>
              <input {...register('title', { required: 'Title required' })} className="input" placeholder="e.g. Primary School Renovation"/>
            </FormGroup>
            <FormGroup label="Category *" error={errors.category?.message}>
              <select {...register('category', { required: 'Category required' })} className="input">
                <option value="">Select category…</option>
                {['education', 'health', 'infrastructure', 'environment', 'culture', 'agriculture', 'other'].map(c => (
                  <option key={c} value={c} className="capitalize">{c}</option>
                ))}
              </select>
            </FormGroup>
          </FormRow>
          <FormGroup label="Short Summary *" error={errors.summary?.message} full>
            <input {...register('summary', { required: 'Summary required' })} className="input" placeholder="One sentence describing the project"/>
          </FormGroup>
          <FormGroup label="Full Description *" error={errors.description?.message} full>
            <textarea {...register('description', { required: 'Description required' })} rows={4} className="input resize-none" placeholder="Detailed project description…"/>
          </FormGroup>
          <FormRow>
            <FormGroup label="Goal Amount (XAF) *" error={errors.goal_amount?.message}>
              <input type="number" {...register('goal_amount', { required: 'Goal required', min: { value: 1, message: 'Must be > 0' } })} className="input" placeholder="e.g. 5000000"/>
            </FormGroup>
            <FormGroup label="Status">
              <select {...register('status')} className="input">
                {['upcoming', 'active', 'completed', 'paused'].map(s => <option key={s} value={s} className="capitalize">{s}</option>)}
              </select>
            </FormGroup>
          </FormRow>
          <FormRow>
            <FormGroup label="Location">
              <input {...register('location')} className="input" placeholder="e.g. Village Square"/>
            </FormGroup>
            <FormGroup label="Beneficiaries (number)">
              <input type="number" {...register('beneficiaries')} className="input" placeholder="e.g. 320"/>
            </FormGroup>
          </FormRow>
          <FormRow>
            <FormGroup label="Start Date">
              <input type="date" {...register('start_date')} className="input"/>
            </FormGroup>
            <FormGroup label="Target End Date">
              <input type="date" {...register('end_date')} className="input"/>
            </FormGroup>
          </FormRow>
          <FormGroup label="Cover Image URL" full>
            <input {...register('cover_image')} className="input" placeholder="https://…"/>
          </FormGroup>
          <div className="flex gap-4 pt-1">
            <label className="flex items-center gap-2 cursor-pointer text-sm">
              <input type="checkbox" {...register('is_featured')} className="w-4 h-4 rounded accent-primary-500"/>
              Mark as featured
            </label>
            <label className="flex items-center gap-2 cursor-pointer text-sm">
              <input type="checkbox" {...register('is_urgent')} className="w-4 h-4 rounded accent-primary-500"/>
              Mark as urgent
            </label>
          </div>
          <div className="flex gap-3 pt-2">
            <button type="button" onClick={() => { setShowForm(false); setEditing(null); reset() }}
              className="flex-1 py-3 rounded-2xl text-sm font-semibold border border-primary-500/10 text-muted-foreground bg-primary-50">
              Cancel
            </button>
            <button type="submit" disabled={saveMut.isLoading} className="btn-secondary flex-1 justify-center">
              {saveMut.isLoading ? <><i className="fas fa-spinner animate-spin"/>{editing ? 'Saving…' : 'Creating…'}</> : <><i className="fas fa-save"/>{editing ? 'Save Changes' : 'Create Project'}</>}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  )
}

/* ═══════════════════════════════════════════════
   ADMIN NEWS
═══════════════════════════════════════════════ */
export function AdminNews() {
  const qc = useQueryClient()
  const [showForm, setShowForm] = useState(false)
  const [editing,  setEditing]  = useState(null)
  const [selected, setSelected] = useState(new Set())
  const { register, handleSubmit, reset, setValue, watch, formState: { errors } } = useForm({ defaultValues: { status: 'draft' } })
  const status = watch('status')

  const { data: newsData, isLoading } = useQuery('admin-news', () => api.get('/news?limit=100&status=all').then(r => r.data))
  const data = newsData?.articles || newsData || []

  const saveMut = useMutation(
    (data) => editing ? api.patch(`/news/${editing.id}`, data) : api.post('/news', data),
    { onSuccess: () => { qc.invalidateQueries('admin-news'); toast.success(editing ? 'Article updated!' : 'Article created!'); setShowForm(false); setEditing(null); reset({ status: 'draft' }) } }
  )
  const deleteMut = useMutation((id) => api.delete(`/news/${id}`), { onSuccess: () => qc.invalidateQueries('admin-news') })

  const bulkDelete = async () => {
    if (!window.confirm(`Delete ${selected.size} article(s)?`)) return
    await Promise.all([...selected].map(id => api.delete(`/news/${id}`)))
    qc.invalidateQueries('admin-news'); setSelected(new Set()); toast.success('Deleted')
  }

  const allChecked = data.length > 0 && data.every(a => selected.has(a.id))
  const toggleAll = () => setSelected(allChecked ? new Set() : new Set(data.map(a => a.id)))
  const toggleOne = (id) => setSelected(prev => { const s = new Set(prev); s.has(id) ? s.delete(id) : s.add(id); return s })

  const openEdit = (a) => {
    setEditing(a)
    Object.keys(a).forEach(k => setValue(k, a[k]))
    setValue('cover_image', a.coverImage || '')
    if (a.scheduledAt) setValue('scheduled_at', new Date(a.scheduledAt).toISOString().slice(0, 16))
    setShowForm(true)
  }
  const openNew = () => { setEditing(null); reset({ status: 'draft' }); setShowForm(true) }

  return (
    <div>
      <PageHeader title="News & Articles" sub={`${Array.isArray(data) ? data.length : 0} articles`} icon="fa-newspaper">
        <button onClick={openNew} className="btn-secondary !py-2 !px-4 !text-xs">
          <i className="fas fa-pen text-[10px]"/>Write Article
        </button>
      </PageHeader>

      {selected.size > 0 && (
        <div className="flex items-center gap-3 mb-4 px-4 py-3 rounded-2xl bg-primary-50 border border-primary-500/12">
          <input type="checkbox" checked={allChecked} onChange={toggleAll} className="w-4 h-4 rounded accent-primary-500 cursor-pointer"/>
          <span className="text-xs font-semibold text-primary-500">{selected.size} selected</span>
          <button onClick={bulkDelete} className="text-xs font-semibold px-3 py-1.5 rounded-xl bg-red-500/8 text-red-600">
            <i className="fas fa-trash mr-1 text-[10px]"/>Delete All
          </button>
          <button onClick={() => setSelected(new Set())} className="ml-auto text-xs text-muted-foreground">Clear</button>
        </div>
      )}

      {isLoading ? (
        <div className="space-y-3">{[1,2,3].map(i => <div key={i} className="h-20 rounded-3xl animate-pulse bg-primary-500/4"/>)}</div>
      ) : !data?.length ? (
        <EmptyState icon="fa-newspaper" title="No articles yet" sub="Write your first village news article"
          action={<button onClick={openNew} className="btn-secondary !text-sm !py-2.5 !px-5">Write Article</button>}/>
      ) : (
        <div className="space-y-3">
          {!selected.size && (
            <label className="flex items-center gap-2 text-xs cursor-pointer mb-1 text-muted-foreground">
              <input type="checkbox" checked={allChecked} onChange={toggleAll} className="w-4 h-4 rounded accent-primary-500"/>
              Select all
            </label>
          )}
          {data.map(a => (
            <Card key={a.id} className={cn('p-4 flex items-center gap-4', selected.has(a.id) && 'bg-primary-50')}>
              <input type="checkbox" checked={selected.has(a.id)} onChange={() => toggleOne(a.id)} className="w-4 h-4 rounded accent-primary-500 cursor-pointer flex-shrink-0"/>
              <div className="w-14 h-14 rounded-2xl overflow-hidden flex items-center justify-center flex-shrink-0 bg-gradient-to-br from-dark to-primary-500">
                {a.coverImage ? <img src={a.coverImage} className="w-full h-full object-cover"/> : <i className="fas fa-newspaper text-white/30"/>}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-0.5 flex-wrap">
                  <h4 className="font-semibold text-sm truncate text-dark">{a.title}</h4>
                  <StatusBadge status={a.status}/>
                  {a.isFeatured && <Badge variant="gold" className="text-[9px] px-2 py-0.5">Featured</Badge>}
                </div>
                <p className="text-xs truncate mb-1 text-muted-foreground">{a.excerpt}</p>
                <div className="flex items-center gap-3 text-[10px] text-muted-foreground">
                  {a.category && <span className="tag !text-[9px]">{a.category}</span>}
                  <span>{a.author_name || '—'}</span>
                  <span><i className="fas fa-eye mr-0.5"/>{a.viewCount || 0}</span>
                  {a.status === 'scheduled' && a.scheduledAt && (
                    <Badge className="text-[9px] px-2 py-0.5">
                      <i className="fas fa-clock mr-0.5"/>Scheduled {format(new Date(a.scheduledAt), 'MMM d, HH:mm')}
                    </Badge>
                  )}
                  {a.publishedAt && <span>{format(new Date(a.publishedAt), 'MMM d, yyyy')}</span>}
                </div>
              </div>
              <div className="flex gap-2 flex-shrink-0">
                <ActionBtn label="Edit" icon="fa-pen" color="#5B2D8E" onClick={() => openEdit(a)}/>
                {a.status === 'draft' && <ActionBtn label="Publish" icon="fa-check" color="#16a34a" onClick={() => saveMut.mutate({ ...a, status: 'published' })}/>}
                <ActionBtn label="Delete" icon="fa-trash" color="#dc2626" onClick={() => { if (window.confirm('Delete?')) deleteMut.mutate(a.id) }}/>
                <Link to={`/news/${a.slug}`} className="text-xs font-semibold flex items-center gap-1 px-3 py-1.5 rounded-xl text-muted-foreground bg-black/4">
                  <i className="fas fa-eye text-[10px]"/>View
                </Link>
              </div>
            </Card>
          ))}
        </div>
      )}

      <Modal open={showForm} onClose={() => { setShowForm(false); setEditing(null); reset({ status: 'draft' }) }}
        title={editing ? 'Edit Article' : 'Write Article'} sub="Create or edit a village news article" wide>
        <form onSubmit={handleSubmit(d => saveMut.mutate(d))} className="space-y-4">
          <FormGroup label="Article Title *" error={errors.title?.message} full>
            <input {...register('title', { required: 'Title required' })} className="input" placeholder="e.g. Water Pipeline Reaches 88% Funding"/>
          </FormGroup>
          <FormRow>
            <FormGroup label="Category">
              <select {...register('category')} className="input">
                <option value="">Select…</option>
                {['Projects', 'Education', 'Community', 'Health', 'Culture', 'Success', 'Governance'].map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </FormGroup>
            <FormGroup label="Status">
              <select {...register('status')} className="input">
                <option value="draft">Draft</option>
                <option value="published">Published</option>
                <option value="scheduled">Scheduled</option>
                <option value="archived">Archived</option>
              </select>
            </FormGroup>
          </FormRow>
          {status === 'scheduled' && (
            <FormGroup label="Publish date & time *" full>
              <input type="datetime-local" {...register('scheduled_at', { required: status === 'scheduled' ? 'Schedule date required' : false })}
                className="input" min={new Date().toISOString().slice(0, 16)}/>
            </FormGroup>
          )}
          <FormGroup label="Excerpt (shown in cards) *" error={errors.excerpt?.message} full>
            <textarea {...register('excerpt', { required: 'Excerpt required' })} rows={2} className="input resize-none" placeholder="Short summary shown on news cards…"/>
          </FormGroup>
          <FormGroup label="Full Content (HTML allowed) *" error={errors.content?.message} full>
            <textarea {...register('content', { required: 'Content required' })} rows={8} className="input resize-none font-mono text-xs" placeholder="<p>Full article content here…</p>"/>
          </FormGroup>
          <FormGroup label="Cover Image URL" full>
            <input {...register('cover_image')} className="input" placeholder="https://…"/>
          </FormGroup>
          <label className="flex items-center gap-2 cursor-pointer text-sm">
            <input type="checkbox" {...register('is_featured')} className="w-4 h-4 rounded accent-primary-500"/>
            Mark as featured article
          </label>
          <div className="flex gap-3 pt-2">
            <button type="button" onClick={() => { setShowForm(false); setEditing(null); reset({ status: 'draft' }) }}
              className="flex-1 py-3 rounded-2xl text-sm font-semibold border border-primary-500/10 text-muted-foreground bg-primary-50">Cancel</button>
            <button type="submit" disabled={saveMut.isLoading} className="btn-secondary flex-1 justify-center">
              {saveMut.isLoading ? <><i className="fas fa-spinner animate-spin"/>Saving…</> : <><i className="fas fa-save"/>{editing ? 'Save Changes' : 'Publish Article'}</>}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  )
}

/* ═══════════════════════════════════════════════
   ADMIN EVENTS
═══════════════════════════════════════════════ */
function EventRegistrationsModal({ event, onClose }) {
  const { data: regs, isLoading } = useQuery(
    ['event-registrations', event?.id],
    () => api.get(`/events/${event.id}/registrations`).then(r => r.data),
    { enabled: !!event }
  )

  const exportCSV = () => {
    if (!regs?.length) return
    const rows = [['Name', 'Email', 'Ticket Ref', 'Amount Paid', 'Registered At']]
    regs.forEach(r => rows.push([
      r.name, r.email, r.ticketRef,
      r.amountPaid ? `${Number(r.amountPaid).toLocaleString()} XAF` : 'Free',
      new Date(r.createdAt).toLocaleDateString()
    ]))
    const csv = rows.map(r => r.map(v => `"${(v || '').toString().replace(/"/g, '""')}"`).join(',')).join('\n')
    const blob = new Blob([csv], { type: 'text/csv' })
    const a = document.createElement('a'); a.href = URL.createObjectURL(blob)
    a.download = `registrations-${event.slug || event.id}.csv`; a.click()
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">{regs?.length || 0} registrant{regs?.length !== 1 ? 's' : ''}</p>
        {regs?.length > 0 && (
          <button onClick={exportCSV} className="text-xs font-semibold flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-green-600 bg-green-500/8">
            <i className="fas fa-file-csv text-[10px]"/>Export CSV
          </button>
        )}
      </div>
      {isLoading ? (
        <div className="space-y-2">{[1,2,3].map(i => <div key={i} className="h-12 rounded-2xl animate-pulse bg-primary-500/4"/>)}</div>
      ) : !regs?.length ? (
        <div className="text-center py-10 rounded-2xl bg-primary-500/2 border border-dashed border-primary-500/10">
          <i className="fas fa-users text-3xl mb-2 block text-primary-500/15"/>
          <p className="text-sm text-muted-foreground">No registrations yet</p>
        </div>
      ) : (
        <div className="overflow-x-auto rounded-2xl border border-primary-500/8">
          <table className="w-full text-xs">
            <thead className="bg-primary-500/4">
              <tr>
                {['#', 'Name', 'Email', 'Ticket Ref', 'Amount', 'Date'].map(h => (
                  <th key={h} className="text-left px-4 py-3 font-bold uppercase tracking-widest text-primary-500 text-[9px]">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {regs.map((r, i) => (
                <tr key={r.id} className="border-t border-primary-500/5 hover:bg-primary-50/40">
                  <td className="px-4 py-3 font-semibold text-muted-foreground">{i + 1}</td>
                  <td className="px-4 py-3 font-semibold text-dark">{r.name}</td>
                  <td className="px-4 py-3 text-muted-foreground">{r.email}</td>
                  <td className="px-4 py-3">
                    <span className="font-mono text-[10px] px-2 py-0.5 rounded-lg bg-primary-50 text-primary-500">{r.ticketRef}</span>
                  </td>
                  <td className="px-4 py-3">
                    {r.amountPaid && Number(r.amountPaid) > 0
                      ? <span className="font-semibold text-amber-600">{Number(r.amountPaid).toLocaleString()} XAF</span>
                      : <span className="text-green-600">Free</span>}
                  </td>
                  <td className="px-4 py-3 text-muted-foreground">{new Date(r.createdAt).toLocaleDateString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      <div className="flex justify-end pt-1">
        <button onClick={onClose} className="px-5 py-2.5 rounded-2xl text-sm font-semibold border border-primary-500/10 text-muted-foreground bg-primary-50">Close</button>
      </div>
    </div>
  )
}

export function AdminEvents() {
  const qc = useQueryClient()
  const [showForm,  setShowForm]  = useState(false)
  const [editing,   setEditing]   = useState(null)
  const [regsEvent, setRegsEvent] = useState(null)
  const { register, handleSubmit, reset, setValue, watch, formState: { errors } } = useForm()
  const isOnline = watch('is_online')

  const { data, isLoading } = useQuery('admin-events', () => api.get('/events').then(r => r.data))

  const saveMut = useMutation(
    (data) => editing ? api.patch(`/events/${editing.id}`, data) : api.post('/events', data),
    { onSuccess: () => { qc.invalidateQueries('admin-events'); toast.success(editing ? 'Event updated!' : 'Event created!'); setShowForm(false); setEditing(null); reset() } }
  )

  const openEdit = (e) => { setEditing(e); Object.keys(e).forEach(k => setValue(k, e[k])); setShowForm(true) }
  const openNew  = () => { setEditing(null); reset(); setShowForm(true) }

  return (
    <div>
      <PageHeader title="Events" sub={`${data?.length || 0} events`} icon="fa-calendar-alt">
        <button onClick={openNew} className="btn-secondary !py-2 !px-4 !text-xs">
          <i className="fas fa-plus text-[10px]"/>New Event
        </button>
      </PageHeader>

      {isLoading ? (
        <div className="space-y-3">{[1,2,3].map(i => <div key={i} className="h-20 rounded-3xl animate-pulse bg-primary-500/4"/>)}</div>
      ) : !data?.length ? (
        <EmptyState icon="fa-calendar" title="No events yet" sub="Create a community event"
          action={<button onClick={openNew} className="btn-secondary !text-sm !py-2.5 !px-5">Create Event</button>}/>
      ) : (
        <div className="space-y-3">
          {data.map(e => {
            const d = new Date(e.startDate)
            return (
              <Card key={e.id} className="p-4 flex items-center gap-4">
                <div className="bg-white rounded-2xl text-center px-4 py-3 flex-shrink-0 border border-primary-500/10" style={{ minWidth: 64 }}>
                  <div className="font-bold text-xl leading-none text-dark">{format(d, 'd')}</div>
                  <div className="text-[9px] uppercase tracking-widest font-semibold mt-0.5 text-primary-500">{format(d, 'MMM')}</div>
                  <div className="text-[9px] text-muted-foreground">{format(d, 'yyyy')}</div>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-0.5 flex-wrap">
                    <h4 className="font-semibold text-sm truncate text-dark">{e.title}</h4>
                    <span className="tag !text-[9px] capitalize">{e.category}</span>
                    {e.isOnline && <Badge className="text-[9px] px-2 py-0.5">Online</Badge>}
                    {e.isFeatured && <Badge variant="gold" className="text-[9px] px-2 py-0.5">Featured</Badge>}
                    {e.ticketPrice && Number(e.ticketPrice) > 0
                      ? <Badge variant="gold" className="text-[9px] px-2 py-0.5">{Number(e.ticketPrice).toLocaleString()} XAF</Badge>
                      : <Badge variant="active" className="text-[9px] px-2 py-0.5">Free</Badge>}
                  </div>
                  <div className="flex items-center gap-3 text-[10px] text-muted-foreground">
                    {e.venue && <span><i className="fas fa-map-marker-alt mr-0.5"/>{e.venue}</span>}
                    <span><i className="fas fa-clock mr-0.5"/>{format(d, 'h:mm a')}</span>
                  </div>
                </div>
                <div className="flex gap-2 flex-shrink-0">
                  <ActionBtn label="Registrations" icon="fa-users" color="#0284c7" onClick={() => setRegsEvent(e)}/>
                  <ActionBtn label="Edit" icon="fa-pen" color="#5B2D8E" onClick={() => openEdit(e)}/>
                  <ActionBtn label="Delete" icon="fa-trash" color="#dc2626" onClick={() => { if (confirm('Delete event?')) {} }}/>
                </div>
              </Card>
            )
          })}
        </div>
      )}

      <Modal open={!!regsEvent} onClose={() => setRegsEvent(null)}
        title={`Registrations — ${regsEvent?.title || ''}`} sub="All sign-ups for this event" wide>
        <EventRegistrationsModal event={regsEvent} onClose={() => setRegsEvent(null)}/>
      </Modal>

      <Modal open={showForm} onClose={() => { setShowForm(false); setEditing(null); reset() }}
        title={editing ? 'Edit Event' : 'New Event'} sub="Add a community gathering to the calendar" wide>
        <form onSubmit={handleSubmit(d => saveMut.mutate(d))} className="space-y-4">
          <FormGroup label="Event Title *" error={errors.title?.message} full>
            <input {...register('title', { required: 'Title required' })} className="input" placeholder="e.g. Annual Harvest Festival"/>
          </FormGroup>
          <FormRow>
            <FormGroup label="Category">
              <select {...register('category')} className="input">
                {['culture', 'education', 'health', 'sport', 'community', 'fundraiser', 'governance', 'other'].map(c => <option key={c} value={c} className="capitalize">{c}</option>)}
              </select>
            </FormGroup>
            <FormGroup label="Organiser / Speaker">
              <input {...register('organizer_name')} className="input" placeholder="Name or organisation"/>
            </FormGroup>
          </FormRow>
          <FormRow>
            <FormGroup label="Start Date & Time *" error={errors.start_date?.message}>
              <input type="datetime-local" {...register('start_date', { required: 'Start date required' })} className="input"/>
            </FormGroup>
            <FormGroup label="End Date & Time">
              <input type="datetime-local" {...register('end_date')} className="input"/>
            </FormGroup>
          </FormRow>
          <FormRow>
            <FormGroup label="Venue">
              <input {...register('venue')} className="input" placeholder="Village Square, Community Hall…" disabled={isOnline}/>
            </FormGroup>
            <FormGroup label="Max Attendees">
              <input type="number" {...register('max_attendees')} className="input" placeholder="Leave blank for unlimited"/>
            </FormGroup>
          </FormRow>
          <FormRow>
            <FormGroup label="Ticket Price (XAF)">
              <input type="number" min="0" step="100" {...register('ticket_price')} className="input" placeholder="0 = Free"/>
            </FormGroup>
            <FormGroup label="Location URL">
              <input {...register('location_url')} className="input" placeholder="Google Maps link (optional)"/>
            </FormGroup>
          </FormRow>
          <FormGroup label="Description *" error={errors.description?.message} full>
            <textarea {...register('description', { required: 'Description required' })} rows={3} className="input resize-none" placeholder="Event details, what to expect, dress code, etc."/>
          </FormGroup>
          <FormGroup label="Cover Image URL" full>
            <input {...register('cover_image')} className="input" placeholder="https://…"/>
          </FormGroup>
          {isOnline && (
            <FormGroup label="Meeting Link" full>
              <input {...register('meeting_link')} className="input" placeholder="https://meet.google.com/…"/>
            </FormGroup>
          )}
          <div className="flex gap-5">
            <label className="flex items-center gap-2 cursor-pointer text-sm">
              <input type="checkbox" {...register('is_online')} className="w-4 h-4 rounded accent-primary-500"/>Online event
            </label>
            <label className="flex items-center gap-2 cursor-pointer text-sm">
              <input type="checkbox" {...register('is_featured')} className="w-4 h-4 rounded accent-primary-500"/>Featured
            </label>
            <label className="flex items-center gap-2 cursor-pointer text-sm">
              <input type="checkbox" {...register('requires_rsvp')} className="w-4 h-4 rounded accent-primary-500"/>Requires RSVP
            </label>
          </div>
          <div className="flex gap-3 pt-2">
            <button type="button" onClick={() => { setShowForm(false); setEditing(null); reset() }}
              className="flex-1 py-3 rounded-2xl text-sm font-semibold border border-primary-500/10 text-muted-foreground bg-primary-50">Cancel</button>
            <button type="submit" disabled={saveMut.isLoading} className="btn-secondary flex-1 justify-center">
              {saveMut.isLoading ? <><i className="fas fa-spinner animate-spin"/>Saving…</> : <><i className="fas fa-calendar-plus"/>{editing ? 'Save Changes' : 'Create Event'}</>}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  )
}

/* ═══════════════════════════════════════════════
   ADMIN TEAM
═══════════════════════════════════════════════ */
export function AdminTeam() {
  const qc = useQueryClient()
  const [showForm,  setShowForm]  = useState(false)
  const [editing,   setEditing]   = useState(null)
  const [activeTab, setActiveTab] = useState('members')
  const { register, handleSubmit, reset, setValue, formState: { errors } } = useForm()

  const { data: members, isLoading } = useQuery('admin-team', () => api.get('/team').then(r => r.data))
  const { data: apps, isLoading: appsLoading } = useQuery('team-apps', () => api.get('/admin/team-applications').then(r => r.data))

  const saveMut = useMutation(
    (data) => editing ? api.patch(`/team/${editing.id}`, data) : api.post('/team', data),
    { onSuccess: () => { qc.invalidateQueries('admin-team'); toast.success(editing ? 'Member updated!' : 'Member added!'); setShowForm(false); setEditing(null); reset() } }
  )
  const reviewMut = useMutation(({ id, status }) => api.patch(`/admin/team-applications/${id}`, { status }), {
    onSuccess: () => { qc.invalidateQueries('team-apps'); toast.success('Application updated') }
  })

  const openEdit = (m) => { setEditing(m); Object.keys(m).forEach(k => setValue(k, m[k])); setShowForm(true) }
  const openNew  = () => { setEditing(null); reset(); setShowForm(true) }
  const pending  = apps?.filter(a => a.status === 'pending').length || 0

  return (
    <div>
      <PageHeader title="Team Management" sub="Manage community leaders and volunteers" icon="fa-id-badge">
        <button onClick={openNew} className="btn-secondary !py-2 !px-4 !text-xs">
          <i className="fas fa-plus text-[10px]"/>Add Member
        </button>
      </PageHeader>

      <div className="flex gap-1 mb-5 p-1 rounded-2xl w-fit bg-primary-50">
        {[['members', 'Team Members'], ['applications', 'Applications']].map(([k, l]) => (
          <button key={k} onClick={() => setActiveTab(k)}
            className={cn('px-5 py-2 rounded-xl text-sm font-semibold transition-all flex items-center gap-2',
              activeTab === k ? 'bg-white text-primary-500 shadow-sm' : 'text-muted-foreground')}>
            {l}
            {k === 'applications' && pending > 0 && (
              <span className="text-[9px] font-bold px-1.5 py-0.5 rounded-full text-white bg-red-500">{pending}</span>
            )}
          </button>
        ))}
      </div>

      {activeTab === 'members' && (
        isLoading ? (
          <div className="grid md:grid-cols-4 gap-4">{[1,2,3,4].map(i => <div key={i} className="h-52 rounded-3xl animate-pulse bg-primary-500/4"/>)}</div>
        ) : !members?.length ? (
          <EmptyState icon="fa-users" title="No team members yet"
            action={<button onClick={openNew} className="btn-secondary !text-sm !py-2.5 !px-5">Add First Member</button>}/>
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {members.map((m, i) => {
              const GRADS = ['linear-gradient(135deg,#250F47,#5B2D8E)', 'linear-gradient(135deg,#3D1A6B,#7B4DB8)', 'linear-gradient(135deg,#5B2D8E,#9B6FD8)', 'linear-gradient(135deg,#4A2478,#7B4DB8)']
              return (
                <div key={m.id} className="card" style={{ paddingBottom: 52, position: 'relative' }}>
                  <div className="h-44 flex items-center justify-center relative overflow-hidden rounded-t-3xl" style={{ background: GRADS[i % 4] }}>
                    {m.avatar_url ? <img src={m.avatar_url} className="w-full h-full object-cover"/> : <i className="fas fa-user text-3xl text-gold/35"/>}
                    <div className="absolute top-2 right-2">
                      <button onClick={() => openEdit(m)} className="w-7 h-7 rounded-full bg-white flex items-center justify-center shadow-card hover:scale-105 transition-transform text-primary-500">
                        <i className="fas fa-pen text-[10px]"/>
                      </button>
                    </div>
                    {!m.is_active && (
                      <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                        <span className="text-xs font-bold text-white px-3 py-1 rounded-full bg-red-600/80">Inactive</span>
                      </div>
                    )}
                  </div>
                  <div className="absolute bottom-0 left-3 right-3 bg-white rounded-2xl px-3 py-2.5 text-center shadow-card">
                    <div className="font-semibold text-xs text-dark">{m.name}</div>
                    <div className="text-[10px] font-medium mt-0.5 truncate text-gold">{m.role_title}</div>
                    <div className="flex justify-center gap-2 mt-1.5">
                      <span className="tag !text-[9px]">{m.team}</span>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        )
      )}

      {activeTab === 'applications' && (
        appsLoading ? (
          <div className="space-y-3">{[1,2,3].map(i => <div key={i} className="h-16 rounded-3xl animate-pulse bg-primary-500/4"/>)}</div>
        ) : !apps?.length ? (
          <EmptyState icon="fa-envelope-open" title="No applications yet" sub="Join applications will appear here"/>
        ) : (
          <div className="space-y-3">
            {apps.map(a => (
              <Card key={a.id} className="p-4 flex items-center gap-4">
                <div className="w-10 h-10 rounded-full flex items-center justify-center text-white font-bold text-sm flex-shrink-0 bg-gradient-to-br from-primary-500 to-primary-light">
                  {a.full_name?.[0]?.toUpperCase()}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap mb-0.5">
                    <span className="font-semibold text-sm text-dark">{a.full_name}</span>
                    <StatusBadge status={a.status}/>
                    <span className="tag !text-[9px]">{a.team_choice}</span>
                  </div>
                  <div className="flex gap-3 text-[10px] text-muted-foreground">
                    <span>{a.email}</span>
                    {a.location && <span><i className="fas fa-map-marker-alt mr-0.5"/>{a.location}</span>}
                    {a.createdAt && <span>{format(new Date(a.createdAt), 'MMM d, yyyy')}</span>}
                  </div>
                  {a.skills && <p className="text-[10px] mt-0.5 line-clamp-1 text-muted-foreground"><strong>Skills:</strong> {a.skills}</p>}
                </div>
                {a.status === 'pending' && (
                  <div className="flex gap-2 flex-shrink-0">
                    <ActionBtn label="Approve" icon="fa-check" color="#16a34a" onClick={() => reviewMut.mutate({ id: a.id, status: 'approved' })}/>
                    <ActionBtn label="Reject" icon="fa-times" color="#dc2626" onClick={() => reviewMut.mutate({ id: a.id, status: 'rejected' })}/>
                  </div>
                )}
                {a.status !== 'pending' && <StatusBadge status={a.status}/>}
              </Card>
            ))}
          </div>
        )
      )}

      <Modal open={showForm} onClose={() => { setShowForm(false); setEditing(null); reset() }}
        title={editing ? 'Edit Member' : 'Add Team Member'} sub="Add or update a community team member" wide>
        <form onSubmit={handleSubmit(d => saveMut.mutate(d))} className="space-y-4">
          <FormRow>
            <FormGroup label="Full Name *" error={errors.name?.message}>
              <input {...register('name', { required: 'Name required' })} className="input" placeholder="e.g. Dr. Carine Wabo"/>
            </FormGroup>
            <FormGroup label="Role Title *" error={errors.role_title?.message}>
              <input {...register('role_title', { required: 'Role required' })} className="input" placeholder="e.g. Health Coordinator"/>
            </FormGroup>
          </FormRow>
          <FormRow>
            <FormGroup label="Team *" error={errors.team?.message}>
              <select {...register('team', { required: 'Team required' })} className="input">
                <option value="">Select team…</option>
                {['leadership', 'development', 'culture', 'youth', 'health', 'environment', 'education'].map(t => <option key={t} value={t} className="capitalize">{t}</option>)}
              </select>
            </FormGroup>
            <FormGroup label="Sort Order">
              <input type="number" {...register('sort_order')} className="input" placeholder="e.g. 1"/>
            </FormGroup>
          </FormRow>
          <FormGroup label="Bio" full>
            <textarea {...register('bio')} rows={3} className="input resize-none" placeholder="Short biography…"/>
          </FormGroup>
          <FormGroup label="Avatar / Photo URL" full>
            <input {...register('avatar_url')} className="input" placeholder="https://…"/>
          </FormGroup>
          <div className="grid grid-cols-2 gap-3">
            <div><label className="label">Facebook</label><input {...register('facebook')} className="input" placeholder="https://facebook.com/…"/></div>
            <div><label className="label">LinkedIn</label><input {...register('linkedin')} className="input" placeholder="https://linkedin.com/in/…"/></div>
            <div><label className="label">Twitter</label><input {...register('twitter')} className="input" placeholder="https://twitter.com/…"/></div>
            <div><label className="label">Contact Email</label><input {...register('email')} className="input" placeholder="member@example.com"/></div>
          </div>
          <label className="flex items-center gap-2 cursor-pointer text-sm">
            <input type="checkbox" {...register('is_active')} defaultChecked className="w-4 h-4 rounded accent-primary-500"/>
            Active member (visible on site)
          </label>
          <div className="flex gap-3 pt-2">
            <button type="button" onClick={() => { setShowForm(false); setEditing(null); reset() }}
              className="flex-1 py-3 rounded-2xl text-sm font-semibold border border-primary-500/10 text-muted-foreground bg-primary-50">Cancel</button>
            <button type="submit" disabled={saveMut.isLoading} className="btn-secondary flex-1 justify-center">
              {saveMut.isLoading ? <><i className="fas fa-spinner animate-spin"/>Saving…</> : <><i className="fas fa-save"/>{editing ? 'Save Changes' : 'Add Member'}</>}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  )
}

/* ═══════════════════════════════════════════════
   ADMIN DONATIONS
═══════════════════════════════════════════════ */
export function AdminDonations() {
  const [search, setSearch] = useState('')
  const [statusF, setStatusF] = useState('all')
  const { data, isLoading } = useQuery('admin-donations', () => api.get('/donations').then(r => r.data))
  const { data: summary } = useQuery('donations-summary', () => api.get('/donations/summary').then(r => r.data))

  const filtered = data?.filter(d => {
    const matchSearch = !search || d.reference?.includes(search) || d.donorName?.toLowerCase().includes(search.toLowerCase()) || d.donorEmail?.toLowerCase().includes(search.toLowerCase())
    const matchStatus = statusF === 'all' || d.status === statusF
    return matchSearch && matchStatus
  })

  return (
    <div>
      <PageHeader title="Donations" sub="All contribution records" icon="fa-heart"/>
      {summary && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          {[
            { icon: 'fa-coins',    label: 'Total Raised',    value: `${Number(summary.total_raised || 0).toLocaleString()} XAF`, c: '#F0A500', bg: 'rgba(240,165,0,0.1)' },
            { icon: 'fa-heart',    label: 'Total Donations', value: Number(summary.total_donations || 0).toLocaleString(),        c: '#5B2D8E', bg: 'rgba(91,45,142,0.08)' },
            { icon: 'fa-users',    label: 'Unique Donors',   value: Number(summary.unique_donors || 0).toLocaleString(),          c: '#16a34a', bg: 'rgba(22,163,74,0.08)' },
            { icon: 'fa-calendar', label: 'This Month',      value: `${Number(summary.this_month || 0).toLocaleString()} XAF`,    c: '#0284c7', bg: 'rgba(2,132,199,0.08)' },
          ].map(s => (
            <Card key={s.label}>
              <CardContent className="pt-5">
                <div className="w-10 h-10 rounded-2xl flex items-center justify-center mb-3" style={{ background: s.bg }}>
                  <i className={`fas ${s.icon} text-base`} style={{ color: s.c }}/>
                </div>
                <div className="font-bold text-xl text-dark">{s.value}</div>
                <div className="text-xs text-muted-foreground">{s.label}</div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
      <div className="flex flex-col sm:flex-row gap-3 mb-5">
        <div className="relative flex-1">
          <i className="fas fa-search absolute left-3.5 top-1/2 -translate-y-1/2 text-xs text-muted-foreground"/>
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search reference, donor name or email…" className="input !pl-10"/>
        </div>
        <select value={statusF} onChange={e => setStatusF(e.target.value)} className="input sm:w-40">
          {['all', 'completed', 'pending', 'failed', 'refunded'].map(s => <option key={s} value={s}>{s === 'all' ? 'All Status' : s}</option>)}
        </select>
      </div>
      <Card className="overflow-hidden p-0">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-primary-500/4">
              <tr>{['Reference', 'Donor', 'Project', 'Amount', 'Method', 'Status', 'Date'].map(h => (
                <th key={h} className="text-left px-4 py-3 text-xs font-bold uppercase tracking-widest whitespace-nowrap text-primary-500">{h}</th>
              ))}</tr>
            </thead>
            <tbody>
              {isLoading ? [1,2,3].map(i => (
                <tr key={i}><td colSpan={7} className="px-4 py-4"><div className="h-4 rounded-xl animate-pulse bg-primary-500/5"/></td></tr>
              )) : filtered?.map(d => (
                <tr key={d.id} className="border-b border-primary-500/5 hover:bg-primary-50/40 transition-colors">
                  <td className="px-4 py-3 font-mono text-[10px] text-muted-foreground">{d.reference}</td>
                  <td className="px-4 py-3">
                    <div className="font-semibold text-xs text-dark">{d.donorName || d.user_name || 'Anonymous'}</div>
                    <div className="text-[10px] text-muted-foreground">{d.donorEmail}</div>
                  </td>
                  <td className="px-4 py-3 text-xs max-w-[140px] truncate text-muted-foreground">{d.project_title || 'General Fund'}</td>
                  <td className="px-4 py-3 font-bold text-sm text-dark">
                    {Number(d.amount).toLocaleString()} <span className="text-xs font-normal text-muted-foreground">{d.currency}</span>
                  </td>
                  <td className="px-4 py-3 text-xs capitalize text-muted-foreground">{d.provider?.replace(/_/g, ' ')}</td>
                  <td className="px-4 py-3"><StatusBadge status={d.status}/></td>
                  <td className="px-4 py-3 text-xs whitespace-nowrap text-muted-foreground">{d.createdAt ? format(new Date(d.createdAt), 'MMM d, yyyy') : '—'}</td>
                </tr>
              ))}
            </tbody>
          </table>
          {!filtered?.length && !isLoading && <div className="text-center py-12"><EmptyState icon="fa-heart" title="No donations found" sub="Try adjusting your search or filter"/></div>}
        </div>
      </Card>
    </div>
  )
}

/* ═══════════════════════════════════════════════
   ADMIN USERS
═══════════════════════════════════════════════ */
export function AdminUsers() {
  const qc = useQueryClient()
  const [search, setSearch] = useState('')
  const [roleF, setRoleF] = useState('all')
  const [selected, setSelected] = useState(new Set())
  const { data, isLoading } = useQuery(['admin-users', search], () => api.get(`/admin/users?search=${search}`).then(r => r.data))
  const updateRole    = useMutation(({ id, role }) => api.patch(`/admin/users/${id}`, { role }), { onSuccess: () => { qc.invalidateQueries('admin-users'); toast.success('Role updated') } })
  const updateStatus  = useMutation(({ id, status }) => api.patch(`/admin/users/${id}`, { status }), { onSuccess: () => { qc.invalidateQueries('admin-users'); toast.success('Status updated') } })
  const togglePremium = useMutation(({ id, isPremium }) => api.patch(`/admin/users/${id}`, { isPremium }), { onSuccess: () => { qc.invalidateQueries('admin-users'); toast.success('Premium updated') } })

  const filtered = data?.filter(u => roleF === 'all' || u.role === roleF) || []
  const allChecked = filtered.length > 0 && filtered.every(u => selected.has(u.id))

  const toggleAll = () => { if (allChecked) setSelected(new Set()); else setSelected(new Set(filtered.map(u => u.id))) }
  const toggleOne = (id) => setSelected(prev => { const s = new Set(prev); s.has(id) ? s.delete(id) : s.add(id); return s })

  const bulkAction = async (status) => {
    const ids = [...selected]
    await Promise.all(ids.map(id => api.patch(`/admin/users/${id}`, { status })))
    qc.invalidateQueries('admin-users'); setSelected(new Set())
    toast.success(`${ids.length} user(s) ${status === 'active' ? 'restored' : 'banned'}`)
  }

  const exportCSV = () => {
    const rows = [['Name', 'Email', 'Role', 'Country', 'Diaspora', 'Status', 'Joined']]
    const toExport = selected.size > 0 ? filtered.filter(u => selected.has(u.id)) : filtered
    toExport.forEach(u => rows.push([`${u.firstName} ${u.lastName}`, u.email, u.role, u.country || '', u.isDiaspora ? 'Yes' : 'No', u.status, u.createdAt ? new Date(u.createdAt).toLocaleDateString() : '']))
    const csv = rows.map(r => r.map(v => `"${(v || '').toString().replace(/"/g, '""')}"`).join(',')).join('\n')
    const a = document.createElement('a'); a.href = URL.createObjectURL(new Blob([csv], { type: 'text/csv' }))
    a.download = 'members.csv'; a.click()
  }

  return (
    <div>
      <PageHeader title="Users" sub={`${data?.length || 0} registered members`} icon="fa-users"/>
      <div className="flex flex-col sm:flex-row gap-3 mb-5">
        <div className="relative flex-1">
          <i className="fas fa-search absolute left-3.5 top-1/2 -translate-y-1/2 text-xs text-muted-foreground"/>
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search by name or email…" className="input !pl-10"/>
        </div>
        <select value={roleF} onChange={e => setRoleF(e.target.value)} className="input sm:w-36">
          {['all', 'admin', 'leader', 'member', 'guest'].map(r => <option key={r} value={r}>{r === 'all' ? 'All Roles' : r}</option>)}
        </select>
        <button onClick={exportCSV} className="flex items-center gap-2 px-4 py-2.5 rounded-2xl text-xs font-semibold transition-all hover:-translate-y-0.5 bg-green-500/8 text-green-600">
          <i className="fas fa-file-csv text-[10px]"/>Export{selected.size > 0 ? ` (${selected.size})` : ''}
        </button>
      </div>

      {selected.size > 0 && (
        <div className="flex items-center gap-3 mb-4 px-4 py-3 rounded-2xl bg-primary-50 border border-primary-500/12">
          <span className="text-xs font-semibold text-primary-500">{selected.size} selected</span>
          <button onClick={() => bulkAction('banned')} className="text-xs font-semibold px-3 py-1.5 rounded-xl bg-red-500/8 text-red-600">
            <i className="fas fa-ban mr-1 text-[10px]"/>Ban All
          </button>
          <button onClick={() => bulkAction('active')} className="text-xs font-semibold px-3 py-1.5 rounded-xl bg-green-500/8 text-green-600">
            <i className="fas fa-check mr-1 text-[10px]"/>Restore All
          </button>
          <button onClick={() => setSelected(new Set())} className="ml-auto text-xs text-muted-foreground">Clear</button>
        </div>
      )}

      <Card className="overflow-hidden p-0">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-primary-500/4">
              <tr>
                <th className="px-4 py-3 w-8">
                  <input type="checkbox" checked={allChecked} onChange={toggleAll} className="w-4 h-4 rounded accent-primary-500 cursor-pointer"/>
                </th>
                {['Member', 'Role', 'Country', 'Diaspora', 'Premium', 'Status', 'Joined', 'Actions'].map(h => (
                  <th key={h} className="text-left px-4 py-3 text-xs font-bold uppercase tracking-widest whitespace-nowrap text-primary-500">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {isLoading ? [1,2,3].map(i => (
                <tr key={i}><td colSpan={9} className="px-4 py-4"><div className="h-4 rounded-xl animate-pulse bg-primary-500/5"/></td></tr>
              )) : filtered?.map(r => (
                <tr key={r.id} className={cn('border-b border-primary-500/5 transition-colors hover:bg-primary-50/40', selected.has(r.id) && 'bg-primary-50')}>
                  <td className="px-4 py-3">
                    <input type="checkbox" checked={selected.has(r.id)} onChange={() => toggleOne(r.id)} className="w-4 h-4 rounded accent-primary-500 cursor-pointer"/>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-bold flex-shrink-0 bg-gradient-to-br from-primary-500 to-primary-light">
                        {r.firstName?.[0]}{r.lastName?.[0]}
                      </div>
                      <div>
                        <div className="font-semibold text-xs text-dark">{r.firstName} {r.lastName}</div>
                        <div className="text-[10px] text-muted-foreground">{r.email}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3"><StatusBadge status={r.role}/></td>
                  <td className="px-4 py-3 text-xs text-muted-foreground">{r.country || '—'}</td>
                  <td className="px-4 py-3">
                    {r.isDiaspora ? <span className="text-xs font-bold text-green-600">Yes</span> : <span className="text-xs text-muted-foreground/40">No</span>}
                  </td>
                  <td className="px-4 py-3">
                    <button
                      onClick={() => togglePremium.mutate({ id: r.id, isPremium: !r.isPremium })}
                      title={r.isPremium ? 'Revoke premium' : 'Grant premium'}
                      className={cn('flex items-center gap-1.5 text-xs font-bold px-2.5 py-1 rounded-lg transition-all border',
                        r.isPremium ? 'bg-gold/12 text-amber-600 border-gold/25' : 'bg-black/4 text-gray-400 border-black/8')}>
                      <i className="fas fa-crown text-[10px]"/>
                      {r.isPremium ? 'Premium' : 'Free'}
                    </button>
                  </td>
                  <td className="px-4 py-3"><StatusBadge status={r.status}/></td>
                  <td className="px-4 py-3 text-xs whitespace-nowrap text-muted-foreground">{r.createdAt ? format(new Date(r.createdAt), 'MMM d, yyyy') : '—'}</td>
                  <td className="px-4 py-3">
                    <div className="flex gap-2">
                      <select defaultValue={r.role} onChange={e => updateRole.mutate({ id: r.id, role: e.target.value })}
                        className="text-xs px-2 py-1 rounded-lg border border-primary-500/15 outline-none text-primary-500 bg-primary-50">
                        {['admin', 'leader', 'member', 'guest'].map(o => <option key={o} value={o}>{o}</option>)}
                      </select>
                      {r.status === 'active'
                        ? <ActionBtn label="Ban" color="#dc2626" icon="fa-ban" onClick={() => updateStatus.mutate({ id: r.id, status: 'banned' })}/>
                        : <ActionBtn label="Restore" color="#16a34a" icon="fa-check" onClick={() => updateStatus.mutate({ id: r.id, status: 'active' })}/>}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {!filtered?.length && !isLoading && <div className="py-8"><EmptyState icon="fa-users" title="No users found"/></div>}
        </div>
      </Card>
    </div>
  )
}

/* ═══════════════════════════════════════════════
   ADMIN FORUM
═══════════════════════════════════════════════ */
export function AdminForum() {
  const { data, isLoading } = useQuery('admin-threads', () => api.get('/forum/threads?limit=100').then(r => r.data))
  return (
    <div>
      <PageHeader title="Forum Moderation" sub="Manage community discussions" icon="fa-comments"/>
      {isLoading ? (
        <div className="space-y-3">{[1,2,3].map(i => <div key={i} className="h-16 rounded-3xl animate-pulse bg-primary-500/4"/>)}</div>
      ) : !data?.length ? (
        <EmptyState icon="fa-comments" title="No threads yet"/>
      ) : (
        <Card className="overflow-hidden p-0">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-primary-500/4">
                <tr>{['Thread', 'Author', 'Category', 'Replies', 'Views', 'Status', 'Actions'].map(h => (
                  <th key={h} className="text-left px-4 py-3 text-xs font-bold uppercase tracking-widest text-primary-500">{h}</th>
                ))}</tr>
              </thead>
              <tbody>
                {data.map(t => (
                  <tr key={t.id} className="border-b border-primary-500/5 hover:bg-primary-50/40 transition-colors">
                    <td className="px-4 py-3 max-w-[200px]">
                      <Link to={`/forum/${t.id}`} className="font-semibold text-xs hover:underline line-clamp-1 text-dark">{t.title}</Link>
                    </td>
                    <td className="px-4 py-3 text-xs text-muted-foreground">{t.author_name}</td>
                    <td className="px-4 py-3"><span className="tag !text-[9px]">{t.category_name}</span></td>
                    <td className="px-4 py-3 text-xs font-semibold text-dark">{t.reply_count}</td>
                    <td className="px-4 py-3 text-xs text-muted-foreground">{t.view_count}</td>
                    <td className="px-4 py-3"><StatusBadge status={t.status}/></td>
                    <td className="px-4 py-3">
                      <div className="flex gap-2">
                        <ActionBtn label={t.is_pinned ? 'Unpin' : 'Pin'} color="#F0A500" icon="fa-thumbtack" onClick={() => {}}/>
                        <ActionBtn label="Remove" color="#dc2626" icon="fa-trash" onClick={() => {}}/>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}
    </div>
  )
}
