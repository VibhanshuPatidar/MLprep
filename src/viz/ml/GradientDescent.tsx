import { useEffect, useMemo, useRef, useState, type MouseEvent } from 'react'
import { Badge, Select, Slider, Switch } from '../../components/ui'
import { C, PlayerControls, VizFrame, cssVar, usePlayer, useSize, useThemeVersion } from '../common'
import { chartPath, clamp, formatNum, type Point2 } from './_math1'

type LossKind = 'bowl' | 'ellipse' | 'rosenbrock' | 'saddle' | 'himmelblau'
type OptimizerId = 'sgd' | 'momentum' | 'rmsprop' | 'adam'

interface LossSpec {
  id: LossKind
  label: string
  domain: { x0: number; x1: number; y0: number; y1: number }
  start: Point2
  lrScale: number
  f: (p: Point2) => number
  g: (p: Point2) => Point2
}

interface RunTrace {
  id: OptimizerId
  label: string
  color: string
  points: Point2[]
  losses: number[]
}

const LOSSES: Record<LossKind, LossSpec> = {
  bowl: {
    id: 'bowl',
    label: 'Convex bowl',
    domain: { x0: -4, x1: 4, y0: -4, y1: 4 },
    start: { x: -3, y: 3 },
    lrScale: 1,
    f: ({ x, y }) => 0.5 * (x * x + y * y),
    g: ({ x, y }) => ({ x, y }),
  },
  ellipse: {
    id: 'ellipse',
    label: 'Ill-conditioned ellipse',
    domain: { x0: -4, x1: 4, y0: -4, y1: 4 },
    start: { x: -3.4, y: 2.8 },
    lrScale: 0.55,
    f: ({ x, y }) => 0.08 * x * x + 1.4 * y * y + 0.28 * x * y,
    g: ({ x, y }) => ({ x: 0.16 * x + 0.28 * y, y: 2.8 * y + 0.28 * x }),
  },
  rosenbrock: {
    id: 'rosenbrock',
    label: 'Rosenbrock valley',
    domain: { x0: -2.2, x1: 2.2, y0: -1, y1: 3.2 },
    start: { x: -1.5, y: 2.2 },
    lrScale: 0.0025,
    f: ({ x, y }) => (1 - x) ** 2 + 100 * (y - x * x) ** 2,
    g: ({ x, y }) => ({ x: -2 * (1 - x) - 400 * x * (y - x * x), y: 200 * (y - x * x) }),
  },
  saddle: {
    id: 'saddle',
    label: 'Saddle',
    domain: { x0: -3.5, x1: 3.5, y0: -3.5, y1: 3.5 },
    start: { x: -2.2, y: 0.7 },
    lrScale: 0.28,
    f: ({ x, y }) => x * x - y * y,
    g: ({ x, y }) => ({ x: 2 * x, y: -2 * y }),
  },
  himmelblau: {
    id: 'himmelblau',
    label: 'Himmelblau multi-minima',
    domain: { x0: -6, x1: 6, y0: -6, y1: 6 },
    start: { x: -4.6, y: 4.2 },
    lrScale: 0.006,
    f: ({ x, y }) => (x * x + y - 11) ** 2 + (x + y * y - 7) ** 2,
    g: ({ x, y }) => ({ x: 4 * x * (x * x + y - 11) + 2 * (x + y * y - 7), y: 2 * (x * x + y - 11) + 4 * y * (x + y * y - 7) }),
  },
}

const OPTS: { id: OptimizerId; label: string; color: string }[] = [
  { id: 'sgd', label: 'SGD', color: C.series[0] },
  { id: 'momentum', label: 'Momentum', color: C.series[1] },
  { id: 'rmsprop', label: 'RMSProp', color: C.series[2] },
  { id: 'adam', label: 'Adam', color: C.series[3] },
]

function mixHex(a: string, b: string, t: number): string {
  const pa = parseHex(a)
  const pb = parseHex(b)
  const r = Math.round(pa[0] + (pb[0] - pa[0]) * t)
  const g = Math.round(pa[1] + (pb[1] - pa[1]) * t)
  const bl = Math.round(pa[2] + (pb[2] - pa[2]) * t)
  return `rgb(${r},${g},${bl})`
}

