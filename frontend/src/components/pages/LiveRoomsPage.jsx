import { useQuery } from 'react-query'
import { Link } from 'react-router-dom'
import { format } from 'date-fns'
import api from '../../services/api'
import { useAuth } from '../../context/AuthContext'

const STATUS_META = {
  scheduled: { label: 'Upcoming',  color: '#0284c7', bg: 'rgba(2,132,199,0.1)',   icon: 'fa-clock'       },
  live:      { label: 'Live Now',  color: '#16a34a', bg: 'rgba(22,163,74,0.12)',  icon: 'fa-circle',     pulse: true },
  ended:     { label: 'Ended',     color: '#737373', bg: 'rgba(115,115,115,0.1)', icon: 'fa-check-circle' },
}

function RoomCard({ room }) {
  const { user } = useAuth()
  const meta = STATUS_META[room.status] || STATUS_META.scheduled

  return (
    <div className="card flex flex-col gap-4 transition-all hover:-translate-y-0.5 hover:shadow-xl">
      <div className="flex items-start justify-between gap-2">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl flex items-center justify-center flex-shrink-0"
            style={{ background: 'linear-gradient(135deg,rgba(91,45,142,0.12),rgba(91,45,142,0.06))' }}>
            <i className="fas fa-video text-base" style={{ color: '#5B2D8E' }}/>
          </div>
          <div>
            <h3 className="font-display font-bold text-base leading-snug" style={{ color: '#1A0A35' }}>{room.name}</h3>
            {room.host && (
              <p className="text-xs" style={{ color: '#A3A3A3', fontFamily: 'Poppins,sans-serif' }}>
                Hosted by {room.host.firstName} {room.host.lastName}
              </p>
            )}
          </div>
        </div>
        <span className="text-[10px] font-bold px-2.5 py-1 rounded-full flex items-center gap-1 flex-shrink-0"
          style={{ background: meta.bg, color: meta.color }}>
          {meta.pulse && <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse"/>}
          {meta.label}
        </span>
      </div>

      {room.description && (
        <p className="text-xs leading-relaxed" style={{ color: '#737373', fontFamily: 'Poppins,sans-serif' }}>
          {room.description}
        </p>
      )}

      <div className="flex flex-wrap gap-3 text-xs" style={{ color: '#A3A3A3', fontFamily: 'Poppins,sans-serif' }}>
        {room.scheduledAt && (
          <span><i className="fas fa-calendar mr-1"/>{format(new Date(room.scheduledAt), 'EEEE, MMMM d · HH:mm')}</span>
        )}
        {room.maxParticipants && (
          <span><i className="fas fa-users mr-1"/>Max {room.maxParticipants} participants</span>
        )}
        {room.isPrivate && <span><i className="fas fa-lock mr-1"/>Private room</span>}
      </div>

      <div className="pt-2 mt-auto border-t" style={{ borderColor: 'rgba(91,45,142,0.06)' }}>
        {room.status === 'ended' ? (
          <div className="text-xs text-center py-2" style={{ color: '#A3A3A3' }}>This meeting has ended</div>
        ) : !user ? (
          <div className="text-center">
            <Link to="/login" className="text-xs font-semibold" style={{ color: '#5B2D8E' }}>
              Log in to join this meeting
            </Link>
          </div>
        ) : (
          <Link to={`/live/${room.slug}`}
            className="flex items-center justify-center gap-2 w-full py-3 rounded-2xl text-sm font-bold text-white transition-all hover:opacity-90"
            style={{ background: room.status === 'live' ? 'linear-gradient(135deg,#16a34a,#15803d)' : 'linear-gradient(135deg,#5B2D8E,#7B4DB8)' }}>
            <i className={`fas ${room.status === 'live' ? 'fa-video' : 'fa-sign-in-alt'}`}/>
            {room.status === 'live' ? 'Join Live Meeting' : 'Enter Room'}
          </Link>
        )}
      </div>
    </div>
  )
}

export default function LiveRoomsPage() {
  const { data: rooms = [], isLoading } = useQuery('live-rooms',
    () => api.get('/rooms').then(r => r.data))

  const liveRooms      = rooms.filter(r => r.status === 'live')
  const scheduledRooms = rooms.filter(r => r.status === 'scheduled')

  return (
    <div style={{ background: '#F9F7FD', minHeight: '100vh' }}>
      {/* Hero */}
      <div className="relative py-20 overflow-hidden" style={{ background: 'linear-gradient(135deg,#1A0A35,#250F47)' }}>
        <div className="wave-pattern absolute inset-0 opacity-20"/>
        <div className="relative max-w-4xl mx-auto px-6 text-center">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full mb-5"
            style={{ background: 'rgba(240,165,0,0.15)', border: '1px solid rgba(240,165,0,0.25)' }}>
            <i className="fas fa-video text-xs" style={{ color: '#F0A500' }}/>
            <span className="text-xs font-bold uppercase tracking-widest" style={{ color: '#F0A500', fontFamily: 'Sora,sans-serif' }}>
              Live Meetings
            </span>
          </div>
          <h1 className="font-display font-bold text-4xl md:text-5xl text-white mb-4">
            Community <span style={{ color: '#F0A500' }}>Meetings</span>
          </h1>
          <p className="text-base max-w-xl mx-auto" style={{ color: 'rgba(255,255,255,0.65)', fontFamily: 'Poppins,sans-serif' }}>
            Attend live council meetings, town halls, and community gatherings — anywhere in the world.
          </p>
          {liveRooms.length > 0 && (
            <div className="inline-flex items-center gap-2 mt-5 px-4 py-2 rounded-full"
              style={{ background: 'rgba(22,163,74,0.2)', border: '1px solid rgba(22,163,74,0.3)' }}>
              <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse"/>
              <span className="text-sm font-semibold" style={{ color: '#86efac' }}>
                {liveRooms.length} meeting{liveRooms.length > 1 ? 's' : ''} live now
              </span>
            </div>
          )}
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-6 py-10">
        {isLoading ? (
          <div className="grid md:grid-cols-2 gap-5">
            {[1,2,3,4].map(i => <div key={i} className="h-48 rounded-3xl animate-pulse" style={{ background: 'rgba(91,45,142,0.05)' }}/>)}
          </div>
        ) : !rooms.length ? (
          <div className="text-center py-24 rounded-3xl"
            style={{ background: 'rgba(91,45,142,0.02)', border: '1px dashed rgba(91,45,142,0.12)' }}>
            <i className="fas fa-video text-5xl mb-4 block" style={{ color: 'rgba(91,45,142,0.18)' }}/>
            <h3 className="font-display font-bold text-xl mb-2" style={{ color: '#1A0A35' }}>No meetings scheduled</h3>
            <p className="text-sm" style={{ color: '#737373', fontFamily: 'Poppins,sans-serif' }}>
              Upcoming community meetings will appear here.
            </p>
          </div>
        ) : (
          <>
            {liveRooms.length > 0 && (
              <div className="mb-10">
                <div className="flex items-center gap-2 mb-5">
                  <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"/>
                  <h2 className="font-display font-bold text-xl" style={{ color: '#1A0A35' }}>Happening Now</h2>
                </div>
                <div className="grid md:grid-cols-2 gap-5">
                  {liveRooms.map(r => <RoomCard key={r.id} room={r}/>)}
                </div>
              </div>
            )}
            {scheduledRooms.length > 0 && (
              <div>
                <h2 className="font-display font-bold text-xl mb-5" style={{ color: '#1A0A35' }}>Upcoming</h2>
                <div className="grid md:grid-cols-2 gap-5">
                  {scheduledRooms.map(r => <RoomCard key={r.id} room={r}/>)}
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  )
}
