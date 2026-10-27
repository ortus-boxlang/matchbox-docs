---
title: Scopes
description: Variables, function arguments, closures and web request scopes in MatchBox.
icon: phosphor-duotone:stack
---

A scope is a named place to store variables. Scripts, functions, classes and web requests each provide context for the values you use.

## Scripts and functions

At script level, bare names and `variables` refer to script variables. Inside functions, use `var` or `local` for local values and `arguments` for parameters.

```boxlang title="scope-function.bxs"
function greet( name, greeting = "Hello" ) {
    var message = greeting & ", " & arguments.name;
    return message;
}

println( greet( "Ann" ) );
println( greet( greeting = "Hi", name = "Bob" ) );
```

```text
Hello, Ann
Hi, Bob
```

## Closures

A closure can use values from its enclosing function:

```boxlang title="scope-closures.bxs"
function adder( amount ) {
    return value => value + amount;
}

addFive = adder( 5 );
println( addFive( 10 ) );
```

```text
15
```

## Classes

Inside a class, `this` holds public state and `variables` holds private instance state. See [classes](classes.md).

## Web scopes

When serving templates, MatchBox provides scopes for the current request:

| Scope | Contents |
| --- | --- |
| `url` | Query-string parameters. |
| `form` | Posted form fields. |
| `cookie` | Request cookies. |
| `session` | State associated with the session cookie. |
| `cgi` | Request information such as the method and path. |

Web scopes belong to the server environment, not an ordinary CLI script. Session storage and application lifecycle depend on the server you use; see [Web server](../../building-and-deploying/web-server.md).
