---
permalink: /docs/svn-log-parser
title: "SVN Log Parser"
---

# SVNLogParser - Status: stable/deprecated for git

The SVN-Log-Parser generates visualisation data from repository SVN logs. It supports the following metrics per file:

| Metric                        | Description                                                                           |
| ----------------------------- | ------------------------------------------------------------------------------------- |
| `age_in_weeks`                | age of the file in weeks                                                              |
| `authors`                     | authors that have worked on a file                                                    |
| `number_of_authors`           | number of authors with commits                                                        |
| `number_of_commits`           | total number of commits                                                               |
| `number_of_renames`           | total number of renames                                                               |
| `range_of_weeks_with_commits` | average number of weeks between commits                                               |
| `successive_weeks_of_commits` | number of successive weeks in which the file was included in a commit                 |
| `weeks_with_commits`          | weeks with commits                                                                    |
| `highly_coupled_files`        | Number of highly coupled files (>=35% of times modified the same time) with this file |
| `median_coupled_files`        | Median of number of other files that where commited with this file                    |

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

### Executing the SVNLogParser

| Parameter                       | description                                                       |
| ------------------------------- | ----------------------------------------------------------------- |
| `FILE`                          | file to parse                                                     |
| `--add-author`                  | add an array of authors to every file                             |
| `--silent`                      | suppress command line output during process                       |
| `-h, --help`                    | displays help                                                     |
| `-o, --outputFile=<outputFile>` | output File (or empty for stdout)                                 |
| `-nc, --not-compressed`         | uncompresses outputfile to json format, if format of File is gzip |
| `-log, --logfile`               | gives loghelp                                                     |

Standard usage:

```
ccsh svnlogparser <log_file>
```

The result is written as JSON to standard out or into an output file (if specified by `-o` option).

If a project is piped into the [SourceCodeParser]({{site.baseurl}}{% link _docs/04-02-sourcecodeparser.md %}), the results and the piped project are merged.
The resulting project has the project name specified for the SVNLogParser.

### Example using SVN

```bash
# navigate to the project folder
- cd <my_svn_project>
# create svn log file
- svn log --verbose > svn.log
# create cc.json file
- ./ccsh svnlogparser svn.log -o output.cc.json
```

-   Then load `output.cc.json` in visualization
