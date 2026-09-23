#!/usr/bin/env python3
"""Build and check every local link, fragment, asset, and search-index entry."""
import json
from html.parser import HTMLParser
from pathlib import Path
from urllib.parse import unquote, urlsplit
import xml.etree.ElementTree as ET

from build import OUTPUT, build


class Page(HTMLParser):
    def __init__(self, path):
        super().__init__()
        self.path = path
        self.ids = set()
        self.links = []
        self.h1 = 0
        self.main = 0
        self.description = False
        self.feed(path.read_text(encoding="utf-8"))

    def handle_starttag(self, tag, attrs):
        attrs = dict(attrs)
        if "id" in attrs:
            assert attrs["id"] not in self.ids, f"Duplicate ID: {self.path}: {attrs['id']}"
            self.ids.add(attrs["id"])
        self.h1 += tag == "h1"
        self.main += tag == "main"
        if tag == "meta" and attrs.get("name") == "description":
            self.description = bool(attrs.get("content"))
        if tag == "img":
            assert "alt" in attrs, f"Image missing alt: {self.path}"
        if tag == "button":
            assert attrs.get("type") in {"button", "submit", "reset"}, f"Button missing valid type: {self.path}"
        for attribute in ("href", "src"):
            if attribute in attrs:
                self.links.append(attrs[attribute])


def check():
    build()
    pages = {path.resolve(): Page(path) for path in OUTPUT.rglob("*.html")}
    links = 0
    for path, page in pages.items():
        assert page.h1 == 1 and page.main == 1 and page.description, f"Missing page structure: {path}"
        for href in page.links:
            url = urlsplit(href)
            if url.scheme or url.netloc:
                continue
            target = (path.parent / unquote(url.path)).resolve() if url.path else path
            if target.is_dir():
                target /= "index.html"
            assert OUTPUT.resolve() in target.parents, f"Link leaves site: {path}: {href}"
            assert target.is_file(), f"Broken link: {path}: {href}"
            if url.fragment:
                if target.suffix == ".html":
                    ids = pages[target].ids
                elif target.suffix == ".svg":
                    ids = {item.get("id") for item in ET.parse(target).iter()}
                else:
                    continue
                assert unquote(url.fragment) in ids, f"Broken fragment: {path}: {href}"
            links += 1
    index = json.loads((OUTPUT / "search-index.json").read_text(encoding="utf-8"))
    expected = {str(path.relative_to(OUTPUT.resolve())) for path in pages if path.parent.name == "docs"}
    assert {item["url"] for item in index} == expected, "Search index does not cover the docs"
    assert len(index) == len(expected), "Duplicate search entries"
    assert all(len(item["text"]) > 150 for item in index), "Empty search body"
    assert (OUTPUT / "assets/manrope.woff2").read_bytes().startswith(b"wOF2"), "Invalid local font"
    print(f"PASS: {len(pages)} HTML pages, {links} local links/assets, and {len(index)} search entries.")


if __name__ == "__main__":
    check()
