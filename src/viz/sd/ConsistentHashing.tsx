import { motion } from 'framer-motion'
import { Minus, Plus, Server } from 'lucide-react'
import { useMemo, useState } from 'react'
import { Badge, Button, Slider, cn } from '../../components/ui'
import { C, VizFrame, useSize } from '../common'
import { formatCompact, hashIndex, hashUnit, mean, polar, SERIES, stddev } from './_shared'

const ALL_SERVERS = ['api-a', 'api-b', 'api-c', 'api-d', 'api-e', 'api-f']
const KEYS = Array.from({ length: 60 }, (_, i) => `user:${1000 + i}`)

interface Topology {
  serverCount: number
  vnodes: number
}

interface VNode {
  id: string
  server: string
  position: number
}

function buildRing(servers: readonly string[], vnodes: number): VNode[] {
  return servers
    .flatMap((server) => Array.from({ length: vnodes }, (_, i) => ({ id: `${server}#${i}`, server, position: hashUnit(`${server}:${i}`) })))
    .sort((a, b) => a.position - b.position)
}

function ownerFor(key: string, ring: readonly VNode[]): string {
  if (ring.length === 0) return ''
  const h = hashUnit(key)
  return ring.find((node) => node.position >= h)?.server ?? ring[0].server
}

function moduloOwner(key: string, servers: readonly string[]): string {
  if (servers.length === 0) return ''
  return servers[hashIndex(key, servers.length)]
}

function MetricCard({ label, value, sub, tone = 'neutral' }: { label: string; value: string; sub: string; tone?: 'neutral' | 'ok' | 'warn' }) {
  return (
    <div className="rounded-xl border border-line bg-panel/80 p-3">
      <div className="flex items-center justify-between gap-2 text-xs text-muted">
        <span>{label}</span>
        <Badge tone={tone}>{tone === 'neutral' ? 'live' : tone}</Badge>
      </div>
      <div className="mt-1 text-2xl font-semibold tracking-tight text-fg">{value}</div>
      <div className="mt-1 text-xs text-muted">{sub}</div>
    </div>
  )
}

