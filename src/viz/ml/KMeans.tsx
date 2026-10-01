import { useMemo, useState } from 'react'
import { Badge, Button, Select, Slider } from '../../components/ui'
import { C, PlayerControls, VizFrame, mulberry32, randn, usePlayer, useSize } from '../common'
import { chartPath, dist, formatNum, type Point2 } from './_math1'

type InitKind = 'random' | 'plus'
type Phase = 'init' | 'assign' | 'update' | 'done'

interface ClusterPoint extends Point2 {
  trueLabel: number
}

interface KFrame {
  centroids: Point2[]
  assignments: number[]
  inertia: number
  iteration: number
  phase: Phase
  caption: string
}

function generateBlobs(kTrue: number, spread: number, seed: number): ClusterPoint[] {
  const rng = mulberry32(seed)
  const centers = Array.from({ length: kTrue }, (_, i) => {
    const angle = (2 * Math.PI * i) / kTrue + 0.35
    return { x: 2.25 * Math.cos(angle), y: 2.25 * Math.sin(angle) }
  })
  return centers.flatMap((c, label) => Array.from({ length: 20 }, () => ({ x: c.x + spread * randn(rng), y: c.y + spread * randn(rng), trueLabel: label })))
}

function initCentroids(points: readonly ClusterPoint[], k: number, init: InitKind, seed: number): Point2[] {
  const rng = mulberry32(seed + k * 31 + (init === 'plus' ? 7 : 0))
  if (init === 'random') {
    const used = new Set<number>()
    while (used.size < k) used.add(Math.floor(rng() * points.length))
    return [...used].map((i) => ({ x: points[i].x, y: points[i].y }))
  }
  const first = points[Math.floor(rng() * points.length)]
  const centroids: Point2[] = [{ x: first.x, y: first.y }]
  while (centroids.length < k) {
    const d2 = points.map((p) => Math.min(...centroids.map((c) => dist(p, c) ** 2)))
    const total = d2.reduce((s, v) => s + v, 0)
    let target = rng() * total
    let idx = 0
    for (; idx < points.length - 1; idx += 1) {
      target -= d2[idx]
      if (target <= 0) break
    }
    centroids.push({ x: points[idx].x, y: points[idx].y })
  }
  return centroids
}

function assign(points: readonly ClusterPoint[], centroids: readonly Point2[]): { assignments: number[]; inertia: number } {
  let inertia = 0
  const assignments = points.map((p) => {
    let best = 0
    let bestD = Infinity
    for (let i = 0; i < centroids.length; i += 1) {
      const d = dist(p, centroids[i])
      if (d < bestD) {
        best = i
        bestD = d
      }
    }
    inertia += bestD * bestD
    return best
  })
  return { assignments, inertia }
}

function recompute(points: readonly ClusterPoint[], assignments: readonly number[], centroids: readonly Point2[]): Point2[] {
  return centroids.map((old, c) => {
    const group = points.filter((_, i) => assignments[i] === c)
    if (group.length === 0) return old
    return { x: group.reduce((s, p) => s + p.x, 0) / group.length, y: group.reduce((s, p) => s + p.y, 0) / group.length }
  })
}

function buildFrames(points: readonly ClusterPoint[], k: number, init: InitKind, seed: number): KFrame[] {
  let centroids = initCentroids(points, k, init, seed)
  let assignments = Array.from({ length: points.length }, () => -1)
  const frames: KFrame[] = [{ centroids, assignments, inertia: 0, iteration: 0, phase: 'init', caption: `${init === 'plus' ? 'k-means++' : 'Random'} initialization placed ${k} centroids.` }]
  for (let iteration = 1; iteration <= 14; iteration += 1) {
    const prev = assignments
    const a = assign(points, centroids)
    assignments = a.assignments
    frames.push({ centroids, assignments, inertia: a.inertia, iteration, phase: 'assign', caption: `Assignment step ${iteration}: each point joins its nearest centroid; inertia=${formatNum(a.inertia, 2)}.` })
    const nextCentroids = recompute(points, assignments, centroids)
    const shift = Math.max(...centroids.map((c, i) => dist(c, nextCentroids[i])))
    centroids = nextCentroids
    frames.push({ centroids, assignments, inertia: assign(points, centroids).inertia, iteration, phase: 'update', caption: `Update step ${iteration}: centroids move to cluster means; max shift=${formatNum(shift, 3)}.` })
    const unchanged = prev.length === assignments.length && prev.every((v, i) => v === assignments[i])
    if (unchanged || shift < 0.01) {
      frames.push({ centroids, assignments, inertia: assign(points, centroids).inertia, iteration, phase: 'done', caption: `Converged after ${iteration} iterations: assignments no longer change.` })
      break
    }
  }
  return frames
}

