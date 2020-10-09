# SCMLogParserV2 - Status: unstable/experimental!

Generates visualisation data from git repository logs and repository file list. It supports the following metrics per file:

| Metric                 | Description                                                                           |
| ---------------------- | ------------------------------------------------------------------------------------- |
| `age_in_weeks`         | age of the file in weeks                                                              |
| `number_of_commits`    | total number of commits                                                               |
| `highly_coupled_files` | Number of highly coupled files (>=35% of times modified the same time) with this file |
| `median_coupled_files` | Median of number of other files that where commited with this file                    |
| `number_of_renames`    | total number of renames                                                               |
| `weeks_with_commits`   | weeks with commits                                                                    |
| `number_of_authors`    | number of authors with commits                                                        |
| `code_churn`           | code churn, i.e. number of additions plus deletions to file                           |

Additionally, the following Edge Metrics are calculated:

| Metric              | Description                                               |
| ------------------- | --------------------------------------------------------- |
| `temporal_coupling` | The degree of temporal coupling between two files (>=35%) |

The names of authors are saved when the --add-author flag is set.

## Usage

### Creating the repository log for metric generation

| SCM | Log format                    | Command for log creation                              | tracks renames | ignores deleted files | supports code churn |
| --- | ----------------------------- | ----------------------------------------------------- | -------------- | --------------------- | ------------------- |
| git | GIT_LOG_NUMSTAT_RAW_REVERSED  | `git log --numstat --raw --topo-order --reverse -m`   | yes            | yes                   | yes                 |

You can also use the bash script anongit which generates an anonymous git log with log format GIT_LOG for usage with CodeCharta.

### Creating the git files list of the repository for metric generation
> `git ls-files > file-name-list.txt`

### Executing the SCMLogParser

See `ccsh -h` for help. Standard usage:

> `ccsh scmlogparserv2 <log_file> -n <file-name-list>`

The result is written as JSON to standard out or into an output file (if specified by `-o` option).

If a project is piped into the SCMLogParser, the results and the piped project are merged.
The resulting project has the project name specified for the SCMLogParser.

### Example using Git

-   `cd <my_git_project>`
-   `git log --numstat --raw --topo-order --reverse -m > git.log` (or `anongit > git.log`)
-   `git ls-files > file-name-list.txt`
-   `./ccsh scmlogparserv2 git.log -o output.cc.json -n file-name-list.txt`
-   load `output.cc.json` in visualization
