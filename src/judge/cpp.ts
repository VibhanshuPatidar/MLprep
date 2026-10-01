import type { Param, Signature, TestCase, ValueType } from './types'
import { RESULT_MARKER } from './types'

export function cppType(t: ValueType): string {
  switch (t) {
    case 'int':
      return 'int'
    case 'long':
      return 'long long'
    case 'double':
      return 'double'
    case 'uint32':
      return 'uint32_t'
    case 'bool':
      return 'bool'
    case 'string':
      return 'string'
    case 'char':
      return 'char'
    case 'int[]':
      return 'vector<int>'
    case 'long[]':
      return 'vector<long long>'
    case 'double[]':
      return 'vector<double>'
    case 'bool[]':
      return 'vector<bool>'
    case 'string[]':
      return 'vector<string>'
    case 'char[]':
      return 'vector<char>'
    case 'int[][]':
      return 'vector<vector<int>>'
    case 'double[][]':
      return 'vector<vector<double>>'
    case 'bool[][]':
      return 'vector<vector<bool>>'
    case 'string[][]':
      return 'vector<vector<string>>'
    case 'char[][]':
      return 'vector<vector<char>>'
    case 'ListNode':
    case 'CycleList':
      return 'ListNode*'
    case 'ListNode[]':
      return 'vector<ListNode*>'
    case 'TreeNode':
    case 'TreeNodeRef':
      return 'TreeNode*'
    case 'RandomList':
    case 'GraphNode':
      return 'Node*'
    case 'void':
      return 'void'
  }
}

/** Parameter declaration used in starter code (LeetCode conventions: vectors by reference). */
export function cppParamDecl(p: Param): string {
  const t = cppType(p.type)
  return t.startsWith('vector') ? `${t}& ${p.name}` : `${t} ${p.name}`
}

function charLit(c: string): string {
  const map: Record<string, string> = { "'": "\\'", '\\': '\\\\', '\n': '\\n', '\t': '\\t', '\r': '\\r', '\0': '\\0' }
  if (map[c]) return `'${map[c]}'`
  return `'${c}'`
}

function strLit(s: string): string {
  return `string(${JSON.stringify(s)})`
}

function num(v: unknown): string {
  if (typeof v !== 'number' || !Number.isFinite(v)) throw new Error(`expected number, got ${JSON.stringify(v)}`)
  return String(v)
}

function dbl(v: unknown): string {
  const s = num(v)
  return /[.eE]/.test(s) ? s : `${s}.0`
}

const ELEM: Partial<Record<ValueType, ValueType>> = {
  'int[]': 'int',
  'long[]': 'long',
  'double[]': 'double',
  'bool[]': 'bool',
  'string[]': 'string',
  'char[]': 'char',
  'int[][]': 'int[]',
  'double[][]': 'double[]',
  'bool[][]': 'bool[]',
  'string[][]': 'string[]',
  'char[][]': 'char[]',
}

/** C++ expression producing a value of type t from JSON value v. rootVar = variable holding first TreeNode arg. */
export function cppLiteral(t: ValueType, v: unknown, rootVar?: string): string {
  const elem = ELEM[t]
  if (elem) {
    if (!Array.isArray(v)) throw new Error(`expected array for ${t}, got ${JSON.stringify(v)}`)
    return `${cppType(t)}{${v.map((x) => cppLiteral(elem, x)).join(',')}}`
  }
  switch (t) {
    case 'int':
      return num(v)
    case 'long':
      return `${num(v)}LL`
    case 'uint32':
      return `${num(v)}u`
    case 'double':
      return dbl(v)
    case 'bool':
      return v ? 'true' : 'false'
    case 'string':
      return strLit(String(v))
    case 'char':
      return charLit(String(v))
    case 'ListNode':
      return `_pm::mkList(vector<int>{${(v as number[]).map(num).join(',')}})`
    case 'ListNode[]':
      return `vector<ListNode*>{${(v as number[][]).map((x) => cppLiteral('ListNode', x)).join(',')}}`
    case 'CycleList': {
      const [vals, pos] = v as [number[], number]
      return `_pm::mkCycle(vector<int>{${vals.map(num).join(',')}}, ${pos ?? -1})`
    }
    case 'TreeNode':
      return `_pm::mkTree(vector<optional<int>>{${(v as (number | null)[]).map((x) => (x === null ? 'nullopt' : `optional<int>(${num(x)})`)).join(',')}})`
    case 'TreeNodeRef':
      if (!rootVar) throw new Error('TreeNodeRef requires a preceding TreeNode argument')
      return `_pm::findNode(${rootVar}, ${num(v)})`
    case 'RandomList':
      return `_pm::mkRandom(vector<pair<int,int>>{${(v as [number, number | null][]).map(([a, b]) => `{${num(a)},${b === null ? -1 : num(b)}}`).join(',')}})`
    case 'GraphNode':
      return `_pm::mkGraph(vector<vector<int>>{${(v as number[][]).map((r) => `vector<int>{${r.map(num).join(',')}}`).join(',')}})`
    case 'void':
      return ''
  }
  throw new Error(`unsupported type ${t}`)
}

