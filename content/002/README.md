---
title: How I install soft-serve on Debian
date: 2024-09-29T00:00:00.000Z
---

<!--
Copyright 2024 Keith Maxwell
SPDX-License-Identifier: CC-BY-SA-4.0
-->

This is a simple deployment of [soft-serve] on Debian 12 Bookworm using [Incus].
Eventually I will install this service onto hardware running Debian directly. At
this stage Incus is a great way to experiment in disposable system containers.

In case you aren't already aware system containers, as implemented by [LXD] and
Incus, simulate a full operating system. This is in contrast to the single
process typically packaged in a Docker, Podman or Kubernetes container. Here I'm
going to configure and test a systemd service so Incus is a good fit.

One extra piece of complexity is that I use [Cog] and Python to get up to date
public SSH keys from GitHub.

Pre-requisites: curl, GPG, Incus and the Incus / `systemd-resolved`
[integration].

[LXD]: https://canonical.com/lxd
[Incus]: https://linuxcontainers.org/incus/
[integration]: https://linuxcontainers.org/incus/docs/main/howto/network_bridge_resolved/

### Process

Command to download the GPG key and remove the base 64 encoding:

    curl -s https://repo.charm.sh/apt/gpg.key \
    | gpg --dearmor -o charm.gpg

Save the following text as `./charm.sources`:

    Types: deb
    URIs: http://repo.charm.sh/apt/
    Suites: *
    Components: *
    Signed-By: /etc/apt/keyrings/charm.gpg

Save the following as `soft-serve.conf`:

    # Based upon https://github.com/charmbracelet/soft-serve/blob/main/.nfpm/soft-serve.conf
    # vim: set ft=conf.cog :
    #
    # [[[cog
    # import urllib.request
    # f = urllib.request.urlopen("https://github.com/maxwell-k.keys")
    # cog.outl(f"SOFT_SERVE_INITIAL_ADMIN_KEYS='{f.read().decode().strip()}'")
    # ]]]
    SOFT_SERVE_INITIAL_ADMIN_KEYS='ssh-rsa AAAAB3NzaC1yc2EAAAADAQABAAABAQC2ey56D7MlKkZXZZPu6vY1Y/f5KM8vQ8gghiWCbQlUkLlJAXWEKzPymU3FRSJO8EkrNvHw+7DlMizhpjOLyfSNKfxbRkbs/3DYUd7mg5Y/a2z+EMDL975mNxkd7PFwjnDF0MFXnfuVYUqCLZMNoUyVRE8sZUuVgrkVWeME9Wqqh/69v4W//V5ImjqxCFXnI73ATrot0I1hRDPM339TW/EVMakxBjyutYW5/W7bWCu1nEu7T3SZrQZLrVNrp2FHL9cy4Dl9iwyL0Jhp72o9NiaKjRUZqM9OGz5dGRZ3ALmPddqLJP6PUAPaLRPl14ef09ErXmQFn27RNT2zj3IJK5NF'
    # [[[end]]]

Command to launch a container and run soft-serve:

    incus launch images:debian/12 c1 \
    && incus exec c1 -- sh -c "until systemctl is-system-running >/dev/null 2>&1 ; do : ; done" \
    && incus exec c1 -- apt-get update \
    && incus exec c1 -- apt-get upgrade \
    && incus exec c1 -- apt-get install --yes ca-certificates \
    && incus file push charm.gpg c1/etc/apt/keyrings/charm.gpg \
    && incus file push charm.sources c1/etc/apt/sources.list.d/charm.sources \
    && incus exec c1 -- apt-get update \
    && incus exec c1 -- apt-get install --yes soft-serve \
    && incus file push soft-serve.conf c1/etc/soft-serve.conf \
    && incus exec c1 -- systemctl enable --now soft-serve.service

<!--
ssh-keygen -R '[c1.incus]:23231'
-->

Command to display user information:

    ssh -p 23231 c1.incus info

Expected output:

    Username: admin
    Admin: true
    Public keys:
      ssh-rsa AAAAB3NzaC1yc2EAAAADAQABAAABAQC2ey56D7MlKkZXZZPu6vY1Y/f5KM8vQ8gghiWCbQlUkLlJAXWEKzPymU3FRSJO8EkrNvHw+7DlMizhpjOLyfSNKfxbRkbs/3DYUd7mg5Y/a2z+EMDL975mNxkd7PFwjnDF0MFXnfuVYUqCLZMNoUyVRE8sZUuVgrkVWeME9Wqqh/69v4W//V5ImjqxCFXnI73ATrot0I1hRDPM339TW/EVMakxBjyutYW5/W7bWCu1nEu7T3SZrQZLrVNrp2FHL9cy4Dl9iwyL0Jhp72o9NiaKjRUZqM9OGz5dGRZ3ALmPddqLJP6PUAPaLRPl14ef09ErXmQFn27RNT2zj3IJK5NF

Commands to import an example repository:

    ssh -p 23231 c1.incus repository import dotfiles https://github.com/maxwell-k/dotfiles

Command to connect interactively:

    ssh -p 23231 c1.incus

### Decisions

#### Decided to use https for the apt repository

HTTP is sometimes preferred for apt package distribution so that package data
can be cached. For this repository HTTP redirects to HTTPS; so it is necessary
to use HTTPS. Using HTTPS here means that an extra step installing the
`ca-certificates` package is required.

#### Keyring is stored in ‘/etc/apt/keyrings’

> The recommended locations for keyrings are /usr/share/keyrings for keyrings
> managed by packages, and /etc/apt/keyrings for keyrings managed by the system
> operator.

-- <https://manpages.debian.org/unstable/apt/sources.list.5.en.html>

[Cog]: https://cog.readthedocs.io/en/latest/
[soft-serve]: https://github.com/charmbracelet/soft-serve
[Incus]: https://linuxcontainers.org/incus/

### References

After writing most of this post I found a [blog post] from an engineer at the
company behind soft serve; it covers similar material to this post.

[blog post]: https://charm.sh/blog/self-hosted-soft-serve/

<!-- vim: set filetype=markdown.htmlCommentNoSpell : -->
