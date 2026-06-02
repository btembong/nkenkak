import { useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { useQuery } from 'react-query'
import { useOutletContext } from 'react-router-dom'
import api from '../../services/api'
import ProjectCard from '../common/ProjectCard'
import { Search, ChevronRight, Home, Sprout } from 'lucide-react'

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
    () => api.get(`/projects?${cat!=='all'?`category=${cat}&`:''}${status!=='all'?`status=${status}&`:''}limit=50`).then(r => r.data.projects),
    { staleTime:30000 }
  )
  const { data: stats } = useQuery('project-stats', () => api.get('/projects/stats/summary').then(r => r.data))

  const filtered = data?.filter(p =>
    !search || p.title.toLowerCase().includes(search.toLowerCase()) || p.summary.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <div>
      {/* Hero */}
      <div className="page-hero py-20 px-6 text-center">
        <div className="eyebrow justify-center mb-3 text-gold/90">
          <span className="w-5 h-0.5 rounded-full inline-block mr-2 bg-gold"/>
          Our Causes
        </div>
        <h1 className="font-display font-bold text-4xl text-white mb-3">Community Projects</h1>
        <div className="flex items-center justify-center gap-2 text-sm text-white/60">
          <Link to="/" className="hover:text-white transition-colors flex items-center gap-1">
            <Home className="w-3 h-3"/>Home
          </Link>
          <ChevronRight className="w-3 h-3 text-gold"/>
          <span className="text-gold">Projects</span>
        </div>
      </div>

      {/* Stats bar */}
      {stats && (
        <div className="bg-white border-b py-6" style={{ borderColor:'rgba(91,45,142,0.06)' }}>
          <div className="max-w-5xl mx-auto px-6 grid grid-cols-4 gap-6 text-center">
            {[
              { label:'Active Projects', value: stats.active },
              { label:'Completed',       value: stats.completed },
              { label:'Total Raised',    value: `${Number(stats.total_raised||0).toLocaleString()} XAF` },
              { label:'Total Donors',    value: Number(stats.total_donors||0).toLocaleString() },
            ].map(s => (
              <div key={s.label}>
                <div className="font-display font-bold text-xl text-dark">{s.value}</div>
                <div className="text-xs text-muted-foreground">{s.label}</div>
              </div>
            ))}
          </div>
        </div>
      )}

      <section className="py-16 bg-[#FAFAFA]">
        <div className="max-w-7xl mx-auto px-6">
          {/* Filters */}
          <div className="flex flex-col md:flex-row gap-4 mb-10 bg-white p-4 rounded-3xl"
            style={{ boxShadow:'0 2px 16px rgba(91,45,142,0.06)' }}>
            <div className="relative flex-1">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[#A3A3A3]"/>
              <input value={search} onChange={e => setSearch(e.target.value)}
                placeholder="Search projects…"
                className="w-full pl-11 pr-4 py-2.5 rounded-2xl text-sm outline-none bg-transparent"
                style={{ border:'1px solid rgba(91,45,142,0.1)', color:'#1A0A35' }}/>
            </div>
            <div className="flex gap-2 flex-wrap">
              {CATS.map(c => (
                <button key={c} onClick={() => setCat(c)}
                  className="px-4 py-2 rounded-full text-xs font-semibold transition-all capitalize"
                  style={{
                    background: cat===c ? 'linear-gradient(135deg,#5B2D8E,#7B4DB8)' : 'rgba(91,45,142,0.06)',
                    color: cat===c ? '#fff' : '#5B2D8E',
                  }}>
                  {c==='all' ? 'All' : c}
                </button>
              ))}
            </div>
            <select value={status} onChange={e => setStatus(e.target.value)}
              className="text-sm px-4 py-2 rounded-full border outline-none font-medium"
              style={{ borderColor:'rgba(91,45,142,0.15)', color:'#5B2D8E', background:'rgba(91,45,142,0.04)' }}>
              {STATUSES.map(s => (
                <option key={s} value={s}>
                  {s==='all' ? 'All Status' : s.charAt(0).toUpperCase()+s.slice(1)}
                </option>
              ))}
            </select>
          </div>

          <p className="text-sm mb-6 text-muted-foreground">
            {filtered?.length || 0} project{filtered?.length!==1 ? 's' : ''} found
          </p>

          {isLoading ? (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[1,2,3].map(i => (
                <div key={i} className="h-80 rounded-3xl animate-pulse" style={{ background:'rgba(91,45,142,0.04)' }}/>
              ))}
            </div>
          ) : filtered?.length ? (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filtered.map(p => <ProjectCard key={p.id} project={p} onDonate={openDonate}/>)}
            </div>
          ) : (
            <div className="text-center py-24 rounded-3xl"
              style={{ background:'rgba(91,45,142,0.03)', border:'1px dashed rgba(91,45,142,0.12)' }}>
              <Sprout className="w-12 h-12 mx-auto mb-4" style={{ color:'rgba(91,45,142,0.2)' }}/>
              <h3 className="font-display font-bold text-xl mb-2 text-dark">No projects found</h3>
              <p className="text-sm text-muted-foreground">Try adjusting your filters or search term.</p>
            </div>
          )}
        </div>
      </section>
    </div>
  )
}
