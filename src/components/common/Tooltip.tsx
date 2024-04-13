import { ReactNode } from "react";

type Props = {
    content: string;
    children: ReactNode;
    onHoverOut?: () => void;
};

export default function Tooltip({ content, children, onHoverOut }: Props) {
    return (
        <div className='group relative hover:visible hover:z-50' onMouseLeave={onHoverOut}>
            <div
                className='absolute right-[calc(100%+5px)] top-[calc(50%-20px)] whitespace-nowrap invisible group-hover:visible group-hover:z-50 bg-white dark:bg-gray-900 text-gray-900 dark:text-white rounded shadow-md shadow-gray-300 dark:shadow-gray-900 bg-gray-100 px-3 py-2 text-sm font-medium'
            >
                {content}
            </div>
            {children}
        </div>
    );
}