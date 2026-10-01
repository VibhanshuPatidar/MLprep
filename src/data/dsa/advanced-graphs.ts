import type { DsaProblem } from '../../types/content'

const problems: DsaProblem[] = [
  {
    "id": "network-delay-time",
    "title": "Network Delay Time",
    "number": 743,
    "difficulty": "Medium",
    "category": "Advanced Graphs",
    "pattern": "Dijkstra Shortest Path",
    "description": "Given directed weighted signal edges times, numbered nodes 1 through n, and a starting node k, return how long it takes until every node has received the signal. If some node can never be reached, return -1.",
    "examples": [
      {
        "input": "times = [[2,1,1],[2,3,1],[3,4,1]], n = 4, k = 2",
        "output": "2",
        "explanation": "Node 1 and node 3 receive the signal after 1 unit, and node 4 after 2 units."
      },
      {
        "input": "times = [[1,2,1]], n = 2, k = 1",
        "output": "1"
      },
      {
        "input": "times = [[1,2,1]], n = 2, k = 2",
        "output": "-1",
        "explanation": "Node 1 is unreachable from node 2."
      }
    ],
    "constraints": [
      "1 <= n <= 100",
      "0 <= times.length <= 6000",
      "times[i] = [ui, vi, wi] with 1 <= ui, vi <= n",
      "1 <= wi <= 100 and 1 <= k <= n"
    ],
    "hints": [
      "Model the problem as single-source shortest paths.",
      "The answer is the maximum shortest-path distance from k.",
      "Because all edge weights are positive, Dijkstra with a min-heap is the natural fit."
    ],
    "signature": {
      "kind": "function",
      "name": "networkDelayTime",
      "params": [
        {
          "name": "times",
          "type": "int[][]"
        },
        {
          "name": "n",
          "type": "int"
        },
        {
          "name": "k",
          "type": "int"
        }
      ],
      "returns": "int"
    },
    "tests": [
      {
        "args": [
          [
            [2, 1, 1],
            [2, 3, 1],
            [3, 4, 1]
          ],
          4,
          2
        ],
        "expected": 2
      },
      {
        "args": [
          [
            [1, 2, 1]
          ],
          2,
          1
        ],
        "expected": 1
      },
      {
        "args": [
          [
            [1, 2, 1]
          ],
          2,
          2
        ],
        "expected": -1
      },
      {
        "args": [
          [],
          1,
          1
        ],
        "expected": 0
      },
      {
        "args": [
          [
            [1, 2, 10],
            [1, 2, 1],
            [2, 3, 2],
            [1, 3, 100]
          ],
          3,
          1
        ],
        "expected": 3
      },
      {
        "args": [
          [
            [1, 2, 1],
            [2, 1, 3],
            [2, 3, 1]
          ],
          3,
          2
        ],
        "expected": 3
      },
      {
        "args": [
          [
            [1, 2, 5],
            [2, 3, 5]
          ],
          4,
          1
        ],
        "expected": -1
      },
      {
        "args": [
          [
            [1, 2, 5],
            [1, 3, 2],
            [3, 2, 1],
            [2, 4, 2],
            [3, 4, 10]
          ],
          4,
          1
        ],
        "expected": 5
      }
    ],
    "solutions": [
      {
        "title": "Dijkstra from the source",
        "explanation": `**Intuition:** Every travel time is non-negative, so the earliest time a node is removed from a min-heap is final.

**Steps:**
1. Build an adjacency list from each signal source to its outgoing edges.
2. Push the starting node with distance 0.
3. Repeatedly pop the smallest tentative distance; skip nodes already finalized.
4. Relax outgoing edges into the heap and finally take the largest finalized distance.

**Correctness:** Dijkstra's greedy choice is safe because all edge weights are non-negative. When a node is popped, any alternate route would have to start with a heap entry at least as large, so it cannot improve that node. Therefore all recorded distances are shortest paths, and the answer is the slowest shortest path.

**Pitfalls:** Do not return the last heap value if some nodes were never reached; in that case the answer is -1.`,
        "time": "O((E + V) log V)",
        "space": "O(E + V)",
        "python": `class Solution:
    def networkDelayTime(self, times: List[List[int]], n: int, k: int) -> int:
        graph = defaultdict(list)
        for u, v, w in times:
            graph[u].append((v, w))
        dist = {}
        heap = [(0, k)]
        while heap:
            d, u = heappop(heap)
            if u in dist:
                continue
            dist[u] = d
            for v, w in graph[u]:
                if v not in dist:
                    heappush(heap, (d + w, v))
        return max(dist.values()) if len(dist) == n else -1
`,
        "cpp": `class Solution {
public:
    int networkDelayTime(vector<vector<int>>& times, int n, int k) {
        vector<vector<pair<int,int>>> graph(n + 1);
        for (auto& e : times) graph[e[0]].push_back({e[1], e[2]});
        vector<int> dist(n + 1, INT_MAX);
        priority_queue<pair<int,int>, vector<pair<int,int>>, greater<pair<int,int>>> pq;
        pq.push({0, k});
        while (!pq.empty()) {
            auto [d, u] = pq.top(); pq.pop();
            if (dist[u] != INT_MAX) continue;
            dist[u] = d;
            for (auto [v, w] : graph[u]) if (dist[v] == INT_MAX) pq.push({d + w, v});
        }
        int ans = 0;
        for (int i = 1; i <= n; ++i) {
            if (dist[i] == INT_MAX) return -1;
            ans = max(ans, dist[i]);
        }
        return ans;
    }
};`
      },
      {
        "title": "Bellman-Ford relaxation",
        "explanation": `**Intuition:** With at most V - 1 edges on a simple shortest path, repeatedly relaxing every edge eventually propagates every best distance.

**Steps:**
1. Store infinity for every node except the source.
2. Perform V - 1 full passes over the edge list.
3. On each pass, improve the destination using the previous source distance.
4. The largest finite distance is the broadcast completion time.

**Correctness:** After i passes, Bellman-Ford has found every shortest path using at most i edges. Any shortest path in a graph of V nodes can be made simple and therefore uses at most V - 1 edges, so after all passes every reachable distance is final.

**Pitfalls:** Use a large sentinel and avoid adding to infinity.`,
        "time": "O(VE)",
        "space": "O(V)",
        "python": `class Solution:
    def networkDelayTime(self, times: List[List[int]], n: int, k: int) -> int:
        inf = 10**18
        dist = [inf] * (n + 1)
        dist[k] = 0
        for _ in range(n - 1):
            changed = False
            for u, v, w in times:
                if dist[u] != inf and dist[u] + w < dist[v]:
                    dist[v] = dist[u] + w
                    changed = True
            if not changed:
                break
        ans = max(dist[1:])
        return -1 if ans == inf else ans
`,
        "cpp": `class Solution {
public:
    int networkDelayTime(vector<vector<int>>& times, int n, int k) {
        const int INF = 1e9;
        vector<int> dist(n + 1, INF);
        dist[k] = 0;
        for (int pass = 0; pass < n - 1; ++pass) {
            bool changed = false;
            for (auto& e : times) {
                int u = e[0], v = e[1], w = e[2];
                if (dist[u] != INF && dist[u] + w < dist[v]) {
                    dist[v] = dist[u] + w;
                    changed = true;
                }
            }
            if (!changed) break;
        }
        int ans = 0;
        for (int i = 1; i <= n; ++i) {
            if (dist[i] == INF) return -1;
            ans = max(ans, dist[i]);
        }
        return ans;
    }
};`
      }
    ],
    "viz": "dijkstra"
  },
  {
    "id": "reconstruct-itinerary",
    "title": "Reconstruct Itinerary",
    "number": 332,
    "difficulty": "Hard",
    "category": "Advanced Graphs",
    "pattern": "Eulerian Path",
    "description": "You are given airline tickets as directed edges between airport codes. Use every ticket exactly once and return an itinerary that starts at JFK. If more than one itinerary works, return the lexicographically smallest sequence of airport codes.",
    "examples": [
      {
        "input": "tickets = [[\"MUC\",\"LHR\"],[\"JFK\",\"MUC\"],[\"SFO\",\"SJC\"],[\"LHR\",\"SFO\"]]",
        "output": "[\"JFK\",\"MUC\",\"LHR\",\"SFO\",\"SJC\"]"
      },
      {
        "input": "tickets = [[\"JFK\",\"SFO\"],[\"JFK\",\"ATL\"],[\"SFO\",\"ATL\"],[\"ATL\",\"JFK\"],[\"ATL\",\"SFO\"]]",
        "output": "[\"JFK\",\"ATL\",\"JFK\",\"SFO\",\"ATL\",\"SFO\"]"
      },
      {
        "input": "tickets = [[\"JFK\",\"KUL\"],[\"JFK\",\"NRT\"],[\"NRT\",\"JFK\"]]",
        "output": "[\"JFK\",\"NRT\",\"JFK\",\"KUL\"]",
        "explanation": "Choosing KUL first would strand the NRT ticket."
      }
    ],
    "constraints": [
      "1 <= tickets.length <= 300",
      "tickets[i].length == 2",
      "Each airport code contains three uppercase letters",
      "A valid itinerary using all tickets is guaranteed"
    ],
    "hints": [
      "Think of tickets as edges in a directed multigraph.",
      "If a branch leads to a dead end too early, that airport should appear later in the final route.",
      "Hierholzer DFS with sorted outgoing edges builds the Eulerian path in reverse."
    ],
    "signature": {
      "kind": "function",
      "name": "findItinerary",
      "params": [
        {
          "name": "tickets",
          "type": "string[][]"
        }
      ],
      "returns": "string[]"
    },
    "tests": [
      {
        "args": [
          [
            ["MUC", "LHR"],
            ["JFK", "MUC"],
            ["SFO", "SJC"],
            ["LHR", "SFO"]
          ]
        ],
        "expected": ["JFK", "MUC", "LHR", "SFO", "SJC"]
      },
      {
        "args": [
          [
            ["JFK", "SFO"],
            ["JFK", "ATL"],
            ["SFO", "ATL"],
            ["ATL", "JFK"],
            ["ATL", "SFO"]
          ]
        ],
        "expected": ["JFK", "ATL", "JFK", "SFO", "ATL", "SFO"]
      },
      {
        "args": [
          [
            ["JFK", "KUL"],
            ["JFK", "NRT"],
            ["NRT", "JFK"]
          ]
        ],
        "expected": ["JFK", "NRT", "JFK", "KUL"]
      },
      {
        "args": [
          [
            ["JFK", "A"]
          ]
        ],
        "expected": ["JFK", "A"]
      },
      {
        "args": [
          [
            ["JFK", "A"],
            ["JFK", "A"],
            ["A", "JFK"]
          ]
        ],
        "expected": ["JFK", "A", "JFK", "A"]
      },
      {
        "args": [
          [
            ["JFK", "B"],
            ["JFK", "A"],
            ["A", "C"],
            ["C", "JFK"],
            ["B", "A"]
          ]
        ],
        "expected": ["JFK", "A", "C", "JFK", "B", "A"]
      },
      {
        "args": [
          [
            ["JFK", "AAA"],
            ["AAA", "JFK"],
            ["JFK", "ZZZ"]
          ]
        ],
        "expected": ["JFK", "AAA", "JFK", "ZZZ"]
      },
      {
        "args": [
          [
            ["JFK", "ATL"],
            ["ATL", "ORD"],
            ["ORD", "JFK"],
            ["JFK", "DEN"],
            ["DEN", "ATL"]
          ]
        ],
        "expected": ["JFK", "ATL", "ORD", "JFK", "DEN", "ATL"]
      }
    ],
    "solutions": [
      {
        "title": "Hierholzer with lexical heaps",
        "explanation": `**Intuition:** The tickets form a directed multigraph and the required route is an Eulerian path starting at JFK. Choosing destinations in lexical order while backtracking after exhausting edges gives the smallest valid itinerary.

**Steps:**
1. Put every outgoing destination into a min-heap or reverse-sorted stack.
2. Depth-first search from JFK, consuming one ticket each time an edge is followed.
3. Append an airport only after all of its outgoing tickets are used.
4. Reverse the postorder list.

**Correctness:** Hierholzer's algorithm uses each directed edge exactly once and stitches cycles into one Eulerian route. Because each local edge choice is the smallest still available and nodes are appended after dead ends are resolved, the reversed route is the lexicographically smallest complete itinerary.

**Pitfalls:** Tickets are a multiset; duplicate edges must be consumed separately.`,
        "time": "O(E log E)",
        "space": "O(E)",
        "python": `class Solution:
    def findItinerary(self, tickets: List[List[str]]) -> List[str]:
        graph = defaultdict(list)
        for src, dst in sorted(tickets, reverse=True):
            graph[src].append(dst)
        route = []
        def dfs(src: str) -> None:
            while graph[src]:
                dfs(graph[src].pop())
            route.append(src)
        dfs("JFK")
        return route[::-1]
`,
        "cpp": `class Solution {
    unordered_map<string, priority_queue<string, vector<string>, greater<string>>> graph;
    vector<string> route;
    void dfs(const string& src) {
        auto& pq = graph[src];
        while (!pq.empty()) {
            string dst = pq.top(); pq.pop();
            dfs(dst);
        }
        route.push_back(src);
    }
public:
    vector<string> findItinerary(vector<vector<string>>& tickets) {
        graph.clear(); route.clear();
        for (auto& t : tickets) graph[t[0]].push(t[1]);
        dfs("JFK");
        reverse(route.begin(), route.end());
        return route;
    }
};`
      },
      {
        "title": "Sorted backtracking baseline",
        "explanation": `**Intuition:** Try tickets in sorted order and stop at the first complete route. This is slower, but it makes the lexical rule explicit.

**Steps:**
1. Sort the ticket list by source then destination.
2. Keep a used flag for every ticket, not every route pair.
3. From the current airport, try every unused outgoing ticket in order.
4. Return the first path that consumes all tickets.

**Correctness:** The recursion enumerates all valid ticket permutations in lexicographic order because the ticket list is sorted and choices are tried left to right. The first complete itinerary is therefore the smallest one.

**Pitfalls:** Mark by ticket index; otherwise duplicate tickets collapse incorrectly.`,
        "time": "O(E!)",
        "space": "O(E)",
        "python": `class Solution:
    def findItinerary(self, tickets: List[List[str]]) -> List[str]:
        tickets.sort()
        used = [False] * len(tickets)
        path = ["JFK"]
        def dfs(airport: str) -> bool:
            if len(path) == len(tickets) + 1:
                return True
            for i, (src, dst) in enumerate(tickets):
                if not used[i] and src == airport:
                    used[i] = True
                    path.append(dst)
                    if dfs(dst):
                        return True
                    path.pop()
                    used[i] = False
            return False
        dfs("JFK")
        return path
`,
        "cpp": `class Solution {
    vector<vector<string>> t;
    vector<int> used;
    vector<string> path;
    bool dfs(const string& airport) {
        if ((int)path.size() == (int)t.size() + 1) return true;
        for (int i = 0; i < (int)t.size(); ++i) {
            if (!used[i] && t[i][0] == airport) {
                used[i] = 1;
                path.push_back(t[i][1]);
                if (dfs(t[i][1])) return true;
                path.pop_back();
                used[i] = 0;
            }
        }
        return false;
    }
public:
    vector<string> findItinerary(vector<vector<string>>& tickets) {
        t = tickets;
        sort(t.begin(), t.end());
        used.assign(t.size(), 0);
        path = {"JFK"};
        dfs("JFK");
        return path;
    }
};`
      }
    ],
    "viz": "graph-traversal"
  },
  {
    "id": "min-cost-to-connect-all-points",
    "title": "Min Cost to Connect All Points",
    "number": 1584,
    "difficulty": "Medium",
    "category": "Advanced Graphs",
    "pattern": "Minimum Spanning Tree",
    "description": "Each point can be connected to any other point, with cost equal to their Manhattan distance. Return the minimum total cost needed so every point is part of one connected network.",
    "examples": [
      {
        "input": "points = [[0,0],[2,2],[3,10],[5,2],[7,0]]",
        "output": "20"
      },
      {
        "input": "points = [[3,12],[-2,5],[-4,1]]",
        "output": "18"
      },
      {
        "input": "points = [[0,0]]",
        "output": "0"
      }
    ],
    "constraints": [
      "1 <= points.length <= 1000",
      "-10^6 <= xi, yi <= 10^6",
      "All given points are distinct",
      "The cost between two points is |xi - xj| + |yi - yj|"
    ],
    "hints": [
      "This is a complete weighted graph, but you do not need to store every edge for Prim.",
      "A minimum spanning tree is the cheapest way to connect all vertices.",
      "Use the cut property: the cheapest edge crossing from connected to unconnected points is safe."
    ],
    "signature": {
      "kind": "function",
      "name": "minCostConnectPoints",
      "params": [
        {
          "name": "points",
          "type": "int[][]"
        }
      ],
      "returns": "int"
    },
    "tests": [
      {
        "args": [
          [
            [0, 0],
            [2, 2],
            [3, 10],
            [5, 2],
            [7, 0]
          ]
        ],
        "expected": 20
      },
      {
        "args": [
          [
            [3, 12],
            [-2, 5],
            [-4, 1]
          ]
        ],
        "expected": 18
      },
      {
        "args": [
          [
            [0, 0]
          ]
        ],
        "expected": 0
      },
      {
        "args": [
          [
            [-1, -1],
            [1, 1]
          ]
        ],
        "expected": 4
      },
      {
        "args": [
          [
            [0, 0],
            [0, 1],
            [1, 0],
            [1, 1]
          ]
        ],
        "expected": 3
      },
      {
        "args": [
          [
            [0, 0],
            [2, 0],
            [5, 0],
            [6, 0]
          ]
        ],
        "expected": 6
      },
      {
        "args": [
          [
            [-1000000, -1000000],
            [1000000, 1000000],
            [0, 0]
          ]
        ],
        "expected": 4000000
      },
      {
        "args": [
          [
            [1, 1],
            [3, 4],
            [-1, 2],
            [6, 1],
            [2, -2]
          ]
        ],
        "expected": 17
      }
    ],
    "solutions": [
      {
        "title": "Prim over the complete graph",
        "explanation": `**Intuition:** Treat every point as connected to every other point with Manhattan distance. Prim's algorithm grows one connected component by always adding the cheapest crossing edge.

**Steps:**
1. Keep, for each unvisited point, the cheapest distance to the current tree.
2. Repeatedly choose the unvisited point with the smallest such distance.
3. Add that distance to the answer.
4. Update all remaining points using the newly added point.

**Correctness:** By the cut property of minimum spanning trees, the lightest edge crossing from the built tree to the remaining vertices is always safe. Prim applies that rule until every point is connected, so the total is an MST cost.

**Pitfalls:** Do not build an O(n^2) edge list unless using Kruskal; distances can be computed on demand.`,
        "time": "O(n^2)",
        "space": "O(n)",
        "python": `class Solution:
    def minCostConnectPoints(self, points: List[List[int]]) -> int:
        n = len(points)
        used = [False] * n
        best = [10**18] * n
        best[0] = 0
        total = 0
        for _ in range(n):
            i = min((best[j], j) for j in range(n) if not used[j])[1]
            used[i] = True
            total += best[i]
            x, y = points[i]
            for j, (a, b) in enumerate(points):
                if not used[j]:
                    best[j] = min(best[j], abs(x - a) + abs(y - b))
        return total
`,
        "cpp": `class Solution {
public:
    int minCostConnectPoints(vector<vector<int>>& points) {
        int n = points.size();
        vector<int> best(n, INT_MAX), used(n, 0);
        best[0] = 0;
        int total = 0;
        for (int step = 0; step < n; ++step) {
            int i = -1;
            for (int j = 0; j < n; ++j) if (!used[j] && (i == -1 || best[j] < best[i])) i = j;
            used[i] = 1;
            total += best[i];
            for (int j = 0; j < n; ++j) if (!used[j]) {
                int d = abs(points[i][0] - points[j][0]) + abs(points[i][1] - points[j][1]);
                best[j] = min(best[j], d);
            }
        }
        return total;
    }
};`
      },
      {
        "title": "Kruskal with union-find",
        "explanation": `**Intuition:** Generate all candidate edges, sort them, and accept an edge only when it connects two components.

**Steps:**
1. Compute Manhattan distance for every pair of points.
2. Sort edges by distance.
3. Use a disjoint-set union structure to track components.
4. Add an edge when its endpoints were previously disconnected.

**Correctness:** Kruskal repeatedly chooses the lightest edge that does not form a cycle. The cut property says such an edge is safe, and accepting exactly n - 1 safe edges creates a minimum spanning tree.

**Pitfalls:** The complete graph has O(n^2) edges, so Prim is usually more memory-friendly here.`,
        "time": "O(n^2 log n)",
        "space": "O(n^2)",
        "python": `class Solution:
    def minCostConnectPoints(self, points: List[List[int]]) -> int:
        n = len(points)
        parent = list(range(n))
        rank = [0] * n
        def find(x: int) -> int:
            while parent[x] != x:
                parent[x] = parent[parent[x]]
                x = parent[x]
            return x
        def union(a: int, b: int) -> bool:
            ra, rb = find(a), find(b)
            if ra == rb:
                return False
            if rank[ra] < rank[rb]:
                ra, rb = rb, ra
            parent[rb] = ra
            if rank[ra] == rank[rb]:
                rank[ra] += 1
            return True
        edges = []
        for i in range(n):
            for j in range(i + 1, n):
                d = abs(points[i][0] - points[j][0]) + abs(points[i][1] - points[j][1])
                edges.append((d, i, j))
        total = used = 0
        for d, i, j in sorted(edges):
            if union(i, j):
                total += d
                used += 1
                if used == n - 1:
                    break
        return total
`,
        "cpp": `class Solution {
    struct DSU {
        vector<int> p, r;
        DSU(int n) : p(n), r(n, 0) { iota(p.begin(), p.end(), 0); }
        int find(int x) { return p[x] == x ? x : p[x] = find(p[x]); }
        bool unite(int a, int b) {
            a = find(a); b = find(b);
            if (a == b) return false;
            if (r[a] < r[b]) swap(a, b);
            p[b] = a;
            if (r[a] == r[b]) ++r[a];
            return true;
        }
    };
public:
    int minCostConnectPoints(vector<vector<int>>& points) {
        int n = points.size();
        vector<array<int,3>> edges;
        for (int i = 0; i < n; ++i) for (int j = i + 1; j < n; ++j) {
            int d = abs(points[i][0] - points[j][0]) + abs(points[i][1] - points[j][1]);
            edges.push_back({d, i, j});
        }
        sort(edges.begin(), edges.end());
        DSU dsu(n);
        int total = 0, used = 0;
        for (auto [d, i, j] : edges) if (dsu.unite(i, j)) {
            total += d;
            if (++used == n - 1) break;
        }
        return total;
    }
};`
      }
    ],
    "viz": "union-find"
  },
  {
    "id": "swim-in-rising-water",
    "title": "Swim in Rising Water",
    "number": 778,
    "difficulty": "Hard",
    "category": "Advanced Graphs",
    "pattern": "Dijkstra on Grid",
    "description": "A grid cell value is the time when that cell becomes passable. Starting at the top-left, return the earliest time when you can move through passable four-directional cells to reach the bottom-right.",
    "examples": [
      {
        "input": "grid = [[0,2],[1,3]]",
        "output": "3"
      },
      {
        "input": "grid = [[0,1,2,3,4],[24,23,22,21,5],[12,13,14,15,16],[11,17,18,19,20],[10,9,8,7,6]]",
        "output": "16"
      },
      {
        "input": "grid = [[0]]",
        "output": "0"
      }
    ],
    "constraints": [
      "1 <= grid.length == grid[i].length <= 50",
      "0 <= grid[r][c] < n^2",
      "Each elevation in the grid is unique",
      "You may move up, down, left, or right"
    ],
    "hints": [
      "A path is limited by its largest elevation, not by the sum of elevations.",
      "Expand the currently reachable cell with the smallest required water level.",
      "Equivalently, binary-search the water level and flood-fill reachable cells."
    ],
    "signature": {
      "kind": "function",
      "name": "swimInWater",
      "params": [
        {
          "name": "grid",
          "type": "int[][]"
        }
      ],
      "returns": "int"
    },
    "tests": [
      {
        "args": [
          [
            [0, 2],
            [1, 3]
          ]
        ],
        "expected": 3
      },
      {
        "args": [
          [
            [0, 1, 2, 3, 4],
            [24, 23, 22, 21, 5],
            [12, 13, 14, 15, 16],
            [11, 17, 18, 19, 20],
            [10, 9, 8, 7, 6]
          ]
        ],
        "expected": 16
      },
      {
        "args": [
          [
            [0]
          ]
        ],
        "expected": 0
      },
      {
        "args": [
          [
            [0, 1],
            [2, 3]
          ]
        ],
        "expected": 3
      },
      {
        "args": [
          [
            [0, 3],
            [1, 2]
          ]
        ],
        "expected": 2
      },
      {
        "args": [
          [
            [0, 8, 7],
            [1, 2, 6],
            [4, 3, 5]
          ]
        ],
        "expected": 5
      },
      {
        "args": [
          [
            [7, 6, 5],
            [8, 1, 4],
            [9, 2, 3]
          ]
        ],
        "expected": 7
      },
      {
        "args": [
          [
            [0, 5, 6],
            [1, 4, 7],
            [2, 3, 8]
          ]
        ],
        "expected": 8
      }
    ],
    "solutions": [
      {
        "title": "Dijkstra on water level",
        "explanation": `**Intuition:** A path's cost is the maximum elevation along it. If we always expand the cell reachable at the lowest current maximum, the first time we reach the target is optimal.

**Steps:**
1. Start with the top-left elevation in a min-heap.
2. Pop the cell with the smallest current required time.
3. Push unvisited neighbors with cost max(current time, neighbor elevation).
4. Return when the bottom-right cell is popped.

**Correctness:** This is Dijkstra where edge relaxation uses max instead of addition. The relaxation value is monotone and never decreases along a path, so the smallest heap state for a cell is final when popped.

**Pitfalls:** Mark cells as seen when they are pushed to avoid many duplicate heap entries.`,
        "time": "O(n^2 log n)",
        "space": "O(n^2)",
        "python": `class Solution:
    def swimInWater(self, grid: List[List[int]]) -> int:
        n = len(grid)
        heap = [(grid[0][0], 0, 0)]
        seen = {(0, 0)}
        while heap:
            t, r, c = heappop(heap)
            if r == n - 1 and c == n - 1:
                return t
            for dr, dc in ((1, 0), (-1, 0), (0, 1), (0, -1)):
                nr, nc = r + dr, c + dc
                if 0 <= nr < n and 0 <= nc < n and (nr, nc) not in seen:
                    seen.add((nr, nc))
                    heappush(heap, (max(t, grid[nr][nc]), nr, nc))
        return -1
`,
        "cpp": `class Solution {
public:
    int swimInWater(vector<vector<int>>& grid) {
        int n = grid.size();
        vector<vector<int>> seen(n, vector<int>(n));
        priority_queue<array<int,3>, vector<array<int,3>>, greater<array<int,3>>> pq;
        pq.push({grid[0][0], 0, 0});
        seen[0][0] = 1;
        int dirs[5] = {1, 0, -1, 0, 1};
        while (!pq.empty()) {
            auto [t, r, c] = pq.top(); pq.pop();
            if (r == n - 1 && c == n - 1) return t;
            for (int d = 0; d < 4; ++d) {
                int nr = r + dirs[d], nc = c + dirs[d + 1];
                if (nr >= 0 && nr < n && nc >= 0 && nc < n && !seen[nr][nc]) {
                    seen[nr][nc] = 1;
                    pq.push({max(t, grid[nr][nc]), nr, nc});
                }
            }
        }
        return -1;
    }
};`
      },
      {
        "title": "Binary search the answer",
        "explanation": `**Intuition:** If the target is reachable at time T, it remains reachable at every larger time. That monotonicity lets us binary-search T.

**Steps:**
1. Search between max(start, end) and n^2 - 1.
2. For a candidate time, flood-fill only cells with elevation at most that time.
3. If the target is reached, try a smaller time; otherwise try larger.
4. Return the smallest feasible time.

**Correctness:** The feasibility predicate is monotone: allowing more water can only add cells. Binary search finds the first true predicate, and the flood-fill exactly checks whether a path using only allowed cells exists.

**Pitfalls:** The lower bound must include both endpoints because the path starts and ends on those cells.`,
        "time": "O(n^2 log n)",
        "space": "O(n^2)",
        "python": `class Solution:
    def swimInWater(self, grid: List[List[int]]) -> int:
        n = len(grid)
        def can(limit: int) -> bool:
            if grid[0][0] > limit:
                return False
            q = deque([(0, 0)])
            seen = {(0, 0)}
            while q:
                r, c = q.popleft()
                if r == n - 1 and c == n - 1:
                    return True
                for dr, dc in ((1, 0), (-1, 0), (0, 1), (0, -1)):
                    nr, nc = r + dr, c + dc
                    if 0 <= nr < n and 0 <= nc < n and (nr, nc) not in seen and grid[nr][nc] <= limit:
                        seen.add((nr, nc))
                        q.append((nr, nc))
            return False
        lo, hi = max(grid[0][0], grid[-1][-1]), n * n - 1
        while lo < hi:
            mid = (lo + hi) // 2
            if can(mid):
                hi = mid
            else:
                lo = mid + 1
        return lo
`,
        "cpp": `class Solution {
    bool can(vector<vector<int>>& grid, int limit) {
        int n = grid.size();
        if (grid[0][0] > limit) return false;
        vector<vector<int>> seen(n, vector<int>(n));
        queue<pair<int,int>> q;
        q.push({0, 0}); seen[0][0] = 1;
        int dirs[5] = {1, 0, -1, 0, 1};
        while (!q.empty()) {
            auto [r, c] = q.front(); q.pop();
            if (r == n - 1 && c == n - 1) return true;
            for (int d = 0; d < 4; ++d) {
                int nr = r + dirs[d], nc = c + dirs[d + 1];
                if (nr >= 0 && nr < n && nc >= 0 && nc < n && !seen[nr][nc] && grid[nr][nc] <= limit) {
                    seen[nr][nc] = 1;
                    q.push({nr, nc});
                }
            }
        }
        return false;
    }
public:
    int swimInWater(vector<vector<int>>& grid) {
        int n = grid.size();
        int lo = max(grid[0][0], grid[n - 1][n - 1]), hi = n * n - 1;
        while (lo < hi) {
            int mid = lo + (hi - lo) / 2;
            if (can(grid, mid)) hi = mid;
            else lo = mid + 1;
        }
        return lo;
    }
};`
      }
    ],
    "viz": "dijkstra"
  },
  {
    "id": "alien-dictionary",
    "title": "Alien Dictionary",
    "number": 269,
    "difficulty": "Hard",
    "category": "Advanced Graphs",
    "pattern": "Topological Sort",
    "description": "The words are sorted according to an unknown alphabet. Infer one valid ordering of all characters that appears in the words. Return an empty string when the ordering rules are contradictory or a longer word appears before its exact prefix.",
    "examples": [
      {
        "input": "words = [\"wrt\",\"wrf\",\"er\",\"ett\",\"rftt\"]",
        "output": "\"wertf\"",
        "explanation": "The adjacent word pairs imply w before e, e before r, r before t, and t before f."
      },
      {
        "input": "words = [\"z\",\"x\"]",
        "output": "\"zx\""
      },
      {
        "input": "words = [\"z\",\"x\",\"z\"]",
        "output": "\"\"",
        "explanation": "The rules would require both z before x and x before z."
      }
    ],
    "constraints": [
      "1 <= words.length <= 100",
      "1 <= words[i].length <= 100",
      "Words contain lowercase English letters",
      "Return any valid alphabet order if several exist"
    ],
    "hints": [
      "Only the first different character between adjacent words gives a new rule.",
      "A word cannot come before its own shorter prefix.",
      "Once rules are edges, the answer is a topological ordering or empty on a cycle."
    ],
    "signature": {
      "kind": "function",
      "name": "alienOrder",
      "params": [
        {
          "name": "words",
          "type": "string[]"
        }
      ],
      "returns": "string"
    },
    "compare": "alienOrder",
    "tests": [
      {
        "args": [
          ["wrt", "wrf", "er", "ett", "rftt"]
        ],
        "expected": "wertf"
      },
      {
        "args": [
          ["z", "x"]
        ],
        "expected": "zx"
      },
      {
        "args": [
          ["z", "x", "z"]
        ],
        "expected": ""
      },
      {
        "args": [
          ["abc", "ab"]
        ],
        "expected": ""
      },
      {
        "args": [
          ["a", "b", "c"]
        ],
        "expected": "abc"
      },
      {
        "args": [
          ["za", "zb", "ca", "cb"]
        ],
        "expected": "azbc"
      },
      {
        "args": [
          ["x"]
        ],
        "expected": "x"
      },
      {
        "args": [
          ["baa", "abcd", "abca", "cab", "cad"]
        ],
        "expected": "bdac"
      }
    ],
    "solutions": [
      {
        "title": "Kahn topological sort",
        "explanation": `**Intuition:** The first differing character between adjacent sorted words reveals one precedence edge. The alien alphabet is any topological order of those edges.

**Steps:**
1. Create a graph node for every character that appears.
2. Compare each neighboring word pair to add the first differing edge.
3. Reject the invalid prefix case, such as abc before ab.
4. Run Kahn's algorithm and return all characters if no cycle remains.

**Correctness:** In a sorted dictionary, earlier equal prefixes carry no information and the first unequal characters must be ordered. All valid alphabets are exactly topological orders of these constraints. Kahn's algorithm returns such an order iff the graph is acyclic.

**Pitfalls:** Always include isolated letters and avoid double-counting the same edge in the indegree.`,
        "time": "O(C + U^2)",
        "space": "O(C + U)",
        "python": `class Solution:
    def alienOrder(self, words: List[str]) -> str:
        graph = {c: set() for word in words for c in word}
        indeg = {c: 0 for c in graph}
        for a, b in zip(words, words[1:]):
            j = 0
            while j < min(len(a), len(b)) and a[j] == b[j]:
                j += 1
            if j == min(len(a), len(b)):
                if len(a) > len(b):
                    return ""
            elif b[j] not in graph[a[j]]:
                graph[a[j]].add(b[j])
                indeg[b[j]] += 1
        q = deque([c for c in indeg if indeg[c] == 0])
        order = []
        while q:
            c = q.popleft()
            order.append(c)
            for nxt in graph[c]:
                indeg[nxt] -= 1
                if indeg[nxt] == 0:
                    q.append(nxt)
        return "" if len(order) != len(indeg) else "".join(order)
`,
        "cpp": `class Solution {
public:
    string alienOrder(vector<string>& words) {
        unordered_map<char, unordered_set<char>> graph;
        unordered_map<char, int> indeg;
        for (auto& w : words) for (char c : w) { graph[c]; indeg[c] = 0; }
        for (int i = 0; i + 1 < (int)words.size(); ++i) {
            string a = words[i], b = words[i + 1];
            int j = 0, m = min(a.size(), b.size());
            while (j < m && a[j] == b[j]) ++j;
            if (j == m) {
                if (a.size() > b.size()) return "";
            } else if (!graph[a[j]].count(b[j])) {
                graph[a[j]].insert(b[j]);
                indeg[b[j]]++;
            }
        }
        queue<char> q;
        for (auto& [c, d] : indeg) if (d == 0) q.push(c);
        string out;
        while (!q.empty()) {
            char c = q.front(); q.pop();
            out.push_back(c);
            for (char nb : graph[c]) if (--indeg[nb] == 0) q.push(nb);
        }
        return out.size() == indeg.size() ? out : "";
    }
};`
      },
      {
        "title": "DFS cycle detection",
        "explanation": `**Intuition:** A directed cycle means contradictory alphabet rules. Depth-first search can detect cycles while building a reverse postorder alphabet.

**Steps:**
1. Build the same first-difference graph and handle invalid prefixes.
2. Mark each character as unvisited, visiting, or done.
3. During DFS, seeing a visiting node means a cycle.
4. Append nodes after their neighbors and reverse at the end.

**Correctness:** DFS postorder places every source before its descendants after reversal. The visiting mark detects exactly back edges, which are directed cycles and make an alphabet impossible.

**Pitfalls:** Run DFS from every character, including letters that never appear in an edge.`,
        "time": "O(C + E)",
        "space": "O(C + E)",
        "python": `class Solution:
    def alienOrder(self, words: List[str]) -> str:
        graph = {c: set() for word in words for c in word}
        for a, b in zip(words, words[1:]):
            j = 0
            while j < min(len(a), len(b)) and a[j] == b[j]:
                j += 1
            if j == min(len(a), len(b)):
                if len(a) > len(b):
                    return ""
            else:
                graph[a[j]].add(b[j])
        state = {}
        order = []
        def dfs(c: str) -> bool:
            if c in state:
                return state[c] == 2
            state[c] = 1
            for nxt in graph[c]:
                if not dfs(nxt):
                    return False
            state[c] = 2
            order.append(c)
            return True
        for c in graph:
            if not dfs(c):
                return ""
        return "".join(reversed(order))
`,
        "cpp": `class Solution {
    unordered_map<char, unordered_set<char>> graph;
    unordered_map<char, int> state;
    string order;
    bool dfs(char c) {
        if (state[c]) return state[c] == 2;
        state[c] = 1;
        for (char nb : graph[c]) if (!dfs(nb)) return false;
        state[c] = 2;
        order.push_back(c);
        return true;
    }
public:
    string alienOrder(vector<string>& words) {
        graph.clear(); state.clear(); order.clear();
        for (auto& w : words) for (char c : w) graph[c];
        for (int i = 0; i + 1 < (int)words.size(); ++i) {
            string a = words[i], b = words[i + 1];
            int j = 0, m = min(a.size(), b.size());
            while (j < m && a[j] == b[j]) ++j;
            if (j == m) {
                if (a.size() > b.size()) return "";
            } else graph[a[j]].insert(b[j]);
        }
        for (auto& [c, _] : graph) if (!dfs(c)) return "";
        reverse(order.begin(), order.end());
        return order;
    }
};`
      }
    ],
    "viz": "graph-traversal"
  },
  {
    "id": "cheapest-flights-within-k-stops",
    "title": "Cheapest Flights Within K Stops",
    "number": 787,
    "difficulty": "Medium",
    "category": "Advanced Graphs",
    "pattern": "Constrained Shortest Path",
    "description": "Given directed flights with prices, find the cheapest price from src to dst using at most k intermediate stops. Return -1 if no route satisfies the stop limit.",
    "examples": [
      {
        "input": "n = 4, flights = [[0,1,100],[1,2,100],[2,0,100],[1,3,600],[2,3,200]], src = 0, dst = 3, k = 1",
        "output": "700",
        "explanation": "The route 0 -> 1 -> 3 uses one stop and costs 700."
      },
      {
        "input": "n = 3, flights = [[0,1,100],[1,2,100],[0,2,500]], src = 0, dst = 2, k = 1",
        "output": "200"
      },
      {
        "input": "n = 3, flights = [[0,1,100],[1,2,100],[0,2,500]], src = 0, dst = 2, k = 0",
        "output": "500",
        "explanation": "With zero stops only direct flights are allowed."
      }
    ],
    "constraints": [
      "1 <= n <= 100",
      "0 <= flights.length <= n * (n - 1)",
      "flights[i] = [from, to, price] with price > 0",
      "0 <= src, dst, k < n and src != dst"
    ],
    "hints": [
      "The number of flights is part of the state.",
      "Relaxing all flights from a snapshot once per edge count prevents overusing stops.",
      "At most k stops means at most k + 1 flights."
    ],
    "signature": {
      "kind": "function",
      "name": "findCheapestPrice",
      "params": [
        {
          "name": "n",
          "type": "int"
        },
        {
          "name": "flights",
          "type": "int[][]"
        },
        {
          "name": "src",
          "type": "int"
        },
        {
          "name": "dst",
          "type": "int"
        },
        {
          "name": "k",
          "type": "int"
        }
      ],
      "returns": "int"
    },
    "tests": [
      {
        "args": [
          4,
          [
            [0, 1, 100],
            [1, 2, 100],
            [2, 0, 100],
            [1, 3, 600],
            [2, 3, 200]
          ],
          0,
          3,
          1
        ],
        "expected": 700
      },
      {
        "args": [
          3,
          [
            [0, 1, 100],
            [1, 2, 100],
            [0, 2, 500]
          ],
          0,
          2,
          1
        ],
        "expected": 200
      },
      {
        "args": [
          3,
          [
            [0, 1, 100],
            [1, 2, 100],
            [0, 2, 500]
          ],
          0,
          2,
          0
        ],
        "expected": 500
      },
      {
        "args": [
          4,
          [
            [0, 1, 100],
            [2, 3, 100]
          ],
          0,
          3,
          1
        ],
        "expected": -1
      },
      {
        "args": [
          4,
          [
            [0, 1, 1],
            [1, 2, 1],
            [2, 3, 1],
            [0, 3, 10]
          ],
          0,
          3,
          2
        ],
        "expected": 3
      },
      {
        "args": [
          4,
          [
            [0, 1, 1],
            [1, 2, 1],
            [2, 3, 1],
            [0, 3, 10]
          ],
          0,
          3,
          1
        ],
        "expected": 10
      },
      {
        "args": [
          3,
          [
            [0, 1, 5],
            [1, 0, 5],
            [1, 2, 5],
            [0, 2, 50]
          ],
          0,
          2,
          2
        ],
        "expected": 10
      },
      {
        "args": [
          3,
          [
            [0, 1, 100],
            [0, 1, 20],
            [1, 2, 20],
            [0, 2, 100]
          ],
          0,
          2,
          1
        ],
        "expected": 40
      }
    ],
    "solutions": [
      {
        "title": "Stop-limited Bellman-Ford",
        "explanation": `**Intuition:** A route with at most k stops uses at most k + 1 flights. Relaxing from a snapshot once per flight count keeps routes within that limit.

**Steps:**
1. Initialize the source cost to 0 and all other cities to infinity.
2. Repeat k + 1 times, copying the previous cost array.
3. Relax every flight from the previous array into the copy.
4. The destination entry is the cheapest legal route if finite.

**Correctness:** After i rounds, dist[v] is the best cost to v using at most i flights. Each round appends one flight to a route from the previous round, so after k + 1 rounds every allowed route has been considered and no route with too many flights leaks in.

**Pitfalls:** Updating in place would accidentally use multiple new flights in the same round.`,
        "time": "O(kE)",
        "space": "O(V)",
        "python": `class Solution:
    def findCheapestPrice(self, n: int, flights: List[List[int]], src: int, dst: int, k: int) -> int:
        inf = 10**15
        dist = [inf] * n
        dist[src] = 0
        for _ in range(k + 1):
            nxt = dist[:]
            for u, v, w in flights:
                if dist[u] + w < nxt[v]:
                    nxt[v] = dist[u] + w
            dist = nxt
        return -1 if dist[dst] == inf else dist[dst]
`,
        "cpp": `class Solution {
public:
    int findCheapestPrice(int n, vector<vector<int>>& flights, int src, int dst, int k) {
        const int INF = 1e9;
        vector<int> dist(n, INF);
        dist[src] = 0;
        for (int step = 0; step <= k; ++step) {
            vector<int> nxt = dist;
            for (auto& f : flights) {
                int u = f[0], v = f[1], w = f[2];
                if (dist[u] != INF) nxt[v] = min(nxt[v], dist[u] + w);
            }
            dist.swap(nxt);
        }
        return dist[dst] == INF ? -1 : dist[dst];
    }
};`
      },
      {
        "title": "Dijkstra with flight count state",
        "explanation": `**Intuition:** The cheapest partial route is still useful, but the remaining stop budget matters. Store city and number of flights taken as the state.

**Steps:**
1. Build an adjacency list of flights.
2. Push (cost, city, flights used) for the source.
3. Pop the cheapest state; if it is the destination, return it.
4. Expand neighbors only while flights used is at most k.

**Correctness:** All edge costs are non-negative, so priority-queue order returns states by increasing cost. Because the state includes the number of flights used, pruning never mixes routes with different remaining budgets. The first destination state popped is therefore the cheapest legal route.

**Pitfalls:** k stops means k + 1 flights, not k flights.`,
        "time": "O((E k) log(V k))",
        "space": "O(V k + E)",
        "python": `class Solution:
    def findCheapestPrice(self, n: int, flights: List[List[int]], src: int, dst: int, k: int) -> int:
        graph = defaultdict(list)
        for u, v, w in flights:
            graph[u].append((v, w))
        heap = [(0, src, 0)]
        best = {(src, 0): 0}
        while heap:
            cost, city, used = heappop(heap)
            if city == dst:
                return cost
            if used == k + 1:
                continue
            if cost != best.get((city, used)):
                continue
            for nxt, price in graph[city]:
                state = (nxt, used + 1)
                new_cost = cost + price
                if new_cost < best.get(state, 10**15):
                    best[state] = new_cost
                    heappush(heap, (new_cost, nxt, used + 1))
        return -1
`,
        "cpp": `class Solution {
public:
    int findCheapestPrice(int n, vector<vector<int>>& flights, int src, int dst, int k) {
        vector<vector<pair<int,int>>> graph(n);
        for (auto& f : flights) graph[f[0]].push_back({f[1], f[2]});
        const int INF = 1e9;
        vector<vector<int>> best(n, vector<int>(k + 2, INF));
        priority_queue<array<int,3>, vector<array<int,3>>, greater<array<int,3>>> pq;
        pq.push({0, src, 0});
        best[src][0] = 0;
        while (!pq.empty()) {
            auto [cost, city, used] = pq.top(); pq.pop();
            if (city == dst) return cost;
            if (used == k + 1 || cost != best[city][used]) continue;
            for (auto [nxt, price] : graph[city]) {
                int nc = cost + price;
                if (nc < best[nxt][used + 1]) {
                    best[nxt][used + 1] = nc;
                    pq.push({nc, nxt, used + 1});
                }
            }
        }
        return -1;
    }
};`
      }
    ],
    "viz": "dijkstra"
  }
]

export default problems
