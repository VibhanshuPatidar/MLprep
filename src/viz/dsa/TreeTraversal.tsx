import { useMemo, useState } from 'react'
import { Shuffle } from 'lucide-react'
import { motion } from 'framer-motion'
import { C, PlayerControls, VizFrame, mulberry32, usePlayer, useSize } from '../common'
import { Button, Segmented } from '../../components/ui'
import { MetricCard, PseudoCodePanel, soft } from './_shared1'

type Mode = 'pre' | 'in' | 'post' | 'level'
type LevelValue = number | null

interface TreeNode {
  id: number
  value: number
  left?: number
  right?: number
  level: number
  pos: number
}

interface TreeFrame {
  current?: number
  visited: number[]
  stack: number[]
  queue: number[]
  line: number
  caption: string
}

interface NodePos {
  x: number
  y: number
}

const fallback: LevelValue[] = [3, 9, 20, null, null, 15, 7]

const code: Record<Mode, string[]> = {
  pre: ['dfs(node)', 'visit node', 'dfs(node.left)', 'dfs(node.right)', 'return to caller', 'done'],
  in: ['dfs(node)', 'dfs(node.left)', 'visit node', 'dfs(node.right)', 'return to caller', 'done'],
  post: ['dfs(node)', 'dfs(node.left)', 'dfs(node.right)', 'visit node', 'return to caller', 'done'],
  level: ['queue = [root]', 'while queue not empty', 'node = queue.shift(); visit', 'enqueue left child', 'enqueue right child', 'done'],
}

function parseLevelOrder(text: string): LevelValue[] {
  const raw = text.trim().replace(/^\[/, '').replace(/\]$/, '')
  if (!raw) return fallback
  const values = raw.split(',').map((part) => {
    const p = part.trim().toLowerCase()
    if (p === 'null' || p === 'nil' || p === '') return null
    const n = Number(p)
    return Number.isFinite(n) ? n : null
  })
  if (values.length === 0 || values[0] === null) return fallback
  while (values.length > 1 && values[values.length - 1] === null) values.pop()
  return values.slice(0, 31)
}

function serialize(values: LevelValue[]) {
  return `[${values.map((v) => (v === null ? 'null' : String(v))).join(',')}]`
}

function buildTree(values: LevelValue[]) {
  const nodes = new Map<number, TreeNode>()
  values.forEach((value, id) => {
    if (value === null) return
    const level = Math.floor(Math.log2(id + 1))
    const pos = id - (2 ** level - 1)
    nodes.set(id, { id, value, level, pos })
  })
  nodes.forEach((node) => {
    const left = node.id * 2 + 1
    const right = node.id * 2 + 2
    if (nodes.has(left)) node.left = left
    if (nodes.has(right)) node.right = right
  })
  return nodes
}

function dfsFrames(mode: Exclude<Mode, 'level'>, nodes: Map<number, TreeNode>): TreeFrame[] {
  const frames: TreeFrame[] = []
  const visited: number[] = []
  const visit = (id: number, stack: number[]) => {
    const node = nodes.get(id)
    if (!node) return
    const nextStack = [...stack, id]
    frames.push({ current: id, visited: [...visited], stack: nextStack, queue: [], line: 1, caption: `Call dfs(${node.value}); push it on the recursion stack.` })
    if (mode === 'pre') {
      visited.push(id)
      frames.push({ current: id, visited: [...visited], stack: nextStack, queue: [], line: 2, caption: `Pre-order visits ${node.value} before its children.` })
    }
    if (node.left !== undefined) {
      frames.push({ current: node.left, visited: [...visited], stack: nextStack, queue: [], line: mode === 'pre' ? 3 : 2, caption: `Recurse left from ${node.value}.` })
      visit(node.left, nextStack)
    }
    if (mode === 'in') {
      visited.push(id)
      frames.push({ current: id, visited: [...visited], stack: nextStack, queue: [], line: 3, caption: `In-order visits ${node.value} between left and right.` })
    }
    if (node.right !== undefined) {
      frames.push({ current: node.right, visited: [...visited], stack: nextStack, queue: [], line: mode === 'post' ? 3 : 4, caption: `Recurse right from ${node.value}.` })
      visit(node.right, nextStack)
    }
    if (mode === 'post') {
      visited.push(id)
      frames.push({ current: id, visited: [...visited], stack: nextStack, queue: [], line: 4, caption: `Post-order visits ${node.value} after both children.` })
    }
    frames.push({ current: id, visited: [...visited], stack, queue: [], line: 5, caption: `Return from node ${node.value}.` })
  }
  if (nodes.has(0)) visit(0, [])
  frames.push({ visited: [...visited], stack: [], queue: [], line: 6, caption: 'Traversal complete.' })
  return frames
}

