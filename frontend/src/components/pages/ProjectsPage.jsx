import { useState } from 'react'
import { useQuery } from 'react-query'
import { useSearchParams, useOutletContext } from 'react-router-dom'
import api from '../../services/api'
import ProjectCard from '../common/ProjectCard'

const CATS = ['all','education','health','infrastructure','environment','culture','agriculture']
const STATUSES = ['all','active','upcoming','completed']

export default function ProjectsPage() {
  const { openDonate } = useOutletContext()
  const [params] = useSearchParams()
  const [cat,    setCat]    = useState(params.get('cat') || 'all')
  const [status, setStatus] = useState('all')
  const [search, setSearch] = useState('')

  const { data, isLoading } = useQuery(
    ['projects', cat, status],
    () => api.get(`/projects?${cat !== 'all' ? `category=${cat}&` : ''}${status !== 'all' ? `status=${status}&` : ''}limit=50`).then(r => r.data.projects),
    { staleTime: 30000 }
  )

  const { data: stats } = useQuery('project-stats', () => api.get('/projects/stats/summary').then(r => r.data))

  const filtered = data?.filter(p =>
    !search || p.title.toLowerCase().includes(search.toLowerCase()) || p.summary.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <div>
      {/* Hero */}
      <div className="bg-gradient-to-br from-earth via-earth-light to-[#1A3D20] py-24 relative overflow-hidden">
        <div className="absolute inset-0 bg-pattern"/>
        <div className="relative max-w-5xl mx-auto px-6 text-center">
          <div className="section-eyebrow" style={{color:'#E8C97A'}}>Making Change</div>
          <h1 className="section-title-light text-5xl mb-4">Community Projects</h1>
          <div className="divider"/>
          <p className="text-cream/60 max-w-xl mx-auto leading-relaxed">Every project is driven by the needs of our people. From clean water to digital skills — your support transforms lives.</p>
        </div>
      </div>

      {/* Stats strip */}
      {stats && (
        <div className="bg-white border-b border-black/5">
          <div className="max-w-5xl mx-auto px-6 py-6 grid grid-cols-4 gap-6">
            {[
              { label:'Active Projects',  value: stats.active },
              { label:'Completed',        value: stats.completed },
              { label:'Total Raised',     value: `${Number(stats.total_raised||0).toLocaleString()} XAF` },
              { label:'Total Donors',     value: Number(stats.total_donors||0).toLocaleString() },
            ].map(s => (
              <div key={s.label} className="text-center">
                <div className="font-cinzel text-2xl font-black text-earth">{s.value}</div>
                <div className="text-earth/40 text-xs tracking-widest uppercase mt-0.5">{s.label}</div>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="max-w-6xl mx-auto px-6 py-14">
        {/* Filters */}
        <div className="flex flex-col md:flex-row gap-4 mb-10">
          {/* Search */}
          <div className="relative flex-1 max-w-sm">
            <i className="fas fa-search absolute left-4 top-1/2 -translate-y-1/2 text-earth/30 text-sm"/>
            <input value={search} onChange={e => setSearch(e.target.value)}
              placeholder="Search projects..." className="input pl-11"/>
          </div>
          {/* Category tabs */}
          <div className="flex gap-1.5 flex-wrap">
            {CATS.map(c => (
              <button key={c} onClick={() => setCat(c)}
                className={`px-4 py-2 rounded-lg text-xs font-bold tracking-wider uppercase transition-all border ${
                  cat === c ? 'bg-earth text-gold border-earth' : 'border-earth/12 text-earth/60 hover:border-earth/30 hover:text-earth'}`}>
                {c === 'all' ? 'All' : c}
              </button>
            ))}
          </div>
          {/* Status filter */}
          <select value={status} onChange={e => setStatus(e.target.value)} className="input w-40 text-sm">
            {STATUSES.map(s => <option key={s} value={s}>{s === 'all' ? 'All Status' : s.charAt(0).toUpperCase()+s.slice(1)}</option>)}
          </select>
        </div>

        {/* Results count */}
        <div className="flex items-center justify-between mb-6">
          <p className="text-earth/40 text-sm">{filtered?.length || 0} project{filtered?.length !== 1 ? 's' : ''} found</p>
        </div>

        {/* Grid */}
        {isLoading ? (
          <div className="grid md:grid-cols-3 gap-6">
            {[1,2,3,4,5,6].map(i => <div key={i} className="h-80 rounded-xl bg-earth/5 animate-pulse"/>)}
          </div>
        ) : filtered?.length ? (
          <div className="grid md:grid-cols-3 gap-6">
            {filtered.map(p => <ProjectCard key={p.id} project={p} onDonate={() => openDonate()}/>)}
          </div>
        ) : (
          <div className="text-center py-24">
            <i className="fas fa-seedling text-earth/20 text-5xl mb-4 block"/>
            <h3 className="font-serif text-xl text-earth/50 mb-2">No projects found</h3>
            <p className="text-earth/30 text-sm">Try adjusting your filters or search term</p>
          </div>
        )}
      </div>
    </div>
  )
}