/** Serialization expression for variable `x` of type t. */
function serExpr(t: ValueType, x: string): string {
  switch (t) {
    case 'void':
      return 'string("null")'
    case 'TreeNodeRef':
      return `(${x} ? _pm::ser(${x}->val) : string("null"))`
    case 'RandomList':
      return `_pm::serRandom(${x})`
    case 'GraphNode':
      return `_pm::serGraph(${x})`
    case 'bool':
      return `_pm::ser((bool)(${x}))`
    case 'double':
      return `_pm::ser((double)(${x}))`
    default:
      return `_pm::ser(${x})`
  }
}

function allTypes(sig: Signature): ValueType[] {
  if (sig.kind === 'function') return [sig.returns, ...sig.params.map((p) => p.type)]
  if (sig.kind === 'class') return [...sig.ctorParams.map((p) => p.type), ...sig.methods.flatMap((m) => [m.returns, ...m.params.map((p) => p.type)])]
  return [sig.dataType]
}

export const CPP_LIST_NODE = `struct ListNode {
    int val;
    ListNode *next;
    ListNode() : val(0), next(nullptr) {}
    ListNode(int x) : val(x), next(nullptr) {}
    ListNode(int x, ListNode *next) : val(x), next(next) {}
};`

export const CPP_TREE_NODE = `struct TreeNode {
    int val;
    TreeNode *left;
    TreeNode *right;
    TreeNode() : val(0), left(nullptr), right(nullptr) {}
    TreeNode(int x) : val(x), left(nullptr), right(nullptr) {}
    TreeNode(int x, TreeNode *left, TreeNode *right) : val(x), left(left), right(right) {}
};`

export const CPP_RANDOM_NODE = `class Node {
public:
    int val;
    Node* next;
    Node* random;
    Node(int _val) : val(_val), next(nullptr), random(nullptr) {}
};`

export const CPP_GRAPH_NODE = `class Node {
public:
    int val;
    vector<Node*> neighbors;
    Node() : val(0) {}
    Node(int _val) : val(_val) {}
    Node(int _val, vector<Node*> _neighbors) : val(_val), neighbors(_neighbors) {}
};`

export function cppFlags(sig: Signature) {
  const ts = allTypes(sig)
  return {
    list: ts.some((t) => t === 'ListNode' || t === 'ListNode[]' || t === 'CycleList'),
    tree: ts.some((t) => t === 'TreeNode' || t === 'TreeNodeRef'),
    random: ts.includes('RandomList'),
    graph: ts.includes('GraphNode'),
  }
}

export function cppDefinitions(sig: Signature): string {
  const f = cppFlags(sig)
  return [f.list && CPP_LIST_NODE, f.tree && CPP_TREE_NODE, f.random && CPP_RANDOM_NODE, f.graph && CPP_GRAPH_NODE].filter(Boolean).join('\n\n')
}

