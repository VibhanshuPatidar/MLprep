import { motion } from 'framer-motion'
import { ServerCrash } from 'lucide-react'
import { useMemo, useState } from 'react'
import { Badge, Select, Slider, Switch } from '../../components/ui'
import { C, VizFrame, useAnimationFrame, useSize } from '../common'
import { clamp, formatMs, hashIndex, hashUnit, mulberry, quantile } from './_shared'

type Strategy = 'rr' | 'wrr' | 'least' | 'random' | 'p2c' | 'hash'

interface ServerCfg {
  id: string
  speed: number
  weight: number
  down: boolean
}

interface RequestEvent {
  id: number
  client: number
  arrival: number
  start: number
  finish: number
  server: number
  service: number
}

const HORIZON = 10
const SPEEDS = [1.35, 1.1, 0.78, 1.55, 0.9, 1.25, 0.68, 1.42]

function strategyName(strategy: Strategy): string {
  const names: Record<Strategy, string> = {
    rr: 'Round robin',
    wrr: 'Weighted RR',
    least: 'Least connections',
    random: 'Random',
    p2c: 'Power of two choices',
    hash: 'Consistent hashing sticky',
  }
  return names[strategy]
}

function buildServers(count: number, kill: boolean): ServerCfg[] {
  return Array.from({ length: count }, (_, i) => ({ id: `S${i + 1}`, speed: SPEEDS[i], weight: Math.max(1, Math.round(SPEEDS[i] * 3)), down: kill && i === 1 }))
}

function activeIndexes(servers: readonly ServerCfg[]): number[] {
  return servers.map((server, index) => ({ server, index })).filter((row) => !row.server.down).map((row) => row.index)
}

function stickyChoice(client: number, active: readonly number[]): number {
  const points = active
    .flatMap((index) => Array.from({ length: 9 }, (_, vnode) => ({ index, h: hashUnit(`server:${index}:v:${vnode}`) })))
    .sort((a, b) => a.h - b.h)
  const h = hashUnit(`client:${client}`)
  return points.find((point) => point.h >= h)?.index ?? points[0].index
}

function simulate(strategy: Strategy, count: number, kill: boolean): { servers: ServerCfg[]; events: RequestEvent[] } {
  const servers = buildServers(count, kill)
  const active = activeIndexes(servers)
  const rng = mulberry(100 + count * 17 + (kill ? 5 : 0) + hashIndex(strategy, 97))
  const availability = Array.from({ length: count }, () => 0)
  const events: RequestEvent[] = []
  let rr = 0
  const weighted = active.flatMap((index) => Array.from({ length: servers[index].weight }, () => index))
  let wrr = 0

  const connectionsAt = (server: number, t: number) => events.filter((event) => event.server === server && event.arrival <= t && event.finish > t).length
  const choose = (client: number, t: number): number => {
    if (active.length === 1) return active[0]
    if (strategy === 'rr') {
      const chosen = active[rr % active.length]
      rr += 1
      return chosen
    }
    if (strategy === 'wrr') {
      const chosen = weighted[wrr % weighted.length]
      wrr += 1
      return chosen
    }
    if (strategy === 'least') return active.reduce((best, index) => (connectionsAt(index, t) < connectionsAt(best, t) ? index : best), active[0])
    if (strategy === 'random') return active[Math.floor(rng() * active.length)]
    if (strategy === 'p2c') {
      const a = active[Math.floor(rng() * active.length)]
      let b = active[Math.floor(rng() * active.length)]
      if (a === b) b = active[(active.indexOf(a) + 1) % active.length]
      return connectionsAt(a, t) <= connectionsAt(b, t) ? a : b
    }
    return stickyChoice(client, active)
  }

  for (let id = 0; id < 72; id += 1) {
    const arrival = 0.08 + id * 0.132 + (rng() - 0.5) * 0.045
    const client = hashIndex(`client-${id % 13}-${Math.floor(id / 5)}`, 6)
    const server = choose(client, arrival)
    const service = (0.18 + rng() * 0.22) / servers[server].speed
    const start = Math.max(arrival, availability[server])
    const finish = start + service
    availability[server] = finish
    events.push({ id, client, arrival, start, finish, server, service })
  }
  return { servers, events }
}

