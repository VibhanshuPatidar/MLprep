import { useMemo, useState } from 'react'
import { C, mulberry32, PlayerControls, usePlayer, useSize, VizFrame } from '../common'
import { Button, Segmented, cn } from '../../components/ui'
import { MiniStat, PseudoCode, range } from './_shared2'

type Mode = 'bfs' | 'dfs' | 'islands'
type Tool = 'wall' | 'start' | 'target'
type PaintAction = 'add' | 'remove'

const ROWS = 12
const COLS = 20
const TOTAL = ROWS * COLS

interface FloodFrame {
  kind: 'flood'
  visited: number[]
  frontier: number[]
  path: number[]
  current?: number
  line: number
  caption: string
}

interface IslandFrame {
  kind: 'islands'
  colors: number[]
  active?: number
  stack: number[]
  count: number
  line: number
  caption: string
}

type Frame = FloodFrame | IslandFrame

const floodCode = [
  { id: 1, text: 'push start into queue/stack' },
  { id: 2, text: 'pop next cell from frontier' },
  { id: 3, text: 'if cell is target: stop' },
  { id: 4, text: 'for each open neighbor' },
  { id: 5, text: 'mark visited; remember parent' },
  { id: 6, text: 'trace parent links to target' },
]

const islandCode = [
  { id: 1, text: 'scan grid for unvisited land' },
  { id: 2, text: 'start DFS/BFS for a new island' },
  { id: 3, text: 'pop land cell; color it' },
  { id: 4, text: 'push unvisited land neighbors' },
  { id: 5, text: 'continue scan; final count is islands' },
]

function idx(row: number, col: number) {
  return row * COLS + col
}

function rc(index: number): [number, number] {
  return [Math.floor(index / COLS), index % COLS]
}

function neighbors(index: number) {
  const [r, c] = rc(index)
  const out: number[] = []
  if (r > 0) out.push(idx(r - 1, c))
  if (c < COLS - 1) out.push(idx(r, c + 1))
  if (r < ROWS - 1) out.push(idx(r + 1, c))
  if (c > 0) out.push(idx(r, c - 1))
  return out
}

function initialWalls() {
  const walls = new Set<number>()
  for (let r = 2; r < 10; r += 1) if (r !== 6) walls.add(idx(r, 7))
  for (let c = 10; c < 18; c += 1) if (c !== 13) walls.add(idx(4, c))
  for (let c = 2; c < 9; c += 1) if (c !== 5) walls.add(idx(9, c))
  return walls
}

function randomWalls(seed: number, start: number, target: number) {
  const rng = mulberry32(seed)
  const walls = new Set<number>()
  for (let i = 0; i < TOTAL; i += 1) {
    if (i !== start && i !== target && rng() < 0.22) walls.add(i)
  }
  return walls
}

function makeFloodFrames(mode: 'bfs' | 'dfs', walls: Set<number>, start: number, target: number): FloodFrame[] {
  const frames: FloodFrame[] = []
  const visited = Array<number>(TOTAL).fill(0)
  const prev = Array<number>(TOTAL).fill(-1)
  const frontier: number[] = [start]
  let order = 1
  visited[start] = order
  const push = (line: number, caption: string, current?: number, path: number[] = []) => {
    frames.push({ kind: 'flood', visited: [...visited], frontier: [...frontier], current, path: [...path], line, caption })
  }

  push(1, `${mode.toUpperCase()} starts at ${rc(start).join(',')}; frontier has one cell.`)
  let found = false
  while (frontier.length > 0) {
    const current = mode === 'bfs' ? frontier.shift()! : frontier.pop()!
    push(2, `${mode === 'bfs' ? 'Dequeue' : 'Pop'} cell ${rc(current).join(',')} for expansion.`, current)
    if (current === target) {
      found = true
      push(3, `Target reached at visit #${visited[current]}.`, current)
      break
    }
    for (const next of neighbors(current)) {
      if (walls.has(next) || visited[next] !== 0) continue
      push(4, `Inspect open neighbor ${rc(next).join(',')}.`, current)
      order += 1
      visited[next] = order
      prev[next] = current
      frontier.push(next)
      push(5, `Visit ${rc(next).join(',')} as #${order}; parent is ${rc(current).join(',')}.`, next)
    }
  }

  if (found) {
    const path: number[] = []
    for (let at = target; at !== -1; at = prev[at]) path.push(at)
    path.reverse()
    push(6, mode === 'bfs' ? `BFS shortest path length = ${path.length - 1}.` : `DFS found a path of length ${path.length - 1}.`, target, path)
  } else {
    push(6, 'Frontier is empty; target is unreachable with current walls.')
  }
  return frames
}

