import { useMemo, useState } from 'react'
import { Shuffle } from 'lucide-react'
import { motion } from 'framer-motion'
import { C, PlayerControls, VizFrame, mulberry32, usePlayer, useSize } from '../common'
import { Button } from '../../components/ui'
import { ArrayCell, MetricCard, PseudoCodePanel, soft } from './_shared1'

type Phase = 'push' | 'pop' | 'heapify'

interface HeapFrame {
  heap: number[]
  active: number[]
  swapping: number[]
  line: number
  caption: string
  phase: Phase
  removed?: number
}

interface HeapResult {
  frames: HeapFrame[]
  result: number[]
}

interface Pos {
  x: number
  y: number
}

const initial = [1, 2, 6, 5, 3, 8, 9]

const code: Record<Phase, string[]> = {
  push: ['append value at end', 'while child < parent', 'swap child with parent', 'move child pointer up', 'heap property restored', 'done'],
  pop: ['save min at root', 'move last value to root', 'while parent > smaller child', 'swap down with smaller child', 'heap property restored', 'return min'],
  heapify: ['start from last parent', 'sift down each parent', 'choose smaller child', 'swap if child is smaller', 'move to next parent', 'heap built'],
}

function cloneFrame(heap: number[], frame: Omit<HeapFrame, 'heap'>): HeapFrame {
  return { ...frame, heap: [...heap], active: [...frame.active], swapping: [...frame.swapping] }
}

function siftUpFrames(heap: number[], start: number, frames: HeapFrame[], phase: Phase) {
  let child = start
  while (child > 0) {
    const parent = Math.floor((child - 1) / 2)
    frames.push(cloneFrame(heap, { active: [parent, child], swapping: [], line: 2, phase, caption: `Compare child ${heap[child]} with parent ${heap[parent]}.` }))
    if (heap[parent] <= heap[child]) break
    ;[heap[parent], heap[child]] = [heap[child], heap[parent]]
    frames.push(cloneFrame(heap, { active: [], swapping: [parent, child], line: 3, phase, caption: `Swap ${heap[parent]} upward; min-heap order improves.` }))
    child = parent
    frames.push(cloneFrame(heap, { active: [child], swapping: [], line: 4, phase, caption: `Continue sifting from index ${child}.` }))
  }
}

function siftDownFrames(heap: number[], start: number, frames: HeapFrame[], phase: Phase, size = heap.length) {
  let parent = start
  while (true) {
    const left = parent * 2 + 1
    const right = parent * 2 + 2
    if (left >= size) break
    let child = left
    frames.push(cloneFrame(heap, { active: [parent, left], swapping: [], line: 3, phase, caption: `Left child ${heap[left]} is the first candidate.` }))
    if (right < size) {
      frames.push(cloneFrame(heap, { active: [left, right], swapping: [], line: 3, phase, caption: `Choose smaller child between ${heap[left]} and ${heap[right]}.` }))
      if (heap[right] < heap[left]) child = right
    }
    frames.push(cloneFrame(heap, { active: [parent, child], swapping: [], line: 3, phase, caption: `Compare parent ${heap[parent]} with smaller child ${heap[child]}.` }))
    if (heap[parent] <= heap[child]) break
    ;[heap[parent], heap[child]] = [heap[child], heap[parent]]
    frames.push(cloneFrame(heap, { active: [], swapping: [parent, child], line: 4, phase, caption: `Swap down so ${heap[parent]} rises above ${heap[child]}.` }))
    parent = child
  }
}

function pushFrames(heapInput: number[], value: number): HeapResult {
  const heap = [...heapInput, value]
  const frames: HeapFrame[] = [cloneFrame(heapInput, { active: [], swapping: [], line: 1, phase: 'push', caption: `Push ${value}: append it after the current heap.` })]
  frames.push(cloneFrame(heap, { active: [heap.length - 1], swapping: [], line: 1, phase: 'push', caption: `${value} appended at index ${heap.length - 1}.` }))
  siftUpFrames(heap, heap.length - 1, frames, 'push')
  frames.push(cloneFrame(heap, { active: [0], swapping: [], line: 5, phase: 'push', caption: 'Heap property restored after push.' }))
  return { frames, result: heap }
}

