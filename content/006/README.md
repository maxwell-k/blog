---
title: Why run Renovate locally?
date: 2025-03-26T00:00:00.000Z
modified: 2026-05-23T00:00:00.000Z
---

In the first half of 2026 there have been high-profile incidents using open
source tools as an attack vector. Arguments for keeping
dependencies to a minimum and avoiding updates have risen in prominence. For
example Mitchell Hashimoto recently tweeted:

> Fork your dependencies, trim them to only your use case, never update unless
> it breaks for your users. I’ve been vocal about this for 10+ years. I’ve
> always said that updating is way riskier than latent bugs (which can be
> tracked and CVEs monitored) … Feeling pretty swell about this mentality with
> all the supply chain attacks happening.

—<https://x.com/mitchellh/status/2057171518027887035>

In 2026, I still use Renovate. The value of pinning to specific versions of
dependencies and using cryptographic integrity hashes remains high and
is increasing. Renovate is an automation tool that supports these practices. The
value of updating to the latest version of dependencies is less clear. To me
Renovate remains a useful tool.

An earlier version of this post included instructions on how to run Renovate
locally. I have updated and moved those instructions to a [separate post].

---

**Why run Renovate locally?** Renovate is open-source software for controlling
dependencies. At the moment I typically use the [Mend Renovate Community Cloud]
with GitHub. Sometimes when I am iterating on a piece of configuration I want a
shorter feedback loop. Running Renovate locally helps.

**Why?** So that feedback is available quickly; so that I can efficiently
iterate on Renovate configuration.

… So that I can more easily configure automation for dependency pinning and
updates.

… So that I have more control.

… So that I avoid:

1. Unexpected breakage from incompatible dependencies and
2. Manual work to keep dependencies up to date and
3. Becoming “stuck” on old out-dated software versions and
4. Unpinned dependencies.

**Why now?** I published the initial version of this post because two days
prior, [setuptools] released a new major version — 78 — that [dropped] support
for uppercase or dash characters in `setup.cfg`. This led to discussion and a
subsequent release reinstating the earlier behaviour. I am a fan of setuptools,
which I have used extensively, and I fully support its maintainers. This was a
helpful reminder of the value in pinning dependencies and automating updates.
Renovate makes it straightforward to ensure an up to date, pinned, build backend
is specified in `pyproject.toml`.

**What?** Ensure I can conveniently [run Renovate locally].

[Mend Renovate Community Cloud]: https://developer.mend.io/
[Renovate]: https://github.com/renovatebot/renovate/
[dropped]: https://setuptools.pypa.io/en/stable/history.html#deprecations-and-removals
[minimumReleaseAge]: https://docs.renovatebot.com/key-concepts/minimum-release-age/
[run Renovate locally]: {filename}/015/README.md
[separate post]: {filename}/015/README.md
[setuptools]: https://pypi.org/project/setuptools/#history

<!--
Copyright 2025 Keith Maxwell
SPDX-License-Identifier: CC-BY-SA-4.0
-->
