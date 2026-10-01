import { ExternalLink, LibraryBig } from 'lucide-react'
import { useMemo, useState } from 'react'
import { Page } from '../components/Layout'
import { Badge, Card, PageHeader, SearchInput, Switch, cn } from '../components/ui'
import { resourceGroups } from '../data/resources'
import type { ResourceItem, ResourceType } from '../data/resources'

type TypeFilter = 'all' | 'book' | 'course' | 'video' | 'repo' | 'practice' | 'paper' | 'article'
type BadgeTone = 'neutral' | 'accent' | 'ok' | 'warn' | 'err' | 'info'

const typeFilters: { value: TypeFilter; label: string }[] = [
  { value: 'all', label: 'All' },
  { value: 'book', label: 'Books' },
  { value: 'course', label: 'Courses' },
  { value: 'video', label: 'Videos' },
  { value: 'repo', label: 'Repos' },
  { value: 'practice', label: 'Practice' },
  { value: 'paper', label: 'Papers' },
  { value: 'article', label: 'Articles' },
]

const typeLabels: Record<ResourceType, string> = {
  book: 'Book',
  course: 'Course',
  video: 'Video',
  repo: 'Repo',
  practice: 'Practice',
  article: 'Article',
  paper: 'Paper',
  newsletter: 'Newsletter',
  tool: 'Tool',
}

const typeTones: Record<ResourceType, BadgeTone> = {
  book: 'accent',
  course: 'info',
  video: 'warn',
  repo: 'neutral',
  practice: 'ok',
  article: 'neutral',
  paper: 'accent',
  newsletter: 'info',
  tool: 'warn',
}

function getHost(url: string) {
  try {
    return new URL(url).hostname.replace(/^www\./, '')
  } catch {
    return ''
  }
}

function matchesType(item: ResourceItem, filter: TypeFilter) {
  if (filter === 'all') return true
  if (filter === 'article') return item.type === 'article' || item.type === 'newsletter'
  return item.type === filter
}

function matchesSearch(item: ResourceItem, query: string) {
  const q = query.trim().toLowerCase()
  if (!q) return true
  const haystack = [item.title, item.note, ...item.tags].join(' ').toLowerCase()
  return haystack.includes(q)
}

function ResourceFavicon({ url, title }: { url: string; title: string }) {
  const host = getHost(url)
  return (
    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-line bg-subtle text-xs font-semibold text-faint">
      {host ? (
        <img
          src={`https://www.google.com/s2/favicons?domain=${encodeURIComponent(host)}&sz=32`}
          alt=""
          className="h-5 w-5 rounded-sm"
          loading="lazy"
          onError={(event) => {
            event.currentTarget.style.display = 'none'
          }}
        />
      ) : (
        title.slice(0, 1)
      )}
    </div>
  )
}

function ResourceRow({ item }: { item: ResourceItem }) {
  const host = getHost(item.url)
  return (
    <Card className="group p-3 transition-colors hover:border-line-strong hover:bg-subtle/40">
      <div className="flex gap-3">
        <ResourceFavicon url={item.url} title={item.title} />
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <a href={item.url} target="_blank" rel="noreferrer" className="inline-flex min-w-0 items-center gap-1.5 text-sm font-semibold text-fg hover:text-accent">
              <span className="truncate">{item.title}</span>
              <ExternalLink size={13} className="shrink-0 opacity-55 transition-opacity group-hover:opacity-100" />
            </a>
            <Badge tone={typeTones[item.type]}>{typeLabels[item.type]}</Badge>
            <Badge tone={item.free ? 'ok' : 'warn'}>{item.free ? 'Free' : 'Paid'}</Badge>
          </div>
          <p className="mt-1.5 text-[13px] leading-5 text-muted">{item.note}</p>
          <div className="mt-2 flex flex-wrap items-center gap-1.5">
            {host && <span className="mr-1 text-[11px] text-faint">{host}</span>}
            {item.tags.map((tag) => (
              <span key={tag} className="rounded-md bg-accent-soft px-1.5 py-0.5 text-[11px] font-medium text-accent">
                {tag}
              </span>
            ))}
          </div>
        </div>
      </div>
    </Card>
  )
}

