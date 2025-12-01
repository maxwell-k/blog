---
title: How to avoid setting a hostname using Cloud-init base configuration
date: 2025-12-01
---

<!--
Copyright 2025 Keith Maxwell
SPDX-License-Identifier: CC-BY-SA-4.0
-->

[forum post]: https://discuss.linuxcontainers.org/t/no-hostname-file-created-for-rockylinux-instance/19219/4
[Update Hostname]: https://cloudinit.readthedocs.io/en/latest/reference/modules.html#mod-cc-update-hostname
[Set Hostname]: https://cloudinit.readthedocs.io/en/latest/reference/modules.html#mod-cc-set-hostname
[base configuration]: https://docs.cloud-init.io/en/latest/explanation/configuration.html
[worked]: https://github.com/maxwell-k/dotfiles/commit/3d39010e9a4be08c061c9ec3076bf0c210195cdf
[specifying configuration]: https://docs.cloud-init.io/en/latest/explanation/configuration.html?utm_source=chatgpt.com#specifying-configuration
[Incus]: https://linuxcontainers.org/incus/

<!--

The distribution specific source code for [Fedora] inherits directly from [RHEL].

[set_hostname]: https://github.com/canonical/cloud-init/blob/25.2/cloudinit/distros/__init__.py#L390
[Fedora]:
  https://github.com/canonical/cloud-init/blob/25.2/cloudinit/distros/fedora.py
[RHEL]:
  https://github.com/canonical/cloud-init/blob/25.2/cloudinit/distros/rhel.py

-->

In resolving an error running an [Incus] container on GitHub Actions, I recently
learnt about Cloud-init [base configuration]. This post describes the error, a
solution and behaviour with user-data that I found unintuitive.

To make integration tests running on GitHub Actions more portable I often use
Incus. Recently launching an `images:fedora/43/cloud` container began to fail
with an error "Failed to set the hostname…". The Cloud-init logs didn't help
identify a root cause.

<details markdown=1>
<summary>Excerpt from /var/log/cloud-init.log</summary>

```
2025-11-30 13:14:38,815 - subp.py[DEBUG]: Running command ['hostnamectl', 'set-hostname', 'c1'] with allowed return codes [0] (shell=False, capture=True)
2025-11-30 13:14:38,820 - log_util.py[WARNING]: Failed to set the hostname to c1 (c1)
2025-11-30 13:14:38,820 - log_util.py[DEBUG]: Failed to set the hostname to c1 (c1)
Traceback (most recent call last):
  File "/usr/lib/python3.14/site-packages/cloudinit/config/cc_set_hostname.py", line 86, in handle
    cloud.distro.set_hostname(hostname, fqdn)
    ~~~~~~~~~~~~~~~~~~~~~~~~~^^^^^^^^^^^^^^^^
  File "/usr/lib/python3.14/site-packages/cloudinit/distros/__init__.py", line 392, in set_hostname
    self._write_hostname(writeable_hostname, self.hostname_conf_fn)
    ~~~~~~~~~~~~~~~~~~~~^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^
  File "/usr/lib/python3.14/site-packages/cloudinit/distros/rhel.py", line 119, in _write_hostname
    subp.subp(["hostnamectl", "set-hostname", str(hostname)])
    ~~~~~~~~~^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^
  File "/usr/lib/python3.14/site-packages/cloudinit/subp.py", line 291, in subp
    raise ProcessExecutionError(
        stdout=out, stderr=err, exit_code=rc, cmd=args
    )
cloudinit.subp.ProcessExecutionError: Unexpected error while running command.
Command: ['hostnamectl', 'set-hostname', 'c1']
Exit code: 1
Reason: -
Stdout:
Stderr: Failed to connect to system scope bus via local transport: No such file or directory
2025-11-30 13:14:38,822 - main.py[DEBUG]: Failed setting hostname in local stage. Will retry in network stage. Error: Failed to set the hostname to c1 (c1): Unexpected error while run
Command: ['hostnamectl', 'set-hostname', 'c1']
Exit code: 1
Reason: -
Stdout:
Stderr: Failed to connect to system scope bus via local transport: No such file or directory.
```

