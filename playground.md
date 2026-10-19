---
title: MatchBox Playground
description: Write and run BoxLang in your browser with MatchBox compiled to WebAssembly. Real compiler, real VM, nothing sent to a server.
layout: playground
order: 2
---

# MatchBox Playground

Run BoxLang in your browser with MatchBox compiled to WebAssembly. The page ships six demos (hello, data pipelines, Fibonacci, classes, a Mandelbrot set and the Game of Life), an editor and a stateful REPL. Code runs on your device and is never sent to a server.

Limits: runs stop after 5 seconds, with 128 MiB of memory and 64 KiB for source and output. Files, network, the DOM, JVM APIs and the JIT are not available in the browser build. See [differences from BoxLang](differences-from-boxlang.md) and [JavaScript and WebAssembly](building-and-deploying/javascript-and-wasm.md).
