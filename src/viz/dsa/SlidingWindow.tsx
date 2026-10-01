import { useMemo, useState } from 'react'
import { C, PlayerControls, VizFrame, usePlayer, useSize } from '../common'
import { Segmented, Slider } from '../../components/ui'
import { ArrayCell, MetricCard, PseudoCodePanel, compactNumber, soft } from './_shared1'

type Mode = 'unique' | 'max-k' | 'kadane'

type Item = string | number

interface WindowFrame {
  items: Item[]
  left: number
  right: number
  line: number
  caption: string
  current: string
  best: string
  bestLeft: number
  bestRight: number
  mapEntries: [string, string][]
  duplicate?: number
}

const nums = [3, -1, 4, 1, 5, -9, 2, 6, -3, 7]

const code: Record<Mode, string[]> = {
  unique: ['l = 0; lastSeen = {}', 'for r, char in s', 'if char was seen inside window', '  l = lastSeen[char] + 1', 'lastSeen[char] = r', 'best = max(best, r-l+1)'],
  'max-k': ['sum = 0; l = 0', 'for r in range(n): add nums[r]', 'if window size == k: update best', 'if window size >= k', '  remove nums[l]; l++', 'return best'],
  kadane: ['best = -∞; current = 0', 'for each nums[i]', 'current = max(nums[i], current + nums[i])', 'if current starts fresh: start = i', 'best = max(best, current)', 'return best subarray'],
}

function uniqueFrames(input: string): WindowFrame[] {
  const chars = [...input.slice(0, 18)]
  const frames: WindowFrame[] = []
  const seen = new Map<string, number>()
  let left = 0
  let bestLeft = 0
  let bestRight = -1
  const entries = () => [...seen.entries()].sort((a, b) => a[0].localeCompare(b[0])).map(([k, v]) => [k, String(v)] as [string, string])
  frames.push({ items: chars, left, right: -1, line: 1, caption: 'Start with an empty window and an empty last-seen map.', current: '0', best: '0', bestLeft, bestRight, mapEntries: [] })
  for (let right = 0; right < chars.length; right += 1) {
    const ch = chars[right]
    frames.push({ items: chars, left, right, line: 2, caption: `Expand right to index ${right} ('${ch}').`, current: String(right - left + 1), best: String(Math.max(0, bestRight - bestLeft + 1)), bestLeft, bestRight, mapEntries: entries() })
    const old = seen.get(ch)
    if (old !== undefined && old >= left) {
      left = old + 1
      frames.push({ items: chars, left, right, duplicate: old, line: 4, caption: `'${ch}' was last seen at ${old}; move left to ${left}.`, current: String(right - left + 1), best: String(Math.max(0, bestRight - bestLeft + 1)), bestLeft, bestRight, mapEntries: entries() })
    }
    seen.set(ch, right)
    frames.push({ items: chars, left, right, line: 5, caption: `Record lastSeen['${ch}'] = ${right}.`, current: String(right - left + 1), best: String(Math.max(0, bestRight - bestLeft + 1)), bestLeft, bestRight, mapEntries: entries() })
    if (right - left > bestRight - bestLeft) {
      bestLeft = left
      bestRight = right
      frames.push({ items: chars, left, right, line: 6, caption: `New best unique window '${chars.slice(bestLeft, bestRight + 1).join('')}'.`, current: String(right - left + 1), best: String(bestRight - bestLeft + 1), bestLeft, bestRight, mapEntries: entries() })
    }
  }
  frames.push({ items: chars, left, right: chars.length - 1, line: 6, caption: `Longest unique substring length is ${Math.max(0, bestRight - bestLeft + 1)}.`, current: 'done', best: String(Math.max(0, bestRight - bestLeft + 1)), bestLeft, bestRight, mapEntries: entries() })
  return frames
}

