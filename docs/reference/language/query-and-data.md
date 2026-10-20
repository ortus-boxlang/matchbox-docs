---
title: Queries and data
description: The query type, the datasource functions and query of queries in MatchBox 0.11.0, which cargo features they need, and what works.
icon: phosphor-duotone:database
---

# Queries and data

MatchBox has a query type and datasource functions, but they are optional parts of the build and they are not in the browser playground. Examples on this page ran on the CLI, so none have a Run button.

## Which build has them

The query functions (`queryNew`, `queryAddRow`, `queryExecute` and the rest) are registered only when the VM is built with the `bif-datasource` cargo feature. Query of queries needs the `qoq` feature as well. Neither is in the default feature list in the MatchBox `Cargo.toml`, which is `bif-io`, `bif-jni`, `bif-crypto`, `bif-cli`, `bif-http`, `jit` and `server`. The CLI used for this page had `bif-datasource` compiled in and `qoq` left out. In the browser playground, `queryNew` fails with `Can only call functions.`

To check your own build, run `queryNew( "a" )` and `queryExecute( "select 1 as x from q", {}, { dbtype: "query" } )`. The second prints `QoQ support is not enabled in this build` when `qoq` is missing. See [Building MatchBox](../../getting-started/building-matchbox.md) for how to enable features.

## Building and reading a query

```boxlang
q = queryNew( "id,name", "integer,varchar", [ [ 1, "Ann" ], [ 2, "Bob" ] ] );
println( q.recordCount );
println( q.name[ 2 ] );
println( serializeJSON( q.name ) );

queryAddRow( q, { id: 3, name: "Cy" } );
println( q.getRow( 3 ).name );
println( serializeJSON( queryColumnData( q, "id" ) ) );

i = 1;
while ( i <= q.recordCount ) {
    println( q.id[ i ] & ":" & q.name[ i ] );
    i++;
}
```

```text
2
Bob
["Ann","Bob"]
Cy
[1,2,3]
1:Ann
2:Bob
3:Cy
```

- `q.recordCount` is the row count and `q.columnName` returns that column as an array.
- `q.getRow( n )` returns the row as a struct. `queryRowData( q, n )` does the same.
- Also working: `queryColumnList`, `queryRecordCount`, `queryColumnCount`, `queryGetCell( q, column, row )`, `querySetCell( q, column, value, row )`, `queryDeleteRow`, `queryReverse` and `queryAddColumn( q, name, array )`.
- `serializeJSON( q )` produces `{"columns":["id","name"],"data":[[1.0,"Ann"],...]}`, which is a different shape from BoxLang. Numbers in `data` carry a decimal point.

### Not working

- `for ( row in q )` fails with `Iteration only supported for arrays and structs`. Loop over the row numbers as shown.
- `q.columnList` is null. Use `queryColumnList( q )`.

## Datasources

`datasourceRegister( name, config )` registers a connection pool and `queryExecute( sql, params, { datasource: name } )` runs SQL on it. In 0.11.0 the only driver is PostgreSQL:

```boxlang
datasourceRegister( "main", {
    driver: "postgres",
    host: "localhost",
    port: 5432,
    database: "app",
    username: "user",
    password: "secret"
} );
rows = queryExecute( "select id, name from people where id = ?", [ 1 ], { datasource: "main" } );
```

Any other `driver` value fails with `Unknown datasource driver ... Supported: postgresql`. With no server listening, the register call fails with `Failed to create PostgreSQL datasource 'main': ... error connecting to server`. Calling `queryExecute` with a name that was never registered fails with `Datasource with name [x] not found. Use datasourceRegister() first.` Transactions use `transactionBegin`, `transactionCommit` and `transactionRollback`.

No live database was available for testing, so the result shape of `queryExecute` is not documented here.

### Tree shaking can drop datasource functions

With the default CLI settings, `datasourceRegister( ... )` fails with `Can only call functions.`, because tree shaking removes it from the program. Run the script with `--no-shaking`, or keep the function with `--keep datasourceRegister`, and it is found.

## Query of queries

Query of queries is `queryExecute( "select ... from q", {}, { dbtype: "query" } )`. It needs the `qoq` feature. Without it the call fails with `QoQ support is not enabled in this build`. The CLI used for this page was built without `qoq`, so QoQ results are untested.
