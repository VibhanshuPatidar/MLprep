import { CheckCircle2, Loader2, Play, XCircle } from 'lucide-react'
import { useEffect, useRef, useState } from 'react'
import { Page } from '../components/Layout'
import { Button, Card, PageHeader } from '../components/ui'
import { dsaById, dsaProblems, mlProblems, sqlProblems } from '../data'
import { runDsa, runMl } from '../judge/run'
import { runSql } from '../judge/sql'
import type { Language } from '../judge/types'

interface Check {
  name: string
  expect: string
  run: () => Promise<string>
}

function dsaCheck(id: string, lang: Language, sol: 'ref' | 'starter-wrong', expect: string): Check {
  return {
    name: `DSA ${id} · ${lang} · ${sol}`,
    expect,
    run: async () => {
      const p = dsaById.get(id) ?? dsaProblems[0]
      const s = p.solutions[p.solutions.length - 1]
      const code = sol === 'ref' ? (lang === 'python' ? s.python : s.cpp) : lang === 'python' ? 'class Solution:\n    pass\n' : 'class Solution {};\n'
      const r = await runDsa(p, lang, code, 'submit')
      return r.status
    },
  }
}

const CHECKS: Check[] = [
  dsaCheck('two-sum', 'python', 'ref', 'accepted'),
  dsaCheck('two-sum', 'cpp', 'ref', 'accepted'),
  dsaCheck('lru-cache', 'python', 'ref', 'accepted'),
  dsaCheck('lru-cache', 'cpp', 'ref', 'accepted'),
  dsaCheck('serialize-and-deserialize-binary-tree', 'python', 'ref', 'accepted'),
  dsaCheck('merge-k-sorted-lists', 'cpp', 'ref', 'accepted'),
  dsaCheck('two-sum', 'python', 'starter-wrong', 'runtime_error'),
  dsaCheck('two-sum', 'cpp', 'starter-wrong', 'compile_error'),
  {
    name: 'DSA two-sum · python · custom test case',
    expect: 'accepted',
    run: async () => {
      const p = dsaById.get('two-sum')!
      const s = p.solutions[p.solutions.length - 1]
      const r = await runDsa(p, 'python', s.python, 'run', [{ args: [[5, 1, 4], 9], expected: null }])
      return r.status
    },
  },
  {
    name: `SQL ${sqlProblems[0]?.id} · reference`,
    expect: 'accepted',
    run: async () => (await runSql(sqlProblems[0], sqlProblems[0].solution, 'submit')).status,
  },
  {
    name: `SQL ${sqlProblems[0]?.id} · wrong query`,
    expect: 'wrong',
    run: async () => (await runSql(sqlProblems[0], 'SELECT 1 AS x', 'submit')).status,
  },
  {
    name: `ML ${mlProblems[0]?.id} · reference (numpy)`,
    expect: 'accepted',
    run: async () => (await runMl(mlProblems[0], mlProblems[0].solution, 'submit')).status,
  },
  {
    name: `ML ${mlProblems[0]?.id} · starter`,
    expect: 'runtime_error',
    run: async () => (await runMl(mlProblems[0], mlProblems[0].starter, 'submit')).status,
  },
]

/** Diagnostics: exercises every runtime end-to-end inside the browser. */
export default function SelfTest() {
  const [results, setResults] = useState<Record<number, { got: string; ms: number } | 'running'>>({})
  const [done, setDone] = useState(false)
  const started = useRef(false)

  const runAll = async () => {
    setDone(false)
    setResults({})
    for (let i = 0; i < CHECKS.length; i++) {
      setResults((r) => ({ ...r, [i]: 'running' }))
      const t0 = performance.now()
      let got: string
      try {
        got = await CHECKS[i].run()
      } catch (e) {
        got = `exception: ${String(e)}`
      }
      const ms = performance.now() - t0
      setResults((r) => ({ ...r, [i]: { got, ms } }))
      fetch('/api/client-log', { method: 'POST', body: `${got === CHECKS[i].expect ? 'PASS' : 'FAIL'} ${CHECKS[i].name}: got ${got} (expect ${CHECKS[i].expect}) ${Math.round(ms)}ms` }).catch(() => {})
    }
    setDone(true)
    fetch('/api/client-log', { method: 'POST', body: 'SELFTEST DONE' }).catch(() => {})
  }

  useEffect(() => {
    if (!started.current && new URLSearchParams(location.search).has('auto')) {
      started.current = true
      runAll()
    }
  }, [])

  const passed = Object.entries(results).filter(([i, r]) => r !== 'running' && r.got === CHECKS[Number(i)].expect).length

  return (
    <Page className="max-w-3xl">
      <PageHeader
        title="Runtime diagnostics"
        subtitle="Runs reference and intentionally-wrong solutions through the Python (Pyodide), C++ (local runner), SQL (sql.js) and NumPy pipelines to confirm the judge works on this machine."
        actions={
          <Button variant="primary" onClick={runAll}>
            <Play size={14} /> Run checks
          </Button>
        }
      />
      <Card className="overflow-hidden">
        {CHECKS.map((c, i) => {
          const r = results[i]
          const ok = r && r !== 'running' && r.got === c.expect
          return (
            <div key={i} className="flex items-center gap-3 border-t border-line px-4 py-2.5 text-sm first:border-t-0">
              {r === 'running' ? <Loader2 size={15} className="animate-spin text-muted" /> : !r ? <span className="h-[15px] w-[15px] rounded-full border border-line" /> : ok ? <CheckCircle2 size={15} className="text-ok" /> : <XCircle size={15} className="text-err" />}
              <span className="flex-1">{c.name}</span>
              <span className="font-mono text-xs text-muted">expect {c.expect}</span>
              <span className="w-40 text-right font-mono text-xs" data-check={i}>
                {r && r !== 'running' ? `${r.got} · ${Math.round(r.ms)}ms` : ''}
              </span>
            </div>
          )
        })}
      </Card>
      {done && (
        <div className="mt-4 text-sm" id="selftest-summary">
          SELFTEST DONE: {passed}/{CHECKS.length} passed
        </div>
      )}
    </Page>
  )
}