function bfsFrames(nodes: Map<number, TreeNode>): TreeFrame[] {
  const frames: TreeFrame[] = []
  const visited: number[] = []
  const queue = nodes.has(0) ? [0] : []
  frames.push({ visited: [], stack: [], queue: [...queue], line: 1, caption: 'Start BFS with the root in the queue.' })
  while (queue.length > 0) {
    frames.push({ current: queue[0], visited: [...visited], stack: [], queue: [...queue], line: 2, caption: `Queue front is ${nodes.get(queue[0])?.value}.` })
    const id = queue.shift()!
    visited.push(id)
    const node = nodes.get(id)
    frames.push({ current: id, visited: [...visited], stack: [], queue: [...queue], line: 3, caption: `Visit ${node?.value}; then enqueue its children.` })
    if (node?.left !== undefined) {
      queue.push(node.left)
      frames.push({ current: node.left, visited: [...visited], stack: [], queue: [...queue], line: 4, caption: `Enqueue left child ${nodes.get(node.left)?.value}.` })
    }
    if (node?.right !== undefined) {
      queue.push(node.right)
      frames.push({ current: node.right, visited: [...visited], stack: [], queue: [...queue], line: 5, caption: `Enqueue right child ${nodes.get(node.right)?.value}.` })
    }
  }
  frames.push({ visited: [...visited], stack: [], queue: [], line: 6, caption: 'Level-order traversal complete.' })
  return frames
}

function generate(mode: Mode, nodes: Map<number, TreeNode>) {
  return mode === 'level' ? bfsFrames(nodes) : dfsFrames(mode, nodes)
}

function layout(nodes: Map<number, TreeNode>, width: number) {
  const out = new Map<number, NodePos>()
  nodes.forEach((node) => {
    const slots = 2 ** node.level
    out.set(node.id, { x: ((node.pos + 1) * width) / (slots + 1), y: 38 + node.level * 72 })
  })
  return out
}

function randomTree(seed: number) {
  const rng = mulberry32(seed)
  const values: LevelValue[] = [Math.floor(rng() * 40) + 1]
  for (let i = 1; i < 15; i += 1) {
    const parent = Math.floor((i - 1) / 2)
    values[i] = values[parent] !== null && rng() > 0.28 ? Math.floor(rng() * 90) + 1 : null
  }
  while (values.length > 1 && values[values.length - 1] === null) values.pop()
  return values
}

