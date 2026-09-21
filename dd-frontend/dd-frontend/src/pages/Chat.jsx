
import { useState, useRef, useEffect, useCallback } from 'react'
import { useAuth } from '../context/AuthContext'
import { chatAPI, decisionsAPI } from '../services/api'


const verdictColor  = v => v === 'YES' ? '#4ade80' : v === 'NO' ? '#f87171' : '#fbbf24'
const verdictBg     = v => v === 'YES' ? 'rgba(74,222,128,0.06)' : v === 'NO' ? 'rgba(248,113,113,0.06)' : 'rgba(251,191,36,0.06)'
const verdictBorder = v => v === 'YES' ? 'rgba(74,222,128,0.22)' : v === 'NO' ? 'rgba(248,113,113,0.22)' : 'rgba(251,191,36,0.22)'

function extractVerdict(text, dataVerdict) {
  if (dataVerdict) {
    const v = String(dataVerdict).toUpperCase().trim()
    if (v === 'YES' || v === 'NO' || v === 'MAYBE') return v
  }
  if (!text) return null
  const u = text.toUpperCase()
  const m = u.match(/\*{0,2}VERDICT\*{0,2}\s*[:\-]?\s*\*{0,2}\s*(YES|NO|MAYBE)/)
  if (m) return m[1]
  if (u.includes('VERDICT')) {
    if (/\bYES\b/.test(u)) return 'YES'
    if (/\bNO\b/.test(u))  return 'NO'
    if (/\bMAYBE\b/.test(u)) return 'MAYBE'
  }
  return null
}

function parseResponse(text) {
  if (!text) return { isStructured: false, reasoning: [], keyFacts: [] }
  const rMatch = text.match(/(?:\d+\.\s*)?\*{0,2}REASONING\*{0,2}:?\s*([\s\S]*?)(?=\d+\.\s*\*{0,2}KEY FACTS|KEY FACTS|$)/i)
  const kMatch = text.match(/(?:\d+\.\s*)?\*{0,2}KEY FACTS[^:]*\*{0,2}:?\s*([\s\S]*?)$/i)
  const reasoning = rMatch ? rMatch[1].split(/\n/).map(l => l.replace(/^[\s\-•◦*]+/, '').replace(/^\*\*Step\s*\d+:\*\*\s*/i, '').trim()).filter(Boolean) : []
  const keyFacts  = kMatch ? kMatch[1].split(/\n/).map(l => l.replace(/^[\s\-•◦*]+/, '').trim()).filter(Boolean) : []
  return { isStructured: reasoning.length > 0 || keyFacts.length > 0, reasoning, keyFacts }
}


function ConfRing({ value }) {
  const map = { high: 82, medium: 52, low: 24 }
  const pct = map[(value || 'medium').toLowerCase()] ?? 52
  const col = pct > 70 ? '#4ade80' : pct > 40 ? '#fbbf24' : '#f87171'
  const r = 20, circ = 2 * Math.PI * r
  return (
    <svg width="54" height="54" viewBox="0 0 54 54">
      <circle cx="27" cy="27" r={r} fill="none" stroke="#1a1a1a" strokeWidth="5"/>
      <circle cx="27" cy="27" r={r} fill="none" stroke={col} strokeWidth="5"
        strokeDasharray={`${circ * pct / 100} ${circ * (1 - pct / 100)}`}
        strokeDashoffset={circ * 0.25} strokeLinecap="round"/>
      <text x="27" y="31" textAnchor="middle" fill={col} fontSize="10" fontWeight="600">{pct}%</text>
    </svg>
  )
}


