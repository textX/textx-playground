import LZString from 'lz-string';
import { useCallback, useEffect, useState } from "react";
import Spinner from "../components/common/Spinner";
import Editor from "../components/editor/Editor";
import EditorStatusBar from "../components/editor/EditorStatusBar";
import ShareEditorsContent from "../components/editor/ShareEditorsContent";
import VisualizeContent from '../components/editor/VisualizeContent';
import { EditorStatusType } from "../types/editorTypes";
import { useEditorsContext } from "../context/editorContext";
import { GRAMMAR_FILE_URI, initEditorServices, setSyntaxHighlighting, setupTextXLanguageClient } from "../utils/editorUtils";
import { useTextxWorkerContext } from '../context/textxWorkerContext';
import { instance } from "@viz-js/viz";
import Modal from '../components/common/Modal';
import { XMarkIcon } from '@heroicons/react/24/outline';

const editorContainerClassNames = "flex flex-col flex-1 border border-gray-100 dark:border-gray-800";
const editorTitleClassNames = "flex flex-shrink-0 justify-between items-center h-[40px] bg-gray-300 dark:bg-gray-700 font-semibold px-3";

const visualizationCanvasElementId = 'visualization-canvas';

function Playground() {
    const [editorServicesInitialized, setEditorServicesInitialized] = useState(false);
    const [textXInitialized, setTextXInitialized] = useState(false);
    const { setModelEditor, setGrammarEditor, modelEditor, grammarEditor, grammarStatus, setGrammarStatus, modelStatus, setModelStatus } = useEditorsContext();
    const [visulizationGraph, setVisualizationGraph] = useState<SVGSVGElement>();

    const { textxWorkerRef } = useTextxWorkerContext();

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
            if (event.data?.type === 'grammar-visualized') {
                instance().then(viz => {
                    const vizGraph = viz.renderSVGElement(event.data?.data);
                    setVisualizationGraph(vizGraph);
                });
            }
            if (event.data?.type === 'model-visualized') {
                instance().then(viz => {
                    const vizGraph = viz.renderSVGElement(event.data?.data);
                    setVisualizationGraph(vizGraph);
                });
            }
        });
    }, []);

    useEffect(() => {
        if (visulizationGraph) {
            setTimeout(() => {
                document.getElementById(visualizationCanvasElementId)?.appendChild(visulizationGraph);
            }, 10);
        }
    }, [visulizationGraph]);

    const updateEditorStatuses = useCallback((diagnosticsParams: any) => {
        const { uri, diagnostics } = diagnosticsParams;
        const diagnostic = diagnostics?.[0];
        if (uri === GRAMMAR_FILE_URI) {
            if (diagnostic) {
                const isError = diagnostic.severity === 1;
                const { message } = diagnostic;
                setGrammarStatus({
                    type: isError ? EditorStatusType.ERROR : EditorStatusType.INFO,
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
                    type: isError ? EditorStatusType.ERROR : EditorStatusType.INFO,
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

    const grammarCode = grammarParam ? LZString.decompressFromEncodedURIComponent(grammarParam) : '';
    const modelCode = modelParam ? LZString.decompressFromEncodedURIComponent(modelParam) : '';

    return (
        <div className="flex flex-row flex-1 w-full h-full relative">
            <div className={editorContainerClassNames}>
                <div className={editorTitleClassNames}>
                    <span />
                    <span>Language Grammar</span>
                    <VisualizeContent type="grammar" />
                </div>
                <div className="flex flex-col flex-1">
                    {editorServicesInitialized ? (
                        <>
                            <Editor
                                languageId={'textx'}
                                languageExtension={'tx'}
                                fileName={'grammar'}
                                defaultCode={grammarCode}
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
                <div className={editorTitleClassNames}>
                    <span />
                    <span>Model (Program)</span>
                    <VisualizeContent type="model" />
                </div>
                <div className="flex flex-col flex-1">
                    {editorServicesInitialized ? (
                        <>
                            <Editor
                                languageId={'demo'}
                                languageExtension={'demo'}
                                fileName={'model'}
                                defaultCode={modelCode}
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
            <div className="absolute bottom-14 right-10 z-10">
                <ShareEditorsContent />
            </div>
            <Modal
                open={!!visulizationGraph}
                onClose={() => setVisualizationGraph(undefined)}
                className='p-5'
            >
                <button onClick={() => setVisualizationGraph(undefined)}>
                    <XMarkIcon className="absolute top-5 right-5 w-6 h-6 stroke-2 stroke-gray-800" />
                </button>
                <div id={visualizationCanvasElementId} className='flex justify-center overflow-auto' />
            </Modal>
        </div>
    )
}

export default Playground;