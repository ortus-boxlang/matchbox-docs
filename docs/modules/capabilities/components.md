---
title: Components
description: Add bx: components (tags) to MatchBox from a module.
icon: phosphor-duotone:brackets-angle
---

Components are named blocks, like tags, that can take attributes and a body. Each class in `components/` becomes a component named after its file.

## A simple component

```boxlang
// components/Hello.bx
class {
    function invoke( context, attributes, body, executionState ) {
        writeOutput( "Hello, " & ( attributes.name ?: "world" ) & "!" );
    }
}
```

Use it in script:

```boxlang
bx:hello name="Luis";
```

Or in a template:

```html
<bx:hello name="Luis" />
```

MatchBox passes `context`, `attributes`, `body` and `executionState` as named arguments, so their order in `invoke()` does not matter.

## Components with a body

Allow a body with `@AllowsBody( true )`, or require one with `@RequiresBody( true )`:

```boxlang
// components/Banner.bx
@AllowsBody( true )
class {
    function invoke( context, attributes, body, executionState ) {
        var buffer = newBuffer();
        var result = processBody( context, body, buffer );
        writeOutput( "*** " & ( attributes.title ?: "" ) & ": " & trim( buffer.toString() ) & " ***" );
        return result;
    }
}
```

```boxlang
bx:banner title="News" {
    writeOutput( "MatchBox modules" );
}
// *** News: MatchBox modules ***
```

Using a body on a component without `@AllowsBody`, or leaving out the body of a `@RequiresBody` component, is an error. A self-closing tag still gets an empty body.

## Helpers

Components get these helpers, along with the services that BIFs receive:

| Helper | Description |
| --- | --- |
| `newBuffer()` | A buffer that captures body output |
| `newBuilder()` | A string builder |
| `processBody( context, body, buffer )` | Runs the body, sending its output to `buffer` |
| `getName()` | The component's name |

The body can run more than once, for example in a loop component. Nested captures restore the outer buffer, and an error in the body restores output before it is rethrown.

## Body results

`processBody()` returns a result describing how the body ended:

| Method | Description |
| --- | --- |
| `isEarlyExit()` | The body returned, broke or continued |
| `isReturn()` | The body ran `return` |
| `isBreak( [label] )` | The body ran `break` |
| `isContinue( [label] )` | The body ran `continue` |
| `returnValue()` | The value of a `return` |

Return the result from `invoke()` to pass a `return`, `break` or `continue` on to the surrounding code, or handle it yourself.

## The component stack

`context` is the live execution context. Use it to find enclosing components:

```boxlang
var parent = context.findClosestComponent( "form" );
```

`context.getComponents()` returns the stack, nearest first.

## Aliases

`@BoxComponent` follows the same rules as [`@BoxBIF`](bifs.md#aliases-with-boxbif):

```boxlang
@BoxComponent( [ "banner", "headline" ] )
@AllowsBody( true )
class { ... }
```

Registered components are listed in `getModuleInfo( "greeter" ).components`, and `componentService.hasComponent( "banner" )` checks for one.