function AIMessage({ msg }) {
  const parsed = parseResponse(msg.text)
  const v = msg.verdict
  return (
    <div style={{ display: 'flex', flexDirection: 'column' }}>
      {v && (
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '7px 14px', background: verdictBg(v), border: `1px solid ${verdictBorder(v)}`, borderBottom: 'none', borderRadius: '8px 8px 0 0' }}>
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontSize: 13, fontWeight: 700, letterSpacing: 1.5, color: verdictColor(v) }}>
            <span style={{ width: 6, height: 6, borderRadius: '50%', background: verdictColor(v), display: 'inline-block' }}/>
            VERDICT: {v}
          </span>
          {msg.decision?.confidence && (
            <span style={{ fontSize: 11, color: '#555' }}>· {msg.decision.confidence} confidence</span>
          )}
        </div>
      )}
      <div style={{ background: '#0f0f0f', border: '1px solid rgba(255,255,255,0.07)', borderRadius: v ? '0 0 8px 2px' : '8px 8px 8px 2px', padding: '14px 16px' }}>
        {parsed.isStructured ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            {parsed.reasoning.length > 0 && (
              <div>
                <div style={MS.secLabel}>Reasoning</div>
                {parsed.reasoning.map((step, i) => (
                  <div key={i} style={{ display: 'flex', gap: 10, marginBottom: 10, alignItems: 'flex-start' }}>
                    <span style={MS.badge}>{i + 1}</span>
                    <span style={MS.stepText}>{step}</span>
                  </div>
                ))}
              </div>
            )}
            {parsed.keyFacts.length > 0 && (
              <div style={{ borderTop: '1px solid rgba(255,255,255,0.05)', paddingTop: 12 }}>
                <div style={MS.secLabel}>Key Facts</div>
                {parsed.keyFacts.map((f, i) => (
                  <div key={i} style={{ display: 'flex', gap: 8, marginBottom: 6 }}>
                    <span style={{ color: '#4a6fa5', fontSize: 13, flexShrink: 0 }}>—</span>
                    <span style={{ fontSize: 13, color: '#7a9cc4', lineHeight: 1.65 }}>{f}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        ) : (
          <div style={{ fontSize: 13.5, color: '#d0d0d0', lineHeight: 1.7, whiteSpace: 'pre-wrap' }}>{msg.text}</div>
        )}
      </div>
      {msg.flip && (
        <div style={{ marginTop: 2, background: '#0a0a0a', border: '1px solid rgba(255,255,255,0.05)', borderRadius: '0 0 8px 8px' }}>
          <div style={{ padding: '8px 14px', borderBottom: '1px solid rgba(255,255,255,0.05)', display: 'flex', alignItems: 'center', gap: 6 }}>
            <span style={{ color: '#444', fontSize: 14 }}>↺</span>
            <span style={{ fontSize: 10, color: '#444', textTransform: 'uppercase', letterSpacing: '0.1em' }}>Flip Analysis</span>
          </div>
          <div style={{ padding: '12px 14px', fontSize: 12.5, color: '#666', lineHeight: 1.7 }}>{msg.flip}</div>
        </div>
      )}
      <div style={{ fontSize: 10, color: '#2a2a2a', marginTop: 5, letterSpacing: 1 }}>DECISION DETECTIVE — {msg.time}</div>
    </div>
  )
}

const MS = {
  secLabel: { fontSize: 10, color: '#444', textTransform: 'uppercase', letterSpacing: '0.12em', marginBottom: 10, fontWeight: 600 },
  badge: { fontSize: 11, fontWeight: 700, color: '#c8a96e', background: 'rgba(200,169,110,0.1)', border: '1px solid rgba(200,169,110,0.25)', borderRadius: 4, width: 22, height: 22, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, marginTop: 1 },
  stepText: { fontSize: 13.5, color: '#c0c0c0', lineHeight: 1.75, flex: 1 },
}

function DecisionPanel({ decision, conflicts, conflictsLoading }) {
  return (
    <div style={{ overflowY: 'auto', flex: 1 }}>
      <div style={DP.section}>
        <div style={DP.head}>Decision Details</div>
        {!decision ? (
          <div style={DP.empty}>Ask a question to see decision details here</div>
        ) : (
          <div>
            <div style={DP.decId}>Decision #{decision.id || '—'}</div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14, padding: '12px', background: '#111', borderRadius: 8, border: '1px solid rgba(255,255,255,0.06)' }}>
              <div>
                <div style={DP.lbl}>Confidence</div>
                <div style={{ fontSize: 15, fontWeight: 600, color: '#fff', marginTop: 4 }}>{decision.confidence || 'Medium'}</div>
              </div>
              <ConfRing value={decision.confidence} />
            </div>
            {decision.verdict && (
              <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '4px 10px', marginBottom: 12, background: verdictBg(decision.verdict), border: `1px solid ${verdictBorder(decision.verdict)}`, borderRadius: 6 }}>
                <span style={{ width: 5, height: 5, borderRadius: '50%', background: verdictColor(decision.verdict) }}/>
                <span style={{ fontSize: 12, fontWeight: 700, color: verdictColor(decision.verdict), letterSpacing: 1.5 }}>{decision.verdict}</span>
              </div>
            )}
            {[
              { lbl: 'Created by', val: decision.createdBy },
              { lbl: 'Created on', val: decision.createdAt ? new Date(decision.createdAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }) : null },
              { lbl: 'Related to', val: decision.relatedTo || decision.project },
            ].map((r, i) => r.val && (
              <div key={i} style={DP.row}>
                <span style={DP.lbl}>{r.lbl}</span>
                <span style={DP.val}>{r.val}</span>
              </div>
            ))}
            {decision.context && (
              <div style={{ marginTop: 12, padding: '10px 12px', background: '#111', borderRadius: 7, fontSize: 12.5, color: '#888', lineHeight: 1.65, border: '1px solid rgba(255,255,255,0.05)' }}>{decision.context}</div>
            )}
          </div>
        )}
      </div>
      <div style={DP.section}>
        <div style={{ ...DP.head, color: '#fbbf24', display: 'flex', alignItems: 'center', gap: 6 }}>⚠ Conflict Alerts</div>
        {conflictsLoading ? <div style={DP.empty}>Loading...</div>
          : !conflicts?.length ? <div style={DP.empty}>No active conflicts</div>
          : conflicts.map((c, i) => (
            <div key={i} style={DP.conflictCard}>
              <div style={{ width: 6, height: 6, borderRadius: '50%', marginTop: 4, flexShrink: 0, background: c.severity === 'high' ? '#f87171' : c.severity === 'medium' ? '#fbbf24' : '#4ade80' }}/>
              <div>
                <div style={{ fontSize: 13, color: '#e0e0e0', fontWeight: 500, marginBottom: 2 }}>{c.title || c.type}</div>
                <div style={{ fontSize: 11.5, color: '#555' }}>{c.date || c.detectedAt}</div>
                <div style={{ fontSize: 12, color: '#888', marginTop: 2 }}>{c.reason || c.description}</div>
              </div>
            </div>
          ))}
      </div>
      <div style={{ ...DP.section, borderBottom: 'none' }}>
        <div style={{ fontSize: 10, color: '#333', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 10 }}>Today</div>
        {!conflicts?.filter(c => c.today)?.length
          ? <div style={DP.empty}>No conflicts today</div>
          : conflicts.filter(c => c.today).map((c, i) => (
            <div key={i} style={{ padding: '7px 0', borderBottom: '1px solid rgba(255,255,255,0.04)', fontSize: 13, color: '#888', cursor: 'pointer' }}>› {c.title}</div>
          ))}
      </div>
    </div>
  )
}

