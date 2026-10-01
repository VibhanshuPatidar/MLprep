import { Check, Copy } from 'lucide-react'
import { useEffect, useState } from 'react'
import { useStore } from '../store/progress'
import { cn } from './ui'

const LANG_MAP: Record<string, string> = { python: 'python', py: 'python', cpp: 'cpp', 'c++': 'cpp', c: 'cpp', sql: 'sql', sqlite: 'sql' }

const escapeHtml = (s: string) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')

export function CopyButton({ text, className }: { text: string; className?: string }) {
  const [done, setDone] = useState(false)
  return (
    <button
      onClick={() => {
        navigator.clipboard?.writeText(text)
        setDone(true)
        setTimeout(() => setDone(false), 1200)
      }}
      className={cn('inline-flex h-7 w-7 items-center justify-center rounded-md border border-line bg-panel text-muted transition hover:text-fg', className)}
      title="Copy"
    >
      {done ? <Check size={13} className="text-ok" /> : <Copy size={13} />}
    </button>
  )
}

export default function CodeBlock({ code, lang, className, maxHeight }: { code: string; lang?: string; className?: string; maxHeight?: number }) {
  const theme = useStore((s) => s.settings.theme)
  const monacoLang = LANG_MAP[(lang ?? '').toLowerCase()]
  const [html, setHtml] = useState<string | null>(null)
  const text = code.replace(/\n$/, '')

  useEffect(() => {
    if (!monacoLang) return
    let alive = true
    import('../lib/monaco')
      .then(async ({ monaco }) => {
        monaco.editor.setTheme(theme === 'dark' ? 'prep-dark' : 'prep-light')
        const h = await monaco.editor.colorize(text, monacoLang, { tabSize: 4 })
        if (alive) setHtml(h)
      })
      .catch(() => {})
    return () => {
      alive = false
    }
  }, [text, monacoLang, theme])

  return (
    <div className={cn('not-prose group relative my-3 overflow-hidden rounded-xl border border-line bg-panel-2', className)}>
      {lang && <div className="absolute top-2 right-11 font-mono text-[10px] tracking-wide text-faint uppercase opacity-0 transition group-hover:opacity-100">{lang}</div>}
      <CopyButton text={text} className="absolute top-1.5 right-1.5 opacity-0 transition group-hover:opacity-100" />
      <pre className="overflow-auto p-4 font-mono text-[13px] leading-relaxed" style={{ maxHeight }}>
        <code dangerouslySetInnerHTML={{ __html: html ?? escapeHtml(text) }} />
      </pre>
    </div>
  )
}
