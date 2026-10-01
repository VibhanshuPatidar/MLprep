import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { Language } from '../judge/types'

export type Status = 'todo' | 'attempted' | 'solved'
export type Section = 'dsa' | 'sql' | 'ml' | 'sd' | 'mlsd' | 'theory'

export interface ProblemProgress {
  status: Status
  attempts: number
  solvedAt?: number
  lastAt?: number
  bestMs?: number
  langs?: string[]
}

export interface CardState {
  /** SM-2 style */
  ease: number
  interval: number
  reps: number
  due: number
  lapses: number
}

export interface QuizState {
  best: number
  last: number
  total: number
  attempts: number
}

export type Theme = 'dark' | 'light'

export interface MockRecord {
  id: string
  kind: string
  at: number
  minutes: number
  items: string[]
  score: number
  maxScore: number
  notes?: string
}

interface Settings {
  theme: Theme
  defaultLang: Language
  fontSize: number
  minimap: boolean
  wordWrap: boolean
  sidebarCollapsed: boolean
  targetDate?: string
  planStart?: string
  planWeeks: 8 | 12 | 16
  dailyGoal: number
}

interface State {
  progress: Record<string, ProblemProgress>
  code: Record<string, string>
  notes: Record<string, string>
  bookmarks: Record<string, true>
  read: Record<string, number>
  cards: Record<string, CardState>
  quizzes: Record<string, QuizState>
  activity: Record<string, number>
  plan: Record<string, true>
  recent: string[]
  mocks: MockRecord[]
  settings: Settings

  markAttempt: (key: string, lang?: string) => void
  markSolved: (key: string, lang?: string, ms?: number) => void
  setStatus: (key: string, status: Status) => void
  saveCode: (key: string, lang: string, code: string) => void
  clearCode: (key: string, lang: string) => void
  setNote: (key: string, note: string) => void
  toggleBookmark: (key: string) => void
  markRead: (key: string, read?: boolean) => void
  reviewCard: (id: string, grade: 0 | 1 | 2 | 3) => void
  recordQuiz: (topicId: string, score: number, total: number) => void
  togglePlan: (id: string) => void
  visit: (key: string) => void
  addMock: (m: MockRecord) => void
  bump: () => void
  setSettings: (s: Partial<Settings>) => void
  importState: (json: string) => void
  reset: () => void
}

export const today = () => {
  const d = new Date()
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
}

const DAY = 24 * 3600 * 1000

const initial = {
  progress: {},
  code: {},
  notes: {},
  bookmarks: {},
  read: {},
  cards: {},
  quizzes: {},
  activity: {},
  plan: {},
  recent: [] as string[],
  mocks: [] as MockRecord[],
  settings: {
    theme: 'dark' as Theme,
    defaultLang: 'python' as Language,
    fontSize: 14,
    minimap: false,
    wordWrap: false,
    sidebarCollapsed: false,
    planWeeks: 12 as const,
    dailyGoal: 3,
  },
}

