import { useMemo, useState } from 'react'
import { motion } from 'framer-motion'
import { C, PlayerControls, VizFrame, usePlayer, useSize } from '../common'
import { Segmented } from '../../components/ui'
import { ArrayCell, MetricCard, PseudoCodePanel, soft } from './_shared1'

type Mode = 'two-sum' | 'container'

interface PointerFrame {
  values: number[]
  left: number
  right: number
  line: number
  caption: string
  sum?: number
  area?: number
  best: number
  bestPair: [number, number]
  found?: boolean
}

const twoSumValues = [1, 2, 4, 7, 11, 15, 18, 21]
const containerHeights = [3, 1, 2, 5, 2, 4, 1, 6, 3]

const code: Record<Mode, string[]> = {
  'two-sum': ['l = 0, r = n - 1', 'while l < r', 'sum = nums[l] + nums[r]', 'if sum == target: return pair', 'if sum < target: l++', 'else: r--'],
  container: ['l = 0, r = n - 1', 'while l < r', 'area = min(h[l], h[r]) * (r-l)', 'best = max(best, area)', 'move the shorter wall inward', 'return best'],
}

function twoSumFrames(target: number): PointerFrame[] {
  const nums = twoSumValues
  const frames: PointerFrame[] = [{ values: nums, left: 0, right: nums.length - 1, line: 1, caption: `Find two values summing to ${target}.`, best: 0, bestPair: [0, nums.length - 1] }]
  let left = 0
  let right = nums.length - 1
  while (left < right) {
    const sum = nums[left] + nums[right]
    frames.push({ values: nums, left, right, sum, line: 3, caption: `${nums[left]} + ${nums[right]} = ${sum}.`, best: sum, bestPair: [left, right] })
    if (sum === target) {
      frames.push({ values: nums, left, right, sum, found: true, line: 4, caption: `Pair found at indices ${left} and ${right}.`, best: sum, bestPair: [left, right] })
      return frames
    }
    if (sum < target) {
      left += 1
      frames.push({ values: nums, left, right, sum, line: 5, caption: `${sum} is too small, so move L right to increase the sum.`, best: sum, bestPair: [left, right] })
    } else {
      right -= 1
      frames.push({ values: nums, left, right, sum, line: 6, caption: `${sum} is too large, so move R left to decrease the sum.`, best: sum, bestPair: [left, right] })
    }
  }
  frames.push({ values: nums, left, right, line: 2, caption: 'Pointers crossed; no pair exists.', best: 0, bestPair: [left, right] })
  return frames
}

function containerFrames(): PointerFrame[] {
  const values = containerHeights
  const frames: PointerFrame[] = [{ values, left: 0, right: values.length - 1, line: 1, caption: 'Maximize area by keeping the wider side and moving the shorter wall.', best: 0, bestPair: [0, values.length - 1] }]
  let left = 0
  let right = values.length - 1
  let best = 0
  let bestPair: [number, number] = [left, right]
  while (left < right) {
    const area = Math.min(values[left], values[right]) * (right - left)
    frames.push({ values, left, right, area, best, bestPair, line: 3, caption: `Area = min(${values[left]}, ${values[right]}) × ${right - left} = ${area}.` })
    if (area > best) {
      best = area
      bestPair = [left, right]
      frames.push({ values, left, right, area, best, bestPair, line: 4, caption: `New best area ${best} from indices ${left} and ${right}.` })
    }
    if (values[left] <= values[right]) {
      left += 1
      frames.push({ values, left, right, area, best, bestPair, line: 5, caption: 'Left wall is shorter, so only moving it can improve the height limit.' })
    } else {
      right -= 1
      frames.push({ values, left, right, area, best, bestPair, line: 5, caption: 'Right wall is shorter, so move it inward.' })
    }
  }
  frames.push({ values, left, right, best, bestPair, line: 6, caption: `Best container area is ${best}.` })
  return frames
}

function PointerLabel({ label, color }: { label: string; color: string }) {
  return (
    <span className="rounded-full border px-1.5 py-0.5 text-[10px] font-semibold" style={{ borderColor: color, color, background: soft(color, 12) }}>
      {label}
    </span>
  )
}

