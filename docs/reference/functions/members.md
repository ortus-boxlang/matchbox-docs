---
title: Member Functions
summary: Every member function the VM resolves for built-in types, and the function each one calls.
description: Every member function the VM resolves for built-in types, and the function each one calls.
icon: phosphor-duotone:arrow-elbow-down-right
order: 20
---

A member call such as `"abc".ucase()` or `items.map( fn )` is resolved by a fixed table in the VM (`resolve_member_method`). Each entry maps `(type, member name)` to a function and calls it with the value as the first argument. Names are matched without regard to case. A function that has no entry for a type cannot be called as a member on that type, even when the global function exists.

Struct values also run any function stored under the member name in the struct itself, before the table is consulted. Class instances, native objects and Java objects use their own methods; see [Native object methods](objects.md).

## array

81 members.

| Member | Calls | Gate |
| --- | --- | --- |
| `array.add` | `arrayAppend` | always |
| `array.addAll` | internal helper | always |
| `array.append` | internal helper | always |
| `array.avg` | `arrayAvg` | always |
| `array.chunk` | `arrayChunk` | always |
| `array.clear` | internal helper | always |
| `array.contains` | `arrayContains` | always |
| `array.containsNoCase` | `arrayContainsNoCase` | always |
| `array.count` | `len` | always |
| `array.delete` | internal helper | always |
| `array.deleteAt` | `arrayDeleteAt` | always |
| `array.deleteNoCase` | `arrayDeleteNoCase` | always |
| `array.difference` | internal helper | always |
| `array.duplicate` | `duplicate` | always |
| `array.each` | internal helper | always |
| `array.every` | internal helper | always |
| `array.filter` | internal helper | always |
| `array.find` | internal helper | always |
| `array.findAll` | `arrayFindAll` | always |
| `array.findAllNoCase` | `arrayFindAllNoCase` | always |
| `array.findFirst` | `arrayFindFirst` | always |
| `array.first` | `arrayFirst` | always |
| `array.flatMap` | `arrayFlatMap` | always |
| `array.flatten` | `arrayFlatten` | always |
| `array.getMetadata` | `arrayGetMetadata` | always |
| `array.getNodeType` | `xmlGetNodeType` | always |
| `array.groupBy` | `arrayGroupBy` | always |
| `array.has` | internal helper | always |
| `array.indexExists` | `arrayIndexExists` | always |
| `array.insertAt` | `arrayInsertAt` | always |
| `array.intersection` | internal helper | always |
| `array.isCaseSensitive` | internal helper | always |
| `array.isDisjointFrom` | internal helper | always |
| `array.isEmpty` | internal helper | always |
| `array.isSubsetOf` | internal helper | always |
| `array.isSupersetOf` | internal helper | always |
| `array.isSynchronized` | internal helper | always |
| `array.last` | `arrayLast` | always |
| `array.len` | `len` | always |
| `array.length` | `len` | always |
| `array.map` | internal helper | always |
| `array.max` | `arrayMax` | always |
| `array.median` | `arrayMedian` | always |
| `array.merge` | `arrayMerge` | always |
| `array.min` | `arrayMin` | always |
| `array.none` | internal helper | always |
| `array.pop` | `arrayPop` | always |
| `array.prepend` | `arrayPrepend` | always |
| `array.push` | `arrayPush` | always |
| `array.range` | `arrayRange` | always |
| `array.reduce` | internal helper | always |
| `array.reduceRight` | `arrayReduceRight` | always |
| `array.reject` | `arrayReject` | always |
| `array.remove` | internal helper | always |
| `array.removeAll` | internal helper | always |
| `array.resize` | `arrayResize` | always |
| `array.retainAll` | internal helper | always |
| `array.reverse` | `arrayReverse` | always |
| `array.set` | `arraySet` | always |
| `array.shift` | `arrayShift` | always |
| `array.size` | `len` | always |
| `array.slice` | `arraySlice` | always |
| `array.some` | internal helper | always |
| `array.sort` | `arraySort` | always |
| `array.splice` | `arraySplice` | always |
| `array.sum` | `arraySum` | always |
| `array.swap` | `arraySwap` | always |
| `array.symmetricDifference` | internal helper | always |
| `array.toArray` | internal helper | always |
| `array.toJSON` | `serializeJSON` | always |
| `array.toList` | internal helper | always |
| `array.toModifiable` | `toModifiable` | always |
| `array.toSet` | `toSet` | always |
| `array.toStruct` | `arrayToStruct` | always |
| `array.toUnmodifiable` | `toUnmodifiable` | always |
| `array.transpose` | `arrayTranspose` | always |
| `array.union` | internal helper | always |
| `array.unique` | `arrayUnique` | always |
| `array.unshift` | `arrayUnshift` | always |
| `array.xmlGetNodeType` | `xmlGetNodeType` | always |
| `array.zip` | `arrayZip` | always |

