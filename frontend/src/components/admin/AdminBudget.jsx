import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from 'react-query'
import { useForm } from 'react-hook-form'
import toast from 'react-hot-toast'
import api from '../../services/api'

function BudgetForm({ entry, onClose }) {
  const qc = useQueryClient()
  const isEdit = !!entry
  const { register, handleSubmit, formState: { errors } } = useForm({
    defaultValues: entry || { type: 'expense', quarter: 'Q1', currency: 'XAF', amount: '' }
  })
  const mut = useMutation(
    d => isEdit ? api.patch(`/budget/${entry.id}`, d) : api.post('/budget', d),
    {
      onSuccess: () => { qc.invalidateQueries('admin-budget'); toast.success(isEdit ? 'Updated!' : 'Entry added!'); onClose() },
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
              {isEdit ? 'Edit Entry' : 'Add Budget Entry'}
            </h3>
            <button onClick={onClose} className="w-9 h-9 rounded-full flex items-center justify-center hover:bg-gray-100"
              style={{ color: '#A3A3A3' }}><i className="fas fa-times"/></button>
          </div>
        </div>
        <form onSubmit={handleSubmit(d => mut.mutate(d))} className="p-7 space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="label">Year *</label>
              <input type="number" {...register('year', { required: 'Required', min: 2000 })}
                className="input" defaultValue={new Date().getFullYear()}/>
            </div>
            <div>
              <label className="label">Quarter *</label>
              <select {...register('quarter')} className="input">
                {['Q1','Q2','Q3','Q4'].map(q => <option key={q} value={q}>{q}</option>)}
              </select>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="label">Type *</label>
              <select {...register('type')} className="input">
                <option value="income">Income</option>
                <option value="expense">Expense</option>
              </select>
            </div>
            <div>
              <label className="label">Category *</label>
              <input {...register('category', { required: 'Required' })} className="input" placeholder="e.g. Donations, Infrastructure"/>
              {errors.category && <p className="text-xs mt-1 text-red-500">{errors.category.message}</p>}
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="label">Amount *</label>
              <input type="number" step="0.01" {...register('amount', { required: 'Required', min: 0 })} className="input"/>
              {errors.amount && <p className="text-xs mt-1 text-red-500">{errors.amount.message}</p>}
            </div>
            <div>
              <label className="label">Currency</label>
              <select {...register('currency')} className="input">
                <option value="XAF">XAF</option>
                <option value="USD">USD</option>
                <option value="EUR">EUR</option>
                <option value="GBP">GBP</option>
              </select>
            </div>
          </div>
          <div>
            <label className="label">Description</label>
            <textarea {...register('description')} rows={2} className="input resize-none"
              placeholder="Brief description of this entry…"/>
          </div>
          <div>
            <label className="label">Receipt URL</label>
            <input {...register('receiptUrl')} className="input" placeholder="https://… (link to receipt)"/>
          </div>
          <div className="flex gap-3 pt-2">
            <button type="button" onClick={onClose}
              className="flex-1 py-3 rounded-2xl text-sm font-semibold"
              style={{ background: 'rgba(91,45,142,0.05)', color: '#737373', border: '1px solid rgba(91,45,142,0.1)' }}>
              Cancel
            </button>
            <button type="submit" disabled={mut.isLoading} className="btn-secondary flex-1 justify-center">
              {mut.isLoading ? <><i className="fas fa-spinner animate-spin"/>Saving…</> : <><i className="fas fa-save"/>Save Entry</>}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default function AdminBudget() {
  const qc = useQueryClient()
  const [showForm, setShowForm] = useState(false)
  const [editing, setEditing] = useState(null)
  const [year, setYear] = useState(new Date().getFullYear())

  const { data, isLoading } = useQuery(
    ['admin-budget', year],
    () => api.get('/budget/admin', { params: { year } }).then(r => r.data)
  )

  const deleteMut = useMutation(id => api.delete(`/budget/${id}`), {
    onSuccess: () => { qc.invalidateQueries('admin-budget'); toast.success('Deleted') },
  })

  const years = Array.from({ length: 5 }, (_, i) => new Date().getFullYear() - i)

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="font-display font-bold text-2xl" style={{ color: '#1A0A35' }}>Village Budget</h2>
          <p className="text-sm mt-0.5" style={{ color: '#737373', fontFamily: 'Poppins,sans-serif' }}>Manage financial transparency records</p>
        </div>
        <button onClick={() => { setEditing(null); setShowForm(true) }} className="btn-secondary">
          <i className="fas fa-plus"/>Add Entry
        </button>
      </div>

      {/* Year selector */}
      <div className="flex items-center gap-3">
        <span className="text-sm font-semibold" style={{ color: '#737373', fontFamily: 'Sora,sans-serif' }}>Year:</span>
        <div className="flex gap-1 p-1 rounded-xl" style={{ background: 'rgba(91,45,142,0.06)' }}>
          {years.map(y => (
            <button key={y} onClick={() => setYear(y)}
              className="text-xs font-semibold px-4 py-1.5 rounded-lg transition-all"
              style={{ background: year === y ? '#5B2D8E' : 'transparent', color: year === y ? '#fff' : '#737373', fontFamily: 'Sora,sans-serif' }}>
              {y}
            </button>
          ))}
        </div>
      </div>

      {/* Summary */}
      {data && (
        <div className="grid grid-cols-3 gap-4">
          {[
            { label: 'Total Income',   value: data.totalIncome,   color: '#16a34a', bg: 'rgba(22,163,74,0.1)',   icon: 'fa-arrow-down' },
            { label: 'Total Expenses', value: data.totalExpenses, color: '#dc2626', bg: 'rgba(220,38,38,0.08)',  icon: 'fa-arrow-up' },
            { label: 'Net Balance',    value: data.balance,       color: data.balance >= 0 ? '#5B2D8E' : '#dc2626', bg: data.balance >= 0 ? 'rgba(91,45,142,0.1)' : 'rgba(220,38,38,0.08)', icon: 'fa-balance-scale' },
          ].map(s => (
            <div key={s.label} className="rounded-2xl p-5 flex items-center gap-4"
              style={{ background: '#fff', boxShadow: '0 2px 12px rgba(91,45,142,0.06)' }}>
              <div className="w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0"
                style={{ background: s.bg }}>
                <i className={`fas ${s.icon} text-sm`} style={{ color: s.color }}/>
              </div>
              <div>
                <div className="font-display font-bold text-xl" style={{ color: '#1A0A35' }}>
                  {Number(s.value).toLocaleString()}
                </div>
                <div className="text-xs" style={{ color: '#A3A3A3', fontFamily: 'Poppins,sans-serif' }}>{s.label} (XAF)</div>
              </div>
            </div>
          ))}
        </div>
      )}

      {isLoading ? (
        <div className="space-y-3">{[1,2,3].map(i => <div key={i} className="h-16 rounded-2xl animate-pulse" style={{ background: 'rgba(91,45,142,0.05)' }}/>)}</div>
      ) : !data?.entries?.length ? (
        <div className="text-center py-20 rounded-3xl" style={{ background: 'rgba(91,45,142,0.02)', border: '1px dashed rgba(91,45,142,0.12)' }}>
          <i className="fas fa-chart-pie text-5xl mb-4 block" style={{ color: 'rgba(91,45,142,0.18)' }}/>
          <h3 className="font-display font-bold text-xl mb-2" style={{ color: '#1A0A35' }}>No entries for {year}</h3>
          <button onClick={() => setShowForm(true)} className="btn-secondary mt-4 !text-sm">Add first entry</button>
        </div>
      ) : (
        <div className="rounded-3xl overflow-hidden" style={{ background: '#fff', boxShadow: '0 2px 16px rgba(91,45,142,0.06)' }}>
          <table className="w-full text-sm">
            <thead style={{ background: 'rgba(91,45,142,0.04)' }}>
              <tr>
                {['Quarter','Category','Type','Amount','Description','Receipt','Actions'].map(h => (
                  <th key={h} className="text-left px-5 py-3 text-xs font-bold uppercase tracking-widest"
                    style={{ color: '#5B2D8E', fontFamily: 'Sora,sans-serif' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {data.entries.map((e, i) => (
                <tr key={e.id} style={{ background: i % 2 === 0 ? 'transparent' : 'rgba(91,45,142,0.015)' }}>
                  <td className="px-5 py-3 font-semibold text-xs" style={{ color: '#5B2D8E' }}>{e.quarter}</td>
                  <td className="px-5 py-3 text-xs" style={{ color: '#1A0A35' }}>{e.category}</td>
                  <td className="px-5 py-3">
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full"
                      style={{ background: e.type==='income'?'rgba(22,163,74,0.1)':'rgba(220,38,38,0.1)', color: e.type==='income'?'#16a34a':'#dc2626' }}>
                      {e.type}
                    </span>
                  </td>
                  <td className="px-5 py-3 font-bold text-xs" style={{ color: '#1A0A35' }}>
                    {Number(e.amount).toLocaleString()} {e.currency}
                  </td>
                  <td className="px-5 py-3 max-w-xs truncate text-xs" style={{ color: '#737373' }}>{e.description || '—'}</td>
                  <td className="px-5 py-3 text-xs">
                    {e.receiptUrl
                      ? <a href={e.receiptUrl} target="_blank" rel="noopener noreferrer" style={{ color: '#5B2D8E' }}><i className="fas fa-link"/></a>
                      : <span style={{ color: '#D4D4D4' }}>—</span>}
                  </td>
                  <td className="px-5 py-3">
                    <div className="flex gap-1">
                      <button onClick={() => { setEditing(e); setShowForm(true) }}
                        className="w-7 h-7 rounded-lg flex items-center justify-center"
                        style={{ background: 'rgba(91,45,142,0.08)', color: '#5B2D8E' }}>
                        <i className="fas fa-edit text-[10px]"/>
                      </button>
                      <button onClick={() => { if (confirm('Delete entry?')) deleteMut.mutate(e.id) }}
                        className="w-7 h-7 rounded-lg flex items-center justify-center"
                        style={{ background: 'rgba(220,38,38,0.08)', color: '#dc2626' }}>
                        <i className="fas fa-trash text-[10px]"/>
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      {showForm && <BudgetForm entry={editing} onClose={() => { setShowForm(false); setEditing(null) }}/>}
    </div>
  )
}
