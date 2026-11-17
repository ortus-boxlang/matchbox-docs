---
title: Class Providers
description: Implement java: class names for MatchBox, so code written for the JVM runs without a JVM.
icon: phosphor-duotone:coffee
---

MatchBox has no JVM. Code that uses a Java class, like `new java:java.lang.StringBuilder()`, needs something to stand in for that class. A **class provider** is a module's implementation of one exact `java:` class name.

## Register a provider

Set `classProviders` in `configure()`. Each entry has the exact, case-sensitive class name and a function that returns the implementation:

```boxlang
function configure() {
    // Only register on MatchBox: the JVM has the real class.
    if ( boxRuntime.getFunctionService().hasGlobalFunction( "nativeCounterClass" ) ) {
        classProviders = [
            { name: "java:org.example.Counter", provider: nativeCounterClass }
        ];
    }
}
```

The provider can return:

- a native object or class from a [native plugin](../native/index.md);
- a BoxLang class reference;
- a BoxLang instance.

A returned BoxLang class runs its pseudo-constructor to create the stand-in, but not `init()`. Providers run when the class is first resolved at runtime, never while packaging.

## Use the class

All the usual forms resolve through the provider:

```boxlang
counter = createObject( "java", "org.example.Counter" );
counter = new java:org.example.Counter();

import java:org.example.Counter;
counter = new Counter();

Counter::staticMethod();
```

`init()` and `new` call the provided constructor. Methods, static calls, `::` references and chaining use normal MatchBox dispatch.

## Rules

- Names must be exact `java:` class names. There are no wildcards, and duplicates are an error.
- Once any module registers a Java name, an unknown Java name fails instead of falling back to a JVM.
- Without registrations, builds with the optional JNI feature can use the [Java interop](../../reference/language/java-interop.md) bridge.
- Providers stay available during `onUnload()`, then are removed.

!!! info "A boundary, not a Java runtime"
    The module owns the behaviour of the class: its methods, fields and overloads. Java reflection, class loaders and JAR arguments are not provided. For an example, see [bx-matchbox-java](https://github.com/ortus-boxlang/bx-matchbox-java), which implements `java.lang.StringBuilder`.

Registered providers are listed in `moduleRecord.classProviders`.
