---
permalink: /docs/scm-log-parser
title: "SCM Log Parser"
---

The SCM-Log-Parser generates visualisation data from repository (Git or SVN) logs. It supports the following metrics per file:

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

| SCM | Log format          | Command for log creation               | tracks renames | ignores deleted files | supports code churn |
| --- | ------------------- | -------------------------------------- | -------------- | --------------------- | ------------------- |
| git | GIT_LOG             | `git log --name-status --topo-order`   | yes            | yes                   | no                  |
| git | GIT_LOG_NUMSTAT     | `git log --numstat --topo-order`       | yes            | no                    | yes                 |
| git | GIT_LOG_NUMSTAT_RAW | `git log --numstat --raw --topo-order` | yes            | yes                   | yes                 |
| git | GIT_LOG_RAW         | `git log --raw --topo-order`           | yes            | yes                   | no                  |
| SVN | SVN_LOG             | `svn log --verbose`                    | yes            | yes                   | no                  |

You can also use the bash script anongit which generates an anonymous git log with log format GIT_LOG_NUMSTAT_RAW for usage with CodeCharta.

### Executing the SCMLogParser

| Parameter                           | description                                 |
| ----------------------------------- | ------------------------------------------- |
| `FILE`                              | file to parse                               |
| `--add-author`                      | add an array of authors to every file       |
| `--input-format=<inputFormatNames>` | input format for parsing                    |
| `--silent`                          | suppress command line output during process |
| `-h, --help`                        | displays help                               |
| `-o, --outputFile=<outputFile>`     | output File (or empty for stdout)           |
| `-c`                                | compresses outputfile to gzip format        |
| `-log, --logfile`                   | gives loghelp                               |

Standard usage:

> `ccsh scmlogparser <log_file> --input-format [GIT_LOG|GIT_LOG_NUMSTAT|GIT_LOG_NUMSTAT_RAW|GIT_LOG_RAW|SVN_LOG]`

The result is written as JSON to standard out or into an output file (if specified by `-o` option).

If a project is piped into the [SourceCodeParser]({{site.baseurl}}{% link _docs/04-02-sourcecodeparser.md %}), the results and the piped project are merged.
The resulting project has the project name specified for the SCMLogParser.

### Example using Git

```bash
# navigate to the project folder
- cd <my_git_project>
# create log file
- git log --numstat --raw --topo-order > git.log (or anongit > git.log)
# create cc.json File
- ./ccsh scmlogparser git.log --input-format GIT_LOG_NUMSTAT_RAW -o output.cc.json
```

Then load `output.cc.json` in visualization

### Example using SVN

```bash
# navigate to the project folder
- cd <my_svn_project>
# create svn log file
- svn log --verbose > svn.log
# create cc.json file
- ./ccsh scmlogparser svn.log --input-format SVN_LOG -o output.cc.json
```

-   Then load `output.cc.json` in visualization
