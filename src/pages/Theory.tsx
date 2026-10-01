import { ArrowLeft, BookOpenCheck, Brain, Check, ExternalLink, FileText, Layers, ListChecks, Sparkles } from 'lucide-react'
import { useEffect, useMemo, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { Page } from '../components/Layout'
import Markdown, { slugify } from '../components/Markdown'
import { FlashcardDeck, Quiz, type DeckCard } from '../components/Study'
import Widget from '../components/Widget'
import { Badge, Button, Card, PageHeader, ProgressBar, SearchInput, Segmented, Tabs, cn } from '../components/ui'
import { groupBy, theoryById, theoryTopics } from '../data'
import { keyOf, useStore } from '../store/progress'
import type { TheoryTopic } from '../types/content'
import { widgetById } from '../viz/registry'

export const cardId = (topicId: string, i: number) => `${topicId}#${i}`

export function allCards(): DeckCard[] {
  return theoryTopics.flatMap((t) => t.flashcards.map((c, i) => ({ ...c, id: cardId(t.id, i), topic: t.title })))
}

export function TheoryList() {
  const read = useStore((s) => s.read)
  const quizzes = useStore((s) => s.quizzes)
  const cards = useStore((s) => s.cards)
  const [q, setQ] = useState('')
  const topics = theoryTopics.filter((t) => `${t.title} ${t.summary} ${t.category}`.toLowerCase().includes(q.toLowerCase()))
  const totalCards = theoryTopics.reduce((s, t) => s + t.flashcards.length, 0)
  const totalQuiz = theoryTopics.reduce((s, t) => s + t.quiz.length, 0)
  const readN = theoryTopics.filter((t) => read[keyOf('theory', t.id)]).length
  const now = Date.now()
  const due = allCards().filter((c) => cards[c.id] && cards[c.id].due <= now).length

  return (
    <Page wide>
      <PageHeader
        icon={<Brain size={20} />}
        title="ML Theory"
        subtitle={`${theoryTopics.length} topics from probability to LLM inference — long-form notes with math, interactive visualizations, ${totalCards} spaced-repetition flashcards and ${totalQuiz} quiz questions.`}
        actions={
          <Link to="/review">
            <Button variant="primary">
              <Layers size={15} /> Review flashcards {due > 0 && <span className="rounded-full bg-white/25 px-1.5 text-[11px]">{due} due</span>}
            </Button>
          </Link>
        }
      />
      <div className="mb-6 flex flex-wrap items-center gap-4">
        <SearchInput value={q} onChange={setQ} placeholder="Search topics…" className="w-full sm:w-80" />
        <div className="flex w-56 flex-col gap-1 text-xs text-muted">
          <span>
            {readN}/{theoryTopics.length} topics studied
          </span>
          <ProgressBar value={readN / theoryTopics.length} />
        </div>
      </div>
      {groupBy(topics, (t) => t.category).map(([g, items]) => (
        <section key={g} className="mb-8">
          <h2 className="mb-3 text-sm font-semibold text-muted">{g}</h2>
          <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
            {items.map((t) => {
              const isRead = Boolean(read[keyOf('theory', t.id)])
              const qz = quizzes[t.id]
              const seen = t.flashcards.filter((_, i) => cards[cardId(t.id, i)]).length
              return (
                <Link key={t.id} to={`/theory/${t.id}`} className="group">
                  <Card className="flex h-full flex-col p-4 transition-all group-hover:-translate-y-0.5 group-hover:border-accent/50">
                    <div className="mb-2 flex items-start justify-between gap-2">
                      <h3 className="font-semibold group-hover:text-accent">{t.title}</h3>
                      {isRead && <Check size={16} className="shrink-0 text-ok" />}
                    </div>
                    <p className="mb-3 line-clamp-2 flex-1 text-[13px] text-muted">{t.summary}</p>
                    <div className="flex flex-wrap items-center gap-3 text-[11px] text-muted">
                      <span className="inline-flex items-center gap-1">
                        <Layers size={12} /> {seen}/{t.flashcards.length} cards
                      </span>
                      <span className="inline-flex items-center gap-1">
                        <ListChecks size={12} /> {qz ? `best ${qz.best}/${qz.total}` : `${t.quiz.length} questions`}
                      </span>
                      {(t.widgets?.length ?? 0) > 0 && (
                        <span className="inline-flex items-center gap-1 text-accent">
                          <Sparkles size={12} /> {t.widgets!.length}
                        </span>
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

type Tab = 'notes' | 'interactive' | 'flashcards' | 'quiz'

function NotesView({ t }: { t: TheoryTopic }) {
  const headings = useMemo(() => [...t.notes.matchAll(/^##\s+(.+)$/gm)].map((m) => m[1].replace(/[*`_]/g, '').trim()), [t])
  return (
    <div className="flex gap-8">
      {headings.length > 2 && (
        <aside className="sticky top-4 hidden h-fit max-h-[calc(100vh-10rem)] w-52 shrink-0 overflow-y-auto lg:block">
          <div className="mb-2 text-[11px] font-medium tracking-wider text-faint uppercase">Contents</div>
          <nav className="space-y-0.5 border-l border-line">
            {headings.map((h) => (
              <a
                key={h}
                href={`#${slugify(h)}`}
                onClick={(e) => {
                  e.preventDefault()
                  document.getElementById(slugify(h))?.scrollIntoView({ behavior: 'smooth', block: 'start' })
                }}
                className="-ml-px block border-l border-transparent py-1 pl-3 text-[12.5px] text-muted hover:border-line-strong hover:text-fg"
              >
                {h}
              </a>
            ))}
          </nav>
        </aside>
      )}
      <article className="min-w-0 max-w-4xl flex-1">
        <Markdown>{t.notes}</Markdown>
        {t.resources.length > 0 && (
          <div className="mt-10 border-t border-line pt-6">
            <h2 className="mb-3 text-lg font-semibold">Further reading</h2>
            <div className="grid gap-2 sm:grid-cols-2">
              {t.resources.map((r, i) => (
                <a key={i} href={r.url} target="_blank" rel="noreferrer" className="group flex items-center gap-3 rounded-xl border border-line bg-panel px-3 py-2.5 text-sm transition hover:border-accent/50">
                  <ExternalLink size={14} className="shrink-0 text-faint group-hover:text-accent" />
                  <span className="min-w-0 flex-1 truncate">{r.title}</span>
                  {r.type && <Badge>{r.type}</Badge>}
                </a>
              ))}
            </div>
          </div>
        )}
      </article>
    </div>
  )
}

export function TheoryTopicPage() {
  const { id = '' } = useParams()
  const t = theoryById.get(id)
  const key = keyOf('theory', id)
  const isRead = useStore((s) => Boolean(s.read[key]))
  const cardsState = useStore((s) => s.cards)
  const { markRead, visit } = useStore.getState()
  const [tab, setTab] = useState<Tab>('notes')
  const [deckMode, setDeckMode] = useState<'all' | 'due'>('all')

  useEffect(() => {
    if (t) visit(key)
    setTab('notes')
    document.querySelector('main')?.scrollTo({ top: 0 })
  }, [t, key, visit])

  const deck = useMemo<DeckCard[]>(() => {
    if (!t) return []
    const all = t.flashcards.map((c, i) => ({ ...c, id: cardId(t.id, i), topic: t.title }))
    if (deckMode === 'all') return all
    const now = Date.now()
    return all.filter((c) => !cardsState[c.id] || cardsState[c.id].due <= now)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [t, deckMode])

  if (!t) return <div className="p-10 text-muted">Topic not found.</div>
  const idx = theoryTopics.findIndex((x) => x.id === id)
  const prev = theoryTopics[idx - 1]
  const next = theoryTopics[idx + 1]
  const widgets = (t.widgets ?? []).filter((w) => widgetById[w])

  return (
    <Page wide>
      <Link to="/theory" className="mb-4 inline-flex items-center gap-1 text-xs text-muted hover:text-fg">
        <ArrowLeft size={14} /> ML Theory
      </Link>
      <div className="mb-5 flex flex-wrap items-start justify-between gap-4">
        <div className="max-w-3xl">
          <Badge tone="accent" className="mb-2">
            {t.category}
          </Badge>
          <h1 className="text-3xl font-semibold tracking-tight">{t.title}</h1>
          <p className="mt-2 text-muted">{t.summary}</p>
        </div>
        <Button variant={isRead ? 'secondary' : 'primary'} onClick={() => markRead(key, !isRead)}>
          {isRead ? <Check size={15} className="text-ok" /> : <BookOpenCheck size={15} />}
          {isRead ? 'Studied' : 'Mark as studied'}
        </Button>
      </div>
      <div className="sticky top-0 z-10 -mx-6 mb-6 border-b border-line bg-bg/85 px-6 py-2 backdrop-blur">
        <Tabs
          value={tab}
          onChange={setTab}
          items={[
            { id: 'notes', label: 'Notes', icon: <FileText size={14} /> },
            ...(widgets.length ? [{ id: 'interactive' as const, label: 'Interactive', icon: <Sparkles size={14} />, badge: <span className="ml-1 text-[11px] text-faint">{widgets.length}</span> }] : []),
            { id: 'flashcards', label: 'Flashcards', icon: <Layers size={14} />, badge: <span className="ml-1 text-[11px] text-faint">{t.flashcards.length}</span> },
            { id: 'quiz', label: 'Quiz', icon: <ListChecks size={14} />, badge: <span className="ml-1 text-[11px] text-faint">{t.quiz.length}</span> },
          ]}
        />
      </div>

      {tab === 'notes' && <NotesView t={t} />}
      {tab === 'interactive' && (
        <div className="space-y-6">
          {widgets.map((w) => (
            <Widget key={w} id={w} />
          ))}
        </div>
      )}
      {tab === 'flashcards' && (
        <div className="mx-auto max-w-2xl">
          <div className="mb-4 flex items-center justify-between">
            <Segmented
              options={[
                { value: 'all', label: 'All cards' },
                { value: 'due', label: 'Due & new only' },
              ]}
              value={deckMode}
              onChange={setDeckMode}
            />
            <span className="text-xs text-muted">Space flips · 1–4 grades</span>
          </div>
          <FlashcardDeck cards={deck} />
        </div>
      )}
      {tab === 'quiz' && (
        <div className="mx-auto max-w-2xl">
          <Quiz topicId={t.id} questions={t.quiz} />
        </div>
      )}

      <div className={cn('mt-10 flex items-center justify-between border-t border-line pt-6')}>
        {prev ? (
          <Link to={`/theory/${prev.id}`} className="text-sm text-muted hover:text-accent">
            ← {prev.title}
          </Link>
        ) : (
          <span />
        )}
        {next && (
          <Link to={`/theory/${next.id}`} className="text-sm text-muted hover:text-accent">
            {next.title} →
          </Link>
        )}
      </div>
    </Page>
  )
}
