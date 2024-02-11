import { editor } from 'monaco-editor/esm/vs/editor/editor.api.js';
import { Dispatch, ReactNode, SetStateAction, createContext, useContext, useMemo, useState } from "react";

type EditorsContextType = {
    grammarEditor?: editor.IStandaloneCodeEditor;
    modelEditor?: editor.IStandaloneCodeEditor;
    setModelEditor: Dispatch<SetStateAction<editor.IStandaloneCodeEditor | undefined>>;
    setGrammarEditor: Dispatch<SetStateAction<editor.IStandaloneCodeEditor | undefined>>;
    setEditorsTheme: (theme: 'vs' | 'vs-dark') => void;
    editorsInitialized: boolean;
}

const EditorsContext = createContext<EditorsContextType>({} as EditorsContextType);

const useEditorsContext = () => {
    return useContext(EditorsContext);
}

const EditorsProvider = ({ children }: { children: ReactNode }) => {
    const [modelEditor, setModelEditor] = useState<editor.IStandaloneCodeEditor | undefined>();
    const [grammarEditor, setGrammarEditor] = useState<editor.IStandaloneCodeEditor | undefined>();

    const editorsInitialized = useMemo(() => !!grammarEditor && !!modelEditor, [grammarEditor, modelEditor]);

    const setEditorsTheme = (theme: 'vs' | 'vs-dark') => {
        editor.setTheme(theme);
    }

    return (
        <EditorsContext.Provider value={{ modelEditor, grammarEditor, setModelEditor, setGrammarEditor, setEditorsTheme, editorsInitialized }}>
            {children}
        </EditorsContext.Provider>
    );
}

export {
    EditorsProvider, useEditorsContext
};
