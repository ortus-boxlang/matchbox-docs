---
title: Building MatchBox from source
description: Build the MatchBox CLI, choose Cargo features and prepare target toolchains.
---

# Building MatchBox from source

You do not need Rust to use a prebuilt CLI. Build from source when you want to contribute to MatchBox or customize the runtime.

## Build the CLI

Install a current stable [Rust toolchain](https://rustup.rs/) and your platform's compiler and linker, then run:

```sh
git clone https://github.com/ortus-boxlang/matchbox.git
cd matchbox
cargo build --release
./target/release/matchbox --version
```

On Windows, the executable is `target/release/matchbox.exe`.

## Runner stubs

The build embeds small runtimes, called runner stubs, so the CLI can package applications without downloading a runtime at build time.

Install the Rust targets for the outputs you need:

| Rust target | Used for |
| --- | --- |
| `wasm32-unknown-unknown` | Browser builds with `--target js`. |
| `wasm32-wasip1` | Experimental WASI modules. |
| `wasm32-wasip2` | Experimental WASI HTTP components. |

```sh
rustup target add wasm32-unknown-unknown wasm32-wasip1 wasm32-wasip2
```

Browser packaging also needs the matching `wasm-bindgen` CLI:

```sh
cargo install wasm-bindgen-cli --version 0.2.114 --locked
```

For additional desktop runners:

```sh
cargo build --release --features cross-compile
```

Each runner needs its platform's build tools. A target can only be packaged when its runner is available.

## Cargo features

The default CLI includes common I/O, HTTP, crypto and terminal functions, Java interop, JIT and the web server. Features let you customize source builds:

| Feature | Purpose |
| --- | --- |
| `bif-io`, `bif-http`, `bif-crypto`, `bif-cli` | Common host integrations. |
| `bif-jni` | Java interoperability through a host JVM. |
| `bif-datasource`, `bif-zip` | Database and archive functions. |
| `server` | Built-in web serving and its dependencies. |
| `jit` | Cranelift JIT on supported native builds. |
| `bif-tui` | Terminal UI classes. |
| `qoq` | Query of queries. |
| `cross-compile` | Additional desktop runner stubs. |

For a smaller CLI without the server and its dependencies:

```sh
cargo build --release --no-default-features --features bif-io,bif-http
```

Cargo features can enable other features through dependencies. Use `cargo tree -e features` to inspect a custom build; the root `Cargo.toml` is the complete feature list.

## Browser runtime for source strings

`--target js` packages a compiled application. To compile source strings in the browser, use a small WebAssembly crate with `matchbox_compiler` and `matchbox_vm`, as this site's `playground-runtime/` does.

From the documentation repository, rebuild its runtime with:

```sh
bash tools/build-runtime.sh
npm run test:playground
```

## ESP32

ESP32 builds need the Espressif Rust toolchain, an activated ESP-IDF environment and flashing tools. Start with `matchbox esp32-doctor` and follow the [ESP32 guide](../building-and-deploying/esp32.md).

## Project layout

The main pieces are in `crates/`: the parser, compiler, VM, module system and target-specific runners. The root crate provides the CLI; `build.rs` prepares embedded runners. Tests live in `tests/`.

```sh
cargo test
cargo clippy
```

See [Native Fusion](../building-and-deploying/native-fusion.md) for building applications with Rust code, and [releases](../reference/releases.md) for published distributions.