export default function ConsistentHashing() {
  const [serverCount, setServerCount] = useState(3)
  const [vnodes, setVnodes] = useState(12)
  const [previous, setPrevious] = useState<Topology>({ serverCount: 3, vnodes: 12 })
  const [wrapRef, size] = useSize<HTMLDivElement>()

  const servers = useMemo(() => ALL_SERVERS.slice(0, serverCount), [serverCount])
  const previousServers = useMemo(() => ALL_SERVERS.slice(0, previous.serverCount), [previous.serverCount])
  const currentRing = useMemo(() => buildRing(servers, vnodes), [servers, vnodes])
  const previousRing = useMemo(() => buildRing(previousServers, previous.vnodes), [previousServers, previous.vnodes])

  const rows = useMemo(
    () =>
      KEYS.map((key) => {
        const owner = ownerFor(key, currentRing)
        const previousOwner = ownerFor(key, previousRing)
        const modulo = moduloOwner(key, servers)
        const previousModulo = moduloOwner(key, previousServers)
        return {
          key,
          hash: hashUnit(key),
          owner,
          moved: previousOwner !== '' && owner !== previousOwner,
          moduloMoved: previousModulo !== '' && modulo !== previousModulo,
        }
      }),
    [currentRing, previousRing, previousServers, servers],
  )

  const loads = servers.map((server) => rows.filter((row) => row.owner === server).length)
  const movedPct = rows.filter((row) => row.moved).length / rows.length
  const moduloMovedPct = rows.filter((row) => row.moduloMoved).length / rows.length
  const maxLoad = Math.max(...loads)
  const deviation = stddev(loads)
  const average = mean(loads)

  const compact = size.width < 660
  const viewWidth = compact ? 430 : 780
  const viewHeight = compact ? 610 : 410
  const cx = compact ? 215 : 230
  const cy = compact ? 205 : 205
  const radius = compact ? 130 : 140
  const chartX = compact ? 34 : 438
  const chartY = compact ? 410 : 95
  const colorFor = (server: string) => SERIES[Math.max(0, servers.indexOf(server)) % SERIES.length]

  const remember = () => setPrevious({ serverCount, vnodes })
  const changeServers = (next: number) => {
    remember()
    setServerCount(next)
  }
  const changeVnodes = (next: number) => {
    remember()
    setVnodes(next)
  }

  const controls = (
    <>
      <Slider label="vnodes / server" value={vnodes} min={1} max={50} onChange={changeVnodes} className="w-44" />
      <Button size="sm" variant="outline" onClick={() => changeServers(Math.max(2, serverCount - 1))} disabled={serverCount <= 2}>
        <Minus size={14} /> Remove server
      </Button>
      <Button size="sm" variant="primary" onClick={() => changeServers(Math.min(ALL_SERVERS.length, serverCount + 1))} disabled={serverCount >= ALL_SERVERS.length}>
        <Plus size={14} /> Add server
      </Button>
    </>
  )

  return (
    <VizFrame
      title="Consistent hashing"
      description="Map keys to the next virtual node on a hash ring; only nearby keys move when capacity changes."
      controls={controls}
      caption={`${serverCount} servers × ${vnodes} vnodes = ${formatCompact(currentRing.length, 0)} ring points · moved ${(movedPct * 100).toFixed(1)}% of keys vs ${(moduloMovedPct * 100).toFixed(1)}% with naive modulo.`}
      legend={servers.map((server) => ({ color: colorFor(server), label: server }))}
    >
      <div ref={wrapRef} className="space-y-4">
        <div className="grid gap-3 md:grid-cols-3">
          <MetricCard label="Keys moved" value={`${(movedPct * 100).toFixed(1)}%`} sub={`${rows.filter((row) => row.moved).length}/${rows.length} remapped after last change`} tone={movedPct < moduloMovedPct ? 'ok' : 'warn'} />
          <MetricCard label="Modulo baseline" value={`${(moduloMovedPct * 100).toFixed(1)}%`} sub="hash(key) % N reshuffles most keys" tone="warn" />
          <MetricCard label="Load spread" value={`σ ${deviation.toFixed(1)}`} sub={`avg ${average.toFixed(1)} · max ${maxLoad} keys/server`} />
        </div>

        <svg viewBox={`0 0 ${viewWidth} ${viewHeight}`} className="h-auto w-full overflow-visible rounded-2xl border border-line bg-panel/70">
          <defs>
            <filter id="consistent-glow" x="-50%" y="-50%" width="200%" height="200%">
              <feGaussianBlur stdDeviation="3" result="blur" />
              <feMerge>
                <feMergeNode in="blur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
          </defs>
          <circle cx={cx} cy={cy} r={radius} fill="none" stroke={C.lineStrong} strokeWidth="8" opacity="0.55" />
          <circle cx={cx} cy={cy} r={radius - 20} fill="none" stroke={C.line} strokeDasharray="2 10" />
          {currentRing.map((node) => {
            const inner = polar(cx, cy, radius - 8, node.position)
            const outer = polar(cx, cy, radius + 10, node.position)
            return <line key={node.id} x1={inner.x} y1={inner.y} x2={outer.x} y2={outer.y} stroke={colorFor(node.server)} strokeWidth="2" opacity="0.62" />
          })}
          {rows.map((row) => {
            const p = polar(cx, cy, radius + 24 + (hashIndex(row.key, 5) - 2) * 2.2, row.hash)
            return (
              <motion.circle
                key={row.key}
                initial={false}
                animate={{ cx: p.x, cy: p.y, r: row.moved ? 5.5 : 4.2 }}
                transition={{ type: 'spring', stiffness: 90, damping: 16 }}
                fill={colorFor(row.owner)}
                stroke={row.moved ? C.warn : C.panel}
                strokeWidth={row.moved ? 2.2 : 1.2}
                filter={row.moved ? 'url(#consistent-glow)' : undefined}
              />
            )
          })}
          {servers.map((server, i) => {
            const p = polar(cx, cy, radius + 68, i / servers.length)
            return (
              <g key={server}>
                <circle cx={p.x} cy={p.y} r="21" fill={C.panel} stroke={colorFor(server)} strokeWidth="2.5" />
                <foreignObject x={p.x - 10} y={p.y - 10} width="20" height="20">
                  <Server size={18} color={colorFor(server)} />
                </foreignObject>
                <text x={p.x} y={p.y + 36} textAnchor="middle" fill={C.muted} fontSize="12" fontFamily="ui-monospace, monospace">
                  {server}
                </text>
              </g>
            )
          })}
          <text x={cx} y={cy - 8} textAnchor="middle" fill={C.fg} fontSize="22" fontWeight="700">
            {KEYS.length} keys
          </text>
          <text x={cx} y={cy + 17} textAnchor="middle" fill={C.muted} fontSize="12">
            clockwise lookup to first vnode
          </text>

          <g transform={`translate(${chartX} ${chartY})`}>
            <text x="0" y="-22" fill={C.fg} fontSize="15" fontWeight="700">
              Load distribution
            </text>
            <text x="0" y="-4" fill={C.muted} fontSize="12">
              Virtual nodes smooth the natural variance of hashing.
            </text>
            {servers.map((server, i) => {
              const load = loads[i]
              const width = 222 * (load / Math.max(1, maxLoad))
              return (
                <g key={server} transform={`translate(0 ${i * 38 + 22})`}>
                  <text x="0" y="13" fill={C.muted} fontSize="12" fontFamily="ui-monospace, monospace">
                    {server}
                  </text>
                  <rect x="66" y="0" width="222" height="18" rx="9" fill={C.line} opacity="0.65" />
                  <motion.rect initial={false} animate={{ width }} transition={{ duration: 0.45 }} x="66" y="0" height="18" rx="9" fill={colorFor(server)} />
                  <text x="302" y="13" fill={C.fg} fontSize="12" fontWeight="600">
                    {load}
                  </text>
                </g>
              )
            })}
          </g>
        </svg>

        <div className={cn('rounded-xl border border-line bg-subtle p-3 text-sm text-muted', movedPct < moduloMovedPct && 'border-ok/40')}>
          <span className="font-semibold text-fg">Insight:</span> consistent hashing localizes disruption: with enough virtual nodes, adding or removing one server moves roughly 1/N keys instead of reassigning nearly every modulo bucket.
        </div>
      </div>
    </VizFrame>
  )
}
