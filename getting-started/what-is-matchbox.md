---
title: What is MatchBox?
description: Learn how MatchBox extends the BoxLang platform to native, web, serverless, and embedded environments.
order: 2
icon: phosphor-duotone:circles-three-plus
---

# What is MatchBox?

MatchBox is an independent Rust implementation of the BoxLang language and runtime. It brings BoxLang to native binaries, browser and server-side WebAssembly, and embedded targets without requiring a JVM for its core runtime.

BoxLang is a software productivity platform for building, modernizing, and running applications, with developers and AI agents working together. MatchBox is a pillar of that platform for workloads that need a portable runtime or a target beyond the JVM.

## A runtime for more places

MatchBox includes a compiler, bytecode virtual machine, command-line tools, and target-specific runners. Depending on the build and host, it can run `.bxs` scripts, package native applications, compile for JavaScript/WebAssembly or WASI-compatible hosts, build ESP32 applications, and serve web applications.

The same language does not mean identical host APIs. Each target has its own capabilities and constraints; review [compatibility and target differences](../differences-from-boxlang.md) before relying on JVM libraries or platform-specific features.

## How it fits with BoxLang

MatchBox and the JVM runtime are distinct implementations. Shared language concepts make it possible to write portable application logic, but JVM libraries, Java interop, web services, I/O, and deployment features must be checked against the specific MatchBox target. MatchBox does not promise that every BoxLang module or JVM API is available.

## Choose a next step

- [Install MatchBox](installation.md).
- [Build your first application](quick-start.md).
- Learn about [Agentic Development](agentic-development.md) or [BoxLang AI](boxlang-ai.md).
- Browse the [deployment targets](../index.md#choose-where-matchbox-runs).
