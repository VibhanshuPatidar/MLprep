// Screenshot a page with the locally installed Chrome (headless CLI mode).
//   node scripts/shot.mjs "http://127.0.0.1:5173/preview.html?c=dsa/Sorting" /tmp/out.png [--width 1280] [--height 900] [--wait 4000]
// The preview page renders any runtime errors in a red box, so check the screenshot (or use --dom to print text).
import { spawn } from 'node:child_process'
import { existsSync, rmSync, mkdtempSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'

const [url, out = '/tmp/shot.png', ...rest] = process.argv.slice(2)
const opt = (name, def) => {
  const i = rest.indexOf(name)
  return i >= 0 ? rest[i + 1] : def
}
const chrome = process.env.CHROME || '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome'
const profile = mkdtempSync(join(tmpdir(), 'prepml-chrome-'))
const dom = rest.includes('--dom')
const args = [
  '--headless=new',
  '--disable-gpu',
  '--no-first-run',
  '--no-default-browser-check',
  '--hide-scrollbars',
  '--force-prefers-reduced-motion',
  `--user-data-dir=${profile}`,
  `--window-size=${opt('--width', 1280)},${opt('--height', 900)}`,
  rest.includes('--real') ? `--timeout=${opt('--wait', 4000)}` : `--virtual-time-budget=${opt('--wait', 4000)}`,
  dom ? '--dump-dom' : `--screenshot=${out}`,
  url,
]
if (!dom) rmSync(out, { force: true })
const child = spawn(chrome, args, { stdio: ['ignore', 'pipe', 'ignore'] })
let html = ''
child.stdout.on('data', (d) => (html += d))
const started = Date.now()
const done = (msg) => {
  try {
    child.kill('SIGKILL')
  } catch {}
  rmSync(profile, { recursive: true, force: true })
  console.log(msg)
  process.exit(0)
}
const timer = setInterval(() => {
  if (!dom && existsSync(out)) {
    clearInterval(timer)
    setTimeout(() => done(`saved ${out}`), 300)
  } else if (Date.now() - started > Math.max(60000, Number(opt('--wait', 4000)) + 60000)) {
    clearInterval(timer)
    done('timeout')
  }
}, 250)
child.on('close', () => {
  if (dom) {
    const text = html.replace(/<script[\s\S]*?<\/script>/g, '').replace(/<style[\s\S]*?<\/style>/g, '').replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ')
    clearInterval(timer)
    done(text.slice(0, 6000))
  }
})
