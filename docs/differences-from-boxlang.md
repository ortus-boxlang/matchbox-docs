---
title: BoxLang Compatibility
description: A tested list of what MatchBox 0.11.0 supports, partly supports and does not support compared with BoxLang on the JVM, with the known issues and their workarounds.
icon: phosphor-duotone:arrows-left-right
---

# BoxLang compatibility

MatchBox is an independent runtime written in Rust. It reads BoxLang source but it is not the JVM runtime packaged differently, and it does not match BoxLang everywhere. This page lists what was run against MatchBox 0.11.0, and compares it with BoxLang 1.13 on the JVM where the behavior differs.

How to read it:

- Each row was checked by running a snippet on the 0.11.0 CLI or in the [playground](playground.md), not by reading the roadmap.
- "BoxLang" means BoxLang 1.13 run from its jar.
- Fixes for several items below are in progress as GitHub issues and pull requests. None of them is in a released version. Check the [release notes](reference/releases.md) before relying on a fix.

## Feature matrix

S means supported, P partial, U unsupported.

### Language

| Feature | Status | What was run | Details |
| --- | --- | --- | --- |
| Variables, `#interpolation#`, `&` | S | `"Hello #name#"` | [Language essentials](getting-started/features-overview.md) |
| Arrays, structs, ranges in `for` | S | `for ( i in 1..3 )` | [Ranges](reference/language/destructuring-spread-ranges.md) |
| `if`, `switch`, `for`, `while`, `do`, `break`, `continue` | S | Each ran | |
| Labeled `continue outer;` | U | Parse error: `unexpected token in expression: :` | Rewrite with a flag |
| Functions, defaults, named args, closures, arrows | S | `( a, b ) => a + b`, `greet( greeting = "Hi", name = "Bob" )` | |
| Closures over a function's own variables | U | `adder( 5 )( 10 )` printed `10null` | Known issue 8 below |
| Typed parameters (`numeric n`) | P | Accepted, not enforced: `typed( "abc" )` returns `abc`. BoxLang throws. | |
| `required` parameters | P | Parsed, not enforced | Known issue 13 below |
| Functions called before they are defined | U | `Can only call functions.` BoxLang hoists them. | Define functions first |
| `try`, `catch`, `finally`, `throw`, `rethrow` | P | Work, but the type in `catch ( Type e )` is ignored | [Error handling](reference/language/error-handling.md) |
| `include`, `param name = value`, `assert` | S | Each ran | |
| `param name="q" default="d"` | U | Parse error | Use `param q = "d";` |
| Word operators `eq neq gt gte lt lte is contains and or xor eqv` | S | Each ran | [Operators](reference/language/operators.md) |
| Word operators `not`, `mod`, `ne`, `imp` | U | Parse error. `y = 7 mod 3;` silently stores 7 | Known issue 16 below |
| `??=` | U | Parse error | `x = x ?: 3` |
| Elvis `?:`, safe navigation `?.`, ternary, `castAs`, `instanceOf` | S | Each ran | [Operators](reference/language/operators.md) |
| Bitwise `b&` `b\|` `b^` `b~` `b<<` `b>>` `b>>>` | S | Each ran | |
| Set literal `set{}`, `setNew`, `setOf`, set operators | P | Work; `add()` does not deduplicate | [Sets](reference/language/sets.md) |
| Destructuring `{ a, b } = s` and `[ x, y ] = arr` | S | Ran | [Destructuring](reference/language/destructuring-spread-ranges.md) |
| Destructuring with `...rest`, or after `var` | U | `rest` is silently null; `var { a } =` is a parse error | |
| Spread in arrays, structs and calls | P | Work; a duplicate key crashes the VM | [Spread](reference/language/destructuring-spread-ranges.md) |
| `lock` and `thread` as script statements | U | Parse error: `expected ':' or '=' in struct literal` | Use `threadNew()` |
| Scopes `variables`, `server`, `arguments` | P | See the scopes page | [Scopes](reference/language/scopes.md) |
| Scopes `local`, `request`, `application` | U | `local.x = 1` fails with `Member assignment only supported on structs...` | Known issue 17 below |
| `url`, `form`, `cookie`, `session`, `cgi` | P | Only when serving templates with `--serve` | [Scopes](reference/language/scopes.md) |

### Classes

