---
title: Destructuring, spread and ranges
description: What destructuring assignment, the spread operator and range expressions support in MatchBox 0.11.0, and where they stop.
icon: phosphor-duotone:arrows-out-line-horizontal
---

# Destructuring, spread and ranges

Snippets with a Run button ran in the browser playground, and the CLI printed the same output.

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

### Limits

| Form | Result in MatchBox 0.11.0 | BoxLang 1.13 on the JVM |
| --- | --- | --- |
| `[ a, ...rest ] = [ 1, 2, 3 ]` | Parses, but `rest` is null with no error. | `rest` is `[ 2, 3 ]`. |
| `{ p, ...others } = { p: 1, q: 2 }` | Parses, but `others` is null with no error. | `others` is `{ q : 2 }`. |
| `[ x, y ] = [ 1 ]` | Fails with `Array index out of bounds`. | `y` is null. |
| `var { a, b } = { a: 1, b: 2 }` | Parse error: `expected identifier, found {`. | Supported. |

Workaround for the rest of an array: `arraySlice( a, 2, arrayLen( a ) )`.

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

Not supported:

- A rest parameter such as `function f( ...nums )` is a parse error (`expected identifier, found ...`).
- Destructuring in a parameter list, `function f( { a, b } )`, is a parse error too.
- A struct literal that spreads a struct and also sets one of its keys crashes the VM, in either order. `{ ...defaults, color: "blue" }` aborts the CLI with exit code 134 and panics in the playground. To override a key, copy and append: `merged = duplicate( defaults ); structAppend( merged, { color: "blue" } );`.

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

A range stored in a variable prints as `1..5` and `arrayLen( r )` returns its size. It is not an array:

- `r.len()` and `r.toArray()` fail with `Method ... not found`.
- `arrayMap( 1..3, fn )` fails with `Invalid access: base must be array or struct`.
- `a[ 2..3 ]` fails with `Array index must be a number`.
- `for ( i in 1..<1 )` runs twice, with `i` set to 1 and then 0. `1..<1` should be empty. Guard it with `if ( start < end )`.

For a slice of an array use `arraySlice`. Its third argument is an end position in 0.11.0, not a length: `arraySlice( [ 10, 20, 30, 40 ], 2, 3 )` returns `[ 20, 30 ]`, and `arraySlice( a, 2 )` with no third argument returns an empty array.

See also [operators](operators.md) and [sets](sets.md).
