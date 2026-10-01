// Local code runner for PrepML. Binds to 127.0.0.1 only — it executes code you submit from the app.
import { createServer } from 'node:http'
import { CXX, PYTHON, ensurePch, runCpp, runPython } from './exec.mjs'

const PORT = Number(process.env.RUNNER_PORT || 8787)
const HOST = '127.0.0.1'
const MAX_BODY = 4 * 1024 * 1024

function send(res, code, body) {
  res.writeHead(code, {
    'Content-Type': 'application/json',
    'Access-Control-Allow-Origin': 'http://localhost:5173',
    'Access-Control-Allow-Headers': 'Content-Type',
  })
  res.end(JSON.stringify(body))
}

let queue = Promise.resolve()
const serial = (fn) => (queue = queue.then(fn, fn))

const server = createServer((req, res) => {
  if (req.method === 'OPTIONS') return send(res, 204, {})
  if (req.method === 'GET' && req.url === '/api/health') {
    return send(res, 200, { ok: true, cpp: Boolean(CXX), cxx: CXX, python: PYTHON })
  }
  if (req.method === 'POST' && req.url === '/api/client-log') {
    // diagnostics page reports results here so headless runs can be inspected from the terminal
    let body = ''
    req.on('data', (d) => {
      if (body.length < 10000) body += d
    })
    req.on('end', () => {
      console.log('[client]', body.slice(0, 2000))
      send(res, 200, { ok: true })
    })
    return
  }
  if (req.method === 'POST' && req.url === '/api/run') {
    let body = ''
    req.on('data', (d) => {
      body += d
      if (body.length > MAX_BODY) req.destroy()
    })
    req.on('end', async () => {
      try {
        const { language, source, timeoutMs } = JSON.parse(body)
        const limit = Math.min(Math.max(Number(timeoutMs) || 5000, 500), 15000)
        if (typeof source !== 'string') return send(res, 400, { error: 'source required' })
        const result = await serial(() =>
          language === 'cpp' ? runCpp(source, { timeoutMs: limit }) : language === 'python' ? runPython(source, { timeoutMs: limit }) : { error: 'unsupported language' },
        )
        send(res, 200, result)
      } catch (e) {
        send(res, 500, { error: String(e) })
      }
    })
    return
  }
  send(res, 404, { error: 'not found' })
})

server.listen(PORT, HOST, () => {
  console.log(`[runner] listening on http://${HOST}:${PORT}  (c++: ${CXX ?? 'none'}, python: ${PYTHON ?? 'none'})`)
  ensurePch().then((p) => console.log(p ? '[runner] precompiled header ready' : '[runner] no PCH (still works, slower compiles)'))
})
