import { useState, useRef, useEffect } from 'react'

// ─── Design tokens ────────────────────────────────────────────────────────────
const C = {
  bg:           '#0D0D0D',
  surface:      '#141414',
  surfaceHover: '#1A1A1A',
  border:       '#2A2A2A',
  borderBright: '#3A3A3A',
  green:        '#00FF85',
  greenDim:     '#00CC6A',
  greenMuted:   'rgba(0,255,133,0.12)',
  greenBorder:  'rgba(0,255,133,0.25)',
  red:          '#FF4444',
  redMuted:     'rgba(255,68,68,0.12)',
  redBorder:    'rgba(255,68,68,0.25)',
  yellow:       '#FFD166',
  yellowMuted:  'rgba(255,209,102,0.12)',
  yellowBorder: 'rgba(255,209,102,0.25)',
  textPrimary:  '#E8E8E8',
  textSecondary:'#888888',
  textMuted:    '#555555',
  fontMono:     "'IBM Plex Mono', monospace",
  fontSans:     "'IBM Plex Sans', sans-serif",
}

// ─── Log entry types ──────────────────────────────────────────────────────────
function useLog() {
  const [entries, setEntries] = useState([])
  const push = (type, text) =>
    setEntries(prev => [...prev, { id: Date.now() + Math.random(), type, text, ts: new Date().toLocaleTimeString('en-US', { hour12: false }) }])
  const clear = () => setEntries([])
  return { entries, push, clear }
}

// ─── Components ───────────────────────────────────────────────────────────────

function TopBar() {
  return (
    <div style={{
      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      padding: '14px 28px',
      borderBottom: `1px solid ${C.border}`,
      background: C.surface,
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
        {/* Traffic lights */}
        <div style={{ display: 'flex', gap: 6 }}>
          {['#FF5F57','#FEBC2E','#28C840'].map((c, i) => (
            <div key={i} style={{ width: 12, height: 12, borderRadius: '50%', background: c }} />
          ))}
        </div>
        <span style={{ fontFamily: C.fontMono, fontSize: 13, color: C.textSecondary, marginLeft: 8 }}>
          catchthevibe-playground
        </span>
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        <StatusDot />
      </div>
    </div>
  )
}

function StatusDot() {
  const [status, setStatus] = useState('checking') // checking | up | down

  useEffect(() => {
    const check = () => {
      fetch('/api/ping', { signal: AbortSignal.timeout(3000) })
        .then(r => r.ok ? setStatus('up') : setStatus('down'))
        .catch(() => setStatus('down'))
    }
    check()
    const id = setInterval(check, 10000)
    return () => clearInterval(id)
  }, [])

  const color = status === 'up' ? C.green : status === 'down' ? C.red : C.yellow
  const label = status === 'up' ? 'backend online' : status === 'down' ? 'backend offline' : 'checking…'

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 7, fontFamily: C.fontMono, fontSize: 12, color: C.textSecondary }}>
      <div style={{
        width: 7, height: 7, borderRadius: '50%', background: color,
        boxShadow: status === 'up' ? `0 0 6px ${C.green}` : 'none',
        animation: status === 'checking' ? 'pulse 1.4s ease-in-out infinite' : 'none',
      }} />
      <style>{`@keyframes pulse { 0%,100%{opacity:.4} 50%{opacity:1} }`}</style>
      {label}
    </div>
  )
}

