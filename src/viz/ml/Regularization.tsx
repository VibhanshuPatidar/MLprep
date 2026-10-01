import { useMemo, useState } from 'react'
import { Badge, Segmented, Slider } from '../../components/ui'
import { C, VizFrame, mulberry32, randn, useSize } from '../common'
import { chartPath, clamp, formatNum, solveLinearSystem, type Point2 } from './_math1'

type PathMode = 'ridge' | 'lasso'

type Constraint = 'l1' | 'l2'

interface SyntheticData {
  x: number[][]
  y: number[]
}

const optimum: Point2 = { x: 1.35, y: 0.85 }
const hessian = { a: 1.25, b: -0.78, c: 1.12 }
const lambdas = Array.from({ length: 28 }, (_, i) => 2.2 * (0.005 / 2.2) ** (i / 27))

function loss(p: Point2): number {
  const dx = p.x - optimum.x
  const dy = p.y - optimum.y
  return hessian.a * dx * dx + 2 * hessian.b * dx * dy + hessian.c * dy * dy
}

function contourPath(level: number, sx: (x: number) => number, sy: (y: number) => number): string {
  const pts = Array.from({ length: 120 }, (_, i) => {
    const t = (2 * Math.PI * i) / 119
    const vx = Math.cos(t)
    const vy = Math.sin(t)
    const q = hessian.a * vx * vx + 2 * hessian.b * vx * vy + hessian.c * vy * vy
    const r = Math.sqrt(level / q)
    return { x: optimum.x + r * vx, y: optimum.y + r * vy }
  })
  return pts.map((p, i) => `${i === 0 ? 'M' : 'L'} ${sx(p.x).toFixed(2)} ${sy(p.y).toFixed(2)}`).join(' ') + ' Z'
}

function constrainedOpt(radius: number, kind: Constraint): Point2 {
  let best = { x: 0, y: 0 }
  let bestLoss = Infinity
  const n = 130
  for (let ix = 0; ix <= n; ix += 1) {
    const x = -2.2 + (ix / n) * 4.4
    for (let iy = 0; iy <= n; iy += 1) {
      const y = -2.2 + (iy / n) * 4.4
      const feasible = kind === 'l2' ? Math.hypot(x, y) <= radius : Math.abs(x) + Math.abs(y) <= radius
      if (!feasible) continue
      const v = loss({ x, y })
      if (v < bestLoss) {
        bestLoss = v
        best = { x, y }
      }
    }
  }
  return best
}

function makeSynthetic(): SyntheticData {
  const rng = mulberry32(44)
  const trueW = [1.25, 0, -0.95, 0.55, 0]
  const x = Array.from({ length: 70 }, () => {
    const z = randn(rng)
    return Array.from({ length: trueW.length }, (_, j) => {
      const raw = 0.45 * z + randn(rng)
      return j === 1 ? raw * 0.75 + 0.35 * z : raw
    })
  })
  const y = x.map((row) => row.reduce((s, v, i) => s + v * trueW[i], 0) + 0.25 * randn(rng))
  const means = x[0].map((_, j) => x.reduce((s, row) => s + row[j], 0) / x.length)
  const scales = means.map((m, j) => Math.sqrt(x.reduce((s, row) => s + (row[j] - m) ** 2, 0) / x.length) || 1)
  const yMean = y.reduce((s, v) => s + v, 0) / y.length
  return { x: x.map((row) => row.map((v, j) => (v - means[j]) / scales[j])), y: y.map((v) => v - yMean) }
}

function ridgeFit(data: SyntheticData, lambda: number): number[] {
  const p = data.x[0].length
  const xtx = Array.from({ length: p }, () => Array.from({ length: p }, () => 0))
  const xty = Array.from({ length: p }, () => 0)
  for (let i = 0; i < data.x.length; i += 1) {
    for (let r = 0; r < p; r += 1) {
      xty[r] += (data.x[i][r] * data.y[i]) / data.x.length
      for (let c = 0; c < p; c += 1) xtx[r][c] += (data.x[i][r] * data.x[i][c]) / data.x.length
    }
  }
  for (let i = 0; i < p; i += 1) xtx[i][i] += lambda
  return solveLinearSystem(xtx, xty)
}

function softThreshold(rho: number, lambda: number): number {
  if (rho > lambda) return rho - lambda
  if (rho < -lambda) return rho + lambda
  return 0
}