## boolean

3 members.

| Member | Calls | Gate |
| --- | --- | --- |
| `boolean.booleanFormat` | `booleanFormat` | always |
| `boolean.toJSON` | `serializeJSON` | always |
| `boolean.trueFalseFormat` | `booleanFormat` | always |

## datetime

37 members.

| Member | Calls | Gate |
| --- | --- | --- |
| `datetime.add` | `dateAdd` | always |
| `datetime.compare` | `dateCompare` | always |
| `datetime.dateFormat` | `dateFormat` | always |
| `datetime.dateTimeFormat` | `dateTimeFormat` | always |
| `datetime.day` | `day` | always |
| `datetime.dayOfWeek` | `dayOfWeek` | always |
| `datetime.dayOfWeekAsString` | `dayOfWeekAsString` | always |
| `datetime.dayOfWeekShortAsString` | `dayOfWeekShortAsString` | always |
| `datetime.dayOfYear` | `dayOfYear` | always |
| `datetime.daysInMonth` | `daysInMonth` | always |
| `datetime.daysInYear` | `daysInYear` | always |
| `datetime.diff` | `dateDiff` | always |
| `datetime.duplicate` | `duplicate` | always |
| `datetime.firstDayOfMonth` | `firstDayOfMonth` | always |
| `datetime.format` | `dateTimeFormat` | always |
| `datetime.getNumericDate` | `getNumericDate` | always |
| `datetime.getTime` | `getTime` | always |
| `datetime.getTimezone` | `getTimezone` | always |
| `datetime.hour` | `hour` | always |
| `datetime.len` | `len` | always |
| `datetime.millisecond` | `millisecond` | always |
| `datetime.minute` | `minute` | always |
| `datetime.month` | `month` | always |
| `datetime.monthAsString` | `monthAsString` | always |
| `datetime.monthShortAsString` | `monthShortAsString` | always |
| `datetime.nanosecond` | `nanosecond` | always |
| `datetime.offset` | `offset` | always |
| `datetime.quarter` | `quarter` | always |
| `datetime.second` | `second` | always |
| `datetime.timeFormat` | `timeFormat` | always |
| `datetime.timezone` | `getTimezone` | always |
| `datetime.toEpochMillis` | `toEpochMillis` | always |
| `datetime.toOdbcDate` | `createODBCDate` | always |
| `datetime.toOdbcDateTime` | `createODBCDateTime` | always |
| `datetime.toOdbcTime` | `createODBCTime` | always |
| `datetime.week` | `week` | always |
| `datetime.year` | `year` | always |

## future

11 members.

| Member | Calls | Gate |
| --- | --- | --- |
| `future.completeExceptionally` | `futureCompleteExceptionally` | always |
| `future.completeOnTimeout` | `futureCompleteOnTimeout` | always |
| `future.exceptionally` | `futureExceptionally` | always |
| `future.get` | `futureget` | always |
| `future.getAsAttempt` | `futureGetAsAttempt` | always |
| `future.getOrDefault` | `futureGetOrDefault` | always |
| `future.isCompletedExceptionally` | `futureIsCompletedExceptionally` | always |
| `future.joinOrDefault` | `futureJoinOrDefault` | always |
| `future.onError` | `futureOnError` | always |
| `future.orTimeout` | `futureOrTimeout` | always |
| `future.then` | `futureThen` | always |

## number

28 members.

| Member | Calls | Gate |
| --- | --- | --- |
| `number.abs` | `abs` | always |
| `number.acos` | `acos` | always |
| `number.asin` | `asin` | always |
| `number.atan` | `atan` | always |
| `number.atn` | `atan` | always |
| `number.booleanFormat` | `booleanFormat` | always |
| `number.ceiling` | `ceiling` | always |
| `number.cos` | `cos` | always |
| `number.currencyFormat` | `currencyFormat` | always |
| `number.decimalFormat` | `decimalFormat` | always |
| `number.decrementValue` | `decrementValue` | always |
| `number.exp` | `exp` | always |
| `number.fix` | `fix` | always |
| `number.floor` | `floor` | always |
| `number.incrementValue` | `incrementValue` | always |
| `number.int` | `int` | always |
| `number.len` | `len` | always |
| `number.length` | `len` | always |
| `number.log` | `log` | always |
| `number.log10` | `log10` | always |
| `number.numberFormat` | `numberFormat` | always |
| `number.round` | `round` | always |
| `number.sgn` | `sgn` | always |
| `number.sin` | `sin` | always |
| `number.sqr` | `sqr` | always |
| `number.tan` | `tan` | always |
| `number.toJSON` | `serializeJSON` | always |
| `number.trueFalseFormat` | `booleanFormat` | always |

