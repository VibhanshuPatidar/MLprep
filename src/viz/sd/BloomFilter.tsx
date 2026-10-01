import { motion } from 'framer-motion'
import { Plus, Shuffle } from 'lucide-react'
import { useMemo, useState } from 'react'
import { Badge, Button, Slider } from '../../components/ui'
import { C, VizFrame, useSize } from '../common'
import { clamp, fnv1a32, formatCompact, hashIndex } from './_shared'

const WORDS = ['orca', 'mango', 'vector', 'cedar', 'nebula', 'pixel', 'falcon', 'yogurt', 'quartz', 'tulip', 'llama', 'saffron', 'ember', 'rocket', 'banyan', 'otter']

function indicesFor(value: string, k: number, m: number): number[] {
  const h1 = fnv1a32(`a:${value}`)
  const h2 = (fnv1a32(`b:${value}`) | 1) >>> 0
  return Array.from({ length: k }, (_, i) => (h1 + Math.imul(i + 1, h2) + i * i) % m)
}

function buildBits(items: readonly string[], k: number, m: number): boolean[] {
  const bits = Array.from({ length: m }, () => false)
  items.forEach((item) => indicesFor(item, k, m).forEach((index) => (bits[index] = true)))
  return bits
}

function theoreticalFpr(n: number, k: number, m: number): number {
  if (n === 0) return 0
  return (1 - Math.exp((-k * n) / m)) ** k
}

function empiricalFpr(items: readonly string[], bits: readonly boolean[], k: number, m: number): number {
  const set = new Set(items)
  let falsePositives = 0
  let tested = 0
  for (let i = 0; i < 240; i += 1) {
    const probe = `probe-${i}-${hashIndex(String(i), 999)}`
    if (set.has(probe)) continue
    tested += 1
    if (indicesFor(probe, k, m).every((index) => bits[index])) falsePositives += 1
  }
  return tested === 0 ? 0 : falsePositives / tested
}

function Metric({ label, value, sub }: { label: string; value: string; sub: string }) {
  return (
    <div className="rounded-xl border border-line bg-panel/80 p-3">
      <div className="text-xs text-muted">{label}</div>
      <div className="mt-1 text-2xl font-semibold text-fg">{value}</div>
      <div className="mt-1 text-xs text-muted">{sub}</div>
    </div>
  )
}

