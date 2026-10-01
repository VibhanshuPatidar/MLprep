import { AnimatePresence, motion } from 'framer-motion'
import { FileText, FlaskConical, Lightbulb, Loader2, NotebookPen, Play, RotateCcw, Send, Sparkles } from 'lucide-react'
import { Suspense, lazy, useEffect, useMemo, useState } from 'react'
import { Group, Panel, Separator } from 'react-resizable-panels'
import { Link, useParams } from 'react-router-dom'
import CodeBlock from '../components/CodeBlock'
import { Page } from '../components/Layout'
import Markdown from '../components/Markdown'
import ProblemList, { type ListItem } from '../components/ProblemList'
import Widget from '../components/Widget'
import { Badge, Button, EmptyState, PageHeader, Tabs, cn } from '../components/ui'
import { Celebrate, Field, VerdictBanner, WorkspaceHeader, useDebouncedSave } from '../components/workspace'
import { mlById, mlProblems } from '../data'
import { runMl } from '../judge/run'
import { preloadPython } from '../judge/runtime'
import type { RunResult } from '../judge/types'
import { keyOf, useStore } from '../store/progress'
import type { MlCodingProblem } from '../types/content'
import { RevealGate } from './Sql'

const CodeEditor = lazy(() => import('../components/CodeEditor'))

export function MlList() {
  const items: ListItem[] = useMemo(
    () => mlProblems.map((p) => ({ id: p.id, key: keyOf('ml', p.id), to: `/ml-coding/${p.id}`, title: p.title, difficulty: p.difficulty, group: p.category, tags: p.viz ? ['visualizer'] : [] })),
    [],
  )
  return (
    <Page wide>
      <PageHeader
        icon={<FlaskConical size={20} />}
        title="ML Coding"
        subtitle="Implement ML building blocks from scratch with NumPy — the “code a k-means / attention / Adam step” round. Runs in your browser (Pyodide); tests check numerical correctness, shapes and edge cases."
      />
      <ProblemList items={items} />
    </Page>
  )
}

export default function MlWorkspace() {
  const { id = '' } = useParams()
  const p = mlById.get(id)
  if (!p) return <div className="p-10 text-muted">Problem not found.</div>
  return <Workspace key={p.id} p={p} />
}

