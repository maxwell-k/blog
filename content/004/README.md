---
title: Configuration as code for DNS
date: 2024-11-06
---

I've wanted to move the DNS configuration for my domain into an open source
infrastructure as code solution for some time. The first notes I made on the
topic are from 2019!

I started managing `keithmaxwell.uk` in Route 53 using a web browser. Route 53
is the managed DNS service from [Amazon Web Services] (AWS). To me, two benefits
of an infrastructure as code solution see are: traceability and portability.
Portability would help with a move away from AWS to another [managed DNS
provider].

[managed DNS provider]:
  https://en.wikipedia.org/wiki/List_of_managed_DNS_providers
[Amazon Web Services]: https://aws.amazon.com/

I'm aware of [a range] of specialised tools. I have ruled out Terraform because
it isn't [open source]. Below I share some brief notes that I made about the
options:

[open source]: https://opensource.org/osd

<https://github.com/octodns/octodns>

- implemented in Python
- typical configuration is in YAML
- documented in the `README.md`
- MIT licensed
- project appears active, originally used at GitHub

<https://github.com/AnalogJ/lexicon>

- implemented in Python
- typically used as a CLI or Python API to manipulate DNS records
- some links in the [online documentation] 404
- MIT licensed
- project appears active

<https://github.com/StackExchange/dnscontrol>

- implemented in Go
- typical configuration is in a Domain Specific Language (DSL) that is similar
  to JavaScript
- [detailed documentation] including a [migration guide]
- MIT licensed
- project appears active, originated at "StackOverflow / StackExchange"

[detailed documentation]:
  https://docs.dnscontrol.org/getting-started/getting-started

<https://github.com/Netflix/denominator>

- implemented in Java
- typically used as a CLI or Java API to manipulate DNS records
- documented in the `README.md`
- Apache 2 licensed
- last commit was eight years ago

<https://github.com/pulumi/pulumi-aws>

- implemented in Go
- supports configuration in Python or JavaScript
- detailed documentation, for example [about Route 53]
- Apache 2 licensed
- project appears active

[about Route 53]: https://www.pulumi.com/registry/packages/aws/api-docs/route53/

<https://github.com/opentofu/opentofu>

- implemented in Go
- typical configuration is in a DSL, also supports JSON configuration
- detailed [documentation]
- MPL 2.0 licensed
- the project is [around] a year old and appears to be active

[around]: https://www.theregister.com/2023/09/20/terraform_fork_opentf_opentofu/
[documentation]: https://opentofu.org/docs/

All of the options above support Route 53.

Sometimes a [distinction] is made between declarative and imperative tools.
Viewed that way I'm looking for a declarative tool for this task.

I have used Pulumi for small projects and I have significant experience with the
versions of Terraform that OpenTofu was forked from. From that personal
experience I expect there will be a requirement to manage state data if adopting
Pulumi or Open Tofu.

After reviewing these options I've [decided] to start with `dnscontrol`, for
three reasons:

1. The high quality documentation especially the migration guide
2. The absence of a requirement to manage state and
3. The apparent health of the open source project.

[decided]: https://github.com/maxwell-k/dotfiles/pull/121
[migration guide]: https://docs.dnscontrol.org/getting-started/migrating
[online documentation]: https://dns-lexicon.readthedocs.io/en/latest/
[distinction]: https://news.ycombinator.com/item?id=36675564
[a range]: https://github.com/AcalephStorage/awesome-devops/issues/8

<!--
Copyright 2024 Keith Maxwell
SPDX-License-Identifier: CC-BY-SA-4.0
-->
