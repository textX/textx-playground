import { ShareIcon } from "@heroicons/react/24/outline";
import Tooltip from "../common/Tooltip";
import LZString from 'lz-string';
import { useState } from "react";
import { copyText } from "../../utils/textUtils";
import { useEditorsContext } from "../../utils/editorContext";

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
          if (link.length > MAX_URL_LENGTH) {
            setIsTooLong(true);
            return;
          }
          if (await copyText(link)) {
            setIsCopied(true);
          }
        }}
      />
    </Tooltip>
  )
}