import { DSA_CATEGORIES, dsaProblems, mlProblems, mlsdDocs, sdDocs, sqlProblems, theoryTopics } from '../data'
import { keyOf } from '../store/progress'

export interface PlanItem {
  key: string
  to: string
  title: string
  kind: 'solve' | 'read'
}

export interface PlanTrack {
  id: string
  label: string
  color: string
  items: PlanItem[]
}

export interface PlanWeek {
  index: number
  focus: string
  tracks: PlanTrack[]
}

const TRACKS: { id: string; label: string; color: string; range: [number, number]; items: () => PlanItem[] }[] = [
  {
    id: 'dsa',
    label: 'DSA',
    color: 'var(--viz-1)',
    range: [0, 0.85],
    items: () =>
      DSA_CATEGORIES.flatMap((c) => dsaProblems.filter((p) => p.category === c.name)).map((p) => ({ key: keyOf('dsa', p.id), to: `/dsa/${p.id}`, title: `${p.title}`, kind: 'solve' as const })),
  },
  {
    id: 'theory',
    label: 'ML Theory',
    color: 'var(--viz-2)',
    range: [0, 0.75],
    items: () => theoryTopics.map((t) => ({ key: keyOf('theory', t.id), to: `/theory/${t.id}`, title: t.title, kind: 'read' as const })),
  },
  {
    id: 'sql',
    label: 'SQL',
    color: 'var(--viz-5)',
    range: [0.08, 0.6],
    items: () => sqlProblems.map((p) => ({ key: keyOf('sql', p.id), to: `/sql/${p.id}`, title: p.title, kind: 'solve' as const })),
  },
  {
    id: 'ml',
    label: 'ML Coding',
    color: 'var(--viz-3)',
    range: [0.2, 0.85],
    items: () => mlProblems.map((p) => ({ key: keyOf('ml', p.id), to: `/ml-coding/${p.id}`, title: p.title, kind: 'solve' as const })),
  },
  {
    id: 'sd',
    label: 'System Design',
    color: 'var(--viz-4)',
    range: [0.25, 0.92],
    items: () => sdDocs.map((d) => ({ key: keyOf('sd', d.id), to: `/system-design/${d.id}`, title: d.title, kind: 'read' as const })),
  },
  {
    id: 'mlsd',
    label: 'ML System Design',
    color: 'var(--viz-6)',
    range: [0.35, 1],
    items: () => mlsdDocs.map((d) => ({ key: keyOf('mlsd', d.id), to: `/ml-design/${d.id}`, title: d.title, kind: 'read' as const })),
  },
]

export function buildPlan(weeks: number): PlanWeek[] {
  const out: PlanWeek[] = Array.from({ length: weeks }, (_, i) => ({ index: i, focus: '', tracks: [] }))
  for (const t of TRACKS) {
    const items = t.items()
    const start = Math.floor(t.range[0] * weeks)
    const end = Math.max(start + 1, Math.round(t.range[1] * weeks))
    const span = end - start
    for (let w = 0; w < span; w++) {
      const a = Math.round((w * items.length) / span)
      const b = Math.round(((w + 1) * items.length) / span)
      const slice = items.slice(a, b)
      if (slice.length) out[start + w].tracks.push({ id: t.id, label: t.label, color: t.color, items: slice })
    }
  }
  for (const w of out) {
    const dsa = w.tracks.find((t) => t.id === 'dsa')
    const cats = dsa ? [...new Set(dsa.items.map((i) => dsaProblems.find((p) => keyOf('dsa', p.id) === i.key)?.category))].filter(Boolean) : []
    const other = w.tracks.filter((t) => t.id !== 'dsa').map((t) => t.label)
    w.focus = cats.length ? `${cats.slice(0, 2).join(' + ')}${other.length ? ` · ${other.slice(0, 2).join(', ')}` : ''}` : other.length ? other.join(', ') : 'Mock interviews & review'
  }
  if (weeks >= 4) out[weeks - 1].focus = 'Mock interviews, weak-area review & ML design'
  return out
}
