import { useMemo, useState } from 'react'
import { motion } from 'framer-motion'
import { Shuffle } from 'lucide-react'
import { C, PlayerControls, VizFrame, mulberry32, usePlayer, useSize } from '../common'
import { Button, Select, Slider } from '../../components/ui'
import { MetricCard, PseudoCodePanel, indexRange, soft } from './_shared1'

type SortKind = 'bubble' | 'insertion' | 'selection' | 'merge' | 'quick' | 'heap'

interface SortFrame {
  values: number[]
  comparing: number[]
  swapping: number[]
  sorted: number[]
  pivot?: number
  line: number
  comparisons: number
  swaps: number
  caption: string
}

const options: { value: SortKind; label: string }[] = [
  { value: 'bubble', label: 'Bubble' },
  { value: 'insertion', label: 'Insertion' },
  { value: 'selection', label: 'Selection' },
  { value: 'merge', label: 'Merge' },
  { value: 'quick', label: 'Quick (Lomuto)' },
  { value: 'heap', label: 'Heap' },
]

const code: Record<SortKind, string[]> = {
  bubble: ['for end = n - 1 downto 1', '  for i = 0 .. end - 1', '    compare a[i], a[i+1]', '    if out of order: swap', '  end is now sorted'],
  insertion: ['for i = 1 .. n - 1', '  key = a[i]', '  while a[j] > key', '    shift a[j] right', '  insert key'],
  selection: ['for i = 0 .. n - 2', '  min = i', '  scan j = i + 1 .. n - 1', '  remember smaller min', '  swap a[i], a[min]'],
  merge: ['split range in half', 'sort left and right halves', 'compare merge-front values', 'write smaller value', 'copy remaining values'],
  quick: ['partition lo..hi', 'choose pivot = a[hi]', 'scan j from lo to hi - 1', 'if a[j] <= pivot: swap forward', 'place pivot, recurse sides'],
  heap: ['build max-heap', 'compare parent with children', 'swap with larger child', 'move max to sorted suffix', 'sift-down reduced heap'],
}

const complexity: Record<SortKind, { best: string; avg: string; worst: string; space: string; note: string }> = {
  bubble: { best: 'O(n)', avg: 'O(n²)', worst: 'O(n²)', space: 'O(1)', note: 'stable, in-place' },
  insertion: { best: 'O(n)', avg: 'O(n²)', worst: 'O(n²)', space: 'O(1)', note: 'stable, adaptive' },
  selection: { best: 'O(n²)', avg: 'O(n²)', worst: 'O(n²)', space: 'O(1)', note: 'not stable, few swaps' },
  merge: { best: 'O(n log n)', avg: 'O(n log n)', worst: 'O(n log n)', space: 'O(n)', note: 'stable, divide & conquer' },
  quick: { best: 'O(n log n)', avg: 'O(n log n)', worst: 'O(n²)', space: 'O(log n)', note: 'in-place partition' },
  heap: { best: 'O(n log n)', avg: 'O(n log n)', worst: 'O(n log n)', space: 'O(1)', note: 'not stable, in-place' },
}

function makeArray(size: number, seed: number) {
  const rng = mulberry32(seed)
  return Array.from({ length: size }, () => 8 + Math.floor(rng() * 92))
}

function pushFrame(frames: SortFrame[], values: number[], frame: Omit<SortFrame, 'values'>) {
  frames.push({ ...frame, values: [...values], comparing: [...frame.comparing], swapping: [...frame.swapping], sorted: [...frame.sorted] })
}

