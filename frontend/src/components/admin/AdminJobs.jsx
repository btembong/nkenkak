import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from 'react-query'
import { format } from 'date-fns'
import toast from 'react-hot-toast'
import api from '../../services/api'

const TYPE_META = {
  job:         { label: 'Job',      color: '#5B2D8E', bg: 'rgba(91,45,142,0.1)'  },
  service:     { label: 'Service',  color: '#16a34a', bg: 'rgba(22,163,74,0.1)'  },
  item_sale:   { label: 'For Sale', color: '#F0A500', bg: 'rgba(240,165,0,0.1)'  },
  item_wanted: { label: 'Wanted',   color: '#0284c7', bg: 'rgba(2,132,199,0.1)'  },
}

export default function AdminJobs() {
  const qc = useQueryClient()
  const [filter, setFilter] = useState('pending')

  const { data: posts = [], isLoading } = useQuery(
    ['admin-jobs', filter],
    () => api.get('/jobs/admin', { params: { status: filter } }).then(r => r.data)
  )

  const approveMut = useMutation(id => api.patch(`/jobs/${id}`, { status: 'approved' }), {
    onSuccess: () => { qc.invalidateQueries('admin-jobs'); toast.success('Listing approved') },
    onError: () => toast.error('Failed'),
  })

  const rejectMut = useMutation(id => api.patch(`/jobs/${id}`, { status: 'rejected' }), {
    onSuccess: () => { qc.invalidateQueries('admin-jobs'); toast.success('Listing rejected') },
    onError: () => toast.error('Failed'),
  })

  const deleteMut = useMutation(id => api.delete(`/jobs/${id}`), {
    onSuccess: () => { qc.invalidateQueries('admin-jobs'); toast.success('Deleted') },
    onError: () => toast.error('Failed'),
  })

  const featureMut = useMutation(({ id, val }) => api.patch(`/jobs/${id}`, { isFeatured: val }), {
    onSuccess: () => qc.invalidateQueries('admin-jobs'),
    onError: () => toast.error('Failed'),
  })

  return (
    <div className="space-y-6">
      <div>
        <h2 className="font-display font-bold text-2xl" style={{ color: '#1A0A35' }}>Jobs & Classifieds</h2>
        <p className="text-sm mt-0.5" style={{ color: '#737373', fontFamily: 'Poppins,sans-serif' }}>Review and manage community listings</p>
      </div>

      {/* Filter tabs */}
      <div className="flex gap-2">
        {[['pending','Pending Review'],['approved','Approved'],['rejected','Rejected'],['all','All']].map(([v,l]) => (
          <button key={v} onClick={() => setFilter(v)}
            className="text-xs font-semibold px-4 py-2 rounded-xl transition-all"
            style={{ background: filter === v ? '#5B2D8E' : 'rgba(91,45,142,0.07)', color: filter === v ? '#fff' : '#737373', fontFamily: 'Sora,sans-serif' }}>
            {l}
          </button>
        ))}
      </div>

      {isLoading ? (
        <div className="space-y-3">{[1,2,3].map(i => <div key={i} className="h-28 rounded-2xl animate-pulse" style={{ background: 'rgba(91,45,142,0.05)' }}/>)}</div>
      ) : !posts.length ? (
        <div className="text-center py-20 rounded-3xl" style={{ background: 'rgba(91,45,142,0.02)', border: '1px dashed rgba(91,45,142,0.12)' }}>
          <i className="fas fa-briefcase text-5xl mb-4 block" style={{ color: 'rgba(91,45,142,0.18)' }}/>
          <h3 className="font-display font-bold text-xl mb-2" style={{ color: '#1A0A35' }}>No {filter !== 'all' ? filter : ''} listings</h3>
        </div>
      ) : (
        <div className="space-y-3">
          {posts.map(post => {
            const meta = TYPE_META[post.type] || TYPE_META.job
            return (
              <div key={post.id} className="rounded-2xl p-5"
                style={{ background: '#fff', boxShadow: '0 2px 12px rgba(91,45,142,0.06)' }}>
                <div className="flex items-start gap-4">
                  <div className="w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0"
                    style={{ background: meta.bg }}>
                    <i className="fas fa-briefcase text-sm" style={{ color: meta.color }}/>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap mb-1">
                      <h3 className="font-display font-bold text-base" style={{ color: '#1A0A35' }}>{post.title}</h3>
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full"
                        style={{ background: meta.bg, color: meta.color }}>{meta.label}</span>
                      {post.isFeatured && (
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full"
                          style={{ background: 'rgba(240,165,0,0.12)', color: '#C87800' }}>Featured</span>
                      )}
                    </div>
                    <p className="text-xs line-clamp-2 mb-2" style={{ color: '#737373', fontFamily: 'Poppins,sans-serif' }}>{post.description}</p>
                    <div className="flex flex-wrap gap-3 text-xs" style={{ color: '#A3A3A3', fontFamily: 'Poppins,sans-serif' }}>
                      <span><i className="fas fa-user mr-1"/>{post.contactName}</span>
                      {post.location && <span><i className="fas fa-map-marker-alt mr-1"/>{post.location}, {post.country}</span>}
                      <span><i className="fas fa-clock mr-1"/>{format(new Date(post.createdAt), 'MMM d, yyyy')}</span>
                    </div>
                  </div>
                  <div className="flex flex-col gap-1.5 flex-shrink-0">
                    {post.status === 'pending' && (
                      <>
                        <button onClick={() => approveMut.mutate(post.id)}
                          className="px-3 py-1.5 rounded-xl text-xs font-semibold transition-all hover:opacity-90"
                          style={{ background: 'rgba(22,163,74,0.1)', color: '#16a34a' }}>
                          <i className="fas fa-check mr-1"/>Approve
                        </button>
                        <button onClick={() => rejectMut.mutate(post.id)}
                          className="px-3 py-1.5 rounded-xl text-xs font-semibold transition-all hover:opacity-90"
                          style={{ background: 'rgba(220,38,38,0.08)', color: '#dc2626' }}>
                          <i className="fas fa-times mr-1"/>Reject
                        </button>
                      </>
                    )}
                    <button onClick={() => featureMut.mutate({ id: post.id, val: !post.isFeatured })}
                      className="px-3 py-1.5 rounded-xl text-xs font-semibold transition-all hover:opacity-90"
                      style={{ background: post.isFeatured ? 'rgba(240,165,0,0.12)' : 'rgba(91,45,142,0.07)', color: post.isFeatured ? '#C87800' : '#737373' }}>
                      <i className={`fas fa-star mr-1`}/>{post.isFeatured ? 'Unfeature' : 'Feature'}
                    </button>
                    <button onClick={() => { if (confirm('Delete this listing?')) deleteMut.mutate(post.id) }}
                      className="px-3 py-1.5 rounded-xl text-xs font-semibold transition-all hover:opacity-90"
                      style={{ background: 'rgba(220,38,38,0.06)', color: '#dc2626' }}>
                      <i className="fas fa-trash mr-1"/>Delete
                    </button>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
