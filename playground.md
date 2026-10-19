---
title: MatchBox Playground
description: Write and run BoxLang in your browser with MatchBox compiled to WebAssembly. Real compiler, real VM, nothing sent to a server.
layout: playground
order: 2
---

# MatchBox Playground

Run BoxLang in your browser with MatchBox compiled to WebAssembly. The page ships six demos (hello, data pipelines, Fibonacci, classes, a Mandelbrot set and the Game of Life), an editor and a stateful REPL. Code runs on your device and is never sent to a server.

Limits: runs stop after 5 seconds, with 128 MiB of memory and 64 KiB for source and output. Files, network, the DOM, JVM APIs and the JIT are not available in the browser build. See [differences from BoxLang](differences-from-boxlang.md) and [JavaScript and WebAssembly](building-and-deploying/javascript-and-wasm.md).

## Share and embed

Copy link puts your code in the link itself, after the `#`, so it is never sent to a server. Anyone who opens it gets the code in their own browser and presses Run themselves. Links hold about 8 KB of compressed source.

Share gives you an `<iframe>` for your own page, with an optional read only mode:

```html
<iframe src="https://matchbox.boxlang.io/playground/embed/#code=...&ro=true" width="600" height="400" allow="fullscreen"></iframe>
```

Full screen expands the editor and console to the whole window. Clear empties the editor and the console, and keeps session variables.
