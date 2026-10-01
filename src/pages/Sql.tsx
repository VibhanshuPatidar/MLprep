import { AnimatePresence, motion } from 'framer-motion'
import { Database, Eye, FileText, Lightbulb, Loader2, NotebookPen, Play, RotateCcw, Send, Table2 } from 'lucide-react'
import { Suspense, lazy, useEffect, useMemo, useState } from 'react'
import { Group, Panel, Separator } from 'react-resizable-panels'
import { useParams } from 'react-router-dom'
import CodeBlock from '../components/CodeBlock'
import { Page } from '../components/Layout'
import Markdown from '../components/Markdown'
import ProblemList, { type ListItem } from '../components/ProblemList'
import { Badge, Button, EmptyState, PageHeader, Tabs, cn } from '../components/ui'
import { Celebrate, VerdictBanner, WorkspaceHeader, useDebouncedSave } from '../components/workspace'
import { sqlById, sqlProblems } from '../data'
import { describeSchema, runSql, type SchemaInfo, type SqlRunResult, type Table } from '../judge/sql'
import { keyOf, useStore } from '../store/progress'
import type { SqlProblem } from '../types/content'

const CodeEditor = lazy(() => import('../components/CodeEditor'))

export function SqlList() {
  const items: ListItem[] = useMemo(
    () => sqlProblems.map((p) => ({ id: p.id, key: keyOf('sql', p.id), to: `/sql/${p.id}`, title: p.title, difficulty: p.difficulty, group: p.category, tags: [] })),
    [],
  )
  return (
    <Page wide>
      <PageHeader
        icon={<Database size={20} />}
        title="SQL"
        subtitle="Interview-style SQL problems for ML / data roles: joins, aggregation, window functions, and product & ML analytics (retention, funnels, A/B metrics, point-in-time features). Queries run in your browser on SQLite."
      />
      <ProblemList items={items} />
    </Page>
  )
}