| Feature | Status | What was run | Details |
| --- | --- | --- | --- |
| Inline `class Name { }` in a script | S | Ran | [Classes](reference/language/classes.md) |
| File-based class (`models/Pet.bx`), `import`, `new models.Pet()` | S | `I am rex` | |
| `init`, `this`, `variables`, `onMissingMethod` | S | Ran | |
| `new C()` when `init` has no `return this` | U | Returns null | Known issue 1 below |
| `extends="P"`, `implements="I"`, `accessors="true"` attributes | S | Ran | |
| `class Dog extends Animal`, `class Dog implements Shape` | U | Parse error: `expected =, found identifier` | Known issue 14 below |
| `super` | U | `Variable 'super' not found in class or global scope.` | Known issue 5 below |
| Parent `init()` when the child has none | U | Not called | Known issue 6 below |
| `property name;` with accessors | P | `getName()` and `setName()` work; setters return null | [Classes](reference/language/classes.md) |
| `property name default="x"`, `property name="n"` | U | Parse error | Known issue 15 below |
| `private` | P | Parsed, not enforced | |
| `static function` | P | Callable on an instance only. `S::make()` is a parse error. | |

### Data, libraries and templates

| Feature | Status | What was run | Details |
| --- | --- | --- | --- |
| JSON (`serializeJSON`, `deserializeJSON`) | S | Round trip ran | [Function reference](reference/functions/index.md) |
| Regular expressions (`reFind`, `reReplace`) | S | `reFind( "[0-9]+", "ab123" )` is 3 | |
| Dates (`createDateTime`, `dateAdd`, `dateDiff`, `dateFormat`) | P | Ran; mask dialect and arity differ | Known issues 3, 4 and 7 below |
| File I/O (`fileWrite`, `fileRead`, `fileExists`, `fileDelete`) | S | Ran on the CLI | |
| XML (`xmlParse`), hashing, UUIDs, `numberFormat` | S | Ran | |
| Futures, `runAsync`, `then`, `exceptionally` | P | Ran; see the async page | [Async](reference/language/async-and-futures.md) |
| Queries (`queryNew`, `queryExecute`, datasources) | P | Needs the `bif-datasource` build feature; PostgreSQL only; not in the browser | [Queries](reference/language/query-and-data.md) |
| Query of queries | U by default | `QoQ support is not enabled in this build` unless built with `qoq` | |
| `.bxm` templates: `set`, `output`, `if`/`else`, `script` | P | Ran; `set` and `output` inside `if` lose the rest of the page | [Templates](reference/language/templates-bxm.md) |
| `.bxm` tags `loop`, `switch`, `try`, `include`, `throw`, `import` | U | Stubs | Known issue 20 below |
| CFML files and tags (`.cfm`, `.cfc`, `<cfoutput>`) | U | `.cfm` gives a parse error; `<cfoutput>` is printed as text | |
| Modules (`--module`, `ModuleConfig.bx`) | S | Ran | [Modules](reference/language/modules.md) |
| Java interop | P | `ArrayList.add`/`size` work, `get( 0 )` fails | [Java interop](reference/language/java-interop.md) |
| Native Fusion (Rust modules) | S | See the example | [Native Fusion](examples/native_fusion/README.md) |

## Capabilities by target

| Capability | Native CLI or binary | Browser |
| --- | --- | --- |
| Java interop | Experimental. Needs a JDK on the host (`bif-jni`, in the default features). | Not available |
| Queries and datasources | Needs `bif-datasource`. `qoq` for query of queries. Neither is a default feature. | `queryNew` is not defined |
| Web scopes and `.bxm` templates | With `--serve` | Templates do not run in the playground |
| File I/O | Yes | `fileWrite` is not defined |

See the build guides for the other targets: [native builds](building-and-deploying/native-builds.md), [JavaScript and WASM](building-and-deploying/javascript-and-wasm.md) and [ESP32](building-and-deploying/esp32.md).

## Known issues in 0.11.0

Every item was reproduced on the 0.11.0 CLI. Where a GitHub issue or pull request exists, it is linked. A linked pull request is work in progress, not a release.

### 1. `new C()` returns null when `init()` has no `return this`

```boxlang
class C {
    function init() { x = 1; }
    function getX() { return 1; }
}
c = new C();
println( isNull( c ) );
println( c.getX() );
```

```text
true
Error: VM Runtime Error: ExpressionException: Method getX not found on null.
```

