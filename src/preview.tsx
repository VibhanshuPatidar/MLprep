// Dev-only page to render a single visualizer in isolation: /preview.html?c=dsa/Sorting&theme=dark
import { StrictMode, Suspense, lazy, type ComponentType } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'

const mods = import.meta.glob('./viz/*/*.tsx') as Record<string, () => Promise<{ default: ComponentType }>>
const params = new URLSearchParams(location.search)
const c = params.get('c') ?? ''
if (params.get('theme') !== 'light') document.documentElement.classList.add('dark')
const loader = mods[`./viz/${c}.tsx`]
const Comp = loader ? lazy(loader) : () => <div className="p-6 text-err">No widget at src/viz/{c}.tsx. Available: {Object.keys(mods).join(', ')}</div>

// Surface runtime errors visibly (headless screenshots cannot read the console)
const errors: string[] = []
const showErrors = () => {
  let box = document.getElementById('preview-errors')
  if (!box) {
    box = document.createElement('pre')
    box.id = 'preview-errors'
    box.style.cssText = 'position:fixed;bottom:0;left:0;right:0;max-height:40vh;overflow:auto;background:#7f1d1d;color:#fff;font:12px monospace;padding:8px;z-index:9999;white-space:pre-wrap'
    document.body.appendChild(box)
  }
  box.textContent = 'RUNTIME ERRORS:\n' + errors.join('\n')
}
window.addEventListener('error', (e) => {
  errors.push(String(e.message))
  showErrors()
})
window.addEventListener('unhandledrejection', (e) => {
  errors.push('Unhandled rejection: ' + String(e.reason))
  showErrors()
})
const origError = console.error
console.error = (...a: unknown[]) => {
  errors.push(a.map(String).join(' ').slice(0, 500))
  showErrors()
  origError(...a)
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <div className="mx-auto max-w-5xl p-6" style={{ width: Number(params.get('w')) || undefined }}>
      <Suspense fallback={<div className="text-muted">Loading…</div>}>
        <Comp />
      </Suspense>
    </div>
  </StrictMode>,
)
