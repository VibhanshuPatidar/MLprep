import { Background, BackgroundVariant, Controls, Handle, MarkerType, Position, ReactFlow, type Edge, type Node, type NodeProps } from '@xyflow/react'
import '@xyflow/react/dist/style.css'
import {
  Activity,
  Boxes,
  Brain,
  Cloud,
  Cog,
  Database,
  Globe,
  HardDrive,
  Layers,
  ListOrdered,
  Monitor,
  Network,
  Radio,
  Search,
  Server,
  Shield,
  X,
  Zap,
} from 'lucide-react'
import type { LucideIcon } from 'lucide-react'
import { useMemo, useState } from 'react'
import type { Diagram as DiagramT, NodeKind } from '../types/content'
import { useStore } from '../store/progress'
import { cn } from './ui'

const KIND: Record<NodeKind, { icon: LucideIcon; color: string; label: string }> = {
  client: { icon: Monitor, color: 'var(--viz-5)', label: 'Client' },
  gateway: { icon: Shield, color: 'var(--viz-6)', label: 'Gateway' },
  lb: { icon: Network, color: 'var(--viz-6)', label: 'Load balancer' },
  service: { icon: Server, color: 'var(--viz-1)', label: 'Service' },
  worker: { icon: Cog, color: 'var(--viz-1)', label: 'Worker' },
  db: { icon: Database, color: 'var(--viz-3)', label: 'Database' },
  cache: { icon: Zap, color: 'var(--viz-4)', label: 'Cache' },
  queue: { icon: ListOrdered, color: 'var(--viz-2)', label: 'Queue' },
  stream: { icon: Radio, color: 'var(--viz-2)', label: 'Stream' },
  storage: { icon: HardDrive, color: 'var(--viz-3)', label: 'Object storage' },
  cdn: { icon: Globe, color: 'var(--viz-5)', label: 'CDN' },
  search: { icon: Search, color: 'var(--viz-4)', label: 'Search index' },
  model: { icon: Brain, color: 'var(--viz-2)', label: 'Model' },
  'feature-store': { icon: Layers, color: 'var(--viz-3)', label: 'Feature store' },
  external: { icon: Cloud, color: 'var(--faint)', label: 'External' },
  monitor: { icon: Activity, color: 'var(--viz-4)', label: 'Monitoring' },
}

type NData = { label: string; kind: NodeKind; detail?: string; active: boolean }

function SysNode({ data }: NodeProps<Node<NData>>) {
  const k = KIND[data.kind] ?? { icon: Boxes, color: 'var(--accent)', label: data.kind }
  const Icon = k.icon
  return (
    <div
      className={cn(
        'flex h-[54px] w-[168px] cursor-pointer items-center gap-2.5 rounded-xl border bg-panel px-3 shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-md',
        data.active ? 'border-accent ring-2 ring-accent/30' : 'border-line',
      )}
    >
      <Handle type="target" position={Position.Left} className="!h-1.5 !w-1.5 !border-0 !bg-transparent" />
      <Handle type="target" position={Position.Top} id="t" className="!h-1.5 !w-1.5 !border-0 !bg-transparent" />
      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg" style={{ background: `color-mix(in srgb, ${k.color} 15%, transparent)`, color: k.color }}>
        <Icon size={16} />
      </div>
      <div className="min-w-0">
        <div className="truncate text-[12.5px] leading-tight font-medium text-fg" title={data.label}>
          {data.label}
        </div>
        <div className="text-[10px] text-faint">{k.label}</div>
      </div>
      {data.detail && <span className="absolute top-1.5 right-1.5 h-1.5 w-1.5 rounded-full bg-accent/60" />}
      <Handle type="source" position={Position.Right} className="!h-1.5 !w-1.5 !border-0 !bg-transparent" />
      <Handle type="source" position={Position.Bottom} id="b" className="!h-1.5 !w-1.5 !border-0 !bg-transparent" />
    </div>
  )
}

const nodeTypes = { sys: SysNode }
const COL = 215
const ROW = 105

