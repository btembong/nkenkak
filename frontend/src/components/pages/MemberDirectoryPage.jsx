import { useState } from 'react'
import { useQuery } from 'react-query'
import { format } from 'date-fns'
import api from '../../services/api'

function MemberCard({ member }) {
  const initials = `${member.firstName?.[0] || ''}${member.lastName?.[0] || ''}`.toUpperCase()
  return (
    <div className="rounded-2xl p-5 flex flex-col gap-3 transition-all hover:-translate-y-0.5"
      style={{background:'#fff',border:'1px solid rgba(75,0,130,0.08)',boxShadow:'0 2px 12px rgba(75,0,130,0.05)'}}>
      <div className="flex items-center gap-3">
        {member.avatarUrl
          ? <img src={member.avatarUrl} alt={member.firstName} className="w-12 h-12 rounded-full object-cover flex-shrink-0"/>
          : <div className="w-12 h-12 rounded-full flex items-center justify-center flex-shrink-0 text-white font-bold text-sm"
              style={{background:'linear-gradient(135deg,#4b0082,#a57fc0)'}}>{initials}</div>
        }
        <div className="min-w-0">
          <h3 className="font-display font-bold text-base truncate" style={{color:'#2d004e'}}>
            {member.firstName} {member.lastName}
          </h3>
          <div className="flex items-center gap-1.5 text-xs" style={{color:'#A3A3A3',fontFamily:'"Exo 2",sans-serif'}}>
            <i className="fas fa-map-marker-alt text-[10px]" style={{color:'#F0A500'}}/>
            {[member.city, member.country].filter(Boolean).join(', ') || 'Location not set'}
          </div>
        </div>
      </div>

      {member.villageQuarter && (
        <div className="flex items-center gap-1.5 text-xs" style={{color:'#4b0082',fontFamily:'"Exo 2",sans-serif'}}>
          <i className="fas fa-home text-[10px]"/>
          {member.villageQuarter}
        </div>
      )}

      {member.bio && (
        <p className="text-xs leading-relaxed line-clamp-2" style={{color:'#737373',fontFamily:'"Exo 2",sans-serif'}}>{member.bio}</p>
      )}

      <div className="flex items-center justify-between mt-auto pt-2" style={{borderTop:'1px solid rgba(75,0,130,0.06)'}}>
        {member.isDiaspora && (
          <span className="text-[10px] font-bold px-2.5 py-1 rounded-full"
            style={{background:'rgba(75,0,130,0.12)',color:'#C87800',border:'1px solid rgba(75,0,130,0.2)'}}>
            Diaspora
          </span>
        )}
        <span className="text-[10px] ml-auto" style={{color:'#C0C0C0',fontFamily:'"Exo 2",sans-serif'}}>
          Member since {format(new Date(member.createdAt), 'MMM yyyy')}
        </span>
      </div>
    </div>
  )
}

