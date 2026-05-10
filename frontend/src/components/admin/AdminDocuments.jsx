import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from 'react-query'
import { useForm } from 'react-hook-form'
import { format } from 'date-fns'
import toast from 'react-hot-toast'
import api from '../../services/api'

const DOC_CATEGORIES = ['Constitution', 'Minutes', 'Financial', 'Report', 'Legal', 'Other']
const FILE_TYPES     = ['pdf', 'doc', 'xlsx', 'other']

function typeBadge(type) {
  const map = { pdf: '#dc2626', doc: '#2563eb', xlsx: '#16a34a', other: '#737373' }
  return map[type] || '#737373'
}

export default function AdminDocuments() {
  const qc = useQueryClient()
  const [showPanel, setShowPanel] = useState(false)
  const [editing, setEditing] = useState(null)
  const { register, handleSubmit, reset, setValue, formState: { errors } } = useForm()

  const { data: docs = [], isLoading } = useQuery('admin-docs', () => api.get('/documents/all').then(r => r.data))

  const saveMut = useMutation(
    data => editing ? api.patch(`/documents/${editing.id}`, data) : api.post('/documents', data),
    {
      onSuccess: () => {
        qc.invalidateQueries('admin-docs')
        toast.success(editing ? 'Document updated!' : 'Document added!')
        setShowPanel(false)
        setEditing(null)
        reset()
      },
      onError: () => toast.error('Save failed'),
    }
  )

  const delMut = useMutation(id => api.delete(`/documents/${id}`), {
    onSuccess: () => { qc.invalidateQueries('admin-docs'); toast.success('Document deleted') },
    onError:   () => toast.error('Delete failed'),
  })

  function openAdd() {
    setEditing(null)
    reset({})
    setShowPanel(true)
  }

  function openEdit(doc) {
    setEditing(doc)
    Object.entries(doc).forEach(([k, v]) => setValue(k, v))
    setShowPanel(true)
  }

  function closePanel() {
    setShowPanel(false)
    setEditing(null)
    reset()
  }

  return (
    <div className="relative">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl flex items-center justify-center" style={{ background: 'linear-gradient(135deg,#5B2D8E,#7B4DB8)' }}>
            <i className="fas fa-folder-open text-sm text-white" />
          </div>
          <div>
            <h2 className="font-display font-bold text-xl" style={{ color: '#1A0A35' }}>Document Archive</h2>
            <p className="text-xs" style={{ color: '#A3A3A3', fontFamily: 'Poppins,sans-serif' }}>{docs.length} documents · {docs.filter(d => d.is_public).length} public</p>
          </div>
        </div>
        <button onClick={openAdd} className="btn-secondary !py-2 !px-4 !text-xs">
          <i className="fas fa-upload text-[10px]" />Upload Document
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        {[
          { label: 'Total Documents', value: docs.length,                               icon: 'fa-file', color: '#5B2D8E' },
          { label: 'Public',          value: docs.filter(d => d.is_public).length,      icon: 'fa-globe', color: '#16a34a' },
          { label: 'Private',         value: docs.filter(d => !d.is_public).length,     icon: 'fa-lock',  color: '#737373' },
          { label: 'PDFs',            value: docs.filter(d => d.file_type === 'pdf').length, icon: 'fa-file-pdf', color: '#dc2626' },
        ].map(s => (
          <div key={s.label} className="stat-card">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: `${s.color}18` }}>
                <i className={`fas ${s.icon} text-sm`} style={{ color: s.color }} />
              </div>
              <div>
                <div className="font-display font-bold text-xl" style={{ color: '#1A0A35' }}>{s.value}</div>
                <div className="text-xs" style={{ color: '#A3A3A3', fontFamily: 'Poppins,sans-serif' }}>{s.label}</div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Table */}
      {isLoading ? (
        <div className="space-y-3">{[1,2,3,4].map(i => <div key={i} className="h-16 rounded-2xl animate-pulse" style={{ background: 'rgba(91,45,142,0.04)' }} />)}</div>
      ) : docs.length ? (
        <div className="card overflow-hidden">
          <table className="w-full">
            <thead>
              <tr style={{ borderBottom: '1px solid rgba(91,45,142,0.08)' }}>
                {['Title', 'Category', 'Type', 'Year', 'Downloads', 'Visibility', 'Actions'].map(h => (
                  <th key={h} className="px-4 py-3 text-left text-xs font-bold uppercase tracking-wider" style={{ color: '#A3A3A3', fontFamily: 'Sora,sans-serif' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {docs.map((doc, i) => (
                <tr key={doc.id} style={{ borderBottom: i < docs.length - 1 ? '1px solid rgba(91,45,142,0.05)' : 'none' }} className="hover:bg-purple-50/30 transition-colors">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0" style={{ background: `${typeBadge(doc.file_type)}18` }}>
                        <i className="fas fa-file-alt text-xs" style={{ color: typeBadge(doc.file_type) }} />
                      </div>
                      <div>
                        <p className="font-display font-semibold text-sm" style={{ color: '#1A0A35' }}>{doc.title}</p>
                        {doc.description && <p className="text-xs truncate max-w-xs" style={{ color: '#A3A3A3', fontFamily: 'Poppins,sans-serif' }}>{doc.description}</p>}
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <span className="text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full"
                      style={{ background: 'rgba(91,45,142,0.08)', color: '#5B2D8E', fontFamily: 'Sora,sans-serif' }}>
                      {doc.category}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded"
                      style={{ background: `${typeBadge(doc.file_type)}18`, color: typeBadge(doc.file_type), fontFamily: 'Sora,sans-serif' }}>
                      {doc.file_type}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-sm" style={{ color: '#404040', fontFamily: 'Poppins,sans-serif' }}>{doc.year || '—'}</td>
                  <td className="px-4 py-3 text-sm" style={{ color: '#404040', fontFamily: 'Poppins,sans-serif' }}>{doc.downloads || 0}</td>
                  <td className="px-4 py-3">
                    <span className="text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full"
                      style={{ background: doc.is_public ? 'rgba(22,163,74,0.1)' : 'rgba(115,115,115,0.1)', color: doc.is_public ? '#16a34a' : '#737373', fontFamily: 'Sora,sans-serif' }}>
                      {doc.is_public ? 'Public' : 'Private'}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      {doc.file_url && (
                        <a href={doc.file_url} target="_blank" rel="noreferrer"
                          className="w-7 h-7 rounded-lg flex items-center justify-center hover:opacity-80"
                          style={{ background: 'rgba(22,163,74,0.1)', color: '#16a34a' }} title="Download">
                          <i className="fas fa-download text-[10px]" />
                        </a>
                      )}
                      <button onClick={() => openEdit(doc)}
                        className="w-7 h-7 rounded-lg flex items-center justify-center hover:opacity-80"
                        style={{ background: 'rgba(91,45,142,0.08)', color: '#5B2D8E' }}>
                        <i className="fas fa-edit text-[10px]" />
                      </button>
                      <button onClick={() => { if (window.confirm('Delete this document?')) delMut.mutate(doc.id) }}
                        className="w-7 h-7 rounded-lg flex items-center justify-center hover:opacity-80"
                        style={{ background: 'rgba(220,38,38,0.08)', color: '#dc2626' }}>
                        <i className="fas fa-trash text-[10px]" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="text-center py-16 rounded-3xl" style={{ background: 'rgba(91,45,142,0.02)', border: '1px dashed rgba(91,45,142,0.1)' }}>
          <i className="fas fa-folder-open text-4xl mb-3 block" style={{ color: 'rgba(91,45,142,0.15)' }} />
          <h4 className="font-display font-semibold mb-2" style={{ color: '#737373' }}>No documents yet</h4>
          <button onClick={openAdd} className="btn-secondary !text-sm !py-2 !px-5 mt-2">Upload First Document</button>
        </div>
      )}

      {/* Side Panel */}
      {showPanel && (
        <>
          <div className="fixed inset-0 z-40" style={{ background: 'rgba(26,10,53,0.4)' }} onClick={closePanel} />
          <div className="fixed right-0 top-0 bottom-0 z-50 w-full max-w-md bg-white overflow-y-auto" style={{ boxShadow: '-8px 0 40px rgba(26,10,53,0.15)' }}>
            <div className="px-6 pt-6 pb-4 border-b flex items-center justify-between" style={{ borderColor: 'rgba(91,45,142,0.08)' }}>
              <h3 className="font-display font-bold text-lg" style={{ color: '#1A0A35' }}>{editing ? 'Edit Document' : 'Upload Document'}</h3>
              <button onClick={closePanel} className="w-9 h-9 rounded-full flex items-center justify-center hover:bg-gray-100" style={{ color: '#A3A3A3' }}>
                <i className="fas fa-times" />
              </button>
            </div>
            <form onSubmit={handleSubmit(d => saveMut.mutate(d))} className="p-6 space-y-4">
              <div>
                <label className="label">Title *</label>
                <input {...register('title', { required: 'Title is required' })} className="input" placeholder="Document title" />
                {errors.title && <p className="text-xs mt-1" style={{ color: '#dc2626' }}>{errors.title.message}</p>}
              </div>
              <div>
                <label className="label">Description</label>
                <textarea {...register('description')} rows={2} className="input resize-none" placeholder="Brief description" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="label">Category</label>
                  <select {...register('category')} className="input">
                    <option value="">Select…</option>
                    {DOC_CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
                <div>
                  <label className="label">File Type</label>
                  <select {...register('file_type')} className="input">
                    <option value="">Select…</option>
                    {FILE_TYPES.map(t => <option key={t} value={t}>{t.toUpperCase()}</option>)}
                  </select>
                </div>
              </div>
              <div>
                <label className="label">File URL</label>
                <input {...register('file_url')} className="input" placeholder="https://…" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="label">Year</label>
                  <input type="number" {...register('year')} className="input" placeholder={new Date().getFullYear()} min={1990} max={2099} />
                </div>
                <div>
                  <label className="label">Sort Order</label>
                  <input type="number" {...register('sort_order')} className="input" placeholder="0" />
                </div>
              </div>
              <label className="flex items-center gap-2.5 cursor-pointer">
                <input type="checkbox" {...register('is_public')} className="w-4 h-4 rounded" style={{ accentColor: '#5B2D8E' }} />
                <span className="text-sm" style={{ color: '#404040', fontFamily: 'Poppins,sans-serif' }}>Publicly visible</span>
              </label>
              <div className="flex gap-3 pt-2">
                <button type="button" onClick={closePanel}
                  className="flex-1 py-3 rounded-2xl text-sm font-semibold"
                  style={{ background: 'rgba(91,45,142,0.05)', color: '#737373', border: '1px solid rgba(91,45,142,0.1)', fontFamily: 'Sora,sans-serif' }}>Cancel</button>
                <button type="submit" disabled={saveMut.isLoading} className="btn-secondary flex-1 justify-center">
                  {saveMut.isLoading ? <><i className="fas fa-spinner animate-spin" />Saving…</> : <><i className="fas fa-save" />{editing ? 'Update' : 'Upload'}</>}
                </button>
              </div>
            </form>
          </div>
        </>
      )}
    </div>
  )
}
