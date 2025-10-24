---
title: How I run Renovate locally
date: 2025-03-26T00:00:00.000Z
---

<!-- toc -->

- [A compatible version of Node.js](#a-compatible-version-of-nodejs)
- [A GitHub authentication token](#a-github-authentication-token)
- [A suitable shell command](#a-suitable-shell-command)

<!-- tocstop -->

**Why?** So that feedback is available quickly; so that I can efficiently
iterate on Renovate configuration.

… So that I can more easily configure automated dependency updates. Renovate
creates pull requests to update dependencies and supports configuration to
automatically merge certain updates.

… So that I can efficiently pin and update dependencies in a controlled manner.

… So that I avoid:

1. Unexpected breakage from incompatible dependencies and
2. Manual work to keep dependencies up to date and
3. Becoming “stuck” on old out-dated software versions.

I think that Renovate is a great software tool to help keep software
dependencies up to date. I use Renovate both locally and via the "Mend Renovate
Community Cloud". The rest of this post sets out the steps I use to run Renovate
locally.

**Why now?** I'm publishing this post today because, two days ago, [setuptools]
released a new major version — 78 — that [dropped] support for uppercase or dash
characters in `setup.cfg`. This led to discussion and a subsequent release
reinstating the earlier behaviour. I am a fan of setuptools, which I have used
extensively, and I fully support its maintainers. This was a helpful reminder of
the value in pinning dependencies and automating updates. Renovate makes it
straightforward to ensure an up to date, pinned, build backend is specified in
`pyproject.toml`.

**What?** Ensure Renovate can run locally with a suitable version of Node.js and
suitable credentials.

[setuptools]: https://pypi.org/project/setuptools/#history
[dropped]:
  https://setuptools.pypa.io/en/stable/history.html#deprecations-and-removals
[Renovate]: https://github.com/renovatebot/renovate/

**Prerequisites:**

All of this software apart from Renovate itself can be installed from the system
package repositories on Fedora 40.

Command to install pre-requisites on Fedora 40:

    sudo dnf install \
        gh \
        jq \
        nodejs-npm \
        python3-keyring

### A compatible version of Node.js

Install a version of Node.js that matches the [engines] key in `package.json`.
Today that is:

    "node": "^20.15.1 || ^22.11.0",

[engines]: https://github.com/renovatebot/renovate/blob/main/package.json#L139

Command to show the current node version:

    npm version --json | jq --raw-output .node

Example output:

    20.18.2

If a suitable version is not available from the system package manager then I
recommend [fnm](https://github.com/Schniz/fnm).

### A GitHub authentication token

Depending upon the repository configuration, if Renovate is run without a GitHub
token it will either display a warning or fail. A example warning message is
below:

    WARN: GitHub token is required for some dependencies (repository=local)

For me, the easiest way to securely retrieve and store an access token for
GitHub is to use the [command line interface] (CLI). The CLI stores a token for
its own use in the system [keyring]. First ensure the CLI is installed.

[keyring]: https://github.com/jaraco/keyring
[command line interface]: https://cli.github.com/

Command to check status of the token used by `gh`:

    gh auth status --show-token

Command to retrieve the token used by `gh`:

    keyring get gh:github.com ""

[specified]: https://github.com/renovatebot/renovate/blob/main/package.json#L138

### A suitable shell command

Command to run Renovate with debugging output:

    GITHUB_COM_TOKEN=$(keyring get gh:github.com "") \
    LOG_LEVEL=debug \
    npm exec --yes renovate -- --platform=local

<!--
Copyright 2025 Keith Maxwell
SPDX-License-Identifier: CC-BY-SA-4.0
-->
<!-- vim: set filetype=markdown.markdown-toc : -->
