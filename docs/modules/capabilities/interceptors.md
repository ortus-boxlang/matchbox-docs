---
title: Interceptors
description: Listen to MatchBox and module events, and announce events of your own.
icon: phosphor-duotone:broadcast
---

Interceptors are classes that listen for events. A method named after an event runs whenever that event is announced.

## Declare an interceptor

Register interceptors in `configure()`:

```boxlang
// ModuleConfig.bx
function configure() {
    interceptors = [
        { class: "interceptors.Audit", properties: { tag: "audit" } }
    ];
}
```

Relative class names are resolved inside the module, so `interceptors.Audit` is `interceptors/Audit.bx`.

```boxlang
// interceptors/Audit.bx
class {
    function configure() {
        log.info( "Audit ready as #name#" );
    }

    function postModuleLoad( data ) {
        println( "loaded " & data.moduleName );
    }

    function onGreet( data ) {
        println( "[" & properties.tag & "] " & data.message );
    }
}
```

Each interceptor receives `name`, `properties`, `log`, `boxRuntime`, `interceptorService` and `moduleRecord` before its optional `configure()`. The default name is `<class>@<module>`, for example `bxModules.greeter.interceptors.Audit@greeter`.

Interceptors are registered before the module's `onLoad()` and removed after its `onUnload()`.

## Built-in events

| Event | Data |
| --- | --- |
| `preModuleLoad`, `postModuleLoad` | `moduleRecord`, `moduleName` |
| `preModuleUnload`, `postModuleUnload` | `moduleRecord`, `moduleName` |
| `preFunctionInvoke` | `context`, `arguments`, `function`, `name` |
| `postFunctionInvoke` | the same, plus `result` |
| `onFunctionException` | the same, plus the exception |

The data is live. This interceptor changes a function's result:

```boxlang
function postFunctionInvoke( data ) {
    if ( data.name == "shout" ) {
        data.result &= "?";
    }
}
```

```boxlang
println( shout( "hi" ) ); // HI!?
```

## Custom interception points

Name the events your module announces in `configure()`:

```boxlang
function configure() {
    customInterceptionPoints = [ "onGreet" ];
}
```

Announce them from the module, or from the application:

```boxlang
boxAnnounce( "onGreet", { message: "Hello, Luis!" } );

// or, inside the module
interceptorService.announce( "onGreet", { message: "Hello, Luis!" } );
```

Announcements run synchronously, in registration order. Handlers share the same data struct, so one handler can change it for the next.

### Stop the chain

A handler that returns `true` stops the remaining handlers for that announcement:

```boxlang
function onGreet( data ) {
    if ( data.message contains "spam" ) return true;
}
```

### Points from annotations

A method marked `@interceptionPoint` registers its own event name, without `customInterceptionPoints`:

```boxlang
class {
    @interceptionPoint
    function onCacheClear( data ) {
        log.info( "cache cleared" );
    }
}
```

Only methods declared in the class itself are discovered, not inherited ones.

## Register at runtime

The interceptor service also works outside `configure()`:

```boxlang
// register an instance you created
audit = new bxModules.greeter.interceptors.Audit();
interceptorService.register( audit );

// create and register by full class name: properties, name, module record
interceptorService.newAndRegister( "bxModules.greeter.interceptors.Audit", { tag: "late" }, "lateAudit", moduleRecord );

// remove one again
interceptorService.unregister( audit );

interceptorService.hasInterceptionPoint( "onGreet" );  // true
interceptorService.getInterceptionPoints();
```

!!! note "One global pool"
    `boxAnnounce( state, data, poolname )` supports only the global pool. Application, request and template event families from the JVM runtime are not announced by MatchBox.
