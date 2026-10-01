import type { DsaProblem } from '../../types/content'

const problems: DsaProblem[] = [
  {
    id: "implement-trie-prefix-tree",
    title: "Implement Trie (Prefix Tree)",
    number: 208,
    difficulty: "Medium",
    category: "Tries",
    pattern: "Prefix Tree",
    description: `Design a Trie that stores lowercase words.

insert adds a word, search checks whether an exact word was inserted, and startsWith checks whether any inserted word has the given prefix.`,
    examples: [
      { input: "ops = [\"Trie\",\"insert\",\"search\",\"search\",\"startsWith\",\"insert\",\"search\"], args = [[],[\"apple\"],[\"apple\"],[\"app\"],[\"app\"],[\"app\"],[\"app\"]]", output: "[null,null,true,false,true,null,true]" },
      { input: "ops = [\"Trie\",\"search\",\"startsWith\",\"insert\",\"startsWith\",\"search\"], args = [[],[\"a\"],[\"a\"],[\"a\"],[\"a\"],[\"a\"]]", output: "[null,false,false,null,true,true]" },
      { input: "ops = [\"Trie\",\"insert\",\"insert\",\"search\",\"startsWith\",\"search\"], args = [[],[\"car\"],[\"cat\"],[\"car\"],[\"ca\"],[\"cap\"]]", output: "[null,null,null,true,true,false]" },
    ],
    constraints: ["1 <= word.length, prefix.length <= 2000", "Words contain lowercase English letters.", "At most 3 * 10^4 operations are called."],
    hints: ["Words with the same prefix should share work.", "Each trie node needs links to children and a marker for exact word endings.", "search and startsWith walk the same path; only search checks the ending marker."],
    signature: {"kind": "class", "className": "Trie", "ctorParams": [], "methods": [{"name": "insert", "params": [{"name": "word", "type": "string"}], "returns": "void"}, {"name": "search", "params": [{"name": "word", "type": "string"}], "returns": "bool"}, {"name": "startsWith", "params": [{"name": "prefix", "type": "string"}], "returns": "bool"}]},
    tests: [
      { ops: ["Trie", "insert", "search", "search", "startsWith", "insert", "search"], args: [[], ["apple"], ["apple"], ["app"], ["app"], ["app"], ["app"]], expected: [null, null, true, false, true, null, true] },
      { ops: ["Trie", "search", "startsWith", "insert", "startsWith", "search"], args: [[], ["a"], ["a"], ["a"], ["a"], ["a"]], expected: [null, false, false, null, true, true] },
      { ops: ["Trie", "insert", "insert", "search", "startsWith", "search"], args: [[], ["car"], ["cat"], ["car"], ["ca"], ["cap"]], expected: [null, null, null, true, true, false] },
      { ops: ["Trie", "insert", "insert", "search", "search", "startsWith"], args: [[], ["dog"], ["dog"], ["dog"], ["do"], ["dog"]], expected: [null, null, null, true, false, true] },
      { ops: ["Trie", "insert", "startsWith", "startsWith", "search"], args: [[], ["banana"], ["ban"], ["band"], ["banana"]], expected: [null, null, true, false, true] },
      { ops: ["Trie", "insert", "insert", "startsWith", "search", "search"], args: [[], ["a"], ["ab"], ["a"], ["a"], ["ab"]], expected: [null, null, null, true, true, true] },
    ],
    solutions: [
      {
        title: "Store Whole Words",
        explanation: `**Intuition.** A simple design stores every inserted word and checks operations by scanning the collection.

**Steps.**
1. Append or insert the full word.
2. For search, test exact membership.
3. For startsWith, scan words until one begins with the prefix.

**Why it is correct.** Every inserted word remains in the collection, so exact and prefix checks over that collection are correct.

**Pitfalls.** Prefix scans can be slow when many words are stored.`,
        time: "insert: O(1), search: O(w), startsWith: O(total characters)",
        space: "O(total characters)",
        python: `class Trie:
    def __init__(self):
        self.words = set()
    def insert(self, word: str) -> None:
        self.words.add(word)
    def search(self, word: str) -> bool:
        return word in self.words
    def startsWith(self, prefix: str) -> bool:
        return any(word.startswith(prefix) for word in self.words)
`,
        cpp: `class Trie {
    vector<string> words;
public:
    Trie() {}
    void insert(string word) { words.push_back(word); }
    bool search(string word) { return find(words.begin(), words.end(), word) != words.end(); }
    bool startsWith(string prefix) {
        for (auto& word : words) if (word.rfind(prefix, 0) == 0) return true;
        return false;
    }
};`,
      },
      {
        title: "Trie Nodes",
        explanation: `**Intuition.** A prefix tree stores shared prefixes once and branches only when words differ.

**Steps.**
1. Start at the root.
2. Create child nodes as needed while inserting.
3. Mark the final node as a word ending.
4. For queries, walk characters and fail if a child is missing.

**Why it is correct.** A word or prefix exists exactly when its character path exists from the root; the ending marker distinguishes exact words.

**Pitfalls.** Without an ending marker, inserting apple would incorrectly make app a word.`,
        time: "O(length) per operation",
        space: "O(total inserted characters)",
        python: `class Trie:
    def __init__(self):
        self.root = {}
    def insert(self, word: str) -> None:
        node = self.root
        for ch in word:
            node = node.setdefault(ch, {})
        node['#'] = True
    def search(self, word: str) -> bool:
        node = self.root
        for ch in word:
            if ch not in node:
                return False
            node = node[ch]
        return '#' in node
    def startsWith(self, prefix: str) -> bool:
        node = self.root
        for ch in prefix:
            if ch not in node:
                return False
            node = node[ch]
        return True
`,
        cpp: `class Trie {
    struct Node { array<Node*, 26> next{}; bool end = false; };
    Node* root;
public:
    Trie() : root(new Node()) {}
    void insert(string word) {
        Node* cur = root;
        for (char ch : word) {
            int i = ch - 'a';
            if (!cur->next[i]) cur->next[i] = new Node();
            cur = cur->next[i];
        }
        cur->end = true;
    }
    bool search(string word) {
        Node* cur = root;
        for (char ch : word) {
            int i = ch - 'a';
            if (!cur->next[i]) return false;
            cur = cur->next[i];
        }
        return cur->end;
    }
    bool startsWith(string prefix) {
        Node* cur = root;
        for (char ch : prefix) {
            int i = ch - 'a';
            if (!cur->next[i]) return false;
            cur = cur->next[i];
        }
        return true;
    }
};`,
      },
    ],
    viz: "trie",
  },
  {
    id: "design-add-and-search-words-data-structure",
    title: "Design Add and Search Words Data Structure",
    number: 211,
    difficulty: "Medium",
    category: "Tries",
    pattern: "Trie DFS with Wildcards",
    description: `Design a WordDictionary for lowercase words.

addWord stores a word. search returns whether a stored word matches the query, where dot can stand for any one lowercase letter.`,
    examples: [
      { input: "ops = [\"WordDictionary\",\"addWord\",\"addWord\",\"addWord\",\"search\",\"search\",\"search\",\"search\"], args = [[],[\"bad\"],[\"dad\"],[\"mad\"],[\"pad\"],[\"bad\"],[\".ad\"],[\"b..\"]]", output: "[null,null,null,null,false,true,true,true]" },
      { input: "ops = [\"WordDictionary\",\"search\",\"addWord\",\"search\",\"search\"], args = [[],[\".\"],[\"a\"],[\".\"],[\"a\"]]", output: "[null,false,null,true,true]" },
      { input: "ops = [\"WordDictionary\",\"addWord\",\"addWord\",\"search\",\"search\",\"search\"], args = [[],[\"at\"],[\"and\"],[\"a.\"],[\".n.\"],[\"an\"]]", output: "[null,null,null,true,true,false]" },
    ],
    constraints: ["1 <= word.length <= 25", "Words and queries contain lowercase letters; queries may also contain dot.", "At most 10^4 operations are called.", "Every dot matches exactly one character."],
    hints: ["Without dots, this is exact trie search.", "A dot means the search must branch to every existing child at that depth.", "Depth-first search over trie nodes handles literal letters and wildcards uniformly."],
    signature: {"kind": "class", "className": "WordDictionary", "ctorParams": [], "methods": [{"name": "addWord", "params": [{"name": "word", "type": "string"}], "returns": "void"}, {"name": "search", "params": [{"name": "word", "type": "string"}], "returns": "bool"}]},
    tests: [
      { ops: ["WordDictionary", "addWord", "addWord", "addWord", "search", "search", "search", "search"], args: [[], ["bad"], ["dad"], ["mad"], ["pad"], ["bad"], [".ad"], ["b.."]], expected: [null, null, null, null, false, true, true, true] },
      { ops: ["WordDictionary", "search", "addWord", "search", "search"], args: [[], ["."], ["a"], ["."], ["a"]], expected: [null, false, null, true, true] },
      { ops: ["WordDictionary", "addWord", "addWord", "search", "search", "search"], args: [[], ["at"], ["and"], ["a."], [".n."], ["an"]], expected: [null, null, null, true, true, false] },
      { ops: ["WordDictionary", "addWord", "addWord", "addWord", "search", "search", "search"], args: [[], ["ran"], ["rune"], ["runner"], ["ru.e"], ["run..r"], ["r.n"]], expected: [null, null, null, null, true, true, true] },
      { ops: ["WordDictionary", "addWord", "addWord", "search", "search", "search"], args: [[], ["a"], ["ab"], [".."], ["."], ["..."]], expected: [null, null, null, true, true, false] },
      { ops: ["WordDictionary", "addWord", "search", "search", "search"], args: [[], ["leetcode"], ["leet...."], ["leetc.de"], ["leetcod."]], expected: [null, null, true, true, true] },
    ],
    solutions: [
      {
        title: "Scan Stored Words",
        explanation: `**Intuition.** A direct solution checks the pattern against every stored word.

**Steps.**
1. Keep a list of inserted words.
2. Skip words of different length.
3. Compare characters, allowing dot to match anything.
4. Return true on the first full match.

**Why it is correct.** A query matches if and only if some stored word has the same length and satisfies every literal position.

**Pitfalls.** This becomes slow when many words share long prefixes.`,
        time: "O(number of words · query length)",
        space: "O(total characters)",
        python: `class WordDictionary:
    def __init__(self):
        self.words = []
    def addWord(self, word: str) -> None:
        self.words.append(word)
    def search(self, word: str) -> bool:
        for candidate in self.words:
            if len(candidate) == len(word) and all(a == b or b == '.' for a, b in zip(candidate, word)):
                return True
        return False
`,
        cpp: `class WordDictionary {
    vector<string> words;
public:
    WordDictionary() {}
    void addWord(string word) { words.push_back(word); }
    bool search(string word) {
        for (auto& candidate : words) {
            if (candidate.size() != word.size()) continue;
            bool ok = true;
            for (int i = 0; i < (int)word.size(); ++i) {
                if (word[i] != '.' && word[i] != candidate[i]) { ok = false; break; }
            }
            if (ok) return true;
        }
        return false;
    }
};`,
      },
      {
        title: "Trie DFS",
        explanation: `**Intuition.** The trie prunes impossible prefixes, while DFS handles wildcard branching only where needed.

**Steps.**
1. Insert words into trie nodes with end markers.
2. During search, walk literal characters to one child.
3. For dot, recursively try each existing child.
4. At the end, require a word-ending marker.

**Why it is correct.** The recursion explores exactly trie paths that match the query prefix so far, and a successful terminal node is a stored matching word.

**Pitfalls.** A wildcard matches one character, not zero or many.`,
        time: "O(26^d · L) worst case, usually pruned",
        space: "O(total inserted characters)",
        python: `class WordDictionary:
    def __init__(self):
        self.root = {}
    def addWord(self, word: str) -> None:
        node = self.root
        for ch in word:
            node = node.setdefault(ch, {})
        node['#'] = True
    def search(self, word: str) -> bool:
        def dfs(node, i):
            if i == len(word):
                return '#' in node
            ch = word[i]
            if ch == '.':
                return any(key != '#' and dfs(child, i + 1) for key, child in node.items())
            return ch in node and dfs(node[ch], i + 1)
        return dfs(self.root, 0)
`,
        cpp: `class WordDictionary {
    struct Node { array<Node*, 26> next{}; bool end = false; };
    Node* root;
    bool dfs(Node* node, const string& word, int i) {
        if (i == (int)word.size()) return node->end;
        if (word[i] == '.') {
            for (Node* child : node->next) if (child && dfs(child, word, i + 1)) return true;
            return false;
        }
        int k = word[i] - 'a';
        return node->next[k] && dfs(node->next[k], word, i + 1);
    }
public:
    WordDictionary() : root(new Node()) {}
    void addWord(string word) {
        Node* cur = root;
        for (char ch : word) {
            int i = ch - 'a';
            if (!cur->next[i]) cur->next[i] = new Node();
            cur = cur->next[i];
        }
        cur->end = true;
    }
    bool search(string word) { return dfs(root, word, 0); }
};`,
      },
    ],
    viz: "trie",
  },
  {
    id: "word-search-ii",
    title: "Word Search II",
    number: 212,
    difficulty: "Hard",
    category: "Tries",
    pattern: "Trie-Guided Backtracking",
    description: `Given a grid of lowercase letters and a list of words, implement findWords to return every word that can be formed by walking horizontally or vertically adjacent cells.

A cell may be used at most once in the same word. The returned words may be in any order.`,
    examples: [
      { input: "board = [[\"o\",\"a\",\"a\",\"n\"],[\"e\",\"t\",\"a\",\"e\"],[\"i\",\"h\",\"k\",\"r\"],[\"i\",\"f\",\"l\",\"v\"]], words = [\"oath\",\"pea\",\"eat\",\"rain\"]", output: "[\"oath\",\"eat\"]" },
      { input: "board = [[\"a\",\"b\"],[\"c\",\"d\"]], words = [\"abcb\"]", output: "[]" },
      { input: "board = [[\"a\"]], words = [\"a\",\"b\"]", output: "[\"a\"]" },
    ],
    constraints: ["1 <= board.length, board[i].length <= 12", "1 <= words.length <= 3 * 10^4", "Words contain lowercase English letters.", "A board cell cannot be reused within one word path."],
    hints: ["Searching the board separately for every word repeats a lot of prefix work.", "Build a trie of all target words and walk the board once against that trie.", "When a trie node stores a completed word, add it and clear it to avoid duplicates."],
    signature: {"kind": "function", "name": "findWords", "params": [{"name": "board", "type": "char[][]"}, {"name": "words", "type": "string[]"}], "returns": "string[]"},
    compare: "unordered",
    tests: [
      { args: [[["o", "a", "a", "n"], ["e", "t", "a", "e"], ["i", "h", "k", "r"], ["i", "f", "l", "v"]], ["oath", "pea", "eat", "rain"]], expected: ["oath", "eat"] },
      { args: [[["a", "b"], ["c", "d"]], ["abcb"]], expected: [] },
      { args: [[["a"]], ["a", "b"]], expected: ["a"] },
      { args: [[["a", "b"], ["c", "d"]], ["ab", "abcd", "acdb", "bd"]], expected: ["ab", "acdb", "bd"] },
      { args: [[["a", "a"], ["a", "a"]], ["a", "aa", "aaa", "aaaa", "aaaaa"]], expected: ["a", "aa", "aaa", "aaaa"] },
      { args: [[["o", "a"], ["t", "h"]], ["oath", "oa", "oh", "hat"]], expected: ["oa"] },
      { args: [[["x", "y", "z"]], ["xy", "xyz", "xz", "zyx"]], expected: ["xy", "xyz", "zyx"] },
      { args: [[["s", "e", "e"], ["n", "o", "w"]], ["see", "seen", "snow", "owe", "no"]], expected: ["see", "snow", "owe", "no"] },
    ],
    solutions: [
      {
        title: "DFS Once per Word",
        explanation: `**Intuition.** The straightforward approach asks the grid whether each word exists independently.

**Steps.**
1. For every word, start DFS from each cell.
2. Match one character per step and mark cells used in the current path.
3. Return the word if any path consumes all characters.
4. Repeat for all words.

**Why it is correct.** For a fixed word, DFS enumerates all valid non-reusing paths, so it finds the word exactly when such a path exists.

**Pitfalls.** This repeats searches for shared prefixes.`,
        time: "O(W · R · C · 4^L)",
        space: "O(L) recursion",
        python: `class Solution:
    def findWords(self, board: List[List[str]], words: List[str]) -> List[str]:
        rows, cols = len(board), len(board[0])
        def exists(word):
            def dfs(r, c, i, seen):
                if i == len(word):
                    return True
                if r < 0 or c < 0 or r == rows or c == cols or (r, c) in seen or board[r][c] != word[i]:
                    return False
                seen.add((r, c))
                ok = (dfs(r + 1, c, i + 1, seen) or dfs(r - 1, c, i + 1, seen) or
                      dfs(r, c + 1, i + 1, seen) or dfs(r, c - 1, i + 1, seen))
                seen.remove((r, c))
                return ok
            return any(dfs(r, c, 0, set()) for r in range(rows) for c in range(cols))
        return [word for word in words if exists(word)]
`,
        cpp: `class Solution {
    int rows, cols;
    bool dfs(vector<vector<char>>& board, string& word, int r, int c, int i, vector<vector<int>>& seen) {
        if (i == (int)word.size()) return true;
        if (r < 0 || c < 0 || r == rows || c == cols || seen[r][c] || board[r][c] != word[i]) return false;
        seen[r][c] = 1;
        bool ok = dfs(board, word, r + 1, c, i + 1, seen) || dfs(board, word, r - 1, c, i + 1, seen) || dfs(board, word, r, c + 1, i + 1, seen) || dfs(board, word, r, c - 1, i + 1, seen);
        seen[r][c] = 0;
        return ok;
    }
    bool exists(vector<vector<char>>& board, string& word) {
        vector<vector<int>> seen(rows, vector<int>(cols));
        for (int r = 0; r < rows; ++r) for (int c = 0; c < cols; ++c) if (dfs(board, word, r, c, 0, seen)) return true;
        return false;
    }
public:
    vector<string> findWords(vector<vector<char>>& board, vector<string>& words) {
        rows = board.size(); cols = board[0].size();
        vector<string> ans;
        for (auto& word : words) if (exists(board, word)) ans.push_back(word);
        return ans;
    }
};`,
      },
      {
        title: "Trie-Guided Board DFS",
        explanation: `**Intuition.** A trie lets one board traversal explore all words sharing the current prefix at once.

**Steps.**
1. Insert every target word into a trie.
2. Start DFS from each board cell following trie edges.
3. Mark cells during exploration so they are not reused.
4. When a terminal word is reached, add it and clear that marker.

**Why it is correct.** Each DFS path corresponds to a board path and a trie prefix. A word is emitted only when both spell a target word.

**Pitfalls.** Clear found word markers to avoid returning duplicates.`,
        time: "O(R · C · 4^L) bounded by trie pruning",
        space: "O(total word characters)",
        python: `class Solution:
    def findWords(self, board: List[List[str]], words: List[str]) -> List[str]:
        root = {}
        for word in words:
            node = root
            for ch in word:
                node = node.setdefault(ch, {})
            node['#'] = word
        rows, cols = len(board), len(board[0])
        found = []
        def dfs(r, c, node):
            ch = board[r][c]
            if ch not in node:
                return
            nxt = node[ch]
            word = nxt.pop('#', None)
            if word is not None:
                found.append(word)
            board[r][c] = '*'
            for dr, dc in ((1, 0), (-1, 0), (0, 1), (0, -1)):
                nr, nc = r + dr, c + dc
                if 0 <= nr < rows and 0 <= nc < cols and board[nr][nc] != '*':
                    dfs(nr, nc, nxt)
            board[r][c] = ch
        for r in range(rows):
            for c in range(cols):
                dfs(r, c, root)
        return found
`,
        cpp: `class Solution {
    struct Node { array<Node*, 26> next{}; string word; };
    int rows, cols;
    vector<string> found;
    void dfs(vector<vector<char>>& board, int r, int c, Node* node) {
        char ch = board[r][c];
        int k = ch - 'a';
        if (!node->next[k]) return;
        node = node->next[k];
        if (!node->word.empty()) { found.push_back(node->word); node->word.clear(); }
        board[r][c] = '*';
        int dr[4] = {1, -1, 0, 0};
        int dc[4] = {0, 0, 1, -1};
        for (int t = 0; t < 4; ++t) {
            int nr = r + dr[t], nc = c + dc[t];
            if (0 <= nr && nr < rows && 0 <= nc && nc < cols && board[nr][nc] != '*') dfs(board, nr, nc, node);
        }
        board[r][c] = ch;
    }
public:
    vector<string> findWords(vector<vector<char>>& board, vector<string>& words) {
        Node* root = new Node();
        for (auto& word : words) {
            Node* cur = root;
            for (char ch : word) {
                int k = ch - 'a';
                if (!cur->next[k]) cur->next[k] = new Node();
                cur = cur->next[k];
            }
            cur->word = word;
        }
        rows = board.size(); cols = board[0].size();
        for (int r = 0; r < rows; ++r) for (int c = 0; c < cols; ++c) dfs(board, r, c, root);
        return found;
    }
};`,
      },
    ],
    viz: "trie",
  },
]

export default problems
