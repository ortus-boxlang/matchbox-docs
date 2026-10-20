---
title: Scopes
description: Which variable scopes exist in MatchBox 0.11.0 scripts, classes and served templates, and where they differ from BoxLang.
icon: phosphor-duotone:stack
---

# Scopes

MatchBox does not implement the full BoxLang scope chain. This page lists what each context gives you. Snippets with a Run button ran in the browser playground and on the CLI with the same output.

## Scripts and functions

In a script, a plain assignment creates a variable you can read by its bare name. The `variables.` prefix does not point at the same storage at the top level of a script.

```boxlang title="scope-script.bxs"
j = 2;
println( j );
println( isNull( variables.j ) );

variables.k = 1;
println( isNull( k ) );
println( variables.k );
```

Output:

```text
2
true
true
1
```

Read a value the same way you wrote it: bare name for bare name, `variables.k` for `variables.k`. BoxLang treats both spellings as one variable.

Inside a function, `var` and plain assignment create locals that disappear when the function returns:

```boxlang title="scope-function.bxs"
function f() {
    var local1 = 1;
    other = 5;
    return local1 + other;
}
println( f() );
```

Output:

```text
6
```

`local.x = 1` does not work. It fails with `Member assignment only supported on structs, instances, JS objects, and native objects`, and so do `request.x = 1` and `application.x = 1`. BoxLang accepts all three. These scope names are not defined in 0.11.0, in scripts or in served templates.

## Arguments

Named arguments, defaults and the `arguments` scope work for declared parameters.

```boxlang title="scope-arguments.bxs"
function greet( name, greeting = "Hello" ) {
    return greeting & ", " & name & " (" & arguments.len() & " args)";
}
function demo( a ) {
    return arguments.a & "/" & arguments[ "a" ];
}

println( greet( "Ann" ) );
println( greet( greeting = "Hi", name = "Bob" ) );
println( demo( 1 ) );
```

Output:

```text
Hello, Ann (2 args)
Hi, Bob (2 args)
1/1
```

- `arguments` only holds declared parameters. Extra arguments are dropped: `function g() { return arguments.len(); } g( 1, 2 )` returns 0.
- Positional access does not work: `function h( a ) { return arguments[ 1 ]; } h( 5 )` returns null. Use `arguments.a` or `arguments[ "a" ]`.
BoxLang keeps extra arguments (`g( 1, 2 )` gives 2), supports `arguments[ 1 ]` and hoists function declarations.

Functions must be defined before the line that calls them. Calling one that is defined further down fails with `Can only call functions.`

## Closures do not capture function variables

A closure or arrow function created inside a function cannot see that function's parameters or locals. The name reads as null, and string concatenation then prints the word `null`.

```boxlang title="scope-closures.bxs"
function adder( n ) {
    return x => x + n;
}
println( adder( 5 )( 10 ) );

function addAll( n ) {
    return [ 1, 2 ].map( v => v + n );
}
println( serializeJSON( addAll( 10 ) ) );

base = 5;
function usesTopLevel() {
    return x => x + base;
}
println( usesTopLevel()( 10 ) );
```

Output:

```text
10null
["1null","2null"]
15
```

BoxLang prints `15` for the first call. Closures do see top-level variables of the script, as the last call shows. Inside a function, use a `for` loop instead of a callback that needs the function's own variables:

```boxlang title="scope-closure-workaround.bxs"
function addAll( n ) {
    result = [];
    for ( v in [ 1, 2 ] ) {
        result.append( v + n );
    }
    return result;
}
println( serializeJSON( addAll( 10 ) ) );
```

Output:

```text
[11,12]
```

The same bug breaks `runAsync` callbacks that use a variable of the enclosing function. See [async](async-and-futures.md).

## Classes

Inside a class, `this.x` is the public state and `variables.x` is private to the instance. See [classes](classes.md).

## The server scope

`server` exists and accepts assignment in scripts: `server.q = 1` works.

## Web scopes

When MatchBox serves templates (`matchbox --serve --webroot .`), these scopes are filled in for each request:

| Scope | Verified behavior |
| --- | --- |
| `url` | Query string values. `?name=Ann` gives `url.name`. |
| `form` | Posted fields. `-d a=5` gives `form.a`. |
| `cookie` | Request cookies. The server also sets `MBX_SESSION_ID`. |
| `session` | Persists across requests that send the cookie. A counter in `session.visits` went from 1 to 2. |
| `cgi` | `cgi.request_method` returned `GET`. |
| `variables`, `server` | Readable and writable. |

On the plain CLI, assigning to `url.x`, `form.x`, `cookie.x`, `session.x` or `cgi.x` fails with the same `Member assignment only supported on structs...` error, because those scopes only exist in the server.

An `Application.bx` in the web root was not run: its `onRequestStart` did not write anything when tested. Do not rely on application lifecycle events in 0.11.0.

See [templates](templates-bxm.md) for the tags and the [web server example](../../examples/web_server/README.md).