function popFrames(heapInput: number[]): HeapResult {
  if (heapInput.length === 0) {
    const frames = [cloneFrame([], { active: [], swapping: [], line: 6, phase: 'pop', caption: 'Heap is empty; nothing to pop.' })]
    return { frames, result: [] }
  }
  const heap = [...heapInput]
  const removed = heap[0]
  const frames: HeapFrame[] = [cloneFrame(heap, { active: [0], swapping: [], line: 1, phase: 'pop', caption: `Pop min ${removed} from the root.`, removed })]
  const last = heap.pop()
  if (heap.length === 0) {
    frames.push(cloneFrame([], { active: [], swapping: [], line: 6, phase: 'pop', caption: `Returned ${removed}; heap is now empty.`, removed }))
    return { frames, result: [] }
  }
  heap[0] = last ?? heap[0]
  frames.push(cloneFrame(heap, { active: [0], swapping: [], line: 2, phase: 'pop', caption: `Move last value ${heap[0]} to the root.`, removed }))
  siftDownFrames(heap, 0, frames, 'pop')
  frames.push(cloneFrame(heap, { active: [0], swapping: [], line: 6, phase: 'pop', caption: `Returned ${removed}; heap property restored.`, removed }))
  return { frames, result: heap }
}

function heapifyFrames(values: number[]): HeapResult {
  const heap = [...values]
  const frames: HeapFrame[] = [cloneFrame(heap, { active: [], swapping: [], line: 1, phase: 'heapify', caption: 'Heapify starts at the last parent and sifts downward.' })]
  for (let i = Math.floor(heap.length / 2) - 1; i >= 0; i -= 1) {
    frames.push(cloneFrame(heap, { active: [i], swapping: [], line: 2, phase: 'heapify', caption: `Sift down parent index ${i}.` }))
    siftDownFrames(heap, i, frames, 'heapify')
    frames.push(cloneFrame(heap, { active: [i], swapping: [], line: 5, phase: 'heapify', caption: `Subtree rooted at index ${i} is a valid min-heap.` }))
  }
  frames.push(cloneFrame(heap, { active: [0], swapping: [], line: 6, phase: 'heapify', caption: 'All parents processed; min-heap is built.' }))
  return { frames, result: heap }
}

function randomValues(seed: number) {
  const rng = mulberry32(seed)
  return Array.from({ length: 9 }, () => 1 + Math.floor(rng() * 39))
}

function treePositions(count: number, width: number) {
  const out = new Map<number, Pos>()
  for (let i = 0; i < count; i += 1) {
    const level = Math.floor(Math.log2(i + 1))
    const pos = i - (2 ** level - 1)
    const slots = 2 ** level
    out.set(i, { x: ((pos + 1) * width) / (slots + 1), y: 42 + level * 72 })
  }
  return out
}

