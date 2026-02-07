"""Remove empty spans from HTML output.

So that tidy doesn't report an error when viewing output files.

These spans are added by:
https://github.com/pygments/pygments/blob/2.18.0/pygments/formatters/html.py#L813
"""

import logging
from pathlib import Path

from pelican import signals

logger = logging.getLogger(__name__)

PAIRS = (
    (
        '<div class="highlight"><pre><span></span><code>',
        '<div class="highlight"><pre><code>',
    ),
)


def custom_pygments_div(path_: str, context: dict) -> None:
    """Remove empty spands from HTML output."""
    path = Path(path_)
    if path.suffix != ".html":
        return

    if context["DEBUG"]:
        logger.debug("Processing %s", path)
    lines = path.read_text().splitlines()
    for before, after in PAIRS:
        for i in range(len(lines)):
            line = lines[i]
            if line.startswith(before):
                lines[i] = after + line.removeprefix(before)
    path.write_text("\n".join(lines))


def register() -> None:
    """Register the plugin from this file."""
    signals.content_written.connect(custom_pygments_div)


# plugins/custom_pygments_div.py
# Copyright 2026 Keith Maxwell
# SPDX-License-Identifier: MPL-2.0
