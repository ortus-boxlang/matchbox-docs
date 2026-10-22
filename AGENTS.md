# MatchBox Documentation

This repository is the official MatchBox documentation site. It is built with bxSites from Markdown in `docs/`; `site/` is generated output and must not be edited by hand.

## Build and preview

- Build: `boxlang bxSites build`
- Preview: `boxlang bxSites serve --port=8081`
- Quality check: `boxlang bxSites audit`
- The default local preview port 8080 may be occupied by another running process; do not stop or replace it.

## Content guidance

- Keep navigation and page sources in the bxSites `docs/` tree. Use bxSites Markdown extensions and content blocks where they improve scanning or learning.
- MatchBox is a pillar of the BoxLang software productivity platform. Keep Agentic Development and BoxLang AI distinct and easy to find.
- Write concise, approachable introductions to normal usage, not version-bound functionality contracts. Keep release history and old bug workarounds out of the general guides.
- Ground technical claims and examples in the sibling `../matchbox/` repository or current official BoxLang documentation. Explain important target limits and experimental features without exhaustive compatibility disclaimers.
- The browser playground is published at `/playground/` (layout `docs/.overrides/bootstrap/playground.bxm`, runtime and scripts in `docs/assets/playground/`). Rebuild the WebAssembly runtime with `bash tools/build-runtime.sh` and check it with `npm run test:playground`.
- Keep branding assets in `docs/assets/`. Do not copy the legacy Python site's shell or generated HTML into the bxSites theme.

## Existing agent skills

Use the relevant skills under `.agents/skills/` before changing bxSites configuration, content, builds, search, deployment, plugins, or AI-facing output. These skills are project knowledge; retain them. The sibling MatchBox repository also has `.agents/skills/runner-development/` for ESP32 runner implementation details.