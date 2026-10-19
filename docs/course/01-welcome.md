---
title: Welcome to MatchBox
summary: What MatchBox is, how it relates to BoxLang, and your first script, run in the browser.
icon: phosphor-duotone:hand-waving
tags: [course]
---

# Welcome to MatchBox

**BoxLang** is a dynamic language for building applications. It normally runs on the JVM. **MatchBox** is a second runtime for the same language, written in Rust. It compiles your code to bytecode and runs it on a small virtual machine, which lets BoxLang go places the JVM does not fit: a single native executable, a browser tab, a serverless function, even a microcontroller.

You write the same language either way. What changes is where it runs and what you can reach from it. MatchBox complements the JVM runtime, it does not replace it. See [what is MatchBox](../getting-started/what-is-matchbox.md) and [differences from BoxLang](../differences-from-boxlang.md) for the details.

## Your first script

Press **Run this in your browser** under the code. Nothing is installed and nothing is sent to a server: the compiler and the VM run on your device.

```boxlang title="hello.bxs"
function greet( name ) {
    return "Hello, #name#!";
}

println( greet( "MatchBox" ) );
```

Output:

```text
Hello, MatchBox!
```

A few things to notice:

- `.bxs` is the file extension for a BoxLang **script**.
- `#name#` inside a double-quoted string inserts the value of `name`. You will see more of this in lesson 3.
- `println` writes a line to the console.

## Try it

Change `"MatchBox"` to your own name and run it again. Then add a second `println` call that greets someone else.

## What you will learn

| Lesson | Topic |
|---|---|
| 2 | Install MatchBox and run a file on your machine |
| 3 | Values, strings and operators |
| 4 | Arrays and structs, and how to loop over them |
| 5 | Functions, arrow functions and closures |
| 6 | Classes and objects |
| 7 | Errors and control flow |
| 8 | Running work at the same time |
| 9 | Building a native executable |
| 10 | Where to go next |
