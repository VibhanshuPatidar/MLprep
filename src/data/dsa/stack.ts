import type { DsaProblem } from '../../types/content'

const problems: DsaProblem[] = [
  {
    "id": "valid-parentheses",
    "title": "Valid Parentheses",
    "number": 20,
    "difficulty": "Easy",
    "category": "Stack",
    "pattern": "Stack",
    "description": "Given a string containing only bracket characters, determine whether every opening bracket is closed by the same type of bracket in the correct order.",
    "examples": [
      {
        "input": "s = \"()\"",
        "output": "true",
        "explanation": "The pair matches."
      },
      {
        "input": "s = \"()[]{}\"",
        "output": "true",
        "explanation": "All three pair types are correctly ordered."
      },
      {
        "input": "s = \"(]\"",
        "output": "false",
        "explanation": "The closing bracket has the wrong type."
      }
    ],
    "constraints": [
      "`0 <= s.length <= 10^4`",
      "`s` contains only `()[]{}` characters.",
      "Every closer must match the most recent unmatched opener.",
      "All openers must be closed by the end."
    ],
    "hints": [
      "Nested structures care about the most recent unmatched opening bracket.",
      "A stack gives access to that most recent opener.",
      "Push openers; for closers, pop and verify the type."
    ],
    "signature": {
      "kind": "function",
      "name": "isValid",
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
          "()"
        ],
        "expected": true
      },
      {
        "args": [
          "()[]{}"
        ],
        "expected": true
      },
      {
        "args": [
          "(]"
        ],
        "expected": false
      },
      {
        "args": [
          "([])"
        ],
        "expected": true
      },
      {
        "args": [
          "([)]"
        ],
        "expected": false
      },
      {
        "args": [
          "{[]}"
        ],
        "expected": true
      },
      {
        "args": [
          ""
        ],
        "expected": true
      },
      {
        "args": [
          "((((("
        ],
        "expected": false
      }
    ],
    "sampleCount": 3,
    "solutions": [
      {
        "title": "Repeated Pair Removal",
        "explanation": "**Intuition.** Valid bracket strings contain adjacent matching pairs after inner pairs have been removed.\n\n**Steps.**\n1. Repeatedly remove occurrences of (), [], and {}.\n2. Stop when a full pass makes no change.\n3. Return true if nothing remains.\n\n**Correctness.** Removing a matching adjacent pair preserves validity of the surrounding string. Any valid nested expression eventually exposes all pairs as adjacent, leaving empty text.\n\n**Pitfalls.** This is easy to reason about but inefficient because strings are rebuilt many times.",
        "time": "O(n^2)",
        "space": "O(n)",
        "python": "class Solution:\n    def isValid(self, s: str) -> bool:\n        prev = None\n        while prev != s:\n            prev = s\n            s = s.replace('()', '').replace('[]', '').replace('{}', '')\n        return s == ''\n",
        "cpp": "class Solution {\npublic:\n    bool isValid(string s) {\n        string prev;\n        do {\n            prev = s;\n            for (string p : {\"()\", \"[]\", \"{}\"}) {\n                size_t pos;\n                while ((pos = s.find(p)) != string::npos) s.erase(pos, 2);\n            }\n        } while (prev != s);\n        return s.empty();\n    }\n};"
      },
      {
        "title": "Opening Bracket Stack",
        "explanation": "**Intuition.** The most recent unmatched opening bracket must match the next closing bracket.\n\n**Steps.**\n1. Push opening brackets on a stack.\n2. On a closing bracket, require the stack top to be its matching opener.\n3. Pop on a match.\n4. At the end, the stack must be empty.\n\n**Correctness.** The stack stores unmatched openers in nesting order. Matching and popping enforces proper closing order; any mismatch or leftover opener means invalid syntax.\n\n**Pitfalls.** Always check that the stack is non-empty before reading its top.",
        "time": "O(n)",
        "space": "O(n)",
        "python": "class Solution:\n    def isValid(self, s: str) -> bool:\n        pairs = {')': '(', ']': '[', '}': '{'}\n        st = []\n        for ch in s:\n            if ch in pairs.values():\n                st.append(ch)\n            elif not st or st.pop() != pairs[ch]:\n                return False\n        return not st\n",
        "cpp": "class Solution {\npublic:\n    bool isValid(string s) {\n        unordered_map<char, char> pairs = {{')', '('}, {']', '['}, {'}', '{'}};\n        vector<char> st;\n        for (char ch : s) {\n            if (ch == '(' || ch == '[' || ch == '{') st.push_back(ch);\n            else {\n                if (st.empty() || st.back() != pairs[ch]) return false;\n                st.pop_back();\n            }\n        }\n        return st.empty();\n    }\n};"
      }
    ]
  },
  {
    "id": "min-stack",
    "title": "Min Stack",
    "number": 155,
    "difficulty": "Medium",
    "category": "Stack",
    "pattern": "Auxiliary Stack",
    "description": "Implement a stack that supports `push`, `pop`, `top`, and `getMin`. `getMin` must return the minimum value currently stored in the stack.",
    "examples": [
      {
        "input": "ops = [\"MinStack\",\"push\",\"push\",\"push\",\"getMin\",\"pop\",\"top\",\"getMin\"], args = [[],[-2],[0],[-3],[],[],[],[]]",
        "output": "[null, null, null, null, -3, null, 0, -2]",
        "explanation": "The minimum changes after popping -3."
      },
      {
        "input": "ops = [\"MinStack\",\"push\",\"top\",\"getMin\"], args = [[],[1],[],[]]",
        "output": "[null, null, 1, 1]",
        "explanation": "A single value is both top and minimum."
      },
      {
        "input": "ops = [\"MinStack\",\"push\",\"push\",\"getMin\",\"pop\",\"getMin\"], args = [[],[2],[0],[],[],[]]",
        "output": "[null, null, null, 0, null, 2]",
        "explanation": "After popping 0, the minimum returns to 2."
      }
    ],
    "constraints": [
      "`-2^31 <= val <= 2^31 - 1`",
      "`pop`, `top`, and `getMin` are called only when the stack is non-empty.",
      "Up to `3 * 10^4` operations may be performed.",
      "The optimal design supports every operation in O(1) time."
    ],
    "hints": [
      "A normal stack loses track of the previous minimum after popping the current minimum.",
      "Store historical minimums alongside values.",
      "Push the current minimum at every depth so popping restores the previous depth's minimum."
    ],
    "signature": {
      "kind": "class",
      "className": "MinStack",
      "ctorParams": [],
      "methods": [
        {
          "name": "push",
          "params": [
            {
              "name": "val",
              "type": "int"
            }
          ],
          "returns": "void"
        },
        {
          "name": "pop",
          "params": [],
          "returns": "void"
        },
        {
          "name": "top",
          "params": [],
          "returns": "int"
        },
        {
          "name": "getMin",
          "params": [],
          "returns": "int"
        }
      ]
    },
    "tests": [
      {
        "ops": [
          "MinStack",
          "push",
          "push",
          "push",
          "getMin",
          "pop",
          "top",
          "getMin"
        ],
        "args": [
          [],
          [
            -2
          ],
          [
            0
          ],
          [
            -3
          ],
          [],
          [],
          [],
          []
        ],
        "expected": [
          null,
          null,
          null,
          null,
          -3,
          null,
          0,
          -2
        ]
      },
      {
        "ops": [
          "MinStack",
          "push",
          "top",
          "getMin"
        ],
        "args": [
          [],
          [
            1
          ],
          [],
          []
        ],
        "expected": [
          null,
          null,
          1,
          1
        ]
      },
      {
        "ops": [
          "MinStack",
          "push",
          "push",
          "getMin",
          "pop",
          "getMin"
        ],
        "args": [
          [],
          [
            2
          ],
          [
            0
          ],
          [],
          [],
          []
        ],
        "expected": [
          null,
          null,
          null,
          0,
          null,
          2
        ]
      },
      {
        "ops": [
          "MinStack",
          "push",
          "push",
          "push",
          "getMin",
          "pop",
          "getMin",
          "pop",
          "getMin"
        ],
        "args": [
          [],
          [
            5
          ],
          [
            3
          ],
          [
            7
          ],
          [],
          [],
          [],
          [],
          []
        ],
        "expected": [
          null,
          null,
          null,
          null,
          3,
          null,
          3,
          null,
          5
        ]
      },
      {
        "ops": [
          "MinStack",
          "push",
          "push",
          "push",
          "top",
          "getMin"
        ],
        "args": [
          [],
          [
            2
          ],
          [
            2
          ],
          [
            1
          ],
          [],
          []
        ],
        "expected": [
          null,
          null,
          null,
          null,
          1,
          1
        ]
      },
      {
        "ops": [
          "MinStack",
          "push",
          "push",
          "pop",
          "top",
          "getMin"
        ],
        "args": [
          [],
          [
            -1
          ],
          [
            -2
          ],
          [],
          [],
          []
        ],
        "expected": [
          null,
          null,
          null,
          null,
          -1,
          -1
        ]
      },
      {
        "ops": [
          "MinStack",
          "push",
          "push",
          "push",
          "pop",
          "pop",
          "top",
          "getMin"
        ],
        "args": [
          [],
          [
            10
          ],
          [
            20
          ],
          [
            5
          ],
          [],
          [],
          [],
          []
        ],
        "expected": [
          null,
          null,
          null,
          null,
          null,
          null,
          10,
          10
        ]
      },
      {
        "ops": [
          "MinStack",
          "push",
          "push",
          "push",
          "getMin",
          "pop",
          "getMin",
          "pop",
          "getMin"
        ],
        "args": [
          [],
          [
            0
          ],
          [
            -1
          ],
          [
            -1
          ],
          [],
          [],
          [],
          [],
          []
        ],
        "expected": [
          null,
          null,
          null,
          null,
          -1,
          null,
          -1,
          null,
          0
        ]
      }
    ],
    "sampleCount": 3,
    "solutions": [
      {
        "title": "Single Stack, Scan for Minimum",
        "explanation": "**Intuition.** Store all values normally and compute the minimum only when getMin is asked.\n\n**Steps.**\n1. push appends to the stack.\n2. pop removes the last value.\n3. top returns the last value.\n4. getMin scans all stored values and returns the smallest.\n\n**Correctness.** The stack vector always equals the abstract stack contents, so push/pop/top are direct. Scanning all contents computes the exact minimum among current elements.\n\n**Pitfalls.** This is simple but getMin is linear, which is why interviews expect a better design.",
        "time": "push/pop/top O(1), getMin O(n)",
        "space": "O(n)",
        "python": "class MinStack:\n    def __init__(self):\n        self.st = []\n\n    def push(self, val: int) -> None:\n        self.st.append(val)\n\n    def pop(self) -> None:\n        self.st.pop()\n\n    def top(self) -> int:\n        return self.st[-1]\n\n    def getMin(self) -> int:\n        return min(self.st)\n",
        "cpp": "class MinStack {\n    vector<int> st;\npublic:\n    MinStack() {}\n    void push(int val) { st.push_back(val); }\n    void pop() { st.pop_back(); }\n    int top() { return st.back(); }\n    int getMin() { return *min_element(st.begin(), st.end()); }\n};"
      },
      {
        "title": "Value Stack plus Minimum Stack",
        "explanation": "**Intuition.** Keep a second stack whose top is always the minimum of all values currently in the main stack.\n\n**Steps.**\n1. Push values to the main stack.\n2. Also push min(val, currentMin) to the min stack.\n3. Pop from both stacks together.\n4. top reads the value stack; getMin reads the min stack.\n\n**Correctness.** At each depth, mins[depth] stores the minimum over values[0..depth]. Pushing updates that prefix minimum and popping removes both matching depths, so getMin is always correct.\n\n**Pitfalls.** The min stack must duplicate the previous minimum on every push, not only when a new minimum appears, unless you also store counts.",
        "time": "O(1) for every operation",
        "space": "O(n)",
        "python": "class MinStack:\n    def __init__(self):\n        self.st = []\n        self.mins = []\n\n    def push(self, val: int) -> None:\n        self.st.append(val)\n        self.mins.append(val if not self.mins else min(val, self.mins[-1]))\n\n    def pop(self) -> None:\n        self.st.pop()\n        self.mins.pop()\n\n    def top(self) -> int:\n        return self.st[-1]\n\n    def getMin(self) -> int:\n        return self.mins[-1]\n",
        "cpp": "class MinStack {\n    vector<int> st, mins;\npublic:\n    MinStack() {}\n    void push(int val) {\n        st.push_back(val);\n        mins.push_back(mins.empty() ? val : min(val, mins.back()));\n    }\n    void pop() { st.pop_back(); mins.pop_back(); }\n    int top() { return st.back(); }\n    int getMin() { return mins.back(); }\n};"
      }
    ]
  },
  {
    "id": "evaluate-reverse-polish-notation",
    "title": "Evaluate Reverse Polish Notation",
    "number": 150,
    "difficulty": "Medium",
    "category": "Stack",
    "pattern": "Stack",
    "description": "Evaluate an arithmetic expression written in reverse Polish notation. Operators apply to the two most recent values, and integer division truncates toward zero.",
    "examples": [
      {
        "input": "tokens = [\"2\",\"1\",\"+\",\"3\",\"*\"]",
        "output": "9",
        "explanation": "The expression is `(2 + 1) * 3`."
      },
      {
        "input": "tokens = [\"4\",\"13\",\"5\",\"/\",\"+\"]",
        "output": "6",
        "explanation": "13 / 5 truncates to 2, then 4 is added."
      },
      {
        "input": "tokens = [\"10\",\"6\",\"9\",\"3\",\"+\",\"-11\",\"*\",\"/\",\"*\",\"17\",\"+\",\"5\",\"+\"]",
        "output": "22",
        "explanation": "A longer expression still follows stack evaluation."
      }
    ],
    "constraints": [
      "`1 <= tokens.length <= 10^4`",
      "Tokens are integers or one of `+`, `-`, `*`, `/`.",
      "Division by zero does not occur.",
      "Intermediate and final results fit in 32-bit signed integers."
    ],
    "hints": [
      "Postfix notation places each operator after its operands.",
      "A stack can hold values whose operators have not been seen yet.",
      "When an operator appears, pop right operand first, then left operand."
    ],
    "signature": {
      "kind": "function",
      "name": "evalRPN",
      "params": [
        {
          "name": "tokens",
          "type": "string[]"
        }
      ],
      "returns": "int"
    },
    "tests": [
      {
        "args": [
          [
            "2",
            "1",
            "+",
            "3",
            "*"
          ]
        ],
        "expected": 9
      },
      {
        "args": [
          [
            "4",
            "13",
            "5",
            "/",
            "+"
          ]
        ],
        "expected": 6
      },
      {
        "args": [
          [
            "10",
            "6",
            "9",
            "3",
            "+",
            "-11",
            "*",
            "/",
            "*",
            "17",
            "+",
            "5",
            "+"
          ]
        ],
        "expected": 22
      },
      {
        "args": [
          [
            "3",
            "-4",
            "+"
          ]
        ],
        "expected": -1
      },
      {
        "args": [
          [
            "18",
            "3",
            "/"
          ]
        ],
        "expected": 6
      },
      {
        "args": [
          [
            "7",
            "3",
            "/"
          ]
        ],
        "expected": 2
      },
      {
        "args": [
          [
            "7",
            "-3",
            "/"
          ]
        ],
        "expected": -2
      },
      {
        "args": [
          [
            "5",
            "1",
            "2",
            "+",
            "4",
            "*",
            "+",
            "3",
            "-"
          ]
        ],
        "expected": 14
      }
    ],
    "sampleCount": 3,
    "solutions": [
      {
        "title": "Recursive Reverse Scan",
        "explanation": "**Intuition.** In postfix notation, the final token is the root operator or value of the whole expression.\n\n**Steps.**\n1. Read tokens from right to left.\n2. If the token is a number, return it.\n3. If it is an operator, recursively evaluate the right operand then the left operand.\n4. Apply the operator.\n\n**Correctness.** Postfix order places each operator after its operands, so scanning backward sees an operator before the complete subexpressions it combines. Recursion consumes exactly those subexpressions.\n\n**Pitfalls.** For subtraction and division, preserve operand order: left op right.",
        "time": "O(n)",
        "space": "O(n)",
        "python": "class Solution:\n    def evalRPN(self, tokens: List[str]) -> int:\n        i = len(tokens) - 1\n        def div(a, b):\n            q = abs(a) // abs(b)\n            return q if (a >= 0) == (b >= 0) else -q\n        def parse():\n            nonlocal i\n            tok = tokens[i]\n            i -= 1\n            if tok not in '+-*/':\n                return int(tok)\n            right = parse()\n            left = parse()\n            if tok == '+':\n                return left + right\n            if tok == '-':\n                return left - right\n            if tok == '*':\n                return left * right\n            return div(left, right)\n        return parse()\n",
        "cpp": "class Solution {\n    int i;\n    int divide(int a, int b) {\n        int q = abs(a) / abs(b);\n        return ((a >= 0) == (b >= 0)) ? q : -q;\n    }\n    int parse(vector<string>& tokens) {\n        string tok = tokens[i--];\n        if (tok != \"+\" && tok != \"-\" && tok != \"*\" && tok != \"/\") return stoi(tok);\n        int right = parse(tokens);\n        int left = parse(tokens);\n        if (tok == \"+\") return left + right;\n        if (tok == \"-\") return left - right;\n        if (tok == \"*\") return left * right;\n        return divide(left, right);\n    }\npublic:\n    int evalRPN(vector<string>& tokens) {\n        i = tokens.size() - 1;\n        return parse(tokens);\n    }\n};"
      },
      {
        "title": "Operand Stack",
        "explanation": "**Intuition.** A stack holds expression values until an operator combines the two most recent ones.\n\n**Steps.**\n1. Push numeric tokens as integers.\n2. For an operator, pop right then left.\n3. Apply the operator and push the result.\n4. The final stack value is the expression result.\n\n**Correctness.** Postfix notation guarantees each operator appears after its operands. Thus the top two stack values at an operator are exactly its operands, and replacing them with the result preserves the expression value.\n\n**Pitfalls.** Division must truncate toward zero, not floor toward negative infinity.",
        "time": "O(n)",
        "space": "O(n)",
        "python": "class Solution:\n    def evalRPN(self, tokens: List[str]) -> int:\n        st = []\n        def div(a, b):\n            q = abs(a) // abs(b)\n            return q if (a >= 0) == (b >= 0) else -q\n        for tok in tokens:\n            if tok not in '+-*/':\n                st.append(int(tok))\n                continue\n            b = st.pop(); a = st.pop()\n            if tok == '+': st.append(a + b)\n            elif tok == '-': st.append(a - b)\n            elif tok == '*': st.append(a * b)\n            else: st.append(div(a, b))\n        return st[-1]\n",
        "cpp": "class Solution {\npublic:\n    int evalRPN(vector<string>& tokens) {\n        vector<int> st;\n        for (string& tok : tokens) {\n            if (tok != \"+\" && tok != \"-\" && tok != \"*\" && tok != \"/\") {\n                st.push_back(stoi(tok));\n                continue;\n            }\n            int b = st.back(); st.pop_back();\n            int a = st.back(); st.pop_back();\n            if (tok == \"+\") st.push_back(a + b);\n            else if (tok == \"-\") st.push_back(a - b);\n            else if (tok == \"*\") st.push_back(a * b);\n            else st.push_back(a / b);\n        }\n        return st.back();\n    }\n};"
      }
    ]
  },
  {
    "id": "generate-parentheses",
    "title": "Generate Parentheses",
    "number": 22,
    "difficulty": "Medium",
    "category": "Stack",
    "pattern": "Backtracking",
    "description": "Generate every well-formed string containing `n` pairs of parentheses. The answer may be returned in any order.",
    "examples": [
      {
        "input": "n = 1",
        "output": "[\"()\"]",
        "explanation": "Only one pair can be arranged one way."
      },
      {
        "input": "n = 2",
        "output": "[\"(())\", \"()()\"]",
        "explanation": "Two valid arrangements exist."
      },
      {
        "input": "n = 3",
        "output": "[\"((()))\", \"(()())\", \"(())()\", \"()(())\", \"()()()\"]",
        "explanation": "There are five valid arrangements."
      }
    ],
    "constraints": [
      "`1 <= n <= 8`",
      "Use exactly `n` opening and `n` closing parentheses.",
      "Every prefix must have at least as many opens as closes.",
      "Return all valid strings without duplicates."
    ],
    "hints": [
      "A valid prefix never has more `)` than `(`.",
      "Track how many opens and closes have been placed.",
      "Add `(` if opens remain; add `)` only when it would not exceed opens."
    ],
    "signature": {
      "kind": "function",
      "name": "generateParenthesis",
      "params": [
        {
          "name": "n",
          "type": "int"
        }
      ],
      "returns": "string[]"
    },
    "tests": [
      {
        "args": [
          1
        ],
        "expected": [
          "()"
        ]
      },
      {
        "args": [
          2
        ],
        "expected": [
          "(())",
          "()()"
        ]
      },
      {
        "args": [
          3
        ],
        "expected": [
          "((()))",
          "(()())",
          "(())()",
          "()(())",
          "()()()"
        ]
      },
      {
        "args": [
          4
        ],
        "expected": [
          "(((())))",
          "((()()))",
          "((())())",
          "((()))()",
          "(()(()))",
          "(()()())",
          "(()())()",
          "(())(())",
          "(())()()",
          "()((()))",
          "()(()())",
          "()(())()",
          "()()(())",
          "()()()()"
        ]
      },
      {
        "args": [
          5
        ],
        "expected": [
          "((((()))))",
          "(((()())))",
          "(((())()))",
          "(((()))())",
          "(((())))()",
          "((()(())))",
          "((()()()))",
          "((()())())",
          "((()()))()",
          "((())(()))",
          "((())()())",
          "((())())()",
          "((()))(())",
          "((()))()()",
          "(()((())))",
          "(()(()()))",
          "(()(())())",
          "(()(()))()",
          "(()()(()))",
          "(()()()())",
          "(()()())()",
          "(()())(())",
          "(()())()()",
          "(())((()))",
          "(())(()())",
          "(())(())()",
          "(())()(())",
          "(())()()()",
          "()(((())))",
          "()((()()))",
          "()((())())",
          "()((()))()",
          "()(()(()))",
          "()(()()())",
          "()(()())()",
          "()(())(())",
          "()(())()()",
          "()()((()))",
          "()()(()())",
          "()()(())()",
          "()()()(())",
          "()()()()()"
        ]
      },
      {
        "args": [
          6
        ],
        "expected": [
          "(((((())))))",
          "((((()()))))",
          "((((())())))",
          "((((()))()))",
          "((((())))())",
          "((((()))))()",
          "(((()(()))))",
          "(((()()())))",
          "(((()())()))",
          "(((()()))())",
          "(((()())))()",
          "(((())(())))",
          "(((())()()))",
          "(((())())())",
          "(((())()))()",
          "(((()))(()))",
          "(((()))()())",
          "(((()))())()",
          "(((())))(())",
          "(((())))()()",
          "((()((()))))",
          "((()(()())))",
          "((()(())()))",
          "((()(()))())",
          "((()(())))()",
          "((()()(())))",
          "((()()()()))",
          "((()()())())",
          "((()()()))()",
          "((()())(()))",
          "((()())()())",
          "((()())())()",
          "((()()))(())",
          "((()()))()()",
          "((())((())))",
          "((())(()()))",
          "((())(())())",
          "((())(()))()",
          "((())()(()))",
          "((())()()())",
          "((())()())()",
          "((())())(())",
          "((())())()()",
          "((()))((()))",
          "((()))(()())",
          "((()))(())()",
          "((()))()(())",
          "((()))()()()",
          "(()(((()))))",
          "(()((()())))",
          "(()((())()))",
          "(()((()))())",
          "(()((())))()",
          "(()(()(())))",
          "(()(()()()))",
          "(()(()())())",
          "(()(()()))()",
          "(()(())(()))",
          "(()(())()())",
          "(()(())())()",
          "(()(()))(())",
          "(()(()))()()",
          "(()()((())))",
          "(()()(()()))",
          "(()()(())())",
          "(()()(()))()",
          "(()()()(()))",
          "(()()()()())",
          "(()()()())()",
          "(()()())(())",
          "(()()())()()",
          "(()())((()))",
          "(()())(()())",
          "(()())(())()",
          "(()())()(())",
          "(()())()()()",
          "(())(((())))",
          "(())((()()))",
          "(())((())())",
          "(())((()))()",
          "(())(()(()))",
          "(())(()()())",
          "(())(()())()",
          "(())(())(())",
          "(())(())()()",
          "(())()((()))",
          "(())()(()())",
          "(())()(())()",
          "(())()()(())",
          "(())()()()()",
          "()((((()))))",
          "()(((()())))",
          "()(((())()))",
          "()(((()))())",
          "()(((())))()",
          "()((()(())))",
          "()((()()()))",
          "()((()())())",
          "()((()()))()",
          "()((())(()))",
          "()((())()())",
          "()((())())()",
          "()((()))(())",
          "()((()))()()",
          "()(()((())))",
          "()(()(()()))",
          "()(()(())())",
          "()(()(()))()",
          "()(()()(()))",
          "()(()()()())",
          "()(()()())()",
          "()(()())(())",
          "()(()())()()",
          "()(())((()))",
          "()(())(()())",
          "()(())(())()",
          "()(())()(())",
          "()(())()()()",
          "()()(((())))",
          "()()((()()))",
          "()()((())())",
          "()()((()))()",
          "()()(()(()))",
          "()()(()()())",
          "()()(()())()",
          "()()(())(())",
          "()()(())()()",
          "()()()((()))",
          "()()()(()())",
          "()()()(())()",
          "()()()()(())",
          "()()()()()()"
        ]
      },
      {
        "args": [
          2
        ],
        "expected": [
          "(())",
          "()()"
        ]
      },
      {
        "args": [
          3
        ],
        "expected": [
          "((()))",
          "(()())",
          "(())()",
          "()(())",
          "()()()"
        ]
      }
    ],
    "sampleCount": 3,
    "compare": "unordered",
    "solutions": [
      {
        "title": "Generate All Bit Patterns",
        "explanation": "**Intuition.** Every answer is a length-2n string of parentheses, so generate all possibilities and filter the valid ones.\n\n**Steps.**\n1. Recursively build every string of ( and ) of length 2n.\n2. For each complete string, scan its balance.\n3. Keep strings whose balance never drops below zero and ends at zero.\n\n**Correctness.** The generator enumerates all possible parenthesis strings of the required length. The balance test is the standard necessary and sufficient condition for well-formed parentheses.\n\n**Pitfalls.** This grows as 2^(2n), so it is only a baseline.",
        "time": "O(4^n n)",
        "space": "O(4^n n)",
        "python": "class Solution:\n    def generateParenthesis(self, n: int) -> List[str]:\n        ans = []\n        def valid(s):\n            bal = 0\n            for ch in s:\n                bal += 1 if ch == '(' else -1\n                if bal < 0:\n                    return False\n            return bal == 0\n        def gen(cur):\n            if len(cur) == 2 * n:\n                s = ''.join(cur)\n                if valid(s):\n                    ans.append(s)\n                return\n            cur.append('('); gen(cur); cur.pop()\n            cur.append(')'); gen(cur); cur.pop()\n        gen([])\n        return ans\n",
        "cpp": "class Solution {\n    bool valid(const string& s) {\n        int bal = 0;\n        for (char ch : s) {\n            bal += ch == '(' ? 1 : -1;\n            if (bal < 0) return false;\n        }\n        return bal == 0;\n    }\n    void gen(int n, string& cur, vector<string>& ans) {\n        if ((int)cur.size() == 2 * n) {\n            if (valid(cur)) ans.push_back(cur);\n            return;\n        }\n        cur.push_back('('); gen(n, cur, ans); cur.pop_back();\n        cur.push_back(')'); gen(n, cur, ans); cur.pop_back();\n    }\npublic:\n    vector<string> generateParenthesis(int n) {\n        vector<string> ans;\n        string cur;\n        gen(n, cur, ans);\n        return ans;\n    }\n};"
      },
      {
        "title": "Backtracking with Counts",
        "explanation": "**Intuition.** Build only prefixes that can still become valid: never close more than opened, and never open more than n.\n\n**Steps.**\n1. Track how many open and close parentheses have been used.\n2. Add ( while open < n.\n3. Add ) while close < open.\n4. When length is 2n, record the string.\n\n**Correctness.** The rules maintain every prefix as a valid prefix of some balanced string. Every balanced string follows those same choices, so the search emits all and only valid answers.\n\n**Pitfalls.** The close count may equal open only at safe points; it must never exceed open.",
        "time": "O(C_n n)",
        "space": "O(n) recursion plus output",
        "python": "class Solution:\n    def generateParenthesis(self, n: int) -> List[str]:\n        ans = []\n        def backtrack(opened, closed, cur):\n            if len(cur) == 2 * n:\n                ans.append(''.join(cur))\n                return\n            if opened < n:\n                cur.append('(')\n                backtrack(opened + 1, closed, cur)\n                cur.pop()\n            if closed < opened:\n                cur.append(')')\n                backtrack(opened, closed + 1, cur)\n                cur.pop()\n        backtrack(0, 0, [])\n        return ans\n",
        "cpp": "class Solution {\n    void backtrack(int n, int opened, int closed, string& cur, vector<string>& ans) {\n        if ((int)cur.size() == 2 * n) {\n            ans.push_back(cur);\n            return;\n        }\n        if (opened < n) {\n            cur.push_back('(');\n            backtrack(n, opened + 1, closed, cur, ans);\n            cur.pop_back();\n        }\n        if (closed < opened) {\n            cur.push_back(')');\n            backtrack(n, opened, closed + 1, cur, ans);\n            cur.pop_back();\n        }\n    }\npublic:\n    vector<string> generateParenthesis(int n) {\n        vector<string> ans;\n        string cur;\n        backtrack(n, 0, 0, cur, ans);\n        return ans;\n    }\n};"
      }
    ]
  },
  {
    "id": "daily-temperatures",
    "title": "Daily Temperatures",
    "number": 739,
    "difficulty": "Medium",
    "category": "Stack",
    "pattern": "Monotonic Stack",
    "description": "For each day, report how many days must pass until a warmer temperature occurs. Use 0 for days that never see a warmer future day.",
    "examples": [
      {
        "input": "temperatures = [73,74,75,71,69,72,76,73]",
        "output": "[1, 1, 4, 2, 1, 1, 0, 0]",
        "explanation": "Each entry points to the next warmer day when one exists."
      },
      {
        "input": "temperatures = [30,40,50,60]",
        "output": "[1, 1, 1, 0]",
        "explanation": "Every day except the last warms the next day."
      },
      {
        "input": "temperatures = [30,60,90]",
        "output": "[1, 1, 0]",
        "explanation": "The waits are one day, one day, and none."
      }
    ],
    "constraints": [
      "`1 <= temperatures.length <= 10^5`",
      "`30 <= temperatures[i] <= 100`",
      "A warmer day must have a strictly higher temperature.",
      "Return one wait value per input day."
    ],
    "hints": [
      "Unresolved days wait for a warmer value in the future.",
      "When today is warmer than the stack top day, today resolves that day.",
      "Keep a decreasing stack of indices."
    ],
    "signature": {
      "kind": "function",
      "name": "dailyTemperatures",
      "params": [
        {
          "name": "temperatures",
          "type": "int[]"
        }
      ],
      "returns": "int[]"
    },
    "tests": [
      {
        "args": [
          [
            73,
            74,
            75,
            71,
            69,
            72,
            76,
            73
          ]
        ],
        "expected": [
          1,
          1,
          4,
          2,
          1,
          1,
          0,
          0
        ]
      },
      {
        "args": [
          [
            30,
            40,
            50,
            60
          ]
        ],
        "expected": [
          1,
          1,
          1,
          0
        ]
      },
      {
        "args": [
          [
            30,
            60,
            90
          ]
        ],
        "expected": [
          1,
          1,
          0
        ]
      },
      {
        "args": [
          [
            90,
            80,
            70
          ]
        ],
        "expected": [
          0,
          0,
          0
        ]
      },
      {
        "args": [
          [
            70
          ]
        ],
        "expected": [
          0
        ]
      },
      {
        "args": [
          [
            70,
            70,
            71,
            69,
            72
          ]
        ],
        "expected": [
          2,
          1,
          2,
          1,
          0
        ]
      },
      {
        "args": [
          [
            60,
            62,
            61,
            63
          ]
        ],
        "expected": [
          1,
          2,
          1,
          0
        ]
      },
      {
        "args": [
          [
            80,
            79,
            81,
            80,
            82
          ]
        ],
        "expected": [
          2,
          1,
          2,
          1,
          0
        ]
      }
    ],
    "sampleCount": 3,
    "solutions": [
      {
        "title": "Look Ahead from Each Day",
        "explanation": "**Intuition.** For each day, scan forward until a warmer temperature appears.\n\n**Steps.**\n1. For each index i, set answer to 0 initially.\n2. Check later days j > i in order.\n3. When temperatures[j] is warmer, store j - i and stop scanning for i.\n\n**Correctness.** The first later warmer day encountered by the inner loop is the nearest one by construction. If none is found, the correct wait remains zero.\n\n**Pitfalls.** Use strictly warmer, not warmer-or-equal.",
        "time": "O(n^2)",
        "space": "O(1) extra besides output",
        "python": "class Solution:\n    def dailyTemperatures(self, temperatures: List[int]) -> List[int]:\n        ans = [0] * len(temperatures)\n        for i, t in enumerate(temperatures):\n            for j in range(i + 1, len(temperatures)):\n                if temperatures[j] > t:\n                    ans[i] = j - i\n                    break\n        return ans\n",
        "cpp": "class Solution {\npublic:\n    vector<int> dailyTemperatures(vector<int>& temperatures) {\n        vector<int> ans(temperatures.size());\n        for (int i = 0; i < (int)temperatures.size(); ++i) {\n            for (int j = i + 1; j < (int)temperatures.size(); ++j) {\n                if (temperatures[j] > temperatures[i]) { ans[i] = j - i; break; }\n            }\n        }\n        return ans;\n    }\n};"
      },
      {
        "title": "Monotonic Decreasing Stack",
        "explanation": "**Intuition.** Keep unresolved days whose temperatures are decreasing; a warmer current day resolves colder days on top.\n\n**Steps.**\n1. Scan temperatures left to right.\n2. While the stack top is colder than today, pop it and set its wait.\n3. Push today as unresolved.\n4. Unresolved days left in the stack keep answer 0.\n\n**Correctness.** A day stays on the stack until the first warmer future day arrives. Because days are scanned in order, the current index is the nearest warmer day for every popped index.\n\n**Pitfalls.** Store indices, not temperatures, so you can compute the waiting distance.",
        "time": "O(n)",
        "space": "O(n)",
        "python": "class Solution:\n    def dailyTemperatures(self, temperatures: List[int]) -> List[int]:\n        ans = [0] * len(temperatures)\n        st = []\n        for i, t in enumerate(temperatures):\n            while st and temperatures[st[-1]] < t:\n                j = st.pop()\n                ans[j] = i - j\n            st.append(i)\n        return ans\n",
        "cpp": "class Solution {\npublic:\n    vector<int> dailyTemperatures(vector<int>& temperatures) {\n        vector<int> ans(temperatures.size()), st;\n        for (int i = 0; i < (int)temperatures.size(); ++i) {\n            while (!st.empty() && temperatures[st.back()] < temperatures[i]) {\n                int j = st.back(); st.pop_back();\n                ans[j] = i - j;\n            }\n            st.push_back(i);\n        }\n        return ans;\n    }\n};"
      }
    ],
    "viz": "monotonic-stack"
  },
  {
    "id": "car-fleet",
    "title": "Car Fleet",
    "number": 853,
    "difficulty": "Medium",
    "category": "Stack",
    "pattern": "Monotonic Stack",
    "description": "Cars drive toward a target on one lane. A faster car that catches a slower car becomes part of that slower fleet. Return how many fleets reach the target.",
    "examples": [
      {
        "input": "target = 12, position = [10,8,0,5,3], speed = [2,4,1,1,3]",
        "output": "3",
        "explanation": "Cars merge into three arrival groups."
      },
      {
        "input": "target = 10, position = [3], speed = [3]",
        "output": "1",
        "explanation": "One car is one fleet."
      },
      {
        "input": "target = 100, position = [0,2,4], speed = [4,2,1]",
        "output": "1",
        "explanation": "Each rear car catches the fleet ahead, producing one fleet."
      }
    ],
    "constraints": [
      "`1 <= position.length == speed.length <= 10^5`",
      "`0 <= position[i] < target <= 10^6`",
      "All positions are unique.",
      "`1 <= speed[i] <= 10^6`"
    ],
    "hints": [
      "A car can only interact with cars ahead of it.",
      "Compare target arrival times after sorting by position.",
      "Scanning from closest to target backward, count a new fleet only when arrival time is larger than the fleet ahead."
    ],
    "signature": {
      "kind": "function",
      "name": "carFleet",
      "params": [
        {
          "name": "target",
          "type": "int"
        },
        {
          "name": "position",
          "type": "int[]"
        },
        {
          "name": "speed",
          "type": "int[]"
        }
      ],
      "returns": "int"
    },
    "tests": [
      {
        "args": [
          12,
          [
            10,
            8,
            0,
            5,
            3
          ],
          [
            2,
            4,
            1,
            1,
            3
          ]
        ],
        "expected": 3
      },
      {
        "args": [
          10,
          [
            3
          ],
          [
            3
          ]
        ],
        "expected": 1
      },
      {
        "args": [
          100,
          [
            0,
            2,
            4
          ],
          [
            4,
            2,
            1
          ]
        ],
        "expected": 1
      },
      {
        "args": [
          10,
          [
            6,
            8
          ],
          [
            3,
            2
          ]
        ],
        "expected": 2
      },
      {
        "args": [
          10,
          [
            0,
            4,
            2
          ],
          [
            2,
            1,
            3
          ]
        ],
        "expected": 1
      },
      {
        "args": [
          15,
          [
            6,
            10,
            12
          ],
          [
            3,
            2,
            1
          ]
        ],
        "expected": 1
      },
      {
        "args": [
          20,
          [
            5,
            10,
            15
          ],
          [
            5,
            2,
            1
          ]
        ],
        "expected": 1
      },
      {
        "args": [
          30,
          [
            10,
            20,
            5,
            25
          ],
          [
            2,
            4,
            5,
            1
          ]
        ],
        "expected": 2
      }
    ],
    "sampleCount": 3,
    "solutions": [
      {
        "title": "Repeated Fleet Merging",
        "explanation": "**Intuition.** After sorting by position, a rear car joins the fleet ahead if it would reach the target no later than that fleet.\n\n**Steps.**\n1. Sort cars by position from farthest back to closest to target.\n2. Compute each car's target arrival time.\n3. Repeatedly merge any rear time that is <= the time immediately ahead.\n4. The remaining entries are fleets.\n\n**Correctness.** If a rear car arrives no later than the fleet ahead, it must catch it before or at the target and share that fleet time. Repeating until no merges remain leaves exactly independent fleets.\n\n**Pitfalls.** Compare with the fleet directly ahead after sorting by position, not with arbitrary cars.",
        "time": "O(n^2)",
        "space": "O(n)",
        "python": "class Solution:\n    def carFleet(self, target: int, position: List[int], speed: List[int]) -> int:\n        times = [(target - p) / v for p, v in sorted(zip(position, speed))]\n        changed = True\n        while changed:\n            changed = False\n            i = len(times) - 2\n            while i >= 0:\n                if times[i] <= times[i + 1]:\n                    times.pop(i)\n                    changed = True\n                i -= 1\n        return len(times)\n",
        "cpp": "class Solution {\npublic:\n    int carFleet(int target, vector<int>& position, vector<int>& speed) {\n        vector<pair<int, double>> cars;\n        for (int i = 0; i < (int)position.size(); ++i) cars.push_back({position[i], (double)(target - position[i]) / speed[i]});\n        sort(cars.begin(), cars.end());\n        vector<double> times;\n        for (auto& car : cars) times.push_back(car.second);\n        bool changed = true;\n        while (changed) {\n            changed = false;\n            for (int i = (int)times.size() - 2; i >= 0; --i) {\n                if (times[i] <= times[i + 1]) {\n                    times.erase(times.begin() + i);\n                    changed = true;\n                }\n            }\n        }\n        return times.size();\n    }\n};"
      },
      {
        "title": "Reverse Scan Arrival Times",
        "explanation": "**Intuition.** Scanning from the car closest to the target backward, a new fleet forms only when a car would arrive later than every fleet ahead.\n\n**Steps.**\n1. Sort cars by position.\n2. Scan from highest position to lowest.\n3. Compute each arrival time.\n4. If it is greater than the slowest fleet time ahead, count a new fleet and update that time.\n\n**Correctness.** A rear car with arrival time <= current fleet time catches the fleet ahead. A rear car with a larger time cannot catch any ahead fleet, so it starts a new fleet.\n\n**Pitfalls.** Sort by position, not by speed or arrival time alone.",
        "time": "O(n log n)",
        "space": "O(n) or O(1) after sorting storage",
        "python": "class Solution:\n    def carFleet(self, target: int, position: List[int], speed: List[int]) -> int:\n        cars = sorted(zip(position, speed), reverse=True)\n        fleets = 0\n        slowest = 0.0\n        for p, v in cars:\n            time = (target - p) / v\n            if time > slowest:\n                fleets += 1\n                slowest = time\n        return fleets\n",
        "cpp": "class Solution {\npublic:\n    int carFleet(int target, vector<int>& position, vector<int>& speed) {\n        vector<pair<int, int>> cars;\n        for (int i = 0; i < (int)position.size(); ++i) cars.push_back({position[i], speed[i]});\n        sort(cars.rbegin(), cars.rend());\n        int fleets = 0;\n        double slowest = 0.0;\n        for (auto& [p, v] : cars) {\n            double time = (double)(target - p) / v;\n            if (time > slowest) {\n                ++fleets;\n                slowest = time;\n            }\n        }\n        return fleets;\n    }\n};"
      }
    ],
    "viz": "monotonic-stack"
  },
  {
    "id": "largest-rectangle-in-histogram",
    "title": "Largest Rectangle in Histogram",
    "number": 84,
    "difficulty": "Hard",
    "category": "Stack",
    "pattern": "Monotonic Stack",
    "description": "Given bar heights in a histogram, return the largest rectangle area that can be formed using contiguous bars. The rectangle height is limited by the shortest bar it spans.",
    "examples": [
      {
        "input": "heights = [2,1,5,6,2,3]",
        "output": "10",
        "explanation": "Bars of heights 5 and 6 form area 10."
      },
      {
        "input": "heights = [2,4]",
        "output": "4",
        "explanation": "The taller single bar gives area 4."
      },
      {
        "input": "heights = [1,1]",
        "output": "2",
        "explanation": "Both bars together form area 2."
      }
    ],
    "constraints": [
      "`1 <= heights.length <= 10^5`",
      "`0 <= heights[i] <= 10^4`",
      "Rectangles must span contiguous bars.",
      "Area fits in a 32-bit signed integer for the standard constraints."
    ],
    "hints": [
      "For a fixed bar as the shortest bar, how far can it extend left and right?",
      "A smaller bar on either side sets the boundary.",
      "Use an increasing stack and compute areas when a shorter bar appears."
    ],
    "signature": {
      "kind": "function",
      "name": "largestRectangleArea",
      "params": [
        {
          "name": "heights",
          "type": "int[]"
        }
      ],
      "returns": "int"
    },
    "tests": [
      {
        "args": [
          [
            2,
            1,
            5,
            6,
            2,
            3
          ]
        ],
        "expected": 10
      },
      {
        "args": [
          [
            2,
            4
          ]
        ],
        "expected": 4
      },
      {
        "args": [
          [
            1,
            1
          ]
        ],
        "expected": 2
      },
      {
        "args": [
          [
            4,
            3,
            2,
            1
          ]
        ],
        "expected": 6
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
        "expected": 6
      },
      {
        "args": [
          [
            2,
            1,
            2
          ]
        ],
        "expected": 3
      },
      {
        "args": [
          [
            0,
            9
          ]
        ],
        "expected": 9
      },
      {
        "args": [
          [
            6,
            2,
            5,
            4,
            5,
            1,
            6
          ]
        ],
        "expected": 12
      }
    ],
    "sampleCount": 3,
    "solutions": [
      {
        "title": "Expand Every Interval",
        "explanation": "**Intuition.** Every rectangle spans a contiguous interval and is limited by the smallest bar in that interval.\n\n**Steps.**\n1. Choose a left boundary.\n2. Extend the right boundary one step at a time.\n3. Maintain the minimum height in the interval.\n4. Update area as minHeight times width.\n\n**Correctness.** Each possible contiguous interval is examined, and the tallest rectangle using exactly that interval has height equal to the interval minimum. The maximum over intervals is optimal.\n\n**Pitfalls.** Update the running minimum before computing the area for the extended interval.",
        "time": "O(n^2)",
        "space": "O(1)",
        "python": "class Solution:\n    def largestRectangleArea(self, heights: List[int]) -> int:\n        best = 0\n        for left in range(len(heights)):\n            mn = heights[left]\n            for right in range(left, len(heights)):\n                mn = min(mn, heights[right])\n                best = max(best, mn * (right - left + 1))\n        return best\n",
        "cpp": "class Solution {\npublic:\n    int largestRectangleArea(vector<int>& heights) {\n        int best = 0;\n        for (int left = 0; left < (int)heights.size(); ++left) {\n            int mn = heights[left];\n            for (int right = left; right < (int)heights.size(); ++right) {\n                mn = min(mn, heights[right]);\n                best = max(best, mn * (right - left + 1));\n            }\n        }\n        return best;\n    }\n};"
      },
      {
        "title": "Increasing Stack of Bars",
        "explanation": "**Intuition.** When a shorter bar appears, it determines the right boundary for taller bars waiting on the stack.\n\n**Steps.**\n1. Scan bars plus a sentinel height 0.\n2. Keep indices with increasing heights on a stack.\n3. While the current height is lower, pop a bar and compute its maximal width.\n4. Push the current index.\n\n**Correctness.** A popped bar is bounded on the right by the current index and on the left by the new stack top. That is the widest interval where it is the minimum height, so its best rectangle is computed exactly once.\n\n**Pitfalls.** The sentinel flushes bars that never meet a shorter bar inside the array.",
        "time": "O(n)",
        "space": "O(n)",
        "python": "class Solution:\n    def largestRectangleArea(self, heights: List[int]) -> int:\n        st = []\n        best = 0\n        for i, h in enumerate(heights + [0]):\n            while st and heights[st[-1]] > h:\n                idx = st.pop()\n                left = st[-1] if st else -1\n                best = max(best, heights[idx] * (i - left - 1))\n            st.append(i)\n        return best\n",
        "cpp": "class Solution {\npublic:\n    int largestRectangleArea(vector<int>& heights) {\n        vector<int> st;\n        int best = 0;\n        for (int i = 0; i <= (int)heights.size(); ++i) {\n            int h = (i == (int)heights.size()) ? 0 : heights[i];\n            while (!st.empty() && heights[st.back()] > h) {\n                int idx = st.back(); st.pop_back();\n                int left = st.empty() ? -1 : st.back();\n                best = max(best, heights[idx] * (i - left - 1));\n            }\n            st.push_back(i);\n        }\n        return best;\n    }\n};"
      }
    ],
    "viz": "monotonic-stack"
  }
]

export default problems
