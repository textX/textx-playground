
import GithubLogoUrl from '../../assets/githubLogo.svg';
import ExampleSelection from './ExampleSelection';
import ThemeToggler from './ThemeToggler';
import textXLogoUrl from '/textxLogo.png';

export default function Header() {
    return (
        <header className="bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700 h-[80px] flex flex-row item-center justify-between py-4 px-10">
            <div className={'relative h-full flex w-40'}>
                <img
                    src={textXLogoUrl}
                    alt="TextX Logo"
                    className="dark:invert"
                />
            </div>
            <nav className="flex flex-row items-center space-x-8">
                <ExampleSelection />
                <a href={'https://textx.github.io/textX/stable/'} target={'_blank'} className="font-semibold">Documentation</a>
                <ThemeToggler />
                <a href={'https://github.com/textX/textX'} target={'_blank'}>
                    <img
                        src={GithubLogoUrl}
                        alt="Github Logo"
                        className="w-10 h-10 dark:invert"
                    />
                </a>
            </nav>
        </header>
    )
}