function maxKFrames(k: number): WindowFrame[] {
  const frames: WindowFrame[] = []
  let left = 0
  let sum = 0
  let best = Number.NEGATIVE_INFINITY
  let bestLeft = 0
  let bestRight = k - 1
  frames.push({ items: nums, left, right: -1, line: 1, caption: `Find the maximum sum among windows of exactly k=${k}.`, current: '0', best: '—', bestLeft: -1, bestRight: -1, mapEntries: [['k', String(k)]] })
  for (let right = 0; right < nums.length; right += 1) {
    sum += nums[right]
    frames.push({ items: nums, left, right, line: 2, caption: `Add nums[${right}]=${nums[right]}; running sum is ${sum}.`, current: String(sum), best: best === Number.NEGATIVE_INFINITY ? '—' : String(best), bestLeft, bestRight, mapEntries: [['window size', String(right - left + 1)], ['k', String(k)]] })
    if (right - left + 1 === k) {
      if (sum > best) {
        best = sum
        bestLeft = left
        bestRight = right
      }
      frames.push({ items: nums, left, right, line: 3, caption: `Window [${left}, ${right}] has sum ${sum}; best is ${best}.`, current: String(sum), best: String(best), bestLeft, bestRight, mapEntries: [['window size', String(k)], ['k', String(k)]] })
    }
    if (right - left + 1 >= k) {
      const removed = nums[left]
      sum -= removed
      left += 1
      frames.push({ items: nums, left, right, line: 5, caption: `Remove ${removed} and slide left to ${left}.`, current: String(sum), best: best === Number.NEGATIVE_INFINITY ? '—' : String(best), bestLeft, bestRight, mapEntries: [['next sum', String(sum)], ['k', String(k)]] })
    }
  }
  frames.push({ items: nums, left: bestLeft, right: bestRight, line: 6, caption: `Best size-${k} window sum is ${best}.`, current: 'done', best: String(best), bestLeft, bestRight, mapEntries: [['best window', `[${bestLeft}, ${bestRight}]`]] })
  return frames
}

function kadaneFrames(): WindowFrame[] {
  const frames: WindowFrame[] = []
  let current = 0
  let start = 0
  let best = Number.NEGATIVE_INFINITY
  let bestLeft = 0
  let bestRight = 0
  frames.push({ items: nums, left: 0, right: -1, line: 1, caption: 'Kadane keeps the best subarray ending at the current index.', current: '0', best: '—', bestLeft: -1, bestRight: -1, mapEntries: [] })
  for (let i = 0; i < nums.length; i += 1) {
    const extend = current + nums[i]
    if (nums[i] > extend) {
      current = nums[i]
      start = i
      frames.push({ items: nums, left: start, right: i, line: 4, caption: `Starting fresh at index ${i} beats extending (${nums[i]} > ${extend}).`, current: String(current), best: best === Number.NEGATIVE_INFINITY ? '—' : String(best), bestLeft, bestRight, mapEntries: [['choice', 'start fresh']] })
    } else {
      current = extend
      frames.push({ items: nums, left: start, right: i, line: 3, caption: `Extend current subarray to index ${i}; current sum is ${current}.`, current: String(current), best: best === Number.NEGATIVE_INFINITY ? '—' : String(best), bestLeft, bestRight, mapEntries: [['choice', 'extend']] })
    }
    if (current > best) {
      best = current
      bestLeft = start
      bestRight = i
      frames.push({ items: nums, left: start, right: i, line: 5, caption: `New best subarray [${bestLeft}, ${bestRight}] with sum ${best}.`, current: String(current), best: String(best), bestLeft, bestRight, mapEntries: [['best window', `[${bestLeft}, ${bestRight}]`]] })
    }
  }
  frames.push({ items: nums, left: bestLeft, right: bestRight, line: 6, caption: `Maximum subarray sum is ${best}.`, current: 'done', best: String(best), bestLeft, bestRight, mapEntries: [['best window', `[${bestLeft}, ${bestRight}]`]] })
  return frames
}

function inRange(i: number, left: number, right: number) {
  return left <= i && i <= right
}

