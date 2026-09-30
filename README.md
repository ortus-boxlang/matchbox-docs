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

The preview uses port 8081 because the phase-II playground runner may use 8080. npm shortcuts are also available: `npm run build`, `npm test`, and `npm run serve`. Each authored page receives a generated 1200x630 Open Graph image under `site/assets/og/` during the build.

Edit Markdown in `docs/`; site configuration is in `bxsites.yaml`, and the navigation tree is in `docs/nav.json`. `site/` is generated output and must not be edited by hand.

## Playground

The browser playground is phase II and is not included in the bxSites navigation or published site. Its existing source, WASM runtime, and tests remain in `src/`, `assets/`, `playground-runtime/`, and `tools/`. Run its independent WASM checks with `npm run test:playground`.

## Publish

The GitHub Actions workflow builds and audits the site on pushes to `main`, then publishes `site/` to the `gh-pages` branch. Configure repository Pages to deploy from `gh-pages` at the root and point the `matchbox.boxlang.io` DNS record at GitHub Pages. The workflow writes the custom-domain `CNAME` file on each deploy.

The build generates static AI-readable `mcp-index.json`, `mcp-manifest.json`, and `mcp-nav.json` files. A live MCP server for the published site is a separate bxSites Cloud feature.

## Skills and source material

The project-specific bxSites skills are in `.agents/skills/`; keep them available when changing configuration, content, builds, search, AI output, or deployment. Technical MatchBox claims should be checked against the sibling `../matchbox/` repository and the current [BoxLang documentation](https://boxlang.ortusbooks.com/). Agentic Development and BoxLang AI are documented as separate platform capabilities.
Or run `npm test`. These checks do not execute all documented MatchBox commands, flash hardware, deploy AWS resources, or verify every external URL.