function bubbleFrames(input: number[]): SortFrame[] {
  const a = [...input]
  const frames: SortFrame[] = []
  const sorted = new Set<number>()
  let comparisons = 0
  let swaps = 0
  pushFrame(frames, a, { comparing: [], swapping: [], sorted: [], line: 1, comparisons, swaps, caption: 'Start bubble sort: largest values drift to the sorted suffix.' })
  for (let end = a.length - 1; end > 0; end -= 1) {
    for (let i = 0; i < end; i += 1) {
      comparisons += 1
      pushFrame(frames, a, { comparing: [i, i + 1], swapping: [], sorted: [...sorted], line: 3, comparisons, swaps, caption: `Compare a[${i}]=${a[i]} with a[${i + 1}]=${a[i + 1]}.` })
      if (a[i] > a[i + 1]) {
        ;[a[i], a[i + 1]] = [a[i + 1], a[i]]
        swaps += 1
        pushFrame(frames, a, { comparing: [], swapping: [i, i + 1], sorted: [...sorted], line: 4, comparisons, swaps, caption: `Swap because ${a[i + 1]} > ${a[i]}.` })
      }
    }
    sorted.add(end)
    pushFrame(frames, a, { comparing: [], swapping: [], sorted: [...sorted], line: 5, comparisons, swaps, caption: `Index ${end} is fixed; the sorted suffix grows.` })
  }
  sorted.add(0)
  pushFrame(frames, a, { comparing: [], swapping: [], sorted: indexRange(0, a.length - 1), line: 5, comparisons, swaps, caption: 'Array sorted.' })
  return frames
}

function insertionFrames(input: number[]): SortFrame[] {
  const a = [...input]
  const frames: SortFrame[] = []
  let comparisons = 0
  let swaps = 0
  pushFrame(frames, a, { comparing: [0], swapping: [], sorted: [0], line: 1, comparisons, swaps, caption: 'Start insertion sort with a sorted prefix of length 1.' })
  for (let i = 1; i < a.length; i += 1) {
    const key = a[i]
    let j = i - 1
    pushFrame(frames, a, { comparing: [i], swapping: [], sorted: indexRange(0, i - 1), line: 2, comparisons, swaps, caption: `Lift key ${key} from index ${i}.` })
    while (j >= 0) {
      comparisons += 1
      pushFrame(frames, a, { comparing: [j, j + 1], swapping: [], sorted: indexRange(0, i - 1), line: 3, comparisons, swaps, caption: `Compare a[${j}]=${a[j]} with key ${key}.` })
      if (a[j] <= key) break
      a[j + 1] = a[j]
      swaps += 1
      pushFrame(frames, a, { comparing: [], swapping: [j, j + 1], sorted: indexRange(0, i - 1), line: 4, comparisons, swaps, caption: `Shift ${a[j]} right to open a slot.` })
      j -= 1
    }
    a[j + 1] = key
    pushFrame(frames, a, { comparing: [j + 1], swapping: [], sorted: indexRange(0, i), line: 5, comparisons, swaps, caption: `Insert key ${key} at index ${j + 1}.` })
  }
  pushFrame(frames, a, { comparing: [], swapping: [], sorted: indexRange(0, a.length - 1), line: 5, comparisons, swaps, caption: 'Array sorted.' })
  return frames
}

function selectionFrames(input: number[]): SortFrame[] {
  const a = [...input]
  const frames: SortFrame[] = []
  const sorted = new Set<number>()
  let comparisons = 0
  let swaps = 0
  pushFrame(frames, a, { comparing: [], swapping: [], sorted: [], line: 1, comparisons, swaps, caption: 'Start selection sort: select the minimum for each open slot.' })
  for (let i = 0; i < a.length - 1; i += 1) {
    let min = i
    pushFrame(frames, a, { comparing: [min], swapping: [], sorted: [...sorted], line: 2, comparisons, swaps, caption: `Assume index ${i} is the minimum.` })
    for (let j = i + 1; j < a.length; j += 1) {
      comparisons += 1
      pushFrame(frames, a, { comparing: [min, j], swapping: [], sorted: [...sorted], line: 3, comparisons, swaps, caption: `Scan index ${j}; compare ${a[j]} with current min ${a[min]}.` })
      if (a[j] < a[min]) {
        min = j
        pushFrame(frames, a, { comparing: [min], swapping: [], sorted: [...sorted], line: 4, comparisons, swaps, caption: `New minimum found at index ${min}.` })
      }
    }
    if (min !== i) {
      ;[a[i], a[min]] = [a[min], a[i]]
      swaps += 1
      pushFrame(frames, a, { comparing: [], swapping: [i, min], sorted: [...sorted], line: 5, comparisons, swaps, caption: `Swap minimum into position ${i}.` })
    }
    sorted.add(i)
    pushFrame(frames, a, { comparing: [], swapping: [], sorted: [...sorted], line: 1, comparisons, swaps, caption: `Prefix through index ${i} is sorted.` })
  }
  sorted.add(a.length - 1)
  pushFrame(frames, a, { comparing: [], swapping: [], sorted: indexRange(0, a.length - 1), line: 5, comparisons, swaps, caption: 'Array sorted.' })
  return frames
}

