import type { DsaProblem } from '../../types/content'

const problems: DsaProblem[] = [
  {
    id: "number-of-islands",
    title: "Number of Islands",
    number: 200,
    difficulty: "Medium",
    category: "Graphs",
    pattern: "Grid DFS/BFS",
    description: "Implement `numIslands(grid)`. The grid contains `'1'` for land and `'0'` for water. Count how many four-directionally connected land masses exist.",
    examples: [
      {
        input: "grid = [[\"1\",\"1\",\"1\",\"1\",\"0\"],[\"1\",\"1\",\"0\",\"1\",\"0\"],[\"1\",\"1\",\"0\",\"0\",\"0\"],[\"0\",\"0\",\"0\",\"0\",\"0\"]]",
        output: "1",
        explanation: "All land cells connect into one component."
      },
      {
        input: "grid = [[\"1\",\"1\",\"0\",\"0\",\"0\"],[\"1\",\"1\",\"0\",\"0\",\"0\"],[\"0\",\"0\",\"1\",\"0\",\"0\"],[\"0\",\"0\",\"0\",\"1\",\"1\"]]",
        output: "3",
        explanation: "Three separate land components are present."
      },
      {
        input: "grid = [[\"0\"]]",
        output: "0",
        explanation: "A grid with only water has no islands."
      }
    ],
    constraints: ["`1 <= grid.length, grid[i].length <= 300` in the original problem","Each cell is `'0'` or `'1'`.","Connections are horizontal or vertical, not diagonal.","The input grid may be modified by the solution."],
    hints: ["An island is a connected component of land cells.","When you find unvisited land, count it and flood-fill all land reachable from it.","Mark cells as water or visited during the flood fill to avoid counting them again."],
    signature: {
      kind: "function",
      name: "numIslands",
      params: [
        {
          name: "grid",
          type: "char[][]"
        }
      ],
      returns: "int"
    },
    tests: [
      {
        args: [
          [["1","1","1","1","0"],["1","1","0","1","0"],["1","1","0","0","0"],["0","0","0","0","0"]]
        ],
        expected: 1
      },
      {
        args: [
          [["1","1","0","0","0"],["1","1","0","0","0"],["0","0","1","0","0"],["0","0","0","1","1"]]
        ],
        expected: 3
      },
      {
        args: [
          [["0"]]
        ],
        expected: 0
      },
      {
        args: [
          [["1"]]
        ],
        expected: 1
      },
      {
        args: [
          [["0","0"],["0","0"]]
        ],
        expected: 0
      },
      {
        args: [
          [["1","0","1"],["0","1","0"],["1","0","1"]]
        ],
        expected: 5
      },
      {
        args: [
          [["1","1","1"],["0","1","0"],["1","1","1"]]
        ],
        expected: 1
      },
      {
        args: [
          [["1","0","1","0","1"]]
        ],
        expected: 3
      }
    ],
    viz: "graph-traversal",
    solutions: [
      {
        title: "DFS sinking",
        explanation: `**Intuition.** Treat each discovered land cell as the start of one component, then sink that entire component to water.

**Steps.**
1. Scan every cell.
2. When a \`'1'\` is found, increment the answer.
3. Run DFS to change that cell and all connected land cells to \`'0'\`.
4. Continue scanning; sunk land cannot be counted again.

**Correctness.** Each increment corresponds to a land cell not reachable from any earlier island, so it starts a new island. DFS removes exactly all land in that island, preventing duplicate counts. Therefore the final count equals the number of land components.

**Pitfalls.** Do not consider diagonal neighbors; they are separate islands.`,
        time: "O(R * C)",
        space: "O(R * C) recursion in the worst case",
        python: `class Solution:
    def numIslands(self, grid: List[List[str]]) -> int:
        if not grid:
            return 0
        rows, cols = len(grid), len(grid[0])
        def dfs(r: int, c: int) -> None:
            if r < 0 or c < 0 or r == rows or c == cols or grid[r][c] != '1':
                return
            grid[r][c] = '0'
            dfs(r + 1, c); dfs(r - 1, c); dfs(r, c + 1); dfs(r, c - 1)
        count = 0
        for r in range(rows):
            for c in range(cols):
                if grid[r][c] == '1':
                    count += 1
                    dfs(r, c)
        return count
`,
        cpp: `class Solution {
public:
    int numIslands(vector<vector<char>>& grid) {
        if (grid.empty()) return 0;
        int rows = grid.size(), cols = grid[0].size(), count = 0;
        function<void(int,int)> dfs = [&](int r, int c) {
            if (r < 0 || c < 0 || r == rows || c == cols || grid[r][c] != '1') return;
            grid[r][c] = '0';
            dfs(r + 1, c); dfs(r - 1, c); dfs(r, c + 1); dfs(r, c - 1);
        };
        for (int r = 0; r < rows; ++r) for (int c = 0; c < cols; ++c) {
            if (grid[r][c] == '1') {
                ++count;
                dfs(r, c);
            }
        }
        return count;
    }
};`
      },
      {
        title: "BFS with visited set",
        explanation: `**Intuition.** Use an explicit queue for each island instead of recursion, leaving the grid values unchanged except for visited bookkeeping.

**Steps.**
1. Scan for land cells that are not visited.
2. Start a queue from each such cell and mark it visited.
3. Pop cells and push unvisited land neighbors.
4. One queue run equals one island.

**Correctness.** BFS visits exactly the connected component containing its start cell. Since a cell is marked before being queued, every land cell belongs to exactly one BFS run, and the number of runs is the island count.

**Pitfalls.** Mark a neighbor when enqueuing, not when dequeuing, to avoid repeated queue entries.`,
        time: "O(R * C)",
        space: "O(R * C)",
        python: `class Solution:
    def numIslands(self, grid: List[List[str]]) -> int:
        rows, cols = len(grid), len(grid[0])
        seen = [[False] * cols for _ in range(rows)]
        ans = 0
        for r in range(rows):
            for c in range(cols):
                if grid[r][c] == '1' and not seen[r][c]:
                    ans += 1
                    q = deque([(r, c)])
                    seen[r][c] = True
                    while q:
                        x, y = q.popleft()
                        for dx, dy in ((1,0),(-1,0),(0,1),(0,-1)):
                            nx, ny = x + dx, y + dy
                            if 0 <= nx < rows and 0 <= ny < cols and grid[nx][ny] == '1' and not seen[nx][ny]:
                                seen[nx][ny] = True
                                q.append((nx, ny))
        return ans
`,
        cpp: `class Solution {
public:
    int numIslands(vector<vector<char>>& grid) {
        int rows = grid.size(), cols = grid[0].size(), ans = 0;
        vector<vector<int>> seen(rows, vector<int>(cols));
        int dirs[5] = {1, 0, -1, 0, 1};
        for (int r = 0; r < rows; ++r) for (int c = 0; c < cols; ++c) {
            if (grid[r][c] == '1' && !seen[r][c]) {
                ++ans;
                queue<pair<int,int>> q;
                q.push({r, c});
                seen[r][c] = 1;
                while (!q.empty()) {
                    auto [x, y] = q.front(); q.pop();
                    for (int k = 0; k < 4; ++k) {
                        int nx = x + dirs[k], ny = y + dirs[k + 1];
                        if (nx >= 0 && ny >= 0 && nx < rows && ny < cols && grid[nx][ny] == '1' && !seen[nx][ny]) {
                            seen[nx][ny] = 1;
                            q.push({nx, ny});
                        }
                    }
                }
            }
        }
        return ans;
    }
};`
      }
    ]
  },
  {
    id: "max-area-of-island",
    title: "Max Area of Island",
    number: 695,
    difficulty: "Medium",
    category: "Graphs",
    pattern: "Grid Component Size",
    description: "Implement `maxAreaOfIsland(grid)`. Cells with `1` are land and cells with `0` are water. Return the largest number of cells in any four-directionally connected island, or `0` if there is no land.",
    examples: [
      {
        input: "grid = [[0,0,1,0,0,0,0,1,0,0,0,0,0],[0,0,0,0,0,0,0,1,1,1,0,0,0],[0,1,1,0,1,0,0,0,0,0,0,0,0],[0,1,0,0,1,1,0,0,1,0,1,0,0],[0,1,0,0,1,1,0,0,1,1,1,0,0],[0,0,0,0,0,0,0,0,0,0,1,0,0],[0,0,0,0,0,0,0,1,1,1,0,0,0],[0,0,0,0,0,0,0,1,1,0,0,0,0]]",
        output: "6",
        explanation: "The largest component in the sample contains six land cells."
      },
      {
        input: "grid = [[0,0,0,0,0,0,0,0]]",
        output: "0",
        explanation: "No land means the maximum area is zero."
      },
      {
        input: "grid = [[1]]",
        output: "1",
        explanation: "A single land cell has area one."
      }
    ],
    constraints: ["`1 <= grid.length, grid[i].length <= 50`","Each cell is `0` or `1`.","Connections are four-directional.","The input grid may be changed by the solution."],
    hints: ["This is the same component traversal as islands, but you need a size.","Return `0` from DFS when the cell is out of bounds or water.","For each land cell, compute its component area and maximize the answer."],
    signature: {
      kind: "function",
      name: "maxAreaOfIsland",
      params: [
        {
          name: "grid",
          type: "int[][]"
        }
      ],
      returns: "int"
    },
    tests: [
      {
        args: [
          [[0,0,1,0,0,0,0,1,0,0,0,0,0],[0,0,0,0,0,0,0,1,1,1,0,0,0],[0,1,1,0,1,0,0,0,0,0,0,0,0],[0,1,0,0,1,1,0,0,1,0,1,0,0],[0,1,0,0,1,1,0,0,1,1,1,0,0],[0,0,0,0,0,0,0,0,0,0,1,0,0],[0,0,0,0,0,0,0,1,1,1,0,0,0],[0,0,0,0,0,0,0,1,1,0,0,0,0]]
        ],
        expected: 6
      },
      {
        args: [
          [[0,0,0,0,0,0,0,0]]
        ],
        expected: 0
      },
      {
        args: [
          [[1]]
        ],
        expected: 1
      },
      {
        args: [
          [[1,1],[1,0]]
        ],
        expected: 3
      },
      {
        args: [
          [[1,0,1],[1,1,0]]
        ],
        expected: 3
      },
      {
        args: [
          [[0,0],[0,0]]
        ],
        expected: 0
      },
      {
        args: [
          [[1,0,1],[0,1,0],[1,0,1]]
        ],
        expected: 1
      },
      {
        args: [
          [[1,1,1],[1,1,1],[1,1,1]]
        ],
        expected: 9
      }
    ],
    viz: "graph-traversal",
    solutions: [
      {
        title: "DFS area count",
        explanation: `**Intuition.** Flood-fill each island and make the DFS return how many cells it consumed.

**Steps.**
1. Scan every grid cell.
2. For a land cell, set it to water and recursively count its neighbors.
3. Take the maximum returned count.
4. Water cells contribute zero.

**Correctness.** Each DFS consumes exactly one island and returns its size by summing one for the start plus all reachable land. Taking the maximum over all starts therefore returns the largest island area.

**Pitfalls.** Mark before recursing; otherwise two adjacent land cells can call each other forever.`,
        time: "O(R * C)",
        space: "O(R * C) recursion in the worst case",
        python: `class Solution:
    def maxAreaOfIsland(self, grid: List[List[int]]) -> int:
        rows, cols = len(grid), len(grid[0])
        def dfs(r: int, c: int) -> int:
            if r < 0 or c < 0 or r == rows or c == cols or grid[r][c] == 0:
                return 0
            grid[r][c] = 0
            return 1 + dfs(r + 1, c) + dfs(r - 1, c) + dfs(r, c + 1) + dfs(r, c - 1)
        best = 0
        for r in range(rows):
            for c in range(cols):
                best = max(best, dfs(r, c))
        return best
`,
        cpp: `class Solution {
public:
    int maxAreaOfIsland(vector<vector<int>>& grid) {
        int rows = grid.size(), cols = grid[0].size();
        function<int(int,int)> dfs = [&](int r, int c) {
            if (r < 0 || c < 0 || r == rows || c == cols || grid[r][c] == 0) return 0;
            grid[r][c] = 0;
            return 1 + dfs(r + 1, c) + dfs(r - 1, c) + dfs(r, c + 1) + dfs(r, c - 1);
        };
        int best = 0;
        for (int r = 0; r < rows; ++r) for (int c = 0; c < cols; ++c) best = max(best, dfs(r, c));
        return best;
    }
};`
      },
      {
        title: "Iterative BFS area",
        explanation: `**Intuition.** A queue avoids recursion depth concerns while counting the same connected components.

**Steps.**
1. When an unvisited land cell is found, enqueue it and mark it visited.
2. Pop cells, increment the current area, and enqueue unvisited land neighbors.
3. Update the maximum area after the queue empties.
4. Continue scanning for other components.

**Correctness.** BFS reaches exactly the component of its start. The area counter increments once per visited cell, so it equals that component's size. The maximum over all components is the required answer.

**Pitfalls.** Use a separate \`seen\` grid if you do not want to mutate the input.`,
        time: "O(R * C)",
        space: "O(R * C)",
        python: `class Solution:
    def maxAreaOfIsland(self, grid: List[List[int]]) -> int:
        rows, cols = len(grid), len(grid[0])
        seen = [[False] * cols for _ in range(rows)]
        best = 0
        for r in range(rows):
            for c in range(cols):
                if grid[r][c] == 1 and not seen[r][c]:
                    q = deque([(r, c)])
                    seen[r][c] = True
                    area = 0
                    while q:
                        x, y = q.popleft()
                        area += 1
                        for dx, dy in ((1,0),(-1,0),(0,1),(0,-1)):
                            nx, ny = x + dx, y + dy
                            if 0 <= nx < rows and 0 <= ny < cols and grid[nx][ny] == 1 and not seen[nx][ny]:
                                seen[nx][ny] = True
                                q.append((nx, ny))
                    best = max(best, area)
        return best
`,
        cpp: `class Solution {
public:
    int maxAreaOfIsland(vector<vector<int>>& grid) {
        int rows = grid.size(), cols = grid[0].size(), best = 0;
        vector<vector<int>> seen(rows, vector<int>(cols));
        int dirs[5] = {1, 0, -1, 0, 1};
        for (int r = 0; r < rows; ++r) for (int c = 0; c < cols; ++c) {
            if (grid[r][c] == 1 && !seen[r][c]) {
                int area = 0;
                queue<pair<int,int>> q;
                q.push({r, c});
                seen[r][c] = 1;
                while (!q.empty()) {
                    auto [x, y] = q.front(); q.pop();
                    ++area;
                    for (int k = 0; k < 4; ++k) {
                        int nx = x + dirs[k], ny = y + dirs[k + 1];
                        if (nx >= 0 && ny >= 0 && nx < rows && ny < cols && grid[nx][ny] == 1 && !seen[nx][ny]) {
                            seen[nx][ny] = 1;
                            q.push({nx, ny});
                        }
                    }
                }
                best = max(best, area);
            }
        }
        return best;
    }
};`
      }
    ]
  },
  {
    id: "clone-graph",
    title: "Clone Graph",
    number: 133,
    difficulty: "Medium",
    category: "Graphs",
    pattern: "Graph Copy DFS/BFS",
    description: "Implement `cloneGraph(node)`. Given a reference to a node in a connected graph, create a deep copy with the same node values and neighbor relationships. Return the copied node corresponding to the input node, or `null` for an empty graph.",
    examples: [
      {
        input: "node = [[2,4],[1,3],[2,4],[1,3]]",
        output: "[[2,4],[1,3],[2,4],[1,3]]",
        explanation: "The square graph is copied with the same adjacency lists."
      },
      {
        input: "node = [[]]",
        output: "[[]]",
        explanation: "A single node with no neighbors remains a single isolated copy."
      },
      {
        input: "node = []",
        output: "[]",
        explanation: "An empty input returns an empty graph."
      }
    ],
    constraints: ["Node values are unique integers from `1` to the number of nodes.","The graph may contain cycles.","Neighbors should appear in the same order as the original adjacency list.","The returned graph must not reuse original node objects."],
    hints: ["A cycle means you cannot recursively copy neighbors without remembering completed copies.","Map each original node pointer to its cloned node.","Create the clone before visiting neighbors so a cycle can point back to it."],
    signature: {
      kind: "function",
      name: "cloneGraph",
      params: [
        {
          name: "node",
          type: "GraphNode"
        }
      ],
      returns: "GraphNode"
    },
    tests: [
      {
        args: [
          [[2,4],[1,3],[2,4],[1,3]]
        ],
        expected: [[2,4],[1,3],[2,4],[1,3]]
      },
      {
        args: [
          [[]]
        ],
        expected: [[]]
      },
      {
        args: [[]],
        expected: []
      },
      {
        args: [
          [[2],[1]]
        ],
        expected: [[2],[1]]
      },
      {
        args: [
          [[2,3],[1,3],[1,2]]
        ],
        expected: [[2,3],[1,3],[1,2]]
      },
      {
        args: [
          [[2,3,4],[1,3],[1,2,4],[1,3]]
        ],
        expected: [[2,3,4],[1,3],[1,2,4],[1,3]]
      },
      {
        args: [
          [[2],[1,3],[2,4],[3,5],[4]]
        ],
        expected: [[2],[1,3],[2,4],[3,5],[4]]
      },
      {
        args: [
          [[2,5],[1,3],[2,4],[3,5],[1,4]]
        ],
        expected: [[2,5],[1,3],[2,4],[3,5],[1,4]]
      }
    ],
    viz: "graph-traversal",
    solutions: [
      {
        title: "DFS with original-to-copy map",
        explanation: `**Intuition.** The first time a node is seen, allocate its copy and remember it. Later visits reuse the remembered copy.

**Steps.**
1. If the input is null, return null.
2. Define \`dfs(original)\` that returns the clone of \`original\`.
3. Allocate and store a clone before recursing to neighbors.
4. Fill the clone's neighbor list with recursive clone results.

**Correctness.** The map ensures one clone per original node. Every original edge \`u -> v\` is processed when \`u\`'s neighbors are copied, adding the cloned \`v\` to cloned \`u\`. Thus all reachable structure is preserved and no original nodes are returned.

**Pitfalls.** Store the clone before recursing; otherwise a cycle causes infinite recursion.`,
        time: "O(V + E)",
        space: "O(V) for the map and recursion stack",
        python: `class Solution:
    def cloneGraph(self, node: 'Node') -> 'Node':
        seen = {}
        def dfs(cur):
            if cur is None:
                return None
            if cur in seen:
                return seen[cur]
            copy_node = Node(cur.val)
            seen[cur] = copy_node
            copy_node.neighbors = [dfs(nei) for nei in cur.neighbors]
            return copy_node
        return dfs(node)
`,
        cpp: `class Solution {
public:
    Node* cloneGraph(Node* node) {
        unordered_map<Node*, Node*> seen;
        function<Node*(Node*)> dfs = [&](Node* cur) -> Node* {
            if (!cur) return nullptr;
            if (seen.count(cur)) return seen[cur];
            Node* copy = new Node(cur->val);
            seen[cur] = copy;
            for (Node* nei : cur->neighbors) copy->neighbors.push_back(dfs(nei));
            return copy;
        };
        return dfs(node);
    }
};`
      },
      {
        title: "BFS cloning",
        explanation: `**Intuition.** Create clones level by level. Whenever a neighbor has not been cloned yet, allocate it and enqueue the original neighbor.

**Steps.**
1. Return null for null input.
2. Create the starting clone and push the original start into a queue.
3. For each popped original node, inspect its neighbors.
4. Create missing neighbor clones and append them to the current clone's neighbor list.

**Correctness.** BFS eventually visits every node reachable from the start. The map provides exactly one clone for each node, and every neighbor relation is appended while processing the original edge, so the copied adjacency matches the input.

**Pitfalls.** Append \`seen[nei]\`, not the original neighbor, to the clone's neighbor list.`,
        time: "O(V + E)",
        space: "O(V)",
        python: `class Solution:
    def cloneGraph(self, node: 'Node') -> 'Node':
        if node is None:
            return None
        seen = {node: Node(node.val)}
        q = deque([node])
        while q:
            cur = q.popleft()
            for nei in cur.neighbors:
                if nei not in seen:
                    seen[nei] = Node(nei.val)
                    q.append(nei)
                seen[cur].neighbors.append(seen[nei])
        return seen[node]
`,
        cpp: `class Solution {
public:
    Node* cloneGraph(Node* node) {
        if (!node) return nullptr;
        unordered_map<Node*, Node*> seen;
        queue<Node*> q;
        seen[node] = new Node(node->val);
        q.push(node);
        while (!q.empty()) {
            Node* cur = q.front(); q.pop();
            for (Node* nei : cur->neighbors) {
                if (!seen.count(nei)) {
                    seen[nei] = new Node(nei->val);
                    q.push(nei);
                }
                seen[cur]->neighbors.push_back(seen[nei]);
            }
        }
        return seen[node];
    }
};`
      }
    ]
  },
  {
    id: "walls-and-gates",
    title: "Walls and Gates",
    number: 286,
    difficulty: "Medium",
    category: "Graphs",
    pattern: "Multi-Source BFS",
    description: "Implement `wallsAndGates(rooms)`. The matrix contains gates (`0`), walls (`-1`), and empty rooms (`2147483647`). Mutate each empty room to the distance to its nearest gate, leaving walls and unreachable rooms unchanged.",
    examples: [
      {
        input: "rooms = [[2147483647,-1,0,2147483647],[2147483647,2147483647,2147483647,-1],[2147483647,-1,2147483647,-1],[0,-1,2147483647,2147483647]]",
        output: "[[3,-1,0,1],[2,2,1,-1],[1,-1,2,-1],[0,-1,3,4]]",
        explanation: "Distances spread from both gates at once."
      },
      {
        input: "rooms = [[0]]",
        output: "[[0]]",
        explanation: "A gate is already distance zero."
      },
      {
        input: "rooms = [[2147483647]]",
        output: "[[2147483647]]",
        explanation: "With no reachable gate, the room stays at `INF`."
      }
    ],
    constraints: ["`1 <= rooms.length, rooms[i].length <= 250`","`rooms[r][c]` is `-1`, `0`, or `2147483647`.","Distance is measured by four-directional steps.","The function returns `void`; judge checks the mutated matrix."],
    hints: ["A nearest-gate distance asks for BFS, not DFS from every room.","Put all gates in the queue initially.","The first time BFS reaches an empty room is through the shortest path to a gate."],
    signature: {
      kind: "function",
      name: "wallsAndGates",
      params: [
        {
          name: "rooms",
          type: "int[][]"
        }
      ],
      returns: "void",
      inPlace: 0
    },
    tests: [
      {
        args: [
          [[2147483647,-1,0,2147483647],[2147483647,2147483647,2147483647,-1],[2147483647,-1,2147483647,-1],[0,-1,2147483647,2147483647]]
        ],
        expected: [[3,-1,0,1],[2,2,1,-1],[1,-1,2,-1],[0,-1,3,4]]
      },
      {
        args: [
          [[0]]
        ],
        expected: [[0]]
      },
      {
        args: [
          [[2147483647]]
        ],
        expected: [[2147483647]]
      },
      {
        args: [
          [[2147483647,0]]
        ],
        expected: [[1,0]]
      },
      {
        args: [
          [[2147483647,-1,0],[2147483647,2147483647,2147483647]]
        ],
        expected: [[4,-1,0],[3,2,1]]
      },
      {
        args: [
          [[-1]]
        ],
        expected: [[-1]]
      },
      {
        args: [
          [[2147483647,2147483647],[2147483647,0]]
        ],
        expected: [[2,1],[1,0]]
      },
      {
        args: [
          [[0,2147483647,2147483647],[2147483647,-1,2147483647],[2147483647,2147483647,2147483647]]
        ],
        expected: [[0,1,2],[1,-1,3],[2,3,4]]
      }
    ],
    viz: "graph-traversal",
    solutions: [
      {
        title: "Multi-source BFS",
        explanation: `**Intuition.** All gates are sources with distance zero. BFS expands them together, so each room receives the earliest possible distance.

**Steps.**
1. Enqueue every gate cell.
2. Pop a cell and inspect four neighbors.
3. When a neighbor is \`INF\`, set it to current distance plus one and enqueue it.
4. Ignore walls, gates, and already-filled rooms.

**Correctness.** BFS processes cells by nondecreasing distance from the nearest starting gate. Therefore the first assignment to an empty room is its shortest gate distance; later paths would be no shorter and are ignored.

**Pitfalls.** Do not start a separate BFS from each empty room; that is much slower.`,
        time: "O(R * C)",
        space: "O(R * C)",
        python: `class Solution:
    def wallsAndGates(self, rooms: List[List[int]]) -> None:
        if not rooms:
            return
        rows, cols = len(rooms), len(rooms[0])
        q = deque()
        for r in range(rows):
            for c in range(cols):
                if rooms[r][c] == 0:
                    q.append((r, c))
        while q:
            r, c = q.popleft()
            for dr, dc in ((1,0),(-1,0),(0,1),(0,-1)):
                nr, nc = r + dr, c + dc
                if 0 <= nr < rows and 0 <= nc < cols and rooms[nr][nc] == 2147483647:
                    rooms[nr][nc] = rooms[r][c] + 1
                    q.append((nr, nc))
`,
        cpp: `class Solution {
public:
    void wallsAndGates(vector<vector<int>>& rooms) {
        if (rooms.empty()) return;
        int rows = rooms.size(), cols = rooms[0].size();
        queue<pair<int,int>> q;
        for (int r = 0; r < rows; ++r) for (int c = 0; c < cols; ++c) if (rooms[r][c] == 0) q.push({r, c});
        int dirs[5] = {1, 0, -1, 0, 1};
        while (!q.empty()) {
            auto [r, c] = q.front(); q.pop();
            for (int k = 0; k < 4; ++k) {
                int nr = r + dirs[k], nc = c + dirs[k + 1];
                if (nr >= 0 && nc >= 0 && nr < rows && nc < cols && rooms[nr][nc] == 2147483647) {
                    rooms[nr][nc] = rooms[r][c] + 1;
                    q.push({nr, nc});
                }
            }
        }
    }
};`
      },
      {
        title: "DFS relaxation from gates",
        explanation: `**Intuition.** A DFS can also work if it only continues when it improves a room's current distance.

**Steps.**
1. For every gate, call DFS with distance zero.
2. Reject out-of-bounds cells, walls, and cells whose current value is already smaller than the proposed distance.
3. Write the better distance.
4. Recurse to neighbors with distance plus one.

**Correctness.** A cell is updated only with a shorter distance. Starting from every gate considers all gate-to-room paths; repeated relaxation leaves each room with the minimum distance among those paths.

**Pitfalls.** This is correct but can revisit cells many times; BFS is preferred for large grids.`,
        time: "O(G * R * C) worst case",
        space: "O(R * C) recursion depth",
        python: `class Solution:
    def wallsAndGates(self, rooms: List[List[int]]) -> None:
        rows, cols = len(rooms), len(rooms[0])
        def dfs(r: int, c: int, dist: int) -> None:
            if r < 0 or c < 0 or r == rows or c == cols or rooms[r][c] < dist:
                return
            rooms[r][c] = dist
            dfs(r + 1, c, dist + 1)
            dfs(r - 1, c, dist + 1)
            dfs(r, c + 1, dist + 1)
            dfs(r, c - 1, dist + 1)
        for r in range(rows):
            for c in range(cols):
                if rooms[r][c] == 0:
                    dfs(r, c, 0)
`,
        cpp: `class Solution {
public:
    void wallsAndGates(vector<vector<int>>& rooms) {
        int rows = rooms.size(), cols = rooms[0].size();
        function<void(int,int,int)> dfs = [&](int r, int c, int dist) {
            if (r < 0 || c < 0 || r == rows || c == cols || rooms[r][c] < dist) return;
            rooms[r][c] = dist;
            dfs(r + 1, c, dist + 1);
            dfs(r - 1, c, dist + 1);
            dfs(r, c + 1, dist + 1);
            dfs(r, c - 1, dist + 1);
        };
        for (int r = 0; r < rows; ++r) for (int c = 0; c < cols; ++c) if (rooms[r][c] == 0) dfs(r, c, 0);
    }
};`
      }
    ]
  },
  {
    id: "rotting-oranges",
    title: "Rotting Oranges",
    number: 994,
    difficulty: "Medium",
    category: "Graphs",
    pattern: "Multi-Source BFS",
    description: "Implement `orangesRotting(grid)`. Fresh oranges (`1`) adjacent to rotten oranges (`2`) become rotten each minute; empty cells are `0`. Return the minutes needed to rot every fresh orange, or `-1` if some fresh orange can never be reached.",
    examples: [
      {
        input: "grid = [[2,1,1],[1,1,0],[0,1,1]]",
        output: "4",
        explanation: "The infection wave reaches the final fresh orange after four minutes."
      },
      {
        input: "grid = [[2,1,1],[0,1,1],[1,0,1]]",
        output: "-1",
        explanation: "One fresh orange is isolated by empty cells."
      },
      {
        input: "grid = [[0,2]]",
        output: "0",
        explanation: "No fresh oranges are present, so zero minutes are needed."
      }
    ],
    constraints: ["`1 <= grid.length, grid[i].length <= 10`","Each cell is `0`, `1`, or `2`.","Rot spreads four-directionally once per minute.","Return `-1` when at least one fresh orange remains unreachable."],
    hints: ["All initially rotten oranges begin spreading at minute zero.","A queue can store cells for the current infection frontier.","Count fresh oranges so you know whether the process finished."],
    signature: {
      kind: "function",
      name: "orangesRotting",
      params: [
        {
          name: "grid",
          type: "int[][]"
        }
      ],
      returns: "int"
    },
    tests: [
      {
        args: [
          [[2,1,1],[1,1,0],[0,1,1]]
        ],
        expected: 4
      },
      {
        args: [
          [[2,1,1],[0,1,1],[1,0,1]]
        ],
        expected: -1
      },
      {
        args: [
          [[0,2]]
        ],
        expected: 0
      },
      {
        args: [
          [[1]]
        ],
        expected: -1
      },
      {
        args: [
          [[2]]
        ],
        expected: 0
      },
      {
        args: [
          [[2,1,1]]
        ],
        expected: 2
      },
      {
        args: [
          [[2,1,1],[1,1,1],[0,1,2]]
        ],
        expected: 2
      },
      {
        args: [
          [[2,0,1]]
        ],
        expected: -1
      }
    ],
    viz: "graph-traversal",
    solutions: [
      {
        title: "Multi-source BFS by time",
        explanation: `**Intuition.** Each rotten orange is a source. BFS naturally models minute-by-minute spread from all sources at once.

**Steps.**
1. Collect all rotten cells in a queue and count fresh cells.
2. Pop a cell with its minute value.
3. When it rots a fresh neighbor, decrement the fresh count and enqueue the neighbor for \`minute + 1\`.
4. Return the last minute if no fresh cells remain; otherwise \`-1\`.

**Correctness.** BFS reaches each fresh orange at the earliest minute any rotten source can reach it. If a fresh orange is never reached, it is disconnected from all sources and the answer is \`-1\`; otherwise the last reached time is exactly when the grid finishes rotting.

**Pitfalls.** Return \`0\` when there are no fresh oranges at the start, even if rotten oranges exist.`,
        time: "O(R * C)",
        space: "O(R * C)",
        python: `class Solution:
    def orangesRotting(self, grid: List[List[int]]) -> int:
        rows, cols = len(grid), len(grid[0])
        q = deque()
        fresh = 0
        for r in range(rows):
            for c in range(cols):
                if grid[r][c] == 2:
                    q.append((r, c, 0))
                elif grid[r][c] == 1:
                    fresh += 1
        minutes = 0
        while q:
            r, c, minutes = q.popleft()
            for dr, dc in ((1,0),(-1,0),(0,1),(0,-1)):
                nr, nc = r + dr, c + dc
                if 0 <= nr < rows and 0 <= nc < cols and grid[nr][nc] == 1:
                    grid[nr][nc] = 2
                    fresh -= 1
                    q.append((nr, nc, minutes + 1))
        return minutes if fresh == 0 else -1
`,
        cpp: `class Solution {
public:
    int orangesRotting(vector<vector<int>>& grid) {
        int rows = grid.size(), cols = grid[0].size(), fresh = 0, minutes = 0;
        queue<tuple<int,int,int>> q;
        for (int r = 0; r < rows; ++r) for (int c = 0; c < cols; ++c) {
            if (grid[r][c] == 2) q.push({r, c, 0});
            else if (grid[r][c] == 1) ++fresh;
        }
        int dirs[5] = {1, 0, -1, 0, 1};
        while (!q.empty()) {
            auto [r, c, t] = q.front(); q.pop();
            minutes = t;
            for (int k = 0; k < 4; ++k) {
                int nr = r + dirs[k], nc = c + dirs[k + 1];
                if (nr >= 0 && nc >= 0 && nr < rows && nc < cols && grid[nr][nc] == 1) {
                    grid[nr][nc] = 2;
                    --fresh;
                    q.push({nr, nc, t + 1});
                }
            }
        }
        return fresh == 0 ? minutes : -1;
    }
};`
      },
      {
        title: "Minute simulation",
        explanation: `**Intuition.** Instead of storing times, repeatedly scan the grid to apply one minute of spread at a time.

**Steps.**
1. While a minute changes at least one orange, mark fresh cells adjacent to rotten cells to rot next.
2. After a full scan, convert all marked cells to rotten and increment time.
3. Stop when a scan changes nothing.
4. Return time if no fresh oranges remain; otherwise \`-1\`.

**Correctness.** Each scan applies exactly one simultaneous minute of spread because newly marked oranges are not used as sources until the next round. Therefore the number of rounds equals elapsed minutes.

**Pitfalls.** Use a temporary mark such as \`3\`; changing directly to \`2\` during the scan lets an orange spread too soon.`,
        time: "O((R * C)^2) worst case",
        space: "O(1) extra space",
        python: `class Solution:
    def orangesRotting(self, grid: List[List[int]]) -> int:
        rows, cols = len(grid), len(grid[0])
        minutes = 0
        while True:
            changed = False
            for r in range(rows):
                for c in range(cols):
                    if grid[r][c] != 1:
                        continue
                    for dr, dc in ((1,0),(-1,0),(0,1),(0,-1)):
                        nr, nc = r + dr, c + dc
                        if 0 <= nr < rows and 0 <= nc < cols and grid[nr][nc] == 2:
                            grid[r][c] = 3
                            changed = True
                            break
            if not changed:
                break
            for r in range(rows):
                for c in range(cols):
                    if grid[r][c] == 3:
                        grid[r][c] = 2
            minutes += 1
        return -1 if any(1 in row for row in grid) else minutes
`,
        cpp: `class Solution {
public:
    int orangesRotting(vector<vector<int>>& grid) {
        int rows = grid.size(), cols = grid[0].size(), minutes = 0;
        int dirs[5] = {1, 0, -1, 0, 1};
        while (true) {
            bool changed = false;
            for (int r = 0; r < rows; ++r) for (int c = 0; c < cols; ++c) {
                if (grid[r][c] != 1) continue;
                for (int k = 0; k < 4; ++k) {
                    int nr = r + dirs[k], nc = c + dirs[k + 1];
                    if (nr >= 0 && nc >= 0 && nr < rows && nc < cols && grid[nr][nc] == 2) {
                        grid[r][c] = 3;
                        changed = true;
                        break;
                    }
                }
            }
            if (!changed) break;
            for (auto& row : grid) for (int& x : row) if (x == 3) x = 2;
            ++minutes;
        }
        for (auto& row : grid) for (int x : row) if (x == 1) return -1;
        return minutes;
    }
};`
      }
    ]
  },
  {
    id: "pacific-atlantic-water-flow",
    title: "Pacific Atlantic Water Flow",
    number: 417,
    difficulty: "Medium",
    category: "Graphs",
    pattern: "Reverse Ocean Search",
    description: "Implement `pacificAtlantic(heights)`. Water can flow from a cell to an adjacent cell with height less than or equal to the current height. Return all coordinates that can reach both the Pacific border (top or left) and the Atlantic border (bottom or right).",
    examples: [
      {
        input: "heights = [[1,2,2,3,5],[3,2,3,4,4],[2,4,5,3,1],[6,7,1,4,5],[5,1,1,2,4]]",
        output: "[[0,4],[1,3],[1,4],[2,2],[3,0],[3,1],[4,0]]",
        explanation: "Reverse searches from both oceans meet at the returned coordinates."
      },
      {
        input: "heights = [[1]]",
        output: "[[0,0]]",
        explanation: "The only cell touches both oceans."
      },
      {
        input: "heights = [[1,2],[4,3]]",
        output: "[[0,1],[1,0],[1,1]]",
        explanation: "Several border and high cells can drain to both sides."
      }
    ],
    constraints: ["`1 <= heights.length, heights[i].length <= 200`","`0 <= heights[r][c] <= 10^5`","Coordinates are returned as `[row, col]`.","The order of coordinate rows is not important."],
    hints: ["Searching downhill from every cell repeats a lot of work.","Reverse the direction: from an ocean, move to neighbors that are at least as high.","A cell is in the answer if both ocean searches can reach it."],
    signature: {
      kind: "function",
      name: "pacificAtlantic",
      params: [
        {
          name: "heights",
          type: "int[][]"
        }
      ],
      returns: "int[][]"
    },
    tests: [
      {
        args: [
          [[1,2,2,3,5],[3,2,3,4,4],[2,4,5,3,1],[6,7,1,4,5],[5,1,1,2,4]]
        ],
        expected: [[0,4],[1,3],[1,4],[2,2],[3,0],[3,1],[4,0]]
      },
      {
        args: [
          [[1]]
        ],
        expected: [[0,0]]
      },
      {
        args: [
          [[1,2],[4,3]]
        ],
        expected: [[0,1],[1,0],[1,1]]
      },
      {
        args: [
          [[1,1],[1,1]]
        ],
        expected: [[0,0],[0,1],[1,0],[1,1]]
      },
      {
        args: [
          [[10,10,10],[10,1,10],[10,10,10]]
        ],
        expected: [[0,0],[0,1],[0,2],[1,0],[1,2],[2,0],[2,1],[2,2]]
      },
      {
        args: [
          [[1,2,3]]
        ],
        expected: [[0,0],[0,1],[0,2]]
      },
      {
        args: [
          [[3],[2],[1]]
        ],
        expected: [[0,0],[1,0],[2,0]]
      },
      {
        args: [
          [[1,3,2,4],[2,2,3,5],[6,7,1,4]]
        ],
        expected: [[0,3],[1,2],[1,3],[2,0],[2,1]]
      }
    ],
    compare: "unordered",
    viz: "graph-traversal",
    solutions: [
      {
        title: "Reverse BFS from borders",
        explanation: `**Intuition.** If water can flow downhill from a cell to an ocean, then a reverse search can climb from that ocean back to the cell.

**Steps.**
1. Seed Pacific BFS with top row and left column cells.
2. Seed Atlantic BFS with bottom row and right column cells.
3. During BFS, move to a neighbor only when its height is greater than or equal to the current cell.
4. Intersect the two reachable sets.

**Correctness.** The reverse move is exactly the inverse of a legal water-flow step. Thus a cell is reached from an ocean if and only if it can flow to that ocean. Intersecting the two sets gives precisely cells that can reach both oceans.

**Pitfalls.** The comparison is \`neighbor >= current\` in the reverse search, not \`<=\`.`,
        time: "O(R * C)",
        space: "O(R * C)",
        python: `class Solution:
    def pacificAtlantic(self, heights: List[List[int]]) -> List[List[int]]:
        rows, cols = len(heights), len(heights[0])
        def bfs(starts):
            seen = set(starts)
            q = deque(starts)
            while q:
                r, c = q.popleft()
                for dr, dc in ((1,0),(-1,0),(0,1),(0,-1)):
                    nr, nc = r + dr, c + dc
                    if 0 <= nr < rows and 0 <= nc < cols and (nr, nc) not in seen and heights[nr][nc] >= heights[r][c]:
                        seen.add((nr, nc))
                        q.append((nr, nc))
            return seen
        pac = bfs([(0, c) for c in range(cols)] + [(r, 0) for r in range(rows)])
        atl = bfs([(rows - 1, c) for c in range(cols)] + [(r, cols - 1) for r in range(rows)])
        return [[r, c] for r, c in pac & atl]
`,
        cpp: `class Solution {
public:
    vector<vector<int>> pacificAtlantic(vector<vector<int>>& heights) {
        int rows = heights.size(), cols = heights[0].size();
        auto bfs = [&](vector<pair<int,int>> starts) {
            vector<vector<int>> seen(rows, vector<int>(cols));
            queue<pair<int,int>> q;
            for (auto [r, c] : starts) {
                if (!seen[r][c]) {
                    seen[r][c] = 1;
                    q.push({r, c});
                }
            }
            int dirs[5] = {1, 0, -1, 0, 1};
            while (!q.empty()) {
                auto [r, c] = q.front(); q.pop();
                for (int k = 0; k < 4; ++k) {
                    int nr = r + dirs[k], nc = c + dirs[k + 1];
                    if (nr >= 0 && nc >= 0 && nr < rows && nc < cols && !seen[nr][nc] && heights[nr][nc] >= heights[r][c]) {
                        seen[nr][nc] = 1;
                        q.push({nr, nc});
                    }
                }
            }
            return seen;
        };
        vector<pair<int,int>> p, a;
        for (int c = 0; c < cols; ++c) { p.push_back({0, c}); a.push_back({rows - 1, c}); }
        for (int r = 0; r < rows; ++r) { p.push_back({r, 0}); a.push_back({r, cols - 1}); }
        auto pac = bfs(p), atl = bfs(a);
        vector<vector<int>> ans;
        for (int r = 0; r < rows; ++r) for (int c = 0; c < cols; ++c) if (pac[r][c] && atl[r][c]) ans.push_back({r, c});
        return ans;
    }
};`
      },
      {
        title: "Reverse DFS marking",
        explanation: `**Intuition.** Depth-first search can mark the same reverse-reachable ocean sets with less queue machinery.

**Steps.**
1. Create two boolean matrices.
2. DFS from each Pacific border cell into nondecreasing neighbors.
3. DFS from each Atlantic border cell with the same rule.
4. Collect cells marked in both matrices.

**Correctness.** The DFS uses the same reverse-flow edge relation as BFS, so it marks exactly cells that can reach each ocean. A coordinate belongs in the result exactly when both DFS mark it.

**Pitfalls.** Use two separate visited matrices; a cell reachable from one ocean is not automatically reachable from the other.`,
        time: "O(R * C)",
        space: "O(R * C) recursion in the worst case",
        python: `class Solution:
    def pacificAtlantic(self, heights: List[List[int]]) -> List[List[int]]:
        rows, cols = len(heights), len(heights[0])
        pac = [[False] * cols for _ in range(rows)]
        atl = [[False] * cols for _ in range(rows)]
        def dfs(r: int, c: int, seen: List[List[bool]]) -> None:
            seen[r][c] = True
            for dr, dc in ((1,0),(-1,0),(0,1),(0,-1)):
                nr, nc = r + dr, c + dc
                if 0 <= nr < rows and 0 <= nc < cols and not seen[nr][nc] and heights[nr][nc] >= heights[r][c]:
                    dfs(nr, nc, seen)
        for c in range(cols):
            dfs(0, c, pac)
            dfs(rows - 1, c, atl)
        for r in range(rows):
            dfs(r, 0, pac)
            dfs(r, cols - 1, atl)
        return [[r, c] for r in range(rows) for c in range(cols) if pac[r][c] and atl[r][c]]
`,
        cpp: `class Solution {
public:
    vector<vector<int>> pacificAtlantic(vector<vector<int>>& heights) {
        int rows = heights.size(), cols = heights[0].size();
        vector<vector<int>> pac(rows, vector<int>(cols)), atl(rows, vector<int>(cols));
        int dirs[5] = {1, 0, -1, 0, 1};
        function<void(int,int,vector<vector<int>>&)> dfs = [&](int r, int c, vector<vector<int>>& seen) {
            seen[r][c] = 1;
            for (int k = 0; k < 4; ++k) {
                int nr = r + dirs[k], nc = c + dirs[k + 1];
                if (nr >= 0 && nc >= 0 && nr < rows && nc < cols && !seen[nr][nc] && heights[nr][nc] >= heights[r][c]) dfs(nr, nc, seen);
            }
        };
        for (int c = 0; c < cols; ++c) { dfs(0, c, pac); dfs(rows - 1, c, atl); }
        for (int r = 0; r < rows; ++r) { dfs(r, 0, pac); dfs(r, cols - 1, atl); }
        vector<vector<int>> ans;
        for (int r = 0; r < rows; ++r) for (int c = 0; c < cols; ++c) if (pac[r][c] && atl[r][c]) ans.push_back({r, c});
        return ans;
    }
};`
      }
    ]
  },
  {
    id: "surrounded-regions",
    title: "Surrounded Regions",
    number: 130,
    difficulty: "Medium",
    category: "Graphs",
    pattern: "Border Flood Fill",
    description: "Implement `solve(board)`. Any region of `O` cells that cannot reach the border through other `O` cells is surrounded and should be flipped to `X`. Mutate the board in place; border-connected `O` cells remain `O`.",
    examples: [
      {
        input: "board = [[\"X\",\"X\",\"X\",\"X\"],[\"X\",\"O\",\"O\",\"X\"],[\"X\",\"X\",\"O\",\"X\"],[\"X\",\"O\",\"X\",\"X\"]]",
        output: "[[\"X\",\"X\",\"X\",\"X\"],[\"X\",\"X\",\"X\",\"X\"],[\"X\",\"X\",\"X\",\"X\"],[\"X\",\"O\",\"X\",\"X\"]]",
        explanation: "Only the `O` connected to the bottom border survives."
      },
      {
        input: "board = [[\"X\"]]",
        output: "[[\"X\"]]",
        explanation: "A single `X` is unchanged."
      },
      {
        input: "board = [[\"O\"]]",
        output: "[[\"O\"]]",
        explanation: "A border `O` is not surrounded."
      }
    ],
    constraints: ["`1 <= board.length, board[i].length <= 200`","Cells are `'X'` or `'O'`.","Connectivity is horizontal or vertical.","The function returns `void`; judge checks the board after mutation."],
    hints: ["It is easier to find cells that must not be flipped.","Any `O` connected to a border `O` is safe.","Mark safe cells first, flip remaining `O`s, then restore the safe marks."],
    signature: {
      kind: "function",
      name: "solve",
      params: [
        {
          name: "board",
          type: "char[][]"
        }
      ],
      returns: "void",
      inPlace: 0
    },
    tests: [
      {
        args: [
          [["X","X","X","X"],["X","O","O","X"],["X","X","O","X"],["X","O","X","X"]]
        ],
        expected: [["X","X","X","X"],["X","X","X","X"],["X","X","X","X"],["X","O","X","X"]]
      },
      {
        args: [
          [["X"]]
        ],
        expected: [["X"]]
      },
      {
        args: [
          [["O"]]
        ],
        expected: [["O"]]
      },
      {
        args: [
          [["O","O"],["O","O"]]
        ],
        expected: [["O","O"],["O","O"]]
      },
      {
        args: [
          [["X","X","X"],["X","O","X"],["X","X","X"]]
        ],
        expected: [["X","X","X"],["X","X","X"],["X","X","X"]]
      },
      {
        args: [
          [["X","O","X"],["O","O","X"],["X","X","X"]]
        ],
        expected: [["X","O","X"],["O","O","X"],["X","X","X"]]
      },
      {
        args: [
          [["X","O","X","O"],["O","X","O","X"],["X","O","X","O"]]
        ],
        expected: [["X","O","X","O"],["O","X","X","X"],["X","O","X","O"]]
      },
      {
        args: [
          [["O","O","O"],["O","X","O"],["O","O","O"]]
        ],
        expected: [["O","O","O"],["O","X","O"],["O","O","O"]]
      }
    ],
    viz: "graph-traversal",
    solutions: [
      {
        title: "Border DFS mark safe",
        explanation: `**Intuition.** A captured region is exactly an \`O\` component with no border cell. Mark the opposite set: border-connected \`O\`s.

**Steps.**
1. DFS from every border cell that contains \`O\` and mark it safe.
2. After marking, scan the board.
3. Flip unmarked \`O\` cells to \`X\`.
4. Change safe marks back to \`O\`.

**Correctness.** Every marked cell has an \`O\` path to the border, so it must remain. Any unmarked \`O\` lacks such a path and is fully surrounded by \`X\` or board boundaries, so flipping it is correct.

**Pitfalls.** Do not start DFS from interior cells; that makes it harder to tell whether a component touches the border.`,
        time: "O(R * C)",
        space: "O(R * C) recursion in the worst case",
        python: `class Solution:
    def solve(self, board: List[List[str]]) -> None:
        rows, cols = len(board), len(board[0])
        def dfs(r: int, c: int) -> None:
            if r < 0 or c < 0 or r == rows or c == cols or board[r][c] != 'O':
                return
            board[r][c] = 'S'
            dfs(r + 1, c); dfs(r - 1, c); dfs(r, c + 1); dfs(r, c - 1)
        for r in range(rows):
            dfs(r, 0)
            dfs(r, cols - 1)
        for c in range(cols):
            dfs(0, c)
            dfs(rows - 1, c)
        for r in range(rows):
            for c in range(cols):
                board[r][c] = 'O' if board[r][c] == 'S' else 'X'
`,
        cpp: `class Solution {
public:
    void solve(vector<vector<char>>& board) {
        int rows = board.size(), cols = board[0].size();
        function<void(int,int)> dfs = [&](int r, int c) {
            if (r < 0 || c < 0 || r == rows || c == cols || board[r][c] != 'O') return;
            board[r][c] = 'S';
            dfs(r + 1, c); dfs(r - 1, c); dfs(r, c + 1); dfs(r, c - 1);
        };
        for (int r = 0; r < rows; ++r) { dfs(r, 0); dfs(r, cols - 1); }
        for (int c = 0; c < cols; ++c) { dfs(0, c); dfs(rows - 1, c); }
        for (auto& row : board) for (char& ch : row) ch = (ch == 'S') ? 'O' : 'X';
    }
};`
      },
      {
        title: "Border BFS",
        explanation: `**Intuition.** Use a queue instead of recursion to mark all \`O\`s connected to the border.

**Steps.**
1. Push all border \`O\` cells and mark them safe.
2. BFS through neighboring \`O\` cells, marking them safe too.
3. After the queue empties, flip unmarked \`O\`s and restore safe cells.
4. Leave existing \`X\`s as \`X\`.

**Correctness.** BFS reaches exactly the \`O\` cells connected to some border \`O\`. Those and only those cells are safe; the final scan flips the complement of safe \`O\`s.

**Pitfalls.** Mark when enqueuing so the same border-connected cell is not queued repeatedly.`,
        time: "O(R * C)",
        space: "O(R * C)",
        python: `class Solution:
    def solve(self, board: List[List[str]]) -> None:
        rows, cols = len(board), len(board[0])
        q = deque()
        def add(r: int, c: int) -> None:
            if board[r][c] == 'O':
                board[r][c] = 'S'
                q.append((r, c))
        for r in range(rows):
            add(r, 0); add(r, cols - 1)
        for c in range(cols):
            add(0, c); add(rows - 1, c)
        while q:
            r, c = q.popleft()
            for dr, dc in ((1,0),(-1,0),(0,1),(0,-1)):
                nr, nc = r + dr, c + dc
                if 0 <= nr < rows and 0 <= nc < cols and board[nr][nc] == 'O':
                    board[nr][nc] = 'S'
                    q.append((nr, nc))
        for r in range(rows):
            for c in range(cols):
                board[r][c] = 'O' if board[r][c] == 'S' else 'X'
`,
        cpp: `class Solution {
public:
    void solve(vector<vector<char>>& board) {
        int rows = board.size(), cols = board[0].size();
        queue<pair<int,int>> q;
        auto add = [&](int r, int c) {
            if (board[r][c] == 'O') {
                board[r][c] = 'S';
                q.push({r, c});
            }
        };
        for (int r = 0; r < rows; ++r) { add(r, 0); add(r, cols - 1); }
        for (int c = 0; c < cols; ++c) { add(0, c); add(rows - 1, c); }
        int dirs[5] = {1, 0, -1, 0, 1};
        while (!q.empty()) {
            auto [r, c] = q.front(); q.pop();
            for (int k = 0; k < 4; ++k) {
                int nr = r + dirs[k], nc = c + dirs[k + 1];
                if (nr >= 0 && nc >= 0 && nr < rows && nc < cols && board[nr][nc] == 'O') {
                    board[nr][nc] = 'S';
                    q.push({nr, nc});
                }
            }
        }
        for (auto& row : board) for (char& ch : row) ch = (ch == 'S') ? 'O' : 'X';
    }
};`
      }
    ]
  },
  {
    id: "course-schedule",
    title: "Course Schedule",
    number: 207,
    difficulty: "Medium",
    category: "Graphs",
    pattern: "Cycle Detection / Topological Sort",
    description: "Implement `canFinish(numCourses, prerequisites)`. A prerequisite pair `[a, b]` means course `b` must be completed before course `a`. Return whether all courses can be completed without violating prerequisites.",
    examples: [
      {
        input: "numCourses = 2, prerequisites = [[1,0]]",
        output: "true",
        explanation: "Take course `0`, then course `1`."
      },
      {
        input: "numCourses = 2, prerequisites = [[1,0],[0,1]]",
        output: "false",
        explanation: "Each course requires the other, forming a cycle."
      },
      {
        input: "numCourses = 1, prerequisites = []",
        output: "true",
        explanation: "With one course and no prerequisites, completion is possible."
      }
    ],
    constraints: ["`1 <= numCourses <= 2000`","`0 <= prerequisites.length <= 5000`","Each prerequisite is `[course, prerequisite]`.","Courses are numbered `0` through `numCourses - 1`."],
    hints: ["The only obstruction is a directed cycle.","Kahn's algorithm repeatedly removes courses with zero prerequisites.","If all courses are removed, the graph is acyclic."],
    signature: {
      kind: "function",
      name: "canFinish",
      params: [
        {
          name: "numCourses",
          type: "int"
        },
        {
          name: "prerequisites",
          type: "int[][]"
        }
      ],
      returns: "bool"
    },
    tests: [
      {
        args: [
          2,
          [[1,0]]
        ],
        expected: true
      },
      {
        args: [
          2,
          [[1,0],[0,1]]
        ],
        expected: false
      },
      {
        args: [
          1,
          []
        ],
        expected: true
      },
      {
        args: [
          4,
          [[1,0],[2,1],[3,2]]
        ],
        expected: true
      },
      {
        args: [
          3,
          [[0,1],[1,2],[2,0]]
        ],
        expected: false
      },
      {
        args: [
          5,
          [[1,0],[2,0],[4,3]]
        ],
        expected: true
      },
      {
        args: [
          3,
          [[0,0]]
        ],
        expected: false
      },
      {
        args: [
          4,
          []
        ],
        expected: true
      }
    ],
    viz: "graph-traversal",
    solutions: [
      {
        title: "Kahn's topological BFS",
        explanation: `**Intuition.** Courses with no remaining prerequisites can be taken immediately. Removing them may unlock more courses.

**Steps.**
1. Build adjacency from prerequisite to dependent course and an indegree array.
2. Queue all courses with indegree zero.
3. Pop courses, count them, and decrement indegrees of dependents.
4. Return true if the count reaches \`numCourses\`.

**Correctness.** A course is queued only when all prerequisites have been removed, so the produced removal order is valid. If a cycle exists, its courses never reach indegree zero; if no cycle exists, some zero-indegree course always exists until all are removed.

**Pitfalls.** Build the edge as \`b -> a\` for pair \`[a, b]\`.`,
        time: "O(V + E)",
        space: "O(V + E)",
        python: `class Solution:
    def canFinish(self, numCourses: int, prerequisites: List[List[int]]) -> bool:
        graph = [[] for _ in range(numCourses)]
        indeg = [0] * numCourses
        for course, pre in prerequisites:
            graph[pre].append(course)
            indeg[course] += 1
        q = deque(i for i in range(numCourses) if indeg[i] == 0)
        taken = 0
        while q:
            cur = q.popleft()
            taken += 1
            for nxt in graph[cur]:
                indeg[nxt] -= 1
                if indeg[nxt] == 0:
                    q.append(nxt)
        return taken == numCourses
`,
        cpp: `class Solution {
public:
    bool canFinish(int numCourses, vector<vector<int>>& prerequisites) {
        vector<vector<int>> graph(numCourses);
        vector<int> indeg(numCourses);
        for (auto& e : prerequisites) {
            graph[e[1]].push_back(e[0]);
            indeg[e[0]]++;
        }
        queue<int> q;
        for (int i = 0; i < numCourses; ++i) if (indeg[i] == 0) q.push(i);
        int taken = 0;
        while (!q.empty()) {
            int cur = q.front(); q.pop();
            ++taken;
            for (int nxt : graph[cur]) if (--indeg[nxt] == 0) q.push(nxt);
        }
        return taken == numCourses;
    }
};`
      },
      {
        title: "DFS color cycle check",
        explanation: `**Intuition.** Mark each node as unvisited, currently visiting, or done. Seeing a visiting node again means a cycle.

**Steps.**
1. Build the directed graph.
2. DFS every unvisited course.
3. During DFS, mark the course gray; if a gray neighbor appears, return false.
4. Mark the course black when all neighbors are safe.

**Correctness.** A gray edge points to an ancestor in the current recursion stack, exactly a directed cycle. If DFS finishes all nodes without such an edge, every dependency chain terminates and courses can be ordered.

**Pitfalls.** Do not treat an already black node as a cycle; it has been proven safe.`,
        time: "O(V + E)",
        space: "O(V + E)",
        python: `class Solution:
    def canFinish(self, numCourses: int, prerequisites: List[List[int]]) -> bool:
        graph = [[] for _ in range(numCourses)]
        for course, pre in prerequisites:
            graph[pre].append(course)
        color = [0] * numCourses
        def dfs(node: int) -> bool:
            if color[node] == 1:
                return False
            if color[node] == 2:
                return True
            color[node] = 1
            for nei in graph[node]:
                if not dfs(nei):
                    return False
            color[node] = 2
            return True
        return all(dfs(i) for i in range(numCourses) if color[i] == 0)
`,
        cpp: `class Solution {
public:
    bool canFinish(int numCourses, vector<vector<int>>& prerequisites) {
        vector<vector<int>> graph(numCourses);
        for (auto& e : prerequisites) graph[e[1]].push_back(e[0]);
        vector<int> color(numCourses);
        function<bool(int)> dfs = [&](int node) {
            if (color[node] == 1) return false;
            if (color[node] == 2) return true;
            color[node] = 1;
            for (int nei : graph[node]) if (!dfs(nei)) return false;
            color[node] = 2;
            return true;
        };
        for (int i = 0; i < numCourses; ++i) if (color[i] == 0 && !dfs(i)) return false;
        return true;
    }
};`
      }
    ]
  },
  {
    id: "course-schedule-ii",
    title: "Course Schedule II",
    number: 210,
    difficulty: "Medium",
    category: "Graphs",
    pattern: "Topological Ordering",
    description: "Implement `findOrder(numCourses, prerequisites)`. Return any ordering of all courses that satisfies every prerequisite pair `[a, b]` meaning `b` before `a`. If no such ordering exists, return an empty array.",
    examples: [
      {
        input: "numCourses = 2, prerequisites = [[1,0]]",
        output: "[0,1]",
        explanation: "Course `0` must appear before `1`."
      },
      {
        input: "numCourses = 4, prerequisites = [[1,0],[2,0],[3,1],[3,2]]",
        output: "[0,1,2,3]",
        explanation: "Both `1` and `2` depend on `0`, and `3` depends on both."
      },
      {
        input: "numCourses = 1, prerequisites = []",
        output: "[0]",
        explanation: "A single course can be taken immediately."
      }
    ],
    constraints: ["`1 <= numCourses <= 2000`","`0 <= prerequisites.length <= 5000`","Pairs are `[course, prerequisite]`.","Any valid topological order is accepted."],
    hints: ["This is Course Schedule plus recording the order.","Start with courses that have zero indegree.","If the recorded order has fewer than `numCourses` entries, a cycle prevented completion."],
    signature: {
      kind: "function",
      name: "findOrder",
      params: [
        {
          name: "numCourses",
          type: "int"
        },
        {
          name: "prerequisites",
          type: "int[][]"
        }
      ],
      returns: "int[]"
    },
    tests: [
      {
        args: [
          2,
          [[1,0]]
        ],
        expected: [0,1]
      },
      {
        args: [
          4,
          [[1,0],[2,0],[3,1],[3,2]]
        ],
        expected: [0,1,2,3]
      },
      {
        args: [
          1,
          []
        ],
        expected: [0]
      },
      {
        args: [
          2,
          [[1,0],[0,1]]
        ],
        expected: []
      },
      {
        args: [
          3,
          []
        ],
        expected: [0,1,2]
      },
      {
        args: [
          3,
          [[1,0],[2,1]]
        ],
        expected: [0,1,2]
      },
      {
        args: [
          5,
          [[1,0],[2,0],[3,1],[3,2],[4,3]]
        ],
        expected: [0,1,2,3,4]
      },
      {
        args: [
          3,
          [[0,0]]
        ],
        expected: []
      }
    ],
    compare: "topoOrder",
    viz: "graph-traversal",
    solutions: [
      {
        title: "Kahn's algorithm",
        explanation: `**Intuition.** Repeatedly take courses whose prerequisites are already satisfied and append them to the order.

**Steps.**
1. Build outgoing edges and indegrees.
2. Queue all zero-indegree courses.
3. Pop a course, append it, and relax its outgoing edges.
4. Return the order only if it contains every course.

**Correctness.** A course is appended only when all prerequisites have appeared earlier. If the graph is acyclic, Kahn's algorithm can remove every node; if a cycle exists, those nodes never become zero indegree.

**Pitfalls.** For \`topoOrder\` judging, many correct orders exist; do not rely on one exact sequence.`,
        time: "O(V + E)",
        space: "O(V + E)",
        python: `class Solution:
    def findOrder(self, numCourses: int, prerequisites: List[List[int]]) -> List[int]:
        graph = [[] for _ in range(numCourses)]
        indeg = [0] * numCourses
        for course, pre in prerequisites:
            graph[pre].append(course)
            indeg[course] += 1
        q = deque(i for i in range(numCourses) if indeg[i] == 0)
        order = []
        while q:
            cur = q.popleft()
            order.append(cur)
            for nxt in graph[cur]:
                indeg[nxt] -= 1
                if indeg[nxt] == 0:
                    q.append(nxt)
        return order if len(order) == numCourses else []
`,
        cpp: `class Solution {
public:
    vector<int> findOrder(int numCourses, vector<vector<int>>& prerequisites) {
        vector<vector<int>> graph(numCourses);
        vector<int> indeg(numCourses), order;
        for (auto& e : prerequisites) {
            graph[e[1]].push_back(e[0]);
            indeg[e[0]]++;
        }
        queue<int> q;
        for (int i = 0; i < numCourses; ++i) if (indeg[i] == 0) q.push(i);
        while (!q.empty()) {
            int cur = q.front(); q.pop();
            order.push_back(cur);
            for (int nxt : graph[cur]) if (--indeg[nxt] == 0) q.push(nxt);
        }
        return (int)order.size() == numCourses ? order : vector<int>{};
    }
};`
      },
      {
        title: "DFS postorder",
        explanation: `**Intuition.** In a DAG, a node can be placed before its dependents by appending it after exploring dependents and then reversing the result.

**Steps.**
1. Build edges from prerequisite to dependent course.
2. Run DFS with three colors for cycle detection.
3. Append a course after all outgoing neighbors finish.
4. Reverse the postorder if no cycle was found.

**Correctness.** Postorder ensures every edge \`u -> v\` has \`v\` appended before \`u\`; reversing makes \`u\` appear before \`v\`, satisfying prerequisites. A gray edge detects exactly the cycles that make an order impossible.

**Pitfalls.** Return \`[]\` immediately if a cycle is found; a partial postorder is not valid.`,
        time: "O(V + E)",
        space: "O(V + E)",
        python: `class Solution:
    def findOrder(self, numCourses: int, prerequisites: List[List[int]]) -> List[int]:
        graph = [[] for _ in range(numCourses)]
        for course, pre in prerequisites:
            graph[pre].append(course)
        color = [0] * numCourses
        order = []
        def dfs(node: int) -> bool:
            if color[node] == 1:
                return False
            if color[node] == 2:
                return True
            color[node] = 1
            for nei in graph[node]:
                if not dfs(nei):
                    return False
            color[node] = 2
            order.append(node)
            return True
        for i in range(numCourses):
            if color[i] == 0 and not dfs(i):
                return []
        return order[::-1]
`,
        cpp: `class Solution {
public:
    vector<int> findOrder(int numCourses, vector<vector<int>>& prerequisites) {
        vector<vector<int>> graph(numCourses);
        for (auto& e : prerequisites) graph[e[1]].push_back(e[0]);
        vector<int> color(numCourses), order;
        function<bool(int)> dfs = [&](int node) {
            if (color[node] == 1) return false;
            if (color[node] == 2) return true;
            color[node] = 1;
            for (int nei : graph[node]) if (!dfs(nei)) return false;
            color[node] = 2;
            order.push_back(node);
            return true;
        };
        for (int i = 0; i < numCourses; ++i) if (color[i] == 0 && !dfs(i)) return {};
        reverse(order.begin(), order.end());
        return order;
    }
};`
      }
    ]
  },
  {
    id: "graph-valid-tree",
    title: "Graph Valid Tree",
    number: 261,
    difficulty: "Medium",
    category: "Graphs",
    pattern: "Union-Find Tree Check",
    description: "Implement `validTree(n, edges)`. The undirected graph has nodes `0` through `n - 1`. Return whether the edges form one connected graph with no cycle, which is exactly the definition of a tree.",
    examples: [
      {
        input: "n = 5, edges = [[0,1],[0,2],[0,3],[1,4]]",
        output: "true",
        explanation: "All five nodes are connected and there are no cycles."
      },
      {
        input: "n = 5, edges = [[0,1],[1,2],[2,3],[1,3],[1,4]]",
        output: "false",
        explanation: "The edge `[1,3]` creates a cycle."
      },
      {
        input: "n = 1, edges = []",
        output: "true",
        explanation: "One isolated node with no edges is a tree."
      }
    ],
    constraints: ["`1 <= n <= 2000`","`0 <= edges.length <= 5000`","Each edge is an undirected pair `[u, v]`.","A valid tree must have exactly `n - 1` edges."],
    hints: ["A tree with `n` nodes must have `n - 1` edges.","Use Union-Find to detect whether an edge connects nodes already in the same component.","If there are `n - 1` edges and no cycle, the graph is connected."],
    signature: {
      kind: "function",
      name: "validTree",
      params: [
        {
          name: "n",
          type: "int"
        },
        {
          name: "edges",
          type: "int[][]"
        }
      ],
      returns: "bool"
    },
    tests: [
      {
        args: [
          5,
          [[0,1],[0,2],[0,3],[1,4]]
        ],
        expected: true
      },
      {
        args: [
          5,
          [[0,1],[1,2],[2,3],[1,3],[1,4]]
        ],
        expected: false
      },
      {
        args: [
          1,
          []
        ],
        expected: true
      },
      {
        args: [
          4,
          [[0,1],[2,3]]
        ],
        expected: false
      },
      {
        args: [
          4,
          [[0,1],[1,2],[2,0],[2,3]]
        ],
        expected: false
      },
      {
        args: [
          2,
          []
        ],
        expected: false
      },
      {
        args: [
          3,
          [[0,1],[1,2]]
        ],
        expected: true
      },
      {
        args: [
          3,
          [[0,1],[0,2],[1,2]]
        ],
        expected: false
      }
    ],
    viz: "union-find",
    solutions: [
      {
        title: "Union-Find",
        explanation: `**Intuition.** A tree has exactly one component and no cycles. Union-Find detects cycles as edges are added.

**Steps.**
1. Reject immediately unless \`len(edges) == n - 1\`.
2. Initialize each node as its own parent.
3. For every edge, union its endpoints.
4. If an edge connects endpoints already in the same set, return false; otherwise true after all unions.

**Correctness.** The edge-count check rules out disconnected acyclic forests with too few edges and graphs with too many edges. A same-set edge is exactly a cycle in an undirected graph. With \`n - 1\` edges and no cycle, the graph must be connected, so it is a tree.

**Pitfalls.** Without the edge-count check, a disconnected forest would incorrectly pass the no-cycle test.`,
        time: "O(E \u03b1(n))",
        space: "O(n)",
        python: `class Solution:
    def validTree(self, n: int, edges: List[List[int]]) -> bool:
        if len(edges) != n - 1:
            return False
        parent = list(range(n))
        rank = [0] * n
        def find(x: int) -> int:
            while parent[x] != x:
                parent[x] = parent[parent[x]]
                x = parent[x]
            return x
        for a, b in edges:
            ra, rb = find(a), find(b)
            if ra == rb:
                return False
            if rank[ra] < rank[rb]:
                ra, rb = rb, ra
            parent[rb] = ra
            if rank[ra] == rank[rb]:
                rank[ra] += 1
        return True
`,
        cpp: `class Solution {
public:
    bool validTree(int n, vector<vector<int>>& edges) {
        if ((int)edges.size() != n - 1) return false;
        vector<int> parent(n), rank(n);
        iota(parent.begin(), parent.end(), 0);
        function<int(int)> find = [&](int x) {
            while (parent[x] != x) {
                parent[x] = parent[parent[x]];
                x = parent[x];
            }
            return x;
        };
        for (auto& e : edges) {
            int a = find(e[0]), b = find(e[1]);
            if (a == b) return false;
            if (rank[a] < rank[b]) swap(a, b);
            parent[b] = a;
            if (rank[a] == rank[b]) rank[a]++;
        }
        return true;
    }
};`
      },
      {
        title: "DFS connectivity plus edge count",
        explanation: `**Intuition.** An undirected graph is a tree iff it has \`n - 1\` edges and all nodes are reachable from any one node.

**Steps.**
1. Reject if the edge count is not \`n - 1\`.
2. Build an adjacency list.
3. DFS or BFS from node \`0\`.
4. Return whether all \`n\` nodes were visited.

**Correctness.** With \`n - 1\` edges, a connected undirected graph cannot contain a cycle; a cycle would require another component to be missing an edge. Therefore connectivity plus the edge count is sufficient and necessary.

**Pitfalls.** Handle \`n = 1\`: start node \`0\` exists and the empty edge list is valid.`,
        time: "O(V + E)",
        space: "O(V + E)",
        python: `class Solution:
    def validTree(self, n: int, edges: List[List[int]]) -> bool:
        if len(edges) != n - 1:
            return False
        graph = [[] for _ in range(n)]
        for a, b in edges:
            graph[a].append(b)
            graph[b].append(a)
        seen = {0}
        stack = [0]
        while stack:
            node = stack.pop()
            for nei in graph[node]:
                if nei not in seen:
                    seen.add(nei)
                    stack.append(nei)
        return len(seen) == n
`,
        cpp: `class Solution {
public:
    bool validTree(int n, vector<vector<int>>& edges) {
        if ((int)edges.size() != n - 1) return false;
        vector<vector<int>> graph(n);
        for (auto& e : edges) {
            graph[e[0]].push_back(e[1]);
            graph[e[1]].push_back(e[0]);
        }
        vector<int> seen(n);
        stack<int> st;
        st.push(0);
        seen[0] = 1;
        int count = 0;
        while (!st.empty()) {
            int node = st.top(); st.pop();
            ++count;
            for (int nei : graph[node]) if (!seen[nei]) {
                seen[nei] = 1;
                st.push(nei);
            }
        }
        return count == n;
    }
};`
      }
    ]
  },
  {
    id: "number-of-connected-components-in-an-undirected-graph",
    title: "Number of Connected Components in an Undirected Graph",
    number: 323,
    difficulty: "Medium",
    category: "Graphs",
    pattern: "Union-Find Components",
    description: "Implement `countComponents(n, edges)`. For an undirected graph with nodes `0` through `n - 1`, return how many connected components it contains.",
    examples: [
      {
        input: "n = 5, edges = [[0,1],[1,2],[3,4]]",
        output: "2",
        explanation: "Nodes `0,1,2` form one component and `3,4` another."
      },
      {
        input: "n = 5, edges = [[0,1],[1,2],[2,3],[3,4]]",
        output: "1",
        explanation: "The chain connects every node."
      },
      {
        input: "n = 1, edges = []",
        output: "1",
        explanation: "A single isolated node is one component."
      }
    ],
    constraints: ["`1 <= n <= 2000`","`0 <= edges.length <= 5000`","Edges are undirected.","Nodes are labeled from `0` to `n - 1`."],
    hints: ["Start with `n` separate components.","Each successful union of two different roots reduces the component count by one.","A DFS/BFS from each unvisited node is an equally valid way to count components."],
    signature: {
      kind: "function",
      name: "countComponents",
      params: [
        {
          name: "n",
          type: "int"
        },
        {
          name: "edges",
          type: "int[][]"
        }
      ],
      returns: "int"
    },
    tests: [
      {
        args: [
          5,
          [[0,1],[1,2],[3,4]]
        ],
        expected: 2
      },
      {
        args: [
          5,
          [[0,1],[1,2],[2,3],[3,4]]
        ],
        expected: 1
      },
      {
        args: [
          1,
          []
        ],
        expected: 1
      },
      {
        args: [
          4,
          []
        ],
        expected: 4
      },
      {
        args: [
          4,
          [[0,1],[2,3]]
        ],
        expected: 2
      },
      {
        args: [
          6,
          [[0,1],[1,2],[3,4]]
        ],
        expected: 3
      },
      {
        args: [
          5,
          [[0,1],[1,2],[2,0],[3,4]]
        ],
        expected: 2
      },
      {
        args: [
          2,
          [[1,0]]
        ],
        expected: 1
      }
    ],
    viz: "union-find",
    solutions: [
      {
        title: "Union-Find count",
        explanation: `**Intuition.** Union-Find keeps track of which nodes are already connected while maintaining a component counter.

**Steps.**
1. Initialize \`components = n\` and each node as its own parent.
2. For each edge, find both roots.
3. If roots differ, union them and decrement \`components\`.
4. Return the final count.

**Correctness.** Initially each node is its own component. A union between different roots merges exactly two components into one; edges within a component do not change the count. After all edges, the counter equals the number of connected components.

**Pitfalls.** Do not decrement the count for an edge whose endpoints already share a root.`,
        time: "O(E \u03b1(n))",
        space: "O(n)",
        python: `class Solution:
    def countComponents(self, n: int, edges: List[List[int]]) -> int:
        parent = list(range(n))
        rank = [0] * n
        def find(x: int) -> int:
            while parent[x] != x:
                parent[x] = parent[parent[x]]
                x = parent[x]
            return x
        comps = n
        for a, b in edges:
            ra, rb = find(a), find(b)
            if ra == rb:
                continue
            if rank[ra] < rank[rb]:
                ra, rb = rb, ra
            parent[rb] = ra
            if rank[ra] == rank[rb]:
                rank[ra] += 1
            comps -= 1
        return comps
`,
        cpp: `class Solution {
public:
    int countComponents(int n, vector<vector<int>>& edges) {
        vector<int> parent(n), rank(n);
        iota(parent.begin(), parent.end(), 0);
        function<int(int)> find = [&](int x) {
            while (parent[x] != x) {
                parent[x] = parent[parent[x]];
                x = parent[x];
            }
            return x;
        };
        int comps = n;
        for (auto& e : edges) {
            int a = find(e[0]), b = find(e[1]);
            if (a == b) continue;
            if (rank[a] < rank[b]) swap(a, b);
            parent[b] = a;
            if (rank[a] == rank[b]) rank[a]++;
            --comps;
        }
        return comps;
    }
};`
      },
      {
        title: "DFS over adjacency",
        explanation: `**Intuition.** Each DFS from an unseen node discovers exactly one connected component.

**Steps.**
1. Build an undirected adjacency list.
2. Loop over all nodes.
3. When a node has not been seen, increment the answer and DFS/BFS through its component.
4. Return the number of starts.

**Correctness.** All nodes reached by one DFS are connected to its start, so they form one component. Starting DFS only from unseen nodes means each component contributes exactly one increment.

**Pitfalls.** Remember isolated nodes; they have empty adjacency lists but still count as components.`,
        time: "O(V + E)",
        space: "O(V + E)",
        python: `class Solution:
    def countComponents(self, n: int, edges: List[List[int]]) -> int:
        graph = [[] for _ in range(n)]
        for a, b in edges:
            graph[a].append(b)
            graph[b].append(a)
        seen = [False] * n
        ans = 0
        for i in range(n):
            if seen[i]:
                continue
            ans += 1
            stack = [i]
            seen[i] = True
            while stack:
                node = stack.pop()
                for nei in graph[node]:
                    if not seen[nei]:
                        seen[nei] = True
                        stack.append(nei)
        return ans
`,
        cpp: `class Solution {
public:
    int countComponents(int n, vector<vector<int>>& edges) {
        vector<vector<int>> graph(n);
        for (auto& e : edges) {
            graph[e[0]].push_back(e[1]);
            graph[e[1]].push_back(e[0]);
        }
        vector<int> seen(n);
        int ans = 0;
        for (int i = 0; i < n; ++i) {
            if (seen[i]) continue;
            ++ans;
            stack<int> st;
            st.push(i);
            seen[i] = 1;
            while (!st.empty()) {
                int node = st.top(); st.pop();
                for (int nei : graph[node]) if (!seen[nei]) {
                    seen[nei] = 1;
                    st.push(nei);
                }
            }
        }
        return ans;
    }
};`
      }
    ]
  },
  {
    id: "redundant-connection",
    title: "Redundant Connection",
    number: 684,
    difficulty: "Medium",
    category: "Graphs",
    pattern: "Union-Find Cycle Edge",
    description: "Implement `findRedundantConnection(edges)`. The undirected edges started as a tree, then one extra edge was added. Return the edge that creates a cycle when processed in input order.",
    examples: [
      {
        input: "edges = [[1,2],[1,3],[2,3]]",
        output: "[2,3]",
        explanation: "The third edge connects two nodes already linked through node `1`."
      },
      {
        input: "edges = [[1,2],[2,3],[3,4],[1,4],[1,5]]",
        output: "[1,4]",
        explanation: "The edge `[1,4]` closes the first cycle."
      },
      {
        input: "edges = [[1,2],[2,3],[3,1]]",
        output: "[3,1]",
        explanation: "The last edge completes a triangle."
      }
    ],
    constraints: ["`3 <= edges.length <= 1000`","Each edge is `[u, v]` with positive labels.","The input contains exactly one extra edge beyond a tree.","Return the redundant edge as it appears in the input."],
    hints: ["Process edges one by one.","If two endpoints are already connected, adding the edge would form a cycle.","Union-Find answers connected-so-far queries efficiently."],
    signature: {
      kind: "function",
      name: "findRedundantConnection",
      params: [
        {
          name: "edges",
          type: "int[][]"
        }
      ],
      returns: "int[]"
    },
    tests: [
      {
        args: [
          [[1,2],[1,3],[2,3]]
        ],
        expected: [2,3]
      },
      {
        args: [
          [[1,2],[2,3],[3,4],[1,4],[1,5]]
        ],
        expected: [1,4]
      },
      {
        args: [
          [[1,2],[2,3],[3,1]]
        ],
        expected: [3,1]
      },
      {
        args: [
          [[1,4],[3,4],[1,3],[1,2],[4,5]]
        ],
        expected: [1,3]
      },
      {
        args: [
          [[1,2],[2,3],[3,4],[4,1],[1,5]]
        ],
        expected: [4,1]
      },
      {
        args: [
          [[2,3],[1,2],[1,3]]
        ],
        expected: [1,3]
      },
      {
        args: [
          [[1,5],[3,4],[3,5],[4,5],[2,4]]
        ],
        expected: [4,5]
      },
      {
        args: [
          [[1,2],[2,3],[3,4],[4,5],[5,1]]
        ],
        expected: [5,1]
      }
    ],
    viz: "union-find",
    solutions: [
      {
        title: "Union-Find first cycle edge",
        explanation: `**Intuition.** Before adding an edge, check whether its endpoints are already in the same connected component.

**Steps.**
1. Create parent pointers up to the largest label.
2. For each edge, find both endpoint roots.
3. If roots match, return that edge.
4. Otherwise union the two roots and continue.

**Correctness.** The maintained components represent connectivity using only earlier edges. If an edge's endpoints are already connected, adding it creates a cycle and it is redundant. The first such edge in input order is the required answer for this tree-plus-one-edge graph.

**Pitfalls.** Labels are one-based, so allocate one extra parent slot or compress labels.`,
        time: "O(E \u03b1(V))",
        space: "O(V)",
        python: `class Solution:
    def findRedundantConnection(self, edges: List[List[int]]) -> List[int]:
        parent = list(range(max(max(edge) for edge in edges) + 1))
        rank = [0] * len(parent)
        def find(x: int) -> int:
            while parent[x] != x:
                parent[x] = parent[parent[x]]
                x = parent[x]
            return x
        for a, b in edges:
            ra, rb = find(a), find(b)
            if ra == rb:
                return [a, b]
            if rank[ra] < rank[rb]:
                ra, rb = rb, ra
            parent[rb] = ra
            if rank[ra] == rank[rb]:
                rank[ra] += 1
        return []
`,
        cpp: `class Solution {
public:
    vector<int> findRedundantConnection(vector<vector<int>>& edges) {
        int mx = 0;
        for (auto& e : edges) mx = max(mx, max(e[0], e[1]));
        vector<int> parent(mx + 1), rank(mx + 1);
        iota(parent.begin(), parent.end(), 0);
        function<int(int)> find = [&](int x) {
            while (parent[x] != x) {
                parent[x] = parent[parent[x]];
                x = parent[x];
            }
            return x;
        };
        for (auto& e : edges) {
            int a = find(e[0]), b = find(e[1]);
            if (a == b) return e;
            if (rank[a] < rank[b]) swap(a, b);
            parent[b] = a;
            if (rank[a] == rank[b]) rank[a]++;
        }
        return {};
    }
};`
      },
      {
        title: "Incremental DFS check",
        explanation: `**Intuition.** For each new edge, ask whether its endpoints are already connected in the graph built from earlier edges.

**Steps.**
1. Maintain an adjacency list of accepted edges.
2. Before adding \`[u, v]\`, DFS from \`u\` to see if \`v\` is reachable.
3. If reachable, return \`[u, v]\`.
4. Otherwise add the edge to the adjacency list.

**Correctness.** If \`v\` is reachable from \`u\`, the new edge plus that path forms a cycle. If not reachable, adding the edge preserves acyclicity among processed edges. Therefore the first reachable case is the redundant edge.

**Pitfalls.** Run the reachability check before inserting the candidate edge; after insertion every edge trivially connects its endpoints.`,
        time: "O(E * (V + E))",
        space: "O(V + E)",
        python: `class Solution:
    def findRedundantConnection(self, edges: List[List[int]]) -> List[int]:
        graph = defaultdict(list)
        def connected(src: int, dst: int) -> bool:
            seen = {src}
            stack = [src]
            while stack:
                node = stack.pop()
                if node == dst:
                    return True
                for nei in graph[node]:
                    if nei not in seen:
                        seen.add(nei)
                        stack.append(nei)
            return False
        for a, b in edges:
            if a in graph and b in graph and connected(a, b):
                return [a, b]
            graph[a].append(b)
            graph[b].append(a)
        return []
`,
        cpp: `class Solution {
public:
    vector<int> findRedundantConnection(vector<vector<int>>& edges) {
        unordered_map<int, vector<int>> graph;
        function<bool(int,int)> connected = [&](int src, int dst) {
            unordered_set<int> seen;
            stack<int> st;
            st.push(src);
            seen.insert(src);
            while (!st.empty()) {
                int node = st.top(); st.pop();
                if (node == dst) return true;
                for (int nei : graph[node]) if (!seen.count(nei)) {
                    seen.insert(nei);
                    st.push(nei);
                }
            }
            return false;
        };
        for (auto& e : edges) {
            if (graph.count(e[0]) && graph.count(e[1]) && connected(e[0], e[1])) return e;
            graph[e[0]].push_back(e[1]);
            graph[e[1]].push_back(e[0]);
        }
        return {};
    }
};`
      }
    ]
  },
  {
    id: "word-ladder",
    title: "Word Ladder",
    number: 127,
    difficulty: "Hard",
    category: "Graphs",
    pattern: "Shortest Path BFS",
    description: "Implement `ladderLength(beginWord, endWord, wordList)`. A transformation changes exactly one letter and every intermediate word must be in `wordList`. Return the number of words in the shortest sequence from `beginWord` to `endWord`, or `0` if no sequence exists.",
    examples: [
      {
        input: "beginWord = \"hit\", endWord = \"cog\", wordList = [\"hot\",\"dot\",\"dog\",\"lot\",\"log\",\"cog\"]",
        output: "5",
        explanation: "One shortest chain is `hit -> hot -> dot -> dog -> cog`."
      },
      {
        input: "beginWord = \"hit\", endWord = \"cog\", wordList = [\"hot\",\"dot\",\"dog\",\"lot\",\"log\"]",
        output: "0",
        explanation: "The target word is missing, so no valid sequence can end there."
      },
      {
        input: "beginWord = \"a\", endWord = \"c\", wordList = [\"a\",\"b\",\"c\"]",
        output: "2",
        explanation: "A one-letter change reaches the target in two words."
      }
    ],
    constraints: ["`1 <= beginWord.length <= 10`","`endWord.length == beginWord.length`","`1 <= wordList.length <= 5000`","All words use lowercase English letters."],
    hints: ["Words are graph nodes; edges connect words that differ in one position.","Because every edge has equal cost, BFS gives the shortest sequence length.","Wildcard patterns such as `h*t` let you find neighbors without comparing every pair."],
    signature: {
      kind: "function",
      name: "ladderLength",
      params: [
        {
          name: "beginWord",
          type: "string"
        },
        {
          name: "endWord",
          type: "string"
        },
        {
          name: "wordList",
          type: "string[]"
        }
      ],
      returns: "int"
    },
    tests: [
      {
        args: [
          "hit",
          "cog",
          ["hot","dot","dog","lot","log","cog"]
        ],
        expected: 5
      },
      {
        args: [
          "hit",
          "cog",
          ["hot","dot","dog","lot","log"]
        ],
        expected: 0
      },
      {
        args: [
          "a",
          "c",
          ["a","b","c"]
        ],
        expected: 2
      },
      {
        args: [
          "lost",
          "fish",
          ["lost","cost","most","mist","fist","fish"]
        ],
        expected: 5
      },
      {
        args: [
          "red",
          "tax",
          ["ted","tex","red","tax","tad","den","rex","pee"]
        ],
        expected: 4
      },
      {
        args: [
          "hot",
          "dog",
          ["hot","dog"]
        ],
        expected: 0
      },
      {
        args: [
          "hot",
          "dot",
          ["dot"]
        ],
        expected: 2
      },
      {
        args: [
          "abc",
          "xyz",
          ["xbc","xyc","xyz","ayc","abc"]
        ],
        expected: 4
      }
    ],
    viz: "graph-traversal",
    solutions: [
      {
        title: "BFS with wildcard buckets",
        explanation: `**Intuition.** Group words by patterns that replace one character with \`*\`; words sharing a pattern are one edit apart.

**Steps.**
1. If \`endWord\` is absent, return \`0\`.
2. Build a map from wildcard pattern to words for \`beginWord\` plus the word list.
3. BFS from \`beginWord\` with distance one.
4. For each popped word, visit all words in its wildcard buckets.

**Correctness.** The wildcard map enumerates exactly one-letter transformations. BFS explores by increasing number of words in the sequence, so the first time \`endWord\` is popped or discovered gives the shortest length.

**Pitfalls.** Clear a bucket after processing it to avoid scanning the same neighbor list many times.`,
        time: "O(N * L^2) with string slicing",
        space: "O(N * L)",
        python: `class Solution:
    def ladderLength(self, beginWord: str, endWord: str, wordList: List[str]) -> int:
        words = set(wordList)
        if endWord not in words:
            return 0
        words.add(beginWord)
        buckets = defaultdict(list)
        L = len(beginWord)
        for word in words:
            for i in range(L):
                buckets[word[:i] + '*' + word[i + 1:]].append(word)
        q = deque([(beginWord, 1)])
        seen = {beginWord}
        while q:
            word, dist = q.popleft()
            if word == endWord:
                return dist
            for i in range(L):
                pat = word[:i] + '*' + word[i + 1:]
                for nxt in buckets[pat]:
                    if nxt not in seen:
                        seen.add(nxt)
                        q.append((nxt, dist + 1))
                buckets[pat] = []
        return 0
`,
        cpp: `class Solution {
public:
    int ladderLength(string beginWord, string endWord, vector<string>& wordList) {
        unordered_set<string> words(wordList.begin(), wordList.end());
        if (!words.count(endWord)) return 0;
        words.insert(beginWord);
        int L = beginWord.size();
        unordered_map<string, vector<string>> buckets;
        for (const string& word : words) {
            for (int i = 0; i < L; ++i) {
                string pat = word;
                pat[i] = '*';
                buckets[pat].push_back(word);
            }
        }
        queue<pair<string,int>> q;
        unordered_set<string> seen{beginWord};
        q.push({beginWord, 1});
        while (!q.empty()) {
            auto [word, dist] = q.front(); q.pop();
            if (word == endWord) return dist;
            for (int i = 0; i < L; ++i) {
                string pat = word;
                pat[i] = '*';
                for (const string& nxt : buckets[pat]) {
                    if (!seen.count(nxt)) {
                        seen.insert(nxt);
                        q.push({nxt, dist + 1});
                    }
                }
                buckets[pat].clear();
            }
        }
        return 0;
    }
};`
      },
      {
        title: "Bidirectional BFS",
        explanation: `**Intuition.** Expand from both \`beginWord\` and \`endWord\`; meeting in the middle often visits far fewer words.

**Steps.**
1. Keep two frontiers and a set of unused words.
2. Always expand the smaller frontier.
3. Generate all one-letter mutations of each frontier word.
4. If a mutation appears in the opposite frontier, return the current distance plus one.

**Correctness.** Each round extends all paths from one side by one edge. When frontiers meet, the combined path length is the shortest because BFS layers on both sides have explored all shorter possibilities.

**Pitfalls.** Remove words from the dictionary when they enter a frontier so cycles do not repeat work.`,
        time: "O(N * L * 26)",
        space: "O(N)",
        python: `class Solution:
    def ladderLength(self, beginWord: str, endWord: str, wordList: List[str]) -> int:
        words = set(wordList)
        if endWord not in words:
            return 0
        front, back = {beginWord}, {endWord}
        dist = 1
        alphabet = 'abcdefghijklmnopqrstuvwxyz'
        while front and back:
            if len(front) > len(back):
                front, back = back, front
            next_front = set()
            for word in front:
                arr = list(word)
                for i, old in enumerate(arr):
                    for ch in alphabet:
                        if ch == old:
                            continue
                        arr[i] = ch
                        nxt = ''.join(arr)
                        if nxt in back:
                            return dist + 1
                        if nxt in words:
                            words.remove(nxt)
                            next_front.add(nxt)
                    arr[i] = old
            front = next_front
            dist += 1
        return 0
`,
        cpp: `class Solution {
public:
    int ladderLength(string beginWord, string endWord, vector<string>& wordList) {
        unordered_set<string> words(wordList.begin(), wordList.end());
        if (!words.count(endWord)) return 0;
        unordered_set<string> front{beginWord}, back{endWord};
        int dist = 1;
        while (!front.empty() && !back.empty()) {
            if (front.size() > back.size()) swap(front, back);
            unordered_set<string> next;
            for (string word : front) {
                for (int i = 0; i < (int)word.size(); ++i) {
                    char old = word[i];
                    for (char ch = 'a'; ch <= 'z'; ++ch) {
                        if (ch == old) continue;
                        word[i] = ch;
                        if (back.count(word)) return dist + 1;
                        if (words.erase(word)) next.insert(word);
                    }
                    word[i] = old;
                }
            }
            front.swap(next);
            ++dist;
        }
        return 0;
    }
};`
      }
    ]
  }
]

export default problems
