---
title: BoxLang AI
description: Explore AI features built into BoxLang applications and understand what must be validated on MatchBox targets.
order: 8
icon: phosphor-duotone:sparkle
tags: [ai, boxlang, getting-started]
---

# BoxLang AI

BoxLang AI is about adding AI capabilities to an application: connecting providers, composing prompts, using tools and agents, and integrating capabilities such as memory or retrieval. That is different from **Agentic Development**, where an AI coding agent helps a developer create the application.

Start with the [official BoxLang AI documentation](https://boxlang.ortusbooks.com/boxlang-ai/boxlang-ai.md) for the current feature set and supported integrations.

## MatchBox compatibility is target-specific

MatchBox is an independent Rust runtime with its own host and target boundaries. Do not assume that a BoxLang AI module, JVM provider SDK, network client, or storage integration supported by the JVM runtime also works in MatchBox. Confirm the module's requirements and the MatchBox target's supported APIs before designing around it.

For native MatchBox applications, begin with the [HTTP request guide](../http.md) and verify the providers your application needs. Browser and embedded targets have different I/O and resource constraints; successful native behavior is not proof of browser or ESP32 support.

## Design for the deployment target

Keep provider credentials in server-side configuration, never in browser bundles or firmware images. Use bounded timeouts, avoid logging secrets or prompts containing sensitive data, and test failure paths such as unavailable providers and malformed responses. Treat model output as untrusted input when it can influence tools or application state.

For capabilities that are not documented for MatchBox, use the JVM BoxLang runtime or validate a minimal prototype on the intended MatchBox target before committing to the integration.