# MatchBox website & documentation

A static marketing website and 19-page documentation hub for [MatchBox](https://github.com/ortus-boxlang/matchbox). Dark/light themes, responsive layouts, local full-text search, keyboard navigation, and copyable examples. All content and navigation are rendered HTML; JavaScript only enhances interactions.

## Build & preview

Requires Python 3.9+. No packages to install, no application server, and no runtime CDN dependencies.

```sh
python3 tools/build.py
python3 -m http.server 8080 --directory site
```

Open **http://localhost:8080**. Use HTTP rather than opening files directly so module scripts and the search index can load.

Optional npm shortcuts (no `npm install` needed): `npm run build`, `npm run serve`.

## Edit

- `src/index.html` — marketing homepage.
- `src/docs/*.html` — documentation article bodies; use sibling `.html` links and unique IDs on headings.
- `src/docs.json` — page titles, descriptions, ordering, navigation groups, and upstream source links.
- `src/layout.html` — shared header, footer, search dialog, and metadata.
- `assets/site.css` — shared responsive styles and theme tokens.
- `assets/site.js` — search, theme switch, tabs, menus, and clipboard behavior.
- `tools/build.py` — standard-library-only assembly of the HTML, navigation, table of contents, and search index.

Rebuild after changing source files. `site/` is generated and ignored by Git; do not edit it directly. No Markdown parser or JS build system is involved.

## Check

```sh
python3 tools/check.py       # Rebuild; check structure, local links, fragments, assets, search coverage
node tools/check-search.js  # Search behavior (Node 18+)
```

Or run `npm test`. These checks do not execute all documented MatchBox commands, flash hardware, deploy AWS resources, or verify every external URL.

Optional browser regression check (Playwright is test-only, not a site dependency):

```sh
npm install --no-save --package-lock=false playwright
npx playwright install chromium
# With the static server running:
node tools/check-browser.cjs http://localhost:8080/
```

This checks mobile and no-JS navigation, theme persistence, keyboard search and focus return, installer tabs, clipboard copying, and every page at three viewport widths. Pass a project-subpath URL to check subpath hosting.

## Publish

Upload the **contents of `site/`** to any static host. No rewrites or SPA fallback are needed. Relative links work at a domain root or a project subpath. For CI, run the build/check commands and publish `site/` as the artifact. A `.nojekyll` file is included for GitHub Pages.

No domain, analytics, credentials, or automatic deployment is configured. Add absolute canonical/social-image URLs after choosing the production domain.

## Content sources & brand assets

The initial documentation review used the sibling MatchBox repository at commit `805efbc` (package version `0.10.1`, including development changes), its README, current CLI source, manifests, changelog, and documentation. This is a reviewed snapshot, not an assertion of the latest release. The site also consolidates the original [runtime introduction](https://boxlang.ortusbooks.com/getting-started/running-boxlang/matchbox), [framework overview](https://boxlang.ortusbooks.com/boxlang-framework/matchbox), and their JVM differences, source builds, cross-compilation, and Native Fusion subpages.

Current source takes precedence over outdated documentation, notably for `wasm` versus `wasi`, server filenames, Cargo features, and compatibility. Source attribution links appear on every documentation page. Recheck these claims when updating MatchBox.

Visual direction follows boxlang.io, ai.boxlang.io, bxsites.io, and bxagents.ai. `assets/matchbox.svg` uses the MatchBox glyph from the BoxLang site's `bl-icon-set` with the ecosystem cyan/green treatment; it is an Ortus brand asset, not a new independent logo. The BoxLang icon and Ortus wordmark are also sourced from those official sites. Manrope is self-hosted under the SIL Open Font License in `assets/manrope-license.txt`. UI icons are inline SVG symbols, with no icon-font dependency.
