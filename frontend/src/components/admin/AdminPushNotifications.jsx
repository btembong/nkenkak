import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from 'react-query'
import { format } from 'date-fns'
import toast from 'react-hot-toast'
import api from '../../services/api'

const QUICK_TEMPLATES = [
  { label: 'General Announcement', title: 'Community Announcement', body: 'An important message from the Nkenkak-Ngiesang Development Council.', url: '/notices' },
  { label: 'New Event',            title: 'New Event Coming Up!',   body: 'A new community event has been scheduled. Check the events page.',  url: '/events'  },
  { label: 'Donation Drive',       title: 'Support Our Projects',   body: 'Your contribution can make a real difference. Donate today.',        url: '/projects' },
  { label: 'Meeting Reminder',     title: 'Meeting Reminder',       body: 'Do not forget the upcoming general assembly meeting.',               url: '/events'  },
  { label: 'News Article',         title: 'New Article Published',  body: 'A new article has been published on the village news page.',         url: '/news'    },
]

const URL_SHORTCUTS = [
  { label: 'Home',        value: '/'          },
  { label: 'News',        value: '/news'       },
  { label: 'Events',      value: '/events'     },
  { label: 'Projects',    value: '/projects'   },
  { label: 'Forum',       value: '/forum'      },
  { label: 'Donate',      value: '/projects'   },
  { label: 'Portal',      value: '/portal'     },
  { label: 'Notices',     value: '/notices'    },
]

function StatCard({ icon, label, value, color = '#5B2D8E', bg = 'rgba(91,45,142,0.08)' }) {
  return (
    <div className="rounded-2xl p-5 flex items-center gap-4" style={{ background: 'white', border: '1px solid rgba(91,45,142,0.08)' }}>
      <div className="w-12 h-12 rounded-2xl flex items-center justify-center flex-shrink-0" style={{ background: bg }}>
        <i className={`fas ${icon} text-lg`} style={{ color }}/>
      </div>
      <div>
        <div className="font-display font-bold text-2xl" style={{ color: '#1A0A35' }}>{value}</div>
        <div className="text-xs" style={{ color: '#A3A3A3', fontFamily: 'Poppins,sans-serif' }}>{label}</div>
      </div>
    </div>
  )
}

