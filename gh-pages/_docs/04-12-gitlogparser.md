---
permalink: /docs/git-log-parser
title: "Git Log Parser"
---

**Category**: Parser (takes in git-log file and generates cc.json)

This parser generates visualisation data from git repository logs and repository file list.
It specializes in tracking file changes across different file-versions on different feature-branches and then the merged main. Furthermore, special care is taken not to display non-existent files that might show up in normal Git histories due to renaming actions on feature branches. It is to note, that file deletions that get reverted later on are ignored by this parser.

## Supported Metrics

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

Additionally, the following Edge Metrics are calculated:

| Metric              | Description                                               |
| ------------------- | --------------------------------------------------------- |
| `temporal_coupling` | The degree of temporal coupling between two files (>=35%) |

The names of authors are saved when the --add-author flag is set.

## Usage and Parameters

As this parser can generate metrics based on a given git-log file or given a git repository (where the git-log is then generated on the fly), some parameters are only available in the log-scan mode or the repo-scan mode.

| Parameters                          | Description                                                                         |
| ----------------------------------- | ----------------------------------------------------------------------------------- |
| `log-scan`                          | use log-scan mode - generates cc.json from a given git-log file                     |
| `repo-scan`                         | use repo-scan mode - generates cc.json from an automatically generated git-log file |
| `--add-author`                      | add an array of authors to every file                                               |
| `--git-log=FILE`                    | git-log file to parse (only available for log-scan mode!)                           |
| `-h, --help`                        | displays help and exits                                                             |
| `-nc, --not-compressed`             | save uncompressed output File                                                       |
| `-o, --outputFile=<outputFilePath>` | output File (or empty for stdout)                                                   |
| `--repo-files=FILE `                | list of all file names in current git project (only available for log-scan mode!)   |
| `--repo-path=DIRECTORY`             | root directory of the repository (only available for repo-scan mode!)               |
| `--silent`                          | suppress command line output during process                                         |

```
Usage:
ccsh gitlogparser [-h] [COMMAND]

Usage for log-scan mode:
ccsh gitlogparser log-scan [-h] [--add-author] [-nc] [--silent]
                                --git-log=FILE [-o=<outputFilePath>]
                                --repo-files=FILE

Usage for repo-scan mode:
ccsh gitlogparser repo-scan [-h] [--add-author] [-nc] [--silent]
                            [-o=<outputFilePath>] [--repo-path=DIRECTORY]

```

## Scan a local git repository on your machine

### Creating required files on the fly | repo-scan

See `ccsh gitlogparser repo-scan -h` for help. Standard usage:

```
ccsh gitlogparser repo-scan --repo-path <path>
```

With the sub command `repo-scan` you can parse a local git repository on your disk. During scanning a git log of the
repository in the current working directory (or from the directory specified by repo-path) is created in your
temp-Folder and parsed automatically. Furthermore, the parser creates another temporary file-name-list of files that are
tracked by git automatically which is needed for the parsing process.

The result is written as JSON to standard out or into an output file (if specified by `-o` option).

If a project is piped into the GitLogParser, the results and the piped project are merged.
The resulting project has the project name specified for the GitLogParser.

#### Executing the repo-scan subcommand

- `ccsh gitlogparser repo-scan --repo-path <path_to_my_git_project> -o output.cc.json.gz`
- load `output.cc.json.gz` in visualization

### Manual creation of required files | log-scan

See `ccsh gitlogparser log-scan -h` for help. Standard usage:

```
ccsh gitlogparser log-scan --git-log <path> --repo-files <path>
```

With the sub command `log-scan`, an existing git log and file name list are used for parsing.

The result is written as JSON to standard out or into an output file (if specified by `-o` option).

If a project is piped into the GitLogParser, the results and the piped project are merged.
The resulting project has the project name specified for the GitLogParser.

#### Creating the repository log for metric generation

| SCM | Log format                   | Command for log creation                            | tracks renames | ignores deleted files | supports code churn |
| --- | ---------------------------- | --------------------------------------------------- | -------------- | --------------------- | ------------------- |
| git | GIT_LOG_NUMSTAT_RAW_REVERSED | `git log --numstat --raw --topo-order --reverse -m` | yes            | yes                   | yes                 |

You can also use the bash
script [anongit](https://github.com/MaibornWolff/codecharta/blob/main/analysis/import/GitLogParser/src/main/dist/anongit)
which generates a git log with anonymized authors for usage with CodeCharta.

#### Creating the git files list of the repository for metric generation

```
git ls-files > file-name-list.txt
```

Please make sure to execute this command in the root folder of your repository.

#### Executing the log-scan subcommand

```
cd <my_git_project>
git log --numstat --raw --topo-order --reverse -m > git.log (or anongit > git.log)
git ls-files > file-name-list.txt
ccsh gitlogparser log-scan --git-log git.log --repo-files file-name-list.txt -o output.cc.json.gz
```

load `output.cc.json.gz` in visualization