function mergeFrames(input: number[]): SortFrame[] {
  const a = [...input]
  const frames: SortFrame[] = []
  let comparisons = 0
  let swaps = 0
  pushFrame(frames, a, { comparing: [], swapping: [], sorted: [], line: 1, comparisons, swaps, caption: 'Start merge sort: recursively split, then merge in order.' })
  const sort = (lo: number, hi: number) => {
    if (hi - lo <= 1) return
    const mid = Math.floor((lo + hi) / 2)
    pushFrame(frames, a, { comparing: indexRange(lo, hi - 1), swapping: [], sorted: [], line: 1, comparisons, swaps, caption: `Split range [${lo}, ${hi}) at ${mid}.` })
    sort(lo, mid)
    sort(mid, hi)
    const left = a.slice(lo, mid)
    const right = a.slice(mid, hi)
    let i = 0
    let j = 0
    let k = lo
    while (i < left.length && j < right.length) {
      comparisons += 1
      pushFrame(frames, a, { comparing: [lo + i, mid + j], swapping: [], sorted: [], line: 3, comparisons, swaps, caption: `Compare left ${left[i]} and right ${right[j]}.` })
      if (left[i] <= right[j]) {
        a[k] = left[i]
        i += 1
      } else {
        a[k] = right[j]
        j += 1
      }
      swaps += 1
      pushFrame(frames, a, { comparing: [], swapping: [k], sorted: indexRange(lo, k), line: 4, comparisons, swaps, caption: `Write ${a[k]} into merged index ${k}.` })
      k += 1
    }
    while (i < left.length) {
      a[k] = left[i]
      i += 1
      swaps += 1
      pushFrame(frames, a, { comparing: [], swapping: [k], sorted: indexRange(lo, k), line: 5, comparisons, swaps, caption: `Copy remaining left value ${a[k]} to index ${k}.` })
      k += 1
    }
    while (j < right.length) {
      a[k] = right[j]
      j += 1
      swaps += 1
      pushFrame(frames, a, { comparing: [], swapping: [k], sorted: indexRange(lo, k), line: 5, comparisons, swaps, caption: `Copy remaining right value ${a[k]} to index ${k}.` })
      k += 1
    }
  }
  sort(0, a.length)
  pushFrame(frames, a, { comparing: [], swapping: [], sorted: indexRange(0, a.length - 1), line: 4, comparisons, swaps, caption: 'All merge levels complete.' })
  return frames
}

