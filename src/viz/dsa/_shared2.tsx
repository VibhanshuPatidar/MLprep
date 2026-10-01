import type { ReactNode } from 'react'
import { C } from '../common'
import { cn } from '../../components/ui'

export interface CodeLine {
  id: number
  text: string
}

export function PseudoCode({ lines, active, title = 'Pseudo-code' }: { lines: CodeLine[]; active: number; title?: ReactNode }) {
  return (
    <div className="rounded-xl border border-line bg-panel/90 p-3 shadow-sm">
      <div className="mb-2 flex items-center justify-between gap-2">
        <div className="text-[11px] font-semibold uppercase tracking-wide text-muted">{title}</div>
        <span className="rounded-md bg-accent-soft px-1.5 py-0.5 font-mono text-[10px] text-accent">line {active}</span>
      </div>
      <div className="space-y-1 font-mono text-[11px] leading-5">
        {lines.map((line) => (
          <div
            key={line.id}
            className={cn(
              'grid grid-cols-[1.5rem_1fr] rounded-md px-2 py-0.5 transition-all duration-200',
              line.id === active ? 'bg-accent-soft text-fg ring-1 ring-accent/30' : 'text-muted',
            )}
          >
            <span className="select-none text-faint">{line.id}</span>
            <span>{line.text}</span>
          </div>
        ))}
      </div>
    </div>
  )
}

export function MiniStat({ label, value, tone = 'neutral' }: { label: ReactNode; value: ReactNode; tone?: 'neutral' | 'accent' | 'ok' | 'warn' | 'err' | 'info' }) {
  const colors: Record<typeof tone, string> = {
    neutral: 'text-fg',
    accent: 'text-accent',
    ok: 'text-ok',
    warn: 'text-warn',
    err: 'text-err',
    info: 'text-info',
  }
  return (
    <div className="rounded-lg border border-line bg-panel px-3 py-2">
      <div className="text-[10px] uppercase tracking-wide text-muted">{label}</div>
      <div className={cn('mt-1 font-mono text-sm font-semibold', colors[tone])}>{value}</div>
    </div>
  )
}

export function Pill({ children, tone = 'neutral', className }: { children: ReactNode; tone?: 'neutral' | 'accent' | 'ok' | 'warn' | 'err' | 'info'; className?: string }) {
  const tones: Record<typeof tone, string> = {
    neutral: 'border-line bg-subtle text-muted',
    accent: 'border-transparent bg-accent-soft text-accent',
    ok: 'border-transparent bg-ok/10 text-ok',
    warn: 'border-transparent bg-warn/10 text-warn',
    err: 'border-transparent bg-err/10 text-err',
    info: 'border-transparent bg-info/10 text-info',
  }
  return <span className={cn('inline-flex items-center rounded-full border px-2 py-0.5 font-mono text-[11px]', tones[tone], className)}>{children}</span>
}

export function clamp(value: number, min: number, max: number) {
  return Math.max(min, Math.min(max, value))
}

export function range(n: number) {
  return Array.from({ length: n }, (_, i) => i)
}

export function cellKey(row: number, col: number) {
  return `${row},${col}`
}

export function parseCellKey(key: string): [number, number] {
  const [r, c] = key.split(',').map(Number)
  return [r, c]
}

export function hashText(text: string) {
  let h = 2166136261
  for (let i = 0; i < text.length; i += 1) {
    h ^= text.charCodeAt(i)
    h = Math.imul(h, 16777619)
  }
  return h >>> 0
}

export function svgTextShadow() {
  return { paintOrder: 'stroke', stroke: C.panel, strokeWidth: 4, strokeLinejoin: 'round' as const }
}
