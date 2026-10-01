import { motion } from 'framer-motion'
import { useMemo, useState } from 'react'
import { Badge, Segmented, Select, Slider } from '../../components/ui'
import { C, VizFrame } from '../common'
import { clamp, formatCompact, invNormal, normalCdf } from './_shared'

type EffectMode = 'relative' | 'absolute'

interface Design {
  p1: number
  p2: number
  delta: number
  nPerVariant: number
  days: number
  zAlpha: number
  zBeta: number
}

function sampleSize(p1: number, delta: number, alpha: number, power: number, traffic: number, split: number): Design {
  const p2 = clamp(p1 + delta, 1e-5, 0.99999)
  const actualDelta = Math.abs(p2 - p1)
  const pbar = (p1 + p2) / 2
  const zAlpha = invNormal(1 - alpha / 2)
  const zBeta = invNormal(power)
  const numerator = zAlpha * Math.sqrt(2 * pbar * (1 - pbar)) + zBeta * Math.sqrt(p1 * (1 - p1) + p2 * (1 - p2))
  const nPerVariant = Math.ceil((numerator / Math.max(actualDelta, 1e-6)) ** 2)
  const days = Math.max(nPerVariant / Math.max(1, traffic * split), nPerVariant / Math.max(1, traffic * (1 - split)))
  return { p1, p2, delta: actualDelta, nPerVariant, days, zAlpha, zBeta }
}

function zTest(aVisitors: number, aConversions: number, bVisitors: number, bConversions: number, alpha: number) {
  const pA = aVisitors > 0 ? aConversions / aVisitors : 0
  const pB = bVisitors > 0 ? bConversions / bVisitors : 0
  const pooled = (aConversions + bConversions) / Math.max(1, aVisitors + bVisitors)
  const sePooled = Math.sqrt(pooled * (1 - pooled) * (1 / Math.max(1, aVisitors) + 1 / Math.max(1, bVisitors)))
  const z = sePooled === 0 ? 0 : (pB - pA) / sePooled
  const pValue = 2 * (1 - normalCdf(Math.abs(z)))
  const se = Math.sqrt((pA * (1 - pA)) / Math.max(1, aVisitors) + (pB * (1 - pB)) / Math.max(1, bVisitors))
  const margin = invNormal(1 - alpha / 2) * se
  const diff = pB - pA
  return { pA, pB, diff, z, pValue, ciLow: diff - margin, ciHigh: diff + margin, significant: pValue < alpha && (diff - margin > 0 || diff + margin < 0) }
}

function normalPdf(x: number, mean: number, sd: number): number {
  return Math.exp(-0.5 * ((x - mean) / sd) ** 2) / (sd * Math.sqrt(2 * Math.PI))
}

function DistributionPlot({ design, alpha }: { design: Design; alpha: number }) {
  const width = 760
  const height = 240
  const sdA = Math.sqrt((design.p1 * (1 - design.p1)) / design.nPerVariant)
  const sdB = Math.sqrt((design.p2 * (1 - design.p2)) / design.nPerVariant)
  const minX = Math.max(0, Math.min(design.p1 - 4 * sdA, design.p2 - 4 * sdB))
  const maxX = Math.min(1, Math.max(design.p1 + 4 * sdA, design.p2 + 4 * sdB))
  const xScale = (x: number) => 55 + ((x - minX) / (maxX - minX)) * 650
  const maxY = Math.max(normalPdf(design.p1, design.p1, sdA), normalPdf(design.p2, design.p2, sdB))
  const yScale = (y: number) => 198 - (y / maxY) * 150
  const makePath = (mean: number, sd: number) =>
    Array.from({ length: 90 }, (_, i) => {
      const x = minX + (i / 89) * (maxX - minX)
      return `${i === 0 ? 'M' : 'L'} ${xScale(x).toFixed(1)} ${yScale(normalPdf(x, mean, sd)).toFixed(1)}`
    }).join(' ')
  const critical = design.p1 + invNormal(1 - alpha / 2) * Math.sqrt((2 * design.p1 * (1 - design.p1)) / design.nPerVariant)
  const criticalX = xScale(clamp(critical, minX, maxX))

  return (
    <svg viewBox={`0 0 ${width} ${height}`} className="h-auto w-full rounded-2xl border border-line bg-panel/80">
      <path d={`M ${criticalX} 198 L 705 198 L 705 48 C ${criticalX + 120} 88 ${criticalX + 50} 162 ${criticalX} 198 Z`} fill={C.warn} opacity="0.12" />
      <path d={makePath(design.p1, sdA)} fill="none" stroke={C.accent} strokeWidth="3" />
      <path d={makePath(design.p2, sdB)} fill="none" stroke={C.ok} strokeWidth="3" />
      <line x1="55" x2="705" y1="198" y2="198" stroke={C.lineStrong} />
      <line x1={criticalX} x2={criticalX} y1="42" y2="202" stroke={C.warn} strokeDasharray="5 7" />
      <text x="55" y="28" fill={C.fg} fontSize="14" fontWeight="700">
        Sampling distributions
      </text>
      <text x="55" y="48" fill={C.muted} fontSize="12">
        Required n separates baseline and MDE with requested α and power.
      </text>
      <text x={xScale(design.p1)} y="218" textAnchor="middle" fill={C.accent} fontSize="11">
        A {(design.p1 * 100).toFixed(1)}%
      </text>
      <text x={xScale(design.p2)} y="218" textAnchor="middle" fill={C.ok} fontSize="11">
        B {(design.p2 * 100).toFixed(1)}%
      </text>
      <text x={criticalX + 8} y="66" fill={C.warn} fontSize="11">
        critical region
      </text>
    </svg>
  )
}

