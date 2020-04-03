---
title: How I post to dev.to
---

# How I post to dev.to

1.  Set a shell variable to a suitable [API key](https://dev.to/settings/account):

    ```sh
    API_KEY=░░░░░░░░░░░░░░░░░░░░░░░░
    ```

2.  Either (a) create a new article or (b) choose an unpublished one to amend.

    (a) Create a new article:

    ```sh
    https POST dev.to/api/articles api-key:$API_KEY \
      article:='{"title": "hello", "body_markdown": "world"}'
    ```

    (b) List unpublished articles:

    ```sh
    https dev.to/api/articles/me/unpublished api-key:$API_KEY
    ```

    To make publishing easier, each post in this repository is a directory corresponding to that ID.

3.  Upload the article text:

    ```sh
    python3 ../article.py index.md |
    https -v PUT dev.to/api/articles/${PWD##*/} api-key:$API_KEY
    ```

    The response to this request is the only way to retrieve the article from the API before it is published.

## Checklist

- [ ] Cover image
- [ ] Four tags
- [ ] Proof read
- [ ] Set `published: true`

## References

- <https://dev.to/p/editor_guide>

<!-- vim: set ft=markdown.gfm.frontmatter : -->