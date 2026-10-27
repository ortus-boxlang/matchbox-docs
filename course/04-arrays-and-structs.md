---
title: Arrays and structs
summary: Lists and key-value data, and the loops that walk over them.
icon: phosphor-duotone:brackets-square
tags: [course]
---

An **array** is an ordered list. A **struct** is a set of named values, like an object or a dictionary. Between them they cover most of the data you will handle.

## Arrays

Array positions start at **1**, not 0. This surprises people coming from JavaScript or Rust, so it is worth a run.

```boxlang title="arrays.bxs"
colors = [ "red", "green", "blue" ];

println( colors[ 1 ] );
println( colors.len() );

colors.append( "violet" );
println( colors.toList( ", " ) );

colors[ 2 ] = "lime";
println( colors.toList( ", " ) );
println( colors[ 1 ] & " to " & colors[ colors.len() ] );
```

Output:

```text
red
3
red, green, blue, violet
red, lime, blue, violet
red to violet
```

`toList` turns an array into a delimited string, which is handy for printing. `append`, `prepend`, `pop` and `shift` add and remove items.

Sorting changes the array in place:

```boxlang title="sorting.bxs"
scores = [ 30, 4, 100, 12 ];
arraySort( scores, "numeric" );
println( scores.toList( "," ) );
```

Output:

```text
4,12,30,100
```

## Structs

```boxlang title="structs.bxs"
person = { name: "Ada", city: "London" };

println( person.name );
println( person[ "city" ] );

person.age = 36;
println( structCount( person ) );
println( person.keyExists( "age" ) );
println( person.keyExists( "email" ) );

structDelete( person, "city" );
println( structCount( person ) );
```

Output:

```text
Ada
London
3
true
false
2
```

Reach a value with a dot or with brackets. Brackets let you use a key that is stored in a variable. Assigning to a new key adds it.

## Nesting

Arrays and structs nest freely, which is how most real data looks.

```boxlang title="nested.bxs"
person = { name: "Ada", langs: [ "BoxLang", "Rust" ] };
println( person.langs[ 2 ] );

people = [
    { name: "Ada", age: 36 },
    { name: "Linus", age: 28 }
];

for ( p in people ) {
    println( p.name & " is " & p.age );
}
```

Output:

```text
Rust
Ada is 36
Linus is 28
```

## Loops

```boxlang title="loops.bxs"
for ( n in [ 10, 20, 30 ] ) {
    println( n );
}

for ( i = 1; i <= 3; i++ ) {
    println( "round " & i );
}

total = 0;
for ( n in 1..4 ) {
    total += n;
}
println( total );

count = 0;
while ( count < 3 ) {
    count += 1;
}
println( count );

for ( key, value in { a: 1, b: 2 } ) {
    println( key & "=" & value );
}
```

Output:

```text
10
20
30
round 1
round 2
round 3
10
3
a=1
b=2
```

`1..4` is a range. `for ( key, value in struct )` walks a struct. Do not rely on the order of struct keys.

## Try it

Add a `println` inside the `people` loop that only prints people older than 30. You will need an `if`, which lesson 7 covers in depth, but you can guess the shape.
