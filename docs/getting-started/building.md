---
title: Build and Run
description: Run BoxLang scripts, compile portable bytecode, and package applications for a target.
order: 6
icon: phosphor-duotone:terminal
---

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

WASI targets are [experimental](../building-and-deploying/wasm-container.md). Cross-compilation with `--target <rust-triple>` needs an embedded runner for that platform. See the [CLI reference](../reference/cli.md) and [target guides](../index.md#targets), and test each artifact on its destination.
