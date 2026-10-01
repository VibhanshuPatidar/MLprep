import { ChevronLeft, ChevronRight, Pause, Play, RotateCcw } from 'lucide-react'
import type { ReactNode } from 'react'
import { useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react'
import { Button, Card, Slider, cn } from '../components/ui'

/** Theme-aware palette (CSS variables) for SVG/canvas drawings */
export const C = {
  accent: 'var(--accent)',
  accent2: 'var(--accent-2)',
  fg: 'var(--fg)',
  muted: 'var(--muted)',
  faint: 'var(--faint)',
  line: 'var(--line)',
  lineStrong: 'var(--line-strong)',
  panel: 'var(--panel)',
  panel2: 'var(--panel-2)',
  subtle: 'var(--bg-subtle)',
  ok: 'var(--ok)',
  warn: 'var(--warn)',
  err: 'var(--err)',
  info: 'var(--info)',
  series: ['var(--viz-1)', 'var(--viz-2)', 'var(--viz-3)', 'var(--viz-4)', 'var(--viz-5)', 'var(--viz-6)'],
}

/** Resolve a CSS variable to a concrete color (needed for <canvas>). Re-reads on theme change. */
export function cssVar(name: string): string {
  return getComputedStyle(document.documentElement).getPropertyValue(name).trim() || '#888'
}

/** Returns a counter that increments whenever the theme (html.dark class) changes. */
export function useThemeVersion(): number {
  const [v, setV] = useState(0)
  useEffect(() => {
    const obs = new MutationObserver(() => setV((x) => x + 1))
    obs.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] })
    return () => obs.disconnect()
  }, [])
  return v
}

/** Observe an element's size. */
export function useSize<T extends HTMLElement>(): [React.RefObject<T | null>, { width: number; height: number }] {
  const ref = useRef<T | null>(null)
  const [size, setSize] = useState({ width: 600, height: 400 })
  useLayoutEffect(() => {
    if (!ref.current) return
    const el = ref.current
    const ro = new ResizeObserver(() => setSize({ width: el.clientWidth, height: el.clientHeight }))
    ro.observe(el)
    setSize({ width: el.clientWidth, height: el.clientHeight })
    return () => ro.disconnect()
  }, [])
  return [ref, size]
}

/** requestAnimationFrame loop while `running` */
export function useAnimationFrame(cb: (dtMs: number) => void, running: boolean) {
  const cbRef = useRef(cb)
  cbRef.current = cb
  useEffect(() => {
    if (!running) return
    let raf = 0
    let last = performance.now()
    const tick = (t: number) => {
      cbRef.current(t - last)
      last = t
      raf = requestAnimationFrame(tick)
    }
    raf = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(raf)
  }, [running])
}

export interface Player<T> {
  step: T
  index: number
  total: number
  playing: boolean
  speed: number
  setSpeed: (s: number) => void
  play: () => void
  pause: () => void
  toggle: () => void
  next: () => void
  prev: () => void
  reset: () => void
  setIndex: (i: number) => void
}

/** Step-through player for precomputed algorithm frames. speed = steps per second. */
export function usePlayer<T>(steps: T[], initialSpeed = 2): Player<T> {
  const [index, setIndexRaw] = useState(0)
  const [playing, setPlaying] = useState(false)
  const [speed, setSpeed] = useState(initialSpeed)
  const total = steps.length
  const setIndex = useCallback((i: number) => setIndexRaw(Math.max(0, Math.min(total - 1, i))), [total])

  useEffect(() => {
    setIndexRaw(0)
    setPlaying(false)
  }, [steps])

  useEffect(() => {
    if (!playing) return
    if (index >= total - 1) {
      setPlaying(false)
      return
    }
    const t = setTimeout(() => setIndexRaw((i) => Math.min(total - 1, i + 1)), 1000 / speed)
    return () => clearTimeout(t)
  }, [playing, index, total, speed])

  return {
    step: steps[Math.min(index, Math.max(0, total - 1))],
    index,
    total,
    playing,
    speed,
    setSpeed,
    play: () => {
      if (index >= total - 1) setIndexRaw(0)
      setPlaying(true)
    },
    pause: () => setPlaying(false),
    toggle: () => {
      if (playing) setPlaying(false)
      else {
        if (index >= total - 1) setIndexRaw(0)
        setPlaying(true)
      }
    },
    next: () => setIndex(index + 1),
    prev: () => setIndex(index - 1),
    reset: () => {
      setPlaying(false)
      setIndexRaw(0)
    },
    setIndex,
  }
}

