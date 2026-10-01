import type { Signature, TestCase, ValueType } from './types'
import { RESULT_MARKER } from './types'

const pyStr = (s: string) => JSON.stringify(s)
/** Embed arbitrary JSON in python source as json.loads("<json string>") */
const pyJson = (v: unknown) => `json.loads(${JSON.stringify(JSON.stringify(v))})`

function usesType(sig: Signature, pred: (t: ValueType) => boolean): boolean {
  const all: ValueType[] = []
  if (sig.kind === 'function') {
    all.push(sig.returns, ...sig.params.map((p) => p.type))
  } else if (sig.kind === 'class') {
    all.push(...sig.ctorParams.map((p) => p.type))
    for (const m of sig.methods) all.push(m.returns, ...m.params.map((p) => p.type))
  } else {
    all.push(sig.dataType)
  }
  return all.some(pred)
}

export const PY_LIST_NODE = `class ListNode:
    def __init__(self, val=0, next=None):
        self.val = val
        self.next = next
    def __repr__(self):
        return f"ListNode({self.val})"
`

export const PY_TREE_NODE = `class TreeNode:
    def __init__(self, val=0, left=None, right=None):
        self.val = val
        self.left = left
        self.right = right
    def __repr__(self):
        return f"TreeNode({self.val})"
`

export const PY_RANDOM_NODE = `class Node:
    def __init__(self, x: int, next: 'Node' = None, random: 'Node' = None):
        self.val = int(x)
        self.next = next
        self.random = random
`

export const PY_GRAPH_NODE = `class Node:
    def __init__(self, val=0, neighbors=None):
        self.val = val
        self.neighbors = neighbors if neighbors is not None else []
`

export const PY_PRELUDE = `import sys, json, io, time, traceback, contextlib, linecache, math, collections, heapq, bisect, functools, itertools, string, re, random, copy, operator
from typing import *
from collections import *
from heapq import *
from bisect import *
from functools import *
from itertools import *
sys.setrecursionlimit(20000 if sys.platform != 'emscripten' else 3000)
`

/** Node class definitions required by a signature (shown read-only in the editor header too). */
export function pyDefinitions(sig: Signature): string {
  const parts: string[] = []
  if (usesType(sig, (t) => t === 'ListNode' || t === 'ListNode[]' || t === 'CycleList')) parts.push(PY_LIST_NODE)
  if (usesType(sig, (t) => t === 'TreeNode' || t === 'TreeNodeRef')) parts.push(PY_TREE_NODE)
  if (usesType(sig, (t) => t === 'RandomList')) parts.push(PY_RANDOM_NODE)
  if (usesType(sig, (t) => t === 'GraphNode')) parts.push(PY_GRAPH_NODE)
  return parts.join('\n')
}

