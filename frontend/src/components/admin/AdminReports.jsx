import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from 'react-query'
import { useForm } from 'react-hook-form'
import { format } from 'date-fns'
import toast from 'react-hot-toast'
import api from '../../services/api'

const PERIODS = ['Annual', 'Q1', 'Q2', 'Q3', 'Q4', 'H1', 'H2']

function fmtXAF(n) {
  if (!n && n !== 0) return '—'
  return 'XAF ' + Number(n).toLocaleString('en-US')
}

function surplusStyle(income, expenses) {
  const diff = (income || 0) - (expenses || 0)
  if (diff > 0)  return { value: `+${fmtXAF(diff)}`, color: '#16a34a', bg: 'rgba(22,163,74,0.1)' }
  if (diff < 0)  return { value: fmtXAF(diff),        color: '#dc2626', bg: 'rgba(220,38,38,0.08)' }
  return { value: 'Balanced', color: '#737373', bg: 'rgba(115,115,115,0.08)' }
}

export default function AdminReports() {
  const qc = useQueryClient()
  const [showForm, setShowForm] = useState(false)
  const [editing, setEditing] = useState(null)
  const { register, handleSubmit, reset, setValue, formState: { errors } } = useForm()

  const { data: reports = [], isLoading } = useQuery(
    'admin-reports',
    () => api.get('/reports/all').then(r => r.data)
  )

  const saveMut = useMutation(
    data => {
      const payload = {
        ...data,
        highlights: typeof data.highlights === 'string'
          ? data.highlights.split(',').map(s => s.trim()).filter(Boolean)
          : (data.highlights || []),
        total_income:   Number(data.total_income)   || 0,
        total_expenses: Number(data.total_expenses) || 0,
      }
      return editing ? api.patch(`/reports/${editing.id}`, payload) : api.post('/reports', payload)
    },
    {
      onSuccess: () => {
        qc.invalidateQueries('admin-reports')
        toast.success(editing ? 'Report updated!' : 'Report added!')
        setShowForm(false); setEditing(null); reset()
      },
      onError: () => toast.error('Save failed'),
    }
  )

  const delMut = useMutation(id => api.delete(`/reports/${id}`), {
    onSuccess: () => { qc.invalidateQueries('admin-reports'); toast.success('Report deleted') },
    onError:   () => toast.error('Delete failed'),
  })

  const togglePublish = (report) => {
    api.patch(`/reports/${report.id}`, { is_published: !report.is_published })
      .then(() => { qc.invalidateQueries('admin-reports'); toast.success(report.is_published ? 'Unpublished' : 'Published') })
      .catch(() => toast.error('Update failed'))
  }

  function openAdd() { setEditing(null); reset({}); setShowForm(true) }
  function openEdit(r) {
    setEditing(r)
    const d = { ...r, highlights: Array.isArray(r.highlights) ? r.highlights.join(', ') : (r.highlights || '') }
    Object.entries(d).forEach(([k,v]) => setValue(k,v))
    setShowForm(true)
  }
  function closeForm() { setShowForm(false); setEditing(null); reset() }

  const published = reports.filter(r => r.is_published)
  const totalIncome   = published.reduce((s, r) => s + (Number(r.total_income)   || 0), 0)
  const totalExpenses = published.reduce((s, r) => s + (Number(r.total_expenses) || 0), 0)
  const netBalance    = totalIncome - totalExpenses

  return (
    <div>
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl flex items-center justify-center" style={{ background: 'linear-gradient(135deg,#5B2D8E,#7B4DB8)' }}>
            <i className="fas fa-chart-bar text-sm text-white" />
          </div>
          <div>
            <h2 className="font-display font-bold text-xl" style={{ color: '#1A0A35' }}>Financial Reports</h2>
            <p className="text-xs" style={{ color: '#A3A3A3', fontFamily: 'Poppins,sans-serif' }}>{reports.length} reports · {published.length} published</p>
          </div>
        </div>
        <button onClick={openAdd} className="btn-secondary !py-2 !px-4 !text-xs">
          <i className="fas fa-plus text-[10px]" />Add Report
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        {[
          { label: 'Total Reports',    value: reports.length, icon: 'fa-file-invoice',    color: '#5B2D8E', fmt: v => v },
          { label: 'Total Income',     value: totalIncome,    icon: 'fa-arrow-up',        color: '#16a34a', fmt: fmtXAF },
          { label: 'Total Expenses',   value: totalExpenses,  icon: 'fa-arrow-down',      color: '#dc2626', fmt: fmtXAF },
          { label: netBalance >= 0 ? 'Net Surplus' : 'Net Deficit', value: Math.abs(netBalance), icon: netBalance >= 0 ? 'fa-piggy-bank' : 'fa-exclamation-triangle', color: netBalance >= 0 ? '#16a34a' : '#dc2626', fmt: v => (netBalance >= 0 ? '+' : '-') + fmtXAF(v) },
        ].map(s => (
          <div key={s.label} className="stat-card">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: `${s.color}18` }}>
                <i className={`fas ${s.icon} text-sm`} style={{ color: s.color }} />
              </div>
              <div className="min-w-0">
                <div className="font-display font-bold text-base truncate" style={{ color: '#1A0A35' }}>{s.fmt(s.value)}</div>
                <div className="text-xs" style={{ color: '#A3A3A3', fontFamily: 'Poppins,sans-serif' }}>{s.label}</div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Table */}
      {isLoading ? (
        <div className="space-y-3">{[1,2,3].map(i => <div key={i} className="h-20 rounded-2xl animate-pulse" style={{ background: 'rgba(91,45,142,0.04)' }} />)}</div>
      ) : reports.length ? (
        <div className="card overflow-hidden">
          <table className="w-full">
            <thead>
              <tr style={{ borderBottom: '1px solid rgba(91,45,142,0.08)' }}>
                {['Report', 'Period', 'Income', 'Expenses', 'Surplus/Deficit', 'Published', 'Actions'].map(h => (
                  <th key={h} className="px-4 py-3 text-left text-xs font-bold uppercase tracking-wider" style={{ color: '#A3A3A3', fontFamily: 'Sora,sans-serif' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {reports.map((r, i) => {
                const ss = surplusStyle(r.total_income, r.total_expenses)
                return (
                  <tr key={r.id} style={{ borderBottom: i < reports.length - 1 ? '1px solid rgba(91,45,142,0.05)' : 'none' }} className="hover:bg-purple-50/30 transition-colors">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: 'rgba(91,45,142,0.08)' }}>
                          <i className="fas fa-file-invoice text-sm" style={{ color: '#5B2D8E' }} />
                        </div>
                        <div>
                          <p className="font-display font-semibold text-sm" style={{ color: '#1A0A35' }}>{r.title}</p>
                          {r.summary && <p className="text-xs line-clamp-1" style={{ color: '#A3A3A3', fontFamily: 'Poppins,sans-serif' }}>{r.summary}</p>}
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1.5">
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded" style={{ background: 'rgba(91,45,142,0.08)', color: '#5B2D8E', fontFamily: 'Sora,sans-serif' }}>{r.period}</span>
                        <span className="text-xs" style={{ color: '#A3A3A3', fontFamily: 'Poppins,sans-serif' }}>{r.year}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-sm font-semibold" style={{ color: '#16a34a', fontFamily: 'Sora,sans-serif' }}>{fmtXAF(r.total_income)}</td>
                    <td className="px-4 py-3 text-sm font-semibold" style={{ color: '#dc2626', fontFamily: 'Sora,sans-serif' }}>{fmtXAF(r.total_expenses)}</td>
                    <td className="px-4 py-3">
                      <span className="text-xs font-bold px-2.5 py-1 rounded-full" style={{ background: ss.bg, color: ss.color, fontFamily: 'Sora,sans-serif' }}>{ss.value}</span>
                    </td>
                    <td className="px-4 py-3">
                      <button onClick={() => togglePublish(r)}
                        className="text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full transition-all"
                        style={{ background: r.is_published ? 'rgba(22,163,74,0.1)' : 'rgba(115,115,115,0.1)', color: r.is_published ? '#16a34a' : '#737373', fontFamily: 'Sora,sans-serif' }}>
                        {r.is_published ? 'Live' : 'Draft'}
                      </button>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex gap-2">
                        {r.file_url && (
                          <a href={r.file_url} target="_blank" rel="noreferrer"
                            className="w-7 h-7 rounded-lg flex items-center justify-center" style={{ background: 'rgba(22,163,74,0.1)', color: '#16a34a' }}>
                            <i className="fas fa-download text-[10px]" />
                          </a>
                        )}
                        <button onClick={() => openEdit(r)} className="w-7 h-7 rounded-lg flex items-center justify-center" style={{ background: 'rgba(91,45,142,0.08)', color: '#5B2D8E' }}>
                          <i className="fas fa-edit text-[10px]" />
                        </button>
                        <button onClick={() => { if (window.confirm('Delete this report?')) delMut.mutate(r.id) }}
                          className="w-7 h-7 rounded-lg flex items-center justify-center" style={{ background: 'rgba(220,38,38,0.08)', color: '#dc2626' }}>
                          <i className="fas fa-trash text-[10px]" />
                        </button>
                      </div>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="text-center py-16 rounded-3xl" style={{ background: 'rgba(91,45,142,0.02)', border: '1px dashed rgba(91,45,142,0.1)' }}>
          <i className="fas fa-chart-bar text-4xl mb-3 block" style={{ color: 'rgba(91,45,142,0.15)' }} />
          <h4 className="font-display font-semibold mb-2" style={{ color: '#737373' }}>No financial reports yet</h4>
          <button onClick={openAdd} className="btn-secondary !text-sm !py-2 !px-5 mt-2">Add First Report</button>
        </div>
      )}

      {/* Modal */}
      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4"
          style={{ background: 'rgba(26,10,53,0.8)', backdropFilter: 'blur(8px)' }}
          onClick={e => e.target === e.currentTarget && closeForm()}>
          <div className="bg-white rounded-3xl w-full max-w-2xl max-h-[90vh] overflow-y-auto" style={{ boxShadow: '0 32px 80px rgba(26,10,53,0.25)' }}>
            <div className="px-7 pt-6 pb-4 border-b flex items-center justify-between" style={{ borderColor: 'rgba(91,45,142,0.08)' }}>
              <h3 className="font-display font-bold text-xl" style={{ color: '#1A0A35' }}>{editing ? 'Edit Report' : 'Add Financial Report'}</h3>
              <button onClick={closeForm} className="w-9 h-9 rounded-full flex items-center justify-center hover:bg-gray-100" style={{ color: '#A3A3A3' }}>
                <i className="fas fa-times" />
              </button>
            </div>
            <form onSubmit={handleSubmit(d => saveMut.mutate(d))} className="p-7 space-y-4">
              <div>
                <label className="label">Report Title *</label>
                <input {...register('title', { required: true })} className="input" placeholder="e.g. Annual Financial Report 2025" />
              </div>
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="label">Year</label>
                  <input type="number" {...register('year')} className="input" placeholder={new Date().getFullYear()} />
                </div>
                <div>
                  <label className="label">Period</label>
                  <select {...register('period')} className="input">
                    {PERIODS.map(p => <option key={p} value={p}>{p}</option>)}
                  </select>
                </div>
                <div>
                  <label className="label">File URL</label>
                  <input {...register('file_url')} className="input" placeholder="https://…" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="label">Total Income (XAF)</label>
                  <input type="number" {...register('total_income')} className="input" placeholder="0" min={0} />
                </div>
                <div>
                  <label className="label">Total Expenses (XAF)</label>
                  <input type="number" {...register('total_expenses')} className="input" placeholder="0" min={0} />
                </div>
              </div>
              <div>
                <label className="label">Summary</label>
                <textarea {...register('summary')} rows={3} className="input resize-none" placeholder="Overview of this period's finances…" />
              </div>
              <div>
                <label className="label">Highlights (comma-separated)</label>
                <input {...register('highlights')} className="input" placeholder="e.g. Road project funded, New borehole installed…" />
              </div>
              <label className="flex items-center gap-2.5 cursor-pointer">
                <input type="checkbox" {...register('is_published')} className="w-4 h-4 rounded" style={{ accentColor: '#5B2D8E' }} />
                <span className="text-sm" style={{ color: '#404040', fontFamily: 'Poppins,sans-serif' }}>Publish immediately</span>
              </label>
              <div className="flex gap-3 pt-2">
                <button type="button" onClick={closeForm}
                  className="flex-1 py-3 rounded-2xl text-sm font-semibold"
                  style={{ background: 'rgba(91,45,142,0.05)', color: '#737373', border: '1px solid rgba(91,45,142,0.1)', fontFamily: 'Sora,sans-serif' }}>Cancel</button>
                <button type="submit" disabled={saveMut.isLoading} className="btn-secondary flex-1 justify-center">
                  {saveMut.isLoading ? <><i className="fas fa-spinner animate-spin" />Saving…</> : <><i className="fas fa-save" />{editing ? 'Update' : 'Add'}</>}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
