---
title: Lists
summary: Delimited-list functions.
description: Delimited-list functions.
icon: phosphor-duotone:list-bullets
order: 7
---

Delimited-list functions. 35 entries. This page is generated from the MatchBox source; see the [function reference index](index.md) for how to read the tables and what each gate means.

| Function | Forms | Gate | Notes |
| --- | --- | --- | --- |
| `getToken` | `getToken( ... )`, `string.getToken( ... )`, `string.listGetToken( ... )` | always | Returns the nth token of a string split on the given delimiters. |
| `listAppend` | `listAppend( ... )`, `string.listAppend( ... )` | always | Adds an item at the end and returns the new list. |
| `listAvg` | `listAvg( ... )`, `string.listAvg( ... )` | always | Returns the average of numeric items. |
| `listChangeDelims` | `listChangeDelims( ... )`, `string.listChangeDelims( ... )` | always | Replaces the delimiter. |
| `listCompact` | `listCompact( ... )`, `string.listCompact( ... )` | always |  |
| `listContains` | `listContains( ... )`, `string.listContains( ... )` | always |  |
| `listContainsNoCase` | `listContainsNoCase( ... )`, `string.listContainsNoCase( ... )` | always |  |
| `listDeleteAt` | `listDeleteAt( ... )`, `string.listDeleteAt( ... )` | always | Removes the item at a position and returns the new list. |
| `listEach` | `listEach( ... )`, `string.listEach( ... )` | always |  |
| `listEvery` | `listEvery( ... )`, `string.listEvery( ... )` | always | Returns true when the callback is true for every item. |
| `listFilter` | `listFilter( ... )`, `string.listFilter( ... )` | always | Returns the items for which the callback returns true. |
| `listFind` | `listFind( ... )`, `string.listFind( ... )` | always | Returns the 1-based position of an item (case-sensitive), or 0. |
| `listFindNoCase` | `listFindNoCase( ... )`, `string.listFindNoCase( ... )` | always | Like listFind, ignoring case. |
| `listFirst` | `listFirst( ... )`, `string.listFirst( ... )` | always | Returns the first item. |
| `listGetAt` | `listGetAt( ... )`, `string.listGetAt( ... )` | always | Returns the item at a 1-based position. |
| `listGetEndings` | `listGetEndings( ... )` | always |  |
| `listIndexExists` | `listIndexExists( ... )` | always |  |
| `listInsertAt` | `listInsertAt( ... )` | always | Inserts an item at a position and returns the new list. |
| `listItemTrim` | `listItemTrim( ... )` | always |  |
| `listLast` | `listLast( ... )`, `string.listLast( ... )` | always | Returns the last item. |
| `listLen` | `listLen( ... )`, `string.listLen( ... )` | always | Returns the number of items; empty items are skipped by default. |
| `listMap` | `listMap( ... )`, `string.listMap( ... )` | always | Returns a list of the callback results. |
| `listNone` | `listNone( ... )`, `string.listNone( ... )` | always | Returns true when the callback is true for no item. |
| `listPrepend` | `listPrepend( ... )` | always | Adds an item at the start and returns the new list. |
| `listQualify` | `listQualify( ... )`, `string.listQualify( ... )` | always | Wraps each item in a qualifier character. |
| `listReduce` | `listReduce( ... )` | always | Folds the items into one value: callback( accumulator, item ), initial value. |
| `listReduceRight` | `listReduceRight( ... )`, `string.listReduceRight( ... )` | always |  |
| `listRemoveDuplicates` | `listRemoveDuplicates( ... )`, `string.listRemoveDuplicates( ... )` | always | Removes repeated items. |
| `listRest` | `listRest( ... )`, `string.listRest( ... )` | always | Returns the list without its first item. |
| `listSetAt` | `listSetAt( ... )` | always | Replaces the item at a position and returns the new list. |
| `listSome` | `listSome( ... )`, `string.listSome( ... )` | always | Returns true when the callback is true for at least one item. |
| `listSort` | `listSort( ... )`, `string.listSort( ... )` | always | Sorts the items; arguments are list, sort type and sort order. |
| `listToArray` | `listToArray( ... )`, `string.split( ... )` | always | Splits a list into an array; empty items are skipped unless the third argument is true. |
| `listValueCount` | `listValueCount( ... )`, `string.listValueCount( ... )` | always | Counts the items equal to a value. |
| `listValueCountNoCase` | `listValueCountNoCase( ... )`, `string.listValueCountNoCase( ... )` | always |  |