const PY_HARNESS = String.raw`
def _pm_build_list(vals):
    dummy = ListNode()
    cur = dummy
    for x in vals:
        cur.next = ListNode(x)
        cur = cur.next
    return dummy.next

def _pm_build_tree(vals):
    if not vals or vals[0] is None:
        return None
    root = TreeNode(vals[0])
    q = collections.deque([root])
    i = 1
    while q and i < len(vals):
        node = q.popleft()
        if i < len(vals) and vals[i] is not None:
            node.left = TreeNode(vals[i]); q.append(node.left)
        i += 1
        if i < len(vals) and vals[i] is not None:
            node.right = TreeNode(vals[i]); q.append(node.right)
        i += 1
    return root

def _pm_find(root, val):
    st = [root]
    while st:
        n = st.pop()
        if n is None:
            continue
        if n.val == val:
            return n
        st.append(n.left); st.append(n.right)
    return None

def _pm_build(t, v, prev):
    if t == 'ListNode':
        return _pm_build_list(v)
    if t == 'ListNode[]':
        return [_pm_build_list(x) for x in v]
    if t == 'CycleList':
        vals, pos = v[0], v[1]
        head = _pm_build_list(vals)
        if pos is not None and pos >= 0 and head is not None:
            nodes = []
            cur = head
            while cur:
                nodes.append(cur); cur = cur.next
            nodes[-1].next = nodes[pos]
        return head
    if t == 'TreeNode':
        return _pm_build_tree(v)
    if t == 'TreeNodeRef':
        root = next((b for (tt, b) in prev if tt == 'TreeNode'), None)
        return _pm_find(root, v)
    if t == 'RandomList':
        nodes = [Node(x[0]) for x in v]
        for i in range(len(nodes) - 1):
            nodes[i].next = nodes[i + 1]
        for i, x in enumerate(v):
            if x[1] is not None:
                nodes[i].random = nodes[x[1]]
        return nodes[0] if nodes else None
    if t == 'GraphNode':
        if not v:
            return None
        nodes = [Node(i + 1) for i in range(len(v))]
        for i, nb in enumerate(v):
            nodes[i].neighbors = [nodes[j - 1] for j in nb]
        return nodes[0]
    return copy.deepcopy(v)

def _pm_ser_list(head):
    out = []
    seen = set()
    while head is not None:
        if id(head) in seen or len(out) > 100000:
            out.append('...cycle')
            break
        seen.add(id(head))
        out.append(_pm_clean(head.val))
        head = head.next
    return out

def _pm_ser_tree(root):
    if root is None:
        return []
    out = []
    q = collections.deque([root])
    while q:
        n = q.popleft()
        if n is None:
            out.append(None)
            continue
        out.append(_pm_clean(n.val))
        q.append(n.left); q.append(n.right)
        if len(out) > 200000:
            break
    while out and out[-1] is None:
        out.pop()
    return out

def _pm_clean(v):
    if isinstance(v, bool) or v is None or isinstance(v, (int, str)):
        return v
    if isinstance(v, float):
        if math.isnan(v) or math.isinf(v):
            return str(v)
        return v
    if isinstance(v, (list, tuple, set, frozenset)):
        return [_pm_clean(x) for x in v]
    if isinstance(v, dict):
        return {str(k): _pm_clean(x) for k, x in v.items()}
    if 'ListNode' in globals() and isinstance(v, ListNode):
        return _pm_ser_list(v)
    if 'TreeNode' in globals() and isinstance(v, TreeNode):
        return _pm_ser_tree(v)
    if hasattr(v, 'tolist'):
        return _pm_clean(v.tolist())
    if hasattr(v, 'item'):
        return _pm_clean(v.item())
    if isinstance(v, (deque,)):
        return [_pm_clean(x) for x in v]
    return repr(v)

def _pm_ser(t, v):
    if t == 'void':
        return None
    if t in ('ListNode', 'CycleList'):
        return _pm_ser_list(v)
    if t == 'ListNode[]':
        return [_pm_ser_list(x) for x in v]
    if t == 'TreeNode':
        return _pm_ser_tree(v)
    if t == 'TreeNodeRef':
        if v is None:
            return None
        return _pm_clean(v.val) if hasattr(v, 'val') else _pm_clean(v)
    if t == 'RandomList':
        nodes = []
        idx = {}
        cur = v
        while cur is not None and len(nodes) <= 100000:
            idx[id(cur)] = len(nodes)
            nodes.append(cur)
            cur = cur.next
        return [[n.val, (idx.get(id(n.random)) if n.random is not None else None)] for n in nodes]
    if t == 'GraphNode':
        if v is None:
            return []
        seen = {id(v): v}
        q = collections.deque([v])
        while q:
            n = q.popleft()
            for nb in n.neighbors:
                if id(nb) not in seen:
                    seen[id(nb)] = nb
                    q.append(nb)
        nodes = sorted(seen.values(), key=lambda n: n.val)
        return [[nb.val for nb in n.neighbors] for n in nodes]
    if t == 'bool' and isinstance(v, (bool, int)):
        return bool(v)
    if t == 'double' and isinstance(v, (int, float)) and not isinstance(v, bool):
        return _pm_clean(float(v))
    return _pm_clean(v)

def _pm_fmt_exc(e):
    frames = [f for f in traceback.extract_tb(e.__traceback__) if f.filename == 'solution.py']
    lines = []
    for f in frames[-6:]:
        lines.append(f'  line {f.lineno}, in {f.name}\n    {(f.line or "").strip()}')
    head = 'Traceback (most recent call last):\n' if lines else ''
    return head + '\n'.join(lines) + ('\n' if lines else '') + f'{type(e).__name__}: {e}'

def _pm_args(params, args, prev=None):
    built = list(prev or [])
    out = []
    for p, a in zip(params, args):
        b = _pm_build(p['type'], a, built)
        built.append((p['type'], b))
        out.append(b)
    return out

def _pm_run_function(sig, tc):
    built = []
    vals = []
    for p, a in zip(sig['params'], tc['args']):
        b = _pm_build(p['type'], a, built)
        built.append((p['type'], b))
        vals.append(b)
    fn = getattr(Solution(), sig['name'])
    t0 = time.perf_counter()
    r = fn(*vals)
    ms = (time.perf_counter() - t0) * 1000
    if sig.get('inPlace') is not None:
        k = sig['inPlace']
        return _pm_ser(sig['params'][k]['type'], vals[k]), ms
    return _pm_ser(sig['returns'], r), ms

def _pm_run_class(sig, tc):
    cls = globals()[sig['className']]
    methods = {m['name']: m for m in sig['methods']}
    out = []
    obj = None
    t0 = time.perf_counter()
    for k, (op, a) in enumerate(zip(tc['ops'], tc['args'])):
        if k == 0:
            obj = cls(*_pm_args(sig['ctorParams'], a))
            out.append(None)
        else:
            m = methods[op]
            r = getattr(obj, op)(*_pm_args(m['params'], a))
            out.append(_pm_ser(m['returns'], r))
    return out, (time.perf_counter() - t0) * 1000

def _pm_run_codec(sig, tc):
    data = _pm_build(sig['dataType'], tc['args'][0], [])
    obj = globals()[sig['className']]()
    t0 = time.perf_counter()
    enc = getattr(obj, sig['encode'])(data)
    if not isinstance(enc, str):
        raise TypeError(sig['encode'] + ' must return a str')
    dec = getattr(obj, sig['decode'])(enc)
    return _pm_ser(sig['dataType'], dec), (time.perf_counter() - t0) * 1000

def _pm_emit(rec):
    try:
        line = json.dumps(rec)
    except Exception:
        rec['out'] = repr(rec.get('out'))
        line = json.dumps(rec)
    sys.stdout.write(_PM_MARKER + line + '\n')
    sys.stdout.flush()

def _pm_src(name, src):
    linecache.cache[name] = (len(src), None, src.splitlines(True), name)

def _pm_main():
    try:
        _pm_src('solution.py', _PM_USER)
        exec(compile(_PM_USER, 'solution.py', 'exec'), globals())
    except BaseException as e:
        if isinstance(e, SyntaxError):
            msg = f'  line {e.lineno}\n    {(e.text or "").rstrip()}\nSyntaxError: {e.msg}'
        else:
            msg = _pm_fmt_exc(e)
        _pm_emit({'i': -1, 'ok': False, 'err': msg})
        return
    runner = {'function': _pm_run_function, 'class': _pm_run_class, 'codec': _pm_run_codec}[_PM_SIG['kind']]
    for i, tc in enumerate(_PM_TESTS):
        buf = io.StringIO()
        rec = {'i': i}
        try:
            with contextlib.redirect_stdout(buf):
                out, ms = runner(_PM_SIG, tc)
            rec['ok'] = True
            rec['out'] = out
            rec['ms'] = round(ms, 3)
        except BaseException as e:
            rec['ok'] = False
            rec['err'] = _pm_fmt_exc(e)
        s = buf.getvalue()
        if len(s) > 5000:
            s = s[:5000] + '\n...[output truncated]'
        rec['stdout'] = s
        _pm_emit(rec)

_pm_main()
`

