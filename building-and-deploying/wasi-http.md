---
title: WASI HTTP (experimental)
description: Package a webroot of static files and BoxLang templates as a single WebAssembly component that handles HTTP requests.
icon: phosphor-duotone:cube
---

# WASI HTTP

!!! warning "Experimental"
    WASI HTTP packaging and host compatibility are still evolving. Test the component on your intended host before deployment.

`--target wasi-http` turns a webroot directory into one `.wasm` component that exports the WASI HTTP incoming handler. The component serves the same files and templates as [`matchbox --serve`](web-server.md), with the webroot embedded in the binary.

This is different from [`--target wasi`](wasm-container.md), which packages a single script that runs once and exits.

## Build

```sh
matchbox --target wasi-http --webroot ./site --output site.wasm
```

| Flag | Default | Meaning |
| :--- | :--- | :--- |
| `--webroot <dir>` | `.` | Directory to package. |
| `--output <file>` | `<webroot>.wasm` | Output file. |

`--webroot` and `--output` are the only flags this target reads. Nothing is listening after the build; the component is run by a host that supports WASI HTTP.

The build:

1. Reads `boxlang.json` from the webroot for `rewrites` and `rewriteFileName`. A `websocket` block is ignored and the build prints a warning.
2. Compiles every `.bxm` and `.bxs` file in the webroot. A syntax error stops the build.
3. Embeds every file under the webroot, including `boxlang.json`, together with the compiled templates.
4. Patches that payload into a prebuilt `matchbox_wasi_http_runner` component and writes the result.

## Limits

| Limit | Detail |
| :--- | :--- |
| Size | The payload must fit in a 4 MiB region of the runner (4 MiB minus 12 bytes). A larger webroot fails with "exceeds the embed capacity". Every file in the directory counts, so keep build output, `node_modules` and similar out of the webroot. |
| Native code | The build fails if the webroot has a `native` directory, a `boxlang_modules/*/native` directory, or a `.bx`, `.bxm` or `.bxs` file that contains the text `java:` or `rust:`. |
| WebSockets | Not supported. |
| Sessions | Kept in memory of the running instance. They are not shared between instances and are lost when the instance stops. |

## Behavior

The component runs the same engine as the webroot server, so these rules apply unchanged:

- `GET`, `HEAD` and `POST` are handled; other methods return `405`.
- `.bxm` and `.bxs` files are rendered as templates, and a directory is answered by its `index.bxm` or `index.bxs`.
- Path segments that start with `.` return `403`.
- The `url`, `form`, `cookie`, `session` and `cgi` scopes are populated as described in [Web server](web-server.md#scopes-in-templates).

Differences from `--serve`:

- Requests are read from the WASI HTTP request, so a POST body with `application/x-www-form-urlencoded` is available in `form`.
- A failure in the engine returns `500` with the error text as `text/plain`.
- `HEAD` responses carry no body.

## Requirements

The CLI builds the runner component when it is not already present. It looks for `target/wasm32-wasip2/release/matchbox_wasi_http_runner.wasm` inside the MatchBox source tree it was compiled from, and otherwise runs

```sh
cargo build --release --target wasm32-wasip2 -p matchbox_wasi_http_runner
```

in that tree. The build therefore needs the source checkout, a Rust toolchain and the target (`rustup target add wasm32-wasip2`). A CLI downloaded as a release binary cannot find that tree unless the checkout exists at the path it was built from.

The component's exported interface is `wasi:http/incoming-handler` (the `proxy` world of the `wasi` crate). Use a host that implements it to run the file.
