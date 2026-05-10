import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from 'react-query'
import { useForm } from 'react-hook-form'
import { format } from 'date-fns'
import toast from 'react-hot-toast'
import api from '../../services/api'

const CATEGORIES = [
  { value: 'customs',    label: 'Customs & Traditions' },
  { value: 'proverbs',   label: 'Proverbs & Wisdom'    },
  { value: 'recipes',    label: 'Food & Recipes'        },
  { value: 'history',    label: 'Village History'       },
  { value: 'language',   label: 'Language & Words'      },
  { value: 'nature',     label: 'Nature & Environment'  },
  { value: 'governance', label: 'Governance'            },
]

function WikiForm({ page, onClose }) {
  const qc = useQueryClient()
  const isEdit = !!page
  const { register, handleSubmit, formState: { errors } } = useForm({
    defaultValues: page || { category: 'customs', isPublished: true }
  })
  const mut = useMutation(
    d => isEdit ? api.patch(`/wiki/${page.id}`, d) : api.post('/wiki', d),
    {
      onSuccess: () => { qc.invalidateQueries('admin-wiki'); toast.success(isEdit ? 'Updated!' : 'Created!'); onClose() },
      onError: e => toast.error(e.response?.data?.error || 'Failed'),
    }
  )
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: 'rgba(26,10,53,0.8)', backdropFilter: 'blur(8px)' }}
      onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="bg-white rounded-3xl w-full max-w-2xl max-h-[92vh] overflow-y-auto"
        style={{ boxShadow: '0 32px 80px rgba(26,10,53,0.25)' }}>
        <div className="px-7 pt-6 pb-4 border-b sticky top-0 bg-white z-10"
          style={{ borderColor: 'rgba(91,45,142,0.08)' }}>
          <div className="flex items-center justify-between">
            <h3 className="font-display font-bold text-xl" style={{ color: '#1A0A35' }}>
              {isEdit ? 'Edit Article' : 'New Wiki Article'}
            </h3>
            <button onClick={onClose} className="w-9 h-9 rounded-full flex items-center justify-center hover:bg-gray-100"
              style={{ color: '#A3A3A3' }}><i className="fas fa-times"/></button>
          </div>
        </div>
        <form onSubmit={handleSubmit(d => mut.mutate(d))} className="p-7 space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="label">Title *</label>
              <input {...register('title', { required: 'Required' })} className="input"/>
              {errors.title && <p className="text-xs mt-1 text-red-500">{errors.title.message}</p>}
            </div>
            <div>
              <label className="label">Slug *</label>
              <input {...register('slug', { required: 'Required' })} className="input" placeholder="url-friendly-name"/>
              {errors.slug && <p className="text-xs mt-1 text-red-500">{errors.slug.message}</p>}
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="label">Category</label>
              <select {...register('category')} className="input">
                {CATEGORIES.map(c => <option key={c.value} value={c.value}>{c.label}</option>)}
              </select>
            </div>
            <div>
              <label className="label">Cover Image URL</label>
              <input {...register('coverImage')} className="input" placeholder="https://…"/>
            </div>
          </div>
          <div>
            <label className="label">Content (HTML) *</label>
            <textarea {...register('content', { required: 'Required' })} rows={14}
              className="input resize-none font-mono text-xs"
              placeholder="<h2>Introduction</h2><p>…</p>"/>
            {errors.content && <p className="text-xs mt-1 text-red-500">{errors.content.message}</p>}
          </div>
          <label className="flex items-center gap-2 text-sm cursor-pointer" style={{ fontFamily: 'Poppins,sans-serif' }}>
            <input type="checkbox" {...register('isPublished')} className="w-4 h-4 rounded accent-primary-500"/>
            Published (visible to community)
          </label>
          <div className="flex gap-3 pt-2">
            <button type="button" onClick={onClose}
              className="flex-1 py-3 rounded-2xl text-sm font-semibold"
              style={{ background: 'rgba(91,45,142,0.05)', color: '#737373', border: '1px solid rgba(91,45,142,0.1)' }}>
              Cancel
            </button>
            <button type="submit" disabled={mut.isLoading} className="btn-secondary flex-1 justify-center">
              {mut.isLoading ? <><i className="fas fa-spinner animate-spin"/>Saving…</> : <><i className="fas fa-save"/>Save Article</>}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default function AdminWiki() {
  const qc = useQueryClient()
  const [showForm, setShowForm] = useState(false)
  const [editing, setEditing] = useState(null)
  const [catFilter, setCatFilter] = useState('')

  const { data: pages = [], isLoading } = useQuery(
    ['admin-wiki', catFilter],
    () => api.get('/wiki', { params: catFilter ? { category: catFilter } : {} }).then(r => r.data)
  )

  const deleteMut = useMutation(id => api.delete(`/wiki/${id}`), {
    onSuccess: () => { qc.invalidateQueries('admin-wiki'); toast.success('Deleted') },
  })

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="font-display font-bold text-2xl" style={{ color: '#1A0A35' }}>Knowledge Wiki</h2>
          <p className="text-sm mt-0.5" style={{ color: '#737373', fontFamily: 'Poppins,sans-serif' }}>Preserve cultural knowledge and traditions</p>
        </div>
        <button onClick={() => { setEditing(null); setShowForm(true) }} className="btn-secondary">
          <i className="fas fa-plus"/>New Article
        </button>
      </div>

      <div className="flex flex-wrap gap-2">
        <button onClick={() => setCatFilter('')}
          className="text-xs font-semibold px-4 py-2 rounded-xl transition-all"
          style={{ background: !catFilter ? '#5B2D8E' : 'rgba(91,45,142,0.07)', color: !catFilter ? '#fff' : '#737373', fontFamily: 'Sora,sans-serif' }}>
          All
        </button>
        {CATEGORIES.map(c => (
          <button key={c.value} onClick={() => setCatFilter(c.value === catFilter ? '' : c.value)}
            className="text-xs font-semibold px-4 py-2 rounded-xl transition-all"
            style={{ background: catFilter === c.value ? '#5B2D8E' : 'rgba(91,45,142,0.07)', color: catFilter === c.value ? '#fff' : '#737373', fontFamily: 'Sora,sans-serif' }}>
            {c.label}
          </button>
        ))}
      </div>

      {isLoading ? (
        <div className="grid md:grid-cols-2 gap-4">{[1,2,3,4].map(i => <div key={i} className="h-24 rounded-2xl animate-pulse" style={{ background: 'rgba(91,45,142,0.05)' }}/>)}</div>
      ) : !pages.length ? (
        <div className="text-center py-20 rounded-3xl" style={{ background: 'rgba(91,45,142,0.02)', border: '1px dashed rgba(91,45,142,0.12)' }}>
          <i className="fas fa-book-open text-5xl mb-4 block" style={{ color: 'rgba(91,45,142,0.18)' }}/>
          <h3 className="font-display font-bold text-xl mb-2" style={{ color: '#1A0A35' }}>No articles yet</h3>
          <button onClick={() => setShowForm(true)} className="btn-secondary mt-4 !text-sm">Write first article</button>
        </div>
      ) : (
        <div className="rounded-3xl overflow-hidden" style={{ background: '#fff', boxShadow: '0 2px 16px rgba(91,45,142,0.06)' }}>
          <table className="w-full text-sm">
            <thead style={{ background: 'rgba(91,45,142,0.04)' }}>
              <tr>
                {['Title','Category','Views','Published','Updated','Actions'].map(h => (
                  <th key={h} className="text-left px-5 py-3 text-xs font-bold uppercase tracking-widest"
                    style={{ color: '#5B2D8E', fontFamily: 'Sora,sans-serif' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {pages.map((p, i) => {
                const cat = CATEGORIES.find(c => c.value === p.category)
                return (
                  <tr key={p.id} style={{ background: i % 2 === 0 ? 'transparent' : 'rgba(91,45,142,0.015)' }}>
                    <td className="px-5 py-4">
                      <div className="font-semibold text-sm" style={{ color: '#1A0A35' }}>{p.title}</div>
                      <div className="text-xs mt-0.5" style={{ color: '#A3A3A3' }}>/{p.slug}</div>
                    </td>
                    <td className="px-5 py-4 text-xs" style={{ color: '#5B2D8E', fontFamily: 'Poppins,sans-serif' }}>{cat?.label || p.category}</td>
                    <td className="px-5 py-4 text-sm font-semibold" style={{ color: '#1A0A35' }}>{p.viewCount || 0}</td>
                    <td className="px-5 py-4">
                      <span className="text-xs font-bold px-2.5 py-1 rounded-full"
                        style={{ background: p.isPublished ? 'rgba(22,163,74,0.1)' : 'rgba(115,115,115,0.1)', color: p.isPublished ? '#16a34a' : '#737373' }}>
                        {p.isPublished ? 'Published' : 'Draft'}
                      </span>
                    </td>
                    <td className="px-5 py-4 text-xs" style={{ color: '#737373', fontFamily: 'Poppins,sans-serif' }}>
                      {format(new Date(p.updatedAt), 'MMM d, yyyy')}
                    </td>
                    <td className="px-5 py-4">
                      <div className="flex gap-1">
                        <button onClick={() => { setEditing(p); setShowForm(true) }}
                          className="w-8 h-8 rounded-xl flex items-center justify-center"
                          style={{ background: 'rgba(91,45,142,0.08)', color: '#5B2D8E' }}>
                          <i className="fas fa-edit text-xs"/>
                        </button>
                        <button onClick={() => { if (confirm('Delete article?')) deleteMut.mutate(p.id) }}
                          className="w-8 h-8 rounded-xl flex items-center justify-center"
                          style={{ background: 'rgba(220,38,38,0.08)', color: '#dc2626' }}>
                          <i className="fas fa-trash text-xs"/>
                        </button>
                      </div>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      )}
      {showForm && <WikiForm page={editing} onClose={() => { setShowForm(false); setEditing(null) }}/>}
    </div>
  )
}
