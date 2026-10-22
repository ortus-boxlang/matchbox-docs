---
title: Templates (.bxm)
description: Mix markup and BoxLang to render pages from the CLI or web server.
icon: phosphor-duotone:file-html
---

# Templates (.bxm)

A `.bxm` file combines markup with BoxLang tags and script blocks. Run a template with `matchbox page.bxm`, or serve a directory with `matchbox --serve --webroot www`.

## A simple template

```boxlang
<bx:set name = "MatchBox">
<bx:output><h1>Hello, #name#!</h1></bx:output>

<bx:script>
    items = [ "native", "browser", "embedded" ];
    for ( item in items ) {
        writeOutput( "<p>Build for " & item & "</p>" );
    }
</bx:script>
```

`<bx:output>` evaluates `#expression#` inside its body. `<bx:script>` runs BoxLang code; `writeOutput()` writes into the page. Escape untrusted text with `encodeForHTML()` before inserting it into HTML.

## Common tags

| Tag | Purpose |
| --- | --- |
| `<bx:set>` | Assign a value. |
| `<bx:output>` | Render expressions inside markup. |
| `<bx:if>`, `<bx:elseif>`, `<bx:else>` | Choose a branch. |
| `<bx:loop>` | Repeat template content. |
| `<bx:include>` | Include another template. |
| `<bx:script>` | Use script syntax within a template. |
| `<!--- comment --->` | Add a comment that is not rendered. |

Use word operators such as `gt` and `lt` in tag conditions so a `>` character does not end the tag early. Script blocks are useful for more involved control flow.

## Serving templates

Server-rendered templates can read request scopes such as `url`, `form` and `cgi`, and keep session state. These belong to the server environment; the browser playground does not serve templates.

See [Web server](../../building-and-deploying/web-server.md), [scopes](scopes.md) and the [web server example](../../examples/web_server/README.md) for complete applications.

MatchBox uses BoxLang's `bx:` tags, not CFML's `cf` tags.
