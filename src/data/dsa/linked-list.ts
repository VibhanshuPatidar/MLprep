import type { DsaProblem } from '../../types/content'

const problems: DsaProblem[] = [
  {
    id: "reverse-linked-list",
    title: "Reverse Linked List",
    number: 206,
    difficulty: "Easy",
    category: "Linked List",
    pattern: "Pointer Reversal",
    description: `Given the head of a singly linked list, implement reverseList to return the head of a list with the nodes in reverse order.

The values should appear from tail to head in the returned list.`,
    examples: [
      { input: "head = [1,2,3,4,5]", output: "[5,4,3,2,1]" },
      { input: "head = [1,2]", output: "[2,1]" },
      { input: "head = []", output: "[]" },
    ],
    constraints: ["0 <= list length <= 5000", "-5000 <= Node.val <= 5000", "The input is a standard singly linked list with no cycle."],
    hints: ["Think about where the current node next pointer should point after reversal.", "Remember the next node before overwriting cur.next.", "Walk with prev, cur, and next; return prev after the loop."],
    signature: {"kind": "function", "name": "reverseList", "params": [{"name": "head", "type": "ListNode"}], "returns": "ListNode"},
    tests: [
      { args: [[1, 2, 3, 4, 5]], expected: [5, 4, 3, 2, 1] },
      { args: [[1, 2]], expected: [2, 1] },
      { args: [[]], expected: [] },
      { args: [[7]], expected: [7] },
      { args: [[1, 1, 2]], expected: [2, 1, 1] },
      { args: [[-3, -2, -1, 0]], expected: [0, -1, -2, -3] },
      { args: [[5, 4, 3, 2, 1]], expected: [1, 2, 3, 4, 5] },
      { args: [[0, 0, 0]], expected: [0, 0, 0] },
    ],
    solutions: [
      {
        title: "Copy Values Backward",
        explanation: `**Intuition.** A simple way to produce reversed order is to store all values first.

**Steps.**
1. Traverse the list and collect values.
2. Create a new list by iterating those values backward.
3. Return the new head.

**Why it is correct.** The collected array preserves original order, so reading it backward emits exactly the reversed sequence.

**Pitfalls.** This creates new nodes and uses linear extra memory.`,
        time: "O(n)",
        space: "O(n)",
        python: `class Solution:
    def reverseList(self, head: Optional[ListNode]) -> Optional[ListNode]:
        values = []
        while head:
            values.append(head.val)
            head = head.next
        dummy = ListNode()
        cur = dummy
        for value in reversed(values):
            cur.next = ListNode(value)
            cur = cur.next
        return dummy.next
`,
        cpp: `class Solution {
public:
    ListNode* reverseList(ListNode* head) {
        vector<int> values;
        for (ListNode* cur = head; cur; cur = cur->next) values.push_back(cur->val);
        ListNode dummy;
        ListNode* cur = &dummy;
        for (auto it = values.rbegin(); it != values.rend(); ++it) {
            cur->next = new ListNode(*it);
            cur = cur->next;
        }
        return dummy.next;
    }
};`,
      },
      {
        title: "Iterative Pointer Reversal",
        explanation: `**Intuition.** Reverse each edge as you pass it while keeping access to the unreversed suffix.

**Steps.**
1. Start prev as null and cur as head.
2. Save cur.next before changing it.
3. Point cur.next to prev.
4. Advance prev and cur until the suffix is empty.

**Why it is correct.** After each step prev is the reversed prefix and cur is the untouched suffix; at the end prev is the whole reversed list.

**Pitfalls.** Forgetting to save next loses the rest of the list.`,
        time: "O(n)",
        space: "O(1)",
        python: `class Solution:
    def reverseList(self, head: Optional[ListNode]) -> Optional[ListNode]:
        prev = None
        cur = head
        while cur:
            nxt = cur.next
            cur.next = prev
            prev = cur
            cur = nxt
        return prev
`,
        cpp: `class Solution {
public:
    ListNode* reverseList(ListNode* head) {
        ListNode* prev = nullptr;
        ListNode* cur = head;
        while (cur) {
            ListNode* nxt = cur->next;
            cur->next = prev;
            prev = cur;
            cur = nxt;
        }
        return prev;
    }
};`,
      },
    ],
    viz: "linked-list",
  },
  {
    id: "merge-two-sorted-lists",
    title: "Merge Two Sorted Lists",
    number: 21,
    difficulty: "Easy",
    category: "Linked List",
    pattern: "Two Pointers",
    description: `Given two sorted linked lists, implement mergeTwoLists to return one sorted list containing all node values.

The merged order must be nondecreasing.`,
    examples: [
      { input: "list1 = [1,2,4], list2 = [1,3,4]", output: "[1,1,2,3,4,4]" },
      { input: "list1 = [], list2 = []", output: "[]" },
      { input: "list1 = [], list2 = [0]", output: "[0]" },
    ],
    constraints: ["0 <= length(list1), length(list2) <= 50", "-100 <= Node.val <= 100", "Both input lists are sorted in nondecreasing order."],
    hints: ["Compare the two current heads to decide the next node.", "A dummy head removes special handling for the first appended node.", "After one list ends, attach the remainder of the other list directly."],
    signature: {"kind": "function", "name": "mergeTwoLists", "params": [{"name": "list1", "type": "ListNode"}, {"name": "list2", "type": "ListNode"}], "returns": "ListNode"},
    tests: [
      { args: [[1, 2, 4], [1, 3, 4]], expected: [1, 1, 2, 3, 4, 4] },
      { args: [[], []], expected: [] },
      { args: [[], [0]], expected: [0] },
      { args: [[1], [2]], expected: [1, 2] },
      { args: [[-3, -1, 4], [-2, 0, 5]], expected: [-3, -2, -1, 0, 4, 5] },
      { args: [[1, 1, 2], [1, 3]], expected: [1, 1, 1, 2, 3] },
      { args: [[5], []], expected: [5] },
      { args: [[1, 4, 7], [2, 3, 6, 8]], expected: [1, 2, 3, 4, 6, 7, 8] },
    ],
    solutions: [
      {
        title: "Collect and Sort",
        explanation: `**Intuition.** If we ignore that lists are already sorted, rebuilding from all values is straightforward.

**Steps.**
1. Collect values from both lists.
2. Sort the values.
3. Build a new linked list in sorted order.

**Why it is correct.** Sorting all values creates the required nondecreasing sequence and includes every input value once.

**Pitfalls.** This spends extra time sorting data that was already ordered.`,
        time: "O((m+n) log(m+n))",
        space: "O(m+n)",
        python: `class Solution:
    def mergeTwoLists(self, list1: Optional[ListNode], list2: Optional[ListNode]) -> Optional[ListNode]:
        values = []
        for cur in (list1, list2):
            while cur:
                values.append(cur.val)
                cur = cur.next
        values.sort()
        dummy = ListNode()
        tail = dummy
        for value in values:
            tail.next = ListNode(value)
            tail = tail.next
        return dummy.next
`,
        cpp: `class Solution {
public:
    ListNode* mergeTwoLists(ListNode* list1, ListNode* list2) {
        vector<int> values;
        for (ListNode* cur = list1; cur; cur = cur->next) values.push_back(cur->val);
        for (ListNode* cur = list2; cur; cur = cur->next) values.push_back(cur->val);
        sort(values.begin(), values.end());
        ListNode dummy;
        ListNode* tail = &dummy;
        for (int value : values) {
            tail->next = new ListNode(value);
            tail = tail->next;
        }
        return dummy.next;
    }
};`,
      },
      {
        title: "Two-Pointer Merge",
        explanation: `**Intuition.** The smallest remaining value is always at one of the two list heads.

**Steps.**
1. Use a dummy head and tail pointer.
2. Attach the smaller current head.
3. Advance that source list and the tail.
4. Attach the leftover suffix.

**Why it is correct.** Each step appends the smallest unmerged node, so the output remains sorted and complete.

**Pitfalls.** Remember to advance the tail after linking a node.`,
        time: "O(m+n)",
        space: "O(1)",
        python: `class Solution:
    def mergeTwoLists(self, list1: Optional[ListNode], list2: Optional[ListNode]) -> Optional[ListNode]:
        dummy = ListNode()
        tail = dummy
        while list1 and list2:
            if list1.val <= list2.val:
                tail.next = list1
                list1 = list1.next
            else:
                tail.next = list2
                list2 = list2.next
            tail = tail.next
        tail.next = list1 or list2
        return dummy.next
`,
        cpp: `class Solution {
public:
    ListNode* mergeTwoLists(ListNode* list1, ListNode* list2) {
        ListNode dummy;
        ListNode* tail = &dummy;
        while (list1 && list2) {
            if (list1->val <= list2->val) { tail->next = list1; list1 = list1->next; }
            else { tail->next = list2; list2 = list2->next; }
            tail = tail->next;
        }
        tail->next = list1 ? list1 : list2;
        return dummy.next;
    }
};`,
      },
    ],
    viz: "linked-list",
  },
  {
    id: "linked-list-cycle",
    title: "Linked List Cycle",
    number: 141,
    difficulty: "Easy",
    category: "Linked List",
    pattern: "Fast and Slow Pointers",
    description: `Given a linked list head, implement hasCycle to determine whether following next pointers can loop forever.

The input uses [values, pos], where pos is the index the tail points to and -1 means no cycle.`,
    examples: [
      { input: "head = [3,2,0,-4], pos = 1", output: "true" },
      { input: "head = [1,2], pos = 0", output: "true" },
      { input: "head = [1], pos = -1", output: "false" },
    ],
    constraints: ["0 <= list length <= 10^4", "-10^5 <= Node.val <= 10^5", "pos is -1 or a valid list index."],
    hints: ["One approach is to remember node identities you have visited.", "Can two runners moving at different speeds reveal a loop without extra storage?", "If fast meets slow, a cycle exists; if fast reaches null, it does not."],
    signature: {"kind": "function", "name": "hasCycle", "params": [{"name": "head", "type": "CycleList"}], "returns": "bool"},
    tests: [
      { args: [[[3, 2, 0, -4], 1]], expected: true },
      { args: [[[1, 2], 0]], expected: true },
      { args: [[[1], -1]], expected: false },
      { args: [[[], -1]], expected: false },
      { args: [[[1, 2, 3], -1]], expected: false },
      { args: [[[1, 2, 3], 2]], expected: true },
      { args: [[[5], 0]], expected: true },
      { args: [[[1, 2, 3, 4, 5], 1]], expected: true },
    ],
    solutions: [
      {
        title: "Visited Set",
        explanation: `**Intuition.** A cycle means traversal eventually reaches the same node object twice.

**Steps.**
1. Walk from head through next pointers.
2. Store each node identity in a set.
3. Return true if a node is seen again.
4. Return false if traversal reaches null.

**Why it is correct.** Acyclic lists visit each node once before null; cyclic lists force a repeated identity.

**Pitfalls.** Store node identity, not node value, because values may repeat.`,
        time: "O(n)",
        space: "O(n)",
        python: `class Solution:
    def hasCycle(self, head: Optional[ListNode]) -> bool:
        seen = set()
        cur = head
        while cur:
            if id(cur) in seen:
                return True
            seen.add(id(cur))
            cur = cur.next
        return False
`,
        cpp: `class Solution {
public:
    bool hasCycle(ListNode* head) {
        unordered_set<ListNode*> seen;
        while (head) {
            if (seen.count(head)) return true;
            seen.insert(head);
            head = head->next;
        }
        return false;
    }
};`,
      },
      {
        title: "Floyd Tortoise and Hare",
        explanation: `**Intuition.** Inside a cycle, a two-step runner gains on a one-step runner.

**Steps.**
1. Start slow and fast at head.
2. Move slow one step and fast two steps.
3. Return true if they meet.
4. Return false if fast reaches the end.

**Why it is correct.** Without a cycle fast hits null. With a cycle, the distance modulo the cycle length eventually becomes zero.

**Pitfalls.** Check fast and fast.next before moving two steps.`,
        time: "O(n)",
        space: "O(1)",
        python: `class Solution:
    def hasCycle(self, head: Optional[ListNode]) -> bool:
        slow = fast = head
        while fast and fast.next:
            slow = slow.next
            fast = fast.next.next
            if slow is fast:
                return True
        return False
`,
        cpp: `class Solution {
public:
    bool hasCycle(ListNode* head) {
        ListNode* slow = head;
        ListNode* fast = head;
        while (fast && fast->next) {
            slow = slow->next;
            fast = fast->next->next;
            if (slow == fast) return true;
        }
        return false;
    }
};`,
      },
    ],
    viz: "linked-list",
  },
  {
    id: "reorder-list",
    title: "Reorder List",
    number: 143,
    difficulty: "Medium",
    category: "Linked List",
    pattern: "Split Reverse Merge",
    description: `Given a linked list L0 -> L1 -> ... -> Ln, reorder it in place as L0 -> Ln -> L1 -> Ln-1 and so on.

Implement reorderList without returning a new head; the judge checks the mutated list.`,
    examples: [
      { input: "head = [1,2,3,4]", output: "[1,4,2,3]" },
      { input: "head = [1,2,3,4,5]", output: "[1,5,2,4,3]" },
      { input: "head = [1,2]", output: "[1,2]" },
    ],
    constraints: ["1 <= list length <= 5 * 10^4", "1 <= Node.val <= 1000", "Mutate the existing list rather than returning a value."],
    hints: ["The final order alternates from the front and the back.", "The back half is easier to consume if you reverse it first.", "Find the middle, reverse the second half, then weave the two halves together."],
    signature: {"kind": "function", "name": "reorderList", "params": [{"name": "head", "type": "ListNode"}], "returns": "void", "inPlace": 0},
    tests: [
      { args: [[1, 2, 3, 4]], expected: [1, 4, 2, 3] },
      { args: [[1, 2, 3, 4, 5]], expected: [1, 5, 2, 4, 3] },
      { args: [[1, 2]], expected: [1, 2] },
      { args: [[1]], expected: [1] },
      { args: [[1, 2, 3]], expected: [1, 3, 2] },
      { args: [[10, 20, 30, 40, 50, 60]], expected: [10, 60, 20, 50, 30, 40] },
      { args: [[1, 1, 2, 2, 3]], expected: [1, 3, 1, 2, 2] },
      { args: [[5, 6, 7, 8, 9, 10, 11]], expected: [5, 11, 6, 10, 7, 9, 8] },
    ],
    solutions: [
      {
        title: "Node Array",
        explanation: `**Intuition.** Store node references so you can pick alternately from the front and back.

**Steps.**
1. Collect every node into an array.
2. Use two indices to append front, back, front, back.
3. Terminate the final node with null.

**Why it is correct.** The two-index order exactly matches the required original positions, and relinking applies that order.

**Pitfalls.** Always clear the final next pointer to avoid a cycle.`,
        time: "O(n)",
        space: "O(n)",
        python: `class Solution:
    def reorderList(self, head: Optional[ListNode]) -> None:
        nodes = []
        cur = head
        while cur:
            nodes.append(cur)
            cur = cur.next
        i, j = 0, len(nodes) - 1
        dummy = ListNode()
        tail = dummy
        while i <= j:
            tail.next = nodes[i]
            tail = tail.next
            i += 1
            if i <= j:
                tail.next = nodes[j]
                tail = tail.next
                j -= 1
        tail.next = None
`,
        cpp: `class Solution {
public:
    void reorderList(ListNode* head) {
        vector<ListNode*> nodes;
        for (ListNode* cur = head; cur; cur = cur->next) nodes.push_back(cur);
        int i = 0, j = (int)nodes.size() - 1;
        ListNode dummy;
        ListNode* tail = &dummy;
        while (i <= j) {
            tail->next = nodes[i++]; tail = tail->next;
            if (i <= j) { tail->next = nodes[j--]; tail = tail->next; }
        }
        tail->next = nullptr;
    }
};`,
      },
      {
        title: "Split Reverse and Weave",
        explanation: `**Intuition.** Back-to-front picks become front-to-back picks after reversing the second half.

**Steps.**
1. Find the middle with slow and fast pointers.
2. Reverse the second half.
3. Alternate nodes from the first half and reversed second half.

**Why it is correct.** The first half supplies L0, L1 and the reversed second half supplies Ln, Ln-1; weaving gives the target order.

**Pitfalls.** Cut the list at the middle before reversing.`,
        time: "O(n)",
        space: "O(1)",
        python: `class Solution:
    def reorderList(self, head: Optional[ListNode]) -> None:
        if not head or not head.next:
            return
        slow = fast = head
        while fast.next and fast.next.next:
            slow = slow.next
            fast = fast.next.next
        second = slow.next
        slow.next = None
        prev = None
        while second:
            nxt = second.next
            second.next = prev
            prev = second
            second = nxt
        first, second = head, prev
        while second:
            n1, n2 = first.next, second.next
            first.next = second
            second.next = n1
            first, second = n1, n2
`,
        cpp: `class Solution {
public:
    void reorderList(ListNode* head) {
        if (!head || !head->next) return;
        ListNode* slow = head;
        ListNode* fast = head;
        while (fast->next && fast->next->next) { slow = slow->next; fast = fast->next->next; }
        ListNode* second = slow->next;
        slow->next = nullptr;
        ListNode* prev = nullptr;
        while (second) { ListNode* nxt = second->next; second->next = prev; prev = second; second = nxt; }
        ListNode* first = head; second = prev;
        while (second) {
            ListNode* n1 = first->next; ListNode* n2 = second->next;
            first->next = second; second->next = n1;
            first = n1; second = n2;
        }
    }
};`,
      },
    ],
    viz: "linked-list",
  },
  {
    id: "remove-nth-node-from-end-of-list",
    title: "Remove Nth Node From End of List",
    number: 19,
    difficulty: "Medium",
    category: "Linked List",
    pattern: "Two Pointers",
    description: `Given a linked list and an integer n, remove the nth node from the end and return the new head.

n is always valid for the list length.`,
    examples: [
      { input: "head = [1,2,3,4,5], n = 2", output: "[1,2,3,5]" },
      { input: "head = [1], n = 1", output: "[]" },
      { input: "head = [1,2], n = 1", output: "[1]" },
    ],
    constraints: ["1 <= list length <= 30", "0 <= Node.val <= 100", "1 <= n <= list length"],
    hints: ["If you know the length, the target is at index length - n from the front.", "A dummy node simplifies removing the head.", "Keep two pointers n + 1 nodes apart so slow stops before the node to delete."],
    signature: {"kind": "function", "name": "removeNthFromEnd", "params": [{"name": "head", "type": "ListNode"}, {"name": "n", "type": "int"}], "returns": "ListNode"},
    tests: [
      { args: [[1, 2, 3, 4, 5], 2], expected: [1, 2, 3, 5] },
      { args: [[1], 1], expected: [] },
      { args: [[1, 2], 1], expected: [1] },
      { args: [[1, 2], 2], expected: [2] },
      { args: [[1, 2, 3], 3], expected: [2, 3] },
      { args: [[1, 2, 3], 1], expected: [1, 2] },
      { args: [[7, 7, 7, 7], 2], expected: [7, 7, 7] },
      { args: [[10, 20, 30, 40, 50], 5], expected: [20, 30, 40, 50] },
    ],
    solutions: [
      {
        title: "Length Then Delete",
        explanation: `**Intuition.** Converting from an end position to a front position is easy after measuring length.

**Steps.**
1. Count the nodes.
2. Use a dummy before head.
3. Move to the node before index length - n.
4. Bypass the target node.

**Why it is correct.** The counted length makes length - n exactly the index to remove, and bypassing removes only that node.

**Pitfalls.** A dummy node is important when deleting the original head.`,
        time: "O(n)",
        space: "O(1)",
        python: `class Solution:
    def removeNthFromEnd(self, head: Optional[ListNode], n: int) -> Optional[ListNode]:
        length = 0
        cur = head
        while cur:
            length += 1
            cur = cur.next
        dummy = ListNode(0, head)
        cur = dummy
        for _ in range(length - n):
            cur = cur.next
        cur.next = cur.next.next
        return dummy.next
`,
        cpp: `class Solution {
public:
    ListNode* removeNthFromEnd(ListNode* head, int n) {
        int length = 0;
        for (ListNode* cur = head; cur; cur = cur->next) ++length;
        ListNode dummy(0, head);
        ListNode* cur = &dummy;
        for (int i = 0; i < length - n; ++i) cur = cur->next;
        cur->next = cur->next->next;
        return dummy.next;
    }
};`,
      },
      {
        title: "One-Pass Gap",
        explanation: `**Intuition.** Maintain a fixed gap so the front pointer reaching the end locates the predecessor.

**Steps.**
1. Create a dummy before head.
2. Advance fast by n + 1 steps from dummy.
3. Move fast and slow together until fast is null.
4. Delete slow.next.

**Why it is correct.** The n + 1 gap means slow is immediately before the nth node from the end when fast leaves the list.

**Pitfalls.** Advance from the dummy so head deletion works naturally.`,
        time: "O(n)",
        space: "O(1)",
        python: `class Solution:
    def removeNthFromEnd(self, head: Optional[ListNode], n: int) -> Optional[ListNode]:
        dummy = ListNode(0, head)
        fast = slow = dummy
        for _ in range(n + 1):
            fast = fast.next
        while fast:
            fast = fast.next
            slow = slow.next
        slow.next = slow.next.next
        return dummy.next
`,
        cpp: `class Solution {
public:
    ListNode* removeNthFromEnd(ListNode* head, int n) {
        ListNode dummy(0, head);
        ListNode* fast = &dummy;
        ListNode* slow = &dummy;
        for (int i = 0; i <= n; ++i) fast = fast->next;
        while (fast) { fast = fast->next; slow = slow->next; }
        slow->next = slow->next->next;
        return dummy.next;
    }
};`,
      },
    ],
    viz: "linked-list",
  },
  {
    id: "copy-list-with-random-pointer",
    title: "Copy List with Random Pointer",
    number: 138,
    difficulty: "Medium",
    category: "Linked List",
    pattern: "Hash Map / Interleaving",
    description: `Each node has next and random pointers. Implement copyRandomList to return a deep copy of the list.

The copy must preserve values, next order, and random targets while using newly created nodes.`,
    examples: [
      { input: "head = [[7,null],[13,0],[11,4],[10,2],[1,0]]", output: "[[7,null],[13,0],[11,4],[10,2],[1,0]]" },
      { input: "head = [[1,1],[2,1]]", output: "[[1,1],[2,1]]" },
      { input: "head = []", output: "[]" },
    ],
    constraints: ["0 <= list length <= 1000", "-10^4 <= Node.val <= 10^4", "Each random pointer is null or points to a node in the same list."],
    hints: ["The hard part is finding the cloned target of an original random pointer.", "A map from original node to clone makes random assignment direct.", "Alternatively, weave each clone immediately after its original."],
    signature: {"kind": "function", "name": "copyRandomList", "params": [{"name": "head", "type": "RandomList"}], "returns": "RandomList"},
    tests: [
      { args: [[[7, null], [13, 0], [11, 4], [10, 2], [1, 0]]], expected: [[7, null], [13, 0], [11, 4], [10, 2], [1, 0]] },
      { args: [[[1, 1], [2, 1]]], expected: [[1, 1], [2, 1]] },
      { args: [[]], expected: [] },
      { args: [[[3, null], [3, 0], [3, null]]], expected: [[3, null], [3, 0], [3, null]] },
      { args: [[[5, 0]]], expected: [[5, 0]] },
      { args: [[[-1, null], [2, 0], [3, 1]]], expected: [[-1, null], [2, 0], [3, 1]] },
      { args: [[[1, 2], [2, null], [3, 0]]], expected: [[1, 2], [2, null], [3, 0]] },
      { args: [[[10, null], [20, null]]], expected: [[10, null], [20, null]] },
    ],
    solutions: [
      {
        title: "Hash Map of Clones",
        explanation: `**Intuition.** Create all clone nodes first, then wire pointers using a lookup table.

**Steps.**
1. Map null to null for convenience.
2. Create one clone per original node.
3. Traverse again and assign next and random through the map.
4. Return the clone of head.

**Why it is correct.** Every original node has exactly one mapped clone, so original pointer targets translate to matching clone targets.

**Pitfalls.** Do not map by node value because values can repeat.`,
        time: "O(n)",
        space: "O(n)",
        python: `class Solution:
    def copyRandomList(self, head: 'Optional[Node]') -> 'Optional[Node]':
        clones = {None: None}
        cur = head
        while cur:
            clones[cur] = Node(cur.val)
            cur = cur.next
        cur = head
        while cur:
            clones[cur].next = clones[cur.next]
            clones[cur].random = clones[cur.random]
            cur = cur.next
        return clones[head]
`,
        cpp: `class Solution {
public:
    Node* copyRandomList(Node* head) {
        unordered_map<Node*, Node*> clones;
        clones[nullptr] = nullptr;
        for (Node* cur = head; cur; cur = cur->next) clones[cur] = new Node(cur->val);
        for (Node* cur = head; cur; cur = cur->next) {
            clones[cur]->next = clones[cur->next];
            clones[cur]->random = clones[cur->random];
        }
        return clones[head];
    }
};`,
      },
      {
        title: "Interleave Clones",
        explanation: `**Intuition.** Place each clone next to its original so pointer translations are local.

**Steps.**
1. Insert clone X after original X.
2. Set clone random to original.random.next when present.
3. Detach the clone chain while restoring the original chain.

**Why it is correct.** After interleaving, each original node clone is reachable via next, so random pointers can be translated without a map.

**Pitfalls.** The separation pass must restore original next pointers.`,
        time: "O(n)",
        space: "O(1) extra besides output nodes",
        python: `class Solution:
    def copyRandomList(self, head: 'Optional[Node]') -> 'Optional[Node]':
        cur = head
        while cur:
            clone = Node(cur.val, cur.next)
            cur.next = clone
            cur = clone.next
        cur = head
        while cur:
            if cur.random:
                cur.next.random = cur.random.next
            cur = cur.next.next
        dummy = Node(0)
        tail = dummy
        cur = head
        while cur:
            clone = cur.next
            cur.next = clone.next
            tail.next = clone
            tail = clone
            cur = cur.next
        return dummy.next
`,
        cpp: `class Solution {
public:
    Node* copyRandomList(Node* head) {
        for (Node* cur = head; cur; ) {
            Node* clone = new Node(cur->val);
            clone->next = cur->next;
            cur->next = clone;
            cur = clone->next;
        }
        for (Node* cur = head; cur; cur = cur->next->next) if (cur->random) cur->next->random = cur->random->next;
        Node dummy(0);
        Node* tail = &dummy;
        for (Node* cur = head; cur; ) {
            Node* clone = cur->next;
            cur->next = clone->next;
            tail->next = clone;
            tail = clone;
            cur = cur->next;
        }
        return dummy.next;
    }
};`,
      },
    ],
    viz: "linked-list",
  },
  {
    id: "add-two-numbers",
    title: "Add Two Numbers",
    number: 2,
    difficulty: "Medium",
    category: "Linked List",
    pattern: "Digit Carry",
    description: `Two nonempty linked lists store nonnegative integers in reverse digit order. Implement addTwoNumbers to return their sum in the same reverse order.

Each node contains one digit.`,
    examples: [
      { input: "l1 = [2,4,3], l2 = [5,6,4]", output: "[7,0,8]" },
      { input: "l1 = [0], l2 = [0]", output: "[0]" },
      { input: "l1 = [9,9,9,9,9,9,9], l2 = [9,9,9,9]", output: "[8,9,9,9,0,0,0,1]" },
    ],
    constraints: ["1 <= length(l1), length(l2) <= 100", "0 <= Node.val <= 9", "The digits are stored least significant first."],
    hints: ["This is grade-school addition from left to right because the least significant digit comes first.", "Carry can remain after both lists end.", "A dummy head lets you append result digits uniformly."],
    signature: {"kind": "function", "name": "addTwoNumbers", "params": [{"name": "l1", "type": "ListNode"}, {"name": "l2", "type": "ListNode"}], "returns": "ListNode"},
    tests: [
      { args: [[2, 4, 3], [5, 6, 4]], expected: [7, 0, 8] },
      { args: [[0], [0]], expected: [0] },
      { args: [[9, 9, 9, 9, 9, 9, 9], [9, 9, 9, 9]], expected: [8, 9, 9, 9, 0, 0, 0, 1] },
      { args: [[5], [5]], expected: [0, 1] },
      { args: [[1, 8], [0]], expected: [1, 8] },
      { args: [[9], [1, 9, 9]], expected: [0, 0, 0, 1] },
      { args: [[2, 4, 9], [5, 6, 4, 9]], expected: [7, 0, 4, 0, 1] },
      { args: [[1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1], [5, 6, 4]], expected: [6, 6, 4, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1] },
    ],
    solutions: [
      {
        title: "Convert Then Add",
        explanation: `**Intuition.** A baseline reconstructs the represented numbers, adds them, then emits digits again.

**Steps.**
1. Read each list into an integer or decimal string.
2. Add the two numbers.
3. Repeatedly take the ones digit to build the result.

**Why it is correct.** The conversion interprets reverse digits with correct powers of ten, so the sum digits match the desired result.

**Pitfalls.** Fixed-size integer languages need strings or direct carry simulation to avoid overflow.`,
        time: "O(m+n)",
        space: "O(m+n)",
        python: `class Solution:
    def addTwoNumbers(self, l1: Optional[ListNode], l2: Optional[ListNode]) -> Optional[ListNode]:
        def to_int(node):
            place = 1
            value = 0
            while node:
                value += node.val * place
                place *= 10
                node = node.next
            return value
        total = to_int(l1) + to_int(l2)
        if total == 0:
            return ListNode(0)
        dummy = ListNode()
        tail = dummy
        while total:
            tail.next = ListNode(total % 10)
            tail = tail.next
            total //= 10
        return dummy.next
`,
        cpp: `class Solution {
    string toString(ListNode* node) {
        string s;
        while (node) { s.push_back(char('0' + node->val)); node = node->next; }
        reverse(s.begin(), s.end());
        return s.empty() ? string("0") : s;
    }
public:
    ListNode* addTwoNumbers(ListNode* l1, ListNode* l2) {
        string a = toString(l1), b = toString(l2), sum;
        int i = (int)a.size() - 1, j = (int)b.size() - 1, carry = 0;
        while (i >= 0 || j >= 0 || carry) {
            int value = carry;
            if (i >= 0) value += a[i--] - '0';
            if (j >= 0) value += b[j--] - '0';
            sum.push_back(char('0' + value % 10));
            carry = value / 10;
        }
        ListNode dummy; ListNode* tail = &dummy;
        for (char ch : sum) { tail->next = new ListNode(ch - '0'); tail = tail->next; }
        return dummy.next;
    }
};`,
      },
      {
        title: "Carry Simulation",
        explanation: `**Intuition.** The digits are already least significant first, so produce the output while adding.

**Steps.**
1. Walk both lists together.
2. Sum available digits plus carry.
3. Append total mod 10.
4. Carry total divided by 10 into the next step.

**Why it is correct.** Each iteration computes one decimal column exactly like grade-school addition, including a final carry node if needed.

**Pitfalls.** Do not stop while carry remains.`,
        time: "O(max(m,n))",
        space: "O(1) extra besides output",
        python: `class Solution:
    def addTwoNumbers(self, l1: Optional[ListNode], l2: Optional[ListNode]) -> Optional[ListNode]:
        dummy = ListNode()
        tail = dummy
        carry = 0
        while l1 or l2 or carry:
            total = carry
            if l1:
                total += l1.val
                l1 = l1.next
            if l2:
                total += l2.val
                l2 = l2.next
            tail.next = ListNode(total % 10)
            tail = tail.next
            carry = total // 10
        return dummy.next
`,
        cpp: `class Solution {
public:
    ListNode* addTwoNumbers(ListNode* l1, ListNode* l2) {
        ListNode dummy; ListNode* tail = &dummy; int carry = 0;
        while (l1 || l2 || carry) {
            int total = carry;
            if (l1) { total += l1->val; l1 = l1->next; }
            if (l2) { total += l2->val; l2 = l2->next; }
            tail->next = new ListNode(total % 10); tail = tail->next; carry = total / 10;
        }
        return dummy.next;
    }
};`,
      },
    ],
    viz: "linked-list",
  },
  {
    id: "find-the-duplicate-number",
    title: "Find the Duplicate Number",
    number: 287,
    difficulty: "Medium",
    category: "Linked List",
    pattern: "Cycle Detection on Indices",
    description: `An array nums has length n + 1 and every value is in the range 1..n. One distinct value appears more than once.

Implement findDuplicate to return the repeated value without modifying the array.`,
    examples: [
      { input: "nums = [1,3,4,2,2]", output: "2" },
      { input: "nums = [3,1,3,4,2]", output: "3" },
      { input: "nums = [3,3,3,3,3]", output: "3" },
    ],
    constraints: ["1 <= n <= 10^5", "nums.length == n + 1", "1 <= nums[i] <= n", "Exactly one distinct value is duplicated, though it may appear more than twice."],
    hints: ["Sorting would put equal values next to each other, but it changes or copies the data.", "Treat each index as a node and nums[i] as the next pointer.", "The duplicate value is the entry point of the cycle in this implicit linked list."],
    signature: {"kind": "function", "name": "findDuplicate", "params": [{"name": "nums", "type": "int[]"}], "returns": "int"},
    tests: [
      { args: [[1, 3, 4, 2, 2]], expected: 2 },
      { args: [[3, 1, 3, 4, 2]], expected: 3 },
      { args: [[3, 3, 3, 3, 3]], expected: 3 },
      { args: [[1, 1]], expected: 1 },
      { args: [[1, 4, 6, 3, 2, 5, 4]], expected: 4 },
      { args: [[2, 2, 2, 2]], expected: 2 },
      { args: [[5, 4, 3, 2, 1, 5]], expected: 5 },
      { args: [[2, 5, 9, 6, 9, 3, 8, 9, 7, 1]], expected: 9 },
    ],
    solutions: [
      {
        title: "Sort a Copy",
        explanation: `**Intuition.** If equal values are adjacent, the duplicate is easy to spot.

**Steps.**
1. Copy and sort the array.
2. Scan adjacent pairs.
3. Return the value when two neighbors are equal.

**Why it is correct.** Sorting groups equal values together, so the repeated value creates an equal adjacent pair.

**Pitfalls.** Sorting the original would violate the no-modification requirement.`,
        time: "O(n log n)",
        space: "O(n)",
        python: `class Solution:
    def findDuplicate(self, nums: List[int]) -> int:
        arr = sorted(nums)
        for i in range(1, len(arr)):
            if arr[i] == arr[i - 1]:
                return arr[i]
        return -1
`,
        cpp: `class Solution {
public:
    int findDuplicate(vector<int>& nums) {
        vector<int> arr = nums;
        sort(arr.begin(), arr.end());
        for (int i = 1; i < (int)arr.size(); ++i) if (arr[i] == arr[i - 1]) return arr[i];
        return -1;
    }
};`,
      },
      {
        title: "Floyd on the Index Graph",
        explanation: `**Intuition.** The values define a linked list from index to index, and the duplicate creates a cycle.

**Steps.**
1. Run Floyd meeting phase using nums[value] as next.
2. Reset one pointer to nums[0].
3. Move both one step until they meet.
4. Return the meeting value.

**Why it is correct.** In the implicit list, the repeated number is the cycle entrance, and Floyd finds exactly that entrance.

**Pitfalls.** Use values as next indices without subtracting one.`,
        time: "O(n)",
        space: "O(1)",
        python: `class Solution:
    def findDuplicate(self, nums: List[int]) -> int:
        slow = nums[0]
        fast = nums[0]
        while True:
            slow = nums[slow]
            fast = nums[nums[fast]]
            if slow == fast:
                break
        slow = nums[0]
        while slow != fast:
            slow = nums[slow]
            fast = nums[fast]
        return slow
`,
        cpp: `class Solution {
public:
    int findDuplicate(vector<int>& nums) {
        int slow = nums[0], fast = nums[0];
        do { slow = nums[slow]; fast = nums[nums[fast]]; } while (slow != fast);
        slow = nums[0];
        while (slow != fast) { slow = nums[slow]; fast = nums[fast]; }
        return slow;
    }
};`,
      },
    ],
    viz: "linked-list",
  },
  {
    id: "lru-cache",
    title: "LRU Cache",
    number: 146,
    difficulty: "Medium",
    category: "Linked List",
    pattern: "Hash Map + Doubly Linked List",
    description: `Design an LRUCache with fixed positive capacity.

get returns a stored value or -1 and marks the key as recent. put inserts or updates a value and evicts the least recently used key when capacity is exceeded.`,
    examples: [
      { input: "ops = [\"LRUCache\",\"put\",\"put\",\"get\",\"put\",\"get\",\"put\",\"get\",\"get\",\"get\"], args = [[2],[1,1],[2,2],[1],[3,3],[2],[4,4],[1],[3],[4]]", output: "[null,null,null,1,null,-1,null,-1,3,4]" },
      { input: "ops = [\"LRUCache\",\"get\"], args = [[1],[5]]", output: "[null,-1]" },
      { input: "ops = [\"LRUCache\",\"put\",\"get\",\"put\",\"get\",\"get\"], args = [[1],[5,6],[5],[6,7],[5],[6]]", output: "[null,null,6,null,-1,7]" },
    ],
    constraints: ["1 <= capacity <= 3000", "0 <= key, value <= 10^4", "Up to 2 * 10^5 operations may be issued.", "Optimal get and put should be O(1)."],
    hints: ["You need fast lookup by key and fast removal of the least recent item.", "A linked order stores recency; a hash map finds nodes by key.", "Move a node to the recent end on both get and update-style put."],
    signature: {"kind": "class", "className": "LRUCache", "ctorParams": [{"name": "capacity", "type": "int"}], "methods": [{"name": "get", "params": [{"name": "key", "type": "int"}], "returns": "int"}, {"name": "put", "params": [{"name": "key", "type": "int"}, {"name": "value", "type": "int"}], "returns": "void"}]},
    tests: [
      { ops: ["LRUCache", "put", "put", "get", "put", "get", "put", "get", "get", "get"], args: [[2], [1, 1], [2, 2], [1], [3, 3], [2], [4, 4], [1], [3], [4]], expected: [null, null, null, 1, null, -1, null, -1, 3, 4] },
      { ops: ["LRUCache", "get"], args: [[1], [5]], expected: [null, -1] },
      { ops: ["LRUCache", "put", "get", "put", "get", "get"], args: [[1], [5, 6], [5], [6, 7], [5], [6]], expected: [null, null, 6, null, -1, 7] },
      { ops: ["LRUCache", "put", "put", "get", "put", "get", "get"], args: [[2], [2, 1], [2, 2], [2], [1, 1], [2], [1]], expected: [null, null, null, 2, null, 2, 1] },
      { ops: ["LRUCache", "put", "put", "put", "get", "put", "get", "get", "get"], args: [[3], [1, 10], [2, 20], [3, 30], [1], [4, 40], [2], [3], [4]], expected: [null, null, null, null, 10, null, -1, 30, 40] },
      { ops: ["LRUCache", "put", "put", "get", "put", "get", "put", "get", "get"], args: [[2], [1, 1], [2, 2], [2], [3, 3], [1], [4, 4], [2], [4]], expected: [null, null, null, 2, null, -1, null, -1, 4] },
    ],
    solutions: [
      {
        title: "List Scan",
        explanation: `**Intuition.** Keep entries from least recent to most recent and scan to find keys.

**Steps.**
1. Store key-value pairs in recency order.
2. On get, scan for the key, move it to the back, and return its value.
3. On put, remove an old pair, append the new pair, and evict the front if needed.

**Why it is correct.** The list order is updated on every access, so the front is always the least recently used entry.

**Pitfalls.** Scanning makes each operation linear in capacity.`,
        time: "O(capacity) per operation",
        space: "O(capacity)",
        python: `class LRUCache:
    def __init__(self, capacity: int):
        self.capacity = capacity
        self.items = []
    def get(self, key: int) -> int:
        for i, (k, value) in enumerate(self.items):
            if k == key:
                self.items.pop(i)
                self.items.append((k, value))
                return value
        return -1
    def put(self, key: int, value: int) -> None:
        for i, (k, _) in enumerate(self.items):
            if k == key:
                self.items.pop(i)
                break
        self.items.append((key, value))
        if len(self.items) > self.capacity:
            self.items.pop(0)
`,
        cpp: `class LRUCache {
    int capacity;
    list<pair<int, int>> items;
public:
    LRUCache(int capacity) : capacity(capacity) {}
    int get(int key) {
        for (auto it = items.begin(); it != items.end(); ++it) {
            if (it->first == key) {
                int value = it->second;
                items.erase(it);
                items.push_back({key, value});
                return value;
            }
        }
        return -1;
    }
    void put(int key, int value) {
        for (auto it = items.begin(); it != items.end(); ++it) {
            if (it->first == key) { items.erase(it); break; }
        }
        items.push_back({key, value});
        if ((int)items.size() > capacity) items.pop_front();
    }
};`,
      },
      {
        title: "Hash Map with Recency List",
        explanation: `**Intuition.** Combine direct key lookup with a list that can move nodes in constant time.

**Steps.**
1. Map each key to its list node or iterator.
2. Keep the list ordered from least recent to most recent.
3. Move nodes to the recent end on access.
4. Evict the front node when over capacity.

**Why it is correct.** The map finds the exact entry, and the list invariant makes the front exactly the least recently used key.

**Pitfalls.** Erase the key from the map when evicting its list node.`,
        time: "O(1) per operation",
        space: "O(capacity)",
        python: `class LRUCache:
    def __init__(self, capacity: int):
        self.capacity = capacity
        self.cache = OrderedDict()
    def get(self, key: int) -> int:
        if key not in self.cache:
            return -1
        self.cache.move_to_end(key)
        return self.cache[key]
    def put(self, key: int, value: int) -> None:
        self.cache[key] = value
        self.cache.move_to_end(key)
        if len(self.cache) > self.capacity:
            self.cache.popitem(last=False)
`,
        cpp: `class LRUCache {
    int capacity;
    list<pair<int, int>> order;
    unordered_map<int, list<pair<int, int>>::iterator> where;
public:
    LRUCache(int capacity) : capacity(capacity) {}
    int get(int key) {
        auto it = where.find(key);
        if (it == where.end()) return -1;
        order.splice(order.end(), order, it->second);
        return it->second->second;
    }
    void put(int key, int value) {
        auto it = where.find(key);
        if (it != where.end()) {
            it->second->second = value;
            order.splice(order.end(), order, it->second);
            return;
        }
        order.push_back({key, value});
        where[key] = prev(order.end());
        if ((int)order.size() > capacity) { where.erase(order.front().first); order.pop_front(); }
    }
};`,
      },
    ],
    viz: "linked-list",
  },
  {
    id: "merge-k-sorted-lists",
    title: "Merge k Sorted Lists",
    number: 23,
    difficulty: "Hard",
    category: "Linked List",
    pattern: "Min-Heap",
    description: `Given an array of sorted linked-list heads, implement mergeKLists to return one sorted linked list containing every node value.

The number of lists may be zero, and individual lists may be empty.`,
    examples: [
      { input: "lists = [[1,4,5],[1,3,4],[2,6]]", output: "[1,1,2,3,4,4,5,6]" },
      { input: "lists = []", output: "[]" },
      { input: "lists = [[]]", output: "[]" },
    ],
    constraints: ["0 <= lists.length <= 10^4", "Total nodes across all lists is at most 10^4.", "Each input list is sorted in nondecreasing order.", "-10^4 <= Node.val <= 10^4"],
    hints: ["Merging two sorted lists is already solved; repeat it carefully.", "A heap can tell you the smallest current head among all lists.", "After popping a node, push only its next node from the same list."],
    signature: {"kind": "function", "name": "mergeKLists", "params": [{"name": "lists", "type": "ListNode[]"}], "returns": "ListNode"},
    tests: [
      { args: [[[1, 4, 5], [1, 3, 4], [2, 6]]], expected: [1, 1, 2, 3, 4, 4, 5, 6] },
      { args: [[]], expected: [] },
      { args: [[[]]], expected: [] },
      { args: [[[1], []]], expected: [1] },
      { args: [[[-1, 5], [0]]], expected: [-1, 0, 5] },
      { args: [[[1, 1, 1], [1, 1]]], expected: [1, 1, 1, 1, 1] },
      { args: [[[2, 6], [1, 3, 4], [0, 7, 8], []]], expected: [0, 1, 2, 3, 4, 6, 7, 8] },
      { args: [[[5], [4], [3], [2], [1]]], expected: [1, 2, 3, 4, 5] },
    ],
    solutions: [
      {
        title: "Flatten and Sort",
        explanation: `**Intuition.** A baseline ignores list boundaries after collecting all values.

**Steps.**
1. Traverse every list and collect values.
2. Sort the collected values.
3. Build a new linked list from the sorted values.

**Why it is correct.** All input values are included exactly once, and sorting produces global order.

**Pitfalls.** This discards the fact that each list is already sorted.`,
        time: "O(N log N)",
        space: "O(N)",
        python: `class Solution:
    def mergeKLists(self, lists: List[Optional[ListNode]]) -> Optional[ListNode]:
        values = []
        for node in lists:
            while node:
                values.append(node.val)
                node = node.next
        values.sort()
        dummy = ListNode()
        tail = dummy
        for value in values:
            tail.next = ListNode(value)
            tail = tail.next
        return dummy.next
`,
        cpp: `class Solution {
public:
    ListNode* mergeKLists(vector<ListNode*>& lists) {
        vector<int> values;
        for (ListNode* node : lists) while (node) { values.push_back(node->val); node = node->next; }
        sort(values.begin(), values.end());
        ListNode dummy; ListNode* tail = &dummy;
        for (int value : values) { tail->next = new ListNode(value); tail = tail->next; }
        return dummy.next;
    }
};`,
      },
      {
        title: "Pairwise Divide and Conquer",
        explanation: `**Intuition.** Repeatedly merge lists in balanced pairs, similar to merge sort.

**Steps.**
1. Merge pairs of lists.
2. Double the interval after each pass.
3. Continue until the result is at index zero.

**Why it is correct.** Each merge preserves sorted order, and balanced passes merge every node O(log k) times.

**Pitfalls.** Handle an empty list array before reading index zero.`,
        time: "O(N log k)",
        space: "O(1) extra",
        python: `class Solution:
    def mergeKLists(self, lists: List[Optional[ListNode]]) -> Optional[ListNode]:
        def merge(a, b):
            dummy = ListNode()
            tail = dummy
            while a and b:
                if a.val <= b.val:
                    tail.next = a
                    a = a.next
                else:
                    tail.next = b
                    b = b.next
                tail = tail.next
            tail.next = a or b
            return dummy.next
        if not lists:
            return None
        interval = 1
        while interval < len(lists):
            for i in range(0, len(lists) - interval, interval * 2):
                lists[i] = merge(lists[i], lists[i + interval])
            interval *= 2
        return lists[0]
`,
        cpp: `class Solution {
    ListNode* merge(ListNode* a, ListNode* b) {
        ListNode dummy; ListNode* tail = &dummy;
        while (a && b) {
            if (a->val <= b->val) { tail->next = a; a = a->next; }
            else { tail->next = b; b = b->next; }
            tail = tail->next;
        }
        tail->next = a ? a : b;
        return dummy.next;
    }
public:
    ListNode* mergeKLists(vector<ListNode*>& lists) {
        if (lists.empty()) return nullptr;
        for (int interval = 1; interval < (int)lists.size(); interval *= 2) {
            for (int i = 0; i + interval < (int)lists.size(); i += interval * 2) lists[i] = merge(lists[i], lists[i + interval]);
        }
        return lists[0];
    }
};`,
      },
      {
        title: "Min-Heap of Heads",
        explanation: `**Intuition.** At any moment the next output node is the smallest head among nonempty lists.

**Steps.**
1. Push each nonempty head into a min-heap.
2. Pop the smallest node and append it.
3. Push that node successor if it exists.
4. Repeat until the heap is empty.

**Why it is correct.** The heap always contains the smallest unmerged node from each active list, so each pop is globally next.

**Pitfalls.** Tie-break Python heap entries so equal node values do not compare node objects.`,
        time: "O(N log k)",
        space: "O(k)",
        python: `class Solution:
    def mergeKLists(self, lists: List[Optional[ListNode]]) -> Optional[ListNode]:
        heap = []
        for i, node in enumerate(lists):
            if node:
                heappush(heap, (node.val, i, node))
        dummy = ListNode()
        tail = dummy
        while heap:
            _, i, node = heappop(heap)
            tail.next = node
            tail = tail.next
            if node.next:
                heappush(heap, (node.next.val, i, node.next))
        return dummy.next
`,
        cpp: `class Solution {
public:
    ListNode* mergeKLists(vector<ListNode*>& lists) {
        auto cmp = [](ListNode* a, ListNode* b) { return a->val > b->val; };
        priority_queue<ListNode*, vector<ListNode*>, decltype(cmp)> pq(cmp);
        for (ListNode* node : lists) if (node) pq.push(node);
        ListNode dummy; ListNode* tail = &dummy;
        while (!pq.empty()) {
            ListNode* node = pq.top(); pq.pop();
            tail->next = node; tail = tail->next;
            if (node->next) pq.push(node->next);
        }
        return dummy.next;
    }
};`,
      },
    ],
    viz: "heap",
  },
  {
    id: "reverse-nodes-in-k-group",
    title: "Reverse Nodes in k-Group",
    number: 25,
    difficulty: "Hard",
    category: "Linked List",
    pattern: "In-Place Group Reversal",
    description: `Given a linked list and an integer k, reverse nodes in every complete group of k nodes.

Nodes in a final incomplete group must remain in their original order.`,
    examples: [
      { input: "head = [1,2,3,4,5], k = 2", output: "[2,1,4,3,5]" },
      { input: "head = [1,2,3,4,5], k = 3", output: "[3,2,1,4,5]" },
      { input: "head = [1,2,3], k = 1", output: "[1,2,3]" },
    ],
    constraints: ["1 <= list length <= 5000", "1 <= k <= list length", "0 <= Node.val <= 1000", "Only complete groups of size k are reversed."],
    hints: ["First determine whether a full group of k nodes exists.", "A dummy node helps reconnect the reversed group to the previous group.", "Reverse pointers inside the group and then advance to the old group start."],
    signature: {"kind": "function", "name": "reverseKGroup", "params": [{"name": "head", "type": "ListNode"}, {"name": "k", "type": "int"}], "returns": "ListNode"},
    tests: [
      { args: [[1, 2, 3, 4, 5], 2], expected: [2, 1, 4, 3, 5] },
      { args: [[1, 2, 3, 4, 5], 3], expected: [3, 2, 1, 4, 5] },
      { args: [[1, 2, 3], 1], expected: [1, 2, 3] },
      { args: [[1], 1], expected: [1] },
      { args: [[1, 2, 3, 4], 4], expected: [4, 3, 2, 1] },
      { args: [[1, 2, 3, 4, 5, 6], 3], expected: [3, 2, 1, 6, 5, 4] },
      { args: [[1, 2, 3, 4, 5, 6, 7], 3], expected: [3, 2, 1, 6, 5, 4, 7] },
      { args: [[9, 8, 7, 6, 5], 2], expected: [8, 9, 6, 7, 5] },
    ],
    solutions: [
      {
        title: "Array of Nodes",
        explanation: `**Intuition.** Collect node references, reorder them group by group, then relink once.

**Steps.**
1. Traverse the list into an array.
2. Append each full block in reverse order.
3. Append incomplete blocks unchanged.
4. Relink nodes according to the new order.

**Why it is correct.** The constructed order exactly matches the required group transformation, and relinking applies it to original nodes.

**Pitfalls.** Set the final next to null to avoid an old link.`,
        time: "O(n)",
        space: "O(n)",
        python: `class Solution:
    def reverseKGroup(self, head: Optional[ListNode], k: int) -> Optional[ListNode]:
        nodes = []
        cur = head
        while cur:
            nodes.append(cur)
            cur = cur.next
        ordered = []
        for i in range(0, len(nodes), k):
            group = nodes[i:i + k]
            ordered.extend(reversed(group) if len(group) == k else group)
        dummy = ListNode()
        tail = dummy
        for node in ordered:
            tail.next = node
            tail = tail.next
        tail.next = None
        return dummy.next
`,
        cpp: `class Solution {
public:
    ListNode* reverseKGroup(ListNode* head, int k) {
        vector<ListNode*> nodes;
        for (ListNode* cur = head; cur; cur = cur->next) nodes.push_back(cur);
        vector<ListNode*> ordered;
        for (int i = 0; i < (int)nodes.size(); i += k) {
            int end = min(i + k, (int)nodes.size());
            if (end - i == k) for (int j = end - 1; j >= i; --j) ordered.push_back(nodes[j]);
            else for (int j = i; j < end; ++j) ordered.push_back(nodes[j]);
        }
        ListNode dummy; ListNode* tail = &dummy;
        for (ListNode* node : ordered) { tail->next = node; tail = tail->next; }
        tail->next = nullptr;
        return dummy.next;
    }
};`,
      },
      {
        title: "In-Place Group Reversal",
        explanation: `**Intuition.** Reverse one complete window at a time while reconnecting it to the processed prefix.

**Steps.**
1. From group_prev, find the kth node.
2. Remember the first node after the group.
3. Reverse pointers until reaching that node.
4. Connect the previous part to the new head and advance.

**Why it is correct.** Each iteration reverses exactly one complete group and reconnects it between the processed prefix and untouched suffix.

**Pitfalls.** The old group head becomes the tail; save it before rewiring.`,
        time: "O(n)",
        space: "O(1)",
        python: `class Solution:
    def reverseKGroup(self, head: Optional[ListNode], k: int) -> Optional[ListNode]:
        dummy = ListNode(0, head)
        group_prev = dummy
        while True:
            kth = group_prev
            for _ in range(k):
                kth = kth.next
                if not kth:
                    return dummy.next
            group_next = kth.next
            prev, cur = group_next, group_prev.next
            while cur is not group_next:
                nxt = cur.next
                cur.next = prev
                prev = cur
                cur = nxt
            tmp = group_prev.next
            group_prev.next = kth
            group_prev = tmp
`,
        cpp: `class Solution {
public:
    ListNode* reverseKGroup(ListNode* head, int k) {
        ListNode dummy(0, head);
        ListNode* groupPrev = &dummy;
        while (true) {
            ListNode* kth = groupPrev;
            for (int i = 0; i < k && kth; ++i) kth = kth->next;
            if (!kth) return dummy.next;
            ListNode* groupNext = kth->next;
            ListNode* prev = groupNext;
            ListNode* cur = groupPrev->next;
            while (cur != groupNext) {
                ListNode* nxt = cur->next;
                cur->next = prev;
                prev = cur;
                cur = nxt;
            }
            ListNode* oldStart = groupPrev->next;
            groupPrev->next = kth;
            groupPrev = oldStart;
        }
    }
};`,
      },
    ],
    viz: "linked-list",
  },
]

export default problems
