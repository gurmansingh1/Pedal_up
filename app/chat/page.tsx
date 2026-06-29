'use client'
import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { MessageSquare, Send, Search, ArrowLeft, LogIn, Bike, Clock } from 'lucide-react'

const MOCK_THREADS = [
  {
    id: 'thread-1',
    listing_id: 'listing-uuid-1',
    listing_title: 'Firefox Target 21-Speed Hybrid',
    other_user: 'Aman Verma',
    last_message: 'Is the cycle still available?',
    time: '2 min ago',
    unread: 2,
    image_url: 'https://images.unsplash.com/photo-1485965120184-e220f721d03e?auto=format&fit=crop&w=100&q=80',
    messages: [
      { id: 1, sender: 'Aman Verma', text: 'Hi, is this cycle still available?', time: '10:30 AM', isMe: false },
      { id: 2, sender: 'Me', text: 'Yes it is! Feel free to come check it out.', time: '10:32 AM', isMe: true },
      { id: 3, sender: 'Aman Verma', text: 'Great! Can we meet at JGB parking tomorrow at 5pm?', time: '10:35 AM', isMe: false },
      { id: 4, sender: 'Aman Verma', text: 'Is the cycle still available?', time: '11:00 AM', isMe: false },
    ],
  },
  {
    id: 'thread-2',
    listing_id: 'listing-uuid-2',
    listing_title: 'Atlas Asteroid Mountain Bike',
    other_user: 'Simran Kaur',
    last_message: "I'll negotiate ₹3800. Let me know!",
    time: '1h ago',
    unread: 0,
    image_url: 'https://images.unsplash.com/photo-1532298229144-0ec0c57515c7?auto=format&fit=crop&w=100&q=80',
    messages: [
      { id: 1, sender: 'Me', text: 'Hey Simran, interested in your Atlas mountain bike!', time: '9:00 AM', isMe: true },
      { id: 2, sender: 'Simran Kaur', text: 'Sure! When would you like to see it?', time: '9:15 AM', isMe: false },
      { id: 3, sender: 'Me', text: "Could we do ₹3800? It's a bit high for my budget.", time: '9:20 AM', isMe: true },
      { id: 4, sender: 'Simran Kaur', text: "I'll negotiate ₹3800. Let me know!", time: '9:45 AM', isMe: false },
    ],
  },
  {
    id: 'thread-3',
    listing_id: 'listing-uuid-6',
    listing_title: 'Trek FX3 Fitness Hybrid',
    other_user: 'Dhruv Malhotra',
    last_message: 'Sure, see you at 4pm!',
    time: '3h ago',
    unread: 0,
    image_url: 'https://images.unsplash.com/photo-1565185693497-e41f93432f89?auto=format&fit=crop&w=100&q=80',
    messages: [
      { id: 1, sender: 'Me', text: 'Is the Trek FX3 still available?', time: '8:00 AM', isMe: true },
      { id: 2, sender: 'Dhruv Malhotra', text: 'Yes! Come see it anytime at Vishwakarma Hostel.', time: '8:30 AM', isMe: false },
      { id: 3, sender: 'Me', text: 'Can I come today at 4pm?', time: '8:35 AM', isMe: true },
      { id: 4, sender: 'Dhruv Malhotra', text: 'Sure, see you at 4pm!', time: '8:40 AM', isMe: false },
    ],
  },
]

