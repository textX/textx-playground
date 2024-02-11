import { useCallback, useEffect, useState } from "react";
import LZString from 'lz-string';
import Editor from "../components/Editor";
import Spinner from "../components/Spinner";
import { useEditorsContext } from "../utils/editorContext";
import { initEditorServices, setupTextXLanguageClient } from "../utils/editorUtils";
import { createDefaultGrammarContent, createDefaultModelContent } from "../utils/tempUtils";
import ShareEditorsContent from "../components/ShareEditorsContent";

const editorContainerClassNames = "flex flex-col flex-1 border border-gray-100 dark:border-gray-800";
const editorTitleClassNames = "flex flex-shrink-0 justify-center items-center h-[40px] bg-gray-300 dark:bg-gray-700 font-semibold";
const statusBarClassNames = "flex flex-shrink-0 px-4 py-1 border-t border-gray-100 dark:border-gray-800 text-sm font-semibold";

function Playground() {
    const [editorServicesInitialized, setEditorServicesInitialized] = useState(false);
    const [textXInitialized, setTextXInitialized] = useState(false);
    const { setModelEditor, setGrammarEditor } = useEditorsContext();

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
        worker.onmessage = (event) => {
            if (event.data === 'textx-worker-started') {
                startedCallback();
                setTextXInitialized(true);
            }
        }
    }, []);

    const getGrammarStatus = () => {
        let content;
        if (!textXInitialized) {
            content = (
                <>
                    <Spinner size="sm" />
                    <span>Initializing TextX server...</span>
                </>
            );
        } else {
            content = <span>...</span>;
        }
        return (
            <div className="flex flex-row items-center space-x-2">
                {content}
            </div>
        );
    }

    const getModelStatus = () => {
        return (
            <div className="flex flex-row items-center space-x-2">
                <span>...</span>
            </div>
        );
    }

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
                                defaultCode={grammarParam ? LZString.decompressFromEncodedURIComponent(grammarParam) : createDefaultGrammarContent()}
                                onInitialized={(editor) => setGrammarEditor(editor)}
                                className={'flex flex-1 shadow-inner'}
                            />
                            <div className={statusBarClassNames}>
                                {getGrammarStatus()}
                            </div>
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
                                defaultCode={modelParam ? LZString.decompressFromEncodedURIComponent(modelParam) : createDefaultModelContent()}
                                onInitialized={(editor) => setModelEditor(editor)}
                                className={'flex flex-1 shadow-inner'}
                            />
                            <div className={statusBarClassNames}>
                                {getModelStatus()}
                            </div>
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