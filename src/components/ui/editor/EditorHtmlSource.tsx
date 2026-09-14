'use client';

import { useMemo } from 'react';
import CodeMirror from '@uiw/react-codemirror';
import { html } from '@codemirror/lang-html';
import { EditorView } from '@codemirror/view';
import { githubLight } from '@uiw/codemirror-theme-github';

import { cn } from '@/utils/classNames';

interface EditorHtmlSourceProps {
  value: string;
  onChange: (value: string) => void;
  disabled?: boolean;
  className?: string;
}

const editorTheme = EditorView.theme({
  '&': {
    height: '100%',
    backgroundColor: '#ffffff',
  },
  '&.cm-focused': {
    outline: 'none',
  },
  '.cm-scroller': {
    fontFamily: 'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace',
    lineHeight: '1.625',
  },
  '.cm-gutters': {
    backgroundColor: 'rgb(0 0 0 / 0.03)',
    borderRight: '1px solid rgb(0 0 0 / 0.08)',
  },
});

export default function EditorHtmlSource({
  value,
  onChange,
  disabled = false,
  className,
}: EditorHtmlSourceProps) {
  const extensions = useMemo(
    () => [html(), EditorView.lineWrapping, editorTheme, EditorView.editable.of(!disabled)],
    [disabled],
  );

  return (
    <div
      className={cn('flex min-h-0 flex-1 flex-col overflow-y-auto scrollbar bg-white', className)}
      aria-label="HTML source editor"
    >
      <CodeMirror
        value={value}
        height="100%"
        theme={githubLight}
        extensions={extensions}
        onChange={onChange}
        editable={!disabled}
        basicSetup={{
          lineNumbers: true,
          foldGutter: true,
          highlightActiveLine: true,
          autocompletion: false,
        }}
        className="h-full min-h-0 flex-1 [&_.cm-editor]:h-full [&_.cm-editor]:outline-none [&_.cm-scroller]:min-h-0"
      />
    </div>
  );
}
