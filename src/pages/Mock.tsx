import { Brain, Code2, Database, ExternalLink, FlaskConical, Network, Play, Square, Timer, Trash2, Workflow } from 'lucide-react'
import type { LucideIcon } from 'lucide-react'
import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { Page } from '../components/Layout'
import Markdown from '../components/Markdown'
import { Badge, Button, Card, DifficultyBadge, PageHeader, cn } from '../components/ui'
import { dsaProblems, mlProblems, mlsdDocs, sdDocs, sqlProblems, theoryTopics } from '../data'
import { useMockSession, type MockItem, type MockKind, type MockSession } from '../store/mock'
import { keyOf, useStore } from '../store/progress'
import type { Difficulty } from '../types/content'

interface KindDef {
  id: MockKind
  title: string
  icon: LucideIcon
  minutes: number
  blurb: string
  rubric: string[]
}

const KINDS: KindDef[] = [
  {
    id: 'coding',
    title: 'Coding round',
    icon: Code2,
    minutes: 45,
    blurb: 'Two NeetCode problems (warm-up + medium/hard), Python or C++. Talk through your approach before coding.',
    rubric: ['Clarified requirements & edge cases', 'Found an optimal approach', 'Clean, bug-free code', 'Tested with examples / edge cases', 'Stated time & space complexity', 'Communicated clearly throughout'],
  },
  {
    id: 'ml-coding',
    title: 'ML coding round',
    icon: FlaskConical,
    minutes: 35,
    blurb: 'Implement an ML component from scratch in NumPy (e.g. k-means, attention, Adam).',
    rubric: ['Correct math / derivation', 'Vectorized implementation', 'Numerical stability considered', 'Shapes & edge cases handled', 'Explained trade-offs'],
  },
  {
    id: 'sql',
    title: 'SQL round',
    icon: Database,
    minutes: 30,
    blurb: 'Two analytics SQL questions — joins, aggregation and window functions.',
    rubric: ['Understood the schema & grain', 'Correct joins / filters', 'Handled NULLs, ties & duplicates', 'Readable query (CTEs)', 'Explained the approach'],
  },
  {
    id: 'system-design',
    title: 'System design',
    icon: Network,
    minutes: 45,
    blurb: 'A classic design prompt. Drive the conversation: requirements → estimates → API → data → high-level → deep dives.',
    rubric: ['Clarified functional & non-functional requirements', 'Back-of-the-envelope estimates', 'Clear API & data model', 'Sound high-level architecture', 'Deep dive on 1–2 hard parts', 'Discussed bottlenecks & trade-offs'],
  },
  {
    id: 'ml-design',
    title: 'ML system design',
    icon: Workflow,
    minutes: 45,
    blurb: 'An ML design case: frame the problem, metrics, data, features, model, serving and monitoring.',
    rubric: ['Framed business goal as an ML task', 'Offline + online metrics', 'Data, labels & sampling', 'Features & model choice (baseline → advanced)', 'Serving & latency budget', 'Monitoring, drift & iteration'],
  },
  {
    id: 'theory',
    title: 'ML theory rapid-fire',
    icon: Brain,
    minutes: 15,
    blurb: '12 random conceptual questions across all topics. Answer out loud, then reveal and self-grade.',
    rubric: ['Accurate definitions', 'Intuition, not just formulas', 'Concise answers', 'Connected to practical trade-offs'],
  },
]

const pick = <T,>(arr: T[], n: number) => [...arr].sort(() => Math.random() - 0.5).slice(0, n)

function buildSession(kind: MockKind, progress: Record<string, { status: string }>): MockSession {
  const def = KINDS.find((k) => k.id === kind)!
  const unsolved = <T extends { id: string }>(arr: T[], section: string) => {
    const u = arr.filter((p) => progress[keyOf(section as 'dsa', p.id)]?.status !== 'solved')
    return u.length ? u : arr
  }
  let items: MockItem[] = []
  let cards: string[] | undefined
  if (kind === 'coding') {
    const pool = unsolved(dsaProblems, 'dsa')
    const warm = pick(pool.filter((p) => p.difficulty !== 'Hard'), 1)
    const main = pick(pool.filter((p) => p.difficulty !== 'Easy' && !warm.includes(p)), 1)
    items = [...warm, ...main].map((p) => ({ key: keyOf('dsa', p.id), title: `${p.number}. ${p.title}`, to: `/dsa/${p.id}`, sub: p.difficulty }))
  } else if (kind === 'ml-coding') {
    items = pick(unsolved(mlProblems, 'ml'), 1).map((p) => ({ key: keyOf('ml', p.id), title: p.title, to: `/ml-coding/${p.id}`, sub: p.difficulty }))
  } else if (kind === 'sql') {
    items = pick(unsolved(sqlProblems, 'sql'), 2).map((p) => ({ key: keyOf('sql', p.id), title: p.title, to: `/sql/${p.id}`, sub: p.difficulty }))
  } else if (kind === 'system-design') {
    items = pick(sdDocs.filter((d) => d.category !== 'Fundamentals'), 1).map((d) => ({ key: keyOf('sd', d.id), title: d.title, to: `/system-design/${d.id}`, sub: d.summary }))
  } else if (kind === 'ml-design') {
    items = pick(mlsdDocs.filter((d) => d.category !== 'Foundations'), 1).map((d) => ({ key: keyOf('mlsd', d.id), title: d.title, to: `/ml-design/${d.id}`, sub: d.summary }))
  } else {
    cards = pick(
      theoryTopics.flatMap((t) => t.flashcards.map((_, i) => `${t.id}#${i}`)),
      12,
    )
  }
  return { kind, startedAt: Date.now(), minutes: def.minutes, items, cards }
}

