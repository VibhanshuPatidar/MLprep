import type { CompareMode, Signature, TestCase } from '../judge/types'

export type Difficulty = 'Easy' | 'Medium' | 'Hard'

export interface Link {
  title: string
  url: string
  /** e.g. 'video' | 'article' | 'book' | 'course' | 'repo' | 'paper' | 'practice' */
  type?: string
}

/** Interactive widget ids (implemented in src/viz/registry.tsx) */
export type WidgetId =
  // DSA visualizers
  | 'sorting'
  | 'binary-search'
  | 'two-pointers'
  | 'sliding-window'
  | 'monotonic-stack'
  | 'linked-list'
  | 'tree-traversal'
  | 'heap'
  | 'backtracking'
  | 'trie'
  | 'graph-traversal'
  | 'dijkstra'
  | 'dp-grid'
  | 'union-find'
  | 'intervals'
  | 'bit-ops'
  // ML theory
  | 'gradient-descent'
  | 'bias-variance'
  | 'logistic-regression'
  | 'kmeans'
  | 'knn'
  | 'regularization'
  | 'roc-curve'
  | 'softmax-temperature'
  | 'attention'
  | 'activations'
  | 'nn-playground'
  | 'pca'
  | 'convolution'
  | 'decision-tree'
  | 'positional-encoding'
  | 'lr-schedule'
  // System design / ML system design
  | 'consistent-hashing'
  | 'rate-limiter'
  | 'lru-cache'
  | 'load-balancer'
  | 'capacity-estimator'
  | 'bloom-filter'
  | 'ab-test'
  | 'recsys-funnel'

export interface SolutionApproach {
  /** e.g. "Brute Force", "Hash Map (Optimal)" */
  title: string
  /** markdown explanation of the idea, step by step */
  explanation: string
  time: string
  space: string
  python: string
  cpp: string
}

export type DsaCategory =
  | 'Arrays & Hashing'
  | 'Two Pointers'
  | 'Sliding Window'
  | 'Stack'
  | 'Binary Search'
  | 'Linked List'
  | 'Trees'
  | 'Heap / Priority Queue'
  | 'Backtracking'
  | 'Tries'
  | 'Graphs'
  | 'Advanced Graphs'
  | '1-D Dynamic Programming'
  | '2-D Dynamic Programming'
  | 'Greedy'
  | 'Intervals'
  | 'Math & Geometry'
  | 'Bit Manipulation'

export interface DsaProblem {
  /** kebab-case slug matching LeetCode, e.g. "two-sum" */
  id: string
  title: string
  /** LeetCode problem number */
  number: number
  difficulty: Difficulty
  category: DsaCategory
  /** short pattern name e.g. "Hash Map", "Monotonic Stack" */
  pattern: string
  /** problem statement in ORIGINAL wording (markdown). Do not copy LeetCode text verbatim. */
  description: string
  examples: { input: string; output: string; explanation?: string }[]
  constraints: string[]
  /** progressive hints, from gentle nudge to near-solution */
  hints: string[]
  signature: Signature
  /** All tests. The first `sampleCount` are shown and used by "Run"; all are used by "Submit". */
  tests: TestCase[]
  sampleCount?: number
  compare?: CompareMode
  solutions: SolutionApproach[]
  /** optional visualizer shown in the Visualize tab */
  viz?: WidgetId
  /** extra links (LeetCode/NeetCode links are generated automatically from id) */
  links?: Link[]
}

export interface SqlProblem {
  id: string
  title: string
  difficulty: Difficulty
  category: string
  /** markdown, original wording */
  description: string
  /** CREATE TABLE statements (SQLite dialect) */
  schema: string
  /** INSERT statements; datasets[0] is shown as the example; all are used on submit */
  datasets: string[]
  /** if false, row order is ignored when judging */
  orderMatters: boolean
  /** reference solution (SQLite). Expected results are computed by running it. */
  solution: string
  explanation: string
  hints: string[]
  links?: Link[]
}

export interface MlCodingProblem {
  id: string
  title: string
  difficulty: Difficulty
  category: string
  /** markdown + KaTeX math ($...$ / $$...$$) */
  description: string
  starter: string
  solution: string
  explanation: string
  hints: string[]
  /** each test is python code executed after the user code; must raise AssertionError (with message) on failure */
  tests: { name: string; code: string; hidden?: boolean }[]
  /** optional code run before user code (e.g. dataset helpers) */
  setup?: string
  viz?: WidgetId
  links?: Link[]
}

export type NodeKind =
  | 'client'
  | 'gateway'
  | 'lb'
  | 'service'
  | 'worker'
  | 'db'
  | 'cache'
  | 'queue'
  | 'stream'
  | 'storage'
  | 'cdn'
  | 'search'
  | 'model'
  | 'feature-store'
  | 'external'
  | 'monitor'

export interface DiagramNode {
  id: string
  label: string
  kind: NodeKind
  /** grid position: col 0..7 (left to right), row 0..5 (top to bottom) */
  col: number
  row: number
  /** shown when the node is clicked */
  detail?: string
}

export interface DiagramEdge {
  from: string
  to: string
  label?: string
  dashed?: boolean
}

export interface Diagram {
  title: string
  nodes: DiagramNode[]
  edges: DiagramEdge[]
}

export interface DesignDoc {
  id: string
  title: string
  /** e.g. "Fundamentals", "Case Study" (system design) or "Recommendation", "Search & Ranking"... (ML design) */
  category: string
  difficulty: Difficulty
  summary: string
  tags: string[]
  /** markdown sections, rendered in order with a table of contents */
  sections: { title: string; body: string }[]
  diagrams: Diagram[]
  widgets?: WidgetId[]
  /** likely interviewer follow-ups with model answers */
  followUps: { q: string; a: string }[]
  resources: Link[]
}

export interface Flashcard {
  q: string
  a: string
}

export interface QuizQuestion {
  q: string
  options: string[]
  /** index into options */
  answer: number
  explanation: string
}

export interface TheoryTopic {
  id: string
  title: string
  category: string
  summary: string
  /** long-form markdown + KaTeX notes */
  notes: string
  widgets?: WidgetId[]
  flashcards: Flashcard[]
  quiz: QuizQuestion[]
  resources: Link[]
}
