export type Vec2 = { x: number; y: number }
export type LabeledPoint = Vec2 & { label: number }

export const EPS = 1e-9

export function clamp(v: number, lo = 0, hi = 1): number {
  return Math.max(lo, Math.min(hi, v))
}

export function lerp(a: number, b: number, t: number): number {
  return a + (b - a) * t
}

export function fmt(v: number, digits = 2): string {
  if (!Number.isFinite(v)) return '—'
  const abs = Math.abs(v)
  if (abs > 0 && abs < 0.001) return v.toExponential(1)
  return v.toFixed(digits)
}

export function seeded(seed: number): () => number {
  return () => {
    seed |= 0
    seed = (seed + 0x6d2b79f5) | 0
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed)
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

export function normal(rng: () => number): number {
  const u = Math.max(rng(), 1e-12)
  const v = rng()
  return Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * v)
}

export function sigmoid(x: number): number {
  if (x >= 0) {
    const z = Math.exp(-x)
    return 1 / (1 + z)
  }
  const z = Math.exp(x)
  return z / (1 + z)
}

export function softmax(values: readonly number[], temperature = 1): number[] {
  const temp = Math.max(temperature, 1e-6)
  let max = -Infinity
  for (const v of values) if (v > max) max = v
  const exps = values.map((v) => Math.exp((v - max) / temp))
  const sum = exps.reduce((a, b) => a + b, 0) || 1
  return exps.map((v) => v / sum)
}

export function dot(a: readonly number[], b: readonly number[]): number {
  let s = 0
  for (let i = 0; i < a.length; i += 1) s += a[i] * b[i]
  return s
}

export function matVec(m: readonly (readonly number[])[], v: readonly number[]): number[] {
  return m.map((row) => dot(row, v))
}

export function makeMatrix(rows: number, cols: number, rng: () => number, scale = 1): number[][] {
  return Array.from({ length: rows }, () => Array.from({ length: cols }, () => normal(rng) * scale))
}

export function covariance2(points: readonly Vec2[]): { mean: Vec2; cov: [[number, number], [number, number]] } {
  const n = Math.max(1, points.length)
  let mx = 0
  let my = 0
  for (const p of points) {
    mx += p.x
    my += p.y
  }
  mx /= n
  my /= n
  let cxx = 0
  let cxy = 0
  let cyy = 0
  for (const p of points) {
    const dx = p.x - mx
    const dy = p.y - my
    cxx += dx * dx
    cxy += dx * dy
    cyy += dy * dy
  }
  const denom = Math.max(1, n - 1)
  return { mean: { x: mx, y: my }, cov: [[cxx / denom, cxy / denom], [cxy / denom, cyy / denom]] }
}

export function eigenSym2(cov: [[number, number], [number, number]]): { values: [number, number]; vectors: [Vec2, Vec2] } {
  const a = cov[0][0]
  const b = cov[0][1]
  const d = cov[1][1]
  const tr = a + d
  const disc = Math.sqrt(Math.max(0, (a - d) * (a - d) + 4 * b * b))
  const l1 = (tr + disc) / 2
  const l2 = (tr - disc) / 2
  const vectorFor = (lambda: number): Vec2 => {
    let x = b
    let y = lambda - a
    if (Math.abs(x) + Math.abs(y) < EPS) {
      x = lambda >= d ? 1 : 0
      y = lambda >= d ? 0 : 1
    }
    const len = Math.hypot(x, y) || 1
    return { x: x / len, y: y / len }
  }
  const v1 = vectorFor(l1)
  return { values: [l1, l2], vectors: [v1, { x: -v1.y, y: v1.x }] }
}

export function withAlpha(color: string, alpha: number): string {
  const c = color.trim()
  const a = clamp(alpha)
  if (c.startsWith('#')) {
    const raw = c.slice(1)
    const hex = raw.length === 3 ? raw.split('').map((x) => x + x).join('') : raw
    if (hex.length >= 6) {
      const r = Number.parseInt(hex.slice(0, 2), 16)
      const g = Number.parseInt(hex.slice(2, 4), 16)
      const b = Number.parseInt(hex.slice(4, 6), 16)
      return `rgba(${r}, ${g}, ${b}, ${a})`
    }
  }
  const m = c.match(/rgba?\(([^)]+)\)/)
  if (m) {
    const [r, g, b] = m[1].split(',').slice(0, 3).map((x) => Number.parseFloat(x.trim()))
    if ([r, g, b].every(Number.isFinite)) return `rgba(${r}, ${g}, ${b}, ${a})`
  }
  return c
}

export function svgHeat(t: number, color = 'var(--accent)'): string {
  const pct = Math.round(clamp(t) * 92 + 4)
  return `color-mix(in srgb, ${color} ${pct}%, var(--panel) ${100 - pct}%)`
}

export function svgDiverge(v: number): string {
  const t = clamp(Math.abs(v))
  const pct = Math.round(t * 86 + 6)
  const color = v >= 0 ? 'var(--viz-1)' : 'var(--viz-2)'
  return `color-mix(in srgb, ${color} ${pct}%, var(--panel) ${100 - pct}%)`
}

export function entropy(counts: readonly number[]): number {
  const sum = counts.reduce((a, b) => a + b, 0)
  if (sum <= 0) return 0
  let e = 0
  for (const c of counts) {
    if (c > 0) {
      const p = c / sum
      e -= p * Math.log2(p)
    }
  }
  return e
}

export function gini(counts: readonly number[]): number {
  const sum = counts.reduce((a, b) => a + b, 0)
  if (sum <= 0) return 0
  let s = 0
  for (const c of counts) {
    const p = c / sum
    s += p * p
  }
  return 1 - s
}
