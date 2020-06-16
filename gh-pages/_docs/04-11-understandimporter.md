---
permalink: /docs/understandimporter
title: "UnderstandImporter"
---

The Understandimporter generates visualisation data from [SciTools Understand](https://scitools.com/features/) through its CSV export functionality.

## Parameter and Usage

### Parameter

| Parameter                          | description                          |
| ---------------------------------- | ------------------------------------ |
| `FILE`                             | Understand csv files                 |
| `--path-seperator=<pathSeperator>` | path seperator (default= '/')        |
| `-h, --help`                       | displays help                        |
| `-o, --outputFile=<outputFile>`    | output File (or empty for stdout)    |
| `-c`                               | compresses outputfile to gzip format |

### CSV Import for SciTools Understand

If you have analized your projectBuilder with Understand and exported the metric data to a csv-file, you may call the command

> ccsh understandimport \<path to sourcemonitor csv file>

which prints the visualisation data to stdout.

Currently, UnderstandImporter does only support metrics for files in csv files from Understand.
