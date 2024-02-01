function Playground() {

    const editorContainerClassNames = "w-full flex flex-col border border-gray-100 dark:border-gray-800";
    const editorTitleClassNames = "flex justify-center items-center h-[40px] bg-gray-300 dark:bg-gray-700 font-semibold";

    return (
        <div className="flex flex-row w-full h-full">
            <div className={editorContainerClassNames}>
                <div className={editorTitleClassNames}>Language Grammar</div>
                <div className="flex justify-center items-center h-full">
                    Editor
                </div>
            </div>
            <div className={editorContainerClassNames}>
                <div className={editorTitleClassNames}>Model</div>
                <div className="flex justify-center items-center h-full">
                    Editor
                </div>
            </div>
        </div>
    )
}

export default Playground;