---
title: Build and ship
summary: Turn a script into bytecode or a single native executable you can hand to anyone.
icon: phosphor-duotone:package
tags: [course]
---

# Build and ship

Up to now you have run source files. MatchBox can also build them into something you can ship. This lesson uses a terminal, because a browser tab cannot create files.

Start with this script, saved as `hello.bxs`. Run it here first to be sure it works.

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

## A native executable

```sh
matchbox --target native hello.bxs
./hello
```

MatchBox prints `Native binary produced: hello`. The result is one self-contained file that contains the runtime and your compiled program. You can copy it to another machine of the same operating system and architecture and run it with no MatchBox and no JVM installed. Build on each platform you want to support, and test the result there.

## Bytecode

```sh
matchbox --build hello.bxs
matchbox hello.bxb
```

This compiles to a `.bxb` file instead. Add `--strip-source` to leave the source text out of the file. Unlike a native executable, a `.bxb` needs a compatible MatchBox on the machine that runs it.

## Where else can it run?

The same script can be built for other places. Each has its own guide:

| Target | Guide |
|---|---|
| Native executable | [Native builds](../building-and-deploying/native-builds.md) |
| Browser and JavaScript | [JavaScript and WebAssembly](../building-and-deploying/javascript-and-wasm.md) |
| Containers | [Docker image](../building-and-deploying/docker-image.md) and [WASM container](../building-and-deploying/wasm-container.md) |
| AWS Lambda | [AWS Lambda](../building-and-deploying/aws-lambda-aws-cli-setup.md) |
| Microcontrollers | [ESP32](../building-and-deploying/esp32.md) |

Targets differ in what they can reach. A browser build has no files or sockets, for example, and a microcontroller has far less memory. Check the guide for the target you pick.

## Try it

Build your own script as a native executable, run it, and check that it prints the same thing as `matchbox yourscript.bxs`.
