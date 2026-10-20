---
title: Configuration
description: Config files, module discovery and Cargo features that control how MatchBox compiles and runs, checked against MatchBox 0.11.0.
icon: phosphor-duotone:sliders-horizontal
---

# Configuration

The MatchBox CLI has no global config file. Behaviour comes from command-line options, [environment variables](cli.md#environment-variables) and three project files that it looks for in the current working directory:

| Path | Used for |
| --- | --- |
| `matchbox.toml` | Module paths and datasources. |
| `box.json` | Module dependencies and the `esp32` block. |
| `modules/`, `boxlang_modules/` | Module directories that are scanned automatically. |

All three are resolved against the directory you run `matchbox` from, not the directory of the script. Running `matchbox /path/to/app.bxs` from another directory does not see `/path/to/modules`. A `.bxb` file skips module discovery because its modules were resolved when it was compiled.

## Modules

Module discovery runs whenever MatchBox compiles source. It collects module directories from four places, in this order. A later source replaces an earlier entry with the same name.

1. `box.json` `dependencies` and `devDependencies`. A value that starts with `.` or contains `/` or `\` is a path, relative to the current directory, if it exists. Any other value is ignored and the dependency name is looked up in `modules/<name>` and then `boxlang_modules/<name>`.
2. `matchbox.toml` `[modules.<name>]` tables.
3. Every subdirectory of `modules/` and `boxlang_modules/` that contains a `ModuleConfig.bx`, unless a module with that name was already found.
4. Each `--module <dir>` option. The module name is the directory's name.

Every module must contain a `ModuleConfig.bx`; otherwise the build stops with `Module '<name>' at '<path>' is missing ModuleConfig.bx`.

```text
modules/greeter/
  ModuleConfig.bx
  bifs/shout.bxs
```

```boxlang
class ModuleConfig {
    function configure() {
        this.settings = { greeting: "Howdy" };
        return this.settings;
    }
    function onLoad() {}
}
```

What MatchBox does with a module:

- The source of every `bifs/*.bxs` and `bifs/*.bx` file is added to the standard library prelude, so the functions inside are callable by name.
- `ModuleConfig.bx` is run once at compile time in a separate VM: `onLoad()` first, then `configure()`. The returned struct is baked into the program and read back with `getModuleSettings("<name>")`. If the lifecycle fails, MatchBox prints a warning and the settings are an empty struct.
- A `matchbox/Cargo.toml` inside the module marks it as a native module and switches the build to [Native Fusion](../building-and-deploying/native-fusion.md).

With the module above in `modules/greeter/`, this script run from the project directory printed `HI!` and `Howdy`:

```boxlang
println(shout("hi"));
println(getModuleSettings("greeter").greeting);
```

The same script run from another directory failed with `Can only call functions.`, because `modules/` was not found. With `--module ./mymod` the settings name is `mymod`, not `greeter`, so `getModuleSettings("greeter")` returned `null`.

## matchbox.toml

```toml
[modules.greeter]
path = "mymod"          # relative to the working directory, or absolute

[datasources.main]
driver = "postgresql"   # "postgres" is accepted too
host = "localhost"      # default
port = 5432             # default
database = "app"
username = "app"
password = "secret"
maxConnections = 10     # default
```

`driver`, `database`, `username` and `password` are required in each `[datasources.*]` table. Datasources are registered only when a source file is run (not when it is built) and only by a CLI built with the `bif-datasource` Cargo feature, which is off by default. The only driver is PostgreSQL; another `driver` value prints `Warning: datasource '<name>' has unknown driver '<driver>', skipping.`

## box.json

Module dependencies are read as described above. For ESP32 builds the CLI also reads an `esp32` block:

```json
{
  "esp32": {
    "board": "xiao-esp32s3-sense",
    "psram": true,
    "webPort": 8080,
    "wifi": {
      "ssid": "my-network",
      "password": "my-password",
      "hostname": "matchbox-device"
    }
  }
}
```

All keys are optional. The CLI passes them to the ESP32 runner build as `MATCHBOX_ESP32_BOARD`, `MATCHBOX_ESP32_WEB_PORT`, `MATCHBOX_ESP32_WIFI_SSID`, `MATCHBOX_ESP32_WIFI_PASSWORD` and `MATCHBOX_ESP32_WIFI_HOSTNAME`. `"psram": true` enables PSRAM, as does setting `MATCHBOX_ESP32_PSRAM` to any value. `box.json` is only parsed for the `esp32` block when the target is `esp32`. See the [ESP32 guide](../building-and-deploying/esp32.md).

## Cargo features

These apply when you build MatchBox from source. See [Building MatchBox](../getting-started/building-matchbox.md#cargo-features) for the table of features, their defaults and the slim-build recipes.
