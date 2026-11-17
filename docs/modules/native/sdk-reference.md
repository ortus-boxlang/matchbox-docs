---
title: SDK Reference
description: The MatchBox Plugin SDK, its capabilities, function registration and the Call helpers.
icon: phosphor-duotone:book-open
---

The **MatchBox Plugin SDK** (`matchbox-plugin-sdk`) is a small Rust crate with no dependencies outside the standard library. It wraps a versioned C ABI, so a plugin does not depend on MatchBox's internals or on a particular Rust compiler version.

```toml
[dependencies]
matchbox-plugin-sdk = { git = "https://github.com/ortus-boxlang/matchbox", rev = "<commit>" }
```

The SDK is only needed to **build** a plugin. People who use your module never install it.

## The entry point

Every plugin exports one function:

```rust
#[unsafe(no_mangle)]
pub unsafe extern "C" fn matchbox_plugin_init_v1(host: *const HostV1, ctx: Context) -> i32 {
    // 1. request capabilities
    // 2. register functions
    0 // success
}
```

Return `0` on success. Any other value fails startup with the error the plugin reported.

`HostV1` gives the plugin:

| Field | Description |
| --- | --- |
| `abi_major` | The ABI version, `1` |
| `capability( name )` | Looks up a capability table by name |
| `register( ctx, metadata, invoke )` | Registers a function |
| `error( ctx, message )` | Reports an initialization error |

## Capabilities

A capability is a named table of functions. A plugin asks for what it needs during initialization. If the host does not have it, initialization fails with a clear message such as `Missing required capability: matchbox.types.v1`.

| Capability | Request with | Provides |
| --- | --- | --- |
| `matchbox.values.v1` | `require_values()` | Numbers, strings, booleans, null, structs, native objects and errors |
| `matchbox.types.v1` | `require_types()` | A value's kind, and strict boolean reads |
| `matchbox.collections.v1` | `require_collections()` | Arrays, struct reads and struct keys |
| `matchbox.bytes.v1` | `require_bytes()` | Binary values |
| `matchbox.roots.v1` | `require_roots()` | Values kept between calls |

!!! note "The newest capabilities"
    `matchbox.types.v1` and `matchbox.collections.v1` are the most recent additions and need a recent MatchBox build. On an older MatchBox, a plugin that requires them fails at startup with the missing capability message.

The returned tables are valid for the life of the process. Store them in a `static`:

```rust
static COLLECTIONS: OnceLock<&'static CollectionsV1> = OnceLock::new();

let c = match require_collections(host, ctx) {
    Ok(c) => c,
    Err(status) => return status,
};
let _ = COLLECTIONS.set(c);
```

### Compatibility rules

- The ABI major version and every capability's layout and behaviour never change.
- New features come as new capabilities. Old ones stay, so existing plugins keep working.
- A plugin built against a newer SDK can run on an older MatchBox only if the older MatchBox has every capability it requires.

## Registering functions

Register each function with JSON metadata and a callback:

```rust
((*host).register)(
    ctx,
    Text::new(r#"{
        "name": "statsChunk",
        "aliases": ["chunk"],
        "arguments": [
            { "name": "values", "required": true },
            { "name": "size", "default": 2 }
        ]
    }"#),
    chunk,
);
```

| Key | Description |
| --- | --- |
| `name` | The BIF name |
| `aliases` | Other names for the same function |
| `arguments` | In order: `name`, `required` and an optional `default` (null, a number, a string or a boolean) |

MatchBox maps positional and named arguments, which are case-insensitive, into that order and fills in defaults. An unknown or repeated argument is an error, so the callback always receives the declared arguments in order.

## The callback

```rust
unsafe extern "C" fn chunk(
    ctx: Context,
    api: *const ValuesV1,
    _: *mut c_void,
    args: *const Value,
    len: usize,
    out: *mut Value,
) -> i32 {
    unsafe {
        guarded(ctx, api, out, || {
            let call = Call::new(ctx, api, args, len);
            // ... return Ok(value) or Err(message)
            call.null_new()
        })
    }
}
```

