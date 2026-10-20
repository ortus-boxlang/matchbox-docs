---
title: Native Builds
description: Package a BoxLang application as a standalone executable, what the runner stub contains, its measured size, and how cross-compiling works.
icon: phosphor-duotone:cpu
---

# Native builds

`--target native` writes a self-contained executable. It copies a prebuilt runner stub, which is the MatchBox VM plus a loader, and appends your compiled bytecode. It does not translate BoxLang into machine code.

## Build for the current host

```sh
matchbox --target native my_app.bxs
```

```text
Native binary produced: my_app
```

The output is `my_app` next to the script (`my_app.exe` on Windows) and is marked executable on Unix. `--output <path>` changes the name. The destination needs neither Java nor a MatchBox install. Run it with `./my_app`.

If the argument is a `.bxb` file, MatchBox runs it and writes nothing. Package from `.bxs` or `.bxm` source.

## What is in the executable

Measured with MatchBox 0.11.0 (source commit 37be346, built 2026-10-17) on Linux x86_64 with default features:

| Item | Bytes |
| --- | --- |
| Native runner stub (`stubs/runner_stub_x86_64-unknown-linux-gnu`) | 4,751,936 |
| `hello.bxs` bytecode | 217 |
| Resulting `hello` executable | 4,752,169 |

The executable is the stub, then the bytecode, an 8-byte length and an 8-byte `BOXLANG\x01` marker. The stub is built with the size-optimised release profile and only the `bif-io`, `bif-http`, `bif-crypto` and `bif-cli` libraries (plus `bif-zip` if the CLI was built with it). The size depends on those features, the Rust version and the MatchBox version, so measure your own output instead of relying on a fixed figure.

The stub has no JIT, no JNI and no datasource support, whatever features the CLI was built with. The CLI enables the JIT when it runs a script itself (`matchbox app.bxs`); the stub has none. See [JIT compilation](jit.md) and [Cargo features](../getting-started/building-matchbox.md#cargo-features).

## Running a native executable

- It does not parse MatchBox flags. Everything after its name goes to the script, including `-v` and `--help`. `./my_app first second --name=bob --flag` gives `cliGetArgs()` the positionals `first` and `second` and the options `name` and `flag`.
- A script error prints `Runtime Error: ...` to stderr and exits with code 1. `cliExit(n)` exits with `n`.
- It does not write `panic_debug.txt`; that hook belongs to the CLI.

## Build for other hosts

Cross-compiling needs no Rust target on your machine. It needs a CLI that has the other platform's stub embedded, which means a CLI built with the `cross-compile` Cargo feature. Release CLIs are built that way. Pass the Rust target triple to `--target`:

```sh
matchbox --target aarch64-unknown-linux-gnu my_app.bxs
```

The triples a `cross-compile` build tries to embed are:

- `x86_64-unknown-linux-gnu`, `i686-unknown-linux-gnu`, `aarch64-unknown-linux-gnu`, `armv7-unknown-linux-gnueabihf`
- `x86_64-pc-windows-msvc`, `aarch64-pc-windows-msvc`, `x86_64-pc-windows-gnu`
- `x86_64-apple-darwin`, `aarch64-apple-darwin`

A stub is embedded only if it built. On a Linux build host the Apple stubs are skipped unless they already exist. A CLI without the requested stub stops with:

```text
Error: runner stub for target 'aarch64-unknown-linux-gnu' is not embedded
```

That is what the default source build printed for that triple; the host triple (`x86_64-unknown-linux-gnu` on the test machine) worked and produced the same executable as `--target native`. A cross-built executable was not run on its destination in this review, so test each artifact on its destination operating system and architecture. See [Building from source](../getting-started/building-matchbox.md) for `--features cross-compile`.

## Rust interoperability

[Native Fusion](native-fusion.md) lets a native build expose Rust functions to BoxLang. It requires a Rust toolchain and the MatchBox source tree, and it builds a new executable instead of appending to the stub.
