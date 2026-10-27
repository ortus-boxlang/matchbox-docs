---
title: Web server
description: Serve a directory of static files and BoxLang templates with matchbox --serve, configure boxlang.json, or run a routed app server with web.server().
icon: phosphor-duotone:browser
---

MatchBox has two web runtimes. Both are implemented in the `matchbox_server` crate and run on the same VM as the CLI.

| | Webroot server | App server |
| :--- | :--- | :--- |
| Start with | `matchbox --serve` | `matchbox_server --app app.bxs` |
| Routing | The file path in the URL | Routes you register in a script |
| Pages | `.bxm` and `.bxs` templates plus static files | Handlers, middleware, `event.setView()` templates |
| Configuration | `boxlang.json` in the webroot | Calls in the script (`app.listen()`) |
| WebSockets | Yes, through `boxlang.json` | Yes, through `app.enableWebSockets()` |
| Example | [Web server](../examples/web_server/README.md) | [App server](../examples/app_server/README.md), [WebSocket counter](../examples/websocket_counter/README.md) |

## Webroot server

```sh
matchbox --serve --webroot ./site --port 8080
```

| Flag | Default | Meaning |
| :--- | :--- | :--- |
| `--webroot <dir>` | `.` | Directory to serve. |
| `--port <n>` | `8080` | Listen port. |
| `--host <addr>` | `127.0.0.1` | Bind address. Use `0.0.0.0` to accept connections from other machines, for example inside a container. |

`matchbox --serve` accepts only these three flags and reads `boxlang.json` from the webroot. The `--config <file>` flag exists only on the `matchbox_server` binary, which you build from the MatchBox source tree with `cargo build --release -p matchbox_server`.

On startup the server prints the address, the resolved webroot and whether rewrites are enabled. Files are read on every request, so edits appear without a restart.

### What gets served

| Request | Result |
| :--- | :--- |
| A `.bxm` or `.bxs` file | Rendered as a template. Response is `200` with `Content-Type: text/html` and a `MBX_SESSION_ID` cookie. |
| Any other file | Sent as is, with a content type guessed from the extension. |
| A directory | `index.bxm`, then `index.bxs`, inside it. |
| A missing file | `404 Not Found`, or the rewrite file when rewrites are on. |
| A path with a segment that starts with `.` | `403`. |
| A path that climbs out of the webroot | `403`. |
| A method other than `GET`, `HEAD` or `POST` | `405` with `allow: GET,HEAD,POST`. |

`HEAD` returns the headers of the `GET` response with an empty body. A template that throws returns `500` with the error text.

### Scopes in templates

| Scope | Contents |
| :--- | :--- |
| `url` | Query-string parameters. |
| `form` | Fields of an `application/x-www-form-urlencoded` POST body. JSON bodies are not exposed. |
| `cookie` | Request cookies, plus `MBX_SESSION_ID`. |
| `session` | A struct kept in server memory per `MBX_SESSION_ID` cookie. |
| `cgi` | `request_method`, `script_name`, `path_info`, `server_name`, `server_port`, `http_host`, `content_type`, `content_length`. It is not the process environment. |

All values are strings. Session values are stored as strings between requests, so a number or struct you assign comes back as its string form on the next request. Sessions have no expiry and are lost when the process stops.

To read an environment variable use `getSystemSetting( "NAME", "default" )`. There is no `env` scope.

### boxlang.json

Place `boxlang.json` in the webroot. All keys are optional.

```json
{
  "rewrites": true,
  "rewriteFileName": "index.bxm",
  "websocket": {
    "uri": "/ws",
    "listenerClass": "Chat",
    "listenerState": { "greeting": "hello" },
    "handler": "WebSocket.bx"
  }
}
```

| Key | Default | Meaning |
| :--- | :--- | :--- |
| `rewrites` | `false` | When `true`, a request whose file does not exist is answered by `rewriteFileName` instead of a 404. The original path is available as `cgi.path_info`, and the query string stays in `url`. This applies to every missing file, including missing images and stylesheets. |
| `rewriteFileName` | `index.bxm` | Front-controller file, relative to the webroot. A value that contains `..` or starts with `/` is replaced by the default. |
| `websocket` | none | Enables a WebSocket endpoint. See below. |

If `boxlang.json` is not valid JSON, or a `websocket` block is missing one of `uri`, `listenerClass` or `listenerState`, the whole file is ignored without a warning and the defaults apply. Check the "Rewrites:" line printed at startup.

Give each directory an index template; directory requests do not fall back to the rewrite file.

### WebSockets in the webroot server

The `websocket` block names a class and the file that defines it.

