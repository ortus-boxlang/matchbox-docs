---
title: Errors and control flow
summary: if and switch, break and continue, and handling errors with try, catch and finally.
icon: phosphor-duotone:git-branch
tags: [course]
---

## Choosing a path

```boxlang title="conditions.bxs"
temperature = 22;

if ( temperature > 30 ) {
    println( "hot" );
} else if ( temperature > 15 ) {
    println( "pleasant" );
} else {
    println( "cold" );
}

day = 3;
switch ( day ) {
    case 1:
        println( "Monday" );
        break;
    case 3:
        println( "Wednesday" );
        break;
    default:
        println( "some other day" );
}
```

Output:

```text
pleasant
Wednesday
```

`switch` needs a `break` at the end of each case, otherwise execution falls through into the next one.

## Skipping and stopping

`continue` skips to the next round of a loop, and `break` leaves the loop.

```boxlang title="loop-control.bxs"
for ( i = 1; i <= 6; i++ ) {
    if ( i == 2 ) {
        continue;
    }
    if ( i == 5 ) {
        break;
    }
    println( i );
}
```

Output:

```text
1
3
4
```

## Handling errors

When something goes wrong, code **throws** an error. If nothing catches it, the script stops. A `try` block lets you catch the error and carry on.

```boxlang title="try-catch.bxs"
try {
    println( "before" );
    throw "something broke";
    println( "never printed" );
} catch ( any e ) {
    println( "caught: " & e.message );
} finally {
    println( "always runs" );
}
```

Output:

```text
before
caught: something broke
always runs
```

`catch ( any e )` catches every kind of error. `finally` runs whether or not an error happened, which makes it the right place for cleanup.

## Built-in errors

The runtime throws errors of its own, for example when you divide by zero.

```boxlang title="runtime-error.bxs"
try {
    println( 10 / 0 );
} catch ( any e ) {
    println( "caught: " & e.message );
}
```

Output:

```text
caught: Division by zero
```

## Your own error types

Give an error a **type** so callers can catch exactly the problems they know how to handle.

```boxlang title="custom-errors.bxs"
function parseAge( text ) {
    if ( !isNumeric( text ) ) {
        throw( type = "BadInput", message = "'" & text & "' is not a number" );
    }
    return text + 0;
}

try {
    println( parseAge( "36" ) );
    println( parseAge( "old" ) );
} catch ( BadInput e ) {
    println( e.type & ": " & e.message );
}
```

Output:

```text
36
BadInput: 'old' is not a number
```

## Try it

Change the second call to `parseAge( "42" )` and run again. Then add a `catch ( any e )` after the `BadInput` one and throw a different kind of error to see which handler runs.
