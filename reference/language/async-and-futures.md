---
title: Async and futures
description: runAsync, futures, callbacks and threads in MatchBox 0.11.0, how the browser differs, and the bugs to avoid.
icon: phosphor-duotone:lightning
---

# Async and futures

The [async lesson](../../course/08-async.md) introduces futures. This page lists what is available and what breaks. Snippets with a Run button ran in the browser playground and on the CLI with the same output.

## Futures

`runAsync( fn )` and `futureNew( fn )` start a function and return a future. `get()` waits for the result.

```boxlang title="futures-basic.bxs"
f = runAsync( () => 6 * 7 );
println( f.get() );

g = futureNew( () => "hi" );
println( g.get() );

slow = runAsync( () => {
    sleep( 30 );
    return "slow";
} );
fast = runAsync( () => "fast" );
println( slow.get() & " " & fast.get() );

println( runAsync( () => 4 ).then( v => v * 2 ).get() );
println( serializeJSON( asyncAllApply( [ 1, 2, 3 ], v => v * 2 ) ) );
```

Output:

```text
42
hi
slow fast
8
[2,4,6]
```

Future member functions that work: `get`, `then`, `exceptionally`, `onError`, `getOrDefault`. `asyncAllApply( items, fn )` maps in parallel and returns an array.

`asyncAll` and `asyncAny` are not available: calling them fails with `Can only call functions.`

## Errors

An error inside the callback is stored in the future and raised again by `get()`. `exceptionally` and `getOrDefault` turn it into a value.

```boxlang title="futures-errors.bxs"
f = runAsync( () => {
    throw( message = "bad" );
} );
try {
    f.get();
} catch ( any e ) {
    println( "caught" );
}

g = runAsync( () => {
    throw( message = "bad2" );
} ).exceptionally( err => "recovered" );
println( g.get() );

h = runAsync( () => {
    throw( message = "bad3" );
} );
println( h.getOrDefault( "fallback" ) );
```

Output:

```text
caught
recovered
fallback
```

On the CLI each failed task also writes an `[Async Task Error]` block with the source line to the error stream.

## The browser

The playground runs on one thread. Futures take turns instead of running in parallel, `sleep` yields to the other tasks, and the playground stops a run after five seconds. On a native build the same code can use more threads.

## Threads and executors

`threadNew( fn )`, `threadJoin( thread )` and `executorNew()` are available. In testing, `threadJoin` returned before the thread's `println` output appeared, in the CLI and in the playground, so do not use printed order to judge whether a join waited.

## Bugs to avoid

### Callbacks that use the enclosing function's variables

A callback created inside a function cannot see that function's parameters or locals. For `runAsync` this makes the task fail:

```boxlang
function work( id ) {
    return runAsync( () => id * 10 );
}
println( work( 1 ).get() );
```

```text
Error: VM Runtime Error: ExpressionException: Operands must be two numbers.
```

The same happens for `[ 1, 2, 3 ].map( n => runAsync( () => n * n ) )` and for a loop variable, as in `for ( n in [ 1, 2, 3 ] ) { runAsync( () => n * n ); }`. In the playground the `map` line panics with `Attempted to access collected object` instead of reporting an error. Plain variables assigned at the top level of the script are visible to the callback. This is the closure problem described in [scopes](scopes.md).

Workaround: `asyncAllApply` hands each item to the callback as a parameter, which does work: `asyncAllApply( [ 1, 2, 3 ], n => n * n )` returns `[ 1, 4, 9 ]`.

### Chained then

A second `then` on a future that is itself the result of `then` uses the original value instead of the previous result:

```boxlang title="futures-then-bug.bxs"
a = runAsync( () => 2 ).then( v => v + 1 ).then( v => v + 100 ).get();
println( a );
```

Output:

```text
102
```

The result should be 103. BoxLang 1.13 returns the chained value (it printed `20` for the equivalent `1`, `+ 1`, `* 10` chain). Do the whole computation in one callback.

### Other gaps

- `f.complete( value )`, `f.isDone()` and `f.isError()` do not exist on futures (`Method ... not found`).
- `orTimeout( 1000 )` on a task that finishes in 10 milliseconds failed with `Future timed out` in the playground, and `completeOnTimeout( 5, 100 )` on a finished future returned the timeout value. Treat the timeout functions as unreliable.
