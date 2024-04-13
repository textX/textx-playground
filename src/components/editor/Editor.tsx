import { editor } from 'monaco-editor/esm/vs/editor/editor.api.js';
import React, { createRef, useEffect, useRef } from 'react';
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
  const ref = createRef<HTMLDivElement>();

  useEffect(() => {
    const currentEditor = editorRef.current;

    if (ref.current) {
      const start = async () => {
        const monacoEditor = await createEditor({
          languageId,
          languageExtension,
          fileName,
          htmlElement: ref.current!,
          content: defaultCode,
        });
        // @ts-ignore
        onInitialized?.(monacoEditor);
      };
      start();

      return () => {
        currentEditor?.dispose();
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