export default function SlidingWindow() {
  const [mode, setMode] = useState<Mode>('unique')
  const [text, setText] = useState('abcaabcdba')
  const [k, setK] = useState(4)
  const steps = useMemo(() => (mode === 'unique' ? uniqueFrames(text) : mode === 'max-k' ? maxKFrames(k) : kadaneFrames()), [k, mode, text])
  const player = usePlayer(steps, 2.5)
  const frame = player.step
  const [ref, box] = useSize<HTMLDivElement>()
  const compact = box.width < 620

  return (
    <VizFrame
      title="Sliding Window"
      description="Expandable and fixed-size windows maintain just enough state to update current and best answers in O(n)."
      controls={
        <>
          <Segmented value={mode} onChange={setMode} options={[{ value: 'unique', label: 'Unique substring' }, { value: 'max-k', label: 'Max sum k' }, { value: 'kadane', label: 'Kadane' }]} />
          {mode === 'unique' && (
            <input value={text} onChange={(e) => setText(e.target.value)} className="h-8 w-44 rounded-lg border border-line bg-panel px-2 font-mono text-sm text-fg outline-none focus:ring-2 focus:ring-accent/40" aria-label="String input" />
          )}
          {mode === 'max-k' && <Slider className="w-36" label="k" value={k} min={2} max={6} onChange={setK} />}
          <PlayerControls player={player} />
        </>
      }
      caption={frame.caption}
      legend={[
        { color: C.accent, label: 'current window' },
        { color: C.ok, label: 'best window' },
        { color: C.err, label: 'duplicate / reset' },
      ]}
    >
      <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_18rem]">
        <div ref={ref} className="rounded-xl border border-line bg-panel/60 p-4">
          <div className="grid gap-2" style={{ gridTemplateColumns: `repeat(${frame.items.length}, minmax(${compact ? '1.8rem' : '2.4rem'}, 1fr))` }}>
            {frame.items.map((item, i) => {
              const current = inRange(i, frame.left, frame.right)
              const best = inRange(i, frame.bestLeft, frame.bestRight)
              const dup = frame.duplicate === i
              const value = typeof item === 'number' ? compactNumber(item) : item
              return (
                <ArrayCell
                  key={`${String(item)}-${i}`}
                  value={value}
                  index={i}
                  top={i === frame.left ? 'L' : i === frame.right ? 'R' : undefined}
                  bottom={best ? 'best' : i}
                  active={current || best || dup}
                  color={dup ? C.err : best ? C.ok : current ? C.accent : undefined}
                  muted={!current && !best && frame.right >= 0}
                />
              )
            })}
          </div>
          <div className="mt-5 rounded-xl border border-line p-3 text-xs text-muted" style={{ background: soft(C.accent, 8) }}>
            Window bounds: <span className="font-mono text-fg">[{frame.left}, {frame.right}]</span>
            <span className="ml-3">best: <span className="font-mono text-fg">[{frame.bestLeft}, {frame.bestRight}]</span></span>
          </div>
        </div>
        <div className="space-y-3">
          <div className="grid grid-cols-2 gap-2">
            <MetricCard label="current" value={frame.current} tone={C.accent} />
            <MetricCard label="best" value={frame.best} tone={C.ok} />
          </div>
          <div className="rounded-xl border border-line bg-panel/80 p-3">
            <div className="mb-2 text-[11px] uppercase tracking-wide text-muted">{mode === 'unique' ? 'last-seen map' : 'rolling state'}</div>
            <div className="grid grid-cols-2 gap-2 text-xs">
              {frame.mapEntries.length === 0 ? <div className="col-span-2 text-muted">No entries yet.</div> : frame.mapEntries.map(([key, value]) => (
                <div key={`${key}-${value}`} className="flex items-center justify-between rounded-lg border border-line bg-subtle px-2 py-1.5">
                  <span className="font-mono text-fg">{key}</span>
                  <span className="font-mono text-muted">{value}</span>
                </div>
              ))}
            </div>
          </div>
          <PseudoCodePanel lines={code[mode]} active={frame.line} />
        </div>
      </div>
    </VizFrame>
  )
}
