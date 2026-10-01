import { ChevronsLeft, ChevronsRight, Cpu, Moon, Search, Sun } from 'lucide-react'
import { useEffect, useMemo, useState } from 'react'
import type { ReactNode } from 'react'
import { NavLink, useLocation } from 'react-router-dom'
import { dsaProblems, mlProblems, mlsdDocs, sdDocs, sqlProblems, theoryTopics } from '../data'
import { checkRunner, getRuntimeStatus, onRuntimeStatus, type RuntimeStatus } from '../judge/runtime'
import { useStore } from '../store/progress'
import CommandPalette, { useCommandPalette } from './CommandPalette'
import { NAV } from './nav'
import { MockPill } from '../pages/Mock'
import { Kbd, cn } from './ui'

function useRuntime() {
  const [s, setS] = useState<RuntimeStatus>(getRuntimeStatus())
  useEffect(() => {
    const off = onRuntimeStatus(setS)
    checkRunner()
    const t = setInterval(checkRunner, 30000)
    return () => {
      off()
      clearInterval(t)
    }
  }, [])
  return s
}

function useSectionCounts() {
  const progress = useStore((s) => s.progress)
  const read = useStore((s) => s.read)
  return useMemo(() => {
    const solved = (prefix: string) => Object.entries(progress).filter(([k, v]) => k.startsWith(prefix) && v.status === 'solved').length
    const readN = (prefix: string) => Object.keys(read).filter((k) => k.startsWith(prefix)).length
    return {
      dsa: [solved('dsa:'), dsaProblems.length],
      sql: [solved('sql:'), sqlProblems.length],
      ml: [solved('ml:'), mlProblems.length],
      sd: [readN('sd:'), sdDocs.length],
      mlsd: [readN('mlsd:'), mlsdDocs.length],
      theory: [readN('theory:'), theoryTopics.length],
    } as Record<string, [number, number]>
  }, [progress, read])
}

function Dot({ state }: { state: 'ok' | 'warn' | 'err' | 'idle' }) {
  const c = { ok: 'bg-ok', warn: 'bg-warn animate-pulse', err: 'bg-err', idle: 'bg-faint' }[state]
  return <span className={cn('inline-block h-1.5 w-1.5 rounded-full', c)} />
}

