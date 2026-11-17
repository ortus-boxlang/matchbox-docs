---
title: JVM Differences
description: How MatchBox modules compare with BoxLang modules on the JVM.
icon: phosphor-duotone:arrows-left-right
---

MatchBox follows BoxLang's module system: the same package layout, `ModuleConfig.bx`, settings, BIFs, components and interceptors. The difference is the backend. JVM modules can use Java; MatchBox modules use BoxLang and Rust.

## At a glance

| Feature | BoxLang (JVM) | MatchBox |
| --- | --- | --- |
| `box.json`, `ModuleConfig.bx`, settings | Yes | Yes |
| `configure()`, `onLoad()`, `onUnload()` | Yes | Yes |
| BoxLang BIFs, `@BoxBIF`, `@BoxMember` | Yes | Yes |
| Components | Yes | Yes |
| Interceptors and custom points | Yes | Yes, global pool only |
| Mappings and packaged classes | Yes | Yes |
| Nested modules, `this.modules` | Yes | Yes, literal overrides |
| Java BIFs and classes from `libs/*.jar` | Yes | No: use a [native plugin](native/index.md) |
| Native Rust plugins | No | Yes |
| `java:` classes | The real Java classes | [Class providers](capabilities/class-providers.md) |
| Services, schedulers, cache providers, JDBC drivers | Yes | No |
| Hot reload, `boxModuleReload()` | Yes | No: it throws |

## What is the same

A pure BoxLang module that sticks to BoxLang code usually runs on both without changes. Settings overrides use the same `modules.<name>.settings` keys in `boxlang.json`.

## What is different

### Discovery happens up front

MatchBox discovers modules before the program starts, and native binaries embed them. Because of that:

- `this.enabled`, `this.dependencies` and `this.modules` must be literal values.
- There is no hot reload. Native libraries stay loaded for the life of the process.

### Services are a subset

The injected `boxRuntime`, `interceptorService`, `componentService` and `functionService` cover the common module tasks listed on the [Module Descriptor](module-descriptor.md#services) page. Other methods throw an error instead of quietly returning nothing. Cache, datasource, scheduler and async services are not injected.

### Events are a subset

MatchBox announces module load and unload events, function invoke events and your custom points. Application, request, template and other JVM event families are not announced.

### Some reflection is missing

`getFunctionList()` and `getComponentList()` throw. Use `functionService.hasGlobalFunction()` and `componentService.getComponentNames()` instead.

### Component flags

`ignoreEnableOutputOnly=true` and `autoEvaluateBodyExpressions=true` depend on JVM output rules and are rejected. Source-backed CFML custom tags are not supported.

### Java

There is no JVM. Java classes come from [class providers](capabilities/class-providers.md), or from the optional JNI bridge in builds that include it.

## Porting a JVM module

1. **Start with the BoxLang parts.** BIFs, components, interceptors and settings written in BoxLang usually work as they are.
2. **List the Java parts.** Each Java BIF or class needs a MatchBox backend.
3. **Write the backend.** Use BoxLang where it is fast enough, and a [native plugin](native/index.md) where it is not.
4. **Keep one API.** Use the same names and arguments, and test both with one script. See [Dual Modules](dual-modules.md).
5. **Fail clearly.** Where a feature cannot exist on MatchBox, throw a clear error.
