import { ShareIcon } from "@heroicons/react/24/outline";
import Tooltip from "./Tooltip";
import LZString from 'lz-string';
import { useState } from "react";
import { copyText } from "../utils/textUtils";
import { useEditorsContext } from "../utils/editorContext";

export default function ShareEditorsContent() {
    const [isCopied, setIsCopied] = useState(false);
    const { grammarEditor, modelEditor } = useEditorsContext();

    return (
        <Tooltip content={isCopied ? 'Share link copied' : 'Copy share link'} onHoverOut={() => setIsCopied(false)}>
          <ShareIcon
            className='h-5 w-5 text-blue-500 cursor-pointer'
            onClick={async () => {
              if (!grammarEditor || !modelEditor) {
                return;
              }
              const grammarContent = grammarEditor.getValue();
              const grammarContentCompressed = LZString.compressToEncodedURIComponent(grammarContent);
              const modelContent = modelEditor.getValue();
              const modelContentCompressed = LZString.compressToEncodedURIComponent(modelContent);
              const link = `${window.location.href}?grammar=${grammarContentCompressed}&model=${modelContentCompressed}`;
              if (await copyText(link)) {
                setIsCopied(true);
              }
            }}
          />
        </Tooltip>
    )
}