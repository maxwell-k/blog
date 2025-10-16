---
title: How do I use Dnsmasq to resolve test domains?
date: 2025-10-15
category: Computers
---

<!--
Copyright 2025 Keith Maxwell
SPDX-License-Identifier: CC-BY-SA-4.0
-->

I run an Incus container with Dnsmasq and a specific ‘A’ record, for example
pointing `c1.example.keithmaxwell.uk` to 127.0.0.1 and forwarding other queries
to the [Google DNS servers].

[Google DNS servers]: https://developers.google.com/speed/public-dns/docs/using

**Why?** So that I can:

- Test self-hosted services on my local developer workstation,

- Use Incus and Linux containers for faster feedback on a developer workstation
  before I begin deploying to production hardware and

- Become more familiar with OpenWRT. OpenWRT supports a wide range of networking
  hardware and I anticipate running OpenWRT on the router for my production
  hardware.

_In practice developer workstation means laptop and production hardware means
consumer electronics like Raspberry Pis!_

An entry in [/etc/hosts](https://man7.org/linux/man-pages/man5/hosts.5.html)
would serve exactly the same purpose here; with a lot less to go wrong. In the
production environment I intend to use OpenWRT; so arguably I should use OpenWRT
in this test environment. For me [Dnsmasq] is a splendid piece of software with
a lot of other uses. For example it can be [used as an ad blocker]. Learning
about one way to deploy Dnsmasq, using OpenWRT, has potential beyond that of a
line in /etc/hosts.

[used as an ad blocker]: https://jears.at/jblog/dnsmasq_adblock.jblog
[Dnsmasq]: https://thekelleys.org.uk/dnsmasq/doc.html

This rest of this post assumes that Incus is already installed and configured,
with `resolved` [integrated].

[Incus]: https://linuxcontainers.org/incus/
[integrated]:
  https://linuxcontainers.org/incus/docs/main/howto/network_bridge_resolved/

### Launch and configure the OpenWRT container

The first step is to launch and configure the container:

- to use the Google servers for DNS,
- to open port 53 in the OpenWRT firewall and
- to serve a DNS record for `c1.example.keithmaxwell.uk`.

_Below the OpenWRT container will be called `o1`._

Command to launch `o1`:

    incus launch images:openwrt/24.10 o1 \
    && until incus exec o1 logread 2>/dev/null \
        | grep --quiet -- '- init complete -' ; do printf . && sleep 1; done \
    && incus exec o1 -- uci set network.wan.peerdns=0 \
    && incus exec o1 -- uci set network.wan.dns="8.8.8.8 8.8.4.4" \
    && incus exec o1 -- uci set network.wan6.peerdns=0 \
    && incus exec o1 -- uci set network.wan6.dns="2001:4860:4860::8888 2001:4860:4860::8844" \
    && incus exec o1 -- uci commit network \
    && incus exec o1 -- service network reload \
    && incus exec o1 -- uci add firewall rule \
    && incus exec o1 -- uci set 'firewall.@rule[-1].name=Allow-dnsmasq' \
    && incus exec o1 -- uci set 'firewall.@rule[-1].src=wan' \
    && incus exec o1 -- uci set 'firewall.@rule[-1].dest_port=53' \
    && incus exec o1 -- uci set 'firewall.@rule[-1].proto=udp' \
    && incus exec o1 -- uci set 'firewall.@rule[-1].target=ACCEPT' \
    && incus exec o1 -- uci commit firewall \
    && incus exec o1 -- service firewall reload \
    && incus exec o1 -- uci add_list \
        'dhcp.@dnsmasq[0].address=/c1.example.keithmaxwell.uk/127.0.0.1' \
    && incus exec o1 -- uci commit dhcp \
    && incus exec o1 -- service dnsmasq reload

### Use the OpenWRT container for DNS on the host

Commands to point `systemd-resolved` on the host to `o1`:

    printf 'DNS=%s\n' "$(dig o1.incus +short)" \
    | sudo tee -a /etc/systemd/resolved.conf \
    && sudo systemctl restart systemd-resolved

### Check a few DNS queries

Commands to query DNS:

    dig c1.example.keithmaxwell.uk +short \
    && dig dns.google.com +short

Expected output:

    127.0.0.1
    8.8.8.8
    8.8.4.4

### Clean up

Commands to manually remove `o1` from the hosts DNS configuration:

    sudo $EDITOR /etc/systemd/resolved.conf \
    && sudo systemctl restart systemd-resolved

Commands to clean up:

    incus stop o1 \
    && incus delete o1

### Troubleshooting

Commands to turn on logging of DNS queries in the container:

    incus exec o1 -- uci set dhcp.@dnsmasq\[0\].logqueries=1 \
    && incus exec o1 -- uci commit dhcp \
    && incus exec o1 -- service dnsmasq restart

Command to follow the above logs from the container:

    incus exec o1 -- logread -e dnsmasq -f

_Please note that there are multiple layers of caching in the Domain Name
System. Only queries that are passed to `o1` will appear in these logs._

Command to run a DNS query skipping the local `systemd-resolved` cache:

    resolvectl query --cache=no c1.example.keithmaxwell.uk

### Explaining the configuration files

The `dnsmasq` service uses the DNS servers configured for the WAN via
`/tmp/resolv.conf.d/resolv.conf.auto`.

Command to start a shell inside `o1`:

    incus exec o1 sh

Commands to display the `dnsmasq` command line from the above shell:

    tr '\0' ' ' </proc/$(cat /var/run/dnsmasq/dnsmasq.*.pid)/cmdline && echo

Example output:

    /usr/sbin/dnsmasq -C /var/etc/dnsmasq.conf.cfg01411c -k -x /var/run/dnsmasq/dnsmasq.cfg01411c.pid

Command to view the resolve-file option in the configuration file from the above
shell:

    grep resolv-file= /var/etc/dnsmasq.conf.cfg??????

Expected output:

    resolv-file=/tmp/resolv.conf.d/resolv.conf.auto

Contents of `/tmp/resolv.conf.d/resolv.conf.auto` inside `o1`:

    # Interface wan
    nameserver 8.8.8.8
    nameserver 8.8.4.4
    # Interface wan6
    nameserver 2001:4860:4860::8888
    nameserver 2001:4860:4860::8844
