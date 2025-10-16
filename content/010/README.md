---
title: How do I use the Zig build system to install ncdu?
date: 2025-10-16
category: Computers
---

<!--
Copyright 2025 Keith Maxwell
SPDX-License-Identifier: CC-BY-SA-4.0
-->

[does not plan]: https://github.com/ziglang/www.ziglang.org/issues/290
[closed issue]: https://github.com/ziglang/www.ziglang.org/issues/243
[spec]: https://src.fedoraproject.org/rpms/ncdu/blob/rawhide/f/ncdu.spec
[coreutils]: https://www.gnu.org/software/coreutils/
[diskonaut]: https://github.com/imsnif/diskonaut
[dua-cli]: https://github.com/Byron/dua-cli
[ncdu]: https://code.blicky.net/yorhel/ncdu/
[Wikipedia page]: https://en.wikipedia.org/wiki/Ncdu
[18 years old]: https://dev.yorhel.nl/ncdu/changes
[few years ago]: https://dev.yorhel.nl/doc/ncdu2
[Zig website]: https://ziglang.org/learn/why_zig_rust_d_cpp/
[first]: https://packages.fedoraproject.org/pkgs/ncdu/ncdu/
[Ghostty]: https://ghostty.org/
[Zig]: https://ziglang.org/
[Uber using]:
  https://www.uber.com/en-GB/blog/bootstrapping-ubers-infrastructure-on-arm64-with-zig/

I have an old Linux system that I intend to backup and then update. Before
performing a manual backup I like to understand disk usage. I have used a few
different tools for this task:

| Project     | Language | Notes                                   |
| ----------- | -------- | --------------------------------------- |
| [coreutils] | C        | Widely available!                       |
| [diskonaut] | Go       | No release in 5 years, no commits in 3. |
| [dua-cli]   | Rust     |                                         |
| [ncdu]      | C / Zig  | [Wikipedia page]                        |

This year ncdu is [18 years old]. A [few years ago] I read about a rewrite. I
was a fan of the original version. Version 2 of ncdu is implemented in [Zig].
The only Zig software that I regularly use today is [Ghostty]; and I use Ghostty
on both Mac and Linux.

I'm interested in Zig the language and Zig the build system. For example I found
the case study of [Uber using] the Zig tool chain for cross compilation
interesting. The [Zig website] states:

> Not only can you write Zig code instead of C or C++ code, but you can use Zig
> as a replacement for autotools, cmake, make, scons, ninja, etc.

Much more than the alternatives mentioned, I'm interested in learning more about
the Zig build system and this post is a chance to try it out. Below I use a
Fedora Linux 42 container to build the latest release of ncdu from source. I
chose Fedora Linux 42, released on 15 April 2025, because it is the [first]
version to package the Zig ncdu implementation, so system-level dependencies
should be straight forward.

### Launch a container and install system-level dependencies

Command to launch a container:

    incus launch images:fedora/42/cloud c1

Command to install the required system-level dependencies:

    incus exec c1 -- dnf install \
      libzstd-devel \
      ncurses-devel \
      minisign \
      git-core \
      wcurl \
      make \
      gcc

### Download the latest ncdu and Zig releases

Command to download Zig 0.15.1 and a signature:

    incus exec c1 -- wcurl \
      https://ziglang.org/download/0.15.1/zig-x86_64-linux-0.15.1.tar.xz \
      https://ziglang.org/download/0.15.1/zig-x86_64-linux-0.15.1.tar.xz.minisig

Command to verify the download with `minisign` against the public key from the
[Zig download page]:

    incus exec c1 -- minisign \
        -V \
        -m zig-x86_64-linux-0.15.1.tar.xz \
        -P RWSGOq2NVecA2UPNdBUZykf1CCb147pkmdtYxgb3Ti+JO/wCYvhbAb/U

[Zig download page]: https://ziglang.org/download/

Expected output:

    Signature and comment signature verified
    Trusted comment: timestamp:1755707121   file:zig-x86_64-linux-0.15.1.tar.xz     hashed

Command to extract the Zig compiler:

    incus exec c1 -- tar xf zig-x86_64-linux-0.15.1.tar.xz

Command to clone the source code for the latest release of ncdu:

    incus exec c1 -- git clone --config advice.detachedHead=false \
      https://code.blicky.net/yorhel/ncdu.git --branch v2.9.1

It is safe to ignore the warning below, this is displayed because `v2.9.1` is an
annotated git tag:

    warning: refs/tags/v2.9.1 79a0f4f623adfef4488593c3bbfda21e74f34f5c is not a commit!

### Build and install

Command to run the build:

    incus exec c1 -- sh -c 'PATH="/root/zig-x86_64-linux-0.15.1/:$PATH" make -C ncdu'

Command to install the resulting binary on the host system:

    incus file pull c1/root/ncdu/zig-out/bin/ncdu ~/.local/bin

### Clean up

Command to stop and delete the container:

    incus stop c1 && incus delete c1

### Why install GCC above?

I install GCC to avoid an [issue](https://github.com/ziglang/zig/issues/23849)
relating to the linker script installed as `/usr/lib64/libncursesw.so`. Although
the issue is closed; I cannot confirm it is resolved because I ran into other
issues building ncdu with a Zig nightly version. Unfortunately system-level
dependencies weren't as straightforward as I expected.

<details markdown=1>

<summary>Detailed error message without GCC installed</summary>

Output from make:

    make: Entering directory '/root/ncdu'
    zig build --release=fast -Dstrip
    install
    └─ install ncdu
       └─ compile exe ncdu ReleaseFast native 1 errors
    error: ld.lld: unable to find library -ltinfo
    error: the following command failed with 1 compilation errors:
    /root/zig-x86_64-linux-0.15.1/zig build-exe -D_DEFAULT_SOURCE -D_XOPEN_SOURCE=600 -lncursesw -ltinfo -lzstd -fstrip -OReleaseFast -Mroot=/root/ncdu/src/main.zig -lc --cache-dir .zig-cache --global-cache-dir /root/.cache/zig --name ncdu --zig-lib-dir /root/zig-x86_64-linux-0.15.1/lib/ --listen=-

    Build Summary: 0/3 steps succeeded; 1 failed
    install transitive failure
    └─ install ncdu transitive failure
       └─ compile exe ncdu ReleaseFast native 1 errors

    error: the following build command failed with exit code 1:
    .zig-cache/o/7ade27cbf6b5118e3c7fe0ce076f4a3f/build /root/zig-x86_64-linux-0.15.1/zig /root/zig-x86_64-linux-0.15.1/lib /root/ncdu .zig-cache /root/.cache/zig --seed 0x1af56ad3 -Z2b12229399a4fdd0 --release=fast -Dstrip
    make: *** [Makefile:20: release] Error 1
    make: Leaving directory '/root/ncdu

Contents of `/usr/lib64/libncursesw.so` as described in the issue report:

    INPUT(libncursesw.so.6 -ltinfo)

</details>

### Commentary

At first I ignored the Makefile; but I ran into an
`error: failed to parse shared library: UnexpectedEndOfFile` because I was
trying to produce a debug build. Now, I am happy with the approach above.

Installing `minisign` is perhaps extra complexity. The project [does not plan]
to provide "SHA" hashes; though these are published in
<https://ziglang.org/download/index.json>. The instructions above to verify a
download are taken from a [closed issue].

It was unfortunate to run into the issue around `-ltinfo`. I am slightly more
positive after this experience with the build system. Zig is an attractive
systems programming language and tool chain.