function parseHex(c: string): [number, number, number] {
  const s = c.trim()
  if (s.startsWith('#') && s.length >= 7) return [parseInt(s.slice(1, 3), 16), parseInt(s.slice(3, 5), 16), parseInt(s.slice(5, 7), 16)]
  const m = s.match(/rgba?\((\d+),\s*(\d+),\s*(\d+)/)
  return m ? [Number(m[1]), Number(m[2]), Number(m[3])] : [128, 128, 128]
}

function optimizerRuns(spec: LossSpec, start: Point2, learningRate: number, steps: number): RunTrace[] {
  const eta = learningRate * spec.lrScale
  return OPTS.map((opt) => {
    let p = { ...start }
    let velocity = { x: 0, y: 0 }
    let second = { x: 0, y: 0 }
    let first = { x: 0, y: 0 }
    const points = [{ ...p }]
    const losses = [spec.f(p)]
    for (let t = 1; t <= steps; t += 1) {
      const raw = spec.g(p)
      const gradNorm = Math.max(1, Math.hypot(raw.x, raw.y) / 80)
      const grad = { x: raw.x / gradNorm, y: raw.y / gradNorm }
      if (opt.id === 'sgd') {
        p = { x: p.x - eta * grad.x, y: p.y - eta * grad.y }
      } else if (opt.id === 'momentum') {
        velocity = { x: 0.86 * velocity.x + eta * grad.x, y: 0.86 * velocity.y + eta * grad.y }
        p = { x: p.x - velocity.x, y: p.y - velocity.y }
      } else if (opt.id === 'rmsprop') {
        second = { x: 0.9 * second.x + 0.1 * grad.x * grad.x, y: 0.9 * second.y + 0.1 * grad.y * grad.y }
        p = { x: p.x - (eta * grad.x) / (Math.sqrt(second.x) + 1e-6), y: p.y - (eta * grad.y) / (Math.sqrt(second.y) + 1e-6) }
      } else {
        first = { x: 0.9 * first.x + 0.1 * grad.x, y: 0.9 * first.y + 0.1 * grad.y }
        second = { x: 0.999 * second.x + 0.001 * grad.x * grad.x, y: 0.999 * second.y + 0.001 * grad.y * grad.y }
        const mh = { x: first.x / (1 - 0.9 ** t), y: first.y / (1 - 0.9 ** t) }
        const vh = { x: second.x / (1 - 0.999 ** t), y: second.y / (1 - 0.999 ** t) }
        p = { x: p.x - (eta * mh.x) / (Math.sqrt(vh.x) + 1e-6), y: p.y - (eta * mh.y) / (Math.sqrt(vh.y) + 1e-6) }
      }
      p = { x: clamp(p.x, spec.domain.x0, spec.domain.x1), y: clamp(p.y, spec.domain.y0, spec.domain.y1) }
      points.push({ ...p })
      losses.push(spec.f(p))
    }
    return { ...opt, points, losses }
  })
}

export default function GradientDescent() {
  const [lossId, setLossId] = useState<LossKind>('ellipse')
  const [start, setStart] = useState<Point2>(LOSSES.ellipse.start)
  const [logLr, setLogLr] = useState(-0.55)
  const [steps, setSteps] = useState(90)
  const [enabled, setEnabled] = useState<Record<OptimizerId, boolean>>({ sgd: true, momentum: true, rmsprop: true, adam: true })
  const [wrapRef, size] = useSize<HTMLDivElement>()
  const canvasRef = useRef<HTMLCanvasElement | null>(null)
  const themeVersion = useThemeVersion()
  const spec = LOSSES[lossId]
  const lr = 10 ** logLr
  const timeline = useMemo(() => Array.from({ length: steps + 1 }, (_, i) => i), [steps])
  const player = usePlayer(timeline, 18)
  const runs = useMemo(() => optimizerRuns(spec, start, lr, steps), [spec, start, lr, steps])
  const w = Math.max(320, size.width)
  const h = 360
  const sx = (x: number) => ((x - spec.domain.x0) / (spec.domain.x1 - spec.domain.x0)) * w
  const sy = (y: number) => h - ((y - spec.domain.y0) / (spec.domain.y1 - spec.domain.y0)) * h

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const dpr = window.devicePixelRatio || 1
    canvas.width = Math.round(w * dpr)
    canvas.height = Math.round(h * dpr)
    canvas.style.width = `${w}px`
    canvas.style.height = `${h}px`
    const ctx = canvas.getContext('2d')
    if (!ctx) return
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
    const panel = cssVar('--panel-2')
    const accent = cssVar('--accent')
    const warn = cssVar('--warn')
    const line = cssVar('--line')
    const fg = cssVar('--fg')
    ctx.clearRect(0, 0, w, h)
    ctx.fillStyle = panel
    ctx.fillRect(0, 0, w, h)
    const gx = 90
    const gy = 70
    const vals: number[][] = []
    let mn = Infinity
    let mx = -Infinity
    for (let j = 0; j < gy; j += 1) {
      vals[j] = []
      for (let i = 0; i < gx; i += 1) {
        const x = spec.domain.x0 + (i / (gx - 1)) * (spec.domain.x1 - spec.domain.x0)
        const y = spec.domain.y0 + (j / (gy - 1)) * (spec.domain.y1 - spec.domain.y0)
        const z = Math.log1p(Math.abs(spec.f({ x, y })))
        vals[j][i] = z
        mn = Math.min(mn, z)
        mx = Math.max(mx, z)
      }
    }
    const cw = w / gx
    const ch = h / gy
    for (let j = 0; j < gy; j += 1) {
      for (let i = 0; i < gx; i += 1) {
        const t = clamp((vals[j][i] - mn) / Math.max(1e-9, mx - mn), 0, 1)
        ctx.fillStyle = mixHex(panel, t < 0.7 ? accent : warn, 0.08 + 0.42 * t)
        ctx.fillRect(i * cw, h - (j + 1) * ch, cw + 1, ch + 1)
      }
    }
    ctx.globalAlpha = 0.55
    ctx.strokeStyle = line
    ctx.lineWidth = 1
    for (let level = 1; level <= 9; level += 1) {
      const target = mn + (level / 10) * (mx - mn)
      ctx.beginPath()
      for (let j = 0; j < gy - 1; j += 1) {
        for (let i = 0; i < gx - 1; i += 1) {
          const a = vals[j][i]
          const b = vals[j][i + 1]
          const c = vals[j + 1][i + 1]
          const d = vals[j + 1][i]
          const pts: Point2[] = []
          const add = (v1: number, v2: number, p1: Point2, p2: Point2) => {
            if ((v1 <= target && v2 > target) || (v2 <= target && v1 > target)) {
              const t = (target - v1) / (v2 - v1)
              pts.push({ x: p1.x + (p2.x - p1.x) * t, y: p1.y + (p2.y - p1.y) * t })
            }
          }
          const x0 = i * cw
          const y0 = h - (j + 1) * ch
          const x1 = (i + 1) * cw
          const y1 = h - j * ch
          add(a, b, { x: x0, y: y1 }, { x: x1, y: y1 })
          add(b, c, { x: x1, y: y1 }, { x: x1, y: y0 })
          add(c, d, { x: x1, y: y0 }, { x: x0, y: y0 })
          add(d, a, { x: x0, y: y0 }, { x: x0, y: y1 })
          if (pts.length >= 2) {
            ctx.moveTo(pts[0].x, pts[0].y)
            ctx.lineTo(pts[1].x, pts[1].y)
          }
        }
      }
      ctx.stroke()
    }
    ctx.globalAlpha = 1
    for (const run of runs) {
      if (!enabled[run.id]) continue
      const color = cssVar(run.color.replace('var(', '').replace(')', ''))
      const visible = run.points.slice(0, player.index + 1)
      ctx.strokeStyle = color
      ctx.lineWidth = 2.4
      ctx.beginPath()
      visible.forEach((p, i) => {
        const x = sx(p.x)
        const y = sy(p.y)
        if (i === 0) ctx.moveTo(x, y)
        else ctx.lineTo(x, y)
      })
      ctx.stroke()
      const last = visible[visible.length - 1]
      ctx.fillStyle = color
      ctx.beginPath()
      ctx.arc(sx(last.x), sy(last.y), 4.5, 0, Math.PI * 2)
      ctx.fill()
    }
    ctx.fillStyle = fg
    ctx.beginPath()
    ctx.arc(sx(start.x), sy(start.y), 5.5, 0, Math.PI * 2)
    ctx.fill()
  }, [enabled, h, player.index, runs, spec, start, sx, sy, themeVersion, w])

  const activeRuns = runs.filter((r) => enabled[r.id])
  const best = activeRuns.reduce<{ label: string; loss: number } | null>((acc, r) => {
    const loss = r.losses[Math.min(player.index, r.losses.length - 1)]
    return !acc || loss < acc.loss ? { label: r.label, loss } : acc
  }, null)
  const allLosses = activeRuns.flatMap((r) => r.losses.slice(0, player.index + 1).map((v) => Math.log1p(Math.abs(v))))
  const chartMin = allLosses.length ? Math.min(...allLosses) : 0
  const chartMax = allLosses.length ? Math.max(...allLosses) : 1
  const caption = `${spec.label}: step ${player.index}/${steps}, lr=${formatNum(lr, 4)}, best=${best ? `${best.label} f=${formatNum(best.loss, 4)}` : 'none'}.`
  const insight = lossId === 'saddle' ? 'Insight: saddle gradients can push one direction down while exploding in another; adaptive methods dampen the unstable axis.' : 'Insight: momentum and adaptive scaling reduce zig-zagging on curved valleys, but an oversized learning rate still overshoots.'

  const handleCanvasClick = (event: MouseEvent<HTMLCanvasElement>) => {
    const rect = event.currentTarget.getBoundingClientRect()
    const x = spec.domain.x0 + ((event.clientX - rect.left) / rect.width) * (spec.domain.x1 - spec.domain.x0)
    const y = spec.domain.y1 - ((event.clientY - rect.top) / rect.height) * (spec.domain.y1 - spec.domain.y0)
    setStart({ x, y })
    player.reset()
  }

  return (
    <VizFrame
      title="Gradient Descent & Optimizers"
      description="Compare optimizer trajectories on nonconvex 2-D loss landscapes; click the surface to choose a start."
      controls={
        <>
          <Select value={lossId} onChange={(v) => { setLossId(v); setStart(LOSSES[v].start); player.reset() }} options={Object.values(LOSSES).map((l) => ({ value: l.id, label: l.label }))} />
          <Slider className="w-36" label="log10 lr" min={-4} max={0} step={0.05} value={logLr} onChange={(v) => { setLogLr(v); player.reset() }} format={(v) => formatNum(10 ** v, 4)} />
          <Slider className="w-36" label="steps" min={25} max={220} step={5} value={steps} onChange={(v) => setSteps(v)} />
          <PlayerControls player={player} maxSpeed={40} />
          {OPTS.map((o) => (
            <Switch key={o.id} checked={enabled[o.id]} onChange={(v) => setEnabled((e) => ({ ...e, [o.id]: v }))} label={<span className="text-xs" style={{ color: o.color }}>{o.label}</span>} />
          ))}
        </>
      }
      caption={<div><div>{caption}</div><div className="text-accent">{insight}</div></div>}
      legend={OPTS.map((o) => ({ color: o.color, label: o.label }))}
    >
      <div ref={wrapRef} className="grid gap-3 lg:grid-cols-[1fr_260px]">
        <div className="overflow-hidden rounded-xl border border-line bg-panel shadow-sm">
          <canvas ref={canvasRef} onClick={handleCanvasClick} className="block cursor-crosshair" aria-label="2-D loss heatmap and optimizer paths" />
        </div>
        <div className="grid gap-3">
          <div className="rounded-xl border border-line bg-panel p-3">
            <div className="mb-2 flex items-center justify-between text-xs text-muted"><span>log loss vs iteration</span><Badge tone="accent">live</Badge></div>
            <svg viewBox="0 0 240 130" className="h-36 w-full overflow-visible">
              <line x1="26" x2="226" y1="108" y2="108" stroke={C.line} />
              <line x1="26" x2="26" y1="14" y2="108" stroke={C.line} />
              {activeRuns.map((r) => (
                <path key={r.id} d={chartPath(r.losses.slice(0, player.index + 1).map((v) => Math.log1p(Math.abs(v))), 26, 14, 200, 94, chartMin, chartMax)} fill="none" stroke={r.color} strokeWidth="2.3" strokeLinecap="round" />
              ))}
            </svg>
          </div>
          <div className="grid grid-cols-2 gap-2 text-xs">
            {activeRuns.map((r) => {
              const p = r.points[Math.min(player.index, r.points.length - 1)]
              return (
                <div key={r.id} className="rounded-lg border border-line bg-panel p-2">
                  <div className="font-semibold" style={{ color: r.color }}>{r.label}</div>
                  <div className="font-mono text-muted">f={formatNum(r.losses[Math.min(player.index, r.losses.length - 1)], 3)}</div>
                  <div className="font-mono text-muted">({formatNum(p.x, 2)}, {formatNum(p.y, 2)})</div>
                </div>
              )
            })}
          </div>
        </div>
      </div>
    </VizFrame>
  )
}
