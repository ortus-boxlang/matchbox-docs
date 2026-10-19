# MatchBox website & documentation

A static marketing website, 19-page documentation hub, and live browser playground for [MatchBox](https://github.com/ortus-boxlang/matchbox). Dark/light themes, responsive layouts, local full-text search, keyboard navigation, and copyable examples. Content and navigation are rendered HTML; the playground additionally requires JavaScript, WebAssembly, and module workers.

## Build & preview

Requires Python 3.9+. No packages to install, no application server, and no runtime CDN dependencies.

```sh
# MatchBox Documentation

Official documentation for [MatchBox](https://github.com/ortus-boxlang/matchbox), the portable Rust implementation of BoxLang. The site is built with bxSites from Markdown in `docs/` and published at [matchbox.boxlang.io](https://matchbox.boxlang.io/).

## Build and preview

Install BoxLang and bxSites, then run:

```sh
boxlang bxSites build
boxlang bxSites audit
boxlang bxSites serve --port=8081
```

The preview uses port 8081 because port 8080 is often already in use. npm shortcuts are also available: `npm run build`, `npm test`, and `npm run serve`. Each authored page receives a generated 1200x630 Open Graph image under `site/assets/og/` during the build.

Edit Markdown in `docs/`; site configuration is in `bxsites.yaml`, and the navigation tree is in `docs/nav.json`. `site/` is generated output and must not be edited by hand.

## Playground

The browser playground is published at `/playground/`, and the home page has a small live REPL. The theme layout is `docs/.theme/playground.bxm`; the WebAssembly runtime, worker and editor scripts are in `docs/assets/playground/`. The Rust crate that builds the runtime is `playground-runtime/` (it needs the sibling `../matchbox` checkout, the `wasm32-unknown-unknown` target and `wasm-bindgen-cli` 0.2.114). Rebuild with `bash tools/build-runtime.sh` and check the shipped WASM with `npm run test:playground`.
