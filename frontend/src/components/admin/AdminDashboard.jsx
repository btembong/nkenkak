import React from 'react'
import { useQuery } from 'react-query'
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, BarChart, Bar } from 'recharts'
import { Link } from 'react-router-dom'
import api from '../../services/api'

const PIE_COLORS = ['#5B2D8E','#F0A500','#7B4DB8','#FFB84D','#16a34a','#0284c7']

/* ── Tiny stat card ── */
function StatCard({ icon, label, value, sub, change, iconBg, iconColor }) {
  const isPos = change >= 0
  return (
    <div className="stat-card group hover:shadow-card-lg transition-all">
      <div className="flex items-start justify-between mb-4">
        <div className="w-11 h-11 rounded-2xl flex items-center justify-center" style={{background:iconBg}}>
          <i className={`fas ${icon} text-lg`} style={{color:iconColor}}/>
        </div>
        {change !== undefined && (
          <span className="text-[10px] font-bold flex items-center gap-0.5 px-2 py-0.5 rounded-full"
            style={{background:isPos?'rgba(22,163,74,0.1)':'rgba(220,38,38,0.08)', color:isPos?'#16a34a':'#dc2626'}}>
            <i className={`fas fa-arrow-${isPos?'up':'down'} text-[8px]`}/>{Math.abs(change)}%
          </span>
        )}
      </div>
      <div className="font-display font-bold text-2xl mb-0.5" style={{color:'#1A0A35'}}>{value}</div>
      <div className="text-xs font-medium" style={{color:'#A3A3A3',fontFamily:'Poppins,sans-serif'}}>{label}</div>
      {sub && <div className="text-[10px] mt-1" style={{color:'#C4C4C4',fontFamily:'Poppins,sans-serif'}}>{sub}</div>}
    </div>
  )
}

const CustomTooltip = ({active,payload,label}) => {
  if (!active||!payload?.length) return null
  return (
    <div className="rounded-xl px-3 py-2 shadow-card-lg text-xs" style={{background:'#1A0A35',color:'#fff',fontFamily:'Poppins,sans-serif'}}>
      <div className="font-semibold mb-1">{label?.slice(5)}</div>
      {payload.map(p=><div key={p.dataKey} style={{color:p.color}}>{p.name}: {typeof p.value==='number'&&p.value>999?p.value.toLocaleString():p.value}</div>)}
    </div>
  )
}

