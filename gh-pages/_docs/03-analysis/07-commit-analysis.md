---
permalink: /docs/analysis/commit-analysis
title: "Commit-Based Analysis"

toc: true
toc_sticky: true
toc_label: "Jump to Section"
---

The `--commit` option enables analyzing a codebase at any historical point in time without manually checking out that commit. It creates a temporary git worktree, runs the analysis against it, and cleans up automatically.

This option is available on the [UnifiedParser]({{site.docs_parser}}/unified), [RawTextParser]({{site.docs_parser}}/raw-text), and [GitLogParser]({{site.docs_parser}}/git-log) (repo-scan subcommand).

## How It Works

When `--commit` is specified, the parser:

1. **Resolves the commit reference** to a full SHA hash (supports hashes, tags, branches, and date expressions)
2. **Creates a temporary git worktree** in the system temp directory using `git worktree add --detach`
3. **Runs the analysis** against the worktree instead of the working directory
4. **Prefixes the output filename** with the short commit hash (e.g. `abc1234.output.cc.json`)
5. **Removes the worktree** after analysis completes

No branches are created or modified. The original repository is never changed.

## Usage

```bash
# Analyze at a specific commit hash
ccsh unifiedparser . --commit abc1234 -o output.cc.json

# Analyze at a tag
ccsh unifiedparser . --commit v2.0.0 -o output.cc.json

# Analyze at a relative ref
ccsh unifiedparser . --commit HEAD~10 -o output.cc.json

# Analyze at a date
ccsh unifiedparser . --commit "6 months ago" -o output.cc.json

# RawTextParser
ccsh rawtextparser . --commit v1.0.0 -o output.cc.json

# GitLogParser repo-scan
ccsh gitlogparser repo-scan --repo-path . --commit v1.0.0 -o output.cc.json
```

## Supported Commit References

Any reference that git can resolve is supported:

| Reference Type | Example | Description |
|----------------|---------|-------------|
| Full hash | `--commit 6a7720314d71d909...` | Exact commit |
| Short hash | `--commit abc1234` | Abbreviated commit hash |
| Tag | `--commit v2.0.0` | Git tag |
| Branch name | `--commit main` | Tip of a branch |
| Relative ref | `--commit HEAD~5` | 5 commits before HEAD |
| Parent ref | `--commit HEAD^` | Parent of HEAD |
| Date expression | `--commit "2 years ago"` | Latest commit before that date |
| ISO date | `--commit "2024-01-15"` | Latest commit before that date |

Date expressions use `git log --before` internally and find the most recent commit before the given date.

## Output Naming

When both `--commit` and `-o` are specified, the output file is automatically prefixed with the 7-character short hash:

```bash
ccsh unifiedparser . --commit v2.0.0 -o output.cc.json
# produces: abc1234.output.cc.json
```

When `-o` is not specified, output goes to stdout as usual (no prefix).

## Comparing Commits

Combine `--commit` with the [Merge Filter]({{site.docs_filter}}/merge-filter) to compare two points in time:

```bash
# Analyze an old version
ccsh unifiedparser . --commit v1.0.0 -o old.cc.json

# Analyze the current version
ccsh unifiedparser . -o current.cc.json

# Load both in the visualization to use delta mode
```

## Restrictions

- `--commit` and `--local-changes` are **mutually exclusive** — specifying both will produce an error
- The project directory must be inside a **git repository**
- Git must be available on the system PATH
- The commit reference must point to an existing commit in the repository history

## Cleanup

The temporary worktree is automatically removed after analysis. If the process is interrupted, a JVM shutdown hook attempts cleanup. In rare cases where automatic cleanup fails, a warning is printed with the path for manual removal. You can also list and clean up orphaned worktrees with:

```bash
git worktree list
git worktree prune
```
