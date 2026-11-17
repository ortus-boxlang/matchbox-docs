---
title: Mappings
description: Module mappings, the public folder and how classes inside a module are found.
icon: phosphor-duotone:signpost
---

Every module gets a **mapping**, a name that points at the module's folder. Use it to create the module's classes from anywhere in the application.

## The default mapping

Without `this.mapping`, the mapping is the module name:

| | Value |
| --- | --- |
| Mapping | `/bxModules/greeter/` |
| Class path | `bxModules.greeter` |

So a class at `models/Counter.bx` is created with:

```boxlang
counter = new bxModules.greeter.models.Counter();

// or import it first
import bxModules.greeter.models.Counter;
counter = new Counter();
```

## Choose a mapping name

Set `this.mapping` to a string to use a different name:

```boxlang
class {
    this.mapping = "greet";
}
```

```boxlang
counter = new bxModules.greet.models.Counter();
```

`this.mapping` is read after the descriptor is created and before `configure()`, so changing it inside `configure()` has no effect.

### The struct form

A struct gives more control:

```boxlang
this.mapping = {
    name: "greet",       // blank or missing: the module name
    usePrefix: true,     // false: /greet/ instead of /bxModules/greet/
    external: false,     // true: may be served over HTTP
    path: ""             // relative to the module folder, or absolute
};
```

With `usePrefix: false` the mapping is `/greet/`, and classes are created as `new greet.models.Counter()`.

## The public folder

`this.publicMapping` points at the module's `public/` folder for static files such as CSS, JavaScript and images:

| | Default |
| --- | --- |
| Mapping | `/bxModules/greeter/public/` |
| Folder | `<module>/public/` |
| External | `true` |

A string sets a different folder name inside the module. A struct accepts the same keys as `this.mapping`, with `external` defaulting to `true`.

The [web server](../building-and-deploying/web-server.md) serves external mappings. Other module folders stay private, and the server's source and configuration protection still applies.

## Inspect mappings

```boxlang
info = getModuleInfo( "greeter" );
println( info.mapping );         // { name, path, external }
println( info.publicMapping );
println( info.invocationPath );  // bxModules.greeter
```

## Packaged classes

When you build an application, MatchBox embeds the module's `.bx` classes. They keep working in a `.bxb` or a native binary after the module folder is gone.

- Only classes **inside the module folder** are embedded. A mapping `path` can point elsewhere, but classes there are not bundled.
- `build/`, `dist/` and `target/` at the module root are treated as build output and skipped.
- Script statements around a class declaration are not run when the class is loaded.
