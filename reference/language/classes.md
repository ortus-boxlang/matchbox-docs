---
title: Classes
description: Create objects with constructors, methods, properties and inheritance.
icon: phosphor-duotone:cube
---

A class groups data with the methods that work on it. Define one inside a script or in a `.bx` file, then create an instance with `new`.

## Constructor, this and variables

`init()` initializes the object. Use `this` for public fields and `variables` for private instance state. Returning `this` also makes methods chainable.

```boxlang title="class-basics.bxs"
class Counter {
    function init( start = 0 ) {
        variables.count = start;
        return this;
    }

    function increment() {
        variables.count += 1;
        return this;
    }

    function get() {
        return variables.count;
    }
}

println( new Counter( 5 ).increment().increment().get() );
```

```text
7
```

## File-based classes

Put a class in a file such as `models/Pet.bx`:

```boxlang
class {
    function init( name ) {
        this.name = name;
        return this;
    }

    function speak() {
        return "I am " & this.name;
    }
}
```

Import and use it from your application:

```boxlang
import models.Pet;
println( new Pet( "Rex" ).speak() );
```

File-based classes need a project filesystem; use inline classes in the browser playground.

## Inheritance and interfaces

Use `extends="Parent"` to inherit behavior and `implements="Interface"` to declare an interface. A child can override methods and call the parent implementation with `super.method()`.

```boxlang title="class-inheritance.bxs"
class Animal {
    function speak() {
        return "hello";
    }
}

class Dog extends="Animal" {
    function speak() {
        return super.speak() & " from Dog";
    }
}

println( new Dog().speak() );
```

```text
hello from Dog
```

## Properties and accessors

Properties provide getter and setter methods:

```boxlang title="class-accessors.bxs"
class Person accessors="true" {
    property name;
}

person = new Person();
person.setName( "Ann" );
println( person.getName() );
```

```text
Ann
```

For a guided introduction, see the [classes lesson](../../course/06-classes.md).
