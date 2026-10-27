---
title: BoxLang Compatibility
description: How MatchBox relates to BoxLang on the JVM, and what changes across deployment targets.
icon: phosphor-duotone:arrows-left-right
---

MatchBox is an independent Rust runtime for BoxLang. It shares the language's core syntax and programming model while bringing it to native binaries, browsers, WASI hosts and ESP32 devices.

## Familiar language, different runtime

You can use variables, strings, arrays, structs, functions, closures, classes, loops and error handling. MatchBox also provides built-in functions for common work such as JSON, dates, collections and file handling.

Start with the [course](course/index.md) or browse the [language reference](reference/language/index.md).

## Choose the target for your application

| Target | Best suited to |
| --- | --- |
| [Native](building-and-deploying/native-builds.md) | CLI tools, local applications and services with access to the host system. |
| [Browser](building-and-deploying/javascript-and-wasm.md) | Client-side applications and libraries, using WebAssembly and JavaScript integration. |
| [WASI](building-and-deploying/wasm-container.md) | Experimental WebAssembly workloads outside the browser. |
| [ESP32](building-and-deploying/esp32.md) | Embedded applications with device-specific APIs and resource limits. |

Native Fusion lets you add Rust code on all targets. The Rust code and its dependencies must support the chosen target.

## Host APIs and modules

The JVM runtime has direct access to Java libraries and the broader JVM ecosystem. MatchBox uses its own host integrations and native modules. A JVM library or module may need a MatchBox backend rather than running unchanged.

- [Modules](reference/language/modules.md) add shared BoxLang code and optional native functionality.
- [Java interop](reference/language/java-interop.md) is experimental and is not available in the browser.
- [Web development](building-and-deploying/web-server.md) provides templates, routes and request scopes on server builds.
- [Database access](reference/language/query-and-data.md) depends on the build and driver.

The browser playground runs locally without files, networking, Java or JIT. It is useful for learning the language, not for testing every host integration.

## Moving an application

Start with the application logic, then check its libraries and host APIs. Run a small example on the target you intend to ship, especially when moving an existing JVM application.

For changes and open bugs, use the [changelog](https://github.com/ortus-boxlang/matchbox/blob/develop/CHANGELOG.md) and [issue tracker](https://github.com/ortus-boxlang/matchbox/issues).