## string

125 members.

| Member | Calls | Gate |
| --- | --- | --- |
| `string.ascii` | `ascii` | always |
| `string.bind` | `stringBind` | always |
| `string.booleanFormat` | `booleanFormat` | always |
| `string.camelCase` | `camelCase` | always |
| `string.charsetDecode` | `charsetDecode` | always |
| `string.compare` | `compare` | always |
| `string.compareNoCase` | `compareNoCase` | always |
| `string.dateFormat` | `dateFormat` | always |
| `string.dateTimeFormat` | `dateTimeFormat` | always |
| `string.day` | `day` | always |
| `string.dayOfWeek` | `dayOfWeek` | always |
| `string.dayOfWeekAsString` | `dayOfWeekAsString` | always |
| `string.dayOfWeekShortAsString` | `dayOfWeekShortAsString` | always |
| `string.dayOfYear` | `dayOfYear` | always |
| `string.daysInMonth` | `daysInMonth` | always |
| `string.daysInYear` | `daysInYear` | always |
| `string.each` | `stringEach` | always |
| `string.endsWith` | `stringEndsWith` | always |
| `string.endsWithNoCase` | `stringEndsWithNoCase` | always |
| `string.every` | `stringEvery` | always |
| `string.filter` | `stringFilter` | always |
| `string.find` | `stringFind` | always |
| `string.findNoCase` | `stringFindNoCase` | always |
| `string.findOneOf` | `findOneOf` | always |
| `string.firstDayOfMonth` | `firstDayOfMonth` | always |
| `string.fromJSON` | `deserializeJSON` | always |
| `string.getToken` | `getToken` | always |
| `string.hash` | `hash` | `bif-crypto` |
| `string.hmac` | `hmac` | `bif-crypto` |
| `string.hour` | `hour` | always |
| `string.indexOf` | `indexOf` | always |
| `string.insert` | `insert` | always |
| `string.isEmpty` | `isEmpty` | always |
| `string.jsFormat` | `jsStringFormat` | always |
| `string.jsStringFormat` | `jsStringFormat` | always |
| `string.kebabCase` | `kebabCase` | always |
| `string.lcase` | `lcase` | always |
| `string.left` | `left` | always |
| `string.len` | `len` | always |
| `string.length` | `len` | always |
| `string.listAppend` | `listAppend` | always |
| `string.listAvg` | `listAvg` | always |
| `string.listChangeDelims` | `listChangeDelims` | always |
| `string.listCompact` | `listCompact` | always |
| `string.listContains` | `listContains` | always |
| `string.listContainsNoCase` | `listContainsNoCase` | always |
| `string.listDeleteAt` | `listDeleteAt` | always |
| `string.listEach` | `listEach` | always |
| `string.listEvery` | `listEvery` | always |
| `string.listFilter` | `listFilter` | always |
| `string.listFind` | `listFind` | always |
| `string.listFindNoCase` | `listFindNoCase` | always |
| `string.listFirst` | `listFirst` | always |
| `string.listGetAt` | `listGetAt` | always |
| `string.listGetToken` | `getToken` | always |
| `string.listLast` | `listLast` | always |
| `string.listLen` | `listLen` | always |
| `string.listMap` | `listMap` | always |
| `string.listNone` | `listNone` | always |
| `string.listQualify` | `listQualify` | always |
| `string.listReduceRight` | `listReduceRight` | always |
| `string.listRemoveDuplicates` | `listRemoveDuplicates` | always |
| `string.listRest` | `listRest` | always |
| `string.listSome` | `listSome` | always |
| `string.listSort` | `listSort` | always |
| `string.listToSet` | `listToSet` | always |
| `string.listValueCount` | `listValueCount` | always |
| `string.listValueCountNoCase` | `listValueCountNoCase` | always |
| `string.ljustify` | `ljustify` | always |
| `string.ltrim` | `ltrim` | always |
| `string.map` | `stringMap` | always |
| `string.mid` | `mid` | always |
| `string.millisecond` | `millisecond` | always |
| `string.minute` | `minute` | always |
| `string.month` | `month` | always |
| `string.monthAsString` | `monthAsString` | always |
| `string.monthShortAsString` | `monthShortAsString` | always |
| `string.paragraphFormat` | `paragraphFormat` | always |
| `string.pascalCase` | `pascalCase` | always |
| `string.quarter` | `quarter` | always |
| `string.reduce` | `stringReduce` | always |
| `string.reduceRight` | `stringReduceRight` | always |
| `string.reFind` | `reFind` | always |
| `string.reFindNoCase` | `reFindNoCase` | always |
| `string.reMatch` | `reMatch` | always |
| `string.reMatchNoCase` | `reMatchNoCase` | always |
| `string.removeChars` | `removeChars` | always |
| `string.replace` | `replace` | always |
| `string.replaceList` | `replaceList` | always |
| `string.replaceNoCase` | `replaceNoCase` | always |
| `string.reReplace` | `reReplace` | always |
| `string.reReplaceNoCase` | `reReplaceNoCase` | always |
| `string.reverse` | `reverse` | always |
| `string.right` | `right` | always |
| `string.rjustify` | `rjustify` | always |
| `string.rtrim` | `rtrim` | always |
| `string.second` | `second` | always |
| `string.slugify` | `slugify` | always |
| `string.snakeCase` | `snakeCase` | always |
| `string.some` | `stringSome` | always |
| `string.sort` | `stringSort` | always |
| `string.spanExcluding` | `spanExcluding` | always |
| `string.spanIncluding` | `spanIncluding` | always |
| `string.split` | `listToArray` | always |
| `string.sqlPrettify` | `sqlPrettify` | always |
| `string.startsWith` | `stringStartsWith` | always |
| `string.startsWithNoCase` | `stringStartsWithNoCase` | always |
| `string.stringBind` | `stringBind` | always |
| `string.stripCR` | `stripCR` | always |
| `string.timeFormat` | `timeFormat` | always |
| `string.toDateTime` | `parseDateTime` | always |
| `string.toJSON` | `serializeJSON` | always |
| `string.toLowerCase` | `lcase` | always |
| `string.toString` | `toString` | always |
| `string.toUpperCase` | `ucase` | always |
| `string.trim` | `trim` | always |
| `string.trueFalseFormat` | `booleanFormat` | always |
| `string.ucase` | `ucase` | always |
| `string.ucFirst` | `ucFirst` | always |
| `string.urlEncodedFormat` | `urlEncodedFormat` | always |
| `string.val` | `val` | always |
| `string.week` | `week` | always |
| `string.wrap` | `wrap` | always |
| `string.xmlFormat` | `xmlFormat` | always |
| `string.year` | `year` | always |

