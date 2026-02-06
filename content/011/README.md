---
title: Splitting up a .apk file
date: 2025-11-14
---

<!--
Copyright 2025 Keith Maxwell
SPDX-License-Identifier: CC-BY-SA-4.0
-->

[apk-tools]: https://gitlab.alpinelinux.org/alpine/apk-tools
[apk spec]: https://wiki.alpinelinux.org/wiki/Apk_spec
[‘APK, the strangest format’]: https://www.hydrogen18.com/blog/apk-the-strangest-format.html
[part of abuild]: https://gitlab.alpinelinux.org/alpine/abuild/-/blob/3.15.0/abuild.in?ref_type=tags#L1894
[line 42]: https://gitlab.alpinelinux.org/alpine/abuild/-/blob/3.15.0/abuild-sign.in#L42
[functions.sh]: https://gitlab.alpinelinux.org/alpine/abuild/-/blob/master/functions.sh.in#L254
[RFC1952]: https://datatracker.ietf.org/doc/html/rfc1952
[blog post]: https://words.filippo.io/frood/
[uses]: https://chimera-linux.org/docs/history
[Chimera Linux]: https://chimera-linux.org/
[testing]: https://fosstodon.org/@ncopa/114778452278033501
[overall]: https://chimera-linux.org/about/
[abuild-tar.c]: https://gitlab.alpinelinux.org/alpine/abuild/-/blob/master/abuild-tar.c
[tar format]: https://en.wikipedia.org/wiki/Tar_(computing)
[Wikipedia]: https://en.wikipedia.org/wiki/Gzip
[used by Android]: https://en.wikipedia.org/wiki/Apk_(file_format)
[Alpine Linux]: https://alpinelinux.org/
[abuild]: https://gitlab.alpinelinux.org/alpine/abuild
[prefixed]: https://gitlab.alpinelinux.org/alpine/apk-tools/-/blob/v2.14.9/src/blob.c#L364

This post starts with an explanation of the .apk file format from Alpine Linux.
After that I demonstrate how the explanation matches an example file and I calculate
checksums to match the package repository index. This .apk format is not the
file format [used by Android]. Alpine Package Keeper is the name of the package
manager for [Alpine Linux], typically abbreviated `apk`.

Why? Because after reading (1) the [apk spec] and (2) a
blog post titled [‘APK, the strangest format’], I was left with
questions. For example:

> Does a .apk file have two gzip streams or three?

A .apk file contains three deflate compressed gzip streams. Each gzip stream
contains data in [tar format]. In order:

| Stream | Contents                    | End of file marker | Demonstration file name |
| ------ | --------------------------- | ------------------ | ----------------------- |
| 1      | Signature for stream 2      | No                 | 1.tar.gz                |
| 2      | Metadata including .PKGINFO | No                 | control.tar.gz          |
| 3      | Files to be installed       | Yes                | data.tar.gz             |

To prepare that summary table I looked into the process for creating a .apk with
[abuild], Alpine Linux's build tool. The abuild repository includes abuild-sign.

To create a .apk file:

1. abuild creates data.tar.gz; this gzip stream is stream 3
1. 〃 creates a tar file containing metadata
1. 〃 calls abuild-tar --cut to remove the end of file marker
1. 〃 calls gzip on the result; this gzip stream is stream 2
1. 〃 calls abuild-sign on stream 2
1. abuild-sign creates a signature for stream 2 using a private key
1. 〃 adds that signature to another tar file
1. 〃 removes the end of file marker
1. 〃 compresses the result with gzip; this gzip stream is stream 1
1. 〃 prepends stream 1 to stream 2
1. abuild prepends the result, streams 1 and 2, to stream 3

The result is a .apk file made up of the three streams in order!

The most relevant [part of abuild] is from line 1894 onwards showing how stream
2 is created, abuild-sign is called and then streams 1 and 2 are prepended to
stream 3:

```
apk_tar -T - < .metafiles | abuild-tar --cut \
            | $gzip -n -9 > control.tar.gz
abuild-sign -q control.tar.gz || exit 1

msg "Create $apk"
mkdir -p "$REPODEST/$repo/$(arch2dir "$subpkgarch")"
cat control.tar.gz data.tar.gz > "$REPODEST/$repo/$(arch2dir "$subpkgarch")/$apk"
```

The most relevant part of abuild-sign is from [line 42] showing how stream 1
is created and prepended to stream 2:

