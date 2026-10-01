import type { ProcessOutput } from './compare'
import type { Language } from './types'

type Listener = (s: RuntimeStatus) => void
export type RuntimeStatus = { python: 'idle' | 'loading' | 'ready' | 'error'; pythonError?: string; cpp: 'unknown' | 'ok' | 'down'; cxx?: string }

let status: RuntimeStatus = { python: 'idle', cpp: 'unknown' }
const listeners = new Set<Listener>()
const emit = (s: Partial<RuntimeStatus>) => {
  status = { ...status, ...s }
  listeners.forEach((l) => l(status))
}
export const getRuntimeStatus = () => status
export function onRuntimeStatus(l: Listener) {
  listeners.add(l)
  return () => {
    listeners.delete(l)
  }
}

// ---------------- Python (Pyodide worker) ----------------
let worker: Worker | null = null
let readyPromise: Promise<void> | null = null
let seq = 0
const pending = new Map<number, { resolve: (o: ProcessOutput & { ms?: number }) => void; onStatus?: (s: string) => void }>()

function spawnWorker(): Promise<void> {
  worker = new Worker(new URL('./pyodide.worker.ts', import.meta.url), { type: 'module' })
  emit({ python: 'loading' })
  readyPromise = new Promise((resolve, reject) => {
    worker!.onmessage = (e: MessageEvent) => {
      const m = e.data
      if (m.type === 'ready') {
        emit({ python: 'ready' })
        resolve()
      } else if (m.type === 'fatal') {
        emit({ python: 'error', pythonError: m.error })
        reject(new Error(m.error))
      } else if (m.type === 'status') {
        pending.get(m.id)?.onStatus?.(m.status)
      } else if (m.type === 'done') {
        const p = pending.get(m.id)
        pending.delete(m.id)
        p?.resolve({ stdout: m.stdout, stderr: m.stderr, ms: m.ms })
        if (m.fatal) killWorker()
      }
    }
    worker!.onerror = (e) => {
      emit({ python: 'error', pythonError: e.message })
      reject(new Error(e.message))
    }
  })
  worker.postMessage({ type: 'init' })
  return readyPromise
}

function killWorker() {
  worker?.terminate()
  worker = null
  readyPromise = null
  emit({ python: 'idle' })
}

export function preloadPython() {
  if (!readyPromise) spawnWorker().catch(() => {})
  return readyPromise
}

export async function runPython(source: string, opts: { timeoutMs?: number; userCode?: string; packages?: string[]; onStatus?: (s: string) => void } = {}): Promise<ProcessOutput> {
  if (!readyPromise) spawnWorker()
  try {
    await readyPromise
  } catch (e) {
    killWorker()
    return { stdout: '', stderr: `Failed to load the Python runtime (Pyodide) from the CDN: ${String(e)}`, exitCode: 1 }
  }
  const id = ++seq
  const timeoutMs = opts.timeoutMs ?? 10000
  return new Promise((resolve) => {
    let timer: ReturnType<typeof setTimeout> | undefined
    const fail = (out: ProcessOutput) => {
      clearTimeout(timer)
      pending.delete(id)
      killWorker()
      resolve(out)
    }
    // generous guard while packages download; replaced by the real limit once code starts running
    timer = setTimeout(() => fail({ stdout: '', stderr: 'Timed out while loading Python packages.', exitCode: 1 }), 180000)
    pending.set(id, {
      resolve: (o) => {
        clearTimeout(timer)
        resolve(o)
      },
      onStatus: (s) => {
        if (s === 'running') {
          clearTimeout(timer)
          timer = setTimeout(() => fail({ stdout: '', stderr: '', timedOut: true }), timeoutMs)
        }
        opts.onStatus?.(s)
      },
    })
    worker!.postMessage({ type: 'run', id, source, userCode: opts.userCode, packages: opts.packages })
  })
}

// ---------------- C++ (local runner) ----------------
export async function checkRunner(): Promise<boolean> {
  try {
    const r = await fetch('/api/health', { cache: 'no-store' })
    if (!r.ok) throw new Error()
    const j = await r.json()
    emit({ cpp: j.cpp ? 'ok' : 'down', cxx: j.cxx })
    return Boolean(j.cpp)
  } catch {
    emit({ cpp: 'down' })
    return false
  }
}

export async function runCpp(source: string, timeoutMs = 5000): Promise<ProcessOutput & { compileMs?: number }> {
  try {
    const r = await fetch('/api/run', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ language: 'cpp', source, timeoutMs }),
    })
    if (!r.ok) throw new Error(`HTTP ${r.status}`)
    emit({ cpp: 'ok' })
    return await r.json()
  } catch (e) {
    emit({ cpp: 'down' })
    return {
      stdout: '',
      compileError: `The local C++ runner is not reachable (${String(e)}).\n\nStart it with:\n  npm run dev        # web app + runner\n  # or, separately:\n  npm run runner\n\nThe runner compiles your code with clang++/g++ on this machine (localhost only).`,
    }
  }
}

export function execute(lang: Language, source: string, opts: { timeoutMs?: number; userCode?: string; packages?: string[]; onStatus?: (s: string) => void } = {}) {
  return lang === 'python' ? runPython(source, opts) : runCpp(source, opts.timeoutMs)
}
