import { useState, useEffect, useRef, useCallback } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { API, useAuth } from '../context/AuthContext'
import { useSocket } from '../context/SocketContext'
import './FriendsPage.css'

export default function FriendsPage() {
  const { chatId } = useParams()
  const { user } = useAuth()
  const { onlineUsers, typingUsers, sendMessage, onMessage, startTyping, stopTyping } = useSocket()
  const navigate = useNavigate()

  const [friends, setFriends] = useState([])
  const [requests, setRequests] = useState([])
  const [messages, setMessages] = useState([])
  const [input, setInput] = useState('')
  const [loadingChat, setLoadingChat] = useState(false)
  const [activeTab, setActiveTab] = useState('friends')
  const messagesEndRef = useRef(null)
  const typingTimer = useRef(null)
  const isTyping = useRef(false)

  const selectedFriend = friends.find(f => f._id === chatId)

  const loadFriends = useCallback(async () => {
    try {
      const [fr, rq] = await Promise.all([
        API.get('/users/friends'),
        API.get('/users/friends/requests'),
      ])
      setFriends(fr.data)
      setRequests(rq.data)
    } catch {}
  }, [])

  useEffect(() => { loadFriends() }, [loadFriends])

  useEffect(() => {
    if (!chatId) return
    setLoadingChat(true)
    API.get(`/chat/${chatId}`)
      .then(r => setMessages(r.data))
      .catch(() => {})
      .finally(() => setLoadingChat(false))
  }, [chatId])

  useEffect(() => {
    const cleanup = onMessage?.((msg) => {
      const isRelevant =
        (msg.sender._id === chatId && msg.receiver._id === user._id) ||
        (msg.sender._id === user._id && msg.receiver._id === chatId)
      if (isRelevant) {
        setMessages(prev => [...prev, msg])
      }
    })
    return cleanup
  }, [chatId, user._id, onMessage])

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const acceptRequest = async (userId) => {
    await API.post(`/users/friends/accept/${userId}`)
    loadFriends()
  }

  const handleInput = (e) => {
    setInput(e.target.value)
    if (!chatId) return
    if (!isTyping.current) {
      isTyping.current = true
      startTyping(chatId)
    }
    clearTimeout(typingTimer.current)
    typingTimer.current = setTimeout(() => {
      isTyping.current = false
      stopTyping(chatId)
    }, 1000)
  }

  const handleSend = (e) => {
  e.preventDefault()
  if (!input.trim() || !chatId) return
  const content = input.trim()
  setInput('')
  isTyping.current = false
  stopTyping(chatId)
  sendMessage(chatId, content, () => {})
}

  const formatTime = (date) => {
    return new Date(date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
  }

  const formatDate = (date) => {
    const d = new Date(date)
    const today = new Date()
    if (d.toDateString() === today.toDateString()) return 'TODAY'
    return d.toLocaleDateString([], { month: 'short', day: 'numeric' }).toUpperCase()
  }

  const groupedMessages = messages.reduce((acc, msg) => {
    const dateKey = new Date(msg.createdAt).toDateString()
    if (!acc[dateKey]) acc[dateKey] = []
    acc[dateKey].push(msg)
    return acc
  }, {})

  return (
    <div className="friends-root">
      {/* Friends panel */}
      <div className="friends-panel">
        <div className="panel-header">
          <div className="panel-tabs">
            <button className={`ptab ${activeTab === 'friends' ? 'active' : ''}`} onClick={() => setActiveTab('friends')}>
              NETWORK
              {friends.length > 0 && <span className="badge">{friends.length}</span>}
            </button>
            <button className={`ptab ${activeTab === 'requests' ? 'active' : ''}`} onClick={() => setActiveTab('requests')}>
              REQUESTS
              {requests.length > 0 && <span className="badge hot">{requests.length}</span>}
            </button>
          </div>
        </div>

        <div className="friends-list">
          {activeTab === 'friends' && (
            <>
              {friends.length === 0 && (
                <div className="friends-empty">
                  <div className="empty-glyph">⬡</div>
                  <div>NO CONTACTS LINKED</div>
                  <div className="hint">SCAN THE NETWORK TO FIND OPERATIVES</div>
                </div>
              )}
              {friends.map(friend => {
                const isOnline = onlineUsers[friend._id] === 'online' || friend.status === 'online'
                const isTyp = typingUsers[friend._id]
                const isActive = chatId === friend._id
                return (
                  <div
                    key={friend._id}
                    className={`friend-item ${isActive ? 'active' : ''}`}
                    onClick={() => navigate(`/friends/${friend._id}`)}
                  >
                    <div className="friend-avatar">
                      {friend.username[0].toUpperCase()}
                      <div className={`f-status ${isOnline ? 'online' : 'offline'}`} />
                    </div>
                    <div className="friend-details">
                      <div className="friend-name">{friend.username}</div>
                      <div className={`friend-sub ${isOnline ? 'online' : ''}`}>
                        {isTyp ? (
                          <span className="typing-indicator">
                            <span /><span /><span />
                          </span>
                        ) : isOnline ? 'ONLINE' : 'OFFLINE'}
                      </div>
                    </div>
                    {isActive && <div className="active-bar" />}
                  </div>
                )
              })}
            </>
          )}

          {activeTab === 'requests' && (
            <>
              {requests.length === 0 && (
                <div className="friends-empty">
                  <div>NO PENDING REQUESTS</div>
                </div>
              )}
              {requests.map(req => (
                <div key={req._id} className="request-item">
                  <div className="friend-avatar">{req.username[0].toUpperCase()}</div>
                  <div className="friend-details">
                    <div className="friend-name">{req.username}</div>
                    <div className="friend-sub">{req.email}</div>
                  </div>
                  <button className="accept-btn" onClick={() => acceptRequest(req._id)}>LINK</button>
                </div>
              ))}
            </>
          )}
        </div>
      </div>

      {/* Chat area */}
      <div className="chat-area">
        {!chatId ? (
          <div className="chat-empty">
            <div className="chat-empty-art">
              <div className="hex-grid">
                {[...Array(12)].map((_, i) => <div key={i} className="hex" style={{ '--i': i }} />)}
              </div>
            </div>
            <div className="chat-empty-title">SELECT A CONTACT</div>
            <div className="chat-empty-sub">CHOOSE AN OPERATIVE TO INITIATE SECURE CHANNEL</div>
          </div>
        ) : (
          <>
            <div className="chat-header">
              <div className="chat-header-left">
                <div className="chat-avatar">
                  {selectedFriend?.username?.[0]?.toUpperCase() || '?'}
                  <div className={`f-status ${onlineUsers[chatId] === 'online' || selectedFriend?.status === 'online' ? 'online' : 'offline'}`} />
                </div>
                <div>
                  <div className="chat-name">{selectedFriend?.username || 'UNKNOWN'}</div>
                  <div className="chat-status-line">
                    {typingUsers[chatId] ? (
                      <span className="typing-text">TRANSMITTING<span className="dots" /></span>
                    ) : (
                      <span>{onlineUsers[chatId] === 'online' ? '● SECURE CHANNEL ACTIVE' : '○ OPERATIVE OFFLINE'}</span>
                    )}
                  </div>
                </div>
              </div>
              <div className="chat-header-right">
                <div className="channel-id">CH:{chatId?.slice(-6).toUpperCase()}</div>
              </div>
            </div>

            <div className="messages-area">
              {loadingChat && (
                <div className="loading-msg">RETRIEVING TRANSMISSION LOG<span className="dots" /></div>
              )}

              {Object.entries(groupedMessages).map(([dateKey, msgs]) => (
                <div key={dateKey}>
                  <div className="date-divider">
                    <span>{formatDate(msgs[0].createdAt)}</span>
                  </div>
                  {msgs.map((msg, i) => {
                    const isMe = msg.sender._id === user._id || msg.sender === user._id
                    return (
                      <div key={msg._id || i} className={`message ${isMe ? 'mine' : 'theirs'}`}>
                        <div className="message-bubble">
                          <div className="message-text">{msg.content}</div>
                          <div className="message-time">{formatTime(msg.createdAt)}</div>
                        </div>
                      </div>
                    )
                  })}
                </div>
              ))}
              <div ref={messagesEndRef} />
            </div>

            <form className="chat-input-area" onSubmit={handleSend}>
              <div className="input-wrap hud-corner">
                <span className="input-prefix">&gt;_</span>
                <input
                  className="chat-input"
                  value={input}
                  onChange={handleInput}
                  placeholder="TRANSMIT MESSAGE..."
                  autoFocus
                />
              </div>
              <button type="submit" className="send-btn" disabled={!input.trim()}>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                  <line x1="22" y1="2" x2="11" y2="13"/>
                  <polygon points="22 2 15 22 11 13 2 9 22 2"/>
                </svg>
                SEND
              </button>
            </form>
          </>
        )}
      </div>
    </div>
  )
}
