export interface Point2 {
  x: number
  y: number
}

export interface LabeledPoint extends Point2 {
  label: number
}

export const clamp = (v: number, lo: number, hi: number): number => Math.max(lo, Math.min(hi, v))
export const lerp = (a: number, b: number, t: number): number => a + (b - a) * t
export const sq = (v: number): number => v * v
export const sigmoid = (z: number): number => (z >= 0 ? 1 / (1 + Math.exp(-z)) : Math.exp(z) / (1 + Math.exp(z)))

export function mean(xs: readonly number[]): number {
  return xs.length === 0 ? 0 : xs.reduce((s, x) => s + x, 0) / xs.length
}

export function mse(actual: readonly number[], predicted: readonly number[]): number {
  if (actual.length === 0) return 0
  let s = 0
  for (let i = 0; i < actual.length; i += 1) s += sq(actual[i] - predicted[i])
  return s / actual.length
}

export function dist(a: Point2, b: Point2, metric: 'euclidean' | 'manhattan' = 'euclidean'): number {
  const dx = Math.abs(a.x - b.x)
  const dy = Math.abs(a.y - b.y)
  return metric === 'manhattan' ? dx + dy : Math.hypot(dx, dy)
}

export function solveLinearSystem(matrix: number[][], rhs: number[]): number[] {
  const n = rhs.length
  const a = matrix.map((row, i) => [...row, rhs[i]])
  for (let col = 0; col < n; col += 1) {
    let pivot = col
    for (let r = col + 1; r < n; r += 1) {
      if (Math.abs(a[r][col]) > Math.abs(a[pivot][col])) pivot = r
    }
    if (Math.abs(a[pivot][col]) < 1e-10) {
      a[pivot][col] = a[pivot][col] >= 0 ? 1e-10 : -1e-10
    }
    if (pivot !== col) [a[pivot], a[col]] = [a[col], a[pivot]]
    const div = a[col][col]
    for (let c = col; c <= n; c += 1) a[col][c] /= div
    for (let r = 0; r < n; r += 1) {
      if (r === col) continue
      const factor = a[r][col]
      if (factor === 0) continue
      for (let c = col; c <= n; c += 1) a[r][c] -= factor * a[col][c]
    }
  }
  return a.map((row) => row[n])
}

export function fitPolynomial(xs: readonly number[], ys: readonly number[], degree: number, ridge: number): number[] {
  const p = degree + 1
  const xtx = Array.from({ length: p }, () => Array.from({ length: p }, () => 0))
  const xty = Array.from({ length: p }, () => 0)
  for (let i = 0; i < xs.length; i += 1) {
    const powers = Array.from({ length: p }, (_, j) => xs[i] ** j)
    for (let r = 0; r < p; r += 1) {
      xty[r] += powers[r] * ys[i]
      for (let c = 0; c < p; c += 1) xtx[r][c] += powers[r] * powers[c]
    }
  }
  const penalty = Math.max(0, ridge)
  for (let i = 1; i < p; i += 1) xtx[i][i] += penalty
  xtx[0][0] += 1e-8
  return solveLinearSystem(xtx, xty)
}

export function evalPolynomial(coeffs: readonly number[], x: number): number {
  let y = 0
  for (let i = coeffs.length - 1; i >= 0; i -= 1) y = y * x + coeffs[i]
  return y
}

export function normalPdf(x: number, mu: number, sigma: number): number {
  const z = (x - mu) / sigma
  return Math.exp(-0.5 * z * z) / (sigma * Math.sqrt(2 * Math.PI))
}

export function erf(x: number): number {
  const sign = x < 0 ? -1 : 1
  const ax = Math.abs(x)
  const t = 1 / (1 + 0.3275911 * ax)
  const y = 1 - (((((1.061405429 * t - 1.453152027) * t + 1.421413741) * t - 0.284496736) * t + 0.254829592) * t) * Math.exp(-ax * ax)
  return sign * y
}

export function normalCdf(x: number, mu: number, sigma: number): number {
  return 0.5 * (1 + erf((x - mu) / (sigma * Math.SQRT2)))
}

export function softmax(logits: readonly number[], temperature: number): number[] {
  const t = Math.max(0.05, temperature)
  const scaled = logits.map((v) => v / t)
  const m = Math.max(...scaled)
  const exps = scaled.map((v) => Math.exp(v - m))
  const z = exps.reduce((s, v) => s + v, 0) || 1
  return exps.map((v) => v / z)
}

export function entropy(probs: readonly number[]): number {
  let h = 0
  for (const p of probs) if (p > 0) h -= p * Math.log2(p)
  return h
}

export function chooseIndex(probs: readonly number[], u: number): number {
  let acc = 0
  for (let i = 0; i < probs.length; i += 1) {
    acc += probs[i]
    if (u <= acc) return i
  }
  return Math.max(0, probs.length - 1)
}

export function linePath(points: readonly Point2[], sx: (x: number) => number, sy: (y: number) => number): string {
  return points.map((p, i) => `${i === 0 ? 'M' : 'L'} ${sx(p.x).toFixed(2)} ${sy(p.y).toFixed(2)}`).join(' ')
}

export function chartPath(values: readonly number[], x0: number, y0: number, w: number, h: number, minValue?: number, maxValue?: number): string {
  if (values.length === 0) return ''
  const mn = minValue ?? Math.min(...values)
  const mx = maxValue ?? Math.max(...values)
  const span = Math.max(1e-9, mx - mn)
  return values
    .map((v, i) => {
      const x = x0 + (values.length === 1 ? 0 : (i / (values.length - 1)) * w)
      const y = y0 + h - ((v - mn) / span) * h
      return `${i === 0 ? 'M' : 'L'} ${x.toFixed(2)} ${y.toFixed(2)}`
    })
    .join(' ')
}

export function formatNum(v: number, digits = 3): string {
  if (!Number.isFinite(v)) return '∞'
  if (Math.abs(v) >= 1000 || (Math.abs(v) > 0 && Math.abs(v) < 0.001)) return v.toExponential(1)
  return v.toFixed(digits).replace(/\.0+$/, '').replace(/(\.\d*?)0+$/, '$1')
}
