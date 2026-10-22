---
title: Configuration
description: Project settings for modules, datasources and ESP32 builds.
icon: phosphor-duotone:sliders-horizontal
---

# Configuration

Run MatchBox from your project directory so relative paths and project settings resolve together.

| File or directory | Purpose |
| --- | --- |
| `box.json` | Package dependencies and ESP32 build settings. |
| `boxlang.json` | Runtime settings, including module configuration. |
| `matchbox.toml` | Explicit module paths and datasources. |
| `boxlang_modules/` | Project-local modules. |
| `BOXLANG_HOME/modules/` | Shared modules in the runtime home. |

Command-line options override the relevant settings for a run. See the [CLI reference](cli.md) for commands and [environment variables](cli.md#environment-variables).

## Modules

Install modules in `boxlang_modules/`, or select a directory explicitly:

```sh
matchbox --module ./libs/greeter app.bxs
```

A module contains `ModuleConfig.bx` and can provide BoxLang code, settings and native functionality. Configure application-specific settings in `boxlang.json`:

```json
{
  "modules": {
    "greeter": {
      "settings": { "greeting": "Howdy" }
    }
  }
}
```

See [Modules](language/modules.md) for the package layout and lifecycle.

## matchbox.toml

Use explicit module paths and datasource settings when needed:

```toml
[modules.greeter]
path = "./libs/greeter"

[datasources.main]
driver = "sqlite"
database = "app.db"
```

Database support depends on the runtime build. See [Queries and data](language/query-and-data.md) for programmatic configuration and queries.

## ESP32 settings

The `esp32` block in `box.json` configures the device build:

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

These settings are compiled into firmware. Keep real credentials out of source control. See the [ESP32 guide](../building-and-deploying/esp32.md) for toolchains and flashing.

## Cargo features

Cargo features apply when building MatchBox itself, not as application settings. See [Building MatchBox](../getting-started/building-matchbox.md#cargo-features).
