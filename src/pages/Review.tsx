import { Layers } from 'lucide-react'
import { useMemo, useState } from 'react'
import { Page } from '../components/Layout'
import { FlashcardDeck, type DeckCard } from '../components/Study'
import { Card, PageHeader, Segmented, Select, Stat } from '../components/ui'
import { theoryTopics } from '../data'
import { useStore } from '../store/progress'
import { allCards } from './Theory'

type Mode = 'due' | 'new' | 'all'

export default function Review() {
  const cards = useStore((s) => s.cards)
  const [mode, setMode] = useState<Mode>(() => {
    const st = useStore.getState().cards
    return Object.values(st).some((c) => c.due <= Date.now()) ? 'due' : 'new'
  })
  const [topic, setTopic] = useState('all')
  const [session, setSession] = useState(0)

  const all = useMemo(() => allCards(), [])
  const now = Date.now()
  const stats = useMemo(() => {
    const seen = all.filter((c) => cards[c.id])
    return {
      due: seen.filter((c) => cards[c.id].due <= now).length,
      newCount: all.length - seen.length,
      mature: seen.filter((c) => cards[c.id].interval >= 21).length,
      learning: seen.filter((c) => cards[c.id].interval < 21).length,
    }
  }, [all, cards, now])

  const deck: DeckCard[] = useMemo(() => {
    const pool = topic === 'all' ? all : all.filter((c) => c.id.startsWith(topic + '#'))
    const t = Date.now()
    let out: DeckCard[]
    if (mode === 'due') out = pool.filter((c) => cards[c.id] && cards[c.id].due <= t).sort((a, b) => cards[a.id].due - cards[b.id].due)
    else if (mode === 'new') out = pool.filter((c) => !cards[c.id]).slice(0, 20)
    else out = [...pool].sort(() => Math.random() - 0.5)
    return out
    // freeze the deck for a session; only rebuild when the user changes filters
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mode, topic, session, all])

  return (
    <Page>
      <PageHeader icon={<Layers size={20} />} title="Flashcard Review" subtitle="Spaced repetition across every ML theory topic. Grade yourself honestly — cards you miss come back sooner, cards you know drift out to weeks and months." />
      <div className="mb-6 grid grid-cols-2 gap-3 md:grid-cols-4">
        <Stat label="Due now" value={stats.due} />
        <Stat label="New" value={stats.newCount} />
        <Stat label="Learning" value={stats.learning} />
        <Stat label="Mature (≥21d)" value={stats.mature} />
      </div>
      <Card className="mb-5 flex flex-wrap items-center gap-3 p-3">
        <Segmented<Mode>
          options={[
            { value: 'due', label: `Due (${stats.due})` },
            { value: 'new', label: 'Learn new (20)' },
            { value: 'all', label: 'Cram all' },
          ]}
          value={mode}
          onChange={(m) => {
            setMode(m)
            setSession((s) => s + 1)
          }}
        />
        <Select
          value={topic}
          onChange={(v) => {
            setTopic(v)
            setSession((s) => s + 1)
          }}
          options={[{ value: 'all', label: 'All topics' }, ...theoryTopics.map((t) => ({ value: t.id, label: `${t.title} (${t.flashcards.length})` }))]}
          className="max-w-72"
        />
        <span className="ml-auto text-xs text-muted">Space flips · 1 Again · 2 Hard · 3 Good · 4 Easy</span>
      </Card>
      <div className="mx-auto max-w-2xl">
        <FlashcardDeck key={`${mode}-${topic}-${session}`} cards={deck} emptyText={mode === 'due' ? 'Nothing due. Learn some new cards!' : 'No cards here.'} />
      </div>
    </Page>
  )
}
