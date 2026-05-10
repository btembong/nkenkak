import { useState } from 'react'
import { useQuery, useMutation } from 'react-query'
import { useForm } from 'react-hook-form'
import { format } from 'date-fns'
import { Link } from 'react-router-dom'
import toast from 'react-hot-toast'
import api from '../../services/api'
import { useAuth } from '../../context/AuthContext'

function SignModal({ petition, onClose }) {
  const { user } = useAuth()
  const { register, handleSubmit, formState: { errors } } = useForm({
    defaultValues: { name: user ? `${user.firstName} ${user.lastName}` : '', email: user?.email || '' }
  })
  const mut = useMutation(
    d => api.post(`/petitions/${petition.id}/sign`, { ...d, userId: user?.id }),
    { onSuccess: () => { toast.success('Signature submitted!'); onClose() }, onError: e => toast.error(e.response?.data?.error || 'Failed') }
  )
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: 'rgba(26,10,53,0.8)', backdropFilter: 'blur(8px)' }} onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="bg-white rounded-3xl w-full max-w-md p-7" style={{ boxShadow: '0 32px 80px rgba(26,10,53,0.25)' }}>
        <h3 className="font-display font-bold text-xl mb-1" style={{ color: '#1A0A35' }}>Sign Petition</h3>
        <p className="text-xs mb-5" style={{ color: '#A3A3A3', fontFamily: 'Poppins,sans-serif' }}>{petition.title}</p>
        <form onSubmit={handleSubmit(d => mut.mutate(d))} className="space-y-4">
          <div>
            <label className="label">Full Name *</label>
            <input {...register('name', { required: 'Required' })} className="input"/>
            {errors.name && <p className="text-xs mt-1 text-red-500">{errors.name.message}</p>}
          </div>
          <div>
            <label className="label">Email *</label>
            <input type="email" {...register('email', { required: 'Required' })} className="input"/>
            {errors.email && <p className="text-xs mt-1 text-red-500">{errors.email.message}</p>}
          </div>
          <div>
            <label className="label">Comment (optional)</label>
            <textarea {...register('comment')} rows={2} className="input resize-none" placeholder="Why you support this…"/>
          </div>
          <label className="flex items-center gap-2 text-sm cursor-pointer" style={{ fontFamily: 'Poppins,sans-serif' }}>
            <input type="checkbox" {...register('isAnon')} className="w-4 h-4 rounded accent-primary-500"/>
            Sign anonymously (name hidden from public)
          </label>
          <div className="flex gap-3 pt-1">
            <button type="button" onClick={onClose} className="flex-1 py-3 rounded-2xl text-sm font-semibold" style={{ background: 'rgba(91,45,142,0.05)', color: '#737373', border: '1px solid rgba(91,45,142,0.1)' }}>Cancel</button>
            <button type="submit" disabled={mut.isLoading} className="btn-secondary flex-1 justify-center">
              {mut.isLoading ? <><i className="fas fa-spinner animate-spin"/>Signing…</> : <><i className="fas fa-pen-nib"/>Sign Petition</>}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

function PetitionCard({ petition, onSign }) {
  const count = petition._count?.signatures || 0
  const pct   = Math.min(100, Math.round((count / petition.goal) * 100))
  const expired = petition.expiresAt && new Date(petition.expiresAt) < new Date()

  return (
    <div className="card p-6 flex flex-col gap-4 transition-all hover:-translate-y-0.5 hover:shadow-xl">
      {petition.imageUrl && <img src={petition.imageUrl} alt={petition.title} className="w-full h-36 object-cover rounded-2xl"/>}
      <div className="flex items-start justify-between gap-2">
        <h3 className="font-display font-bold text-base leading-snug" style={{ color: '#1A0A35' }}>{petition.title}</h3>
        {petition.isClosed || expired
          ? <span className="text-[10px] font-bold px-2.5 py-1 rounded-full flex-shrink-0" style={{ background: 'rgba(115,115,115,0.1)', color: '#737373' }}>Closed</span>
          : <span className="text-[10px] font-bold px-2.5 py-1 rounded-full flex-shrink-0" style={{ background: 'rgba(22,163,74,0.1)', color: '#16a34a' }}>Open</span>}
      </div>
      <p className="text-xs leading-relaxed line-clamp-3" style={{ color: '#737373', fontFamily: 'Poppins,sans-serif' }}>{petition.description}</p>

      {/* Progress */}
      <div>
        <div className="flex justify-between text-xs mb-1.5" style={{ fontFamily: 'Poppins,sans-serif' }}>
          <span className="font-bold" style={{ color: '#1A0A35' }}>{count.toLocaleString()} signatures</span>
          <span style={{ color: '#737373' }}>Goal: {petition.goal.toLocaleString()}</span>
        </div>
        <div className="h-2 rounded-full overflow-hidden" style={{ background: 'rgba(91,45,142,0.08)' }}>
          <div className="h-full rounded-full transition-all duration-700" style={{ width: `${pct}%`, background: pct >= 100 ? '#16a34a' : 'linear-gradient(90deg,#5B2D8E,#7B4DB8)' }}/>
        </div>
        <div className="text-right text-[10px] mt-1" style={{ color: '#A3A3A3', fontFamily: 'Poppins,sans-serif' }}>{pct}% of goal</div>
      </div>

      <div className="flex items-center justify-between mt-auto">
        <div className="text-[10px]" style={{ color: '#A3A3A3', fontFamily: 'Poppins,sans-serif' }}>
          {petition.expiresAt && !expired && <span><i className="fas fa-clock mr-1"/>Expires {format(new Date(petition.expiresAt), 'MMM d, yyyy')}</span>}
          {petition.author && <span className="ml-2">by {petition.author.firstName} {petition.author.lastName}</span>}
        </div>
        {!petition.isClosed && !expired && (
          <button onClick={() => onSign(petition)} className="btn-secondary !py-2 !px-4 !text-xs">
            <i className="fas fa-pen-nib text-[10px]"/>Sign
          </button>
        )}
      </div>
    </div>
  )
}

