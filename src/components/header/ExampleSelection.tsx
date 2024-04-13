import { useState } from "react";
import ConfirmationDialog from "../common/ConfirmationDialog";
import Dropdown from "../common/Dropdown";
import textxExamples, { TextxExample, getTextxExampleCode } from "../../utils/textxExamples";
import { useEditorsContext } from "../../context/editorContext";
import Spinner from "../common/Spinner";

export default function ExampleSelection() {
    const [choseExample, setChoseExample] = useState<TextxExample>();
    const [isLoading, setIsLoading] = useState(false);

    const { grammarEditor, modelEditor } = useEditorsContext()

    const loadExample = async () => {
        if (!choseExample) return;
        setIsLoading(true);
        const example = await getTextxExampleCode(choseExample);
        setIsLoading(false);
        grammarEditor?.setValue(example?.grammar)
        modelEditor?.setValue(example?.model)
    }

    return (
        <div>
            <Dropdown
                target={(
                    <div className="flex flex-row space-x-3 items-center">
                        {isLoading && <Spinner size="sm" />}
                        <span>Examples</span>
                    </div>
                )}
                items={textxExamples.map((example) => ({
                    label: example.name,
                    action: () => {
                        setChoseExample(example);
                    }
                }))}
            />
            <ConfirmationDialog
                open={!!choseExample}
                title={choseExample?.name ? `Load ${choseExample.name} Example` : ''}
                message="You will loose all the changes you made. Are you sure you want to load the example?"
                onCancel={() => setChoseExample(undefined)}
                onConfirm={loadExample}
            />
        </div>
    );
}