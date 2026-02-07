# README.md

<!--
README.md
Copyright 2024 Keith Maxwell
SPDX-License-Identifier: CC0-1.0
-->

<!-- toc -->

- [Prerequisites for local development](#prerequisites-for-local-development)
- [Local development](#local-development)
- [Environments](#environments)
  - [Production](#production)
  - [Staging](#staging)
  - [Development](#development)
- [Tests](#tests)

<!-- tocstop -->

## Prerequisites for local development

Command to setup this shell to use [Fast Node Manager] and the correct versions
of Node.js and `npm`:

    eval "$(fnm env)" && fnm use

Command to install the required packages:

    npm ci

[Fast Node Manager]: https://github.com/Schniz/fnm

## Local development

Optional command to set the `SOURCEMAPS` environment variable so that the generated CSS
and JavaScript files include source maps:

    export SOURCEMAPS=true

Command to process CSS and JavaScript, build all HTML, run all checks and exit
with code 1 on differences:

    npm test

Command to serve a preview and watch for changes:

    npm start

<details>
<summary>Build steps</summary>

Command to view build tasks

    npm exec gulp -- --tasks

Expected output:

<!--
[[[cog
from subprocess import run
completed = run(["npm", "exec", "gulp", "--", "--tasks"], capture_output=True, check=True)
lines = completed.stdout.decode().splitlines()
cog.outl()
cog.outl("```")
cog.outl("Tasks for …/gulpfile.js")
for line in lines[1:]:
    cog.outl(line)
cog.outl("```")
cog.outl()
]]] -->

```
Tasks for …/gulpfile.js
├─┬ default  Build then run all checks
│ └─┬ <series>
│   ├─┬ <parallel>
│   │ ├── js
│   │ └── css
│   ├── removeOutput
│   ├── pelican
│   └─┬ <parallel>
│     ├── djlintCheck
│     ├── djlintLint
│     ├── dprint
│     ├── purge
│     ├── renovateConfigValidator
│     ├── reuse
│     ├── stylelint
│     └── yamllint
└─┬ serve    Build, check then serve at http://127.0.0.1:8000 and watch for changes.
  └─┬ <series>
    ├─┬ <parallel>
    │ ├── js
    │ └── css
    ├── removeOutput
    ├── pelican
    ├─┬ <parallel>
    │ ├── djlintCheck
    │ ├── djlintLint
    │ ├── dprint
    │ ├── purge
    │ ├── renovateConfigValidator
    │ ├── reuse
    │ ├── stylelint
    │ └── yamllint
    └─┬ <parallel>
      ├── watchCss
      ├── watchJs
      └── pelicanListen
```

<!-- [[[end]]] -->

</details>

## Environments

### Production

The production environment uses GitHub pages. Pushing commits to the main branch
will trigger [`.github/workflows/publish.yaml`](/.github/workflows/publish.yaml). That workflow
deploys to <https://maxwell-k.github.io/blog/>.

### Staging

The staging environment uses GitHub pages and is
[public](https://maxwell-k.github.io/staging/).

Command to enable the GitHub pages environment:

    GH_PAGER= gh api -X POST /repos/maxwell-k/staging/pages -f build_type=workflow

Command to configure the staging project as a git remote:

    git remote add staging git@github.com:maxwell-k/staging.git

Command to publish the current commit to the staging environment:

    git push --force staging HEAD:main

Command to disable:

    GH_PAGER= gh api -X DELETE /repos/maxwell-k/staging/pages

Command to check the status:

    GH_PAGER= gh api /repos/maxwell-k/staging/pages

### Development

Command to run a local development server:

    npm exec gulp serve

The blog is then available on <https://127.0.0.1:8000>.

## Tests

Test for compatibility with screen sizes from `320px` to `1920px`.

<!-- vim: set filetype=markdown.htmlCommentNoSpell.markdown-toc.cog : -->
