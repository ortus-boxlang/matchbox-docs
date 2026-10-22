---
title: Modules
description: Add reusable BoxLang code, settings and native functionality to an application.
icon: phosphor-duotone:puzzle-piece
---

# Modules

A module is a reusable BoxLang package. It can provide functions, classes, components and settings, with an optional native backend for MatchBox.

## Using a module

Install a MatchBox-compatible package in `boxlang_modules/`, or select its directory explicitly:

```sh
matchbox --module ./libs/greeter app.bxs
```

Project modules take precedence over shared packages in `BOXLANG_HOME/modules/`. Package dependencies and explicit paths can also be declared in [project configuration](../configuration.md).

## Package layout

```text
greeter/
  box.json
  ModuleConfig.bx
  bifs/
  models/
  components/
```

`ModuleConfig.bx` defines the module's settings and lifecycle:

```boxlang
class {
    function configure() {
        settings = { greeting: "Hello" };
    }

    function onLoad() {}
    function onUnload() {}
}
```

At runtime, MatchBox configures modules and loads their dependencies before calling `onLoad()`. `onUnload()` handles cleanup during normal shutdown. Application settings can override module defaults.

Read a module's settings with:

```boxlang
println( getModuleSettings( "greeter" ).greeting );
```

## Native functionality

Compatible modules can ship prebuilt native plugins, so consumers do not need a Rust toolchain. The plugin must match the destination platform; native code runs with the application's permissions.

For application-owned Rust code, use [Native Fusion](../../building-and-deploying/native-fusion.md). Modules that depend on JVM libraries need a compatible MatchBox backend rather than assuming those libraries are present.

For plugin authoring details, see the MatchBox repository's [native module guide](https://github.com/ortus-boxlang/matchbox/blob/develop/docs/native-plugins.md).