function quickFrames(input: number[]): SortFrame[] {
  const a = [...input]
  const frames: SortFrame[] = []
  const sorted = new Set<number>()
  let comparisons = 0
  let swaps = 0
  pushFrame(frames, a, { comparing: [], swapping: [], sorted: [], line: 1, comparisons, swaps, caption: 'Start Lomuto quicksort.' })
  const partition = (lo: number, hi: number) => {
    const pivot = a[hi]
    let i = lo
    pushFrame(frames, a, { comparing: [hi], swapping: [], sorted: [...sorted], pivot: hi, line: 2, comparisons, swaps, caption: `Choose pivot ${pivot} at index ${hi}.` })
    for (let j = lo; j < hi; j += 1) {
      comparisons += 1
      pushFrame(frames, a, { comparing: [j, hi], swapping: [], sorted: [...sorted], pivot: hi, line: 3, comparisons, swaps, caption: `Compare a[${j}]=${a[j]} with pivot ${pivot}.` })
      if (a[j] <= pivot) {
        if (i !== j) {
          ;[a[i], a[j]] = [a[j], a[i]]
          swaps += 1
          pushFrame(frames, a, { comparing: [], swapping: [i, j], sorted: [...sorted], pivot: hi, line: 4, comparisons, swaps, caption: `Move ${a[i]} into the <= pivot partition.` })
        }
        i += 1
      }
    }
    ;[a[i], a[hi]] = [a[hi], a[i]]
    swaps += 1
    sorted.add(i)
    pushFrame(frames, a, { comparing: [], swapping: [i, hi], sorted: [...sorted], pivot: i, line: 5, comparisons, swaps, caption: `Place pivot at final index ${i}.` })
    return i
  }
  const qs = (lo: number, hi: number) => {
    if (lo > hi) return
    if (lo === hi) {
      sorted.add(lo)
      pushFrame(frames, a, { comparing: [], swapping: [], sorted: [...sorted], line: 5, comparisons, swaps, caption: `Single element at index ${lo} is sorted.` })
      return
    }
    pushFrame(frames, a, { comparing: indexRange(lo, hi), swapping: [], sorted: [...sorted], line: 1, comparisons, swaps, caption: `Partition range [${lo}, ${hi}].` })
    const p = partition(lo, hi)
    qs(lo, p - 1)
    qs(p + 1, hi)
  }
  qs(0, a.length - 1)
  pushFrame(frames, a, { comparing: [], swapping: [], sorted: indexRange(0, a.length - 1), line: 5, comparisons, swaps, caption: 'Array sorted.' })
  return frames
}

function heapFrames(input: number[]): SortFrame[] {
  const a = [...input]
  const frames: SortFrame[] = []
  const sorted = new Set<number>()
  let comparisons = 0
  let swaps = 0
  pushFrame(frames, a, { comparing: [], swapping: [], sorted: [], line: 1, comparisons, swaps, caption: 'Build a max-heap, then repeatedly extract the maximum.' })
  const siftDown = (size: number, root: number) => {
    let i = root
    while (true) {
      let largest = i
      const left = 2 * i + 1
      const right = 2 * i + 2
      if (left < size) {
        comparisons += 1
        pushFrame(frames, a, { comparing: [largest, left], swapping: [], sorted: [...sorted], line: 2, comparisons, swaps, caption: `Compare parent ${a[largest]} with left child ${a[left]}.` })
        if (a[left] > a[largest]) largest = left
      }
      if (right < size) {
        comparisons += 1
        pushFrame(frames, a, { comparing: [largest, right], swapping: [], sorted: [...sorted], line: 2, comparisons, swaps, caption: `Compare best ${a[largest]} with right child ${a[right]}.` })
        if (a[right] > a[largest]) largest = right
      }
      if (largest === i) return
      ;[a[i], a[largest]] = [a[largest], a[i]]
      swaps += 1
      pushFrame(frames, a, { comparing: [], swapping: [i, largest], sorted: [...sorted], line: 3, comparisons, swaps, caption: `Swap ${a[largest]} down with larger child ${a[i]}.` })
      i = largest
    }
  }
  for (let i = Math.floor(a.length / 2) - 1; i >= 0; i -= 1) siftDown(a.length, i)
  for (let end = a.length - 1; end > 0; end -= 1) {
    ;[a[0], a[end]] = [a[end], a[0]]
    swaps += 1
    sorted.add(end)
    pushFrame(frames, a, { comparing: [], swapping: [0, end], sorted: [...sorted], line: 4, comparisons, swaps, caption: `Move max ${a[end]} to sorted suffix index ${end}.` })
    siftDown(end, 0)
  }
  sorted.add(0)
  pushFrame(frames, a, { comparing: [], swapping: [], sorted: indexRange(0, a.length - 1), line: 5, comparisons, swaps, caption: 'Array sorted.' })
  return frames
}

function generate(kind: SortKind, values: number[]) {
  if (kind === 'bubble') return bubbleFrames(values)
  if (kind === 'insertion') return insertionFrames(values)
  if (kind === 'selection') return selectionFrames(values)
  if (kind === 'merge') return mergeFrames(values)
  if (kind === 'quick') return quickFrames(values)
  return heapFrames(values)
}

function fillFor(frame: SortFrame, i: number) {
  if (frame.sorted.includes(i)) return C.ok
  if (frame.swapping.includes(i)) return C.err
  if (frame.pivot === i) return C.accent2
  if (frame.comparing.includes(i)) return C.warn
  return C.series[i % C.series.length]
}

