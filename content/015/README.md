---
title: How I run Renovate locally
date: 2026-05-23T00:00:00.000Z
---

This post explains **how** I run [Renovate] locally. I have a separate post on [why
I run Renovate locally].

I have found running Renovate locally tricky; I think because Renovate:

1. Requires a token to authenticate access to GitHub [^1]
2. Should be run under a specific version of [Node.js][^2]
3. Can use two different, incompatible, regular expression syntaxes depending on
   the installation [^3]
4. Versions are not always available from [NPM][^4]
5. The project releases a new version several times per day

The Renovate GitHub repository includes a [document] with advice how to run
Renovate locally for development. Jamie Tanna, the community manager for
Renovate, also publishes [a guide]. This post is different, it strives to be
"fast and simple" [^5].

The cloud service uses the latest version of Renovate [^6]. From time to time,
I intend to update this post to the latest release of Renovate. For that, two
pieces of information are required:

1. The latest version number; today **43.195.6** and
2. A supported engine; today Node.js **24.16.0** — the version pinned in
   [.nvmrc].

<details markdown=1>

<summary>Script to keep this post up to date</summary>

<!-- embedme versions.py -->

```python
#!/usr/bin/env -S uv run --script
"""Query and write version numbers relating to Renovate."""

# /// script
# requires-python = ">=3.13"
# dependencies = [ "httpx" ]
# ///

import re
from argparse import ArgumentParser
from enum import Enum
from pathlib import Path

import httpx

PATTERN = re.compile(r"\d+[.]\d+[.]\d+")
README = Path("README.md")


Mode = Enum("Mode", ["query", "write"])


def _main(arg_list: list[str] | None = None) -> int:
    parser = ArgumentParser()
    parser.set_defaults(mode=Mode.query)
    subparsers = parser.add_subparsers()
    help_ = "query versions from GitHub"
    subparsers.add_parser("query", help=help_).set_defaults(mode=Mode.query)
    help_ = f"write versions to {README}"
    subparsers.add_parser("write", help=help_).set_defaults(mode=Mode.write)
    args = parser.parse_args(arg_list)

    response = httpx.get("https://github.com/renovatebot/renovate/releases/latest")
    if not response.is_redirect or response.next_request is None:
        return 1
    renovate = str(response.next_request.url).rsplit("/", maxsplit=1)[1]

    response = httpx.get(
        "https://raw.githubusercontent.com/renovatebot/renovate/"
        f"refs/tags/{renovate}/.nvmrc",
    )
    node = response.text.strip()
    if args.mode == Mode.query:
        print(renovate)
        print(node)
        return 0

    text = README.read_text()
    matches = PATTERN.finditer(text)
    renovate_before = next(matches)[0]
    node_before = next(matches)[0]
    README.write_text(
        text.replace(renovate_before, renovate).replace(node_before, node),
    )
    return 0


if __name__ == "__main__":
    raise SystemExit(_main())
```

</details>

These instructions assume the following pre-requisites are installed [^7] and that
the GitHub CLI has been authenticated:

| Prerequisite        | Executable | Fedora Linux 43 package |
| ------------------- | ---------- | ----------------------- |
| [GitHub CLI]        | `gh`       | `gh`                    |
| [Git]               | `git`      | `git`                   |
| [keyring]           | `keyring`  | `python3-keyring`       |
| [Fast Node Manager] | `fnm`      | None available          |

<!--
keyring can be removed once everything is running on Fedora Linux 43 or later:
"gh auth status --show-token --json hosts --jq '.hosts."github.com"[0].token'"
-->

Command to download a recent copy of the Renovate git repository:

    git clone --branch 43.195.6 https://github.com/renovatebot/renovate.git

Command to install the correct version of Node.js, install dependencies from NPM,
build the project, set and export environment variables and configure an alias for
both `renovate` and `renovate-config-validator`:

    cd renovate \
    && eval "$(fnm env)" \
    && fnm install 24.16.0 \
    && fnm exec --using=24.16.0 npm --no-git-tag-version version 43.195.6 \
    && fnm exec --using=24.16.0 npm exec --yes pnpm install \
    && fnm exec --using=24.16.0 npm exec --yes pnpm build \
    && RENOVATE_GITHUB_COM_TOKEN="$(keyring get gh:github.com "")" \
    && RENOVATE_PLATFORM=local \
    && LOG_LEVEL=debug \
    && export RENOVATE_GITHUB_COM_TOKEN RENOVATE_PLATFORM LOG_LEVEL \
    && alias \
      renovate="fnm exec --using=24.16.0 node $PWD/lib/renovate.ts" \
      renovate-config-validator="fnm exec --using=24.16.0 node $PWD/lib/config-validator.ts" \
    && cd ..

