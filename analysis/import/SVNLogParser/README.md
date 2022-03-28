# SVNLogParser

Generates visualisation data from svn repository logs. It supports the following metrics per file:

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