function AdminSmsPanel() {
  const [msg, setMsg]       = useState('')
  const [audience, setAud]  = useState('all')
  const [result, setResult] = useState(null)

  const { data: smsStatus } = useQuery('sms-status', () => api.get('/admin/sms/status').then(r => r.data))

  const sendMut = useMutation(
    d => api.post('/admin/sms/send', d),
    {
      onSuccess: r => { setResult(r.data); setMsg(''); toast.success(`SMS sent to ${r.data.sent} number(s)`) },
      onError:   e => toast.error(e.response?.data?.error || 'SMS send failed'),
    }
  )

  return (
    <div className="rounded-2xl p-6" style={{ background: 'white', border: '1px solid rgba(91,45,142,0.08)' }}>
      <h2 className="font-display font-semibold text-base mb-2" style={{ color: '#1A0A35' }}>SMS Broadcast</h2>
      <p className="text-xs mb-5" style={{ color: '#737373', fontFamily: 'Poppins,sans-serif' }}>
        Send an SMS to members who have a phone number on file.
      </p>

      {/* Twilio status banner */}
      {smsStatus && !smsStatus.configured && (
        <div className="rounded-xl p-4 mb-5 flex items-start gap-3" style={{ background: 'rgba(220,38,38,0.06)', border: '1px solid rgba(220,38,38,0.15)' }}>
          <i className="fas fa-exclamation-circle mt-0.5" style={{ color: '#dc2626' }}/>
          <div>
            <div className="text-sm font-semibold" style={{ color: '#dc2626', fontFamily: 'Sora,sans-serif' }}>Twilio not configured</div>
            <div className="text-xs mt-0.5" style={{ color: '#7f1d1d', fontFamily: 'Poppins,sans-serif' }}>
              Add <code>TWILIO_ACCOUNT_SID</code>, <code>TWILIO_AUTH_TOKEN</code>, and <code>TWILIO_FROM_NUMBER</code> to your <code>.env</code> file.
            </div>
          </div>
        </div>
      )}
      {smsStatus?.configured && (
        <div className="rounded-xl px-4 py-2.5 mb-5 flex items-center gap-2" style={{ background: 'rgba(22,163,74,0.07)', border: '1px solid rgba(22,163,74,0.15)' }}>
          <i className="fas fa-check-circle text-sm" style={{ color: '#16a34a' }}/>
          <span className="text-xs font-medium" style={{ color: '#15803d', fontFamily: 'Poppins,sans-serif' }}>
            Twilio ready — {smsStatus.phoneCount} member{smsStatus.phoneCount !== 1 ? 's' : ''} with phone numbers
          </span>
        </div>
      )}

      {/* Audience */}
      <div className="mb-4">
        <label className="block text-xs font-bold uppercase tracking-widest mb-2" style={{ color: '#737373', fontFamily: 'Sora,sans-serif' }}>Audience</label>
        <div className="flex gap-2">
          {[['all','All Members','fa-users'],['diaspora','Diaspora Only','fa-globe'],['local','Local Only','fa-map-marker-alt']].map(([v,l,ic])=>(
            <button key={v} onClick={() => setAud(v)}
              className="flex items-center gap-1.5 text-xs font-semibold px-3 py-2 rounded-xl transition-all"
              style={{ background: audience===v ? 'rgba(91,45,142,0.12)' : 'rgba(91,45,142,0.04)', color: audience===v ? '#5B2D8E' : '#737373', border: `1px solid ${audience===v ? 'rgba(91,45,142,0.25)' : 'transparent'}` }}>
              <i className={`fas ${ic} text-[10px]`}/>{l}
            </button>
          ))}
        </div>
      </div>

      {/* Message */}
      <div className="mb-4">
        <label className="block text-xs font-bold uppercase tracking-widest mb-1.5" style={{ color: '#737373', fontFamily: 'Sora,sans-serif' }}>
          Message <span style={{ color: '#dc2626' }}>*</span>
        </label>
        <textarea value={msg} onChange={e => setMsg(e.target.value)} rows={4} maxLength={480}
          placeholder="Type your SMS message here…"
          className="input resize-none"/>
        <div className="flex justify-between text-xs mt-1" style={{ color: '#A3A3A3' }}>
          <span>{msg.length >= 160 ? `${Math.ceil(msg.length/160)} SMS credits` : '1 SMS credit'}</span>
          <span>{msg.length}/480</span>
        </div>
      </div>

      <button onClick={() => { if (msg.trim()) sendMut.mutate({ message: msg, audience }) }}
        disabled={!msg.trim() || sendMut.isLoading || !smsStatus?.configured}
        className="flex items-center gap-2 text-sm font-bold px-6 py-2.5 rounded-xl text-white transition-all"
        style={{ background: msg.trim() && smsStatus?.configured ? 'linear-gradient(135deg,#5B2D8E,#7B4DB8)' : 'rgba(91,45,142,0.2)', cursor: msg.trim() && !sendMut.isLoading && smsStatus?.configured ? 'pointer' : 'not-allowed', boxShadow: msg.trim() && smsStatus?.configured ? '0 4px 14px rgba(91,45,142,0.25)' : 'none' }}>
        {sendMut.isLoading ? <><i className="fas fa-spinner animate-spin"/>Sending…</> : <><i className="fas fa-sms"/>Send SMS</>}
      </button>

      {result && (
        <div className="mt-4 rounded-xl p-4 flex items-center gap-3" style={{ background: 'rgba(22,163,74,0.08)', border: '1px solid rgba(22,163,74,0.2)' }}>
          <i className="fas fa-check-circle text-lg" style={{ color: '#16a34a' }}/>
          <div>
            <div className="text-sm font-semibold" style={{ color: '#15803d', fontFamily: 'Sora,sans-serif' }}>
              Sent: {result.sent} &nbsp;|&nbsp; Failed: {result.failed}
            </div>
            <button onClick={() => setResult(null)} className="text-xs" style={{ color: '#86efac' }}>Dismiss</button>
          </div>
        </div>
      )}
    </div>
  )
}

