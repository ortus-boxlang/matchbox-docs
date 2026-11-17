---
title: Native Objects
description: Return Rust state to BoxLang as an object with methods, and keep BoxLang values between calls.
icon: phosphor-duotone:cube
---

A **native object** wraps Rust data in a BoxLang value. BoxLang code holds it, passes it around and calls its methods. MatchBox frees the Rust data when the object is garbage collected.

## Create an object

This example adds a running total to `bx-stats`:

```rust
// The Rust state.
struct Total {
    sum: f64,
}

// MatchBox calls this when the object is collected.
unsafe extern "C" fn drop_total(data: *mut c_void) {
    drop(unsafe { Box::from_raw(data.cast::<Total>()) });
}

// statsTotal( start = 0 ): a Total with add() and value() methods
unsafe extern "C" fn total_new(
    ctx: Context, api: *const ValuesV1, _: *mut c_void,
    args: *const Value, len: usize, out: *mut Value,
) -> i32 {
    unsafe {
        guarded(ctx, api, out, || {
            let call = Call::new(ctx, api, args, len);
            let start = call.number(call.argument(0)?)?;
            let data = Box::into_raw(Box::new(Total { sum: start })).cast();
            // Method name -> the BIF that implements it.
            call.object_new("stats.total.v1", data, drop_total, r#"{"add":"statsTotalAdd","value":"statsTotalValue"}"#)
                .inspect_err(|_| drop_total(data))
        })
    }
}
```

`object_new` takes:

| Argument | Description |
| --- | --- |
| `kind` | A type name for the payload, such as `"stats.total.v1"`. Reads must use the same name |
| `data` | A pointer to your Rust data |
| `drop` | The function that frees it. It must not panic |
| `methods` | JSON mapping method names to registered BIFs |

MatchBox owns the data only if `object_new` succeeds. On an error, free it yourself, as `inspect_err` does above.

## Implement the methods

A method is a normal registered BIF. The object is its first argument:

```rust
unsafe extern "C" fn total_add(
    ctx: Context, api: *const ValuesV1, _: *mut c_void,
    args: *const Value, len: usize, out: *mut Value,
) -> i32 {
    unsafe {
        guarded(ctx, api, out, || {
            let call = Call::new(ctx, api, args, len);
            let total = call.object_data(call.argument(0)?, "stats.total.v1")?.cast::<Total>().as_mut();
            total.sum += call.number(call.argument(1)?)?;
            call.number_new(total.sum)
        })
    }
}

unsafe extern "C" fn total_value(
    ctx: Context, api: *const ValuesV1, _: *mut c_void,
    args: *const Value, len: usize, out: *mut Value,
) -> i32 {
    unsafe {
        guarded(ctx, api, out, || {
            let call = Call::new(ctx, api, args, len);
            let total = call.object_data(call.argument(0)?, "stats.total.v1")?.cast::<Total>().as_ref();
            call.number_new(total.sum)
        })
    }
}
```

Register all three:

```rust
(r#"{"name":"statsTotal","arguments":[{"name":"start","default":0}]}"#, total_new),
(r#"{"name":"statsTotalAdd","arguments":[{"name":"total","required":true},{"name":"amount","required":true}]}"#, total_add),
(r#"{"name":"statsTotalValue","arguments":[{"name":"total","required":true}]}"#, total_value),
```

`object_data` checks that the value is a native object of that kind, and returns an error otherwise. Casting the pointer to the right Rust type is your responsibility.

## Use it from BoxLang

```boxlang
t = statsTotal( 10 );
t.add( 5 );
println( t.add( amount = 2.5 ) );  // 17.5
println( t.value() );              // 17.5
println( statsTotalValue( t ) );   // 17.5, the BIF works too
```

## Keep values between calls

Value handles last only for one call. To keep a BoxLang value, such as a callback, request `matchbox.roots.v1` and **retain** it:

```rust
static ROOTS: OnceLock<&'static RootsV1> = OnceLock::new();

// in a callback: keep the first argument
let roots = ROOTS.get().copied().ok_or("roots capability missing")?;
let saved: RetainedValue = call.retain(roots, call.argument(0)?)?;
// store `saved` in your object's Rust state

// in a later call: get it back
let value = saved.value(&later_call)?;

// release it by dropping it
drop(saved);
```

A retained value stays alive, with everything it references, until you drop the `RetainedValue`. Store it inside your native object's state, and it is released when the object is collected.

- Retained values belong to one VM and one plugin. Reading one from another VM fails.
- Dropping is safe at any time, even after the VM has shut down.
- `RetainedValue` is not `Send` or `Sync`: keep it on the VM thread.

!!! warning "Avoid cycles"
    Do not retain a value that refers back to the native object holding it, unless you provide an explicit way to release it. A strong cycle is never collected.

## Class providers

A native object or class can stand in for a Java class name, so code written for the JVM runs on MatchBox. See [Class Providers](../capabilities/class-providers.md).
