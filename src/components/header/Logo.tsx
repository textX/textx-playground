import { LOGO_TEXT_PATH, LOGO_VIEWBOX, LOGO_X_PATH } from '../../utils/logo';

// The original textX logo (grey "text" + big green X), the same one textx.org uses.
export default function Logo() {
    return (
        <svg viewBox={LOGO_VIEWBOX} className="block h-[1.9rem] w-auto" role="img" aria-label="textX">
            <path d={LOGO_TEXT_PATH} className="fill-[#4d4d4d] dark:fill-[#e1e4e6]" />
            <path d={LOGO_X_PATH} className="fill-[#008000] dark:fill-[#2fb456]" />
        </svg>
    );
}