const DP = {
  section: { padding: '16px 14px', borderBottom: '1px solid rgba(255,255,255,0.05)' },
  head: { fontSize: 14, fontWeight: 600, color: '#fff', marginBottom: 12 },
  empty: { fontSize: 12, color: '#333', padding: '6px 0', lineHeight: 1.6 },
  decId: { fontSize: 11, color: '#d4a843', fontWeight: 600, letterSpacing: '0.06em', textTransform: 'uppercase', marginBottom: 12 },
  row: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '7px 0', borderBottom: '1px solid rgba(255,255,255,0.04)' },
  lbl: { fontSize: 11, color: '#555', textTransform: 'uppercase', letterSpacing: '0.06em' },
  val: { fontSize: 13, color: '#e0e0e0' },
  conflictCard: { display: 'flex', gap: 10, background: '#111', border: '1px solid rgba(255,255,255,0.05)', borderRadius: 7, padding: '10px', marginBottom: 6 },
}


export default function ChatPage() {
  const { user } = useAuth()
  const [messages,    setMessages]    = useState([])
  const [history,     setHistory]     = useState([])
  const [chatId,      setChatId]      = useState(() => `chat-${Date.now()}`)
  const [input,       setInput]       = useState('')
  const [loading,     setLoading]     = useState(false)
  const [showPanel,   setShowPanel]   = useState(true)
  const [activeDecision, setActiveDecision] = useState(null)
  const [conflicts,   setConflicts]   = useState([])
  const [conflictsLoading, setConflictsLoading] = useState(false)
  const [hoveredChat, setHoveredChat] = useState(null)
  const bottomRef = useRef(null)
  const inputRef  = useRef(null)

  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: 'smooth' }) }, [messages, loading])

  useEffect(() => {
    decisionsAPI.getAll()
      .then(res => {
        const d = Array.isArray(res.data) ? res.data : Array.isArray(res) ? res : []
        setConflicts(d)
      })
      .catch(() => setConflicts([]))
  }, [])

  const newChat = useCallback(() => {
    if (messages.length > 0) {
      setHistory(h => [{
        id: chatId,
        title: messages.find(m => m.role === 'user')?.text?.slice(0, 36) ?? 'Session',
        messages,
        createdAt: Date.now(),
      }, ...h])
    }
    setMessages([])
    setChatId(`chat-${Date.now()}`)
    setActiveDecision(null)
    setTimeout(() => inputRef.current?.focus(), 50)
  }, [messages, chatId])

  const send = useCallback(async () => {
    const msg = input.trim()
    if (!msg || loading) return
    setInput('')
    const time = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    setMessages(m => [...m, { id: Date.now(), role: 'user', text: msg, time }])
    setLoading(true)
    try {
      const res = await chatAPI.send(msg, chatId)
      const data = res.data ?? res
      const verdict = extractVerdict(data.response || data.message, data.verdict ?? data.decision?.verdict)
      const decision = data.decision ? { ...data.decision, verdict } : null
      setMessages(m => [...m, {
        id: Date.now() + 1, role: 'assistant',
        text: data.response || data.message || 'Received.',
        verdict, flip: data.flipAnalysis, decision,
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      }])
      if (decision) setActiveDecision(decision)
    } catch (err) {
      setMessages(m => [...m, { id: Date.now() + 1, role: 'assistant', text: `Error: ${err.message}`, time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) }])
    }
    setLoading(false)
    inputRef.current?.focus()
  }, [input, loading, chatId])

  const currentTitle = messages.find(m => m.role === 'user')?.text?.slice(0, 40) || 'New conversation'

  return (
    <div style={S.shell}>

      {/* Sidebar */}
      <div style={S.sidebar}>
        <div style={S.sidebarHead}>
          <span style={S.sidebarTitle}>Conversations</span>
          <button style={S.newBtn} onClick={newChat}>+</button>
        </div>
        <div style={{ flex: 1, overflowY: 'auto', padding: '6px' }}>
          {/* Current */}
          <div style={{ ...S.chatItem, borderLeft: '2px solid #555', background: '#111' }}>
            <div style={{ fontSize: 12.5, color: '#c0c0c0', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{currentTitle}</div>
            <div style={{ fontSize: 11, color: '#333', marginTop: 3 }}>{messages.length} messages</div>
          </div>
          {/* History */}
          {history.map(chat => (
            <div key={chat.id}
              style={{ ...S.chatItem, borderLeft: '2px solid transparent' }}
              onClick={() => { setMessages(chat.messages); setChatId(chat.id) }}
              onMouseEnter={() => setHoveredChat(chat.id)}
              onMouseLeave={() => setHoveredChat(null)}>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: 12.5, color: '#666', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{chat.title}</div>
                <div style={{ fontSize: 11, color: '#2a2a2a', marginTop: 3 }}>{new Date(chat.createdAt).toLocaleDateString()}</div>
              </div>
              {hoveredChat === chat.id && (
                <button style={S.delBtn} onClick={e => { e.stopPropagation(); setHistory(h => h.filter(c => c.id !== chat.id)) }}>✕</button>
              )}
            </div>
          ))}
        </div>
        {/* Timeline */}
        <div style={S.timelineBox}>
          <div style={S.timelineLabel}>↗ Decision Timeline</div>
          {messages.filter(m => m.verdict).length === 0
            ? <div style={{ fontSize: 11, color: '#2a2a2a', padding: '6px 0' }}>No timeline data</div>
            : messages.filter(m => m.verdict).slice(-5).reverse().map((m, i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
                <span style={{ width: 6, height: 6, borderRadius: '50%', background: verdictColor(m.verdict), flexShrink: 0, boxShadow: `0 0 4px ${verdictColor(m.verdict)}` }}/>
                <span style={{ fontSize: 11, color: '#555', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', flex: 1 }}>{m.text.slice(0, 28)}…</span>
                <span style={{ fontSize: 10, color: verdictColor(m.verdict), fontWeight: 700, flexShrink: 0 }}>{m.verdict}</span>
              </div>
            ))
          }
        </div>
      </div>

      {/* Main */}
      <div style={S.main}>
        <div style={S.header}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={S.avatar}>◈</div>
            <div>
              <div style={S.headerTitle}>{currentTitle}</div>
              <div style={{ fontSize: 11, color: '#4ade80', display: 'flex', alignItems: 'center', gap: 5, marginTop: 2 }}>
                <span style={{ width: 5, height: 5, borderRadius: '50%', background: '#4ade80', display: 'inline-block' }}/>
                Connected · port 8080
              </div>
            </div>
          </div>
          <div style={{ display: 'flex', gap: 8 }}>
            <button style={S.headBtn} onClick={newChat}>+ New chat</button>
            <button style={{ ...S.headBtn, color: showPanel ? '#d4a843' : '#444' }} onClick={() => setShowPanel(s => !s)}>⊞</button>
          </div>
        </div>

        <div style={S.msgs}>
          {messages.length === 0 && (
            <div style={S.emptyState}>
              <div style={{ fontSize: 40, color: '#1a1a1a', marginBottom: 16 }}>◈</div>
              <div style={{ fontSize: 20, fontWeight: 700, color: '#2a2a2a', letterSpacing: 4, marginBottom: 8 }}>DECISION DETECTIVE</div>
              <div style={{ fontSize: 12, color: '#2a2a2a', marginBottom: 24 }}>Ask a question about your uploaded company documents</div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, justifyContent: 'center' }}>
                {['What is the leave policy?', 'Who can be promoted?', 'What are the working hours?', 'What security rules apply?'].map(s => (
                  <button key={s} onClick={() => { setInput(s); inputRef.current?.focus() }} style={S.suggestion}>{s}</button>
                ))}
              </div>
            </div>
          )}

          {messages.map(msg => (
            <div key={msg.id} style={{ display: 'flex', justifyContent: msg.role === 'user' ? 'flex-end' : 'flex-start', alignItems: 'flex-end', gap: 10 }}>
              {msg.role === 'assistant' && <div style={S.avatar}>◈</div>}
              <div style={{ maxWidth: '68%' }}>
                {msg.role === 'assistant' ? <AIMessage msg={msg} /> : (
                  <>
                    <div style={S.userBubble}>{msg.text}</div>
                    <div style={{ fontSize: 10, color: '#2a2a2a', marginTop: 4, textAlign: 'right', letterSpacing: 1 }}>{user?.name?.toUpperCase() ?? 'YOU'} — {msg.time}</div>
                  </>
                )}
              </div>
            </div>
          ))}

          {loading && (
            <div style={{ display: 'flex', alignItems: 'flex-end', gap: 10 }}>
              <div style={S.avatar}>◈</div>
              <div style={{ background: '#0f0f0f', border: '1px solid rgba(255,255,255,0.07)', borderRadius: '8px 8px 8px 2px', padding: '14px 18px', display: 'flex', gap: 6 }}>
                {[0,1,2].map(i => <div key={i} style={{ width: 5, height: 5, borderRadius: '50%', background: '#333', animation: `pulse 1.2s ${i*0.2}s ease-in-out infinite` }}/>)}
              </div>
            </div>
          )}
          <div ref={bottomRef}/>
        </div>

        <div style={S.inputArea}>
          <div style={S.inputBox}>
            <textarea ref={inputRef} value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); send() } }}
              placeholder="Ask about your decisions, policies, or data..."
              rows={2} style={S.textarea}/>
            <button onClick={send} disabled={loading || !input.trim()}
              style={{ ...S.sendBtn, opacity: (loading || !input.trim()) ? 0.3 : 1 }}>→</button>
          </div>
          <div style={{ fontSize: 10, color: '#2a2a2a', marginTop: 6, textAlign: 'center', letterSpacing: 1 }}>ENTER TO SEND — SHIFT+ENTER FOR NEW LINE</div>
        </div>
      </div>

      {/* Right Panel */}
      {showPanel && (
        <div style={S.rightPanel}>
          <div style={{ padding: '13px 14px', borderBottom: '1px solid rgba(255,255,255,0.05)', fontSize: 13, fontWeight: 600, color: '#c0c0c0' }}>Decision Details</div>
          <DecisionPanel decision={activeDecision} conflicts={conflicts} conflictsLoading={conflictsLoading}/>
        </div>
      )}
    </div>
  )
}

