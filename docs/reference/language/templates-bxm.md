---
title: Templates (.bxm)
description: The .bxm template tags that work in MatchBox 0.11.0, the ones that are stubs, and the bugs to avoid.
icon: phosphor-duotone:file-html
---

# Templates (.bxm)

A `.bxm` file mixes markup with `<bx:...>` tags. Run one from the CLI with `matchbox page.bxm`, or serve a folder of them with `matchbox --serve --webroot .`. The playground does not run templates, so these snippets have no Run button.

Only the `bx:` prefix is recognized. `<cfoutput>` and the other CFML tags are copied to the output as text, and `.cfm` and `.cfc` files do not run.

## What works

| Tag | Notes |
| --- | --- |
| `<bx:set name = value>` | Assigns a variable. |
| `<bx:output>...</bx:output>` | Evaluates `#expression#` inside the body. |
| `<bx:if expr>`, `<bx:elseif expr>`, `<bx:else>`, `</bx:if>` | Conditionals. |
| `<bx:script>...</bx:script>` | Full script. `writeOutput()` and `println()` both write into the page. |
| `<!--- comment --->` | Removed from the output. |

```boxlang
<!--- a comment is removed --->
<bx:set name = "MatchBox">
<bx:set count = 3>
<p>Plain text keeps #name# as is.</p>
<bx:output><p>Hello #name#, count is #count + 1#.</p></bx:output>
<bx:if count gt 5>
  <p>big</p>
<bx:elseif count gt 1>
  <p>medium</p>
<bx:else>
  <p>small</p>
</bx:if>
<bx:script>
  items = [ "a", "b" ];
  for ( item in items ) {
    writeOutput( "<li>" & item & "</li>" );
  }
</bx:script>
```

Running `matchbox demo.bxm` prints:

```text



<p>Plain text keeps #name# as is.</p>
<p>Hello MatchBox, count is 4.</p>

  <p>medium</p>

<li>a</li><li>b</li>
```

- `#expression#` is only evaluated inside `<bx:output>`. Outside it, `#name#` stays literal text.
- Tags do not need a closing slash. `<bx:set x = 5>` is enough.
- Write conditions with `gt`, `lt`, `eq` and friends. A `>` inside `<bx:if x > 3>` ends the tag early and leaves ` 3>` in the page.

## Bugs to work around

### bx:set and bx:output inside bx:if

A `<bx:set>` or `<bx:output>` placed inside an `<bx:if>` body drops the rest of the template, including everything after `</bx:if>`.

```boxlang
<bx:set x = 5>
<bx:if x gt 3>A<bx:output>#x#</bx:output>B</bx:if>Z
```

This prints `A` and nothing else. `<bx:script>`, plain markup and a nested `<bx:if>` inside the body are fine:

```boxlang
<bx:set x = 5>
<bx:if x gt 3><bx:script>writeOutput( x );</bx:script></bx:if>Z
```

This prints `5Z`. Put the output in a `<bx:script>` block, or move the `<bx:output>` outside the `if`.

### bx:loop hangs

`<bx:loop>` compiles to an endless loop. The attributes are ignored, so this never finishes:

```boxlang
<bx:loop array="#[ 1, 2 ]#" item="i"><bx:output>#i#</bx:output></bx:loop>
```

The CLI had to be killed after a timeout. In a web server the request does not return. Use a `for` loop in `<bx:script>` instead. This is [issue #93](https://github.com/ortus-boxlang/matchbox/issues/93).

### Other tags are stubs

| Tag | What happens |
| --- | --- |
| `<bx:switch>` with `<bx:case>` | No `<bx:case>` body is ever printed, even when the value matches. A `<bx:defaultcase>` body runs instead, and the text after `</bx:switch>` was missing from the output when tested. |
| `<bx:try>` with `<bx:catch>` | The try body runs, but an error inside it is not caught: the request fails and the `<bx:catch>` body never runs. |
| `<bx:include template="x.bxm">` | Fails with `Include file not found:` and an empty path. |
| `<bx:import class="a.b">` | Ignored. |
| `<bx:throw message="boom">` | Raises an error, but the message is lost (`CustomException: null`). |

In `<bx:script>` use `switch`, `try`, `include "file.bxs"` and `throw` as in any script. `include` works in scripts.

## Web scopes in a served template

With `--serve`, templates can read `url`, `form`, `cookie` and `cgi`, and keep state in `session`. See [scopes](scopes.md). The [web server example](../../examples/web_server/README.md) shows the folder layout.
