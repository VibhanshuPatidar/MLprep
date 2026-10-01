import { motion } from 'framer-motion'
import { Gauge } from 'lucide-react'
import { useMemo, useState } from 'react'
import { Segmented, Select, Slider } from '../../components/ui'
import { C, VizFrame, useAnimationFrame, useSize } from '../common'
import { clamp, formatCompact, mulberry } from './_shared'

type Pattern = 'steady' | 'bursty' | 'spike'
type Algorithm = 'token' | 'leaky' | 'fixed' | 'sliding-log' | 'sliding-counter'

interface RequestEvent {
  id: number
  t: number
  accepted: boolean
  level: number
  label: string
}

const HORIZON = 12
const WINDOW = 2

function buildTraffic(pattern: Pattern): number[] {
  const rng = mulberry(pattern === 'steady' ? 11 : pattern === 'bursty' ? 29 : 47)
  const times: number[] = []
  if (pattern === 'steady') {
    for (let t = 0.25; t < HORIZON; t += 0.34 + (rng() - 0.5) * 0.08) times.push(t)
  }
  if (pattern === 'bursty') {
    for (let t = 0.25; t < HORIZON; t += 0.72 + rng() * 0.18) times.push(t)
    for (const start of [2.4, 6.3, 9.1]) {
      for (let i = 0; i < 12; i += 1) times.push(start + i * 0.055 + rng() * 0.025)
    }
  }
  if (pattern === 'spike') {
    for (let t = 0.4; t < HORIZON; t += 0.95) times.push(t)
    for (let i = 0; i < 34; i += 1) times.push(4.9 + i * 0.035 + rng() * 0.015)
  }
  return times.sort((a, b) => a - b)
}

function simulate(times: readonly number[], algorithm: Algorithm, capacity: number, refill: number, leakRate: number): RequestEvent[] {
  const events: RequestEvent[] = []
  if (algorithm === 'token') {
    let tokens = capacity
    let last = 0
    times.forEach((t, id) => {
      tokens = Math.min(capacity, tokens + (t - last) * refill)
      const accepted = tokens >= 1
      if (accepted) tokens -= 1
      events.push({ id, t, accepted, level: tokens / capacity, label: `${accepted ? 'accepted' : 'rejected'} · ${tokens.toFixed(1)} tokens remain` })
      last = t
    })
    return events
  }
  if (algorithm === 'leaky') {
    let queue = 0
    let last = 0
    times.forEach((t, id) => {
      queue = Math.max(0, queue - (t - last) * leakRate)
      const accepted = queue < capacity
      if (accepted) queue += 1
      events.push({ id, t, accepted, level: queue / capacity, label: `${accepted ? 'enqueued' : 'dropped'} · queue ${queue.toFixed(1)}/${capacity}` })
      last = t
    })
    return events
  }
  if (algorithm === 'fixed') {
    let bucket = -1
    let count = 0
    times.forEach((t, id) => {
      const current = Math.floor(t / WINDOW)
      if (current !== bucket) {
        bucket = current
        count = 0
      }
      const accepted = count < capacity
      if (accepted) count += 1
      events.push({ id, t, accepted, level: count / capacity, label: `${accepted ? 'accepted' : 'rejected'} · fixed window ${count}/${capacity}` })
    })
    return events
  }
  if (algorithm === 'sliding-log') {
    const acceptedTimes: number[] = []
    times.forEach((t, id) => {
      while (acceptedTimes.length > 0 && acceptedTimes[0] <= t - WINDOW) acceptedTimes.shift()
      const accepted = acceptedTimes.length < capacity
      if (accepted) acceptedTimes.push(t)
      events.push({ id, t, accepted, level: acceptedTimes.length / capacity, label: `${accepted ? 'accepted' : 'rejected'} · ${acceptedTimes.length} hits in rolling ${WINDOW}s` })
    })
    return events
  }

  const counts = new Map<number, number>()
  times.forEach((t, id) => {
    const bucket = Math.floor(t / WINDOW)
    const elapsed = t - bucket * WINDOW
    const previousWeight = (WINDOW - elapsed) / WINDOW
    const current = counts.get(bucket) ?? 0
    const previous = counts.get(bucket - 1) ?? 0
    const estimate = current + previous * previousWeight
    const accepted = estimate < capacity
    if (accepted) counts.set(bucket, current + 1)
    events.push({ id, t, accepted, level: Math.min(1, (estimate + (accepted ? 1 : 0)) / capacity), label: `${accepted ? 'accepted' : 'rejected'} · weighted count ${estimate.toFixed(1)}/${capacity}` })
  })
  return events
}

