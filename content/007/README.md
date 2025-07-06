---
title: How I double check writing a disk image
date: 2025-07-06
category: Computers
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

This example uses `~/Downloads/Fedora-Workstation-Live-42-1.1.x86_64.iso` as
left behind after creating a bootable Fedora 42 Workstation USB with Fedora
Media Writer.

Command to display the size of the ISO in bytes:

    stat --format=%s ~/Downloads/Fedora-Workstation-Live-42-1.1.x86_64.iso

Output:

    2398523392

Command to read 2,398,523,392 bytes from the drive and generate checksums:

    sudo head --bytes=2398523392 /dev/sda \
    | sha256sum - ~/Downloads/Fedora-Workstation-Live-42-1.1.x86_64.iso

Output:

    98958d80e8a80eabe61275337f969c8e2212adc3a223d9bbdab9411bb1c95cba  -
    98958d80e8a80eabe61275337f969c8e2212adc3a223d9bbdab9411bb1c95cba  /home/maxwell-k/Downloads/Fedora-Workstation-Live-42-1.1.x86_64.iso

This matches the values in the corresponding [checksum file]:

    # Fedora-Workstation-Live-42-1.1.x86_64.iso: 2398523392 bytes
    SHA256 (Fedora-Workstation-Live-42-1.1.x86_64.iso) = 98958d80e8a80eabe61275337f969c8e2212adc3a223d9bbdab9411bb1c95cba

[checksum file]:
  https://download.fedoraproject.org/pub/fedora/linux/releases/42/Workstation/x86_64/iso/Fedora-Workstation-42-1.1-x86_64-CHECKSUM
[unreliable]: https://www.theregister.com/2024/02/07/failed_usb_sticks/
[USB flash drives]: https://en.wikipedia.org/wiki/USB_flash_drive

<!--
Copyright 2025 Keith Maxwell
SPDX-License-Identifier: CC-BY-SA-4.0
-->