export default function ChatPage() {
  const router = useRouter()
  const [user, setUser] = useState<any>(null)
  const [threads, setThreads] = useState(MOCK_THREADS)
  const [activeThread, setActiveThread] = useState<string | null>(null)
  const [newMessage, setNewMessage] = useState('')
  const [search, setSearch] = useState('')
  const messagesEndRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const stored = localStorage.getItem('pedalup_user')
    if (!stored) { router.push('/login?redirect=/chat'); return }
    setUser(JSON.parse(stored))
  }, [])

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [activeThread, threads])

  const sendMessage = () => {
    if (!newMessage.trim() || !activeThread) return
    setThreads(prev => prev.map(t => {
      if (t.id !== activeThread) return t
      return {
        ...t,
        last_message: newMessage,
        time: 'Just now',
        messages: [...t.messages, {
          id: t.messages.length + 1,
          sender: 'Me',
          text: newMessage,
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          isMe: true,
        }],
      }
    }))
    setNewMessage('')
  }

  const filteredThreads = threads.filter(t =>
    t.other_user.toLowerCase().includes(search.toLowerCase()) ||
    t.listing_title.toLowerCase().includes(search.toLowerCase())
  )

  const currentThread = threads.find(t => t.id === activeThread)

  if (!user) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: '16px' }}>
        <LogIn size={40} color="var(--accent)" />
        <p style={{ color: 'var(--text-secondary)' }}>Please sign in to view your inbox</p>
        <Link href="/login"><button className="btn-primary">Sign In</button></Link>
      </div>
    )
  }

  return (
    <div style={{ height: 'calc(100vh - 64px)', display: 'flex', background: 'var(--bg-primary)', overflow: 'hidden' }}>
      {/* Thread list panel */}
      <div style={{
        width: activeThread ? '320px' : '100%',
        maxWidth: '380px',
        borderRight: '1px solid var(--border-default)',
        display: 'flex',
        flexDirection: 'column',
        flexShrink: 0,
      }} className="thread-panel">
        {/* Header */}
        <div style={{ padding: '20px 20px 16px', borderBottom: '1px solid var(--border-default)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '14px' }}>
            <MessageSquare size={18} color="var(--accent)" />
            <h1 style={{ fontSize: '18px', fontWeight: 800 }}>Inbox</h1>
            {threads.some(t => t.unread > 0) && (
              <div style={{ background: 'var(--primary)', color: '#fff', fontSize: '11px', fontWeight: 700, padding: '2px 7px', borderRadius: '100px' }}>
                {threads.reduce((s, t) => s + t.unread, 0)}
              </div>
            )}
          </div>
          <div style={{ position: 'relative' }}>
            <Search size={14} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-tertiary)' }} />
            <input
              className="input-field"
              style={{ paddingLeft: '36px', fontSize: '13px' }}
              placeholder="Search conversations..."
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
          </div>
        </div>

        {/* Thread list */}
        <div style={{ flex: 1, overflowY: 'auto' }}>
          {filteredThreads.length === 0 ? (
            <div style={{ padding: '40px 20px', textAlign: 'center', color: 'var(--text-tertiary)' }}>
              <MessageSquare size={32} style={{ margin: '0 auto 12px', opacity: 0.4, display: 'block' }} />
              <p style={{ fontSize: '14px' }}>No messages yet</p>
            </div>
          ) : filteredThreads.map(thread => (
            <button
              key={thread.id}
              onClick={() => {
                setActiveThread(thread.id)
                setThreads(prev => prev.map(t => t.id === thread.id ? { ...t, unread: 0 } : t))
              }}
              style={{
                width: '100%', padding: '14px 18px',
                display: 'flex', alignItems: 'center', gap: '12px',
                background: activeThread === thread.id ? 'rgba(34,197,94,0.06)' : 'transparent',
                borderBottom: '1px solid var(--border-default)',
                border: 'none',
                borderLeft: activeThread === thread.id ? '2px solid var(--primary)' : '2px solid transparent',
                cursor: 'pointer', textAlign: 'left',
                transition: 'all 0.15s ease',
              }}
            >
              {/* Avatar */}
              <div style={{ position: 'relative', flexShrink: 0 }}>
                <img
                  src={thread.image_url}
                  alt=""
                  style={{ width: 44, height: 44, borderRadius: '12px', objectFit: 'cover', border: '1px solid var(--border-default)' }}
                />
                {thread.unread > 0 && (
                  <div style={{
                    position: 'absolute', top: -4, right: -4,
                    width: 18, height: 18, borderRadius: '50%',
                    background: 'var(--primary)', color: '#fff',
                    fontSize: '10px', fontWeight: 800,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                  }}>{thread.unread}</div>
                )}
              </div>

              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '3px' }}>
                  <span style={{ fontSize: '14px', fontWeight: 700, color: '#fff' }}>{thread.other_user}</span>
                  <span style={{ fontSize: '11px', color: 'var(--text-tertiary)' }}>{thread.time}</span>
                </div>
                <p style={{
                  fontSize: '12px', color: thread.unread > 0 ? 'var(--text-primary)' : 'var(--text-secondary)',
                  fontWeight: thread.unread > 0 ? 600 : 400,
                  overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                  marginBottom: '2px',
                }}>{thread.last_message}</p>
                <p style={{ fontSize: '11px', color: 'var(--text-tertiary)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  <Bike size={10} style={{ display: 'inline', marginRight: '3px' }} />{thread.listing_title}
                </p>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Message panel */}
      {activeThread && currentThread ? (
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0 }}>
          {/* Chat header */}
          <div style={{
            padding: '16px 24px', borderBottom: '1px solid var(--border-default)',
            display: 'flex', alignItems: 'center', gap: '12px',
          }}>
            <button
              onClick={() => setActiveThread(null)}
              className="mobile-back"
              style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-secondary)', padding: 0, display: 'none' }}
            >
              <ArrowLeft size={20} />
            </button>
            <img src={currentThread.image_url} alt="" style={{ width: 40, height: 40, borderRadius: '10px', objectFit: 'cover' }} />
            <div>
              <div style={{ fontSize: '15px', fontWeight: 700 }}>{currentThread.other_user}</div>
              <div style={{ fontSize: '12px', color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: '4px' }}>
                <Bike size={10} />
                {currentThread.listing_title}
              </div>
            </div>
            <Link href={`/listing/${currentThread.listing_id}`} style={{ marginLeft: 'auto' }}>
              <button className="btn-secondary" style={{ padding: '6px 14px', fontSize: '12px' }}>View Listing</button>
            </Link>
          </div>

          {/* Messages */}
          <div style={{ flex: 1, overflowY: 'auto', padding: '24px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {currentThread.messages.map(msg => (
              <div
                key={msg.id}
                style={{
                  display: 'flex',
                  justifyContent: msg.isMe ? 'flex-end' : 'flex-start',
                  animation: 'fadeInUp 0.2s ease',
                }}
              >
                <div style={{
                  maxWidth: '70%',
                  padding: '10px 14px',
                  borderRadius: msg.isMe ? '16px 16px 4px 16px' : '16px 16px 16px 4px',
                  background: msg.isMe ? 'var(--accent)' : 'var(--bg-elevated)',
                  color: msg.isMe ? '#000' : 'var(--text-primary)',
                  border: msg.isMe ? 'none' : '1px solid var(--border-default)',
                }}>
                  <p style={{ fontSize: '14px', lineHeight: 1.5, fontWeight: msg.isMe ? 500 : 400 }}>{msg.text}</p>
                  <p style={{ fontSize: '10px', marginTop: '4px', opacity: 0.6, textAlign: 'right' }}>{msg.time}</p>
                </div>
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>

          {/* Input */}
          <div style={{
            padding: '16px 24px', borderTop: '1px solid var(--border-default)',
            display: 'flex', gap: '10px', alignItems: 'center',
          }}>
            <input
              className="input-field"
              placeholder="Type a message..."
              value={newMessage}
              onChange={e => setNewMessage(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && !e.shiftKey && sendMessage()}
              style={{ flex: 1 }}
            />
            <button
              onClick={sendMessage}
              disabled={!newMessage.trim()}
              className="btn-primary"
              style={{ padding: '11px 16px', flexShrink: 0, display: 'flex', alignItems: 'center', gap: '6px' }}
            >
              <Send size={15} />
            </button>
          </div>
        </div>
      ) : (
        <div style={{
          flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center',
          flexDirection: 'column', gap: '12px', color: 'var(--text-tertiary)',
        }} className="chat-empty">
          <div style={{
            width: 72, height: 72, borderRadius: '20px',
            background: 'rgba(34,197,94,0.06)', border: '1px solid rgba(34,197,94,0.1)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <MessageSquare size={32} color="var(--primary)" strokeWidth={1.5} />
          </div>
          <div style={{ textAlign: 'center' }}>
            <p style={{ fontSize: '16px', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '4px' }}>Select a conversation</p>
            <p style={{ fontSize: '13px' }}>Choose from your inbox to start messaging</p>
          </div>
        </div>
      )}

      <style jsx>{`
        @media (max-width: 600px) {
          .thread-panel { max-width: 100% !important; border-right: none !important; }
          .chat-empty { display: none !important; }
          .mobile-back { display: flex !important; }
        }
      `}</style>
    </div>
  )
}
