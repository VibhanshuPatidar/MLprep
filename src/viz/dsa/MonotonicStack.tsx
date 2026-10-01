import { useMemo, useState } from 'react'
import { motion } from 'framer-motion'
import { C, PlayerControls, VizFrame, usePlayer, useSize } from '../common'
import { Segmented } from '../../components/ui'
import { ArrayCell, MetricCard, PseudoCodePanel, soft } from './_shared1'

type Mode = 'temps' | 'nge'

type Answer = number | null

interface StackFrame {
  values: number[]
  stack: number[]
  answer: Answer[]
  active?: number
  compare?: number
  popped?: number
  line: number
  caption: string
}

const temps = [73, 74, 75, 71, 69, 72, 76, 73]
const ngeValues = [2, 1, 2, 4, 3, 5, 1]

const code: Record<Mode, string[]> = {
  temps: ['ans = [0]*n; stack = []', 'for i, temp in enumerate(T)', 'while stack and T[i] > T[stack.top]', '  j = stack.pop(); ans[j] = i - j', 'stack.push(i)', 'remaining answers stay 0'],
  nge: ['ans = [-1]*n; stack = []', 'for i, x in enumerate(nums)', 'while stack and x > nums[stack.top]', '  j = stack.pop(); ans[j] = x', 'stack.push(i)', 'remaining answers stay -1'],
}

function dailyFrames(): StackFrame[] {
  const values = temps
  const answer: Answer[] = Array(values.length).fill(null)
  const stack: number[] = []
  const frames: StackFrame[] = [{ values, stack: [], answer: [...answer], line: 1, caption: 'Keep a decreasing stack of unresolved temperature indices.' }]
  for (let i = 0; i < values.length; i += 1) {
    frames.push({ values, stack: [...stack], answer: [...answer], active: i, line: 2, caption: `Read day ${i}: ${values[i]}°.` })
    while (stack.length > 0 && values[i] > values[stack[stack.length - 1]]) {
      const j = stack.pop()!
      answer[j] = i - j
      frames.push({ values, stack: [...stack], answer: [...answer], active: i, popped: j, compare: j, line: 4, caption: `${values[i]}° is warmer than day ${j}; answer[${j}] = ${i - j}.` })
    }
    stack.push(i)
    frames.push({ values, stack: [...stack], answer: [...answer], active: i, line: 5, caption: `Push day ${i}; it waits for a warmer future day.` })
  }
  while (stack.length > 0) {
    const j = stack.pop()!
    answer[j] = 0
    frames.push({ values, stack: [...stack], answer: [...answer], popped: j, line: 6, caption: `Day ${j} has no warmer future day, so it remains 0.` })
  }
  return frames
}

function ngeFrames(): StackFrame[] {
  const values = ngeValues
  const answer: Answer[] = Array(values.length).fill(null)
  const stack: number[] = []
  const frames: StackFrame[] = [{ values, stack: [], answer: [...answer], line: 1, caption: 'Keep a decreasing stack; the next larger value resolves smaller indices.' }]
  for (let i = 0; i < values.length; i += 1) {
    frames.push({ values, stack: [...stack], answer: [...answer], active: i, line: 2, caption: `Read nums[${i}] = ${values[i]}.` })
    while (stack.length > 0 && values[i] > values[stack[stack.length - 1]]) {
      const j = stack.pop()!
      answer[j] = values[i]
      frames.push({ values, stack: [...stack], answer: [...answer], active: i, popped: j, compare: j, line: 4, caption: `${values[i]} is next greater for index ${j}.` })
    }
    stack.push(i)
    frames.push({ values, stack: [...stack], answer: [...answer], active: i, line: 5, caption: `Push index ${i}; stack remains decreasing.` })
  }
  while (stack.length > 0) {
    const j = stack.pop()!
    answer[j] = -1
    frames.push({ values, stack: [...stack], answer: [...answer], popped: j, line: 6, caption: `Index ${j} has no next greater value, so answer is -1.` })
  }
  return frames
}

function answerValue(v: Answer) {
  return v === null ? '·' : String(v)
}