export default function Diagram({ diagram, height = 420 }: { diagram: DiagramT; height?: number }) {
  const theme = useStore((s) => s.settings.theme)
  const [active, setActive] = useState<string | null>(null)
  const byId = useMemo(() => new Map(diagram.nodes.map((n) => [n.id, n])), [diagram])

  const nodes: Node<NData>[] = useMemo(
    () =>
      diagram.nodes.map((n) => ({
        id: n.id,
        type: 'sys',
        position: { x: n.col * COL, y: n.row * ROW },
        data: { label: n.label, kind: n.kind, detail: n.detail, active: active === n.id },
        // explicit dimensions let React Flow lay out and fit the view before DOM measurement
        width: 168,
        height: 54,
        draggable: true,
      })),
    [diagram, active],
  )

  const edges: Edge[] = useMemo(
    () =>
      diagram.edges.map((e, i) => {
        const a = byId.get(e.from)
        const b = byId.get(e.to)
        const vertical = a && b && a.col === b.col
        const hl = active && (e.from === active || e.to === active)
        return {
          id: `e${i}`,
          source: e.from,
          target: e.to,
          sourceHandle: vertical && b!.row > a!.row ? 'b' : undefined,
          targetHandle: vertical && b!.row > a!.row ? 't' : undefined,
          label: e.label,
          type: 'smoothstep',
          animated: Boolean(hl),
          style: { stroke: hl ? 'var(--accent)' : 'var(--line-strong)', strokeWidth: hl ? 2 : 1.4, strokeDasharray: e.dashed ? '5 4' : undefined },
          labelStyle: { fill: 'var(--muted)', fontSize: 10.5, fontWeight: 500 },
          labelBgStyle: { fill: 'var(--panel)' },
          labelBgPadding: [4, 2] as [number, number],
          labelBgBorderRadius: 4,
          markerEnd: { type: MarkerType.ArrowClosed, width: 14, height: 14, color: hl ? 'var(--accent)' : 'var(--line-strong)' },
        }
      }),
    [diagram, byId, active],
  )

  const sel = active ? byId.get(active) : null

  return (
    <div className="relative overflow-hidden rounded-xl border border-line bg-panel-2" style={{ height }}>
      <ReactFlow
        nodes={nodes}
        edges={edges}
        nodeTypes={nodeTypes}
        fitView
        fitViewOptions={{ padding: 0.15 }}
        colorMode={theme}
        proOptions={{ hideAttribution: true }}
        onInit={(inst) => {
          inst.fitView({ padding: 0.15 })
          setTimeout(() => inst.fitView({ padding: 0.15 }), 50)
        }}
        onNodeClick={(_, n) => setActive((a) => (a === n.id ? null : n.id))}
        onPaneClick={() => setActive(null)}
        minZoom={0.3}
        maxZoom={1.75}
        nodesConnectable={false}
        style={{ background: 'transparent' }}
      >
        <Background variant={BackgroundVariant.Dots} gap={18} size={1} color="var(--line-strong)" />
        <Controls showInteractive={false} position="bottom-left" />
      </ReactFlow>
      {sel && (
        <div className="animate-fade-in absolute top-3 right-3 w-72 rounded-xl border border-line bg-panel p-3.5 shadow-lg">
          <div className="flex items-start justify-between gap-2">
            <div>
              <div className="text-sm font-semibold">{sel.label}</div>
              <div className="text-[11px] text-faint">{KIND[sel.kind]?.label}</div>
            </div>
            <button onClick={() => setActive(null)} className="text-faint hover:text-fg">
              <X size={14} />
            </button>
          </div>
          <p className="mt-2 text-xs leading-relaxed text-muted">{sel.detail ?? 'No extra notes for this component.'}</p>
          <div className="mt-2 text-[11px] text-faint">
            In: {diagram.edges.filter((e) => e.to === sel.id).map((e) => byId.get(e.from)?.label).join(', ') || '—'}
            <br />
            Out: {diagram.edges.filter((e) => e.from === sel.id).map((e) => byId.get(e.to)?.label).join(', ') || '—'}
          </div>
        </div>
      )}
      <div className="pointer-events-none absolute top-3 left-3 rounded-md bg-panel/80 px-2 py-1 text-[11px] text-muted backdrop-blur">{diagram.title} · click a component</div>
    </div>
  )
}
