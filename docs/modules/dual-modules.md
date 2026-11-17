---
title: Dual Modules
description: Ship one module package that runs on BoxLang for the JVM and on MatchBox.
icon: phosphor-duotone:arrows-split
---

A **dual module** is one package with two backends: a Java jar for the JVM and a native plugin for MatchBox. Users install the same module, at the same version, from the same zip, whichever runtime they use.

```text
bx-image/
  box.json              one identity, plus matchbox.artifacts
  ModuleConfig.bx       shared descriptor
  bifs/                 shared BoxLang BIFs (optional)
  libs/
    bx-image.jar        the JVM backend
  native/
    x86_64-unknown-linux-gnu/
      libbx_image_native.so   the MatchBox backend
```

## How each runtime reads it

| | BoxLang (JVM) | MatchBox |
| --- | --- | --- |
| `box.json` | Reads the module identity, ignores `matchbox` | Reads the identity and `matchbox.artifacts` |
| `ModuleConfig.bx` | Runs it | Runs it |
| `bifs/*.bx` | Registers them | Registers them |
| `libs/*.jar` | Loads Java BIFs and classes | Ignores them |
| Native plugin | Ignores it | Verifies, loads and registers it |

The two backends share the module's **name and its BoxLang API**: the same function names, arguments and results. They do not share Java or Rust objects.

## Keep one API

Register native BIFs with the same names and arguments as the Java ones. BoxLang code then works unchanged on both:

```boxlang
img = imageRead( "logo.svg", 256 );
img.resize( 128, 0 );
println( img.info().width );
```

When a feature exists on only one side, fail clearly instead of returning something different. For example, bx-image's native backend throws a clear error for functions it does not implement.

## Code that differs by runtime

Most modules need no runtime checks: each backend registers its own functions. When the descriptor must behave differently, check for a function only one backend registers:

```boxlang
function configure() {
    settings = { maxSize: 4096 };

    // Registered only by the native plugin.
    if ( boxRuntime.getFunctionService().hasGlobalFunction( "imageNativeVersion" ) ) {
        settings.backend = "matchbox";
    }
}
```

Avoid Java calls in the shared `ModuleConfig.bx`: they work on the JVM and fail on MatchBox.

## Test both backends with one script

Write one BoxLang test script that checks the public API, and run it on both runtimes:

```sh
# MatchBox, interpreted
matchbox --module build/module tests/contract.bxs

# MatchBox, native binary
matchbox --module build/module --target native --output contract tests/contract.bxs
./contract
```

On the JVM, run the same script with the module loaded. A shared contract keeps both backends returning the same values.

## Build one package

Build the JVM package as usual, then add the native artifacts to it:

1. Build the jar and the module folder with your normal build.
2. Build the Rust plugin for each target with `cargo build --release --target <triple>`.
3. Copy each library into the package and add its `path`, `sha256` and `abi` to `matchbox.artifacts` in the packaged `box.json`.
4. Zip the folder and publish it.

bx-image does steps 2 and 3 with a small script that Gradle calls before zipping. See [Packaging and Publishing](packaging-publishing.md).

## Example

[bx-image](https://github.com/ortus-boxlang/bx-image) is a dual module. Its MatchBox backend reads PNG, JPEG, GIF, WebP and SVG with the Rust `image` and `resvg` crates, and returns pixel rows as nested arrays through the [collections capability](native/sdk-reference.md#capabilities).
