import { useMemo, useState } from 'react'
import { Badge, Button, Slider } from '../../components/ui'
import { C, VizFrame, mulberry32, randn, useSize } from '../common'
import { chartPath, evalPolynomial, fitPolynomial, formatNum, linePath, mse } from './_math1'

interface Sample {
  x: number
  y: number
  train: boolean
}

interface DegreeMetric {
  degree: number
  train: number
  test: number
}

const trueFn = (x: number): number => Math.sin(1.45 * x)
const xScale = (x: number): number => x / 3

function makeSamples(seed: number, noise: number): Sample[] {
  const rng = mulberry32(seed)
  return Array.from({ length: 58 }, (_, i) => {
    const x = -3 + 6 * rng()
    const y = trueFn(x) + noise * randn(rng)
    return { x, y, train: i % 4 !== 0 }
  }).sort((a, b) => a.x - b.x)
}

function fitFor(samples: readonly Sample[], degree: number, ridge: number): number[] {
  const train = samples.filter((s) => s.train)
  return fitPolynomial(train.map((s) => xScale(s.x)), train.map((s) => s.y), degree, ridge)
}

function metricsFor(samples: readonly Sample[], degree: number, ridge: number): DegreeMetric {
  const coeffs = fitFor(samples, degree, ridge)
  const train = samples.filter((s) => s.train)
  const test = samples.filter((s) => !s.train)
  const pred = (s: Sample) => evalPolynomial(coeffs, xScale(s.x))
  return { degree, train: mse(train.map((s) => s.y), train.map(pred)), test: mse(test.map((s) => s.y), test.map(pred)) }
}

