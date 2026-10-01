import { motion } from 'framer-motion'
import type { ReactNode } from 'react'
import { C } from '../common'
import { cn } from '../../components/ui'

export function soft(color: string, amount = 16) {
  return `color-mix(in srgb, ${color} ${amount}%, transparent)`
}

export function clamp(n: number, min: number, max: number) {
  return Math.max(min, Math.min(max, n))
}

export function PseudoCodePanel({ title = 'Pseudo-code', lines, active }: { title?: ReactNode; lines: string[]; active: number }) {
  return (
    <div className="rounded-xl border border-line bg-panel/80 p-3 shadow-sm backdrop-blur">
      <div className="mb-2 flex items-center justify-between text-[11px] font-medium uppercase tracking-wide text-muted">
        <span>{title}</span>
        <span className="font-mono text-faint">line {active}</span>
      </div>
      <div className="space-y-1 font-mono text-[11px] leading-5">
        {lines.map((line, i) => {
          const on = i + 1 === active
          return (
            <div key={`${i}-${line}`} className={cn('grid grid-cols-[1.5rem_1fr] rounded-md border px-2 transition-colors', on ? 'border-accent/40 bg-accent-soft text-accent' : 'border-transparent text-muted')}>
              <span className="select-none text-faint">{i + 1}</span>
              <span className="truncate">{line}</span>
            </div>
          )
        })}
      </div>
    </div>
  )
}

export function MetricCard({ label, value, sub, tone = C.accent }: { label: ReactNode; value: ReactNode; sub?: ReactNode; tone?: string }) {
  return (
    <div className="rounded-xl border border-line bg-panel/80 p-3 shadow-sm">
      <div className="text-[11px] uppercase tracking-wide text-muted">{label}</div>
      <div className="mt-1 text-lg font-semibold tabular-nums text-fg" style={{ color: tone }}>
        {value}
      </div>
      {sub !== undefined && <div className="mt-0.5 text-xs text-muted">{sub}</div>}
    </div>
  )
}

export function ArrayCell({
  value,
  index,
  top,
  bottom,
  active,
  muted,
  color,
  className,
}: {
  value: ReactNode
  index?: ReactNode
  top?: ReactNode
  bottom?: ReactNode
  active?: boolean
  muted?: boolean
  color?: string
  className?: string
}) {
  const border = color ?? (active ? C.accent : C.line)
  return (
    <motion.div layout className={cn('flex min-w-0 flex-col items-center gap-1', muted && 'opacity-40', className)} transition={{ type: 'spring', stiffness: 420, damping: 34 }}>
      <div className="min-h-5 text-center text-[10px] font-medium text-muted">{top}</div>
      <div
        className="flex h-12 w-full min-w-8 items-center justify-center rounded-lg border bg-panel text-sm font-semibold tabular-nums shadow-sm transition-colors"
        style={{ borderColor: border, background: active ? soft(border, 14) : undefined }}
      >
        {value}
      </div>
      <div className="min-h-5 text-center font-mono text-[10px] text-faint">{bottom ?? index}</div>
    </motion.div>
  )
}

export function compactNumber(n: number) {
  return Number.isInteger(n) ? String(n) : n.toFixed(1)
}

export function indexRange(start: number, endInclusive: number) {
  const out: number[] = []
  for (let i = start; i <= endInclusive; i += 1) out.push(i)
  return out
}
