---
title: Java interop example
description: Call Java classes from BoxLang in interpreter mode through the experimental JNI bridge.
---

# Java Interop Example

This example calls Java classes from BoxLang through MatchBox's experimental **JNI bridge**.

> **Important limitations:**
>
> - Java interop works when you run a script with `matchbox main.bxs`. Binaries produced with `--target native` do **not** include the bridge: the same calls fail at run time with `Java interoperability is not enabled in this build.`
> - It is not available in WASM builds.
> - A **JDK must be installed** on the machine that runs the script.
> - The feature is experimental. APIs may change between MatchBox releases.

## Running

From this directory:

```bash
matchbox main.bxs
```

Expected output:

```text
=== BoxLang Java Interop ===

--- StringBuilder ---
Hello, World!
Length: 13

--- ArrayList ---
Size: 3
Contains 'Rust': true
List: [BoxLang, MatchBox, Rust]

--- HashMap ---
language -> BoxLang
runtime  -> MatchBox
Contains 'backend': true
Size: 3

Done!
```

The runner stubs that `--target native` copies into your binary are built without the `bif-jni` feature. The `matchbox` command itself has it, so only interpreter mode can reach Java.

## What It Demonstrates

| Java class | Syntax |
|---|---|
| `java.lang.StringBuilder` | `import java:java.lang.StringBuilder as SB` |
| `java.util.ArrayList` | `import java:java.util.ArrayList as List` |
| `java.util.HashMap` | `import java:java.util.HashMap` |

## Import Syntax

```boxlang
// Import with an alias
import java:java.util.ArrayList as List;
myList = new List()
myList.add("item")

// Import without an alias (use the bare class name)
import java:java.util.HashMap;
myMap = new HashMap()
myMap.put("key", "value")

// Without an import
sb = createObject("java", "java.lang.StringBuilder", "Hello")
println(sb.toString())
```

A constructor is chosen by argument count, so `new SB("Hello")` calls the one-argument constructor.

## Limitations

These results were observed with OpenJDK 21:

| Call | Result |
|---|---|
| Constructing `StringBuilder`, `ArrayList`, `HashMap` | Works |
| `ArrayList.add`, `size`, `contains`, `toString`; `HashMap.put`, `get`, `containsKey`, `size` | Works |
| `ArrayList.get( 0 )` | Fails: `argument type mismatch` |
| `StringBuilder.append( "text" )` | Fails: `argument type mismatch` |
| `createObject( "java", "java.lang.String", "abc" )` | Fails with a `ClassCastException` |
| `--target native` binaries | Java is not enabled |
| WASM builds | Not supported |
| Running without a JDK installed | Not supported |

See [differences-from-boxlang.md](../../differences-from-boxlang.md) for the full list of unsupported features across all build targets.
