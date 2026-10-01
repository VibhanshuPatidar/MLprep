import { useMemo, useState } from 'react'
import { Button, Switch, cn } from '../../components/ui'
import { C, VizFrame, useSize } from '../common'
import { clamp, fmt, sigmoid } from './_math2'

type FnId = 'relu' | 'leaky' | 'elu' | 'gelu' | 'silu' | 'tanh' | 'sigmoid' | 'softplus'

type Activation = {
  id: FnId
  label: string
  note: string
  risk: string
  f: (x: number) => number
  d: (x: number) => number
}

function gelu(x: number): number {
  const k = Math.sqrt(2 / Math.PI)
  return 0.5 * x * (1 + Math.tanh(k * (x + 0.044715 * x * x * x)))
}

function geluDerivative(x: number): number {
  const k = Math.sqrt(2 / Math.PI)
  const inner = k * (x + 0.044715 * x * x * x)
  const t = Math.tanh(inner)
  const sech2 = 1 - t * t
  return 0.5 * (1 + t) + 0.5 * x * sech2 * k * (1 + 3 * 0.044715 * x * x)
}

function softplus(x: number): number {
  return x > 20 ? x : Math.log1p(Math.exp(x))
}

const FNS: Activation[] = [
  { id: 'relu', label: 'ReLU', note: 'fast sparse activations', risk: 'dead units for x<0', f: (x) => Math.max(0, x), d: (x) => (x > 0 ? 1 : 0) },
  { id: 'leaky', label: 'Leaky ReLU', note: 'small negative slope', risk: 'less dead ReLU risk', f: (x) => (x > 0 ? x : 0.1 * x), d: (x) => (x > 0 ? 1 : 0.1) },
  { id: 'elu', label: 'ELU', note: 'negative saturation', risk: 'exp cost but centered', f: (x) => (x >= 0 ? x : Math.exp(x) - 1), d: (x) => (x >= 0 ? 1 : Math.exp(x)) },
  { id: 'gelu', label: 'GELU', note: 'smooth probabilistic gate', risk: 'Transformer default', f: gelu, d: geluDerivative },
  { id: 'silu', label: 'SiLU/Swish', note: 'x·sigmoid(x)', risk: 'smooth non-monotone', f: (x) => x * sigmoid(x), d: (x) => sigmoid(x) + x * sigmoid(x) * (1 - sigmoid(x)) },
  { id: 'tanh', label: 'tanh', note: 'zero-centered bounded', risk: 'saturates at ±1', f: Math.tanh, d: (x) => 1 - Math.tanh(x) ** 2 },
  { id: 'sigmoid', label: 'sigmoid', note: 'probability squashing', risk: 'vanishing gradients', f: sigmoid, d: (x) => sigmoid(x) * (1 - sigmoid(x)) },
  { id: 'softplus', label: 'softplus', note: 'smooth ReLU', risk: 'never exactly sparse', f: softplus, d: sigmoid },
]

const INITIAL = new Set<FnId>(['relu', 'gelu', 'silu', 'tanh', 'sigmoid'])