export default function Sorting() {
  const [algorithm, setAlgorithm] = useState<SortKind>('quick')
  const [size, setSize] = useState(18)
  const [seed, setSeed] = useState(42)
  const values = useMemo(() => makeArray(size, seed), [size, seed])
  const steps = useMemo(() => generate(algorithm, values), [algorithm, values])
  const player = usePlayer(steps, 6)
  const frame = player.step
  const [ref, box] = useSize<HTMLDivElement>()
  const w = Math.max(360, box.width)
  const h = 320
  const pad = 16
  const max = Math.max(...frame.values)
  const barGap = size > 28 ? 2 : 4
  const barW = Math.max(3, (w - pad * 2) / frame.values.length - barGap)
  const row = complexity[algorithm]

  return (
    <VizFrame
      title="Sorting Algorithms"
      description="Compare classic sorting strategies with animated comparisons, swaps, sorted regions, and exact operation counters."
      controls={
        <>
          <Select value={algorithm} onChange={setAlgorithm} options={options} />
          <Slider className="w-40" label="Array size" value={size} min={8} max={40} onChange={setSize} />
          <Button size="sm" variant="outline" onClick={() => setSeed((s) => s + 1)}>
            <Shuffle size={14} /> Randomize
          </Button>
          <PlayerControls player={player} maxSpeed={30} />
        </>
      }
      caption={frame.caption}
      legend={[
        { color: C.warn, label: 'comparing' },
        { color: C.err, label: 'swapping / writing' },
        { color: C.ok, label: 'sorted' },
      ]}
    >
      <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_18rem]">
        <div ref={ref} className="min-h-[340px] rounded-xl border border-line bg-panel/60 p-3">
          <svg width="100%" height={h} viewBox={`0 0 ${w} ${h}`} role="img" aria-label="Sorting bars">
            <line x1={pad} x2={w - pad} y1={h - 28} y2={h - 28} stroke={C.line} />
            {frame.values.map((v, i) => {
              const x = pad + i * ((w - pad * 2) / frame.values.length) + barGap / 2
              const height = Math.max(12, (v / max) * (h - 70))
              const y = h - 28 - height
              const fill = fillFor(frame, i)
              return (
                <motion.rect
                  key={i}
                  x={x}
                  width={barW}
                  rx={5}
                  initial={false}
                  animate={{ y, height }}
                  transition={{ type: 'spring', stiffness: 360, damping: 34 }}
                  fill={fill}
                  opacity={frame.sorted.includes(i) ? 0.95 : 0.84}
                />
              )
            })}
            {frame.values.length <= 24 &&
              frame.values.map((v, i) => {
                const x = pad + i * ((w - pad * 2) / frame.values.length) + barGap / 2 + barW / 2
                return (
                  <text key={`t-${i}`} x={x} y={h - 9} textAnchor="middle" fill={C.muted} fontSize="10" fontFamily="ui-monospace, SFMono-Regular, Menlo, monospace">
                    {v}
                  </text>
                )
              })}
          </svg>
        </div>
        <div className="space-y-3">
          <div className="grid grid-cols-2 gap-2">
            <MetricCard label="comparisons" value={frame.comparisons} tone={C.warn} />
            <MetricCard label="swaps / writes" value={frame.swaps} tone={C.err} />
          </div>
          <PseudoCodePanel lines={code[algorithm]} active={frame.line} />
          <div className="overflow-hidden rounded-xl border border-line bg-panel/80 text-xs">
            {(
              [
                ['best', row.best],
                ['average', row.avg],
                ['worst', row.worst],
                ['space', row.space],
                ['notes', row.note],
              ] as const
            ).map(([k, v], i) => (
              <div key={k} className={'flex items-center justify-between gap-3 px-3 py-1.5' + (i ? ' border-t border-line' : '')} style={i === 1 ? { background: soft(C.accent, 10) } : undefined}>
                <span className="text-muted">{k}</span>
                <span className="text-right font-mono text-fg">{v}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </VizFrame>
  )
}
