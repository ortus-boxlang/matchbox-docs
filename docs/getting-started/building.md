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

Run `matchbox` without a filename to start an interactive session. The prompt is `bx> `, each line is evaluated on its own (there is no multi-line mode, history or tab completion), and `exit`, `quit` or Ctrl+D leaves it.

## Build for a target

```sh
matchbox --build hello.bxs          # portable bytecode: Compiled to hello.bxb
matchbox --target native hello.bxs  # native executable: Native binary produced: hello
matchbox --target js hello.bxs      # ES module + WebAssembly runtime for browsers
```

The `--target wasm` and `--target wasi` values exist but do not produce a usable module in MatchBox 0.11.0; see the [CLI reference](../reference/cli.md#wasi-targets). The targets available also depend on how your MatchBox was built; `--target <rust-triple>` needs a CLI built with `cross-compile`. See the full [CLI reference](../reference/cli.md) and the [target guides](../index.md#choose-where-matchbox-runs). A successful compilation does not validate execution on a different host.