export default function Activations() {
  const [selected, setSelected] = useState<Set<FnId>>(INITIAL)
  const [derivativeMode, setDerivativeMode] = useState(false)
  const [hoverX, setHoverX] = useState(0)
  const [wrapRef, size] = useSize<HTMLDivElement>()
  const width = Math.max(360, size.width)
  const height = 300
  const margin = { left: 44, right: 18, top: 18, bottom: 34 }
  const xmin = -5
  const xmax = 5

  const visible = FNS.filter((fn) => selected.has(fn.id))
  const samples = useMemo(() => {
    const xs = Array.from({ length: 241 }, (_, i) => xmin + ((xmax - xmin) * i) / 240)
    const ys = visible.flatMap((fn) => xs.map((x) => (derivativeMode ? fn.d(x) : fn.f(x))))
    const rawMin = Math.min(...ys, derivativeMode ? -0.2 : -1.2)
    const rawMax = Math.max(...ys, derivativeMode ? 1.2 : 4.2)
    const pad = (rawMax - rawMin) * 0.08 || 1
    return { xs, ymin: rawMin - pad, ymax: rawMax + pad }
  }, [derivativeMode, visible])

  const xScale = (x: number) => margin.left + ((x - xmin) / (xmax - xmin)) * (width - margin.left - margin.right)
  const yScale = (y: number) => margin.top + (1 - (y - samples.ymin) / (samples.ymax - samples.ymin)) * (height - margin.top - margin.bottom)
  const pathFor = (fn: Activation) => samples.xs.map((x, i) => `${i === 0 ? 'M' : 'L'} ${xScale(x).toFixed(2)} ${yScale(derivativeMode ? fn.d(x) : fn.f(x)).toFixed(2)}`).join(' ')

  const toggle = (id: FnId) => {
    setSelected((old) => {
      const next = new Set(old)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next.size ? next : old
    })
  }

  const hoverValues = visible.map((fn, i) => ({ fn, color: C.series[i % C.series.length], fx: fn.f(hoverX), dx: fn.d(hoverX) }))
  const strongest = hoverValues.reduce((best, item) => (Math.abs(item.dx) > Math.abs(best.dx) ? item : best), hoverValues[0] ?? { fn: FNS[0], color: C.accent, fx: 0, dx: 0 })

  return (
    <VizFrame
      title="Activation Functions"
      description="Compare common nonlinearities and their gradients; hover the chart for exact f(x) and f′(x)."
      controls={
        <>
          <Switch checked={derivativeMode} onChange={setDerivativeMode} label="plot derivatives" />
          <div className="flex flex-wrap gap-1.5">
            {FNS.map((fn, i) => (
              <Button key={fn.id} size="xs" variant={selected.has(fn.id) ? 'primary' : 'outline'} onClick={() => toggle(fn.id)} style={{ borderColor: selected.has(fn.id) ? C.series[i % C.series.length] : undefined }}>
                {fn.label}
              </Button>
            ))}
          </div>
        </>
      }
      caption={`At x=${fmt(hoverX, 2)}, ${strongest.fn.label} has the largest visible slope: f′=${fmt(strongest.dx, 3)}.`}
      legend={visible.map((fn, i) => ({ color: C.series[i % C.series.length], label: fn.label }))}
    >
      <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_260px]">
        <div ref={wrapRef} className="rounded-xl border border-line bg-panel p-2">
          <svg
            width="100%"
            height={height}
            viewBox={`0 0 ${width} ${height}`}
            onMouseMove={(e) => {
              const rect = e.currentTarget.getBoundingClientRect()
              const t = clamp((e.clientX - rect.left) / Math.max(1, rect.width))
              setHoverX(xmin + t * (xmax - xmin))
            }}
            onMouseLeave={() => setHoverX(0)}
            className="touch-none"
          >
            {Array.from({ length: 6 }, (_, i) => xmin + i * 2).map((x) => (
              <g key={`gx-${x}`}>
                <line x1={xScale(x)} x2={xScale(x)} y1={margin.top} y2={height - margin.bottom} stroke={C.line} strokeDasharray="3 6" />
                <text x={xScale(x)} y={height - 10} textAnchor="middle" fontSize="10" fill={C.muted}>{x}</text>
              </g>
            ))}
            {Array.from({ length: 5 }, (_, i) => samples.ymin + ((samples.ymax - samples.ymin) * i) / 4).map((y) => (
              <g key={`gy-${y}`}>
                <line x1={margin.left} x2={width - margin.right} y1={yScale(y)} y2={yScale(y)} stroke={C.line} />
                <text x={margin.left - 8} y={yScale(y) + 3} textAnchor="end" fontSize="10" fill={C.muted}>{fmt(y, 1)}</text>
              </g>
            ))}
            <line x1={margin.left} x2={width - margin.right} y1={yScale(0)} y2={yScale(0)} stroke={C.lineStrong} />
            <line x1={xScale(0)} x2={xScale(0)} y1={margin.top} y2={height - margin.bottom} stroke={C.lineStrong} />
            {visible.map((fn, i) => (
              <path key={fn.id} d={pathFor(fn)} fill="none" stroke={C.series[i % C.series.length]} strokeWidth="2.5" strokeLinecap="round" style={{ transition: 'd .2s ease' }} />
            ))}
            <line x1={xScale(hoverX)} x2={xScale(hoverX)} y1={margin.top} y2={height - margin.bottom} stroke={C.accent} strokeDasharray="4 4" />
            <circle cx={xScale(hoverX)} cy={yScale(derivativeMode ? strongest.dx : strongest.fx)} r="4" fill={strongest.color} stroke={C.panel} strokeWidth="2" />
            <text x={margin.left} y={14} fontSize="11" fill={C.muted}>{derivativeMode ? 'Derivative f′(x)' : 'Activation f(x)'}</text>
          </svg>
        </div>

        <div className="rounded-xl border border-line bg-panel p-3">
          <div className="mb-2 text-xs font-semibold text-fg">Hover read-out</div>
          <div className="max-h-[270px] space-y-2 overflow-auto pr-1">
            {hoverValues.map((item) => (
              <div key={item.fn.id} className="rounded-lg border border-line bg-panel-2 p-2 text-xs">
                <div className="flex items-center justify-between gap-2">
                  <span className="font-medium" style={{ color: item.color }}>{item.fn.label}</span>
                  <span className="font-mono text-muted">x={fmt(hoverX, 2)}</span>
                </div>
                <div className="mt-1 grid grid-cols-2 gap-2 font-mono text-fg">
                  <span>f={fmt(item.fx, 3)}</span>
                  <span>f′={fmt(item.dx, 3)}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="lg:col-span-2 overflow-x-auto rounded-xl border border-line bg-panel p-3">
          <table className="w-full min-w-[680px] text-left text-xs">
            <thead className="text-muted">
              <tr>
                <th className="px-2 py-1.5">Function</th>
                <th className="px-2 py-1.5">What to notice</th>
                <th className="px-2 py-1.5">Interview insight</th>
              </tr>
            </thead>
            <tbody>
              {FNS.map((fn) => (
                <tr key={fn.id} className={cn('border-t border-line', selected.has(fn.id) && 'bg-accent-soft')}>
                  <td className="px-2 py-1.5 font-medium text-fg">{fn.label}</td>
                  <td className="px-2 py-1.5 text-muted">{fn.note}</td>
                  <td className="px-2 py-1.5 text-muted">{fn.risk}</td>
                </tr>
              ))}
            </tbody>
          </table>
          <div className="mt-3 rounded-lg bg-subtle p-2 text-xs text-muted">
            Insight: saturated functions have near-zero derivatives, while smooth ReLU variants keep gradient flow less brittle around zero.
          </div>
        </div>
      </div>
    </VizFrame>
  )
}
