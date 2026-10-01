import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { Button, Select, Slider, cn } from '../../components/ui'
import { C, VizFrame, cssVar, useAnimationFrame, useSize, useThemeVersion } from '../common'
import { LabeledPoint, clamp, fmt, normal, seeded, sigmoid, withAlpha } from './_math2'

type DatasetKind = 'circle' | 'xor' | 'spirals' | 'blobs'
type ActivationKind = 'tanh' | 'relu' | 'sigmoid'

type Layer = { inSize: number; outSize: number; w: Float32Array; b: Float32Array; gw: Float32Array; gb: Float32Array }
type Net = { layers: Layer[]; act: ActivationKind; epoch: number; cursor: number; seed: number }
type DataSplit = { train: LabeledPoint[]; test: LabeledPoint[] }
type Metrics = { trainLoss: number; testLoss: number; trainAcc: number; testAcc: number; epoch: number }

const DOMAIN = 1.6
const DATASET_OPTIONS: { value: DatasetKind; label: string }[] = [
  { value: 'circle', label: 'Circle' },
  { value: 'xor', label: 'XOR' },
  { value: 'spirals', label: 'Two spirals' },
  { value: 'blobs', label: 'Gaussian blobs' },
]
const ACT_OPTIONS: { value: ActivationKind; label: string }[] = [
  { value: 'tanh', label: 'tanh' },
  { value: 'relu', label: 'ReLU' },
  { value: 'sigmoid', label: 'sigmoid' },
]

function activation(kind: ActivationKind, x: number): number {
  if (kind === 'relu') return Math.max(0, x)
  if (kind === 'sigmoid') return sigmoid(x)
  return Math.tanh(x)
}

function activationDerivative(kind: ActivationKind, z: number, a: number): number {
  if (kind === 'relu') return z > 0 ? 1 : 0
  if (kind === 'sigmoid') return a * (1 - a)
  return 1 - a * a
}

function makePoint(kind: DatasetKind, rng: () => number, i: number, n: number): LabeledPoint {
  if (kind === 'spirals') {
    const label = i < n / 2 ? 0 : 1
    const t = 0.45 + rng() * Math.PI * 2.2
    const r = (t / (Math.PI * 2.65)) * 1.45
    const angle = t + label * Math.PI
    return { x: r * Math.cos(angle) + normal(rng) * 0.1, y: r * Math.sin(angle) + normal(rng) * 0.1, label }
  }
  if (kind === 'circle') {
    const angle = rng() * Math.PI * 2
    const r = Math.sqrt(rng()) * 1.45
    const x = r * Math.cos(angle) + normal(rng) * 0.035
    const y = r * Math.sin(angle) + normal(rng) * 0.035
    return { x, y, label: r < 0.78 ? 1 : 0 }
  }
  if (kind === 'xor') {
    const x = (rng() * 2 - 1) * 1.45
    const y = (rng() * 2 - 1) * 1.45
    return { x: x + normal(rng) * 0.045, y: y + normal(rng) * 0.045, label: x * y > 0 ? 1 : 0 }
  }
  const label = i % 2
  const cx = label ? 0.72 : -0.72
  const cy = label ? -0.45 : 0.45
  return { x: cx + normal(rng) * 0.35, y: cy + normal(rng) * 0.35, label }
}

function makeData(kind: DatasetKind): DataSplit {
  const trainRng = seeded(1000 + kind.length * 37)
  const testRng = seeded(5000 + kind.length * 53)
  return {
    train: Array.from({ length: 240 }, (_, i) => makePoint(kind, trainRng, i, 240)),
    test: Array.from({ length: 120 }, (_, i) => makePoint(kind, testRng, i, 120)),
  }
}

function makeNet(hiddenLayers: number, neurons: number, act: ActivationKind, seedValue: number): Net {
  const dims = [2, ...Array.from({ length: hiddenLayers }, () => neurons), 1]
  const rng = seeded(seedValue)
  const layers: Layer[] = []
  for (let l = 0; l < dims.length - 1; l += 1) {
    const inSize = dims[l]
    const outSize = dims[l + 1]
    const scale = Math.sqrt(2 / (inSize + outSize))
    const w = new Float32Array(inSize * outSize)
    for (let i = 0; i < w.length; i += 1) w[i] = normal(rng) * scale
    layers.push({ inSize, outSize, w, b: new Float32Array(outSize), gw: new Float32Array(w.length), gb: new Float32Array(outSize) })
  }
  return { layers, act, epoch: 0, cursor: 0, seed: seedValue }
}

