---
title: How I build jbig2enc from source
date: 2026-05-25T00:00:00.000Z
---

This post was inspired by a [recording] of Andrew Kelley speaking at GOTO 2023.
Andrew is the creator of the Zig programming language. The inspiration I found
in his talk has nothing to do with Zig.

<!-- uv tool run youtube_transcript_api --format text wFlyUzUVFhw | vim - -->

His talk focuses on ‘How to Build Software From Source’. I've built software
from source in the past. My first memory of Linux was installing Slackware
from floppy disks in the late 1990s. My second memory is working through [Linux
from Scratch]. Later in the 2000s and 2010s I used Gentoo Linux. That's a lot of
building software from source.

More recently I've spent time packaging software. Both proprietary and open
source software. I've been a release manager, implemented continuous
integration, adopted reproducible builds. I've learnt a lot about Python
packaging and enough about building C and C++ extensions. I've created packages
for Linux distributions; mostly Gentoo, Alpine and some Fedora. I spent a lot of
time on the steps that come between building and using software.

This talk inspired me to think differently. To consider building the software
and then using the software almost immediately. The step or steps in between
don't need to be complicated. In the example in this post the only step in
between is to copy the executable onto PATH. Different contexts require
different levels of sophistication.

The rest of this post is a set of instructions for building version 0.32 of
[jbig2enc]. These steps are loosely based on the relevant Alpine Linux
[APKBUILD]. The posts uses an Incus container so that the steps are repeatable.

First start with a configuration file — `config.yaml` — that tells [CloudInit]
how to configure that container. The vendor data YAML inside the CloudInit YAML
specifies the build time dependencies.

<!-- embedme config.yaml -->

```yaml
description: Incus profile for building jbig2enc using images:fedora/43/cloud
config:
  user.vendor-data: |
    #cloud-config
    package_update: true
    package_upgrade: true
    packages: [git, automake, libtool, leptonica-devel, gcc-c++]
```

Command to start a suitable container:

    incus launch images:fedora/43/cloud c1 < config.yaml \
    && incus exec c1 -- cloud-init status --wait

Commands to clone the repository and build the `jbig2enc` software inside the
container:

    incus exec c1 -- su - fedora --command "git config set --global advice.detachedHead false \
        && git clone --revision 0.32 https://github.com/agl/jbig2enc.git \
        && cd jbig2enc \
        && ./autogen.sh \
        && ./configure --prefix=/home/fedora/.local \
        && make \
        && make install"

That command, above, results in two executables in `~/.local/bin`:

1. the compiled `jbig2` executable and
2. a Python script `jbig2topdf.py`.

<details markdown=1>

<summary>Reviewing build output</summary>

```
warning: refs/tags/0.32 23e5e92f11cfcf28f0a519b1cf85fc0f3bee3b51 is not a commit!
```

It is safe to ignore the above warning because 0.32 is an annotated tag.
Ordinarily I would use `0.32^{}` to peel the reference but neither `--branch` or
`--revision` accept that argument.

```
  /bin/sh ../libtool   --mode=install /usr/bin/install -c jbig2 '/home/fedora/.local/bin'
…
/usr/bin/install -c jbig2topdf.py '/home/fedora/.local/bin'
```

The above two lines output by the `make install` command show the build copying
the two files required files into `~/.local/bin`.

</details>

Commands to install the two binaries on the local system:

    incus file pull c1/home/fedora/.local/bin/jbig2 ~/.local/bin \
    && incus file pull c1/home/fedora/.local/bin/jbig2topdf.py ~/.local/bin \
    && hash -r

To check that the compiled executable is portable to this system; check for "not
found" in the output of `ldd ~/.local/bin/jbig2`.

[package]: https://pkgs.alpinelinux.org/contents?name=jbig2enc&repo=community&branch=edge&arch=x86_64
[recording]: https://www.youtube.com/watch?v=wFlyUzUVFhw
[Linux from Scratch]: https://www.linuxfromscratch.org/
[jbig2enc]: https://github.com/agl/jbig2enc
[APKBUILD]: https://gitlab.alpinelinux.org/alpine/aports/-/blob/master/community/jbig2enc/APKBUILD
[CloudInit]: https://cloudinit.readthedocs.io/en/latest/index.html

_Updated 2025-06-22: update to release 0.32._

<!--
Copyright 2026 Keith Maxwell
SPDX-License-Identifier: CC-BY-SA-4.0
-->
<!-- vim: set filetype=markdown.dprint.htmlCommentNoSpell : -->