## struct

23 members.

| Member | Calls | Gate |
| --- | --- | --- |
| `struct.append` | `structAppend` | always |
| `struct.count` | `len` | always |
| `struct.duplicate` | `duplicate` | always |
| `struct.each` | `structEach` | always |
| `struct.equals` | `structEquals` | always |
| `struct.exists` | `structKeyExists` | always |
| `struct.find` | `structFind` | always |
| `struct.findKey` | `structFindKey` | always |
| `struct.getMetadata` | `structGetMetadata` | always |
| `struct.isCaseSensitive` | `structIsCaseSensitive` | always |
| `struct.isEmpty` | `structIsEmpty` | always |
| `struct.isOrdered` | `structIsOrdered` | always |
| `struct.keyExists` | `structKeyExists` | always |
| `struct.keySet` | `structKeySet` | always |
| `struct.keyTranslate` | `structKeyTranslate` | always |
| `struct.len` | `len` | always |
| `struct.toJSON` | `serializeJSON` | always |
| `struct.toModifiable` | `toModifiable` | always |
| `struct.toQueryString` | `structToQueryString` | always |
| `struct.toSorted` | `structToSorted` | always |
| `struct.toString` | `toString` | always |
| `struct.toUnmodifiable` | `toUnmodifiable` | always |
| `struct.valueSet` | `structValueSet` | always |

## xml

6 members.

| Member | Calls | Gate |
| --- | --- | --- |
| `xml.childPos` | `xmlChildPos` | always |
| `xml.getNodeType` | `xmlGetNodeType` | always |
| `xml.search` | `xmlSearch` | always |
| `xml.size` | `xmlSize` | always |
| `xml.transform` | `xmlTransform` | always |
| `xml.xmlFormat` | `xmlFormat` | always |
