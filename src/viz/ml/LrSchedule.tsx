import { useMemo, useState } from 'react'
import { Button, Slider, cn } from '../../components/ui'
import { C, VizFrame, useSize } from '../common'
import { clamp, fmt } from './_math2'

type ScheduleId = 'constant' | 'step' | 'exp' | 'cosine' | 'warmcos' | 'onecycle' | 'noam'

type Schedule = { id: ScheduleId; label: string; note: string; fn: (step: number, cfg: Config) => number }
type Config = { base: number; total: number; warmup: number; gamma: number; stepEvery: number }

const SCHEDULES: Schedule[] = [
  { id: 'constant', label: 'Constant', note: 'Baselines, small convex problems, quick ablations.', fn: (_s, c) => c.base },
  { id: 'step', label: 'Step decay', note: 'Classic CNN training: drop LR at plateaus/milestones.', fn: (s, c) => c.base * Math.pow(c.gamma, Math.floor(s / c.stepEvery)) },
  { id: 'exp', label: 'Exponential', note: 'Smooth decay when you want no abrupt optimizer shock.', fn: (s, c) => c.base * Math.pow(c.gamma, s / c.total) },
  { id: 'cosine', label: 'Cosine', note: 'Common fine-tuning schedule; anneals gently to zero.', fn: (s, c) => c.base * 0.5 * (1 + Math.cos(Math.PI * clamp(s / c.total))) },
  { id: 'warmcos', label: 'Warmup + cosine', note: 'Transformer and LLM fine-tuning default for stable starts.', fn: (s, c) => s < c.warmup ? c.base * (s / Math.max(1, c.warmup)) : c.base * 0.5 * (1 + Math.cos(Math.PI * clamp((s - c.warmup) / Math.max(1, c.total - c.warmup)))) },
  { id: 'onecycle', label: 'One-cycle', note: 'Fast training: ramp up, then decay far below start.', fn: (s, c) => {
    const up = c.total * 0.3
    if (s < up) return c.base * (0.2 + 2.8 * (s / up))
    return c.base * (0.05 + 2.95 * 0.5 * (1 + Math.cos(Math.PI * clamp((s - up) / Math.max(1, c.total - up)))))
  } },
  { id: 'noam', label: 'Inverse-sqrt', note: 'Transformer/Noam: linear warmup then 1/√step decay.', fn: (s, c) => {
    const step = Math.max(1, s)
    const warm = Math.max(1, c.warmup)
    return c.base * Math.min(Math.sqrt(warm / step), step / warm)
  } },
]

const INITIAL = new Set<ScheduleId>(['constant', 'cosine', 'warmcos', 'noam'])

