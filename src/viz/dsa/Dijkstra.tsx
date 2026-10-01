import { useMemo, useState } from 'react'
import { C, mulberry32, PlayerControls, usePlayer, useSize, VizFrame } from '../common'
import { Button, Select } from '../../components/ui'
import { MiniStat, Pill, PseudoCode, svgTextShadow } from './_shared2'

interface GraphNode {
  id: string
  x: number
  y: number
}

interface GraphEdge {
  a: string
  b: string
}

interface QueueItem {
  id: string
  dist: number
}

interface DijkstraFrame {
  dist: Record<string, number>
  prev: Record<string, string | null>
  visited: string[]
  pq: QueueItem[]
  current?: string
  activeEdge?: string
  treeEdges: string[]
  line: number
  caption: string
}

const nodes: GraphNode[] = [
  { id: 'A', x: 0.11, y: 0.52 },
  { id: 'B', x: 0.27, y: 0.2 },
  { id: 'C', x: 0.29, y: 0.78 },
  { id: 'D', x: 0.48, y: 0.38 },
  { id: 'E', x: 0.55, y: 0.86 },
  { id: 'F', x: 0.72, y: 0.18 },
  { id: 'G', x: 0.78, y: 0.62 },
  { id: 'H', x: 0.92, y: 0.38 },
]

const edges: GraphEdge[] = [
  { a: 'A', b: 'B' },
  { a: 'A', b: 'C' },
  { a: 'B', b: 'C' },
  { a: 'B', b: 'D' },
  { a: 'C', b: 'D' },
  { a: 'C', b: 'E' },
  { a: 'D', b: 'F' },
  { a: 'D', b: 'G' },
  { a: 'E', b: 'G' },
  { a: 'F', b: 'G' },
  { a: 'F', b: 'H' },
  { a: 'G', b: 'H' },
]

const code = [
  { id: 1, text: 'dist[source] = 0; push source' },
  { id: 2, text: 'extract node with minimum distance' },
  { id: 3, text: 'settle it if not already visited' },
  { id: 4, text: 'for each outgoing edge (u, v, w)' },
  { id: 5, text: 'if dist[u] + w < dist[v]: relax' },
  { id: 6, text: 'otherwise keep old distance' },
  { id: 7, text: 'previous pointers form shortest-path tree' },
]

function edgeKey(a: string, b: string) {
  return [a, b].sort().join('-')
}

function makeWeights(seed: number) {
  const rng = mulberry32(seed)
  const weights: Record<string, number> = {}
  for (const e of edges) weights[edgeKey(e.a, e.b)] = 1 + Math.floor(rng() * 9)
  return weights
}

function makeFrames(source: string, weights: Record<string, number>): DijkstraFrame[] {
  const dist: Record<string, number> = Object.fromEntries(nodes.map((n) => [n.id, Number.POSITIVE_INFINITY]))
  const prev: Record<string, string | null> = Object.fromEntries(nodes.map((n) => [n.id, null]))
  const visited = new Set<string>()
  const pq: QueueItem[] = []
  const frames: DijkstraFrame[] = []
  const treeEdges = () => Object.entries(prev).flatMap(([to, from]) => (from ? [edgeKey(from, to)] : []))
  const push = (line: number, caption: string, current?: string, activeEdge?: string) => {
    frames.push({
      dist: { ...dist },
      prev: { ...prev },
      visited: [...visited],
      pq: pq.map((item) => ({ ...item })).sort((a, b) => a.dist - b.dist || a.id.localeCompare(b.id)),
      current,
      activeEdge,
      treeEdges: treeEdges(),
      line,
      caption,
    })
  }

  dist[source] = 0
  pq.push({ id: source, dist: 0 })
  push(1, `Initialize distances; source ${source} has distance 0.`)

  while (pq.length > 0) {
    pq.sort((a, b) => a.dist - b.dist || a.id.localeCompare(b.id))
    const item = pq.shift()!
    push(2, `Extract min: ${item.id} with tentative distance ${item.dist}.`, item.id)
    if (visited.has(item.id)) {
      push(3, `${item.id} was already settled; discard stale queue entry.`, item.id)
      continue
    }
    visited.add(item.id)
    push(3, `Settle ${item.id}; its shortest distance is now final.`, item.id)
    for (const edge of edges.filter((e) => e.a === item.id || e.b === item.id)) {
      const v = edge.a === item.id ? edge.b : edge.a
      if (visited.has(v)) continue
      const key = edgeKey(item.id, v)
      const weight = weights[key]
      push(4, `Inspect edge ${item.id} → ${v} with weight ${weight}.`, item.id, key)
      const candidate = dist[item.id] + weight
      if (candidate < dist[v]) {
        dist[v] = candidate
        prev[v] = item.id
        pq.push({ id: v, dist: candidate })
        push(5, `Relax ${v}: new distance ${candidate}, predecessor ${item.id}.`, v, key)
      } else {
        push(6, `No update for ${v}: ${candidate} is not better than ${dist[v]}.`, v, key)
      }
    }
  }
  push(7, 'All reachable nodes are settled; green edges form the shortest-path tree.')
  return frames
}

