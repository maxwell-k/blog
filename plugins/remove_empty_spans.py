"""Remove empty spans from HTML output.

So that tidy doesn't report an error when viewing output files.

These spans are added by:
https://github.com/pygments/pygments/blob/2.18.0/pygments/formatters/html.py#L813
"""

import logging
from pathlib import Path

from pelican import signals

logger = logging.getLogger(__name__)


def remove_empty_spans(path_: str, context: dict) -> None:
    """Remove empty spands from HTML output."""
    path = Path(path_)
    if path.suffix != ".html":
        return

    text = path.read_text()
    path.write_text(text.replace("<span></span>", ""))
    if context["DEBUG"]:
        logger.debug("Removed any empty spans from %s", path)


def register() -> None:
    """Register the plugin from this file."""
    signals.content_written.connect(remove_empty_spans)


# plugins/remove_empty_spans.py
# Copyright 2026 Keith Maxwell
# SPDX-License-Identifier: MPL-2.0
