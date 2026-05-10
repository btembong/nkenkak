import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useQuery } from 'react-query'
import { format, isPast } from 'date-fns'
import api from '../../services/api'

const CATS = ['all','culture','education','health','sport','community','fundraiser','governance']
const CAT_COLORS = {
  culture:'#5B2D8E', education:'#F0A500', health:'#dc2626',
  sport:'#16a34a', community:'#0284c7', fundraiser:'#F0A500', governance:'#374151'
}

export default function EventsPage() {
  const [cat, setCat]   = useState('all')
  const [view, setView] = useState('grid') // grid | list
  const { data, isLoading } = useQuery('events-page', () => api.get('/events').then(r => r.data))

  const filtered = data?.filter(e => cat === 'all' || e.category === cat)
  const upcoming = filtered?.filter(e => !isPast(new Date(e.startDate))) || []
  const past     = filtered?.filter(e => isPast(new Date(e.startDate)))  || []

  return (
    <div>
      {/* Hero */}
      <div className="page-hero py-20 px-6 text-center">
        <div className="eyebrow justify-center mb-3" style={{color:'rgba(240,165,0,0.9)'}}>
          <span className="w-5 h-0.5 rounded-full inline-block mr-2" style={{background:'#F0A500'}}/>Gatherings
        </div>
        <h1 className="font-display font-bold text-4xl text-white mb-3">Community Events</h1>
        <div className="flex items-center justify-center gap-2 text-sm" style={{color:'rgba(255,255,255,0.6)',fontFamily:'Poppins,sans-serif'}}>
          <Link to="/" className="hover:text-white transition-colors flex items-center gap-1"><i className="fas fa-home text-xs"/>Home</Link>
          <i className="fas fa-chevron-right text-xs" style={{color:'#F0A500'}}/>
          <span style={{color:'#F0A500'}}>Events</span>
        </div>
      </div>

      <section className="py-16" style={{background:'#FAFAFA'}}>
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
                    fontFamily:'Sora,sans-serif',
                    boxShadow: cat===c ? '0 4px 16px rgba(91,45,142,0.3)' : '0 2px 8px rgba(91,45,142,0.07)',
                  }}>
                  {c==='all'?'All Events':c}
                </button>
              ))}
            </div>
            <div className="flex gap-1 p-1 rounded-xl" style={{background:'rgba(91,45,142,0.06)'}}>
              {[['grid','fa-th'],['list','fa-list']].map(([v,ic])=>(
                <button key={v} onClick={()=>setView(v)}
                  className="w-9 h-9 rounded-lg flex items-center justify-center transition-all"
                  style={{background:view===v?'#fff':undefined, boxShadow:view===v?'0 1px 4px rgba(91,45,142,0.12)':undefined, color:view===v?'#5B2D8E':'#A3A3A3'}}>
                  <i className={`fas ${ic} text-sm`}/>
                </button>
              ))}
            </div>
          </div>

          {/* Upcoming */}
          {upcoming.length > 0 && (
            <div className="mb-14">
              <h2 className="font-display font-bold text-xl mb-6 flex items-center gap-2" style={{color:'#1A0A35'}}>
                <span className="w-1 h-6 rounded-full inline-block" style={{background:'linear-gradient(to bottom,#5B2D8E,#F0A500)'}}/>
                Upcoming Events <span className="text-sm font-normal ml-2 px-2 py-0.5 rounded-full" style={{background:'rgba(91,45,142,0.08)',color:'#5B2D8E'}}>{upcoming.length}</span>
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
              <h2 className="font-display font-bold text-xl mb-6 flex items-center gap-2" style={{color:'#737373'}}>
                <span className="w-1 h-6 rounded-full inline-block" style={{background:'#D4D4D4'}}/>
                Past Events <span className="text-sm font-normal ml-2 px-2 py-0.5 rounded-full" style={{background:'rgba(0,0,0,0.05)',color:'#737373'}}>{past.length}</span>
              </h2>
              <div className="grid md:grid-cols-3 gap-6 opacity-70">
                {past.map(e => <EventCard key={e.id} event={e} past/>)}
              </div>
            </div>
          )}

          {!isLoading && !filtered?.length && (
            <div className="text-center py-20 rounded-3xl" style={{background:'rgba(91,45,142,0.03)',border:'1px dashed rgba(91,45,142,0.12)'}}>
              <i className="fas fa-calendar text-5xl mb-4 block" style={{color:'rgba(91,45,142,0.2)'}}/>
              <h3 className="font-display font-bold text-xl mb-2" style={{color:'#1A0A35'}}>No events found</h3>
              <p className="text-sm" style={{color:'#737373',fontFamily:'Poppins,sans-serif'}}>Check back soon — events are added regularly.</p>
            </div>
          )}
        </div>
      </section>
    </div>
  )
}

