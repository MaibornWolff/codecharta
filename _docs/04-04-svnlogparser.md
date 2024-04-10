---
permalink: /docs/svn-log-parser
title: "SVN Log Parser"
---

# SVNLogParser - Status: stable/deprecated for git

The SVN-Log-Parser generates visualisation data from repository SVN logs. It supports the following metrics per file:

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