</details>

The integration tests in question did not depend upon the hostname so I disabled
the calls to `hostnamectl`. There are two related Cloud-init modules that can
call `hostnamectl`: [Set Hostname] and [Update Hostname]. Both accept a
configuration option:

> preserve_hostname: (boolean) If true, the hostname will not be changed.
> Default: false.

With `preserve_hostname: true` in the base configuration in
`/etc/cloud/cloud.cfg.d/*.cfg`, Cloud-init does not run `hostnamectl`.

Contents of `99-preserve-hostname.cfg`:

<!-- embedme 99-preserve-hostname.cfg -->

```
preserve_hostname: true
```

Command to launch a container with a custom base configuration:

    incus create images:fedora/43/cloud c1 \
    && incus file push 99-preserve-hostname.cfg c1/etc/cloud/cloud.cfg.d/ \
    && incus start c1

Command to view log excerpts <a id="view-log"></a>:

    incus exec c1 -- grep -e preserve_hostname -e hostnamectl /var/log/cloud-init.log

Output of command to view log excerpts:

```
2025-11-30 18:53:11,841 - cc_set_hostname.py[DEBUG]: Configuration option 'preserve_hostname' is set, not setting the hostname in module set_hostname
2025-11-30 18:53:12,454 - cc_set_hostname.py[DEBUG]: Configuration option 'preserve_hostname' is set, not setting the hostname in module set_hostname
2025-11-30 18:53:12,501 - cc_set_hostname.py[DEBUG]: Configuration option 'preserve_hostname' is set, not setting the hostname in module set_hostname
2025-11-30 18:53:12,502 - cc_update_hostname.py[DEBUG]: Configuration option 'preserve_hostname' is set, not updating the hostname in module update_hostname
```

This solution [worked]! A number of other potential solutions didn't. Disabling
AppArmour as suggested by a [forum post] didn't help.

Reading the Cloud-init documentation about [specifying configuration], user-data
appears to be the appropriate place for an end user like me to specify
preserve\_hostname. Unfortunately after setting preserve\_hostname
in user-data, Cloud-init still calls `hostnamectl`.

Command to launch a container with preserve\_hostname set in user-data:

```
incus launch images:fedora/43/cloud c1 <<EOF
config:
  cloud-init.user-data: |
    #cloud-config
    preserve_hostname: true
EOF
```

Output of command to view log excerpts ([above](#view-log)):

```
2025-11-30 18:59:51,377 - subp.py[DEBUG]: Running command ['hostnamectl', 'set-hostname', 'c1'] with allowed return codes [0] (shell=False, capture=True)
2025-11-30 18:59:51,447 - performance.py[DEBUG]: Running ['hostnamectl', 'set-hostname', 'c1'] took 0.070 seconds
2025-11-30 18:59:51,712 - cc_set_hostname.py[DEBUG]: Configuration option 'preserve_hostname' is set, not setting the hostname in module set_hostname
2025-11-30 18:59:51,713 - cc_update_hostname.py[DEBUG]: Configuration option 'preserve_hostname' is set, not updating the hostname in module update_hostname
```

The above log excerpts show that early in the Cloud-init run `hostnamectl` is
called. They also show that later Cloud-init recognises the preserve\_hostname
configuration option and does not set the hostname. I found this unintuitive.
Perhaps that is just an admission of the limits of my understanding of
Cloud-init.

This investigation was a reminder that Cloud-init is complex. I can also think
of many adjectives with more positive connotations for Cloud-init: powerful,
flexible, widely adopted…

<!-- vim: set filetype=markdown.htmlCommentNoSpell.dprint : -->
