import clsx from 'clsx'
import type { ButtonHTMLAttributes, HTMLAttributes, ReactNode } from 'react'
import { forwardRef } from 'react'
import type { Difficulty } from '../types/content'

export const cn = clsx

type BtnVariant = 'primary' | 'secondary' | 'ghost' | 'outline' | 'success' | 'danger'
type BtnSize = 'xs' | 'sm' | 'md' | 'lg' | 'icon'

const variants: Record<BtnVariant, string> = {
  primary: 'bg-accent text-accent-fg hover:opacity-90 shadow-sm',
  secondary: 'bg-subtle text-fg hover:bg-line border border-line',
  ghost: 'text-muted hover:text-fg hover:bg-subtle',
  outline: 'border border-line text-fg hover:bg-subtle',
  success: 'bg-ok text-white hover:opacity-90 shadow-sm',
  danger: 'bg-err text-white hover:opacity-90',
}
const sizes: Record<BtnSize, string> = {
  xs: 'h-7 px-2 text-xs gap-1 rounded-md',
  sm: 'h-8 px-3 text-sm gap-1.5 rounded-lg',
  md: 'h-9 px-4 text-sm gap-2 rounded-lg',
  lg: 'h-11 px-5 text-base gap-2 rounded-xl',
  icon: 'h-8 w-8 justify-center rounded-lg',
}

export const Button = forwardRef<HTMLButtonElement, ButtonHTMLAttributes<HTMLButtonElement> & { variant?: BtnVariant; size?: BtnSize }>(
  function Button({ variant = 'secondary', size = 'md', className, ...props }, ref) {
    return (
      <button
        ref={ref}
        className={cn(
          'inline-flex items-center font-medium transition-all duration-150 select-none whitespace-nowrap',
          'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/50 disabled:opacity-50 disabled:pointer-events-none',
          variants[variant],
          sizes[size],
          className,
        )}
        {...props}
      />
    )
  },
)

