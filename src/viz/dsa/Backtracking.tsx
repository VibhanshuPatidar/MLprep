import { useMemo, useState } from 'react'
import { C, PlayerControls, usePlayer, useSize, VizFrame } from '../common'
import { Segmented, Slider, cn } from '../../components/ui'
import { cellKey, MiniStat, Pill, PseudoCode, range, svgTextShadow } from './_shared2'

type Mode = 'queens' | 'subsets'

interface QueensFrame {
  kind: 'queens'
  board: number[]
  tryCell?: [number, number]
  conflicts: [number, number][]
  row: number
  solutions: number
  path: string[]
  line: number
  caption: string
}

interface SubsetsFrame {
  kind: 'subsets'
  index: number
  subset: number[]
  outputs: number[][]
  activeNode: string
  line: number
  caption: string
}

type Frame = QueensFrame | SubsetsFrame

const queensCode = [
  { id: 1, text: 'dfs(row): if row == n → record solution' },
  { id: 2, text: 'for col in 0..n-1: try (row, col)' },
  { id: 3, text: 'if column/diagonal conflict: continue' },
  { id: 4, text: 'place queen; path.push((row, col))' },
  { id: 5, text: 'dfs(row + 1)' },
  { id: 6, text: 'undo placement; backtrack' },
]

const subsetsCode = [
  { id: 1, text: 'dfs(i, subset)' },
  { id: 2, text: 'if i == len(nums): emit subset' },
  { id: 3, text: 'exclude nums[i]; dfs(i + 1)' },
  { id: 4, text: 'include nums[i]; dfs(i + 1)' },
  { id: 5, text: 'pop and return to parent' },
]

function conflictCells(board: number[], row: number, col: number): [number, number][] {
  const conflicts: [number, number][] = []
  for (let r = 0; r < row; r += 1) {
    const c = board[r]
    if (c === col || Math.abs(row - r) === Math.abs(col - c)) conflicts.push([r, c])
  }
  return conflicts
}

function makeQueensFrames(n: number): QueensFrame[] {
  const frames: QueensFrame[] = []
  const board = Array<number>(n).fill(-1)
  const path: string[] = []
  let solutions = 0
  const push = (frame: Omit<QueensFrame, 'kind' | 'board' | 'path' | 'solutions'>) => {
    frames.push({ kind: 'queens', board: [...board], path: [...path], solutions, ...frame })
  }

  push({ row: 0, conflicts: [], line: 1, caption: `Start DFS for ${n}-Queens. One row, one queen.` })

  const dfs = (row: number) => {
    if (row === n) {
      solutions += 1
      push({ row, conflicts: [], line: 1, caption: `Solution #${solutions} found: ${path.join(' → ')}.` })
      return
    }
    for (let col = 0; col < n; col += 1) {
      const conflicts = conflictCells(board, row, col)
      push({ row, tryCell: [row, col], conflicts: [[row, col], ...conflicts], line: 2, caption: `Try row ${row}, col ${col}.` })
      if (conflicts.length > 0) {
        push({ row, tryCell: [row, col], conflicts: [[row, col], ...conflicts], line: 3, caption: `Reject (${row}, ${col}) — attacked by ${conflicts.map(([r, c]) => `(${r},${c})`).join(', ')}.` })
        continue
      }
      board[row] = col
      path.push(`r${row}:c${col}`)
      push({ row, tryCell: [row, col], conflicts: [], line: 4, caption: `Place queen at (${row}, ${col}); descend to row ${row + 1}.` })
      push({ row: row + 1, conflicts: [], line: 5, caption: `Recurse with partial board [${path.join(' → ')}].` })
      dfs(row + 1)
      board[row] = -1
      path.pop()
      push({ row, tryCell: [row, col], conflicts: [[row, col]], line: 6, caption: `Undo (${row}, ${col}) and try the next column.` })
    }
  }

  dfs(0)
  push({ row: 0, conflicts: [], line: 1, caption: `Search complete: ${solutions} solution${solutions === 1 ? '' : 's'}.` })
  return frames
}

