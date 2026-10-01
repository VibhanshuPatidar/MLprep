import { useMemo, useState } from 'react'
import { Select, Slider } from '../../components/ui'
import { C, PlayerControls, VizFrame, usePlayer } from '../common'
import { clamp, fmt, seeded, svgDiverge, svgHeat } from './_math2'

type ImagePreset = 'edge' | 'digit' | 'checker' | 'random'
type KernelPreset = 'identity' | 'blur' | 'sharpen' | 'sobelx' | 'sobely' | 'custom'

type ConvCell = { x: number; y: number; sum: number; products: number[][]; values: number[][] }

const IMAGE_OPTIONS: { value: ImagePreset; label: string }[] = [
  { value: 'edge', label: 'Vertical edge' },
  { value: 'digit', label: 'Digit-like' },
  { value: 'checker', label: 'Checkerboard' },
  { value: 'random', label: 'Random' },
]
const KERNEL_OPTIONS: { value: KernelPreset; label: string }[] = [
  { value: 'identity', label: 'Identity' },
  { value: 'blur', label: 'Blur' },
  { value: 'sharpen', label: 'Sharpen' },
  { value: 'sobelx', label: 'Sobel X' },
  { value: 'sobely', label: 'Sobel Y' },
  { value: 'custom', label: 'Custom' },
]

const KERNELS: Record<Exclude<KernelPreset, 'custom'>, number[][]> = {
  identity: [[0, 0, 0], [0, 1, 0], [0, 0, 0]],
  blur: [[1 / 9, 1 / 9, 1 / 9], [1 / 9, 1 / 9, 1 / 9], [1 / 9, 1 / 9, 1 / 9]],
  sharpen: [[0, -1, 0], [-1, 5, -1], [0, -1, 0]],
  sobelx: [[-1, 0, 1], [-2, 0, 2], [-1, 0, 1]],
  sobely: [[-1, -2, -1], [0, 0, 0], [1, 2, 1]],
}

function makeImage(kind: ImagePreset): number[][] {
  if (kind === 'checker') return Array.from({ length: 10 }, (_, y) => Array.from({ length: 10 }, (_, x) => ((x + y) % 2 ? 0.18 : 0.88)))
  if (kind === 'random') {
    const rng = seeded(777)
    return Array.from({ length: 10 }, () => Array.from({ length: 10 }, () => Math.round(rng() * 5) / 5))
  }
  if (kind === 'digit') {
    const pts = new Set(['2,1', '3,1', '4,1', '5,1', '6,1', '7,1', '7,2', '7,3', '6,4', '5,5', '4,6', '3,7', '2,8', '3,8', '4,8', '5,8', '6,8', '7,8'])
    return Array.from({ length: 10 }, (_, y) => Array.from({ length: 10 }, (_, x) => (pts.has(`${x},${y}`) ? 0.95 : 0.08 + 0.04 * ((x + y) % 3))))
  }
  return Array.from({ length: 10 }, (_, y) => Array.from({ length: 10 }, (_, x) => clamp((x - 3.5) / 3 + (y % 3) * 0.03)))
}

function getPixel(image: number[][], x: number, y: number): number {
  if (y < 0 || y >= image.length || x < 0 || x >= image[0].length) return 0
  return image[y][x]
}

function computeCells(image: number[][], kernel: number[][], stride: number, padding: number): { cells: ConvCell[]; outW: number; outH: number; rawOut: number } {
  const w = image[0].length
  const h = image.length
  const rawOut = (w - 3 + 2 * padding) / stride + 1
  const outW = Math.floor(rawOut)
  const outH = Math.floor((h - 3 + 2 * padding) / stride + 1)
  const cells: ConvCell[] = []
  for (let oy = 0; oy < outH; oy += 1) {
    for (let ox = 0; ox < outW; ox += 1) {
      const startX = ox * stride - padding
      const startY = oy * stride - padding
      const products = Array.from({ length: 3 }, () => Array.from({ length: 3 }, () => 0))
      const values = Array.from({ length: 3 }, () => Array.from({ length: 3 }, () => 0))
      let sum = 0
      for (let ky = 0; ky < 3; ky += 1) {
        for (let kx = 0; kx < 3; kx += 1) {
          const v = getPixel(image, startX + kx, startY + ky)
          values[ky][kx] = v
          products[ky][kx] = v * kernel[ky][kx]
          sum += products[ky][kx]
        }
      }
      cells.push({ x: startX, y: startY, sum, products, values })
    }
  }
  return { cells, outW, outH, rawOut }
}

