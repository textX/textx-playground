import ExampleSelection from './ExampleSelection';
import Logo from './Logo';
import ThemeToggler from './ThemeToggler';
import { siteHomeUrl } from '../../utils/siteUrl';

// Sized like the textx.org header: 64px bar + 1px border, 14px medium nav text, outlined GitHub button.
export default function Header() {
    const home = siteHomeUrl();

    return (
        <header className="bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700 h-[65px] shrink-0 flex flex-row items-center justify-between gap-6 px-4 sm:px-6">
            <a href={home} className="flex shrink-0 items-center" title="textX home">
                <Logo />
                <span className="ml-3 hidden sm:inline text-sm font-medium text-gray-500 dark:text-gray-400">Playground</span>
            </a>
            <nav className="flex flex-row items-center gap-4 sm:gap-6 text-sm font-medium">
                <ExampleSelection />
                <a href={`${home}docs/`} className="text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors">
                    Docs
                </a>
                <a
                    href="https://github.com/textX/textX"
                    target="_blank"
                    rel="noopener"
                    className="hidden sm:inline-flex items-center gap-2 rounded-md border border-gray-200 dark:border-gray-700 px-3 py-1.5 text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:border-gray-400 transition-colors"
                >
                    <svg viewBox="0 0 16 16" className="h-4 w-4" aria-hidden="true" fill="currentColor">
                        <path d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27.68 0 1.36.09 2 .27 1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.013 8.013 0 0016 8c0-4.42-3.58-8-8-8z" />
                    </svg>
                    GitHub
                </a>
                <ThemeToggler />
            </nav>
        </header>
    );
}
