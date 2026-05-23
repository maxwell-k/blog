"""Replace &#160; with unicode 00A0."""

from pelican import signals
from pelican.contents import Article


def replace(article: Article) -> None:
    """Replace &#160; with unicode 00A0."""
    # ruff: noqa: SLF001
    if hasattr(article, "_content") and article._content:
        article._content = article._content.replace("&#160;", "\u00a0")


def register() -> None:
    """Register the plugin from this file."""
    signals.content_object_init.connect(replace)


# plugins/unicode_nbsp.py
# Copyright 2026 Keith Maxwell
# SPDX-License-Identifier: MPL-2.0
