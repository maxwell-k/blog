AUTHOR = "Keith Maxwell"
SITENAME = "2024-09-18-pybelfast-workshop"
SITEURL = ""
THEME = "./custom"
SUMMARY_MAX_LENGTH = 0

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

DIRECT_TEMPLATES = ["index", "tags"]
AUTHOR_SAVE_AS = ""

# pelicanconf.py
# Copyright 2024 Keith Maxwell
# SPDX-License-Identifier: CC0-1.0