export default function BiasVariance() {
  const [degree, setDegree] = useState(5)
  const [logRidge, setLogRidge] = useState(-5)
  const [noise, setNoise] = useState(0.24)
  const [seed, setSeed] = useState(11)
  const [wrapRef, size] = useSize<HTMLDivElement>()
  const ridge = logRidge <= -5.9 ? 0 : 10 ** logRidge
  const samples = useMemo(() => makeSamples(seed, noise), [seed, noise])
  const coeffs = useMemo(() => fitFor(samples, degree, ridge), [samples, degree, ridge])
  const metrics = useMemo(() => Array.from({ length: 15 }, (_, i) => metricsFor(samples, i + 1, ridge)), [samples, ridge])
  const current = metrics[degree - 1]
  const w = Math.max(320, size.width)
  const plotW = w >= 780 ? w - 286 : w
  const plotH = 310
  const x0 = -3.15
  const x1 = 3.15
  const curve = Array.from({ length: 180 }, (_, i) => {
    const x = x0 + (i / 179) * (x1 - x0)
    return { x, y: evalPolynomial(coeffs, xScale(x)) }
  })
  const truth = Array.from({ length: 180 }, (_, i) => {
    const x = x0 + (i / 179) * (x1 - x0)
    return { x, y: trueFn(x) }
  })
  const allY = [...samples.map((s) => s.y), ...curve.map((p) => p.y), -1.25, 1.25]
  const yMin = Math.max(-4, Math.min(...allY) - 0.25)
  const yMax = Math.min(4, Math.max(...allY) + 0.25)
  const sx = (x: number) => 34 + ((x - x0) / (x1 - x0)) * (plotW - 52)
  const sy = (y: number) => 18 + (1 - (y - yMin) / (yMax - yMin)) * (plotH - 44)
  const chartValues = metrics.flatMap((m) => [Math.log10(m.train + 1e-4), Math.log10(m.test + 1e-4)])
  const chartMin = Math.min(...chartValues)
  const chartMax = Math.max(...chartValues)
  const biasLevel = degree <= 3 ? 'high bias' : degree >= 11 && ridge < 0.01 ? 'high variance' : 'balanced'
  const insight = degree <= 3 ? 'Insight: low-degree polynomials miss the sine shape, so both train and test error stay high (underfitting).' : degree >= 11 && ridge < 0.01 ? 'Insight: high degree can chase noise: train MSE falls while test MSE rises (overfitting).' : 'Insight: moderate degree or ridge regularization trades a little bias for lower variance.'

  return (
    <VizFrame
      title="Bias–Variance Trade-off"
      description="Fit noisy sine samples with polynomial regression; compare train and held-out test error across degrees."
      controls={
        <>
          <Slider className="w-40" label="degree" min={1} max={15} step={1} value={degree} onChange={setDegree} />
          <Slider className="w-44" label="ridge λ" min={-6} max={2} step={0.1} value={logRidge} onChange={setLogRidge} format={(v) => (v <= -5.9 ? '0' : formatNum(10 ** v, 3))} />
          <Slider className="w-36" label="noise" min={0.02} max={0.65} step={0.01} value={noise} onChange={setNoise} format={(v) => formatNum(v, 2)} />
          <Button size="sm" variant="outline" onClick={() => setSeed((s) => s + 1)}>Regenerate</Button>
          <Badge tone={biasLevel === 'balanced' ? 'ok' : biasLevel === 'high bias' ? 'warn' : 'err'}>{biasLevel}</Badge>
        </>
      }
      caption={<div><div>Degree {degree} fit: train MSE={formatNum(current.train, 4)}, test MSE={formatNum(current.test, 4)}, λ={formatNum(ridge, 3)}.</div><div className="text-accent">{insight}</div></div>}
      legend={[{ color: C.accent, label: 'fit' }, { color: C.ok, label: 'true sin' }, { color: C.series[1], label: 'train' }, { color: C.warn, label: 'test' }]}
    >
      <div ref={wrapRef} className="grid gap-3 lg:grid-cols-[1fr_270px]">
        <div className="rounded-xl border border-line bg-panel p-3">
          <svg viewBox={`0 0 ${plotW} ${plotH}`} className="h-[330px] w-full overflow-visible">
            <line x1={sx(x0)} x2={sx(x1)} y1={sy(0)} y2={sy(0)} stroke={C.line} />
            <line x1={sx(0)} x2={sx(0)} y1={18} y2={plotH - 26} stroke={C.line} />
            {[-3, -2, -1, 0, 1, 2, 3].map((x) => <line key={x} x1={sx(x)} x2={sx(x)} y1={18} y2={plotH - 26} stroke={C.line} opacity={0.35} />)}
            <path d={linePath(truth, sx, sy)} fill="none" stroke={C.ok} strokeWidth="2.2" strokeDasharray="5 4" />
            <path d={linePath(curve, sx, sy)} fill="none" stroke={C.accent} strokeWidth="3" strokeLinecap="round" />
            {samples.map((s, i) => (
              <circle key={i} cx={sx(s.x)} cy={sy(s.y)} r={s.train ? 4 : 5} fill={s.train ? C.series[1] : C.warn} opacity={s.train ? 0.9 : 0.95} stroke={C.panel} strokeWidth="1.2" />
            ))}
            <text x={34} y={plotH - 5} fill={C.muted} fontSize="11">x</text>
            <text x={8} y={20} fill={C.muted} fontSize="11">y</text>
          </svg>
        </div>
        <div className="rounded-xl border border-line bg-panel p-3">
          <div className="mb-1 flex items-center justify-between text-xs text-muted"><span>train vs test MSE by degree</span><Badge tone="accent">current {degree}</Badge></div>
          <svg viewBox="0 0 250 220" className="h-60 w-full overflow-visible">
            <line x1="30" x2="232" y1="185" y2="185" stroke={C.line} />
            <line x1="30" x2="30" y1="18" y2="185" stroke={C.line} />
            <path d={chartPath(metrics.map((m) => Math.log10(m.train + 1e-4)), 30, 18, 202, 167, chartMin, chartMax)} fill="none" stroke={C.series[1]} strokeWidth="2.4" />
            <path d={chartPath(metrics.map((m) => Math.log10(m.test + 1e-4)), 30, 18, 202, 167, chartMin, chartMax)} fill="none" stroke={C.warn} strokeWidth="2.4" />
            {metrics.map((m) => {
              const x = 30 + ((m.degree - 1) / 14) * 202
              return <line key={m.degree} x1={x} x2={x} y1="185" y2="190" stroke={m.degree === degree ? C.accent : C.line} />
            })}
            <line x1={30 + ((degree - 1) / 14) * 202} x2={30 + ((degree - 1) / 14) * 202} y1="18" y2="185" stroke={C.accent} strokeDasharray="4 4" />
            <text x="30" y="207" fill={C.muted} fontSize="11">1</text>
            <text x="218" y="207" fill={C.muted} fontSize="11">15</text>
            <text x="78" y="16" fill={C.series[1]} fontSize="11">train</text>
            <text x="130" y="16" fill={C.warn} fontSize="11">test</text>
          </svg>
          <div className="grid grid-cols-2 gap-2 text-xs">
            <div className="rounded-lg bg-subtle p-2"><div className="text-muted">Train MSE</div><div className="font-mono text-fg">{formatNum(current.train, 4)}</div></div>
            <div className="rounded-lg bg-subtle p-2"><div className="text-muted">Test MSE</div><div className="font-mono text-fg">{formatNum(current.test, 4)}</div></div>
          </div>
        </div>
      </div>
    </VizFrame>
  )
}
