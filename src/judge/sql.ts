import initSqlJs from 'sql.js'
import type { Database, SqlJsStatic } from 'sql.js'
import wasmUrl from 'sql.js/dist/sql-wasm.wasm?url'
import type { SqlProblem } from '../types/content'

let sqlPromise: Promise<SqlJsStatic> | null = null
export function getSql() {
  if (!sqlPromise) sqlPromise = initSqlJs({ locateFile: () => wasmUrl })
  return sqlPromise
}

export type Cell = string | number | null | Uint8Array
export interface Table {
  columns: string[]
  values: Cell[][]
}

export interface SqlCaseResult {
  dataset: number
  passed: boolean
  expected?: Table
  output?: Table
  error?: string
  reason?: string
  ms?: number
}

export interface SqlRunResult {
  status: 'accepted' | 'wrong' | 'error'
  cases: SqlCaseResult[]
}

function makeDb(SQL: SqlJsStatic, p: SqlProblem, dataset: number): Database {
  const db = new SQL.Database()
  db.run(p.schema)
  db.run(p.datasets[dataset])
  return db
}

function lastResult(db: Database, sql: string): Table {
  const res = db.exec(sql)
  const last = res[res.length - 1]
  return last ? { columns: last.columns, values: last.values as Cell[][] } : { columns: [], values: [] }
}

const norm = (c: Cell): string | number | null => {
  if (c === null || c === undefined) return null
  if (typeof c === 'number') return Math.round(c * 1e4) / 1e4
  if (c instanceof Uint8Array) return `blob(${c.length})`
  const n = Number(c)
  return c.trim() !== '' && Number.isFinite(n) && /^-?\d+(\.\d+)?$/.test(c.trim()) ? Math.round(n * 1e4) / 1e4 : c
}

function compareTables(exp: Table, out: Table, orderMatters: boolean): string | null {
  if (exp.columns.length !== out.columns.length) return `Expected ${exp.columns.length} column(s) (${exp.columns.join(', ')}) but got ${out.columns.length} (${out.columns.join(', ')})`
  if (exp.values.length !== out.values.length) return `Expected ${exp.values.length} row(s) but got ${out.values.length}`
  const key = (r: Cell[]) => JSON.stringify(r.map(norm))
  const a = exp.values.map(key)
  const b = out.values.map(key)
  if (!orderMatters) {
    a.sort()
    b.sort()
  }
  for (let i = 0; i < a.length; i++) if (a[i] !== b[i]) return orderMatters ? `Row ${i + 1} differs (row order matters for this problem)` : 'Row values differ'
  return null
}

export async function runSql(p: SqlProblem, userSql: string, mode: 'run' | 'submit'): Promise<SqlRunResult> {
  const SQL = await getSql()
  const idxs = mode === 'run' ? [0] : p.datasets.map((_, i) => i)
  const cases: SqlCaseResult[] = []
  for (const i of idxs) {
    const db1 = makeDb(SQL, p, i)
    const expected = lastResult(db1, p.solution)
    db1.close()
    const db2 = makeDb(SQL, p, i)
    const t0 = performance.now()
    try {
      const output = lastResult(db2, userSql)
      const reason = compareTables(expected, output, p.orderMatters)
      cases.push({ dataset: i, passed: !reason, expected, output, reason: reason ?? undefined, ms: performance.now() - t0 })
    } catch (e) {
      cases.push({ dataset: i, passed: false, expected, error: String((e as Error).message ?? e) })
    } finally {
      db2.close()
    }
  }
  const status = cases.some((c) => c.error) ? 'error' : cases.every((c) => c.passed) ? 'accepted' : 'wrong'
  return { status, cases }
}

/** Execute arbitrary SQL against dataset 0 (scratchpad). */
export async function querySql(p: SqlProblem, sql: string): Promise<{ table?: Table; error?: string }> {
  const SQL = await getSql()
  const db = makeDb(SQL, p, 0)
  try {
    return { table: lastResult(db, sql) }
  } catch (e) {
    return { error: String((e as Error).message ?? e) }
  } finally {
    db.close()
  }
}

export interface SchemaInfo {
  name: string
  columns: { name: string; type: string; pk: boolean }[]
  sample: Table
}

export async function describeSchema(p: SqlProblem, dataset = 0): Promise<SchemaInfo[]> {
  const SQL = await getSql()
  const db = makeDb(SQL, p, dataset)
  try {
    const tables = lastResult(db, "SELECT name FROM sqlite_master WHERE type='table' AND name NOT LIKE 'sqlite_%' ORDER BY rowid").values.map((r) => String(r[0]))
    return tables.map((t) => {
      const info = lastResult(db, `PRAGMA table_info("${t}")`)
      return {
        name: t,
        columns: info.values.map((r) => ({ name: String(r[1]), type: String(r[2] || ''), pk: Number(r[5]) > 0 })),
        sample: lastResult(db, `SELECT * FROM "${t}" LIMIT 50`),
      }
    })
  } finally {
    db.close()
  }
}

export async function expectedOutput(p: SqlProblem, dataset = 0): Promise<Table> {
  const SQL = await getSql()
  const db = makeDb(SQL, p, dataset)
  try {
    return lastResult(db, p.solution)
  } finally {
    db.close()
  }
}
