import { editor } from 'monaco-editor/esm/vs/editor/editor.api.js';
import { Dispatch, ReactNode, SetStateAction, createContext, useContext, useMemo, useState } from "react";
import { EditorStatus, EditorStatusType } from '../types/editorTypes';

type EditorsContextType = {
    grammarEditor?: editor.IStandaloneCodeEditor;
    modelEditor?: editor.IStandaloneCodeEditor;
    setModelEditor: Dispatch<SetStateAction<editor.IStandaloneCodeEditor | undefined>>;
    setGrammarEditor: Dispatch<SetStateAction<editor.IStandaloneCodeEditor | undefined>>;
    setEditorsTheme: (theme: 'vs' | 'vs-dark') => void;
    grammarStatus: EditorStatus | undefined;
    setGrammarStatus: Dispatch<SetStateAction<EditorStatus | undefined>>;
    modelStatus: EditorStatus | undefined;
    setModelStatus: Dispatch<SetStateAction<EditorStatus | undefined>>;
    editorsInitialized: boolean;
}

const EditorsContext = createContext<EditorsContextType>({} as EditorsContextType);

const useEditorsContext = () => {
    return useContext(EditorsContext);
}

const EditorsProvider = ({ children }: { children: ReactNode }) => {
    const [modelEditor, setModelEditor] = useState<editor.IStandaloneCodeEditor | undefined>();
    const [grammarEditor, setGrammarEditor] = useState<editor.IStandaloneCodeEditor | undefined>();

    const [grammarStatus, setGrammarStatus] = useState<EditorStatus | undefined>({ type: EditorStatusType.LOADING, message: "Starting textX langauge server..." });
    const [modelStatus, setModelStatus] = useState<EditorStatus | undefined>();

    const editorsInitialized = useMemo(() => !!grammarEditor && !!modelEditor, [grammarEditor, modelEditor]);

    const setEditorsTheme = (theme: 'vs' | 'vs-dark') => {
        editor.setTheme(theme);
    }

    return (
        <EditorsContext.Provider value={{ modelEditor, grammarEditor, setModelEditor, setGrammarEditor, setEditorsTheme, editorsInitialized, grammarStatus, setGrammarStatus, modelStatus, setModelStatus }}>
            {children}
        </EditorsContext.Provider>
    );
}

export {
    EditorsProvider, useEditorsContext
};
