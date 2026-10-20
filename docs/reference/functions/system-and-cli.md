---
title: System and CLI
summary: Output, runtime information, process execution, command-line input, Java interop and TUI classes.
description: Output, runtime information, process execution, command-line input, Java interop and TUI classes.
icon: phosphor-duotone:terminal-window
order: 10
---

# System and CLI

Output, runtime information, process execution, command-line input, Java interop and TUI classes. 50 entries. This page is generated from the MatchBox source; see the [function reference index](index.md) for how to read the tables and what each gate means.

| Function | Forms | Gate | Notes |
| --- | --- | --- | --- |
| `boxAnnounce` | `boxAnnounce( ... )` | always |  |
| `boxAST` | `boxAST( ... )` | always |  |
| `boxModuleReload` | `boxModuleReload( ... )` | always |  |
| `cliClear` | `cliClear( ... )` | `bif-cli` |  |
| `cliConfirm` | `cliConfirm( ... )` | `bif-cli` |  |
| `cliExit` | `cliExit( ... )` | `bif-cli` |  |
| `cliGetArgs` | `cliGetArgs( ... )` | `bif-cli` |  |
| `cliIsTerminal` | `cliIsTerminal( ... )` | `bif-cli` |  |
| `cliRead` | `cliRead( ... )` | `bif-cli` |  |
| `cliReadKey` | `cliReadKey( ... )` | `bif-cli` |  |
| `cliReadPassword` | `cliReadPassword( ... )` | `bif-cli` |  |
| `cliSelect` | `cliSelect( ... )` | `bif-cli` |  |
| `createGUID` | `createGUID( ... )` | always | Creates a random identifier in the form 8-4-4-4-12 hex digits. |
| `createObject` | `createObject( ... )` | always | `createObject( "java", class )` needs the `bif-jni` feature; `"rust"` constructs a registered native class. |
| `createUUID` | `createUUID( ... )` | always | Creates a random identifier in the form 8-4-4-4-12 hex digits. |
| `echo` | `echo( ... )` | always |  |
| `exit` | `exit( ... )` | `bif-cli` |  |
| `getBaseTagData` | `getBaseTagData( ... )` | always |  |
| `getBaseTagList` | `getBaseTagList( ... )` | always |  |
| `getBaseTemplatePath` | `getBaseTemplatePath( ... )` | always |  |
| `getBoxContext` | `getBoxContext( ... )` | always |  |
| `getBoxVersionInfo` | `getBoxVersionInfo( ... )` | always |  |
| `getComponentList` | `getComponentList( ... )` | always |  |
| `getCurrentTemplatePath` | `getCurrentTemplatePath( ... )` | always |  |
| `getFunctionCalledName` | `getFunctionCalledName( ... )` | always |  |
| `getFunctionList` | `getFunctionList( ... )` | always |  |
| `getModuleInfo` | `getModuleInfo( ... )` | always |  |
| `getModuleList` | `getModuleList( ... )` | always |  |
| `getSystemSetting` | `getSystemSetting( ... )` | always | Reads an environment variable, with an optional default for when it is not set. |
| `invoke` | `invoke( ... )` | always |  |
| `print` | `print( ... )` | always |  |
| `println` | `println( ... )` | always |  |
| `sleep` | `sleep( ... )` | always | Pauses the program for the given number of milliseconds. |
| `systemExecute` | `systemExecute( ... )` | always | Runs a program and returns a struct with output, error, exitCode, pid, terminated and timeout. It always fails with "systemExecute() is not supported on this target" on wasm and ESP32 targets. |
| `systemOutput` | `systemOutput( ... )` | always |  |
| `trace` | `trace( ... )` | always |  |
| `tui.App` | `createObject( "rust", "tui.App" )` | `bif-tui` | Native class; create it with createObject. |
| `tui.Block` | `createObject( "rust", "tui.Block" )` | `bif-tui` | Native class; create it with createObject. |
| `tui.Button` | `createObject( "rust", "tui.Button" )` | `bif-tui` | Native class; create it with createObject. |
| `tui.Custom` | `createObject( "rust", "tui.Custom" )` | `bif-tui` | Native class; create it with createObject. |
| `tui.HBox` | `createObject( "rust", "tui.HBox" )` | `bif-tui` | Native class; create it with createObject. |
| `tui.Input` | `createObject( "rust", "tui.Input" )` | `bif-tui` | Native class; create it with createObject. |
| `tui.List` | `createObject( "rust", "tui.List" )` | `bif-tui` | Native class; create it with createObject. |
| `tui.ProgressBar` | `createObject( "rust", "tui.ProgressBar" )` | `bif-tui` | Native class; create it with createObject. |
| `tui.Table` | `createObject( "rust", "tui.Table" )` | `bif-tui` | Native class; create it with createObject. |
| `tui.Text` | `createObject( "rust", "tui.Text" )` | `bif-tui` | Native class; create it with createObject. |
| `tui.TUI` | `createObject( "rust", "tui.TUI" )` | `bif-tui` | Native class; create it with createObject. |
| `tui.VBox` | `createObject( "rust", "tui.VBox" )` | `bif-tui` | Native class; create it with createObject. |
| `writeLog` | `writeLog( ... )` | always |  |
| `writeOutput` | `writeOutput( ... )` | always |  |
