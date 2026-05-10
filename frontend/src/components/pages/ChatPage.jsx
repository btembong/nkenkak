import { useState, useEffect, useRef } from 'react'
import { useQuery } from 'react-query'
import { io } from 'socket.io-client'
import { format } from 'date-fns'
import { Link } from 'react-router-dom'
import api from '../../services/api'
import { useAuth } from '../../context/AuthContext'

const SOCKET_URL = import.meta.env.VITE_API_URL?.replace('/api','') || 'http://localhost:5000'

const ROOM_COLORS = ['#5B2D8E','#F0A500','#16a34a','#0284c7','#dc2626','#7B4DB8']

function RoomCard({ room, onClick, active }) {
  return (
    <button onClick={onClick} className="w-full text-left flex items-center gap-3 px-4 py-3 rounded-2xl transition-all hover:-translate-y-0.5"
      style={{ background: active ? room.color + '18' : 'rgba(91,45,142,0.04)', border: `1px solid ${active ? room.color + '40' : 'transparent'}` }}>
      <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
        style={{ background: room.color + '18' }}>
        <i className={`fas ${room.icon || 'fa-comments'} text-sm`} style={{ color: room.color }}/>
      </div>
      <div className="flex-1 min-w-0">
        <div className="font-semibold text-sm truncate" style={{ color: '#1A0A35', fontFamily: 'Sora,sans-serif' }}>{room.name}</div>
        {room.description && <div className="text-xs truncate" style={{ color: '#A3A3A3', fontFamily: 'Poppins,sans-serif' }}>{room.description}</div>}
      </div>
      <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full flex-shrink-0" style={{ background: 'rgba(91,45,142,0.08)', color: '#5B2D8E' }}>
        {room._count?.messages || 0}
      </span>
    </button>
  )
}

function MessageBubble({ msg, isOwn }) {
  const name = msg.user ? `${msg.user.firstName} ${msg.user.lastName}` : (msg.guestName || 'Guest')
  const initials = name.split(' ').map(n => n[0]).join('').slice(0,2).toUpperCase()
  const isAdminUser = msg.user?.role === 'admin' || msg.user?.role === 'leader'

  return (
    <div className={`flex gap-2.5 ${isOwn ? 'flex-row-reverse justify-start' : 'justify-start'}`}>
      {/* Avatar */}
      <div className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 text-white text-xs font-bold self-end"
        style={{ background: isOwn ? 'linear-gradient(135deg,#5B2D8E,#7B4DB8)' : 'linear-gradient(135deg,#F0A500,#FFB84D)' }}>
        {msg.user?.avatarUrl
          ? <img src={msg.user.avatarUrl} className="w-full h-full rounded-full object-cover" alt={name}/>
          : initials}
      </div>

      {/* Bubble + meta */}
      <div className={`flex flex-col gap-1 max-w-[68%] ${isOwn ? 'items-end' : 'items-start'}`}>
        {/* Meta row */}
        <div className={`flex items-center gap-1.5 ${isOwn ? 'flex-row-reverse' : ''}`}>
          <span className="text-[11px] font-semibold" style={{ color: '#737373', fontFamily: 'Poppins,sans-serif' }}>
            {isOwn ? 'You' : name}
          </span>
          {isAdminUser && (
            <span className="text-[9px] font-bold px-1.5 py-0.5 rounded-full" style={{ background: 'rgba(91,45,142,0.12)', color: '#5B2D8E' }}>Admin</span>
          )}
          <span className="text-[10px]" style={{ color: '#C4C4C4' }}>{format(new Date(msg.createdAt), 'HH:mm')}</span>
        </div>

        {/* Message bubble */}
        <div className="px-4 py-2.5 text-sm leading-relaxed break-words"
          style={{
            background: isOwn ? 'linear-gradient(135deg,#5B2D8E,#7B4DB8)' : '#fff',
            color: isOwn ? '#fff' : '#1A0A35',
            fontFamily: 'Poppins,sans-serif',
            boxShadow: '0 2px 8px rgba(91,45,142,0.08)',
            borderRadius: isOwn ? '16px 4px 16px 16px' : '4px 16px 16px 16px',
          }}>
          {msg.isDeleted
            ? <em style={{ color: isOwn ? 'rgba(255,255,255,0.6)' : '#A3A3A3' }}>[message removed]</em>
            : msg.content}
        </div>
      </div>
    </div>
  )
}

