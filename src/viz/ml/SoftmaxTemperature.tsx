import { useMemo, useState } from 'react'
import { Badge, Button, Slider } from '../../components/ui'
import { C, VizFrame, useSize } from '../common'
import { chooseIndex, entropy, formatNum, softmax } from './_math1'

interface TokenLogit {
  token: string
  logit: number
}

interface Distribution {
  base: number[]
  final: number[]
  kept: boolean[]
  keptCount: number
}

const initialTokens: TokenLogit[] = [
  { token: 'model', logit: 3.1 },
  { token: 'data', logit: 2.7 },
  { token: 'train', logit: 2.15 },
  { token: 'loss', logit: 1.5 },
  { token: 'token', logit: 1.05 },
  { token: 'matrix', logit: 0.55 },
  { token: 'banana', logit: -0.3 },
  { token: 'quantum', logit: -0.75 },
]

function filteredDistribution(logits: readonly number[], temperature: number, topK: number, topP: number): Distribution {
  const base = softmax(logits, temperature)
  const sorted = base.map((p, i) => ({ p, i })).sort((a, b) => b.p - a.p)
  const kept = Array.from({ length: logits.length }, () => false)
  let cumulative = 0
  for (let rank = 0; rank < sorted.length && rank < topK; rank += 1) {
    const item = sorted[rank]
    if (rank === 0 || cumulative < topP) {
      kept[item.i] = true
      cumulative += item.p
    }
  }
  const mass = base.reduce((s, p, i) => s + (kept[i] ? p : 0), 0) || 1
  const final = base.map((p, i) => (kept[i] ? p / mass : 0))
  return { base, final, kept, keptCount: kept.filter(Boolean).length }
}

