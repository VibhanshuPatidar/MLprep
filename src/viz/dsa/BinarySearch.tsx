import { useMemo, useState } from 'react'
import { C, PlayerControls, VizFrame, usePlayer, useSize } from '../common'
import { Segmented } from '../../components/ui'
import { ArrayCell, MetricCard, PseudoCodePanel, soft } from './_shared1'

type Variant = 'exact' | 'lower' | 'rotated'

interface SearchFrame {
  lo: number
  hi: number
  mid?: number
  eliminated: number[]
  found?: number
  answer?: number
  line: number
  caption: string
}

const sorted = [2, 4, 6, 7, 9, 11, 14, 18, 21, 25, 29]
const rotated = [14, 18, 21, 25, 29, 2, 4, 6, 7, 9, 11]

const code: Record<Variant, string[]> = {
  exact: ['lo = 0, hi = n - 1', 'while lo <= hi', 'mid = lo + (hi - lo) // 2', 'if nums[mid] == target: return mid', 'if nums[mid] < target: lo = mid + 1', 'else: hi = mid - 1'],
  lower: ['lo = 0, hi = n', 'while lo < hi', 'mid = lo + (hi - lo) // 2', 'if nums[mid] < target: lo = mid + 1', 'else: hi = mid', 'return lo'],
  rotated: ['lo = 0, hi = n - 1', 'while lo <= hi', 'mid = lo + (hi - lo) // 2', 'if nums[mid] == target: return mid', 'decide which half is sorted', 'discard the impossible half'],
}

function outsideInclusive(n: number, lo: number, hi: number) {
  return Array.from({ length: n }, (_, i) => i).filter((i) => i < lo || i > hi)
}

function outsideHalfOpen(n: number, lo: number, hi: number) {
  return Array.from({ length: n }, (_, i) => i).filter((i) => i < lo || i >= hi)
}

function exactFrames(nums: number[], target: number): SearchFrame[] {
  const frames: SearchFrame[] = [{ lo: 0, hi: nums.length - 1, eliminated: [], line: 1, caption: `Search for ${target} in a sorted array.` }]
  let lo = 0
  let hi = nums.length - 1
  while (lo <= hi) {
    const mid = Math.floor((lo + hi) / 2)
    frames.push({ lo, hi, mid, eliminated: outsideInclusive(nums.length, lo, hi), line: 3, caption: `mid = ${mid}; nums[mid] = ${nums[mid]}.` })
    if (nums[mid] === target) {
      frames.push({ lo, hi, mid, found: mid, answer: mid, eliminated: outsideInclusive(nums.length, lo, hi), line: 4, caption: `Found ${target} at index ${mid}.` })
      return frames
    }
    if (nums[mid] < target) {
      lo = mid + 1
      frames.push({ lo, hi, mid, eliminated: outsideInclusive(nums.length, lo, hi), line: 5, caption: `${nums[mid]} < ${target}; eliminate the left half through index ${mid}.` })
    } else {
      hi = mid - 1
      frames.push({ lo, hi, mid, eliminated: outsideInclusive(nums.length, lo, hi), line: 6, caption: `${nums[mid]} > ${target}; eliminate the right half from index ${mid}.` })
    }
  }
  frames.push({ lo, hi, eliminated: outsideInclusive(nums.length, lo, hi), answer: -1, line: 2, caption: `${target} is not present; the interval is empty.` })
  return frames
}

function lowerFrames(nums: number[], target: number): SearchFrame[] {
  const frames: SearchFrame[] = [{ lo: 0, hi: nums.length, eliminated: [], line: 1, caption: `Find the first index with value >= ${target}.` }]
  let lo = 0
  let hi = nums.length
  while (lo < hi) {
    const mid = Math.floor((lo + hi) / 2)
    frames.push({ lo, hi, mid, eliminated: outsideHalfOpen(nums.length, lo, hi), line: 3, caption: `mid = ${mid}; nums[mid] = ${nums[mid]}.` })
    if (nums[mid] < target) {
      lo = mid + 1
      frames.push({ lo, hi, mid, eliminated: outsideHalfOpen(nums.length, lo, hi), line: 4, caption: `${nums[mid]} < ${target}; lower bound must be to the right.` })
    } else {
      hi = mid
      frames.push({ lo, hi, mid, eliminated: outsideHalfOpen(nums.length, lo, hi), line: 5, caption: `${nums[mid]} >= ${target}; keep index ${mid} and everything left of it.` })
    }
  }
  frames.push({ lo, hi, answer: lo, eliminated: outsideHalfOpen(nums.length, lo, hi), line: 6, caption: `Lower bound is index ${lo}${lo < nums.length ? ` with value ${nums[lo]}` : ' (past the end)'}.` })
  return frames
}

