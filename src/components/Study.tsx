import { AnimatePresence, motion } from 'framer-motion'
import { Check, CheckCircle2, RotateCcw, Shuffle, Trophy, X, XCircle } from 'lucide-react'
import { useEffect, useMemo, useState } from 'react'
import { useStore } from '../store/progress'
import type { Flashcard, QuizQuestion } from '../types/content'
import Markdown from './Markdown'
import { Button, Card, Kbd, ProgressBar, cn } from './ui'

export interface DeckCard extends Flashcard {
  id: string
  topic?: string
}

const shuffle = <T,>(a: T[]) => {
  const b = [...a]
  for (let i = b.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[b[i], b[j]] = [b[j], b[i]]
  }
  return b
}

const GRADES = [
  { g: 0 as const, label: 'Again', key: '1', cls: 'border-err/40 text-err hover:bg-err/10' },
  { g: 1 as const, label: 'Hard', key: '2', cls: 'border-warn/40 text-warn hover:bg-warn/10' },
  { g: 2 as const, label: 'Good', key: '3', cls: 'border-ok/40 text-ok hover:bg-ok/10' },
  { g: 3 as const, label: 'Easy', key: '4', cls: 'border-info/40 text-info hover:bg-info/10' },
]

function nextLabel(interval: number) {
  if (interval <= 0) return '<1d'
  if (interval < 30) return `${interval}d`
  return `${Math.round(interval / 30)}mo`
}

/** Spaced-repetition flashcard session (SM-2 style). */
export function FlashcardDeck({ cards, emptyText = 'No cards to review right now. 🎉' }: { cards: DeckCard[]; emptyText?: string }) {
  const states = useStore((s) => s.cards)
  const review = useStore((s) => s.reviewCard)
  const [queue, setQueue] = useState<DeckCard[]>(() => cards)
  const [flipped, setFlipped] = useState(false)
  const [done, setDone] = useState(0)

  useEffect(() => {
    setQueue(cards)
    setDone(0)
    setFlipped(false)
  }, [cards])

  const card = queue[0]
  const grade = (g: 0 | 1 | 2 | 3) => {
    if (!card) return
    review(card.id, g)
    setFlipped(false)
    setDone((d) => d + 1)
    setQueue((q) => (g === 0 ? [...q.slice(1), q[0]] : q.slice(1)))
  }

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.target as HTMLElement)?.tagName === 'TEXTAREA' || (e.target as HTMLElement)?.tagName === 'INPUT') return
      if (e.key === ' ') {
        e.preventDefault()
        setFlipped((f) => !f)
      } else if (flipped && ['1', '2', '3', '4'].includes(e.key)) grade((Number(e.key) - 1) as 0 | 1 | 2 | 3)
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  })

  if (!card)
    return (
      <Card className="flex flex-col items-center gap-3 p-10 text-center">
        <Trophy size={32} className="text-warn" />
        <div className="font-semibold">{done > 0 ? `Session complete — ${done} reviews` : emptyText}</div>
        <Button size="sm" variant="outline" onClick={() => setQueue(shuffle(cards.length ? cards : []))} disabled={!cards.length}>
          <RotateCcw size={14} /> Study again
        </Button>
      </Card>
    )

  const st = states[card.id]
  const preview = (g: 0 | 1 | 2 | 3) => {
    const reps = (st?.reps ?? 0) + (g === 0 ? 0 : 1)
    if (g === 0) return '1m'
    const ease = st?.ease ?? 2.5
    const iv = reps === 1 ? (g === 3 ? 3 : 1) : reps === 2 ? (g === 3 ? 7 : 4) : Math.round((st?.interval ?? 1) * ease * (g === 1 ? 0.8 : g === 3 ? 1.3 : 1))
    return nextLabel(iv)
  }

  return (
    <div>
      <div className="mb-3 flex items-center gap-3 text-xs text-muted">
        <span>{queue.length} left</span>
        <ProgressBar value={done / Math.max(1, done + queue.length)} className="flex-1" />
        <button onClick={() => setQueue((q) => shuffle(q))} className="inline-flex items-center gap-1 hover:text-fg" title="Shuffle">
          <Shuffle size={13} /> Shuffle
        </button>
      </div>
      <div className="[perspective:1600px]">
        <motion.div
          key={card.id + done}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0, rotateY: flipped ? 180 : 0 }}
          transition={{ duration: 0.35 }}
          className="relative min-h-72 cursor-pointer [transform-style:preserve-3d]"
          onClick={() => setFlipped((f) => !f)}
        >
          <Card className="absolute inset-0 flex flex-col p-6 [backface-visibility:hidden]">
            <div className="mb-2 flex items-center justify-between text-[11px] text-faint">
              <span>{card.topic ?? 'Question'}</span>
              <span>{st ? `seen ${st.reps}× · ease ${st.ease.toFixed(2)}` : 'new'}</span>
            </div>
            <div className="flex flex-1 items-center justify-center text-center text-lg font-medium">
              <Markdown className="[&_p]:m-0">{card.q}</Markdown>
            </div>
            <div className="text-center text-[11px] text-faint">
              Click or press <Kbd>Space</Kbd> to reveal
            </div>
          </Card>
          <Card className="absolute inset-0 flex flex-col overflow-y-auto p-6 [backface-visibility:hidden] [transform:rotateY(180deg)]">
            <div className="mb-2 text-[11px] text-faint">Answer</div>
            <div className="flex-1">
              <Markdown compact>{card.a}</Markdown>
            </div>
          </Card>
        </motion.div>
      </div>
      <div className="mt-4 grid min-h-14 grid-cols-4 gap-2">
        {flipped ? (
          GRADES.map((g) => (
            <button key={g.g} onClick={() => grade(g.g)} className={cn('flex flex-col items-center rounded-xl border bg-panel py-2 text-sm font-medium transition', g.cls)}>
              {g.label}
              <span className="text-[10px] opacity-70">
                {preview(g.g)} · {g.key}
              </span>
            </button>
          ))
        ) : (
          <Button className="col-span-4 justify-center" variant="secondary" onClick={() => setFlipped(true)}>
            Show answer
          </Button>
        )}
      </div>
    </div>
  )
}