function NumberInput({ label, value, onChange }: { label: string; value: number; onChange: (v: number) => void }) {
  return (
    <label className="flex flex-col gap-1 text-xs text-muted">
      {label}
      <input type="number" value={value} onChange={(e) => onChange(Number(e.target.value))} className="h-9 rounded-lg border border-line bg-panel px-3 text-sm text-fg outline-none focus:ring-2 focus:ring-accent/40" />
    </label>
  )
}

export default function AbTest() {
  const [baseline, setBaseline] = useState(8)
  const [effectMode, setEffectMode] = useState<EffectMode>('relative')
  const [mde, setMde] = useState(12)
  const [alpha, setAlpha] = useState('0.05')
  const [power, setPower] = useState(0.8)
  const [traffic, setTraffic] = useState(60_000)
  const [split, setSplit] = useState(0.5)
  const [aVisitors, setAVisitors] = useState(24_000)
  const [aConversions, setAConversions] = useState(1920)
  const [bVisitors, setBVisitors] = useState(24_000)
  const [bConversions, setBConversions] = useState(2140)

  const alphaNumber = Number(alpha)
  const delta = effectMode === 'relative' ? (baseline / 100) * (mde / 100) : mde / 100
  const design = useMemo(() => sampleSize(baseline / 100, delta, alphaNumber, power, traffic, split), [alphaNumber, baseline, delta, power, split, traffic])
  const observed = useMemo(() => zTest(aVisitors, aConversions, bVisitors, bConversions, alphaNumber), [aConversions, aVisitors, alphaNumber, bConversions, bVisitors])

  return (
    <VizFrame
      title="A/B test calculator"
      description="Plan a two-proportion experiment, then evaluate observed conversion data with z-test statistics."
      controls={
        <>
          <Slider label="baseline CR" value={baseline} min={0.5} max={40} step={0.1} onChange={setBaseline} format={(v) => `${v.toFixed(1)}%`} className="w-40" />
          <Segmented value={effectMode} onChange={setEffectMode} options={[{ value: 'relative', label: 'relative MDE' }, { value: 'absolute', label: 'absolute MDE' }]} />
          <Select value={alpha} onChange={setAlpha} options={[{ value: '0.10', label: 'α 0.10' }, { value: '0.05', label: 'α 0.05' }, { value: '0.01', label: 'α 0.01' }]} />
        </>
      }
      caption={`Need ${formatCompact(design.nPerVariant, 1)} visitors/variant for ${(design.delta * 100).toFixed(2)}pp lift; duration ≈ ${design.days.toFixed(1)} days at ${formatCompact(traffic, 1)}/day.`}
      legend={[
        { color: C.accent, label: 'control' },
        { color: C.ok, label: 'variant at MDE' },
        { color: C.warn, label: 'critical region' },
      ]}
    >
      <div className="space-y-4">
        <div className="grid gap-4 lg:grid-cols-[.9fr_1.1fr]">
          <div className="rounded-2xl border border-line bg-panel/80 p-4">
            <div className="mb-3 text-sm font-semibold text-fg">Experiment design</div>
            <div className="grid gap-3 sm:grid-cols-2">
              <Slider label={effectMode === 'relative' ? 'MDE relative' : 'MDE absolute'} value={mde} min={effectMode === 'relative' ? 1 : 0.1} max={effectMode === 'relative' ? 50 : 10} step={effectMode === 'relative' ? 1 : 0.1} onChange={setMde} format={(v) => (effectMode === 'relative' ? `${v.toFixed(0)}%` : `${v.toFixed(1)}pp`)} />
              <Slider label="power" value={power} min={0.7} max={0.95} step={0.01} onChange={setPower} format={(v) => `${Math.round(v * 100)}%`} />
              <Slider label="traffic / day" value={traffic} min={1_000} max={500_000} step={1_000} onChange={setTraffic} format={(v) => formatCompact(v, 0)} />
              <Slider label="traffic split to A" value={split} min={0.1} max={0.9} step={0.05} onChange={setSplit} format={(v) => `${Math.round(v * 100)}%`} />
            </div>
            <div className="mt-4 grid gap-3 sm:grid-cols-3">
              <div className="rounded-xl bg-subtle p-3">
                <div className="text-xs text-muted">Sample / variant</div>
                <div className="text-2xl font-semibold text-fg">{formatCompact(design.nPerVariant, 1)}</div>
                <div className="font-mono text-[11px] text-muted">two-proportion z-test</div>
              </div>
              <div className="rounded-xl bg-subtle p-3">
                <div className="text-xs text-muted">Duration</div>
                <div className="text-2xl font-semibold text-fg">{design.days.toFixed(1)}d</div>
                <div className="font-mono text-[11px] text-muted">n / traffic split</div>
              </div>
              <div className="rounded-xl bg-subtle p-3">
                <div className="text-xs text-muted">Target B CR</div>
                <div className="text-2xl font-semibold text-fg">{(design.p2 * 100).toFixed(2)}%</div>
                <div className="font-mono text-[11px] text-muted">baseline + MDE</div>
              </div>
            </div>
          </div>

          <DistributionPlot design={design} alpha={alphaNumber} />
        </div>

        <div className="grid gap-4 lg:grid-cols-[.9fr_1.1fr]">
          <div className="rounded-2xl border border-line bg-panel/80 p-4">
            <div className="mb-3 flex items-center justify-between gap-2">
              <div className="text-sm font-semibold text-fg">Observed result</div>
              <Badge tone={observed.significant ? 'ok' : 'warn'}>{observed.significant ? 'significant' : 'not significant'}</Badge>
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
              <NumberInput label="A visitors" value={aVisitors} onChange={setAVisitors} />
              <NumberInput label="A conversions" value={aConversions} onChange={setAConversions} />
              <NumberInput label="B visitors" value={bVisitors} onChange={setBVisitors} />
              <NumberInput label="B conversions" value={bConversions} onChange={setBConversions} />
            </div>
          </div>

          <div className="rounded-2xl border border-line bg-panel/80 p-4">
            <div className="mb-3 text-sm font-semibold text-fg">Statistics</div>
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              <motion.div layout className="rounded-xl bg-subtle p-3">
                <div className="text-xs text-muted">A conversion</div>
                <div className="text-xl font-semibold text-fg">{(observed.pA * 100).toFixed(2)}%</div>
              </motion.div>
              <motion.div layout className="rounded-xl bg-subtle p-3">
                <div className="text-xs text-muted">B conversion</div>
                <div className="text-xl font-semibold text-fg">{(observed.pB * 100).toFixed(2)}%</div>
              </motion.div>
              <motion.div layout className="rounded-xl bg-subtle p-3">
                <div className="text-xs text-muted">z-score</div>
                <div className="text-xl font-semibold text-fg">{observed.z.toFixed(2)}</div>
              </motion.div>
              <motion.div layout className="rounded-xl bg-subtle p-3">
                <div className="text-xs text-muted">p-value</div>
                <div className="text-xl font-semibold text-fg">{observed.pValue.toFixed(4)}</div>
              </motion.div>
              <motion.div layout className="rounded-xl bg-subtle p-3 sm:col-span-2">
                <div className="text-xs text-muted">95% CI absolute lift</div>
                <div className="text-xl font-semibold text-fg">
                  {(observed.ciLow * 100).toFixed(2)}pp to {(observed.ciHigh * 100).toFixed(2)}pp
                </div>
              </motion.div>
            </div>
          </div>
        </div>

        <div className="rounded-xl border border-line bg-subtle p-3 text-sm text-muted">
          <span className="font-semibold text-fg">Insight:</span> Avoid peeking and repeated segment checks: every unplanned look or multiple test inflates false positives unless α is adjusted or sequential methods are planned up front.
        </div>
      </div>
    </VizFrame>
  )
}
