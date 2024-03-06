---
permalink: /docs/sourcemonitorimporter
title: "SourceMonitor Importer"
---

Generates visualisation data from [SourceMonitor](http://www.campwoodsw.com/sourcemonitor.html) through its CSV export functionality.

## Parameter and Usage

| Parameters                      | description                                                       |
| ------------------------------- | ----------------------------------------------------------------- |
| `FILE`                          | sourcemonitor csv files                                           |
| `-h, --help`                    | displays help                                                     |
| `-o, --outputFile=<outputFile>` | output File (or empty for stdout)                                 |
| `-nc, --not-compressed`         | uncompresses outputfile to json format, if format of File is gzip |

## Metrics

| Metric                            | Description                                                                                                                       |
| --------------------------------- | --------------------------------------------------------------------------------------------------------------------------------- |
| `loc`                             | Lines of code including empty lines and comments                                                                                  |
| `rloc`                            | Number of physical lines that contain at least one character which is neither a whitespace nor a tabulation nor part of a comment |
| `classes`                         | Number of classes                                                                                                                 |
| `functions_per_class`             | Number of functions per class                                                                                                     |
| `average_statements_per_function` | Average number of statements per method                                                                                           |
| `max_function_mcc`                | Maximum cyclic complexity based on paths through a function by McCabe                                                             |
| `max_block_depth`                 | Maximum nested block depth found                                                                                                  |
| `average_block_depth`             | Average nested block depth found                                                                                                  |
| `average_function_mcc`            | Average cyclic complexity of functions                                                                                            |
| `sm_percent_branch_statements`    | Percentage of branch statements                                                                                                   |
| `sm_method_call_statements`       | Number of method call statements                                                                                                  |
| `sm_percent_lines_with_comments`  | Percentage of code lines that contain comments                                                                                    |

### CSV Import for SourceMonitor

If you have analyzed your projectBuilder with SourceMonitor and exported the metric data (for classes only) to a csv-file, you may call the command

```
    ccsh sourcemonitorimport [-nc] [-o=<outputFile>] FILE
```

If the output file is omitted it prints the visualisation data to stdout.
Otherwise, it will export to a .gz file.

> Note that the output file should end with .cc.json

Currently, SourceMonitorImporter does not support metrics for methods in csv files from SourceMonitor.

### Wrapper Script sourcemonImport.bat

If SourceMonitor v3.5 is installed in 'C:\Program Files (x86)\SourceMonitor' you may use the wrapper script sourcemonImport.bat to generate and import metrics from SourceMonitor in one step:

```
sourcemonImport.bat <projectBuilder name> <source code path> <language>
```

If SourceMonitor is installed in a different directory the script must be changed accordingly.

### General CSV Import

You may use the [CSVImporter]({{site.baseurl}}{% link _docs/04-07-csvimporter.md %}) to import general CSV files.

### Example

An explicit example with the [Open Office Code](https://github.com/apache/openoffice), can be found [here]({{site.baseurl}}{% link _posts/how-to/2019-06-14-generate_with_sourcemonitor.md %})
