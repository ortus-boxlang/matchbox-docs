---
title: Using Modules
description: Install modules, select them on the command line, and override their settings.
icon: phosphor-duotone:download-simple
---

MatchBox finds modules before your program starts. There are no imports to write: once a module is found, its functions, components and classes are available everywhere.

## Install a module

Install modules from [ForgeBox](https://forgebox.io) into your project's `boxlang_modules/` folder:

```sh
bx-module install bx-matchbox-std --local
```

`--local` installs into `./boxlang_modules/`. You can also unzip a module package into that folder yourself. Each module lives in its own folder:

```text
my-app/
  app.bxs
  boxlang.json
  boxlang_modules/
    bx-matchbox-std/
      box.json
      ModuleConfig.bx
      bifs/
```

Then run your program as usual:

```sh
matchbox app.bxs
```

## Where MatchBox looks

MatchBox collects modules from these places. For the same module, an earlier source wins.

| Source | How |
| --- | --- |
| `--module DIR` | Explicit folders on the command line |
| `box.json` dependencies | A dependency whose value is a path is loaded from that path; otherwise from `boxlang_modules/<name>` |
| `matchbox.toml` | `[modules.<name>]` entries with a `path` |
| `boxlang_modules/` | Every package folder in the project |
| `modulesDirectory` | Extra folders listed in `boxlang.json` |
| `BOXLANG_HOME/modules/` | Shared modules, when the `BOXLANG_HOME` environment variable is set |

!!! note "Shared modules"
    `bx-module install` without `--local` installs into `~/.boxlang/modules`. MatchBox reads that folder only when `BOXLANG_HOME` is set, for example `export BOXLANG_HOME=~/.boxlang`.

## Select a module folder

Use `--module` for a module that is not installed, such as one you are developing. Repeat it for several modules:

```sh
matchbox --module ../greeter --module ../stats app.bxs
```

!!! warning "Options come first"
    Like every MatchBox option, `--module` must come **before** the script file. Anything after the script is passed to your program as arguments.

Or list explicit paths in `matchbox.toml`:

```toml
[modules.greeter]
path = "./libs/greeter"
```

## Override settings

Modules declare default settings. Override them for your application in `boxlang.json`:

```json
{
    "modules": {
        "greeter": {
            "settings": { "greeting": "Howdy" }
        }
    }
}
```

Your settings are deep-merged over the module's defaults. Read them at runtime:

```boxlang
println( getModuleSettings( "greeter" ).greeting ); // Howdy
```

Turn a module off without uninstalling it:

```json
{
    "modules": {
        "greeter": { "enabled": false }
    }
}
```

Add more folders to scan with `modulesDirectory`. Relative paths are resolved from the project folder, and earlier entries win:

```json
{
    "modulesDirectory": [ "./shared/modules" ]
}
```

## Inspect loaded modules

```boxlang
println( getModuleList() );              // every loaded module
println( getModuleInfo( "greeter" ) );   // name, path, mappings, settings and more
```

`getModuleInfo()` returns an empty struct for a module that is not loaded.

## Modules in native binaries

Modules are embedded when you build. The resulting program does not need the module folders, and it never downloads anything at startup:

```sh
matchbox --module ../greeter --target native --output app app.bxs
./app
```

The same applies to `.bxb` bytecode built with `--build`. A module with a native plugin needs an artifact for the target platform. See [Native Plugins](native/index.md).

!!! note "Targets"
    Native plugins are prebuilt desktop libraries. Pure BoxLang modules work wherever MatchBox runs; modules with native plugins currently target desktop operating systems, not ESP32 or WebAssembly.
