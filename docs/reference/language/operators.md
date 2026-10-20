---
title: Operators
description: Arithmetic, string, comparison, logical, bitwise, castAs, instanceOf, elvis and safe navigation operators in MatchBox 0.11.0, with the word operators that are missing.
icon: phosphor-duotone:plus-minus
---

# Operators

Every row below was run on MatchBox 0.11.0. Where BoxLang 1.13 on the JVM behaves differently, the table says so.

## Arithmetic and strings

| Operator | Meaning | Example | Result |
| --- | --- | --- | --- |
| `+` `-` `*` `/` | Arithmetic | `10 / 4` | `2.5` |
| `%` | Remainder, sign follows the left operand | `-7 % 3` | `-1` |
| `\` | Integer division | `10 \ 3` | `3` |
| `^` | Power | `2 ^ 10` | `1024` |
| `&` | String concatenation | `"abc" & 1` | `abc1` |
| `+=` `-=` `*=` `/=` `%=` `&=` | Compound assignment | `x = 10; x %= 3` | `1` |
| `++` `--` | Increment and decrement | `i++` | |

`**` and `<=>` are parse errors. Division by zero throws `ExpressionException: Division by zero`.

`+` on two numeric strings adds them (`"5" + "6"` is `11`). `1 + "x"` returns `1x`, while BoxLang throws `Can't cast [x] to a Number`.

## Comparison and logic

```boxlang title="comparison.bxs"
println( 5 == 5 );
println( 5 eq 5 );
println( 5 neq 4 );
println( 5 != 4 );
println( 3 lte 3 );
println( 3 gte 4 );
println( "a" < "b" );
println( 1 is 1 );
println( "abc" contains "B" );
println( "abc" does not contain "x" );
println( true && false || true );
println( true and false );
println( true xor false );
println( 1 eqv 1 );
println( !false );
```

Output:

```text
true
true
true
true
true
false
true
true
true
true
true
false
true
true
true
```

String comparison ignores case: `"a" == "A"` is `true`. `===` behaves like `==`, which BoxLang does too.

### Word operators that are missing

| Operator | MatchBox 0.11.0 | BoxLang 1.13 |
| --- | --- | --- |
| `not` | Parse error: `unexpected token in expression: not`. Use `!`. | Works. |
| `mod` | `7 mod 3` inside an expression is a parse error. As a statement, `y = 7 mod 3;` stores `7` with no error: the `mod 3` part is ignored. Use `%`. | `1` |
| `ne` | Parse error. Use `neq` or `!=`. | Not tested. |
| `imp`, `doesnotcontain` | Parse error. | Not tested. |
| `??=` | Parse error: `unexpected token in expression: ?`. Write `x = x ?: 3`. | Also a parse error in the 1.13 build used here. |

The silent `mod` case is the dangerous one. Search ported code for ` mod `.

## Bitwise

BoxLang spells bitwise operators with a `b` prefix.

```boxlang title="bitwise.bxs"
println( 5 b& 3 );
println( 5 b| 3 );
println( 5 b^ 3 );
println( b~ 5 );
println( 1 b<< 4 );
println( 256 b>> 4 );
println( 16 b>>> 2 );
```

Output:

```text
1
7
6
-6
16
16
4
```

Both operands must be numbers.

## castAs and instanceOf

`castAs` takes the type name as a string. Wrap it in parentheses when you combine it with other operators, because the string after `castAs` swallows what follows.

```boxlang title="cast.bxs"
println( ( 5 castAs "string" ) & "!" );
println( ( "3.5" castAs "numeric" ) + 1 );
println( "yes" castAs "boolean" );
println( "a" instanceOf "string" );
println( 1 instanceOf "numeric" );
println( { } instanceOf "struct" );
println( [ ] instanceOf "array" );
println( ( x => x ) instanceOf "function" );
println( 1 instanceOf "string" );
```

Output:

```text
5!
4.5
true
true
true
true
true
true
false
```

- `"abc" castAs "numeric"` throws `BoxCastException: Could not cast object [abc] to type [numeric]`.
- `7.9 castAs "integer"` throws a `BoxCastException`. BoxLang does too.
- `x castAs string` without quotes fails.
- `setValue instanceOf "set"` is `false` for a [set](sets.md).

## Elvis, ternary and safe navigation

```boxlang title="null-operators.bxs"
n = null;
println( n ?: "was null" );
println( "" ?: "not used" );
println( 5 > 3 ? "yes" : "no" );

s = { a: { b: 2 } };
println( s?.a?.b );
println( s.missing?.deeper ?: "safe" );
println( isNull( n?.a ) );
```

Output:

```text
was null

yes
2
safe
true
```

`?:` only replaces null. An empty string passes through, so the second line prints an empty line.

A `?.` guards only the step it is on. `n?.a.b` with `n` null throws `Member access only supported on structs, instances, JS objects, and native objects`. BoxLang returns null. Write `n?.a?.b`.

## Statements that fail

`variables.n++` as a statement throws `Fused increment only supported on structs and instances for now`. `variables.n += 1`, `this.n++` and `x = variables.n++` work. See [known issues](../../differences-from-boxlang.md).

For sets and ranges see [sets](sets.md) and [destructuring, spread and ranges](destructuring-spread-ranges.md).
