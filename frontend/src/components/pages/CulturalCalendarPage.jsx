import { useState, useMemo } from 'react'
import { Link } from 'react-router-dom'
import { useQuery } from 'react-query'
import { format, addDays, startOfMonth, endOfMonth, eachDayOfInterval, isSameDay, isWithinInterval } from 'date-fns'
import api from '../../services/api'

const PAGE_STYLES = `
@keyframes fadeUp    { from{opacity:0;transform:translateY(20px)} to{opacity:1;transform:translateY(0)} }
@keyframes shimmer   { 0%{background-position:-600px 0} 100%{background-position:600px 0} }
@keyframes goldPulse { 0%,100%{box-shadow:0 0 0 0 rgba(240,165,0,0.4)} 50%{box-shadow:0 0 0 10px rgba(240,165,0,0)} }
@keyframes float     { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-8px)} }

.adinkra-bg {
  background-image: url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23F0A500' fill-opacity='0.07'%3E%3Cpath d='M30 0 L60 30 L30 60 L0 30 Z M30 10 L50 30 L30 50 L10 30 Z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E");
}
.kente-stripe {
  background: repeating-linear-gradient(
    45deg,
    rgba(240,165,0,0.06) 0px,
    rgba(240,165,0,0.06) 2px,
    transparent 2px,
    transparent 12px,
    rgba(91,45,142,0.04) 12px,
    rgba(91,45,142,0.04) 14px,
    transparent 14px,
    transparent 24px
  );
}
`

const ANNUAL = [
  { name: "Tso'o Harvest Festival",  month: 1,  day: 15, category: 'culture',   desc: 'Great harvest celebration with masquerades, drumming and communal feasting that marks the end of a bountiful season.', emoji: '🌾', icon: 'fa-seedling'  },
  { name: 'Nweshi Initiation',        month: 3,  day: 1,  category: 'ceremony',  desc: 'Sacred passage rite for young adults entering adulthood — held every 7 years with elders presiding over ancient rituals.', emoji: '🔮', icon: 'fa-fire'      },
  { name: "Mbu' Nkwi Remembrance",   month: 7,  day: 20, category: 'memorial',  desc: 'Annual day of remembrance for ancestors and those who built the foundations of our community. A time of reflection and gratitude.', emoji: '🕊️', icon: 'fa-dove'  },
  { name: 'Nkwi Ngon Dance',          month: 9,  day: 5,  category: 'culture',   desc: 'Post-harvest communal dance celebration where the village gathers in joyful expression of culture, identity and togetherness.', emoji: '🥁', icon: 'fa-drum'     },
  { name: 'Village Founders Day',     month: 10, day: 12, category: 'community', desc: 'Commemoration of the founding of Nkenkak-Ngiesang — honouring the courage, vision and sacrifice of our forebears.', emoji: '🏛️', icon: 'fa-landmark'  },
  { name: 'Cultural Arts Week',       month: 11, day: 1,  category: 'arts',      desc: 'A week-long showcase of traditional arts, music, crafts and storytelling celebrating the living heritage of our people.', emoji: '🎭', icon: 'fa-palette'  },
]

