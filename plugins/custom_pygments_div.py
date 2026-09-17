"""Customise pygments code blocks.

1. Remove empty spans from HTML output. So that tidy doesn't report an error
   when viewing output files. These spans are added by [1].
2. Insert a copy button. So that src/copy.js can listen for clicks and copy the
   relevant contents to the clipboard.
3. Remove extra blank lines after the div, so that djlint doesn't complain.

[1]: https://github.com/pygments/pygments/blob/2.18.0/pygments/formatters/html.py#L813
"""

import logging
from pathlib import Path

from pelican import signals

logger = logging.getLogger(__name__)

REMOVE_EMPTY_SPAN = (
    '<div class="highlight"><pre><span></span><code>',
    '<div class="highlight"><pre><code>',
)
INSERT_COPY_BUTTON = (
    "</code></pre></div>",
    '</code></pre><button type="button">Copy 📋</button></div>',
)


def custom_pygments_div(path_: str, context: dict) -> None:
    """Remove empty spands from HTML output."""
    path = Path(path_)
    if path.suffix != ".html":
        return

    if context["DEBUG"]:
        logger.debug("Processing %s", path)

    lines = path.read_text().splitlines()

    for before, after in (REMOVE_EMPTY_SPAN, INSERT_COPY_BUTTON):
        for i in range(len(lines)):
            line = lines[i]
            if line.startswith(before):
                lines[i] = after + line.removeprefix(before)

    output = []
    for line in lines:
        if not line and output[-2:] == [INSERT_COPY_BUTTON[1], ""]:
            logger.debug("Ignoring a second blank line before pygments div.")
            continue
        if line.startswith(REMOVE_EMPTY_SPAN[1]) and output[-2:] == ["", ""]:
            logger.debug("Removing second blank line before pygments div.")
            output.pop()

        output.append(line)

    path.write_text("\n".join(output))


def register() -> None:
    """Register the plugin from this file."""
    signals.content_written.connect(custom_pygments_div)


# plugins/custom_pygments_div.py
# Copyright 2026 Keith Maxwell
# SPDX-License-Identifier: MPL-2.0
