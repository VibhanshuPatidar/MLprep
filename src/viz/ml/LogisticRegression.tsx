import { useMemo, useState, type MouseEvent } from 'react'
import { Badge, Button, Segmented, Select, Slider, Switch } from '../../components/ui'
import { C, VizFrame, mulberry32, randn, useAnimationFrame, useSize } from '../common'
import { clamp, formatNum, sigmoid, type LabeledPoint, type Point2 } from './_math1'

type Preset = 'separable' | 'overlap' | 'xor'

interface ModelState {
  w: number[]
  iter: number
  loss: number
  acc: number
}

const PRESETS: { value: Preset; label: string }[] = [
  { value: 'separable', label: 'Linearly separable' },
  { value: 'overlap', label: 'Overlapping' },
  { value: 'xor', label: 'XOR' },
]

function makePreset(kind: Preset): LabeledPoint[] {
  const rng = mulberry32(kind === 'separable' ? 4 : kind === 'overlap' ? 9 : 15)
  if (kind === 'xor') {
    const centers = [
      { x: -1.7, y: -1.7, label: 0 },
      { x: 1.7, y: 1.7, label: 0 },
      { x: -1.7, y: 1.7, label: 1 },
      { x: 1.7, y: -1.7, label: 1 },
    ]
    return centers.flatMap((c) => Array.from({ length: 12 }, () => ({ x: c.x + 0.38 * randn(rng), y: c.y + 0.38 * randn(rng), label: c.label })))
  }
  const spread = kind === 'separable' ? 0.55 : 1.05
  const offset = kind === 'separable' ? 1.45 : 0.85
  return [0, 1].flatMap((label) => Array.from({ length: 26 }, () => ({ x: (label ? offset : -offset) + spread * randn(rng), y: (label ? offset : -offset) + spread * randn(rng), label })))
}

function features(p: Point2, poly: boolean): number[] {
  const x = p.x / 3
  const y = p.y / 3
  return poly ? [1, x, y, x * y, x * x, y * y] : [1, x, y]
}

function evaluate(points: readonly LabeledPoint[], w: readonly number[], poly: boolean, l2: number): { loss: number; acc: number } {
  if (points.length === 0) return { loss: 0, acc: 0 }
  let loss = 0
  let correct = 0
  for (const p of points) {
    const z = features(p, poly).reduce((s, f, i) => s + f * w[i], 0)
    const pr = clamp(sigmoid(z), 1e-6, 1 - 1e-6)
    loss += -(p.label * Math.log(pr) + (1 - p.label) * Math.log(1 - pr))
    if ((pr >= 0.5 ? 1 : 0) === p.label) correct += 1
  }
  const penalty = 0.5 * l2 * w.slice(1).reduce((s, v) => s + v * v, 0)
  return { loss: loss / points.length + penalty, acc: correct / points.length }
}

function stepModel(model: ModelState, points: readonly LabeledPoint[], lr: number, l2: number, poly: boolean): ModelState {
  const dim = poly ? 6 : 3
  const grad = Array.from({ length: dim }, () => 0)
  for (const p of points) {
    const f = features(p, poly)
    const pr = sigmoid(f.reduce((s, v, i) => s + v * model.w[i], 0))
    for (let i = 0; i < dim; i += 1) grad[i] += (pr - p.label) * f[i]
  }
  const n = Math.max(1, points.length)
  const w = model.w.map((wi, i) => wi - lr * (grad[i] / n + (i === 0 ? 0 : l2 * wi)))
  const metrics = evaluate(points, w, poly, l2)
  return { w, iter: model.iter + 1, ...metrics }
}

function boundaryPath(w: readonly number[], poly: boolean, sx: (x: number) => number, sy: (y: number) => number): string {
  const grid = 45
  const pts: string[] = []
  const prob = (x: number, y: number) => sigmoid(features({ x, y }, poly).reduce((s, f, i) => s + f * w[i], 0)) - 0.5
  for (let gy = 0; gy < grid; gy += 1) {
    for (let gx = 0; gx < grid; gx += 1) {
      const x0 = -3 + (gx / grid) * 6
      const x1 = -3 + ((gx + 1) / grid) * 6
      const y0 = -3 + (gy / grid) * 6
      const y1 = -3 + ((gy + 1) / grid) * 6
      const corners = [
        { v: prob(x0, y0), p: { x: x0, y: y0 } },
        { v: prob(x1, y0), p: { x: x1, y: y0 } },
        { v: prob(x1, y1), p: { x: x1, y: y1 } },
        { v: prob(x0, y1), p: { x: x0, y: y1 } },
      ]
      const hits: Point2[] = []
      for (let i = 0; i < 4; i += 1) {
        const a = corners[i]
        const b = corners[(i + 1) % 4]
        if ((a.v <= 0 && b.v > 0) || (b.v <= 0 && a.v > 0)) {
          const t = -a.v / (b.v - a.v)
          hits.push({ x: a.p.x + (b.p.x - a.p.x) * t, y: a.p.y + (b.p.y - a.p.y) * t })
        }
      }
      if (hits.length >= 2) pts.push(`M ${sx(hits[0].x).toFixed(1)} ${sy(hits[0].y).toFixed(1)} L ${sx(hits[1].x).toFixed(1)} ${sy(hits[1].y).toFixed(1)}`)
    }
  }
  return pts.join(' ')
}

