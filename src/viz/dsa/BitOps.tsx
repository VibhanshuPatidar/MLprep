import { useMemo, useState } from 'react'
import { C, PlayerControls, usePlayer, useSize, VizFrame } from '../common'
import { Select, Slider, cn } from '../../components/ui'
import { MiniStat, Pill, PseudoCode, range } from './_shared2'

type Width = 8 | 16 | 32
type Op = 'and' | 'or' | 'xor' | 'not' | 'shl' | 'shr' | 'clear' | 'lowbit' | 'popcount' | 'xorswap' | 'single'

interface BitFrame {
  a: bigint
  b: bigint
  result: bigint
  activeBits: number[]
  vars: { label: string; value: string }[]
  line: number
  caption: string
}

const opOptions: { value: Op; label: string }[] = [
  { value: 'and', label: 'a & b' },
  { value: 'or', label: 'a | b' },
  { value: 'xor', label: 'a ^ b' },
  { value: 'not', label: '~a' },
  { value: 'shl', label: 'a << k' },
  { value: 'shr', label: 'a >> k' },
  { value: 'clear', label: 'n&(n-1)' },
  { value: 'lowbit', label: 'n&-n' },
  { value: 'popcount', label: 'popcount' },
  { value: 'xorswap', label: 'XOR swap' },
  { value: 'single', label: 'single number' },
]

const genericCode = [
  { id: 1, text: 'align operands in binary' },
  { id: 2, text: 'inspect the highlighted bit(s)' },
  { id: 3, text: 'apply the bit rule / trick' },
  { id: 4, text: 'write the resulting bits' },
  { id: 5, text: 'interpret signed, unsigned, and hex views' },
]

const popCode = [
  { id: 1, text: 'count = 0; n = a' },
  { id: 2, text: 'while n != 0' },
  { id: 3, text: 'n = n & (n - 1) clears low set bit' },
  { id: 4, text: 'count += 1' },
  { id: 5, text: 'return count' },
]

const swapCode = [
  { id: 1, text: 'x = a; y = b' },
  { id: 2, text: 'x = x ^ y' },
  { id: 3, text: 'y = x ^ y  // original x' },
  { id: 4, text: 'x = x ^ y  // original y' },
  { id: 5, text: 'x and y are swapped without temp' },
]

const singleCode = [
  { id: 1, text: 'acc = 0' },
  { id: 2, text: 'for x in nums' },
  { id: 3, text: 'acc = acc ^ x' },
  { id: 4, text: 'duplicates cancel because x ^ x = 0' },
  { id: 5, text: 'remaining acc is the single number' },
]

function mask(width: Width) {
  return (1n << BigInt(width)) - 1n
}

function toUnsigned(value: number | bigint, width: Width) {
  if (typeof value === 'bigint') return BigInt.asUintN(width, value)
  return BigInt.asUintN(width, BigInt(Number.isFinite(value) ? Math.trunc(value) : 0))
}

function toSignedString(value: bigint, width: Width) {
  return BigInt.asIntN(width, value).toString()
}

function hex(value: bigint, width: Width) {
  return `0x${value.toString(16).padStart(width / 4, '0')}`
}

function bit(value: bigint, position: number) {
  return (value >> BigInt(position)) & 1n
}

function setBitValue(value: bigint, position: number, bitValue: bigint) {
  const m = 1n << BigInt(position)
  return bitValue === 1n ? value | m : value & ~m
}

function lowSetBit(n: bigint, width: Width) {
  for (let i = 0; i < width; i += 1) if (bit(n, i) === 1n) return i
  return -1
}

