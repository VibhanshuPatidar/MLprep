import { useMemo, useState } from 'react'
import { C, mulberry32, PlayerControls, usePlayer, useSize, VizFrame } from '../common'
import { Button } from '../../components/ui'
import { MiniStat, Pill, PseudoCode, range, svgTextShadow } from './_shared2'

interface Edge {
  u: number
  v: number
}

interface UfFrame {
  parent: number[]
  rank: number[]
  components: number
  processed: Edge[]
  activeEdge?: Edge
  path: number[]
  redundant?: Edge
  line: number
  caption: string
}

const N = 10

const code = [
  { id: 1, text: 'for edge (u, v): union(u, v)' },
  { id: 2, text: 'find(x): follow parent pointers' },
  { id: 3, text: 'root is node with parent[root] == root' },
  { id: 4, text: 'path compression: parent[x] = root' },
  { id: 5, text: 'same root → redundant edge / cycle' },
  { id: 6, text: 'attach lower-rank root under higher-rank root' },
  { id: 7, text: 'if ranks tie, increase new root rank' },
]

const presetEdges: Edge[] = [
  { u: 0, v: 1 },
  { u: 1, v: 2 },
  { u: 3, v: 4 },
  { u: 2, v: 4 },
  { u: 5, v: 6 },
  { u: 6, v: 7 },
  { u: 7, v: 5 },
  { u: 8, v: 9 },
  { u: 4, v: 9 },
  { u: 0, v: 9 },
]

function randomEdges(seed: number) {
  const rng = mulberry32(seed)
  const edges: Edge[] = []
  const seen = new Set<string>()
  while (edges.length < 11) {
    const u = Math.floor(rng() * N)
    let v = Math.floor(rng() * N)
    if (u === v) v = (v + 1) % N
    const key = [u, v].sort((a, b) => a - b).join('-')
    if (!seen.has(key)) {
      seen.add(key)
      edges.push({ u, v })
    }
  }
  return edges
}

function makeFrames(edges: Edge[]): UfFrame[] {
  const parent = range(N)
  const rank = Array<number>(N).fill(0)
  const processed: Edge[] = []
  let components = N
  const frames: UfFrame[] = []
  const push = (line: number, caption: string, activeEdge?: Edge, path: number[] = [], redundant?: Edge) => {
    frames.push({ parent: [...parent], rank: [...rank], components, processed: processed.map((e) => ({ ...e })), activeEdge, path: [...path], redundant, line, caption })
  }
  const find = (x: number, edge: Edge) => {
    const path = [x]
    let current = x
    push(2, `find(${x}): start at ${x}.`, edge, path)
    while (parent[current] !== current) {
      current = parent[current]
      path.push(current)
      push(2, `Follow parent pointer to ${current}.`, edge, path)
    }
    const root = current
    push(3, `Root of ${x} is ${root}.`, edge, path)
    for (const node of path.slice(0, -1)) {
      if (parent[node] !== root) {
        parent[node] = root
        push(4, `Compress path: parent[${node}] = ${root}.`, edge, [node, root])
      }
    }
    return root
  }

  push(1, 'Initialize each node as its own parent with rank 0.')
  for (const edge of edges) {
    push(1, `Process edge (${edge.u}, ${edge.v}).`, edge)
    const ru = find(edge.u, edge)
    const rv = find(edge.v, edge)
    if (ru === rv) {
      processed.push(edge)
      push(5, `Both endpoints already have root ${ru}; edge (${edge.u}, ${edge.v}) creates a cycle.`, edge, [edge.u, edge.v, ru], edge)
      continue
    }
    let rootA = ru
    let rootB = rv
    if (rank[rootA] < rank[rootB]) [rootA, rootB] = [rootB, rootA]
    parent[rootB] = rootA
    components -= 1
    push(6, `Attach root ${rootB} under root ${rootA}; components = ${components}.`, edge, [rootB, rootA])
    if (rank[rootA] === rank[rootB]) {
      rank[rootA] += 1
      push(7, `Ranks tied, so rank[${rootA}] becomes ${rank[rootA]}.`, edge, [rootA])
    }
    processed.push(edge)
  }
  push(1, `All edges processed; ${components} component${components === 1 ? '' : 's'} remain.`)
  return frames
}

function edgeLabel(edge: Edge) {
  return `${edge.u}-${edge.v}`
}

