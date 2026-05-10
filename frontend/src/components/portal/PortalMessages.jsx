import { useState, useEffect, useRef } from 'react'
import { useQuery, useMutation, useQueryClient } from 'react-query'
import { useSearchParams } from 'react-router-dom'
import { format } from 'date-fns'
import api from '../../services/api'
import { useAuth } from '../../context/AuthContext'

function ConversationItem({ conv, active, onClick }) {
  const partner = conv.partner
  const initials = `${partner.firstName?.[0] || ''}${partner.lastName?.[0] || ''}`.toUpperCase()
  return (
    <button onClick={onClick}
      className="w-full text-left flex items-center gap-3 px-4 py-3 rounded-2xl transition-all hover:bg-primary-50"
      style={{ background: active ? 'rgba(91,45,142,0.08)' : 'transparent', border: `1px solid ${active ? 'rgba(91,45,142,0.2)' : 'transparent'}` }}>
      <div className="relative flex-shrink-0">
        <div className="w-10 h-10 rounded-full flex items-center justify-center text-white text-xs font-bold"
          style={{ background: 'linear-gradient(135deg,#5B2D8E,#7B4DB8)' }}>
          {partner.avatarUrl ? <img src={partner.avatarUrl} className="w-full h-full rounded-full object-cover" alt={initials}/> : initials}
        </div>
        {conv.unreadCount > 0 && (
          <span className="absolute -top-0.5 -right-0.5 w-4 h-4 rounded-full text-[9px] font-bold text-white flex items-center justify-center"
            style={{ background: '#F0A500' }}>
            {conv.unreadCount > 9 ? '9+' : conv.unreadCount}
          </span>
        )}
      </div>
      <div className="flex-1 min-w-0">
        <div className="font-semibold text-sm truncate" style={{ color: '#1A0A35', fontFamily: 'Sora,sans-serif' }}>
          {partner.firstName} {partner.lastName}
        </div>
        <div className="text-xs truncate" style={{ color: '#A3A3A3', fontFamily: 'Poppins,sans-serif' }}>
          {conv.lastMessage?.content || 'No messages yet'}
        </div>
      </div>
      {conv.lastMessage && (
        <div className="text-[10px] flex-shrink-0" style={{ color: '#C4C4C4', fontFamily: 'Poppins,sans-serif' }}>
          {format(new Date(conv.lastMessage.createdAt), 'HH:mm')}
        </div>
      )}
    </button>
  )
}

function MessageBubble({ msg, isOwn }) {
  return (
    <div className={`flex gap-2 ${isOwn ? 'flex-row-reverse' : ''}`}>
      <div className={`max-w-[75%] flex flex-col ${isOwn ? 'items-end' : 'items-start'} gap-1`}>
        <div className="px-4 py-2.5 rounded-2xl text-sm leading-relaxed"
          style={{
            background: isOwn ? 'linear-gradient(135deg,#5B2D8E,#7B4DB8)' : '#fff',
            color: isOwn ? '#fff' : '#1A0A35',
            fontFamily: 'Poppins,sans-serif',
            boxShadow: '0 2px 8px rgba(91,45,142,0.08)',
            borderRadius: isOwn ? '16px 4px 16px 16px' : '4px 16px 16px 16px',
          }}>
          {msg.isDeleted ? <em style={{ opacity: 0.6 }}>[message removed]</em> : msg.content}
        </div>
        <div className="text-[10px]" style={{ color: '#C4C4C4', fontFamily: 'Poppins,sans-serif' }}>
          {format(new Date(msg.createdAt), 'HH:mm')}
          {isOwn && msg.isRead && <i className="fas fa-check-double ml-1" style={{ color: '#5B2D8E' }}/>}
        </div>
      </div>
    </div>
  )
}

