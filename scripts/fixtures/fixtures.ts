// Harness self-test fixtures covering every signature kind / value type. Run:
//   DSA_DIR=scripts/fixtures npx tsx scripts/validate.ts dsa
import type { DsaProblem } from '../../src/types/content'

const base = {
  difficulty: 'Easy' as const,
  category: 'Arrays & Hashing' as const,
  pattern: 'fixture',
  description: 'fixture',
  examples: [{ input: '-', output: '-' }],
  constraints: [],
  hints: ['x'],
}

const fixtures: DsaProblem[] = [
  {
    ...base,
    id: 'two-sum',
    title: 'Two Sum',
    number: 1,
    signature: { kind: 'function', name: 'twoSum', params: [{ name: 'nums', type: 'int[]' }, { name: 'target', type: 'int' }], returns: 'int[]' },
    compare: 'unordered',
    tests: [
      { args: [[2, 7, 11, 15], 9], expected: [0, 1] },
      { args: [[3, 2, 4], 6], expected: [1, 2] },
      { args: [[3, 3], 6], expected: [0, 1] },
      { args: [[-2147483648, 5, 2147483647], -1], expected: [0, 2] },
      { args: [[1, 5, 9], 14], expected: [2, 1] },
    ],
    solutions: [
      {
        title: 'Hash map',
        explanation: '',
        time: 'O(n)',
        space: 'O(n)',
        python: `class Solution:
    def twoSum(self, nums: List[int], target: int) -> List[int]:
        seen = {}
        for i, x in enumerate(nums):
            if target - x in seen:
                print("found", i)
                return [seen[target - x], i]
            seen[x] = i
`,
        cpp: `class Solution {
public:
    vector<int> twoSum(vector<int>& nums, int target) {
        unordered_map<long long, int> seen;
        for (int i = 0; i < (int)nums.size(); ++i) {
            long long need = (long long)target - nums[i];
            if (seen.count(need)) { cout << "found " << i << endl; return {seen[need], i}; }
            seen[nums[i]] = i;
        }
        return {};
    }
};`,
      },
    ],
  },
  {
    ...base,
    id: 'reverse-list',
    title: 'Reverse List',
    number: 206,
    signature: { kind: 'function', name: 'reverseList', params: [{ name: 'head', type: 'ListNode' }], returns: 'ListNode' },
    tests: [
      { args: [[1, 2, 3, 4, 5]], expected: [5, 4, 3, 2, 1] },
      { args: [[1, 2]], expected: [2, 1] },
      { args: [[]], expected: [] },
      { args: [[7]], expected: [7] },
      { args: [[1, 1, 2]], expected: [2, 1, 1] },
    ],
    solutions: [
      {
        title: 'iter',
        explanation: '',
        time: '',
        space: '',
        python: `class Solution:
    def reverseList(self, head):
        prev = None
        while head:
            head.next, prev, head = prev, head, head.next
        return prev
`,
        cpp: `class Solution { public: ListNode* reverseList(ListNode* h) { ListNode* p = nullptr; while (h) { auto n = h->next; h->next = p; p = h; h = n; } return p; } };`,
      },
    ],
  },
  {
    ...base,
    id: 'lru-cache',
    title: 'LRU',
    number: 146,
    signature: {
      kind: 'class',
      className: 'LRUCache',
      ctorParams: [{ name: 'capacity', type: 'int' }],
      methods: [
        { name: 'get', params: [{ name: 'key', type: 'int' }], returns: 'int' },
        { name: 'put', params: [{ name: 'key', type: 'int' }, { name: 'value', type: 'int' }], returns: 'void' },
      ],
    },
    tests: [
      {
        ops: ['LRUCache', 'put', 'put', 'get', 'put', 'get', 'put', 'get', 'get', 'get'],
        args: [[2], [1, 1], [2, 2], [1], [3, 3], [2], [4, 4], [1], [3], [4]],
        expected: [null, null, null, 1, null, -1, null, -1, 3, 4],
      },
      { ops: ['LRUCache', 'get'], args: [[1], [5]], expected: [null, -1] },
      { ops: ['LRUCache', 'put', 'get'], args: [[1], [5, 6], [5]], expected: [null, null, 6] },
      { ops: ['LRUCache', 'put', 'put', 'get'], args: [[1], [5, 6], [5, 7], [5]], expected: [null, null, null, 7] },
      { ops: ['LRUCache', 'put', 'put', 'get'], args: [[1], [5, 6], [6, 7], [5]], expected: [null, null, null, -1] },
    ],
    solutions: [
      {
        title: 'OrderedDict',
        explanation: '',
        time: '',
        space: '',
        python: `class LRUCache:
    def __init__(self, capacity: int):
        self.c = capacity
        self.d = OrderedDict()
    def get(self, key: int) -> int:
        if key not in self.d: return -1
        self.d.move_to_end(key)
        return self.d[key]
    def put(self, key: int, value: int) -> None:
        self.d[key] = value
        self.d.move_to_end(key)
        if len(self.d) > self.c: self.d.popitem(last=False)
`,
        cpp: `class LRUCache {
    int cap; list<pair<int,int>> l; unordered_map<int, list<pair<int,int>>::iterator> m;
public:
    LRUCache(int capacity) : cap(capacity) {}
    int get(int key) { auto it = m.find(key); if (it == m.end()) return -1; l.splice(l.begin(), l, it->second); return it->second->second; }
    void put(int key, int value) {
        auto it = m.find(key);
        if (it != m.end()) { it->second->second = value; l.splice(l.begin(), l, it->second); return; }
        l.emplace_front(key, value); m[key] = l.begin();
        if ((int)m.size() > cap) { m.erase(l.back().first); l.pop_back(); }
    }
};`,
      },
    ],
  },
  {
    ...base,
    id: 'serialize-tree',
    title: 'Codec',
    number: 297,
    signature: { kind: 'codec', className: 'Codec', encode: 'serialize', decode: 'deserialize', dataType: 'TreeNode' },
    tests: [
      { args: [[1, 2, 3, null, null, 4, 5]], expected: [1, 2, 3, null, null, 4, 5] },
      { args: [[]], expected: [] },
      { args: [[1]], expected: [1] },
      { args: [[1, null, 2]], expected: [1, null, 2] },
      { args: [[-1, -2]], expected: [-1, -2] },
    ],
    solutions: [
      {
        title: 'preorder',
        explanation: '',
        time: '',
        space: '',
        python: `class Codec:
    def serialize(self, root):
        out = []
        def go(n):
            if not n: out.append('#'); return
            out.append(str(n.val)); go(n.left); go(n.right)
        go(root)
        return ','.join(out)
    def deserialize(self, data):
        it = iter(data.split(','))
        def go():
            v = next(it)
            if v == '#': return None
            n = TreeNode(int(v)); n.left = go(); n.right = go(); return n
        return go()
`,
        cpp: `class Codec {
public:
    string serialize(TreeNode* root) { string s; ser(root, s); return s; }
    TreeNode* deserialize(string data) { stringstream ss(data); return des(ss); }
private:
    void ser(TreeNode* n, string& s) { if (!n) { s += "#,"; return; } s += to_string(n->val) + ","; ser(n->left, s); ser(n->right, s); }
    TreeNode* des(stringstream& ss) { string t; getline(ss, t, ','); if (t == "#" || t.empty()) return nullptr; auto n = new TreeNode(stoi(t)); n->left = des(ss); n->right = des(ss); return n; }
};`,
      },
    ],
  },
  {
    ...base,
    id: 'encode-decode',
    title: 'Encode',
    number: 271,
    signature: { kind: 'codec', className: 'Solution', encode: 'encode', decode: 'decode', dataType: 'string[]' },
    tests: [
      { args: [['neet', 'code']], expected: ['neet', 'code'] },
      { args: [['']], expected: [''] },
      { args: [[]], expected: [] },
      { args: [['a#b', '3#x', 'quote"\\']], expected: ['a#b', '3#x', 'quote"\\'] },
      { args: [['line\nbreak', 'tab\t']], expected: ['line\nbreak', 'tab\t'] },
    ],
    solutions: [
      {
        title: 'length prefix',
        explanation: '',
        time: '',
        space: '',
        python: `class Solution:
    def encode(self, strs):
        return ''.join(f"{len(s)}#{s}" for s in strs)
    def decode(self, s):
        res, i = [], 0
        while i < len(s):
            j = s.index('#', i)
            n = int(s[i:j])
            res.append(s[j+1:j+1+n]); i = j + 1 + n
        return res
`,
        cpp: `class Solution {
public:
    string encode(vector<string>& strs) { string r; for (auto& s : strs) r += to_string(s.size()) + "#" + s; return r; }
    vector<string> decode(string s) {
        vector<string> r; size_t i = 0;
        while (i < s.size()) { size_t j = s.find('#', i); int n = stoi(s.substr(i, j - i)); r.push_back(s.substr(j + 1, n)); i = j + 1 + n; }
        return r;
    }
};`,
      },
    ],
  },
  {
    ...base,
    id: 'lca-bst',
    title: 'LCA',
    number: 235,
    signature: {
      kind: 'function',
      name: 'lowestCommonAncestor',
      params: [
        { name: 'root', type: 'TreeNode' },
        { name: 'p', type: 'TreeNodeRef' },
        { name: 'q', type: 'TreeNodeRef' },
      ],
      returns: 'TreeNodeRef',
    },
    tests: [
      { args: [[6, 2, 8, 0, 4, 7, 9, null, null, 3, 5], 2, 8], expected: 6 },
      { args: [[6, 2, 8, 0, 4, 7, 9, null, null, 3, 5], 2, 4], expected: 2 },
      { args: [[2, 1], 2, 1], expected: 2 },
      { args: [[6, 2, 8, 0, 4, 7, 9, null, null, 3, 5], 3, 5], expected: 4 },
      { args: [[6, 2, 8, 0, 4, 7, 9, null, null, 3, 5], 7, 9], expected: 8 },
    ],
    solutions: [
      {
        title: 'walk',
        explanation: '',
        time: '',
        space: '',
        python: `class Solution:
    def lowestCommonAncestor(self, root, p, q):
        while root:
            if p.val < root.val and q.val < root.val: root = root.left
            elif p.val > root.val and q.val > root.val: root = root.right
            else: return root
`,
        cpp: `class Solution { public: TreeNode* lowestCommonAncestor(TreeNode* r, TreeNode* p, TreeNode* q) { while (r) { if (p->val < r->val && q->val < r->val) r = r->left; else if (p->val > r->val && q->val > r->val) r = r->right; else return r; } return nullptr; } };`,
      },
    ],
  },
  {
    ...base,
    id: 'cycle',
    title: 'Cycle',
    number: 141,
    signature: { kind: 'function', name: 'hasCycle', params: [{ name: 'head', type: 'CycleList' }], returns: 'bool' },
    tests: [
      { args: [[[3, 2, 0, -4], 1]], expected: true },
      { args: [[[1, 2], 0]], expected: true },
      { args: [[[1], -1]], expected: false },
      { args: [[[], -1]], expected: false },
      { args: [[[1, 2, 3], -1]], expected: false },
    ],
    solutions: [
      {
        title: 'floyd',
        explanation: '',
        time: '',
        space: '',
        python: `class Solution:
    def hasCycle(self, head):
        s = f = head
        while f and f.next:
            s, f = s.next, f.next.next
            if s is f: return True
        return False
`,
        cpp: `class Solution { public: bool hasCycle(ListNode* h) { auto s = h, f = h; while (f && f->next) { s = s->next; f = f->next->next; if (s == f) return true; } return false; } };`,
      },
    ],
  },
  {
    ...base,
    id: 'copy-random',
    title: 'Random',
    number: 138,
    signature: { kind: 'function', name: 'copyRandomList', params: [{ name: 'head', type: 'RandomList' }], returns: 'RandomList' },
    tests: [
      { args: [[[7, null], [13, 0], [11, 4], [10, 2], [1, 0]]], expected: [[7, null], [13, 0], [11, 4], [10, 2], [1, 0]] },
      { args: [[[1, 1], [2, 1]]], expected: [[1, 1], [2, 1]] },
      { args: [[]], expected: [] },
      { args: [[[3, null], [3, 0], [3, null]]], expected: [[3, null], [3, 0], [3, null]] },
      { args: [[[5, 0]]], expected: [[5, 0]] },
    ],
    solutions: [
      {
        title: 'map',
        explanation: '',
        time: '',
        space: '',
        python: `class Solution:
    def copyRandomList(self, head):
        m = {None: None}
        c = head
        while c: m[c] = Node(c.val); c = c.next
        c = head
        while c: m[c].next = m[c.next]; m[c].random = m[c.random]; c = c.next
        return m[head]
`,
        cpp: `class Solution { public: Node* copyRandomList(Node* head) { unordered_map<Node*, Node*> m; m[nullptr] = nullptr; for (auto c = head; c; c = c->next) m[c] = new Node(c->val); for (auto c = head; c; c = c->next) { m[c]->next = m[c->next]; m[c]->random = m[c->random]; } return m[head]; } };`,
      },
    ],
  },
  {
    ...base,
    id: 'clone-graph',
    title: 'Clone',
    number: 133,
    signature: { kind: 'function', name: 'cloneGraph', params: [{ name: 'node', type: 'GraphNode' }], returns: 'GraphNode' },
    tests: [
      { args: [[[2, 4], [1, 3], [2, 4], [1, 3]]], expected: [[2, 4], [1, 3], [2, 4], [1, 3]] },
      { args: [[[]]], expected: [[]] },
      { args: [[]], expected: [] },
      { args: [[[2], [1]]], expected: [[2], [1]] },
      { args: [[[2, 3], [1], [1]]], expected: [[2, 3], [1], [1]] },
    ],
    solutions: [
      {
        title: 'dfs',
        explanation: '',
        time: '',
        space: '',
        python: `class Solution:
    def cloneGraph(self, node):
        m = {}
        def go(n):
            if n in m: return m[n]
            c = Node(n.val); m[n] = c
            c.neighbors = [go(x) for x in n.neighbors]
            return c
        return go(node) if node else None
`,
        cpp: `class Solution { unordered_map<Node*, Node*> m; public: Node* cloneGraph(Node* n) { if (!n) return nullptr; if (m.count(n)) return m[n]; auto c = new Node(n->val); m[n] = c; for (auto x : n->neighbors) c->neighbors.push_back(cloneGraph(x)); return c; } };`,
      },
    ],
  },
  {
    ...base,
    id: 'rotate-image',
    title: 'Rotate',
    number: 48,
    signature: { kind: 'function', name: 'rotate', params: [{ name: 'matrix', type: 'int[][]' }], returns: 'void', inPlace: 0 },
    tests: [
      { args: [[[1, 2, 3], [4, 5, 6], [7, 8, 9]]], expected: [[7, 4, 1], [8, 5, 2], [9, 6, 3]] },
      { args: [[[1]]], expected: [[1]] },
      { args: [[[1, 2], [3, 4]]], expected: [[3, 1], [4, 2]] },
      { args: [[[5, 1, 9, 11], [2, 4, 8, 10], [13, 3, 6, 7], [15, 14, 12, 16]]], expected: [[15, 13, 2, 5], [14, 3, 4, 1], [12, 6, 8, 9], [16, 7, 10, 11]] },
      { args: [[[0, 0], [0, 1]]], expected: [[0, 0], [1, 0]] },
    ],
    solutions: [
      {
        title: 'transpose+reverse',
        explanation: '',
        time: '',
        space: '',
        python: `class Solution:
    def rotate(self, matrix):
        matrix.reverse()
        for i in range(len(matrix)):
            for j in range(i):
                matrix[i][j], matrix[j][i] = matrix[j][i], matrix[i][j]
`,
        cpp: `class Solution { public: void rotate(vector<vector<int>>& m) { reverse(m.begin(), m.end()); for (size_t i = 0; i < m.size(); ++i) for (size_t j = 0; j < i; ++j) swap(m[i][j], m[j][i]); } };`,
      },
    ],
  },
  {
    ...base,
    id: 'course-schedule-ii',
    title: 'Course II',
    number: 210,
    compare: 'topoOrder',
    signature: { kind: 'function', name: 'findOrder', params: [{ name: 'numCourses', type: 'int' }, { name: 'prerequisites', type: 'int[][]' }], returns: 'int[]' },
    tests: [
      { args: [2, [[1, 0]]], expected: [0, 1] },
      { args: [4, [[1, 0], [2, 0], [3, 1], [3, 2]]], expected: [0, 2, 1, 3] },
      { args: [1, []], expected: [0] },
      { args: [2, [[1, 0], [0, 1]]], expected: [] },
      { args: [3, []], expected: [0, 1, 2] },
    ],
    solutions: [
      {
        title: 'kahn',
        explanation: '',
        time: '',
        space: '',
        python: `class Solution:
    def findOrder(self, n, pre):
        g = defaultdict(list); indeg = [0]*n
        for a, b in pre: g[b].append(a); indeg[a] += 1
        q = deque(i for i in range(n) if indeg[i] == 0); out = []
        while q:
            x = q.popleft(); out.append(x)
            for y in g[x]:
                indeg[y] -= 1
                if indeg[y] == 0: q.append(y)
        return out if len(out) == n else []
`,
        cpp: `class Solution { public: vector<int> findOrder(int n, vector<vector<int>>& pre) { vector<vector<int>> g(n); vector<int> in(n), out; for (auto& e : pre) { g[e[1]].push_back(e[0]); in[e[0]]++; } queue<int> q; for (int i = 0; i < n; ++i) if (!in[i]) q.push(i); while (!q.empty()) { int x = q.front(); q.pop(); out.push_back(x); for (int y : g[x]) if (--in[y] == 0) q.push(y); } return (int)out.size() == n ? out : vector<int>{}; } };`,
      },
    ],
  },
  {
    ...base,
    id: 'group-anagrams',
    title: 'Group',
    number: 49,
    compare: 'unorderedDeep',
    signature: { kind: 'function', name: 'groupAnagrams', params: [{ name: 'strs', type: 'string[]' }], returns: 'string[][]' },
    tests: [
      { args: [['eat', 'tea', 'tan', 'ate', 'nat', 'bat']], expected: [['bat'], ['nat', 'tan'], ['ate', 'eat', 'tea']] },
      { args: [['']], expected: [['']] },
      { args: [['a']], expected: [['a']] },
      { args: [['ab', 'ba', 'c']], expected: [['c'], ['ba', 'ab']] },
      { args: [['x', 'x']], expected: [['x', 'x']] },
    ],
    solutions: [
      {
        title: 'sorted key',
        explanation: '',
        time: '',
        space: '',
        python: `class Solution:
    def groupAnagrams(self, strs):
        d = defaultdict(list)
        for s in strs: d[''.join(sorted(s))].append(s)
        return list(d.values())
`,
        cpp: `class Solution { public: vector<vector<string>> groupAnagrams(vector<string>& strs) { unordered_map<string, vector<string>> d; for (auto& s : strs) { auto k = s; sort(k.begin(), k.end()); d[k].push_back(s); } vector<vector<string>> r; for (auto& [k, v] : d) r.push_back(v); return r; } };`,
      },
    ],
  },
  {
    ...base,
    id: 'reverse-bits',
    title: 'Bits',
    number: 190,
    signature: { kind: 'function', name: 'reverseBits', params: [{ name: 'n', type: 'uint32' }], returns: 'uint32' },
    tests: [
      { args: [43261596], expected: 964176192 },
      { args: [4294967293], expected: 3221225471 },
      { args: [0], expected: 0 },
      { args: [1], expected: 2147483648 },
      { args: [2147483648], expected: 1 },
    ],
    solutions: [
      {
        title: 'loop',
        explanation: '',
        time: '',
        space: '',
        python: `class Solution:
    def reverseBits(self, n: int) -> int:
        r = 0
        for _ in range(32):
            r = (r << 1) | (n & 1); n >>= 1
        return r
`,
        cpp: `class Solution { public: uint32_t reverseBits(uint32_t n) { uint32_t r = 0; for (int i = 0; i < 32; ++i) { r = (r << 1) | (n & 1); n >>= 1; } return r; } };`,
      },
    ],
  },
  {
    ...base,
    id: 'median',
    title: 'Median',
    number: 4,
    signature: { kind: 'function', name: 'findMedianSortedArrays', params: [{ name: 'a', type: 'int[]' }, { name: 'b', type: 'int[]' }], returns: 'double' },
    tests: [
      { args: [[1, 3], [2]], expected: 2.0 },
      { args: [[1, 2], [3, 4]], expected: 2.5 },
      { args: [[], [1]], expected: 1 },
      { args: [[0, 0], [0, 0]], expected: 0 },
      { args: [[1], [2, 3, 4, 5, 6]], expected: 3.5 },
    ],
    solutions: [
      {
        title: 'merge',
        explanation: '',
        time: '',
        space: '',
        python: `class Solution:
    def findMedianSortedArrays(self, a, b):
        c = sorted(a + b); n = len(c)
        return c[n//2] if n % 2 else (c[n//2-1] + c[n//2]) / 2
`,
        cpp: `class Solution { public: double findMedianSortedArrays(vector<int>& a, vector<int>& b) { vector<int> c(a); c.insert(c.end(), b.begin(), b.end()); sort(c.begin(), c.end()); int n = c.size(); return n % 2 ? c[n/2] : (c[n/2-1] + c[n/2]) / 2.0; } };`,
      },
    ],
  },
  {
    ...base,
    id: 'merge-k',
    title: 'MergeK',
    number: 23,
    signature: { kind: 'function', name: 'mergeKLists', params: [{ name: 'lists', type: 'ListNode[]' }], returns: 'ListNode' },
    tests: [
      { args: [[[1, 4, 5], [1, 3, 4], [2, 6]]], expected: [1, 1, 2, 3, 4, 4, 5, 6] },
      { args: [[]], expected: [] },
      { args: [[[]]], expected: [] },
      { args: [[[1], []]], expected: [1] },
      { args: [[[-1, 5], [0]]], expected: [-1, 0, 5] },
    ],
    solutions: [
      {
        title: 'heap',
        explanation: '',
        time: '',
        space: '',
        python: `class Solution:
    def mergeKLists(self, lists):
        h = [(n.val, i, n) for i, n in enumerate(lists) if n]
        heapify(h); d = c = ListNode()
        while h:
            v, i, n = heappop(h); c.next = n; c = n
            if n.next: heappush(h, (n.next.val, i, n.next))
        return d.next
`,
        cpp: `class Solution { public: ListNode* mergeKLists(vector<ListNode*>& lists) { auto cmp = [](ListNode* a, ListNode* b) { return a->val > b->val; }; priority_queue<ListNode*, vector<ListNode*>, decltype(cmp)> pq(cmp); for (auto l : lists) if (l) pq.push(l); ListNode d; ListNode* c = &d; while (!pq.empty()) { auto n = pq.top(); pq.pop(); c->next = n; c = n; if (n->next) pq.push(n->next); } return d.next; } };`,
      },
    ],
  },
  {
    ...base,
    id: 'longest-palindrome',
    title: 'LPS',
    number: 5,
    compare: 'anyOf',
    signature: { kind: 'function', name: 'longestPalindrome', params: [{ name: 's', type: 'string' }], returns: 'string' },
    tests: [
      { args: ['babad'], expected: ['bab', 'aba'] },
      { args: ['cbbd'], expected: ['bb'] },
      { args: ['a'], expected: ['a'] },
      { args: ['ac'], expected: ['a', 'c'] },
      { args: ['racecar'], expected: ['racecar'] },
    ],
    solutions: [
      {
        title: 'expand',
        explanation: '',
        time: '',
        space: '',
        python: `class Solution:
    def longestPalindrome(self, s):
        best = ''
        for i in range(len(s)):
            for l, r in ((i, i), (i, i + 1)):
                while l >= 0 and r < len(s) and s[l] == s[r]: l -= 1; r += 1
                if r - l - 1 > len(best): best = s[l+1:r]
        return best
`,
        cpp: `class Solution { public: string longestPalindrome(string s) { int bs = 0, bl = 0, n = s.size(); for (int i = 0; i < n; ++i) for (int k = 0; k < 2; ++k) { int l = i, r = i + k; while (l >= 0 && r < n && s[l] == s[r]) { --l; ++r; } if (r - l - 1 > bl) { bl = r - l - 1; bs = l + 1; } } return s.substr(bs, bl); } };`,
      },
    ],
  },
  {
    ...base,
    id: 'surrounded',
    title: 'Surrounded',
    number: 130,
    signature: { kind: 'function', name: 'solve', params: [{ name: 'board', type: 'char[][]' }], returns: 'void', inPlace: 0 },
    tests: [
      { args: [[['X', 'X', 'X', 'X'], ['X', 'O', 'O', 'X'], ['X', 'X', 'O', 'X'], ['X', 'O', 'X', 'X']]], expected: [['X', 'X', 'X', 'X'], ['X', 'X', 'X', 'X'], ['X', 'X', 'X', 'X'], ['X', 'O', 'X', 'X']] },
      { args: [[['X']]], expected: [['X']] },
      { args: [[['O']]], expected: [['O']] },
      { args: [[['O', 'O'], ['O', 'O']]], expected: [['O', 'O'], ['O', 'O']] },
      { args: [[['X', 'X', 'X'], ['X', 'O', 'X'], ['X', 'X', 'X']]], expected: [['X', 'X', 'X'], ['X', 'X', 'X'], ['X', 'X', 'X']] },
    ],
    solutions: [
      {
        title: 'border dfs',
        explanation: '',
        time: '',
        space: '',
        python: `class Solution:
    def solve(self, b):
        R, C = len(b), len(b[0])
        def dfs(r, c):
            if 0 <= r < R and 0 <= c < C and b[r][c] == 'O':
                b[r][c] = 'T'
                for dr, dc in ((1,0),(-1,0),(0,1),(0,-1)): dfs(r+dr, c+dc)
        for r in range(R):
            for c in range(C):
                if r in (0, R-1) or c in (0, C-1): dfs(r, c)
        for r in range(R):
            for c in range(C):
                b[r][c] = 'O' if b[r][c] == 'T' else 'X'
`,
        cpp: `class Solution { int R, C; void dfs(vector<vector<char>>& b, int r, int c) { if (r < 0 || c < 0 || r >= R || c >= C || b[r][c] != 'O') return; b[r][c] = 'T'; dfs(b, r+1, c); dfs(b, r-1, c); dfs(b, r, c+1); dfs(b, r, c-1); } public: void solve(vector<vector<char>>& b) { R = b.size(); C = b[0].size(); for (int r = 0; r < R; ++r) for (int c = 0; c < C; ++c) if (r == 0 || c == 0 || r == R-1 || c == C-1) dfs(b, r, c); for (auto& row : b) for (auto& x : row) x = x == 'T' ? 'O' : 'X'; } };`,
      },
    ],
  },
]

export default fixtures