| Key | Meaning |
| :--- | :--- |
| `uri` | Path that accepts WebSocket upgrades. |
| `listenerClass` | Name of the class to instantiate. |
| `listenerState` | JSON object. Its keys are set as instance variables of the listener (`variables.greeting`). The constructor is not called. |
| `handler` | File that defines the class. Default `WebSocket.bx`. It is looked up case-insensitively in the webroot directory itself, not in subdirectories. |

```
class Chat {
    function onConnect( channel ) {
        channel.sendJson( { "welcome": variables.greeting, "id": channel.getId() } );
    }

    function onMessage( message, channel ) {
        channel.broadcastMessage( "echo:" & message );
    }

    function onClose( channel ) {}
}
```

If the handler file is missing or does not compile, the server starts without a WebSocket endpoint. An error thrown in `onConnect` or `onMessage` is printed on the server's stderr and closes that connection with code 1011.

## WebSocket channel API

The same `channel` object is passed to listeners in both server modes.

| Method | Purpose |
| :--- | :--- |
| `sendMessage( text )`, `sendText( text )` | Send a text frame to this client. |
| `sendJson( value )` | Serialize `value` as JSON and send it as text. |
| `sendBytes( bytes )` | Send a binary frame. |
| `broadcastMessage( text )`, `broadcastText( text )` | Text frame to every connected client, including this one. |
| `broadcastJson( value )`, `broadcastBytes( bytes )` | The same for JSON and binary payloads. |
| `close( [code], [reason] )` | Close the connection. Default code `1000`. |
| `getId()` | Server-generated UUID of this connection. |
| `getPath()` | Path of the upgrade request, such as `/ws`. |
| `getURL()` | Full URL of the upgrade request, including the query string. |
| `getHTTPHeader( name, [default] )` | Header of the upgrade request. Names are matched case-insensitively. Returns `null` when missing and no default is given. |

Listener hooks are `onConnect( channel )`, `onMessage( message, channel )` and `onClose( channel )`. `message` is a string for text frames and bytes for binary frames. The channel has no properties: `channel.id` is `null`, use `getId()`.

## App server

The app server runs one script that builds a routed application with `web.server()`. It is started with the `--app` flag of the `matchbox_server` binary:

```sh
cargo run -p matchbox_server -- --app app.bxs
```

`matchbox app.bxs` cannot run such a script: the CLI does not install the `web` namespace, and `web.server()` fails with `Method server not found on null`. In `--app` mode the `--port`, `--host`, `--webroot` and `--config` flags are ignored; the address comes from `app.listen()`.

```
import boxlang.web;

app = web.server();

app.get( "/hello/:name", function( event, rc, prc ) {
    event.renderJson( { "message": "Hello " & rc.name } );
} );

app.listen( 8090 );
```

The script is compiled once at startup and is not reloaded when the file changes. Its top level runs at startup and then again on every request, in a fresh VM, so variables set at the top of the script do not carry over between requests. Keep shared state in `session`, a file or a database.

### Application object

| Call | Purpose |
| :--- | :--- |
| `app.get/post/put/patch/delete( path, [middleware...], handler )` | Register a route. |
| `app.use( middleware )` | Add middleware that runs for every request. |
| `app.group( prefix )` | Returns a group with the same methods, a path prefix and its own `use()`. Groups nest. |
| `app.middleware.buildStaticFiles( mount, dir )` | Middleware that serves files from `dir` (relative to the script) under `mount`. Missing files fall through to routing. |
| `app.webhook( builder, handler )`, `app.buildWebhook()` | Signed webhook endpoint. See below. |
| `app.enableWebSockets( uri, listener )` | Attach a listener object. Its state is snapshotted when you register it. |
| `app.listen( port )` or `app.listen( { host, port } )` | Where to listen. Default `127.0.0.1:8080`. |

Routes:

- A path segment that starts with `:` captures that segment. There are no wildcards or regular expressions.
- A route matches only when the number of segments is equal. The first registered match wins.
- Only `get`, `post`, `put`, `patch` and `delete` can be registered. Other methods get `404`.
- An unmatched request returns `404` with the text `Not Found`.

Middleware has the signature `function( event, rc, prc, next )` and continues the chain with `next.run()`. Handlers have the signature `function( event, rc, prc )`.

### Request collections

| Name | Contents |
| :--- | :--- |
| `rc` | Query parameters, then form fields, then top-level keys of a JSON body, then route parameters. A later source overwrites an earlier one with the same name. |
| `prc` | Private collection for passing data between middleware and handlers. |
| `session` | Per-session struct, keyed by the `MBX_SESSION_ID` cookie that the server sets. The store is in memory, round-trips through JSON (only JSON types survive), and has no expiry. |

