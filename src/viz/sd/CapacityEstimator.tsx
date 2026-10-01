import { motion } from 'framer-motion'
import { Calculator } from 'lucide-react'
import { useMemo, useState } from 'react'
import { Select, Slider } from '../../components/ui'
import { C, VizFrame } from '../common'
import { formatBandwidth, formatBytes, formatCompact } from './_shared'

type PresetId = 'shortener' | 'feed' | 'chat' | 'video'

interface Inputs {
  dauM: number
  actions: number
  readWrite: number
  payloadKB: number
  retentionYears: number
  replication: number
  peakFactor: number
  cacheHit: number
  serverQps: number
}

const PRESETS: Record<PresetId, { label: string; values: Inputs }> = {
  shortener: {
    label: 'URL shortener',
    values: { dauM: 8, actions: 12, readWrite: 80, payloadKB: 0.6, retentionYears: 5, replication: 3, peakFactor: 4, cacheHit: 0.92, serverQps: 2500 },
  },
  feed: {
    label: 'Twitter-like feed',
    values: { dauM: 35, actions: 55, readWrite: 25, payloadKB: 3, retentionYears: 3, replication: 3, peakFactor: 6, cacheHit: 0.85, serverQps: 1800 },
  },
  chat: {
    label: 'Chat app',
    values: { dauM: 18, actions: 140, readWrite: 6, payloadKB: 1.5, retentionYears: 7, replication: 3, peakFactor: 5, cacheHit: 0.65, serverQps: 2200 },
  },
  video: {
    label: 'Video upload',
    values: { dauM: 4, actions: 8, readWrite: 12, payloadKB: 750, retentionYears: 2, replication: 2, peakFactor: 8, cacheHit: 0.75, serverQps: 450 },
  },
}

interface ResultRow {
  label: string
  value: string
  formula: string
  tone?: 'accent' | 'ok' | 'warn'
}

function compute(inputs: Inputs): ResultRow[] {
  const dau = inputs.dauM * 1_000_000
  const totalActions = dau * inputs.actions
  const writeDaily = totalActions / (inputs.readWrite + 1)
  const readDaily = totalActions - writeDaily
  const avgReadQps = readDaily / 86_400
  const avgWriteQps = writeDaily / 86_400
  const peakReadQps = avgReadQps * inputs.peakFactor
  const peakWriteQps = avgWriteQps * inputs.peakFactor
  const payloadBytes = inputs.payloadKB * 1024
  const dailyStorage = writeDaily * payloadBytes
  const annualStorage = dailyStorage * 365
  const retainedStorage = annualStorage * inputs.retentionYears
  const replicatedStorage = retainedStorage * inputs.replication
  const peakIngress = peakWriteQps * payloadBytes
  const peakEgress = peakReadQps * payloadBytes
  const cacheMemory = retainedStorage * 0.2 * inputs.cacheHit
  const originQps = peakReadQps * (1 - inputs.cacheHit) + peakWriteQps
  const servers = Math.ceil(originQps / inputs.serverQps)

  return [
    { label: 'Avg read QPS', value: formatCompact(avgReadQps), formula: 'DAU × actions × read% / 86,400', tone: 'accent' },
    { label: 'Peak read QPS', value: formatCompact(peakReadQps), formula: 'avg read QPS × peak factor', tone: 'warn' },
    { label: 'Avg write QPS', value: formatCompact(avgWriteQps), formula: 'DAU × actions × write% / 86,400', tone: 'accent' },
    { label: 'Peak write QPS', value: formatCompact(peakWriteQps), formula: 'avg write QPS × peak factor', tone: 'warn' },
    { label: 'Daily storage', value: formatBytes(dailyStorage), formula: 'daily writes × payload size', tone: 'ok' },
    { label: 'Annual storage', value: formatBytes(annualStorage), formula: 'daily storage × 365', tone: 'ok' },
    { label: 'Total replicated storage', value: formatBytes(replicatedStorage), formula: 'annual × retention × replication', tone: 'warn' },
    { label: 'Peak ingress', value: formatBandwidth(peakIngress), formula: 'peak write QPS × payload', tone: 'accent' },
    { label: 'Peak egress', value: formatBandwidth(peakEgress), formula: 'peak read QPS × payload', tone: 'accent' },
    { label: 'Cache hot 20%', value: formatBytes(cacheMemory), formula: 'logical retained × 20% × hit ratio', tone: 'ok' },
    { label: 'App servers', value: `${servers}`, formula: '(peak misses + writes) / per-server QPS', tone: servers > 100 ? 'warn' : 'ok' },
  ]
}

function latencyLabel(ns: number): string {
  if (ns < 1_000) return `${ns.toFixed(ns < 10 ? 1 : 0)} ns`
  if (ns < 1_000_000) return `${(ns / 1_000).toFixed(ns < 10_000 ? 1 : 0)} µs`
  return `${(ns / 1_000_000).toFixed(ns < 10_000_000 ? 1 : 0)} ms`
}

const LATENCIES = [
  { label: 'L1 cache reference', ns: 0.5 },
  { label: 'Branch mispredict', ns: 5 },
  { label: 'Mutex lock/unlock', ns: 25 },
  { label: 'Main memory', ns: 100 },
  { label: '1 KB over 1 Gbps', ns: 10_000 },
  { label: 'SSD random read', ns: 150_000 },
  { label: 'Same-AZ RPC', ns: 500_000 },
  { label: 'Cross-region round trip', ns: 75_000_000 },
  { label: 'Object storage request', ns: 100_000_000 },
]