export default function ChatPage() {
  const { user } = useAuth()
  const [activeRoom, setActiveRoom] = useState(null)
  const [messages, setMessages]     = useState([])
  const [input, setInput]           = useState('')
  const [guestName, setGuestName]   = useState('')
  const [typing, setTyping]         = useState(null)
  const [socket, setSocket]         = useState(null)
  const [connected, setConnected]   = useState(false)
  const bottomRef = useRef(null)
  const typingTimer = useRef(null)

  const { data: rooms = [] } = useQuery('chat-rooms', () => api.get('/chat/rooms').then(r => r.data))

  // Init socket
  useEffect(() => {
    const token = localStorage.getItem('refreshToken') || localStorage.getItem('accessToken')
    const s = io(SOCKET_URL, { auth: { token }, transports: ['websocket','polling'] })
    s.on('connect',    () => setConnected(true))
    s.on('disconnect', () => setConnected(false))
    setSocket(s)
    if (user) s.emit('join_dm')
    return () => s.disconnect()
  }, [user])

  // Join room
  useEffect(() => {
    if (!socket || !activeRoom) return
    socket.emit('join_room', activeRoom.slug)
    // Load history
    api.get(`/chat/rooms/${activeRoom.slug}/messages`).then(r => setMessages(r.data.messages))
    return () => socket.emit('leave_room', activeRoom.slug)
  }, [socket, activeRoom])

  // Listen for new messages
  useEffect(() => {
    if (!socket) return
    const onMsg = (msg) => setMessages(prev => [...prev, msg])
    const onTyping = ({ name }) => { setTyping(name); clearTimeout(typingTimer.current); typingTimer.current = setTimeout(() => setTyping(null), 3000) }
    const onStopTyping = () => setTyping(null)
    socket.on('new_message', onMsg)
    socket.on('user_typing', onTyping)
    socket.on('user_stop_typing', onStopTyping)
    return () => { socket.off('new_message', onMsg); socket.off('user_typing', onTyping); socket.off('user_stop_typing', onStopTyping) }
  }, [socket])

  // Auto scroll
  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: 'smooth' }) }, [messages])

  const sendMessage = () => {
    if (!input.trim() || !socket || !activeRoom) return
    if (!user && !guestName.trim()) return
    socket.emit('send_message', { roomSlug: activeRoom.slug, content: input.trim(), guestName: guestName || undefined })
    setInput('')
  }

  const onType = (val) => {
    setInput(val)
    if (!socket || !activeRoom) return
    socket.emit('typing', { roomSlug: activeRoom.slug, name: user ? `${user.firstName}` : guestName || 'Guest' })
    clearTimeout(typingTimer.current)
    typingTimer.current = setTimeout(() => socket.emit('stop_typing', { roomSlug: activeRoom.slug }), 1500)
  }

  return (
    <div style={{ background: '#F9F7FD', minHeight: '100vh' }}>
      {/* Hero */}
      <div className="relative py-14 overflow-hidden" style={{ background: 'linear-gradient(135deg,#1A0A35,#250F47)' }}>
        <div className="wave-pattern absolute inset-0 opacity-20"/>
        <div className="relative max-w-5xl mx-auto px-6 text-center">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full mb-4" style={{ background: 'rgba(240,165,0,0.15)', border: '1px solid rgba(240,165,0,0.25)' }}>
            <i className="fas fa-comments text-xs" style={{ color: '#F0A500' }}/>
            <span className="text-xs font-bold uppercase tracking-widest" style={{ color: '#F0A500', fontFamily: 'Sora,sans-serif' }}>Community Chat</span>
          </div>
          <h1 className="font-display font-bold text-3xl md:text-4xl text-white mb-3">Connect with Your Community</h1>
          <p className="text-sm max-w-lg mx-auto" style={{ color: 'rgba(255,255,255,0.65)', fontFamily: 'Poppins,sans-serif' }}>Real-time conversations with Nkenkak-Ngiesang members worldwide</p>
          <div className={`inline-flex items-center gap-1.5 mt-4 text-xs font-semibold px-3 py-1.5 rounded-full ${connected ? '' : 'opacity-60'}`}
            style={{ background: connected ? 'rgba(22,163,74,0.2)' : 'rgba(255,255,255,0.1)', color: connected ? '#86efac' : '#fff' }}>
            <div className={`w-1.5 h-1.5 rounded-full ${connected ? 'bg-green-400' : 'bg-gray-400'}`}/>
            {connected ? 'Connected' : 'Connecting…'}
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 py-8">
        <div className="grid lg:grid-cols-4 gap-6 h-[600px]">
          {/* Room list */}
          <div className="lg:col-span-1 flex flex-col gap-2 overflow-y-auto">
            <div className="text-xs font-bold uppercase tracking-widest mb-2 px-1" style={{ color: '#A3A3A3', fontFamily: 'Sora,sans-serif' }}>Chat Rooms</div>
            {rooms.map(r => <RoomCard key={r.id} room={r} active={activeRoom?.id === r.id} onClick={() => { setActiveRoom(r); setMessages([]) }}/>)}
            {!rooms.length && <div className="text-center py-10 text-xs" style={{ color: '#A3A3A3' }}>No rooms yet</div>}
          </div>

          {/* Chat area */}
          <div className="lg:col-span-3 flex flex-col rounded-3xl overflow-hidden" style={{ background: '#fff', boxShadow: '0 4px 24px rgba(91,45,142,0.08)' }}>
            {!activeRoom ? (
              <div className="flex-1 flex flex-col items-center justify-center gap-4 p-10">
                <div className="w-16 h-16 rounded-2xl flex items-center justify-center" style={{ background: 'rgba(91,45,142,0.08)' }}>
                  <i className="fas fa-comments text-2xl" style={{ color: '#5B2D8E' }}/>
                </div>
                <div className="text-center">
                  <div className="font-display font-bold text-lg mb-1" style={{ color: '#1A0A35' }}>Select a room to start chatting</div>
                  <div className="text-xs" style={{ color: '#A3A3A3', fontFamily: 'Poppins,sans-serif' }}>Choose a chat room from the left</div>
                </div>
              </div>
            ) : (
              <>
                {/* Room header */}
                <div className="flex items-center gap-3 px-5 py-4 border-b" style={{ borderColor: 'rgba(91,45,142,0.06)' }}>
                  <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ background: activeRoom.color + '18' }}>
                    <i className={`fas ${activeRoom.icon || 'fa-comments'} text-sm`} style={{ color: activeRoom.color }}/>
                  </div>
                  <div>
                    <div className="font-display font-bold text-sm" style={{ color: '#1A0A35' }}>{activeRoom.name}</div>
                    {activeRoom.description && <div className="text-xs" style={{ color: '#A3A3A3', fontFamily: 'Poppins,sans-serif' }}>{activeRoom.description}</div>}
                  </div>
                </div>

                {/* Messages */}
                <div className="flex-1 overflow-y-auto p-5 space-y-4">
                  {messages.map(msg => (
                    <MessageBubble key={msg.id} msg={msg} isOwn={user && msg.userId === user.id}/>
                  ))}
                  {typing && (
                    <div className="flex items-center gap-2 text-xs" style={{ color: '#A3A3A3', fontFamily: 'Poppins,sans-serif' }}>
                      <div className="flex gap-1">
                        {[0,1,2].map(i => <div key={i} className="w-1.5 h-1.5 rounded-full bg-gray-300 animate-bounce" style={{ animationDelay: `${i*0.15}s` }}/>)}
                      </div>
                      {typing} is typing…
                    </div>
                  )}
                  <div ref={bottomRef}/>
                </div>

                {/* Guest name input (if not logged in) */}
                {!user && (
                  <div className="px-4 pt-3 pb-0">
                    <input value={guestName} onChange={e => setGuestName(e.target.value)} placeholder="Your display name…" maxLength={40}
                      className="w-full px-4 py-2 rounded-xl text-sm outline-none" style={{ background: 'rgba(91,45,142,0.05)', border: '1px solid rgba(91,45,142,0.1)', color: '#1A0A35', fontFamily: 'Poppins,sans-serif' }}/>
                  </div>
                )}

                {/* Input */}
                <div className="flex gap-2 p-4">
                  <input value={input} onChange={e => onType(e.target.value)}
                    onKeyDown={e => e.key === 'Enter' && !e.shiftKey && (e.preventDefault(), sendMessage())}
                    placeholder={user ? 'Type a message…' : 'Type a message (Enter to send)…'}
                    className="flex-1 px-4 py-2.5 rounded-2xl text-sm outline-none"
                    style={{ background: 'rgba(91,45,142,0.05)', border: '1px solid rgba(91,45,142,0.1)', color: '#1A0A35', fontFamily: 'Poppins,sans-serif' }}/>
                  <button onClick={sendMessage} disabled={!input.trim()}
                    className="w-10 h-10 rounded-xl flex items-center justify-center transition-all hover:scale-105 disabled:opacity-30"
                    style={{ background: 'linear-gradient(135deg,#5B2D8E,#7B4DB8)' }}>
                    <i className="fas fa-paper-plane text-sm text-white"/>
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
        {!user && (
          <p className="text-center text-xs mt-4" style={{ color: '#A3A3A3', fontFamily: 'Poppins,sans-serif' }}>
            <Link to="/login" className="font-semibold" style={{ color: '#5B2D8E' }}>Log in</Link> to chat with your full profile
          </p>
        )}
      </div>
    </div>
  )
}
