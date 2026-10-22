---
title: Language reference
description: Explore BoxLang syntax, classes, collections, errors and host integrations in MatchBox.
icon: phosphor-duotone:book-bookmark
---

# Language reference

Use these pages to explore language features and common patterns. Start with the [course](../../course/index.md) for a guided introduction, or browse the [function reference](../functions/index.md) for built-in functions.

| Page | Covers |
| --- | --- |
| [Operators](operators.md) | Arithmetic, comparison, bitwise, `castAs`, `instanceOf`, elvis and safe navigation |
| [Destructuring, spread and ranges](destructuring-spread-ranges.md) | `{ a, b } = s`, `...`, `1..5` |
| [Sets](sets.md) | `set{}`, `setNew`, algebra operators, member functions |
| [Classes](classes.md) | `init`, inheritance, interfaces and properties |
| [Scopes](scopes.md) | `variables`, `arguments`, closures, web scopes |
| [Error handling](error-handling.md) | `try`, typed `catch`, `finally`, `throw` and `rethrow` |
| [Async and futures](async-and-futures.md) | `runAsync`, `then`, errors, browser behavior |
| [Templates (.bxm)](templates-bxm.md) | Markup, expressions and script blocks |
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

For an overview of runtime and target differences, see [BoxLang compatibility](../../differences-from-boxlang.md).
