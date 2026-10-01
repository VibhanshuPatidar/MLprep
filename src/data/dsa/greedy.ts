import type { DsaProblem } from '../../types/content'

const problems: DsaProblem[] = [
  {
    id: `maximum-subarray`,
    title: `Maximum Subarray`,
    number: 53,
    difficulty: `Medium`,
    category: `Greedy`,
    pattern: `Kadane's Algorithm`,
    description: `Given an integer array, choose a non-empty contiguous subarray with the largest possible sum.

Return that maximum sum, not the subarray itself.`,
    constraints: [`\`1 <= nums.length <= 10^5\``, `\`-10^4 <= nums[i] <= 10^4\``, `The subarray must contain at least one element.`, `The answer fits in a signed 32-bit integer.`],
    hints: [`A subarray ending at the current index either extends the previous subarray or starts fresh here.`, `A negative running prefix can only hurt future sums.`, `Track both the best sum ending here and the best sum seen anywhere.`],
    signature: {
      kind: `function`,
      name: `maxSubArray`,
      params: [
        {
          name: `nums`,
          type: `int[]`
        }
      ],
      returns: `int`
    },
    viz: `sliding-window`,
    solutions: [
      {
        title: `Enumerate all subarrays`,
        explanation: `**Intuition.** The definition asks for a contiguous subarray, so a direct baseline tries every start and end.

**Steps.**
1. Fix a left boundary.
2. Extend the right boundary one element at a time while maintaining the running sum.
3. Update the best sum after every extension.

This is correct because every non-empty subarray has exactly one pair of boundaries. It is too slow for large inputs but useful for verifying the greedy result.`,
        time: `O(n^2)`,
        space: `O(1)`,
        python: `class Solution:
    def maxSubArray(self, nums: List[int]) -> int:
        best = nums[0]
        for i in range(len(nums)):
            total = 0
            for j in range(i, len(nums)):
                total += nums[j]
                best = max(best, total)
        return best
`,
        cpp: `class Solution {
public:
    int maxSubArray(vector<int>& nums) {
        int best = nums[0];
        for (int i = 0; i < (int)nums.size(); ++i) {
            int total = 0;
            for (int j = i; j < (int)nums.size(); ++j) {
                total += nums[j];
                best = max(best, total);
            }
        }
        return best;
    }
};`
      },
      {
        title: `Kadane's greedy scan`,
        explanation: `**Greedy choice.** When deciding the best subarray ending at \`i\`, a previous sum that is negative should be discarded, because adding it would only make any future subarray smaller.

**Steps.**
1. Maintain \`current\`, the best sum of a subarray ending at the current element.
2. Set \`current = max(nums[i], current + nums[i])\`.
3. Maintain \`best = max(best, current)\`.

The invariant proves correctness: after each index, \`current\` is optimal among subarrays ending there, and \`best\` is optimal among all subarrays seen so far.`,
        time: `O(n)`,
        space: `O(1)`,
        python: `class Solution:
    def maxSubArray(self, nums: List[int]) -> int:
        current = best = nums[0]
        for x in nums[1:]:
            current = max(x, current + x)
            best = max(best, current)
        return best
`,
        cpp: `class Solution {
public:
    int maxSubArray(vector<int>& nums) {
        int current = nums[0], best = nums[0];
        for (int i = 1; i < (int)nums.size(); ++i) {
            current = max(nums[i], current + nums[i]);
            best = max(best, current);
        }
        return best;
    }
};`
      }
    ],
    examples: [
      {
        input: `nums = [-2,1,-3,4,-1,2,1,-5,4]`,
        output: `6`,
        explanation: `The subarray \`[4,-1,2,1]\` sums to 6.`
      },
      {
        input: `nums = [1]`,
        output: `1`,
        explanation: `The only non-empty subarray is \`[1]\`.`
      },
      {
        input: `nums = [5,4,-1,7,8]`,
        output: `23`,
        explanation: `The whole array has the largest sum.`
      }
    ],
    tests: [
      {
        args: [
          [-2, 1, -3, 4, -1, 2, 1, -5, 4]
        ],
        expected: 6
      },
      {
        args: [
          [1]
        ],
        expected: 1
      },
      {
        args: [
          [5, 4, -1, 7, 8]
        ],
        expected: 23
      },
      {
        args: [
          [-1, -2, -3]
        ],
        expected: -1
      },
      {
        args: [
          [0, 0, 0]
        ],
        expected: 0
      },
      {
        args: [
          [-2, -1]
        ],
        expected: -1
      },
      {
        args: [
          [1, -2, 3, 5, -1, 2]
        ],
        expected: 9
      },
      {
        args: [
          [-5, 4]
        ],
        expected: 4
      },
      {
        args: [
          [100, -1, 2, -100, 50]
        ],
        expected: 101
      }
    ]
  },
  {
    id: `jump-game`,
    title: `Jump Game`,
    number: 55,
    difficulty: `Medium`,
    category: `Greedy`,
    pattern: `Farthest Reach`,
    description: `Each array value tells you the maximum jump length from that index. Starting at index \`0\`, decide whether it is possible to reach the last index.

Return \`true\` if some sequence of jumps reaches the end, otherwise return \`false\`.`,
    constraints: [`\`1 <= nums.length <= 10^4\``, `\`0 <= nums[i] <= 10^5\``, `You may jump any distance from \`0\` up to \`nums[i]\`.`, `Reaching or passing the last index counts as success.`],
    hints: [`Work backward: which indices can reach a known-good index?`, `Or scan forward while tracking the farthest reachable position.`, `If the scan index ever moves beyond the farthest reach, no earlier jump can get there.`],
    signature: {
      kind: `function`,
      name: `canJump`,
      params: [
        {
          name: `nums`,
          type: `int[]`
        }
      ],
      returns: `bool`
    },
    solutions: [
      {
        title: `Dynamic programming from the end`,
        explanation: `**State.** \`good[i]\` means index \`i\` can reach the last index.

**Steps.**
1. Mark the last index as good.
2. Scan indices from right to left.
3. Mark \`i\` good if any reachable jump lands on a good index.

This checks all possible first jumps from each index, so it is correct but may be quadratic when jump lengths are large.`,
        time: `O(n^2)`,
        space: `O(n)`,
        python: `class Solution:
    def canJump(self, nums: List[int]) -> bool:
        n = len(nums)
        good = [False] * n
        good[-1] = True
        for i in range(n - 2, -1, -1):
            furthest = min(n - 1, i + nums[i])
            for j in range(i + 1, furthest + 1):
                if good[j]:
                    good[i] = True
                    break
        return good[0]
`,
        cpp: `class Solution {
public:
    bool canJump(vector<int>& nums) {
        int n = nums.size();
        vector<char> good(n);
        good[n - 1] = true;
        for (int i = n - 2; i >= 0; --i) {
            int furthest = min(n - 1, i + nums[i]);
            for (int j = i + 1; j <= furthest; ++j) {
                if (good[j]) { good[i] = true; break; }
            }
        }
        return good[0];
    }
};`
      },
      {
        title: `Greedy farthest reachable index`,
        explanation: `**Greedy choice.** Among all jumps from already reachable indices, only the farthest reachable position matters; shorter reaches are dominated.

**Steps.**
1. Initialize \`reach = 0\`.
2. Scan \`i\` from left to right.
3. If \`i > reach\`, return false; otherwise update \`reach = max(reach, i + nums[i])\`.

The invariant is that every index up to \`reach\` is reachable from the prefix scanned so far. If the scan reaches a gap, no future index can help because it is unreachable.`,
        time: `O(n)`,
        space: `O(1)`,
        python: `class Solution:
    def canJump(self, nums: List[int]) -> bool:
        reach = 0
        for i, jump in enumerate(nums):
            if i > reach:
                return False
            reach = max(reach, i + jump)
        return True
`,
        cpp: `class Solution {
public:
    bool canJump(vector<int>& nums) {
        int reach = 0;
        for (int i = 0; i < (int)nums.size(); ++i) {
            if (i > reach) return false;
            reach = max(reach, i + nums[i]);
        }
        return true;
    }
};`
      }
    ],
    examples: [
      {
        input: `nums = [2,3,1,1,4]`,
        output: `true`,
        explanation: `Jump from index 0 to 1, then from 1 to the last index.`
      },
      {
        input: `nums = [3,2,1,0,4]`,
        output: `false`,
        explanation: `Every route gets stuck at index 3.`
      },
      {
        input: `nums = [0]`,
        output: `true`,
        explanation: `Already at the last index.`
      }
    ],
    tests: [
      {
        args: [
          [2, 3, 1, 1, 4]
        ],
        expected: true
      },
      {
        args: [
          [3, 2, 1, 0, 4]
        ],
        expected: false
      },
      {
        args: [
          [0]
        ],
        expected: true
      },
      {
        args: [
          [0, 1]
        ],
        expected: false
      },
      {
        args: [
          [2, 0, 0]
        ],
        expected: true
      },
      {
        args: [
          [1, 1, 1, 1]
        ],
        expected: true
      },
      {
        args: [
          [2, 5, 0, 0]
        ],
        expected: true
      },
      {
        args: [
          [1, 0, 1, 0]
        ],
        expected: false
      },
      {
        args: [
          [4, 0, 0, 0, 0]
        ],
        expected: true
      }
    ]
  },
  {
    id: `jump-game-ii`,
    title: `Jump Game II`,
    number: 45,
    difficulty: `Medium`,
    category: `Greedy`,
    pattern: `Greedy BFS Window`,
    description: `Each value in \`nums\` is the maximum jump length from that index. Starting at index \`0\`, find the minimum number of jumps needed to reach the last index.

The test cases assume the last index is reachable.`,
    constraints: [`\`1 <= nums.length <= 10^4\``, `\`0 <= nums[i] <= 1000\``, `The final index is reachable from index \`0\`.`, `A jump may move any positive distance up to the current maximum.`],
    hints: [`A DP can relax all edges from each index.`, `For a greedy view, all indices reachable with the same number of jumps form a range.`, `When you finish scanning the current range, you must spend one more jump and move to the farthest next range.`],
    signature: {
      kind: `function`,
      name: `jump`,
      params: [
        {
          name: `nums`,
          type: `int[]`
        }
      ],
      returns: `int`
    },
    solutions: [
      {
        title: `Relax jumps with DP`,
        explanation: `**State.** \`dp[i]\` is the fewest jumps needed to reach index \`i\`.

**Steps.**
1. Set \`dp[0] = 0\` and all other values to infinity.
2. For each index, relax every destination it can jump to.
3. Return \`dp[n - 1]\`.

This explores all directed edges in the implicit jump graph, so it is exact but can be slow for large maximum jumps.`,
        time: `O(n^2)`,
        space: `O(n)`,
        python: `class Solution:
    def jump(self, nums: List[int]) -> int:
        n = len(nums)
        dp = [10**9] * n
        dp[0] = 0
        for i, jump in enumerate(nums):
            for step in range(1, jump + 1):
                if i + step < n:
                    dp[i + step] = min(dp[i + step], dp[i] + 1)
        return dp[-1]
`,
        cpp: `class Solution {
public:
    int jump(vector<int>& nums) {
        int n = nums.size();
        vector<int> dp(n, 1e9);
        dp[0] = 0;
        for (int i = 0; i < n; ++i) {
            for (int step = 1; step <= nums[i] && i + step < n; ++step) {
                dp[i + step] = min(dp[i + step], dp[i] + 1);
            }
        }
        return dp[n - 1];
    }
};`
      },
      {
        title: `Greedy level range`,
        explanation: `**Greedy choice.** Treat indices reachable in \`jumps\` moves as the current BFS level. While scanning that level, record the farthest index reachable in one more jump.

**Steps.**
1. Keep \`end\`, the boundary of the current level, and \`farthest\`, the next boundary.
2. Scan through \`n - 2\` because reaching the last index finishes the process.
3. Whenever \`i == end\`, take one jump and set \`end = farthest\`.

This matches BFS by levels without storing a queue, so the first time the last index enters a level is the minimum jump count.`,
        time: `O(n)`,
        space: `O(1)`,
        python: `class Solution:
    def jump(self, nums: List[int]) -> int:
        jumps = end = farthest = 0
        for i in range(len(nums) - 1):
            farthest = max(farthest, i + nums[i])
            if i == end:
                jumps += 1
                end = farthest
        return jumps
`,
        cpp: `class Solution {
public:
    int jump(vector<int>& nums) {
        int jumps = 0, end = 0, farthest = 0;
        for (int i = 0; i + 1 < (int)nums.size(); ++i) {
            farthest = max(farthest, i + nums[i]);
            if (i == end) {
                ++jumps;
                end = farthest;
            }
        }
        return jumps;
    }
};`
      }
    ],
    examples: [
      {
        input: `nums = [2,3,1,1,4]`,
        output: `2`,
        explanation: `Jump 0 -> 1 -> 4.`
      },
      {
        input: `nums = [2,3,0,1,4]`,
        output: `2`,
        explanation: `Jump 0 -> 1 -> 4.`
      },
      {
        input: `nums = [0]`,
        output: `0`,
        explanation: `No jump is needed.`
      }
    ],
    tests: [
      {
        args: [
          [2, 3, 1, 1, 4]
        ],
        expected: 2
      },
      {
        args: [
          [2, 3, 0, 1, 4]
        ],
        expected: 2
      },
      {
        args: [
          [0]
        ],
        expected: 0
      },
      {
        args: [
          [1, 1, 1, 1]
        ],
        expected: 3
      },
      {
        args: [
          [4, 1, 1, 3, 1, 1, 1]
        ],
        expected: 2
      },
      {
        args: [
          [1, 2, 1, 1, 1]
        ],
        expected: 3
      },
      {
        args: [
          [3, 0, 2, 0, 4]
        ],
        expected: 2
      },
      {
        args: [
          [2, 1]
        ],
        expected: 1
      },
      {
        args: [
          [5, 4, 3, 2, 1, 0]
        ],
        expected: 1
      }
    ]
  },
  {
    id: `gas-station`,
    title: `Gas Station`,
    number: 134,
    difficulty: `Medium`,
    category: `Greedy`,
    pattern: `Greedy Reset`,
    description: `There are gas stations arranged in a circle. At station \`i\`, you gain \`gas[i]\` fuel, then spend \`cost[i]\` fuel to drive to the next station.

Return the index of a station from which you can complete the full circuit, or \`-1\` if no such start exists.`,
    constraints: [`\`1 <= gas.length == cost.length <= 10^5\``, `\`0 <= gas[i], cost[i] <= 10^4\``, `If a solution exists, the original problem guarantees it is unique.`, `The car starts with an empty tank at the chosen station.`],
    hints: [`First compare total gas to total cost.`, `If starting at \`start\` fails at station \`i\`, no station between \`start\` and \`i\` can be a valid start.`, `Reset the candidate start to \`i + 1\` whenever the running tank becomes negative.`],
    signature: {
      kind: `function`,
      name: `canCompleteCircuit`,
      params: [
        {
          name: `gas`,
          type: `int[]`
        },
        {
          name: `cost`,
          type: `int[]`
        }
      ],
      returns: `int`
    },
    solutions: [
      {
        title: `Try every start`,
        explanation: `**Intuition.** A direct simulation tests each station as a candidate start.

**Steps.**
1. For each start index, simulate \`n\` drives around the circle.
2. Track the tank after each station.
3. If the tank ever becomes negative, that start fails; otherwise return it.

This is correct because it checks the problem definition exactly, but repeated simulation makes it quadratic.`,
        time: `O(n^2)`,
        space: `O(1)`,
        python: `class Solution:
    def canCompleteCircuit(self, gas: List[int], cost: List[int]) -> int:
        n = len(gas)
        for start in range(n):
            tank = 0
            ok = True
            for step in range(n):
                i = (start + step) % n
                tank += gas[i] - cost[i]
                if tank < 0:
                    ok = False
                    break
            if ok:
                return start
        return -1
`,
        cpp: `class Solution {
public:
    int canCompleteCircuit(vector<int>& gas, vector<int>& cost) {
        int n = gas.size();
        for (int start = 0; start < n; ++start) {
            int tank = 0;
            bool ok = true;
            for (int step = 0; step < n; ++step) {
                int i = (start + step) % n;
                tank += gas[i] - cost[i];
                if (tank < 0) { ok = false; break; }
            }
            if (ok) return start;
        }
        return -1;
    }
};`
      },
      {
        title: `Greedy reset after failure`,
        explanation: `**Greedy choice.** If a candidate start cannot reach station \`i + 1\`, then every station between the candidate and \`i\` also cannot be a valid start; they would begin with even less accumulated surplus before the same failure point.

**Steps.**
1. If total gas is less than total cost, return \`-1\`.
2. Scan once with a running tank from the current candidate.
3. When the tank drops below zero, reset the candidate to the next station and clear the tank.

The total check guarantees that the final candidate can complete the wraparound portion.`,
        time: `O(n)`,
        space: `O(1)`,
        python: `class Solution:
    def canCompleteCircuit(self, gas: List[int], cost: List[int]) -> int:
        if sum(gas) < sum(cost):
            return -1
        start = tank = 0
        for i, (g, c) in enumerate(zip(gas, cost)):
            tank += g - c
            if tank < 0:
                start = i + 1
                tank = 0
        return start
`,
        cpp: `class Solution {
public:
    int canCompleteCircuit(vector<int>& gas, vector<int>& cost) {
        if (accumulate(gas.begin(), gas.end(), 0) < accumulate(cost.begin(), cost.end(), 0)) return -1;
        int start = 0, tank = 0;
        for (int i = 0; i < (int)gas.size(); ++i) {
            tank += gas[i] - cost[i];
            if (tank < 0) {
                start = i + 1;
                tank = 0;
            }
        }
        return start;
    }
};`
      }
    ],
    examples: [
      {
        input: `gas = [1,2,3,4,5], cost = [3,4,5,1,2]`,
        output: `3`,
        explanation: `Starting at index 3 keeps the tank non-negative around the circuit.`
      },
      {
        input: `gas = [2,3,4], cost = [3,4,3]`,
        output: `-1`,
        explanation: `Total gas is less than total cost.`
      },
      {
        input: `gas = [5], cost = [4]`,
        output: `0`,
        explanation: `The single station can be completed.`
      }
    ],
    tests: [
      {
        args: [
          [1, 2, 3, 4, 5],
          [3, 4, 5, 1, 2]
        ],
        expected: 3
      },
      {
        args: [
          [2, 3, 4],
          [3, 4, 3]
        ],
        expected: -1
      },
      {
        args: [
          [5],
          [4]
        ],
        expected: 0
      },
      {
        args: [
          [5],
          [6]
        ],
        expected: -1
      },
      {
        args: [
          [3, 1, 1],
          [1, 2, 2]
        ],
        expected: 0
      },
      {
        args: [
          [1, 2, 3],
          [1, 2, 3]
        ],
        expected: 0
      },
      {
        args: [
          [4, 6, 7, 4],
          [6, 5, 3, 5]
        ],
        expected: 1
      },
      {
        args: [
          [2, 0, 1, 2],
          [1, 1, 1, 1]
        ],
        expected: 0
      },
      {
        args: [
          [0, 2, 0],
          [1, 0, 1]
        ],
        expected: 1
      }
    ]
  },
  {
    id: `hand-of-straights`,
    title: `Hand of Straights`,
    number: 846,
    difficulty: `Medium`,
    category: `Greedy`,
    pattern: `Ordered Counter`,
    description: `You are given a multiset of card values and a group size. Decide whether all cards can be partitioned into groups where each group contains exactly \`groupSize\` consecutive values.

Every card must be used in exactly one group.`,
    constraints: [`\`1 <= hand.length <= 10^4\``, `\`0 <= hand[i] <= 10^9\``, `\`1 <= groupSize <= hand.length\``, `Duplicate card values are allowed.`],
    hints: [`If the number of cards is not divisible by the group size, it is impossible.`, `The smallest remaining card must start a group; it cannot be placed later in a consecutive run.`, `Use counts so duplicates are consumed in batches.`],
    signature: {
      kind: `function`,
      name: `isNStraightHand`,
      params: [
        {
          name: `hand`,
          type: `int[]`
        },
        {
          name: `groupSize`,
          type: `int`
        }
      ],
      returns: `bool`
    },
    solutions: [
      {
        title: `Sorted marking baseline`,
        explanation: `**Intuition.** Sort the cards, then repeatedly start a group at the smallest unused card.

**Steps.**
1. Sort \`hand\` and maintain a \`used\` marker per card.
2. When an unused card is found, greedily search for the next \`groupSize - 1\` consecutive values.
3. If any required value is missing, return false.

This is correct because the smallest unused card cannot be the middle of a group; no smaller card remains to precede it. The scan is less efficient than using counts.`,
        time: `O(n^2)`,
        space: `O(n)`,
        python: `class Solution:
    def isNStraightHand(self, hand: List[int], groupSize: int) -> bool:
        if len(hand) % groupSize:
            return False
        hand.sort()
        used = [False] * len(hand)
        for i, value in enumerate(hand):
            if used[i]:
                continue
            need = value
            taken = 0
            for j in range(i, len(hand)):
                if not used[j] and hand[j] == need:
                    used[j] = True
                    need += 1
                    taken += 1
                    if taken == groupSize:
                        break
            if taken != groupSize:
                return False
        return True
`,
        cpp: `class Solution {
public:
    bool isNStraightHand(vector<int>& hand, int groupSize) {
        if (hand.size() % groupSize) return false;
        sort(hand.begin(), hand.end());
        vector<char> used(hand.size());
        for (int i = 0; i < (int)hand.size(); ++i) {
            if (used[i]) continue;
            int need = hand[i], taken = 0;
            for (int j = i; j < (int)hand.size(); ++j) {
                if (!used[j] && hand[j] == need) {
                    used[j] = true;
                    ++need;
                    if (++taken == groupSize) break;
                }
            }
            if (taken != groupSize) return false;
        }
        return true;
    }
};`
      },
      {
        title: `Greedy ordered counts`,
        explanation: `**Greedy choice.** The smallest remaining card must begin a consecutive group. If there are \`c\` copies of it, then \`c\` groups must start there, requiring \`c\` copies of each next value.

**Steps.**
1. Count card frequencies in sorted key order.
2. For each value with positive count \`c\`, subtract \`c\` from the next \`groupSize\` consecutive values.
3. If any needed count is too small, return false.

Batch subtraction handles duplicates efficiently and preserves the smallest-card argument for every remaining value.`,
        time: `O(n log n + n * groupSize in sparse keys)`,
        space: `O(n)`,
        python: `class Solution:
    def isNStraightHand(self, hand: List[int], groupSize: int) -> bool:
        if len(hand) % groupSize:
            return False
        count = Counter(hand)
        for x in sorted(count):
            c = count[x]
            if c > 0:
                for y in range(x, x + groupSize):
                    if count[y] < c:
                        return False
                    count[y] -= c
        return True
`,
        cpp: `class Solution {
public:
    bool isNStraightHand(vector<int>& hand, int groupSize) {
        if (hand.size() % groupSize) return false;
        map<int, int> count;
        for (int x : hand) count[x]++;
        for (auto it = count.begin(); it != count.end(); ++it) {
            int x = it->first, c = it->second;
            if (c <= 0) continue;
            for (int y = x; y < x + groupSize; ++y) {
                if (count[y] < c) return false;
                count[y] -= c;
            }
        }
        return true;
    }
};`
      }
    ],
    examples: [
      {
        input: `hand = [1,2,3,6,2,3,4,7,8], groupSize = 3`,
        output: `true`,
        explanation: `The cards can form \`[1,2,3]\`, \`[2,3,4]\`, and \`[6,7,8]\`.`
      },
      {
        input: `hand = [1,2,3,4,5], groupSize = 4`,
        output: `false`,
        explanation: `Five cards cannot be split into groups of four.`
      },
      {
        input: `hand = [1,2,3,4], groupSize = 2`,
        output: `true`,
        explanation: `Use \`[1,2]\` and \`[3,4]\`.`
      }
    ],
    tests: [
      {
        args: [
          [1, 2, 3, 6, 2, 3, 4, 7, 8],
          3
        ],
        expected: true
      },
      {
        args: [
          [1, 2, 3, 4, 5],
          4
        ],
        expected: false
      },
      {
        args: [
          [1, 2, 3, 4],
          2
        ],
        expected: true
      },
      {
        args: [
          [1],
          1
        ],
        expected: true
      },
      {
        args: [
          [1, 1, 2, 2, 3, 3],
          3
        ],
        expected: true
      },
      {
        args: [
          [1, 1, 2, 2, 3, 4],
          3
        ],
        expected: false
      },
      {
        args: [
          [8, 10, 12],
          3
        ],
        expected: false
      },
      {
        args: [
          [1, 2, 3, 4, 5, 6],
          3
        ],
        expected: true
      },
      {
        args: [
          [1, 2, 3, 6, 7, 8],
          3
        ],
        expected: true
      }
    ]
  },
  {
    id: `merge-triplets-to-form-target-triplet`,
    title: `Merge Triplets to Form Target Triplet`,
    number: 1899,
    difficulty: `Medium`,
    category: `Greedy`,
    pattern: `Coordinate Greedy`,
    description: `You may repeatedly merge two triplets by taking the coordinate-wise maximum. Given a list of triplets and a target triplet, determine whether some sequence of merges can produce exactly the target.

Return \`true\` if the target can be formed, otherwise return \`false\`.`,
    constraints: [`\`1 <= triplets.length <= 10^5\``, `\`triplets[i].length == target.length == 3\``, `\`1 <= triplets[i][j], target[j] <= 1000\``, `Merging takes the maximum independently in each coordinate.`],
    hints: [`Any triplet with a coordinate larger than target can never be part of an exact merge.`, `For the remaining triplets, it is enough to cover each target coordinate at least once.`, `Track which coordinates can be matched by safe triplets.`],
    signature: {
      kind: `function`,
      name: `mergeTriplets`,
      params: [
        {
          name: `triplets`,
          type: `int[][]`
        },
        {
          name: `target`,
          type: `int[]`
        }
      ],
      returns: `bool`
    },
    solutions: [
      {
        title: `Exhaust subsets baseline`,
        explanation: `**Intuition.** For small inputs, try every subset of triplets and compute its coordinate-wise maximum.

**Steps.**
1. Enumerate all masks.
2. Merge triplets included in the mask.
3. Return true if any merged result equals the target.

This exactly follows the operation definition, but it is exponential and only useful as a correctness baseline.`,
        time: `O(2^n * n)`,
        space: `O(1)`,
        python: `class Solution:
    def mergeTriplets(self, triplets: List[List[int]], target: List[int]) -> bool:
        n = len(triplets)
        for mask in range(1 << n):
            cur = [0, 0, 0]
            for i in range(n):
                if mask & (1 << i):
                    for j in range(3):
                        cur[j] = max(cur[j], triplets[i][j])
            if cur == target:
                return True
        return False
`,
        cpp: `class Solution {
public:
    bool mergeTriplets(vector<vector<int>>& triplets, vector<int>& target) {
        int n = triplets.size();
        for (int mask = 0; mask < (1 << n); ++mask) {
            vector<int> cur(3);
            for (int i = 0; i < n; ++i) if (mask & (1 << i)) {
                for (int j = 0; j < 3; ++j) cur[j] = max(cur[j], triplets[i][j]);
            }
            if (cur == target) return true;
        }
        return false;
    }
};`
      },
      {
        title: `Filter unsafe triplets greedily`,
        explanation: `**Greedy choice.** A triplet with any coordinate greater than the target is unsafe: once merged, that oversized coordinate can never be reduced. All other triplets are safe to merge in any order.

**Steps.**
1. Ignore unsafe triplets.
2. For every safe triplet, mark target coordinates it equals.
3. Return true once all three coordinates are covered.

Because coordinate-wise maximum is monotonic, safe triplets cannot overshoot the target, and covering every coordinate forces the final maximum to equal the target.`,
        time: `O(n)`,
        space: `O(1)`,
        python: `class Solution:
    def mergeTriplets(self, triplets: List[List[int]], target: List[int]) -> bool:
        good = [False, False, False]
        for triplet in triplets:
            if all(triplet[i] <= target[i] for i in range(3)):
                for i in range(3):
                    if triplet[i] == target[i]:
                        good[i] = True
        return all(good)
`,
        cpp: `class Solution {
public:
    bool mergeTriplets(vector<vector<int>>& triplets, vector<int>& target) {
        vector<bool> good(3);
        for (auto& triplet : triplets) {
            if (triplet[0] <= target[0] && triplet[1] <= target[1] && triplet[2] <= target[2]) {
                for (int i = 0; i < 3; ++i) if (triplet[i] == target[i]) good[i] = true;
            }
        }
        return good[0] && good[1] && good[2];
    }
};`
      }
    ],
    examples: [
      {
        input: `triplets = [[2,5,3],[1,8,4],[1,7,5]], target = [2,7,5]`,
        output: `true`,
        explanation: `Ignore the triplet with an 8, then merge the first and third safe triplets.`
      },
      {
        input: `triplets = [[3,4,5],[4,5,6]], target = [3,2,5]`,
        output: `false`,
        explanation: `Every triplet that reaches coordinate 3 has another coordinate too large.`
      },
      {
        input: `triplets = [[2,5,3],[2,3,4],[1,2,5],[5,2,3]], target = [5,5,5]`,
        output: `true`,
        explanation: `Different triplets can provide different target coordinates.`
      }
    ],
    tests: [
      {
        args: [
          [
            [2, 5, 3],
            [1, 8, 4],
            [1, 7, 5]
          ],
          [2, 7, 5]
        ],
        expected: true
      },
      {
        args: [
          [
            [3, 4, 5],
            [4, 5, 6]
          ],
          [3, 2, 5]
        ],
        expected: false
      },
      {
        args: [
          [
            [2, 5, 3],
            [2, 3, 4],
            [1, 2, 5],
            [5, 2, 3]
          ],
          [5, 5, 5]
        ],
        expected: true
      },
      {
        args: [
          [
            [1, 1, 1]
          ],
          [1, 1, 1]
        ],
        expected: true
      },
      {
        args: [
          [
            [2, 2, 2],
            [3, 3, 3]
          ],
          [2, 2, 2]
        ],
        expected: true
      },
      {
        args: [
          [
            [2, 6, 3],
            [2, 5, 4]
          ],
          [2, 5, 4]
        ],
        expected: true
      },
      {
        args: [
          [
            [1, 3, 4],
            [2, 5, 8]
          ],
          [2, 5, 7]
        ],
        expected: false
      },
      {
        args: [
          [
            [3, 1, 7],
            [1, 5, 7]
          ],
          [3, 5, 7]
        ],
        expected: true
      },
      {
        args: [
          [
            [1, 2, 3],
            [3, 2, 1]
          ],
          [3, 2, 3]
        ],
        expected: true
      }
    ]
  },
  {
    id: `partition-labels`,
    title: `Partition Labels`,
    number: 763,
    difficulty: `Medium`,
    category: `Greedy`,
    pattern: `Last Occurrence`,
    description: `Split a string into as many contiguous parts as possible so that each character appears in at most one part.

Return the lengths of the parts in order.`,
    constraints: [`\`1 <= s.length <= 500\``, `\`s\` contains lowercase English letters.`, `Every character's occurrences must all lie inside a single returned part.`, `The parts must cover the entire string without reordering.`],
    hints: [`A partition cannot end before the last occurrence of any character inside it.`, `Track the farthest last occurrence among characters seen in the current part.`, `When the current index reaches that farthest point, the part can close safely.`],
    signature: {
      kind: `function`,
      name: `partitionLabels`,
      params: [
        {
          name: `s`,
          type: `string`
        }
      ],
      returns: `int[]`
    },
    solutions: [
      {
        title: `Check each possible cut`,
        explanation: `**Intuition.** Starting at a partition boundary, extend the end until every character seen so far has no occurrence later in the string.

**Steps.**
1. Begin a part at \`start\`.
2. Move \`end\` right, tracking characters inside the current part.
3. The first \`end\` where none of those characters appear later is a valid earliest cut.

Choosing the earliest valid cut maximizes the number of partitions, but checking later occurrences by scanning is less efficient.`,
        time: `O(n^2)`,
        space: `O(1)`,
        python: `class Solution:
    def partitionLabels(self, s: str) -> List[int]:
        res = []
        start = 0
        while start < len(s):
            seen = set()
            for end in range(start, len(s)):
                seen.add(s[end])
                if all(s.find(ch, end + 1) == -1 for ch in seen):
                    res.append(end - start + 1)
                    start = end + 1
                    break
        return res
`,
        cpp: `class Solution {
public:
    vector<int> partitionLabels(string s) {
        vector<int> res;
        int start = 0, n = s.size();
        while (start < n) {
            set<char> seen;
            for (int end = start; end < n; ++end) {
                seen.insert(s[end]);
                bool ok = true;
                for (char ch : seen) {
                    if (s.find(ch, end + 1) != string::npos) { ok = false; break; }
                }
                if (ok) {
                    res.push_back(end - start + 1);
                    start = end + 1;
                    break;
                }
            }
        }
        return res;
    }
};`
      },
      {
        title: `Greedy last-occurrence boundary`,
        explanation: `**Greedy choice.** While scanning a part, the part must extend at least to the last occurrence of every character seen. The earliest index that satisfies all those last occurrences is therefore the best cut.

**Steps.**
1. Precompute the last index of every character.
2. Scan the string, updating \`end = max(end, last[s[i]])\`.
3. When \`i == end\`, close a partition and start the next one.

This produces the maximum number of parts because every cut is made at the earliest safe boundary.`,
        time: `O(n)`,
        space: `O(1)`,
        python: `class Solution:
    def partitionLabels(self, s: str) -> List[int]:
        last = {ch: i for i, ch in enumerate(s)}
        res = []
        start = end = 0
        for i, ch in enumerate(s):
            end = max(end, last[ch])
            if i == end:
                res.append(end - start + 1)
                start = i + 1
        return res
`,
        cpp: `class Solution {
public:
    vector<int> partitionLabels(string s) {
        vector<int> last(26);
        for (int i = 0; i < (int)s.size(); ++i) last[s[i] - 'a'] = i;
        vector<int> res;
        int start = 0, end = 0;
        for (int i = 0; i < (int)s.size(); ++i) {
            end = max(end, last[s[i] - 'a']);
            if (i == end) {
                res.push_back(end - start + 1);
                start = i + 1;
            }
        }
        return res;
    }
};`
      }
    ],
    examples: [
      {
        input: `s = "ababcbacadefegdehijhklij"`,
        output: `[9,7,8]`,
        explanation: `The partitions are \`ababcbaca\`, \`defegde\`, and \`hijhklij\`.`
      },
      {
        input: `s = "eccbbbbdec"`,
        output: `[10]`,
        explanation: `The first \`e\` and last \`c\` force the whole string into one part.`
      },
      {
        input: `s = "caedbdedda"`,
        output: `[1,9]`,
        explanation: `The leading \`c\` is alone; the remaining characters must stay together.`
      }
    ],
    tests: [
      {
        args: [`ababcbacadefegdehijhklij`],
        expected: [9, 7, 8]
      },
      {
        args: [`eccbbbbdec`],
        expected: [10]
      },
      {
        args: [`caedbdedda`],
        expected: [1, 9]
      },
      {
        args: [`a`],
        expected: [1]
      },
      {
        args: [`aaaa`],
        expected: [4]
      },
      {
        args: [`abac`],
        expected: [3, 1]
      },
      {
        args: [`abcdef`],
        expected: [1, 1, 1, 1, 1, 1]
      },
      {
        args: [`abcab`],
        expected: [5]
      },
      {
        args: [`qiejxqfnqceocmy`],
        expected: [13, 1, 1]
      }
    ]
  },
  {
    id: `valid-parenthesis-string`,
    title: `Valid Parenthesis String`,
    number: 678,
    difficulty: `Medium`,
    category: `Greedy`,
    pattern: `Range Greedy`,
    description: `A string contains \`(\`, \`)\`, and \`*\`. Each \`*\` may be treated as \`(\`, as \`)\`, or as an empty string.

Return whether there is some assignment of every \`*\` that makes the parentheses valid.`,
    constraints: [`\`1 <= s.length <= 100\``, `\`s[i]\` is one of \`(\`, \`)\`, or \`*\`.`, `A valid parentheses string never has more closing than opening parentheses in any prefix.`, `All openings must be closed by the end.`],
    hints: [`A DP can track the current balance of open parentheses.`, `Greedily, you do not need every possible balance, only the minimum and maximum possible open counts.`, `If the maximum possible open count becomes negative, too many closing parentheses have appeared.`],
    signature: {
      kind: `function`,
      name: `checkValidString`,
      params: [
        {
          name: `s`,
          type: `string`
        }
      ],
      returns: `bool`
    },
    solutions: [
      {
        title: `Memoized balance DP`,
        explanation: `**State.** \`dp(i, balance)\` says whether suffix \`s[i:]\` can finish a valid string when there are \`balance\` unmatched openings.

**Transitions.** \`(\` increases balance, \`)\` decreases it, and \`*\` branches into empty, open, or close. Negative balance is invalid, and balance must be zero at the end.

This dynamic program enumerates all meaningful interpretations of stars without recomputing the same \`(index, balance)\` state.`,
        time: `O(n^2)`,
        space: `O(n^2)`,
        python: `class Solution:
    def checkValidString(self, s: str) -> bool:
        @lru_cache(None)
        def dp(i: int, balance: int) -> bool:
            if balance < 0:
                return False
            if i == len(s):
                return balance == 0
            if balance > len(s) - i:
                return False
            if s[i] == '(':
                return dp(i + 1, balance + 1)
            if s[i] == ')':
                return dp(i + 1, balance - 1)
            return dp(i + 1, balance) or dp(i + 1, balance + 1) or dp(i + 1, balance - 1)
        return dp(0, 0)
`,
        cpp: `class Solution {
public:
    bool checkValidString(string s) {
        int n = s.size();
        vector<vector<int>> memo(n + 1, vector<int>(n + 1, -1));
        function<bool(int, int)> dp = [&](int i, int balance) -> bool {
            if (balance < 0) return false;
            if (balance > n - i) return false;
            if (i == n) return balance == 0;
            int& ans = memo[i][balance];
            if (ans != -1) return ans;
            bool ok;
            if (s[i] == '(') ok = dp(i + 1, balance + 1);
            else if (s[i] == ')') ok = dp(i + 1, balance - 1);
            else ok = dp(i + 1, balance) || dp(i + 1, balance + 1) || dp(i + 1, balance - 1);
            ans = ok;
            return ok;
        };
        return dp(0, 0);
    }
};`
      },
      {
        title: `Greedy range of balances`,
        explanation: `**Greedy choice.** After each prefix, keep only the smallest and largest possible number of unmatched opening parentheses. Every balance between them is achievable, so individual assignments are unnecessary.

**Steps.**
1. For \`(\`, increment both bounds.
2. For \`)\`, decrement both bounds, clamping the lower bound at zero.
3. For \`*\`, it may close, vanish, or open, so decrement the lower bound and increment the upper bound.
4. If the upper bound becomes negative, no assignment can save the prefix.

At the end, zero must be within the possible range, which is equivalent to the lower bound being zero.`,
        time: `O(n)`,
        space: `O(1)`,
        python: `class Solution:
    def checkValidString(self, s: str) -> bool:
        low = high = 0
        for ch in s:
            if ch == '(':
                low += 1
                high += 1
            elif ch == ')':
                low = max(0, low - 1)
                high -= 1
            else:
                low = max(0, low - 1)
                high += 1
            if high < 0:
                return False
        return low == 0
`,
        cpp: `class Solution {
public:
    bool checkValidString(string s) {
        int low = 0, high = 0;
        for (char ch : s) {
            if (ch == '(') {
                ++low; ++high;
            } else if (ch == ')') {
                low = max(0, low - 1);
                --high;
            } else {
                low = max(0, low - 1);
                ++high;
            }
            if (high < 0) return false;
        }
        return low == 0;
    }
};`
      }
    ],
    examples: [
      {
        input: `s = "()"`,
        output: `true`,
        explanation: `The string is already valid.`
      },
      {
        input: `s = "(*)"`,
        output: `true`,
        explanation: `The star can be empty.`
      },
      {
        input: `s = "(*))"`,
        output: `true`,
        explanation: `The star can be \`(\` to balance the final two closings.`
      }
    ],
    tests: [
      {
        args: [`()`],
        expected: true
      },
      {
        args: [`(*)`],
        expected: true
      },
      {
        args: [`(*))`],
        expected: true
      },
      {
        args: [`*`],
        expected: true
      },
      {
        args: [`(*()`],
        expected: true
      },
      {
        args: [`(((*)`],
        expected: false
      },
      {
        args: [`((*)`],
        expected: true
      },
      {
        args: [`)*(`],
        expected: false
      },
      {
        args: [`(((*))`],
        expected: true
      },
      {
        args: [`(((******))`],
        expected: true
      }
    ]
  }
]

export default problems
