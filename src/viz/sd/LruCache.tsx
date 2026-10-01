import { motion } from 'framer-motion'
import { Database, Shuffle } from 'lucide-react'
import { useMemo, useState } from 'react'
import { Badge, Button, Segmented, Slider } from '../../components/ui'
import { C, VizFrame } from '../common'
import { formatCompact, hashIndex, mulberry } from './_shared'

type Policy = 'LRU' | 'LFU' | 'FIFO'
type OpType = 'get' | 'put'

interface Entry {
  key: string
  value: string
  freq: number
  inserted: number
  touched: number
}

interface Operation {
  type: OpType
  key: string
  value: string
}

interface CacheState {
  entries: Entry[]
  hits: number
  misses: number
  clock: number
  last: string
  evicted?: string
}

const POLICIES: Policy[] = ['LRU', 'LFU', 'FIFO']
const INITIAL: CacheState = {
  entries: [
    { key: 'A', value: 'img:42', freq: 3, inserted: 1, touched: 6 },
    { key: 'B', value: 'profile', freq: 2, inserted: 2, touched: 5 },
    { key: 'C', value: 'feed', freq: 1, inserted: 3, touched: 4 },
  ],
  hits: 7,
  misses: 2,
  clock: 7,
  last: 'Warm cache: most-recent item is at the head of the list.',
}

function orderEntries(entries: readonly Entry[], policy: Policy): Entry[] {
  const copy = [...entries]
  if (policy === 'LRU') return copy.sort((a, b) => b.touched - a.touched)
  if (policy === 'LFU') return copy.sort((a, b) => b.freq - a.freq || b.touched - a.touched)
  return copy.sort((a, b) => a.inserted - b.inserted)
}

function evictOne(entries: readonly Entry[], policy: Policy): { kept: Entry[]; evicted?: Entry } {
  if (entries.length === 0) return { kept: [] }
  let victim = entries[0]
  for (const entry of entries) {
    if (policy === 'LRU' && entry.touched < victim.touched) victim = entry
    if (policy === 'LFU' && (entry.freq < victim.freq || (entry.freq === victim.freq && entry.touched < victim.touched))) victim = entry
    if (policy === 'FIFO' && entry.inserted < victim.inserted) victim = entry
  }
  return { kept: entries.filter((entry) => entry.key !== victim.key), evicted: victim }
}

function trimCapacity(state: CacheState, capacity: number, policy: Policy): CacheState {
  let entries = state.entries
  let evicted: string | undefined
  while (entries.length > capacity) {
    const next = evictOne(entries, policy)
    entries = next.kept
    evicted = next.evicted?.key
  }
  return { ...state, entries: orderEntries(entries, policy), evicted, last: evicted ? `Capacity shrank: evicted ${evicted}.` : state.last }
}

function applyOperation(state: CacheState, op: Operation, capacity: number, policy: Policy): CacheState {
  const clock = state.clock + 1
  const existing = state.entries.find((entry) => entry.key === op.key)
  let entries = state.entries.map((entry) => ({ ...entry }))
  let hits = state.hits
  let misses = state.misses
  let last = ''
  let evicted: string | undefined

  if (op.type === 'get') {
    if (existing) {
      hits += 1
      entries = entries.map((entry) => (entry.key === op.key ? { ...entry, freq: entry.freq + 1, touched: clock } : entry))
      last = `GET ${op.key}: hit → ${policy === 'LRU' ? 'move to MRU head' : policy === 'LFU' ? 'increment frequency' : 'FIFO order unchanged'}.`
    } else {
      misses += 1
      last = `GET ${op.key}: miss → fetch from backing store before caching.`
    }
  } else if (existing) {
    hits += 1
    entries = entries.map((entry) => (entry.key === op.key ? { ...entry, value: op.value, freq: entry.freq + 1, touched: clock } : entry))
    last = `PUT ${op.key}: update existing value and refresh metadata.`
  } else {
    misses += 1
    entries.push({ key: op.key, value: op.value, freq: 1, inserted: clock, touched: clock })
    last = `PUT ${op.key}: insert new entry.`
  }

  while (entries.length > capacity) {
    const next = evictOne(entries, policy)
    entries = next.kept
    evicted = next.evicted?.key
  }
  if (evicted) last += ` Evicted ${evicted} by ${policy}.`

  return { entries: orderEntries(entries, policy), hits, misses, clock, last, evicted }
}

