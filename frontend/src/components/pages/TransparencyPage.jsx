import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useQuery } from 'react-query'
import api from '../../services/api'

const FUND_ALLOCATIONS = [
  { label: 'Education',       pct: 35, icon: 'fa-graduation-cap', color: '#5B2D8E' },
  { label: 'Health',          pct: 25, icon: 'fa-heartbeat',      color: '#F0A500' },
  { label: 'Infrastructure',  pct: 25, icon: 'fa-road',           color: '#059669' },
  { label: 'Operations',      pct: 15, icon: 'fa-cogs',           color: '#dc2626' },
]

function StatChip({ label, amount, colorClass }) {
  return (
    <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold ${colorClass}`}>
      {label}: {amount.toLocaleString()} XAF
    </span>
  )
}

function ReportCard({ report }) {
  const [expanded, setExpanded] = useState(false)
  const surplus = report.totalIncome - report.totalExpenses
  const hasSurplus = surplus >= 0

  return (
    <div className="bg-white rounded-2xl overflow-hidden transition-shadow hover:shadow-lg"
      style={{ border: '1px solid rgba(91,45,142,0.1)', boxShadow: '0 4px 20px rgba(91,45,142,0.07)' }}>
      <div className="p-6">
        {/* Badges row */}
        <div className="flex flex-wrap items-center gap-2 mb-3">
          <span className="px-3 py-1 rounded-full text-xs font-bold"
            style={{ background: 'rgba(91,45,142,0.1)', color: '#5B2D8E' }}>
            {report.year}
          </span>
          <span className="px-3 py-1 rounded-full text-xs font-bold"
            style={{ background: 'rgba(240,165,0,0.15)', color: '#B07700' }}>
            {report.period}
          </span>
          {report.isPublished && (
            <span className="px-3 py-1 rounded-full text-xs font-bold"
              style={{ background: 'rgba(5,150,105,0.1)', color: '#059669' }}>
              <i className="fas fa-check-circle mr-1" />Published
            </span>
          )}
        </div>

        {/* Title */}
        <h3 className="text-xl font-bold mb-2" style={{ color: '#1A0A35', fontFamily: 'Sora, sans-serif' }}>
          {report.title}
        </h3>

        {/* Summary */}
        {report.summary && (
          <p className="text-sm leading-relaxed mb-4" style={{ color: '#555', fontFamily: 'Poppins, sans-serif' }}>
            {report.summary}
          </p>
        )}

        {/* Highlights */}
        {report.highlights && report.highlights.length > 0 && (
          <ul className="mb-4 space-y-1.5">
            {report.highlights.map((h, i) => (
              <li key={i} className="flex items-start gap-2 text-sm" style={{ color: '#404040', fontFamily: 'Poppins, sans-serif' }}>
                <i className="fas fa-circle text-[6px] mt-1.5 flex-shrink-0" style={{ color: '#F0A500' }} />
                {h}
              </li>
            ))}
          </ul>
        )}

        {/* Financial chips */}
        <div className="flex flex-wrap gap-2 mb-4">
          <StatChip label="Income"   amount={report.totalIncome}    colorClass="bg-green-50 text-green-700" />
          <StatChip label="Expenses" amount={report.totalExpenses}  colorClass="bg-red-50 text-red-700" />
          <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold ${hasSurplus ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
            <i className={`fas fa-${hasSurplus ? 'arrow-up' : 'arrow-down'} text-[10px]`} />
            {hasSurplus ? 'Surplus' : 'Deficit'}: {Math.abs(surplus).toLocaleString()} XAF
          </span>
        </div>

        {/* Expand / Download row */}
        <div className="flex flex-wrap items-center gap-3">
          {report.fileUrl && (
            <a href={report.fileUrl} target="_blank" rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold transition-all hover:opacity-90"
              style={{ background: 'linear-gradient(135deg,#5B2D8E,#7B4DB8)', color: '#fff', fontFamily: 'Sora, sans-serif' }}>
              <i className="fas fa-download" /> Download Report
            </a>
          )}
          <button onClick={() => setExpanded(!expanded)}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold transition-all hover:bg-primary-50"
            style={{ color: '#5B2D8E', border: '1px solid rgba(91,45,142,0.2)', fontFamily: 'Sora, sans-serif' }}>
            <i className={`fas fa-${expanded ? 'chevron-up' : 'chevron-down'} text-xs`} />
            {expanded ? 'Show Less' : 'View Details'}
          </button>
        </div>

        {/* Expanded detail */}
        {expanded && (
          <div className="mt-5 pt-5" style={{ borderTop: '1px solid rgba(91,45,142,0.08)' }}>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              <div className="rounded-xl p-4 text-center" style={{ background: 'rgba(91,45,142,0.04)' }}>
                <div className="text-xs uppercase tracking-wider mb-1" style={{ color: '#A3A3A3', fontFamily: 'Poppins, sans-serif' }}>Total Income</div>
                <div className="text-lg font-bold" style={{ color: '#059669', fontFamily: 'Sora, sans-serif' }}>{report.totalIncome.toLocaleString()}</div>
                <div className="text-[10px]" style={{ color: '#A3A3A3' }}>XAF</div>
              </div>
              <div className="rounded-xl p-4 text-center" style={{ background: 'rgba(91,45,142,0.04)' }}>
                <div className="text-xs uppercase tracking-wider mb-1" style={{ color: '#A3A3A3', fontFamily: 'Poppins, sans-serif' }}>Total Expenses</div>
                <div className="text-lg font-bold" style={{ color: '#dc2626', fontFamily: 'Sora, sans-serif' }}>{report.totalExpenses.toLocaleString()}</div>
                <div className="text-[10px]" style={{ color: '#A3A3A3' }}>XAF</div>
              </div>
              <div className="rounded-xl p-4 text-center" style={{ background: 'rgba(91,45,142,0.04)' }}>
                <div className="text-xs uppercase tracking-wider mb-1" style={{ color: '#A3A3A3', fontFamily: 'Poppins, sans-serif' }}>{hasSurplus ? 'Surplus' : 'Deficit'}</div>
                <div className="text-lg font-bold" style={{ color: hasSurplus ? '#059669' : '#dc2626', fontFamily: 'Sora, sans-serif' }}>{Math.abs(surplus).toLocaleString()}</div>
                <div className="text-[10px]" style={{ color: '#A3A3A3' }}>XAF</div>
              </div>
            </div>
            <p className="mt-3 text-xs" style={{ color: '#A3A3A3', fontFamily: 'Poppins, sans-serif' }}>
              Report ID: #{report.id} &nbsp;&bull;&nbsp; Published: {new Date(report.createdAt).toLocaleDateString()}
            </p>
          </div>
        )}
      </div>
    </div>
  )
}

export default function TransparencyPage() {
  const [filterYear, setFilterYear] = useState('all')

  const { data: reports = [], isLoading, isError } = useQuery(
    'financial-reports',
    () => api.get('/reports').then(r => r.data),
    { staleTime: 5 * 60 * 1000 }
  )

  const publishedReports = reports.filter(r => r.isPublished)

  const totalIncome   = publishedReports.reduce((s, r) => s + (r.totalIncome   || 0), 0)
  const totalExpenses = publishedReports.reduce((s, r) => s + (r.totalExpenses || 0), 0)
  const surplus       = totalIncome - totalExpenses

  const years = ['all', ...Array.from(new Set(publishedReports.map(r => String(r.year)))).sort((a, b) => b - a)]

  const filtered = filterYear === 'all'
    ? publishedReports
    : publishedReports.filter(r => String(r.year) === filterYear)

  return (
    <div className="min-h-screen" style={{ background: '#F9F7FC' }}>

      {/* Hero */}
      <section className="relative py-20 md:py-28 overflow-hidden"
        style={{ background: 'linear-gradient(135deg,#1A0A35 0%,#2D1060 50%,#5B2D8E 100%)' }}>
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-10 left-10 w-72 h-72 rounded-full" style={{ background: '#F0A500', filter: 'blur(80px)' }} />
          <div className="absolute bottom-10 right-10 w-72 h-72 rounded-full" style={{ background: '#5B2D8E', filter: 'blur(80px)' }} />
        </div>
        <div className="relative max-w-4xl mx-auto px-6 text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-xs font-bold uppercase tracking-widest mb-6"
            style={{ background: 'rgba(240,165,0,0.15)', color: '#F0A500', border: '1px solid rgba(240,165,0,0.3)' }}>
            <i className="fas fa-chart-bar" /> Financial Transparency
          </div>
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-4 leading-tight" style={{ fontFamily: 'Sora, sans-serif' }}>
            Every XAF Accounted For
          </h1>
          <p className="text-lg md:text-xl max-w-2xl mx-auto" style={{ color: 'rgba(255,255,255,0.75)', fontFamily: 'Poppins, sans-serif' }}>
            Open books. Verified numbers. Community trust.
          </p>
        </div>
      </section>

      <div className="max-w-5xl mx-auto px-6 py-14 space-y-14">

        {/* Mission statement */}
        <div className="rounded-2xl p-8 text-center"
          style={{ background: 'linear-gradient(135deg,rgba(91,45,142,0.06),rgba(240,165,0,0.06))', border: '1px solid rgba(91,45,142,0.1)' }}>
          <i className="fas fa-shield-alt text-3xl mb-4" style={{ color: '#5B2D8E' }} />
          <p className="text-base md:text-lg max-w-3xl mx-auto leading-relaxed" style={{ color: '#2D1060', fontFamily: 'Poppins, sans-serif' }}>
            We believe in total financial transparency. Every donation is tracked, every expense is reported,
            and all financial records are available to our community.
          </p>
        </div>

        {/* Key stats */}
        {!isLoading && publishedReports.length > 0 && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { label: 'Total Raised',     value: totalIncome,              icon: 'fa-arrow-up',     color: '#059669' },
              { label: 'Total Spent',      value: totalExpenses,            icon: 'fa-arrow-down',   color: '#dc2626' },
              { label: 'Surplus/Savings',  value: Math.abs(surplus),        icon: 'fa-piggy-bank',   color: surplus >= 0 ? '#059669' : '#dc2626' },
              { label: 'Reports Published',value: publishedReports.length,  icon: 'fa-file-alt',     color: '#5B2D8E', isCount: true },
            ].map(stat => (
              <div key={stat.label} className="bg-white rounded-2xl p-5 text-center"
                style={{ border: '1px solid rgba(91,45,142,0.08)', boxShadow: '0 4px 16px rgba(91,45,142,0.06)' }}>
                <i className={`fas ${stat.icon} text-2xl mb-2`} style={{ color: stat.color }} />
                <div className="text-lg font-bold leading-tight" style={{ color: '#1A0A35', fontFamily: 'Sora, sans-serif' }}>
                  {stat.isCount ? stat.value : stat.value.toLocaleString()}
                </div>
                {!stat.isCount && <div className="text-[10px] font-semibold uppercase tracking-wider mb-1" style={{ color: '#A3A3A3' }}>XAF</div>}
                <div className="text-xs mt-1" style={{ color: '#737373', fontFamily: 'Poppins, sans-serif' }}>{stat.label}</div>
              </div>
            ))}
          </div>
        )}

        {/* Year filter */}
        {years.length > 1 && (
          <div className="flex flex-wrap gap-2">
            {years.map(yr => (
              <button key={yr} onClick={() => setFilterYear(yr)}
                className="px-4 py-1.5 rounded-full text-sm font-semibold transition-all"
                style={filterYear === yr
                  ? { background: '#5B2D8E', color: '#fff', fontFamily: 'Sora, sans-serif' }
                  : { background: 'rgba(91,45,142,0.08)', color: '#5B2D8E', fontFamily: 'Sora, sans-serif' }}>
                {yr === 'all' ? 'All Years' : yr}
              </button>
            ))}
          </div>
        )}

        {/* Reports list */}
        <div>
          <h2 className="text-2xl font-bold mb-6" style={{ color: '#1A0A35', fontFamily: 'Sora, sans-serif' }}>
            Financial Reports
          </h2>

          {isLoading && (
            <div className="flex items-center justify-center py-20">
              <div className="w-10 h-10 rounded-full border-4 animate-spin"
                style={{ borderColor: 'rgba(91,45,142,0.15)', borderTopColor: '#5B2D8E' }} />
            </div>
          )}

          {isError && (
            <div className="text-center py-16 rounded-2xl"
              style={{ background: 'rgba(220,38,38,0.05)', border: '1px dashed rgba(220,38,38,0.2)' }}>
              <i className="fas fa-exclamation-circle text-3xl mb-3" style={{ color: '#dc2626' }} />
              <p className="text-sm" style={{ color: '#dc2626', fontFamily: 'Poppins, sans-serif' }}>Failed to load reports. Please try again later.</p>
            </div>
          )}

          {!isLoading && !isError && filtered.length === 0 && (
            <div className="text-center py-20 rounded-2xl"
              style={{ background: 'rgba(91,45,142,0.03)', border: '2px dashed rgba(91,45,142,0.15)' }}>
              <i className="fas fa-file-invoice-dollar text-5xl mb-4" style={{ color: 'rgba(91,45,142,0.25)' }} />
              <h3 className="text-lg font-bold mb-2" style={{ color: '#5B2D8E', fontFamily: 'Sora, sans-serif' }}>
                First Annual Report Coming Soon
              </h3>
              <p className="text-sm max-w-sm mx-auto" style={{ color: '#737373', fontFamily: 'Poppins, sans-serif' }}>
                We are preparing our first comprehensive financial report. Check back soon.
              </p>
            </div>
          )}

          {!isLoading && !isError && filtered.length > 0 && (
            <div className="space-y-6">
              {filtered.map(report => (
                <ReportCard key={report.id} report={report} />
              ))}
            </div>
          )}
        </div>

        {/* How We Use Funds */}
        <div className="bg-white rounded-2xl p-8 md:p-10"
          style={{ border: '1px solid rgba(91,45,142,0.1)', boxShadow: '0 4px 24px rgba(91,45,142,0.07)' }}>
          <div className="text-center mb-8">
            <h2 className="text-2xl font-bold mb-2" style={{ color: '#1A0A35', fontFamily: 'Sora, sans-serif' }}>
              How We Use Funds
            </h2>
            <p className="text-sm" style={{ color: '#737373', fontFamily: 'Poppins, sans-serif' }}>
              A breakdown of how every donation is allocated across our programmes
            </p>
          </div>

          <div className="space-y-6 max-w-2xl mx-auto">
            {FUND_ALLOCATIONS.map(item => (
              <div key={item.label}>
                <div className="flex items-center justify-between mb-1.5">
                  <div className="flex items-center gap-2">
                    <i className={`fas ${item.icon} text-sm`} style={{ color: item.color }} />
                    <span className="text-sm font-semibold" style={{ color: '#1A0A35', fontFamily: 'Poppins, sans-serif' }}>{item.label}</span>
                  </div>
                  <span className="text-sm font-bold" style={{ color: item.color, fontFamily: 'Sora, sans-serif' }}>{item.pct}%</span>
                </div>
                <div className="h-2.5 rounded-full overflow-hidden" style={{ background: 'rgba(91,45,142,0.08)' }}>
                  <div
                    className="h-full rounded-full transition-all duration-700"
                    style={{ width: `${item.pct}%`, background: item.color }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Request Information CTA */}
        <div className="rounded-2xl p-8 md:p-12 text-center"
          style={{ background: 'linear-gradient(135deg,#1A0A35,#5B2D8E)' }}>
          <i className="fas fa-envelope-open-text text-3xl mb-4" style={{ color: '#F0A500' }} />
          <h2 className="text-2xl font-bold text-white mb-3" style={{ fontFamily: 'Sora, sans-serif' }}>
            Request More Information
          </h2>
          <p className="text-sm max-w-xl mx-auto mb-6" style={{ color: 'rgba(255,255,255,0.75)', fontFamily: 'Poppins, sans-serif' }}>
            Have questions about a specific report or need additional financial details?
            Our team is happy to provide full disclosure.
          </p>
          <Link to="/contact"
            className="inline-flex items-center gap-2 px-8 py-3 rounded-full font-semibold text-sm transition-all hover:opacity-90"
            style={{ background: '#F0A500', color: '#1A0A35', fontFamily: 'Sora, sans-serif' }}>
            <i className="fas fa-paper-plane" /> Get in Touch
          </Link>
        </div>

      </div>
    </div>
  )
}
