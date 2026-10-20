---
title: Modules
description: How MatchBox 0.11.0 finds and loads modules, what a module can provide, and where the Rust modules guide in the MatchBox repository is out of date.
icon: phosphor-duotone:puzzle-piece
---

# Modules

A module is a folder with a `ModuleConfig.bx`. It can add BoxLang functions, classes and settings to a script, and optionally a native Rust crate. Modules are loaded by the `matchbox` command, not by the playground.

Everything here was run on the 0.11.0 CLI.

## Layout

```text
greetings/
  ModuleConfig.bx
  bifs/
    greet_bifs.bxs      functions added to every script
  models/
    Greeter.bxs         classes, imported through bxModules
  matchbox/
    Cargo.toml          optional native Rust crate
```

`ModuleConfig.bx` must declare a class named `ModuleConfig`:

```boxlang
class ModuleConfig {
    function onLoad() {
        println( "loading" );
    }

    function configure() {
        return { version: "1.0.0", enabled: true };
    }
}
```

At compile time MatchBox creates the class, calls `onLoad()`, then calls `configure()` and keeps the struct it returns as the module settings. Output from `onLoad()` appears once, before your script runs.

If the file uses the anonymous form `class { ... }`, as the Rust modules guide in the MatchBox repository shows, the lifecycle fails with `Warning: Module 'name': ModuleConfig.bx lifecycle error: ... Can only instantiate classes.` and the settings are empty. The `bifs/` functions still load. Name the class.

## Using a module

Given `bifs/shout.bxs`:

```boxlang
function shout( s ) {
    return ucase( s ) & "!";
}
```

and a script `t.bxs`:

```boxlang
println( shout( "hi" ) );
println( serializeJSON( getModuleSettings( "mymod" ) ) );
```

run it with the module folder:

```bash
matchbox --module ./mymod t.bxs
```

```text
loading
HI!
{"enabled":true,"version":"1.0.0"}
```

- Every `.bxs` or `.bx` file in `bifs/` is added to the script, so its functions are callable by name.
- `getModuleSettings( "mymod" )` returns the struct from `configure()`. The name is the module's folder name.
- A class in the module is imported through the `bxModules` prefix: `import bxModules.greetings.models.Greeter as Greeter;` and then `new Greeter()`. The `greetings` module in the MatchBox test suite uses this.
- A path that does not exist fails with `Module 'name': path does not exist`, and a folder without `ModuleConfig.bx` fails with `is missing ModuleConfig.bx`.

## How modules are found

MatchBox collects modules from these places, and a later source with the same folder name replaces an earlier one. All four were run.

| Order | Source | Example |
| --- | --- | --- |
| 1 | `dependencies` and `devDependencies` in `box.json` | `{ "dependencies": { "mymod": "./libs/mymod" } }` |
| 2 | `matchbox.toml` | `[modules.mymod]` then `path = "./libs/mymod"` |
| 3 | Folders in the project directory named `modules/` and `boxlang_modules/` that contain `ModuleConfig.bx` | `modules/mymod/ModuleConfig.bx` |
| 4 | `--module <path>`, repeatable | `matchbox --module ./mymod t.bxs` |

A `box.json` value that starts with `.` or contains a slash is a path. Any other value is looked up by name in `modules/` and then `boxlang_modules/`.

The Rust modules guide shows `[modules]` followed by `my-utils = "./custom/path"` in `matchbox.toml`. That form is rejected with a TOML parse error. Use the `[modules.name]` table with a `path` key.

## Native modules

A module with `matchbox/Cargo.toml` is treated as having a native Rust part. That is the Native Fusion feature. See the [native fusion example](../../examples/native_fusion/README.md) and the Rust modules guide in the MatchBox repository for the crate layout.