function makeBitwiseFrames(op: Op, a: bigint, b: bigint, width: Width, shift: number): BitFrame[] {
  const frames: BitFrame[] = []
  const push = (result: bigint, activeBits: number[], line: number, caption: string, vars: { label: string; value: string }[] = []) => frames.push({ a, b, result: result & mask(width), activeBits, vars, line, caption })
  let result = 0n
  push(0n, [], 1, `Align ${width}-bit operands before applying ${opOptions.find((o) => o.value === op)?.label}.`)
  if (op === 'not') {
    for (let i = width - 1; i >= 0; i -= 1) {
      result = setBitValue(result, i, bit(a, i) === 1n ? 0n : 1n)
      push(result, [i], 3, `NOT flips bit ${i}: ${bit(a, i)} → ${bit(result, i)}.`)
    }
    push(result, [], 5, `~a = ${toSignedString(result, width)} (${hex(result, width)}).`)
    return frames
  }
  if (op === 'shl' || op === 'shr') {
    const res = op === 'shl' ? (a << BigInt(shift)) & mask(width) : BigInt.asUintN(width, BigInt.asIntN(width, a) >> BigInt(shift))
    push(res, range(width), 3, op === 'shl' ? `Shift left by ${shift}; zeros enter on the right.` : `Arithmetic shift right by ${shift}; sign bit is preserved.`)
    push(res, [], 5, `Result = ${toSignedString(res, width)} (${hex(res, width)}).`)
    return frames
  }
  for (let i = width - 1; i >= 0; i -= 1) {
    const av = bit(a, i)
    const bv = bit(b, i)
    const rv = op === 'and' ? av & bv : op === 'or' ? av | bv : av ^ bv
    result = setBitValue(result, i, rv)
    push(result, [i], 2, `Bit ${i}: ${av} ${op === 'and' ? '&' : op === 'or' ? '|' : '^'} ${bv} = ${rv}.`)
  }
  push(result, [], 5, `Final result = ${toSignedString(result, width)} (${hex(result, width)}).`)
  return frames
}

function makeTrickFrames(op: Op, a: bigint, b: bigint, width: Width): BitFrame[] {
  const frames: BitFrame[] = []
  const push = (result: bigint, activeBits: number[], line: number, caption: string, vars: { label: string; value: string }[] = [], aa = a, bb = b) => frames.push({ a: aa & mask(width), b: bb & mask(width), result: result & mask(width), activeBits, vars, line, caption })
  if (op === 'clear') {
    const low = lowSetBit(a, width)
    push(a, low >= 0 ? [low] : [], 1, 'n & (n - 1) targets the lowest set bit.', [{ label: 'n-1', value: hex((a - 1n) & mask(width), width) }])
    const res = a & (a - 1n)
    push(res, low >= 0 ? [low] : [], 3, low >= 0 ? `Lowest set bit ${low} is cleared.` : 'n is zero, so nothing changes.', [{ label: 'n-1', value: hex((a - 1n) & mask(width), width) }])
    return frames
  }
  if (op === 'lowbit') {
    const low = lowSetBit(a, width)
    const neg = BigInt.asUintN(width, -BigInt.asIntN(width, a))
    push(a, [], 1, 'Two’s complement -n flips bits and adds one.', [{ label: '-n', value: hex(neg, width) }])
    const res = a & neg
    push(res, low >= 0 ? [low] : [], 3, low >= 0 ? `Only the lowest set bit ${low} survives in n & -n.` : 'n is zero, so lowbit is zero.', [{ label: '-n', value: hex(neg, width) }])
    return frames
  }
  if (op === 'popcount') {
    let n = a
    let count = 0
    push(n, [], 1, `Start popcount with n = ${hex(n, width)}.`, [{ label: 'count', value: String(count) }])
    while (n !== 0n && count < width) {
      const low = lowSetBit(n, width)
      push(n, low >= 0 ? [low] : [], 2, `n is non-zero; lowest set bit is ${low}.`, [{ label: 'count', value: String(count) }])
      n &= n - 1n
      count += 1
      push(n, low >= 0 ? [low] : [], 3, `Clear that bit with n = n & (n - 1).`, [{ label: 'count', value: String(count) }])
      push(n, [], 4, `Increment count to ${count}.`, [{ label: 'count', value: String(count) }])
    }
    push(BigInt(count), [], 5, `popcount(a) = ${count}.`, [{ label: 'count', value: String(count) }])
    return frames
  }
  if (op === 'xorswap') {
    let x = a
    let y = b
    push(x, [], 1, `Start x=${toSignedString(x, width)}, y=${toSignedString(y, width)}.`, [{ label: 'x', value: hex(x, width) }, { label: 'y', value: hex(y, width) }], x, y)
    x = (x ^ y) & mask(width)
    push(x, range(width), 2, 'x = x ^ y stores the differences.', [{ label: 'x', value: hex(x, width) }, { label: 'y', value: hex(y, width) }], x, y)
    y = (x ^ y) & mask(width)
    push(y, range(width), 3, 'y = x ^ y recovers original x.', [{ label: 'x', value: hex(x, width) }, { label: 'y', value: hex(y, width) }], x, y)
    x = (x ^ y) & mask(width)
    push(x, range(width), 4, 'x = x ^ y recovers original y.', [{ label: 'x', value: hex(x, width) }, { label: 'y', value: hex(y, width) }], x, y)
    push(x, [], 5, 'Swap complete.', [{ label: 'x', value: toSignedString(x, width) }, { label: 'y', value: toSignedString(y, width) }], x, y)
    return frames
  }
  const nums = [6, 1, 3, 1, 3]
  let acc = 0n
  push(acc, [], 1, `Fold array [${nums.join(', ')}] with XOR.`, [{ label: 'acc', value: '0' }])
  nums.forEach((num, i) => {
    const x = toUnsigned(num, width)
    push(acc, range(width).filter((pos) => bit(x, pos) === 1n), 2, `Read nums[${i}] = ${num}.`, [{ label: 'x', value: String(num) }, { label: 'acc', value: toSignedString(acc, width) }], acc, x)
    acc = (acc ^ x) & mask(width)
    push(acc, range(width), 3, `acc ^= ${num} → ${toSignedString(acc, width)}.`, [{ label: 'acc', value: toSignedString(acc, width) }], acc, x)
  })
  push(acc, [], 5, `Duplicates canceled; single number is ${toSignedString(acc, width)}.`, [{ label: 'single', value: toSignedString(acc, width) }])
  return frames
}

