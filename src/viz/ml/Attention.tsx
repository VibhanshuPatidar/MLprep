import { useMemo, useState } from 'react'
import { Badge, Segmented, Slider, Switch } from '../../components/ui'
import { C, VizFrame, useSize } from '../common'
import { dot, fmt, makeMatrix, matVec, seeded, softmax, svgHeat } from './_math2'

const DEFAULT_TEXT = 'the cat sat on the mat'
const D_MODEL = 6
const D_HEAD = 4
const HEADS = [0, 1, 2, 3] as const

type HeadIndex = (typeof HEADS)[number]

function hashToken(token: string): number {
  let h = 2166136261
  for (let i = 0; i < token.length; i += 1) {
    h ^= token.charCodeAt(i)
    h = Math.imul(h, 16777619)
  }
  return h >>> 0
}

function embedding(token: string, index: number): number[] {
  const rng = seeded(hashToken(token) + index * 97 + 11)
  return Array.from({ length: D_MODEL }, (_, j) => Math.sin((hashToken(token) % 997) * (j + 1) * 0.007) + (rng() - 0.5) * 0.9)
}

function projections(head: HeadIndex): { wq: number[][]; wk: number[][]; wv: number[][] } {
  const rng = seeded(311 + head * 1049)
  const scale = 1 / Math.sqrt(D_MODEL)
  return { wq: makeMatrix(D_HEAD, D_MODEL, rng, scale), wk: makeMatrix(D_HEAD, D_MODEL, rng, scale), wv: makeMatrix(D_HEAD, D_MODEL, rng, scale) }
}

function tokenize(text: string): string[] {
  const tokens = text.trim().split(/\s+/).filter(Boolean).slice(0, 10)
  return tokens.length ? tokens : DEFAULT_TEXT.split(' ')
}

