import type { DsaProblem } from '../../types/content'

const problems: DsaProblem[] = [
  {
    "id": "insert-interval",
    "title": "Insert Interval",
    "number": 57,
    "difficulty": "Medium",
    "category": "Intervals",
    "pattern": "Merge Intervals",
    "description": "Insert a new interval into a sorted list of non-overlapping intervals and return the resulting sorted, non-overlapping list. The new interval may merge with zero or more existing intervals.",
    "examples": [
      {
        "input": "intervals = [[1,3],[6,9]], newInterval = [2,5]",
        "output": "[[1,5],[6,9]]"
      },
      {
        "input": "intervals = [[1,2],[3,5],[6,7],[8,10],[12,16]], newInterval = [4,8]",
        "output": "[[1,2],[3,10],[12,16]]"
      },
      {
        "input": "intervals = [], newInterval = [5,7]",
        "output": "[[5,7]]"
      }
    ],
    "constraints": [
      "0 <= intervals.length <= 10^4",
      "intervals is sorted by start and initially non-overlapping",
      "newInterval.length == 2",
      "0 <= start <= end <= 10^5"
    ],
    "hints": [
      "Copy intervals that end before the new one.",
      "Merge while starts are within the growing end.",
      "Append the untouched suffix after the merged interval."
    ],
    "signature": {
      "kind": "function",
      "name": "insert",
      "params": [
        {
          "name": "intervals",
          "type": "int[][]"
        },
        {
          "name": "newInterval",
          "type": "int[]"
        }
      ],
      "returns": "int[][]"
    },
    "tests": [
      {
        "args": [
          [
            [1, 3],
            [6, 9]
          ],
          [2, 5]
        ],
        "expected": [
          [1, 5],
          [6, 9]
        ]
      },
      {
        "args": [
          [
            [1, 2],
            [3, 5],
            [6, 7],
            [8, 10],
            [12, 16]
          ],
          [4, 8]
        ],
        "expected": [
          [1, 2],
          [3, 10],
          [12, 16]
        ]
      },
      {
        "args": [
          [],
          [5, 7]
        ],
        "expected": [
          [5, 7]
        ]
      },
      {
        "args": [
          [
            [1, 5]
          ],
          [2, 3]
        ],
        "expected": [
          [1, 5]
        ]
      },
      {
        "args": [
          [
            [1, 5]
          ],
          [6, 8]
        ],
        "expected": [
          [1, 5],
          [6, 8]
        ]
      },
      {
        "args": [
          [
            [3, 5],
            [12, 15]
          ],
          [6, 6]
        ],
        "expected": [
          [3, 5],
          [6, 6],
          [12, 15]
        ]
      },
      {
        "args": [
          [
            [1, 2],
            [5, 6]
          ],
          [3, 4]
        ],
        "expected": [
          [1, 2],
          [3, 4],
          [5, 6]
        ]
      },
      {
        "args": [
          [
            [1, 2],
            [5, 7],
            [8, 10]
          ],
          [6, 8]
        ],
        "expected": [
          [1, 2],
          [5, 10]
        ]
      }
    ],
    "solutions": [
      {
        "title": "Single pass splice",
        "explanation": `**Intuition:** Because the original intervals are sorted and non-overlapping, the new interval only has one contiguous overlap block.

**Steps:**
1. Sort or scan intervals so starts and ends are considered in a useful order.
2. Maintain the active merged interval, room count, or best candidate.
3. Emit or update the answer exactly when the maintained invariant decides it.

**Correctness:** Every interval before the block cannot overlap and every interval after the block starts too late. All intervals inside the block overlap the growing interval, so replacing them by their union is exactly the inserted result.

**Pitfalls:** Use <= for closed intervals that touch or overlap.`,
        "time": "O(n)",
        "space": "O(n)",
        "python": `class Solution:
    def insert(self, intervals: List[List[int]], newInterval: List[int]) -> List[List[int]]:
        res = []
        i = 0
        start, end = newInterval
        while i < len(intervals) and intervals[i][1] < start:
            res.append(intervals[i])
            i += 1
        while i < len(intervals) and intervals[i][0] <= end:
            start = min(start, intervals[i][0])
            end = max(end, intervals[i][1])
            i += 1
        res.append([start, end])
        res.extend(intervals[i:])
        return res
`,
        "cpp": `class Solution { public:
    vector<vector<int>> insert(vector<vector<int>>& intervals, vector<int>& newInterval) {
        vector<vector<int>> res;
        int i = 0, n = intervals.size(), s = newInterval[0], e = newInterval[1];
        while (i < n && intervals[i][1] < s) res.push_back(intervals[i++]);
        while (i < n && intervals[i][0] <= e) { s = min(s, intervals[i][0]); e = max(e, intervals[i][1]); ++i; }
        res.push_back({s, e});
        while (i < n) res.push_back(intervals[i++]);
        return res;
    }
};`
      },
      {
        "title": "Append then merge",
        "explanation": `**Intuition:** If we add the new interval to the list, the task becomes ordinary interval merging.

**Steps:**
1. Sort or scan intervals so starts and ends are considered in a useful order.
2. Maintain the active merged interval, room count, or best candidate.
3. Emit or update the answer exactly when the maintained invariant decides it.

**Correctness:** Sorting orders every possible overlap next to each other. The sweep maintains the union of all intervals seen in the current component, so each emitted interval is maximal and non-overlapping.

**Pitfalls:** This is simpler but loses the O(n) advantage of the already-sorted input.`,
        "time": "O(n log n)",
        "space": "O(n)",
        "python": `class Solution:
    def insert(self, intervals: List[List[int]], newInterval: List[int]) -> List[List[int]]:
        arr = sorted(intervals + [newInterval])
        res = []
        for s, e in arr:
            if not res or s > res[-1][1]:
                res.append([s, e])
            else:
                res[-1][1] = max(res[-1][1], e)
        return res
`,
        "cpp": `class Solution { public:
    vector<vector<int>> insert(vector<vector<int>>& intervals, vector<int>& newInterval) {
        vector<vector<int>> arr = intervals;
        arr.push_back(newInterval);
        sort(arr.begin(), arr.end());
        vector<vector<int>> res;
        for (auto& in : arr) {
            if (res.empty() || in[0] > res.back()[1]) res.push_back(in);
            else res.back()[1] = max(res.back()[1], in[1]);
        }
        return res;
    }
};`
      }
    ],
    "viz": "intervals"
  },
  {
    "id": "merge-intervals",
    "title": "Merge Intervals",
    "number": 56,
    "difficulty": "Medium",
    "category": "Intervals",
    "pattern": "Merge Intervals",
    "description": "Given a list of intervals, combine all overlapping intervals and return a list of disjoint intervals covering the same ranges. The output should be sorted by start time.",
    "examples": [
      {
        "input": "intervals = [[1,3],[2,6],[8,10],[15,18]]",
        "output": "[[1,6],[8,10],[15,18]]"
      },
      {
        "input": "intervals = [[1,4],[4,5]]",
        "output": "[[1,5]]"
      },
      {
        "input": "intervals = [[1,4],[0,4]]",
        "output": "[[0,4]]"
      }
    ],
    "constraints": [
      "1 <= intervals.length <= 10^4",
      "intervals[i].length == 2",
      "0 <= start <= end <= 10^4",
      "Intervals may be unsorted"
    ],
    "hints": [
      "Sort by start time first.",
      "Only compare the next interval with the current merged interval.",
      "If the next start is beyond the current end, close the current interval."
    ],
    "signature": {
      "kind": "function",
      "name": "merge",
      "params": [
        {
          "name": "intervals",
          "type": "int[][]"
        }
      ],
      "returns": "int[][]"
    },
    "tests": [
      {
        "args": [
          [
            [1, 3],
            [2, 6],
            [8, 10],
            [15, 18]
          ]
        ],
        "expected": [
          [1, 6],
          [8, 10],
          [15, 18]
        ]
      },
      {
        "args": [
          [
            [1, 4],
            [4, 5]
          ]
        ],
        "expected": [
          [1, 5]
        ]
      },
      {
        "args": [
          [
            [1, 4],
            [0, 4]
          ]
        ],
        "expected": [
          [0, 4]
        ]
      },
      {
        "args": [
          [
            [1, 4]
          ]
        ],
        "expected": [
          [1, 4]
        ]
      },
      {
        "args": [
          [
            [1, 4],
            [2, 3]
          ]
        ],
        "expected": [
          [1, 4]
        ]
      },
      {
        "args": [
          [
            [5, 7],
            [1, 3],
            [2, 4]
          ]
        ],
        "expected": [
          [1, 4],
          [5, 7]
        ]
      },
      {
        "args": [
          [
            [1, 2],
            [3, 4]
          ]
        ],
        "expected": [
          [1, 2],
          [3, 4]
        ]
      },
      {
        "args": [
          [
            [1, 10],
            [2, 3],
            [4, 5],
            [6, 7]
          ]
        ],
        "expected": [
          [1, 10]
        ]
      }
    ],
    "solutions": [
      {
        "title": "Sort and sweep into output",
        "explanation": `**Intuition:** After sorting by start, overlapping intervals appear consecutively.

**Steps:**
1. Sort or scan intervals so starts and ends are considered in a useful order.
2. Maintain the active merged interval, room count, or best candidate.
3. Emit or update the answer exactly when the maintained invariant decides it.

**Correctness:** The current merged interval always equals the union of all processed intervals that overlap it. When the next start is after its end, no later interval can overlap it because starts are sorted, so it is safe to emit.

**Pitfalls:** Intervals that touch at an endpoint should merge for this problem.`,
        "time": "O(n log n)",
        "space": "O(n)",
        "python": `class Solution:
    def merge(self, intervals: List[List[int]]) -> List[List[int]]:
        intervals.sort()
        res = []
        for s, e in intervals:
            if not res or s > res[-1][1]:
                res.append([s, e])
            else:
                res[-1][1] = max(res[-1][1], e)
        return res
`,
        "cpp": `class Solution { public:
    vector<vector<int>> merge(vector<vector<int>>& intervals) {
        sort(intervals.begin(), intervals.end());
        vector<vector<int>> res;
        for (auto& in : intervals) {
            if (res.empty() || in[0] > res.back()[1]) res.push_back(in);
            else res.back()[1] = max(res.back()[1], in[1]);
        }
        return res;
    }
};`
      },
      {
        "title": "In-place compaction",
        "explanation": `**Intuition:** The merge sweep can write completed intervals back into the sorted array.

**Steps:**
1. Sort or scan intervals so starts and ends are considered in a useful order.
2. Maintain the active merged interval, room count, or best candidate.
3. Emit or update the answer exactly when the maintained invariant decides it.

**Correctness:** The write prefix stores exactly the merged intervals for all processed input. Extending changes only the last component; starting a new component appends one more correct interval.

**Pitfalls:** Return only the written prefix, not the full sorted array.`,
        "time": "O(n log n)",
        "space": "O(1) extra besides output)",
        "python": `class Solution:
    def merge(self, intervals: List[List[int]]) -> List[List[int]]:
        intervals.sort()
        write = 0
        for s, e in intervals:
            if write == 0 or s > intervals[write - 1][1]:
                intervals[write] = [s, e]
                write += 1
            else:
                intervals[write - 1][1] = max(intervals[write - 1][1], e)
        return intervals[:write]
`,
        "cpp": `class Solution { public:
    vector<vector<int>> merge(vector<vector<int>>& intervals) {
        sort(intervals.begin(), intervals.end());
        int w = 0;
        for (auto in : intervals) {
            if (w == 0 || in[0] > intervals[w - 1][1]) intervals[w++] = in;
            else intervals[w - 1][1] = max(intervals[w - 1][1], in[1]);
        }
        intervals.resize(w);
        return intervals;
    }
};`
      }
    ],
    "viz": "intervals"
  },
  {
    "id": "non-overlapping-intervals",
    "title": "Non-overlapping Intervals",
    "number": 435,
    "difficulty": "Medium",
    "category": "Intervals",
    "pattern": "Greedy by End Time",
    "description": "Return the minimum number of intervals to remove so the remaining intervals do not overlap. Intervals that only touch at an endpoint are allowed to remain together.",
    "examples": [
      {
        "input": "intervals = [[1,2],[2,3],[3,4],[1,3]]",
        "output": "1"
      },
      {
        "input": "intervals = [[1,2],[1,2],[1,2]]",
        "output": "2"
      },
      {
        "input": "intervals = [[1,2],[2,3]]",
        "output": "0"
      }
    ],
    "constraints": [
      "1 <= intervals.length <= 10^5",
      "intervals[i].length == 2",
      "-5 * 10^4 <= start < end <= 5 * 10^4",
      "Touching endpoints do not overlap"
    ],
    "hints": [
      "Min removals equals total minus max intervals kept.",
      "Choosing the earliest ending compatible interval is safe.",
      "Sort by end time, not by start time."
    ],
    "signature": {
      "kind": "function",
      "name": "eraseOverlapIntervals",
      "params": [
        {
          "name": "intervals",
          "type": "int[][]"
        }
      ],
      "returns": "int"
    },
    "tests": [
      {
        "args": [
          [
            [1, 2],
            [2, 3],
            [3, 4],
            [1, 3]
          ]
        ],
        "expected": 1
      },
      {
        "args": [
          [
            [1, 2],
            [1, 2],
            [1, 2]
          ]
        ],
        "expected": 2
      },
      {
        "args": [
          [
            [1, 2],
            [2, 3]
          ]
        ],
        "expected": 0
      },
      {
        "args": [
          [
            [1, 100],
            [11, 22],
            [1, 11],
            [2, 12]
          ]
        ],
        "expected": 2
      },
      {
        "args": [
          [
            [1, 2]
          ]
        ],
        "expected": 0
      },
      {
        "args": [
          [
            [0, 2],
            [1, 3],
            [2, 4],
            [3, 5],
            [4, 6]
          ]
        ],
        "expected": 2
      },
      {
        "args": [
          [
            [1, 5],
            [2, 3],
            [3, 4]
          ]
        ],
        "expected": 1
      },
      {
        "args": [
          [
            [1, 3],
            [1, 3],
            [1, 3],
            [3, 4]
          ]
        ],
        "expected": 2
      }
    ],
    "solutions": [
      {
        "title": "Dynamic programming baseline",
        "explanation": `**Intuition:** Maximize the number of intervals kept without overlap, then remove the rest.

**Steps:**
1. Sort or scan intervals so starts and ends are considered in a useful order.
2. Maintain the active merged interval, room count, or best candidate.
3. Emit or update the answer exactly when the maintained invariant decides it.

**Correctness:** For any kept set ending at interval i, its previous interval must end no later than i starts. The DP tries all such previous intervals, so it finds the maximum keep count. Removing the others is minimal.

**Pitfalls:** This is clear but quadratic.`,
        "time": "O(n^2)",
        "space": "O(n)",
        "python": `class Solution:
    def eraseOverlapIntervals(self, intervals: List[List[int]]) -> int:
        intervals.sort(key=lambda x: x[1])
        n = len(intervals)
        dp = [1] * n
        best = 1
        for i in range(n):
            for j in range(i):
                if intervals[j][1] <= intervals[i][0]:
                    dp[i] = max(dp[i], dp[j] + 1)
            best = max(best, dp[i])
        return n - best
`,
        "cpp": `class Solution { public:
    int eraseOverlapIntervals(vector<vector<int>>& intervals) {
        sort(intervals.begin(), intervals.end(), [](auto& a, auto& b){ return a[1] < b[1]; });
        int n = intervals.size(), best = 1;
        vector<int> dp(n, 1);
        for (int i = 0; i < n; ++i) {
            for (int j = 0; j < i; ++j) if (intervals[j][1] <= intervals[i][0]) dp[i] = max(dp[i], dp[j] + 1);
            best = max(best, dp[i]);
        }
        return n - best;
    }
};`
      },
      {
        "title": "Greedy earliest finish",
        "explanation": `**Intuition:** Keeping the interval that ends earliest leaves the most room for future intervals.

**Steps:**
1. Sort or scan intervals so starts and ends are considered in a useful order.
2. Maintain the active merged interval, room count, or best candidate.
3. Emit or update the answer exactly when the maintained invariant decides it.

**Correctness:** By the exchange argument, among intervals that could be kept next, replacing the chosen interval with the one that ends earliest cannot reduce the number of intervals that fit later. Repeating this yields a maximum kept set.

**Pitfalls:** Touching endpoints are non-overlapping, so use start >= end.`,
        "time": "O(n log n)",
        "space": "O(1)",
        "python": `class Solution:
    def eraseOverlapIntervals(self, intervals: List[List[int]]) -> int:
        intervals.sort(key=lambda x: x[1])
        end = -10**20
        keep = 0
        for s, e in intervals:
            if s >= end:
                keep += 1
                end = e
        return len(intervals) - keep
`,
        "cpp": `class Solution { public:
    int eraseOverlapIntervals(vector<vector<int>>& intervals) {
        sort(intervals.begin(), intervals.end(), [](auto& a, auto& b){ return a[1] < b[1]; });
        int keep = 0, end = INT_MIN;
        for (auto& in : intervals) if (in[0] >= end) { ++keep; end = in[1]; }
        return intervals.size() - keep;
    }
};`
      }
    ],
    "viz": "intervals"
  },
  {
    "id": "meeting-rooms",
    "title": "Meeting Rooms",
    "number": 252,
    "difficulty": "Easy",
    "category": "Intervals",
    "pattern": "Interval Overlap",
    "description": "Given meeting time intervals, return whether one person can attend all meetings. Meetings that end at the exact time another starts do not conflict.",
    "examples": [
      {
        "input": "intervals = [[0,30],[5,10],[15,20]]",
        "output": "false"
      },
      {
        "input": "intervals = [[7,10],[2,4]]",
        "output": "true"
      },
      {
        "input": "intervals = []",
        "output": "true"
      }
    ],
    "constraints": [
      "0 <= intervals.length <= 10^4",
      "intervals[i].length == 2",
      "0 <= start < end <= 10^6",
      "Back-to-back meetings are allowed"
    ],
    "hints": [
      "Sort meetings by start time.",
      "Only neighboring sorted meetings can create the first conflict.",
      "Use previous end > next start to detect overlap."
    ],
    "signature": {
      "kind": "function",
      "name": "canAttendMeetings",
      "params": [
        {
          "name": "intervals",
          "type": "int[][]"
        }
      ],
      "returns": "bool"
    },
    "tests": [
      {
        "args": [
          [
            [0, 30],
            [5, 10],
            [15, 20]
          ]
        ],
        "expected": false
      },
      {
        "args": [
          [
            [7, 10],
            [2, 4]
          ]
        ],
        "expected": true
      },
      {
        "args": [
          []
        ],
        "expected": true
      },
      {
        "args": [
          [
            [5, 8]
          ]
        ],
        "expected": true
      },
      {
        "args": [
          [
            [1, 5],
            [5, 8]
          ]
        ],
        "expected": true
      },
      {
        "args": [
          [
            [1, 10],
            [2, 3]
          ]
        ],
        "expected": false
      },
      {
        "args": [
          [
            [10, 12],
            [1, 5],
            [6, 9]
          ]
        ],
        "expected": true
      },
      {
        "args": [
          [
            [1, 2],
            [1, 2]
          ]
        ],
        "expected": false
      }
    ],
    "solutions": [
      {
        "title": "Sort and check neighbors",
        "explanation": `**Intuition:** After sorting meetings by start time, any conflict appears between adjacent meetings.

**Steps:**
1. Sort or scan intervals so starts and ends are considered in a useful order.
2. Maintain the active merged interval, room count, or best candidate.
3. Emit or update the answer exactly when the maintained invariant decides it.

**Correctness:** If two non-adjacent meetings overlap, then the earlier one also overlaps some adjacent meeting before the later start in sorted order. Therefore checking neighbors finds every conflict.

**Pitfalls:** Meetings ending exactly when another starts are allowed.`,
        "time": "O(n log n)",
        "space": "O(1) extra besides sort)",
        "python": `class Solution:
    def canAttendMeetings(self, intervals: List[List[int]]) -> bool:
        intervals.sort()
        for i in range(1, len(intervals)):
            if intervals[i - 1][1] > intervals[i][0]:
                return False
        return True
`,
        "cpp": `class Solution { public:
    bool canAttendMeetings(vector<vector<int>>& intervals) {
        sort(intervals.begin(), intervals.end());
        for (int i = 1; i < (int)intervals.size(); ++i) if (intervals[i - 1][1] > intervals[i][0]) return false;
        return true;
    }
};`
      },
      {
        "title": "Sweep line active count",
        "explanation": `**Intuition:** A person can attend all meetings iff the active meeting count never exceeds one.

**Steps:**
1. Sort or scan intervals so starts and ends are considered in a useful order.
2. Maintain the active merged interval, room count, or best candidate.
3. Emit or update the answer exactly when the maintained invariant decides it.

**Correctness:** The active count after each event is exactly the number of ongoing meetings. Any count above one is a time overlap; if it never happens, all meetings are disjoint.

**Pitfalls:** Sort end events before start events for back-to-back meetings.`,
        "time": "O(n log n)",
        "space": "O(n)",
        "python": `class Solution:
    def canAttendMeetings(self, intervals: List[List[int]]) -> bool:
        events = []
        for s, e in intervals:
            events.append((s, 1))
            events.append((e, -1))
        active = 0
        for _, delta in sorted(events, key=lambda x: (x[0], x[1])):
            active += delta
            if active > 1:
                return False
        return True
`,
        "cpp": `class Solution { public:
    bool canAttendMeetings(vector<vector<int>>& intervals) {
        vector<pair<int,int>> events;
        for (auto& in : intervals) { events.push_back({in[0], 1}); events.push_back({in[1], -1}); }
        sort(events.begin(), events.end(), [](auto& a, auto& b){ return a.first == b.first ? a.second < b.second : a.first < b.first; });
        int active = 0;
        for (auto [_, d] : events) { active += d; if (active > 1) return false; }
        return true;
    }
};`
      }
    ],
    "viz": "intervals"
  },
  {
    "id": "meeting-rooms-ii",
    "title": "Meeting Rooms II",
    "number": 253,
    "difficulty": "Medium",
    "category": "Intervals",
    "pattern": "Sweep Line",
    "description": "Return the minimum number of rooms needed to schedule every meeting interval. A room can be reused when a meeting ends at or before the next meeting starts.",
    "examples": [
      {
        "input": "intervals = [[0,30],[5,10],[15,20]]",
        "output": "2"
      },
      {
        "input": "intervals = [[7,10],[2,4]]",
        "output": "1"
      },
      {
        "input": "intervals = [[1,5],[2,6],[3,7]]",
        "output": "3"
      }
    ],
    "constraints": [
      "0 <= intervals.length <= 10^4",
      "intervals[i].length == 2",
      "0 <= start < end <= 10^6",
      "Rooms can be reused for back-to-back intervals"
    ],
    "hints": [
      "The answer is the maximum number of simultaneous meetings.",
      "A min-heap tracks the earliest room to become free.",
      "Pop all meetings that ended before the current start."
    ],
    "signature": {
      "kind": "function",
      "name": "minMeetingRooms",
      "params": [
        {
          "name": "intervals",
          "type": "int[][]"
        }
      ],
      "returns": "int"
    },
    "tests": [
      {
        "args": [
          [
            [0, 30],
            [5, 10],
            [15, 20]
          ]
        ],
        "expected": 2
      },
      {
        "args": [
          [
            [7, 10],
            [2, 4]
          ]
        ],
        "expected": 1
      },
      {
        "args": [
          [
            [1, 5],
            [2, 6],
            [3, 7]
          ]
        ],
        "expected": 3
      },
      {
        "args": [
          []
        ],
        "expected": 0
      },
      {
        "args": [
          [
            [1, 5],
            [5, 8],
            [8, 10]
          ]
        ],
        "expected": 1
      },
      {
        "args": [
          [
            [1, 10],
            [2, 3],
            [4, 5],
            [6, 7]
          ]
        ],
        "expected": 2
      },
      {
        "args": [
          [
            [1, 4],
            [1, 3],
            [1, 2]
          ]
        ],
        "expected": 3
      },
      {
        "args": [
          [
            [13, 15],
            [1, 13],
            [6, 9]
          ]
        ],
        "expected": 2
      }
    ],
    "solutions": [
      {
        "title": "Min-heap of ending meetings",
        "explanation": `**Intuition:** A room is reusable when its earliest ending meeting finishes before the next start.

**Steps:**
1. Sort or scan intervals so starts and ends are considered in a useful order.
2. Maintain the active merged interval, room count, or best candidate.
3. Emit or update the answer exactly when the maintained invariant decides it.

**Correctness:** The heap contains exactly meetings active at the current start time. Its maximum size over the sweep is therefore the minimum number of simultaneous rooms required.

**Pitfalls:** Use <= when freeing rooms for meetings that start exactly at an end time.`,
        "time": "O(n log n)",
        "space": "O(n)",
        "python": `class Solution:
    def minMeetingRooms(self, intervals: List[List[int]]) -> int:
        heap = []
        ans = 0
        for s, e in sorted(intervals):
            while heap and heap[0] <= s:
                heappop(heap)
            heappush(heap, e)
            ans = max(ans, len(heap))
        return ans
`,
        "cpp": `class Solution { public:
    int minMeetingRooms(vector<vector<int>>& intervals) {
        sort(intervals.begin(), intervals.end());
        priority_queue<int, vector<int>, greater<int>> pq;
        int ans = 0;
        for (auto& in : intervals) {
            while (!pq.empty() && pq.top() <= in[0]) pq.pop();
            pq.push(in[1]);
            ans = max(ans, (int)pq.size());
        }
        return ans;
    }
};`
      },
      {
        "title": "Sweep line event count",
        "explanation": `**Intuition:** The number of rooms equals the maximum number of overlapping meetings.

**Steps:**
1. Sort or scan intervals so starts and ends are considered in a useful order.
2. Maintain the active merged interval, room count, or best candidate.
3. Emit or update the answer exactly when the maintained invariant decides it.

**Correctness:** The active count is the number of meetings occupying rooms after each event, so its maximum is both necessary and sufficient for room allocation.

**Pitfalls:** Tie-breaking matters for back-to-back meetings.`,
        "time": "O(n log n)",
        "space": "O(n)",
        "python": `class Solution:
    def minMeetingRooms(self, intervals: List[List[int]]) -> int:
        events = []
        for s, e in intervals:
            events.append((s, 1))
            events.append((e, -1))
        active = ans = 0
        for _, delta in sorted(events, key=lambda x: (x[0], x[1])):
            active += delta
            ans = max(ans, active)
        return ans
`,
        "cpp": `class Solution { public:
    int minMeetingRooms(vector<vector<int>>& intervals) {
        vector<pair<int,int>> events;
        for (auto& in : intervals) { events.push_back({in[0], 1}); events.push_back({in[1], -1}); }
        sort(events.begin(), events.end(), [](auto& a, auto& b){ return a.first == b.first ? a.second < b.second : a.first < b.first; });
        int active = 0, ans = 0;
        for (auto [_, d] : events) { active += d; ans = max(ans, active); }
        return ans;
    }
};`
      }
    ],
    "viz": "intervals"
  },
  {
    "id": "minimum-interval-to-include-each-query",
    "title": "Minimum Interval to Include Each Query",
    "number": 1851,
    "difficulty": "Hard",
    "category": "Intervals",
    "pattern": "Offline Heap",
    "description": "For each query value, return the length of the shortest interval that contains it, or -1 if no interval contains that query. Answers must preserve the original query order.",
    "examples": [
      {
        "input": "intervals = [[1,4],[2,4],[3,6],[4,4]], queries = [2,3,4,5]",
        "output": "[3,3,1,4]"
      },
      {
        "input": "intervals = [[2,3],[2,5],[1,8],[20,25]], queries = [2,19,5,22]",
        "output": "[2,-1,4,6]"
      },
      {
        "input": "intervals = [[1,1]], queries = [1,2]",
        "output": "[1,-1]"
      }
    ],
    "constraints": [
      "1 <= intervals.length, queries.length <= 10^5",
      "intervals[i].length == 2",
      "1 <= left <= right <= 10^7",
      "1 <= queries[i] <= 10^7"
    ],
    "hints": [
      "Sort queries but remember their original indices.",
      "Add intervals whose left endpoint is no larger than the query.",
      "Remove heap entries whose right endpoint is smaller than the query."
    ],
    "signature": {
      "kind": "function",
      "name": "minInterval",
      "params": [
        {
          "name": "intervals",
          "type": "int[][]"
        },
        {
          "name": "queries",
          "type": "int[]"
        }
      ],
      "returns": "int[]"
    },
    "tests": [
      {
        "args": [
          [
            [1, 4],
            [2, 4],
            [3, 6],
            [4, 4]
          ],
          [2, 3, 4, 5]
        ],
        "expected": [3, 3, 1, 4]
      },
      {
        "args": [
          [
            [2, 3],
            [2, 5],
            [1, 8],
            [20, 25]
          ],
          [2, 19, 5, 22]
        ],
        "expected": [2, -1, 4, 6]
      },
      {
        "args": [
          [
            [1, 1]
          ],
          [1, 2]
        ],
        "expected": [1, -1]
      },
      {
        "args": [
          [
            [4, 5],
            [5, 8],
            [1, 9]
          ],
          [4, 5, 8, 10]
        ],
        "expected": [2, 2, 4, -1]
      },
      {
        "args": [
          [
            [1, 3],
            [1, 3],
            [2, 2]
          ],
          [2, 3, 4]
        ],
        "expected": [1, 3, -1]
      },
      {
        "args": [
          [
            [10, 20],
            [5, 8],
            [1, 4]
          ],
          [4, 9, 10, 21]
        ],
        "expected": [4, -1, 11, -1]
      },
      {
        "args": [
          [
            [2, 10],
            [3, 4],
            [7, 8]
          ],
          [3, 6, 8]
        ],
        "expected": [2, 9, 2]
      },
      {
        "args": [
          [
            [100, 200],
            [150, 160],
            [1, 1]
          ],
          [1, 155, 201]
        ],
        "expected": [1, 11, -1]
      }
    ],
    "solutions": [
      {
        "title": "Brute force per query",
        "explanation": `**Intuition:** For each query, directly test all intervals and keep the shortest containing one.

**Steps:**
1. Sort or scan intervals so starts and ends are considered in a useful order.
2. Maintain the active merged interval, room count, or best candidate.
3. Emit or update the answer exactly when the maintained invariant decides it.

**Correctness:** The loop checks every possible interval for that query, so the minimum found is exactly the required shortest containing interval; if none qualify, return -1.

**Pitfalls:** This is only suitable as a baseline because queries and intervals can be large.`,
        "time": "O(IQ)",
        "space": "O(1) extra besides output)",
        "python": `class Solution:
    def minInterval(self, intervals: List[List[int]], queries: List[int]) -> List[int]:
        ans = []
        for q in queries:
            best = min((e - s + 1 for s, e in intervals if s <= q <= e), default=-1)
            ans.append(best)
        return ans
`,
        "cpp": `class Solution { public:
    vector<int> minInterval(vector<vector<int>>& intervals, vector<int>& queries) {
        vector<int> ans;
        for (int q : queries) {
            int best = INT_MAX;
            for (auto& in : intervals) if (in[0] <= q && q <= in[1]) best = min(best, in[1] - in[0] + 1);
            ans.push_back(best == INT_MAX ? -1 : best);
        }
        return ans;
    }
};`
      },
      {
        "title": "Offline heap by query value",
        "explanation": `**Intuition:** Process queries from smallest to largest and keep intervals that have started but not ended.

**Steps:**
1. Sort or scan intervals so starts and ends are considered in a useful order.
2. Maintain the active merged interval, room count, or best candidate.
3. Emit or update the answer exactly when the maintained invariant decides it.

**Correctness:** At a query, every interval in the heap has started; after popping expired intervals, exactly intervals containing the query remain. The heap minimum is therefore the shortest containing interval.

**Pitfalls:** Store query indices so answers return in original order.`,
        "time": "O((I + Q) log I)",
        "space": "O(I + Q)",
        "python": `class Solution:
    def minInterval(self, intervals: List[List[int]], queries: List[int]) -> List[int]:
        intervals.sort()
        ordered = sorted((q, i) for i, q in enumerate(queries))
        ans = [-1] * len(queries)
        heap = []
        i = 0
        for q, idx in ordered:
            while i < len(intervals) and intervals[i][0] <= q:
                s, e = intervals[i]
                heappush(heap, (e - s + 1, e))
                i += 1
            while heap and heap[0][1] < q:
                heappop(heap)
            if heap:
                ans[idx] = heap[0][0]
        return ans
`,
        "cpp": `class Solution { public:
    vector<int> minInterval(vector<vector<int>>& intervals, vector<int>& queries) {
        sort(intervals.begin(), intervals.end());
        vector<pair<int,int>> qs;
        for (int i = 0; i < (int)queries.size(); ++i) qs.push_back({queries[i], i});
        sort(qs.begin(), qs.end());
        vector<int> ans(queries.size(), -1);
        priority_queue<pair<int,int>, vector<pair<int,int>>, greater<pair<int,int>>> pq;
        int i = 0;
        for (auto [q, idx] : qs) {
            while (i < (int)intervals.size() && intervals[i][0] <= q) {
                int s = intervals[i][0], e = intervals[i][1];
                pq.push({e - s + 1, e});
                ++i;
            }
            while (!pq.empty() && pq.top().second < q) pq.pop();
            if (!pq.empty()) ans[idx] = pq.top().first;
        }
        return ans;
    }
};`
      }
    ],
    "viz": "intervals"
  }
]

export default problems
