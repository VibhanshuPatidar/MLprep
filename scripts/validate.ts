/* Content validator: runs every reference solution against its tests.
 *
 *   npx tsx scripts/validate.ts dsa [fileOrIdFilter...]
 *   npx tsx scripts/validate.ts ml [idFilter...]
 *   npx tsx scripts/validate.ts sql [idFilter...]
 *   npx tsx scripts/validate.ts docs
 *   npx tsx scripts/validate.ts all
 *
 * Set PYTHON=/path/to/python (needs numpy for `ml`).
 */
import { readdirSync } from 'node:fs'
import { join, dirname } from 'node:path'
import { fileURLToPath, pathToFileURL } from 'node:url'
import { createRequire } from 'node:module'
// @ts-expect-error - plain JS module
import { runCpp, runPython, ensurePch, PYTHON, CXX } from '../server/exec.mjs'
import { buildPythonHarness, buildPythonScriptHarness } from '../src/judge/python.ts'
import { buildCppHarness } from '../src/judge/cpp.ts'
import { evaluate } from '../src/judge/compare.ts'
import type { DsaProblem, MlCodingProblem, SqlProblem, DesignDoc, TheoryTopic } from '../src/types/content.ts'
import type { RunResult } from '../src/judge/types.ts'

const root = join(dirname(fileURLToPath(import.meta.url)), '..')
const [, , mode = 'all', ...filters] = process.argv
const CONCURRENCY = Number(process.env.CONCURRENCY || 8)
let failures = 0

async function pool<T>(items: T[], fn: (x: T) => Promise<void>) {
  let i = 0
  await Promise.all(
    Array.from({ length: Math.min(CONCURRENCY, items.length) }, async () => {
      while (i < items.length) await fn(items[i++])
    }),
  )
}

async function loadDir<T>(dir: string): Promise<{ file: string; items: T[] }[]> {
  const full = dir === 'dsa' && process.env.DSA_DIR ? join(root, process.env.DSA_DIR) : join(root, 'src/data', dir)
  const files = readdirSync(full).filter((f) => /\.ts$/.test(f) && f !== 'index.ts')
  const out: { file: string; items: T[] }[] = []
  for (const f of files) {
    const mod = await import(pathToFileURL(join(full, f)).href)
    const items = (mod.default ?? []) as T[]
    out.push({ file: f, items: Array.isArray(items) ? items : [items] })
  }
  return out
}

const matches = (file: string, id: string) => !filters.length || filters.some((f) => file.includes(f) || id === f)

function describe(r: RunResult): string {
  if (r.status === 'compile_error') return `compile error:\n${r.compileError}`
  const bad = r.results.filter((t) => t.status !== 'passed')
  return bad
    .slice(0, 3)
    .map(
      (t) =>
        `  test #${t.index} ${t.status}: args=${JSON.stringify(t.args).slice(0, 300)}${t.ops ? ` ops=${JSON.stringify(t.ops).slice(0, 200)}` : ''}\n    expected=${JSON.stringify(t.expected).slice(0, 300)}\n    got     =${JSON.stringify(t.output).slice(0, 300)}${t.error ? `\n    error: ${t.error.slice(0, 600)}` : ''}`,
    )
    .join('\n')
}

function fail(msg: string) {
  failures++
  console.log(`\x1b[31mFAIL\x1b[0m ${msg}`)
}

async function validateDsa() {
  const files = await loadDir<DsaProblem>('dsa')
  const seen = new Set<string>()
  const jobs: { file: string; p: DsaProblem }[] = []
  for (const { file, items } of files) {
    for (const p of items) {
      if (seen.has(p.id)) fail(`${file}: duplicate id ${p.id}`)
      seen.add(p.id)
      if (matches(file, p.id)) jobs.push({ file, p })
    }
  }
  console.log(`DSA: validating ${jobs.length} problems (python=${PYTHON}, cxx=${CXX})`)
  await ensurePch()
  let ok = 0
  await pool(jobs, async ({ file, p }) => {
    const problems: string[] = []
    if (!p.tests?.length || p.tests.length < 5) problems.push(`needs >= 5 tests (has ${p.tests?.length ?? 0})`)
    if (!p.solutions?.length) problems.push('no solutions')
    if (!p.hints?.length) problems.push('no hints')
    if (!p.examples?.length) problems.push('no examples')
    if ((p.sampleCount ?? 3) > p.tests.length) problems.push('sampleCount > tests')
    const mode = p.compare ?? 'exact'
    for (const [k, s] of (p.solutions ?? []).entries()) {
      try {
        const py = await runPython(buildPythonHarness(p.signature, p.tests, s.python), { timeoutMs: 20000 })
        const rp = evaluate(py, p.tests, mode)
        if (rp.status !== 'accepted') problems.push(`python solution #${k} (${s.title}) ${rp.status}\n${describe(rp)}${rp.stderr ? '\n  stderr: ' + rp.stderr.slice(0, 500) : ''}`)
      } catch (e) {
        problems.push(`python harness build failed: ${e}`)
      }
      try {
        const cc = await runCpp(buildCppHarness(p.signature, p.tests, s.cpp), { timeoutMs: 20000 })
        const rc = evaluate(cc, p.tests, mode)
        if (rc.status !== 'accepted') problems.push(`c++ solution #${k} (${s.title}) ${rc.status}\n${describe(rc)}`)
      } catch (e) {
        problems.push(`c++ harness build failed: ${e}`)
      }
    }
    if (problems.length) fail(`${file} :: ${p.id}\n${problems.join('\n')}`)
    else {
      ok++
      console.log(`\x1b[32mPASS\x1b[0m ${file} :: ${p.id} (${p.tests.length} tests, ${p.solutions.length} solutions)`)
    }
  })
  console.log(`DSA: ${ok}/${jobs.length} passed`)
}

