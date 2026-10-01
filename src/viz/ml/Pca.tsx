import { useMemo, useState } from 'react'
import { Slider, Switch } from '../../components/ui'
import { C, VizFrame, useSize } from '../common'
import { Vec2, covariance2, eigenSym2, fmt, normal, seeded, svgHeat } from './_math2'

function rotate(p: Vec2, radians: number): Vec2 {
  const c = Math.cos(radians)
  const s = Math.sin(radians)
  return { x: c * p.x - s * p.y, y: s * p.x + c * p.y }
}

function project(p: Vec2, mean: Vec2, axis: Vec2): Vec2 {
  const dx = p.x - mean.x
  const dy = p.y - mean.y
  const t = dx * axis.x + dy * axis.y
  return { x: mean.x + t * axis.x, y: mean.y + t * axis.y }
}

export default function Pca() {
  const [corr, setCorr] = useState(0.72)
  const [ratio, setRatio] = useState(2.2)
  const [rotation, setRotation] = useState(28)
  const [n, setN] = useState(180)
  const [showProjection, setShowProjection] = useState(true)
  const [wrapRef, size] = useSize<HTMLDivElement>()
  const width = Math.max(360, size.width)
  const height = 380
  const margin = 28

  const model = useMemo(() => {
    const rng = seeded(2048 + Math.round(corr * 1000) + Math.round(ratio * 100) + rotation * 7 + n)
    const theta = (rotation * Math.PI) / 180
    const sx = Math.sqrt(ratio)
    const sy = 1
    const points = Array.from({ length: n }, () => {
      const z1 = normal(rng)
      const z2 = normal(rng)
      const raw = { x: sx * z1, y: sy * (corr * z1 + Math.sqrt(Math.max(0, 1 - corr * corr)) * z2) }
      return rotate(raw, theta)
    })
    const cov = covariance2(points)
    const eig = eigenSym2(cov.cov)
    const total = Math.max(1e-9, eig.values[0] + eig.values[1])
    const maxAbs = Math.max(2.5, ...points.map((p) => Math.max(Math.abs(p.x - cov.mean.x), Math.abs(p.y - cov.mean.y)))) * 1.2
    return { points, ...cov, eig, evr: [eig.values[0] / total, eig.values[1] / total] as [number, number], domain: maxAbs }
  }, [corr, n, ratio, rotation])

  const plotW = width - margin * 2
  const plotH = height - margin * 2
  const sx = (x: number) => margin + ((x - model.mean.x + model.domain) / (2 * model.domain)) * plotW
  const sy = (y: number) => margin + (1 - (y - model.mean.y + model.domain) / (2 * model.domain)) * plotH
  const axisLine = (axis: Vec2, lambda: number, mult: number) => {
    const len = Math.sqrt(Math.max(lambda, 0)) * mult
    return {
      x1: sx(model.mean.x - axis.x * len),
      y1: sy(model.mean.y - axis.y * len),
      x2: sx(model.mean.x + axis.x * len),
      y2: sy(model.mean.y + axis.y * len),
    }
  }
  const pc1 = model.eig.vectors[0]
  const a1 = axisLine(pc1, model.eig.values[0], 2.2)
  const a2 = axisLine(model.eig.vectors[1], model.eig.values[1], 2.2)
  const reconError = model.points.reduce((sum, p) => {
    const q = project(p, model.mean, pc1)
    return sum + Math.hypot(p.x - q.x, p.y - q.y)
  }, 0) / model.points.length

  return (
    <VizFrame
      title="Principal Component Analysis"
      description="Generate a correlated Gaussian cloud, estimate covariance, and project onto the first principal component."
      controls={
        <>
          <Slider label="corr" value={corr} min={-0.95} max={0.95} step={0.01} onChange={setCorr} format={(v) => fmt(v, 2)} className="w-36" />
          <Slider label="var ratio" value={ratio} min={0.25} max={4} step={0.05} onChange={setRatio} format={(v) => fmt(v, 2)} className="w-36" />
          <Slider label="rotation" value={rotation} min={-90} max={90} step={1} onChange={setRotation} format={(v) => `${v}°`} className="w-36" />
          <Slider label="n" value={n} min={40} max={320} step={10} onChange={setN} className="w-32" />
          <Switch checked={showProjection} onChange={setShowProjection} label="project to PC1" />
        </>
      }
      caption={`PC1 explains ${fmt(model.evr[0] * 100, 1)}% of variance; mean reconstruction distance from PC1 is ${fmt(reconError, 2)}.`}
      legend={[
        { color: C.accent, label: 'data' },
        { color: C.ok, label: 'PC1' },
        { color: C.warn, label: 'PC2' },
      ]}
    >
      <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_280px]">
        <div ref={wrapRef} className="rounded-xl border border-line bg-panel p-2">
          <svg width="100%" height={height} viewBox={`0 0 ${width} ${height}`}>
            {Array.from({ length: 9 }, (_, i) => -model.domain + (2 * model.domain * i) / 8).map((v) => (
              <g key={v}>
                <line x1={sx(model.mean.x + v)} x2={sx(model.mean.x + v)} y1={margin} y2={height - margin} stroke={C.line} strokeDasharray="3 7" />
                <line x1={margin} x2={width - margin} y1={sy(model.mean.y + v)} y2={sy(model.mean.y + v)} stroke={C.line} strokeDasharray="3 7" />
              </g>
            ))}
            {showProjection && model.points.slice(0, 120).map((p, i) => {
              const q = project(p, model.mean, pc1)
              return <line key={`proj-${i}`} x1={sx(p.x)} y1={sy(p.y)} x2={sx(q.x)} y2={sy(q.y)} stroke={C.lineStrong} strokeWidth="1" opacity="0.45" />
            })}
            {model.points.map((p, i) => {
              const q = showProjection ? project(p, model.mean, pc1) : p
              return <circle key={`pt-${i}`} cx={sx(q.x)} cy={sy(q.y)} r={showProjection ? 2.4 : 2.8} fill={showProjection ? C.ok : C.accent} opacity={showProjection ? 0.72 : 0.78} />
            })}
            {model.points.map((p, i) => <circle key={`raw-${i}`} cx={sx(p.x)} cy={sy(p.y)} r="2" fill={C.accent} opacity={showProjection ? 0.22 : 0} />)}
            <line {...a2} stroke={C.warn} strokeWidth="4" strokeLinecap="round" opacity="0.9" />
            <line {...a1} stroke={C.ok} strokeWidth="5" strokeLinecap="round" />
            <circle cx={sx(model.mean.x)} cy={sy(model.mean.y)} r="5" fill={C.panel} stroke={C.fg} strokeWidth="2" />
            <text x={a1.x2 + 6} y={a1.y2} fontSize="11" fill={C.ok}>PC1</text>
            <text x={a2.x2 + 6} y={a2.y2} fontSize="11" fill={C.warn}>PC2</text>
          </svg>
        </div>

        <div className="space-y-4">
          <div className="rounded-xl border border-line bg-panel p-3">
            <div className="mb-2 text-xs font-semibold text-fg">Explained variance</div>
            {[0, 1].map((i) => (
              <div key={i} className="mb-3 last:mb-0">
                <div className="mb-1 flex justify-between text-xs text-muted"><span>PC{i + 1}</span><span className="font-mono text-fg">{fmt(model.evr[i] * 100, 1)}%</span></div>
                <div className="h-4 overflow-hidden rounded-full bg-subtle">
                  <div className="h-full rounded-full transition-all" style={{ width: `${model.evr[i] * 100}%`, background: i === 0 ? C.ok : C.warn }} />
                </div>
              </div>
            ))}
          </div>

          <div className="rounded-xl border border-line bg-panel p-3">
            <div className="mb-2 text-xs font-semibold text-fg">Covariance matrix</div>
            <div className="grid grid-cols-2 gap-1 font-mono text-sm">
              {model.cov.flat().map((v, i) => <div key={i} className="rounded-lg p-2 text-center text-fg" style={{ background: svgHeat(Math.min(1, Math.abs(v) / Math.max(model.eig.values[0], 1e-6)), v >= 0 ? 'var(--viz-1)' : 'var(--viz-2)') }}>{fmt(v, 3)}</div>)}
            </div>
            <div className="mt-3 grid grid-cols-2 gap-2 text-xs text-muted">
              <div className="rounded-lg bg-subtle p-2">λ₁ <span className="font-mono text-fg">{fmt(model.eig.values[0], 3)}</span></div>
              <div className="rounded-lg bg-subtle p-2">λ₂ <span className="font-mono text-fg">{fmt(model.eig.values[1], 3)}</span></div>
            </div>
          </div>

          <div className="rounded-xl border border-line bg-panel p-3 text-xs text-muted">
            <span className="font-semibold text-fg">Insight: </span>
            PCA rotates the coordinate system toward maximum variance; dropping PC2 is optimal when reconstruction error matters in squared distance.
          </div>
        </div>
      </div>
    </VizFrame>
  )
}
