import LZString from 'lz-string';
import { useCallback, useEffect, useRef, useState } from "react";
import Editor from "../components/editor/Editor";
import EditorStatusBar from "../components/editor/EditorStatusBar";
import ShareEditorsContent from "../components/editor/ShareEditorsContent";
import Spinner from "../components/common/Spinner";
import { EditorStatus, EditorStatusType } from "../types/editorTypes";
import { useEditorsContext } from "../utils/editorContext";
import { GRAMMAR_FILE_URI, initEditorServices, setSyntaxHighlighting, setupTextXLanguageClient } from "../utils/editorUtils";

const editorContainerClassNames = "flex flex-col flex-1 border border-gray-100 dark:border-gray-800";
const editorTitleClassNames = "flex flex-shrink-0 justify-center items-center h-[40px] bg-gray-300 dark:bg-gray-700 font-semibold";

function Playground() {
    const [editorServicesInitialized, setEditorServicesInitialized] = useState(false);
    const [textXInitialized, setTextXInitialized] = useState(false);
    const { setModelEditor, setGrammarEditor, modelEditor, grammarEditor } = useEditorsContext();

    const [grammarStatus, setGrammarStatus] = useState<EditorStatus | undefined>({ type: EditorStatusType.LOADING, message: "Starting textX langauge server..." });
    const [modelStatus, setModelStatus] = useState<EditorStatus | undefined>();

    const textxWorkerRef = useRef<Worker>();

    const searchParams = new URLSearchParams(window.location.search);
    const grammarParam = searchParams.get('grammar');
    const modelParam = searchParams.get('model');

    useEffect(() => {
        initEditors();
    }, []);

    const initEditors = useCallback(async () => {
        await initEditorServices();
        setEditorServicesInitialized(true);
        initTextXWorker();
    }, []);


    const initTextXWorker = useCallback(async () => {
        const { worker, startedCallback } = await setupTextXLanguageClient();
        textxWorkerRef.current = worker;
        textxWorkerRef.current.addEventListener("message", (event) => {
            if (event.data?.type === 'textx-worker-started') {
                startedCallback();
                setTextXInitialized(true);
                setGrammarStatus(undefined);
                textxWorkerRef.current?.postMessage({
                    type: "parse-grammar",
                    languageId: 'textx',
                });
            }
            if (event.data?.type === 'grammar-parsed') {
                setSyntaxHighlighting(event.data.languageId, JSON.parse(event.data.grammarInfo));
            }
            if (event.data?.method === "textDocument/publishDiagnostics") {
                updateEditorStatuses(event.data.params);
            }
        });
    }, []);

    const updateEditorStatuses = useCallback((diagnosticsParams: any) => {
        const { uri, diagnostics } = diagnosticsParams;
        const diagnostic = diagnostics?.[0];
        if (uri === GRAMMAR_FILE_URI) {
            if (diagnostic) {
                const isError = diagnostic.severity === 1;
                const { message } = diagnostic;
                setGrammarStatus({ 
                    type: isError ? EditorStatusType.ERROR: EditorStatusType.INFO,
                    message: message 
                });
            } else {
                setGrammarStatus(undefined);
            }
        } else {
            if (diagnostic) {
                const isError = diagnostic.severity === 1;
                const { message, range } = diagnostic;
                setModelStatus({ 
                    type: isError ? EditorStatusType.ERROR: EditorStatusType.INFO,
                    position: [range.start.line, range.start.character],
                    message: message 
                });
            } else {
                setModelStatus(undefined);
            }
        }
    }, []);

    useEffect(() => {
        if (!textXInitialized) return;

        if (!grammarStatus && grammarEditor?.getValue() !== "") {
            setGrammarStatus({ 
                type: EditorStatusType.SUCCESS,
                message: "Grammar is valid"
            });
            textxWorkerRef.current?.postMessage({
                type: "parse-grammar",
                languageId: 'demo',
                grammar: grammarEditor?.getValue()
            });
        }
        
        if (!modelStatus && modelEditor?.getValue() !== "" && grammarStatus?.type === EditorStatusType.SUCCESS) {
            setModelStatus({ 
                type: EditorStatusType.SUCCESS,
                message: "Model is valid"
            })
        }
    }, [grammarStatus, modelStatus, modelEditor, grammarEditor, textXInitialized]);

    return (
        <div className="flex flex-row flex-1 w-full h-full relative">
            <div className={editorContainerClassNames}>
                <div className={editorTitleClassNames}>Language Grammar</div>
                <div className="flex flex-col flex-1">
                    {editorServicesInitialized ? (
                        <>
                            <Editor
                                languageId={'textx'}
                                languageExtension={'tx'}
                                fileName={'grammar'}
                                defaultCode={grammarParam ? LZString.decompressFromEncodedURIComponent(grammarParam) : ''}
                                onInitialized={(editor) => setGrammarEditor(editor)}
                                className={'flex flex-1 shadow-inner'}
                            />
                            <EditorStatusBar status={grammarStatus} />
                        </>
                    ) : (
                        <div className="flex flex-1 items-center justify-center">
                            <Spinner />
                        </div>
                    )}
                </div>
            </div>
            <div className={editorContainerClassNames}>
                <div className={editorTitleClassNames}>Model</div>
                <div className="flex flex-col flex-1">
                    {editorServicesInitialized ? (
                        <>
                            <Editor
                                languageId={'demo'}
                                languageExtension={'demo'}
                                fileName={'model'}
                                defaultCode={modelParam ? LZString.decompressFromEncodedURIComponent(modelParam) : ''}
                                onInitialized={(editor) => setModelEditor(editor)}
                                className={'flex flex-1 shadow-inner'}
                            />
                            <EditorStatusBar status={modelStatus} />
                        </>
                    ) : (
                        <div className="flex flex-1 items-center justify-center">
                            <Spinner />
                        </div>
                    )}
                </div>
            </div>
            <div className="absolute top-0 right-0 px-5 py-3">
                <ShareEditorsContent />
            </div>
        </div>
    )
}

export default Playground;