function LogPane({ entries, onClear }) {
  const bottomRef = useRef(null)
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [entries])

  const color = (type) => {
    if (type === 'success') return C.green
    if (type === 'error')   return C.red
    if (type === 'warn')    return C.yellow
    if (type === 'step')    return C.textSecondary
    return C.textPrimary
  }

  const prefix = (type) => {
    if (type === 'success') return '✓'
    if (type === 'error')   return '✕'
    if (type === 'warn')    return '!'
    if (type === 'step')    return '›'
    return '·'
  }

  return (
    <div style={{
      flex: 1, overflowY: 'auto', padding: '16px 20px',
      fontFamily: C.fontMono, fontSize: 12.5, lineHeight: 1.7,
      background: C.bg,
    }}>
      {entries.length === 0 ? (
        <div style={{ color: C.textMuted, fontStyle: 'italic', paddingTop: 4 }}>
          — no output yet. submit a project name to get started. —
        </div>
      ) : (
        <>
          {entries.map(e => (
            <div key={e.id} style={{ display: 'flex', gap: 12, alignItems: 'flex-start', marginBottom: 2 }}>
              <span style={{ color: C.textMuted, flexShrink: 0, userSelect: 'none' }}>{e.ts}</span>
              <span style={{ color: color(e.type), flexShrink: 0, userSelect: 'none', width: 10, textAlign: 'center' }}>{prefix(e.type)}</span>
              <span style={{ color: color(e.type), wordBreak: 'break-all' }}>{e.text}</span>
            </div>
          ))}
          <div ref={bottomRef} />
        </>
      )}
    </div>
  )
}

function DownloadButton({ href, filename }) {
  return (
    <a
      href={href}
      download={filename}
      style={{
        display: 'inline-flex', alignItems: 'center', gap: 8,
        padding: '10px 20px',
        background: C.greenMuted,
        border: `1px solid ${C.greenBorder}`,
        borderRadius: 4,
        fontFamily: C.fontMono, fontSize: 13, fontWeight: 600, color: C.green,
        textDecoration: 'none', cursor: 'pointer',
        transition: 'all 0.15s',
      }}
      onMouseEnter={e => { e.currentTarget.style.background = 'rgba(0,255,133,0.2)' }}
      onMouseLeave={e => { e.currentTarget.style.background = C.greenMuted }}
    >
      ↓ {filename}
    </a>
  )
}

