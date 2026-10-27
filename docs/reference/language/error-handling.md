---
title: Error handling
description: Handle errors with typed catch blocks, finally, throw and rethrow.
icon: phosphor-duotone:warning
---

Use `try` and `catch` to handle errors, and `finally` for cleanup. The [errors lesson](../../course/07-errors-and-control-flow.md) introduces the basics.

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

## Typed catches

The first matching catch runs. Types are case-insensitive: `Custom` also matches `Custom.Input`, but not `CustomInput`. Use `any` as a fallback. Errors with no matching catch propagate outward, after `finally` runs.

```boxlang title="catch-selection.bxs"
try {
    throw( type = "Custom.Input", message = "bad value" );
} catch ( Other e ) {
    println( "wrong handler" );
} catch ( "custom" e ) {
    println( e.message );
} catch ( any e ) {
    println( "fallback" );
}
```

```text
bad value
```

You can also inspect `e.type` inside a catch when handling several cases together.

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
