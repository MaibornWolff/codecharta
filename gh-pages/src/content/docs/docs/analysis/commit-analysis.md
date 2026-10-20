---
title: "Analyse a past commit"
description: "Analyse your codebase at any commit, tag, branch or date with --commit, and compare code metrics between two points in time."
sidebar:
  label: "Commit analysis"
---

`--commit` analyses the codebase as it was at any commit, tag, branch or date, without checking it out. Analyse two
points in time and compare them in the visualization to see how the code changed. Your working copy stays as it is.

The option works with the [Unified Parser](/docs/parser/unified), [Raw Text Parser](/docs/parser/raw-text),
[Dependency Parser](/docs/parser/dependency), [Domain Language Parser](/docs/parser/domain-language) and the
`repo-scan` command of the [Git Log Parser](/docs/parser/git-log), and with [`ccsh analyse`](/docs/analysis/analyse),
which runs all of them on one worktree.

## Quick start

```bash
ccsh unifiedparser . --commit v2.0.0 -o output.cc.json      # writes <short hash>.output.cc.json.gz
```

More references:

```bash
ccsh unifiedparser . --commit abc1234 -o output.cc.json
ccsh unifiedparser . --commit HEAD~10 -o output.cc.json
ccsh unifiedparser . --commit "6 months ago" -o output.cc.json
ccsh rawtextparser . --commit v1.0.0 -o output.cc.json
ccsh gitlogparser repo-scan --repo-path . --commit v1.0.0 -o output.cc.json
ccsh analyse --commit v1.0.0                                 # writes <short hash>.<folder name>.cc.json.gz
```

## Supported references

Any reference git can resolve works:

| Reference type  | Example                        | Meaning                         |
| --------------- | ------------------------------ | ------------------------------- |
| Full hash       | `--commit 6a7720314d71d909...` | exact commit                    |
| Short hash      | `--commit abc1234`             | abbreviated commit hash         |
| Tag             | `--commit v2.0.0`              | git tag                         |
| Branch name     | `--commit main`                | tip of a branch                 |
| Relative ref    | `--commit HEAD~5`              | 5 commits before HEAD           |
| Parent ref      | `--commit HEAD^`               | parent of HEAD                  |
| Date expression | `--commit "2 years ago"`       | latest commit before that date  |
| ISO date        | `--commit "2024-01-15"`        | latest commit before that date  |

A date goes through `git log --before` and picks the most recent commit before it.

## How it works

1. The parser resolves the reference to a full commit hash.
2. It creates a temporary git worktree for that commit in the system temp folder (`git worktree add --detach`).
3. It analyses the worktree instead of your working directory.
4. It removes the worktree.

No branch is created or changed.

## Output name

With `-o`, the output name gets the abbreviated commit hash as a prefix, usually 7 characters (git uses more when it
needs them to stay unambiguous). Compression adds `.gz` as usual:

```bash
ccsh unifiedparser . --commit v2.0.0 -o output.cc.json
# writes abc1234.output.cc.json.gz
```

Without `-o`, the map goes to standard output with no prefix.

## Compare two commits

```bash
ccsh unifiedparser . --commit v1.0.0 -o old.cc.json    # writes <short hash>.old.cc.json.gz
ccsh unifiedparser . -o current.cc.json                # writes current.cc.json.gz
```

Load both files in the visualization and switch to [compare mode](/docs/visualization/user-controls/compare).

## Restrictions

- `--commit` and `--local-changes` exclude each other.
- The project folder is inside a git repository, and `git` is on the `PATH`.
- The reference points to an existing commit of the repository.

## Cleanup

The temporary worktree is removed after the analysis. If the process is interrupted, a shutdown hook tries to remove
it. If that fails, a warning prints its path. You can also list and remove orphaned worktrees yourself:

```bash
git worktree list
git worktree prune
```

## Related

- [Analyse local changes](/docs/analysis/local-changes)
- [Compare two maps](/docs/visualization/user-controls/compare)
