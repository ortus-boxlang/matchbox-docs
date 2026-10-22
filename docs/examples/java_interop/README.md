---
title: Java interop example
description: Use Java collections, strings and static methods from a native MatchBox script.
---

# Java interop example

This example uses the experimental JNI bridge to call `StringBuilder`, `ArrayList`, `HashMap` and `Math`.

## Run it

Install a JDK and use a MatchBox CLI with JNI support. From this directory:

```sh
matchbox main.bxs
```

The script prints a greeting, collection values and results from Java's math functions.

## Calling Java

```boxlang
import java:java.util.ArrayList as List;

items = new List();
items.add( "hello" );
println( items.get( 0 ) );

math = createObject( "java", "java.lang.Math" );
println( math.sqrt( 144 ) );
```

Java collection indexes start at 0. Use `createObject(...).init()` when explicitly constructing an instance through a class reference.

JNI is a native host integration, not a browser feature. A standalone executable also needs JNI support in its runner; ordinary runner stubs do not include it. See [Java interop](../../reference/language/java-interop.md) for the integration overview.
