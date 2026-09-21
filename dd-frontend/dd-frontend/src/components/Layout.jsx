import { Outlet, NavLink, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

const NAV = [
  { to: '/dashboard', icon: '⬡', label: 'DASHBOARD' },
  { to: '/chat',      icon: '◈', label: 'AI CHAT' },
  { to: '/upload',    icon: '↑', label: 'UPLOAD' },
]

export default function Layout() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()

  const handleLogout = () => { logout(); navigate('/login') }

  const initials = user?.name
    ? user.name.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase()
    : user?.email?.slice(0, 2).toUpperCase() ?? 'DD'

  return (
    <div style={styles.root}>
      
      <aside style={styles.sidebar}>
        
        <div style={styles.logoWrap}>
          <div style={styles.logoText}>DECISION</div>
          <div style={styles.logoAccent}>DETECTIVE</div>
          <div style={styles.logoVersion}>v1.0 — INTELLIGENCE LAYER</div>
        </div>

        
        <nav style={styles.nav}>
          {NAV.map(n => (
            <NavLink key={n.to} to={n.to} style={({ isActive }) => ({
              ...styles.navItem,
              color: isActive ? '#e8e8e8' : '#444',
              borderLeft: isActive ? '2px solid #c8c8c8' : '2px solid transparent',
              background: isActive ? 'rgba(255,255,255,0.04)' : 'transparent',
            })}>
              <span style={styles.navIcon}>{n.icon}</span>
              <span>{n.label}</span>
            </NavLink>
          ))}
        </nav>

        <div style={{ flex: 1 }} />

       
        <div style={styles.statusRow}>
          <div style={styles.statusDot} />
          <span style={styles.statusText}>BACKEND CONNECTED</span>
        </div>

        
        <div style={styles.userRow}>
          <div style={styles.avatar}>{initials}</div>
          <div style={styles.userInfo}>
            <div style={styles.userName}>{user?.name ?? 'User'}</div>
            <div style={styles.userEmail}>{user?.email}</div>
          </div>
          <button onClick={handleLogout} style={styles.logoutBtn} title="Logout">⎋</button>
        </div>
      </aside>

      
      <main style={styles.main}>
        <Outlet />
      </main>
    </div>
  )
}

const styles = {
  root: { display: 'flex', height: '100vh', width: '100vw', overflow: 'hidden', background: '#080808' },
  sidebar: {
    width: 220, display: 'flex', flexDirection: 'column',
    background: '#0a0a0a', borderRight: '1px solid #1a1a1a',
    flexShrink: 0,
  },
  logoWrap: { padding: '24px 20px 20px', borderBottom: '1px solid #1a1a1a' },
  logoText: { fontFamily: "'Bebas Neue', sans-serif", fontSize: 20, letterSpacing: 3, color: '#fff' },
  logoAccent: { fontFamily: "'Bebas Neue', sans-serif", fontSize: 20, letterSpacing: 3, color: '#aaa' },
  logoVersion: { fontFamily: "'DM Mono', monospace", fontSize: 8, color: '#333', letterSpacing: 2, marginTop: 6 },
  nav: { padding: '12px 0' },
  navItem: {
    display: 'flex', alignItems: 'center', gap: 10,
    padding: '11px 20px', fontSize: 10, letterSpacing: 1.5,
    transition: 'all 0.15s', fontFamily: "'DM Mono', monospace",
  },
  navIcon: { fontSize: 14, minWidth: 16 },
  statusRow: { padding: '12px 20px', display: 'flex', alignItems: 'center', gap: 8 },
  statusDot: { width: 6, height: 6, borderRadius: '50%', background: '#4a4', boxShadow: '0 0 5px #4a4' },
  statusText: { fontFamily: "'DM Mono', monospace", fontSize: 8, color: '#3a3', letterSpacing: 1.5 },
  userRow: {
    padding: '14px 16px', borderTop: '1px solid #1a1a1a',
    display: 'flex', alignItems: 'center', gap: 10,
  },
  avatar: {
    width: 30, height: 30, borderRadius: '50%',
    background: 'linear-gradient(135deg, #555, #333)',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    fontSize: 11, color: '#e8e8e8', fontWeight: 600, flexShrink: 0,
    border: '1px solid #2a2a2a',
  },
  userInfo: { flex: 1, minWidth: 0 },
  userName: { fontFamily: "'DM Mono', monospace", fontSize: 10, color: '#aaa', letterSpacing: 0.5, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' },
  userEmail: { fontFamily: "'DM Mono', monospace", fontSize: 8, color: '#3a3a3a', marginTop: 2, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' },
  logoutBtn: { background: 'none', border: 'none', color: '#333', fontSize: 16, cursor: 'pointer', flexShrink: 0, ':hover': { color: '#888' } },
  main: { flex: 1, overflow: 'hidden', display: 'flex', flexDirection: 'column' },
}