JSON bodies are parsed when `Content-Type` is JSON. The server does not limit the request body size.

### The event object

| Method | Returns or does |
| :--- | :--- |
| `getCollection()`, `getPrivateCollection()`, `getSession()` | The `rc`, `prc` and `session` structs. |
| `valueExists( key )`, `privateValueExists( key )`, `sessionExists( key )` | Whether the key exists. |
| `getValue( key, [default] )`, `getPrivateValue( key, [default] )`, `getSessionValue( key, [default] )` | Read a value. |
| `setValue( key, value, [private=false] )` | Set a value in `rc`, or in `prc` when the third argument is true. |
| `paramValue( key, default )`, `paramPrivateValue( key, default )`, `paramSessionValue( key, default )` | Set the value only when the key is missing. `setSessionValue` is an alias of `paramSessionValue`. |
| `getOnly( keys )`, `getExcept( keys )` | A struct holding only, or everything but, the named keys of `rc`. |
| `getRouteParams()` | Struct of the `:name` captures. |
| `getCurrentRoute()` | The matched pattern, such as `/hello/:name`. |
| `getHTTPMethod()`, `getRequestMethod()` | The request method. |
| `getPath( [withQuery=true] )` | Request path, with the raw query string unless `false`. |
| `getURL( [withQuery=true] )` | Full request URL, or only the path when `false`. |
| `getHTTPHeader( name, [default] )` | Request header. Names are case-insensitive. |
| `getHTTPCookie( name, [default] )`, `getCookie` | Request cookie. |
| `isJSON()`, `isAjax()` | Whether the request has a JSON content type, or `X-Requested-With: XMLHttpRequest`. |
| `getHTTPContent( [asJson=false] )` | Raw body as a string, or parsed JSON when `true`. Invalid JSON gives a `400`. |
| `setHTTPHeader( name, value )` | Add a response header. |
| `setHTTPCookie( name, value, [path="/"], [httpOnly=false] )`, `setCookie` | Add a `Set-Cookie` header. |
| `setHTTPStatus( code )` | Set the response status. |
| `clearSession()`, `invalidateSession()` | Empty the session struct. |
| `renderText( text )`, `renderHTML( html )`, `renderJSON( value )` | Set the body and content type. |
| `renderData( "json" \| "html" \| "text" \| "plain", data )` | Same, with the format as an argument. |
| `setView( path, [viewArgs] )`, `renderTemplate( path, [viewArgs] )` | Render a `.bxm` template (relative to the script) as HTML. The template sees `event`, `rc`, `prc`, `session` and `viewArgs`. |

`renderJSON` writes numbers as floating point, so `1` is serialized as `1.0`.

### Errors

If a handler throws, the response status comes from the start of the error message:

| Message contains | Status |
| :--- | :--- |
| `Bad Request:` | `400` |
| `Unauthorized:` | `401` |
| `Conflict:` | `409` |
| anything else | `500` |

The body is the error text, or `{"error": "..."}` when the request sends `Accept: application/json`.

### Webhooks

```
app.webhook(
    app.buildWebhook()
        .path( "/webhooks/stripe" )
        .secret( getSystemSetting( "STRIPE_SECRET" ) )
        .signatureHeader( "stripe-signature" )
        .prefix( "sha256=" )
        .timestampHeader( "stripe-timestamp" )
        .toleranceSeconds( 300 )
        .replayHeader( "stripe-event-id" )
        .replayTtlSeconds( 300 ),
    function( event, rc, prc ) {
        event.renderText( "ok" );
    }
);
```

A webhook is a `POST` route. The server computes an HMAC-SHA256 of the raw request body with the secret and compares its lowercase hex form with the signature header, after removing `prefix` if the header starts with it. A bare hex signature is also accepted.

| Builder method | Rule |
| :--- | :--- |
| `path`, `secret`, `signatureHeader` | Required. |
| `prefix` | Optional text stripped from the header value. |
| `timestampHeader` and `toleranceSeconds` | Set both or neither. The header must hold Unix seconds within the tolerance of the server clock. The timestamp is checked, not signed. |
| `replayHeader` | Delivery id header. A repeated id for the same path is rejected with `409` for the TTL. |
| `replayTtlSeconds` | Requires `replayHeader`. Default `3600`. The replay store is in memory. |

A missing or wrong signature, a missing or stale timestamp, or a missing delivery id returns `401`.

### WebSockets in the app server

```
listener = new ClickCounterSocket();
listener.configure();
app.enableWebSockets( "/ws", listener );
```

The listener and the channel API are the same as in the webroot server, except that the listener is an instance you create and configure yourself. Its state is captured when `enableWebSockets()` is called and restored inside the WebSocket runtime.
