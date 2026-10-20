---
title: Language Essentials
description: A tour of the BoxLang syntax and features MatchBox 0.11.0 implements, each example run, with links to the language reference.
order: 5
icon: phosphor-duotone:brackets-curly
---

# Language essentials

MatchBox runs BoxLang source on its own Rust VM. It covers the core of the language and a large function library, and it leaves some features out. Every snippet below was run on MatchBox 0.11.0, and the ones with a Run button run in your browser.

Before moving a JVM application, read [BoxLang compatibility](../differences-from-boxlang.md). It lists what is missing and the bugs to avoid. For the language in depth, use the [language reference](../reference/language/index.md). To learn by doing, start with the [course](../course/index.md).

## Variables, strings and operators

```boxlang title="variables.bxs"
name = "MatchBox";
active = true;
count = 3;
println( "Hello, #name#!" );
println( "Built with " & name );
println( count * 2 + 1 );
println( "abc" contains "b" );
println( n ?: "n is null" );
```

Output:

```text
Hello, MatchBox!
Built with MatchBox
7
true
n is null
```

Variables are dynamically typed. `&` joins strings, `#expression#` interpolates inside a double-quoted string, and `?:` supplies a value when the left side is null. See [operators](../reference/language/operators.md).

## Arrays and structs

```boxlang title="collections.bxs"
targets = [ "native", "browser", "embedded" ];
println( targets[ 1 ] );
targets.append( "wasi" );
println( targets.len() );

project = { name: "Hello", ready: true };
println( project.NAME );

lengths = arrayMap( targets, ( target ) => len( target ) );
println( serializeJSON( lengths ) );

{ name, ready } = project;
println( name & " " & ready );
println( serializeJSON( [ 0, ...targets ] ) );
```

Output:

```text
native
4
Hello
[6,7,8,4]
Hello true
[0,"native","browser","embedded","wasi"]
```

Arrays are 1-indexed and struct keys are case-insensitive. Destructuring and spread are covered in [destructuring, spread and ranges](../reference/language/destructuring-spread-ranges.md). MatchBox also has a [set type](../reference/language/sets.md).

## Control flow and functions

```boxlang title="control-flow.bxs"
for ( target in [ "native", "browser" ] ) {
    if ( target == "native" ) {
        println( "Build an executable" );
    } else {
        println( "Explore " & target );
    }
}

switch ( "b" ) {
    case "a":
        println( "A" );
        break;
    case "b":
    case "c":
        println( "B or C" );
        break;
    default:
        println( "other" );
}

function greet( name = "world" ) {
    return "Hello, " & name;
}
double = ( number ) => number * 2;
println( greet() );
println( greet( name = "Ada" ) );
println( double( 21 ) );
```

Output:

```text
Build an executable
Explore browser
B or C
Hello, world
Hello, Ada
42
```

Also supported: `while`, `do ... while`, `break`, `continue`, ranges (`for ( i in 1..3 )`), closures and arrow functions. Labeled `continue`, `lock` and `thread` statements are not supported. A closure inside a function cannot see that function's variables, so use a loop there. See [scopes](../reference/language/scopes.md).

## Classes

```boxlang title="classes.bxs"
class Product accessors="true" {
    property name;
    property price;

    function init() {
        return this;
    }
}

product = new Product();
product.setName( "Widget" );
println( product.getName() );
```

Output:

```text
Widget
```

`init` must end with `return this`, and a class extends another with `extends="Parent"`, not the keyword form. `super` is not available. See [classes](../reference/language/classes.md).

## Errors and asynchronous work

```boxlang title="errors-and-futures.bxs"
try {
    throw( type = "MyError", message = "boom" );
} catch ( any e ) {
    println( e.type & ": " & e.message );
} finally {
    println( "done" );
}

future = runAsync( () => {
    sleep( 100 );
    return "finished";
} );
println( future.get() );
```

Output:

```text
MyError: boom
done
finished
```

The type in `catch ( SomeType e )` is ignored, so catch `any` and test `e.type`. See [error handling](../reference/language/error-handling.md) and [async and futures](../reference/language/async-and-futures.md). In the browser, futures take turns on one thread.

## Function library

MatchBox ships built-in functions for strings, arrays, structs, dates, JSON, regular expressions, XML, hashing and more. The [function reference](../reference/functions/index.md) lists each one. Some groups are optional parts of the build:

| Group | Needs the build feature | In the browser |
| --- | --- | --- |
| Files and directories | `bif-io` (default) | No |
| `http()` | `bif-http` (default) | Not tested, see [HTTP](../http.md) |
| Hashing and encryption | `bif-crypto` (default) | No (`hash` is not defined) |
| Terminal helpers | `bif-cli` (default) | No (`cliClear` is not defined) |
| Java interop | `bif-jni` (default) | No |
| Zip and tar | `bif-zip` | Not tested |
| Queries and datasources | `bif-datasource`; `qoq` for query of queries | No |

See [Building MatchBox](building-matchbox.md) for the feature table. The default CLI also removes functions it thinks your script does not use; `--no-shaking` turns that off. A member call such as `a.sort( "numeric" )` can fail with `BIF arraysort not found.` until you do.

## Other parts of the language

- [Templates (.bxm)](../reference/language/templates-bxm.md): a few tags work, `<bx:loop>` does not.
- [Modules](../reference/language/modules.md): add functions and classes with `--module`.
- [Queries and data](../reference/language/query-and-data.md).
- [Java interop](../reference/language/java-interop.md): experimental.
- [Native Fusion](../examples/native_fusion/README.md): call Rust from BoxLang.
