import { memo } from 'react'
import type { ReactElement, ReactNode } from 'react'
import ReactMarkdown from 'react-markdown'
import rehypeKatex from 'rehype-katex'
import remarkGfm from 'remark-gfm'
import remarkMath from 'remark-math'
import CodeBlock from './CodeBlock'
import { cn } from './ui'

export const slugify = (s: string) =>
  s
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .trim()
    .replace(/\s+/g, '-')

const textOf = (n: ReactNode): string => {
  if (typeof n === 'string' || typeof n === 'number') return String(n)
  if (Array.isArray(n)) return n.map(textOf).join('')
  if (n && typeof n === 'object' && 'props' in (n as ReactElement)) return textOf((n as ReactElement<{ children?: ReactNode }>).props.children)
  return ''
}

function Markdown({ children, className, compact }: { children: string; className?: string; compact?: boolean }) {
  return (
    <div className={cn('prose-app prose max-w-none dark:prose-invert', compact ? 'prose-sm' : 'prose-sm sm:prose-base', 'prose-headings:scroll-mt-20 prose-headings:font-semibold prose-headings:tracking-tight prose-a:no-underline hover:prose-a:underline', className)}>
      <ReactMarkdown
        remarkPlugins={[remarkGfm, [remarkMath, { singleDollarTextMath: true }]]}
        rehypePlugins={[[rehypeKatex, { throwOnError: false, strict: false }]]}
        components={{
          pre: ({ children }) => {
            const child = (Array.isArray(children) ? children[0] : children) as ReactElement<{ className?: string; children?: ReactNode }>
            const cls = child?.props?.className ?? ''
            const lang = /language-([\w+#-]+)/.exec(cls)?.[1]
            return <CodeBlock code={textOf(child?.props?.children)} lang={lang} />
          },
          a: ({ href, children }) => (
            <a href={href} target={href?.startsWith('http') ? '_blank' : undefined} rel="noreferrer">
              {children}
            </a>
          ),
          h2: ({ children }) => <h2 id={slugify(textOf(children))}>{children}</h2>,
          h3: ({ children }) => <h3 id={slugify(textOf(children))}>{children}</h3>,
        }}
      >
        {children}
      </ReactMarkdown>
    </div>
  )
}

export default memo(Markdown)
