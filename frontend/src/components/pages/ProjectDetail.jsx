import { useState } from 'react'
import { useParams, Link, useOutletContext } from 'react-router-dom'
import { useQuery, useMutation, useQueryClient } from 'react-query'
import { format } from 'date-fns'
import toast from 'react-hot-toast'
import api from '../../services/api'
import DonationModal from '../common/DonationModal'
import { useAuth } from '../../context/AuthContext'

const STATUS_COLORS = { active:'badge-active', upcoming:'badge-upcoming', completed:'badge-complete', paused:'badge-paused' }

export default function ProjectDetail() {
  const { slug } = useParams()
  const { user } = useAuth()
  const [donateOpen, setDonateOpen] = useState(false)
  const qc = useQueryClient()

  const { data: project, isLoading, error } = useQuery(
    ['project', slug],
    () => api.get(`/projects/${slug}`).then(r => r.data)
  )

  const { data: poll } = useQuery(
    ['project-poll', project?.id],
    () => api.get('/polls').then(r => r.data.find(p => p.project_id === project?.id)),
    { enabled: !!project?.id }
  )

  const voteMut = useMutation(
    ({ pollId, vote }) => api.post(`/polls/${pollId}/vote`, { vote }),
    { onSuccess: () => { toast.success('Vote recorded!'); qc.invalidateQueries(['project-poll', project?.id]) },
      onError: () => toast.error('Already voted on this poll') }
  )

  if (isLoading) return (
    <div className="max-w-4xl mx-auto px-6 py-20 space-y-6">
      {[1,2,3].map(i => <div key={i} className="h-16 bg-earth/5 rounded-xl animate-pulse"/>)}
    </div>
  )
  if (error || !project) return (
    <div className="text-center py-32"><i className="fas fa-exclamation-circle text-earth/20 text-5xl mb-4 block"/><h3 className="font-serif text-2xl text-earth/40">Project not found</h3><Link to="/projects" className="text-gold hover:underline mt-4 block">← Back to Projects</Link></div>
  )

  const pct = project.goal_amount > 0 ? Math.min(100, Math.round((project.raised_amount / project.goal_amount) * 100)) : 0

  return (
    <div>
      {/* Hero */}
      <div className="relative h-80 bg-gradient-to-br from-forest to-earth overflow-hidden">
        {project.cover_image && <img src={project.cover_image} alt={project.title} className="w-full h-full object-cover opacity-40"/>}
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent"/>
        <div className="absolute inset-0 flex items-end">
          <div className="max-w-4xl mx-auto px-6 pb-10 w-full">
            <Link to="/projects" className="text-cream/60 text-sm hover:text-gold flex items-center gap-2 mb-4 transition-colors">
              <i className="fas fa-arrow-left text-xs"/> All Projects
            </Link>
            <div className="flex items-center gap-3 mb-3">
              <span className={STATUS_COLORS[project.status]}>{project.status}</span>
              <span className="text-gold-light text-xs font-bold tracking-widest uppercase">{project.category}</span>
              {project.is_urgent && <span className="badge-paused animate-pulse">Urgent</span>}
            </div>
            <h1 className="font-serif text-4xl text-white text-shadow-lg">{project.title}</h1>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-6 py-12">
        <div className="grid md:grid-cols-3 gap-8">
          {/* Main content */}
          <div className="md:col-span-2 space-y-8">
            {/* Summary */}
            <div className="bg-white rounded-xl p-6 border border-black/5">
              <h2 className="font-serif text-xl text-earth mb-4">About This Project</h2>
              <div className="text-earth/70 leading-relaxed whitespace-pre-line">{project.description}</div>
              {project.location && (
                <div className="flex items-center gap-2 mt-4 text-earth/40 text-sm">
                  <i className="fas fa-map-marker-alt text-gold"/> {project.location}
                </div>
              )}
            </div>

            {/* Updates timeline */}
            {project.updates?.length > 0 && (
              <div className="bg-white rounded-xl p-6 border border-black/5">
                <h2 className="font-serif text-xl text-earth mb-6">Project Updates</h2>
                <div className="space-y-6">
                  {project.updates.map((u, i) => (
                    <div key={u.id} className="flex gap-4">
                      <div className="flex flex-col items-center">
                        <div className="w-9 h-9 rounded-full bg-gold/15 border-2 border-gold/30 flex items-center justify-center text-gold text-xs font-bold flex-shrink-0">{i+1}</div>
                        {i < project.updates.length - 1 && <div className="w-0.5 flex-1 bg-earth/8 mt-2"/>}
                      </div>
                      <div className="flex-1 pb-6">
                        <div className="flex items-start justify-between mb-2">
                          <h4 className="font-semibold text-earth">{u.title}</h4>
                          <span className="text-earth/30 text-xs">{format(new Date(u.created_at), 'MMM d, yyyy')}</span>
                        </div>
                        <p className="text-earth/60 text-sm leading-relaxed">{u.content}</p>
                        {u.author_name && <div className="text-earth/30 text-xs mt-2">— {u.author_name}</div>}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Community Poll */}
            {poll && (
              <div className="bg-gradient-to-br from-earth to-earth-light rounded-xl p-6 text-cream">
                <h2 className="font-serif text-xl text-cream mb-2 flex items-center gap-2"><i className="fas fa-vote-yea text-gold"/> Community Poll</h2>
                <p className="text-cream/60 text-sm mb-5">{poll.title}</p>
                <div className="flex gap-3">
                  {['approve','reject','abstain'].map(v => (
                    <button key={v} onClick={() => user ? voteMut.mutate({pollId:poll.id, vote:v}) : toast.error('Login to vote')}
                      className={`flex-1 py-3 rounded-lg border text-xs font-bold uppercase tracking-wider transition-all capitalize ${
                        v==='approve' ? 'border-green-500/30 text-green-400 hover:bg-green-900/20' :
                        v==='reject'  ? 'border-red-500/30 text-red-400 hover:bg-red-900/20' :
                        'border-white/10 text-cream/50 hover:bg-white/5'}`}>
                      <i className={`fas ${v==='approve'?'fa-thumbs-up':v==='reject'?'fa-thumbs-down':'fa-minus'} mr-1.5`}/>
                      {v}
                    </button>
                  ))}
                </div>
                <p className="text-cream/30 text-xs mt-3 flex items-center gap-1.5"><i className="fas fa-users"/> {poll.vote_count || 0} votes cast</p>
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-5">
            {/* Funding card */}
            <div className="bg-white rounded-xl p-5 border border-black/5 sticky top-24">
              <div className="text-center mb-4">
                <div className="font-cinzel text-3xl text-gold font-black">{pct}%</div>
                <div className="text-earth/40 text-xs tracking-widest uppercase">Funded</div>
              </div>
              <div className="h-2 rounded-full bg-earth/8 mb-4">
                <div className="project-progress h-full rounded-full" style={{width:`${pct}%`}}/>
              </div>
              <div className="grid grid-cols-2 gap-3 text-center mb-5 text-sm">
                <div className="bg-cream-light rounded-lg p-3">
                  <div className="font-bold text-earth">{Number(project.raised_amount).toLocaleString()}</div>
                  <div className="text-earth/40 text-xs">XAF raised</div>
                </div>
                <div className="bg-cream-light rounded-lg p-3">
                  <div className="font-bold text-earth">{Number(project.goal_amount).toLocaleString()}</div>
                  <div className="text-earth/40 text-xs">XAF goal</div>
                </div>
              </div>
              {project.donor_count > 0 && (
                <div className="flex items-center gap-2 text-earth/50 text-xs mb-4 justify-center">
                  <i className="fas fa-users text-gold"/> {project.donor_count} donor{project.donor_count !== 1 ? 's' : ''}
                </div>
              )}
              {project.beneficiaries > 0 && (
                <div className="flex items-center gap-2 text-earth/50 text-xs mb-5 justify-center">
                  <i className="fas fa-heart text-gold"/> {project.beneficiaries.toLocaleString()} beneficiaries
                </div>
              )}
              {project.status !== 'completed' && (
                <button onClick={() => setDonateOpen(true)} className="btn-gold w-full justify-center text-sm">
                  <i className="fas fa-heart"/> Donate to This Project
                </button>
              )}
              {project.status === 'completed' && (
                <div className="text-center py-3 text-green-500 font-bold text-sm flex items-center justify-center gap-2">
                  <i className="fas fa-check-circle"/> Project Completed!
                </div>
              )}

              {/* Share */}
              <div className="mt-4 pt-4 border-t border-black/5">
                <p className="text-earth/40 text-xs text-center mb-3">Share this project</p>
                <div className="flex justify-center gap-2">
                  {[['fab fa-facebook-f','#1877F2'],['fab fa-twitter','#1DA1F2'],['fab fa-whatsapp','#25D366']].map(([icon, color]) => (
                    <a key={icon} href="#" className="w-8 h-8 rounded-full bg-earth/6 flex items-center justify-center text-earth/40 hover:text-earth text-sm transition-all hover:scale-110">
                      <i className={icon}/>
                    </a>
                  ))}
                </div>
              </div>
            </div>

            {/* Dates */}
            {(project.start_date || project.end_date) && (
              <div className="bg-white rounded-xl p-5 border border-black/5">
                <h3 className="font-semibold text-earth text-sm mb-3">Timeline</h3>
                {project.start_date && <div className="flex items-center gap-2 text-sm text-earth/60 mb-2"><i className="fas fa-play text-gold text-xs w-4"/> Start: {format(new Date(project.start_date), 'MMM d, yyyy')}</div>}
                {project.end_date && <div className="flex items-center gap-2 text-sm text-earth/60"><i className="fas fa-flag text-gold text-xs w-4"/> Target: {format(new Date(project.end_date), 'MMM d, yyyy')}</div>}
              </div>
            )}
          </div>
        </div>
      </div>

      {donateOpen && <DonationModal onClose={() => setDonateOpen(false)} defaultProject={project.id}/>}
    </div>
  )
}
