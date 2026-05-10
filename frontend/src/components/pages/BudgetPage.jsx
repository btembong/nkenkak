import { useState } from 'react'
import { useQuery } from 'react-query'
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Legend } from 'recharts'
import api from '../../services/api'

const PIE_COLORS = ['#5B2D8E','#F0A500','#16a34a','#0284c7','#dc2626','#7B4DB8','#C87800','#15803d']

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null
  return (
    <div className="rounded-xl px-3 py-2 shadow-lg text-xs" style={{ background: '#1A0A35', color: '#fff', fontFamily: 'Poppins,sans-serif' }}>
      <div className="font-semibold mb-1">{label || payload[0]?.name}</div>
      {payload.map(p => <div key={p.dataKey || p.name} style={{ color: p.color || '#F0A500' }}>{p.name}: {Number(p.value).toLocaleString()} XAF</div>)}
    </div>
  )
}

function StatBlock({ label, value, icon, color, bg }) {
  return (
    <div className="rounded-3xl p-6 flex items-center gap-4" style={{ background: '#fff', border: '1px solid rgba(91,45,142,0.08)', boxShadow: '0 2px 16px rgba(91,45,142,0.06)' }}>
      <div className="w-12 h-12 rounded-2xl flex items-center justify-center flex-shrink-0" style={{ background: bg }}>
        <i className={`fas ${icon} text-lg`} style={{ color }}/>
      </div>
      <div>
        <div className="font-display font-bold text-2xl" style={{ color: '#1A0A35' }}>{Number(value).toLocaleString()}</div>
        <div className="text-xs" style={{ color: '#A3A3A3', fontFamily: 'Poppins,sans-serif' }}>{label} (XAF)</div>
      </div>
    </div>
  )
}

