AUTHOR = "Keith Maxwell"
SITENAME = "2024-09-18-pybelfast-workshop"
SITEURL = ""

PATH = "content"

TIMEZONE = "Europe/London"

DEFAULT_LANG = "en"

# Feed generation is usually not desired when developing
FEED_ALL_ATOM = None
CATEGORY_FEED_ATOM = None
TRANSLATION_FEED_ATOM = None
AUTHOR_FEED_ATOM = None
AUTHOR_FEED_RSS = None

SOCIAL = (("GitHub", "https://github.com/maxwell-k"),)

DEFAULT_PAGINATION = False

# Uncomment following line if you want document-relative URLs when developing
# RELATIVE_URLS = True

IGNORE_FILES = [".*.sw?", ".keep"]
DEFAULT_DATE_FORMAT = "%A %d %B %Y"

STATIC_PATHS = [
    "images",
    "extra",
]
EXTRA_PATH_METADATA = {
    "extra/favicon.ico": {"path": "favicon.ico"},  # and this
}
