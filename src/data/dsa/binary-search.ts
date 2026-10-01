import type { DsaProblem } from '../../types/content'

const problems: DsaProblem[] = [
  {
    id: "binary-search",
    title: "Binary Search",
    number: 704,
    difficulty: "Easy",
    category: "Binary Search",
    pattern: "Classic Binary Search",
    description: `Given a sorted integer array nums in ascending order and an integer target, implement search to return the index where target appears.

If the value is absent, return -1. The array contains no duplicate values, so any successful answer is unique.`,
    examples: [
      { input: "nums = [-1,0,3,5,9,12], target = 9", output: "4", explanation: "9 sits at index 4." },
      { input: "nums = [-1,0,3,5,9,12], target = 2", output: "-1", explanation: "The target would fall between 0 and 3, but it is absent." },
      { input: "nums = [5], target = 5", output: "0", explanation: "A one-element array can still be searched normally." },
    ],
    constraints: ["1 <= nums.length <= 10^4", "-10^4 <= nums[i], target <= 10^4", "nums is sorted in strictly increasing order."],
    hints: ["The sorted order lets you discard many impossible positions after one comparison.", "Compare the target with the middle value, not an endpoint.", "Keep inclusive lo and hi pointers and move one past mid after each failed comparison."],
    signature: {"kind": "function", "name": "search", "params": [{"name": "nums", "type": "int[]"}, {"name": "target", "type": "int"}], "returns": "int"},
    tests: [
      { args: [[-1, 0, 3, 5, 9, 12], 9], expected: 4 },
      { args: [[-1, 0, 3, 5, 9, 12], 2], expected: -1 },
      { args: [[5], 5], expected: 0 },
      { args: [[5], -5], expected: -1 },
      { args: [[1, 3, 7, 9], 1], expected: 0 },
      { args: [[1, 3, 7, 9], 9], expected: 3 },
      { args: [[-10, -3, 0, 4, 8], -3], expected: 1 },
      { args: [[-10, -3, 0, 4, 8], 6], expected: -1 },
      { args: [[0, 2, 4, 6, 8, 10, 12], 10], expected: 5 },
    ],
    solutions: [
      {
        title: "Linear Scan",
        explanation: `**Intuition.** The direct baseline checks every possible position.

**Steps.**
1. Visit indices from left to right.
2. Return when the value equals the target.
3. If no position matches, return -1.

**Why it is correct.** Every index is examined exactly once, so a present target is found and an absent target is proven absent.

**Pitfalls.** This ignores sorted order and is too slow for the intended pattern.`,
        time: "O(n)",
        space: "O(1)",
        python: `class Solution:
    def search(self, nums: List[int], target: int) -> int:
        for i, value in enumerate(nums):
            if value == target:
                return i
        return -1
`,
        cpp: `class Solution {
public:
    int search(vector<int>& nums, int target) {
        for (int i = 0; i < (int)nums.size(); ++i) if (nums[i] == target) return i;
        return -1;
    }
};`,
      },
      {
        title: "Binary Search",
        explanation: `**Intuition.** A middle comparison tells us which half cannot contain the target.

**Steps.**
1. Start with the full inclusive range.
2. Compare target with nums[mid].
3. Discard the half with values definitely too small or too large.
4. Repeat until found or empty.

**Why it is correct.** The remaining range always contains every possible target position. When it collapses without a match, none exists.

**Pitfalls.** Move to mid + 1 or mid - 1; keeping mid can loop forever.`,
        time: "O(log n)",
        space: "O(1)",
        python: `class Solution:
    def search(self, nums: List[int], target: int) -> int:
        lo, hi = 0, len(nums) - 1
        while lo <= hi:
            mid = lo + (hi - lo) // 2
            if nums[mid] == target:
                return mid
            if nums[mid] < target:
                lo = mid + 1
            else:
                hi = mid - 1
        return -1
`,
        cpp: `class Solution {
public:
    int search(vector<int>& nums, int target) {
        int lo = 0, hi = (int)nums.size() - 1;
        while (lo <= hi) {
            int mid = lo + (hi - lo) / 2;
            if (nums[mid] == target) return mid;
            if (nums[mid] < target) lo = mid + 1;
            else hi = mid - 1;
        }
        return -1;
    }
};`,
      },
    ],
    viz: "binary-search",
  },
  {
    id: "search-a-2d-matrix",
    title: "Search a 2D Matrix",
    number: 74,
    difficulty: "Medium",
    category: "Binary Search",
    pattern: "Flattened Binary Search",
    description: `You are given an m x n matrix where each row is sorted and every row starts with a value larger than the previous row last value.

Implement searchMatrix to decide whether target appears anywhere in the matrix.`,
    examples: [
      { input: "matrix = [[1,3,5,7],[10,11,16,20],[23,30,34,60]], target = 3", output: "true", explanation: "The value is in the first row." },
      { input: "matrix = [[1,3,5,7],[10,11,16,20],[23,30,34,60]], target = 13", output: "false", explanation: "13 falls between 11 and 16." },
      { input: "matrix = [[1]], target = 1", output: "true", explanation: "The only cell matches." },
    ],
    constraints: ["1 <= m, n <= 100", "-10^4 <= matrix[r][c], target <= 10^4", "Each row is sorted ascending.", "Each row starts after the previous row ends."],
    hints: ["Imagine writing all rows one after another.", "A virtual index maps to matrix[index // n][index % n].", "Once flattened virtually, use ordinary binary search."],
    signature: {"kind": "function", "name": "searchMatrix", "params": [{"name": "matrix", "type": "int[][]"}, {"name": "target", "type": "int"}], "returns": "bool"},
    tests: [
      { args: [[[1, 3, 5, 7], [10, 11, 16, 20], [23, 30, 34, 60]], 3], expected: true },
      { args: [[[1, 3, 5, 7], [10, 11, 16, 20], [23, 30, 34, 60]], 13], expected: false },
      { args: [[[1]], 1], expected: true },
      { args: [[[1]], 2], expected: false },
      { args: [[[1, 2, 3, 4]], 4], expected: true },
      { args: [[[1], [3], [5]], 3], expected: true },
      { args: [[[-5, -2, 0], [4, 9, 12]], -5], expected: true },
      { args: [[[-5, -2, 0], [4, 9, 12]], 10], expected: false },
      { args: [[[1, 4], [7, 10], [13, 16]], 16], expected: true },
    ],
    solutions: [
      {
        title: "Full Scan",
        explanation: `**Intuition.** A matrix search can always check every cell.

**Steps.**
1. Loop over every row.
2. Compare every value with the target.
3. Return false only after all cells fail.

**Why it is correct.** The target can only be in a cell, and every cell is inspected.

**Pitfalls.** Correct but misses the sorted structure.`,
        time: "O(mn)",
        space: "O(1)",
        python: `class Solution:
    def searchMatrix(self, matrix: List[List[int]], target: int) -> bool:
        for row in matrix:
            for value in row:
                if value == target:
                    return True
        return False
`,
        cpp: `class Solution {
public:
    bool searchMatrix(vector<vector<int>>& matrix, int target) {
        for (auto& row : matrix) for (int value : row) if (value == target) return true;
        return false;
    }
};`,
      },
      {
        title: "Virtual Flattening",
        explanation: `**Intuition.** The ordering is identical to one long sorted array.

**Steps.**
1. Search positions 0 through m*n-1.
2. Map each middle position to row and column.
3. Move the range using the middle value.

**Why it is correct.** The virtual order is globally sorted, so binary search keeps exactly the possible positions.

**Pitfalls.** Use the column count for both division and modulo.`,
        time: "O(log(mn))",
        space: "O(1)",
        python: `class Solution:
    def searchMatrix(self, matrix: List[List[int]], target: int) -> bool:
        rows, cols = len(matrix), len(matrix[0])
        lo, hi = 0, rows * cols - 1
        while lo <= hi:
            mid = lo + (hi - lo) // 2
            value = matrix[mid // cols][mid % cols]
            if value == target:
                return True
            if value < target:
                lo = mid + 1
            else:
                hi = mid - 1
        return False
`,
        cpp: `class Solution {
public:
    bool searchMatrix(vector<vector<int>>& matrix, int target) {
        int rows = matrix.size(), cols = matrix[0].size();
        int lo = 0, hi = rows * cols - 1;
        while (lo <= hi) {
            int mid = lo + (hi - lo) / 2;
            int value = matrix[mid / cols][mid % cols];
            if (value == target) return true;
            if (value < target) lo = mid + 1;
            else hi = mid - 1;
        }
        return false;
    }
};`,
      },
    ],
    viz: "binary-search",
  },
  {
    id: "koko-eating-bananas",
    title: "Koko Eating Bananas",
    number: 875,
    difficulty: "Medium",
    category: "Binary Search",
    pattern: "Binary Search on Answer",
    description: `Koko chooses an integer eating speed k. Each hour she eats up to k bananas from one pile.

Implement minEatingSpeed to return the smallest speed that finishes all piles within h hours.`,
    examples: [
      { input: "piles = [3,6,7,11], h = 8", output: "4", explanation: "Speed 4 takes exactly eight hours." },
      { input: "piles = [30,11,23,4,20], h = 5", output: "30", explanation: "Five piles in five hours requires speed 30." },
      { input: "piles = [30,11,23,4,20], h = 6", output: "23", explanation: "Speed 23 works while 22 does not." },
    ],
    constraints: ["1 <= piles.length <= 10^4", "1 <= piles[i] <= 10^9", "piles.length <= h <= 10^9"],
    hints: ["For a fixed speed, compute the total hours by rounded-up division.", "If a speed works, every larger speed works too.", "Binary-search the first feasible speed."],
    signature: {"kind": "function", "name": "minEatingSpeed", "params": [{"name": "piles", "type": "int[]"}, {"name": "h", "type": "int"}], "returns": "int"},
    tests: [
      { args: [[3, 6, 7, 11], 8], expected: 4 },
      { args: [[30, 11, 23, 4, 20], 5], expected: 30 },
      { args: [[30, 11, 23, 4, 20], 6], expected: 23 },
      { args: [[1], 1], expected: 1 },
      { args: [[1, 1, 1, 1], 4], expected: 1 },
      { args: [[9], 3], expected: 3 },
      { args: [[5, 10, 15], 8], expected: 5 },
      { args: [[100, 100, 100], 300], expected: 1 },
      { args: [[312884470], 312884469], expected: 2 },
    ],
    solutions: [
      {
        title: "Try Every Speed",
        explanation: `**Intuition.** The answer lies between one and the largest pile.

**Steps.**
1. Test speeds in increasing order.
2. For each speed, sum rounded-up hours.
3. Return the first feasible speed.

**Why it is correct.** Testing in increasing order means the first feasible candidate is the minimum.

**Pitfalls.** The numeric range may be huge, so this is only a baseline.`,
        time: "O(n · max(piles))",
        space: "O(1)",
        python: `class Solution:
    def minEatingSpeed(self, piles: List[int], h: int) -> int:
        for speed in range(1, max(piles) + 1):
            if sum((pile + speed - 1) // speed for pile in piles) <= h:
                return speed
        return max(piles)
`,
        cpp: `class Solution {
public:
    int minEatingSpeed(vector<int>& piles, int h) {
        int limit = *max_element(piles.begin(), piles.end());
        for (int speed = 1; speed <= limit; ++speed) {
            long long hours = 0;
            for (int pile : piles) hours += (pile + speed - 1) / speed;
            if (hours <= h) return speed;
        }
        return limit;
    }
};`,
      },
      {
        title: "Binary Search on Speed",
        explanation: `**Intuition.** Feasibility is monotonic: faster speeds cannot require more hours.

**Steps.**
1. Search from 1 to max(piles).
2. Check the middle speed.
3. Keep the left side if it works; otherwise discard it.
4. Return the boundary.

**Why it is correct.** All infeasible speeds are before all feasible speeds, so boundary search returns the minimum feasible speed.

**Pitfalls.** Use integer ceiling and a wide integer for total hours.`,
        time: "O(n log max(piles))",
        space: "O(1)",
        python: `class Solution:
    def minEatingSpeed(self, piles: List[int], h: int) -> int:
        lo, hi = 1, max(piles)
        while lo < hi:
            mid = lo + (hi - lo) // 2
            hours = sum((pile + mid - 1) // mid for pile in piles)
            if hours <= h:
                hi = mid
            else:
                lo = mid + 1
        return lo
`,
        cpp: `class Solution {
public:
    int minEatingSpeed(vector<int>& piles, int h) {
        int lo = 1, hi = *max_element(piles.begin(), piles.end());
        while (lo < hi) {
            int mid = lo + (hi - lo) / 2;
            long long hours = 0;
            for (int pile : piles) hours += (pile + mid - 1) / mid;
            if (hours <= h) hi = mid;
            else lo = mid + 1;
        }
        return lo;
    }
};`,
      },
    ],
    viz: "binary-search",
  },
  {
    id: "find-minimum-in-rotated-sorted-array",
    title: "Find Minimum in Rotated Sorted Array",
    number: 153,
    difficulty: "Medium",
    category: "Binary Search",
    pattern: "Rotated Array Binary Search",
    description: `A strictly increasing array was rotated some number of positions. Implement findMin to return the smallest value.

The array contains unique integers, and zero rotations are possible.`,
    examples: [
      { input: "nums = [3,4,5,1,2]", output: "1", explanation: "The sorted order wraps before 1." },
      { input: "nums = [4,5,6,7,0,1,2]", output: "0", explanation: "The pivot exposes 0 as the smallest value." },
      { input: "nums = [11,13,15,17]", output: "11", explanation: "No rotation happened." },
    ],
    constraints: ["1 <= nums.length <= 5000", "-5000 <= nums[i] <= 5000", "All values are unique.", "The array is sorted ascending and then rotated."],
    hints: ["The minimum is near the rotation break.", "Compare the middle value with the right endpoint.", "When nums[mid] <= nums[right], keep mid as a candidate."],
    signature: {"kind": "function", "name": "findMin", "params": [{"name": "nums", "type": "int[]"}], "returns": "int"},
    tests: [
      { args: [[3, 4, 5, 1, 2]], expected: 1 },
      { args: [[4, 5, 6, 7, 0, 1, 2]], expected: 0 },
      { args: [[11, 13, 15, 17]], expected: 11 },
      { args: [[1]], expected: 1 },
      { args: [[2, 1]], expected: 1 },
      { args: [[5, 1, 2, 3, 4]], expected: 1 },
      { args: [[2, 3, 4, 5, 1]], expected: 1 },
      { args: [[-1, 0, 1, -4, -3, -2]], expected: -4 },
      { args: [[6, 7, 8, 9, 1, 2, 3, 4, 5]], expected: 1 },
    ],
    solutions: [
      {
        title: "Linear Minimum",
        explanation: `**Intuition.** Scanning all values gives a simple baseline.

**Steps.**
1. Initialize with the first value.
2. Update when a smaller value appears.
3. Return the final minimum.

**Why it is correct.** The running answer is the minimum of the seen prefix; after the scan it is global.

**Pitfalls.** Correct but does not use rotation structure.`,
        time: "O(n)",
        space: "O(1)",
        python: `class Solution:
    def findMin(self, nums: List[int]) -> int:
        ans = nums[0]
        for value in nums:
            ans = min(ans, value)
        return ans
`,
        cpp: `class Solution {
public:
    int findMin(vector<int>& nums) {
        int ans = nums[0];
        for (int value : nums) ans = min(ans, value);
        return ans;
    }
};`,
      },
      {
        title: "Binary Search for Pivot",
        explanation: `**Intuition.** The right endpoint reveals which side contains the rotation pivot.

**Steps.**
1. While the range has multiple indices, inspect the middle.
2. If middle is greater than right, the minimum is to its right.
3. Otherwise, keep the left side including middle.

**Why it is correct.** Each step keeps the half that contains the minimum; when one index remains it must be the answer.

**Pitfalls.** Use hi = mid, not mid - 1, when middle can be the minimum.`,
        time: "O(log n)",
        space: "O(1)",
        python: `class Solution:
    def findMin(self, nums: List[int]) -> int:
        lo, hi = 0, len(nums) - 1
        while lo < hi:
            mid = lo + (hi - lo) // 2
            if nums[mid] > nums[hi]:
                lo = mid + 1
            else:
                hi = mid
        return nums[lo]
`,
        cpp: `class Solution {
public:
    int findMin(vector<int>& nums) {
        int lo = 0, hi = (int)nums.size() - 1;
        while (lo < hi) {
            int mid = lo + (hi - lo) / 2;
            if (nums[mid] > nums[hi]) lo = mid + 1;
            else hi = mid;
        }
        return nums[lo];
    }
};`,
      },
    ],
    viz: "binary-search",
  },
  {
    id: "search-in-rotated-sorted-array",
    title: "Search in Rotated Sorted Array",
    number: 33,
    difficulty: "Medium",
    category: "Binary Search",
    pattern: "Rotated Array Binary Search",
    description: `A sorted array of unique integers has been rotated. Implement search to find target and return its index.

Return -1 when the target is absent.`,
    examples: [
      { input: "nums = [4,5,6,7,0,1,2], target = 0", output: "4", explanation: "0 appears at index 4." },
      { input: "nums = [4,5,6,7,0,1,2], target = 3", output: "-1", explanation: "3 is absent." },
      { input: "nums = [1], target = 0", output: "-1", explanation: "The only value does not match." },
    ],
    constraints: ["1 <= nums.length <= 5000", "-10^4 <= nums[i], target <= 10^4", "All values are unique.", "The array is sorted ascending and then rotated."],
    hints: ["At least one side of a midpoint is sorted.", "Check whether the target lies inside the sorted side.", "Discard the side that cannot contain the target."],
    signature: {"kind": "function", "name": "search", "params": [{"name": "nums", "type": "int[]"}, {"name": "target", "type": "int"}], "returns": "int"},
    tests: [
      { args: [[4, 5, 6, 7, 0, 1, 2], 0], expected: 4 },
      { args: [[4, 5, 6, 7, 0, 1, 2], 3], expected: -1 },
      { args: [[1], 0], expected: -1 },
      { args: [[1], 1], expected: 0 },
      { args: [[3, 1], 1], expected: 1 },
      { args: [[5, 1, 3], 5], expected: 0 },
      { args: [[5, 1, 3], 3], expected: 2 },
      { args: [[6, 7, 8, 1, 2, 3, 4, 5], 4], expected: 6 },
      { args: [[6, 7, 8, 1, 2, 3, 4, 5], 9], expected: -1 },
    ],
    solutions: [
      {
        title: "Linear Search",
        explanation: `**Intuition.** The fallback is to test each index.

**Steps.**
1. Scan from left to right.
2. Return the index on equality.
3. Return -1 after all misses.

**Why it is correct.** Every possible position is checked, and values are unique.

**Pitfalls.** It ignores the sorted rotated layout.`,
        time: "O(n)",
        space: "O(1)",
        python: `class Solution:
    def search(self, nums: List[int], target: int) -> int:
        for i, value in enumerate(nums):
            if value == target:
                return i
        return -1
`,
        cpp: `class Solution {
public:
    int search(vector<int>& nums, int target) {
        for (int i = 0; i < (int)nums.size(); ++i) if (nums[i] == target) return i;
        return -1;
    }
};`,
      },
      {
        title: "Modified Binary Search",
        explanation: `**Intuition.** One half around the midpoint is always sorted.

**Steps.**
1. Identify whether the left or right half is sorted.
2. Check whether the target value lies in that half.
3. Keep that half only when it can contain the target.

**Why it is correct.** The algorithm discards only a half whose value interval excludes the target, so a present target remains in range.

**Pitfalls.** Endpoint inequalities must be inclusive on the side endpoints.`,
        time: "O(log n)",
        space: "O(1)",
        python: `class Solution:
    def search(self, nums: List[int], target: int) -> int:
        lo, hi = 0, len(nums) - 1
        while lo <= hi:
            mid = lo + (hi - lo) // 2
            if nums[mid] == target:
                return mid
            if nums[lo] <= nums[mid]:
                if nums[lo] <= target < nums[mid]:
                    hi = mid - 1
                else:
                    lo = mid + 1
            else:
                if nums[mid] < target <= nums[hi]:
                    lo = mid + 1
                else:
                    hi = mid - 1
        return -1
`,
        cpp: `class Solution {
public:
    int search(vector<int>& nums, int target) {
        int lo = 0, hi = (int)nums.size() - 1;
        while (lo <= hi) {
            int mid = lo + (hi - lo) / 2;
            if (nums[mid] == target) return mid;
            if (nums[lo] <= nums[mid]) {
                if (nums[lo] <= target && target < nums[mid]) hi = mid - 1;
                else lo = mid + 1;
            } else {
                if (nums[mid] < target && target <= nums[hi]) lo = mid + 1;
                else hi = mid - 1;
            }
        }
        return -1;
    }
};`,
      },
    ],
    viz: "binary-search",
  },
  {
    id: "time-based-key-value-store",
    title: "Time Based Key-Value Store",
    number: 981,
    difficulty: "Medium",
    category: "Binary Search",
    pattern: "Timestamped Binary Search",
    description: `Design a TimeMap that stores string values for string keys at integer timestamps.

set records a value. get returns the value with the largest timestamp not exceeding the query timestamp, or the empty string if no such value exists.`,
    examples: [
      { input: "ops = [\"TimeMap\",\"set\",\"get\",\"get\",\"set\",\"get\",\"get\"], args = [[],[\"foo\",\"bar\",1],[\"foo\",1],[\"foo\",3],[\"foo\",\"bar2\",4],[\"foo\",4],[\"foo\",5]]", output: "[null,null,\"bar\",\"bar\",null,\"bar2\",\"bar2\"]", explanation: "Later queries see the latest value not after the query time." },
      { input: "ops = [\"TimeMap\",\"set\",\"get\",\"set\",\"get\",\"get\"], args = [[],[\"love\",\"high\",10],[\"love\",5],[\"love\",\"low\",20],[\"love\",10],[\"love\",20]]", output: "[null,null,\"\",null,\"high\",\"low\"]", explanation: "The query before timestamp 10 has no value." },
      { input: "ops = [\"TimeMap\",\"get\",\"set\",\"get\",\"get\"], args = [[],[\"missing\",1],[\"a\",\"x\",2],[\"a\",1],[\"a\",2]]", output: "[null,\"\",null,\"\",\"x\"]", explanation: "Missing keys and too-early times return empty strings." },
    ],
    constraints: ["1 <= key.length, value.length <= 100", "Timestamps are positive integers.", "For each key, set timestamps arrive in increasing order.", "get returns an empty string when no old-enough value exists."],
    hints: ["Store every value for a key instead of overwriting it.", "Per-key timestamps are sorted by insertion order.", "Find the first timestamp greater than the query, then step back."],
    signature: {"kind": "class", "className": "TimeMap", "ctorParams": [], "methods": [{"name": "set", "params": [{"name": "key", "type": "string"}, {"name": "value", "type": "string"}, {"name": "timestamp", "type": "int"}], "returns": "void"}, {"name": "get", "params": [{"name": "key", "type": "string"}, {"name": "timestamp", "type": "int"}], "returns": "string"}]},
    tests: [
      { ops: ["TimeMap", "set", "get", "get", "set", "get", "get"], args: [[], ["foo", "bar", 1], ["foo", 1], ["foo", 3], ["foo", "bar2", 4], ["foo", 4], ["foo", 5]], expected: [null, null, "bar", "bar", null, "bar2", "bar2"] },
      { ops: ["TimeMap", "set", "get", "set", "get", "get"], args: [[], ["love", "high", 10], ["love", 5], ["love", "low", 20], ["love", 10], ["love", 20]], expected: [null, null, "", null, "high", "low"] },
      { ops: ["TimeMap", "get", "set", "get", "get"], args: [[], ["missing", 1], ["a", "x", 2], ["a", 1], ["a", 2]], expected: [null, "", null, "", "x"] },
      { ops: ["TimeMap", "set", "set", "set", "get", "get", "get"], args: [[], ["k", "a", 1], ["k", "b", 3], ["k", "c", 5], ["k", 4], ["k", 5], ["k", 0]], expected: [null, null, null, null, "b", "c", ""] },
      { ops: ["TimeMap", "set", "set", "get", "get", "get"], args: [[], ["a", "one", 1], ["b", "two", 2], ["a", 2], ["b", 1], ["b", 2]], expected: [null, null, null, "one", "", "two"] },
      { ops: ["TimeMap", "set", "get", "set", "set", "get", "get"], args: [[], ["x", "old", 100], ["x", 99], ["x", "mid", 150], ["x", "new", 200], ["x", 175], ["x", 250]], expected: [null, null, "", null, null, "mid", "new"] },
    ],
    solutions: [
      {
        title: "Per-Key History Scan",
        explanation: `**Intuition.** Keep the full timeline for every key and scan from newest to oldest.

**Steps.**
1. Map each key to timestamped values.
2. Append on set.
3. On get, scan backward for the first timestamp not exceeding the query.

**Why it is correct.** Backward order visits candidates from newest to oldest, so the first valid record is exactly the answer.

**Pitfalls.** A hot key with many versions makes get linear.`,
        time: "set: O(1), get: O(m)",
        space: "O(total set calls)",
        python: `class TimeMap:
    def __init__(self):
        self.store = defaultdict(list)
    def set(self, key: str, value: str, timestamp: int) -> None:
        self.store[key].append((timestamp, value))
    def get(self, key: str, timestamp: int) -> str:
        for t, value in reversed(self.store.get(key, [])):
            if t <= timestamp:
                return value
        return ""
`,
        cpp: `class TimeMap {
    unordered_map<string, vector<pair<int, string>>> store;
public:
    TimeMap() {}
    void set(string key, string value, int timestamp) { store[key].push_back({timestamp, value}); }
    string get(string key, int timestamp) {
        auto it = store.find(key);
        if (it == store.end()) return "";
        auto& v = it->second;
        for (int i = (int)v.size() - 1; i >= 0; --i) if (v[i].first <= timestamp) return v[i].second;
        return "";
    }
};`,
      },
      {
        title: "Binary Search Per Key",
        explanation: `**Intuition.** Each key history is sorted, so get is a predecessor query.

**Steps.**
1. Store timestamp and value pairs per key.
2. Binary-search the first timestamp greater than the query.
3. Return the value just before that position if it exists.

**Why it is correct.** All earlier positions are valid and all later positions are too new; the predecessor is the required value.

**Pitfalls.** Search within one key only; different keys have independent timelines.`,
        time: "set: O(1), get: O(log m)",
        space: "O(total set calls)",
        python: `class TimeMap:
    def __init__(self):
        self.store = defaultdict(list)
    def set(self, key: str, value: str, timestamp: int) -> None:
        self.store[key].append((timestamp, value))
    def get(self, key: str, timestamp: int) -> str:
        values = self.store.get(key, [])
        i = bisect_right(values, (timestamp, chr(127))) - 1
        return values[i][1] if i >= 0 else ""
`,
        cpp: `class TimeMap {
    unordered_map<string, vector<pair<int, string>>> store;
public:
    TimeMap() {}
    void set(string key, string value, int timestamp) { store[key].push_back({timestamp, value}); }
    string get(string key, int timestamp) {
        auto it = store.find(key);
        if (it == store.end()) return "";
        auto& values = it->second;
        int lo = 0, hi = (int)values.size();
        while (lo < hi) {
            int mid = lo + (hi - lo) / 2;
            if (values[mid].first <= timestamp) lo = mid + 1;
            else hi = mid;
        }
        return lo == 0 ? string("") : values[lo - 1].second;
    }
};`,
      },
    ],
    viz: "binary-search",
  },
  {
    id: "median-of-two-sorted-arrays",
    title: "Median of Two Sorted Arrays",
    number: 4,
    difficulty: "Hard",
    category: "Binary Search",
    pattern: "Partition Binary Search",
    description: `Given two sorted arrays, implement findMedianSortedArrays to return the median of all values combined.

The arrays may have different lengths, and one may be empty. Return a floating-point answer.`,
    examples: [
      { input: "nums1 = [1,3], nums2 = [2]", output: "2.0", explanation: "The combined order is [1,2,3]." },
      { input: "nums1 = [1,2], nums2 = [3,4]", output: "2.5", explanation: "The middle values are 2 and 3." },
      { input: "nums1 = [], nums2 = [1]", output: "1.0", explanation: "The only value is the median." },
    ],
    constraints: ["0 <= nums1.length, nums2.length <= 1000", "1 <= nums1.length + nums2.length", "-10^6 <= nums1[i], nums2[i] <= 10^6", "Both arrays are sorted in nondecreasing order."],
    hints: ["A full merge makes the median obvious.", "The median splits the combined order into left and right halves.", "Binary-search how many values the left half takes from the shorter array."],
    signature: {"kind": "function", "name": "findMedianSortedArrays", "params": [{"name": "nums1", "type": "int[]"}, {"name": "nums2", "type": "int[]"}], "returns": "double"},
    tests: [
      { args: [[1, 3], [2]], expected: 2.0 },
      { args: [[1, 2], [3, 4]], expected: 2.5 },
      { args: [[], [1]], expected: 1.0 },
      { args: [[0, 0], [0, 0]], expected: 0.0 },
      { args: [[2], []], expected: 2.0 },
      { args: [[1, 4, 7], [2, 3, 6, 8]], expected: 4.0 },
      { args: [[-5, -3, -1], [-2]], expected: -2.5 },
      { args: [[100], [1, 2, 3, 4, 5]], expected: 3.5 },
      { args: [[1, 2, 2], [2, 2, 3]], expected: 2.0 },
    ],
    solutions: [
      {
        title: "Merge and Index",
        explanation: `**Intuition.** After merging, the median is at the middle index or between two middle indices.

**Steps.**
1. Combine and sort all values.
2. Read the center value for odd length.
3. Average the two center values for even length.

**Why it is correct.** The sorted combined list is the definition order for the median.

**Pitfalls.** This allocates the full combined array.`,
        time: "O((m+n) log(m+n))",
        space: "O(m+n)",
        python: `class Solution:
    def findMedianSortedArrays(self, nums1: List[int], nums2: List[int]) -> float:
        merged = sorted(nums1 + nums2)
        n = len(merged)
        if n % 2:
            return float(merged[n // 2])
        return (merged[n // 2 - 1] + merged[n // 2]) / 2
`,
        cpp: `class Solution {
public:
    double findMedianSortedArrays(vector<int>& nums1, vector<int>& nums2) {
        vector<int> merged = nums1;
        merged.insert(merged.end(), nums2.begin(), nums2.end());
        sort(merged.begin(), merged.end());
        int n = merged.size();
        if (n % 2) return merged[n / 2];
        return (merged[n / 2 - 1] + merged[n / 2]) / 2.0;
    }
};`,
      },
      {
        title: "Walk Until the Middle",
        explanation: `**Intuition.** Only the central one or two values are needed.

**Steps.**
1. Merge with two pointers without storing output.
2. Track previous and current selected values.
3. Stop when the median index is reached.

**Why it is correct.** The pointer walk produces the same prefix as a true merge, so the tracked center values are correct.

**Pitfalls.** Handle one exhausted array before reading from it.`,
        time: "O(m+n)",
        space: "O(1)",
        python: `class Solution:
    def findMedianSortedArrays(self, nums1: List[int], nums2: List[int]) -> float:
        total = len(nums1) + len(nums2)
        need = total // 2
        i = j = 0
        prev = cur = 0
        for _ in range(need + 1):
            prev = cur
            if j == len(nums2) or (i < len(nums1) and nums1[i] <= nums2[j]):
                cur = nums1[i]
                i += 1
            else:
                cur = nums2[j]
                j += 1
        return float(cur) if total % 2 else (prev + cur) / 2
`,
        cpp: `class Solution {
public:
    double findMedianSortedArrays(vector<int>& nums1, vector<int>& nums2) {
        int total = nums1.size() + nums2.size(), need = total / 2;
        int i = 0, j = 0, prev = 0, cur = 0;
        for (int step = 0; step <= need; ++step) {
            prev = cur;
            if (j == (int)nums2.size() || (i < (int)nums1.size() && nums1[i] <= nums2[j])) cur = nums1[i++];
            else cur = nums2[j++];
        }
        return total % 2 ? cur : (prev + cur) / 2.0;
    }
};`,
      },
      {
        title: "Binary Search Partition",
        explanation: `**Intuition.** Choose a cut in the shorter array and infer the matching cut in the longer array.

**Steps.**
1. Binary-search the count taken from the shorter array.
2. Check the four border values around the cuts.
3. When both left borders are no larger than both right borders, compute the median.

**Why it is correct.** A valid partition has the correct half size and every left value no greater than every right value, exactly characterizing the median split.

**Pitfalls.** Use sentinels for empty sides and put the extra item on the left for odd totals.`,
        time: "O(log min(m,n))",
        space: "O(1)",
        python: `class Solution:
    def findMedianSortedArrays(self, nums1: List[int], nums2: List[int]) -> float:
        if len(nums1) > len(nums2):
            return self.findMedianSortedArrays(nums2, nums1)
        m, n = len(nums1), len(nums2)
        half = (m + n + 1) // 2
        lo, hi = 0, m
        while lo <= hi:
            i = (lo + hi) // 2
            j = half - i
            left1 = nums1[i - 1] if i else -math.inf
            right1 = nums1[i] if i < m else math.inf
            left2 = nums2[j - 1] if j else -math.inf
            right2 = nums2[j] if j < n else math.inf
            if left1 <= right2 and left2 <= right1:
                if (m + n) % 2:
                    return float(max(left1, left2))
                return (max(left1, left2) + min(right1, right2)) / 2
            if left1 > right2:
                hi = i - 1
            else:
                lo = i + 1
        return 0.0
`,
        cpp: `class Solution {
public:
    double findMedianSortedArrays(vector<int>& nums1, vector<int>& nums2) {
        if (nums1.size() > nums2.size()) return findMedianSortedArrays(nums2, nums1);
        int m = nums1.size(), n = nums2.size(), half = (m + n + 1) / 2;
        int lo = 0, hi = m;
        while (lo <= hi) {
            int i = (lo + hi) / 2, j = half - i;
            int left1 = i == 0 ? INT_MIN : nums1[i - 1];
            int right1 = i == m ? INT_MAX : nums1[i];
            int left2 = j == 0 ? INT_MIN : nums2[j - 1];
            int right2 = j == n ? INT_MAX : nums2[j];
            if (left1 <= right2 && left2 <= right1) {
                if ((m + n) % 2) return max(left1, left2);
                return (max(left1, left2) + min(right1, right2)) / 2.0;
            }
            if (left1 > right2) hi = i - 1;
            else lo = i + 1;
        }
        return 0.0;
    }
};`,
      },
    ],
    viz: "binary-search",
  },
]

export default problems
