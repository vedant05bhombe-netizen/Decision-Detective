import { useState, useEffect } from 'react'
import { analyticsAPI, decisionsAPI } from '../services/api'
import { useAuth } from '../context/AuthContext'

const verdictColor = v => v === 'YES' ? '#aaa' : v === 'NO' ? '#f55' : '#777'

export default function Dashboard() {
  const { user } = useAuth()
  const [summary,   setSummary]   = useState(null)
  const [decisions, setDecisions] = useState([])
  const [audit,     setAudit]     = useState([])
  const [loading,   setLoading]   = useState(true)

  useEffect(() => {
    Promise.all([
      analyticsAPI.getSummary(),
      decisionsAPI.getAll(),
      analyticsAPI.getAudit(),
    ]).then(([s, d, a]) => {
      setSummary(s.data)
      setDecisions(d.data?.slice(0, 10) ?? [])
      setAudit(a.data?.slice(0, 10) ?? [])
    }).catch(() => {}).finally(() => setLoading(false))
  }, [])

  const stats = [
    { label: 'TOTAL DECISIONS', value: summary?.totalDecisions ?? 0, sub: 'all time' },
    { label: 'VERDICT YES',     value: summary?.verdictYes ?? 0,      sub: 'approved' },
    { label: 'VERDICT NO',      value: summary?.verdictNo ?? 0,       sub: 'rejected' },
    { label: 'DATASETS',        value: summary?.totalDatasets ?? 0,   sub: `${summary?.processedDatasets ?? 0} processed` },
  ]

  if (loading) return (
    <div style={{ ...S.root, alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: 18, color: '#333', letterSpacing: 4 }}>LOADING...</div>
    </div>
  )

  return (
    <div style={S.root}>
      <div style={S.header}>
        <div>
          <div style={S.headerTitle}>DASHBOARD</div>
          <div style={S.headerSub}>Organization intelligence overview</div>
        </div>
        <div style={S.orgBadge}>{user?.organizationName ?? user?.email?.split('@')[1]?.toUpperCase() ?? 'YOUR ORG'}</div>
      </div>

      <div style={S.body}>
        
        <div style={S.statsRow}>
          {stats.map(s => (
            <div key={s.label} style={S.statCard}>
              <div style={S.statLabel}>{s.label}</div>
              <div style={S.statValue}>{s.value}</div>
              <div style={S.statSub}>{s.sub}</div>
            </div>
          ))}
        </div>

        <div style={S.grid}>
          
          <div style={S.panel}>
            <div style={S.panelHeader}>
              <span style={S.panelTitle}>RECENT DECISIONS</span>
              <span style={S.panelCount}>{decisions.length}</span>
            </div>
            {decisions.length === 0 ? (
              <div style={S.empty}>No decisions yet. Start asking questions in AI Chat.</div>
            ) : decisions.map(d => (
              <div key={d.id} style={S.decisionRow}>
                <div style={{ ...S.verdictPill, color: verdictColor(d.verdict), borderColor: `${verdictColor(d.verdict)}40` }}>
                  {d.verdict ?? '?'}
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={S.decisionQ}>{d.question}</div>
                  <div style={S.decisionMeta}>{d.createdAt ? new Date(d.createdAt).toLocaleString() : ''}</div>
                </div>
              </div>
            ))}
          </div>

          
          <div style={S.panel}>
            <div style={S.panelHeader}>
              <span style={S.panelTitle}>AUDIT LOG</span>
              <span style={S.panelCount}>{audit.length}</span>
            </div>
            {audit.length === 0 ? (
              <div style={S.empty}>No audit logs yet.</div>
            ) : audit.map((a, i) => (
              <div key={i} style={S.auditRow}>
                <div style={S.auditDot} />
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={S.auditAction}>{a.action}</div>
                  <div style={S.auditDetail}>{a.details}</div>
                  <div style={S.auditMeta}>{a.performedBy} · {a.createdAt ? new Date(a.createdAt).toLocaleString() : ''}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        
        {summary && (
          <div style={S.verdictBreakdown}>
            <div style={S.panelHeader}>
              <span style={S.panelTitle}>VERDICT DISTRIBUTION</span>
            </div>
            <div style={S.barRow}>
              {[
                { label: 'YES',   value: summary.verdictYes,   color: '#888' },
                { label: 'NO',    value: summary.verdictNo,    color: '#f55' },
                { label: 'MAYBE', value: summary.verdictMaybe, color: '#666' },
              ].map(b => {
                const total = summary.totalDecisions || 1
                const pct = Math.round((b.value / total) * 100)
                return (
                  <div key={b.label} style={S.barItem}>
                    <div style={S.barLabelRow}>
                      <span style={{ ...S.barLabel, color: b.color }}>{b.label}</span>
                      <span style={S.barPct}>{pct}%</span>
                    </div>
                    <div style={S.barTrack}>
                      <div style={{ ...S.barFill, width: `${pct}%`, background: b.color }} />
                    </div>
                    <div style={S.barCount}>{b.value} decisions</div>
                  </div>
                )
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

const S = {
  root: { height: '100%', display: 'flex', flexDirection: 'column', background: '#080808', overflow: 'hidden' },
  header: { padding: '20px 32px', borderBottom: '1px solid #141414', flexShrink: 0, display: 'flex', justifyContent: 'space-between', alignItems: 'center' },
  headerTitle: { fontFamily: "'Syne', sans-serif", fontSize: 16, fontWeight: 700, letterSpacing: 2, color: '#ddd' },
  headerSub: { fontFamily: "'DM Mono', monospace", fontSize: 9, color: '#444', letterSpacing: 1, marginTop: 4 },
  orgBadge: { fontFamily: "'DM Mono', monospace", fontSize: 9, color: '#555', border: '1px solid #1e1e1e', padding: '6px 14px', letterSpacing: 2 },
  body: { flex: 1, overflowY: 'auto', padding: '24px 32px', display: 'flex', flexDirection: 'column', gap: 20 },

  statsRow: { display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12 },
  statCard: { background: '#0a0a0a', border: '1px solid #141414', padding: '20px' },
  statLabel: { fontFamily: "'DM Mono', monospace", fontSize: 8, letterSpacing: 2, color: '#333', marginBottom: 10 },
  statValue: { fontFamily: "'Bebas Neue', sans-serif", fontSize: 44, color: '#ddd', letterSpacing: 2, lineHeight: 1 },
  statSub: { fontFamily: "'DM Mono', monospace", fontSize: 8, color: '#2a2a2a', marginTop: 6, letterSpacing: 1 },

  grid: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 },
  panel: { background: '#0a0a0a', border: '1px solid #141414' },
  panelHeader: { padding: '12px 18px', borderBottom: '1px solid #0f0f0f', display: 'flex', justifyContent: 'space-between', alignItems: 'center' },
  panelTitle: { fontFamily: "'DM Mono', monospace", fontSize: 8, letterSpacing: 2, color: '#444' },
  panelCount: { fontFamily: "'DM Mono', monospace", fontSize: 9, color: '#2a2a2a' },

  decisionRow: { display: 'flex', gap: 12, padding: '10px 18px', borderBottom: '1px solid #0d0d0d', alignItems: 'flex-start' },
  verdictPill: { fontFamily: "'Bebas Neue', sans-serif", fontSize: 12, border: '1px solid', padding: '1px 7px', letterSpacing: 1, flexShrink: 0, marginTop: 1 },
  decisionQ: { fontFamily: "'DM Mono', monospace", fontSize: 10, color: '#666', lineHeight: 1.5, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' },
  decisionMeta: { fontFamily: "'DM Mono', monospace", fontSize: 8, color: '#2a2a2a', marginTop: 3 },

  auditRow: { display: 'flex', gap: 12, padding: '10px 18px', borderBottom: '1px solid #0d0d0d', alignItems: 'flex-start' },
  auditDot: { width: 5, height: 5, borderRadius: '50%', background: '#2a2a2a', marginTop: 4, flexShrink: 0 },
  auditAction: { fontFamily: "'DM Mono', monospace", fontSize: 10, color: '#666', letterSpacing: 1 },
  auditDetail: { fontFamily: "'DM Mono', monospace", fontSize: 9, color: '#444', marginTop: 2 },
  auditMeta: { fontFamily: "'DM Mono', monospace", fontSize: 8, color: '#2a2a2a', marginTop: 3 },

  empty: { fontFamily: "'DM Mono', monospace", fontSize: 9, color: '#2a2a2a', padding: '24px 18px', letterSpacing: 1 },

  verdictBreakdown: { background: '#0a0a0a', border: '1px solid #141414' },
  barRow: { display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 24, padding: '20px' },
  barItem: {},
  barLabelRow: { display: 'flex', justifyContent: 'space-between', marginBottom: 8 },
  barLabel: { fontFamily: "'Bebas Neue', sans-serif", fontSize: 16, letterSpacing: 2 },
  barPct: { fontFamily: "'DM Mono', monospace", fontSize: 9, color: '#444' },
  barTrack: { height: 3, background: '#141414', overflow: 'hidden' },
  barFill: { height: '100%', transition: 'width 0.8s ease' },
  barCount: { fontFamily: "'DM Mono', monospace", fontSize: 8, color: '#2a2a2a', marginTop: 6 },
}
