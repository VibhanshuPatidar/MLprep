import { ArrowLeft, Sparkles } from 'lucide-react'
import { useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { Page } from '../components/Layout'
import Widget from '../components/Widget'
import { Badge, Card, PageHeader, SearchInput, Segmented } from '../components/ui'
import { dsaProblems, mlProblems, mlsdDocs, sdDocs, theoryTopics } from '../data'
import type { WidgetId } from '../types/content'
import { widgetById, widgets, type WidgetMeta } from '../viz/registry'

type G = 'All' | WidgetMeta['group']

function usedIn(id: WidgetId) {
  const out: { label: string; to: string }[] = []
  dsaProblems.filter((p) => p.viz === id).forEach((p) => out.push({ label: p.title, to: `/dsa/${p.id}` }))
  mlProblems.filter((p) => p.viz === id).forEach((p) => out.push({ label: p.title, to: `/ml-coding/${p.id}` }))
  theoryTopics.filter((t) => t.widgets?.includes(id)).forEach((t) => out.push({ label: t.title, to: `/theory/${t.id}` }))
  sdDocs.filter((d) => d.widgets?.includes(id)).forEach((d) => out.push({ label: d.title, to: `/system-design/${d.id}` }))
  mlsdDocs.filter((d) => d.widgets?.includes(id)).forEach((d) => out.push({ label: d.title, to: `/ml-design/${d.id}` }))
  return out
}

export function VisualizerGallery() {
  const [g, setG] = useState<G>('All')
  const [q, setQ] = useState('')
  const list = widgets.filter((w) => (g === 'All' || w.group === g) && `${w.title} ${w.description}`.toLowerCase().includes(q.toLowerCase()))
  return (
    <Page wide>
      <PageHeader icon={<Sparkles size={20} />} title="Visualizers" subtitle={`${widgets.length} interactive, step-through visualizations of algorithms, ML concepts and distributed-systems mechanics. Each one is also embedded next to the problems and topics that use it.`} />
      <div className="mb-6 flex flex-wrap items-center gap-3">
        <SearchInput value={q} onChange={setQ} placeholder="Search visualizers…" className="w-full sm:w-72" />
        <Segmented<G>
          options={[
            { value: 'All', label: 'All' },
            { value: 'DSA', label: 'Algorithms' },
            { value: 'ML', label: 'Machine learning' },
            { value: 'Systems', label: 'Systems' },
          ]}
          value={g}
          onChange={setG}
        />
      </div>
      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
        {list.map((w) => {
          const n = usedIn(w.id).length
          return (
            <Link key={w.id} to={`/visualizers/${w.id}`} className="group">
              <Card className="flex h-full flex-col p-4 transition-all group-hover:-translate-y-0.5 group-hover:border-accent/50">
                <div className="mb-2 flex items-center gap-2">
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-accent-soft text-accent">
                    <Sparkles size={15} />
                  </div>
                  <h3 className="flex-1 font-semibold group-hover:text-accent">{w.title}</h3>
                  <Badge>{w.group === 'DSA' ? 'Algorithms' : w.group}</Badge>
                </div>
                <p className="flex-1 text-[13px] text-muted">{w.description}</p>
                {n > 0 && <div className="mt-3 text-[11px] text-faint">Used in {n} problem{n > 1 ? 's' : ''} / topic{n > 1 ? 's' : ''}</div>}
              </Card>
            </Link>
          )
        })}
      </div>
    </Page>
  )
}

export function VisualizerDetail() {
  const { id = '' } = useParams()
  const meta = widgetById[id as WidgetId]
  if (!meta) return <div className="p-10 text-muted">Visualizer not found.</div>
  const links = usedIn(meta.id)
  return (
    <Page wide>
      <Link to="/visualizers" className="mb-4 inline-flex items-center gap-1 text-xs text-muted hover:text-fg">
        <ArrowLeft size={14} /> Visualizers
      </Link>
      <h1 className="text-2xl font-semibold tracking-tight">{meta.title}</h1>
      <p className="mt-1 mb-5 text-muted">{meta.description}</p>
      <Widget id={meta.id} />
      {links.length > 0 && (
        <div className="mt-8">
          <h2 className="mb-3 text-sm font-semibold text-muted">Practice it</h2>
          <div className="flex flex-wrap gap-2">
            {links.map((l) => (
              <Link key={l.to} to={l.to} className="rounded-lg border border-line bg-panel px-3 py-1.5 text-sm hover:border-accent/50 hover:text-accent">
                {l.label}
              </Link>
            ))}
          </div>
        </div>
      )}
    </Page>
  )
}
