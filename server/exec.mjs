// Process execution helpers shared by the HTTP runner and the content validator.
import { spawn, spawnSync } from 'node:child_process'
import { createHash } from 'node:crypto'
import { existsSync, mkdirSync, writeFileSync, rmSync, statSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'

const here = dirname(fileURLToPath(import.meta.url))
export const INCLUDE_DIR = join(here, 'include')
export const WORK_DIR = join(tmpdir(), 'prepml-runner')
mkdirSync(WORK_DIR, { recursive: true })

const MAX_OUT = 2 * 1024 * 1024

function which(cmds) {
  for (const c of cmds) {
    const r = spawnSync('sh', ['-c', `command -v ${c}`], { encoding: 'utf8' })
    if (r.status === 0 && r.stdout.trim()) return r.stdout.trim()
  }
  return null
}

export const CXX = process.env.CXX || which(['clang++', 'g++'])
export const PYTHON = process.env.PYTHON || which(['python3.13', 'python3.12', 'python3.11', 'python3.10', 'python3'])
const STD = '-std=c++17'
const CXXFLAGS = [STD, '-O2', '-w', '-I', INCLUDE_DIR]

/** Run a process with a timeout, capturing stdout/stderr (capped). */
export function runProcess(cmd, args, { input, timeoutMs = 5000, cwd } = {}) {
  return new Promise((resolve) => {
    const started = Date.now()
    const child = spawn(cmd, args, { cwd, stdio: ['pipe', 'pipe', 'pipe'] })
    let stdout = ''
    let stderr = ''
    let timedOut = false
    const timer = setTimeout(() => {
      timedOut = true
      child.kill('SIGKILL')
    }, timeoutMs)
    child.stdout.on('data', (d) => {
      if (stdout.length < MAX_OUT) stdout += d.toString()
    })
    child.stderr.on('data', (d) => {
      if (stderr.length < MAX_OUT) stderr += d.toString()
    })
    child.on('error', (e) => {
      clearTimeout(timer)
      resolve({ stdout, stderr: stderr + String(e), exitCode: -1, signal: null, timedOut, ms: Date.now() - started })
    })
    child.on('close', (code, signal) => {
      clearTimeout(timer)
      resolve({ stdout, stderr, exitCode: code, signal: timedOut ? null : signal, timedOut, ms: Date.now() - started })
    })
    if (input) child.stdin.write(input)
    child.stdin.end()
  })
}

let pchPath = null
let pchPromise = null
/** Build a precompiled header for bits/stdc++.h once (cuts compile time ~3x). */
export function ensurePch() {
  if (pchPromise) return pchPromise
  pchPromise = (async () => {
    if (!CXX || !/clang/.test(CXX)) return null
    const out = join(WORK_DIR, 'stdcxx.h.pch')
    const src = join(INCLUDE_DIR, 'bits', 'stdc++.h')
    if (existsSync(out) && statSync(out).mtimeMs > statSync(src).mtimeMs) {
      pchPath = out
      return out
    }
    const r = await runProcess(CXX, [...CXXFLAGS, '-x', 'c++-header', src, '-o', out], { timeoutMs: 60000 })
    if (r.exitCode === 0) pchPath = out
    return pchPath
  })()
  return pchPromise
}

const cleanCompileErrors = (s, dir) => s.split(dir + '/').join('').replace(/^.*harness\.cpp.*note:.*$/gm, '').trim()

/** Compile + run C++ source. Returns { compileError } or process output. */
export async function runCpp(source, { timeoutMs = 5000 } = {}) {
  if (!CXX) return { compileError: 'No C++ compiler found on this machine (install Xcode CLT: xcode-select --install).' }
  await ensurePch()
  const hash = createHash('sha1').update(source).digest('hex').slice(0, 16)
  const dir = join(WORK_DIR, hash)
  const bin = join(dir, 'main')
  const t0 = Date.now()
  let compileMs = 0
  if (!existsSync(bin)) {
    mkdirSync(dir, { recursive: true })
    writeFileSync(join(dir, 'main.cpp'), source)
    const args = [...CXXFLAGS, ...(pchPath ? ['-include-pch', pchPath] : []), 'main.cpp', '-o', 'main']
    const c = await runProcess(CXX, args, { cwd: dir, timeoutMs: 30000 })
    compileMs = Date.now() - t0
    if (c.exitCode !== 0) {
      rmSync(dir, { recursive: true, force: true })
      return { compileError: c.timedOut ? 'Compilation timed out' : cleanCompileErrors(c.stderr, dir), compileMs }
    }
  }
  const r = await runProcess(bin, [], { cwd: dir, timeoutMs })
  return { ...r, compileMs }
}

/** Run python source with the local interpreter. */
export async function runPython(source, { timeoutMs = 10000, python = PYTHON } = {}) {
  if (!python) return { stdout: '', stderr: 'No python3 found', exitCode: -1 }
  const hash = createHash('sha1').update(source).digest('hex').slice(0, 16)
  const file = join(WORK_DIR, `py_${hash}.py`)
  writeFileSync(file, source)
  const r = await runProcess(python, [file], { timeoutMs })
  rmSync(file, { force: true })
  return r
}
