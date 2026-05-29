import { Outlet, NavLink, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import './Layout.css'

export default function Layout() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()

  const handleLogout = async () => {
    await logout()
    navigate('/auth')
  }

  const avatar = user?.username?.[0]?.toUpperCase() || '?'

  return (
    <div className="layout">
      <aside className="sidebar">
        <div className="sidebar-logo">
          <span className="sidebar-logo-text">CL</span>
          <span className="sidebar-logo-dot" />
        </div>

        <nav className="sidebar-nav">
          <NavLink to="/friends" className={({isActive}) => `nav-item ${isActive ? 'active' : ''}`}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
              <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
              <circle cx="9" cy="7" r="4"/>
              <path d="M23 21v-2a4 4 0 0 0-3-3.87"/>
              <path d="M16 3.13a4 4 0 0 1 0 7.75"/>
            </svg>
            <span>NETWORK</span>
          </NavLink>

          <NavLink to="/search" className={({isActive}) => `nav-item ${isActive ? 'active' : ''}`}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
              <circle cx="11" cy="11" r="8"/>
              <path d="m21 21-4.35-4.35"/>
            </svg>
            <span>SCAN</span>
          </NavLink>
        </nav>

        <div className="sidebar-bottom">
          <div className="sidebar-user">
            <div className="avatar-sm">{avatar}</div>
            <div className="user-info">
              <div className="user-handle">{user?.username}</div>
              <div className="user-status online">● ONLINE</div>
            </div>
          </div>
          <button className="logout-btn" onClick={handleLogout} title="Disconnect">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
              <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/>
              <polyline points="16 17 21 12 16 7"/>
              <line x1="21" y1="12" x2="9" y2="12"/>
            </svg>
          </button>
        </div>
      </aside>

      <main className="main-content">
        <Outlet />
      </main>
    </div>
  )
}