```
apk_tar --owner=0 --group=0 --numeric-owner "$sig" | abuild-tar --cut | $gzip -n -9 > "$tmptargz"
tmpsigned=$(mktemp)
cat "$tmptargz" "$i" > "$tmpsigned"
```

The other relevant source code that I looked into was `apk_tar` in [functions.sh] and
[abuild-tar.c].

## Treating a .apk as a .tar.gz

The tar format was originally developed for archiving files to magnetic
tape storage. The end of an archive is marked with zeroes as an end of file
marker. These markers were necessary because the tapes did not use a file system
or other metadata. The end of a tar file on a disk is implied from other
metadata. The [apk spec] terms tar archives without end of file markers ‘tar
segments’.

[Wikipedia] explains that a gzip stream can only compress a single file. If
three streams are concatenated and then decompressed the output is a single
file.

In constructing .apk files the end of file markers are removed from the streams
1 and 2. Stream 3 has an end of file marker. If the three streams in a `.apk`
file are decompressed together the result is a tar file with a single end of
file marker. Files can therefore be extracted from a `.apk` file as if it were a
single `.tar.gz` file.

## Examining an example file

The gzip format is specified in [RFC1952]. ‘Section 2.3.1. Member header and
trailer’ shows that each stream should start with three bytes:

1. 31 for ID1
2. 139 for ID2
3. 8 for the deflate Compression Method (CM)

Searching for these three bytes inside an example .apk file will help confirm
the explanation above. This example uses the apk-tools-static package from the
3.22 release of Alpine Linux; latest-stable at the time of writing.

<details>
<summary><code>fetch_url.py</code></summary>

<!-- embedme fetch_url.py -->

```python
"""Fetch information about a package from APKINDEX."""

import gzip
import tarfile
from binascii import a2b_base64, hexlify
from io import BytesIO
from sys import argv
from urllib.request import urlopen

REPOSITORY = "https://dl-cdn.alpinelinux.org/alpine/v3.22/main"
ARCHITECTURE = "x86_64"

_FIELD = "C:"
_SHA1 = "Q1"
_APKINDEX_URL = f"{REPOSITORY}/{ARCHITECTURE}/APKINDEX.tar.gz"


def _main() -> int:
    if len(argv) == 2:
        package = argv[1]
    else:
        package = "apk-tools-static"
    block = _get_block(_apkindex(), package)
    line = _get_line(block, _FIELD)
    print(_get_url(block, package))
    print(line)
    base64 = line.removeprefix(_FIELD + _SHA1)
    print(hexlify(a2b_base64(base64)).decode())
    return 0


def _get_line(block: str, prefix: str) -> str:
    return [i for i in block.splitlines() if i.startswith(prefix)][0]


def _get_field(block, prefix: str) -> str:
    return _get_line(block, prefix).removeprefix(prefix)


def _get_url(block: str, package: str) -> str:
    version = _get_field(block, "V:")
    return f"{REPOSITORY}/{ARCHITECTURE}/{package}-{version}.apk"


def _get_block(apkindex: str, package: str) -> str:
    blocks = _apkindex().strip().split("\n\n")
    return next(filter(lambda i: _get_field(i, "P:") == package, blocks))


def _apkindex() -> str:
    with urlopen(_APKINDEX_URL) as response:
        compressed_data = response.read()

    compressed_stream = BytesIO(compressed_data)

    with gzip.open(compressed_stream, "rb") as gz, tarfile.open(fileobj=gz) as tar:
        fileobj = tar.extractfile("APKINDEX")
        if fileobj is None:
            return ""
        with fileobj as file:
            content = file.read()
    return content.decode()


if __name__ == "__main__":
    raise SystemExit(_main())
```

</details>

Command do display a URL for an example file; with a checksum from the
`APKINDEX` displayed twice; the second time as hexadecimal:

    python fetch_url.py

Output:

    https://dl-cdn.alpinelinux.org/alpine/v3.22/main/x86_64/apk-tools-static-2.14.9-r3.apk
    C:Q1a98grx1S3fI18wuhEHZPelGxtPo=
    6bdf20af1d52ddf235f30ba110764f7a51b1b4fa

Command to download the example .apk file:

    wcurl \
      https://dl-cdn.alpinelinux.org/alpine/v3.22/main/x86_64/apk-tools-static-2.14.9-r3.apk

<details>
<summary><code>hash.py</code></summary>

<!-- embedme hash.py -->

