---
permalink: /docs/csv-importer
title: "CSV Importer"
---

The CSV importer generates visualisation data from CSV data with header, e.g. from [SourceMonitor](http://www.campwoodsw.com/sourcemonitor.html).

_Conventions for csv input:_

- There must be a header.
- The column with header "path", or if not present the first column with non-empty header, will be interpreted as file location and used as hierarchical information the corresponding node.
- Columns with empty or duplicate header will be ignored.

## Parameter

| Parameters                         | description                          |
| ---------------------------------- | ------------------------------------ |
| `FILE`                             | sourcemonitor csv files              |
| `--path-seperator=<pathSeperator>` | path seperator (default= '/')        |
| `-d, --delimeter=<csvDelimeter>`   | delimeter in csv file                |
| `-h, --help`                       | displays help                        |
| `-o, --outputFile=<outputFile>`    | output File (or empty for stdout)    |
| `-c`                               | compresses outputfile to gzip format |

## Usage

```
csvimport [-ch] [--path-separator=<pathSeparator>]
          [-d=<csvDelimiter>] [-o=<outputFile>] FILE
```