function NewMessageModal({ onClose, onSelect }) {
  const [search, setSearch] = useState('')
  const { data: members = [], isLoading } = useQuery(
    ['member-search', search],
    () => api.get('/users/directory', { params: { search, limit: 10 } }).then(r => r.data.members || r.data),
    { enabled: search.length >= 2 }
  )

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: 'rgba(26,10,53,0.8)', backdropFilter: 'blur(8px)' }}
      onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="bg-white rounded-3xl w-full max-w-md" style={{ boxShadow: '0 32px 80px rgba(26,10,53,0.25)' }}>
        <div className="px-6 pt-5 pb-4 border-b" style={{ borderColor: 'rgba(91,45,142,0.08)' }}>
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-display font-bold text-lg" style={{ color: '#1A0A35' }}>New Message</h3>
            <button onClick={onClose} className="w-8 h-8 rounded-full flex items-center justify-center hover:bg-gray-100"
              style={{ color: '#A3A3A3' }}>
              <i className="fas fa-times text-sm"/>
            </button>
          </div>
          <input value={search} onChange={e => setSearch(e.target.value)}
            placeholder="Search members by name…"
            className="w-full px-4 py-2.5 rounded-2xl text-sm outline-none"
            style={{ background: 'rgba(91,45,142,0.05)', border: '1px solid rgba(91,45,142,0.1)', color: '#1A0A35', fontFamily: 'Poppins,sans-serif' }}
            autoFocus/>
        </div>
        <div className="p-3 max-h-72 overflow-y-auto">
          {search.length < 2 ? (
            <p className="text-center text-xs py-8" style={{ color: '#A3A3A3', fontFamily: 'Poppins,sans-serif' }}>
              Type at least 2 characters to search
            </p>
          ) : isLoading ? (
            <div className="space-y-2">{[1,2,3].map(i => <div key={i} className="h-12 rounded-xl animate-pulse" style={{ background: 'rgba(91,45,142,0.05)' }}/>)}</div>
          ) : !members.length ? (
            <p className="text-center text-xs py-8" style={{ color: '#A3A3A3', fontFamily: 'Poppins,sans-serif' }}>No members found</p>
          ) : (
            members.map(m => (
              <button key={m.id} onClick={() => onSelect(m)}
                className="w-full flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-primary-50 transition-all text-left">
                <div className="w-9 h-9 rounded-full flex items-center justify-center text-white text-xs font-bold flex-shrink-0"
                  style={{ background: 'linear-gradient(135deg,#5B2D8E,#7B4DB8)' }}>
                  {m.firstName?.[0]}{m.lastName?.[0]}
                </div>
                <div>
                  <div className="text-sm font-semibold" style={{ color: '#1A0A35' }}>{m.firstName} {m.lastName}</div>
                  <div className="text-xs" style={{ color: '#A3A3A3', fontFamily: 'Poppins,sans-serif' }}>{m.village || m.country || ''}</div>
                </div>
              </button>
            ))
          )}
        </div>
      </div>
    </div>
  )
}

