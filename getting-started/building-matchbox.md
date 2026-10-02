# Building MatchBox from Source

This guide covers how to clone, configure, and build custom versions of MatchBox. MatchBox is designed to be highly modular, allowing you to include or exclude features based on your deployment needs.

## Cloning the Repository

MatchBox uses Git for version control. Clone the repository to your local machine:

```bash
git clone https://github.com/ortus-boxlang/matchbox.git
cd matchbox
```

---

## Prerequisites

To build MatchBox, you need the [Rust toolchain](https://rustup.rs/).

### Standard Build
- **Rust**: 1.85+ (2024 Edition)
- **Target**: `rustup target add wasm32-wasip1` (required for the default runner stub)
- **Target**: `rustup target add wasm32-wasip2` (required for WASI HTTP/component builds)

### Web & WASM Build
- **Target**: `rustup target add wasm32-unknown-unknown`
- **Tool**: `cargo install wasm-bindgen-cli --version 0.2.114`

### ESP32 Build (Optional)
- **Toolchain**: [Espressif Rust Toolchain](https://github.com/esp-rs/rust-build) (Xtensa)
- **Command**: `espup install`
- **ESP-IDF**: Install a full ESP-IDF environment and activate it with `source <esp-idf>/export.sh`
- **Shell**: Export `RUSTUP_TOOLCHAIN=esp` before building ESP32 artifacts
- **Linker Wrapper**: `cargo install ldproxy`
- **Flashing Tool**: `espflash` 3.3.0+

---

## Crate Overview

The MatchBox workspace is divided into several specialized crates:

| Crate | Path | Description |
| :--- | :--- | :--- |
| **matchbox** | `/` | The primary entry point. Orchestrates compilation and provides the CLI. |
| **matchbox-vm** | `crates/matchbox-vm` | The core execution engine. Handles bytecode, fibers, and BIFs. |
| **matchbox-compiler** | `crates/matchbox-compiler` | Parses BoxLang source and emits MatchBox bytecode. |
| **matchbox-server** | `crates/matchbox-server` | A high-performance web server optimized for BoxLang. |
| **matchbox-runner** | `crates/matchbox-runner` | A minimal "stub" (~500KB) used to create standalone native/WASM binaries. |
| **matchbox-macros** | `crates/matchbox-macros` | Procedural macros for BIF registration and Native Fusion. |
| **matchbox-esp32-runner** | `crates/matchbox-esp32-runner` | Specialized runner for ESP32 microcontrollers. |

---

## Build Features

You can customize your build using Cargo feature flags.

### Core Features
- `jit`: Enables the Cranelift-based Just-In-Time compiler (Desktop only).
- `server`: Includes the built-in web server and BXM transpiler.
- `cross-compile`: Instructs `build.rs` to attempt building cross-platform runner stubs and embed them in the full CLI.

### Built-in Function (BIF) Features
MatchBox allows you to toggle specific BIF libraries to reduce binary size:

- `bif-io`: File system access (`fileRead`, `directoryList`, etc.).
- `bif-http`: Network requests (`http`).
- `bif-crypto`: Cryptographic functions (`hash`, `encrypt`).
- `bif-zip`: Zip file manipulation.
- `bif-cli`: Terminal colors and interactive CLI utilities.
- `bif-jni`: Java Interoperability (requires a host JVM).
- `bif-datasource`: SQL Database connectivity (PostgreSQL).

---

## Build Examples

### 1. Local CLI (Default)
Builds the VM, compiler, REPL, and default features for your current architecture. This is a source-build configuration, not a separate published "slim" distribution.
```bash
cargo build --release
```

### 2. CLI with cross-platform runners
Builds the full developer tool with available cross-platform runner stubs.
> **Note**: Requires the relevant cross-compilation toolchains. ESP32 stub publication is currently disabled; ESP32 deployments may require a local runner build and an activated ESP-IDF environment.
```bash
cargo build --release --features cross-compile
```

### 3. Custom CLI feature set
Builds a CLI with webroot serving and a reduced feature set. The separate `matchbox_server` crate remains available for source-built app servers, but standalone server executables are no longer release downloads.
```bash
# Disable default features (JIT, JNI, etc.) and only enable what you need
cargo build --release --no-default-features --features server,bif-io,bif-http
```

### 4. WASM Runtime
To build the WASM engine for browser use:
```bash
cargo build --target wasm32-unknown-unknown --release --features js
wasm-bindgen --target web --out-dir ./pkg target/wasm32-unknown-unknown/release/matchbox.wasm
```

### 5. ESP32 Stub (Directly)
To build just the ESP32 runner for a specific chip:
```bash
source /path/to/esp-idf/export.sh
export RUSTUP_TOOLCHAIN=esp
cd crates/matchbox-esp32-runner
cargo build --release --target xtensa-esp32s3-espidf
```

MatchBox's `--target esp32` path assumes the same environment is active and now prefers the activated ESP-IDF
toolchain over the managed per-project tool installation flow. Run MatchBox from that activated shell rather than mixing it with other ESP export scripts.

---

## Release builds

CI publishes one full CLI per supported OS/architecture using `--features cross-compile`, plus Linux `amd64`/`arm64` Docker images built from those same binaries. Custom source builds do not create additional published distribution variants.

Pushes to `master` publish the base version in `Cargo.toml`. After publication succeeds, CI advances `develop` to the next minor version and starts its snapshots. See [releases and downloads](../reference/releases.md) for tags, channels, metadata, and checksum verification.

## Understanding `build.rs`

MatchBox uses a sophisticated `build.rs` script in the root directory. When you run `cargo build`, it:
1. Detects your Git commit and build date for `--version` output. CI supplies `MATCHBOX_BUILD_VERSION` to include the snapshot suffix and/or build number.
2. Navigates into `crates/matchbox-runner`.
3. Compiles the runner for target architectures.
4. Embeds these runner binaries directly into the `matchbox` CLI as bytes.

Embedded runner stubs let `matchbox` package supported standalone targets without downloading a separate runtime. Do not assume every target has a prebuilt stub: browser packaging and ESP32 deployments can still require their documented local toolchains.

## Optimization Profiles

MatchBox defines a release profile in `Cargo.toml` optimized for binary size:

```toml
[profile.release]
opt-level = "z"     # Optimize for size
lto = true          # Link Time Optimization
codegen-units = 1   # Maximum optimization
panic = "abort"     # Smallest error handling
strip = true        # Remove symbols
```

If you prefer execution speed over binary size (e.g., for heavy server workloads), you can override this by setting `opt-level = 3` in your local environment.