export function Card({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return <div className={cn('rounded-xl border border-line bg-panel', className)} style={{ boxShadow: 'var(--shadow)' }} {...props} />
}

export function Badge({ className, tone = 'neutral', ...props }: HTMLAttributes<HTMLSpanElement> & { tone?: 'neutral' | 'accent' | 'ok' | 'warn' | 'err' | 'info' }) {
  const tones = {
    neutral: 'bg-subtle text-muted border-line',
    accent: 'bg-accent-soft text-accent border-transparent',
    ok: 'bg-ok/10 text-ok border-transparent',
    warn: 'bg-warn/10 text-warn border-transparent',
    err: 'bg-err/10 text-err border-transparent',
    info: 'bg-info/10 text-info border-transparent',
  }
  return <span className={cn('inline-flex items-center gap-1 rounded-md border px-1.5 py-0.5 text-[11px] font-medium leading-none', tones[tone], className)} {...props} />
}

export function DifficultyBadge({ d, className }: { d: Difficulty; className?: string }) {
  const c = d === 'Easy' ? 'text-easy bg-easy/10' : d === 'Medium' ? 'text-medium bg-medium/10' : 'text-hard bg-hard/10'
  return <span className={cn('inline-flex items-center rounded-md px-1.5 py-0.5 text-[11px] font-semibold leading-none', c, className)}>{d}</span>
}

export function difficultyColor(d: Difficulty) {
  return d === 'Easy' ? 'var(--easy)' : d === 'Medium' ? 'var(--medium)' : 'var(--hard)'
}

export function Kbd({ children, className }: { children: ReactNode; className?: string }) {
  return <kbd className={cn('inline-flex h-5 min-w-5 items-center justify-center rounded border border-line bg-subtle px-1 font-mono text-[10px] text-muted', className)}>{children}</kbd>
}

export interface TabItem<T extends string> {
  id: T
  label: ReactNode
  icon?: ReactNode
  badge?: ReactNode
}

export function Tabs<T extends string>({ items, value, onChange, className, size = 'md' }: { items: TabItem<T>[]; value: T; onChange: (v: T) => void; className?: string; size?: 'sm' | 'md' }) {
  return (
    <div className={cn('flex items-center gap-1 overflow-x-auto', className)} role="tablist">
      {items.map((t) => (
        <button
          key={t.id}
          role="tab"
          aria-selected={value === t.id}
          onClick={() => onChange(t.id)}
          className={cn(
            'relative inline-flex items-center gap-1.5 rounded-lg font-medium transition-colors whitespace-nowrap',
            size === 'sm' ? 'h-7 px-2.5 text-xs' : 'h-8 px-3 text-sm',
            value === t.id ? 'bg-subtle text-fg' : 'text-muted hover:text-fg',
          )}
        >
          {t.icon}
          {t.label}
          {t.badge}
        </button>
      ))}
    </div>
  )
}

export function Segmented<T extends string | number>({ options, value, onChange, className }: { options: { value: T; label: ReactNode }[]; value: T; onChange: (v: T) => void; className?: string }) {
  return (
    <div className={cn('inline-flex items-center rounded-lg border border-line bg-subtle p-0.5', className)}>
      {options.map((o) => (
        <button
          key={String(o.value)}
          onClick={() => onChange(o.value)}
          className={cn('h-7 rounded-md px-2.5 text-xs font-medium transition-all', value === o.value ? 'bg-panel text-fg shadow-sm' : 'text-muted hover:text-fg')}
        >
          {o.label}
        </button>
      ))}
    </div>
  )
}

export function Slider({ label, value, min, max, step = 1, onChange, format, className }: { label?: ReactNode; value: number; min: number; max: number; step?: number; onChange: (v: number) => void; format?: (v: number) => ReactNode; className?: string }) {
  return (
    <label className={cn('flex min-w-36 flex-col gap-1 text-xs', className)}>
      {label !== undefined && (
        <span className="flex items-center justify-between text-muted">
          <span>{label}</span>
          <span className="font-mono text-fg">{format ? format(value) : value}</span>
        </span>
      )}
      <input type="range" min={min} max={max} step={step} value={value} onChange={(e) => onChange(Number(e.target.value))} className="h-1.5 w-full cursor-pointer accent-[var(--accent)]" />
    </label>
  )
}

export function Select<T extends string>({ value, onChange, options, className }: { value: T; onChange: (v: T) => void; options: { value: T; label: string }[]; className?: string }) {
  return (
    <select value={value} onChange={(e) => onChange(e.target.value as T)} className={cn('h-8 rounded-lg border border-line bg-panel px-2 text-sm text-fg outline-none focus:ring-2 focus:ring-accent/40', className)}>
      {options.map((o) => (
        <option key={o.value} value={o.value}>
          {o.label}
        </option>
      ))}
    </select>
  )
}

export function Switch({ checked, onChange, label }: { checked: boolean; onChange: (v: boolean) => void; label?: ReactNode }) {
  return (
    <label className="inline-flex cursor-pointer items-center gap-2 text-sm">
      <button
        type="button"
        role="switch"
        aria-checked={checked}
        onClick={() => onChange(!checked)}
        className={cn('relative h-5 w-9 rounded-full transition-colors', checked ? 'bg-accent' : 'bg-line-strong')}
      >
        <span className={cn('absolute top-0.5 h-4 w-4 rounded-full bg-white shadow transition-all', checked ? 'left-[18px]' : 'left-0.5')} />
      </button>
      {label}
    </label>
  )
}

export function ProgressRing({ value, size = 56, stroke = 5, color = 'var(--accent)', children }: { value: number; size?: number; stroke?: number; color?: string; children?: ReactNode }) {
  const r = (size - stroke) / 2
  const c = 2 * Math.PI * r
  const v = Math.max(0, Math.min(1, value))
  return (
    <div className="relative inline-flex items-center justify-center" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90">
        <circle cx={size / 2} cy={size / 2} r={r} stroke="var(--line)" strokeWidth={stroke} fill="none" />
        <circle cx={size / 2} cy={size / 2} r={r} stroke={color} strokeWidth={stroke} fill="none" strokeLinecap="round" strokeDasharray={c} strokeDashoffset={c * (1 - v)} style={{ transition: 'stroke-dashoffset .6s ease' }} />
      </svg>
      <div className="absolute inset-0 flex items-center justify-center text-xs font-semibold">{children}</div>
    </div>
  )
}

export function ProgressBar({ value, color = 'var(--accent)', className }: { value: number; color?: string; className?: string }) {
  return (
    <div className={cn('h-1.5 w-full overflow-hidden rounded-full bg-line', className)}>
      <div className="h-full rounded-full transition-all duration-500" style={{ width: `${Math.max(0, Math.min(1, value)) * 100}%`, background: color }} />
    </div>
  )
}

export function PageHeader({ title, subtitle, icon, actions }: { title: ReactNode; subtitle?: ReactNode; icon?: ReactNode; actions?: ReactNode }) {
  return (
    <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
      <div className="flex items-start gap-3">
        {icon && <div className="mt-0.5 flex h-10 w-10 items-center justify-center rounded-xl bg-accent-soft text-accent">{icon}</div>}
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">{title}</h1>
          {subtitle && <p className="mt-1 max-w-3xl text-sm text-muted">{subtitle}</p>}
        </div>
      </div>
      {actions && <div className="flex items-center gap-2">{actions}</div>}
    </div>
  )
}

export function EmptyState({ icon, title, children }: { icon?: ReactNode; title: ReactNode; children?: ReactNode }) {
  return (
    <div className="flex flex-col items-center justify-center gap-2 rounded-xl border border-dashed border-line p-10 text-center">
      {icon && <div className="text-faint">{icon}</div>}
      <div className="font-medium">{title}</div>
      {children && <div className="text-sm text-muted">{children}</div>}
    </div>
  )
}

export function SearchInput({ value, onChange, placeholder, className }: { value: string; onChange: (v: string) => void; placeholder?: string; className?: string }) {
  return (
    <div className={cn('relative', className)}>
      <svg className="pointer-events-none absolute top-1/2 left-2.5 h-4 w-4 -translate-y-1/2 text-faint" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <circle cx="11" cy="11" r="7" />
        <path d="m20 20-3.5-3.5" />
      </svg>
      <input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="h-9 w-full rounded-lg border border-line bg-panel pr-3 pl-8 text-sm outline-none placeholder:text-faint focus:ring-2 focus:ring-accent/40"
      />
    </div>
  )
}

export function Stat({ label, value, sub, icon }: { label: ReactNode; value: ReactNode; sub?: ReactNode; icon?: ReactNode }) {
  return (
    <Card className="p-4">
      <div className="flex items-center justify-between text-xs text-muted">
        <span>{label}</span>
        {icon}
      </div>
      <div className="mt-2 text-2xl font-semibold tracking-tight">{value}</div>
      {sub && <div className="mt-1 text-xs text-muted">{sub}</div>}
    </Card>
  )
}
