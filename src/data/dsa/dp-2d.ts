import type { DsaProblem } from '../../types/content'

const problems: DsaProblem[] = [
  {
    id: `unique-paths`,
    title: `Unique Paths`,
    number: 62,
    difficulty: `Medium`,
    category: `2-D Dynamic Programming`,
    pattern: `Grid DP`,
    description: `A robot starts in the top-left cell of an \`m x n\` grid and wants to reach the bottom-right cell. It may only move one cell down or one cell right.

Return the number of different move sequences that reach the destination.`,
    constraints: [`\`1 <= m, n <= 100\``, `The answer fits in a signed 32-bit integer.`, `Only moves to the right or downward are allowed.`],
    hints: [`Think about the last move into any cell.`, `The number of paths to a cell is the sum of the paths to the cell above it and to its left.`, `Fill a DP table from the start, or compute the same recurrence recursively with memoization.`],
    signature: {
      kind: `function`,
      name: `uniquePaths`,
      params: [
        {
          name: `m`,
          type: `int`
        },
        {
          name: `n`,
          type: `int`
        }
      ],
      returns: `int`
    },
    viz: `dp-grid`,
    solutions: [
      {
        title: `Top-down memoized recursion`,
        explanation: `**Intuition.** From cell \`(r, c)\`, every valid path first moves either down or right. Let \`dp(r, c)\` be the number of paths from that cell to the finish.

**Recurrence and bases.** \`dp(m - 1, n - 1) = 1\`, positions outside the grid contribute \`0\`, and otherwise \`dp(r, c) = dp(r + 1, c) + dp(r, c + 1)\`.

**Steps.**
1. Start a DFS at \`(0, 0)\`.
2. Memoize each cell so it is solved once.
3. Return the sum of the two allowed next states.

This is correct because the first move partitions all possible paths into two disjoint groups: those that go down and those that go right. A common pitfall is forgetting that the destination itself counts as one completed path.`,
        time: `O(m * n)`,
        space: `O(m * n)`,
        python: `class Solution:
    def uniquePaths(self, m: int, n: int) -> int:
        @lru_cache(None)
        def dp(r: int, c: int) -> int:
            if r == m - 1 and c == n - 1:
                return 1
            if r >= m or c >= n:
                return 0
            return dp(r + 1, c) + dp(r, c + 1)
        return dp(0, 0)
`,
        cpp: `class Solution {
public:
    int uniquePaths(int m, int n) {
        vector<vector<int>> memo(m, vector<int>(n, -1));
        function<int(int, int)> dp = [&](int r, int c) -> int {
            if (r == m - 1 && c == n - 1) return 1;
            if (r >= m || c >= n) return 0;
            int& ans = memo[r][c];
            if (ans != -1) return ans;
            ans = dp(r + 1, c) + dp(r, c + 1);
            return ans;
        };
        return dp(0, 0);
    }
};`
      },
      {
        title: `Bottom-up grid tabulation`,
        explanation: `**Intuition.** Instead of asking how many paths remain from a cell, count how many ways reach each cell from the start.

**State.** \`dp[r][c]\` is the number of paths that end at \`(r, c)\`. The first row and first column are all \`1\` because only one straight-line route can reach them.

**Steps.**
1. Initialize an \`m x n\` table.
2. Fill row by row with \`dp[r][c] = dp[r - 1][c] + dp[r][c - 1]\`.
3. Return the bottom-right value.

The recurrence is correct because any path entering \`(r, c)\` must come from exactly one of those two predecessor cells.`,
        time: `O(m * n)`,
        space: `O(m * n)`,
        python: `class Solution:
    def uniquePaths(self, m: int, n: int) -> int:
        dp = [[1] * n for _ in range(m)]
        for r in range(1, m):
            for c in range(1, n):
                dp[r][c] = dp[r - 1][c] + dp[r][c - 1]
        return dp[-1][-1]
`,
        cpp: `class Solution {
public:
    int uniquePaths(int m, int n) {
        vector<vector<int>> dp(m, vector<int>(n, 1));
        for (int r = 1; r < m; ++r) {
            for (int c = 1; c < n; ++c) {
                dp[r][c] = dp[r - 1][c] + dp[r][c - 1];
            }
        }
        return dp[m - 1][n - 1];
    }
};`
      },
      {
        title: `Space-optimized tabulation`,
        explanation: `**Intuition.** The grid recurrence only needs the current row and the row above. A one-dimensional array can store both: \`dp[c]\` is the value from the previous row until it is updated.

**Steps.**
1. Start with a row of ones.
2. For each later row, sweep left to right.
3. Update \`dp[c] += dp[c - 1]\`, combining paths from above and left.

The update order is the key pitfall: left-to-right is required so \`dp[c - 1]\` already represents the current row.`,
        time: `O(m * n)`,
        space: `O(n)`,
        python: `class Solution:
    def uniquePaths(self, m: int, n: int) -> int:
        dp = [1] * n
        for _ in range(1, m):
            for c in range(1, n):
                dp[c] += dp[c - 1]
        return dp[-1]
`,
        cpp: `class Solution {
public:
    int uniquePaths(int m, int n) {
        vector<int> dp(n, 1);
        for (int r = 1; r < m; ++r) {
            for (int c = 1; c < n; ++c) dp[c] += dp[c - 1];
        }
        return dp.back();
    }
};`
      }
    ],
    examples: [
      {
        input: `m = 3, n = 7`,
        output: `28`,
        explanation: `There are 28 ways to arrange two down moves among eight total moves.`
      },
      {
        input: `m = 3, n = 2`,
        output: `3`,
        explanation: `The robot must make two down moves and one right move.`
      },
      {
        input: `m = 1, n = 1`,
        output: `1`,
        explanation: `The start cell is already the destination.`
      }
    ],
    tests: [
      {
        args: [3, 7],
        expected: 28
      },
      {
        args: [3, 2],
        expected: 3
      },
      {
        args: [1, 1],
        expected: 1
      },
      {
        args: [1, 10],
        expected: 1
      },
      {
        args: [10, 1],
        expected: 1
      },
      {
        args: [2, 2],
        expected: 2
      },
      {
        args: [5, 5],
        expected: 70
      },
      {
        args: [10, 10],
        expected: 48620
      }
    ]
  },
  {
    id: `longest-common-subsequence`,
    title: `Longest Common Subsequence`,
    number: 1143,
    difficulty: `Medium`,
    category: `2-D Dynamic Programming`,
    pattern: `Sequence DP`,
    description: `Given two strings, find the length of the longest sequence of characters that appears in both strings in the same relative order. The characters do not need to be adjacent.

Return only the length of that best common subsequence.`,
    constraints: [`\`0 <= text1.length, text2.length <= 1000\``, `Strings contain lowercase English letters in the original problem; boundary tests may include an empty string.`, `The answer is between \`0\` and \`min(text1.length, text2.length)\`.`],
    hints: [`Compare suffixes, not individual characters in isolation.`, `If the current characters match, using them is always safe for one optimal subsequence.`, `Otherwise, skip one current character from either string and keep the better result.`],
    signature: {
      kind: `function`,
      name: `longestCommonSubsequence`,
      params: [
        {
          name: `text1`,
          type: `string`
        },
        {
          name: `text2`,
          type: `string`
        }
      ],
      returns: `int`
    },
    viz: `dp-grid`,
    solutions: [
      {
        title: `Top-down suffix DP`,
        explanation: `**Intuition.** Let \`dp(i, j)\` be the LCS length of \`text1[i:]\` and \`text2[j:]\`. The first unresolved characters decide the next move.

**Recurrence and bases.** If either suffix is empty, the answer is \`0\`. If \`text1[i] == text2[j]\`, take that character and add \`1 + dp(i + 1, j + 1)\`. Otherwise try skipping one character from either string and take the maximum.

**Why correct.** Any common subsequence either uses the matching first characters or it does not. When they differ, no valid subsequence can use both first characters together, so one of them must be skipped.`,
        time: `O(m * n)`,
        space: `O(m * n)`,
        python: `class Solution:
    def longestCommonSubsequence(self, text1: str, text2: str) -> int:
        @lru_cache(None)
        def dp(i: int, j: int) -> int:
            if i == len(text1) or j == len(text2):
                return 0
            if text1[i] == text2[j]:
                return 1 + dp(i + 1, j + 1)
            return max(dp(i + 1, j), dp(i, j + 1))
        return dp(0, 0)
`,
        cpp: `class Solution {
public:
    int longestCommonSubsequence(string text1, string text2) {
        int m = text1.size(), n = text2.size();
        vector<vector<int>> memo(m, vector<int>(n, -1));
        function<int(int, int)> dp = [&](int i, int j) -> int {
            if (i == m || j == n) return 0;
            int& ans = memo[i][j];
            if (ans != -1) return ans;
            if (text1[i] == text2[j]) ans = 1 + dp(i + 1, j + 1);
            else ans = max(dp(i + 1, j), dp(i, j + 1));
            return ans;
        };
        return dp(0, 0);
    }
};`
      },
      {
        title: `Bottom-up table`,
        explanation: `**State.** \`dp[i][j]\` stores the LCS length for suffixes starting at \`i\` and \`j\`.

**Steps.**
1. Create a \`(m + 1) x (n + 1)\` table of zeros for empty suffixes.
2. Fill from bottom-right toward top-left.
3. Apply the same match/skip recurrence as the recursive solution.

The fill order guarantees every referenced future suffix has already been computed. Avoid filling forward unless you redefine the state as prefixes.`,
        time: `O(m * n)`,
        space: `O(m * n)`,
        python: `class Solution:
    def longestCommonSubsequence(self, text1: str, text2: str) -> int:
        m, n = len(text1), len(text2)
        dp = [[0] * (n + 1) for _ in range(m + 1)]
        for i in range(m - 1, -1, -1):
            for j in range(n - 1, -1, -1):
                if text1[i] == text2[j]:
                    dp[i][j] = 1 + dp[i + 1][j + 1]
                else:
                    dp[i][j] = max(dp[i + 1][j], dp[i][j + 1])
        return dp[0][0]
`,
        cpp: `class Solution {
public:
    int longestCommonSubsequence(string text1, string text2) {
        int m = text1.size(), n = text2.size();
        vector<vector<int>> dp(m + 1, vector<int>(n + 1));
        for (int i = m - 1; i >= 0; --i) {
            for (int j = n - 1; j >= 0; --j) {
                if (text1[i] == text2[j]) dp[i][j] = 1 + dp[i + 1][j + 1];
                else dp[i][j] = max(dp[i + 1][j], dp[i][j + 1]);
            }
        }
        return dp[0][0];
    }
};`
      },
      {
        title: `One-row tabulation`,
        explanation: `**Intuition.** While filling one row, the only older values needed are the row below and the diagonal from the row below.

**Steps.**
1. Keep one array for the row below.
2. Sweep \`j\` from right to left so \`dp[j + 1]\` is the current row value.
3. Store the old diagonal before overwriting \`dp[j]\`.

The diagonal bookkeeping is the main pitfall; without it, the match case may accidentally use an already-updated value.`,
        time: `O(m * n)`,
        space: `O(n)`,
        python: `class Solution:
    def longestCommonSubsequence(self, text1: str, text2: str) -> int:
        n = len(text2)
        dp = [0] * (n + 1)
        for i in range(len(text1) - 1, -1, -1):
            diag = 0
            for j in range(n - 1, -1, -1):
                old = dp[j]
                if text1[i] == text2[j]:
                    dp[j] = 1 + diag
                else:
                    dp[j] = max(dp[j], dp[j + 1])
                diag = old
        return dp[0]
`,
        cpp: `class Solution {
public:
    int longestCommonSubsequence(string text1, string text2) {
        int n = text2.size();
        vector<int> dp(n + 1);
        for (int i = (int)text1.size() - 1; i >= 0; --i) {
            int diag = 0;
            for (int j = n - 1; j >= 0; --j) {
                int old = dp[j];
                if (text1[i] == text2[j]) dp[j] = 1 + diag;
                else dp[j] = max(dp[j], dp[j + 1]);
                diag = old;
            }
        }
        return dp[0];
    }
};`
      }
    ],
    examples: [
      {
        input: `text1 = "abcde", text2 = "ace"`,
        output: `3`,
        explanation: `The subsequence \`ace\` appears in both strings.`
      },
      {
        input: `text1 = "abc", text2 = "abc"`,
        output: `3`,
        explanation: `The whole string is common.`
      },
      {
        input: `text1 = "abc", text2 = "def"`,
        output: `0`,
        explanation: `No character can be shared in order.`
      }
    ],
    tests: [
      {
        args: [`abcde`, `ace`],
        expected: 3
      },
      {
        args: [`abc`, `abc`],
        expected: 3
      },
      {
        args: [`abc`, `def`],
        expected: 0
      },
      {
        args: [``, `abc`],
        expected: 0
      },
      {
        args: [`abc`, ``],
        expected: 0
      },
      {
        args: [`abcba`, `abcbcba`],
        expected: 5
      },
      {
        args: [`bsbininm`, `jmjkbkjkv`],
        expected: 1
      },
      {
        args: [`aaaa`, `aa`],
        expected: 2
      }
    ]
  },
  {
    id: `best-time-to-buy-and-sell-stock-with-cooldown`,
    title: `Best Time to Buy and Sell Stock with Cooldown`,
    number: 309,
    difficulty: `Medium`,
    category: `2-D Dynamic Programming`,
    pattern: `State Machine DP`,
    description: `You are given daily stock prices. You may buy and sell many times, but you can hold at most one share at a time, and after selling you must wait one full day before buying again.

Return the maximum profit achievable under those rules.`,
    constraints: [`\`0 <= prices.length <= 5000\``, `\`0 <= prices[i] <= 1000\``, `You may complete as many transactions as the cooldown permits.`, `You cannot buy again on the day immediately after a sale.`],
    hints: [`Track whether you currently hold a share.`, `Selling jumps over the next day because of the cooldown.`, `The bottom-up version can be represented by three states: holding, just sold, and resting.`],
    signature: {
      kind: `function`,
      name: `maxProfit`,
      params: [
        {
          name: `prices`,
          type: `int[]`
        }
      ],
      returns: `int`
    },
    viz: `dp-grid`,
    solutions: [
      {
        title: `Top-down buy/sell state`,
        explanation: `**State.** \`dp(i, holding)\` is the best profit from day \`i\` onward, given whether a share is currently held.

**Recurrence.** If not holding, choose between skipping and buying: \`max(dp(i + 1, 0), -price[i] + dp(i + 1, 1))\`. If holding, choose between holding and selling: \`max(dp(i + 1, 1), price[i] + dp(i + 2, 0))\`; selling skips one cooldown day.

**Base case.** Past the end, no more profit can be made. Memoization makes each \`(day, state)\` pair constant-time after its first computation.`,
        time: `O(n)`,
        space: `O(n)`,
        python: `class Solution:
    def maxProfit(self, prices: List[int]) -> int:
        @lru_cache(None)
        def dp(i: int, holding: int) -> int:
            if i >= len(prices):
                return 0
            skip = dp(i + 1, holding)
            if holding:
                return max(skip, prices[i] + dp(i + 2, 0))
            return max(skip, -prices[i] + dp(i + 1, 1))
        return dp(0, 0)
`,
        cpp: `class Solution {
public:
    int maxProfit(vector<int>& prices) {
        int n = prices.size();
        vector<vector<int>> memo(n + 2, vector<int>(2, INT_MIN));
        function<int(int, int)> dp = [&](int i, int holding) -> int {
            if (i >= n) return 0;
            int& ans = memo[i][holding];
            if (ans != INT_MIN) return ans;
            int skip = dp(i + 1, holding);
            if (holding) ans = max(skip, prices[i] + dp(i + 2, 0));
            else ans = max(skip, -prices[i] + dp(i + 1, 1));
            return ans;
        };
        return dp(0, 0);
    }
};`
      },
      {
        title: `Bottom-up state table`,
        explanation: `**Intuition.** Each day ends in one of three states: holding a stock, just sold today, or resting without a stock.

**Transitions.**
1. \`hold[i] = max(hold[i - 1], rest[i - 1] - price)\`.
2. \`sold[i] = hold[i - 1] + price\`.
3. \`rest[i] = max(rest[i - 1], sold[i - 1])\`.

The cooldown is enforced because buying uses \`rest\`, not \`sold\`. At the end, the answer is the best non-holding state.`,
        time: `O(n)`,
        space: `O(n)`,
        python: `class Solution:
    def maxProfit(self, prices: List[int]) -> int:
        if not prices:
            return 0
        n = len(prices)
        hold = [0] * n
        sold = [0] * n
        rest = [0] * n
        hold[0] = -prices[0]
        for i in range(1, n):
            hold[i] = max(hold[i - 1], rest[i - 1] - prices[i])
            sold[i] = hold[i - 1] + prices[i]
            rest[i] = max(rest[i - 1], sold[i - 1])
        return max(sold[-1], rest[-1])
`,
        cpp: `class Solution {
public:
    int maxProfit(vector<int>& prices) {
        if (prices.empty()) return 0;
        int n = prices.size();
        vector<int> hold(n), sold(n), rest(n);
        hold[0] = -prices[0];
        for (int i = 1; i < n; ++i) {
            hold[i] = max(hold[i - 1], rest[i - 1] - prices[i]);
            sold[i] = hold[i - 1] + prices[i];
            rest[i] = max(rest[i - 1], sold[i - 1]);
        }
        return max(sold[n - 1], rest[n - 1]);
    }
};`
      },
      {
        title: `Constant-space state machine`,
        explanation: `**Intuition.** The table transitions only read yesterday's three states, so arrays are unnecessary.

**Steps.** Keep \`hold\`, \`sold\`, and \`rest\` for the previous day. For each price, compute the next values from the old values and then replace them.

**Correctness.** The variables maintain the same invariant as the full table. Since every transition depends only on day \`i - 1\`, discarding older rows does not change any future choice.`,
        time: `O(n)`,
        space: `O(1)`,
        python: `class Solution:
    def maxProfit(self, prices: List[int]) -> int:
        if not prices:
            return 0
        hold, sold, rest = -prices[0], 0, 0
        for price in prices[1:]:
            hold, sold, rest = max(hold, rest - price), hold + price, max(rest, sold)
        return max(sold, rest)
`,
        cpp: `class Solution {
public:
    int maxProfit(vector<int>& prices) {
        if (prices.empty()) return 0;
        int hold = -prices[0], sold = 0, rest = 0;
        for (int i = 1; i < (int)prices.size(); ++i) {
            int nextHold = max(hold, rest - prices[i]);
            int nextSold = hold + prices[i];
            int nextRest = max(rest, sold);
            hold = nextHold; sold = nextSold; rest = nextRest;
        }
        return max(sold, rest);
    }
};`
      }
    ],
    examples: [
      {
        input: `prices = [1,2,3,0,2]`,
        output: `3`,
        explanation: `One optimal plan is buy day 0, sell day 1, cooldown day 2, buy day 3, sell day 4.`
      },
      {
        input: `prices = [1]`,
        output: `0`,
        explanation: `A single price does not allow a completed transaction.`
      },
      {
        input: `prices = [2,1,4]`,
        output: `3`,
        explanation: `Buy at 1 and sell at 4.`
      }
    ],
    tests: [
      {
        args: [
          [1, 2, 3, 0, 2]
        ],
        expected: 3
      },
      {
        args: [
          [1]
        ],
        expected: 0
      },
      {
        args: [
          [2, 1, 4]
        ],
        expected: 3
      },
      {
        args: [
          []
        ],
        expected: 0
      },
      {
        args: [
          [6, 1, 3, 2, 4, 7]
        ],
        expected: 6
      },
      {
        args: [
          [1, 2, 4]
        ],
        expected: 3
      },
      {
        args: [
          [3, 2, 1]
        ],
        expected: 0
      },
      {
        args: [
          [1, 2, 3, 0, 2, 4]
        ],
        expected: 5
      },
      {
        args: [
          [2, 1, 2, 0, 1]
        ],
        expected: 1
      }
    ]
  },
  {
    id: `coin-change-ii`,
    title: `Coin Change II`,
    number: 518,
    difficulty: `Medium`,
    category: `2-D Dynamic Programming`,
    pattern: `Unbounded Knapsack`,
    description: `Given a target amount and a list of coin denominations, count how many combinations of coins sum exactly to the amount. You may use each denomination any number of times.

Combinations are counted by coin counts, not by order, so \`[1,2]\` and \`[2,1]\` represent the same choice.`,
    constraints: [`\`0 <= amount <= 5000\``, `\`1 <= coins.length <= 300\``, `\`1 <= coins[i] <= 5000\``, `Coin denominations are distinct.`, `The answer fits in a signed 32-bit integer.`],
    hints: [`To avoid counting permutations, decide coins in a fixed order.`, `At coin index \`i\`, either use one more of that coin or move to the next coin.`, `A one-dimensional DP works if coins are the outer loop and amounts increase.`],
    signature: {
      kind: `function`,
      name: `change`,
      params: [
        {
          name: `amount`,
          type: `int`
        },
        {
          name: `coins`,
          type: `int[]`
        }
      ],
      returns: `int`
    },
    viz: `dp-grid`,
    solutions: [
      {
        title: `Top-down choose/skip`,
        explanation: `**State.** \`dp(i, rem)\` counts combinations that make \`rem\` using coins from index \`i\` onward.

**Recurrence and bases.** If \`rem == 0\`, one valid combination has been formed. If \`rem < 0\` or all coins are exhausted, there are no combinations. Otherwise, either use \`coins[i]\` again (\`dp(i, rem - coins[i])\`) or skip to the next coin (\`dp(i + 1, rem)\`).

This fixed coin order prevents counting the same multiset in multiple orders.`,
        time: `O(amount * n)`,
        space: `O(amount * n)`,
        python: `class Solution:
    def change(self, amount: int, coins: List[int]) -> int:
        @lru_cache(None)
        def dp(i: int, rem: int) -> int:
            if rem == 0:
                return 1
            if rem < 0 or i == len(coins):
                return 0
            return dp(i, rem - coins[i]) + dp(i + 1, rem)
        return dp(0, amount)
`,
        cpp: `class Solution {
public:
    int change(int amount, vector<int>& coins) {
        int n = coins.size();
        vector<vector<int>> memo(n, vector<int>(amount + 1, -1));
        function<int(int, int)> dp = [&](int i, int rem) -> int {
            if (rem == 0) return 1;
            if (rem < 0 || i == n) return 0;
            int& ans = memo[i][rem];
            if (ans != -1) return ans;
            ans = dp(i, rem - coins[i]) + dp(i + 1, rem);
            return ans;
        };
        return dp(0, amount);
    }
};`
      },
      {
        title: `Bottom-up 2-D knapsack`,
        explanation: `**State.** \`dp[i][a]\` is the number of ways to form amount \`a\` using coins \`i..end\`.

**Steps.**
1. Set \`dp[i][0] = 1\` for every \`i\`.
2. Fill coin indices from right to left.
3. For each amount, combine skipping the coin and taking one more copy.

The recurrence mirrors the memoized version, so it counts each combination exactly once by its smallest allowed coin index.`,
        time: `O(amount * n)`,
        space: `O(amount * n)`,
        python: `class Solution:
    def change(self, amount: int, coins: List[int]) -> int:
        n = len(coins)
        dp = [[0] * (amount + 1) for _ in range(n + 1)]
        for i in range(n + 1):
            dp[i][0] = 1
        for i in range(n - 1, -1, -1):
            for a in range(amount + 1):
                dp[i][a] = dp[i + 1][a]
                if a >= coins[i]:
                    dp[i][a] += dp[i][a - coins[i]]
        return dp[0][amount]
`,
        cpp: `class Solution {
public:
    int change(int amount, vector<int>& coins) {
        int n = coins.size();
        vector<vector<int>> dp(n + 1, vector<int>(amount + 1));
        for (int i = 0; i <= n; ++i) dp[i][0] = 1;
        for (int i = n - 1; i >= 0; --i) {
            for (int a = 0; a <= amount; ++a) {
                dp[i][a] = dp[i + 1][a];
                if (a >= coins[i]) dp[i][a] += dp[i][a - coins[i]];
            }
        }
        return dp[0][amount];
    }
};`
      },
      {
        title: `One-dimensional combinations DP`,
        explanation: `**Intuition.** Process coins one denomination at a time. After processing a coin, \`dp[a]\` contains combinations using only processed coins.

**Steps.**
1. Initialize \`dp[0] = 1\` for the empty combination.
2. For each coin, scan amounts upward from \`coin\` to \`amount\`.
3. Add \`dp[a - coin]\` into \`dp[a]\`.

Scanning upward is essential for unbounded use of the same coin while still avoiding reordered duplicates.`,
        time: `O(amount * n)`,
        space: `O(amount)`,
        python: `class Solution:
    def change(self, amount: int, coins: List[int]) -> int:
        dp = [0] * (amount + 1)
        dp[0] = 1
        for coin in coins:
            for a in range(coin, amount + 1):
                dp[a] += dp[a - coin]
        return dp[amount]
`,
        cpp: `class Solution {
public:
    int change(int amount, vector<int>& coins) {
        vector<int> dp(amount + 1);
        dp[0] = 1;
        for (int coin : coins) {
            for (int a = coin; a <= amount; ++a) dp[a] += dp[a - coin];
        }
        return dp[amount];
    }
};`
      }
    ],
    examples: [
      {
        input: `amount = 5, coins = [1,2,5]`,
        output: `4`,
        explanation: `The combinations are five ones, three ones plus a two, one one plus two twos, and one five.`
      },
      {
        input: `amount = 3, coins = [2]`,
        output: `0`,
        explanation: `No number of 2-value coins can sum to 3.`
      },
      {
        input: `amount = 10, coins = [10]`,
        output: `1`,
        explanation: `Using the single coin once is the only combination.`
      }
    ],
    tests: [
      {
        args: [
          5,
          [1, 2, 5]
        ],
        expected: 4
      },
      {
        args: [
          3,
          [2]
        ],
        expected: 0
      },
      {
        args: [
          10,
          [10]
        ],
        expected: 1
      },
      {
        args: [
          0,
          [1, 2, 3]
        ],
        expected: 1
      },
      {
        args: [
          4,
          [1, 2, 3]
        ],
        expected: 4
      },
      {
        args: [
          7,
          [2, 3, 6, 7]
        ],
        expected: 2
      },
      {
        args: [
          6,
          [1, 5]
        ],
        expected: 2
      },
      {
        args: [
          8,
          [2, 4]
        ],
        expected: 3
      }
    ]
  },
  {
    id: `target-sum`,
    title: `Target Sum`,
    number: 494,
    difficulty: `Medium`,
    category: `2-D Dynamic Programming`,
    pattern: `Counting DP`,
    description: `For each number in \`nums\`, choose either a plus sign or a minus sign, then evaluate the expression.

Return how many sign assignments produce exactly \`target\`.`,
    constraints: [`\`1 <= nums.length <= 20\``, `\`0 <= nums[i] <= 1000\``, `\`-1000 <= target <= 1000\``, `The total sum of \`nums\` is at most \`1000\` in the original constraints.`],
    hints: [`A partial expression is described by an index and the current total.`, `Zeros double the count because \`+0\` and \`-0\` are different assignments.`, `The equation \`positive - negative = target\` can be converted into a subset-sum count.`],
    signature: {
      kind: `function`,
      name: `findTargetSumWays`,
      params: [
        {
          name: `nums`,
          type: `int[]`
        },
        {
          name: `target`,
          type: `int`
        }
      ],
      returns: `int`
    },
    viz: `dp-grid`,
    solutions: [
      {
        title: `Top-down index and total`,
        explanation: `**State.** \`dp(i, total)\` is the number of assignments for \`nums[i:]\` after the prefix has evaluated to \`total\`.

**Recurrence.** At each index, branch into adding or subtracting the current value: \`dp(i + 1, total + x) + dp(i + 1, total - x)\`.

**Base case.** When all numbers are assigned, return \`1\` only if the total equals the target. Memoization collapses many repeated totals, especially with zeros.`,
        time: `O(n * S)`,
        space: `O(n * S)`,
        python: `class Solution:
    def findTargetSumWays(self, nums: List[int], target: int) -> int:
        @lru_cache(None)
        def dp(i: int, total: int) -> int:
            if i == len(nums):
                return 1 if total == target else 0
            return dp(i + 1, total + nums[i]) + dp(i + 1, total - nums[i])
        return dp(0, 0)
`,
        cpp: `class Solution {
public:
    int findTargetSumWays(vector<int>& nums, int target) {
        int n = nums.size();
        vector<unordered_map<int, int>> memo(n);
        function<int(int, int)> dp = [&](int i, int total) -> int {
            if (i == n) return total == target ? 1 : 0;
            auto it = memo[i].find(total);
            if (it != memo[i].end()) return it->second;
            int ans = dp(i + 1, total + nums[i]) + dp(i + 1, total - nums[i]);
            memo[i][total] = ans;
            return ans;
        };
        return dp(0, 0);
    }
};`
      },
      {
        title: `Subset-sum transformation`,
        explanation: `**Intuition.** Split numbers into positive group \`P\` and negative group \`N\`. Then \`sum(P) - sum(N) = target\` and \`sum(P) + sum(N) = total\`, so \`sum(P) = (total + target) / 2\`.

**Steps.**
1. Reject impossible parity or magnitude cases.
2. Count subsets with sum \`(total + target) / 2\`.
3. Use reverse amount iteration so each number is used once.

Zeros are handled naturally: each zero doubles every existing count.`,
        time: `O(n * S)`,
        space: `O(S)`,
        python: `class Solution:
    def findTargetSumWays(self, nums: List[int], target: int) -> int:
        total = sum(nums)
        need = total + target
        if abs(target) > total or need % 2:
            return 0
        goal = need // 2
        dp = [0] * (goal + 1)
        dp[0] = 1
        for x in nums:
            for s in range(goal, x - 1, -1):
                dp[s] += dp[s - x]
        return dp[goal]
`,
        cpp: `class Solution {
public:
    int findTargetSumWays(vector<int>& nums, int target) {
        int total = accumulate(nums.begin(), nums.end(), 0);
        int need = total + target;
        if (abs(target) > total || need % 2) return 0;
        int goal = need / 2;
        vector<int> dp(goal + 1);
        dp[0] = 1;
        for (int x : nums) {
            for (int s = goal; s >= x; --s) dp[s] += dp[s - x];
        }
        return dp[goal];
    }
};`
      },
      {
        title: `Iterative total-count map`,
        explanation: `**Intuition.** Keep a histogram of all totals reachable after processing each prefix.

**Steps.**
1. Start with total \`0\` having count \`1\`.
2. For every number, create a new histogram by adding and subtracting it from every current total.
3. Read the count for \`target\` at the end.

This is a bottom-up version of the recursion and is often easier when sums can be negative.`,
        time: `O(n * S)`,
        space: `O(S)`,
        python: `class Solution:
    def findTargetSumWays(self, nums: List[int], target: int) -> int:
        ways = {0: 1}
        for x in nums:
            nxt = defaultdict(int)
            for total, count in ways.items():
                nxt[total + x] += count
                nxt[total - x] += count
            ways = nxt
        return ways.get(target, 0)
`,
        cpp: `class Solution {
public:
    int findTargetSumWays(vector<int>& nums, int target) {
        unordered_map<int, int> ways;
        ways[0] = 1;
        for (int x : nums) {
            unordered_map<int, int> nxt;
            for (auto& [total, count] : ways) {
                nxt[total + x] += count;
                nxt[total - x] += count;
            }
            ways.swap(nxt);
        }
        return ways[target];
    }
};`
      }
    ],
    examples: [
      {
        input: `nums = [1,1,1,1,1], target = 3`,
        output: `5`,
        explanation: `Five choices place a minus sign on exactly one of the five ones.`
      },
      {
        input: `nums = [1], target = 1`,
        output: `1`,
        explanation: `Only \`+1\` works.`
      },
      {
        input: `nums = [1], target = 2`,
        output: `0`,
        explanation: `Neither sign can create 2.`
      }
    ],
    tests: [
      {
        args: [
          [1, 1, 1, 1, 1],
          3
        ],
        expected: 5
      },
      {
        args: [
          [1],
          1
        ],
        expected: 1
      },
      {
        args: [
          [1],
          2
        ],
        expected: 0
      },
      {
        args: [
          [0, 0, 0, 0, 0],
          0
        ],
        expected: 32
      },
      {
        args: [
          [0, 1],
          1
        ],
        expected: 2
      },
      {
        args: [
          [1, 2, 3],
          0
        ],
        expected: 2
      },
      {
        args: [
          [2, 3, 5, 7],
          3
        ],
        expected: 2
      },
      {
        args: [
          [100],
          -100
        ],
        expected: 1
      }
    ]
  },
  {
    id: `interleaving-string`,
    title: `Interleaving String`,
    number: 97,
    difficulty: `Medium`,
    category: `2-D Dynamic Programming`,
    pattern: `Grid DP`,
    description: `Determine whether \`s3\` can be formed by weaving together all characters of \`s1\` and \`s2\` while preserving the internal order of each source string.

Every character from \`s1\` and \`s2\` must be used exactly once.`,
    constraints: [`\`0 <= s1.length, s2.length <= 100\``, `\`0 <= s3.length <= 200\``, `Strings contain lowercase English letters.`, `The order inside each source string must not change.`],
    hints: [`If you have used \`i\` characters from \`s1\` and \`j\` from \`s2\`, the next index in \`s3\` is fixed.`, `Try consuming from \`s1\` if it matches, and from \`s2\` if it matches.`, `This creates a grid DP over \`(i, j)\` positions.`],
    signature: {
      kind: `function`,
      name: `isInterleave`,
      params: [
        {
          name: `s1`,
          type: `string`
        },
        {
          name: `s2`,
          type: `string`
        },
        {
          name: `s3`,
          type: `string`
        }
      ],
      returns: `bool`
    },
    viz: `dp-grid`,
    solutions: [
      {
        title: `Top-down grid search`,
        explanation: `**State.** \`dp(i, j)\` answers whether \`s3[i + j:]\` can be formed after using \`i\` characters from \`s1\` and \`j\` from \`s2\`.

**Recurrence.** The next target character is \`s3[i + j]\`. If it matches \`s1[i]\`, try \`dp(i + 1, j)\`; if it matches \`s2[j]\`, try \`dp(i, j + 1)\`.

**Base cases.** A length mismatch is immediately false. Reaching the end of \`s3\` after consuming both sources is true.`,
        time: `O(m * n)`,
        space: `O(m * n)`,
        python: `class Solution:
    def isInterleave(self, s1: str, s2: str, s3: str) -> bool:
        if len(s1) + len(s2) != len(s3):
            return False
        @lru_cache(None)
        def dp(i: int, j: int) -> bool:
            k = i + j
            if k == len(s3):
                return True
            ok = False
            if i < len(s1) and s1[i] == s3[k]:
                ok = ok or dp(i + 1, j)
            if j < len(s2) and s2[j] == s3[k]:
                ok = ok or dp(i, j + 1)
            return ok
        return dp(0, 0)
`,
        cpp: `class Solution {
public:
    bool isInterleave(string s1, string s2, string s3) {
        int m = s1.size(), n = s2.size();
        if (m + n != (int)s3.size()) return false;
        vector<vector<int>> memo(m + 1, vector<int>(n + 1, -1));
        function<bool(int, int)> dp = [&](int i, int j) -> bool {
            int k = i + j;
            if (k == (int)s3.size()) return true;
            int& ans = memo[i][j];
            if (ans != -1) return ans;
            bool ok = false;
            if (i < m && s1[i] == s3[k]) ok = ok || dp(i + 1, j);
            if (j < n && s2[j] == s3[k]) ok = ok || dp(i, j + 1);
            ans = ok;
            return ok;
        };
        return dp(0, 0);
    }
};`
      },
      {
        title: `Bottom-up reachability table`,
        explanation: `**State.** \`dp[i][j]\` is true when \`s3[:i + j]\` can be formed by \`s1[:i]\` and \`s2[:j]\`.

**Steps.**
1. Start with \`dp[0][0] = true\`.
2. For each cell, check whether the last character came from \`s1\` or from \`s2\`.
3. Return \`dp[m][n]\`.

Correctness follows by considering the final character of any valid prefix interleaving. The pitfall is using \`i + j - 1\` as the target index for non-empty prefixes.`,
        time: `O(m * n)`,
        space: `O(m * n)`,
        python: `class Solution:
    def isInterleave(self, s1: str, s2: str, s3: str) -> bool:
        m, n = len(s1), len(s2)
        if m + n != len(s3):
            return False
        dp = [[False] * (n + 1) for _ in range(m + 1)]
        dp[0][0] = True
        for i in range(m + 1):
            for j in range(n + 1):
                k = i + j - 1
                if i > 0:
                    dp[i][j] = dp[i][j] or (dp[i - 1][j] and s1[i - 1] == s3[k])
                if j > 0:
                    dp[i][j] = dp[i][j] or (dp[i][j - 1] and s2[j - 1] == s3[k])
        return dp[m][n]
`,
        cpp: `class Solution {
public:
    bool isInterleave(string s1, string s2, string s3) {
        int m = s1.size(), n = s2.size();
        if (m + n != (int)s3.size()) return false;
        vector<vector<char>> dp(m + 1, vector<char>(n + 1));
        dp[0][0] = true;
        for (int i = 0; i <= m; ++i) {
            for (int j = 0; j <= n; ++j) {
                int k = i + j - 1;
                if (i > 0) dp[i][j] = dp[i][j] || (dp[i - 1][j] && s1[i - 1] == s3[k]);
                if (j > 0) dp[i][j] = dp[i][j] || (dp[i][j - 1] && s2[j - 1] == s3[k]);
            }
        }
        return dp[m][n];
    }
};`
      },
      {
        title: `One-row reachability`,
        explanation: `**Intuition.** Each \`dp[i][j]\` uses the cell above and the cell to the left, so one row is enough.

**Steps.**
1. Let \`dp[j]\` represent the current row's value at column \`j\`.
2. Update from left to right so \`dp[j - 1]\` is already current-row data.
3. Keep \`dp[j]\` from before the update as the above-row value.

This keeps the exact table invariant with \`O(n)\` memory.`,
        time: `O(m * n)`,
        space: `O(n)`,
        python: `class Solution:
    def isInterleave(self, s1: str, s2: str, s3: str) -> bool:
        m, n = len(s1), len(s2)
        if m + n != len(s3):
            return False
        dp = [False] * (n + 1)
        dp[0] = True
        for i in range(m + 1):
            for j in range(n + 1):
                if i == 0 and j == 0:
                    continue
                k = i + j - 1
                from_s1 = i > 0 and dp[j] and s1[i - 1] == s3[k]
                from_s2 = j > 0 and dp[j - 1] and s2[j - 1] == s3[k]
                dp[j] = from_s1 or from_s2
        return dp[n]
`,
        cpp: `class Solution {
public:
    bool isInterleave(string s1, string s2, string s3) {
        int m = s1.size(), n = s2.size();
        if (m + n != (int)s3.size()) return false;
        vector<char> dp(n + 1);
        dp[0] = true;
        for (int i = 0; i <= m; ++i) {
            for (int j = 0; j <= n; ++j) {
                if (i == 0 && j == 0) continue;
                int k = i + j - 1;
                bool fromS1 = i > 0 && dp[j] && s1[i - 1] == s3[k];
                bool fromS2 = j > 0 && dp[j - 1] && s2[j - 1] == s3[k];
                dp[j] = fromS1 || fromS2;
            }
        }
        return dp[n];
    }
};`
      }
    ],
    examples: [
      {
        input: `s1 = "aabcc", s2 = "dbbca", s3 = "aadbbcbcac"`,
        output: `true`,
        explanation: `The target can be traced by alternating valid prefixes from both strings.`
      },
      {
        input: `s1 = "aabcc", s2 = "dbbca", s3 = "aadbbbaccc"`,
        output: `false`,
        explanation: `At some point the needed character order conflicts with both sources.`
      },
      {
        input: `s1 = "", s2 = "", s3 = ""`,
        output: `true`,
        explanation: `Three empty strings form a valid interleaving.`
      }
    ],
    tests: [
      {
        args: [`aabcc`, `dbbca`, `aadbbcbcac`],
        expected: true
      },
      {
        args: [`aabcc`, `dbbca`, `aadbbbaccc`],
        expected: false
      },
      {
        args: [``, ``, ``],
        expected: true
      },
      {
        args: [``, `abc`, `abc`],
        expected: true
      },
      {
        args: [`abc`, ``, `abc`],
        expected: true
      },
      {
        args: [`a`, `b`, `ab`],
        expected: true
      },
      {
        args: [`a`, `b`, `ba`],
        expected: true
      },
      {
        args: [`abc`, `def`, `abdecf`],
        expected: true
      },
      {
        args: [`aa`, `ab`, `abaa`],
        expected: true
      }
    ]
  },
  {
    id: `longest-increasing-path-in-a-matrix`,
    title: `Longest Increasing Path in a Matrix`,
    number: 329,
    difficulty: `Hard`,
    category: `2-D Dynamic Programming`,
    pattern: `Memoized DFS`,
    description: `Given a matrix of integers, choose a path that moves up, down, left, or right at each step. Every next cell must have a strictly larger value than the current cell.

Return the maximum number of cells in any such path.`,
    constraints: [`\`1 <= matrix.length, matrix[i].length <= 200\``, `\`-2^31 <= matrix[r][c] <= 2^31 - 1\``, `Moves are limited to the four cardinal directions.`, `Values must strictly increase; equal values cannot be adjacent steps in the path.`],
    hints: [`Strictly increasing moves make the graph acyclic by value.`, `The best path starting at a cell depends on the best paths starting from larger neighbors.`, `Memoize DFS from each cell, or process cells in increasing value order.`],
    signature: {
      kind: `function`,
      name: `longestIncreasingPath`,
      params: [
        {
          name: `matrix`,
          type: `int[][]`
        }
      ],
      returns: `int`
    },
    viz: `dp-grid`,
    solutions: [
      {
        title: `DFS with memoized cell values`,
        explanation: `**State.** \`dp(r, c)\` is the length of the longest increasing path that starts at cell \`(r, c)\`.

**Recurrence.** Start with length \`1\` for the cell itself. For each neighbor with a larger value, try \`1 + dp(neighbor)\` and take the maximum.

**Why correct.** Because values strictly increase, a path can never cycle back to a previous value. Every valid path from a cell must choose one larger neighbor as its second cell, so the recurrence covers all possibilities. Memoization ensures each cell is expanded once.`,
        time: `O(R * C)`,
        space: `O(R * C)`,
        python: `class Solution:
    def longestIncreasingPath(self, matrix: List[List[int]]) -> int:
        if not matrix or not matrix[0]:
            return 0
        rows, cols = len(matrix), len(matrix[0])
        @lru_cache(None)
        def dp(r: int, c: int) -> int:
            best = 1
            for dr, dc in ((1, 0), (-1, 0), (0, 1), (0, -1)):
                nr, nc = r + dr, c + dc
                if 0 <= nr < rows and 0 <= nc < cols and matrix[nr][nc] > matrix[r][c]:
                    best = max(best, 1 + dp(nr, nc))
            return best
        return max(dp(r, c) for r in range(rows) for c in range(cols))
`,
        cpp: `class Solution {
public:
    int longestIncreasingPath(vector<vector<int>>& matrix) {
        if (matrix.empty() || matrix[0].empty()) return 0;
        int rows = matrix.size(), cols = matrix[0].size();
        vector<vector<int>> memo(rows, vector<int>(cols));
        vector<int> dirs = {1, 0, -1, 0, 1};
        function<int(int, int)> dp = [&](int r, int c) -> int {
            if (memo[r][c]) return memo[r][c];
            int best = 1;
            for (int k = 0; k < 4; ++k) {
                int nr = r + dirs[k], nc = c + dirs[k + 1];
                if (nr >= 0 && nr < rows && nc >= 0 && nc < cols && matrix[nr][nc] > matrix[r][c]) {
                    best = max(best, 1 + dp(nr, nc));
                }
            }
            return memo[r][c] = best;
        };
        int ans = 0;
        for (int r = 0; r < rows; ++r) for (int c = 0; c < cols; ++c) ans = max(ans, dp(r, c));
        return ans;
    }
};`
      },
      {
        title: `Bottom-up by sorted values`,
        explanation: `**Intuition.** Smaller values can feed larger values. If cells are processed in increasing value order, every update extends a path from a smaller cell to a larger neighbor.

**Steps.**
1. Initialize every cell's path length to \`1\`.
2. Sort all cell coordinates by value.
3. For each cell, push \`dp[r][c] + 1\` into any strictly larger neighbor.

This is a tabulation over the DAG induced by value-increasing edges. Equal values must not update each other.`,
        time: `O(R * C * log(R * C))`,
        space: `O(R * C)`,
        python: `class Solution:
    def longestIncreasingPath(self, matrix: List[List[int]]) -> int:
        if not matrix or not matrix[0]:
            return 0
        rows, cols = len(matrix), len(matrix[0])
        cells = sorted((matrix[r][c], r, c) for r in range(rows) for c in range(cols))
        dp = [[1] * cols for _ in range(rows)]
        ans = 1
        for value, r, c in cells:
            ans = max(ans, dp[r][c])
            for dr, dc in ((1, 0), (-1, 0), (0, 1), (0, -1)):
                nr, nc = r + dr, c + dc
                if 0 <= nr < rows and 0 <= nc < cols and matrix[nr][nc] > value:
                    dp[nr][nc] = max(dp[nr][nc], dp[r][c] + 1)
        return ans
`,
        cpp: `class Solution {
public:
    int longestIncreasingPath(vector<vector<int>>& matrix) {
        if (matrix.empty() || matrix[0].empty()) return 0;
        int rows = matrix.size(), cols = matrix[0].size();
        vector<tuple<int, int, int>> cells;
        for (int r = 0; r < rows; ++r) for (int c = 0; c < cols; ++c) cells.emplace_back(matrix[r][c], r, c);
        sort(cells.begin(), cells.end());
        vector<vector<int>> dp(rows, vector<int>(cols, 1));
        vector<int> dirs = {1, 0, -1, 0, 1};
        int ans = 1;
        for (auto [value, r, c] : cells) {
            ans = max(ans, dp[r][c]);
            for (int k = 0; k < 4; ++k) {
                int nr = r + dirs[k], nc = c + dirs[k + 1];
                if (nr >= 0 && nr < rows && nc >= 0 && nc < cols && matrix[nr][nc] > value) {
                    dp[nr][nc] = max(dp[nr][nc], dp[r][c] + 1);
                }
            }
        }
        return ans;
    }
};`
      }
    ],
    examples: [
      {
        input: `matrix = [[9,9,4],[6,6,8],[2,1,1]]`,
        output: `4`,
        explanation: `One longest path is 1 -> 2 -> 6 -> 9.`
      },
      {
        input: `matrix = [[3,4,5],[3,2,6],[2,2,1]]`,
        output: `4`,
        explanation: `A path 3 -> 4 -> 5 -> 6 has length 4.`
      },
      {
        input: `matrix = [[1]]`,
        output: `1`,
        explanation: `A single cell is a path of length 1.`
      }
    ],
    tests: [
      {
        args: [
          [
            [9, 9, 4],
            [6, 6, 8],
            [2, 1, 1]
          ]
        ],
        expected: 4
      },
      {
        args: [
          [
            [3, 4, 5],
            [3, 2, 6],
            [2, 2, 1]
          ]
        ],
        expected: 4
      },
      {
        args: [
          [
            [1]
          ]
        ],
        expected: 1
      },
      {
        args: [
          [
            [1, 2],
            [4, 3]
          ]
        ],
        expected: 4
      },
      {
        args: [
          [
            [7, 7],
            [7, 7]
          ]
        ],
        expected: 1
      },
      {
        args: [
          [
            [1, 2, 3, 4]
          ]
        ],
        expected: 4
      },
      {
        args: [
          [
            [4],
            [3],
            [2],
            [1]
          ]
        ],
        expected: 4
      },
      {
        args: [
          [
            [10, 9],
            [8, 7]
          ]
        ],
        expected: 3
      },
      {
        args: [
          [
            [1, 2, 3],
            [6, 5, 4],
            [7, 8, 9]
          ]
        ],
        expected: 9
      }
    ]
  },
  {
    id: `distinct-subsequences`,
    title: `Distinct Subsequences`,
    number: 115,
    difficulty: `Hard`,
    category: `2-D Dynamic Programming`,
    pattern: `Subsequence DP`,
    description: `Given strings \`s\` and \`t\`, count how many different ways deleting characters from \`s\` can leave exactly \`t\`. Characters that remain must keep their original order.

Return the count of distinct index choices that form \`t\`.`,
    constraints: [`\`0 <= s.length, t.length <= 1000\``, `Strings contain English letters.`, `The final answer is guaranteed to fit in a signed 32-bit integer.`, `Intermediate counts should still be stored in a wide integer type in C++.`],
    hints: [`For each character of \`s\`, decide whether it participates in matching the current character of \`t\`.`, `If the current characters match, you can either use the character or skip it.`, `A 1-D DP must update target indices backwards to avoid reusing one source character twice.`],
    signature: {
      kind: `function`,
      name: `numDistinct`,
      params: [
        {
          name: `s`,
          type: `string`
        },
        {
          name: `t`,
          type: `string`
        }
      ],
      returns: `int`
    },
    viz: `dp-grid`,
    solutions: [
      {
        title: `Top-down use-or-skip`,
        explanation: `**State.** \`dp(i, j)\` counts ways to form \`t[j:]\` from \`s[i:]\`.

**Base cases.** If \`j == len(t)\`, one valid subsequence has been completed. If \`i == len(s)\` first, no non-empty target suffix can be formed.

**Recurrence.** Always allow skipping \`s[i]\`. If \`s[i] == t[j]\`, also allow using it and moving both indices. The two choices produce disjoint sets of source indices, so their counts add.`,
        time: `O(m * n)`,
        space: `O(m * n)`,
        python: `class Solution:
    def numDistinct(self, s: str, t: str) -> int:
        @lru_cache(None)
        def dp(i: int, j: int) -> int:
            if j == len(t):
                return 1
            if i == len(s):
                return 0
            ans = dp(i + 1, j)
            if s[i] == t[j]:
                ans += dp(i + 1, j + 1)
            return ans
        return dp(0, 0)
`,
        cpp: `class Solution {
public:
    int numDistinct(string s, string t) {
        int m = s.size(), n = t.size();
        vector<vector<long long>> memo(m + 1, vector<long long>(n + 1, -1));
        function<long long(int, int)> dp = [&](int i, int j) -> long long {
            if (j == n) return 1;
            if (i == m) return 0;
            long long& ans = memo[i][j];
            if (ans != -1) return ans;
            ans = dp(i + 1, j);
            if (s[i] == t[j]) ans += dp(i + 1, j + 1);
            return ans;
        };
        return (int)dp(0, 0);
    }
};`
      },
      {
        title: `Bottom-up suffix table`,
        explanation: `**State.** \`dp[i][j]\` is the number of ways \`s[i:]\` forms \`t[j:]\`.

**Steps.**
1. Set \`dp[i][n] = 1\` for every \`i\` because the empty target is always formable.
2. Fill \`i\` and \`j\` from the end toward the front.
3. Copy the skip count and add the use count on character matches.

Using \`long long\`/\`unsigned long long\` avoids overflow while accumulating, even though the final result is bounded.`,
        time: `O(m * n)`,
        space: `O(m * n)`,
        python: `class Solution:
    def numDistinct(self, s: str, t: str) -> int:
        m, n = len(s), len(t)
        dp = [[0] * (n + 1) for _ in range(m + 1)]
        for i in range(m + 1):
            dp[i][n] = 1
        for i in range(m - 1, -1, -1):
            for j in range(n - 1, -1, -1):
                dp[i][j] = dp[i + 1][j]
                if s[i] == t[j]:
                    dp[i][j] += dp[i + 1][j + 1]
        return dp[0][0]
`,
        cpp: `class Solution {
public:
    int numDistinct(string s, string t) {
        int m = s.size(), n = t.size();
        vector<vector<unsigned long long>> dp(m + 1, vector<unsigned long long>(n + 1));
        for (int i = 0; i <= m; ++i) dp[i][n] = 1;
        for (int i = m - 1; i >= 0; --i) {
            for (int j = n - 1; j >= 0; --j) {
                dp[i][j] = dp[i + 1][j];
                if (s[i] == t[j]) dp[i][j] += dp[i + 1][j + 1];
            }
        }
        return (int)dp[0][0];
    }
};`
      },
      {
        title: `One-dimensional target DP`,
        explanation: `**Intuition.** Let \`dp[j]\` be the number of ways to form the first \`j\` characters of \`t\` from the processed prefix of \`s\`.

**Steps.**
1. Initialize \`dp[0] = 1\` for the empty target.
2. For each source character, scan \`t\` backwards.
3. When characters match, add \`dp[j]\` into \`dp[j + 1]\`.

Backward scanning is mandatory; forward scanning would let one source character extend multiple positions in the same iteration.`,
        time: `O(m * n)`,
        space: `O(n)`,
        python: `class Solution:
    def numDistinct(self, s: str, t: str) -> int:
        dp = [0] * (len(t) + 1)
        dp[0] = 1
        for ch in s:
            for j in range(len(t) - 1, -1, -1):
                if ch == t[j]:
                    dp[j + 1] += dp[j]
        return dp[-1]
`,
        cpp: `class Solution {
public:
    int numDistinct(string s, string t) {
        vector<unsigned long long> dp(t.size() + 1);
        dp[0] = 1;
        for (char ch : s) {
            for (int j = (int)t.size() - 1; j >= 0; --j) {
                if (ch == t[j]) dp[j + 1] += dp[j];
            }
        }
        return (int)dp.back();
    }
};`
      }
    ],
    examples: [
      {
        input: `s = "rabbbit", t = "rabbit"`,
        output: `3`,
        explanation: `Choose which two of the three \`b\` characters remain.`
      },
      {
        input: `s = "babgbag", t = "bag"`,
        output: `5`,
        explanation: `There are five index triples that spell \`bag\`.`
      },
      {
        input: `s = "abc", t = "abc"`,
        output: `1`,
        explanation: `All characters must be kept.`
      }
    ],
    tests: [
      {
        args: [`rabbbit`, `rabbit`],
        expected: 3
      },
      {
        args: [`babgbag`, `bag`],
        expected: 5
      },
      {
        args: [`abc`, `abc`],
        expected: 1
      },
      {
        args: [`abc`, ``],
        expected: 1
      },
      {
        args: [``, `a`],
        expected: 0
      },
      {
        args: [`aaaaa`, `aa`],
        expected: 10
      },
      {
        args: [`ABCDE`, `ace`],
        expected: 0
      },
      {
        args: [`aabb`, `ab`],
        expected: 4
      }
    ]
  },
  {
    id: `edit-distance`,
    title: `Edit Distance`,
    number: 72,
    difficulty: `Medium`,
    category: `2-D Dynamic Programming`,
    pattern: `String DP`,
    description: `Given two words, compute the minimum number of single-character edits needed to change the first word into the second. The allowed edits are insert, delete, and replace.

Return that minimum edit count.`,
    constraints: [`\`0 <= word1.length, word2.length <= 500\``, `Words contain lowercase English letters.`, `Each operation changes the string by one insertion, deletion, or replacement.`],
    hints: [`Compare suffixes of the two words.`, `When current characters match, no edit is needed for them.`, `When they differ, try the three operations and add one.`],
    signature: {
      kind: `function`,
      name: `minDistance`,
      params: [
        {
          name: `word1`,
          type: `string`
        },
        {
          name: `word2`,
          type: `string`
        }
      ],
      returns: `int`
    },
    viz: `dp-grid`,
    solutions: [
      {
        title: `Top-down edit choices`,
        explanation: `**State.** \`dp(i, j)\` is the minimum edits to convert \`word1[i:]\` into \`word2[j:]\`.

**Base cases.** If one suffix is empty, the only option is to insert or delete all remaining characters of the other suffix.

**Recurrence.** Matching characters move both indices for free. Otherwise, try delete (\`i + 1, j\`), insert (\`i, j + 1\`), and replace (\`i + 1, j + 1\`), then add one edit.`,
        time: `O(m * n)`,
        space: `O(m * n)`,
        python: `class Solution:
    def minDistance(self, word1: str, word2: str) -> int:
        @lru_cache(None)
        def dp(i: int, j: int) -> int:
            if i == len(word1):
                return len(word2) - j
            if j == len(word2):
                return len(word1) - i
            if word1[i] == word2[j]:
                return dp(i + 1, j + 1)
            return 1 + min(dp(i + 1, j), dp(i, j + 1), dp(i + 1, j + 1))
        return dp(0, 0)
`,
        cpp: `class Solution {
public:
    int minDistance(string word1, string word2) {
        int m = word1.size(), n = word2.size();
        vector<vector<int>> memo(m + 1, vector<int>(n + 1, -1));
        function<int(int, int)> dp = [&](int i, int j) -> int {
            if (i == m) return n - j;
            if (j == n) return m - i;
            int& ans = memo[i][j];
            if (ans != -1) return ans;
            if (word1[i] == word2[j]) ans = dp(i + 1, j + 1);
            else ans = 1 + min({dp(i + 1, j), dp(i, j + 1), dp(i + 1, j + 1)});
            return ans;
        };
        return dp(0, 0);
    }
};`
      },
      {
        title: `Bottom-up distance table`,
        explanation: `**State.** \`dp[i][j]\` is the edit distance between prefixes \`word1[:i]\` and \`word2[:j]\`.

**Steps.**
1. Initialize the first row and column with insert/delete counts.
2. For each pair of prefix lengths, carry over the diagonal if characters match.
3. Otherwise take one plus the best of delete, insert, or replace.

Considering the last operation of an optimal edit script proves the recurrence exhaustive.`,
        time: `O(m * n)`,
        space: `O(m * n)`,
        python: `class Solution:
    def minDistance(self, word1: str, word2: str) -> int:
        m, n = len(word1), len(word2)
        dp = [[0] * (n + 1) for _ in range(m + 1)]
        for i in range(m + 1):
            dp[i][0] = i
        for j in range(n + 1):
            dp[0][j] = j
        for i in range(1, m + 1):
            for j in range(1, n + 1):
                if word1[i - 1] == word2[j - 1]:
                    dp[i][j] = dp[i - 1][j - 1]
                else:
                    dp[i][j] = 1 + min(dp[i - 1][j], dp[i][j - 1], dp[i - 1][j - 1])
        return dp[m][n]
`,
        cpp: `class Solution {
public:
    int minDistance(string word1, string word2) {
        int m = word1.size(), n = word2.size();
        vector<vector<int>> dp(m + 1, vector<int>(n + 1));
        for (int i = 0; i <= m; ++i) dp[i][0] = i;
        for (int j = 0; j <= n; ++j) dp[0][j] = j;
        for (int i = 1; i <= m; ++i) {
            for (int j = 1; j <= n; ++j) {
                if (word1[i - 1] == word2[j - 1]) dp[i][j] = dp[i - 1][j - 1];
                else dp[i][j] = 1 + min({dp[i - 1][j], dp[i][j - 1], dp[i - 1][j - 1]});
            }
        }
        return dp[m][n];
    }
};`
      },
      {
        title: `Two-row tabulation`,
        explanation: `**Intuition.** Each row only reads the previous row and the current row's left neighbor.

**Steps.**
1. Store the previous row for \`word1[:i - 1]\`.
2. Build the current row left to right.
3. Replace the previous row after finishing each \`i\`.

The invariant matches the full table exactly, but memory falls to \`O(n)\`. Be careful to initialize \`cur[0] = i\` for the cost of deleting a prefix.`,
        time: `O(m * n)`,
        space: `O(n)`,
        python: `class Solution:
    def minDistance(self, word1: str, word2: str) -> int:
        n = len(word2)
        prev = list(range(n + 1))
        for i, ch1 in enumerate(word1, 1):
            cur = [i] + [0] * n
            for j, ch2 in enumerate(word2, 1):
                if ch1 == ch2:
                    cur[j] = prev[j - 1]
                else:
                    cur[j] = 1 + min(prev[j], cur[j - 1], prev[j - 1])
            prev = cur
        return prev[n]
`,
        cpp: `class Solution {
public:
    int minDistance(string word1, string word2) {
        int n = word2.size();
        vector<int> prev(n + 1);
        iota(prev.begin(), prev.end(), 0);
        for (int i = 1; i <= (int)word1.size(); ++i) {
            vector<int> cur(n + 1);
            cur[0] = i;
            for (int j = 1; j <= n; ++j) {
                if (word1[i - 1] == word2[j - 1]) cur[j] = prev[j - 1];
                else cur[j] = 1 + min({prev[j], cur[j - 1], prev[j - 1]});
            }
            prev.swap(cur);
        }
        return prev[n];
    }
};`
      }
    ],
    examples: [
      {
        input: `word1 = "horse", word2 = "ros"`,
        output: `3`,
        explanation: `One optimal sequence replaces \`h\`, removes \`r\`, and removes \`e\`.`
      },
      {
        input: `word1 = "intention", word2 = "execution"`,
        output: `5`,
        explanation: `Five edits are sufficient and necessary.`
      },
      {
        input: `word1 = "", word2 = "abc"`,
        output: `3`,
        explanation: `Insert all three characters.`
      }
    ],
    tests: [
      {
        args: [`horse`, `ros`],
        expected: 3
      },
      {
        args: [`intention`, `execution`],
        expected: 5
      },
      {
        args: [``, `abc`],
        expected: 3
      },
      {
        args: [`abc`, ``],
        expected: 3
      },
      {
        args: [``, ``],
        expected: 0
      },
      {
        args: [`same`, `same`],
        expected: 0
      },
      {
        args: [`kitten`, `sitting`],
        expected: 3
      },
      {
        args: [`flaw`, `lawn`],
        expected: 2
      },
      {
        args: [`abcdef`, `azced`],
        expected: 3
      }
    ]
  },
  {
    id: `burst-balloons`,
    title: `Burst Balloons`,
    number: 312,
    difficulty: `Hard`,
    category: `2-D Dynamic Programming`,
    pattern: `Interval DP`,
    description: `You are given balloons labeled with positive values. When balloon \`i\` is burst, the coins gained are the value of that balloon times the values of its nearest unburst neighbors, treating missing outside neighbors as \`1\`.

Return the maximum coins possible after bursting every balloon.`,
    constraints: [`\`0 <= nums.length <= 300\``, `\`0 <= nums[i] <= 100\``, `Outside the original array, virtual balloons of value \`1\` are used.`, `The result fits in a signed 32-bit integer.`],
    hints: [`Choosing the first balloon is hard because its neighbors change.`, `Instead choose the last balloon burst inside an interval; its boundary neighbors are then fixed.`, `Use interval DP over open intervals between two already-burst boundaries.`],
    signature: {
      kind: `function`,
      name: `maxCoins`,
      params: [
        {
          name: `nums`,
          type: `int[]`
        }
      ],
      returns: `int`
    },
    viz: `dp-grid`,
    solutions: [
      {
        title: `Top-down interval DP`,
        explanation: `**State.** Add sentinel \`1\`s at both ends. Let \`dp(l, r)\` be the best coins from bursting all balloons strictly between indices \`l\` and \`r\`, with \`l\` and \`r\` still present.

**Recurrence.** Choose a balloon \`k\` in \`(l, r)\` to burst last. Its final neighbors are fixed, so the value is \`arr[l] * arr[k] * arr[r] + dp(l, k) + dp(k, r)\`. Try all \`k\`.

**Base case.** Empty intervals have value \`0\`. This last-burst view avoids mutable-neighbor ambiguity.`,
        time: `O(n^3)`,
        space: `O(n^2)`,
        python: `class Solution:
    def maxCoins(self, nums: List[int]) -> int:
        arr = [1] + nums + [1]
        @lru_cache(None)
        def dp(left: int, right: int) -> int:
            if left + 1 >= right:
                return 0
            best = 0
            for k in range(left + 1, right):
                coins = arr[left] * arr[k] * arr[right]
                best = max(best, coins + dp(left, k) + dp(k, right))
            return best
        return dp(0, len(arr) - 1)
`,
        cpp: `class Solution {
public:
    int maxCoins(vector<int>& nums) {
        vector<int> arr;
        arr.push_back(1);
        arr.insert(arr.end(), nums.begin(), nums.end());
        arr.push_back(1);
        int n = arr.size();
        vector<vector<int>> memo(n, vector<int>(n, -1));
        function<int(int, int)> dp = [&](int left, int right) -> int {
            if (left + 1 >= right) return 0;
            int& ans = memo[left][right];
            if (ans != -1) return ans;
            ans = 0;
            for (int k = left + 1; k < right; ++k) {
                ans = max(ans, arr[left] * arr[k] * arr[right] + dp(left, k) + dp(k, right));
            }
            return ans;
        };
        return dp(0, n - 1);
    }
};`
      },
      {
        title: `Bottom-up interval length`,
        explanation: `**Intuition.** The same interval recurrence can be filled by increasing interval width because smaller subintervals are needed first.

**Steps.**
1. Add boundary \`1\`s.
2. For every interval length from \`2\` upward, compute open interval \`(left, right)\`.
3. Try each \`k\` as the last balloon in that interval.

The table entry uses only narrower intervals, so the fill order is valid. A common off-by-one error is treating boundaries as burstable; they are sentinels only.`,
        time: `O(n^3)`,
        space: `O(n^2)`,
        python: `class Solution:
    def maxCoins(self, nums: List[int]) -> int:
        arr = [1] + nums + [1]
        n = len(arr)
        dp = [[0] * n for _ in range(n)]
        for width in range(2, n):
            for left in range(0, n - width):
                right = left + width
                for k in range(left + 1, right):
                    coins = arr[left] * arr[k] * arr[right]
                    dp[left][right] = max(dp[left][right], coins + dp[left][k] + dp[k][right])
        return dp[0][n - 1]
`,
        cpp: `class Solution {
public:
    int maxCoins(vector<int>& nums) {
        vector<int> arr;
        arr.push_back(1);
        arr.insert(arr.end(), nums.begin(), nums.end());
        arr.push_back(1);
        int n = arr.size();
        vector<vector<int>> dp(n, vector<int>(n));
        for (int width = 2; width < n; ++width) {
            for (int left = 0; left + width < n; ++left) {
                int right = left + width;
                for (int k = left + 1; k < right; ++k) {
                    int coins = arr[left] * arr[k] * arr[right];
                    dp[left][right] = max(dp[left][right], coins + dp[left][k] + dp[k][right]);
                }
            }
        }
        return dp[0][n - 1];
    }
};`
      }
    ],
    examples: [
      {
        input: `nums = [3,1,5,8]`,
        output: `167`,
        explanation: `A best order collects 167 coins.`
      },
      {
        input: `nums = [1,5]`,
        output: `10`,
        explanation: `Burst 1 first, then 5.`
      },
      {
        input: `nums = [7]`,
        output: `7`,
        explanation: `The only burst is worth \`1 * 7 * 1\`.`
      }
    ],
    tests: [
      {
        args: [
          [3, 1, 5, 8]
        ],
        expected: 167
      },
      {
        args: [
          [1, 5]
        ],
        expected: 10
      },
      {
        args: [
          [7]
        ],
        expected: 7
      },
      {
        args: [
          []
        ],
        expected: 0
      },
      {
        args: [
          [1, 1, 1]
        ],
        expected: 3
      },
      {
        args: [
          [9, 76, 64]
        ],
        expected: 44416
      },
      {
        args: [
          [2, 4, 3]
        ],
        expected: 33
      },
      {
        args: [
          [1, 2, 3, 4]
        ],
        expected: 40
      },
      {
        args: [
          [8, 2, 6, 8]
        ],
        expected: 552
      }
    ]
  },
  {
    id: `regular-expression-matching`,
    title: `Regular Expression Matching`,
    number: 10,
    difficulty: `Hard`,
    category: `2-D Dynamic Programming`,
    pattern: `String DP`,
    description: `Match an entire string \`s\` against a pattern \`p\` containing lowercase letters, \`.\` for any single character, and \`*\` meaning zero or more of the previous pattern element.

Return whether the whole string is matched; partial matches do not count.`,
    constraints: [`\`0 <= s.length <= 20\``, `\`1 <= p.length <= 30\``, `Pattern \`*\` characters always refer to a previous element.`, `Matching must consume the entire input string.`],
    hints: [`Let a state represent suffixes of the string and pattern.`, `When the next pattern character is \`*\`, either skip the \`x*\` pair or consume one matching string character.`, `Without \`*\`, the current characters must match and both indices advance.`],
    signature: {
      kind: `function`,
      name: `isMatch`,
      params: [
        {
          name: `s`,
          type: `string`
        },
        {
          name: `p`,
          type: `string`
        }
      ],
      returns: `bool`
    },
    viz: `dp-grid`,
    solutions: [
      {
        title: `Top-down pattern DP`,
        explanation: `**State.** \`dp(i, j)\` tells whether \`s[i:]\` fully matches \`p[j:]\`.

**Recurrence.** First check whether \`s[i]\` matches \`p[j]\` (literal or \`.\`). If \`p[j + 1]\` is \`*\`, either skip the pair with \`dp(i, j + 2)\` or, when the first character matches, consume one string character with \`dp(i + 1, j)\`.

**Base case.** When the pattern is exhausted, the string must also be exhausted. This handles \`*\` as a pattern operator, not a wildcard by itself.`,
        time: `O(m * n)`,
        space: `O(m * n)`,
        python: `class Solution:
    def isMatch(self, s: str, p: str) -> bool:
        @lru_cache(None)
        def dp(i: int, j: int) -> bool:
            if j == len(p):
                return i == len(s)
            first = i < len(s) and (p[j] == s[i] or p[j] == '.')
            if j + 1 < len(p) and p[j + 1] == '*':
                return dp(i, j + 2) or (first and dp(i + 1, j))
            return first and dp(i + 1, j + 1)
        return dp(0, 0)
`,
        cpp: `class Solution {
public:
    bool isMatch(string s, string p) {
        int m = s.size(), n = p.size();
        vector<vector<int>> memo(m + 1, vector<int>(n + 1, -1));
        function<bool(int, int)> dp = [&](int i, int j) -> bool {
            if (j == n) return i == m;
            int& ans = memo[i][j];
            if (ans != -1) return ans;
            bool first = i < m && (p[j] == s[i] || p[j] == '.');
            bool ok;
            if (j + 1 < n && p[j + 1] == '*') ok = dp(i, j + 2) || (first && dp(i + 1, j));
            else ok = first && dp(i + 1, j + 1);
            ans = ok;
            return ok;
        };
        return dp(0, 0);
    }
};`
      },
      {
        title: `Bottom-up suffix table`,
        explanation: `**State.** \`dp[i][j]\` is true if \`s[i:]\` matches \`p[j:]\`.

**Steps.**
1. Set \`dp[m][n] = true\` for two empty suffixes.
2. Fill indices backwards so future suffix states are ready.
3. Apply the \`*\` skip/consume recurrence or the simple one-character match recurrence.

The whole-match requirement is captured by only accepting \`dp[0][0]\`; leftover pattern or string must be handled by the transitions.`,
        time: `O(m * n)`,
        space: `O(m * n)`,
        python: `class Solution:
    def isMatch(self, s: str, p: str) -> bool:
        m, n = len(s), len(p)
        dp = [[False] * (n + 1) for _ in range(m + 1)]
        dp[m][n] = True
        for i in range(m, -1, -1):
            for j in range(n - 1, -1, -1):
                first = i < m and (p[j] == s[i] or p[j] == '.')
                if j + 1 < n and p[j + 1] == '*':
                    dp[i][j] = dp[i][j + 2] or (first and dp[i + 1][j])
                else:
                    dp[i][j] = first and dp[i + 1][j + 1]
        return dp[0][0]
`,
        cpp: `class Solution {
public:
    bool isMatch(string s, string p) {
        int m = s.size(), n = p.size();
        vector<vector<char>> dp(m + 1, vector<char>(n + 1));
        dp[m][n] = true;
        for (int i = m; i >= 0; --i) {
            for (int j = n - 1; j >= 0; --j) {
                bool first = i < m && (p[j] == s[i] || p[j] == '.');
                if (j + 1 < n && p[j + 1] == '*') dp[i][j] = dp[i][j + 2] || (first && dp[i + 1][j]);
                else dp[i][j] = first && dp[i + 1][j + 1];
            }
        }
        return dp[0][0];
    }
};`
      }
    ],
    examples: [
      {
        input: `s = "aa", p = "a"`,
        output: `false`,
        explanation: `The pattern has only one \`a\`, so it cannot consume both characters.`
      },
      {
        input: `s = "aa", p = "a*"`,
        output: `true`,
        explanation: `\`a*\` may consume two \`a\` characters.`
      },
      {
        input: `s = "ab", p = ".*"`,
        output: `true`,
        explanation: `\`.\` can match either character and \`*\` can repeat it.`
      }
    ],
    tests: [
      {
        args: [`aa`, `a`],
        expected: false
      },
      {
        args: [`aa`, `a*`],
        expected: true
      },
      {
        args: [`ab`, `.*`],
        expected: true
      },
      {
        args: [`aab`, `c*a*b`],
        expected: true
      },
      {
        args: [`mississippi`, `mis*is*p*.`],
        expected: false
      },
      {
        args: [``, `c*`],
        expected: true
      },
      {
        args: [``, `.`],
        expected: false
      },
      {
        args: [`aaa`, `ab*a*c*a`],
        expected: true
      },
      {
        args: [`abcd`, `d*`],
        expected: false
      }
    ]
  }
]

export default problems
