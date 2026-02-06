---
title: How to install Times New Roman in 2026
date: 2026-02-09
---

<!--
Copyright 2025 Keith Maxwell
SPDX-License-Identifier: CC-BY-SA-4.0
-->

[CSS]: https://en.wikipedia.org/wiki/CSS
[published]: https://en.wikipedia.org/wiki/Core_fonts_for_the_Web
[EULA]: https://en.wikipedia.org/wiki/End-user_license_agreement
[msttcorefonts]: https://salsa.debian.org/debian/msttcorefonts
[PageSpeed Insights]: https://pagespeed.web.dev/
[Times New Roman]: https://en.wikipedia.org/wiki/Times_New_Roman
[default]: https://granneman.com/webdev/coding/css/fonts-and-formatting/web-browser-font-defaults
[SourceForge]: https://corefonts.sourceforge.net/
[fontconfig]: https://www.freedesktop.org/wiki/Software/fontconfig/
[Liberation fonts]: https://en.wikipedia.org/wiki/Liberation_fonts
[Arial]: https://en.wikipedia.org/wiki/Arial
[Webdings]: https://en.wikipedia.org/wiki/Webdings
[Courier New]: https://en.wikipedia.org/wiki/Courier_(typeface)#Courier_New

This post feels like a throw back to the late 1990s. I'm publishing it because
the only straightforward instructions that I can find are for Debian / Ubuntu.

I wanted to check the appearance of this blog while working on the [CSS]. I was
looking at layout-shifts and the [PageSpeed Insights] score and I wanted to
check the appearance with a standard, default font. Google Chrome on this
version of Fedora Linux depends on the [Liberation fonts]. I understand that
[Times New Roman] is both very common and the [default] serif font for most
browsers. So I wanted to check the appearance of this blog with Times New Roman.

In the late 1990s, Times New Roman along with [Arial], [Courier New], [Webdings] (!)
and other fonts, were [published] under a license on <https://micrososoft.com>.
The license permits redistributing the fonts in their original form, so the
original `.exe` files are now mirrored on [SourceForge]. Debian publishes a
package, [msttcorefonts], to install the fonts from these `.exe` files as `.ttf` files
to the local file system. The rest of this post demonstrates obtaining the
`.ttf` files this way using an Incus container; the same approach works for
Arial and the other fonts.

Commands to create an Incus container, prompt to accept the EULA, install the
Microsoft fonts, copy them to the host and then clean up the container:

    incus launch images:debian/13 c1 \
    && incus exec c1 -- sh -c "apt update && apt install --yes msttcorefonts" \
    && incus file pull --recursive c1/usr/share/fonts/truetype/msttcorefonts . \
    && incus stop c1 \
    && incus delete c1

Command to install Times New Roman for the current user:

    mkdir --parents ~/.local/share/fonts \
    && cp msttcorefonts/Times_New_Roman.ttf ~/.local/share/fonts

<details markdown=1>

<summary>Check that fontconfig can find Times New Roman</summary>

Command to list the fonts available to [fontconfig] filtered for Times New
Roman:

    fc-list | grep -e Times.New.Roman

Expected output:

```
/home/maxwell-k/.local/share/fonts/Times_New_Roman.ttf: Times New Roman:style=Regular,Normal,obyčejné,Standard,Κανονικά,Normaali,Normál,Normale,Standaard,Normalny,Обычный,Normálne,Navadno,thường,Arrunta
```

</details>