export default function LrSchedule() {
  const [base, setBase] = useState(0.01)
  const [total, setTotal] = useState(1000)
  const [warmup, setWarmup] = useState(120)
  const [gamma, setGamma] = useState(0.2)
  const [stepEvery, setStepEvery] = useState(250)
  const [selected, setSelected] = useState<Set<ScheduleId>>(INITIAL)
  const [hoverStep, setHoverStep] = useState(300)
  const [wrapRef, size] = useSize<HTMLDivElement>()
  const width = Math.max(380, size.width)
  const height = 330
  const margin = { left: 58, right: 16, top: 18, bottom: 36 }
  const cfg: Config = { base, total, warmup: Math.min(warmup, total - 1), gamma, stepEvery: Math.min(stepEvery, total) }
  const visible = SCHEDULES.filter((s) => selected.has(s.id))
  const samples = useMemo(() => {
    const steps = Array.from({ length: 241 }, (_, i) => Math.round((i / 240) * total))
    const values = visible.flatMap((schedule) => steps.map((s) => schedule.fn(s, cfg)))
    return { steps, max: Math.max(base * 1.1, ...values) }
  }, [base, cfg, total, visible])

  const xScale = (s: number) => margin.left + (s / total) * (width - margin.left - margin.right)
  const yScale = (lr: number) => margin.top + (1 - lr / samples.max) * (height - margin.top - margin.bottom)
  const toggle = (id: ScheduleId) => {
    setSelected((old) => {
      const next = new Set(old)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next.size ? next : old
    })
  }
  const hoverValues = visible.map((schedule, i) => ({ schedule, value: schedule.fn(hoverStep, cfg), color: C.series[i % C.series.length] }))
  const top = hoverValues.reduce((best, item) => (item.value > best.value ? item : best), hoverValues[0] ?? { schedule: SCHEDULES[0], value: base, color: C.accent })

  return (
    <VizFrame
      title="Learning-Rate Schedules"
      description="Overlay common schedules and inspect the learning rate at any training step."
      controls={
        <>
          <Slider label="base LR" value={base} min={0.0005} max={0.08} step={0.0005} onChange={setBase} format={(v) => fmt(v, 4)} className="w-36" />
          <Slider label="total" value={total} min={100} max={5000} step={50} onChange={setTotal} className="w-36" />
          <Slider label="warmup" value={Math.min(warmup, total - 1)} min={0} max={Math.max(1, total - 1)} step={10} onChange={setWarmup} className="w-36" />
          <Slider label="γ / final" value={gamma} min={0.05} max={0.9} step={0.05} onChange={setGamma} format={(v) => fmt(v, 2)} className="w-32" />
          <Slider label="step every" value={Math.min(stepEvery, total)} min={50} max={total} step={50} onChange={setStepEvery} className="w-36" />
        </>
      }
      caption={`step ${hoverStep}: highest visible LR is ${top.schedule.label} = ${fmt(top.value, 5)}; peak scale ${fmt(samples.max, 4)}.`}
      legend={visible.map((s, i) => ({ color: C.series[i % C.series.length], label: s.label }))}
    >
      <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_300px]">
        <div ref={wrapRef} className="rounded-xl border border-line bg-panel p-3">
          <div className="mb-3 flex flex-wrap gap-1.5">
            {SCHEDULES.map((s, i) => (
              <Button key={s.id} size="xs" variant={selected.has(s.id) ? 'primary' : 'outline'} onClick={() => toggle(s.id)} style={{ borderColor: selected.has(s.id) ? C.series[i % C.series.length] : undefined }}>
                {s.label}
              </Button>
            ))}
          </div>
          <svg
            width="100%"
            height={height}
            viewBox={`0 0 ${width} ${height}`}
            onMouseMove={(e) => {
              const rect = e.currentTarget.getBoundingClientRect()
              const t = clamp((e.clientX - rect.left) / Math.max(1, rect.width))
              setHoverStep(Math.round(t * total))
            }}
            onMouseLeave={() => setHoverStep(Math.round(total * 0.3))}
            className="touch-none"
          >
            {Array.from({ length: 6 }, (_, i) => (i / 5) * total).map((s) => (
              <g key={s}>
                <line x1={xScale(s)} x2={xScale(s)} y1={margin.top} y2={height - margin.bottom} stroke={C.line} strokeDasharray="4 7" />
                <text x={xScale(s)} y={height - 12} textAnchor="middle" fontSize="10" fill={C.muted}>{Math.round(s)}</text>
              </g>
            ))}
            {Array.from({ length: 5 }, (_, i) => (i / 4) * samples.max).map((lr) => (
              <g key={lr}>
                <line x1={margin.left} x2={width - margin.right} y1={yScale(lr)} y2={yScale(lr)} stroke={C.line} />
                <text x={margin.left - 8} y={yScale(lr) + 3} textAnchor="end" fontSize="10" fill={C.muted}>{fmt(lr, 3)}</text>
              </g>
            ))}
            {visible.map((schedule, i) => {
              const path = samples.steps.map((s, j) => `${j === 0 ? 'M' : 'L'} ${xScale(s).toFixed(1)} ${yScale(schedule.fn(s, cfg)).toFixed(1)}`).join(' ')
              return <path key={schedule.id} d={path} fill="none" stroke={C.series[i % C.series.length]} strokeWidth="2.6" strokeLinecap="round" />
            })}
            <line x1={xScale(hoverStep)} x2={xScale(hoverStep)} y1={margin.top} y2={height - margin.bottom} stroke={C.accent} strokeDasharray="5 5" />
            {hoverValues.map((item) => <circle key={item.schedule.id} cx={xScale(hoverStep)} cy={yScale(item.value)} r="4" fill={item.color} stroke={C.panel} strokeWidth="2" />)}
            <text x={margin.left} y="12" fontSize="11" fill={C.muted}>learning rate</text>
          </svg>
        </div>

        <div className="space-y-4">
          <div className="rounded-xl border border-line bg-panel p-3">
            <div className="mb-2 text-xs font-semibold text-fg">Hover read-out</div>
            <div className="space-y-2">
              {hoverValues.map((item) => (
                <div key={item.schedule.id} className="flex items-center justify-between rounded-lg border border-line bg-panel-2 p-2 text-xs">
                  <span style={{ color: item.color }}>{item.schedule.label}</span>
                  <span className="font-mono text-fg">{fmt(item.value, 5)}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-xl border border-line bg-panel p-3">
            <div className="mb-2 text-xs font-semibold text-fg">When to use</div>
            <div className="max-h-[270px] space-y-2 overflow-auto pr-1">
              {SCHEDULES.map((s) => (
                <div key={s.id} className={cn('rounded-lg border border-line p-2 text-xs', selected.has(s.id) ? 'bg-accent-soft' : 'bg-panel-2')}>
                  <div className="font-medium text-fg">{s.label}</div>
                  <div className="mt-0.5 text-muted">{s.note}</div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="lg:col-span-2 rounded-xl border border-line bg-panel p-3 text-xs text-muted">
          <span className="font-semibold text-fg">Insight: </span>
          Warmup prevents unstable early updates, while decay trades exploration for convergence as training nears the end.
        </div>
      </div>
    </VizFrame>
  )
}
