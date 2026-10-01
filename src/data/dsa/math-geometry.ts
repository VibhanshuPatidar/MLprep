import type { DsaProblem } from '../../types/content'

const problems: DsaProblem[] = [
  {
    id: 'rotate-image',
    title: 'Rotate Image',
    number: 48,
    difficulty: 'Medium',
    category: 'Math & Geometry',
    pattern: 'Matrix Transform',
    description: `Given an n by n grid of integers, rotate the image one quarter-turn clockwise. Implement rotate(matrix) so that the supplied matrix object is changed directly.

No separate return value is judged; after the call, every value should be in the cell it would occupy after a clockwise rotation.`,
    examples: [
      {
        input: 'matrix = [[1,2,3],[4,5,6],[7,8,9]]',
        output: '[[7,4,1],[8,5,2],[9,6,3]]',
        explanation: 'The top row becomes the right column, the middle row stays centered around 5, and the bottom row becomes the left column.',
      },
      {
        input: 'matrix = [[5,1,9,11],[2,4,8,10],[13,3,6,7],[15,14,12,16]]',
        output: '[[15,13,2,5],[14,3,4,1],[12,6,8,9],[16,7,10,11]]',
        explanation: 'Each original row is read into a destination column from right to left.',
      },
      {
        input: 'matrix = [[1]]',
        output: '[[1]]',
        explanation: 'A one-cell image is unchanged by rotation.',
      },
    ],
    constraints: [
      'matrix.length == n',
      'matrix[i].length == n',
      '1 <= n <= 20',
      '-1000 <= matrix[i][j] <= 1000',
      'The update must be observable on the original matrix object.',
    ],
    hints: [
      'Think about where cell row r, column c moves after a clockwise turn.',
      'A clockwise rotation can be split into a transpose followed by reversing every row.',
      'Swap only the upper triangle during the transpose, then reverse each row in place.',
    ],
    signature: { kind: 'function', name: 'rotate', params: [{ name: 'matrix', type: 'int[][]' }], returns: 'void', inPlace: 0 },
    tests: [
      { args: [[[1, 2, 3], [4, 5, 6], [7, 8, 9]]], expected: [[7, 4, 1], [8, 5, 2], [9, 6, 3]] },
      { args: [[[5, 1, 9, 11], [2, 4, 8, 10], [13, 3, 6, 7], [15, 14, 12, 16]]], expected: [[15, 13, 2, 5], [14, 3, 4, 1], [12, 6, 8, 9], [16, 7, 10, 11]] },
      { args: [[[1]]], expected: [[1]] },
      { args: [[[1, 2], [3, 4]]], expected: [[3, 1], [4, 2]] },
      { args: [[[-1, -2], [-3, -4]]], expected: [[-3, -1], [-4, -2]] },
      { args: [[[0, 0, 0], [0, 0, 0], [0, 0, 0]]], expected: [[0, 0, 0], [0, 0, 0], [0, 0, 0]] },
      { args: [[[1, 2, 3, 4, 5], [6, 7, 8, 9, 10], [11, 12, 13, 14, 15], [16, 17, 18, 19, 20], [21, 22, 23, 24, 25]]], expected: [[21, 16, 11, 6, 1], [22, 17, 12, 7, 2], [23, 18, 13, 8, 3], [24, 19, 14, 9, 4], [25, 20, 15, 10, 5]] },
      { args: [[[5, 1, 9], [2, 4, 8], [13, 3, 6]]], expected: [[13, 2, 5], [3, 4, 1], [6, 8, 9]] },
    ],
    solutions: [
      {
        title: 'Copy Into Rotated Positions',
        explanation: `Intuition: the destination of every cell is independent, so a temporary matrix makes the mapping explicit.

1. Create another n by n matrix.
2. For each original cell at row r and column c, write it to row c and column n - 1 - r in the copy.
3. Copy each completed row back into the original matrix.

Correctness argument: step 2 uses exactly the coordinate formula for a clockwise rotation, so every original cell is written to its unique rotated position. Because the final step replaces every original row with the computed row, the supplied matrix equals the rotated image.

Pitfalls: returning a new matrix is not enough for an in-place signature; the caller must observe the mutation on the original object.`,
        time: 'O(n^2)',
        space: 'O(n^2)',
        python: `class Solution:
    def rotate(self, matrix: List[List[int]]) -> None:
        n = len(matrix)
        rotated = [[0] * n for _ in range(n)]
        for r in range(n):
            for c in range(n):
                rotated[c][n - 1 - r] = matrix[r][c]
        for r in range(n):
            matrix[r][:] = rotated[r]
`,
        cpp: `class Solution {
public:
    void rotate(vector<vector<int>>& matrix) {
        int n = matrix.size();
        vector<vector<int>> rotated(n, vector<int>(n));
        for (int r = 0; r < n; ++r) {
            for (int c = 0; c < n; ++c) {
                rotated[c][n - 1 - r] = matrix[r][c];
            }
        }
        matrix = rotated;
    }
};`,
      },
      {
        title: 'Transpose Then Reverse Rows',
        explanation: `Intuition: a transpose mirrors the matrix across its main diagonal, and reversing each row finishes the clockwise turn.

1. Swap matrix[r][c] with matrix[c][r] for every cell above the main diagonal.
2. Reverse every row.
3. Leave the matrix in that state; no return value is needed.

Correctness argument: after transposition, value (r, c) moves to (c, r). Reversing row c sends column r to n - 1 - r, so the final position is (c, n - 1 - r), exactly the clockwise rotation formula.

Pitfalls: swapping both triangles would undo the transpose. Only visit c greater than r.`,
        time: 'O(n^2)',
        space: 'O(1)',
        python: `class Solution:
    def rotate(self, matrix: List[List[int]]) -> None:
        n = len(matrix)
        for r in range(n):
            for c in range(r + 1, n):
                matrix[r][c], matrix[c][r] = matrix[c][r], matrix[r][c]
        for row in matrix:
            row.reverse()
`,
        cpp: `class Solution {
public:
    void rotate(vector<vector<int>>& matrix) {
        int n = matrix.size();
        for (int r = 0; r < n; ++r) {
            for (int c = r + 1; c < n; ++c) {
                swap(matrix[r][c], matrix[c][r]);
            }
        }
        for (auto& row : matrix) reverse(row.begin(), row.end());
    }
};`,
      },
    ],
  },
  {
    id: 'spiral-matrix',
    title: 'Spiral Matrix',
    number: 54,
    difficulty: 'Medium',
    category: 'Math & Geometry',
    pattern: 'Boundary Simulation',
    description: `Given a rectangular matrix, list all values in clockwise spiral order starting from the top-left corner.

The output should contain each cell exactly once, following the current top edge, right edge, bottom edge, and left edge as the unvisited rectangle shrinks.`,
    examples: [
      {
        input: 'matrix = [[1,2,3],[4,5,6],[7,8,9]]',
        output: '[1,2,3,6,9,8,7,4,5]',
        explanation: 'The traversal walks the outside ring first and then visits the center.',
      },
      {
        input: 'matrix = [[1,2,3,4],[5,6,7,8],[9,10,11,12]]',
        output: '[1,2,3,4,8,12,11,10,9,5,6,7]',
        explanation: 'The final inner strip is read left to right.',
      },
      {
        input: 'matrix = [[7]]',
        output: '[7]',
        explanation: 'There is only one cell to emit.',
      },
    ],
    constraints: [
      '1 <= matrix.length <= 20',
      '1 <= matrix[i].length <= 20',
      '-1000 <= matrix[i][j] <= 1000',
      'All rows have the same length.',
    ],
    hints: [
      'After completing an edge, that edge should never be visited again.',
      'Keep four boundaries: top, bottom, left, and right.',
      'Before traversing the bottom row or left column, check that the boundaries have not crossed.',
    ],
    signature: { kind: 'function', name: 'spiralOrder', params: [{ name: 'matrix', type: 'int[][]' }], returns: 'int[]' },
    tests: [
      { args: [[[1, 2, 3], [4, 5, 6], [7, 8, 9]]], expected: [1, 2, 3, 6, 9, 8, 7, 4, 5] },
      { args: [[[1, 2, 3, 4], [5, 6, 7, 8], [9, 10, 11, 12]]], expected: [1, 2, 3, 4, 8, 12, 11, 10, 9, 5, 6, 7] },
      { args: [[[7]]], expected: [7] },
      { args: [[[1, 2, 3, 4]]], expected: [1, 2, 3, 4] },
      { args: [[[1], [2], [3]]], expected: [1, 2, 3] },
      { args: [[[1, 2], [3, 4]]], expected: [1, 2, 4, 3] },
      { args: [[[-1, -2, -3], [4, 5, 6], [7, 8, 9]]], expected: [-1, -2, -3, 6, 9, 8, 7, 4, 5] },
      { args: [[[1, 2], [3, 4], [5, 6], [7, 8]]], expected: [1, 2, 4, 6, 8, 7, 5, 3] },
    ],
    solutions: [
      {
        title: 'Visited Grid Simulation',
        explanation: `Intuition: simulate a person walking in a spiral and turn right whenever the next step would leave the board or revisit a cell.

1. Track the current row, column, and one of four directions.
2. Mark each emitted cell as visited.
3. If the next step is invalid, rotate the direction clockwise before moving.
4. Stop after collecting rows times columns values.

Correctness argument: the simulation emits one value per iteration and refuses to enter invalid or already visited cells. Turning clockwise at each obstacle preserves spiral motion, so the next chosen cell is exactly the next unvisited cell along the spiral path.

Pitfalls: without a visited grid, inner rings can be revisited when dimensions are uneven.`,
        time: 'O(mn)',
        space: 'O(mn)',
        python: `class Solution:
    def spiralOrder(self, matrix: List[List[int]]) -> List[int]:
        rows, cols = len(matrix), len(matrix[0])
        seen = [[False] * cols for _ in range(rows)]
        dirs = [(0, 1), (1, 0), (0, -1), (-1, 0)]
        r = c = d = 0
        ans = []
        for _ in range(rows * cols):
            ans.append(matrix[r][c])
            seen[r][c] = True
            nr, nc = r + dirs[d][0], c + dirs[d][1]
            if nr < 0 or nr >= rows or nc < 0 or nc >= cols or seen[nr][nc]:
                d = (d + 1) % 4
                nr, nc = r + dirs[d][0], c + dirs[d][1]
            r, c = nr, nc
        return ans
`,
        cpp: `class Solution {
public:
    vector<int> spiralOrder(vector<vector<int>>& matrix) {
        int rows = matrix.size(), cols = matrix[0].size();
        vector<vector<bool>> seen(rows, vector<bool>(cols, false));
        vector<pair<int, int>> dirs{{0, 1}, {1, 0}, {0, -1}, {-1, 0}};
        int r = 0, c = 0, d = 0;
        vector<int> ans;
        for (int step = 0; step < rows * cols; ++step) {
            ans.push_back(matrix[r][c]);
            seen[r][c] = true;
            int nr = r + dirs[d].first, nc = c + dirs[d].second;
            if (nr < 0 || nr >= rows || nc < 0 || nc >= cols || seen[nr][nc]) {
                d = (d + 1) % 4;
                nr = r + dirs[d].first;
                nc = c + dirs[d].second;
            }
            r = nr;
            c = nc;
        }
        return ans;
    }
};`,
      },
      {
        title: 'Shrinking Boundaries',
        explanation: `Intuition: every spiral layer is the perimeter of the current remaining rectangle.

1. Maintain top, bottom, left, and right boundaries.
2. Append the top row, then the right column, and move those boundaries inward.
3. If rows remain, append the bottom row right-to-left.
4. If columns remain, append the left column bottom-to-top.
5. Repeat until the boundaries cross.

Correctness argument: each pass emits exactly the outer perimeter of the unvisited rectangle and then removes that perimeter by moving the boundaries inward. Since rectangles are disjoint and eventually empty, every cell is emitted once in spiral order.

Pitfalls: the bottom row and left column checks are necessary for single-row or single-column leftovers.`,
        time: 'O(mn)',
        space: 'O(1) extra, not counting the output',
        python: `class Solution:
    def spiralOrder(self, matrix: List[List[int]]) -> List[int]:
        top, bottom = 0, len(matrix) - 1
        left, right = 0, len(matrix[0]) - 1
        ans = []
        while top <= bottom and left <= right:
            for c in range(left, right + 1):
                ans.append(matrix[top][c])
            top += 1
            for r in range(top, bottom + 1):
                ans.append(matrix[r][right])
            right -= 1
            if top <= bottom:
                for c in range(right, left - 1, -1):
                    ans.append(matrix[bottom][c])
                bottom -= 1
            if left <= right:
                for r in range(bottom, top - 1, -1):
                    ans.append(matrix[r][left])
                left += 1
        return ans
`,
        cpp: `class Solution {
public:
    vector<int> spiralOrder(vector<vector<int>>& matrix) {
        int top = 0, bottom = matrix.size() - 1;
        int left = 0, right = matrix[0].size() - 1;
        vector<int> ans;
        while (top <= bottom && left <= right) {
            for (int c = left; c <= right; ++c) ans.push_back(matrix[top][c]);
            ++top;
            for (int r = top; r <= bottom; ++r) ans.push_back(matrix[r][right]);
            --right;
            if (top <= bottom) {
                for (int c = right; c >= left; --c) ans.push_back(matrix[bottom][c]);
                --bottom;
            }
            if (left <= right) {
                for (int r = bottom; r >= top; --r) ans.push_back(matrix[r][left]);
                ++left;
            }
        }
        return ans;
    }
};`,
      },
    ],
  },
  {
    id: 'set-matrix-zeroes',
    title: 'Set Matrix Zeroes',
    number: 73,
    difficulty: 'Medium',
    category: 'Math & Geometry',
    pattern: 'Matrix Marking',
    description: `Given a matrix, if any cell is zero, make its entire row and entire column zero. Implement setZeroes(matrix) by mutating the input matrix.

All zero decisions must be based on the original matrix, not on zeros introduced during the update.`,
    examples: [
      {
        input: 'matrix = [[1,1,1],[1,0,1],[1,1,1]]',
        output: '[[1,0,1],[0,0,0],[1,0,1]]',
        explanation: 'The middle cell clears the middle row and middle column.',
      },
      {
        input: 'matrix = [[0,1,2,0],[3,4,5,2],[1,3,1,5]]',
        output: '[[0,0,0,0],[0,4,5,0],[0,3,1,0]]',
        explanation: 'Zeros in the first row still affect their columns.',
      },
      {
        input: 'matrix = [[1]]',
        output: '[[1]]',
        explanation: 'No zero appears, so the matrix remains unchanged.',
      },
    ],
    constraints: [
      '1 <= matrix.length <= 20',
      '1 <= matrix[i].length <= 20',
      '-1000 <= matrix[i][j] <= 1000',
      'The matrix is modified in place.',
    ],
    hints: [
      'First identify all rows and columns that contain an original zero.',
      'To reduce space, use the first row and first column as marker storage.',
      'Store separately whether the first row and first column originally contained a zero.',
    ],
    signature: { kind: 'function', name: 'setZeroes', params: [{ name: 'matrix', type: 'int[][]' }], returns: 'void', inPlace: 0 },
    tests: [
      { args: [[[1, 1, 1], [1, 0, 1], [1, 1, 1]]], expected: [[1, 0, 1], [0, 0, 0], [1, 0, 1]] },
      { args: [[[0, 1, 2, 0], [3, 4, 5, 2], [1, 3, 1, 5]]], expected: [[0, 0, 0, 0], [0, 4, 5, 0], [0, 3, 1, 0]] },
      { args: [[[1]]], expected: [[1]] },
      { args: [[[0]]], expected: [[0]] },
      { args: [[[1, 0]]], expected: [[0, 0]] },
      { args: [[[1], [0], [3]]], expected: [[0], [0], [0]] },
      { args: [[[1, 2, 3], [4, 5, 6]]], expected: [[1, 2, 3], [4, 5, 6]] },
      { args: [[[0, 2, 3], [4, 5, 0], [7, 8, 9]]], expected: [[0, 0, 0], [0, 0, 0], [0, 8, 0]] },
    ],
    solutions: [
      {
        title: 'Remember Zero Rows and Columns',
        explanation: `Intuition: avoid cascading changes by recording where zeros were before writing any new zeros.

1. Scan the matrix and store every row index and column index that contains a zero.
2. Scan the matrix again.
3. Set a cell to zero if its row or column is in the recorded sets.

Correctness argument: the recorded sets are exactly the rows and columns that must be cleared according to the original matrix. The second pass clears all and only cells belonging to those rows or columns.

Pitfalls: clearing cells during the first scan would create artificial zeros and clear too much.`,
        time: 'O(mn)',
        space: 'O(m + n)',
        python: `class Solution:
    def setZeroes(self, matrix: List[List[int]]) -> None:
        rows, cols = set(), set()
        for r in range(len(matrix)):
            for c in range(len(matrix[0])):
                if matrix[r][c] == 0:
                    rows.add(r)
                    cols.add(c)
        for r in range(len(matrix)):
            for c in range(len(matrix[0])):
                if r in rows or c in cols:
                    matrix[r][c] = 0
`,
        cpp: `class Solution {
public:
    void setZeroes(vector<vector<int>>& matrix) {
        int m = matrix.size(), n = matrix[0].size();
        vector<bool> rows(m, false), cols(n, false);
        for (int r = 0; r < m; ++r) {
            for (int c = 0; c < n; ++c) {
                if (matrix[r][c] == 0) {
                    rows[r] = true;
                    cols[c] = true;
                }
            }
        }
        for (int r = 0; r < m; ++r) {
            for (int c = 0; c < n; ++c) {
                if (rows[r] || cols[c]) matrix[r][c] = 0;
            }
        }
    }
};`,
      },
      {
        title: 'Use First Row and Column as Markers',
        explanation: `Intuition: the matrix already has enough cells to store which later rows and columns must be cleared.

1. Record whether the first row and first column originally contain zero.
2. For every other cell that is zero, mark its row in column 0 and its column in row 0.
3. Clear interior cells whose row or column marker is zero.
4. Finally clear the first row and first column if their saved flags say to do so.

Correctness argument: every zero outside the first row and column writes one row marker and one column marker. These markers are then used to clear exactly the affected interior cells. The saved flags preserve the original state of the first row and column, so they are handled correctly after serving as marker storage.

Pitfalls: clear the first row and column last; otherwise marker information can be destroyed too early.`,
        time: 'O(mn)',
        space: 'O(1)',
        python: `class Solution:
    def setZeroes(self, matrix: List[List[int]]) -> None:
        m, n = len(matrix), len(matrix[0])
        first_row = any(matrix[0][c] == 0 for c in range(n))
        first_col = any(matrix[r][0] == 0 for r in range(m))
        for r in range(1, m):
            for c in range(1, n):
                if matrix[r][c] == 0:
                    matrix[r][0] = 0
                    matrix[0][c] = 0
        for r in range(1, m):
            for c in range(1, n):
                if matrix[r][0] == 0 or matrix[0][c] == 0:
                    matrix[r][c] = 0
        if first_row:
            for c in range(n):
                matrix[0][c] = 0
        if first_col:
            for r in range(m):
                matrix[r][0] = 0
`,
        cpp: `class Solution {
public:
    void setZeroes(vector<vector<int>>& matrix) {
        int m = matrix.size(), n = matrix[0].size();
        bool firstRow = false, firstCol = false;
        for (int c = 0; c < n; ++c) firstRow = firstRow || matrix[0][c] == 0;
        for (int r = 0; r < m; ++r) firstCol = firstCol || matrix[r][0] == 0;
        for (int r = 1; r < m; ++r) {
            for (int c = 1; c < n; ++c) {
                if (matrix[r][c] == 0) {
                    matrix[r][0] = 0;
                    matrix[0][c] = 0;
                }
            }
        }
        for (int r = 1; r < m; ++r) {
            for (int c = 1; c < n; ++c) {
                if (matrix[r][0] == 0 || matrix[0][c] == 0) matrix[r][c] = 0;
            }
        }
        if (firstRow) for (int c = 0; c < n; ++c) matrix[0][c] = 0;
        if (firstCol) for (int r = 0; r < m; ++r) matrix[r][0] = 0;
    }
};`,
      },
    ],
  },
  {
    id: 'happy-number',
    title: 'Happy Number',
    number: 202,
    difficulty: 'Easy',
    category: 'Math & Geometry',
    pattern: 'Cycle Detection',
    description: `Starting from a positive integer, repeatedly replace it with the sum of the squares of its decimal digits. Return true if this process eventually reaches 1; otherwise return false.

A number that never reaches 1 must eventually repeat a previous value, forming a cycle.`,
    examples: [
      {
        input: 'n = 19',
        output: 'true',
        explanation: '19 becomes 82, then 68, then 100, and then 1.',
      },
      {
        input: 'n = 2',
        output: 'false',
        explanation: 'The sequence enters a loop that does not include 1.',
      },
      {
        input: 'n = 1',
        output: 'true',
        explanation: 'The starting value already satisfies the target.',
      },
    ],
    constraints: [
      '1 <= n <= 2^31 - 1',
      'n is an integer written in base 10.',
      'Return a boolean value.',
    ],
    hints: [
      'Generate the next number with digit squares and watch for repeated states.',
      'The sequence cannot grow forever; after one step it becomes much smaller.',
      'A set detects repeats, or Floyd cycle detection can do the same with constant space.',
    ],
    signature: { kind: 'function', name: 'isHappy', params: [{ name: 'n', type: 'int' }], returns: 'bool' },
    tests: [
      { args: [19], expected: true },
      { args: [2], expected: false },
      { args: [1], expected: true },
      { args: [7], expected: true },
      { args: [4], expected: false },
      { args: [100], expected: true },
      { args: [1111111], expected: true },
      { args: [2147483647], expected: false },
    ],
    solutions: [
      {
        title: 'Visited States Set',
        explanation: `Intuition: if the sequence repeats a value before reaching 1, all future values will repeat the same loop.

1. Define a helper that computes the sum of squared digits.
2. Keep a set of values already seen.
3. Repeatedly transform n until it becomes 1 or appears in the set.
4. Return whether the terminal value is 1.

Correctness argument: every transformation depends only on the current value. Therefore, encountering the same value twice means the same future sequence will repeat forever. If 1 is reached first, the definition of a happy number is satisfied.

Pitfalls: do not stop just because the number gets small; stop only at 1 or a repeated state.`,
        time: 'O(log n) per generated state',
        space: 'O(k) for k generated states',
        python: `class Solution:
    def isHappy(self, n: int) -> bool:
        def next_value(x):
            total = 0
            while x:
                x, digit = divmod(x, 10)
                total += digit * digit
            return total

        seen = set()
        while n != 1 and n not in seen:
            seen.add(n)
            n = next_value(n)
        return n == 1
`,
        cpp: `class Solution {
    int nextValue(int x) {
        int total = 0;
        while (x > 0) {
            int digit = x % 10;
            total += digit * digit;
            x /= 10;
        }
        return total;
    }
public:
    bool isHappy(int n) {
        unordered_set<int> seen;
        while (n != 1 && !seen.count(n)) {
            seen.insert(n);
            n = nextValue(n);
        }
        return n == 1;
    }
};`,
      },
      {
        title: 'Floyd Cycle Detection',
        explanation: `Intuition: the digit-square process is a linked list where each number points to its next value. We only need to know whether the cycle reached is the self-loop at 1.

1. Move slow by one transformation.
2. Move fast by two transformations.
3. If either reaches 1, the number is happy.
4. If slow and fast meet elsewhere, the sequence is cycling without 1.

Correctness argument: Floyd detection guarantees that two runners on a deterministic sequence meet exactly when the sequence has entered a cycle. The only accepting cycle is 1 pointing back to 1, so checking for 1 before returning false distinguishes happy from unhappy numbers.

Pitfalls: apply the helper twice to advance fast; reusing stale values breaks the runner invariant.`,
        time: 'O(log n) per generated state',
        space: 'O(1)',
        python: `class Solution:
    def isHappy(self, n: int) -> bool:
        def next_value(x):
            total = 0
            while x:
                x, digit = divmod(x, 10)
                total += digit * digit
            return total

        slow = n
        fast = next_value(n)
        while fast != 1 and slow != fast:
            slow = next_value(slow)
            fast = next_value(next_value(fast))
        return fast == 1
`,
        cpp: `class Solution {
    int nextValue(int x) {
        int total = 0;
        while (x > 0) {
            int digit = x % 10;
            total += digit * digit;
            x /= 10;
        }
        return total;
    }
public:
    bool isHappy(int n) {
        int slow = n;
        int fast = nextValue(n);
        while (fast != 1 && slow != fast) {
            slow = nextValue(slow);
            fast = nextValue(nextValue(fast));
        }
        return fast == 1;
    }
};`,
      },
    ],
  },
  {
    id: 'plus-one',
    title: 'Plus One',
    number: 66,
    difficulty: 'Easy',
    category: 'Math & Geometry',
    pattern: 'Carry Propagation',
    description: `An array of digits represents a non-negative integer, most significant digit first. Add one to that integer and return the resulting digits in the same order.

The input contains no leading zero unless the number itself is zero.`,
    examples: [
      {
        input: 'digits = [1,2,3]',
        output: '[1,2,4]',
        explanation: '123 plus one is 124.',
      },
      {
        input: 'digits = [4,3,2,1]',
        output: '[4,3,2,2]',
        explanation: 'Only the last digit changes.',
      },
      {
        input: 'digits = [9]',
        output: '[1,0]',
        explanation: 'The carry creates a new most significant digit.',
      },
    ],
    constraints: [
      '1 <= digits.length <= 100',
      '0 <= digits[i] <= 9',
      'digits does not contain leading zero except [0].',
      'Return a new digit array or the mutated input array.',
    ],
    hints: [
      'Addition starts at the least significant digit, which is the end of the array.',
      'A digit less than 9 can absorb the carry and stop the process.',
      'If every digit was 9, prepend 1 and leave the rest as 0.',
    ],
    signature: { kind: 'function', name: 'plusOne', params: [{ name: 'digits', type: 'int[]' }], returns: 'int[]' },
    tests: [
      { args: [[1, 2, 3]], expected: [1, 2, 4] },
      { args: [[4, 3, 2, 1]], expected: [4, 3, 2, 2] },
      { args: [[9]], expected: [1, 0] },
      { args: [[9, 9]], expected: [1, 0, 0] },
      { args: [[0]], expected: [1] },
      { args: [[2, 9, 9]], expected: [3, 0, 0] },
      { args: [[8, 9, 9, 9]], expected: [9, 0, 0, 0] },
      { args: [[1, 0, 0]], expected: [1, 0, 1] },
    ],
    solutions: [
      {
        title: 'String Carry Baseline',
        explanation: `Intuition: decimal addition can be performed on a character representation, then converted back to digits.

1. Convert the digit array into a mutable string or character list.
2. Add one from the last character, carrying left while digits become 10.
3. If a carry remains after the first digit, insert a leading 1.
4. Convert characters back to integer digits.

Correctness argument: the algorithm performs the same right-to-left carry rule used by grade-school decimal addition. Each position receives the correct carry from less significant positions, so the final digit sequence represents the original number plus one.

Pitfalls: never parse the whole array into a fixed-size integer; the input may be longer than native integer capacity.`,
        time: 'O(n)',
        space: 'O(n)',
        python: `class Solution:
    def plusOne(self, digits: List[int]) -> List[int]:
        chars = [str(d) for d in digits]
        carry = 1
        for i in range(len(chars) - 1, -1, -1):
            value = ord(chars[i]) - ord('0') + carry
            chars[i] = str(value % 10)
            carry = value // 10
            if carry == 0:
                break
        if carry:
            chars.insert(0, '1')
        return [ord(ch) - ord('0') for ch in chars]
`,
        cpp: `class Solution {
public:
    vector<int> plusOne(vector<int>& digits) {
        string s;
        for (int d : digits) s.push_back(char('0' + d));
        int carry = 1;
        for (int i = (int)s.size() - 1; i >= 0; --i) {
            int value = s[i] - '0' + carry;
            s[i] = char('0' + value % 10);
            carry = value / 10;
            if (!carry) break;
        }
        if (carry) s.insert(s.begin(), '1');
        vector<int> ans;
        for (char ch : s) ans.push_back(ch - '0');
        return ans;
    }
};`,
      },
      {
        title: 'In-Place Carry Propagation',
        explanation: `Intuition: only a suffix of 9s can change beyond the last digit.

1. Walk from the last digit toward the first.
2. If the current digit is less than 9, increment it and return immediately.
3. If the current digit is 9, set it to 0 and continue carrying.
4. If the loop finishes, all digits were 9, so put 1 at the front.

Correctness argument: each trailing 9 becomes 0 because adding the carry makes 10. The first non-9 digit absorbs the carry and all more significant digits stay unchanged. If no such digit exists, the correct decimal result is 1 followed by n zeros.

Pitfalls: handle [0] as a normal non-9 digit, returning [1].`,
        time: 'O(n)',
        space: 'O(1) extra, not counting a possible leading digit',
        python: `class Solution:
    def plusOne(self, digits: List[int]) -> List[int]:
        for i in range(len(digits) - 1, -1, -1):
            if digits[i] < 9:
                digits[i] += 1
                return digits
            digits[i] = 0
        return [1] + digits
`,
        cpp: `class Solution {
public:
    vector<int> plusOne(vector<int>& digits) {
        for (int i = (int)digits.size() - 1; i >= 0; --i) {
            if (digits[i] < 9) {
                ++digits[i];
                return digits;
            }
            digits[i] = 0;
        }
        digits.insert(digits.begin(), 1);
        return digits;
    }
};`,
      },
    ],
  },
  {
    id: 'powx-n',
    title: 'Pow(x, n)',
    number: 50,
    difficulty: 'Medium',
    category: 'Math & Geometry',
    pattern: 'Binary Exponentiation',
    description: `Implement myPow(x, n), returning x raised to the integer power n as a double.

Negative exponents mean taking the reciprocal. The exponent can be the minimum 32-bit integer, so convert it to a wider type before negating it.`,
    examples: [
      {
        input: 'x = 2.0, n = 10',
        output: '1024.0',
        explanation: 'Repeated squaring computes 2 to the tenth power.',
      },
      {
        input: 'x = 2.1, n = 3',
        output: '9.261',
        explanation: '2.1 multiplied three times is approximately 9.261.',
      },
      {
        input: 'x = 2.0, n = -2',
        output: '0.25',
        explanation: 'A negative exponent returns 1 divided by 2 squared.',
      },
    ],
    constraints: [
      '-100.0 < x < 100.0',
      '-2^31 <= n <= 2^31 - 1',
      'n is an integer.',
      'Results fit within normal double precision for the tests.',
    ],
    hints: [
      'Squaring the base lets one multiplication account for two powers at a time.',
      'Use the binary representation of the absolute exponent.',
      'Convert n to a 64-bit value before taking abs so INT_MIN is safe.',
    ],
    signature: { kind: 'function', name: 'myPow', params: [{ name: 'x', type: 'double' }, { name: 'n', type: 'int' }], returns: 'double' },
    tests: [
      { args: [2.0, 10], expected: 1024.0 },
      { args: [2.1, 3], expected: 9.261000000000001 },
      { args: [2.0, -2], expected: 0.25 },
      { args: [1.0, 2147483647], expected: 1.0 },
      { args: [-1.0, 2147483647], expected: -1.0 },
      { args: [-1.0, -2147483648], expected: 1.0 },
      { args: [0.0, 5], expected: 0.0 },
      { args: [-2.0, 3], expected: -8.0 },
      { args: [2.0, 0], expected: 1.0 },
      { args: [1.5, -2], expected: 0.4444444444444444 },
    ],
    solutions: [
      {
        title: 'Recursive Squaring',
        explanation: `Intuition: split the exponent in half, compute that smaller power once, and reuse it.

1. Work with the absolute value of n.
2. Recursively compute x to the floor of exp divided by 2.
3. Square that half result.
4. If exp is odd, multiply by one extra x.
5. Take the reciprocal when the original exponent was negative.

Correctness argument: for every exponent e, x^e equals x^(e/2) squared when e is even, and that product times x when e is odd. The recursion bottoms out at exponent 0, so by induction it returns the correct positive power; the reciprocal step applies the definition of negative exponents.

Pitfalls: using abs on a 32-bit integer can overflow for INT_MIN in C++; widen first.`,
        time: 'O(log |n|)',
        space: 'O(log |n|) recursion depth',
        python: `class Solution:
    def myPow(self, x: float, n: int) -> float:
        def power(base, exp):
            if exp == 0:
                return 1.0
            half = power(base, exp // 2)
            ans = half * half
            if exp % 2 == 1:
                ans *= base
            return ans

        exp = abs(n)
        ans = power(x, exp)
        return ans if n >= 0 else 1.0 / ans
`,
        cpp: `class Solution {
    double power(double x, long long exp) {
        if (exp == 0) return 1.0;
        double half = power(x, exp / 2);
        double ans = half * half;
        if (exp % 2 == 1) ans *= x;
        return ans;
    }
public:
    double myPow(double x, int n) {
        long long exp = n;
        bool neg = exp < 0;
        if (neg) exp = -exp;
        double ans = power(x, exp);
        return neg ? 1.0 / ans : ans;
    }
};`,
      },
      {
        title: 'Iterative Binary Exponentiation',
        explanation: `Intuition: the exponent is a sum of powers of two, so multiply the answer only for set bits.

1. If n is negative, invert x and use the positive exponent.
2. Keep ans as the product built so far.
3. While exp is positive, multiply ans by the current base when the lowest bit is set.
4. Square the base and shift exp right one bit.

Correctness argument: after processing each bit, ans contains exactly the factors for set bits already seen, while base equals x raised to the next power of two. When all bits are consumed, the product covers every set bit of the exponent, which is x^abs(n); inverting the base handled negative n.

Pitfalls: do not loop abs(n) times; large exponents require logarithmic work.`,
        time: 'O(log |n|)',
        space: 'O(1)',
        python: `class Solution:
    def myPow(self, x: float, n: int) -> float:
        exp = n
        if exp < 0:
            x = 1.0 / x
            exp = -exp
        ans = 1.0
        while exp:
            if exp & 1:
                ans *= x
            x *= x
            exp >>= 1
        return ans
`,
        cpp: `class Solution {
public:
    double myPow(double x, int n) {
        long long exp = n;
        if (exp < 0) {
            x = 1.0 / x;
            exp = -exp;
        }
        double ans = 1.0;
        while (exp > 0) {
            if (exp & 1LL) ans *= x;
            x *= x;
            exp >>= 1;
        }
        return ans;
    }
};`,
      },
    ],
  },
  {
    id: 'multiply-strings',
    title: 'Multiply Strings',
    number: 43,
    difficulty: 'Medium',
    category: 'Math & Geometry',
    pattern: 'Decimal Simulation',
    description: `Given two non-negative integers as decimal strings, return their product as a decimal string.

Do not rely on converting the whole input into a built-in integer type. Simulate the arithmetic digit by digit so very long inputs still work.`,
    examples: [
      {
        input: 'num1 = "2", num2 = "3"',
        output: '"6"',
        explanation: 'Single-digit multiplication gives the result directly.',
      },
      {
        input: 'num1 = "123", num2 = "456"',
        output: '"56088"',
        explanation: 'The partial products combine to 56088.',
      },
      {
        input: 'num1 = "0", num2 = "52"',
        output: '"0"',
        explanation: 'Any number multiplied by zero is zero.',
      },
    ],
    constraints: [
      '1 <= num1.length, num2.length <= 200',
      'num1 and num2 contain only digits.',
      'Neither input has leading zero unless it is exactly "0".',
      'Return the product without leading zero.',
    ],
    hints: [
      'Multiply one digit at a time, just like written multiplication.',
      'The product of positions i and j contributes to positions i + j and i + j + 1 in the result array.',
      'Trim leading zeros after all carry propagation is complete.',
    ],
    signature: { kind: 'function', name: 'multiply', params: [{ name: 'num1', type: 'string' }, { name: 'num2', type: 'string' }], returns: 'string' },
    tests: [
      { args: ['2', '3'], expected: '6' },
      { args: ['123', '456'], expected: '56088' },
      { args: ['0', '52'], expected: '0' },
      { args: ['9', '9'], expected: '81' },
      { args: ['999', '999'], expected: '998001' },
      { args: ['1', '123456789'], expected: '123456789' },
      { args: ['987654321', '123456789'], expected: '121932631112635269' },
      { args: ['1000', '1000'], expected: '1000000' },
    ],
    solutions: [
      {
        title: 'Add Shifted Partial Products',
        explanation: `Intuition: written multiplication creates one partial product for each digit of the second number and shifts it by its place value.

1. Define helpers for adding two non-negative decimal strings and multiplying a string by one digit.
2. Walk digits of num2 from right to left.
3. Multiply num1 by that digit, append the needed number of trailing zeros, and add it to the running answer.
4. Return the accumulated string.

Correctness argument: each partial product equals num1 times one digit of num2 times the correct power of ten. Summing all partial products reconstructs num1 times the full value of num2 by decimal expansion.

Pitfalls: keep carries as integers but never parse the whole input as an integer.`,
        time: 'O(mn + nL), where L is the output length during additions',
        space: 'O(m + n)',
        python: `class Solution:
    def multiply(self, num1: str, num2: str) -> str:
        if num1 == '0' or num2 == '0':
            return '0'

        def add(a, b):
            i, j, carry = len(a) - 1, len(b) - 1, 0
            out = []
            while i >= 0 or j >= 0 or carry:
                total = carry
                if i >= 0:
                    total += ord(a[i]) - ord('0')
                    i -= 1
                if j >= 0:
                    total += ord(b[j]) - ord('0')
                    j -= 1
                out.append(str(total % 10))
                carry = total // 10
            return ''.join(reversed(out))

        def multiply_digit(a, digit):
            carry = 0
            out = []
            for ch in reversed(a):
                total = (ord(ch) - ord('0')) * digit + carry
                out.append(str(total % 10))
                carry = total // 10
            if carry:
                out.append(str(carry))
            return ''.join(reversed(out))

        ans = '0'
        zeros = 0
        for ch in reversed(num2):
            part = multiply_digit(num1, ord(ch) - ord('0'))
            if part != '0':
                part += '0' * zeros
            ans = add(ans, part)
            zeros += 1
        return ans
`,
        cpp: `class Solution {
    string addStrings(const string& a, const string& b) {
        int i = a.size() - 1, j = b.size() - 1, carry = 0;
        string out;
        while (i >= 0 || j >= 0 || carry) {
            int total = carry;
            if (i >= 0) total += a[i--] - '0';
            if (j >= 0) total += b[j--] - '0';
            out.push_back(char('0' + total % 10));
            carry = total / 10;
        }
        reverse(out.begin(), out.end());
        return out;
    }

    string multiplyDigit(const string& a, int digit) {
        int carry = 0;
        string out;
        for (int i = (int)a.size() - 1; i >= 0; --i) {
            int total = (a[i] - '0') * digit + carry;
            out.push_back(char('0' + total % 10));
            carry = total / 10;
        }
        if (carry) out.push_back(char('0' + carry));
        reverse(out.begin(), out.end());
        return out;
    }
public:
    string multiply(string num1, string num2) {
        if (num1 == "0" || num2 == "0") return "0";
        string ans = "0";
        int zeros = 0;
        for (int i = (int)num2.size() - 1; i >= 0; --i) {
            string part = multiplyDigit(num1, num2[i] - '0');
            if (part != "0") part += string(zeros, '0');
            ans = addStrings(ans, part);
            ++zeros;
        }
        return ans;
    }
};`,
      },
      {
        title: 'Single Result Array',
        explanation: `Intuition: reserve all result digits first, then accumulate every pairwise digit product into its final decimal positions.

1. Allocate an array of length m + n filled with zeros.
2. For every pair of digits, add their product to index i + j + 1.
3. Carry the tens portion into index i + j.
4. Skip leading zeros and build the final string.

Correctness argument: the product of digit i in num1 and digit j in num2 contributes to decimal place i + j + 1 from the right-aligned result. Immediate carry propagation keeps every lower slot below 10 while preserving total value. After all pairs are processed, the array stores the exact decimal expansion.

Pitfalls: if all digits are zero, return exactly "0" rather than an empty string.`,
        time: 'O(mn)',
        space: 'O(m + n)',
        python: `class Solution:
    def multiply(self, num1: str, num2: str) -> str:
        if num1 == '0' or num2 == '0':
            return '0'
        m, n = len(num1), len(num2)
        pos = [0] * (m + n)
        for i in range(m - 1, -1, -1):
            for j in range(n - 1, -1, -1):
                product = (ord(num1[i]) - ord('0')) * (ord(num2[j]) - ord('0'))
                total = product + pos[i + j + 1]
                pos[i + j + 1] = total % 10
                pos[i + j] += total // 10
        start = 0
        while start < len(pos) - 1 and pos[start] == 0:
            start += 1
        return ''.join(str(d) for d in pos[start:])
`,
        cpp: `class Solution {
public:
    string multiply(string num1, string num2) {
        if (num1 == "0" || num2 == "0") return "0";
        int m = num1.size(), n = num2.size();
        vector<int> pos(m + n, 0);
        for (int i = m - 1; i >= 0; --i) {
            for (int j = n - 1; j >= 0; --j) {
                int product = (num1[i] - '0') * (num2[j] - '0');
                int total = product + pos[i + j + 1];
                pos[i + j + 1] = total % 10;
                pos[i + j] += total / 10;
            }
        }
        int start = 0;
        while (start < (int)pos.size() - 1 && pos[start] == 0) ++start;
        string ans;
        for (int i = start; i < (int)pos.size(); ++i) ans.push_back(char('0' + pos[i]));
        return ans;
    }
};`,
      },
    ],
  },
  {
    id: 'detect-squares',
    title: 'Detect Squares',
    number: 2013,
    difficulty: 'Medium',
    category: 'Math & Geometry',
    pattern: 'Coordinate Counting',
    description: `Design a data structure that receives points on a 2D integer grid. add(point) records another occurrence of that point, and count(point) returns how many axis-aligned squares can be formed using point as one corner and previously added points as the other three corners.

Duplicate added points count as separate choices, so multiplicities multiply.`,
    examples: [
      {
        input: 'ops = [DetectSquares, add, add, add, count, count, add, count], args = [[], [[3,10]], [[11,2]], [[3,2]], [[11,10]], [[14,8]], [[11,2]], [[11,10]]]',
        output: '[null,null,null,null,1,0,null,2]',
        explanation: 'After adding the duplicate [11,2], the same geometric square can be chosen in two ways.',
      },
      {
        input: 'ops = [DetectSquares, add, add, add, count, add, count], args = [[], [[0,0]], [[0,1]], [[1,0]], [[1,1]], [[1,0]], [[1,1]]]',
        output: '[null,null,null,null,1,null,2]',
        explanation: 'A duplicate bottom-left corner doubles the count for the query.',
      },
      {
        input: 'ops = [DetectSquares, add, add, add, add, count], args = [[], [[5,5]], [[5,6]], [[6,5]], [[6,6]], [[5,5]]]',
        output: '[null,null,null,null,null,1]',
        explanation: 'The four unit-square corners are present once.',
      },
    ],
    constraints: [
      '0 <= point[0], point[1] <= 1000',
      'At most 3000 calls are made.',
      'add receives an integer point with two coordinates.',
      'count uses the query point as one square corner.',
    ],
    hints: [
      'For a query corner, another point can serve as the opposite diagonal only if horizontal and vertical distances match.',
      'Once a diagonal is chosen, the other two corners are determined.',
      'Grouping points by x-coordinate reduces count work to points in the same vertical line as the query.',
    ],
    signature: {
      kind: 'class',
      className: 'DetectSquares',
      ctorParams: [],
      methods: [
        { name: 'add', params: [{ name: 'point', type: 'int[]' }], returns: 'void' },
        { name: 'count', params: [{ name: 'point', type: 'int[]' }], returns: 'int' },
      ],
    },
    tests: [
      {
        ops: ['DetectSquares', 'add', 'add', 'add', 'count', 'count', 'add', 'count'],
        args: [[], [[3, 10]], [[11, 2]], [[3, 2]], [[11, 10]], [[14, 8]], [[11, 2]], [[11, 10]]],
        expected: [null, null, null, null, 1, 0, null, 2],
      },
      {
        ops: ['DetectSquares', 'add', 'add', 'add', 'count', 'add', 'count'],
        args: [[], [[0, 0]], [[0, 1]], [[1, 0]], [[1, 1]], [[1, 0]], [[1, 1]]],
        expected: [null, null, null, null, 1, null, 2],
      },
      {
        ops: ['DetectSquares', 'add', 'add', 'add', 'add', 'count'],
        args: [[], [[5, 5]], [[5, 6]], [[6, 5]], [[6, 6]], [[5, 5]]],
        expected: [null, null, null, null, null, 1],
      },
      {
        ops: ['DetectSquares', 'count'],
        args: [[], [[10, 10]]],
        expected: [null, 0],
      },
      {
        ops: ['DetectSquares', 'add', 'add', 'add', 'count'],
        args: [[], [[2, 2]], [[2, 5]], [[2, 8]], [[5, 5]]],
        expected: [null, null, null, null, 0],
      },
      {
        ops: ['DetectSquares', 'add', 'add', 'add', 'add', 'add', 'add', 'add', 'count'],
        args: [[], [[0, 0]], [[0, 2]], [[2, 0]], [[2, 2]], [[0, 1]], [[1, 0]], [[1, 1]], [[0, 0]]],
        expected: [null, null, null, null, null, null, null, null, 2],
      },
      {
        ops: ['DetectSquares', 'add', 'add', 'add', 'add', 'add', 'add', 'add', 'add', 'add', 'count'],
        args: [[], [[1, 1]], [[1, 1]], [[1, 1]], [[1, 1]], [[1, 2]], [[1, 2]], [[2, 1]], [[2, 1]], [[2, 1]], [[2, 2]]],
        expected: [null, null, null, null, null, null, null, null, null, null, 24],
      },
      {
        ops: ['DetectSquares', 'add', 'add', 'add', 'count', 'add', 'count'],
        args: [[], [[0, 0]], [[1, 1]], [[2, 2]], [[0, 2]], [[2, 0]], [[0, 2]]],
        expected: [null, null, null, null, 0, null, 1],
      },
    ],
    solutions: [
      {
        title: 'Enumerate Diagonal Points',
        explanation: `Intuition: for a square with the query as one corner, the opposite diagonal corner determines the other two corners.

1. Store a frequency for every added point.
2. During count, scan every unique added point as a possible diagonal.
3. Keep only candidates whose horizontal and vertical distances from the query are equal and nonzero.
4. Multiply the frequency of the diagonal point by the frequencies of the two required side corners.

Correctness argument: every axis-aligned square containing the query has exactly one opposite diagonal corner with equal nonzero horizontal and vertical offsets. The two remaining corners are forced, and multiplying frequencies counts every duplicate choice. Conversely, every counted diagonal and side-corner combination forms a valid square.

Pitfalls: points on the same row or same column as the query cannot be diagonal corners.`,
        time: 'O(U) per count, where U is the number of unique points',
        space: 'O(U)',
        python: `class DetectSquares:
    def __init__(self):
        self.freq = Counter()

    def add(self, point: List[int]) -> None:
        self.freq[(point[0], point[1])] += 1

    def count(self, point: List[int]) -> int:
        x, y = point
        total = 0
        for (px, py), diag in self.freq.items():
            if px == x or abs(px - x) != abs(py - y):
                continue
            total += diag * self.freq[(x, py)] * self.freq[(px, y)]
        return total
`,
        cpp: `class DetectSquares {
    map<pair<int, int>, int> freq;
public:
    DetectSquares() {}

    void add(vector<int> point) {
        ++freq[{point[0], point[1]}];
    }

    int count(vector<int> point) {
        int x = point[0], y = point[1];
        long long total = 0;
        for (auto& entry : freq) {
            int px = entry.first.first;
            int py = entry.first.second;
            int diag = entry.second;
            if (px == x || abs(px - x) != abs(py - y)) continue;
            total += 1LL * diag * freq[{x, py}] * freq[{px, y}];
        }
        return (int)total;
    }
};`,
      },
      {
        title: 'Group Points by X Coordinate',
        explanation: `Intuition: choose the square side length from another point in the same vertical line as the query, then look left and right for the matching side.

1. Store total point frequencies and, separately, y-frequency maps for each x-coordinate.
2. For a query (x, y), iterate over all y2 values already seen at x.
3. The side length is y2 - y. Check both x + side and x - side.
4. Add same-column multiplicity times the two opposite-corner multiplicities.

Correctness argument: any square using the query has another corner directly above or below it at the same x-coordinate. Iterating y2 visits that corner and fixes the side length. Checking both horizontal directions covers squares on either side, and multiplying stored frequencies counts all duplicate point selections.

Pitfalls: skip y2 equal to y, because that gives side length zero and not a square.`,
        time: 'O(K) per count, where K is the number of distinct y-values at the query x-coordinate',
        space: 'O(U)',
        python: `class DetectSquares:
    def __init__(self):
        self.points = Counter()
        self.by_x = defaultdict(Counter)

    def add(self, point: List[int]) -> None:
        x, y = point
        self.points[(x, y)] += 1
        self.by_x[x][y] += 1

    def count(self, point: List[int]) -> int:
        x, y = point
        total = 0
        for y2, same_col in self.by_x[x].items():
            if y2 == y:
                continue
            side = y2 - y
            for x2 in (x + side, x - side):
                total += same_col * self.points[(x2, y)] * self.points[(x2, y2)]
        return total
`,
        cpp: `class DetectSquares {
    map<pair<int, int>, int> points;
    unordered_map<int, unordered_map<int, int>> byX;

    int getPoint(int x, int y) {
        auto it = points.find({x, y});
        return it == points.end() ? 0 : it->second;
    }
public:
    DetectSquares() {}

    void add(vector<int> point) {
        int x = point[0], y = point[1];
        ++points[{x, y}];
        ++byX[x][y];
    }

    int count(vector<int> point) {
        int x = point[0], y = point[1];
        auto it = byX.find(x);
        if (it == byX.end()) return 0;
        long long total = 0;
        for (auto& entry : it->second) {
            int y2 = entry.first;
            int sameCol = entry.second;
            if (y2 == y) continue;
            int side = y2 - y;
            int x1 = x + side;
            int x2 = x - side;
            total += 1LL * sameCol * getPoint(x1, y) * getPoint(x1, y2);
            total += 1LL * sameCol * getPoint(x2, y) * getPoint(x2, y2);
        }
        return (int)total;
    }
};`,
      },
    ],
  },
]

export default problems