export function buildPythonHarness(sig: Signature, tests: TestCase[], userCode: string): string {
  return [
    PY_PRELUDE,
    pyDefinitions(sig),
    `_PM_MARKER = ${pyStr(RESULT_MARKER)}`,
    `_PM_SIG = ${pyJson(sig)}`,
    `_PM_TESTS = ${pyJson(tests)}`,
    `_PM_USER = ${pyStr(userCode)}`,
    PY_HARNESS,
  ].join('\n')
}

/** Harness for "script" style problems (ML coding): each test is python code run against the user's namespace. */
export function buildPythonScriptHarness(tests: { name: string; code: string }[], userCode: string, setup = ''): string {
  return [
    PY_PRELUDE,
    `_PM_MARKER = ${pyStr(RESULT_MARKER)}`,
    `_PM_TESTS = ${pyJson(tests)}`,
    `_PM_USER = ${pyStr(userCode)}`,
    `_PM_SETUP = ${pyStr(setup)}`,
    String.raw`
def _pm_fmt_exc(e, files=('solution.py',)):
    frames = [f for f in traceback.extract_tb(e.__traceback__) if f.filename in files]
    lines = [f'  {f.filename}, line {f.lineno}, in {f.name}\n    {(f.line or "").strip()}' for f in frames[-6:]]
    head = 'Traceback (most recent call last):\n' if lines else ''
    msg = str(e)
    return head + '\n'.join(lines) + ('\n' if lines else '') + type(e).__name__ + (': ' + msg if msg else '')

def _pm_emit(rec):
    try:
        line = json.dumps(rec)
    except Exception:
        rec['out'] = repr(rec.get('out'))
        line = json.dumps(rec)
    sys.stdout.write(_PM_MARKER + line + '\n')
    sys.stdout.flush()

def _pm_src(name, src):
    linecache.cache[name] = (len(src), None, src.splitlines(True), name)

def _pm_main():
    ns = {'__name__': '__solution__'}
    _pm_src('solution.py', _PM_USER)
    _pm_src('setup.py', _PM_SETUP)
    try:
        buf = io.StringIO()
        with contextlib.redirect_stdout(buf):
            if _PM_SETUP:
                exec(compile(_PM_SETUP, 'setup.py', 'exec'), ns)
            exec(compile(_PM_USER, 'solution.py', 'exec'), ns)
    except BaseException as e:
        if isinstance(e, SyntaxError):
            msg = f'  line {e.lineno}\n    {(e.text or "").rstrip()}\nSyntaxError: {e.msg}'
        else:
            msg = _pm_fmt_exc(e)
        _pm_emit({'i': -1, 'ok': False, 'err': msg})
        return
    for i, t in enumerate(_PM_TESTS):
        buf = io.StringIO()
        rec = {'i': i}
        t0 = time.perf_counter()
        try:
            _pm_src('test.py', t['code'])
            with contextlib.redirect_stdout(buf):
                exec(compile(t['code'], 'test.py', 'exec'), dict(ns))
            rec['ok'] = True
            rec['out'] = 'passed'
        except AssertionError as e:
            rec['ok'] = False
            rec['err'] = 'AssertionError: ' + (str(e) or 'assertion failed')
        except BaseException as e:
            rec['ok'] = False
            rec['err'] = _pm_fmt_exc(e, ('solution.py', 'test.py'))
        rec['ms'] = round((time.perf_counter() - t0) * 1000, 3)
        s = buf.getvalue()
        if len(s) > 5000:
            s = s[:5000] + '\n...[output truncated]'
        rec['stdout'] = s
        _pm_emit(rec)

_pm_main()
`,
  ].join('\n')
}
