import type { ComponentType, LazyExoticComponent } from 'react'
import { lazy } from 'react'
import type { WidgetId } from '../types/content'

export interface WidgetMeta {
  id: WidgetId
  title: string
  description: string
  group: 'DSA' | 'ML' | 'Systems'
  component: LazyExoticComponent<ComponentType>
}

const W = (id: WidgetId, group: WidgetMeta['group'], title: string, description: string, loader: () => Promise<{ default: ComponentType }>): WidgetMeta => ({
  id,
  group,
  title,
  description,
  component: lazy(loader),
})

export const widgets: WidgetMeta[] = [
  // DSA
  W('sorting', 'DSA', 'Sorting Algorithms', 'Bubble, insertion, selection, merge, quick and heap sort — step by step.', () => import('./dsa/Sorting')),
  W('binary-search', 'DSA', 'Binary Search', 'Watch lo / mid / hi converge on a sorted array, including lower-bound variants.', () => import('./dsa/BinarySearch')),
  W('two-pointers', 'DSA', 'Two Pointers', 'Converging pointers on a sorted array (pair sum, container with most water).', () => import('./dsa/TwoPointers')),
  W('sliding-window', 'DSA', 'Sliding Window', 'Variable-size window expanding and shrinking over a string / array.', () => import('./dsa/SlidingWindow')),
  W('monotonic-stack', 'DSA', 'Monotonic Stack', 'Next-greater-element & daily temperatures with a decreasing stack.', () => import('./dsa/MonotonicStack')),
  W('linked-list', 'DSA', 'Linked List Reversal', 'Pointer manipulation with prev / curr / next, plus fast & slow pointers.', () => import('./dsa/LinkedList')),
  W('tree-traversal', 'DSA', 'Tree Traversals', 'Pre-, in-, post-order DFS and level-order BFS on a binary tree.', () => import('./dsa/TreeTraversal')),
  W('heap', 'DSA', 'Binary Heap', 'Push / pop with sift-up and sift-down, shown as tree and array.', () => import('./dsa/Heap')),
  W('backtracking', 'DSA', 'Backtracking (N-Queens)', 'Place, check, recurse, undo — explore the decision tree.', () => import('./dsa/Backtracking')),
  W('trie', 'DSA', 'Trie', 'Insert words and search prefixes in a prefix tree.', () => import('./dsa/Trie')),
  W('graph-traversal', 'DSA', 'Grid BFS / DFS', 'Flood fill a grid with BFS (queue) or DFS (stack); draw your own walls.', () => import('./dsa/GraphTraversal')),
  W('dijkstra', 'DSA', "Dijkstra's Shortest Path", 'Greedy relaxation with a min-heap on a weighted graph.', () => import('./dsa/Dijkstra')),
  W('dp-grid', 'DSA', 'Dynamic Programming Table', 'Fill LCS / edit distance tables cell by cell with dependencies.', () => import('./dsa/DpGrid')),
  W('union-find', 'DSA', 'Union-Find (DSU)', 'Union by rank + path compression; detect cycles.', () => import('./dsa/UnionFind')),
  W('intervals', 'DSA', 'Interval Merging', 'Sort by start, sweep and merge overlapping intervals.', () => import('./dsa/Intervals')),
  W('bit-ops', 'DSA', 'Bit Manipulation', 'AND, OR, XOR, shifts and classic tricks on 32-bit integers.', () => import('./dsa/BitOps')),
  // ML
  W('gradient-descent', 'ML', 'Gradient Descent & Optimizers', 'SGD vs Momentum vs RMSProp vs Adam on 2-D loss surfaces.', () => import('./ml/GradientDescent')),
  W('bias-variance', 'ML', 'Bias–Variance Trade-off', 'Fit polynomials of increasing degree and watch train vs test error.', () => import('./ml/BiasVariance')),
  W('logistic-regression', 'ML', 'Logistic Regression', 'Click to add points; watch the decision boundary train live.', () => import('./ml/LogisticRegression')),
  W('kmeans', 'ML', 'K-Means Clustering', 'Assignment and update steps animated; k-means++ vs random init.', () => import('./ml/KMeans')),
  W('knn', 'ML', 'K-Nearest Neighbors', 'Decision regions as k changes; hover to query a point.', () => import('./ml/Knn')),
  W('regularization', 'ML', 'L1 vs L2 Regularization', 'Constraint geometry: why L1 yields sparse solutions.', () => import('./ml/Regularization')),
  W('roc-curve', 'ML', 'ROC, PR & Thresholds', 'Move the threshold; see the confusion matrix, ROC and PR curves update.', () => import('./ml/RocCurve')),
  W('softmax-temperature', 'ML', 'Softmax & Temperature Sampling', 'Temperature, top-k and top-p effects on a token distribution.', () => import('./ml/SoftmaxTemperature')),
  W('attention', 'ML', 'Self-Attention', 'Query/key similarity heatmap, causal masking and multi-head view.', () => import('./ml/Attention')),
  W('activations', 'ML', 'Activation Functions', 'ReLU, GELU, SiLU, tanh, sigmoid and their derivatives.', () => import('./ml/Activations')),
  W('nn-playground', 'ML', 'Neural Network Playground', 'Train a tiny MLP in the browser on 2-D datasets.', () => import('./ml/NnPlayground')),
  W('pca', 'ML', 'Principal Component Analysis', 'Rotate data, see principal axes and explained variance.', () => import('./ml/Pca')),
  W('convolution', 'ML', '2-D Convolution', 'Slide a kernel over an image; stride, padding and output size.', () => import('./ml/Convolution')),
  W('decision-tree', 'ML', 'Decision Tree Splits', 'Gini / entropy split search and recursive partitioning.', () => import('./ml/DecisionTree')),
  W('positional-encoding', 'ML', 'Positional Encodings', 'Sinusoidal encodings heatmap and RoPE rotation intuition.', () => import('./ml/PositionalEncoding')),
  W('lr-schedule', 'ML', 'Learning-Rate Schedules', 'Step, exponential, cosine, warmup + cosine, one-cycle.', () => import('./ml/LrSchedule')),
  // Systems
  W('consistent-hashing', 'Systems', 'Consistent Hashing', 'Hash ring with virtual nodes; add/remove servers and watch keys move.', () => import('./sd/ConsistentHashing')),
  W('rate-limiter', 'Systems', 'Rate Limiters', 'Token bucket vs leaky bucket vs sliding window under bursty traffic.', () => import('./sd/RateLimiter')),
  W('lru-cache', 'Systems', 'LRU / LFU Cache', 'Hash map + doubly-linked list eviction, hit-rate simulation.', () => import('./sd/LruCache')),
  W('load-balancer', 'Systems', 'Load Balancing', 'Round-robin vs least-connections vs power-of-two-choices.', () => import('./sd/LoadBalancer')),
  W('capacity-estimator', 'Systems', 'Capacity Estimator', 'Back-of-the-envelope QPS, storage and bandwidth calculator.', () => import('./sd/CapacityEstimator')),
  W('bloom-filter', 'Systems', 'Bloom Filter', 'Bit array with k hashes; false-positive rate vs m, n, k.', () => import('./sd/BloomFilter')),
  W('ab-test', 'Systems', 'A/B Test Calculator', 'Sample size, power and significance for conversion experiments.', () => import('./sd/AbTest')),
  W('recsys-funnel', 'Systems', 'Recommendation Funnel', 'Candidate generation → ranking → re-ranking with latency budget.', () => import('./sd/RecsysFunnel')),
]

export const widgetById = Object.fromEntries(widgets.map((w) => [w.id, w])) as Record<WidgetId, WidgetMeta>
