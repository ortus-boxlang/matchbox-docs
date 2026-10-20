---
title: CLI Reference
description: Every MatchBox command, option, target, output rule, environment variable and exit code, checked against MatchBox 0.11.0.
icon: phosphor-duotone:terminal-window
---

# MatchBox CLI

This page was checked against the `matchbox` CLI at version 0.11.0 (source `src/lib.rs`, plus runs of a release build on Linux x86_64). `matchbox --help` prints the same option list in short form.

The CLI parses its arguments by hand, not with an argument-parsing library. That has consequences, described under [Argument handling](#argument-handling), that you should know before passing flags to your own scripts.

```text
matchbox [options] [file.bxs|file.bxm|file.bxb|directory] [script arguments]
matchbox esp32-doctor
matchbox lambda invoke <path> --event <event.json>
matchbox lambda deploy <path> --function <name> --bootstrap <path> [options]
```

## Common commands

| Command | Purpose |
| --- | --- |
| `matchbox` | Start the [REPL](#repl). |
| `matchbox app.bxs` | Compile in memory and run a script. |
| `matchbox app.bxm` | Run a template file. |
| `matchbox app.bxb` | Run precompiled bytecode. |
| `matchbox src/` | Run a directory, see [Directories](#directories). |
| `matchbox --build app.bxs` | Write bytecode to `app.bxb`. |
| `matchbox --target native app.bxs` | Write a standalone executable for the current host. |
| `matchbox --target js app.bxs` | Write an ES module plus a `.wasm` file for browsers. |
| `matchbox --serve --webroot www` | Serve a directory over HTTP. |
| `matchbox --version` | Print the version, commit and build date. |

## Options

| Option | Takes a value | Meaning |
| --- | --- | --- |
| `-h`, `--help` | no | Print usage and exit. |
| `-v`, `--version` | no | Print version information and exit. |
| `--verbose` | no | Print `[LOG]` lines on stderr. Only the `--target js` packaging step emits them in 0.11.0. |
| `--build` | no | Compile to bytecode instead of running. |
| `--target <value>` | yes | Package for a target, see [Targets](#targets). Requires a file or directory, except `wasi-http`. |
| `--output <path>` | yes | Output file path for `--build`, `--target` builds and `wasi-http`. |
| `--keep <a,b,c>` | yes | Comma-separated list of standard library (prelude) functions that tree-shaking must keep. |
| `--no-shaking` | no | Include the whole standard library prelude instead of only the functions the program uses. |
| `--no-std-lib` | no | Leave the standard library prelude out entirely. |
| `--strip-source` | no | Remove embedded source text from the compiled output. Errors still report file and line. |
| `--module <dir>` | yes | Load a module directory. Repeatable. See [Configuration](configuration.md#modules). |
| `--serve` | no | Start the built-in web server. Requires a build with the `server` feature, which is on by default. |
| `--host <address>` | yes | Server bind address. Default `127.0.0.1`. Read only with `--serve`. |
| `--port <number>` | yes | Server port. Default `8080`. Read only with `--serve`. |
| `--webroot <path>` | yes | Server root, and the input of `--target wasi-http`. Default `.`. |
| `--chip <name>` | yes | ESP32 chip: `esp32` (default), `esp32s2`, `esp32s3`, `esp32c3`, `esp32c6`, `esp32h2`. |
| `--flash` | no | ESP32: flash the device after building. |
| `--full-flash` | no | ESP32: flash the full firmware, not only the bytecode. Implies `--flash`. |
| `--watch` | no | ESP32: rebuild and flash on file changes. Implies `--flash`, and the first build is a full flash. |
| `--esp32-web` | no | ESP32: build the embedded routed web runtime. |
| `--fast-deploy` | no | Deprecated. `--flash` is already a bytecode-only flash for ESP32. |

The ESP32 flags are covered in the [ESP32 guide](../building-and-deploying/esp32.md).

### Examples

```sh
matchbox --build hello.bxs
```

```text
Compiled to hello.bxb
```

```sh
matchbox --build --strip-source hello.bxs --output small.bxb
```

```text
Compiled to small.bxb
```

For the three-line `hello.bxs` used in the [quick start](../getting-started/quick-start.md), the bytecode file is 217 bytes, or 137 bytes with `--strip-source`.

`--build` does not create missing directories. `matchbox --build hello.bxs --output out/x.bxb` fails with `Error: No such file or directory (os error 2)` when `out/` does not exist.

Tree-shaking only affects the prelude, which is the part of the standard library written in BoxLang. A script that calls `uCase` and `listLen` compiled to 240 bytes by default and 23,014 bytes with `--no-shaking`.

## Targets

`--target` selects which runner stub MatchBox appends your bytecode to, or which packaging path to use.

| Value | Output | Printed line | Status in 0.11.0 |
| --- | --- | --- | --- |
| `native` | `<name>` (`<name>.exe` on Windows) | `Native binary produced: hello` | Works. Marked executable on Unix. |
| a Rust triple, for example `aarch64-unknown-linux-gnu` | same as `native` | `Native binary produced: hello` | Works only if that stub is embedded. Release CLIs are built with `--features cross-compile`. See below. |
| `js` | `<name>.js`, `<name>.wasm`, `<name>.d.ts`, `<name>_bg.wasm.d.ts` | `Standalone JS module produced: ./hello.js` | Works. Needs `wasm-bindgen` 0.2.114 on `PATH`, or set `WASM_BINDGEN`. |
| `wasm` | `<name>.wasm` | `WASM binary produced: hello.wasm` | Broken, see the known issue below. |
| `wasi` | `<name>.wasm` | none | Fails, see the known issue below. |
| `wasi-http` | `<webroot>.wasm`, or `--output` | `WASI HTTP component produced: site.wasm` | Produces a component. Not run here. See below. |
| `esp32` | `<name>.elf`, or flashes with `--flash` | | See the [ESP32 guide](../building-and-deploying/esp32.md). |

Any other value is treated as a Rust triple and looked up in the embedded stubs. If it is not embedded, the CLI stops with:

```text
Error: runner stub for target 'aarch64-unknown-linux-gnu' is not embedded
```

A `.bxb` input is always run, never packaged: `matchbox --target native hello.bxb` runs `hello.bxb` and writes no executable. Compile from `.bxs` or `.bxm` source to package.

### Native and cross-compiled output

`--target native` copies the runner stub for the current host, appends the serialized bytecode, an 8-byte length and the 8-byte marker `BOXLANG\x01`, then writes the result.

```sh
matchbox --target native hello.bxs
./hello
```

```text
Native binary produced: hello
Hello, world!
```

`--target x86_64-unknown-linux-gnu` produced the same executable on an x86_64 Linux build because that triple is the host. Other triples require a CLI built with the `cross-compile` Cargo feature, which makes `build.rs` build and embed more runner stubs. The list of triples is on the [native builds](../building-and-deploying/native-builds.md#build-for-other-hosts) page.

A native executable does not parse MatchBox flags. Everything on its command line goes to the script, including `-v` and `--help`.

Runner stub sizes, measured on 0.11.0 for Linux x86_64 with the default features: the native stub is 4,751,936 bytes (4.5 MiB) and `hello.bxs` produced a 4,752,169 byte executable. Details are on the [native builds](../building-and-deploying/native-builds.md) page.

### JavaScript output

```sh
matchbox --target js hello.bxs
```

```text
Standalone JS module produced: ./hello.js
```

The run wrote `hello.js` (50,747 bytes), `hello.wasm` (1,937,302 bytes) and the two `.d.ts` files. The bytecode is embedded in `hello.js` as base64. `--output dist/hello.js` creates `dist/` and uses `hello` as the file stem. Without `wasm-bindgen` the command stops with `wasm-bindgen not found. Install wasm-bindgen-cli or set WASM_BINDGEN.` See [JavaScript and WebAssembly](../building-and-deploying/javascript-and-wasm.md).

### WASI targets

!!! warning "Known issue: `wasm` and `wasi` in 0.11.0"
    Both container targets were run on a build with the `wasm32-wasip1` stub embedded.

    - `--target wasi` fails with `WASI stub is missing the BOXLANG_EMBED sentinel. Rebuild the runner stub: cargo build --release --target wasm32-wasip1 -p matchbox_runner`. The runner crate contains no such sentinel, so rebuilding the stub does not help.
    - `--target wasm` prints `WASM binary produced: hello.wasm` and writes the stub followed by 236 extra bytes. Node 22 refuses to compile that file: `CompileError: WebAssembly.compile(): unknown section code #0xea`. The appended custom section is written without a section header, so the module is invalid.
    - The unmodified stub does run. Under Node's WASI implementation with the current directory preopened, it ran `app.bxb` and printed `Hello, world!`; with no `app.bxb` it exits 1 with `No embedded bytecode or app.bxb found`. The runner looks for bytecode appended to its own file, which a WASI host cannot read, and then falls back to `app.bxb`.

    A workaround that produced a working module: put an empty `native/` directory next to the script. That switches `--target wasi` to the [Native Fusion](../building-and-deploying/native-fusion.md) path, which compiles a standalone module with the bytecode inside it. `matchbox --target wasi hello.bxs --output out/hello.wasm` printed `WASI Fusion binary produced: out/hello.wasm`, wrote 8,669,526 bytes after about 50 seconds, and the file printed `Hello, world!` under Node's WASI. This path needs a Rust toolchain with the `wasm32-wasip1` target and the MatchBox source tree the CLI was built from, and the output directory must already exist.

    No `wasmtime` was available, so nothing was run in a standalone WASI runtime. For the browser, use `--target js`.

If a build without the `wasm32-wasip1` target installed is used, `--target wasm` and `--target wasi` both fail earlier with `runner stub for target 'wasi' is not embedded`.

### WASI HTTP

`--target wasi-http` does not take a script. It packages a webroot into the prebuilt `matchbox_wasi_http_runner` component:

```sh
matchbox --target wasi-http --webroot www --output site.wasm
```

```text
WASI HTTP component produced: site.wasm
```

The run produced a 6,503,104 byte file from a one-page webroot. It was not executed. The webroot payload is limited to 4,194,292 bytes; larger roots fail with `WASI HTTP webroot payload (... bytes) exceeds the embed capacity (4194292 bytes).` The command needs the `server` feature and the `wasm32-wasip2` Rust target. It reads `target/wasm32-wasip2/release/matchbox_wasi_http_runner.wasm` under the source checkout the CLI was compiled from and runs `cargo build` there if the file is missing, so it works from a source build, not from a downloaded binary.

## Running code

### Files

| Extension | Behaviour |
| --- | --- |
| `.bxs` and other source files | Parsed and compiled in memory, then run. |
| `.bxm` | Parsed as a template, then run. |
| `.bxb` | Deserialized and run. Module discovery is skipped. |

### Directories

If the argument is a directory, MatchBox runs the first of `index.bxs`, `main.bxs` or `Application.bx` that exists in it, in that order. With none of them the command fails with `No entry point found in directory`.

```sh
matchbox app
```

```text
from index
```

### Script arguments

Everything after the file name is passed to the script. Read it with `cliGetArgs()`, which returns `{ options, positionals }`.

```sh
matchbox args.bxs first second --name=bob --flag
```

!!! warning "Known issue: first argument dropped in interpreted runs"
    `cliGetArgs()` always skips the first element of the argument list, because a compiled executable passes its own path first. An interpreted run passes only the script arguments, so the first one is lost. With the command above, `args.bxs` printing `cliGetArgs().positionals` sees one positional (`second`). The same script built with `--target native` and run as `./args first second --name=bob --flag` sees both. Until this is fixed, pass a placeholder as the first argument when running with `matchbox`.

### REPL

`matchbox` with no file starts a REPL:

```text
BoxLang REPL (Rust)
Type 'exit' or 'quit' to exit.
bx> x = 1 + 2
=> 3
bx> println(x)
3
bx> exit
```

The REPL reads one line at a time from standard input. It has no multi-line mode, history or tab completion. `exit`, `quit` or end of input (Ctrl+D) leaves it. Combining `--build` or `--target` with no file is an error: `No filename provided for build/target`.

## Argument handling

The CLI looks for flags with `args.contains(...)` over the whole command line, including your script's arguments:

- `-h`, `--help`, `-v` and `--version` are matched anywhere. `matchbox app.bxs -v` prints the version and does not run `app.bxs`. Likewise `--build`, `--verbose`, `--serve` and the other flags are honoured wherever they appear.
- The file is the first argument that does not start with `--` and is not the value of `--target`, `--keep`, `--output`, `--module` or `--chip`. The words `native`, `wasm`, `wasi`, `wasi-http`, `js` and `esp32` are also never taken as the file.
- Unknown `--flags` are ignored without a message. A single-dash flag other than `-h` and `-v` is not recognised as a flag: `matchbox -x app.bxs` treats `-x` as the file name and fails.
- `--port`, `--host` and `--webroot` values are only read with `--serve` (`--webroot` is also read for `wasi-http`). A `--port` value that is not a number silently becomes `8080`.
- Native executables skip all of this, see [Native and cross-compiled output](#native-and-cross-compiled-output).

To pass `-v` or `-h` to a script, build it with `--target native` and run the executable.

## Server

```sh
matchbox --serve --host 0.0.0.0 --port 8080 --webroot www
```

```text
MatchBox Server listening on http://0.0.0.0:8080
Web root: www
Rewrites: Disabled
```

A `www/index.bxm` containing `<bx:output>#1+1#</bx:output>` returned `2` from `/index.bxm`, and `www/a.txt` was served as a static file. The server is a separate crate, `matchbox_server`. From the full CLI only `--host`, `--port` and `--webroot` are available. See the [web server example](../examples/web_server/README.md).

## Subcommands

### `esp32-doctor`

Checks the ESP32 toolchain: `IDF_PATH`, `idf.py`, `RUSTUP_TOOLCHAIN`, `cargo`, `cmake`, `ninja`, `ldproxy`, `espflash`, `LIBCLANG_PATH`, `ESP_IDF_ESPUP_CLANG_SYMLINK`, the three embedded ESP32 stubs and serial devices. Each line starts with `[ok]`, `[warning]` or `[fail]`. It exits 0 even when it reports `[fail]` lines, so do not use its exit code in scripts.

### `lambda`

| Command | Meaning |
| --- | --- |
| `lambda invoke <path> --event <file.json>` | Run a `Lambda.bx` file or project locally against an event and print the JSON response. |
| `lambda deploy <path> --function <name> --bootstrap <path>` | Package and deploy with the AWS CLI. Prints `Created <name>` or `Updated <name>`, then the function URL if one was requested. |

`lambda deploy` options:

| Option | Default | Meaning |
| --- | --- | --- |
| `--function <name>` | required | Function name. |
| `--bootstrap <path>` | required | Bootstrap binary to include in the zip. |
| `--arch <arm64\|x86_64>` | `arm64` | Lambda architecture. Anything else fails with `unsupported Lambda architecture`. |
| `--out <zip>` | `target/lambda/<function>.zip` | Where to write the package. |
| `--memory <MB>` | not set | Function memory. Must be a number. |
| `--timeout <seconds>` | not set | Function timeout. Must be a number. |
| `--role <arn>` | not set | Execution role. |
| `--profile <name>`, `--region <name>` | not set | AWS CLI profile and region. |
| `--public` | off | Create a function URL with no authentication. |
| `--url` | off | Create a function URL with IAM authentication. Using both `--public` and `--url` fails. |

`lambda` without `invoke` or `deploy` fails with `Missing lambda command. Expected 'invoke' or 'deploy'.` See the [AWS Lambda guide](../building-and-deploying/aws-lambda-aws-cli-setup.md).

## Environment variables

| Variable | Read by | Effect |
| --- | --- | --- |
| `MATCHBOX_DEBUG` | compiler | When set, prints `Tree-shaking: included N prelude functions` to stdout while compiling. |
| `BX_TRACE` | VM | When set, prints a `[TRACE] ip=... op=... stack=[...]` line to stderr for every instruction. Very verbose. |
| `WASM_BINDGEN` | `--target js` | Path of the `wasm-bindgen` executable. Default: `wasm-bindgen` on `PATH`. |
| `MATCHBOX_BUILD_VERSION` | `build.rs` | Overrides the version string baked into `--version`. Default: the crate version. |
| `MATCHBOX_REBUILD_EMBEDDED_STUBS` | `build.rs` | `1`, `true` or `yes` rebuilds the ESP32 stubs when building the CLI from source. |
| `BOXLANG_BYTECODE_PATH` | generated ESP32 Fusion `build.rs` | Path of the bytecode file to embed. Set by the CLI. |
| `MATCHBOX_ESP32_BOARD`, `MATCHBOX_ESP32_WEB_PORT`, `MATCHBOX_ESP32_WIFI_SSID`, `MATCHBOX_ESP32_WIFI_PASSWORD`, `MATCHBOX_ESP32_WIFI_HOSTNAME` | ESP32 runner build | Compile-time settings. The CLI sets them from the `esp32` block of `box.json`. |
| `MATCHBOX_ESP32_PSRAM` | ESP32 build | Any value enables PSRAM, as does `"psram": true` in `box.json`. |
| `MATCHBOX_EMBEDDED_ROUTE_TABLE` | ESP32 build | Route table path. Set by the CLI. |
| `IDF_PATH`, `RUSTUP_TOOLCHAIN`, `LIBCLANG_PATH`, `ESP_IDF_ESPUP_CLANG_SYMLINK` | ESP32 builds, `esp32-doctor` | Toolchain locations, see the ESP32 guide. |
| `CARGO` | Fusion builds | Cargo executable used for Native Fusion builds. Default `cargo`. |

Scripts can read any environment variable with `getSystemSetting("NAME", "default")`.

## Configuration files

MatchBox reads `matchbox.toml`, `box.json` and the `modules/` and `boxlang_modules/` directories from the current working directory, not from the script's directory. See [Configuration](configuration.md) for their contents.

## Exit codes

| Code | When |
| --- | --- |
| 0 | The script, build or REPL finished normally. Also `esp32-doctor` in every case. |
| 1 | A CLI error such as a missing file, an unknown target, a parse error or a script error that was not caught. Messages begin with `Error:` on stderr. A native executable prints `Runtime Error:` instead. |
| n | A script that calls `cliExit(n)`. |

```text
$ matchbox err.bxs
a
Error: VM Runtime Error: CustomException: boom
>    1 | println("a"); throw("boom");
```

## Files MatchBox writes

If the CLI panics, it writes the panic report and a backtrace to `panic_debug.txt` in the current directory. Native executables built from the runner stub do not install this hook.

The JIT compiler, when it compiles a loop or function, prints `[JIT] ...` status lines to stderr, not stdout. See [JIT compilation](../building-and-deploying/jit.md).
