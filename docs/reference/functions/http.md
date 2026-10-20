---
title: HTTP and Network
summary: HTTP requests, SOAP clients and local host information.
description: HTTP requests, SOAP clients and local host information.
icon: phosphor-duotone:cloud-arrow-down
order: 18
---

# HTTP and Network

HTTP requests, SOAP clients and local host information. 3 entries. This page is generated from the MatchBox source; see the [function reference index](index.md) for how to read the tables and what each gate means.

For the options and result fields of `http()`, see [HTTP requests](../../http.md).

| Function | Forms | Gate | Notes |
| --- | --- | --- | --- |
| `getLocalhostIp` | `getLocalhostIp( ... )` | always | Returns the local IP address as a string, or as an array holding one address when the first argument is true. |
| `http` | `http( ... )` | `bif-http` | See [HTTP requests](../../http.md). |
| `soap` | `soap( ... )` | always | Returns a client object for a WSDL URL. The client only has the methods getOperations and getStatistics, and getOperations always returns add, subtract, multiply and divide whatever the URL. |
