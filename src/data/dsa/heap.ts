import type { DsaProblem } from '../../types/content'

const problems: DsaProblem[] = [
  {
    id: "kth-largest-element-in-a-stream",
    title: "Kth Largest Element in a Stream",
    number: 703,
    difficulty: "Easy",
    category: "Heap / Priority Queue",
    pattern: "Top-K Heap",
    description: `Design \`KthLargest\`, initialized with \`k\` and an initial stream of numbers. Each call to \`add(val)\` appends one value and returns the current kth largest value among all values seen so far.`,
    examples: [{"input":"ops = [\"KthLargest\",\"add\",\"add\",\"add\",\"add\",\"add\"], args = [[3,[4,5,8,2]],[3],[5],[10],[9],[4]]","output":"[null,4,5,5,8,8]","explanation":"After every insertion, the third largest value is reported."},{"input":"ops = [\"KthLargest\",\"add\",\"add\",\"add\",\"add\",\"add\"], args = [[1,[]],[-3],[-2],[-4],[0],[4]]","output":"[null,-3,-2,-2,0,4]","explanation":"When `k = 1`, the answer is the maximum so far."},{"input":"ops = [\"KthLargest\",\"add\",\"add\",\"add\",\"add\",\"add\"], args = [[2,[0]],[-1],[1],[-2],[-4],[3]]","output":"[null,-1,0,0,0,1]","explanation":"The initial stream can have fewer than `k` values before the first add."}],
    constraints: ["`1 <= k <= 10^4`","`0 <= nums.length <= 10^4`","`-10^4 <= nums[i], val <= 10^4`","Each test calls `add` only after at least `k` values have been seen."],
    hints: ["Only the largest `k` values can affect the answer.","A min-heap of size `k` keeps the kth largest at the root.","If a new value is not larger than the heap root and the heap is full, it cannot change the answer."],
    signature: {"kind":"class","className":"KthLargest","ctorParams":[{"name":"k","type":"int"},{"name":"nums","type":"int[]"}],"methods":[{"name":"add","params":[{"name":"val","type":"int"}],"returns":"int"}]},
    tests: [{"ops":["KthLargest","add","add","add","add","add"],"args":[[3,[4,5,8,2]],[3],[5],[10],[9],[4]],"expected":[null,4,5,5,8,8]},{"ops":["KthLargest","add","add","add","add","add"],"args":[[1,[]],[-3],[-2],[-4],[0],[4]],"expected":[null,-3,-2,-2,0,4]},{"ops":["KthLargest","add","add","add","add","add"],"args":[[2,[0]],[-1],[1],[-2],[-4],[3]],"expected":[null,-1,0,0,0,1]},{"ops":["KthLargest","add","add","add","add"],"args":[[3,[4,5]],[8],[2],[10],[9]],"expected":[null,4,4,5,8]},{"ops":["KthLargest","add","add","add"],"args":[[2,[-10,-7,-3]],[-4],[-2],[-20]],"expected":[null,-4,-3,-3]},{"ops":["KthLargest","add","add","add","add"],"args":[[4,[5,1,9,3]],[2],[10],[0],[8]],"expected":[null,2,3,3,5]}],
    solutions: [
      {
        title: "Maintain Sorted List",
        explanation: `**Intuition.** Keep all stream values sorted so the kth largest is an index lookup.

**Steps.**
1. Sort the initial values.
2. Insert each new value at its sorted position.
3. Return the element \`k\` positions from the end.

**Correctness.** The list contains exactly all values seen in sorted order, so index \`len - k\` is the kth largest after each insertion.

**Pitfalls.** Insertion is linear because elements may need to shift.`,
        time: "O(n) per add",
        space: "O(n)",
        python: `class KthLargest:
    def __init__(self, k: int, nums: List[int]):
        self.k = k
        self.nums = sorted(nums)

    def add(self, val: int) -> int:
        insort(self.nums, val)
        return self.nums[-self.k]`,
        cpp: `class KthLargest {
    int k;
    vector<int> nums;
public:
    KthLargest(int k, vector<int>& nums) : k(k), nums(nums) {
        sort(this->nums.begin(), this->nums.end());
    }
    int add(int val) {
        nums.insert(lower_bound(nums.begin(), nums.end(), val), val);
        return nums[nums.size() - k];
    }
};`,
      },
      {
        title: "Size-k Min-heap",
        explanation: `**Intuition.** Keep only the current top \`k\` values in a min-heap.

**Steps.**
1. Push values until the heap has size \`k\`.
2. After that, replace the root only when the new value is larger.
3. Return the heap root.

**Correctness.** The heap stores the largest \`k\` values seen so far; the smallest among them is therefore the kth largest overall.

**Pitfalls.** Do not let the heap grow beyond \`k\`, or the root will no longer mean kth largest.`,
        time: "O(log k) per add",
        space: "O(k)",
        python: `class KthLargest:
    def __init__(self, k: int, nums: List[int]):
        self.k = k
        self.heap = []
        for x in nums:
            self.add(x)

    def add(self, val: int) -> int:
        if len(self.heap) < self.k:
            heappush(self.heap, val)
        elif val > self.heap[0]:
            heapreplace(self.heap, val)
        return self.heap[0]`,
        cpp: `class KthLargest {
    int k;
    priority_queue<int, vector<int>, greater<int>> pq;
public:
    KthLargest(int k, vector<int>& nums) : k(k) {
        for (int x : nums) add(x);
    }
    int add(int val) {
        if ((int)pq.size() < k) pq.push(val);
        else if (val > pq.top()) { pq.pop(); pq.push(val); }
        return pq.top();
    }
};`,
      },
    ],
    viz: "heap",
  },
  {
    id: "last-stone-weight",
    title: "Last Stone Weight",
    number: 1046,
    difficulty: "Easy",
    category: "Heap / Priority Queue",
    pattern: "Max Heap Simulation",
    description: `Repeatedly smash the two heaviest stones. Equal stones both disappear; otherwise the difference is put back as a new stone. Return the final stone weight, or \`0\` when none remain.`,
    examples: [{"input":"stones = [2,7,4,1,8,1]","output":"1"},{"input":"stones = [1]","output":"1"},{"input":"stones = [3,3]","output":"0"}],
    constraints: ["`0 <= stones.length <= 30`","`1 <= stones[i] <= 1000`","Each smash always chooses the two current heaviest stones."],
    hints: ["The operation repeatedly needs the maximum remaining values.","Sorting after every smash is correct but wasteful.","A max-heap gives the two heaviest stones with logarithmic updates."],
    signature: {"kind":"function","name":"lastStoneWeight","params":[{"name":"stones","type":"int[]"}],"returns":"int"},
    tests: [{"args":[[2,7,4,1,8,1]],"expected":1},{"args":[[1]],"expected":1},{"args":[[3,3]],"expected":0},{"args":[[]],"expected":0},{"args":[[10,4,2,10]],"expected":2},{"args":[[1,1,1,1]],"expected":0},{"args":[[31,26,33,21,40]],"expected":9},{"args":[[5,5,4]],"expected":4},{"args":[[9,3,2,10]],"expected":0}],
    solutions: [
      {
        title: "Repeated Sorting",
        explanation: `**Intuition.** After every smash, sort the stones and remove the two largest.

**Steps.**
1. Sort the list.
2. Pop the two largest stones.
3. Push back their positive difference, if any.

**Correctness.** Sorting makes the last two elements the current heaviest stones, so each simulated smash matches the rules exactly.

**Pitfalls.** Handle the empty list after all stones cancel.`,
        time: "O(n^2 log n)",
        space: "O(1)",
        python: `class Solution:
    def lastStoneWeight(self, stones: List[int]) -> int:
        stones = list(stones)
        while len(stones) > 1:
            stones.sort()
            y = stones.pop()
            x = stones.pop()
            if y != x:
                stones.append(y - x)
        return stones[0] if stones else 0`,
        cpp: `class Solution {
public:
    int lastStoneWeight(vector<int>& stones) {
        while (stones.size() > 1) {
            sort(stones.begin(), stones.end());
            int y = stones.back(); stones.pop_back();
            int x = stones.back(); stones.pop_back();
            if (y != x) stones.push_back(y - x);
        }
        return stones.empty() ? 0 : stones[0];
    }
};`,
      },
      {
        title: "Max Heap",
        explanation: `**Intuition.** A heap maintains the next heaviest stone efficiently.

**Steps.**
1. Negate weights in Python to simulate a max-heap.
2. Pop the two largest values.
3. If they differ, push the difference back.

**Correctness.** The heap always returns the two maximum remaining weights, so every loop performs the required smash; when the loop ends the remaining heap is the answer.

**Pitfalls.** In Python, remember to negate both when pushing and popping.`,
        time: "O(n log n)",
        space: "O(n)",
        python: `class Solution:
    def lastStoneWeight(self, stones: List[int]) -> int:
        heap = [-x for x in stones]
        heapify(heap)
        while len(heap) > 1:
            y = -heappop(heap)
            x = -heappop(heap)
            if y != x:
                heappush(heap, -(y - x))
        return -heap[0] if heap else 0`,
        cpp: `class Solution {
public:
    int lastStoneWeight(vector<int>& stones) {
        priority_queue<int> pq(stones.begin(), stones.end());
        while (pq.size() > 1) {
            int y = pq.top(); pq.pop();
            int x = pq.top(); pq.pop();
            if (y != x) pq.push(y - x);
        }
        return pq.empty() ? 0 : pq.top();
    }
};`,
      },
    ],
    viz: "heap",
  },
  {
    id: "k-closest-points-to-origin",
    title: "K Closest Points to Origin",
    number: 973,
    difficulty: "Medium",
    category: "Heap / Priority Queue",
    pattern: "Top-K Heap",
    description: `Return any order of the \`k\` points with the smallest squared distance to \`(0, 0)\`. Test cases avoid ties at the cutoff so the answer set is unique.`,
    examples: [{"input":"points = [[1,3],[-2,2]], k = 1","output":"[[-2,2]]"},{"input":"points = [[3,3],[5,-1],[-2,4]], k = 2","output":"[[3,3],[-2,4]]"},{"input":"points = [[0,1],[2,2],[5,5]], k = 2","output":"[[0,1],[2,2]]"}],
    constraints: ["`0 <= points.length <= 10^4`","`0 <= k <= points.length`","`-10^4 <= xi, yi <= 10^4`","No test has a distance tie crossing the kth boundary."],
    hints: ["Squared distance is enough; no square root is needed.","Sorting all points is simple.","For large input, keep a max-heap of only the best `k` points."],
    signature: {"kind":"function","name":"kClosest","params":[{"name":"points","type":"int[][]"},{"name":"k","type":"int"}],"returns":"int[][]"},
    tests: [{"args":[[[1,3],[-2,2]],1],"expected":[[-2,2]]},{"args":[[[3,3],[5,-1],[-2,4]],2],"expected":[[3,3],[-2,4]]},{"args":[[[0,1],[2,2],[5,5]],2],"expected":[[0,1],[2,2]]},{"args":[[[1,0],[0,2],[2,2],[3,3]],2],"expected":[[1,0],[0,2]]},{"args":[[[-5,-4],[2,-1],[3,4],[0,6]],1],"expected":[[2,-1]]},{"args":[[[7,7]],1],"expected":[[7,7]]},{"args":[[[1,1],[-2,-3],[4,0],[0,-5]],3],"expected":[[1,1],[-2,-3],[4,0]]},{"args":[[[10,0],[0,9],[-1,-1],[2,3]],2],"expected":[[-1,-1],[2,3]]},{"args":[[],0],"expected":[]}],
    compare: "unordered",
    solutions: [
      {
        title: "Sort by Distance",
        explanation: `**Intuition.** Compute squared distance for every point and sort.

**Steps.**
1. Sort points by \`x*x + y*y\`.
2. Take the first \`k\` entries.
3. Return them in any order.

**Correctness.** Sorting orders all points by increasing distance, so the first \`k\` are exactly the closest \`k\` points.

**Pitfalls.** Use squared distance to avoid floating-point work.`,
        time: "O(n log n)",
        space: "O(1) extra",
        python: `class Solution:
    def kClosest(self, points: List[List[int]], k: int) -> List[List[int]]:
        points = sorted(points, key=lambda p: p[0] * p[0] + p[1] * p[1])
        return points[:k]`,
        cpp: `class Solution {
public:
    vector<vector<int>> kClosest(vector<vector<int>>& points, int k) {
        sort(points.begin(), points.end(), [](const vector<int>& a, const vector<int>& b) {
            return a[0] * a[0] + a[1] * a[1] < b[0] * b[0] + b[1] * b[1];
        });
        return vector<vector<int>>(points.begin(), points.begin() + k);
    }
};`,
      },
      {
        title: "Max Heap of Size k",
        explanation: `**Intuition.** Keep only the current closest \`k\` points while scanning.

**Steps.**
1. Push each point with its distance into a max-heap.
2. If the heap grows beyond \`k\`, remove the farthest saved point.
3. Return the remaining heap points.

**Correctness.** After each scan step, the heap contains the closest \`k\` among points seen so far; removing the farthest restores the invariant.

**Pitfalls.** For \`k = 0\`, every pushed point is immediately removed and the answer is empty.`,
        time: "O(n log k)",
        space: "O(k)",
        python: `class Solution:
    def kClosest(self, points: List[List[int]], k: int) -> List[List[int]]:
        heap = []
        for x, y in points:
            dist = x * x + y * y
            heappush(heap, (-dist, x, y))
            if len(heap) > k:
                heappop(heap)
        return [[x, y] for _, x, y in heap]`,
        cpp: `class Solution {
public:
    vector<vector<int>> kClosest(vector<vector<int>>& points, int k) {
        priority_queue<pair<int, vector<int>>> pq;
        for (auto& p : points) {
            int d = p[0] * p[0] + p[1] * p[1];
            pq.push({d, p});
            if ((int)pq.size() > k) pq.pop();
        }
        vector<vector<int>> ans;
        while (!pq.empty()) { ans.push_back(pq.top().second); pq.pop(); }
        return ans;
    }
};`,
      },
    ],
    viz: "heap",
  },
  {
    id: "kth-largest-element-in-an-array",
    title: "Kth Largest Element in an Array",
    number: 215,
    difficulty: "Medium",
    category: "Heap / Priority Queue",
    pattern: "Selection Heap",
    description: `Return the kth largest value in the array after sorting conceptually in descending order. Duplicates count as separate elements.`,
    examples: [{"input":"nums = [3,2,1,5,6,4], k = 2","output":"5"},{"input":"nums = [3,2,3,1,2,4,5,5,6], k = 4","output":"4"},{"input":"nums = [-1,-1], k = 2","output":"-1"}],
    constraints: ["`1 <= nums.length <= 10^5`","`1 <= k <= nums.length`","`-10^4 <= nums[i] <= 10^4`","Duplicate values are counted individually."],
    hints: ["Sorting solves the problem directly.","A min-heap of size `k` can discard values too small to matter.","After scanning all numbers, the heap root is the kth largest."],
    signature: {"kind":"function","name":"findKthLargest","params":[{"name":"nums","type":"int[]"},{"name":"k","type":"int"}],"returns":"int"},
    tests: [{"args":[[3,2,1,5,6,4],2],"expected":5},{"args":[[3,2,3,1,2,4,5,5,6],4],"expected":4},{"args":[[-1,-1],2],"expected":-1},{"args":[[1],1],"expected":1},{"args":[[7,6,5,4,3,2,1],5],"expected":3},{"args":[[-5,-2,-3,-1],1],"expected":-1},{"args":[[2,1,2,1],3],"expected":1},{"args":[[100,-100,50,50],2],"expected":50}],
    solutions: [
      {
        title: "Sort Descending",
        explanation: `**Intuition.** Sort the array from largest to smallest and index into it.

**Steps.**
1. Sort with reverse order.
2. Return \`nums[k - 1]\`.
3. Keep duplicates in the sorted array.

**Correctness.** Descending sorted order defines the rank directly, so the element at index \`k - 1\` is the kth largest.

**Pitfalls.** Do not remove duplicates before ranking.`,
        time: "O(n log n)",
        space: "O(1) extra",
        python: `class Solution:
    def findKthLargest(self, nums: List[int], k: int) -> int:
        nums = sorted(nums, reverse=True)
        return nums[k - 1]`,
        cpp: `class Solution {
public:
    int findKthLargest(vector<int>& nums, int k) {
        sort(nums.begin(), nums.end(), greater<int>());
        return nums[k - 1];
    }
};`,
      },
      {
        title: "Min Heap of Size k",
        explanation: `**Intuition.** Keep the largest \`k\` values seen so far.

**Steps.**
1. Push each number into a min-heap.
2. If the heap size exceeds \`k\`, pop the smallest.
3. Return the root after the scan.

**Correctness.** The heap invariant leaves exactly the largest \`k\` values in the heap, and the smallest among them is the kth largest overall.

**Pitfalls.** The heap should pop only after exceeding size \`k\`, not before.`,
        time: "O(n log k)",
        space: "O(k)",
        python: `class Solution:
    def findKthLargest(self, nums: List[int], k: int) -> int:
        heap = []
        for x in nums:
            heappush(heap, x)
            if len(heap) > k:
                heappop(heap)
        return heap[0]`,
        cpp: `class Solution {
public:
    int findKthLargest(vector<int>& nums, int k) {
        priority_queue<int, vector<int>, greater<int>> pq;
        for (int x : nums) {
            pq.push(x);
            if ((int)pq.size() > k) pq.pop();
        }
        return pq.top();
    }
};`,
      },
    ],
    viz: "heap",
  },
  {
    id: "task-scheduler",
    title: "Task Scheduler",
    number: 621,
    difficulty: "Medium",
    category: "Heap / Priority Queue",
    pattern: "Greedy Counting",
    description: `Given CPU tasks represented by capital letters and a cooldown \`n\`, return the minimum number of time slots needed to execute all tasks. The same letter must have at least \`n\` slots between two executions; idle slots are allowed.`,
    examples: [{"input":"tasks = [\"A\",\"A\",\"A\",\"B\",\"B\",\"B\"], n = 2","output":"8"},{"input":"tasks = [\"A\",\"A\",\"A\",\"B\",\"B\",\"B\"], n = 0","output":"6"},{"input":"tasks = [\"A\",\"A\",\"A\",\"B\",\"B\",\"B\"], n = 3","output":"10"}],
    constraints: ["`0 <= tasks.length <= 10^4`","Each task is an uppercase English letter.","`0 <= n <= 100`","A task takes exactly one slot."],
    hints: ["The most frequent tasks create the cooldown skeleton.","A heap simulation can always run the currently most frequent available task.","The formula is based on `(maxFreq - 1)` full frames plus all tasks tied for max frequency."],
    signature: {"kind":"function","name":"leastInterval","params":[{"name":"tasks","type":"char[]"},{"name":"n","type":"int"}],"returns":"int"},
    tests: [{"args":[["A","A","A","B","B","B"],2],"expected":8},{"args":[["A","A","A","B","B","B"],0],"expected":6},{"args":[["A","A","A","B","B","B"],3],"expected":10},{"args":[["A"],2],"expected":1},{"args":[["A","A","A","A"],3],"expected":13},{"args":[["A","B","C","D"],2],"expected":4},{"args":[["A","A","B","B","C","C"],1],"expected":6},{"args":[["A","A","A","B","C"],2],"expected":7},{"args":[[],2],"expected":0}],
    solutions: [
      {
        title: "Heap Simulation",
        explanation: `**Intuition.** At every time slot, run the available task with the largest remaining count.

**Steps.**
1. Count task frequencies and push counts into a max-heap.
2. After running a task, place it in a cooldown queue until it can be used again.
3. Advance time until both heap and cooldown queue are empty.

**Correctness.** Greedily running the most frequent available task leaves the most flexibility, and the cooldown queue enforces exactly when a task can return.

**Pitfalls.** If no task is available but cooldown remains, the loop still advances time for an idle slot.`,
        time: "O(T log A)",
        space: "O(A)",
        python: `class Solution:
    def leastInterval(self, tasks: List[str], n: int) -> int:
        if not tasks:
            return 0
        heap = [-c for c in Counter(tasks).values()]
        heapify(heap)
        cooldown = deque()
        time = 0
        while heap or cooldown:
            time += 1
            if heap:
                count = heappop(heap) + 1
                if count:
                    cooldown.append((time + n, count))
            if cooldown and cooldown[0][0] == time:
                heappush(heap, cooldown.popleft()[1])
        return time`,
        cpp: `class Solution {
public:
    int leastInterval(vector<char>& tasks, int n) {
        if (tasks.empty()) return 0;
        vector<int> cnt(26, 0);
        for (char c : tasks) cnt[c - 'A']++;
        priority_queue<int> pq;
        for (int c : cnt) if (c) pq.push(c);
        queue<pair<int, int>> cool;
        int time = 0;
        while (!pq.empty() || !cool.empty()) {
            ++time;
            if (!pq.empty()) {
                int c = pq.top(); pq.pop();
                if (--c) cool.push({time + n, c});
            }
            if (!cool.empty() && cool.front().first == time) {
                pq.push(cool.front().second);
                cool.pop();
            }
        }
        return time;
    }
};`,
      },
      {
        title: "Idle-slot Formula",
        explanation: `**Intuition.** The most common tasks determine the minimum frame length unless other tasks fill all gaps.

**Steps.**
1. Find the maximum frequency \`f\`.
2. Count how many task types have that frequency.
3. Return \`max(totalTasks, (f - 1) * (n + 1) + ties)\`.

**Correctness.** The \`f - 1\` gaps between copies of the most frequent tasks need frames of length \`n + 1\`; tied max tasks occupy the tail, and extra tasks can only fill idle spaces or extend the schedule.

**Pitfalls.** Use the max with total tasks so dense schedules with no idle time are handled.`,
        time: "O(T + A)",
        space: "O(A)",
        python: `class Solution:
    def leastInterval(self, tasks: List[str], n: int) -> int:
        if not tasks:
            return 0
        counts = Counter(tasks)
        max_count = max(counts.values())
        ties = sum(1 for c in counts.values() if c == max_count)
        frame = (max_count - 1) * (n + 1) + ties
        return max(len(tasks), frame)`,
        cpp: `class Solution {
public:
    int leastInterval(vector<char>& tasks, int n) {
        if (tasks.empty()) return 0;
        vector<int> cnt(26, 0);
        for (char c : tasks) cnt[c - 'A']++;
        int mx = *max_element(cnt.begin(), cnt.end());
        int ties = count(cnt.begin(), cnt.end(), mx);
        return max((int)tasks.size(), (mx - 1) * (n + 1) + ties);
    }
};`,
      },
    ],
    viz: "heap",
  },
  {
    id: "design-twitter",
    title: "Design Twitter",
    number: 355,
    difficulty: "Medium",
    category: "Heap / Priority Queue",
    pattern: "Heap Merge Design",
    description: `Implement a small social feed service. \`postTweet\` records a tweet, \`follow\` and \`unfollow\` update relationships, and \`getNewsFeed(userId)\` returns up to 10 most recent tweet ids by the user and accounts they follow.`,
    examples: [{"input":"ops = [\"Twitter\",\"postTweet\",\"getNewsFeed\",\"follow\",\"postTweet\",\"getNewsFeed\",\"unfollow\",\"getNewsFeed\"], args = [[],[1,5],[1],[1,2],[2,6],[1],[1,2],[1]]","output":"[null,null,[5],null,null,[6,5],null,[5]]","explanation":"The feed changes after follow and unfollow operations."},{"input":"ops = [\"Twitter\",\"postTweet\",\"postTweet\",\"getNewsFeed\",\"postTweet\",\"follow\",\"getNewsFeed\",\"postTweet\",\"getNewsFeed\"], args = [[],[1,5],[1,3],[1],[2,101],[1,2],[1],[2,102],[1]]","output":"[null,null,null,[3,5],null,null,[101,3,5],null,[102,101,3,5]]","explanation":"More recent tweets appear before older tweets."},{"input":"ops = [\"Twitter\", eleven posts by user 1, \"getNewsFeed\"], args = [[], [1,1]...[1,11], [1]]","output":"[null,null,null,null,null,null,null,null,null,null,null,null,[11,10,9,8,7,6,5,4,3,2]]","explanation":"Only the 10 most recent tweets are returned."}],
    constraints: ["`1 <= userId, followerId, followeeId <= 500`","`0 <= tweetId <= 10^4`","`getNewsFeed` returns at most 10 tweet ids.","Following yourself is ignored; users always see their own tweets."],
    hints: ["Store a monotonically increasing timestamp with each tweet.","For a simple version, gather all candidate tweets and sort by timestamp.","For a scalable version, merge the latest tweet list from each followed user with a heap."],
    signature: {"kind":"class","className":"Twitter","ctorParams":[],"methods":[{"name":"postTweet","params":[{"name":"userId","type":"int"},{"name":"tweetId","type":"int"}],"returns":"void"},{"name":"getNewsFeed","params":[{"name":"userId","type":"int"}],"returns":"int[]"},{"name":"follow","params":[{"name":"followerId","type":"int"},{"name":"followeeId","type":"int"}],"returns":"void"},{"name":"unfollow","params":[{"name":"followerId","type":"int"},{"name":"followeeId","type":"int"}],"returns":"void"}]},
    tests: [{"ops":["Twitter","postTweet","getNewsFeed","follow","postTweet","getNewsFeed","unfollow","getNewsFeed"],"args":[[],[1,5],[1],[1,2],[2,6],[1],[1,2],[1]],"expected":[null,null,[5],null,null,[6,5],null,[5]]},{"ops":["Twitter","postTweet","postTweet","getNewsFeed","postTweet","follow","getNewsFeed","postTweet","getNewsFeed"],"args":[[],[1,5],[1,3],[1],[2,101],[1,2],[1],[2,102],[1]],"expected":[null,null,null,[3,5],null,null,[101,3,5],null,[102,101,3,5]]},{"ops":["Twitter","postTweet","postTweet","postTweet","postTweet","postTweet","postTweet","postTweet","postTweet","postTweet","postTweet","postTweet","getNewsFeed"],"args":[[],[1,1],[1,2],[1,3],[1,4],[1,5],[1,6],[1,7],[1,8],[1,9],[1,10],[1,11],[1]],"expected":[null,null,null,null,null,null,null,null,null,null,null,null,[11,10,9,8,7,6,5,4,3,2]]},{"ops":["Twitter","postTweet","postTweet","follow","unfollow","getNewsFeed"],"args":[[],[1,1],[2,2],[1,2],[1,2],[1]],"expected":[null,null,null,null,null,[1]]},{"ops":["Twitter","follow","unfollow","postTweet","getNewsFeed"],"args":[[],[1,1],[1,1],[1,10],[1]],"expected":[null,null,null,null,[10]]},{"ops":["Twitter","postTweet","follow","postTweet","follow","postTweet","getNewsFeed","unfollow","getNewsFeed"],"args":[[],[2,20],[1,2],[3,30],[1,3],[1,10],[1],[1,2],[1]],"expected":[null,null,null,null,null,null,[10,30,20],null,[10,30]]}],
    solutions: [
      {
        title: "Gather and Sort Feed",
        explanation: `**Intuition.** Store all tweets per user, then sort the visible tweets whenever a feed is requested.

**Steps.**
1. Append \`(time, tweetId)\` for each post.
2. Maintain a set of followed users for each account.
3. For \`getNewsFeed\`, gather self plus followed users, sort by time descending, and take 10.

**Correctness.** The candidate set contains exactly tweets the user is allowed to see, and sorting by timestamp returns them in newest-first order.

**Pitfalls.** Always include the user’s own tweets even after unfollow operations.`,
        time: "O(F log F) per feed, where F is visible tweets",
        space: "O(T + R)",
        python: `class Twitter:
    def __init__(self):
        self.time = 0
        self.tweets = defaultdict(list)
        self.following = defaultdict(set)

    def postTweet(self, userId: int, tweetId: int) -> None:
        self.time += 1
        self.tweets[userId].append((self.time, tweetId))

    def getNewsFeed(self, userId: int) -> List[int]:
        users = set(self.following[userId])
        users.add(userId)
        items = []
        for user in users:
            items.extend(self.tweets[user])
        items.sort(reverse=True)
        return [tweet for _, tweet in items[:10]]

    def follow(self, followerId: int, followeeId: int) -> None:
        if followerId != followeeId:
            self.following[followerId].add(followeeId)

    def unfollow(self, followerId: int, followeeId: int) -> None:
        if followerId != followeeId:
            self.following[followerId].discard(followeeId)`,
        cpp: `class Twitter {
    int timer = 0;
    unordered_map<int, vector<pair<int, int>>> tweets;
    unordered_map<int, unordered_set<int>> following;
public:
    Twitter() {}
    void postTweet(int userId, int tweetId) {
        tweets[userId].push_back({++timer, tweetId});
    }
    vector<int> getNewsFeed(int userId) {
        vector<pair<int, int>> items;
        following[userId].insert(userId);
        for (int user : following[userId]) {
            for (auto& t : tweets[user]) items.push_back(t);
        }
        sort(items.rbegin(), items.rend());
        vector<int> ans;
        for (int i = 0; i < (int)items.size() && i < 10; ++i) ans.push_back(items[i].second);
        return ans;
    }
    void follow(int followerId, int followeeId) {
        if (followerId != followeeId) following[followerId].insert(followeeId);
    }
    void unfollow(int followerId, int followeeId) {
        if (followerId != followeeId) following[followerId].erase(followeeId);
    }
};`,
      },
      {
        title: "Heap Merge Recent Lists",
        explanation: `**Intuition.** Each user’s tweet list is already in chronological order, so merge the latest items with a heap.

**Steps.**
1. Push the newest tweet of the user and each followee into a max-heap.
2. Pop the newest tweet, append it, and push the previous tweet from the same user.
3. Stop after 10 tweets or when the heap empties.

**Correctness.** The heap always contains the newest unseen tweet from each candidate user, so repeated pops produce the global newest tweets in order.

**Pitfalls.** Store the tweet index with each heap entry so you can move backward in that user’s list.`,
        time: "O(10 log U) per feed",
        space: "O(T + R + U)",
        python: `class Twitter:
    def __init__(self):
        self.time = 0
        self.tweets = defaultdict(list)
        self.following = defaultdict(set)

    def postTweet(self, userId: int, tweetId: int) -> None:
        self.time += 1
        self.tweets[userId].append((self.time, tweetId))

    def getNewsFeed(self, userId: int) -> List[int]:
        users = set(self.following[userId])
        users.add(userId)
        heap = []
        for user in users:
            if self.tweets[user]:
                i = len(self.tweets[user]) - 1
                time, tweet = self.tweets[user][i]
                heappush(heap, (-time, tweet, user, i))
        ans = []
        while heap and len(ans) < 10:
            neg_time, tweet, user, i = heappop(heap)
            ans.append(tweet)
            if i > 0:
                time, prev_tweet = self.tweets[user][i - 1]
                heappush(heap, (-time, prev_tweet, user, i - 1))
        return ans

    def follow(self, followerId: int, followeeId: int) -> None:
        if followerId != followeeId:
            self.following[followerId].add(followeeId)

    def unfollow(self, followerId: int, followeeId: int) -> None:
        if followerId != followeeId:
            self.following[followerId].discard(followeeId)`,
        cpp: `class Twitter {
    int timer = 0;
    unordered_map<int, vector<pair<int, int>>> tweets;
    unordered_map<int, unordered_set<int>> following;
public:
    Twitter() {}
    void postTweet(int userId, int tweetId) {
        tweets[userId].push_back({++timer, tweetId});
    }
    vector<int> getNewsFeed(int userId) {
        following[userId].insert(userId);
        priority_queue<tuple<int, int, int, int>> pq;
        for (int user : following[userId]) {
            int i = (int)tweets[user].size() - 1;
            if (i >= 0) {
                auto [time, tweet] = tweets[user][i];
                pq.push({time, tweet, user, i});
            }
        }
        vector<int> ans;
        while (!pq.empty() && (int)ans.size() < 10) {
            auto [time, tweet, user, i] = pq.top(); pq.pop();
            ans.push_back(tweet);
            if (i > 0) {
                auto [pt, prevTweet] = tweets[user][i - 1];
                pq.push({pt, prevTweet, user, i - 1});
            }
        }
        return ans;
    }
    void follow(int followerId, int followeeId) {
        if (followerId != followeeId) following[followerId].insert(followeeId);
    }
    void unfollow(int followerId, int followeeId) {
        if (followerId != followeeId) following[followerId].erase(followeeId);
    }
};`,
      },
    ],
    viz: "heap",
  },
  {
    id: "find-median-from-data-stream",
    title: "Find Median from Data Stream",
    number: 295,
    difficulty: "Hard",
    category: "Heap / Priority Queue",
    pattern: "Two Heaps",
    description: `Design \`MedianFinder\` for a stream of integers. \`addNum(num)\` inserts one number, and \`findMedian()\` returns the median of all inserted numbers so far as a floating-point value.`,
    examples: [{"input":"ops = [\"MedianFinder\",\"addNum\",\"addNum\",\"findMedian\",\"addNum\",\"findMedian\"], args = [[],[1],[2],[],[3],[]]","output":"[null,null,null,1.5,null,2.0]","explanation":"The median after `[1,2]` is `1.5`, and after `[1,2,3]` is `2`."},{"input":"ops = [\"MedianFinder\",\"addNum\",\"findMedian\",\"addNum\",\"findMedian\",\"addNum\",\"findMedian\",\"addNum\",\"findMedian\"], args = [[],[5],[],[15],[],[1],[],[3],[]]","output":"[null,null,5.0,null,10.0,null,5.0,null,4.0]","explanation":"The structure must support both odd and even counts."},{"input":"ops = [\"MedianFinder\",\"addNum\",\"addNum\",\"findMedian\",\"addNum\",\"findMedian\"], args = [[],[-1],[-2],[],[-3],[]]","output":"[null,null,null,-1.5,null,-2.0]","explanation":"Negative values are ordered normally."}],
    constraints: ["`-10^5 <= num <= 10^5`","At least one number is present before each `findMedian` call.","There may be up to `5 * 10^4` operations."],
    hints: ["If numbers stay sorted, the middle value is easy to read.","Two heaps can store the lower half and upper half separately.","Keep the lower half the same size as, or one larger than, the upper half."],
    signature: {"kind":"class","className":"MedianFinder","ctorParams":[],"methods":[{"name":"addNum","params":[{"name":"num","type":"int"}],"returns":"void"},{"name":"findMedian","params":[],"returns":"double"}]},
    tests: [{"ops":["MedianFinder","addNum","addNum","findMedian","addNum","findMedian"],"args":[[],[1],[2],[],[3],[]],"expected":[null,null,null,1.5,null,2.0]},{"ops":["MedianFinder","addNum","findMedian","addNum","findMedian","addNum","findMedian","addNum","findMedian"],"args":[[],[5],[],[15],[],[1],[],[3],[]],"expected":[null,null,5.0,null,10.0,null,5.0,null,4.0]},{"ops":["MedianFinder","addNum","addNum","findMedian","addNum","findMedian"],"args":[[],[-1],[-2],[],[-3],[]],"expected":[null,null,null,-1.5,null,-2.0]},{"ops":["MedianFinder","addNum","findMedian"],"args":[[],[42],[]],"expected":[null,null,42.0]},{"ops":["MedianFinder","addNum","addNum","addNum","addNum","findMedian","addNum","findMedian"],"args":[[],[2],[2],[2],[2],[],[3],[]],"expected":[null,null,null,null,null,2.0,null,2.0]},{"ops":["MedianFinder","addNum","addNum","findMedian","addNum","addNum","findMedian","addNum","findMedian"],"args":[[],[100],[-100],[],[50],[-50],[],[0],[]],"expected":[null,null,null,0.0,null,null,0.0,null,0.0]}],
    solutions: [
      {
        title: "Sorted List",
        explanation: `**Intuition.** Maintain all numbers in sorted order after every insertion.

**Steps.**
1. Insert each new value at its sorted position.
2. For odd length, return the middle element.
3. For even length, average the two middle elements.

**Correctness.** The sorted list order is the definition of rank, so the middle index or middle pair gives the median exactly.

**Pitfalls.** Insertion is linear in an array-backed list.`,
        time: "O(n) per add, O(1) per median",
        space: "O(n)",
        python: `class MedianFinder:
    def __init__(self):
        self.nums = []

    def addNum(self, num: int) -> None:
        insort(self.nums, num)

    def findMedian(self) -> float:
        n = len(self.nums)
        if n % 2:
            return float(self.nums[n // 2])
        return (self.nums[n // 2 - 1] + self.nums[n // 2]) / 2`,
        cpp: `class MedianFinder {
    vector<int> nums;
public:
    MedianFinder() {}
    void addNum(int num) {
        nums.insert(lower_bound(nums.begin(), nums.end(), num), num);
    }
    double findMedian() {
        int n = nums.size();
        if (n % 2) return nums[n / 2];
        return (nums[n / 2 - 1] + nums[n / 2]) / 2.0;
    }
};`,
      },
      {
        title: "Two Heaps",
        explanation: `**Intuition.** Balance a max-heap for the lower half with a min-heap for the upper half.

**Steps.**
1. Push into the lower heap, then move its largest value to the upper heap.
2. If the upper heap becomes larger, move its smallest value back.
3. Read the lower top for odd counts or average both tops for even counts.

**Correctness.** All lower-half values are kept less than or equal to upper-half values, and the size invariant places the median at the heap tops.

**Pitfalls.** Negate values for Python’s max-heap simulation.`,
        time: "O(log n) per add, O(1) per median",
        space: "O(n)",
        python: `class MedianFinder:
    def __init__(self):
        self.small = []
        self.large = []

    def addNum(self, num: int) -> None:
        heappush(self.small, -num)
        heappush(self.large, -heappop(self.small))
        if len(self.large) > len(self.small):
            heappush(self.small, -heappop(self.large))

    def findMedian(self) -> float:
        if len(self.small) > len(self.large):
            return float(-self.small[0])
        return (-self.small[0] + self.large[0]) / 2`,
        cpp: `class MedianFinder {
    priority_queue<int> small;
    priority_queue<int, vector<int>, greater<int>> large;
public:
    MedianFinder() {}
    void addNum(int num) {
        small.push(num);
        large.push(small.top());
        small.pop();
        if (large.size() > small.size()) {
            small.push(large.top());
            large.pop();
        }
    }
    double findMedian() {
        if (small.size() > large.size()) return small.top();
        return (small.top() + large.top()) / 2.0;
    }
};`,
      },
    ],
    viz: "heap",
  },
]

export default problems
