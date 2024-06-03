---
permalink: /docs/csv-importer
title: "CSV Importer"
---

The CSV importer generates visualisation data from CSV data with header, e.g. from [SourceMonitor](http://www.campwoodsw.com/sourcemonitor.html).

_Conventions for csv input:_

- There must be a header.
- The specified path column name in the header, or if not present the first column with non-empty header, will be interpreted as file location and used as hierarchical information the corresponding node.
- Columns with empty or duplicate header will be ignored.

## Parameter

| Parameters                          | description                                                       |
| ----------------------------------- | ----------------------------------------------------------------- |
| `FILE`                              | sourcemonitor csv files                                           |
| `--path-seperator=<pathSeperator>`  | path seperator (default= '/')                                     |
| `-d, --delimeter=<csvDelimeter>`    | delimeter in csv file                                             |
| `-h, --help`                        | displays help                                                     |
| `-o, --outputFile=<outputFile>`     | output File (or empty for stdout)                                 |
| `--pathColumnName=<pathColumnName>` | specify the path column name                                      |
| `-nc, --not-compressed`             | uncompresses outputfile to json format, if format of File is gzip |

## Usage

```
ccsh csvimport [-nc] [-d=<csvDelimiter>] [-o=<outputFile>] [--path-column-name=<pathColumnName>]
               [--path-separator=<pathSeparator>] FILE
```
