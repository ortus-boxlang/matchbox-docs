---
title: Agentic Development
description: Use coding agents effectively with MatchBox through project context, focused skills, and real validation.
order: 7
icon: phosphor-duotone:robot
tags: [ai, agents, getting-started]
---

# Agentic Development with MatchBox

Agentic development is the practice of working with an AI coding agent that can inspect a project, make changes, and run its checks. MatchBox is one pillar of the BoxLang software productivity platform; the agent still needs clear project constraints and a way to validate its work.

For BoxLang's broader approach to agentic development, see the [official Agentic Development guide](https://boxlang.ortusbooks.com/getting-started/agentic-development).

## Give the agent project context

Add an `AGENTS.md` at the root of an application repository. State which MatchBox targets the application supports, how it is built and tested, and which capabilities are intentionally unavailable. Keep the guidance close to the code and update it when the project changes.

The MatchBox repository includes focused skills under `.agents/skills/`, including `runner-development` for ESP32 runner work. Skills add task-specific workflows; they do not replace checking the actual application and current MatchBox source.

## Keep the feedback loop executable

An agent should run the same checks a developer would run and report what it could not validate. For an application, document the relevant commands, for example:

```sh
matchbox --version
matchbox tests/smoke.bxs
matchbox --target native app.bxs
```

The right checks depend on the target. Browser output, WASI components, and ESP32 firmware need their own runtime or toolchain validation. A successful local script run does not prove an artifact works on every target.

## Prefer bounded tasks

Start with a behavior, target, and acceptance check. Ask the agent to inspect nearby code and relevant skills before changing files; have it show the exact commands and results afterward. Keep secrets out of prompts and test with safe local fixtures.

::: prompt description="Plan a focused MatchBox change with executable checks" icon="phosphor-duotone:robot"
Inspect this repository's AGENTS.md and the relevant .agents/skills before changing code. Identify the MatchBox target and existing tests for this behavior. Make the smallest change that satisfies the request, run the focused checks, and report the exact commands, results, and any target-specific behavior you could not verify. Do not claim support for a target you did not test.
:::

## Separate development AI from application AI

An agent helping write an application is not the same feature as an AI capability running inside that application. For the latter, see [BoxLang AI](boxlang-ai.md). MatchBox is not a blanket guarantee that BoxLang JVM AI libraries or integrations are available; check the specific runtime and target first in [compatibility and target differences](../differences-from-boxlang.md).