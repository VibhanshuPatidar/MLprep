/// <reference lib="webworker" />
// Pyodide (CPython compiled to WebAssembly) running inside a dedicated worker.
const PYODIDE_VERSION = '0.29.5'
const INDEX_URL = `https://cdn.jsdelivr.net/pyodide/v${PYODIDE_VERSION}/full/`

interface PyProxyLike {
  destroy?: () => void
}
interface PyodideLike {
  runPythonAsync: (code: string, opts?: { globals?: unknown }) => Promise<unknown>
  loadPackage: (pkgs: string[] | string, opts?: { messageCallback?: (m: string) => void }) => Promise<void>
  loadPackagesFromImports: (code: string, opts?: { messageCallback?: (m: string) => void }) => Promise<void>
  setStdout: (opts: { batched: (s: string) => void }) => void
  setStderr: (opts: { batched: (s: string) => void }) => void
  globals: { get: (name: string) => (() => PyProxyLike) | undefined }
  version: string
}

declare const self: DedicatedWorkerGlobalScope

let pyodidePromise: Promise<PyodideLike> | null = null

function load(): Promise<PyodideLike> {
  if (!pyodidePromise) {
    pyodidePromise = (async () => {
      const mod = (await import(/* @vite-ignore */ `${INDEX_URL}pyodide.mjs`)) as { loadPyodide: (o: { indexURL: string }) => Promise<PyodideLike> }
      const py = await mod.loadPyodide({ indexURL: INDEX_URL })
      return py
    })()
  }
  return pyodidePromise
}

type InMsg = { type: 'init' } | { type: 'run'; id: number; source: string; userCode?: string; packages?: string[] }

self.onmessage = async (e: MessageEvent<InMsg>) => {
  const msg = e.data
  if (msg.type === 'init') {
    try {
      const py = await load()
      self.postMessage({ type: 'ready', version: py.version })
    } catch (err) {
      self.postMessage({ type: 'fatal', error: String(err) })
    }
    return
  }
  if (msg.type === 'run') {
    let stdout = ''
    let stderr = ''
    try {
      const py = await load()
      const notify = (m: string) => self.postMessage({ type: 'status', id: msg.id, status: m })
      if (msg.packages?.length) await py.loadPackage(msg.packages, { messageCallback: notify })
      if (msg.userCode) await py.loadPackagesFromImports(msg.userCode, { messageCallback: notify })
      py.setStdout({
        batched: (s) => {
          stdout += s + '\n'
        },
      })
      py.setStderr({
        batched: (s) => {
          stderr += s + '\n'
        },
      })
      const dict = py.globals.get('dict')
      const ns = dict ? dict() : undefined
      const t0 = performance.now()
      self.postMessage({ type: 'status', id: msg.id, status: 'running' })
      try {
        await py.runPythonAsync(msg.source, ns ? { globals: ns } : undefined)
      } catch (err) {
        stderr += String((err as Error)?.message ?? err)
      } finally {
        ns?.destroy?.()
      }
      self.postMessage({ type: 'done', id: msg.id, stdout, stderr, ms: performance.now() - t0 })
    } catch (err) {
      self.postMessage({ type: 'done', id: msg.id, stdout, stderr: stderr + String(err), fatal: true })
    }
  }
}
