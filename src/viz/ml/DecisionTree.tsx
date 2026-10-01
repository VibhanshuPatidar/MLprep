import { useMemo, useState } from 'react'
import { Select, Slider } from '../../components/ui'
import { C, PlayerControls, VizFrame, usePlayer, useSize } from '../common'
import { LabeledPoint, entropy, fmt, gini, normal, seeded } from './_math2'

type Preset = 'blobs3' | 'xor' | 'rings' | 'stripes'
type Criterion = 'gini' | 'entropy'
type Feature = 'x' | 'y'
type Bounds = { xmin: number; xmax: number; ymin: number; ymax: number }
type Candidate = { feature: Feature; threshold: number; impurity: number }
type Node = {
  id: number
  depth: number
  bounds: Bounds
  counts: number[]
  impurity: number
  prediction: number
  split?: { feature: Feature; threshold: number }
  left?: Node
  right?: Node
}

const DOMAIN = 1.65
const PRESETS: { value: Preset; label: string }[] = [
  { value: 'blobs3', label: '3 blobs' },
  { value: 'xor', label: 'XOR' },
  { value: 'rings', label: 'Rings' },
  { value: 'stripes', label: 'Stripes' },
]
const CRITERIA: { value: Criterion; label: string }[] = [
  { value: 'gini', label: 'Gini' },
  { value: 'entropy', label: 'Entropy' },
]

function impurity(counts: number[], criterion: Criterion): number {
  return criterion === 'gini' ? gini(counts) : entropy(counts)
}

function makePoints(preset: Preset): { points: LabeledPoint[]; classes: number } {
  const rng = seeded(900 + preset.length * 71)
  if (preset === 'blobs3') {
    const centers = [{ x: -0.8, y: -0.55 }, { x: 0.75, y: -0.45 }, { x: 0.05, y: 0.82 }]
    return { classes: 3, points: Array.from({ length: 180 }, (_, i) => {
      const label = i % 3
      const c = centers[label]
      return { x: c.x + normal(rng) * 0.32, y: c.y + normal(rng) * 0.28, label }
    }) }
  }
  if (preset === 'rings') {
    return { classes: 3, points: Array.from({ length: 210 }, () => {
      const a = rng() * Math.PI * 2
      const r = Math.sqrt(rng()) * 1.5
      const label = r < 0.55 ? 0 : r < 1.05 ? 1 : 2
      return { x: r * Math.cos(a) + normal(rng) * 0.04, y: r * Math.sin(a) + normal(rng) * 0.04, label }
    }) }
  }
  if (preset === 'stripes') {
    return { classes: 3, points: Array.from({ length: 180 }, () => {
      const x = (rng() * 2 - 1) * 1.45
      const y = (rng() * 2 - 1) * 1.45
      const label = Math.max(0, Math.min(2, Math.floor((x + 1.5) / 1)))
      return { x: x + normal(rng) * 0.03, y: y + normal(rng) * 0.08, label }
    }) }
  }
  return { classes: 2, points: Array.from({ length: 180 }, () => {
    const x = (rng() * 2 - 1) * 1.45
    const y = (rng() * 2 - 1) * 1.45
    return { x: x + normal(rng) * 0.05, y: y + normal(rng) * 0.05, label: x * y > 0 ? 1 : 0 }
  }) }
}

function countLabels(points: readonly LabeledPoint[], indices: readonly number[], classes: number): number[] {
  const counts = Array.from({ length: classes }, () => 0)
  for (const i of indices) counts[points[i].label] += 1
  return counts
}

function majority(counts: readonly number[]): number {
  let best = 0
  for (let i = 1; i < counts.length; i += 1) if (counts[i] > counts[best]) best = i
  return best
}

