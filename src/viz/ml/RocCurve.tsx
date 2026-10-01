import { useMemo, useState } from 'react'
import { Badge, Slider } from '../../components/ui'
import { C, VizFrame, useSize } from '../common'
import { clamp, formatNum, linePath, normalCdf, normalPdf } from './_math1'

interface Rates {
  tp: number
  fp: number
  tn: number
  fn: number
  tpr: number
  fpr: number
  precision: number
  recall: number
  f1: number
  accuracy: number
}

function metrics(threshold: number, mu0: number, mu1: number, sigma: number, prevalence: number): Rates {
  const tpr = clamp(1 - normalCdf(threshold, mu1, sigma), 0, 1)
  const fpr = clamp(1 - normalCdf(threshold, mu0, sigma), 0, 1)
  const tp = prevalence * tpr
  const fn = prevalence * (1 - tpr)
  const fp = (1 - prevalence) * fpr
  const tn = (1 - prevalence) * (1 - fpr)
  const precision = tp + fp === 0 ? 1 : tp / (tp + fp)
  const recall = tpr
  const f1 = precision + recall === 0 ? 0 : (2 * precision * recall) / (precision + recall)
  return { tp, fp, tn, fn, tpr, fpr, precision, recall, f1, accuracy: tp + tn }
}

function trapezoid(points: readonly { x: number; y: number }[]): number {
  let area = 0
  for (let i = 1; i < points.length; i += 1) area += ((points[i].y + points[i - 1].y) / 2) * Math.max(0, points[i].x - points[i - 1].x)
  return area
}

