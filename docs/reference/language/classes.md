---
title: Classes
description: What MatchBox 0.11.0 supports for classes, inheritance, interfaces, properties and static members, and where it differs from BoxLang.
icon: phosphor-duotone:cube
---

# Classes

The [classes lesson](../../course/06-classes.md) teaches the basics. This page lists what works and what does not in 0.11.0. Snippets with a Run button ran in the browser playground.

## Where a class can live

- Inline in a `.bxs` script, as in the snippets below.
- In a `.bx` file whose name is the class name. The header is `class { ... }` and the file name supplies the name.

```boxlang
// models/Pet.bx
class {
    function init( name ) { this.name = name; return this; }
    function speak() { return "I am " & this.name; }
}
```

```boxlang
// main.bxs
import models.Pet;
p = new Pet( "rex" );
println( p.speak() );
q = new models.Pet( "tom" );
println( q.speak() );
```

On the CLI this prints `I am rex` and `I am tom`. The playground has no file system, so file-based classes only work from the CLI or a build.

## Constructor, this and variables

```boxlang title="class-basics.bxs"
class Counter {
    function init( start = 0 ) {
        variables.n = start;
        this.label = "ctr";
        return this;
    }
    function inc() {
        variables.n = variables.n + 1;
        return this;
    }
    function get() {
        return variables.n;
    }
}

c = new Counter( 1 ).inc().inc();
println( c.get() );
println( c.label );
println( isNull( c.n ) );
println( c instanceOf "Counter" );
println( new Counter( start = 7 ).get() );
```

Output:

```text
3
ctr
true
true
7
```

`this.x` is public. `variables.x` is stored on the instance but is not visible from outside.

### init must return this

`new C()` returns the value `init()` returns. Without `return this`, you get null.

```boxlang
class C {
    function init() { x = 1; }
    function getX() { return 1; }
}
c = new C();
println( isNull( c ) );
println( c.getX() );
```

```text
true
Error: VM Runtime Error: ExpressionException: Method getX not found on null.
```

BoxLang returns the instance regardless. This is [issue #76](https://github.com/ortus-boxlang/matchbox/issues/76), with a fix in [PR #84](https://github.com/ortus-boxlang/matchbox/pull/84). Until a release includes it, end every `init` with `return this`.

## Inheritance and interfaces

The header takes attributes: `extends="Parent"`, `implements="Interface"` and `accessors="true"`. The BoxLang-style words `class Dog extends Animal` and `class Dog implements Shape` are parse errors (`expected =, found identifier`).

```boxlang title="class-inheritance.bxs"
interface Shape {
    function area();
}

class Square implements="Shape" {
    function init( side ) {
        this.side = side;
        return this;
    }
    function area() {
        return this.side * this.side;
    }
}

class Animal {
    function init() {
        this.sound = "...";
        return this;
    }
    function speak() {
        return this.sound;
    }
    function hello() {
        return "hi " & who();
    }
    function who() {
        return "animal";
    }
}

class Cat extends="Animal" {
    function init() {
        this.sound = "meow";
        return this;
    }
}

class Dog extends="Animal" {
    function who() {
        return "dog";
    }
}

println( new Square( 3 ).area() );
println( new Cat().speak() );
println( new Dog().hello() );
```

Output:

```text
9
meow
hi dog
```

### Not supported

| Feature | MatchBox 0.11.0 | BoxLang 1.13 |
| --- | --- | --- |
| `super.method()` and `super.init()` | `Variable 'super' not found in class or global scope.` ([issue #82](https://github.com/ortus-boxlang/matchbox/issues/82)) | Works. |
| Inherited `init()` when the child has none | Not called. `new Dog().sound` is null for the `Dog` above, which has no `init`. ([issue #83](https://github.com/ortus-boxlang/matchbox/issues/83)) | Called. |
| `class Dog extends Animal` | Parse error | Not tested. Use `extends="Animal"`. |
| `private` | Parsed, not enforced. `new A().secret()` runs. | Enforced. |
| `S::make()` | Parse error: `expected ), found ::` | Works. |
| `static { }` blocks | Parse error: `unexpected token in expression: static` | Not tested. |

For `super`, the workaround is to repeat the parent's assignments in the child, or to call a helper method that both classes share. For the inherited `init`, define `init` in the child.

## Static functions

`static function` parses and runs, but you call it on an instance:

```boxlang
class S {
    static function make() { return 1; }
    function init() { return this; }
}
println( new S().make() );
```

This prints `1`. `S.make()` fails with `Method make not found` and `S::make()` is a parse error.

## Properties and accessors

Use the bare form `property name;`. With `accessors="true"` the class gets `getName()` and `setName()`.

```boxlang title="class-accessors.bxs"
class Person accessors="true" {
    property name;
    property age;
    function init() {
        return this;
    }
}

p = new Person();
p.setName( "Ann" );
p.setAge( 5 );
println( p.getName() & " " & p.getAge() );
println( isNull( p.name ) );
```

Output:

```text
Ann 5
true
```

- `property name default="x";` is a parse error (`unexpected token in expression: default`), and so is `property name="n";`. `property string name;` parses but does not create `name`: `setName()` then fails with `Variable 'name' not found in class or global scope.`
- Setters return null, so `p.setName( "Ann" ).setAge( 5 )` fails with `Method setAge not found`. BoxLang setters return the instance. Call them as separate statements.
- The property is not readable as `p.name` from outside. BoxLang allows it.

## Other behavior

```boxlang title="class-other.bxs"
class Ghost {
    function init() {
        return this;
    }
    function onMissingMethod( name, args ) {
        return "missing:" & name;
    }
}
println( new Ghost().anything() );

function typed( numeric n ) {
    return n;
}
println( typed( "abc" ) );
```

Output:

```text
missing:anything
abc
```

- `onMissingMethod` works.
- Type hints on parameters are not enforced: `typed( "abc" )` returns `abc`.
- A missing `required` argument does not throw: `function f( required x ) { return "ok"; } f()` returns `ok`. BoxLang throws `Required argument [x] is missing for function [f]`.
- `println( instance )` prints `<instance of Name>`; a `toString()` method is not used.
- You can add keys to an instance (`s.dyn = 5`), but `structKeyExists( s, "dyn" )` is `false`.
- `@Name` annotations parse in front of a function inside a class. At the top of a script, `@Foo("bar") function f() {}` is a parse error.
