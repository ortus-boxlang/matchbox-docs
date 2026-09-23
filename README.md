# MatchBox website & documentation

A static marketing website, 19-page documentation hub, and live browser playground for [MatchBox](https://github.com/ortus-boxlang/matchbox). Dark/light themes, responsive layouts, local full-text search, keyboard navigation, and copyable examples. Content and navigation are rendered HTML; the playground additionally requires JavaScript, WebAssembly, and module workers.

## Build & preview

Requires Python 3.9+. No packages to install, no application server, and no runtime CDN dependencies.

```sh
python3 tools/build.py
python3 -m http.server 8080 --directory site
```

Open **http://localhost:8080**, or **http://localhost:8080/playground.html** for the REPL. Use HTTP rather than opening files directly so module scripts, workers, WebAssembly, and the search index can load.

Optional npm shortcuts (no `npm install` needed): `npm run build`, `npm run serve`.

## Edit

- `src/index.html` — marketing homepage.
- `src/playground.html`, `assets/playground.css` — playground content and layout.
- `assets/playground.js`, `assets/playground-worker.js` — editor/REPL interactions and isolated execution.
- `assets/playground-demos.js` — six editable BoxLang demos; checked against the shipped WASM.
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
node tools/check-playground.js  # Real WASM execution, all demos, persistent state, errors, limits
```

Or run `npm test`. These checks do not execute all documented MatchBox commands, flash hardware, deploy AWS resources, or verify every external URL.

Optional browser regression check (Playwright is test-only, not a site dependency):

```sh
npm install --no-save --package-lock=false playwright
npx playwright install chromium
# With the static server running:
node tools/check-browser.cjs http://localhost:8080/
```

This checks mobile and no-JS navigation, themes, search/focus, clipboard, tabs, and every page at three viewport widths. Playground checks cover all demos, shared state, history, offline execution, safe text output, edit replacement confirmation, UTF-8 input limits, Stop, the execution timeout, WASM traps, and failed-load/retry behavior. Pass a project-subpath URL to check subpath hosting.

## Browser runtime

The playground compiles **real BoxLang source** inside a Web Worker using MatchBox's Rust compiler and VM. `playground-runtime/src/lib.rs` is a small adapter: load the standard-library prelude once, compile each submission in REPL mode, execute with the browser's synchronous VM path, and return captured output/results/errors. The editor and REPL share the same VM; commands are not simulated or replayed. Clear removes output, while Reset, choosing a demo, Stop, timeout, or a WASM trap creates a fresh session. Ordinary parse/runtime errors preserve state, including any mutations before the error.

The ~1.9 MB WASM binary and generated JavaScript in `assets/runtime/` are committed so **normal site builds do not need Rust or the sibling repository**. They load only on the playground page. There is no execution backend, runtime CDN, analytics, or code upload. After initialization, evaluating code needs no network. Scripts, console history, and VM state are not persisted on reload.

Limits: 5 seconds per evaluation; 128 MiB maximum WASM linear memory; 64 KiB UTF-8 source and each returned output/value/error field; 100 displayed transcript entries and 50 history commands. Output is buffered until completion. Large allocations may trap before output truncation; the worker is then replaced. This build disables MatchBox's filesystem/network/JavaScript-host features and JIT, and does not support JVM APIs, async/timers, native clocks such as `getTickCount()`, BXM templates, or external imports. Use the CLI or a purpose-built browser module for capabilities outside this playground.

### Rebuild the WASM (optional)

The shipped bundle uses sibling MatchBox commit `805efbc24a337a17c33392ec550bfd0a40c58ffd`, Rust 1.95.0, and wasm-bindgen 0.2.114. The adapter's Cargo manifest references `../matchbox` relative to this repository; use a clean checkout at that revision for the same source. `playground-runtime/Cargo.lock` pins registry dependencies.

```sh
rustup target add wasm32-unknown-unknown
rustup component add rust-docs # Standard-library redistribution notices
cargo install wasm-bindgen-cli --version 0.2.114 --locked
bash tools/build-runtime.sh
npm test
# Then rerun the optional browser checks above.
```

The rebuild also needs Python, Node, and Git. It generates the WASM/glue, checks all demos, and refreshes build provenance and third-party notices in `assets/runtime/`. Review these assets and the documented capabilities whenever updating MatchBox or Rust. No upstream MatchBox files are modified.

## Publish

Upload the **contents of `site/`** to any static host, including `assets/runtime/`. Serve `.wasm` as `application/wasm` and `.js` as JavaScript. The playground needs same-origin module workers; if you set a Content Security Policy, allow those workers and WebAssembly compilation (`'wasm-unsafe-eval'`). No cross-origin-isolation headers, rewrites, or SPA fallback are needed. Relative links work at a domain root or a project subpath. For CI, run the build/check commands and publish `site/` as the artifact. A `.nojekyll` file is included for GitHub Pages.

No domain, analytics, credentials, or automatic deployment is configured. Add absolute canonical/social-image URLs after choosing the production domain.

## Content sources & brand assets

The initial documentation review used the sibling MatchBox repository at commit `805efbc` (package version `0.10.1`, including development changes), its README, current CLI source, manifests, changelog, and documentation. This is a reviewed snapshot, not an assertion of the latest release. The site also consolidates the original [runtime introduction](https://boxlang.ortusbooks.com/getting-started/running-boxlang/matchbox), [framework overview](https://boxlang.ortusbooks.com/boxlang-framework/matchbox), and their JVM differences, source builds, cross-compilation, and Native Fusion subpages.

Current source takes precedence over outdated documentation, notably for `wasm` versus `wasi`, server filenames, Cargo features, and compatibility. Source attribution links appear on every documentation page. Recheck these claims when updating MatchBox.

Visual direction follows boxlang.io, ai.boxlang.io, bxsites.io, and bxagents.ai. `assets/matchbox.svg` uses the MatchBox glyph from the BoxLang site's `bl-icon-set` with the ecosystem cyan/green treatment; it is an Ortus brand asset, not a new independent logo. The BoxLang icon and Ortus wordmark are also sourced from those official sites. Manrope is self-hosted under the SIL Open Font License in `assets/manrope-license.txt`. UI icons are inline SVG symbols, with no icon-font dependency.
