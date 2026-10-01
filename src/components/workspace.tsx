import { motion, useReducedMotion } from 'framer-motion'
import { ArrowLeft, Bookmark, BookmarkCheck, CheckCircle2, ChevronLeft, ChevronRight, CircleDashed, CircleDot, Pause, Play, RotateCcw, Timer } from 'lucide-react'
import { useEffect, useRef, useState } from 'react'
import type { ReactNode } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useStore, type Status } from '../store/progress'
import type { Difficulty } from '../types/content'
import { DifficultyBadge, cn } from './ui'

export function StatusIcon({ status, size = 15 }: { status?: Status; size?: number }) {
  if (status === 'solved') return <CheckCircle2 size={size} className="text-ok" />
  if (status === 'attempted') return <CircleDot size={size} className="text-warn" />
  return <CircleDashed size={size} className="text-faint" />
}

export function Stopwatch() {
  const [running, setRunning] = useState(true)
  const [sec, setSec] = useState(0)
  useEffect(() => {
    if (!running) return
    const t = setInterval(() => setSec((s) => s + 1), 1000)
    return () => clearInterval(t)
  }, [running])
  const mm = String(Math.floor(sec / 60)).padStart(2, '0')
  const ss = String(sec % 60).padStart(2, '0')
  return (
    <div className="flex items-center gap-1 rounded-lg border border-line px-2 py-1 text-xs text-muted">
      <Timer size={13} />
      <span className="w-11 font-mono tabular-nums">
        {mm}:{ss}
      </span>
      <button onClick={() => setRunning((r) => !r)} className="hover:text-fg" title={running ? 'Pause' : 'Resume'}>
        {running ? <Pause size={12} /> : <Play size={12} />}
      </button>
      <button onClick={() => setSec(0)} className="hover:text-fg" title="Reset timer">
        <RotateCcw size={12} />
      </button>
    </div>
  )
}

export function WorkspaceHeader({
  backTo,
  backLabel,
  title,
  difficulty,
  storeKey,
  prev,
  next,
  right,
}: {
  backTo: string
  backLabel: string
  title: ReactNode
  difficulty: Difficulty
  storeKey: string
  prev?: string
  next?: string
  right?: ReactNode
}) {
  const nav = useNavigate()
  const status = useStore((s) => s.progress[storeKey]?.status)
  const bookmarked = useStore((s) => Boolean(s.bookmarks[storeKey]))
  const toggleBookmark = useStore((s) => s.toggleBookmark)
  return (
    <div className="flex h-12 shrink-0 items-center gap-2 border-b border-line bg-panel px-3">
      <Link to={backTo} className="flex items-center gap-1 rounded-md px-1.5 py-1 text-xs text-muted hover:bg-subtle hover:text-fg">
        <ArrowLeft size={14} />
        {backLabel}
      </Link>
      <div className="mx-1 h-5 w-px bg-line" />
      <button disabled={!prev} onClick={() => prev && nav(prev)} className="rounded-md p-1 text-muted hover:bg-subtle hover:text-fg disabled:opacity-30" title="Previous">
        <ChevronLeft size={16} />
      </button>
      <button disabled={!next} onClick={() => next && nav(next)} className="rounded-md p-1 text-muted hover:bg-subtle hover:text-fg disabled:opacity-30" title="Next">
        <ChevronRight size={16} />
      </button>
      <StatusIcon status={status} />
      <h1 className="min-w-0 truncate text-sm font-semibold">{title}</h1>
      <DifficultyBadge d={difficulty} />
      <button onClick={() => toggleBookmark(storeKey)} className={cn('rounded-md p-1 hover:bg-subtle', bookmarked ? 'text-accent' : 'text-faint hover:text-fg')} title="Bookmark">
        {bookmarked ? <BookmarkCheck size={15} /> : <Bookmark size={15} />}
      </button>
      <div className="flex-1" />
      <Stopwatch />
      {right}
    </div>
  )
}

export function useDebouncedSave(value: string, save: (v: string) => void, ms = 400) {
  const first = useRef(true)
  const saveRef = useRef(save)
  saveRef.current = save
  useEffect(() => {
    if (first.current) {
      first.current = false
      return
    }
    const t = setTimeout(() => saveRef.current(value), ms)
    return () => clearTimeout(t)
  }, [value, ms])
}

export const fmt = (v: unknown): string => {
  if (v === undefined) return '—'
  try {
    return JSON.stringify(v)
  } catch {
    return String(v)
  }
}

export function Field({ label, children, tone }: { label: ReactNode; children: ReactNode; tone?: 'ok' | 'err' }) {
  return (
    <div className="mb-3">
      <div className="mb-1 text-[11px] font-medium text-muted">{label}</div>
      <div className={cn('rounded-lg border bg-subtle px-3 py-2 font-mono text-[12.5px] break-all whitespace-pre-wrap', tone === 'ok' ? 'border-ok/40' : tone === 'err' ? 'border-err/40' : 'border-line')}>{children}</div>
    </div>
  )
}

const VERDICT: Record<string, { label: string; cls: string }> = {
  accepted: { label: 'Accepted', cls: 'text-ok' },
  wrong: { label: 'Wrong Answer', cls: 'text-err' },
  compile_error: { label: 'Compile Error', cls: 'text-err' },
  runtime_error: { label: 'Runtime Error', cls: 'text-err' },
  timeout: { label: 'Time Limit Exceeded', cls: 'text-warn' },
  internal_error: { label: 'Invalid Input', cls: 'text-warn' },
  error: { label: 'Error', cls: 'text-err' },
}

export function VerdictBanner({ status, passed, total, ms, mode }: { status: string; passed: number; total: number; ms?: number; mode: 'run' | 'submit' }) {
  const v = VERDICT[status] ?? { label: status, cls: 'text-muted' }
  return (
    <div className="animate-fade-in mb-3 flex flex-wrap items-baseline gap-3">
      <span className={cn('text-lg font-semibold', v.cls)}>{v.label}</span>
      {total > 0 && (
        <span className="text-xs text-muted">
          {passed}/{total} {mode === 'submit' ? 'tests' : 'cases'} passed
        </span>
      )}
      {ms !== undefined && status === 'accepted' && <span className="text-xs text-muted">· {ms < 1 ? '<1' : ms.toFixed(1)} ms total</span>}
    </div>
  )
}

export function Celebrate({ show }: { show: boolean }) {
  const reduce = useReducedMotion()
  if (!show || reduce) return null
  const pieces = Array.from({ length: 28 })
  return (
    <div className="pointer-events-none fixed inset-0 z-50 overflow-hidden">
      {pieces.map((_, i) => (
        <motion.span
          key={i}
          className="absolute h-2 w-2 rounded-sm"
          style={{ left: `${50 + (Math.random() - 0.5) * 30}%`, top: '45%', background: `var(--viz-${(i % 6) + 1})` }}
          initial={{ opacity: 1, x: 0, y: 0, rotate: 0 }}
          animate={{ opacity: 0, x: (Math.random() - 0.5) * 700, y: (Math.random() - 0.2) * 500, rotate: Math.random() * 720 }}
          transition={{ duration: 1.4, ease: 'easeOut' }}
        />
      ))}
    </div>
  )
}
