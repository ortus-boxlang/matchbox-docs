---
title: Async and Futures
summary: Futures, executors, threads and locking.
description: Futures, executors, threads and locking.
icon: phosphor-duotone:lightning
order: 14
---

# Async and Futures

Futures, executors, threads and locking. 28 entries. This page is generated from the MatchBox source; see the [function reference index](index.md) for how to read the tables and what each gate means.

| Function | Forms | Gate | Notes |
| --- | --- | --- | --- |
| `asyncAllApply` | `asyncAllApply( ... )` | always | Applies a function to each element in parallel and returns the results in order. |
| `executorDelete` | `executorDelete( ... )` | always |  |
| `executorGet` | `executorGet( ... )` | always |  |
| `executorHas` | `executorHas( ... )` | always |  |
| `executorNew` | `executorNew( ... )` | always |  |
| `futureCompleteExceptionally` | `futureCompleteExceptionally( ... )`, `future.completeExceptionally( ... )` | always |  |
| `futureCompleteOnTimeout` | `futureCompleteOnTimeout( ... )`, `future.completeOnTimeout( ... )` | always |  |
| `futureExceptionally` | `futureExceptionally( ... )`, `future.exceptionally( ... )` | always | Handles an error in the future with a function. |
| `futureGetAsAttempt` | `futureGetAsAttempt( ... )`, `future.getAsAttempt( ... )` | always |  |
| `futureGetOrDefault` | `futureGetOrDefault( ... )`, `future.getOrDefault( ... )` | always |  |
| `futureIsCompletedExceptionally` | `futureIsCompletedExceptionally( ... )`, `future.isCompletedExceptionally( ... )` | always |  |
| `futureJoinOrDefault` | `futureJoinOrDefault( ... )`, `future.joinOrDefault( ... )` | always |  |
| `futureNew` | `futureNew( ... )` | always | Creates a future from a function. |
| `futureOnError` | `futureOnError( ... )`, `future.onError( ... )` | always |  |
| `futureOrTimeout` | `futureOrTimeout( ... )`, `future.orTimeout( ... )` | always |  |
| `futureThen` | `futureThen( ... )`, `future.then( ... )` | always | Chains a function onto a future's result. |
| `isInThread` | `isInThread( ... )` | always |  |
| `isThreadAlive` | `isThreadAlive( ... )` | always |  |
| `isThreadInterrupted` | `isThreadInterrupted( ... )` | always |  |
| `lock` | `lock( ... )` | always |  |
| `runAsync` | `runAsync( ... )` | always | Runs a function on another thread and returns a future. |
| `runThreadInContext` | `runThreadInContext( ... )` | always |  |
| `threadInterrupt` | `threadInterrupt( ... )` | always |  |
| `threadJoin` | `threadJoin( ... )` | always |  |
| `threadNew` | `threadNew( ... )` | always |  |
| `threadTerminate` | `threadTerminate( ... )` | always |  |
| `yield` | `yield( ... )` | always |  |
| `future.get` | `future.get( ... )` | always | Handled inside the VM; there is no global function with this name. |