const CAT = {
  culture:        { bg: 'rgba(240,165,0,0.13)',   text: '#B87400', dot: '#F0A500',  label: 'Culture'        },
  ceremony:       { bg: 'rgba(91,45,142,0.13)',   text: '#5B2D8E', dot: '#7B4DB8',  label: 'Ceremony'       },
  memorial:       { bg: 'rgba(100,116,139,0.13)', text: '#475569', dot: '#64748b',  label: 'Memorial'       },
  community:      { bg: 'rgba(22,163,74,0.10)',   text: '#16a34a', dot: '#16a34a',  label: 'Community'      },
  arts:           { bg: 'rgba(2,132,199,0.10)',   text: '#0284c7', dot: '#0284c7',  label: 'Arts'           },
  education:      { bg: 'rgba(168,85,247,0.10)',  text: '#9333ea', dot: '#9333ea',  label: 'Education'      },
  health:         { bg: 'rgba(220,38,38,0.08)',   text: '#dc2626', dot: '#dc2626',  label: 'Health'         },
  sport:          { bg: 'rgba(22,163,74,0.10)',   text: '#15803d', dot: '#16a34a',  label: 'Sport'          },
  fundraiser:     { bg: 'rgba(240,165,0,0.10)',   text: '#B87400', dot: '#F0A500',  label: 'Fundraiser'     },
  governance:     { bg: 'rgba(55,65,81,0.08)',    text: '#374151', dot: '#374151',  label: 'Governance'     },
  default:        { bg: 'rgba(91,45,142,0.08)',   text: '#5B2D8E', dot: '#5B2D8E',  label: 'Event'          },
}

const MONTHS = ['','Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec']
const WEEK_DAYS    = ['Sun','Mon','Tue','Wed','Thu','Fri','Sat']
const WEEK_DAYS_XS = ['S',  'M',  'T',  'W',  'T',  'F',  'S' ]

function catColor(cat) { return CAT[cat] || CAT.default }

function getAnnualForYear(year) {
  return ANNUAL.map(a => ({
    ...a,
    id: `annual-${a.month}-${a.day}`,
    startDate: new Date(year, a.month - 1, a.day).toISOString(),
    isAnnual: true,
  }))
}