function InputForm({ onSubmit, busy, onUpload, busyUpload }) {
  const [value, setValue] = useState('')
  const [selectedFile, setSelectedFile] = useState(null)
  const fileRef = useRef(null)

  const sanitize = v => v.toLowerCase().replace(/[\s_]+/g, '-').replace(/[^a-z0-9-]/g, '').slice(0, 100)
  const preview = sanitize(value)
  const valid = preview.length >= 2
  const anyBusy = busy || busyUpload

  const handleSubmit = (e) => {
    e.preventDefault()
    if (!anyBusy && valid) onSubmit(value.trim())
  }

  const handleUploadClick = () => {
    if (!anyBusy && valid && selectedFile) onUpload(value.trim(), selectedFile)
  }

  const handleFileChange = (e) => {
    const file = e.target.files[0] ?? null
    setSelectedFile(file)
    e.target.value = ''
  }

  return (
    <form
      onSubmit={handleSubmit}
      style={{
        padding: '20px 24px',
        borderTop: `1px solid ${C.border}`,
        background: C.surface,
        display: 'flex', flexDirection: 'column', gap: 14,
      }}
    >
      {/* Project name row */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
        <span style={{ fontFamily: C.fontMono, fontSize: 18, color: C.green, userSelect: 'none', lineHeight: 1 }}>$</span>
        <input
          autoFocus
          type="text"
          placeholder="project-name"
          maxLength={100}
          value={value}
          onChange={e => setValue(e.target.value)}
          disabled={anyBusy}
          style={{
            flex: 1,
            background: 'transparent',
            border: 'none',
            outline: 'none',
            fontFamily: C.fontMono,
            fontSize: 15,
            color: C.textPrimary,
            caretColor: C.green,
          }}
        />
        <button
          type="submit"
          disabled={anyBusy || !valid}
          style={{
            padding: '8px 20px',
            background: anyBusy || !valid ? 'transparent' : C.greenMuted,
            border: `1px solid ${anyBusy || !valid ? C.border : C.greenBorder}`,
            borderRadius: 4,
            fontFamily: C.fontMono, fontSize: 13, fontWeight: 600,
            color: anyBusy || !valid ? C.textMuted : C.green,
            cursor: anyBusy || !valid ? 'not-allowed' : 'pointer',
            transition: 'all 0.15s',
            whiteSpace: 'nowrap',
          }}
        >
          {busy ? 'working…' : 'run'}
        </button>
      </div>

      {/* Live preview */}
      <div style={{ paddingLeft: 28, fontFamily: C.fontMono, fontSize: 12, color: C.textMuted, minHeight: 18 }}>
        {value && (
          valid
            ? <span>repo name → <span style={{ color: C.textSecondary }}>{preview}</span></span>
            : <span style={{ color: C.red }}>name too short after sanitizing</span>
        )}
      </div>

      {/* Divider */}
      <div style={{ borderTop: `1px solid ${C.border}`, marginLeft: -24, marginRight: -24 }} />

      {/* Upload row */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
        <input
          ref={fileRef}
          type="file"
          accept=".zip,application/zip"
          onChange={handleFileChange}
          style={{ display: 'none' }}
        />
        <button
          type="button"
          disabled={anyBusy}
          onClick={() => fileRef.current?.click()}
          style={{
            padding: '7px 14px',
            background: 'transparent',
            border: `1px solid ${anyBusy ? C.border : C.borderBright}`,
            borderRadius: 4,
            fontFamily: C.fontMono, fontSize: 12,
            color: anyBusy ? C.textMuted : C.textSecondary,
            cursor: anyBusy ? 'not-allowed' : 'pointer',
            whiteSpace: 'nowrap',
            transition: 'all 0.15s',
          }}
        >
          ↑ select zip
        </button>
        <span style={{
          flex: 1,
          fontFamily: C.fontMono, fontSize: 12,
          color: selectedFile ? C.textSecondary : C.textMuted,
          overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
        }}>
          {selectedFile ? selectedFile.name : 'no file selected'}
        </span>
        <button
          type="button"
          disabled={anyBusy || !valid || !selectedFile}
          onClick={handleUploadClick}
          style={{
            padding: '8px 20px',
            background: anyBusy || !valid || !selectedFile ? 'transparent' : 'rgba(255,209,102,0.12)',
            border: `1px solid ${anyBusy || !valid || !selectedFile ? C.border : 'rgba(255,209,102,0.35)'}`,
            borderRadius: 4,
            fontFamily: C.fontMono, fontSize: 13, fontWeight: 600,
            color: anyBusy || !valid || !selectedFile ? C.textMuted : C.yellow,
            cursor: anyBusy || !valid || !selectedFile ? 'not-allowed' : 'pointer',
            transition: 'all 0.15s',
            whiteSpace: 'nowrap',
          }}
        >
          {busyUpload ? 'uploading…' : 'upload'}
        </button>
      </div>
    </form>
  )
}

// ─── Main App ─────────────────────────────────────────────────────────────────

export default function App() {
  const { entries, push, clear } = useLog()
  const [busy, setBusy] = useState(false)
  const [busyUpload, setBusyUpload] = useState(false)
  const [download, setDownload] = useState(null) // { href, filename }

  const handleSubmit = async (rawName) => {
    setBusy(true)
    setDownload(null)
    push('step', `creating repo from template for "${rawName}"…`)

    try {
      push('step', 'POST /api/apps/download')
      const res = await fetch('/api/apps/download', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ projectName: rawName }),
      })

      if (!res.ok) {
        const body = await res.json().catch(() => ({}))
        throw new Error(body.error || `HTTP ${res.status}`)
      }

      push('step', 'response received — reading zip…')
      const blob = await res.blob()
      const sanitized = rawName.toLowerCase().replace(/[\s_]+/g, '-').replace(/[^a-z0-9-]/g, '')
      const filename = `${sanitized}.zip`
      const href = URL.createObjectURL(blob)

      push('success', `zip ready: ${filename} (${(blob.size / 1024).toFixed(1)} KB)`)
      setDownload({ href, filename })
    } catch (err) {
      push('error', err.message)
    } finally {
      setBusy(false)
    }
  }

  const handleUpload = async (rawName, file) => {
    setBusyUpload(true)
    setDownload(null)
    push('step', `uploading "${file.name}" to repo "${rawName}"…`)

    try {
      const form = new FormData()
      form.append('projectName', rawName)
      form.append('file', file)

      push('step', 'POST /api/apps/upload')
      const res = await fetch('/api/apps/upload', { method: 'POST', body: form })

      if (!res.ok) {
        const body = await res.json().catch(() => ({}))
        throw new Error(body.error || `HTTP ${res.status}`)
      }

      const body = await res.json().catch(() => ({}))
      push('success', body.message || 'upload complete')
    } catch (err) {
      push('error', err.message)
    } finally {
      setBusyUpload(false)
    }
  }

  return (
    <div style={{
      minHeight: '100vh', background: C.bg,
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      fontFamily: C.fontSans,
    }}>
      <style>{`
        * { box-sizing: border-box; margin: 0; padding: 0; }
        body { background: ${C.bg}; }
        ::-webkit-scrollbar { width: 6px; }
        ::-webkit-scrollbar-track { background: transparent; }
        ::-webkit-scrollbar-thumb { background: ${C.border}; border-radius: 3px; }
      `}</style>

      <div style={{
        width: '100%', maxWidth: 740,
        border: `1px solid ${C.border}`,
        borderRadius: 10,
        overflow: 'hidden',
        boxShadow: '0 24px 80px rgba(0,0,0,0.6)',
        display: 'flex', flexDirection: 'column',
        minHeight: 480,
      }}>
        <TopBar />

        {/* Header */}
        <div style={{
          padding: '22px 28px 18px',
          borderBottom: `1px solid ${C.border}`,
          background: C.surface,
        }}>
          <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 12 }}>
            <div>
              <div style={{ fontFamily: C.fontMono, fontSize: 11, color: C.green, letterSpacing: '0.1em', marginBottom: 6, textTransform: 'uppercase' }}>
                catchthevibe / backend tester
              </div>
              <div style={{ fontFamily: C.fontSans, fontSize: 22, fontWeight: 600, color: C.textPrimary, marginBottom: 4 }}>
                Start a Project
              </div>
              <div style={{ fontFamily: C.fontSans, fontSize: 14, color: C.textSecondary, lineHeight: 1.5 }}>
                Enter a project name. The backend creates a repo from your GitHub template and returns it as a zip.
              </div>
            </div>
            {(entries.length > 0 || download) && (
              <button
                onClick={() => { setDownload(null); clear() }}
                style={{
                  flexShrink: 0,
                  marginTop: 2,
                  background: 'none',
                  border: `1px solid ${C.border}`,
                  borderRadius: 4,
                  padding: '7px 14px',
                  fontFamily: C.fontMono, fontSize: 12, color: C.textMuted,
                  cursor: 'pointer',
                  transition: 'all 0.15s',
                }}
                onMouseEnter={e => { e.currentTarget.style.borderColor = C.borderBright; e.currentTarget.style.color = C.textSecondary }}
                onMouseLeave={e => { e.currentTarget.style.borderColor = C.border; e.currentTarget.style.color = C.textMuted }}
              >
                reset
              </button>
            )}
          </div>
        </div>

        {/* Log output */}
        <LogPane entries={entries} onClear={clear} />

        {/* Download area */}
        {download && (
          <div style={{
            padding: '14px 24px',
            borderTop: `1px solid ${C.greenBorder}`,
            background: C.greenMuted,
            display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12, flexWrap: 'wrap',
          }}>
            <span style={{ fontFamily: C.fontMono, fontSize: 12, color: C.green }}>ready to download</span>
            <DownloadButton href={download.href} filename={download.filename} />
          </div>
        )}

        {/* Input */}
        <InputForm onSubmit={handleSubmit} busy={busy} onUpload={handleUpload} busyUpload={busyUpload} />
      </div>
    </div>
  )
}
