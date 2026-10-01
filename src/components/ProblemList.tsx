import { Bookmark, ChevronDown, Shuffle } from 'lucide-react'
import { useMemo, useState } from 'react'
import type { ReactNode } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useStore, type Status } from '../store/progress'
import type { Difficulty } from '../types/content'
import { StatusIcon } from './workspace'
import { Button, Card, DifficultyBadge, ProgressBar, SearchInput, Segmented, cn } from './ui'

export interface ListItem {
  id: string
  key: string
  to: string
  title: string
  number?: number
  difficulty: Difficulty
  group: string
  tags: string[]
  extra?: ReactNode
}

type DiffFilter = 'All' | Difficulty
type StatusFilter = 'all' | Status | 'bookmarked'

export default function ProblemList({ items, groupOrder, groupBlurb }: { items: ListItem[]; groupOrder?: string[]; groupBlurb?: (g: string) => ReactNode }) {
  const progress = useStore((s) => s.progress)
  const bookmarks = useStore((s) => s.bookmarks)
  const nav = useNavigate()
  const [q, setQ] = useState('')
  const [diff, setDiff] = useState<DiffFilter>('All')
  const [status, setStatus] = useState<StatusFilter>('all')
  const [collapsed, setCollapsed] = useState<Record<string, boolean>>({})

  const filtered = useMemo(() => {
    const qq = q.trim().toLowerCase()
    return items.filter((it) => {
      if (diff !== 'All' && it.difficulty !== diff) return false
      const st = progress[it.key]?.status ?? 'todo'
      if (status === 'bookmarked' ? !bookmarks[it.key] : status !== 'all' && st !== status) return false
      if (!qq) return true
      return `${it.number ?? ''} ${it.title} ${it.group} ${it.tags.join(' ')}`.toLowerCase().includes(qq)
    })
  }, [items, q, diff, status, progress, bookmarks])

  const groups = useMemo(() => {
    const order = groupOrder ?? [...new Set(items.map((i) => i.group))]
    return order.map((g) => ({ name: g, all: items.filter((i) => i.group === g), shown: filtered.filter((i) => i.group === g) })).filter((g) => g.all.length > 0)
  }, [items, filtered, groupOrder])

  const pickRandom = () => {
    const pool = filtered.filter((i) => progress[i.key]?.status !== 'solved')
    const list = pool.length ? pool : filtered
    if (list.length) nav(list[Math.floor(Math.random() * list.length)].to)
  }

  return (
    <div>
      <div className="mb-5 flex flex-wrap items-center gap-2">
        <SearchInput value={q} onChange={setQ} placeholder="Search by title, pattern or number…" className="w-full sm:w-72" />
        <Segmented<DiffFilter>
          options={[
            { value: 'All', label: 'All' },
            { value: 'Easy', label: 'Easy' },
            { value: 'Medium', label: 'Medium' },
            { value: 'Hard', label: 'Hard' },
          ]}
          value={diff}
          onChange={setDiff}
        />
        <Segmented<StatusFilter>
          options={[
            { value: 'all', label: 'Any status' },
            { value: 'todo', label: 'To do' },
            { value: 'attempted', label: 'Attempted' },
            { value: 'solved', label: 'Solved' },
            { value: 'bookmarked', label: <Bookmark size={12} /> },
          ]}
          value={status}
          onChange={setStatus}
        />
        <div className="flex-1" />
        <Button size="sm" variant="outline" onClick={pickRandom}>
          <Shuffle size={14} /> Random unsolved
        </Button>
      </div>

      <div className="space-y-4">
        {groups.map((g) => {
          const solved = g.all.filter((i) => progress[i.key]?.status === 'solved').length
          const isCollapsed = collapsed[g.name] ?? false
          if (g.shown.length === 0 && (q || diff !== 'All' || status !== 'all')) return null
          return (
            <Card key={g.name} id={`group-${g.name.toLowerCase().replace(/[^a-z0-9]+/g, '-')}`} className="scroll-mt-4 overflow-hidden">
              <button onClick={() => setCollapsed((c) => ({ ...c, [g.name]: !isCollapsed }))} className="flex w-full items-center gap-3 px-4 py-3 text-left hover:bg-subtle/50">
                <ChevronDown size={16} className={cn('text-faint transition-transform', isCollapsed && '-rotate-90')} />
                <div className="min-w-0 flex-1">
                  <div className="text-sm font-semibold">{g.name}</div>
                  {groupBlurb && <div className="truncate text-xs text-muted">{groupBlurb(g.name)}</div>}
                </div>
                <div className="hidden w-32 sm:block">
                  <ProgressBar value={solved / g.all.length} color={solved === g.all.length ? 'var(--ok)' : 'var(--accent)'} />
                </div>
                <span className="w-12 text-right font-mono text-xs text-muted">
                  {solved}/{g.all.length}
                </span>
              </button>
              {!isCollapsed && (
                <div className="border-t border-line">
                  {g.shown.map((it, i) => (
                    <Link key={it.id} to={it.to} className={cn('group flex items-center gap-3 px-4 py-2.5 text-sm transition-colors hover:bg-subtle', i > 0 && 'border-t border-line/60')}>
                      <StatusIcon status={progress[it.key]?.status} />
                      <span className="min-w-0 flex-1 truncate">
                        {it.number !== undefined && <span className="mr-1.5 font-mono text-xs text-faint">{it.number}.</span>}
                        <span className="font-medium group-hover:text-accent">{it.title}</span>
                      </span>
                      {bookmarks[it.key] && <Bookmark size={13} className="text-accent" />}
                      <span className="hidden gap-1.5 md:flex">
                        {it.tags.slice(0, 2).map((t) => (
                          <span key={t} className="rounded-md bg-subtle px-1.5 py-0.5 text-[11px] text-muted">
                            {t}
                          </span>
                        ))}
                      </span>
                      {it.extra}
                      <DifficultyBadge d={it.difficulty} className="w-14 justify-center" />
                    </Link>
                  ))}
                </div>
              )}
            </Card>
          )
        })}
        {filtered.length === 0 && <div className="py-10 text-center text-sm text-muted">No problems match these filters.</div>}
      </div>
    </div>
  )
}
