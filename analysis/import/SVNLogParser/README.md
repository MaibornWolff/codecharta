# SVNLogParser

Generates visualisation data from svn repository logs. It supports the following metrics per file:

| Metric                          | Description                                                         |
| ------------------------------- | ------------------------------------------------------------------- |
| `age_in_weeks`                  | The file's age measured in weeks since creation.                    |
| `authors`                       | The authors that have worked on the file                            |
| `number_of_authors`             | The count of distinct authors who have contributed commits.         |
| `number_of_commits`             | The total commits made to the file.                                 |
| `number_of_renames`             | How many times the file has been renamed.                           |
| `range_of_weeks_with_commits`   | The span of weeks during which commits were made.                   |
| `successive_weeks_with_commits` | Consecutive weeks during which the file received commits.           |
| `weeks_with_commits`            | The number of weeks in which the file was modified.                 |
| `highly_coupled_files`          | Files often modified together with this file (35% overlap or more). |
| `median_coupled_files`          | The median number of files modified in tandem with this file.       |

Additionally the following Edge Metrics are calculated:

| Metric              | Description                                               |
| ------------------- | --------------------------------------------------------- |
| `temporal_coupling` | The degree of temporal coupling between two files (>=35%) |

The names of authors are saved when the --add-author flag is set.

## Usage

### Creating the repository log for metric generation

| SCM | Log format | Command for log creation | tracks renames | ignores deleted files | supports code churn |
| --- | ---------- | ------------------------ | -------------- | --------------------- | ------------------- |
| SVN | SVN_LOG    | `svn log --verbose`      | yes            | yes                   | no                  |

You can also use the bash script anongit which generates an anonymous git log with log format GIT_LOG_NUMSTAT_RAW for usage with CodeCharta.

### Executing the SVNLogParser

See `ccsh -h` for help. Standard usage:

> `ccsh svnlogparser <log_file>`

The result is written as JSON to standard out or into an output file (if specified by `-o` option).

If a project is piped into the SVNLogParser, the results and the piped project are merged.
The resulting project has the project name specified for the SVNLogParser.

### Example using SVN

-   `cd <my_svn_project>`
-   `svn log --verbose > svn.log`
-   `./ccsh svnlogparser svn.log -o output.cc.json`
-   load `output.cc.json` in visualization
