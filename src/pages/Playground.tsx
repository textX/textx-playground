import { useCallback, useEffect, useState } from "react";
import { setupTextXLanguageClient } from "../utils/editorUtils";
import Spinner from "../components/Spinner";

const editorContainerClassNames = "w-full flex flex-col border border-gray-100 dark:border-gray-800";
const editorTitleClassNames = "flex justify-center items-center h-[40px] bg-gray-300 dark:bg-gray-700 font-semibold";

function Playground() {
    const [textXInitialized, setTextXInitialized] = useState(false);

    useEffect(() => {
        initTextXWorker();
    }, []);

    const initTextXWorker = useCallback(async () => {
        const worker = await setupTextXLanguageClient();
        worker.onmessage = (event) => {
            if (event.data === 'textx-worker-started') {
                setTextXInitialized(true);
            }
        }
    }, []);

    return (
        <div className="flex flex-row w-full h-full">
            <div className={editorContainerClassNames}>
                <div className={editorTitleClassNames}>Language Grammar</div>
                <div className="flex justify-center items-center h-full">
                    {
                        textXInitialized ? "Editor" : (
                            <Spinner />
                        )
                    }
                </div>
            </div>
            <div className={editorContainerClassNames}>
                <div className={editorTitleClassNames}>Model</div>
                <div className="flex justify-center items-center h-full">
                    {
                        textXInitialized ? "Editor" : (
                            <Spinner />
                        )
                    }
                </div>
            </div>
        </div>
    )
}

export default Playground;