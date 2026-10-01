import { ArrowRight, Brain, CalendarCheck, Code2, Database, Flame, FlaskConical, Layers, Network, Sparkles, Target, Timer, Workflow } from 'lucide-react'
import type { LucideIcon } from 'lucide-react'
import { useMemo } from 'react'
import { Link } from 'react-router-dom'
import { Page } from '../components/Layout'
import { Button, Card, DifficultyBadge, ProgressBar, ProgressRing, cn } from '../components/ui'
import { StatusIcon } from '../components/workspace'
import { DSA_CATEGORIES, dsaById, dsaProblems, mlById, mlProblems, mlsdById, mlsdDocs, sdById, sdDocs, sqlById, sqlProblems, theoryById, theoryTopics } from '../data'
import { buildPlan } from '../lib/plan'
import { keyOf, today, useStore } from '../store/progress'
import { widgets } from '../viz/registry'
import { currentWeek, useItemDone } from './StudyPlan'
import { allCards } from './Theory'

function resolve(key: string): { title: string; to: string; label: string } | null {
  const [sec, id] = [key.slice(0, key.indexOf(':')), key.slice(key.indexOf(':') + 1)]
  if (sec === 'dsa' && dsaById.has(id)) return { title: dsaById.get(id)!.title, to: `/dsa/${id}`, label: 'DSA' }
  if (sec === 'sql' && sqlById.has(id)) return { title: sqlById.get(id)!.title, to: `/sql/${id}`, label: 'SQL' }
  if (sec === 'ml' && mlById.has(id)) return { title: mlById.get(id)!.title, to: `/ml-coding/${id}`, label: 'ML Coding' }
  if (sec === 'sd' && sdById.has(id)) return { title: sdById.get(id)!.title, to: `/system-design/${id}`, label: 'System Design' }
  if (sec === 'mlsd' && mlsdById.has(id)) return { title: mlsdById.get(id)!.title, to: `/ml-design/${id}`, label: 'ML Design' }
  if (sec === 'theory' && theoryById.has(id)) return { title: theoryById.get(id)!.title, to: `/theory/${id}`, label: 'Theory' }
  return null
}

