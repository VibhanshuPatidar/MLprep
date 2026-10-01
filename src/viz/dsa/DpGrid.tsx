import { useMemo, useState } from 'react'
import { C, PlayerControls, usePlayer, useSize, VizFrame } from '../common'
import { Segmented, cn } from '../../components/ui'
import { clamp, MiniStat, PseudoCode, range } from './_shared2'

type Mode = 'lcs' | 'edit' | 'paths' | 'knapsack'
type CellValue = number | string

interface DepCell {
  r: number
  c: number
  label: string
}

interface DpFrame {
  table: CellValue[][]
  rowLabels: string[]
  colLabels: string[]
  current?: [number, number]
  deps: DepCell[]
  trace: [number, number][]
  recurrence: string
  line: number
  caption: string
}

const code = [
  { id: 1, text: 'create table with base cases' },
  { id: 2, text: 'select current state dp[i][j]' },
  { id: 3, text: 'read dependency cells' },
  { id: 4, text: 'apply recurrence and write value' },
  { id: 5, text: 'continue until table is full' },
  { id: 6, text: 'trace back through chosen dependencies' },
]

function clone<T>(table: T[][]): T[][] {
  return table.map((row) => [...row])
}

function cleanText(s: string) {
  return s.toLowerCase().replace(/[^a-z]/g, '').slice(0, 8) || 'a'
}

function labels(s: string) {
  return ['∅', ...s.split('')]
}

function makeLcsFrames(aRaw: string, bRaw: string): DpFrame[] {
  const a = cleanText(aRaw)
  const b = cleanText(bRaw)
  const dp = range(a.length + 1).map(() => Array<number>(b.length + 1).fill(0))
  const frames: DpFrame[] = []
  const push = (line: number, caption: string, current?: [number, number], deps: DepCell[] = [], trace: [number, number][] = [], recurrence = 'LCS base row/column = 0') => {
    frames.push({ table: clone(dp), rowLabels: labels(a), colLabels: labels(b), current, deps, trace: [...trace], recurrence, line, caption })
  }
  push(1, `Build a ${(a.length + 1)}×${(b.length + 1)} table for LCS("${a}", "${b}").`)
  for (let i = 1; i <= a.length; i += 1) {
    for (let j = 1; j <= b.length; j += 1) {
      const deps = a[i - 1] === b[j - 1] ? [{ r: i - 1, c: j - 1, label: '↖ + 1' }] : [{ r: i - 1, c: j, label: '↑' }, { r: i, c: j - 1, label: '←' }]
      push(2, `Consider '${a[i - 1]}' vs '${b[j - 1]}' at dp[${i}][${j}].`, [i, j], deps, [], a[i - 1] === b[j - 1] ? `match: dp[i][j] = 1 + dp[i-1][j-1]` : `mismatch: max(dp[i-1][j], dp[i][j-1])`)
      push(3, `Read ${deps.map((d) => d.label).join(' and ')} dependency cell(s).`, [i, j], deps)
      dp[i][j] = a[i - 1] === b[j - 1] ? dp[i - 1][j - 1] + 1 : Math.max(dp[i - 1][j], dp[i][j - 1])
      push(4, `Write dp[${i}][${j}] = ${dp[i][j]}.`, [i, j], deps)
    }
  }
  const trace: [number, number][] = []
  let i = a.length
  let j = b.length
  while (i > 0 && j > 0) {
    trace.push([i, j])
    push(6, `Trace at dp[${i}][${j}].`, [i, j], [], trace, 'follow match diagonals; otherwise move to the larger neighbor')
    if (a[i - 1] === b[j - 1]) {
      i -= 1
      j -= 1
    } else if (dp[i - 1][j] >= dp[i][j - 1]) i -= 1
    else j -= 1
  }
  push(6, `Trace complete. LCS length = ${dp[a.length][b.length]}.`, undefined, [], trace)
  return frames
}

