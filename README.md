<!-- vim: set filetype=markdown.htmlCommentNoSpell.cog : -->

To include a source map in the generated CSS file, set the `SOURCEMAP`
environment variable to `true`.

Command to run a development server on <http://127.0.0.1:8000> watching for
changes and source maps:

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
cog.outl("\n```\n"+completed.stdout.decode()+"```\n")
]]] -->

```
Tasks for ~/github.com/maxwell-k/2024-09-18-pybelfast-workshop/gulpfile.js
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