export default function Convolution() {
  const [imagePreset, setImagePreset] = useState<ImagePreset>('digit')
  const [kernelPreset, setKernelPreset] = useState<KernelPreset>('sobelx')
  const [customKernel, setCustomKernel] = useState<number[][]>(KERNELS.sharpen.map((r) => [...r]))
  const [stride, setStride] = useState(1)
  const [padding, setPadding] = useState(1)
  const image = useMemo(() => makeImage(imagePreset), [imagePreset])
  const kernel = kernelPreset === 'custom' ? customKernel : KERNELS[kernelPreset]
  const conv = useMemo(() => computeCells(image, kernel, stride, padding), [customKernel, image, kernel, kernelPreset, padding, stride])
  const player = usePlayer(conv.cells, 8)
  const index = Math.min(player.index, conv.cells.length - 1)
  const current = conv.cells[index]
  const filled = conv.cells.slice(0, index + 1)
  const outValues = conv.cells.map((c) => c.sum)
  const maxAbs = Math.max(1e-6, ...outValues.map(Math.abs))

  const setKernelValue = (r: number, c: number, value: number) => {
    setKernelPreset('custom')
    setCustomKernel((old) => old.map((row, y) => row.map((x, col) => (y === r && col === c ? value : x))))
  }

  return (
    <VizFrame
      title="2-D Convolution"
      description="Slide a 3×3 kernel over a 10×10 grayscale image; every output cell is a dot product."
      controls={
        <>
          <Select<ImagePreset> value={imagePreset} onChange={setImagePreset} options={IMAGE_OPTIONS} />
          <Select<KernelPreset> value={kernelPreset} onChange={setKernelPreset} options={KERNEL_OPTIONS} />
          <Slider label="stride" value={stride} min={1} max={3} step={1} onChange={setStride} className="w-28" />
          <Slider label="padding" value={padding} min={0} max={2} step={1} onChange={setPadding} className="w-28" />
          <PlayerControls player={player} maxSpeed={16} />
        </>
      }
      caption={`window top-left=(${current.x}, ${current.y}); dot product sum=${fmt(current.sum, 3)}; output shape ${conv.outH}×${conv.outW}.`}
      legend={[
        { color: C.fg, label: 'bright input' },
        { color: C.accent, label: 'positive output' },
        { color: C.series[1], label: 'negative output' },
      ]}
    >
      <div className="grid gap-4 xl:grid-cols-[minmax(260px,1fr)_260px_minmax(260px,1fr)]">
        <div className="rounded-xl border border-line bg-panel p-3">
          <div className="mb-2 flex justify-between text-xs"><span className="font-semibold text-fg">Input image</span><span className="text-muted">10×10</span></div>
          <div className="grid gap-1" style={{ gridTemplateColumns: 'repeat(10, minmax(0, 1fr))' }}>
            {image.flatMap((row, y) => row.map((v, x) => {
              const inWindow = x >= current.x && x < current.x + 3 && y >= current.y && y < current.y + 3
              return <div key={`${x}-${y}`} className="aspect-square rounded-md border text-[9px] font-mono transition-all" style={{ background: svgHeat(v, 'var(--fg)'), borderColor: inWindow ? C.accent : C.line, boxShadow: inWindow ? `0 0 0 2px ${C.accent}` : undefined }} />
            }))}
          </div>
        </div>

        <div className="space-y-4">
          <div className="rounded-xl border border-line bg-panel p-3">
            <div className="mb-2 text-xs font-semibold text-fg">Kernel (editable)</div>
            <div className="grid grid-cols-3 gap-1">
              {kernel.map((row, r) => row.map((v, c) => (
                <input
                  key={`${r}-${c}`}
                  value={Number.isInteger(v) ? String(v) : fmt(v, 2)}
                  onChange={(e) => setKernelValue(r, c, Number(e.target.value) || 0)}
                  className="h-10 rounded-lg border border-line bg-panel-2 text-center font-mono text-xs text-fg outline-none focus:ring-2 focus:ring-accent/40"
                  aria-label={`kernel ${r},${c}`}
                />
              )))}
            </div>
          </div>

          <div className="rounded-xl border border-line bg-panel p-3">
            <div className="mb-2 text-xs font-semibold text-fg">Current products</div>
            <div className="grid grid-cols-3 gap-1">
              {current.products.flatMap((row, r) => row.map((v, c) => (
                <div key={`${r}-${c}`} className="rounded-lg border border-line bg-panel-2 p-1 text-center text-[10px]">
                  <div className="font-mono text-muted">{fmt(current.values[r][c], 2)}×{fmt(kernel[r][c], 2)}</div>
                  <div className="font-mono text-fg">{fmt(v, 2)}</div>
                </div>
              )))}
            </div>
            <div className="mt-2 rounded-lg bg-subtle p-2 text-center font-mono text-sm text-fg">Σ = {fmt(current.sum, 3)}</div>
          </div>
        </div>

        <div className="rounded-xl border border-line bg-panel p-3">
          <div className="mb-2 flex justify-between text-xs"><span className="font-semibold text-fg">Output feature map</span><span className="text-muted">{conv.outH}×{conv.outW}</span></div>
          <div className="grid gap-1" style={{ gridTemplateColumns: `repeat(${conv.outW}, minmax(0, 1fr))` }}>
            {Array.from({ length: conv.outH * conv.outW }, (_, i) => {
              const cell = filled[i]
              const isCurrent = i === index
              return <div key={i} className="flex aspect-square items-center justify-center rounded-md border border-line text-center text-[10px] font-mono text-fg transition-all" style={{ background: cell ? svgDiverge(cell.sum / maxAbs) : 'var(--panel-2)', boxShadow: isCurrent ? `0 0 0 2px ${C.accent}` : undefined }}>{cell ? fmt(cell.sum, 1) : ''}</div>
            })}
          </div>
        </div>

        <div className="xl:col-span-3 rounded-xl border border-line bg-panel p-3 text-xs text-muted">
          <div className="font-mono text-fg">((W − K + 2P) / S) + 1 = ((10 − 3 + 2·{padding}) / {stride}) + 1 = {fmt(conv.rawOut, 2)} → floor = {conv.outW}</div>
          <div className="mt-2"><span className="font-semibold text-fg">Insight: </span>Stride skips positions, padding preserves borders, and each output activation is one local weighted sum shared across the image.</div>
        </div>
      </div>
    </VizFrame>
  )
}
