---
title: Getting Started
description: Build your first MatchBox module in pure BoxLang, then run it and ship it in a native binary.
icon: phosphor-duotone:rocket-launch
---

This guide builds a small `greeter` module with a setting, a BIF, a member function and a component. It needs only MatchBox, with no Rust or Java toolchain.

## 1. Create the package

```text
my-app/
  app.bxs
  boxlang_modules/
    greeter/
      box.json
      ModuleConfig.bx
      bifs/
        Greet.bx
      components/
        Banner.bx
```

`box.json` gives the package its identity. `boxlang.moduleName` is the name used for settings, `getModuleSettings()` and `bxModules.<name>`:

```json
{
    "name": "Greeter",
    "slug": "bx-greeter",
    "version": "1.0.0",
    "type": "boxlang-modules",
    "boxlang": { "moduleName": "greeter" }
}
```

## 2. Write the descriptor

`ModuleConfig.bx` declares settings and lifecycle hooks:

```boxlang
class {
    this.version = "1.0.0";
    this.author = "You";
    this.description = "Friendly greetings";

    function configure() {
        settings = { greeting: "Hello", punctuation: "!" };
    }

    function onLoad() {
        log.info( "greeter loaded" );
    }

    function onUnload() {}
}
```

`settings`, `log` and `moduleRecord` are ready for you inside the descriptor. See [Module Descriptor](module-descriptor.md).

## 3. Add a BIF

Every class in `bifs/` becomes a global function named after the file. Its `invoke()` method does the work:

```boxlang
// bifs/Greet.bx
@BoxBIF
@BoxMember( "string" )
class {
    function invoke( required string name, string greeting ) {
        var s = getModuleSettings( "greeter" );
        var g = arguments.greeting ?: s.greeting;
        return g & ", " & arguments.name & s.punctuation;
    }
}
```

`@BoxMember( "string" )` also makes it a member function of strings, so `"world".greet()` works. See [BIFs](capabilities/bifs.md).

## 4. Add a component

Every class in `components/` becomes a `bx:` component:

```boxlang
// components/Banner.bx
@AllowsBody( true )
class {
    function invoke( context, attributes, body, executionState ) {
        var buffer = newBuffer();
        var result = processBody( context, body, buffer );
        writeOutput( "*** " & ( attributes.title ?: "" ) & ": " & trim( buffer.toString() ) & " ***" );
        return result;
    }
}
```

## 5. Use it

```boxlang
// app.bxs
println( greet( "Luis" ) );
println( greet( name = "Ana", greeting = "Hola" ) );
println( "world".greet() );

bx:banner title="News" {
    writeOutput( "MatchBox modules" );
}
```

```sh
matchbox app.bxs
```

```text
[info] greeter loaded
Hello, Luis!
Hola, Ana!
Hello, world!
*** News: MatchBox modules ***
```

## 6. Override a setting

Applications change module settings in `boxlang.json`, next to `app.bxs`:

```json
{ "modules": { "greeter": { "settings": { "punctuation": "!!" } } } }
```

Now `greet( "Luis" )` returns `Hello, Luis!!`.

## 7. Ship it

Build a standalone binary. The module is embedded, so the binary runs without the `boxlang_modules/` folder:

```sh
matchbox --target native --output greet-app app.bxs
./greet-app
```

## Develop outside the project

Keep the module in its own folder while you work on it, and point MatchBox at it:

```sh
matchbox --module ../greeter app.bxs
```

`--module` must come before the script file.

## Next steps

- [Module Descriptor](module-descriptor.md): every descriptor property and injected reference.
- [Capabilities](capabilities/index.md): BIFs, components, interceptors and class providers.
- [Native Plugins](native/index.md): add Rust when you need it.
- [Packaging and Publishing](packaging-publishing.md): share the module on ForgeBox.
