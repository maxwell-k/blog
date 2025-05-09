---
title: First post at the PyBelfast workshop
date: 2024-09-18
category: Computers
---

I created this repository at a [local meetup]. In this post I am loosely following
the [instructions] provided by our host Kyle. I did a few things differently and
I try to document my rationale here.
<!--
Copyright 2024 Keith Maxwell
SPDX-License-Identifier: CC-BY-SA-4.0
-->

[instructions]: https://apoclyps.github.io/pelican-by-example/

### Use a new directory

For what its worth; I think that it is important to work in a new directory; to
treat this workshop as a separate project.

Commands to create a new directory for today's workshop, set it as the current
working directory and set up an empty git repository:

    mkdir --parents ~/github.com/maxwell-k/2024-09-18-pybelfast-workshop \
    && cd ~/github.com/maxwell-k/2024-09-18-pybelfast-workshop \
    && git init \
    && git branch -m main

### Use ‘uv tool run’

In my experience running entry-level Python workshops, initial setup is always
time consuming. Especially installing an appropriate version of Python, possibly
setting up a virtual environment and obtaining the correct libraries. Being able
to help attendees who may be using Windows, Mac or Linux is challenging. This is
both one of the hardest parts of a session and one of the first!

I tried to side step some of the issues here by using [uv]. Most of the group
used Rye and my neighbour was unsure. Trying to help I suggested using pipx to
install Pelican. I had started out using [pipx]. However first you need to
install pipx; the pipx install instructions for Windows suggest using
[Scoop](https://scoop.sh); that means you need the installation instructions for
Scoop… it was turtles all of the way down. The neighbour was confident with
Conda so I left them to it.

In the end I preferred `uv tool run` over `pipx` for a couple of reasons:

1. The uv installation instructions for Windows only use PowerShell and Scoop
   isn't necessary.

2. `uv tool run` supports specifying additional packages using `--with`; which
   will be relevant in the next section.

[pipx]: https://github.com/pypa/pipx
[uv]: https://github.com/astral-sh/uv
[local meetup]: https://www.meetup.com/pybelfast/events/302955055

<!--
<https://github.com/apoclyps/pelican-by-example/>
<https://scoop.sh/>
-->

Command to run the quick-start:

    uv tool run "--from=pelican[markdown]" pelican-quickstart

Many of the default answers where fine; a couple I defined are:

> What is your time zone? [Europe/Rome] Europe/London

> Do you want to generate a tasks.py/Makefile to automate generation and
> publishing? (Y/n) n

### Use YAML metadata

I want to use YAML metadata because it is well supported by [my
editor configuration]. It is also supported by the [yaml-metadata plugin]. At the
minute it is possible to just use a `pipx run --spec=pelican-yaml-metadata pelican`
command because the plugin [depends on] everything necessary. However I prefer
the more transparent approach below.

Command to create a directory to address a warning and run the site locally:

    uv tool run --with-requirements=requirements.txt pelican --autoreload --listen

Then browse to <http://127.0.0.1:8000/>.

[yaml-metadata plugin]: https://github.com/pelican-plugins/yaml-metadata
[my editor configuration]: https://codeberg.org/maxwell-k/vimfiles
[depends on]:
  https://github.com/pelican-plugins/yaml-metadata/blob/main/pyproject.toml#L29

The command above may output a warning:

> `[23:12:13] WARNING  Unable to watch path '/home/maxwell-k/github.com/maxwell-k/2024-09-18-pybelfast-workshop/content/images' as it does not exist.                                                    utils.py:843`

Commands to address the warning:

    mkdir --parents content/images \
    && touch content/images/.keep

### Use the official GitHub actions workflow

I adopted the [official] workflow —
<https://github.com/getpelican/pelican/blob/main/.github/workflows/github_pages.yml>.
A helpful feature of this workflow is that `SITEURL` will "default to the URL of
your GitHub Pages site, which is correct in most cases." Using this official
workflow also allows me to remove `publishconf.py`.

Initially this workflow produced the following error:

> `Branch "main" is not allowed to deploy to github-pages due to environment protection rules.`

To resolve this I configured permissions: go to ‘Settings’, then ‘Environments’,
then ‘github-pages‛ and make sure ‘main‛ can deploy to this environment.

<!--
Commands to commit to git:

    echo '*.pyc' > .gitignore \
    && echo .en.utf-8.add.spl >> .gitignore \
    && echo /output/ >> .gitignore \
    && rm publishconf.py \
    && git add .
-->

Allowing manually running the workflow by adding `workflow_dispatch:` is helpful
for testing the repository settings.

[official]:
  https://docs.getpelican.com/en/latest/tips.html#publishing-to-github-pages-using-a-custom-github-actions-workflow

<!-- vim: set filetype=markdown.htmlCommentNoSpell : -->