function makeIslandGrid(seed: number) {
  const rng = mulberry32(seed)
  return range(TOTAL).map((i) => {
    const [r, c] = rc(i)
    const bias = (Math.sin(r * 1.7) + Math.cos(c * 1.1)) * 0.08
    return rng() + bias > 0.45
  })
}

function makeIslandFrames(land: boolean[]): IslandFrame[] {
  const frames: IslandFrame[] = []
  const colors: number[] = land.map((isLand) => (isLand ? -1 : 0))
  let count = 0
  const push = (line: number, caption: string, active?: number, stack: number[] = []) => {
    frames.push({ kind: 'islands', colors: [...colors], active, stack: [...stack], count, line, caption })
  }

  push(1, 'Scan every cell; blue cells are water, pale green cells are unvisited land.')
  for (let i = 0; i < TOTAL; i += 1) {
    if (colors[i] !== -1) continue
    count += 1
    const stack = [i]
    push(2, `New island #${count} begins at ${rc(i).join(',')}.`, i, stack)
    while (stack.length > 0) {
      const current = stack.pop()!
      if (colors[current] !== -1) continue
      colors[current] = count
      push(3, `Color ${rc(current).join(',')} as island #${count}.`, current, stack)
      for (const next of neighbors(current)) {
        if (colors[next] === -1) {
          stack.push(next)
          push(4, `Neighbor ${rc(next).join(',')} is connected land; add it to the stack.`, next, stack)
        }
      }
    }
  }
  push(5, `Scan complete: ${count} island${count === 1 ? '' : 's'} found.`)
  return frames
}

function FloodGrid({
  frame,
  walls,
  start,
  target,
  tool,
  onPointerCell,
  onDragCell,
}: {
  frame: FloodFrame
  walls: Set<number>
  start: number
  target: number
  tool: Tool
  onPointerCell: (i: number) => void
  onDragCell: (i: number) => void
}) {
  const frontierSet = new Set(frame.frontier)
  const pathSet = new Set(frame.path)
  const maxVisit = Math.max(1, ...frame.visited)
  return (
    <div className="grid touch-none gap-1" style={{ gridTemplateColumns: `repeat(${COLS}, minmax(0, 1fr))` }}>
      {range(TOTAL).map((i) => {
        const visit = frame.visited[i]
        const isWall = walls.has(i)
        const isPath = pathSet.has(i)
        const isFrontier = frontierSet.has(i)
        const current = frame.current === i
        const isStart = i === start
        const isTarget = i === target
        const intensity = visit ? 12 + Math.round((visit / maxVisit) * 32) : 0
        return (
          <button
            key={i}
            type="button"
            title={`${rc(i).join(',')} ${tool}`}
            onPointerDown={() => onPointerCell(i)}
            onPointerEnter={() => onDragCell(i)}
            className={cn('aspect-square rounded-[5px] border border-line text-[9px] font-mono transition-all duration-200', isWall && 'bg-line-strong', !isWall && 'bg-panel hover:ring-1 hover:ring-accent/40')}
            style={{
              background: isWall
                ? C.lineStrong
                : isStart
                  ? C.ok
                  : isTarget
                    ? C.err
                    : isPath
                      ? C.ok
                      : current
                        ? C.accent
                        : isFrontier
                          ? C.info
                          : visit
                            ? `color-mix(in srgb, ${C.accent} ${intensity}%, ${C.panel})`
                            : C.panel,
              color: current || isPath || isStart || isTarget ? 'var(--accent-fg)' : C.muted,
              transform: current || isPath ? 'scale(1.04)' : undefined,
            }}
          >
            {isStart ? 'S' : isTarget ? 'T' : visit > 0 && !isWall && visit < 100 ? visit : ''}
          </button>
        )
      })}
    </div>
  )
}

function IslandGrid({ frame, land }: { frame: IslandFrame; land: boolean[] }) {
  return (
    <div className="grid gap-1" style={{ gridTemplateColumns: `repeat(${COLS}, minmax(0, 1fr))` }}>
      {range(TOTAL).map((i) => {
        const color = frame.colors[i]
        const active = frame.active === i
        const palette = color > 0 ? C.series[(color - 1) % C.series.length] : land[i] ? 'color-mix(in srgb, var(--ok) 16%, var(--panel))' : 'color-mix(in srgb, var(--info) 16%, var(--panel))'
        return (
          <div
            key={i}
            className="aspect-square rounded-[5px] border border-line text-center font-mono text-[9px] leading-none transition-all duration-200"
            style={{ background: palette, color: color > 0 ? 'var(--accent-fg)' : C.muted, transform: active ? 'scale(1.08)' : undefined, boxShadow: active ? `0 0 0 2px ${C.accent}` : undefined }}
          >
            <span className="relative top-1">{color > 0 ? color : ''}</span>
          </div>
        )
      })}
    </div>
  )
}