function makeSubsetFrames(): SubsetsFrame[] {
  const nums = [1, 2, 3]
  const frames: SubsetsFrame[] = []
  const subset: number[] = []
  const outputs: number[][] = []
  const push = (index: number, activeNode: string, line: number, caption: string) => {
    frames.push({ kind: 'subsets', index, subset: [...subset], outputs: outputs.map((x) => [...x]), activeNode, line, caption })
  }
  const dfs = (index: number, path: string) => {
    push(index, path, 1, `At depth ${index}; subset = [${subset.join(', ')}].`)
    if (index === nums.length) {
      outputs.push([...subset])
      push(index, path, 2, `Emit leaf subset [${subset.join(', ')}].`)
      return
    }
    push(index, `${path}0`, 3, `Exclude ${nums[index]} and move left.`)
    dfs(index + 1, `${path}0`)
    subset.push(nums[index])
    push(index, `${path}1`, 4, `Include ${nums[index]} and move right.`)
    dfs(index + 1, `${path}1`)
    subset.pop()
    push(index, path, 5, `Backtrack: remove ${nums[index]} and return.`)
  }
  dfs(0, '')
  return frames
}

function QueensBoard({ frame, width }: { frame: QueensFrame; width: number }) {
  const n = frame.board.length
  const size = Math.min(390, Math.max(260, width - 320))
  const conflictSet = new Set(frame.conflicts.map(([r, c]) => cellKey(r, c)))
  const tryKey = frame.tryCell ? cellKey(frame.tryCell[0], frame.tryCell[1]) : ''

  return (
    <div className="flex flex-col items-center gap-3">
      <div className="overflow-hidden rounded-2xl border border-line bg-panel shadow-sm" style={{ width: size, height: size }}>
        <div className="grid h-full w-full" style={{ gridTemplateColumns: `repeat(${n}, minmax(0, 1fr))` }}>
          {range(n).flatMap((r) =>
            range(n).map((c) => {
              const key = cellKey(r, c)
              const queen = frame.board[r] === c
              const conflict = conflictSet.has(key)
              const trying = tryKey === key
              return (
                <div
                  key={key}
                  className={cn(
                    'relative flex items-center justify-center border-line transition-all duration-300',
                    (r + c) % 2 === 0 ? 'bg-panel' : 'bg-subtle',
                    r < n - 1 && 'border-b',
                    c < n - 1 && 'border-r',
                  )}
                >
                  {trying && <div className={cn('absolute inset-1 rounded-lg border-2 border-dashed transition-colors', conflict ? 'border-err' : 'border-accent')} />}
                  {conflict && <div className="absolute inset-0 bg-err/15" />}
                  {queen && (
                    <div
                      className={cn('z-10 flex h-4/5 w-4/5 items-center justify-center rounded-full text-lg font-bold shadow-sm transition-transform duration-300', conflict ? 'bg-err/15 text-err scale-110' : 'bg-accent-soft text-accent')}
                    >
                      ♛
                    </div>
                  )}
                </div>
              )
            }),
          )}
        </div>
      </div>
      <div className="flex max-w-full flex-wrap justify-center gap-1.5">
        {frame.path.length === 0 ? <Pill>root</Pill> : frame.path.map((p, i) => <Pill key={`${p}-${i}`} tone={i === frame.path.length - 1 ? 'accent' : 'neutral'}>{p}</Pill>)}
      </div>
    </div>
  )
}

