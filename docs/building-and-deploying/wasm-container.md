---
title: WASM container deployment
description: Produce WASI modules and WASI HTTP components with MatchBox 0.11.0, what works, what is broken, and what was tested.
---

# WASM Container Deployment

MatchBox can target WASI hosts such as Wasmtime, WasmEdge and WASM-capable container runtimes. This page records what was run against MatchBox 0.11.0. `wasm` and `wasi` are two different `--target` values, and in 0.11.0 neither produces a working module on its own.

!!! warning "Known issue: `--target wasm` and `--target wasi`"
    - `--target wasi` fails with `WASI stub is missing the BOXLANG_EMBED sentinel`. The runner stub has no such sentinel.
    - `--target wasm` writes `<name>.wasm`, but the file is the WASI stub with an unframed byte block appended. Node 22 rejects it with `unknown section code #0xea`.

    The browser path is `--target js` and is covered in [JavaScript and WebAssembly](javascript-and-wasm.md). The rest of this page describes a verified workaround and the WASI HTTP target.

No standalone WASI runtime (Wasmtime, WasmEdge) was available when this page was written. Everything marked as run used the WASI implementation in Node 22.

---

## A working WASI module: Native Fusion

If a `native/` directory exists next to the script, the CLI does not use the runner stub. It generates a small Rust crate with your bytecode inside and compiles it for `wasm32-wasip1`. The directory may be empty.

```text
my_service/
  hello.bxs
  native/
```

```bash
rustup target add wasm32-wasip1
mkdir -p out
matchbox --target wasi hello.bxs --output out/hello.wasm
```

```text
Native Fusion detected! Target: wasi. Building hybrid artifact...
...
WASI Fusion binary produced: out/hello.wasm
```

The build took about 50 seconds and wrote 8,669,526 bytes for the three-line `hello.bxs` from the quick start. The output directory must already exist: the CLI copies the built file there and does not create the directory.

Running it under Node's WASI implementation printed the script's output and exited with code 0:

```js
import { WASI } from 'node:wasi';
import fs from 'node:fs';

const wasi = new WASI({ version: 'preview1', args: ['hello.wasm'], env: {}, preopens: {}, returnOnExit: true });
const mod = await WebAssembly.compile(fs.readFileSync('out/hello.wasm'));
const instance = await WebAssembly.instantiate(mod, wasi.getImportObject());
console.log('exit code', wasi.start(instance));
```

```text
Hello, world!
exit code 0
```

Requirements and limits of this route:

- A Rust toolchain with the `wasm32-wasip1` target.
- The MatchBox source tree. The generated crate depends on `matchbox_vm` by the absolute path of the checkout the CLI was compiled from, and the build runs `cargo build --offline` against a copy of that checkout's `Cargo.lock`. It was run with a CLI built from source, not with a downloaded release binary.
- A Fusion build with `native/*.rs` files can add Rust functions. A `native/Cargo.toml` is ignored, see [Native Fusion](native-fusion.md).

A Fusion build for WASI with a `register_bifs()` module (`add(10, 20)`) also compiled and printed `30` under Node's WASI.

## Running the plain runner stub

The WASI runner stub that the CLI embeds is a valid module. After a source build with the `wasm32-wasip1` target installed it is at `stubs/runner_stub_wasip1.wasm` (2,110,700 bytes). It cannot read bytecode appended to itself on WASI, so it falls back to a file named `app.bxb` in the preopened current directory:

```bash
matchbox --build hello.bxs --output app.bxb
```

With the same Node script as above but `preopens: { '.': '.' }`, running the stub printed `Hello, world!`. With no `app.bxb` it exits with code 1 and prints `No embedded bytecode or app.bxb found`. This is how the stub behaves today, not a documented deployment mode.

## Other WASI hosts

Wasmtime, WasmEdge, Docker's WASM runtimes and edge platforms such as Fastly Compute accept WASI modules in general, but none of them were available for testing and none of their commands are given here. Use the module from the Fusion route and follow your host's own documentation. Remember to grant file access to the directory the program needs; the Node example above needed a preopened directory only for the stub's `app.bxb` fallback.

---

## WASI HTTP components

`--target wasi-http` packages a webroot into the `matchbox_wasi_http_runner` WASI component. It does not take a script:

```bash
matchbox --target wasi-http --webroot www --output site.wasm
```

```text
WASI HTTP component produced: site.wasm
```

A one-page webroot produced a 6,503,104 byte file. The component was not run, so its HTTP behaviour is untested. The webroot payload may not exceed 4,194,292 bytes. The command needs the `server` feature and the `wasm32-wasip2` Rust target, and it builds `matchbox_wasi_http_runner` under the source checkout the CLI was compiled from the first time it is used.

---

## Limitations of the WASI Fusion module

| Feature | Status |
| :--- | :--- |
| Java interop | Not available. The WebAssembly builds do not include JNI. |
| DOM and `js.*` | Not available. They need a browser. |
| File access | Granted by the host through preopened directories. |
| JIT | Not available. Cranelift is not part of the WebAssembly builds. |
