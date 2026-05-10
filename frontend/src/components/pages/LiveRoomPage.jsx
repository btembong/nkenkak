import { useState, useEffect, useRef } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import { useQuery } from 'react-query'
import api from '../../services/api'
import { useAuth } from '../../context/AuthContext'

export default function LiveRoomPage() {
  const { slug } = useParams()
  const { user }  = useAuth()
  const navigate  = useNavigate()
  const [joining,  setJoining]  = useState(false)
  const [joined,   setJoined]   = useState(false)
  const [roomInfo, setRoomInfo] = useState(null)
  const [error,    setError]    = useState(null)
  const iframeRef = useRef(null)

  const { data: room, isLoading: roomLoading, error: roomError } = useQuery(
    ['live-room', slug],
    () => api.get(`/rooms/${slug}`).then(r => r.data),
    { retry: false }
  )

  const handleJoin = async () => {
    if (!user) { navigate('/login'); return }
    setJoining(true)
    setError(null)
    try {
      const data = await api.post(`/rooms/${slug}/join`).then(r => r.data)
      setRoomInfo(data)
      setJoined(true)
    } catch (e) {
      setError(e.response?.data?.error || 'Failed to join room')
    } finally {
      setJoining(false)
    }
  }

  // Build Daily.co iframe URL with meeting token
  const iframeUrl = roomInfo?.url
    ? roomInfo.token
      ? `${roomInfo.url}?t=${roomInfo.token}&userName=${encodeURIComponent(`${user?.firstName ?? ''} ${user?.lastName ?? ''}`.trim())}`
      : roomInfo.url
    : null

  if (roomLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: '#1A0A35' }}>
        <div className="w-10 h-10 rounded-full border-4 animate-spin"
          style={{ borderColor: 'rgba(255,255,255,0.1)', borderTopColor: '#F0A500' }}/>
      </div>
    )
  }

  if (roomError || !room) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: '#1A0A35' }}>
        <div className="text-center">
          <i className="fas fa-video-slash text-5xl mb-4 block" style={{ color: 'rgba(255,255,255,0.2)' }}/>
          <h2 className="font-display font-bold text-2xl mb-2 text-white">Room not found</h2>
          <p className="text-sm mb-6" style={{ color: 'rgba(255,255,255,0.4)', fontFamily: 'Poppins,sans-serif' }}>
            This meeting room does not exist or has been removed.
          </p>
          <Link to="/live" className="btn-secondary">Back to Meetings</Link>
        </div>
      </div>
    )
  }

  return (
    <div style={{ background: '#1A0A35', minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      {/* Top bar */}
      <div className="flex items-center justify-between px-6 py-3 flex-shrink-0"
        style={{ borderBottom: '1px solid rgba(255,255,255,0.08)' }}>
        <div className="flex items-center gap-3">
          <Link to="/live" className="flex items-center gap-1.5 text-xs font-semibold hover:opacity-80 transition-opacity"
            style={{ color: 'rgba(255,255,255,0.6)' }}>
            <i className="fas fa-arrow-left text-xs"/>Back
          </Link>
          <div className="w-px h-4 opacity-20" style={{ background: '#fff' }}/>
          <div>
            <div className="text-sm font-semibold text-white">{room?.name || slug}</div>
            {room?.status === 'live' && (
              <div className="flex items-center gap-1.5 text-[10px]" style={{ color: '#86efac' }}>
                <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse"/>Live
              </div>
            )}
          </div>
        </div>
        <div className="flex items-center gap-3 text-xs" style={{ color: 'rgba(255,255,255,0.5)', fontFamily: 'Poppins,sans-serif' }}>
          {user && <span>{user.firstName} {user.lastName}</span>}
        </div>
      </div>

      {/* Main area */}
      <div className="flex-1 flex flex-col items-center justify-center p-6">
        {!joined ? (
          <div className="text-center max-w-md">
            {/* Room icon */}
            <div className="w-24 h-24 rounded-3xl flex items-center justify-center mx-auto mb-6"
              style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)' }}>
              <i className="fas fa-video text-4xl" style={{ color: '#F0A500' }}/>
            </div>

            <h1 className="font-display font-bold text-3xl text-white mb-2">{room?.name || 'Meeting Room'}</h1>
            {room?.description && (
              <p className="text-sm mb-4" style={{ color: 'rgba(255,255,255,0.55)', fontFamily: 'Poppins,sans-serif' }}>
                {room.description}
              </p>
            )}
            {room?.host && (
              <p className="text-xs mb-6" style={{ color: 'rgba(255,255,255,0.4)', fontFamily: 'Poppins,sans-serif' }}>
                Hosted by {room.host.firstName} {room.host.lastName}
              </p>
            )}

            {error && (
              <div className="mb-5 px-4 py-3 rounded-xl text-xs" style={{ background: 'rgba(220,38,38,0.15)', color: '#fca5a5', fontFamily: 'Poppins,sans-serif' }}>
                <i className="fas fa-exclamation-circle mr-2"/>{error}
              </div>
            )}

            {room?.status === 'ended' ? (
              <div className="px-6 py-4 rounded-2xl text-sm" style={{ background: 'rgba(255,255,255,0.06)', color: 'rgba(255,255,255,0.5)', fontFamily: 'Poppins,sans-serif' }}>
                This meeting has ended
              </div>
            ) : !user ? (
              <div className="space-y-3">
                <p className="text-sm mb-4" style={{ color: 'rgba(255,255,255,0.55)', fontFamily: 'Poppins,sans-serif' }}>
                  You must be logged in to join this meeting
                </p>
                <Link to={`/login?redirect=/live/${slug}`}
                  className="flex items-center justify-center gap-2 w-full py-3.5 rounded-2xl text-sm font-bold"
                  style={{ background: 'linear-gradient(135deg,#F0A500,#FFB84D)', color: '#1A0A35' }}>
                  <i className="fas fa-sign-in-alt"/>Log in to Join
                </Link>
              </div>
            ) : (
              <div className="space-y-3">
                {/* Camera/mic permission notice */}
                <div className="px-4 py-3 rounded-xl text-xs mb-4"
                  style={{ background: 'rgba(255,255,255,0.06)', color: 'rgba(255,255,255,0.5)', fontFamily: 'Poppins,sans-serif' }}>
                  <i className="fas fa-info-circle mr-2"/>Your browser will ask for camera and microphone permission
                </div>
                <button onClick={handleJoin} disabled={joining}
                  className="flex items-center justify-center gap-2 w-full py-4 rounded-2xl text-base font-bold transition-all hover:opacity-90 disabled:opacity-50"
                  style={{ background: 'linear-gradient(135deg,#5B2D8E,#7B4DB8)', color: '#fff', boxShadow: '0 8px 32px rgba(91,45,142,0.4)' }}>
                  {joining
                    ? <><i className="fas fa-spinner animate-spin"/>Joining…</>
                    : <><i className="fas fa-video"/>Join Meeting</>}
                </button>
              </div>
            )}
          </div>
        ) : iframeUrl ? (
          <div className="w-full max-w-6xl flex-1 flex flex-col" style={{ minHeight: '600px' }}>
            <iframe
              ref={iframeRef}
              src={iframeUrl}
              allow="microphone; camera; fullscreen; display-capture; autoplay"
              className="w-full flex-1 rounded-2xl"
              style={{ minHeight: '600px', border: 'none', background: '#000' }}
              title={room?.name || 'Live Meeting'}
            />
          </div>
        ) : (
          <div className="text-center">
            <div className="mb-6 px-4 py-3 rounded-xl text-xs"
              style={{ background: 'rgba(220,38,38,0.15)', color: '#fca5a5', fontFamily: 'Poppins,sans-serif' }}>
              <i className="fas fa-exclamation-circle mr-2"/>
              Meeting room URL is not configured. Contact the administrator.
            </div>
            <Link to="/live" className="btn-secondary">Back to Meetings</Link>
          </div>
        )}
      </div>
    </div>
  )
}
