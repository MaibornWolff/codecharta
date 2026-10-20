---
title: "CSV Importer"
description: "Bring your own code metrics into CodeCharta: import any CSV file with a path column and one column per metric as a cc.json map."
---

The CSV importer turns any CSV file with a header into a cc.json map. It does not matter which tool wrote the CSV:
one column names the file, every other column with numbers becomes a metric. Use it for custom metrics that no parser
or importer delivers, such as bug counts from your issue tracker or results of an in-house tool.

## Quick start

Write a file `newmetrics.csv`:

```csv
path,bugs,review_findings
File.js,4,500
service/Service1.ts,40,20
```

Import it:

```bash
ccsh csvimport newmetrics.csv -o newmetrics.cc.json
```

`newmetrics.cc.json.gz` holds the folder `service` with `Service1.ts`, the file `File.js` next to it, and the metrics
`bugs` and `review_findings` on both files. Open it in the [Web Studio](/docs/visualization/web-studio) or merge it
with another map.

## Options

| Option                                | Description                                                  |
| ------------------------------------- | ------------------------------------------------------------ |
| `FILE...`                             | one or more CSV files, each with a header                    |
| `--path-column-name=<pathColumnName>` | name of the column that holds the file path (default `path`) |
| `--path-separator=<pathSeparator>`    | separator between folders in the path (default `/`)          |
| `-d, --delimiter=<csvDelimiter>`      | column delimiter (default `,`)                               |
| `-o, --output-file=<outputFile>`      | output file; prints to stdout when omitted                   |
| `-nc, --not-compressed`               | write plain JSON instead of a gzip file                      |
| `-h, --help`                          | show the help and exit                                       |

```text
Usage: ccsh csvimport [-h] [-nc] [-d=<csvDelimiter>] [-o=<outputFile>]
                      [--path-column-name=<pathColumnName>]
                      [--path-separator=<pathSeparator>] FILE...
```

## How the CSV is read

- The first line is the header.
- The column named like `--path-column-name` (case does not matter) holds the file path. Without such a column, the
  first column with a name is used.
- The path builds the folder structure: `service/Service1.ts` becomes the file `Service1.ts` in the folder `service`.
  Every row is a file.
- Every other column becomes a metric named after its header. A cell counts only when it holds a non-negative number,
  such as `40`, `3.5` or `3,5`. Text and empty cells are left out.
- Columns without a name, and columns whose name repeats an earlier one, are ignored with a warning.

With several CSV files, all rows go into one map. Rows with the same path end up on the same file, so you can
combine metrics from different sources in one run:

```bash
ccsh csvimport size.csv bugs.csv -o combined.cc.json
```

## Output

The metrics land in the metrics lens of the cc.json file, keyed by the node id of each file (excerpt):

```json
"attributes": {
  "12613ba8c758725d": { "bugs": 4.0, "review_findings": 500.0 },
  "0a12c853600c5fdc": { "bugs": 40.0, "review_findings": 20.0 }
}
```

## Related

- [CSV Exporter](/docs/exporter/csv): the way back, from cc.json to CSV
- [SourceMonitor Importer](/docs/importer/sourcemonitor): CSV exports of SourceMonitor with their metric names mapped
- [Merge Filter](/docs/filter/merge-filter): combine the imported metrics with other maps
