---
title: Queries and data
description: Work with query objects and run SQL against configured datasources.
icon: phosphor-duotone:database
---

# Queries and data

A query is a table of rows and named columns. You can build one in memory or obtain one from a database.

Database functions are available in native builds with datasource support, not in the browser playground.

## In-memory queries

```boxlang
people = queryNew(
    "id,name",
    "integer,varchar",
    [ [ 1, "Ann" ], [ 2, "Bob" ] ]
);

println( people.recordCount );
println( people.name[ 2 ] );

for ( person in people ) {
    println( person.id & ":" & person.name );
}
```

```text
2
Bob
1:Ann
2:Bob
```

Functions such as `queryAddRow`, `queryGetCell`, `querySetCell` and `queryColumnData` let you work with rows and columns directly. Query indexes start at 1.

## Datasources

Register a datasource, then pass its name to `queryExecute`. MatchBox provides SQLite and PostgreSQL drivers.

```boxlang
datasourceRegister( "main", {
    driver: "sqlite",
    database: "app.db"
} );

people = queryExecute(
    "select id, name from people where id = ?",
    [ 1 ],
    { datasource: "main" }
);
```

The example assumes the database has a `people` table. Use query parameters rather than joining user input into SQL. Datasources can also be declared in [`matchbox.toml`](../configuration.md#matchboxtoml).

## Transactions and query of queries

Use `transactionBegin`, `transactionCommit` and `transactionRollback` to group database changes.

Query of queries runs SQL over in-memory query data using `dbtype: "query"`; it requires a build with the `qoq` feature. See [source builds](../../getting-started/building-matchbox.md#cargo-features) for custom runtime features and the [query function reference](../functions/queries-and-datasources.md) for available functions.
