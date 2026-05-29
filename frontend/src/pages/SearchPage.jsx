import { useState, useCallback } from 'react'
import { API } from '../context/AuthContext'
import { useSocket } from '../context/SocketContext'
import './SearchPage.css'

export default function SearchPage() {
  const [query, setQuery] = useState('')
  const [results, setResults] = useState([])
  const [loading, setLoading] = useState(false)
  const [sent, setSent] = useState({})
  const { onlineUsers } = useSocket()

  const search = useCallback(async (q) => {
    setQuery(q)
    if (!q.trim()) { setResults([]); return }
    setLoading(true)
    try {
      const r = await API.get(`/users/search?q=${encodeURIComponent(q)}`)
      setResults(r.data)
    } catch {}
    finally { setLoading(false) }
  }, [])

  const sendRequest = async (userId) => {
    try {
      await API.post(`/users/friends/request/${userId}`)
      setSent(s => ({ ...s, [userId]: true }))
    } catch (err) {
      alert(err.response?.data?.error || 'Error')
    }
  }

  return (
    <div className="search-root">
      <div className="search-header">
        <div className="search-title">
          <span className="search-bracket">[</span>
          USER SCAN
          <span className="search-bracket">]</span>
        </div>
        <div className="search-sub">QUERY THE NETWORK FOR KNOWN OPERATIVES</div>

        <div className="search-bar-wrap hud-corner">
          <div className="search-icon">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
              <circle cx="11" cy="11" r="8"/>
              <path d="m21 21-4.35-4.35"/>
            </svg>
          </div>
          <input
            className="search-input"
            type="text"
            placeholder="ENTER HANDLE OR NET ADDRESS..."
            value={query}
            onChange={e => search(e.target.value)}
            autoFocus
          />
          {loading && <div className="search-spinner" />}
        </div>
      </div>

      <div className="search-results">
        {results.length === 0 && query && !loading && (
          <div className="search-empty">
            <div className="empty-icon">◈</div>
            <div>NO SIGNAL — OPERATIVE NOT FOUND</div>
          </div>
        )}

        {results.length === 0 && !query && (
          <div className="search-prompt">
            <div className="prompt-art">
              {`> AWAITING QUERY INPUT_`}
            </div>
            <div className="prompt-hint">Search by username or email</div>
          </div>
        )}

        {results.map((user, i) => {
          const isOnline = onlineUsers[user._id] === 'online'
          return (
            <div key={user._id} className="user-card animate-in hud-corner" style={{ animationDelay: `${i * 0.05}s` }}>
              <div className="user-card-avatar">
                {user.username[0].toUpperCase()}
                <div className={`status-indicator ${isOnline ? 'online' : 'offline'}`} />
              </div>
              <div className="user-card-info">
                <div className="user-card-name">{user.username}</div>
                <div className="user-card-email">{user.email}</div>
                <div className="user-card-bio">{user.bio}</div>
              </div>
              <div className="user-card-actions">
                <div className={`user-status-badge ${isOnline ? 'online' : 'offline'}`}>
                  {isOnline ? '● ONLINE' : '○ OFFLINE'}
                </div>
                <button
                  className={`connect-btn ${sent[user._id] ? 'sent' : ''}`}
                  onClick={() => sendRequest(user._id)}
                  disabled={sent[user._id]}
                >
                  {sent[user._id] ? 'REQUEST SENT' : '+ CONNECT'}
                </button>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
