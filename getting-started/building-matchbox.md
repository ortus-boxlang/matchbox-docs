---
title: Building MatchBox from source
description: Clone, configure and build MatchBox from source, including the Cargo features, workspace crates and slim-build recipes checked against 0.11.0.
---

# Building MatchBox from Source

This guide covers how to clone, configure, and build custom versions of MatchBox. The facts here were checked against MatchBox 0.11.0 on Linux x86_64 with Rust 1.97.

## Cloning the Repository

```bash
git clone https://github.com/ortus-boxlang/matchbox.git
cd matchbox
```

---

## Prerequisites

To build MatchBox, you need the [Rust toolchain](https://rustup.rs/): Rust 1.85 or newer (the crates use the 2024 edition).

### Runner stubs

`build.rs` builds a runner stub for the host on every build, and also tries to build two WebAssembly stubs. A missing target does not fail the build; the matching `--target` then fails at run time with `runner stub for target '...' is not embedded`.

| Rust target | Needed for |
| --- | --- |
| `wasm32-wasip1` | The `wasi` stub used by `--target wasm` and `--target wasi`. Both targets are currently broken, see the [CLI reference](../reference/cli.md#wasi-targets). |
| `wasm32-unknown-unknown` | The `web` stub used by `--target js`. |
| `wasm32-wasip2` | `--target wasi-http`, built on demand the first time it is used. |

```bash
rustup target add wasm32-wasip1 wasm32-unknown-unknown
```

### Web & WASM build

- `wasm-bindgen` CLI at exactly version 0.2.114, matching the pinned crate: `cargo install wasm-bindgen-cli --version 0.2.114`. `--target js` runs it. Set `WASM_BINDGEN` to its path if it is not on `PATH`.

### ESP32 build (optional)

- **Toolchain**: [Espressif Rust Toolchain](https://github.com/esp-rs/rust-build) (Xtensa), installed with `espup install`
- **ESP-IDF**: a full ESP-IDF environment activated with `source <esp-idf>/export.sh`
- **Shell**: export `RUSTUP_TOOLCHAIN=esp` before building ESP32 artifacts
- **Linker wrapper**: `cargo install ldproxy`
- **Flashing tool**: `espflash` 3.3.0 or newer

`matchbox esp32-doctor` checks these.

---

## Crate Overview

The Cargo workspace has nine members. Two more crates live in the repository but are not workspace members.

| Crate | Path | Description |
| :--- | :--- | :--- |
| **matchbox** | `/` | The CLI. Its `build.rs` builds the runner stubs and embeds them into the binary. |
| **matchbox_vm** | `crates/matchbox-vm` | The execution engine: bytecode, fibers, the built-in functions, the JIT. |
| **matchbox_compiler** | `crates/matchbox-compiler` | Parses BoxLang and BXM templates and emits bytecode. |
| **matchbox-macros** | `crates/matchbox-macros` | Procedural macros for BIF registration and Native Fusion. |
| **matchbox_server** | `crates/matchbox-server` | The web server behind `--serve`. Also a standalone `matchbox_server` binary with `--app`. |
| **matchbox_lambda_runner** | `crates/matchbox-lambda-runner` | The AWS Lambda runtime, packaging and `lambda deploy` support. |
| **matchbox_wasi_http_runner** | `crates/matchbox-wasi-http-runner` | The `wasm32-wasip2` component that `--target wasi-http` fills with a webroot. |
| **matchbox_tui** | `crates/matchbox-tui` | Terminal UI classes, registered when the `bif-tui` feature is on. |
| **matchbox_utility** | `crates/matchbox-utility` | The shared `--verbose` logging switch. |
| **matchbox-embedded** | `crates/matchbox-embedded` | Route manifests for embedded web apps on ESP32. |
| **matchbox_runner** | `crates/matchbox-runner` | The runner stub. It has its own `[workspace]`, so it is built by `build.rs` and not as a workspace member. |
| **matchbox-esp32-runner** | `crates/matchbox-esp32-runner` | The ESP32 firmware runner. Listed under `exclude` in the root `Cargo.toml`. |

The stub is the VM plus a loader that finds bytecode appended to its own file. Measured sizes for the 0.11.0 sources on Linux x86_64 with default CLI features:

| Stub file | Bytes |
| --- | --- |
| `runner_stub_x86_64-unknown-linux-gnu` | 4,751,936 |
| `runner_stub_wasm32-unknown-unknown.wasm` | 2,647,829 |
| `runner_stub_wasip1.wasm` | 2,110,700 |

A `--target native` executable for a three-line script was 4,752,169 bytes, the stub plus 217 bytes of bytecode and a 16 byte footer. Sizes change with the features, the Rust version and the release, so measure your own output.

---

## Cargo features

`matchbox` (root crate):

| Feature | Default | What it does |
| :--- | :---: | :--- |
| `bif-io` | yes | File system functions (`fileRead`, `directoryList`, and others). |
| `bif-http` | yes | The `http` function, using `reqwest` with rustls. |
| `bif-crypto` | yes | Hashing and encryption functions. |
| `bif-cli` | yes | Terminal helpers such as `cliGetArgs`, `cliExit` and `cliClear`. |
| `bif-jni` | yes | Java interoperability through a host JVM. |
| `jit` | yes | The Cranelift JIT in the interpreter. See [JIT](../building-and-deploying/jit.md). |
| `server` | yes | `--serve` and `--target wasi-http`. Pulls in `matchbox_server` and `tokio`. |
| `bif-zip` | no | Zip, tar and compression functions. |
| `bif-datasource` | no | PostgreSQL datasources, configured in `matchbox.toml`. |
| `bif-tui` | no | Registers the `matchbox_tui` native classes. |
| `qoq` | no | Query of queries, in the VM and compiler. |
| `debugger` | no | Compiles the VM's debug API (`start_debug_chunk`, `debug_step_source_line`, and others) for embedders. The CLI has no flag that uses it. |
| `cross-compile` | no | Makes `build.rs` also build runner stubs for the other targets and embed them. Release CLIs use it. |

The `matchbox_compiler` crate has two features: `bxm` (default) and `qoq`. `bxm` is declared but nothing in the code is gated on it, so BXM template parsing is always available. The `server` feature does not add a BXM transpiler.

The `matchbox_vm` crate has no default features. It adds `js` (the browser host bridge) and `js-host-abi` to the list above. The root crate has no `js` feature.

### Which features reach the stubs

`build.rs` forwards only `bif-io`, `bif-http`, `bif-zip`, `bif-crypto` and `bif-cli` to the runner stubs, and adds `js` to the `web` stub. A `--target native` executable therefore has no JIT, no JNI and no datasources, whatever the CLI itself was built with. Feature flags such as `bif-datasource` apply to `matchbox app.bxs` only.

---

## Build Examples

### 1. Local CLI (default)

```bash
cargo build --release
```

### 2. CLI with cross-platform runners

Builds runner stubs for Linux (x86_64, i686, aarch64, armv7), Windows (x86_64 and aarch64 MSVC, x86_64 GNU) and macOS (x86_64, aarch64), where the toolchain for each is available. On a Linux host the macOS stubs are skipped unless they already exist in `stubs/`.

```bash
cargo build --release --features cross-compile
```

### 3. Slimmer CLIs

The `matchbox_server` crate always enables `jit`, `bif-jni`, `bif-datasource`, `bif-zip`, `bif-crypto`, `bif-cli`, `bif-http` and `bif-io` on `matchbox_vm`. Enabling the root `server` feature therefore turns all of them back on. `cargo tree -e features` shows `cranelift-jit`, `jni`, `postgres` and `axum` in the dependency tree for `--no-default-features --features server,bif-io,bif-http`.

To leave the server, JIT, JNI and datasources out, do not enable `server`:

```bash
cargo build --release --no-default-features --features bif-io,bif-http
```

`cargo tree` for that command shows none of `cranelift-jit`, `jni`, `postgres` or `axum`. With this build `--serve` fails with `Server feature not enabled in this build.`

To drop only the JIT, keep every default feature except `jit` and `server`:

```bash
cargo build --release --no-default-features --features bif-io,bif-jni,bif-crypto,bif-cli,bif-http
```

The JIT cannot be switched off while `server` is on. These two recipes were checked by inspecting the resolved dependency tree, not by building them.

### 4. Browser runtime for source strings

The root `matchbox` crate cannot be used for this. It depends unconditionally on `matchbox_lambda_runner`, which pulls in `zip`, `xz2` and the C library `lzma-sys`. `cargo build --release --target wasm32-unknown-unknown --lib --no-default-features --features matchbox_vm/js` failed here while compiling `lzma-sys` (`'stdlib.h' file not found`). The root crate also has no `js` feature, so the `--features js` command from earlier versions of this page does not exist.

Build a small crate that depends on `matchbox_compiler` and `matchbox_vm` instead, as the playground does (next section). For a ready-made browser module of your own program, use `matchbox --target js`.

### 5. ESP32 stub (directly)

```bash
source /path/to/esp-idf/export.sh
export RUSTUP_TOOLCHAIN=esp
cd crates/matchbox-esp32-runner
cargo build --release --target xtensa-esp32s3-espidf
```

`--target esp32` expects the same environment to be active. Run MatchBox from that activated shell. The build script only builds ESP32 stubs when the `esp` toolchain is installed, and only rebuilds existing ones when `MATCHBOX_REBUILD_EMBEDDED_STUBS` is `1`, `true` or `yes`. It builds stubs for `esp32`, `esp32s3` and `esp32c3`; other chips fall back to a local build.

---

## The playground build

The in-browser playground (published at `/playground/`) does not build the root crate. Its `playground-runtime` crate depends on `matchbox_compiler` and `matchbox_vm` with `default-features = false`, so it has no BIF libraries, no JIT and no JavaScript host bridge, and runs programs with the synchronous `interpret_sync` entry point. It is built with `bash tools/build-runtime.sh`, which compiles for `wasm32-unknown-unknown` and runs `wasm-bindgen 0.2.114`, using `RUSTFLAGS='--cfg getrandom_backend="wasm_js"'` and a 128 MiB memory cap.

---

## Release builds

CI publishes one full CLI per supported OS/architecture using `--features cross-compile`, plus Linux `amd64`/`arm64` Docker images built from those same binaries. Custom source builds do not create additional published distribution variants.

Pushes to `master` publish the base version in `Cargo.toml`. After publication succeeds, CI advances `develop` to the next minor version and starts its snapshots. See [releases and downloads](../reference/releases.md) for tags, channels, metadata, and checksum verification.

## Understanding `build.rs`

`build.rs` in the root directory runs on every `cargo build`. It:

1. Records the Git commit and build date for `--version`. `MATCHBOX_BUILD_VERSION` overrides the version string.
2. Builds `crates/matchbox-runner` for the host and for the WebAssembly targets, into the `stubs/` directory. A stub is rebuilt when a runner or VM source file is newer than it.
3. With `cross-compile`, builds the other desktop stubs.
4. Writes `src/stubs.rs`, a table of `include_bytes!` entries for every stub that exists. This file is regenerated by each build, so a local build leaves it modified in the working tree.

Embedded stubs let `matchbox` package standalone targets without downloading a runtime. Not every target has a stub: ESP32 deployments need the local toolchain above.

## Optimization profiles

The release profile in `Cargo.toml` is tuned for size:

```toml
[profile.release]
opt-level = "z"     # Optimize for size
lto = true          # Link Time Optimization
codegen-units = 1   # Maximum optimization
panic = "abort"     # Smallest error handling
strip = true        # Remove symbols
```

For heavy server workloads you can set `opt-level = 3` locally to trade binary size for speed.
