import { CalendarCheck, CheckCircle2, ChevronDown, CircleDashed, Timer } from 'lucide-react'
import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { Page } from '../components/Layout'
import { Button, Card, PageHeader, ProgressBar, Segmented, cn } from '../components/ui'
import { buildPlan, type PlanItem } from '../lib/plan'
import { today, useStore } from '../store/progress'

export function useItemDone() {
  const progress = useStore((s) => s.progress)
  const read = useStore((s) => s.read)
  return (it: PlanItem) => (it.kind === 'solve' ? progress[it.key]?.status === 'solved' : Boolean(read[it.key]))
}

export function currentWeek(planStart: string | undefined, weeks: number) {
  if (!planStart) return 0
  const d = (Date.now() - new Date(planStart + 'T00:00:00').getTime()) / (7 * 24 * 3600 * 1000)
  return Math.max(0, Math.min(weeks - 1, Math.floor(d)))
}

export default function StudyPlan() {
  const settings = useStore((s) => s.settings)
  const setSettings = useStore((s) => s.setSettings)
  const done = useItemDone()
  const weeks = settings.planWeeks
  const plan = useMemo(() => buildPlan(weeks), [weeks])
  const cur = currentWeek(settings.planStart, weeks)
  const [open, setOpen] = useState<Record<number, boolean>>({ [cur]: true })

  const totals = plan.map((w) => {
    const items = w.tracks.flatMap((t) => t.items)
    return { done: items.filter(done).length, total: items.length }
  })
  const all = totals.reduce((a, b) => ({ done: a.done + b.done, total: a.total + b.total }), { done: 0, total: 0 })

  return (
    <Page>
      <PageHeader
        icon={<CalendarCheck size={20} />}
        title="Study Plan"
        subtitle="A week-by-week schedule covering every problem, topic and design in the app. DSA runs throughout; theory front-loads; system and ML design ramp up mid-way; the final week is mocks and review. Items tick off automatically as you solve or study them."
      />
      <Card className="mb-6 flex flex-wrap items-center gap-4 p-4">
        <div className="flex items-center gap-2 text-sm">
          <span className="text-muted">Duration</span>
          <Segmented
            options={[
              { value: 8, label: '8 weeks' },
              { value: 12, label: '12 weeks' },
              { value: 16, label: '16 weeks' },
            ]}
            value={weeks}
            onChange={(v) => setSettings({ planWeeks: v as 8 | 12 | 16 })}
          />
        </div>
        <label className="flex items-center gap-2 text-sm">
          <span className="text-muted">Start date</span>
          <input
            type="date"
            value={settings.planStart ?? ''}
            onChange={(e) => setSettings({ planStart: e.target.value || undefined })}
            className="h-8 rounded-lg border border-line bg-panel px-2 text-sm outline-none focus:ring-2 focus:ring-accent/40"
          />
        </label>
        {!settings.planStart && (
          <Button size="sm" variant="primary" onClick={() => setSettings({ planStart: today() })}>
            Start today
          </Button>
        )}
        <div className="ml-auto flex w-64 flex-col gap-1 text-xs text-muted">
          <span>
            Overall {all.done}/{all.total} · {Math.round((all.done / Math.max(1, all.total)) * 100)}%
          </span>
          <ProgressBar value={all.done / Math.max(1, all.total)} />
        </div>
      </Card>

      <div className="relative space-y-3 border-l border-line pl-6">
        {plan.map((w, i) => {
          const t = totals[i]
          const isOpen = open[i] ?? false
          const complete = t.total > 0 && t.done === t.total
          const isCur = settings.planStart && i === cur
          return (
            <div key={i} className="relative">
              <span className={cn('absolute top-4 -left-[31px] h-3 w-3 rounded-full border-2 border-bg', complete ? 'bg-ok' : isCur ? 'bg-accent ring-4 ring-accent/20' : 'bg-line-strong')} />
              <Card className={cn('overflow-hidden', isCur && 'border-accent/50')}>
                <button onClick={() => setOpen((o) => ({ ...o, [i]: !isOpen }))} className="flex w-full items-center gap-4 px-4 py-3 text-left hover:bg-subtle/50">
                  <div className="w-16 shrink-0">
                    <div className="text-[11px] text-faint">Week</div>
                    <div className="text-lg font-semibold">{i + 1}</div>
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="truncate text-sm font-medium">{w.focus}</div>
                    <div className="mt-1.5 flex flex-wrap gap-1.5">
                      {w.tracks.map((tr) => (
                        <span key={tr.id} className="inline-flex items-center gap-1 rounded-md bg-subtle px-1.5 py-0.5 text-[11px] text-muted">
                          <span className="h-1.5 w-1.5 rounded-full" style={{ background: tr.color }} />
                          {tr.label} · {tr.items.length}
                        </span>
                      ))}
                      {i === plan.length - 1 && (
                        <span className="inline-flex items-center gap-1 rounded-md bg-subtle px-1.5 py-0.5 text-[11px] text-muted">
                          <Timer size={11} /> Mocks
                        </span>
                      )}
                    </div>
                  </div>
                  {isCur && <span className="rounded-md bg-accent-soft px-2 py-0.5 text-[11px] font-medium text-accent">This week</span>}
                  <div className="hidden w-28 sm:block">
                    <ProgressBar value={t.done / Math.max(1, t.total)} color={complete ? 'var(--ok)' : undefined} />
                  </div>
                  <span className="w-12 text-right font-mono text-xs text-muted">
                    {t.done}/{t.total}
                  </span>
                  <ChevronDown size={16} className={cn('text-faint transition-transform', isOpen && 'rotate-180')} />
                </button>
                {isOpen && (
                  <div className="grid gap-4 border-t border-line p-4 md:grid-cols-2">
                    {w.tracks.map((tr) => (
                      <div key={tr.id}>
                        <div className="mb-1.5 flex items-center gap-1.5 text-xs font-semibold">
                          <span className="h-2 w-2 rounded-full" style={{ background: tr.color }} />
                          {tr.label}
                        </div>
                        <div className="space-y-0.5">
                          {tr.items.map((it) => (
                            <Link key={it.key} to={it.to} className="flex items-center gap-2 rounded-md px-1.5 py-1 text-[13px] hover:bg-subtle">
                              {done(it) ? <CheckCircle2 size={14} className="shrink-0 text-ok" /> : <CircleDashed size={14} className="shrink-0 text-faint" />}
                              <span className={cn('truncate', done(it) && 'text-muted line-through decoration-faint')}>{it.title}</span>
                            </Link>
                          ))}
                        </div>
                      </div>
                    ))}
                    {i === plan.length - 1 && (
                      <div>
                        <div className="mb-1.5 text-xs font-semibold">Mock interviews</div>
                        <p className="mb-2 text-[13px] text-muted">Run at least 4 timed mocks (2 coding, 1 system design, 1 ML design) and redo every problem you marked “attempted”.</p>
                        <Link to="/mock">
                          <Button size="sm" variant="outline">
                            <Timer size={14} /> Open mock interview
                          </Button>
                        </Link>
                      </div>
                    )}
                  </div>
                )}
              </Card>
            </div>
          )
        })}
      </div>
    </Page>
  )
}
