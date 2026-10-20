---
title: Functions and callbacks
summary: Functions, default and named arguments, arrow functions, and map, filter and reduce.
icon: phosphor-duotone:function
tags: [course]
---

# Functions and callbacks

## Functions

```boxlang title="functions.bxs"
function greet( name, greeting = "Hello" ) {
    return greeting & ", " & name;
}

println( greet( "Ada" ) );
println( greet( "Ada", "Hi" ) );
println( greet( greeting = "Hey", name = "Linus" ) );
```

Output:

```text
Hello, Ada
Hi, Ada
Hey, Linus
```

A parameter with `=` has a default. You can also pass arguments **by name**, in any order.

Functions can call themselves:

```boxlang title="recursion.bxs"
function factorial( n ) {
    return n <= 1 ? 1 : n * factorial( n - 1 );
}

println( factorial( 10 ) );
```

Output:

```text
3628800
```

## Arrow functions

An arrow function is a short, nameless function. It is often passed to another function.

```boxlang title="arrows.bxs"
double = n => n * 2;
add = ( a, b ) => a + b;

println( double( 4 ) );
println( add( 2, 3 ) );
```

Output:

```text
8
5
```

## Map, filter and reduce

Arrays come with three workhorses. `map` transforms every item, `filter` keeps some of them, and `reduce` folds the array down to one value.

```boxlang title="pipeline.bxs"
words = [ "box", "lang", "match" ];

println( words.map( w => w.ucase() ).toList( " " ) );
println( words.filter( w => w.len() > 3 ).toList( "," ) );
println( words.reduce( ( total, w ) => total + w.len(), 0 ) );

nums = [ 1, 2, 3, 4, 5, 6 ];
sumOfSquares = nums
    .filter( n => n % 2 == 0 )
    .map( n => n * n )
    .reduce( ( a, n ) => a + n, 0 );
println( sumOfSquares );
```

Output:

```text
BOX LANG MATCH
lang,match
12
56
```

`each`, `every` and `some` work the same way. `every` is true when the callback is true for all items, `some` when it is true for at least one.

```boxlang title="every-some.bxs"
println( [ 1, 2, 3 ].every( n => n > 0 ) );
println( [ 1, 2, 3 ].some( n => n > 2 ) );
[ "a", "b" ].each( v => println( "item " & v ) );
```

Output:

```text
true
true
item a
item b
```

## Functions as values

A function is a value, so you can pass one to another function.

```boxlang title="higher-order.bxs"
function apply( fn, value ) {
    return fn( value );
}

println( apply( s => s.ucase(), "shout" ) );
println( apply( n => n + 1, 41 ) );
```

Output:

```text
SHOUT
42
```

## Known limitation in 0.11.0

An arrow function can read and update variables at the top level of your script. A function that **returns** another function which uses the outer function's own variables (a counter factory, for example) does not capture those variables correctly yet: they read as `null`. Until that is fixed, keep state in a [class](06-classes.md) instead.

## Try it

Write an arrow function `isLong` that returns true for words longer than 4 letters, then use it with `filter` on the `words` array.