export default function Layout({ children }: { children: ReactNode }) {
  const settings = useStore((s) => s.settings)
  const setSettings = useStore((s) => s.setSettings)
  const collapsed = settings.sidebarCollapsed
  const [open, setOpen] = useCommandPalette()
  const counts = useSectionCounts()
  const rt = useRuntime()
  const loc = useLocation()
  const isWorkspace = /^\/(dsa|sql|ml-coding)\/[^/]+/.test(loc.pathname)

  useEffect(() => {
    document.documentElement.classList.toggle('dark', settings.theme === 'dark')
  }, [settings.theme])

  return (
    <div className="flex h-full">
      <aside className={cn('flex shrink-0 flex-col border-r border-line bg-panel transition-[width] duration-200', collapsed ? 'w-[60px]' : 'w-[244px]')}>
        <div className="flex h-14 items-center gap-2.5 border-b border-line px-4">
          <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br from-accent to-accent-2 text-[13px] font-bold text-white shadow-sm">P</div>
          {!collapsed && (
            <div className="min-w-0">
              <div className="text-sm leading-tight font-semibold tracking-tight">PrepML</div>
              <div className="text-[10.5px] leading-tight text-faint">ML / AI engineer interview prep</div>
            </div>
          )}
        </div>
        <nav className="flex-1 overflow-y-auto px-2 py-3">
          {NAV.map((g) => (
            <div key={g.group} className="mb-3">
              {!collapsed && <div className="px-2 pb-1 text-[10.5px] font-medium tracking-wider text-faint uppercase">{g.group}</div>}
              {g.items.map((it) => {
                const c = it.section ? counts[it.section] : null
                return (
                  <NavLink
                    key={it.to}
                    to={it.to}
                    end={it.to === '/'}
                    title={collapsed ? it.label : undefined}
                    className={({ isActive }) =>
                      cn(
                        'group mb-0.5 flex h-8 items-center gap-2.5 rounded-lg px-2 text-[13px] font-medium transition-colors',
                        isActive ? 'bg-accent-soft text-accent' : 'text-muted hover:bg-subtle hover:text-fg',
                        collapsed && 'justify-center',
                      )
                    }
                  >
                    <it.icon size={16} className="shrink-0" />
                    {!collapsed && <span className="flex-1 truncate">{it.label}</span>}
                    {!collapsed && c && (
                      <span className="font-mono text-[10.5px] text-faint">
                        {c[0]}/{c[1]}
                      </span>
                    )}
                  </NavLink>
                )
              })}
            </div>
          ))}
        </nav>
        <div className="border-t border-line p-2">
          <button
            onClick={() => setSettings({ sidebarCollapsed: !collapsed })}
            className={cn('flex h-8 w-full items-center gap-2 rounded-lg px-2 text-xs text-muted hover:bg-subtle hover:text-fg', collapsed && 'justify-center')}
          >
            {collapsed ? <ChevronsRight size={15} /> : <ChevronsLeft size={15} />}
            {!collapsed && 'Collapse'}
          </button>
        </div>
      </aside>

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="flex h-14 shrink-0 items-center gap-3 border-b border-line bg-panel/80 px-4 backdrop-blur">
          <button
            onClick={() => setOpen(true)}
            className="flex h-9 w-full max-w-md items-center gap-2 rounded-lg border border-line bg-subtle px-3 text-sm text-faint transition hover:border-line-strong"
          >
            <Search size={15} />
            <span className="flex-1 text-left">Search problems, topics, designs…</span>
            <Kbd>⌘</Kbd>
            <Kbd>K</Kbd>
          </button>
          <div className="flex-1" />
          <MockPill />
          <div className="hidden items-center gap-3 rounded-lg border border-line px-3 py-1.5 text-[11.5px] text-muted md:flex" title="Code runtimes">
            <Cpu size={13} />
            <span className="inline-flex items-center gap-1.5" title={rt.pythonError ?? 'Python runs in your browser via Pyodide (WebAssembly)'}>
              <Dot state={rt.python === 'ready' ? 'ok' : rt.python === 'loading' ? 'warn' : rt.python === 'error' ? 'err' : 'idle'} />
              Python {rt.python === 'loading' ? 'loading…' : rt.python === 'idle' ? '(on demand)' : ''}
            </span>
            <span className="inline-flex items-center gap-1.5" title={rt.cpp === 'ok' ? `Local runner: ${rt.cxx}` : 'Start the local runner: npm run dev'}>
              <Dot state={rt.cpp === 'ok' ? 'ok' : rt.cpp === 'down' ? 'err' : 'idle'} />
              C++
            </span>
            <span className="inline-flex items-center gap-1.5" title="SQLite runs in your browser via sql.js">
              <Dot state="ok" />
              SQL
            </span>
          </div>
          <button
            onClick={() => setSettings({ theme: settings.theme === 'dark' ? 'light' : 'dark' })}
            className="flex h-9 w-9 items-center justify-center rounded-lg border border-line text-muted transition hover:text-fg"
            title="Toggle theme"
          >
            {settings.theme === 'dark' ? <Sun size={16} /> : <Moon size={16} />}
          </button>
        </header>
        <main className={cn('min-h-0 flex-1', isWorkspace ? 'overflow-hidden' : 'overflow-y-auto')}>{children}</main>
      </div>
      <CommandPalette open={open} setOpen={setOpen} />
    </div>
  )
}

export function Page({ children, className, wide }: { children: ReactNode; className?: string; wide?: boolean }) {
  return <div className={cn('animate-fade-in mx-auto w-full px-6 py-8', wide ? 'max-w-[1400px]' : 'max-w-6xl', className)}>{children}</div>
}
