---
title: JavaScript and WebAssembly
description: Compile BoxLang to an ES module for the browser with --target js, and call its functions through BoxLangVM.
---

# JavaScript + WebAssembly

MatchBox compiles BoxLang for the browser with `--target js`. This page was checked against MatchBox 0.11.0, including a run of the generated module in Node 22.

| Mode | Command | Status |
| :--- | :--- | :--- |
| **JS module (AOT)** | `--target js` | Works. Ship a compiled app or library as an ES module. |
| **Raw `.wasm`** | `--target wasm` | Does not work. See the known issue below. |
| **Runtime (source strings)** | your own crate | Needs a small Rust crate, described below. |

---

## Mode 1: JavaScript ES module (AOT)

MatchBox compiles your script to bytecode and writes an ES module that loads a generic MatchBox runtime (`.wasm`) and the bytecode.

### Prerequisites

The `wasm-bindgen` command line tool, version 0.2.114, must be on `PATH`, or its location set in `WASM_BINDGEN`. Without it the command stops with `wasm-bindgen not found. Install wasm-bindgen-cli or set WASM_BINDGEN.`

### Compile

```bash
matchbox --target js my_lib.bxs
```

```text
Standalone JS module produced: ./my_lib.js
```

The command writes four files next to the script, or next to `--output`:

| File | Contents |
| :--- | :--- |
| `my_lib.js` | The ES module. The compiled bytecode is embedded in it as a base64 string. |
| `my_lib.wasm` | The MatchBox runtime. It does not contain your program. For a three-line script it was 1,937,302 bytes, and `my_lib.js` was 50,747 bytes. |
| `my_lib.d.ts`, `my_lib_bg.wasm.d.ts` | TypeScript declarations for the runtime. |

`--output dist/my_lib.js` creates `dist/` and names the files from the stem `my_lib`.

### Use in HTML

```html
<!DOCTYPE html>
<html>
<head><title>BoxLang App</title></head>
<body>
<script type="module">
    import { greet, calculate } from './my_lib.js';

    const result = await greet("Developer");
    document.body.textContent = result;
</script>
</body>
</html>
```

### Runtime contract

The module starts loading as soon as it is imported. It exports:

- One `async` function per top-level BoxLang function. Every call returns a promise, so always `await` it. With `function greet(name)` and `function calculate(a, b)` in the script, `await greet('Developer')` returned `Hello, Developer!` and `await calculate(6, 7)` returned `42` in Node 22.
- `ready`, a promise that resolves when the runtime and bytecode are loaded.
- `BoxLangVM`, `run_bytecode`, `initSync` and the default `init` function from the runtime.

In a browser the module also registers `window.MatchBox.modules["my_lib"]`, `window.MatchBox.ready("my_lib")`, `window.MatchBox.State(moduleName, options)`, and fires a `matchbox:ready` event on `window` with `detail.module` set to the module name.

This browser contract is the supported path. Importing the module outside a browser worked in Node 22 only after the compiled `.wasm` was supplied through a global the module checks (`globalThis.__matchboxWasmModule`), so treat non-browser use as unsupported.

### Exporting functions

Functions declared at the top level of the script are exported. The exporter collects every top-level function declaration and does not look at access modifiers.

```boxlang
function greet(name) {
    return "Hello, " & name & "!"
}

function calculate(a, b) {
    return a * b
}
```

---

## Mode 2: Raw WASM binary

!!! warning "Known issue: `--target wasm` does not produce a usable module"
    `matchbox --target wasm my_app.bxs` prints `WASM binary produced: my_app.wasm`, but it builds the file from the WASI runner stub (not the browser stub that `--target js` uses) and appends bytes that are not a valid WebAssembly section. In Node 22, `WebAssembly.compile` rejects the result with `unknown section code #0xea`. Use `--target js` for the browser. Details and a WASI workaround are in the [CLI reference](../reference/cli.md#wasi-targets).

---

## Mode 3: Calling functions and loading bytecode

`BoxLangVM` is exported by every `--target js` module. It runs bytecode produced by `matchbox --build`:

```js
import { ready, BoxLangVM } from './my_lib.js';

await ready;                        // runtime is initialised

const bytes = new Uint8Array(await (await fetch('./other.bxb')).arrayBuffer());

const vm = new BoxLangVM();
vm.load_bytecode(bytes);            // runs the script's top level

// call() is async: it returns a Promise
const message = await vm.call("greet", ["BoxLang"]);
console.log(message);               // Hello, BoxLang!
```

`load_bytecode(bytes)`, `call(name, args)` (async), `pump()` and `vm_ptr()` are the methods on `BoxLangVM`. There is no `load_source` method. In Node 22, loading `lib.bxb` into a new `BoxLangVM` and awaiting `vm.call('greet', ['BoxLang'])` returned `Hello, BoxLang!`.

### Compiling source strings in the browser

The `.wasm` produced by `--target js` contains the VM but not the compiler, so it can only run bytecode. To compile and run source text in the browser you need a WebAssembly build that includes `matchbox_compiler`. The root `matchbox` crate defines `run_boxlang(source)` for `wasm32`, but the root crate could not be built for `wasm32-unknown-unknown` in testing (see [Building from source](../getting-started/building-matchbox.md#4-browser-runtime-for-source-strings)). The supported pattern is the one this site's playground uses: a small `cdylib` crate that depends on `matchbox_compiler` and `matchbox_vm` with `default-features = false`, parses and compiles each snippet, and runs it with the synchronous `interpret_sync`. Its source is `playground-runtime/` in the documentation repository.

---

## JavaScript Interop from BoxLang

When BoxLang code is running inside the browser JS target, it can access a browser bridge through the `js` global:

```boxlang
// DOM access
title = js.document.title
js.document.getElementById("output").innerText = "Updated by BoxLang"

// Browser APIs
js.alert("Hello!")
js.console.log("Logged from BoxLang")

// Location
url = js.location.href
```

The important current rule is:

- Plain JS values cross the boundary as BoxLang values: strings, booleans, null, numbers, arrays, and plain objects.
- Browser host objects stay as JS handles: DOM nodes, `document`, `window`, functions, and other browser-native objects.

That keeps state/data interop predictable while preserving access to real browser objects.

> `js.*` is a browser-only surface. Using it in a native build throws a runtime error.

---

## Serving Locally for Development

Browsers block WASM file loading over `file://`. Serve your project with any local HTTP server:

```bash
npx serve .
# or
python3 -m http.server 8080
```

Then open `http://localhost:8080` in your browser.

---

## Production Deployment

The WASM output files (`*.js` + `*.wasm`) can be deployed to any static hosting service:

- **CDN**: upload to S3, Cloudflare R2, or a similar object store.
- **Vercel / Netlify**: drop the files into your project's output directory.

Ensure your server sets the correct `Content-Type` for `.wasm` files:

```
Content-Type: application/wasm
```

Most modern hosts handle this automatically.
