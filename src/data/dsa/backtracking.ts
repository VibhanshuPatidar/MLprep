import type { DsaProblem } from '../../types/content'

const problems: DsaProblem[] = [
  {
    id: "subsets",
    title: "Subsets",
    number: 78,
    difficulty: "Medium",
    category: "Backtracking",
    pattern: "Subset Enumeration",
    description: "Given an integer array `nums` with distinct values, implement `subsets(nums)` and return every subset of the values. The subsets may be returned in any order, and the numbers inside each subset should reflect the order in which you build that subset.",
    examples: [
      {
        input: "nums = [1,2,3]",
        output: "[[],[1],[2],[1,2],[3],[1,3],[2,3],[1,2,3]]",
        explanation: "All eight choices of taking or skipping three values are present."
      },
      {
        input: "nums = [0]",
        output: "[[],[0]]",
        explanation: "The empty set and the singleton set are both valid."
      },
      {
        input: "nums = [-1,1]",
        output: "[[],[-1],[1],[-1,1]]",
        explanation: "Negative values are handled the same way as positive values."
      }
    ],
    constraints: ["`0 <= nums.length <= 10`","`-10 <= nums[i] <= 10`","All values in `nums` are distinct.","Any ordering of the returned subset list is accepted."],
    hints: ["Each number has only two choices: appear in the current subset or stay out.","Keep a growing partial subset and advance one index at a time.","When all indices have been considered, copy the current partial subset into the answer."],
    signature: {
      kind: "function",
      name: "subsets",
      params: [
        {
          name: "nums",
          type: "int[]"
        }
      ],
      returns: "int[][]"
    },
    tests: [
      {
        args: [[1,2,3]],
        expected: [[],[1],[2],[1,2],[3],[1,3],[2,3],[1,2,3]]
      },
      {
        args: [[0]],
        expected: [[],[0]]
      },
      {
        args: [[-1,1]],
        expected: [[],[-1],[1],[-1,1]]
      },
      {
        args: [[]],
        expected: [[]]
      },
      {
        args: [[1,2]],
        expected: [[],[1],[2],[1,2]]
      },
      {
        args: [[3,1,2]],
        expected: [[],[3],[1],[3,1],[2],[3,2],[1,2],[3,1,2]]
      },
      {
        args: [[-2,0,2]],
        expected: [[],[-2],[0],[-2,0],[2],[-2,2],[0,2],[-2,0,2]]
      },
      {
        args: [[1,2,3,4,5,6]],
        expected: [[],[1],[2],[1,2],[3],[1,3],[2,3],[1,2,3],[4],[1,4],[2,4],[1,2,4],[3,4],[1,3,4],[2,3,4],[1,2,3,4],[5],[1,5],[2,5],[1,2,5],[3,5],[1,3,5],[2,3,5],[1,2,3,5],[4,5],[1,4,5],[2,4,5],[1,2,4,5],[3,4,5],[1,3,4,5],[2,3,4,5],[1,2,3,4,5],[6],[1,6],[2,6],[1,2,6],[3,6],[1,3,6],[2,3,6],[1,2,3,6],[4,6],[1,4,6],[2,4,6],[1,2,4,6],[3,4,6],[1,3,4,6],[2,3,4,6],[1,2,3,4,6],[5,6],[1,5,6],[2,5,6],[1,2,5,6],[3,5,6],[1,3,5,6],[2,3,5,6],[1,2,3,5,6],[4,5,6],[1,4,5,6],[2,4,5,6],[1,2,4,5,6],[3,4,5,6],[1,3,4,5,6],[2,3,4,5,6],[1,2,3,4,5,6]]
      }
    ],
    compare: "unorderedDeep",
    viz: "backtracking",
    solutions: [
      {
        title: "Cascading subsets",
        explanation: `**Intuition.** Start with the empty subset. When a new value arrives, every old subset has a twin that also contains that value.

**Steps.**
1. Initialize the answer with \`[[]]\`.
2. For each number, snapshot the current answer length.
3. Append \`number\` to each snapshot subset and push the new subset.

**Correctness.** After processing the first \`k\` numbers, the answer contains exactly all subsets of those \`k\` numbers. The next number is either absent from an old subset or present in exactly one newly-created twin, so the invariant extends to \`k + 1\`.

**Pitfalls.** Iterate over a snapshot of the old answer; otherwise newly-created subsets would be extended during the same round.`,
        time: "O(n * 2^n)",
        space: "O(n * 2^n)",
        python: `class Solution:
    def subsets(self, nums: List[int]) -> List[List[int]]:
        res = [[]]
        for x in nums:
            res += [cur + [x] for cur in res]
        return res
`,
        cpp: `class Solution {
public:
    vector<vector<int>> subsets(vector<int>& nums) {
        vector<vector<int>> res(1);
        for (int x : nums) {
            int old = res.size();
            for (int i = 0; i < old; ++i) {
                auto cur = res[i];
                cur.push_back(x);
                res.push_back(cur);
            }
        }
        return res;
    }
};`
      },
      {
        title: "Bit masks",
        explanation: `**Intuition.** A subset can be encoded by an \`n\`-bit number: bit \`i\` says whether \`nums[i]\` is selected.

**Steps.**
1. Loop over masks from \`0\` through \`2^n - 1\`.
2. For each bit that is set, copy the matching number into the current subset.
3. Store every constructed subset.

**Correctness.** Every mask corresponds to one unique include/exclude decision vector, and every decision vector has one mask, so the loop produces each subset exactly once.

**Pitfalls.** Use \`1 << n\` only because \`n\` is small; for larger \`n\`, the output size itself is already exponential.`,
        time: "O(n * 2^n)",
        space: "O(n * 2^n)",
        python: `class Solution:
    def subsets(self, nums: List[int]) -> List[List[int]]:
        n = len(nums)
        ans = []
        for mask in range(1 << n):
            cur = []
            for i in range(n):
                if mask & (1 << i):
                    cur.append(nums[i])
            ans.append(cur)
        return ans
`,
        cpp: `class Solution {
public:
    vector<vector<int>> subsets(vector<int>& nums) {
        int n = nums.size();
        vector<vector<int>> ans;
        for (int mask = 0; mask < (1 << n); ++mask) {
            vector<int> cur;
            for (int i = 0; i < n; ++i) {
                if (mask & (1 << i)) cur.push_back(nums[i]);
            }
            ans.push_back(cur);
        }
        return ans;
    }
};`
      }
    ]
  },
  {
    id: "combination-sum",
    title: "Combination Sum",
    number: 39,
    difficulty: "Medium",
    category: "Backtracking",
    pattern: "Unbounded Combination Search",
    description: "Implement `combinationSum(candidates, target)`. Return every unique nondecreasing combination whose values add to `target`; a candidate may be reused any number of times. The list of combinations can be in any order.",
    examples: [
      {
        input: "candidates = [2,3,6,7], target = 7",
        output: "[[2,2,3],[7]]",
        explanation: "`2 + 2 + 3` and `7` are the only sums that reach the target."
      },
      {
        input: "candidates = [2,3,5], target = 8",
        output: "[[2,2,2,2],[2,3,3],[3,5]]",
        explanation: "The value `2` can be used more than once, so `[2,2,2,2]` is valid."
      },
      {
        input: "candidates = [2], target = 1",
        output: "[]",
        explanation: "No positive combination can make a smaller target than the only candidate."
      }
    ],
    constraints: ["`1 <= candidates.length <= 30`","`2 <= candidates[i] <= 40` in the original problem; tests may include `1` to exercise reuse.","Candidate values are distinct.","`1 <= target <= 40`","Return each value combination once, regardless of construction path."],
    hints: ["Sort the candidates so that a path can stay nondecreasing.","After choosing candidate `i`, recurse from `i` again because reuse is allowed.","Stop a loop early when the sorted candidate is larger than the remaining sum."],
    signature: {
      kind: "function",
      name: "combinationSum",
      params: [
        {
          name: "candidates",
          type: "int[]"
        },
        {
          name: "target",
          type: "int"
        }
      ],
      returns: "int[][]"
    },
    tests: [
      {
        args: [
          [2,3,6,7],
          7
        ],
        expected: [[2,2,3],[7]]
      },
      {
        args: [
          [2,3,5],
          8
        ],
        expected: [[2,2,2,2],[2,3,3],[3,5]]
      },
      {
        args: [
          [2],
          1
        ],
        expected: []
      },
      {
        args: [
          [1],
          2
        ],
        expected: [[1,1]]
      },
      {
        args: [
          [7,3,2],
          18
        ],
        expected: [[2,2,2,2,2,2,2,2,2],[2,2,2,2,2,2,3,3],[2,2,2,2,3,7],[2,2,2,3,3,3,3],[2,2,7,7],[2,3,3,3,7],[3,3,3,3,3,3]]
      },
      {
        args: [
          [2,4,6],
          8
        ],
        expected: [[2,2,2,2],[2,2,4],[2,6],[4,4]]
      },
      {
        args: [
          [5,10],
          10
        ],
        expected: [[5,5],[10]]
      },
      {
        args: [
          [3,5,7],
          15
        ],
        expected: [[3,3,3,3,3],[3,5,7],[5,5,5]]
      }
    ],
    compare: "unorderedDeep",
    viz: "backtracking",
    solutions: [
      {
        title: "Sorted DFS",
        explanation: `**Intuition.** Build combinations in sorted order. That prevents different permutations of the same numbers from appearing as separate answers.

**Steps.**
1. Sort \`candidates\`.
2. DFS with a start index, a remaining sum, and a path.
3. When the remaining sum reaches zero, copy the path.
4. For choice \`i\`, recurse with the same \`i\` so the value can be reused.

**Correctness.** Every emitted path sums to the target because it is copied only when the remaining sum is zero. Every valid nondecreasing combination chooses its first value at some loop position and is then generated by the recursive call that allows the same or later positions.

**Pitfalls.** Do not recurse to \`i + 1\` after choosing a value; that would forbid repeated use.`,
        time: "O(A * T / m) roughly for the number of generated answers `A`; exponential in the worst case",
        space: "O(T / m) recursion depth plus output",
        python: `class Solution:
    def combinationSum(self, candidates: List[int], target: int) -> List[List[int]]:
        candidates.sort()
        res, path = [], []
        def dfs(start: int, rem: int) -> None:
            if rem == 0:
                res.append(path[:])
                return
            for i in range(start, len(candidates)):
                x = candidates[i]
                if x > rem:
                    break
                path.append(x)
                dfs(i, rem - x)
                path.pop()
        dfs(0, target)
        return res
`,
        cpp: `class Solution {
public:
    vector<vector<int>> combinationSum(vector<int>& candidates, int target) {
        sort(candidates.begin(), candidates.end());
        vector<vector<int>> res;
        vector<int> path;
        function<void(int,int)> dfs = [&](int start, int rem) {
            if (rem == 0) {
                res.push_back(path);
                return;
            }
            for (int i = start; i < (int)candidates.size(); ++i) {
                int x = candidates[i];
                if (x > rem) break;
                path.push_back(x);
                dfs(i, rem - x);
                path.pop_back();
            }
        };
        dfs(0, target);
        return res;
    }
};`
      },
      {
        title: "Dynamic programming by sum",
        explanation: `**Intuition.** Process candidates from small to large. \`dp[s]\` stores combinations for sum \`s\` using only processed candidates, so appended combinations stay nondecreasing.

**Steps.**
1. Set \`dp[0]\` to one empty combination.
2. For each candidate \`c\`, scan sums from \`c\` to \`target\`.
3. Append \`c\` to every combination already known for \`sum - c\`.
4. Return \`dp[target]\`.

**Correctness.** Because each candidate is processed once and sums increase, a combination can use the current candidate multiple times but never go back to an earlier order. Thus each multiset is represented once and only if its sum is reachable.

**Pitfalls.** Scanning sums downward would turn this into a 0/1 problem and lose repeated candidates.`,
        time: "O(target * number_of_combinations)",
        space: "O(target * number_of_combinations)",
        python: `class Solution:
    def combinationSum(self, candidates: List[int], target: int) -> List[List[int]]:
        dp = [[] for _ in range(target + 1)]
        dp[0] = [[]]
        for c in sorted(candidates):
            for s in range(c, target + 1):
                for combo in dp[s - c]:
                    dp[s].append(combo + [c])
        return dp[target]
`,
        cpp: `class Solution {
public:
    vector<vector<int>> combinationSum(vector<int>& candidates, int target) {
        sort(candidates.begin(), candidates.end());
        vector<vector<vector<int>>> dp(target + 1);
        dp[0].push_back({});
        for (int c : candidates) {
            for (int s = c; s <= target; ++s) {
                for (auto combo : dp[s - c]) {
                    combo.push_back(c);
                    dp[s].push_back(combo);
                }
            }
        }
        return dp[target];
    }
};`
      }
    ]
  },
  {
    id: "combination-sum-ii",
    title: "Combination Sum II",
    number: 40,
    difficulty: "Medium",
    category: "Backtracking",
    pattern: "Duplicate-Aware Backtracking",
    description: "Implement `combinationSum2(candidates, target)`. Each input element may be used at most once, but duplicate values in the input should not create duplicate combinations in the output. Return all value combinations that sum to `target` in any order.",
    examples: [
      {
        input: "candidates = [10,1,2,7,6,1,5], target = 8",
        output: "[[1,1,6],[1,2,5],[1,7],[2,6]]",
        explanation: "The two `1`s are separate elements, but duplicate result rows are removed."
      },
      {
        input: "candidates = [2,5,2,1,2], target = 5",
        output: "[[1,2,2],[5]]",
        explanation: "Only one copy of each array element may be used."
      },
      {
        input: "candidates = [1,1,1], target = 2",
        output: "[[1,1]]",
        explanation: "Two of the three ones can be chosen."
      }
    ],
    constraints: ["`1 <= candidates.length <= 100`","`1 <= candidates[i] <= 50`","`1 <= target <= 30`","The answer should contain unique value combinations only."],
    hints: ["Sort first so equal values are adjacent.","At one recursion depth, skip a value if the same value was already tried there.","After choosing index `i`, recurse from `i + 1` because that exact element is spent."],
    signature: {
      kind: "function",
      name: "combinationSum2",
      params: [
        {
          name: "candidates",
          type: "int[]"
        },
        {
          name: "target",
          type: "int"
        }
      ],
      returns: "int[][]"
    },
    tests: [
      {
        args: [
          [10,1,2,7,6,1,5],
          8
        ],
        expected: [[1,1,6],[1,2,5],[1,7],[2,6]]
      },
      {
        args: [
          [2,5,2,1,2],
          5
        ],
        expected: [[1,2,2],[5]]
      },
      {
        args: [
          [1,1,1],
          2
        ],
        expected: [[1,1]]
      },
      {
        args: [
          [1],
          1
        ],
        expected: [[1]]
      },
      {
        args: [
          [1],
          2
        ],
        expected: []
      },
      {
        args: [
          [3,1,3,5,1,1],
          8
        ],
        expected: [[1,1,1,5],[1,1,3,3],[3,5]]
      },
      {
        args: [
          [4,4,2,1,4,2,2,1,3],
          6
        ],
        expected: [[1,1,2,2],[1,1,4],[1,2,3],[2,2,2],[2,4]]
      },
      {
        args: [
          [2,2,2,2],
          4
        ],
        expected: [[2,2]]
      }
    ],
    compare: "unorderedDeep",
    viz: "backtracking",
    solutions: [
      {
        title: "Sorted DFS with skips",
        explanation: `**Intuition.** Sorting turns duplicate handling into a local decision: only the first equal value at a depth may start a branch.

**Steps.**
1. Sort the array.
2. DFS from a start index with a remaining sum.
3. In the loop, skip \`candidates[i]\` when it equals \`candidates[i-1]\` and \`i\` is not the first choice at this depth.
4. Recurse to \`i + 1\` after taking an element.

**Correctness.** Every copied path uses distinct indices and sums to the target. For any unique value combination, choosing the leftmost available copy at each depth produces it; later equal choices at the same depth are skipped, so duplicates are not emitted.

**Pitfalls.** Skip duplicates only within the same loop depth; skipping all equal values after a take would incorrectly forbid combinations like \`[1,1,6]\`.`,
        time: "O(2^n) in the worst case",
        space: "O(n) recursion depth plus output",
        python: `class Solution:
    def combinationSum2(self, candidates: List[int], target: int) -> List[List[int]]:
        candidates.sort()
        res, path = [], []
        def dfs(start: int, rem: int) -> None:
            if rem == 0:
                res.append(path[:])
                return
            prev = None
            for i in range(start, len(candidates)):
                x = candidates[i]
                if x == prev:
                    continue
                if x > rem:
                    break
                path.append(x)
                dfs(i + 1, rem - x)
                path.pop()
                prev = x
        dfs(0, target)
        return res
`,
        cpp: `class Solution {
public:
    vector<vector<int>> combinationSum2(vector<int>& candidates, int target) {
        sort(candidates.begin(), candidates.end());
        vector<vector<int>> res;
        vector<int> path;
        function<void(int,int)> dfs = [&](int start, int rem) {
            if (rem == 0) {
                res.push_back(path);
                return;
            }
            int prev = -1;
            for (int i = start; i < (int)candidates.size(); ++i) {
                int x = candidates[i];
                if (x == prev) continue;
                if (x > rem) break;
                path.push_back(x);
                dfs(i + 1, rem - x);
                path.pop_back();
                prev = x;
            }
        };
        dfs(0, target);
        return res;
    }
};`
      },
      {
        title: "Count each value",
        explanation: `**Intuition.** Instead of reasoning about repeated indices, compress the input into \`(value, count)\` pairs and choose how many copies of each value to take.

**Steps.**
1. Sort and count the values.
2. At pair \`idx\`, try \`0..count\` copies that do not exceed the remaining target.
3. Move to the next distinct value.
4. Record the path when the remaining target becomes zero.

**Correctness.** A unique combination has exactly one count for every distinct value, so the recursion has one path for it. All paths respect available counts and target sum, making every output valid.

**Pitfalls.** Remember to remove exactly the number of copies added before trying the next count.`,
        time: "O(product(count_i + 1))",
        space: "O(n) recursion depth plus output",
        python: `class Solution:
    def combinationSum2(self, candidates: List[int], target: int) -> List[List[int]]:
        items = sorted(Counter(candidates).items())
        res, path = [], []
        def dfs(idx: int, rem: int) -> None:
            if rem == 0:
                res.append(path[:])
                return
            if idx == len(items):
                return
            val, cnt = items[idx]
            max_take = min(cnt, rem // val)
            for take in range(max_take + 1):
                path.extend([val] * take)
                dfs(idx + 1, rem - val * take)
                for _ in range(take):
                    path.pop()
        dfs(0, target)
        return res
`,
        cpp: `class Solution {
public:
    vector<vector<int>> combinationSum2(vector<int>& candidates, int target) {
        map<int, int> counts;
        for (int x : candidates) counts[x]++;
        vector<pair<int,int>> items(counts.begin(), counts.end());
        vector<vector<int>> res;
        vector<int> path;
        function<void(int,int)> dfs = [&](int idx, int rem) {
            if (rem == 0) {
                res.push_back(path);
                return;
            }
            if (idx == (int)items.size()) return;
            auto [val, cnt] = items[idx];
            int maxTake = min(cnt, rem / val);
            for (int take = 0; take <= maxTake; ++take) {
                for (int k = 0; k < take; ++k) path.push_back(val);
                dfs(idx + 1, rem - val * take);
                for (int k = 0; k < take; ++k) path.pop_back();
            }
        };
        dfs(0, target);
        return res;
    }
};`
      }
    ]
  },
  {
    id: "permutations",
    title: "Permutations",
    number: 46,
    difficulty: "Medium",
    category: "Backtracking",
    pattern: "Permutation Search",
    description: "Implement `permute(nums)` for an array of distinct integers. Return every possible ordering of all values. The list of permutations may be in any order, but the order of values inside each permutation is significant.",
    examples: [
      {
        input: "nums = [1,2,3]",
        output: "[[1,2,3],[1,3,2],[2,1,3],[2,3,1],[3,1,2],[3,2,1]]",
        explanation: "There are `3! = 6` full orderings."
      },
      {
        input: "nums = [0,1]",
        output: "[[0,1],[1,0]]",
        explanation: "Two values can appear in either order."
      },
      {
        input: "nums = [1]",
        output: "[[1]]",
        explanation: "A single value has one ordering."
      }
    ],
    constraints: ["`1 <= nums.length <= 6`","`-10 <= nums[i] <= 10`","All values in `nums` are distinct.","The outer answer order is not important."],
    hints: ["A permutation is built one position at a time.","Track which indices have already been placed in the current path.","When the path length equals `nums.length`, copy it to the answer."],
    signature: {
      kind: "function",
      name: "permute",
      params: [
        {
          name: "nums",
          type: "int[]"
        }
      ],
      returns: "int[][]"
    },
    tests: [
      {
        args: [[1,2,3]],
        expected: [[1,2,3],[1,3,2],[2,1,3],[2,3,1],[3,1,2],[3,2,1]]
      },
      {
        args: [[0,1]],
        expected: [[0,1],[1,0]]
      },
      {
        args: [[1]],
        expected: [[1]]
      },
      {
        args: [[1,2]],
        expected: [[1,2],[2,1]]
      },
      {
        args: [[-1,0,1]],
        expected: [[-1,0,1],[-1,1,0],[0,-1,1],[0,1,-1],[1,-1,0],[1,0,-1]]
      },
      {
        args: [[3,2,1]],
        expected: [[3,2,1],[3,1,2],[2,3,1],[2,1,3],[1,3,2],[1,2,3]]
      },
      {
        args: [[1,2,3,4]],
        expected: [[1,2,3,4],[1,2,4,3],[1,3,2,4],[1,3,4,2],[1,4,2,3],[1,4,3,2],[2,1,3,4],[2,1,4,3],[2,3,1,4],[2,3,4,1],[2,4,1,3],[2,4,3,1],[3,1,2,4],[3,1,4,2],[3,2,1,4],[3,2,4,1],[3,4,1,2],[3,4,2,1],[4,1,2,3],[4,1,3,2],[4,2,1,3],[4,2,3,1],[4,3,1,2],[4,3,2,1]]
      },
      {
        args: [[0,-1]],
        expected: [[0,-1],[-1,0]]
      }
    ],
    compare: "unordered",
    viz: "backtracking",
    solutions: [
      {
        title: "Used-array DFS",
        explanation: `**Intuition.** At each depth, try every value that has not already appeared in the current prefix.

**Steps.**
1. Keep a boolean \`used\` array and a \`path\`.
2. Loop over all indices at each depth.
3. Choose an unused value, recurse, then unchoose it.
4. When the path is full, append a copy.

**Correctness.** The \`used\` array prevents repeated indices, so every output is a valid full ordering. Conversely, any valid ordering can be followed by choosing its first value, then its second, and so on, so it is generated.

**Pitfalls.** Always undo both the path append and the \`used\` mark after recursion.`,
        time: "O(n! * n)",
        space: "O(n) recursion depth plus output",
        python: `class Solution:
    def permute(self, nums: List[int]) -> List[List[int]]:
        res, path = [], []
        used = [False] * len(nums)
        def dfs() -> None:
            if len(path) == len(nums):
                res.append(path[:])
                return
            for i, x in enumerate(nums):
                if used[i]:
                    continue
                used[i] = True
                path.append(x)
                dfs()
                path.pop()
                used[i] = False
        dfs()
        return res
`,
        cpp: `class Solution {
public:
    vector<vector<int>> permute(vector<int>& nums) {
        vector<vector<int>> res;
        vector<int> path;
        vector<int> used(nums.size());
        function<void()> dfs = [&]() {
            if (path.size() == nums.size()) {
                res.push_back(path);
                return;
            }
            for (int i = 0; i < (int)nums.size(); ++i) {
                if (used[i]) continue;
                used[i] = 1;
                path.push_back(nums[i]);
                dfs();
                path.pop_back();
                used[i] = 0;
            }
        };
        dfs();
        return res;
    }
};`
      },
      {
        title: "In-place swaps",
        explanation: `**Intuition.** The prefix before \`pos\` is fixed. Swapping each later value into \`pos\` explores every possible next element without a separate \`used\` array.

**Steps.**
1. Call DFS with a position \`pos\`.
2. For every index \`i >= pos\`, swap \`nums[i]\` into \`pos\`.
3. Recurse to \`pos + 1\`.
4. Swap back before the next choice.

**Correctness.** Each recursion level fixes one more position. Because every remaining index is swapped into that position exactly once, every ordering of the suffix is combined with every valid prefix exactly once.

**Pitfalls.** The swap-back step is required because the same array object is reused by sibling branches.`,
        time: "O(n! * n)",
        space: "O(n) recursion depth plus output",
        python: `class Solution:
    def permute(self, nums: List[int]) -> List[List[int]]:
        res = []
        def dfs(pos: int) -> None:
            if pos == len(nums):
                res.append(nums[:])
                return
            for i in range(pos, len(nums)):
                nums[pos], nums[i] = nums[i], nums[pos]
                dfs(pos + 1)
                nums[pos], nums[i] = nums[i], nums[pos]
        dfs(0)
        return res
`,
        cpp: `class Solution {
public:
    vector<vector<int>> permute(vector<int>& nums) {
        vector<vector<int>> res;
        function<void(int)> dfs = [&](int pos) {
            if (pos == (int)nums.size()) {
                res.push_back(nums);
                return;
            }
            for (int i = pos; i < (int)nums.size(); ++i) {
                swap(nums[pos], nums[i]);
                dfs(pos + 1);
                swap(nums[pos], nums[i]);
            }
        };
        dfs(0);
        return res;
    }
};`
      }
    ]
  },
  {
    id: "subsets-ii",
    title: "Subsets II",
    number: 90,
    difficulty: "Medium",
    category: "Backtracking",
    pattern: "Duplicate-Aware Subsets",
    description: "Implement `subsetsWithDup(nums)` when `nums` can contain repeated values. Return every distinct subset of values, with no duplicate subset rows. Output order is flexible.",
    examples: [
      {
        input: "nums = [1,2,2]",
        output: "[[1,2,2],[1,2],[1],[2,2],[2],[]]",
        explanation: "The subset `[2]` appears once even though `2` occurs twice."
      },
      {
        input: "nums = [0]",
        output: "[[0],[]]",
        explanation: "One element still produces the empty subset and itself."
      },
      {
        input: "nums = [4,4,4,1,4]",
        output: "[[1,4,4,4,4],[1,4,4,4],[1,4,4],[1,4],[1],[4,4,4,4],[4,4,4],[4,4],[4],[]]",
        explanation: "Many equal values are represented by choosing a count from zero to the available frequency."
      }
    ],
    constraints: ["`0 <= nums.length <= 10`","`-10 <= nums[i] <= 10`","The input may contain duplicates.","Return each distinct subset once."],
    hints: ["Sort the array so duplicate values form a block.","When excluding a value, skip the rest of its equal block.","Alternatively, extend only the subsets created in the previous round when the current value is a duplicate."],
    signature: {
      kind: "function",
      name: "subsetsWithDup",
      params: [
        {
          name: "nums",
          type: "int[]"
        }
      ],
      returns: "int[][]"
    },
    tests: [
      {
        args: [[1,2,2]],
        expected: [[1,2,2],[1,2],[1],[2,2],[2],[]]
      },
      {
        args: [[0]],
        expected: [[0],[]]
      },
      {
        args: [[4,4,4,1,4]],
        expected: [[1,4,4,4,4],[1,4,4,4],[1,4,4],[1,4],[1],[4,4,4,4],[4,4,4],[4,4],[4],[]]
      },
      {
        args: [[]],
        expected: [[]]
      },
      {
        args: [[1,1]],
        expected: [[1,1],[1],[]]
      },
      {
        args: [[1,2,2,2]],
        expected: [[1,2,2,2],[1,2,2],[1,2],[1],[2,2,2],[2,2],[2],[]]
      },
      {
        args: [[2,1,2]],
        expected: [[1,2,2],[1,2],[1],[2,2],[2],[]]
      },
      {
        args: [[-1,0,0,1]],
        expected: [[-1,0,0,1],[-1,0,0],[-1,0,1],[-1,0],[-1,1],[-1],[0,0,1],[0,0],[0,1],[0],[1],[]]
      }
    ],
    compare: "unorderedDeep",
    viz: "backtracking",
    solutions: [
      {
        title: "Choose or skip blocks",
        explanation: `**Intuition.** After sorting, a duplicate block can be handled by either taking the current copy or skipping all remaining equal copies.

**Steps.**
1. Sort \`nums\`.
2. DFS at index \`i\`.
3. First include \`nums[i]\` and move to \`i + 1\`.
4. Then exclude it by jumping to the first different value.

**Correctness.** Including steps enumerate subsets with at least one copy of a value; the skip jump enumerates subsets with no further copies from that duplicate block. Together they cover every possible count for each value exactly once.

**Pitfalls.** If the exclude branch only moves to \`i + 1\`, equal values create duplicate rows.`,
        time: "O(n * 2^n)",
        space: "O(n) recursion depth plus output",
        python: `class Solution:
    def subsetsWithDup(self, nums: List[int]) -> List[List[int]]:
        nums.sort()
        res, path = [], []
        def dfs(i: int) -> None:
            if i == len(nums):
                res.append(path[:])
                return
            path.append(nums[i])
            dfs(i + 1)
            path.pop()
            j = i + 1
            while j < len(nums) and nums[j] == nums[i]:
                j += 1
            dfs(j)
        dfs(0)
        return res
`,
        cpp: `class Solution {
public:
    vector<vector<int>> subsetsWithDup(vector<int>& nums) {
        sort(nums.begin(), nums.end());
        vector<vector<int>> res;
        vector<int> path;
        function<void(int)> dfs = [&](int i) {
            if (i == (int)nums.size()) {
                res.push_back(path);
                return;
            }
            path.push_back(nums[i]);
            dfs(i + 1);
            path.pop_back();
            int j = i + 1;
            while (j < (int)nums.size() && nums[j] == nums[i]) ++j;
            dfs(j);
        };
        dfs(0);
        return res;
    }
};`
      },
      {
        title: "Iterative duplicate window",
        explanation: `**Intuition.** When a value repeats, only subsets created during the previous value's round should receive the duplicate; older subsets already produced the lower counts.

**Steps.**
1. Sort \`nums\`.
2. Track \`start\`, the first subset to extend this round.
3. For a new value, extend all existing subsets; for a duplicate, extend only the previous round's new subsets.
4. Append the extended subsets.

**Correctness.** For each value block, the method successively creates subsets with one more copy than before. Restricting duplicate extensions to the newest layer prevents recreating the same count combination.

**Pitfalls.** Store the old answer length before appending; it becomes the boundary for the next duplicate.`,
        time: "O(n * 2^n)",
        space: "O(n * 2^n)",
        python: `class Solution:
    def subsetsWithDup(self, nums: List[int]) -> List[List[int]]:
        nums.sort()
        res = [[]]
        start = 0
        prev_end = 0
        for i, x in enumerate(nums):
            if i > 0 and nums[i] == nums[i - 1]:
                start = prev_end
            else:
                start = 0
            prev_end = len(res)
            for j in range(start, prev_end):
                res.append(res[j] + [x])
        return res
`,
        cpp: `class Solution {
public:
    vector<vector<int>> subsetsWithDup(vector<int>& nums) {
        sort(nums.begin(), nums.end());
        vector<vector<int>> res(1);
        int start = 0, prevEnd = 0;
        for (int i = 0; i < (int)nums.size(); ++i) {
            start = (i > 0 && nums[i] == nums[i - 1]) ? prevEnd : 0;
            prevEnd = res.size();
            for (int j = start; j < prevEnd; ++j) {
                auto cur = res[j];
                cur.push_back(nums[i]);
                res.push_back(cur);
            }
        }
        return res;
    }
};`
      }
    ]
  },
  {
    id: "word-search",
    title: "Word Search",
    number: 79,
    difficulty: "Medium",
    category: "Backtracking",
    pattern: "Grid Backtracking",
    description: "Implement `exist(board, word)`. Starting from any cell, decide whether the word can be formed by moving horizontally or vertically to adjacent cells. A cell may be used at most once in the same word path.",
    examples: [
      {
        input: "board = [[\"A\",\"B\",\"C\",\"E\"],[\"S\",\"F\",\"C\",\"S\"],[\"A\",\"D\",\"E\",\"E\"]], word = \"ABCCED\"",
        output: "true",
        explanation: "The path starts at `A` and winds through adjacent cells to spell the word."
      },
      {
        input: "board = [[\"A\",\"B\",\"C\",\"E\"],[\"S\",\"F\",\"C\",\"S\"],[\"A\",\"D\",\"E\",\"E\"]], word = \"SEE\"",
        output: "true",
        explanation: "The two `E` cells at the right can be reached without reusing a cell."
      },
      {
        input: "board = [[\"A\",\"B\",\"C\",\"E\"],[\"S\",\"F\",\"C\",\"S\"],[\"A\",\"D\",\"E\",\"E\"]], word = \"ABCB\"",
        output: "false",
        explanation: "The final `B` would require revisiting a cell, so the word is rejected."
      }
    ],
    constraints: ["`1 <= board.length, board[i].length <= 6` in these tests","`1 <= word.length <= board.length * board[0].length + 1`","Cells contain single-character strings.","Moves are four-directional; diagonals are not allowed."],
    hints: ["Try each cell as a possible first character.","During DFS, mark the current cell as unavailable before visiting neighbors.","Restore the cell after the recursive calls so other starting positions can use it."],
    signature: {
      kind: "function",
      name: "exist",
      params: [
        {
          name: "board",
          type: "char[][]"
        },
        {
          name: "word",
          type: "string"
        }
      ],
      returns: "bool"
    },
    tests: [
      {
        args: [
          [["A","B","C","E"],["S","F","C","S"],["A","D","E","E"]],
          "ABCCED"
        ],
        expected: true
      },
      {
        args: [
          [["A","B","C","E"],["S","F","C","S"],["A","D","E","E"]],
          "SEE"
        ],
        expected: true
      },
      {
        args: [
          [["A","B","C","E"],["S","F","C","S"],["A","D","E","E"]],
          "ABCB"
        ],
        expected: false
      },
      {
        args: [
          [["A"]],
          "A"
        ],
        expected: true
      },
      {
        args: [
          [["A"]],
          "B"
        ],
        expected: false
      },
      {
        args: [
          [["A","B"],["C","D"]],
          "ACDB"
        ],
        expected: true
      },
      {
        args: [
          [["C","A","A"],["A","A","A"],["B","C","D"]],
          "AAB"
        ],
        expected: true
      },
      {
        args: [
          [["A","A","A"],["A","A","A"],["A","A","A"]],
          "AAAAAAAAAA"
        ],
        expected: false
      }
    ],
    viz: "backtracking",
    solutions: [
      {
        title: "In-place DFS",
        explanation: `**Intuition.** The search path itself is the state. Temporarily marking a cell prevents reuse without allocating a separate visited matrix.

**Steps.**
1. Loop over every cell as a start.
2. If the cell matches \`word[i]\`, mark it and try four neighbors for \`i + 1\`.
3. Return true as soon as one branch consumes the whole word.
4. Restore the original character before leaving the call.

**Correctness.** A DFS branch exactly represents one simple path in the grid. It advances only through matching adjacent cells and marks used cells, so any success is a valid spelling. Every valid path is considered by starting at its first cell and choosing its subsequent neighbors.

**Pitfalls.** Restoring the character is mandatory; otherwise a failed branch corrupts later searches.`,
        time: "O(R * C * 4^L)",
        space: "O(L) recursion depth",
        python: `class Solution:
    def exist(self, board: List[List[str]], word: str) -> bool:
        rows, cols = len(board), len(board[0])
        if len(word) > rows * cols:
            return False
        def dfs(r: int, c: int, i: int) -> bool:
            if i == len(word):
                return True
            if r < 0 or c < 0 or r == rows or c == cols or board[r][c] != word[i]:
                return False
            ch = board[r][c]
            board[r][c] = '#'
            ok = (dfs(r + 1, c, i + 1) or dfs(r - 1, c, i + 1) or
                  dfs(r, c + 1, i + 1) or dfs(r, c - 1, i + 1))
            board[r][c] = ch
            return ok
        return any(dfs(r, c, 0) for r in range(rows) for c in range(cols))
`,
        cpp: `class Solution {
public:
    bool exist(vector<vector<char>>& board, string word) {
        int rows = board.size(), cols = board[0].size();
        if ((int)word.size() > rows * cols) return false;
        function<bool(int,int,int)> dfs = [&](int r, int c, int i) {
            if (i == (int)word.size()) return true;
            if (r < 0 || c < 0 || r == rows || c == cols || board[r][c] != word[i]) return false;
            char ch = board[r][c];
            board[r][c] = '#';
            bool ok = dfs(r + 1, c, i + 1) || dfs(r - 1, c, i + 1) || dfs(r, c + 1, i + 1) || dfs(r, c - 1, i + 1);
            board[r][c] = ch;
            return ok;
        };
        for (int r = 0; r < rows; ++r) {
            for (int c = 0; c < cols; ++c) {
                if (dfs(r, c, 0)) return true;
            }
        }
        return false;
    }
};`
      },
      {
        title: "Visited matrix with pruning",
        explanation: `**Intuition.** A frequency check can reject impossible words before search, and a visited matrix keeps the board unchanged.

**Steps.**
1. Count board letters and ensure the word does not ask for more of any letter.
2. Optionally reverse the word if its last character is rarer than its first.
3. DFS with a \`seen\` matrix instead of changing board cells.
4. Unmark the cell during backtracking.

**Correctness.** The frequency check only rejects words that cannot be formed by any path. The DFS then explores exactly the same set of simple matching paths as the in-place version, using \`seen\` to enforce no reuse.

**Pitfalls.** If you reverse the word, you are still checking existence of a path because paths can be traversed in either direction.`,
        time: "O(R * C * 4^L)",
        space: "O(R * C + L)",
        python: `class Solution:
    def exist(self, board: List[List[str]], word: str) -> bool:
        rows, cols = len(board), len(board[0])
        if len(word) > rows * cols:
            return False
        have = Counter(ch for row in board for ch in row)
        need = Counter(word)
        if any(need[ch] > have[ch] for ch in need):
            return False
        if have[word[-1]] < have[word[0]]:
            word = word[::-1]
        seen = [[False] * cols for _ in range(rows)]
        def dfs(r: int, c: int, i: int) -> bool:
            if i == len(word):
                return True
            if r < 0 or c < 0 or r == rows or c == cols or seen[r][c] or board[r][c] != word[i]:
                return False
            seen[r][c] = True
            ok = any(dfs(r + dr, c + dc, i + 1) for dr, dc in ((1,0),(-1,0),(0,1),(0,-1)))
            seen[r][c] = False
            return ok
        return any(dfs(r, c, 0) for r in range(rows) for c in range(cols))
`,
        cpp: `class Solution {
public:
    bool exist(vector<vector<char>>& board, string word) {
        int rows = board.size(), cols = board[0].size();
        if ((int)word.size() > rows * cols) return false;
        vector<int> have(256), need(256);
        for (auto& row : board) for (char ch : row) have[(unsigned char)ch]++;
        for (char ch : word) need[(unsigned char)ch]++;
        for (int i = 0; i < 256; ++i) if (need[i] > have[i]) return false;
        if (have[(unsigned char)word.back()] < have[(unsigned char)word.front()]) reverse(word.begin(), word.end());
        vector<vector<int>> seen(rows, vector<int>(cols));
        function<bool(int,int,int)> dfs = [&](int r, int c, int i) {
            if (i == (int)word.size()) return true;
            if (r < 0 || c < 0 || r == rows || c == cols || seen[r][c] || board[r][c] != word[i]) return false;
            seen[r][c] = 1;
            bool ok = dfs(r + 1, c, i + 1) || dfs(r - 1, c, i + 1) || dfs(r, c + 1, i + 1) || dfs(r, c - 1, i + 1);
            seen[r][c] = 0;
            return ok;
        };
        for (int r = 0; r < rows; ++r) for (int c = 0; c < cols; ++c) if (dfs(r, c, 0)) return true;
        return false;
    }
};`
      }
    ]
  },
  {
    id: "palindrome-partitioning",
    title: "Palindrome Partitioning",
    number: 131,
    difficulty: "Medium",
    category: "Backtracking",
    pattern: "Partition Backtracking",
    description: "Implement `partition(s)`. Split the string into substrings so that every piece is a palindrome, and return every valid split. The list of partitions may be returned in any order, but the substring order inside each partition must follow the original string.",
    examples: [
      {
        input: "s = \"aab\"",
        output: "[[\"a\",\"a\",\"b\"],[\"aa\",\"b\"]]",
        explanation: "The prefix can be split as two single letters or the palindrome `aa`."
      },
      {
        input: "s = \"a\"",
        output: "[[\"a\"]]",
        explanation: "A one-character string is already palindromic."
      },
      {
        input: "s = \"efe\"",
        output: "[[\"e\",\"f\",\"e\"],[\"efe\"]]",
        explanation: "The whole string and all-single-character split are both valid."
      }
    ],
    constraints: ["`1 <= s.length <= 16` in these tests","`s` contains lowercase English letters.","Every returned partition must concatenate back to `s`.","Only palindromic pieces are allowed."],
    hints: ["Choose the next cut position after the current index.","Only recurse when `s[start:end]` is a palindrome.","Precomputing palindrome intervals avoids checking the same substring many times."],
    signature: {
      kind: "function",
      name: "partition",
      params: [
        {
          name: "s",
          type: "string"
        }
      ],
      returns: "string[][]"
    },
    tests: [
      {
        args: ["aab"],
        expected: [["a","a","b"],["aa","b"]]
      },
      {
        args: ["a"],
        expected: [["a"]]
      },
      {
        args: ["efe"],
        expected: [["e","f","e"],["efe"]]
      },
      {
        args: ["abba"],
        expected: [["a","b","b","a"],["a","bb","a"],["abba"]]
      },
      {
        args: ["banana"],
        expected: [["b","a","n","a","n","a"],["b","a","n","ana"],["b","a","nan","a"],["b","ana","n","a"],["b","anana"]]
      },
      {
        args: ["aaa"],
        expected: [["a","a","a"],["a","aa"],["aa","a"],["aaa"]]
      },
      {
        args: ["abc"],
        expected: [["a","b","c"]]
      },
      {
        args: ["racecar"],
        expected: [["r","a","c","e","c","a","r"],["r","a","cec","a","r"],["r","aceca","r"],["racecar"]]
      }
    ],
    compare: "unordered",
    viz: "backtracking",
    solutions: [
      {
        title: "DFS with direct checks",
        explanation: `**Intuition.** The next decision is the first substring of the remaining suffix. Try every palindromic prefix.

**Steps.**
1. Start DFS at index \`0\` with an empty path.
2. For each end position, test whether \`s[start:end]\` is a palindrome.
3. Append palindromic pieces and recurse from \`end\`.
4. At the end of the string, copy the path.

**Correctness.** Every recursive path selects adjacent substrings that cover a prefix of \`s\`; it is copied only after covering all of \`s\`. Since recursion only follows palindromic pieces, outputs are valid. Every valid partition has a first piece considered by the loop, then is generated recursively.

**Pitfalls.** Slicing is convenient but repeated palindrome checks add overhead; keep constraints moderate or precompute.`,
        time: "O(n * 2^n)",
        space: "O(n) recursion depth plus output",
        python: `class Solution:
    def partition(self, s: str) -> List[List[str]]:
        res, path = [], []
        def is_pal(lo: int, hi: int) -> bool:
            while lo < hi:
                if s[lo] != s[hi]:
                    return False
                lo += 1
                hi -= 1
            return True
        def dfs(start: int) -> None:
            if start == len(s):
                res.append(path[:])
                return
            for end in range(start, len(s)):
                if is_pal(start, end):
                    path.append(s[start:end + 1])
                    dfs(end + 1)
                    path.pop()
        dfs(0)
        return res
`,
        cpp: `class Solution {
public:
    vector<vector<string>> partition(string s) {
        vector<vector<string>> res;
        vector<string> path;
        auto isPal = [&](int lo, int hi) {
            while (lo < hi) if (s[lo++] != s[hi--]) return false;
            return true;
        };
        function<void(int)> dfs = [&](int start) {
            if (start == (int)s.size()) {
                res.push_back(path);
                return;
            }
            for (int end = start; end < (int)s.size(); ++end) {
                if (isPal(start, end)) {
                    path.push_back(s.substr(start, end - start + 1));
                    dfs(end + 1);
                    path.pop_back();
                }
            }
        };
        dfs(0);
        return res;
    }
};`
      },
      {
        title: "Precomputed palindrome table",
        explanation: `**Intuition.** A dynamic-programming table answers each \`is palindrome\` query in constant time during backtracking.

**Steps.**
1. Fill \`pal[i][j]\` from short substrings to long ones.
2. Use the same DFS over cut positions.
3. Only recurse when \`pal[start][end]\` is true.
4. Copy the path at the end.

**Correctness.** The table recurrence marks \`s[i:j]\` palindromic exactly when endpoints match and the inside is palindromic. Therefore the DFS follows exactly valid palindromic cuts and, as before, enumerates all partitions.

**Pitfalls.** Fill the table with \`i\` decreasing or by length so \`pal[i+1][j-1]\` is already known.`,
        time: "O(n^2 + n * 2^n)",
        space: "O(n^2) plus recursion and output",
        python: `class Solution:
    def partition(self, s: str) -> List[List[str]]:
        n = len(s)
        pal = [[False] * n for _ in range(n)]
        for i in range(n - 1, -1, -1):
            for j in range(i, n):
                pal[i][j] = s[i] == s[j] and (j - i < 2 or pal[i + 1][j - 1])
        res, path = [], []
        def dfs(start: int) -> None:
            if start == n:
                res.append(path[:])
                return
            for end in range(start, n):
                if pal[start][end]:
                    path.append(s[start:end + 1])
                    dfs(end + 1)
                    path.pop()
        dfs(0)
        return res
`,
        cpp: `class Solution {
public:
    vector<vector<string>> partition(string s) {
        int n = s.size();
        vector<vector<int>> pal(n, vector<int>(n));
        for (int i = n - 1; i >= 0; --i) {
            for (int j = i; j < n; ++j) {
                pal[i][j] = s[i] == s[j] && (j - i < 2 || pal[i + 1][j - 1]);
            }
        }
        vector<vector<string>> res;
        vector<string> path;
        function<void(int)> dfs = [&](int start) {
            if (start == n) {
                res.push_back(path);
                return;
            }
            for (int end = start; end < n; ++end) {
                if (pal[start][end]) {
                    path.push_back(s.substr(start, end - start + 1));
                    dfs(end + 1);
                    path.pop_back();
                }
            }
        };
        dfs(0);
        return res;
    }
};`
      }
    ]
  },
  {
    id: "letter-combinations-of-a-phone-number",
    title: "Letter Combinations of a Phone Number",
    number: 17,
    difficulty: "Medium",
    category: "Backtracking",
    pattern: "Cartesian Product Backtracking",
    description: "Implement `letterCombinations(digits)`. Each digit from `2` through `9` maps to letters on a phone keypad. Return every string made by choosing one mapped letter per digit, in any order.",
    examples: [
      {
        input: "digits = \"23\"",
        output: "[\"ad\",\"ae\",\"af\",\"bd\",\"be\",\"bf\",\"cd\",\"ce\",\"cf\"]",
        explanation: "Choose one of `abc` and one of `def`."
      },
      {
        input: "digits = \"\"",
        output: "[]",
        explanation: "No digits means there are no combinations to return."
      },
      {
        input: "digits = \"2\"",
        output: "[\"a\",\"b\",\"c\"]",
        explanation: "A single digit expands to its mapped letters."
      }
    ],
    constraints: ["`0 <= digits.length <= 4`","Each character is one of `'2'` through `'9'`.","Return strings of length `digits.length`.","The outer ordering of strings is not important."],
    hints: ["This is a Cartesian product across digit letter groups.","Keep a character path whose length equals the current digit index.","When the path reaches the number of digits, join it into one string."],
    signature: {
      kind: "function",
      name: "letterCombinations",
      params: [
        {
          name: "digits",
          type: "string"
        }
      ],
      returns: "string[]"
    },
    tests: [
      {
        args: ["23"],
        expected: ["ad","ae","af","bd","be","bf","cd","ce","cf"]
      },
      {
        args: [""],
        expected: []
      },
      {
        args: ["2"],
        expected: ["a","b","c"]
      },
      {
        args: ["7"],
        expected: ["p","q","r","s"]
      },
      {
        args: ["79"],
        expected: ["pw","px","py","pz","qw","qx","qy","qz","rw","rx","ry","rz","sw","sx","sy","sz"]
      },
      {
        args: ["234"],
        expected: ["adg","adh","adi","aeg","aeh","aei","afg","afh","afi","bdg","bdh","bdi","beg","beh","bei","bfg","bfh","bfi","cdg","cdh","cdi","ceg","ceh","cei","cfg","cfh","cfi"]
      },
      {
        args: ["9"],
        expected: ["w","x","y","z"]
      },
      {
        args: ["56"],
        expected: ["jm","jn","jo","km","kn","ko","lm","ln","lo"]
      }
    ],
    compare: "unordered",
    viz: "backtracking",
    solutions: [
      {
        title: "Backtracking product",
        explanation: `**Intuition.** For each digit position, branch over the letters attached to that digit.

**Steps.**
1. Return an empty list for an empty input.
2. DFS on index \`i\` into \`digits\`.
3. Append each possible letter, recurse to \`i + 1\`, then pop it.
4. Join the full path into the answer.

**Correctness.** A root-to-leaf path chooses exactly one letter for each digit, so every output is valid. Every valid combination has a first letter from the first digit and is then generated by the recursive subtree for the remaining digits.

**Pitfalls.** Do not return \`[]\` for empty input; the expected answer is an empty list.`,
        time: "O(4^n * n)",
        space: "O(n) recursion depth plus output",
        python: `class Solution:
    def letterCombinations(self, digits: str) -> List[str]:
        if not digits:
            return []
        phone = {
            '2': 'abc', '3': 'def', '4': 'ghi', '5': 'jkl',
            '6': 'mno', '7': 'pqrs', '8': 'tuv', '9': 'wxyz'
        }
        res, path = [], []
        def dfs(i: int) -> None:
            if i == len(digits):
                res.append(''.join(path))
                return
            for ch in phone[digits[i]]:
                path.append(ch)
                dfs(i + 1)
                path.pop()
        dfs(0)
        return res
`,
        cpp: `class Solution {
public:
    vector<string> letterCombinations(string digits) {
        if (digits.empty()) return {};
        vector<string> phone = {"", "", "abc", "def", "ghi", "jkl", "mno", "pqrs", "tuv", "wxyz"};
        vector<string> res;
        string path;
        function<void(int)> dfs = [&](int i) {
            if (i == (int)digits.size()) {
                res.push_back(path);
                return;
            }
            for (char ch : phone[digits[i] - '0']) {
                path.push_back(ch);
                dfs(i + 1);
                path.pop_back();
            }
        };
        dfs(0);
        return res;
    }
};`
      },
      {
        title: "Iterative expansion",
        explanation: `**Intuition.** Maintain all partial strings built so far and append every possible letter for the next digit.

**Steps.**
1. Start with one empty prefix.
2. For each digit, create a fresh list of extended prefixes.
3. Replace the old list with the extended list.
4. Special-case empty input to return \`[]\`.

**Correctness.** After processing \`k\` digits, the list contains exactly all strings formed by those \`k\` digits. Extending each with every letter of digit \`k + 1\` produces exactly all strings for the longer prefix.

**Pitfalls.** Create a new list per digit; appending to the list you are iterating can duplicate work indefinitely.`,
        time: "O(4^n * n)",
        space: "O(4^n * n)",
        python: `class Solution:
    def letterCombinations(self, digits: str) -> List[str]:
        if not digits:
            return []
        phone = {'2':'abc','3':'def','4':'ghi','5':'jkl','6':'mno','7':'pqrs','8':'tuv','9':'wxyz'}
        res = ['']
        for d in digits:
            res = [prefix + ch for prefix in res for ch in phone[d]]
        return res
`,
        cpp: `class Solution {
public:
    vector<string> letterCombinations(string digits) {
        if (digits.empty()) return {};
        vector<string> phone = {"", "", "abc", "def", "ghi", "jkl", "mno", "pqrs", "tuv", "wxyz"};
        vector<string> res{ "" };
        for (char d : digits) {
            vector<string> next;
            for (const string& prefix : res) {
                for (char ch : phone[d - '0']) next.push_back(prefix + ch);
            }
            res.swap(next);
        }
        return res;
    }
};`
      }
    ]
  },
  {
    id: "n-queens",
    title: "N-Queens",
    number: 51,
    difficulty: "Hard",
    category: "Backtracking",
    pattern: "Constraint Backtracking",
    description: "Implement `solveNQueens(n)`. Place `n` queens on an `n x n` board so that no two queens share a row, column, or diagonal. Return every valid board, where each row string contains `Q` for a queen and `.` for an empty square.",
    examples: [
      {
        input: "n = 4",
        output: "[[\".Q..\",\"...Q\",\"Q...\",\"..Q.\"],[\"..Q.\",\"Q...\",\"...Q\",\".Q..\"]]",
        explanation: "There are two symmetric solutions for a four-by-four board."
      },
      {
        input: "n = 1",
        output: "[[\"Q\"]]",
        explanation: "One queen fits on the only square."
      },
      {
        input: "n = 2",
        output: "[]",
        explanation: "A two-by-two board cannot place two non-attacking queens."
      }
    ],
    constraints: ["`1 <= n <= 9` for the intended problem","Tests keep `n <= 6` to keep output readable.","Each returned board has exactly `n` row strings of length `n`.","Board order is not important."],
    hints: ["Place queens row by row so rows never conflict.","A square is blocked if its column, `row - col`, or `row + col` diagonal is already occupied.","Use sets or bit masks to check conflicts in constant time."],
    signature: {
      kind: "function",
      name: "solveNQueens",
      params: [
        {
          name: "n",
          type: "int"
        }
      ],
      returns: "string[][]"
    },
    tests: [
      {
        args: [4],
        expected: [[".Q..","...Q","Q...","..Q."],["..Q.","Q...","...Q",".Q.."]]
      },
      {
        args: [1],
        expected: [["Q"]]
      },
      {
        args: [2],
        expected: []
      },
      {
        args: [3],
        expected: []
      },
      {
        args: [5],
        expected: [["Q....","..Q..","....Q",".Q...","...Q."],["Q....","...Q.",".Q...","....Q","..Q.."],[".Q...","...Q.","Q....","..Q..","....Q"],[".Q...","....Q","..Q..","Q....","...Q."],["..Q..","Q....","...Q.",".Q...","....Q"],["..Q..","....Q",".Q...","...Q.","Q...."],["...Q.","Q....","..Q..","....Q",".Q..."],["...Q.",".Q...","....Q","..Q..","Q...."],["....Q",".Q...","...Q.","Q....","..Q.."],["....Q","..Q..","Q....","...Q.",".Q..."]]
      },
      {
        args: [6],
        expected: [[".Q....","...Q..",".....Q","Q.....","..Q...","....Q."],["..Q...",".....Q",".Q....","....Q.","Q.....","...Q.."],["...Q..","Q.....","....Q.",".Q....",".....Q","..Q..."],["....Q.","..Q...","Q.....",".....Q","...Q..",".Q...."]]
      },
      {
        args: [4],
        expected: [[".Q..","...Q","Q...","..Q."],["..Q.","Q...","...Q",".Q.."]]
      },
      {
        args: [5],
        expected: [["Q....","..Q..","....Q",".Q...","...Q."],["Q....","...Q.",".Q...","....Q","..Q.."],[".Q...","...Q.","Q....","..Q..","....Q"],[".Q...","....Q","..Q..","Q....","...Q."],["..Q..","Q....","...Q.",".Q...","....Q"],["..Q..","....Q",".Q...","...Q.","Q...."],["...Q.","Q....","..Q..","....Q",".Q..."],["...Q.",".Q...","....Q","..Q..","Q...."],["....Q",".Q...","...Q.","Q....","..Q.."],["....Q","..Q..","Q....","...Q.",".Q..."]]
      }
    ],
    compare: "unordered",
    viz: "backtracking",
    solutions: [
      {
        title: "Sets for attacked lines",
        explanation: `**Intuition.** Because one queen is placed per row, only columns and two diagonal families need tracking.

**Steps.**
1. Maintain sets for used columns, down-diagonals \`r - c\`, and up-diagonals \`r + c\`.
2. At row \`r\`, try every column that is not in those sets.
3. Append the row string and recurse to row \`r + 1\`.
4. When \`r == n\`, copy the board.

**Correctness.** The sets reject exactly the squares attacked by earlier rows. Every emitted board has one queen per row and no shared column or diagonal. Any valid board can be followed row by row because its queen is never rejected by previously placed non-attacking queens.

**Pitfalls.** Remember to remove a queen's column and diagonals when backtracking to a sibling column.`,
        time: "O(n!) upper bound",
        space: "O(n) state plus output",
        python: `class Solution:
    def solveNQueens(self, n: int) -> List[List[str]]:
        res, board = [], []
        cols, diag1, diag2 = set(), set(), set()
        def dfs(r: int) -> None:
            if r == n:
                res.append(board[:])
                return
            for c in range(n):
                if c in cols or r - c in diag1 or r + c in diag2:
                    continue
                cols.add(c); diag1.add(r - c); diag2.add(r + c)
                board.append('.' * c + 'Q' + '.' * (n - c - 1))
                dfs(r + 1)
                board.pop()
                cols.remove(c); diag1.remove(r - c); diag2.remove(r + c)
        dfs(0)
        return res
`,
        cpp: `class Solution {
public:
    vector<vector<string>> solveNQueens(int n) {
        vector<vector<string>> res;
        vector<string> board;
        unordered_set<int> cols, diag1, diag2;
        function<void(int)> dfs = [&](int r) {
            if (r == n) {
                res.push_back(board);
                return;
            }
            for (int c = 0; c < n; ++c) {
                if (cols.count(c) || diag1.count(r - c) || diag2.count(r + c)) continue;
                cols.insert(c); diag1.insert(r - c); diag2.insert(r + c);
                board.push_back(string(c, '.') + 'Q' + string(n - c - 1, '.'));
                dfs(r + 1);
                board.pop_back();
                cols.erase(c); diag1.erase(r - c); diag2.erase(r + c);
            }
        };
        dfs(0);
        return res;
    }
};`
      },
      {
        title: "Bit-mask search",
        explanation: `**Intuition.** Columns and diagonals can be bit masks. Available positions in a row are the zero bits after combining the three attack masks.

**Steps.**
1. Let \`full\` have the lowest \`n\` bits set.
2. DFS with masks for occupied columns and shifted diagonals.
3. Compute \`available = full & ~(cols | diag1 | diag2)\`.
4. Take one low bit at a time, place the queen, and recurse with shifted diagonal masks.

**Correctness.** The mask formula marks exactly unattacked columns for the current row. Shifting diagonals models how attacks move one column left or right on the next row, so each recursive placement preserves the non-attacking invariant and explores all valid column choices.

**Pitfalls.** Convert the chosen bit back to a column index to build the output row string.`,
        time: "O(n!) upper bound",
        space: "O(n) recursion depth plus output",
        python: `class Solution:
    def solveNQueens(self, n: int) -> List[List[str]]:
        res, board = [], []
        full = (1 << n) - 1
        def dfs(cols: int, diag1: int, diag2: int) -> None:
            r = len(board)
            if r == n:
                res.append(board[:])
                return
            available = full & ~(cols | diag1 | diag2)
            while available:
                bit = available & -available
                available -= bit
                c = bit.bit_length() - 1
                board.append('.' * c + 'Q' + '.' * (n - c - 1))
                dfs(cols | bit, (diag1 | bit) << 1, (diag2 | bit) >> 1)
                board.pop()
        dfs(0, 0, 0)
        return res
`,
        cpp: `class Solution {
public:
    vector<vector<string>> solveNQueens(int n) {
        vector<vector<string>> res;
        vector<string> board;
        int full = (1 << n) - 1;
        function<void(int,int,int)> dfs = [&](int cols, int diag1, int diag2) {
            int r = board.size();
            if (r == n) {
                res.push_back(board);
                return;
            }
            int available = full & ~(cols | diag1 | diag2);
            while (available) {
                int bit = available & -available;
                available -= bit;
                int c = __builtin_ctz(bit);
                board.push_back(string(c, '.') + 'Q' + string(n - c - 1, '.'));
                dfs(cols | bit, (diag1 | bit) << 1, (diag2 | bit) >> 1);
                board.pop_back();
            }
        };
        dfs(0, 0, 0);
        return res;
    }
};`
      }
    ]
  }
]

export default problems
