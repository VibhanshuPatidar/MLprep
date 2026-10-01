import { useMemo, useState } from 'react'
import { Slider, Tabs } from '../../components/ui'
import { C, VizFrame, useSize } from '../common'
import { clamp, dot, fmt, svgDiverge } from './_math2'

type Tab = 'sin' | 'rope'

function peValue(pos: number, dim: number, dModel: number): number {
  const pair = Math.floor(dim / 2)
  const angle = pos / Math.pow(10000, (2 * pair) / dModel)
  return dim % 2 === 0 ? Math.sin(angle) : Math.cos(angle)
}

function rotate(v: [number, number], angle: number): [number, number] {
  const c = Math.cos(angle)
  const s = Math.sin(angle)
  return [c * v[0] - s * v[1], s * v[0] + c * v[1]]
}

export default function PositionalEncoding() {
  const [tab, setTab] = useState<Tab>('sin')
  const [positions, setPositions] = useState(36)
  const [dims, setDims] = useState(32)
  const [dimA, setDimA] = useState(0)
  const [dimB, setDimB] = useState(1)
  const [qPos, setQPos] = useState(4)
  const [kPos, setKPos] = useState(13)
  const [theta, setTheta] = useState(0.42)
  const [wrapRef, size] = useSize<HTMLDivElement>()
  const width = Math.max(360, size.width)

  const data = useMemo(() => {
    const matrix = Array.from({ length: positions }, (_, p) => Array.from({ length: dims }, (_, d) => peValue(p, d, dims)))
    const sims = Array.from({ length: positions }, (_, i) => Array.from({ length: positions }, (_, j) => dot(matrix[i], matrix[j]) / dims))
    return { matrix, sims }
  }, [dims, positions])

  const safeDimA = Math.min(dimA, dims - 1)
  const safeDimB = Math.min(dimB, dims - 1)
  const safeQPos = Math.min(qPos, positions - 1)
  const safeKPos = Math.min(kPos, positions - 1)
  const lineDims = Array.from(new Set([safeDimA, safeDimB, Math.min(dims - 1, safeDimA + 2)]))
  const heatW = width
  const heatH = Math.max(170, Math.min(330, positions * 6 + 44))
  const left = 38
  const top = 20
  const cellW = (heatW - left - 12) / dims
  const cellH = (heatH - top - 24) / positions
  const lineH = 190
  const lineLeft = 40
  const lineBottom = 28
  const xLine = (p: number) => lineLeft + (p / Math.max(1, positions - 1)) * (width - lineLeft - 16)
  const yLine = (v: number) => 12 + (1 - (v + 1) / 2) * (lineH - lineBottom - 18)
  const simSize = Math.min(width, 360)
  const simCell = (simSize - 32) / positions
  const qr = rotate([1, 0.35], safeQPos * theta)
  const kr = rotate([0.55, 1], safeKPos * theta)
  const baseDot = 1 * 0.55 + 0.35 * 1
  const rotatedDot = qr[0] * kr[0] + qr[1] * kr[1]
  const relativeK = rotate([0.55, 1], (safeKPos - safeQPos) * theta)
  const relativeDot = 1 * relativeK[0] + 0.35 * relativeK[1]
  const caption = tab === 'sin'
    ? `PE[${positions}×${dims}] · nearby positions have high dot-product bands; dims ${lineDims.join(', ')} are plotted.`
    : `RoPE rotates q by ${fmt(safeQPos * theta, 2)} rad and k by ${fmt(safeKPos * theta, 2)} rad; dot=${fmt(rotatedDot, 3)} equals relative form ${fmt(relativeDot, 3)}.`

  return (
    <VizFrame
      title="Positional Encodings"
      description="Sinusoidal encodings inject absolute position; RoPE turns position into relative phase differences."
      controls={
        <>
          <Tabs<Tab> items={[{ id: 'sin', label: 'Sinusoidal' }, { id: 'rope', label: 'RoPE' }]} value={tab} onChange={setTab} size="sm" />
          <Slider label="N" value={positions} min={8} max={64} step={1} onChange={setPositions} className="w-32" />
          <Slider label="d" value={dims} min={8} max={64} step={2} onChange={(v) => { setDims(v); setDimA((x) => Math.min(x, v - 1)); setDimB((x) => Math.min(x, v - 1)) }} className="w-32" />
          {tab === 'sin' && <Slider label="dim A" value={safeDimA} min={0} max={dims - 1} step={1} onChange={setDimA} className="w-32" />}
          {tab === 'sin' && <Slider label="dim B" value={safeDimB} min={0} max={dims - 1} step={1} onChange={setDimB} className="w-32" />}
        </>
      }
      caption={caption}
      legend={[
        { color: C.series[0], label: 'positive / sine' },
        { color: C.series[1], label: 'negative / phase' },
        { color: C.ok, label: 'relative dot' },
      ]}
    >
      <div ref={wrapRef}>
        {tab === 'sin' ? (
          <div className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_390px]">
            <div className="space-y-4">
              <div className="overflow-hidden rounded-xl border border-line bg-panel p-2">
                <div className="mb-2 text-xs font-semibold text-fg">Sinusoidal heatmap</div>
                <svg width="100%" height={heatH} viewBox={`0 0 ${heatW} ${heatH}`}>
                  {data.matrix.map((row, p) => row.map((v, d) => <rect key={`${p}-${d}`} x={left + d * cellW} y={top + p * cellH} width={Math.max(0.5, cellW)} height={Math.max(0.5, cellH)} fill={svgDiverge(v)} />))}
                  <text x="4" y={top + 10} fontSize="10" fill={C.muted}>pos</text>
                  <text x={left} y="12" fontSize="10" fill={C.muted}>dimension</text>
                  {Array.from({ length: 5 }, (_, i) => Math.round((i * (positions - 1)) / 4)).map((p) => <text key={p} x="8" y={top + p * cellH + 4} fontSize="9" fill={C.muted}>{p}</text>)}
                </svg>
              </div>

              <div className="rounded-xl border border-line bg-panel p-2">
                <div className="mb-2 text-xs font-semibold text-fg">Selected dimensions vs position</div>
                <svg width="100%" height={lineH} viewBox={`0 0 ${width} ${lineH}`}>
                  <line x1={lineLeft} x2={width - 16} y1={yLine(0)} y2={yLine(0)} stroke={C.lineStrong} />
                  {[-1, -0.5, 0.5, 1].map((v) => <line key={v} x1={lineLeft} x2={width - 16} y1={yLine(v)} y2={yLine(v)} stroke={C.line} strokeDasharray="4 6" />)}
                  {lineDims.map((dim, i) => {
                    const path = data.matrix.map((row, p) => `${p === 0 ? 'M' : 'L'} ${xLine(p).toFixed(1)} ${yLine(row[dim]).toFixed(1)}`).join(' ')
                    return <path key={dim} d={path} fill="none" stroke={C.series[i % C.series.length]} strokeWidth="2.4" />
                  })}
                  {lineDims.map((dim, i) => <text key={`l-${dim}`} x={lineLeft + i * 72} y={lineH - 8} fontSize="10" fill={C.series[i % C.series.length]}>dim {dim}</text>)}
                  <text x="6" y={yLine(1) + 4} fontSize="10" fill={C.muted}>1</text>
                  <text x="6" y={yLine(-1) + 4} fontSize="10" fill={C.muted}>-1</text>
                </svg>
              </div>
            </div>

            <div className="rounded-xl border border-line bg-panel p-3">
              <div className="mb-2 flex justify-between text-xs"><span className="font-semibold text-fg">Position dot-product similarity</span><span className="font-mono text-muted">PEᵢ·PEⱼ / d</span></div>
              <svg width="100%" height={simSize} viewBox={`0 0 ${simSize} ${simSize}`}>
                {data.sims.map((row, i) => row.map((v, j) => <rect key={`${i}-${j}`} x={24 + j * simCell} y={8 + i * simCell} width={Math.max(0.5, simCell)} height={Math.max(0.5, simCell)} fill={svgDiverge(clamp(v * 2, -1, 1))} />))}
                <text x="2" y="18" fontSize="10" fill={C.muted}>i</text>
                <text x={simSize - 20} y={simSize - 4} fontSize="10" fill={C.muted}>j</text>
              </svg>
              <div className="mt-3 rounded-lg bg-subtle p-2 text-xs text-muted"><span className="font-semibold text-fg">Insight: </span>Diagonal bands mean similarity depends strongly on relative offset, even though the table encodes absolute positions.</div>
            </div>
          </div>
        ) : (
          <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_300px]">
            <div className="rounded-xl border border-line bg-panel p-3">
              <div className="mb-3 grid gap-3 sm:grid-cols-3">
                <Slider label="q pos" value={safeQPos} min={0} max={positions - 1} step={1} onChange={setQPos} />
                <Slider label="k pos" value={safeKPos} min={0} max={positions - 1} step={1} onChange={setKPos} />
                <Slider label="θ" value={theta} min={0.08} max={0.9} step={0.01} onChange={setTheta} format={(v) => fmt(v, 2)} />
              </div>
              <svg width="100%" height="360" viewBox="0 0 560 360">
                <circle cx="280" cy="180" r="116" fill="none" stroke={C.lineStrong} />
                <line x1="164" x2="396" y1="180" y2="180" stroke={C.line} />
                <line x1="280" x2="280" y1="64" y2="296" stroke={C.line} />
                {[
                  { label: 'qₘ', vec: qr, color: C.accent },
                  { label: 'kₙ', vec: kr, color: C.warn },
                  { label: 'R((n−m)θ)k', vec: relativeK, color: C.ok },
                ].map((item) => {
                  const len = Math.hypot(item.vec[0], item.vec[1]) || 1
                  const x = 280 + (item.vec[0] / len) * 105
                  const y = 180 - (item.vec[1] / len) * 105
                  return (
                    <g key={item.label}>
                      <line x1="280" y1="180" x2={x} y2={y} stroke={item.color} strokeWidth="4" strokeLinecap="round" />
                      <circle cx={x} cy={y} r="5" fill={item.color} />
                      <text x={x + 8} y={y - 4} fontSize="12" fill={item.color}>{item.label}</text>
                    </g>
                  )
                })}
                <path d={`M 325 180 A 45 45 0 0 0 ${280 + Math.cos((safeKPos - safeQPos) * theta) * 45} ${180 - Math.sin((safeKPos - safeQPos) * theta) * 45}`} fill="none" stroke={C.ok} strokeWidth="2" />
                <text x="24" y="28" fontSize="13" fill={C.fg}>Relative angle (n−m)θ = {fmt((safeKPos - safeQPos) * theta, 2)} rad</text>
                <text x="24" y="50" fontSize="11" fill={C.muted}>base q·k={fmt(baseDot, 3)} · rotated qₘ·kₙ={fmt(rotatedDot, 3)}</text>
              </svg>
            </div>

            <div className="space-y-4">
              <div className="rounded-xl border border-line bg-panel p-3 text-sm">
                <div className="mb-2 text-xs font-semibold text-fg">RoPE identity</div>
                <div className="space-y-2 font-mono text-xs text-muted">
                  <div>qₘ = R(mθ)q</div>
                  <div>kₙ = R(nθ)k</div>
                  <div className="rounded-lg bg-subtle p-2 text-fg">qₘ·kₙ = q·R((n−m)θ)k</div>
                </div>
              </div>
              <div className="rounded-xl border border-line bg-panel p-3 text-xs text-muted">
                <span className="font-semibold text-fg">Insight: </span>
                RoPE makes attention scores depend on how far apart tokens are, while preserving vector norms under rotation.
              </div>
            </div>
          </div>
        )}
      </div>
    </VizFrame>
  )
}
