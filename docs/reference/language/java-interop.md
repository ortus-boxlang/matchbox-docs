---
title: Java interop
description: What works and what fails when a native MatchBox 0.11.0 script calls Java classes through the experimental JNI bridge.
icon: phosphor-duotone:coffee
---

# Java interop

Java interop is experimental. It needs a JDK on the host and a native MatchBox build with the `bif-jni` feature, which is in the default feature set. It does not exist in the browser. The [Java interop example](../../examples/java_interop/README.md) shows the intended use. This page records what actually ran on the 0.11.0 CLI, so none of these snippets have a Run button.

## What works

```boxlang
import java:java.util.ArrayList as List;
import java:java.util.HashMap;

l = new List();
l.add( "x" );
l.add( "y" );
println( l.size() );
println( l.contains( "x" ) );

m = new HashMap();
m.put( "a", "b" );
println( m.get( "a" ) );
```

```text
2
true
b
```

Instantiating a class with `new`, either from an `import java:` or from `createObject( "java", "java.util.ArrayList" )`, and calling methods with string arguments works.

## What fails

| Code | Result |
| --- | --- |
| `list.get( 0 )` | `Invocation of get failed: Java exception was thrown`, with `java.lang.IllegalArgumentException: argument type mismatch` printed on the error stream. |
| `sb = new StringBuilder(); sb.append( "x" )` | The same `argument type mismatch` failure. |
| `import java:java.lang.Math;` then `Math.sqrt( 16 )` | `Method sqrt not found on null.` Static-only classes cannot be called through an import. |
| `createObject( "java", "java.lang.Math" )` | `Constructor with 0 arguments not found on class java.lang.Math`. The same happens for `java.util.UUID`. |
| `import java:java.lang.System;` then `System.getProperty( ... )` | `Method getProperty not found on null.` |
| `java.new( "java.lang.StringBuilder", "Hello" )` | Parse error: `expected identifier, found new`. |

The cause of the first row is that every MatchBox number is passed to Java as a `java.lang.Double`, so a method that takes an `int` is not matched. `add`, `contains` and map `put` and `get` with string arguments work. `StringBuilder.append( "x" )` fails even though its argument is a string, so test each method you depend on.

BoxLang 1.13 on the JVM runs `list.get( 0 )`, `Math.sqrt( 16 )` and `sb.append( "x" )` without error, so Java code that runs there can fail here. Use a [Native Fusion](../../examples/native_fusion/README.md) Rust module for numeric work.