export const useStore = create<State>()(
  persist(
    (set, get) => ({
      ...initial,
      bump: () => set((s) => ({ activity: { ...s.activity, [today()]: (s.activity[today()] ?? 0) + 1 } })),
      markAttempt: (key, lang) =>
        set((s) => {
          const p = s.progress[key] ?? { status: 'todo', attempts: 0 }
          return {
            progress: {
              ...s.progress,
              [key]: { ...p, status: p.status === 'solved' ? 'solved' : 'attempted', attempts: p.attempts + 1, lastAt: Date.now(), langs: lang ? Array.from(new Set([...(p.langs ?? []), lang])) : p.langs },
            },
          }
        }),
      markSolved: (key, lang, ms) => {
        const wasSolved = get().progress[key]?.status === 'solved'
        set((s) => {
          const p = s.progress[key] ?? { status: 'todo', attempts: 0 }
          return {
            progress: {
              ...s.progress,
              [key]: {
                ...p,
                status: 'solved',
                solvedAt: p.solvedAt ?? Date.now(),
                lastAt: Date.now(),
                bestMs: ms !== undefined ? Math.min(ms, p.bestMs ?? Infinity) : p.bestMs,
                langs: lang ? Array.from(new Set([...(p.langs ?? []), lang])) : p.langs,
              },
            },
          }
        })
        if (!wasSolved) get().bump()
      },
      setStatus: (key, status) =>
        set((s) => ({ progress: { ...s.progress, [key]: { ...(s.progress[key] ?? { attempts: 0 }), status, solvedAt: status === 'solved' ? Date.now() : undefined } } })),
      saveCode: (key, lang, code) => set((s) => ({ code: { ...s.code, [`${key}:${lang}`]: code } })),
      clearCode: (key, lang) =>
        set((s) => {
          const c = { ...s.code }
          delete c[`${key}:${lang}`]
          return { code: c }
        }),
      setNote: (key, note) => set((s) => ({ notes: { ...s.notes, [key]: note } })),
      toggleBookmark: (key) =>
        set((s) => {
          const b = { ...s.bookmarks }
          if (b[key]) delete b[key]
          else b[key] = true
          return { bookmarks: b }
        }),
      markRead: (key, read = true) => {
        const was = Boolean(get().read[key])
        set((s) => {
          const r = { ...s.read }
          if (read) r[key] = Date.now()
          else delete r[key]
          return { read: r }
        })
        if (read && !was) get().bump()
      },
      reviewCard: (id, grade) => {
        set((s) => {
          const c = s.cards[id] ?? { ease: 2.5, interval: 0, reps: 0, due: 0, lapses: 0 }
          let { ease, interval, reps, lapses } = c
          if (grade === 0) {
            reps = 0
            interval = 0
            lapses += 1
            ease = Math.max(1.3, ease - 0.2)
          } else {
            reps += 1
            const q = grade === 1 ? 3 : grade === 2 ? 4 : 5
            ease = Math.max(1.3, ease + (0.1 - (5 - q) * (0.08 + (5 - q) * 0.02)))
            interval = reps === 1 ? (grade === 3 ? 3 : 1) : reps === 2 ? (grade === 3 ? 7 : 4) : Math.round(interval * ease * (grade === 1 ? 0.8 : grade === 3 ? 1.3 : 1))
          }
          const due = grade === 0 ? Date.now() + 60 * 1000 : Date.now() + interval * DAY
          return { cards: { ...s.cards, [id]: { ease, interval, reps, due, lapses } } }
        })
        get().bump()
      },
      recordQuiz: (topicId, score, total) => {
        set((s) => {
          const q = s.quizzes[topicId] ?? { best: 0, last: 0, total, attempts: 0 }
          return { quizzes: { ...s.quizzes, [topicId]: { best: Math.max(q.best, score), last: score, total, attempts: q.attempts + 1 } } }
        })
        get().bump()
      },
      togglePlan: (id) =>
        set((s) => {
          const p = { ...s.plan }
          if (p[id]) delete p[id]
          else p[id] = true
          return { plan: p }
        }),
      addMock: (m) => {
        set((s) => ({ mocks: [m, ...s.mocks].slice(0, 100) }))
        get().bump()
      },
      visit: (key) => set((s) => ({ recent: [key, ...s.recent.filter((k) => k !== key)].slice(0, 12) })),
      setSettings: (x) => set((s) => ({ settings: { ...s.settings, ...x } })),
      importState: (json) => {
        const data = JSON.parse(json)
        const st = data.state ?? data
        set((s) => ({ ...s, ...st, settings: { ...s.settings, ...(st.settings ?? {}) } }))
      },
      reset: () => set({ ...initial }),
    }),
    { name: 'prepml-v1', version: 1 },
  ),
)

export const keyOf = (section: Section, id: string) => `${section}:${id}`
