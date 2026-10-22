---
title: BoxLang and Alpine.js
description: Define an Alpine.js data component in BoxLang through the browser js bridge.
---

# BoxLang + Alpine.js Example

This example demonstrates how to define an **Alpine.js Data Component** using 100% BoxLang code.

## How it works

1.  **Direct Access**: The BoxLang script uses `js.Alpine.data()` to register a component.
2.  **Normalization**: The BoxLang struct returned by the component function becomes the JavaScript object that Alpine uses as the component's data.
3.  **Closures**: The `increment`, `decrement` and `isEven` functions in the struct are wrapped as JS functions that Alpine can call.
4.  **Calls from HTML**: The buttons in `index.html` call `count = increment(count, step)`. The BoxLang function receives the current values and returns the new count, which Alpine assigns.

The component uses `function( initialValue = 0 ) { ... }` to provide a default initial value.

## Building the Example

You must compile the BoxLang script into a JavaScript/WASM bundle using the MatchBox CLI. The build runs the `wasm-bindgen` command-line tool, so install `wasm-bindgen-cli` (or set the `WASM_BINDGEN` variable to its path) first:

```bash
cargo install wasm-bindgen-cli
matchbox --target js counter.bxs
```

This produces:
- `counter.js`: The ES module entry point. `index.html` imports its `ready` and `registerComponent` exports.
- `counter.wasm`: The WASM binary containing the BoxLang VM and your compiled code for the browser.
- `counter.d.ts` and `counter_bg.wasm.d.ts`: TypeScript declarations.

## Running the Example

Since browsers block WASM loading from `file://` URIs, you must serve this folder using a local web server:

```bash
# Using Python
python3 -m http.server 8000

# Using Node.js (npx)
npx serve .
```

Then open `http://localhost:8000` in your browser.
