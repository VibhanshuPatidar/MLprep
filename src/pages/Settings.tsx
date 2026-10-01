import { Download, RefreshCw, Settings as SettingsIcon, Trash2, Upload } from 'lucide-react'
import { useEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { Page } from '../components/Layout'
import { Button, Card, PageHeader, Segmented, Slider, Switch } from '../components/ui'
import { checkRunner, getRuntimeStatus, onRuntimeStatus, preloadPython, type RuntimeStatus } from '../judge/runtime'
import { useStore } from '../store/progress'

function Row({ label, hint, children }: { label: string; hint?: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-wrap items-center justify-between gap-4 border-t border-line py-4 first:border-t-0 first:pt-0">
      <div>
        <div className="text-sm font-medium">{label}</div>
        {hint && <div className="mt-0.5 max-w-md text-xs text-muted">{hint}</div>}
      </div>
      {children}
    </div>
  )
}

export default function Settings() {
  const settings = useStore((s) => s.settings)
  const setSettings = useStore((s) => s.setSettings)
  const fileRef = useRef<HTMLInputElement>(null)
  const [rt, setRt] = useState<RuntimeStatus>(getRuntimeStatus())
  const [msg, setMsg] = useState('')
  useEffect(() => onRuntimeStatus(setRt), [])

  const exportData = () => {
    const raw = localStorage.getItem('prepml-v1') ?? '{}'
    const blob = new Blob([raw], { type: 'application/json' })
    const a = document.createElement('a')
    a.href = URL.createObjectURL(blob)
    a.download = `prepml-progress-${new Date().toISOString().slice(0, 10)}.json`
    a.click()
    URL.revokeObjectURL(a.href)
  }

  const importData = async (f: File) => {
    try {
      useStore.getState().importState(await f.text())
      setMsg('Progress imported.')
    } catch (e) {
      setMsg(`Import failed: ${String(e)}`)
    }
  }

  return (
    <Page className="max-w-3xl">
      <PageHeader icon={<SettingsIcon size={20} />} title="Settings" subtitle="Editor preferences, code runtimes and your locally stored progress." />

      <h2 className="mb-2 text-sm font-semibold text-muted">Appearance & editor</h2>
      <Card className="mb-8 p-5">
        <Row label="Theme">
          <Segmented
            options={[
              { value: 'dark', label: 'Dark' },
              { value: 'light', label: 'Light' },
            ]}
            value={settings.theme}
            onChange={(v) => setSettings({ theme: v })}
          />
        </Row>
        <Row label="Default language" hint="Used when you open a DSA problem for the first time.">
          <Segmented
            options={[
              { value: 'python', label: 'Python 3' },
              { value: 'cpp', label: 'C++17' },
            ]}
            value={settings.defaultLang}
            onChange={(v) => setSettings({ defaultLang: v })}
          />
        </Row>
        <Row label="Editor font size">
          <Slider value={settings.fontSize} min={11} max={20} onChange={(v) => setSettings({ fontSize: v })} label="" format={(v) => `${v}px`} className="w-48" />
        </Row>
        <Row label="Minimap">
          <Switch checked={settings.minimap} onChange={(v) => setSettings({ minimap: v })} />
        </Row>
        <Row label="Word wrap">
          <Switch checked={settings.wordWrap} onChange={(v) => setSettings({ wordWrap: v })} />
        </Row>
      </Card>

      <h2 className="mb-2 text-sm font-semibold text-muted">Code runtimes</h2>
      <Card className="mb-8 p-5">
        <Row label="Python 3 (Pyodide)" hint="CPython compiled to WebAssembly, runs in a Web Worker in your browser. Downloaded from the jsDelivr CDN on first use and cached. NumPy is loaded on demand.">
          <div className="flex items-center gap-2">
            <span className="text-xs text-muted">{rt.python}</span>
            <Button size="sm" variant="outline" onClick={() => preloadPython()}>
              Load now
            </Button>
          </div>
        </Row>
        <Row label="C++17 (local runner)" hint="Compiled with clang++/g++ by the small runner started with `npm run dev` (bound to 127.0.0.1:8787 only). Use `npm run runner` to start it alone.">
          <div className="flex items-center gap-2">
            <span className={rt.cpp === 'ok' ? 'text-xs text-ok' : 'text-xs text-err'}>{rt.cpp === 'ok' ? `connected · ${rt.cxx}` : rt.cpp}</span>
            <Button size="sm" variant="outline" onClick={() => checkRunner()}>
              <RefreshCw size={13} /> Check
            </Button>
          </div>
        </Row>
        <Row label="SQL (SQLite via sql.js)" hint="Runs fully in your browser; every run uses a fresh in-memory database.">
          <span className="text-xs text-ok">ready</span>
        </Row>
        <Row label="Diagnostics" hint="Run reference and wrong solutions through every runtime to verify the judge end-to-end.">
          <Link to="/diagnostics">
            <Button size="sm" variant="outline">
              Open diagnostics
            </Button>
          </Link>
        </Row>
      </Card>

      <h2 className="mb-2 text-sm font-semibold text-muted">Data</h2>
      <Card className="p-5">
        <Row label="Export progress" hint="Solved problems, code, notes, flashcard schedule, quiz scores and mocks as JSON.">
          <Button size="sm" variant="outline" onClick={exportData}>
            <Download size={14} /> Export
          </Button>
        </Row>
        <Row label="Import progress" hint="Restore from a previously exported JSON file (merges over current data).">
          <>
            <input ref={fileRef} type="file" accept="application/json" className="hidden" onChange={(e) => e.target.files?.[0] && importData(e.target.files[0])} />
            <Button size="sm" variant="outline" onClick={() => fileRef.current?.click()}>
              <Upload size={14} /> Import
            </Button>
          </>
        </Row>
        <Row label="Reset everything" hint="Permanently deletes all local progress, code and notes in this browser.">
          <Button
            size="sm"
            variant="danger"
            onClick={() => {
              if (confirm('This permanently deletes all progress, saved code and notes in this browser. Continue?')) {
                useStore.getState().reset()
                setMsg('All progress reset.')
              }
            }}
          >
            <Trash2 size={14} /> Reset
          </Button>
        </Row>
        {msg && <div className="mt-3 text-xs text-muted">{msg}</div>}
      </Card>
    </Page>
  )
}