function EventCard({ event: e, past }) {
  const d = new Date(e.startDate)
  const color = CAT_COLORS[e.category] || '#5B2D8E'
  const isPaid = e.ticketPrice && Number(e.ticketPrice) > 0
  return (
    <Link to={`/events/${e.slug}`} className="card overflow-hidden group block hover:-translate-y-1 transition-transform">
      <div className="h-44 flex items-center justify-center relative overflow-hidden"
        style={{background:`linear-gradient(135deg,${color}22,${color}44)`}}>
        {e.coverImage
          ? <img src={e.coverImage} alt="" className="absolute inset-0 w-full h-full object-cover" />
          : <><div className="wave-pattern absolute inset-0"/><i className="fas fa-calendar-alt text-4xl relative z-10" style={{color:`${color}66`}}/></>
        }
        {/* Date badge */}
        <div className="absolute top-3 left-3 bg-white rounded-2xl px-3 py-2 text-center shadow-card z-10">
          <div className="font-display font-bold text-xl leading-none" style={{color:'#1A0A35'}}>{format(d,'d')}</div>
          <div className="text-[9px] uppercase tracking-wider font-semibold" style={{color}}>{format(d,'MMM')}</div>
        </div>
        <div className="absolute top-3 right-3 flex flex-col gap-1 items-end z-10">
          {e.category && (
            <span className="text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full text-white"
              style={{background:color}}>{e.category}</span>
          )}
          {isPaid
            ? <span className="text-[10px] font-bold px-2.5 py-1 rounded-full" style={{background:'rgba(240,165,0,0.9)',color:'#1A0A35'}}>{Number(e.ticketPrice).toLocaleString()} XAF</span>
            : <span className="text-[10px] font-bold px-2.5 py-1 rounded-full" style={{background:'rgba(22,163,74,0.85)',color:'#fff'}}>Free</span>
          }
        </div>
        {past && (
          <div className="absolute inset-0 flex items-center justify-center bg-white/60 z-20">
            <span className="text-xs font-bold uppercase tracking-widest px-3 py-1.5 rounded-full" style={{background:'rgba(0,0,0,0.1)',color:'#737373'}}>Past Event</span>
          </div>
        )}
      </div>
      <div className="p-5">
        <h3 className="font-display font-semibold text-base mb-2 line-clamp-2 leading-snug" style={{color:'#1A0A35'}}>{e.title}</h3>
        <div className="space-y-1.5 mb-4">
          {e.venue && (
            <div className="flex items-center gap-2 text-xs" style={{color:'#737373',fontFamily:'Poppins,sans-serif'}}>
              <i className="fas fa-map-marker-alt w-4 text-center flex-shrink-0" style={{color}}/>
              {e.venue}
            </div>
          )}
          <div className="flex items-center gap-2 text-xs" style={{color:'#737373',fontFamily:'Poppins,sans-serif'}}>
            <i className="fas fa-clock w-4 text-center flex-shrink-0" style={{color}}/>
            {format(d,'EEEE, MMMM d yyyy · h:mm a')}
          </div>
          {e.isOnline && (
            <div className="flex items-center gap-2 text-xs" style={{color:'#0284c7',fontFamily:'Poppins,sans-serif'}}>
              <i className="fas fa-video w-4 text-center flex-shrink-0"/>Online Event
            </div>
          )}
          {e.registration_count > 0 && (
            <div className="flex items-center gap-2 text-xs" style={{color:'#737373',fontFamily:'Poppins,sans-serif'}}>
              <i className="fas fa-users w-4 text-center flex-shrink-0" style={{color}}/>{e.registration_count} registered
            </div>
          )}
        </div>
        <p className="text-xs line-clamp-2 leading-relaxed mb-4" style={{color:'#737373',fontFamily:'Poppins,sans-serif'}}>{e.description}</p>
        {!past && (
          <div className="btn-secondary w-full justify-center !py-2.5 !text-xs pointer-events-none">
            <i className="fas fa-calendar-plus text-[10px]"/>
            {isPaid ? `Get Ticket · ${Number(e.ticketPrice).toLocaleString()} XAF` : 'Register Now — Free'}
          </div>
        )}
      </div>
    </Link>
  )
}