/** Multiple-choice quiz with explanations; records best score. */
export function Quiz({ topicId, questions }: { topicId: string; questions: QuizQuestion[] }) {
  const record = useStore((s) => s.recordQuiz)
  const best = useStore((s) => s.quizzes[topicId])
  const [order, setOrder] = useState(() => questions.map((_, i) => i))
  const [i, setI] = useState(0)
  const [picked, setPicked] = useState<number | null>(null)
  const [score, setScore] = useState(0)
  const [finished, setFinished] = useState(false)
  const [answers, setAnswers] = useState<boolean[]>([])

  const q = questions[order[i]]
  const restart = (shuffleIt: boolean) => {
    setOrder(shuffleIt ? shuffle(questions.map((_, k) => k)) : questions.map((_, k) => k))
    setI(0)
    setPicked(null)
    setScore(0)
    setFinished(false)
    setAnswers([])
  }

  const pick = (k: number) => {
    if (picked !== null) return
    setPicked(k)
    const ok = k === q.answer
    setAnswers((a) => [...a, ok])
    if (ok) setScore((s) => s + 1)
  }
  const next = () => {
    if (i + 1 >= questions.length) {
      setFinished(true)
      record(topicId, score, questions.length)
    } else {
      setI(i + 1)
      setPicked(null)
    }
  }

  const result = useMemo(() => (finished ? Math.round((score / questions.length) * 100) : 0), [finished, score, questions.length])

  if (!questions.length) return <div className="text-sm text-muted">No quiz for this topic.</div>
  if (finished)
    return (
      <Card className="flex flex-col items-center gap-3 p-10 text-center">
        <div className={cn('text-5xl font-semibold', result >= 80 ? 'text-ok' : result >= 50 ? 'text-warn' : 'text-err')}>{result}%</div>
        <div className="text-sm text-muted">
          {score} / {questions.length} correct{best ? ` · best ${best.best}/${best.total}` : ''}
        </div>
        <div className="flex gap-1">
          {answers.map((a, k) => (
            <span key={k} className={cn('h-2 w-5 rounded-full', a ? 'bg-ok' : 'bg-err')} />
          ))}
        </div>
        <div className="mt-2 flex gap-2">
          <Button size="sm" variant="outline" onClick={() => restart(false)}>
            <RotateCcw size={14} /> Retry
          </Button>
          <Button size="sm" variant="primary" onClick={() => restart(true)}>
            <Shuffle size={14} /> Shuffle & retry
          </Button>
        </div>
      </Card>
    )

  return (
    <div>
      <div className="mb-3 flex items-center gap-3 text-xs text-muted">
        <span>
          Question {i + 1} / {questions.length}
        </span>
        <ProgressBar value={i / questions.length} className="flex-1" />
        <span>Score {score}</span>
      </div>
      <AnimatePresence mode="wait">
        <motion.div key={order[i]} initial={{ opacity: 0, x: 16 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -16 }} transition={{ duration: 0.2 }}>
          <Card className="p-5">
            <div className="mb-4 text-[15px] font-medium">
              <Markdown className="[&_p]:m-0">{q.q}</Markdown>
            </div>
            <div className="space-y-2">
              {q.options.map((o, k) => {
                const isAns = k === q.answer
                const isPicked = k === picked
                return (
                  <button
                    key={k}
                    onClick={() => pick(k)}
                    disabled={picked !== null}
                    className={cn(
                      'flex w-full items-start gap-3 rounded-xl border px-4 py-3 text-left text-sm transition',
                      picked === null && 'border-line hover:border-accent/50 hover:bg-subtle',
                      picked !== null && isAns && 'border-ok/50 bg-ok/10',
                      picked !== null && isPicked && !isAns && 'border-err/50 bg-err/10',
                      picked !== null && !isAns && !isPicked && 'border-line opacity-60',
                    )}
                  >
                    <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full border border-line text-[11px] font-semibold">
                      {picked !== null && isAns ? <Check size={12} className="text-ok" /> : picked !== null && isPicked ? <X size={12} className="text-err" /> : String.fromCharCode(65 + k)}
                    </span>
                    <span className="flex-1">
                      <Markdown compact className="[&_p]:m-0">
                        {o}
                      </Markdown>
                    </span>
                  </button>
                )
              })}
            </div>
            {picked !== null && (
              <motion.div initial={{ opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }} className="mt-4 rounded-xl border border-line bg-subtle p-4">
                <div className={cn('mb-1 flex items-center gap-1.5 text-sm font-semibold', picked === q.answer ? 'text-ok' : 'text-err')}>
                  {picked === q.answer ? <CheckCircle2 size={15} /> : <XCircle size={15} />}
                  {picked === q.answer ? 'Correct' : 'Not quite'}
                </div>
                <Markdown compact>{q.explanation}</Markdown>
                <div className="mt-3 flex justify-end">
                  <Button size="sm" variant="primary" onClick={next}>
                    {i + 1 >= questions.length ? 'See results' : 'Next question'}
                  </Button>
                </div>
              </motion.div>
            )}
          </Card>
        </motion.div>
      </AnimatePresence>
    </div>
  )
}
