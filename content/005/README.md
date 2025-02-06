---
title: Exploring rate limiting with NGINX
date: 2025-02-06T00:00:00.000Z
category: Computers
---


<!-- toc -->

- [A system container](#a-system-container)
- [Load testing software](#load-testing-software)
- [Demonstrate the default 503 HTTP response status code](#demonstrate-the-default-503-http-response-status-code)
- [Configure and demonstrate another HTTP response status code](#configure-and-demonstrate-another-http-response-status-code)

<!-- tocstop -->

**Why?** To better understand rate limiting in NGINX; working through this 2017
blog post: <https://blog.nginx.org/blog/rate-limiting-nginx>.

**What?** Set up an Ubuntu 20.04 LTS (Focal Fossa) container running NGINX. Load
test using the [artillery](https://www.artillery.io/) command-line-interface.

**Prerequisites:**

1. [Incus] installed and configured, with a default profile that includes
   networking and storage.
2. Local networking [configured] to integrate Incus and `resolved`.

[Incus]: https://linuxcontainers.org/incus/
[configured]:
  https://linuxcontainers.org/incus/docs/main/howto/network_bridge_resolved/

### A system container

In brief the following steps will use Incus and <https://cloud-init.io/> to:

1. Start a container from an Ubuntu 22.04 Focal Fossa image
2. Update the local package metadata and upgrade all packages
3. Install NGINX
4. Serve an HTML page containing "Hello world"
5. Rate limit requests to one per second

Contents of `config.yaml`:

<!-- embedme config.yaml -->

```yaml
config:
  user.vendor-data: |
    #cloud-config
    package_update: true
    package_upgrade: true
    packages: [nginx]
    write_files:
      - content: |
          limit_req_zone $binary_remote_addr zone=mylimit:10m rate=1r/s;

          server {
              listen 80;
              listen [::]:80;

              server_name c1.incus;

              root /var/www/c1.incus;
              index index.html;

              location / {
                  try_files $uri $uri/ =404;
                  limit_req zone=mylimit;
              }
          }
        path: /etc/nginx/conf.d/c1.conf
      - content: |
          <!doctype html>
          <html lang="en-US">
            <head>
              <meta charset="utf-8" />
              <title>Hello world</title>
            </head>
            <body>
              <p>Hello world</p>
            </body>
          </html>
        path: /var/www/c1.incus/index.html
```

Command to launch an Incus container called `c1` using the above configuration:

```sh
incus launch images:ubuntu/focal/cloud c1 < config.yaml
```

### Load testing software

The latest version of [artillery](https://github.com/artilleryio/artillery) —
`artillery@2.0.22` — requires a specific version of Node: `>= 22.13.0`. This can
be installed using [Fast Node Manager](https://github.com/Schniz/fnm).

<!--
fnm list-remote
-->

Commands to install the latest artillery:

    fnm install v22.13.1 \
    && fnm exec --using=v22.13.1 npm install artillery@2.0.22

### Demonstrate the default 503 HTTP response status code

Contents of `artillery.yaml`:

<!-- embedme artillery.yaml -->

```yaml
config:
  target: http://c1.incus
  phases:
    - duration: 8
      arrivalRate: 3
scenarios:
  - flow:
      - get:
          url: /
```

Command to run the test:

    fnm exec --using=v22.13.1 node_modules/.bin/artillery run artillery.yaml

Partial output:

    ✂
    http.codes.200: ................................................................ 8
    http.codes.503: ................................................................ 16
    http.downloaded_bytes: ......................................................... 2884
    http.request_rate: ............................................................. 3/sec
    http.requests: ................................................................. 24
    ✂

The test ran for 8 seconds and sent 3 requests per second for a total of 24
requests. 8 responses had the 200 HTTP response status code and 16 had the 503
response status code.

### Configure and demonstrate another HTTP response status code

<!--
Command to make the below change:

    incus file pull c1/etc/nginx/conf.d/c1.conf c1.conf.0 \
    && incus file push c1.conf.1 c1/etc/nginx/conf.d/c1.conf

Command to recreate the diff:

    diff --label c1.conf --label c1.conf -u c1.conf.0 c1.conf.1

-->

Add another directive to the location block:

```diff
--- c1.conf
+++ c1.conf
@@ -12,5 +12,6 @@
     location / {
         try_files $uri $uri/ =404;
         limit_req zone=mylimit;
+        limit_req_status 429;
     }
 }
```

Command to reload the NGINX configuration:

    incus exec c1 -- systemctl reload nginx

Command to re-run the test with artillery:

    fnm exec --using=v22.13.1 node_modules/.bin/artillery run artillery.yaml

Partial output:

    ✂
    http.codes.200: ................................................................ 8
    http.codes.429: ................................................................ 16
    ✂

The HTTP response status codes changed from 503 to 429.

<!-- vim: set filetype=markdown.embedme.htmlCommentNoSpell.markdown-toc : -->