export default function GraphTraversal() {
  const [mode, setMode] = useState<Mode>('bfs')
  const [tool, setTool] = useState<Tool>('wall')
  const [start, setStart] = useState(idx(5, 3))
  const [target, setTarget] = useState(idx(6, 17))
  const [walls, setWalls] = useState(() => initialWalls())
  const [wallSeed, setWallSeed] = useState(10)
  const [islandSeed, setIslandSeed] = useState(7)
  const [paintAction, setPaintAction] = useState<PaintAction | null>(null)
  const [ref] = useSize<HTMLDivElement>()
  const wallsKey = useMemo(() => [...walls].sort((a, b) => a - b).join('|'), [walls])
  const islandGrid = useMemo(() => makeIslandGrid(islandSeed), [islandSeed])
  const steps = useMemo<Frame[]>(() => {
    if (mode === 'islands') return makeIslandFrames(islandGrid)
    return makeFloodFrames(mode, walls, start, target)
  }, [islandGrid, mode, start, target, walls, wallsKey])
  const player = usePlayer(steps, mode === 'islands' ? 20 : 30)
  const frame = player.step

  const paintWall = (cell: number, action: PaintAction) => {
    if (cell === start || cell === target) return
    setWalls((prev) => {
      const next = new Set(prev)
      if (action === 'add') next.add(cell)
      else next.delete(cell)
      return next
    })
  }

  const pointerCell = (cell: number) => {
    if (mode === 'islands') return
    if (tool === 'start') {
      setStart(cell)
      setWalls((prev) => {
        const next = new Set(prev)
        next.delete(cell)
        return next
      })
      return
    }
    if (tool === 'target') {
      setTarget(cell)
      setWalls((prev) => {
        const next = new Set(prev)
        next.delete(cell)
        return next
      })
      return
    }
    const action: PaintAction = walls.has(cell) ? 'remove' : 'add'
    setPaintAction(action)
    paintWall(cell, action)
  }

  const dragCell = (cell: number) => {
    if (mode !== 'islands' && tool === 'wall' && paintAction) paintWall(cell, paintAction)
  }

  const randomizeWalls = () => {
    const nextSeed = wallSeed + 1
    setWallSeed(nextSeed)
    setWalls(randomWalls(nextSeed, start, target))
  }

  return (
    <VizFrame
      title="Graph Traversal: Grid BFS / DFS"
      description="Draw walls, move start/target, then compare queue-based BFS with stack-based DFS or count islands."
      controls={
        <>
          <Segmented options={[{ value: 'bfs', label: 'BFS' }, { value: 'dfs', label: 'DFS' }, { value: 'islands', label: 'Islands' }]} value={mode} onChange={setMode} />
          {mode !== 'islands' && <Segmented options={[{ value: 'wall', label: 'Walls' }, { value: 'start', label: 'Start' }, { value: 'target', label: 'Target' }]} value={tool} onChange={setTool} />}
          {mode !== 'islands' ? (
            <>
              <Button size="sm" variant="outline" onClick={randomizeWalls}>Random walls</Button>
              <Button size="sm" variant="ghost" onClick={() => setWalls(new Set())}>Clear</Button>
            </>
          ) : (
            <Button size="sm" variant="outline" onClick={() => setIslandSeed((s) => s + 1)}>Random land</Button>
          )}
          <PlayerControls player={player} maxSpeed={40} />
        </>
      }
      caption={frame.caption}
      legend={mode === 'islands' ? [{ color: C.info, label: 'water' }, { color: C.ok, label: 'unvisited land' }, { color: C.series[0], label: 'colored island' }] : [{ color: C.info, label: 'frontier' }, { color: C.accent, label: 'visited/current' }, { color: C.ok, label: 'final path' }, { color: C.lineStrong, label: 'wall' }]}
    >
      <div ref={ref} className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_292px]" onPointerUp={() => setPaintAction(null)} onPointerLeave={() => setPaintAction(null)}>
        <div className="rounded-2xl border border-line bg-panel/70 p-3">
          {frame.kind === 'flood' ? <FloodGrid frame={frame} walls={walls} start={start} target={target} tool={tool} onPointerCell={pointerCell} onDragCell={dragCell} /> : <IslandGrid frame={frame} land={islandGrid} />}
        </div>
        <div className="flex flex-col gap-3">
          <div className="grid grid-cols-2 gap-2">
            <MiniStat label={frame.kind === 'flood' ? 'frontier' : 'stack'} value={frame.kind === 'flood' ? frame.frontier.length : frame.stack.length} tone="info" />
            <MiniStat label={frame.kind === 'flood' ? 'visited' : 'islands'} value={frame.kind === 'flood' ? frame.visited.filter(Boolean).length : frame.count} tone="ok" />
          </div>
          <PseudoCode lines={frame.kind === 'flood' ? floodCode : islandCode} active={frame.line} />
        </div>
      </div>
    </VizFrame>
  )
}