export default function BudgetPage() {
  const [year, setYear] = useState(new Date().getFullYear())
  const { data, isLoading } = useQuery(['budget', year], () => api.get(`/budget?year=${year}`).then(r => r.data))

  const income   = data?.entries?.filter(e => e.type === 'income') || []
  const expenses = data?.entries?.filter(e => e.type === 'expense') || []

  // Quarterly bar data
  const quarters = ['Q1','Q2','Q3','Q4']
  const quarterData = quarters.map(q => ({
    quarter: q,
    Income:   income.filter(e => e.quarter === q).reduce((s,e) => s + Number(e.amount), 0),
    Expenses: expenses.filter(e => e.quarter === q).reduce((s,e) => s + Number(e.amount), 0),
  }))

  return (
    <div style={{ background: '#F9F7FD', minHeight: '100vh' }}>
      {/* Hero */}
      <div className="relative py-20 overflow-hidden" style={{ background: 'linear-gradient(135deg,#1A0A35,#250F47)' }}>
        <div className="wave-pattern absolute inset-0 opacity-20"/>
        <div className="relative max-w-4xl mx-auto px-6 text-center">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full mb-5" style={{ background: 'rgba(240,165,0,0.15)', border: '1px solid rgba(240,165,0,0.25)' }}>
            <i className="fas fa-chart-pie text-xs" style={{ color: '#F0A500' }}/>
            <span className="text-xs font-bold uppercase tracking-widest" style={{ color: '#F0A500', fontFamily: 'Sora,sans-serif' }}>Full Accountability</span>
          </div>
          <h1 className="font-display font-bold text-4xl md:text-5xl text-white mb-4">Village <span style={{ color: '#F0A500' }}>Budget</span></h1>
          <p className="text-base max-w-xl mx-auto" style={{ color: 'rgba(255,255,255,0.65)', fontFamily: 'Poppins,sans-serif' }}>Complete transparency on how community funds are collected and spent.</p>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-6 py-10">
        {/* Year selector */}
        <div className="flex items-center gap-3 mb-8">
          <span className="text-sm font-semibold" style={{ color: '#737373', fontFamily: 'Sora,sans-serif' }}>Year:</span>
          <div className="flex gap-1 p-1 rounded-xl" style={{ background: 'rgba(91,45,142,0.06)' }}>
            {(data?.years?.length ? data.years : [year]).map(y => (
              <button key={y} onClick={() => setYear(y)}
                className="text-xs font-semibold px-4 py-1.5 rounded-lg transition-all"
                style={{ background: year === y ? '#5B2D8E' : 'transparent', color: year === y ? '#fff' : '#737373', fontFamily: 'Sora,sans-serif' }}>
                {y}
              </button>
            ))}
          </div>
        </div>

        {isLoading ? (
          <div className="space-y-6">{[1,2,3].map(i => <div key={i} className="h-40 rounded-3xl animate-pulse" style={{ background: 'rgba(91,45,142,0.05)' }}/>)}</div>
        ) : !data?.entries?.length ? (
          <div className="text-center py-24 rounded-3xl" style={{ background: 'rgba(91,45,142,0.02)', border: '1px dashed rgba(91,45,142,0.12)' }}>
            <i className="fas fa-chart-pie text-5xl mb-4 block" style={{ color: 'rgba(91,45,142,0.18)' }}/>
            <h3 className="font-display font-bold text-xl mb-2" style={{ color: '#1A0A35' }}>No budget data for {year}</h3>
            <p className="text-sm" style={{ color: '#737373', fontFamily: 'Poppins,sans-serif' }}>Budget entries will appear here when added by the admin.</p>
          </div>
        ) : (
          <>
            {/* Summary cards */}
            <div className="grid md:grid-cols-3 gap-5 mb-8">
              <StatBlock label="Total Income"   value={data.totalIncome}   icon="fa-arrow-down"  color="#16a34a" bg="rgba(22,163,74,0.1)"/>
              <StatBlock label="Total Expenses" value={data.totalExpenses} icon="fa-arrow-up"    color="#dc2626" bg="rgba(220,38,38,0.08)"/>
              <StatBlock label="Net Balance"    value={data.balance}       icon="fa-balance-scale" color={data.balance >= 0 ? '#5B2D8E' : '#dc2626'} bg={data.balance >= 0 ? 'rgba(91,45,142,0.1)' : 'rgba(220,38,38,0.08)'}/>
            </div>

            {/* Charts */}
            <div className="grid lg:grid-cols-2 gap-6 mb-8">
              {/* Quarterly bar */}
              <div className="rounded-3xl p-6" style={{ background: '#fff', boxShadow: '0 2px 16px rgba(91,45,142,0.06)' }}>
                <h3 className="font-display font-bold text-base mb-5" style={{ color: '#1A0A35' }}>Quarterly Breakdown</h3>
                <div className="h-52">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={quarterData} margin={{ top: 4, right: 4, bottom: 0, left: 0 }}>
                      <XAxis dataKey="quarter" tick={{ fontSize: 10, fontFamily: 'Poppins,sans-serif', fill: '#A3A3A3' }} axisLine={false} tickLine={false}/>
                      <YAxis tick={{ fontSize: 10, fill: '#A3A3A3' }} axisLine={false} tickLine={false} tickFormatter={v => v >= 1000 ? `${(v/1000).toFixed(0)}k` : v}/>
                      <Tooltip content={<CustomTooltip/>}/>
                      <Legend wrapperStyle={{ fontSize: 10, fontFamily: 'Poppins,sans-serif' }}/>
                      <Bar dataKey="Income"   fill="#16a34a" radius={[4,4,0,0]} opacity={0.85}/>
                      <Bar dataKey="Expenses" fill="#dc2626" radius={[4,4,0,0]} opacity={0.85}/>
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Expense breakdown pie */}
              {data.byCategory?.length > 0 && (
                <div className="rounded-3xl p-6" style={{ background: '#fff', boxShadow: '0 2px 16px rgba(91,45,142,0.06)' }}>
                  <h3 className="font-display font-bold text-base mb-5" style={{ color: '#1A0A35' }}>Spending by Category</h3>
                  <div className="h-52">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie data={data.byCategory} cx="50%" cy="50%" outerRadius={80} dataKey="amount" nameKey="name" paddingAngle={2}>
                          {data.byCategory.map((_, i) => <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} stroke="none"/>)}
                        </Pie>
                        <Tooltip content={<CustomTooltip/>}/>
                        <Legend wrapperStyle={{ fontSize: 10, fontFamily: 'Poppins,sans-serif' }}/>
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              )}
            </div>

            {/* Entries table */}
            <div className="rounded-3xl overflow-hidden" style={{ background: '#fff', boxShadow: '0 2px 16px rgba(91,45,142,0.06)' }}>
              <div className="px-6 py-4 border-b" style={{ borderColor: 'rgba(91,45,142,0.06)' }}>
                <h3 className="font-display font-bold text-base" style={{ color: '#1A0A35' }}>All Transactions</h3>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-xs">
                  <thead style={{ background: 'rgba(91,45,142,0.04)' }}>
                    <tr>{['Quarter','Category','Type','Amount','Description','Receipt'].map(h => (
                      <th key={h} className="text-left px-5 py-3 font-bold uppercase tracking-widest" style={{ color: '#5B2D8E', fontFamily: 'Sora,sans-serif' }}>{h}</th>
                    ))}</tr>
                  </thead>
                  <tbody>
                    {data.entries.map((e,i) => (
                      <tr key={e.id} style={{ background: i%2===0?'transparent':'rgba(91,45,142,0.015)' }}>
                        <td className="px-5 py-3 font-semibold" style={{ color: '#5B2D8E' }}>{e.quarter}</td>
                        <td className="px-5 py-3" style={{ color: '#1A0A35' }}>{e.category}</td>
                        <td className="px-5 py-3">
                          <span className="font-bold px-2 py-0.5 rounded-full text-[10px]" style={{ background: e.type==='income'?'rgba(22,163,74,0.1)':'rgba(220,38,38,0.1)', color: e.type==='income'?'#16a34a':'#dc2626' }}>
                            {e.type}
                          </span>
                        </td>
                        <td className="px-5 py-3 font-display font-bold" style={{ color: '#1A0A35' }}>{Number(e.amount).toLocaleString()} {e.currency}</td>
                        <td className="px-5 py-3 max-w-xs truncate" style={{ color: '#737373' }}>{e.description || '—'}</td>
                        <td className="px-5 py-3">
                          {e.receiptUrl ? <a href={e.receiptUrl} target="_blank" rel="noopener noreferrer" className="text-xs font-semibold" style={{ color: '#5B2D8E' }}><i className="fas fa-file-alt mr-1"/>View</a> : <span style={{ color: '#D4D4D4' }}>—</span>}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  )
}
