---
title: Module Descriptor
description: The box.json package file, the ModuleConfig.bx descriptor, settings and the references MatchBox injects.
icon: phosphor-duotone:file-code
---

A module has two descriptor files:

| File | Purpose |
| --- | --- |
| `box.json` | Package identity: name, slug, version, module name and native artifacts |
| `ModuleConfig.bx` | Runtime behaviour: settings, lifecycle hooks, interceptors, mappings and metadata |

## box.json

```json
{
    "name": "Greeter",
    "slug": "bx-greeter",
    "version": "1.0.0",
    "type": "boxlang-modules",
    "license": "Apache-2.0",
    "boxlang": { "moduleName": "greeter" },
    "dependencies": {}
}
```

| Key | Description |
| --- | --- |
| `slug` | The ForgeBox identifier, and the folder name when installed |
| `type` | `boxlang-modules` |
| `boxlang.moduleName` | The module's name at runtime. Without it, the folder name is used |
| `dependencies` | Other packages, by name or by path |
| `matchbox.artifacts` | Optional prebuilt native plugins per target. See [Artifacts](native/artifacts.md) |

## ModuleConfig.bx

```boxlang
class {
    // Metadata
    this.version = "1.0.0";
    this.author = "Ortus Solutions";
    this.description = "Friendly greetings";
    this.webURL = "https://github.com/me/bx-greeter";

    // Discovery
    this.enabled = true;
    this.dependencies = [ "stats" ];

    // Mappings
    this.mapping = "greeter";

    function configure() {
        settings = { greeting: "Hello" };
        interceptors = [ { class: "interceptors.Audit", properties: {} } ];
        customInterceptionPoints = [ "onGreet" ];
    }

    function onLoad() {}
    function onUnload() {}
}
```

### Properties

| Property | Default | Description |
| --- | --- | --- |
| `this.version` | `"1.0.0"` | Reported by `getModuleInfo()` |
| `this.author` | `""` | Reported by `getModuleInfo()` |
| `this.description` | `""` | Reported by `getModuleInfo()` |
| `this.webURL` | `""` | Reported by `getModuleInfo()` |
| `this.enabled` | `true` | A disabled module is skipped. Must be a boolean literal |
| `this.dependencies` | `[]` | Modules that must load first. Must be an array literal of names |
| `this.mapping` | module name | The module's mapping. See [Mappings](mappings.md) |
| `this.publicMapping` | `public/` | The public folder mapping. See [Mappings](mappings.md) |
| `this.modules` | `{}` | Overrides for [nested modules](#nested-modules) |

!!! note "Literals only"
    MatchBox reads `this.enabled`, `this.dependencies` and `this.modules` before running any module code, so they must be literal values, not expressions.

### Variables set in configure()

`configure()` fills variables in the descriptor. Each one starts as an empty default, so a plain assignment works. The return value of `configure()` is ignored.

| Variable | Description |
| --- | --- |
| `settings` | Default settings, deep-merged with the application's overrides |
| `interceptors` | Interceptor classes to register. See [Interceptors](capabilities/interceptors.md) |
| `customInterceptionPoints` | Event names this module announces |
| `classProviders` | `java:` class names this module implements. See [Class Providers](capabilities/class-providers.md) |

## Settings

Declare defaults in `configure()`:

```boxlang
function configure() {
    settings = {
        greeting: "Hello",
        formats: { short: true }
    };
}
```

Applications override them in `boxlang.json`. Structs are merged key by key, so an application can change `formats.short` without repeating `greeting`:

```json
{ "modules": { "greeter": { "settings": { "formats": { "short": false } } } } }
```

Read the merged settings anywhere:

```boxlang
var s = getModuleSettings( "greeter" );
```

Inside the module, `moduleRecord.settings` is the same struct.

## Injected references

MatchBox puts these references in the `variables` scope of the descriptor, before `configure()` runs:

| Reference | Description |
| --- | --- |
| `moduleRecord` | The live record of this module: name, path, mappings, settings, BIFs, components and more |
| `boxRuntime` | The runtime, with `getFunctionService()`, `getModuleService()`, `getInterceptorService()` and `getComponentService()` |
| `log` | A logger: `log.info()`, `log.warn()`, `log.error()`, `log.debug()` |
| `interceptorService` | Register, unregister and announce interceptors |
| `componentService` | Query registered components with `hasComponent()` and `getComponentNames()` |

Class BIFs receive the same references, plus `functionService`. Interceptors receive `name`, `properties`, `log`, `boxRuntime`, `interceptorService` and `moduleRecord`.

### moduleRecord

```boxlang
function onLoad() {
    log.info( "Loaded #moduleRecord.name# from #moduleRecord.path#" );
    println( moduleRecord.asStruct() );
    println( moduleRecord.isActivated() );
}
```

`getModuleInfo( name )` returns the same information from anywhere in the application.

### Services

The service adapters cover the common module tasks:

```boxlang
// Is a function registered?
boxRuntime.getFunctionService().hasGlobalFunction( "greet" );

// Is another module loaded?
boxRuntime.getModuleService().hasModule( "stats" );

// Announce an event
interceptorService.announce( "onGreet", { name: "Luis" } );
```

!!! warning "A subset of the JVM services"
    MatchBox implements the service methods listed here and on the capability pages. Other service methods throw an error instead of doing nothing. See [JVM Differences](jvm-differences.md).

## Nested modules

A module can carry its own modules in a `modules/` folder. MatchBox discovers them recursively. Children are configured and loaded before their parent, and unloaded before it.

Override a child's settings or turn it off with `this.modules`:

```boxlang
this.modules = {
    "helper": { enabled: true, settings: { verbose: false } }
};
```

Only `enabled` and `settings` are supported, and the value must be a literal. Settings in the application's `boxlang.json` take precedence.
