// Theme shared with textx.org. localStorage is per origin, so play.textx.org and
// textx.org share the choice through a cookie on Domain=textx.org instead.
// The same cookie is read and written by the website (textx-website: src/data/themeSync.ts).

export type Theme = 'light' | 'dark';

const COOKIE = 'textx-theme';

/** Theme currently applied (index.html sets the `dark` class before first paint). */
export function currentTheme(): Theme {
    return document.documentElement.classList.contains('dark') ? 'dark' : 'light';
}

export function saveTheme(theme: Theme) {
    try {
        localStorage.setItem('theme', theme);
    } catch {
        // storage blocked: the cookie below still carries the choice
    }
    const shared = /(^|\.)textx\.org$/.test(location.hostname);
    const domain = shared ? '; Domain=textx.org' : '';
    const secure = location.protocol === 'https:' ? '; Secure' : '';
    document.cookie = `${COOKIE}=${theme}; Path=/; Max-Age=31536000; SameSite=Lax${domain}${secure}`;
}
