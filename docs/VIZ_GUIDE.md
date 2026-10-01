# Visualizer authoring guide

Each visualizer is a self-contained React component with a **default export and no required props**, living at
`src/viz/<group>/<Name>.tsx` (file names are fixed by `src/viz/registry.tsx`).

Building blocks (read them first):

- `src/viz/common.tsx` — `VizFrame` (standard card: title, description, controls row, canvas area, caption, legend),
  `usePlayer(steps)` + `PlayerControls` (step-through player for precomputed algorithm frames),
  `useSize()` (responsive width), `useAnimationFrame()`, palette `C` (CSS variables — theme aware),
  `cssVar()` + `useThemeVersion()` (for `<canvas>` colours), `mulberry32` / `randn` seeded RNG.
- `src/components/ui.tsx` — `Button`, `Badge`, `Segmented`, `Slider`, `Select`, `Switch`, `Tabs`, `cn`.
- Icons: `lucide-react`. Animation: `framer-motion` (`motion.div`, `AnimatePresence`, `layout`). Charts: plain SVG
  preferred (Recharts is available but heavier).

Design rules (modern, minimal, professional):

- Wrap everything in `<VizFrame title=… description=… controls={…} caption={…} legend={…}>`.
- Use only theme colours: `C.accent`, `C.series[i]`, `C.ok/warn/err`, `C.fg/muted/line`; Tailwind tokens `bg-panel`,
  `bg-subtle`, `border-line`, `text-muted`, `text-fg`, `text-accent`. Never hard-code white/black.
- Responsive: measure width with `useSize()`; never exceed container width; typical canvas height 260–420px.
- Smooth: animate state changes (SVG attribute transitions via CSS `transition`, or framer-motion).
- Algorithm visualizers: precompute an array of frames (immutable snapshots + a human-readable `caption` per frame,
  e.g. "mid = 4, nums[mid]=7 > target → hi = mid - 1"), drive with `usePlayer`, show the caption in `VizFrame.caption`,
  and offer input controls (randomize / edit input / pick variant). Highlight the pseudo-code line that is executing
  when it adds clarity (small monospace code panel).
- Interactive ML widgets: sliders / segmented controls for hyper-parameters, live metrics read-outs.
- TypeScript strict; no `any` unless unavoidable; no new dependencies; no network calls.

Verify (dev server is already running on http://127.0.0.1:5173 — do NOT start another):

```bash
npx tsc -p tsconfig.app.json --noEmit 2>&1 | grep "src/viz/<group>/<Name>"   # must print nothing
node scripts/shot.mjs "http://127.0.0.1:5173/preview.html?c=<group>/<Name>" /tmp/<name>-dark.png
node scripts/shot.mjs "http://127.0.0.1:5173/preview.html?c=<group>/<Name>&theme=light" /tmp/<name>-light.png
```

Then view the PNGs. Runtime errors are rendered in a red box at the bottom of the screenshot — fix them.
Check both themes look polished and nothing overflows.