const S = {
  shell: { display: 'flex', height: '100%', overflow: 'hidden', background: '#080808', fontFamily: 'system-ui, -apple-system, sans-serif' },
  sidebar: { width: 210, flexShrink: 0, background: '#080808', borderRight: '1px solid rgba(255,255,255,0.05)', display: 'flex', flexDirection: 'column', overflow: 'hidden' },
  sidebarHead: { padding: '13px 12px', borderBottom: '1px solid rgba(255,255,255,0.05)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' },
  sidebarTitle: { fontSize: 13, fontWeight: 600, color: '#c0c0c0' },
  newBtn: { width: 26, height: 26, background: '#1a1a1a', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 6, color: '#888', fontSize: 18, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', lineHeight: 1, padding: 0 },
  chatItem: { padding: '9px 8px', borderRadius: 7, cursor: 'pointer', marginBottom: 2, display: 'flex', alignItems: 'center', gap: 6 },
  delBtn: { color: '#444', background: 'none', border: 'none', cursor: 'pointer', fontSize: 11, padding: 4, flexShrink: 0 },
  timelineBox: { padding: '12px', borderTop: '1px solid rgba(255,255,255,0.05)' },
  timelineLabel: { fontSize: 10, color: '#333', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 8 },
  main: { flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' },
  header: { padding: '11px 18px', borderBottom: '1px solid rgba(255,255,255,0.05)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: '#080808', flexShrink: 0 },
  avatar: { width: 30, height: 30, borderRadius: 8, background: '#111', border: '1px solid rgba(255,255,255,0.08)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#d4a843', flexShrink: 0, fontSize: 13 },
  headerTitle: { fontSize: 13.5, fontWeight: 500, color: '#e0e0e0' },
  headBtn: { display: 'flex', alignItems: 'center', background: '#111', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 7, padding: '6px 12px', color: '#555', fontSize: 12.5, cursor: 'pointer' },
  msgs: { flex: 1, overflowY: 'auto', padding: '20px 18px', display: 'flex', flexDirection: 'column', gap: 16 },
  emptyState: { display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', flex: 1, textAlign: 'center', padding: '40px 20px', margin: 'auto' },
  suggestion: { background: 'none', border: '1px solid #1e1e1e', color: '#555', padding: '8px 14px', fontSize: 11, cursor: 'pointer', borderRadius: 6 },
  userBubble: { background: '#fff', color: '#000', fontWeight: 500, padding: '10px 14px', borderRadius: '10px 10px 2px 10px', fontSize: 13.5, lineHeight: 1.6 },
  inputArea: { padding: '12px 16px 14px', borderTop: '1px solid rgba(255,255,255,0.05)', background: '#080808', flexShrink: 0 },
  inputBox: { display: 'flex', alignItems: 'flex-end', gap: 8, background: '#0f0f0f', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 10, padding: '8px 8px 8px 14px' },
  textarea: { flex: 1, background: 'none', border: 'none', outline: 'none', color: '#e0e0e0', fontSize: 13.5, resize: 'none', lineHeight: 1.5, maxHeight: 110, overflowY: 'auto', paddingTop: 3, fontFamily: 'system-ui, sans-serif' },
  sendBtn: { background: '#fff', border: 'none', borderRadius: 7, width: 34, height: 34, fontSize: 18, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#000', flexShrink: 0, cursor: 'pointer' },
  rightPanel: { width: 252, background: '#080808', borderLeft: '1px solid rgba(255,255,255,0.05)', display: 'flex', flexDirection: 'column', overflow: 'hidden' },
}