import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from 'react-query'
import { useForm } from 'react-hook-form'
import { format } from 'date-fns'
import toast from 'react-hot-toast'
import api from '../../services/api'

const STATUS_META = {
  draft:     { label: 'Draft',     color: '#737373', bg: 'rgba(115,115,115,0.1)' },
  scheduled: { label: 'Scheduled', color: '#0284c7', bg: 'rgba(2,132,199,0.1)'   },
  sent:      { label: 'Sent',      color: '#16a34a', bg: 'rgba(22,163,74,0.1)'   },
}

function CampaignForm({ campaign, onClose }) {
  const qc = useQueryClient()
  const isEdit = !!campaign
  const { register, handleSubmit, watch, formState: { errors } } = useForm({
    defaultValues: campaign ? {
      ...campaign,
      scheduledAt: campaign.scheduledAt ? new Date(campaign.scheduledAt).toISOString().slice(0,16) : '',
    } : { status: 'draft', audience: 'all' }
  })
  const status = watch('status')

  const mut = useMutation(
    d => isEdit ? api.patch(`/campaigns/${campaign.id}`, d) : api.post('/campaigns', d),
    {
      onSuccess: () => {
        qc.invalidateQueries('campaigns')
        toast.success(isEdit ? 'Campaign updated!' : 'Campaign created!')
        onClose()
      },
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
              {isEdit ? 'Edit Campaign' : 'New Email Campaign'}
            </h3>
            <button onClick={onClose} className="w-9 h-9 rounded-full flex items-center justify-center hover:bg-gray-100"
              style={{ color: '#A3A3A3' }}>
              <i className="fas fa-times"/>
            </button>
          </div>
        </div>
        <form onSubmit={handleSubmit(d => mut.mutate(d))} className="p-7 space-y-5">
          <div>
            <label className="label">Campaign Name *</label>
            <input {...register('name', { required: 'Required' })} className="input" placeholder="e.g. Monthly Newsletter — June 2025"/>
            {errors.name && <p className="text-xs mt-1 text-red-500">{errors.name.message}</p>}
          </div>
          <div>
            <label className="label">Subject Line *</label>
            <input {...register('subject', { required: 'Required' })} className="input" placeholder="e.g. Village Update — June 2025"/>
            {errors.subject && <p className="text-xs mt-1 text-red-500">{errors.subject.message}</p>}
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="label">Status</label>
              <select {...register('status')} className="input">
                <option value="draft">Draft</option>
                <option value="scheduled">Scheduled</option>
              </select>
            </div>
            <div>
              <label className="label">Audience</label>
              <select {...register('audience')} className="input">
                <option value="all">All Subscribers</option>
                <option value="diaspora">Diaspora Members</option>
                <option value="local">Local Members</option>
              </select>
            </div>
          </div>
          {status === 'scheduled' && (
            <div>
              <label className="label">Schedule Date & Time *</label>
              <input type="datetime-local" {...register('scheduledAt', { required: status === 'scheduled' ? 'Required for scheduled campaigns' : false })}
                className="input"/>
              {errors.scheduledAt && <p className="text-xs mt-1 text-red-500">{errors.scheduledAt.message}</p>}
            </div>
          )}
          <div>
            <label className="label">Email Body (HTML supported) *</label>
            <textarea {...register('body', { required: 'Required' })} rows={12} className="input resize-none font-mono text-xs"
              placeholder="<h2>Dear Community Member,</h2><p>Here are this month's updates…</p>"/>
            {errors.body && <p className="text-xs mt-1 text-red-500">{errors.body.message}</p>}
          </div>
          <div className="flex gap-3 pt-2">
            <button type="button" onClick={onClose}
              className="flex-1 py-3 rounded-2xl text-sm font-semibold"
              style={{ background: 'rgba(91,45,142,0.05)', color: '#737373', border: '1px solid rgba(91,45,142,0.1)' }}>
              Cancel
            </button>
            <button type="submit" disabled={mut.isLoading} className="btn-secondary flex-1 justify-center">
              {mut.isLoading ? <><i className="fas fa-spinner animate-spin"/>Saving…</> : <><i className="fas fa-save"/>Save Campaign</>}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

function SendConfirmModal({ campaign, onClose }) {
  const qc = useQueryClient()
  const mut = useMutation(() => api.post(`/campaigns/${campaign.id}/send`), {
    onSuccess: (res) => {
      qc.invalidateQueries('campaigns')
      toast.success('Campaign is sending in the background — check status shortly.')
      onClose()
    },
    onError: e => toast.error(e.response?.data?.error || 'Failed to send'),
  })

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: 'rgba(26,10,53,0.8)', backdropFilter: 'blur(8px)' }}
      onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="bg-white rounded-3xl w-full max-w-md p-7 text-center"
        style={{ boxShadow: '0 32px 80px rgba(26,10,53,0.25)' }}>
        <div className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-5"
          style={{ background: 'rgba(240,165,0,0.1)' }}>
          <i className="fas fa-paper-plane text-2xl" style={{ color: '#F0A500' }}/>
        </div>
        <h3 className="font-display font-bold text-xl mb-2" style={{ color: '#1A0A35' }}>Send Campaign Now?</h3>
        <p className="text-sm mb-2" style={{ color: '#737373', fontFamily: 'Poppins,sans-serif' }}>
          This will immediately send <strong style={{ color: '#1A0A35' }}>{campaign.name}</strong> to all newsletter subscribers.
        </p>
        <p className="text-xs mb-6" style={{ color: '#A3A3A3', fontFamily: 'Poppins,sans-serif' }}>
          This action cannot be undone.
        </p>
        <div className="flex gap-3">
          <button onClick={onClose}
            className="flex-1 py-3 rounded-2xl text-sm font-semibold"
            style={{ background: 'rgba(91,45,142,0.05)', color: '#737373', border: '1px solid rgba(91,45,142,0.1)' }}>
            Cancel
          </button>
          <button onClick={() => mut.mutate()} disabled={mut.isLoading}
            className="flex-1 py-3 rounded-2xl text-sm font-bold text-white transition-all hover:opacity-90"
            style={{ background: 'linear-gradient(135deg,#F0A500,#FFB84D)' }}>
            {mut.isLoading ? <><i className="fas fa-spinner animate-spin mr-2"/>Sending…</> : <><i className="fas fa-paper-plane mr-2"/>Send Now</>}
          </button>
        </div>
      </div>
    </div>
  )
}

