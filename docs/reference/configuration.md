---
title: Configuration
description: Project settings for modules, datasources and ESP32 builds.
icon: phosphor-duotone:sliders-horizontal
---

Run MatchBox from your project directory so relative paths and project settings resolve together.

| File or directory | Purpose |
| --- | --- |
| `box.json` | Package dependencies and ESP32 build settings. |
| `boxlang.json` | Settings in the BoxLang format: mappings, module settings, web server options and logging. |
| `matchbox.toml` | Explicit module paths and datasources. |
| `.env` | Project environment variables, loaded on every run. |
| `~/.matchbox/` | The MatchBox home: `config/boxlang.json`, `logs/` and shared directories. |
| `~/.matchbox.env` | Personal environment variables, loaded on every run. |
| `boxlang_modules/` | Project-local modules. |
| `BOXLANG_HOME/modules/` | Shared modules in the runtime home. |

Command-line options override the relevant settings for a run. See the [CLI reference](cli.md) for commands and [environment variables](cli.md#environment-variables).

## Runtime home

MatchBox creates its home on first run. The default is `~/.matchbox`; choose another with `--bx-home <dir>` or `MATCHBOX_HOME`.

```text
~/.matchbox/
  bin/  classes/  config/  global/  logs/  lib/  modules/
  config/boxlang.json
```

`config/boxlang.json` is created once and never overwritten. MatchBox uses one config format, the BoxLang `boxlang.json`. Comments are allowed, and `${matchbox-home}` (also `${boxlang-home}`) and `${user-dir}` expand in string values. Three layers merge, each overriding the one before it:

1. `<home>/config/boxlang.json`: your defaults.
2. `boxlang.json` in the working directory: the project. This is the same file that holds mappings, module settings and web server options.
3. `--bx-config <file>` or `MATCHBOX_CONFIG`: this run only. The file must exist.

Objects merge key by key and any other value replaces the earlier one, so a project can change one logger's level and keep the rest. Keys MatchBox does not use yet are ignored.

If the home cannot be created or a config file cannot be read, MatchBox prints a warning and still runs your script, without file logging. A bad `--bx-home` or `--bx-config` value stops the run with an error. The home and logs apply to the interpreter, the REPL, `--serve` and native binaries. They do not apply to the browser, WASM, ESP32 or Lambda targets.

## Logging

The `logging` block follows BoxLang. A logger is a named destination: `runtime` is the runtime's own log, `application` is where `writeLog()` and `bx:log` write by default, and any other name writes `<logsDirectory>/<name>.log`.

| Key | Default | Purpose |
| --- | --- | --- |
| `debugMode` | `false` | Raises log levels to `DEBUG`. |
| `logging.logsDirectory` | `${matchbox-home}/logs` | Where log files go. |
| `logging.rootLevel` | `WARN` | Level for loggers without their own: `ERROR`, `WARN`, `INFO`, `DEBUG`, `TRACE` or `OFF`. |
| `logging.defaultEncoder` | `text` | `text` or `json`. |
| `logging.maxFileSize` | `100MB` | Size that rotates a log file (`KB`, `MB`, `GB`). |
| `logging.maxLogDays` | `90` | Days to keep rotated files. `0` keeps them. |
| `logging.totalCapSize` | `5GB` | Cap for one logger's files; the oldest rotated files go first. |
| `logging.loggers.<name>` | | `level`, `appender` (`file` or `console`) and `encoder` for one logger. |

The seeded file sets `runtime` to `INFO` and `application` to `WARN`:

```json
{
  "logging": {
    "rootLevel": "WARN",
    "loggers": {
      "runtime": { "level": "INFO" },
      "application": { "level": "WARN" },
      "orders": { "level": "INFO", "encoder": "json" }
    }
  }
}
```

Write from a script with `writeLog()` or the `bx:log` tag:

```javascript
writeLog( text = "Order #id# shipped", type = "information", log = "orders" );
```

```html
<bx:log text="Payment failed" type="error" log="orders" />
```

| Argument | Default | Meaning |
| --- | --- | --- |
| `text` | | The message. An empty message writes nothing. |
| `type` | `information` | `information`, `warning`, `error`, `fatal`, `debug` or `trace`. |
| `log` | `application` | A logger name, or an absolute path to a log file. A name cannot contain `/`, `\` or `..`. Names are case-insensitive, and `orders` and `orders.log` are the same logger, written to `orders.log` in lower case. |
| `application` | `true` | Put the application name in front of the message. |
| `file` | | Compatibility only. Used instead of `log` when set. |

Each line is written as `[application] text`, and the application is `no-application` when there is none. It is the `this.name` of an `Application.bx` next to your program. An entry is dropped when its `type` is below the target logger's level, so with the default `application` level of `WARN`, `information` and `debug` entries are not written until you lower that level. `writeLog()` and `bx:log` also work inside `--serve` requests. `--verbose` and `--bx-debug` still print to the terminal.

An unknown `type` raises `Invalid log level`. The JVM settings `appenderArguments`, `additive` and `categories` are ignored.

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