export function useRemaining(session: MockSession | null) {
  const [now, setNow] = useState(Date.now())
  useEffect(() => {
    if (!session) return
    const t = setInterval(() => setNow(Date.now()), 1000)
    return () => clearInterval(t)
  }, [session])
  if (!session) return 0
  return Math.round(session.minutes * 60 - (now - session.startedAt) / 1000)
}

export const fmtClock = (s: number) => `${s < 0 ? '-' : ''}${String(Math.floor(Math.abs(s) / 60)).padStart(2, '0')}:${String(Math.abs(s) % 60).padStart(2, '0')}`

/** Small timer shown in the top bar while a mock is running */
export function MockPill() {
  const session = useMockSession((s) => s.session)
  const left = useRemaining(session)
  if (!session) return null
  return (
    <Link to="/mock" className={cn('flex items-center gap-1.5 rounded-lg border px-2.5 py-1.5 font-mono text-xs tabular-nums', left < 0 ? 'border-err/50 text-err' : left < 300 ? 'border-warn/50 text-warn' : 'border-accent/40 text-accent')}>
      <Timer size={13} /> {fmtClock(left)}
    </Link>
  )
}

function RapidFire({ ids }: { ids: string[] }) {
  const cards = useMemo(
    () =>
      ids
        .map((id) => {
          const [tid, i] = id.split('#')
          const t = theoryTopics.find((x) => x.id === tid)
          const c = t?.flashcards[Number(i)]
          return c && t ? { ...c, topic: t.title } : null
        })
        .filter((x): x is NonNullable<typeof x> => Boolean(x)),
    [ids],
  )
  const [shown, setShown] = useState<Record<number, boolean>>({})
  return (
    <div className="space-y-2">
      {cards.map((c, i) => (
        <Card key={i} className="p-4">
          <div className="mb-1 text-[11px] text-faint">
            {i + 1}. {c.topic}
          </div>
          <div className="font-medium">
            <Markdown compact className="[&_p]:m-0">
              {c.q}
            </Markdown>
          </div>
          {shown[i] ? (
            <div className="animate-fade-in mt-3 border-t border-line pt-3">
              <Markdown compact>{c.a}</Markdown>
            </div>
          ) : (
            <button onClick={() => setShown((s) => ({ ...s, [i]: true }))} className="mt-2 text-xs text-accent hover:underline">
              Reveal answer
            </button>
          )}
        </Card>
      ))}
    </div>
  )
}

