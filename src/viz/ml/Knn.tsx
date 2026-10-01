import { useMemo, useState, type MouseEvent } from 'react'
import { Badge, Button, Segmented, Slider } from '../../components/ui'
import { C, VizFrame, mulberry32, randn, useSize } from '../common'
import { clamp, dist, formatNum, type LabeledPoint, type Point2 } from './_math1'

type Metric = 'euclidean' | 'manhattan'

interface Neighbor extends LabeledPoint {
  d: number
}

function makePoints(classes: number, seed: number): LabeledPoint[] {
  const rng = mulberry32(seed + classes * 13)
  const centers = classes === 2 ? [{ x: -1.4, y: 0.2 }, { x: 1.35, y: -0.15 }] : [{ x: -1.65, y: -1.15 }, { x: 1.65, y: -1.05 }, { x: 0.05, y: 1.65 }]
  return centers.flatMap((c, label) =>
    Array.from({ length: 28 }, () => ({
      x: clamp(c.x + 0.72 * randn(rng), -2.85, 2.85),
      y: clamp(c.y + 0.58 * randn(rng), -2.85, 2.85),
      label,
    })),
  )
}

function nearest(points: readonly LabeledPoint[], query: Point2, k: number, metric: Metric): Neighbor[] {
  return points.map((p) => ({ ...p, d: dist(p, query, metric) })).sort((a, b) => a.d - b.d).slice(0, k)
}

function predict(points: readonly LabeledPoint[], query: Point2, k: number, metric: Metric, classes: number): { label: number; votes: number[]; neighbors: Neighbor[] } {
  const neighbors = nearest(points, query, k, metric)
  const votes = Array.from({ length: classes }, () => 0)
  for (const n of neighbors) votes[n.label] += 1
  let label = 0
  for (let i = 1; i < votes.length; i += 1) if (votes[i] > votes[label]) label = i
  return { label, votes, neighbors }
}