function buildWorkload(seed: number): Operation[] {
  const rng = mulberry(seed)
  const keys = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J']
  const weights = keys.map((_, i) => 1 / (i + 1) ** 1.1)
  const total = weights.reduce((acc, value) => acc + value, 0)
  return Array.from({ length: 70 }, (_, i) => {
    let r = rng() * total
    let index = 0
    while (r > weights[index] && index < weights.length - 1) {
      r -= weights[index]
      index += 1
    }
    const key = keys[index]
    return { type: rng() < 0.72 || i < 8 ? 'get' : 'put', key, value: `v${hashIndex(`${seed}:${i}:${key}`, 1000)}` }
  })
}

function simulatePolicy(policy: Policy, capacity: number, operations: readonly Operation[]): number {
  let state: CacheState = { entries: [], hits: 0, misses: 0, clock: 0, last: '' }
  operations.forEach((op) => {
    const applied = op.type === 'get' && !state.entries.some((entry) => entry.key === op.key) ? applyOperation(state, { ...op, type: 'put' }, capacity, policy) : applyOperation(state, op, capacity, policy)
    state = applied
  })
  const total = state.hits + state.misses
  return total === 0 ? 0 : state.hits / total
}

function displayLabel(policy: Policy): string {
  if (policy === 'LRU') return 'MRU → LRU'
  if (policy === 'LFU') return 'popular → cold'
  return 'oldest → newest'
}

