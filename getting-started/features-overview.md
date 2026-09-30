---
title: Language Essentials
description: A practical tour of BoxLang syntax and features implemented in MatchBox.
order: 5
icon: phosphor-duotone:brackets-curly
---

# Language essentials

MatchBox implements a growing subset of BoxLang. These examples introduce common syntax; check [compatibility and target differences](../differences-from-boxlang.md) before moving a JVM application.

## Variables and strings

```boxlang
name = "MatchBox";
active = true;
versionCount = 3;
println("Hello, #name#!");
println("Built with " & name);
```

Variables are dynamically typed. Use `&` for concatenation and `#expression#` for interpolation in strings.

## Arrays and structs

```boxlang
targets = ["native", "browser", "embedded"];
println(targets[1]); // arrays are 1-indexed
arrayAppend(targets, "wasi");

project = { name: "Hello", ready: true };
println(project.NAME); // struct keys are case-insensitive

lengths = arrayMap(targets, (target) => len(target));
```

## Control flow and functions

```boxlang
for (target in targets) {
    if (target == "native") {
        println("Build an executable");
    } else {
        println("Explore " & target);
    }
}

function greet(name = "world") {
    return "Hello, " & name;
}

double = (number) => number * 2;
println(greet());
println(double(21));
```

MatchBox supports functions, closures, arrow functions, default arguments, and type hints. Other supported constructs include `while`, `switch`, `break`, `continue`, and conditional expressions; confirm behavior in the version and target you ship.

## Classes and asynchronous work

```boxlang
class Product accessors="true" {
    property name;
    property price;
}

product = new Product();
product.setName("Widget");
println(product.getName());

future = runAsync(() => {
    sleep(100);
    return "done";
});
println(future.get());
```

The VM includes classes, inheritance, interfaces, exception handling, and cooperative fibers. Do not assume that every JVM threading, library, or host API is available. See the [BoxLang language documentation](https://boxlang.ortusbooks.com/) for the broader language reference.
