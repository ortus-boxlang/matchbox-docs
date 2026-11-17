---
title: Capabilities
description: What a MatchBox module can contribute to an application.
icon: phosphor-duotone:stack
---

A module contributes functionality by convention: put a file in the right folder and MatchBox registers it.

| Capability | Where | Page |
| --- | --- | --- |
| BIFs and member functions | `bifs/*.bx`, `bifs/*.bxs` | [BIFs](bifs.md) |
| Components | `components/*.bx` | [Components](components.md) |
| Interceptors | `interceptors` in `configure()` | [Interceptors](interceptors.md) |
| Custom events | `customInterceptionPoints` in `configure()` | [Interceptors](interceptors.md#custom-interception-points) |
| Classes | anywhere in the module, through the [mapping](../mappings.md) | [Mappings](../mappings.md) |
| `java:` class names | `classProviders` in `configure()` | [Class Providers](class-providers.md) |
| Native functions and objects | a prebuilt Rust plugin | [Native Plugins](../native/index.md) |

```text
greeter/
  box.json
  ModuleConfig.bx
  bifs/            global functions and member functions
  components/      bx: components
  interceptors/    event listeners (registered in configure())
  models/          classes, created through the mapping
  public/          static files for the web server
  modules/         nested modules
```

Folders other than `bifs/` and `components/` are conventions, not requirements. Interceptor and model classes can live anywhere in the module.
