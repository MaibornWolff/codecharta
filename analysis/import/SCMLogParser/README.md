# CVSLogParser

Generates visualisation data from repository (Git or SVN) logs. It supports the following metrics per file:

| Metric               | Description |
| ---                  | --- |
| `number_of_commits`  | total number of commits |
| `weeks_with_commits` | weeks with commits |
| `number_of_authors`  | number of authors with commits |
| `code_churn`         | code churn, i.e. number of additions plus deletions to file (git numstat only) |

Additionally it saves the names of authors when the --add-author flag is set.

## Usage

### Creating the repository log for metric generation  

* Git:          `git log --name-status [--no-renames]`
* Git Numstat:  `git log --numstat --no-renames`
* SVN:          `svn log --verbose`

The generated logs must be in UTF-8 encoding.

### Executing the SCMLogParser

See `ccsh -h` for help. Standard usage:

> `ccsh scmlogparser <log file> --input-format [GIT_LOG|GIT_LOG_NUMSTAT|SVN_LOG]`

The result is written as JSON to standard out or into the specified output file (if specified by `-o` option).

### Example

* Install the tool
* git log --numstat --no-renames > log.txt
* ./ccsh scmlogparser log.txt --input-format GIT_LOG_NUMSTAT -o output.json
* load output.json in visualization
