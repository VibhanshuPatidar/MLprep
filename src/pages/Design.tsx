import { ArrowLeft, BookOpenCheck, Check, ChevronDown, ExternalLink, MessageCircleQuestion, Network, Sparkles, Workflow } from 'lucide-react'
import { Fragment, useEffect, useMemo, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import Diagram from '../components/Diagram'
import { Page } from '../components/Layout'
import Markdown, { slugify } from '../components/Markdown'
import Widget from '../components/Widget'
import { Badge, Button, Card, DifficultyBadge, PageHeader, ProgressBar, SearchInput, cn } from '../components/ui'
import { groupBy, mlsdById, mlsdDocs, sdById, sdDocs } from '../data'
import { keyOf, useStore, type Section } from '../store/progress'
import type { DesignDoc } from '../types/content'
import { widgetById } from '../viz/registry'

interface Kind {
  section: Extract<Section, 'sd' | 'mlsd'>
  base: string
  title: string
  icon: typeof Network
  subtitle: string
  docs: DesignDoc[]
  byId: Map<string, DesignDoc>
}

const KINDS: Record<'sd' | 'mlsd', Kind> = {
  sd: {
    section: 'sd',
    base: '/system-design',
    title: 'System Design',
    icon: Network,
    subtitle: 'Fundamentals and classic case studies: requirements, estimation, APIs, data models, deep dives and trade-offs — with interactive architecture diagrams and simulations.',
    docs: sdDocs,
    byId: sdById,
  },
  mlsd: {
    section: 'mlsd',
    base: '/ml-design',
    title: 'ML System Design',
    icon: Workflow,
    subtitle: 'The ML design round end-to-end: framing, metrics, data & labels, features, models, training, serving and monitoring — through recsys, ranking, ads, fraud, search and LLM case studies.',
    docs: mlsdDocs,
    byId: mlsdById,
  },
}

export function DesignList({ kind }: { kind: 'sd' | 'mlsd' }) {
  const k = KINDS[kind]
  const read = useStore((s) => s.read)
  const [q, setQ] = useState('')
  const docs = k.docs.filter((d) => `${d.title} ${d.summary} ${d.tags.join(' ')}`.toLowerCase().includes(q.toLowerCase()))
  const groups = groupBy(docs, (d) => d.category)
  const done = k.docs.filter((d) => read[keyOf(k.section, d.id)]).length
  const Icon = k.icon
  return (
    <Page wide>
      <PageHeader
        icon={<Icon size={20} />}
        title={k.title}
        subtitle={k.subtitle}
        actions={
          <div className="flex w-56 flex-col gap-1 text-xs text-muted">
            <span>
              {done}/{k.docs.length} studied
            </span>
            <ProgressBar value={done / k.docs.length} />
          </div>
        }
      />
      <SearchInput value={q} onChange={setQ} placeholder="Search designs…" className="mb-6 w-full sm:w-80" />
      {groups.map(([g, items]) => (
        <section key={g} className="mb-8">
          <h2 className="mb-3 text-sm font-semibold text-muted">{g}</h2>
          <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
            {items.map((d) => {
              const isRead = Boolean(read[keyOf(k.section, d.id)])
              return (
                <Link key={d.id} to={`${k.base}/${d.id}`} className="group">
                  <Card className="flex h-full flex-col p-4 transition-all group-hover:-translate-y-0.5 group-hover:border-accent/50">
                    <div className="mb-2 flex items-start justify-between gap-2">
                      <h3 className="font-semibold group-hover:text-accent">{d.title}</h3>
                      {isRead ? <Check size={16} className="shrink-0 text-ok" /> : <DifficultyBadge d={d.difficulty} />}
                    </div>
                    <p className="mb-3 line-clamp-3 flex-1 text-[13px] text-muted">{d.summary}</p>
                    <div className="flex flex-wrap items-center gap-1.5">
                      {d.tags.slice(0, 4).map((t) => (
                        <span key={t} className="rounded-md bg-subtle px-1.5 py-0.5 text-[11px] text-muted">
                          {t}
                        </span>
                      ))}
                      {(d.widgets?.length ?? 0) > 0 && (
                        <Badge tone="accent" className="ml-auto">
                          <Sparkles size={10} /> interactive
                        </Badge>
                      )}
                    </div>
                  </Card>
                </Link>
              )
            })}
          </div>
        </section>
      ))}
    </Page>
  )
}

function FollowUp({ q, a }: { q: string; a: string }) {
  const [open, setOpen] = useState(false)
  return (
    <div className="overflow-hidden rounded-xl border border-line bg-panel">
      <button onClick={() => setOpen(!open)} className="flex w-full items-start gap-3 px-4 py-3 text-left text-sm font-medium hover:bg-subtle/50">
        <MessageCircleQuestion size={16} className="mt-0.5 shrink-0 text-accent" />
        <span className="flex-1">{q}</span>
        <ChevronDown size={16} className={cn('mt-0.5 shrink-0 text-faint transition-transform', open && 'rotate-180')} />
      </button>
      {open && (
        <div className="animate-fade-in border-t border-line px-4 py-3 pl-11">
          <Markdown compact>{a}</Markdown>
        </div>
      )}
    </div>
  )
}

const DIAGRAM_ANCHOR = /high-level|architecture|system overview|serving|pipeline|design overview/i

export function DesignDocPage({ kind }: { kind: 'sd' | 'mlsd' }) {
  const k = KINDS[kind]
  const { id = '' } = useParams()
  const doc = k.byId.get(id)
  const key = keyOf(k.section, id)
  const isRead = useStore((s) => Boolean(s.read[key]))
  const { markRead, visit } = useStore.getState()
  const [active, setActive] = useState('')

  useEffect(() => {
    if (doc) visit(key)
    document.querySelector('main')?.scrollTo({ top: 0 })
  }, [doc, key, visit])

  const anchorIdx = useMemo(() => {
    if (!doc) return 0
    const i = doc.sections.findIndex((s) => DIAGRAM_ANCHOR.test(s.title))
    return i >= 0 ? i : 0
  }, [doc])

  const toc = useMemo(() => {
    if (!doc) return []
    const items = doc.sections.map((s) => ({ id: slugify(s.title), title: s.title }))
    if (doc.widgets?.length) items.push({ id: 'interactive', title: 'Interactive lab' })
    if (doc.followUps.length) items.push({ id: 'follow-ups', title: 'Interviewer follow-ups' })
    if (doc.resources.length) items.push({ id: 'resources', title: 'Further reading' })
    return items
  }, [doc])

  useEffect(() => {
    const main = document.querySelector('main')
    if (!main) return
    const onScroll = () => {
      let cur = toc[0]?.id ?? ''
      for (const t of toc) {
        const el = document.getElementById(t.id)
        if (el && el.getBoundingClientRect().top < 140) cur = t.id
      }
      setActive(cur)
    }
    main.addEventListener('scroll', onScroll, { passive: true })
    onScroll()
    return () => main.removeEventListener('scroll', onScroll)
  }, [toc])

  if (!doc) return <div className="p-10 text-muted">Document not found.</div>
  const idx = k.docs.findIndex((d) => d.id === id)
  const prev = k.docs[idx - 1]
  const next = k.docs[idx + 1]

  return (
    <Page wide>
      <Link to={k.base} className="mb-4 inline-flex items-center gap-1 text-xs text-muted hover:text-fg">
        <ArrowLeft size={14} /> {k.title}
      </Link>
      <div className="mb-6 flex flex-wrap items-start justify-between gap-4">
        <div className="max-w-3xl">
          <div className="mb-2 flex flex-wrap items-center gap-2">
            <Badge tone="accent">{doc.category}</Badge>
            <DifficultyBadge d={doc.difficulty} />
            {doc.tags.map((t) => (
              <Badge key={t}>{t}</Badge>
            ))}
          </div>
          <h1 className="text-3xl font-semibold tracking-tight">{doc.title}</h1>
          <p className="mt-2 text-muted">{doc.summary}</p>
        </div>
        <Button variant={isRead ? 'secondary' : 'primary'} onClick={() => markRead(key, !isRead)}>
          {isRead ? <Check size={15} className="text-ok" /> : <BookOpenCheck size={15} />}
          {isRead ? 'Studied' : 'Mark as studied'}
        </Button>
      </div>

      <div className="flex gap-8">
        <aside className="sticky top-4 hidden h-fit max-h-[calc(100vh-8rem)] w-56 shrink-0 overflow-y-auto lg:block">
          <div className="mb-2 text-[11px] font-medium tracking-wider text-faint uppercase">On this page</div>
          <nav className="space-y-0.5 border-l border-line">
            {toc.map((t) => (
              <a
                key={t.id}
                href={`#${t.id}`}
                onClick={(e) => {
                  e.preventDefault()
                  document.getElementById(t.id)?.scrollIntoView({ behavior: 'smooth', block: 'start' })
                }}
                className={cn('-ml-px block border-l py-1 pl-3 text-[12.5px] transition-colors', active === t.id ? 'border-accent text-accent' : 'border-transparent text-muted hover:text-fg')}
              >
                {t.title}
              </a>
            ))}
          </nav>
        </aside>

        <article className="min-w-0 max-w-4xl flex-1">
          {doc.sections.map((s, i) => (
            <Fragment key={i}>
              <section id={slugify(s.title)} className="mb-10 scroll-mt-6">
                <h2 className="mb-3 text-xl font-semibold tracking-tight">{s.title}</h2>
                <Markdown>{s.body}</Markdown>
              </section>
              {i === anchorIdx && doc.diagrams.length > 0 && (
                <div className="mb-10 space-y-4">
                  {doc.diagrams.map((d, j) => (
                    <Diagram key={j} diagram={d} height={Math.max(360, (Math.max(...d.nodes.map((n) => n.row)) + 1) * 105 + 80)} />
                  ))}
                </div>
              )}
            </Fragment>
          ))}

          {doc.widgets && doc.widgets.length > 0 && (
            <section id="interactive" className="mb-10 scroll-mt-6">
              <h2 className="mb-1 text-xl font-semibold tracking-tight">Interactive lab</h2>
              <p className="mb-4 text-sm text-muted">Build intuition by playing with the mechanics discussed above.</p>
              <div className="space-y-6">
                {doc.widgets.filter((w) => widgetById[w]).map((w) => (
                  <Widget key={w} id={w} />
                ))}
              </div>
            </section>
          )}

          {doc.followUps.length > 0 && (
            <section id="follow-ups" className="mb-10 scroll-mt-6">
              <h2 className="mb-1 text-xl font-semibold tracking-tight">Interviewer follow-ups</h2>
              <p className="mb-4 text-sm text-muted">Answer out loud first, then expand to compare with a model answer.</p>
              <div className="space-y-2">
                {doc.followUps.map((f, i) => (
                  <FollowUp key={i} q={f.q} a={f.a} />
                ))}
              </div>
            </section>
          )}

          {doc.resources.length > 0 && (
            <section id="resources" className="mb-10 scroll-mt-6">
              <h2 className="mb-3 text-xl font-semibold tracking-tight">Further reading</h2>
              <div className="grid gap-2 sm:grid-cols-2">
                {doc.resources.map((r, i) => (
                  <a key={i} href={r.url} target="_blank" rel="noreferrer" className="group flex items-center gap-3 rounded-xl border border-line bg-panel px-3 py-2.5 text-sm transition hover:border-accent/50">
                    <ExternalLink size={14} className="shrink-0 text-faint group-hover:text-accent" />
                    <span className="min-w-0 flex-1 truncate">{r.title}</span>
                    {r.type && <Badge>{r.type}</Badge>}
                  </a>
                ))}
              </div>
            </section>
          )}

          <div className="flex items-center justify-between border-t border-line pt-6">
            {prev ? (
              <Link to={`${k.base}/${prev.id}`} className="text-sm text-muted hover:text-accent">
                ← {prev.title}
              </Link>
            ) : (
              <span />
            )}
            {next && (
              <Link to={`${k.base}/${next.id}`} className="text-sm text-muted hover:text-accent">
                {next.title} →
              </Link>
            )}
          </div>
        </article>
      </div>
    </Page>
  )
}