function ResultCard({ row }: { row: ResultRow }) {
  const color = row.tone === 'ok' ? C.ok : row.tone === 'warn' ? C.warn : C.accent
  return (
    <motion.div layout className="rounded-xl border border-line bg-panel/80 p-3">
      <div className="flex items-center justify-between gap-2 text-xs text-muted">
        <span>{row.label}</span>
        <span className="h-2 w-2 rounded-full" style={{ background: color }} />
      </div>
      <div className="mt-1 text-2xl font-semibold tracking-tight text-fg">{row.value}</div>
      <div className="mt-1 font-mono text-[11px] text-muted">{row.formula}</div>
    </motion.div>
  )
}

export default function CapacityEstimator() {
  const [preset, setPreset] = useState<PresetId>('feed')
  const [inputs, setInputs] = useState<Inputs>(PRESETS.feed.values)
  const results = useMemo(() => compute(inputs), [inputs])
  const set = (key: keyof Inputs, value: number) => setInputs((current) => ({ ...current, [key]: value }))
  const applyPreset = (id: PresetId) => {
    setPreset(id)
    setInputs(PRESETS[id].values)
  }
  const peakRead = results.find((row) => row.label === 'Peak read QPS')?.value ?? '0'
  const storage = results.find((row) => row.label === 'Total replicated storage')?.value ?? '0 B'

  return (
    <VizFrame
      title="Capacity estimator"
      description="Back-of-the-envelope sizing converts product assumptions into QPS, storage, bandwidth and server counts."
      controls={
        <>
          <Select value={preset} onChange={applyPreset} options={Object.entries(PRESETS).map(([value, row]) => ({ value: value as PresetId, label: row.label }))} />
          <div className="inline-flex items-center gap-2 rounded-lg border border-line bg-subtle px-3 py-1.5 text-sm text-muted">
            <Calculator size={15} className="text-accent" /> edit assumptions below
          </div>
        </>
      }
      caption={`${PRESETS[preset].label}: peak reads ${peakRead}, replicated storage ${storage}, cache hit ${(inputs.cacheHit * 100).toFixed(0)}%.`}
      legend={[
        { color: C.accent, label: 'traffic' },
        { color: C.ok, label: 'storage/cache' },
        { color: C.warn, label: 'peak/capacity' },
      ]}
    >
      <div className="space-y-4">
        <div className="grid gap-3 md:grid-cols-3 xl:grid-cols-4">
          <Slider label="DAU" value={inputs.dauM} min={0.1} max={100} step={0.1} onChange={(v) => set('dauM', v)} format={(v) => `${v.toFixed(v < 10 ? 1 : 0)}M`} />
          <Slider label="actions / user / day" value={inputs.actions} min={1} max={250} onChange={(v) => set('actions', v)} />
          <Slider label="read:write" value={inputs.readWrite} min={1} max={100} onChange={(v) => set('readWrite', v)} format={(v) => `${v.toFixed(0)}:1`} />
          <Slider label="payload" value={inputs.payloadKB} min={0.1} max={1000} step={0.1} onChange={(v) => set('payloadKB', v)} format={(v) => `${v.toFixed(v < 10 ? 1 : 0)} KB`} />
          <Slider label="retention" value={inputs.retentionYears} min={0.5} max={10} step={0.5} onChange={(v) => set('retentionYears', v)} format={(v) => `${v}y`} />
          <Slider label="replication" value={inputs.replication} min={1} max={5} onChange={(v) => set('replication', v)} format={(v) => `${v}×`} />
          <Slider label="peak factor" value={inputs.peakFactor} min={1} max={12} step={0.5} onChange={(v) => set('peakFactor', v)} format={(v) => `${v}×`} />
          <Slider label="cache hit" value={inputs.cacheHit} min={0} max={0.99} step={0.01} onChange={(v) => set('cacheHit', v)} format={(v) => `${Math.round(v * 100)}%`} />
          <Slider label="per-server QPS" value={inputs.serverQps} min={100} max={5000} step={50} onChange={(v) => set('serverQps', v)} format={(v) => formatCompact(v, 1)} />
        </div>

        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {results.map((row) => (
            <ResultCard key={row.label} row={row} />
          ))}
        </div>

        <div className="rounded-2xl border border-line bg-panel/80 p-4">
          <div className="mb-3 text-sm font-semibold text-fg">Latency numbers every engineer should know</div>
          <div className="space-y-2">
            {LATENCIES.map((item) => {
              const width = ((Math.log10(item.ns) - Math.log10(0.5)) / (Math.log10(100_000_000) - Math.log10(0.5))) * 100
              return (
                <div key={item.label} className="grid grid-cols-[150px_1fr_82px] items-center gap-3 text-xs">
                  <span className="text-muted">{item.label}</span>
                  <div className="h-2 overflow-hidden rounded-full bg-line">
                    <div className="h-full rounded-full" style={{ width: `${width}%`, background: item.ns > 10_000_000 ? C.warn : C.accent }} />
                  </div>
                  <span className="text-right font-mono text-fg">{latencyLabel(item.ns)}</span>
                </div>
              )
            })}
          </div>
        </div>

        <div className="rounded-xl border border-line bg-subtle p-3 text-sm text-muted">
          <span className="font-semibold text-fg">Insight:</span> Capacity estimates are order-of-magnitude guardrails: peak factors, cache hit ratio and payload size usually dominate the architecture more than average DAU.
        </div>
      </div>
    </VizFrame>
  )
}
