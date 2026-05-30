import { useState } from 'react'
import { useAuth } from '../context/AuthContext'
import './AuthPage.css'

export default function AuthPage() {
  const { login, register } = useAuth()
  const [mode, setMode] = useState('login')
  const [form, setForm] = useState({ username: '', email: '', password: '' })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handle = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      if (mode === 'login') {
        await login(form.email, form.password)
      } else {
        await register(form.username, form.email, form.password)
      }
    } catch (err) {
      setError(err.response?.data?.error || 'CONNECTION FAILED')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="auth-root">
      <div className="auth-bg">
        <div className="auth-grid" />
        <div className="auth-beams">
          {[...Array(6)].map((_, i) => <div key={i} className="beam" style={{ '--i': i }} />)}
        </div>
      </div>

      <div className="auth-container animate-in">
        <div className="auth-logo">
          <div className="logo-glitch" data-text="CYBERLINK">CYBEINK</div>
          <div className="logo-sub">NEURAL CH NETWORK v2.0.77</div>
        </div>

        <div className="auth-panel hud-corner">
          <div className="auth-tabs">
            <button className={`tab ${mode === 'login' ? 'active' : ''}`} onClick={() => setMode('login')}>
              JACK IN
            </button>
            <button className={`tab ${mode === 'register' ? 'active' : ''}`} onClick={() => setMode('register')}>
              NEW IDENTITY
            </button>
          </div>

          <form onSubmit={handle} className="auth-form">
            {mode === 'register' && (
              <div className="field">
                <label>HANDLE</label>
                <input
                  type="text"
                  placeholder="ghost_rider_99"
                  value={form.username}
                  onChange={e => setForm(f => ({ ...f, username: e.target.value }))}
                  required
                />
                <div className="field-line" />
              </div>
            )}
            <div className="field">
              <label>NET ADDRESS</label>
              <input
                type="email"
                placeholder="user@cyberspace.net"
                value={form.email}
                onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
                required
              />
              <div className="field-line" />
            </div>
            <div className="field">
              <label>ACCESS CODE</label>
              <input
                type="password"
                placeholder="••••••••••••"
                value={form.password}
                onChange={e => setForm(f => ({ ...f, password: e.target.value }))}
                required
              />
              <div className="field-line" />
            </div>

            {error && <div className="auth-error">⚠ {error}</div>}

            <button type="submit" className="auth-btn" disabled={loading}>
              {loading ? (
                <span className="loading-text">AUTHENTICATING<span className="dots" /></span>
              ) : (
                mode === 'login' ? 'ESTABLISH LINK' : 'CREATE IDENTITY'
              )}
            </button>
          </form>

          <div className="auth-footer">
            <span className="status-dot" />
            SECURE CHANNEL ACTIVE · END-TO-END ENCRYPTED
          </div>
        </div>
      </div>
    </div>
  )
}