export function PlayerControls<T>({ player, children, maxSpeed = 20 }: { player: Player<T>; children?: ReactNode; maxSpeed?: number }) {
  return (
    <div className="flex flex-wrap items-center gap-2">
      <Button size="icon" variant="outline" onClick={player.reset} title="Reset">
        <RotateCcw size={15} />
      </Button>
      <Button size="icon" variant="outline" onClick={player.prev} disabled={player.index === 0} title="Previous step">
        <ChevronLeft size={16} />
      </Button>
      <Button size="sm" variant="primary" onClick={player.toggle} className="w-20 justify-center">
        {player.playing ? <Pause size={14} /> : <Play size={14} />}
        {player.playing ? 'Pause' : 'Play'}
      </Button>
      <Button size="icon" variant="outline" onClick={player.next} disabled={player.index >= player.total - 1} title="Next step">
        <ChevronRight size={16} />
      </Button>
      <input
        type="range"
        min={0}
        max={Math.max(0, player.total - 1)}
        value={player.index}
        onChange={(e) => player.setIndex(Number(e.target.value))}
        className="mx-1 h-1.5 w-32 cursor-pointer accent-[var(--accent)] sm:w-48"
        aria-label="Timeline"
      />
      <span className="font-mono text-xs text-muted">
        {player.index + 1}/{player.total}
      </span>
      <Slider className="ml-2 w-28 min-w-28" label="Speed" value={player.speed} min={0.5} max={maxSpeed} step={0.5} onChange={player.setSpeed} format={(v) => `${v}x`} />
      {children}
    </div>
  )
}

/** Standard frame for every visualizer: header, controls row, canvas and optional caption/legend. */
export function VizFrame({
  title,
  description,
  controls,
  children,
  caption,
  legend,
  className,
}: {
  title: ReactNode
  description?: ReactNode
  controls?: ReactNode
  children: ReactNode
  caption?: ReactNode
  legend?: { color: string; label: ReactNode }[]
  className?: string
}) {
  return (
    <Card className={cn('overflow-hidden', className)}>
      <div className="flex flex-col gap-3 border-b border-line p-4">
        <div>
          <h3 className="text-sm font-semibold">{title}</h3>
          {description && <p className="mt-0.5 text-xs text-muted">{description}</p>}
        </div>
        {controls && <div className="flex flex-wrap items-center gap-3">{controls}</div>}
      </div>
      <div className="grid-bg relative bg-panel-2 p-4">{children}</div>
      {(caption || legend) && (
        <div className="flex flex-wrap items-center justify-between gap-3 border-t border-line px-4 py-2.5 text-xs text-muted">
          <div className="min-h-4 font-mono">{caption}</div>
          {legend && (
            <div className="flex flex-wrap items-center gap-3">
              {legend.map((l, i) => (
                <span key={i} className="inline-flex items-center gap-1.5">
                  <span className="h-2.5 w-2.5 rounded-sm" style={{ background: l.color }} />
                  {l.label}
                </span>
              ))}
            </div>
          )}
        </div>
      )}
    </Card>
  )
}

/** Seeded PRNG for reproducible demos */
export function mulberry32(seed: number) {
  return () => {
    seed |= 0
    seed = (seed + 0x6d2b79f5) | 0
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed)
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

export function randn(rng: () => number) {
  const u = Math.max(rng(), 1e-12)
  const v = rng()
  return Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * v)
}