function insight(strategy: Strategy): string {
  if (strategy === 'least') return 'Least-connections reacts to slow servers and queue buildup, but needs live per-server state.'
  if (strategy === 'p2c') return 'Power-of-two choices approximates least-connections with only two random probes per request.'
  if (strategy === 'hash') return 'Sticky hashing improves cache locality; consistent rings limit remapping during failover.'
  if (strategy === 'wrr') return 'Weighted round robin is simple when capacity is known, but static weights miss transient overload.'
  if (strategy === 'random') return 'Random routing is stateless, yet variance creates hot spots at small request counts.'
  return 'Round robin is fair by count, not by work; heterogeneous service times can still create queues.'
}

export default function LoadBalancer() {
  const [count, setCount] = useState(5)
  const [strategy, setStrategy] = useState<Strategy>('p2c')
  const [kill, setKill] = useState(false)
  const [time, setTime] = useState(0)
  const [wrapRef, size] = useSize<HTMLDivElement>()

  useAnimationFrame((dt) => setTime((t) => (t + (dt / 1000) * 0.9) % HORIZON), true)

  const { servers, events } = useMemo(() => simulate(strategy, count, kill), [count, kill, strategy])
  const latencies = events.map((event) => (event.finish - event.arrival) * 1000)
  const p50 = quantile(latencies, 0.5)
  const p95 = quantile(latencies, 0.95)
  const active = activeIndexes(servers)
  const compact = size.width < 720
  const viewWidth = compact ? 560 : 860
  const viewHeight = compact ? 560 : 410
  const clientX = compact ? 70 : 85
  const serverX = compact ? 455 : 690
  const clientY = (client: number) => 75 + client * 47
  const serverY = (server: number) => 62 + server * (compact ? 50 : 42)
  const queueDepth = (server: number) => events.filter((event) => event.server === server && event.arrival <= time && event.finish > time).length
  const utilization = (server: number) => events.filter((event) => event.server === server).reduce((acc, event) => acc + event.service, 0) / HORIZON
  const maxQueue = Math.max(1, ...servers.map((_, i) => queueDepth(i)))

  return (
    <VizFrame
      title="Load balancer strategies"
      description="Compare routing policies as heterogeneous servers queue and complete requests at different speeds."
      controls={
        <>
          <Slider label="servers" value={count} min={2} max={8} onChange={setCount} className="w-36" />
          <Select
            value={strategy}
            onChange={setStrategy}
            options={[
              { value: 'rr', label: 'Round robin' },
              { value: 'wrr', label: 'Weighted round robin' },
              { value: 'least', label: 'Least connections' },
              { value: 'random', label: 'Random' },
              { value: 'p2c', label: 'Power of two choices' },
              { value: 'hash', label: 'Consistent hashing sticky' },
            ]}
          />
          <Switch checked={kill} onChange={setKill} label={<span className="text-sm text-muted">kill S2 / failover</span>} />
        </>
      }
      caption={`${strategyName(strategy)} · ${active.length}/${servers.length} servers alive · p50 ${formatMs(p50)} · p95 ${formatMs(p95)}${kill ? ' · failed server removed from choices' : ''}.`}
      legend={[
        { color: C.accent, label: 'request particle' },
        { color: C.ok, label: 'healthy server' },
        { color: C.err, label: 'failed server' },
      ]}
    >
      <div ref={wrapRef} className="space-y-4">
        <div className="grid gap-3 md:grid-cols-4">
          <div className="rounded-xl border border-line bg-panel/80 p-3">
            <div className="text-xs text-muted">p50 latency</div>
            <div className="mt-1 text-2xl font-semibold text-fg">{formatMs(p50)}</div>
          </div>
          <div className="rounded-xl border border-line bg-panel/80 p-3">
            <div className="text-xs text-muted">p95 latency</div>
            <div className="mt-1 text-2xl font-semibold text-fg">{formatMs(p95)}</div>
          </div>
          <div className="rounded-xl border border-line bg-panel/80 p-3">
            <div className="text-xs text-muted">Requests</div>
            <div className="mt-1 text-2xl font-semibold text-fg">{events.length}</div>
          </div>
          <div className="rounded-xl border border-line bg-panel/80 p-3">
            <div className="text-xs text-muted">Routing mode</div>
            <div className="mt-1 flex items-center gap-2 text-sm font-semibold text-fg">
              {kill && <ServerCrash size={16} className="text-err" />}
              {strategyName(strategy)}
            </div>
          </div>
        </div>

        <svg viewBox={`0 0 ${viewWidth} ${viewHeight}`} className="h-auto w-full rounded-2xl border border-line bg-panel/70">
          <text x="42" y="32" fill={C.fg} fontSize="15" fontWeight="700">
            Request flow and queues
          </text>
          <text x="42" y="51" fill={C.muted} fontSize="12">
            Particles show arrivals; queue bars show in-flight + waiting work at the current clock.
          </text>
          {Array.from({ length: 6 }, (_, client) => (
            <g key={client}>
              <circle cx={clientX} cy={clientY(client)} r="16" fill={C.subtle} stroke={C.lineStrong} />
              <text x={clientX} y={clientY(client) + 4} textAnchor="middle" fill={C.muted} fontSize="11" fontFamily="ui-monospace, monospace">
                C{client + 1}
              </text>
            </g>
          ))}
          {servers.map((server, index) => {
            const y = serverY(index)
            const q = queueDepth(index)
            const util = clamp(utilization(index), 0, 1)
            return (
              <g key={server.id} opacity={server.down ? 0.55 : 1}>
                <rect x={serverX - 48} y={y - 19} width="96" height="38" rx="13" fill={server.down ? C.err : C.subtle} fillOpacity={server.down ? 0.12 : 1} stroke={server.down ? C.err : C.lineStrong} />
                <text x={serverX - 34} y={y + 4} fill={server.down ? C.err : C.fg} fontSize="13" fontWeight="700">
                  {server.id}
                </text>
                <text x={serverX + 4} y={y + 4} fill={C.muted} fontSize="11">
                  {server.down ? 'down' : `${server.speed.toFixed(2)}×`}
                </text>
                <rect x={serverX + 64} y={y - 15} width="102" height="10" rx="5" fill={C.line} />
                <motion.rect initial={false} animate={{ width: 102 * (q / maxQueue) }} x={serverX + 64} y={y - 15} height="10" rx="5" fill={q > 4 ? C.warn : C.accent} />
                <rect x={serverX + 64} y={y + 7} width="102" height="10" rx="5" fill={C.line} />
                <motion.rect initial={false} animate={{ width: 102 * util }} x={serverX + 64} y={y + 7} height="10" rx="5" fill={util > 0.8 ? C.err : C.ok} />
                <text x={serverX + 174} y={y - 6} fill={C.muted} fontSize="10">
                  q {q}
                </text>
                <text x={serverX + 174} y={y + 16} fill={C.muted} fontSize="10">
                  u {Math.round(util * 100)}%
                </text>
              </g>
            )
          })}
          {events.map((event) => {
            const progress = (time - event.arrival) / 0.55
            if (progress < 0 || progress > 1) return null
            const p = clamp(progress, 0, 1)
            const x = clientX + (serverX - clientX - 54) * p
            const y = clientY(event.client) + (serverY(event.server) - clientY(event.client)) * p
            return <circle key={event.id} cx={x} cy={y} r="4.8" fill={C.accent} opacity="0.85" />
          })}
          <motion.line initial={false} animate={{ x1: 42 + (time / HORIZON) * (viewWidth - 84), x2: 42 + (time / HORIZON) * (viewWidth - 84) }} y1={viewHeight - 42} y2={viewHeight - 24} stroke={C.accent} strokeWidth="3" strokeLinecap="round" />
          <line x1="42" x2={viewWidth - 42} y1={viewHeight - 33} y2={viewHeight - 33} stroke={C.lineStrong} />
          <text x={viewWidth - 44} y={viewHeight - 48} textAnchor="end" fill={C.muted} fontSize="11">
            {Math.max(0, time).toFixed(1)}s / {HORIZON}s
          </text>
        </svg>

        <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-4">
          {servers.map((server, index) => (
            <div key={server.id} className="rounded-xl border border-line bg-panel/80 p-3">
              <div className="flex items-center justify-between text-xs text-muted">
                <span>{server.id}</span>
                <Badge tone={server.down ? 'err' : 'ok'}>{server.down ? 'down' : `${server.speed.toFixed(2)}×`}</Badge>
              </div>
              <div className="mt-2 h-2 overflow-hidden rounded-full bg-line">
                <div className="h-full rounded-full transition-all duration-500" style={{ width: `${Math.min(100, utilization(index) * 100)}%`, background: server.down ? C.err : C.ok }} />
              </div>
              <div className="mt-2 text-xs text-muted">current queue {queueDepth(index)}</div>
            </div>
          ))}
        </div>

        <div className="rounded-xl border border-line bg-subtle p-3 text-sm text-muted">
          <span className="font-semibold text-fg">Insight:</span> {insight(strategy)}
        </div>
      </div>
    </VizFrame>
  )
}
