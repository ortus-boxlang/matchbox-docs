#!/usr/bin/env python3
"""Assemble authored HTML into a dependency-free static site."""
import json
import shutil
from datetime import date
from html import escape
from html.parser import HTMLParser
from pathlib import Path
from string import Template

ROOT = Path(__file__).resolve().parent.parent
SOURCE = ROOT / "src"
OUTPUT = ROOT / "site"
REPO = "https://github.com/ortus-boxlang/matchbox"


class Article(HTMLParser):
    def __init__(self, content):
        super().__init__()
        self.headings = []
        self.text = []
        self.heading = None
        self.feed(content)

    def handle_starttag(self, tag, attrs):
        if tag == "h2":
            self.heading = [dict(attrs)["id"], ""]
        if tag in {"p", "li", "h2", "h3", "pre", "td", "th"}:
            self.text.append(" ")

    def handle_endtag(self, tag):
        if tag == "h2":
            self.headings.append(self.heading)
            self.heading = None
        if tag in {"p", "li", "h2", "h3", "pre", "td", "th"}:
            self.text.append(" ")

    def handle_data(self, text):
        self.text.append(text)
        if self.heading is not None:
            self.heading[1] += text


def build():
    pages = json.loads((SOURCE / "docs.json").read_text(encoding="utf-8"))
    layout = Template((SOURCE / "layout.html").read_text(encoding="utf-8"))
    (OUTPUT / "docs").mkdir(parents=True, exist_ok=True)
    shutil.copytree(ROOT / "assets", OUTPUT / "assets", dirs_exist_ok=True)
    for old in (OUTPUT / "docs").glob("*.html"):
        old.unlink()

    def render(path, title, description, content, is_doc=False):
        path.write_text(layout.substitute(
            title=escape(title), description=escape(description, quote=True),
            root="../" if is_doc else "./", content=content,
            page_class="docs-page" if is_doc else "home-page",
            docs_current='aria-current="true"' if is_doc else "", year=date.today().year,
        ), encoding="utf-8")

    render(OUTPUT / "index.html", "MatchBox — BoxLang power. Native freedom.",
           "The native Rust-powered BoxLang runtime. Build standalone applications, browser WebAssembly, web services, and ESP32 projects without a JVM.",
           (SOURCE / "index.html").read_text(encoding="utf-8"))

    groups = list(dict.fromkeys(page["group"] for page in pages))
    search_index = []
    for position, page in enumerate(pages):
        slug, title = page["slug"], escape(page["title"])
        article = (SOURCE / "docs" / f"{slug}.html").read_text(encoding="utf-8")
        parsed = Article(article)
        navigation = []
        for group in groups:
            links = []
            for other in pages:
                if other["group"] == group:
                    current = ' aria-current="page"' if other["slug"] == slug else ""
                    links.append(f'<a href="{other["slug"]}.html"{current}>{escape(other["title"])}</a>')
            navigation.append(f'<div><h2>{escape(group)}</h2>{"".join(links)}</div>')
        toc = "".join(f'<a href="#{escape(id)}">{escape(label)}</a>' for id, label in parsed.headings)
        pagination = []
        for offset, label, class_name in [(-1, "← Previous", "previous"), (1, "Next →", "next")]:
            if 0 <= position + offset < len(pages):
                other = pages[position + offset]
                pagination.append(f'<a class="{class_name}" href="{other["slug"]}.html"><small>{label}</small>{escape(other["title"])}</a>')
        source_kind = "blob" if Path(page["source"]).suffix else "tree"
        content = f'''<div class="docs-layout">
  <aside class="docs-sidebar" aria-label="Documentation navigation">
    <details class="docs-menu" open><summary>Browse documentation</summary>
      <a class="sidebar-home" href="index.html"><svg class="icon"><use href="../assets/icons.svg#book"/></svg> Documentation</a>
      <nav aria-label="Documentation">{"".join(navigation)}</nav>
    </details>
    <a class="sidebar-bottom" href="{REPO}/releases">View releases on GitHub ↗</a>
  </aside>
  <main class="doc-main" id="main">
    <div class="breadcrumbs"><a href="../index.html">Home</a><span>/</span><a href="index.html">Docs</a><span>/</span><span>{escape(page["group"])}</span></div>
    <header class="doc-heading"><p class="eyebrow">{escape(page["group"].upper())}</p><h1>{title}</h1><p class="doc-description">{escape(page["description"])}</p></header>
    <article class="article">{article}</article>
    <div class="doc-source"><a href="https://github.com/ortus-boxlang/matchbox-docs/edit/development/src/docs/{slug}.html">Edit this page ↗</a><a href="{REPO}/{source_kind}/master/{page["source"]}">View upstream source ↗</a></div>
    <nav class="doc-pagination" aria-label="Page navigation">{"".join(pagination)}</nav>
  </main>
  <aside class="doc-toc" aria-label="On this page"><h2>On this page</h2>{toc}<div class="toc-extras"><a href="{REPO}/issues">Report an issue ↗</a><a href="examples.html#community">Get community help ↗</a></div></aside>
</div>'''
        render(OUTPUT / "docs" / f"{slug}.html", f'{page["title"]} · MatchBox Docs', page["description"], content, True)
        search_index.append({
            "title": page["title"], "category": page["group"],
            "url": f"docs/{slug}.html", "description": page["description"],
            "text": " ".join("".join(parsed.text).split()),
        })
    (OUTPUT / "search-index.json").write_text(json.dumps(search_index, ensure_ascii=False), encoding="utf-8")
    (OUTPUT / ".nojekyll").touch()
    print(f"Built homepage + {len(pages)} documentation pages → {OUTPUT}")


if __name__ == "__main__":
    build()
