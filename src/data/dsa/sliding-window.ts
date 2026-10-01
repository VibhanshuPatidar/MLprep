import type { DsaProblem } from '../../types/content'

const problems: DsaProblem[] = [
  {
    "id": "best-time-to-buy-and-sell-stock",
    "title": "Best Time to Buy and Sell Stock",
    "number": 121,
    "difficulty": "Easy",
    "category": "Sliding Window",
    "pattern": "One Pass",
    "description": "Given daily stock prices, choose one day to buy and a later day to sell. Return the maximum possible profit, or 0 if every sale would lose money.",
    "examples": [
      {
        "input": "prices = [7,1,5,3,6,4]",
        "output": "5",
        "explanation": "Buy at 1 and sell at 6."
      },
      {
        "input": "prices = [7,6,4,3,1]",
        "output": "0",
        "explanation": "Prices only decrease, so do not trade."
      },
      {
        "input": "prices = [1,2]",
        "output": "1",
        "explanation": "One profitable transaction is possible."
      }
    ],
    "constraints": [
      "`1 <= prices.length <= 10^5`",
      "`0 <= prices[i] <= 10^4`",
      "Buy before you sell.",
      "At most one transaction is allowed."
    ],
    "hints": [
      "For a fixed sell day, the best buy is the lowest earlier price.",
      "Track that minimum while scanning.",
      "Update best profit with `price - minPrice` at each day."
    ],
    "signature": {
      "kind": "function",
      "name": "maxProfit",
      "params": [
        {
          "name": "prices",
          "type": "int[]"
        }
      ],
      "returns": "int"
    },
    "tests": [
      {
        "args": [
          [
            7,
            1,
            5,
            3,
            6,
            4
          ]
        ],
        "expected": 5
      },
      {
        "args": [
          [
            7,
            6,
            4,
            3,
            1
          ]
        ],
        "expected": 0
      },
      {
        "args": [
          [
            1,
            2
          ]
        ],
        "expected": 1
      },
      {
        "args": [
          [
            2,
            4,
            1
          ]
        ],
        "expected": 2
      },
      {
        "args": [
          [
            3,
            3,
            5,
            0,
            0,
            3,
            1,
            4
          ]
        ],
        "expected": 4
      },
      {
        "args": [
          [
            1
          ]
        ],
        "expected": 0
      },
      {
        "args": [
          [
            2,
            1,
            2,
            0,
            1
          ]
        ],
        "expected": 1
      },
      {
        "args": [
          [
            10,
            1,
            2,
            3,
            4,
            0,
            9
          ]
        ],
        "expected": 9
      }
    ],
    "sampleCount": 3,
    "solutions": [
      {
        "title": "Try Every Buy/Sell Pair",
        "explanation": "**Intuition.** Profit is defined by a buy day before a sell day, so test all such pairs.\n\n**Steps.**\n1. Loop over the buy day.\n2. Loop over later sell days.\n3. Compute prices[sell] - prices[buy].\n4. Track the largest non-negative profit.\n\n**Correctness.** Every legal transaction is examined and its exact profit is considered, so the maximum retained value is the best possible profit.\n\n**Pitfalls.** Selling before buying is not allowed; the inner loop must start after the buy index.",
        "time": "O(n^2)",
        "space": "O(1)",
        "python": "class Solution:\n    def maxProfit(self, prices: List[int]) -> int:\n        best = 0\n        for buy in range(len(prices)):\n            for sell in range(buy + 1, len(prices)):\n                best = max(best, prices[sell] - prices[buy])\n        return best\n",
        "cpp": "class Solution {\npublic:\n    int maxProfit(vector<int>& prices) {\n        int best = 0;\n        for (int buy = 0; buy < (int)prices.size(); ++buy) {\n            for (int sell = buy + 1; sell < (int)prices.size(); ++sell) {\n                best = max(best, prices[sell] - prices[buy]);\n            }\n        }\n        return best;\n    }\n};"
      },
      {
        "title": "One Pass Minimum Price",
        "explanation": "**Intuition.** For each sell day, the best buy day is the cheapest earlier price.\n\n**Steps.**\n1. Track the minimum price seen so far.\n2. For each price, compute selling profit against that minimum.\n3. Update the best profit.\n4. Then update the minimum price.\n\n**Correctness.** At each day, minPrice is the cheapest valid buy price before or at that day. The best sell ending there is price - minPrice, and taking the max over days gives the global optimum.\n\n**Pitfalls.** Update the minimum as you scan; do not reset it after a profitable sale because only one transaction is allowed.",
        "time": "O(n)",
        "space": "O(1)",
        "python": "class Solution:\n    def maxProfit(self, prices: List[int]) -> int:\n        best = 0\n        low = float('inf')\n        for price in prices:\n            low = min(low, price)\n            best = max(best, price - low)\n        return best\n",
        "cpp": "class Solution {\npublic:\n    int maxProfit(vector<int>& prices) {\n        int low = INT_MAX, best = 0;\n        for (int price : prices) {\n            low = min(low, price);\n            best = max(best, price - low);\n        }\n        return best;\n    }\n};"
      }
    ],
    "viz": "sliding-window"
  },
  {
    "id": "longest-substring-without-repeating-characters",
    "title": "Longest Substring Without Repeating Characters",
    "number": 3,
    "difficulty": "Medium",
    "category": "Sliding Window",
    "pattern": "Sliding Window",
    "description": "Return the length of the longest contiguous substring of `s` that contains no repeated characters.",
    "examples": [
      {
        "input": "s = \"abcabcbb\"",
        "output": "3",
        "explanation": "\"abc\" is one longest duplicate-free substring."
      },
      {
        "input": "s = \"bbbbb\"",
        "output": "1",
        "explanation": "Only one b can be kept."
      },
      {
        "input": "s = \"pwwkew\"",
        "output": "3",
        "explanation": "\"wke\" has length 3."
      }
    ],
    "constraints": [
      "`0 <= s.length <= 5 * 10^4`",
      "`s` may contain letters, digits, symbols, and spaces.",
      "Substrings must be contiguous.",
      "Return a length, not the substring itself."
    ],
    "hints": [
      "Maintain a window that has no duplicates.",
      "When a repeated character appears, move the left edge past its previous occurrence.",
      "A last-seen index map lets you jump instead of moving one step at a time."
    ],
    "signature": {
      "kind": "function",
      "name": "lengthOfLongestSubstring",
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
        "args": [
          "abcabcbb"
        ],
        "expected": 3
      },
      {
        "args": [
          "bbbbb"
        ],
        "expected": 1
      },
      {
        "args": [
          "pwwkew"
        ],
        "expected": 3
      },
      {
        "args": [
          ""
        ],
        "expected": 0
      },
      {
        "args": [
          "dvdf"
        ],
        "expected": 3
      },
      {
        "args": [
          "abba"
        ],
        "expected": 2
      },
      {
        "args": [
          "anviaj"
        ],
        "expected": 5
      },
      {
        "args": [
          "tmmzuxt"
        ],
        "expected": 5
      }
    ],
    "sampleCount": 3,
    "solutions": [
      {
        "title": "Check Each Start",
        "explanation": "**Intuition.** Grow a substring from every start until the first repeated character.\n\n**Steps.**\n1. For each start index, create an empty set.\n2. Extend right while characters are new.\n3. Stop when a duplicate appears.\n4. Update the best length after each extension.\n\n**Correctness.** For a fixed start, the longest duplicate-free substring ending before the first repeat is found exactly. Trying all starts finds the global best.\n\n**Pitfalls.** Clear the set for each new start; otherwise windows from different starts mix together.",
        "time": "O(n^2)",
        "space": "O(min(n, alphabet))",
        "python": "class Solution:\n    def lengthOfLongestSubstring(self, s: str) -> int:\n        best = 0\n        for i in range(len(s)):\n            seen = set()\n            for j in range(i, len(s)):\n                if s[j] in seen:\n                    break\n                seen.add(s[j])\n                best = max(best, j - i + 1)\n        return best\n",
        "cpp": "class Solution {\npublic:\n    int lengthOfLongestSubstring(string s) {\n        int best = 0;\n        for (int i = 0; i < (int)s.size(); ++i) {\n            unordered_set<char> seen;\n            for (int j = i; j < (int)s.size(); ++j) {\n                if (seen.count(s[j])) break;\n                seen.insert(s[j]);\n                best = max(best, j - i + 1);\n            }\n        }\n        return best;\n    }\n};"
      },
      {
        "title": "Sliding Window Last Seen",
        "explanation": "**Intuition.** Maintain the current duplicate-free window and jump its left edge past repeated characters.\n\n**Steps.**\n1. Store the latest index of each character.\n2. When s[r] was seen inside the window, move left to last + 1.\n3. Update s[r] as last seen.\n4. Track the largest r - left + 1.\n\n**Correctness.** The window invariant is that it contains no duplicate characters. On a repeat, moving left just past the previous occurrence restores the invariant with the smallest possible left edge.\n\n**Pitfalls.** Use max(left, last[ch] + 1) so older repeats outside the window do not move left backward.",
        "time": "O(n)",
        "space": "O(min(n, alphabet))",
        "python": "class Solution:\n    def lengthOfLongestSubstring(self, s: str) -> int:\n        last = {}\n        left = best = 0\n        for right, ch in enumerate(s):\n            if ch in last:\n                left = max(left, last[ch] + 1)\n            last[ch] = right\n            best = max(best, right - left + 1)\n        return best\n",
        "cpp": "class Solution {\npublic:\n    int lengthOfLongestSubstring(string s) {\n        unordered_map<char, int> last;\n        int left = 0, best = 0;\n        for (int right = 0; right < (int)s.size(); ++right) {\n            char ch = s[right];\n            if (last.count(ch)) left = max(left, last[ch] + 1);\n            last[ch] = right;\n            best = max(best, right - left + 1);\n        }\n        return best;\n    }\n};"
      }
    ],
    "viz": "sliding-window"
  },
  {
    "id": "longest-repeating-character-replacement",
    "title": "Longest Repeating Character Replacement",
    "number": 424,
    "difficulty": "Medium",
    "category": "Sliding Window",
    "pattern": "Sliding Window",
    "description": "Given an uppercase string `s`, you may replace at most `k` characters with any uppercase letter. Return the longest length obtainable where all characters in a substring are equal.",
    "examples": [
      {
        "input": "s = \"ABAB\", k = 2",
        "output": "4",
        "explanation": "Either all A or all B can be formed."
      },
      {
        "input": "s = \"AABABBA\", k = 1",
        "output": "4",
        "explanation": "A length-4 block can be made uniform."
      },
      {
        "input": "s = \"AAAA\", k = 0",
        "output": "4",
        "explanation": "The whole string already matches."
      }
    ],
    "constraints": [
      "`1 <= s.length <= 10^5`",
      "`s` contains uppercase English letters.",
      "`0 <= k <= s.length`",
      "Only characters inside the chosen substring are changed."
    ],
    "hints": [
      "For a window, keep the most frequent character unchanged.",
      "The needed replacements are `window length - max frequency`.",
      "Shrink the window whenever that number exceeds `k`."
    ],
    "signature": {
      "kind": "function",
      "name": "characterReplacement",
      "params": [
        {
          "name": "s",
          "type": "string"
        },
        {
          "name": "k",
          "type": "int"
        }
      ],
      "returns": "int"
    },
    "tests": [
      {
        "args": [
          "ABAB",
          2
        ],
        "expected": 4
      },
      {
        "args": [
          "AABABBA",
          1
        ],
        "expected": 4
      },
      {
        "args": [
          "AAAA",
          0
        ],
        "expected": 4
      },
      {
        "args": [
          "ABCDE",
          1
        ],
        "expected": 2
      },
      {
        "args": [
          "BAAAB",
          2
        ],
        "expected": 5
      },
      {
        "args": [
          "ABBB",
          2
        ],
        "expected": 4
      },
      {
        "args": [
          "ABCDAAA",
          2
        ],
        "expected": 5
      },
      {
        "args": [
          "AABBBCCCC",
          2
        ],
        "expected": 6
      }
    ],
    "sampleCount": 3,
    "solutions": [
      {
        "title": "Test Every Substring",
        "explanation": "**Intuition.** A substring can be made uniform if all non-majority characters fit within k replacements.\n\n**Steps.**\n1. Choose every start index.\n2. Extend the end while maintaining character counts.\n3. For each substring compute length minus its max frequency.\n4. Update the best valid length.\n\n**Correctness.** For any substring, replacing every character except the most common one is the minimum number of replacements needed. The brute force checks that condition for all substrings.\n\n**Pitfalls.** Use the most frequent character in the current substring, not necessarily s[start].",
        "time": "O(n^2)",
        "space": "O(1)",
        "python": "class Solution:\n    def characterReplacement(self, s: str, k: int) -> int:\n        best = 0\n        for left in range(len(s)):\n            counts = Counter()\n            for right in range(left, len(s)):\n                counts[s[right]] += 1\n                if right - left + 1 - max(counts.values()) <= k:\n                    best = max(best, right - left + 1)\n        return best\n",
        "cpp": "class Solution {\npublic:\n    int characterReplacement(string s, int k) {\n        int best = 0;\n        for (int left = 0; left < (int)s.size(); ++left) {\n            array<int, 26> counts{};\n            for (int right = left; right < (int)s.size(); ++right) {\n                counts[s[right] - 'A']++;\n                int mx = *max_element(counts.begin(), counts.end());\n                if (right - left + 1 - mx <= k) best = max(best, right - left + 1);\n            }\n        }\n        return best;\n    }\n};"
      },
      {
        "title": "Sliding Window with Max Frequency",
        "explanation": "**Intuition.** Keep the largest window whose non-majority count can be replaced.\n\n**Steps.**\n1. Expand right and update counts.\n2. Track the largest frequency ever seen in the window.\n3. If window size minus that frequency exceeds k, shrink left.\n4. Record the largest valid window size.\n\n**Correctness.** A window is valid when all characters except a most frequent character can be replaced. Shrinking whenever it becomes invalid maintains a valid candidate window, and every right endpoint is considered.\n\n**Pitfalls.** The stored max frequency may be stale after shrinking, but it only delays shrinking and never misses the optimal length.",
        "time": "O(n)",
        "space": "O(1)",
        "python": "class Solution:\n    def characterReplacement(self, s: str, k: int) -> int:\n        counts = Counter()\n        left = best = max_count = 0\n        for right, ch in enumerate(s):\n            counts[ch] += 1\n            max_count = max(max_count, counts[ch])\n            while right - left + 1 - max_count > k:\n                counts[s[left]] -= 1\n                left += 1\n            best = max(best, right - left + 1)\n        return best\n",
        "cpp": "class Solution {\npublic:\n    int characterReplacement(string s, int k) {\n        array<int, 26> counts{};\n        int left = 0, best = 0, maxCount = 0;\n        for (int right = 0; right < (int)s.size(); ++right) {\n            maxCount = max(maxCount, ++counts[s[right] - 'A']);\n            while (right - left + 1 - maxCount > k) {\n                counts[s[left] - 'A']--;\n                ++left;\n            }\n            best = max(best, right - left + 1);\n        }\n        return best;\n    }\n};"
      }
    ],
    "viz": "sliding-window"
  },
  {
    "id": "permutation-in-string",
    "title": "Permutation in String",
    "number": 567,
    "difficulty": "Medium",
    "category": "Sliding Window",
    "pattern": "Fixed Window",
    "description": "Return whether some contiguous substring of `s2` is a permutation of `s1`. The substring must have the same length and character counts as `s1`.",
    "examples": [
      {
        "input": "s1 = \"ab\", s2 = \"eidbaooo\"",
        "output": "true",
        "explanation": "The substring \"ba\" is a permutation."
      },
      {
        "input": "s1 = \"ab\", s2 = \"eidboaoo\"",
        "output": "false",
        "explanation": "No length-2 window has both a and b."
      },
      {
        "input": "s1 = \"adc\", s2 = \"dcda\"",
        "output": "true",
        "explanation": "The substring \"cda\" matches."
      }
    ],
    "constraints": [
      "`1 <= s1.length, s2.length <= 10^4`",
      "`s1` and `s2` contain lowercase English letters.",
      "A permutation preserves counts, not order.",
      "Return a boolean."
    ],
    "hints": [
      "Only windows of length `len(s1)` can work.",
      "Compare frequency counts instead of sorting every window.",
      "Slide one character in and one character out while maintaining counts."
    ],
    "signature": {
      "kind": "function",
      "name": "checkInclusion",
      "params": [
        {
          "name": "s1",
          "type": "string"
        },
        {
          "name": "s2",
          "type": "string"
        }
      ],
      "returns": "bool"
    },
    "tests": [
      {
        "args": [
          "ab",
          "eidbaooo"
        ],
        "expected": true
      },
      {
        "args": [
          "ab",
          "eidboaoo"
        ],
        "expected": false
      },
      {
        "args": [
          "adc",
          "dcda"
        ],
        "expected": true
      },
      {
        "args": [
          "a",
          "a"
        ],
        "expected": true
      },
      {
        "args": [
          "hello",
          "ooolleoooleh"
        ],
        "expected": false
      },
      {
        "args": [
          "abc",
          "bbbca"
        ],
        "expected": true
      },
      {
        "args": [
          "abc",
          "defgh"
        ],
        "expected": false
      },
      {
        "args": [
          "xyz",
          "afdgzyxksldfm"
        ],
        "expected": true
      }
    ],
    "sampleCount": 3,
    "solutions": [
      {
        "title": "Sort Every Window",
        "explanation": "**Intuition.** A window is a permutation of s1 if sorting both strings gives the same sequence.\n\n**Steps.**\n1. Sort s1 once.\n2. For each window of length len(s1) in s2, sort the window.\n3. Return true when the sorted window matches.\n4. Return false if no window matches.\n\n**Correctness.** All permutations have identical sorted order, and every possible fixed-length substring of s2 is checked.\n\n**Pitfalls.** Only windows with exactly len(s1) characters can match.",
        "time": "O(m n log n)",
        "space": "O(n)",
        "python": "class Solution:\n    def checkInclusion(self, s1: str, s2: str) -> bool:\n        n = len(s1)\n        target = sorted(s1)\n        for i in range(len(s2) - n + 1):\n            if sorted(s2[i:i + n]) == target:\n                return True\n        return False\n",
        "cpp": "class Solution {\npublic:\n    bool checkInclusion(string s1, string s2) {\n        int n = s1.size();\n        sort(s1.begin(), s1.end());\n        for (int i = 0; i + n <= (int)s2.size(); ++i) {\n            string w = s2.substr(i, n);\n            sort(w.begin(), w.end());\n            if (w == s1) return true;\n        }\n        return false;\n    }\n};"
      },
      {
        "title": "Fixed-Size Frequency Window",
        "explanation": "**Intuition.** Compare character counts while sliding a window of the same length as s1.\n\n**Steps.**\n1. Count letters in s1.\n2. Add each s2 character to a window count.\n3. Remove characters once the window is too long.\n4. When the window length matches, compare the count arrays.\n\n**Correctness.** The window count always represents the current length-n substring. Equal counts mean the substring contains exactly the same multiset of letters as s1, i.e. a permutation.\n\n**Pitfalls.** Shrink only after adding so every length-n window is considered once.",
        "time": "O(m)",
        "space": "O(1)",
        "python": "class Solution:\n    def checkInclusion(self, s1: str, s2: str) -> bool:\n        n = len(s1)\n        if n > len(s2):\n            return False\n        need = [0] * 26\n        have = [0] * 26\n        for ch in s1:\n            need[ord(ch) - ord('a')] += 1\n        for i, ch in enumerate(s2):\n            have[ord(ch) - ord('a')] += 1\n            if i >= n:\n                have[ord(s2[i - n]) - ord('a')] -= 1\n            if have == need:\n                return True\n        return False\n",
        "cpp": "class Solution {\npublic:\n    bool checkInclusion(string s1, string s2) {\n        int n = s1.size();\n        if (n > (int)s2.size()) return false;\n        array<int, 26> need{}, have{};\n        for (char c : s1) need[c - 'a']++;\n        for (int i = 0; i < (int)s2.size(); ++i) {\n            have[s2[i] - 'a']++;\n            if (i >= n) have[s2[i - n] - 'a']--;\n            if (have == need) return true;\n        }\n        return false;\n    }\n};"
      }
    ],
    "viz": "sliding-window"
  },
  {
    "id": "minimum-window-substring",
    "title": "Minimum Window Substring",
    "number": 76,
    "difficulty": "Hard",
    "category": "Sliding Window",
    "pattern": "Sliding Window",
    "description": "Find the shortest substring of `s` that contains every character of `t` with at least the required multiplicity. Return an empty string when no such window exists.",
    "examples": [
      {
        "input": "s = \"ADOBECODEBANC\", t = \"ABC\"",
        "output": "\"BANC\"",
        "explanation": "\"BANC\" is the shortest covering window."
      },
      {
        "input": "s = \"a\", t = \"a\"",
        "output": "\"a\"",
        "explanation": "The whole string is required."
      },
      {
        "input": "s = \"a\", t = \"aa\"",
        "output": "\"\"",
        "explanation": "There are not enough a characters."
      }
    ],
    "constraints": [
      "`1 <= s.length, t.length <= 10^5`",
      "`s` and `t` contain English letters.",
      "Character multiplicity matters.",
      "If multiple shortest windows exist, any one is acceptable."
    ],
    "hints": [
      "You need counts, not just membership.",
      "Expand right until the window covers all requirements.",
      "Then move left while coverage remains to minimize that window."
    ],
    "signature": {
      "kind": "function",
      "name": "minWindow",
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
      "returns": "string"
    },
    "tests": [
      {
        "args": [
          "ADOBECODEBANC",
          "ABC"
        ],
        "expected": [
          "BANC"
        ]
      },
      {
        "args": [
          "a",
          "a"
        ],
        "expected": [
          "a"
        ]
      },
      {
        "args": [
          "a",
          "aa"
        ],
        "expected": [
          ""
        ]
      },
      {
        "args": [
          "ab",
          "b"
        ],
        "expected": [
          "b"
        ]
      },
      {
        "args": [
          "bba",
          "ab"
        ],
        "expected": [
          "ba"
        ]
      },
      {
        "args": [
          "aaabdabcefaecbef",
          "abc"
        ],
        "expected": [
          "abc"
        ]
      },
      {
        "args": [
          "abc",
          "cba"
        ],
        "expected": [
          "abc"
        ]
      },
      {
        "args": [
          "thisisateststring",
          "tist"
        ],
        "expected": [
          "tstri"
        ]
      }
    ],
    "sampleCount": 3,
    "compare": "anyOf",
    "solutions": [
      {
        "title": "Enumerate Substrings",
        "explanation": "**Intuition.** Try every substring and keep the shortest one that contains all required characters.\n\n**Steps.**\n1. Count required characters from t.\n2. For each start, extend the end.\n3. Check whether the current substring covers the required counts.\n4. Track the shortest covering substring.\n\n**Correctness.** Every candidate substring is considered. The coverage test is exact, so the shortest recorded covering substring is a correct minimum.\n\n**Pitfalls.** Multiplicity matters: needing two A characters is different from needing one.",
        "time": "O(n^2 * alphabet)",
        "space": "O(alphabet)",
        "python": "class Solution:\n    def minWindow(self, s: str, t: str) -> str:\n        need = Counter(t)\n        best = None\n        for left in range(len(s)):\n            have = Counter()\n            for right in range(left, len(s)):\n                have[s[right]] += 1\n                if all(have[c] >= need[c] for c in need):\n                    cand = s[left:right + 1]\n                    if best is None or len(cand) < len(best):\n                        best = cand\n                    break\n        return best or ''\n",
        "cpp": "class Solution {\npublic:\n    string minWindow(string s, string t) {\n        unordered_map<char, int> need;\n        for (char c : t) need[c]++;\n        string best = \"\";\n        for (int left = 0; left < (int)s.size(); ++left) {\n            unordered_map<char, int> have;\n            for (int right = left; right < (int)s.size(); ++right) {\n                have[s[right]]++;\n                bool ok = true;\n                for (auto& kv : need) if (have[kv.first] < kv.second) { ok = false; break; }\n                if (ok) {\n                    string cand = s.substr(left, right - left + 1);\n                    if (best.empty() || cand.size() < best.size()) best = cand;\n                    break;\n                }\n            }\n        }\n        return best;\n    }\n};"
      },
      {
        "title": "Contracting Sliding Window",
        "explanation": "**Intuition.** Expand until the window covers t, then contract from the left to make it minimal for that right edge.\n\n**Steps.**\n1. Count required characters and the number of distinct requirements.\n2. Move right, updating window counts and formed requirements.\n3. While all requirements are formed, update the best answer and move left.\n4. Return the best window found.\n\n**Correctness.** When formed equals required, the current window covers t. The inner loop removes unnecessary left characters until coverage would break, so every minimal window ending at each right edge is considered.\n\n**Pitfalls.** Track satisfied distinct characters, not total matched characters, to handle duplicates in t correctly.",
        "time": "O(n + m)",
        "space": "O(alphabet)",
        "python": "class Solution:\n    def minWindow(self, s: str, t: str) -> str:\n        need = Counter(t)\n        have = Counter()\n        required = len(need)\n        formed = 0\n        left = 0\n        best = (float('inf'), 0, 0)\n        for right, ch in enumerate(s):\n            have[ch] += 1\n            if ch in need and have[ch] == need[ch]:\n                formed += 1\n            while formed == required:\n                if right - left + 1 < best[0]:\n                    best = (right - left + 1, left, right + 1)\n                old = s[left]\n                have[old] -= 1\n                if old in need and have[old] < need[old]:\n                    formed -= 1\n                left += 1\n        return '' if best[0] == float('inf') else s[best[1]:best[2]]\n",
        "cpp": "class Solution {\npublic:\n    string minWindow(string s, string t) {\n        unordered_map<char, int> need, have;\n        for (char c : t) need[c]++;\n        int required = need.size(), formed = 0, left = 0;\n        int bestLen = INT_MAX, bestLeft = 0;\n        for (int right = 0; right < (int)s.size(); ++right) {\n            char ch = s[right];\n            have[ch]++;\n            if (need.count(ch) && have[ch] == need[ch]) formed++;\n            while (formed == required) {\n                if (right - left + 1 < bestLen) {\n                    bestLen = right - left + 1;\n                    bestLeft = left;\n                }\n                char old = s[left++];\n                have[old]--;\n                if (need.count(old) && have[old] < need[old]) formed--;\n            }\n        }\n        return bestLen == INT_MAX ? \"\" : s.substr(bestLeft, bestLen);\n    }\n};"
      }
    ],
    "viz": "sliding-window"
  },
  {
    "id": "sliding-window-maximum",
    "title": "Sliding Window Maximum",
    "number": 239,
    "difficulty": "Hard",
    "category": "Sliding Window",
    "pattern": "Monotonic Deque",
    "description": "Move a window of size `k` from left to right across `nums`. Return the maximum value visible in each window position.",
    "examples": [
      {
        "input": "nums = [1,3,-1,-3,5,3,6,7], k = 3",
        "output": "[3, 3, 5, 5, 6, 7]",
        "explanation": "Each output is the max of one length-3 window."
      },
      {
        "input": "nums = [1], k = 1",
        "output": "[1]",
        "explanation": "There is one window."
      },
      {
        "input": "nums = [9,11], k = 2",
        "output": "[11]",
        "explanation": "The only window has maximum 11."
      }
    ],
    "constraints": [
      "`1 <= nums.length <= 10^5`",
      "`1 <= k <= nums.length`",
      "`-10^4 <= nums[i] <= 10^4`",
      "Return `nums.length - k + 1` values."
    ],
    "hints": [
      "A max heap works but needs lazy deletion.",
      "A deque can store only values that could become future maxima.",
      "Remove smaller values from the back and expired indices from the front."
    ],
    "signature": {
      "kind": "function",
      "name": "maxSlidingWindow",
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
            3,
            -1,
            -3,
            5,
            3,
            6,
            7
          ],
          3
        ],
        "expected": [
          3,
          3,
          5,
          5,
          6,
          7
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
            9,
            11
          ],
          2
        ],
        "expected": [
          11
        ]
      },
      {
        "args": [
          [
            4,
            -2
          ],
          1
        ],
        "expected": [
          4,
          -2
        ]
      },
      {
        "args": [
          [
            7,
            2,
            4
          ],
          2
        ],
        "expected": [
          7,
          4
        ]
      },
      {
        "args": [
          [
            1,
            -1
          ],
          1
        ],
        "expected": [
          1,
          -1
        ]
      },
      {
        "args": [
          [
            1,
            3,
            1,
            2,
            0,
            5
          ],
          3
        ],
        "expected": [
          3,
          3,
          2,
          5
        ]
      },
      {
        "args": [
          [
            -7,
            -8,
            7,
            5,
            7,
            1,
            6,
            0
          ],
          4
        ],
        "expected": [
          7,
          7,
          7,
          7,
          7
        ]
      }
    ],
    "sampleCount": 3,
    "solutions": [
      {
        "title": "Take Max of Each Window",
        "explanation": "**Intuition.** The most direct approach computes the maximum independently for every window.\n\n**Steps.**\n1. For each starting index of a length-k window, scan its k values.\n2. Append the maximum.\n3. Continue until all windows are processed.\n\n**Correctness.** Each output position corresponds to exactly one window, and scanning that window finds its true maximum.\n\n**Pitfalls.** There are n - k + 1 windows; include the final start index n - k.",
        "time": "O(n k)",
        "space": "O(1) extra besides output",
        "python": "class Solution:\n    def maxSlidingWindow(self, nums: List[int], k: int) -> List[int]:\n        return [max(nums[i:i + k]) for i in range(len(nums) - k + 1)]\n",
        "cpp": "class Solution {\npublic:\n    vector<int> maxSlidingWindow(vector<int>& nums, int k) {\n        vector<int> ans;\n        for (int i = 0; i + k <= (int)nums.size(); ++i) {\n            int mx = nums[i];\n            for (int j = i; j < i + k; ++j) mx = max(mx, nums[j]);\n            ans.push_back(mx);\n        }\n        return ans;\n    }\n};"
      },
      {
        "title": "Monotonic Deque",
        "explanation": "**Intuition.** Keep candidate indices in decreasing value order; the front is always the window maximum.\n\n**Steps.**\n1. Remove indices that fall out of the current window.\n2. Pop from the back while the new value is greater or equal.\n3. Push the new index.\n4. Once the first window is complete, append nums[deque front].\n\n**Correctness.** The deque stores only indices that could still become maxima, ordered by decreasing value. Out-of-window indices are removed, so the front is the largest valid value for each window.\n\n**Pitfalls.** Store indices rather than values so you can tell when an element leaves the window.",
        "time": "O(n)",
        "space": "O(k)",
        "python": "class Solution:\n    def maxSlidingWindow(self, nums: List[int], k: int) -> List[int]:\n        q = deque()\n        ans = []\n        for i, x in enumerate(nums):\n            while q and q[0] <= i - k:\n                q.popleft()\n            while q and nums[q[-1]] <= x:\n                q.pop()\n            q.append(i)\n            if i >= k - 1:\n                ans.append(nums[q[0]])\n        return ans\n",
        "cpp": "class Solution {\npublic:\n    vector<int> maxSlidingWindow(vector<int>& nums, int k) {\n        deque<int> dq;\n        vector<int> ans;\n        for (int i = 0; i < (int)nums.size(); ++i) {\n            while (!dq.empty() && dq.front() <= i - k) dq.pop_front();\n            while (!dq.empty() && nums[dq.back()] <= nums[i]) dq.pop_back();\n            dq.push_back(i);\n            if (i >= k - 1) ans.push_back(nums[dq.front()]);\n        }\n        return ans;\n    }\n};"
      }
    ],
    "viz": "sliding-window"
  }
]

export default problems