function EventListRow({ event: e }) {
  const d = new Date(e.startDate)
  const color = CAT_COLORS[e.category] || '#5B2D8E'
  const isPaid = e.ticketPrice && Number(e.ticketPrice) > 0
  return (
    <Link to={`/events/${e.slug}`} className="card flex gap-5 p-5 items-start hover:-translate-y-0.5 transition-transform block">
      <div className="bg-white rounded-2xl px-4 py-3 text-center shadow-card flex-shrink-0" style={{border:`1px solid ${color}22`}}>
        <div className="font-display font-bold text-2xl leading-none" style={{color:'#1A0A35'}}>{format(d,'d')}</div>
        <div className="text-[10px] uppercase tracking-wider font-semibold mt-0.5" style={{color}}>{format(d,'MMM')}</div>
        <div className="text-[9px]" style={{color:'#A3A3A3',fontFamily:'Poppins,sans-serif'}}>{format(d,'yyyy')}</div>
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-1.5 flex-wrap">
          {e.category && <span className="text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full text-white" style={{background:color}}>{e.category}</span>}
          {e.isFeatured && <span className="text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full" style={{background:'rgba(240,165,0,0.1)',color:'#C87800'}}>Featured</span>}
          {isPaid
            ? <span className="text-[10px] font-bold px-2.5 py-1 rounded-full" style={{background:'rgba(240,165,0,0.1)',color:'#C87800'}}>{Number(e.ticketPrice).toLocaleString()} XAF</span>
            : <span className="text-[10px] font-bold px-2.5 py-1 rounded-full" style={{background:'rgba(22,163,74,0.1)',color:'#16a34a'}}>Free</span>
          }
        </div>
        <h3 className="font-display font-semibold text-base mb-2" style={{color:'#1A0A35'}}>{e.title}</h3>
        <p className="text-xs line-clamp-1 mb-2" style={{color:'#737373',fontFamily:'Poppins,sans-serif'}}>{e.description}</p>
        <div className="flex items-center gap-4 text-xs" style={{color:'#A3A3A3',fontFamily:'Poppins,sans-serif'}}>
          {e.venue && <span className="flex items-center gap-1"><i className="fas fa-map-marker-alt" style={{color}}/>{e.venue}</span>}
          <span className="flex items-center gap-1"><i className="fas fa-clock" style={{color}}/>{format(d,'h:mm a')}</span>
          {e.registration_count > 0 && <span className="flex items-center gap-1"><i className="fas fa-users" style={{color}}/>{e.registration_count} going</span>}
        </div>
      </div>
      <div className="btn-secondary !py-2 !px-4 !text-xs flex-shrink-0 pointer-events-none">
        {isPaid ? 'Get Ticket' : 'Register'}
      </div>
    </Link>
  )
}
