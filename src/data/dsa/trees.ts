import type { DsaProblem } from '../../types/content'

const problems: DsaProblem[] = [
  {
    id: "invert-binary-tree",
    title: "Invert Binary Tree",
    number: 226,
    difficulty: "Easy",
    category: "Trees",
    pattern: "Binary Tree DFS",
    description: `Swap every left child with its matching right child so the whole tree becomes a mirror image. Implement \`invertTree(root)\` and return the root of the modified tree.

The input and output use level-order arrays with \`null\` for missing children.`,
    examples: [{"input":"root = [4,2,7,1,3,6,9]","output":"[4,7,2,9,6,3,1]","explanation":"Every pair of children is mirrored."},{"input":"root = [2,1,3]","output":"[2,3,1]","explanation":"The two leaves trade places."},{"input":"root = []","output":"[]","explanation":"An empty tree stays empty."}],
    constraints: ["`0 <= number of nodes <= 100`","`-100 <= Node.val <= 100`","The tree may be balanced, sparse, or skewed."],
    hints: ["Mirroring a tree is a local operation at each node.","After swapping the children, the same operation is needed below both children.","A stack or queue can replace recursion if you visit every non-null node once."],
    signature: {"kind":"function","name":"invertTree","params":[{"name":"root","type":"TreeNode"}],"returns":"TreeNode"},
    tests: [{"args":[[4,2,7,1,3,6,9]],"expected":[4,7,2,9,6,3,1]},{"args":[[2,1,3]],"expected":[2,3,1]},{"args":[[]],"expected":[]},{"args":[[1]],"expected":[1]},{"args":[[1,2]],"expected":[1,null,2]},{"args":[[1,null,2,3]],"expected":[1,2,null,null,3]},{"args":[[-1,-2,-3,null,4]],"expected":[-1,-3,-2,null,null,4]},{"args":[[1,2,null,3,null,4]],"expected":[1,null,2,null,3,null,4]}],
    solutions: [
      {
        title: "Recursive DFS",
        explanation: `**Intuition.** Each subtree can be inverted independently, and then the current node only has to exchange the two inverted children.

**Steps.**
1. Return \`None\` for an empty subtree.
2. Recursively invert the original right and left subtrees.
3. Attach the inverted right subtree on the left and the inverted left subtree on the right.

**Correctness.** By induction on subtree size, both recursive calls return mirrored versions of their subtrees, and swapping them mirrors the current root as well.

**Pitfalls.** Do not lose one child while swapping; assign both sides together or save temporaries.`,
        time: "O(n)",
        space: "O(h)",
        python: `class Solution:
    def invertTree(self, root: Optional[TreeNode]) -> Optional[TreeNode]:
        if not root:
            return None
        root.left, root.right = self.invertTree(root.right), self.invertTree(root.left)
        return root`,
        cpp: `class Solution {
public:
    TreeNode* invertTree(TreeNode* root) {
        if (!root) return nullptr;
        TreeNode* left = invertTree(root->left);
        TreeNode* right = invertTree(root->right);
        root->left = right;
        root->right = left;
        return root;
    }
};`,
      },
      {
        title: "Iterative DFS",
        explanation: `**Intuition.** The same swaps can be done while explicitly walking the tree with a stack.

**Steps.**
1. Push the root if it exists.
2. Pop one node, swap its children, and push the non-null children.
3. Continue until every node has been processed.

**Correctness.** Every node is popped exactly once and its children are swapped exactly once, which is precisely the mirror transformation.

**Pitfalls.** Remember to push the children after the swap; either order is fine because every node is independent.`,
        time: "O(n)",
        space: "O(w)",
        python: `class Solution:
    def invertTree(self, root: Optional[TreeNode]) -> Optional[TreeNode]:
        if not root:
            return None
        stack = [root]
        while stack:
            node = stack.pop()
            node.left, node.right = node.right, node.left
            if node.left:
                stack.append(node.left)
            if node.right:
                stack.append(node.right)
        return root`,
        cpp: `class Solution {
public:
    TreeNode* invertTree(TreeNode* root) {
        if (!root) return nullptr;
        stack<TreeNode*> st;
        st.push(root);
        while (!st.empty()) {
            TreeNode* node = st.top(); st.pop();
            swap(node->left, node->right);
            if (node->left) st.push(node->left);
            if (node->right) st.push(node->right);
        }
        return root;
    }
};`,
      },
    ],
    viz: "tree-traversal",
  },
  {
    id: "maximum-depth-of-binary-tree",
    title: "Maximum Depth of Binary Tree",
    number: 104,
    difficulty: "Easy",
    category: "Trees",
    pattern: "Tree Height",
    description: `Find how many nodes are on the longest path from the root down to a leaf. Implement \`maxDepth(root)\` and return \`0\` when the tree is empty.`,
    examples: [{"input":"root = [3,9,20,null,null,15,7]","output":"3"},{"input":"root = [1,null,2]","output":"2"},{"input":"root = []","output":"0"}],
    constraints: ["`0 <= number of nodes <= 10^4`","`-100 <= Node.val <= 100`","Depth is measured in nodes, not edges."],
    hints: ["The depth of an empty subtree is zero.","A non-empty node contributes one level above the deeper child.","Breadth-first search can count levels without recursion."],
    signature: {"kind":"function","name":"maxDepth","params":[{"name":"root","type":"TreeNode"}],"returns":"int"},
    tests: [{"args":[[3,9,20,null,null,15,7]],"expected":3},{"args":[[1,null,2]],"expected":2},{"args":[[]],"expected":0},{"args":[[1]],"expected":1},{"args":[[1,2,null,3,null,4]],"expected":4},{"args":[[1,2,3,4,5]],"expected":3},{"args":[[-1,-2,-3,null,-4]],"expected":3},{"args":[[1,2,3,null,null,4,null,null,5]],"expected":4}],
    solutions: [
      {
        title: "Recursive Height",
        explanation: `**Intuition.** The maximum depth is exactly the height of the root.

**Steps.**
1. If the node is null, return \`0\`.
2. Compute the depth of the left and right subtrees.
3. Return one plus the larger child depth.

**Correctness.** The longest root-to-leaf path must go through exactly one child; choosing the larger correct child depth gives the correct root depth.

**Pitfalls.** Avoid returning edge count; a single node has depth \`1\`.`,
        time: "O(n)",
        space: "O(h)",
        python: `class Solution:
    def maxDepth(self, root: Optional[TreeNode]) -> int:
        if not root:
            return 0
        return 1 + max(self.maxDepth(root.left), self.maxDepth(root.right))`,
        cpp: `class Solution {
public:
    int maxDepth(TreeNode* root) {
        if (!root) return 0;
        return 1 + max(maxDepth(root->left), maxDepth(root->right));
    }
};`,
      },
      {
        title: "Level-order BFS",
        explanation: `**Intuition.** Each breadth-first layer corresponds to one depth level.

**Steps.**
1. Start a queue with the root.
2. For each current queue size, consume exactly one level.
3. Increment the depth counter after finishing a level.

**Correctness.** BFS processes nodes in increasing depth, so the number of completed layers equals the maximum depth when the queue empties.

**Pitfalls.** Do not let newly enqueued children change the current level size.`,
        time: "O(n)",
        space: "O(w)",
        python: `class Solution:
    def maxDepth(self, root: Optional[TreeNode]) -> int:
        if not root:
            return 0
        depth = 0
        q = deque([root])
        while q:
            depth += 1
            for _ in range(len(q)):
                node = q.popleft()
                if node.left:
                    q.append(node.left)
                if node.right:
                    q.append(node.right)
        return depth`,
        cpp: `class Solution {
public:
    int maxDepth(TreeNode* root) {
        if (!root) return 0;
        queue<TreeNode*> q;
        q.push(root);
        int depth = 0;
        while (!q.empty()) {
            int sz = (int)q.size();
            ++depth;
            while (sz--) {
                TreeNode* node = q.front(); q.pop();
                if (node->left) q.push(node->left);
                if (node->right) q.push(node->right);
            }
        }
        return depth;
    }
};`,
      },
    ],
    viz: "tree-traversal",
  },
  {
    id: "diameter-of-binary-tree",
    title: "Diameter of Binary Tree",
    number: 543,
    difficulty: "Easy",
    category: "Trees",
    pattern: "Postorder DFS",
    description: `Return the largest number of edges on any path between two nodes in the tree. The path may pass through the root, but it does not have to. Empty trees have diameter \`0\` in these tests.`,
    examples: [{"input":"root = [1,2,3,4,5]","output":"3"},{"input":"root = [1,2]","output":"1"},{"input":"root = []","output":"0"}],
    constraints: ["`0 <= number of nodes <= 10^4`","`-100 <= Node.val <= 100`","The answer counts edges, so a one-node tree has diameter `0`."],
    hints: ["A longest path through a node uses the deepest branch on each side.","You need subtree heights to evaluate a node as the highest point of a path.","Compute height and update the best diameter during one postorder traversal."],
    signature: {"kind":"function","name":"diameterOfBinaryTree","params":[{"name":"root","type":"TreeNode"}],"returns":"int"},
    tests: [{"args":[[1,2,3,4,5]],"expected":3},{"args":[[1,2]],"expected":1},{"args":[[]],"expected":0},{"args":[[1]],"expected":0},{"args":[[1,2,null,3,null,4]],"expected":3},{"args":[[1,2,3,4,null,null,5]],"expected":4},{"args":[[1,2,3,4,5,6,7]],"expected":4},{"args":[[-1,-2,-3,null,-4]],"expected":3}],
    solutions: [
      {
        title: "Recompute Heights",
        explanation: `**Intuition.** For every possible turning point, calculate the height of both children and keep the best sum.

**Steps.**
1. Write a helper that returns subtree height.
2. For each node, test \`height(left) + height(right)\`.
3. Recurse into both children to find diameters that do not pass through this node.

**Correctness.** Every path has a highest node where it turns from one side to the other; checking that node considers exactly that path length.

**Pitfalls.** This is simple but can revisit skewed subtrees many times.`,
        time: "O(nh)",
        space: "O(h)",
        python: `class Solution:
    def diameterOfBinaryTree(self, root: Optional[TreeNode]) -> int:
        def depth(node):
            if not node:
                return 0
            return 1 + max(depth(node.left), depth(node.right))
        def diameter(node):
            if not node:
                return 0
            through = depth(node.left) + depth(node.right)
            return max(through, diameter(node.left), diameter(node.right))
        return diameter(root)`,
        cpp: `class Solution {
    int depth(TreeNode* node) {
        if (!node) return 0;
        return 1 + max(depth(node->left), depth(node->right));
    }
    int diameter(TreeNode* node) {
        if (!node) return 0;
        int through = depth(node->left) + depth(node->right);
        return max(through, max(diameter(node->left), diameter(node->right)));
    }
public:
    int diameterOfBinaryTree(TreeNode* root) {
        return diameter(root);
    }
};`,
      },
      {
        title: "Single Postorder Pass",
        explanation: `**Intuition.** A postorder DFS can return height while updating the best diameter at the same time.

**Steps.**
1. Recurse into left and right children.
2. Their returned heights give the best path through the current node.
3. Update a shared best value and return one plus the larger height.

**Correctness.** The DFS computes correct child heights before using them, and every possible turning node updates the global maximum once.

**Pitfalls.** The returned height counts nodes downward, while the diameter update uses \`left + right\` edges.`,
        time: "O(n)",
        space: "O(h)",
        python: `class Solution:
    def diameterOfBinaryTree(self, root: Optional[TreeNode]) -> int:
        best = 0
        def height(node):
            nonlocal best
            if not node:
                return 0
            left = height(node.left)
            right = height(node.right)
            best = max(best, left + right)
            return 1 + max(left, right)
        height(root)
        return best`,
        cpp: `class Solution {
    int best = 0;
    int height(TreeNode* node) {
        if (!node) return 0;
        int left = height(node->left);
        int right = height(node->right);
        best = max(best, left + right);
        return 1 + max(left, right);
    }
public:
    int diameterOfBinaryTree(TreeNode* root) {
        height(root);
        return best;
    }
};`,
      },
    ],
    viz: "tree-traversal",
  },
  {
    id: "balanced-binary-tree",
    title: "Balanced Binary Tree",
    number: 110,
    difficulty: "Easy",
    category: "Trees",
    pattern: "Height Check",
    description: `Determine whether every node has left and right subtree heights differing by at most one. Implement \`isBalanced(root)\`; an empty tree is balanced.`,
    examples: [{"input":"root = [3,9,20,null,null,15,7]","output":"true"},{"input":"root = [1,2,2,3,3,null,null,4,4]","output":"false"},{"input":"root = []","output":"true"}],
    constraints: ["`0 <= number of nodes <= 5000`","`-10^4 <= Node.val <= 10^4`","Balance must hold at every node, not just the root."],
    hints: ["You need heights to decide whether a node is balanced.","A subtree known to be unbalanced can stop further work above it.","Return a sentinel such as `-1` instead of a real height when imbalance is found."],
    signature: {"kind":"function","name":"isBalanced","params":[{"name":"root","type":"TreeNode"}],"returns":"bool"},
    tests: [{"args":[[3,9,20,null,null,15,7]],"expected":true},{"args":[[1,2,2,3,3,null,null,4,4]],"expected":false},{"args":[[]],"expected":true},{"args":[[1]],"expected":true},{"args":[[1,2,null,3,null,4]],"expected":false},{"args":[[1,2,3,4,null,null,5]],"expected":true},{"args":[[1,2,2,3,null,null,3,4,null,null,4]],"expected":false},{"args":[[-1,-2,-3,-4,-5,-6,-7]],"expected":true}],
    solutions: [
      {
        title: "Height at Each Node",
        explanation: `**Intuition.** Directly ask each node for the heights of both children and recurse into children.

**Steps.**
1. Compute a \`height\` helper.
2. At each node, compare left and right heights.
3. Also require both child subtrees to be balanced.

**Correctness.** The definition of balance is local at each node plus balance of both children, and the recursion checks exactly those conditions.

**Pitfalls.** This repeats height work, especially on long chains.`,
        time: "O(nh)",
        space: "O(h)",
        python: `class Solution:
    def isBalanced(self, root: Optional[TreeNode]) -> bool:
        def height(node):
            if not node:
                return 0
            return 1 + max(height(node.left), height(node.right))
        if not root:
            return True
        return abs(height(root.left) - height(root.right)) <= 1 and self.isBalanced(root.left) and self.isBalanced(root.right)`,
        cpp: `class Solution {
    int height(TreeNode* node) {
        if (!node) return 0;
        return 1 + max(height(node->left), height(node->right));
    }
public:
    bool isBalanced(TreeNode* root) {
        if (!root) return true;
        return abs(height(root->left) - height(root->right)) <= 1 && isBalanced(root->left) && isBalanced(root->right);
    }
};`,
      },
      {
        title: "Bottom-up Sentinel",
        explanation: `**Intuition.** Combine height computation with balance validation in one traversal.

**Steps.**
1. Return \`0\` for null nodes.
2. If either child returns \`-1\`, propagate \`-1\`.
3. If the height gap is too large, return \`-1\`; otherwise return the real height.

**Correctness.** A non-negative return is the exact subtree height, while \`-1\` means that subtree is already invalid; the root is balanced exactly when the final return is not \`-1\`.

**Pitfalls.** Use \`abs(left - right) > 1\`, not \`>= 1\`.`,
        time: "O(n)",
        space: "O(h)",
        python: `class Solution:
    def isBalanced(self, root: Optional[TreeNode]) -> bool:
        def height(node):
            if not node:
                return 0
            left = height(node.left)
            if left == -1:
                return -1
            right = height(node.right)
            if right == -1 or abs(left - right) > 1:
                return -1
            return 1 + max(left, right)
        return height(root) != -1`,
        cpp: `class Solution {
    int height(TreeNode* node) {
        if (!node) return 0;
        int left = height(node->left);
        if (left == -1) return -1;
        int right = height(node->right);
        if (right == -1 || abs(left - right) > 1) return -1;
        return 1 + max(left, right);
    }
public:
    bool isBalanced(TreeNode* root) {
        return height(root) != -1;
    }
};`,
      },
    ],
    viz: "tree-traversal",
  },
  {
    id: "same-tree",
    title: "Same Tree",
    number: 100,
    difficulty: "Easy",
    category: "Trees",
    pattern: "Paired DFS",
    description: `Given two binary trees, decide whether their shapes and node values are identical. Implement \`isSameTree(p, q)\` and return a boolean.`,
    examples: [{"input":"p = [1,2,3], q = [1,2,3]","output":"true"},{"input":"p = [1,2], q = [1,null,2]","output":"false"},{"input":"p = [1,2,1], q = [1,1,2]","output":"false"}],
    constraints: ["`0 <= number of nodes in each tree <= 100`","`-10^4 <= Node.val <= 10^4`","Both structure and values must match."],
    hints: ["Compare corresponding nodes, not just traversals of values.","A null paired with a non-null node is immediately different.","If current values match, the left pair and right pair must also match."],
    signature: {"kind":"function","name":"isSameTree","params":[{"name":"p","type":"TreeNode"},{"name":"q","type":"TreeNode"}],"returns":"bool"},
    tests: [{"args":[[1,2,3],[1,2,3]],"expected":true},{"args":[[1,2],[1,null,2]],"expected":false},{"args":[[1,2,1],[1,1,2]],"expected":false},{"args":[[],[]],"expected":true},{"args":[[],[0]],"expected":false},{"args":[[1],[1]],"expected":true},{"args":[[1,-2,3],[1,-2,3]],"expected":true},{"args":[[1,2,null,3],[1,2,null,null,3]],"expected":false}],
    solutions: [
      {
        title: "Recursive Pair DFS",
        explanation: `**Intuition.** The two roots are the same only if the current nodes match and both child pairs are the same.

**Steps.**
1. Handle the cases where either node is null.
2. Compare current values.
3. Recurse on \`(left,left)\` and \`(right,right)\`.

**Correctness.** The recursion mirrors the definition of tree equality at every position, so it accepts exactly identical trees.

**Pitfalls.** Do not compare only inorder or preorder values; different shapes can share a traversal.`,
        time: "O(n)",
        space: "O(h)",
        python: `class Solution:
    def isSameTree(self, p: Optional[TreeNode], q: Optional[TreeNode]) -> bool:
        if not p or not q:
            return p is q
        return p.val == q.val and self.isSameTree(p.left, q.left) and self.isSameTree(p.right, q.right)`,
        cpp: `class Solution {
public:
    bool isSameTree(TreeNode* p, TreeNode* q) {
        if (!p || !q) return p == q;
        return p->val == q->val && isSameTree(p->left, q->left) && isSameTree(p->right, q->right);
    }
};`,
      },
      {
        title: "Iterative Stack",
        explanation: `**Intuition.** Store pairs of nodes that must correspond and check them one pair at a time.

**Steps.**
1. Push the root pair.
2. Pop a pair and validate the null/value cases.
3. Push the two child pairs whenever both nodes exist.

**Correctness.** Every corresponding position is checked once; any mismatch returns false, and if no mismatch is found all positions match.

**Pitfalls.** Push children in pairs from the same side.`,
        time: "O(n)",
        space: "O(w)",
        python: `class Solution:
    def isSameTree(self, p: Optional[TreeNode], q: Optional[TreeNode]) -> bool:
        stack = [(p, q)]
        while stack:
            a, b = stack.pop()
            if not a or not b:
                if a is not b:
                    return False
                continue
            if a.val != b.val:
                return False
            stack.append((a.left, b.left))
            stack.append((a.right, b.right))
        return True`,
        cpp: `class Solution {
public:
    bool isSameTree(TreeNode* p, TreeNode* q) {
        stack<pair<TreeNode*, TreeNode*>> st;
        st.push({p, q});
        while (!st.empty()) {
            auto [a, b] = st.top(); st.pop();
            if (!a || !b) {
                if (a != b) return false;
                continue;
            }
            if (a->val != b->val) return false;
            st.push({a->left, b->left});
            st.push({a->right, b->right});
        }
        return true;
    }
};`,
      },
    ],
    viz: "tree-traversal",
  },
  {
    id: "subtree-of-another-tree",
    title: "Subtree of Another Tree",
    number: 572,
    difficulty: "Easy",
    category: "Trees",
    pattern: "Tree Matching",
    description: `Return whether \`subRoot\` appears inside \`root\` with the same shape and values. For these practice tests, an empty \`subRoot\` is considered a subtree of any tree.`,
    examples: [{"input":"root = [3,4,5,1,2], subRoot = [4,1,2]","output":"true"},{"input":"root = [3,4,5,1,2,null,null,null,null,0], subRoot = [4,1,2]","output":"false"},{"input":"root = [1], subRoot = [1]","output":"true"}],
    constraints: ["`0 <= number of nodes <= 2000`","`-10^4 <= Node.val <= 10^4`","A match must include all descendants of the matched root."],
    hints: ["Try each node in `root` as the possible start of the match.","You need a helper for exact tree equality.","Serialization works if null children and value boundaries are encoded."],
    signature: {"kind":"function","name":"isSubtree","params":[{"name":"root","type":"TreeNode"},{"name":"subRoot","type":"TreeNode"}],"returns":"bool"},
    tests: [{"args":[[3,4,5,1,2],[4,1,2]],"expected":true},{"args":[[3,4,5,1,2,null,null,null,null,0],[4,1,2]],"expected":false},{"args":[[1],[1]],"expected":true},{"args":[[],[]],"expected":true},{"args":[[],[1]],"expected":false},{"args":[[1,2,3],[]],"expected":true},{"args":[[1,1],[1]],"expected":true},{"args":[[-1,-2,-3],[-2]],"expected":true},{"args":[[1,2,3,4],[2,4]],"expected":true}],
    solutions: [
      {
        title: "Try Every Root",
        explanation: `**Intuition.** At each node of the big tree, run a same-tree check against \`subRoot\`.

**Steps.**
1. If \`subRoot\` is empty, return true.
2. If the current root matches exactly, return true.
3. Otherwise search the left and right children.

**Correctness.** Any occurrence must start at some node of \`root\`; the algorithm checks all such starts and uses exact equality for the chosen start.

**Pitfalls.** Do not stop after matching only the top value; descendants must match too.`,
        time: "O(nm)",
        space: "O(h+m)",
        python: `class Solution:
    def isSubtree(self, root: Optional[TreeNode], subRoot: Optional[TreeNode]) -> bool:
        def same(a, b):
            if not a or not b:
                return a is b
            return a.val == b.val and same(a.left, b.left) and same(a.right, b.right)
        if not subRoot:
            return True
        if not root:
            return False
        return same(root, subRoot) or self.isSubtree(root.left, subRoot) or self.isSubtree(root.right, subRoot)`,
        cpp: `class Solution {
    bool same(TreeNode* a, TreeNode* b) {
        if (!a || !b) return a == b;
        return a->val == b->val && same(a->left, b->left) && same(a->right, b->right);
    }
public:
    bool isSubtree(TreeNode* root, TreeNode* subRoot) {
        if (!subRoot) return true;
        if (!root) return false;
        return same(root, subRoot) || isSubtree(root->left, subRoot) || isSubtree(root->right, subRoot);
    }
};`,
      },
      {
        title: "Preorder Serialization",
        explanation: `**Intuition.** Encode both trees with null markers, then reduce the question to substring search.

**Steps.**
1. Serialize nodes in preorder.
2. Include a marker for null children and a delimiter before values.
3. Check whether the serialized small tree appears in the large one.

**Correctness.** Preorder with null markers uniquely describes the tree shape and values, so a substring match corresponds to an identical rooted subtree.

**Pitfalls.** Without null markers or value delimiters, different trees or values like \`1\` and \`11\` can collide.`,
        time: "O(n + m)",
        space: "O(n + m)",
        python: `class Solution:
    def isSubtree(self, root: Optional[TreeNode], subRoot: Optional[TreeNode]) -> bool:
        def encode(node):
            if not node:
                return '#'
            return f'^{node.val},{encode(node.left)},{encode(node.right)}'
        return encode(subRoot) in encode(root)`,
        cpp: `class Solution {
    string encode(TreeNode* node) {
        if (!node) return "#";
        return "^" + to_string(node->val) + "," + encode(node->left) + "," + encode(node->right);
    }
public:
    bool isSubtree(TreeNode* root, TreeNode* subRoot) {
        string a = encode(root), b = encode(subRoot);
        return a.find(b) != string::npos;
    }
};`,
      },
    ],
    viz: "tree-traversal",
  },
  {
    id: "lowest-common-ancestor-of-a-binary-search-tree",
    title: "Lowest Common Ancestor of a Binary Search Tree",
    number: 235,
    difficulty: "Medium",
    category: "Trees",
    pattern: "BST Search",
    description: `Given a BST and references to two existing nodes \`p\` and \`q\`, return the node that is their deepest shared ancestor. In the tests, \`p\` and \`q\` are encoded as node values and the answer is reported as the returned node value.`,
    examples: [{"input":"root = [6,2,8,0,4,7,9,null,null,3,5], p = 2, q = 8","output":"6"},{"input":"root = [6,2,8,0,4,7,9,null,null,3,5], p = 2, q = 4","output":"2"},{"input":"root = [2,1], p = 2, q = 1","output":"2"}],
    constraints: ["`1 <= number of nodes <= 10^5`","All node values are unique.","`p` and `q` are guaranteed to be nodes in the tree.","The input tree satisfies the BST ordering rule."],
    hints: ["In a BST, all values left of a node are smaller and all values right are larger.","If both targets are smaller than the current node, the answer cannot be on the right.","The first node where the targets split, or one target equals the node, is the LCA."],
    signature: {"kind":"function","name":"lowestCommonAncestor","params":[{"name":"root","type":"TreeNode"},{"name":"p","type":"TreeNodeRef"},{"name":"q","type":"TreeNodeRef"}],"returns":"TreeNodeRef"},
    tests: [{"args":[[6,2,8,0,4,7,9,null,null,3,5],2,8],"expected":6},{"args":[[6,2,8,0,4,7,9,null,null,3,5],2,4],"expected":2},{"args":[[2,1],2,1],"expected":2},{"args":[[1],1,1],"expected":1},{"args":[[6,2,8,0,4,7,9,null,null,3,5],3,5],"expected":4},{"args":[[6,2,8,0,4,7,9,null,null,3,5],7,9],"expected":8},{"args":[[5,3,6,2,4,null,7],2,4],"expected":3},{"args":[[-10,-20,0,-30,-15],-30,-15],"expected":-20}],
    solutions: [
      {
        title: "Compare Root Paths",
        explanation: `**Intuition.** Build the BST search path from the root to each target and keep the last common node.

**Steps.**
1. Follow BST directions from the root to \`p\`, recording nodes.
2. Do the same for \`q\`.
3. Scan both paths together until they differ.

**Correctness.** The path from root to any BST node is unique, and common ancestors are exactly the common prefix of the two paths.

**Pitfalls.** Compare node identity or values from the same tree; do not create new nodes.`,
        time: "O(h)",
        space: "O(h)",
        python: `class Solution:
    def lowestCommonAncestor(self, root: 'TreeNode', p: 'TreeNode', q: 'TreeNode') -> 'TreeNode':
        def path(target):
            cur = root
            out = []
            while cur:
                out.append(cur)
                if target.val == cur.val:
                    break
                cur = cur.left if target.val < cur.val else cur.right
            return out
        a, b = path(p), path(q)
        ans = root
        for x, y in zip(a, b):
            if x is y:
                ans = x
            else:
                break
        return ans`,
        cpp: `class Solution {
    vector<TreeNode*> path(TreeNode* root, int target) {
        vector<TreeNode*> out;
        while (root) {
            out.push_back(root);
            if (target == root->val) break;
            root = target < root->val ? root->left : root->right;
        }
        return out;
    }
public:
    TreeNode* lowestCommonAncestor(TreeNode* root, TreeNode* p, TreeNode* q) {
        auto a = path(root, p->val), b = path(root, q->val);
        TreeNode* ans = root;
        for (size_t i = 0; i < min(a.size(), b.size()); ++i) {
            if (a[i] == b[i]) ans = a[i];
            else break;
        }
        return ans;
    }
};`,
      },
      {
        title: "One-pass BST Walk",
        explanation: `**Intuition.** The split point can be found without storing paths.

**Steps.**
1. Let \`lo\` and \`hi\` be the smaller and larger target values.
2. Move left while both targets are smaller than the current node.
3. Move right while both are larger; otherwise return the current node.

**Correctness.** Before the split, both targets lie in the same child subtree, so moving there preserves the answer. At the split, the current node is the lowest node containing both targets.

**Pitfalls.** Use strict comparisons; equality means one target is the ancestor.`,
        time: "O(h)",
        space: "O(1)",
        python: `class Solution:
    def lowestCommonAncestor(self, root: 'TreeNode', p: 'TreeNode', q: 'TreeNode') -> 'TreeNode':
        lo, hi = sorted((p.val, q.val))
        while root:
            if hi < root.val:
                root = root.left
            elif lo > root.val:
                root = root.right
            else:
                return root
        return None`,
        cpp: `class Solution {
public:
    TreeNode* lowestCommonAncestor(TreeNode* root, TreeNode* p, TreeNode* q) {
        int lo = min(p->val, q->val), hi = max(p->val, q->val);
        while (root) {
            if (hi < root->val) root = root->left;
            else if (lo > root->val) root = root->right;
            else return root;
        }
        return nullptr;
    }
};`,
      },
    ],
    viz: "tree-traversal",
  },
  {
    id: "binary-tree-level-order-traversal",
    title: "Binary Tree Level Order Traversal",
    number: 102,
    difficulty: "Medium",
    category: "Trees",
    pattern: "Breadth-first Search",
    description: `Return the node values grouped by depth from top to bottom and left to right within each level. Implement \`levelOrder(root)\`.`,
    examples: [{"input":"root = [3,9,20,null,null,15,7]","output":"[[3],[9,20],[15,7]]"},{"input":"root = [1]","output":"[[1]]"},{"input":"root = []","output":"[]"}],
    constraints: ["`0 <= number of nodes <= 2000`","`-1000 <= Node.val <= 1000`","Within a level, preserve left-to-right tree order."],
    hints: ["A queue naturally visits nodes by increasing depth.","The queue size at the start of a loop is exactly the current level length.","A DFS can also append values into a list indexed by depth."],
    signature: {"kind":"function","name":"levelOrder","params":[{"name":"root","type":"TreeNode"}],"returns":"int[][]"},
    tests: [{"args":[[3,9,20,null,null,15,7]],"expected":[[3],[9,20],[15,7]]},{"args":[[1]],"expected":[[1]]},{"args":[[]],"expected":[]},{"args":[[1,2,3,4,5]],"expected":[[1],[2,3],[4,5]]},{"args":[[1,null,2,3]],"expected":[[1],[2],[3]]},{"args":[[-1,-2,-3,null,-4]],"expected":[[-1],[-2,-3],[-4]]},{"args":[[1,2,null,3,null,4]],"expected":[[1],[2],[3],[4]]},{"args":[[1,2,3,null,5,6,null,7]],"expected":[[1],[2,3],[5,6],[7]]}],
    solutions: [
      {
        title: "Queue BFS",
        explanation: `**Intuition.** Process one queue layer at a time.

**Steps.**
1. Return an empty list for an empty root.
2. For each loop, record the current queue length.
3. Pop exactly that many nodes, append their children, and store the level values.

**Correctness.** BFS enqueues children after their parents, and fixed-size level loops separate nodes by depth, so every output row is exactly one level.

**Pitfalls.** Do not iterate directly over a queue that is growing with children.`,
        time: "O(n)",
        space: "O(w)",
        python: `class Solution:
    def levelOrder(self, root: Optional[TreeNode]) -> List[List[int]]:
        if not root:
            return []
        ans = []
        q = deque([root])
        while q:
            level = []
            for _ in range(len(q)):
                node = q.popleft()
                level.append(node.val)
                if node.left:
                    q.append(node.left)
                if node.right:
                    q.append(node.right)
            ans.append(level)
        return ans`,
        cpp: `class Solution {
public:
    vector<vector<int>> levelOrder(TreeNode* root) {
        vector<vector<int>> ans;
        if (!root) return ans;
        queue<TreeNode*> q;
        q.push(root);
        while (!q.empty()) {
            int sz = (int)q.size();
            vector<int> level;
            while (sz--) {
                TreeNode* node = q.front(); q.pop();
                level.push_back(node->val);
                if (node->left) q.push(node->left);
                if (node->right) q.push(node->right);
            }
            ans.push_back(level);
        }
        return ans;
    }
};`,
      },
      {
        title: "DFS by Depth",
        explanation: `**Intuition.** Depth-first traversal can create the row for a depth the first time it reaches it.

**Steps.**
1. Keep an answer array of rows.
2. When visiting a node at a new depth, append an empty row.
3. Append the value, then visit left and right children at depth plus one.

**Correctness.** Each node is placed into the row matching its recursive depth, and left recursion before right recursion preserves left-to-right order.

**Pitfalls.** Use \`depth == len(ans)\` to create exactly one row per depth.`,
        time: "O(n)",
        space: "O(h)",
        python: `class Solution:
    def levelOrder(self, root: Optional[TreeNode]) -> List[List[int]]:
        ans = []
        def dfs(node, depth):
            if not node:
                return
            if depth == len(ans):
                ans.append([])
            ans[depth].append(node.val)
            dfs(node.left, depth + 1)
            dfs(node.right, depth + 1)
        dfs(root, 0)
        return ans`,
        cpp: `class Solution {
    vector<vector<int>> ans;
    void dfs(TreeNode* node, int depth) {
        if (!node) return;
        if (depth == (int)ans.size()) ans.push_back({});
        ans[depth].push_back(node->val);
        dfs(node->left, depth + 1);
        dfs(node->right, depth + 1);
    }
public:
    vector<vector<int>> levelOrder(TreeNode* root) {
        dfs(root, 0);
        return ans;
    }
};`,
      },
    ],
    viz: "tree-traversal",
  },
  {
    id: "binary-tree-right-side-view",
    title: "Binary Tree Right Side View",
    number: 199,
    difficulty: "Medium",
    category: "Trees",
    pattern: "Level Traversal",
    description: `List the values visible when the tree is viewed from its right side. That is, return the last node encountered at each depth when scanning left to right.`,
    examples: [{"input":"root = [1,2,3,null,5,null,4]","output":"[1,3,4]"},{"input":"root = [1,null,3]","output":"[1,3]"},{"input":"root = []","output":"[]"}],
    constraints: ["`0 <= number of nodes <= 100`","`-100 <= Node.val <= 100`","Only one value is returned per depth."],
    hints: ["The visible node at a depth is the rightmost node on that level.","Level-order traversal can remember the last value in each level.","A right-first DFS records the first node seen at each depth."],
    signature: {"kind":"function","name":"rightSideView","params":[{"name":"root","type":"TreeNode"}],"returns":"int[]"},
    tests: [{"args":[[1,2,3,null,5,null,4]],"expected":[1,3,4]},{"args":[[1,null,3]],"expected":[1,3]},{"args":[[]],"expected":[]},{"args":[[1]],"expected":[1]},{"args":[[1,2,3,4]],"expected":[1,3,4]},{"args":[[1,2,null,3,null,4]],"expected":[1,2,3,4]},{"args":[[-1,-2,-3,null,-4]],"expected":[-1,-3,-4]},{"args":[[1,2,3,null,5,6,null,7]],"expected":[1,3,6,7]}],
    solutions: [
      {
        title: "BFS Last in Level",
        explanation: `**Intuition.** Use the same level traversal as level order, but keep only the last value from each layer.

**Steps.**
1. Traverse with a queue.
2. For each level, overwrite a \`rightmost\` variable as nodes are popped.
3. Append that value after the level ends.

**Correctness.** Nodes in a level are popped from left to right, so the final popped value is exactly the rightmost visible node.

**Pitfalls.** Initialize the per-level value inside the loop so old levels do not leak.`,
        time: "O(n)",
        space: "O(w)",
        python: `class Solution:
    def rightSideView(self, root: Optional[TreeNode]) -> List[int]:
        if not root:
            return []
        ans = []
        q = deque([root])
        while q:
            rightmost = None
            for _ in range(len(q)):
                node = q.popleft()
                rightmost = node.val
                if node.left:
                    q.append(node.left)
                if node.right:
                    q.append(node.right)
            ans.append(rightmost)
        return ans`,
        cpp: `class Solution {
public:
    vector<int> rightSideView(TreeNode* root) {
        vector<int> ans;
        if (!root) return ans;
        queue<TreeNode*> q;
        q.push(root);
        while (!q.empty()) {
            int sz = (int)q.size();
            int rightmost = 0;
            while (sz--) {
                TreeNode* node = q.front(); q.pop();
                rightmost = node->val;
                if (node->left) q.push(node->left);
                if (node->right) q.push(node->right);
            }
            ans.push_back(rightmost);
        }
        return ans;
    }
};`,
      },
      {
        title: "Right-first DFS",
        explanation: `**Intuition.** Visit the right child before the left child and capture the first node seen at each depth.

**Steps.**
1. Start DFS at depth \`0\`.
2. If this depth has not been recorded, append the current value.
3. Recurse to the right, then to the left.

**Correctness.** Because right children are visited first, the first node reached at each depth is the rightmost node at that depth.

**Pitfalls.** The order of recursive calls is what makes this work.`,
        time: "O(n)",
        space: "O(h)",
        python: `class Solution:
    def rightSideView(self, root: Optional[TreeNode]) -> List[int]:
        ans = []
        def dfs(node, depth):
            if not node:
                return
            if depth == len(ans):
                ans.append(node.val)
            dfs(node.right, depth + 1)
            dfs(node.left, depth + 1)
        dfs(root, 0)
        return ans`,
        cpp: `class Solution {
    vector<int> ans;
    void dfs(TreeNode* node, int depth) {
        if (!node) return;
        if (depth == (int)ans.size()) ans.push_back(node->val);
        dfs(node->right, depth + 1);
        dfs(node->left, depth + 1);
    }
public:
    vector<int> rightSideView(TreeNode* root) {
        dfs(root, 0);
        return ans;
    }
};`,
      },
    ],
    viz: "tree-traversal",
  },
  {
    id: "count-good-nodes-in-binary-tree",
    title: "Count Good Nodes in Binary Tree",
    number: 1448,
    difficulty: "Medium",
    category: "Trees",
    pattern: "Path Maximum DFS",
    description: `A node is good when no ancestor on the root-to-node path has a value greater than it. Count all good nodes; an empty tree contributes \`0\`.`,
    examples: [{"input":"root = [3,1,4,3,null,1,5]","output":"4"},{"input":"root = [3,3,null,4,2]","output":"3"},{"input":"root = [1]","output":"1"}],
    constraints: ["`0 <= number of nodes <= 10^5`","`-10^4 <= Node.val <= 10^4`","A node compares against ancestors only, not descendants."],
    hints: ["While walking downward, remember the maximum value seen so far.","The root is always good if it exists.","Pass the updated maximum into both child calls."],
    signature: {"kind":"function","name":"goodNodes","params":[{"name":"root","type":"TreeNode"}],"returns":"int"},
    tests: [{"args":[[3,1,4,3,null,1,5]],"expected":4},{"args":[[3,3,null,4,2]],"expected":3},{"args":[[1]],"expected":1},{"args":[[]],"expected":0},{"args":[[-1,-2,-3]],"expected":1},{"args":[[1,null,2,null,3]],"expected":3},{"args":[[3,2,null,1]],"expected":1},{"args":[[2,2,2]],"expected":3},{"args":[[0,-1,1,-2,0]],"expected":3}],
    solutions: [
      {
        title: "Recursive Path Maximum",
        explanation: `**Intuition.** Carry the best ancestor value down the recursion.

**Steps.**
1. Start with negative infinity.
2. At each node, count it if \`node.val >= best\`.
3. Update \`best\` and recurse into both children.

**Correctness.** For each node, \`best\` is exactly the maximum value on the path above it, so the comparison matches the definition of good.

**Pitfalls.** Equal values are allowed; the node is bad only if an ancestor is greater.`,
        time: "O(n)",
        space: "O(h)",
        python: `class Solution:
    def goodNodes(self, root: TreeNode) -> int:
        def dfs(node, best):
            if not node:
                return 0
            good = 1 if node.val >= best else 0
            best = max(best, node.val)
            return good + dfs(node.left, best) + dfs(node.right, best)
        return dfs(root, float('-inf'))`,
        cpp: `class Solution {
    int dfs(TreeNode* node, int best) {
        if (!node) return 0;
        int good = node->val >= best ? 1 : 0;
        best = max(best, node->val);
        return good + dfs(node->left, best) + dfs(node->right, best);
    }
public:
    int goodNodes(TreeNode* root) {
        return dfs(root, INT_MIN);
    }
};`,
      },
      {
        title: "Iterative Stack",
        explanation: `**Intuition.** Store each node together with the path maximum that applies to it.

**Steps.**
1. Push the root and its value.
2. Pop a node, update the answer if it is good.
3. Push children with the maximum of the old best and current value.

**Correctness.** The stack state maintains the same invariant as recursion: each node is paired with the maximum on its root path so far.

**Pitfalls.** Handle an empty root before reading \`root.val\`.`,
        time: "O(n)",
        space: "O(h)",
        python: `class Solution:
    def goodNodes(self, root: TreeNode) -> int:
        if not root:
            return 0
        ans = 0
        stack = [(root, root.val)]
        while stack:
            node, best = stack.pop()
            if node.val >= best:
                ans += 1
            best = max(best, node.val)
            if node.left:
                stack.append((node.left, best))
            if node.right:
                stack.append((node.right, best))
        return ans`,
        cpp: `class Solution {
public:
    int goodNodes(TreeNode* root) {
        if (!root) return 0;
        int ans = 0;
        stack<pair<TreeNode*, int>> st;
        st.push({root, root->val});
        while (!st.empty()) {
            auto [node, best] = st.top(); st.pop();
            if (node->val >= best) ++ans;
            best = max(best, node->val);
            if (node->left) st.push({node->left, best});
            if (node->right) st.push({node->right, best});
        }
        return ans;
    }
};`,
      },
    ],
    viz: "tree-traversal",
  },
  {
    id: "validate-binary-search-tree",
    title: "Validate Binary Search Tree",
    number: 98,
    difficulty: "Medium",
    category: "Trees",
    pattern: "BST Bounds",
    description: `Return whether a binary tree obeys the strict BST rule: every left descendant is smaller than the node and every right descendant is larger. Duplicate values make the tree invalid.`,
    examples: [{"input":"root = [2,1,3]","output":"true"},{"input":"root = [5,1,4,null,null,3,6]","output":"false"},{"input":"root = []","output":"true"}],
    constraints: ["`0 <= number of nodes <= 10^4`","`-2^31 <= Node.val <= 2^31 - 1`","All descendants, not only direct children, must respect the bounds."],
    hints: ["Inorder traversal of a valid BST is strictly increasing.","Alternatively, each recursive call can carry an allowed `(low, high)` range.","Use open intervals; equality with a bound is invalid."],
    signature: {"kind":"function","name":"isValidBST","params":[{"name":"root","type":"TreeNode"}],"returns":"bool"},
    tests: [{"args":[[2,1,3]],"expected":true},{"args":[[5,1,4,null,null,3,6]],"expected":false},{"args":[[]],"expected":true},{"args":[[1]],"expected":true},{"args":[[2,2,2]],"expected":false},{"args":[[5,4,6,null,null,3,7]],"expected":false},{"args":[[-2147483648,null,2147483647]],"expected":true},{"args":[[3,1,5,0,2,4,6]],"expected":true},{"args":[[1,null,1]],"expected":false}],
    solutions: [
      {
        title: "Inorder Check",
        explanation: `**Intuition.** A valid BST yields values in strictly increasing order when traversed inorder.

**Steps.**
1. Collect values from left-root-right traversal.
2. Scan adjacent values.
3. Return false if any value is not strictly smaller than the next.

**Correctness.** Inorder visits BST values in sorted order; strict increase is both necessary and sufficient for the global BST property.

**Pitfalls.** This stores all values; also remember duplicates are invalid.`,
        time: "O(n)",
        space: "O(n)",
        python: `class Solution:
    def isValidBST(self, root: Optional[TreeNode]) -> bool:
        vals = []
        def dfs(node):
            if not node:
                return
            dfs(node.left)
            vals.append(node.val)
            dfs(node.right)
        dfs(root)
        return all(vals[i] < vals[i + 1] for i in range(len(vals) - 1))`,
        cpp: `class Solution {
    void dfs(TreeNode* node, vector<int>& vals) {
        if (!node) return;
        dfs(node->left, vals);
        vals.push_back(node->val);
        dfs(node->right, vals);
    }
public:
    bool isValidBST(TreeNode* root) {
        vector<int> vals;
        dfs(root, vals);
        for (int i = 0; i + 1 < (int)vals.size(); ++i) if (vals[i] >= vals[i + 1]) return false;
        return true;
    }
};`,
      },
      {
        title: "Recursive Bounds",
        explanation: `**Intuition.** Each node must fit inside the range imposed by all ancestors.

**Steps.**
1. Start with infinite bounds.
2. For a left child, tighten the upper bound to the current value.
3. For a right child, tighten the lower bound to the current value.

**Correctness.** The bounds encode exactly every ancestor constraint, so if all nodes fit their ranges the whole tree satisfies the BST definition.

**Pitfalls.** Use \`long long\` bounds in C++ to handle extreme integer node values.`,
        time: "O(n)",
        space: "O(h)",
        python: `class Solution:
    def isValidBST(self, root: Optional[TreeNode]) -> bool:
        def dfs(node, lo, hi):
            if not node:
                return True
            return lo < node.val < hi and dfs(node.left, lo, node.val) and dfs(node.right, node.val, hi)
        return dfs(root, float('-inf'), float('inf'))`,
        cpp: `class Solution {
    bool dfs(TreeNode* node, long long lo, long long hi) {
        if (!node) return true;
        return lo < node->val && node->val < hi && dfs(node->left, lo, node->val) && dfs(node->right, node->val, hi);
    }
public:
    bool isValidBST(TreeNode* root) {
        return dfs(root, LLONG_MIN, LLONG_MAX);
    }
};`,
      },
    ],
    viz: "tree-traversal",
  },
  {
    id: "kth-smallest-element-in-a-bst",
    title: "Kth Smallest Element in a BST",
    number: 230,
    difficulty: "Medium",
    category: "Trees",
    pattern: "Inorder Traversal",
    description: `Given a non-empty BST and an integer \`k\`, return the \`k\`th smallest node value. The ordering is the natural sorted order of the BST values.`,
    examples: [{"input":"root = [3,1,4,null,2], k = 1","output":"1"},{"input":"root = [5,3,6,2,4,null,null,1], k = 3","output":"3"},{"input":"root = [1], k = 1","output":"1"}],
    constraints: ["`1 <= number of nodes <= 10^4`","`1 <= k <= number of nodes`","All node values are unique."],
    hints: ["Inorder traversal of a BST visits values in sorted order.","You can collect all values, then index into the list.","For better space, stop the inorder traversal as soon as the `k`th value is popped."],
    signature: {"kind":"function","name":"kthSmallest","params":[{"name":"root","type":"TreeNode"},{"name":"k","type":"int"}],"returns":"int"},
    tests: [{"args":[[3,1,4,null,2],1],"expected":1},{"args":[[5,3,6,2,4,null,null,1],3],"expected":3},{"args":[[1],1],"expected":1},{"args":[[2,1,3],2],"expected":2},{"args":[[5,3,7,2,4,6,8],7],"expected":8},{"args":[[-3,-4,-2],2],"expected":-3},{"args":[[1,null,2,null,3],3],"expected":3},{"args":[[10,5,15,3,7,12,18],4],"expected":10}],
    solutions: [
      {
        title: "Collect Inorder Values",
        explanation: `**Intuition.** Turn the BST into a sorted list by inorder traversal.

**Steps.**
1. Traverse left subtree, current node, then right subtree.
2. Store each value in an array.
3. Return element \`k - 1\`.

**Correctness.** Inorder traversal of a BST is sorted increasingly, so the \`k - 1\` index is exactly the kth smallest value.

**Pitfalls.** This is simple but does unnecessary work when \`k\` is small.`,
        time: "O(n)",
        space: "O(n)",
        python: `class Solution:
    def kthSmallest(self, root: Optional[TreeNode], k: int) -> int:
        vals = []
        def dfs(node):
            if not node:
                return
            dfs(node.left)
            vals.append(node.val)
            dfs(node.right)
        dfs(root)
        return vals[k - 1]`,
        cpp: `class Solution {
    void dfs(TreeNode* node, vector<int>& vals) {
        if (!node) return;
        dfs(node->left, vals);
        vals.push_back(node->val);
        dfs(node->right, vals);
    }
public:
    int kthSmallest(TreeNode* root, int k) {
        vector<int> vals;
        dfs(root, vals);
        return vals[k - 1];
    }
};`,
      },
      {
        title: "Iterative Early Stop",
        explanation: `**Intuition.** Simulate inorder traversal with a stack and stop when the kth node is visited.

**Steps.**
1. Push the left spine.
2. Pop the next smallest node and decrement \`k\`.
3. When \`k\` reaches zero, return that node value; otherwise continue with its right subtree.

**Correctness.** The stack-based traversal visits nodes in the same sorted order as recursive inorder, so the kth pop is the answer.

**Pitfalls.** Decrement \`k\` when a node is visited, not when it is pushed.`,
        time: "O(h + k)",
        space: "O(h)",
        python: `class Solution:
    def kthSmallest(self, root: Optional[TreeNode], k: int) -> int:
        stack = []
        cur = root
        while cur or stack:
            while cur:
                stack.append(cur)
                cur = cur.left
            cur = stack.pop()
            k -= 1
            if k == 0:
                return cur.val
            cur = cur.right
        return -1`,
        cpp: `class Solution {
public:
    int kthSmallest(TreeNode* root, int k) {
        stack<TreeNode*> st;
        TreeNode* cur = root;
        while (cur || !st.empty()) {
            while (cur) {
                st.push(cur);
                cur = cur->left;
            }
            cur = st.top(); st.pop();
            if (--k == 0) return cur->val;
            cur = cur->right;
        }
        return -1;
    }
};`,
      },
    ],
    viz: "tree-traversal",
  },
  {
    id: "construct-binary-tree-from-preorder-and-inorder-traversal",
    title: "Construct Binary Tree from Preorder and Inorder Traversal",
    number: 105,
    difficulty: "Medium",
    category: "Trees",
    pattern: "Divide and Conquer",
    description: `Rebuild the unique binary tree described by its preorder and inorder traversals. Values are unique, and the function should return the root of the reconstructed tree.`,
    examples: [{"input":"preorder = [3,9,20,15,7], inorder = [9,3,15,20,7]","output":"[3,9,20,null,null,15,7]"},{"input":"preorder = [-1], inorder = [-1]","output":"[-1]"},{"input":"preorder = [1,2,3], inorder = [3,2,1]","output":"[1,2,null,3]"}],
    constraints: ["`0 <= preorder.length == inorder.length <= 3000`","All values are unique.","Both arrays describe the same tree."],
    hints: ["The first preorder value is always the root of the current subtree.","That root splits the inorder array into left and right subtrees.","A hashmap from value to inorder index avoids repeated linear searches."],
    signature: {"kind":"function","name":"buildTree","params":[{"name":"preorder","type":"int[]"},{"name":"inorder","type":"int[]"}],"returns":"TreeNode"},
    tests: [{"args":[[3,9,20,15,7],[9,3,15,20,7]],"expected":[3,9,20,null,null,15,7]},{"args":[[-1],[-1]],"expected":[-1]},{"args":[[1,2,3],[3,2,1]],"expected":[1,2,null,3]},{"args":[[],[]],"expected":[]},{"args":[[1,2,3],[1,2,3]],"expected":[1,null,2,null,3]},{"args":[[1,2,4,5,3],[4,2,5,1,3]],"expected":[1,2,3,4,5]},{"args":[[0,-1,-2,1],[-2,-1,0,1]],"expected":[0,-1,1,-2]},{"args":[[7,3,1,5,9],[1,3,5,7,9]],"expected":[7,3,9,1,5]}],
    solutions: [
      {
        title: "Split Arrays Recursively",
        explanation: `**Intuition.** Use preorder to choose roots and inorder slices to determine subtree sizes.

**Steps.**
1. If the traversal slice is empty, return null.
2. Use the first preorder value as the root.
3. Find it in inorder, then recursively build left and right slices.

**Correctness.** Preorder identifies the current root, and inorder uniquely partitions all remaining values into the root’s left and right subtrees.

**Pitfalls.** Array slicing in Python is clear but can add extra cost.`,
        time: "O(n^2)",
        space: "O(n^2)",
        python: `class Solution:
    def buildTree(self, preorder: List[int], inorder: List[int]) -> Optional[TreeNode]:
        if not preorder:
            return None
        root_val = preorder[0]
        mid = inorder.index(root_val)
        root = TreeNode(root_val)
        root.left = self.buildTree(preorder[1:1 + mid], inorder[:mid])
        root.right = self.buildTree(preorder[1 + mid:], inorder[mid + 1:])
        return root`,
        cpp: `class Solution {
    TreeNode* build(vector<int>& preorder, int ps, int pe, vector<int>& inorder, int is, int ie) {
        if (ps > pe) return nullptr;
        int rootVal = preorder[ps];
        int mid = is;
        while (inorder[mid] != rootVal) ++mid;
        int leftSize = mid - is;
        TreeNode* root = new TreeNode(rootVal);
        root->left = build(preorder, ps + 1, ps + leftSize, inorder, is, mid - 1);
        root->right = build(preorder, ps + leftSize + 1, pe, inorder, mid + 1, ie);
        return root;
    }
public:
    TreeNode* buildTree(vector<int>& preorder, vector<int>& inorder) {
        if (preorder.empty()) return nullptr;
        return build(preorder, 0, (int)preorder.size() - 1, inorder, 0, (int)inorder.size() - 1);
    }
};`,
      },
      {
        title: "Index Map + Preorder Pointer",
        explanation: `**Intuition.** Keep one preorder index and look up inorder split positions in constant time.

**Steps.**
1. Build a value-to-inorder-index map.
2. Recursive calls receive inorder bounds.
3. Consume one preorder value for each created node.

**Correctness.** Each recursive range contains exactly one subtree; the next preorder value is its root, and the map split assigns every value to the correct child range.

**Pitfalls.** Build the left subtree before the right because preorder lists left subtree nodes first.`,
        time: "O(n)",
        space: "O(n)",
        python: `class Solution:
    def buildTree(self, preorder: List[int], inorder: List[int]) -> Optional[TreeNode]:
        pos = {v: i for i, v in enumerate(inorder)}
        pre_i = 0
        def build(lo, hi):
            nonlocal pre_i
            if lo > hi:
                return None
            val = preorder[pre_i]
            pre_i += 1
            root = TreeNode(val)
            mid = pos[val]
            root.left = build(lo, mid - 1)
            root.right = build(mid + 1, hi)
            return root
        return build(0, len(inorder) - 1)`,
        cpp: `class Solution {
    unordered_map<int, int> pos;
    int pre = 0;
    TreeNode* build(vector<int>& preorder, int lo, int hi) {
        if (lo > hi) return nullptr;
        int val = preorder[pre++];
        TreeNode* root = new TreeNode(val);
        int mid = pos[val];
        root->left = build(preorder, lo, mid - 1);
        root->right = build(preorder, mid + 1, hi);
        return root;
    }
public:
    TreeNode* buildTree(vector<int>& preorder, vector<int>& inorder) {
        if (preorder.empty()) return nullptr;
        for (int i = 0; i < (int)inorder.size(); ++i) pos[inorder[i]] = i;
        return build(preorder, 0, (int)inorder.size() - 1);
    }
};`,
      },
    ],
    viz: "tree-traversal",
  },
  {
    id: "binary-tree-maximum-path-sum",
    title: "Binary Tree Maximum Path Sum",
    number: 124,
    difficulty: "Hard",
    category: "Trees",
    pattern: "Tree DP",
    description: `A path may start and end at any two nodes, but it must follow parent-child edges and cannot reuse a node. Return the largest possible sum. For the empty-tree practice case, return \`0\`.`,
    examples: [{"input":"root = [1,2,3]","output":"6"},{"input":"root = [-10,9,20,null,null,15,7]","output":"42"},{"input":"root = [-3]","output":"-3"}],
    constraints: ["`0 <= number of nodes <= 3 * 10^4`","`-1000 <= Node.val <= 1000`","A non-empty path contains at least one node."],
    hints: ["A path can bend at one node, using one branch from each side.","The value returned to a parent can only include one downward branch.","Ignore negative downward gains when extending a path through a node."],
    signature: {"kind":"function","name":"maxPathSum","params":[{"name":"root","type":"TreeNode"}],"returns":"int"},
    tests: [{"args":[[1,2,3]],"expected":6},{"args":[[-10,9,20,null,null,15,7]],"expected":42},{"args":[[-3]],"expected":-3},{"args":[[]],"expected":0},{"args":[[2,-1]],"expected":2},{"args":[[-2,-1]],"expected":-1},{"args":[[1,2,null,3,null,4]],"expected":10},{"args":[[5,4,8,11,null,13,4,7,2,null,null,null,1]],"expected":48},{"args":[[-1,-2,-3,-4,-5]],"expected":-1},{"args":[[1,-2,3]],"expected":4}],
    solutions: [
      {
        title: "Recompute Gains",
        explanation: `**Intuition.** For every node, compute the best downward gain from each child and use the node as the bend point.

**Steps.**
1. Write a helper that returns the best downward path from a node.
2. Visit each node and combine positive left and right gains through it.
3. Track the best sum found anywhere.

**Correctness.** Every valid path has a highest node; when that node is visited, combining the best non-negative downward gains from both sides gives the best path with that highest node.

**Pitfalls.** All-negative trees still need the largest single node, so initialize the best answer very small.`,
        time: "O(nh)",
        space: "O(h)",
        python: `class Solution:
    def maxPathSum(self, root: Optional[TreeNode]) -> int:
        if not root:
            return 0
        best = -10**18
        def gain(node):
            if not node:
                return 0
            return node.val + max(0, gain(node.left), gain(node.right))
        def visit(node):
            nonlocal best
            if not node:
                return
            best = max(best, node.val + max(0, gain(node.left)) + max(0, gain(node.right)))
            visit(node.left)
            visit(node.right)
        visit(root)
        return best`,
        cpp: `class Solution {
    int gain(TreeNode* node) {
        if (!node) return 0;
        return node->val + max({0, gain(node->left), gain(node->right)});
    }
    void visit(TreeNode* node, int& best) {
        if (!node) return;
        best = max(best, node->val + max(0, gain(node->left)) + max(0, gain(node->right)));
        visit(node->left, best);
        visit(node->right, best);
    }
public:
    int maxPathSum(TreeNode* root) {
        if (!root) return 0;
        int best = INT_MIN;
        visit(root, best);
        return best;
    }
};`,
      },
      {
        title: "One-pass Tree DP",
        explanation: `**Intuition.** Compute the downward gain and global best in the same postorder traversal.

**Steps.**
1. Get left and right downward gains from children.
2. Clamp negative gains to zero.
3. Update the answer with \`node.val + left + right\`, then return \`node.val + max(left, right)\`.

**Correctness.** Postorder ensures child gains are optimal before a node is evaluated; each possible bend node updates the global maximum exactly once.

**Pitfalls.** The value returned upward cannot include both children, or the parent path would fork.`,
        time: "O(n)",
        space: "O(h)",
        python: `class Solution:
    def maxPathSum(self, root: Optional[TreeNode]) -> int:
        if not root:
            return 0
        best = -10**18
        def dfs(node):
            nonlocal best
            if not node:
                return 0
            left = max(0, dfs(node.left))
            right = max(0, dfs(node.right))
            best = max(best, node.val + left + right)
            return node.val + max(left, right)
        dfs(root)
        return best`,
        cpp: `class Solution {
    int best = INT_MIN;
    int dfs(TreeNode* node) {
        if (!node) return 0;
        int left = max(0, dfs(node->left));
        int right = max(0, dfs(node->right));
        best = max(best, node->val + left + right);
        return node->val + max(left, right);
    }
public:
    int maxPathSum(TreeNode* root) {
        if (!root) return 0;
        dfs(root);
        return best;
    }
};`,
      },
    ],
    viz: "tree-traversal",
  },
  {
    id: "serialize-and-deserialize-binary-tree",
    title: "Serialize and Deserialize Binary Tree",
    number: 297,
    difficulty: "Hard",
    category: "Trees",
    pattern: "Tree Encoding",
    description: `Design a \`Codec\` class that converts a binary tree into a string and reconstructs an equivalent tree from that string. The judge checks that \`deserialize(serialize(root))\` has the same level-order structure and values as \`root\`.`,
    examples: [{"input":"root = [1,2,3,null,null,4,5]","output":"[1,2,3,null,null,4,5]","explanation":"Round-tripping the string recreates the same tree."},{"input":"root = []","output":"[]","explanation":"The empty tree may be represented by an empty string or a null marker."},{"input":"root = [1]","output":"[1]","explanation":"A one-node tree returns to the same one-node shape."}],
    constraints: ["`0 <= number of nodes <= 10^4`","`-1000 <= Node.val <= 1000`","The serialized format may be any deterministic string your `deserialize` understands."],
    hints: ["A traversal must record missing children, or different shapes can look identical.","Level-order encoding mirrors the input array format.","Preorder with a null marker is compact and easy to parse recursively."],
    signature: {"kind":"codec","className":"Codec","encode":"serialize","decode":"deserialize","dataType":"TreeNode"},
    tests: [{"args":[[1,2,3,null,null,4,5]],"expected":[1,2,3,null,null,4,5]},{"args":[[]],"expected":[]},{"args":[[1]],"expected":[1]},{"args":[[1,null,2,3]],"expected":[1,null,2,3]},{"args":[[-1,-2,-3,null,4]],"expected":[-1,-2,-3,null,4]},{"args":[[1,2,null,3,null,4]],"expected":[1,2,null,3,null,4]},{"args":[[0,-3,9,-10,null,5]],"expected":[0,-3,9,-10,null,5]},{"args":[[5,4,7,3,null,6,8]],"expected":[5,4,7,3,null,6,8]}],
    solutions: [
      {
        title: "Level-order Codec",
        explanation: `**Intuition.** Serialize the tree the same way arrays describe it: breadth-first with null markers.

**Steps.**
1. BFS through the tree and append values or \`#\` for missing children.
2. Trim trailing null markers to keep the string shorter.
3. Deserialize by reading values in pairs as left and right children of queued parents.

**Correctness.** The BFS stream records each child position in order, so rebuilding those positions recreates the original shape and values.

**Pitfalls.** Keep enough null markers for interior missing children; only trailing nulls are safe to remove.`,
        time: "O(n)",
        space: "O(n)",
        python: `class Codec:
    def serialize(self, root):
        if not root:
            return ''
        out = []
        q = deque([root])
        while q:
            node = q.popleft()
            if node:
                out.append(str(node.val))
                q.append(node.left)
                q.append(node.right)
            else:
                out.append('#')
        while out and out[-1] == '#':
            out.pop()
        return ','.join(out)

    def deserialize(self, data):
        if not data:
            return None
        vals = data.split(',')
        root = TreeNode(int(vals[0]))
        q = deque([root])
        i = 1
        while q and i < len(vals):
            node = q.popleft()
            if i < len(vals) and vals[i] != '#':
                node.left = TreeNode(int(vals[i]))
                q.append(node.left)
            i += 1
            if i < len(vals) and vals[i] != '#':
                node.right = TreeNode(int(vals[i]))
                q.append(node.right)
            i += 1
        return root`,
        cpp: `class Codec {
    vector<string> split(const string& s) {
        vector<string> out;
        string cur;
        stringstream ss(s);
        while (getline(ss, cur, ',')) out.push_back(cur);
        return out;
    }
public:
    string serialize(TreeNode* root) {
        if (!root) return "";
        vector<string> out;
        queue<TreeNode*> q;
        q.push(root);
        while (!q.empty()) {
            TreeNode* node = q.front(); q.pop();
            if (node) {
                out.push_back(to_string(node->val));
                q.push(node->left);
                q.push(node->right);
            } else {
                out.push_back("#");
            }
        }
        while (!out.empty() && out.back() == "#") out.pop_back();
        string s;
        for (int i = 0; i < (int)out.size(); ++i) {
            if (i) s += ",";
            s += out[i];
        }
        return s;
    }

    TreeNode* deserialize(string data) {
        if (data.empty()) return nullptr;
        vector<string> vals = split(data);
        TreeNode* root = new TreeNode(stoi(vals[0]));
        queue<TreeNode*> q;
        q.push(root);
        int i = 1;
        while (!q.empty() && i < (int)vals.size()) {
            TreeNode* node = q.front(); q.pop();
            if (i < (int)vals.size() && vals[i] != "#") {
                node->left = new TreeNode(stoi(vals[i]));
                q.push(node->left);
            }
            ++i;
            if (i < (int)vals.size() && vals[i] != "#") {
                node->right = new TreeNode(stoi(vals[i]));
                q.push(node->right);
            }
            ++i;
        }
        return root;
    }
};`,
      },
      {
        title: "Preorder Codec",
        explanation: `**Intuition.** Preorder traversal plus null markers gives a self-delimiting recursive format.

**Steps.**
1. Write the current node value, or \`#\` for null.
2. Serialize left subtree, then right subtree.
3. During deserialization, consume tokens in the same order.

**Correctness.** Each token either creates a node and recursively consumes its two children or marks a null, so the parser exactly reverses the serializer.

**Pitfalls.** Do not omit null children in preorder; they are what disambiguate shapes.`,
        time: "O(n)",
        space: "O(n)",
        python: `class Codec:
    def serialize(self, root):
        out = []
        def dfs(node):
            if not node:
                out.append('#')
                return
            out.append(str(node.val))
            dfs(node.left)
            dfs(node.right)
        dfs(root)
        return ','.join(out)

    def deserialize(self, data):
        vals = iter(data.split(','))
        def dfs():
            val = next(vals)
            if val == '#':
                return None
            node = TreeNode(int(val))
            node.left = dfs()
            node.right = dfs()
            return node
        return dfs()`,
        cpp: `class Codec {
    void write(TreeNode* node, string& out) {
        if (!node) {
            out += "#,";
            return;
        }
        out += to_string(node->val) + ",";
        write(node->left, out);
        write(node->right, out);
    }
    TreeNode* read(stringstream& ss) {
        string val;
        getline(ss, val, ',');
        if (val == "#" || val.empty()) return nullptr;
        TreeNode* node = new TreeNode(stoi(val));
        node->left = read(ss);
        node->right = read(ss);
        return node;
    }
public:
    string serialize(TreeNode* root) {
        string out;
        write(root, out);
        return out;
    }

    TreeNode* deserialize(string data) {
        stringstream ss(data);
        return read(ss);
    }
};`,
      },
    ],
    viz: "tree-traversal",
  },
]

export default problems