export default function Attention() {
  const [text, setText] = useState(DEFAULT_TEXT)
  const [head, setHead] = useState<HeadIndex>(0)
  const [causal, setCausal] = useState(false)
  const [scaled, setScaled] = useState(true)
  const [temperature, setTemperature] = useState(1)
  const [hovered, setHovered] = useState(2)
  const [containerRef, size] = useSize<HTMLDivElement>()

  const model = useMemo(() => {
    const tokens = tokenize(text)
    const e = tokens.map(embedding)
    const p = projections(head)
    const q = e.map((v) => matVec(p.wq, v))
    const k = e.map((v) => matVec(p.wk, v))
    const values = e.map((v) => matVec(p.wv, v))
    const scale = scaled ? Math.sqrt(D_HEAD) : 1
    const scores = q.map((qi, i) => k.map((kj, j) => (causal && j > i ? -Infinity : dot(qi, kj) / scale)))
    const weights = scores.map((row) => softmax(row, temperature))
    const contexts = weights.map((row) => Array.from({ length: D_HEAD }, (_, d) => row.reduce((s, w, j) => s + w * values[j][d], 0)))
    return { tokens, scores, weights, contexts }
  }, [causal, head, scaled, temperature, text])

  const n = model.tokens.length
  const row = Math.min(hovered, n - 1)
  const rowWeights = model.weights[row] ?? []
  const entropy = -rowWeights.reduce((s, w) => (w > 0 ? s + w * Math.log2(w) : s), 0)
  const topIndex = rowWeights.reduce((best, w, i) => (w > rowWeights[best] ? i : best), 0)
  const contextNorm = Math.hypot(...(model.contexts[row] ?? [0]))
  const maxScore = Math.max(...model.scores.flat().filter(Number.isFinite), 1)
  const minScore = Math.min(...model.scores.flat().filter(Number.isFinite), -1)
  const arcWidth = Math.max(300, size.width)
  const pad = 34
  const usable = Math.max(1, arcWidth - pad * 2)
  const xs = model.tokens.map((_, i) => pad + (n === 1 ? usable / 2 : (usable * i) / (n - 1)))
  const caption = `Head ${head + 1}: “${model.tokens[row]}” attends most to “${model.tokens[topIndex]}” (${fmt(rowWeights[topIndex] * 100, 1)}%). entropy=${fmt(entropy, 2)}, context‖·‖=${fmt(contextNorm, 2)}`

  const heatmap = (matrix: number[][], weights: boolean) => (
    <div className="overflow-x-auto rounded-xl border border-line bg-panel p-3">
      <div className="mb-2 flex items-center justify-between gap-2">
        <span className="text-xs font-semibold text-fg">{weights ? 'Softmax attention weights' : 'QKᵀ scores'}</span>
        <Badge tone={weights ? 'ok' : 'accent'}>{weights ? 'rows sum to 1' : scaled ? '/√d' : 'unscaled'}</Badge>
      </div>
      <div className="grid min-w-max gap-1" style={{ gridTemplateColumns: `72px repeat(${n}, 44px)` }}>
        <div />
        {model.tokens.map((token, i) => (
          <div key={`h-${token}-${i}`} className="truncate text-center text-[10px] text-muted" title={token}>
            {token}
          </div>
        ))}
        {matrix.map((r, i) => (
          <div key={`r-${i}`} className="contents">
            <button className="truncate rounded-md px-1 text-right text-[10px] text-muted hover:text-fg" onMouseEnter={() => setHovered(i)} type="button">
              {model.tokens[i]}
            </button>
            {r.map((v, j) => {
              const finite = Number.isFinite(v)
              const t = weights ? v : finite ? (v - minScore) / Math.max(maxScore - minScore, 1e-9) : 0
              return (
                <button
                  key={`${i}-${j}`}
                  type="button"
                  onMouseEnter={() => setHovered(i)}
                  className="h-10 rounded-lg border border-line text-[10px] font-mono text-fg shadow-sm transition-transform hover:scale-105"
                  style={{ background: finite ? svgHeat(t, weights ? 'var(--viz-3)' : 'var(--viz-1)') : 'var(--line)' }}
                  title={`${model.tokens[i]} → ${model.tokens[j]}: ${finite ? fmt(v, 3) : 'masked'}`}
                >
                  {finite ? (weights ? fmt(v, 2) : fmt(v, 1)) : '—'}
                </button>
              )
            })}
          </div>
        ))}
      </div>
    </div>
  )

  return (
    <VizFrame
      title="Self-Attention"
      description="Toy token embeddings are deterministically projected into Q, K and V; compare raw dot-products with normalized attention."
      controls={
        <>
          <label className="flex min-w-64 flex-col gap-1 text-xs text-muted">
            Sentence
            <input
              value={text}
              onChange={(e) => setText(e.target.value)}
              className="h-8 rounded-lg border border-line bg-panel px-2 text-sm text-fg outline-none focus:ring-2 focus:ring-accent/40"
              aria-label="Sentence"
            />
          </label>
          <Segmented<HeadIndex> options={HEADS.map((h) => ({ value: h, label: `Head ${h + 1}` }))} value={head} onChange={setHead} />
          <Switch checked={causal} onChange={setCausal} label="causal mask" />
          <Switch checked={scaled} onChange={setScaled} label="divide by √d" />
          <Slider className="w-36" label="Temp" value={temperature} min={0.35} max={2.5} step={0.05} onChange={setTemperature} format={(v) => fmt(v, 2)} />
        </>
      }
      caption={caption}
      legend={[
        { color: C.accent, label: 'score intensity' },
        { color: C.ok, label: 'attention weight' },
      ]}
    >
      <div ref={containerRef} className="space-y-4">
        <div className="rounded-xl border border-line bg-panel/80 p-3">
          <div className="mb-2 flex flex-wrap items-center justify-between gap-2 text-xs text-muted">
            <span>Hover a query token/row to trace its distribution over keys.</span>
            <span className="font-mono">valid keys: {rowWeights.filter((w) => w > 1e-6).length}/{n}</span>
          </div>
          <svg width="100%" height="126" viewBox={`0 0 ${arcWidth} 126`} className="overflow-visible">
            {rowWeights.map((w, j) => {
              const x1 = xs[row] ?? pad
              const x2 = xs[j] ?? pad
              const mid = (x1 + x2) / 2
              const lift = 22 + Math.abs(x2 - x1) * 0.22
              return (
                <path
                  key={`arc-${j}`}
                  d={`M ${x1} 94 Q ${mid} ${Math.max(8, 94 - lift)} ${x2} 34`}
                  fill="none"
                  stroke={j === topIndex ? C.accent : C.muted}
                  strokeLinecap="round"
                  strokeWidth={1 + w * 9}
                  opacity={0.18 + w * 0.82}
                  style={{ transition: 'all .25s ease' }}
                />
              )
            })}
            {model.tokens.map((token, i) => (
              <g key={`tok-${i}`} transform={`translate(${xs[i]},0)`} onMouseEnter={() => setHovered(i)} className="cursor-pointer">
                <rect x="-28" y="12" width="56" height="24" rx="8" fill={i === topIndex ? C.accent : C.subtle} stroke={C.line} />
                <text y="28" textAnchor="middle" fontSize="10" fill={i === topIndex ? 'var(--accent-fg)' : C.fg}>
                  {token.slice(0, 8)}
                </text>
                <rect x="-28" y="82" width="56" height="24" rx="8" fill={i === row ? C.accent : C.panel} stroke={i === row ? C.accent : C.line} />
                <text y="98" textAnchor="middle" fontSize="10" fill={i === row ? 'var(--accent-fg)' : C.fg}>
                  {token.slice(0, 8)}
                </text>
              </g>
            ))}
            <text x="6" y="28" fontSize="10" fill={C.muted}>keys</text>
            <text x="6" y="98" fontSize="10" fill={C.muted}>query</text>
          </svg>
        </div>

        <div className="grid gap-4 lg:grid-cols-2">
          {heatmap(model.scores, false)}
          {heatmap(model.weights, true)}
        </div>

        <div className="grid gap-3 text-xs md:grid-cols-4">
          <div className="rounded-lg border border-line bg-panel p-3"><div className="text-muted">Top attention</div><div className="mt-1 font-mono text-lg text-fg">{fmt(rowWeights[topIndex] * 100, 1)}%</div></div>
          <div className="rounded-lg border border-line bg-panel p-3"><div className="text-muted">Entropy</div><div className="mt-1 font-mono text-lg text-fg">{fmt(entropy, 2)} bits</div></div>
          <div className="rounded-lg border border-line bg-panel p-3"><div className="text-muted">Scale</div><div className="mt-1 font-mono text-lg text-fg">{scaled ? `√${D_HEAD}` : '1'}</div></div>
          <div className="rounded-lg border border-line bg-panel p-3"><div className="text-muted">Insight</div><div className="mt-1 text-fg">Scaling keeps logits comparable so softmax avoids accidental saturation.</div></div>
        </div>
      </div>
    </VizFrame>
  )
}
