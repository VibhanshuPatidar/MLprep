import { AnimatePresence, motion } from 'framer-motion'
import { ExternalLink, Eye, FileText, Lightbulb, Loader2, NotebookPen, Play, Plus, RotateCcw, Send, Sparkles, X } from 'lucide-react'
import { Suspense, lazy, useEffect, useMemo, useState } from 'react'
import { Group, Panel, Separator } from 'react-resizable-panels'
import { Link, useParams } from 'react-router-dom'
import CodeBlock from '../components/CodeBlock'
import Markdown from '../components/Markdown'
import Widget from '../components/Widget'
import { Celebrate, Field, VerdictBanner, WorkspaceHeader, fmt, useDebouncedSave } from '../components/workspace'
import { Badge, Button, EmptyState, Segmented, Tabs, cn } from '../components/ui'
import { dsaById, dsaProblems, leetcodeUrl, videoUrl } from '../data'
import { runDsa } from '../judge/run'
import { preloadPython } from '../judge/runtime'
import { starterCode } from '../judge/starter'
import type { Language, RunResult, TestCase } from '../judge/types'
import { keyOf, useStore } from '../store/progress'
import type { DsaProblem } from '../types/content'
import { widgetById } from '../viz/registry'

const CodeEditor = lazy(() => import('../components/CodeEditor'))

type LeftTab = 'description' | 'solutions' | 'visualize' | 'notes'

