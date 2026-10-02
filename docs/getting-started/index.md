---
title: Getting Started
description: Install MatchBox, run BoxLang, and choose the right runtime target for your application.
order: 1
icon: phosphor-duotone:rocket-launch
---

# Get productive with MatchBox

MatchBox brings BoxLang to environments where a JVM runtime is not the right fit: native applications, browsers, WASI hosts, serverless functions, and embedded devices. Start with the CLI, then select a target based on the capabilities your application needs.

::: stepper
::: step "Install MatchBox"
Use MVM or the direct macOS/Linux or Windows installer, or download a full CLI executable or Docker image. See [installation](installation.md) and [releases and downloads](../reference/releases.md).
:::
::: step "Run BoxLang"
Start with a script or the interactive REPL. The CLI and standalone programs do not require Java.
:::
::: step "Choose a target"
Use the native CLI for local execution, then package for native, WebAssembly, WASI, or ESP32 as appropriate.
:::
:::

::: cards
::: card title="Install" icon="phosphor-duotone:download-simple" href="installation.md"
Get the MatchBox CLI for your operating system and verify it works.
:::
::: card title="Your first application" icon="phosphor-duotone:terminal" href="quick-start.md"
Write a small BoxLang program, run it, and package a native executable.
:::
::: card title="Agentic Development" icon="phosphor-duotone:robot" href="agentic-development.md"
Set up a coding agent with the project context and validation loop it needs.
:::
::: card title="BoxLang AI" icon="phosphor-duotone:sparkle" href="boxlang-ai.md"
Understand how AI features in an application differ from AI-assisted development.
:::
:::

## Choose your path

- **Native application:** Start with [native builds](../building-and-deploying/native-builds.md).
- **Browser module:** Read [JavaScript and WebAssembly](../building-and-deploying/javascript-and-wasm.md).
- **WASI host or container:** See [WASM containers](../building-and-deploying/wasm-container.md).
- **Embedded device:** Follow the [ESP32 guide](../building-and-deploying/esp32.md).
- **Web application:** Explore the [webroot server](../examples/web_server/README.md) or [application server](../examples/app_server/README.md).

MatchBox and the BoxLang JVM runtime share language concepts, but they are distinct runtimes. Check [compatibility and target differences](../differences-from-boxlang.md) before relying on JVM libraries or host-specific APIs.