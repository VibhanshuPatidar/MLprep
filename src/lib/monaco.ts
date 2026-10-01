// Local (bundled) Monaco setup — no CDN needed. Only the languages we use are registered.
import * as monaco from 'monaco-editor/editor/editor.api'
import 'monaco-editor/features/register.all'
import 'monaco-editor/languages/definitions/python/register'
import 'monaco-editor/languages/definitions/cpp/register'
import 'monaco-editor/languages/definitions/sql/register'
import EditorWorker from 'monaco-editor/editor/editor.worker?worker'
import { loader } from '@monaco-editor/react'

declare global {
  interface Window {
    MonacoEnvironment?: { getWorker: (id: string, label: string) => Worker }
  }
}

window.MonacoEnvironment = { getWorker: () => new EditorWorker() }

monaco.editor.defineTheme('prep-dark', {
  base: 'vs-dark',
  inherit: true,
  rules: [
    { token: 'comment', foreground: '6b7280', fontStyle: 'italic' },
    { token: 'keyword', foreground: 'c4b5fd' },
    { token: 'string', foreground: '86efac' },
    { token: 'number', foreground: 'fcd34d' },
    { token: 'type', foreground: '7dd3fc' },
    { token: 'identifier', foreground: 'e4e4e7' },
    { token: 'delimiter', foreground: 'a1a1aa' },
  ],
  colors: {
    'editor.background': '#111114',
    'editor.foreground': '#e4e4e7',
    'editorLineNumber.foreground': '#3f3f46',
    'editorLineNumber.activeForeground': '#a1a1aa',
    'editor.lineHighlightBackground': '#18181c',
    'editor.lineHighlightBorder': '#00000000',
    'editor.selectionBackground': '#818cf833',
    'editorCursor.foreground': '#818cf8',
    'editorIndentGuide.background1': '#1f1f24',
    'editorIndentGuide.activeBackground1': '#3f3f46',
    'editorWidget.background': '#16161a',
    'editorWidget.border': '#27272a',
    'scrollbarSlider.background': '#3f3f4655',
    'scrollbarSlider.hoverBackground': '#52525b88',
  },
})

monaco.editor.defineTheme('prep-light', {
  base: 'vs',
  inherit: true,
  rules: [
    { token: 'comment', foreground: '9ca3af', fontStyle: 'italic' },
    { token: 'keyword', foreground: '7c3aed' },
    { token: 'string', foreground: '059669' },
    { token: 'number', foreground: 'b45309' },
    { token: 'type', foreground: '0369a1' },
  ],
  colors: {
    'editor.background': '#ffffff',
    'editorLineNumber.foreground': '#d4d4d8',
    'editorLineNumber.activeForeground': '#71717a',
    'editor.lineHighlightBackground': '#f8f8f9',
    'editor.lineHighlightBorder': '#00000000',
    'editor.selectionBackground': '#6366f126',
    'editorCursor.foreground': '#6366f1',
  },
})

loader.config({ monaco })

export { monaco }
