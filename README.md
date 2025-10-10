<!--
README.md
Copyright 2024 Keith Maxwell
SPDX-License-Identifier: CC0-1.0
-->

Command to setup this shell to use [Fast Node Manager] and install the required
Node packages:

    eval "$(fnm env --shell zsh)" && fnm use && npm ci

To include a source map in the generated CSS file, set the `SOURCEMAP`
environment variable to `true`.

Command to run a Pelican development server with source maps on
<http://127.0.0.1:8000> that watches for changes:

    SOURCEMAP=true npm exec gulp serve

Command to process CSS:

    npm exec gulp

Command to list tasks in `gulpfile.js`:

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
├─┬ build
│ └─┬ <series>
│   ├── js
│   ├── css
│   ├── removeOutput
│   └── pelican
├── default
└─┬ serve
  └─┬ <series>
    ├─┬ <parallel>
    │ ├── js
    │ └── css
    ├── removeOutput
    └─┬ <parallel>
      ├── watchCss
      ├── watchJs
      └── pelicanListen
```

<!-- [[[end]]] -->

[Fast Node Manager]: https://github.com/Schniz/fnm

<!-- vim: set filetype=markdown.htmlCommentNoSpell.cog : -->
