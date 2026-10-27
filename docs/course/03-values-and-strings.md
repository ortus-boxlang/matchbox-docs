---
title: Values and strings
summary: Variables, numbers, strings, interpolation and operators.
icon: phosphor-duotone:text-aa
tags: [course]
---

## Variables

You create a variable by assigning to it. There is no declaration keyword, and a variable can hold any type.

```boxlang title="variables.bxs"
name = "Ada";
age = 36;
isAdmin = true;

println( name );
println( age + 1 );
println( isAdmin );
```

Output:

```text
Ada
37
true
```

## Strings and interpolation

Put `#expression#` inside a double-quoted string to insert a value. The expression can be any code. Use `&` to join strings.

```boxlang title="strings.bxs"
name = "Ada";
age = 36;

println( "#name# is #age# years old" );
println( "Next year: #age + 1#" );
println( "Hello, " & name & "!" );
```

Output:

```text
Ada is 36 years old
Next year: 37
Hello, Ada!
```

To print a literal `#`, double it: `"Issue ##42"` prints `Issue #42`.

## String functions

Most string functions work both ways: `ucase( text )` or `text.ucase()`.

```boxlang title="string-functions.bxs"
title = "  MatchBox  ";

println( title.trim() );
println( title.trim().ucase() );
println( title.trim().lcase() );
println( title.trim().len() );
println( title.trim().left( 5 ) );
println( title.trim().reverse() );
println( "hello world".replace( "world", "MatchBox" ) );
println( ucFirst( "hello" ) );
```

Output:

```text
MatchBox
MATCHBOX
matchbox
8
Match
xoBhctaM
hello MatchBox
Hello
```

## Numbers and operators

```boxlang title="operators.bxs"
println( 10 / 4 );
println( 10 \ 4 );
println( 10 % 4 );
println( 2 ^ 10 );
println( 3 > 2 );
println( true && !false );
println( 3 > 2 ? "yes" : "no" );
println( "5" + 5 );
```

Output:

```text
2.5
2
2
1024
true
true
yes
10
```

`/` is normal division, `\` divides and drops the remainder, `%` is the remainder and `^` is a power. Notice that `"5" + 5` is `10`: BoxLang converts a numeric string to a number for arithmetic, while `&` always joins text.

## Missing values

`null` means "no value". The elvis operator `?:` supplies a default when the left side is null.

```boxlang title="defaults.bxs"
nickname = null;

println( nickname ?: "no nickname" );
println( isNull( nickname ) );
```

Output:

```text
no nickname
true
```

## Try it

Make `nickname` a string and run the sample again. Then write a line that prints your name in capitals, followed by its length.
