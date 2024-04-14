import { ShareIcon } from "@heroicons/react/24/outline";
import LZString from 'lz-string';
import { useState } from "react";
import { useEditorsContext } from "../../context/editorContext";
import { copyText } from "../../utils/textUtils";
import Tooltip from "../common/Tooltip";

const MAX_URL_LENGTH = 2048;

export default function ShareEditorsContent() {
  const [isCopied, setIsCopied] = useState(false);
  const [isTooLong, setIsTooLong] = useState(false);
  const { grammarEditor, modelEditor } = useEditorsContext();

  return (
    <Tooltip
      content={isCopied ? 'Share link copied' : (isTooLong ? 'Couldn\'t copy, too long URL' : 'Copy share link')}
      onHoverOut={() => {
        setIsCopied(false);
        setIsTooLong(false);
      }}
    >
      <button
        className="flex items-center justify-center rounded-full p-3 shadow-md bg-white dark:bg-gray-900"
        onClick={async () => {
          if (!grammarEditor || !modelEditor) {
            return;
          }
          const grammarContent = grammarEditor.getValue();
          const grammarContentCompressed = LZString.compressToEncodedURIComponent(grammarContent);
          const modelContent = modelEditor.getValue();
          const modelContentCompressed = LZString.compressToEncodedURIComponent(modelContent);
          const { origin, pathname } = window.location;
          const baseUrl = `${origin}${pathname}`;
          const link = `${baseUrl}?grammar=${grammarContentCompressed}&model=${modelContentCompressed}`;
          if (link.length > MAX_URL_LENGTH) {
            setIsTooLong(true);
            return;
          }
          if (await copyText(link)) {
            setIsCopied(true);
          }
        }}
      >
        <ShareIcon
          className='h-6 w-6 text-blue-500'
        />
      </button>
    </Tooltip>
  )
}