function candidatesFor(points: readonly LabeledPoint[], indices: readonly number[], classes: number, criterion: Criterion): Candidate[] {
  const out: Candidate[] = []
  for (const feature of ['x', 'y'] as const) {
    const sorted = [...indices].sort((a, b) => points[a][feature] - points[b][feature])
    for (let i = 1; i < sorted.length; i += 1) {
      const a = points[sorted[i - 1]][feature]
      const b = points[sorted[i]][feature]
      if (Math.abs(a - b) < 1e-6) continue
      const threshold = (a + b) / 2
      const left = Array.from({ length: classes }, () => 0)
      const right = Array.from({ length: classes }, () => 0)
      for (const idx of indices) (points[idx][feature] <= threshold ? left : right)[points[idx].label] += 1
      const nl = left.reduce((s, v) => s + v, 0)
      const nr = right.reduce((s, v) => s + v, 0)
      if (nl === 0 || nr === 0) continue
      out.push({ feature, threshold, impurity: (nl * impurity(left, criterion) + nr * impurity(right, criterion)) / (nl + nr) })
    }
  }
  return out
}

function buildTree(points: readonly LabeledPoint[], indices: number[], classes: number, criterion: Criterion, maxDepth: number, bounds: Bounds, depth: number, nextId: { value: number }): Node {
  const counts = countLabels(points, indices, classes)
  const nodeImpurity = impurity(counts, criterion)
  const node: Node = { id: nextId.value, depth, bounds, counts, impurity: nodeImpurity, prediction: majority(counts) }
  nextId.value += 1
  if (node.depth >= maxDepth || nodeImpurity < 1e-6 || indices.length < 8) return node
  const candidates = candidatesFor(points, indices, classes, criterion)
  const best = candidates.reduce<Candidate | undefined>((acc, c) => (!acc || c.impurity < acc.impurity ? c : acc), undefined)
  if (!best) return node
  const leftIdx = indices.filter((i) => points[i][best.feature] <= best.threshold)
  const rightIdx = indices.filter((i) => points[i][best.feature] > best.threshold)
  if (!leftIdx.length || !rightIdx.length) return node
  node.split = { feature: best.feature, threshold: best.threshold }
  const leftBounds = best.feature === 'x' ? { ...bounds, xmax: best.threshold } : { ...bounds, ymax: best.threshold }
  const rightBounds = best.feature === 'x' ? { ...bounds, xmin: best.threshold } : { ...bounds, ymin: best.threshold }
  node.left = buildTree(points, leftIdx, classes, criterion, maxDepth, leftBounds, depth + 1, nextId)
  node.right = buildTree(points, rightIdx, classes, criterion, maxDepth, rightBounds, depth + 1, nextId)
  return node
}

function leaves(node: Node): Node[] {
  if (!node.left || !node.right) return [node]
  return [...leaves(node.left), ...leaves(node.right)]
}

function predict(node: Node, p: LabeledPoint): number {
  if (!node.split || !node.left || !node.right) return node.prediction
  return predict(p[node.split.feature] <= node.split.threshold ? node.left : node.right, p)
}

function layoutTree(node: Node, x0: number, x1: number, y: number, out: { node: Node; x: number; y: number }[]): void {
  const x = (x0 + x1) / 2
  out.push({ node, x, y })
  if (node.left && node.right) {
    layoutTree(node.left, x0, x, y + 54, out)
    layoutTree(node.right, x, x1, y + 54, out)
  }
}