- `guarded` runs the closure, writes its result to `out`, and turns `Err(message)` into a BoxLang exception. It also catches Rust panics.
- `Call::new` wraps the raw pointers in a safe helper.

!!! warning "Never let a panic cross the boundary"
    Always wrap callbacks in `guarded`, and build with `panic = "unwind"`. With `panic = "abort"` a panic ends the whole program.

## Call helpers

### Arguments

| Method | Returns |
| --- | --- |
| `argument( i )` | The argument at position `i` (0-based) |

### Reading values

| Method | Capability | Returns |
| --- | --- | --- |
| `number( v )` | values | `f64` |
| `string( v )` | values | `String` |
| `kind( types, v )` | types | `Kind`: `Null`, `Bool`, `Number`, `String`, `Array`, `Struct`, `Binary` or `Other` |
| `boolean( types, v )` | types | `bool`. Strict: the string `"yes"` is an error, not `true` |
| `array_len( c, array )` | collections | `usize` |
| `array_get( c, array, i )` | collections | The element at `i` (0-based). Past the end is an error |
| `struct_get( c, struct, key )` | collections | `Option<Value>`. Keys are case-insensitive; a missing key is `None` |
| `struct_keys( c, struct )` | collections | `Vec<String>`, in the struct's order |
| `bytes( b, v )` | bytes | `Vec<u8>` |
| `object_data( v, kind )` | values | The payload of a [native object](native-objects.md) |

`Kind::Other` covers native objects, classes, functions, queries and anything else.

### Creating values

| Method | Capability | Creates |
| --- | --- | --- |
| `null_new()` | values | `null` |
| `bool_new( b )` | values | A boolean |
| `number_new( n )` | values | A number |
| `string_new( s )` | values | A string |
| `struct_new()` | values | An empty struct |
| `struct_set( struct, key, value )` | values | Sets a key |
| `array_new( c )` | collections | An empty array |
| `array_push( c, array, value )` | collections | Appends to an array |
| `bytes_new( b, bytes )` | bytes | A binary value (the bytes are copied) |
| `object_new( kind, data, drop, methods )` | values | A [native object](native-objects.md) |
| `retain( roots, v )` | roots | A [retained value](native-objects.md#keep-values-between-calls) |

Arrays and structs can be nested: push an array into an array, or set a struct as a struct key. Values a plugin creates during a call are safe from garbage collection until the call returns.

## Binary data

`matchbox.bytes.v1` passes binary values without converting them to text, so NUL bytes and invalid UTF-8 are preserved:

```rust
static BYTES: OnceLock<&'static BytesV1> = OnceLock::new();

// in a callback
let b = BYTES.get().copied().ok_or("bytes capability missing")?;
let data = call.bytes(b, call.argument(0)?)?;   // Vec<u8>
let reversed: Vec<u8> = data.into_iter().rev().collect();
call.bytes_new(b, &reversed)
```

From BoxLang, pass binary values such as the result of `charsetDecode()` or `fileReadBinary()`.

## Lifetimes and threads

- Value handles, strings and the context pointer are valid **only during the call** that received them. Use [roots](native-objects.md#keep-values-between-calls) to keep a value longer.
- All calls are synchronous, on the VM thread. There are no async callbacks.
- MatchBox and the plugin each free their own memory. No Rust `String`, `Vec` or trait object crosses the boundary.
- Libraries stay loaded until the process exits. There is no unload or hot reload.

!!! danger "Trusted code"
    A native plugin is ordinary native code that runs with the application's permissions. It is not sandboxed. The SHA-256 in `box.json` proves the bytes did not change; it does not prove who wrote them. Only use plugins you trust.

## API documentation

The crate's [README](https://github.com/ortus-boxlang/matchbox/tree/develop/crates/matchbox-plugin-sdk) and source have the full interface. Run `cargo doc --open` in your plugin to browse it.