function initialModel(poly: boolean, points: readonly LabeledPoint[], l2: number): ModelState {
  const w = Array.from({ length: poly ? 6 : 3 }, () => 0)
  return { w, iter: 0, ...evaluate(points, w, poly, l2) }
}

export default function LogisticRegression() {
  const [preset, setPreset] = useState<Preset>('separable')
  const [points, setPoints] = useState<LabeledPoint[]>(() => makePreset('separable'))
  const [activeClass, setActiveClass] = useState<0 | 1>(1)
  const [poly, setPoly] = useState(false)
  const [lr, setLr] = useState(0.35)
  const [logL2, setLogL2] = useState(-3)
  const [playing, setPlaying] = useState(false)
  const [wrapRef, size] = useSize<HTMLDivElement>()
  const l2 = logL2 <= -5.9 ? 0 : 10 ** logL2
  const [model, setModel] = useState<ModelState>(() => initialModel(false, makePreset('separable'), l2))
  const dim = poly ? 6 : 3
  const w = Math.max(320, size.width)
  const plotW = w >= 760 ? w - 238 : w
  const h = 382
  const sx = (x: number) => 26 + ((x + 3) / 6) * (plotW - 52)
  const sy = (y: number) => 18 + (1 - (y + 3) / 6) * (h - 44)
  const boundary = useMemo(() => boundaryPath(model.w, poly, sx, sy), [model.w, plotW, poly])
  const gridCells = useMemo(() => {
    const n = 34
    return Array.from({ length: n * n }, (_, idx) => {
      const gx = idx % n
      const gy = Math.floor(idx / n)
      const x = -3 + ((gx + 0.5) / n) * 6
      const y = -3 + ((gy + 0.5) / n) * 6
      const p = sigmoid(features({ x, y }, poly).reduce((s, f, i) => s + f * model.w[i], 0))
      return { gx, gy, n, p }
    })
  }, [model.w, poly])

  useAnimationFrame(() => {
    setModel((m) => {
      let next = m
      for (let i = 0; i < 3; i += 1) next = stepModel(next, points, lr, l2, poly)
      return next
    })
  }, playing && points.length > 0)

  const reset = (newPoints = points, newPoly = poly, nextL2 = l2) => {
    setPlaying(false)
    setModel(initialModel(newPoly, newPoints, nextL2))
  }
  const setPresetData = (value: Preset) => {
    const data = makePreset(value)
    setPreset(value)
    setPoints(data)
    setPlaying(false)
    setModel(initialModel(poly, data, l2))
  }
  const togglePoly = (value: boolean) => {
    setPoly(value)
    reset(points, value)
  }
  const addPoint = (event: MouseEvent<SVGSVGElement>) => {
    const rect = event.currentTarget.getBoundingClientRect()
    const x = -3 + ((event.clientX - rect.left) / rect.width) * 6
    const y = 3 - ((event.clientY - rect.top) / rect.height) * 6
    const label = event.shiftKey ? ((1 - activeClass) as 0 | 1) : activeClass
    const next = [...points, { x: clamp(x, -3, 3), y: clamp(y, -3, 3), label }]
    setPoints(next)
    reset(next, poly)
  }
  const classes = [points.filter((p) => p.label === 0).length, points.filter((p) => p.label === 1).length]
  const weightsLabel = model.w.map((v, i) => `w${i}=${formatNum(v, 2)}`).join('  ')
  const xorMessage = preset === 'xor' && !poly ? 'Linear features cannot separate XOR: add x·y and squared terms.' : preset === 'xor' ? 'Polynomial features bend the boundary and solve XOR.' : 'The boundary is linear unless polynomial features are enabled.'

  return (
    <VizFrame
      title="Logistic Regression"
      description="Train a 2-D classifier with gradient descent; click to add points, Shift-click for the other class."
      controls={
        <>
          <Select value={preset} onChange={setPresetData} options={PRESETS} />
          <Segmented options={[{ value: 0, label: 'class 0' }, { value: 1, label: 'class 1' }]} value={activeClass} onChange={(v) => setActiveClass(v as 0 | 1)} />
          <Button size="sm" variant={playing ? 'secondary' : 'primary'} onClick={() => setPlaying((p) => !p)}>{playing ? 'Pause' : 'Train'}</Button>
          <Button size="sm" variant="outline" onClick={() => reset()}>Reset weights</Button>
          <Slider className="w-32" label="lr" min={0.02} max={1} step={0.01} value={lr} onChange={setLr} format={(v) => formatNum(v, 2)} />
          <Slider className="w-40" label="L2" min={-6} max={0} step={0.1} value={logL2} onChange={(v) => { setLogL2(v); reset(points, poly, v <= -5.9 ? 0 : 10 ** v) }} format={(v) => (v <= -5.9 ? '0' : formatNum(10 ** v, 3))} />
          <Switch checked={poly} onChange={togglePoly} label={<span className="text-xs">polynomial features</span>} />
        </>
      }
      caption={<div><div>iter={model.iter}, loss={formatNum(model.loss, 4)}, accuracy={(100 * model.acc).toFixed(1)}%, weights: {weightsLabel}</div><div className="text-accent">Insight: {xorMessage}</div></div>}
      legend={[{ color: C.series[2], label: `class 0 (${classes[0]})` }, { color: C.series[1], label: `class 1 (${classes[1]})` }, { color: C.accent, label: 'p=0.5 boundary' }]}
    >
      <div ref={wrapRef} className="grid gap-3 lg:grid-cols-[1fr_220px]">
        <div className="rounded-xl border border-line bg-panel p-3">
          <svg viewBox={`0 0 ${plotW} ${h}`} onClick={addPoint} className="h-[390px] w-full cursor-crosshair overflow-visible">
            {gridCells.map((cell) => {
              const cw = (plotW - 52) / cell.n
              const ch = (h - 44) / cell.n
              const fill = cell.p >= 0.5 ? C.series[1] : C.series[2]
              const opacity = 0.07 + 0.16 * Math.abs(cell.p - 0.5) * 2
              return <rect key={`${cell.gx}-${cell.gy}`} x={26 + cell.gx * cw} y={18 + (cell.n - 1 - cell.gy) * ch} width={cw + 0.3} height={ch + 0.3} fill={fill} opacity={opacity} />
            })}
            <line x1={sx(-3)} x2={sx(3)} y1={sy(0)} y2={sy(0)} stroke={C.line} />
            <line x1={sx(0)} x2={sx(0)} y1={sy(-3)} y2={sy(3)} stroke={C.line} />
            <path d={boundary} fill="none" stroke={C.accent} strokeWidth="3" strokeLinecap="round" />
            {points.map((p, i) => <circle key={i} cx={sx(p.x)} cy={sy(p.y)} r="5" fill={p.label === 1 ? C.series[1] : C.series[2]} stroke={C.panel} strokeWidth="1.5" />)}
          </svg>
        </div>
        <div className="grid gap-3 text-xs">
          <div className="rounded-xl border border-line bg-panel p-3">
            <div className="mb-2 flex items-center justify-between"><span className="text-muted">Metrics</span><Badge tone={model.acc > 0.9 ? 'ok' : model.acc > 0.7 ? 'warn' : 'err'}>{(model.acc * 100).toFixed(0)}% acc</Badge></div>
            <div className="grid gap-2">
              <div className="rounded-lg bg-subtle p-2"><div className="text-muted">Cross-entropy loss</div><div className="font-mono text-fg">{formatNum(model.loss, 4)}</div></div>
              <div className="rounded-lg bg-subtle p-2"><div className="text-muted">Feature dimension</div><div className="font-mono text-fg">{dim}</div></div>
              <div className="rounded-lg bg-subtle p-2"><div className="text-muted">Decision formula</div><div className="font-mono text-fg">σ(w·x)</div></div>
            </div>
          </div>
          <div className="rounded-xl border border-line bg-panel p-3">
            <div className="text-muted">Weights</div>
            <div className="mt-2 space-y-1 font-mono text-[11px] text-fg">
              {model.w.map((value, i) => <div key={i}>w{i}: {formatNum(value, 3)}</div>)}
            </div>
          </div>
        </div>
      </div>
    </VizFrame>
  )
}