BoxLang returns the new instance whatever `init` returns. Workaround: end every `init` with `return this;`. Tracked in [issue #76](https://github.com/ortus-boxlang/matchbox/issues/76), with a fix in [PR #84](https://github.com/ortus-boxlang/matchbox/pull/84).

### 2. `variables.n++` as a statement fails

```boxlang
class K {
    function init() { variables.n = 0; return this; }
    function bump() { variables.n++; return variables.n; }
}
println( new K().bump() );
```

```text
Error: VM Runtime Error: ExpressionException: Fused increment only supported on structs and instances for now
```

BoxLang prints `1`. Workarounds that run: `variables.n += 1;`, `this.n++;` and `x = variables.n++;`. `++variables.n` is a parse error. Tracked in [issue #77](https://github.com/ortus-boxlang/matchbox/issues/77), with a fix in [PR #85](https://github.com/ortus-boxlang/matchbox/pull/85).

### 3. dateFormat, timeFormat and dateTimeFormat masks

The masks follow Java `DateTimeFormatter` patterns, so `mm` is minutes and `MM` is the month. CFML-style `mmm`, `mmmm`, `tt`, `nn`, `ddd` and `dddd` are not translated.

```boxlang title="date-masks.bxs"
d = createDateTime( 2024, 3, 5, 14, 7, 9, 0 );
println( dateFormat( d, "yyyy-mm-dd" ) );
println( dateFormat( d, "yyyy-MM-dd" ) );
println( dateFormat( d, "MMM" ) );
println( dateFormat( d, "mmm" ) );
println( timeFormat( d, "hh:mm:ss a" ) );
println( timeFormat( d, "hh:mm:ss tt" ) );
```

Output:

```text
2024-07-05
2024-03-05
Mar
mmm
02:07:09 PM
02:07:09 tt
```

BoxLang also prints `2024-07-05` for `yyyy-mm-dd`, but it throws `Too many pattern letters: m` for `mmm` and `Unknown pattern letter: t` for `tt`, where MatchBox prints the letters back without an error. Use Java masks: `yyyy-MM-dd`, `MMM`, `HH:mm:ss`, `hh:mm:ss a`, `EEE`. Tracked in [issue #78](https://github.com/ortus-boxlang/matchbox/issues/78); [PR #87](https://github.com/ortus-boxlang/matchbox/pull/87) mirrors BoxLang's behavior.

### 4. `createDateTime` needs all seven arguments

```boxlang
d = createDateTime( 2024, 3, 5 );
```

```text
Error: VM Runtime Error: ExpressionException: createDateTime() expects at least 7 arguments
```

BoxLang accepts fewer and returns `{ts '2024-03-05 00:00:00'}`. Pass year, month, day, hour, minute, second and millisecond, or use `createDate( 2024, 3, 5 )`. [PR #87](https://github.com/ortus-boxlang/matchbox/pull/87) relaxes the requirement.

### 5. The `super` keyword is not supported

```text
Error: VM Runtime Error: ExpressionException: Variable 'super' not found in class or global scope.
```

`super.init()` and `super.method()` both fail. BoxLang supports them. Repeat the parent's setup in the child, or move shared code into a method both classes call. Tracked in [issue #82](https://github.com/ortus-boxlang/matchbox/issues/82).

### 6. Inherited `init()` is not called when the child has none

With `class Animal` setting `this.sound` in `init()` and `class Dog extends="Animal"` defining no `init()`, `new Dog().sound` is null. BoxLang runs the parent's `init`. Define `init()` in the child and set the fields there. Tracked in [issue #83](https://github.com/ortus-boxlang/matchbox/issues/83).

### 7. Named time zones use a fixed offset

```boxlang title="timezone.bxs"
summer = createDateTime( 2024, 7, 1, 12, 0, 0, 0, "America/New_York" );
winter = createDateTime( 2024, 1, 1, 12, 0, 0, 0, "America/New_York" );
println( dateTimeFormat( summer, "yyyy-MM-dd HH:mm" ) );
println( dateTimeFormat( winter, "yyyy-MM-dd HH:mm" ) );
```

Output:

```text
2024-07-01 16:00
2024-01-01 16:00
```

Both lines print `16:00`, so the summer offset was applied to January too. The winter line should be `17:00`, and BoxLang prints `17:00`. Named zones come from a fixed-offset table and ignore daylight saving. Create the date in `"UTC"`, which keeps `12:00` as `12:00`, and add the offset yourself with `dateAdd`. Tracked in [issue #86](https://github.com/ortus-boxlang/matchbox/issues/86).

### 8. Closures do not capture variables of the enclosing function

```boxlang title="closure-capture.bxs"
function adder( n ) {
    return x => x + n;
}
println( adder( 5 )( 10 ) );
```

Output:

```text
10null
```

BoxLang prints `15`. The same happens for callbacks passed to `map`, `each` and `runAsync` inside a function: the function's parameters and locals read as null. Variables assigned at the top level of the script are visible. Inside a function, use a `for` loop instead of a callback. See [scopes](reference/language/scopes.md).

### 9. Starting futures inside `map` panics

```boxlang
r = [ 1, 2, 3 ].map( n => runAsync( () => n * n ) );
println( r.len() );
```

In the playground this panics with `Attempted to access collected object`. On the CLI it prints `3` and then fails with `Operands must be two numbers.` from the tasks. BoxLang returns three futures. This is the capture bug above. Use `asyncAllApply( [ 1, 2, 3 ], n => n * n )`, which returns `[1,4,9]`.

### 10. Member `map` and `each` callbacks get no index

```boxlang title="callback-index.bxs"
[ 10, 20 ].each( ( v, i ) => println( "each " & v & " " & i ) );
arrayEach( [ 10, 20 ], ( v, i ) => println( "arrayEach " & v & " " & i ) );
```

Output:

```text
each 10 null
each 20 null
arrayEach 10 1
arrayEach 20 2
```

The member form passes `null` as the index, and so do `.map` and `arrayFilter`. `arrayEach` and `arrayMap` pass it. BoxLang passes the index to `each`, `map` and `filter`. Use the function form of `arrayEach` and `arrayMap`, or count in a `for` loop.

### 11. `slice( 2 )` returns an empty array

```boxlang title="slice.bxs"
a = [ 10, 20, 30, 40 ];
println( serializeJSON( arraySlice( a, 2 ) ) );
println( serializeJSON( arraySlice( a, 2, 2 ) ) );
println( serializeJSON( arraySlice( a, 2, 3 ) ) );
```

Output:

```text
[]
[20]
[20,30]
```

The third argument is treated as an end position. BoxLang treats it as a length and returns `[20,30,40]` for `slice( 2 )` and `[20,30]` for `slice( 2, 2 )`. To get "from position 2 to the end", pass `arrayLen( a )` as the third argument.

### 12. Tree shaking drops functions that are only called as members

The CLI removes BIFs it thinks a program does not use. A call such as `a.sort( "numeric" )` or `a.first()` is not seen as a use, so the CLI fails with `BIF arraysort not found.` or `BIF arrayfirst not found.`:

```boxlang
a = [ 3, 1, 2 ];
println( serializeJSON( a.sort( "numeric" ) ) );
println( a.first() );
```

```text
Error: VM Runtime Error: ExpressionException: BIF arraysort not found.
```

Run it with `--no-shaking` and it prints `[1,2,3]` and `3`. It also prints them in the playground. `arraySort( a, "numeric" )` works either way. The same happens to `.slice()`, `.reject()` on a set, and `datasourceRegister()`, which `--keep datasourceRegister` rescues. Use `--no-shaking` or `--keep name1,name2` when you build, or call the function form.

### 13. A missing `required` argument does not throw

```boxlang title="required.bxs"
function f( required x ) {
    return "ok";
}
println( f() );
```

Output:

```text
ok
```

BoxLang throws `Required argument [x] is missing for function [f]`. Validate arguments yourself with `isNull( x )`.

### 14. `class Dog extends Animal` and `implements` are parse errors

```text
Parse Error: error: expected =, found identifier
2 | class Dog extends Animal { function speak(){ return "woof"; } }
```

Only the attribute form parses: `class Dog extends="Animal" implements="Shape" { }`. See [classes](reference/language/classes.md).

### 15. `property` with attributes is a parse error

`property name default="x";` fails with `unexpected token in expression: default`, and `property name="n";` fails the same way. `property string name;` parses but does not define `name`, so its accessor fails. Only `property name;` works with `accessors="true"`. Set defaults in `init()`.

### 16. Missing operators and statements

| Code | Result | BoxLang |
| --- | --- | --- |
| `x = 7 mod 3;` | No error, `x` is 7 | `1` |
| `not true` | Parse error | Works |
| `x ??= 3;` | Parse error | Parse error in 1.13 too |
| `outer: for ...` with `continue outer;` | Parse error | Works |
| `lock name="x" { }` | Parse error | Works |
| `thread name="t" { }` | Parse error | Works |

The `mod` row is the one that can ship a wrong answer. Search ported code for ` mod `.

### 17. The `local`, `request` and `application` scopes do not exist

```text
Error: VM Runtime Error: ExpressionException: Member assignment only supported on structs, instances, JS objects, and native objects
```

`local.x = 1;`, `request.x = 1;` and `application.x = 1;` all fail, in scripts and in served templates. BoxLang accepts them. Use `var`, a top-level variable, the `session` scope under `--serve`, or `server`. Also, at the top level of a script `variables.k = 1; println( k );` prints null: write and read through the same spelling.

### 18. `...rest` destructuring leaves `rest` null

`[ a, ...rest ] = [ 1, 2, 3 ];` and `{ p, ...others } = { p: 1, q: 2 };` run without error and leave `rest` and `others` null. BoxLang gives `[ 2, 3 ]` and `{ q : 2 }`. Use `arraySlice( a, 2, arrayLen( a ) )`.

### 19. Java interop passes numbers as doubles

```text
Exception in thread "Thread-4" java.lang.IllegalArgumentException: argument type mismatch
Error: VM Runtime Error: ExpressionException: Invocation of get failed: Java exception was thrown
```

That is `list.get( 0 )` on an `ArrayList`: every number is sent to Java as a `java.lang.Double`, so `int` parameters are not matched. `StringBuilder.append( "x" )` fails the same way, and static-only classes such as `Math` cannot be used. BoxLang runs all three. See [Java interop](reference/language/java-interop.md).

### 20. `<bx:loop>` and other `.bxm` tags are stubs

`<bx:loop array="#[ 1, 2 ]#" item="i">...</bx:loop>` compiles to an endless loop and never finishes. `<bx:switch>`, `<bx:try>`, `<bx:include>`, `<bx:import>` and `<bx:throw>` are stubs as well. Write loops, switches and includes inside `<bx:script>`. Tracked in [issue #93](https://github.com/ortus-boxlang/matchbox/issues/93). Details are on the [templates page](reference/language/templates-bxm.md).

### Also found while testing

These are not tracked in the issues above.

| Problem | Output | Page |
| --- | --- | --- |
| The type in `catch ( B e )` is ignored; the first catch block runs for any error | Throwing type `A` into `catch ( B e )` runs the `B` block | [Error handling](reference/language/error-handling.md) |
| `set.add()`, `append()` and `addAll()` do not deduplicate | `setOf( 1, 2 ).add( 2 )` makes `size()` 3 | [Sets](reference/language/sets.md) |
| A struct literal that spreads a struct and sets one of its keys crashes the VM | `{ ...s, x: 9 }` where `s` has `x`: CLI exits 134, playground panics | [Spread](reference/language/destructuring-spread-ranges.md) |
| A second `then()` is applied to the first result's input | `runAsync( () => 2 ).then( v => v + 1 ).then( v => v + 100 ).get()` is 102, not 103 | [Async](reference/language/async-and-futures.md) |
| `for ( i in 1..<1 )` runs twice | Prints `i=1` then `i=0` | [Ranges](reference/language/destructuring-spread-ranges.md) |
| `arguments` holds declared parameters only, and `arguments[ 1 ]` is null | `g( 1, 2 )` with no declared parameters: `arguments.len()` is 0 | [Scopes](reference/language/scopes.md) |
| `1 + "x"` returns `1x` | BoxLang throws `Can't cast [x] to a Number` | [Operators](reference/language/operators.md) |
| `ModuleConfig.bx` written as `class { }` loses its settings | `Can only instantiate classes.` warning | [Modules](reference/language/modules.md) |

## Libraries, APIs and integrations

JVM libraries, Java APIs and BoxLang modules built for the JVM do not run in MatchBox. A MatchBox module is a different thing: a folder with `ModuleConfig.bx`, optional BoxLang functions and an optional Rust crate. See [modules](reference/language/modules.md). Native [`http()`](http.md) differs from BoxLang's HTTP client.

## Porting checklist

1. Run the program on the target you ship, not only in the playground.
2. Search for the rows marked U above, especially ` mod `, `not`, `super`, `local.`, `request.` and `application.`.
3. End every `init` with `return this;`.
4. Test builds with and without `--no-shaking` if you use member calls.
5. Report differences in [MatchBox GitHub Issues](https://github.com/ortus-boxlang/matchbox/issues).

Review the MatchBox [changelog](https://github.com/ortus-boxlang/matchbox/blob/develop/CHANGELOG.md) when evaluating a release.
