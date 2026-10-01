import type { DsaProblem, MlCodingProblem } from '../types/content'
import { buildCppHarness } from './cpp'
import { evaluate } from './compare'
import { buildPythonHarness, buildPythonScriptHarness } from './python'
import { execute } from './runtime'
import type { Language, RunResult, TestCase } from './types'

export const PY_TIMEOUT = 12000
export const CPP_TIMEOUT = 6000

export interface RunOptions {
  onStatus?: (s: string) => void
}

function harness(p: DsaProblem, lang: Language, tests: TestCase[], code: string) {
  return lang === 'python' ? buildPythonHarness(p.signature, tests, code) : buildCppHarness(p.signature, tests, code)
}

async function exec(p: DsaProblem, lang: Language, tests: TestCase[], code: string, opts: RunOptions): Promise<RunResult> {
  let source: string
  try {
    source = harness(p, lang, tests, code)
  } catch (e) {
    return { status: 'internal_error', results: [], message: `Invalid test input: ${String((e as Error).message ?? e)}` }
  }
  const out = await execute(lang, source, { timeoutMs: lang === 'python' ? PY_TIMEOUT : CPP_TIMEOUT, userCode: lang === 'python' ? code : undefined, onStatus: opts.onStatus })
  return evaluate(out, tests, p.compare ?? 'exact')
}

/** Run user code. `custom` tests (args only) get expected values from the reference solution. */
export async function runDsa(p: DsaProblem, lang: Language, code: string, mode: 'run' | 'submit', custom?: TestCase[], opts: RunOptions = {}): Promise<RunResult> {
  let tests: TestCase[]
  if (mode === 'submit') tests = p.tests
  else if (custom?.length) {
    const ref = p.solutions[p.solutions.length - 1]
    opts.onStatus?.('computing expected output…')
    const refRun = await exec(p, lang, custom.map((t) => ({ ...t, expected: null })), lang === 'python' ? ref.python : ref.cpp, opts)
    if (refRun.status === 'compile_error' || refRun.status === 'internal_error') return refRun
    tests = custom.map((t, i) => {
      const r = refRun.results[i]
      const out = r?.status === 'failed' || r?.status === 'passed' ? r.output : undefined
      const expected = p.compare === 'anyOf' ? [out] : out
      return { ...t, expected }
    })
  } else tests = p.tests.slice(0, p.sampleCount ?? 3)
  return exec(p, lang, tests, code, opts)
}

export async function runMl(p: MlCodingProblem, code: string, mode: 'run' | 'submit', opts: RunOptions = {}): Promise<RunResult> {
  const tests = mode === 'submit' ? p.tests : p.tests.filter((t) => !t.hidden)
  const source = buildPythonScriptHarness(tests, code, p.setup)
  const out = await execute('python', source, { timeoutMs: 30000, packages: ['numpy'], onStatus: opts.onStatus })
  const res = evaluate(
    out,
    tests.map((t) => ({ args: [t.name], expected: 'passed' })),
    'exact',
    { scriptMode: true },
  )
  return res
}