const dayKey = (d: Date) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`

function streakOf(activity: Record<string, number>) {
  let n = 0
  const d = new Date()
  if (!activity[dayKey(d)]) d.setDate(d.getDate() - 1)
  while (activity[dayKey(d)]) {
    n++
    d.setDate(d.getDate() - 1)
  }
  return n
}

function Heatmap({ activity }: { activity: Record<string, number> }) {
  const weeks = 26
  const end = new Date()
  const start = new Date(end)
  start.setDate(start.getDate() - (weeks * 7 - 1) - end.getDay())
  const cells: { key: string; v: number; date: Date }[] = []
  for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) cells.push({ key: dayKey(d), v: activity[dayKey(d)] ?? 0, date: new Date(d) })
  const max = Math.max(4, ...cells.map((c) => c.v))
  const cols: (typeof cells)[] = []
  for (let i = 0; i < cells.length; i += 7) cols.push(cells.slice(i, i + 7))
  const total = cells.reduce((s, c) => s + c.v, 0)
  return (
    <div>
      <div className="flex gap-[3px] overflow-x-auto pb-1">
        {cols.map((col, i) => (
          <div key={i} className="flex flex-col gap-[3px]">
            {col.map((c) => (
              <div
                key={c.key}
                title={`${c.date.toDateString()}: ${c.v} activit${c.v === 1 ? 'y' : 'ies'}`}
                className="h-[11px] w-[11px] rounded-[3px]"
                style={{ background: c.v === 0 ? 'var(--line)' : `color-mix(in srgb, var(--accent) ${25 + (c.v / max) * 75}%, transparent)` }}
              />
            ))}
          </div>
        ))}
      </div>
      <div className="mt-2 text-[11px] text-muted">{total} activities in the last 6 months</div>
    </div>
  )
}

function SectionCard({ to, icon: Icon, title, done, total, unit, color }: { to: string; icon: LucideIcon; title: string; done: number; total: number; unit: string; color: string }) {
  return (
    <Link to={to} className="group">
      <Card className="flex h-full items-center gap-4 p-4 transition group-hover:-translate-y-0.5 group-hover:border-accent/50">
        <ProgressRing value={total ? done / total : 0} size={54} stroke={5} color={color}>
          <Icon size={17} style={{ color }} />
        </ProgressRing>
        <div className="min-w-0">
          <div className="truncate text-sm font-semibold group-hover:text-accent">{title}</div>
          <div className="text-xs text-muted">
            <span className="font-mono text-fg">{done}</span>/{total} {unit}
          </div>
        </div>
      </Card>
    </Link>
  )
}

export default function Dashboard() {
  const progress = useStore((s) => s.progress)
  const read = useStore((s) => s.read)
  const activity = useStore((s) => s.activity)
  const recent = useStore((s) => s.recent)
  const cards = useStore((s) => s.cards)
  const settings = useStore((s) => s.settings)
  const isDone = useItemDone()

  const solved = (sec: string, arr: { id: string }[]) => arr.filter((p) => progress[keyOf(sec as 'dsa', p.id)]?.status === 'solved').length
  const readN = (sec: string, arr: { id: string }[]) => arr.filter((p) => read[keyOf(sec as 'sd', p.id)]).length
  const now = Date.now()
  const due = useMemo(() => allCards().filter((c) => cards[c.id] && cards[c.id].due <= now).length, [cards, now])
  const streak = streakOf(activity)
  const todayCount = activity[today()] ?? 0

  const nextDsa = useMemo(() => {
    for (const c of DSA_CATEGORIES) {
      const p = dsaProblems.find((x) => x.category === c.name && progress[keyOf('dsa', x.id)]?.status !== 'solved')
      if (p) return p
    }
    return null
  }, [progress])

  const plan = useMemo(() => buildPlan(settings.planWeeks), [settings.planWeeks])
  const wk = currentWeek(settings.planStart, settings.planWeeks)
  const weekItems = plan[wk]?.tracks.flatMap((t) => t.items.map((i) => ({ ...i, track: t.label, color: t.color }))) ?? []
  const weekLeft = weekItems.filter((i) => !isDone(i))

  const weak = useMemo(() => {
    return DSA_CATEGORIES.map((c) => {
      const ps = dsaProblems.filter((p) => p.category === c.name)
      const s = ps.filter((p) => progress[keyOf('dsa', p.id)]?.status === 'solved').length
      const a = ps.filter((p) => progress[keyOf('dsa', p.id)]?.status === 'attempted').length
      return { name: c.name, slug: c.slug, pct: s / ps.length, attempted: a, total: ps.length, solved: s }
    })
      .filter((x) => x.attempted > 0 || x.solved > 0)
      .sort((a, b) => a.pct - b.pct)
      .slice(0, 4)
  }, [progress])

  const hour = new Date().getHours()
  const greet = hour < 5 ? 'Burning the midnight oil' : hour < 12 ? 'Good morning' : hour < 18 ? 'Good afternoon' : 'Good evening'
  const recentItems = recent.map((k) => ({ key: k, r: resolve(k) })).filter((x) => x.r).slice(0, 6)

  return (
    <Page wide>
      <div className="mb-8 flex flex-wrap items-end justify-between gap-6">
        <div>
          <div className="text-sm text-muted">{greet} 👋</div>
          <h1 className="mt-1 text-3xl font-semibold tracking-tight">Let’s get you interview-ready.</h1>
          <p className="mt-2 max-w-2xl text-muted">
            {dsaProblems.length} coding problems, {sqlProblems.length} SQL, {mlProblems.length} ML implementations, {sdDocs.length + mlsdDocs.length} design write-ups, {theoryTopics.length} theory topics and {widgets.length} interactive visualizers — all in one place.
          </p>
        </div>
        <div className="flex gap-3">
          <Card className="flex items-center gap-3 px-4 py-3">
            <Flame size={22} className={streak > 0 ? 'text-warn' : 'text-faint'} />
            <div>
              <div className="text-xl leading-none font-semibold">{streak}</div>
              <div className="text-[11px] text-muted">day streak</div>
            </div>
          </Card>
          <Card className="flex items-center gap-3 px-4 py-3">
            <ProgressRing value={todayCount / settings.dailyGoal} size={40} stroke={4} color="var(--ok)">
              <Target size={14} />
            </ProgressRing>
            <div>
              <div className="text-xl leading-none font-semibold">
                {todayCount}
                <span className="text-sm text-faint">/{settings.dailyGoal}</span>
              </div>
              <div className="text-[11px] text-muted">today’s goal</div>
            </div>
          </Card>
        </div>
      </div>

      <div className="mb-6 grid grid-cols-2 gap-3 md:grid-cols-3 xl:grid-cols-6">
        <SectionCard to="/dsa" icon={Code2} title="DSA" done={solved('dsa', dsaProblems)} total={dsaProblems.length} unit="solved" color="var(--viz-1)" />
        <SectionCard to="/sql" icon={Database} title="SQL" done={solved('sql', sqlProblems)} total={sqlProblems.length} unit="solved" color="var(--viz-5)" />
        <SectionCard to="/ml-coding" icon={FlaskConical} title="ML Coding" done={solved('ml', mlProblems)} total={mlProblems.length} unit="solved" color="var(--viz-3)" />
        <SectionCard to="/system-design" icon={Network} title="System Design" done={readN('sd', sdDocs)} total={sdDocs.length} unit="studied" color="var(--viz-4)" />
        <SectionCard to="/ml-design" icon={Workflow} title="ML Design" done={readN('mlsd', mlsdDocs)} total={mlsdDocs.length} unit="studied" color="var(--viz-6)" />
        <SectionCard to="/theory" icon={Brain} title="ML Theory" done={readN('theory', theoryTopics)} total={theoryTopics.length} unit="studied" color="var(--viz-2)" />
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="space-y-6 lg:col-span-2">
          <Card className="p-5">
            <div className="mb-4 flex items-center justify-between">
              <div>
                <h2 className="font-semibold">This week{settings.planStart ? ` · Week ${wk + 1} of ${settings.planWeeks}` : ''}</h2>
                <p className="text-xs text-muted">{settings.planStart ? plan[wk]?.focus : 'Set a start date in the study plan to track your current week.'}</p>
              </div>
              <Link to="/plan">
                <Button size="sm" variant="outline">
                  <CalendarCheck size={14} /> Full plan
                </Button>
              </Link>
            </div>
            <ProgressBar value={weekItems.length ? (weekItems.length - weekLeft.length) / weekItems.length : 0} className="mb-4" />
            <div className="grid gap-1 sm:grid-cols-2">
              {weekLeft.slice(0, 10).map((it) => (
                <Link key={it.key} to={it.to} className="flex items-center gap-2 rounded-lg px-2 py-1.5 text-[13px] hover:bg-subtle">
                  <span className="h-1.5 w-1.5 shrink-0 rounded-full" style={{ background: it.color }} />
                  <span className="min-w-0 flex-1 truncate">{it.title}</span>
                  <span className="text-[11px] text-faint">{it.track}</span>
                </Link>
              ))}
              {weekLeft.length === 0 && <div className="text-sm text-ok">Week complete — nice work! 🎉</div>}
            </div>
            {weekLeft.length > 10 && <div className="mt-2 text-xs text-muted">+{weekLeft.length - 10} more</div>}
          </Card>

          <Card className="p-5">
            <h2 className="mb-4 font-semibold">Activity</h2>
            <Heatmap activity={activity} />
          </Card>

          {weak.length > 0 && (
            <Card className="p-5">
              <h2 className="mb-1 font-semibold">Focus areas</h2>
              <p className="mb-4 text-xs text-muted">DSA patterns you’ve started with the lowest completion.</p>
              <div className="space-y-3">
                {weak.map((w) => (
                  <Link key={w.name} to="/dsa" className="flex items-center gap-3 text-sm hover:text-accent">
                    <span className="w-48 truncate">{w.name}</span>
                    <ProgressBar value={w.pct} className="flex-1" />
                    <span className="w-14 text-right font-mono text-xs text-muted">
                      {w.solved}/{w.total}
                    </span>
                  </Link>
                ))}
              </div>
            </Card>
          )}
        </div>

        <div className="space-y-6">
          {nextDsa && (
            <Card className="p-5">
              <div className="mb-1 text-xs text-muted">Next up on the roadmap</div>
              <Link to={`/dsa/${nextDsa.id}`} className="group block">
                <div className="flex items-center gap-2">
                  <span className="font-semibold group-hover:text-accent">
                    {nextDsa.number}. {nextDsa.title}
                  </span>
                </div>
                <div className="mt-2 flex items-center gap-2 text-xs text-muted">
                  <DifficultyBadge d={nextDsa.difficulty} /> {nextDsa.category} · {nextDsa.pattern}
                </div>
              </Link>
              <Link to={`/dsa/${nextDsa.id}`}>
                <Button variant="primary" size="sm" className="mt-4 w-full justify-center">
                  Solve now <ArrowRight size={14} />
                </Button>
              </Link>
            </Card>
          )}

          <Card className="p-5">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-xs text-muted">Flashcards due</div>
                <div className="text-2xl font-semibold">{due}</div>
              </div>
              <Link to="/review">
                <Button size="sm" variant={due ? 'primary' : 'outline'}>
                  <Layers size={14} /> Review
                </Button>
              </Link>
            </div>
          </Card>

          <Card className="p-5">
            <h2 className="mb-3 font-semibold">Jump back in</h2>
            {recentItems.length === 0 ? (
              <div className="text-sm text-muted">Nothing yet — start with the roadmap or a theory topic.</div>
            ) : (
              <div className="space-y-0.5">
                {recentItems.map(({ key, r }) => (
                  <Link key={key} to={r!.to} className="flex items-center gap-2 rounded-lg px-2 py-1.5 text-[13px] hover:bg-subtle">
                    {['DSA', 'SQL', 'ML Coding'].includes(r!.label) ? <StatusIcon status={progress[key]?.status} size={14} /> : <span className={cn('h-1.5 w-1.5 rounded-full', read[key] ? 'bg-ok' : 'bg-faint')} />}
                    <span className="min-w-0 flex-1 truncate">{r!.title}</span>
                    <span className="text-[11px] text-faint">{r!.label}</span>
                  </Link>
                ))}
              </div>
            )}
          </Card>

          <Card className="p-5">
            <h2 className="mb-3 font-semibold">Quick start</h2>
            <div className="grid grid-cols-2 gap-2">
              <Link to="/mock">
                <Button size="sm" variant="outline" className="w-full">
                  <Timer size={14} /> Mock
                </Button>
              </Link>
              <Link to="/visualizers">
                <Button size="sm" variant="outline" className="w-full">
                  <Sparkles size={14} /> Visualize
                </Button>
              </Link>
            </div>
          </Card>
        </div>
      </div>
    </Page>
  )
}
