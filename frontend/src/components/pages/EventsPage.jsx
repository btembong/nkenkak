import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useQuery } from 'react-query'
import { format, isPast } from 'date-fns'
import api from '../../services/api'
import {
  Home, ChevronRight, LayoutGrid, List,
  CalendarDays, MapPin, Clock, Video, Users, CalendarPlus,
} from 'lucide-react'

const CATS = ['all','culture','education','health','sport','community','fundraiser','governance']

export default function EventsPage() {
  const [cat, setCat]   = useState('all')
  const [view, setView] = useState('grid')
  const { data, isLoading } = useQuery('events-page', () => api.get('/events').then(r => r.data))

  const filtered = data?.filter(e => cat === 'all' || e.category === cat)
  const upcoming = filtered?.filter(e => !isPast(new Date(e.startDate))) || []
  const past     = filtered?.filter(e => isPast(new Date(e.startDate)))  || []

  return (
    <div>
      {/* Hero */}
      <div className="page-hero py-20 px-6 text-center">
        <div className="eyebrow justify-center mb-3 text-gold/90">
          <span className="w-5 h-0.5 rounded-full inline-block mr-2 bg-gold"/>Gatherings
        </div>
        <h1 className="font-display font-bold text-4xl text-white mb-3">Community Events</h1>
        <div className="flex items-center justify-center gap-2 text-sm text-white/60">
          <Link to="/" className="hover:text-white transition-colors flex items-center gap-1"><Home className="w-3 h-3"/>Home</Link>
          <ChevronRight className="w-3 h-3 text-gold"/>
          <span className="text-gold">Events</span>
        </div>
      </div>

      <section className="py-16 bg-[#FAFAFA]">
        <div className="max-w-6xl mx-auto px-6">
          {/* Toolbar */}
          <div className="flex flex-col md:flex-row gap-4 mb-10 items-center justify-between">
            <div className="flex gap-2 flex-wrap">
              {CATS.map(c => (
                <button key={c} onClick={() => setCat(c)}
                  className="px-4 py-2 rounded-full text-xs font-semibold transition-all capitalize"
                  style={{
                    background: cat===c ? 'linear-gradient(135deg,#5B2D8E,#7B4DB8)' : '#fff',
                    color: cat===c ? '#fff' : '#5B2D8E',
                    boxShadow: cat===c ? '0 4px 16px rgba(91,45,142,0.3)' : '0 2px 8px rgba(91,45,142,0.07)',
                  }}>
                  {c==='all'?'All Events':c}
                </button>
              ))}
            </div>
            <div className="flex gap-1 p-1 rounded-xl" style={{background:'rgba(91,45,142,0.06)'}}>
              {[['grid', LayoutGrid],['list', List]].map(([v, Icon])=>(
                <button key={v} onClick={()=>setView(v)}
                  className="w-9 h-9 rounded-lg flex items-center justify-center transition-all"
                  style={{background:view===v?'#fff':undefined, boxShadow:view===v?'0 1px 4px rgba(91,45,142,0.12)':undefined, color:view===v?'#5B2D8E':'#A3A3A3'}}>
                  <Icon className="w-4 h-4"/>
                </button>
              ))}
            </div>
          </div>

          {/* Upcoming */}
          {upcoming.length > 0 && (
            <div className="mb-14">
              <h2 className="font-display font-bold text-xl mb-6 flex items-center gap-2 text-dark">
                <span className="w-1 h-6 rounded-full inline-block" style={{background:'linear-gradient(to bottom,#5B2D8E,#F0A500)'}}/>
                Upcoming Events
                <span className="text-sm font-normal ml-1 text-muted-foreground">{upcoming.length}</span>
              </h2>
              {isLoading ? (
                <div className={view==='grid'?'grid md:grid-cols-3 gap-6':'space-y-4'}>
                  {[1,2,3].map(i=><div key={i} className="h-64 rounded-3xl animate-pulse" style={{background:'rgba(91,45,142,0.04)'}}/>)}
                </div>
              ) : view==='grid' ? (
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

          {/* Past events */}
          {past.length > 0 && (
            <div>
              <h2 className="font-display font-bold text-xl mb-6 flex items-center gap-2 text-muted-foreground">
                <span className="w-1 h-6 rounded-full inline-block bg-neutral-300"/>
                Past Events
                <span className="text-sm font-normal ml-1">{past.length}</span>
              </h2>
              <div className="grid md:grid-cols-3 gap-6 opacity-70">
                {past.map(e => <EventCard key={e.id} event={e} past/>)}
              </div>
            </div>
          )}

          {!isLoading && !filtered?.length && (
            <div className="text-center py-20 rounded-3xl" style={{background:'rgba(91,45,142,0.03)',border:'1px dashed rgba(91,45,142,0.12)'}}>
              <CalendarDays className="w-12 h-12 mx-auto mb-4" style={{color:'rgba(91,45,142,0.2)'}}/>
              <h3 className="font-display font-bold text-xl mb-2 text-dark">No events found</h3>
              <p className="text-sm text-muted-foreground">Check back soon — events are added regularly.</p>
            </div>
          )}
        </div>
      </section>
    </div>
  )
}

function EventCard({ event: e, past }) {
  const d = new Date(e.startDate)
  const isPaid = e.ticketPrice && Number(e.ticketPrice) > 0
  return (
    <Link to={`/events/${e.slug}`} className="card overflow-hidden group block hover:-translate-y-1 transition-transform">
      {/* Cover image */}
      <div className="h-44 flex items-center justify-center relative overflow-hidden"
        style={{background:'linear-gradient(135deg,rgba(91,45,142,0.15),rgba(91,45,142,0.28))'}}>
        {e.coverImage
          ? <img src={e.coverImage} alt="" className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
          : <><div className="wave-pattern absolute inset-0"/><CalendarDays className="w-10 h-10 relative z-10 text-primary-500/30"/></>
        }
        <div className="absolute inset-0" style={{background:'linear-gradient(to top,rgba(0,0,0,0.35) 0%,transparent 55%)'}}/>

        {/* Date badge — keep, it's functional */}
        <div className="absolute top-3 left-3 bg-white rounded-2xl px-3 py-2 text-center shadow-card z-10">
          <div className="font-display font-bold text-xl leading-none text-dark">{format(d,'d')}</div>
          <div className="text-[9px] uppercase tracking-wider font-semibold text-primary-500">{format(d,'MMM')}</div>
        </div>

        {/* Past overlay */}
        {past && (
          <div className="absolute inset-0 flex items-center justify-center bg-white/55 z-20">
            <span className="text-[10px] font-bold uppercase tracking-[0.12em] text-muted-foreground">Past Event</span>
          </div>
        )}
      </div>

      <div className="p-5">
        {/* Category + pricing — hairline label style */}
        <div className="flex items-center justify-between mb-2">
          {e.category && (
            <div className="flex items-center gap-1.5">
              <span className="w-[2px] h-3 rounded-full bg-primary-500/35 flex-shrink-0"/>
              <span className="text-[9px] font-bold uppercase tracking-[0.1em] text-primary-500/65">{e.category}</span>
            </div>
          )}
          <span className="text-[9px] font-semibold tracking-wide ml-auto"
            style={{ color: isPaid ? '#C87800' : 'rgba(91,45,142,0.55)' }}>
            {isPaid ? `${Number(e.ticketPrice).toLocaleString()} XAF` : 'Free'}
          </span>
        </div>

        <h3 className="font-display font-semibold text-base mb-2 line-clamp-2 leading-snug text-dark">{e.title}</h3>
        <div className="space-y-1.5 mb-4">
          {e.venue && (
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <MapPin className="w-3.5 h-3.5 flex-shrink-0 text-primary-500/60"/>
              {e.venue}
            </div>
          )}
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <Clock className="w-3.5 h-3.5 flex-shrink-0 text-primary-500/60"/>
            {format(d,'EEEE, MMMM d yyyy · h:mm a')}
          </div>
          {e.isOnline && (
            <div className="flex items-center gap-2 text-xs text-primary-500/70">
              <Video className="w-3.5 h-3.5 flex-shrink-0"/>Online Event
            </div>
          )}
          {e.registration_count > 0 && (
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <Users className="w-3.5 h-3.5 flex-shrink-0 text-primary-500/60"/>{e.registration_count} registered
            </div>
          )}
        </div>
        <p className="text-xs line-clamp-2 leading-relaxed mb-4 text-muted-foreground">{e.description}</p>
        {!past && (
          <div className="btn-secondary w-full justify-center !py-2.5 !text-xs pointer-events-none">
            <CalendarPlus className="w-3.5 h-3.5"/>
            {isPaid ? `Get Ticket · ${Number(e.ticketPrice).toLocaleString()} XAF` : 'Register Now — Free'}
          </div>
        )}
      </div>
    </Link>
  )
}

function EventListRow({ event: e }) {
  const d = new Date(e.startDate)
  const isPaid = e.ticketPrice && Number(e.ticketPrice) > 0
  return (
    <Link to={`/events/${e.slug}`} className="card flex gap-5 p-5 items-start hover:-translate-y-0.5 transition-transform block">
      <div className="bg-white rounded-2xl px-4 py-3 text-center shadow-card flex-shrink-0 border border-primary-500/10">
        <div className="font-display font-bold text-2xl leading-none text-dark">{format(d,'d')}</div>
        <div className="text-[10px] uppercase tracking-wider font-semibold mt-0.5 text-primary-500">{format(d,'MMM')}</div>
        <div className="text-[9px] text-muted-foreground">{format(d,'yyyy')}</div>
      </div>
      <div className="flex-1 min-w-0">
        {/* Category + featured — hairline style */}
        <div className="flex items-center gap-3 mb-2 flex-wrap">
          {e.category && (
            <div className="flex items-center gap-1.5">
              <span className="w-[2px] h-3 rounded-full bg-primary-500/35 flex-shrink-0"/>
              <span className="text-[9px] font-bold uppercase tracking-[0.1em] text-primary-500/65">{e.category}</span>
            </div>
          )}
          {e.isFeatured && (
            <span className="text-[9px] font-semibold text-gold/80 flex items-center gap-1">
              ★ Featured
            </span>
          )}
          <span className="text-[9px] font-semibold ml-auto"
            style={{ color: isPaid ? '#C87800' : 'rgba(91,45,142,0.5)' }}>
            {isPaid ? `${Number(e.ticketPrice).toLocaleString()} XAF` : 'Free'}
          </span>
        </div>
        <h3 className="font-display font-semibold text-base mb-2 text-dark">{e.title}</h3>
        <p className="text-xs line-clamp-1 mb-2 text-muted-foreground">{e.description}</p>
        <div className="flex items-center gap-4 text-xs text-muted-foreground">
          {e.venue && <span className="flex items-center gap-1"><MapPin className="w-3 h-3 text-primary-500/60"/>{e.venue}</span>}
          <span className="flex items-center gap-1"><Clock className="w-3 h-3 text-primary-500/60"/>{format(d,'h:mm a')}</span>
          {e.registration_count > 0 && <span className="flex items-center gap-1"><Users className="w-3 h-3 text-primary-500/60"/>{e.registration_count} going</span>}
        </div>
      </div>
      <div className="btn-secondary !py-2 !px-4 !text-xs flex-shrink-0 pointer-events-none">
        {isPaid ? 'Get Ticket' : 'Register'}
      </div>
    </Link>
  )
}
