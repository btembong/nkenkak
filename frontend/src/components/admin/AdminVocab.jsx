import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from 'react-query'
import { useForm } from 'react-hook-form'
import toast from 'react-hot-toast'
import api from '../../services/api'

const VOCAB_CATEGORIES = ['Greetings', 'Family', 'Nature', 'Food', 'Colours', 'Numbers', 'Animals', 'Verbs', 'Proverbs', 'Other']

const CAT_COLORS = {
  Greetings: '#16a34a', Family: '#7c3aed', Nature: '#0284c7',
  Food: '#d97706', Colours: '#db2777', Numbers: '#5B2D8E',
  Animals: '#65a30d', Verbs: '#dc2626', Proverbs: '#b45309', Other: '#737373',
}

export default function AdminVocab() {
  const qc = useQueryClient()
  const [showForm, setShowForm] = useState(false)
  const [editingRow, setEditingRow] = useState(null) // id of row being inline-edited
  const [inlineData, setInlineData] = useState({})
  const { register, handleSubmit, reset, formState: { errors } } = useForm()

  const { data: words = [], isLoading } = useQuery(
    'admin-vocab',
    () => api.get('/vocab').then(r => r.data)
  )

  const createMut = useMutation(data => api.post('/vocab', data), {
    onSuccess: () => {
      qc.invalidateQueries('admin-vocab')
      toast.success('Word added!')
      setShowForm(false); reset()
    },
    onError: () => toast.error('Save failed'),
  })

  const updateMut = useMutation(({ id, data }) => api.patch(`/vocab/${id}`, data), {
    onSuccess: () => {
      qc.invalidateQueries('admin-vocab')
      toast.success('Word updated!')
      setEditingRow(null); setInlineData({})
    },
    onError: () => toast.error('Update failed'),
  })

  const delMut = useMutation(id => api.delete(`/vocab/${id}`), {
    onSuccess: () => { qc.invalidateQueries('admin-vocab'); toast.success('Word deleted') },
    onError:   () => toast.error('Delete failed'),
  })

  function startInlineEdit(word) {
    setEditingRow(word.id)
    setInlineData({ ...word })
  }

  function cancelInlineEdit() {
    setEditingRow(null)
    setInlineData({})
  }

  function saveInline(id) {
    updateMut.mutate({ id, data: inlineData })
  }

  const totalWords   = words.length
  const categories   = [...new Set(words.map(w => w.category).filter(Boolean))]
  const catBreakdown = categories.map(c => ({ cat: c, count: words.filter(w => w.category === c).length }))
    .sort((a,b) => b.count - a.count)

  return (
    <div>
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl flex items-center justify-center" style={{ background: 'linear-gradient(135deg,#5B2D8E,#7B4DB8)' }}>
            <i className="fas fa-language text-sm text-white" />
          </div>
          <div>
            <h2 className="font-display font-bold text-xl" style={{ color: '#1A0A35' }}>Language Vocabulary</h2>
            <p className="text-xs" style={{ color: '#A3A3A3', fontFamily: 'Poppins,sans-serif' }}>{totalWords} words · {categories.length} categories</p>
          </div>
        </div>
        <button onClick={() => { reset({}); setShowForm(true) }} className="btn-secondary !py-2 !px-4 !text-xs">
          <i className="fas fa-plus text-[10px]" />Add Word
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <div className="stat-card col-span-2 md:col-span-1">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ background: 'rgba(91,45,142,0.1)' }}>
              <i className="fas fa-book text-sm" style={{ color: '#5B2D8E' }} />
            </div>
            <div>
              <div className="font-display font-bold text-xl" style={{ color: '#1A0A35' }}>{totalWords}</div>
              <div className="text-xs" style={{ color: '#A3A3A3', fontFamily: 'Poppins,sans-serif' }}>Total Words</div>
            </div>
          </div>
        </div>
        <div className="stat-card">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ background: 'rgba(22,163,74,0.1)' }}>
              <i className="fas fa-th text-sm" style={{ color: '#16a34a' }} />
            </div>
            <div>
              <div className="font-display font-bold text-xl" style={{ color: '#1A0A35' }}>{categories.length}</div>
              <div className="text-xs" style={{ color: '#A3A3A3', fontFamily: 'Poppins,sans-serif' }}>Categories</div>
            </div>
          </div>
        </div>
        <div className="stat-card col-span-2 md:col-span-2">
          <div className="flex flex-wrap gap-2">
            {catBreakdown.slice(0,6).map(({ cat, count }) => (
              <div key={cat} className="flex items-center gap-1.5">
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full"
                  style={{ background: `${CAT_COLORS[cat] || '#737373'}18`, color: CAT_COLORS[cat] || '#737373', fontFamily: 'Sora,sans-serif' }}>
                  {cat}
                </span>
                <span className="text-[10px]" style={{ color: '#A3A3A3', fontFamily: 'Sora,sans-serif' }}>{count}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Table */}
      {isLoading ? (
        <div className="space-y-3">{[1,2,3,4,5].map(i => <div key={i} className="h-14 rounded-2xl animate-pulse" style={{ background: 'rgba(91,45,142,0.04)' }} />)}</div>
      ) : words.length ? (
        <div className="card overflow-hidden">
          <table className="w-full">
            <thead>
              <tr style={{ borderBottom: '1px solid rgba(91,45,142,0.08)' }}>
                {['Word', 'Translation', 'Pronunciation', 'Category', 'Example', 'Actions'].map(h => (
                  <th key={h} className="px-4 py-3 text-left text-xs font-bold uppercase tracking-wider" style={{ color: '#A3A3A3', fontFamily: 'Sora,sans-serif' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {words.map((w, i) => {
                const isEditing = editingRow === w.id
                const catColor  = CAT_COLORS[w.category] || '#737373'
                return (
                  <tr key={w.id} style={{ borderBottom: i < words.length - 1 ? '1px solid rgba(91,45,142,0.05)' : 'none', background: isEditing ? 'rgba(91,45,142,0.03)' : undefined }}>
                    <td className="px-4 py-3">
                      {isEditing
                        ? <input value={inlineData.word || ''} onChange={e => setInlineData(p => ({ ...p, word: e.target.value }))} className="input !py-1.5 !text-sm" />
                        : <span className="font-display font-semibold text-sm" style={{ color: '#1A0A35' }}>{w.word}</span>}
                    </td>
                    <td className="px-4 py-3">
                      {isEditing
                        ? <input value={inlineData.translation || ''} onChange={e => setInlineData(p => ({ ...p, translation: e.target.value }))} className="input !py-1.5 !text-sm" />
                        : <span className="text-sm" style={{ color: '#404040', fontFamily: 'Poppins,sans-serif' }}>{w.translation}</span>}
                    </td>
                    <td className="px-4 py-3">
                      {isEditing
                        ? <input value={inlineData.pronunciation || ''} onChange={e => setInlineData(p => ({ ...p, pronunciation: e.target.value }))} className="input !py-1.5 !text-sm" placeholder="/ … /" />
                        : <span className="text-sm italic" style={{ color: '#737373', fontFamily: 'Poppins,sans-serif' }}>{w.pronunciation || '—'}</span>}
                    </td>
                    <td className="px-4 py-3">
                      {isEditing
                        ? <select value={inlineData.category || ''} onChange={e => setInlineData(p => ({ ...p, category: e.target.value }))} className="input !py-1.5 !text-sm">
                            <option value="">—</option>
                            {VOCAB_CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                          </select>
                        : w.category
                          ? <span className="text-[10px] font-bold px-2.5 py-1 rounded-full" style={{ background: `${catColor}18`, color: catColor, fontFamily: 'Sora,sans-serif' }}>{w.category}</span>
                          : <span style={{ color: '#A3A3A3' }}>—</span>}
                    </td>
                    <td className="px-4 py-3" style={{ maxWidth: '180px' }}>
                      {isEditing
                        ? <input value={inlineData.example || ''} onChange={e => setInlineData(p => ({ ...p, example: e.target.value }))} className="input !py-1.5 !text-sm" />
                        : <span className="text-xs line-clamp-2" style={{ color: '#737373', fontFamily: 'Poppins,sans-serif', fontStyle: 'italic' }}>{w.example || '—'}</span>}
                    </td>
                    <td className="px-4 py-3">
                      {isEditing ? (
                        <div className="flex gap-2">
                          <button onClick={() => saveInline(w.id)} disabled={updateMut.isLoading}
                            className="text-[10px] font-bold px-2.5 py-1.5 rounded-xl" style={{ background: 'rgba(22,163,74,0.1)', color: '#16a34a', fontFamily: 'Sora,sans-serif' }}>
                            {updateMut.isLoading ? <i className="fas fa-spinner animate-spin" /> : <><i className="fas fa-check mr-1" />Save</>}
                          </button>
                          <button onClick={cancelInlineEdit}
                            className="text-[10px] font-bold px-2.5 py-1.5 rounded-xl" style={{ background: 'rgba(115,115,115,0.1)', color: '#737373', fontFamily: 'Sora,sans-serif' }}>
                            Cancel
                          </button>
                        </div>
                      ) : (
                        <div className="flex gap-2">
                          <button onClick={() => startInlineEdit(w)} className="w-7 h-7 rounded-lg flex items-center justify-center" style={{ background: 'rgba(91,45,142,0.08)', color: '#5B2D8E' }}>
                            <i className="fas fa-edit text-[10px]" />
                          </button>
                          <button onClick={() => { if (window.confirm('Delete this word?')) delMut.mutate(w.id) }}
                            className="w-7 h-7 rounded-lg flex items-center justify-center" style={{ background: 'rgba(220,38,38,0.08)', color: '#dc2626' }}>
                            <i className="fas fa-trash text-[10px]" />
                          </button>
                        </div>
                      )}
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="text-center py-16 rounded-3xl" style={{ background: 'rgba(91,45,142,0.02)', border: '1px dashed rgba(91,45,142,0.1)' }}>
          <i className="fas fa-language text-4xl mb-3 block" style={{ color: 'rgba(91,45,142,0.15)' }} />
          <h4 className="font-display font-semibold mb-2" style={{ color: '#737373' }}>No vocabulary entries yet</h4>
          <button onClick={() => { reset({}); setShowForm(true) }} className="btn-secondary !text-sm !py-2 !px-5 mt-2">Add First Word</button>
        </div>
      )}

      {/* Add Modal */}
      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4"
          style={{ background: 'rgba(26,10,53,0.8)', backdropFilter: 'blur(8px)' }}
          onClick={e => e.target === e.currentTarget && (setShowForm(false), reset())}>
          <div className="bg-white rounded-3xl w-full max-w-lg" style={{ boxShadow: '0 32px 80px rgba(26,10,53,0.25)' }}>
            <div className="px-7 pt-6 pb-4 border-b flex items-center justify-between" style={{ borderColor: 'rgba(91,45,142,0.08)' }}>
              <h3 className="font-display font-bold text-xl" style={{ color: '#1A0A35' }}>Add Vocabulary Word</h3>
              <button onClick={() => { setShowForm(false); reset() }} className="w-9 h-9 rounded-full flex items-center justify-center hover:bg-gray-100" style={{ color: '#A3A3A3' }}>
                <i className="fas fa-times" />
              </button>
            </div>
            <form onSubmit={handleSubmit(d => createMut.mutate(d))} className="p-7 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="label">Word *</label>
                  <input {...register('word', { required: true })} className="input" placeholder="e.g. Mboa" />
                </div>
                <div>
                  <label className="label">Translation *</label>
                  <input {...register('translation', { required: true })} className="input" placeholder="English meaning" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="label">Pronunciation</label>
                  <input {...register('pronunciation')} className="input" placeholder="/ m-bo-ah /" />
                </div>
                <div>
                  <label className="label">Category</label>
                  <select {...register('category')} className="input">
                    <option value="">Select…</option>
                    {VOCAB_CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
              </div>
              <div>
                <label className="label">Example Sentence</label>
                <input {...register('example')} className="input" placeholder="Use the word in context…" />
              </div>
              <div>
                <label className="label">Sort Order</label>
                <input type="number" {...register('sort_order')} className="input" placeholder="0" />
              </div>
              <div className="flex gap-3 pt-2">
                <button type="button" onClick={() => { setShowForm(false); reset() }}
                  className="flex-1 py-3 rounded-2xl text-sm font-semibold"
                  style={{ background: 'rgba(91,45,142,0.05)', color: '#737373', border: '1px solid rgba(91,45,142,0.1)', fontFamily: 'Sora,sans-serif' }}>Cancel</button>
                <button type="submit" disabled={createMut.isLoading} className="btn-secondary flex-1 justify-center">
                  {createMut.isLoading ? <><i className="fas fa-spinner animate-spin" />Adding…</> : <><i className="fas fa-plus" />Add Word</>}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
