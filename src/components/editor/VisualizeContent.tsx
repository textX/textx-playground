import { PhotoIcon } from "@heroicons/react/24/outline";
import Tooltip from "../common/Tooltip";
import { useEditorsContext } from "../../context/editorContext";
import { useTextxWorkerContext } from "../../context/textxWorkerContext";
import { EditorStatusType } from "../../types/editorTypes";
import cn from "../../utils/cn";

type Props = {
    type: 'grammar' | 'model'
}

export default function VisualizeContent({ type }: Props) {
    const { grammarEditor, modelEditor, grammarStatus, modelStatus } = useEditorsContext();

    const { textxWorkerRef } = useTextxWorkerContext();

    const enabled = type === 'grammar' ? grammarStatus?.type === EditorStatusType.SUCCESS : modelStatus?.type === EditorStatusType.SUCCESS;

    return (
        <Tooltip content={`Visualize ${type}`}>
            <button
                className={cn('flex items-center justify-center', enabled ? 'cursor-pointer' : 'cursor-not-allowed opacity-50')}
                disabled={!enabled}
                onClick={async () => {
                    if (!grammarEditor || !modelEditor) {
                        return;
                    }
                    const grammar = grammarEditor.getValue();
                    if (type === 'grammar') {
                        textxWorkerRef.current?.postMessage({
                            type: "visualize-grammar",
                            grammar
                        });
                    } else {
                        const model = modelEditor.getValue();
                        textxWorkerRef.current?.postMessage({
                            type: "visualize-model",
                            model,
                            grammar
                        });

                    }
                }}
            >
                <PhotoIcon
                    className='h-5 w-5 text-blue-500'
                />
            </button>
        </Tooltip>
    )
}