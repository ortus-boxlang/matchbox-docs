---
title: Troubleshooting
description: Common module errors in MatchBox and how to fix them.
icon: phosphor-duotone:first-aid-kit
---

## A module's functions are not found

```text
Error: VM Runtime Error: ExpressionException: Can only call functions.
```

MatchBox did not load the module. Check:

- **Option order.** `--module` must come before the script: `matchbox --module ../stats app.bxs`. Options after the script are passed to your program.
- **Location.** The module is in `boxlang_modules/<folder>/`, or selected with `--module`. Shared modules in `~/.boxlang/modules` are read only when `BOXLANG_HOME` is set.
- **Enabled.** Neither `this.enabled = false` nor `modules.<name>.enabled: false` in `boxlang.json` turns it off.
- **The descriptor.** The folder has a `ModuleConfig.bx`.

`println( getModuleList() )` shows what loaded.

## Missing dependency

```text
Error: Module greeter requires missing module helper
```

A name in `this.dependencies` is not installed or is disabled. Install it, or remove it from the list.

## Literal metadata

```text
Module dependencies must be an array literal
Module enabled metadata must be a boolean literal
```

MatchBox reads these before running module code. Write the value directly:

```boxlang
this.dependencies = [ "helper" ];   // not a variable or a function call
this.enabled = true;
```

## Class not found in a module

```text
Class bxModules.greeter.models.Counter not found
```

- The class path follows the mapping: `bxModules.<mapping>.<folders>.<Class>`. Check `getModuleInfo( "greeter" ).invocationPath`.
- Only classes inside the module folder are packaged.
- Classes in `build/`, `dist/` or `target/` at the module root are skipped.
- `interceptorService.newAndRegister()` needs the full class name, such as `bxModules.greeter.interceptors.Audit`.

## Unsupported member type

```text
Invalid or unsupported BoxMember type: <type>
```

`@BoxMember` targets a type MatchBox does not support. See the [member types](capabilities/bifs.md#member-types).

## Native artifact errors

| Error | Cause | Fix |
| --- | --- | --- |
| `No native artifact published for <target>` | The package has no library for this platform | Build and add an artifact for that target triple |
| `Published native artifact hash does not match its bytes` | The library changed after `sha256` was recorded | Recompute the SHA-256, or reinstall the package |
| `Unsupported native artifact ABI <n>` | `abi` is not `1` | Set `"abi": 1` |
| `Missing required capability: <name>` | The plugin needs a capability this MatchBox lacks | Upgrade MatchBox, or build the plugin without that requirement |

## A native function fails

- **A BoxLang exception with your message.** Your callback returned `Err(message)`, which is expected for bad input.
- **`Native plugin panicked`.** A Rust panic was caught by `guarded`. Find the panic in your code.
- **The process exits.** The plugin was built with `panic = "abort"`, or a callback was not wrapped in `guarded`. Use `panic = "unwind"` and `guarded`.
- **`Expected boolean`.** `boolean()` is strict: `"yes"` and `1` are not booleans. Pass `true` or `false`.

## Shared library not found

The plugin loads, but the OS cannot find a library it links to:

- List the library under `libraries` in the artifact.
- On Linux, link the plugin and each library with `-Wl,-rpath,$ORIGIN`, and keep file names matching their `DT_NEEDED` names.
- On macOS, use `@loader_path` install names.

## Cache problems

The cache lives in the user cache folder, such as `~/.cache/matchbox/native`. If it cannot be written, set `MATCHBOX_NATIVE_CACHE` to a writable folder. A modified cache file is rejected; delete the folder and run again.

## Hot reload

`boxModuleReload()` throws on MatchBox. Restart the program to load changes.