export default function AdminDashboard() {
  const [analyticsDays, setAnalyticsDays] = React.useState(30)
  const { data, isLoading } = useQuery('admin-dashboard', ()=>api.get('/admin/dashboard').then(r=>r.data))
  const { data: analytics } = useQuery(['admin-analytics', analyticsDays], ()=>api.get(`/admin/analytics?days=${analyticsDays}`).then(r=>r.data), { staleTime: 60000 })

  if (isLoading) return (
    <div className="space-y-6 animate-pulse">
      <div className="grid grid-cols-4 gap-4">{[1,2,3,4].map(i=><div key={i} className="h-28 rounded-3xl" style={{background:'rgba(91,45,142,0.06)'}}/>)}</div>
      <div className="grid grid-cols-3 gap-4">{[1,2,3].map(i=><div key={i} className="h-56 rounded-3xl" style={{background:'rgba(91,45,142,0.06)'}}/>)}</div>
    </div>
  )

  const d = data||{}
  const pieData = [
    {name:'Active',    value:+(d.projects?.active)||0},
    {name:'Completed', value:+(d.projects?.completed)||0},
    {name:'Upcoming',  value:Math.max(0,(+(d.projects?.total)||0)-(+(d.projects?.active)||0)-(+(d.projects?.completed)||0))},
  ]

  return (
    <div className="space-y-6">
      {/* Top stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard icon="fa-users"       label="Total Members"    value={(+(d.users?.total)||0).toLocaleString()}
          sub={`+${d.users?.new_this_month||0} this month`} change={12}
          iconBg="rgba(91,45,142,0.08)"  iconColor="#5B2D8E"/>
        <StatCard icon="fa-seedling"    label="Active Projects"  value={d.projects?.active||0}
          sub={`${d.projects?.completed||0} completed`}    change={5}
          iconBg="rgba(22,163,74,0.08)"  iconColor="#16a34a"/>
        <StatCard icon="fa-coins"       label="Total Raised (XAF)" value={(+(d.donations?.total)||0).toLocaleString()}
          sub="All time"                                    change={8}
          iconBg="rgba(240,165,0,0.1)"   iconColor="#F0A500"/>
        <StatCard icon="fa-comments"    label="Forum Threads"    value={(+(d.forum?.threads)||0).toLocaleString()}
          sub={`${+(d.forum?.replies)||0} replies`}         change={-2}
          iconBg="rgba(123,77,184,0.1)"  iconColor="#7B4DB8"/>
      </div>

      {/* Second row stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard icon="fa-globe"       label="Diaspora Members" value={d.users?.diaspora||0}              iconBg="rgba(2,132,199,0.08)"  iconColor="#0284c7"/>
        <StatCard icon="fa-calendar"    label="Upcoming Events"  value={d.events?.upcoming||0}             iconBg="rgba(91,45,142,0.06)"  iconColor="#7B4DB8"/>
        <StatCard icon="fa-newspaper"   label="Published News"   value={d.news?.published||0}              iconBg="rgba(234,88,12,0.08)"  iconColor="#ea580c"/>
        <StatCard icon="fa-clock"       label="Pending Payments" value={d.donations?.pending||0}           iconBg="rgba(220,38,38,0.06)"  iconColor="#dc2626"/>
      </div>

      {/* Analytics period selector */}
      <div className="flex items-center justify-between">
        <h2 className="font-display font-bold text-sm uppercase tracking-widest" style={{color:'#A3A3A3'}}>Analytics</h2>
        <div className="flex gap-1 rounded-xl p-1" style={{background:'rgba(91,45,142,0.06)'}}>
          {[7,14,30].map(n=>(
            <button key={n} onClick={()=>setAnalyticsDays(n)}
              className="text-xs font-semibold px-3 py-1 rounded-lg transition-all"
              style={{background:analyticsDays===n?'#5B2D8E':'transparent', color:analyticsDays===n?'#fff':'#737373', fontFamily:'Sora,sans-serif'}}>
              {n}d
            </button>
          ))}
        </div>
      </div>

      {/* Charts row */}
      <div className="grid lg:grid-cols-3 gap-6">
        {/* Donation trend */}
        <div className="lg:col-span-2 stat-card">
          <div className="flex items-center justify-between mb-5">
            <h3 className="font-display font-bold text-base" style={{color:'#1A0A35'}}>Donation Trend</h3>
            <span className="text-xs font-semibold px-3 py-1 rounded-full" style={{background:'rgba(91,45,142,0.08)',color:'#5B2D8E',fontFamily:'Sora,sans-serif'}}>{analyticsDays} days</span>
          </div>
          <div className="h-52">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={analytics?.donations||[]} margin={{top:4,right:4,bottom:0,left:0}}>
                <defs>
                  <linearGradient id="gradD" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%"  stopColor="#5B2D8E" stopOpacity={0.2}/>
                    <stop offset="95%" stopColor="#5B2D8E" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <XAxis dataKey="day" tick={{fontSize:10,fontFamily:'Poppins,sans-serif',fill:'#A3A3A3'}} axisLine={false} tickLine={false}
                  tickFormatter={v=>v?.slice(5)}
                  interval={Math.floor((analytics?.donations?.length||1)/6)}/>
                <YAxis tick={{fontSize:10,fontFamily:'Poppins,sans-serif',fill:'#A3A3A3'}} axisLine={false} tickLine={false} width={50} tickFormatter={v=>v>=1000?`${(v/1000).toFixed(0)}k`:v}/>
                <Tooltip content={<CustomTooltip/>}/>
                <Area type="monotone" dataKey="total" name="XAF" stroke="#5B2D8E" strokeWidth={2} fill="url(#gradD)"/>
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Project status donut */}
        <div className="stat-card flex flex-col">
          <h3 className="font-display font-bold text-base mb-4" style={{color:'#1A0A35'}}>Project Status</h3>
          <div className="flex-1 flex items-center justify-center">
            <div className="h-44 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={pieData} cx="50%" cy="50%" innerRadius={48} outerRadius={70} paddingAngle={3} dataKey="value">
                    {pieData.map((_,i)=><Cell key={i} fill={PIE_COLORS[i]} stroke="none"/>)}
                  </Pie>
                  <Tooltip content={<CustomTooltip/>}/>
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>
          <div className="grid grid-cols-3 gap-2 mt-2">
            {pieData.map((p,i)=>(
              <div key={p.name} className="text-center">
                <div className="w-2.5 h-2.5 rounded-full mx-auto mb-1" style={{background:PIE_COLORS[i]}}/>
                <div className="font-display font-bold text-sm" style={{color:'#1A0A35'}}>{p.value}</div>
                <div className="text-[10px]" style={{color:'#A3A3A3',fontFamily:'Poppins,sans-serif'}}>{p.name}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Second charts row */}
      <div className="grid lg:grid-cols-3 gap-6">
        {/* Member signups */}
        <div className="lg:col-span-2 stat-card">
          <div className="flex items-center justify-between mb-5">
            <h3 className="font-display font-bold text-base" style={{color:'#1A0A35'}}>New Member Signups</h3>
            <span className="text-xs font-semibold px-3 py-1 rounded-full" style={{background:'rgba(22,163,74,0.08)',color:'#16a34a',fontFamily:'Sora,sans-serif'}}>{analyticsDays} days</span>
          </div>
          <div className="h-44">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={analytics?.signups||[]} margin={{top:4,right:4,bottom:0,left:0}}>
                <defs>
                  <linearGradient id="gradS" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%"  stopColor="#16a34a" stopOpacity={0.2}/>
                    <stop offset="95%" stopColor="#16a34a" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <XAxis dataKey="day" tick={{fontSize:10,fontFamily:'Poppins,sans-serif',fill:'#A3A3A3'}} axisLine={false} tickLine={false}
                  tickFormatter={v=>v?.slice(5)}
                  interval={Math.floor((analytics?.signups?.length||1)/6)}/>
                <YAxis tick={{fontSize:10,fontFamily:'Poppins,sans-serif',fill:'#A3A3A3'}} axisLine={false} tickLine={false} width={30} allowDecimals={false}/>
                <Tooltip content={<CustomTooltip/>}/>
                <Area type="monotone" dataKey="count" name="Signups" stroke="#16a34a" strokeWidth={2} fill="url(#gradS)"/>
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Members by country */}
        <div className="stat-card flex flex-col">
          <h3 className="font-display font-bold text-base mb-4" style={{color:'#1A0A35'}}>Members by Country</h3>
          <div className="flex-1 h-44">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={analytics?.membersByCountry||[]} layout="vertical" margin={{top:0,right:8,bottom:0,left:0}}>
                <XAxis type="number" tick={{fontSize:10,fontFamily:'Poppins,sans-serif',fill:'#A3A3A3'}} axisLine={false} tickLine={false}/>
                <YAxis type="category" dataKey="country" tick={{fontSize:10,fontFamily:'Poppins,sans-serif',fill:'#737373'}} axisLine={false} tickLine={false} width={72}/>
                <Tooltip content={<CustomTooltip/>}/>
                <Bar dataKey="count" name="Members" fill="#5B2D8E" radius={[0,4,4,0]} opacity={0.85}/>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Bottom row */}
      <div className="grid lg:grid-cols-2 gap-6">
        {/* Recent donations */}
        <div className="stat-card">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-display font-bold text-base" style={{color:'#1A0A35'}}>Recent Donations</h3>
            <Link to="/admin/donations" className="text-xs font-semibold hover:underline" style={{color:'#5B2D8E',fontFamily:'Sora,sans-serif'}}>View All →</Link>
          </div>
          <div className="space-y-2 max-h-64 overflow-y-auto pr-1">
            {d.recent_donations?.map((don,i)=>(
              <div key={don.reference||i} className="flex items-center gap-3 py-2.5 border-b last:border-0" style={{borderColor:'rgba(91,45,142,0.06)'}}>
                <div className="w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-bold flex-shrink-0"
                  style={{background:'linear-gradient(135deg,#5B2D8E,#7B4DB8)'}}>
                  {don.donor?.[0]?.toUpperCase()||'?'}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-xs font-semibold truncate" style={{color:'#1A0A35',fontFamily:'Sora,sans-serif'}}>{don.donor||'Anonymous'}</div>
                  <div className="text-[10px] truncate" style={{color:'#A3A3A3',fontFamily:'Poppins,sans-serif'}}>{don.project||'General Fund'}</div>
                </div>
                <div className="text-right flex-shrink-0">
                  <div className="font-display font-bold text-sm" style={{color:'#1A0A35'}}>{Number(don.amount).toLocaleString()}</div>
                  <span className="text-[10px] font-bold" style={{color:don.status==='completed'?'#16a34a':don.status==='pending'?'#C87800':'#dc2626'}}>{don.status}</span>
                </div>
              </div>
            ))}
            {!d.recent_donations?.length && (
              <div className="text-center py-8">
                <i className="fas fa-heart text-3xl mb-2 block" style={{color:'rgba(91,45,142,0.12)'}}/>
                <p className="text-sm" style={{color:'#A3A3A3',fontFamily:'Poppins,sans-serif'}}>No donations yet</p>
              </div>
            )}
          </div>
        </div>

        {/* Funding progress + quick actions */}
        <div className="stat-card flex flex-col gap-5">
          <h3 className="font-display font-bold text-base" style={{color:'#1A0A35'}}>Funding Overview</h3>

          {/* Overall bar */}
          <div>
            <div className="flex justify-between text-xs mb-2" style={{fontFamily:'Poppins,sans-serif'}}>
              <span style={{color:'#737373'}}>Overall Progress</span>
              <span className="font-semibold" style={{color:'#5B2D8E'}}>
                {d.projects?.total_goal>0 ? Math.round((d.projects?.total_raised/d.projects?.total_goal)*100) : 0}%
              </span>
            </div>
            <div className="progress-track h-3">
              <div className="progress-fill transition-all duration-1000"
                style={{width:d.projects?.total_goal>0?`${Math.min(100,(d.projects?.total_raised/d.projects?.total_goal)*100)}%`:'0%'}}/>
            </div>
            <div className="flex justify-between text-[10px] mt-1.5" style={{color:'#A3A3A3',fontFamily:'Poppins,sans-serif'}}>
              <span>{Number(d.projects?.total_raised||0).toLocaleString()} XAF raised</span>
              <span>Goal: {Number(d.projects?.total_goal||0).toLocaleString()} XAF</span>
            </div>
          </div>

          {/* Donations by method bar */}
          {analytics?.donationsByMethod?.length > 0 && (
            <div>
              <div className="text-xs font-semibold mb-2" style={{color:'#737373',fontFamily:'Poppins,sans-serif'}}>Donations by Method</div>
              <div className="h-24">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={analytics.donationsByMethod} margin={{top:0,right:0,bottom:0,left:0}}>
                    <XAxis dataKey="method" tick={{fontSize:10,fontFamily:'Poppins,sans-serif',fill:'#A3A3A3'}} axisLine={false} tickLine={false}/>
                    <Tooltip content={<CustomTooltip/>}/>
                    <Bar dataKey="total" name="XAF" fill="#F0A500" radius={[3,3,0,0]} opacity={0.85}/>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          )}

          {/* Quick actions */}
          <div>
            <div className="text-xs font-semibold uppercase tracking-widest mb-3" style={{color:'#A3A3A3',fontFamily:'Sora,sans-serif'}}>Quick Actions</div>
            <div className="grid grid-cols-2 gap-2">
              {[
                {to:'/admin/projects', icon:'fa-plus', label:'New Project',   c:'#5B2D8E', bg:'rgba(91,45,142,0.08)'},
                {to:'/admin/news',     icon:'fa-pen',  label:'Write Article', c:'#F0A500', bg:'rgba(240,165,0,0.08)'},
                {to:'/admin/events',   icon:'fa-calendar-plus', label:'Add Event', c:'#16a34a', bg:'rgba(22,163,74,0.08)'},
                {to:'/admin/users',    icon:'fa-users', label:'Manage Users', c:'#0284c7', bg:'rgba(2,132,199,0.08)'},
              ].map(a=>(
                <Link key={a.to} to={a.to}
                  className="flex items-center gap-2 p-3 rounded-2xl transition-all hover:-translate-y-0.5 hover:shadow-card"
                  style={{background:a.bg}}>
                  <i className={`fas ${a.icon} text-sm`} style={{color:a.c}}/>
                  <span className="text-xs font-semibold" style={{color:'#1A0A35',fontFamily:'Sora,sans-serif'}}>{a.label}</span>
                </Link>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