export default function Heap() {
  const [heap, setHeap] = useState(initial)
  const [valueText, setValueText] = useState('4')
  const [seed, setSeed] = useState(3)
  const [frames, setFrames] = useState<HeapFrame[]>(() => heapifyFrames(initial).frames)
  const player = usePlayer(frames, 2.5)
  const frame = player.step
  const [ref, box] = useSize<HTMLDivElement>()
  const w = Math.max(420, box.width)
  const levels = frame.heap.length === 0 ? 1 : Math.floor(Math.log2(frame.heap.length)) + 1
  const h = Math.max(270, 78 + levels * 72)
  const pos = useMemo(() => treePositions(frame.heap.length, w), [frame.heap.length, w])
  const pushValue = Number.isFinite(Number(valueText)) ? Number(valueText) : 0

  const runPush = () => {
    const next = pushFrames(heap, pushValue)
    setHeap(next.result)
    setFrames(next.frames)
  }
  const runPop = () => {
    const next = popFrames(heap)
    setHeap(next.result)
    setFrames(next.frames)
  }
  const runHeapify = () => {
    const nextSeed = seed + 1
    const values = randomValues(nextSeed)
    const next = heapifyFrames(values)
    setSeed(nextSeed)
    setHeap(next.result)
    setFrames(next.frames)
  }

  return (
    <VizFrame
      title="Binary Min-Heap"
      description="See the same heap as an array and a tree while push, pop-min and heapify perform sift operations."
      controls={
        <>
          <label className="flex items-center gap-2 text-xs text-muted">
            value
            <input value={valueText} onChange={(e) => setValueText(e.target.value)} inputMode="numeric" className="h-8 w-20 rounded-lg border border-line bg-panel px-2 font-mono text-sm text-fg outline-none focus:ring-2 focus:ring-accent/40" />
          </label>
          <Button size="sm" variant="outline" onClick={runPush}>push(value)</Button>
          <Button size="sm" variant="outline" onClick={runPop}>pop-min</Button>
          <Button size="sm" variant="outline" onClick={runHeapify}><Shuffle size={14} /> heapify random</Button>
          <PlayerControls player={player} />
        </>
      }
      caption={frame.caption}
      legend={[
        { color: C.accent, label: 'active comparison' },
        { color: C.err, label: 'swap' },
        { color: C.ok, label: 'root / minimum' },
      ]}
    >
      <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_18rem]">
        <div className="space-y-4 rounded-xl border border-line bg-panel/60 p-4" ref={ref}>
          <div className="grid gap-2" style={{ gridTemplateColumns: `repeat(${Math.max(1, frame.heap.length)}, minmax(2.1rem, 1fr))` }}>
            {frame.heap.length === 0 ? (
              <div className="rounded-xl border border-dashed border-line p-4 text-center text-sm text-muted">empty heap</div>
            ) : (
              frame.heap.map((v, i) => {
                const swap = frame.swapping.includes(i)
                const active = frame.active.includes(i)
                return <ArrayCell key={`${i}-${v}`} value={v} index={i} top={i === 0 ? 'min' : undefined} active={active || swap || i === 0} color={swap ? C.err : i === 0 ? C.ok : active ? C.accent : undefined} />
              })
            )}
          </div>
          <svg width="100%" height={h} viewBox={`0 0 ${w} ${h}`} role="img" aria-label="Heap tree">
            {frame.heap.map((_, i) => {
              if (i === 0) return null
              const parent = Math.floor((i - 1) / 2)
              const a = pos.get(parent)
              const b = pos.get(i)
              if (!a || !b) return null
              return <line key={`e-${i}`} x1={a.x} y1={a.y + 20} x2={b.x} y2={b.y - 20} stroke={C.lineStrong} strokeWidth="2" />
            })}
            {frame.heap.map((v, i) => {
              const p = pos.get(i)
              if (!p) return null
              const swap = frame.swapping.includes(i)
              const active = frame.active.includes(i)
              const color = swap ? C.err : i === 0 ? C.ok : active ? C.accent : C.lineStrong
              return (
                <g key={`${v}-${i}`}>
                  <motion.circle cx={p.x} cy={p.y} r="21" fill={soft(color, active || swap || i === 0 ? 20 : 10)} stroke={color} strokeWidth={active || swap || i === 0 ? 3 : 2} initial={false} animate={{ scale: active || swap ? 1.08 : 1 }} style={{ transformOrigin: `${p.x}px ${p.y}px` }} transition={{ type: 'spring', stiffness: 360, damping: 30 }} />
                  <text x={p.x} y={p.y + 5} textAnchor="middle" fill={C.fg} fontSize="13" fontWeight="700">{v}</text>
                </g>
              )
            })}
          </svg>
        </div>
        <div className="space-y-3">
          <div className="grid grid-cols-2 gap-2">
            <MetricCard label="size" value={frame.heap.length} tone={C.accent} />
            <MetricCard label="min" value={frame.heap[0] ?? '—'} tone={C.ok} />
          </div>
          <MetricCard label="last pop" value={frame.removed ?? '—'} tone={frame.removed === undefined ? C.muted : C.err} sub={`stored heap size: ${heap.length}`} />
          <PseudoCodePanel lines={code[frame.phase]} active={frame.line} />
        </div>
      </div>
    </VizFrame>
  )
}