export default function Knn() {
  const [classes, setClasses] = useState<2 | 3>(3)
  const [k, setK] = useState(7)
  const [metric, setMetric] = useState<Metric>('euclidean')
  const [seed, setSeed] = useState(31)
  const [query, setQuery] = useState<Point2>({ x: 0.15, y: 0.25 })
  const [pinned, setPinned] = useState(false)
  const [wrapRef, size] = useSize<HTMLDivElement>()
  const points = useMemo(() => makePoints(classes, seed), [classes, seed])
  const w = Math.max(320, size.width)
  const plotW = w >= 760 ? w - 250 : w
  const h = 382
  const sx = (x: number) => 26 + ((x + 3) / 6) * (plotW - 52)
  const sy = (y: number) => 18 + (1 - (y + 3) / 6) * (h - 44)
  const result = useMemo(() => predict(points, query, k, metric, classes), [points, query, k, metric, classes])
  const cells = useMemo(() => {
    const cols = 42
    const rows = 30
    return Array.from({ length: cols * rows }, (_, idx) => {
      const gx = idx % cols
      const gy = Math.floor(idx / cols)
      const x = -3 + ((gx + 0.5) / cols) * 6
      const y = -3 + ((gy + 0.5) / rows) * 6
      return { gx, gy, cols, rows, label: predict(points, { x, y }, k, metric, classes).label }
    })
  }, [points, k, metric, classes])
  const updateQuery = (event: MouseEvent<SVGSVGElement>, pin: boolean) => {
    const rect = event.currentTarget.getBoundingClientRect()
    const x = -3 + ((event.clientX - rect.left) / rect.width) * 6
    const y = 3 - ((event.clientY - rect.top) / rect.height) * 6
    setQuery({ x, y })
    if (pin) setPinned(true)
  }
  const confidence = Math.max(...result.votes) / k
  const insight = k <= 3 ? 'Insight: small k creates flexible, jagged boundaries with low bias but high variance.' : k >= 17 ? 'Insight: large k smooths away local structure; lower variance, higher bias.' : 'Insight: moderate k averages local evidence while preserving broad class structure.'

  return (
    <VizFrame
      title="K-Nearest Neighbors"
      description="Move or click a query point to see nearest neighbors vote; regions update for k and distance metric."
      controls={
        <>
          <Segmented options={[{ value: 2, label: '2 classes' }, { value: 3, label: '3 classes' }]} value={classes} onChange={(v) => { setClasses(v as 2 | 3); setPinned(false) }} />
          <Slider className="w-36" label="k" min={1} max={25} step={2} value={k} onChange={setK} />
          <Segmented options={[{ value: 'euclidean', label: 'Euclidean' }, { value: 'manhattan', label: 'Manhattan' }]} value={metric} onChange={setMetric} />
          <Button size="sm" variant="outline" onClick={() => setSeed((s) => s + 1)}>Regenerate</Button>
          <Button size="sm" variant={pinned ? 'primary' : 'secondary'} onClick={() => setPinned(false)}>Follow hover</Button>
          <Badge tone="accent">query: class {result.label}</Badge>
        </>
      }
      caption={<div><div>Predicted class {result.label}: votes [{result.votes.join(', ')}], confidence={(100 * confidence).toFixed(0)}%, metric={metric}.</div><div className="text-accent">{insight}</div></div>}
      legend={Array.from({ length: classes }, (_, i) => ({ color: C.series[i], label: `class ${i}` })).concat([{ color: C.accent, label: 'query + neighbors' }])}
    >
      <div ref={wrapRef} className="grid gap-3 lg:grid-cols-[1fr_230px]">
        <div className="rounded-xl border border-line bg-panel p-3">
          <svg viewBox={`0 0 ${plotW} ${h}`} onMouseMove={(e) => { if (!pinned) updateQuery(e, false) }} onClick={(e) => updateQuery(e, true)} className="h-[390px] w-full cursor-crosshair overflow-visible">
            {cells.map((cell) => {
              const cw = (plotW - 52) / cell.cols
              const ch = (h - 44) / cell.rows
              return <rect key={`${cell.gx}-${cell.gy}`} x={26 + cell.gx * cw} y={18 + (cell.rows - 1 - cell.gy) * ch} width={cw + 0.3} height={ch + 0.3} fill={C.series[cell.label]} opacity="0.12" />
            })}
            <rect x="26" y="18" width={plotW - 52} height={h - 44} fill="none" stroke={C.line} />
            {result.neighbors.map((n, i) => <line key={`n-${i}`} x1={sx(query.x)} y1={sy(query.y)} x2={sx(n.x)} y2={sy(n.y)} stroke={C.accent} strokeWidth={i < 3 ? 1.8 : 1} opacity={0.35} />)}
            {points.map((p, i) => {
              const inSet = result.neighbors.some((n) => n.x === p.x && n.y === p.y && n.label === p.label)
              return <circle key={i} cx={sx(p.x)} cy={sy(p.y)} r={inSet ? 6 : 4.3} fill={C.series[p.label]} opacity={inSet ? 1 : 0.86} stroke={inSet ? C.accent : C.panel} strokeWidth={inSet ? 2 : 1} />
            })}
            <g>
              <circle cx={sx(query.x)} cy={sy(query.y)} r="9" fill={C.panel} stroke={C.accent} strokeWidth="3" />
              <path d={`M ${sx(query.x) - 5} ${sy(query.y)} L ${sx(query.x) + 5} ${sy(query.y)} M ${sx(query.x)} ${sy(query.y) - 5} L ${sx(query.x)} ${sy(query.y) + 5}`} stroke={C.accent} strokeWidth="2" />
            </g>
          </svg>
        </div>
        <div className="grid gap-3 text-xs">
          <div className="rounded-xl border border-line bg-panel p-3">
            <div className="mb-2 flex items-center justify-between"><span className="text-muted">Vote counts</span><Badge tone="accent">k={k}</Badge></div>
            <div className="space-y-2">
              {result.votes.map((v, i) => (
                <div key={i}>
                  <div className="flex justify-between"><span style={{ color: C.series[i] }}>class {i}</span><span className="font-mono">{v}</span></div>
                  <div className="mt-1 h-2 overflow-hidden rounded-full bg-line"><div className="h-full rounded-full transition-all" style={{ width: `${(100 * v) / k}%`, background: C.series[i] }} /></div>
                </div>
              ))}
            </div>
          </div>
          <div className="rounded-xl border border-line bg-panel p-3">
            <div className="text-muted">Nearest distances</div>
            <div className="mt-2 space-y-1 font-mono text-[11px]">
              {result.neighbors.slice(0, 7).map((n, i) => <div key={i} style={{ color: C.series[n.label] }}>#{i + 1} c{n.label} d={formatNum(n.d, 2)}</div>)}
            </div>
          </div>
        </div>
      </div>
    </VizFrame>
  )
}