export default function KMeans() {
  const [kTrue, setKTrue] = useState(3)
  const [spread, setSpread] = useState(0.48)
  const [k, setK] = useState(3)
  const [init, setInit] = useState<InitKind>('plus')
  const [seed, setSeed] = useState(22)
  const [elbow, setElbow] = useState<number[] | null>(null)
  const [wrapRef, size] = useSize<HTMLDivElement>()
  const points = useMemo(() => generateBlobs(kTrue, spread, seed), [kTrue, spread, seed])
  const frames = useMemo(() => buildFrames(points, k, init, seed), [points, k, init, seed])
  const player = usePlayer(frames, 2.5)
  const frame = player.step
  const w = Math.max(320, size.width)
  const plotW = w >= 760 ? w - 270 : w
  const h = 370
  const sx = (x: number) => 28 + ((x + 4) / 8) * (plotW - 56)
  const sy = (y: number) => 18 + (1 - (y + 4) / 8) * (h - 42)
  const inertiaSeries = frames.map((f) => f.inertia).filter((v) => v > 0)
  const convergence = frames[frames.length - 1].phase === 'done' ? 'converged' : 'running'
  const computeElbow = () => {
    const values = Array.from({ length: 8 }, (_, i) => {
      const fs = buildFrames(points, i + 1, 'plus', seed + 101 + i)
      return fs[fs.length - 1].inertia
    })
    setElbow(values)
  }
  const insight = k < kTrue ? 'Insight: k below the true clusters merges blobs, so inertia remains high (under-clustering).' : k > kTrue ? 'Insight: larger k always lowers inertia, but extra centroids may split natural groups; use the elbow, not inertia alone.' : 'Insight: when k matches the data, assignments stabilize and inertia drops sharply before flattening.'

  return (
    <VizFrame
      title="K-Means Clustering"
      description="Animate the alternating assignment and centroid-update steps; compare random and k-means++ initialization."
      controls={
        <>
          <Slider className="w-32" label="true k" min={2} max={5} step={1} value={kTrue} onChange={(v) => { setKTrue(v); setK(Math.min(k, Math.max(2, v + 2))); setElbow(null) }} />
          <Slider className="w-32" label="chosen k" min={1} max={8} step={1} value={k} onChange={(v) => { setK(v); setElbow(null) }} />
          <Slider className="w-36" label="spread" min={0.18} max={1.1} step={0.02} value={spread} onChange={(v) => { setSpread(v); setElbow(null) }} format={(v) => formatNum(v, 2)} />
          <Select value={init} onChange={(v) => { setInit(v); setElbow(null) }} options={[{ value: 'plus', label: 'k-means++' }, { value: 'random', label: 'random' }]} />
          <PlayerControls player={player} maxSpeed={8} />
          <Button size="sm" variant="outline" onClick={() => { setSeed((s) => s + 1); setElbow(null) }}>Regenerate</Button>
          <Button size="sm" variant="secondary" onClick={computeElbow}>Elbow chart</Button>
          <Badge tone={convergence === 'converged' ? 'ok' : 'warn'}>{convergence}</Badge>
        </>
      }
      caption={<div><div>{frame.caption}</div><div className="text-accent">{insight}</div></div>}
      legend={Array.from({ length: Math.min(k, C.series.length) }, (_, i) => ({ color: C.series[i % C.series.length], label: `cluster ${i}` }))}
    >
      <div ref={wrapRef} className="grid gap-3 lg:grid-cols-[1fr_250px]">
        <div className="rounded-xl border border-line bg-panel p-3">
          <svg viewBox={`0 0 ${plotW} ${h}`} className="h-[380px] w-full overflow-visible">
            {Array.from({ length: 24 * 18 }, (_, idx) => {
              const gx = idx % 24
              const gy = Math.floor(idx / 24)
              const x = -4 + ((gx + 0.5) / 24) * 8
              const y = -4 + ((gy + 0.5) / 18) * 8
              let best = 0
              let bestD = Infinity
              frame.centroids.forEach((c, i) => {
                const d = dist({ x, y }, c)
                if (d < bestD) {
                  bestD = d
                  best = i
                }
              })
              const cw = (plotW - 56) / 24
              const ch = (h - 42) / 18
              return <rect key={idx} x={28 + gx * cw} y={18 + (17 - gy) * ch} width={cw + 0.4} height={ch + 0.4} fill={C.series[best % C.series.length]} opacity="0.06" />
            })}
            <rect x="28" y="18" width={plotW - 56} height={h - 42} fill="none" stroke={C.line} />
            {points.map((p, i) => {
              const a = frame.assignments[i]
              const color = a >= 0 ? C.series[a % C.series.length] : C.muted
              return <circle key={i} cx={sx(p.x)} cy={sy(p.y)} r="4.3" fill={color} opacity={a >= 0 ? 0.92 : 0.45} stroke={C.panel} strokeWidth="1" />
            })}
            {frame.centroids.map((c, i) => (
              <g key={i} className="transition-transform duration-300">
                <circle cx={sx(c.x)} cy={sy(c.y)} r="10" fill={C.panel} stroke={C.series[i % C.series.length]} strokeWidth="3" />
                <path d={`M ${sx(c.x) - 6} ${sy(c.y)} L ${sx(c.x) + 6} ${sy(c.y)} M ${sx(c.x)} ${sy(c.y) - 6} L ${sx(c.x)} ${sy(c.y) + 6}`} stroke={C.series[i % C.series.length]} strokeWidth="2" />
              </g>
            ))}
          </svg>
        </div>
        <div className="grid gap-3">
          <div className="rounded-xl border border-line bg-panel p-3">
            <div className="mb-2 flex items-center justify-between text-xs text-muted"><span>Inertia trace</span><Badge tone="accent">{formatNum(frame.inertia, 2)}</Badge></div>
            <svg viewBox="0 0 230 130" className="h-36 w-full overflow-visible">
              <line x1="25" x2="218" y1="108" y2="108" stroke={C.line} />
              <line x1="25" x2="25" y1="16" y2="108" stroke={C.line} />
              <path d={chartPath(inertiaSeries, 25, 16, 193, 92, 0, Math.max(1, ...inertiaSeries))} fill="none" stroke={C.accent} strokeWidth="2.5" />
            </svg>
          </div>
          {elbow && (
            <div className="rounded-xl border border-line bg-panel p-3">
              <div className="mb-2 text-xs text-muted">Elbow: final inertia for k=1..8</div>
              <svg viewBox="0 0 230 140" className="h-40 w-full overflow-visible">
                <line x1="25" x2="218" y1="112" y2="112" stroke={C.line} />
                <line x1="25" x2="25" y1="16" y2="112" stroke={C.line} />
                <path d={chartPath(elbow, 25, 16, 193, 96, 0, Math.max(...elbow))} fill="none" stroke={C.warn} strokeWidth="2.5" />
                {elbow.map((v, i) => <circle key={i} cx={25 + (i / 7) * 193} cy={112 - (v / Math.max(...elbow)) * 96} r={i + 1 === k ? 5 : 3.5} fill={i + 1 === k ? C.accent : C.warn} />)}
              </svg>
            </div>
          )}
        </div>
      </div>
    </VizFrame>
  )
}