function harnessLib(f: ReturnType<typeof cppFlags>): string {
  return `
namespace _pm {
inline string esc(const string& s) {
    string o = "\\"";
    for (unsigned char c : s) {
        switch (c) {
            case '"': o += "\\\\\\""; break;
            case '\\\\': o += "\\\\\\\\"; break;
            case '\\n': o += "\\\\n"; break;
            case '\\r': o += "\\\\r"; break;
            case '\\t': o += "\\\\t"; break;
            default:
                if (c < 0x20) { char b[8]; snprintf(b, sizeof b, "\\\\u%04x", c); o += b; }
                else o += (char)c;
        }
    }
    return o + "\\"";
}
inline string ser(const string& s) { return esc(s); }
inline string ser(const char* s) { return esc(string(s)); }
inline string ser(char c) { return esc(string(1, c)); }
inline string ser(bool b) { return b ? "true" : "false"; }
template <class T, typename enable_if<is_integral<T>::value && !is_same<T, bool>::value && !is_same<T, char>::value, int>::type = 0>
string ser(T v) { return to_string(v); }
template <class T, typename enable_if<is_floating_point<T>::value, int>::type = 0>
string ser(T v) {
    if (!isfinite((double)v)) return esc(isnan((double)v) ? "nan" : (v > 0 ? "inf" : "-inf"));
    ostringstream o; o << setprecision(12) << (double)v; return o.str();
}
${f.list ? 'string ser(ListNode* h);' : ''}
${f.tree ? 'string ser(TreeNode* r);' : ''}
inline string ser(const vector<bool>& v);
template <class T> string ser(const vector<T>& v);
template <class A, class B> string ser(const pair<A, B>& p);
template <class T> string ser(const vector<T>& v) {
    string s = "[";
    for (size_t i = 0; i < v.size(); ++i) { if (i) s += ","; s += ser(v[i]); }
    return s + "]";
}
inline string ser(const vector<bool>& v) {
    string s = "[";
    for (size_t i = 0; i < v.size(); ++i) { if (i) s += ","; s += v[i] ? "true" : "false"; }
    return s + "]";
}
template <class A, class B> string ser(const pair<A, B>& p) { return "[" + ser(p.first) + "," + ser(p.second) + "]"; }
${
  f.list
    ? `
ListNode* mkList(const vector<int>& v) {
    ListNode dummy; ListNode* cur = &dummy;
    for (int x : v) { cur->next = new ListNode(x); cur = cur->next; }
    return dummy.next;
}
ListNode* mkCycle(const vector<int>& v, int pos) {
    ListNode* h = mkList(v);
    if (pos >= 0 && h) {
        ListNode* tail = h; ListNode* at = nullptr; int i = 0;
        for (ListNode* c = h; c; c = c->next, ++i) { if (i == pos) at = c; tail = c; }
        tail->next = at;
    }
    return h;
}
string ser(ListNode* h) {
    string s = "["; unordered_set<ListNode*> seen; bool first = true;
    while (h) {
        if (seen.count(h) || seen.size() > 100000) { s += ",\\"...cycle\\""; break; }
        seen.insert(h);
        if (!first) s += ",";
        first = false; s += to_string(h->val); h = h->next;
    }
    return s + "]";
}`
    : ''
}
${
  f.tree
    ? `
TreeNode* mkTree(const vector<optional<int>>& v) {
    if (v.empty() || !v[0]) return nullptr;
    TreeNode* root = new TreeNode(*v[0]);
    queue<TreeNode*> q; q.push(root); size_t i = 1;
    while (!q.empty() && i < v.size()) {
        TreeNode* n = q.front(); q.pop();
        if (i < v.size() && v[i]) { n->left = new TreeNode(*v[i]); q.push(n->left); }
        ++i;
        if (i < v.size() && v[i]) { n->right = new TreeNode(*v[i]); q.push(n->right); }
        ++i;
    }
    return root;
}
TreeNode* findNode(TreeNode* r, int val) {
    if (!r) return nullptr;
    if (r->val == val) return r;
    TreeNode* l = findNode(r->left, val);
    return l ? l : findNode(r->right, val);
}
string ser(TreeNode* r) {
    vector<string> out; queue<TreeNode*> q; q.push(r);
    if (!r) return "[]";
    while (!q.empty() && out.size() < 200000) {
        TreeNode* n = q.front(); q.pop();
        if (!n) { out.push_back("null"); continue; }
        out.push_back(to_string(n->val)); q.push(n->left); q.push(n->right);
    }
    while (!out.empty() && out.back() == "null") out.pop_back();
    string s = "[";
    for (size_t i = 0; i < out.size(); ++i) { if (i) s += ","; s += out[i]; }
    return s + "]";
}`
    : ''
}
${
  f.random
    ? `
Node* mkRandom(const vector<pair<int, int>>& v) {
    vector<Node*> ns;
    for (auto& p : v) ns.push_back(new Node(p.first));
    for (size_t i = 0; i + 1 < ns.size(); ++i) ns[i]->next = ns[i + 1];
    for (size_t i = 0; i < v.size(); ++i) if (v[i].second >= 0) ns[i]->random = ns[v[i].second];
    return ns.empty() ? nullptr : ns[0];
}
string serRandom(Node* h) {
    vector<Node*> ns; unordered_map<Node*, int> idx;
    for (Node* c = h; c && ns.size() <= 100000; c = c->next) { idx[c] = (int)ns.size(); ns.push_back(c); }
    string s = "[";
    for (size_t i = 0; i < ns.size(); ++i) {
        if (i) s += ",";
        s += "[" + to_string(ns[i]->val) + ",";
        s += ns[i]->random && idx.count(ns[i]->random) ? to_string(idx[ns[i]->random]) : string("null");
        s += "]";
    }
    return s + "]";
}`
    : ''
}
${
  f.graph
    ? `
Node* mkGraph(const vector<vector<int>>& adj) {
    if (adj.empty()) return nullptr;
    vector<Node*> ns;
    for (size_t i = 0; i < adj.size(); ++i) ns.push_back(new Node((int)i + 1));
    for (size_t i = 0; i < adj.size(); ++i) for (int j : adj[i]) ns[i]->neighbors.push_back(ns[j - 1]);
    return ns[0];
}
string serGraph(Node* s0) {
    if (!s0) return "[]";
    unordered_set<Node*> seen{s0}; queue<Node*> q; q.push(s0); vector<Node*> all;
    while (!q.empty()) {
        Node* n = q.front(); q.pop(); all.push_back(n);
        for (Node* nb : n->neighbors) if (!seen.count(nb)) { seen.insert(nb); q.push(nb); }
    }
    sort(all.begin(), all.end(), [](Node* a, Node* b) { return a->val < b->val; });
    string s = "[";
    for (size_t i = 0; i < all.size(); ++i) {
        if (i) s += ",";
        s += "[";
        for (size_t j = 0; j < all[i]->neighbors.size(); ++j) { if (j) s += ","; s += to_string(all[i]->neighbors[j]->val); }
        s += "]";
    }
    return s + "]";
}`
    : ''
}
struct Capture {
    ostringstream ss; streambuf* old; bool on = true;
    Capture() : old(cout.rdbuf(ss.rdbuf())) {}
    string done() { if (on) { cout.rdbuf(old); on = false; } return ss.str(); }
    ~Capture() { done(); }
};
void emit(int i, bool ok, const string& out, const string& err, string so, double ms) {
    if (so.size() > 5000) so = so.substr(0, 5000) + "\\n...[output truncated]";
    cout << "${RESULT_MARKER}{\\"i\\":" << i << ",\\"ok\\":" << (ok ? "true" : "false")
         << ",\\"out\\":" << (ok ? out : string("null")) << ",\\"err\\":" << esc(err)
         << ",\\"stdout\\":" << esc(so) << ",\\"ms\\":" << ms << "}" << endl;
}
}  // namespace _pm
`
}

