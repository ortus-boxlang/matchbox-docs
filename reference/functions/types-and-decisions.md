---
title: Types and Decisions
summary: Type checks, conversions and boolean formatting.
description: Type checks, conversions and boolean formatting.
icon: phosphor-duotone:question
order: 9
---

Type checks, conversions and boolean formatting. 36 entries. This page is generated from the MatchBox source; see the [function reference index](index.md) for how to read the tables and what each gate means.

| Function | Forms | Gate | Notes |
| --- | --- | --- | --- |
| `booleanFormat` | `booleanFormat( ... )`, `boolean.booleanFormat( ... )`, `boolean.trueFalseFormat( ... )`, `number.booleanFormat( ... )`, `number.trueFalseFormat( ... )`, `string.booleanFormat( ... )`, `string.trueFalseFormat( ... )` | always | Converts a value to the string "true" or "false". |
| `cast` | `cast( ... )` | always |  |
| `duplicate` | `duplicate( ... )`, `array.duplicate( ... )`, `datetime.duplicate( ... )`, `struct.duplicate( ... )` | always | Returns a deep copy. |
| `getMetaData` | `getMetaData( ... )` | always |  |
| `isArray` | `isArray( ... )` | always | Returns true for an array. |
| `isBinary` | `isBinary( ... )` | always |  |
| `isBoolean` | `isBoolean( ... )` | always | Returns true for a boolean value. |
| `isClosure` | `isClosure( ... )` | always | Returns true for a closure or lambda. |
| `isCustomFunction` | `isCustomFunction( ... )` | always |  |
| `isDate` | `isDate( ... )` | always | Returns true for a date object or a string that parses as a date. |
| `isDateObject` | `isDateObject( ... )` | always |  |
| `isDebugMode` | `isDebugMode( ... )` | always |  |
| `isDefined` | `isDefined( ... )` | always | Returns true when a variable with the given name exists. |
| `isEmpty` | `isEmpty( ... )`, `string.isEmpty( ... )` | always | Returns true for an empty string, array or struct. |
| `isFileObject` | `isFileObject( ... )` | always |  |
| `isInstanceOf` | `isInstanceOf( ... )` | always |  |
| `isIPv6` | `isIPv6( ... )` | always |  |
| `isLocalHost` | `isLocalHost( ... )` | always |  |
| `isNull` | `isNull( ... )` | always |  |
| `isNumeric` | `isNumeric( ... )` | always | Returns true for a number or a numeric string. |
| `isNumericDate` | `isNumericDate( ... )` | always |  |
| `isObject` | `isObject( ... )` | always |  |
| `isQuery` | `isQuery( ... )` | always | Returns true for a query object. |
| `isRange` | `isRange( ... )` | always |  |
| `isSimpleValue` | `isSimpleValue( ... )` | always | Returns true for a string, number, boolean or date. |
| `isString` | `isString( ... )` | always |  |
| `isStruct` | `isStruct( ... )` | always | Returns true for a struct. |
| `isValid` | `isValid( ... )` | always | Validates a value against a type such as "email" or "integer". |
| `nullValue` | `nullValue( ... )` | always |  |
| `parseNumber` | `parseNumber( ... )` | always | Parses a numeric string. |
| `toModifiable` | `toModifiable( ... )`, `array.toModifiable( ... )`, `struct.toModifiable( ... )` | always |  |
| `toNumeric` | `toNumeric( ... )` | always | Converts a value to a number. |
| `toString` | `toString( ... )`, `string.toString( ... )`, `struct.toString( ... )` | always | Converts a value to a string. |
| `toUnmodifiable` | `toUnmodifiable( ... )`, `array.toUnmodifiable( ... )`, `struct.toUnmodifiable( ... )` | always |  |
| `trueFalseFormat` | `trueFalseFormat( ... )` | always |  |
| `yesNoFormat` | `yesNoFormat( ... )` | always | Returns "Yes" or "No". |
