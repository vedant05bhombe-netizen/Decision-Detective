import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { authAPI } from '../services/api'
import { useAuth } from '../context/AuthContext'

export default function Register() {
  const [form, setForm]     = useState({ name: '', email: '', password: '', organizationName: '' })
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
      const { data } = await authAPI.register(form)
      login(data.user ?? { email: form.email, name: form.name }, data.token)
      navigate('/chat')
    } catch (err) {
      setError(err.response?.data?.message ?? 'Registration failed')
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
        <div style={{ animation: 'fadeUp 0.8s ease forwards' }}>
          <div style={styles.logo}>DECISION<br /><span style={{ color: '#c8c8c8' }}>DETECTIVE</span></div>
          <div style={styles.tagline}>JOIN THE INTELLIGENCE<br />LAYER FOR YOUR ORGANIZATION</div>
          <div style={styles.steps}>
            {['Upload company documents', 'Ask decisions in natural language', 'Get AI-powered verdicts'].map((s, i) => (
              <div key={i} style={styles.step}>
                <span style={styles.stepNum}>{String(i + 1).padStart(2, '0')}</span>
                <span style={styles.stepText}>{s}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div style={styles.right}>
        <div style={{ width: '100%', animation: 'fadeUp 0.6s 0.2s ease both' }}>
          <div style={styles.cardHeader}>
            <div style={styles.cardTitle}>CREATE ACCOUNT</div>
            <div style={styles.cardSub}>Set up your organization's intelligence layer</div>
          </div>

          {error && <div style={styles.error}>{error}</div>}

          <form onSubmit={submit} style={styles.form}>
            {[
              { name: 'name',             label: 'FULL NAME',          type: 'text',     ph: 'John Doe' },
              { name: 'email',            label: 'EMAIL ADDRESS',      type: 'email',    ph: 'you@company.com' },
              { name: 'organizationName', label: 'ORGANIZATION NAME',  type: 'text',     ph: 'AstraNova Technologies' },
              { name: 'password',         label: 'PASSWORD',           type: 'password', ph: '••••••••' },
            ].map(f => (
              <div key={f.name}>
                <label style={styles.label}>{f.label}</label>
                <input
                  name={f.name} type={f.type} value={form[f.name]}
                  onChange={handle} required placeholder={f.ph}
                  style={styles.input}
                />
              </div>
            ))}

            <button type="submit" disabled={loading} style={{ ...styles.btn, opacity: loading ? 0.6 : 1 }}>
              {loading
                ? <span style={styles.spinner} />
                : 'INITIALIZE SYSTEM →'}
            </button>
          </form>

          <div style={styles.switchText}>
            Already have access?{' '}
            <Link to="/login" style={styles.link}>Sign in here</Link>
          </div>
        </div>
      </div>
    </div>
  )
}

const styles = {
  root: { display: 'flex', height: '100vh', width: '100vw', overflow: 'hidden', position: 'relative', background: '#040404' },
  bg: { position: 'absolute', inset: 0, backgroundImage: `url('/gojo.png')`, backgroundSize: 'cover', backgroundPosition: 'center 30%', filter: 'brightness(0.35) contrast(1.1)', zIndex: 0 },
  overlay: { position: 'absolute', inset: 0, background: 'linear-gradient(105deg, rgba(4,4,4,0.1) 0%, rgba(4,4,4,0.55) 40%, rgba(4,4,4,0.97) 100%)', zIndex: 1 },
  scanlines: { position: 'absolute', inset: 0, zIndex: 2, pointerEvents: 'none', backgroundImage: 'repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(0,0,0,0.07) 2px, rgba(0,0,0,0.07) 4px)' },
  left: { flex: 1, display: 'flex', alignItems: 'flex-end', padding: '60px', position: 'relative', zIndex: 3 },
  logo: { fontFamily: "'Bebas Neue', sans-serif", fontSize: 72, lineHeight: 0.9, color: '#fff', letterSpacing: 4 },
  tagline: { fontFamily: "'DM Mono', monospace", fontSize: 11, letterSpacing: 3, color: '#666', marginTop: 20, lineHeight: 1.8 },
  steps: { display: 'flex', flexDirection: 'column', gap: 12, marginTop: 32 },
  step: { display: 'flex', alignItems: 'center', gap: 14 },
  stepNum: { fontFamily: "'Bebas Neue', sans-serif", fontSize: 18, color: '#333', letterSpacing: 2, minWidth: 28 },
  stepText: { fontFamily: "'DM Mono', monospace", fontSize: 10, color: '#555', letterSpacing: 1 },
  right: { width: 480, display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative', zIndex: 3, padding: '40px', borderLeft: '1px solid rgba(255,255,255,0.04)', background: 'rgba(8,8,8,0.88)', backdropFilter: 'blur(20px)' },
  cardHeader: { marginBottom: 30 },
  cardTitle: { fontFamily: "'Bebas Neue', sans-serif", fontSize: 36, letterSpacing: 4, color: '#fff' },
  cardSub: { fontFamily: "'DM Mono', monospace", fontSize: 10, color: '#555', letterSpacing: 1.5, marginTop: 8 },
  error: { background: 'rgba(255,59,59,0.08)', border: '1px solid rgba(255,59,59,0.3)', color: '#ff6b6b', padding: '10px 14px', fontSize: 11, letterSpacing: 1, marginBottom: 20 },
  form: { display: 'flex', flexDirection: 'column', gap: 4 },
  label: { fontFamily: "'DM Mono', monospace", fontSize: 9, letterSpacing: 2, color: '#555', display: 'block', marginBottom: 6, marginTop: 14 },
  input: { background: 'rgba(255,255,255,0.03)', border: '1px solid #2a2a2a', color: '#e0e0e0', padding: '12px 16px', fontSize: 12, letterSpacing: 0.5, outline: 'none', width: '100%' },
  btn: { marginTop: 24, background: '#e8e8e8', color: '#080808', border: 'none', padding: '14px', fontSize: 12, letterSpacing: 2, fontFamily: "'DM Mono', monospace", fontWeight: 500, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 },
  spinner: { display: 'inline-block', width: 14, height: 14, border: '2px solid #444', borderTop: '2px solid #080808', borderRadius: '50%', animation: 'spin 0.7s linear infinite' },
  switchText: { fontFamily: "'DM Mono', monospace", fontSize: 10, color: '#444', marginTop: 20, textAlign: 'center', letterSpacing: 1 },
  link: { color: '#888', borderBottom: '1px solid #333' },
}
