---
title: Strings
summary: String, regular expression and StringBuilder functions.
description: String, regular expression and StringBuilder functions.
icon: phosphor-duotone:text-aa
order: 2
---

# Strings

String, regular expression and StringBuilder functions. 81 entries. This page is generated from the MatchBox source; see the [function reference index](index.md) for how to read the tables and what each gate means.

| Function | Forms | Gate | Notes |
| --- | --- | --- | --- |
| `ascii` | `ascii( ... )`, `string.ascii( ... )` | always | Returns the character code of the first character. |
| `camelCase` | `camelCase( ... )`, `string.camelCase( ... )` | always | Converts text to camelCase. |
| `char` | `char( ... )` | always |  |
| `chr` | `chr( ... )` | always | Returns the character for a character code. |
| `compare` | `compare( ... )`, `string.compare( ... )` | always | Compares two strings case-sensitively and returns -1, 0 or 1. |
| `compareNoCase` | `compareNoCase( ... )`, `string.compareNoCase( ... )` | always | Like compare, ignoring case. |
| `find` | `find( ... )` | always | Returns the 1-based position of the first case-sensitive match, or 0. |
| `findNoCase` | `findNoCase( ... )` | always | Like find, ignoring case. |
| `findOneOf` | `findOneOf( ... )`, `string.findOneOf( ... )` | always |  |
| `indexOf` | `indexOf( ... )`, `string.indexOf( ... )` | always |  |
| `insert` | `insert( ... )`, `string.insert( ... )` | always | Inserts text after the given position: insert( text, string, position ). |
| `isStringBuilder` | `isStringBuilder( ... )` | always | Returns true for a StringBuilder object. |
| `jsStringFormat` | `jsStringFormat( ... )`, `string.jsFormat( ... )`, `string.jsStringFormat( ... )` | always |  |
| `kebabCase` | `kebabCase( ... )`, `string.kebabCase( ... )` | always | Converts text to kebab-case. |
| `lcase` | `lcase( ... )`, `string.lcase( ... )`, `string.toLowerCase( ... )` | always | Converts a string to lower case. |
| `left` | `left( ... )`, `string.left( ... )` | always | Returns the first n characters. |
| `len` | `len( ... )`, `array.count( ... )`, `array.len( ... )`, `array.length( ... )`, `array.size( ... )`, `datetime.len( ... )`, `number.len( ... )`, `number.length( ... )`, `string.len( ... )`, `string.length( ... )`, `struct.count( ... )`, `struct.len( ... )` | always |  |
| `ljustify` | `ljustify( ... )`, `string.ljustify( ... )` | always | Pads on the right so the text is left-justified in the given width. |
| `ltrim` | `ltrim( ... )`, `string.ltrim( ... )` | always | Removes leading whitespace. |
| `mid` | `mid( ... )`, `string.mid( ... )` | always | Returns count characters starting at a 1-based position. |
| `paragraphFormat` | `paragraphFormat( ... )`, `string.paragraphFormat( ... )` | always |  |
| `pascalCase` | `pascalCase( ... )`, `string.pascalCase( ... )` | always | Converts text to PascalCase. |
| `preserveSingleQuotes` | `preserveSingleQuotes( ... )` | always |  |
| `reEscape` | `reEscape( ... )` | always |  |
| `reFind` | `reFind( ... )`, `string.reFind( ... )` | always | Returns the 1-based position of the first regular expression match, or 0. |
| `reFindNoCase` | `reFindNoCase( ... )`, `string.reFindNoCase( ... )` | always |  |
| `reMatch` | `reMatch( ... )`, `string.reMatch( ... )` | always | Returns an array of all regular expression matches. |
| `reMatchNoCase` | `reMatchNoCase( ... )`, `string.reMatchNoCase( ... )` | always |  |
| `removeChars` | `removeChars( ... )`, `string.removeChars( ... )` | always | Removes count characters starting at a position. |
| `repeatString` | `repeatString( ... )` | always | Repeats a string count times. |
| `replace` | `replace( ... )`, `string.replace( ... )` | always | Replaces the first match; with the scope "all" it replaces every match. |
| `replaceList` | `replaceList( ... )`, `string.replaceList( ... )` | always | Replaces each item of one list with the item at the same position of another list. |
| `replaceNoCase` | `replaceNoCase( ... )`, `string.replaceNoCase( ... )` | always | Like replace, ignoring case. |
| `reReplace` | `reReplace( ... )`, `string.reReplace( ... )` | always | Replaces the first regular expression match; with the scope "all" it replaces every match. |
| `reReplaceNoCase` | `reReplaceNoCase( ... )`, `string.reReplaceNoCase( ... )` | always |  |
| `reverse` | `reverse( ... )`, `string.reverse( ... )` | always | Reverses a string. |
| `right` | `right( ... )`, `string.right( ... )` | always | Returns the last n characters. |
| `rjustify` | `rjustify( ... )`, `string.rjustify( ... )` | always | Pads on the left so the text is right-justified in the given width. |
| `rtrim` | `rtrim( ... )`, `string.rtrim( ... )` | always | Removes trailing whitespace. |
| `slugify` | `slugify( ... )`, `string.slugify( ... )` | always | Converts text to a URL slug. |
| `snakeCase` | `snakeCase( ... )`, `string.snakeCase( ... )` | always | Converts text to snake_case. |
| `spanExcluding` | `spanExcluding( ... )`, `string.spanExcluding( ... )` | always | Returns the leading characters that are not in the given set. |
| `spanIncluding` | `spanIncluding( ... )`, `string.spanIncluding( ... )` | always | Returns the leading characters that are all in the given set. |
| `stringBind` | `stringBind( ... )`, `string.bind( ... )`, `string.stringBind( ... )` | always |  |
| `stringBuilderAppend` | `stringBuilderAppend( ... )` | always |  |
| `stringBuilderClear` | `stringBuilderClear( ... )` | always |  |
| `stringBuilderContains` | `stringBuilderContains( ... )` | always |  |
| `stringBuilderDelete` | `stringBuilderDelete( ... )` | always |  |
| `stringBuilderEndsWith` | `stringBuilderEndsWith( ... )` | always |  |
| `stringBuilderFind` | `stringBuilderFind( ... )` | always |  |
| `stringBuilderInsert` | `stringBuilderInsert( ... )` | always |  |
| `stringBuilderLeft` | `stringBuilderLeft( ... )` | always |  |
| `stringBuilderMid` | `stringBuilderMid( ... )` | always |  |
| `stringBuilderNew` | `stringBuilderNew( ... )` | always | Creates a StringBuilder object; see the StringBuilder methods on the native objects page. |
| `stringBuilderPrepend` | `stringBuilderPrepend( ... )` | always |  |
| `stringBuilderReplace` | `stringBuilderReplace( ... )` | always |  |
| `stringBuilderReverse` | `stringBuilderReverse( ... )` | always |  |
| `stringBuilderRight` | `stringBuilderRight( ... )` | always |  |
| `stringBuilderStartsWith` | `stringBuilderStartsWith( ... )` | always |  |
| `stringBuilderTrim` | `stringBuilderTrim( ... )` | always |  |
| `stringEach` | `stringEach( ... )`, `string.each( ... )` | always |  |
| `stringEndsWith` | `stringEndsWith( ... )`, `string.endsWith( ... )` | always |  |
| `stringEndsWithNoCase` | `stringEndsWithNoCase( ... )`, `string.endsWithNoCase( ... )` | always |  |
| `stringEvery` | `stringEvery( ... )`, `string.every( ... )` | always |  |
| `stringFilter` | `stringFilter( ... )`, `string.filter( ... )` | always |  |
| `stringFind` | `stringFind( ... )`, `string.find( ... )` | always |  |
| `stringFindNoCase` | `stringFindNoCase( ... )`, `string.findNoCase( ... )` | always |  |
| `stringLen` | `stringLen( ... )` | always |  |
| `stringMap` | `stringMap( ... )`, `string.map( ... )` | always |  |
| `stringNone` | `stringNone( ... )` | always |  |
| `stringReduce` | `stringReduce( ... )`, `string.reduce( ... )` | always |  |
| `stringReduceRight` | `stringReduceRight( ... )`, `string.reduceRight( ... )` | always |  |
| `stringSome` | `stringSome( ... )`, `string.some( ... )` | always |  |
| `stringSort` | `stringSort( ... )`, `string.sort( ... )` | always |  |
| `stringStartsWith` | `stringStartsWith( ... )`, `string.startsWith( ... )` | always |  |
| `stringStartsWithNoCase` | `stringStartsWithNoCase( ... )`, `string.startsWithNoCase( ... )` | always |  |
| `stripCR` | `stripCR( ... )`, `string.stripCR( ... )` | always |  |
| `trim` | `trim( ... )`, `string.trim( ... )` | always | Removes leading and trailing whitespace. |
| `ucase` | `ucase( ... )`, `string.toUpperCase( ... )`, `string.ucase( ... )` | always | Converts a string to upper case. |
| `ucFirst` | `ucFirst( ... )`, `string.ucFirst( ... )` | always | Upper-cases the first character. |
| `wrap` | `wrap( ... )`, `string.wrap( ... )` | always |  |