export default function DecisionTree() {
  const [preset, setPreset] = useState<Preset>('blobs3')
  const [criterion, setCriterion] = useState<Criterion>('gini')
  const [maxDepth, setMaxDepth] = useState(3)
  const [plotRef, plotSize] = useSize<HTMLDivElement>()
  const data = useMemo(() => makePoints(preset), [preset])
  const model = useMemo(() => {
    const rootBounds = { xmin: -DOMAIN, xmax: DOMAIN, ymin: -DOMAIN, ymax: DOMAIN }
    const indices = data.points.map((_, i) => i)
    const rootCandidates = candidatesFor(data.points, indices, data.classes, criterion)
    const root = buildTree(data.points, indices, data.classes, criterion, maxDepth, rootBounds, 0, { value: 0 })
    const leafList = leaves(root)
    const acc = data.points.reduce((s, p) => s + (predict(root, p) === p.label ? 1 : 0), 0) / data.points.length
    return { root, rootCandidates, leafList, acc }
  }, [criterion, data, maxDepth])
  const player = usePlayer(model.rootCandidates, 18)
  const current = player.step ?? model.rootCandidates[0]
  const width = Math.max(360, plotSize.width)
  const height = 350
  const sx = (x: number) => ((x + DOMAIN) / (2 * DOMAIN)) * width
  const sy = (y: number) => (1 - (y + DOMAIN) / (2 * DOMAIN)) * height
  const best = model.rootCandidates.reduce<Candidate | undefined>((acc, c) => (!acc || c.impurity < acc.impurity ? c : acc), undefined)
  const nodes: { node: Node; x: number; y: number }[] = []
  layoutTree(model.root, 24, 496, 22, nodes)
  const chartW = 300
  const chartH = 88
  const impMax = Math.max(0.01, ...model.rootCandidates.map((c) => c.impurity))
  const chartPath = model.rootCandidates.map((c, i) => {
    const x = model.rootCandidates.length <= 1 ? 0 : (i / (model.rootCandidates.length - 1)) * chartW
    const y = chartH - (c.impurity / impMax) * chartH
    return `${i === 0 ? 'M' : 'L'} ${x.toFixed(1)} ${y.toFixed(1)}`
  }).join(' ')
  const classColor = (label: number) => C.series[label % C.series.length]

  return (
    <VizFrame
      title="Decision Tree Splits"
      description="CART recursively chooses axis-aligned thresholds that minimize weighted child impurity."
      controls={
        <>
          <Select<Preset> value={preset} onChange={setPreset} options={PRESETS} />
          <Select<Criterion> value={criterion} onChange={setCriterion} options={CRITERIA} />
          <Slider label="max depth" value={maxDepth} min={1} max={4} step={1} onChange={setMaxDepth} className="w-36" />
          <PlayerControls player={player} maxSpeed={28} />
        </>
      }
      caption={`scan ${current.feature} ≤ ${fmt(current.threshold, 2)} → weighted ${criterion} ${fmt(current.impurity, 3)}; tree accuracy ${fmt(model.acc * 100, 1)}%.`}
      legend={Array.from({ length: data.classes }, (_, i) => ({ color: classColor(i), label: `class ${i}` }))}
    >
      <div className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_340px]">
        <div ref={plotRef} className="rounded-xl border border-line bg-panel p-2">
          <svg width="100%" height={height} viewBox={`0 0 ${width} ${height}`}>
            {model.leafList.map((leaf) => (
              <rect
                key={leaf.id}
                x={sx(leaf.bounds.xmin)}
                y={sy(leaf.bounds.ymax)}
                width={Math.max(0, sx(leaf.bounds.xmax) - sx(leaf.bounds.xmin))}
                height={Math.max(0, sy(leaf.bounds.ymin) - sy(leaf.bounds.ymax))}
                fill={`color-mix(in srgb, ${classColor(leaf.prediction)} 20%, var(--panel) 80%)`}
                stroke={C.line}
              />
            ))}
            {model.leafList.map((leaf) => leaf.split ? null : <rect key={`b-${leaf.id}`} x={sx(leaf.bounds.xmin)} y={sy(leaf.bounds.ymax)} width={Math.max(0, sx(leaf.bounds.xmax) - sx(leaf.bounds.xmin))} height={Math.max(0, sy(leaf.bounds.ymin) - sy(leaf.bounds.ymax))} fill="none" stroke={C.lineStrong} strokeDasharray="5 5" />)}
            {current.feature === 'x' ? <line x1={sx(current.threshold)} x2={sx(current.threshold)} y1="0" y2={height} stroke={C.accent} strokeWidth="3" strokeDasharray="8 6" /> : <line x1="0" x2={width} y1={sy(current.threshold)} y2={sy(current.threshold)} stroke={C.accent} strokeWidth="3" strokeDasharray="8 6" />}
            {best && (best.feature === 'x' ? <line x1={sx(best.threshold)} x2={sx(best.threshold)} y1="0" y2={height} stroke={C.ok} strokeWidth="2" /> : <line x1="0" x2={width} y1={sy(best.threshold)} y2={sy(best.threshold)} stroke={C.ok} strokeWidth="2" />)}
            {data.points.map((p, i) => <circle key={i} cx={sx(p.x)} cy={sy(p.y)} r="3" fill={classColor(p.label)} stroke={predict(model.root, p) === p.label ? C.panel : C.err} strokeWidth="1" opacity="0.88" />)}
          </svg>
        </div>

        <div className="space-y-4">
          <div className="rounded-xl border border-line bg-panel p-3">
            <div className="mb-2 flex justify-between text-xs"><span className="font-semibold text-fg">Root split search</span><span className="font-mono text-muted">{player.index + 1}/{player.total}</span></div>
            <svg width="100%" height="120" viewBox={`0 0 ${chartW} 120`}>
              <line x1="0" x2={chartW} y1={chartH} y2={chartH} stroke={C.lineStrong} />
              <path d={chartPath} fill="none" stroke={C.muted} strokeWidth="1.8" />
              {model.rootCandidates.map((c, i) => {
                const x = model.rootCandidates.length <= 1 ? 0 : (i / (model.rootCandidates.length - 1)) * chartW
                const y = chartH - (c.impurity / impMax) * chartH
                const active = i === player.index
                return <circle key={i} cx={x} cy={y} r={active ? 4 : 1.8} fill={active ? C.accent : c.feature === 'x' ? C.ok : C.warn} opacity={active ? 1 : 0.45} />
              })}
              <text x="4" y="112" fontSize="10" fill={C.muted}>candidate thresholds (x then y)</text>
              <text x={chartW - 4} y="112" textAnchor="end" fontSize="10" fill={C.muted}>lower is better</text>
            </svg>
          </div>

          <div className="rounded-xl border border-line bg-panel p-3">
            <div className="mb-2 text-xs font-semibold text-fg">Tree diagram</div>
            <svg width="100%" height="230" viewBox="0 0 520 230">
              {nodes.flatMap(({ node, x, y }) => [node.left, node.right].filter((child): child is Node => Boolean(child)).map((child) => {
                const target = nodes.find((n) => n.node.id === child.id)
                return target ? <line key={`${node.id}-${child.id}`} x1={x} y1={y + 16} x2={target.x} y2={target.y - 16} stroke={C.lineStrong} /> : null
              }))}
              {nodes.map(({ node, x, y }) => (
                <g key={node.id} transform={`translate(${x},${y})`}>
                  <rect x="-38" y="-16" width="76" height="32" rx="8" fill={node.split ? C.panel : `color-mix(in srgb, ${classColor(node.prediction)} 22%, var(--panel) 78%)`} stroke={node.split ? C.lineStrong : classColor(node.prediction)} />
                  <text y="-3" textAnchor="middle" fontSize="9" fill={C.fg}>{node.split ? `${node.split.feature}≤${fmt(node.split.threshold, 1)}` : `class ${node.prediction}`}</text>
                  <text y="10" textAnchor="middle" fontSize="8" fill={C.muted}>n={node.counts.reduce((s, v) => s + v, 0)} i={fmt(node.impurity, 2)}</text>
                </g>
              ))}
            </svg>
          </div>
        </div>

        <div className="xl:col-span-2 grid gap-3 text-xs md:grid-cols-4">
          <div className="rounded-lg border border-line bg-panel p-3"><div className="text-muted">Accuracy</div><div className="mt-1 font-mono text-lg text-fg">{fmt(model.acc * 100, 1)}%</div></div>
          <div className="rounded-lg border border-line bg-panel p-3"><div className="text-muted">Leaves</div><div className="mt-1 font-mono text-lg text-fg">{model.leafList.length}</div></div>
          <div className="rounded-lg border border-line bg-panel p-3"><div className="text-muted">Best root split</div><div className="mt-1 font-mono text-sm text-fg">{best ? `${best.feature}≤${fmt(best.threshold, 2)}` : '—'}</div></div>
          <div className="rounded-lg border border-line bg-panel p-3"><div className="text-muted">Insight</div><div className="mt-1 text-fg">Depth lowers bias but tiny leaves memorize noise; compare partitions with accuracy.</div></div>
        </div>
      </div>
    </VizFrame>
  )
}
