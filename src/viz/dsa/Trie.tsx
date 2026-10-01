import { useMemo, useState } from 'react'
import { C, PlayerControls, usePlayer, useSize, VizFrame } from '../common'
import { Button, Segmented } from '../../components/ui'
import { MiniStat, Pill, PseudoCode, svgTextShadow } from './_shared2'

type QueryMode = 'search' | 'prefix'

interface TrieNode {
  id: number
  char: string
  terminal: boolean
  children: Record<string, number>
}

interface TrieFrame {
  nodes: TrieNode[]
  active: number[]
  activeEdge?: [number, number]
  word: string
  query: string
  line: number
  found?: boolean
  caption: string
}

const code = [
  { id: 1, text: 'for word in words: node = root' },
  { id: 2, text: 'for char in word: check child edge' },
  { id: 3, text: 'if missing: create child node' },
  { id: 4, text: 'node = node.children[char]' },
  { id: 5, text: 'mark node as end-of-word' },
  { id: 6, text: 'search/prefix: start at root' },
  { id: 7, text: 'consume next char along edge' },
  { id: 8, text: 'missing edge → fail' },
  { id: 9, text: 'search: require terminal marker' },
  { id: 10, text: 'startsWith: reaching prefix is enough' },
]

const presets = ['app', 'apple', 'apt', 'bat', 'bath']

function parseWords(text: string) {
  const seen = new Set<string>()
  const words: string[] = []
  for (const match of text.toLowerCase().matchAll(/[a-z]+/g)) {
    const word = match[0].slice(0, 10)
    if (!seen.has(word)) {
      seen.add(word)
      words.push(word)
    }
  }
  return words.slice(0, 12)
}

function cloneNodes(nodes: TrieNode[]): TrieNode[] {
  return nodes.map((n) => ({ ...n, children: { ...n.children } }))
}

function makeTrieFrames(words: string[], queryRaw: string, mode: QueryMode): TrieFrame[] {
  const query = queryRaw.toLowerCase().replace(/[^a-z]/g, '').slice(0, 12)
  const nodes: TrieNode[] = [{ id: 0, char: 'root', terminal: false, children: {} }]
  const frames: TrieFrame[] = []
  const push = (active: number[], line: number, caption: string, word = '', activeEdge?: [number, number], found?: boolean) => {
    frames.push({ nodes: cloneNodes(nodes), active: [...active], activeEdge, word, query, line, found, caption })
  }

  push([0], 1, 'Begin with an empty root node.')
  for (const word of words) {
    let nodeId = 0
    const path = [0]
    push(path, 1, `Insert "${word}": reset pointer to root.`, word)
    for (const ch of word) {
      push(path, 2, `Look for edge '${ch}' from node ${nodeId}.`, word)
      let next = nodes[nodeId].children[ch]
      if (next === undefined) {
        next = nodes.length
        nodes[nodeId].children[ch] = next
        nodes.push({ id: next, char: ch, terminal: false, children: {} })
        push([...path, next], 3, `Create '${ch}' child for "${word}".`, word, [nodeId, next])
      }
      nodeId = next
      path.push(nodeId)
      push(path, 4, `Follow '${ch}' edge; current prefix is "${word.slice(0, path.length - 1)}".`, word, [path[path.length - 2], nodeId])
    }
    nodes[nodeId].terminal = true
    push(path, 5, `Mark "${word}" as a complete word.`, word)
  }

  let current = 0
  const path = [0]
  push(path, 6, `${mode === 'search' ? 'Search' : 'startsWith'} "${query || '∅'}": begin at root.`)
  for (const ch of query) {
    const next = nodes[current].children[ch]
    if (next === undefined) {
      push(path, 8, `No '${ch}' edge from current node → ${mode === 'search' ? 'word' : 'prefix'} is absent.`, '', undefined, false)
      return frames
    }
    push(path, 7, `Consume '${ch}' by traversing the matching edge.`, '', [current, next])
    current = next
    path.push(current)
    push(path, 7, `Reached prefix "${query.slice(0, path.length - 1)}".`, '', [path[path.length - 2], current])
  }
  if (mode === 'search') {
    push(path, 9, nodes[current].terminal ? `"${query}" found: terminal marker is set.` : `"${query}" is only a prefix, not a full word.`, '', undefined, nodes[current].terminal)
  } else {
    push(path, 10, `Prefix "${query}" exists because every character was consumed.`, '', undefined, true)
  }
  return frames
}

function layoutTrie(nodes: TrieNode[], width: number) {
  const positions = new Map<number, { x: number; y: number }>()
  let leaf = 0
  const rawX = new Map<number, number>()
  const depthMap = new Map<number, number>()
  const dfs = (id: number, depth: number): number => {
    depthMap.set(id, depth)
    const childIds = Object.keys(nodes[id].children)
      .sort()
      .map((ch) => nodes[id].children[ch])
    if (childIds.length === 0) {
      const x = leaf
      leaf += 1
      rawX.set(id, x)
      return x
    }
    const xs = childIds.map((child) => dfs(child, depth + 1))
    const x = xs.reduce((a, b) => a + b, 0) / xs.length
    rawX.set(id, x)
    return x
  }
  dfs(0, 0)
  const leaves = Math.max(1, leaf - 1)
  const margin = 42
  const usable = Math.max(1, width - margin * 2)
  nodes.forEach((node) => {
    const x = margin + ((rawX.get(node.id) ?? 0) / leaves) * usable
    const y = 42 + (depthMap.get(node.id) ?? 0) * 72
    positions.set(node.id, { x, y })
  })
  return positions
}