export default function TwoPointers() {
  const [mode, setMode] = useState<Mode>('container')
  const [targetText, setTargetText] = useState('18')
  const target = Number.isFinite(Number(targetText)) ? Number(targetText) : 0
  const steps = useMemo(() => (mode === 'two-sum' ? twoSumFrames(target) : containerFrames()), [mode, target])
  const player = usePlayer(steps, 2)
  const frame = player.step
  const [ref, box] = useSize<HTMLDivElement>()
  const w = Math.max(360, box.width)
  const h = 330
  const maxH = Math.max(...frame.values)
  const pad = 32
  const step = (w - pad * 2) / (frame.values.length - 1)
  const baseY = h - 42
  const barMax = h - 96
  const lx = pad + frame.left * step
  const rx = pad + frame.right * step
  const waterY = baseY - (Math.min(frame.values[frame.left], frame.values[frame.right]) / maxH) * barMax

  return (
    <VizFrame
      title="Two Pointers"
      description="Converging left/right pointers solve pair-sum and container problems by eliminating impossible choices."
      controls={
        <>
          <Segmented value={mode} onChange={setMode} options={[{ value: 'two-sum', label: 'Two Sum II' }, { value: 'container', label: 'Container' }]} />
          {mode === 'two-sum' && (
            <label className="flex items-center gap-2 text-xs text-muted">
              target
              <input value={targetText} onChange={(e) => setTargetText(e.target.value)} inputMode="numeric" className="h-8 w-20 rounded-lg border border-line bg-panel px-2 font-mono text-sm text-fg outline-none focus:ring-2 focus:ring-accent/40" />
            </label>
          )}
          <PlayerControls player={player} />
        </>
      }
      caption={frame.caption}
      legend={[
        { color: C.accent, label: 'left pointer' },
        { color: C.warn, label: 'right pointer' },
        { color: C.ok, label: 'best / found' },
      ]}
    >
      <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_18rem]">
        <div ref={ref} className="rounded-xl border border-line bg-panel/60 p-4">
          {mode === 'two-sum' ? (
            <div className="grid gap-2" style={{ gridTemplateColumns: `repeat(${frame.values.length}, minmax(2.2rem, 1fr))` }}>
              {frame.values.map((v, i) => {
                const onLeft = i === frame.left
                const onRight = i === frame.right
                const found = Boolean(frame.found && (onLeft || onRight))
                return (
                  <ArrayCell
                    key={`${v}-${i}`}
                    value={v}
                    index={i}
                    top={onLeft ? <PointerLabel label="L" color={C.accent} /> : onRight ? <PointerLabel label="R" color={C.warn} /> : undefined}
                    active={onLeft || onRight}
                    color={found ? C.ok : onLeft ? C.accent : onRight ? C.warn : undefined}
                    muted={i < frame.left || i > frame.right}
                  />
                )
              })}
            </div>
          ) : (
            <svg width="100%" height={h} viewBox={`0 0 ${w} ${h}`} role="img" aria-label="Container with most water">
              <defs>
                <linearGradient id="tp-water" x1="0" x2="0" y1="0" y2="1">
                  <stop offset="0%" stopColor={C.accent} stopOpacity="0.32" />
                  <stop offset="100%" stopColor={C.accent} stopOpacity="0.08" />
                </linearGradient>
              </defs>
              <line x1={pad - 16} x2={w - pad + 16} y1={baseY} y2={baseY} stroke={C.line} />
              {frame.right > frame.left && <motion.rect initial={false} animate={{ x: lx, width: rx - lx, y: waterY, height: baseY - waterY }} transition={{ duration: 0.3 }} fill="url(#tp-water)" rx={8} />}
              {frame.values.map((v, i) => {
                const x = pad + i * step
                const y = baseY - (v / maxH) * barMax
                const active = i === frame.left || i === frame.right
                const best = i === frame.bestPair[0] || i === frame.bestPair[1]
                const color = active ? (i === frame.left ? C.accent : C.warn) : best ? C.ok : C.series[i % C.series.length]
                return (
                  <g key={`${v}-${i}`}>
                    <motion.line x1={x} x2={x} initial={false} animate={{ y1: y, y2: baseY }} stroke={color} strokeWidth={active ? 10 : 8} strokeLinecap="round" transition={{ duration: 0.25 }} opacity={active || best ? 0.95 : 0.62} />
                    <text x={x} y={baseY + 18} textAnchor="middle" fill={C.muted} fontSize="11" fontFamily="ui-monospace, SFMono-Regular, Menlo, monospace">
                      {v}
                    </text>
                    {i === frame.left && <text x={x} y={y - 10} textAnchor="middle" fill={C.accent} fontSize="11" fontWeight="700">L</text>}
                    {i === frame.right && <text x={x} y={y - 10} textAnchor="middle" fill={C.warn} fontSize="11" fontWeight="700">R</text>}
                  </g>
                )
              })}
            </svg>
          )}
        </div>
        <div className="space-y-3">
          <div className="grid grid-cols-2 gap-2">
            <MetricCard label="left" value={frame.left} tone={C.accent} />
            <MetricCard label="right" value={frame.right} tone={C.warn} />
          </div>
          {mode === 'two-sum' ? (
            <MetricCard label="current sum" value={frame.sum ?? '—'} tone={frame.found ? C.ok : C.accent} sub={`target ${target}`} />
          ) : (
            <div className="grid grid-cols-2 gap-2">
              <MetricCard label="area" value={frame.area ?? '—'} tone={C.accent} />
              <MetricCard label="best" value={frame.best} tone={C.ok} sub={`${frame.bestPair[0]} ↔ ${frame.bestPair[1]}`} />
            </div>
          )}
          <PseudoCodePanel lines={code[mode]} active={frame.line} />
        </div>
      </div>
    </VizFrame>
  )
}
