---
title: "Local Changes Detection"
---

The `--local-changes` flag enables incremental analysis by only parsing files that differ from the remote tracking branch. This includes uncommitted, staged, unstaged, and untracked files. Deleted files are included with empty metrics so they can be visualized as absent in the treemap.

This flag is available on the [UnifiedParser](/docs/parser/unified) and [RawTextParser](/docs/parser/raw-text).

### How It Works

When `--local-changes` is enabled, the parser:

1. **Detects the upstream branch** via `git rev-parse --abbrev-ref @{upstream}`. If no upstream tracking branch is configured, the parser aborts with an error
2. **Collects changed files** from multiple sources:
   - Committed but not yet pushed changes (compared to upstream)
   - Staged changes (`git add`)
   - Unstaged modifications
   - Untracked files
3. **Collects deleted files** separately
4. **Only analyzes changed files** with full metrics
5. **Adds deleted files** to the output with empty metrics

If no upstream tracking branch can be detected, the command fails with an error instructing you to set one (for example, `git branch --set-upstream-to=<remote>/<branch>`).

### Usage

```bash
ccsh unifiedparser <project-dir> -o output.cc.json --local-changes

ccsh rawtextparser <project-dir> -o output.cc.json --local-changes
```

The flag can be combined with other options like `--exclude`, `--file-extensions`, or `--bypass-gitignore`.

### Output Behavior

| File State | Behavior |
|------------|----------|
| Changed (staged, unstaged, untracked, committed but not pushed) | Analyzed with full metrics |
| Deleted | Included with empty metrics `{}` |
| Unchanged | Excluded from output |

### Example Workflow

Analyze only local changes and merge with a previous full analysis:

```bash
# Full analysis (run once or periodically)
ccsh unifiedparser . -o full.cc.json

# Incremental analysis of local changes only
ccsh unifiedparser . -o changes.cc.json --local-changes

# Merge both for a complete picture
ccsh merge full.cc.json changes.cc.json -o merged.cc.json
```

### Requirements

- The project directory must be inside a **git repository**
- Git must be available on the system PATH

