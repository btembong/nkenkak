import { useState, useMemo } from 'react'
import { Link } from 'react-router-dom'
import { useQuery } from 'react-query'
import { format, addMonths, subMonths, startOfMonth, endOfMonth, eachDayOfInterval, isSameDay, isWithinInterval, addDays } from 'date-fns'
import api from '../../services/api'

const ANNUAL = [
  { name: "Tso'o Harvest Festival",   month: 1,  day: 15, category: 'culture',   desc: 'Great harvest celebration with masquerades and feasting' },
  { name: 'Nweshi Initiation',         month: 3,  day: 1,  category: 'ceremony',  desc: 'Passage rite for young adults (every 7 years)' },
  { name: "Mbu' Nkwi Remembrance",    month: 7,  day: 20, category: 'memorial',  desc: 'Annual day of remembrance for ancestors' },
  { name: 'Nkwi Ngon Dance',           month: 9,  day: 5,  category: 'culture',   desc: 'Post-harvest communal dance celebration' },
  { name: 'Village Founders Day',      month: 10, day: 12, category: 'community', desc: 'Commemoration of village founding' },
  { name: 'Cultural Arts Week',        month: 11, day: 1,  category: 'arts',      desc: 'Week-long showcase of traditional arts, music, and crafts' },
]

const CAT_COLORS = {
  culture:   { bg: 'rgba(240,165,0,0.12)',   text: '#C87800',  dot: '#F0A500' },
  ceremony:  { bg: 'rgba(91,45,142,0.12)',   text: '#5B2D8E',  dot: '#5B2D8E' },
  memorial:  { bg: 'rgba(100,116,139,0.12)', text: '#475569',  dot: '#64748b' },
  community: { bg: 'rgba(22,163,74,0.10)',   text: '#16a34a',  dot: '#16a34a' },
  arts:      { bg: 'rgba(2,132,199,0.10)',   text: '#0284c7',  dot: '#0284c7' },
  education: { bg: 'rgba(168,85,247,0.10)',  text: '#9333ea',  dot: '#9333ea' },
  health:    { bg: 'rgba(220,38,38,0.08)',   text: '#dc2626',  dot: '#dc2626' },
  sport:     { bg: 'rgba(22,163,74,0.10)',   text: '#16a34a',  dot: '#16a34a' },
  fundraiser:{ bg: 'rgba(240,165,0,0.10)',   text: '#C87800',  dot: '#F0A500' },
  governance:{ bg: 'rgba(55,65,81,0.08)',    text: '#374151',  dot: '#374151' },
  default:   { bg: 'rgba(91,45,142,0.08)',   text: '#5B2D8E',  dot: '#5B2D8E' },
}

const WEEK_DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']

function getAnnualForYear(year) {
  return ANNUAL.map(a => ({
    ...a,
    id: `annual-${a.month}-${a.day}`,
    startDate: new Date(year, a.month - 1, a.day).toISOString(),
    isAnnual: true,
  }))
}

