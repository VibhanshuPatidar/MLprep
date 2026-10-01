import { Component, Suspense } from 'react'
import type { ReactNode } from 'react'
import type { WidgetId } from '../types/content'
import { widgetById } from '../viz/registry'

class Boundary extends Component<{ children: ReactNode; name: string }, { error: Error | null }> {
  state = { error: null as Error | null }
  static getDerivedStateFromError(error: Error) {
    return { error }
  }
  render() {
    if (this.state.error)
      return (
        <div className="rounded-xl border border-err/40 bg-err/5 p-4 text-sm text-err">
          The “{this.props.name}” visualizer failed to load: {this.state.error.message}
        </div>
      )
    return this.props.children
  }
}

export function WidgetSkeleton() {
  return (
    <div className="overflow-hidden rounded-xl border border-line bg-panel">
      <div className="h-16 animate-pulse border-b border-line bg-subtle/50" />
      <div className="h-72 animate-pulse bg-panel-2" />
    </div>
  )
}

export default function Widget({ id }: { id: WidgetId }) {
  const meta = widgetById[id]
  if (!meta) return null
  const C = meta.component
  return (
    <Boundary name={meta.title}>
      <Suspense fallback={<WidgetSkeleton />}>
        <C />
      </Suspense>
    </Boundary>
  )
}