export default function Resources() {
  const [query, setQuery] = useState('')
  const [typeFilter, setTypeFilter] = useState<TypeFilter>('all')
  const [freeOnly, setFreeOnly] = useState(false)

  const totalCount = useMemo(() => resourceGroups.reduce((sum, group) => sum + group.items.length, 0), [])
  const filteredGroups = useMemo(
    () =>
      resourceGroups
        .map((group) => ({
          ...group,
          items: group.items.filter((item) => matchesSearch(item, query) && matchesType(item, typeFilter) && (!freeOnly || item.free)),
        }))
        .filter((group) => group.items.length > 0),
    [freeOnly, query, typeFilter],
  )
  const visibleCount = useMemo(() => filteredGroups.reduce((sum, group) => sum + group.items.length, 0), [filteredGroups])

  return (
    <Page wide>
      <PageHeader
        icon={<LibraryBig size={20} />}
        title="Resources"
        subtitle="Curated study material for ML/AI engineer interviews across coding, SQL, systems, ML theory, LLMs and career prep."
      />

      <Card className="mb-6 p-4">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center">
          <SearchInput value={query} onChange={setQuery} placeholder="Search title, note or tags…" className="lg:max-w-sm" />
          <div className="flex flex-wrap gap-1.5">
            {typeFilters.map((filter) => (
              <button
                key={filter.value}
                type="button"
                onClick={() => setTypeFilter(filter.value)}
                className={cn(
                  'h-8 rounded-lg border px-3 text-xs font-medium transition-colors',
                  typeFilter === filter.value ? 'border-transparent bg-accent text-accent-fg shadow-sm' : 'border-line bg-panel text-muted hover:bg-subtle hover:text-fg',
                )}
              >
                {filter.label}
              </button>
            ))}
          </div>
          <div className="flex items-center gap-4 lg:ml-auto">
            <Switch checked={freeOnly} onChange={setFreeOnly} label={<span className="text-sm text-muted">Free only</span>} />
            <div className="text-xs text-muted">
              Showing <span className="font-mono text-fg">{visibleCount}</span> of <span className="font-mono text-fg">{totalCount}</span>
            </div>
          </div>
        </div>
      </Card>

      <div className="grid gap-6 lg:grid-cols-[220px_minmax(0,1fr)]">
        <aside className="hidden lg:block">
          <nav className="sticky top-6 rounded-xl border border-line bg-panel p-2" aria-label="Resource groups">
            {filteredGroups.map((group) => (
              <a key={group.id} href={`#${group.id}`} className="flex items-center justify-between rounded-lg px-2.5 py-2 text-xs font-medium text-muted transition-colors hover:bg-subtle hover:text-fg">
                <span className="truncate">{group.title}</span>
                <span className="ml-2 font-mono text-faint">{group.items.length}</span>
              </a>
            ))}
          </nav>
        </aside>

        <div className="space-y-8">
          {filteredGroups.length === 0 ? (
            <Card className="p-10 text-center">
              <div className="text-sm font-medium">No resources match your filters.</div>
              <div className="mt-1 text-xs text-muted">Try clearing the search, switching type filters or turning off free-only mode.</div>
            </Card>
          ) : (
            filteredGroups.map((group) => (
              <section key={group.id} id={group.id} className="scroll-mt-6">
                <div className="mb-3 flex flex-wrap items-end justify-between gap-3">
                  <div>
                    <h2 className="text-lg font-semibold tracking-tight">{group.title}</h2>
                    <p className="mt-1 text-sm text-muted">{group.description}</p>
                  </div>
                  <Badge tone="accent">{group.items.length} resources</Badge>
                </div>
                <div className="grid gap-2 xl:grid-cols-2">
                  {group.items.map((item) => (
                    <ResourceRow key={`${group.id}:${item.title}`} item={item} />
                  ))}
                </div>
              </section>
            ))
          )}
        </div>
      </div>
    </Page>
  )
}