export default function AdminEmailCampaigns() {
  const qc = useQueryClient()
  const [showForm, setShowForm]       = useState(false)
  const [editing, setEditing]         = useState(null)
  const [sending, setSending]         = useState(null)
  const [statusFilter, setStatusFilter] = useState('')

  const { data: campaigns = [], isLoading } = useQuery(
    ['campaigns', statusFilter],
    () => api.get('/campaigns', { params: statusFilter ? { status: statusFilter } : {} }).then(r => r.data)
  )

  const deleteMut = useMutation(id => api.delete(`/campaigns/${id}`), {
    onSuccess: () => { qc.invalidateQueries('campaigns'); toast.success('Campaign deleted') },
    onError: () => toast.error('Failed to delete'),
  })

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="font-display font-bold text-2xl" style={{ color: '#1A0A35' }}>Email Campaigns</h2>
          <p className="text-sm mt-0.5" style={{ color: '#737373', fontFamily: 'Poppins,sans-serif' }}>
            Create and send email campaigns to newsletter subscribers
          </p>
        </div>
        <button onClick={() => { setEditing(null); setShowForm(true) }} className="btn-secondary">
          <i className="fas fa-plus"/>New Campaign
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        {[
          { label: 'Total', value: campaigns.length, icon: 'fa-envelope', color: '#5B2D8E', bg: 'rgba(91,45,142,0.1)' },
          { label: 'Sent', value: campaigns.filter(c => c.status === 'sent').length, icon: 'fa-check-circle', color: '#16a34a', bg: 'rgba(22,163,74,0.1)' },
          { label: 'Scheduled', value: campaigns.filter(c => c.status === 'scheduled').length, icon: 'fa-clock', color: '#0284c7', bg: 'rgba(2,132,199,0.1)' },
        ].map(s => (
          <div key={s.label} className="rounded-2xl p-5 flex items-center gap-4"
            style={{ background: '#fff', boxShadow: '0 2px 12px rgba(91,45,142,0.06)' }}>
            <div className="w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0"
              style={{ background: s.bg }}>
              <i className={`fas ${s.icon} text-base`} style={{ color: s.color }}/>
            </div>
            <div>
              <div className="font-display font-bold text-2xl" style={{ color: '#1A0A35' }}>{s.value}</div>
              <div className="text-xs" style={{ color: '#A3A3A3', fontFamily: 'Poppins,sans-serif' }}>{s.label}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Filter */}
      <div className="flex gap-2">
        {[['', 'All'], ['draft', 'Draft'], ['scheduled', 'Scheduled'], ['sent', 'Sent']].map(([v, l]) => (
          <button key={v} onClick={() => setStatusFilter(v)}
            className="text-xs font-semibold px-4 py-2 rounded-xl transition-all"
            style={{ background: statusFilter === v ? '#5B2D8E' : 'rgba(91,45,142,0.07)', color: statusFilter === v ? '#fff' : '#737373', fontFamily: 'Sora,sans-serif' }}>
            {l}
          </button>
        ))}
      </div>

      {/* List */}
      {isLoading ? (
        <div className="space-y-3">{[1,2,3].map(i => <div key={i} className="h-24 rounded-2xl animate-pulse" style={{ background: 'rgba(91,45,142,0.05)' }}/>)}</div>
      ) : !campaigns.length ? (
        <div className="text-center py-20 rounded-3xl"
          style={{ background: 'rgba(91,45,142,0.02)', border: '1px dashed rgba(91,45,142,0.12)' }}>
          <i className="fas fa-envelope text-5xl mb-4 block" style={{ color: 'rgba(91,45,142,0.18)' }}/>
          <h3 className="font-display font-bold text-xl mb-2" style={{ color: '#1A0A35' }}>No campaigns yet</h3>
          <button onClick={() => setShowForm(true)} className="btn-secondary mt-4 !text-sm">Create your first campaign</button>
        </div>
      ) : (
        <div className="rounded-3xl overflow-hidden" style={{ background: '#fff', boxShadow: '0 2px 16px rgba(91,45,142,0.06)' }}>
          <table className="w-full text-sm">
            <thead style={{ background: 'rgba(91,45,142,0.04)' }}>
              <tr>
                {['Campaign', 'Subject', 'Audience', 'Status', 'Scheduled / Sent', 'Actions'].map(h => (
                  <th key={h} className="text-left px-5 py-3 text-xs font-bold uppercase tracking-widest"
                    style={{ color: '#5B2D8E', fontFamily: 'Sora,sans-serif' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {campaigns.map((c, i) => {
                const meta = STATUS_META[c.status] || STATUS_META.draft
                return (
                  <tr key={c.id} style={{ background: i % 2 === 0 ? 'transparent' : 'rgba(91,45,142,0.015)' }}>
                    <td className="px-5 py-4">
                      <div className="font-semibold text-sm" style={{ color: '#1A0A35' }}>{c.name}</div>
                      <div className="text-xs mt-0.5" style={{ color: '#A3A3A3', fontFamily: 'Poppins,sans-serif' }}>
                        Created {format(new Date(c.createdAt), 'MMM d, yyyy')}
                      </div>
                    </td>
                    <td className="px-5 py-4 max-w-[200px]">
                      <div className="truncate text-xs" style={{ color: '#737373', fontFamily: 'Poppins,sans-serif' }}>{c.subject}</div>
                    </td>
                    <td className="px-5 py-4">
                      <span className="text-xs capitalize" style={{ color: '#5B2D8E', fontFamily: 'Poppins,sans-serif' }}>{c.audience || 'all'}</span>
                    </td>
                    <td className="px-5 py-4">
                      <span className="text-xs font-bold px-2.5 py-1 rounded-full"
                        style={{ background: meta.bg, color: meta.color }}>
                        {meta.label}
                      </span>
                    </td>
                    <td className="px-5 py-4 text-xs" style={{ color: '#737373', fontFamily: 'Poppins,sans-serif' }}>
                      {c.sentAt
                        ? <span style={{ color: '#16a34a' }}><i className="fas fa-check mr-1"/>{format(new Date(c.sentAt), 'MMM d, yyyy HH:mm')}</span>
                        : c.scheduledAt
                          ? format(new Date(c.scheduledAt), 'MMM d, yyyy HH:mm')
                          : '—'}
                      {c.recipientCount > 0 && (
                        <div className="text-[10px] mt-0.5" style={{ color: '#A3A3A3' }}>
                          {c.recipientCount} recipients
                        </div>
                      )}
                    </td>
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-1">
                        {c.status !== 'sent' && (
                          <>
                            <button onClick={() => { setEditing(c); setShowForm(true) }}
                              className="w-8 h-8 rounded-xl flex items-center justify-center transition-all hover:scale-105"
                              style={{ background: 'rgba(91,45,142,0.08)', color: '#5B2D8E' }}
                              title="Edit">
                              <i className="fas fa-edit text-xs"/>
                            </button>
                            <button onClick={() => setSending(c)}
                              className="w-8 h-8 rounded-xl flex items-center justify-center transition-all hover:scale-105"
                              style={{ background: 'rgba(240,165,0,0.1)', color: '#C87800' }}
                              title="Send Now">
                              <i className="fas fa-paper-plane text-xs"/>
                            </button>
                          </>
                        )}
                        <button onClick={() => { if (confirm('Delete this campaign?')) deleteMut.mutate(c.id) }}
                          className="w-8 h-8 rounded-xl flex items-center justify-center transition-all hover:scale-105"
                          style={{ background: 'rgba(220,38,38,0.08)', color: '#dc2626' }}
                          title="Delete">
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

      {showForm && <CampaignForm campaign={editing} onClose={() => { setShowForm(false); setEditing(null) }}/>}
      {sending  && <SendConfirmModal campaign={sending} onClose={() => setSending(null)}/>}
    </div>
  )
}
