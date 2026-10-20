---
title: "Git Log Parser"
description: "Turn your git history into per-file code metrics such as commits, authors, age and temporal coupling with ccsh gitlogparser to find hotspots."
sidebar:
  label: "Git Log"
---

The Git Log Parser turns the history of a git repository into metrics per file: how often it changed, how many
people changed it, how old it is and which files change together with it. Merged with code metrics, that shows you
the hotspots: complex files that change all the time.

The parser follows a file across renames, also on feature branches before they are merged, so renamed files show up
once, under their current name. A deletion that is reverted later is ignored.

## Quick start

```bash
ccsh gitlogparser repo-scan --repo-path path/to/repository -o history.cc.json
```

This writes `history.cc.json.gz`. [`ccsh analyse`](/docs/analysis/analyse) runs the same scan for you and merges it
with the code metrics.

## Options

The parser has two commands: `repo-scan` reads the history of a local repository itself, `log-scan` reads a git log
and a file list you created.

| Parameters                           | Description                                                                         |
| ------------------------------------ | ----------------------------------------------------------------------------------- |
| `log-scan`                           | use log-scan mode - generates cc.json from a given git-log file                     |
| `repo-scan`                          | use repo-scan mode - generates cc.json from an automatically generated git-log file |
| `--add-author`                       | add an array of authors to every file                                               |
| `--commit=<ref>`                     | analyze the repository at a specific git commit, tag, branch, or date expression (creates a temporary worktree, repo-scan only). See [Commit-Based Analysis](/docs/analysis/commit-analysis) |
| `--git-log=FILE`                     | git-log file to parse (log-scan only, required)                                     |
| `-h, --help`                         | displays help and exits                                                             |
| `-nc, --not-compressed`              | save uncompressed output File                                                       |
| `-o, --output-file=<outputFilePath>` | output File (or empty for stdout)                                                   |
| `--repo-files=FILE`                  | list of all file names in current git project (log-scan only, required)             |
| `--repo-path=DIRECTORY`              | root directory of the repository (repo-scan only; the scan fails without it)        |
| `--silent`                           | suppress command line output during process                                         |

```
Usage for log-scan mode:
ccsh gitlogparser log-scan [-h] [--add-author] [-nc] [--silent]
                                --git-log=FILE [-o=<outputFilePath>]
                                --repo-files=FILE

Usage for repo-scan mode:
ccsh gitlogparser repo-scan [-h] [--add-author] [--commit=<ref>] [-nc]
                            [--silent] [-o=<outputFilePath>]
                            --repo-path=DIRECTORY
```

## Metrics

| Metric                          | Description                                                       |
|---------------------------------|-------------------------------------------------------------------|
| `age_in_weeks`                  | The file's age measured in weeks since creation.                  |
| `number_of_authors`             | The count of distinct authors (including co-authors) who have contributed commits. |
| `number_of_commits`             | The total commits made to the file.                               |
| `number_of_renames`             | How many times the file has been renamed.                         |
| `range_of_weeks_with_commits`   | The span of weeks during which commits were made.                 |
| `successive_weeks_with_commits` | Consecutive weeks during which the file received commits.         |
| `weeks_with_commits`            | The number of weeks in which the file was modified.               |
| `highly_coupled_files`          | Files often modified together with this file (35% overlap or more). |
| `median_coupled_files`          | The median number of files modified in tandem with this file.     |
| `feat_commits`                  | Number of commits starting with 'feat' for this file.             |
| `fix_commits`                   | Number of commits starting with 'fix' for this file.              |
| `docs_commits`                  | Number of commits starting with 'docs' for this file.             |
| `style_commits`                 | Number of commits starting with 'style' for this file.            |
| `refactor_commits`              | Number of commits starting with 'refactor' for this file.         |
| `test_commits`                  | Number of commits starting with 'test' for this file.             |
| `hotfix_commits`                | Number of commits containing the word 'hotfix' for this file.     |
| `hotfix_commit_ratio`           | Ratio of hotfix commits (containing the 'hotfix' keyword) to total commits for this file. |
| `semantic_commit_ratio`         | Ratio of semantic commits (which start with feat, fix, docs, style, refactor or test) to total commits for this file. |

The parser also writes one edge metric between files:

| Metric              | Description                                               |
| ------------------- | --------------------------------------------------------- |
| `temporal_coupling` | The degree of temporal coupling between two files (>=35%) |

With `--add-author`, every file also gets the list of its authors' names.

## Scan a repository with repo-scan

`repo-scan` writes a git log and the list of tracked files of the repository at `--repo-path` into your temp folder
and parses them. Point `--repo-path` at the root of the repository.

## Parse your own log with log-scan

`log-scan` parses a git log and a file list you created, for example on another machine or with anonymized authors.
Create both in the root folder of the repository:

```bash
cd path/to/repository
git -c core.quotepath=off log --numstat --raw --topo-order --reverse -m > git.log
git -c core.quotepath=off ls-files > file-name-list.txt
ccsh gitlogparser log-scan --git-log git.log --repo-files file-name-list.txt -o history.cc.json
```

`-c core.quotepath=off` keeps file names with non-ASCII characters unquoted. Use it for both commands, so the log and
the file list spell such a name the same way.

The log has to be in this format:

| SCM | Log format                   | Command for log creation                                                  | tracks renames | ignores deleted files | supports code churn |
| --- | ---------------------------- | ------------------------------------------------------------------------- | -------------- | --------------------- | ------------------- |
| git | GIT_LOG_NUMSTAT_RAW_REVERSED | `git -c core.quotepath=off log --numstat --raw --topo-order --reverse -m` | yes            | yes                   | no                  |

To hide the authors, create the log with the
[anongit](https://github.com/MaibornWolff/codecharta/blob/main/analysis/analysers/parsers/GitLogParser/src/main/dist/anongit)
script instead (`anongit > git.log`). It replaces every author with `anon1`, `anon2` and so on, and keeps the mapping
in `hashmap.authors` in the current folder.

## Piped input

Both commands merge a project piped into them with their result, and the merged project keeps the project name of
the Git Log Parser:

```bash
ccsh unifiedparser path/to/repository | ccsh gitlogparser repo-scan --repo-path path/to/repository -o project.cc.json
```

## Related

- [SVN Log Parser](/docs/parser/svn-log)
- [Analyse a project in one step](/docs/analysis/analyse)
- [Analyse a past commit](/docs/analysis/commit-analysis)
