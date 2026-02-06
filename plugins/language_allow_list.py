from pathlib import Path

from pelican import signals
from pelican.contents import Article

FENCE = "```"

ALLOW_LIST = {
    "yaml",
    "diff",
    "python",
}


def on_content_init(content):
    if not isinstance(content, Article):
        return

    path = content.source_path
    if path is None:
        return

    text = Path(path).read_text()
    lines = [i for i in text.splitlines() if i.startswith(FENCE) and i != FENCE]
    languages = {i.removeprefix(FENCE) for i in lines}
    languages -= ALLOW_LIST
    for language in languages:
        msg = f"Language {language} in {path} is not allow listed in {__file__}"
        raise ValueError(msg)


def register():
    signals.content_object_init.connect(on_content_init)

# plugins/language_allow_list.py
# Copyright 2026 Keith Maxwell
# SPDX-License-Identifier: MPL-2.0