<details markdown=1>

<summary>Example usage</summary>

Command to check the renovate version:

    renovate --version

Expected output:

    43.195.6

Command to validate a repository configuration file:

    renovate-config-validator --no-global ~/github.com/maxwell-k/dotfiles/.renovaterc.json

Expected output:

    ✂
    INFO: Validating /home/maxwell-k/github.com/maxwell-k/dotfiles/.renovaterc.json as repo config
    INFO: Config validated successfully

Command to run Renovate against the current working directory with debug output
shown on-screen and written to `log.txt`:

    renovate | tee log.txt

Command to dry-run Renovate against a remote GitHub repository:

    renovate --dry-run maxwell-k/dotfiles | tee log.txt

</details>

[^1]: Depending upon the repository configuration, if Renovate is run without a
    GitHub access token it will either display a warning or fail. A example
    warning message is:

    > WARN: GitHub token is required for some dependencies (repository=local)

    For me, the easiest way to securely retrieve and store an access token for
    GitHub is to use the [command line interface] (CLI). The GitHub CLI stores a token
    for its own use in the system [keyring].

    Command to check status of the token used by the GitHub CLI:

        gh auth status --show-token

    Command to retrieve the token used by the GitHub CLI:

        keyring get gh:github.com ""

[^2]: Renovate needs a specific version of Node.js; using an older version of
    Node.js can force an older version of Renovate. The version of Node.js must
    match the [engines] key in `package.json`. For example for [local
    development] the Renovate developers:

    > … recommend you use the version of Node.js defined in the repository's .nvmrc

[^3]: Renovate [uses] re2 syntax for regular expressions. If the [re2] NPM
    package is not installed Renovate will fall back to the incompatible
    "RegExp" syntax. Running Renovate in an environment with or without re2
    available will give different results; less than desirable if you are trying
    to reproduce or debug behaviour! The relevant lines in logs are:
    `DEBUG: Using RE2 regex engine` or
    `WARN: RE2 not usable, falling back to RegExp`.

[^4]: In [2025], the NPM registry blocked the project from [publishing] as it
    has "too many versions". While publishing to NPM restarted after older
    versions were unpublished, in [2026] the issue re-occurred and is currently
    ongoing. At the time of writing the Renovate repository contains 11,698
    tags.

[^5]: A phrase I'm borrowing from Fast Node Manager.

[^6]: The Mend Renovate Community Cloud uses the latest version of Renovate, with
    a short delay before upgrades. [Logs] for a job will show the version number:

    ```
    INFO: Renovate started
    {
      "renovateVersion": "«version number»"
    }
    ```

[^7]: Command to install the packages other than `fnm` on Fedora Linux 43:

        dnf install --assumeyes gh git python3-keyring

[.nvmrc]: https://github.com/renovatebot/renovate/blob/main/.nvmrc
[2025]: https://github.com/renovatebot/renovate/discussions/38341
[2026]: https://github.com/renovatebot/renovate/discussions/42965
[Fast Node Manager]: https://github.com/Schniz/fnm
[GitHub CLI]: https://cli.github.com/
[Git]: https://git-scm.com/
[Logs]: https://developer.mend.io/
[Mend Renovate Community Cloud]: https://docs.renovatebot.com/mend-hosted/overview/
[NPM]: https://www.npmjs.com/package/renovate
[Node.js]: https://nodejs.org/en
[Renovate]: https://github.com/renovatebot/renovate
[a guide]: https://www.jvt.me/posts/2026/03/08/renovate-test-config/
[command line interface]: https://cli.github.com/
[document]: https://github.com/renovatebot/renovate/blob/main/docs/development/local-development.md
[engines]: https://github.com/renovatebot/renovate/blob/main/package.json#L139
[keyring]: https://github.com/jaraco/keyring
[publishing]: https://www.npmjs.com/package/renovate
[re2]: https://www.npmjs.com/package/re2
[specified]: https://github.com/renovatebot/renovate/blob/main/package.json#L138
[uses]: https://docs.renovatebot.com/string-pattern-matching/#renovate-uses-re2-syntax
[why I run Renovate locally]: {filename}/006/README.md

<!--
Copyright 2026 Keith Maxwell
SPDX-License-Identifier: CC-BY-SA-4.0
-->
