import { useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { useQuery } from 'react-query'
import { useOutletContext } from 'react-router-dom'
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
        <div className="eyebrow justify-center mb-3" style={{color:'rgba(240,165,0,0.9)'}}>
          <span className="w-5 h-0.5 rounded-full inline-block mr-2" style={{background:'#F0A500'}}/>
          Our Causes
        </div>
        <h1 className="font-display font-bold text-4xl text-white mb-3">Community Projects</h1>
        <div className="flex items-center justify-center gap-2 text-sm" style={{color:'rgba(255,255,255,0.6)',fontFamily:'Poppins,sans-serif'}}>
          <Link to="/" className="hover:text-white transition-colors flex items-center gap-1"><i className="fas fa-home text-xs"/>Home</Link>
          <i className="fas fa-chevron-right text-xs" style={{color:'#F0A500'}}/>
          <span style={{color:'#F0A500'}}>Projects</span>
        </div>
      </div>

      {/* Stats bar */}
      {stats && (
        <div className="bg-white border-b py-6" style={{borderColor:'rgba(91,45,142,0.06)'}}>
          <div className="max-w-5xl mx-auto px-6 grid grid-cols-4 gap-6 text-center">
            {[
              {label:'Active Projects', value:stats.active},
              {label:'Completed',       value:stats.completed},
              {label:'Total Raised',    value:`${Number(stats.total_raised||0).toLocaleString()} XAF`},
              {label:'Total Donors',    value:Number(stats.total_donors||0).toLocaleString()},
            ].map(s=>(
              <div key={s.label}>
                <div className="font-display font-bold text-xl" style={{color:'#1A0A35'}}>{s.value}</div>
                <div className="text-xs" style={{color:'#737373',fontFamily:'Poppins,sans-serif'}}>{s.label}</div>
              </div>
            ))}
          </div>
        </div>
      )}

      <section className="py-16" style={{background:'#FAFAFA'}}>
        <div className="max-w-7xl mx-auto px-6">
          {/* Filters */}
          <div className="flex flex-col md:flex-row gap-4 mb-10 bg-white p-4 rounded-3xl" style={{boxShadow:'0 2px 16px rgba(91,45,142,0.06)'}}>
            <div className="relative flex-1">
              <i className="fas fa-search absolute left-4 top-1/2 -translate-y-1/2 text-sm" style={{color:'#A3A3A3'}}/>
              <input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Search projects…" className="input pl-11 border-0 bg-transparent focus:bg-white"/>
            </div>
            <div className="flex gap-2 flex-wrap">
              {CATS.map(c=>(
                <button key={c} onClick={()=>setCat(c)}
                  className="px-4 py-2 rounded-full text-xs font-semibold transition-all capitalize"
                  style={{
                    background: cat===c ? 'linear-gradient(135deg,#5B2D8E,#7B4DB8)' : 'rgba(91,45,142,0.06)',
                    color: cat===c ? '#fff' : '#5B2D8E',
                    fontFamily:'Sora,sans-serif',
                  }}>
                  {c==='all'?'All':c}
                </button>
              ))}
            </div>
            <select value={status} onChange={e=>setStatus(e.target.value)}
              className="text-sm px-4 py-2 rounded-full border outline-none font-medium"
              style={{borderColor:'rgba(91,45,142,0.15)', color:'#5B2D8E', fontFamily:'Sora,sans-serif', background:'rgba(91,45,142,0.04)'}}>
              {STATUSES.map(s=><option key={s} value={s}>{s==='all'?'All Status':s.charAt(0).toUpperCase()+s.slice(1)}</option>)}
            </select>
          </div>

          <p className="text-sm mb-6" style={{color:'#A3A3A3',fontFamily:'Poppins,sans-serif'}}>
            {filtered?.length || 0} project{filtered?.length!==1?'s':''} found
          </p>

          {isLoading ? (
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
              {[1,2,3,4].map(i=><div key={i} className="h-80 rounded-3xl animate-pulse" style={{background:'rgba(91,45,142,0.04)'}}/>)}
            </div>
          ) : filtered?.length ? (
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
              {filtered.map(p=><ProjectCard key={p.id} project={p} onDonate={openDonate}/>)}
            </div>
          ) : (
            <div className="text-center py-24 rounded-3xl" style={{background:'rgba(91,45,142,0.03)',border:'1px dashed rgba(91,45,142,0.12)'}}>
              <i className="fas fa-seedling text-5xl mb-4 block" style={{color:'rgba(91,45,142,0.2)'}}/>
              <h3 className="font-display font-bold text-xl mb-2" style={{color:'#1A0A35'}}>No projects found</h3>
              <p className="text-sm" style={{color:'#737373',fontFamily:'Poppins,sans-serif'}}>Try adjusting your filters or search term.</p>
            </div>
          )}
        </div>
      </section>
    </div>
  )
}
