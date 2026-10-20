---
title: Arrays
summary: Array functions and array member functions.
description: Array functions and array member functions.
icon: phosphor-duotone:brackets-square
order: 3
---

# Arrays

Array functions and array member functions. 72 entries. This page is generated from the MatchBox source; see the [function reference index](index.md) for how to read the tables and what each gate means.

| Function | Forms | Gate | Notes |
| --- | --- | --- | --- |
| `arrayAppend` | `arrayAppend( ... )`, `array.add( ... )` | always | Adds a value to the end of the array in place. |
| `arrayAvg` | `arrayAvg( array )`, `array.avg()` | always | Returns the average of the elements. Member form needs the prelude function kept; see "Prelude functions called as members" on the index page. |
| `arrayChunk` | `arrayChunk( array, chunkSize )`, `array.chunk( chunkSize )` | always | Splits the array into arrays of at most the given size. Member form needs the prelude function kept; see "Prelude functions called as members" on the index page. |
| `arrayClear` | `arrayClear( ... )` | always | Removes all elements in place. |
| `arrayContains` | `arrayContains( array, value )`, `array.contains( value )` | always | Returns true when the array contains the value (case-sensitive for strings). Defined in the prelude and as a native function; the prelude definition is the one that runs. |
| `arrayContainsNoCase` | `arrayContainsNoCase( array, value )`, `array.containsNoCase( value )` | always | Like arrayContains, ignoring case. Defined in the prelude and as a native function; the prelude definition is the one that runs. |
| `arrayDelete` | `arrayDelete( array, value, scope = "one" )` | always | Removes the first matching value in place and returns true. |
| `arrayDeleteAt` | `arrayDeleteAt( ... )`, `array.deleteAt( ... )` | always | Removes the element at an index in place and returns it. |
| `arrayDeleteNoCase` | `arrayDeleteNoCase( array, value, scope = "one" )`, `array.deleteNoCase( value, scope = "one" )` | always | Member form needs the prelude function kept; see "Prelude functions called as members" on the index page. |
| `arrayEach` | `arrayEach( array, callback, parallel = false, maxThreads = 0, virtual = false )` | always | Calls the callback for each element. |
| `arrayEvery` | `arrayEvery( array, callback )` | always | Returns true when the callback is true for every element. |
| `arrayFilter` | `arrayFilter( array, predicate )` | always | Returns the elements for which the callback returns true. |
| `arrayFind` | `arrayFind( array, value )` | always | Returns the 1-based index of the first match, or 0. |
| `arrayFindAll` | `arrayFindAll( array, value )`, `array.findAll( value )` | always | Returns the indexes of all matches. Member form needs the prelude function kept; see "Prelude functions called as members" on the index page. |
| `arrayFindAllNoCase` | `arrayFindAllNoCase( array, value )`, `array.findAllNoCase( value )` | always | Member form needs the prelude function kept; see "Prelude functions called as members" on the index page. |
| `arrayFindFirst` | `arrayFindFirst( array, callback, defaultValue )`, `array.findFirst( callback, defaultValue )` | always | Returns the first element for which the callback returns true. Member form needs the prelude function kept; see "Prelude functions called as members" on the index page. |
| `arrayFindNoCase` | `arrayFindNoCase( array, value )` | always | Like arrayFind, ignoring case. |
| `arrayFirst` | `arrayFirst( array, defaultValue = null )`, `array.first( defaultValue = null )` | always | Returns the first element. Member form needs the prelude function kept; see "Prelude functions called as members" on the index page. |
| `arrayFlatMap` | `arrayFlatMap( array, callback )`, `array.flatMap( callback )` | always | Maps each element to an array and concatenates the results. Member form needs the prelude function kept; see "Prelude functions called as members" on the index page. |
| `arrayFlatten` | `arrayFlatten( array, depth = -1 )`, `array.flatten( depth = -1 )` | always | Flattens nested arrays. Member form needs the prelude function kept; see "Prelude functions called as members" on the index page. |
| `arrayGetMetadata` | `arrayGetMetadata( array )`, `array.getMetadata()` | always | Member form needs the prelude function kept; see "Prelude functions called as members" on the index page. |
| `arrayGroupBy` | `arrayGroupBy( array, callback )`, `array.groupBy( callback )` | always | Groups elements into a struct by the callback result. Member form needs the prelude function kept; see "Prelude functions called as members" on the index page. |
| `arrayIndexExists` | `arrayIndexExists( array, index )`, `array.indexExists( index )` | always | Returns true when the index exists. Member form needs the prelude function kept; see "Prelude functions called as members" on the index page. |
| `arrayInsertAt` | `arrayInsertAt( ... )`, `array.insertAt( ... )` | always | Inserts a value at an index in place. |
| `arrayIsEmpty` | `arrayIsEmpty( array )` | always | Returns true when the array has no elements. Defined in the prelude and as a native function; the prelude definition is the one that runs. |
| `arrayIsSynchronized` | `arrayIsSynchronized( ... )` | always |  |
| `arrayLast` | `arrayLast( array, defaultValue = null )`, `array.last( defaultValue = null )` | always | Returns the last element. Member form needs the prelude function kept; see "Prelude functions called as members" on the index page. |
| `arrayLen` | `arrayLen( ... )` | always | Returns the number of elements in an array. |
| `arrayMap` | `arrayMap( array, callback, parallel = false, maxThreads = 0, virtual = false )` | always | Returns a new array of the callback results. Defined in the prelude and as a native function; the prelude definition is the one that runs. |
| `arrayMax` | `arrayMax( array )`, `array.max()` | always | Returns the largest element. Member form needs the prelude function kept; see "Prelude functions called as members" on the index page. |
| `arrayMedian` | `arrayMedian( array )`, `array.median()` | always | Returns the median of the elements. Member form needs the prelude function kept; see "Prelude functions called as members" on the index page. |
| `arrayMerge` | `arrayMerge( array1, array2, leaveIndex = false )`, `array.merge( array2, leaveIndex = false )` | always | Returns an array with the elements of the first array followed by those of the second. Member form needs the prelude function kept; see "Prelude functions called as members" on the index page. |
| `arrayMin` | `arrayMin( array )`, `array.min()` | always | Returns the smallest element. Member form needs the prelude function kept; see "Prelude functions called as members" on the index page. |
| `arrayNew` | `arrayNew( ... )` | always | Creates an empty array. |
| `arrayNone` | `arrayNone( array, callback )` | always | Returns true when the callback is true for no element. |
| `arrayPop` | `arrayPop( ... )`, `array.pop( ... )` | always | Removes the last element and returns it. |
| `arrayPrepend` | `arrayPrepend( array, value )`, `array.prepend( value )` | always | Adds a value to the start of the array in place. Defined in the prelude and as a native function; the prelude definition is the one that runs. |
| `arrayPush` | `arrayPush( array, value )`, `array.push( value )` | always | Member form needs the prelude function kept; see "Prelude functions called as members" on the index page. |
| `arrayRange` | `arrayRange( start = 1, end, count = null )`, `array.range( end, count = null )` | always | Returns an array of consecutive integers from start to end. Member form needs the prelude function kept; see "Prelude functions called as members" on the index page. |
| `arrayReduce` | `arrayReduce( array, callback, initialValue )` | always | Folds the array into one value: callback( accumulator, element ), initial value. |
| `arrayReduceRight` | `arrayReduceRight( array, callback, initialValue )`, `array.reduceRight( callback, initialValue )` | always | Like arrayReduce, from the last element to the first. Member form needs the prelude function kept; see "Prelude functions called as members" on the index page. |
| `arrayReject` | `arrayReject( array, predicate )`, `array.reject( predicate )` | always | Returns the elements for which the callback returns false. Member form needs the prelude function kept; see "Prelude functions called as members" on the index page. |
| `arrayResize` | `arrayResize( ... )`, `array.resize( ... )` | always |  |
| `arrayReverse` | `arrayReverse( array )`, `array.reverse()` | always | Returns a reversed copy and leaves the original unchanged. Member form needs the prelude function kept; see "Prelude functions called as members" on the index page. |
| `arraySet` | `arraySet( ... )`, `array.set( ... )` | always |  |
| `arrayShift` | `arrayShift( array, defaultValue )`, `array.shift( defaultValue )` | always | Removes the first element and returns it. Member form needs the prelude function kept; see "Prelude functions called as members" on the index page. |
| `arraySlice` | `arraySlice( array, offset, length )`, `array.slice( offset, length )` | always | Member form needs the prelude function kept; see "Prelude functions called as members" on the index page. |
| `arraySome` | `arraySome( array, callback )` | always | Returns true when the callback is true for at least one element. |
| `arraySort` | `arraySort( array, sortType = "text", sortOrder = "asc" )`, `array.sort( sortType = "text", sortOrder = "asc" )` | always | Sorts the array in place and returns it. Arguments: array, sort type, sort order. Member form needs the prelude function kept; see "Prelude functions called as members" on the index page. |
| `arraySplice` | `arraySplice( array, index, deleteCount = 0, replacements )`, `array.splice( index, deleteCount = 0, replacements )` | always | Member form needs the prelude function kept; see "Prelude functions called as members" on the index page. |
| `arraySum` | `arraySum( array )`, `array.sum()` | always | Returns the sum of the elements. Member form needs the prelude function kept; see "Prelude functions called as members" on the index page. |
| `arraySwap` | `arraySwap( ... )`, `array.swap( ... )` | always | Swaps the elements at two indexes in place. |
| `arrayToList` | `arrayToList( array, delimiter = "," )` | always | Joins the elements with a delimiter, comma by default. |
| `arrayToStruct` | `arrayToStruct( array )`, `array.toStruct()` | always | Converts an array to a struct keyed by 1-based index. Member form needs the prelude function kept; see "Prelude functions called as members" on the index page. |
| `arrayTranspose` | `arrayTranspose( array )`, `array.transpose()` | always | Swaps the rows and columns of a two-dimensional array. Member form needs the prelude function kept; see "Prelude functions called as members" on the index page. |
| `arrayUnique` | `arrayUnique( array )`, `array.unique()` | always | Returns the distinct values, keeping the first occurrence of each. Member form needs the prelude function kept; see "Prelude functions called as members" on the index page. |
| `arrayUnshift` | `arrayUnshift( array, value )`, `array.unshift( value )` | always | Member form needs the prelude function kept; see "Prelude functions called as members" on the index page. |
| `arrayZip` | `arrayZip( array1, array2, callback )`, `array.zip( array2, callback )` | always | Combines two arrays element by element into pairs. Member form needs the prelude function kept; see "Prelude functions called as members" on the index page. |
| `array.append` | `array.append( ... )` | always | Appends a value in place and returns the array, so calls can be chained. |
| `array.clear` | `array.clear( ... )` | always | Removes all elements in place. |
| `array.delete` | `array.delete( ... )` | always | Removes the element equal to the value (not the element at that index) and returns the array. |
| `array.each` | `array.each( ... )` | always |  |
| `array.every` | `array.every( ... )` | always |  |
| `array.filter` | `array.filter( ... )` | always |  |
| `array.find` | `array.find( ... )` | always | With a callback, returns the first element for which it returns true (the element itself, not its index). |
| `array.isEmpty` | `array.isEmpty( ... )` | always | Returns true when the array has no elements. |
| `array.isSynchronized` | `array.isSynchronized( ... )` | always |  |
| `array.map` | `array.map( ... )` | always |  |
| `array.none` | `array.none( ... )` | always |  |
| `array.reduce` | `array.reduce( ... )` | always |  |
| `array.some` | `array.some( ... )` | always |  |
| `array.toList` | `array.toList( ... )` | always | Joins the elements into a comma-separated string. |