function algorithmLabel(algorithm: Algorithm): string {
  const labels: Record<Algorithm, string> = {
    token: 'Token bucket',
    leaky: 'Leaky bucket',
    fixed: 'Fixed window',
    'sliding-log': 'Sliding log',
    'sliding-counter': 'Sliding counter',
  }
  return labels[algorithm]
}

function insightFor(algorithm: Algorithm): string {
  if (algorithm === 'token') return 'Token buckets tolerate short bursts up to capacity while preserving a long-term refill rate.'
  if (algorithm === 'leaky') return 'Leaky buckets smooth traffic into a steady drain but add queueing delay before dropping overflow.'
  if (algorithm === 'fixed') return 'Fixed windows are cheap, but boundary bursts can double the allowed traffic around a reset.'
  if (algorithm === 'sliding-log') return 'Sliding logs are exact and fair but store one timestamp per accepted request.'
  return 'Sliding counters trade a little accuracy for bounded memory and smoother enforcement.'
}

function Stat({ label, value, sub }: { label: string; value: string; sub: string }) {
  return (
    <div className="rounded-xl border border-line bg-panel/80 p-3">
      <div className="text-xs text-muted">{label}</div>
      <div className="mt-1 text-2xl font-semibold tracking-tight text-fg">{value}</div>
      <div className="mt-1 text-xs text-muted">{sub}</div>
    </div>
  )
}