export default function MemberDirectoryPage() {
  const [search,     setSearch]     = useState('')
  const [isDiaspora, setIsDiaspora] = useState('')
  const [page,       setPage]       = useState(1)
  const [debouncedSearch, setDebouncedSearch] = useState('')

  // Simple debounce
  const handleSearch = (val) => {
    setSearch(val)
    clearTimeout(window._searchTimer)
    window._searchTimer = setTimeout(() => { setDebouncedSearch(val); setPage(1) }, 400)
  }

  const { data, isLoading } = useQuery(
    ['member-directory', debouncedSearch, isDiaspora, page],
    () => api.get('/users/directory', { params: { search: debouncedSearch || undefined, is_diaspora: isDiaspora || undefined, page, limit: 24 } }).then(r => r.data),
    { keepPreviousData: true }
  )

  const members = data?.members || []
  const totalPages = data?.pages || 1

  return (
    <div style={{background:'#F3EDF8', minHeight:'100vh'}}>
      {/* Hero */}
      <div className="relative py-20 overflow-hidden" style={{background:'linear-gradient(135deg,#2d004e,#430075)'}}>
        <div className="wave-pattern absolute inset-0 opacity-20"/>
        <div className="relative max-w-4xl mx-auto px-6 text-center">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full mb-5"
            style={{background:'rgba(75,0,130,0.15)',border:'1px solid rgba(75,0,130,0.25)'}}>
            <i className="fas fa-users text-xs" style={{color:'#F0A500'}}/>
            <span className="text-xs font-bold uppercase tracking-widest" style={{color:'#F0A500',fontFamily:'"Exo 2",sans-serif'}}>Our Community</span>
          </div>
          <h1 className="font-display font-bold text-4xl md:text-5xl text-white mb-4">
            Member <span style={{color:'#F0A500'}}>Directory</span>
          </h1>
          <p className="text-base max-w-xl mx-auto" style={{color:'rgba(255,255,255,0.65)',fontFamily:'"Exo 2",sans-serif'}}>
            Connect with fellow Nkenkak-Ngiesang community members around the world.
          </p>
          {data && (
            <div className="mt-4 text-sm font-semibold" style={{color:'rgba(75,0,130,0.8)',fontFamily:'"Exo 2",sans-serif'}}>
              {data.total} registered members
            </div>
          )}
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-10">
        {/* Filter card */}
        <div className="bg-white rounded-2xl p-5 mb-8" style={{ boxShadow: '0 1px 10px rgba(75,0,130,0.08)', border: '1px solid rgba(75,0,130,0.08)' }}>
          <div className="flex items-center justify-between pb-4 mb-4 border-b" style={{ borderColor: 'rgba(75,0,130,0.07)' }}>
            <div>
              <h2 className="font-display font-bold text-sm text-dark">Member Directory</h2>
              <p className="text-[11px] mt-0.5" style={{ color: 'rgba(75,0,130,0.45)' }}>Search and filter community members</p>
            </div>
            {data && (
              <span className="text-[11px] font-bold px-3 py-1 rounded-full flex-shrink-0"
                style={{ background: 'rgba(75,0,130,0.07)', color: '#4b0082' }}>
                {data.total} member{data.total !== 1 ? 's' : ''}
              </span>
            )}
          </div>
          <div className="flex flex-col sm:flex-row items-stretch gap-3">
            {/* Search */}
            <div className="relative flex-1">
              <i className="fas fa-search absolute left-4 top-1/2 -translate-y-1/2 text-xs" style={{color:'#A3A3A3'}}/>
              <input value={search} onChange={e => handleSearch(e.target.value)}
                placeholder="Search by name or city…"
                className="w-full pl-10 pr-4 py-3 rounded-xl text-sm outline-none"
                style={{background:'#F6F2FA',border:'1px solid rgba(75,0,130,0.07)',color:'#2d004e',fontFamily:'"Exo 2",sans-serif'}}/>
            </div>
            {/* Diaspora segment */}
            <div className="flex items-center p-1 rounded-2xl flex-shrink-0"
              style={{ background: 'rgba(75,0,130,0.06)', border: '1px solid rgba(75,0,130,0.09)' }}>
              {[
                { value: '',      label: 'All' },
                { value: 'true',  label: 'Diaspora' },
                { value: 'false', label: 'Local' },
              ].flatMap((opt, i, arr) => {
                const active = isDiaspora === opt.value
                const prevActive = i > 0 && isDiaspora === arr[i - 1].value
                const sep = i > 0 && !active && !prevActive
                  ? [<div key={`sep-${i}`} className="w-px h-4 flex-shrink-0" style={{ background: 'rgba(75,0,130,0.13)' }} />]
                  : []
                return [...sep, (
                  <button key={opt.value} onClick={() => { setIsDiaspora(opt.value); setPage(1) }}
                    className="px-3.5 py-2 rounded-xl text-xs font-semibold transition-all flex-shrink-0 whitespace-nowrap"
                    style={{
                      background: active ? 'linear-gradient(135deg,#4b0082,#a57fc0)' : 'transparent',
                      color:      active ? '#fff' : '#A3A3A3',
                      boxShadow:  active ? '0 2px 10px rgba(75,0,130,0.28)' : 'none',
                      fontFamily: 'Sora,sans-serif',
                    }}>
                    {opt.label}
                  </button>
                )]
              })}
            </div>
          </div>
        </div>

        {/* Grid */}
        {isLoading ? (
          <div className="grid sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {[...Array(12)].map((_, i) => <div key={i} className="h-44 rounded-2xl animate-pulse" style={{background:'rgba(75,0,130,0.05)'}}/>)}
          </div>
        ) : members.length ? (
          <>
            <div className="grid sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {members.map(m => <MemberCard key={m.id} member={m}/>)}
            </div>
            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex items-center justify-center gap-2 mt-10">
                <button onClick={() => setPage(p => Math.max(1, p-1))} disabled={page === 1}
                  className="w-9 h-9 rounded-xl flex items-center justify-center transition-all disabled:opacity-30"
                  style={{background:'#fff',border:'1px solid rgba(75,0,130,0.1)'}}>
                  <i className="fas fa-chevron-left text-xs" style={{color:'#4b0082'}}/>
                </button>
                {[...Array(Math.min(5, totalPages))].map((_, i) => {
                  const p = Math.max(1, Math.min(page - 2, totalPages - 4)) + i
                  return (
                    <button key={p} onClick={() => setPage(p)}
                      className="w-9 h-9 rounded-xl text-sm font-semibold transition-all"
                      style={{
                        background: p === page ? 'linear-gradient(135deg,#4b0082,#a57fc0)' : '#fff',
                        color: p === page ? '#fff' : '#4b0082',
                        border: '1px solid rgba(75,0,130,0.1)',
                        fontFamily: 'Sora,sans-serif',
                      }}>
                      {p}
                    </button>
                  )
                })}
                <button onClick={() => setPage(p => Math.min(totalPages, p+1))} disabled={page === totalPages}
                  className="w-9 h-9 rounded-xl flex items-center justify-center transition-all disabled:opacity-30"
                  style={{background:'#fff',border:'1px solid rgba(75,0,130,0.1)'}}>
                  <i className="fas fa-chevron-right text-xs" style={{color:'#4b0082'}}/>
                </button>
              </div>
            )}
          </>
        ) : (
          <div className="text-center py-20 rounded-3xl" style={{background:'rgba(75,0,130,0.02)',border:'1px dashed rgba(75,0,130,0.1)'}}>
            <i className="fas fa-users text-5xl mb-4 block" style={{color:'rgba(75,0,130,0.12)'}}/>
            <h4 className="font-display font-semibold text-lg mb-2" style={{color:'#737373'}}>No members found</h4>
            <p className="text-sm" style={{color:'#A3A3A3',fontFamily:'"Exo 2",sans-serif'}}>Try a different search term.</p>
          </div>
        )}
      </div>
    </div>
  )
}