function rotatedFrames(nums: number[], target: number): SearchFrame[] {
  const frames: SearchFrame[] = [{ lo: 0, hi: nums.length - 1, eliminated: [], line: 1, caption: `Search ${target} in a rotated sorted array.` }]
  let lo = 0
  let hi = nums.length - 1
  while (lo <= hi) {
    const mid = Math.floor((lo + hi) / 2)
    frames.push({ lo, hi, mid, eliminated: outsideInclusive(nums.length, lo, hi), line: 3, caption: `mid = ${mid}; value ${nums[mid]}.` })
    if (nums[mid] === target) {
      frames.push({ lo, hi, mid, found: mid, answer: mid, eliminated: outsideInclusive(nums.length, lo, hi), line: 4, caption: `Found ${target} at index ${mid}.` })
      return frames
    }
    if (nums[lo] <= nums[mid]) {
      frames.push({ lo, hi, mid, eliminated: outsideInclusive(nums.length, lo, hi), line: 5, caption: `Left half [${lo}, ${mid}] is sorted.` })
      if (nums[lo] <= target && target < nums[mid]) hi = mid - 1
      else lo = mid + 1
    } else {
      frames.push({ lo, hi, mid, eliminated: outsideInclusive(nums.length, lo, hi), line: 5, caption: `Right half [${mid}, ${hi}] is sorted.` })
      if (nums[mid] < target && target <= nums[hi]) lo = mid + 1
      else hi = mid - 1
    }
    frames.push({ lo, hi, mid, eliminated: outsideInclusive(nums.length, lo, hi), line: 6, caption: `Discard impossible values; continue with [${lo}, ${hi}].` })
  }
  frames.push({ lo, hi, answer: -1, eliminated: outsideInclusive(nums.length, lo, hi), line: 2, caption: `${target} is not present in the rotated array.` })
  return frames
}

function marker(frame: SearchFrame, i: number) {
  const labels: string[] = []
  if (frame.lo === i) labels.push('lo')
  if (frame.mid === i) labels.push('mid')
  if (frame.hi === i) labels.push('hi')
  return labels.join(' · ')
}

export default function BinarySearch() {
  const [variant, setVariant] = useState<Variant>('exact')
  const [targetText, setTargetText] = useState('14')
  const target = Number.isFinite(Number(targetText)) ? Number(targetText) : 0
  const nums = variant === 'rotated' ? rotated : sorted
  const steps = useMemo(() => (variant === 'exact' ? exactFrames(nums, target) : variant === 'lower' ? lowerFrames(nums, target) : rotatedFrames(nums, target)), [nums, target, variant])
  const player = usePlayer(steps, 2)
  const frame = player.step
  const [ref, box] = useSize<HTMLDivElement>()
  const compact = box.width < 560
  const answerText = frame.answer === undefined ? '—' : frame.answer < 0 ? 'not found' : `${frame.answer}`

  return (
    <VizFrame
      title="Binary Search"
      description="Watch lo, mid and hi shrink the candidate interval for exact match, lower bound and rotated-array search."
      controls={
        <>
          <Segmented
            value={variant}
            onChange={setVariant}
            options={[
              { value: 'exact', label: 'Exact match' },
              { value: 'lower', label: 'Lower bound' },
              { value: 'rotated', label: 'Rotated' },
            ]}
          />
          <label className="flex items-center gap-2 text-xs text-muted">
            target
            <input value={targetText} onChange={(e) => setTargetText(e.target.value)} inputMode="numeric" className="h-8 w-20 rounded-lg border border-line bg-panel px-2 font-mono text-sm text-fg outline-none focus:ring-2 focus:ring-accent/40" />
          </label>
          <PlayerControls player={player} />
        </>
      }
      caption={frame.caption}
      legend={[
        { color: C.accent, label: 'mid' },
        { color: C.ok, label: 'answer / found' },
        { color: C.faint, label: 'eliminated' },
      ]}
    >
      <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_18rem]">
        <div ref={ref} className="rounded-xl border border-line bg-panel/60 p-4">
          <div className="grid gap-2" style={{ gridTemplateColumns: `repeat(${nums.length}, minmax(${compact ? '1.7rem' : '2.4rem'}, 1fr))` }}>
            {nums.map((v, i) => {
              const eliminated = frame.eliminated.includes(i)
              const isMid = frame.mid === i
              const isAnswer = frame.found === i || frame.answer === i
              const color = isAnswer ? C.ok : isMid ? C.accent : marker(frame, i).includes('lo') || marker(frame, i).includes('hi') ? C.warn : undefined
              return <ArrayCell key={`${i}-${v}`} value={v} index={i} top={marker(frame, i)} bottom={i} muted={eliminated} active={isMid || isAnswer} color={color} />
            })}
          </div>
          <div className="mt-5 rounded-xl border border-line p-3 text-xs text-muted" style={{ background: soft(C.accent, 8) }}>
            Candidate interval:{' '}
            <span className="font-mono text-fg">
              {variant === 'lower' ? `[${frame.lo}, ${frame.hi})` : frame.lo <= frame.hi ? `[${frame.lo}, ${frame.hi}]` : 'empty'}
            </span>
            {variant === 'lower' && frame.hi === nums.length && <span className="ml-2 text-faint">hi is one past the last index</span>}
          </div>
        </div>
        <div className="space-y-3">
          <div className="grid grid-cols-3 gap-2">
            <MetricCard label="lo" value={frame.lo} tone={C.warn} />
            <MetricCard label="mid" value={frame.mid ?? '—'} tone={C.accent} />
            <MetricCard label="hi" value={frame.hi} tone={C.warn} />
          </div>
          <MetricCard label={variant === 'lower' ? 'lower bound' : 'answer'} value={answerText} tone={frame.answer === -1 ? C.err : C.ok} sub={variant === 'lower' && frame.answer !== undefined && frame.answer >= nums.length ? 'insertion point at end' : undefined} />
          <PseudoCodePanel lines={code[variant]} active={frame.line} />
        </div>
      </div>
    </VizFrame>
  )
}