export default function PetitionsPage() {
  const [filter, setFilter] = useState('open')
  const [signing, setSigning] = useState(null)
  const { data: petitions = [], isLoading } = useQuery(['petitions', filter],
    () => api.get(`/petitions${filter === 'closed' ? '?closed=true' : filter === 'all' ? '' : '?closed=false'}`).then(r => r.data))

  return (
    <div style={{ background: '#F9F7FD', minHeight: '100vh' }}>
      <div className="relative py-20 overflow-hidden" style={{ background: 'linear-gradient(135deg,#1A0A35,#250F47)' }}>
        <div className="wave-pattern absolute inset-0 opacity-20"/>
        <div className="relative max-w-4xl mx-auto px-6 text-center">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full mb-5" style={{ background: 'rgba(240,165,0,0.15)', border: '1px solid rgba(240,165,0,0.25)' }}>
            <i className="fas fa-scroll text-xs" style={{ color: '#F0A500' }}/>
            <span className="text-xs font-bold uppercase tracking-widest" style={{ color: '#F0A500', fontFamily: 'Sora,sans-serif' }}>Community Voice</span>
          </div>
          <h1 className="font-display font-bold text-4xl md:text-5xl text-white mb-4">Community <span style={{ color: '#F0A500' }}>Petitions</span></h1>
          <p className="text-base max-w-xl mx-auto" style={{ color: 'rgba(255,255,255,0.65)', fontFamily: 'Poppins,sans-serif' }}>Sign petitions and make your voice heard in decisions that affect our community.</p>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-6 py-10">
        <div className="flex gap-2 mb-8">
          {[['open','Open'],['closed','Closed'],['all','All']].map(([v,l]) => (
            <button key={v} onClick={() => setFilter(v)}
              className="text-xs font-semibold px-4 py-2 rounded-xl transition-all"
              style={{ background: filter === v ? '#5B2D8E' : 'rgba(91,45,142,0.07)', color: filter === v ? '#fff' : '#737373', fontFamily: 'Sora,sans-serif' }}>
              {l}
            </button>
          ))}
        </div>

        {isLoading ? (
          <div className="grid md:grid-cols-2 gap-6">{[1,2,3,4].map(i => <div key={i} className="h-64 rounded-3xl animate-pulse" style={{ background: 'rgba(91,45,142,0.05)' }}/>)}</div>
        ) : !petitions.length ? (
          <div className="text-center py-20 rounded-3xl" style={{ background: 'rgba(91,45,142,0.02)', border: '1px dashed rgba(91,45,142,0.12)' }}>
            <i className="fas fa-scroll text-5xl mb-4 block" style={{ color: 'rgba(91,45,142,0.18)' }}/>
            <h3 className="font-display font-bold text-xl mb-2" style={{ color: '#1A0A35' }}>No petitions yet</h3>
            <p className="text-sm" style={{ color: '#737373', fontFamily: 'Poppins,sans-serif' }}>Petitions created by community leaders will appear here.</p>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 gap-6">
            {petitions.map(p => <PetitionCard key={p.id} petition={p} onSign={setSigning}/>)}
          </div>
        )}
      </div>
      {signing && <SignModal petition={signing} onClose={() => setSigning(null)}/>}
    </div>
  )
}
