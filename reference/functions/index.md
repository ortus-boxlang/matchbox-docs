---
title: Function Reference
summary: Built-in functions and member functions, grouped by purpose.
description: Built-in functions and member functions, grouped by purpose.
icon: phosphor-duotone:function
order: 1
---

# Function reference

Explore built-in functions and member methods by topic. These pages are generated from runtime registrations; availability depends on the target and build. For broader language documentation, see [BoxLang](https://boxlang.ortusbooks.com/).

## How to read the tables

| Column | Meaning |
| --- | --- |
| Function | The function name. Member-only entries are written `type.name`. |
| Forms | How to call it. `name( ... )` is the global form and `type.name( ... )` is the member form on a value of that type, for example `string.ucase( ... )`. A literal `...` means the argument list is not recorded here. Functions written in BoxLang show their real parameters. |
| Gate | `always`, or the cargo feature or crate that must be enabled for the function to exist. |
| Notes | Behavior notes. Text appears only where it was checked against the source or by running MatchBox. |

Function names are not case sensitive; the pages show the usual spelling.

## Pages

| Page | Entries | Member forms |
| --- | --- | --- |
| [Strings](strings.md) | 81 | 69 |
| [Arrays](arrays.md) | 72 | 56 |
| [Structs](structs.md) | 33 | 14 |
| [Numbers and Math](numbers-and-math.md) | 43 | 23 |
| [Dates and Time](dates-and-time.md) | 47 | 57 |
| [Lists](lists.md) | 35 | 29 |
| [Queries and Datasources](queries-and-datasources.md) | 43 | 1 |
| [Types and Decisions](types-and-decisions.md) | 36 | 16 |
| [System and CLI](system-and-cli.md) | 50 |  |
| [Files and I/O](files-and-io.md) | 44 |  |
| [JSON, YAML, TOML and XML](data-formats.md) | 27 | 15 |
| [Encoding and Crypto](encoding-and-crypto.md) | 18 | 4 |
| [Async and Futures](async-and-futures.md) | 28 | 11 |
| [Sets](sets.md) | 21 | 18 |
| [Cache and Watchers](cache-and-watchers.md) | 16 |  |
| [Locales and Currency](i18n.md) | 13 | 1 |
| [HTTP and Network](http.md) | 3 |  |
| [ESP32](esp32.md) | 29 |  |
| [Native Object Methods](objects.md) | 226 |  |
| [Member functions](members.md) | 314 | |

## Counts

- Global functions: 610. 532 are native Rust functions, 55 are written in BoxLang (the prelude), 8 exist in both, 3 are handled by the compiler (println, print and echo; echo also exists as a native function) and 12 are TUI class names.
- ESP32 firmware functions: 29 (included in the global count above).
- Member functions on built-in types: 314.
- Native object methods: 226.
- Internal helper functions that only back the member table (`boxSet*`, `arrayAppendMember`) are not listed: 31.

## Feature gates

A gate names the build feature or runner a function needs. Features can also be enabled by dependencies; see [source builds](../../getting-started/building-matchbox.md#cargo-features) for custom builds. The browser playground includes only `always` functions.

Other features change behavior without adding functions:

- `qoq` (not default): enables query of queries. `queryExecute` with `dbtype: "query"` returns the error "QoQ support is not enabled in this build" without it.
- `bif-jni` (default): `createObject( "java", ... )` creates Java objects. Without it the call fails with "Java interoperability is not enabled in this build."

## Not available in the browser playground

143 of the 610 global functions are not available in the playground build: the gated functions, including the ESP32 functions and the TUI classes. Common examples are `hash`, `encrypt`, `fileRead`, `directoryList`, `http`, `queryNew`, `queryExecute`, `cliRead` and `exit`. Member functions whose target function is gated are unavailable there too, for example `string.hash( ... )`.

## Prelude functions called as members

The prelude is the part of the standard library written in BoxLang. Tree-shaking removes unused functions when compiling an application. For dynamically selected functions, use `--keep name` or `--no-shaking` when needed.

## Regenerating

```bash
node tools/gen-bif-reference.mjs ../matchbox            # rewrite docs/data/functions.json and these pages
node tools/gen-bif-reference.mjs ../matchbox --check    # exit 1 when the committed files are stale
```
