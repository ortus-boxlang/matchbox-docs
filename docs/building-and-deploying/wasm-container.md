---
title: WASI deployment (experimental)
description: Build experimental WebAssembly workloads for a WASI host.
---

# WASI deployment

!!! warning "Experimental"
    WASI packaging and host compatibility are still evolving. Start with a small workload on your intended host.

WASI runs WebAssembly outside a browser. Use `--target wasi` for a command-line workload, `--target wasi-http` for an HTTP component, and [`--target js`](javascript-and-wasm.md) for browsers.

## Build and run

```sh
matchbox --target wasi hello.bxs
wasmtime hello.wasm
```

The module contains a runner and your bytecode. It needs a compatible WASI Preview 1 host, such as Wasmtime.

The host controls access to files and other resources. For example, `wasmtime --dir=. hello.wasm` grants access to the current directory.

## Native Fusion

Native Fusion supports WASI alongside native, browser and ESP32 targets. Put Rust code in a `native/` directory next to the entry script, and use dependencies that support `wasm32-wasip1`.

Fusion builds require Rust, the target toolchain and the MatchBox source checkout. See [Native Fusion](native-fusion.md) for setup.

## HTTP components

Package a webroot instead of a script:

```sh
matchbox --target wasi-http --webroot www --output site.wasm
```

The component needs a host implementing `wasi:http/incoming-handler`. Its build currently requires Rust, the `wasm32-wasip2` target and the MatchBox source checkout. See [WASI HTTP](wasi-http.md) for setup.

## Choosing a host

WASI does not provide browser DOM APIs, JNI or JIT. File and network access depend on the host's capabilities.

OCI deployment needs a WASI-capable container runtime; an ordinary Docker installation is not enough. Start with the [WASI example](../examples/wasm_container/README.md).