function makeFrames(op: Op, aNum: number, bNum: number, width: Width, shift: number) {
  const a = toUnsigned(aNum, width)
  const b = toUnsigned(bNum, width)
  const safeShift = Math.max(0, Math.min(width - 1, Math.trunc(shift)))
  if (op === 'and' || op === 'or' || op === 'xor' || op === 'not' || op === 'shl' || op === 'shr') return makeBitwiseFrames(op, a, b, width, safeShift)
  return makeTrickFrames(op, a, b, width)
}

function linesFor(op: Op) {
  if (op === 'popcount') return popCode
  if (op === 'xorswap') return swapCode
  if (op === 'single') return singleCode
  return genericCode
}

function BitRow({ label, value, width, activeBits, onToggle }: { label: string; value: bigint; width: Width; activeBits: number[]; onToggle?: (position: number) => void }) {
  const active = new Set(activeBits)
  return (
    <div className="space-y-1">
      <div className="flex items-center justify-between text-[11px] text-muted">
        <span>{label}</span>
        <span className="font-mono">{hex(value, width)}</span>
      </div>
      <div className="grid gap-1 overflow-x-auto" style={{ gridTemplateColumns: `repeat(${width}, minmax(16px, 1fr))` }}>
        {range(width).reverse().map((pos) => {
          const one = bit(value, pos) === 1n
          const hot = active.has(pos)
          return (
            <button
              key={pos}
              type="button"
              onClick={() => onToggle?.(pos)}
              disabled={!onToggle}
              className={cn('h-7 rounded-md border font-mono text-[11px] transition-all duration-200', hot ? 'border-accent bg-accent text-accent-fg shadow-sm' : one ? 'border-accent/50 bg-accent-soft text-accent' : 'border-line bg-panel text-muted', onToggle && 'hover:ring-1 hover:ring-accent/50')}
              title={`bit ${pos}`}
            >
              {one ? 1 : 0}
            </button>
          )
        })}
      </div>
    </div>
  )
}

function NumberViews({ label, value, width }: { label: string; value: bigint; width: Width }) {
  return (
    <div className="rounded-lg border border-line bg-subtle px-2 py-1.5">
      <div className="text-[10px] uppercase tracking-wide text-muted">{label}</div>
      <div className="mt-1 grid grid-cols-3 gap-2 font-mono text-[11px]">
        <span>signed {toSignedString(value, width)}</span>
        <span>unsigned {value.toString()}</span>
        <span>{hex(value, width)}</span>
      </div>
    </div>
  )
}