function makeEditFrames(aRaw: string, bRaw: string): DpFrame[] {
  const a = cleanText(aRaw)
  const b = cleanText(bRaw)
  const dp = range(a.length + 1).map(() => Array<number>(b.length + 1).fill(0))
  const frames: DpFrame[] = []
  const push = (line: number, caption: string, current?: [number, number], deps: DepCell[] = [], trace: [number, number][] = [], recurrence = 'base: insert/delete all remaining chars') => {
    frames.push({ table: clone(dp), rowLabels: labels(a), colLabels: labels(b), current, deps, trace: [...trace], recurrence, line, caption })
  }
  for (let i = 0; i <= a.length; i += 1) dp[i][0] = i
  for (let j = 0; j <= b.length; j += 1) dp[0][j] = j
  push(1, `Initialize edit-distance base cases for "${a}" → "${b}".`)
  for (let i = 1; i <= a.length; i += 1) {
    for (let j = 1; j <= b.length; j += 1) {
      const deps = [{ r: i - 1, c: j, label: 'delete ↑' }, { r: i, c: j - 1, label: 'insert ←' }, { r: i - 1, c: j - 1, label: 'replace ↖' }]
      const cost = a[i - 1] === b[j - 1] ? 0 : 1
      push(2, `Compare '${a[i - 1]}' with '${b[j - 1]}'; replacement cost ${cost}.`, [i, j], deps, [], 'min(delete, insert, replace/match)')
      push(3, 'Read delete, insert, and diagonal replace/match costs.', [i, j], deps)
      dp[i][j] = Math.min(dp[i - 1][j] + 1, dp[i][j - 1] + 1, dp[i - 1][j - 1] + cost)
      push(4, `Write dp[${i}][${j}] = ${dp[i][j]}.`, [i, j], deps)
    }
  }
  const trace: [number, number][] = []
  let i = a.length
  let j = b.length
  while (i > 0 || j > 0) {
    trace.push([i, j])
    push(6, `Trace edit choice at dp[${i}][${j}].`, [i, j], [], trace, 'move to predecessor that explains current cost')
    if (i > 0 && j > 0 && dp[i][j] === dp[i - 1][j - 1] + (a[i - 1] === b[j - 1] ? 0 : 1)) {
      i -= 1
      j -= 1
    } else if (i > 0 && dp[i][j] === dp[i - 1][j] + 1) i -= 1
    else j -= 1
  }
  trace.push([0, 0])
  push(6, `Minimum edits = ${dp[a.length][b.length]}.`, undefined, [], trace)
  return frames
}

function makePathsFrames(): DpFrame[] {
  const rows = 5
  const cols = 7
  const dp = range(rows).map(() => Array<number>(cols).fill(0))
  const frames: DpFrame[] = []
  const push = (line: number, caption: string, current?: [number, number], deps: DepCell[] = [], trace: [number, number][] = [], recurrence = 'dp[r][c] = dp[r-1][c] + dp[r][c-1]') => {
    frames.push({ table: clone(dp), rowLabels: range(rows).map(String), colLabels: range(cols).map(String), current, deps, trace: [...trace], recurrence, line, caption })
  }
  push(1, 'Count unique paths from top-left to bottom-right in a 5×7 grid.')
  for (let r = 0; r < rows; r += 1) {
    for (let c = 0; c < cols; c += 1) {
      const deps: DepCell[] = []
      if (r > 0) deps.push({ r: r - 1, c, label: '↑' })
      if (c > 0) deps.push({ r, c: c - 1, label: '←' })
      push(2, `Fill cell (${r}, ${c}).`, [r, c], deps)
      dp[r][c] = r === 0 || c === 0 ? 1 : dp[r - 1][c] + dp[r][c - 1]
      push(4, `dp[${r}][${c}] = ${dp[r][c]}.`, [r, c], deps)
    }
  }
  const trace: [number, number][] = []
  for (let r = rows - 1, c = cols - 1; r > 0 || c > 0; ) {
    trace.push([r, c])
    push(6, `Trace one valid path backward from (${r}, ${c}).`, [r, c], [], trace)
    if (c > 0) c -= 1
    else r -= 1
  }
  trace.push([0, 0])
  push(6, `Total paths = ${dp[rows - 1][cols - 1]}.`, undefined, [], trace)
  return frames
}

