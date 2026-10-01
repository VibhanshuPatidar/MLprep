import type { CompareMode, RawRecord, RunResult, TestCase, TestResult } from './types'
import { RESULT_MARKER } from './types'

const TOL = 1e-5

export function deepEqual(a: unknown, b: unknown): boolean {
  if (typeof a === 'number' && typeof b === 'number') {
    if (Number.isInteger(a) && Number.isInteger(b)) return a === b
    return Math.abs(a - b) <= TOL * Math.max(1, Math.abs(b))
  }
  if (a === null || a === undefined || b === null || b === undefined) return (a ?? null) === (b ?? null)
  if (Array.isArray(a) && Array.isArray(b)) {
    if (a.length !== b.length) return false
    for (let i = 0; i < a.length; i++) if (!deepEqual(a[i], b[i])) return false
    return true
  }
  if (typeof a === 'object' && typeof b === 'object') {
    const ka = Object.keys(a as object)
    const kb = Object.keys(b as object)
    if (ka.length !== kb.length) return false
    return ka.every((k) => deepEqual((a as Record<string, unknown>)[k], (b as Record<string, unknown>)[k]))
  }
  return a === b
}

const key = (v: unknown) => JSON.stringify(v)
const sortArr = (arr: unknown[]) => [...arr].sort((x, y) => (key(x) < key(y) ? -1 : key(x) > key(y) ? 1 : 0))

function canonical(v: unknown, mode: CompareMode): unknown {
  if (!Array.isArray(v)) return v
  if (mode === 'unordered') return sortArr(v)
  if (mode === 'unorderedDeep') return sortArr(v.map((x) => (Array.isArray(x) ? sortArr(x) : x)))
  return v
}

function topoValid(args: unknown[], out: unknown, expected: unknown): boolean {
  const n = args[0] as number
  const edges = args[1] as number[][]
  if (!Array.isArray(out)) return false
  const expectEmpty = Array.isArray(expected) && expected.length === 0
  if (expectEmpty) return out.length === 0
  if (out.length !== n) return false
  const pos = new Map<number, number>()
  out.forEach((x, i) => pos.set(x as number, i))
  if (pos.size !== n) return false
  for (let i = 0; i < n; i++) if (!pos.has(i)) return false
  return edges.every(([a, b]) => (pos.get(b) as number) < (pos.get(a) as number))
}

function alienValid(args: unknown[], out: unknown, expected: unknown): boolean {
  const words = args[0] as string[]
  if (typeof out !== 'string') return false
  if (expected === '') return out === ''
  const letters = new Set(words.join(''))
  if (out.length !== letters.size || new Set(out).size !== out.length) return false
  for (const c of out) if (!letters.has(c)) return false
  const rank = new Map([...out].map((c, i) => [c, i]))
  for (let i = 0; i + 1 < words.length; i++) {
    const [w1, w2] = [words[i], words[i + 1]]
    let j = 0
    while (j < Math.min(w1.length, w2.length) && w1[j] === w2[j]) j++
    if (j < Math.min(w1.length, w2.length)) {
      if ((rank.get(w1[j]) as number) > (rank.get(w2[j]) as number)) return false
    } else if (w1.length > w2.length) return false
  }
  return true
}

export function judgeOutput(mode: CompareMode, tc: TestCase, out: unknown): boolean {
  switch (mode) {
    case 'anyOf':
      return Array.isArray(tc.expected) && tc.expected.some((e) => deepEqual(out, e))
    case 'topoOrder':
      return topoValid(tc.args, out, tc.expected)
    case 'alienOrder':
      return alienValid(tc.args, out, tc.expected)
    default:
      return deepEqual(canonical(out, mode), canonical(tc.expected, mode))
  }
}

export interface ProcessOutput {
  stdout: string
  stderr?: string
  exitCode?: number | null
  signal?: string | null
  timedOut?: boolean
  compileError?: string
}

/** Parse marker lines from a harness run and build a RunResult. */
export function evaluate(proc: ProcessOutput, tests: TestCase[], mode: CompareMode, opts: { scriptMode?: boolean } = {}): RunResult {
  if (proc.compileError) return { status: 'compile_error', compileError: proc.compileError, results: [] }
  const records = new Map<number, RawRecord>()
  const extra: string[] = []
  for (const line of proc.stdout.split('\n')) {
    const k = line.indexOf(RESULT_MARKER)
    if (k >= 0) {
      if (k > 0) extra.push(line.slice(0, k))
      try {
        const rec = JSON.parse(line.slice(k + RESULT_MARKER.length)) as RawRecord
        records.set(rec.i, rec)
      } catch {
        extra.push(line)
      }
    } else if (line.length) extra.push(line)
  }
  const pre = records.get(-1)
  if (pre) return { status: 'compile_error', compileError: pre.err, results: [] }

  let crashed = false
  const results: TestResult[] = tests.map((tc, i) => {
    const rec = records.get(i)
    const base = { index: i, args: tc.args, ops: tc.ops, expected: tc.expected }
    if (!rec) {
      if (crashed) return { ...base, status: 'skipped' }
      crashed = true
      return {
        ...base,
        status: proc.timedOut ? 'timeout' : 'error',
        error: proc.timedOut
          ? 'Time Limit Exceeded'
          : `Runtime Error${proc.signal ? ` (${proc.signal})` : proc.exitCode ? ` (exit code ${proc.exitCode})` : ''}${proc.stderr ? '\n' + proc.stderr.slice(-3000) : ''}`,
      }
    }
    if (!rec.ok) return { ...base, status: 'error', error: rec.err, stdout: rec.stdout, ms: rec.ms }
    const passed = opts.scriptMode ? true : judgeOutput(mode, tc, rec.out)
    return { ...base, status: passed ? 'passed' : 'failed', output: rec.out, stdout: rec.stdout, ms: rec.ms }
  })

  const totalMs = results.reduce((s, r) => s + (r.ms ?? 0), 0)
  let status: RunResult['status'] = 'accepted'
  if (results.some((r) => r.status === 'timeout')) status = 'timeout'
  else if (results.some((r) => r.status === 'error')) status = 'runtime_error'
  else if (results.some((r) => r.status === 'failed')) status = 'wrong'
  return { status, results, totalMs, stderr: [proc.stderr, extra.join('\n')].filter(Boolean).join('\n') || undefined }
}
