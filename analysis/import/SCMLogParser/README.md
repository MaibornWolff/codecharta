# SCMLogParser

Generates visualisation data from repository (Git or SVN) logs. It supports the following metrics per file:

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

Additionally it saves the names of authors when the --add-author flag is set.

## Usage

### Creating the repository log for metric generation

| SCM | Log format          | Command for log creation               | tracks renames | ignores deleted files | supports code churn |
| --- | ------------------- | -------------------------------------- | -------------- | --------------------- | ------------------- |
| git | GIT_LOG             | `git log --name-status --topo-order`   | yes            | yes                   | no                  |
| git | GIT_LOG_NUMSTAT     | `git log --numstat --topo-order`       | yes            | no                    | yes                 |
| git | GIT_LOG_NUMSTAT_RAW | `git log --numstat --raw --topo-order` | yes            | yes                   | yes                 |
| git | GIT_LOG_RAW         | `git log --raw --topo-order`           | yes            | yes                   | no                  |
| SVN | SVN_LOG             | `svn log --verbose`                    | yes            | yes                   | no                  |

You can also use the bash script anongit which generates an anonymous git log with log format GIT_LOG_NUMSTAT_RAW for usage with CodeCharta.

### Executing the SCMLogParser

See `ccsh -h` for help. Standard usage:

> `ccsh scmlogparser <log_file> --input-format [GIT_LOG|GIT_LOG_NUMSTAT|GIT_LOG_NUMSTAT_RAW|GIT_LOG_RAW|SVN_LOG]`

The result is written as JSON to standard out or into an output file (if specified by `-o` option).

If a project is piped into the SCMLogParser, the results and the piped project are merged.
The resulting project has the project name specified for the SCMLogParser.

### Example using Git

- `cd <my_git_project>`
- `git log --numstat --raw --topo-order > git.log` (or `anongit > git.log`)
- `./ccsh scmlogparser git.log --input-format GIT_LOG_NUMSTAT_RAW -o output.cc.json`
- load `output.cc.json` in visualization

### Example using SVN

- `cd <my_svn_project>`
- `svn log --verbose > svn.log`
- `./ccsh scmlogparser svn.log --input-format SVN_LOG -o output.cc.json`
- load `output.cc.json` in visualization
