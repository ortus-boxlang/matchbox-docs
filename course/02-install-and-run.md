---
title: Install and run
summary: Install MatchBox with MVM, then run and compile a script on your own machine.
icon: phosphor-duotone:download-simple
tags: [course]
---

# Install and run

The browser is great for learning, but real projects live on your machine. This lesson installs MatchBox and runs the same script from a terminal.

## Install with MVM

MVM is the MatchBox Version Manager. It installs releases side by side and switches between them. On Linux and macOS:

```sh
curl -fsSL https://raw.githubusercontent.com/ortus-boxlang/matchbox-quick-installer/main/install/install.sh | bash
```

On Windows PowerShell:

```powershell
irm https://raw.githubusercontent.com/ortus-boxlang/matchbox-quick-installer/main/install/install.ps1 | iex
```

Restart your shell, then install and activate the latest MatchBox:

```sh
mvm install latest
mvm use latest
matchbox --version
```

The last command prints the installed version and build information. If `matchbox` is not found, run `mvm doctor`. The [installation page](../getting-started/installation.md) covers other options.

## Run a script

Save this as `hello.bxs`. Press **Run** to try it here first.

```boxlang title="hello.bxs"
function greet( name ) {
    return "Hello, #name#!";
}

println( greet( "world" ) );
```

Output:

```text
Hello, world!
```

Then run it from your terminal:

```sh
matchbox hello.bxs
```

MatchBox parses the file, compiles it to bytecode and runs it, all in one step.

## Compile to bytecode

You can compile once and run the result many times:

```sh
matchbox --build hello.bxs
matchbox hello.bxb
```

A `.bxb` file holds compiled bytecode. It is not a standalone program, so the machine that runs it needs a MatchBox of a compatible version. Lesson 9 shows how to build something that needs no install at all.

## Try it

Run `matchbox --version`, then run your own script. If you get stuck, the [quick start](../getting-started/quick-start.md) walks through the same steps.