export default function CulturalCalendarPage() {
  const now = new Date()
  const [viewMode, setViewMode]       = useState('calendar')
  const [currentMonth, setCurrentMonth] = useState(now.getMonth())
  const [currentYear, setCurrentYear]   = useState(now.getFullYear())

  const { data: apiEvents = [] } = useQuery(
    'calendar-events',
    () => api.get('/events').then(r => r.data),
    { staleTime: 60000 }
  )

  const annualEvents = useMemo(() => getAnnualForYear(currentYear), [currentYear])
  const allEvents    = useMemo(() => [...(apiEvents || []), ...annualEvents], [apiEvents, annualEvents])

  // Upcoming — next 30 days
  const upcoming30 = useMemo(() => {
    const today = new Date()
    const end30  = addDays(today, 30)
    return allEvents
      .filter(e => {
        const d = new Date(e.startDate)
        return d >= today && d <= end30
      })
      .sort((a, b) => new Date(a.startDate) - new Date(b.startDate))
  }, [allEvents])

  // Calendar days
  const calDays = useMemo(() => {
    const first = startOfMonth(new Date(currentYear, currentMonth))
    const last  = endOfMonth(first)
    const days  = eachDayOfInterval({ start: first, end: last })
    const startPad = first.getDay()
    return { days, startPad }
  }, [currentMonth, currentYear])

  function eventsForDay(day) {
    return allEvents.filter(e => {
      const d = new Date(e.startDate)
      if (e.endDate) {
        return isWithinInterval(day, { start: d, end: new Date(e.endDate) })
      }
      return isSameDay(d, day)
    })
  }

  function prevMonth() {
    if (currentMonth === 0) { setCurrentMonth(11); setCurrentYear(y => y - 1) }
    else setCurrentMonth(m => m - 1)
  }
  function nextMonth() {
    if (currentMonth === 11) { setCurrentMonth(0); setCurrentYear(y => y + 1) }
    else setCurrentMonth(m => m + 1)
  }

  const catColor = (cat) => CAT_COLORS[cat] || CAT_COLORS.default

  const sortedAll = useMemo(() =>
    [...allEvents].sort((a, b) => new Date(a.startDate) - new Date(b.startDate))
  , [allEvents])

  return (
    <div>
      {/* Hero */}
      <div className="page-hero py-20 px-6 text-center">
        <div className="eyebrow justify-center mb-3" style={{ color: 'rgba(240,165,0,0.9)' }}>
          <span className="w-5 h-0.5 rounded-full inline-block mr-2" style={{ background: '#F0A500' }} />
          Cultural Life
        </div>
        <h1 className="font-display font-bold text-4xl text-white mb-3">
          Cultural <span style={{ color: '#F0A500' }}>Calendar</span>
        </h1>
        <p className="text-sm max-w-xl mx-auto mb-4" style={{ color: 'rgba(255,255,255,0.65)', fontFamily: 'Poppins,sans-serif' }}>
          Annual ceremonies, community gatherings, and cultural events — all in one place.
        </p>
        <div className="flex items-center justify-center gap-2 text-sm" style={{ color: 'rgba(255,255,255,0.6)', fontFamily: 'Poppins,sans-serif' }}>
          <Link to="/" className="hover:text-white transition-colors flex items-center gap-1">
            <i className="fas fa-home text-xs" />Home
          </Link>
          <i className="fas fa-chevron-right text-xs" style={{ color: '#F0A500' }} />
          <span style={{ color: '#F0A500' }}>Cultural Calendar</span>
        </div>
      </div>

      {/* Upcoming strip */}
      {upcoming30.length > 0 && (
        <section className="py-10" style={{ background: 'linear-gradient(135deg,#FAF6EE,#F3EEF9)' }}>
          <div className="max-w-6xl mx-auto px-6">
            <h2 className="font-display font-bold text-lg mb-5 flex items-center gap-2" style={{ color: '#1A0A35' }}>
              <span className="w-1 h-6 rounded-full inline-block" style={{ background: 'linear-gradient(to bottom,#5B2D8E,#F0A500)' }} />
              Coming Up — Next 30 Days
              <span className="text-xs font-normal ml-1 px-2 py-0.5 rounded-full"
                style={{ background: 'rgba(91,45,142,0.08)', color: '#5B2D8E' }}>
                {upcoming30.length}
              </span>
            </h2>
            <div className="flex gap-4 overflow-x-auto pb-3" style={{ scrollbarWidth: 'thin' }}>
              {upcoming30.map(ev => {
                const d = new Date(ev.startDate)
                const c = catColor(ev.category)
                return (
                  <div key={ev.id} className="flex-shrink-0 rounded-2xl p-4 flex items-start gap-3"
                    style={{ minWidth: 240, background: '#fff', boxShadow: '0 4px 20px rgba(91,45,142,0.09)', border: `1.5px solid ${c.dot}25` }}>
                    <div className="rounded-xl px-3 py-2 text-center flex-shrink-0"
                      style={{ background: c.bg }}>
                      <div className="font-display font-bold text-xl leading-none" style={{ color: c.text }}>{format(d, 'd')}</div>
                      <div className="text-[9px] uppercase font-bold tracking-wider" style={{ color: c.dot }}>{format(d, 'MMM')}</div>
                    </div>
                    <div>
                      {ev.isAnnual && (
                        <span className="text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full mb-1 inline-block"
                          style={{ background: 'rgba(240,165,0,0.1)', color: '#C87800' }}>Annual</span>
                      )}
                      <p className="font-display font-semibold text-xs leading-snug" style={{ color: '#1A0A35' }}>{ev.name || ev.title}</p>
                      <p className="text-[10px] mt-0.5 line-clamp-1" style={{ color: '#737373', fontFamily: 'Poppins,sans-serif' }}>{ev.desc || ev.venue}</p>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        </section>
      )}

      {/* Calendar / List toggle */}
      <section className="py-14 bg-white">
        <div className="max-w-6xl mx-auto px-6">
          {/* Toolbar */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mb-8">
            {/* Month navigation */}
            <div className="flex items-center gap-3">
              <button onClick={prevMonth}
                className="w-9 h-9 rounded-full flex items-center justify-center transition-all"
                style={{ background: 'rgba(91,45,142,0.07)', color: '#5B2D8E' }}>
                <i className="fas fa-chevron-left text-xs" />
              </button>
              <h2 className="font-display font-bold text-xl" style={{ color: '#1A0A35', minWidth: 180, textAlign: 'center' }}>
                {format(new Date(currentYear, currentMonth), 'MMMM yyyy')}
              </h2>
              <button onClick={nextMonth}
                className="w-9 h-9 rounded-full flex items-center justify-center transition-all"
                style={{ background: 'rgba(91,45,142,0.07)', color: '#5B2D8E' }}>
                <i className="fas fa-chevron-right text-xs" />
              </button>
              <button onClick={() => { setCurrentMonth(now.getMonth()); setCurrentYear(now.getFullYear()) }}
                className="text-xs px-3 py-1.5 rounded-full font-semibold"
                style={{ background: 'rgba(91,45,142,0.07)', color: '#5B2D8E', fontFamily: 'Sora,sans-serif' }}>
                Today
              </button>
            </div>

            {/* View toggle */}
            <div className="flex gap-1 p-1 rounded-xl" style={{ background: 'rgba(91,45,142,0.06)' }}>
              {[['calendar', 'fa-calendar-alt', 'Calendar'], ['list', 'fa-list', 'List']].map(([v, ic, lbl]) => (
                <button key={v} onClick={() => setViewMode(v)}
                  className="flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-semibold transition-all"
                  style={{
                    background: viewMode === v ? '#fff' : 'transparent',
                    color: viewMode === v ? '#5B2D8E' : '#A3A3A3',
                    boxShadow: viewMode === v ? '0 1px 4px rgba(91,45,142,0.12)' : 'none',
                    fontFamily: 'Sora,sans-serif',
                  }}>
                  <i className={`fas ${ic}`} />{lbl}
                </button>
              ))}
            </div>
          </div>

          {viewMode === 'calendar' ? (
            /* ── CALENDAR VIEW ── */
            <div className="rounded-3xl overflow-hidden" style={{ border: '1.5px solid rgba(91,45,142,0.08)', boxShadow: '0 4px 32px rgba(91,45,142,0.08)' }}>
              {/* Weekday headers */}
              <div className="grid grid-cols-7" style={{ background: 'linear-gradient(135deg,#250F47,#5B2D8E)' }}>
                {WEEK_DAYS.map(d => (
                  <div key={d} className="py-3 text-center text-xs font-bold uppercase tracking-wider"
                    style={{ color: 'rgba(255,255,255,0.75)', fontFamily: 'Sora,sans-serif' }}>
                    {d}
                  </div>
                ))}
              </div>
              {/* Day cells */}
              <div className="grid grid-cols-7">
                {/* Padding cells */}
                {Array.from({ length: calDays.startPad }).map((_, i) => (
                  <div key={`pad-${i}`} className="min-h-[90px] border-r border-b" style={{ borderColor: 'rgba(91,45,142,0.05)' }} />
                ))}
                {calDays.days.map(day => {
                  const dayEvents = eventsForDay(day)
                  const isToday   = isSameDay(day, now)
                  return (
                    <div key={day.toISOString()}
                      className="min-h-[90px] p-2 border-r border-b relative"
                      style={{ borderColor: 'rgba(91,45,142,0.05)', background: isToday ? 'rgba(91,45,142,0.03)' : '#fff' }}>
                      <span
                        className="inline-flex items-center justify-center w-7 h-7 rounded-full text-xs font-bold mb-1"
                        style={{
                          fontFamily: 'Sora,sans-serif',
                          background: isToday ? 'linear-gradient(135deg,#5B2D8E,#7B4DB8)' : 'transparent',
                          color: isToday ? '#fff' : '#525252',
                        }}>
                        {format(day, 'd')}
                      </span>
                      <div className="space-y-0.5">
                        {dayEvents.slice(0, 2).map(ev => {
                          const c = catColor(ev.category)
                          return (
                            <div key={ev.id}
                              className="text-[9px] font-semibold px-1.5 py-0.5 rounded truncate"
                              style={{ background: c.bg, color: c.text, fontFamily: 'Poppins,sans-serif' }}>
                              {ev.isAnnual ? '◆ ' : ''}{(ev.name || ev.title || '').slice(0, 20)}
                            </div>
                          )
                        })}
                        {dayEvents.length > 2 && (
                          <div className="text-[9px] px-1" style={{ color: '#A3A3A3', fontFamily: 'Poppins,sans-serif' }}>
                            +{dayEvents.length - 2} more
                          </div>
                        )}
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          ) : (
            /* ── LIST VIEW ── */
            <div className="space-y-4">
              {sortedAll.length === 0 ? (
                <div className="text-center py-20 rounded-3xl"
                  style={{ background: 'rgba(91,45,142,0.03)', border: '1px dashed rgba(91,45,142,0.12)' }}>
                  <i className="fas fa-calendar text-5xl mb-4 block" style={{ color: 'rgba(91,45,142,0.18)' }} />
                  <h3 className="font-display font-bold text-xl mb-2" style={{ color: '#1A0A35' }}>No events yet</h3>
                  <p className="text-sm" style={{ color: '#737373', fontFamily: 'Poppins,sans-serif' }}>Events will appear here once added.</p>
                </div>
              ) : sortedAll.map(ev => {
                const d = new Date(ev.startDate)
                const c = catColor(ev.category)
                return (
                  <div key={ev.id} className="card flex gap-4 p-5 items-start">
                    <div className="rounded-2xl px-4 py-3 text-center flex-shrink-0"
                      style={{ background: c.bg, minWidth: 56 }}>
                      <div className="font-display font-bold text-2xl leading-none" style={{ color: c.text }}>{format(d, 'd')}</div>
                      <div className="text-[9px] uppercase font-bold tracking-wider" style={{ color: c.dot }}>{format(d, 'MMM')}</div>
                      <div className="text-[8px]" style={{ color: '#A3A3A3', fontFamily: 'Poppins,sans-serif' }}>{format(d, 'yyyy')}</div>
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1 flex-wrap">
                        <span className="text-[10px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full capitalize"
                          style={{ background: c.bg, color: c.text }}>
                          {ev.category}
                        </span>
                        {ev.isAnnual && (
                          <span className="text-[10px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full"
                            style={{ background: 'rgba(240,165,0,0.1)', color: '#C87800' }}>
                            Annual Tradition
                          </span>
                        )}
                      </div>
                      <h3 className="font-display font-semibold text-base" style={{ color: '#1A0A35' }}>
                        {ev.name || ev.title}
                      </h3>
                      <p className="text-xs mt-1 line-clamp-2" style={{ color: '#737373', fontFamily: 'Poppins,sans-serif' }}>
                        {ev.desc || ev.description}
                      </p>
                      {ev.venue && (
                        <div className="flex items-center gap-1.5 mt-1.5 text-xs" style={{ color: '#A3A3A3', fontFamily: 'Poppins,sans-serif' }}>
                          <i className="fas fa-map-marker-alt" style={{ color: c.dot }} />{ev.venue}
                        </div>
                      )}
                    </div>
                    {ev.slug && (
                      <Link to={`/events/${ev.slug}`}
                        className="btn-secondary !py-2 !px-4 !text-xs flex-shrink-0">
                        View
                      </Link>
                    )}
                  </div>
                )
              })}
            </div>
          )}

          {/* Legend */}
          <div className="mt-8 flex flex-wrap gap-3 justify-center">
            {Object.entries(CAT_COLORS).filter(([k]) => k !== 'default').map(([cat, c]) => (
              <div key={cat} className="flex items-center gap-1.5">
                <div className="w-2.5 h-2.5 rounded-full" style={{ background: c.dot }} />
                <span className="text-xs capitalize" style={{ color: '#737373', fontFamily: 'Poppins,sans-serif' }}>{cat}</span>
              </div>
            ))}
            <div className="flex items-center gap-1.5">
              <span className="text-xs" style={{ color: '#C87800', fontFamily: 'Poppins,sans-serif' }}>◆ Annual Tradition</span>
            </div>
          </div>
        </div>
      </section>

      {/* Annual traditions showcase */}
      <section className="py-14 relative overflow-hidden" style={{ background: 'linear-gradient(135deg,#1A0A35,#250F47)' }}>
        <div className="wave-pattern absolute inset-0" />
        <div className="relative max-w-6xl mx-auto px-6">
          <div className="text-center mb-12">
            <div className="eyebrow justify-center mb-3" style={{ color: 'rgba(240,165,0,0.85)' }}>Every Year</div>
            <h2 className="section-title-white">Our Annual <span style={{ color: '#F0A500' }}>Traditions</span></h2>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {ANNUAL.map((a, i) => {
              const c = catColor(a.category)
              return (
                <div key={i} className="card-dark rounded-3xl p-5">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="rounded-xl px-3 py-2 text-center flex-shrink-0"
                      style={{ background: 'rgba(240,165,0,0.12)', border: '1px solid rgba(240,165,0,0.2)' }}>
                      <div className="font-display font-bold text-lg leading-none" style={{ color: '#F0A500' }}>{a.day}</div>
                      <div className="text-[9px] uppercase font-bold tracking-wider" style={{ color: 'rgba(240,165,0,0.7)' }}>
                        {['', 'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'][a.month]}
                      </div>
                    </div>
                    <div>
                      <span className="text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full capitalize"
                        style={{ background: c.bg, color: c.text }}>
                        {a.category}
                      </span>
                      <h3 className="font-display font-semibold text-sm mt-0.5" style={{ color: '#fff' }}>{a.name}</h3>
                    </div>
                  </div>
                  <p className="text-xs leading-relaxed" style={{ color: 'rgba(255,255,255,0.55)', fontFamily: 'Poppins,sans-serif' }}>
                    {a.desc}
                  </p>
                </div>
              )
            })}
          </div>
        </div>
      </section>
    </div>
  )
}