function makeKnapsackFrames(): DpFrame[] {
  const weights = [2, 3, 4, 5]
  const values = [3, 4, 5, 8]
  const cap = 8
  const dp = range(weights.length + 1).map(() => Array<number>(cap + 1).fill(0))
  const frames: DpFrame[] = []
  const push = (line: number, caption: string, current?: [number, number], deps: DepCell[] = [], trace: [number, number][] = [], recurrence = 'max(skip item, take item + remaining capacity)') => {
    frames.push({ table: clone(dp), rowLabels: ['0', ...weights.map((w, i) => `w${i + 1}=${w}`)], colLabels: range(cap + 1).map(String), current, deps, trace: [...trace], recurrence, line, caption })
  }
  push(1, '0/1 knapsack: weights [2,3,4,5], values [3,4,5,8], capacity 8.')
  for (let i = 1; i <= weights.length; i += 1) {
    for (let c = 0; c <= cap; c += 1) {
      const deps: DepCell[] = [{ r: i - 1, c, label: 'skip ↑' }]
      if (weights[i - 1] <= c) deps.push({ r: i - 1, c: c - weights[i - 1], label: 'take ↖' })
      push(2, `Item ${i}: weight ${weights[i - 1]}, value ${values[i - 1]}, capacity ${c}.`, [i, c], deps)
      push(3, `Read skip${weights[i - 1] <= c ? ' and take' : ''} option.`, [i, c], deps)
      dp[i][c] = weights[i - 1] > c ? dp[i - 1][c] : Math.max(dp[i - 1][c], values[i - 1] + dp[i - 1][c - weights[i - 1]])
      push(4, `Write best value ${dp[i][c]}.`, [i, c], deps)
    }
  }
  const trace: [number, number][] = []
  for (let i = weights.length, c = cap; i > 0; i -= 1) {
    trace.push([i, c])
    push(6, `Trace item ${i}: ${dp[i][c] === dp[i - 1][c] ? 'skip' : 'take'}.`, [i, c], [], trace)
    if (dp[i][c] !== dp[i - 1][c]) c -= weights[i - 1]
  }
  push(6, `Optimal value = ${dp[weights.length][cap]}.`, undefined, [], trace)
  return frames
}

function framesFor(mode: Mode, a: string, b: string) {
  if (mode === 'lcs') return makeLcsFrames(a, b)
  if (mode === 'edit') return makeEditFrames(a, b)
  if (mode === 'paths') return makePathsFrames()
  return makeKnapsackFrames()
}

function GridView({ frame, width }: { frame: DpFrame; width: number }) {
  const rows = frame.table.length
  const cols = frame.table[0]?.length ?? 0
  const cell = clamp(Math.floor((Math.max(360, width) - 20) / (cols + 1)), 34, 48)
  const tableWidth = (cols + 1) * cell
  const tableHeight = (rows + 1) * cell
  const currentKey = frame.current ? `${frame.current[0]}-${frame.current[1]}` : ''
  const depKeys = new Set(frame.deps.map((d) => `${d.r}-${d.c}`))
  const traceKeys = new Set(frame.trace.map(([r, c]) => `${r}-${c}`))
  const center = (r: number, c: number) => ({ x: (c + 1) * cell + cell / 2, y: (r + 1) * cell + cell / 2 })
  const currentCenter = frame.current ? center(frame.current[0], frame.current[1]) : null

  return (
    <div className="overflow-x-auto rounded-2xl border border-line bg-panel p-3">
      <div className="relative" style={{ width: tableWidth, height: tableHeight }}>
        {currentCenter && (
          <svg className="pointer-events-none absolute inset-0 z-10" width={tableWidth} height={tableHeight}>
            <defs>
              <marker id="dp-arrow" markerWidth="8" markerHeight="8" refX="6" refY="3" orient="auto">
                <path d="M0,0 L6,3 L0,6 Z" fill={C.accent} />
              </marker>
            </defs>
            {frame.deps.map((dep) => {
              const from = center(dep.r, dep.c)
              return <line key={`${dep.r}-${dep.c}-${dep.label}`} x1={from.x} y1={from.y} x2={currentCenter.x} y2={currentCenter.y} stroke={C.accent} strokeWidth={2} strokeDasharray="4 3" markerEnd="url(#dp-arrow)" />
            })}
          </svg>
        )}
        <div className="grid" style={{ gridTemplateColumns: `repeat(${cols + 1}, ${cell}px)` }}>
          <div className="flex items-center justify-center rounded-lg text-xs text-faint">dp</div>
          {frame.colLabels.map((label, c) => (
            <div key={`col-${c}`} className="flex items-center justify-center rounded-lg bg-subtle font-mono text-xs text-muted" style={{ height: cell }}>{label}</div>
          ))}
          {range(rows).flatMap((r) => [
            <div key={`row-${r}`} className="flex items-center justify-center rounded-lg bg-subtle font-mono text-xs text-muted" style={{ height: cell }}>{frame.rowLabels[r]}</div>,
            ...range(cols).map((c) => {
              const key = `${r}-${c}`
              const active = key === currentKey
              const dep = depKeys.has(key)
              const trace = traceKeys.has(key)
              return (
                <div
                  key={key}
                  className={cn('relative m-0.5 flex items-center justify-center rounded-lg border font-mono text-sm font-semibold transition-all duration-200', active ? 'border-accent bg-accent-soft text-accent' : dep ? 'border-accent/60 bg-accent-soft text-fg' : trace ? 'border-ok bg-ok/10 text-ok' : 'border-line bg-panel-2 text-fg')}
                  style={{ height: cell - 4 }}
                >
                  {frame.table[r][c]}
                  {dep && <span className="absolute right-1 top-0 text-[9px] text-accent">{frame.deps.find((d) => d.r === r && d.c === c)?.label}</span>}
                </div>
              )
            }),
          ])}
        </div>
      </div>
    </div>
  )
}

