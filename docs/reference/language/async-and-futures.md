---
title: Async and futures
description: Start asynchronous work, collect results and handle errors with futures.
icon: phosphor-duotone:lightning
---

A future represents a result that may not be ready yet. `runAsync()` starts work and returns a future; `get()` waits for its result.

## Starting work

```boxlang title="futures-basic.bxs"
slow = runAsync( () => {
    sleep( 30 );
    return "slow";
} );
fast = runAsync( () => "fast" );

println( fast.get() & " then " & slow.get() );
println( runAsync( () => 4 ).then( value => value * 2 ).get() );
```

```text
fast then slow
8
```

Use `then()` to transform a result when it arrives. `asyncAllApply( items, callback )` applies a function to a collection and returns the results.

## Handling errors

Errors from asynchronous work surface when you collect the result. Use `try`/`catch`, or provide a recovery callback:

```boxlang title="futures-errors.bxs"
result = runAsync( () => {
    throw( message = "unavailable" );
} ).exceptionally( error => "fallback" );

println( result.get() );
```

```text
fallback
```

See [error handling](error-handling.md) for normal catch and cleanup patterns.

## Concurrency

BoxLang futures take turns on the VM's thread. Native I/O can run independently, but CPU-heavy BoxLang callbacks do not spread across multiple cores. `sleep()` yields to other tasks rather than making computation parallel.

The browser playground uses the same cooperative model and stops runs after five seconds. For a guided introduction, see the [async lesson](../../course/08-async.md).
