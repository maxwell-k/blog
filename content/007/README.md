---
title: How I double check writing a disk image
date: 2025-07-06
---

While I know [USB flash drives] are [unreliable], I still use them as
installation media. Depending on the circumstances I use different software to
write a disk image to a physical drive. Even if the software includes a check on
the written data, I remove the drive from the system and later double check.

I use a separate two step process to double check that data read from the drive
matches the disk image:

1. Count the number of bytes in the image
2. Read that number of bytes from the drive and generate a checksum

The two step process is necessary because the image file and physical drive are
practically never the same size. It is straightforward to use `stat`, `head` and
`sha256sum` from [GNU coreutils](https://www.gnu.org/software/coreutils/) to
implement this process.

This example uses `~/Downloads/Fedora-Workstation-Live-43-1.6.x86_64.iso` as
left behind after creating a bootable Fedora Workstation 43 USB.

Command to display the size of the ISO in bytes:

    stat --format=%s ~/Downloads/Fedora-Workstation-Live-43-1.6.x86_64.iso

Output:

    2742190080

Command to read 2,742,190,080 bytes from the drive and then generate checksums
for that data and the image file:

    sudo head --bytes=2742190080 /dev/sda \
    | sha256sum - ~/Downloads/Fedora-Workstation-Live-43-1.6.x86_64.iso

Output:

    2a4a16c009244eb5ab2198700eb04103793b62407e8596f30a3e0cc8ac294d77  -
    2a4a16c009244eb5ab2198700eb04103793b62407e8596f30a3e0cc8ac294d77  /home/maxwell-k/Downloads/Fedora-Workstation-Live-43-1.6.x86_64.iso

This matches the values in the corresponding [checksum file]:

    # Fedora-Workstation-Live-43-1.6.x86_64.iso: 2742190080 bytes
    SHA256 (Fedora-Workstation-Live-43-1.6.x86_64.iso) = 2a4a16c009244eb5ab2198700eb04103793b62407e8596f30a3e0cc8ac294d77

[checksum file]: https://download.fedoraproject.org/pub/fedora/linux/releases/43/Workstation/x86_64/iso/Fedora-Workstation-43-1.6-x86_64-CHECKSUM
[unreliable]: https://www.theregister.com/2024/02/07/failed_usb_sticks/
[USB flash drives]: https://en.wikipedia.org/wiki/USB_flash_drive

_This page has been updated since initial publication to use more recent Fedora
Linux images._

<!--
Copyright 2025 Keith Maxwell
SPDX-License-Identifier: CC-BY-SA-4.0
-->
