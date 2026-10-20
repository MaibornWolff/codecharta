---
title: "Analyse local changes"
description: "Analyse only the files you changed since your last push with --local-changes, for fast code metrics on your work in progress."
sidebar:
  label: "Local changes"
---

`--local-changes` analyses only the files that differ from the remote tracking branch: committed but not pushed,
staged, unstaged and untracked. On a large project that gives you the metrics of your work in progress in seconds.
Deleted files are included with empty metrics, so they can show as absent in the map.

The [Unified Parser](/docs/parser/unified) and the [Raw Text Parser](/docs/parser/raw-text) support the flag. The
[Dependency Parser](/docs/parser/dependency) rejects it, because the dependency graph needs every file of the
project, and the [Domain Language Parser](/docs/parser/domain-language) accepts it without effect.
[`ccsh analyse`](/docs/analysis/analyse) takes it too and leaves those two parsers out.

## Quick start

```bash
ccsh unifiedparser . -o changes.cc.json --local-changes
ccsh rawtextparser . -o changes.cc.json --local-changes
ccsh analyse --local-changes
```

The flag combines with other options such as `--exclude`, `--file-extensions` or `--bypass-gitignore`, but not with
`--commit`.

## What it analyses

| File state                                                      | In the output              |
| --------------------------------------------------------------- | -------------------------- |
| Changed (staged, unstaged, untracked, committed but not pushed) | analysed with full metrics |
| Deleted                                                         | included with empty metrics `{}` |
| Unchanged                                                       | left out                   |

The parser finds the upstream branch with `git rev-parse --abbrev-ref @{upstream}`. Without one it stops with an
error that tells you how to set it, for example `git branch --set-upstream-to=<remote>/<branch>`.

## Combine with a full analysis

```bash
ccsh unifiedparser . -o full.cc.json                       # full analysis, run once or now and then
ccsh unifiedparser . -o changes.cc.json --local-changes    # only your changes
ccsh merge full.cc.json.gz changes.cc.json.gz -o merged.cc.json
```

Output is gzip-compressed by default, so the merge reads the `.gz` files and writes `merged.cc.json.gz`.

## Requirements

- The project folder is inside a git repository.
- `git` is on the `PATH`.

## Related

- [Analyse a past commit](/docs/analysis/commit-analysis)
- [Merge Filter](/docs/filter/merge-filter)