export default function DpGrid() {
  const [mode, setMode] = useState<Mode>('lcs')
  const [a, setA] = useState('abcbdab')
  const [b, setB] = useState('bdcaba')
  const [ref, size] = useSize<HTMLDivElement>()
  const steps = useMemo(() => framesFor(mode, a, b), [a, b, mode])
  const player = usePlayer(steps, 14)
  const frame = player.step
  const result = frame.table[frame.table.length - 1]?.[frame.table[0].length - 1] ?? '—'

  return (
    <VizFrame
      title="Dynamic Programming Table"
      description="Fill a DP grid cell by cell, highlight dependencies, then trace back an optimal explanation."
      controls={
        <>
          <Segmented options={[{ value: 'lcs', label: 'LCS' }, { value: 'edit', label: 'Edit' }, { value: 'paths', label: 'Paths' }, { value: 'knapsack', label: 'Knapsack' }]} value={mode} onChange={setMode} />
          {(mode === 'lcs' || mode === 'edit') && (
            <>
              <input value={a} onChange={(e) => setA(e.target.value)} className="h-8 w-28 rounded-lg border border-line bg-panel px-2 font-mono text-sm outline-none focus:ring-2 focus:ring-accent/40" aria-label="first string" />
              <input value={b} onChange={(e) => setB(e.target.value)} className="h-8 w-28 rounded-lg border border-line bg-panel px-2 font-mono text-sm outline-none focus:ring-2 focus:ring-accent/40" aria-label="second string" />
            </>
          )}
          <PlayerControls player={player} maxSpeed={24} />
        </>
      }
      caption={frame.caption}
      legend={[
        { color: C.accent, label: 'current / dependency' },
        { color: C.ok, label: 'traceback path' },
        { color: C.lineStrong, label: 'base/filled cell' },
      ]}
    >
      <div ref={ref} className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_310px]">
        <GridView frame={frame} width={size.width - 330} />
        <div className="flex flex-col gap-3">
          <div className="grid grid-cols-2 gap-2">
            <MiniStat label="result" value={result} tone="ok" />
            <MiniStat label="trace cells" value={frame.trace.length} tone="info" />
          </div>
          <div className="rounded-xl border border-line bg-panel p-3">
            <div className="mb-1 text-[11px] font-semibold uppercase tracking-wide text-muted">Current recurrence</div>
            <div className="font-mono text-xs text-fg">{frame.recurrence}</div>
          </div>
          <PseudoCode lines={code} active={frame.line} />
        </div>
      </div>
    </VizFrame>
  )
}