async function validateMl() {
  const files = await loadDir<MlCodingProblem>('mlcoding')
  const jobs = files.flatMap(({ file, items }) => items.filter((p) => matches(file, p.id)).map((p) => ({ file, p })))
  console.log(`ML coding: validating ${jobs.length} problems (python=${PYTHON})`)
  let ok = 0
  await pool(jobs, async ({ file, p }) => {
    const problems: string[] = []
    if (p.tests.length < 3) problems.push('needs >= 3 tests')
    const r = await runPython(buildPythonScriptHarness(p.tests, p.solution, p.setup), { timeoutMs: 60000 })
    const res = evaluate(r, p.tests.map((t) => ({ args: [t.name], expected: null })), 'exact', { scriptMode: true })
    if (res.status !== 'accepted') problems.push(`solution ${res.status}\n${res.compileError ?? res.results.filter((x) => x.status !== 'passed').map((x) => `  ${p.tests[x.index].name}: ${x.error}`).join('\n')}${res.stderr ? '\n' + res.stderr.slice(0, 800) : ''}`)
    const s = await runPython(buildPythonScriptHarness(p.tests, p.starter, p.setup), { timeoutMs: 60000 })
    const sres = evaluate(s, p.tests.map((t) => ({ args: [t.name], expected: null })), 'exact', { scriptMode: true })
    if (sres.status === 'compile_error') problems.push(`starter does not load: ${sres.compileError}`)
    if (sres.status === 'accepted') problems.push('starter code passes all tests (tests too weak or starter is a solution)')
    if (problems.length) fail(`${file} :: ${p.id}\n${problems.join('\n')}`)
    else {
      ok++
      console.log(`\x1b[32mPASS\x1b[0m ${file} :: ${p.id}`)
    }
  })
  console.log(`ML coding: ${ok}/${jobs.length} passed`)
}

async function validateSql() {
  const require = createRequire(import.meta.url)
  const initSqlJs = require('sql.js')
  const SQL = await initSqlJs({ locateFile: (f: string) => join(root, 'node_modules/sql.js/dist', f) })
  const files = await loadDir<SqlProblem>('sql')
  let ok = 0
  let total = 0
  const ids = new Set<string>()
  for (const { file, items } of files) {
    for (const p of items) {
      if (!matches(file, p.id)) continue
      total++
      const problems: string[] = []
      if (ids.has(p.id)) problems.push('duplicate id')
      ids.add(p.id)
      if (p.datasets.length < 2) problems.push('needs >= 2 datasets')
      const summary: string[] = []
      p.datasets.forEach((ds, k) => {
        const db = new SQL.Database()
        try {
          db.run(p.schema)
          db.run(ds)
          const res = db.exec(p.solution)
          const last = res[res.length - 1]
          const rows = last ? last.values.length : 0
          summary.push(`ds${k}: ${rows} rows${last ? ` cols=[${last.columns.join(',')}] first=${JSON.stringify(last.values[0] ?? null)}` : ''}`)
          if (k === 0 && rows === 0) problems.push('solution returns no rows on example dataset')
        } catch (e) {
          problems.push(`dataset ${k}: ${e}`)
        } finally {
          db.close()
        }
      })
      if (problems.length) fail(`${file} :: ${p.id}\n  ${problems.join('\n  ')}`)
      else {
        ok++
        console.log(`\x1b[32mPASS\x1b[0m ${file} :: ${p.id}  ${summary.join(' | ')}`)
      }
    }
  }
  console.log(`SQL: ${ok}/${total} passed`)
}

async function validateDocs() {
  for (const dir of ['systemDesign', 'mlDesign']) {
    const files = await loadDir<DesignDoc>(dir)
    let n = 0
    for (const { file, items } of files) {
      for (const d of items) {
        n++
        const errs: string[] = []
        if (!d.sections?.length) errs.push('no sections')
        for (const g of d.diagrams ?? []) {
          const ids = new Set(g.nodes.map((x) => x.id))
          for (const e of g.edges) if (!ids.has(e.from) || !ids.has(e.to)) errs.push(`diagram "${g.title}" edge ${e.from}->${e.to} references unknown node`)
          const pos = new Set<string>()
          for (const x of g.nodes) {
            const k = `${x.col},${x.row}`
            if (pos.has(k)) errs.push(`diagram "${g.title}" overlapping nodes at ${k}`)
            pos.add(k)
          }
        }
        if (errs.length) fail(`${dir}/${file} :: ${d.id}\n  ${errs.join('\n  ')}`)
      }
    }
    console.log(`${dir}: checked ${n} docs`)
  }
  const files = await loadDir<TheoryTopic>('theory')
  let n = 0
  for (const { file, items } of files) {
    for (const t of items) {
      n++
      const errs: string[] = []
      t.quiz?.forEach((q, i) => {
        if (q.answer < 0 || q.answer >= q.options.length) errs.push(`quiz #${i} answer index out of range`)
      })
      if (!t.flashcards?.length) errs.push('no flashcards')
      if (errs.length) fail(`theory/${file} :: ${t.id}\n  ${errs.join('\n  ')}`)
    }
  }
  console.log(`theory: checked ${n} topics`)
}

const run = async () => {
  if (mode === 'dsa' || mode === 'all') await validateDsa()
  if (mode === 'ml' || mode === 'all') await validateMl()
  if (mode === 'sql' || mode === 'all') await validateSql()
  if (mode === 'docs' || mode === 'all') await validateDocs()
  console.log(failures ? `\x1b[31m${failures} failure(s)\x1b[0m` : '\x1b[32mAll good\x1b[0m')
  process.exit(failures ? 1 : 0)
}
run()
