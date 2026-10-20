---
title: Error handling
description: try, catch, finally, throw and rethrow in MatchBox 0.11.0, including the fact that catch types are ignored.
icon: phosphor-duotone:warning
---

# Error handling

The [errors lesson](../../course/07-errors-and-control-flow.md) covers the basics. Snippets with a Run button ran in the browser playground and on the CLI with the same output.

## try, catch, finally

```boxlang title="errors-basic.bxs"
try {
    throw( type = "MyError", message = "boom", detail = "more", errorCode = "E1" );
} catch ( any e ) {
    println( e.type & " | " & e.message & " | " & e.detail & " | " & e.errorCode );
} finally {
    println( "finally runs" );
}

try {
    x = 1 / 0;
} catch ( any e ) {
    println( e.type & ": " & e.message );
}

try {
    throw "plain text";
} catch ( any e ) {
    println( e.message );
}

try {
    try {
        throw "inner";
    } catch ( any e ) {
        rethrow;
    }
} catch ( any e ) {
    println( "outer got " & e.message );
}

function f() {
    try {
        return "from try";
    } finally {
        println( "cleanup" );
    }
}
println( f() );
```

Output:

```text
MyError | boom | more | E1
finally runs
ExpressionException: Division by zero
plain text
outer got inner
cleanup
from try
```

- The caught value is a struct. It holds only what `throw` was given, plus `stackTrace`. `throw( type = "A" )` gives `e.message` as null, and `structKeyExists( e, "type" )` is `false` for `throw( message = "x" )`.
- Errors raised by the VM have `e.type` set to `ExpressionException`, for example division by zero or calling an undefined function.
- `catch ( e )` without the `any` keyword is accepted.
- An uncaught error prints `Error: ...` with the source line and the CLI exits with status 1.

## Catch types are ignored

The type in `catch ( SomeType e )` is parsed and then ignored. The first `catch` block always runs, whatever was thrown.

```boxlang
try {
    throw( type = "A", message = "m" );
} catch ( B e ) {
    println( "B" );
} catch ( A e ) {
    println( "A" );
}
```

This prints `B`. BoxLang prints `A`. Two more consequences:

- A typed catch placed before `catch ( any e )` swallows everything.
- `catch ( "Custom.Sub" e )` with a quoted type is a parse error.

Workaround: use one `catch ( any e )` and branch on `e.type`, then `rethrow` what you do not handle.

```boxlang title="errors-typed.bxs"
function risky( kind ) {
    throw( type = kind, message = "failed: " & kind );
}

for ( kind in [ "NotFound", "Denied", "Other" ] ) {
    try {
        risky( kind );
    } catch ( any e ) {
        if ( e.type == "NotFound" ) {
            println( "404 " & e.message );
        } else if ( e.type == "Denied" ) {
            println( "403 " & e.message );
        } else {
            println( "unhandled " & e.type );
        }
    }
}
```

Output:

```text
404 failed: NotFound
403 failed: Denied
unhandled Other
```

## Asynchronous errors

An error inside a `runAsync` callback surfaces when you call `get()`. See [async and futures](async-and-futures.md).
