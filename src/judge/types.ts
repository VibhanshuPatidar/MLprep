/**
 * Judge type system shared by the browser app and the node validator.
 *
 * Value encodings used in test cases (JSON):
 *  - int/long/double/uint32/bool/string/char: plain JSON values (char = 1-length string)
 *  - X[] / X[][]: JSON arrays
 *  - ListNode: array of values, e.g. [1,2,3] ([] = null)
 *  - ListNode[]: array of arrays
 *  - CycleList: [values[], pos] where pos is the index the tail links to (-1 = no cycle)
 *  - TreeNode: LeetCode level-order array with nulls, e.g. [3,9,20,null,null,15,7]
 *  - TreeNodeRef: a node value; resolved to the node with that value inside the first TreeNode argument.
 *                 As a return type, the node's value is reported (or null).
 *  - RandomList: [[val, randomIndex|null], ...]
 *  - GraphNode: adjacency list (1-indexed node values), e.g. [[2,4],[1,3],[2,4],[1,3]]
 */
export type ValueType =
  | 'int'
  | 'long'
  | 'double'
  | 'uint32'
  | 'bool'
  | 'string'
  | 'char'
  | 'int[]'
  | 'long[]'
  | 'double[]'
  | 'bool[]'
  | 'string[]'
  | 'char[]'
  | 'int[][]'
  | 'double[][]'
  | 'bool[][]'
  | 'string[][]'
  | 'char[][]'
  | 'ListNode'
  | 'ListNode[]'
  | 'CycleList'
  | 'TreeNode'
  | 'TreeNodeRef'
  | 'RandomList'
  | 'GraphNode'
  | 'void'

export interface Param {
  name: string
  type: ValueType
}

export interface FunctionSignature {
  kind: 'function'
  /** method name on class Solution, e.g. "twoSum" */
  name: string
  params: Param[]
  returns: ValueType
  /** For in-place problems (returns void): judge the value of params[inPlace] after the call. */
  inPlace?: number
}

export interface MethodSignature {
  name: string
  params: Param[]
  returns: ValueType
}

export interface ClassSignature {
  kind: 'class'
  className: string
  ctorParams: Param[]
  methods: MethodSignature[]
}

/** Round-trip problems (encode/decode, serialize/deserialize). Judged on decode(encode(x)) == x */
export interface CodecSignature {
  kind: 'codec'
  className: string
  encode: string
  decode: string
  dataType: ValueType
}

export type Signature = FunctionSignature | ClassSignature | CodecSignature

export interface TestCase {
  /** function: positional args. class: list of arg lists (one per op). codec: [value] */
  args: unknown[]
  /** class problems only: op names; ops[0] is the constructor (className) */
  ops?: string[]
  /** expected output. class: array of per-op outputs (null for ctor/void). anyOf checker: array of acceptable outputs */
  expected: unknown
}

/**
 * exact          - deep equality (numbers compared with 1e-5 tolerance)
 * unordered      - outer array order ignored
 * unorderedDeep  - order ignored at outer AND inner level (e.g. 3Sum, Group Anagrams, Subsets)
 * anyOf          - expected is a list of acceptable answers
 * topoOrder      - args = [n, edges[[a,b]] meaning b before a]; any valid order accepted, [] if impossible
 * alienOrder     - args = [words]; any order consistent with words accepted; "" if invalid
 */
export type CompareMode = 'exact' | 'unordered' | 'unorderedDeep' | 'anyOf' | 'topoOrder' | 'alienOrder'

export type Language = 'python' | 'cpp'

export interface TestResult {
  index: number
  status: 'passed' | 'failed' | 'error' | 'timeout' | 'skipped'
  output?: unknown
  expected?: unknown
  args?: unknown[]
  ops?: string[]
  stdout?: string
  error?: string
  ms?: number
}

export interface RunResult {
  status: 'accepted' | 'wrong' | 'compile_error' | 'runtime_error' | 'timeout' | 'internal_error'
  results: TestResult[]
  compileError?: string
  stderr?: string
  message?: string
  totalMs?: number
}

/** Raw per-test record emitted by generated harnesses on stdout, prefixed by RESULT_MARKER */
export interface RawRecord {
  i: number
  ok: boolean
  out?: unknown
  err?: string
  stdout?: string
  ms?: number
}

export const RESULT_MARKER = '@@PREPML_RESULT@@'