function Description({ p }: { p: DsaProblem }) {
  const [shown, setShown] = useState(0)
  return (
    <div className="p-5">
      <div className="mb-3 flex flex-wrap items-center gap-2">
        <Badge tone="accent">{p.category}</Badge>
        <Badge>{p.pattern}</Badge>
        <a href={leetcodeUrl(p.id)} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 text-[11px] text-muted hover:text-accent">
          LeetCode #{p.number} <ExternalLink size={11} />
        </a>
        <a href={videoUrl(p.title)} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 text-[11px] text-muted hover:text-accent">
          NeetCode video <ExternalLink size={11} />
        </a>
      </div>
      <Markdown compact>{p.description}</Markdown>
      <div className="mt-5 space-y-3">
        {p.examples.map((ex, i) => (
          <div key={i}>
            <div className="mb-1.5 text-xs font-semibold">Example {i + 1}</div>
            <div className="rounded-lg border-l-2 border-line-strong bg-subtle px-3 py-2 font-mono text-[12.5px] leading-relaxed [overflow-wrap:anywhere]">
              <div>
                <span className="text-muted">Input: </span>
                {ex.input}
              </div>
              <div>
                <span className="text-muted">Output: </span>
                {ex.output}
              </div>
              {ex.explanation && (
                <div className="flex gap-1 font-sans text-[12.5px] text-muted">
                  <span className="shrink-0 font-mono">Explanation: </span>
                  <Markdown compact className="text-[12.5px] [&_p]:m-0">
                    {ex.explanation}
                  </Markdown>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
      {p.constraints.length > 0 && (
        <div className="mt-5">
          <div className="mb-1.5 text-xs font-semibold">Constraints</div>
          <ul className="list-disc space-y-0.5 pl-5 text-[13px] text-muted">
            {p.constraints.map((c, i) => (
              <li key={i}>
                <Markdown compact className="[&_p]:m-0">
                  {c}
                </Markdown>
              </li>
            ))}
          </ul>
        </div>
      )}
      <div className="mt-6 space-y-2">
        {p.hints.map((h, i) => (
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
    </div>
  )
}

function Solutions({ p, onLoad }: { p: DsaProblem; onLoad: (code: string, lang: Language) => void }) {
  const solved = useStore((s) => s.progress[keyOf('dsa', p.id)]?.status === 'solved')
  const [revealed, setRevealed] = useState(false)
  const [idx, setIdx] = useState(p.solutions.length - 1)
  const [lang, setLang] = useState<Language>(useStore.getState().settings.defaultLang)
  const s = p.solutions[Math.min(idx, p.solutions.length - 1)]
  if (!solved && !revealed)
    return (
      <div className="p-5">
        <EmptyState icon={<Eye size={28} />} title="Solutions are hidden">
          <p className="mb-3">Give it an honest attempt first — try the hints. Solve it to unlock automatically.</p>
          <Button variant="outline" size="sm" onClick={() => setRevealed(true)}>
            Reveal anyway
          </Button>
        </EmptyState>
      </div>
    )
  return (
    <div className="p-5">
      <Tabs size="sm" items={p.solutions.map((x, i) => ({ id: String(i), label: x.title }))} value={String(idx)} onChange={(v) => setIdx(Number(v))} className="mb-4" />
      <div className="mb-3 flex flex-wrap gap-2">
        <Badge tone="info">Time {s.time}</Badge>
        <Badge tone="accent">Space {s.space}</Badge>
      </div>
      <Markdown compact>{s.explanation}</Markdown>
      <div className="mt-4 flex items-center justify-between">
        <Segmented
          options={[
            { value: 'python', label: 'Python' },
            { value: 'cpp', label: 'C++' },
          ]}
          value={lang}
          onChange={(v) => setLang(v as Language)}
        />
        <Button size="xs" variant="outline" onClick={() => onLoad(lang === 'python' ? s.python : s.cpp, lang)}>
          Load into editor
        </Button>
      </div>
      <CodeBlock code={lang === 'python' ? s.python : s.cpp} lang={lang} />
    </div>
  )
}

function Notes({ storeKey }: { storeKey: string }) {
  const note = useStore((s) => s.notes[storeKey] ?? '')
  const setNote = useStore((s) => s.setNote)
  const [v, setV] = useState(note)
  useDebouncedSave(v, (x) => setNote(storeKey, x))
  return (
    <div className="flex h-full flex-col p-5">
      <div className="mb-2 text-xs text-muted">Private notes (saved locally, markdown supported). Capture the key insight, edge cases and mistakes.</div>
      <textarea value={v} onChange={(e) => setV(e.target.value)} placeholder="e.g. Key insight: complement lookup in a hash map…" className="min-h-64 flex-1 resize-none rounded-lg border border-line bg-subtle p-3 font-mono text-[13px] outline-none focus:ring-2 focus:ring-accent/30" />
    </div>
  )
}

function argsToEditable(p: DsaProblem, tc: TestCase): string[] {
  if (p.signature.kind === 'class') return [JSON.stringify(tc.ops), JSON.stringify(tc.args)]
  return tc.args.map((a) => JSON.stringify(a))
}

function paramNames(p: DsaProblem): string[] {
  const sig = p.signature
  if (sig.kind === 'function') return sig.params.map((x) => x.name)
  if (sig.kind === 'class') return ['operations', 'arguments']
  return ['data']
}

function Console({ p, result, running, mode, custom, setCustom, tab, setTab }: { p: DsaProblem; result: RunResult | null; running: string | null; mode: 'run' | 'submit'; custom: string[][]; setCustom: (c: string[][]) => void; tab: 'tests' | 'result'; setTab: (t: 'tests' | 'result') => void }) {
  const [sel, setSel] = useState(0)
  const [rsel, setRsel] = useState(0)
  const names = paramNames(p)
  useEffect(() => {
    if (result) {
      const firstBad = result.results.findIndex((r) => r.status !== 'passed')
      setRsel(firstBad >= 0 ? firstBad : 0)
    }
  }, [result])
  const passed = result?.results.filter((r) => r.status === 'passed').length ?? 0
  const r = result?.results[rsel]

  return (
    <div className="flex h-full flex-col bg-panel">
      <div className="flex h-10 shrink-0 items-center gap-1 border-b border-line px-2">
        <Tabs
          size="sm"
          value={tab}
          onChange={setTab}
          items={[
            { id: 'tests', label: 'Testcases' },
            { id: 'result', label: 'Result', badge: result ? <span className={cn('ml-1 h-1.5 w-1.5 rounded-full', result.status === 'accepted' ? 'bg-ok' : 'bg-err')} /> : undefined },
          ]}
        />
        {running && (
          <span className="ml-auto flex items-center gap-1.5 pr-2 text-xs text-muted">
            <Loader2 size={13} className="animate-spin" /> {running}
          </span>
        )}
      </div>
      <div className="min-h-0 flex-1 overflow-auto p-3">
        {tab === 'tests' ? (
          <div>
            <div className="mb-3 flex flex-wrap items-center gap-1.5">
              {custom.map((_, i) => (
                <div key={i} className="group relative">
                  <button onClick={() => setSel(i)} className={cn('h-7 rounded-md px-3 text-xs font-medium', sel === i ? 'bg-subtle text-fg' : 'text-muted hover:bg-subtle')}>
                    Case {i + 1}
                  </button>
                  {custom.length > 1 && (
                    <button
                      onClick={() => {
                        const c = custom.filter((_, j) => j !== i)
                        setCustom(c)
                        setSel(Math.min(sel, c.length - 1))
                      }}
                      className="absolute -top-1 -right-1 hidden h-4 w-4 items-center justify-center rounded-full bg-line text-muted group-hover:flex hover:text-fg"
                    >
                      <X size={10} />
                    </button>
                  )}
                </div>
              ))}
              {custom.length < 8 && (
                <button onClick={() => setCustom([...custom, [...custom[custom.length - 1]]])} className="flex h-7 w-7 items-center justify-center rounded-md text-muted hover:bg-subtle hover:text-fg" title="Add a custom case (expected output is computed with the reference solution)">
                  <Plus size={14} />
                </button>
              )}
            </div>
            {custom[sel] &&
              names.map((n, k) => (
                <div key={k} className="mb-3">
                  <div className="mb-1 font-mono text-[11px] text-muted">{n} =</div>
                  <textarea
                    value={custom[sel][k]}
                    spellCheck={false}
                    onChange={(e) => {
                      const c = custom.map((row) => [...row])
                      c[sel][k] = e.target.value
                      setCustom(c)
                    }}
                    rows={Math.min(6, Math.max(1, Math.ceil(custom[sel][k].length / 80)))}
                    className="w-full resize-y rounded-lg border border-line bg-subtle px-3 py-2 font-mono text-[12.5px] outline-none focus:ring-2 focus:ring-accent/30"
                  />
                </div>
              ))}
            <div className="text-[11px] text-faint">Inputs are JSON. Edited / added cases are checked against the reference solution. Trees use level-order arrays with null; linked lists are arrays.</div>
          </div>
        ) : !result ? (
          <div className="flex h-full items-center justify-center text-sm text-muted">{running ? 'Running…' : 'Run your code to see results here.'}</div>
        ) : (
          <div className="animate-fade-in">
            <VerdictBanner status={result.status} passed={passed} total={result.results.length} ms={result.totalMs} mode={mode} />
            {result.compileError && <pre className="mb-3 overflow-auto rounded-lg border border-err/30 bg-err/5 p-3 font-mono text-[12px] whitespace-pre-wrap text-err">{result.compileError}</pre>}
            {result.message && <div className="mb-3 rounded-lg border border-warn/30 bg-warn/5 p-3 text-xs text-warn">{result.message}</div>}
            {result.results.length > 0 && (
              <div className="mb-3 flex flex-wrap gap-1.5">
                {result.results.map((x, i) => (
                  <button key={i} onClick={() => setRsel(i)} className={cn('flex h-7 items-center gap-1.5 rounded-md px-2.5 text-xs font-medium', rsel === i ? 'bg-subtle text-fg' : 'text-muted hover:bg-subtle')}>
                    <span className={cn('h-1.5 w-1.5 rounded-full', x.status === 'passed' ? 'bg-ok' : x.status === 'skipped' ? 'bg-faint' : 'bg-err')} />
                    {mode === 'submit' ? `Test ${i + 1}` : `Case ${i + 1}`}
                  </button>
                ))}
              </div>
            )}
            {r && (
              <div>
                {r.ops ? (
                  <>
                    <Field label="Operations">{fmt(r.ops)}</Field>
                    <Field label="Arguments">{fmt(r.args)}</Field>
                  </>
                ) : (
                  names.map((n, k) => (
                    <Field key={k} label={n}>
                      {fmt(r.args?.[k])}
                    </Field>
                  ))
                )}
                {r.status !== 'skipped' && r.status !== 'error' && r.status !== 'timeout' && (
                  <Field label="Output" tone={r.status === 'passed' ? 'ok' : 'err'}>
                    {fmt(r.output)}
                  </Field>
                )}
                <Field label={p.compare === 'anyOf' ? 'Expected (any of)' : p.compare === 'topoOrder' || p.compare === 'alienOrder' ? 'Expected (one valid answer)' : 'Expected'}>{fmt(r.expected)}</Field>
                {p.compare && p.compare !== 'exact' && p.compare !== 'anyOf' && <div className="-mt-2 mb-3 text-[11px] text-faint">Judged with “{p.compare}” comparison (order-insensitive / any valid answer).</div>}
                {r.error && <pre className="mb-3 overflow-auto rounded-lg border border-err/30 bg-err/5 p-3 font-mono text-[12px] whitespace-pre-wrap text-err">{r.error}</pre>}
                {r.stdout && <Field label="Stdout">{r.stdout}</Field>}
                {r.status === 'skipped' && <div className="text-xs text-muted">Not executed (an earlier test crashed or timed out).</div>}
              </div>
            )}
            {result.stderr && result.status !== 'accepted' && <Field label="Stderr / extra output">{result.stderr.slice(0, 4000)}</Field>}
          </div>
        )}
      </div>
    </div>
  )
}

export default function DsaWorkspace() {
  const { id = '' } = useParams()
  const p = dsaById.get(id)
  if (!p) return <div className="p-10 text-muted">Problem not found.</div>
  return <Workspace key={p.id} p={p} />
}

function Workspace({ p }: { p: DsaProblem }) {
  const storeKey = keyOf('dsa', p.id)
  const defaultLang = useStore((s) => s.settings.defaultLang)
  const saved = useStore.getState().code
  const [lang, setLang] = useState<Language>(() => (saved[`${storeKey}:python`] && !saved[`${storeKey}:cpp`] ? 'python' : saved[`${storeKey}:cpp`] && !saved[`${storeKey}:python`] ? 'cpp' : defaultLang))
  const [code, setCode] = useState(() => saved[`${storeKey}:${lang}`] ?? starterCode(p.signature, lang))
  const codeState = code
  const langState = lang
  const [left, setLeft] = useState<LeftTab>('description')
  const [result, setResult] = useState<RunResult | null>(null)
  const [mode, setMode] = useState<'run' | 'submit'>('run')
  const [running, setRunning] = useState<string | null>(null)
  const [consoleTab, setConsoleTab] = useState<'tests' | 'result'>('tests')
  const [celebrate, setCelebrate] = useState(false)
  const samples = useMemo(() => p.tests.slice(0, p.sampleCount ?? 3), [p])
  const [custom, setCustom] = useState<string[][]>(() => samples.map((t) => argsToEditable(p, t)))
  const { saveCode, clearCode, markAttempt, markSolved, visit } = useStore.getState()

  useEffect(() => {
    visit(storeKey)
    if (lang === 'python') preloadPython()
  }, [storeKey, lang, visit])

  useDebouncedSave(code, (c) => saveCode(storeKey, lang, c))

  // Dev-only hook used by automated UI checks: /dsa/<id>?autotest=python|cpp loads the reference solution and submits it.
  useEffect(() => {
    if (!import.meta.env.DEV) return
    const l = new URLSearchParams(location.search).get('autotest') as Language | null
    if (l !== 'python' && l !== 'cpp') return
    const ref = p.solutions[p.solutions.length - 1]
    const c = l === 'python' ? ref.python : ref.cpp
    setLang(l)
    setCode(c)
    const t = setTimeout(() => execute('submit', { code: c, lang: l }), 300)
    return () => clearTimeout(t)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const idx = dsaProblems.findIndex((x) => x.id === p.id)
  const prev = idx > 0 ? `/dsa/${dsaProblems[idx - 1].id}` : undefined
  const next = idx < dsaProblems.length - 1 ? `/dsa/${dsaProblems[idx + 1].id}` : undefined

  const switchLang = (l: Language) => {
    saveCode(storeKey, lang, code)
    setLang(l)
    setCode(useStore.getState().code[`${storeKey}:${l}`] ?? starterCode(p.signature, l))
  }

  const parseCustom = (): TestCase[] | string => {
    try {
      return custom.map((row) => {
        if (p.signature.kind === 'class') return { ops: JSON.parse(row[0]), args: JSON.parse(row[1]), expected: null }
        return { args: row.map((x) => JSON.parse(x)), expected: null }
      })
    } catch (e) {
      return `Could not parse test input as JSON: ${(e as Error).message}`
    }
  }

  const execute = async (m: 'run' | 'submit', override?: { code: string; lang: Language }) => {
    if (running) return
    const code = override?.code ?? codeState
    const lang = override?.lang ?? langState
    saveCode(storeKey, lang, code)
    setMode(m)
    setConsoleTab('result')
    setResult(null)
    setRunning(m === 'submit' ? 'Submitting…' : 'Running…')
    try {
      let customTests: TestCase[] | undefined
      if (m === 'run') {
        const edited = custom.length !== samples.length || custom.some((row, i) => row.join('\u0000') !== argsToEditable(p, samples[i]).join('\u0000'))
        if (edited) {
          const parsed = parseCustom()
          if (typeof parsed === 'string') {
            setResult({ status: 'internal_error', results: [], message: parsed })
            return
          }
          customTests = parsed
        }
      }
      const res = await runDsa(p, lang, code, m, customTests, { onStatus: (s) => setRunning(s === 'running' ? (m === 'submit' ? 'Judging…' : 'Running…') : s) })
      setResult(res)
      markAttempt(storeKey, lang)
      if (m === 'submit' && res.status === 'accepted') {
        markSolved(storeKey, lang, res.totalMs)
        setCelebrate(true)
        setTimeout(() => setCelebrate(false), 1600)
      }
    } finally {
      setRunning(null)
    }
  }

  const leftTabs = [
    { id: 'description' as const, label: 'Description', icon: <FileText size={13} /> },
    { id: 'solutions' as const, label: 'Solutions', icon: <Lightbulb size={13} /> },
    { id: 'visualize' as const, label: 'Visualize', icon: <Sparkles size={13} /> },
    { id: 'notes' as const, label: 'Notes', icon: <NotebookPen size={13} /> },
  ]

  return (
    <div className="flex h-full flex-col">
      <WorkspaceHeader backTo="/dsa" backLabel="Problems" title={`${p.number}. ${p.title}`} difficulty={p.difficulty} storeKey={storeKey} prev={prev} next={next} />
      <Group orientation="horizontal" className="min-h-0 flex-1">
        <Panel defaultSize="44" minSize="25" className="flex flex-col bg-panel">
          <div className="flex h-10 shrink-0 items-center border-b border-line px-2">
            <Tabs size="sm" items={leftTabs} value={left} onChange={setLeft} />
          </div>
          <div className="min-h-0 flex-1 overflow-y-auto">
            {left === 'description' && <Description p={p} />}
            {left === 'solutions' && (
              <Solutions
                p={p}
                onLoad={(c, l) => {
                  if (l !== lang) {
                    saveCode(storeKey, lang, code)
                    setLang(l)
                  }
                  setCode(c)
                }}
              />
            )}
            {left === 'visualize' && (
              <div className="p-4">
                {p.viz ? (
                  <>
                    <div className="mb-3 text-xs text-muted">
                      Pattern visualizer: <span className="text-fg">{widgetById[p.viz]?.title}</span> — the technique behind this problem.
                    </div>
                    <Widget id={p.viz} />
                  </>
                ) : (
                  <EmptyState icon={<Sparkles size={26} />} title="No dedicated visualizer for this problem">
                    Browse the <Link to="/visualizers" className="text-accent">visualizer gallery</Link>.
                  </EmptyState>
                )}
              </div>
            )}
            {left === 'notes' && <Notes storeKey={storeKey} />}
          </div>
        </Panel>
        <Separator className="resize-handle w-1" />
        <Panel defaultSize="56" minSize="30">
          <Group orientation="vertical">
            <Panel defaultSize="64" minSize="20" className="flex flex-col bg-panel">
              <div className="flex h-10 shrink-0 items-center gap-2 border-b border-line px-2">
                <Segmented
                  options={[
                    { value: 'python', label: 'Python 3' },
                    { value: 'cpp', label: 'C++17' },
                  ]}
                  value={lang}
                  onChange={(v) => switchLang(v as Language)}
                />
                <button
                  onClick={() => {
                    if (confirm('Reset code to the starter template? Your current code for this language will be lost.')) {
                      clearCode(storeKey, lang)
                      setCode(starterCode(p.signature, lang))
                    }
                  }}
                  className="rounded-md p-1.5 text-muted hover:bg-subtle hover:text-fg"
                  title="Reset to starter code"
                >
                  <RotateCcw size={14} />
                </button>
                <div className="flex-1" />
                <span className="hidden text-[11px] text-faint lg:inline">⌘' run · ⌘↵ submit</span>
                <Button size="sm" variant="secondary" onClick={() => execute('run')} disabled={Boolean(running)}>
                  {running && mode === 'run' ? <Loader2 size={14} className="animate-spin" /> : <Play size={14} />} Run
                </Button>
                <Button size="sm" variant="success" onClick={() => execute('submit')} disabled={Boolean(running)}>
                  {running && mode === 'submit' ? <Loader2 size={14} className="animate-spin" /> : <Send size={14} />} Submit
                </Button>
              </div>
              <div className="min-h-0 flex-1">
                <Suspense fallback={<div className="p-4 text-sm text-muted">Loading editor…</div>}>
                  <CodeEditor value={code} onChange={setCode} language={lang} onRun={() => execute('run')} onSubmit={() => execute('submit')} />
                </Suspense>
              </div>
            </Panel>
            <Separator className="resize-handle h-1" />
            <Panel defaultSize="36" minSize="12">
              <Console p={p} result={result} running={running} mode={mode} custom={custom} setCustom={setCustom} tab={consoleTab} setTab={setConsoleTab} />
            </Panel>
          </Group>
        </Panel>
      </Group>
      <AnimatePresence>{celebrate && <motion.div exit={{ opacity: 0 }}><Celebrate show /></motion.div>}</AnimatePresence>
    </div>
  )
}
