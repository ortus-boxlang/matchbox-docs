---
title: BoxLang Compatibility
description: Understand how MatchBox differs from the BoxLang JVM runtime and how capabilities vary by target.
icon: phosphor-duotone:arrows-left-right
---

# BoxLang compatibility and target differences

MatchBox aims for compatibility with core BoxLang language behavior while using an independent Rust VM. It is not the JVM runtime packaged differently. Its supported language and built-ins continue to evolve; do not use a static checklist as a substitute for testing the MatchBox version and target you intend to ship.

Early guides can be stale. The current MatchBox repository includes a broader BIF surface, JSON and file functionality, web servers, templates, HTTP, and multiple build targets. Availability still depends on the features compiled into a build and the host runtime.

## Shared language foundations

MatchBox supports common BoxLang constructs including dynamic variables, string interpolation, control flow, functions, closures, arrays, structs, classes, interfaces, exception handling, and asynchronous primitives. See [Language Essentials](getting-started/features-overview.md) for examples.

## Capabilities vary by target

| Capability | Native | Browser / WASM | ESP32 |
| --- | --- | --- | --- |
| JVM required for core runtime | No | No | No |
| Java interop | Experimental JNI; host JVM required | No | No |
| Browser `js.*` bridge | No | Browser host only | No |
| Native HTTP futures | Available when built with `bif-http` | Successful completion is not implemented | Depends on embedded capabilities |
| Native web server | Server build | Not the native server; WASI HTTP is separate | Embedded scope only |
| Cranelift JIT | Available in supported native builds | No | No |

This table is a high-level orientation, not a guarantee for every release, runner, or build configuration. Consult the target guide and test the built artifact on the destination host.

## Libraries, APIs, and integrations

JVM libraries, Java APIs, and BoxLang modules built for the JVM do not automatically work in MatchBox. The CLI's experimental `bif-jni` feature can provide Java integration on native hosts, but applications using it require a JVM at runtime and are no longer JVM-independent. Browser and embedded builds do not provide that bridge.

Host APIs also differ. MatchBox's native [`http()`](http.md) request struct and future are distinct from BoxLang JVM's fluent HTTP client. Browser `js.*` access requires a browser host, while web scopes are provided by web runtimes rather than ordinary command-line scripts.

## Write portable code

1. Separate portable business logic from host-specific I/O and integrations.
2. Confirm that required BIFs and modules are included in the build.
3. Pin compiler and runtime versions for repeatable deployments.
4. Test the compiled artifact on the actual destination.
5. Report minimal compatibility differences in [MatchBox GitHub Issues](https://github.com/ortus-boxlang/matchbox/issues).

Review the MatchBox [changelog](https://github.com/ortus-boxlang/matchbox/blob/develop/CHANGELOG.md) and compatibility tests when evaluating a release.
