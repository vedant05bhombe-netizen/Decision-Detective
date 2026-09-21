import { useState, useRef, useEffect } from 'react'
import { uploadAPI } from '../services/api'

const statusColor = s => {
  if (s === 'DONE')       return '#6a6'
  if (s === 'FAILED')     return '#f44'
  if (s === 'PROCESSING') return '#aaa'
  return '#555'
}

const statusLabel = s => {
  if (s === 'DONE')       return '✓ PROCESSED'
  if (s === 'FAILED')     return '✗ FAILED'
  if (s === 'PROCESSING') return '⟳ PROCESSING'
  return '○ PENDING'
}

export default function Upload() {
  const [datasets, setDatasets] = useState([])
  const [uploading, setUploading] = useState(false)
  const [drag, setDrag] = useState(false)
  const [progress, setProgress] = useState(null)
  const [error, setError] = useState('')
  const inputRef = useRef(null)

  const loadDatasets = () => {
    uploadAPI.getDatasets()
      .then(r => setDatasets(r.data ?? []))
      .catch(() => {})
  }

  useEffect(() => {
    loadDatasets()
    const interval = setInterval(() => {
      if (datasets.some(d => d.status === 'PROCESSING' || d.status === 'PENDING')) {
        loadDatasets()
      }
    }, 3000)
    return () => clearInterval(interval)
  }, [datasets])

  const doUpload = async file => {
    if (!file) return
    const allowed = ['csv', 'pdf', 'txt']
    const ext = file.name.split('.').pop().toLowerCase()
    if (!allowed.includes(ext)) { setError('Only CSV, PDF, TXT files allowed'); return }
    setError('')
    setUploading(true)
    setProgress('Uploading...')
    try {
      await uploadAPI.upload(file)
      setProgress('Upload complete! Embedding in progress...')
      loadDatasets()
      setTimeout(() => setProgress(null), 3000)
    } catch (err) {
      setError(err.response?.data?.message ?? 'Upload failed')
      setProgress(null)
    } finally {
      setUploading(false)
    }
  }

  const onDrop = e => {
    e.preventDefault(); setDrag(false)
    const file = e.dataTransfer.files[0]
    if (file) doUpload(file)
  }

  const onSelect = e => { const f = e.target.files[0]; if (f) doUpload(f) }

  return (
    <div style={S.root}>
      <div style={S.header}>
        <div style={S.headerTitle}>DOCUMENT UPLOAD</div>
        <div style={S.headerSub}>Upload company documents to power AI decisions</div>
      </div>

      <div style={S.body}>
       
        <div
          style={{ ...S.dropzone, ...(drag ? S.dropzoneActive : {}) }}
          onDragOver={e => { e.preventDefault(); setDrag(true) }}
          onDragLeave={() => setDrag(false)}
          onDrop={onDrop}
          onClick={() => inputRef.current?.click()}
        >
          <input ref={inputRef} type="file" accept=".csv,.pdf,.txt" style={{ display: 'none' }} onChange={onSelect} />
          <div style={S.dropIcon}>{uploading ? '⟳' : '↑'}</div>
          <div style={S.dropTitle}>{uploading ? 'UPLOADING...' : 'DROP FILE HERE'}</div>
          <div style={S.dropSub}>{uploading ? (progress ?? '') : 'or click to browse — CSV, PDF, TXT supported'}</div>
          {!uploading && (
            <div style={S.formats}>
              {['CSV', 'PDF', 'TXT'].map(f => <span key={f} style={S.format}>{f}</span>)}
            </div>
          )}
          {uploading && <div style={S.progressBar}><div style={S.progressFill} /></div>}
        </div>

        {error && <div style={S.error}>{error}</div>}
        {progress && !uploading && <div style={S.success}>{progress}</div>}

        
        <div style={S.tableWrap}>
          <div style={S.tableHeader}>
            <span style={S.tableTitle}>UPLOADED DOCUMENTS</span>
            <span style={S.tableCount}>{datasets.length} files</span>
          </div>

          {datasets.length === 0 ? (
            <div style={S.empty}>No documents uploaded yet. Upload your first file above.</div>
          ) : (
            <table style={S.table}>
              <thead>
                <tr>
                  {['FILENAME', 'TYPE', 'STATUS', 'CHUNKS', 'UPLOADED'].map(h => (
                    <th key={h} style={S.th}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {datasets.map(d => (
                  <tr key={d.id} style={S.tr}>
                    <td style={S.td}>
                      <span style={S.filename}>{d.fileName}</span>
                    </td>
                    <td style={S.td}>
                      <span style={S.badge}>{d.fileType?.toUpperCase()}</span>
                    </td>
                    <td style={S.td}>
                      <span style={{ ...S.statusBadge, color: statusColor(d.status), borderColor: `${statusColor(d.status)}40` }}>
                        {statusLabel(d.status)}
                      </span>
                    </td>
                    <td style={{ ...S.td, ...S.tdCenter }}>{d.chunkCount ?? '—'}</td>
                    <td style={S.td}>
                      <span style={S.date}>{d.uploadedAt ? new Date(d.uploadedAt).toLocaleDateString() : '—'}</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  )
}

const S = {
  root: { height: '100%', display: 'flex', flexDirection: 'column', background: '#080808', overflow: 'hidden' },
  header: { padding: '20px 32px', borderBottom: '1px solid #141414', flexShrink: 0 },
  headerTitle: { fontFamily: "'Syne', sans-serif", fontSize: 16, fontWeight: 700, letterSpacing: 2, color: '#ddd' },
  headerSub: { fontFamily: "'DM Mono', monospace", fontSize: 9, color: '#444', letterSpacing: 1, marginTop: 4 },
  body: { flex: 1, overflowY: 'auto', padding: '32px' },

  dropzone: {
    border: '1px dashed #2a2a2a', background: '#0a0a0a',
    padding: '56px 40px', display: 'flex', flexDirection: 'column', alignItems: 'center',
    cursor: 'pointer', transition: 'all 0.2s', marginBottom: 24,
  },
  dropzoneActive: { border: '1px dashed #888', background: 'rgba(255,255,255,0.02)' },
  dropIcon: { fontSize: 40, color: '#333', marginBottom: 16, fontFamily: "'Bebas Neue', sans-serif" },
  dropTitle: { fontFamily: "'Bebas Neue', sans-serif", fontSize: 22, letterSpacing: 4, color: '#555' },
  dropSub: { fontFamily: "'DM Mono', monospace", fontSize: 10, color: '#333', marginTop: 8, letterSpacing: 1 },
  formats: { display: 'flex', gap: 8, marginTop: 20 },
  format: { fontFamily: "'DM Mono', monospace", fontSize: 9, color: '#444', border: '1px solid #1e1e1e', padding: '4px 10px', letterSpacing: 1 },
  progressBar: { width: '100%', maxWidth: 300, height: 2, background: '#1a1a1a', marginTop: 20, overflow: 'hidden' },
  progressFill: { height: '100%', width: '60%', background: '#888', animation: 'pulse 1s ease-in-out infinite' },

  error: { background: 'rgba(255,68,68,0.06)', border: '1px solid rgba(255,68,68,0.2)', color: '#f88', padding: '10px 16px', fontSize: 10, letterSpacing: 1, marginBottom: 16, fontFamily: "'DM Mono', monospace" },
  success: { background: 'rgba(100,180,100,0.06)', border: '1px solid rgba(100,180,100,0.2)', color: '#8c8', padding: '10px 16px', fontSize: 10, letterSpacing: 1, marginBottom: 16, fontFamily: "'DM Mono', monospace" },

  tableWrap: { background: '#0a0a0a', border: '1px solid #141414' },
  tableHeader: { padding: '14px 20px', borderBottom: '1px solid #141414', display: 'flex', justifyContent: 'space-between', alignItems: 'center' },
  tableTitle: { fontFamily: "'DM Mono', monospace", fontSize: 9, letterSpacing: 2, color: '#555' },
  tableCount: { fontFamily: "'DM Mono', monospace", fontSize: 9, color: '#2a2a2a' },
  table: { width: '100%', borderCollapse: 'collapse' },
  th: { fontFamily: "'DM Mono', monospace", fontSize: 8, letterSpacing: 2, color: '#333', padding: '10px 20px', textAlign: 'left', borderBottom: '1px solid #141414' },
  tr: { borderBottom: '1px solid #0f0f0f' },
  td: { fontFamily: "'DM Mono', monospace", fontSize: 10, color: '#666', padding: '12px 20px' },
  tdCenter: { textAlign: 'center' },
  filename: { color: '#888', letterSpacing: 0.3 },
  badge: { background: '#111', border: '1px solid #1e1e1e', padding: '2px 8px', fontSize: 8, letterSpacing: 1, color: '#555' },
  statusBadge: { border: '1px solid', padding: '2px 8px', fontSize: 8, letterSpacing: 1 },
  date: { color: '#444' },
  empty: { fontFamily: "'DM Mono', monospace", fontSize: 10, color: '#2a2a2a', padding: '40px 20px', textAlign: 'center', letterSpacing: 1 },
}
