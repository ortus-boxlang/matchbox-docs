---
title: Your First Application
description: Run a BoxLang script and package it as a standalone MatchBox executable.
order: 3
icon: phosphor-duotone:terminal
---

# Your first MatchBox application

This walkthrough uses the MatchBox CLI and a single BoxLang script. If MatchBox is not installed yet, start with [Installation](installation.md).

## Write a script

Create `hello.bxs`:

```boxlang title="hello.bxs"
function greet(name) {
    return "Hello, #name#!";
}

println(greet("world"));
```

## Run it

```sh
matchbox hello.bxs
```

Expected output:

```text
Hello, world!
```

MatchBox parses, compiles, and executes the file. The `.bxs` extension is used for BoxLang scripts.

## Build a standalone native executable

```sh
matchbox --target native hello.bxs
./hello
```

On Windows, run `hello.exe`. The output is specific to its operating system and architecture. The executable includes the MatchBox runner, so the destination does not need Java or a separate MatchBox install. Native Fusion or host integrations may introduce their own platform requirements.

## Compile portable bytecode

```sh
matchbox --build hello.bxs
matchbox hello.bxb
```

A `.bxb` file contains compiled bytecode, not a standalone runtime. Its destination still needs a compatible MatchBox runner. Keep compiler and runtime versions aligned.

To omit embedded source text:

```sh
matchbox --build --strip-source hello.bxs
```

Errors retain file and line information, but removing source reduces diagnostic context. It is not encryption or intellectual-property protection.

## Explore interactively

Start the REPL by running `matchbox` without a filename:

```boxlang
numbers = [1, 2, 3];
println(arrayMap(numbers, (n) => n * 2));
```

Continue with [language essentials](features-overview.md), browse the [CLI reference](../reference/cli.md), or choose a [deployment target](../index.md#choose-where-matchbox-runs).