export default function RateLimiter() {
  const [pattern, setPattern] = useState<Pattern>('bursty')
  const [algorithm, setAlgorithm] = useState<Algorithm>('token')
  const [capacity, setCapacity] = useState(10)
  const [refill, setRefill] = useState(4)
  const [leakRate, setLeakRate] = useState(4)
  const [time, setTime] = useState(0)
  const [wrapRef, size] = useSize<HTMLDivElement>()

  useAnimationFrame((dt) => setTime((t) => (t + dt / 1000) % HORIZON), true)

  const traffic = useMemo(() => buildTraffic(pattern), [pattern])
  const events = useMemo(() => simulate(traffic, algorithm, capacity, refill, leakRate), [algorithm, capacity, leakRate, refill, traffic])
  const accepted = events.filter((event) => event.accepted).length
  const rejected = events.length - accepted
  const current = [...events].reverse().find((event) => event.t <= time) ?? events[0]
  const gauge = current?.level ?? 0
  const compact = size.width < 680
  const viewWidth = compact ? 520 : 820
  const viewHeight = compact ? 480 : 360
  const timelineX = 52
  const timelineY = 80
  const timelineWidth = compact ? 415 : 590
  const scanX = timelineX + (time / HORIZON) * timelineWidth

  const controls = (
    <>
      <Segmented
        value={pattern}
        onChange={setPattern}
        options={[
          { value: 'steady', label: 'Steady' },
          { value: 'bursty', label: 'Bursty' },
          { value: 'spike', label: 'Spike' },
        ]}
      />
      <Select
        value={algorithm}
        onChange={setAlgorithm}
        options={[
          { value: 'token', label: 'Token bucket' },
          { value: 'leaky', label: 'Leaky bucket' },
          { value: 'fixed', label: 'Fixed window' },
          { value: 'sliding-log', label: 'Sliding window log' },
          { value: 'sliding-counter', label: 'Sliding window counter' },
        ]}
      />
      <Slider label={algorithm === 'leaky' ? 'queue size' : 'limit / capacity'} value={capacity} min={4} max={24} onChange={setCapacity} className="w-36" />
      <Slider label="refill / leak rps" value={algorithm === 'leaky' ? leakRate : refill} min={1} max={10} step={0.5} onChange={algorithm === 'leaky' ? setLeakRate : setRefill} className="w-40" />
    </>
  )

  return (
    <VizFrame
      title="Rate limiter playground"
      description="Replay traffic through common limiters and watch what gets admitted, queued or rejected."
      controls={controls}
      caption={`${algorithmLabel(algorithm)} on ${pattern} traffic · ${accepted}/${events.length} accepted, ${rejected} rejected · ${current?.label ?? 'waiting for first request'}.`}
      legend={[
        { color: C.ok, label: 'accepted' },
        { color: C.err, label: 'rejected' },
        { color: C.accent, label: 'bucket / window level' },
      ]}
    >
      <div ref={wrapRef} className="space-y-4">
        <div className="grid gap-3 md:grid-cols-4">
          <Stat label="Requests" value={formatCompact(events.length, 0)} sub={`${pattern} arrivals over ${HORIZON}s`} />
          <Stat label="Accepted" value={`${accepted}`} sub={`${((accepted / events.length) * 100).toFixed(0)}% pass rate`} />
          <Stat label="Rejected" value={`${rejected}`} sub="backpressure signal" />
          <Stat label="Gauge" value={`${Math.round(gauge * 100)}%`} sub={algorithm === 'token' ? 'low tokens means throttling soon' : 'full means drops soon'} />
        </div>

        <svg viewBox={`0 0 ${viewWidth} ${viewHeight}`} className="h-auto w-full rounded-2xl border border-line bg-panel/70">
          <text x={timelineX} y="38" fill={C.fg} fontSize="15" fontWeight="700">
            Incoming request timeline
          </text>
          <text x={timelineX} y="57" fill={C.muted} fontSize="12">
            Dots light up as the simulated clock sweeps left to right.
          </text>
          <line x1={timelineX} x2={timelineX + timelineWidth} y1={timelineY + 88} y2={timelineY + 88} stroke={C.lineStrong} strokeWidth="2" />
          {[0, 3, 6, 9, 12].map((tick) => {
            const x = timelineX + (tick / HORIZON) * timelineWidth
            return (
              <g key={tick}>
                <line x1={x} x2={x} y1={timelineY + 76} y2={timelineY + 100} stroke={C.line} />
                <text x={x} y={timelineY + 120} textAnchor="middle" fill={C.muted} fontSize="11">
                  {tick}s
                </text>
              </g>
            )
          })}
          {events.map((event) => {
            const x = timelineX + (event.t / HORIZON) * timelineWidth
            const jitter = (event.id % 7) * 8
            const y = event.accepted ? timelineY + 30 + jitter : timelineY + 154 + (event.id % 4) * 9
            const seen = event.t <= time
            return <circle key={event.id} cx={x} cy={y} r={seen ? 5 : 3.2} fill={event.accepted ? C.ok : C.err} opacity={seen ? 0.9 : 0.22} style={{ transition: 'all .25s ease' }} />
          })}
          <motion.line initial={false} animate={{ x1: scanX, x2: scanX }} y1={timelineY - 10} y2={timelineY + 188} stroke={C.accent} strokeWidth="2" strokeDasharray="4 7" />
          <text x={timelineX} y={timelineY + 202} fill={C.muted} fontSize="12">
            accepted requests stay above the axis; rejected ones fall below it.
          </text>

          <g transform={`translate(${compact ? 165 : 690} ${compact ? 295 : 82})`}>
            <rect x="-58" y="-30" width="116" height="210" rx="18" fill={C.subtle} stroke={C.line} />
            <foreignObject x="-11" y="-18" width="24" height="24">
              <Gauge size={22} className="text-accent" />
            </foreignObject>
            <rect x="-28" y="18" width="56" height="128" rx="16" fill={C.panel} stroke={C.lineStrong} />
            <motion.rect initial={false} animate={{ y: 18 + 128 * (1 - clamp(gauge, 0, 1)), height: 128 * clamp(gauge, 0, 1) }} transition={{ duration: 0.35 }} x="-28" width="56" rx="16" fill={algorithm === 'token' ? C.accent : gauge > 0.85 ? C.err : C.accent} opacity="0.88" />
            <text x="0" y="166" textAnchor="middle" fill={C.fg} fontSize="18" fontWeight="700">
              {Math.round(gauge * 100)}%
            </text>
            <text x="0" y="185" textAnchor="middle" fill={C.muted} fontSize="11">
              {algorithm === 'token' ? 'tokens remain' : 'pressure'}
            </text>
          </g>
        </svg>

        <div className="rounded-xl border border-line bg-subtle p-3 text-sm text-muted">
          <span className="font-semibold text-fg">Insight:</span> {insightFor(algorithm)}
        </div>
      </div>
    </VizFrame>
  )
}
