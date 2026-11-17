---
title: Modules
description: Add reusable BoxLang code, settings and native functionality to an application.
icon: phosphor-duotone:puzzle-piece
---

A module is a reusable BoxLang package. It can provide functions, member functions, components, interceptors, classes and settings, with an optional native Rust backend.

```sh
bx-module install bx-matchbox-std --local   # into ./boxlang_modules
matchbox --module ../greeter app.bxs        # or select a folder; options come before the script
```

```boxlang
println( getModuleSettings( "greeter" ).greeting );
```

The full guide is in [Module Development](../../modules/index.md):

::: cards
::: card title="Using Modules" icon="phosphor-duotone:download-simple" href="../../modules/using-modules.md"
Install, select and configure modules.
:::
::: card title="Getting Started" icon="phosphor-duotone:rocket-launch" href="../../modules/getting-started.md"
Build your first module in pure BoxLang.
:::
::: card title="Capabilities" icon="phosphor-duotone:stack" href="../../modules/capabilities/index.md"
BIFs, components, interceptors and class providers.
:::
::: card title="Native Plugins" icon="phosphor-duotone:cpu" href="../../modules/native/index.md"
Add a Rust backend with the Plugin SDK.
:::
:::
