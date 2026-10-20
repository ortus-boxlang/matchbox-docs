---
title: Running work at the same time
summary: Futures, runAsync and then, and how the browser build runs them.
icon: phosphor-duotone:lightning
tags: [course]
---

# Running work at the same time

A **future** stands for a value that is not ready yet. `runAsync` starts some work and hands you a future straight away. You call `get()` on it when you need the result.

## Your first future

```boxlang title="future.bxs"
answer = runAsync( () => 6 * 7 );

println( "started" );
println( answer.get() );
```

Output:

```text
started
42
```

## Several at once

Start more than one future, then collect the results.

```boxlang title="two-futures.bxs"
slow = runAsync( () => {
    sleep( 20 );
    return "slow";
} );
fast = runAsync( () => "fast" );

println( fast.get() & " then " & slow.get() );
```

Output:

```text
fast then slow
```

## Chaining

`then` runs a function on the result when it arrives, and gives you a new future.

```boxlang title="then.bxs"
result = runAsync( () => 10 ).then( n => n * 2 );
println( result.get() );
```

Output:

```text
20
```

## Measuring time

`getTickCount()` returns milliseconds, and `sleep( ms )` pauses.

```boxlang title="timing.bxs"
start = getTickCount();
sleep( 30 );
elapsed = getTickCount() - start;
println( elapsed >= 30 );
```

Output:

```text
true
```

## In the browser

The playground runs on a single thread, so futures take turns rather than running truly in parallel. That is enough to learn the shape of the API. On a native build the same code can use the machine's threads. The playground also stops any run after five seconds, so a script that waits too long ends with an error.

## Try it

Start three futures that each `sleep` for a different time and return a different word. Print them in the order you started them.
