---
title: Build and Run
description: Run BoxLang scripts, compile portable bytecode, and package applications for a target.
order: 6
icon: phosphor-duotone:terminal
---

# Build and run an application

MatchBox supports a quick interpreter loop and multiple deployment targets. Start by running a source file, then select a build based on the target host.

## Run a BoxLang script

```boxlang title="hello.bxs"
function greet(name) {
    return "Hello, #name#!";
}

println(greet("world"));
```

```sh
matchbox hello.bxs
```

## Use the REPL

Run `matchbox` without a filename to start an interactive session. The REPL is useful for trying expressions and language features before putting them in a file.

## Build for a target

```sh
matchbox --build hello.bxs          # portable bytecode; requires a MatchBox runner
matchbox --target native hello.bxs  # native executable for the current host
matchbox --target js hello.bxs      # JavaScript + WebAssembly module output
matchbox --target wasm hello.bxs    # raw WebAssembly output
```

These commands and available targets depend on the installed MatchBox distribution and build. Check `matchbox --help` and the corresponding [target guides](../index.md#choose-where-matchbox-runs). A successful compilation does not validate execution on a different host.