function SubsetsTree({ frame, width }: { frame: SubsetsFrame; width: number }) {
  const svgWidth = Math.max(520, Math.min(width - 16, 760))
  const levelGap = 78
  const top = 34
  const nodes = range(4).flatMap((depth) =>
    range(2 ** depth).map((i) => {
      const id = i.toString(2).padStart(depth, '0')
      const x = ((i + 0.5) * svgWidth) / 2 ** depth
      const y = top + depth * levelGap
      return { id, depth, x, y }
    }),
  )
  const activePrefix = frame.activeNode
  const outputs = frame.outputs.map((s) => `[${s.join(',')}]`)

  return (
    <div className="flex flex-col gap-3">
      <svg width="100%" viewBox={`0 0 ${svgWidth} 330`} className="rounded-2xl border border-line bg-panel">
        <defs>
          <marker id="subset-arrow" markerWidth="8" markerHeight="8" refX="6" refY="3" orient="auto">
            <path d="M0,0 L6,3 L0,6 Z" fill={C.lineStrong} />
          </marker>
        </defs>
        {nodes
          .filter((n) => n.depth < 3)
          .flatMap((parent) =>
            [0, 1].map((bit) => {
              const child = nodes.find((n) => n.id === `${parent.id}${bit}`)
              if (!child) return null
              const active = activePrefix.startsWith(child.id)
              return <line key={`${parent.id}-${bit}`} x1={parent.x} y1={parent.y + 17} x2={child.x} y2={child.y - 17} stroke={active ? C.accent : C.lineStrong} strokeWidth={active ? 2.5 : 1.5} markerEnd="url(#subset-arrow)" />
            }),
          )}
        {nodes.map((node) => {
          const active = node.id === frame.activeNode
          const inPath = activePrefix.startsWith(node.id)
          const label = node.depth === 0 ? '∅' : node.id[node.id.length - 1] === '1' ? 'take' : 'skip'
          return (
            <g key={node.id} style={{ transition: 'all .25s ease' }}>
              <circle cx={node.x} cy={node.y} r={active ? 20 : 17} fill={active ? C.accent : inPath ? C.accent2 : C.panel2} stroke={inPath ? C.accent : C.line} strokeWidth={2} />
              <text x={node.x} y={node.y + 4} textAnchor="middle" className="fill-fg font-mono text-[11px]" style={svgTextShadow()}>
                {label}
              </text>
            </g>
          )
        })}
      </svg>
      <div className="flex flex-wrap gap-2">
        {outputs.length === 0 ? <Pill>outputs appear at leaves</Pill> : outputs.map((out, i) => <Pill key={`${out}-${i}`} tone="ok">{out}</Pill>)}
      </div>
    </div>
  )
}

export default function Backtracking() {
  const [mode, setMode] = useState<Mode>('queens')
  const [n, setN] = useState(4)
  const [ref, size] = useSize<HTMLDivElement>()
  const steps = useMemo<Frame[]>(() => (mode === 'queens' ? makeQueensFrames(n) : makeSubsetFrames()), [mode, n])
  const player = usePlayer(steps, mode === 'queens' ? 8 : 3)
  const frame = player.step
  const lines = frame.kind === 'queens' ? queensCode : subsetsCode

  return (
    <VizFrame
      title="Backtracking: N-Queens"
      description="Try a candidate, prove it safe, recurse, then undo. Every frame is an immutable DFS snapshot."
      controls={
        <>
          <Segmented options={[{ value: 'queens', label: 'N-Queens' }, { value: 'subsets', label: 'Subsets' }]} value={mode} onChange={setMode} />
          {mode === 'queens' && <Slider label="n" min={4} max={8} value={n} onChange={setN} className="w-32" />}
          <PlayerControls player={player} maxSpeed={18} />
        </>
      }
      caption={frame.caption}
      legend={[
        { color: C.accent, label: 'active / safe' },
        { color: C.err, label: 'conflict / undo' },
        { color: C.ok, label: 'solution output' },
      ]}
    >
      <div ref={ref} className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_280px]">
        <div className="min-h-[390px] rounded-2xl border border-line bg-panel/70 p-4">
          {frame.kind === 'queens' ? <QueensBoard frame={frame} width={size.width} /> : <SubsetsTree frame={frame} width={size.width} />}
        </div>
        <div className="flex flex-col gap-3">
          <div className="grid grid-cols-2 gap-2">
            <MiniStat label="step" value={`${player.index + 1}/${player.total}`} tone="info" />
            {frame.kind === 'queens' ? <MiniStat label="solutions" value={frame.solutions} tone="ok" /> : <MiniStat label="emitted" value={frame.outputs.length} tone="ok" />}
          </div>
          <PseudoCode lines={lines} active={frame.line} />
        </div>
      </div>
    </VizFrame>
  )
}
