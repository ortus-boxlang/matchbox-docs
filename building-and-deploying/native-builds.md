---
title: Native Builds
description: Package a BoxLang application as a standalone executable for a supported operating system and architecture.
icon: phosphor-duotone:cpu
---

# Native builds

MatchBox can produce a self-contained native executable for supported operating systems and architectures. The output bundles a MatchBox runner with compiled BoxLang bytecode; it is not a translation of every BoxLang operation into machine code.

## Build for the current host

```sh
matchbox --target native my_app.bxs
```

The command produces an executable for the current host. On macOS and Linux, run it from the current directory with `./my_app`; on Windows use `my_app.exe`. The destination does not need Java or a separate MatchBox installation for ordinary native applications.

The artifact's size depends on its runner, enabled features, application, and build configuration. Measure the release artifact you actually produce instead of relying on a fixed size estimate.

## Build for other hosts

Cross-compilation depends on a compatible runner stub, Rust target, and any required cross-linker. Use MatchBox's release assets or CI workflows for supported target combinations, and test each artifact on its destination operating system and architecture.

```sh
rustup target add x86_64-unknown-linux-gnu
cargo build --release --target x86_64-unknown-linux-gnu
```

The Cargo example builds MatchBox from source; it is not a replacement for the MatchBox CLI's application packaging command. See [Building from source](../getting-started/building-matchbox.md) for project-specific commands.

## Rust interoperability

[Native Fusion](native-fusion.md) lets native applications expose Rust functions to BoxLang. It requires a Rust toolchain and produces platform-specific builds. It is not available for browser or embedded targets unless a specific integration documents that support.
