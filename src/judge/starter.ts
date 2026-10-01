import type { Language, Signature, ValueType } from './types'
import { cppDefinitions, cppParamDecl, cppType } from './cpp'
import { pyDefinitions } from './python'

export function pyType(t: ValueType): string {
  switch (t) {
    case 'int':
    case 'long':
    case 'uint32':
      return 'int'
    case 'double':
      return 'float'
    case 'bool':
      return 'bool'
    case 'string':
    case 'char':
      return 'str'
    case 'ListNode':
    case 'CycleList':
      return 'Optional[ListNode]'
    case 'ListNode[]':
      return 'List[Optional[ListNode]]'
    case 'TreeNode':
      return 'Optional[TreeNode]'
    case 'TreeNodeRef':
      return "'TreeNode'"
    case 'RandomList':
    case 'GraphNode':
      return "Optional['Node']"
    case 'void':
      return 'None'
    default: {
      // arrays
      const base = t.replace(/\[\]/g, '') as ValueType
      const depth = (t.match(/\[\]/g) ?? []).length
      let s = pyType(base)
      for (let i = 0; i < depth; i++) s = `List[${s}]`
      return s
    }
  }
}

const comment = (code: string, prefix: string) =>
  code
    .split('\n')
    .map((l) => `${prefix}${l}`)
    .join('\n')

export function starterCode(sig: Signature, lang: Language): string {
  if (lang === 'python') {
    const lines = pyDefinitions(sig).trim().split('\n')
    const kept = lines.filter((l, i) => !l.includes('__repr__') && !(i > 0 && lines[i - 1].includes('__repr__')))
    const defs = kept.join('\n').trim()
    const header = defs ? `# Definitions provided by the judge:\n${comment(defs, '# ')}\n\n` : ''
    const params = (ps: { name: string; type: ValueType }[]) => ['self', ...ps.map((p) => `${p.name}: ${pyType(p.type)}`)].join(', ')
    if (sig.kind === 'function') {
      return `${header}class Solution:\n    def ${sig.name}(${params(sig.params)}) -> ${pyType(sig.returns)}:\n        pass\n`
    }
    if (sig.kind === 'class') {
      const methods = sig.methods.map((m) => `    def ${m.name}(${params(m.params)}) -> ${pyType(m.returns)}:\n        pass\n`)
      return `${header}class ${sig.className}:\n\n    def __init__(${params(sig.ctorParams)}):\n        pass\n\n${methods.join('\n')}`
    }
    const dt = pyType(sig.dataType)
    return `${header}class ${sig.className}:\n\n    def ${sig.encode}(self, data: ${dt}) -> str:\n        pass\n\n    def ${sig.decode}(self, s: str) -> ${dt}:\n        pass\n`
  }

  const defs = cppDefinitions(sig).trim()
  const header = defs ? `/**\n * Definitions provided by the judge:\n${comment(defs, ' * ')}\n */\n` : ''
  if (sig.kind === 'function') {
    return `${header}class Solution {\npublic:\n    ${cppType(sig.returns)} ${sig.name}(${sig.params.map(cppParamDecl).join(', ')}) {\n        \n    }\n};\n`
  }
  if (sig.kind === 'class') {
    const methods = sig.methods.map((m) => `    ${cppType(m.returns)} ${m.name}(${m.params.map(cppParamDecl).join(', ')}) {\n        \n    }\n`)
    return `${header}class ${sig.className} {\npublic:\n    ${sig.className}(${sig.ctorParams.map(cppParamDecl).join(', ')}) {\n        \n    }\n\n${methods.join('\n')}};\n`
  }
  const dt = cppType(sig.dataType)
  const dataDecl = dt.startsWith('vector') ? `${dt}& data` : `${dt} data`
  return `${header}class ${sig.className} {\npublic:\n    string ${sig.encode}(${dataDecl}) {\n        \n    }\n\n    ${dt} ${sig.decode}(string s) {\n        \n    }\n};\n`
}

/** Human readable signature line, used in problem descriptions */
export function signatureLabel(sig: Signature): string {
  if (sig.kind === 'function') return `${sig.name}(${sig.params.map((p) => `${p.name}: ${p.type}`).join(', ')}) → ${sig.returns}`
  if (sig.kind === 'class') return `class ${sig.className}: ${sig.methods.map((m) => m.name).join(', ')}`
  return `class ${sig.className}: ${sig.encode} / ${sig.decode}`
}