function TrieSvg({ frame, width }: { frame: TrieFrame; width: number }) {
  const svgWidth = Math.max(520, width)
  const positions = layoutTrie(frame.nodes, svgWidth)
  const maxY = Math.max(...[...positions.values()].map((p) => p.y), 160) + 52
  const activeSet = new Set(frame.active)
  const activeEdges = new Set(frame.active.slice(1).map((id, index) => `${frame.active[index]}-${id}`))
  if (frame.activeEdge) activeEdges.add(`${frame.activeEdge[0]}-${frame.activeEdge[1]}`)

  return (
    <svg width="100%" viewBox={`0 0 ${svgWidth} ${maxY}`} className="min-h-[330px] rounded-2xl border border-line bg-panel">
      {frame.nodes.flatMap((node) =>
        Object.entries(node.children).map(([ch, child]) => {
          const a = positions.get(node.id)
          const b = positions.get(child)
          if (!a || !b) return null
          const active = activeEdges.has(`${node.id}-${child}`)
          return (
            <g key={`${node.id}-${child}`}>
              <line x1={a.x} y1={a.y + 20} x2={b.x} y2={b.y - 20} stroke={active ? C.accent : C.lineStrong} strokeWidth={active ? 3 : 1.5} strokeLinecap="round" />
              <text x={(a.x + b.x) / 2} y={(a.y + b.y) / 2 - 4} textAnchor="middle" className="fill-muted font-mono text-[11px]" style={svgTextShadow()}>
                {ch}
              </text>
            </g>
          )
        }),
      )}
      {frame.nodes.map((node) => {
        const p = positions.get(node.id)
        if (!p) return null
        const active = activeSet.has(node.id)
        const latest = frame.active[frame.active.length - 1] === node.id
        return (
          <g key={node.id} style={{ transition: 'all .25s ease' }}>
            <circle cx={p.x} cy={p.y} r={latest ? 24 : 21} fill={latest ? C.accent : active ? C.accent2 : C.panel2} stroke={node.terminal ? C.ok : active ? C.accent : C.line} strokeWidth={node.terminal ? 3 : 2} />
            {node.terminal && <circle cx={p.x + 15} cy={p.y - 15} r={5} fill={C.ok} />}
            <text x={p.x} y={p.y + 4} textAnchor="middle" className="fill-fg font-mono text-[11px] font-semibold" style={svgTextShadow()}>
              {node.id === 0 ? 'root' : node.char}
            </text>
          </g>
        )
      })}
    </svg>
  )
}

export default function Trie() {
  const [wordsText, setWordsText] = useState(presets.join(', '))
  const [query, setQuery] = useState('app')
  const [mode, setMode] = useState<QueryMode>('search')
  const [ref, size] = useSize<HTMLDivElement>()
  const words = useMemo(() => parseWords(wordsText), [wordsText])
  const steps = useMemo(() => makeTrieFrames(words, query, mode), [words, query, mode])
  const player = usePlayer(steps, 5)
  const frame = player.step

  return (
    <VizFrame
      title="Trie: Insert, Search, Prefix"
      description="Build a prefix tree from editable words, then animate a search or startsWith traversal."
      controls={
        <>
          <Segmented options={[{ value: 'search', label: 'search' }, { value: 'prefix', label: 'startsWith' }]} value={mode} onChange={setMode} />
          <input value={query} onChange={(e) => setQuery(e.target.value)} className="h-8 w-28 rounded-lg border border-line bg-panel px-2 font-mono text-sm outline-none focus:ring-2 focus:ring-accent/40" aria-label="query" />
          <Button size="sm" variant="outline" onClick={() => setWordsText(presets.join(', '))}>Preset</Button>
          <PlayerControls player={player} maxSpeed={12} />
        </>
      }
      caption={frame.caption}
      legend={[
        { color: C.accent, label: 'current node' },
        { color: C.ok, label: 'end of word' },
        { color: C.lineStrong, label: 'tree edge' },
      ]}
    >
      <div ref={ref} className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_300px]">
        <div className="space-y-3">
          <label className="block text-xs text-muted">
            Insert words
            <input value={wordsText} onChange={(e) => setWordsText(e.target.value)} className="mt-1 h-9 w-full rounded-lg border border-line bg-panel px-3 font-mono text-sm text-fg outline-none focus:ring-2 focus:ring-accent/40" />
          </label>
          <TrieSvg frame={frame} width={size.width - 330} />
          <div className="flex flex-wrap gap-1.5">
            {words.map((word) => (
              <Pill key={word} tone={frame.word === word ? 'accent' : 'neutral'}>{word}</Pill>
            ))}
          </div>
        </div>
        <div className="flex flex-col gap-3">
          <div className="grid grid-cols-2 gap-2">
            <MiniStat label="nodes" value={frame.nodes.length} tone="info" />
            <MiniStat label="result" value={frame.found === undefined ? '—' : frame.found ? 'true' : 'false'} tone={frame.found === undefined ? 'neutral' : frame.found ? 'ok' : 'err'} />
          </div>
          <div className="rounded-xl border border-line bg-panel p-3">
            <div className="mb-2 text-[11px] font-semibold uppercase tracking-wide text-muted">Active path</div>
            <div className="flex flex-wrap gap-1.5">
              {frame.active.map((id, i) => (
                <Pill key={`${id}-${i}`} tone={i === frame.active.length - 1 ? 'accent' : 'neutral'}>{id === 0 ? 'root' : frame.nodes[id].char}</Pill>
              ))}
            </div>
          </div>
          <PseudoCode lines={code} active={frame.line} />
        </div>
      </div>
    </VizFrame>
  )
}
