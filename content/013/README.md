---
title: Is uv the best tool to answer ‘what dependencies does X bring in’?
date: 2026-02-02
---

<!--
Copyright 2025 Keith Maxwell
SPDX-License-Identifier: CC-BY-SA-4.0
-->

[3.12]: https://github.com/python/cpython/blob/3.12/Lib/venv/__init__.py#L176
[3.13]: https://github.com/python/cpython/blob/3.13/Lib/venv/__init__.py#L185
[3.14]: https://github.com/python/cpython/blob/3.14/Lib/venv/__init__.py#L194
[GraphViz]: https://www.graphviz.org/
[PyPI]: https://pypi.org/
[gkeepapi]: https://github.com/kiwiz/gkeepapi
[johnnydep]: https://github.com/wimglenn/johnnydep
[pipdeptree]: https://github.com/tox-dev/pipdeptree
[pymupdf]: https://pypi.org/project/PyMuPDF/
[uv]: https://github.com/astral-sh/uv
[uv tree]: https://docs.astral.sh/uv/reference/cli/#uv-tree
[virtualenv]: https://github.com/pypa/virtualenv

Sometimes; other times I prefer [johnnydep] or [pipdeptree]. This post discusses
the advantages of each from my perspective.

I recently started using [pymupdf]. First impressions are that it is a very
capable AGPL-3.0 Python library for analysing and extracting information from
PDFs. Before committing to pymupdf I wanted to understand ‘what dependencies
does pymupdf bring in’?

Command to display the `pymupdf` dependencies:

    uv tool run johnnydep --verbose=0 pymupdf

Output:

    name     summary
    -------  ------------------------------------------------------------------------------------------------------------------------
    pymupdf  A high performance Python library for data extraction, analysis, conversion & manipulation of PDF (and other) documents.

Brilliant. No other dependencies.

This is an example of a common question I ask when I work with Python: ‘what
dependencies does X bring in’? Often X is an open source package from [PyPI];
sometimes its a proprietary package from elsewhere.

The answer for pymupdf is very simple: none. Another package that I looked at
recently — [gkeepapi] — gives a less simple answer. That's a better illustration
for the rest of this discussion.

<details markdown=1>

<summary>What dependencies does gkeepapi bring in?</summary>

Command to display the `gkeepapi` dependencies:

    uv tool run johnnydep --verbose=0 gkeepapi

Output:

    name                                  summary
    ------------------------------------  -------------------------------------------------------------------------------------------------------
    gkeepapi                              An unofficial Google Keep API client
    ├── future>=0.16.0                    Clean single-source support for Python 3 and 2
    └── gpsoauth>=1.1.0                   A python client library for Google Play Services OAuth.
        ├── pycryptodomex>=3.0            Cryptographic library for Python
        ├── requests>=2.0.0               Python HTTP for Humans.
        │   ├── certifi>=2017.4.17        Python package for providing Mozilla's CA Bundle.
        │   ├── charset_normalizer<4,>=2  The Real First Universal Charset Detector. Open, modern and actively maintained alternative to Chardet.
        │   ├── idna<4,>=2.5              Internationalized Domain Names in Applications (IDNA)
        │   └── urllib3<3,>=1.21.1        HTTP library with thread-safe connection pooling, file post, and more.
        └── urllib3>=1.26.0               HTTP library with thread-safe connection pooling, file post, and more.

</details>

A critical reader might point out that I used two tools in the
examples above, I used both (1) [uv] and (2) [johnnydep]. Why did I choose to
use two tools?

I've used johnnydep for a long time and I love the simplicity of its interface.

The default tool that I reach for when working with Python packages is uv.
Initially I adopted uv because of its speed; it also has a very active and
encouraging maintainer team.

For investigating dependencies, uv has a tree subcommand that requires either a project configured with a
pyproject.toml file or a script with inline dependency metadata.

Let's start with the latter as `example.py`:

<!-- embedme example.py -->

```
#!/usr/bin/env -S uv run --script
"""Simple example."""

# /// script
# requires-python = ">=3.13"
# dependencies = ["gkeepapi"]
# ///

import gkeepapi

if __name__ == "__main__":
    print(gkeepapi.__version__)
```

Command to demonstrate `uv tree`:

    uv tree --script example.py

Output:

    Resolved 9 packages in 7ms
    gkeepapi v0.17.1
    ├── future v1.0.0
    └── gpsoauth v2.0.0
        ├── pycryptodomex v3.23.0
        ├── requests v2.32.5
        │   ├── certifi v2026.1.4
        │   ├── charset-normalizer v3.4.4
        │   ├── idna v3.11
        │   └── urllib3 v2.6.3
        └── urllib3 v2.6.3

The third option that I will sometimes reach for is [pipdeptree].

Pipdeptree works with installed Python packages, for example from a virtual
environment. Analysing installed packages is often a huge benefit when
working with proprietary software. Installing packages from a company's
infrastructure is typically a solved problem. Analysing installed packages
avoids integrating the analysis tool with source control or company
infrastructure like an internal package repository.

Pipdeptree can output visualisations via [GraphViz] and I have found that
graphical output invaluable. I have incorporated it into both written material and
presentations to stakeholders. Visualising dependency relationships as a graph
can really help with communication.

Uv's `tree` subcommand and the name pipdeptree both suggest working with trees.
A property of a tree is that it is acyclic, in other words it does not contain
any loops. Unfortunately not every Python dependency graph is acyclic.

Professionally, I've worked with sets of twenty or thirty proprietary packages
that include cycles in their dependencies graphs. One package depends on another
that in turn depends on the first. I recommend avoiding cycles. They can
surprise developers for example requiring coordination when releasing new
versions. If cycles are unavoidable then ensuring they are well understood with
tools like pipdeptree and GraphViz helps.

Pipdeptree also shows any dependency ranges specified in package metadata and a
number of warnings. Both can be very helpful when debugging packaging or
installation issues.

Commands to demonstrate `pipdeptree`:

    uv tool run virtualenv --quiet .venv \
    && uv pip install --quiet gkeepapi pipdeptree \
    && .venv/bin/pipdeptree

Output:

    gkeepapi==0.17.1
    ├── gpsoauth [required: >=1.1.0, installed: 2.0.0]
    │   ├── pycryptodomex [required: >=3.0, installed: 3.23.0]
    │   ├── requests [required: >=2.0.0, installed: 2.32.5]
    │   │   ├── charset-normalizer [required: >=2,<4, installed: 3.4.4]
    │   │   ├── idna [required: >=2.5,<4, installed: 3.11]
    │   │   ├── urllib3 [required: >=1.21.1,<3, installed: 2.6.3]
    │   │   └── certifi [required: >=2017.4.17, installed: 2026.1.4]
    │   └── urllib3 [required: >=1.26.0, installed: 2.6.3]
    └── future [required: >=0.16.0, installed: 1.0.0]
    pipdeptree==2.30.0
    ├── packaging [required: >=25, installed: 26.0]
    └── pip [required: >=25.2, installed: 25.3]

I appreciate that I've introduced another tool above — [virtualenv]. This is to
avoid a warning from pipdeptree. I'll go into more detail on that warning in a
follow up post.

To recap, when I'm thinking ‘what dependencies does X bring in’ I reach for:

1. [johnnydep] if X is straightforward or if X is on PyPI or
2. [uv tree] if the dependency on X is already or easily codified in inline
   script metadata or `pyproject.toml` or
3. [pipdeptree] if X is proprietary, if I want to visualise the dependency
   graph or if I want detailed information on version ranges.
