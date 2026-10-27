---
title: Destructuring, spread and ranges
description: Unpack collections, expand values and iterate over ranges.
icon: phosphor-duotone:arrows-out-line-horizontal
---

Destructuring extracts values, spread expands collections, and ranges describe sequences for iteration.

## Destructuring

Pull values out of a struct or an array in one statement.

```boxlang title="destructure.bxs"
{ name, age } = { name: "Ann", age: 30 };
println( name & " is " & age );

{ name: who } = { name: "Bob" };
println( who );

[ first, second ] = [ 10, 20, 30 ];
println( first & "," & second );

{ a, b } = { a: 1 };
println( isNull( b ) );
```

Output:

```text
Ann is 30
Bob
10,20
true
```

- A struct pattern matches by key. `{ name: who }` renames.
- A key that is missing from the struct leaves the variable null.
- Destructuring works inside functions too.

Use `...rest` to collect remaining values:

```boxlang title="destructure-rest.bxs"
[ first, ...rest ] = [ 10, 20, 30 ];
println( first );
println( serializeJSON( rest ) );
```

```text
10
[20,30]
```

## Spread

`...` expands an array into an array literal or a call, and a struct into a struct literal.

```boxlang title="spread.bxs"
base = [ 1, 2 ];
println( serializeJSON( [ 0, ...base, 3 ] ) );
println( serializeJSON( [ ...base, ...base ] ) );

defaults = { color: "red" };
println( serializeJSON( { ...defaults, size: 9 } ) );

function add( p, q ) {
    return p + q;
}
println( add( ...[ 3, 4 ] ) );
```

Output:

```text
[0,1,2,3]
[1,2,1,2]
{"color":"red","size":9}
7
```

To override existing struct keys, use `structAppend` rather than spreading a duplicate key into a literal:

```boxlang
merged = duplicate( defaults );
structAppend( merged, { color: "blue" } );
```

## Ranges

`a..b` is an inclusive range and `a..<b` stops before `b`. Both are meant for `for ... in`.

```boxlang title="ranges.bxs"
for ( i in 1..3 ) {
    println( "up " & i );
}
for ( i in 3..1 ) {
    println( "down " & i );
}
for ( i in 1..<4 ) {
    println( "short " & i );
}
n = 3;
for ( i in 1..n ) {
    println( "var " & i );
}
total = 0;
for ( i in 1..100 ) {
    total += i;
}
println( total );
```

Output:

```text
up 1
up 2
up 3
down 3
down 2
down 1
short 1
short 2
short 3
var 1
var 2
var 3
5050
```

Ranges are useful in loops; use `arraySlice( array, start, length )` for a portion of an array. If an exclusive range might be empty, check the bounds before iterating.

See also [operators](operators.md) and [sets](sets.md).
