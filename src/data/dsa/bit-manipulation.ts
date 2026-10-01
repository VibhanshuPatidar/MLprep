import type { DsaProblem } from '../../types/content'

const problems: DsaProblem[] = [
  {
    id: 'single-number',
    title: 'Single Number',
    number: 136,
    difficulty: 'Easy',
    category: 'Bit Manipulation',
    pattern: 'XOR Cancellation',
    description: `Given an integer array where every value appears exactly twice except for one value that appears once, return the lone value.

The order of the numbers is arbitrary, and the unique value may be negative or zero.`,
    examples: [
      {
        input: 'nums = [2,2,1]',
        output: '1',
        explanation: 'The two 2s cancel, leaving 1.',
      },
      {
        input: 'nums = [4,1,2,1,2]',
        output: '4',
        explanation: 'Both 1 and 2 appear twice.',
      },
      {
        input: 'nums = [1]',
        output: '1',
        explanation: 'The only element is the answer.',
      },
    ],
    constraints: [
      '1 <= nums.length <= 30000',
      '-2^31 <= nums[i] <= 2^31 - 1',
      'Exactly one element appears once.',
      'Every other element appears exactly twice.',
    ],
    hints: [
      'A frequency table makes the duplicate structure obvious.',
      'XORing a number with itself gives zero.',
      'XOR all values together; pairs disappear and the single value remains.',
    ],
    signature: { kind: 'function', name: 'singleNumber', params: [{ name: 'nums', type: 'int[]' }], returns: 'int' },
    tests: [
      { args: [[2, 2, 1]], expected: 1 },
      { args: [[4, 1, 2, 1, 2]], expected: 4 },
      { args: [[1]], expected: 1 },
      { args: [[-1, 2, 2]], expected: -1 },
      { args: [[-3, -3, -7]], expected: -7 },
      { args: [[0, 1, 0]], expected: 1 },
      { args: [[2147483647, 0, 2147483647]], expected: 0 },
      { args: [[-2147483648, 5, 5]], expected: -2147483648 },
    ],
    solutions: [
      {
        title: 'Count Frequencies',
        explanation: `Intuition: the element that appears once is exactly the one with frequency one.

1. Count how often every number appears.
2. Scan the frequency table.
3. Return the key whose count is one.

Correctness argument: the input promise says all non-answer values have count two and exactly one value has count one. The frequency table records those counts exactly, so returning the count-one key returns the unique value.

Pitfalls: negative numbers are valid keys; do not use an array indexed directly by value.`,
        time: 'O(n)',
        space: 'O(n)',
        python: `class Solution:
    def singleNumber(self, nums: List[int]) -> int:
        counts = Counter(nums)
        for value, count in counts.items():
            if count == 1:
                return value
        return 0
`,
        cpp: `class Solution {
public:
    int singleNumber(vector<int>& nums) {
        unordered_map<int, int> counts;
        for (int x : nums) ++counts[x];
        for (auto& entry : counts) {
            if (entry.second == 1) return entry.first;
        }
        return 0;
    }
};`,
      },
      {
        title: 'XOR All Values',
        explanation: `Intuition: XOR is its own inverse, so paired values erase each other without extra storage.

1. Start ans at zero.
2. XOR ans with every value in the array.
3. Return ans.

Correctness argument: XOR is associative and commutative, so the numbers may be grouped by value. Each duplicate pair contributes x XOR x, which is zero, and zero does not change the remaining value. Therefore only the single number remains.

Pitfalls: use bitwise XOR, not logical exclusive-or or addition.`,
        time: 'O(n)',
        space: 'O(1)',
        python: `class Solution:
    def singleNumber(self, nums: List[int]) -> int:
        ans = 0
        for x in nums:
            ans ^= x
        return ans
`,
        cpp: `class Solution {
public:
    int singleNumber(vector<int>& nums) {
        int ans = 0;
        for (int x : nums) ans ^= x;
        return ans;
    }
};`,
      },
    ],
    viz: 'bit-ops',
  },
  {
    id: 'number-of-1-bits',
    title: 'Number of 1 Bits',
    number: 191,
    difficulty: 'Easy',
    category: 'Bit Manipulation',
    pattern: 'Bit Counting',
    description: `Given a positive integer n, return how many binary positions contain a 1 bit.

The value is treated as a normal positive integer for this problem signature.`,
    examples: [
      {
        input: 'n = 11',
        output: '3',
        explanation: 'Binary 1011 has three set bits.',
      },
      {
        input: 'n = 128',
        output: '1',
        explanation: '128 is a power of two, so only one bit is set.',
      },
      {
        input: 'n = 2147483645',
        output: '30',
        explanation: 'All but one of the lower 31 bits are set.',
      },
    ],
    constraints: [
      '1 <= n <= 2^31 - 1',
      'n is passed as an int.',
      'Return the count of 1 bits in the binary representation.',
    ],
    hints: [
      'Check the lowest bit with n & 1, then shift right.',
      'There is a trick that removes the lowest set bit in one operation.',
      'Repeatedly apply n = n & (n - 1) and count how many times it runs.',
    ],
    signature: { kind: 'function', name: 'hammingWeight', params: [{ name: 'n', type: 'int' }], returns: 'int' },
    tests: [
      { args: [11], expected: 3 },
      { args: [128], expected: 1 },
      { args: [2147483645], expected: 30 },
      { args: [1], expected: 1 },
      { args: [2], expected: 1 },
      { args: [7], expected: 3 },
      { args: [1023], expected: 10 },
      { args: [2147483647], expected: 31 },
    ],
    solutions: [
      {
        title: 'Scan Bits One by One',
        explanation: `Intuition: the lowest bit tells whether the current number contributes one to the answer.

1. Initialize a counter to zero.
2. While n is positive, add n & 1 to the counter.
3. Shift n right by one bit.
4. Return the counter.

Correctness argument: each loop examines exactly one binary digit, from least significant to most significant. Shifting discards the bit just counted, so every bit is counted once and only set bits add one.

Pitfalls: this signature uses positive ints; for unsigned variants, use an unsigned type before shifting.`,
        time: 'O(w), where w is the number of bits',
        space: 'O(1)',
        python: `class Solution:
    def hammingWeight(self, n: int) -> int:
        count = 0
        while n:
            count += n & 1
            n >>= 1
        return count
`,
        cpp: `class Solution {
public:
    int hammingWeight(int n) {
        unsigned int x = (unsigned int)n;
        int count = 0;
        while (x) {
            count += x & 1u;
            x >>= 1;
        }
        return count;
    }
};`,
      },
      {
        title: 'Clear the Lowest Set Bit',
        explanation: `Intuition: n & (n - 1) drops exactly the rightmost 1 bit and leaves higher bits unchanged.

1. Convert n to an unsigned working value.
2. While the value is nonzero, replace it with value & (value - 1).
3. Count how many replacements were needed.

Correctness argument: subtracting one flips the lowest set bit to zero and all lower zeros to one. ANDing with the original clears that lowest set bit while preserving all others. Therefore each loop removes exactly one 1 bit, so the number of loops equals the answer.

Pitfalls: the loop count depends on the number of set bits, not on the numeric value.`,
        time: 'O(s), where s is the number of set bits',
        space: 'O(1)',
        python: `class Solution:
    def hammingWeight(self, n: int) -> int:
        count = 0
        while n:
            n &= n - 1
            count += 1
        return count
`,
        cpp: `class Solution {
public:
    int hammingWeight(int n) {
        unsigned int x = (unsigned int)n;
        int count = 0;
        while (x) {
            x &= x - 1;
            ++count;
        }
        return count;
    }
};`,
      },
    ],
    viz: 'bit-ops',
  },
  {
    id: 'counting-bits',
    title: 'Counting Bits',
    number: 338,
    difficulty: 'Easy',
    category: 'Bit Manipulation',
    pattern: 'Bit DP',
    description: `For every integer i from 0 through n, compute how many 1 bits appear in the binary representation of i. Return the counts in an array of length n + 1.

The first element is always the count for zero.`,
    examples: [
      {
        input: 'n = 2',
        output: '[0,1,1]',
        explanation: '0 has no set bits, while 1 and 2 each have one.',
      },
      {
        input: 'n = 5',
        output: '[0,1,1,2,1,2]',
        explanation: '3 and 5 each have two set bits.',
      },
      {
        input: 'n = 0',
        output: '[0]',
        explanation: 'Only zero is included.',
      },
    ],
    constraints: [
      '0 <= n <= 100000',
      'Return n + 1 integers.',
      'ans[i] is the number of set bits in i.',
    ],
    hints: [
      'You can count each number independently using the hamming-weight trick.',
      'i shifted right by one has all bits of i except the lowest bit.',
      'Use ans[i] = ans[i >> 1] + (i & 1).',
    ],
    signature: { kind: 'function', name: 'countBits', params: [{ name: 'n', type: 'int' }], returns: 'int[]' },
    tests: [
      { args: [2], expected: [0, 1, 1] },
      { args: [5], expected: [0, 1, 1, 2, 1, 2] },
      { args: [0], expected: [0] },
      { args: [1], expected: [0, 1] },
      { args: [10], expected: [0, 1, 1, 2, 1, 2, 2, 3, 1, 2, 2] },
      { args: [16], expected: [0, 1, 1, 2, 1, 2, 2, 3, 1, 2, 2, 3, 2, 3, 3, 4, 1] },
      { args: [31], expected: [0, 1, 1, 2, 1, 2, 2, 3, 1, 2, 2, 3, 2, 3, 3, 4, 1, 2, 2, 3, 2, 3, 3, 4, 2, 3, 3, 4, 3, 4, 4, 5] },
      { args: [7], expected: [0, 1, 1, 2, 1, 2, 2, 3] },
    ],
    solutions: [
      {
        title: 'Count Each Number Separately',
        explanation: `Intuition: solve the single-number bit-counting problem for every value from 0 to n.

1. For each i, copy i into a working variable.
2. Clear its lowest set bit until it becomes zero.
3. Store the number of clear operations as ans[i].

Correctness argument: clearing the lowest set bit removes exactly one 1 bit at a time. Therefore the count for each i is correct, and filling every i from 0 through n produces the requested array.

Pitfalls: this repeats work between related numbers, which is fine for a baseline but not optimal.`,
        time: 'O(nw), where w is the bit width',
        space: 'O(1) extra besides the output',
        python: `class Solution:
    def countBits(self, n: int) -> List[int]:
        ans = []
        for i in range(n + 1):
            x = i
            count = 0
            while x:
                x &= x - 1
                count += 1
            ans.append(count)
        return ans
`,
        cpp: `class Solution {
public:
    vector<int> countBits(int n) {
        vector<int> ans;
        ans.reserve(n + 1);
        for (int i = 0; i <= n; ++i) {
            int x = i, count = 0;
            while (x) {
                x &= x - 1;
                ++count;
            }
            ans.push_back(count);
        }
        return ans;
    }
};`,
      },
      {
        title: 'Dynamic Programming from Half Values',
        explanation: `Intuition: dropping the last binary digit turns i into i divided by two, whose answer is already known.

1. Create ans with n + 1 zeros.
2. For i from 1 to n, read ans[i >> 1].
3. Add one if the dropped lowest bit was 1.
4. Store that sum in ans[i].

Correctness argument: the binary representation of i consists of the bits of i >> 1 followed by the lowest bit i & 1. The number of set bits is therefore ans[i >> 1] plus that lowest bit. Since i >> 1 is smaller than i, it has already been computed.

Pitfalls: start at 1; ans[0] is the base case.`,
        time: 'O(n)',
        space: 'O(1) extra besides the output',
        python: `class Solution:
    def countBits(self, n: int) -> List[int]:
        ans = [0] * (n + 1)
        for i in range(1, n + 1):
            ans[i] = ans[i >> 1] + (i & 1)
        return ans
`,
        cpp: `class Solution {
public:
    vector<int> countBits(int n) {
        vector<int> ans(n + 1, 0);
        for (int i = 1; i <= n; ++i) {
            ans[i] = ans[i >> 1] + (i & 1);
        }
        return ans;
    }
};`,
      },
    ],
    viz: 'bit-ops',
  },
  {
    id: 'reverse-bits',
    title: 'Reverse Bits',
    number: 190,
    difficulty: 'Easy',
    category: 'Bit Manipulation',
    pattern: 'Bit Reversal',
    description: `Given a 32-bit unsigned integer, reverse the order of its bits and return the resulting unsigned integer.

The least significant bit of the input becomes the most significant bit of the output, and so on for all 32 positions.`,
    examples: [
      {
        input: 'n = 43261596',
        output: '964176192',
        explanation: 'The 32-bit pattern is reversed end to end.',
      },
      {
        input: 'n = 4294967293',
        output: '3221225471',
        explanation: 'Unsigned values above 2^31 are still treated as 32-bit patterns.',
      },
      {
        input: 'n = 0',
        output: '0',
        explanation: 'All bits are zero, so the reversal is also zero.',
      },
    ],
    constraints: [
      '0 <= n <= 2^32 - 1',
      'The input and output are uint32 values.',
      'Exactly 32 bit positions are reversed.',
    ],
    hints: [
      'Build the answer by shifting it left and appending the current lowest bit of n.',
      'Run exactly 32 iterations, including leading zeros.',
      'For repeated calls, masks can swap 1-bit, 2-bit, 4-bit, 8-bit, and 16-bit groups.',
    ],
    signature: { kind: 'function', name: 'reverseBits', params: [{ name: 'n', type: 'uint32' }], returns: 'uint32' },
    tests: [
      { args: [43261596], expected: 964176192 },
      { args: [4294967293], expected: 3221225471 },
      { args: [0], expected: 0 },
      { args: [1], expected: 2147483648 },
      { args: [2147483648], expected: 1 },
      { args: [4294967295], expected: 4294967295 },
      { args: [2863311530], expected: 1431655765 },
      { args: [252645135], expected: 4042322160 },
    ],
    solutions: [
      {
        title: 'Shift One Bit at a Time',
        explanation: `Intuition: each iteration moves the next input bit into the next output position from the left.

1. Initialize result to zero.
2. Repeat 32 times.
3. Shift result left by one and append n & 1.
4. Shift n right by one.
5. Return result as an unsigned 32-bit value.

Correctness argument: on iteration k, the kth least significant bit of the original input is appended after k previous bits in result. After 32 iterations, every original bit has been appended in reverse order, so result is the reversed bit pattern.

Pitfalls: do not stop early when n becomes zero; leading zeros still need to move into low positions.`,
        time: 'O(32)',
        space: 'O(1)',
        python: `class Solution:
    def reverseBits(self, n: int) -> int:
        ans = 0
        for _ in range(32):
            ans = (ans << 1) | (n & 1)
            n >>= 1
        return ans
`,
        cpp: `class Solution {
public:
    uint32_t reverseBits(uint32_t n) {
        uint32_t ans = 0;
        for (int i = 0; i < 32; ++i) {
            ans = (ans << 1) | (n & 1u);
            n >>= 1;
        }
        return ans;
    }
};`,
      },
      {
        title: 'Parallel Bit Swaps',
        explanation: `Intuition: reverse the word by swapping progressively larger blocks of bits.

1. Swap adjacent 1-bit groups with masks 0x55555555 and 0xAAAAAAAA.
2. Swap adjacent 2-bit groups.
3. Swap nibbles, then bytes.
4. Swap the two 16-bit halves.

Correctness argument: after the first pass, every 2-bit block is reversed. After the second pass, every 4-bit block is reversed. Continuing with 4-bit, 8-bit, and 16-bit groups doubles the reversed block size each time, so after the final pass the entire 32-bit word is reversed.

Pitfalls: keep the value masked to 32 bits in languages with unbounded integers.`,
        time: 'O(1)',
        space: 'O(1)',
        python: `class Solution:
    def reverseBits(self, n: int) -> int:
        n &= 0xffffffff
        n = ((n & 0x55555555) << 1) | ((n >> 1) & 0x55555555)
        n = ((n & 0x33333333) << 2) | ((n >> 2) & 0x33333333)
        n = ((n & 0x0f0f0f0f) << 4) | ((n >> 4) & 0x0f0f0f0f)
        n = ((n & 0x00ff00ff) << 8) | ((n >> 8) & 0x00ff00ff)
        n = ((n & 0x0000ffff) << 16) | ((n >> 16) & 0x0000ffff)
        return n & 0xffffffff
`,
        cpp: `class Solution {
public:
    uint32_t reverseBits(uint32_t n) {
        n = ((n & 0x55555555u) << 1) | ((n >> 1) & 0x55555555u);
        n = ((n & 0x33333333u) << 2) | ((n >> 2) & 0x33333333u);
        n = ((n & 0x0f0f0f0fu) << 4) | ((n >> 4) & 0x0f0f0f0fu);
        n = ((n & 0x00ff00ffu) << 8) | ((n >> 8) & 0x00ff00ffu);
        n = (n << 16) | (n >> 16);
        return n;
    }
};`,
      },
    ],
    viz: 'bit-ops',
  },
  {
    id: 'missing-number',
    title: 'Missing Number',
    number: 268,
    difficulty: 'Easy',
    category: 'Bit Manipulation',
    pattern: 'XOR / Gauss Sum',
    description: `The array contains n distinct numbers chosen from the range 0 through n. Exactly one number from that range is absent. Return the missing value.

The input order is arbitrary, and zero may be the missing number.`,
    examples: [
      {
        input: 'nums = [3,0,1]',
        output: '2',
        explanation: 'The range is 0 through 3, and only 2 is absent.',
      },
      {
        input: 'nums = [0,1]',
        output: '2',
        explanation: 'The largest range value is missing.',
      },
      {
        input: 'nums = [9,6,4,2,3,5,7,0,1]',
        output: '8',
        explanation: 'All values 0 through 9 appear except 8.',
      },
    ],
    constraints: [
      'n == nums.length',
      '1 <= n <= 10000',
      '0 <= nums[i] <= n',
      'All nums[i] are distinct.',
    ],
    hints: [
      'A set can answer whether each value from 0 to n appears.',
      'The expected range and the actual array differ by exactly one value.',
      'XOR every index and every value; paired values cancel and the missing value remains.',
    ],
    signature: { kind: 'function', name: 'missingNumber', params: [{ name: 'nums', type: 'int[]' }], returns: 'int' },
    tests: [
      { args: [[3, 0, 1]], expected: 2 },
      { args: [[0, 1]], expected: 2 },
      { args: [[9, 6, 4, 2, 3, 5, 7, 0, 1]], expected: 8 },
      { args: [[0]], expected: 1 },
      { args: [[1]], expected: 0 },
      { args: [[0, 2]], expected: 1 },
      { args: [[1, 2, 3]], expected: 0 },
      { args: [[0, 1, 2, 3, 4, 5, 6, 7, 8, 10]], expected: 9 },
    ],
    solutions: [
      {
        title: 'Set Membership',
        explanation: `Intuition: the missing number is the only value in the full range that does not appear in the input set.

1. Put all array values into a set.
2. Check each candidate from 0 through n.
3. Return the first candidate not found in the set.

Correctness argument: the input has every range value except one. The set contains exactly the present values, so the only candidate not in the set is precisely the missing value.

Pitfalls: remember to check n itself; it can be the absent value.`,
        time: 'O(n)',
        space: 'O(n)',
        python: `class Solution:
    def missingNumber(self, nums: List[int]) -> int:
        seen = set(nums)
        for value in range(len(nums) + 1):
            if value not in seen:
                return value
        return -1
`,
        cpp: `class Solution {
public:
    int missingNumber(vector<int>& nums) {
        unordered_set<int> seen(nums.begin(), nums.end());
        for (int value = 0; value <= (int)nums.size(); ++value) {
            if (!seen.count(value)) return value;
        }
        return -1;
    }
};`,
      },
      {
        title: 'XOR the Range and Array',
        explanation: `Intuition: every present number appears once in the range and once in the array, so XOR cancels it out.

1. Start ans as n.
2. For each index i, XOR ans with i and nums[i].
3. Return ans.

Correctness argument: the XOR expression contains all values from 0 through n and also every present input value. Values present in the input occur twice and cancel to zero. The missing value occurs only in the range, so it remains as the final result.

Pitfalls: initializing with n accounts for the range value that has no matching index.`,
        time: 'O(n)',
        space: 'O(1)',
        python: `class Solution:
    def missingNumber(self, nums: List[int]) -> int:
        ans = len(nums)
        for i, value in enumerate(nums):
            ans ^= i
            ans ^= value
        return ans
`,
        cpp: `class Solution {
public:
    int missingNumber(vector<int>& nums) {
        int ans = nums.size();
        for (int i = 0; i < (int)nums.size(); ++i) {
            ans ^= i;
            ans ^= nums[i];
        }
        return ans;
    }
};`,
      },
    ],
    viz: 'bit-ops',
  },
  {
    id: 'sum-of-two-integers',
    title: 'Sum of Two Integers',
    number: 371,
    difficulty: 'Medium',
    category: 'Bit Manipulation',
    pattern: 'Bitwise Addition',
    description: `Return the sum of two signed integers without using ordinary addition for the combined value.

Use bit operations to model how binary addition combines sum bits and carry bits. Python solutions need explicit 32-bit masking so negative numbers behave like fixed-width two's-complement integers.`,
    examples: [
      {
        input: 'a = 1, b = 2',
        output: '3',
        explanation: 'The binary sum has no carry beyond the second bit.',
      },
      {
        input: 'a = 2, b = 3',
        output: '5',
        explanation: 'The low bit creates a carry into the 4s place.',
      },
      {
        input: 'a = -2, b = 3',
        output: '1',
        explanation: 'Two\'s-complement masking lets the carry process cross the sign bit correctly.',
      },
    ],
    constraints: [
      '-2^31 <= a, b <= 2^31 - 1',
      'The tested sums fit in signed 32-bit range.',
      'Use fixed-width two\'s-complement behavior for negative values.',
    ],
    hints: [
      'XOR gives the sum bits when carry is ignored.',
      'AND followed by a left shift gives the carry bits.',
      'Repeat until there is no carry, masking to 32 bits in Python.',
    ],
    signature: { kind: 'function', name: 'getSum', params: [{ name: 'a', type: 'int' }, { name: 'b', type: 'int' }], returns: 'int' },
    tests: [
      { args: [1, 2], expected: 3 },
      { args: [2, 3], expected: 5 },
      { args: [-2, 3], expected: 1 },
      { args: [-1, 1], expected: 0 },
      { args: [-5, -7], expected: -12 },
      { args: [0, 0], expected: 0 },
      { args: [2147483647, 0], expected: 2147483647 },
      { args: [-2147483648, 0], expected: -2147483648 },
      { args: [2147483647, -1], expected: 2147483646 },
      { args: [-2147483648, 1], expected: -2147483647 },
    ],
    solutions: [
      {
        title: 'Manual Full Adder Over 32 Bits',
        explanation: `Intuition: binary addition can be performed bit by bit with a carry, just as decimal addition is performed digit by digit.

1. Convert both inputs to their 32-bit two's-complement forms.
2. For each bit position, compute sum_bit as a_bit XOR b_bit XOR carry.
3. Compute the next carry from the majority of those three inputs.
4. Write set sum bits into the result.
5. Convert the unsigned 32-bit result back to a signed integer.

Correctness argument: a full adder truth table gives the exact output bit and carry for each binary column. Processing columns from low to high passes the correct carry to the next position, so after 32 positions the result is the fixed-width two's-complement sum.

Pitfalls: Python integers are unbounded, so the conversion back to signed form is required for negative answers.`,
        time: 'O(32)',
        space: 'O(1)',
        python: `class Solution:
    def getSum(self, a: int, b: int) -> int:
        mask = 0xffffffff
        ua = a & mask
        ub = b & mask
        ans = 0
        carry = 0
        for i in range(32):
            bit_a = (ua >> i) & 1
            bit_b = (ub >> i) & 1
            sum_bit = bit_a ^ bit_b ^ carry
            if sum_bit:
                ans |= 1 << i
            carry = (bit_a & bit_b) | (carry & (bit_a ^ bit_b))
        return ans if ans <= 0x7fffffff else ~(ans ^ mask)
`,
        cpp: `class Solution {
    int toSigned(unsigned int x) {
        if (x <= 0x7fffffffu) return (int)x;
        return (int)((long long)x - (1LL << 32));
    }
public:
    int getSum(int a, int b) {
        unsigned int ua = (unsigned int)a;
        unsigned int ub = (unsigned int)b;
        unsigned int ans = 0;
        unsigned int carry = 0;
        for (int i = 0; i < 32; ++i) {
            unsigned int bitA = (ua >> i) & 1u;
            unsigned int bitB = (ub >> i) & 1u;
            unsigned int sumBit = bitA ^ bitB ^ carry;
            if (sumBit) ans |= (1u << i);
            carry = (bitA & bitB) | (carry & (bitA ^ bitB));
        }
        return toSigned(ans);
    }
};`,
      },
      {
        title: 'Iterative XOR and Carry',
        explanation: `Intuition: XOR computes the partial sum without carries, while shifted AND computes exactly the carry that still needs to be added.

1. Mask both numbers to 32 bits.
2. While the carry value is nonzero, set partial to a XOR b.
3. Set carry to (a AND b) shifted left by one.
4. Repeat using partial as the new a and carry as the new b.
5. Convert the 32-bit result back to signed form.

Correctness argument: each iteration separates the addition into carry-free bits and carry bits. Recombining them in the next iteration preserves the total sum, and every carry moves left. In fixed width, carries eventually disappear, leaving the complete two's-complement sum.

Pitfalls: without a 32-bit mask, Python negative numbers keep infinitely many leading one bits and the loop may not terminate.`,
        time: 'O(32)',
        space: 'O(1)',
        python: `class Solution:
    def getSum(self, a: int, b: int) -> int:
        mask = 0xffffffff
        a &= mask
        b &= mask
        while b:
            partial = (a ^ b) & mask
            carry = ((a & b) << 1) & mask
            a, b = partial, carry
        return a if a <= 0x7fffffff else ~(a ^ mask)
`,
        cpp: `class Solution {
    int toSigned(unsigned int x) {
        if (x <= 0x7fffffffu) return (int)x;
        return (int)((long long)x - (1LL << 32));
    }
public:
    int getSum(int a, int b) {
        unsigned int x = (unsigned int)a;
        unsigned int y = (unsigned int)b;
        while (y != 0) {
            unsigned int partial = x ^ y;
            unsigned int carry = (x & y) << 1;
            x = partial;
            y = carry;
        }
        return toSigned(x);
    }
};`,
      },
    ],
    viz: 'bit-ops',
  },
  {
    id: 'reverse-integer',
    title: 'Reverse Integer',
    number: 7,
    difficulty: 'Medium',
    category: 'Bit Manipulation',
    pattern: 'Overflow-Safe Digits',
    description: `Given a signed 32-bit integer x, reverse its decimal digits and keep the original sign. If the reversed value is outside the signed 32-bit range, return 0.

Leading zeros disappear naturally because the result is an integer.`,
    examples: [
      {
        input: 'x = 123',
        output: '321',
        explanation: 'The digits are reversed directly.',
      },
      {
        input: 'x = -123',
        output: '-321',
        explanation: 'The sign is preserved after reversing the absolute value.',
      },
      {
        input: 'x = 120',
        output: '21',
        explanation: 'The reversed leading zero is dropped.',
      },
    ],
    constraints: [
      '-2^31 <= x <= 2^31 - 1',
      'Return 0 if the reversed value overflows signed 32-bit range.',
      'The sign of a nonzero valid answer matches the sign of x.',
    ],
    hints: [
      'A string reversal is a simple way to understand the transformation.',
      'For a numeric solution, pop the last digit with modulus and append it to the result.',
      'Before multiplying the result by 10, check whether doing so would exceed the 32-bit boundary.',
    ],
    signature: { kind: 'function', name: 'reverse', params: [{ name: 'x', type: 'int' }], returns: 'int' },
    tests: [
      { args: [123], expected: 321 },
      { args: [-123], expected: -321 },
      { args: [120], expected: 21 },
      { args: [0], expected: 0 },
      { args: [1534236469], expected: 0 },
      { args: [-2147483648], expected: 0 },
      { args: [1463847412], expected: 2147483641 },
      { args: [1563847412], expected: 0 },
      { args: [-120], expected: -21 },
      { args: [1000000003], expected: 0 },
    ],
    solutions: [
      {
        title: 'Reverse a String Representation',
        explanation: `Intuition: the digit order can be reversed directly after temporarily removing the sign.

1. Record whether x is negative.
2. Convert the absolute value to a string and reverse the string.
3. Convert the reversed digits back to a number and restore the sign.
4. Return 0 if the signed result is outside the 32-bit range.

Correctness argument: reversing the character sequence of the absolute value produces exactly the decimal digits in reverse order. Restoring the original sign gives the required signed value, and the explicit bounds check enforces the overflow rule.

Pitfalls: in C++, take the absolute value in a wider type so INT_MIN is safe.`,
        time: 'O(d), where d is the number of digits',
        space: 'O(d)',
        python: `class Solution:
    def reverse(self, x: int) -> int:
        sign = -1 if x < 0 else 1
        rev = int(str(abs(x))[::-1]) * sign
        if rev < -2**31 or rev > 2**31 - 1:
            return 0
        return rev
`,
        cpp: `class Solution {
public:
    int reverse(int x) {
        long long value = x;
        bool neg = value < 0;
        if (neg) value = -value;
        string s = to_string(value);
        std::reverse(s.begin(), s.end());
        long long rev = stoll(s);
        if (neg) rev = -rev;
        if (rev < INT_MIN || rev > INT_MAX) return 0;
        return (int)rev;
    }
};`,
      },
      {
        title: 'Pop Digits with Pre-Overflow Check',
        explanation: `Intuition: build the reversed number one digit at a time, but check the boundary before each append.

1. Work with the absolute value and remember the sign.
2. Pop the last digit with modulus 10.
3. Before ans = ans * 10 + digit, ensure ans will remain within the allowed positive limit.
4. Apply the sign and return the value if it is in range.

Correctness argument: each loop removes the next least significant digit from the input and appends it to the right side of ans, so after all digits are processed ans is the reversed absolute value. The limit check rejects exactly the steps that would exceed the signed 32-bit range.

Pitfalls: a negative input can have absolute value 2147483648, so use a wide working type.`,
        time: 'O(d)',
        space: 'O(1)',
        python: `class Solution:
    def reverse(self, x: int) -> int:
        sign = -1 if x < 0 else 1
        n = abs(x)
        limit = 2**31 - 1 if sign > 0 else 2**31
        ans = 0
        while n:
            n, digit = divmod(n, 10)
            if ans > (limit - digit) // 10:
                return 0
            ans = ans * 10 + digit
        ans *= sign
        if ans < -2**31 or ans > 2**31 - 1:
            return 0
        return ans
`,
        cpp: `class Solution {
public:
    int reverse(int x) {
        int sign = x < 0 ? -1 : 1;
        long long n = x;
        if (n < 0) n = -n;
        long long limit = sign > 0 ? (long long)INT_MAX : (1LL << 31);
        long long ans = 0;
        while (n > 0) {
            int digit = n % 10;
            n /= 10;
            if (ans > (limit - digit) / 10) return 0;
            ans = ans * 10 + digit;
        }
        ans *= sign;
        if (ans < INT_MIN || ans > INT_MAX) return 0;
        return (int)ans;
    }
};`,
      },
    ],
    viz: 'bit-ops',
  },
]

export default problems
