import { useMemo, useState } from 'react'
import { motion } from 'framer-motion'
import { C, PlayerControls, VizFrame, usePlayer, useSize } from '../common'
import { Segmented } from '../../components/ui'
import { MetricCard, PseudoCodePanel, soft } from './_shared1'

type Mode = 'reverse' | 'cycle' | 'middle'

interface ListFrame {
  values: number[]
  next: number[]
  line: number
  caption: string
  prev?: number
  curr?: number
  nextPtr?: number
  slow?: number
  fast?: number
  done?: boolean
}

interface Pos {
  x: number
  y: number
}

const code: Record<Mode, string[]> = {
  reverse: ['prev = null; curr = head', 'while curr != null', 'next = curr.next', 'curr.next = prev', 'prev = curr; curr = next', 'return prev'],
  cycle: ['slow = fast = head', 'while fast and fast.next', 'slow = slow.next', 'fast = fast.next.next', 'if slow == fast: cycle found', 'return no cycle'],
  middle: ['slow = fast = head', 'while fast and fast.next', 'slow = slow.next', 'fast = fast.next.next', 'when loop stops, slow is middle', 'return slow'],
}

function reverseFrames(): ListFrame[] {
  const values = [1, 2, 3, 4, 5]
  const next = [1, 2, 3, 4, -1]
  const frames: ListFrame[] = [{ values, next: [...next], prev: -1, curr: 0, line: 1, caption: 'Start with prev = null and curr at the head.' }]
  let prev = -1
  let curr = 0
  while (curr !== -1) {
    const nextPtr = next[curr]
    frames.push({ values, next: [...next], prev, curr, nextPtr, line: 3, caption: `Save next pointer: node ${values[curr]}.next is ${nextPtr === -1 ? 'null' : values[nextPtr]}.` })
    next[curr] = prev
    frames.push({ values, next: [...next], prev, curr, nextPtr, line: 4, caption: `Reverse node ${values[curr]}'s arrow to prev.` })
    prev = curr
    curr = nextPtr
    frames.push({ values, next: [...next], prev, curr, nextPtr, line: 5, caption: `Advance prev to ${values[prev]} and curr to ${curr === -1 ? 'null' : values[curr]}.` })
  }
  frames.push({ values, next: [...next], prev, curr: -1, line: 6, done: true, caption: `Reversal complete; new head is ${values[prev]}.` })
  return frames
}

function cycleFrames(): ListFrame[] {
  const values = [1, 2, 3, 4, 5, 6]
  const next = [1, 2, 3, 4, 5, 2]
  const frames: ListFrame[] = [{ values, next, slow: 0, fast: 0, line: 1, caption: 'Floyd cycle detection starts slow and fast at head.' }]
  let slow = 0
  let fast = 0
  for (let step = 0; step < 8; step += 1) {
    if (fast === -1 || next[fast] === -1) break
    slow = next[slow]
    frames.push({ values, next, slow, fast, line: 3, caption: `Slow moves one step to node ${values[slow]}.` })
    fast = next[next[fast]]
    frames.push({ values, next, slow, fast, line: 4, caption: `Fast moves two steps to node ${values[fast]}.` })
    if (slow === fast) {
      frames.push({ values, next, slow, fast, line: 5, done: true, caption: `Slow and fast meet at node ${values[slow]}; a cycle exists.` })
      return frames
    }
  }
  frames.push({ values, next, slow, fast, line: 6, done: true, caption: 'Fast reached null; no cycle.' })
  return frames
}

function middleFrames(): ListFrame[] {
  const values = [1, 2, 3, 4, 5, 6, 7]
  const next = [1, 2, 3, 4, 5, 6, -1]
  const frames: ListFrame[] = [{ values, next, slow: 0, fast: 0, line: 1, caption: 'Slow and fast start at head.' }]
  let slow = 0
  let fast = 0
  while (fast !== -1 && next[fast] !== -1) {
    slow = next[slow]
    frames.push({ values, next, slow, fast, line: 3, caption: `Slow advances to node ${values[slow]}.` })
    fast = next[next[fast]]
    frames.push({ values, next, slow, fast, line: 4, caption: `Fast jumps to ${fast === -1 ? 'null' : `node ${values[fast]}`}.` })
  }
  frames.push({ values, next, slow, fast, line: 5, done: true, caption: `Fast cannot continue; slow points at middle node ${values[slow]}.` })
  return frames
}

function positions(count: number, width: number, height: number) {
  const left = 56
  const right = width - 56
  const y = height / 2
  return Array.from({ length: count }, (_, i) => ({ x: left + (i * (right - left)) / Math.max(1, count - 1), y }))
}

function edgePath(from: number, to: number, pos: Pos[], radius: number) {
  const a = pos[from]
  if (to < 0) return `M ${a.x + radius} ${a.y} L ${a.x + radius + 34} ${a.y}`
  const b = pos[to]
  if (to === from + 1) return `M ${a.x + radius} ${a.y} L ${b.x - radius} ${b.y}`
  const startX = to < from ? a.x - radius : a.x + radius
  const endX = to < from ? b.x + radius : b.x - radius
  const curveY = a.y + (to < from ? 92 : -72)
  return `M ${startX} ${a.y} Q ${(startX + endX) / 2} ${curveY} ${endX} ${b.y}`
}

