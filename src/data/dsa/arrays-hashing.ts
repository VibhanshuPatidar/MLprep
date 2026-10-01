import type { DsaProblem } from '../../types/content'

const problems: DsaProblem[] = [
  {
    "id": "contains-duplicate",
    "title": "Contains Duplicate",
    "number": 217,
    "difficulty": "Easy",
    "category": "Arrays & Hashing",
    "pattern": "Hash Set",
    "description": "Given an integer array `nums`, determine whether any value appears at least twice. Return `true` as soon as a repeated value exists; otherwise return `false` after the whole array is unique.",
    "examples": [
      {
        "input": "nums = [1,2,3,1]",
        "output": "true",
        "explanation": "The value 1 occurs at indices 0 and 3."
      },
      {
        "input": "nums = [1,2,3,4]",
        "output": "false",
        "explanation": "Every value is distinct."
      },
      {
        "input": "nums = [1,1,1,3,3,4,3,2,4,2]",
        "output": "true",
        "explanation": "Several values repeat."
      }
    ],
    "constraints": [
      "`1 <= nums.length <= 10^5`",
      "`-10^9 <= nums[i] <= 10^9`",
      "Return a boolean; the duplicate value itself is not needed."
    ],
    "hints": [
      "What information would let you recognize a value you have already passed?",
      "A set can answer membership queries in average constant time.",
      "Scan once: if a value is already in the set, return true; otherwise insert it."
    ],
    "signature": {
      "kind": "function",
      "name": "containsDuplicate",
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
          [
            1,
            2,
            3,
            1
          ]
        ],
        "expected": true
      },
      {
        "args": [
          [
            1,
            2,
            3,
            4
          ]
        ],
        "expected": false
      },
      {
        "args": [
          [
            1,
            1,
            1,
            3,
            3,
            4,
            3,
            2,
            4,
            2
          ]
        ],
        "expected": true
      },
      {
        "args": [
          [
            0
          ]
        ],
        "expected": false
      },
      {
        "args": [
          [
            -1,
            0,
            1,
            -1
          ]
        ],
        "expected": true
      },
      {
        "args": [
          [
            5,
            5
          ]
        ],
        "expected": true
      },
      {
        "args": [
          [
            0,
            1,
            2,
            3,
            4,
            5,
            6,
            7,
            8,
            9
          ]
        ],
        "expected": false
      },
      {
        "args": [
          [
            10,
            -10,
            20,
            30,
            20
          ]
        ],
        "expected": true
      }
    ],
    "sampleCount": 3,
    "solutions": [
      {
        "title": "Brute Force Pair Scan",
        "explanation": "**Intuition.** If a duplicate exists, some pair of indices must hold the same value, so checking every pair is enough.\n\n**Steps.**\n1. Loop over the left index.\n2. Compare it with every later index.\n3. Return true at the first equal pair; otherwise return false after all pairs are checked.\n\n**Correctness.** The algorithm considers every unordered pair of positions exactly once. A duplicate is precisely an equal pair, so it returns true iff one exists.\n\n**Pitfalls.** Do not compare an element with itself, and stop early once a match is found.",
        "time": "O(n^2)",
        "space": "O(1)",
        "python": "class Solution:\n    def containsDuplicate(self, nums: List[int]) -> bool:\n        for i in range(len(nums)):\n            for j in range(i + 1, len(nums)):\n                if nums[i] == nums[j]:\n                    return True\n        return False\n",
        "cpp": "class Solution {\npublic:\n    bool containsDuplicate(vector<int>& nums) {\n        for (int i = 0; i < (int)nums.size(); ++i) {\n            for (int j = i + 1; j < (int)nums.size(); ++j) {\n                if (nums[i] == nums[j]) return true;\n            }\n        }\n        return false;\n    }\n};"
      },
      {
        "title": "Hash Set",
        "explanation": "**Intuition.** A set records values already seen; the first value encountered twice proves the answer.\n\n**Steps.**\n1. Create an empty set.\n2. Scan nums from left to right.\n3. If the current value is in the set return true; otherwise insert it.\n4. Finish with false if no repeat appears.\n\n**Correctness.** Before each step the set contains exactly the earlier values. Membership means an earlier equal value exists; absence means inserting preserves that invariant.\n\n**Pitfalls.** Insert only after checking, otherwise every element would appear to duplicate itself.",
        "time": "O(n)",
        "space": "O(n)",
        "python": "class Solution:\n    def containsDuplicate(self, nums: List[int]) -> bool:\n        seen = set()\n        for x in nums:\n            if x in seen:\n                return True\n            seen.add(x)\n        return False\n",
        "cpp": "class Solution {\npublic:\n    bool containsDuplicate(vector<int>& nums) {\n        unordered_set<int> seen;\n        for (int x : nums) {\n            if (seen.count(x)) return true;\n            seen.insert(x);\n        }\n        return false;\n    }\n};"
      }
    ]
  },
  {
    "id": "valid-anagram",
    "title": "Valid Anagram",
    "number": 242,
    "difficulty": "Easy",
    "category": "Arrays & Hashing",
    "pattern": "Frequency Counting",
    "description": "Given two strings `s` and `t`, decide whether `t` can be rearranged to become `s`. Both strings must contain exactly the same characters with the same counts.",
    "examples": [
      {
        "input": "s = \"anagram\", t = \"nagaram\"",
        "output": "true",
        "explanation": "The letters match after rearranging."
      },
      {
        "input": "s = \"rat\", t = \"car\"",
        "output": "false",
        "explanation": "The character counts differ."
      },
      {
        "input": "s = \"listen\", t = \"silent\"",
        "output": "true",
        "explanation": "Both strings have the same six letters."
      }
    ],
    "constraints": [
      "`0 <= s.length, t.length <= 5 * 10^4`",
      "`s` and `t` contain lowercase English letters.",
      "Return `true` only when every letter count matches."
    ],
    "hints": [
      "If two words are anagrams, how do their sorted forms compare?",
      "You can avoid sorting by counting 26 letters.",
      "Reject different lengths, then ensure every frequency difference is zero."
    ],
    "signature": {
      "kind": "function",
      "name": "isAnagram",
      "params": [
        {
          "name": "s",
          "type": "string"
        },
        {
          "name": "t",
          "type": "string"
        }
      ],
      "returns": "bool"
    },
    "tests": [
      {
        "args": [
          "anagram",
          "nagaram"
        ],
        "expected": true
      },
      {
        "args": [
          "rat",
          "car"
        ],
        "expected": false
      },
      {
        "args": [
          "listen",
          "silent"
        ],
        "expected": true
      },
      {
        "args": [
          "a",
          "ab"
        ],
        "expected": false
      },
      {
        "args": [
          "",
          ""
        ],
        "expected": true
      },
      {
        "args": [
          "aacc",
          "ccac"
        ],
        "expected": false
      },
      {
        "args": [
          "zzzz",
          "zzzz"
        ],
        "expected": true
      },
      {
        "args": [
          "binary",
          "brainy"
        ],
        "expected": true
      }
    ],
    "sampleCount": 3,
    "solutions": [
      {
        "title": "Sort Both Strings",
        "explanation": "**Intuition.** Anagrams contain the same characters with the same multiplicities, so sorting makes them identical.\n\n**Steps.**\n1. If lengths differ, return false.\n2. Sort both strings.\n3. Compare the sorted results.\n\n**Correctness.** Sorting groups equal letters together. Two sorted strings are equal exactly when every character count matches.\n\n**Pitfalls.** Remember that equal length alone is not enough; the sorted contents must match.",
        "time": "O(n log n)",
        "space": "O(n) in Python, O(1) extra in C++ aside from sorting storage",
        "python": "class Solution:\n    def isAnagram(self, s: str, t: str) -> bool:\n        return len(s) == len(t) and sorted(s) == sorted(t)\n",
        "cpp": "class Solution {\npublic:\n    bool isAnagram(string s, string t) {\n        if (s.size() != t.size()) return false;\n        sort(s.begin(), s.end());\n        sort(t.begin(), t.end());\n        return s == t;\n    }\n};"
      },
      {
        "title": "Frequency Counting",
        "explanation": "**Intuition.** Counting letters avoids sorting and compares the exact inventory of each string.\n\n**Steps.**\n1. Reject different lengths.\n2. Add counts from s and subtract counts from t.\n3. Return true only if every final count is zero.\n\n**Correctness.** For each character, the final count is occurrences in s minus occurrences in t. All zero counts are equivalent to matching multisets.\n\n**Pitfalls.** Use an array when the input is lower-case English letters; use a map if the alphabet changes.",
        "time": "O(n)",
        "space": "O(1)",
        "python": "class Solution:\n    def isAnagram(self, s: str, t: str) -> bool:\n        if len(s) != len(t):\n            return False\n        counts = [0] * 26\n        for a, b in zip(s, t):\n            counts[ord(a) - ord('a')] += 1\n            counts[ord(b) - ord('a')] -= 1\n        return all(x == 0 for x in counts)\n",
        "cpp": "class Solution {\npublic:\n    bool isAnagram(string s, string t) {\n        if (s.size() != t.size()) return false;\n        array<int, 26> counts{};\n        for (int i = 0; i < (int)s.size(); ++i) {\n            counts[s[i] - 'a']++;\n            counts[t[i] - 'a']--;\n        }\n        for (int x : counts) if (x != 0) return false;\n        return true;\n    }\n};"
      }
    ],
    "viz": "sorting"
  },
  {
    "id": "two-sum",
    "title": "Two Sum",
    "number": 1,
    "difficulty": "Easy",
    "category": "Arrays & Hashing",
    "pattern": "Hash Map",
    "description": "Given `nums` and a `target`, return indices of two different elements whose values add to `target`. Any valid pair may be returned, and the answer is judged without caring about index order.",
    "examples": [
      {
        "input": "nums = [2,7,11,15], target = 9",
        "output": "[0, 1]",
        "explanation": "`2 + 7 = 9`."
      },
      {
        "input": "nums = [3,2,4], target = 6",
        "output": "[1, 2]",
        "explanation": "`2 + 4 = 6`."
      },
      {
        "input": "nums = [3,3], target = 6",
        "output": "[0, 1]",
        "explanation": "The two equal values are at different indices."
      }
    ],
    "constraints": [
      "`2 <= nums.length <= 10^4`",
      "`-10^9 <= nums[i], target <= 10^9`",
      "Exactly one valid answer is assumed for the standard problem.",
      "An element may not be used twice."
    ],
    "hints": [
      "For each number, what partner value would complete the target?",
      "Store values you have already seen with their indices.",
      "Check for the complement before inserting the current index."
    ],
    "signature": {
      "kind": "function",
      "name": "twoSum",
      "params": [
        {
          "name": "nums",
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
          0,
          1
        ]
      },
      {
        "args": [
          [
            3,
            2,
            4
          ],
          6
        ],
        "expected": [
          1,
          2
        ]
      },
      {
        "args": [
          [
            3,
            3
          ],
          6
        ],
        "expected": [
          0,
          1
        ]
      },
      {
        "args": [
          [
            -3,
            4,
            3,
            90
          ],
          0
        ],
        "expected": [
          0,
          2
        ]
      },
      {
        "args": [
          [
            0,
            4,
            3,
            0
          ],
          0
        ],
        "expected": [
          0,
          3
        ]
      },
      {
        "args": [
          [
            -1,
            -2,
            -3,
            -4,
            -5
          ],
          -8
        ],
        "expected": [
          2,
          4
        ]
      },
      {
        "args": [
          [
            1,
            5,
            9,
            12
          ],
          14
        ],
        "expected": [
          1,
          2
        ]
      },
      {
        "args": [
          [
            10,
            20,
            11,
            40
          ],
          50
        ],
        "expected": [
          0,
          3
        ]
      }
    ],
    "sampleCount": 3,
    "compare": "unordered",
    "solutions": [
      {
        "title": "Brute Force Pairs",
        "explanation": "**Intuition.** The direct definition asks for two indices, so try every pair until the target sum appears.\n\n**Steps.**\n1. Choose the first index.\n2. Try every later second index.\n3. Return the first pair whose values sum to target.\n\n**Correctness.** Every legal answer is one of the examined pairs. If a pair sums to target, the algorithm returns it; if none did, no answer exists.\n\n**Pitfalls.** Use two different indices; duplicate values are allowed only when they occupy different positions.",
        "time": "O(n^2)",
        "space": "O(1)",
        "python": "class Solution:\n    def twoSum(self, nums: List[int], target: int) -> List[int]:\n        for i in range(len(nums)):\n            for j in range(i + 1, len(nums)):\n                if nums[i] + nums[j] == target:\n                    return [i, j]\n        return []\n",
        "cpp": "class Solution {\npublic:\n    vector<int> twoSum(vector<int>& nums, int target) {\n        for (int i = 0; i < (int)nums.size(); ++i) {\n            for (int j = i + 1; j < (int)nums.size(); ++j) {\n                if (nums[i] + nums[j] == target) return {i, j};\n            }\n        }\n        return {};\n    }\n};"
      },
      {
        "title": "One-Pass Hash Map",
        "explanation": "**Intuition.** When reading x, the needed partner is target - x. A map can tell whether that partner appeared earlier.\n\n**Steps.**\n1. Map each seen value to its index.\n2. For each nums[i], compute the complement.\n3. If the complement is already mapped, return both indices.\n4. Otherwise store nums[i].\n\n**Correctness.** At index i the map contains exactly earlier indices. Finding the complement gives two distinct indices with the target sum; not finding it means no earlier partner exists.\n\n**Pitfalls.** Check before storing the current value so the same index is never reused.",
        "time": "O(n)",
        "space": "O(n)",
        "python": "class Solution:\n    def twoSum(self, nums: List[int], target: int) -> List[int]:\n        seen = {}\n        for i, x in enumerate(nums):\n            need = target - x\n            if need in seen:\n                return [seen[need], i]\n            seen[x] = i\n        return []\n",
        "cpp": "class Solution {\npublic:\n    vector<int> twoSum(vector<int>& nums, int target) {\n        unordered_map<int, int> seen;\n        for (int i = 0; i < (int)nums.size(); ++i) {\n            int need = target - nums[i];\n            if (seen.count(need)) return {seen[need], i};\n            seen[nums[i]] = i;\n        }\n        return {};\n    }\n};"
      }
    ]
  },
  {
    "id": "group-anagrams",
    "title": "Group Anagrams",
    "number": 49,
    "difficulty": "Medium",
    "category": "Arrays & Hashing",
    "pattern": "Hash Map",
    "description": "Group a list of lowercase strings so that each group contains words that are anagrams of one another. The groups and the order inside each group may be returned in any order.",
    "examples": [
      {
        "input": "strs = [\"eat\",\"tea\",\"tan\",\"ate\",\"nat\",\"bat\"]",
        "output": "[[\"eat\", \"tea\", \"ate\"], [\"tan\", \"nat\"], [\"bat\"]]",
        "explanation": "The words split into three anagram families."
      },
      {
        "input": "strs = [\"\"]",
        "output": "[[\"\"]]",
        "explanation": "The empty string forms its own group."
      },
      {
        "input": "strs = [\"a\"]",
        "output": "[[\"a\"]]",
        "explanation": "A single word is one group."
      }
    ],
    "constraints": [
      "`1 <= strs.length <= 10^4`",
      "`0 <= strs[i].length <= 100`",
      "`strs[i]` contains lowercase English letters.",
      "Return all original strings exactly once."
    ],
    "hints": [
      "Find a representation shared by all anagrams.",
      "Sorting a word or counting its letters can be used as a key.",
      "Map each key to the list of strings that produced it."
    ],
    "signature": {
      "kind": "function",
      "name": "groupAnagrams",
      "params": [
        {
          "name": "strs",
          "type": "string[]"
        }
      ],
      "returns": "string[][]"
    },
    "tests": [
      {
        "args": [
          [
            "eat",
            "tea",
            "tan",
            "ate",
            "nat",
            "bat"
          ]
        ],
        "expected": [
          [
            "eat",
            "tea",
            "ate"
          ],
          [
            "tan",
            "nat"
          ],
          [
            "bat"
          ]
        ]
      },
      {
        "args": [
          [
            ""
          ]
        ],
        "expected": [
          [
            ""
          ]
        ]
      },
      {
        "args": [
          [
            "a"
          ]
        ],
        "expected": [
          [
            "a"
          ]
        ]
      },
      {
        "args": [
          [
            "ab",
            "ba",
            "abc",
            "cab",
            "bca",
            "z"
          ]
        ],
        "expected": [
          [
            "ab",
            "ba"
          ],
          [
            "abc",
            "cab",
            "bca"
          ],
          [
            "z"
          ]
        ]
      },
      {
        "args": [
          [
            "x",
            "x",
            "xx"
          ]
        ],
        "expected": [
          [
            "x",
            "x"
          ],
          [
            "xx"
          ]
        ]
      },
      {
        "args": [
          [
            "listen",
            "silent",
            "enlist",
            "google",
            "gogole"
          ]
        ],
        "expected": [
          [
            "listen",
            "silent",
            "enlist"
          ],
          [
            "google",
            "gogole"
          ]
        ]
      },
      {
        "args": [
          [
            "abc",
            "def",
            "ghi"
          ]
        ],
        "expected": [
          [
            "abc"
          ],
          [
            "def"
          ],
          [
            "ghi"
          ]
        ]
      },
      {
        "args": [
          [
            "dddddddddd",
            "dddddddddd",
            "ddddddddd"
          ]
        ],
        "expected": [
          [
            "dddddddddd",
            "dddddddddd"
          ],
          [
            "ddddddddd"
          ]
        ]
      }
    ],
    "sampleCount": 3,
    "compare": "unorderedDeep",
    "solutions": [
      {
        "title": "Sorted Signature",
        "explanation": "**Intuition.** All anagrams become the same string after sorting their letters.\n\n**Steps.**\n1. Create a map from sorted letters to a list of words.\n2. For each word, sort its characters to form the key.\n3. Append the word under that key.\n4. Return all map values.\n\n**Correctness.** Words are placed in the same bucket exactly when their sorted character sequences match, which is equivalent to being anagrams.\n\n**Pitfalls.** The order of groups and words is irrelevant here, so use unordered-deep comparison in tests.",
        "time": "O(n k log k)",
        "space": "O(n k)",
        "python": "class Solution:\n    def groupAnagrams(self, strs: List[str]) -> List[List[str]]:\n        groups = defaultdict(list)\n        for s in strs:\n            groups[''.join(sorted(s))].append(s)\n        return list(groups.values())\n",
        "cpp": "class Solution {\npublic:\n    vector<vector<string>> groupAnagrams(vector<string>& strs) {\n        unordered_map<string, vector<string>> groups;\n        for (string& s : strs) {\n            string key = s;\n            sort(key.begin(), key.end());\n            groups[key].push_back(s);\n        }\n        vector<vector<string>> ans;\n        for (auto& kv : groups) ans.push_back(kv.second);\n        return ans;\n    }\n};"
      },
      {
        "title": "Letter Count Signature",
        "explanation": "**Intuition.** A fixed-size frequency vector represents a lower-case word without sorting.\n\n**Steps.**\n1. Count the 26 letters in each word.\n2. Use the tuple/count string as the hash key.\n3. Append the word to the matching bucket.\n4. Return the buckets.\n\n**Correctness.** Two lower-case words have identical count signatures iff every letter occurs the same number of times in both, exactly the anagram condition.\n\n**Pitfalls.** Keys must include separators or fixed positions so counts such as 1,11 are not confused with 11,1.",
        "time": "O(n k)",
        "space": "O(n k)",
        "python": "class Solution:\n    def groupAnagrams(self, strs: List[str]) -> List[List[str]]:\n        groups = defaultdict(list)\n        for s in strs:\n            counts = [0] * 26\n            for ch in s:\n                counts[ord(ch) - ord('a')] += 1\n            groups[tuple(counts)].append(s)\n        return list(groups.values())\n",
        "cpp": "class Solution {\npublic:\n    vector<vector<string>> groupAnagrams(vector<string>& strs) {\n        map<array<int, 26>, vector<string>> groups;\n        for (string& s : strs) {\n            array<int, 26> key{};\n            for (char c : s) key[c - 'a']++;\n            groups[key].push_back(s);\n        }\n        vector<vector<string>> ans;\n        for (auto& kv : groups) ans.push_back(kv.second);\n        return ans;\n    }\n};"
      }
    ]
  },
  {
    "id": "top-k-frequent-elements",
    "title": "Top K Frequent Elements",
    "number": 347,
    "difficulty": "Medium",
    "category": "Arrays & Hashing",
    "pattern": "Bucket Counting",
    "description": "Return the `k` values that occur most often in `nums`. The result may be in any order; tests avoid ties that would make the kth choice ambiguous.",
    "examples": [
      {
        "input": "nums = [1,1,1,2,2,3], k = 2",
        "output": "[1, 2]",
        "explanation": "1 appears three times and 2 appears twice."
      },
      {
        "input": "nums = [1], k = 1",
        "output": "[1]",
        "explanation": "The only value is the most frequent."
      },
      {
        "input": "nums = [4,4,4,6,6,7,8,8,8,8], k = 2",
        "output": "[8, 4]",
        "explanation": "8 and 4 have the two largest counts."
      }
    ],
    "constraints": [
      "`1 <= nums.length <= 10^5`",
      "`1 <= k <= number of unique values`",
      "`-10^9 <= nums[i] <= 10^9`",
      "The returned order does not matter."
    ],
    "hints": [
      "First count how many times each value appears.",
      "Sorting counts works, but frequency is bounded by `nums.length`.",
      "Bucket values by count and scan buckets from high frequency to low."
    ],
    "signature": {
      "kind": "function",
      "name": "topKFrequent",
      "params": [
        {
          "name": "nums",
          "type": "int[]"
        },
        {
          "name": "k",
          "type": "int"
        }
      ],
      "returns": "int[]"
    },
    "tests": [
      {
        "args": [
          [
            1,
            1,
            1,
            2,
            2,
            3
          ],
          2
        ],
        "expected": [
          1,
          2
        ]
      },
      {
        "args": [
          [
            1
          ],
          1
        ],
        "expected": [
          1
        ]
      },
      {
        "args": [
          [
            4,
            4,
            4,
            6,
            6,
            7,
            8,
            8,
            8,
            8
          ],
          2
        ],
        "expected": [
          8,
          4
        ]
      },
      {
        "args": [
          [
            -1,
            -1,
            -1,
            2,
            2,
            3
          ],
          1
        ],
        "expected": [
          -1
        ]
      },
      {
        "args": [
          [
            5,
            6,
            5,
            6,
            5,
            7,
            7,
            7,
            7
          ],
          2
        ],
        "expected": [
          7,
          5
        ]
      },
      {
        "args": [
          [
            9,
            9,
            8,
            8,
            8,
            7,
            7,
            7,
            7,
            6
          ],
          3
        ],
        "expected": [
          7,
          8,
          9
        ]
      },
      {
        "args": [
          [
            0,
            0,
            0,
            0,
            -1,
            -1,
            2
          ],
          2
        ],
        "expected": [
          0,
          -1
        ]
      },
      {
        "args": [
          [
            10,
            20,
            20,
            30,
            30,
            30,
            40,
            40,
            40,
            40
          ],
          1
        ],
        "expected": [
          40
        ]
      }
    ],
    "sampleCount": 3,
    "compare": "unordered",
    "solutions": [
      {
        "title": "Count Then Sort",
        "explanation": "**Intuition.** After counting frequencies, the k most frequent values are the first k entries in descending frequency order.\n\n**Steps.**\n1. Build a frequency map.\n2. Convert it to pairs of value and count.\n3. Sort pairs by count descending.\n4. Return the first k values.\n\n**Correctness.** The count map contains exact frequencies. Sorting by those frequencies orders all candidates from most to least frequent, so the first k are exactly the answer.\n\n**Pitfalls.** Tests avoid ambiguous ties across the kth boundary; in production interviews mention how ties may be handled.",
        "time": "O(n + m log m)",
        "space": "O(m)",
        "python": "class Solution:\n    def topKFrequent(self, nums: List[int], k: int) -> List[int]:\n        counts = Counter(nums)\n        return [x for x, _ in sorted(counts.items(), key=lambda item: -item[1])[:k]]\n",
        "cpp": "class Solution {\npublic:\n    vector<int> topKFrequent(vector<int>& nums, int k) {\n        unordered_map<int, int> counts;\n        for (int x : nums) counts[x]++;\n        vector<pair<int, int>> items(counts.begin(), counts.end());\n        sort(items.begin(), items.end(), [](auto& a, auto& b) { return a.second > b.second; });\n        vector<int> ans;\n        for (int i = 0; i < k; ++i) ans.push_back(items[i].first);\n        return ans;\n    }\n};"
      },
      {
        "title": "Bucket by Frequency",
        "explanation": "**Intuition.** A value can appear only 1..n times, so buckets indexed by frequency avoid sorting all unique values.\n\n**Steps.**\n1. Count each value.\n2. Create n + 1 buckets.\n3. Put each value into the bucket matching its count.\n4. Walk buckets from high to low until k values are collected.\n\n**Correctness.** Every value is placed in the bucket equal to its true frequency. Scanning buckets downward visits values in non-increasing frequency, so the first k collected are top-k values.\n\n**Pitfalls.** Do not allocate buckets by max value; allocate by array length because frequency is bounded by n.",
        "time": "O(n)",
        "space": "O(n)",
        "python": "class Solution:\n    def topKFrequent(self, nums: List[int], k: int) -> List[int]:\n        counts = Counter(nums)\n        buckets = [[] for _ in range(len(nums) + 1)]\n        for x, c in counts.items():\n            buckets[c].append(x)\n        ans = []\n        for freq in range(len(buckets) - 1, 0, -1):\n            for x in buckets[freq]:\n                ans.append(x)\n                if len(ans) == k:\n                    return ans\n        return ans\n",
        "cpp": "class Solution {\npublic:\n    vector<int> topKFrequent(vector<int>& nums, int k) {\n        unordered_map<int, int> counts;\n        for (int x : nums) counts[x]++;\n        vector<vector<int>> buckets(nums.size() + 1);\n        for (auto& kv : counts) buckets[kv.second].push_back(kv.first);\n        vector<int> ans;\n        for (int f = (int)buckets.size() - 1; f >= 1; --f) {\n            for (int x : buckets[f]) {\n                ans.push_back(x);\n                if ((int)ans.size() == k) return ans;\n            }\n        }\n        return ans;\n    }\n};"
      }
    ]
  },
  {
    "id": "encode-and-decode-strings",
    "title": "Encode and Decode Strings",
    "number": 271,
    "difficulty": "Medium",
    "category": "Arrays & Hashing",
    "pattern": "String Codec",
    "description": "Design an encoder that converts a list of strings into one string and a decoder that restores the original list exactly. Strings may be empty and may contain characters that look like separators.",
    "examples": [
      {
        "input": "strs = [\"lint\",\"code\",\"love\",\"you\"]",
        "output": "[\"lint\", \"code\", \"love\", \"you\"]",
        "explanation": "A round trip must reproduce all four strings."
      },
      {
        "input": "strs = [\"we\",\"say\",\":\",\"yes\"]",
        "output": "[\"we\", \"say\", \":\", \"yes\"]",
        "explanation": "Separator-like characters are ordinary payload."
      },
      {
        "input": "strs = []",
        "output": "[]",
        "explanation": "An empty list encodes and decodes as an empty list."
      }
    ],
    "constraints": [
      "`0 <= strs.length <= 200`",
      "`0 <= strs[i].length <= 200`",
      "Strings may contain any printable characters, separators, or whitespace.",
      "The judge checks `decode(encode(strs)) == strs`."
    ],
    "hints": [
      "A delimiter alone is unsafe if strings can contain that delimiter.",
      "Store enough length information to know exactly how many characters belong to each string.",
      "During decode, parse a length header, then copy precisely that many characters."
    ],
    "signature": {
      "kind": "codec",
      "className": "Solution",
      "encode": "encode",
      "decode": "decode",
      "dataType": "string[]"
    },
    "tests": [
      {
        "args": [
          [
            "lint",
            "code",
            "love",
            "you"
          ]
        ],
        "expected": [
          "lint",
          "code",
          "love",
          "you"
        ]
      },
      {
        "args": [
          [
            "we",
            "say",
            ":",
            "yes"
          ]
        ],
        "expected": [
          "we",
          "say",
          ":",
          "yes"
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
            ""
          ]
        ],
        "expected": [
          ""
        ]
      },
      {
        "args": [
          [
            "a#b",
            "3#x",
            "quote\"\\"
          ]
        ],
        "expected": [
          "a#b",
          "3#x",
          "quote\"\\"
        ]
      },
      {
        "args": [
          [
            "line\nbreak",
            "tab\t",
            ""
          ]
        ],
        "expected": [
          "line\nbreak",
          "tab\t",
          ""
        ]
      },
      {
        "args": [
          [
            "000",
            "00#00"
          ]
        ],
        "expected": [
          "000",
          "00#00"
        ]
      },
      {
        "args": [
          [
            "emoji🙂",
            "plain"
          ]
        ],
        "expected": [
          "emoji🙂",
          "plain"
        ]
      }
    ],
    "sampleCount": 3,
    "solutions": [
      {
        "title": "Length Prefix with Separator",
        "explanation": "**Intuition.** The decoder needs to know where each string ends, even when strings contain separators or newlines. Prefixing each string with its length makes boundaries explicit.\n\n**Steps.**\n1. For encode, append length, a marker, then the raw string for each item.\n2. For decode, read digits until the marker.\n3. Parse that length and copy exactly that many following characters.\n4. Continue until the encoded text is consumed.\n\n**Correctness.** Each encoded segment states the exact number of payload characters. The decoder consumes exactly one segment at a time, so it reconstructs every original string in order.\n\n**Pitfalls.** Never split on the marker globally; the marker may appear inside a payload.",
        "time": "O(total characters)",
        "space": "O(total characters)",
        "python": "class Solution:\n    def encode(self, strs: List[str]) -> str:\n        return ''.join(f\"{len(s)}#{s}\" for s in strs)\n\n    def decode(self, s: str) -> List[str]:\n        ans = []\n        i = 0\n        while i < len(s):\n            j = s.index('#', i)\n            length = int(s[i:j])\n            start = j + 1\n            ans.append(s[start:start + length])\n            i = start + length\n        return ans\n",
        "cpp": "class Solution {\npublic:\n    string encode(vector<string>& strs) {\n        string out;\n        for (string& s : strs) out += to_string(s.size()) + \"#\" + s;\n        return out;\n    }\n\n    vector<string> decode(string s) {\n        vector<string> ans;\n        size_t i = 0;\n        while (i < s.size()) {\n            size_t j = s.find('#', i);\n            int len = stoi(s.substr(i, j - i));\n            ans.push_back(s.substr(j + 1, len));\n            i = j + 1 + len;\n        }\n        return ans;\n    }\n};"
      },
      {
        "title": "Fixed-Width Length Header",
        "explanation": "**Intuition.** A fixed number of digits for each length removes the need for a delimiter before the payload.\n\n**Steps.**\n1. Encode each string as an eight-digit length followed by the string itself.\n2. Decode by reading eight characters for the length.\n3. Read exactly that many payload characters.\n4. Repeat until the stream ends.\n\n**Correctness.** Because every header has known width, the decoder always finds the next length. Each length then determines the exact following payload, reproducing the original list.\n\n**Pitfalls.** Choose a header width large enough for the constraints; eight digits easily covers interview-sized strings.",
        "time": "O(total characters)",
        "space": "O(total characters)",
        "python": "class Solution:\n    def encode(self, strs: List[str]) -> str:\n        return ''.join(f\"{len(s):08d}{s}\" for s in strs)\n\n    def decode(self, s: str) -> List[str]:\n        ans = []\n        i = 0\n        while i < len(s):\n            length = int(s[i:i + 8])\n            i += 8\n            ans.append(s[i:i + length])\n            i += length\n        return ans\n",
        "cpp": "class Solution {\npublic:\n    string encode(vector<string>& strs) {\n        string out;\n        for (string& s : strs) {\n            ostringstream os;\n            os << setw(8) << setfill('0') << s.size();\n            out += os.str() + s;\n        }\n        return out;\n    }\n\n    vector<string> decode(string s) {\n        vector<string> ans;\n        size_t i = 0;\n        while (i < s.size()) {\n            int len = stoi(s.substr(i, 8));\n            i += 8;\n            ans.push_back(s.substr(i, len));\n            i += len;\n        }\n        return ans;\n    }\n};"
      }
    ]
  },
  {
    "id": "product-of-array-except-self",
    "title": "Product of Array Except Self",
    "number": 238,
    "difficulty": "Medium",
    "category": "Arrays & Hashing",
    "pattern": "Prefix Product",
    "description": "For each index, return the product of every array value except the value at that index. Do this without using division in the intended solution.",
    "examples": [
      {
        "input": "nums = [1,2,3,4]",
        "output": "[24, 12, 8, 6]",
        "explanation": "Each output multiplies the other three values."
      },
      {
        "input": "nums = [-1,1,0,-3,3]",
        "output": "[0, 0, 9, 0, 0]",
        "explanation": "The zero affects every position except its own."
      },
      {
        "input": "nums = [2,3,4,5]",
        "output": "[60, 40, 30, 24]",
        "explanation": "No zeroes are present."
      }
    ],
    "constraints": [
      "`1 <= nums.length <= 10^5`",
      "`-30 <= nums[i] <= 30`",
      "The product of any prefix or suffix fits in a 32-bit integer.",
      "Do not use division for the optimal approach."
    ],
    "hints": [
      "The answer at i can be split into values before i and values after i.",
      "A left-to-right pass can store prefix products.",
      "A right-to-left pass can multiply in suffix products without extra arrays."
    ],
    "signature": {
      "kind": "function",
      "name": "productExceptSelf",
      "params": [
        {
          "name": "nums",
          "type": "int[]"
        }
      ],
      "returns": "int[]"
    },
    "tests": [
      {
        "args": [
          [
            1,
            2,
            3,
            4
          ]
        ],
        "expected": [
          24,
          12,
          8,
          6
        ]
      },
      {
        "args": [
          [
            -1,
            1,
            0,
            -3,
            3
          ]
        ],
        "expected": [
          0,
          0,
          9,
          0,
          0
        ]
      },
      {
        "args": [
          [
            2,
            3,
            4,
            5
          ]
        ],
        "expected": [
          60,
          40,
          30,
          24
        ]
      },
      {
        "args": [
          [
            0,
            0
          ]
        ],
        "expected": [
          0,
          0
        ]
      },
      {
        "args": [
          [
            5
          ]
        ],
        "expected": [
          1
        ]
      },
      {
        "args": [
          [
            0,
            4,
            5
          ]
        ],
        "expected": [
          20,
          0,
          0
        ]
      },
      {
        "args": [
          [
            -2,
            -3,
            4
          ]
        ],
        "expected": [
          -12,
          -8,
          6
        ]
      },
      {
        "args": [
          [
            1,
            1,
            1,
            1
          ]
        ],
        "expected": [
          1,
          1,
          1,
          1
        ]
      }
    ],
    "sampleCount": 3,
    "solutions": [
      {
        "title": "Multiply All Other Positions",
        "explanation": "**Intuition.** For each index, directly multiply every value except the one at that index.\n\n**Steps.**\n1. For each output position i, start a product at 1.\n2. Scan the whole array.\n3. Multiply values whose index is not i.\n4. Store the product.\n\n**Correctness.** For every i, the inner loop includes exactly the elements required by the definition and excludes nums[i], so each output cell is correct.\n\n**Pitfalls.** This works with zeroes but is too slow for large inputs.",
        "time": "O(n^2)",
        "space": "O(1) extra besides the answer",
        "python": "class Solution:\n    def productExceptSelf(self, nums: List[int]) -> List[int]:\n        ans = []\n        for i in range(len(nums)):\n            prod = 1\n            for j, x in enumerate(nums):\n                if i != j:\n                    prod *= x\n            ans.append(prod)\n        return ans\n",
        "cpp": "class Solution {\npublic:\n    vector<int> productExceptSelf(vector<int>& nums) {\n        vector<int> ans(nums.size(), 1);\n        for (int i = 0; i < (int)nums.size(); ++i) {\n            int prod = 1;\n            for (int j = 0; j < (int)nums.size(); ++j) if (i != j) prod *= nums[j];\n            ans[i] = prod;\n        }\n        return ans;\n    }\n};"
      },
      {
        "title": "Prefix and Suffix Products",
        "explanation": "**Intuition.** The product except self is product of everything to the left times product of everything to the right.\n\n**Steps.**\n1. Fill the answer with prefix products while scanning left to right.\n2. Keep a running suffix product while scanning right to left.\n3. Multiply each answer cell by the suffix seen after it.\n\n**Correctness.** After the first pass ans[i] is the product of elements before i. During the second pass the suffix variable is the product after i, so multiplying gives exactly all elements except nums[i].\n\n**Pitfalls.** Do not use division; this handles one or more zeroes naturally.",
        "time": "O(n)",
        "space": "O(1) extra besides the answer",
        "python": "class Solution:\n    def productExceptSelf(self, nums: List[int]) -> List[int]:\n        ans = [1] * len(nums)\n        prefix = 1\n        for i, x in enumerate(nums):\n            ans[i] = prefix\n            prefix *= x\n        suffix = 1\n        for i in range(len(nums) - 1, -1, -1):\n            ans[i] *= suffix\n            suffix *= nums[i]\n        return ans\n",
        "cpp": "class Solution {\npublic:\n    vector<int> productExceptSelf(vector<int>& nums) {\n        vector<int> ans(nums.size(), 1);\n        int prefix = 1;\n        for (int i = 0; i < (int)nums.size(); ++i) {\n            ans[i] = prefix;\n            prefix *= nums[i];\n        }\n        int suffix = 1;\n        for (int i = (int)nums.size() - 1; i >= 0; --i) {\n            ans[i] *= suffix;\n            suffix *= nums[i];\n        }\n        return ans;\n    }\n};"
      }
    ]
  },
  {
    "id": "valid-sudoku",
    "title": "Valid Sudoku",
    "number": 36,
    "difficulty": "Medium",
    "category": "Arrays & Hashing",
    "pattern": "Constraint Sets",
    "description": "Given a partially filled 9 by 9 Sudoku board, check whether the filled cells obey Sudoku rules. Empty cells are represented by `.` and do not need to be solved.",
    "examples": [
      {
        "input": "board = standard partially filled board",
        "output": "true",
        "explanation": "No row, column, or box repeats a digit."
      },
      {
        "input": "board = same board with an extra 5 in the first row",
        "output": "false",
        "explanation": "The first row has a duplicate 5."
      },
      {
        "input": "board = same board with an extra 6 in the first column",
        "output": "false",
        "explanation": "The first column has a duplicate 6."
      }
    ],
    "constraints": [
      "`board.length == 9` and `board[i].length == 9`",
      "`board[i][j]` is `'.'` or a digit from `'1'` to `'9'`.",
      "Only currently filled cells are validated; solvability is not required.",
      "Each row, column, and 3x3 box may contain a digit at most once."
    ],
    "hints": [
      "The same duplicate rule is applied to rows, columns, and boxes.",
      "A set can detect whether a digit was already seen in a unit.",
      "For each filled cell, check three sets: its row, its column, and its box."
    ],
    "signature": {
      "kind": "function",
      "name": "isValidSudoku",
      "params": [
        {
          "name": "board",
          "type": "char[][]"
        }
      ],
      "returns": "bool"
    },
    "tests": [
      {
        "args": [
          [
            [
              "5",
              "3",
              ".",
              ".",
              "7",
              ".",
              ".",
              ".",
              "."
            ],
            [
              "6",
              ".",
              ".",
              "1",
              "9",
              "5",
              ".",
              ".",
              "."
            ],
            [
              ".",
              "9",
              "8",
              ".",
              ".",
              ".",
              ".",
              "6",
              "."
            ],
            [
              "8",
              ".",
              ".",
              ".",
              "6",
              ".",
              ".",
              ".",
              "3"
            ],
            [
              "4",
              ".",
              ".",
              "8",
              ".",
              "3",
              ".",
              ".",
              "1"
            ],
            [
              "7",
              ".",
              ".",
              ".",
              "2",
              ".",
              ".",
              ".",
              "6"
            ],
            [
              ".",
              "6",
              ".",
              ".",
              ".",
              ".",
              "2",
              "8",
              "."
            ],
            [
              ".",
              ".",
              ".",
              "4",
              "1",
              "9",
              ".",
              ".",
              "5"
            ],
            [
              ".",
              ".",
              ".",
              ".",
              "8",
              ".",
              ".",
              "7",
              "9"
            ]
          ]
        ],
        "expected": true
      },
      {
        "args": [
          [
            [
              "5",
              "3",
              "5",
              ".",
              "7",
              ".",
              ".",
              ".",
              "."
            ],
            [
              "6",
              ".",
              ".",
              "1",
              "9",
              "5",
              ".",
              ".",
              "."
            ],
            [
              ".",
              "9",
              "8",
              ".",
              ".",
              ".",
              ".",
              "6",
              "."
            ],
            [
              "8",
              ".",
              ".",
              ".",
              "6",
              ".",
              ".",
              ".",
              "3"
            ],
            [
              "4",
              ".",
              ".",
              "8",
              ".",
              "3",
              ".",
              ".",
              "1"
            ],
            [
              "7",
              ".",
              ".",
              ".",
              "2",
              ".",
              ".",
              ".",
              "6"
            ],
            [
              ".",
              "6",
              ".",
              ".",
              ".",
              ".",
              "2",
              "8",
              "."
            ],
            [
              ".",
              ".",
              ".",
              "4",
              "1",
              "9",
              ".",
              ".",
              "5"
            ],
            [
              ".",
              ".",
              ".",
              ".",
              "8",
              ".",
              ".",
              "7",
              "9"
            ]
          ]
        ],
        "expected": false
      },
      {
        "args": [
          [
            [
              "5",
              "3",
              ".",
              ".",
              "7",
              ".",
              ".",
              ".",
              "."
            ],
            [
              "6",
              ".",
              ".",
              "1",
              "9",
              "5",
              ".",
              ".",
              "."
            ],
            [
              "6",
              "9",
              "8",
              ".",
              ".",
              ".",
              ".",
              "6",
              "."
            ],
            [
              "8",
              ".",
              ".",
              ".",
              "6",
              ".",
              ".",
              ".",
              "3"
            ],
            [
              "4",
              ".",
              ".",
              "8",
              ".",
              "3",
              ".",
              ".",
              "1"
            ],
            [
              "7",
              ".",
              ".",
              ".",
              "2",
              ".",
              ".",
              ".",
              "6"
            ],
            [
              ".",
              "6",
              ".",
              ".",
              ".",
              ".",
              "2",
              "8",
              "."
            ],
            [
              ".",
              ".",
              ".",
              "4",
              "1",
              "9",
              ".",
              ".",
              "5"
            ],
            [
              ".",
              ".",
              ".",
              ".",
              "8",
              ".",
              ".",
              "7",
              "9"
            ]
          ]
        ],
        "expected": false
      },
      {
        "args": [
          [
            [
              "5",
              "3",
              ".",
              ".",
              "7",
              ".",
              ".",
              ".",
              "."
            ],
            [
              "6",
              "9",
              ".",
              "1",
              "9",
              "5",
              ".",
              ".",
              "."
            ],
            [
              ".",
              "9",
              "8",
              ".",
              ".",
              ".",
              ".",
              "6",
              "."
            ],
            [
              "8",
              ".",
              ".",
              ".",
              "6",
              ".",
              ".",
              ".",
              "3"
            ],
            [
              "4",
              ".",
              ".",
              "8",
              ".",
              "3",
              ".",
              ".",
              "1"
            ],
            [
              "7",
              ".",
              ".",
              ".",
              "2",
              ".",
              ".",
              ".",
              "6"
            ],
            [
              ".",
              "6",
              ".",
              ".",
              ".",
              ".",
              "2",
              "8",
              "."
            ],
            [
              ".",
              ".",
              ".",
              "4",
              "1",
              "9",
              ".",
              ".",
              "5"
            ],
            [
              ".",
              ".",
              ".",
              ".",
              "8",
              ".",
              ".",
              "7",
              "9"
            ]
          ]
        ],
        "expected": false
      },
      {
        "args": [
          [
            [
              ".",
              ".",
              ".",
              ".",
              ".",
              ".",
              ".",
              ".",
              "."
            ],
            [
              ".",
              ".",
              ".",
              ".",
              ".",
              ".",
              ".",
              ".",
              "."
            ],
            [
              ".",
              ".",
              ".",
              ".",
              ".",
              ".",
              ".",
              ".",
              "."
            ],
            [
              ".",
              ".",
              ".",
              ".",
              ".",
              ".",
              ".",
              ".",
              "."
            ],
            [
              ".",
              ".",
              ".",
              ".",
              ".",
              ".",
              ".",
              ".",
              "."
            ],
            [
              ".",
              ".",
              ".",
              ".",
              ".",
              ".",
              ".",
              ".",
              "."
            ],
            [
              ".",
              ".",
              ".",
              ".",
              ".",
              ".",
              ".",
              ".",
              "."
            ],
            [
              ".",
              ".",
              ".",
              ".",
              ".",
              ".",
              ".",
              ".",
              "."
            ],
            [
              ".",
              ".",
              ".",
              ".",
              ".",
              ".",
              ".",
              ".",
              "."
            ]
          ]
        ],
        "expected": true
      },
      {
        "args": [
          [
            [
              "8",
              "3",
              "5",
              "4",
              "1",
              "6",
              "9",
              "2",
              "7"
            ],
            [
              "2",
              "9",
              "6",
              "8",
              "5",
              "7",
              "4",
              "3",
              "1"
            ],
            [
              "4",
              "1",
              "7",
              "2",
              "9",
              "3",
              "6",
              "5",
              "8"
            ],
            [
              "5",
              "6",
              "9",
              "1",
              "3",
              "4",
              "7",
              "8",
              "2"
            ],
            [
              "1",
              "2",
              "3",
              "6",
              "7",
              "8",
              "5",
              "4",
              "9"
            ],
            [
              "7",
              "4",
              "8",
              "5",
              "2",
              "9",
              "1",
              "6",
              "3"
            ],
            [
              "6",
              "5",
              "2",
              "7",
              "8",
              "1",
              "3",
              "9",
              "4"
            ],
            [
              "9",
              "8",
              "1",
              "3",
              "4",
              "5",
              "2",
              "7",
              "6"
            ],
            [
              "3",
              "7",
              "4",
              "9",
              "6",
              "2",
              "8",
              "1",
              "5"
            ]
          ]
        ],
        "expected": true
      },
      {
        "args": [
          [
            [
              "8",
              "3",
              "5",
              "4",
              "1",
              "6",
              "9",
              "2",
              "7"
            ],
            [
              "2",
              "9",
              "6",
              "8",
              "5",
              "7",
              "4",
              "3",
              "1"
            ],
            [
              "4",
              "1",
              "7",
              "2",
              "9",
              "3",
              "6",
              "5",
              "8"
            ],
            [
              "5",
              "6",
              "9",
              "1",
              "3",
              "4",
              "7",
              "8",
              "2"
            ],
            [
              "1",
              "2",
              "3",
              "6",
              "7",
              "8",
              "5",
              "4",
              "9"
            ],
            [
              "7",
              "4",
              "8",
              "5",
              "2",
              "9",
              "1",
              "6",
              "3"
            ],
            [
              "6",
              "5",
              "2",
              "7",
              "8",
              "1",
              "3",
              "9",
              "4"
            ],
            [
              "9",
              "8",
              "1",
              "3",
              "4",
              "5",
              "2",
              "7",
              "6"
            ],
            [
              "3",
              "7",
              "4",
              "9",
              "6",
              "2",
              "8",
              "1",
              "8"
            ]
          ]
        ],
        "expected": false
      },
      {
        "args": [
          [
            [
              ".",
              ".",
              ".",
              ".",
              ".",
              ".",
              ".",
              ".",
              "."
            ],
            [
              ".",
              ".",
              ".",
              ".",
              ".",
              ".",
              ".",
              ".",
              "."
            ],
            [
              ".",
              ".",
              ".",
              ".",
              ".",
              ".",
              ".",
              ".",
              "."
            ],
            [
              ".",
              ".",
              ".",
              ".",
              ".",
              ".",
              ".",
              ".",
              "."
            ],
            [
              ".",
              ".",
              ".",
              ".",
              "1",
              ".",
              ".",
              ".",
              "."
            ],
            [
              ".",
              ".",
              ".",
              ".",
              ".",
              ".",
              ".",
              ".",
              "."
            ],
            [
              ".",
              ".",
              ".",
              ".",
              ".",
              ".",
              ".",
              ".",
              "."
            ],
            [
              ".",
              ".",
              ".",
              ".",
              ".",
              ".",
              ".",
              ".",
              "."
            ],
            [
              ".",
              ".",
              ".",
              ".",
              ".",
              ".",
              ".",
              ".",
              "."
            ]
          ]
        ],
        "expected": true
      }
    ],
    "sampleCount": 3,
    "solutions": [
      {
        "title": "Validate Each Unit Separately",
        "explanation": "**Intuition.** A board is valid when each row, column, and 3x3 box has no repeated digit.\n\n**Steps.**\n1. Check all rows with a set.\n2. Check all columns with a set.\n3. Check each 3x3 box with a set.\n4. Ignore dot cells throughout.\n\n**Correctness.** The Sudoku rule is exactly the conjunction of those 27 no-duplicate checks, so passing all checks is equivalent to validity.\n\n**Pitfalls.** Dots are placeholders and must not be inserted as repeated values.",
        "time": "O(1)",
        "space": "O(1)",
        "python": "class Solution:\n    def isValidSudoku(self, board: List[List[str]]) -> bool:\n        def ok(cells):\n            vals = [x for x in cells if x != '.']\n            return len(vals) == len(set(vals))\n        for r in range(9):\n            if not ok(board[r]):\n                return False\n        for c in range(9):\n            if not ok(board[r][c] for r in range(9)):\n                return False\n        for br in range(0, 9, 3):\n            for bc in range(0, 9, 3):\n                if not ok(board[r][c] for r in range(br, br + 3) for c in range(bc, bc + 3)):\n                    return False\n        return True\n",
        "cpp": "class Solution {\npublic:\n    bool isValidSudoku(vector<vector<char>>& board) {\n        auto ok = [](vector<char> vals) {\n            unordered_set<char> seen;\n            for (char ch : vals) {\n                if (ch == '.') continue;\n                if (seen.count(ch)) return false;\n                seen.insert(ch);\n            }\n            return true;\n        };\n        for (int r = 0; r < 9; ++r) if (!ok(board[r])) return false;\n        for (int c = 0; c < 9; ++c) {\n            vector<char> vals;\n            for (int r = 0; r < 9; ++r) vals.push_back(board[r][c]);\n            if (!ok(vals)) return false;\n        }\n        for (int br = 0; br < 9; br += 3) for (int bc = 0; bc < 9; bc += 3) {\n            vector<char> vals;\n            for (int r = br; r < br + 3; ++r) for (int c = bc; c < bc + 3; ++c) vals.push_back(board[r][c]);\n            if (!ok(vals)) return false;\n        }\n        return true;\n    }\n};"
      },
      {
        "title": "Single Pass Sets",
        "explanation": "**Intuition.** Record the row, column, and box claim made by every filled cell as you scan once.\n\n**Steps.**\n1. Maintain sets for rows, columns, and boxes.\n2. For each non-dot cell, compute its box index.\n3. If the digit already appears in any relevant set, return false.\n4. Otherwise insert it into all three sets.\n\n**Correctness.** Each insertion records exactly one Sudoku constraint for a filled digit. A duplicate in a row, column, or box is detected when trying to insert an already-seen digit.\n\n**Pitfalls.** The box index is (r // 3, c // 3), not r % 3 or c % 3.",
        "time": "O(1)",
        "space": "O(1)",
        "python": "class Solution:\n    def isValidSudoku(self, board: List[List[str]]) -> bool:\n        rows = [set() for _ in range(9)]\n        cols = [set() for _ in range(9)]\n        boxes = [set() for _ in range(9)]\n        for r in range(9):\n            for c in range(9):\n                ch = board[r][c]\n                if ch == '.':\n                    continue\n                b = (r // 3) * 3 + c // 3\n                if ch in rows[r] or ch in cols[c] or ch in boxes[b]:\n                    return False\n                rows[r].add(ch); cols[c].add(ch); boxes[b].add(ch)\n        return True\n",
        "cpp": "class Solution {\npublic:\n    bool isValidSudoku(vector<vector<char>>& board) {\n        vector<unordered_set<char>> rows(9), cols(9), boxes(9);\n        for (int r = 0; r < 9; ++r) {\n            for (int c = 0; c < 9; ++c) {\n                char ch = board[r][c];\n                if (ch == '.') continue;\n                int b = (r / 3) * 3 + c / 3;\n                if (rows[r].count(ch) || cols[c].count(ch) || boxes[b].count(ch)) return false;\n                rows[r].insert(ch); cols[c].insert(ch); boxes[b].insert(ch);\n            }\n        }\n        return true;\n    }\n};"
      }
    ]
  },
  {
    "id": "longest-consecutive-sequence",
    "title": "Longest Consecutive Sequence",
    "number": 128,
    "difficulty": "Medium",
    "category": "Arrays & Hashing",
    "pattern": "Hash Set",
    "description": "Return the length of the longest run of integer values that appear consecutively in `nums`. The numbers may be in any order and duplicates should not extend the run.",
    "examples": [
      {
        "input": "nums = [100,4,200,1,3,2]",
        "output": "4",
        "explanation": "The run 1,2,3,4 has length 4."
      },
      {
        "input": "nums = [0,3,7,2,5,8,4,6,0,1]",
        "output": "9",
        "explanation": "Values 0 through 8 are present."
      },
      {
        "input": "nums = [1,0,1,2]",
        "output": "3",
        "explanation": "Duplicates do not change the run 0,1,2."
      }
    ],
    "constraints": [
      "`0 <= nums.length <= 10^5`",
      "`-10^9 <= nums[i] <= 10^9`",
      "The intended solution runs in O(n) time.",
      "Duplicate values count once."
    ],
    "hints": [
      "A run should be counted from its smallest value.",
      "How can you tell whether a number is the start of a run?",
      "Put values in a set and only expand from x when x - 1 is absent."
    ],
    "signature": {
      "kind": "function",
      "name": "longestConsecutive",
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
          [
            100,
            4,
            200,
            1,
            3,
            2
          ]
        ],
        "expected": 4
      },
      {
        "args": [
          [
            0,
            3,
            7,
            2,
            5,
            8,
            4,
            6,
            0,
            1
          ]
        ],
        "expected": 9
      },
      {
        "args": [
          [
            1,
            0,
            1,
            2
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
            5
          ]
        ],
        "expected": 1
      },
      {
        "args": [
          [
            -2,
            -3,
            -1,
            7
          ]
        ],
        "expected": 3
      },
      {
        "args": [
          [
            10,
            30,
            20
          ]
        ],
        "expected": 1
      },
      {
        "args": [
          [
            9,
            1,
            4,
            7,
            3,
            -1,
            0,
            5,
            8,
            -1,
            6
          ]
        ],
        "expected": 7
      }
    ],
    "sampleCount": 3,
    "solutions": [
      {
        "title": "Sort Unique Values",
        "explanation": "**Intuition.** Consecutive numbers are adjacent after sorting and deduplicating.\n\n**Steps.**\n1. Sort the distinct values.\n2. Scan them in order.\n3. Extend the current run when the next value is previous + 1.\n4. Reset the run on gaps and keep the best length.\n\n**Correctness.** Every consecutive run appears as a contiguous block in sorted unique order. The scan measures each block exactly once and records the maximum.\n\n**Pitfalls.** Remove duplicates first so repeated values do not break or inflate a run.",
        "time": "O(n log n)",
        "space": "O(n)",
        "python": "class Solution:\n    def longestConsecutive(self, nums: List[int]) -> int:\n        vals = sorted(set(nums))\n        best = cur = 0\n        prev = None\n        for x in vals:\n            cur = cur + 1 if prev is not None and x == prev + 1 else 1\n            best = max(best, cur)\n            prev = x\n        return best\n",
        "cpp": "class Solution {\npublic:\n    int longestConsecutive(vector<int>& nums) {\n        sort(nums.begin(), nums.end());\n        nums.erase(unique(nums.begin(), nums.end()), nums.end());\n        int best = 0, cur = 0, prev = 0;\n        bool have = false;\n        for (int x : nums) {\n            cur = (have && x == prev + 1) ? cur + 1 : 1;\n            best = max(best, cur);\n            prev = x;\n            have = true;\n        }\n        return best;\n    }\n};"
      },
      {
        "title": "Hash Set Starts",
        "explanation": "**Intuition.** Only numbers with no predecessor can start a run, so count forward from those starts.\n\n**Steps.**\n1. Put all values in a set.\n2. For each value x, skip it if x - 1 exists.\n3. Otherwise count x, x + 1, x + 2, ... while present.\n4. Track the longest count.\n\n**Correctness.** Every run has exactly one smallest value, and only that value passes the no-predecessor test. Counting forward from starts measures every run once.\n\n**Pitfalls.** Without the start check, repeatedly counting from interior values can degrade to quadratic time.",
        "time": "O(n)",
        "space": "O(n)",
        "python": "class Solution:\n    def longestConsecutive(self, nums: List[int]) -> int:\n        values = set(nums)\n        best = 0\n        for x in values:\n            if x - 1 in values:\n                continue\n            y = x\n            while y in values:\n                y += 1\n            best = max(best, y - x)\n        return best\n",
        "cpp": "class Solution {\npublic:\n    int longestConsecutive(vector<int>& nums) {\n        unordered_set<int> values(nums.begin(), nums.end());\n        int best = 0;\n        for (int x : values) {\n            if (values.count(x - 1)) continue;\n            int y = x;\n            while (values.count(y)) ++y;\n            best = max(best, y - x);\n        }\n        return best;\n    }\n};"
      }
    ]
  }
]

export default problems