function declArgs(params: Param[], args: unknown[], prefix: string, outerRoot?: string): { decls: string; names: string[] } {
  let root = outerRoot
  const lines: string[] = []
  const names: string[] = []
  params.forEach((p, k) => {
    const name = `${prefix}${k}`
    lines.push(`${cppType(p.type)} ${name} = ${cppLiteral(p.type, args[k], root)};`)
    if (p.type === 'TreeNode' && !root) root = name
    names.push(name)
  })
  return { decls: lines.join(' '), names }
}

const TIMER_START = 'auto _t0 = chrono::steady_clock::now();'
const TIMER_END = '_ms = chrono::duration<double, milli>(chrono::steady_clock::now() - _t0).count();'

function wrapTest(i: number, body: string): string {
  return `    {
        _pm::Capture _cap; string _out, _err; bool _ok = false; double _ms = 0;
        try {
${body}
            _ok = true;
        } catch (const exception& _e) { _err = string("Exception: ") + _e.what(); }
        catch (...) { _err = "Unknown exception thrown"; }
        string _so = _cap.done();
        _pm::emit(${i}, _ok, _out, _err, _so, _ms);
    }`
}

function functionTest(sig: Extract<Signature, { kind: 'function' }>, tc: TestCase, i: number): string {
  const { decls, names } = declArgs(sig.params, tc.args, 'a')
  const call = `_sol.${sig.name}(${names.join(', ')})`
  let body: string
  if (sig.inPlace !== undefined) {
    body = `${call}; ${TIMER_END} _out = ${serExpr(sig.params[sig.inPlace].type, names[sig.inPlace])};`
  } else if (sig.returns === 'void') {
    body = `${call}; ${TIMER_END} _out = "null";`
  } else {
    body = `auto _r = ${call}; ${TIMER_END} _out = ${serExpr(sig.returns, '_r')};`
  }
  return wrapTest(i, `            ${decls}\n            Solution _sol; ${TIMER_START}\n            ${body}`)
}

