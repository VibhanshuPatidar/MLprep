import { Command } from 'cmdk'
import { BookOpen, Brain, Code2, Database, FlaskConical, LayoutDashboard, Network, Sparkles, Workflow } from 'lucide-react'
import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { dsaProblems, mlProblems, mlsdDocs, sdDocs, sqlProblems, theoryTopics } from '../data'
import { widgets } from '../viz/registry'
import { NAV } from './nav'
import { DifficultyBadge } from './ui'

export function useCommandPalette() {
  const [open, setOpen] = useState(false)
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault()
        setOpen((o) => !o)
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [])
  return [open, setOpen] as const
}

const groupCls = '[&_[cmdk-group-heading]]:px-2 [&_[cmdk-group-heading]]:py-1.5 [&_[cmdk-group-heading]]:text-[11px] [&_[cmdk-group-heading]]:font-medium [&_[cmdk-group-heading]]:text-faint'
const itemCls = 'flex cursor-pointer items-center gap-2.5 rounded-lg px-2 py-2 text-sm text-fg data-[selected=true]:bg-subtle'

export default function CommandPalette({ open, setOpen }: { open: boolean; setOpen: (v: boolean) => void }) {
  const nav = useNavigate()
  if (!open) return null
  const go = (to: string) => {
    setOpen(false)
    nav(to)
  }
  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center bg-black/40 p-4 pt-[12vh] backdrop-blur-sm" onClick={() => setOpen(false)}>
      <div className="animate-fade-in w-full max-w-xl overflow-hidden rounded-2xl border border-line bg-panel shadow-2xl" onClick={(e) => e.stopPropagation()}>
        <Command label="Search" loop>
          <Command.Input autoFocus placeholder="Search problems, topics, designs, visualizers…" className="h-12 w-full border-b border-line bg-transparent px-4 text-sm outline-none placeholder:text-faint" />
          <Command.List className="max-h-[60vh] overflow-y-auto p-2">
            <Command.Empty className="p-6 text-center text-sm text-muted">No results.</Command.Empty>
            <Command.Group heading="Pages" className={groupCls}>
              {NAV.flatMap((g) => g.items).map((n) => (
                <Command.Item key={n.to} value={`page ${n.label}`} onSelect={() => go(n.to)} className={itemCls}>
                  <n.icon size={15} className="text-muted" />
                  {n.label}
                </Command.Item>
              ))}
            </Command.Group>
            <Command.Group heading="DSA · NeetCode 150" className={groupCls}>
              {dsaProblems.map((p) => (
                <Command.Item key={p.id} value={`dsa ${p.number} ${p.title} ${p.category} ${p.pattern}`} onSelect={() => go(`/dsa/${p.id}`)} className={itemCls}>
                  <Code2 size={15} className="text-muted" />
                  <span className="flex-1 truncate">
                    {p.number}. {p.title}
                  </span>
                  <DifficultyBadge d={p.difficulty} />
                </Command.Item>
              ))}
            </Command.Group>
            <Command.Group heading="SQL" className={groupCls}>
              {sqlProblems.map((p) => (
                <Command.Item key={p.id} value={`sql ${p.title} ${p.category}`} onSelect={() => go(`/sql/${p.id}`)} className={itemCls}>
                  <Database size={15} className="text-muted" />
                  <span className="flex-1 truncate">{p.title}</span>
                  <DifficultyBadge d={p.difficulty} />
                </Command.Item>
              ))}
            </Command.Group>
            <Command.Group heading="ML Coding" className={groupCls}>
              {mlProblems.map((p) => (
                <Command.Item key={p.id} value={`ml coding ${p.title} ${p.category}`} onSelect={() => go(`/ml-coding/${p.id}`)} className={itemCls}>
                  <FlaskConical size={15} className="text-muted" />
                  <span className="flex-1 truncate">{p.title}</span>
                  <DifficultyBadge d={p.difficulty} />
                </Command.Item>
              ))}
            </Command.Group>
            <Command.Group heading="System Design" className={groupCls}>
              {sdDocs.map((d) => (
                <Command.Item key={d.id} value={`system design ${d.title} ${d.tags.join(' ')}`} onSelect={() => go(`/system-design/${d.id}`)} className={itemCls}>
                  <Network size={15} className="text-muted" />
                  <span className="flex-1 truncate">{d.title}</span>
                  <span className="text-[11px] text-faint">{d.category}</span>
                </Command.Item>
              ))}
            </Command.Group>
            <Command.Group heading="ML System Design" className={groupCls}>
              {mlsdDocs.map((d) => (
                <Command.Item key={d.id} value={`ml system design ${d.title} ${d.tags.join(' ')}`} onSelect={() => go(`/ml-design/${d.id}`)} className={itemCls}>
                  <Workflow size={15} className="text-muted" />
                  <span className="flex-1 truncate">{d.title}</span>
                  <span className="text-[11px] text-faint">{d.category}</span>
                </Command.Item>
              ))}
            </Command.Group>
            <Command.Group heading="ML Theory" className={groupCls}>
              {theoryTopics.map((t) => (
                <Command.Item key={t.id} value={`theory ${t.title} ${t.category}`} onSelect={() => go(`/theory/${t.id}`)} className={itemCls}>
                  <Brain size={15} className="text-muted" />
                  <span className="flex-1 truncate">{t.title}</span>
                  <span className="text-[11px] text-faint">{t.category}</span>
                </Command.Item>
              ))}
            </Command.Group>
            <Command.Group heading="Visualizers" className={groupCls}>
              {widgets.map((w) => (
                <Command.Item key={w.id} value={`visualizer ${w.title} ${w.description}`} onSelect={() => go(`/visualizers/${w.id}`)} className={itemCls}>
                  <Sparkles size={15} className="text-muted" />
                  <span className="flex-1 truncate">{w.title}</span>
                  <span className="text-[11px] text-faint">{w.group}</span>
                </Command.Item>
              ))}
            </Command.Group>
          </Command.List>
          <div className="flex items-center justify-between border-t border-line px-3 py-2 text-[11px] text-faint">
            <span className="inline-flex items-center gap-1">
              <LayoutDashboard size={12} /> PrepML
            </span>
            <span className="inline-flex items-center gap-1">
              <BookOpen size={12} /> ↑↓ navigate · ↵ open · esc close
            </span>
          </div>
        </Command>
      </div>
    </div>
  )
}