```python
"""Calculate a checksum line to match APKINDEX from a .apk file."""

from base64 import b64encode
from hashlib import sha1
from pathlib import Path
from sys import argv

HEADER = bytes([31, 139, 8])
PREFIX = "C:Q1"


def _main() -> int:
    if len(argv) != 2:
        print("No filename provided.")
        return 1

    file = Path(argv[1])
    with file.open("rb") as file:
        data = file.read()

    control_start = data.find(HEADER, len(HEADER))
    data_start = data.rfind(HEADER)

    checksum = sha1()
    checksum.update(data[control_start:data_start])
    print(PREFIX + b64encode(checksum.digest()).decode())
    return 0


# ruff: noqa: S324 Alpine Linux uses SHA1 in APKINDEX


if __name__ == "__main__":
    raise SystemExit(_main())
```

</details>

Command to generate a checksum line from the downloaded file:

    python hash.py apk-tools-static-2.14.9-r3.apk

Output:

    C:Q1a98grx1S3fI18wuhEHZPelGxtPo=

<details>
<summary><code>split.py</code></summary>

<!-- embedme split.py -->

```python
"""Split up a .apk file."""

from pathlib import Path
from sys import argv

HEADER = bytes([31, 139, 8])


def _main() -> int:
    if len(argv) != 2:
        print("No filename provided.")
        return 1

    file = Path(argv[1])
    with file.open("rb") as file:
        data = file.read()

    control_start = data.find(HEADER, len(HEADER))
    data_start = data.rfind(HEADER)

    Path("1.tar.gz").write_bytes(data[:control_start])
    Path("control.tar.gz").write_bytes(data[control_start:data_start])
    Path("data.tar.gz").write_bytes(data[data_start:])

    return 0


# ruff: noqa: S324 Alpine Linux uses SHA1


if __name__ == "__main__":
    raise SystemExit(_main())
```

</details>

Command to split up an apk file into three:

    python split.py apk-tools-static-2.14.9-r3.apk

Shell session showing the contents of the three files:

    % tar tf 1.tar.gz
    .SIGN.RSA.alpine-devel@lists.alpinelinux.org-6165ee59.rsa.pub

    % tar tf control.tar.gz
    .PKGINFO

    % tar --warning=no-unknown-keyword -tf data.tar.gz
    sbin/
    sbin/apk.static
    sbin/apk.static.SIGN.RSA.alpine-devel@lists.alpinelinux.org-6165ee59.rsa.pub
    sbin/apk.static.SIGN.RSA.sha256.alpine-devel@lists.alpinelinux.org-6165ee59.rsa.pub

    % sha1sum control.tar.gz
    6bdf20af1d52ddf235f30ba110764f7a51b1b4fa  control.tar.gz

This above is the hexadecimal encoding of the same checksum that is encoded with
base64 and [prefixed] with `C:Q1` in the `APKINDEX`. This matches the output from
`./fetch_url.py` above.

Shell session to demonstrate the datahash field from .PKGINFO in control.tar.gz:

    % tar xf control.tar.gz .PKGINFO

    % tail -n 1 .PKGINFO
    datahash = 0845a99f49833a760e8f1745417fc1bba0c4740a40ec10288537e3acd9f045a9

    % sha256sum data.tar.gz
    0845a99f49833a760e8f1745417fc1bba0c4740a40ec10288537e3acd9f045a9  data.tar.gz

## Why are you writing about the .apk file format?

Because for the first time in ages I'm enthusiastic about Alpine Linux.

The first Linux distribution I ever used was Slackware. Then for a long time
Gentoo. Back in 2017–2020 I was full of enthusiasm for Alpine Linux. Alpine
Linux was originally based on Gentoo. I was a fan; even a contributor. After
that I drifted away; I only use Alpine Linux occasionally and my contributions
stopped.

I recently read a [blog post] by Filippo Valsorda, who maintains the Go
cryptography standard library. Filippo writes about running a Linux based
Network Attached Storage device from RAM; a topic I hope to revisit. He
described Alpine Linux as:

> a simple, well-packaged, lightweight, GNU-less Linux distribution

I also recently read about Chimera Linux which has a FreeBSD user land and build recipes
written in Python. It tries to innovate and [overall]:

> \[Chimera Linux\] wants to be simple and grokkable, but also practical and unassuming.

Why am I talking about Chimera Linux? Because it also [uses] apk-tools from
Alpine Linux. Version 3 of apk-tools is in the final stages of [testing] before
a stable release as of July 2025. I am in the middle of setting up my own
hardware running Alpine Linux for the first time in at least five years and I
hope to post on the topic again soon.
