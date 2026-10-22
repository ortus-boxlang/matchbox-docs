---
title: Java interop
description: Call Java classes from native MatchBox through the experimental JNI bridge.
icon: phosphor-duotone:coffee
---

# Java interop

Native MatchBox can call Java classes through an experimental JNI bridge. This path needs a JDK on the host and a runtime built with `bif-jni`; it is not available in the browser.

## Calling a class

Use a `java:` import to refer to a Java class:

```boxlang
import java:java.util.ArrayList as List;

items = new List();
items.add( "hello" );
items.add( "MatchBox" );
println( items.size() );
```

```text
2
```

Java collection indexes follow Java's rules, so they start at 0 rather than BoxLang's 1.

## Choosing an integration

The bridge is useful for accessing host libraries, but MatchBox is not a JVM implementation. Check the methods and runtime dependencies your application uses.

A MatchBox-compatible module can also provide a native backend for selected Java-facing APIs. For Rust code owned by your application, use [Native Fusion](../../building-and-deploying/native-fusion.md).

See the [Java interop example](../../examples/java_interop/README.md) for a complete project. A standalone executable needs the same required integration support as the CLI that runs it.
