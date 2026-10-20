---
title: Language reference
description: A reference for the BoxLang language as MatchBox 0.11.0 implements it, page by page, with what works, what does not and how it differs from BoxLang on the JVM.
icon: phosphor-duotone:book-bookmark
---

# Language reference

These pages are a reference, not a tutorial. They describe what the MatchBox 0.11.0 language does when you run it. For the basics, use the [course](../../course/index.md). For a one-page summary of what differs from BoxLang on the JVM, see [BoxLang compatibility](../../differences-from-boxlang.md). For functions, see the [function reference](../functions/index.md).

| Page | Covers |
| --- | --- |
| [Operators](operators.md) | Arithmetic, comparison, bitwise, `castAs`, `instanceOf`, elvis, safe navigation, missing word operators |
| [Destructuring, spread and ranges](destructuring-spread-ranges.md) | `{ a, b } = s`, `...`, `1..5` |
| [Sets](sets.md) | `set{}`, `setNew`, algebra operators, member functions |
| [Classes](classes.md) | `init`, inheritance, interfaces, properties, what is missing |
| [Scopes](scopes.md) | `variables`, `arguments`, closures, web scopes |
| [Error handling](error-handling.md) | `try`, `catch`, `throw`, `rethrow`, ignored catch types |
| [Async and futures](async-and-futures.md) | `runAsync`, `then`, errors, browser behavior |
| [Templates (.bxm)](templates-bxm.md) | Tags that work, stubs, bugs |
| [Modules](modules.md) | `--module`, `ModuleConfig.bx`, discovery |
| [Java interop](java-interop.md) | The JNI bridge and its limits |
| [Queries and data](query-and-data.md) | `queryNew`, datasources, query of queries, build features |

## File types

| Extension | Use |
| --- | --- |
| `.bxs` | Script. Run with `matchbox file.bxs`. |
| `.bx` | Class file, resolved by `new` and `import`. Also accepted as a module BIF file. |
| `.bxm` | Template. Run with `matchbox file.bxm` or serve with `--serve`. |
| `.bxb` | Compiled bytecode, produced by `matchbox --build`. |

`.cfm`, `.cfc` and `.cfs` files are not supported. `matchbox page.cfm` fails with a parse error.

## How these pages were checked

Each example was run on the 0.11.0 CLI. Examples with a Run button also run in the browser playground, and their shown output is checked by a test. Comparisons with BoxLang name the BoxLang version used, 1.13 on the JVM. Where a fix is being worked on in a GitHub issue or pull request, the page links it. Linked work is not a released fix.