export default function RocCurve() {
  const [separation, setSeparation] = useState(0.48)
  const [prevalence, setPrevalence] = useState(0.18)
  const [threshold, setThreshold] = useState(0.55)
  const [wrapRef, size] = useSize<HTMLDivElement>()
  const sigma = 0.16
  const mu0 = 0.5 - separation / 2
  const mu1 = 0.5 + separation / 2
  const rate = useMemo(() => metrics(threshold, mu0, mu1, sigma, prevalence), [threshold, mu0, mu1, prevalence])
  const curves = useMemo(() => {
    const thresholds = Array.from({ length: 130 }, (_, i) => 1.15 - (i / 129) * 1.3)
    const roc = thresholds.map((t) => {
      const r = metrics(t, mu0, mu1, sigma, prevalence)
      return { x: r.fpr, y: r.tpr }
    }).sort((a, b) => a.x - b.x)
    const prRaw = thresholds.map((t) => {
      const r = metrics(t, mu0, mu1, sigma, prevalence)
      return { x: r.recall, y: r.precision }
    }).sort((a, b) => a.x - b.x)
    const auc = trapezoid(roc)
    let ap = 0
    for (let i = 1; i < prRaw.length; i += 1) ap += Math.max(0, prRaw[i].x - prRaw[i - 1].x) * prRaw[i].y
    return { roc, pr: prRaw, auc, ap }
  }, [mu0, mu1, prevalence])
  const w = Math.max(320, size.width)
  const wide = w >= 820
  const chartW = wide ? (w - 18) / 2 : w
  const distH = 150
  const chartH = 240
  const distPoints0 = Array.from({ length: 160 }, (_, i) => {
    const x = i / 159
    return { x, y: normalPdf(x, mu0, sigma) * (1 - prevalence) }
  })
  const distPoints1 = Array.from({ length: 160 }, (_, i) => {
    const x = i / 159
    return { x, y: normalPdf(x, mu1, sigma) * prevalence }
  })
  const maxPdf = Math.max(...distPoints0.map((p) => p.y), ...distPoints1.map((p) => p.y))
  const dsx = (x: number) => 32 + x * (w - 64)
  const dsy = (y: number) => distH - 20 - (y / maxPdf) * (distH - 36)
  const csx = (x: number) => 34 + x * (chartW - 58)
  const csy = (y: number) => 18 + (1 - y) * (chartH - 52)
  const n = 1000
  const insight = prevalence < 0.15 ? 'Insight: with rare positives, ROC AUC can look strong while precision stays low; PR curves expose false positives.' : 'Insight: ROC shows ranking quality across thresholds; PR emphasizes positive-class usefulness.'

  return (
    <VizFrame
      title="ROC, PR & Thresholds"
      description="Move the score threshold over two Gaussian class-conditional score distributions and watch operating metrics change."
      controls={
        <>
          <Slider className="w-44" label="separation Δμ" min={0.12} max={0.78} step={0.01} value={separation} onChange={setSeparation} format={(v) => formatNum(v, 2)} />
          <Slider className="w-44" label="positive rate" min={0.02} max={0.5} step={0.01} value={prevalence} onChange={setPrevalence} format={(v) => `${(100 * v).toFixed(0)}%`} />
          <Slider className="w-44" label="threshold" min={0} max={1} step={0.01} value={threshold} onChange={setThreshold} format={(v) => formatNum(v, 2)} />
          <Badge tone="accent">AUC {formatNum(curves.auc, 3)}</Badge>
          <Badge tone="info">AP {formatNum(curves.ap, 3)}</Badge>
        </>
      }
      caption={<div><div>threshold={formatNum(threshold, 2)} → precision={formatNum(rate.precision, 3)}, recall={formatNum(rate.recall, 3)}, FPR={formatNum(rate.fpr, 3)}, F1={formatNum(rate.f1, 3)}, accuracy={formatNum(rate.accuracy, 3)}.</div><div className="text-accent">{insight}</div></div>}
      legend={[{ color: C.series[0], label: 'negative scores' }, { color: C.series[1], label: 'positive scores' }, { color: C.accent, label: 'threshold / operating point' }]}
    >
      <div ref={wrapRef} className="grid gap-3">
        <div className="rounded-xl border border-line bg-panel p-3">
          <div className="mb-2 text-xs text-muted">Score distributions (area reflects class prevalence)</div>
          <svg viewBox={`0 0 ${w} ${distH}`} className="h-40 w-full overflow-visible">
            <line x1="32" x2={w - 32} y1={distH - 20} y2={distH - 20} stroke={C.line} />
            <path d={`${linePath(distPoints0, dsx, dsy)} L ${dsx(1)} ${distH - 20} L ${dsx(0)} ${distH - 20} Z`} fill={C.series[0]} opacity="0.18" />
            <path d={linePath(distPoints0, dsx, dsy)} fill="none" stroke={C.series[0]} strokeWidth="2.3" />
            <path d={`${linePath(distPoints1, dsx, dsy)} L ${dsx(1)} ${distH - 20} L ${dsx(0)} ${distH - 20} Z`} fill={C.series[1]} opacity="0.18" />
            <path d={linePath(distPoints1, dsx, dsy)} fill="none" stroke={C.series[1]} strokeWidth="2.3" />
            <line x1={dsx(threshold)} x2={dsx(threshold)} y1="12" y2={distH - 20} stroke={C.accent} strokeWidth="2.5" strokeDasharray="5 4" />
            <text x={dsx(threshold) + 5} y="22" fill={C.accent} fontSize="11">threshold</text>
          </svg>
        </div>
        <div className="grid gap-3 lg:grid-cols-[1fr_1fr_230px]">
          <div className="rounded-xl border border-line bg-panel p-3">
            <div className="mb-2 flex items-center justify-between text-xs text-muted"><span>ROC curve</span><Badge tone="accent">AUC {formatNum(curves.auc, 3)}</Badge></div>
            <svg viewBox={`0 0 ${chartW} ${chartH}`} className="h-64 w-full overflow-visible">
              <line x1="34" x2={chartW - 24} y1={chartH - 34} y2={chartH - 34} stroke={C.line} />
              <line x1="34" x2="34" y1="18" y2={chartH - 34} stroke={C.line} />
              <path d={`M ${csx(0)} ${csy(0)} L ${csx(1)} ${csy(1)}`} stroke={C.lineStrong} strokeDasharray="4 4" />
              <path d={linePath(curves.roc, csx, csy)} fill="none" stroke={C.accent} strokeWidth="2.8" />
              <circle cx={csx(rate.fpr)} cy={csy(rate.tpr)} r="5.5" fill={C.accent} stroke={C.panel} strokeWidth="1.5" />
              <text x="36" y={chartH - 10} fill={C.muted} fontSize="11">FPR</text>
              <text x="8" y="24" fill={C.muted} fontSize="11">TPR</text>
            </svg>
          </div>
          <div className="rounded-xl border border-line bg-panel p-3">
            <div className="mb-2 flex items-center justify-between text-xs text-muted"><span>Precision–Recall curve</span><Badge tone="info">AP {formatNum(curves.ap, 3)}</Badge></div>
            <svg viewBox={`0 0 ${chartW} ${chartH}`} className="h-64 w-full overflow-visible">
              <line x1="34" x2={chartW - 24} y1={chartH - 34} y2={chartH - 34} stroke={C.line} />
              <line x1="34" x2="34" y1="18" y2={chartH - 34} stroke={C.line} />
              <line x1="34" x2={chartW - 24} y1={csy(prevalence)} y2={csy(prevalence)} stroke={C.lineStrong} strokeDasharray="4 4" />
              <path d={linePath(curves.pr, csx, csy)} fill="none" stroke={C.info} strokeWidth="2.8" />
              <circle cx={csx(rate.recall)} cy={csy(rate.precision)} r="5.5" fill={C.info} stroke={C.panel} strokeWidth="1.5" />
              <text x="36" y={chartH - 10} fill={C.muted} fontSize="11">Recall</text>
              <text x="8" y="24" fill={C.muted} fontSize="11">Prec.</text>
            </svg>
          </div>
          <div className="rounded-xl border border-line bg-panel p-3 text-xs">
            <div className="mb-2 font-medium text-muted">Confusion matrix (per 1000)</div>
            <div className="grid grid-cols-2 gap-2">
              <div className="rounded-lg bg-ok/10 p-2"><div className="text-muted">TP</div><div className="font-mono text-fg">{Math.round(rate.tp * n)}</div></div>
              <div className="rounded-lg bg-err/10 p-2"><div className="text-muted">FP</div><div className="font-mono text-fg">{Math.round(rate.fp * n)}</div></div>
              <div className="rounded-lg bg-err/10 p-2"><div className="text-muted">FN</div><div className="font-mono text-fg">{Math.round(rate.fn * n)}</div></div>
              <div className="rounded-lg bg-ok/10 p-2"><div className="text-muted">TN</div><div className="font-mono text-fg">{Math.round(rate.tn * n)}</div></div>
            </div>
            <div className="mt-3 grid gap-1 font-mono text-[11px] text-muted">
              <div>precision {formatNum(rate.precision, 3)}</div>
              <div>recall {formatNum(rate.recall, 3)}</div>
              <div>FPR {formatNum(rate.fpr, 3)}</div>
              <div>F1 {formatNum(rate.f1, 3)}</div>
              <div>accuracy {formatNum(rate.accuracy, 3)}</div>
            </div>
          </div>
        </div>
      </div>
    </VizFrame>
  )
}
