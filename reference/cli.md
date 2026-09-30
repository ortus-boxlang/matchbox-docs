---
title: CLI Reference
description: Common MatchBox commands for running, compiling, inspecting, and serving BoxLang applications.
icon: phosphor-duotone:terminal-window
---

# MatchBox CLI

Use `matchbox --help` with the installed version for the complete, version-specific option list. Common commands include:

| Command | Purpose |
| --- | --- |
| `matchbox` | Start the interactive REPL. |
| `matchbox app.bxs` | Run a BoxLang script. |
| `matchbox --build app.bxs` | Compile a `.bxb` bytecode file. |
| `matchbox --build --strip-source app.bxs` | Compile bytecode without embedded source text. |
| `matchbox --target native app.bxs` | Build a native executable for the current host. |
| `matchbox --target js app.bxs` | Build the JavaScript/WebAssembly module output. |
| `matchbox --target wasm app.bxs` | Build raw WebAssembly output. |
| `matchbox --version` | Print version and build information. |
| `matchbox --help` | Print available commands and options. |

Target support and option details can change between releases. See the guides for [native](../building-and-deploying/native-builds.md), [JavaScript and WebAssembly](../building-and-deploying/javascript-and-wasm.md), [WASI](../building-and-deploying/wasm-container.md), and [ESP32](../building-and-deploying/esp32.md).

The server distribution has additional webroot and application-server options. Start with the [web server guide](../examples/web_server/README.md) and [application server example](../examples/app_server/README.md), then confirm flags with the matching server binary's `--help` output.