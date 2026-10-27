---
title: CLI Reference
description: Run scripts, build applications and select deployment targets with the MatchBox CLI.
icon: phosphor-duotone:terminal-window
---

Use `matchbox` to run BoxLang, explore the REPL or package an application. Run `matchbox --help` for the options available in your installation.

```text
matchbox [options] [file or directory] [script arguments]
```

## Common commands

| Command | Purpose |
| --- | --- |
| `matchbox` | Start the REPL. |
| `matchbox app.bxs` | Run a script. |
| `matchbox page.bxm` | Run a template. |
| `matchbox app.bxb` | Run compiled bytecode. |
| `matchbox --eval 'println(1 + 2);'` | Run a short expression or script. |
| `matchbox --build app.bxs` | Write bytecode to `app.bxb`. |
| `matchbox --target native app.bxs` | Build a standalone executable. |
| `matchbox --target js app.bxs` | Build a browser JavaScript/WebAssembly module. |
| `matchbox --serve --webroot www` | Serve templates and static files. |
| `matchbox --version` | Show the version and build information. |

## Options

Put MatchBox options **before** the file or directory. Arguments after it belong to your script.

| Option | Purpose |
| --- | --- |
| `-h`, `--help` | Show usage. |
| `-v`, `--version` | Show build information. |
| `-e`, `--eval <source>` | Execute inline BoxLang code. |
| `--build` | Compile to bytecode instead of running. |
| `--target <target>` | Package for a deployment target. |
| `--output <path>` | Choose the output path. |
| `--strip-source` | Omit embedded source text from the output. |
| `--module <dir>` | Load a module directory; repeat for more modules. |
| `--keep <a,b,c>` | Keep named prelude functions during tree-shaking. |
| `--no-shaking` | Include the full prelude. |
| `--no-std-lib` | Omit the prelude. |
| `--verbose` | Enable additional build logging. |

For example:

```sh
mkdir -p dist
matchbox --build --strip-source --output dist/app.bxb app.bxs
```

Tree-shaking removes unused functions from the BoxLang-written standard library. `--strip-source` reduces diagnostic context; it is not encryption.

## Targets

| Target | Output | Guide |
| --- | --- | --- |
| `native` | Executable for the current host. | [Native builds](../building-and-deploying/native-builds.md) |
| A Rust target triple | Executable using an embedded runner for that platform. | [Cross-compilation](../building-and-deploying/native-builds.md#build-for-other-hosts) |
| `js` | JavaScript module, WebAssembly and TypeScript declarations. | [JavaScript and WebAssembly](../building-and-deploying/javascript-and-wasm.md) |
| `wasi`, `wasm` | Experimental WASI module. | [WASI deployment](../building-and-deploying/wasm-container.md) |
| `wasi-http` | Experimental HTTP component built from a webroot. | [WASI HTTP](../building-and-deploying/wasi-http.md) |
| `esp32` | Device firmware or a flash operation. | [ESP32](../building-and-deploying/esp32.md) |

Package from source (`.bxs` or `.bxm`); a `.bxb` is already compiled and is run directly. Native Fusion adds Rust code to target builds and requires the corresponding toolchain.

### WASI targets

WASI is experimental. Use `--target wasi` for a script and `--target wasi-http --webroot www` for a web application. Browser applications use `--target js`, not WASI.

## Running code

### Files and directories

A source file is compiled in memory and run. A `.bxb` file runs precompiled bytecode. Given a directory, MatchBox looks for `index.bxs`, `main.bxs` or `Application.bx`.

### Script arguments

Read script arguments with `cliGetArgs()`:

```sh
matchbox app.bxs first second --name=bob --flag
```

The result contains `positionals` and `options`. Use `--name=value` for a named value and `--flag` for a boolean option. Standalone executables receive script arguments directly.

### REPL

Start `matchbox` without a file:

```text
bx> x = 1 + 2
=> 3
bx> println(x)
3
```

The REPL reads one line at a time. Type `exit` or `quit`, or press Ctrl+D, to leave.

## Server

```sh
matchbox --serve --host 127.0.0.1 --port 8080 --webroot www
```

The defaults are host `127.0.0.1`, port `8080` and the current directory as webroot. Use `0.0.0.0` to accept connections from other machines. See [Web server](../building-and-deploying/web-server.md) for configuration and routing.

## ESP32

```sh
matchbox esp32-doctor
matchbox --target esp32 --chip esp32s3 --full-flash main.bxs
```

`--flash` updates the application, `--full-flash` writes the firmware, and `--watch` rebuilds and flashes on changes. Use `--esp32-web` for the routed web runner. See the [ESP32 guide](../building-and-deploying/esp32.md) for setup and device requirements.

## AWS Lambda

```sh
matchbox lambda invoke Lambda.bx --event event.json
matchbox lambda deploy Lambda.bx --function hello --bootstrap /path/to/bootstrap
```

Deployment uses the AWS CLI. `--public` creates an unauthenticated function URL; `--url` uses IAM authentication. See the [Lambda guide](../building-and-deploying/aws-lambda-aws-cli-setup.md) for roles, regions and packaging.

## Environment variables

| Variable | Purpose |
| --- | --- |
| `WASM_BINDGEN` | Path to the `wasm-bindgen` executable. |
| `BOXLANG_HOME` | Runtime home, including shared modules. |
| `MATCHBOX_DEBUG` | Compiler and tree-shaking diagnostics. |
| `BX_TRACE` | Detailed VM instruction tracing. |

Scripts read environment variables with `getSystemSetting("NAME", "default")`. Project settings belong in [configuration files](configuration.md).

## Exit codes

Successful execution returns `0`; an unhandled script or CLI error returns `1`. Scripts can set their own exit code with `cliExit(n)`. Diagnostic commands such as `esp32-doctor` also print findings, so read their output rather than relying only on an exit code.