export default function MonotonicStack() {
  const [mode, setMode] = useState<Mode>('temps')
  const steps = useMemo(() => (mode === 'temps' ? dailyFrames() : ngeFrames()), [mode])
  const player = usePlayer(steps, 2.5)
  const frame = player.step
  const [ref, box] = useSize<HTMLDivElement>()
  const compact = box.width < 620
  const top = frame.stack[frame.stack.length - 1]

  return (
    <VizFrame
      title="Monotonic Stack"
      description="Resolve next-greater relationships by popping smaller elements from a decreasing stack."
      controls={
        <>
          <Segmented value={mode} onChange={setMode} options={[{ value: 'temps', label: 'Daily temperatures' }, { value: 'nge', label: 'Next greater' }]} />
          <PlayerControls player={player} />
        </>
      }
      caption={frame.caption}
      legend={[
        { color: C.accent, label: 'current item' },
        { color: C.err, label: 'popped / resolved' },
        { color: C.ok, label: 'answer filled' },
      ]}
    >
      <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_18rem]">
        <div ref={ref} className="grid gap-4 rounded-xl border border-line bg-panel/60 p-4 md:grid-cols-[minmax(0,1fr)_11rem]">
          <div className="space-y-5">
            <div>
              <div className="mb-2 text-xs font-medium text-muted">input</div>
              <div className="grid gap-2" style={{ gridTemplateColumns: `repeat(${frame.values.length}, minmax(${compact ? '1.8rem' : '2.4rem'}, 1fr))` }}>
                {frame.values.map((v, i) => (
                  <ArrayCell
                    key={`${v}-${i}`}
                    value={v}
                    index={i}
                    top={i === frame.active ? 'i' : i === top ? 'top' : undefined}
                    active={i === frame.active || i === frame.popped || i === top}
                    color={i === frame.popped ? C.err : i === frame.active ? C.accent : i === top ? C.warn : undefined}
                    muted={frame.answer[i] !== null && i !== frame.popped}
                  />
                ))}
              </div>
            </div>
            <div>
              <div className="mb-2 text-xs font-medium text-muted">answer</div>
              <div className="grid gap-2" style={{ gridTemplateColumns: `repeat(${frame.answer.length}, minmax(${compact ? '1.8rem' : '2.4rem'}, 1fr))` }}>
                {frame.answer.map((v, i) => (
                  <ArrayCell key={`${i}-${answerValue(v)}`} value={answerValue(v)} index={i} active={v !== null} color={v !== null ? C.ok : undefined} />
                ))}
              </div>
            </div>
          </div>
          <div className="rounded-xl border border-line bg-panel/80 p-3">
            <div className="mb-3 flex items-center justify-between text-xs text-muted">
              <span>stack</span>
              <span className="font-mono">top ↑</span>
            </div>
            <div className="flex min-h-64 flex-col-reverse justify-start gap-2">
              {frame.stack.length === 0 && <div className="rounded-lg border border-dashed border-line p-3 text-center text-xs text-muted">empty</div>}
              {frame.stack.map((idx) => (
                <motion.div
                  layout
                  key={idx}
                  className="rounded-lg border px-3 py-2 text-center font-mono text-sm shadow-sm"
                  style={{ borderColor: idx === top ? C.warn : C.line, background: idx === top ? soft(C.warn, 14) : soft(C.accent, 8) }}
                  transition={{ type: 'spring', stiffness: 420, damping: 32 }}
                >
                  <div className="text-fg">i={idx}</div>
                  <div className="text-xs text-muted">{frame.values[idx]}</div>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
        <div className="space-y-3">
          <div className="grid grid-cols-2 gap-2">
            <MetricCard label="current" value={frame.active ?? '—'} tone={C.accent} />
            <MetricCard label="stack size" value={frame.stack.length} tone={C.warn} />
          </div>
          <MetricCard label="resolved" value={frame.answer.filter((x) => x !== null).length} tone={C.ok} sub={`${frame.answer.length} total answers`} />
          <PseudoCodePanel lines={code[mode]} active={frame.line} />
        </div>
      </div>
    </VizFrame>
  )
}
