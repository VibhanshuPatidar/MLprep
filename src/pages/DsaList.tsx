import { Code2, List, Map as MapIcon } from 'lucide-react'
import { useMemo, useState } from 'react'
import { Page } from '../components/Layout'
import ProblemList, { type ListItem } from '../components/ProblemList'
import { Card, PageHeader, ProgressRing, Segmented, cn } from '../components/ui'
import { DSA_CATEGORIES, dsaProblems } from '../data'
import { keyOf, useStore } from '../store/progress'
import type { DsaCategory } from '../types/content'

const LAYOUT: Record<DsaCategory, [number, number]> = {
  'Arrays & Hashing': [50, 0],
  'Two Pointers': [32, 1],
  Stack: [68, 1],
  'Binary Search': [14, 2],
  'Sliding Window': [36, 2],
  'Linked List': [58, 2],
  Trees: [36, 3],
  Tries: [12, 4],
  'Heap / Priority Queue': [36, 4],
  Backtracking: [66, 4],
  Intervals: [8, 5],
  Greedy: [26, 5],
  Graphs: [56, 5],
  '1-D Dynamic Programming': [84, 5],
  'Advanced Graphs': [36, 6],
  '2-D Dynamic Programming': [64, 6],
  'Bit Manipulation': [88, 6],
  'Math & Geometry': [76, 7],
}
const ROW_H = 84
const ROWS = 8

const slug = (s: string) => s.toLowerCase().replace(/[^a-z0-9]+/g, '-')

export function Roadmap() {
  const progress = useStore((s) => s.progress)
  const stats = useMemo(() => {
    const m = new Map<DsaCategory, { solved: number; total: number }>()
    for (const p of dsaProblems) {
      const c = m.get(p.category) ?? { solved: 0, total: 0 }
      c.total++
      if (progress[keyOf('dsa', p.id)]?.status === 'solved') c.solved++
      m.set(p.category, c)
    }
    return m
  }, [progress])

  const height = ROWS * ROW_H
  return (
    <Card className="grid-bg relative mb-6 overflow-x-auto p-4">
      <div className="relative mx-auto min-w-[860px]" style={{ height }}>
        <svg className="pointer-events-none absolute inset-0 h-full w-full" viewBox={`0 0 100 ${height}`} preserveAspectRatio="none">
          {DSA_CATEGORIES.flatMap((c) =>
            c.deps.map((d) => {
              const [x1, r1] = LAYOUT[d]
              const [x2, r2] = LAYOUT[c.name]
              const y1 = r1 * ROW_H + 52
              const y2 = r2 * ROW_H + 8
              const done = (stats.get(d)?.solved ?? 0) === (stats.get(d)?.total ?? 1)
              return (
                <path
                  key={`${d}-${c.name}`}
                  d={`M ${x1} ${y1} C ${x1} ${(y1 + y2) / 2}, ${x2} ${(y1 + y2) / 2}, ${x2} ${y2}`}
                  fill="none"
                  stroke={done ? 'var(--ok)' : 'var(--line-strong)'}
                  strokeWidth={1.5}
                  vectorEffect="non-scaling-stroke"
                />
              )
            }),
          )}
        </svg>
        {DSA_CATEGORIES.map((c) => {
          const [x, r] = LAYOUT[c.name]
          const s = stats.get(c.name) ?? { solved: 0, total: 0 }
          const pct = s.total ? s.solved / s.total : 0
          return (
            <button
              key={c.name}
              onClick={() => document.getElementById(`group-${slug(c.name)}`)?.scrollIntoView({ behavior: 'smooth', block: 'start' })}
              title={c.blurb}
              className={cn(
                'absolute flex w-[150px] -translate-x-1/2 flex-col gap-1.5 rounded-xl border bg-panel px-3 py-2 text-left shadow-sm transition hover:-translate-y-0.5 hover:border-accent hover:shadow-md',
                pct === 1 ? 'border-ok/60' : 'border-line',
              )}
              style={{ left: `${x}%`, top: r * ROW_H + 8 }}
            >
              <span className="truncate text-[12.5px] font-semibold">{c.name}</span>
              <span className="flex items-center gap-2">
                <span className="h-1 flex-1 overflow-hidden rounded-full bg-line">
                  <span className="block h-full rounded-full transition-all" style={{ width: `${pct * 100}%`, background: pct === 1 ? 'var(--ok)' : 'var(--accent)' }} />
                </span>
                <span className="font-mono text-[10px] text-muted">
                  {s.solved}/{s.total}
                </span>
              </span>
            </button>
          )
        })}
      </div>
    </Card>
  )
}

export default function DsaList() {
  const progress = useStore((s) => s.progress)
  const [view, setView] = useState<'roadmap' | 'list'>('roadmap')
  const items: ListItem[] = useMemo(
    () =>
      dsaProblems.map((p) => ({
        id: p.id,
        key: keyOf('dsa', p.id),
        to: `/dsa/${p.id}`,
        title: p.title,
        number: p.number,
        difficulty: p.difficulty,
        group: p.category,
        tags: [p.pattern],
      })),
    [],
  )
  const solved = dsaProblems.filter((p) => progress[keyOf('dsa', p.id)]?.status === 'solved')
  const by = (d: string) => [solved.filter((p) => p.difficulty === d).length, dsaProblems.filter((p) => p.difficulty === d).length]
  const [e, m, h] = [by('Easy'), by('Medium'), by('Hard')]

  return (
    <Page wide>
      <PageHeader
        icon={<Code2 size={20} />}
        title="DSA · NeetCode 150"
        subtitle="The NeetCode 150 problem set, organised as a dependency roadmap. Solve each problem in-browser in Python or C++, check against hidden tests, then study the solutions and pattern visualizers."
        actions={
          <Segmented
            options={[
              { value: 'roadmap', label: <span className="inline-flex items-center gap-1.5"><MapIcon size={13} /> Roadmap</span> },
              { value: 'list', label: <span className="inline-flex items-center gap-1.5"><List size={13} /> List only</span> },
            ]}
            value={view}
            onChange={setView}
          />
        }
      />
      <div className="mb-6 grid grid-cols-2 gap-3 md:grid-cols-4">
        <Card className="flex items-center gap-4 p-4">
          <ProgressRing value={solved.length / dsaProblems.length} size={58}>
            {Math.round((solved.length / dsaProblems.length) * 100)}%
          </ProgressRing>
          <div>
            <div className="text-xs text-muted">Solved</div>
            <div className="text-xl font-semibold">
              {solved.length}
              <span className="text-sm text-faint">/{dsaProblems.length}</span>
            </div>
          </div>
        </Card>
        {(
          [
            ['Easy', e, 'var(--easy)'],
            ['Medium', m, 'var(--medium)'],
            ['Hard', h, 'var(--hard)'],
          ] as const
        ).map(([label, [a, b], color]) => (
          <Card key={label} className="flex items-center gap-4 p-4">
            <ProgressRing value={b ? a / b : 0} size={58} color={color}>
              {a}
            </ProgressRing>
            <div>
              <div className="text-xs" style={{ color }}>
                {label}
              </div>
              <div className="text-xl font-semibold">
                {a}
                <span className="text-sm text-faint">/{b}</span>
              </div>
            </div>
          </Card>
        ))}
      </div>
      {view === 'roadmap' && <Roadmap />}
      <ProblemList items={items} groupOrder={DSA_CATEGORIES.map((c) => c.name)} groupBlurb={(g) => DSA_CATEGORIES.find((c) => c.name === g)?.blurb} />
    </Page>
  )
}
