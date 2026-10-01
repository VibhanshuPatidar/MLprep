import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export type MockKind = 'coding' | 'sql' | 'ml-coding' | 'system-design' | 'ml-design' | 'theory'

export interface MockItem {
  key: string
  title: string
  to: string
  sub?: string
}

export interface MockSession {
  kind: MockKind
  startedAt: number
  minutes: number
  items: MockItem[]
  /** theory rapid-fire: card ids */
  cards?: string[]
}

interface S {
  session: MockSession | null
  start: (s: MockSession) => void
  stop: () => void
}

export const useMockSession = create<S>()(
  persist(
    (set) => ({
      session: null,
      start: (session) => set({ session }),
      stop: () => set({ session: null }),
    }),
    { name: 'prepml-mock-session' },
  ),
)
