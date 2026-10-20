---
title: Structs
summary: Struct functions and struct member functions.
description: Struct functions and struct member functions.
icon: phosphor-duotone:brackets-curly
order: 4
---

# Structs

Struct functions and struct member functions. 33 entries. This page is generated from the MatchBox source; see the [function reference index](index.md) for how to read the tables and what each gate means.

| Function | Forms | Gate | Notes |
| --- | --- | --- | --- |
| `queryStringToStruct` | `queryStringToStruct( ... )` | always | Parses a URL query string into a struct. |
| `structAppend` | `structAppend( target, source, overwrite = true )`, `struct.append( source, overwrite = true )` | always | Copies the keys of the second struct into the first, in place. Member form needs the prelude function kept; see "Prelude functions called as members" on the index page. |
| `structClear` | `structClear( ... )` | always | Removes all keys. |
| `structCopy` | `structCopy( struct )` | always | Returns a shallow copy. |
| `structCount` | `structCount( ... )` | always | Returns the number of keys. |
| `structDelete` | `structDelete( ... )` | always | Removes a key. |
| `structEach` | `structEach( struct, callback )`, `struct.each( callback )` | always | Member form needs the prelude function kept; see "Prelude functions called as members" on the index page. |
| `structEquals` | `structEquals( ... )`, `struct.equals( ... )` | always | Compares two structs by content. |
| `structEvery` | `structEvery( struct, callback )` | always | Returns true when the callback is true for every entry. |
| `structFilter` | `structFilter( struct, predicate )` | always | Returns the entries for which the callback returns true. |
| `structFind` | `structFind( ... )`, `struct.find( ... )` | always | Returns the value of a key. |
| `structFindKey` | `structFindKey( ... )`, `struct.findKey( ... )` | always |  |
| `structFindValue` | `structFindValue( struct, value, scope = "one" )` | always |  |
| `structGet` | `structGet( ... )` | always | Returns the value of a key. |
| `structGetMetadata` | `structGetMetadata( ... )`, `struct.getMetadata( ... )` | always |  |
| `structInsert` | `structInsert( ... )` | always | Adds a key; returns true. |
| `structIsCaseSensitive` | `structIsCaseSensitive( ... )`, `struct.isCaseSensitive( ... )` | always |  |
| `structIsEmpty` | `structIsEmpty( ... )`, `struct.isEmpty( ... )` | always | Returns true when the struct has no keys. |
| `structIsOrdered` | `structIsOrdered( ... )`, `struct.isOrdered( ... )` | always | Returns true for a struct created with structNew( "ordered" ). |
| `structKeyArray` | `structKeyArray( ... )` | always | Returns the keys as an array. |
| `structKeyExists` | `structKeyExists( ... )`, `struct.exists( ... )`, `struct.keyExists( ... )` | always | Returns true when the key exists. |
| `structKeyList` | `structKeyList( struct, delimiter = "," )` | always | Returns the keys as a delimited list, comma by default. |
| `structKeyTranslate` | `structKeyTranslate( ... )`, `struct.keyTranslate( ... )` | always |  |
| `structMap` | `structMap( struct, callback )` | always | Returns a struct of the callback results: callback( key, value ). |
| `structNew` | `structNew( ... )` | always |  |
| `structNone` | `structNone( struct, callback )` | always | Returns true when the callback is true for no entry. |
| `structReduce` | `structReduce( struct, callback, initialValue )` | always | Folds the entries into one value: callback( accumulator, key, value ), initial value. |
| `structSome` | `structSome( struct, callback )` | always | Returns true when the callback is true for at least one entry. |
| `structSort` | `structSort( struct, sortType = "text", sortOrder = "asc", path = "", callback = null )` | always |  |
| `structToQueryString` | `structToQueryString( ... )`, `struct.toQueryString( ... )` | always | Builds a URL query string from the entries. |
| `structToSorted` | `structToSorted( ... )`, `struct.toSorted( ... )` | always |  |
| `structUpdate` | `structUpdate( ... )` | always | Sets the value of a key. |
| `structValueArray` | `structValueArray( struct )` | always | Returns the values as an array. |