export function ResultTable({ table, highlight, max = 200 }: { table: Table; highlight?: 'ok' | 'err'; max?: number }) {
  if (!table.columns.length) return <div className="rounded-lg border border-line bg-subtle px-3 py-2 text-xs text-muted">(no result set)</div>
  return (
    <div className={cn('overflow-auto rounded-lg border', highlight === 'ok' ? 'border-ok/40' : highlight === 'err' ? 'border-err/40' : 'border-line')} style={{ maxHeight: 320 }}>
      <table className="w-full border-collapse font-mono text-[12px]">
        <thead className="sticky top-0 bg-subtle">
          <tr>
            {table.columns.map((c, i) => (
              <th key={i} className="border-b border-line px-3 py-1.5 text-left font-semibold whitespace-nowrap">
                {c}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {table.values.slice(0, max).map((r, i) => (
            <tr key={i} className="odd:bg-panel even:bg-panel-2">
              {r.map((v, j) => (
                <td key={j} className="border-b border-line/50 px-3 py-1 whitespace-nowrap">
                  {v === null ? <span className="text-faint italic">NULL</span> : String(v)}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
      {table.values.length > max && <div className="px-3 py-1 text-[11px] text-faint">… {table.values.length - max} more rows</div>}
      <div className="border-t border-line bg-subtle px-3 py-1 text-[10.5px] text-faint">{table.values.length} row(s)</div>
    </div>
  )
}

function SchemaView({ p }: { p: SqlProblem }) {
  const [schema, setSchema] = useState<SchemaInfo[] | null>(null)
  useEffect(() => {
    describeSchema(p).then(setSchema)
  }, [p])
  if (!schema) return <div className="p-5 text-sm text-muted">Loading schema…</div>
  return (
    <div className="space-y-5 p-5">
      {schema.map((t) => (
        <div key={t.name}>
          <div className="mb-2 flex items-center gap-2">
            <Table2 size={14} className="text-accent" />
            <span className="font-mono text-sm font-semibold">{t.name}</span>
          </div>
          <div className="mb-2 flex flex-wrap gap-1.5">
            {t.columns.map((c) => (
              <span key={c.name} className="rounded-md border border-line bg-subtle px-2 py-0.5 font-mono text-[11px]">
                <span className={cn(c.pk && 'text-accent')}>{c.name}</span> <span className="text-faint">{c.type.toLowerCase()}</span>
              </span>
            ))}
          </div>
          <ResultTable table={t.sample} max={20} />
        </div>
      ))}
      <details className="text-xs">
        <summary className="cursor-pointer text-muted">Show CREATE TABLE statements</summary>
        <CodeBlock code={p.schema.trim()} lang="sql" />
      </details>
    </div>
  )
}

function Hints({ hints }: { hints: string[] }) {
  const [shown, setShown] = useState(0)
  return (
    <div className="mt-6 space-y-2">
      {hints.map((h, i) => (
        <div key={i} className="overflow-hidden rounded-lg border border-line">
          {i < shown ? (
            <div className="animate-fade-in flex gap-2 bg-panel px-3 py-2.5 text-[13px]">
              <Lightbulb size={14} className="mt-0.5 shrink-0 text-warn" />
              <Markdown compact className="[&_p]:m-0">
                {h}
              </Markdown>
            </div>
          ) : (
            <button disabled={i !== shown} onClick={() => setShown(i + 1)} className="flex w-full items-center gap-2 px-3 py-2 text-left text-[13px] text-muted hover:bg-subtle disabled:opacity-40">
              <Lightbulb size={14} /> Hint {i + 1}
            </button>
          )}
        </div>
      ))}
    </div>
  )
}

export function RevealGate({ storeKey, children }: { storeKey: string; children: React.ReactNode }) {
  const solved = useStore((s) => s.progress[storeKey]?.status === 'solved')
  const [revealed, setRevealed] = useState(false)
  if (solved || revealed) return <>{children}</>
  return (
    <div className="p-5">
      <EmptyState icon={<Eye size={28} />} title="Solution is hidden">
        <p className="mb-3">Give it an honest attempt first. Solving it unlocks the solution automatically.</p>
        <Button variant="outline" size="sm" onClick={() => setRevealed(true)}>
          Reveal anyway
        </Button>
      </EmptyState>
    </div>
  )
}

function NotesTab({ storeKey }: { storeKey: string }) {
  const note = useStore((s) => s.notes[storeKey] ?? '')
  const setNote = useStore((s) => s.setNote)
  const [v, setV] = useState(note)
  useDebouncedSave(v, (x) => setNote(storeKey, x))
  return (
    <div className="flex h-full flex-col p-5">
      <div className="mb-2 text-xs text-muted">Private notes (saved locally).</div>
      <textarea value={v} onChange={(e) => setV(e.target.value)} className="min-h-64 flex-1 resize-none rounded-lg border border-line bg-subtle p-3 font-mono text-[13px] outline-none focus:ring-2 focus:ring-accent/30" />
    </div>
  )
}

const STARTER = '-- Write your SQLite query below\nSELECT\n  \nFROM\n  ;\n'

export default function SqlWorkspace() {
  const { id = '' } = useParams()
  const p = sqlById.get(id)
  if (!p) return <div className="p-10 text-muted">Problem not found.</div>
  return <Workspace key={p.id} p={p} />
}

function Workspace({ p }: { p: SqlProblem }) {
  const storeKey = keyOf('sql', p.id)
  const [code, setCode] = useState(() => useStore.getState().code[`${storeKey}:sql`] ?? STARTER)
  const [left, setLeft] = useState<'description' | 'schema' | 'solution' | 'notes'>('description')
  const [result, setResult] = useState<SqlRunResult | null>(null)
  const [mode, setMode] = useState<'run' | 'submit'>('run')
  const [running, setRunning] = useState(false)
  const [sel, setSel] = useState(0)
  const [celebrate, setCelebrate] = useState(false)
  const { saveCode, clearCode, markAttempt, markSolved, visit } = useStore.getState()
  useEffect(() => visit(storeKey), [storeKey, visit])
  useDebouncedSave(code, (c) => saveCode(storeKey, 'sql', c))

  // Dev-only hook for automated UI checks: ?autotest=1 submits a deliberately wrong query, ?autotest=ref the reference.
  useEffect(() => {
    if (!import.meta.env.DEV) return
    const a = new URLSearchParams(location.search).get('autotest')
    if (!a) return
    const q = a === 'ref' ? p.solution : 'SELECT * FROM ' + (/CREATE TABLE\s+(\w+)/i.exec(p.schema)?.[1] ?? 'sqlite_master')
    setCode(q)
    const t = setTimeout(() => execute('submit', q), 300)
    return () => clearTimeout(t)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const idx = sqlProblems.findIndex((x) => x.id === p.id)
  const prev = idx > 0 ? `/sql/${sqlProblems[idx - 1].id}` : undefined
  const next = idx < sqlProblems.length - 1 ? `/sql/${sqlProblems[idx + 1].id}` : undefined

  const execute = async (m: 'run' | 'submit', override?: string) => {
    if (running) return
    setRunning(true)
    setMode(m)
    try {
      const r = await runSql(p, override ?? code, m)
      setResult(r)
      setSel(Math.max(0, r.cases.findIndex((c) => !c.passed)))
      markAttempt(storeKey, 'sql')
      if (m === 'submit' && r.status === 'accepted') {
        markSolved(storeKey, 'sql')
        setCelebrate(true)
        setTimeout(() => setCelebrate(false), 1600)
      }
    } finally {
      setRunning(false)
    }
  }

  const c = result?.cases[sel]
  const passed = result?.cases.filter((x) => x.passed).length ?? 0

  return (
    <div className="flex h-full flex-col">
      <WorkspaceHeader backTo="/sql" backLabel="SQL" title={p.title} difficulty={p.difficulty} storeKey={storeKey} prev={prev} next={next} />
      <Group orientation="horizontal" className="min-h-0 flex-1">
        <Panel defaultSize="44" minSize="25" className="flex flex-col bg-panel">
          <div className="flex h-10 shrink-0 items-center border-b border-line px-2">
            <Tabs
              size="sm"
              value={left}
              onChange={setLeft}
              items={[
                { id: 'description', label: 'Description', icon: <FileText size={13} /> },
                { id: 'schema', label: 'Schema & Data', icon: <Table2 size={13} /> },
                { id: 'solution', label: 'Solution', icon: <Lightbulb size={13} /> },
                { id: 'notes', label: 'Notes', icon: <NotebookPen size={13} /> },
              ]}
            />
          </div>
          <div className="min-h-0 flex-1 overflow-y-auto">
            {left === 'description' && (
              <div className="p-5">
                <div className="mb-3 flex gap-2">
                  <Badge tone="accent">{p.category}</Badge>
                  <Badge>SQLite</Badge>
                  {p.orderMatters ? <Badge tone="warn">Row order matters</Badge> : <Badge>Any row order</Badge>}
                </div>
                <Markdown compact>{p.description}</Markdown>
                <Hints hints={p.hints} />
                <div className="mt-6 mb-1 text-xs font-semibold">Example tables</div>
                <div className="-mx-5 -mt-3">
                  <SchemaView p={p} />
                </div>
              </div>
            )}
            {left === 'schema' && <SchemaView p={p} />}
            {left === 'solution' && (
              <RevealGate storeKey={storeKey}>
                <div className="p-5">
                  <CodeBlock code={p.solution.trim()} lang="sql" />
                  <Markdown compact>{p.explanation}</Markdown>
                  <Button size="xs" variant="outline" className="mt-3" onClick={() => setCode(p.solution.trim() + '\n')}>
                    Load into editor
                  </Button>
                </div>
              </RevealGate>
            )}
            {left === 'notes' && <NotesTab storeKey={storeKey} />}
          </div>
        </Panel>
        <Separator className="resize-handle w-1" />
        <Panel defaultSize="56" minSize="30">
          <Group orientation="vertical">
            <Panel defaultSize="55" minSize="20" className="flex flex-col bg-panel">
              <div className="flex h-10 shrink-0 items-center gap-2 border-b border-line px-2">
                <span className="rounded-md bg-subtle px-2.5 py-1 text-xs font-medium">SQLite</span>
                <button
                  onClick={() => {
                    if (confirm('Reset the editor? Your current query will be lost.')) {
                      clearCode(storeKey, 'sql')
                      setCode(STARTER)
                    }
                  }}
                  className="rounded-md p-1.5 text-muted hover:bg-subtle hover:text-fg"
                  title="Reset"
                >
                  <RotateCcw size={14} />
                </button>
                <div className="flex-1" />
                <span className="hidden text-[11px] text-faint lg:inline">⌘' run · ⌘↵ submit</span>
                <Button size="sm" onClick={() => execute('run')} disabled={running}>
                  {running && mode === 'run' ? <Loader2 size={14} className="animate-spin" /> : <Play size={14} />} Run
                </Button>
                <Button size="sm" variant="success" onClick={() => execute('submit')} disabled={running}>
                  {running && mode === 'submit' ? <Loader2 size={14} className="animate-spin" /> : <Send size={14} />} Submit
                </Button>
              </div>
              <div className="min-h-0 flex-1">
                <Suspense fallback={<div className="p-4 text-sm text-muted">Loading editor…</div>}>
                  <CodeEditor value={code} onChange={setCode} language="sql" onRun={() => execute('run')} onSubmit={() => execute('submit')} />
                </Suspense>
              </div>
            </Panel>
            <Separator className="resize-handle h-1" />
            <Panel defaultSize="45" minSize="12" className="flex flex-col bg-panel">
              <div className="flex h-10 shrink-0 items-center border-b border-line px-3 text-xs font-medium">Result</div>
              <div className="min-h-0 flex-1 overflow-auto p-3">
                {!result ? (
                  <div className="flex h-full items-center justify-center text-sm text-muted">Run your query to compare it with the expected output.</div>
                ) : (
                  <div className="animate-fade-in">
                    <VerdictBanner status={result.status} passed={passed} total={result.cases.length} mode={mode} />
                    {result.cases.length > 1 && (
                      <div className="mb-3 flex flex-wrap gap-1.5">
                        {result.cases.map((x, i) => (
                          <button key={i} onClick={() => setSel(i)} className={cn('flex h-7 items-center gap-1.5 rounded-md px-2.5 text-xs font-medium', sel === i ? 'bg-subtle text-fg' : 'text-muted hover:bg-subtle')}>
                            <span className={cn('h-1.5 w-1.5 rounded-full', x.passed ? 'bg-ok' : 'bg-err')} />
                            Dataset {i + 1}
                          </button>
                        ))}
                      </div>
                    )}
                    {c?.error && <pre className="mb-3 rounded-lg border border-err/30 bg-err/5 p-3 font-mono text-[12px] whitespace-pre-wrap text-err">{c.error}</pre>}
                    {c?.reason && <div className="mb-3 text-xs text-err">{c.reason}</div>}
                    <div className="grid gap-3 xl:grid-cols-2">
                      {c?.output && (
                        <div>
                          <div className="mb-1 text-[11px] font-medium text-muted">Your output</div>
                          <ResultTable table={c.output} highlight={c.passed ? 'ok' : 'err'} />
                        </div>
                      )}
                      {c?.expected && (
                        <div>
                          <div className="mb-1 text-[11px] font-medium text-muted">Expected</div>
                          <ResultTable table={c.expected} />
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </Panel>
          </Group>
        </Panel>
      </Group>
      <AnimatePresence>
        {celebrate && (
          <motion.div exit={{ opacity: 0 }}>
            <Celebrate show />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
