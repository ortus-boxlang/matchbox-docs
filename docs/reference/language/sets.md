---
title: Sets
description: Create sets, compare collections and combine values with set algebra.
icon: phosphor-duotone:circles-three
---

# Sets

A set holds each value once. Create one with a literal, `setNew()`, `setOf()` or `toSet()`.

## Creating a set

```boxlang title="set-create.bxs"
a = set{ 3, 1, 2, 3 };
println( a.size() );

empty = set{};
println( empty.isEmpty() );

b = setOf( "x", "y", "x" );
println( b.toList( "," ) );

c = [ 5, 5, 6 ].toSet();
println( c.toList( "," ) );

d = setNew( type = "linked", values = [ 3, 1, 2, 3 ] );
println( d.toList( "," ) );
```

Output:

```text
3
true
x,y
5,6
3,1,2
```

`set{}` is a literal: the word `set` followed by braces. `setNew()` takes `type` (`default`, `linked` or `sorted`) and `values`. `listToSet( "a,b,a" )` and `structKeySet( struct )` also return sets.

## Order

| Type | Ordering |
| --- | --- |
| default and `linked` | Insertion order. |
| `sorted` | Sorted once, when `setNew()` builds it from `values`. Values you `add()` later are appended, not sorted. |

```boxlang title="set-sorted.bxs"
s = setNew( type = "sorted", values = [ 10, 9, 100 ] );
println( s.toList( "," ) );
s.add( 1 );
println( s.toList( "," ) );
```

Output:

```text
9,10,100
9,10,100,1
```

A set is stored as an array that skips duplicates when it is built. `isArray( s )` is `true`, `s[ 1 ]` reads the first value, `println( s )` prints it like an array and `serializeJSON( s )` returns an array. `s instanceOf "set"` is `false`.

## Operators and algebra

When either operand is a set, `+`, `-`, `*` and `^` do set algebra, and the other operand can be an array.

| Operator | Member function | Result |
| --- | --- | --- |
| `a + b` | `a.union( b )` | Values in either set. |
| `a - b` | `a.difference( b )` | Values in `a` and not in `b`. |
| `a * b` | `a.intersection( b )` | Values in both. |
| `a ^ b` | `a.symmetricDifference( b )` | Values in exactly one. |

```boxlang title="set-algebra.bxs"
a = setOf( 1, 2, 3 );
b = setOf( 2, 3, 4 );

println( ( a + b ).toList( "," ) );
println( ( a - b ).toList( "," ) );
println( ( a * b ).toList( "," ) );
println( ( a ^ b ).toList( "," ) );

println( a.isSubsetOf( setOf( 1, 2, 3, 4 ) ) );
println( a.isSupersetOf( setOf( 1 ) ) );
println( a.isDisjointFrom( setOf( 9 ) ) );
println( ( a + [ 3, 7 ] ).toList( "," ) );
```

Output:

```text
1,2,3,4
1
2,3
1,4
true
true
true
1,2,3,7
```

Only an array works as the loose right operand. `a + "7,8"` is string concatenation and gives `[1,2]7,8`, and `[ 9 ] + a` is an array join.

## Member functions

| Group | Works |
| --- | --- |
| Add and remove | `add`, `append`, `addAll`, `remove`, `delete`, `removeAll`, `retainAll`, `clear` |
| Query | `contains`, `has`, `size`, `len`, `length`, `count`, `isEmpty`, `isSubsetOf`, `isSupersetOf`, `isDisjointFrom`, `isCaseSensitive`, `isSynchronized` |
| Algebra | `union`, `intersection`, `difference`, `symmetricDifference` |
| Functional | `each`, `map`, `filter`, `reduce`, `every`, `some`, `none`, `find`, `reject` |
| Convert | `toArray`, `toList( delimiter )` |

```boxlang title="set-functional.bxs"
s = setOf( 1, 2, 3, 4 );
println( s.map( x => x * 10 ).toList( "," ) );
println( s.filter( x => x > 2 ).toList( "," ) );
println( s.reduce( ( total, x ) => total + x, 0 ) );
println( s.every( x => x > 0 ) );
println( s.some( x => x > 3 ) );
println( s.none( x => x > 9 ) );
println( s.find( x => x > 2 ) );
```

Output:

```text
10,20,30,40
3,4
10
true
true
true
3
```

## Adding unique values

Use `union` or `+` when adding values that may already exist. These operations preserve uniqueness; direct append-style methods can introduce duplicates.

See also [destructuring, spread and ranges](destructuring-spread-ranges.md) and [operators](operators.md).