export default function Mock() {
  const { session, start, stop } = useMockSession()
  const progress = useStore((s) => s.progress)
  const mocks = useStore((s) => s.mocks)
  const addMock = useStore((s) => s.addMock)
  const left = useRemaining(session)
  const [ending, setEnding] = useState(false)
  const [scores, setScores] = useState<Record<number, number>>({})
  const [notes, setNotes] = useState('')
  const def = session ? KINDS.find((k) => k.id === session.kind)! : null

  const finish = () => {
    if (!session || !def) return
    const score = def.rubric.reduce((s, _, i) => s + (scores[i] ?? 0), 0)
    addMock({
      id: String(session.startedAt),
      kind: def.title,
      at: Date.now(),
      minutes: Math.round((Date.now() - session.startedAt) / 60000),
      items: session.items.map((i) => i.title),
      score,
      maxScore: def.rubric.length * 4,
      notes: notes || undefined,
    })
    stop()
    setEnding(false)
    setScores({})
    setNotes('')
  }

  return (
    <Page>
      <PageHeader icon={<Timer size={20} />} title="Mock Interview" subtitle="Timed, interview-style sessions with a self-assessment rubric. The timer keeps running while you work on the problems elsewhere in the app (see the clock in the top bar)." />

      {!session && (
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {KINDS.map((k) => (
            <Card key={k.id} className="flex flex-col p-5">
              <div className="mb-3 flex items-center gap-3">
                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-accent-soft text-accent">
                  <k.icon size={17} />
                </div>
                <div>
                  <div className="font-semibold">{k.title}</div>
                  <div className="text-xs text-muted">{k.minutes} minutes</div>
                </div>
              </div>
              <p className="mb-4 flex-1 text-[13px] text-muted">{k.blurb}</p>
              <Button variant="primary" size="sm" className="justify-center" onClick={() => start(buildSession(k.id, progress))}>
                <Play size={14} /> Start
              </Button>
            </Card>
          ))}
        </div>
      )}

      {session && def && (
        <div className="space-y-5">
          <Card className="flex flex-wrap items-center gap-5 p-5">
            <div className={cn('font-mono text-5xl font-semibold tabular-nums', left < 0 ? 'text-err' : left < 300 ? 'text-warn' : 'text-fg')}>{fmtClock(left)}</div>
            <div className="flex-1">
              <div className="font-semibold">{def.title}</div>
              <div className="text-sm text-muted">{left < 0 ? 'Time is up — wrap up and self-assess.' : `${def.minutes} minute session in progress`}</div>
            </div>
            {!ending && (
              <Button variant="danger" onClick={() => setEnding(true)}>
                <Square size={14} /> End & assess
              </Button>
            )}
            <Button variant="ghost" size="sm" onClick={() => confirm('Discard this mock session?') && stop()}>
              Discard
            </Button>
          </Card>

          {session.items.length > 0 && (
            <div className="space-y-2">
              {session.items.map((it, i) => (
                <Card key={it.key} className="flex items-start gap-4 p-4">
                  <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-subtle text-xs font-semibold">{i + 1}</span>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2 font-medium">
                      {it.title}
                      {['Easy', 'Medium', 'Hard'].includes(it.sub ?? '') && <DifficultyBadge d={it.sub as Difficulty} />}
                    </div>
                    {it.sub && !['Easy', 'Medium', 'Hard'].includes(it.sub) && <p className="mt-1 text-[13px] text-muted">{it.sub}</p>}
                    {(session.kind === 'system-design' || session.kind === 'ml-design') && (
                      <p className="mt-2 text-xs text-faint">Work on paper or a whiteboard. Open the reference write-up only after you finish.</p>
                    )}
                  </div>
                  <Link to={it.to}>
                    <Button size="sm" variant="outline">
                      {session.kind === 'system-design' || session.kind === 'ml-design' ? 'Reference' : 'Solve'} <ExternalLink size={13} />
                    </Button>
                  </Link>
                </Card>
              ))}
            </div>
          )}
          {session.cards && <RapidFire ids={session.cards} />}

          {ending && (
            <Card className="animate-fade-in p-5">
              <h3 className="mb-1 font-semibold">Self-assessment</h3>
              <p className="mb-4 text-xs text-muted">Score each dimension 1 (weak) – 4 (strong hire signal).</p>
              <div className="space-y-2">
                {def.rubric.map((r, i) => (
                  <div key={i} className="flex flex-wrap items-center gap-3">
                    <span className="min-w-60 flex-1 text-sm">{r}</span>
                    <div className="flex gap-1">
                      {[1, 2, 3, 4].map((v) => (
                        <button
                          key={v}
                          onClick={() => setScores((s) => ({ ...s, [i]: v }))}
                          className={cn('h-8 w-8 rounded-lg border text-sm font-medium transition', scores[i] === v ? 'border-accent bg-accent text-accent-fg' : 'border-line hover:bg-subtle')}
                        >
                          {v}
                        </button>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
              <textarea value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="What went well? What to improve next time?" className="mt-4 h-24 w-full resize-none rounded-lg border border-line bg-subtle p-3 text-sm outline-none focus:ring-2 focus:ring-accent/30" />
              <div className="mt-3 flex justify-end gap-2">
                <Button variant="ghost" size="sm" onClick={() => setEnding(false)}>
                  Back
                </Button>
                <Button variant="primary" size="sm" onClick={finish}>
                  Save result
                </Button>
              </div>
            </Card>
          )}
        </div>
      )}

      {mocks.length > 0 && (
        <div className="mt-10">
          <h2 className="mb-3 text-sm font-semibold text-muted">History</h2>
          <Card className="overflow-hidden">
            {mocks.map((m, i) => (
              <div key={m.id} className={cn('flex flex-wrap items-center gap-4 px-4 py-3 text-sm', i > 0 && 'border-t border-line')}>
                <span className="w-28 text-xs text-muted">{new Date(m.at).toLocaleDateString()}</span>
                <span className="w-44 font-medium">{m.kind}</span>
                <span className="min-w-0 flex-1 truncate text-xs text-muted" title={m.notes}>
                  {m.items.join(' · ') || '—'}
                </span>
                <span className="text-xs text-muted">{m.minutes} min</span>
                <Badge tone={m.score / m.maxScore >= 0.75 ? 'ok' : m.score / m.maxScore >= 0.5 ? 'warn' : 'err'}>
                  {m.score}/{m.maxScore}
                </Badge>
              </div>
            ))}
          </Card>
          <button onClick={() => confirm('Clear mock history?') && useStore.setState({ mocks: [] })} className="mt-2 inline-flex items-center gap-1 text-xs text-faint hover:text-err">
            <Trash2 size={12} /> Clear history
          </button>
        </div>
      )}
    </Page>
  )
}
