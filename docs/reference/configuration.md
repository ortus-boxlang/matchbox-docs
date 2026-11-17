---
title: Configuration
description: Project settings for modules, datasources and ESP32 builds.
icon: phosphor-duotone:sliders-horizontal
---

Run MatchBox from your project directory so relative paths and project settings resolve together.

| File or directory | Purpose |
| --- | --- |
| `box.json` | Package dependencies and ESP32 build settings. |
| `boxlang.json` | Application settings in the BoxLang format: mappings, module settings and web server options. |
| `matchbox.toml` | Explicit module paths and datasources. |
| `.env` | Project environment variables, loaded on every run. |
| `.matchbox.json` | Project runtime settings (logging), used instead of the home's `matchbox.json`. |
| `~/.matchbox/` | The MatchBox home: `config/matchbox.json`, `logs/` and shared directories. |
| `~/.matchbox.env` | Personal environment variables, loaded on every run. |
| `boxlang_modules/` | Project-local modules. |
| `BOXLANG_HOME/modules/` | Shared modules in the runtime home. |

Command-line options override the relevant settings for a run. See the [CLI reference](cli.md) for commands and [environment variables](cli.md#environment-variables).

## Runtime home

MatchBox creates its home on first run. The default is `~/.matchbox`; choose another with `--bx-home <dir>` or `MATCHBOX_HOME`.

```text
~/.matchbox/
  bin/  classes/  config/  global/  logs/  lib/  modules/
  config/matchbox.json
```

`config/matchbox.json` is created once and never overwritten. It uses the BoxLang `boxlang.json` format, so comments are allowed and `${matchbox-home}` and `${user-dir}` expand in string values. MatchBox reads the first of these that exists:

1. `--bx-config <file>`
2. `MATCHBOX_CONFIG`
3. `.matchbox.json` in the working directory
4. `<home>/config/matchbox.json`

A file named with the flag or variable must exist. Keys MatchBox does not use yet are ignored.

`matchbox.json` holds runtime settings. Mappings, module settings and web server options stay in `boxlang.json` next to your project.

| Key | Default | Purpose |
| --- | --- | --- |
| `debugMode` | `false` | Raises the log level to `DEBUG`. |
| `logging.logsDirectory` | `${matchbox-home}/logs` | Where log files go. |
| `logging.rootLevel` | `WARN` | `ERROR`, `WARN`, `INFO`, `DEBUG`, `TRACE` or `OFF`. |
| `logging.defaultEncoder` | `text` | `text` or `json`. |
| `logging.maxFileSize` | `100MB` | Size that rotates `matchbox.log`. |
| `logging.maxLogDays` | `90` | Days to keep rotated files. `0` keeps them. |
| `logging.totalCapSize` | `5GB` | Cap for all log files; the oldest rotated files go first. |

```json
{
  "logging": { "rootLevel": "INFO", "defaultEncoder": "json" }
}
```

The runtime writes to `<logsDirectory>/matchbox.log`. `--verbose` and `--bx-debug` still print to the terminal. Scripts cannot write to this file yet: `writeLog()` does nothing.

The home, config and logs apply to the interpreter, the REPL, `--serve` and native binaries. They do not apply to the browser, WASM, ESP32 or Lambda targets.

If the home cannot be created or `matchbox.json` cannot be read, MatchBox prints a warning and still runs your script, without file logging. A missing `--bx-home` directory is created. A bad `--bx-home` or `--bx-config` value stops the run with an error.

## Environment files

Two files load on every run, in this order:

1. `~/.matchbox.env` for your personal defaults.
2. `.env` in the directory where you run `matchbox`.

The project file wins when a key is in both, and file values win over the operating system environment. With `--serve`, `.env` in the web root loads too.

```text
# ~/.matchbox.env
DB_HOST=localhost

# .env
DB_HOST=staging.example.com
```

On Windows the user file is `%USERPROFILE%\.matchbox.env`. A `MATCHBOX_HOME` or `MATCHBOX_CONFIG` line in these files is honored, so a project can choose its own home.

Each line is `KEY=VALUE`. Lines starting with `#` are comments and quotes around a value are optional. Read values with `getSystemSetting("DB_HOST", "localhost")`. Keep real secrets out of source control and add `.env` to `.gitignore`.

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
