
import textXLogoUrl from '/textx-logo.png';
import GithubLogoUrl from '../assets/github-logo.svg';

export default function Header() {
    return (
        <header className="border-b border-gray-200 h-[80px] flex flex-row item-center justify-between py-4 px-10">
            <div className={'relative h-full flex w-40'}>
                <img
                    src={textXLogoUrl}
                    alt="TextX Logo"
                />
            </div>
            <nav className="flex flex-row items-center space-x-8">
                <a href={'https://textx.github.io/textX/stable/'} target={'_blank'} className="font-semibold">Documentation</a>
                <a href={'https://github.com/textX/textX'} target={'_blank'}>
                    <img
                        src={GithubLogoUrl}
                        alt="Github Logo"
                        className="w-12 h-12"
                    />
                </a>
            </nav>
        </header>
    )
}
