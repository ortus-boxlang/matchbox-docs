---
title: Web server example
description: The built-in MatchBox web server serving .bxm pages and static assets with session and form scopes.
---

# MatchBox web server example

This example serves a directory with `matchbox --serve`. It has BoxLang Markup (`.bxm`) pages, a static CSS file, and the `url`, `form`, `cookie`, `session` and `cgi` scopes. The [Web server guide](../../building-and-deploying/web-server.md) covers the server in full.

## Project structure

* `index.bxm`: Home page. Counts visits in the **session** and prints the time.
* `about.bxm`: Prints `cgi.server_port`.
* `contact.bxm`: Reads `url.name` and shows the session id from the **cookie** scope.
* `styles.css`: A static file, served as `text/css`.

## How it works

Every `.bxm` or `.bxs` file under the webroot is rendered as a template when you request it. Other files are sent as they are. A request for a directory is answered by its `index.bxm` or `index.bxs`.

Each page render starts with these scopes:

* `url`: query-string parameters.
* `form`: fields of a URL-encoded POST body.
* `cookie`: request cookies, including `MBX_SESSION_ID`.
* `session`: a struct held in server memory for each `MBX_SESSION_ID` cookie. Values are kept as strings.
* `cgi`: `request_method`, `script_name`, `path_info`, `server_name`, `server_port`, `http_host`, `content_type` and `content_length`.

The server is built on Axum and Tokio and runs the same VM as the `matchbox` command.

## Running the example

1. From the `docs/examples` directory of the MatchBox source tree, or any directory that contains a copy of `web_server`:
   ```bash
   matchbox --serve --webroot web_server --port 8080
   ```
2. Open `http://localhost:8080`.
3. Visit `http://localhost:8080/contact.bxm?name=MatchBox` to see URL parameter handling.
4. Reload the home page. The visit count in `session.visitCount` goes up each time your browser sends the same session cookie.

The server listens on `127.0.0.1` unless you pass `--host 0.0.0.0`.

> [!note] Template tags
> Use `<bx:output>` to evaluate `#expression#` in markup. This example keeps branching in `<bx:script>` and renders the result with one output block.
