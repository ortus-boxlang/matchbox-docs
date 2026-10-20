---
title: Classes and objects
summary: Bundle data and behavior together, with a constructor and methods you can chain.
icon: phosphor-duotone:cube
tags: [course]
---

# Classes and objects

A **class** bundles data with the functions that work on it. You create an object from a class with `new`.

## A first class

```boxlang title="counter.bxs"
class Counter {
    function init( start = 0 ) {
        variables.count = start;
        return this;
    }

    function increment() {
        variables.count = variables.count + 1;
        return this;
    }

    function get() {
        return variables.count;
    }
}

c = new Counter( 5 );
c.increment();
c.increment();
println( c.get() );
```

Output:

```text
7
```

- `init` is the **constructor**. It runs when you call `new Counter( 5 )`.
- **Always end `init` with `return this`.** In MatchBox 0.11.0 a constructor without it gives you `null` instead of an object.
- `variables.count` is **private** state, stored inside the object. Code outside the class reaches it only through the methods.
- `this` is the object itself.

## Chaining

Because `increment` returns `this`, calls can be chained:

```boxlang title="chaining.bxs"
class Counter {
    function init( start = 0 ) {
        variables.count = start;
        return this;
    }

    function increment() {
        variables.count = variables.count + 1;
        return this;
    }

    function get() {
        return variables.count;
    }
}

println( new Counter().increment().increment().increment().get() );
```

Output:

```text
3
```

## Public data

Values you store on `this` are public. That is simple, but it means anyone can change them.

```boxlang title="account.bxs"
class Account {
    function init( owner, balance = 0 ) {
        this.owner = owner;
        variables.balance = balance;
        return this;
    }

    function deposit( amount ) {
        variables.balance = variables.balance + amount;
        return this;
    }

    function withdraw( amount ) {
        if ( amount > variables.balance ) {
            throw( type = "Funds", message = "Insufficient funds" );
        }
        variables.balance = variables.balance - amount;
        return this;
    }

    function getBalance() {
        return variables.balance;
    }
}

account = new Account( "Ada", 100 );
account.deposit( 50 ).withdraw( 30 );
println( account.owner & " has " & account.getBalance() );

try {
    account.withdraw( 500 );
} catch ( Funds e ) {
    println( "Refused: " & e.message );
}
```

Output:

```text
Ada has 120
Refused: Insufficient funds
```

Here the owner is public on `this`, while the balance is private, so the only way to change it is through `deposit` and `withdraw`, which enforce the rules. The `try` and `catch` at the bottom are the subject of the next lesson.

## A class that holds a collection

```boxlang title="stack.bxs"
class Stack {
    function init() {
        variables.items = [];
        return this;
    }

    function push( value ) {
        variables.items.append( value );
        return this;
    }

    function pop() {
        return variables.items.pop();
    }

    function size() {
        return variables.items.len();
    }
}

s = new Stack().push( 1 ).push( 2 ).push( 3 );
println( s.pop() );
println( s.size() );
```

Output:

```text
3
2
```

## Going further

Inheritance, interfaces and the other class features are covered, along with where MatchBox differs from BoxLang on the JVM, in [differences from BoxLang](../differences-from-boxlang.md). Check there before relying on them: some forms of inheritance syntax are not supported yet.

## Try it

Add a `reset()` method to `Counter` that sets the count back to zero and returns `this`.