function Forest({ frame, width, edges }: { frame: UfFrame; width: number; edges: Edge[] }) {
  const svgWidth = Math.max(520, width)
  const svgHeight = 330
  const centerX = svgWidth / 2
  const centerY = svgHeight / 2
  const radius = Math.min(svgWidth, svgHeight) * 0.36
  const pos = new Map<number, { x: number; y: number }>()
  for (const i of range(N)) {
    const angle = -Math.PI / 2 + (i / N) * Math.PI * 2
    pos.set(i, { x: centerX + Math.cos(angle) * radius, y: centerY + Math.sin(angle) * radius })
  }
  const pathSet = new Set(frame.path)
  const processedSet = new Set(frame.processed.map(edgeLabel))
  const redundantKey = frame.redundant ? edgeLabel(frame.redundant) : ''

  return (
    <div className="space-y-3">
      <svg width="100%" viewBox={`0 0 ${svgWidth} ${svgHeight}`} className="rounded-2xl border border-line bg-panel">
        <defs>
          <marker id="uf-arrow" markerWidth="8" markerHeight="8" refX="6" refY="3" orient="auto">
            <path d="M0,0 L6,3 L0,6 Z" fill={C.lineStrong} />
          </marker>
        </defs>
        {range(N).map((i) => {
          const p = frame.parent[i]
          if (p === i) return null
          const a = pos.get(i)!
          const b = pos.get(p)!
          const active = pathSet.has(i) && pathSet.has(p)
          return <line key={`${i}-${p}`} x1={a.x} y1={a.y} x2={b.x} y2={b.y} stroke={active ? C.accent : C.lineStrong} strokeWidth={active ? 3 : 1.6} strokeLinecap="round" markerEnd="url(#uf-arrow)" />
        })}
        {frame.processed.map((edge, i) => {
          const a = pos.get(edge.u)!
          const b = pos.get(edge.v)!
          const red = edgeLabel(edge) === redundantKey
          return <line key={`edge-${i}`} x1={a.x} y1={a.y} x2={b.x} y2={b.y} stroke={red ? C.err : C.ok} strokeWidth={red ? 4 : 2} strokeOpacity={0.45} strokeDasharray={red ? '6 4' : undefined} />
        })}
        {range(N).map((i) => {
          const p = pos.get(i)!
          const root = frame.parent[i] === i
          const active = pathSet.has(i)
          return (
            <g key={i}>
              <circle cx={p.x} cy={p.y} r={active ? 24 : 21} fill={active ? C.accent : root ? C.ok : C.panel2} stroke={active ? C.accent : root ? C.ok : C.lineStrong} strokeWidth={3} />
              <text x={p.x} y={p.y + 5} textAnchor="middle" className="fill-fg font-mono text-sm font-bold" style={svgTextShadow()}>
                {i}
              </text>
            </g>
          )
        })}
      </svg>
      <div className="flex flex-wrap gap-1.5">
        {edges.map((edge, i) => {
          const active = frame.activeEdge?.u === edge.u && frame.activeEdge.v === edge.v
          const done = processedSet.has(edgeLabel(edge))
          const red = redundantKey === edgeLabel(edge)
          return <Pill key={`${edge.u}-${edge.v}-${i}`} tone={red ? 'err' : active ? 'accent' : done ? 'ok' : 'neutral'}>{edge.u}-{edge.v}</Pill>
        })}
      </div>
    </div>
  )
}

export default function UnionFind() {
  const [seed, setSeed] = useState(0)
  const [useRandom, setUseRandom] = useState(false)
  const [ref, size] = useSize<HTMLDivElement>()
  const edges = useMemo(() => (useRandom ? randomEdges(seed) : presetEdges), [seed, useRandom])
  const steps = useMemo(() => makeFrames(edges), [edges])
  const player = usePlayer(steps, 5)
  const frame = player.step

  return (
    <VizFrame
      title="Union-Find (Disjoint Set Union)"
      description="Union by rank keeps trees shallow; path compression flattens parent chains during find()."
      controls={
        <>
          <Button size="sm" variant={useRandom ? 'secondary' : 'primary'} onClick={() => setUseRandom(false)}>Preset edges</Button>
          <Button size="sm" variant="outline" onClick={() => { setUseRandom(true); setSeed((s) => s + 1) }}>Randomize</Button>
          <PlayerControls player={player} maxSpeed={12} />
        </>
      }
      caption={frame.caption}
      legend={[
        { color: C.accent, label: 'active find path' },
        { color: C.ok, label: 'root / accepted edge' },
        { color: C.err, label: 'redundant cycle edge' },
      ]}
    >
      <div ref={ref} className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_310px]">
        <Forest frame={frame} width={size.width - 330} edges={edges} />
        <div className="flex flex-col gap-3">
          <div className="grid grid-cols-2 gap-2">
            <MiniStat label="components" value={frame.components} tone="ok" />
            <MiniStat label="processed" value={`${frame.processed.length}/${edges.length}`} tone="info" />
          </div>
          <div className="rounded-xl border border-line bg-panel p-3">
            <div className="mb-2 text-[11px] font-semibold uppercase tracking-wide text-muted">Parent / rank arrays</div>
            <div className="grid grid-cols-5 gap-1.5">
              {range(N).map((i) => (
                <div key={i} className="rounded-lg border border-line bg-subtle px-2 py-1 text-center">
                  <div className="text-[10px] text-muted">node {i}</div>
                  <div className="font-mono text-xs text-fg">p:{frame.parent[i]}</div>
                  <div className="font-mono text-[10px] text-faint">r:{frame.rank[i]}</div>
                </div>
              ))}
            </div>
          </div>
          <PseudoCode lines={code} active={frame.line} />
        </div>
      </div>
    </VizFrame>
  )
}
