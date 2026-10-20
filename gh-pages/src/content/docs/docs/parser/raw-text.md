---
title: "Raw Text Parser"
description: "Measure lines and indentation depth of any text file with ccsh rawtextparser, whatever the programming language, to spot deeply nested code."
sidebar:
  label: "Raw Text"
---

The Raw Text Parser measures every text file by its lines and their indentation, whatever the language. Deep
indentation is a quick, language-independent hint at nested, hard-to-read code, so use this parser for languages the
[Unified Parser](/docs/parser/unified) does not support, or next to it.

## Quick start

```bash
ccsh rawtextparser path/to/project -o project.cc.json
```

This writes `project.cc.json.gz`.

## Options

| Parameter                                 | Description                                                                                                                                                                                          |
|-------------------------------------------|------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| `FILE or FOLDER`                          | file/project to parse. To merge the result with an existing project piped into STDIN, pass a '-' as an additional argument                                                                    |
| `-bf, --base-file=<baseFile>`             | base cc.json file with checksums to skip unchanged files during analysis                                                                                                                             |
| `--bypass-gitignore`                      | disable automatic .gitignore-based file exclusion (uses regex-based exclusion of common build folders)                                                                                               |
| `-e, --exclude=<exclude>`                 | comma-separated list of regex patterns to exclude files/folders (applied in addition to .gitignore patterns)                                                                                         |
| `-fe, --file-extensions=<fileExtensions>` | comma-separated list of file-extensions to parse only those files (default: any)                                                                                                                     |
| `--commit=<ref>`                          | analyze the codebase at a specific git commit, tag, branch, or date expression (creates a temporary worktree). Cannot be combined with `--local-changes`. See [Commit-Based Analysis](/docs/analysis/commit-analysis) |
| `-h, --help`                              | displays this help and exits                                                                                                                                                                         |
| `-ibf, --include-build-folders`           | include build folders (out, build, dist and target) and common resource folders (e.g. resources, node_modules or files/folders starting with '.')                                                    |
| `--local-changes`                         | only analyze files that differ from the remote tracking branch (uncommitted, staged, unstaged, untracked). See [Local Changes](/docs/analysis/local-changes)                                        |
| `-m, --metrics=metrics`                   | comma-separated list of metrics to be computed: `IndentationLevel`, `LinesOfCode` (all available metrics are computed if not specified)                                                             |
| `--max-indentation-level=<maxIndentLvl>`  | maximum Indentation Level (default 10)                                                                                                                                                               |
| `-nc, --not-compressed`                   | save uncompressed output File                                                                                                                                                                        |
| `-o, --output-file=<outputFile>`          | output File (or empty for stdout)                                                                                                                                                                    |
| `--tab-width=<tabWidth>`                  | tab width used (estimated if not provided)                                                                                                                                                           |
| `--verbose`                               | verbose mode                                                                                                                                                                                         |
| `--without-default-excludes`              | ("DEPRECATION WARNING: this flag will soon be disabled and replaced by '--include-build-folders'") include build, target, dist, resources and out folders as well as files/folders starting with '.' |

```
Usage: ccsh rawtextparser [-h] [--bypass-gitignore] [--commit=<ref>] [-ibf]
                          [--local-changes] [-nc] [--verbose]
                          [--without-default-excludes]
                          [-bf=<baseFile>]
                          [--max-indentation-level=<maxIndentLvl>]
                          [-o=<outputFile>] [--tab-width=<tabWidth>]
                          [-e=<specifiedExcludePatterns>]...
                          [-fe=<fileExtensionsToAnalyse>]... [-m=metrics]...
                          FILE or FOLDER...
```

## Metrics

| Metric                   | Description                                                                                       |
| ------------------------ | ------------------------------------------------------------------------------------------------- |
| `loc`                    | all lines of the file, blank lines included                                                       |
| `indentation_level_<n>+` | the non-blank lines indented by at least `n` levels, from `indentation_level_0+` up to the `--max-indentation-level` (default `indentation_level_10+`) |

`-m IndentationLevel` writes the indentation metrics, `-m LinesOfCode` writes `loc`. The names are case-sensitive.

A level is one tab or `--tab-width` spaces. Without `--tab-width`, the parser guesses the width per file from the
spaces it finds. A line whose indentation is no multiple of the width counts for the next level.

## Examples

```bash
ccsh rawtextparser foo.txt --max-indentation-level=6 --tab-width=4 --metrics=IndentationLevel,LinesOfCode
ccsh rawtextparser foo -o out.cc.json --exclude='.*\.html' --exclude=bar
ccsh rawtextparser foo -o out.cc.json --bypass-gitignore
```

To add the raw text metrics to another map, pipe it in and pass `-` as an extra argument:

```bash
ccsh unifiedparser foo | ccsh rawtextparser foo - -o out.cc.json
```

The merged project keeps the project name of the Raw Text Parser.

## Related

- [Unified Parser](/docs/parser/unified)
- [Analyse local changes](/docs/analysis/local-changes)
- [Analyse a past commit](/docs/analysis/commit-analysis)
