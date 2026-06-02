import { useState, useMemo } from 'react'
import { Link } from 'react-router-dom'
import { useQuery } from 'react-query'
import { format, isPast, isThisWeek, startOfMonth, endOfMonth, eachDayOfInterval, getDay } from 'date-fns'
import api from '../../services/api'
import {
  Home, ChevronRight, LayoutGrid, List, Search, Calendar,
  CalendarDays, MapPin, Clock, Video, Users, CalendarPlus,
  ArrowRight, Ticket, Sparkles, SlidersHorizontal, ChevronLeft,
} from 'lucide-react'

const CATS = ['all','culture','education','health','sport','community','fundraiser','governance']
const CAT_ICONS = { culture:'🎭', education:'📚', health:'❤️‍🩹', sport:'⚽', community:'🤝', fundraiser:'💰', governance:'⚖️' }
const QUICK_FILTERS = [
  { id: 'this-week', label: 'This Week' },
  { id: 'free',      label: 'Free'      },
  { id: 'online',    label: 'Online'    },
]

export default function EventsPage() {
  const [cat, setCat]           = useState('all')
  const [view, setView]         = useState('grid')
  const [search, setSearch]     = useState('')
  const [quickF, setQuickF]     = useState(null)   // 'this-week' | 'free' | 'online'
  const [sort, setSort]         = useState('soonest') // 'soonest' | 'popular'
  const [calMonth, setCalMonth] = useState(new Date())

  const { data, isLoading } = useQuery('events-page', () => api.get('/events').then(r => r.data))

  const filtered = useMemo(() => {
    if (!data) return []
    return data.filter(e => {
      const matchCat    = cat === 'all' || e.category === cat
      const matchSearch = !search.trim() ||
        e.title.toLowerCase().includes(search.toLowerCase()) ||
        e.venue?.toLowerCase().includes(search.toLowerCase())
      const matchQuick  = !quickF ||
        (quickF === 'this-week' && isThisWeek(new Date(e.startDate), { weekStartsOn: 1 })) ||
        (quickF === 'free'      && !(e.ticketPrice && Number(e.ticketPrice) > 0)) ||
        (quickF === 'online'    && e.isOnline)
      return matchCat && matchSearch && matchQuick
    }).sort((a, b) => {
      if (sort === 'popular') return (b.registration_count || 0) - (a.registration_count || 0)
      return new Date(a.startDate) - new Date(b.startDate)
    })
  }, [data, cat, search, quickF, sort])

  const upcoming = filtered.filter(e => !isPast(new Date(e.startDate)))
  const past     = filtered.filter(e =>  isPast(new Date(e.startDate)))
  const totalUpcoming = data?.filter(e => !isPast(new Date(e.startDate))).length || 0

  const spotlight = !search.trim() && cat === 'all'
    ? (data?.find(e => e.isFeatured && !isPast(new Date(e.startDate))) ||
       data?.find(e => !isPast(new Date(e.startDate))))
    : null

  return (
    <div>
      {/* Hero */}
      <div className="page-hero py-20 px-6 text-center">
        <div className="eyebrow justify-center mb-3 text-gold/90">
          <span className="w-5 h-0.5 rounded-full inline-block mr-2 bg-gold"/>Gatherings
        </div>
        <h1 className="font-display font-bold text-4xl text-white mb-3">Community Events</h1>
        <p className="text-sm text-white/60 max-w-md mx-auto mb-5">
          Cultural celebrations, fundraisers, education forums and more — open to all.
        </p>
        {totalUpcoming > 0 && (
          <div className="inline-flex items-center gap-2 text-xs font-semibold px-4 py-2 rounded-full"
            style={{ background: 'rgba(240,165,0,0.15)', color: '#F0A500', border: '1px solid rgba(240,165,0,0.25)' }}>
            <CalendarDays className="w-3 h-3"/>
            {totalUpcoming} upcoming event{totalUpcoming !== 1 ? 's' : ''}
          </div>
        )}
        <div className="flex items-center justify-center gap-2 text-sm text-white/60 mt-4">
          <Link to="/" className="hover:text-white transition-colors flex items-center gap-1">
            <Home className="w-3 h-3"/>Home
          </Link>
          <ChevronRight className="w-3 h-3 text-gold"/>
          <span className="text-gold">Events</span>
        </div>
      </div>

      <section className="py-16 bg-[#FAFAFA]">
        <div className="max-w-6xl mx-auto px-6">

          {/* Featured Spotlight */}
          {spotlight && <FeaturedSpotlight event={spotlight}/>}

          {/* Toolbar */}
          <div className="flex flex-col gap-4 mb-8">
            {/* Category pills */}
            <div className="flex gap-2 flex-wrap">
              {CATS.map(c => (
                <button key={c} onClick={() => setCat(c)}
                  className="px-4 py-2 rounded-full text-xs font-semibold transition-all capitalize flex items-center gap-1.5"
                  style={{
                    background: cat === c ? 'linear-gradient(135deg,#5B2D8E,#7B4DB8)' : '#fff',
                    color:      cat === c ? '#fff' : '#5B2D8E',
                    boxShadow:  cat === c ? '0 4px 16px rgba(91,45,142,0.3)' : '0 2px 8px rgba(91,45,142,0.07)',
                  }}>
                  {c !== 'all' && <span>{CAT_ICONS[c]}</span>}
                  {c === 'all' ? 'All Events' : c}
                </button>
              ))}
            </div>

            {/* Quick filters row */}
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground/60 mr-1">Quick:</span>
              {QUICK_FILTERS.map(f => (
                <button key={f.id}
                  onClick={() => setQuickF(quickF === f.id ? null : f.id)}
                  className="px-3.5 py-1.5 rounded-full text-[11px] font-semibold transition-all border"
                  style={{
                    background:   quickF === f.id ? 'rgba(240,165,0,0.12)' : '#fff',
                    color:        quickF === f.id ? '#C87800' : '#6B7280',
                    borderColor:  quickF === f.id ? 'rgba(240,165,0,0.35)' : 'rgba(0,0,0,0.08)',
                  }}>
                  {f.label}
                </button>
              ))}
              {/* Sort */}
              <div className="flex items-center gap-1.5 ml-auto">
                <SlidersHorizontal className="w-3 h-3 text-muted-foreground/50"/>
                <select value={sort} onChange={e => setSort(e.target.value)}
                  className="text-[11px] font-semibold border rounded-lg px-2.5 py-1.5 outline-none cursor-pointer"
                  style={{ background: '#fff', borderColor: 'rgba(91,45,142,0.12)', color: '#5B2D8E' }}>
                  <option value="soonest">Soonest first</option>
                  <option value="popular">Most popular</option>
                </select>
              </div>
            </div>

            {/* Search + view toggles */}
            <div className="flex items-center justify-between gap-3">
              <div className="relative w-full max-w-xs">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5"
                  style={{ color: 'rgba(91,45,142,0.4)' }}/>
                <input
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                  placeholder="Search events…"
                  className="w-full pl-9 pr-4 py-2.5 rounded-xl text-xs outline-none transition-all"
                  style={{ background: '#fff', border: '1.5px solid rgba(91,45,142,0.12)', color: '#1A0A35' }}
                  onFocus={e => { e.target.style.borderColor = '#5B2D8E' }}
                  onBlur={e => { e.target.style.borderColor = 'rgba(91,45,142,0.12)' }}
                />
              </div>
              <div className="flex gap-1 p-1 rounded-xl flex-shrink-0" style={{ background: 'rgba(91,45,142,0.06)' }}>
                {[['grid', LayoutGrid], ['list', List], ['calendar', Calendar]].map(([v, Icon]) => (
                  <button key={v} onClick={() => setView(v)}
                    className="w-9 h-9 rounded-lg flex items-center justify-center transition-all"
                    style={{
                      background: view === v ? '#fff' : undefined,
                      boxShadow:  view === v ? '0 1px 4px rgba(91,45,142,0.12)' : undefined,
                      color:      view === v ? '#5B2D8E' : '#A3A3A3',
                    }}>
                    <Icon className="w-4 h-4"/>
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Upcoming */}
          {(isLoading || upcoming.length > 0) && (
            <div className="mb-14">
              <h2 className="font-display font-bold text-xl mb-6 flex items-center gap-2 text-dark">
                <span className="w-1 h-6 rounded-full inline-block"
                  style={{ background: 'linear-gradient(to bottom,#5B2D8E,#F0A500)' }}/>
                Upcoming Events
                {!isLoading && (
                  <span className="text-sm font-normal ml-1 text-muted-foreground">{upcoming.length}</span>
                )}
              </h2>
              {isLoading ? (
                <div className={view === 'grid' ? 'grid md:grid-cols-3 gap-6' : 'space-y-4'}>
                  {[1,2,3].map(i => (
                    <div key={i} className="h-64 rounded-3xl animate-pulse"
                      style={{ background: 'rgba(91,45,142,0.04)' }}/>
                  ))}
                </div>
              ) : view === 'calendar' ? (
                <CalendarView events={upcoming} month={calMonth} onMonth={setCalMonth}/>
              ) : view === 'grid' ? (
                <div className="grid md:grid-cols-3 gap-6">
                  {upcoming.map(e => <EventCard key={e.id} event={e}/>)}
                </div>
              ) : (
                <div className="space-y-4">
                  {upcoming.map(e => <EventListRow key={e.id} event={e}/>)}
                </div>
              )}
            </div>
          )}

          {/* Past Events */}
          {past.length > 0 && (
            <div>
              <h2 className="font-display font-bold text-xl mb-6 flex items-center gap-2"
                style={{ color: '#A3A3A3' }}>
                <span className="w-1 h-6 rounded-full inline-block bg-neutral-200"/>
                Past Events
                <span className="text-sm font-normal ml-1">{past.length}</span>
              </h2>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {past.map(e => <EventCardPast key={e.id} event={e}/>)}
              </div>
            </div>
          )}

          {/* Empty state */}
          {!isLoading && filtered.length === 0 && (
            <div className="text-center py-20 rounded-3xl"
              style={{ background: 'rgba(91,45,142,0.03)', border: '1px dashed rgba(91,45,142,0.12)' }}>
              <CalendarDays className="w-12 h-12 mx-auto mb-4" style={{ color: 'rgba(91,45,142,0.2)' }}/>
              <h3 className="font-display font-bold text-xl mb-2 text-dark">No events found</h3>
              <p className="text-sm text-muted-foreground">
                {search.trim() ? `No results for "${search}"` : 'Check back soon — events are added regularly.'}
              </p>
              {search.trim() && (
                <button onClick={() => setSearch('')}
                  className="mt-4 text-xs font-semibold text-primary-500">
                  Clear search
                </button>
              )}
            </div>
          )}
        </div>
      </section>
    </div>
  )
}

/* ── FEATURED SPOTLIGHT ── */
function FeaturedSpotlight({ event: e }) {
  const d = new Date(e.startDate)
  const isPaid = e.ticketPrice && Number(e.ticketPrice) > 0

  return (
    <Link to={`/events/${e.slug}`}
      className="block mb-10 rounded-3xl overflow-hidden group relative"
      style={{ minHeight: 300 }}>
      {e.coverImage
        ? <img src={e.coverImage} alt=""
            className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"/>
        : <div className="absolute inset-0" style={{ background: 'linear-gradient(135deg,#1A0A35,#5B2D8E)'}}/>
      }
      <div className="absolute inset-0"
        style={{ background: 'linear-gradient(to right, rgba(6,2,16,0.90) 35%, rgba(6,2,16,0.45) 100%)' }}/>

      <div className="relative p-8 md:p-10 flex flex-col md:flex-row gap-6 items-start md:items-end"
        style={{ minHeight: 300 }}>
        {/* Left */}
        <div className="flex-1">
          {e.isFeatured && (
            <div className="flex items-center gap-1.5 mb-3">
              <Sparkles className="w-3.5 h-3.5 text-gold"/>
              <span className="text-[10px] font-bold uppercase tracking-[0.12em] text-gold">Featured Event</span>
            </div>
          )}
          {e.category && (
            <p className="text-[11px] font-semibold uppercase tracking-wider text-white/45 mb-2 capitalize">
              {CAT_ICONS[e.category]} {e.category}
            </p>
          )}
          <h2 className="font-display font-bold text-2xl md:text-3xl text-white leading-tight mb-4 max-w-xl">
            {e.title}
          </h2>
          <div className="flex flex-wrap gap-x-5 gap-y-1.5 text-sm text-white/65">
            <span className="flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5 text-gold/70"/>
              {format(d, 'EEEE, MMMM d · h:mm a')}
            </span>
            {e.venue && (
              <span className="flex items-center gap-1.5">
                <MapPin className="w-3.5 h-3.5 text-gold/70"/>{e.venue}
              </span>
            )}
            {e.registration_count > 0 && (
              <span className="flex items-center gap-1.5">
                <Users className="w-3.5 h-3.5 text-white/40"/>{e.registration_count} registered
              </span>
            )}
          </div>
        </div>
        {/* Right */}
        <div className="flex-shrink-0 flex flex-col items-end gap-3">
          <div className="bg-white rounded-2xl px-5 py-3 text-center">
            <div className="font-display font-bold text-3xl leading-none text-dark">{format(d, 'd')}</div>
            <div className="text-[10px] font-bold uppercase tracking-wider mt-0.5 text-primary-500">
              {format(d, 'MMM yyyy')}
            </div>
          </div>
          <div className="flex items-center gap-1.5 text-xs font-bold px-5 py-2.5 rounded-2xl text-white"
            style={{ background: 'linear-gradient(135deg,#5B2D8E,#7B4DB8)', boxShadow: '0 4px 16px rgba(91,45,142,0.45)' }}>
            {isPaid ? `Get Ticket · ${Number(e.ticketPrice).toLocaleString()} XAF` : 'Register Free'}
            <ArrowRight className="w-3.5 h-3.5"/>
          </div>
        </div>
      </div>
    </Link>
  )
}

/* ── EVENT CARD (grid) ── */
function EventCard({ event: e }) {
  const d = new Date(e.startDate)
  const isPaid    = e.ticketPrice && Number(e.ticketPrice) > 0
  const daysUntil = Math.ceil((d - Date.now()) / 86400000)

  return (
    <Link to={`/events/${e.slug}`}
      className="overflow-hidden group block rounded-3xl hover:-translate-y-1.5 transition-all duration-300"
      style={{ background: '#fff', boxShadow: '0 2px 16px rgba(91,45,142,0.07)', border: '1px solid rgba(91,45,142,0.07)' }}>
      {/* Cover */}
      <div className="h-48 relative overflow-hidden" style={{ background: 'linear-gradient(135deg,#1A0A35,#5B2D8E)' }}>
        {e.coverImage
          ? <img src={e.coverImage} alt=""
              className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"/>
          : <div className="absolute inset-0 flex items-center justify-center">
              <CalendarDays className="w-12 h-12 text-white/10"/>
            </div>
        }
        <div className="absolute inset-0"
          style={{ background: 'linear-gradient(to top, rgba(6,2,16,0.65) 0%, transparent 60%)' }}/>

        {/* Price — top right */}
        <div className="absolute top-3 right-3 z-10">
          <span className="text-[10px] font-bold px-2.5 py-1 rounded-full text-white"
            style={{
              background: isPaid ? 'rgba(200,120,0,0.9)' : 'rgba(91,45,142,0.85)',
              backdropFilter: 'blur(8px)',
            }}>
            {isPaid ? `${Number(e.ticketPrice).toLocaleString()} XAF` : 'Free'}
          </span>
        </div>

        {/* Date — top left */}
        <div className="absolute top-3 left-3 z-10 bg-white rounded-xl px-2.5 py-1.5 text-center">
          <div className="font-display font-bold text-lg leading-none text-dark">{format(d, 'd')}</div>
          <div className="text-[8px] uppercase tracking-wider font-bold text-primary-500">{format(d, 'MMM')}</div>
        </div>

        {/* Urgency ribbon */}
        {daysUntil > 0 && daysUntil <= 7 && (
          <div className="absolute bottom-3 left-3 z-10">
            <span className="text-[10px] font-bold px-2.5 py-1 rounded-full text-white"
              style={{ background: daysUntil <= 2 ? 'rgba(220,38,38,0.9)' : 'rgba(0,0,0,0.55)' }}>
              {daysUntil === 1 ? 'Tomorrow!' : `In ${daysUntil} days`}
            </span>
          </div>
        )}

        {e.isOnline && (
          <div className="absolute bottom-3 right-3 z-10">
            <span className="text-[10px] font-semibold px-2 py-1 rounded-full text-white flex items-center gap-1"
              style={{ background: 'rgba(91,45,142,0.8)' }}>
              <Video className="w-2.5 h-2.5"/>Online
            </span>
          </div>
        )}
      </div>

      {/* Body */}
      <div className="p-5">
        {e.category && (
          <div className="flex items-center gap-1.5 mb-2">
            <span className="w-[2px] h-3 rounded-full bg-primary-500/30 flex-shrink-0"/>
            <span className="text-[9px] font-bold uppercase tracking-[0.1em] text-primary-500/60">
              {CAT_ICONS[e.category]} {e.category}
            </span>
          </div>
        )}
        <h3 className="font-display font-semibold text-[15px] leading-snug mb-3 line-clamp-2 text-dark">
          {e.title}
        </h3>
        <div className="space-y-1.5 mb-4">
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <Clock className="w-3 h-3 flex-shrink-0 text-primary-500/55"/>
            {format(d, 'EEE, MMM d · h:mm a')}
          </div>
          {e.venue && (
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <MapPin className="w-3 h-3 flex-shrink-0 text-primary-500/55"/>
              {e.venue}
            </div>
          )}
          {e.registration_count > 0 && (
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <Users className="w-3 h-3 flex-shrink-0 text-primary-500/55"/>
              {e.registration_count} registered
            </div>
          )}
        </div>
        <div className="flex items-center justify-between pt-3.5 border-t"
          style={{ borderColor: 'rgba(91,45,142,0.07)' }}>
          <span className="text-xs text-primary-500 font-semibold flex items-center gap-1">
            View Details <ArrowRight className="w-3 h-3"/>
          </span>
          {isPaid
            ? <span className="flex items-center gap-1 text-[10px] font-bold text-gold/75">
                <Ticket className="w-3 h-3"/>Get Ticket
              </span>
            : <span className="text-[10px] font-bold text-primary-500/55 flex items-center gap-1">
                <CalendarPlus className="w-3 h-3"/>Register Free
              </span>
          }
        </div>
      </div>
    </Link>
  )
}

/* ── EVENT CARD (past — compact grayscale) ── */
function EventCardPast({ event: e }) {
  const d = new Date(e.startDate)
  return (
    <Link to={`/events/${e.slug}`}
      className="rounded-2xl overflow-hidden group block transition-all hover:opacity-75"
      style={{ background: '#fff', border: '1px solid rgba(0,0,0,0.06)' }}>
      <div className="h-28 relative overflow-hidden" style={{ background: '#e5e5e5' }}>
        {e.coverImage
          ? <img src={e.coverImage} alt=""
              className="absolute inset-0 w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-500"/>
          : <div className="absolute inset-0 flex items-center justify-center">
              <CalendarDays className="w-8 h-8 text-neutral-300"/>
            </div>
        }
        <div className="absolute inset-0" style={{ background: 'rgba(0,0,0,0.15)' }}/>
        <div className="absolute top-2 left-2 bg-white/80 backdrop-blur-sm rounded-lg px-2 py-1 text-center">
          <div className="font-display font-bold text-sm leading-none text-dark">{format(d, 'd')}</div>
          <div className="text-[7px] uppercase tracking-wider font-bold text-neutral-500">{format(d, 'MMM')}</div>
        </div>
      </div>
      <div className="p-3">
        <p className="text-xs font-semibold line-clamp-2 leading-snug text-neutral-500">{e.title}</p>
        <p className="text-[10px] text-neutral-400 mt-0.5">{format(d, 'MMM d, yyyy')}</p>
      </div>
    </Link>
  )
}

/* ── CALENDAR MONTH VIEW ── */
const WEEKDAYS = ['Sun','Mon','Tue','Wed','Thu','Fri','Sat']

function CalendarView({ events, month, onMonth }) {
  const days    = eachDayOfInterval({ start: startOfMonth(month), end: endOfMonth(month) })
  const offset  = getDay(days[0]) // 0=Sun

  // Build lookup: 'YYYY-MM-DD' → [events]
  const byDay = {}
  events.forEach(e => {
    const key = format(new Date(e.startDate), 'yyyy-MM-dd')
    if (!byDay[key]) byDay[key] = []
    byDay[key].push(e)
  })

  return (
    <div className="rounded-3xl overflow-hidden" style={{ background: '#fff', border: '1px solid rgba(91,45,142,0.08)' }}>
      {/* Header */}
      <div className="flex items-center justify-between px-6 py-4 border-b" style={{ borderColor: 'rgba(91,45,142,0.07)' }}>
        <button onClick={() => onMonth(d => new Date(d.getFullYear(), d.getMonth() - 1, 1))}
          className="w-8 h-8 rounded-xl flex items-center justify-center hover:bg-primary-50 transition-colors text-primary-500">
          <ChevronLeft className="w-4 h-4"/>
        </button>
        <h3 className="font-display font-bold text-base text-dark">{format(month, 'MMMM yyyy')}</h3>
        <button onClick={() => onMonth(d => new Date(d.getFullYear(), d.getMonth() + 1, 1))}
          className="w-8 h-8 rounded-xl flex items-center justify-center hover:bg-primary-50 transition-colors text-primary-500">
          <ChevronRight className="w-4 h-4"/>
        </button>
      </div>
      {/* Weekday headers */}
      <div className="grid grid-cols-7 border-b" style={{ borderColor: 'rgba(91,45,142,0.07)' }}>
        {WEEKDAYS.map(d => (
          <div key={d} className="py-2 text-center text-[10px] font-bold uppercase tracking-wider text-muted-foreground/50">
            {d}
          </div>
        ))}
      </div>
      {/* Grid */}
      <div className="grid grid-cols-7">
        {/* Empty cells before first day */}
        {Array.from({ length: offset }).map((_, i) => (
          <div key={`e${i}`} className="min-h-[80px] border-r border-b" style={{ borderColor: 'rgba(91,45,142,0.05)' }}/>
        ))}
        {days.map((day, i) => {
          const key = format(day, 'yyyy-MM-dd')
          const dayEvents = byDay[key] || []
          const isToday   = format(day, 'yyyy-MM-dd') === format(new Date(), 'yyyy-MM-dd')
          const colPos    = (offset + i) % 7
          return (
            <div key={key}
              className="min-h-[80px] p-1.5 border-b"
              style={{
                borderColor: 'rgba(91,45,142,0.05)',
                borderRight: colPos < 6 ? '1px solid rgba(91,45,142,0.05)' : undefined,
              }}>
              <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold mb-1 ${isToday ? 'text-white' : 'text-dark/60'}`}
                style={isToday ? { background: 'linear-gradient(135deg,#5B2D8E,#7B4DB8)' } : {}}>
                {format(day, 'd')}
              </div>
              <div className="space-y-0.5">
                {dayEvents.slice(0, 2).map(e => (
                  <Link key={e.id} to={`/events/${e.slug}`}
                    className="block text-[9px] font-semibold truncate px-1.5 py-0.5 rounded-md text-white leading-tight"
                    style={{ background: 'linear-gradient(135deg,#5B2D8E,#7B4DB8)' }}>
                    {e.title}
                  </Link>
                ))}
                {dayEvents.length > 2 && (
                  <span className="text-[8px] text-primary-500/60 font-semibold pl-1">+{dayEvents.length - 2} more</span>
                )}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}

/* ── EVENT LIST ROW ── */
function EventListRow({ event: e }) {
  const d = new Date(e.startDate)
  const isPaid = e.ticketPrice && Number(e.ticketPrice) > 0
  return (
    <Link to={`/events/${e.slug}`}
      className="flex gap-4 p-4 rounded-2xl group hover:-translate-y-0.5 transition-all block items-center"
      style={{ background: '#fff', border: '1px solid rgba(91,45,142,0.08)', boxShadow: '0 2px 12px rgba(91,45,142,0.04)' }}>
      {/* Date badge */}
      <div className="flex-shrink-0 w-14 h-14 rounded-2xl flex flex-col items-center justify-center"
        style={{ background: 'linear-gradient(135deg,#5B2D8E,#7B4DB8)', boxShadow: '0 4px 12px rgba(91,45,142,0.25)' }}>
        <div className="font-display font-bold text-xl leading-none text-white">{format(d, 'd')}</div>
        <div className="text-[8px] font-bold uppercase tracking-wider text-white/70 mt-0.5">{format(d, 'MMM')}</div>
      </div>

      {/* Info */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-1 flex-wrap">
          {e.category && (
            <span className="text-[9px] font-bold uppercase tracking-[0.1em] text-primary-500/60">
              {CAT_ICONS[e.category]} {e.category}
            </span>
          )}
          {e.isFeatured && <span className="text-[9px] text-gold/75 font-semibold">★ Featured</span>}
          <span className="text-[9px] font-semibold ml-auto"
            style={{ color: isPaid ? '#C87800' : 'rgba(91,45,142,0.5)' }}>
            {isPaid ? `${Number(e.ticketPrice).toLocaleString()} XAF` : 'Free'}
          </span>
        </div>
        <h3 className="font-display font-semibold text-sm mb-1.5 text-dark line-clamp-1">{e.title}</h3>
        <div className="flex items-center gap-4 text-xs text-muted-foreground flex-wrap">
          <span className="flex items-center gap-1">
            <Clock className="w-3 h-3 text-primary-500/45"/>{format(d, 'MMM d · h:mm a')}
          </span>
          {e.venue && (
            <span className="flex items-center gap-1">
              <MapPin className="w-3 h-3 text-primary-500/45"/>{e.venue}
            </span>
          )}
          {e.registration_count > 0 && (
            <span className="flex items-center gap-1">
              <Users className="w-3 h-3 text-primary-500/45"/>{e.registration_count} going
            </span>
          )}
        </div>
      </div>

      {/* Thumbnail */}
      {e.coverImage && (
        <div className="flex-shrink-0 w-20 h-16 rounded-xl overflow-hidden hidden sm:block">
          <img src={e.coverImage} alt=""
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"/>
        </div>
      )}

      {/* CTA */}
      <div className="flex-shrink-0">
        <span className="flex items-center gap-1.5 text-xs font-bold px-4 py-2.5 rounded-xl text-white"
          style={{ background: 'linear-gradient(135deg,#5B2D8E,#7B4DB8)', boxShadow: '0 3px 10px rgba(91,45,142,0.3)' }}>
          {isPaid
            ? <><Ticket className="w-3 h-3"/>Ticket</>
            : <><CalendarPlus className="w-3 h-3"/>Register</>
          }
        </span>
      </div>
    </Link>
  )
}
