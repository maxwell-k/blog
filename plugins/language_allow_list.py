"""Error if an language isn't in ALLOW_LIST.

Not all of of the language syntax higlighting is desirable. This plugin allows
some of it to be avoided.
"""

from pathlib import Path

from pelican import signals
from pelican.contents import Article, Content

FENCE = "```"

ALLOW_LIST = {
    "yaml",
    "diff",
    "python",
}


def language_allow_list(content: Content) -> None:
    """Error if content has a fenced code block with a language not allow listed."""
    if not isinstance(content, Article):
        return

    path = content.source_path
    if path is None or not path.endswith(".md"):
        return

    text = Path(path).read_text()
    lines = [i for i in text.splitlines() if i.startswith(FENCE) and i != FENCE]
    languages = {i.removeprefix(FENCE) for i in lines}
    languages -= ALLOW_LIST
    for language in languages:
        msg = f"Language {language} in {path} is not allow listed in {__file__}"
        raise ValueError(msg)


def register() -> None:
    """Register the plugin from this file."""
    signals.content_object_init.connect(language_allow_list)


# plugins/language_allow_list.py
# Copyright 2026 Keith Maxwell
# SPDX-License-Identifier: MPL-2.0