function classTest(sig: Extract<Signature, { kind: 'class' }>, tc: TestCase, i: number): string {
  const ops = tc.ops ?? []
  const lines: string[] = [`${sig.className}* _obj = nullptr; vector<string> _o; ${TIMER_START}`]
  ops.forEach((op, k) => {
    const a = (tc.args[k] as unknown[]) ?? []
    if (k === 0) {
      const { decls, names } = declArgs(sig.ctorParams, a, 'c')
      lines.push(`{ ${decls} _obj = new ${sig.className}(${names.join(', ')}); _o.push_back("null"); }`)
    } else {
      const m = sig.methods.find((mm) => mm.name === op)
      if (!m) throw new Error(`unknown method ${op} for ${sig.className}`)
      const { decls, names } = declArgs(m.params, a, 'p')
      const call = `_obj->${m.name}(${names.join(', ')})`
      if (m.returns === 'void') lines.push(`{ ${decls} ${call}; _o.push_back("null"); }`)
      else lines.push(`{ ${decls} auto _r = ${call}; _o.push_back(${serExpr(m.returns, '_r')}); }`)
    }
  })
  lines.push(TIMER_END)
  lines.push(`_out = "["; for (size_t _k = 0; _k < _o.size(); ++_k) { if (_k) _out += ","; _out += _o[_k]; } _out += "]";`)
  return wrapTest(i, lines.map((l) => '            ' + l).join('\n'))
}

function codecTest(sig: Extract<Signature, { kind: 'codec' }>, tc: TestCase, i: number): string {
  const body = `            ${cppType(sig.dataType)} a0 = ${cppLiteral(sig.dataType, tc.args[0])};
            ${sig.className} _c; ${TIMER_START}
            auto _enc = _c.${sig.encode}(a0);
            auto _r = _c.${sig.decode}(_enc);
            ${TIMER_END} _out = ${serExpr(sig.dataType, '_r')};`
  return wrapTest(i, body)
}

export function buildCppHarness(sig: Signature, tests: TestCase[], userCode: string): string {
  const f = cppFlags(sig)
  const testsCode = tests
    .map((tc, i) => (sig.kind === 'function' ? functionTest(sig, tc, i) : sig.kind === 'class' ? classTest(sig, tc, i) : codecTest(sig, tc, i)))
    .join('\n')
  return `#include <bits/stdc++.h>
using namespace std;
${cppDefinitions(sig)}
#line 1 "solution.cpp"
${userCode}
#line 1 "harness.cpp"
${harnessLib(f)}
int main() {
    ios::sync_with_stdio(true);
${testsCode}
    return 0;
}
`
}