function Workspace({ p }: { p: MlCodingProblem }) {
  const storeKey = keyOf('ml', p.id)
  const [code, setCode] = useState(() => useStore.getState().code[`${storeKey}:python`] ?? p.starter)
  const [left, setLeft] = useState<'description' | 'solution' | 'visualize' | 'notes'>('description')
  const [result, setResult] = useState<RunResult | null>(null)
  const [mode, setMode] = useState<'run' | 'submit'>('run')
  const [running, setRunning] = useState<string | null>(null)
  const [sel, setSel] = useState(0)
  const [shownHints, setShownHints] = useState(0)
  const [celebrate, setCelebrate] = useState(false)
  const { saveCode, clearCode, markAttempt, markSolved, visit, setNote } = useStore.getState()
  const note = useStore((s) => s.notes[storeKey] ?? '')
  const [noteV, setNoteV] = useState(note)
  useDebouncedSave(noteV, (x) => setNote(storeKey, x))

  useEffect(() => {
    visit(storeKey)
    preloadPython()
  }, [storeKey, visit])
  useDebouncedSave(code, (c) => saveCode(storeKey, 'python', c))

  const idx = mlProblems.findIndex((x) => x.id === p.id)
  const prev = idx > 0 ? `/ml-coding/${mlProblems[idx - 1].id}` : undefined
  const next = idx < mlProblems.length - 1 ? `/ml-coding/${mlProblems[idx + 1].id}` : undefined
  const tests = mode === 'submit' ? p.tests : p.tests.filter((t) => !t.hidden)

  const execute = async (m: 'run' | 'submit') => {
    if (running) return
    saveCode(storeKey, 'python', code)
    setMode(m)
    setResult(null)
    setRunning('Starting Python…')
    try {
      const r = await runMl(p, code, m, { onStatus: (s) => setRunning(s === 'running' ? 'Running tests…' : s) })
      setResult(r)
      setSel(Math.max(0, r.results.findIndex((x) => x.status !== 'passed')))
      markAttempt(storeKey, 'python')
      if (m === 'submit' && r.status === 'accepted') {
        markSolved(storeKey, 'python', r.totalMs)
        setCelebrate(true)
        setTimeout(() => setCelebrate(false), 1600)
      }
    } finally {
      setRunning(null)
    }
  }

  const r = result?.results[sel]
  const passed = result?.results.filter((x) => x.status === 'passed').length ?? 0

  return (
    <div className="flex h-full flex-col">
      <WorkspaceHeader backTo="/ml-coding" backLabel="ML Coding" title={p.title} difficulty={p.difficulty} storeKey={storeKey} prev={prev} next={next} />
      <Group orientation="horizontal" className="min-h-0 flex-1">
        <Panel defaultSize="46" minSize="25" className="flex flex-col bg-panel">
          <div className="flex h-10 shrink-0 items-center border-b border-line px-2">
            <Tabs
              size="sm"
              value={left}
              onChange={setLeft}
              items={[
                { id: 'description', label: 'Description', icon: <FileText size={13} /> },
                { id: 'solution', label: 'Solution', icon: <Lightbulb size={13} /> },
                { id: 'visualize', label: 'Visualize', icon: <Sparkles size={13} /> },
                { id: 'notes', label: 'Notes', icon: <NotebookPen size={13} /> },
              ]}
            />
          </div>
          <div className="min-h-0 flex-1 overflow-y-auto">
            {left === 'description' && (
              <div className="p-5">
                <div className="mb-3 flex gap-2">
                  <Badge tone="accent">{p.category}</Badge>
                  <Badge>Python + NumPy</Badge>
                </div>
                <Markdown compact>{p.description}</Markdown>
                <div className="mt-5">
                  <div className="mb-1.5 text-xs font-semibold">Tests</div>
                  <ul className="space-y-1 text-[13px] text-muted">
                    {p.tests.map((t, i) => (
                      <li key={i} className="flex items-center gap-2">
                        <span className="h-1 w-1 rounded-full bg-faint" />
                        {t.hidden ? <span className="italic">Hidden test (runs on submit)</span> : t.name}
                      </li>
                    ))}
                  </ul>
                </div>
                <div className="mt-6 space-y-2">
                  {p.hints.map((h, i) => (
                    <div key={i} className="overflow-hidden rounded-lg border border-line">
                      {i < shownHints ? (
                        <div className="animate-fade-in flex gap-2 px-3 py-2.5 text-[13px]">
                          <Lightbulb size={14} className="mt-0.5 shrink-0 text-warn" />
                          <Markdown compact className="[&_p]:m-0">
                            {h}
                          </Markdown>
                        </div>
                      ) : (
                        <button disabled={i !== shownHints} onClick={() => setShownHints(i + 1)} className="flex w-full items-center gap-2 px-3 py-2 text-left text-[13px] text-muted hover:bg-subtle disabled:opacity-40">
                          <Lightbulb size={14} /> Hint {i + 1}
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}
            {left === 'solution' && (
              <RevealGate storeKey={storeKey}>
                <div className="p-5">
                  <Markdown compact>{p.explanation}</Markdown>
                  <div className="mt-4 flex justify-end">
                    <Button size="xs" variant="outline" onClick={() => setCode(p.solution)}>
                      Load into editor
                    </Button>
                  </div>
                  <CodeBlock code={p.solution} lang="python" />
                </div>
              </RevealGate>
            )}
            {left === 'visualize' && (
              <div className="p-4">
                {p.viz ? (
                  <Widget id={p.viz} />
                ) : (
                  <EmptyState icon={<Sparkles size={26} />} title="No visualizer for this problem">
                    Browse the <Link to="/visualizers" className="text-accent">visualizer gallery</Link>.
                  </EmptyState>
                )}
              </div>
            )}
            {left === 'notes' && (
              <div className="flex h-full flex-col p-5">
                <div className="mb-2 text-xs text-muted">Private notes (saved locally).</div>
                <textarea value={noteV} onChange={(e) => setNoteV(e.target.value)} className="min-h-64 flex-1 resize-none rounded-lg border border-line bg-subtle p-3 font-mono text-[13px] outline-none focus:ring-2 focus:ring-accent/30" />
              </div>
            )}
          </div>
        </Panel>
        <Separator className="resize-handle w-1" />
        <Panel defaultSize="54" minSize="30">
          <Group orientation="vertical">
            <Panel defaultSize="64" minSize="20" className="flex flex-col bg-panel">
              <div className="flex h-10 shrink-0 items-center gap-2 border-b border-line px-2">
                <span className="rounded-md bg-subtle px-2.5 py-1 text-xs font-medium">Python 3 · NumPy</span>
                <button
                  onClick={() => {
                    if (confirm('Reset to the starter code? Your current code will be lost.')) {
                      clearCode(storeKey, 'python')
                      setCode(p.starter)
                    }
                  }}
                  className="rounded-md p-1.5 text-muted hover:bg-subtle hover:text-fg"
                  title="Reset"
                >
                  <RotateCcw size={14} />
                </button>
                <div className="flex-1" />
                <span className="hidden text-[11px] text-faint lg:inline">⌘' run · ⌘↵ submit</span>
                <Button size="sm" onClick={() => execute('run')} disabled={Boolean(running)}>
                  {running && mode === 'run' ? <Loader2 size={14} className="animate-spin" /> : <Play size={14} />} Run
                </Button>
                <Button size="sm" variant="success" onClick={() => execute('submit')} disabled={Boolean(running)}>
                  {running && mode === 'submit' ? <Loader2 size={14} className="animate-spin" /> : <Send size={14} />} Submit
                </Button>
              </div>
              <div className="min-h-0 flex-1">
                <Suspense fallback={<div className="p-4 text-sm text-muted">Loading editor…</div>}>
                  <CodeEditor value={code} onChange={setCode} language="python" onRun={() => execute('run')} onSubmit={() => execute('submit')} />
                </Suspense>
              </div>
            </Panel>
            <Separator className="resize-handle h-1" />
            <Panel defaultSize="36" minSize="12" className="flex flex-col bg-panel">
              <div className="flex h-10 shrink-0 items-center border-b border-line px-3 text-xs font-medium">
                Test results
                {running && (
                  <span className="ml-auto flex items-center gap-1.5 text-muted">
                    <Loader2 size={13} className="animate-spin" /> {running}
                  </span>
                )}
              </div>
              <div className="min-h-0 flex-1 overflow-auto p-3">
                {!result ? (
                  <div className="flex h-full items-center justify-center text-center text-sm text-muted">{running ? 'First run downloads the Python runtime and NumPy (~10 MB, cached afterwards)…' : 'Run your code to execute the tests.'}</div>
                ) : (
                  <div className="animate-fade-in">
                    <VerdictBanner status={result.status} passed={passed} total={result.results.length} mode={mode} />
                    {result.compileError && <pre className="mb-3 overflow-auto rounded-lg border border-err/30 bg-err/5 p-3 font-mono text-[12px] whitespace-pre-wrap text-err">{result.compileError}</pre>}
                    <div className="mb-3 flex flex-wrap gap-1.5">
                      {result.results.map((x, i) => (
                        <button key={i} onClick={() => setSel(i)} className={cn('flex h-7 items-center gap-1.5 rounded-md px-2.5 text-xs font-medium', sel === i ? 'bg-subtle text-fg' : 'text-muted hover:bg-subtle')}>
                          <span className={cn('h-1.5 w-1.5 rounded-full', x.status === 'passed' ? 'bg-ok' : x.status === 'skipped' ? 'bg-faint' : 'bg-err')} />
                          {tests[i]?.hidden ? `Hidden ${i + 1}` : tests[i]?.name ?? `Test ${i + 1}`}
                        </button>
                      ))}
                    </div>
                    {r && (
                      <div>
                        {r.status === 'passed' && <div className="mb-3 text-sm text-ok">✓ {tests[sel]?.hidden ? 'Hidden test passed' : tests[sel]?.name}</div>}
                        {r.error && <pre className="mb-3 overflow-auto rounded-lg border border-err/30 bg-err/5 p-3 font-mono text-[12px] whitespace-pre-wrap text-err">{r.error}</pre>}
                        {!tests[sel]?.hidden && tests[sel] && (
                          <details className="mb-3">
                            <summary className="cursor-pointer text-xs text-muted">Show test code</summary>
                            <CodeBlock code={tests[sel].code} lang="python" />
                          </details>
                        )}
                        {r.stdout && <Field label="Stdout">{r.stdout}</Field>}
                      </div>
                    )}
                    {result.stderr && result.status !== 'accepted' && <Field label="Stderr">{result.stderr.slice(0, 4000)}</Field>}
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
