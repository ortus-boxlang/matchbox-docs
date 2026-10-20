---
title: Queries and Datasources
summary: Query objects, queryExecute, transactions and datasource registration.
description: Query objects, queryExecute, transactions and datasource registration.
icon: phosphor-duotone:database
order: 8
---

# Queries and Datasources

Query objects, queryExecute, transactions and datasource registration. 43 entries. This page is generated from the MatchBox source; see the [function reference index](index.md) for how to read the tables and what each gate means.

| Function | Forms | Gate | Notes |
| --- | --- | --- | --- |
| `datasourceRegister` | `datasourceRegister( ... )` | `bif-datasource` |  |
| `datasourceUnregister` | `datasourceUnregister( ... )` | `bif-datasource` |  |
| `isInTransaction` | `isInTransaction( ... )` | `bif-datasource` |  |
| `isWithinTransaction` | `isWithinTransaction( ... )` | `bif-datasource` |  |
| `queryAddColumn` | `queryAddColumn( ... )` | `bif-datasource` |  |
| `queryAddRow` | `queryAddRow( ... )` | `bif-datasource` | Adds a row, optionally from a struct. |
| `queryAppend` | `queryAppend( ... )` | `bif-datasource` |  |
| `queryClear` | `queryClear( ... )` | `bif-datasource` |  |
| `queryColumnArray` | `queryColumnArray( ... )` | `bif-datasource` |  |
| `queryColumnCount` | `queryColumnCount( ... )` | `bif-datasource` |  |
| `queryColumnData` | `queryColumnData( ... )` | `bif-datasource` |  |
| `queryColumnExists` | `queryColumnExists( ... )` | `bif-datasource` | Returns true when the query has the column. |
| `queryColumnList` | `queryColumnList( ... )` | `bif-datasource` | Returns the column names as a comma-separated list. |
| `queryCurrentRow` | `queryCurrentRow( ... )` | `bif-datasource` |  |
| `queryDeleteColumn` | `queryDeleteColumn( ... )` | `bif-datasource` |  |
| `queryDeleteRow` | `queryDeleteRow( ... )` | `bif-datasource` | Removes a row. |
| `queryEach` | `queryEach( ... )` | `bif-datasource` |  |
| `queryEvery` | `queryEvery( ... )` | `bif-datasource` |  |
| `queryExecute` | `queryExecute( ... )` | `bif-datasource` | Query of queries (`dbtype: "query"` in the options struct) also needs the `qoq` feature. |
| `queryFilter` | `queryFilter( ... )` | `bif-datasource` |  |
| `queryGetCell` | `queryGetCell( ... )` | `bif-datasource` | Returns the value of a cell: queryGetCell( query, column, row ). |
| `queryGetResult` | `queryGetResult( ... )` | `bif-datasource` |  |
| `queryInsertAt` | `queryInsertAt( ... )` | `bif-datasource` |  |
| `queryKeyExists` | `queryKeyExists( ... )` | `bif-datasource` |  |
| `queryMap` | `queryMap( ... )` | `bif-datasource` |  |
| `queryNew` | `queryNew( ... )` | `bif-datasource` |  |
| `queryNone` | `queryNone( ... )` | `bif-datasource` |  |
| `queryPrepend` | `queryPrepend( ... )` | `bif-datasource` |  |
| `queryRecordCount` | `queryRecordCount( ... )` | `bif-datasource` | Returns the number of rows. |
| `queryReduce` | `queryReduce( ... )` | `bif-datasource` |  |
| `queryRegisterFunction` | `queryRegisterFunction( ... )` | `bif-datasource` | Always fails in this version with the error "queryRegisterFunction() not supported". |
| `queryReverse` | `queryReverse( ... )` | `bif-datasource` |  |
| `queryRowData` | `queryRowData( ... )` | `bif-datasource` | Returns a row as a struct. |
| `queryRowSwap` | `queryRowSwap( ... )` | `bif-datasource` |  |
| `querySetCell` | `querySetCell( ... )` | `bif-datasource` | Sets the value of a cell: querySetCell( query, column, value, row ). |
| `querySetRow` | `querySetRow( ... )` | `bif-datasource` |  |
| `querySlice` | `querySlice( ... )` | `bif-datasource` |  |
| `querySome` | `querySome( ... )` | `bif-datasource` |  |
| `querySort` | `querySort( ... )` | `bif-datasource` |  |
| `sqlPrettify` | `sqlPrettify( ... )`, `string.sqlPrettify( ... )` | always |  |
| `transactionBegin` | `transactionBegin( ... )` | `bif-datasource` |  |
| `transactionCommit` | `transactionCommit( ... )` | `bif-datasource` |  |
| `transactionRollback` | `transactionRollback( ... )` | `bif-datasource` |  |