function predictWithBuffers(net: Net, x: number, y: number, a: Float32Array, b: Float32Array): number {
  let prev = a
  let next = b
  prev[0] = x
  prev[1] = y
  let prevSize = 2
  for (let li = 0; li < net.layers.length; li += 1) {
    const layer = net.layers[li]
    const isOut = li === net.layers.length - 1
    for (let o = 0; o < layer.outSize; o += 1) {
      let z = layer.b[o]
      const off = o * layer.inSize
      for (let j = 0; j < prevSize; j += 1) z += layer.w[off + j] * prev[j]
      next[o] = isOut ? sigmoid(z) : activation(net.act, z)
    }
    const tmp = prev
    prev = next
    next = tmp
    prevSize = layer.outSize
  }
  return prev[0]
}

function evaluate(net: Net, data: readonly LabeledPoint[]): { loss: number; acc: number } {
  const a = new Float32Array(16)
  const b = new Float32Array(16)
  let loss = 0
  let correct = 0
  for (const p of data) {
    const yhat = clamp(predictWithBuffers(net, p.x, p.y, a, b), 1e-5, 1 - 1e-5)
    loss += -(p.label * Math.log(yhat) + (1 - p.label) * Math.log(1 - yhat))
    if ((yhat >= 0.5 ? 1 : 0) === p.label) correct += 1
  }
  return { loss: loss / data.length, acc: correct / data.length }
}

function trainBatch(net: Net, points: readonly LabeledPoint[], batchSize: number, lr: number, l2: number): void {
  const maxWidth = Math.max(8, ...net.layers.map((l) => l.outSize), 2)
  const acts = [new Float32Array(maxWidth), ...net.layers.map((l) => new Float32Array(Math.max(maxWidth, l.outSize)))]
  const zs = net.layers.map((l) => new Float32Array(l.outSize))
  const deltas = net.layers.map((l) => new Float32Array(l.outSize))
  for (const layer of net.layers) {
    layer.gw.fill(0)
    layer.gb.fill(0)
  }
  for (let b = 0; b < batchSize; b += 1) {
    const idx = (net.cursor + b) % points.length
    const point = points[idx]
    acts[0][0] = point.x
    acts[0][1] = point.y
    for (let li = 0; li < net.layers.length; li += 1) {
      const layer = net.layers[li]
      const prev = acts[li]
      const cur = acts[li + 1]
      const isOut = li === net.layers.length - 1
      for (let o = 0; o < layer.outSize; o += 1) {
        let z = layer.b[o]
        const off = o * layer.inSize
        for (let j = 0; j < layer.inSize; j += 1) z += layer.w[off + j] * prev[j]
        zs[li][o] = z
        cur[o] = isOut ? sigmoid(z) : activation(net.act, z)
      }
    }
    const last = net.layers.length - 1
    deltas[last][0] = acts[last + 1][0] - point.label
    for (let li = last - 1; li >= 0; li -= 1) {
      const layer = net.layers[li]
      const nextLayer = net.layers[li + 1]
      for (let j = 0; j < layer.outSize; j += 1) {
        let sum = 0
        for (let o = 0; o < nextLayer.outSize; o += 1) sum += nextLayer.w[o * nextLayer.inSize + j] * deltas[li + 1][o]
        deltas[li][j] = sum * activationDerivative(net.act, zs[li][j], acts[li + 1][j])
      }
    }
    for (let li = 0; li < net.layers.length; li += 1) {
      const layer = net.layers[li]
      const prev = acts[li]
      for (let o = 0; o < layer.outSize; o += 1) {
        const d = deltas[li][o]
        layer.gb[o] += d
        const off = o * layer.inSize
        for (let j = 0; j < layer.inSize; j += 1) layer.gw[off + j] += d * prev[j]
      }
    }
  }
  const inv = 1 / batchSize
  for (const layer of net.layers) {
    for (let i = 0; i < layer.w.length; i += 1) layer.w[i] -= lr * (layer.gw[i] * inv + l2 * layer.w[i])
    for (let i = 0; i < layer.b.length; i += 1) layer.b[i] -= lr * layer.gb[i] * inv
  }
  const oldCursor = net.cursor
  net.cursor = (net.cursor + batchSize) % points.length
  if (net.cursor <= oldCursor) net.epoch += 1
}

