---
title: How does Fedora build disk images?
date: 2025-07-20
---

<!--
Copyright 2025 Keith Maxwell
SPDX-License-Identifier: CC-BY-SA-4.0
-->

Fedora has lots of tools for building disk images in ISO format; for example
[imagefactory](https://packages.fedoraproject.org/pkgs/imagefactory/imagefactory/),
[livecd-tools](https://packages.fedoraproject.org/pkgs/livecd-tools/livecd-tools/),
[lorax](https://packages.fedoraproject.org/pkgs/lorax/lorax/),
[kiwi-cli](https://packages.fedoraproject.org/pkgs/kiwi/kiwi-cli/) and
[image-builder](https://packages.fedoraproject.org/pkgs/image-builder/image-builder/)
are all currently packaged. I plan to build an image to follow the [YubiKey
guide] and I want to use a popular and maintained tool; ideally I'll use the
tool Fedora uses for release artifacts. There is [some confusion] over which is
used for the official Fedora Workstation Live ISO images (“ISOs”) today.

**TLDR;** ISOs are [built] in the Koji build system with a long-running project
[from openSUSE] called KIWI — [Documentation], [GitHub]. Look at a specific
build to confirm: under logs and then the relevant architecture, `root.log`
shows a call to `kiwi-ng` which logs to `image-root.«architecture».log`.

That's a very narrow answer; there is more to the topic. How did Fedora build
ISOs in the past? Are there changes planned in the future?

Before release 24, in June 2016, Fedora used [livecd-tools] to build the ISOs.
Historically [kickstart files] were used to specify these release images. Fedora
24 was the [first release] to use `livemedia-creator` which is part of [Lorax].

In [November 2016](https://github.com/livecd-tools/livecd-tools/pull/37),
`livecd-tools` started to support Python 3 and switched from `yum` to `dnf`.
Today `livecd-tools` has unique features like persistent overlays. There remains
some [overlap] between `livecd-tools` and Lorax.

Around April 2024 — release 40 — Fedora [began] to build additional ISOs with
[Image Builder]. Image Builder is a Red Hat project with support for [OSTree].
Initially these builds were performed by a separate service, until a
[change](https://fedoraproject.org/wiki/Changes/KojiLocalImageBuilder) was made
for Fedora 43 to run Image Builder inside Koji. Image Builder includes
`composer-cli` and `osbuild-composer`; for an introduction see this [2021
article] in Fedora Magazine. Pungi is the [software] used to produce all of the
artifacts, including the ISOs, for each Fedora release. Fedora stores
configuration files for Pungi in [pungi-fedora]. According to [fedora.conf] in
that repository, today the only thing built with Image Builder is a raw image
for `aarch64`.

In April 2025 — Fedora 42 — a [PR] changed the build system for the ISOs to
KIWI. The [fedora-kiwi-descriptions] repository contains the configuration and a
[table] showing the different editions, types and profiles. KIWI [doesn't]
support OSTree.

From related Fedora Discussion threads
([1](https://discussion.fedoraproject.org/t/f40-change-proposal-build-fedora-cloud-edition-images-using-kiwi-in-koji-system-wide/100078),
[2](https://discussion.fedoraproject.org/t/f42-change-proposal-koji-uses-red-hat-image-builder-locally-system-wide/142031),
[3](https://discussion.fedoraproject.org/t/is-kiwi-used-for-fedora-42-official-image-builds/142373))
I gather that in the future Fedora may use Image Builder.

[kickstart files]: https://pagure.io/fedora-kickstarts
[livecd-tools]: https://github.com/livecd-tools/livecd-tools
[Lorax]: https://github.com/weldr/lorax
[overlap]: https://github.com/livecd-tools/livecd-tools/issues/111
[began]: https://fedoraproject.org/wiki/Changes/FedoraWorkstationImageBuilder
[Image Builder]: https://osbuild.org/
[built]: https://koji.fedoraproject.org/koji/packageinfo?packageID=22087
[documentation]: https://osinside.github.io/kiwi/
[GitHub]: https://github.com/OSInside/kiwi
[from openSUSE]: https://en.wikipedia.org/wiki/KIWI_(openSUSE)
[2021 article]: https://fedoramagazine.org/introduction-to-image-builder/
[software]: https://pagure.io/pungi
[table]: https://pagure.io/fedora-kiwi-descriptions/blob/rawhide/f/VARIANTS.md
[fedora.conf]: https://pagure.io/pungi-fedora/blob/main/f/fedora.conf
[pungi-fedora]: https://pagure.io/pungi-fedora
[OSTree]: https://en.wikipedia.org/wiki/OSTree
[doesn't]:
  https://discussion.fedoraproject.org/t/f42-change-proposal-koji-uses-red-hat-image-builder-locally-system-wide/142031/7
[fedora-kiwi-descriptions]: https://pagure.io/fedora-kiwi-descriptions/
[PR]: https://pagure.io/pungi-fedora/pull-request/1419
[some confusion]:
  https://www.reddit.com/r/Fedora/comments/1g5qt1g/confusing_image_release_ecosystem/
[YubiKey Guide]: https://github.com/drduh/YubiKey-Guide
[first release]: https://fedoraproject.org/wiki/Changes/LivemediaCreator
