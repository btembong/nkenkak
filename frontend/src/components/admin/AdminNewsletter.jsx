import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from 'react-query'
import { useForm } from 'react-hook-form'
import { format } from 'date-fns'
import toast from 'react-hot-toast'
import api from '../../services/api'

export default function AdminNewsletter() {
  const qc = useQueryClient()
  const [tab, setTab] = useState('subscribers')
  const [search, setSearch] = useState('')
  const { register, handleSubmit, reset, formState: { errors } } = useForm()

  const { data: subs, isLoading } = useQuery('newsletter-subs',
    () => api.get('/newsletter/subscribers').then(r => r.data).catch(() => []))

  const sendMut = useMutation(
    data => api.post('/newsletter/send', data),
    { onSuccess: () => { toast.success('Newsletter sent successfully!'); reset() } }
  )

  const filtered = subs?.filter(s =>
    !search || s.email?.toLowerCase().includes(search.toLowerCase()) || s.name?.toLowerCase().includes(search.toLowerCase())
  )

  const active   = subs?.filter(s => s.isActive).length || 0
  const inactive = subs?.filter(s => !s.isActive).length || 0

  return (
    <div>
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl flex items-center justify-center" style={{ background: 'linear-gradient(135deg,#5B2D8E,#7B4DB8)' }}>
            <i className="fas fa-paper-plane text-sm text-white" />
          </div>
          <div>
            <h2 className="font-display font-bold text-xl" style={{ color: '#1A0A35' }}>Newsletter</h2>
            <p className="text-xs" style={{ color: '#A3A3A3', fontFamily: 'Poppins,sans-serif' }}>
              {active} active · {inactive} unsubscribed
            </p>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        {[
          { icon: 'fa-users', label: 'Total Subscribers', value: subs?.length || 0, c: '#5B2D8E', bg: 'rgba(91,45,142,0.08)' },
          { icon: 'fa-check-circle', label: 'Active', value: active, c: '#16a34a', bg: 'rgba(22,163,74,0.08)' },
          { icon: 'fa-times-circle', label: 'Unsubscribed', value: inactive, c: '#dc2626', bg: 'rgba(220,38,38,0.08)' },
        ].map(s => (
          <div key={s.label} className="stat-card">
            <div className="w-10 h-10 rounded-2xl flex items-center justify-center mb-3" style={{ background: s.bg }}>
              <i className={`fas ${s.icon} text-base`} style={{ color: s.c }} />
            </div>
            <div className="font-display font-bold text-2xl" style={{ color: '#1A0A35' }}>{s.value}</div>
            <div className="text-xs mt-0.5" style={{ color: '#A3A3A3', fontFamily: 'Poppins,sans-serif' }}>{s.label}</div>
          </div>
        ))}
      </div>

      {/* Tabs */}
      <div className="flex gap-1 mb-5 p-1 rounded-2xl w-fit" style={{ background: 'rgba(91,45,142,0.06)' }}>
        {[['subscribers', 'Subscribers'], ['compose', 'Compose Email']].map(([k, l]) => (
          <button key={k} onClick={() => setTab(k)}
            className="px-5 py-2 rounded-xl text-sm font-semibold transition-all"
            style={{
              background: tab === k ? '#fff' : 'transparent',
              color: tab === k ? '#5B2D8E' : '#A3A3A3',
              boxShadow: tab === k ? '0 1px 6px rgba(91,45,142,0.12)' : 'none',
              fontFamily: 'Sora,sans-serif',
            }}>
            {l}
          </button>
        ))}
      </div>

      {/* Subscribers list */}
      {tab === 'subscribers' && (
        <div>
          <div className="relative mb-4">
            <i className="fas fa-search absolute left-3.5 top-1/2 -translate-y-1/2 text-xs" style={{ color: '#A3A3A3' }} />
            <input value={search} onChange={e => setSearch(e.target.value)}
              placeholder="Search by name or email…" className="input !pl-10" />
          </div>
          <div className="card overflow-hidden">
            <table className="w-full">
              <thead style={{ background: 'rgba(91,45,142,0.04)' }}>
                <tr>
                  {['Name', 'Email', 'Status', 'Subscribed'].map(h => (
                    <th key={h} className="text-left px-5 py-3.5 text-xs font-bold uppercase tracking-widest"
                      style={{ color: '#5B2D8E', fontFamily: 'Sora,sans-serif' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {isLoading ? [1, 2, 3].map(i => (
                  <tr key={i}><td colSpan={4} className="px-5 py-4">
                    <div className="h-4 rounded-xl animate-pulse" style={{ background: 'rgba(91,45,142,0.05)' }} />
                  </td></tr>
                )) : filtered?.length ? filtered.map(s => (
                  <tr key={s.id} className="table-row">
                    <td className="px-5 py-3.5 font-semibold text-sm" style={{ color: '#1A0A35', fontFamily: 'Sora,sans-serif' }}>{s.name || '—'}</td>
                    <td className="px-5 py-3.5 text-sm" style={{ color: '#737373', fontFamily: 'Poppins,sans-serif' }}>{s.email}</td>
                    <td className="px-5 py-3.5">
                      <span className="text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full"
                        style={{ background: s.isActive ? 'rgba(22,163,74,0.1)' : 'rgba(220,38,38,0.1)', color: s.isActive ? '#16a34a' : '#dc2626' }}>
                        {s.isActive ? 'Active' : 'Unsubscribed'}
                      </span>
                    </td>
                    <td className="px-5 py-3.5 text-xs" style={{ color: '#A3A3A3', fontFamily: 'Poppins,sans-serif' }}>
                      {s.createdAt ? format(new Date(s.createdAt), 'MMM d, yyyy') : '—'}
                    </td>
                  </tr>
                )) : (
                  <tr><td colSpan={4} className="text-center py-12">
                    <i className="fas fa-users text-3xl mb-2 block" style={{ color: 'rgba(91,45,142,0.15)' }} />
                    <p className="text-sm" style={{ color: '#A3A3A3', fontFamily: 'Poppins,sans-serif' }}>No subscribers yet</p>
                  </td></tr>
                )}
              </tbody>
            </table>
          </div>
          {filtered?.length > 0 && (
            <div className="flex items-center justify-between mt-4 px-1">
              <p className="text-xs" style={{ color: '#A3A3A3', fontFamily: 'Poppins,sans-serif' }}>
                Showing {filtered.length} of {subs?.length} subscribers
              </p>
              <button onClick={() => {
                const csv = 'Name,Email,Status,Date\n' +
                  (subs || []).map(s => `${s.name || ''},${s.email},${s.isActive ? 'active' : 'unsubscribed'},${s.createdAt ? format(new Date(s.createdAt), 'yyyy-MM-dd') : ''}`).join('\n')
                const blob = new Blob([csv], { type: 'text/csv' })
                const a = document.createElement('a')
                a.href = URL.createObjectURL(blob)
                a.download = 'newsletter-subscribers.csv'
                a.click()
                toast.success('CSV exported!')
              }}
                className="flex items-center gap-1.5 text-xs font-semibold px-4 py-2 rounded-xl transition-all"
                style={{ color: '#5B2D8E', background: 'rgba(91,45,142,0.08)', fontFamily: 'Sora,sans-serif' }}>
                <i className="fas fa-download text-[10px]" />Export CSV
              </button>
            </div>
          )}
        </div>
      )}

      {/* Compose */}
      {tab === 'compose' && (
        <div className="max-w-2xl">
          <div className="card p-6">
            <div className="flex items-center gap-2 mb-5 p-3 rounded-2xl" style={{ background: 'rgba(240,165,0,0.06)', border: '1px solid rgba(240,165,0,0.15)' }}>
              <i className="fas fa-info-circle text-sm" style={{ color: '#F0A500' }} />
              <p className="text-xs" style={{ color: '#737373', fontFamily: 'Poppins,sans-serif' }}>
                This will send to <strong style={{ color: '#1A0A35' }}>{active} active subscribers</strong>. Configure SMTP in Settings to enable sending.
              </p>
            </div>
            <form onSubmit={handleSubmit(d => sendMut.mutate(d))} className="space-y-4">
              <div>
                <label className="label">Email Subject *</label>
                <input {...register('subject', { required: 'Subject required' })}
                  placeholder="e.g. Village Update — April 2026" className="input" />
                {errors.subject && <p className="text-xs mt-1" style={{ color: '#dc2626' }}>{errors.subject.message}</p>}
              </div>
              <div>
                <label className="label">Preview Text</label>
                <input {...register('preview')} placeholder="Short text shown in email previews…" className="input" />
              </div>
              <div>
                <label className="label">Email Body *</label>
                <textarea {...register('body', { required: 'Body required' })} rows={10}
                  className="input resize-none font-mono text-xs"
                  placeholder="<p>Hello community,</p>&#10;<p>Here are the latest updates from Nkenkak-Ngiesang…</p>" />
                {errors.body && <p className="text-xs mt-1" style={{ color: '#dc2626' }}>{errors.body.message}</p>}
              </div>
              <div>
                <label className="label">Send To</label>
                <select {...register('audience')} className="input">
                  <option value="all">All active subscribers ({active})</option>
                  <option value="diaspora">Diaspora members only</option>
                  <option value="members">Registered members only</option>
                </select>
              </div>
              <div className="flex gap-3 pt-2">
                <button type="button" onClick={() => toast('Preview feature coming soon')}
                  className="flex-1 py-3 rounded-2xl text-sm font-semibold"
                  style={{ background: 'rgba(91,45,142,0.05)', color: '#5B2D8E', border: '1px solid rgba(91,45,142,0.15)', fontFamily: 'Sora,sans-serif' }}>
                  <i className="fas fa-eye mr-1.5" />Preview
                </button>
                <button type="submit" disabled={sendMut.isLoading} className="btn-secondary flex-1 justify-center">
                  {sendMut.isLoading
                    ? <><i className="fas fa-spinner animate-spin" />Sending…</>
                    : <><i className="fas fa-paper-plane" />Send Newsletter</>}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
