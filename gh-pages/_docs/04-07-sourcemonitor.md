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