export default function AdminPushNotifications() {
  const qc = useQueryClient()
  const [tab, setTab]   = useState('push')
  const [form, setForm] = useState({ title: '', body: '', url: '/', target: 'all' })
  const [preview, setPreview] = useState(false)
  const [sent, setSent] = useState(null) // { count }

  const { data: stats } = useQuery('push-stats', () => api.get('/push/stats').then(r => r.data), { refetchInterval: 30000 })

  const sendMut = useMutation(
    d => api.post('/push/send', d),
    {
      onSuccess: (res) => {
        setSent({ count: res.data.sent })
        toast.success(`Push sent to ${res.data.sent} device${res.data.sent !== 1 ? 's' : ''}!`)
        qc.invalidateQueries('push-stats')
        setForm({ title: '', body: '', url: '/', target: 'all' })
        setPreview(false)
      },
      onError: e => toast.error(e.response?.data?.error || 'Send failed'),
    }
  )

  const applyTemplate = (t) => setForm(f => ({ ...f, title: t.title, body: t.body, url: t.url }))
  const isValid = form.title.trim() && form.body.trim()

  return (
    <div className="max-w-4xl">
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center gap-3 mb-5">
          <div className="w-10 h-10 rounded-2xl flex items-center justify-center"
            style={{ background: 'linear-gradient(135deg,#5B2D8E,#7B4DB8)' }}>
            <i className="fas fa-bell text-sm text-white"/>
          </div>
          <div>
            <h1 className="font-display font-bold text-2xl" style={{ color: '#1A0A35' }}>Notifications</h1>
            <p className="text-sm" style={{ color: '#737373', fontFamily: 'Poppins,sans-serif' }}>Push alerts and SMS broadcasts to community members</p>
          </div>
        </div>
        {/* Tabs */}
        <div className="flex gap-1 p-1 rounded-2xl w-fit" style={{ background: 'rgba(91,45,142,0.06)' }}>
          {[['push','fa-bell','Push Notifications'],['sms','fa-sms','SMS Broadcast']].map(([t,ic,l])=>(
            <button key={t} onClick={() => setTab(t)}
              className="flex items-center gap-2 text-xs font-semibold px-4 py-2 rounded-xl transition-all"
              style={{ background: tab===t ? '#5B2D8E' : 'transparent', color: tab===t ? '#fff' : '#737373', fontFamily: 'Sora,sans-serif' }}>
              <i className={`fas ${ic} text-[10px]`}/>{l}
            </button>
          ))}
        </div>
      </div>

      {tab === 'sms' && <AdminSmsPanel/>}
      {tab === 'push' && <>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4 mb-8">
        <StatCard icon="fa-mobile-alt" label="Subscribed Devices"  value={stats?.total ?? '—'} />
        <StatCard icon="fa-paper-plane" label="Notifications Sent" value={stats?.history?.length ?? 0} color="#16a34a" bg="rgba(22,163,74,0.08)"/>
        <StatCard icon="fa-clock"       label="Last Sent"          value={stats?.history?.[0] ? format(new Date(stats.history[0].createdAt), 'MMM d, HH:mm') : 'Never'} color="#F0A500" bg="rgba(240,165,0,0.1)"/>
      </div>

      {stats?.total === 0 && (
        <div className="rounded-2xl p-5 mb-6 flex items-center gap-4"
          style={{ background: 'rgba(240,165,0,0.08)', border: '1px solid rgba(240,165,0,0.2)' }}>
          <i className="fas fa-exclamation-triangle text-xl" style={{ color: '#C87800' }}/>
          <div>
            <div className="font-semibold text-sm" style={{ color: '#92400e', fontFamily: 'Sora,sans-serif' }}>No subscribers yet</div>
            <div className="text-xs" style={{ color: '#92400e', fontFamily: 'Poppins,sans-serif' }}>
              Members need to log in to the portal and click <strong>"Enable Push"</strong> in the top bar to receive push notifications.
            </div>
          </div>
        </div>
      )}

      <div className="grid lg:grid-cols-5 gap-6">

        {/* Compose panel */}
        <div className="lg:col-span-3 space-y-5">
          <div className="rounded-2xl p-6" style={{ background: 'white', border: '1px solid rgba(91,45,142,0.08)' }}>
            <h2 className="font-display font-semibold text-base mb-5" style={{ color: '#1A0A35' }}>Compose Notification</h2>

            {/* Quick templates */}
            <div className="mb-5">
              <label className="block text-xs font-bold uppercase tracking-widest mb-2" style={{ color: '#A3A3A3', fontFamily: 'Sora,sans-serif' }}>Quick Templates</label>
              <div className="flex flex-wrap gap-2">
                {QUICK_TEMPLATES.map(t => (
                  <button key={t.label} onClick={() => applyTemplate(t)}
                    className="text-xs font-semibold px-3 py-1.5 rounded-xl transition-colors hover:opacity-80"
                    style={{ background: 'rgba(91,45,142,0.08)', color: '#5B2D8E' }}>
                    {t.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Title */}
            <div className="mb-4">
              <label className="block text-xs font-bold uppercase tracking-widest mb-1.5" style={{ color: '#737373', fontFamily: 'Sora,sans-serif' }}>
                Title <span style={{ color: '#dc2626' }}>*</span>
              </label>
              <input
                value={form.title}
                onChange={e => setForm(f => ({ ...f, title: e.target.value }))}
                placeholder="e.g. Community Meeting Tomorrow"
                maxLength={80}
                className="input"
              />
              <div className="text-right text-xs mt-1" style={{ color: '#A3A3A3' }}>{form.title.length}/80</div>
            </div>

            {/* Body */}
            <div className="mb-4">
              <label className="block text-xs font-bold uppercase tracking-widest mb-1.5" style={{ color: '#737373', fontFamily: 'Sora,sans-serif' }}>
                Message <span style={{ color: '#dc2626' }}>*</span>
              </label>
              <textarea
                value={form.body}
                onChange={e => setForm(f => ({ ...f, body: e.target.value }))}
                placeholder="What do you want to tell the community?"
                rows={3}
                maxLength={200}
                className="input resize-none"
              />
              <div className="text-right text-xs mt-1" style={{ color: '#A3A3A3' }}>{form.body.length}/200</div>
            </div>

            {/* URL */}
            <div className="mb-4">
              <label className="block text-xs font-bold uppercase tracking-widest mb-1.5" style={{ color: '#737373', fontFamily: 'Sora,sans-serif' }}>
                Link when tapped
              </label>
              <div className="flex gap-2">
                <input
                  value={form.url}
                  onChange={e => setForm(f => ({ ...f, url: e.target.value }))}
                  placeholder="/news/article-slug"
                  className="input flex-1"
                />
              </div>
              <div className="flex flex-wrap gap-1.5 mt-2">
                {URL_SHORTCUTS.map(s => (
                  <button key={s.value} onClick={() => setForm(f => ({ ...f, url: s.value }))}
                    className="text-[10px] font-semibold px-2 py-1 rounded-lg transition-colors"
                    style={{
                      background: form.url === s.value ? 'rgba(91,45,142,0.15)' : 'rgba(91,45,142,0.06)',
                      color: form.url === s.value ? '#5B2D8E' : '#737373',
                    }}>
                    {s.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Audience */}
            <div className="mb-6">
              <label className="block text-xs font-bold uppercase tracking-widest mb-2" style={{ color: '#737373', fontFamily: 'Sora,sans-serif' }}>
                Audience
              </label>
              <div className="flex gap-3">
                {[
                  { id: 'all',  label: 'All Subscribers', icon: 'fa-users',  desc: `${stats?.total ?? 0} devices` },
                ].map(opt => (
                  <label key={opt.id} className="flex-1 flex items-center gap-3 p-3 rounded-xl cursor-pointer transition-all"
                    style={{
                      border: `1px solid ${form.target === opt.id ? '#5B2D8E' : 'rgba(91,45,142,0.12)'}`,
                      background: form.target === opt.id ? 'rgba(91,45,142,0.06)' : 'transparent',
                    }}>
                    <input type="radio" name="target" value={opt.id}
                      checked={form.target === opt.id}
                      onChange={() => setForm(f => ({ ...f, target: opt.id }))}
                      className="accent-primary-500"/>
                    <div>
                      <div className="text-sm font-semibold" style={{ color: '#1A0A35', fontFamily: 'Sora,sans-serif' }}>
                        <i className={`fas ${opt.icon} mr-1.5`} style={{ color: '#5B2D8E' }}/>{opt.label}
                      </div>
                      <div className="text-xs" style={{ color: '#A3A3A3', fontFamily: 'Poppins,sans-serif' }}>{opt.desc}</div>
                    </div>
                  </label>
                ))}
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-center gap-3">
              <button
                onClick={() => setPreview(!preview)}
                disabled={!isValid}
                className="flex items-center gap-2 text-sm font-semibold px-5 py-2.5 rounded-xl transition-colors"
                style={{
                  background: 'rgba(91,45,142,0.08)',
                  color: '#5B2D8E',
                  opacity: isValid ? 1 : 0.4,
                  cursor: isValid ? 'pointer' : 'not-allowed',
                }}>
                <i className="fas fa-eye text-xs"/>{preview ? 'Hide Preview' : 'Preview'}
              </button>
              <button
                onClick={() => { if (isValid) sendMut.mutate(form) }}
                disabled={!isValid || sendMut.isLoading}
                className="flex items-center gap-2 text-sm font-bold px-6 py-2.5 rounded-xl text-white transition-all"
                style={{
                  background: isValid ? 'linear-gradient(135deg,#5B2D8E,#7B4DB8)' : 'rgba(91,45,142,0.2)',
                  cursor: isValid && !sendMut.isLoading ? 'pointer' : 'not-allowed',
                  boxShadow: isValid ? '0 4px 14px rgba(91,45,142,0.3)' : 'none',
                }}>
                {sendMut.isLoading
                  ? <><i className="fas fa-spinner animate-spin"/>Sending…</>
                  : <><i className="fas fa-paper-plane"/>Send Now</>}
              </button>
            </div>

            {/* Sent success banner */}
            {sent && (
              <div className="mt-4 rounded-xl p-4 flex items-center gap-3"
                style={{ background: 'rgba(22,163,74,0.08)', border: '1px solid rgba(22,163,74,0.2)' }}>
                <i className="fas fa-check-circle text-lg" style={{ color: '#16a34a' }}/>
                <div>
                  <div className="text-sm font-semibold" style={{ color: '#15803d', fontFamily: 'Sora,sans-serif' }}>
                    Delivered to {sent.count} device{sent.count !== 1 ? 's' : ''}
                  </div>
                  <button onClick={() => setSent(null)} className="text-xs" style={{ color: '#86efac' }}>Dismiss</button>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Preview + history */}
        <div className="lg:col-span-2 space-y-5">

          {/* Phone preview */}
          {preview && isValid && (
            <div>
              <div className="text-xs font-bold uppercase tracking-widest mb-2" style={{ color: '#A3A3A3', fontFamily: 'Sora,sans-serif' }}>Preview</div>
              <div className="rounded-2xl p-4" style={{ background: '#1A0A35' }}>
                {/* Status bar mock */}
                <div className="flex items-center justify-between mb-4 px-1">
                  <span className="text-[10px] text-white opacity-60">9:41</span>
                  <div className="flex gap-1">
                    {[...Array(4)].map((_, i) => (
                      <div key={i} className="rounded-full" style={{ width: 3, height: 8*(i+1)/4+4, background: 'rgba(255,255,255,0.6)' }}/>
                    ))}
                    <i className="fas fa-wifi text-[8px] text-white opacity-60 ml-1"/>
                    <i className="fas fa-battery-three-quarters text-[8px] text-white opacity-60"/>
                  </div>
                </div>
                {/* Notification card */}
                <div className="rounded-2xl p-3" style={{ background: 'rgba(255,255,255,0.12)', backdropFilter: 'blur(8px)' }}>
                  <div className="flex items-start gap-2.5">
                    <div className="w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0"
                      style={{ background: 'linear-gradient(135deg,#5B2D8E,#7B4DB8)' }}>
                      <i className="fas fa-bell text-xs text-white"/>
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-1 mb-0.5">
                        <span className="text-[10px] font-semibold text-white opacity-80 truncate">Nkenkak-Ngiesang</span>
                        <span className="text-[9px] text-white opacity-50">now</span>
                      </div>
                      <div className="text-xs font-semibold text-white leading-tight">{form.title}</div>
                      <div className="text-[11px] text-white opacity-70 mt-0.5 leading-tight line-clamp-2">{form.body}</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Send history */}
          <div className="rounded-2xl overflow-hidden" style={{ background: 'white', border: '1px solid rgba(91,45,142,0.08)' }}>
            <div className="px-5 py-4 border-b" style={{ borderColor: 'rgba(91,45,142,0.06)' }}>
              <h3 className="font-display font-semibold text-sm" style={{ color: '#1A0A35' }}>Recent Sends</h3>
            </div>
            <div className="divide-y" style={{ divideColor: 'rgba(91,45,142,0.05)' }}>
              {stats?.history?.length > 0 ? stats.history.map(h => (
                <div key={h.id} className="px-5 py-3.5">
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-semibold truncate" style={{ color: '#1A0A35', fontFamily: 'Sora,sans-serif' }}>{h.title}</div>
                      <div className="text-xs mt-0.5 line-clamp-1" style={{ color: '#737373', fontFamily: 'Poppins,sans-serif' }}>{h.body}</div>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full"
                          style={{ background: 'rgba(22,163,74,0.1)', color: '#16a34a' }}>
                          {h.recipientCount} sent
                        </span>
                        <span className="text-[10px]" style={{ color: '#A3A3A3', fontFamily: 'Poppins,sans-serif' }}>
                          {format(new Date(h.createdAt), 'MMM d, HH:mm')}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              )) : (
                <div className="px-5 py-10 text-center">
                  <i className="fas fa-paper-plane text-3xl mb-2 block" style={{ color: 'rgba(91,45,142,0.12)' }}/>
                  <p className="text-xs" style={{ color: '#A3A3A3', fontFamily: 'Poppins,sans-serif' }}>No notifications sent yet</p>
                </div>
              )}
            </div>
          </div>

        </div>
      </div>
      </>}
    </div>
  )
}
