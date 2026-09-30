# MatchBox Documentation

This repository is the official MatchBox documentation site. It is built with bxSites from Markdown in `docs/`; `site/` is generated output and must not be edited by hand.

## Build and preview

- Build: `boxlang bxSites build`
- Preview: `boxlang bxSites serve --port=8081`
- Quality check: `boxlang bxSites audit`
- The default local preview port 8080 may be occupied by the phase-II playground runner; do not stop or replace another running process.

## Content guidance

- Keep navigation and page sources in the bxSites `docs/` tree. Use bxSites Markdown extensions and content blocks where they improve scanning or learning.
- MatchBox is a pillar of the BoxLang software productivity platform. Keep Agentic Development and BoxLang AI distinct and easy to find.
- Ground technical claims and examples in the sibling `../matchbox/` repository or current official BoxLang documentation. Call out platform and feature limitations explicitly.
- The browser playground is phase II. Preserve its existing source/runtime, but do not include it in phase-I navigation or the published site.
- Keep branding assets in `docs/assets/`. Do not copy the legacy Python site's shell or generated HTML into the bxSites theme.

## Existing agent skills

Use the relevant skills under `.agents/skills/` before changing bxSites configuration, content, builds, search, deployment, plugins, or AI-facing output. These skills are project knowledge; retain them. The sibling MatchBox repository also has `.agents/skills/runner-development/` for ESP32 runner implementation details.