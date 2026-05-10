import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from 'react-query'
import { useForm } from 'react-hook-form'
import { format } from 'date-fns'
import toast from 'react-hot-toast'
import api from '../../services/api'

function PetitionForm({ petition, onClose }) {
  const qc = useQueryClient()
  const isEdit = !!petition
  const { register, handleSubmit, formState: { errors } } = useForm({
    defaultValues: petition ? {
      ...petition,
      expiresAt: petition.expiresAt ? new Date(petition.expiresAt).toISOString().slice(0,10) : '',
    } : { goal: 100 }
  })
  const mut = useMutation(
    d => isEdit ? api.patch(`/petitions/${petition.id}`, d) : api.post('/petitions', d),
    {
      onSuccess: () => { qc.invalidateQueries('admin-petitions'); toast.success(isEdit ? 'Updated!' : 'Created!'); onClose() },
      onError: e => toast.error(e.response?.data?.error || 'Failed'),
    }
  )
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: 'rgba(26,10,53,0.8)', backdropFilter: 'blur(8px)' }}
      onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="bg-white rounded-3xl w-full max-w-lg max-h-[90vh] overflow-y-auto"
        style={{ boxShadow: '0 32px 80px rgba(26,10,53,0.25)' }}>
        <div className="px-7 pt-6 pb-4 border-b sticky top-0 bg-white z-10"
          style={{ borderColor: 'rgba(91,45,142,0.08)' }}>
          <div className="flex items-center justify-between">
            <h3 className="font-display font-bold text-xl" style={{ color: '#1A0A35' }}>
              {isEdit ? 'Edit Petition' : 'New Petition'}
            </h3>
            <button onClick={onClose} className="w-9 h-9 rounded-full flex items-center justify-center hover:bg-gray-100"
              style={{ color: '#A3A3A3' }}><i className="fas fa-times"/></button>
          </div>
        </div>
        <form onSubmit={handleSubmit(d => mut.mutate(d))} className="p-7 space-y-4">
          <div>
            <label className="label">Title *</label>
            <input {...register('title', { required: 'Required' })} className="input"/>
            {errors.title && <p className="text-xs mt-1 text-red-500">{errors.title.message}</p>}
          </div>
          <div>
            <label className="label">Description *</label>
            <textarea {...register('description', { required: 'Required' })} rows={4} className="input resize-none"/>
            {errors.description && <p className="text-xs mt-1 text-red-500">{errors.description.message}</p>}
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="label">Signature Goal *</label>
              <input type="number" {...register('goal', { required: 'Required', min: 1 })} className="input"/>
            </div>
            <div>
              <label className="label">Expires</label>
              <input type="date" {...register('expiresAt')} className="input"/>
            </div>
          </div>
          <div>
            <label className="label">Image URL</label>
            <input {...register('imageUrl')} className="input" placeholder="https://…"/>
          </div>
          {isEdit && (
            <label className="flex items-center gap-2 text-sm cursor-pointer" style={{ fontFamily: 'Poppins,sans-serif' }}>
              <input type="checkbox" {...register('isClosed')} className="w-4 h-4 rounded accent-primary-500"/>
              Close this petition
            </label>
          )}
          <div className="flex gap-3 pt-2">
            <button type="button" onClick={onClose}
              className="flex-1 py-3 rounded-2xl text-sm font-semibold"
              style={{ background: 'rgba(91,45,142,0.05)', color: '#737373', border: '1px solid rgba(91,45,142,0.1)' }}>
              Cancel
            </button>
            <button type="submit" disabled={mut.isLoading} className="btn-secondary flex-1 justify-center">
              {mut.isLoading ? <><i className="fas fa-spinner animate-spin"/>Saving…</> : <><i className="fas fa-save"/>Save</>}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default function AdminPetitions() {
  const qc = useQueryClient()
  const [showForm, setShowForm] = useState(false)
  const [editing, setEditing] = useState(null)
  const [filter, setFilter] = useState('')

  const { data: petitions = [], isLoading } = useQuery(
    ['admin-petitions', filter],
    () => api.get('/petitions/admin', { params: filter ? { status: filter } : {} }).then(r => r.data)
  )

  const deleteMut = useMutation(id => api.delete(`/petitions/${id}`), {
    onSuccess: () => { qc.invalidateQueries('admin-petitions'); toast.success('Deleted') },
  })

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="font-display font-bold text-2xl" style={{ color: '#1A0A35' }}>Petitions</h2>
          <p className="text-sm mt-0.5" style={{ color: '#737373', fontFamily: 'Poppins,sans-serif' }}>Create and manage community petitions</p>
        </div>
        <button onClick={() => { setEditing(null); setShowForm(true) }} className="btn-secondary">
          <i className="fas fa-plus"/>New Petition
        </button>
      </div>

      <div className="flex gap-2">
        {[['','All'],['open','Open'],['closed','Closed']].map(([v,l]) => (
          <button key={v} onClick={() => setFilter(v)}
            className="text-xs font-semibold px-4 py-2 rounded-xl transition-all"
            style={{ background: filter === v ? '#5B2D8E' : 'rgba(91,45,142,0.07)', color: filter === v ? '#fff' : '#737373', fontFamily: 'Sora,sans-serif' }}>
            {l}
          </button>
        ))}
      </div>

      {isLoading ? (
        <div className="space-y-3">{[1,2,3].map(i => <div key={i} className="h-24 rounded-2xl animate-pulse" style={{ background: 'rgba(91,45,142,0.05)' }}/>)}</div>
      ) : !petitions.length ? (
        <div className="text-center py-20 rounded-3xl" style={{ background: 'rgba(91,45,142,0.02)', border: '1px dashed rgba(91,45,142,0.12)' }}>
          <i className="fas fa-scroll text-5xl mb-4 block" style={{ color: 'rgba(91,45,142,0.18)' }}/>
          <h3 className="font-display font-bold text-xl mb-2" style={{ color: '#1A0A35' }}>No petitions</h3>
          <button onClick={() => setShowForm(true)} className="btn-secondary mt-4 !text-sm">Create first petition</button>
        </div>
      ) : (
        <div className="rounded-3xl overflow-hidden" style={{ background: '#fff', boxShadow: '0 2px 16px rgba(91,45,142,0.06)' }}>
          <table className="w-full text-sm">
            <thead style={{ background: 'rgba(91,45,142,0.04)' }}>
              <tr>
                {['Title','Signatures','Goal','Status','Expires','Actions'].map(h => (
                  <th key={h} className="text-left px-5 py-3 text-xs font-bold uppercase tracking-widest"
                    style={{ color: '#5B2D8E', fontFamily: 'Sora,sans-serif' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {petitions.map((p, i) => {
                const count = p._count?.signatures || 0
                const pct = Math.min(100, Math.round((count / p.goal) * 100))
                const expired = p.expiresAt && new Date(p.expiresAt) < new Date()
                const closed = p.isClosed || expired
                return (
                  <tr key={p.id} style={{ background: i % 2 === 0 ? 'transparent' : 'rgba(91,45,142,0.015)' }}>
                    <td className="px-5 py-4">
                      <div className="font-semibold text-sm" style={{ color: '#1A0A35' }}>{p.title}</div>
                      <div className="text-xs mt-0.5" style={{ color: '#A3A3A3', fontFamily: 'Poppins,sans-serif' }}>{format(new Date(p.createdAt), 'MMM d, yyyy')}</div>
                    </td>
                    <td className="px-5 py-4">
                      <div className="font-bold text-sm" style={{ color: '#5B2D8E' }}>{count.toLocaleString()}</div>
                      <div className="h-1.5 w-20 rounded-full mt-1 overflow-hidden" style={{ background: 'rgba(91,45,142,0.1)' }}>
                        <div className="h-full rounded-full" style={{ width: `${pct}%`, background: pct >= 100 ? '#16a34a' : '#5B2D8E' }}/>
                      </div>
                    </td>
                    <td className="px-5 py-4 text-sm" style={{ color: '#737373' }}>{p.goal.toLocaleString()}</td>
                    <td className="px-5 py-4">
                      <span className="text-xs font-bold px-2.5 py-1 rounded-full"
                        style={{ background: closed ? 'rgba(115,115,115,0.1)' : 'rgba(22,163,74,0.1)', color: closed ? '#737373' : '#16a34a' }}>
                        {closed ? 'Closed' : 'Open'}
                      </span>
                    </td>
                    <td className="px-5 py-4 text-xs" style={{ color: '#737373', fontFamily: 'Poppins,sans-serif' }}>
                      {p.expiresAt ? format(new Date(p.expiresAt), 'MMM d, yyyy') : '—'}
                    </td>
                    <td className="px-5 py-4">
                      <div className="flex gap-1">
                        <button onClick={() => { setEditing(p); setShowForm(true) }}
                          className="w-8 h-8 rounded-xl flex items-center justify-center"
                          style={{ background: 'rgba(91,45,142,0.08)', color: '#5B2D8E' }}>
                          <i className="fas fa-edit text-xs"/>
                        </button>
                        <button onClick={() => { if (confirm('Delete?')) deleteMut.mutate(p.id) }}
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
      {showForm && <PetitionForm petition={editing} onClose={() => { setShowForm(false); setEditing(null) }}/>}
    </div>
  )
}
