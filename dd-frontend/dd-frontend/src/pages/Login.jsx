import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { authAPI } from '../services/api'
import { useAuth } from '../context/AuthContext'

export default function Login() {
  const [form, setForm]     = useState({ email: '', password: '' })
  const [error, setError]   = useState('')
  const [loading, setLoading] = useState(false)
  const { login } = useAuth()
  const navigate  = useNavigate()

  const handle = e => setForm(f => ({ ...f, [e.target.name]: e.target.value }))

  const submit = async e => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      const { data } = await authAPI.login(form)
      login(data.user ?? { email: form.email, name: data.name ?? form.email }, data.token)
      navigate('/chat')
    } catch (err) {
      setError(err.response?.data?.message ?? 'Invalid credentials')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={styles.root}>
      
      <div style={styles.bg} />
      <div style={styles.overlay} />

     
      <div style={styles.scanlines} />

      
      <div style={styles.left}>
        <div style={styles.fadeUp}>
          <div style={styles.logo}>DECISION<br /><span style={styles.logoAccent}>DETECTIVE</span></div>
          <div style={styles.tagline}>INTELLIGENCE LAYER FOR<br />ORGANIZATIONAL DECISIONS</div>
          <div style={styles.version}>v1.0 — POWERED BY GEMINI</div>
        </div>
      </div>

      
      <div style={styles.right}>
        <div style={styles.card}>
          <div style={styles.cardHeader}>
            <div style={styles.cardTitle}>SIGN IN</div>
            <div style={styles.cardSub}>Enter your credentials to access the system</div>
          </div>

          {error && <div style={styles.error}>{error}</div>}

          <form onSubmit={submit} style={styles.form}>
            <label style={styles.label}>EMAIL ADDRESS</label>
            <input
              name="email" type="email" value={form.email}
              onChange={handle} required placeholder="you@company.com"
              style={styles.input}
            />

            <label style={styles.label}>PASSWORD</label>
            <input
              name="password" type="password" value={form.password}
              onChange={handle} required placeholder="••••••••"
              style={styles.input}
            />

            <button type="submit" disabled={loading} style={{
              ...styles.btn,
              opacity: loading ? 0.6 : 1,
            }}>
              {loading ? <span style={styles.spinner} /> : 'ACCESS SYSTEM →'}
            </button>
          </form>

          <div style={styles.switchText}>
            No account?{' '}
            <Link to="/register" style={styles.link}>Register here</Link>
          </div>
        </div>
      </div>
    </div>
  )
}

const styles = {
  root: {
    display: 'flex',
    height: '100vh',
    width: '100vw',
    overflow: 'hidden',
    position: 'relative',
    background: '#040404',
  },
  bg: {
    position: 'absolute', inset: 0,
    backgroundImage: `url('/gojo.png')`,
    backgroundSize: 'cover',
    backgroundPosition: 'center 30%',
    backgroundRepeat: 'no-repeat',
    filter: 'brightness(0.45) contrast(1.1)',
    zIndex: 0,
  },
  overlay: {
    position: 'absolute', inset: 0,
    background: 'linear-gradient(105deg, rgba(4,4,4,0.15) 0%, rgba(4,4,4,0.6) 45%, rgba(4,4,4,0.97) 100%)',
    zIndex: 1,
  },
  scanlines: {
    position: 'absolute', inset: 0, zIndex: 2, pointerEvents: 'none',
    backgroundImage: 'repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(0,0,0,0.08) 2px, rgba(0,0,0,0.08) 4px)',
  },
  left: {
    flex: 1, display: 'flex', alignItems: 'flex-end', padding: '60px',
    position: 'relative', zIndex: 3,
  },
  fadeUp: { animation: 'fadeUp 0.8s ease forwards' },
  logo: {
    fontFamily: "'Bebas Neue', sans-serif",
    fontSize: 72, lineHeight: 0.9,
    color: '#fff', letterSpacing: 4,
    textShadow: '0 0 40px rgba(255,255,255,0.1)',
  },
  logoAccent: { color: '#c8c8c8' },
  tagline: {
    fontFamily: "'DM Mono', monospace",
    fontSize: 11, letterSpacing: 3,
    color: '#666', marginTop: 20, lineHeight: 1.8,
  },
  version: {
    fontFamily: "'DM Mono', monospace",
    fontSize: 9, letterSpacing: 2,
    color: '#333', marginTop: 16,
  },
  right: {
    width: 460, display: 'flex', alignItems: 'center', justifyContent: 'center',
    position: 'relative', zIndex: 3, padding: '40px',
    borderLeft: '1px solid rgba(255,255,255,0.04)',
    background: 'rgba(8,8,8,0.85)',
    backdropFilter: 'blur(20px)',
  },
  card: { width: '100%', animation: 'fadeUp 0.6s 0.2s ease both' },
  cardHeader: { marginBottom: 36 },
  cardTitle: {
    fontFamily: "'Bebas Neue', sans-serif",
    fontSize: 36, letterSpacing: 4, color: '#fff',
  },
  cardSub: {
    fontFamily: "'DM Mono', monospace",
    fontSize: 10, color: '#555', letterSpacing: 1.5, marginTop: 8,
  },
  error: {
    background: 'rgba(255,59,59,0.08)',
    border: '1px solid rgba(255,59,59,0.3)',
    color: '#ff6b6b',
    padding: '10px 14px',
    fontSize: 11, letterSpacing: 1,
    marginBottom: 20,
  },
  form: { display: 'flex', flexDirection: 'column', gap: 6 },
  label: {
    fontFamily: "'DM Mono', monospace",
    fontSize: 9, letterSpacing: 2, color: '#555', marginBottom: 6, marginTop: 14,
  },
  input: {
    background: 'rgba(255,255,255,0.03)',
    border: '1px solid #2a2a2a',
    color: '#e0e0e0',
    padding: '13px 16px',
    fontSize: 12, letterSpacing: 0.5,
    outline: 'none',
    transition: 'border-color 0.2s',
    width: '100%',
  },
  btn: {
    marginTop: 28,
    background: '#e8e8e8',
    color: '#080808',
    border: 'none',
    padding: '14px',
    fontSize: 12, letterSpacing: 2,
    fontFamily: "'DM Mono', monospace",
    fontWeight: 500,
    transition: 'all 0.2s',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    gap: 8,
  },
  spinner: {
    display: 'inline-block',
    width: 14, height: 14,
    border: '2px solid #444',
    borderTop: '2px solid #080808',
    borderRadius: '50%',
    animation: 'spin 0.7s linear infinite',
  },
  switchText: {
    fontFamily: "'DM Mono', monospace",
    fontSize: 10, color: '#444', marginTop: 24, textAlign: 'center', letterSpacing: 1,
  },
  link: { color: '#888', borderBottom: '1px solid #333' },
}
