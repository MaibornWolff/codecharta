# CVSLogParser

Generates visualisation data from repository (Git or SVN) logs. It supports the following metrics per file:

| Metric               | Description |
| ---                  | --- |
| `number_of_commits`  | total number of commits |
| `weeks_with_commits` | weeks with commits |
| `number_of_authors`  | number of authors with commits |

Additionally it saves the names of authors.

## Usage

### Creating the repository log for metric generation  

* Git:   `git log --name-status`
* SVN:   `svn log --verbose`

The generated logs must be in UTF-8 encoding.

### Executing the SCMLogParser

> `ccsh scmlogparser <log file> [-git|-svn] [<output file>]`

The result is written as JSON to standard out or into the specified output file.
