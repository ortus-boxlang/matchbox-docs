---
title: Native Builds
description: Package a BoxLang application as a standalone executable for a desktop or server.
icon: phosphor-duotone:cpu
---

# Native builds

Build a standalone executable with the MatchBox runner and your compiled BoxLang code. The destination does not need a separate MatchBox installation or Java for ordinary BoxLang execution.

## Build for the current host

```sh
matchbox --target native my_app.bxs
./my_app
```

On Windows, run `my_app.exe`. Use `--output <path>` before the source file to choose a different output name.

Package from `.bxs` or `.bxm` source. A `.bxb` file is already compiled bytecode and is run directly, not repackaged by `--target native`.

## What is in the executable

MatchBox combines a prebuilt runner, called a stub, with the application's bytecode. BoxLang still runs on the VM; it is not translated into machine code by this packaging step.

Binary size depends on the runner, enabled features and application. Host integrations and native modules can add dependencies of their own.

## Running a native executable

Pass script arguments directly to the executable:

```sh
./my_app first second --name=bob
```

Read them with `cliGetArgs()`. Use `cliExit(n)` to set an exit code; an unhandled runtime error exits with a failure status.

## Build for other hosts

Choose a Rust target triple when the CLI includes a runner for that platform:

```sh
matchbox --target aarch64-unknown-linux-gnu my_app.bxs
```

Release CLIs include cross-platform runners. Custom source builds can use the `cross-compile` feature; available runners depend on the build toolchains. See [Building MatchBox](../getting-started/building-matchbox.md).

Test the artifact on its destination operating system and architecture. Native libraries must match that platform too.

## Rust interoperability

[Native Fusion](native-fusion.md) compiles Rust code into the application alongside BoxLang. It needs Rust, the MatchBox source checkout and the toolchain for the destination target.
