import { useMemo, useState } from 'react'
import { C, mulberry32, PlayerControls, usePlayer, useSize, VizFrame } from '../common'
import { Button, Segmented, Slider } from '../../components/ui'
import { MiniStat, Pill, PseudoCode } from './_shared2'

type Mode = 'merge' | 'rooms' | 'insert'

interface Interval {
  start: number
  end: number
}

interface IntervalFrame {
  intervals: Interval[]
  sorted: Interval[]
  active?: Interval
  merged: Interval[]
  heap: number[]
  rooms: number
  insert?: Interval
  line: number
  caption: string
}

const mergeCode = [
  { id: 1, text: 'sort intervals by start time' },
  { id: 2, text: 'for interval in sorted intervals' },
  { id: 3, text: 'if output empty or no overlap: append' },
  { id: 4, text: 'else merge with last output interval' },
  { id: 5, text: 'return merged output' },
]

const roomsCode = [
  { id: 1, text: 'sort meetings by start time' },
  { id: 2, text: 'for meeting: compare earliest end' },
  { id: 3, text: 'while minEnd <= start: free room' },
  { id: 4, text: 'push meeting end into min-heap' },
  { id: 5, text: 'answer = max heap size' },
]

const insertCode = [
  { id: 1, text: 'append intervals ending before new.start' },
  { id: 2, text: 'merge all overlaps with new interval' },
  { id: 3, text: 'append the merged new interval' },
  { id: 4, text: 'append intervals after new.end' },
  { id: 5, text: 'return final interval list' },
]

const initialIntervals: Interval[] = [
  { start: 1, end: 3 },
  { start: 2, end: 6 },
  { start: 8, end: 10 },
  { start: 9, end: 11 },
  { start: 13, end: 15 },
]

function randomIntervals(seed: number) {
  const rng = mulberry32(seed)
  return Array.from({ length: 6 }, () => {
    const start = Math.floor(rng() * 14)
    const end = start + 1 + Math.floor(rng() * 4)
    return { start, end }
  })
}

function sortIntervals(intervals: Interval[]) {
  return [...intervals].sort((a, b) => a.start - b.start || a.end - b.end)
}

function makeMergeFrames(intervals: Interval[]): IntervalFrame[] {
  const sorted = sortIntervals(intervals)
  const merged: Interval[] = []
  const frames: IntervalFrame[] = []
  const push = (line: number, caption: string, active?: Interval) => frames.push({ intervals, sorted, active, merged: merged.map((x) => ({ ...x })), heap: [], rooms: 0, line, caption })
  push(1, 'Sort intervals by start time before sweeping.')
  for (const interval of sorted) {
    push(2, `Sweep interval [${interval.start}, ${interval.end}].`, interval)
    const last = merged[merged.length - 1]
    if (!last || interval.start > last.end) {
      merged.push({ ...interval })
      push(3, `No overlap with output tail; append [${interval.start}, ${interval.end}].`, interval)
    } else {
      last.end = Math.max(last.end, interval.end)
      push(4, `Overlap detected; extend tail to [${last.start}, ${last.end}].`, interval)
    }
  }
  push(5, `Merged into ${merged.length} disjoint interval${merged.length === 1 ? '' : 's'}.`)
  return frames
}

function makeRoomsFrames(intervals: Interval[]): IntervalFrame[] {
  const sorted = sortIntervals(intervals)
  const heap: number[] = []
  let rooms = 0
  const frames: IntervalFrame[] = []
  const push = (line: number, caption: string, active?: Interval) => frames.push({ intervals, sorted, active, merged: [], heap: [...heap].sort((a, b) => a - b), rooms, line, caption })
  push(1, 'Sort meetings by start time; heap stores room end times.')
  for (const meeting of sorted) {
    push(2, `Meeting [${meeting.start}, ${meeting.end}] checks the earliest room end.`, meeting)
    heap.sort((a, b) => a - b)
    while (heap.length > 0 && heap[0] <= meeting.start) {
      const freed = heap.shift()!
      push(3, `Room ending at ${freed} is free before start ${meeting.start}.`, meeting)
    }
    heap.push(meeting.end)
    rooms = Math.max(rooms, heap.length)
    push(4, `Allocate room until ${meeting.end}; heap size is ${heap.length}.`, meeting)
    push(5, `Rooms needed so far = ${rooms}.`, meeting)
  }
  push(5, `Minimum meeting rooms = ${rooms}.`)
  return frames
}

