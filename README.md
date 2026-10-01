# PrepML — ML / AI Engineer Interview Prep

An interactive, local-first study app for ML / AI engineer interviews. Solve problems in the browser in
**Python, C++ or SQL** against hidden tests, study system and ML design with interactive architecture diagrams,
and learn ML theory with notes, visualizations, spaced-repetition flashcards and quizzes.

| Section | What's inside |
| --- | --- |
| **DSA · NeetCode 150** | All 150 problems as a roadmap of 18 categories. Problem statements are written in our own words, with hints, 2–3 explained solutions each in Python and C++, and a pattern visualizer. |
| **SQL** | 45 problems on SQLite covering joins, aggregation, window functions and product/ML analytics (retention, funnels, A/B tests, point-in-time features). |
| **ML Coding** | 35 "implement it from scratch" problems in NumPy (softmax, Adam, k-means, PCA, attention, conv2d, BPE, NDCG, beam search…). |
| **System Design** | 12 fundamentals and 14 case studies, each with clickable architecture diagrams, interviewer follow-ups and simulations. |
| **ML System Design** | 8 foundations and 13 case studies (recsys, search, ads CTR, fraud, ETA, RAG, LLM serving…). |
| **ML Theory** | 28 topics with notes and math, 420 flashcards (SM-2 spaced repetition) and 224 quiz questions. |
| **Visualizers** | 40 interactive widgets: sorting, binary search, graphs, DP tables, heaps, tries, gradient descent, bias–variance, ROC/PR, attention, NN playground, consistent hashing, rate limiters, bloom filters, A/B calculator, and more. |
| **Practice** | Dashboard, week-by-week study plan, timed mock interviews with rubrics, flashcard review, curated resources, Cmd/Ctrl-K search. |

## Quick start

```bash
npm install
npm run dev          # web app on http://localhost:5173 + local C++ runner on 127.0.0.1:8787
```

Requirements: Node 20+, and for C++ a local `clang++` or `g++` (on macOS: `xcode-select --install`).

### How code runs

- **Python 3**: runs in your browser with [Pyodide](https://pyodide.org) (CPython compiled to WebAssembly) in a Web Worker.
  It is downloaded from the jsDelivr CDN the first time you use it, then cached. NumPy is loaded when needed.
- **C++17**: compiled and run by a small Node server (`server/runner.mjs`) using your local compiler. It listens on
  `127.0.0.1` only, compiles with a precompiled `<bits/stdc++.h>`, and kills programs that run too long.
- **SQL**: SQLite compiled to WebAssembly ([sql.js](https://sql.js.org)) running in your browser. Every run uses a fresh database.

Each submission is wrapped in a generated test harness (`src/judge/`). The harness builds the inputs (arrays, linked lists,
trees, graphs, design-class operation sequences, encode/decode round trips), calls your code, and compares the output.
Comparison can be exact, order-insensitive or "any valid answer" (e.g. topological order). **Run** uses the visible example
cases or cases you write yourself; expected outputs for your own cases come from the reference solution. **Submit** runs
every hidden test.

Progress, code, notes, flashcard schedules and mock history are saved in `localStorage`. You can export and import them
from **Settings**. **Settings → Diagnostics** checks every runtime from start to finish.

## Scripts

| Command | Purpose |
| --- | --- |
| `npm run dev` | Vite dev server and C++ runner |
| `npm run build` / `npm run preview` | Production build / serve the build (with the runner) |
| `npm run runner` | Start only the C++ runner |
| `npm run typecheck` | TypeScript project check |
| `npm run validate -- all` | Content checks: runs **every** reference solution (Python + C++) against its tests, checks SQL solutions on every dataset, ML solutions vs tests (starter must fail), and diagram/quiz integrity. Set `PYTHON=/path/to/python3` (NumPy needed for `ml`). |

## Project layout

```
server/            local C++/Python runner (exec.mjs, runner.mjs, include/bits/stdc++.h)
scripts/           validate.ts (content checks), shot.mjs (headless screenshots), fixtures/
src/judge/         harness generators (python.ts, cpp.ts), comparison, runtimes (Pyodide worker, sql.js)
src/data/          content: dsa/, sql/, mlcoding/, systemDesign/, mlDesign/, theory/, resources.ts
src/viz/           40 visualizers (dsa/, ml/, sd/) + registry.tsx
src/pages/         route pages; src/components/ shared UI (editor, markdown, diagrams, flashcards…)
docs/              CONTENT_GUIDE.md and VIZ_GUIDE.md for adding content and widgets
```

## Adding content

See [`docs/CONTENT_GUIDE.md`](docs/CONTENT_GUIDE.md) for the schemas and conventions. To add content, drop a new `.ts`
file into the matching `src/data/<section>/` folder; it is picked up automatically. Then run the validator.

## Notes

- Problem statements are paraphrased, not copied. Each DSA problem links to the original LeetCode page and a NeetCode
  video search.
- External resources are links only.
