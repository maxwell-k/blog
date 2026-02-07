#!/usr/bin/env -S uv tool run --with-requirements=requirements.txt pelican --settings
AUTHOR = "Keith Maxwell"
SITENAME = "Keith Maxwell’s Blog"
# SITEURL is typically set using --extra-settings, including on GitHub actions:
# https://github.com/getpelican/pelican/blob/4.11.0/.github/workflows/github_pages.yml#L30
SITEURL = ""
SUMMARY_MAX_LENGTH = 0

THEME = "theme"
THEME_STATIC_DIR = ""
PATH = "content"

TIMEZONE = "Europe/London"

# Feed generation is usually not desired when developing
FEED_ALL_ATOM = None
CATEGORY_FEED_ATOM = None
TRANSLATION_FEED_ATOM = None
AUTHOR_FEED_ATOM = None
AUTHOR_FEED_RSS = None

# Uncomment following line if you want document-relative URLs when developing
# RELATIVE_URLS = True

IGNORE_FILES = [".*.sw?", ".keep", "*.license"]

STATIC_PATHS = [
    "extra",
]
EXTRA_PATH_METADATA = {
    "extra/favicon.ico": {"path": "favicon.ico"},  # and this
}

MARKDOWN = {
    "extension_configs": {
        "markdown.extensions.codehilite": {
            "css_class": "highlight",
            "guess_lang": False,
        },
        "markdown.extensions.extra": {},
    },
    "output_format": "html5",
}

DIRECT_TEMPLATES = ["index"]
AUTHOR_SAVE_AS = ""
CATEGORY_SAVE_AS = ""
PLUGIN_PATHS = ["plugins"]
PLUGINS = [
    "language_allow_list",
]

# pelicanconf.py
# Copyright 2024 Keith Maxwell
# SPDX-License-Identifier: CC0-1.0
