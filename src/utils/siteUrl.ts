/**
 * Home page of the textX website, derived from where the playground runs:
 *
 * - `play.<domain>` (e.g. play.textx.org) → `https://<domain>/`, so a preview or
 *   another domain keeps pointing at its own site;
 * - anywhere else (GitHub Pages, localhost) there is no site at the parent
 *   domain, so we fall back to https://textx.org/.
 *
 * `VITE_SITE_URL` overrides both.
 */
export function siteHomeUrl(): string {
    const fromEnv = import.meta.env.VITE_SITE_URL as string | undefined;
    if (fromEnv) return fromEnv.endsWith('/') ? fromEnv : `${fromEnv}/`;

    const { protocol, hostname, port } = window.location;
    if (hostname.startsWith('play.')) {
        return `${protocol}//${hostname.slice('play.'.length)}${port ? `:${port}` : ''}/`;
    }
    return 'https://textx.org/';
}