function makeInsertFrames(intervals: Interval[], rawInsert: Interval): IntervalFrame[] {
  const sorted = sortIntervals(intervals)
  const insert = rawInsert.start <= rawInsert.end ? { ...rawInsert } : { start: rawInsert.end, end: rawInsert.start }
  const merged: Interval[] = []
  const frames: IntervalFrame[] = []
  const push = (line: number, caption: string, active?: Interval) => frames.push({ intervals, sorted, active, merged: merged.map((x) => ({ ...x })), heap: [], rooms: 0, insert: { ...insert }, line, caption })
  let i = 0
  push(1, `Insert new interval [${insert.start}, ${insert.end}] into a sorted disjoint list.`, insert)
  while (i < sorted.length && sorted[i].end < insert.start) {
    merged.push({ ...sorted[i] })
    push(1, `[${sorted[i].start}, ${sorted[i].end}] ends before the new interval; keep it left.`, sorted[i])
    i += 1
  }
  let current = { ...insert }
  while (i < sorted.length && sorted[i].start <= current.end) {
    push(2, `[${sorted[i].start}, ${sorted[i].end}] overlaps; absorb it into the new interval.`, sorted[i])
    current = { start: Math.min(current.start, sorted[i].start), end: Math.max(current.end, sorted[i].end) }
    push(2, `Merged new interval becomes [${current.start}, ${current.end}].`, current)
    i += 1
  }
  merged.push(current)
  push(3, `Append merged new interval [${current.start}, ${current.end}].`, current)
  while (i < sorted.length) {
    merged.push({ ...sorted[i] })
    push(4, `[${sorted[i].start}, ${sorted[i].end}] lies after the new interval; append right side.`, sorted[i])
    i += 1
  }
  push(5, `Insertion complete with ${merged.length} interval${merged.length === 1 ? '' : 's'}.`)
  return frames
}

function makeFrames(mode: Mode, intervals: Interval[], insert: Interval) {
  if (mode === 'merge') return makeMergeFrames(intervals)
  if (mode === 'rooms') return makeRoomsFrames(intervals)
  return makeInsertFrames(intervals, insert)
}

function Timeline({ frame, width }: { frame: IntervalFrame; width: number }) {
  const svgWidth = Math.max(560, width)
  const maxEnd = Math.max(16, ...frame.intervals.map((i) => i.end), frame.insert?.end ?? 0)
  const minStart = Math.min(0, ...frame.intervals.map((i) => i.start), frame.insert?.start ?? 0)
  const left = 44
  const right = 22
  const scale = (x: number) => left + ((x - minStart) / Math.max(1, maxEnd - minStart)) * (svgWidth - left - right)
  const rows = frame.intervals.length + 4
  const svgHeight = rows * 34 + 42
  const activeKey = frame.active ? `${frame.active.start}-${frame.active.end}` : ''
  const drawBar = (interval: Interval, y: number, color: string, key: string, opacity = 1) => (
    <g key={key}>
      <rect x={scale(interval.start)} y={y} width={Math.max(8, scale(interval.end) - scale(interval.start))} height={18} rx={8} fill={color} opacity={opacity} className="transition-all duration-300" />
      <text x={(scale(interval.start) + scale(interval.end)) / 2} y={y + 13} textAnchor="middle" className="fill-fg font-mono text-[10px]">{interval.start}-{interval.end}</text>
    </g>
  )

  return (
    <svg width="100%" viewBox={`0 0 ${svgWidth} ${svgHeight}`} className="rounded-2xl border border-line bg-panel">
      <line x1={left} x2={svgWidth - right} y1={30} y2={30} stroke={C.lineStrong} />
      {Array.from({ length: maxEnd - minStart + 1 }, (_, i) => i + minStart).filter((x) => x % 2 === 0).map((x) => (
        <g key={x}>
          <line x1={scale(x)} x2={scale(x)} y1={25} y2={svgHeight - 18} stroke={C.line} strokeDasharray="2 6" />
          <text x={scale(x)} y={20} textAnchor="middle" className="fill-muted font-mono text-[10px]">{x}</text>
        </g>
      ))}
      <text x={12} y={62} className="fill-muted text-[11px]">input</text>
      {frame.intervals.map((interval, i) => {
        const active = `${interval.start}-${interval.end}` === activeKey
        return drawBar(interval, 50 + i * 28, active ? C.accent : C.series[i % C.series.length], `input-${i}`, active ? 1 : 0.58)
      })}
      {frame.insert && (
        <>
          <text x={12} y={50 + frame.intervals.length * 28 + 32} className="fill-muted text-[11px]">new</text>
          {drawBar(frame.insert, 50 + frame.intervals.length * 28 + 18, C.warn, 'new', 0.75)}
        </>
      )}
      <text x={12} y={svgHeight - 36} className="fill-muted text-[11px]">{frame.heap.length > 0 ? 'heap' : 'output'}</text>
      {frame.merged.map((interval, i) => drawBar(interval, svgHeight - 52 - (i % 2) * 24, C.ok, `merged-${i}`, 0.9))}
      {frame.heap.map((end, i) => drawBar({ start: end - 0.35, end: end + 0.35 }, svgHeight - 52 - (i % 3) * 23, C.info, `heap-${i}`, 0.9))}
      {frame.active && <line x1={scale(frame.active.start)} x2={scale(frame.active.start)} y1={34} y2={svgHeight - 18} stroke={C.accent} strokeWidth={2} strokeDasharray="5 4" />}
    </svg>
  )
}

