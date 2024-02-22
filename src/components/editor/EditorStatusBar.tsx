import { CheckCircleIcon, XCircleIcon } from "@heroicons/react/24/outline";
import { EditorStatus, EditorStatusType } from "../../types/editorTypes";
import Spinner from "../common/Spinner";

const statusBarClassNames = "flex flex-shrink-0 px-4 py-1 border-t border-gray-100 dark:border-gray-800 text-sm font-semibold";

type Props = {
    status?: EditorStatus;
}

const EditorStatusBar = ({ status }: Props) => {
    return (
        <div className={statusBarClassNames}>
            <div className="flex flex-row flex-1 items-center space-x-2 h-5">
                {status?.type && getStatusIcon(status.type)}
                {status?.position && <span className="flex-shrink-0">({status.position[0] + 1}, {status.position[1] + 1})</span>}
                <span className="flex-1 line-clamp-1">{status?.message}</span>
            </div>
        </div>
    )
}

const getStatusIcon = (statusType: EditorStatusType) => {
    switch(statusType) {
        case EditorStatusType.LOADING:
            return <Spinner size="sm" />;
        case EditorStatusType.ERROR:
            return <XCircleIcon className="w-5 h-h text-red-500" />;
        case EditorStatusType.SUCCESS:
            return <CheckCircleIcon className="w-5 h-h text-green-500" />;
        default:
            return null;
    }
}

export default EditorStatusBar;