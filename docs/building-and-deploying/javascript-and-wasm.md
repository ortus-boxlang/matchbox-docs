---
title: JavaScript and WebAssembly
description: Compile BoxLang to an ES module for the browser with --target js, and call its functions through BoxLangVM.
---

Use `--target js` to package a BoxLang application or library for the browser.

| Mode | Command | Status |
| :--- | :--- | :--- |
| **JS module (AOT)** | `--target js` | Works. Ship a compiled app or library as an ES module. |
| **WASI (experimental)** | `--target wasi` / `--target wasm` | For WASI hosts, not browsers. See [WASI deployment](wasm-container.md). |
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
| `my_lib.wasm` | The MatchBox runtime. |
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

- An `async` export for each top-level BoxLang function. Use `await` to collect its result.
- `ready`, a promise that resolves when the runtime and bytecode are loaded.
- `BoxLangVM`, `run_bytecode`, `initSync` and the default `init` function from the runtime.

In a browser the module also registers `window.MatchBox.modules["my_lib"]`, `window.MatchBox.ready("my_lib")`, `window.MatchBox.State(moduleName, options)`, and fires a `matchbox:ready` event on `window` with `detail.module` set to the module name.

These modules are intended for browsers. Other JavaScript hosts may need their own WebAssembly loading integration.

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

## Mode 2: WASI (experimental)

Use `--target wasi` for workloads outside the browser. See [WASI deployment](wasm-container.md) for experimental host support.

Native Fusion supports browser builds through `--target js`; Rust code and dependencies must support that target.

---

## Mode 3: Calling functions and loading bytecode

`BoxLangVM` is exported by every `--target js` module. It runs bytecode produced by `matchbox --build`:

```js
import { ready, BoxLangVM } from './my_lib.js';

await ready;                        // runtime is initialised

const bytes = new Uint8Array(await (await fetch('./other.bxb')).arrayBuffer());

const vm = new BoxLangVM();
vm.load_bytecode(bytes);            // runs the script's top level

// call() is async: it returns a Promise, and several calls can be in flight
const message = await vm.call("greet", ["BoxLang"]);
console.log(message);               // Hello, BoxLang!
```

`BoxLangVM` exposes `load_bytecode(bytes)`, asynchronous `call(name, args)`, the lower level `start(name, args)`, `poll(handle)` and `pump()`, `vm_ptr()` and `set_host_id(id)`. Each `call` runs as its own fiber, so calls can overlap; see [Concurrency](#concurrency).

### Compiling source strings in the browser

The packaged browser module runs bytecode. To compile source text dynamically, include `matchbox_compiler` in a custom WebAssembly runtime. This site's `playground-runtime/` is an example; see [source builds](../getting-started/building-matchbox.md#browser-runtime-for-source-strings).

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

### Network requests with `fetch`

`js.fetch(...)` works like the browser function. A JS Promise has `.get()`, which waits for the Promise and pauses only the BoxLang call that used it. The page and other calls keep running.

```boxlang
function getJson(url) {
    var res = js.fetch(url).get()
    return res.json().get()
}

function postJson(url, token, payload) {
    var res = js.fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json", "Authorization": "Bearer " & token },
        body: serializeJSON(payload)
    }).get()
    return res.json().get()
}
```

A network error throws, so `try`/`catch` works as usual.

### Reading a stream

Read a response body chunk by chunk to show output as it arrives. `new js.TextDecoder()` turns the bytes into text:

```boxlang
function streamText(url) {
    var res = js.fetch(url).get()
    var reader = res.body.getReader()
    var decoder = new js.TextDecoder()
    var all = ""
    while (true) {
        var chunk = reader.read().get()
        if (chunk.done) {
            break
        }
        all &= decoder.decode(chunk.value)
    }
    return all
}
```

### `new js.X(...)`

`new js.TextDecoder()`, `new js.URL(address)` and `new js.a.b.Thing(1)` construct JavaScript objects. A class path that starts with `js.` always means the browser global, never a BoxLang class file, so do not name a class folder `js`. Named and spread arguments are not supported for these constructors.

### Event handlers

A BoxLang function can be an event listener. It keeps running in the VM that created it, even when several MatchBox modules or several instances of one module are on the page.

```boxlang
function wire(host) {
    var input = js.document.createElement("input")
    var btn = js.document.createElement("button")
    var log = js.document.createElement("div")
    btn.textContent = "send"
    btn.addEventListener("click", function (e) {
        log.textContent = "you said: " & input.value
    })
    host.shadowRoot.append(input)
    host.shadowRoot.append(btn)
    host.shadowRoot.append(log)
}
```

### Web components

Exported functions are ordinary `async` functions, so a custom element can call them from its lifecycle methods:

```js
import * as mod from './widget.js';

class BxWidget extends HTMLElement {
    constructor() { super(); this.attachShadow({ mode: 'open' }); }
    async connectedCallback() { await mod.wire(this); }
}
customElements.define('bx-widget', BxWidget);
```

Strings such as `"<ul>"` can sit on their own line in a script, so building markup in BoxLang works.

### Concurrency

Every call to an exported function runs as its own fiber in one VM. Calls can overlap: two streams read at the same time finish in about the time of one, and an event handler runs while a stream is in flight. A call that is waiting on `.get()` does not block the others. Each exported function returns a Promise that resolves with the result or rejects with the error.

`BoxLangVM.call(name, args)` is the same as an exported function. `start(name, args)`, `poll(handle)` and `pump()` are the lower level calls for hosts that drive the VM themselves.

### `http()` in the browser

With the `bif-http` feature, `http()` uses `fetch` and returns the same result as native MatchBox: call `.get()` and deserialize the JSON.

```boxlang
function status(url) {
    var response = jsonDeserialize(http({ url: url, method: "POST", headers: { "Content-Type": "application/json" }, body: "{}" }).get())
    return response.status
}
```

The result has `status`, `headers` (lowercase names, each value an array), `body` and `file_content`. A 4xx or 5xx status returns normally. A network failure or timeout throws.

| Option | In the browser |
| :--- | :--- |
| `url`, `method`, `headers`, `body` | Supported. |
| `timeout` | Supported, in seconds, default `30`, `0` disables it. |
| `redirect` | Only `true`. `redirect: false` throws, because `fetch` hides the redirect response. |
| `path` | Throws. The browser cannot write files. |
| `connectionTimeout`, `noProxy`, `ipv4Only` | Throw. The browser does not expose them. |

The browser's own rules still apply: the server must allow the request with CORS, and `headers` only lists the response headers that CORS exposes. `http()` returns the whole body, so for streaming use `js.fetch` as shown above.

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
