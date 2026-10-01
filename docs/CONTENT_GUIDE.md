# Content authoring guide

All content lives in `src/data/<section>/*.ts`. Every file has a **default export** of an array of
items typed by `src/types/content.ts`. Index files are auto-generated with `import.meta.glob`, so new
files are picked up automatically. **Never edit files you do not own** and never touch `index.ts`.

Golden rules

1. **Original wording.** Problem statements, notes and explanations must be written in your own words.
   Do not copy LeetCode / NeetCode / book text. Titles, problem numbers and links are fine.
2. **Correctness is verified by machine.** Run the validator and iterate until it reports `All good`.
3. Use TypeScript template literals (backticks) for multi-line strings. Inside them, escape backticks
   (`` \` ``) and `${` (write `\${`). Backslashes in code must be doubled (`\\n` inside a template literal
   produces `\n` in the code). Prefer `String.raw` only when no `${` is present.
4. Markdown is GitHub-flavoured (tables OK). Math uses KaTeX: inline `$x^2$`, block `$$ ... $$`.
   Remember: inside a normal template literal, a LaTeX backslash must be written as `\\` (e.g. `\\frac`).

---

## DSA problems (`src/data/dsa/<category>.ts`)

```ts
import type { DsaProblem } from '../../types/content'
const problems: DsaProblem[] = [ { ... }, ... ]
export default problems
```

Field requirements (see `DsaProblem` in `src/types/content.ts`):

- `id` = exact LeetCode slug (e.g. `two-sum`, `best-time-to-buy-and-sell-stock`). Links are derived from it.
- `number` = LeetCode number. `difficulty` as on LeetCode. `category` = NeetCode 150 category name.
- `pattern`: short (e.g. "Hash Map", "Two Pointers", "Monotonic Stack", "Top-K Heap").
- `description`: 1–3 short paragraphs of original markdown. Use `code` for identifiers. State the function to implement
  and the expected output precisely (incl. ordering rules, e.g. "any order").
- `examples`: 2–3, `input` like `nums = [2,7,11,15], target = 9`, `output` like `[0,1]`, optional `explanation`.
- `constraints`: 3–5 bullet strings (e.g. "`1 <= nums.length <= 10^4`").
- `hints`: 3 progressive hints (nudge → key insight → near-solution).
- `signature`: see `src/judge/types.ts`. Names must match LeetCode's method names (camelCase) in BOTH languages.
- `tests`: **at least 8**. The first 3 (`sampleCount` default 3) must match the `examples`. Cover edge cases
  (empty / single element / duplicates / negatives / max values / already-sorted / no-answer). Moderate sizes only
  (arrays ≤ ~200 elements). Compute expected values by running a trusted brute force, not by hand.
- `compare`: `exact` (default), `unordered` (outer order ignored, e.g. Top K), `unorderedDeep` (inner and outer
  order ignored, e.g. 3Sum, Subsets, Group Anagrams, Combination Sum), `anyOf` (expected = list of all acceptable
  answers), `topoOrder` (Course Schedule II), `alienOrder` (Alien Dictionary). If several answers are valid,
  you MUST choose a compare mode that accepts all of them.
- `solutions`: usually 2 (brute force → optimal), sometimes 3. Each has a markdown `explanation`
  (intuition, numbered steps, why it is correct, pitfalls), `time`, `space`, and **both** `python` and `cpp` code.
- `viz` (optional): one of the DSA widget ids in `WidgetId` if a visualizer fits.

Code conventions:

- Python: `class Solution:` with methods exactly as the signature (`self` first). `typing` (`List`, `Optional`),
  `collections`, `heapq`, `bisect`, `functools`, `itertools`, `math` are pre-imported (also star-imported:
  `deque`, `defaultdict`, `Counter`, `heappush`, `lru_cache`, `cache`, `accumulate`...). `ListNode`, `TreeNode`,
  `Node` are provided — do not redefine them.
- C++17: `#include <bits/stdc++.h>` and `using namespace std;` are already present; `ListNode`/`TreeNode`/`Node`
  are provided. Write only the class (no `main`). Vectors are passed by reference (`vector<int>& nums`),
  strings by value. Use `long long` where overflow is possible. Must compile with `clang++ -std=c++17`.
- Class-design problems (`kind: 'class'`): constructor + methods in the signature, tests use `ops`/`args`/`expected`
  where `ops[0]` is the class name and expected has `null` for the constructor and `void` methods.
- Linked-list cycle style inputs use `CycleList` (`[values, pos]`); LCA style node arguments use `TreeNodeRef`.
- Encode/decode style problems use `kind: 'codec'`.

Validate (from repo root):

```bash
PYTHON=/opt/homebrew/bin/python3.13 npx tsx scripts/validate.ts dsa <file-name-or-problem-id>
```

`scripts/fixtures/fixtures.ts` contains working examples of every signature kind.

---

## SQL problems (`src/data/sql/*.ts`) — `SqlProblem`

- SQLite dialect (sql.js). Window functions, CTEs OK. No `RIGHT/FULL JOIN` tricks, no stored procedures.
- `schema`: `CREATE TABLE` statements. `datasets`: ≥ 3 strings of `INSERT` statements (first is the example
  shown to the user; others test edge cases such as ties, NULLs, empty groups).
- Expected results are produced by running `solution`, so make the solution unambiguous (deterministic ordering
  if `orderMatters`, explicit column aliases matching the description).
- Validate: `npx tsx scripts/validate.ts sql <file-or-id>`

## ML coding problems (`src/data/mlcoding/*.ts`) — `MlCodingProblem`

- Python + numpy only (runs in Pyodide). `starter` has function/class stubs that `raise NotImplementedError` or
  `pass`. `tests` are python snippets with `assert cond, "helpful message"`, using `np.allclose` where needed.
  Use fixed random seeds. Starter must NOT pass the tests.
- Validate: `PYTHON=/Users/vpatid/.copilot/session-state/5f23dc6b-06eb-4b0b-83d5-12d059bda482/files/venv/bin/python npx tsx scripts/validate.ts ml <file-or-id>`

## Design docs (`src/data/systemDesign/*.ts`, `src/data/mlDesign/*.ts`) — `DesignDoc`

- Sections in interview order. Diagrams use a grid (`col` 0–7, `row` 0–5); no two nodes may share a cell; edges
  reference node ids. Click-through `detail` text on important nodes.
- Validate: `npx tsx scripts/validate.ts docs`

## Theory (`src/data/theory/*.ts`) — `TheoryTopic`

- `notes`: long-form markdown + KaTeX, with headings (`##`), formulas, tables, intuition and "interview tip" callouts
  written as blockquotes (`> **Interview tip:** ...`).
- `flashcards`: ≥ 12 per topic. `quiz`: ≥ 6 per topic, `answer` is the 0-based index.
- Validate: `npx tsx scripts/validate.ts docs`
