import type { DsaProblem } from '../../types/content'

const problems: DsaProblem[] = [
  {
    "id": "valid-palindrome",
    "title": "Valid Palindrome",
    "number": 125,
    "difficulty": "Easy",
    "category": "Two Pointers",
    "pattern": "Two Pointers",
    "description": "Check whether a string reads the same forward and backward after ignoring non-alphanumeric characters and case. Digits are considered alphanumeric.",
    "examples": [
      {
        "input": "s = \"A man, a plan, a canal: Panama\"",
        "output": "true",
        "explanation": "After filtering, the text is a palindrome."
      },
      {
        "input": "s = \"race a car\"",
        "output": "false",
        "explanation": "The filtered text does not match in reverse."
      },
      {
        "input": "s = \" \"",
        "output": "true",
        "explanation": "No relevant characters remain, so it is a palindrome."
      }
    ],
    "constraints": [
      "`1 <= s.length <= 2 * 10^5`",
      "`s` may contain letters, digits, spaces, and punctuation.",
      "Compare characters case-insensitively.",
      "Ignore characters that are not letters or digits."
    ],
    "hints": [
      "First decide which characters matter.",
      "You can compare a cleaned string with its reverse.",
      "To save space, move two pointers inward while skipping ignored characters."
    ],
    "signature": {
      "kind": "function",
      "name": "isPalindrome",
      "params": [
        {
          "name": "s",
          "type": "string"
        }
      ],
      "returns": "bool"
    },
    "tests": [
      {
        "args": [
          "A man, a plan, a canal: Panama"
        ],
        "expected": true
      },
      {
        "args": [
          "race a car"
        ],
        "expected": false
      },
      {
        "args": [
          " "
        ],
        "expected": true
      },
      {
        "args": [
          "0P"
        ],
        "expected": false
      },
      {
        "args": [
          "Madam, I'm Adam"
        ],
        "expected": true
      },
      {
        "args": [
          "No lemon, no melon"
        ],
        "expected": true
      },
      {
        "args": [
          "abcba"
        ],
        "expected": true
      },
      {
        "args": [
          "ab@a"
        ],
        "expected": true
      }
    ],
    "sampleCount": 3,
    "solutions": [
      {
        "title": "Build Clean String",
        "explanation": "**Intuition.** Ignore non-alphanumeric characters by first building the exact string that matters.\n\n**Steps.**\n1. Filter s to alphanumeric characters.\n2. Lowercase each kept character.\n3. Compare the cleaned string to its reverse.\n\n**Correctness.** The cleaned string contains precisely the characters relevant to the problem in order. It is a palindrome iff it equals its reverse.\n\n**Pitfalls.** Use alphanumeric filtering, not only letters; digits count too.",
        "time": "O(n)",
        "space": "O(n)",
        "python": "class Solution:\n    def isPalindrome(self, s: str) -> bool:\n        cleaned = [ch.lower() for ch in s if ch.isalnum()]\n        return cleaned == cleaned[::-1]\n",
        "cpp": "class Solution {\npublic:\n    bool isPalindrome(string s) {\n        string cleaned;\n        for (unsigned char ch : s) if (isalnum(ch)) cleaned.push_back(tolower(ch));\n        string rev = cleaned;\n        reverse(rev.begin(), rev.end());\n        return cleaned == rev;\n    }\n};"
      },
      {
        "title": "Two Pointers In Place",
        "explanation": "**Intuition.** The palindrome comparison can be made from both ends while skipping irrelevant characters.\n\n**Steps.**\n1. Place one pointer at each end.\n2. Move left forward and right backward past non-alphanumeric characters.\n3. Compare lowercased characters.\n4. Continue inward until pointers cross.\n\n**Correctness.** Each comparison checks the next relevant character from the left against the matching relevant character from the right. Any mismatch proves failure; crossing means all pairs matched.\n\n**Pitfalls.** Cast to unsigned char in C++ before calling ctype helpers to avoid undefined behavior on non-ASCII bytes.",
        "time": "O(n)",
        "space": "O(1)",
        "python": "class Solution:\n    def isPalindrome(self, s: str) -> bool:\n        l, r = 0, len(s) - 1\n        while l < r:\n            while l < r and not s[l].isalnum():\n                l += 1\n            while l < r and not s[r].isalnum():\n                r -= 1\n            if s[l].lower() != s[r].lower():\n                return False\n            l += 1; r -= 1\n        return True\n",
        "cpp": "class Solution {\npublic:\n    bool isPalindrome(string s) {\n        int l = 0, r = (int)s.size() - 1;\n        while (l < r) {\n            while (l < r && !isalnum((unsigned char)s[l])) ++l;\n            while (l < r && !isalnum((unsigned char)s[r])) --r;\n            if (tolower((unsigned char)s[l]) != tolower((unsigned char)s[r])) return false;\n            ++l; --r;\n        }\n        return true;\n    }\n};"
      }
    ],
    "viz": "two-pointers"
  },
  {
    "id": "two-sum-ii-input-array-is-sorted",
    "title": "Two Sum II - Input Array Is Sorted",
    "number": 167,
    "difficulty": "Medium",
    "category": "Two Pointers",
    "pattern": "Two Pointers",
    "description": "Given a nondecreasing array `numbers`, find two different positions whose values sum to `target`. Return the positions using 1-based indexing.",
    "examples": [
      {
        "input": "numbers = [2,7,11,15], target = 9",
        "output": "[1, 2]",
        "explanation": "The first two values sum to 9."
      },
      {
        "input": "numbers = [2,3,4], target = 6",
        "output": "[1, 3]",
        "explanation": "2 and 4 are at positions 1 and 3."
      },
      {
        "input": "numbers = [-1,0], target = -1",
        "output": "[1, 2]",
        "explanation": "Both values are needed."
      }
    ],
    "constraints": [
      "`2 <= numbers.length <= 3 * 10^4`",
      "`numbers` is sorted in nondecreasing order.",
      "`-10^9 <= numbers[i], target <= 10^9`",
      "Exactly one solution is assumed."
    ],
    "hints": [
      "The array order gives information about whether a sum is too small or too large.",
      "Start with the smallest and largest remaining values.",
      "Move the left pointer on a small sum; move the right pointer on a large sum."
    ],
    "signature": {
      "kind": "function",
      "name": "twoSum",
      "params": [
        {
          "name": "numbers",
          "type": "int[]"
        },
        {
          "name": "target",
          "type": "int"
        }
      ],
      "returns": "int[]"
    },
    "tests": [
      {
        "args": [
          [
            2,
            7,
            11,
            15
          ],
          9
        ],
        "expected": [
          1,
          2
        ]
      },
      {
        "args": [
          [
            2,
            3,
            4
          ],
          6
        ],
        "expected": [
          1,
          3
        ]
      },
      {
        "args": [
          [
            -1,
            0
          ],
          -1
        ],
        "expected": [
          1,
          2
        ]
      },
      {
        "args": [
          [
            1,
            2,
            3,
            4,
            4,
            9
          ],
          8
        ],
        "expected": [
          4,
          5
        ]
      },
      {
        "args": [
          [
            1,
            3,
            5,
            7
          ],
          8
        ],
        "expected": [
          1,
          4
        ]
      },
      {
        "args": [
          [
            -5,
            -3,
            0,
            4,
            9
          ],
          4
        ],
        "expected": [
          1,
          5
        ]
      },
      {
        "args": [
          [
            0,
            0,
            3,
            4
          ],
          0
        ],
        "expected": [
          1,
          2
        ]
      },
      {
        "args": [
          [
            1,
            10,
            20,
            30,
            40
          ],
          50
        ],
        "expected": [
          2,
          5
        ]
      }
    ],
    "sampleCount": 3,
    "solutions": [
      {
        "title": "Brute Force Pairs",
        "explanation": "**Intuition.** The sorted property is not needed for correctness if we simply try all index pairs.\n\n**Steps.**\n1. Loop over the first index.\n2. Loop over every later index.\n3. Return the 1-indexed pair whose values sum to target.\n\n**Correctness.** All valid pairs have i < j and are examined. The first matching pair returned is therefore a correct answer.\n\n**Pitfalls.** The returned indices are 1-based, not 0-based.",
        "time": "O(n^2)",
        "space": "O(1)",
        "python": "class Solution:\n    def twoSum(self, numbers: List[int], target: int) -> List[int]:\n        for i in range(len(numbers)):\n            for j in range(i + 1, len(numbers)):\n                if numbers[i] + numbers[j] == target:\n                    return [i + 1, j + 1]\n        return []\n",
        "cpp": "class Solution {\npublic:\n    vector<int> twoSum(vector<int>& numbers, int target) {\n        for (int i = 0; i < (int)numbers.size(); ++i) {\n            for (int j = i + 1; j < (int)numbers.size(); ++j) {\n                if (numbers[i] + numbers[j] == target) return {i + 1, j + 1};\n            }\n        }\n        return {};\n    }\n};"
      },
      {
        "title": "Opposite Direction Pointers",
        "explanation": "**Intuition.** Because the array is sorted, the smallest plus largest tells us which side to move.\n\n**Steps.**\n1. Start l at the beginning and r at the end.\n2. If the sum is target, return l + 1 and r + 1.\n3. If the sum is too small, increment l.\n4. If the sum is too large, decrement r.\n\n**Correctness.** When the sum is too small, pairing numbers[l] with any index before r is no larger, so l cannot be part of a solution. The too-large case symmetrically eliminates r.\n\n**Pitfalls.** Move exactly one pointer after comparing; moving both can skip the answer.",
        "time": "O(n)",
        "space": "O(1)",
        "python": "class Solution:\n    def twoSum(self, numbers: List[int], target: int) -> List[int]:\n        l, r = 0, len(numbers) - 1\n        while l < r:\n            total = numbers[l] + numbers[r]\n            if total == target:\n                return [l + 1, r + 1]\n            if total < target:\n                l += 1\n            else:\n                r -= 1\n        return []\n",
        "cpp": "class Solution {\npublic:\n    vector<int> twoSum(vector<int>& numbers, int target) {\n        int l = 0, r = (int)numbers.size() - 1;\n        while (l < r) {\n            int sum = numbers[l] + numbers[r];\n            if (sum == target) return {l + 1, r + 1};\n            if (sum < target) ++l;\n            else --r;\n        }\n        return {};\n    }\n};"
      }
    ],
    "viz": "two-pointers"
  },
  {
    "id": "3sum",
    "title": "3Sum",
    "number": 15,
    "difficulty": "Medium",
    "category": "Two Pointers",
    "pattern": "Sorting + Two Pointers",
    "description": "Return all unique triplets of values from `nums` whose sum is zero. A triplet should not be repeated, and the order of triplets does not matter.",
    "examples": [
      {
        "input": "nums = [-1,0,1,2,-1,-4]",
        "output": "[[-1, -1, 2], [-1, 0, 1]]",
        "explanation": "There are two unique zero-sum triplets."
      },
      {
        "input": "nums = [0,1,1]",
        "output": "[]",
        "explanation": "No three values sum to zero."
      },
      {
        "input": "nums = [0,0,0]",
        "output": "[[0, 0, 0]]",
        "explanation": "The only triplet uses all three zeroes."
      }
    ],
    "constraints": [
      "`0 <= nums.length <= 3000`",
      "`-10^5 <= nums[i] <= 10^5`",
      "Return value triplets, not index triplets.",
      "Duplicate triplets should appear once."
    ],
    "hints": [
      "Sorting makes duplicates and two-sum searches easier.",
      "Fix one number and search for the other two with two pointers.",
      "Skip repeated fixed values and repeated pointer values after recording a triplet."
    ],
    "signature": {
      "kind": "function",
      "name": "threeSum",
      "params": [
        {
          "name": "nums",
          "type": "int[]"
        }
      ],
      "returns": "int[][]"
    },
    "tests": [
      {
        "args": [
          [
            -1,
            0,
            1,
            2,
            -1,
            -4
          ]
        ],
        "expected": [
          [
            -1,
            -1,
            2
          ],
          [
            -1,
            0,
            1
          ]
        ]
      },
      {
        "args": [
          [
            0,
            1,
            1
          ]
        ],
        "expected": []
      },
      {
        "args": [
          [
            0,
            0,
            0
          ]
        ],
        "expected": [
          [
            0,
            0,
            0
          ]
        ]
      },
      {
        "args": [
          [
            -2,
            0,
            1,
            1,
            2
          ]
        ],
        "expected": [
          [
            -2,
            0,
            2
          ],
          [
            -2,
            1,
            1
          ]
        ]
      },
      {
        "args": [
          [
            -1,
            0,
            1,
            0
          ]
        ],
        "expected": [
          [
            -1,
            0,
            1
          ]
        ]
      },
      {
        "args": [
          []
        ],
        "expected": []
      },
      {
        "args": [
          [
            1,
            -1,
            -1,
            0
          ]
        ],
        "expected": [
          [
            -1,
            0,
            1
          ]
        ]
      },
      {
        "args": [
          [
            -4,
            -2,
            -2,
            -2,
            0,
            1,
            2,
            2,
            2,
            3,
            3,
            4,
            4,
            6,
            6
          ]
        ],
        "expected": [
          [
            -4,
            -2,
            6
          ],
          [
            -4,
            0,
            4
          ],
          [
            -4,
            1,
            3
          ],
          [
            -4,
            2,
            2
          ],
          [
            -2,
            -2,
            4
          ],
          [
            -2,
            0,
            2
          ]
        ]
      }
    ],
    "sampleCount": 3,
    "compare": "unorderedDeep",
    "solutions": [
      {
        "title": "Brute Force Triples",
        "explanation": "**Intuition.** A triplet is small enough to define directly: try every combination and keep the zero-sum ones.\n\n**Steps.**\n1. Enumerate i < j < k.\n2. When the three values sum to zero, sort that triplet.\n3. Store it in a set to remove duplicates.\n4. Return the set as a list.\n\n**Correctness.** Every valid triplet of indices is enumerated. Sorting and set storage collapse duplicate value triplets, leaving exactly the unique zero-sum triplets.\n\n**Pitfalls.** Deduplicate by values, not by indices, because repeated numbers can produce the same triplet many ways.",
        "time": "O(n^3)",
        "space": "O(a) for answers",
        "python": "class Solution:\n    def threeSum(self, nums: List[int]) -> List[List[int]]:\n        found = set()\n        n = len(nums)\n        for i in range(n):\n            for j in range(i + 1, n):\n                for k in range(j + 1, n):\n                    if nums[i] + nums[j] + nums[k] == 0:\n                        found.add(tuple(sorted((nums[i], nums[j], nums[k]))))\n        return [list(t) for t in found]\n",
        "cpp": "class Solution {\npublic:\n    vector<vector<int>> threeSum(vector<int>& nums) {\n        set<vector<int>> found;\n        int n = nums.size();\n        for (int i = 0; i < n; ++i) for (int j = i + 1; j < n; ++j) for (int k = j + 1; k < n; ++k) {\n            if (nums[i] + nums[j] + nums[k] == 0) {\n                vector<int> t = {nums[i], nums[j], nums[k]};\n                sort(t.begin(), t.end());\n                found.insert(t);\n            }\n        }\n        return vector<vector<int>>(found.begin(), found.end());\n    }\n};"
      },
      {
        "title": "Sort and Two Pointers",
        "explanation": "**Intuition.** After sorting, fixing one value reduces the remaining search to a two-sum problem.\n\n**Steps.**\n1. Sort nums.\n2. Fix index i, skipping duplicate fixed values.\n3. Use l=i+1 and r=n-1 to search for -nums[i].\n4. Record matches and skip duplicate l/r values.\n\n**Correctness.** For each fixed i, the two-pointer search eliminates impossible pairs using sorted order and visits all feasible pairs. Duplicate skipping only removes repeated value triplets already emitted.\n\n**Pitfalls.** Skip duplicates after finding a triplet and also skip duplicate fixed values before the two-pointer loop.",
        "time": "O(n^2)",
        "space": "O(1) extra besides answers",
        "python": "class Solution:\n    def threeSum(self, nums: List[int]) -> List[List[int]]:\n        nums.sort()\n        ans = []\n        for i in range(len(nums) - 2):\n            if i and nums[i] == nums[i - 1]:\n                continue\n            l, r = i + 1, len(nums) - 1\n            while l < r:\n                total = nums[i] + nums[l] + nums[r]\n                if total == 0:\n                    ans.append([nums[i], nums[l], nums[r]])\n                    l += 1; r -= 1\n                    while l < r and nums[l] == nums[l - 1]:\n                        l += 1\n                    while l < r and nums[r] == nums[r + 1]:\n                        r -= 1\n                elif total < 0:\n                    l += 1\n                else:\n                    r -= 1\n        return ans\n",
        "cpp": "class Solution {\npublic:\n    vector<vector<int>> threeSum(vector<int>& nums) {\n        sort(nums.begin(), nums.end());\n        vector<vector<int>> ans;\n        for (int i = 0; i + 2 < (int)nums.size(); ++i) {\n            if (i > 0 && nums[i] == nums[i - 1]) continue;\n            int l = i + 1, r = (int)nums.size() - 1;\n            while (l < r) {\n                int total = nums[i] + nums[l] + nums[r];\n                if (total == 0) {\n                    ans.push_back({nums[i], nums[l], nums[r]});\n                    ++l; --r;\n                    while (l < r && nums[l] == nums[l - 1]) ++l;\n                    while (l < r && nums[r] == nums[r + 1]) --r;\n                } else if (total < 0) ++l;\n                else --r;\n            }\n        }\n        return ans;\n    }\n};"
      }
    ],
    "viz": "two-pointers"
  },
  {
    "id": "container-with-most-water",
    "title": "Container With Most Water",
    "number": 11,
    "difficulty": "Medium",
    "category": "Two Pointers",
    "pattern": "Two Pointers",
    "description": "Choose two vertical lines from `height` to form a container with the x-axis. Return the maximum water area possible between two lines.",
    "examples": [
      {
        "input": "height = [1,8,6,2,5,4,8,3,7]",
        "output": "49",
        "explanation": "The best pair spans width 7 with limiting height 7."
      },
      {
        "input": "height = [1,1]",
        "output": "1",
        "explanation": "Only one container can be formed."
      },
      {
        "input": "height = [4,3,2,1,4]",
        "output": "16",
        "explanation": "The outer lines create the best area."
      }
    ],
    "constraints": [
      "`2 <= height.length <= 10^5`",
      "`0 <= height[i] <= 10^4`",
      "Area is width times the shorter selected line.",
      "Lines cannot be slanted."
    ],
    "hints": [
      "The widest container is considered first if you use end pointers.",
      "The shorter line limits the current area.",
      "Move the shorter side inward because keeping it with smaller width cannot improve the area."
    ],
    "signature": {
      "kind": "function",
      "name": "maxArea",
      "params": [
        {
          "name": "height",
          "type": "int[]"
        }
      ],
      "returns": "int"
    },
    "tests": [
      {
        "args": [
          [
            1,
            8,
            6,
            2,
            5,
            4,
            8,
            3,
            7
          ]
        ],
        "expected": 49
      },
      {
        "args": [
          [
            1,
            1
          ]
        ],
        "expected": 1
      },
      {
        "args": [
          [
            4,
            3,
            2,
            1,
            4
          ]
        ],
        "expected": 16
      },
      {
        "args": [
          [
            1,
            2,
            1
          ]
        ],
        "expected": 2
      },
      {
        "args": [
          [
            2,
            3,
            10,
            5,
            7,
            8,
            9
          ]
        ],
        "expected": 36
      },
      {
        "args": [
          [
            1,
            2,
            4,
            3
          ]
        ],
        "expected": 4
      },
      {
        "args": [
          [
            5,
            5,
            5,
            5
          ]
        ],
        "expected": 15
      },
      {
        "args": [
          [
            1,
            100,
            1,
            1,
            100,
            1
          ]
        ],
        "expected": 300
      }
    ],
    "sampleCount": 3,
    "solutions": [
      {
        "title": "Check Every Pair",
        "explanation": "**Intuition.** A container is determined by its two boundary lines, so enumerate all pairs.\n\n**Steps.**\n1. Pick the left boundary.\n2. Pick every right boundary after it.\n3. Compute width times the shorter height.\n4. Keep the maximum area.\n\n**Correctness.** Every possible container corresponds to one examined pair, and the formula computes its exact area. The maximum over all pairs is therefore returned.\n\n**Pitfalls.** Use the shorter wall, not the taller wall, for the water height.",
        "time": "O(n^2)",
        "space": "O(1)",
        "python": "class Solution:\n    def maxArea(self, height: List[int]) -> int:\n        best = 0\n        for i in range(len(height)):\n            for j in range(i + 1, len(height)):\n                best = max(best, (j - i) * min(height[i], height[j]))\n        return best\n",
        "cpp": "class Solution {\npublic:\n    int maxArea(vector<int>& height) {\n        int best = 0;\n        for (int i = 0; i < (int)height.size(); ++i) {\n            for (int j = i + 1; j < (int)height.size(); ++j) {\n                best = max(best, (j - i) * min(height[i], height[j]));\n            }\n        }\n        return best;\n    }\n};"
      },
      {
        "title": "Two Pointers",
        "explanation": "**Intuition.** Start with maximum width and move the boundary that limits the height.\n\n**Steps.**\n1. Set l to the first line and r to the last.\n2. Update the best area.\n3. Move l if height[l] is smaller; otherwise move r.\n4. Repeat while l < r.\n\n**Correctness.** The shorter boundary limits the current area. Keeping it while reducing width cannot improve area, so it is safe to discard that boundary and search inward.\n\n**Pitfalls.** Moving the taller boundary first may skip the optimal container.",
        "time": "O(n)",
        "space": "O(1)",
        "python": "class Solution:\n    def maxArea(self, height: List[int]) -> int:\n        l, r = 0, len(height) - 1\n        best = 0\n        while l < r:\n            best = max(best, (r - l) * min(height[l], height[r]))\n            if height[l] < height[r]:\n                l += 1\n            else:\n                r -= 1\n        return best\n",
        "cpp": "class Solution {\npublic:\n    int maxArea(vector<int>& height) {\n        int l = 0, r = (int)height.size() - 1, best = 0;\n        while (l < r) {\n            best = max(best, (r - l) * min(height[l], height[r]));\n            if (height[l] < height[r]) ++l;\n            else --r;\n        }\n        return best;\n    }\n};"
      }
    ],
    "viz": "two-pointers"
  },
  {
    "id": "trapping-rain-water",
    "title": "Trapping Rain Water",
    "number": 42,
    "difficulty": "Hard",
    "category": "Two Pointers",
    "pattern": "Two Pointers",
    "description": "Given bar heights, compute how many unit squares of water remain trapped after raining. Water at each position is bounded by the tallest wall on both sides.",
    "examples": [
      {
        "input": "height = [0,1,0,2,1,0,1,3,2,1,2,1]",
        "output": "6",
        "explanation": "Multiple basins hold a total of 6 units."
      },
      {
        "input": "height = [4,2,0,3,2,5]",
        "output": "9",
        "explanation": "The right wall of height 5 closes several basins."
      },
      {
        "input": "height = [1,2,3]",
        "output": "0",
        "explanation": "A monotone slope traps no water."
      }
    ],
    "constraints": [
      "`0 <= height.length <= 2 * 10^4`",
      "`0 <= height[i] <= 10^5`",
      "Water above index i depends on max height to its left and right.",
      "Return the total trapped units."
    ],
    "hints": [
      "For one index, what two walls limit the waterline?",
      "Precomputing or tracking side maxima avoids recomputing them.",
      "With two pointers, process the side whose known maximum is smaller."
    ],
    "signature": {
      "kind": "function",
      "name": "trap",
      "params": [
        {
          "name": "height",
          "type": "int[]"
        }
      ],
      "returns": "int"
    },
    "tests": [
      {
        "args": [
          [
            0,
            1,
            0,
            2,
            1,
            0,
            1,
            3,
            2,
            1,
            2,
            1
          ]
        ],
        "expected": 6
      },
      {
        "args": [
          [
            4,
            2,
            0,
            3,
            2,
            5
          ]
        ],
        "expected": 9
      },
      {
        "args": [
          [
            1,
            2,
            3
          ]
        ],
        "expected": 0
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
            2,
            0,
            2
          ]
        ],
        "expected": 2
      },
      {
        "args": [
          [
            3,
            0,
            0,
            2,
            0,
            4
          ]
        ],
        "expected": 10
      },
      {
        "args": [
          [
            5,
            4,
            1,
            2
          ]
        ],
        "expected": 1
      },
      {
        "args": [
          [
            0,
            0,
            0
          ]
        ],
        "expected": 0
      }
    ],
    "sampleCount": 3,
    "solutions": [
      {
        "title": "Scan Max Walls for Each Bar",
        "explanation": "**Intuition.** Water above a bar is limited by the tallest wall on its left and the tallest wall on its right.\n\n**Steps.**\n1. For each index, compute the max height from the left side.\n2. Compute the max height from the right side.\n3. Add min(left, right) - height[i] if positive.\n\n**Correctness.** The waterline at i cannot exceed either side maximum and can always reach the lower of those two maxima, so the formula gives exactly the trapped water over i.\n\n**Pitfalls.** Include the current bar when computing side maxima; the subtraction then naturally gives zero at boundaries.",
        "time": "O(n^2)",
        "space": "O(1)",
        "python": "class Solution:\n    def trap(self, height: List[int]) -> int:\n        total = 0\n        for i in range(len(height)):\n            left = max(height[:i + 1])\n            right = max(height[i:])\n            total += min(left, right) - height[i]\n        return total\n",
        "cpp": "class Solution {\npublic:\n    int trap(vector<int>& height) {\n        int total = 0, n = height.size();\n        for (int i = 0; i < n; ++i) {\n            int left = 0, right = 0;\n            for (int j = 0; j <= i; ++j) left = max(left, height[j]);\n            for (int j = i; j < n; ++j) right = max(right, height[j]);\n            total += min(left, right) - height[i];\n        }\n        return total;\n    }\n};"
      },
      {
        "title": "Two Pointers with Running Maxima",
        "explanation": "**Intuition.** The side with the smaller current maximum determines water there, because the opposite side is already high enough.\n\n**Steps.**\n1. Keep l/r pointers and leftMax/rightMax.\n2. Move the side with smaller current height.\n3. Update that side maximum.\n4. Add the difference between its maximum and current height.\n\n**Correctness.** When leftMax <= rightMax, future right boundaries cannot reduce water over l, so leftMax fixes the water there. The symmetric case holds for the right side.\n\n**Pitfalls.** Update the maximum before adding water to avoid negative additions.",
        "time": "O(n)",
        "space": "O(1)",
        "python": "class Solution:\n    def trap(self, height: List[int]) -> int:\n        l, r = 0, len(height) - 1\n        left_max = right_max = 0\n        water = 0\n        while l <= r:\n            if left_max <= right_max:\n                left_max = max(left_max, height[l])\n                water += left_max - height[l]\n                l += 1\n            else:\n                right_max = max(right_max, height[r])\n                water += right_max - height[r]\n                r -= 1\n        return water\n",
        "cpp": "class Solution {\npublic:\n    int trap(vector<int>& height) {\n        int l = 0, r = (int)height.size() - 1;\n        int leftMax = 0, rightMax = 0, water = 0;\n        while (l <= r) {\n            if (leftMax <= rightMax) {\n                leftMax = max(leftMax, height[l]);\n                water += leftMax - height[l];\n                ++l;\n            } else {\n                rightMax = max(rightMax, height[r]);\n                water += rightMax - height[r];\n                --r;\n            }\n        }\n        return water;\n    }\n};"
      }
    ],
    "viz": "two-pointers"
  }
]

export default problems
