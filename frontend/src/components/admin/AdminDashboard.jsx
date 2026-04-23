import { useQuery } from 'react-query'
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts'
import api from '../../services/api'
import { format } from 'date-fns'

const DONUT_COLORS = ['#C9A84C','#2D5016','#1A3A5C','#8B1A1A']

function StatTile({ icon, label, value, sub, color='text-gold' }) {
  return (
    <div className="stat-card">
      <div className="flex items-center justify-between mb-4">
        <div className={`w-11 h-11 rounded-xl bg-earth/6 flex items-center justify-center ${color} text-xl`}><i className={`fas ${icon}`}/></div>
        {sub && <span className="text-xs text-green-500 font-semibold bg-green-50 px-2 py-0.5 rounded-full">{sub}</span>}
      </div>
      <div className="font-cinzel text-3xl text-earth font-black">{value}</div>
      <div className="text-earth/50 text-xs tracking-widest uppercase mt-1">{label}</div>
    </div>
  )
}

export default function AdminDashboard() {
  const { data, isLoading } = useQuery('admin-dashboard', () => api.get('/admin/dashboard').then(r => r.data))

  if (isLoading) return (
    <div className="p-8 space-y-6">
      <div className="h-8 w-64 bg-earth/8 rounded-lg animate-pulse"/>
      <div className="grid grid-cols-4 gap-4">{[1,2,3,4].map(i => <div key={i} className="h-32 bg-earth/5 rounded-xl animate-pulse"/>)}</div>
    </div>
  )

  const d = data || {}
  const projectPieData = [
    { name:'Active',    value: +d.projects?.active    || 0 },
    { name:'Completed', value: +d.projects?.completed || 0 },
    { name:'Upcoming',  value: (+d.projects?.total - +d.projects?.active - +d.projects?.completed) || 0 },
  ]

  return (
    <div className="p-8 space-y-8">
      {/* Header */}
      <div>
        <h1 className="font-serif text-3xl text-cream">Admin Dashboard</h1>
        <p className="text-cream/40 text-sm mt-1">{format(new Date(),'EEEE, MMMM d yyyy')}</p>
      </div>

      {/* Top stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatTile icon="fa-users"     label="Total Members"    value={(+d.users?.total||0).toLocaleString()}         sub={`+${d.users?.new_this_month||0} this month`}/>
        <StatTile icon="fa-seedling"  label="Active Projects"  value={d.projects?.active||0}  color="text-green-500"/>
        <StatTile icon="fa-heart"     label="Total Raised"     value={`${(+d.donations?.total||0).toLocaleString()} XAF`} color="text-rose-400"/>
        <StatTile icon="fa-comments"  label="Forum Threads"    value={(+d.forum?.threads||0).toLocaleString()} color="text-blue-400"/>
      </div>

      {/* Second row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatTile icon="fa-globe"      label="Diaspora Members" value={d.users?.diaspora||0}/>
        <StatTile icon="fa-calendar"   label="Upcoming Events"  value={d.events?.upcoming||0} color="text-purple-400"/>
        <StatTile icon="fa-newspaper"  label="Published News"   value={d.news?.published||0}  color="text-orange-400"/>
        <StatTile icon="fa-clock"      label="Pending Donations" value={d.donations?.pending||0} color="text-yellow-400"/>
      </div>

      {/* Charts row */}
      <div className="grid md:grid-cols-3 gap-6">
        {/* Project breakdown */}
        <div className="stat-card">
          <h3 className="font-serif text-earth text-lg mb-4">Project Status</h3>
          <div className="h-48">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={projectPieData} cx="50%" cy="50%" innerRadius={50} outerRadius={75} paddingAngle={3} dataKey="value">
                  {projectPieData.map((_, i) => <Cell key={i} fill={DONUT_COLORS[i]}/>)}
                </Pie>
                <Tooltip formatter={(v, n) => [v, n]}/>
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="flex flex-wrap gap-3 mt-2">
            {projectPieData.map((p, i) => (
              <div key={p.name} className="flex items-center gap-1.5 text-xs text-earth/60">
                <div className="w-2.5 h-2.5 rounded-full" style={{background: DONUT_COLORS[i]}}/>
                {p.name}: <strong>{p.value}</strong>
              </div>
            ))}
          </div>
        </div>

        {/* Recent donations */}
        <div className="stat-card md:col-span-2">
          <h3 className="font-serif text-earth text-lg mb-4">Recent Donations</h3>
          <div className="space-y-2 overflow-y-auto max-h-64">
            {d.recent_donations?.map(don => (
              <div key={don.reference} className="flex items-center justify-between py-2 border-b border-black/5 last:border-0">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-gold/10 flex items-center justify-center text-gold text-xs font-bold">
                    {don.donor?.[0]?.toUpperCase()}
                  </div>
                  <div>
                    <div className="text-xs font-semibold text-earth">{don.donor || 'Anonymous'}</div>
                    <div className="text-[10px] text-earth/40">{don.project || 'General Fund'}</div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-sm font-bold text-earth">{Number(don.amount).toLocaleString()} <span className="text-xs text-earth/40">{don.currency}</span></div>
                  <span className={`text-[10px] font-bold uppercase tracking-wider ${don.status==='completed'?'text-green-500':don.status==='pending'?'text-yellow-500':'text-red-400'}`}>{don.status}</span>
                </div>
              </div>
            ))}
            {!d.recent_donations?.length && <div className="text-earth/40 text-sm text-center py-8">No donations yet</div>}
          </div>
        </div>
      </div>

      {/* Funding progress */}
      <div className="stat-card">
        <h3 className="font-serif text-earth text-lg mb-2">Overall Funding Progress</h3>
        <div className="flex justify-between text-sm mb-3">
          <span className="text-earth/60">Total Raised</span>
          <span className="font-bold text-earth">{Number(d.projects?.total_raised||0).toLocaleString()} XAF <span className="text-earth/40">/ {Number(d.projects?.total_goal||0).toLocaleString()} XAF goal</span></span>
        </div>
        <div className="h-3 rounded-full bg-earth/8 overflow-hidden">
          <div className="project-progress h-full transition-all duration-1000"
            style={{width: d.projects?.total_goal > 0 ? `${Math.min(100,(d.projects?.total_raised/d.projects?.total_goal)*100)}%` : '0%'}}/>
        </div>
      </div>
    </div>
  )
}