/* ── Upcoming horizontal scroll strip ───────────────────────────── */
function UpcomingStrip({ events }) {
  if (!events.length) return null
  return (
    <section className="py-10 relative overflow-hidden" style={{ background: 'linear-gradient(135deg,#FBF5E8,#F5EDF8)' }}>
      <div className="kente-stripe absolute inset-0 opacity-60"/>
      <div className="relative max-w-6xl mx-auto px-6">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-1 h-8 rounded-full" style={{ background: 'linear-gradient(to bottom,#F0A500,#5B2D8E)' }}/>
          <h2 className="font-display font-bold text-xl" style={{ color: '#1A0A35' }}>Coming Up</h2>
          <span className="text-xs font-bold px-2.5 py-1 rounded-full" style={{ background: 'rgba(240,165,0,0.15)', color: '#B87400' }}>
            Next 30 days · {events.length} event{events.length !== 1 ? 's' : ''}
          </span>
        </div>
        <div className="flex gap-4 overflow-x-auto pb-3" style={{ scrollbarWidth: 'none' }}>
          {events.map((ev, i) => {
            const d = new Date(ev.startDate)
            const c = catColor(ev.category)
            return (
              <div key={ev.id}
                className="flex-shrink-0 rounded-2xl overflow-hidden flex flex-col"
                style={{
                  minWidth: 200, background: '#fff',
                  boxShadow: '0 4px 20px rgba(91,45,142,0.1)',
                  border: `1.5px solid ${c.dot}22`,
                  animation: `fadeUp 0.4s ease ${i * 0.06}s both`,
                }}>
                {/* Date band */}
                <div className="px-4 py-3 flex items-center gap-3" style={{ background: c.bg }}>
                  <div className="text-center">
                    <div className="font-display font-bold text-2xl leading-none" style={{ color: c.text }}>{format(d, 'd')}</div>
                    <div className="text-[10px] font-bold uppercase tracking-widest" style={{ color: c.dot }}>{format(d, 'MMM yyyy')}</div>
                  </div>
                  {ev.isAnnual && (
                    <span className="ml-auto text-[9px] font-bold px-2 py-0.5 rounded-full" style={{ background: 'rgba(240,165,0,0.2)', color: '#B87400' }}>
                      Annual
                    </span>
                  )}
                </div>
                <div className="px-4 py-3 flex-1">
                  <p className="font-display font-semibold text-sm leading-snug mb-1" style={{ color: '#1A0A35' }}>
                    {ev.name || ev.title}
                  </p>
                  {(ev.desc || ev.venue) && (
                    <p className="text-[10px] line-clamp-2" style={{ color: '#A3A3A3', fontFamily: 'Poppins,sans-serif' }}>
                      {ev.desc || ev.venue}
                    </p>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </section>
  )
}

/* ── Calendar grid ───────────────────────────────────────────────── */
function CalendarGrid({ days, startPad, eventsForDay, today }) {
  const [selected, setSelected] = useState(null)

  return (
    <div className="rounded-3xl overflow-hidden" style={{ border: '2px solid rgba(240,165,0,0.15)', boxShadow: '0 8px 40px rgba(26,10,53,0.1)' }}>
      {/* Weekday header */}
      <div className="grid grid-cols-7 adinkra-bg" style={{ background: 'linear-gradient(135deg,#1A0A35,#2D1160)' }}>
        {WEEK_DAYS.map((d, i) => (
          <div key={d} className="py-3 text-center font-bold uppercase tracking-widest"
            style={{ color: 'rgba(240,165,0,0.8)', fontFamily: 'Sora,sans-serif' }}>
            <span className="hidden sm:inline text-xs">{d}</span>
            <span className="sm:hidden text-[10px]">{WEEK_DAYS_XS[i]}</span>
          </div>
        ))}
      </div>

      {/* Day cells */}
      <div className="grid grid-cols-7" style={{ background: '#FFFDF7' }}>
        {Array.from({ length: startPad }).map((_, i) => (
          <div key={`pad-${i}`} className="min-h-[96px] border-r border-b"
            style={{ borderColor: 'rgba(240,165,0,0.08)', background: 'rgba(240,165,0,0.015)' }}/>
        ))}

        {days.map(day => {
          const dayEvs  = eventsForDay(day)
          const isToday = isSameDay(day, today)
          const isSel   = selected && isSameDay(day, selected)

          return (
            <div key={day.toISOString()}
              onClick={() => setSelected(isSel ? null : day)}
              className="min-h-[60px] sm:min-h-[96px] p-1 sm:p-2 border-r border-b relative cursor-pointer transition-colors"
              style={{
                borderColor: 'rgba(240,165,0,0.08)',
                background: isToday ? 'rgba(240,165,0,0.06)' : isSel ? 'rgba(91,45,142,0.04)' : '#FFFDF7',
              }}>

              {/* Day number */}
              <span className="inline-flex items-center justify-center w-7 h-7 rounded-full text-xs font-bold mb-1.5"
                style={{
                  fontFamily: 'Sora,sans-serif',
                  background: isToday ? 'linear-gradient(135deg,#F0A500,#FFB84D)' : 'transparent',
                  color: isToday ? '#1A0A35' : '#525252',
                  boxShadow: isToday ? '0 4px 12px rgba(240,165,0,0.4)' : 'none',
                  animation: isToday ? 'goldPulse 2.5s ease-in-out infinite' : 'none',
                }}>
                {format(day, 'd')}
              </span>

              {/* Mobile: dot indicators only */}
              <div className="flex flex-wrap gap-0.5 sm:hidden mt-1">
                {dayEvs.slice(0, 3).map(ev => (
                  <div key={ev.id} className="w-1.5 h-1.5 rounded-full flex-shrink-0"
                    style={{ background: ev.isAnnual ? '#F0A500' : catColor(ev.category).dot }}/>
                ))}
                {dayEvs.length > 3 && <div className="w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ background: '#A3A3A3' }}/>}
              </div>

              {/* Desktop: text pills */}
              <div className="hidden sm:block space-y-0.5">
                {dayEvs.slice(0, 2).map(ev => {
                  const c = catColor(ev.category)
                  return (
                    <div key={ev.id}
                      className="text-[9px] font-semibold px-1.5 py-0.5 rounded-md truncate flex items-center gap-1"
                      style={{ background: c.bg, color: c.text, fontFamily: 'Poppins,sans-serif' }}>
                      {ev.isAnnual && <span style={{ color: '#F0A500' }}>◆</span>}
                      {(ev.name || ev.title || '').slice(0, 18)}
                    </div>
                  )
                })}
                {dayEvs.length > 2 && (
                  <div className="text-[9px] px-1 font-semibold" style={{ color: '#A3A3A3' }}>
                    +{dayEvs.length - 2} more
                  </div>
                )}
              </div>

              {/* Selected day popup */}
              {isSel && dayEvs.length > 0 && (
                <div className="absolute left-0 top-full z-20 mt-1 rounded-2xl shadow-2xl overflow-hidden"
                  style={{ background: '#fff', border: '1.5px solid rgba(91,45,142,0.12)', width: 'min(260px, 80vw)', animation: 'fadeUp 0.2s ease forwards' }}>
                  <div className="px-4 py-2.5 border-b" style={{ background: 'linear-gradient(135deg,#1A0A35,#2D1160)', borderColor: 'rgba(255,255,255,0.08)' }}>
                    <p className="text-xs font-bold text-white">{format(day, 'EEEE, MMMM d')}</p>
                  </div>
                  {dayEvs.map(ev => {
                    const c = catColor(ev.category)
                    return (
                      <div key={ev.id} className="px-4 py-2.5 border-b last:border-0" style={{ borderColor: 'rgba(91,45,142,0.06)' }}>
                        <div className="flex items-center gap-1.5 mb-0.5">
                          <div className="w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ background: c.dot }}/>
                          <span className="text-[9px] font-bold uppercase tracking-wider" style={{ color: c.text }}>{ev.category}</span>
                          {ev.isAnnual && <span className="text-[9px] font-bold" style={{ color: '#F0A500' }}>◆ Annual</span>}
                        </div>
                        <p className="text-xs font-semibold" style={{ color: '#1A0A35', fontFamily: 'Sora,sans-serif' }}>{ev.name || ev.title}</p>
                        {(ev.desc || ev.description) && (
                          <p className="text-[10px] mt-0.5" style={{ color: '#737373', fontFamily: 'Poppins,sans-serif' }}>
                            {(ev.desc || ev.description)?.slice(0, 80)}…
                          </p>
                        )}
                      </div>
                    )
                  })}
                </div>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}

/* ── Timeline list view ──────────────────────────────────────────── */
function TimelineList({ events }) {
  if (!events.length) return (
    <div className="text-center py-24 rounded-3xl"
      style={{ background: 'rgba(240,165,0,0.03)', border: '1px dashed rgba(240,165,0,0.2)' }}>
      <div className="text-5xl mb-4">🗓️</div>
      <h3 className="font-display font-bold text-xl mb-2" style={{ color: '#1A0A35' }}>No events yet</h3>
      <p className="text-sm" style={{ color: '#737373', fontFamily: 'Poppins,sans-serif' }}>Events will appear here once added.</p>
    </div>
  )

  // Group by month
  const grouped = {}
  events.forEach(ev => {
    const key = format(new Date(ev.startDate), 'MMMM yyyy')
    if (!grouped[key]) grouped[key] = []
    grouped[key].push(ev)
  })

  return (
    <div className="space-y-10">
      {Object.entries(grouped).map(([month, evs]) => (
        <div key={month}>
          {/* Month header */}
          <div className="flex items-center gap-4 mb-5">
            <div className="px-4 py-1.5 rounded-full font-display font-bold text-sm"
              style={{ background: 'linear-gradient(135deg,#1A0A35,#2D1160)', color: '#F0A500' }}>
              {month}
            </div>
            <div className="flex-1 h-px" style={{ background: 'linear-gradient(to right,rgba(240,165,0,0.3),transparent)' }}/>
          </div>

          {/* Events */}
          <div className="relative pl-8">
            {/* Timeline line */}
            <div className="absolute left-3 top-0 bottom-0 w-0.5"
              style={{ background: 'linear-gradient(to bottom,rgba(240,165,0,0.4),rgba(91,45,142,0.2))' }}/>

            <div className="space-y-4">
              {evs.map((ev, i) => {
                const d = new Date(ev.startDate)
                const c = catColor(ev.category)
                const tradition = ANNUAL.find(a => ev.isAnnual && a.name === ev.name)
                return (
                  <div key={ev.id}
                    className="relative rounded-2xl overflow-hidden flex flex-col sm:flex-row gap-0 transition-all hover:-translate-y-0.5 hover:shadow-lg"
                    style={{ background: '#fff', boxShadow: '0 2px 16px rgba(91,45,142,0.07)', border: `1.5px solid ${c.dot}18`, animation: `fadeUp 0.4s ease ${i * 0.05}s both` }}>

                    {/* Timeline dot */}
                    <div className="absolute -left-5 top-1/2 -translate-y-1/2 w-3 h-3 rounded-full border-2 border-white"
                      style={{ background: ev.isAnnual ? '#F0A500' : c.dot }}/>

                    {/* Date column — horizontal strip on mobile, vertical column on sm+ */}
                    <div className="flex sm:flex-col items-center gap-3 sm:gap-0 px-4 sm:px-5 py-3 sm:py-4 flex-shrink-0 border-b-2 sm:border-b-0 sm:border-r-2"
                      style={{ background: c.bg, borderColor: `${c.dot}25` }}>
                      {tradition && <span className="text-xl sm:text-2xl sm:mb-1">{tradition.emoji}</span>}
                      <div className="flex items-baseline gap-1.5 sm:flex-col sm:items-center sm:gap-0">
                        <div className="font-display font-bold text-xl sm:text-2xl leading-none" style={{ color: c.text }}>{format(d, 'd')}</div>
                        <div className="text-[10px] font-bold uppercase tracking-widest sm:mt-0.5" style={{ color: c.dot }}>{format(d, 'MMM yyyy')}</div>
                      </div>
                    </div>

                    {/* Content */}
                    <div className="flex-1 px-5 py-4 min-w-0">
                      <div className="flex items-center gap-2 mb-1.5 flex-wrap">
                        <span className="text-[10px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full capitalize"
                          style={{ background: c.bg, color: c.text }}>{ev.category}</span>
                        {ev.isAnnual && (
                          <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full flex items-center gap-1"
                            style={{ background: 'rgba(240,165,0,0.12)', color: '#B87400' }}>
                            <span>◆</span> Annual Tradition
                          </span>
                        )}
                      </div>
                      <h3 className="font-display font-semibold text-base mb-1" style={{ color: '#1A0A35' }}>
                        {ev.name || ev.title}
                      </h3>
                      {(ev.desc || ev.description) && (
                        <p className="text-xs leading-relaxed line-clamp-2" style={{ color: '#737373', fontFamily: 'Poppins,sans-serif' }}>
                          {ev.desc || ev.description}
                        </p>
                      )}
                      {ev.venue && (
                        <div className="flex items-center gap-1.5 mt-2 text-xs" style={{ color: '#A3A3A3', fontFamily: 'Poppins,sans-serif' }}>
                          <i className="fas fa-map-marker-alt text-[10px]" style={{ color: c.dot }}/>
                          {ev.venue}
                        </div>
                      )}
                    </div>

                    {ev.slug && (
                      <div className="flex items-center pr-4">
                        <Link to={`/events/${ev.slug}`}
                          className="text-xs font-bold px-3 py-2 rounded-xl flex items-center gap-1 transition-all hover:opacity-80"
                          style={{ background: c.bg, color: c.text }}>
                          View<i className="fas fa-arrow-right text-[9px] ml-1"/>
                        </Link>
                      </div>
                    )}
                  </div>
                )
              })}
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}

/* ── Annual traditions showcase ─────────────────────────────────── */
function TraditionsShowcase() {
  return (
    <section className="py-20 relative overflow-hidden" style={{ background: 'linear-gradient(160deg,#1A0A35 0%,#2D1160 50%,#1A0A35 100%)' }}>
      <div className="adinkra-bg absolute inset-0 opacity-30"/>
      {/* Gold accent line */}
      <div className="absolute top-0 left-0 right-0 h-1" style={{ background: 'linear-gradient(90deg,transparent,#F0A500,transparent)' }}/>

      <div className="relative max-w-6xl mx-auto px-6">
        <div className="text-center mb-14">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full mb-5"
            style={{ background: 'rgba(240,165,0,0.12)', border: '1px solid rgba(240,165,0,0.2)' }}>
            <span>◆</span>
            <span className="text-xs font-bold uppercase tracking-widest" style={{ color: '#F0A500', fontFamily: 'Sora,sans-serif' }}>
              Recurring Every Year
            </span>
            <span>◆</span>
          </div>
          <h2 className="font-display font-bold text-3xl md:text-4xl text-white mb-4">
            Our Living <span style={{ color: '#F0A500' }}>Traditions</span>
          </h2>
          <p className="text-sm max-w-lg mx-auto" style={{ color: 'rgba(255,255,255,0.55)', fontFamily: 'Poppins,sans-serif' }}>
            These sacred events anchor our identity across generations — kept alive by the hands, voices and hearts of our community.
          </p>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {ANNUAL.map((a, i) => {
            const c = catColor(a.category)
            return (
              <div key={i}
                className="rounded-3xl overflow-hidden group transition-all duration-300 hover:-translate-y-1 hover:shadow-2xl"
                style={{
                  background: 'rgba(255,255,255,0.04)',
                  border: '1px solid rgba(240,165,0,0.15)',
                  backdropFilter: 'blur(12px)',
                  animation: `fadeUp 0.5s ease ${i * 0.08}s both`,
                }}>

                {/* Top band with emoji */}
                <div className="relative px-6 pt-8 pb-5 text-center"
                  style={{ background: 'linear-gradient(160deg,rgba(240,165,0,0.08),rgba(91,45,142,0.08))' }}>
                  <div className="text-5xl mb-3" style={{ animation: `float 4s ease-in-out ${i * 0.4}s infinite` }}>
                    {a.emoji}
                  </div>
                  {/* Date badge */}
                  <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full mb-2"
                    style={{ background: 'rgba(240,165,0,0.15)', border: '1px solid rgba(240,165,0,0.25)' }}>
                    <span className="font-display font-bold text-sm" style={{ color: '#F0A500' }}>
                      {MONTHS[a.month]} {a.day}
                    </span>
                  </div>
                  <span className="block text-[10px] font-bold uppercase tracking-widest px-2.5 py-0.5 rounded-full capitalize mx-auto w-fit"
                    style={{ background: c.bg, color: c.text }}>
                    {a.category}
                  </span>
                </div>

                <div className="px-6 pb-6">
                  {/* Divider */}
                  <div className="h-px mb-4" style={{ background: 'linear-gradient(to right,transparent,rgba(240,165,0,0.3),transparent)' }}/>
                  <h3 className="font-display font-bold text-base text-white mb-2 leading-snug">{a.name}</h3>
                  <p className="text-xs leading-relaxed" style={{ color: 'rgba(255,255,255,0.5)', fontFamily: 'Poppins,sans-serif' }}>
                    {a.desc}
                  </p>
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {/* Bottom gold line */}
      <div className="absolute bottom-0 left-0 right-0 h-1" style={{ background: 'linear-gradient(90deg,transparent,#F0A500,transparent)' }}/>
    </section>
  )
}

/* ── Main page ───────────────────────────────────────────────────── */
export default function CulturalCalendarPage() {
  const now  = new Date()
  const [viewMode,     setViewMode]     = useState('calendar')
  const [currentMonth, setCurrentMonth] = useState(now.getMonth())
  const [currentYear,  setCurrentYear]  = useState(now.getFullYear())

  const { data: apiEvents = [] } = useQuery(
    'calendar-events',
    () => api.get('/events').then(r => r.data),
    { staleTime: 60000 }
  )

  const annualEvents = useMemo(() => getAnnualForYear(currentYear), [currentYear])
  const allEvents    = useMemo(() => [...(apiEvents || []), ...annualEvents], [apiEvents, annualEvents])

  const upcoming30 = useMemo(() => {
    const end30 = addDays(now, 30)
    return allEvents
      .filter(e => { const d = new Date(e.startDate); return d >= now && d <= end30 })
      .sort((a, b) => new Date(a.startDate) - new Date(b.startDate))
  }, [allEvents])

  const calDays = useMemo(() => {
    const first = startOfMonth(new Date(currentYear, currentMonth))
    const last  = endOfMonth(first)
    return { days: eachDayOfInterval({ start: first, end: last }), startPad: first.getDay() }
  }, [currentMonth, currentYear])

  function eventsForDay(day) {
    return allEvents.filter(e => {
      const d = new Date(e.startDate)
      return e.endDate ? isWithinInterval(day, { start: d, end: new Date(e.endDate) }) : isSameDay(d, day)
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

  const sortedAll = useMemo(() =>
    [...allEvents].sort((a, b) => new Date(a.startDate) - new Date(b.startDate)), [allEvents])

  return (
    <div style={{ background: '#FFFDF7' }}>
      <style>{PAGE_STYLES}</style>

      {/* ── Hero ── */}
      <div className="relative overflow-hidden" style={{ background: 'linear-gradient(160deg,#1A0A35 0%,#2D1160 60%,#3D1A6E 100%)', minHeight: 380 }}>
        <div className="adinkra-bg absolute inset-0 opacity-40"/>
        {/* Decorative orbs */}
        <div className="absolute top-0 right-0 w-96 h-96 rounded-full"
          style={{ background: 'radial-gradient(circle,rgba(240,165,0,0.12),transparent)', transform: 'translate(20%,-20%)' }}/>
        <div className="absolute bottom-0 left-0 w-72 h-72 rounded-full"
          style={{ background: 'radial-gradient(circle,rgba(91,45,142,0.3),transparent)', transform: 'translate(-20%,20%)' }}/>
        {/* Gold lines */}
        <div className="absolute top-0 left-0 right-0 h-0.5" style={{ background: 'linear-gradient(90deg,transparent,#F0A500,transparent)' }}/>

        <div className="relative max-w-4xl mx-auto px-6 py-20 text-center">
          <div className="inline-flex items-center gap-3 px-5 py-2 rounded-full mb-6"
            style={{ background: 'rgba(240,165,0,0.12)', border: '1px solid rgba(240,165,0,0.25)' }}>
            <span className="text-lg">◆</span>
            <span className="text-xs font-bold uppercase tracking-widest" style={{ color: '#F0A500', fontFamily: 'Sora,sans-serif' }}>
              Cultural Heritage · Nkenkak-Ngiesang
            </span>
            <span className="text-lg">◆</span>
          </div>
          <h1 className="font-display font-bold text-4xl md:text-6xl text-white mb-4 leading-tight">
            Cultural <span style={{ color: '#F0A500', textShadow: '0 0 40px rgba(240,165,0,0.4)' }}>Calendar</span>
          </h1>
          <p className="text-base max-w-xl mx-auto mb-8" style={{ color: 'rgba(255,255,255,0.6)', fontFamily: 'Poppins,sans-serif', lineHeight: 1.8 }}>
            Our ceremonies, festivals and community gatherings — preserved across generations. Every event is a thread in the fabric of who we are.
          </p>
          {/* Stats */}
          <div className="flex flex-wrap items-center justify-center gap-6">
            {[
              { value: ANNUAL.length, label: 'Annual Traditions' },
              { value: apiEvents.length, label: 'Scheduled Events' },
              { value: upcoming30.length, label: 'Coming This Month' },
            ].map(s => (
              <div key={s.label} className="text-center">
                <div className="font-display font-bold text-2xl text-white">{s.value}</div>
                <div className="text-xs" style={{ color: 'rgba(240,165,0,0.7)', fontFamily: 'Poppins,sans-serif' }}>{s.label}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Upcoming strip */}
      <UpcomingStrip events={upcoming30}/>

      {/* ── Calendar / List section ── */}
      <section className="py-14" style={{ background: '#FFFDF7' }}>
        <div className="max-w-6xl mx-auto px-6">

          {/* Toolbar */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 mb-6 sm:mb-8">
            <div className="flex items-center gap-3">
              <button onClick={prevMonth}
                className="w-10 h-10 rounded-full flex items-center justify-center transition-all hover:scale-105"
                style={{ background: 'rgba(240,165,0,0.1)', color: '#B87400', border: '1px solid rgba(240,165,0,0.2)' }}>
                <i className="fas fa-chevron-left text-xs"/>
              </button>
              <h2 className="font-display font-bold text-base sm:text-xl" style={{ color: '#1A0A35', minWidth: 130, textAlign: 'center' }}>
                {format(new Date(currentYear, currentMonth), 'MMMM yyyy')}
              </h2>
              <button onClick={nextMonth}
                className="w-10 h-10 rounded-full flex items-center justify-center transition-all hover:scale-105"
                style={{ background: 'rgba(240,165,0,0.1)', color: '#B87400', border: '1px solid rgba(240,165,0,0.2)' }}>
                <i className="fas fa-chevron-right text-xs"/>
              </button>
              <button
                onClick={() => { setCurrentMonth(now.getMonth()); setCurrentYear(now.getFullYear()) }}
                className="text-xs px-4 py-2 rounded-full font-bold transition-all hover:opacity-80"
                style={{ background: 'linear-gradient(135deg,#F0A500,#FFB84D)', color: '#1A0A35', fontFamily: 'Sora,sans-serif', boxShadow: '0 4px 12px rgba(240,165,0,0.3)' }}>
                Today
              </button>
            </div>

            <div className="flex gap-1 p-1 rounded-2xl" style={{ background: 'rgba(26,10,53,0.06)' }}>
              {[['calendar','fa-calendar-alt','Calendar'],['list','fa-stream','Timeline']].map(([v,ic,lbl]) => (
                <button key={v} onClick={() => setViewMode(v)}
                  className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold transition-all"
                  style={{
                    background: viewMode === v ? 'linear-gradient(135deg,#1A0A35,#2D1160)' : 'transparent',
                    color: viewMode === v ? '#F0A500' : '#A3A3A3',
                    fontFamily: 'Sora,sans-serif',
                  }}>
                  <i className={`fas ${ic} text-[11px]`}/>{lbl}
                </button>
              ))}
            </div>
          </div>

          {viewMode === 'calendar'
            ? <CalendarGrid days={calDays.days} startPad={calDays.startPad} eventsForDay={eventsForDay} today={now}/>
            : <TimelineList events={sortedAll}/>
          }

          {/* Legend */}
          <div className="mt-8 flex flex-wrap gap-4 justify-center">
            {Object.entries(CAT).filter(([k]) => k !== 'default').map(([cat, c]) => (
              <div key={cat} className="flex items-center gap-1.5">
                <div className="w-2.5 h-2.5 rounded-full" style={{ background: c.dot }}/>
                <span className="text-xs capitalize" style={{ color: '#737373', fontFamily: 'Poppins,sans-serif' }}>{c.label}</span>
              </div>
            ))}
            <div className="flex items-center gap-1.5">
              <span className="text-xs font-bold" style={{ color: '#F0A500' }}>◆ Annual Tradition</span>
            </div>
          </div>
        </div>
      </section>

      {/* Annual traditions showcase */}
      <TraditionsShowcase/>
    </div>
  )
}