function metricsFor(net: Net, split: DataSplit): Metrics {
  const train = evaluate(net, split.train)
  const test = evaluate(net, split.test)
  return { trainLoss: train.loss, testLoss: test.loss, trainAcc: train.acc, testAcc: test.acc, epoch: net.epoch }
}

export default function NnPlayground() {
  const [dataset, setDataset] = useState<DatasetKind>('circle')
  const [hiddenLayers, setHiddenLayers] = useState(2)
  const [neurons, setNeurons] = useState(5)
  const [act, setAct] = useState<ActivationKind>('tanh')
  const [lr, setLr] = useState(0.08)
  const [l2, setL2] = useState(0.001)
  const [batchSize, setBatchSize] = useState(32)
  const [running, setRunning] = useState(false)
  const [version, setVersion] = useState(0)
  const [metrics, setMetrics] = useState<Metrics>({ trainLoss: 0, testLoss: 0, trainAcc: 0, testAcc: 0, epoch: 0 })
  const [history, setHistory] = useState<Metrics[]>([])
  const split = useMemo(() => makeData(dataset), [dataset])
  const netRef = useRef<Net>(makeNet(hiddenLayers, neurons, act, 42))
  const canvasRef = useRef<HTMLCanvasElement | null>(null)
  const [canvasWrapRef, canvasSize] = useSize<HTMLDivElement>()
  const themeVersion = useThemeVersion()

  const reset = useCallback(() => {
    const seedValue = 700 + hiddenLayers * 101 + neurons * 17 + act.length * 23 + dataset.length * 31
    const net = makeNet(hiddenLayers, neurons, act, seedValue)
    netRef.current = net
    const nextMetrics = metricsFor(net, split)
    setMetrics(nextMetrics)
    setHistory([nextMetrics])
    setVersion((v) => v + 1)
    setRunning(false)
  }, [act, dataset, hiddenLayers, neurons, split])

  useEffect(() => {
    reset()
  }, [reset])

  const record = useCallback(() => {
    const nextMetrics = metricsFor(netRef.current, split)
    setMetrics(nextMetrics)
    setHistory((old) => [...old.slice(-79), nextMetrics])
    setVersion((v) => v + 1)
  }, [split])

  const step = useCallback((batches = 1) => {
    for (let i = 0; i < batches; i += 1) trainBatch(netRef.current, split.train, batchSize, lr, l2)
    record()
  }, [batchSize, l2, lr, record, split.train])

  useAnimationFrame((dt) => {
    const batches = Math.max(1, Math.min(12, Math.round(dt / 12)))
    step(batches)
  }, running)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const cssW = Math.max(320, canvasSize.width)
    const cssH = 320
    const dpr = window.devicePixelRatio || 1
    canvas.width = Math.round(cssW * dpr)
    canvas.height = Math.round(cssH * dpr)
    canvas.style.width = `${cssW}px`
    canvas.style.height = `${cssH}px`
    const ctx = canvas.getContext('2d')
    if (!ctx) return
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
    const panel = cssVar('--panel')
    const line = cssVar('--line')
    const fg = cssVar('--fg')
    const c0 = cssVar('--viz-2')
    const c1 = cssVar('--viz-3')
    ctx.fillStyle = panel
    ctx.fillRect(0, 0, cssW, cssH)
    const res = 96
    const a = new Float32Array(16)
    const b = new Float32Array(16)
    for (let gy = 0; gy < res; gy += 1) {
      for (let gx = 0; gx < res; gx += 1) {
        const x = (gx / (res - 1)) * DOMAIN * 2 - DOMAIN
        const y = DOMAIN - (gy / (res - 1)) * DOMAIN * 2
        const p = predictWithBuffers(netRef.current, x, y, a, b)
        ctx.fillStyle = withAlpha(p >= 0.5 ? c1 : c0, 0.13 + Math.abs(p - 0.5) * 0.62)
        ctx.fillRect((gx * cssW) / res, (gy * cssH) / res, cssW / res + 1, cssH / res + 1)
      }
    }
    ctx.strokeStyle = line
    ctx.lineWidth = 1
    for (let i = 0; i <= 4; i += 1) {
      const x = (i / 4) * cssW
      const y = (i / 4) * cssH
      ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, cssH); ctx.stroke()
      ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(cssW, y); ctx.stroke()
    }
    const drawPoint = (p: LabeledPoint, test: boolean) => {
      const x = ((p.x + DOMAIN) / (DOMAIN * 2)) * cssW
      const y = ((DOMAIN - p.y) / (DOMAIN * 2)) * cssH
      ctx.beginPath()
      ctx.arc(x, y, test ? 2.2 : 3.2, 0, Math.PI * 2)
      ctx.fillStyle = p.label ? c1 : c0
      ctx.fill()
      ctx.strokeStyle = withAlpha(fg, test ? 0.25 : 0.55)
      ctx.lineWidth = test ? 0.5 : 1
      ctx.stroke()
    }
    split.test.forEach((p) => drawPoint(p, true))
    split.train.forEach((p) => drawPoint(p, false))
  }, [canvasSize.width, split, themeVersion, version])

  const net = netRef.current
  const layers = [2, ...net.layers.map((l) => l.outSize)]
  const chartW = 310
  const chartH = 92
  const lossMax = Math.max(0.1, ...history.map((h) => Math.max(h.trainLoss, h.testLoss)))
  const chartPath = (key: 'trainLoss' | 'testLoss') => history.map((h, i) => {
    const x = history.length <= 1 ? 0 : (i / (history.length - 1)) * chartW
    const y = chartH - (h[key] / lossMax) * chartH
    return `${i === 0 ? 'M' : 'L'} ${x.toFixed(1)} ${y.toFixed(1)}`
  }).join(' ')

  return (
    <VizFrame
      title="Neural Network Playground"
      description="A tiny MLP trains live in the browser with manual backpropagation and a reduced-resolution decision-boundary canvas."
      controls={
        <>
          <Select<DatasetKind> value={dataset} onChange={setDataset} options={DATASET_OPTIONS} />
          <Select<ActivationKind> value={act} onChange={setAct} options={ACT_OPTIONS} />
          <Slider label="Layers" value={hiddenLayers} min={0} max={3} step={1} onChange={setHiddenLayers} className="w-28" />
          <Slider label="Neurons" value={neurons} min={1} max={8} step={1} onChange={setNeurons} className="w-28" />
          <Slider label="LR" value={lr} min={0.005} max={0.35} step={0.005} onChange={setLr} format={(v) => fmt(v, 3)} className="w-32" />
          <Slider label="L2" value={l2} min={0} max={0.02} step={0.0005} onChange={setL2} format={(v) => fmt(v, 4)} className="w-32" />
          <Slider label="Batch" value={batchSize} min={4} max={64} step={4} onChange={setBatchSize} className="w-28" />
          <Button size="sm" variant={running ? 'outline' : 'primary'} onClick={() => setRunning((r) => !r)}>{running ? 'Pause' : 'Play'}</Button>
          <Button size="sm" variant="secondary" onClick={() => step(1)}>Step</Button>
          <Button size="sm" variant="ghost" onClick={reset}>Reset</Button>
        </>
      }
      caption={`epoch ${metrics.epoch} · train loss ${fmt(metrics.trainLoss, 3)} · test loss ${fmt(metrics.testLoss, 3)} · test acc ${fmt(metrics.testAcc * 100, 1)}%`}
      legend={[
        { color: C.series[1], label: 'class 0' },
        { color: C.ok, label: 'class 1' },
        { color: C.accent, label: 'positive weight' },
        { color: C.warn, label: 'negative weight' },
      ]}
    >
      <div className="grid gap-4 xl:grid-cols-[minmax(320px,1fr)_360px]">
        <div ref={canvasWrapRef} className="overflow-hidden rounded-xl border border-line bg-panel p-2">
          <canvas ref={canvasRef} className="block rounded-lg" aria-label="Decision boundary" />
        </div>

        <div className="space-y-4">
          <div className="rounded-xl border border-line bg-panel p-3">
            <div className="mb-2 flex items-center justify-between text-xs">
              <span className="font-semibold text-fg">Network weights</span>
              <span className="font-mono text-muted">seed {net.seed}</span>
            </div>
            <svg width="100%" height="190" viewBox="0 0 340 190">
              {net.layers.map((layer, li) => {
                const x1 = 30 + (li / Math.max(1, layers.length - 1)) * 280
                const x2 = 30 + ((li + 1) / Math.max(1, layers.length - 1)) * 280
                return Array.from({ length: layer.outSize }, (_, o) => Array.from({ length: layer.inSize }, (_, j) => {
                  const y1 = 20 + ((j + 0.5) / layers[li]) * 150
                  const y2 = 20 + ((o + 0.5) / layers[li + 1]) * 150
                  const w = layer.w[o * layer.inSize + j]
                  return <line key={`${li}-${o}-${j}`} x1={x1} y1={y1} x2={x2} y2={y2} stroke={w >= 0 ? C.accent : C.warn} strokeWidth={0.5 + Math.min(5, Math.abs(w) * 2.2)} opacity={0.2 + Math.min(0.65, Math.abs(w) * 0.35)} />
                }))
              })}
              {layers.map((count, li) => {
                const x = 30 + (li / Math.max(1, layers.length - 1)) * 280
                return Array.from({ length: count }, (_, j) => {
                  const y = 20 + ((j + 0.5) / count) * 150
                  return <circle key={`${li}-${j}`} cx={x} cy={y} r={li === 0 ? 7 : 8} fill={li === layers.length - 1 ? C.ok : C.panel} stroke={C.lineStrong} strokeWidth="1.4" />
                })
              })}
              {layers.map((count, li) => (
                <text key={`label-${li}`} x={30 + (li / Math.max(1, layers.length - 1)) * 280} y="184" textAnchor="middle" fontSize="10" fill={C.muted}>{li === 0 ? 'input' : li === layers.length - 1 ? 'sigmoid' : `${count} ${act}`}</text>
              ))}
            </svg>
          </div>

          <div className="rounded-xl border border-line bg-panel p-3">
            <div className="mb-2 text-xs font-semibold text-fg">Loss history</div>
            <svg width="100%" height="120" viewBox={`0 0 ${chartW} 120`}>
              <line x1="0" x2={chartW} y1={chartH} y2={chartH} stroke={C.lineStrong} />
              <line x1="0" x2="0" y1="0" y2={chartH} stroke={C.lineStrong} />
              <path d={chartPath('trainLoss')} fill="none" stroke={C.accent} strokeWidth="2.2" />
              <path d={chartPath('testLoss')} fill="none" stroke={C.warn} strokeWidth="2.2" />
              <text x="4" y="112" fontSize="10" fill={C.muted}>train/test BCE</text>
              <text x={chartW - 4} y="112" textAnchor="end" fontSize="10" fill={C.muted}>max {fmt(lossMax, 2)}</text>
            </svg>
          </div>
        </div>

        <div className="xl:col-span-2 grid gap-3 text-xs md:grid-cols-5">
          {[
            ['Epoch', String(metrics.epoch)],
            ['Train loss', fmt(metrics.trainLoss, 3)],
            ['Test loss', fmt(metrics.testLoss, 3)],
            ['Train acc', `${fmt(metrics.trainAcc * 100, 1)}%`],
            ['Test acc', `${fmt(metrics.testAcc * 100, 1)}%`],
          ].map(([label, value]) => (
            <div key={label} className="rounded-lg border border-line bg-panel p-3">
              <div className="text-muted">{label}</div>
              <div className={cn('mt-1 font-mono text-lg text-fg', label.includes('acc') && metrics.testAcc > 0.9 && 'text-ok')}>{value}</div>
            </div>
          ))}
          <div className="rounded-lg border border-line bg-panel p-3 md:col-span-5">
            <span className="font-semibold text-fg">Insight: </span>
            <span className="text-muted">More hidden layers bend the decision boundary, but test loss reveals when extra capacity starts memorizing noise.</span>
          </div>
        </div>
      </div>
    </VizFrame>
  )
}