export default function BitOps() {
  const [width, setWidth] = useState<Width>(8)
  const [op, setOp] = useState<Op>('and')
  const [a, setA] = useState(42)
  const [b, setB] = useState(23)
  const [shift, setShift] = useState(2)
  const [ref] = useSize<HTMLDivElement>()
  const steps = useMemo(() => makeFrames(op, a, b, width, shift), [a, b, op, shift, width])
  const player = usePlayer(steps, op === 'popcount' || op === 'single' ? 3 : 10)
  const frame = player.step
  const opNeedsB = op === 'and' || op === 'or' || op === 'xor' || op === 'xorswap'
  const toggle = (which: 'a' | 'b', position: number) => {
    const current = toUnsigned(which === 'a' ? a : b, width)
    const next = current ^ (1n << BigInt(position))
    const signed = Number(BigInt.asIntN(width, next))
    if (which === 'a') setA(signed)
    else setB(signed)
  }

  return (
    <VizFrame
      title="Bit Manipulation"
      description="Toggle individual bits, run bitwise operators, and step through classic XOR and low-bit tricks."
      controls={
        <>
          <Select value={String(width)} onChange={(v) => setWidth(Number(v) as Width)} options={[{ value: '8', label: '8-bit' }, { value: '16', label: '16-bit' }, { value: '32', label: '32-bit' }]} />
          <Select value={op} onChange={setOp} options={opOptions} />
          <label className="flex items-center gap-1 text-xs text-muted">a <input type="number" value={a} onChange={(e) => setA(Number(e.target.value))} className="h-8 w-24 rounded-lg border border-line bg-panel px-2 font-mono text-sm text-fg outline-none focus:ring-2 focus:ring-accent/40" /></label>
          {opNeedsB && <label className="flex items-center gap-1 text-xs text-muted">b <input type="number" value={b} onChange={(e) => setB(Number(e.target.value))} className="h-8 w-24 rounded-lg border border-line bg-panel px-2 font-mono text-sm text-fg outline-none focus:ring-2 focus:ring-accent/40" /></label>}
          {(op === 'shl' || op === 'shr') && <Slider label="shift" min={1} max={Math.min(8, width - 1)} value={shift} onChange={setShift} className="w-28" />}
          <PlayerControls player={player} maxSpeed={16} />
        </>
      }
      caption={frame.caption}
      legend={[
        { color: C.accent, label: 'set / highlighted bit' },
        { color: C.lineStrong, label: 'zero bit' },
        { color: C.ok, label: 'computed value' },
      ]}
    >
      <div ref={ref} className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_310px]">
        <div className="space-y-3 rounded-2xl border border-line bg-panel/70 p-4">
          <BitRow label={op === 'single' ? 'accumulator' : op === 'xorswap' ? 'x / a' : 'a'} value={frame.a} width={width} activeBits={frame.activeBits} onToggle={(pos) => toggle('a', pos)} />
          {(opNeedsB || op === 'single') && <BitRow label={op === 'single' ? 'current array value' : op === 'xorswap' ? 'y / b' : 'b'} value={frame.b} width={width} activeBits={frame.activeBits} onToggle={opNeedsB ? (pos) => toggle('b', pos) : undefined} />}
          <BitRow label="result" value={frame.result} width={width} activeBits={frame.activeBits} />
          <div className="grid gap-2">
            <NumberViews label="a" value={frame.a} width={width} />
            {(opNeedsB || op === 'single') && <NumberViews label={op === 'single' ? 'x' : 'b'} value={frame.b} width={width} />}
            <NumberViews label="result" value={frame.result} width={width} />
          </div>
        </div>
        <div className="flex flex-col gap-3">
          <div className="grid grid-cols-2 gap-2">
            <MiniStat label="signed result" value={toSignedString(frame.result, width)} tone="ok" />
            <MiniStat label="hex result" value={hex(frame.result, width)} tone="info" />
          </div>
          <div className="rounded-xl border border-line bg-panel p-3">
            <div className="mb-2 text-[11px] font-semibold uppercase tracking-wide text-muted">Working variables</div>
            <div className="flex flex-wrap gap-1.5">
              {frame.vars.length === 0 ? <Pill>bitwise pass</Pill> : frame.vars.map((v) => <Pill key={`${v.label}-${v.value}`} tone="accent">{v.label}={v.value}</Pill>)}
            </div>
          </div>
          <PseudoCode lines={linesFor(op)} active={frame.line} />
        </div>
      </div>
    </VizFrame>
  )
}
