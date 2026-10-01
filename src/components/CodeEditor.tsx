import Editor, { type OnMount } from '@monaco-editor/react'
import { useEffect, useRef } from 'react'
import '../lib/monaco'
import { monaco } from '../lib/monaco'
import { useStore } from '../store/progress'

export interface CodeEditorProps {
  value: string
  onChange?: (v: string) => void
  language: 'python' | 'cpp' | 'sql'
  readOnly?: boolean
  height?: string | number
  onRun?: () => void
  onSubmit?: () => void
  minimal?: boolean
}

export default function CodeEditor({ value, onChange, language, readOnly, height = '100%', onRun, onSubmit, minimal }: CodeEditorProps) {
  const settings = useStore((s) => s.settings)
  const runRef = useRef(onRun)
  const submitRef = useRef(onSubmit)
  runRef.current = onRun
  submitRef.current = onSubmit

  const onMount: OnMount = (editor) => {
    editor.addCommand(monaco.KeyMod.CtrlCmd | monaco.KeyCode.Quote, () => runRef.current?.())
    editor.addCommand(monaco.KeyMod.CtrlCmd | monaco.KeyCode.Enter, () => submitRef.current?.())
  }

  useEffect(() => {
    monaco.editor.setTheme(settings.theme === 'dark' ? 'prep-dark' : 'prep-light')
  }, [settings.theme])

  return (
    <Editor
      height={height}
      language={language}
      value={value}
      theme={settings.theme === 'dark' ? 'prep-dark' : 'prep-light'}
      onChange={(v) => onChange?.(v ?? '')}
      onMount={onMount}
      loading={<div className="p-4 text-sm text-muted">Loading editor…</div>}
      options={{
        readOnly,
        fontSize: settings.fontSize,
        fontFamily: "'JetBrains Mono', ui-monospace, Menlo, monospace",
        fontLigatures: true,
        minimap: { enabled: !minimal && settings.minimap },
        wordWrap: settings.wordWrap ? 'on' : 'off',
        scrollBeyondLastLine: false,
        tabSize: language === 'python' ? 4 : 4,
        insertSpaces: true,
        automaticLayout: true,
        padding: { top: 12, bottom: 12 },
        lineNumbersMinChars: 3,
        renderLineHighlight: 'all',
        smoothScrolling: true,
        cursorSmoothCaretAnimation: 'on',
        bracketPairColorization: { enabled: true },
        guides: { indentation: true, bracketPairs: false },
        scrollbar: { verticalScrollbarSize: 8, horizontalScrollbarSize: 8 },
        overviewRulerBorder: false,
        stickyScroll: { enabled: false },
        lineNumbers: minimal ? 'off' : 'on',
        folding: !minimal,
        glyphMargin: false,
        domReadOnly: readOnly,
      }}
    />
  )
}
