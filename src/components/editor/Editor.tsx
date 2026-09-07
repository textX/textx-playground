import { editor } from 'monaco-editor/esm/vs/editor/editor.api.js';
import React, { useEffect, useRef } from 'react';
import { createEditor } from '../../utils/editorUtils';

export type EditorProps = {
  languageId: string;
  languageExtension: string;
  fileName: string;
  defaultCode: string;
  onInitialized?: (editorInstance: editor.IStandaloneCodeEditor) => void;
  className?: string;
}

const Editor: React.FC<EditorProps> = (
  {
    languageId,
    languageExtension,
    fileName,
    defaultCode,
    onInitialized,
    className,
  }) => {
  const editorRef = useRef<editor.IStandaloneCodeEditor>();
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (ref.current) {
      const monacoEditor = createEditor({
        languageId,
        languageExtension,
        fileName,
        htmlElement: ref.current,
        content: defaultCode,
      });
      editorRef.current = monacoEditor;
      onInitialized?.(monacoEditor);

      return () => {
        const model = monacoEditor.getModel();
        monacoEditor.dispose();
        model?.dispose();
        editorRef.current = undefined;
      };
    }
  }, []);

  return (
    <div
      ref={ref}
      className={className}
    />
  );

};

export default Editor;