export default function PortalMessages() {
  const { user } = useAuth()
  const qc = useQueryClient()
  const [searchParams] = useSearchParams()
  const [activePartner, setActivePartner] = useState(null)
  const [input, setInput] = useState('')
  const [showNewMsg, setShowNewMsg] = useState(false)
  const bottomRef = useRef(null)

  // Deep-link: ?partner=userId — auto-open that conversation
  useEffect(() => {
    const partnerId = searchParams.get('partner')
    if (!partnerId || !conversations.length) return
    const conv = conversations.find(c => c.partner.id === partnerId)
    if (conv) setActivePartner(conv.partner)
    else {
      // Partner not yet in conversations — fetch their profile
      api.get(`/users/${partnerId}`).then(r => setActivePartner(r.data)).catch(() => {})
    }
  }, [searchParams, conversations])

  const { data: conversations = [], isLoading: convsLoading } = useQuery(
    'dm-conversations',
    () => api.get('/messages/conversations').then(r => r.data),
    { refetchInterval: 15000 }
  )

  const { data: thread = [], isLoading: threadLoading } = useQuery(
    ['dm-thread', activePartner?.id],
    () => api.get(`/messages/${activePartner.id}`).then(r => r.data),
    { enabled: !!activePartner, refetchInterval: 10000 }
  )

  const sendMut = useMutation(
    content => api.post(`/messages/${activePartner.id}`, { content }),
    {
      onSuccess: () => {
        qc.invalidateQueries(['dm-thread', activePartner?.id])
        qc.invalidateQueries('dm-conversations')
        setInput('')
      },
      onError: e => console.error(e),
    }
  )

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [thread])

  const handleSend = () => {
    if (!input.trim() || !activePartner) return
    sendMut.mutate(input.trim())
  }

  const handleSelectPartner = (partner) => {
    setActivePartner(partner)
    setShowNewMsg(false)
    // Mark as read after slight delay
    setTimeout(() => qc.invalidateQueries('dm-conversations'), 1000)
  }

  return (
    <div className="h-[calc(100vh-10rem)] flex rounded-3xl overflow-hidden"
      style={{ background: '#fff', boxShadow: '0 4px 24px rgba(91,45,142,0.08)' }}>
      {/* Sidebar */}
      <div className="w-72 flex-shrink-0 flex flex-col border-r" style={{ borderColor: 'rgba(91,45,142,0.06)' }}>
        <div className="px-5 py-4 border-b flex items-center justify-between"
          style={{ borderColor: 'rgba(91,45,142,0.06)' }}>
          <div>
            <h2 className="font-display font-bold text-base" style={{ color: '#1A0A35' }}>Messages</h2>
            <p className="text-xs" style={{ color: '#A3A3A3', fontFamily: 'Poppins,sans-serif' }}>
              {conversations.length} conversation{conversations.length !== 1 ? 's' : ''}
            </p>
          </div>
          <button onClick={() => setShowNewMsg(true)}
            className="w-9 h-9 rounded-xl flex items-center justify-center transition-all hover:scale-105"
            style={{ background: 'linear-gradient(135deg,#5B2D8E,#7B4DB8)', color: '#fff' }}>
            <i className="fas fa-edit text-sm"/>
          </button>
        </div>
        <div className="flex-1 overflow-y-auto p-3 space-y-1">
          {convsLoading ? (
            <div className="space-y-2">{[1,2,3,4].map(i => <div key={i} className="h-16 rounded-2xl animate-pulse" style={{ background: 'rgba(91,45,142,0.05)' }}/>)}</div>
          ) : !conversations.length ? (
            <div className="text-center py-12">
              <i className="fas fa-comment-dots text-4xl mb-3 block" style={{ color: 'rgba(91,45,142,0.18)' }}/>
              <p className="text-xs" style={{ color: '#A3A3A3', fontFamily: 'Poppins,sans-serif' }}>No conversations yet</p>
              <button onClick={() => setShowNewMsg(true)} className="mt-3 text-xs font-semibold" style={{ color: '#5B2D8E' }}>
                Start one
              </button>
            </div>
          ) : (
            conversations.map(conv => (
              <ConversationItem
                key={conv.partner.id}
                conv={conv}
                active={activePartner?.id === conv.partner.id}
                onClick={() => handleSelectPartner(conv.partner)}
              />
            ))
          )}
        </div>
      </div>

      {/* Chat area */}
      <div className="flex-1 flex flex-col">
        {!activePartner ? (
          <div className="flex-1 flex flex-col items-center justify-center gap-4 p-10">
            <div className="w-16 h-16 rounded-2xl flex items-center justify-center"
              style={{ background: 'rgba(91,45,142,0.08)' }}>
              <i className="fas fa-comment-dots text-2xl" style={{ color: '#5B2D8E' }}/>
            </div>
            <div className="text-center">
              <div className="font-display font-bold text-lg mb-1" style={{ color: '#1A0A35' }}>
                Select a conversation
              </div>
              <div className="text-sm mb-4" style={{ color: '#A3A3A3', fontFamily: 'Poppins,sans-serif' }}>
                Or start a new message with a community member
              </div>
              <button onClick={() => setShowNewMsg(true)} className="btn-secondary !text-sm">
                <i className="fas fa-edit"/>New Message
              </button>
            </div>
          </div>
        ) : (
          <>
            {/* Header */}
            <div className="flex items-center gap-3 px-5 py-4 border-b" style={{ borderColor: 'rgba(91,45,142,0.06)' }}>
              <div className="w-9 h-9 rounded-full flex items-center justify-center text-white text-xs font-bold flex-shrink-0"
                style={{ background: 'linear-gradient(135deg,#5B2D8E,#7B4DB8)' }}>
                {activePartner.avatarUrl
                  ? <img src={activePartner.avatarUrl} className="w-full h-full rounded-full object-cover" alt=""/>
                  : `${activePartner.firstName?.[0]}${activePartner.lastName?.[0]}`}
              </div>
              <div>
                <div className="font-display font-bold text-sm" style={{ color: '#1A0A35' }}>
                  {activePartner.firstName} {activePartner.lastName}
                </div>
                <div className="text-xs capitalize" style={{ color: '#A3A3A3', fontFamily: 'Poppins,sans-serif' }}>
                  {activePartner.role || 'Member'}
                </div>
              </div>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-5 space-y-3">
              {threadLoading ? (
                <div className="space-y-3">
                  {[1,2,3].map(i => <div key={i} className={`h-12 rounded-2xl animate-pulse w-2/3 ${i % 2 === 0 ? 'ml-auto' : ''}`} style={{ background: 'rgba(91,45,142,0.05)' }}/>)}
                </div>
              ) : !thread.length ? (
                <div className="text-center py-12">
                  <i className="fas fa-comment-slash text-4xl mb-3 block" style={{ color: 'rgba(91,45,142,0.15)' }}/>
                  <p className="text-sm" style={{ color: '#A3A3A3', fontFamily: 'Poppins,sans-serif' }}>
                    No messages yet. Say hello!
                  </p>
                </div>
              ) : (
                thread.map(msg => (
                  <MessageBubble key={msg.id} msg={msg} isOwn={msg.senderId === user?.id}/>
                ))
              )}
              <div ref={bottomRef}/>
            </div>

            {/* Input */}
            <div className="flex gap-2 p-4 border-t" style={{ borderColor: 'rgba(91,45,142,0.06)' }}>
              <input
                value={input}
                onChange={e => setInput(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && !e.shiftKey && (e.preventDefault(), handleSend())}
                placeholder="Type a message…"
                className="flex-1 px-4 py-2.5 rounded-2xl text-sm outline-none"
                style={{ background: 'rgba(91,45,142,0.05)', border: '1px solid rgba(91,45,142,0.1)', color: '#1A0A35', fontFamily: 'Poppins,sans-serif' }}
              />
              <button onClick={handleSend} disabled={!input.trim() || sendMut.isLoading}
                className="w-10 h-10 rounded-xl flex items-center justify-center transition-all hover:scale-105 disabled:opacity-40"
                style={{ background: 'linear-gradient(135deg,#5B2D8E,#7B4DB8)' }}>
                {sendMut.isLoading
                  ? <i className="fas fa-spinner animate-spin text-sm text-white"/>
                  : <i className="fas fa-paper-plane text-sm text-white"/>}
              </button>
            </div>
          </>
        )}
      </div>

      {showNewMsg && (
        <NewMessageModal
          onClose={() => setShowNewMsg(false)}
          onSelect={handleSelectPartner}
        />
      )}
    </div>
  )
}
