import type { DesignDoc, DsaCategory, DsaProblem, MlCodingProblem, SqlProblem, TheoryTopic } from '../types/content'

type Mod<T> = { default: T[] }
const flat = <T,>(mods: Record<string, Mod<T>>): T[] =>
  Object.keys(mods)
    .sort()
    .flatMap((k) => mods[k].default ?? [])

export const DSA_CATEGORIES: { name: DsaCategory; slug: string; blurb: string; deps: DsaCategory[] }[] = [
  { name: 'Arrays & Hashing', slug: 'arrays-hashing', blurb: 'Hash maps / sets for O(1) lookup, counting, prefix products, bucketing.', deps: [] },
  { name: 'Two Pointers', slug: 'two-pointers', blurb: 'Converging or same-direction pointers over sorted / symmetric data.', deps: ['Arrays & Hashing'] },
  { name: 'Stack', slug: 'stack', blurb: 'LIFO for matching, expression evaluation and monotonic-stack “next greater” problems.', deps: ['Arrays & Hashing'] },
  { name: 'Binary Search', slug: 'binary-search', blurb: 'Halve the search space on sorted data or on a monotonic answer space.', deps: ['Two Pointers'] },
  { name: 'Sliding Window', slug: 'sliding-window', blurb: 'Grow / shrink a contiguous window while maintaining an invariant.', deps: ['Two Pointers'] },
  { name: 'Linked List', slug: 'linked-list', blurb: 'Pointer surgery, dummy heads, fast & slow pointers.', deps: ['Two Pointers'] },
  { name: 'Trees', slug: 'trees', blurb: 'DFS (pre/in/post-order) and BFS; return values bubble up the recursion.', deps: ['Binary Search', 'Linked List'] },
  { name: 'Tries', slug: 'tries', blurb: 'Prefix trees for word / prefix queries.', deps: ['Trees'] },
  { name: 'Heap / Priority Queue', slug: 'heap', blurb: 'Top-K, streaming medians, scheduling by priority.', deps: ['Trees'] },
  { name: 'Backtracking', slug: 'backtracking', blurb: 'Choose → explore → un-choose to enumerate combinations, permutations, boards.', deps: ['Trees'] },
  { name: 'Intervals', slug: 'intervals', blurb: 'Sort by start (or end) and sweep; overlaps and merging.', deps: ['Heap / Priority Queue'] },
  { name: 'Greedy', slug: 'greedy', blurb: 'Locally optimal choices with an exchange-argument proof.', deps: ['Heap / Priority Queue'] },
  { name: 'Advanced Graphs', slug: 'advanced-graphs', blurb: 'Dijkstra, Bellman-Ford, MST (Prim / Kruskal), topological sort variants.', deps: ['Heap / Priority Queue', 'Graphs'] },
  { name: 'Graphs', slug: 'graphs', blurb: 'BFS / DFS on grids and adjacency lists, union-find, cycle detection.', deps: ['Backtracking'] },
  { name: '1-D Dynamic Programming', slug: 'dp-1d', blurb: 'Overlapping sub-problems over a single index: define state, recurrence, base case.', deps: ['Backtracking'] },
  { name: '2-D Dynamic Programming', slug: 'dp-2d', blurb: 'Grid / two-sequence DP: LCS, edit distance, knapsack variants.', deps: ['Graphs', '1-D Dynamic Programming'] },
  { name: 'Bit Manipulation', slug: 'bit-manipulation', blurb: 'XOR tricks, masks, shifts, two’s complement.', deps: ['1-D Dynamic Programming'] },
  { name: 'Math & Geometry', slug: 'math-geometry', blurb: 'Matrix traversal / rotation, number theory, simulation.', deps: ['Graphs', 'Bit Manipulation'] },
]

const catOrder = new Map(DSA_CATEGORIES.map((c, i) => [c.name, i]))

export const dsaProblems: DsaProblem[] = flat(import.meta.glob<Mod<DsaProblem>>('./dsa/*.ts', { eager: true })).sort(
  (a, b) => (catOrder.get(a.category) ?? 99) - (catOrder.get(b.category) ?? 99),
)
export const sqlProblems: SqlProblem[] = flat(import.meta.glob<Mod<SqlProblem>>('./sql/*.ts', { eager: true }))
export const mlProblems: MlCodingProblem[] = flat(import.meta.glob<Mod<MlCodingProblem>>('./mlcoding/*.ts', { eager: true }))
export const sdDocs: DesignDoc[] = flat(import.meta.glob<Mod<DesignDoc>>('./systemDesign/*.ts', { eager: true }))
export const mlsdDocs: DesignDoc[] = flat(import.meta.glob<Mod<DesignDoc>>('./mlDesign/*.ts', { eager: true }))
export const theoryTopics: TheoryTopic[] = flat(import.meta.glob<Mod<TheoryTopic>>('./theory/*.ts', { eager: true }))

const order = (arr: string[]) => (a: string) => {
  const i = arr.indexOf(a)
  return i < 0 ? 99 : i
}
const SQL_ORDER = order(['Select & Filter', 'Joins', 'Aggregation', 'Window Functions', 'Product & ML Analytics'])
sqlProblems.sort((a, b) => SQL_ORDER(a.category) - SQL_ORDER(b.category))
const ML_ORDER = order(['Fundamentals', 'Classical ML', 'Deep Learning', 'Evaluation & NLP'])
mlProblems.sort((a, b) => ML_ORDER(a.category) - ML_ORDER(b.category))
const TH_ORDER = order(['Math & Statistics', 'Classical ML', 'ML in Practice', 'Deep Learning', 'NLP & LLMs', 'Applied ML'])
theoryTopics.sort((a, b) => TH_ORDER(a.category) - TH_ORDER(b.category))
sdDocs.sort((a, b) => (a.category === b.category ? 0 : a.category === 'Fundamentals' ? -1 : 1))
mlsdDocs.sort((a, b) => (a.category === b.category ? 0 : a.category === 'Foundations' ? -1 : b.category === 'Foundations' ? 1 : 0))

export const dsaById = new Map(dsaProblems.map((p) => [p.id, p]))
export const sqlById = new Map(sqlProblems.map((p) => [p.id, p]))
export const mlById = new Map(mlProblems.map((p) => [p.id, p]))
export const sdById = new Map(sdDocs.map((p) => [p.id, p]))
export const mlsdById = new Map(mlsdDocs.map((p) => [p.id, p]))
export const theoryById = new Map(theoryTopics.map((p) => [p.id, p]))

export function groupBy<T>(items: T[], key: (t: T) => string): [string, T[]][] {
  const m = new Map<string, T[]>()
  for (const it of items) {
    const k = key(it)
    if (!m.has(k)) m.set(k, [])
    m.get(k)!.push(it)
  }
  return [...m.entries()]
}

export const leetcodeUrl = (id: string) => `https://leetcode.com/problems/${id}/`
export const videoUrl = (title: string) => `https://www.youtube.com/results?search_query=${encodeURIComponent(`neetcode ${title} leetcode`)}`
