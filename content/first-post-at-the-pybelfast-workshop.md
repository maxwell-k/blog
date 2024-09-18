---
title: First post at the PyBelfast workshop
date: 2024-09-18
category: Computers
---

I created this repository at a [local meetup]. In this post I am loosely
following the instructions set up by our host Kyle —
<https://apoclyps.github.io/pelican-by-example/>. One deviation from the
instructions is that I'm using [pipx]; most of the group is using Rye and my
neighbour is using Conda. Trying to help I suggested using pipx to install
Pelican. First you need to install pipx; the pipx install instructions for
Windows suggest using [Scoop](https://scoop.sh); to follow these that you need
to install Scoop… it is turtles all of the way down.

[pipx]: https://github.com/pypa/pipx
[local meetup]: https://www.meetup.com/pybelfast/events/302955055

<!--
<https://github.com/apoclyps/pelican-by-example/>
<https://scoop.sh/>
-->

_It is important to run the quick-start in a new directory._

Commands to create a new directory for today's workshop, set it as the current
working directory and set up an empty git repository:

    mkdir --parents ~/github.com/maxwell-k/2024-09-18-pybelfast-workshop \
    && cd ~/github.com/maxwell-k/2024-09-18-pybelfast-workshop \
    && git init \
    && git branch -m main

Command to run the quick-start:

    pipx run "--spec=pelican[markdown]" pelican-quickstart

Answers I chose:

> What is your time zone? [Europe/Rome] Europe/London

> Do you want to generate a tasks.py/Makefile to automate generation and
> publishing? (Y/n) n

I want to use YAML metadata; fortunately the plugin
[depends on](https://github.com/pelican-plugins/yaml-metadata/blob/main/pyproject.toml#L29)
everything I need.

Command to create a directory to address a warning and run the site locally:

    mkdir --parents content/images \
    && pipx run --spec=pelican-yaml-metadata pelican --autoreload --listen

Browse to <http://127.0.0.1:8000/>.

Commands to commit to git:

    echo '*.pyc' > .gitignore \
    && echo .en.utf-8.add.spl >> .gitignore \
    && echo /output/ >> .gitignore \
    && rm publishconf.py \
    && git add .

In settings, under Actions, under "Workflow permissions" change to "Read and
write permissions".

<!-- vim: set filetype=markdown.htmlCommentNoSpell : -->