export default function SoftmaxTemperature() {
  const [tokens, setTokens] = useState<TokenLogit[]>(initialTokens)
  const [temperature, setTemperature] = useState(0.9)
  const [topK, setTopK] = useState(8)
  const [topP, setTopP] = useState(0.92)
  const [hist, setHist] = useState<number[]>(Array.from({ length: initialTokens.length }, () => 0))
  const [lastDraws, setLastDraws] = useState<string[]>([])
  const [wrapRef, size] = useSize<HTMLDivElement>()
  const logits = tokens.map((t) => t.logit)
  const dist = useMemo(() => filteredDistribution(logits, temperature, topK, topP), [logits, temperature, topK, topP])
  const h = entropy(dist.final)
  const w = Math.max(320, size.width)
  const chartW = w >= 760 ? w - 280 : w
  const chartH = 300
  const maxP = Math.max(0.05, ...dist.final, ...dist.base.map((p, i) => (dist.kept[i] ? 0 : p)))
  const sample = () => {
    const counts = Array.from({ length: tokens.length }, () => 0)
    const draws: string[] = []
    for (let i = 0; i < 160; i += 1) {
      const idx = chooseIndex(dist.final, Math.random())
      counts[idx] += 1
      if (i < 18) draws.push(tokens[idx].token)
    }
    setHist(counts)
    setLastDraws(draws)
  }
  const updateLogit = (index: number, value: number) => {
    setTokens((prev) => prev.map((t, i) => (i === index ? { ...t, logit: Number.isFinite(value) ? value : 0 } : t)))
    setHist(Array.from({ length: tokens.length }, () => 0))
  }
  const reset = () => {
    setTokens(initialTokens)
    setHist(Array.from({ length: initialTokens.length }, () => 0))
    setLastDraws([])
  }
  const insight = temperature < 0.6 ? 'Insight: low temperature sharpens the distribution, making sampling deterministic and reducing entropy.' : temperature > 1.7 ? 'Insight: high temperature flattens probabilities, increasing diversity but also low-quality tokens.' : 'Insight: top-k/top-p truncate the tail, then renormalize probability mass over the surviving candidates.'

  return (
    <VizFrame
      title="Softmax Temperature & Sampling"
      description="Edit logits, apply temperature plus top-k/top-p filtering, then sample from the resulting token distribution."
      controls={
        <>
          <Slider className="w-40" label="temperature" min={0.1} max={3} step={0.05} value={temperature} onChange={setTemperature} format={(v) => formatNum(v, 2)} />
          <Slider className="w-32" label="top-k" min={1} max={tokens.length} step={1} value={topK} onChange={setTopK} />
          <Slider className="w-40" label="top-p" min={0.1} max={1} step={0.01} value={topP} onChange={setTopP} format={(v) => formatNum(v, 2)} />
          <Button size="sm" variant="primary" onClick={sample}>Sample 160</Button>
          <Button size="sm" variant="outline" onClick={reset}>Reset</Button>
          <Badge tone="accent">entropy {formatNum(h, 2)} bits</Badge>
          <Badge tone="info">kept {dist.keptCount}/{tokens.length}</Badge>
        </>
      }
      caption={<div><div>pᵢ = exp(logitᵢ / T) / Σⱼ exp(logitⱼ / T); T={formatNum(temperature, 2)}, top-k={topK}, top-p={formatNum(topP, 2)}, H={formatNum(h, 3)} bits.</div><div className="text-accent">{insight}</div></div>}
      legend={[{ color: C.accent, label: 'kept probability' }, { color: C.lineStrong, label: 'filtered tail' }, { color: C.series[2], label: 'sample histogram' }]}
    >
      <div ref={wrapRef} className="grid gap-3 lg:grid-cols-[minmax(0,1fr)_260px]">
        <div className="rounded-xl border border-line bg-panel p-3">
          <div className="mb-2 text-xs text-muted">Resulting probabilities (filtered tokens are greyed)</div>
          <svg viewBox={`0 0 ${chartW} ${chartH}`} className="h-[310px] w-full overflow-visible">
            <line x1="34" x2={chartW - 18} y1={chartH - 42} y2={chartH - 42} stroke={C.line} />
            <line x1="34" x2="34" y1="18" y2={chartH - 42} stroke={C.line} />
            {tokens.map((t, i) => {
              const gap = 8
              const bw = (chartW - 70 - gap * (tokens.length - 1)) / tokens.length
              const x = 40 + i * (bw + gap)
              const kept = dist.kept[i]
              const p = kept ? dist.final[i] : dist.base[i]
              const bh = (p / maxP) * (chartH - 72)
              const sampleH = hist[i] ? (hist[i] / Math.max(...hist)) * 54 : 0
              return (
                <g key={t.token}>
                  <rect x={x} y={chartH - 42 - bh} width={bw} height={bh} rx="5" fill={kept ? C.accent : C.lineStrong} opacity={kept ? 0.9 : 0.45} />
                  <rect x={x} y={chartH - 42 - sampleH} width={bw} height={sampleH} rx="5" fill={C.series[2]} opacity="0.48" />
                  <text x={x + bw / 2} y={chartH - 23} textAnchor="middle" fill={kept ? C.fg : C.muted} fontSize="10">{t.token}</text>
                  <text x={x + bw / 2} y={chartH - 56 - bh} textAnchor="middle" fill={kept ? C.accent : C.muted} fontSize="10">{formatNum(dist.final[i], 2)}</text>
                </g>
              )
            })}
          </svg>
          {lastDraws.length > 0 && <div className="rounded-lg bg-subtle p-2 text-xs text-muted"><span className="font-medium text-fg">samples:</span> {lastDraws.join(' · ')}</div>}
        </div>
        <div className="grid gap-3">
          <div className="rounded-xl border border-line bg-panel p-3">
            <div className="mb-2 text-xs text-muted">Editable logits</div>
            <div className="space-y-2">
              {tokens.map((t, i) => (
                <label key={t.token} className="grid grid-cols-[62px_1fr_50px] items-center gap-2 text-xs">
                  <span className={dist.kept[i] ? 'text-fg' : 'text-muted'}>{t.token}</span>
                  <input type="range" min={-2} max={4} step={0.05} value={t.logit} onChange={(e) => updateLogit(i, Number(e.target.value))} className="h-1.5 cursor-pointer accent-[var(--accent)]" />
                  <input value={t.logit.toFixed(2)} onChange={(e) => updateLogit(i, Number(e.target.value))} className="h-7 rounded-md border border-line bg-panel px-1 text-right font-mono text-[11px] text-fg outline-none focus:ring-2 focus:ring-accent/40" />
                </label>
              ))}
            </div>
          </div>
          <div className="rounded-xl border border-line bg-panel p-3 text-xs">
            <div className="mb-2 font-medium text-muted">Top candidates</div>
            <div className="space-y-1 font-mono">
              {tokens.map((t, i) => ({ ...t, p: dist.final[i], kept: dist.kept[i] })).sort((a, b) => b.p - a.p).slice(0, 5).map((t) => <div key={t.token} className={t.kept ? 'text-fg' : 'text-muted'}>{t.token.padEnd(8, ' ')} {formatNum(t.p, 3)}</div>)}
            </div>
          </div>
        </div>
      </div>
    </VizFrame>
  )
}