function lassoPath(data: SyntheticData): number[][] {
  const p = data.x[0].length
  let w = Array.from({ length: p }, () => 0)
  return lambdas.map((lambda) => {
    for (let iter = 0; iter < 90; iter += 1) {
      for (let j = 0; j < p; j += 1) {
        let rho = 0
        let z = 0
        for (let i = 0; i < data.x.length; i += 1) {
          let residual = data.y[i]
          for (let k = 0; k < p; k += 1) if (k !== j) residual -= data.x[i][k] * w[k]
          rho += data.x[i][j] * residual
          z += data.x[i][j] * data.x[i][j]
        }
        rho /= data.x.length
        z /= data.x.length
        w[j] = softThreshold(rho, lambda) / Math.max(1e-8, z)
      }
    }
    w = w.map((v) => (Math.abs(v) < 1e-4 ? 0 : v))
    return [...w]
  })
}

function ridgePath(data: SyntheticData): number[][] {
  return lambdas.map((l) => ridgeFit(data, l))
}

export default function Regularization() {
  const [radius, setRadius] = useState(1.15)
  const [mode, setMode] = useState<PathMode>('lasso')
  const [wrapRef, size] = useSize<HTMLDivElement>()
  const w = Math.max(320, size.width)
  const panelW = w >= 820 ? (w - 18) / 2 : w
  const h = 360
  const sx = (x: number) => 30 + ((x + 2.25) / 4.5) * (panelW - 58)
  const sy = (y: number) => 18 + (1 - (y + 2.25) / 4.5) * (h - 44)
  const l1 = useMemo(() => constrainedOpt(radius, 'l1'), [radius])
  const l2 = useMemo(() => constrainedOpt(radius, 'l2'), [radius])
  const data = useMemo(() => makeSynthetic(), [])
  const paths = useMemo(() => ({ ridge: ridgePath(data), lasso: lassoPath(data) }), [data])
  const activePath = paths[mode]
  const lambdaEquivalent = clamp(0.42 / radius, lambdas[lambdas.length - 1], lambdas[0])
  const lambdaIndex = lambdas.reduce((best, l, i) => (Math.abs(Math.log(l) - Math.log(lambdaEquivalent)) < Math.abs(Math.log(lambdas[best]) - Math.log(lambdaEquivalent)) ? i : best), 0)
  const coeffValues = activePath.flat()
  const minCoeff = Math.min(-0.2, ...coeffValues)
  const maxCoeff = Math.max(0.2, ...coeffValues)
  const coeffSeries = activePath[0].map((_, j) => activePath.map((row) => row[j]))
  const zeroCount = paths.lasso[lambdaIndex].filter((v) => Math.abs(v) < 0.03).length
  const diamond = `${sx(0)},${sy(radius)} ${sx(radius)},${sy(0)} ${sx(0)},${sy(-radius)} ${sx(-radius)},${sy(0)}`
  const circleR = (radius / 4.5) * (panelW - 58)
  const insight = mode === 'lasso' ? 'Insight: L1 has corners; elliptical loss often touches a corner, driving some coefficients exactly to zero.' : 'Insight: L2 is round, so coefficients shrink smoothly together rather than becoming exactly sparse.'

  return (
    <VizFrame
      title="L1 vs L2 Regularization"
      description="See regularization as constrained optimization geometry, then compare ridge and lasso coefficient paths."
      controls={
        <>
          <Slider className="w-48" label="constraint radius" min={0.25} max={2.1} step={0.02} value={radius} onChange={setRadius} format={(v) => `${formatNum(v, 2)} (λ≈${formatNum(0.42 / v, 2)})`} />
          <Segmented options={[{ value: 'lasso', label: 'lasso paths' }, { value: 'ridge', label: 'ridge paths' }]} value={mode} onChange={setMode} />
          <Badge tone="accent">lasso zeros: {zeroCount}/5</Badge>
        </>
      }
      caption={<div><div>L1 optimum=({formatNum(l1.x, 2)}, {formatNum(l1.y, 2)}), L2 optimum=({formatNum(l2.x, 2)}, {formatNum(l2.y, 2)}), highlighted λ≈{formatNum(lambdaEquivalent, 3)}.</div><div className="text-accent">{insight}</div></div>}
      legend={[{ color: C.series[1], label: 'L1 diamond' }, { color: C.series[2], label: 'L2 circle' }, { color: C.accent, label: 'constrained optima' }]}
    >
      <div ref={wrapRef} className="grid gap-3 lg:grid-cols-2">
        <div className="rounded-xl border border-line bg-panel p-3">
          <div className="mb-2 text-xs font-medium text-muted">Constraint geometry</div>
          <svg viewBox={`0 0 ${panelW} ${h}`} className="h-[370px] w-full overflow-visible">
            <line x1={sx(-2.2)} x2={sx(2.2)} y1={sy(0)} y2={sy(0)} stroke={C.line} />
            <line x1={sx(0)} x2={sx(0)} y1={sy(-2.2)} y2={sy(2.2)} stroke={C.line} />
            {[0.18, 0.42, 0.78, 1.22, 1.78, 2.45].map((level) => <path key={level} d={contourPath(level, sx, sy)} fill="none" stroke={C.lineStrong} strokeWidth="1.2" opacity={0.75} />)}
            <polygon points={diamond} fill={C.series[1]} opacity="0.08" stroke={C.series[1]} strokeWidth="2.2" />
            <circle cx={sx(0)} cy={sy(0)} r={circleR} fill={C.series[2]} opacity="0.07" stroke={C.series[2]} strokeWidth="2.2" />
            <circle cx={sx(optimum.x)} cy={sy(optimum.y)} r="6" fill={C.warn} />
            <circle cx={sx(l1.x)} cy={sy(l1.y)} r="6" fill={C.series[1]} stroke={C.panel} strokeWidth="1.5" />
            <circle cx={sx(l2.x)} cy={sy(l2.y)} r="6" fill={C.series[2]} stroke={C.panel} strokeWidth="1.5" />
            <text x={sx(optimum.x) + 8} y={sy(optimum.y) - 6} fill={C.warn} fontSize="11">unregularized</text>
            <text x={sx(l1.x) + 8} y={sy(l1.y) + 14} fill={C.series[1]} fontSize="11">L1</text>
            <text x={sx(l2.x) + 8} y={sy(l2.y) - 8} fill={C.series[2]} fontSize="11">L2</text>
            <text x="30" y={h - 8} fill={C.muted} fontSize="11">β₁</text>
            <text x="8" y="22" fill={C.muted} fontSize="11">β₂</text>
          </svg>
        </div>
        <div className="rounded-xl border border-line bg-panel p-3">
          <div className="mb-2 flex items-center justify-between text-xs text-muted"><span>{mode === 'lasso' ? 'Lasso' : 'Ridge'} coefficient paths</span><Badge tone={mode === 'lasso' ? 'warn' : 'info'}>{mode}</Badge></div>
          <svg viewBox={`0 0 ${panelW} ${h}`} className="h-[370px] w-full overflow-visible">
            <line x1="36" x2={panelW - 22} y1={h - 42} y2={h - 42} stroke={C.line} />
            <line x1="36" x2="36" y1="18" y2={h - 42} stroke={C.line} />
            <line x1="36" x2={panelW - 22} y1={18 + (1 - (0 - minCoeff) / (maxCoeff - minCoeff)) * (h - 60)} y2={18 + (1 - (0 - minCoeff) / (maxCoeff - minCoeff)) * (h - 60)} stroke={C.line} strokeDasharray="4 4" />
            {coeffSeries.map((series, j) => <path key={j} d={chartPath(series, 36, 18, panelW - 58, h - 60, minCoeff, maxCoeff)} fill="none" stroke={C.series[j % C.series.length]} strokeWidth="2.4" strokeLinecap="round" />)}
            <line x1={36 + (lambdaIndex / (lambdas.length - 1)) * (panelW - 58)} x2={36 + (lambdaIndex / (lambdas.length - 1)) * (panelW - 58)} y1="18" y2={h - 42} stroke={C.accent} strokeDasharray="5 4" />
            {activePath[lambdaIndex].map((coef, j) => {
              const x = 36 + (lambdaIndex / (lambdas.length - 1)) * (panelW - 58)
              const y = 18 + (1 - (coef - minCoeff) / (maxCoeff - minCoeff)) * (h - 60)
              return <circle key={j} cx={x} cy={y} r="4.2" fill={C.series[j % C.series.length]} stroke={C.panel} strokeWidth="1" />
            })}
            <text x="36" y={h - 14} fill={C.muted} fontSize="11">high λ</text>
            <text x={panelW - 68} y={h - 14} fill={C.muted} fontSize="11">low λ</text>
            {coeffSeries.map((_, j) => <text key={j} x={panelW - 20} y={28 + j * 17} fill={C.series[j % C.series.length]} fontSize="11">β{j + 1}</text>)}
          </svg>
        </div>
      </div>
    </VizFrame>
  )
}