export default function TreeTraversal() {
  const [mode, setMode] = useState<Mode>('in')
  const [input, setInput] = useState(serialize(fallback))
  const [seed, setSeed] = useState(8)
  const values = useMemo(() => parseLevelOrder(input), [input])
  const nodes = useMemo(() => buildTree(values), [values])
  const steps = useMemo(() => generate(mode, nodes), [mode, nodes])
  const player = usePlayer(steps, 1.7)
  const frame = player.step
  const [ref, box] = useSize<HTMLDivElement>()
  const w = Math.max(480, box.width)
  const maxLevel = Math.max(0, ...[...nodes.values()].map((n) => n.level))
  const h = Math.max(260, 94 + maxLevel * 74)
  const pos = layout(nodes, w)
  const visitedValues = frame.visited.map((id) => nodes.get(id)?.value).filter((v): v is number => v !== undefined)
  const stackValues = (mode === 'level' ? frame.queue : frame.stack).map((id) => nodes.get(id)?.value).filter((v): v is number => v !== undefined)

  return (
    <VizFrame
      title="Tree Traversals"
      description="DFS modes expose the recursion stack; BFS exposes the queue and visited order."
      controls={
        <>
          <Segmented value={mode} onChange={setMode} options={[{ value: 'pre', label: 'Pre' }, { value: 'in', label: 'In' }, { value: 'post', label: 'Post' }, { value: 'level', label: 'Level' }]} />
          <input value={input} onChange={(e) => setInput(e.target.value)} className="h-8 min-w-56 flex-1 rounded-lg border border-line bg-panel px-2 font-mono text-xs text-fg outline-none focus:ring-2 focus:ring-accent/40" aria-label="Level-order tree input" />
          <Button size="sm" variant="outline" onClick={() => { const nextSeed = seed + 1; setSeed(nextSeed); setInput(serialize(randomTree(nextSeed))) }}>
            <Shuffle size={14} /> Random tree
          </Button>
          <PlayerControls player={player} />
        </>
      }
      caption={frame.caption}
      legend={[
        { color: C.accent, label: 'current' },
        { color: C.ok, label: 'visited' },
        { color: C.warn, label: mode === 'level' ? 'queue' : 'call stack' },
      ]}
    >
      <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_18rem]">
        <div ref={ref} className="rounded-xl border border-line bg-panel/60 p-3">
          <svg width="100%" height={h} viewBox={`0 0 ${w} ${h}`} role="img" aria-label="Binary tree traversal">
            {[...nodes.values()].map((node) => {
              const p = pos.get(node.id)
              if (!p) return null
              return [node.left, node.right].map((child) => {
                if (child === undefined) return null
                const q = pos.get(child)
                if (!q) return null
                return <line key={`${node.id}-${child}`} x1={p.x} y1={p.y + 21} x2={q.x} y2={q.y - 21} stroke={C.lineStrong} strokeWidth="2" />
              })
            })}
            {[...nodes.values()].map((node) => {
              const p = pos.get(node.id)
              if (!p) return null
              const isVisited = frame.visited.includes(node.id)
              const isCurrent = frame.current === node.id
              const inFrontier = mode === 'level' ? frame.queue.includes(node.id) : frame.stack.includes(node.id)
              const color = isCurrent ? C.accent : isVisited ? C.ok : inFrontier ? C.warn : C.lineStrong
              return (
                <g key={node.id}>
                  <motion.circle cx={p.x} cy={p.y} r="22" fill={soft(color, isCurrent ? 24 : 14)} stroke={color} strokeWidth={isCurrent ? 3 : 2} initial={false} animate={{ scale: isCurrent ? 1.08 : 1 }} style={{ transformOrigin: `${p.x}px ${p.y}px` }} transition={{ type: 'spring', stiffness: 360, damping: 28 }} />
                  <text x={p.x} y={p.y + 5} textAnchor="middle" fill={C.fg} fontSize="13" fontWeight="700">
                    {node.value}
                  </text>
                </g>
              )
            })}
          </svg>
        </div>
        <div className="space-y-3">
          <div className="grid grid-cols-2 gap-2">
            <MetricCard label="visited" value={visitedValues.length} tone={C.ok} />
            <MetricCard label={mode === 'level' ? 'queue' : 'stack'} value={stackValues.length} tone={C.warn} />
          </div>
          <div className="rounded-xl border border-line bg-panel/80 p-3">
            <div className="mb-2 text-[11px] uppercase tracking-wide text-muted">visited order</div>
            <div className="flex min-h-8 flex-wrap gap-1.5">
              {visitedValues.length === 0 ? <span className="text-xs text-muted">none yet</span> : visitedValues.map((v, i) => <span key={`${v}-${i}`} className="rounded-md border border-line bg-subtle px-2 py-1 font-mono text-xs text-fg">{v}</span>)}
            </div>
          </div>
          <div className="rounded-xl border border-line bg-panel/80 p-3">
            <div className="mb-2 text-[11px] uppercase tracking-wide text-muted">{mode === 'level' ? 'queue' : 'call stack'}</div>
            <div className="flex min-h-8 flex-wrap gap-1.5">
              {stackValues.length === 0 ? <span className="text-xs text-muted">empty</span> : stackValues.map((v, i) => <span key={`${v}-${i}`} className="rounded-md border border-line bg-subtle px-2 py-1 font-mono text-xs text-fg">{v}</span>)}
            </div>
          </div>
          <PseudoCodePanel lines={code[mode]} active={frame.line} />
        </div>
      </div>
    </VizFrame>
  )
}