export default function Intervals() {
  const [mode, setMode] = useState<Mode>('merge')
  const [seed, setSeed] = useState(0)
  const [insertStart, setInsertStart] = useState(4)
  const [insertEnd, setInsertEnd] = useState(12)
  const [ref, size] = useSize<HTMLDivElement>()
  const intervals = useMemo(() => (seed === 0 ? initialIntervals : randomIntervals(seed)), [seed])
  const insert = useMemo(() => ({ start: Math.min(insertStart, insertEnd), end: Math.max(insertStart, insertEnd) }), [insertEnd, insertStart])
  const steps = useMemo(() => makeFrames(mode, intervals, insert), [insert, intervals, mode])
  const player = usePlayer(steps, 3)
  const frame = player.step
  const lines = mode === 'merge' ? mergeCode : mode === 'rooms' ? roomsCode : insertCode

  return (
    <VizFrame
      title="Intervals: Merge, Meeting Rooms, Insert"
      description="Sort intervals, sweep from left to right, and keep just enough state to make the greedy proof visual."
      controls={
        <>
          <Segmented options={[{ value: 'merge', label: 'Merge' }, { value: 'rooms', label: 'Rooms II' }, { value: 'insert', label: 'Insert' }]} value={mode} onChange={setMode} />
          {mode === 'insert' && (
            <>
              <Slider label="new start" min={0} max={15} value={insertStart} onChange={setInsertStart} className="w-28" />
              <Slider label="new end" min={0} max={16} value={insertEnd} onChange={setInsertEnd} className="w-28" />
            </>
          )}
          <Button size="sm" variant="outline" onClick={() => setSeed((s) => s + 1)}>Randomize</Button>
          <PlayerControls player={player} maxSpeed={8} />
        </>
      }
      caption={frame.caption}
      legend={[
        { color: C.accent, label: 'active interval / sweep line' },
        { color: C.ok, label: 'merged output' },
        { color: C.info, label: 'room heap end time' },
      ]}
    >
      <div ref={ref} className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_300px]">
        <Timeline frame={frame} width={size.width - 320} />
        <div className="flex flex-col gap-3">
          <div className="grid grid-cols-2 gap-2">
            <MiniStat label={mode === 'rooms' ? 'rooms' : 'output'} value={mode === 'rooms' ? frame.rooms : frame.merged.length} tone="ok" />
            <MiniStat label="heap size" value={frame.heap.length} tone="info" />
          </div>
          <div className="rounded-xl border border-line bg-panel p-3">
            <div className="mb-2 text-[11px] font-semibold uppercase tracking-wide text-muted">{mode === 'rooms' ? 'Min-heap of end times' : 'Current output row'}</div>
            <div className="flex flex-wrap gap-1.5">
              {mode === 'rooms'
                ? frame.heap.length === 0 ? <Pill>empty</Pill> : frame.heap.map((end, i) => <Pill key={`${end}-${i}`} tone={i === 0 ? 'accent' : 'info'}>{end}</Pill>)
                : frame.merged.length === 0 ? <Pill>empty</Pill> : frame.merged.map((intv, i) => <Pill key={`${intv.start}-${intv.end}-${i}`} tone="ok">[{intv.start},{intv.end}]</Pill>)}
            </div>
          </div>
          <PseudoCode lines={lines} active={frame.line} />
        </div>
      </div>
    </VizFrame>
  )
}
