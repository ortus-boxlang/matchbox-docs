---
title: Where to go next
summary: A map of what to explore after the basics, and what to watch out for in this release.
icon: phosphor-duotone:compass
tags: [course]
---

# Where to go next

You can now write and run MatchBox programs and ship them. Here is where each interest leads.

## Go deeper

| If you want to... | Read |
|---|---|
| Call Rust code from BoxLang | [Native Fusion](../building-and-deploying/native-fusion.md) |
| Serve HTTP and web pages | [HTTP](../http.md) and the [examples](../examples/index.md) |
| Run on AWS Lambda | [AWS Lambda](../building-and-deploying/aws-lambda-aws-cli-setup.md) |
| Run in a browser or on JavaScript hosts | [JavaScript and WebAssembly](../building-and-deploying/javascript-and-wasm.md) |
| Program a microcontroller | [ESP32](../building-and-deploying/esp32.md) |
| Understand the speed story | [JIT](../building-and-deploying/jit.md) |
| See every command and flag | [CLI reference](../reference/cli.md) |
| Compare with BoxLang on the JVM | [Differences from BoxLang](../differences-from-boxlang.md) |
| Keep experimenting | the [playground](../playground.md) |

## Things to watch for in 0.11.0

MatchBox is young, and it is honest to say where it is still rough. These all came up while writing this course, and every sample in the lessons avoids them:

- A function that returns a function using the outer function's own variables does not capture them yet (lesson 5).
- A constructor needs `return this`, or `new` gives you `null` (lesson 6).
- `variables.n++` as a statement inside a class fails. `variables.n += 1` works.
- Some members you may expect on values are missing, for example `keyArray()` on a struct and `contains()` or `substring()` on a string. The function forms such as `structKeyArray( s )` often exist.
- When you run a file with the CLI, a few array members such as `first()` and `sort( "numeric" )` can fail with `BIF ... not found`, because unused functions are trimmed from the build. Use the function form (`arraySort( a, "numeric" )`) or add `--no-shaking`. The browser playground is not affected.
- `dateFormat` uses Java-style masks, so `mm` means minutes and `MM` means month. Use `MM`.
- Operators spelled as words, such as `mod` and `not`, are not supported. Use `%` and `!`.

If you hit something else, please [open an issue](https://github.com/ortus-boxlang/matchbox/issues).

## Keep going

You finished the course. Thank you for learning MatchBox. The fastest way to get better now is to build something small and real: a script that reads your own data, a tiny web page, or a command-line tool. Come back to the [playground](../playground.md) any time you want to test an idea.
