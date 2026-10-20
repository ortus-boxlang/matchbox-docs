---
title: App server example
description: A routed MatchBox app server built with web.server() and ColdBox-style handlers.
---

# MatchBox App Server Example

This example demonstrates the routed MatchBox app server API built around `web.server()` and ColdBox-style handlers:

```boxlang
function( event, rc, prc ) { ... }
```

App-server scripts should import the namespace explicitly:

```boxlang
import boxlang.web;
```

It is a different product from the static/BXM webroot server. Use this app server when you want to build:

* JSON APIs
* lightweight microservices
* middleware pipelines
* signed webhook receivers
* server-rendered endpoints with explicit template rendering
* apps that need explicit static asset mounts inside a routed server

This example is for the native `matchbox_server` binary. ESP32 firmware does not run `web.server()` scripts; it serves files from an `app/` directory instead. See [Building for ESP32](../../building-and-deploying/esp32.md). The [Web server guide](../../building-and-deploying/web-server.md) lists the whole app-server API.

For a websocket-focused example, see [websocket_counter](../websocket_counter/README.md).

## Project Structure

* `app.bxs`: Main routed application.
* `public/site.css`: Static asset served through app middleware.
* `views/home.bxm`: Template rendered by `event.setView()`.

## Key Concepts

### 1. The Handler Shape

Each route handler receives three arguments:

* `event`: A native request/response object with ColdBox-style helpers.
* `rc`: The public request collection. Route params, query params, form fields, and top-level JSON object keys are merged here.
* `prc`: The private request collection for passing internal state across middleware and handlers.

### 2. Middleware

Middleware uses a fourth `next` argument:

```boxlang
app.use( function( event, rc, prc, next ) {
    prc.requestStarted = true;
    next.run();
} );
```

Middleware can mutate `rc`, `prc`, `session`, headers, cookies, status codes, and response bodies.

### 3. Templates

Routes can render templates explicitly:

```boxlang
event.setView( "views/home.bxm", {
    "title": "MatchBox"
} );
```

Templates receive:

* `event`
* `rc`
* `prc`
* `session`
* `viewArgs`

### 4. Static Files Middleware

Static assets can be mounted explicitly inside the app server:

```boxlang
app.use( app.middleware.buildStaticFiles( "/assets", "public" ) );
```

This serves files from the `public` directory at `/assets/...`. The directory is resolved relative to the app script root, missing files fall through to the normal app routing path, and traversal outside the mounted directory is blocked.

### 5. Webhook Builder

Webhook endpoints can be declared with a fluent builder. There is no `env` scope; read secrets from the process environment with `getSystemSetting( name, [default] )`:

```boxlang
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

## Running the Example

The `--app` flag belongs to the `matchbox_server` binary, which you build from the MatchBox source tree. `matchbox app.bxs` cannot run this script. From the project root:

```bash
cargo run -p matchbox_server -- --app docs/examples/app_server/app.bxs
```

The address comes from `app.listen( 8090 )` in the script, which binds `127.0.0.1`. To listen on all interfaces pass a struct: `app.listen( { "host": "0.0.0.0", "port": 8090 } )`.

Then visit:

* `http://localhost:8090/`
* `http://localhost:8090/api/hello/MatchBox`
* `http://localhost:8090/assets/site.css`

The script is compiled once, but its top level runs again on every request. Reload `/` to see the visit count in `session.visitCount` rise: session data is kept by the `MBX_SESSION_ID` cookie, while a plain variable at the top of the script would reset on each request.

Because this app registers middleware with `app.use()`, an unknown URL such as `/missing` currently returns `500` instead of `404` in v0.11.0.

## What The Example Covers

* app-level middleware
* route groups
* cookies
* in-memory session state
* JSON responses
* static asset serving with `app.middleware.buildStaticFiles()`
* template rendering with `setView()`
* signed webhook route registration
* for websockets, see the dedicated websocket counter example