function fmt(d: number) {
  return Number.isFinite(d) ? String(d) : '∞'
}

function GraphSvg({ frame, weights, width }: { frame: DijkstraFrame; weights: Record<string, number>; width: number }) {
  const svgWidth = Math.max(560, width)
  const svgHeight = 360
  const pos = new Map(nodes.map((n) => [n.id, { x: n.x * svgWidth, y: n.y * svgHeight }]))
  const visitedSet = new Set(frame.visited)
  const treeSet = new Set(frame.treeEdges)

  return (
    <svg width="100%" viewBox={`0 0 ${svgWidth} ${svgHeight}`} className="rounded-2xl border border-line bg-panel">
      {edges.map((edge) => {
        const a = pos.get(edge.a)!
        const b = pos.get(edge.b)!
        const key = edgeKey(edge.a, edge.b)
        const active = frame.activeEdge === key
        const tree = treeSet.has(key)
        return (
          <g key={key}>
            <line x1={a.x} y1={a.y} x2={b.x} y2={b.y} stroke={active ? C.warn : tree ? C.ok : C.lineStrong} strokeWidth={active ? 5 : tree ? 4 : 2} strokeLinecap="round" className="transition-all duration-300" />
            <rect x={(a.x + b.x) / 2 - 13} y={(a.y + b.y) / 2 - 12} width={26} height={20} rx={8} fill={C.panel2} stroke={active ? C.warn : C.line} />
            <text x={(a.x + b.x) / 2} y={(a.y + b.y) / 2 + 3} textAnchor="middle" className="fill-fg font-mono text-[11px] font-semibold">
              {weights[key]}
            </text>
          </g>
        )
      })}
      {nodes.map((node) => {
        const p = pos.get(node.id)!
        const current = frame.current === node.id
        const visited = visitedSet.has(node.id)
        return (
          <g key={node.id} className="transition-all duration-300">
            <circle cx={p.x} cy={p.y} r={current ? 28 : 24} fill={current ? C.accent : visited ? C.ok : C.panel2} stroke={current ? C.accent : visited ? C.ok : C.lineStrong} strokeWidth={3} />
            <text x={p.x} y={p.y - 2} textAnchor="middle" className="fill-fg text-sm font-bold" style={svgTextShadow()}>
              {node.id}
            </text>
            <text x={p.x} y={p.y + 15} textAnchor="middle" className="fill-muted font-mono text-[10px]" style={svgTextShadow()}>
              d={fmt(frame.dist[node.id])}
            </text>
          </g>
        )
      })}
    </svg>
  )
}

export default function Dijkstra() {
  const [source, setSource] = useState('A')
  const [seed, setSeed] = useState(19)
  const [ref, size] = useSize<HTMLDivElement>()
  const weights = useMemo(() => makeWeights(seed), [seed])
  const steps = useMemo(() => makeFrames(source, weights), [source, weights])
  const player = usePlayer(steps, 4)
  const frame = player.step
  const settled = frame.visited.length

  return (
    <VizFrame
      title="Dijkstra's Shortest Path"
      description="Extract the nearest unsettled node, relax its edges, and watch the distance table converge."
      controls={
        <>
          <Select value={source} onChange={setSource} options={nodes.map((n) => ({ value: n.id, label: `Source ${n.id}` }))} />
          <Button size="sm" variant="outline" onClick={() => setSeed((s) => s + 1)}>Randomize weights</Button>
          <PlayerControls player={player} maxSpeed={10} />
        </>
      }
      caption={frame.caption}
      legend={[
        { color: C.warn, label: 'edge being relaxed' },
        { color: C.accent, label: 'current min' },
        { color: C.ok, label: 'settled / tree' },
      ]}
    >
      <div ref={ref} className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_320px]">
        <div className="space-y-3">
          <GraphSvg frame={frame} weights={weights} width={size.width - 340} />
          <div className="flex flex-wrap gap-1.5">
            {frame.pq.length === 0 ? <Pill>priority queue empty</Pill> : frame.pq.slice(0, 8).map((item, i) => <Pill key={`${item.id}-${item.dist}-${i}`} tone={i === 0 ? 'accent' : 'neutral'}>{item.id}:{item.dist}</Pill>)}
          </div>
        </div>
        <div className="flex flex-col gap-3">
          <div className="grid grid-cols-2 gap-2">
            <MiniStat label="settled" value={`${settled}/${nodes.length}`} tone="ok" />
            <MiniStat label="queue" value={frame.pq.length} tone="info" />
          </div>
          <div className="rounded-xl border border-line bg-panel p-3">
            <div className="mb-2 text-[11px] font-semibold uppercase tracking-wide text-muted">Distance table</div>
            <div className="grid grid-cols-4 gap-1.5">
              {nodes.map((node) => (
                <div key={node.id} className="rounded-lg border border-line bg-subtle px-2 py-1">
                  <div className="text-[10px] text-muted">{node.id}</div>
                  <div className="font-mono text-sm font-semibold text-fg">{fmt(frame.dist[node.id])}</div>
                  <div className="h-3 font-mono text-[10px] text-faint">← {frame.prev[node.id] ?? '—'}</div>
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