export default function BloomFilter() {
  const [m, setM] = useState(96)
  const [k, setK] = useState(4)
  const [items, setItems] = useState<string[]>(['orca', 'mango', 'vector', 'cedar'])
  const [text, setText] = useState('nebula')
  const [query, setQuery] = useState('otter')
  const [wordIndex, setWordIndex] = useState(4)
  const [wrapRef, size] = useSize<HTMLDivElement>()

  const bits = useMemo(() => buildBits(items, k, m), [items, k, m])
  const queryBits = query.trim() ? indicesFor(query.trim().toLowerCase(), k, m) : []
  const maybe = queryBits.length > 0 && queryBits.every((index) => bits[index])
  const setCount = bits.filter(Boolean).length
  const theory = theoreticalFpr(items.length, k, m)
  const empirical = empiricalFpr(items, bits, k, m)
  const optimal = items.length === 0 ? 1 : clamp((m / items.length) * Math.LN2, 1, 8)
  const cols = size.width < 560 ? 16 : m > 128 ? 32 : 24
  const addItem = (value: string) => {
    const normalized = value.trim().toLowerCase()
    if (!normalized) return
    setItems((current) => (current.includes(normalized) ? current : [...current, normalized]))
    setText('')
    setQuery(normalized)
  }
  const addRandom = () => {
    const word = WORDS[wordIndex % WORDS.length]
    setWordIndex((i) => i + 1)
    addItem(word)
  }

  const curve = Array.from({ length: 8 }, (_, i) => ({ kk: i + 1, fpr: theoreticalFpr(items.length, i + 1, m) }))
  const maxFpr = Math.max(0.001, ...curve.map((point) => point.fpr))
  const points = curve.map((point) => `${52 + (point.kk - 1) * 80},${150 - (point.fpr / maxFpr) * 112}`).join(' ')

  return (
    <VizFrame
      title="Bloom filter"
      description="A space-efficient set membership test: no false negatives, but possible false positives."
      controls={
        <>
          <Slider label="bit array m" value={m} min={16} max={256} step={8} onChange={setM} className="w-40" />
          <Slider label="hash functions k" value={k} min={1} max={8} onChange={setK} className="w-36" />
          <Button size="sm" variant="outline" onClick={addRandom}>
            <Shuffle size={14} /> Random word
          </Button>
        </>
      }
      caption={`n=${items.length}, m=${m}, k=${k} · theoretical FPR ${(theory * 100).toFixed(2)}%, empirical ${(empirical * 100).toFixed(2)}% · query “${query || '—'}” is ${maybe ? 'possibly present' : 'definitely absent'}.`}
      legend={[
        { color: C.accent, label: 'set bit' },
        { color: C.warn, label: 'checked by query' },
        { color: C.err, label: 'possible false positive' },
      ]}
    >
      <div ref={wrapRef} className="space-y-4">
        <div className="grid gap-3 md:grid-cols-4">
          <Metric label="Items inserted" value={formatCompact(items.length, 0)} sub={items.join(', ') || 'empty set'} />
          <Metric label="Bits set" value={`${setCount}/${m}`} sub={`${((setCount / m) * 100).toFixed(1)}% saturation`} />
          <Metric label="Theoretical FPR" value={`${(theory * 100).toFixed(2)}%`} sub="(1 − e^(−kn/m))^k" />
          <Metric label="Query verdict" value={maybe ? 'Maybe' : 'No'} sub={maybe ? 'all checked bits are 1' : 'at least one checked bit is 0'} />
        </div>

        <div className="grid gap-4 lg:grid-cols-[1.15fr_.85fr]">
          <div className="rounded-2xl border border-line bg-panel/80 p-4">
            <div className="mb-3 flex flex-wrap items-center justify-between gap-3">
              <div>
                <div className="text-sm font-semibold text-fg">Bit array</div>
                <div className="text-xs text-muted">Highlighted cells are the k positions checked by the query.</div>
              </div>
              <Badge tone={maybe ? 'warn' : 'ok'}>{maybe ? 'possible match' : 'definite miss'}</Badge>
            </div>
            <div className="grid gap-1" style={{ gridTemplateColumns: `repeat(${cols}, minmax(0, 1fr))` }}>
              {bits.map((bit, index) => {
                const checked = queryBits.includes(index)
                return (
                  <motion.div
                    key={index}
                    animate={{ scale: checked ? 1.08 : 1, opacity: bit || checked ? 1 : 0.55 }}
                    className="aspect-square rounded-md border text-[10px]"
                    style={{
                      background: bit ? C.accent : C.panel,
                      borderColor: checked ? C.warn : C.line,
                      boxShadow: checked ? `0 0 0 2px ${C.warn}` : undefined,
                    }}
                    title={`bit ${index}`}
                  />
                )
              })}
            </div>
          </div>

          <div className="space-y-3">
            <div className="rounded-2xl border border-line bg-panel/80 p-4">
              <div className="mb-3 text-sm font-semibold text-fg">Add / query</div>
              <div className="space-y-3">
                <div className="flex gap-2">
                  <input value={text} onChange={(e) => setText(e.target.value)} placeholder="item to add" className="h-9 min-w-0 flex-1 rounded-lg border border-line bg-panel px-3 text-sm text-fg outline-none placeholder:text-faint focus:ring-2 focus:ring-accent/40" />
                  <Button size="sm" variant="primary" onClick={() => addItem(text)}>
                    <Plus size={14} /> Add
                  </Button>
                </div>
                <label className="flex flex-col gap-1 text-xs text-muted">
                  query item
                  <input value={query} onChange={(e) => setQuery(e.target.value.toLowerCase())} className="h-9 rounded-lg border border-line bg-panel px-3 text-sm text-fg outline-none focus:ring-2 focus:ring-accent/40" />
                </label>
                <div className="rounded-lg bg-subtle p-3 font-mono text-xs text-muted">checked bits: [{queryBits.join(', ') || '—'}]</div>
              </div>
            </div>

            <div className="rounded-2xl border border-line bg-panel/80 p-4">
              <div className="mb-2 text-sm font-semibold text-fg">FPR vs k</div>
              <svg viewBox="0 0 660 180" className="h-auto w-full">
                <line x1="40" y1="150" x2="635" y2="150" stroke={C.lineStrong} />
                <line x1="40" y1="30" x2="40" y2="150" stroke={C.lineStrong} />
                <polyline points={points} fill="none" stroke={C.accent} strokeWidth="3" strokeLinejoin="round" strokeLinecap="round" />
                {curve.map((point) => {
                  const x = 52 + (point.kk - 1) * 80
                  const y = 150 - (point.fpr / maxFpr) * 112
                  return <circle key={point.kk} cx={x} cy={y} r={point.kk === k ? 6 : 4} fill={point.kk === k ? C.warn : C.accent} />
                })}
                <line x1={52 + (optimal - 1) * 80} x2={52 + (optimal - 1) * 80} y1="25" y2="154" stroke={C.ok} strokeDasharray="4 6" />
                <text x={52 + (optimal - 1) * 80 + 6} y="25" fill={C.ok} fontSize="11">
                  optimal k≈{optimal.toFixed(1)}
                </text>
                {curve.map((point) => (
                  <text key={point.kk} x={52 + (point.kk - 1) * 80} y="169" textAnchor="middle" fill={C.muted} fontSize="10">
                    {point.kk}
                  </text>
                ))}
              </svg>
            </div>
          </div>
        </div>

        <div className="rounded-xl border border-line bg-subtle p-3 text-sm text-muted">
          <span className="font-semibold text-fg">Insight:</span> More hash functions initially lower false positives, but too many overfill the bit array; the sweet spot is k≈(m/n)·ln2.
        </div>
      </div>
    </VizFrame>
  )
}