function pointerLabels(frame: ListFrame, mode: Mode, idx: number) {
  const labels: { text: string; color: string }[] = []
  if (mode === 'reverse') {
    if (frame.prev === idx) labels.push({ text: 'prev', color: C.ok })
    if (frame.curr === idx) labels.push({ text: 'curr', color: C.accent })
    if (frame.nextPtr === idx) labels.push({ text: 'next', color: C.warn })
  } else {
    if (frame.slow === idx) labels.push({ text: 'slow', color: C.ok })
    if (frame.fast === idx) labels.push({ text: 'fast', color: C.err })
  }
  return labels
}

export default function LinkedList() {
  const [mode, setMode] = useState<Mode>('reverse')
  const steps = useMemo(() => (mode === 'reverse' ? reverseFrames() : mode === 'cycle' ? cycleFrames() : middleFrames()), [mode])
  const player = usePlayer(steps, 1.8)
  const frame = player.step
  const [ref, box] = useSize<HTMLDivElement>()
  const w = Math.max(420, box.width)
  const h = mode === 'cycle' ? 330 : 290
  const pos = positions(frame.values.length, w, h)
  const radius = 22
  const markerId = `ll-arrow-${mode}`

  return (
    <VizFrame
      title="Linked List Pointers"
      description="Pointer labels and arrows make reversal, Floyd cycle detection, and middle-node search explicit."
      controls={
        <>
          <Segmented value={mode} onChange={setMode} options={[{ value: 'reverse', label: 'Reverse' }, { value: 'cycle', label: 'Detect cycle' }, { value: 'middle', label: 'Find middle' }]} />
          <PlayerControls player={player} />
        </>
      }
      caption={frame.caption}
      legend={[
        { color: C.accent, label: mode === 'reverse' ? 'curr' : 'fast' },
        { color: C.ok, label: mode === 'reverse' ? 'prev' : 'slow' },
        { color: C.warn, label: 'saved next / arrow' },
      ]}
    >
      <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_18rem]">
        <div ref={ref} className="rounded-xl border border-line bg-panel/60 p-3">
          <svg width="100%" height={h} viewBox={`0 0 ${w} ${h}`} role="img" aria-label="Linked list pointer diagram">
            <defs>
              <marker id={markerId} markerWidth="8" markerHeight="8" refX="7" refY="4" orient="auto" markerUnits="strokeWidth">
                <path d="M0,0 L8,4 L0,8 Z" fill={C.muted} />
              </marker>
            </defs>
            {frame.next.map((to, from) => (
              <motion.path key={`${from}-${to}`} d={edgePath(from, to, pos, radius)} fill="none" stroke={to < from ? C.warn : C.muted} strokeWidth="2.2" markerEnd={`url(#${markerId})`} initial={false} animate={{ opacity: 1 }} transition={{ duration: 0.25 }} />
            ))}
            {frame.next.map((to, from) =>
              to < 0 ? (
                <text key={`null-${from}`} x={pos[from].x + radius + 42} y={pos[from].y + 4} fill={C.muted} fontSize="11" fontFamily="ui-monospace, SFMono-Regular, Menlo, monospace">
                  null
                </text>
              ) : null,
            )}
            {frame.values.map((v, i) => {
              const labels = pointerLabels(frame, mode, i)
              const active = labels.length > 0
              const fill = active ? soft(labels[0].color, 18) : C.panel
              return (
                <g key={`${v}-${i}`}>
                  <motion.circle cx={pos[i].x} cy={pos[i].y} r={radius} fill={fill} stroke={active ? labels[0].color : C.lineStrong} strokeWidth={active ? 3 : 2} initial={false} animate={{ scale: active ? 1.06 : 1 }} style={{ transformOrigin: `${pos[i].x}px ${pos[i].y}px` }} />
                  <text x={pos[i].x} y={pos[i].y + 5} textAnchor="middle" fill={C.fg} fontSize="14" fontWeight="700">
                    {v}
                  </text>
                  {labels.map((label, j) => (
                    <g key={label.text}>
                      <rect x={pos[i].x - 21} y={pos[i].y - 58 - j * 23} width="42" height="18" rx="9" fill={soft(label.color, 18)} stroke={label.color} />
                      <text x={pos[i].x} y={pos[i].y - 45 - j * 23} textAnchor="middle" fill={label.color} fontSize="10" fontWeight="700">
                        {label.text}
                      </text>
                    </g>
                  ))}
                </g>
              )
            })}
          </svg>
        </div>
        <div className="space-y-3">
          <div className="grid grid-cols-2 gap-2">
            {mode === 'reverse' ? (
              <>
                <MetricCard label="prev" value={frame.prev === -1 || frame.prev === undefined ? 'null' : frame.values[frame.prev]} tone={C.ok} />
                <MetricCard label="curr" value={frame.curr === -1 || frame.curr === undefined ? 'null' : frame.values[frame.curr]} tone={C.accent} />
              </>
            ) : (
              <>
                <MetricCard label="slow" value={frame.slow === undefined ? '—' : frame.values[frame.slow]} tone={C.ok} />
                <MetricCard label="fast" value={frame.fast === -1 || frame.fast === undefined ? 'null' : frame.values[frame.fast]} tone={C.err} />
              </>
            )}
          </div>
          <MetricCard label="status" value={frame.done ? 'done' : 'running'} tone={frame.done ? C.ok : C.accent} sub={mode === 'cycle' ? 'cycle edge: 6 → 3' : undefined} />
          <PseudoCodePanel lines={code[mode]} active={frame.line} />
        </div>
      </div>
    </VizFrame>
  )
}
