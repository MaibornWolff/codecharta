---
title: "SVN Log Parser"
description: "Turn the history of a Subversion repository into per-file code metrics such as commits, authors, age and temporal coupling with ccsh svnlogparser."
sidebar:
  label: "SVN Log"
---

The SVN Log Parser turns the log of a Subversion repository into metrics per file: how often it changed, how many
people changed it, how old it is and which files change together with it. Merged with code metrics, that shows you
the hotspots of the codebase.

## Quick start

```bash
cd path/to/working-copy
svn log --verbose > svn.log
ccsh svnlogparser svn.log -o history.cc.json
```

This writes `history.cc.json.gz`. Run at the root of a working copy, [`ccsh analyse`](/docs/analysis/analyse) reads
the svn log itself and merges it with the code metrics.

## Options

| Parameter                        | Description                                 |
| -------------------------------- | ------------------------------------------- |
| `FILE`                           | file to parse                               |
| `--add-author`                   | add an array of authors to every file       |
| `--silent`                       | suppress command line output during process |
| `-h, --help`                     | displays help                               |
| `-o, --output-file=<outputFile>` | output File (or empty for stdout)           |
| `-nc, --not-compressed`          | save uncompressed output file               |

```
Usage: ccsh svnlogparser [-h] [--add-author] [-nc] [--silent] [-o=<outputFile>]
                         FILE
```

## Metrics

| Metric                          | Description                                                         |
| ------------------------------- | ------------------------------------------------------------------- |
| `age_in_weeks`                  | The file's age measured in weeks since creation.                    |
| `number_of_authors`             | The count of distinct authors who have contributed commits.         |
| `number_of_commits`             | The total commits made to the file.                                 |
| `number_of_renames`             | How many times the file has been renamed.                           |
| `range_of_weeks_with_commits`   | The span of weeks during which commits were made.                   |
| `successive_weeks_with_commits` | Consecutive weeks during which the file received commits.           |
| `weeks_with_commits`            | The number of weeks in which the file was modified.                 |
| `highly_coupled_files`          | Files often modified together with this file (35% overlap or more). |
| `median_coupled_files`          | The median number of files modified in tandem with this file.       |

The parser also writes one edge metric between files:

| Metric              | Description                                               |
| ------------------- | --------------------------------------------------------- |
| `temporal_coupling` | The degree of temporal coupling between two files (>=35%) |

With `--add-author`, every file also gets the list of its authors' names (`authors`). The commit-type metrics of the
[Git Log Parser](/docs/parser/git-log), such as `feat_commits`, exist for git only.

## The log format

| SCM | Log format | Command for log creation | tracks renames | ignores deleted files | supports code churn |
| --- | ---------- | ------------------------ | -------------- | --------------------- | ------------------- |
| SVN | SVN_LOG    | `svn log --verbose`      | yes            | yes                   | no                  |

## Piped input

The parser merges a project piped into it with its result, and the merged project keeps the project name of the SVN
Log Parser:

```bash
ccsh unifiedparser . | ccsh svnlogparser svn.log -o project.cc.json
```

## Related

- [Git Log Parser](/docs/parser/git-log)
- [Analyse a project in one step](/docs/analysis/analyse)
