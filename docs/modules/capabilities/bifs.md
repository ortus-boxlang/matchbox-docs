---
title: BIFs
description: Add global functions and member functions to MatchBox from a module.
icon: phosphor-duotone:function
---

BIFs (built-in functions) are global: once the module loads, every script and class can call them without an import.

## Class BIFs

Each class in `bifs/` becomes a BIF named after its file. MatchBox calls its `invoke()` method:

```boxlang
// bifs/Greet.bx
class {
    function invoke( required string name, string greeting = "Hello" ) {
        return greeting & ", " & name & "!";
    }
}
```

```boxlang
println( greet( "Luis" ) );                         // Hello, Luis!
println( greet( name = "Ana", greeting = "Hola" ) ); // Hola, Ana!
```

Positional and named arguments, defaults and `required` all work as in any BoxLang function.

### Injected references

Class BIFs receive `moduleRecord`, `boxRuntime`, `log`, `functionService`, `interceptorService` and `componentService` in their `variables` scope:

```boxlang
class {
    function invoke( required string name ) {
        log.debug( "greet called from #moduleRecord.name#" );
        return getModuleSettings( moduleRecord.name ).greeting & ", " & name;
    }
}
```

### Call details

Inside `invoke()`:

| Variable | Description |
| --- | --- |
| `arguments` | Declared arguments, plus any extra positional or named values |
| `__functionName` | The name the BIF was called by, such as an alias |
| `__isMemberExecution` | `true` when called as a member function |

## Script BIFs

A `.bxs` file in `bifs/` can declare several functions at once. Each one becomes a BIF:

```boxlang
// bifs/text.bxs
function shout( required string text ) {
    return uCase( text ) & "!";
}

function whisper( required string text ) {
    return lCase( text ) & "...";
}
```

Script BIFs are a good fit for thin wrappers, such as BoxLang functions over a [native plugin](../native/index.md). Use class BIFs when you need aliases, member functions or injected references.

## Aliases with @BoxBIF

`@BoxBIF` sets the names a class BIF is registered under:

```boxlang
@BoxBIF( "salute" )              // only salute(), not greet()
class { ... }

@BoxBIF( [ "greet", "hi" ] )     // greet() and hi()
class { ... }
```

| Annotation | Registered names |
| --- | --- |
| none, or `@BoxBIF` | The file name |
| `@BoxBIF( "name" )` | That name only |
| `@BoxBIF( [ "a", "b" ] )` | The file name plus the names in the array |

!!! note "Annotations, not comments"
    Registration comes from annotations. `@BoxBIF` in a doc comment is documentation only, as on the JVM.

## Member functions with @BoxMember

`@BoxMember` makes the BIF callable on a value. The value is passed as the first declared argument:

```boxlang
// bifs/Greet.bx
@BoxMember( "string" )
class {
    function invoke( required string name, string greeting = "Hello" ) {
        return greeting & ", " & name & "!";
    }
}
```

```boxlang
println( "world".greet() );         // Hello, world!
println( "world".greet( "Hey" ) );  // Hey, world!
```

### Name and receiver

Use a struct to choose the member name and which argument receives the value:

```boxlang
@BoxBIF( [ "decorate", "wrap" ] )
@BoxMember( { string: { name: "decorate", objectArgument: "text" } } )
class {
    function invoke( required string prefix, required string text, string suffix = "!" ) {
        return prefix & text & suffix;
    }
}
```

```boxlang
decorate( "> ", "hi" );                          // > hi!
"hi".decorate( "> " );                           // > hi!
"hi".decorate( prefix = "<", suffix = ">" );     // <hi>
```

One BIF can be a member of several types:

```boxlang
@BoxMember( { string: { name: "describe" }, array: { name: "describe" } } )
class {
    function invoke( required any value ) {
        return isArray( value ) ? "an array" : "a string";
    }
}
```

### Member types

| Group | Types |
| --- | --- |
| Text | `string`, `string_strict`, `list` |
| Numbers | `numeric`, `integer`, `long`, `double` |
| Collections | `array`, `struct`, `structloose`, `modifiablearray`, `assignablearray`, `modifiablestruct` |
| Other | `boolean`, `date`, `datetime`, `class`, `function`, `closure`, `lambda`, `udf`, `any` |

Any other target, such as a JVM-only type, fails at startup with `Invalid or unsupported BoxMember type`.

## Native BIFs

A [native plugin](../native/index.md) registers BIFs from Rust. They are called exactly like BoxLang BIFs, and a BoxLang BIF can call them to add validation, defaults or member functions.

## Check what is registered

```boxlang
println( getModuleInfo( "greeter" ).bifs );           // [ Greet, ... ]
println( getModuleInfo( "greeter" ).memberMethods );  // [ { name, type, objectArgument } ]
println( boxRuntime.getFunctionService().hasGlobalFunction( "greet" ) );
```