export default function LruCache() {
  const [capacity, setCapacityRaw] = useState(4)
  const [policy, setPolicy] = useState<Policy>('LRU')
  const [cache, setCache] = useState<CacheState>(INITIAL)
  const [key, setKey] = useState('D')
  const [value, setValue] = useState('avatar')
  const [seed, setSeed] = useState(91)

  const workload = useMemo(() => buildWorkload(seed), [seed])
  const comparison = useMemo(() => POLICIES.map((p) => ({ policy: p, hitRate: simulatePolicy(p, capacity, workload) })), [capacity, workload])
  const total = cache.hits + cache.misses
  const hitRate = total === 0 ? 0 : cache.hits / total

  const setCapacity = (next: number) => {
    setCapacityRaw(next)
    setCache((state) => trimCapacity(state, next, policy))
  }
  const switchPolicy = (next: Policy) => {
    setPolicy(next)
    setCache((state) => ({ ...state, entries: orderEntries(state.entries, next), last: `Switched to ${next}: eviction order changed to ${displayLabel(next)}.` }))
  }
  const run = (type: OpType) => setCache((state) => applyOperation(state, { type, key: key.trim().toUpperCase() || 'A', value: value.trim() || 'value' }, capacity, policy))
  const randomOp = () => {
    const op = workload[hashIndex(`${seed}:${cache.clock}`, workload.length)]
    setCache((state) => applyOperation(state, op, capacity, policy))
  }
  const runWorkload = () => {
    const nextSeed = seed + 13
    const ops = buildWorkload(nextSeed)
    let state: CacheState = { entries: [], hits: 0, misses: 0, clock: 0, last: '' }
    ops.forEach((op) => {
      const applied = op.type === 'get' && !state.entries.some((entry) => entry.key === op.key) ? applyOperation(state, { ...op, type: 'put' }, capacity, policy) : applyOperation(state, op, capacity, policy)
      state = applied
    })
    setSeed(nextSeed)
    setCache({ ...state, last: `Ran ${ops.length} zipf-like operations; hot keys dominate the request stream.` })
  }

  return (
    <VizFrame
      title="LRU / LFU / FIFO cache"
      description="A hash map points into an eviction-ordered list; cache hits update metadata before eviction decisions."
      controls={
        <>
          <Slider label="capacity" value={capacity} min={2} max={8} onChange={setCapacity} className="w-36" />
          <Segmented value={policy} onChange={switchPolicy} options={POLICIES.map((p) => ({ value: p, label: p }))} />
          <Button size="sm" variant="outline" onClick={randomOp}>
            <Shuffle size={14} /> Random op
          </Button>
          <Button size="sm" variant="primary" onClick={runWorkload}>
            Run zipf workload
          </Button>
        </>
      }
      caption={`${cache.last} Hit rate ${(hitRate * 100).toFixed(1)}% across ${formatCompact(total, 0)} operations.`}
      legend={[
        { color: C.accent, label: displayLabel(policy) },
        { color: C.ok, label: 'hit' },
        { color: C.err, label: 'miss / evict' },
      ]}
    >
      <div className="space-y-4">
        <div className="grid gap-3 md:grid-cols-[1.2fr_.8fr]">
          <div className="rounded-2xl border border-line bg-panel/80 p-4">
            <div className="mb-3 flex flex-wrap items-center justify-between gap-3">
              <div>
                <div className="text-sm font-semibold text-fg">Doubly-linked list</div>
                <div className="text-xs text-muted">{displayLabel(policy)} · animated reordering with framer-motion layout</div>
              </div>
              {cache.evicted && <Badge tone="err">evicted {cache.evicted}</Badge>}
            </div>
            <div className="flex min-h-32 flex-wrap items-center gap-2">
              {cache.entries.map((entry, index) => (
                <motion.div
                  layout
                  key={entry.key}
                  initial={false}
                  animate={{ scale: 1, opacity: 1, y: 0 }}
                  transition={{ type: 'spring', stiffness: 260, damping: 24 }}
                  className="relative min-w-28 rounded-xl border border-line bg-subtle p-3"
                >
                  <div className="flex items-center justify-between gap-2">
                    <span className="font-mono text-lg font-semibold text-fg">{entry.key}</span>
                    <Badge tone={index === 0 ? 'accent' : 'neutral'}>{index === 0 ? 'head' : `#${index + 1}`}</Badge>
                  </div>
                  <div className="mt-1 truncate text-xs text-muted">{entry.value}</div>
                  <div className="mt-3 grid grid-cols-2 gap-2 text-[11px] text-muted">
                    <span>freq {entry.freq}</span>
                    <span>t {entry.touched}</span>
                  </div>
                </motion.div>
              ))}
              {cache.entries.length === 0 && <div className="rounded-xl border border-dashed border-line p-6 text-sm text-muted">Cache is empty. PUT a key to populate it.</div>}
            </div>
          </div>

          <div className="rounded-2xl border border-line bg-panel/80 p-4">
            <div className="mb-3 flex items-center gap-2 text-sm font-semibold text-fg">
              <Database size={16} className="text-accent" /> Hash map side panel
            </div>
            <div className="space-y-2">
              {cache.entries.map((entry, index) => (
                <div key={entry.key} className="flex items-center justify-between rounded-lg border border-line bg-subtle px-3 py-2 text-sm">
                  <span className="font-mono text-fg">map[{entry.key}]</span>
                  <span className="text-muted">→ node #{index + 1}</span>
                </div>
              ))}
            </div>
            <div className="mt-4 grid grid-cols-2 gap-2 text-xs">
              <div className="rounded-lg bg-subtle p-3">
                <div className="text-muted">Hits</div>
                <div className="text-xl font-semibold text-ok">{cache.hits}</div>
              </div>
              <div className="rounded-lg bg-subtle p-3">
                <div className="text-muted">Misses</div>
                <div className="text-xl font-semibold text-err">{cache.misses}</div>
              </div>
            </div>
          </div>
        </div>

        <div className="grid gap-3 md:grid-cols-[.9fr_1.1fr]">
          <div className="rounded-2xl border border-line bg-panel/80 p-4">
            <div className="mb-3 text-sm font-semibold text-fg">Manual operation</div>
            <div className="flex flex-wrap items-end gap-2">
              <label className="flex flex-col gap-1 text-xs text-muted">
                key
                <input value={key} onChange={(e) => setKey(e.target.value)} className="h-9 w-24 rounded-lg border border-line bg-panel px-3 text-sm text-fg outline-none focus:ring-2 focus:ring-accent/40" />
              </label>
              <label className="flex flex-col gap-1 text-xs text-muted">
                value
                <input value={value} onChange={(e) => setValue(e.target.value)} className="h-9 w-32 rounded-lg border border-line bg-panel px-3 text-sm text-fg outline-none focus:ring-2 focus:ring-accent/40" />
              </label>
              <Button size="sm" variant="outline" onClick={() => run('get')}>
                GET
              </Button>
              <Button size="sm" variant="primary" onClick={() => run('put')}>
                PUT
              </Button>
            </div>
          </div>

          <div className="rounded-2xl border border-line bg-panel/80 p-4">
            <div className="mb-3 text-sm font-semibold text-fg">Hit-rate comparison on same zipf workload</div>
            <div className="space-y-3">
              {comparison.map((row) => (
                <div key={row.policy} className="grid grid-cols-[48px_1fr_52px] items-center gap-3 text-sm">
                  <span className="font-mono text-muted">{row.policy}</span>
                  <div className="h-3 overflow-hidden rounded-full bg-line">
                    <motion.div initial={false} animate={{ width: `${row.hitRate * 100}%` }} className="h-full rounded-full" style={{ background: row.policy === policy ? C.accent : C.series[POLICIES.indexOf(row.policy)] }} />
                  </div>
                  <span className="text-right font-mono text-fg">{(row.hitRate * 100).toFixed(0)}%</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="rounded-xl border border-line bg-subtle p-3 text-sm text-muted">
          <span className="font-semibold text-fg">Insight:</span> LRU wins when recent access predicts reuse, LFU wins with stable popularity, and FIFO is simplest but ignores both recency and frequency.
        </div>
      </div>
    </VizFrame>
  )
}
