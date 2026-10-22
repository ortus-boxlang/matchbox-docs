---
title: WASI example (experimental)
description: Run a BoxLang data summary and Fibonacci calculation in a WASI host.
---

# WASI example

This example runs a small data summary and Fibonacci calculation outside the browser. WASI support is experimental; see [WASI deployment](../../building-and-deploying/wasm-container.md) for setup.

## Build and run

From this example's directory:

```sh
matchbox --target wasi service.bxs
wasmtime service.wasm
```

The program prints a dataset summary, Fibonacci terms and a completion message.

## Containers

The included `Dockerfile` packages `service.wasm` in a scratch image. Running it requires a WASI-capable container runtime, not an ordinary Linux container runtime.

Use [`--target js`](../wasm_browser/README.md) for browser applications, or [WASI HTTP](../../building-and-deploying/wasi-http.md) for an HTTP component.
