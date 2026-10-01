import type { DsaProblem } from '../../types/content'

const problems: DsaProblem[] = [
  {
    "id": "climbing-stairs",
    "title": "Climbing Stairs",
    "number": 70,
    "difficulty": "Easy",
    "category": "1-D Dynamic Programming",
    "pattern": "Fibonacci DP",
    "description": "You are climbing to step n. Each move advances one or two steps. Return the number of distinct move sequences that land exactly on the top.",
    "examples": [
      {
        "input": "n = 2",
        "output": "2",
        "explanation": "Use 1+1 or one 2-step move."
      },
      {
        "input": "n = 3",
        "output": "3"
      },
      {
        "input": "n = 1",
        "output": "1"
      }
    ],
    "constraints": ["1 <= n <= 45", "Moves are exactly 1 or 2 steps", "The answer fits in a signed 32-bit integer"],
    "hints": [
      "Count ways from a step to the top.",
      "The first move is one or two steps.",
      "This is a Fibonacci-style recurrence."
    ],
    "signature": {
      "kind": "function",
      "name": "climbStairs",
      "params": [
        {
          "name": "n",
          "type": "int"
        }
      ],
      "returns": "int"
    },
    "tests": [
      {
        "args": [2],
        "expected": 2
      },
      {
        "args": [3],
        "expected": 3
      },
      {
        "args": [1],
        "expected": 1
      },
      {
        "args": [4],
        "expected": 5
      },
      {
        "args": [5],
        "expected": 8
      },
      {
        "args": [10],
        "expected": 89
      },
      {
        "args": [20],
        "expected": 10946
      },
      {
        "args": [45],
        "expected": 1836311903
      }
    ],
    "solutions": [
      {
        "title": "Top-down memoization",
        "explanation": `**Intuition:** A climb from a step starts with either a one-step or two-step move.

**State and recurrence:** f(i) counts ways to reach n from step i. f(i)=f(i+1)+f(i+2), with f(n)=1 and f(i>n)=0.

**Steps:**
1. Define the state around one index, suffix, amount, or target.
2. Evaluate choices using already solved smaller states.
3. Return the state representing the full input.

**Correctness:** The recurrence partitions all valid answers by the next local choice, and each choice delegates to an optimal subproblem. By induction over the fill order or memoized recursion, every state is optimal, so the returned state is optimal for the original input.

**Pitfalls:** The finish step is a position, not a paid stair.`,
        "time": "O(n)",
        "space": "O(n)",
        "python": `class Solution:
    def climbStairs(self, n: int) -> int:
        @lru_cache(None)
        def f(i):
            if i == n: return 1
            if i > n: return 0
            return f(i + 1) + f(i + 2)
        return f(0)
`,
        "cpp": `class Solution { public:
    int climbStairs(int n) {
        vector<int> memo(n + 2, -1);
        function<int(int)> f = [&](int i) { if (i == n) return 1; if (i > n) return 0; int& a = memo[i]; if (a != -1) return a; return a = f(i + 1) + f(i + 2); };
        return f(0);
    }
};`
      },
      {
        "title": "Bottom-up tabulation",
        "explanation": `**Intuition:** Fill the same number of suffix climbs from the top down to zero.

**State and recurrence:** dp[i] counts ways to finish from step i. dp[i]=dp[i+1]+dp[i+2].

**Steps:**
1. Define the state around one index, suffix, amount, or target.
2. Evaluate choices using already solved smaller states.
3. Return the state representing the full input.

**Correctness:** The recurrence partitions all valid answers by the next local choice, and each choice delegates to an optimal subproblem. By induction over the fill order or memoized recursion, every state is optimal, so the returned state is optimal for the original input.

**Pitfalls:** Keep two extra cells for the beyond-top base case.`,
        "time": "O(n)",
        "space": "O(n)",
        "python": `class Solution:
    def climbStairs(self, n: int) -> int:
        dp = [0] * (n + 2)
        dp[n] = 1
        for i in range(n - 1, -1, -1):
            dp[i] = dp[i + 1] + dp[i + 2]
        return dp[0]
`,
        "cpp": `class Solution { public:
    int climbStairs(int n) { vector<int> dp(n + 2); dp[n] = 1; for (int i = n - 1; i >= 0; --i) dp[i] = dp[i + 1] + dp[i + 2]; return dp[0]; }
};`
      },
      {
        "title": "Space-optimized Fibonacci",
        "explanation": `**Intuition:** Only the next two DP states are needed at any step.

**State and recurrence:** a and b represent dp[i+1] and dp[i+2]. cur=a+b, then shift left.

**Steps:**
1. Define the state around one index, suffix, amount, or target.
2. Evaluate choices using already solved smaller states.
3. Return the state representing the full input.

**Correctness:** The recurrence partitions all valid answers by the next local choice, and each choice delegates to an optimal subproblem. By induction over the fill order or memoized recursion, every state is optimal, so the returned state is optimal for the original input.

**Pitfalls:** Initialize dp[n]=1 and dp[n+1]=0.`,
        "time": "O(n)",
        "space": "O(1)",
        "python": `class Solution:
    def climbStairs(self, n: int) -> int:
        a, b = 1, 0
        for _ in range(n):
            a, b = a + b, a
        return a
`,
        "cpp": `class Solution { public:
    int climbStairs(int n) { int a = 1, b = 0; for (int i = 0; i < n; ++i) { int c = a + b; b = a; a = c; } return a; }
};`
      }
    ],
    "viz": "dp-grid"
  },
  {
    "id": "min-cost-climbing-stairs",
    "title": "Min Cost Climbing Stairs",
    "number": 746,
    "difficulty": "Easy",
    "category": "1-D Dynamic Programming",
    "pattern": "Fibonacci DP",
    "description": "Each stair has a cost paid when you step on it. You may start at stair 0 or 1 and climb one or two stairs at a time. Return the minimum cost to step beyond the last stair.",
    "examples": [
      {
        "input": "cost = [10,15,20]",
        "output": "15"
      },
      {
        "input": "cost = [1,100,1,1,1,100,1,1,100,1]",
        "output": "6"
      },
      {
        "input": "cost = [0,0,0,1]",
        "output": "0"
      }
    ],
    "constraints": [
      "2 <= cost.length <= 1000",
      "0 <= cost[i] <= 999",
      "You may start at index 0 or index 1",
      "The top is just beyond the final index"
    ],
    "hints": [
      "The top itself is free.",
      "From each stair only two next choices exist.",
      "The answer can finish from either of the last two stairs."
    ],
    "signature": {
      "kind": "function",
      "name": "minCostClimbingStairs",
      "params": [
        {
          "name": "cost",
          "type": "int[]"
        }
      ],
      "returns": "int"
    },
    "tests": [
      {
        "args": [
          [10, 15, 20]
        ],
        "expected": 15
      },
      {
        "args": [
          [1, 100, 1, 1, 1, 100, 1, 1, 100, 1]
        ],
        "expected": 6
      },
      {
        "args": [
          [0, 0, 0, 1]
        ],
        "expected": 0
      },
      {
        "args": [
          [5, 10]
        ],
        "expected": 5
      },
      {
        "args": [
          [10, 15, 20, 1]
        ],
        "expected": 16
      },
      {
        "args": [
          [1, 2, 3, 4, 5]
        ],
        "expected": 6
      },
      {
        "args": [
          [100, 1, 1, 100, 1]
        ],
        "expected": 3
      },
      {
        "args": [
          [1, 1000, 1, 1, 1, 1000, 1]
        ],
        "expected": 4
      }
    ],
    "solutions": [
      {
        "title": "Top-down memoization",
        "explanation": `**Intuition:** From a stair, pay its cost and choose the cheaper next jump.

**State and recurrence:** f(i) is minimum cost to reach the top from stair i. f(i)=cost[i]+min(f(i+1),f(i+2)); f(i)=0 past the array.

**Steps:**
1. Define the state around one index, suffix, amount, or target.
2. Evaluate choices using already solved smaller states.
3. Return the state representing the full input.

**Correctness:** The recurrence partitions all valid answers by the next local choice, and each choice delegates to an optimal subproblem. By induction over the fill order or memoized recursion, every state is optimal, so the returned state is optimal for the original input.

**Pitfalls:** The climber may start at index 0 or 1.`,
        "time": "O(n)",
        "space": "O(n)",
        "python": `class Solution:
    def minCostClimbingStairs(self, cost: List[int]) -> int:
        n = len(cost)
        @lru_cache(None)
        def f(i):
            if i >= n: return 0
            return cost[i] + min(f(i + 1), f(i + 2))
        return min(f(0), f(1))
`,
        "cpp": `class Solution { public:
    int minCostClimbingStairs(vector<int>& cost) { int n = cost.size(); vector<int> memo(n, -1); function<int(int)> f = [&](int i) { if (i >= n) return 0; int& a = memo[i]; if (a != -1) return a; return a = cost[i] + min(f(i + 1), f(i + 2)); }; return min(f(0), f(1)); }
};`
      },
      {
        "title": "Bottom-up tabulation",
        "explanation": `**Intuition:** Compute the cheapest cost to land on each stair.

**State and recurrence:** dp[i] is minimum cost paid when reaching stair i. dp[i]=cost[i]+min(dp[i-1],dp[i-2]).

**Steps:**
1. Define the state around one index, suffix, amount, or target.
2. Evaluate choices using already solved smaller states.
3. Return the state representing the full input.

**Correctness:** The recurrence partitions all valid answers by the next local choice, and each choice delegates to an optimal subproblem. By induction over the fill order or memoized recursion, every state is optimal, so the returned state is optimal for the original input.

**Pitfalls:** The answer is the cheaper of the last two paid stairs.`,
        "time": "O(n)",
        "space": "O(n)",
        "python": `class Solution:
    def minCostClimbingStairs(self, cost: List[int]) -> int:
        dp = cost[:]
        for i in range(2, len(cost)):
            dp[i] += min(dp[i - 1], dp[i - 2])
        return min(dp[-1], dp[-2])
`,
        "cpp": `class Solution { public:
    int minCostClimbingStairs(vector<int>& cost) { vector<int> dp = cost; for (int i = 2; i < (int)dp.size(); ++i) dp[i] += min(dp[i - 1], dp[i - 2]); return min(dp[dp.size() - 1], dp[dp.size() - 2]); }
};`
      },
      {
        "title": "Space-optimized tabulation",
        "explanation": `**Intuition:** The landing-cost recurrence only reads two previous stairs.

**State and recurrence:** prev2 and prev1 are dp[i-2] and dp[i-1]. cur=cost[i]+min(prev1,prev2).

**Steps:**
1. Define the state around one index, suffix, amount, or target.
2. Evaluate choices using already solved smaller states.
3. Return the state representing the full input.

**Correctness:** The recurrence partitions all valid answers by the next local choice, and each choice delegates to an optimal subproblem. By induction over the fill order or memoized recursion, every state is optimal, so the returned state is optimal for the original input.

**Pitfalls:** Length is at least two, so initialize with the first two costs.`,
        "time": "O(n)",
        "space": "O(1)",
        "python": `class Solution:
    def minCostClimbingStairs(self, cost: List[int]) -> int:
        prev2, prev1 = cost[0], cost[1]
        for i in range(2, len(cost)):
            prev2, prev1 = prev1, cost[i] + min(prev1, prev2)
        return min(prev1, prev2)
`,
        "cpp": `class Solution { public:
    int minCostClimbingStairs(vector<int>& cost) { int p2 = cost[0], p1 = cost[1]; for (int i = 2; i < (int)cost.size(); ++i) { int c = cost[i] + min(p1, p2); p2 = p1; p1 = c; } return min(p1, p2); }
};`
      }
    ],
    "viz": "dp-grid"
  },
  {
    "id": "house-robber",
    "title": "House Robber",
    "number": 198,
    "difficulty": "Medium",
    "category": "1-D Dynamic Programming",
    "pattern": "Take or Skip DP",
    "description": "A line of houses contains money, but robbing adjacent houses triggers an alarm. Return the maximum amount you can rob while never taking two neighboring houses.",
    "examples": [
      {
        "input": "nums = [1,2,3,1]",
        "output": "4"
      },
      {
        "input": "nums = [2,7,9,3,1]",
        "output": "12"
      },
      {
        "input": "nums = [2,1,1,2]",
        "output": "4"
      }
    ],
    "constraints": ["1 <= nums.length <= 100", "0 <= nums[i] <= 400", "Adjacent houses cannot both be selected"],
    "hints": [
      "At each house decide take or skip.",
      "Taking house i moves you to i+2.",
      "Only two future DP values are needed."
    ],
    "signature": {
      "kind": "function",
      "name": "rob",
      "params": [
        {
          "name": "nums",
          "type": "int[]"
        }
      ],
      "returns": "int"
    },
    "tests": [
      {
        "args": [
          [1, 2, 3, 1]
        ],
        "expected": 4
      },
      {
        "args": [
          [2, 7, 9, 3, 1]
        ],
        "expected": 12
      },
      {
        "args": [
          [2, 1, 1, 2]
        ],
        "expected": 4
      },
      {
        "args": [
          [5]
        ],
        "expected": 5
      },
      {
        "args": [
          [2, 1]
        ],
        "expected": 2
      },
      {
        "args": [
          [0, 0, 0]
        ],
        "expected": 0
      },
      {
        "args": [
          [10, 1, 1, 10]
        ],
        "expected": 20
      },
      {
        "args": [
          [4, 1, 2, 7, 5, 3, 1]
        ],
        "expected": 14
      }
    ],
    "solutions": [
      {
        "title": "Top-down memoization",
        "explanation": `**Intuition:** Each house creates a take-or-skip decision.

**State and recurrence:** f(i) is best loot from i to the end. f(i)=max(nums[i]+f(i+2), f(i+1)).

**Steps:**
1. Define the state around one index, suffix, amount, or target.
2. Evaluate choices using already solved smaller states.
3. Return the state representing the full input.

**Correctness:** The recurrence partitions all valid answers by the next local choice, and each choice delegates to an optimal subproblem. By induction over the fill order or memoized recursion, every state is optimal, so the returned state is optimal for the original input.

**Pitfalls:** Do not let a take branch also use the adjacent house.`,
        "time": "O(n)",
        "space": "O(n)",
        "python": `class Solution:
    def rob(self, nums: List[int]) -> int:
        @lru_cache(None)
        def f(i):
            if i >= len(nums): return 0
            return max(nums[i] + f(i + 2), f(i + 1))
        return f(0)
`,
        "cpp": `class Solution { public:
    int rob(vector<int>& nums) { vector<int> memo(nums.size(), -1); function<int(int)> f = [&](int i) { if (i >= (int)nums.size()) return 0; int& a = memo[i]; if (a != -1) return a; return a = max(nums[i] + f(i + 2), f(i + 1)); }; return f(0); }
};`
      },
      {
        "title": "Bottom-up tabulation",
        "explanation": `**Intuition:** Fill suffix best values from right to left.

**State and recurrence:** dp[i] is best loot from suffix i. dp[i]=max(nums[i]+dp[i+2],dp[i+1]).

**Steps:**
1. Define the state around one index, suffix, amount, or target.
2. Evaluate choices using already solved smaller states.
3. Return the state representing the full input.

**Correctness:** The recurrence partitions all valid answers by the next local choice, and each choice delegates to an optimal subproblem. By induction over the fill order or memoized recursion, every state is optimal, so the returned state is optimal for the original input.

**Pitfalls:** Use a table two cells longer for bounds.`,
        "time": "O(n)",
        "space": "O(n)",
        "python": `class Solution:
    def rob(self, nums: List[int]) -> int:
        dp = [0] * (len(nums) + 2)
        for i in range(len(nums) - 1, -1, -1):
            dp[i] = max(nums[i] + dp[i + 2], dp[i + 1])
        return dp[0]
`,
        "cpp": `class Solution { public:
    int rob(vector<int>& nums) { vector<int> dp(nums.size() + 2); for (int i = nums.size() - 1; i >= 0; --i) dp[i] = max(nums[i] + dp[i + 2], dp[i + 1]); return dp[0]; }
};`
      },
      {
        "title": "Space-optimized take or skip",
        "explanation": `**Intuition:** Only the next one and next two suffix answers are needed.

**State and recurrence:** next1 and next2 represent dp[i+1] and dp[i+2]. cur=max(nums[i]+next2,next1).

**Steps:**
1. Define the state around one index, suffix, amount, or target.
2. Evaluate choices using already solved smaller states.
3. Return the state representing the full input.

**Correctness:** The recurrence partitions all valid answers by the next local choice, and each choice delegates to an optimal subproblem. By induction over the fill order or memoized recursion, every state is optimal, so the returned state is optimal for the original input.

**Pitfalls:** Compute cur before shifting the variables.`,
        "time": "O(n)",
        "space": "O(1)",
        "python": `class Solution:
    def rob(self, nums: List[int]) -> int:
        next1 = next2 = 0
        for x in reversed(nums):
            next1, next2 = max(x + next2, next1), next1
        return next1
`,
        "cpp": `class Solution { public:
    int rob(vector<int>& nums) { int n1 = 0, n2 = 0; for (int i = nums.size() - 1; i >= 0; --i) { int c = max(nums[i] + n2, n1); n2 = n1; n1 = c; } return n1; }
};`
      }
    ],
    "viz": "dp-grid"
  },
  {
    "id": "house-robber-ii",
    "title": "House Robber II",
    "number": 213,
    "difficulty": "Medium",
    "category": "1-D Dynamic Programming",
    "pattern": "Circular DP",
    "description": "The houses are arranged in a circle, making the first and last houses adjacent. Return the maximum amount you can rob without choosing neighboring houses.",
    "examples": [
      {
        "input": "nums = [2,3,2]",
        "output": "3"
      },
      {
        "input": "nums = [1,2,3,1]",
        "output": "4"
      },
      {
        "input": "nums = [1,2,3]",
        "output": "3"
      }
    ],
    "constraints": ["1 <= nums.length <= 100", "0 <= nums[i] <= 1000", "House 0 and house n-1 are adjacent"],
    "hints": [
      "A valid plan excludes at least one endpoint.",
      "Solve two linear robber problems.",
      "Handle one house separately."
    ],
    "signature": {
      "kind": "function",
      "name": "rob",
      "params": [
        {
          "name": "nums",
          "type": "int[]"
        }
      ],
      "returns": "int"
    },
    "tests": [
      {
        "args": [
          [2, 3, 2]
        ],
        "expected": 3
      },
      {
        "args": [
          [1, 2, 3, 1]
        ],
        "expected": 4
      },
      {
        "args": [
          [1, 2, 3]
        ],
        "expected": 3
      },
      {
        "args": [
          [5]
        ],
        "expected": 5
      },
      {
        "args": [
          [1, 1]
        ],
        "expected": 1
      },
      {
        "args": [
          [1, 2, 3, 1, 5]
        ],
        "expected": 8
      },
      {
        "args": [
          [200, 3, 140, 20, 10]
        ],
        "expected": 340
      },
      {
        "args": [
          [0, 0, 0]
        ],
        "expected": 0
      }
    ],
    "solutions": [
      {
        "title": "Top-down on two ranges",
        "explanation": `**Intuition:** A circular solution excludes either the first or the last house.

**State and recurrence:** f(i,hi) is best loot from i through hi. Use the linear recurrence and return max(range 0..n-2, range 1..n-1).

**Steps:**
1. Define the state around one index, suffix, amount, or target.
2. Evaluate choices using already solved smaller states.
3. Return the state representing the full input.

**Correctness:** The recurrence partitions all valid answers by the next local choice, and each choice delegates to an optimal subproblem. By induction over the fill order or memoized recursion, every state is optimal, so the returned state is optimal for the original input.

**Pitfalls:** Handle the single-house case before splitting.`,
        "time": "O(n)",
        "space": "O(n)",
        "python": `class Solution:
    def rob(self, nums: List[int]) -> int:
        if len(nums) == 1: return nums[0]
        def solve(lo, hi):
            @lru_cache(None)
            def f(i):
                if i > hi: return 0
                return max(nums[i] + f(i + 2), f(i + 1))
            return f(lo)
        return max(solve(0, len(nums) - 2), solve(1, len(nums) - 1))
`,
        "cpp": `class Solution { public:
    int rob(vector<int>& nums) { if (nums.size() == 1) return nums[0]; auto run = [&](int lo, int hi) { vector<int> memo(nums.size(), -1); function<int(int)> f = [&](int i) { if (i > hi) return 0; int& a = memo[i]; if (a != -1) return a; return a = max(nums[i] + f(i + 2), f(i + 1)); }; return f(lo); }; return max(run(0, nums.size() - 2), run(1, nums.size() - 1)); }
};`
      },
      {
        "title": "Bottom-up range DP",
        "explanation": `**Intuition:** Solve the two linear arrays created by excluding one endpoint.

**State and recurrence:** dp[i] is best loot from i to the inclusive range end. dp[i]=max(nums[i]+dp[i+2],dp[i+1]).

**Steps:**
1. Define the state around one index, suffix, amount, or target.
2. Evaluate choices using already solved smaller states.
3. Return the state representing the full input.

**Correctness:** The recurrence partitions all valid answers by the next local choice, and each choice delegates to an optimal subproblem. By induction over the fill order or memoized recursion, every state is optimal, so the returned state is optimal for the original input.

**Pitfalls:** The two ranges cover every valid circular selection.`,
        "time": "O(n)",
        "space": "O(n)",
        "python": `class Solution:
    def rob(self, nums: List[int]) -> int:
        if len(nums) == 1: return nums[0]
        def solve(lo, hi):
            dp = [0] * (len(nums) + 2)
            for i in range(hi, lo - 1, -1):
                dp[i] = max(nums[i] + dp[i + 2], dp[i + 1])
            return dp[lo]
        return max(solve(0, len(nums) - 2), solve(1, len(nums) - 1))
`,
        "cpp": `class Solution { public:
    int run(vector<int>& nums, int lo, int hi) { vector<int> dp(nums.size() + 2); for (int i = hi; i >= lo; --i) dp[i] = max(nums[i] + dp[i + 2], dp[i + 1]); return dp[lo]; }
    int rob(vector<int>& nums) { if (nums.size() == 1) return nums[0]; return max(run(nums, 0, nums.size() - 2), run(nums, 1, nums.size() - 1)); }
};`
      },
      {
        "title": "Space-optimized ranges",
        "explanation": `**Intuition:** Each linear range can be solved with two rolling suffix values.

**State and recurrence:** next1 and next2 are future range answers. cur=max(nums[i]+next2,next1).

**Steps:**
1. Define the state around one index, suffix, amount, or target.
2. Evaluate choices using already solved smaller states.
3. Return the state representing the full input.

**Correctness:** The recurrence partitions all valid answers by the next local choice, and each choice delegates to an optimal subproblem. By induction over the fill order or memoized recursion, every state is optimal, so the returned state is optimal for the original input.

**Pitfalls:** Reset the rolling variables for each range.`,
        "time": "O(n)",
        "space": "O(1)",
        "python": `class Solution:
    def rob(self, nums: List[int]) -> int:
        if len(nums) == 1: return nums[0]
        def solve(lo, hi):
            a = b = 0
            for i in range(hi, lo - 1, -1):
                a, b = max(nums[i] + b, a), a
            return a
        return max(solve(0, len(nums) - 2), solve(1, len(nums) - 1))
`,
        "cpp": `class Solution { public:
    int run(vector<int>& nums, int lo, int hi) { int a = 0, b = 0; for (int i = hi; i >= lo; --i) { int c = max(nums[i] + b, a); b = a; a = c; } return a; }
    int rob(vector<int>& nums) { if (nums.size() == 1) return nums[0]; return max(run(nums, 0, nums.size() - 2), run(nums, 1, nums.size() - 1)); }
};`
      }
    ],
    "viz": "dp-grid"
  },
  {
    "id": "longest-palindromic-substring",
    "title": "Longest Palindromic Substring",
    "number": 5,
    "difficulty": "Medium",
    "category": "1-D Dynamic Programming",
    "pattern": "Interval DP",
    "description": "Return any longest contiguous substring of s that reads the same forward and backward. If several substrings tie, any tied answer is valid.",
    "examples": [
      {
        "input": "s = \"babad\"",
        "output": "\"bab\" or \"aba\""
      },
      {
        "input": "s = \"cbbd\"",
        "output": "\"bb\""
      },
      {
        "input": "s = \"a\"",
        "output": "\"a\""
      }
    ],
    "constraints": [
      "1 <= s.length <= 1000",
      "s contains digits and English letters",
      "Return a substring, not a subsequence"
    ],
    "hints": [
      "A palindrome remains one after removing matching ends.",
      "Define whether an interval is palindromic.",
      "Center expansion removes the table."
    ],
    "signature": {
      "kind": "function",
      "name": "longestPalindrome",
      "params": [
        {
          "name": "s",
          "type": "string"
        }
      ],
      "returns": "string"
    },
    "tests": [
      {
        "args": ["babad"],
        "expected": ["bab", "aba"]
      },
      {
        "args": ["cbbd"],
        "expected": ["bb"]
      },
      {
        "args": ["a"],
        "expected": ["a"]
      },
      {
        "args": ["ac"],
        "expected": ["a", "c"]
      },
      {
        "args": ["racecar"],
        "expected": ["racecar"]
      },
      {
        "args": ["forgeeksskeegfor"],
        "expected": ["geeksskeeg"]
      },
      {
        "args": ["aaaa"],
        "expected": ["aaaa"]
      },
      {
        "args": ["bananas"],
        "expected": ["anana"]
      }
    ],
    "solutions": [
      {
        "title": "Top-down palindrome memo",
        "explanation": `**Intuition:** Cache whether intervals are palindromes, then search lengths from longest to shortest.

**State and recurrence:** pal(l,r) is true if s[l..r] is palindromic. pal(l,r)=s[l]==s[r] and pal(l+1,r-1).

**Steps:**
1. Define the state around one index, suffix, amount, or target.
2. Evaluate choices using already solved smaller states.
3. Return the state representing the full input.

**Correctness:** The recurrence partitions all valid answers by the next local choice, and each choice delegates to an optimal subproblem. By induction over the fill order or memoized recursion, every state is optimal, so the returned state is optimal for the original input.

**Pitfalls:** Return any longest palindrome; ties are accepted.`,
        "time": "O(n^2)",
        "space": "O(n^2)",
        "python": `class Solution:
    def longestPalindrome(self, s: str) -> str:
        @lru_cache(None)
        def pal(l, r):
            return l >= r or (s[l] == s[r] and pal(l + 1, r - 1))
        for length in range(len(s), 0, -1):
            for l in range(len(s) - length + 1):
                if pal(l, l + length - 1):
                    return s[l:l + length]
        return ""
`,
        "cpp": `class Solution { public:
    string longestPalindrome(string s) { int n = s.size(); vector<vector<int>> memo(n, vector<int>(n, -1)); function<int(int,int)> pal = [&](int l, int r) { if (l >= r) return 1; int& a = memo[l][r]; if (a != -1) return a; return a = (s[l] == s[r] && pal(l + 1, r - 1)); }; for (int len = n; len >= 1; --len) for (int l = 0; l + len <= n; ++l) if (pal(l, l + len - 1)) return s.substr(l, len); return string(); }
};`
      },
      {
        "title": "Bottom-up interval DP",
        "explanation": `**Intuition:** Fill palindrome truth values by increasing substring length.

**State and recurrence:** dp[l][r] says whether s[l..r] is a palindrome. dp[l][r]=s[l]==s[r] and (len<=2 or dp[l+1][r-1]).

**Steps:**
1. Define the state around one index, suffix, amount, or target.
2. Evaluate choices using already solved smaller states.
3. Return the state representing the full input.

**Correctness:** The recurrence partitions all valid answers by the next local choice, and each choice delegates to an optimal subproblem. By induction over the fill order or memoized recursion, every state is optimal, so the returned state is optimal for the original input.

**Pitfalls:** Handle length one and two before reading the inner interval.`,
        "time": "O(n^2)",
        "space": "O(n^2)",
        "python": `class Solution:
    def longestPalindrome(self, s: str) -> str:
        n = len(s); dp = [[False] * n for _ in range(n)]; best = (0, 1)
        for length in range(1, n + 1):
            for l in range(n - length + 1):
                r = l + length - 1
                dp[l][r] = s[l] == s[r] and (length <= 2 or dp[l + 1][r - 1])
                if dp[l][r] and length > best[1]: best = (l, length)
        return s[best[0]:best[0] + best[1]]
`,
        "cpp": `class Solution { public:
    string longestPalindrome(string s) { int n = s.size(), bs = 0, bl = 1; vector<vector<int>> dp(n, vector<int>(n)); for (int len = 1; len <= n; ++len) for (int l = 0; l + len <= n; ++l) { int r = l + len - 1; dp[l][r] = s[l] == s[r] && (len <= 2 || dp[l + 1][r - 1]); if (dp[l][r] && len > bl) { bs = l; bl = len; } } return s.substr(bs, bl); }
};`
      },
      {
        "title": "Expand around centers",
        "explanation": `**Intuition:** Every palindrome has a unique odd or even center.

**State and recurrence:** The current left/right boundary is the state. While boundaries match, expand outward and update the best interval.

**Steps:**
1. Define the state around one index, suffix, amount, or target.
2. Evaluate choices using already solved smaller states.
3. Return the state representing the full input.

**Correctness:** The recurrence partitions all valid answers by the next local choice, and each choice delegates to an optimal subproblem. By induction over the fill order or memoized recursion, every state is optimal, so the returned state is optimal for the original input.

**Pitfalls:** Remember centers between characters for even palindromes.`,
        "time": "O(n^2)",
        "space": "O(1)",
        "python": `class Solution:
    def longestPalindrome(self, s: str) -> str:
        best = ""
        for i in range(len(s)):
            for l, r in ((i, i), (i, i + 1)):
                while l >= 0 and r < len(s) and s[l] == s[r]:
                    l -= 1; r += 1
                if r - l - 1 > len(best): best = s[l + 1:r]
        return best
`,
        "cpp": `class Solution { public:
    string longestPalindrome(string s) { int bs = 0, bl = 0, n = s.size(); for (int i = 0; i < n; ++i) for (int k = 0; k < 2; ++k) { int l = i, r = i + k; while (l >= 0 && r < n && s[l] == s[r]) { --l; ++r; } if (r - l - 1 > bl) { bl = r - l - 1; bs = l + 1; } } return s.substr(bs, bl); }
};`
      }
    ],
    "viz": "dp-grid",
    "compare": "anyOf"
  },
  {
    "id": "palindromic-substrings",
    "title": "Palindromic Substrings",
    "number": 647,
    "difficulty": "Medium",
    "category": "1-D Dynamic Programming",
    "pattern": "Interval DP",
    "description": "Count palindromic contiguous substrings of s. Equal text at different positions is counted once for each distinct interval.",
    "examples": [
      {
        "input": "s = \"abc\"",
        "output": "3"
      },
      {
        "input": "s = \"aaa\"",
        "output": "6"
      },
      {
        "input": "s = \"aba\"",
        "output": "4"
      }
    ],
    "constraints": [
      "1 <= s.length <= 1000",
      "s contains lowercase English letters",
      "Different start or end positions count separately"
    ],
    "hints": [
      "Every single character counts.",
      "Use matching ends plus a palindromic middle.",
      "Each center expansion contributes one palindrome per successful radius."
    ],
    "signature": {
      "kind": "function",
      "name": "countSubstrings",
      "params": [
        {
          "name": "s",
          "type": "string"
        }
      ],
      "returns": "int"
    },
    "tests": [
      {
        "args": ["abc"],
        "expected": 3
      },
      {
        "args": ["aaa"],
        "expected": 6
      },
      {
        "args": ["aba"],
        "expected": 4
      },
      {
        "args": ["a"],
        "expected": 1
      },
      {
        "args": ["abccba"],
        "expected": 9
      },
      {
        "args": ["aaaaa"],
        "expected": 15
      },
      {
        "args": ["racecar"],
        "expected": 10
      },
      {
        "args": ["noon"],
        "expected": 6
      }
    ],
    "solutions": [
      {
        "title": "Top-down palindrome memo",
        "explanation": `**Intuition:** Count every interval whose cached palindrome query is true.

**State and recurrence:** pal(l,r) says whether s[l..r] is a palindrome. pal(l,r)=s[l]==s[r] and pal(l+1,r-1).

**Steps:**
1. Define the state around one index, suffix, amount, or target.
2. Evaluate choices using already solved smaller states.
3. Return the state representing the full input.

**Correctness:** The recurrence partitions all valid answers by the next local choice, and each choice delegates to an optimal subproblem. By induction over the fill order or memoized recursion, every state is optimal, so the returned state is optimal for the original input.

**Pitfalls:** Each boundary pair is one substring.`,
        "time": "O(n^2)",
        "space": "O(n^2)",
        "python": `class Solution:
    def countSubstrings(self, s: str) -> int:
        @lru_cache(None)
        def pal(l, r):
            return l >= r or (s[l] == s[r] and pal(l + 1, r - 1))
        return sum(pal(l, r) for l in range(len(s)) for r in range(l, len(s)))
`,
        "cpp": `class Solution { public:
    int countSubstrings(string s) { int n = s.size(), ans = 0; vector<vector<int>> memo(n, vector<int>(n, -1)); function<int(int,int)> pal = [&](int l, int r) { if (l >= r) return 1; int& a = memo[l][r]; if (a != -1) return a; return a = (s[l] == s[r] && pal(l + 1, r - 1)); }; for (int l = 0; l < n; ++l) for (int r = l; r < n; ++r) ans += pal(l, r); return ans; }
};`
      },
      {
        "title": "Bottom-up interval DP",
        "explanation": `**Intuition:** Build palindrome truth values and count true entries.

**State and recurrence:** dp[l][r] says whether s[l..r] is a palindrome. dp[l][r]=s[l]==s[r] and (len<=2 or dp[l+1][r-1]).

**Steps:**
1. Define the state around one index, suffix, amount, or target.
2. Evaluate choices using already solved smaller states.
3. Return the state representing the full input.

**Correctness:** The recurrence partitions all valid answers by the next local choice, and each choice delegates to an optimal subproblem. By induction over the fill order or memoized recursion, every state is optimal, so the returned state is optimal for the original input.

**Pitfalls:** Count intervals, not unique text values.`,
        "time": "O(n^2)",
        "space": "O(n^2)",
        "python": `class Solution:
    def countSubstrings(self, s: str) -> int:
        n = len(s); dp = [[False] * n for _ in range(n)]; ans = 0
        for length in range(1, n + 1):
            for l in range(n - length + 1):
                r = l + length - 1
                dp[l][r] = s[l] == s[r] and (length <= 2 or dp[l + 1][r - 1])
                ans += dp[l][r]
        return ans
`,
        "cpp": `class Solution { public:
    int countSubstrings(string s) { int n = s.size(), ans = 0; vector<vector<int>> dp(n, vector<int>(n)); for (int len = 1; len <= n; ++len) for (int l = 0; l + len <= n; ++l) { int r = l + len - 1; dp[l][r] = s[l] == s[r] && (len <= 2 || dp[l + 1][r - 1]); ans += dp[l][r]; } return ans; }
};`
      },
      {
        "title": "Expand around centers",
        "explanation": `**Intuition:** Count successful expansions from all odd and even centers.

**State and recurrence:** The expansion boundary is the state. Every match creates one palindrome, then boundaries move outward.

**Steps:**
1. Define the state around one index, suffix, amount, or target.
2. Evaluate choices using already solved smaller states.
3. Return the state representing the full input.

**Correctness:** The recurrence partitions all valid answers by the next local choice, and each choice delegates to an optimal subproblem. By induction over the fill order or memoized recursion, every state is optimal, so the returned state is optimal for the original input.

**Pitfalls:** Use both center types.`,
        "time": "O(n^2)",
        "space": "O(1)",
        "python": `class Solution:
    def countSubstrings(self, s: str) -> int:
        ans = 0
        for i in range(len(s)):
            for l, r in ((i, i), (i, i + 1)):
                while l >= 0 and r < len(s) and s[l] == s[r]:
                    ans += 1; l -= 1; r += 1
        return ans
`,
        "cpp": `class Solution { public:
    int countSubstrings(string s) { int n = s.size(), ans = 0; for (int i = 0; i < n; ++i) for (int k = 0; k < 2; ++k) { int l = i, r = i + k; while (l >= 0 && r < n && s[l] == s[r]) { ++ans; --l; ++r; } } return ans; }
};`
      }
    ],
    "viz": "dp-grid"
  },
  {
    "id": "decode-ways",
    "title": "Decode Ways",
    "number": 91,
    "difficulty": "Medium",
    "category": "1-D Dynamic Programming",
    "pattern": "String DP",
    "description": "Digits map to letters using values 1 through 26. Return how many ways the digit string can be split into valid letter tokens; tokens cannot start with zero.",
    "examples": [
      {
        "input": "s = \"12\"",
        "output": "2"
      },
      {
        "input": "s = \"226\"",
        "output": "3"
      },
      {
        "input": "s = \"06\"",
        "output": "0"
      }
    ],
    "constraints": [
      "1 <= s.length <= 100",
      "s contains only digits",
      "Valid codes are 1 through 26",
      "No token may have a leading zero"
    ],
    "hints": [
      "Look at decodings of each suffix.",
      "At a position, take one digit and sometimes two.",
      "Zero is valid only inside 10 or 20."
    ],
    "signature": {
      "kind": "function",
      "name": "numDecodings",
      "params": [
        {
          "name": "s",
          "type": "string"
        }
      ],
      "returns": "int"
    },
    "tests": [
      {
        "args": ["12"],
        "expected": 2
      },
      {
        "args": ["226"],
        "expected": 3
      },
      {
        "args": ["06"],
        "expected": 0
      },
      {
        "args": ["0"],
        "expected": 0
      },
      {
        "args": ["10"],
        "expected": 1
      },
      {
        "args": ["11106"],
        "expected": 2
      },
      {
        "args": ["27"],
        "expected": 1
      },
      {
        "args": ["2101"],
        "expected": 1
      }
    ],
    "solutions": [
      {
        "title": "Top-down memoization",
        "explanation": `**Intuition:** A suffix can decode by taking one valid digit or one valid two-digit number.

**State and recurrence:** f(i) counts decodings of s[i:]. If s[i] is 0, f(i)=0; otherwise f(i)=f(i+1)+f(i+2) when the pair is <=26.

**Steps:**
1. Define the state around one index, suffix, amount, or target.
2. Evaluate choices using already solved smaller states.
3. Return the state representing the full input.

**Correctness:** The recurrence partitions all valid answers by the next local choice, and each choice delegates to an optimal subproblem. By induction over the fill order or memoized recursion, every state is optimal, so the returned state is optimal for the original input.

**Pitfalls:** A leading zero is never a token.`,
        "time": "O(n)",
        "space": "O(n)",
        "python": `class Solution:
    def numDecodings(self, s: str) -> int:
        @lru_cache(None)
        def f(i):
            if i == len(s): return 1
            if s[i] == '0': return 0
            ans = f(i + 1)
            if i + 1 < len(s) and int(s[i:i + 2]) <= 26: ans += f(i + 2)
            return ans
        return f(0)
`,
        "cpp": `class Solution { public:
    int numDecodings(string s) { int n = s.size(); vector<int> memo(n, -1); function<int(int)> f = [&](int i) { if (i == n) return 1; if (s[i] == '0') return 0; int& a = memo[i]; if (a != -1) return a; a = f(i + 1); if (i + 1 < n && stoi(s.substr(i, 2)) <= 26) a += f(i + 2); return a; }; return f(0); }
};`
      },
      {
        "title": "Bottom-up tabulation",
        "explanation": `**Intuition:** Fill decode counts from the end of the string.

**State and recurrence:** dp[i] is decodings of suffix i. Use the same one- and two-digit transitions as top-down.

**Steps:**
1. Define the state around one index, suffix, amount, or target.
2. Evaluate choices using already solved smaller states.
3. Return the state representing the full input.

**Correctness:** The recurrence partitions all valid answers by the next local choice, and each choice delegates to an optimal subproblem. By induction over the fill order or memoized recursion, every state is optimal, so the returned state is optimal for the original input.

**Pitfalls:** Set dp[n]=1 for the empty suffix.`,
        "time": "O(n)",
        "space": "O(n)",
        "python": `class Solution:
    def numDecodings(self, s: str) -> int:
        n = len(s); dp = [0] * (n + 2); dp[n] = 1
        for i in range(n - 1, -1, -1):
            if s[i] != '0':
                dp[i] = dp[i + 1]
                if i + 1 < n and int(s[i:i + 2]) <= 26: dp[i] += dp[i + 2]
        return dp[0]
`,
        "cpp": `class Solution { public:
    int numDecodings(string s) { int n = s.size(); vector<int> dp(n + 2); dp[n] = 1; for (int i = n - 1; i >= 0; --i) if (s[i] != '0') { dp[i] = dp[i + 1]; if (i + 1 < n && stoi(s.substr(i, 2)) <= 26) dp[i] += dp[i + 2]; } return dp[0]; }
};`
      },
      {
        "title": "Space-optimized suffix DP",
        "explanation": `**Intuition:** Only the next two suffix counts are needed.

**State and recurrence:** next1 and next2 are dp[i+1] and dp[i+2]. cur is next1 plus maybe next2, or zero for leading zero.

**Steps:**
1. Define the state around one index, suffix, amount, or target.
2. Evaluate choices using already solved smaller states.
3. Return the state representing the full input.

**Correctness:** The recurrence partitions all valid answers by the next local choice, and each choice delegates to an optimal subproblem. By induction over the fill order or memoized recursion, every state is optimal, so the returned state is optimal for the original input.

**Pitfalls:** Shift after computing cur.`,
        "time": "O(n)",
        "space": "O(1)",
        "python": `class Solution:
    def numDecodings(self, s: str) -> int:
        next1, next2 = 1, 0
        for i in range(len(s) - 1, -1, -1):
            cur = 0
            if s[i] != '0':
                cur = next1
                if i + 1 < len(s) and int(s[i:i + 2]) <= 26: cur += next2
            next1, next2 = cur, next1
        return next1
`,
        "cpp": `class Solution { public:
    int numDecodings(string s) { int a = 1, b = 0; for (int i = s.size() - 1; i >= 0; --i) { int c = 0; if (s[i] != '0') { c = a; if (i + 1 < (int)s.size() && stoi(s.substr(i, 2)) <= 26) c += b; } b = a; a = c; } return a; }
};`
      }
    ],
    "viz": "dp-grid"
  },
  {
    "id": "coin-change",
    "title": "Coin Change",
    "number": 322,
    "difficulty": "Medium",
    "category": "1-D Dynamic Programming",
    "pattern": "Unbounded Knapsack",
    "description": "Given coin denominations and a target amount, return the fewest coins needed to make exactly the amount. Coins may be reused without limit; return -1 if no combination works.",
    "examples": [
      {
        "input": "coins = [1,2,5], amount = 11",
        "output": "3"
      },
      {
        "input": "coins = [2], amount = 3",
        "output": "-1"
      },
      {
        "input": "coins = [1], amount = 0",
        "output": "0"
      }
    ],
    "constraints": [
      "1 <= coins.length <= 12",
      "1 <= coins[i] <= 2^31 - 1",
      "0 <= amount <= 10^4",
      "Each denomination has unlimited supply"
    ],
    "hints": [
      "Think about the last coin chosen.",
      "Let dp[a] be the best count for amount a.",
      "Use a large impossible sentinel."
    ],
    "signature": {
      "kind": "function",
      "name": "coinChange",
      "params": [
        {
          "name": "coins",
          "type": "int[]"
        },
        {
          "name": "amount",
          "type": "int"
        }
      ],
      "returns": "int"
    },
    "tests": [
      {
        "args": [
          [1, 2, 5],
          11
        ],
        "expected": 3
      },
      {
        "args": [
          [2],
          3
        ],
        "expected": -1
      },
      {
        "args": [
          [1],
          0
        ],
        "expected": 0
      },
      {
        "args": [
          [1],
          2
        ],
        "expected": 2
      },
      {
        "args": [
          [2, 5, 10, 1],
          27
        ],
        "expected": 4
      },
      {
        "args": [
          [3, 7],
          5
        ],
        "expected": -1
      },
      {
        "args": [
          [2, 4, 6],
          8
        ],
        "expected": 2
      },
      {
        "args": [
          [5, 7, 8],
          23
        ],
        "expected": 3
      }
    ],
    "solutions": [
      {
        "title": "Top-down memoization",
        "explanation": `**Intuition:** Try each coin as the next coin for the remaining amount.

**State and recurrence:** f(rem) is fewest coins needed for rem. f(0)=0; f(rem)=1+min(f(rem-c)).

**Steps:**
1. Define the state around one index, suffix, amount, or target.
2. Evaluate choices using already solved smaller states.
3. Return the state representing the full input.

**Correctness:** The recurrence partitions all valid answers by the next local choice, and each choice delegates to an optimal subproblem. By induction over the fill order or memoized recursion, every state is optimal, so the returned state is optimal for the original input.

**Pitfalls:** Convert the infinity sentinel to -1.`,
        "time": "O(amount * c)",
        "space": "O(amount)",
        "python": `class Solution:
    def coinChange(self, coins: List[int], amount: int) -> int:
        inf = amount + 1
        @lru_cache(None)
        def f(rem):
            if rem == 0: return 0
            if rem < 0: return inf
            return min((1 + f(rem - c) for c in coins), default=inf)
        ans = f(amount)
        return -1 if ans >= inf else ans
`,
        "cpp": `class Solution { public:
    int coinChange(vector<int>& coins, int amount) { int INF = amount + 1; vector<int> memo(amount + 1, -2); function<int(int)> f = [&](int rem) { if (rem == 0) return 0; if (rem < 0) return INF; int& a = memo[rem]; if (a != -2) return a; a = INF; for (int c : coins) a = min(a, 1 + f(rem - c)); return a; }; int ans = f(amount); return ans >= INF ? -1 : ans; }
};`
      },
      {
        "title": "Bottom-up amount DP",
        "explanation": `**Intuition:** Build the best answer for every amount from zero upward.

**State and recurrence:** dp[a] is fewest coins to make a. dp[a]=1+min(dp[a-c]) over coins c<=a.

**Steps:**
1. Define the state around one index, suffix, amount, or target.
2. Evaluate choices using already solved smaller states.
3. Return the state representing the full input.

**Correctness:** The recurrence partitions all valid answers by the next local choice, and each choice delegates to an optimal subproblem. By induction over the fill order or memoized recursion, every state is optimal, so the returned state is optimal for the original input.

**Pitfalls:** Initialize impossible amounts to amount+1.`,
        "time": "O(amount * c)",
        "space": "O(amount)",
        "python": `class Solution:
    def coinChange(self, coins: List[int], amount: int) -> int:
        dp = [amount + 1] * (amount + 1)
        dp[0] = 0
        for a in range(1, amount + 1):
            for c in coins:
                if c <= a: dp[a] = min(dp[a], dp[a - c] + 1)
        return -1 if dp[amount] > amount else dp[amount]
`,
        "cpp": `class Solution { public:
    int coinChange(vector<int>& coins, int amount) { vector<int> dp(amount + 1, amount + 1); dp[0] = 0; for (int a = 1; a <= amount; ++a) for (int c : coins) if (c <= a) dp[a] = min(dp[a], dp[a - c] + 1); return dp[amount] > amount ? -1 : dp[amount]; }
};`
      }
    ],
    "viz": "dp-grid"
  },
  {
    "id": "maximum-product-subarray",
    "title": "Maximum Product Subarray",
    "number": 152,
    "difficulty": "Medium",
    "category": "1-D Dynamic Programming",
    "pattern": "Kadane Variant",
    "description": "Return the largest product of any non-empty contiguous subarray. Because a negative can flip signs, track both the largest and smallest products ending at each index.",
    "examples": [
      {
        "input": "nums = [2,3,-2,4]",
        "output": "6"
      },
      {
        "input": "nums = [-2,0,-1]",
        "output": "0"
      },
      {
        "input": "nums = [-2,3,-4]",
        "output": "24"
      }
    ],
    "constraints": [
      "1 <= nums.length <= 2 * 10^4",
      "-10 <= nums[i] <= 10",
      "The answer fits in a signed 32-bit integer"
    ],
    "hints": [
      "A negative number can turn the smallest product into the largest.",
      "Track both extremes ending at the current index.",
      "Always consider starting a new subarray at the current value."
    ],
    "signature": {
      "kind": "function",
      "name": "maxProduct",
      "params": [
        {
          "name": "nums",
          "type": "int[]"
        }
      ],
      "returns": "int"
    },
    "tests": [
      {
        "args": [
          [2, 3, -2, 4]
        ],
        "expected": 6
      },
      {
        "args": [
          [-2, 0, -1]
        ],
        "expected": 0
      },
      {
        "args": [
          [-2, 3, -4]
        ],
        "expected": 24
      },
      {
        "args": [
          [-2]
        ],
        "expected": -2
      },
      {
        "args": [
          [0, 2]
        ],
        "expected": 2
      },
      {
        "args": [
          [-1, -3, -10, 0, 60]
        ],
        "expected": 60
      },
      {
        "args": [
          [-2, -3, 0, -2, -40]
        ],
        "expected": 80
      },
      {
        "args": [
          [1, -2, -3, 4]
        ],
        "expected": 24
      }
    ],
    "solutions": [
      {
        "title": "Top-down ending products",
        "explanation": `**Intuition:** Track both extremes ending at each index because negatives swap them.

**State and recurrence:** state(i) gives max ending product, min ending product, and best prefix product. Use nums[i] alone, nums[i]*prevMax, and nums[i]*prevMin.

**Steps:**
1. Define the state around one index, suffix, amount, or target.
2. Evaluate choices using already solved smaller states.
3. Return the state representing the full input.

**Correctness:** The recurrence partitions all valid answers by the next local choice, and each choice delegates to an optimal subproblem. By induction over the fill order or memoized recursion, every state is optimal, so the returned state is optimal for the original input.

**Pitfalls:** Zeros reset naturally because starting at nums[i] is a candidate.`,
        "time": "O(n)",
        "space": "O(n)",
        "python": `class Solution:
    def maxProduct(self, nums: List[int]) -> int:
        @lru_cache(None)
        def st(i):
            if i == 0: return nums[0], nums[0], nums[0]
            ph, pl, pb = st(i - 1); x = nums[i]
            hi, lo = max(x, x * ph, x * pl), min(x, x * ph, x * pl)
            return hi, lo, max(pb, hi)
        return st(len(nums) - 1)[2]
`,
        "cpp": `class Solution { public:
    int maxProduct(vector<int>& nums) { vector<array<long long,3>> memo(nums.size()); vector<int> seen(nums.size()); function<array<long long,3>(int)> st = [&](int i) { if (seen[i]) return memo[i]; seen[i] = 1; if (i == 0) return memo[i] = {nums[0], nums[0], nums[0]}; auto p = st(i - 1); long long x = nums[i]; long long hi = max({x, x * p[0], x * p[1]}); long long lo = min({x, x * p[0], x * p[1]}); return memo[i] = {hi, lo, max(p[2], hi)}; }; return (int)st(nums.size() - 1)[2]; }
};`
      },
      {
        "title": "Bottom-up max/min arrays",
        "explanation": `**Intuition:** Store both max and min products ending at every index.

**State and recurrence:** hi[i] and lo[i] are extremes for subarrays ending at i. Each comes from starting at i or extending the previous extremes.

**Steps:**
1. Define the state around one index, suffix, amount, or target.
2. Evaluate choices using already solved smaller states.
3. Return the state representing the full input.

**Correctness:** The recurrence partitions all valid answers by the next local choice, and each choice delegates to an optimal subproblem. By induction over the fill order or memoized recursion, every state is optimal, so the returned state is optimal for the original input.

**Pitfalls:** A single max array fails on negative values.`,
        "time": "O(n)",
        "space": "O(n)",
        "python": `class Solution:
    def maxProduct(self, nums: List[int]) -> int:
        hi = nums[:]; lo = nums[:]; ans = nums[0]
        for i in range(1, len(nums)):
            x = nums[i]
            hi[i] = max(x, x * hi[i - 1], x * lo[i - 1])
            lo[i] = min(x, x * hi[i - 1], x * lo[i - 1])
            ans = max(ans, hi[i])
        return ans
`,
        "cpp": `class Solution { public:
    int maxProduct(vector<int>& nums) { int n = nums.size(); vector<long long> hi(n), lo(n); hi[0] = lo[0] = nums[0]; long long ans = nums[0]; for (int i = 1; i < n; ++i) { long long x = nums[i]; hi[i] = max({x, x * hi[i - 1], x * lo[i - 1]}); lo[i] = min({x, x * hi[i - 1], x * lo[i - 1]}); ans = max(ans, hi[i]); } return (int)ans; }
};`
      },
      {
        "title": "Space-optimized extremes",
        "explanation": `**Intuition:** Only previous ending extremes are needed.

**State and recurrence:** hi and lo are extremes ending at the current position. Update from x, x*oldHi, and x*oldLo.

**Steps:**
1. Define the state around one index, suffix, amount, or target.
2. Evaluate choices using already solved smaller states.
3. Return the state representing the full input.

**Correctness:** The recurrence partitions all valid answers by the next local choice, and each choice delegates to an optimal subproblem. By induction over the fill order or memoized recursion, every state is optimal, so the returned state is optimal for the original input.

**Pitfalls:** Save old values before overwriting.`,
        "time": "O(n)",
        "space": "O(1)",
        "python": `class Solution:
    def maxProduct(self, nums: List[int]) -> int:
        hi = lo = ans = nums[0]
        for x in nums[1:]:
            old_hi, old_lo = hi, lo
            hi = max(x, x * old_hi, x * old_lo)
            lo = min(x, x * old_hi, x * old_lo)
            ans = max(ans, hi)
        return ans
`,
        "cpp": `class Solution { public:
    int maxProduct(vector<int>& nums) { long long hi = nums[0], lo = nums[0], ans = nums[0]; for (int i = 1; i < (int)nums.size(); ++i) { long long x = nums[i], oh = hi, ol = lo; hi = max({x, x * oh, x * ol}); lo = min({x, x * oh, x * ol}); ans = max(ans, hi); } return (int)ans; }
};`
      }
    ],
    "viz": "dp-grid"
  },
  {
    "id": "word-break",
    "title": "Word Break",
    "number": 139,
    "difficulty": "Medium",
    "category": "1-D Dynamic Programming",
    "pattern": "String DP",
    "description": "Given a string and a dictionary, decide whether the string can be segmented into one or more dictionary words. Dictionary words may be reused.",
    "examples": [
      {
        "input": "s = \"leetcode\", wordDict = [\"leet\",\"code\"]",
        "output": "true"
      },
      {
        "input": "s = \"applepenapple\", wordDict = [\"apple\",\"pen\"]",
        "output": "true"
      },
      {
        "input": "s = \"catsandog\", wordDict = [\"cats\",\"dog\",\"sand\",\"and\",\"cat\"]",
        "output": "false"
      }
    ],
    "constraints": [
      "1 <= s.length <= 300",
      "1 <= wordDict.length <= 1000",
      "1 <= wordDict[i].length <= 20",
      "Dictionary entries are unique"
    ],
    "hints": [
      "A valid split has a first word.",
      "Memoize whether each suffix can be segmented.",
      "The empty suffix is true."
    ],
    "signature": {
      "kind": "function",
      "name": "wordBreak",
      "params": [
        {
          "name": "s",
          "type": "string"
        },
        {
          "name": "wordDict",
          "type": "string[]"
        }
      ],
      "returns": "bool"
    },
    "tests": [
      {
        "args": [
          "leetcode",
          ["leet", "code"]
        ],
        "expected": true
      },
      {
        "args": [
          "applepenapple",
          ["apple", "pen"]
        ],
        "expected": true
      },
      {
        "args": [
          "catsandog",
          ["cats", "dog", "sand", "and", "cat"]
        ],
        "expected": false
      },
      {
        "args": [
          "a",
          ["a"]
        ],
        "expected": true
      },
      {
        "args": [
          "aaaaaaa",
          ["aaaa", "aaa"]
        ],
        "expected": true
      },
      {
        "args": [
          "cars",
          ["car", "ca", "rs"]
        ],
        "expected": true
      },
      {
        "args": [
          "aaaaab",
          ["a", "aa", "aaa", "aaaa"]
        ],
        "expected": false
      },
      {
        "args": [
          "pineapplepenapple",
          ["apple", "pen", "applepen", "pine", "pineapple"]
        ],
        "expected": true
      }
    ],
    "solutions": [
      {
        "title": "Top-down memoization",
        "explanation": `**Intuition:** Try every dictionary word as the next token of the suffix.

**State and recurrence:** f(i) is true if s[i:] can be segmented. f(i)=any matching word w with f(i+len(w)).

**Steps:**
1. Define the state around one index, suffix, amount, or target.
2. Evaluate choices using already solved smaller states.
3. Return the state representing the full input.

**Correctness:** The recurrence partitions all valid answers by the next local choice, and each choice delegates to an optimal subproblem. By induction over the fill order or memoized recursion, every state is optimal, so the returned state is optimal for the original input.

**Pitfalls:** The empty suffix is the successful base case.`,
        "time": "O(n * m * L)",
        "space": "O(n + mL)",
        "python": `class Solution:
    def wordBreak(self, s: str, wordDict: List[str]) -> bool:
        words = set(wordDict)
        @lru_cache(None)
        def f(i):
            if i == len(s): return True
            return any(s.startswith(w, i) and f(i + len(w)) for w in words)
        return f(0)
`,
        "cpp": `class Solution { public:
    bool wordBreak(string s, vector<string>& wordDict) { int n = s.size(); vector<int> memo(n + 1, -1); function<bool(int)> f = [&](int i) { if (i == n) return true; int& a = memo[i]; if (a != -1) return (bool)a; a = 0; for (auto& w : wordDict) if (i + (int)w.size() <= n && s.compare(i, w.size(), w) == 0 && f(i + w.size())) { a = 1; break; } return (bool)a; }; return f(0); }
};`
      },
      {
        "title": "Bottom-up suffix DP",
        "explanation": `**Intuition:** Fill segmentability from the end toward the front.

**State and recurrence:** dp[i] is true if s[i:] can be segmented. A word matching at i can transition to dp[i+len(word)].

**Steps:**
1. Define the state around one index, suffix, amount, or target.
2. Evaluate choices using already solved smaller states.
3. Return the state representing the full input.

**Correctness:** The recurrence partitions all valid answers by the next local choice, and each choice delegates to an optimal subproblem. By induction over the fill order or memoized recursion, every state is optimal, so the returned state is optimal for the original input.

**Pitfalls:** Set dp[n]=true.`,
        "time": "O(n * m * L)",
        "space": "O(n)",
        "python": `class Solution:
    def wordBreak(self, s: str, wordDict: List[str]) -> bool:
        n = len(s); dp = [False] * (n + 1); dp[n] = True
        for i in range(n - 1, -1, -1):
            for w in wordDict:
                if s.startswith(w, i) and dp[i + len(w)]:
                    dp[i] = True; break
        return dp[0]
`,
        "cpp": `class Solution { public:
    bool wordBreak(string s, vector<string>& wordDict) { int n = s.size(); vector<int> dp(n + 1); dp[n] = 1; for (int i = n - 1; i >= 0; --i) for (auto& w : wordDict) if (i + (int)w.size() <= n && s.compare(i, w.size(), w) == 0 && dp[i + w.size()]) { dp[i] = 1; break; } return dp[0]; }
};`
      }
    ],
    "viz": "dp-grid"
  },
  {
    "id": "longest-increasing-subsequence",
    "title": "Longest Increasing Subsequence",
    "number": 300,
    "difficulty": "Medium",
    "category": "1-D Dynamic Programming",
    "pattern": "Subsequence DP",
    "description": "Return the length of the longest strictly increasing subsequence. The chosen elements keep their original order but do not need to be contiguous.",
    "examples": [
      {
        "input": "nums = [10,9,2,5,3,7,101,18]",
        "output": "4"
      },
      {
        "input": "nums = [0,1,0,3,2,3]",
        "output": "4"
      },
      {
        "input": "nums = [7,7,7,7,7]",
        "output": "1"
      }
    ],
    "constraints": [
      "1 <= nums.length <= 2500",
      "-10^4 <= nums[i] <= 10^4",
      "The subsequence must be strictly increasing"
    ],
    "hints": [
      "For O(n^2), ask for the best sequence ending at each index.",
      "For O(n log n), store the smallest tail for each length.",
      "Duplicates replace a tail instead of extending it."
    ],
    "signature": {
      "kind": "function",
      "name": "lengthOfLIS",
      "params": [
        {
          "name": "nums",
          "type": "int[]"
        }
      ],
      "returns": "int"
    },
    "tests": [
      {
        "args": [
          [10, 9, 2, 5, 3, 7, 101, 18]
        ],
        "expected": 4
      },
      {
        "args": [
          [0, 1, 0, 3, 2, 3]
        ],
        "expected": 4
      },
      {
        "args": [
          [7, 7, 7, 7, 7]
        ],
        "expected": 1
      },
      {
        "args": [
          [-1, 3, 4, -2, 0, 6, 2, 3]
        ],
        "expected": 4
      },
      {
        "args": [
          [1]
        ],
        "expected": 1
      },
      {
        "args": [
          [4, 10, 4, 3, 8, 9]
        ],
        "expected": 3
      },
      {
        "args": [
          [1, 2, 3, 4, 5]
        ],
        "expected": 5
      },
      {
        "args": [
          [5, 4, 3, 2, 1]
        ],
        "expected": 1
      }
    ],
    "solutions": [
      {
        "title": "Top-down take or skip",
        "explanation": `**Intuition:** Choose or skip each element while remembering the previous chosen index.

**State and recurrence:** f(i,prev) is best LIS length from i onward. Skip i, or take it when prev is absent or nums[i] > nums[prev].

**Steps:**
1. Define the state around one index, suffix, amount, or target.
2. Evaluate choices using already solved smaller states.
3. Return the state representing the full input.

**Correctness:** The recurrence partitions all valid answers by the next local choice, and each choice delegates to an optimal subproblem. By induction over the fill order or memoized recursion, every state is optimal, so the returned state is optimal for the original input.

**Pitfalls:** Offset prev by one in the memo table.`,
        "time": "O(n^2)",
        "space": "O(n^2)",
        "python": `class Solution:
    def lengthOfLIS(self, nums: List[int]) -> int:
        @lru_cache(None)
        def f(i, prev):
            if i == len(nums): return 0
            ans = f(i + 1, prev)
            if prev == -1 or nums[i] > nums[prev]: ans = max(ans, 1 + f(i + 1, i))
            return ans
        return f(0, -1)
`,
        "cpp": `class Solution { public:
    int lengthOfLIS(vector<int>& nums) { int n = nums.size(); vector<vector<int>> memo(n, vector<int>(n + 1, -1)); function<int(int,int)> f = [&](int i, int prev) { if (i == n) return 0; int& a = memo[i][prev + 1]; if (a != -1) return a; a = f(i + 1, prev); if (prev == -1 || nums[i] > nums[prev]) a = max(a, 1 + f(i + 1, i)); return a; }; return f(0, -1); }
};`
      },
      {
        "title": "Bottom-up ending-at DP",
        "explanation": `**Intuition:** For each position, extend earlier smaller values.

**State and recurrence:** dp[i] is LIS length ending exactly at i. dp[i]=1+max(dp[j]) for j<i and nums[j]<nums[i].

**Steps:**
1. Define the state around one index, suffix, amount, or target.
2. Evaluate choices using already solved smaller states.
3. Return the state representing the full input.

**Correctness:** The recurrence partitions all valid answers by the next local choice, and each choice delegates to an optimal subproblem. By induction over the fill order or memoized recursion, every state is optimal, so the returned state is optimal for the original input.

**Pitfalls:** Use strict comparison for increasing.`,
        "time": "O(n^2)",
        "space": "O(n)",
        "python": `class Solution:
    def lengthOfLIS(self, nums: List[int]) -> int:
        dp = [1] * len(nums)
        for i in range(len(nums)):
            for j in range(i):
                if nums[j] < nums[i]: dp[i] = max(dp[i], dp[j] + 1)
        return max(dp)
`,
        "cpp": `class Solution { public:
    int lengthOfLIS(vector<int>& nums) { vector<int> dp(nums.size(), 1); int ans = 1; for (int i = 0; i < (int)nums.size(); ++i) { for (int j = 0; j < i; ++j) if (nums[j] < nums[i]) dp[i] = max(dp[i], dp[j] + 1); ans = max(ans, dp[i]); } return ans; }
};`
      },
      {
        "title": "Patience sorting tails",
        "explanation": `**Intuition:** Keep the minimum possible tail value for every length.

**State and recurrence:** tails[len-1] is the smallest tail for length len. Replace the first tail >= x, or append x if all tails are smaller.

**Steps:**
1. Define the state around one index, suffix, amount, or target.
2. Evaluate choices using already solved smaller states.
3. Return the state representing the full input.

**Correctness:** The recurrence partitions all valid answers by the next local choice, and each choice delegates to an optimal subproblem. By induction over the fill order or memoized recursion, every state is optimal, so the returned state is optimal for the original input.

**Pitfalls:** Use lower_bound so duplicates do not extend.`,
        "time": "O(n log n)",
        "space": "O(n)",
        "python": `class Solution:
    def lengthOfLIS(self, nums: List[int]) -> int:
        tails = []
        for x in nums:
            i = bisect_left(tails, x)
            if i == len(tails): tails.append(x)
            else: tails[i] = x
        return len(tails)
`,
        "cpp": `class Solution { public:
    int lengthOfLIS(vector<int>& nums) { vector<int> tails; for (int x : nums) { auto it = lower_bound(tails.begin(), tails.end(), x); if (it == tails.end()) tails.push_back(x); else *it = x; } return tails.size(); }
};`
      }
    ],
    "viz": "dp-grid"
  },
  {
    "id": "partition-equal-subset-sum",
    "title": "Partition Equal Subset Sum",
    "number": 416,
    "difficulty": "Medium",
    "category": "1-D Dynamic Programming",
    "pattern": "Subset Sum DP",
    "description": "Decide whether the array can be split into two subsets with the same sum. This is equivalent to asking whether some subset reaches half of the total.",
    "examples": [
      {
        "input": "nums = [1,5,11,5]",
        "output": "true"
      },
      {
        "input": "nums = [1,2,3,5]",
        "output": "false"
      },
      {
        "input": "nums = [2,2,1,1]",
        "output": "true"
      }
    ],
    "constraints": ["1 <= nums.length <= 200", "1 <= nums[i] <= 100", "Every number belongs to exactly one subset"],
    "hints": [
      "An odd total sum cannot be split equally.",
      "Target half of the total.",
      "For 1D DP, iterate sums backward."
    ],
    "signature": {
      "kind": "function",
      "name": "canPartition",
      "params": [
        {
          "name": "nums",
          "type": "int[]"
        }
      ],
      "returns": "bool"
    },
    "tests": [
      {
        "args": [
          [1, 5, 11, 5]
        ],
        "expected": true
      },
      {
        "args": [
          [1, 2, 3, 5]
        ],
        "expected": false
      },
      {
        "args": [
          [2, 2, 1, 1]
        ],
        "expected": true
      },
      {
        "args": [
          [1]
        ],
        "expected": false
      },
      {
        "args": [
          [2, 2, 3, 5]
        ],
        "expected": false
      },
      {
        "args": [
          [3, 3, 3, 4, 5]
        ],
        "expected": true
      },
      {
        "args": [
          [100, 100]
        ],
        "expected": true
      },
      {
        "args": [
          [1, 1, 1, 1, 1, 1, 1, 1]
        ],
        "expected": true
      }
    ],
    "solutions": [
      {
        "title": "Top-down subset memo",
        "explanation": `**Intuition:** Look for a subset that reaches half of the total sum.

**State and recurrence:** f(i,rem) is true if nums[i:] can make remaining sum rem. f(i,rem)=f(i+1,rem) or f(i+1,rem-nums[i]).

**Steps:**
1. Define the state around one index, suffix, amount, or target.
2. Evaluate choices using already solved smaller states.
3. Return the state representing the full input.

**Correctness:** The recurrence partitions all valid answers by the next local choice, and each choice delegates to an optimal subproblem. By induction over the fill order or memoized recursion, every state is optimal, so the returned state is optimal for the original input.

**Pitfalls:** Reject odd totals first.`,
        "time": "O(n * target)",
        "space": "O(n * target)",
        "python": `class Solution:
    def canPartition(self, nums: List[int]) -> bool:
        total = sum(nums)
        if total % 2: return False
        target = total // 2
        @lru_cache(None)
        def f(i, rem):
            if rem == 0: return True
            if rem < 0 or i == len(nums): return False
            return f(i + 1, rem) or f(i + 1, rem - nums[i])
        return f(0, target)
`,
        "cpp": `class Solution { public:
    bool canPartition(vector<int>& nums) { int total = accumulate(nums.begin(), nums.end(), 0); if (total % 2) return false; int target = total / 2, n = nums.size(); vector<vector<int>> memo(n, vector<int>(target + 1, -1)); function<bool(int,int)> f = [&](int i, int rem) { if (rem == 0) return true; if (rem < 0 || i == n) return false; int& a = memo[i][rem]; if (a != -1) return (bool)a; a = f(i + 1, rem) || f(i + 1, rem - nums[i]); return (bool)a; }; return f(0, target); }
};`
      },
      {
        "title": "Bottom-up subset table",
        "explanation": `**Intuition:** Mark sums reachable after each prefix.

**State and recurrence:** dp[i][s] is true if first i numbers can make sum s. dp[i][s]=dp[i-1][s] or dp[i-1][s-x].

**Steps:**
1. Define the state around one index, suffix, amount, or target.
2. Evaluate choices using already solved smaller states.
3. Return the state representing the full input.

**Correctness:** The recurrence partitions all valid answers by the next local choice, and each choice delegates to an optimal subproblem. By induction over the fill order or memoized recursion, every state is optimal, so the returned state is optimal for the original input.

**Pitfalls:** Only sums through target are needed.`,
        "time": "O(n * target)",
        "space": "O(n * target)",
        "python": `class Solution:
    def canPartition(self, nums: List[int]) -> bool:
        total = sum(nums)
        if total % 2: return False
        target = total // 2; n = len(nums)
        dp = [[False] * (target + 1) for _ in range(n + 1)]
        dp[0][0] = True
        for i, x in enumerate(nums, 1):
            for s in range(target + 1):
                dp[i][s] = dp[i - 1][s] or (s >= x and dp[i - 1][s - x])
        return dp[n][target]
`,
        "cpp": `class Solution { public:
    bool canPartition(vector<int>& nums) { int total = accumulate(nums.begin(), nums.end(), 0); if (total % 2) return false; int target = total / 2, n = nums.size(); vector<vector<int>> dp(n + 1, vector<int>(target + 1)); dp[0][0] = 1; for (int i = 1; i <= n; ++i) for (int s = 0; s <= target; ++s) dp[i][s] = dp[i - 1][s] || (s >= nums[i - 1] && dp[i - 1][s - nums[i - 1]]); return dp[n][target]; }
};`
      },
      {
        "title": "Space-optimized subset DP",
        "explanation": `**Intuition:** Update reachable sums backward for each number.

**State and recurrence:** dp[s] says whether processed numbers can make s. dp[s] |= dp[s-x] for s descending.

**Steps:**
1. Define the state around one index, suffix, amount, or target.
2. Evaluate choices using already solved smaller states.
3. Return the state representing the full input.

**Correctness:** The recurrence partitions all valid answers by the next local choice, and each choice delegates to an optimal subproblem. By induction over the fill order or memoized recursion, every state is optimal, so the returned state is optimal for the original input.

**Pitfalls:** Descending order prevents reusing the same number twice.`,
        "time": "O(n * target)",
        "space": "O(target)",
        "python": `class Solution:
    def canPartition(self, nums: List[int]) -> bool:
        total = sum(nums)
        if total % 2: return False
        target = total // 2
        dp = [False] * (target + 1); dp[0] = True
        for x in nums:
            for s in range(target, x - 1, -1): dp[s] = dp[s] or dp[s - x]
        return dp[target]
`,
        "cpp": `class Solution { public:
    bool canPartition(vector<int>& nums) { int total = accumulate(nums.begin(), nums.end(), 0); if (total % 2) return false; int target = total / 2; vector<int> dp(target + 1); dp[0] = 1; for (int x : nums) for (int s = target; s >= x; --s) dp[s] = dp[s] || dp[s - x]; return dp[target]; }
};`
      }
    ],
    "viz": "dp-grid"
  }
]

export default problems
